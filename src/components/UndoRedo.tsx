import React from "react";

import { Action } from "../lib/action";

import { Visibility } from "./Overlay";
import OverlayButton from "./OverlayButton";

const UndoRedo = (props: {
  canUndo: boolean;
  canRedo: boolean;
  doAction: (action: Action) => void;
  visibility: Visibility;
}): JSX.Element => {
  return (
    <div className={`undoredo visibility-${props.visibility}`}>
      <OverlayButton
        action={Action.Undo}
        callback={props.doAction}
        className={props.canUndo ? undefined : "disabled"}
      />
      <OverlayButton
        action={Action.Redo}
        callback={props.doAction}
        className={props.canRedo ? undefined : "disabled"}
      />
    </div>
  );
};

export default UndoRedo;
