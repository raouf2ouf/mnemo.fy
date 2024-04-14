import { Hex } from "@models/hex";
import { pointsToString } from "@models/hex.utils";
import { selectHexById } from "@store/hexes.slice";
import { useAppSelector } from "@store/store";
import { memo } from "react";

type Props = {
  id: number;
};
const Cell: React.FC<Props> = ({ id }) => {
  const hex: Hex = useAppSelector((state) => selectHexById(state, id));

  return (
    <polygon
      points={pointsToString(hex.corners)}
      className={`hex ${hex.sectorId && "used"}`}
    />
  );
};

export default memo(Cell);
