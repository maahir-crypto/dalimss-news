import { NextRequest, NextResponse } from "next/server";

function isLiteralArticleSlug(pathname: string): boolean {
  if (pathname === "/articles/[slug]") return true;
  return pathname.toLowerCase() === "/articles/%5bslug%5d";
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

  if (isLiteralArticleSlug(pathname)) {
    const destination = request.nextUrl.clone();
    destination.pathname = "/articles";
    destination.search = "";
    return NextResponse.redirect(destination, 308);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/home/:path*", "/articles/:path*"],
};
