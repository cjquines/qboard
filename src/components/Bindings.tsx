import React, { useState } from "react";
import Modal from "react-modal";

import { Action, actionName } from "../lib/action";
import { KeyMap } from "../lib/keyboard";

import Icon from "./Icon";
import BindingModal from "./BindingModal";

Modal.setAppElement("#Overlay");

/**
 * For keys whose bounding behavior cannot be changed;
 * these keys are already mapped to certain app events,
 * so the key diagram in the UI should not be a button.
 *
 * Use if it is meaningful to indicate the app behavior of this key.
 */
const UnbindableKey = ({
  label = "",
  letter,
  width,
}: {
  letter: string;
  label?: string;
  width?: string;
}) => {
  return (
    <div className="key" style={{ width: width }}>
      <span className="letter">{letter}</span>
      <div className="action">
        <span className="unassigned">{label}</span>
      </div>
    </div>
  );
};

const Key = (props: {
  letter: string;
  action?: Action;
  callback: (key: string) => void;
}) => {
  return (
    <button className="key" onClick={() => props.callback(props.letter)}>
      <div className="action">
        {props.action && Icon[props.action]}
        <span className={props.action === undefined ? "unassigned" : undefined}>
          {props.action === undefined ? "none" : actionName(props.action)}
        </span>
      </div>
      <span className="letter">{props.letter}</span>
    </button>
  );
};

const Bindings = (props: {
  bind: (key: string, action: Action) => void;
  unbind: (key: string) => void;
  keyMap: KeyMap;
  modifier: string;
  leftHanded: boolean;
}): JSX.Element => {
  const [bindingModalKeys, setBindingModalKeys]: [
    string,
    React.Dispatch<React.SetStateAction<string>>
  ] = useState<string>("");
  const [bindingModalAction, setBindingModalAction] = useState<Action | null>(
    null
  );

  const rows = [
    {
      header: <UnbindableKey letter="tab" label="Hide Toolbar" width="4.5em" />,
      letters: "qwert".split(""),
    },
    {
      header: <UnbindableKey letter="esc" label="Deselect" width="6em" />,
      letters: "asdfg".split(""),
    },
    {
      header: <UnbindableKey letter="shift" label="Snap" width="7.5em" />,
      letters: "zxcvb".split(""),
    },
  ];

  const getModified = (letter: string): string =>
    props.modifier === "" ? letter : `${props.modifier} + ${letter}`;

  const keyHandler = (letter: string): void => {
    setBindingModalKeys(getModified(letter));
    setBindingModalAction(props.keyMap[getModified(letter)]);
  };

  return (
    <>
      <div className="bindings">
        {rows.map(({ header, letters }, index) => (
          <div className={`row ${props.leftHanded ? "left" : ""}`} key={index}>
            {!props.leftHanded && header}
            {(props.leftHanded ? letters.reverse() : letters).map((letter) => (
              <Key
                key={letter}
                letter={letter}
                action={props.keyMap[getModified(letter)]}
                callback={keyHandler}
              />
            ))}
            {props.leftHanded && header}
          </div>
        ))}
      </div>
      <BindingModal
        letter={bindingModalKeys}
        action={bindingModalAction}
        close={() => setBindingModalKeys("")}
        callback={(action) => {
          props.unbind(bindingModalKeys);
          if (action) props.bind(bindingModalKeys, action);
          setBindingModalKeys("");
        }}
      />
    </>
  );
};

export default Bindings;
