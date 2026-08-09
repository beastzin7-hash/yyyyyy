interface Props {
  size?: number;
}

export default function RobuxIcon({ size = 24 }: Props) {
  return (
    <img
      src="/robux-logo.png"
      alt="Robux"
      width={size}
      height={size}
      style={{ objectFit: "contain", display: "inline-block", flexShrink: 0 }}
    />
  );
}
