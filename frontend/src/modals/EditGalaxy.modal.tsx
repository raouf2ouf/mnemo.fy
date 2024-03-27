import {
  IonBackdrop,
  IonButton,
  IonButtons,
  IonContent,
  IonFooter,
  IonHeader,
  IonIcon,
  IonInput,
  IonLabel,
  IonModal,
  IonPage,
  IonSelect,
  IonSelectOption,
  IonSpinner,
  IonTextarea,
  IonTitle,
  IonToggle,
  IonToolbar,
} from "@ionic/react";
import { GalaxyDataExport, GalaxyTheme, SaveStatus } from "@models/galaxy";
import { arrowBackSharp, createSharp } from "ionicons/icons";

import "./Modal.scss";
import "./EditGalaxy.modal.scss";
import { useState } from "react";
import { useAppDispatch } from "@store/store";
import Tooltip from "@components/Tooltip/Tooltip";
import { addGalaxyAndLoadChildren } from "@store/galaxies.slice";

type Props = {
  isOpen: boolean;
  data?: GalaxyDataExport;
  setIsOpen: (value: boolean) => void;
};
const EditGalaxyModal: React.FC<Props> = ({ isOpen, data, setIsOpen }) => {
  const dispatch = useAppDispatch();

  const [loading, setLoading] = useState<boolean>(false);
  const [name, setName] = useState<string>(data?.name || "");
  const [description, setDescription] = useState<string>(
    data?.description || ""
  );
  const [discoverable, setDiscoverable] = useState<boolean>(
    data?.discoverable || false
  );
  const [theme, setTheme] = useState<GalaxyTheme>(
    data?.theme || GalaxyTheme.BTL
  );

  function handleSubmit() {
    dispatch(
      addGalaxyAndLoadChildren({
        ...data!,
        name,
        description,
        discoverable,
        theme,
        lastModificationData: Date.now(),
        saveStatus: SaveStatus.NEED_TO_SAVE,
      })
    );
    closeModal();
  }

  function closeModal() {
    setIsOpen(false);
  }

  return (
    <>
      {data && (
        <IonModal className="edit-galaxy-modal-page modal-page" isOpen={isOpen}>
          <IonHeader>
            <IonToolbar>
              <IonButtons slot="start">
                <IonButton color="primary" title="Close" onClick={closeModal}>
                  <IonIcon icon={arrowBackSharp} slot="icon-only" />
                </IonButton>
              </IonButtons>
              <IonTitle>
                {data.name.length > 0 ? (
                  <span>
                    Edit Galaxy <strong>{data.name}</strong>
                  </span>
                ) : (
                  <span>Create Galaxy</span>
                )}
              </IonTitle>
              <IonButtons slot="end">
                <IonButton
                  color="primary"
                  disabled={name == undefined || name.length == 0}
                  onClick={handleSubmit}
                >
                  <IonIcon slot="start" icon={createSharp} />
                  <IonLabel>Create</IonLabel>
                </IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>
          <IonContent className="ion-padding">
            <div className="edit-galaxy-modal-container modal-container">
              {loading && (
                <div className="modal-loading">
                  <IonSpinner name="lines-sharp" color="primary" />
                  <IonBackdrop visible={true} tappable={false} />
                </div>
              )}
              <div className="id">{data.id}</div>

              <div className="item">
                <div className="item-label">
                  <IonLabel>Name</IonLabel>
                  <Tooltip text="" />
                </div>
                <div className="item-data">
                  <IonInput
                    value={name}
                    onIonInput={({ detail }) =>
                      setName(detail.value?.trim() || "")
                    }
                    placeholder="Project name"
                  />
                </div>
              </div>

              <div className="item">
                <div className="item-label">
                  <IonLabel>Description</IonLabel>
                  <Tooltip text="" />
                </div>
                <div className="item-data">
                  <IonTextarea
                    value={description}
                    rows={2}
                    autoGrow={true}
                    onIonInput={({ detail }) =>
                      setDescription(detail.value || "")
                    }
                    placeholder="Project description"
                  />
                </div>
              </div>

              <div className="item">
                <div className="item-label">
                  <IonLabel>Theme</IonLabel>
                  <Tooltip text="" />
                </div>
                <div className="item-data">
                  <IonSelect
                    aria-label="Project theme"
                    value={theme}
                    interface="popover"
                    justify="end"
                    onIonChange={({ detail }) => setTheme(detail.value)}
                  >
                    <IonSelectOption value={GalaxyTheme.BTL}>
                      BTL
                    </IonSelectOption>
                  </IonSelect>
                </div>
              </div>

              <div className="item">
                <div className="item-label">
                  <IonLabel>Discoverable</IonLabel>
                  <Tooltip text="" />
                </div>
                <div className="item-data">
                  <IonToggle
                    checked={discoverable}
                    onIonChange={({ detail }) => setDiscoverable(detail.value)}
                  />
                </div>
              </div>
            </div>
          </IonContent>
          <IonFooter>
            <IonButton
              fill="outline"
              color="primary"
              disabled={name == undefined || name.length == 0}
              onClick={handleSubmit}
            >
              <IonIcon slot="start" icon={createSharp} />
              <IonLabel>Create</IonLabel>
            </IonButton>
          </IonFooter>
        </IonModal>
      )}
    </>
  );
};

export default EditGalaxyModal;
