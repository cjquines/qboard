import React, { useEffect, useState } from "react";
import keyboardJS from "keyboardjs";

import QBoard, { QBoardState } from "../lib/qboard";
import { Tool } from "../lib/tools";
import { Dash, Stroke, Fill } from "../lib/styles";
import { defaultKeys } from "../lib/keyboard";

import Pagination from "./Pagination";
import UndoRedo from "./UndoRedo";
import Toolbar from "./Toolbar";
import Stylebar from "./Stylebar";
import HelpModal from "./HelpModal";
import ContextMenu from "./ContextMenu";

export const enum Visibility {
  None,
  Condensed,
  Full,
}

const Overlay = (props: { qboard: QBoard }) => {
  const qboard = props.qboard;

  const [visibility, setVisibility] = useState<Visibility>(Visibility.Full);
  const [helpModalOpen, setHelpModalOpen] = useState<boolean>(false);
  const [isMobile, setMobility] = useState<boolean>(false);

  const [state, setState]: [
    QBoardState,
    React.Dispatch<React.SetStateAction<QBoardState>>
  ] = useState<QBoardState>({
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

  const toggleOpen = (): void => {
    setHelpModalOpen((helpModalOpen) => {
      localStorage.setItem("helpModalOpen", helpModalOpen ? "false" : "true");
      return !helpModalOpen;
    });
  };

  const toggleMobility = (): void => {
    setMobility((isMobile) => {
      localStorage.setItem("isMobile", isMobile ? "false" : "true");
      return !isMobile;
    });
  };

  useEffect(() => {
    if (localStorage.getItem("helpModalOpen") !== "false") {
      setHelpModalOpen(true);
    }
    if (localStorage.getItem("isMobile") !== "false") {
      setMobility(true);
    }

    qboard.callback = setState;
    qboard.updateState();

    keyboardJS.bind("tab", (e) => {
      setVisibility((visibility) => (visibility + 2) % 3);
    });

    keyboardJS.bind("1", (e) => toggleOpen());
    keyboardJS.bind("0", (e) => toggleOpen());
  }, []);

  return (
    <>
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
          openFile={qboard.pages.openFile}
          visibility={visibility}
          isMobile={isMobile}
        />
        <HelpModal
          bind={qboard.keyboard.bind}
          unbind={qboard.keyboard.unbind}
          reset={qboard.keyboard.reset}
          keyMap={state.keyMap}
          isOpen={helpModalOpen}
          toggleOpen={toggleOpen}
          isMobile={isMobile}
          toggleMobility={toggleMobility}
        />
      </div>
      <ContextMenu
        currentStyle={state.currentStyle}
        doAction={qboard.action.doAction}
      />
    </>
  );
};

export default Overlay;
