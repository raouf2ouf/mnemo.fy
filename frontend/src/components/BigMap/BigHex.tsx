import { Hex } from "@models/hex";
import { pointsToString } from "@models/hex.utils";
import { selectHexById } from "@store/hexes.slice";
import { useAppSelector } from "@store/store";
import { memo } from "react";

type Props = {
  id: number;
};

const BigHex: React.FC<Props> = ({ id }) => {
  const hex: Hex = useAppSelector((state) => selectHexById(state, id));
  return (
    <g className="big-hex">
      <polygon points={pointsToString(hex.corners)}></polygon>
      <text
        x={hex.center.x}
        y={hex.center.y - 50}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize={12}
      >
        {id}
      </text>
    </g>
  );
};

export default memo(BigHex);
