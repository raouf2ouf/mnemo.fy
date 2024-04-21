import { HEIGHT, SPACE_SIZE, WIDTH } from "@models/hex";
import { COLORS } from "@models/task/task.enums";
import { memo } from "react";
import { BigGrid } from "./BigGrid";

import "./BigMap.scss";
import BigSystems from "./BigSystems";
import BigTerritories from "./BigTerritories";
import BigControls from "./BigControls";
import { TransformComponent, TransformWrapper } from "react-zoom-pan-pinch";
type Props = {};
const BigMap: React.FC<Props> = ({}) => {
  return (
    <TransformWrapper>
      <TransformComponent wrapperClass="big-map-zoom">
        <svg
          width="100%"
          height="100%"
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          className="bigmap"
        >
          {COLORS.map((c) => (
            <pattern
              id={c.replace("#", "") + "big"}
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
                strokeWidth="10"
                opacity="0.6"
              />
            </pattern>
          ))}
          <rect
            className="big-map-background"
            width={WIDTH}
            height={HEIGHT}
            x="0"
            y="0"
          />
          <rect
            className="big-map-hole"
            width={SPACE_SIZE - 40}
            height={SPACE_SIZE + 40}
            x="20"
            y="20"
          />
          <g transform="translate(35,40)">
            <BigGrid />
            <BigTerritories />
            <BigSystems />
          </g>
          <BigControls />
        </svg>
      </TransformComponent>
    </TransformWrapper>
  );
};

export default memo(BigMap);
