import { IonContent, IonFooter, IonLabel } from "@ionic/react";
import { memo } from "react";
import Tooltip from "../Tooltip/Tooltip";
import Stats from "./Stats";
import MiniMap from "@components/MiniMap/MiniMap";
import { useAppSelector } from "@store/store";
import { selectCurrentGalaxy } from "@store/galaxies.slice";
import SectorsList from "./SectorsList";
import Wallet from "@components/Wallet/Wallet";

type Props = {};

const SideMenuWithProjectSelected: React.FC<Props> = ({}) => {
  const galaxy = useAppSelector(selectCurrentGalaxy);
  return (
    <>
      {galaxy && (
        <>
          <IonContent className="menu-content">
            <div className="menu-content-container">
              <div className="section">
                <IonLabel>
                  <div>Wallet</div>
                  <Tooltip text=""></Tooltip>
                </IonLabel>
                <Wallet />
              </div>
              <div className="section">
                <IonLabel>
                  <div>Current Galaxy</div>
                  <Tooltip text=""></Tooltip>
                </IonLabel>
                <div className="galaxy-name">{galaxy?.name}</div>
                <div className="galaxy-description">{galaxy?.description}</div>
                <MiniMap />
              </div>
              <div className="section sectors">
                <IonLabel>
                  <div>Sectors</div>
                  <Tooltip text="" />
                </IonLabel>
                <SectorsList />
              </div>
            </div>
          </IonContent>
          <IonFooter>
            <Stats />
          </IonFooter>
        </>
      )}
    </>
  );
};

export default memo(SideMenuWithProjectSelected);
