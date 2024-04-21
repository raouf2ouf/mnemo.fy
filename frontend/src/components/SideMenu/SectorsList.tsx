import { IonProgressBar } from "@ionic/react";
import { Sector } from "@models/task/sector";
import { getTypeText } from "@models/task/task.utils";
import { useAppSelector } from "@store/store";
import { selectSectors, selectSystemsOfSector } from "@store/tasks.slice";
import { memo } from "react";

type Props = { sector: Sector };
const SectorDisplay: React.FC<Props> = ({ sector }) => {
  const systems = useAppSelector((state) =>
    selectSystemsOfSector(state, sector.id)
  );
  return (
    <div
      className="sector-display"
      style={{ "--color": sector.color + "A0" } as any}
    >
      <div className="sector-main-row">
        <div className="type-text hide-sm">{getTypeText(sector.type)}</div>
        <div className="sector-name">{sector.name}</div>
        <div className="systems">
          {systems &&
            systems.map((s) => (
              <div
                key={s.id}
                className={`system ${s.checked && "checked"}`}
              ></div>
            ))}
        </div>
      </div>
      <div className="progress">
        <IonProgressBar value={sector.progress} />
      </div>
    </div>
  );
};

const SectorsList: React.FC = () => {
  const sectors = useAppSelector(selectSectors);
  return (
    <div className="sectors-list">
      <div>
        {sectors && sectors.map((s) => <SectorDisplay key={s.id} sector={s} />)}
      </div>
    </div>
  );
};

export default memo(SectorsList);
