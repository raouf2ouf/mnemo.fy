import { memo } from "react";
import SideMenuProjectSelected from "./SideMenuProjectSelected";

import "./SideMenu.scss";
type Props = {};

const SideMenu: React.FC<Props> = ({}) => {
  return (
    <div className="menu-container">
      <SideMenuProjectSelected />
    </div>
  );
};

export default memo(SideMenu);
