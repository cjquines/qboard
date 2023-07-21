import React from "react";
import ReactTooltip from "react-tooltip";
import { actionName } from "../lib/action";
import Icon from "./Icon";
const OverlayButton = (props) => {
    return (React.createElement(React.Fragment, null,
        React.createElement("button", { className: props.className, "data-tip": true, "data-for": props.action, onClick: () => props.callback(props.action) }, Icon[props.action]),
        React.createElement(ReactTooltip, { backgroundColor: "#ddd", effect: "solid", id: props.action, place: "right", textColor: "#262626" }, actionName(props.action))));
};
export default OverlayButton;
