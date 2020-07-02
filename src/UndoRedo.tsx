import React from "react";

import { Visibility } from "./Overlay";

const UndoRedo = (props: {
  undo: () => Promise<void>;
  redo: () => Promise<void>;
  canUndo: boolean;
  canRedo: boolean;
  visibility: Visibility;
}) => {
  return (
    <div className={`undoredo visibility-${props.visibility}`}>
      <button
        className={props.canUndo ? undefined : "disabled"}
        onClick={props.undo}
      >
        <i className="fas fa-undo" />
      </button>
      <button
        className={props.canRedo ? undefined : "disabled"}
        onClick={props.redo}
      >
        <i className="fas fa-redo" />
      </button>
    </div>
  );
};

export default UndoRedo;
