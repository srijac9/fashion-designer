import type { StyleProp, ViewStyle } from "react-native";
import Svg, { Circle, Ellipse, Line, Path } from "react-native-svg";

interface MannequinProps {
  color?: string;
  style?: StyleProp<ViewStyle>;
}

export function MannequinFront({
  color = "rgba(132, 132, 132, 0.9)",
  style,
}: MannequinProps) {
  return (
    <Svg
      viewBox="0 0 300 550"
      fill="none"
      preserveAspectRatio="none"
      style={style}
    >
      <Ellipse cx="150" cy="22" rx="14" ry="5.5" stroke={color} strokeWidth="1" />
      <Line x1="139" y1="22" x2="140" y2="52" stroke={color} strokeWidth="1" />
      <Line x1="161" y1="22" x2="160" y2="52" stroke={color} strokeWidth="1" />
      <Path
        d="M140 52 L128 68 L128 82 Q116 88 105 95 Q94 102 86 114 Q80 132 80 156 Q80 194 86 242 Q90 276 96 310 Q100 334 106 360 Q101 404 96 452 L94 520"
        stroke={color}
        strokeWidth="1"
      />
      <Path
        d="M160 52 L172 68 L172 82 Q184 88 195 95 Q206 102 214 114 Q220 132 220 156 Q220 194 214 242 Q210 276 204 310 Q200 334 194 360 Q199 404 204 452 L206 520"
        stroke={color}
        strokeWidth="1"
      />
      <Path
        d="M128 82 Q126 105 128 126 Q131 150 136 180 Q140 208 142 242 Q144 286 140 332"
        stroke={color}
        strokeWidth="0.85"
      />
      <Path
        d="M172 82 Q174 105 172 126 Q169 150 164 180 Q160 208 158 242 Q156 286 160 332"
        stroke={color}
        strokeWidth="0.85"
      />
      <Path
        d="M140 332 Q132 410 132 520"
        stroke={color}
        strokeWidth="0.9"
      />
      <Path
        d="M160 332 Q168 410 168 520"
        stroke={color}
        strokeWidth="0.9"
      />
      <Line x1="150" y1="52" x2="150" y2="520" stroke={color} strokeWidth="0.8" opacity="0.9" />
      <Line x1="116" y1="88" x2="184" y2="88" stroke={color} strokeWidth="0.7" />
      <Line x1="102" y1="104" x2="198" y2="104" stroke={color} strokeWidth="0.7" />
      <Line x1="94" y1="122" x2="206" y2="122" stroke={color} strokeWidth="0.7" />
      <Line x1="90" y1="148" x2="210" y2="148" stroke={color} strokeWidth="0.7" />
      <Line x1="92" y1="182" x2="208" y2="182" stroke={color} strokeWidth="0.7" />
      <Line x1="96" y1="236" x2="204" y2="236" stroke={color} strokeWidth="0.7" />
      <Line x1="104" y1="300" x2="196" y2="300" stroke={color} strokeWidth="0.7" />
      <Line x1="108" y1="388" x2="192" y2="388" stroke={color} strokeWidth="0.7" />
      <Path
        d="M96 122 Q114 115 128 112 Q140 110 150 110 Q160 110 172 112 Q186 115 204 122"
        stroke={color}
        strokeWidth="0.7"
      />
      <Ellipse cx="121" cy="126" rx="19" ry="23" stroke={color} strokeWidth="0.7" />
      <Ellipse cx="179" cy="126" rx="19" ry="23" stroke={color} strokeWidth="0.7" />
      <Circle cx="121" cy="126" r="9" stroke={color} strokeWidth="0.65" opacity="0.9" />
      <Circle cx="179" cy="126" r="9" stroke={color} strokeWidth="0.65" opacity="0.9" />
      <Line x1="102" y1="126" x2="140" y2="126" stroke={color} strokeWidth="0.55" opacity="0.85" />
      <Line x1="160" y1="126" x2="198" y2="126" stroke={color} strokeWidth="0.55" opacity="0.85" />
      <Line x1="121" y1="104" x2="121" y2="148" stroke={color} strokeWidth="0.55" opacity="0.85" />
      <Line x1="179" y1="104" x2="179" y2="148" stroke={color} strokeWidth="0.55" opacity="0.85" />
      <Path
        d="M113 148 Q110 182 110 214 Q110 258 114 330 Q114 430 112 520"
        stroke={color}
        strokeWidth="0.75"
        opacity="0.85"
      />
      <Path
        d="M187 148 Q190 182 190 214 Q190 258 186 330 Q186 430 188 520"
        stroke={color}
        strokeWidth="0.75"
        opacity="0.85"
      />
      <Path
        d="M129 335 Q140 323 150 323 Q160 323 171 335"
        stroke={color}
        strokeWidth="0.85"
      />
      <Path
        d="M129 335 Q124 350 124 374"
        stroke={color}
        strokeWidth="0.75"
      />
      <Path
        d="M171 335 Q176 350 176 374"
        stroke={color}
        strokeWidth="0.75"
      />
      <Path
        d="M94 520 Q109 513 132 516"
        stroke={color}
        strokeWidth="0.9"
      />
      <Path
        d="M168 516 Q191 513 206 520"
        stroke={color}
        strokeWidth="0.9"
      />
    </Svg>
  );
}
