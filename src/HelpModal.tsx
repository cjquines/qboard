import React, { useState } from "react";
import Modal from "react-modal";
Modal.setAppElement("#Overlay");

import Bindings from "./Bindings";

const HelpModal = (props: { keyMap: any, isOpen: boolean }) => {
  const [keyModifier, setKeyModifier] = useState("");

  return (
    <Modal
      className="modal"
      overlayClassName="modal-overlay help-modal"
      isOpen={props.isOpen}
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
        keyMap={props.keyMap}
        modifier={keyModifier}
      />
      <p>
        Click a key to change the binding.{" "}
        <button onClick={(e) => null}>reset to default</button>
      </p>
      <p style={{ color: "#666" }}>
        By <a href="https://cjquines.com/">CJ Quines</a>. View on{" "}
        <a href="https://github.com/cjquines/qboard">Github</a>.
      </p>
    </Modal>
  );
};

export default HelpModal;
