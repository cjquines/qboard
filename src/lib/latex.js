import { MalformedExpressionException } from "@mehra/ts";
import TeXToSVG from "tex-to-svg";
export class LaTeXError extends MalformedExpressionException {
    /**
     * @param errorText Error text provided by MathJax
     * @param sourceTeX
     * @param node The error node in the parsed SVG
     */
    constructor(errorText, sourceTeX, node) {
        super(sourceTeX === undefined
            ? errorText
            : `${errorText}

in LaTeX ${sourceTeX}`);
        this.errorText = errorText;
        this.sourceTeX = sourceTeX;
        this.node = node;
    }
}
/**
 * If MathJax refused to properly render some TeX,
 * and told us with a data tag in the emitted SVG,
 * we return important fields from this data tag.
 * Otherwise, we return `null`.
 * @param SVG The MathJax response as `image/svg+xml`
 */
function getErrorFromSVG(SVG) {
    var _a, _b;
    const MathJaxErrorNode = new window.DOMParser()
        .parseFromString(SVG, "image/svg+xml")
        .querySelector('[data-mml-node="merror"]');
    if (MathJaxErrorNode === null)
        return null;
    const errorText = MathJaxErrorNode.getAttribute("title");
    const sourceText = (_b = (_a = MathJaxErrorNode.querySelector('[data-mml-node="mtext"] text')) === null || _a === void 0 ? void 0 : _a.textContent) !== null && _b !== void 0 ? _b : undefined;
    return { errorText, sourceText, MathJaxErrorNode };
}
/**
 * Tries to render the TeX from {@param tex} as an SVG in text mode.
 * If MathJax refused to properly render the TeX due to an error concerning validity only in math mode,
 * retry in math mode.
 * @return The MathJax response as a data URL in the form of `image/svg+xml`
 * @throws [[`LaTeXError`]] from the first attempt if both attempts have an error (or if there is no second attempt)
 */
export default function TeXToDataURL(tex) {
    let SVG = TeXToSVG(`\\text{${tex}}`);
    let error = getErrorFromSVG(SVG);
    if ((error === null || error === void 0 ? void 0 : error.errorText.endsWith("allowed only in math mode")) ||
        (error === null || error === void 0 ? void 0 : error.errorText.endsWith("is only supported in math mode"))) {
        // Retry without enclosing in `\text{}`
        // This assignment is okay because we only read this value in cases of success
        SVG = TeXToSVG(tex);
        // Don't replace `error` if the retry fails;
        // the first attempt's error has more meaning
        if (getErrorFromSVG(SVG) === null)
            error = null;
    }
    if (error !== null) {
        throw new LaTeXError(error.errorText, error.sourceText, error.MathJaxErrorNode);
    }
    return `data:image/svg+xml,${encodeURIComponent(SVG)}`;
}
