import { memo } from "react";
import "./MapPage.scss";
import { IonContent, IonPage } from "@ionic/react";
import { useAppSelector } from "@store/store";
import { Redirect } from "react-router";
import BigMap from "@components/BigMap/BigMap";

const MapPage: React.FC = () => {
  const currentGalaxyId = useAppSelector(
    (state) => state.galaxies.currentGalaxyId
  );
  return (
    <IonPage>
      <IonContent className="page-content">
        <div className="main-container map-page">
          <BigMap />
        </div>
      </IonContent>
    </IonPage>
  );
};

export default memo(MapPage);
