import { memo, useEffect, useMemo, useRef, useState } from "react";
import { DragEvent } from "react";

import "./TaskItem.scss";
import { useAppDispatch, useAppSelector } from "@store/store";
import {
  addTask,
  deleteTask,
  moveTask,
  moveTaskDown,
  moveTaskLeft,
  moveTaskRight,
  moveTaskUp,
  selectTaskById,
  setEdit,
  toggleChecked,
  toggleTask,
} from "@store/tasks.slice";
import { getTypeText } from "@models/task/task.utils";
import Checkcircle from "@components/TaskDisplay/Checkcircle/Checkcircle";
import {
  IonAlert,
  IonButton,
  IonContent,
  IonIcon,
  IonItem,
  IonItemDivider,
  IonLabel,
  IonList,
  IonPopover,
  useIonAlert,
} from "@ionic/react";
import {
  chevronDownSharp,
  chevronForwardSharp,
  createOutline,
  createSharp,
  ellipsisHorizontalSharp,
  removeSharp,
  returnDownBackSharp,
  returnDownForwardSharp,
  returnUpBackSharp,
  trashSharp,
} from "ionicons/icons";
import TaskItemEditOff from "./TaskItemEditOff";
import { TaskType } from "@models/task/task.enums";
import { DRAG_ENDED_EVENT, DRAG_STARTED_EVENT } from "src/hooks/dnd.helpers";
import { attachDndChildListeners } from "src/hooks/dnd-hook";
import TaskItemEditOn from "./TaskItemEditOn";

type Props = {
  id: string;
};
const TaskItem: React.FC<Props> = ({ id }) => {
  const dispatch = useAppDispatch();
  const task = useAppSelector((state) => selectTaskById(state, id));
  const edit = useAppSelector((state) => state.tasks.edit == task.id);
  const wasOpen = useRef<boolean>(false);

  const divRef = useRef<HTMLDivElement>(null);
  const [presentAlert] = useIonAlert();

  useEffect(() => {
    const node = divRef.current;
    const dndChildListeners = attachDndChildListeners(node);
    const handleDragStarted = () => {
      wasOpen.current = task.closed;
      dispatch(setEdit());
      dispatch(toggleTask({ taskId: task.id, toggle: true }));
    };
    const handleDragEnded = () => {
      dispatch(toggleTask({ taskId: task.id, toggle: wasOpen.current }));
    };
    if (node) {
      node.addEventListener(DRAG_STARTED_EVENT, handleDragStarted);
      node.addEventListener(DRAG_ENDED_EVENT, handleDragEnded);
    }

    return () => {
      dndChildListeners();
      if (node) {
        node.removeEventListener(DRAG_STARTED_EVENT, handleDragStarted);
        node.removeEventListener(DRAG_ENDED_EVENT, handleDragEnded);
      }
    };
  }, [divRef.current, task]);

  useEffect(() => {
    if (edit) {
      setTimeout(() => {
        const input: HTMLIonInputElement | undefined | null =
          divRef.current?.querySelector("ion-input");
        if (input) {
          input.setFocus();
        }
      }, 200);
    }
  }, [edit]);

  function handleKeydown(e: React.KeyboardEvent) {
    switch (e.code) {
      // case "Enter": // wierd behavior when clicking buttons, not worth it
      //   e.stopPropagation();
      //   dispatch(toggleChecked({ taskId: task.id }));
      //   break;
      case "KeyE":
        e.stopPropagation();
        handleToggleEdit();
        break;

      case "ArrowLeft":
      case "KeyL":
        if (e.shiftKey) {
          e.stopPropagation();
          dispatch(moveTaskLeft(task.id));
        }
        break;

      case "ArrowRight":
      case "KeyH":
        if (e.shiftKey) {
          e.stopPropagation();
          dispatch(moveTaskRight(task.id));
        }
        break;

      case "ArrowUp":
      case "KeyK":
        if (e.shiftKey) {
          e.stopPropagation();
          dispatch(moveTaskUp(task.id));
        }
        break;

      case "ArrowDown":
      case "KeyJ":
        if (e.shiftKey) {
          e.stopPropagation();
          dispatch(moveTaskDown(task.id));
        }
        break;
    }
  }

  function handleToggleTask() {
    dispatch(toggleTask({ taskId: id }));
  }

  function handleToggleEdit() {
    dispatch(setEdit(task.id));
  }

  function handleAddTaskAbove() {
    dispatch(
      addTask({
        index: task.index - 0.5,
        type: task.type,
        parentId: task.parent!,
      })
    );
  }
  function handleAddTaskBelow() {
    dispatch(
      addTask({
        index: task.index + 0.5,
        type: task.type,
        parentId: task.parent!,
      })
    );
  }
  function handleAddSubTask() {
    dispatch(
      addTask({
        index: task.index + 0.5,
        type: task.type == TaskType.MOON ? TaskType.MOON : task.type + 1,
        parentId: task.type == TaskType.MOON ? task.parent! : task.id,
      })
    );
  }
  function handleDeleteTask() {
    presentAlert({
      cssClass: "delete-task-alert",
      header: "Delete",
      subHeader: task.name,
      message: `Are you sure you want to delete this task and all of its children?`,
      buttons: [
        {
          text: "Cancel",
          role: "cancel",
        },
        {
          text: "Delete",
          role: "confirm",
          cssClass: "alert-delete",
          handler: () => {
            dispatch(deleteTask(task.id));
          },
        },
      ],
    });
  }

  return (
    <>
      {task && task.displayed && (
        <div
          ref={divRef}
          id={task.id}
          className={`task-container type${task.type}`}
          style={
            {
              "--task-color": task.color,
              "--task-color-shade": `${task.color}44`,
            } as any
          }
          role="button"
          data-type={task.type}
          tabIndex={-1}
          onKeyDown={handleKeydown}
        >
          {/* <IonLabel color="danger">{task.index}</IonLabel> */}
          {/* Toogle */}
          <div className="toggle">
            {task.type < TaskType.MOON ? (
              <IonButton fill="clear" onClick={handleToggleTask}>
                {task.closed ? (
                  <IonIcon icon={chevronForwardSharp} slot="icon-only" />
                ) : (
                  <IonIcon icon={chevronDownSharp} slot="icon-only" />
                )}
              </IonButton>
            ) : (
              <IonButton fill="clear">
                <IonIcon icon={removeSharp} />
              </IonButton>
            )}
          </div>
          {/* Checkbox */}
          <Checkcircle id={task.id} checked={task.checked} type={task.type} />

          {/* Task Type */}
          <div className="type-text hide-sm">{getTypeText(task.type)}</div>

          {/* Task Text and Description */}
          <div className="task-content">
            {edit ? (
              <TaskItemEditOn
                id={task.id}
                type={task.type}
                name={task.name}
                description={task.description}
                labels={task.labels}
                color={task.color}
                priority={task.priority}
              />
            ) : (
              <TaskItemEditOff
                id={task.id}
                name={task.name}
                description={task.description}
                nbrComments={task.comments.length}
                labels={task.labels}
                content={task.content}
                checked={task.checked}
                priority={task.priority}
              />
            )}
          </div>

          {/* Buttons */}
          {!edit && (
            <div className="task-buttons">
              <IonButton fill="clear" onClick={handleToggleEdit}>
                <IonIcon icon={createOutline} slot="icon-only" />
              </IonButton>
              <IonButton fill="clear" id={`trigger-menu-${task.id}`}>
                <IonIcon icon={ellipsisHorizontalSharp} slot="icon-only" />
              </IonButton>
              <IonPopover
                trigger={`trigger-menu-${task.id}`}
                dismissOnSelect={true}
                showBackdrop={false}
                className="task-menu-popover"
              >
                <IonContent>
                  <IonList>
                    <IonItem
                      button={true}
                      detail={false}
                      onClick={handleAddTaskAbove}
                    >
                      <IonIcon slot="start" icon={returnUpBackSharp} />
                      <IonLabel>Add Task Above</IonLabel>
                    </IonItem>
                    <IonItem
                      button={true}
                      detail={false}
                      onClick={handleAddTaskBelow}
                    >
                      <IonIcon slot="start" icon={returnDownBackSharp} />
                      <IonLabel>Add Task Below</IonLabel>
                    </IonItem>
                    <IonItem
                      button={true}
                      detail={false}
                      onClick={handleAddSubTask}
                    >
                      <IonIcon slot="start" icon={returnDownForwardSharp} />
                      <IonLabel>Add Sub-Task</IonLabel>
                    </IonItem>

                    <IonItem
                      button={true}
                      detail={false}
                      onClick={handleToggleEdit}
                    >
                      <IonIcon slot="start" icon={createSharp} />
                      <IonLabel>Edit Task</IonLabel>
                    </IonItem>
                    <IonItem
                      button={true}
                      detail={false}
                      className="delete"
                      onClick={handleDeleteTask}
                      id={`alert-${task.id}`}
                    >
                      <IonIcon slot="start" icon={trashSharp} />
                      <IonLabel>Delete Task</IonLabel>
                    </IonItem>
                  </IonList>
                </IonContent>
              </IonPopover>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default memo(TaskItem);
