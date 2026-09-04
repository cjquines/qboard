import { describe, expect, it } from "vitest";
import { getDocument as getLegacyDocument } from "pdfjs-dist/legacy/build/pdf.mjs";

import { readPDF } from "./pdf";

/** Build a deterministic, valid PDF without committing a binary fixture. */
const makePDF = (sizes: readonly [number, number][]): Uint8Array => {
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    `<< /Type /Pages /Count ${sizes.length} /Kids [${sizes
      .map((_, index) => `${index + 3} 0 R`)
      .join(" ")}] >>`,
    ...sizes.map(
      ([width, height]) =>
        `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${width} ${height}] /Resources << >> >>`,
    ),
  ];
  let body = "%PDF-1.4\n";
  const offsets = [0];
  objects.forEach((object, index) => {
    offsets.push(body.length);
    body += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });
  const xref = body.length;
  body += `xref\n0 ${objects.length + 1}\n`;
  body += "0000000000 65535 f \n";
  body += offsets
    .slice(1)
    .map((offset) => `${offset.toString().padStart(10, "0")} 00000 n \n`)
    .join("");
  body += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
  return new TextEncoder().encode(body);
};

describe("readPDF", () => {
  it("imports every PDF page in order, fit and centered", async () => {
    const fixture = makePDF([
      [300, 600],
      [800, 400],
      [500, 500],
    ]);
    const file = new File([fixture.buffer as ArrayBuffer], "three-pages.pdf", {
      type: "application/pdf",
    });
    const canvases: HTMLCanvasElement[] = [];
    const renderedPages: number[] = [];
    const pages = await readPDF(file, 1600, 900, {
      loadDocument: async (data) => {
        const task = getLegacyDocument({ data });
        const document = await task.promise;
        return {
          numPages: document.numPages,
          getPage: document.getPage.bind(document),
          destroy: () => task.destroy(),
        };
      },
      createCanvas: () => {
        const canvas = { width: 0, height: 0 } as HTMLCanvasElement;
        canvases.push(canvas);
        return canvas;
      },
      renderPage: async (page) => {
        renderedPages.push(page.pageNumber);
      },
      serializeImage: (canvas, left, top, scale) =>
        ({
          type: "Image",
          fixturePage: canvases.indexOf(canvas) + 1,
          left,
          top,
          scaleX: scale,
          scaleY: scale,
        }) as never,
    });

    expect(pages).toHaveLength(3);
    expect(renderedPages).toEqual([1, 2, 3]);
    expect(pages.map(({ objects }) => objects[0])).toMatchObject([
      { fixturePage: 1, left: 800, top: 450, scaleX: 0.5, scaleY: 0.5 },
      { fixturePage: 2, left: 800, top: 450, scaleX: 0.5, scaleY: 0.5 },
      { fixturePage: 3, left: 800, top: 450, scaleX: 0.5, scaleY: 0.5 },
    ]);
    expect(canvases.map(({ width, height }) => [width, height])).toEqual([
      [900, 1800],
      [3200, 1600],
      [1800, 1800],
    ]);
    expect(pages.every(({ background }) => background === "white")).toBe(true);
  });
});
