import React from "react";
import OverlayButton from "./OverlayButton";
const ButtonRow = (props) => {
    return (React.createElement("div", { className: `button-row ${props.cName} ${props.outerButton ? "button-row-hover" : ""}` },
        props.outerButton,
        React.createElement("div", { className: "button-row-inner" }, props.actions.map((action, i) => {
            var _a;
            return (React.createElement(OverlayButton, { action: action, className: (_a = props.className) === null || _a === void 0 ? void 0 : _a.call(props, action, i), callback: props.callback, key: action }));
        }))));
};
export default ButtonRow;
