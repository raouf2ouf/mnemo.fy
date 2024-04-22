import { memo } from "react";

import "./Wallet.scss";
import { IonButton } from "@ionic/react";
import { useAccount, useConnect } from "wagmi";
const Wallet: React.FC = () => {
  const { isConnected, address } = useAccount();
  const { connectors, connect } = useConnect();

  function shortenAddress(addr: any) {
    return addr.slice(0, 7) + "..." + addr.slice(-5);
  }

  function handleConnect() {
    connect({ connector: connectors[0] });
  }
  return (
    <div className="wallet-container">
      {isConnected ? (
        <IonButton fill="outline">{shortenAddress(address)}</IonButton>
      ) : (
        <IonButton fill="outline" onClick={handleConnect}>
          Connect Wallet
        </IonButton>
      )}
    </div>
  );
};

export default memo(Wallet);
