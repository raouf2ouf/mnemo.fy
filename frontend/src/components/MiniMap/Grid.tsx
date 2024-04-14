import { useAppSelector } from "@store/store";
import Cell from "./Cell";

export const Grid: React.FC = () => {
  const ids = useAppSelector((state) => state.hexes.ids);
  return (
    <g className="grid">
      {ids.map((id) => (
        <Cell key={id} id={id} />
      ))}
    </g>
  );
};
