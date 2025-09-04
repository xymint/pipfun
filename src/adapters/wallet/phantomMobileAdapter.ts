import type { PhantomProvider, PublicKey, Transaction, VersionedTransaction } from "./index";
import nacl from "tweetnacl";
import bs58 from "bs58";

const DAPP_ENCRYPTION_PUBLIC_KEY_KEY = "dapp_encryption_public_key";
const DAPP_ENCRYPTION_SECRET_KEY_KEY = "dapp_encryption_secret_key";

const getOrCreateDappKeyPair = (): nacl.BoxKeyPair => {
  const publicKeyBs58 = localStorage.getItem(DAPP_ENCRYPTION_PUBLIC_KEY_KEY);
  const secretKeyBs58 = localStorage.getItem(DAPP_ENCRYPTION_SECRET_KEY_KEY);

  if (publicKeyBs58 && secretKeyBs58) {
    const publicKey = bs58.decode(publicKeyBs58);
    const secretKey = bs58.decode(secretKeyBs58);
    return { publicKey, secretKey } as nacl.BoxKeyPair;
  }

  const newKeyPair = nacl.box.keyPair();
  localStorage.setItem(DAPP_ENCRYPTION_PUBLIC_KEY_KEY, bs58.encode(newKeyPair.publicKey));
  localStorage.setItem(DAPP_ENCRYPTION_SECRET_KEY_KEY, bs58.encode(newKeyPair.secretKey));
  return newKeyPair;
};

const buildUrl = (path: string, params: URLSearchParams): string => {
  return `https://phantom.app/ul/v1/${path}?${params.toString()}`;
};

const encryptPayload = (payload: unknown, sharedSecret: Uint8Array) => {
  const nonce = nacl.randomBytes(nacl.box.nonceLength);
  const encryptedPayload = nacl.box.after(
    new TextEncoder().encode(JSON.stringify(payload)),
    nonce,
    sharedSecret
  );

  return {
    nonce: bs58.encode(nonce),
    payload: bs58.encode(encryptedPayload),
  };
};

export const phantomMobileAdapter = {
  provider(): PhantomProvider {
    const dappKeyPair = getOrCreateDappKeyPair();

    const connect = async () => {
      const redirectLink = new URL(window.location.origin + window.location.pathname);
      redirectLink.searchParams.set("phantom_action", "connect");

      const params = new URLSearchParams({
        app_url: window.location.origin,
        dapp_encryption_public_key: bs58.encode(dappKeyPair.publicKey),
        redirect_link: redirectLink.toString(),
      });
      const url = buildUrl("connect", params);
      window.location.replace(url);
      return new Promise<{ publicKey: PublicKey }>(() => {});
    };

    const disconnect = async () => {
      localStorage.removeItem("phantom_deeplink_session");
      localStorage.removeItem("phantom_deeplink_encryption_public_key");
    };

    const signMessage = async (message: Uint8Array) => {
      const session = localStorage.getItem("phantom_deeplink_session");
      const phantomPublicKeyBs58 = localStorage.getItem("phantom_deeplink_encryption_public_key");
      if (!session || !phantomPublicKeyBs58) throw new Error("phantom session not found. please connect first.");

      const sharedSecret = nacl.box.before(bs58.decode(phantomPublicKeyBs58), dappKeyPair.secretKey);
      const payload = { session, message: bs58.encode(message) };
      const encryptedPayload = encryptPayload(payload, sharedSecret);

      const redirectLink = new URL(window.location.origin + window.location.pathname);
      redirectLink.searchParams.set("phantom_action", "signMessage");

      const params = new URLSearchParams({
        app_url: window.location.origin,
        dapp_encryption_public_key: bs58.encode(dappKeyPair.publicKey),
        nonce: encryptedPayload.nonce,
        redirect_link: redirectLink.toString(),
        payload: encryptedPayload.payload,
      });

      const url = buildUrl("signMessage", params);
      window.location.replace(url);
      return new Promise<{ signature: Uint8Array }>(() => {});
    };

    const signTransaction = async (_transaction: Transaction | VersionedTransaction) => {
      throw new Error("signTransaction is not supported with phantom deeplinks. use signAndSendTransaction instead.");
    };

    const signAllTransactions = async (_transactions: (Transaction | VersionedTransaction)[]) => {
      throw new Error("signAllTransactions is not supported with phantom deeplinks.");
    };

    const signAndSendTransaction = async (transaction: Transaction | VersionedTransaction, context?: string) => {
      const session = localStorage.getItem("phantom_deeplink_session");
      const phantomPublicKeyBs58 = localStorage.getItem("phantom_deeplink_encryption_public_key");
      if (!session || !phantomPublicKeyBs58) throw new Error("phantom session not found. please connect first.");

      const sharedSecret = nacl.box.before(bs58.decode(phantomPublicKeyBs58), dappKeyPair.secretKey);
      const serializedTransaction = bs58.encode((transaction as any).serialize({ requireAllSignatures: false, verifySignatures: false }));
      const payload = { session, transaction: serializedTransaction };
      const encryptedPayload = encryptPayload(payload, sharedSecret);

      const redirectLink = new URL(window.location.origin + window.location.pathname);
      redirectLink.searchParams.set("phantom_action", "signAndSendTransaction");
      if (context) redirectLink.searchParams.append("context", context);

      const params = new URLSearchParams({
        app_url: window.location.origin,
        dapp_encryption_public_key: bs58.encode(dappKeyPair.publicKey),
        nonce: encryptedPayload.nonce,
        redirect_link: redirectLink.toString(),
        payload: encryptedPayload.payload,
      });

      const url = buildUrl("signAndSendTransaction", params);
      window.location.replace(url);
      return new Promise<{ signature: string; publicKey: PublicKey }>(() => {});
    };

    return {
      connect,
      disconnect,
      signMessage,
      signTransaction,
      signAllTransactions,
      signAndSendTransaction,
    } as PhantomProvider;
  },
};
