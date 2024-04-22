import { memo, useEffect, useRef, useState } from "react";
import "./ProjectsPage.scss";
import {
  IonAccordion,
  IonAccordionGroup,
  IonCard,
  IonCardContent,
  IonContent,
  IonIcon,
  IonItem,
  IonLabel,
  IonPage,
} from "@ionic/react";
import { addSharp, documentSharp, walletSharp } from "ionicons/icons";
import { GalaxyDataExport, GalaxyTheme, createNewGalaxy } from "@models/galaxy";
import EditGalaxyModal from "@modals/EditGalaxy.modal";
import { useAppDispatch, useAppSelector } from "@store/store";
import {
  addGalaxyAndLoadChildren,
  selectAllGalaxiesIds,
} from "@store/galaxies.slice";
import GalaxyCardDisplay from "@components/GalaxyCardDisplay/GalaxyCardDisplay";
import { useAccount } from "wagmi";

const ProjectsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { isConnected } = useAccount();
  const galaxies = useAppSelector(selectAllGalaxiesIds);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [modalData, setModalData] = useState<GalaxyDataExport | undefined>();
  const fileInputRef = useRef(null);

  function createGalaxy() {
    const galaxy = createNewGalaxy("", "", GalaxyTheme.BTL, false);
    setModalData(galaxy);
    setShowModal(true);
  }

  function handleImportClick() {
    //@ts-ignore
    fileInputRef.current.click();
  }

  function importGalaxy(event: any) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result;
      try {
        const json = JSON.parse(text as string);
        dispatch(addGalaxyAndLoadChildren(json));
      } catch (error) {
        console.error(error);
      }
    };
    reader.readAsText(file);
  }

  return (
    <>
      <IonPage>
        <IonContent className="page-content">
          <div className="page-main-container projects-page">
            <IonAccordionGroup multiple={true} value={["galaxies", "nfts"]}>
              <IonAccordion value="galaxies">
                <IonItem slot="header">
                  <IonLabel>Projects</IonLabel>
                </IonItem>
                <div slot="content">
                  {galaxies &&
                    galaxies.map((gId) => (
                      <GalaxyCardDisplay key={gId} id={gId} />
                    ))}
                  <IonCard
                    type="button"
                    className="card-button add-galaxy"
                    onClick={createGalaxy}
                  >
                    <IonCardContent>
                      <IonIcon icon={addSharp} />
                      <div className="title">Create Galaxy</div>
                    </IonCardContent>
                  </IonCard>

                  <IonCard
                    type="button"
                    className="card-button import-galaxy"
                    onClick={handleImportClick}
                  >
                    <input
                      type="file"
                      accept=".json"
                      style={{ display: "none" }}
                      onChange={importGalaxy}
                      ref={fileInputRef}
                    />
                    <IonCardContent>
                      <IonIcon icon={documentSharp} />
                      <div className="title">Import Galaxy</div>
                    </IonCardContent>
                  </IonCard>
                </div>
              </IonAccordion>
              <IonAccordion value="nfts">
                <IonItem slot="header">
                  <IonLabel>NFTs</IonLabel>
                </IonItem>
                <div slot="content">
                  {galaxies &&
                    galaxies.map((gId) => (
                      <GalaxyCardDisplay key={gId} id={gId} />
                    ))}
                  <IonCard type="button" className="card-button connect-wallet">
                    <IonCardContent>
                      <IonIcon icon={walletSharp} />
                      <div className="title">Connect Wallet</div>
                    </IonCardContent>
                  </IonCard>
                </div>
              </IonAccordion>
            </IonAccordionGroup>
          </div>
        </IonContent>
      </IonPage>
      <EditGalaxyModal
        isOpen={showModal}
        setIsOpen={setShowModal}
        data={modalData}
      />
    </>
  );
};

export default memo(ProjectsPage);
