import React, { useState } from "react";
import Modal from "react-modal";
Modal.setAppElement("#Overlay");

import Bindings from "./Bindings";
import Icon from "./Icon";

const HelpModal = (props: {
  bind: (string, Action) => void;
  unbind: (string) => void;
  reset: () => void;
  keyMap: any;
  isOpen: boolean;
  toggleOpen: () => void;
}) => {
  const [keyModifier, setKeyModifier] = useState("");

  return (
    <Modal
      className="modal"
      overlayClassName="modal-overlay help-modal"
      isOpen={props.isOpen}
    >
      <button className="close" onClick={(e) => props.toggleOpen()}>{Icon.close}</button>
      <p>
        <span style={{ fontSize: "1.5em", fontWeight: "bold" }}>qboard</span>{" "}
        <span style={{ color: "#666", marginLeft: "0.2em" }}>
          The efficient digital whiteboard.
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
        bind={props.bind}
        unbind={props.unbind}
        keyMap={props.keyMap}
        modifier={keyModifier}
      />
      <p>
        Click a key to change the binding.{" "}
        <button onClick={(e) => props.reset()}>reset to default</button>
      </p>
      <p style={{ color: "#666" }}>
        By <a href="https://cjquines.com/">CJ Quines</a>. View on{" "}
        <a href="https://github.com/cjquines/qboard">Github</a>.
      </p>
    </Modal>
  );
};

export default HelpModal;
