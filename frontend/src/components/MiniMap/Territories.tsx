import { useAppSelector } from "@store/store";
import { memo } from "react";
import Territory from "./Territory";

type Props = {};
const Territories: React.FC<Props> = ({}) => {
  const territoriesIds: string[] = useAppSelector(
    (state) => state.territories.ids
  );
  return (
    <>
      {territoriesIds.map((id) => {
        return <Territory id={id} key={id} />;
      })}
    </>
  );
};

export default memo(Territories);
