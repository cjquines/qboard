import React from "react";
import { Action } from "../lib/action";
import OverlayButton from "./OverlayButton";
const Toolbar = (props) => {
    const items = [
        { tool: props.tools.Move, action: Action.Move },
        { tool: props.tools.Pen, action: Action.Pen },
        { tool: props.tools.Eraser, action: Action.Eraser },
        { tool: props.tools.Laser, action: Action.Laser },
        { tool: props.tools.Line, action: Action.Line },
        { tool: props.tools.Rectangle, action: Action.Rectangle },
        { tool: props.tools.Ellipse, action: Action.Ellipse },
    ];
    return (React.createElement("div", { className: `toolbar visibility-${props.visibility}` },
        items.map(({ tool, action }) => (React.createElement(OverlayButton, { action: action, callback: props.doAction, className: tool.isActive() ? "active" : undefined, key: action }))),
        React.createElement(OverlayButton, { action: Action.LaTeX, callback: props.doAction })));
};
export default Toolbar;
