import { Planet } from "@models/task/planet";
import { System } from "@models/task/system";
import { selectHexById } from "@store/hexes.slice";
import { useAppSelector } from "@store/store";
import { selectPlanets, selectTaskById } from "@store/tasks.slice";
import { memo } from "react";

type Props = {
  id: string;
};
const BigSystem: React.FC<Props> = ({ id }) => {
  const system: System = useAppSelector((state) =>
    selectTaskById(state, id)
  ) as System;

  const planets: Planet[] = useAppSelector((state) => selectPlanets(state, id));

  const hex = useAppSelector((state) =>
    selectHexById(state, system?.hex === undefined ? 1000 : system.hex)
  );

  return (
    <>
      {system && system.hex !== undefined && hex && (
        <g className="big-system" style={{ "--color": system.color } as any}>
          {planets &&
            planets.map((p, idx) => {
              return (
                <circle
                  key={idx}
                  className={`planet ${p.checked && "checked"}`}
                  cx={hex.center.x + (idx + 0.4 - planets.length / 2) * 13}
                  cy={hex.center.y - 23}
                  r="5"
                />
              );
            })}
          <circle cx={hex.center.x} cy={hex.center.y} r="10" />
          <text
            x={hex.center.x}
            y={hex.center.y + 35}
            textAnchor="middle"
            dominantBaseline="middle"
          >
            {system.name}
          </text>
        </g>
      )}
    </>
  );
};

export default memo(BigSystem);
