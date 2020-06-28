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
        <button onClick={qboard.pages.newPage}>add</button>
        <button onClick={() => qboard.pages.loadPage(0)}>zero</button>
        <button onClick={() => qboard.pages.loadPage(1)}>one</button>
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
