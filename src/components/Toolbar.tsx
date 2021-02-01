import React from "react";

import { Action } from "../lib/action";
import { ToolHandler } from "../lib/tools";

import { Visibility } from "./Overlay";
import OverlayButton from "./OverlayButton";

const Toolbar = (props: {
  currentTool: ToolHandler;
  handlers: { [key: string]: ToolHandler };
  doAction: (action: Action) => Promise<void>;
  visibility: Visibility;
}): JSX.Element => {
  const items = [
    { tool: props.handlers.Move, action: Action.Move },
    { tool: props.handlers.Pen, action: Action.Pen },
    { tool: props.handlers.Eraser, action: Action.Eraser },
    { tool: props.handlers.Laser, action: Action.Laser },
    { tool: props.handlers.Line, action: Action.Line },
    { tool: props.handlers.Rectangle, action: Action.Rectangle },
    { tool: props.handlers.Ellipse, action: Action.Ellipse },
  ];

  return (
    <div className={`toolbar visibility-${props.visibility}`}>
      {items.map(({ tool, action }) => (
        <OverlayButton
          action={action}
          callback={props.doAction}
          className={tool.isActive() ? "active" : undefined}
          key={action}
        />
      ))}
    </div>
  );
};

export default Toolbar;
