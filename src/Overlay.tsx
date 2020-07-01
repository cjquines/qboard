import React, { useEffect, useState } from "react";
import keyboardJS from "keyboardjs";

import QBoard, { QBoardState } from "./qboard";
import { Tool } from "./tools";
import { Dash, Stroke, Fill } from "./styles";

import Toolbar from "./Toolbar";
import Pagination from "./Pagination";

export const enum Visibility {
  None,
  Condensed,
  Full,
}

const Overlay = (props: { qboard: QBoard }) => {
  const qboard = props.qboard;

  const [visibility, setVisibility] = useState(Visibility.Full);
  const [state, setState] = useState<QBoardState>({
    currentPage: 0,
    totalPages: 0,
    currentTool: Tool.Move,
  });

  useEffect(() => {
    qboard.callback = setState;
    qboard.updateState();

    keyboardJS.bind("q", (e) => {
      console.log("fire");
      setVisibility((visibility) => (visibility + 2) % 3);
    });
  }, []);

  return (
    <div className={`overlay visibility-${visibility}`}>
      <Toolbar
        switchTool={qboard.switchTool}
        currentTool={state.currentTool}
        visibility={visibility}
      />
      <Pagination
        previousPage={qboard.pages.previousPage}
        nextOrNewPage={qboard.pages.nextOrNewPage}
        loadPage={qboard.pages.loadPage}
        currentPage={state.currentPage}
        totalPages={state.totalPages}
        visibility={visibility}
      />
    </div>
  );
};

export default Overlay;
