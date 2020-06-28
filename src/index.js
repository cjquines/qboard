import React from "react";
import ReactDOM from "react-dom";

import Overlay from "./Overlay";
import QBoard from "./qboard";

import "./main.scss";

const qboard = new QBoard(document.querySelector("#QBoard"), 1600, 900);

ReactDOM.render(
  <Overlay qboard={qboard} />,
  document.querySelector("#Overlay")
);
