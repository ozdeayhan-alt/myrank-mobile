import Svg, { Path } from "react-native-svg";

type VoteChevronIconProps = {
  direction: "up" | "down";
  size: number;
  color?: string;
};

export function VoteChevronIcon({
  direction,
  size,
  color = "#ffffff",
}: VoteChevronIconProps) {
  const pathUp =
    "M16 3 L27 20.5 Q28.5 24.5 24.5 24.5 L7.5 24.5 Q3.5 24.5 5 20.5 Z";
  const pathDown =
    "M16 25 L27 7.5 Q28.5 3.5 24.5 3.5 L7.5 3.5 Q3.5 3.5 5 7.5 Z";
  const height = Math.round((size * 28) / 32);

  return (
    <Svg width={size} height={height} viewBox="0 0 32 28">
      <Path d={direction === "up" ? pathUp : pathDown} fill={color} />
    </Svg>
  );
}
