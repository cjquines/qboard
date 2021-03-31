import React from "react";
import ReactDOM from "react-dom";

import Overlay from "./components/Overlay";
import QBoard from "./lib/qboard";

import "./main.scss";

// The live [[`QBoard`]] instance, exposed to the public as a basic developer interface.
// Technically, the developer-user gets less control over private fields,
// but from a power user standpoint this is likely not an issue;
// no user should be writing scripts that depend on private fields.
window.qboard = new QBoard(
  document.querySelector("#QBoard"),
  document.querySelector("#BaseQBoard"),
  1600,
  900
);

ReactDOM.render(
  <Overlay qboard={window.qboard} />,
  document.querySelector("#Overlay")
);
