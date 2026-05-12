export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  if (req.method === "OPTIONS") return res.status(200).end();

  const RESEND_KEY = process.env.RESEND_API_KEY;
  const META_TOKEN = process.env.META_TOKEN;
  const ACCOUNT_ID = process.env.META_ACCOUNT_ID;
  const META_CPA = parseFloat(process.env.META_CPA_META || "50");

  if (!RESEND_KEY || !META_TOKEN || !ACCOUNT_ID) {
    return res.status(500).json({ error: "Variáveis de ambiente não configuradas." });
  }

  // 1. Buscar dados da Meta
  try {
    const fields = `name,status,daily_budget,lifetime_budget,insights.date_preset(today){spend,impressions,reach,clicks,actions}`;
    const metaUrl = `https://graph.facebook.com/v19.0/${ACCOUNT_ID}/campaigns?fields=${encodeURIComponent(fields)}&access_token=${META_TOKEN}&limit=50`;
    const metaRes = await fetch(metaUrl);
    const metaData = await metaRes.json();
    if (metaData.error) throw new Error(metaData.error.message);

    // 2. Processar campanhas
    const campanhas = metaData.data.map(c => {
      const insights = c.insights?.data?.[0] || {};
      const spend = parseFloat(insights.spend || 0);
      const clicks = parseInt(insights.clicks || 0);
      const impressions = parseInt(insights.impressions || 0);
      const reach = parseInt(insights.reach || 0);
      const actions = insights.actions || [];
      const getAction = (types) => actions.filter(a => types.includes(a.action_type)).reduce((sum, a) => sum + parseInt(a.value || 0), 0);
      const conversoes = getAction(["purchase", "lead", "complete_registration", "subscribe"]);
      const compras = getAction(["purchase", "omni_purchase", "web_in_store_purchase"]);
      const cpa = conversoes > 0 ? spend / conversoes : 0;
      const ctr = impressions > 0 ? (clicks / impressions * 100) : 0;
      const roas = spend > 0 && compras > 0 ? (compras * 100) / spend : 0;
      const frequencia = reach > 0 && impressions > 0 ? impressions / reach : 0;
      return { nome: c.name, status: c.status, investimento: spend, conversoes, compras, cpa, ctr, roas, frequencia, impressions, clicks, reach, budget: c.daily_budget ? parseFloat(c.daily_budget) / 100 : 0 };
    });

    // 3. Rodar auditoria
    const alertas = [];
    let pontos = 100;

    campanhas.forEach(c => {
      if (c.investimento === 0) return;
      if (c.cpa > 0 && c.cpa > META_CPA * 3) { alertas.push({ tipo: "🚨 CRÍTICO", regra: "3x Kill Rule", campanha: c.nome, desc: `CPA R$${c.cpa.toFixed(0)} é ${(c.cpa / META_CPA).toFixed(1)}x acima da meta (R$${META_CPA})`, acao: "Pausar imediatamente" }); pontos -= 15; }
      else if (c.cpa > 0 && c.cpa > META_CPA * 2) { alertas.push({ tipo: "⚠️ AVISO", regra: "CPA elevado", campanha: c.nome, desc: `CPA R$${c.cpa.toFixed(0)} é ${(c.cpa / META_CPA).toFixed(1)}x acima da meta`, acao: "Revisar segmentação" }); pontos -= 8; }
      if (c.ctr > 0 && c.ctr < 0.5 && c.impressions > 1000) { alertas.push({ tipo: "⚠️ AVISO", regra: "CTR baixo", campanha: c.nome, desc: `CTR de ${c.ctr.toFixed(2)}% abaixo do mínimo (0.5%)`, acao: "Testar novos criativos" }); pontos -= 6; }
      if (c.frequencia > 3.5) { alertas.push({ tipo: "⚠️ AVISO", regra: "Frequência alta", campanha: c.nome, desc: `Frequência ${c.frequencia.toFixed(1)} — público saturado`, acao: "Renovar criativos" }); pontos -= 8; }
      if (c.conversoes === 0 && c.investimento > META_CPA * 2) { alertas.push({ tipo: "🚨 CRÍTICO", regra: "Gasto sem retorno", campanha: c.nome, desc: `R$${c.investimento.toFixed(0)} gastos sem nenhuma conversão hoje`, acao: "Verificar pixel e LP" }); pontos -= 10; }
      if (c.roas > 3.5 && c.investimento > 50) { alertas.push({ tipo: "✅ POSITIVO", regra: "ROAS excelente", campanha: c.nome, desc: `ROAS ${c.roas.toFixed(1)}x acima da meta (3.5x)`, acao: "Considerar escalar budget" }); }
    });

    const score = Math.max(0, Math.min(100, pontos));
    const grade = score >= 90 ? "A" : score >= 75 ? "B" : score >= 60 ? "C" : score >= 40 ? "D" : "F";

    const totalInvestimento = campanhas.reduce((a, c) => a + c.investimento, 0);
    const totalConversoes = campanhas.reduce((a, c) => a + c.conversoes, 0);
    const cpaMedio = totalConversoes > 0 ? totalInvestimento / totalConversoes : 0;
    const campanhasAtivas = campanhas.filter(c => c.status === "ACTIVE").length;
    const criticos = alertas.filter(a => a.tipo.includes("CRÍTICO")).length;
    const avisos = alertas.filter(a => a.tipo.includes("AVISO")).length;
    const positivos = alertas.filter(a => a.tipo.includes("POSITIVO")).length;

    // 4. Montar HTML do email
    const gradeColor = score >= 90 ? "#52C41A" : score >= 75 ? "#00D4AA" : score >= 60 ? "#FAAD14" : "#FF4D4F";
    const hoje = new Date().toLocaleDateString("pt-BR", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

    const alertasHTML = alertas.map(a => {
      const bgColor = a.tipo.includes("CRÍTICO") ? "#1A0808" : a.tipo.includes("AVISO") ? "#1A1200" : "#061A0A";
      const borderColor = a.tipo.includes("CRÍTICO") ? "#FF4D4F" : a.tipo.includes("AVISO") ? "#FAAD14" : "#52C41A";
      return `
        <div style="background:${bgColor};border-left:4px solid ${borderColor};border-radius:6px;padding:12px 16px;margin-bottom:8px;">
          <div style="font-size:12px;font-weight:700;color:${borderColor};margin-bottom:4px;">${a.tipo} — ${a.regra}</div>
          <div style="font-size:13px;color:#E8EAF0;margin-bottom:4px;"><strong>${a.campanha}</strong></div>
          <div style="font-size:12px;color:#9CA3AF;">${a.desc}</div>
          <div style="font-size:11px;color:${borderColor};margin-top:6px;">→ ${a.acao}</div>
        </div>`;
    }).join("");

    const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="background:#0A0B0F;font-family:'Segoe UI',Arial,sans-serif;color:#E8EAF0;margin:0;padding:0;">
  <div style="max-width:600px;margin:0 auto;padding:32px 16px;">

    <!-- Header -->
    <div style="text-align:center;margin-bottom:32px;">
      <div style="font-size:24px;font-weight:700;color:#E8EAF0;">⚡ Ads Agent</div>
      <div style="font-size:13px;color:#6B7280;margin-top:4px;">Relatório diário — ${hoje}</div>
    </div>

    <!-- Health Score -->
    <div style="background:#12141A;border:1px solid ${gradeColor}44;border-radius:12px;padding:24px;text-align:center;margin-bottom:16px;">
      <div style="font-size:64px;font-weight:700;color:${gradeColor};line-height:1;">${grade}</div>
      <div style="font-size:14px;color:#6B7280;margin-top:4px;">Ads Health Score</div>
      <div style="font-size:28px;font-weight:700;color:${gradeColor};margin-top:4px;">${score}/100</div>
    </div>

    <!-- Métricas do dia -->
    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;margin-bottom:16px;">
      <div style="background:#12141A;border:1px solid #1E2028;border-radius:10px;padding:16px;text-align:center;">
        <div style="font-size:11px;color:#6B7280;margin-bottom:6px;">💰 Investimento hoje</div>
        <div style="font-size:20px;font-weight:700;color:#E8EAF0;">R$${totalInvestimento.toFixed(2)}</div>
      </div>
      <div style="background:#12141A;border:1px solid #1E2028;border-radius:10px;padding:16px;text-align:center;">
        <div style="font-size:11px;color:#6B7280;margin-bottom:6px;">🎯 Conversões</div>
        <div style="font-size:20px;font-weight:700;color:#E8EAF0;">${totalConversoes}</div>
      </div>
      <div style="background:#12141A;border:1px solid #1E2028;border-radius:10px;padding:16px;text-align:center;">
        <div style="font-size:11px;color:#6B7280;margin-bottom:6px;">📉 CPA médio</div>
        <div style="font-size:20px;font-weight:700;color:${cpaMedio > META_CPA * 2 ? "#FF4D4F" : "#52C41A"};">${cpaMedio > 0 ? `R$${cpaMedio.toFixed(0)}` : "—"}</div>
      </div>
    </div>

    <!-- Resumo alertas -->
    <div style="background:#12141A;border:1px solid #1E2028;border-radius:10px;padding:16px;margin-bottom:16px;display:flex;justify-content:space-around;text-align:center;">
      <div><div style="font-size:24px;font-weight:700;color:#FF4D4F;">${criticos}</div><div style="font-size:11px;color:#6B7280;">🚨 Críticos</div></div>
      <div><div style="font-size:24px;font-weight:700;color:#FAAD14;">${avisos}</div><div style="font-size:11px;color:#6B7280;">⚠️ Avisos</div></div>
      <div><div style="font-size:24px;font-weight:700;color:#52C41A;">${positivos}</div><div style="font-size:11px;color:#6B7280;">✅ Positivos</div></div>
      <div><div style="font-size:24px;font-weight:700;color:#E8EAF0;">${campanhasAtivas}</div><div style="font-size:11px;color:#6B7280;">📢 Ativas</div></div>
    </div>

    <!-- Alertas -->
    ${alertas.length > 0 ? `
    <div style="margin-bottom:16px;">
      <div style="font-size:13px;font-weight:600;margin-bottom:12px;">Alertas do dia</div>
      ${alertasHTML}
    </div>` : `
    <div style="background:#061A0A;border:1px solid #52C41A44;border-radius:10px;padding:16px;text-align:center;margin-bottom:16px;">
      <div style="color:#52C41A;font-size:13px;">✅ Nenhum alerta hoje — conta saudável!</div>
    </div>`}

    <!-- CTA -->
    <div style="text-align:center;margin-top:24px;">
      <a href="https://ads-dashboard-rust-rho.vercel.app" style="background:#00D4AA;color:#000;font-weight:700;font-size:13px;padding:12px 28px;border-radius:8px;text-decoration:none;display:inline-block;">
        Ver dashboard completo →
      </a>
    </div>

    <!-- Footer -->
    <div style="text-align:center;margin-top:24px;font-size:11px;color:#6B7280;">
      Ads Agent — Meta API conectada em tempo real<br>
      Meta de CPA: R$${META_CPA} · ${campanhas.length} campanhas monitoradas
    </div>
  </div>
</body>
</html>`;

    // 5. Enviar email via Resend
    const emailRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Authorization": `Bearer ${RESEND_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: "Ads Agent <onboarding@resend.dev>",
        to: ["bruna.dias@suno.com", "thaiane.barros@sunoresearch.com"],
        subject: `⚡ Ads Agent — ${grade} ${score}/100 · ${criticos > 0 ? `🚨 ${criticos} crítico(s)` : "✅ Sem alertas críticos"} · ${hoje}`,
        html,
      }),
    });

    const emailData = await emailRes.json();
    if (emailData.error) throw new Error(emailData.error.message || JSON.stringify(emailData.error));

    return res.status(200).json({ ok: true, score, grade, alertas: alertas.length, emailId: emailData.id });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
