import { memo } from "react";

import "./GalaxyCardDisplay.scss";
import { IonCard, IonCardContent } from "@ionic/react";
import { useAppDispatch, useAppSelector } from "@store/store";
import { selectGalaxyById, setCurrentGalaxy } from "@store/galaxies.slice";
import { useHistory } from "react-router-dom";

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
      <IonCardContent></IonCardContent>
    </IonCard>
  );
};

export default memo(GalaxyCardDisplay);
