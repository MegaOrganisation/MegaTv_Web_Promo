import { NextResponse } from "next/server";

/** Ancien hub /acces → ancre #ecosysteme sur la landing. */
export function GET(request: Request) {
  const url = new URL(request.url);
  return NextResponse.redirect(new URL("/#ecosysteme", url.origin), 308);
}
