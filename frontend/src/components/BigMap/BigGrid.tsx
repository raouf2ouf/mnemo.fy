import { useAppSelector } from "@store/store";
import BigHex from "./BigHex";

export const BigGrid: React.FC = () => {
  const ids = useAppSelector((state) => state.hexes.ids);
  return (
    <g className="big-grid">
      {ids.map((id) => (
        <BigHex key={id} id={id} />
      ))}
    </g>
  );
};
