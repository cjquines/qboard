// Element that is child of Element
export type HTMLChildElement<T extends Element = Element> = HTMLElement & {
  parentElement: T;
  parentNode: T;
};
