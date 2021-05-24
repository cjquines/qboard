import React, { useEffect, useState } from "react";
import Modal from "react-modal";

import { Action } from "../lib/action";
import { KeyMap } from "../lib/keyboard";

import Bindings from "./Bindings";
import Icon from "./Icon";

Modal.setAppElement("#Overlay");

const HelpModal = (props: {
  bind: (key: string, action: Action) => void;
  unbind: (key: string) => void;
  reset: () => void;
  keyMap: KeyMap;
  isOpen: boolean;
  toggleOpen: () => void;
  isMobile: boolean;
  // toggleMobility: () => void;
}): JSX.Element => {
  const [keyModifier, setKeyModifier] = useState("");

  return (
    <Modal
      className="modal"
      overlayClassName="modal-overlay help-modal"
      isOpen={props.isOpen}
    >
      <button className="close" onClick={() => props.toggleOpen()}>
        {Icon.close}
      </button>
      <p>
        <span style={{ fontSize: "1.5em", fontWeight: "bold" }}>qboard</span>{" "}
        <span style={{ color: "#666", marginLeft: "0.2em" }}>
          The efficient digital whiteboard.
        </span>
      </p>
      <p>
        Press <b>?</b> to show or hide this screen.
      </p>
      <Bindings bind={props.bind} unbind={props.unbind} keyMap={props.keyMap} />
      <p>
        Click a key to change the binding.{" "}
        <button onClick={() => props.reset()}>reset to default</button>
      </p>
      <p style={{ color: "#666" }}>
        By <a href="https://cjquines.com/">CJ Quines</a> and{" "}
        <a href="https://pihart.github.io/">Avi Mehra</a>. View on{" "}
        <a href="https://github.com/cjquines/qboard">Github</a>.
        {/* Use{" "}
        <a onClick={() => props.toggleMobility()} tabIndex={0}>
          {props.isMobile ? "desktop" : "mobile"} site
        </a>.*/}
      </p>
    </Modal>
  );
};

export default HelpModal;
