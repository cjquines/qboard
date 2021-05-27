import React from "react";
import Modal from "react-modal";

import { Action, actionName } from "../lib/action";

import Icon from "./Icon";
import ClosableModal from "./Modal";

Modal.setAppElement("#Overlay");

const nonBinding: Action[] = [
  Action.AddPageStart,
  Action.AddPageEnd,
  Action.EnterFullScreen,
  Action.ExitFullScreen,
];

const BindingModal = (props: {
  letter: string;
  action: Action | null;
  close: () => void;
  callback: (action: Action | null) => void;
}): JSX.Element => (
  <ClosableModal
    overlayClassName="binding-modal"
    isOpen={props.letter !== ""}
    close={props.close}
  >
    <p>
      Changing <span className="binding">{props.letter}</span> binding…
    </p>
    <div className="tools">
      <button
        className={props.action === undefined ? "active" : undefined}
        onClick={() => props.callback(null)}
      >
        <span style={{ left: "0.25em" }}>none</span>
      </button>
      {Object.values(Action)
        .filter((action) => !nonBinding.includes(action))
        .map((action) => (
          <button
            key={action}
            className={props.action === action ? "active" : undefined}
            onClick={() => props.callback(action)}
          >
            {Icon[action]}
            <span style={Icon[action] ? {} : { left: "0.25em" }}>
              {actionName(action)}
            </span>
          </button>
        ))}
    </div>
  </ClosableModal>
);

export default BindingModal;
