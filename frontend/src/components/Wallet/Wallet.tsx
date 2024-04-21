import { memo } from "react";

import "./Wallet.scss";
import { IonButton } from "@ionic/react";
const Wallet: React.FC = () => {
  return (
    <div className="wallet-container">
      <IonButton fill="outline">Connect Wallet</IonButton>
    </div>
  );
};

export default memo(Wallet);
