const required = (name) => {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
};

export function evolutionStatus() {
  return {
    provider: "evolution",
    configured: Boolean(process.env.EVOLUTION_LAUNCH_URL && process.env.EVOLUTION_API_KEY),
    launchMode: process.env.EVOLUTION_LAUNCH_MODE || "iframe"
  };
}

export async function launchEvolutionGame(input) {
  const launchUrl = required("EVOLUTION_LAUNCH_URL");
  const apiKey = required("EVOLUTION_API_KEY");
  const apiKeyHeader = process.env.EVOLUTION_API_KEY_HEADER || "apikey";

  /*
   * IMPORTANT:
   * Evolution's current OSS launch schema is contract documentation.
   * Keep the provider-specific mapping isolated here. The payload below is
   * WAGERWELL's normalized launch model, not a claim about Evolution's
   * production field names. Replace mapLaunchPayload() with the exact schema
   * from the operator integration pack before enabling production mode.
   */
  const payload = mapLaunchPayload(input);

  const response = await fetch(launchUrl, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      [apiKeyHeader]: apiKey
    },
    body: JSON.stringify(payload)
  });

  const text = await response.text();
  let data = {};
  try { data = text ? JSON.parse(text) : {}; } catch { data = { raw: text }; }

  if (!response.ok) {
    const error = new Error(`Evolution launch failed with HTTP ${response.status}`);
    error.status = response.status;
    error.providerBody = data;
    throw error;
  }

  const url = data.url || data.launchUrl || data.gameUrl || data.entry || data.entryEmbedded;
  if (!url) {
    const error = new Error("Evolution response did not contain a recognized launch URL field.");
    error.providerBody = data;
    throw error;
  }

  return {
    provider: "evolution",
    url,
    launchMode: process.env.EVOLUTION_LAUNCH_MODE || "iframe",
    raw: data
  };
}

function mapLaunchPayload(input) {
  return {
    operatorId: process.env.EVOLUTION_OPERATOR_ID || undefined,
    brandId: process.env.EVOLUTION_BRAND_ID || undefined,
    playerId: input.playerId,
    sessionId: input.sessionId,
    gameId: input.gameId,
    currency: input.currency,
    language: input.language,
    country: input.country,
    returnUrl: input.returnUrl
  };
}
