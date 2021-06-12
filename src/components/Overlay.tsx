import React, { useEffect, useState } from "react";
import keyboardJS from "keyboardjs";

import QBoard, { QBoardState } from "../lib/qboard";
import { Dash, Fill, Stroke } from "../lib/styles";
import { defaultKeys } from "../lib/keyboard";

import Pagination from "./Pagination";
import UndoRedo from "./UndoRedo";
import Toolbar from "./Toolbar";
import Stylebar from "./Stylebar";
import HelpModal from "./HelpModal";
import ContextMenu from "./ContextMenu";
import VirtualFileInput from "./VirtualFileInput";

export const enum Visibility {
  None,
  Condensed,
  Full,
}

const Overlay = ({ qboard }: { qboard: QBoard }): JSX.Element => {
  const [visibility, setVisibility] = useState<Visibility>(Visibility.Full);
  const [helpModalOpen, setHelpModalOpen] = useState(false);
  // const [isMobile, setMobility] = useState(false);
  const isMobile = true;

  const [state, setState]: [
    QBoardState,
    React.Dispatch<React.SetStateAction<QBoardState>>
  ] = useState<QBoardState>({
    dragActive: false,
    currentPage: 0,
    totalPages: 0,
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
    setHelpModalOpen((wasOpen) => {
      window.localStorage.setItem("helpModalOpen", wasOpen ? "false" : "true");
      return !wasOpen;
    });
  };

  // Code is temporarily dead as a result of https://github.com/cjquines/qboard/issues/91;
  // Commenting so it can get erased in build
  /*const toggleMobility = (): void => {
    setMobility((wasMobile) => {
      window.localStorage.setItem("isMobile", wasMobile ? "false" : "true");
      return !wasMobile;
    });
  };*/

  useEffect(() => {
    if (window.localStorage.getItem("helpModalOpen") !== "false") {
      setHelpModalOpen(true);
    }
    // if (window.localStorage.getItem("isMobile") !== "false") {
    //   setMobility(true);
    // }

    qboard.callback = setState;
    qboard.globalState.toggleHelpModal = toggleOpen;
    qboard.updateState();

    keyboardJS.bind("tab", () => {
      setVisibility((currentVisibility) => (currentVisibility + 2) % 3);
    });
  }, []);

  return (
    <>
      <VirtualFileInput
        acceptFiles={async (file) =>
          qboard.history.execute((await qboard.files.acceptFile(file)).history)
        }
        captureRef={(ref) => {
          qboard.globalState.fileInputRef = ref;
        }}
        multiple
        accept="application/json, application/pdf, image/*"
      />
      <div className={`drop-area ${state.dragActive ? "active" : ""}`} />
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
          currentTool={qboard.activeTool}
          tools={qboard.tools}
          doAction={qboard.action.doAction}
          visibility={visibility}
        />
        <Stylebar
          currentStyle={state.currentStyle}
          doAction={qboard.action.doAction}
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
          // toggleMobility={toggleMobility}
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
