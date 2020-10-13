import React, { useEffect, useState } from "react";
import Modal from "react-modal";

import { Action } from "../lib/action";

import Bindings from "./Bindings";
import Icon from "./Icon";

Modal.setAppElement("#Overlay");

const HelpModal = (props: {
  bind: (key: string, action: Action) => void;
  unbind: (key: string) => void;
  reset: () => void;
  keyMap: any;
  isOpen: boolean;
  toggleOpen: () => void;
  isMobile: boolean;
  toggleMobility: () => void;
}) => {
  const [keyModifier, setKeyModifier] = useState("");
  const [leftHanded, setLeftHanded] = useState(false);

  const toggleHand = (): void => {
    setLeftHanded((leftHanded) => {
      localStorage.setItem("leftHanded", leftHanded ? "false" : "true");
      return !leftHanded;
    });
  };

  useEffect(() => {
    if (localStorage.getItem("leftHanded") === "true") {
      setLeftHanded(true);
    }
  }, []);

  return (
    <Modal
      className="modal"
      overlayClassName="modal-overlay help-modal"
      isOpen={props.isOpen}
    >
      <button className="close" onClick={(e) => props.toggleOpen()}>
        {Icon.close}
      </button>
      <p>
        <span style={{ fontSize: "1.5em", fontWeight: "bold" }}>qboard</span>{" "}
        <span style={{ color: "#666", marginLeft: "0.2em" }}>
          The efficient digital whiteboard.
        </span>
      </p>
      <p>
        Press <b>{leftHanded ? "0" : "1"}</b> to show or hide this screen.
      </p>
      <p>
        <button
          className={keyModifier === "" ? "active" : undefined}
          onClick={(e) => setKeyModifier("")}
        >
          unmodified
        </button>
        <button
          className={keyModifier === "shift" ? "active" : undefined}
          onClick={(e) => setKeyModifier("shift")}
        >
          with shift
        </button>
        <button
          className={keyModifier === "ctrl" ? "active" : undefined}
          onClick={(e) => setKeyModifier("ctrl")}
        >
          with ctrl
        </button>
        <button onClick={(e) => toggleHand()}>
          {leftHanded ? "make right-handed" : "make left-handed"}
        </button>
      </p>
      <Bindings
        bind={props.bind}
        unbind={props.unbind}
        keyMap={props.keyMap}
        modifier={keyModifier}
        leftHanded={leftHanded}
      />
      <p>
        Click a key to change the binding.{" "}
        <button onClick={(e) => props.reset()}>reset to default</button>
      </p>
      <p style={{ color: "#666" }}>
        By <a href="https://cjquines.com/">CJ Quines</a>. View on{" "}
        <a href="https://github.com/cjquines/qboard">Github</a>. Use{" "}
        <a onClick={(e) => props.toggleMobility()} tabIndex={0}>
          {props.isMobile ? "desktop" : "mobile"} site
        </a>
        .
      </p>
    </Modal>
  );
};

export default HelpModal;
