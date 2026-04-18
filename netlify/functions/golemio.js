exports.handler = async (event) => {
  if (event.httpMethod !== "GET") {
    return {
      statusCode: 405,
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ error: "Method not allowed" })
    };
  }

  const token = process.env.GOLEMIO_TOKEN;
  if (!token) {
    return {
      statusCode: 500,
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ error: "Missing GOLEMIO_TOKEN environment variable" })
    };
  }

  const params = new URLSearchParams(event.queryStringParameters || {});
  const requestedPath = params.get("path") || "";
  params.delete("path");

  if (!requestedPath.startsWith("/v2/")) {
    return {
      statusCode: 400,
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ error: "Invalid path. Must start with /v2/" })
    };
  }

  const targetUrl = `https://api.golemio.cz${requestedPath}${params.toString() ? `?${params.toString()}` : ""}`;

  try {
    const response = await fetch(targetUrl, {
      method: "GET",
      headers: {
        "X-Access-Token": token,
        "Content-Type": "application/json"
      }
    });

    const textBody = await response.text();
    return {
      statusCode: response.status,
      headers: {
        "content-type": response.headers.get("content-type") || "application/json",
        "cache-control": "no-store"
      },
      body: textBody
    };
  } catch (error) {
    return {
      statusCode: 502,
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ error: "Proxy request failed", details: error.message })
    };
  }
};
