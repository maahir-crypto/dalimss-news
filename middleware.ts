import { NextRequest, NextResponse } from "next/server";
import { categoryQueryDestination } from "@/lib/categories";

const LITERAL_TEMPLATE_PATHS = new Set([
  "/articles/[slug]",
  "/category/[slug]",
  "/courses/[slug]",
]);

function normalizePathname(pathname: string): string {
  let path = pathname;
  try {
    path = decodeURIComponent(pathname);
  } catch {
    path = pathname;
  }
  if (path.length > 1 && path.endsWith("/")) {
    path = path.slice(0, -1);
  }
  return path.toLowerCase();
}

function isLiteralTemplatePath(pathname: string): boolean {
  return LITERAL_TEMPLATE_PATHS.has(normalizePathname(pathname));
}

function gone(): NextResponse {
  return new NextResponse("Gone", {
    status: 410,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
      "X-Robots-Tag": "noindex",
    },
  });
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/home/")) {
    return new NextResponse("Gone", {
      status: 410,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "public, max-age=3600",
      },
    });
  }

  if (isLiteralTemplatePath(pathname) || pathname.startsWith("/courses/")) {
    return gone();
  }

  if (pathname === "/podcasts/feed.xml") {
    const destination = request.nextUrl.clone();
    destination.pathname = "/ott/feed.xml";
    destination.search = "";
    const response = NextResponse.redirect(destination, 308);
    response.headers.set("X-Robots-Tag", "noindex");
    return response;
  }

  if (pathname === "/listing/search") {
    if (request.headers.get("x-dalimss-search-rewrite") === "1") {
      return NextResponse.next();
    }
    const destination = request.nextUrl.clone();
    destination.pathname = "/";
    return NextResponse.redirect(destination, 308);
  }

  if (pathname === "/") {
    const category = request.nextUrl.searchParams.get("category");
    if (category !== null) {
      const destination = request.nextUrl.clone();
      const target = categoryQueryDestination(category);
      destination.pathname = target;
      destination.search = "";
      return NextResponse.redirect(destination, 308);
    }

    const search = request.nextUrl.searchParams.get("search");
    if (search) {
      const destination = request.nextUrl.clone();
      destination.pathname = "/listing/search";
      const headers = new Headers(request.headers);
      headers.set("x-dalimss-search-rewrite", "1");
      return NextResponse.rewrite(destination, { request: { headers } });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/listing/search",
    "/home/:path*",
    "/articles/:path*",
    "/category/:path*",
    "/courses/:path*",
    "/podcasts/feed.xml",
  ],
};
