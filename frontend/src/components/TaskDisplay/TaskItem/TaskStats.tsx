import { useAppSelector } from "@store/store";
import { selectStatsOfTask } from "@store/tasks.slice";
import { memo } from "react";

type Props = {
  id: string;
};
const TaskStats: React.FC<Props> = ({ id }) => {
  const [nbrChildren, nbrChildrenChecked] = useAppSelector((state) =>
    selectStatsOfTask(state, id)
  );
  return (
    <>
      {nbrChildren > 0 && (
        <div className="task-stats">
          [{nbrChildrenChecked}/{nbrChildren}]
        </div>
      )}
    </>
  );
};

export default memo(TaskStats);
