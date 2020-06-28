import React from "react";

import { PageContainer } from "./qboard";

interface OverlayProps {
  container: PageContainer;
}

const Overlay = (props: OverlayProps) => {
  const container = props.container;

  return (
    <>
      <div className="pagination">
        <button onClick={container.newPage}>add</button>
        <button onClick={() => container.loadPage(0)}>zero</button>
        <button onClick={() => container.loadPage(1)}>one</button>
      </div>
      <div className="tools">
        
      </div>
    </>
  );
};

export default Overlay;
