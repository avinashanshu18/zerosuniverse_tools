const PAGES_HOST = "zerosuniverse-tools.pages.dev";

function mapPath(pathname) {
  if (pathname.startsWith("/tools/_next/")) {
    return pathname.replace("/tools", "");
  }

  if (
    pathname === "/tools/site.webmanifest" ||
    pathname === "/tools/sitemap.xml" ||
    pathname === "/tools/robots.txt" ||
    pathname.startsWith("/tools/og/")
  ) {
    return pathname.replace("/tools", "");
  }

  return pathname;
}

const worker = {
  async fetch(request) {
    const url = new URL(request.url);
    const isStaticAsset =
      url.pathname.startsWith("/tools/_next/static/") ||
      url.pathname.startsWith("/tools/og/");

    const upstreamUrl = new URL(request.url);
    upstreamUrl.hostname = PAGES_HOST;
    upstreamUrl.protocol = "https:";
    upstreamUrl.pathname = mapPath(url.pathname);

    const upstreamRequest = new Request(upstreamUrl.toString(), request);
    upstreamRequest.headers.set("host", PAGES_HOST);
    upstreamRequest.headers.set("x-forwarded-host", url.hostname);
    upstreamRequest.headers.set("x-forwarded-proto", url.protocol.replace(":", ""));

    const response = await fetch(upstreamRequest, {
      redirect: "follow",
    });

    const newHeaders = new Headers(response.headers);
    if (isStaticAsset) {
      newHeaders.set("Cache-Control", "public, max-age=31536000, immutable");
    } else if (response.status === 200) {
      newHeaders.set(
        "Cache-Control",
        "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800"
      );
    }

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: newHeaders,
    });
  },
};

export default worker;
