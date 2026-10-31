import assert from "node:assert/strict";
import { findFigureRuns, isPhotoFigure, rehypeFigureGallery, GALLERY_TAG } from "./rehypeFigureGallery";

const ws = () => ({ type: "text", value: "\n" });
const img = (n: number) => ({ type: "element", tagName: "img", properties: { src: `/${n}.jpg`, alt: `Photo ${n}` }, children: [] });
const fig = (n: number, caption = true) => ({
  type: "element",
  tagName: "figure",
  properties: {},
  children: caption
    ? [img(n), { type: "element", tagName: "figcaption", properties: {}, children: [{ type: "text", value: `Cap ${n}` }] }]
    : [img(n)],
});
const p = (t: string) => ({ type: "element", tagName: "p", properties: {}, children: [{ type: "text", value: t }] });
const run = (tree: any) => {
  rehypeFigureGallery()(tree);
  return tree;
};

// photo figure detection
assert.equal(isPhotoFigure(fig(1)), true);
assert.equal(isPhotoFigure(fig(1, false)), true);
assert.equal(isPhotoFigure({ type: "element", tagName: "figure", children: [img(1), img(2)] }), false);
assert.equal(isPhotoFigure({ type: "element", tagName: "figure", children: [{ type: "element", tagName: "table", children: [] }] }), false);
assert.equal(isPhotoFigure({ type: "element", tagName: "figure", children: [{ type: "element", tagName: "a", children: [img(1)] }] }), true);

// single image and 1 to 2 figure runs are unchanged
{
  const tree = { type: "root", children: [p("a"), fig(1), p("b"), fig(2), ws(), fig(3), p("c")] };
  const before = JSON.stringify(tree);
  assert.equal(JSON.stringify(run(tree)), before);
}
{
  const tree = { type: "root", children: [p("a"), img(9), p("b")] };
  const before = JSON.stringify(tree);
  assert.equal(JSON.stringify(run(tree)), before);
}

// 12 figures separated by newlines become one gallery
{
  const kids: any[] = [p("intro")];
  for (let i = 1; i <= 12; i++) {
    kids.push(fig(i));
    kids.push(ws());
  }
  kids.push(p("outro"));
  const tree = run({ type: "root", children: kids });
  assert.equal(tree.children.length, 4);
  const g = tree.children[1];
  assert.equal(g.tagName, GALLERY_TAG);
  assert.equal(g.properties.count, "12");
  assert.equal(g.children.length, 12);
  assert.equal(g.children[0].children[0].properties.alt, "Photo 1");
  assert.equal(tree.children[2].type, "text");
}

// a paragraph breaks a run; two separate runs of 3 make two galleries
{
  const tree = run({ type: "root", children: [fig(1), fig(2), fig(3), p("x"), fig(4), fig(5), p("y"), fig(6), fig(7), fig(8)] });
  const tags = tree.children.map((c: any) => c.tagName);
  assert.deepEqual(tags, [GALLERY_TAG, "p", "figure", "figure", "p", GALLERY_TAG]);
}

// runs inside a top level wrapper div are grouped too
{
  const tree = run({ type: "root", children: [{ type: "element", tagName: "div", children: [fig(1), fig(2), fig(3)] }] });
  assert.equal(tree.children[0].children[0].tagName, GALLERY_TAG);
}

assert.deepEqual(findFigureRuns([fig(1) as any, ws(), fig(2) as any, ws(), fig(3) as any, ws()]), [[0, 4]]);

console.log("rehypeFigureGallery tests passed");
