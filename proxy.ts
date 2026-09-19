import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

const authRoutes = ["/sign-in"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  const isAuthRoute = authRoutes.includes(pathname);

  if (isAuthRoute && session) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (!isAuthRoute && !session) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
