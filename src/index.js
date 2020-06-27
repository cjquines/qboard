import React from "react";
import ReactDOM from "react-dom";

import Overlay from "./Overlay";
import { Page, PageContainer } from "./qboard";

import "./main.scss";

const page = new Page(
  document.getElementById("page"),
  1600,
  900
);
const container = new PageContainer(page);

ReactDOM.render(<Overlay container={container} />, document.querySelector('#overlay'));
