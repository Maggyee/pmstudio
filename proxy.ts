import { NextResponse, type NextRequest } from "next/server";

const demoUser = process.env.PMSTUDIO_DEMO_USER || "pmstudio";
const demoPassword = process.env.PMSTUDIO_DEMO_PASSWORD;

function unauthorized() {
  return new NextResponse("Authentication required", {
    headers: {
      "WWW-Authenticate": 'Basic realm="PM Studio"',
    },
    status: 401,
  });
}

function parseBasicAuth(value: string) {
  const [scheme, encoded] = value.split(" ");

  if (scheme !== "Basic" || !encoded) return null;

  try {
    const decoded = atob(encoded);
    const separatorIndex = decoded.indexOf(":");

    if (separatorIndex === -1) return null;

    return {
      password: decoded.slice(separatorIndex + 1),
      user: decoded.slice(0, separatorIndex),
    };
  } catch {
    return null;
  }
}

export function proxy(request: NextRequest) {
  if (!demoPassword) return NextResponse.next();

  const credentials = parseBasicAuth(request.headers.get("authorization") ?? "");

  if (credentials?.user === demoUser && credentials.password === demoPassword) {
    return NextResponse.next();
  }

  return unauthorized();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|pm-studio-logo.png).*)"],
};
