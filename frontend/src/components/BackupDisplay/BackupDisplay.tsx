import { memo } from "react";
import "./BackupDisplay.scss";
import { IonButton, IonIcon } from "@ionic/react";
import {
  arrowBackSharp,
  arrowForwardSharp,
  arrowRedoSharp,
  arrowUndoSharp,
} from "ionicons/icons";
import { useAppDispatch, useAppSelector } from "@store/store";
import { rollback, rollforward } from "@store/backup.slice";
const BackupDisplay: React.FC = () => {
  const dispatch = useAppDispatch();
  const canGoBack = useAppSelector((state) => state.backup.bkps.length > 0);
  const canGoForward = useAppSelector(
    (state) => state.backup.bkpsForward.length > 0
  );

  function handleRollback() {
    dispatch(rollback());
  }
  function handleRollforward() {
    dispatch(rollforward());
  }
  return (
    <div className="backup-buttons">
      <IonButton fill="clear" disabled={!canGoBack} onClick={handleRollback}>
        <IonIcon icon={arrowUndoSharp} />
      </IonButton>
      <IonButton
        fill="clear"
        disabled={!canGoForward}
        onClick={handleRollforward}
      >
        <IonIcon icon={arrowRedoSharp} />
      </IonButton>
    </div>
  );
};

export default memo(BackupDisplay);
