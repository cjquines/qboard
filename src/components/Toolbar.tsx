import React from "react";

import { Action } from "../lib/action";

import { Visibility } from "./Overlay";
import OverlayButton from "./OverlayButton";
import { ToolHandler } from "../lib/tools";

class Toolbar extends React.Component<{
  currentTool: ToolHandler;
  handlers: { [key: string]: ToolHandler };
  doAction: (action: Action) => Promise<void>;
  visibility: Visibility;
}> {
  render(): JSX.Element {
    const items = [
      { tool: this.props.handlers.Move, action: Action.Move },
      { tool: this.props.handlers.Pen, action: Action.Pen },
      { tool: this.props.handlers.Eraser, action: Action.Eraser },
      { tool: this.props.handlers.Laser, action: Action.Laser },
      { tool: this.props.handlers.Line, action: Action.Line },
      { tool: this.props.handlers.Rectangle, action: Action.Rectangle },
      { tool: this.props.handlers.Ellipse, action: Action.Ellipse },
    ];

    return (
      <div className={`toolbar visibility-${this.props.visibility}`}>
        {items.map(({ tool, action }) => (
          <OverlayButton
            action={action}
            callback={this.props.doAction}
            className={tool.isActive() ? "active" : undefined}
            key={action}
          />
        ))}
      </div>
    );
  }
}

export default Toolbar;
