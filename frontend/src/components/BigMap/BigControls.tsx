import { HEIGHT, SPACE_SIZE, WIDTH } from "@models/hex";
import { memo, useEffect, useState } from "react";
import { useAppSelector } from "@store/store";
import { selectCurrentGalaxy } from "@store/galaxies.slice";
import { format } from "date-fns";
import { selectSectors } from "@store/tasks.slice";

type Props = {};

const BigControls: React.FC<Props> = ({}) => {
  const galaxy = useAppSelector(selectCurrentGalaxy);
  const sectors = useAppSelector(selectSectors);
  const [progress, setProgress] = useState<number>(0);
  useEffect(() => {
    if (sectors) {
      let galaxyProgress = 0;
      for (const sector of sectors) {
        galaxyProgress += sector.progress || 0;
      }
      galaxyProgress = (galaxyProgress + 1) / (sectors.length + 1);
      setProgress(galaxyProgress * 100);
    }
  }, [sectors]);
  return (
    <>
      {galaxy && (
        <g transform={`translate(0, ${SPACE_SIZE + 90})`}>
          <g>
            <rect
              x="40"
              y="0"
              width={WIDTH - 80}
              height="1"
              className="big-controls-progress-outside"
            />
            <rect
              x="50"
              y="0"
              width={WIDTH - 100}
              height="1"
              className="big-controls-progress-inside"
            />
            <rect
              x="50"
              y="0"
              width={`${progress * 0.9}%`}
              height="1"
              className="big-controls-progress"
            />
          </g>
          <g className="group-title">
            <text
              className="title"
              x="0"
              y="0"
              textAnchor="middle"
              dominantBaseline="middle"
            >
              {galaxy?.name}
            </text>
            <text
              className="description"
              x="0"
              y="60"
              textAnchor="middle"
              dominantBaseline="middle"
            >
              {galaxy?.description}
            </text>
            <text
              className="date"
              x="38%"
              y="120"
              textAnchor="middle"
              dominantBaseline="middle"
            >
              {format(galaxy!.date, "yyyy-MM-dd HH:mm:ss")}
            </text>
          </g>
        </g>
      )}
    </>
  );
};

export default memo(BigControls);
