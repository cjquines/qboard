import React from "react";
import Modal from "react-modal";
Modal.setAppElement("#Overlay");

import { Action } from "../lib/action";

import { nameMap } from "./Bindings";
import Icon from "./Icon";

const BindingModal = (props: {
  letter: string;
  action: Action | null;
  close: () => void;
  callback: (action: Action | null) => void;
}) => {
  return (
    <Modal
      className="modal"
      overlayClassName="modal-overlay binding-modal"
      isOpen={props.letter !== ""}
    >
      <button className="close" onClick={(e) => props.close()}>
        <i className="fas fa-times-circle" />
      </button>
      <p>
        changing <b>{props.letter}</b> binding
      </p>
      <div className="tools">
        <button
          className={props.action === undefined ? "active" : undefined}
          onClick={(e) => props.callback(null)}
        >
          <span style={{ left: "0.25em" }}>none</span>
        </button>
        {Object.values(Action).map(
          (action) =>
            action !== Action.AddPage && (
              <button
                key={action}
                className={props.action === action ? "active" : undefined}
                onClick={(e) => props.callback(action)}
              >
                {Icon[action]}
                <span style={Icon[action] ? {} : { left: "0.25em" }}>
                  {nameMap[action] || action}
                </span>
              </button>
            )
        )}
      </div>
    </Modal>
  );
};

export default BindingModal;
