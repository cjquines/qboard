import React from "react";
import Modal from "react-modal";
import Bindings from "./Bindings";
import Icon from "./Icon";
Modal.setAppElement("#Overlay");
const HelpModal = (props) => (React.createElement(Modal, { className: "modal", overlayClassName: "modal-overlay help-modal", isOpen: props.isOpen },
    React.createElement("button", { className: "close", onClick: () => props.toggleOpen() }, Icon.close),
    React.createElement("p", null,
        React.createElement("span", { style: { fontSize: "1.5em", fontWeight: "bold" } }, "qboard"),
        React.createElement("span", { style: { color: "#666", marginLeft: "0.5em" } }, "The efficient digital whiteboard."),
        React.createElement("span", { style: { color: "#000", marginLeft: "0.5em" } },
            "Press ",
            React.createElement("b", null, "?"),
            " to show or hide this screen.")),
    React.createElement(Bindings, { bind: props.bind, unbind: props.unbind, keyMap: props.keyMap }),
    React.createElement("div", { style: { display: "flex", justifyContent: "space-between" } },
        React.createElement("p", null,
            "Click a key to change the binding.",
            " ",
            React.createElement("button", { onClick: () => props.reset() }, "reset to default")),
        React.createElement("p", { style: {
                color: "#666",
            } },
            "By ",
            React.createElement("a", { href: "https://cjquines.com/" }, "CJ Quines"),
            " and",
            " ",
            React.createElement("a", { href: "https://pihart.github.io/" }, "Avi Mehra"),
            ". View on",
            " ",
            React.createElement("a", { href: "https://github.com/cjquines/qboard" }, "GitHub"),
            "."))));
export default HelpModal;
