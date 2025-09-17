import { liteAdaptor } from "@mathjax/src/mjs/adaptors/liteAdaptor";
import { TeX } from "@mathjax/src/mjs/input/tex";
import { SVG } from "@mathjax/src/mjs/output/svg";
import { mathjax } from "@mathjax/src/mjs/mathjax";
import { RegisterHTMLHandler } from "@mathjax/src/mjs/handlers/html";

import "@mathjax/src/mjs/input/tex/action/ActionConfiguration";
import "@mathjax/src/mjs/input/tex/ams/AmsConfiguration";
import "@mathjax/src/mjs/input/tex/amscd/AmsCdConfiguration";
import "@mathjax/src/mjs/input/tex/bbox/BboxConfiguration";
import "@mathjax/src/mjs/input/tex/boldsymbol/BoldsymbolConfiguration";
import "@mathjax/src/mjs/input/tex/braket/BraketConfiguration";
import "@mathjax/src/mjs/input/tex/bussproofs/BussproofsConfiguration";
import "@mathjax/src/mjs/input/tex/cancel/CancelConfiguration";
import "@mathjax/src/mjs/input/tex/cases/CasesConfiguration";
import "@mathjax/src/mjs/input/tex/centernot/CenternotConfiguration";
import "@mathjax/src/mjs/input/tex/color/ColorConfiguration";
import "@mathjax/src/mjs/input/tex/colortbl/ColortblConfiguration";
import "@mathjax/src/mjs/input/tex/empheq/EmpheqConfiguration";
import "@mathjax/src/mjs/input/tex/enclose/EncloseConfiguration";
import "@mathjax/src/mjs/input/tex/extpfeil/ExtpfeilConfiguration";
import "@mathjax/src/mjs/input/tex/gensymb/GensymbConfiguration";
import "@mathjax/src/mjs/input/tex/html/HtmlConfiguration";
import "@mathjax/src/mjs/input/tex/mathtools/MathtoolsConfiguration";
import "@mathjax/src/mjs/input/tex/mhchem/MhchemConfiguration";
import "@mathjax/src/mjs/input/tex/newcommand/NewcommandConfiguration";
import "@mathjax/src/mjs/input/tex/noerrors/NoErrorsConfiguration";
import "@mathjax/src/mjs/input/tex/noundefined/NoUndefinedConfiguration";
import "@mathjax/src/mjs/input/tex/upgreek/UpgreekConfiguration";
import "@mathjax/src/mjs/input/tex/unicode/UnicodeConfiguration";
import "@mathjax/src/mjs/input/tex/verb/VerbConfiguration";
import "@mathjax/src/mjs/input/tex/configmacros/ConfigMacrosConfiguration";
import "@mathjax/src/mjs/input/tex/tagformat/TagFormatConfiguration";
import "@mathjax/src/mjs/input/tex/textcomp/TextcompConfiguration";
import "@mathjax/src/mjs/input/tex/textmacros/TextMacrosConfiguration";

import { MalformedExpressionException } from "@mehra/ts";

const adaptor = liteAdaptor();
RegisterHTMLHandler(adaptor);

const tex = new TeX({
  // prettier-ignore
  packages: [ "base", "action", "ams", "amscd", "bbox", "boldsymbol", "braket", "bussproofs", "cancel", "cases", "centernot", "color", "colortbl", "empheq", "enclose", "extpfeil", "gensymb", "html", "mathtools", "mhchem", "newcommand", "noerrors", "noundefined", "upgreek", "unicode", "verb", "configmacros", "tagformat", "textcomp", "textmacros" ],
});
const svg = new SVG({ fontCache: "local" });
const html = mathjax.document("", { InputJax: tex, OutputJax: svg });

const CSS = [
  "svg a{fill:blue;stroke:blue}",
  '[data-mml-node="merror"]>g{fill:red;stroke:red}',
  '[data-mml-node="merror"]>rect[data-background]{fill:yellow;stroke:none}',
  "[data-frame],[data-line]{stroke-width:70px;fill:none}",
  ".mjx-dashed{stroke-dasharray:140}",
  ".mjx-dotted{stroke-linecap:round;stroke-dasharray:0,140}",
  "use[data-c]{stroke-width:3px}",
].join("");

function TeXToSVG(str: string) {
  const node = html.convert(str, {
    display: true,
    em: 16,
    ex: 8,
    containerWidth: 1280,
  });
  let svgString = adaptor.innerHTML(node);
  svgString = svgString.replace(/<defs>/, `<defs><style>${CSS}</style>`);
  return svgString;
}

export class LaTeXError extends MalformedExpressionException {
  /**
   * @param errorText Error text provided by MathJax
   * @param sourceTeX
   * @param node The error node in the parsed SVG
   */
  constructor(
    public errorText: string,
    public sourceTeX?: string,
    public node?: Element,
  ) {
    super(
      sourceTeX === undefined
        ? errorText
        : `${errorText}

in LaTeX ${sourceTeX}`,
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
function getErrorFromSVG(SVG: string): null | {
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
 * Tries to render the TeX from {@param tex} as an SVG in text mode.
 * If MathJax refused to properly render the TeX due to an error concerning validity only in math mode,
 * retry in math mode.
 * @return The MathJax response as a data URL in the form of `image/svg+xml`
 * @throws [[`LaTeXError`]] from the first attempt if both attempts have an error (or if there is no second attempt)
 */
export default function TeXToDataURL(
  tex: string,
): `data:image/svg+xml,${string}` {
  let SVG = TeXToSVG(`\\text{${tex}}`);

  let error = getErrorFromSVG(SVG);

  if (
    error?.errorText.endsWith("allowed only in math mode") ||
    error?.errorText.endsWith("is only supported in math mode")
  ) {
    // Retry without enclosing in `\text{}`
    // This assignment is okay because we only read this value in cases of success
    SVG = TeXToSVG(tex);

    // Don't replace `error` if the retry fails;
    // the first attempt's error has more meaning
    if (getErrorFromSVG(SVG) === null) error = null;
  }

  if (error !== null) {
    throw new LaTeXError(
      error.errorText,
      error.sourceText,
      error.MathJaxErrorNode,
    );
  }

  return `data:image/svg+xml,${encodeURIComponent(SVG)}` as const;
}
