import React, { useEffect, useState } from "react";
import keyboardJS from "keyboardjs";
import Modal from "react-modal";
Modal.setAppElement("#Overlay");

import QBoard, { QBoardState } from "./qboard";
import { Tool } from "./tools";
import { Dash, Stroke, Fill } from "./styles";
import { defaultKeys } from "./keyboard";

import Pagination from "./Pagination";
import UndoRedo from "./UndoRedo";
import Toolbar from "./Toolbar";
import Stylebar from "./Stylebar";
import Bindings from "./Bindings";

export const enum Visibility {
  None,
  Condensed,
  Full,
}

const Overlay = (props: { qboard: QBoard }) => {
  const qboard = props.qboard;

  const [visibility, setVisibility] = useState(Visibility.Full);
  const [modalOpen, setModalOpen] = useState(true);
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
      setModalOpen((modalOpen) => !modalOpen);
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
      <Modal
        className="modal"
        overlayClassName="modal-overlay"
        isOpen={modalOpen}
      >
        <p>
          <span style={{ fontSize: "1.5em", fontWeight: "bold" }}>qboard</span>{" "}
          <span style={{ color: "#666", marginLeft: "0.2em" }}>
            The whiteboard app with vim-inspired bindings.
          </span>
        </p>
        <p>
          Press <b>h</b> to show or hide this screen.
        </p>
        <p>
          Show: <button onClick={(e) => setKeyModifier("")}>unmodified</button>{" "}
          <button onClick={(e) => setKeyModifier("shift")}>with shift</button>{" "}
          <button onClick={(e) => setKeyModifier("ctrl")}>with ctrl</button>
        </p>
        <Bindings
          keyMap={state.keyMap}
          visibility={visibility}
          modifier={keyModifier}
        />
        <p style={{ color: "#666" }}>
          By <a href="https://cjquines.com/">CJ Quines</a>. View on{" "}
          <a href="https://github.com/cjquines/qboard">Github</a>.
        </p>
      </Modal>
    </div>
  );
};

export default Overlay;
