import { io, Socket as SocketIOClient } from "socket.io-client";
import { create } from "zustand";

type TokenDraftStatus = "PENDING" | "PROCESSING" | "EXTRACTED" | "TOKENIZED" | "FAILED" | "APPROVED";

type TokenDraftStatusEvent = {
  tokenDraftId: string;
  status: TokenDraftStatus;
  errorMessage?: string;
};

interface EnhancedSocket extends SocketIOClient {
  _handlers?: boolean;
}

type TokenStatus = "PENDING" | "PROCESSING" | "FINALIZING" | "MINTED" | "FAILED";

type TokenStatusEvent = {
  tokenId: string;
  status: TokenStatus;
  errorMessage?: string;
};

type EventType = "tokenDraftStatusUpdate" | "tokenStatusUpdate";
type Listener = (data: any) => void;

interface RoomInfo {
  entityId: string;
  listeners: Map<EventType, Set<Listener>>;
}

interface SocketState {
  socket: EnhancedSocket | null;
  isConnected: boolean;
  rooms: Map<string, RoomInfo>;

  connect: (url: string) => Promise<EnhancedSocket | null>;
  disconnect: () => void;

  joinTokenDraftRoom: (tokenDraftId: string) => Promise<boolean>;
  leaveTokenDraftRoom: (tokenDraftId: string) => void;

  addTokenDraftStatusListener: (tokenDraftId: string, cb: Listener) => void;
  removeTokenDraftStatusListener: (tokenDraftId: string, cb: Listener) => void;

  // token status
  joinTokenRoom: (tokenId: string) => Promise<boolean>;
  leaveTokenRoom: (tokenId: string) => void;
  addTokenStatusListener: (tokenId: string, cb: (e: TokenStatusEvent) => void) => void;
  removeTokenStatusListener: (tokenId: string, cb: (e: TokenStatusEvent) => void) => void;
}

export const useSocketStore = create<SocketState>((set, get) => ({
  socket: null,
  isConnected: false,
  rooms: new Map<string, RoomInfo>(),

  connect: async (url: string) => {
    const s = get().socket;
    if (s && s.connected) return s;

    return new Promise<EnhancedSocket | null>((resolve) => {
      const socket: EnhancedSocket = io(url, { transports: ["websocket"], reconnection: false });

      const setupHandlers = () => {
        if (socket._handlers) return;

        socket.on("connect", () => set({ isConnected: true }));
        socket.on("disconnect", () => set({ isConnected: false }));

        socket.on("tokenDraftStatusUpdate", (data: TokenDraftStatusEvent) => {
          const room = get().rooms.get(data.tokenDraftId);
          if (!room) return;
          const listeners = room.listeners.get("tokenDraftStatusUpdate");
          listeners?.forEach((cb) => {
            try { cb(data); } catch {}
          });
        });

        socket.on("tokenStatusUpdate", (data: TokenStatusEvent) => {
          const room = get().rooms.get(data.tokenId);
          if (!room) return;
          const listeners = room.listeners.get("tokenStatusUpdate");
          listeners?.forEach((cb) => {
            try { (cb as (e: TokenStatusEvent) => void)(data); } catch {}
          });
        });

        socket._handlers = true;
      };

      socket.on("connect", () => {
        set({ socket, isConnected: true });
        setupHandlers();
        resolve(socket);
      });
      socket.on("connect_error", () => {
        set({ socket: null, isConnected: false });
        socket.disconnect();
        resolve(null);
      });
    });
  },

  disconnect: () => {
    const s = get().socket;
    if (!s) return;
    s.off("tokenDraftStatusUpdate");
    s.disconnect();
    set({ socket: null, isConnected: false, rooms: new Map() });
  },

  joinTokenDraftRoom: async (tokenDraftId: string) => {
    const state = get();
    if (state.rooms.has(tokenDraftId)) return true;

    const url = process.env.NEXT_PUBLIC_WEBSOCKET_URL;
    if (!url) {
      console.warn("websocket url not configured");
      return false;
    }

    const socket = await state.connect(url);
    if (!socket) return false;

    return new Promise<boolean>((resolve) => {
      const onConfirm = (data: { entityId: string; success: boolean }) => {
        if (data.entityId !== tokenDraftId) return;
        socket.off("roomJoinConfirmation", onConfirm);
        if (data.success) {
          const room: RoomInfo = {
            entityId: tokenDraftId,
            listeners: new Map([["tokenDraftStatusUpdate", new Set()]]),
          };
          set((prev) => ({ rooms: new Map(prev.rooms).set(tokenDraftId, room) }));
          resolve(true);
        } else {
          resolve(false);
        }
      };

      socket.on("roomJoinConfirmation", onConfirm);
      socket.emit("joinEntityRoom", { entityType: "tokenDraft", entityId: tokenDraftId });

      // basic timeout
      setTimeout(() => {
        socket.off("roomJoinConfirmation", onConfirm);
        resolve(!!get().rooms.get(tokenDraftId));
      }, 5000);
    });
  },

  leaveTokenDraftRoom: (tokenDraftId: string) => {
    const state = get();
    const s = state.socket;
    if (s?.connected) s.emit("leaveEntityRoom", { entityType: "tokenDraft", entityId: tokenDraftId });
    set((prev) => {
      const next = new Map(prev.rooms);
      next.delete(tokenDraftId);
      return { rooms: next };
    });
  },

  addTokenDraftStatusListener: (tokenDraftId: string, cb: Listener) => {
    const state = get();
    const room = state.rooms.get(tokenDraftId);
    if (!room) {
      state.joinTokenDraftRoom(tokenDraftId).then((ok) => {
        if (!ok) return;
        const r = get().rooms.get(tokenDraftId);
        r?.listeners.get("tokenDraftStatusUpdate")?.add(cb);
      });
      return;
    }
    room.listeners.get("tokenDraftStatusUpdate")?.add(cb);
  },

  removeTokenDraftStatusListener: (tokenDraftId: string, cb: Listener) => {
    const state = get();
    const room = state.rooms.get(tokenDraftId);
    if (!room) return;
    room.listeners.get("tokenDraftStatusUpdate")?.delete(cb);
    const hasAny = Array.from(room.listeners.values()).some((s) => s.size > 0);
    if (!hasAny) state.leaveTokenDraftRoom(tokenDraftId);
  },

  joinTokenRoom: async (tokenId: string) => {
    const state = get();
    if (state.rooms.has(tokenId)) return true;
    const url = process.env.NEXT_PUBLIC_WEBSOCKET_URL;
    if (!url) {
      console.warn("websocket url not configured");
      return false;
    }
    const socket = await state.connect(url);
    if (!socket) return false;
    return new Promise<boolean>((resolve) => {
      const onConfirm = (data: { entityId: string; success: boolean }) => {
        if (data.entityId !== tokenId) return;
        socket.off("roomJoinConfirmation", onConfirm);
        if (data.success) {
          const room: RoomInfo = {
            entityId: tokenId,
            listeners: new Map([["tokenStatusUpdate", new Set()]]),
          };
          set((prev) => ({ rooms: new Map(prev.rooms).set(tokenId, room) }));
          resolve(true);
        } else {
          resolve(false);
        }
      };
      socket.on("roomJoinConfirmation", onConfirm);
      socket.emit("joinEntityRoom", { entityType: "token", entityId: tokenId });
      setTimeout(() => {
        socket.off("roomJoinConfirmation", onConfirm);
        resolve(!!get().rooms.get(tokenId));
      }, 5000);
    });
  },

  leaveTokenRoom: (tokenId: string) => {
    const state = get();
    const s = state.socket;
    if (s?.connected) s.emit("leaveEntityRoom", { entityType: "token", entityId: tokenId });
    set((prev) => {
      const next = new Map(prev.rooms);
      next.delete(tokenId);
      return { rooms: next };
    });
  },

  addTokenStatusListener: (tokenId: string, cb: (e: TokenStatusEvent) => void) => {
    const state = get();
    const room = state.rooms.get(tokenId);
    if (!room) {
      state.joinTokenRoom(tokenId).then((ok) => {
        if (!ok) return;
        const r = get().rooms.get(tokenId);
        r?.listeners.get("tokenStatusUpdate")?.add(cb as Listener);
      });
      return;
    }
    room.listeners.get("tokenStatusUpdate")?.add(cb as Listener);
  },

  removeTokenStatusListener: (tokenId: string, cb: (e: TokenStatusEvent) => void) => {
    const state = get();
    const room = state.rooms.get(tokenId);
    if (!room) return;
    room.listeners.get("tokenStatusUpdate")?.delete(cb as Listener);
    const hasAny = Array.from(room.listeners.values()).some((s) => s.size > 0);
    if (!hasAny) state.leaveTokenRoom(tokenId);
  },
}));
