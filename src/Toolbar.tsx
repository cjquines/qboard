import React from "react";

import { Tool } from "./tools";
import { Visibility } from "./Overlay";

const Toolbar = (props: {
  switchTool: (tool: Tool) => Promise<void>;
  currentTool: Tool;
  visibility: Visibility;
}) => {
  const tools = [
    {
      tool: Tool.Move,
      icon: "fa-mouse-pointer",
    },
    {
      tool: Tool.Pen,
      icon: "fa-pen",
    },
    {
      tool: Tool.Eraser,
      icon: "fa-eraser",
    },
    {
      tool: Tool.Line,
      icon: "fa-minus",
      style: { transform: "rotate(-45deg)" },
    },
    {
      tool: Tool.Ellipse,
      icon: "fa-circle",
    },
    {
      tool: Tool.Rectangle,
      icon: "fa-square",
    },
  ];

  return (
    <div className={`toolbar visibility-${props.visibility}`}>
      {tools.map(({ tool, icon, style }) => {
        return (
          <button
            className={tool === props.currentTool ? "active" : undefined}
            key={tool}
            onClick={(e) => props.switchTool(tool)}
          >
            <i className={`fas ${icon}`} style={style} />
          </button>
        );
      })}
    </div>
  );
};

export default Toolbar;
