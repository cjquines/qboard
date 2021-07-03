import React from "react";

export interface VirtualElementProps<T extends HTMLElement> {
  /**
   * Your own callback so that you can record the reference {@param ref} to the input.
   * That way, you can
   * invoke `click()` (and therefore open a file dialog) or
   * render to a canvas
   * programmatically.
   */
  captureRef?: (ref: React.RefObject<T>) => void;
}
