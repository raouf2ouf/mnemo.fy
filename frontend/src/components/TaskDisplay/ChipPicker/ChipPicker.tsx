import { memo, useState } from "react";

import "./ChipPicker.scss";
import { IonInput } from "@ionic/react";
type Props = {
  labels: string[];
  onChange: (value: string[]) => void;
};

const ChipPicker: React.FC<Props> = ({ labels, onChange }) => {
  const [label, setLabel] = useState<string>("");

  function handleLabelInputChange(e: React.KeyboardEvent<HTMLIonInputElement>) {
    if (e.code != "Escape") {
      e.stopPropagation();
      if (e.code == "Space" || e.code == "Enter") {
        const lbl = (e.target as HTMLInputElement).value.trim();
        if (lbl.length > 0) {
          const exists = labels.find((l) => l == lbl);
          if (!exists) {
            onChange([...labels, lbl]);
          } else {
            onChange(labels.filter((l) => l != lbl));
          }
          setLabel("");
        }
      }
    }
  }

  function handleChipClick(e: React.MouseEvent, chip: string) {
    e.stopPropagation();
    onChange(labels.filter((l) => l != chip));
  }

  return (
    <div className="chip-picker">
      {labels.map((lbl) => (
        <div
          className="chip"
          key={lbl}
          role="button"
          tabIndex={-1}
          onClick={(e) => handleChipClick(e, lbl)}
        >
          #{lbl}
        </div>
      ))}
      <IonInput
        type="text"
        onKeyDown={handleLabelInputChange}
        value={label}
        maxlength={30}
        placeholder="+ Add label or write it again to delete it"
      />
    </div>
  );
};

export default memo(ChipPicker);
