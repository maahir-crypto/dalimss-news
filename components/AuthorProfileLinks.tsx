import type { AuthorProfileLink } from "@/lib/authorBoxes";

interface AuthorProfileLinksProps {
  links?: AuthorProfileLink[] | null;
  className?: string;
}

export function AuthorProfileLinks({
  links,
  className = "",
}: AuthorProfileLinksProps) {
  if (!links || links.length === 0) return null;

  return (
    <div
      className={`flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-gray-600 ${className}`}
    >
      <span className="font-semibold text-gray-800">Profiles:</span>
      {links.map((link) => (
        <a
          key={link.url}
          href={link.url}
          rel="me noopener"
          target="_blank"
          className="font-medium text-red-700 hover:underline"
        >
          {link.label}
        </a>
      ))}
    </div>
  );
}
