import React from "react";
import ReactDOM from "react-dom";

import Overlay from "./components/Overlay";
import QBoard from "./lib/qboard";

import "./main.scss";

const qboard = new QBoard(
  document.querySelector("#QBoard"),
  document.querySelector("#BaseQBoard"),
  document.querySelector("#DropArea"),
  1600,
  900
);

ReactDOM.render(
  <Overlay qboard={qboard} />,
  document.querySelector("#Overlay")
);
