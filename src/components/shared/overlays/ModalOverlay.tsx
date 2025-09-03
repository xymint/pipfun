export default function ModalOverlay() {
  return (
    <div
      aria-hidden
      className="fixed inset-0 z-[110] opacity-90 bg-gradient-to-t from-[var(--modal-overlay-stop-1)] to-[var(--modal-overlay-stop-2)]"
    />
  );
}
