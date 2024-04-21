import { useAppSelector } from "@store/store";
import { memo } from "react";
import BigTerritory from "./BigTerritory";

type Props = {};
const BigTerritories: React.FC<Props> = ({}) => {
  const territoriesIds: string[] = useAppSelector(
    (state) => state.territories.ids
  );
  return (
    <>
      {territoriesIds.map((id) => {
        return <BigTerritory id={id} key={id} />;
      })}
    </>
  );
};

export default memo(BigTerritories);
