import React from "react";

type DealDisclosureProps = {
  language?: string | null;
};

export function DealDisclosure({ language }: DealDisclosureProps) {
  if (language === "hi") return null;

  return (
    <aside
      role="note"
      aria-label="Disclosure"
      className="my-4 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700"
    >
      Dalimss News has no commercial arrangement with the retailer or the brand named in this article.
    </aside>
  );
}
