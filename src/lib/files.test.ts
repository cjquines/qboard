import { beforeEach, describe, expect, it, vi } from "vitest";

import FileHandler from "./files";
import { readPDF } from "./pdf";
import { PageJSON } from "./pages";

vi.mock("./pdf", () => ({ readPDF: vi.fn() }));

const importedPages = [
  { version: "test", objects: [], background: "white" },
  { version: "test", objects: [], background: "white" },
] as PageJSON[];

const setup = () => {
  const pages = {
    canvasWidth: 1600,
    canvasHeight: 900,
    insertPagesAfter: vi.fn(async () => 1),
  };
  const history = {
    add: vi.fn(),
    clear: vi.fn(),
  };
  const handler = new FileHandler(pages as never, history as never);
  const pdf = new File(["%PDF fixture"], "fixture.pdf", {
    type: "application/pdf",
  });
  return { handler, history, pages, pdf };
};

describe("FileHandler PDF imports", () => {
  beforeEach(() => {
    vi.mocked(readPDF).mockReset().mockResolvedValue(importedPages);
  });

  it("imports a picker PDF after the current page", async () => {
    const { handler, pages, pdf } = setup();

    await expect(
      handler.acceptFile([pdf] as unknown as FileList),
    ).resolves.toBe("pdf");
    expect(readPDF).toHaveBeenCalledWith(pdf, 1600, 900);
    expect(pages.insertPagesAfter).toHaveBeenCalledWith(importedPages);
  });

  it("imports a dropped PDF through the multi-file path", async () => {
    const { handler, history, pages, pdf } = setup();

    await handler.processFiles([pdf] as unknown as FileList);

    expect(readPDF).toHaveBeenCalledWith(pdf, 1600, 900);
    expect(pages.insertPagesAfter).toHaveBeenCalledWith(importedPages);
    expect(history.add).toHaveBeenCalledWith([]);
  });
});
