import { IonContent, IonFooter, IonLabel } from "@ionic/react";
import { memo } from "react";
import Tooltip from "../Tooltip/Tooltip";
import Stats from "./Stats";

type Props = {};

const SideMenuWithProjectSelected: React.FC<Props> = ({}) => {
  return (
    <>
      <IonContent className="menu-content">
        <div>
          <div className="section">
            <IonLabel>
              <div></div>
              <Tooltip text=""></Tooltip>
            </IonLabel>
          </div>
        </div>
      </IonContent>
      <IonFooter>
        <Stats />
      </IonFooter>
    </>
  );
};

export default memo(SideMenuWithProjectSelected);
