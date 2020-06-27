import React from "react";

export default function Overlay(props) {
  const container = props.container;
  
  return (
    <div class="pagination">
      <button onClick={container.newPage}>add</button>
      <button onClick={() => container.loadPage(0)}>zero</button>
      <button onClick={() => container.loadPage(1)}>one</button>
    </div>
  );
}
