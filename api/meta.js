export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();

  const TOKEN = process.env.META_TOKEN;
  const ACCOUNT_ID = process.env.META_ACCOUNT_ID;

  if (!TOKEN || !ACCOUNT_ID) {
    return res.status(500).json({ error: "Variáveis de ambiente não configuradas." });
  }

  const { periodo = "last_7d", inicio, fim } = req.query;

  let insightsFilter = "";
  if (periodo === "custom" && inicio && fim) {
    insightsFilter = `.date_range(since=${inicio},until=${fim})`;
  } else {
    insightsFilter = `.date_preset(${periodo})`;
  }

  try {
    const fields = `name,status,daily_budget,lifetime_budget,insights${insightsFilter}{spend,impressions,reach,clicks,actions}`;
    const url = `https://graph.facebook.com/v19.0/${ACCOUNT_ID}/campaigns?fields=${encodeURIComponent(fields)}&access_token=${TOKEN}&limit=50`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.error) return res.status(400).json({ error: data.error.message });

    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
