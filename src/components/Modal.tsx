import Modal from "react-modal";
import Icon from "./Icon";
import React from "react";
import { Async } from "@mehra/ts";

export const ClosableModal = ({
  close,
  icon = Icon.close,
  children,
  className,
  overlayClassName,
  ...attrs
}: React.PropsWithChildren<
  {
    close: () => Async;
    icon?: JSX.Element;
  } & Modal.Props
>): JSX.Element => (
  <Modal
    className={`modal ${className}`}
    overlayClassName={`modal-overlay ${overlayClassName}`}
    {...attrs}
  >
    <button className="close" onClick={() => close()}>
      {icon}
    </button>
    {children}
  </Modal>
);

export default ClosableModal;
