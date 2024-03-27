import { IonButton, IonIcon, IonLabel } from "@ionic/react";
import { TaskType } from "@models/task/task.enums";
import { useAppDispatch, useAppSelector } from "@store/store";
import { addTask } from "@store/tasks.slice";
import { addSharp } from "ionicons/icons";
import { memo, useEffect, useRef } from "react";

const AddTask: React.FC = () => {
  const dispatch = useAppDispatch();

  const focusId = useAppSelector((state) => state.tasks.focusId);

  const divRef = useRef<HTMLIonButtonElement>(null);

  // useEffect(() => {
  //   if (nbrTasks == focusIdx && divRef.current) {
  //     divRef.current.focus();
  //   }
  // }, [nbrTasks, focusIdx]);

  function handleAddTask(e: any) {
    if (e.code) {
      if (e.code == "Enter") {
        e.stopPropagation();
        dispatch(addTask({ type: TaskType.SECTOR, parentId: "" }));
      }
    } else {
      dispatch(addTask({ type: TaskType.SECTOR, parentId: "" }));
    }
  }
  return (
    <IonButton
      fill="clear"
      expand="full"
      onClick={handleAddTask}
      onKeyDown={handleAddTask}
      ref={divRef}
      tabIndex={0}
      id="add-task"
    >
      <IonIcon slot="start" icon={addSharp} />
      <IonLabel>Add Task</IonLabel>
    </IonButton>
  );
};

export default memo(AddTask);
