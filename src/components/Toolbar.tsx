import React from "react";

import { Tool } from "../lib/tools";
import { Action } from "../lib/action";

import { Visibility } from "./Overlay";
import OverlayButton from "./OverlayButton";

const Toolbar = (props: {
  currentTool: Tool;
  doAction: (Action) => Promise<void>;
  visibility: Visibility;
}) => {
  const tools = [
    Action.Move,
    Action.Pen,
    Action.Eraser,
    Action.Laser,
    Action.Line,
    Action.Rectangle,
    Action.Ellipse,
  ];

  return (
    <div className={`toolbar visibility-${props.visibility}`}>
      {tools.map((tool, index) => (
        <OverlayButton
          action={tool}
          callback={props.doAction}
          className={index === props.currentTool ? "active" : undefined}
          key={tool}
        />
      ))}
    </div>
  );
};

export default Toolbar;
