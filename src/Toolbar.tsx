import React from "react";

import { Tool } from "./tools";
import { Action } from "./action";

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
    Action.Ellipse,
    Action.Rectangle,
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
