import Svg, {
  Defs,
  G,
  LinearGradient,
  Path,
  Stop,
  Text as SvgText,
} from "react-native-svg";

type DuelVsBadgeProps = {
  size?: number;
};

/**
 * Feed / arena düello VS — metalik harfler, kırmızı çizgi, şeffaf arka plan.
 */
export function DuelVsBadge({ size = 68 }: DuelVsBadgeProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Defs>
        <LinearGradient id="vsMetal" x1="0%" y1="0%" x2="0%" y2="100%">
          <Stop offset="0%" stopColor="#E5E7EB" />
          <Stop offset="45%" stopColor="#6B7280" />
          <Stop offset="100%" stopColor="#111827" />
        </LinearGradient>
        <LinearGradient id="vsSlash" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#FCA5A5" />
          <Stop offset="50%" stopColor="#DC2626" />
          <Stop offset="100%" stopColor="#7F1D1D" />
        </LinearGradient>
      </Defs>

      <G opacity={0.45}>
        <Path
          d="M48 38 L62 28 L70 42 L56 50 Z"
          fill="#991B1B"
        />
        <Path
          d="M34 58 L22 72 L30 82 L44 68 Z"
          fill="#1F2937"
        />
        <Path
          d="M66 62 L78 54 L84 66 L72 74 Z"
          fill="#991B1B"
        />
      </G>

      <Path
        d="M47 6 L58 94 L51 94 L40 6 Z"
        fill="url(#vsSlash)"
      />
      <Path
        d="M44 6 L49 94 L46 94 L41 6 Z"
        fill="#FEE2E2"
        opacity={0.55}
      />

      <SvgText
        x="21"
        y="64"
        fill="#0F172A"
        fontSize="34"
        fontWeight="900"
        fontStyle="italic"
        textAnchor="middle"
        opacity={0.35}
      >
        V
      </SvgText>
      <SvgText
        x="19"
        y="62"
        fill="url(#vsMetal)"
        fontSize="34"
        fontWeight="900"
        fontStyle="italic"
        textAnchor="middle"
      >
        V
      </SvgText>
      <SvgText
        x="18"
        y="60"
        fill="#F9FAFB"
        fontSize="34"
        fontWeight="900"
        fontStyle="italic"
        textAnchor="middle"
        opacity={0.22}
      >
        V
      </SvgText>

      <SvgText
        x="79"
        y="64"
        fill="#0F172A"
        fontSize="34"
        fontWeight="900"
        fontStyle="italic"
        textAnchor="middle"
        opacity={0.35}
      >
        S
      </SvgText>
      <SvgText
        x="77"
        y="62"
        fill="url(#vsMetal)"
        fontSize="34"
        fontWeight="900"
        fontStyle="italic"
        textAnchor="middle"
      >
        S
      </SvgText>
      <SvgText
        x="76"
        y="60"
        fill="#F9FAFB"
        fontSize="34"
        fontWeight="900"
        fontStyle="italic"
        textAnchor="middle"
        opacity={0.22}
      >
        S
      </SvgText>
    </Svg>
  );
}
