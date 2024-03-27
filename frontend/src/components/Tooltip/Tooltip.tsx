import { v4 as uuid } from "uuid";
import { memo, useMemo } from "react";
import {
  IonButton,
  IonContent,
  IonIcon,
  IonLabel,
  IonPopover,
} from "@ionic/react";

import "./Tooltip.scss";
import { helpCircleSharp } from "ionicons/icons";

type Props = {
  text: string;
  color?: string;
};

const Tooltip: React.FC<Props> = ({ text, color }) => {
  const id = useMemo(() => uuid(), [text]);

  return (
    <div className="tooltip-container">
      <IonButton
        slot="icon-only"
        color="primary"
        fill="clear"
        size="small"
        id={id}
        tabIndex={-1}
      >
        <IonIcon icon={helpCircleSharp}></IonIcon>
      </IonButton>
      <IonPopover
        trigger={id}
        triggerAction="click"
        alignment="center"
        showBackdrop={false}
      >
        <IonContent className="ion-padding tooltip-content">
          <IonLabel>{text}</IonLabel>
        </IonContent>
      </IonPopover>
    </div>
  );
};

export default memo(Tooltip);
