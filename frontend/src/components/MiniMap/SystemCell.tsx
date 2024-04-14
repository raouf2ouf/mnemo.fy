import { Hex } from "@models/hex";
import { pointsToString } from "@models/hex.utils";
import { System } from "@models/task/system";
import { selectHexById } from "@store/hexes.slice";
import { useAppSelector } from "@store/store";
import { selectTaskById } from "@store/tasks.slice";
import { memo } from "react";

type Props = {
  id: string;
};
const SystemCell: React.FC<Props> = ({ id }) => {
  const system: System = useAppSelector((state) =>
    selectTaskById(state, id)
  ) as System;

  const hex = useAppSelector((state) =>
    selectHexById(state, system?.hex === undefined ? 1000 : system.hex)
  );

  return (
    <>
      {system && system.hex !== undefined && hex && (
        <g className="system" style={{ "--color": system.color + "30" } as any}>
          <polygon points={pointsToString(hex.corners)} />
          <circle cx={hex.center.x} cy={hex.center.y} r="15" />
        </g>
      )}
    </>
  );
};

export default memo(SystemCell);
