import { NextResponse, type NextRequest } from "next/server";

/**
 * Next 16 proxy. In this no-auth phase its only job is to pass the
 * current pathname to the root layout via a custom header so the
 * <TopTabs> component can render the active state.
 */
export function proxy(request: NextRequest) {
  const response = NextResponse.next({ request });
  response.headers.set("x-next-pathname", request.nextUrl.pathname);
  request.headers.set("x-next-pathname", request.nextUrl.pathname);
  return NextResponse.next({
    request: { headers: request.headers },
  });
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
