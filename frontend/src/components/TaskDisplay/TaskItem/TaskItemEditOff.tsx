import { memo } from "react";
import TaskStats from "./TaskStats";
import { chatboxSharp, documentTextSharp } from "ionicons/icons";
import { IonIcon } from "@ionic/react";

import "./TaskItemEditOff.scss";
import PriorityDisplay from "../Priority/PriorityDisplay";
type Props = {
  id: string;
  name: string;
  description: string;
  nbrComments: number;
  content: string;
  labels: string[];
  checked: boolean;
  priority: number;
};
const TaskItemEditOff: React.FC<Props> = ({
  id,
  name,
  description,
  nbrComments,
  content,
  labels,
  checked,
  priority,
}) => {
  return (
    <div className={`task-display ${checked && "checked"}`}>
      <div className="task-name">{name}</div>
      <div className="task-description">{description}</div>
      <div className="infos-line-1">
        {priority > 0 && <PriorityDisplay priority={priority} />}
      </div>
      <div className="infos-line-2">
        <TaskStats id={id} />
        {nbrComments > 0 && <IonIcon icon={chatboxSharp} />}
        {content && <IonIcon icon={documentTextSharp} />}
        {labels.map((l) => (
          <div className="label" key={l}>
            #{l}
          </div>
        ))}
      </div>
    </div>
  );
};

export default memo(TaskItemEditOff);
