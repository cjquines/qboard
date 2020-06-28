import React from "react";

import QBoard, { Tool } from "./qboard";

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
      </div>
    </div>
  );
};

export default Overlay;
