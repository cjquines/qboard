import React, { useState } from "react";
import { actionName } from "../lib/action";
import Icon from "./Icon";
/**
 * For keys whose bounding behavior cannot be changed;
 * these keys are already mapped to certain app events,
 * so the key diagram in the UI should not be a button.
 *
 * Use if it is meaningful to indicate the app behavior of this key.
 */
const UnbindableKey = ({ label = "", letter, width, }) => {
    return (React.createElement("div", { className: "key", style: { width: width } },
        React.createElement("span", { className: "letter" }, letter),
        React.createElement("div", { className: "action" },
            React.createElement("span", { className: "unassigned" }, label))));
};
const ModifierKey = (props) => {
    const [held, setHeld] = useState(false);
    return (React.createElement("button", { className: `key modifier ${held ? "held" : ""}`, onClick: () => {
            if (held)
                props.set.delete(props.letter);
            else
                props.set.add(props.letter);
            // this is yucky; i wonder whether there's a nice way around this
            props.replaceSet(new Set(props.set));
            setHeld(!held);
        }, style: { width: props.width } },
        React.createElement("div", { className: "action" },
            React.createElement("span", { className: "unassigned" }, props.label)),
        React.createElement("span", { className: "letter" }, props.letter)));
};
const Key = (props) => {
    return (React.createElement("button", { className: "key", onClick: (event) => props.onclick(props.letter, event), style: { width: props.width } },
        React.createElement("div", { className: "action" },
            props.action && Icon[props.action],
            React.createElement("span", { className: props.action === undefined ? "unassigned" : undefined }, props.action === undefined ? "none" : actionName(props.action))),
        React.createElement("span", { className: "letter" }, props.letter)));
};
/**
 * A keyboard UI component
 */
export const Keyboard = ({ rows, onclick, activeModifiers: modifiers, setActiveModifiers, ...attrs }) => {
    return (React.createElement("div", { ...attrs }, rows.map((row, index) => (React.createElement("div", { className: "row", key: index }, row.map((keyData) => keyData.type === "readonly" ? (React.createElement(UnbindableKey, { key: keyData.key, letter: keyData.key, label: keyData.value, width: keyData.width })) : keyData.type === "modifier" ? (React.createElement(ModifierKey, { key: keyData.key, letter: keyData.key, label: keyData.value, set: modifiers, replaceSet: setActiveModifiers, width: keyData.width })) : (React.createElement(Key, { key: keyData.key, letter: keyData.key, action: keyData.action, width: keyData.width, onclick: (key, event) => onclick(key, event) }))))))));
};
