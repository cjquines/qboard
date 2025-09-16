import { Action } from "../lib/action";
import { Tool, Tools } from "../lib/tools";

import { Visibility } from "./Overlay";
import OverlayButton from "./OverlayButton";

const Toolbar = (props: {
  currentTool: Tool;
  tools: Tools;
  doAction: (action: Action) => void;
  visibility: Visibility;
}) => {
  const items = [
    { tool: props.tools.Move, action: Action.Move },
    { tool: props.tools.Pen, action: Action.Pen },
    { tool: props.tools.Eraser, action: Action.Eraser },
    { tool: props.tools.Laser, action: Action.Laser },
    { tool: props.tools.Line, action: Action.Line },
    { tool: props.tools.Rectangle, action: Action.Rectangle },
    { tool: props.tools.Ellipse, action: Action.Ellipse },
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
      <OverlayButton
        action={Action.LaTeX}
        callback={props.doAction}
        // className={}
      />
    </div>
  );
};

export default Toolbar;
