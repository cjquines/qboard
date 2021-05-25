import React, { useState } from "react";
import Modal from "react-modal";

import { Action } from "../lib/action";
import { KeyMap } from "../lib/keyboard";

import { Key, UnbindableKey } from "./Keyboard";
import BindingModal from "./BindingModal";

Modal.setAppElement("#Overlay");

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
                onclick={keyHandler}
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
