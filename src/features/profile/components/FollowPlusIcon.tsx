import Svg, { Rect } from "react-native-svg";

type FollowPlusIconProps = {
  size: number;
  color?: string;
};

export function FollowPlusIcon({ size, color = "#ffffff" }: FollowPlusIconProps) {
  const span = size * 0.58;
  const bar = size * 0.2;
  const radius = bar / 2;
  const origin = (32 - span) / 2;
  const mid = (32 - bar) / 2;

  return (
    <Svg width={size} height={size} viewBox="0 0 32 32">
      <Rect
        x={origin}
        y={mid}
        width={span}
        height={bar}
        rx={radius}
        ry={radius}
        fill={color}
      />
      <Rect
        x={mid}
        y={origin}
        width={bar}
        height={span}
        rx={radius}
        ry={radius}
        fill={color}
      />
    </Svg>
  );
}
