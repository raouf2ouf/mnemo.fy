import { memo } from "react";
import SideMenuProjectSelected from "./SideMenuProjectSelected";

import "./SideMenu.scss";
import { useAppSelector } from "@store/store";
type Props = {};

const SideMenu: React.FC<Props> = ({}) => {
  const currentGalaxyId = useAppSelector(
    (state) => state.galaxies.currentGalaxyId
  );
  return (
    <div className="menu-container">
      {currentGalaxyId && <SideMenuProjectSelected />}
    </div>
  );
};

export default memo(SideMenu);
