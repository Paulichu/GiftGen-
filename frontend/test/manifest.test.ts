import assert from "node:assert/strict";
import { it } from "node:test";
import manifest from "../src/app/manifest";

it("ships an installable Android manifest", () => {
  const app = manifest();

  assert.equal(app.display, "standalone");
  assert.equal(app.start_url, "/");
  assert.equal(app.id, "/");
  assert.ok(app.name && app.name.length > 0);
  assert.ok(app.short_name && app.short_name.length <= 12, "short_name should fit under a home-screen icon");
  assert.equal(app.theme_color, "#06060a");
  assert.equal(app.background_color, "#06060a");

  const icons = app.icons ?? [];
  const sizes = icons.map((icon) => icon.sizes);
  assert.ok(sizes.includes("192x192"), "Android needs a 192px icon");
  assert.ok(sizes.includes("512x512"), "Android needs a 512px icon");
  assert.ok(
    icons.some((icon) => icon.purpose === "maskable"),
    "Android adaptive icons need a maskable icon"
  );
  for (const icon of icons) {
    assert.ok(icon.src?.startsWith("/icons/"), `icon should be served from /icons: ${icon.src}`);
  }
});

it("keeps the manifest start page and scope on the same origin", () => {
  const app = manifest();
  assert.ok(app.start_url?.startsWith("/"));
  assert.ok(app.scope?.startsWith("/"));
});
