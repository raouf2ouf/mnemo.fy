import { memo } from "react";
import "./OverviewPage.scss";
import { IonContent, IonLabel, IonPage } from "@ionic/react";
import TaskList from "@components/TaskDisplay/TaskList/TaskList";
import { useAppSelector } from "@store/store";

import "./OverviewPage.scss";
import { Redirect } from "react-router";
const OverviewPage: React.FC = () => {
  const currentGalaxyId = useAppSelector(
    (state) => state.galaxies.currentGalaxyId
  );

  return (
    <IonPage>
      <IonContent className="page-content">
        <div className="page-main-container overview-page">
          {currentGalaxyId ? <TaskList /> : <Redirect to="/projects" />}
        </div>
      </IonContent>
    </IonPage>
  );
};

export default memo(OverviewPage);
