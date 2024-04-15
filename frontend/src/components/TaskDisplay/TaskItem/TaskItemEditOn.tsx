import {
  InputChangeEventDetail,
  IonButton,
  IonIcon,
  IonInput,
  IonTextarea,
  TextareaChangeEventDetail,
} from "@ionic/react";
import { TaskColor, TaskType } from "@models/task/task.enums";
import { FormEvent, memo, useRef, useState } from "react";

import "./TaskItemEditOn.scss";
import ChipPicker from "../ChipPicker/ChipPicker";
import PriorityPicker from "../Priority/PriorityPicker";
import { checkmarkSharp, closeSharp } from "ionicons/icons";
import ColorPicker from "../ColorPicker/ColorPicker";
import { Task } from "@models/task/task";
import { useAppDispatch } from "@store/store";
import { setEdit, updateAndBackupTask } from "@store/tasks.slice";

type Props = {
  id: string;
  type: TaskType;
  name: string;
  description: string;
  color: TaskColor;
  labels: string[];
  priority: number;
};
const TaskItemEditOn: React.FC<Props> = ({
  id,
  type,
  name,
  description,
  color,
  labels,
  priority,
}) => {
  const dispatch = useAppDispatch();
  const [nameE, setNameE] = useState<string>(name);
  const [descriptionE, setDescriptionE] = useState<string>(description);
  const [colorE, setColorE] = useState<TaskColor>(color);
  const [labelsE, setLabelsE] = useState<string[]>([...labels]);
  const [priorityE, setPriorityE] = useState<number>(priority);

  const confirmRef = useRef<HTMLIonButtonElement>(null);

  function handleNameChange({ detail }: { detail: { value?: any } }) {
    const value = (detail.value || "").trim();
    if (value.length > 0) {
      setNameE(value);
    }
  }

  function handleDescriptionChange({ detail }: { detail: { value?: any } }) {
    const value = (detail.value || "").trim();
    if (value.length > 0) {
      setDescriptionE(value);
    }
  }

  function cancel() {
    dispatch(setEdit());
  }

  function confirm() {
    const changes: Partial<Task> = {};
    const previousValues: Partial<Task> = {};
    if (nameE != name) {
      changes.name = nameE;
      previousValues.name = name;
    }
    if (descriptionE != description) {
      changes.description = descriptionE;
      previousValues.description = description;
    }
    if (colorE != color) {
      changes.color = colorE;
      previousValues.color = color;
    }
    if (
      labelsE.length != labels.length ||
      !labelsE.every((e) => labels.includes(e))
    ) {
      changes.labels = labelsE;
      previousValues.labels = labels;
    }
    if (priorityE != priority) {
      changes.priority = priorityE;
      previousValues.priority = priority;
    }
    if (Object.keys(changes).length > 0) {
      // something changed
      dispatch(
        updateAndBackupTask({
          rollback: { id, changes: previousValues },
          rollforward: { id, changes },
        })
      );
    }
    dispatch(setEdit());
  }

  function handleNameKeydown(e: React.KeyboardEvent) {
    if (e.code == "Enter") {
      e.stopPropagation();
      const value = (e.target as any).value;
      confirm();
    } else if (e.code != "Escape") {
      e.stopPropagation();
    }
  }

  function handleDescriptionKeydown(e: React.KeyboardEvent) {
    if (e.code != "Escape") {
      e.stopPropagation();
    }
  }

  function handleContainerKeydown(e: React.KeyboardEvent) {
    switch (e.code) {
      case "KeyC":
        e.stopPropagation();
        confirm();
        break;
      case "Escape":
        e.stopPropagation();
        cancel();
        break;
    }
  }
  return (
    <div className="task-edit" onKeyDown={handleContainerKeydown}>
      <div className="name-input">
        <IonInput
          type="text"
          placeholder="Task name"
          value={nameE}
          onIonInput={handleNameChange}
          onKeyDown={handleNameKeydown}
        />
      </div>
      <div className="description-input">
        <IonTextarea
          placeholder="Task description"
          autoGrow={true}
          rows={2}
          value={descriptionE}
          onIonInput={handleDescriptionChange}
          onKeyDown={handleDescriptionKeydown}
        />
      </div>
      <div className="labels">
        <ChipPicker labels={labelsE} onChange={setLabelsE} />
      </div>
      <div className="toolbar">
        <PriorityPicker priority={priorityE} onChange={setPriorityE} />
        <div className="toolbar-specific">
          {type == TaskType.SECTOR && (
            <ColorPicker color={colorE} onChange={setColorE} />
          )}
        </div>
      </div>
      <div className="buttons">
        <IonButton
          fill="clear"
          color="success"
          onClick={confirm}
          ref={confirmRef}
        >
          <IonIcon icon={checkmarkSharp} slot="icon-only" />
        </IonButton>
        <IonButton fill="clear" color="warning" onClick={cancel}>
          <IonIcon icon={closeSharp} slot="icon-only" />
        </IonButton>
      </div>
    </div>
  );
};

export default memo(TaskItemEditOn);
