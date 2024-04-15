import { Hex, SPACE_SIZE } from "@models/hex";
import { pointsToString } from "@models/hex.utils";
import { System } from "@models/task/system";
import { COLORS } from "@models/task/task.enums";
import { Territory } from "@models/territory";

import "./StaticMiniMap.scss";
type Props = {
  date: number;
  territories?: Territory[];
  hexes?: Hex[];
  systems?: System[];
};
const StaticMiniMap: React.FC<Props> = ({
  date,
  territories,
  hexes,
  systems,
}) => {
  return (
    <svg
      className="static-mini-map"
      width="100%"
      height="100%"
      viewBox={`0 0 ${SPACE_SIZE} ${SPACE_SIZE}`}
    >
      {COLORS.map((c) => (
        <pattern
          id={c.replace("#", "")}
          key={c}
          patternUnits="userSpaceOnUse"
          width="20"
          height="20"
          patternTransform="rotate(45 0 0)"
        >
          <line
            x1="0"
            y1="0"
            x2="0"
            y2="20"
            stroke={c}
            strokeWidth="3"
            opacity="0.6"
          />
        </pattern>
      ))}
      <g transform="translate(32.5,0)">
        <g className="grid">
          {/* {hexes && hexes.map((hex) => (
            <polygon
              key={hex.id}
              points={pointsToString(hex.corners)}
              className="hex"
            ></polygon>
          ))} */}
        </g>
        {territories &&
          territories.map((t) => (
            <g
              key={t.id}
              className="territory"
              style={
                {
                  "--color": t.color! + "30",
                  "--color-tint": t.color! + "70",
                } as any
              }
            >
              {t.sections.map((section, idx) => {
                if (section.userControlled) {
                  return (
                    <g key={idx}>
                      <polygon
                        points={section.points}
                        className="user"
                        fill={`url(${t.color})`}
                      />
                    </g>
                  );
                } else {
                  return (
                    <g key={idx}>
                      <polygon points={section.points} className="empty" />
                    </g>
                  );
                }
              })}
            </g>
          ))}
        {systems &&
          systems.map((s, idx) => (
            <g
              key={idx}
              className="system"
              style={{ "--color": s.color + "A0" } as any}
            >
              <circle
                cx={hexes && hexes[s.hex || 0].center?.x}
                cy={hexes && hexes[s.hex || 0].center.y}
                r="15"
              />
            </g>
          ))}
      </g>
    </svg>
  );
};

export default StaticMiniMap;
