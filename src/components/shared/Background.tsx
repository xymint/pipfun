type Props = {
  mobileXPercent?: number; // e.g., 40 means 40% (center is 50%)
};

export default function Background({ mobileXPercent = 40 }: Props) {
  return (
    <div
      aria-hidden
      style={{
        // @ts-expect-error CSS var for arbitrary background-position value
        "--bg-pos-x": `${mobileXPercent}%`,
      }}
      className="fixed inset-0 -z-30 bg-[url('/home-bg.png')] bg-cover [background-position:var(--bg-pos-x)_50%] md:bg-center md:[background-position:center] md:bg-fixed"
    />
  );
}
