export { default } from "next-auth/middleware";

export const config = {
  matcher: ["/dashboard/:path*", "/merchants/:path*", "/map/:path*", "/analytics/:path*", "/api-keys/:path*"],
};
