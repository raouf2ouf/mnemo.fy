import { useAppSelector } from "@store/store";
import { selectTaskById } from "@store/tasks.slice";
import { selectTerritoryById } from "@store/territories.slice";
import { memo } from "react";

type Props = {
  id: string;
};
const Territory: React.FC<Props> = ({ id }) => {
  const sector = useAppSelector((state) => selectTaskById(state, id));
  const territory = useAppSelector((state) => selectTerritoryById(state, id));

  return (
    <>
      {sector && territory && (
        <g
          className="territory"
          style={
            {
              "--color": sector.color + "30",
              "--color-pure": sector.color + "70",
            } as any
          }
        >
          {territory.sections.map((section, idx) => {
            if (section.userControlled) {
              return (
                <g key={idx}>
                  <polygon
                    points={section.points}
                    className="user"
                    fill={`url(${sector.color})`}
                  />
                </g>
              );
            } else {
              return (
                <g key={idx}>
                  <polygon points={section.points} className="empty" />
                  <text
                    x={section.titlePosition.x}
                    y={section.titlePosition.y}
                    fontSize={(section.titleSize * 3) / sector.name.length}
                    fill={sector.color + "30"}
                    textAnchor="middle"
                    dominantBaseline="middle"
                  >
                    {sector.name.toUpperCase()}
                  </text>
                </g>
              );
            }
          })}
        </g>
      )}
    </>
  );
};

export default memo(Territory);
