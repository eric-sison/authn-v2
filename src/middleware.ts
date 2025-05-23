import { NextRequest, NextResponse } from "next/server";

const publicRoutes: Array<string | RegExp> = [];

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Evaluate if the current path name is listed as among the declared public routes.
  const isPublicRoute = publicRoutes.some((route) =>
    typeof route === "string" ? route === pathname : route.test(pathname),
  );

  if (isPublicRoute) {
    return NextResponse.next();
  }

  /**
   *  If current path name is not a public route:
   *
   *  Fetch session from the database.
   *  You may also add caching functionality to reduce expensive database calls.
   *  Return session object
   */

  // If code execution gets to this point, it means there is an existing session.
  // Check if the current path name is one of the public routes.
  // If so, redirect to the authenticated home page.
  if (publicRoutes.includes(pathname)) {
    return NextResponse.redirect(new URL("/", request.url));
  }
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|webp|gif|ico|ttf|woff|woff2|eot)).*)",
  ],
};
