import React from "react";

import { Tool } from "../lib/tools";
import { Action } from "../lib/action";

import { Visibility } from "./Overlay";
import OverlayButton from "./OverlayButton";

const Toolbar = ({
  currentTool,
  doAction,
  visibility,
}: {
  currentTool: Tool;
  doAction: (action: Action) => Promise<void>;
  visibility: Visibility;
}): JSX.Element => {
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
    <div className={`toolbar visibility-${visibility}`}>
      {tools.map((tool, index) => (
        <OverlayButton
          action={tool}
          callback={doAction}
          className={index === currentTool ? "active" : undefined}
          key={tool}
        />
      ))}
    </div>
  );
};

export default Toolbar;
