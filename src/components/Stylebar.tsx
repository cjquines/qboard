import { useEffect, useState } from "react";

import { Style } from "../lib/styles";
import { Action } from "../lib/action";

import { Visibility } from "./Overlay";
import ButtonRow from "./ButtonRow";
import Icon from "./Icon";
import StyleMenu from "./StyleMenu";

const Stylebar = (props: {
  currentStyle: Style;
  doAction: (action: Action) => void;
  visibility: Visibility;
  isMobile: boolean;
}) => {
  const fileButton = <button className="inactive">{Icon.file}</button>;
  const fileActions = [Action.Open, Action.Save, Action.Export];

  const [isFullscreen, setIsFullscreen] = useState(false);

  const otherActions = [
    Action.Copy,
    Action.Paste,
    Action.Bindings,
    !isFullscreen ? Action.EnterFullScreen : Action.ExitFullScreen,
  ];

  useEffect(() => {
    setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", () =>
      setIsFullscreen(Boolean(document.fullscreenElement)),
    );
  }, []);

  return (
    <div className={`stylebar visibility-${props.visibility}`}>
      <ButtonRow
        actions={fileActions}
        callback={props.doAction}
        cName="file-actions"
        outerButton={fileButton}
      />
      <StyleMenu currentStyle={props.currentStyle} doAction={props.doAction} />
      <ButtonRow
        actions={otherActions}
        cName="other-actions vertical"
        callback={props.doAction}
      />
    </div>
  );
};

export default Stylebar;
