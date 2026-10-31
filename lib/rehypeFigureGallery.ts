type HastNode = {
  type: string;
  tagName?: string;
  value?: string;
  properties?: Record<string, unknown>;
  children?: HastNode[];
};

type HastParent = { children?: HastNode[] };

export const GALLERY_TAG = "figure-gallery";
export const GALLERY_MIN_RUN = 3;

function isWhitespaceText(node: HastNode): boolean {
  return node.type === "text" && !String(node.value || "").trim();
}

function isElement(node: HastNode, tag: string): boolean {
  return node.type === "element" && node.tagName === tag;
}

/** True when the node holds exactly one image, either bare or wrapped in a single link. */
function isImageHolder(node: HastNode): boolean {
  if (isElement(node, "img")) return true;
  if (isElement(node, "a")) {
    const inner = (node.children || []).filter((c) => !isWhitespaceText(c));
    return inner.length === 1 && isElement(inner[0], "img");
  }
  return false;
}

/**
 * A photo figure is a <figure> whose content is one image (optionally linked)
 * followed by an optional <figcaption>. Anything else (tables, embeds, two
 * images) is left alone.
 */
export function isPhotoFigure(node: HastNode): boolean {
  if (!isElement(node, "figure")) return false;
  const kids = (node.children || []).filter((c) => !isWhitespaceText(c));
  if (kids.length === 1) return isImageHolder(kids[0]);
  if (kids.length === 2) return isImageHolder(kids[0]) && isElement(kids[1], "figcaption");
  return false;
}

/**
 * Find runs of photo figures among a list of siblings. Whitespace text between
 * figures does not break a run. Returns [start, end] index pairs (end inclusive)
 * for runs with at least minRun figures.
 */
export function findFigureRuns(children: HastNode[], minRun?: number): Array<[number, number]> {
  const min = minRun || GALLERY_MIN_RUN;
  const runs: Array<[number, number]> = [];
  let start = -1;
  let last = -1;
  let count = 0;
  const close = () => {
    if (count >= min) runs.push([start, last]);
    start = -1;
    last = -1;
    count = 0;
  };
  for (let i = 0; i < children.length; i++) {
    const node = children[i];
    if (isPhotoFigure(node)) {
      if (start < 0) start = i;
      last = i;
      count += 1;
    } else if (isWhitespaceText(node) && start >= 0) {
      continue;
    } else {
      close();
    }
  }
  close();
  return runs;
}

/** Gallery photos sit below the fold, so make sure they load lazily. */
function lazyLoad(node: HastNode) {
  const kids = node.children || [];
  for (let i = 0; i < kids.length; i++) {
    const k = kids[i];
    if (isElement(k, "img")) {
      k.properties = k.properties || {};
      if (!k.properties.loading) k.properties.loading = "lazy";
      if (!k.properties.decoding) k.properties.decoding = "async";
    } else if (k.children) lazyLoad(k);
  }
}

function groupChildren(parent: HastParent) {
  const children = parent.children;
  if (!Array.isArray(children)) return;
  const runs = findFigureRuns(children);
  for (let r = runs.length - 1; r >= 0; r--) {
    const s = runs[r][0];
    const e = runs[r][1];
    const figures = children.slice(s, e + 1).filter((c) => isPhotoFigure(c));
    figures.forEach(lazyLoad);
    children.splice(s, e - s + 1, {
      type: "element",
      tagName: GALLERY_TAG,
      properties: { count: String(figures.length) },
      children: figures,
    });
  }
}

/**
 * Wrap runs of 3 or more consecutive photo figures in a <figure-gallery>
 * element, which the article page renders as a grid with a lightbox.
 * Runs of 1 or 2 figures are untouched. Only top level body nodes and
 * plain wrapper divs/sections are scanned.
 */
export function rehypeFigureGallery() {
  return function transformer(tree: HastParent) {
    groupChildren(tree);
    const kids = tree.children || [];
    for (let i = 0; i < kids.length; i++) {
      const k = kids[i];
      if (isElement(k, "div") || isElement(k, "section")) groupChildren(k);
    }
  };
}
