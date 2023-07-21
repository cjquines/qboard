import React from "react";
import { Action } from "../lib/action";
import OverlayButton from "./OverlayButton";
const UndoRedo = (props) => {
    return (React.createElement("div", { className: `undoredo visibility-${props.visibility}` },
        React.createElement(OverlayButton, { action: Action.Undo, callback: props.doAction, className: props.canUndo ? undefined : "disabled" }),
        React.createElement(OverlayButton, { action: Action.Redo, callback: props.doAction, className: props.canRedo ? undefined : "disabled" })));
};
export default UndoRedo;
