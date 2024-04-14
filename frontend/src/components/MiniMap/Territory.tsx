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

  console.log("sector", sector);
  console.log("territory", territory);

  return (
    <>
      {sector && territory && (
        <g
          className="territory"
          style={{ "--color": sector.color + "A0" } as any}
        >
          {territory.sections.map((section, idx) => {
            return <polygon points={section.points} key={idx} />;
          })}
        </g>
      )}
    </>
  );
};

export default memo(Territory);
