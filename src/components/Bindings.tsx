import React, { useState } from "react";
import Modal from "react-modal";

import { Action } from "../lib/action";
import { KeyMap } from "../lib/keyboard";

import BindingModal from "./BindingModal";
import { Keyboard, UIKeyDescriptor } from "./Keyboard";
import { NonEmptyArray } from "@mehra/ts";

Modal.setAppElement("#Overlay");

const Bindings = (props: {
  bind: (key: string, action: Action) => void;
  unbind: (key: string) => void;
  keyMap: KeyMap;
  leftHanded: boolean;
}): JSX.Element => {
  const [bindingModalKeys, setBindingModalKeys]: [
    string,
    React.Dispatch<React.SetStateAction<string>>
  ] = useState<string>("");
  const [bindingModalAction, setBindingModalAction] = useState<Action | null>(
    null
  );

  const rows: Readonly<
    NonEmptyArray<Readonly<NonEmptyArray<UIKeyDescriptor>>>
  > = [
    [
      { key: "`", action: props.keyMap["`"] }, // this is on its own line so I don't need to fight with typescript for it to know that the array is NonEmptyArray
      ...["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"].map((key) => ({
        key,
        action: props.keyMap[key],
      })),
    ],
    [
      { type: "readonly", key: "tab", value: "Hide Toolbar", width: "4.5em" },
      ...["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"].map((key) => ({
        key,
        action: props.keyMap[key],
      })),
    ],
    [
      { type: "readonly", key: "esc", value: "Deselect", width: "6em" },
      ...["a", "s", "d", "f", "g", "h", "j", "k", "l"].map((key) => ({
        key,
        action: props.keyMap[key],
      })),
    ],
    [
      { type: "modifier", key: "shift", value: "Snap", width: "7.5em" },
      ...["z", "x", "c", "v", "b", "n", "m", "?"].map((key) => ({
        key,
        action: props.keyMap[key],
      })),
      { type: "modifier", key: "ctrl", width: "6em" },
    ],
  ];

  const keyHandler = ({
    key,
    modifiers,
  }: {
    key: string;
    modifiers: Set<string>;
  }): void => {
    const modified = [
      ...Array.from(modifiers).sort(), // these are such small arrays that performance doesn't really matter
      key,
    ].join(" + ");
    setBindingModalKeys(modified);
    setBindingModalAction(props.keyMap[modified]);
  };

  return (
    <>
      <Keyboard rows={rows} className={"bindings"} onclick={keyHandler} />
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
