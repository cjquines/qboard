import * as fabric from "fabric";
import type { PDFPageProxy, PageViewport } from "pdfjs-dist";
// Vite turns the worker module into a deployed asset URL.
// eslint-disable-next-line import/no-unresolved
import pdfWorker from "pdfjs-dist/build/pdf.worker.min.mjs?url";

import { PageJSON } from "./pages";

const rasterScale = 2;

type PDFDependencies = {
  createCanvas: () => HTMLCanvasElement;
  loadDocument: (data: Uint8Array) => Promise<{
    numPages: number;
    getPage: (pageNumber: number) => Promise<PDFPageProxy>;
    destroy: () => Promise<void>;
  }>;
  renderPage: (
    page: PDFPageProxy,
    canvas: HTMLCanvasElement,
    viewport: PageViewport,
  ) => Promise<void>;
  serializeImage: (
    canvas: HTMLCanvasElement,
    left: number,
    top: number,
    scale: number,
  ) => PageJSON["objects"][number];
};

const defaultDependencies: PDFDependencies = {
  createCanvas: () => document.createElement("canvas"),
  loadDocument: async (data) => {
    const { getDocument, GlobalWorkerOptions } = await import("pdfjs-dist");
    GlobalWorkerOptions.workerSrc = pdfWorker;
    const task = getDocument({ data });
    const document = await task.promise;
    return {
      numPages: document.numPages,
      getPage: document.getPage.bind(document),
      destroy: () => task.destroy(),
    };
  },
  renderPage: async (page, canvas, viewport) => {
    await page.render({ canvas, viewport }).promise;
  },
  serializeImage: (canvas, left, top, scale) => {
    const image = new fabric.FabricImage(canvas, {
      left,
      top,
      originX: "center",
      originY: "center",
      scaleX: scale,
      scaleY: scale,
    });
    return image.toObject() as unknown as PageJSON["objects"][number];
  },
};

/**
 * Rasterize every page in a PDF and return one qboard page per PDF page.
 *
 * Pages are rendered at twice their displayed resolution, centered, and fit
 * within the board without cropping or changing their aspect ratio.
 */
export const readPDF = async (
  file: File,
  boardWidth: number,
  boardHeight: number,
  dependencies: Partial<PDFDependencies> = {},
): Promise<PageJSON[]> => {
  const { createCanvas, loadDocument, renderPage, serializeImage } = {
    ...defaultDependencies,
    ...dependencies,
  };
  const document = await loadDocument(new Uint8Array(await file.arrayBuffer()));
  const pages: PageJSON[] = [];

  try {
    for (let pageNumber = 1; pageNumber <= document.numPages; pageNumber++) {
      const page = await document.getPage(pageNumber);
      const initialViewport = page.getViewport({ scale: 1 });
      const displayScale = Math.min(
        boardWidth / initialViewport.width,
        boardHeight / initialViewport.height,
      );
      const viewport = page.getViewport({ scale: displayScale * rasterScale });
      const canvas = createCanvas();
      canvas.width = Math.ceil(viewport.width);
      canvas.height = Math.ceil(viewport.height);

      await renderPage(page, canvas, viewport);

      pages.push({
        version: fabric.version,
        objects: [
          serializeImage(
            canvas,
            boardWidth / 2,
            boardHeight / 2,
            1 / rasterScale,
          ),
        ],
        background: "white",
      });
    }
  } finally {
    await document.destroy();
  }

  return pages;
};
