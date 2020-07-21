import React, { useEffect, useState } from "react";
import keyboardJS from "keyboardjs";

import QBoard, { QBoardState } from "./qboard";
import { Tool } from "./tools";
import { Dash, Stroke, Fill } from "./styles";
import { defaultKeys } from "./keyboard";

import Pagination from "./Pagination";
import UndoRedo from "./UndoRedo";
import Toolbar from "./Toolbar";
import Stylebar from "./Stylebar";
import HelpModal from "./HelpModal";

export const enum Visibility {
  None,
  Condensed,
  Full,
}

const Overlay = (props: { qboard: QBoard }) => {
  const qboard = props.qboard;

  const [visibility, setVisibility] = useState(Visibility.Full);
  const [helpModalOpen, setHelpModalOpen] = useState(true);
  const [keyModifier, setKeyModifier] = useState("");

  const [state, setState] = useState<QBoardState>({
    currentPage: 0,
    totalPages: 0,
    currentTool: Tool.Move,
    currentStyle: {
      dash: Dash.Solid,
      stroke: Stroke.Black,
      fill: Fill.Transparent,
    },
    canUndo: false,
    canRedo: false,
    keyMap: defaultKeys,
  });

  useEffect(() => {
    qboard.callback = setState;
    qboard.updateState();

    keyboardJS.bind("tab", (e) => {
      setVisibility((visibility) => (visibility + 2) % 3);
    });

    keyboardJS.bind("h", (e) => {
      setHelpModalOpen((helpModalOpen) => !helpModalOpen);
    });
  }, []);

  return (
    <div className={`overlay visibility-${visibility}`}>
      <Pagination
        loadPage={qboard.pages.loadPage}
        currentPage={state.currentPage}
        totalPages={state.totalPages}
        doAction={qboard.action.doAction}
        visibility={visibility}
      />
      <UndoRedo
        canUndo={state.canUndo}
        canRedo={state.canRedo}
        doAction={qboard.action.doAction}
        visibility={visibility}
      />
      <Toolbar
        currentTool={state.currentTool}
        doAction={qboard.action.doAction}
        visibility={visibility}
      />
      <Stylebar
        currentStyle={state.currentStyle}
        doAction={qboard.action.doAction}
        visibility={visibility}
      />
      <HelpModal
        bind={qboard.keyboard.bind}
        unbind={qboard.keyboard.unbind}
        reset={qboard.keyboard.reset}
        keyMap={state.keyMap}
        isOpen={helpModalOpen}
      />
    </div>
  );
};

export default Overlay;
