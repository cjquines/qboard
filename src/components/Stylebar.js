import React, { useEffect, useState } from "react";
import { Action } from "../lib/action";
import ButtonRow from "./ButtonRow";
import Icon from "./Icon";
import StyleMenu from "./StyleMenu";
const Stylebar = (props) => {
    const fileButton = React.createElement("button", { className: "inactive" }, Icon.file);
    const fileActions = [Action.Open, Action.Save, Action.Export];
    const [isFullscreen, setIsFullscreen] = useState(false);
    const otherActions = [
        Action.Copy,
        Action.Paste,
        Action.Help,
        !isFullscreen ? Action.EnterFullScreen : Action.ExitFullScreen,
    ];
    useEffect(() => {
        setIsFullscreen(Boolean(document.fullscreenElement));
        document.addEventListener("fullscreenchange", () => setIsFullscreen(Boolean(document.fullscreenElement)));
    }, []);
    return (React.createElement("div", { className: `stylebar visibility-${props.visibility}` },
        React.createElement(ButtonRow, { actions: fileActions, callback: props.doAction, cName: "file-actions", outerButton: fileButton }),
        React.createElement(StyleMenu, { currentStyle: props.currentStyle, doAction: props.doAction }),
        React.createElement(ButtonRow, { actions: otherActions, cName: "other-actions vertical", callback: props.doAction })));
};
export default Stylebar;
