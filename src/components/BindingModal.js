import React from "react";
import Modal from "react-modal";
import { Action, actionName } from "../lib/action";
import Icon from "./Icon";
Modal.setAppElement("#Overlay");
const nonBinding = [
    Action.AddPageStart,
    Action.AddPageEnd,
    Action.EnterFullScreen,
    Action.ExitFullScreen,
];
const BindingModal = (props) => (React.createElement(Modal, { className: "modal", overlayClassName: "modal-overlay binding-modal", isOpen: props.letter !== "" },
    React.createElement("button", { className: "close", onClick: () => props.close() }, Icon.close),
    React.createElement("p", null,
        "Changing ",
        React.createElement("span", { className: "binding" }, props.letter),
        " binding\u2026"),
    React.createElement("div", { className: "tools" },
        React.createElement("button", { className: props.action === undefined ? "active" : undefined, onClick: () => props.callback(null) },
            React.createElement("span", { style: { left: "0.25em" } }, "none")),
        Object.values(Action)
            .filter((action) => !nonBinding.includes(action))
            .map((action) => (React.createElement("button", { key: action, className: props.action === action ? "active" : undefined, onClick: () => props.callback(action) },
            Icon[action],
            React.createElement("span", { style: Icon[action] ? {} : { left: "0.25em" } }, actionName(action))))))));
export default BindingModal;
