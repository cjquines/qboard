// Element that is child of Element
export type HTMLChildElement = HTMLElement & {
  parentElement: Element;
  parentNode: Element;
};
