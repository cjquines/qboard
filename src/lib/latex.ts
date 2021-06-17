import { MalformedExpressionException } from "@mehra/ts";
import TeXToSVG from "tex-to-svg";

export class LaTeXError extends MalformedExpressionException {
  /**
   * @param errorText Error text provided by MathJax
   * @param sourceTeX
   * @param node The error node in the parsed SVG
   */
  constructor(
    public errorText: string,
    public sourceTeX?: string,
    public node?: Element
  ) {
    super(
      sourceTeX === undefined
        ? errorText
        : `${errorText}

in LaTeX ${sourceTeX}`
    );
  }
}

/**
 * If MathJax refused to properly render some TeX,
 * and told us with a data tag in the emitted SVG,
 * we return important fields from this data tag.
 * Otherwise, we return `null`.
 * @param SVG The MathJax response as `image/svg+xml`
 */
function getErrorFromSVG(
  SVG: string
): null | {
  errorText: string;
  sourceText: string | undefined;
  MathJaxErrorNode: Element;
} {
  const MathJaxErrorNode = new window.DOMParser()
    .parseFromString(SVG, "image/svg+xml")
    .querySelector('[data-mml-node="merror"]');

  if (MathJaxErrorNode === null) return null;

  const errorText = MathJaxErrorNode.getAttribute("title")!;
  const sourceText =
    MathJaxErrorNode.querySelector('[data-mml-node="mtext"] text')
      ?.textContent ?? undefined;
  return { errorText, sourceText, MathJaxErrorNode };
}

/**
 * Tries to render the TeX from {@param tex} as an SVG in text mode
 * @return The MathJax response as a data URL in the form of `image/svg+xml`
 * @throws [[`LaTeXError`]] if MathJax refused to properly render the TeX due to an error
 */
export default function TeXToDataURL(
  tex: string
): `data:image/svg+xml,${string}` {
  const SVG = TeXToSVG(`\\text{${tex}}`);

  const error = getErrorFromSVG(SVG);

  if (error !== null) {
    throw new LaTeXError(
      error.errorText,
      error.sourceText,
      error.MathJaxErrorNode
    );
  }

  return `data:image/svg+xml,${encodeURIComponent(SVG)}` as const;
}
