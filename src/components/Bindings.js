import React, { useState } from "react";
import Modal from "react-modal";
import BindingModal from "./BindingModal";
import { Keyboard } from "./Keyboard";
Modal.setAppElement("#Overlay");
const Bindings = (props) => {
    const [bindingHotkey, setBindingHotkey] = useState("");
    const [hotkeyAction, setHotkeyAction] = useState(null);
    const [modifiers, setModifiers] = useState(new Set());
    const modify = (key) => [
        ...Array.from(modifiers).sort(),
        key,
    ].join(" + ");
    const Key = (key) => ({
        key,
        action: props.keyMap[modify(key)],
    });
    const Keys = (...keys) => keys.map(Key);
    const rows = [
        [
            { ...Key("`"), width: "3em" },
            ...Keys("1", "2", "3", "4", "5", "6", "7", "8", "9", "0"),
        ],
        [
            { type: "readonly", key: "tab", value: "Hide Toolbar", width: "4.5em" },
            ...Keys("q", "w", "e", "r", "t", "y", "u", "i", "o", "p"),
        ],
        [
            { ...Key("esc"), width: "6em" },
            ...Keys("a", "s", "d", "f", "g", "h", "j", "k", "l", ";"),
        ],
        [
            { type: "modifier", key: "shift", value: "Snap", width: "7.5em" },
            ...Keys("z", "x", "c", "v", "b", "n", "m", "/"),
            { type: "modifier", key: "ctrl" },
            { type: "modifier", key: "alt" },
        ],
    ];
    const keyHandler = (key) => {
        const modified = modify(key);
        setBindingHotkey(modified);
        setHotkeyAction(props.keyMap[modified]);
    };
    return (React.createElement(React.Fragment, null,
        React.createElement(Keyboard, { rows: rows, className: "bindings", onclick: keyHandler, activeModifiers: modifiers, setActiveModifiers: setModifiers }),
        React.createElement(BindingModal, { letter: bindingHotkey, action: hotkeyAction, close: () => setBindingHotkey(""), callback: (action) => {
                props.unbind(bindingHotkey);
                if (action)
                    props.bind(bindingHotkey, action);
                setBindingHotkey("");
            } })));
};
export default Bindings;
