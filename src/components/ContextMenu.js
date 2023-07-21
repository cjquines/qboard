import React, { useEffect, useState } from "react";
import StyleMenu from "./StyleMenu";
const ContextMenu = (props) => {
    const [coords, setCoords] = useState(null);
    useEffect(() => {
        document.addEventListener("contextmenu", (e) => {
            if (e.target.classList.contains("upper-canvas")) {
                e.preventDefault();
                e.stopPropagation();
                setCoords((oldCoords) => (oldCoords ? null : [e.clientX, e.clientY]));
            }
        });
        document.addEventListener("click", () => setCoords(null));
    }, []);
    return coords ? (React.createElement("div", { className: "context-menu", style: {
            top: `calc(${coords[1]}px - 2.8em)`,
            left: `calc(${coords[0]}px - 1.1em)`,
        } },
        React.createElement(StyleMenu, { currentStyle: props.currentStyle, doAction: (action) => props.doAction(action), inContext: true }))) : null;
};
export default ContextMenu;
