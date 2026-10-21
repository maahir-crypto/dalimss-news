/**
 * A single site-root segment ending in .txt, such as /<INDEXNOW_KEY>.txt.
 * Nested paths and other extensions are left to middleware and redirects.
 * The pattern has no unicode flag so it typechecks with the ES5 target.
 */
export function isRootTxtPath(pathname: string): boolean {
  return /^\/[^/]+\.txt$/.test(pathname);
}
