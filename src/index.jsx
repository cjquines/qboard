import ReactDOM from "react-dom/client";

import Overlay from "./components/Overlay";
import QBoard from "./lib/qboard";

import "./main.scss";

// The live [[`QBoard`]] instance, exposed to the public as a basic developer interface
window.qboard = new QBoard(
  document.querySelector("#QBoard"),
  document.querySelector("#BaseQBoard"),
  1600,
  900,
);

const root = ReactDOM.createRoot(document.querySelector("#Overlay"));
root.render(<Overlay qboard={window.qboard} />);
