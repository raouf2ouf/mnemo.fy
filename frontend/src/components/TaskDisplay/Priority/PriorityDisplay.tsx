import { memo } from "react";

import PriorityIcon from "@assets/priority.png";

import "./Priority.scss";
type Props = {
  priority: number;
};
const PriorityDisplay: React.FC<Props> = ({ priority }) => {
  return (
    <div className="priority-display">
      {[...Array(5)].map((_, idx) => {
        if (priority > idx) {
          return (
            <div className="icon" key={idx}>
              <img src={PriorityIcon} alt="Priority Icon" />
            </div>
          );
        }
      })}
    </div>
  );
};
export default memo(PriorityDisplay);
