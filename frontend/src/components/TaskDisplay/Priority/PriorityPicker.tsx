import { memo } from "react";

import PriorityIcon from "@assets/priority.png";
import "./Priority.scss";
import Tooltip from "@components/Tooltip/Tooltip";
type Props = {
  priority: number;
  onChange: (value: number) => void;
};

const PriorityPicker: React.FC<Props> = ({ priority, onChange }) => {
  function handlePrioritySelect(
    e: React.MouseEvent | React.KeyboardEvent,
    value: number
  ) {
    if (value == 1 && priority == 1) {
      value = 0;
    }
    const keyPressed = (e as React.KeyboardEvent).code;
    if (!keyPressed || keyPressed == "Enter") {
      e.stopPropagation();
      onChange(value);
    }
  }
  return (
    <div className="priority-picker">
      <div className="icon">
        <img src={PriorityIcon} alt="Priority Icon" />
      </div>
      <Tooltip text="" />
      {[...Array(5)].map((_, idx) => (
        <div
          key={idx}
          className={`bar ${priority > idx && "active"}`}
          tabIndex={0}
          role="button"
          onClick={(e) => handlePrioritySelect(e, idx + 1)}
          onKeyDown={(e) => handlePrioritySelect(e, idx + 1)}
        ></div>
      ))}
    </div>
  );
};

export default memo(PriorityPicker);
