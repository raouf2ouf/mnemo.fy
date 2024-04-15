import { memo } from "react";

import "./GalaxyCardDisplay.scss";
import { IonCard, IonCardContent, IonLabel } from "@ionic/react";
import { useAppDispatch, useAppSelector } from "@store/store";
import { selectGalaxyById, setCurrentGalaxy } from "@store/galaxies.slice";
import { useHistory } from "react-router-dom";
import StaticMiniMap from "./StaticMiniMap/StaticMiniMap";
import { format } from "date-fns";

type Props = {
  id: string;
};
const GalaxyCardDisplay: React.FC<Props> = ({ id }) => {
  const dispatch = useAppDispatch();
  const history = useHistory();
  const galaxy = useAppSelector((state) => selectGalaxyById(state, id));

  async function handleOpen() {
    await dispatch(setCurrentGalaxy(id));
    history.push(`/overview/${id}`);
  }
  return (
    <IonCard type="button" className="card-button galaxy" onClick={handleOpen}>
      <IonCardContent>
        <div className="card-static-mini-map">
          <StaticMiniMap
            date={galaxy.date}
            hexes={galaxy.minimap?.hexes}
            territories={galaxy.minimap?.territories}
            systems={galaxy.minimap?.systems}
          />
        </div>
        <div className="card-title">
          <IonLabel className="card-title-main">{galaxy.name}</IonLabel>
          <IonLabel className="card-subtitle">
            {galaxy.date && format(galaxy.date, "yyyy-MM-dd HH:mm:ss")}
          </IonLabel>
        </div>
      </IonCardContent>
    </IonCard>
  );
};

export default memo(GalaxyCardDisplay);
