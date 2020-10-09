import React from "react";
import Modal from "react-modal";
Modal.setAppElement("#Overlay");

import { Action, actionName } from "../lib/action";

import Icon from "./Icon";

const nonBinding: Action[] = [
  Action.AddPage,
  Action.EnterFullScreen,
  Action.ExitFullScreen,
];

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
        {Icon.close}
      </button>
      <p>
        Changing <span className="binding">{props.letter}</span> binding…
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
            !nonBinding.includes(action) && (
              <button
                key={action}
                className={props.action === action ? "active" : undefined}
                onClick={(e) => props.callback(action)}
              >
                {Icon[action]}
                <span style={Icon[action] ? {} : { left: "0.25em" }}>
                  {actionName(action)}
                </span>
              </button>
            )
        )}
      </div>
    </Modal>
  );
};

export default BindingModal;
