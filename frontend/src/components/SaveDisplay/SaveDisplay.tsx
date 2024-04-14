import { memo } from "react";

import "./SaveDisplay.scss";
import { useAppDispatch, useAppSelector } from "@store/store";
import {
  downloadCurrentGalaxy,
  saveCurrentGalaxyLocally,
  selectCurrentGalaxySaveStatus,
} from "@store/galaxies.slice";
import { IonButton, IonIcon } from "@ionic/react";
import { downloadSharp, saveSharp } from "ionicons/icons";
import { SaveStatus } from "@models/galaxy";
const SaveDisplay: React.FC = () => {
  const dispatch = useAppDispatch();
  const saveStatus = useAppSelector(selectCurrentGalaxySaveStatus);

  function handleSaveLocally() {
    dispatch(saveCurrentGalaxyLocally());
  }

  function handleDownload() {
    dispatch(downloadCurrentGalaxy());
  }
  return (
    <>
      <div className="save-display">
        <IonButton
          fill="clear"
          disabled={saveStatus != SaveStatus.NEED_TO_SAVE}
          onClick={handleSaveLocally}
        >
          <IonIcon icon={saveSharp} slot="icon-only" />
        </IonButton>
        {saveStatus == SaveStatus.NEED_TO_SAVE && <div className="indicator" />}
      </div>
      <IonButton
        fill="clear"
        onClick={handleDownload}
        disabled={saveStatus == undefined}
      >
        <IonIcon icon={downloadSharp} slot="icon-only" />
      </IonButton>
    </>
  );
};

export default memo(SaveDisplay);
