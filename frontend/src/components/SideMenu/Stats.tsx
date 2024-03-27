import { useAppSelector } from "@store/store";
import { selectStatsOfCurrentGalaxy } from "@store/tasks.slice";
import { memo } from "react";

const Stats: React.FC = () => {
  const [
    nbrSectors,
    nbrSectorsChecked,
    nbrSystems,
    nbrSystemsChecked,
    nbrPlanets,
    nbrPlanetsChecked,
    nbrMoons,
    nbrMoonsChecked,
  ] = useAppSelector(selectStatsOfCurrentGalaxy);
  return (
    <div className="stats">
      <div className="stats-type">
        <div className="numbers">
          <span className="completed">{nbrSectorsChecked}</span>/
          <span className="total">{nbrSectors}</span>
        </div>
        <div className="text">Sectors</div>
      </div>
      <div className="stats-type">
        <div className="numbers">
          <span className="completed">{nbrSystemsChecked}</span>/
          <span className="total">{nbrSystems}</span>
        </div>
        <div className="text">Systems</div>
      </div>
      <div className="stats-type">
        <div className="numbers">
          <span className="completed">{nbrPlanetsChecked}</span>/
          <span className="total">{nbrPlanets}</span>
        </div>
        <div className="text">Planets</div>
      </div>
      <div className="stats-type">
        <div className="numbers">
          <span className="completed">{nbrMoonsChecked}</span>/
          <span className="total">{nbrMoons}</span>
        </div>
        <div className="text">Moons</div>
      </div>
    </div>
  );
};

export default memo(Stats);
