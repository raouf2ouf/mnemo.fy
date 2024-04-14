import { useAppSelector } from "@store/store";
import { selectAllCurrentGalaxySystemsIds } from "@store/tasks.slice";
import { memo } from "react";
import SystemCell from "./SystemCell";

type Props = {};
const Systems: React.FC<Props> = ({}) => {
  const systemsIds: string[] = useAppSelector(selectAllCurrentGalaxySystemsIds);
  return (
    <>
      {systemsIds.map((id) => (
        <SystemCell id={id} key={id} />
      ))}
    </>
  );
};

export default memo(Systems);
