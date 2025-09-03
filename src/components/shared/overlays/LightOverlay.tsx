export default function LightOverlay() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 opacity-80 mix-blend-hard-light bg-gradient-to-t from-[var(--light-overlay-stop-1)] to-[var(--light-overlay-stop-2)]"
    />
  );
}
