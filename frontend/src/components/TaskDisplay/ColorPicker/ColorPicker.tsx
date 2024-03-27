import { TaskColor } from "@models/task/task.enums";

import "./ColorPicker.scss";
import { memo } from "react";
type Props = {
  color: TaskColor;
  onChange: (color: TaskColor) => void;
};
const ColorPicker: React.FC<Props> = ({ color, onChange }) => {
  function handleKeydown(e: React.KeyboardEvent, color: TaskColor) {
    if (e.code == "Enter") {
      e.stopPropagation();
      onChange(color);
    }
  }
  return (
    <div className="color-picker">
      {Object.values(TaskColor).map((c, idx) => (
        <div
          key={idx}
          className={`color ${color == c && "active"}`}
          style={{ backgroundColor: c }}
          role="button"
          tabIndex={0}
          onClick={() => onChange(c)}
          onKeyDown={(e) => handleKeydown(e, c)}
        ></div>
      ))}
    </div>
  );
};

export default memo(ColorPicker);
