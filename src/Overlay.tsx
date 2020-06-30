import React, { useState, useEffect } from "react";

import QBoard, { QBoardState } from "./qboard";
import { Tool } from "./tools";
import { Dash, Stroke, Fill } from "./styles";

interface OverlayProps {
  qboard: QBoard;
}

const Overlay = (props: OverlayProps) => {
  const qboard = props.qboard;
  const [state, setState] = useState<QBoardState>({
    currentPage: 0,
    totalPages: 0,
  });

  useEffect(() => {
    qboard.callback = setState;
    qboard.updateState();
  }, []);

  return (
    <div className="overlay">
      <div className="pagination">
        <span>
          {state.currentPage} / {state.totalPages}
        </span>
        <button onClick={() => {
          qboard.pages.export()
        }}>print?</button>
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
        <button onClick={() => qboard.clipboard.copy()}>copy</button>
        <button onClick={() => qboard.clipboard.paste()}>paste</button>
      </div>
    </div>
  );
};

export default Overlay;
