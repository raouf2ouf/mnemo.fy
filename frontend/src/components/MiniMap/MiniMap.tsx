import { memo } from "react";

import "./MiniMap.scss";
import { Grid } from "./Grid";
import Systems from "./Systems";
import { SPACE_SIZE } from "@models/hex";
import { IonButton, IonIcon } from "@ionic/react";
import { refreshSharp } from "ionicons/icons";
import { useAppDispatch } from "@store/store";
import { refreshPositions } from "@store/hexes.slice";
import Territories from "./Territories";
import { COLORS } from "@models/task/task.enums";

const MiniMap: React.FC = () => {
  const dispatch = useAppDispatch();

  function handleMapRefresh() {
    dispatch(refreshPositions());
  }
  return (
    <div className="mini-map-container">
      <div className="mini-map">
        <svg
          width="200"
          height="200"
          viewBox={`0 0 ${SPACE_SIZE} ${SPACE_SIZE}`}
        >
          {COLORS.map((c) => (
            <pattern
              id={c.replace("#", "")}
              key={c}
              patternUnits="userSpaceOnUse"
              width="20"
              height="20"
              patternTransform="rotate(45 0 0)"
            >
              <line
                x1="0"
                y1="0"
                x2="0"
                y2="20"
                stroke={c}
                strokeWidth="3"
                opacity="0.6"
              />
            </pattern>
          ))}
          <g transform="translate(32.5,0)">
            <Grid />
            <Territories />
            <Systems />
          </g>
        </svg>
      </div>

      <div className="mini-map-buttons">
        <IonButton fill="clear" expand="block" onClick={handleMapRefresh}>
          <IonIcon slot="icon-only" icon={refreshSharp} />
        </IonButton>
      </div>
    </div>
  );
};

export default memo(MiniMap);
