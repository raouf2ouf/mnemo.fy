import {
  IonButton,
  IonHeader,
  IonIcon,
  IonLabel,
  IonMenu,
  IonMenuToggle,
  IonPage,
  IonRouterOutlet,
  IonSplitPane,
  IonTabBar,
  IonTabButton,
  IonTabs,
  IonToolbar,
} from "@ionic/react";
import {
  folderOpenSharp,
  listSharp,
  mapSharp,
  menuSharp,
} from "ionicons/icons";
import {
  Redirect,
  Route,
  useHistory,
  useLocation,
  useParams,
} from "react-router";

import "./Home.scss";
import SideMenu from "../components/SideMenu/SideMenu";
import ProjectsPage from "./projects/ProjectsPage";
import MapPage from "./map/MapPage";
import OverviewPage from "./overview/OverviewPage";
import BackupDisplay from "@components/BackupDisplay/BackupDisplay";
import SaveDisplay from "@components/SaveDisplay/SaveDisplay";
import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@store/store";
import { addLocalGalaxies, setCurrentGalaxy } from "@store/galaxies.slice";

function extractGalaxyIdFromPathname(pathname: string): string | undefined {
  let galaxyId: string | undefined;
  const path = pathname.split("/");
  if (path.length > 2) {
    const id = path[2];
    if (id.length > 20) {
      galaxyId = id;
    }
  }
  return galaxyId;
}

const Home: React.FC = () => {
  const dispatch = useAppDispatch();
  const version = "0.1.0";

  const currentGalaxyId = useAppSelector(
    (state) => state.galaxies.currentGalaxyId
  );

  const history = useHistory();

  useEffect(() => {
    const galaxyId = extractGalaxyIdFromPathname(location.pathname);
    dispatch(addLocalGalaxies(galaxyId));
  }, []);

  useEffect(() => {
    const unlisten = history.listen((location, action) => {
      const galaxyId = extractGalaxyIdFromPathname(location.pathname);
      if (galaxyId) {
        dispatch(setCurrentGalaxy(galaxyId));
      }
    });

    return () => {
      unlisten();
    };
  }, [history]);

  function toggleMenu() {
    const splitPane = document.querySelector("ion-split-pane");
    if (window.matchMedia("(min-width: 992px)").matches) {
      splitPane?.classList.toggle("split-pane-visible");
    }
  }
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <div id="toolbar">
            <IonMenuToggle autoHide={false}>
              <IonButton fill="clear" onClick={toggleMenu}>
                <IonIcon icon={menuSharp} slot="icon-only" />
              </IonButton>
            </IonMenuToggle>

            <div className="logo hide-sm">
              <div id="logo-text" className="hide-md">
                Mnemo<span>fy</span>
              </div>
              <div id="version" className="hide-md">
                {version}
              </div>
            </div>
            <div className="header-middle"></div>
            <BackupDisplay />
            <SaveDisplay />
          </div>
        </IonToolbar>
      </IonHeader>
      <IonSplitPane contentId="main">
        <IonMenu contentId="main">
          <SideMenu />
        </IonMenu>
        <div className="ion-page" id="main">
          <IonTabs>
            <IonRouterOutlet>
              <Redirect exact path="/" to="/projects" />
              <Route path="/projects" render={() => <ProjectsPage />} />
              <Route path="/map" render={() => <MapPage />} />
              <Route path="/overview" render={() => <OverviewPage />} />
            </IonRouterOutlet>
            <IonTabBar slot="bottom">
              <IonTabButton
                tab="projects"
                href={`/projects/${currentGalaxyId || ""}`}
              >
                <IonIcon icon={folderOpenSharp} />
                <IonLabel>Projects</IonLabel>
              </IonTabButton>
              <IonTabButton
                tab="map"
                href={`/map/${currentGalaxyId}`}
                disabled={!currentGalaxyId}
              >
                <IonIcon icon={mapSharp} />
                <IonLabel>Map</IonLabel>
              </IonTabButton>
              <IonTabButton
                tab="overview"
                href={`/overview/${currentGalaxyId}`}
                disabled={!currentGalaxyId}
              >
                <IonIcon icon={listSharp} />
                <IonLabel>Overview</IonLabel>
              </IonTabButton>
            </IonTabBar>
          </IonTabs>
        </div>
      </IonSplitPane>
    </IonPage>
  );
};

export default Home;
