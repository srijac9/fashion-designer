import type { StyleProp, ViewStyle } from "react-native";
import Svg, { Ellipse, Line, Path } from "react-native-svg";

interface MannequinProps {
  color?: string;
  style?: StyleProp<ViewStyle>;
}

export function MannequinBack({
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
        d="M120 90 Q120 118 124 138 Q128 166 132 208 Q136 252 138 332"
        stroke={color}
        strokeWidth="0.75"
      />
      <Path
        d="M180 90 Q180 118 176 138 Q172 166 168 208 Q164 252 162 332"
        stroke={color}
        strokeWidth="0.75"
      />
      <Path
        d="M128 100 Q139 110 150 110 Q161 110 172 100"
        stroke={color}
        strokeWidth="0.7"
      />
      <Path
        d="M120 122 Q134 134 150 134 Q166 134 180 122"
        stroke={color}
        strokeWidth="0.7"
      />
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
        d="M127 302 Q139 312 150 312 Q161 312 173 302"
        stroke={color}
        strokeWidth="0.75"
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
