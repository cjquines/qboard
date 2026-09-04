import assert from "node:assert/strict";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { JSDOM } from "jsdom";
import { createServer } from "vite";

const scriptDirectory = resolve(fileURLToPath(import.meta.url), "..");
const projectDirectory = resolve(scriptDirectory, "..");
const vite = await createServer({
  appType: "custom",
  root: projectDirectory,
  server: { middlewareMode: true },
});

try {
  const { Action } = await vite.ssrLoadModule("/src/lib/action.ts");
  const { Dash, Fill, Stroke } = await vite.ssrLoadModule("/src/lib/styles.ts");
  const { Keyboard } = await vite.ssrLoadModule("/src/components/Keyboard.tsx");
  const { default: OverlayButton } = await vite.ssrLoadModule(
    "/src/components/OverlayButton.tsx",
  );
  const { default: Pagination } = await vite.ssrLoadModule(
    "/src/components/Pagination.tsx",
  );
  const { default: StyleMenu } = await vite.ssrLoadModule(
    "/src/components/StyleMenu.tsx",
  );
  const { default: Stylebar } = await vite.ssrLoadModule(
    "/src/components/Stylebar.tsx",
  );
  const { default: VirtualFileInput } = await vite.ssrLoadModule(
    "/src/components/VirtualFileInput.tsx",
  );
  const element = React.createElement;
  const documentFor = (node) =>
    new JSDOM(renderToStaticMarkup(node)).window.document;
  const accessibleName = (control) =>
    control.getAttribute("aria-label") || control.textContent.trim();
  const assertNamed = (node, description) => {
    const controls = documentFor(node).querySelectorAll("button, input");
    assert.ok(controls.length, `${description} renders controls`);
    for (const control of controls) {
      assert.ok(
        accessibleName(control),
        `${description} control has an accessible name`,
      );
    }
  };
  const doNothing = () => {};
  const currentStyle = {
    dash: Dash.Solid,
    fill: Fill.Transparent,
    stroke: Stroke.Black,
  };

  assertNamed(
    element(
      React.Fragment,
      null,
      Object.values(Action).map((action) =>
        element(OverlayButton, { action, callback: doNothing, key: action }),
      ),
    ),
    "action buttons",
  );
  assertNamed(
    element(Pagination, {
      currentPage: 1,
      doAction: doNothing,
      loadPage: async () => 1,
      totalPages: 2,
      visibility: 2,
    }),
    "pagination",
  );
  assertNamed(
    element(StyleMenu, { currentStyle, doAction: doNothing }),
    "style menu",
  );
  assertNamed(
    element(Stylebar, {
      currentStyle,
      doAction: doNothing,
      isMobile: true,
      visibility: 2,
    }),
    "style bar",
  );
  assertNamed(element(VirtualFileInput), "file input");
  assertNamed(
    element(Keyboard, {
      activeModifiers: new Set(),
      onclick: doNothing,
      rows: [[{ action: Action.Pen, key: "a" }]],
      setActiveModifiers: doNothing,
    }),
    "keyboard bindings",
  );
  console.log("Rendered controls have accessible names.");
} finally {
  await vite.close();
}
