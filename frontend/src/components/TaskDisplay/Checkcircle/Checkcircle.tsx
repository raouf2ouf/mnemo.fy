import { TaskType } from "@models/task/task.enums";
import { getTypeText } from "@models/task/task.utils";
import { IonIcon } from "@ionic/react";
import { checkmarkSharp } from "ionicons/icons";
import { memo } from "react";

import "./Checkcircle.scss";
import { useAppDispatch } from "@store/store";
import { toggleChecked } from "@store/tasks.slice";
type Props = {
  id: string;
  type: TaskType;
  checked: boolean;
};

const Checkcircle: React.FC<Props> = ({ id, type, checked }) => {
  const dispatch = useAppDispatch();

  function handleToggleChecked() {
    dispatch(toggleChecked({ taskId: id }));
  }

  function handleKeydown(e: React.KeyboardEvent) {
    if (e.code == "Enter") {
      handleToggleChecked();
      e.stopPropagation();
    }
  }
  return (
    <div
      className="checkcircle-container"
      tabIndex={0}
      onKeyDown={handleKeydown}
      onClick={handleToggleChecked}
    >
      <div className="checkcircle">
        {checked && (
          <div className="checkmark">
            <IonIcon icon={checkmarkSharp} />
          </div>
        )}
      </div>
      <div className={getTypeText(type)}>
        <div className="inside"></div>
      </div>
    </div>
  );
};

export default memo(Checkcircle);
