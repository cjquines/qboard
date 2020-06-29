import React from "react";

import QBoard from "./qboard";
import { Tool } from "./tools";

interface OverlayProps {
  qboard: QBoard;
}

const Overlay = (props: OverlayProps) => {
  const qboard = props.qboard;

  return (
    <div className="overlay">
      <div className="pagination">
        <span>{qboard.pages.pagesJson.length}</span>
        <button onClick={() => qboard.previousPage()}>prev</button>
        <button onClick={() => qboard.nextOrNewPage()}>next</button>
      </div>
      <div className="toolbar">
        <button onClick={() => qboard.switchTool(Tool.Move)}>move</button>
        <button onClick={() => qboard.switchTool(Tool.Line)}>line</button>
        <button onClick={() => qboard.switchTool(Tool.Rectangle)}>rectangle</button>
        <button onClick={() => qboard.switchTool(Tool.Ellipse)}>ellipse</button>
        <button onClick={() => qboard.switchTool(Tool.Pen)}>pen</button>
        <button onClick={() => qboard.switchTool(Tool.Eraser)}>eraser</button>
        <button onClick={() => qboard.history.undo()}>undo</button>
        <button onClick={() => qboard.history.redo()}>redo</button>
      </div>
    </div>
  );
};

export default Overlay;
