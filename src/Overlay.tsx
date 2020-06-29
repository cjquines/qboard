import React, { useState } from "react";

import QBoard, { QBoardState } from "./qboard";
import { Tool } from "./tools";

interface OverlayProps {
  qboard: QBoard;
}

const Overlay = (props: OverlayProps) => {
  const qboard = props.qboard;

  const [state, setState] = useState<QBoardState>(qboard.getState());

  return (
    <div className="overlay">
      <div className="pagination">
        <span>
          {state.currentPage} / {state.totalPages}
        </span>
        <button
          onClick={() => {
            qboard.pages.previousPage().then(() => {
              setState(qboard.getState());
            });
          }}
        >
          prev
        </button>
        <button
          onClick={() => {
            qboard.pages.nextOrNewPage().then(() => {
              setState(qboard.getState());
            });
          }}
        >
          next
        </button>
      </div>
      <div className="toolbar">
        <button onClick={() => qboard.switchTool(Tool.Move)}>move</button>
        <button onClick={() => qboard.switchTool(Tool.Line)}>line</button>
        <button onClick={() => qboard.switchTool(Tool.Rectangle)}>
          rectangle
        </button>
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
