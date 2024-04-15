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
                <polygon
                  points={section.points}
                  key={idx}
                  className="user"
                  fill={`url(${sector.color})`}
                />
              );
            } else {
              return (
                <polygon points={section.points} key={idx} className="empty" />
              );
            }
          })}
        </g>
      )}
    </>
  );
};

export default memo(Territory);
