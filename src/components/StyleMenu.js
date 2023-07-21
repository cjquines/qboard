import React from "react";
import { Action } from "../lib/action";
import Icon from "./Icon";
import ButtonRow from "./ButtonRow";
const DashStyle = ({ dashStyle, callback, inContext = false, }) => {
    const dashes = [Action.Solid, Action.Dashed, Action.Dotted];
    const button = (React.createElement("button", { className: "inactive" }, Icon[dashes[dashStyle]]));
    return (React.createElement(ButtonRow, { actions: dashes, className: (action, i) => {
            if (inContext && dashStyle === i)
                return "active";
        }, callback: callback, outerButton: !inContext && button }));
};
const StrokeStyle = ({ strokeStyle, callback, inContext = false, }) => {
    const strokes = [
        Action.Black,
        Action.Blue,
        Action.Green,
        Action.Yellow,
        Action.Orange,
    ];
    const strokeMap = [
        "#000000" /* Stroke.Black */,
        "#0097f6" /* Stroke.Blue */,
        "#00b253" /* Stroke.Green */,
        "#ffbf00" /* Stroke.Yellow */,
        "#ff2600" /* Stroke.Orange */,
    ];
    const button = (React.createElement("button", { className: "inactive" },
        React.createElement("i", { className: "fas fa-circle", style: { color: strokeStyle } })));
    return (React.createElement(ButtonRow, { actions: strokes, className: (action, i) => {
            if (inContext && strokeStyle === strokeMap[i])
                return "active";
        }, callback: callback, outerButton: !inContext && button }));
};
const FillStyle = ({ fillStyle, callback, inContext = false, }) => {
    const fills = [Action.Transparent, Action.Filled, Action.HalfFilled];
    const button = React.createElement("button", { className: "inactive" }, Icon[fills[fillStyle]]);
    return (React.createElement(ButtonRow, { actions: fills, className: (action, i) => {
            if (inContext && fillStyle === i)
                return "active";
        }, callback: callback, outerButton: !inContext && button }));
};
const StyleMenu = (props) => {
    return (React.createElement(React.Fragment, null,
        React.createElement(DashStyle, { dashStyle: props.currentStyle.dash, callback: props.doAction, inContext: props.inContext }),
        React.createElement(StrokeStyle, { strokeStyle: props.currentStyle.stroke, callback: props.doAction, inContext: props.inContext }),
        React.createElement(FillStyle, { fillStyle: props.currentStyle.fill, callback: props.doAction, inContext: props.inContext })));
};
export default StyleMenu;
