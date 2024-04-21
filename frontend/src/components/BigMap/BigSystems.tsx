import { useAppSelector } from "@store/store";
import { selectAllCurrentGalaxySystemsIds } from "@store/tasks.slice";
import { memo } from "react";
import BigSystem from "./BigSystem";

type Props = {};
const BigSystems: React.FC<Props> = ({}) => {
  const systemsIds: string[] = useAppSelector(selectAllCurrentGalaxySystemsIds);
  return (
    <>
      {systemsIds.map((id) => (
        <BigSystem id={id} key={id} />
      ))}
    </>
  );
};

export default memo(BigSystems);
