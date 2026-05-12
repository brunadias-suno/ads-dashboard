import { useState, useEffect, useRef } from "react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const COLORS = {
  google: "#4285F4",
  meta: "#0866FF",
  accent: "#00D4AA",
  danger: "#FF4D4F",
  warning: "#FAAD14",
  success: "#52C41A",
  bg: "#0A0B0F",
  card: "#12141A",
  border: "#1E2028",
  text: "#E8EAF0",
  muted: "#6B7280",
};

// ⚠️ CONFIGURAÇÃO DA API META — substitua pelos seus valores
const META_TOKEN = "EAAqis7UPhZAUBReTL4WVSOsP1kdlJJl87KY4qtzIieBI4WIimt5WS0GvjA5GqLh2suZCZBZAlqZBoVZBPwIyJX20AYHpaJjN0oX0kwWGacvXHBZA3mQDZAqTsna72TXPgUXr5uFuB2F5J0kzrV2fBAIAFsXJlkPQaQylEOdVBZCoGkAAmjNe15uXvtZBf6mAg5OAZDZD";
const META_ACCOUNT_ID = "act_480556106171722";

// Dados de fallback (mockados) caso a API falhe
const mockPerfData = [
  { day: "Seg", meta: 3100, conversoes: 42 },
  { day: "Ter", meta: 3400, conversoes: 38 },
  { day: "Qua", meta: 2900, conversoes: 55 },
  { day: "Qui", meta: 3600, conversoes: 49 },
  { day: "Sex", meta: 4100, conversoes: 71 },
  { day: "Sáb", meta: 4800, conversoes: 63 },
  { day: "Dom", meta: 3200, conversoes: 44 },
];

function MetricCard({ label, value, sub, subType, icon, loading }) {
  return (
    <div style={{
      background: COLORS.card,
      border: `1px solid ${COLORS.border}`,
      borderRadius: 12,
      padding: "20px 24px",
      display: "flex",
      flexDirection: "column",
      gap: 8,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 13, color: COLORS.muted, fontFamily: "'DM Sans', sans-serif" }}>{label}</span>
        <span style={{ fontSize: 20 }}>{icon}</span>
      </div>
      {loading ? (
        <div style={{ height: 36, background: COLORS.border, borderRadius: 6, animation: "pulse 1.5s infinite" }} />
      ) : (
        <div style={{ fontSize: 28, fontWeight: 700, color: COLORS.text, fontFamily: "'Space Grotesk', sans-serif", letterSpacing: -1 }}>{value}</div>
      )}
      <div style={{
        fontSize: 12,
        color: subType === "up" ? COLORS.success : subType === "down" ? COLORS.danger : COLORS.warning,
        fontFamily: "'DM Sans', sans-serif",
      }}>{sub}</div>
    </div>
  );
}

function StatusBadge({ status }) {
  const map = {
    ACTIVE: { bg: "#052E16", color: COLORS.success, label: "Ativa" },
    PAUSED: { bg: "#2D1B00", color: COLORS.warning, label: "Pausada" },
    DELETED: { bg: "#1A0808", color: COLORS.danger, label: "Deletada" },
    ARCHIVED: { bg: "#1A1A1A", color: COLORS.muted, label: "Arquivada" },
  };
  const s = map[status] || map.PAUSED;
  return (
    <span style={{
      background: s.bg,
      color: s.color,
      fontSize: 11,
      fontWeight: 600,
      padding: "3px 10px",
      borderRadius: 20,
      fontFamily: "'DM Sans', sans-serif",
    }}>{s.label}</span>
  );
}

function AgentCard({ nome, desc, status, ultimo, icon }) {
  const statusMap = {
    ativo: { color: COLORS.success, dot: true },
    agendado: { color: COLORS.warning, dot: false },
    standby: { color: COLORS.muted, dot: false },
  };
  const s = statusMap[status];
  return (
    <div style={{
      background: COLORS.card,
      border: `1px solid ${COLORS.border}`,
      borderRadius: 10,
      padding: "14px 16px",
      display: "flex",
      alignItems: "center",
      gap: 12,
    }}>
      <div style={{
        width: 36, height: 36, borderRadius: 8,
        background: "#1E2028", display: "flex", alignItems: "center",
        justifyContent: "center", fontSize: 16, flexShrink: 0,
      }}>{icon}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: COLORS.text, fontFamily: "'Space Grotesk', sans-serif" }}>{nome}</div>
        <div style={{ fontSize: 11, color: COLORS.muted, marginTop: 2 }}>{desc}</div>
      </div>
      <div style={{ textAlign: "right", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 5, justifyContent: "flex-end" }}>
          {s.dot && <span style={{ width: 6, height: 6, borderRadius: "50%", background: s.color, display: "inline-block" }} />}
          <span style={{ fontSize: 11, color: s.color, fontWeight: 600 }}>{status}</span>
        </div>
        <div style={{ fontSize: 10, color: COLORS.muted, marginTop: 2 }}>{ultimo}</div>
      </div>
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: "#1E2028", border: `1px solid ${COLORS.border}`,
        borderRadius: 8, padding: "10px 14px", fontSize: 12,
        fontFamily: "'DM Sans', sans-serif", color: COLORS.text,
      }}>
        <div style={{ fontWeight: 600, marginBottom: 6 }}>{label}</div>
        {payload.map((p, i) => (
          <div key={i} style={{ color: p.color, marginBottom: 2 }}>
            {p.name}: {typeof p.value === "number" && p.name !== "Conversões" ? `R$${p.value.toLocaleString("pt-BR")}` : p.value}
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const agentes = [
  { nome: "Monitor Meta Ads", desc: "Leitura em tempo real via API", status: "ativo", ultimo: "agora", icon: "M" },
  { nome: "Detector de Anomalias", desc: "Alerta de métricas fora do padrão", status: "ativo", ultimo: "há 2 min", icon: "🔍" },
  { nome: "Otimizador de Lances", desc: "Ajuste automático de bids", status: "standby", ultimo: "em breve", icon: "⚡" },
  { nome: "Gerador de Relatórios", desc: "Relatório semanal automatizado", status: "agendado", ultimo: "seg 8h", icon: "📊" },
  { nome: "Criativo Assistant", desc: "Sugestões de copy e criativos", status: "standby", ultimo: "sob demanda", icon: "✍️" },
  { nome: "Monitor Google Ads", desc: "Integração em breve", status: "standby", ultimo: "—", icon: "G" },
];

export default function AdsDashboard() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [now, setNow] = useState(new Date());
  const [campanhas, setCampanhas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);
  const [ultimaAtualizacao, setUltimaAtualizacao] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiInput, setAiInput] = useState("");
  const [chatHistory, setChatHistory] = useState([]);const [filtro, setFiltro] = useState("Todas");
const campanhasFiltradas = campanhas.filter(c =>
  filtro === "Todas" ? true : filtro === "Ativas" ? c.status === "ACTIVE" : c.status === "PAUSED"
);
  const chatEndRef = useRef(null);

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (chatEndRef.current) chatEndRef.current.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory]);

  async function buscarDadosMeta() {
    setLoading(true);
    setErro(null);
    try {
      // Buscar campanhas com insights (spend, impressions, clicks, conversions)
      const url = `/api/meta`;
      const res = await fetch(url);
      const data = await res.json();

      if (data.error) {
        throw new Error(data.error.message);
      }

      const campanhasFormatadas = data.data.map(c => {
        const insights = c.insights?.data?.[0] || {};
        const spend = parseFloat(insights.spend || 0);
        const clicks = parseInt(insights.clicks || 0);
        const impressions = parseInt(insights.impressions || 0);
        const actions = insights.actions || [];
        const conversoes = actions
          .filter(a => ["purchase", "lead", "complete_registration", "subscribe"].includes(a.action_type))
          .reduce((sum, a) => sum + parseInt(a.value || 0), 0);
        const cpa = conversoes > 0 ? spend / conversoes : 0;
        const ctr = impressions > 0 ? (clicks / impressions * 100) : 0;

        return {
          nome: c.nome || c.name,
          status: c.status,
          investimento: spend,
          conversoes,
          cpa,
          ctr,
          impressions,
          clicks,
          budget: c.daily_budget ? parseFloat(c.daily_budget) / 100 : null,
        };
      });

      setCampanhas(campanhasFormatadas);
      setUltimaAtualizacao(new Date());
    } catch (e) {
      setErro(e.message);
    }
    setLoading(false);
  }

  useEffect(() => {
    buscarDadosMeta();
    // Atualiza a cada 30 minutos
    const intervalo = setInterval(buscarDadosMeta, 30 * 60 * 1000);
    return () => clearInterval(intervalo);
  }, []);

  const campanhasAtivas = campanhas.filter(c => c.status === "ACTIVE");
  const totalInvestimento = campanhas.reduce((a, c) => a + c.investimento, 0);
  const totalConversoes = campanhas.reduce((a, c) => a + c.conversoes, 0);
  const cpaMedio = totalConversoes > 0 ? totalInvestimento / totalConversoes : 0;
  const totalImpressions = campanhas.reduce((a, c) => a + c.impressions, 0);

  async function askAI(pergunta) {
    if (!pergunta.trim()) return;
    setAiLoading(true);
    setAiInput("");
    const novaMensagem = { role: "user", content: pergunta };
    const novoHistorico = [...chatHistory, novaMensagem];
    setChatHistory(novoHistorico);

    const contexto = `Você é um gestor de tráfego pago especialista em Meta Ads. Dados REAIS atuais das campanhas (últimos 7 dias):
Total investido: R$${totalInvestimento.toFixed(2)}
Total conversões: ${totalConversoes}
CPA médio: R$${cpaMedio.toFixed(2)}
Total impressões: ${totalImpressions.toLocaleString("pt-BR")}
Campanhas ativas: ${campanhasAtivas.length} de ${campanhas.length}

Campanhas:
${campanhas.slice(0, 15).map(c => `- ${c.nome} (${c.status}): Gasto R$${c.investimento.toFixed(2)}, ${c.conversoes} conversões, CPA R$${c.cpa.toFixed(2)}, CTR ${c.ctr.toFixed(2)}%`).join("\n")}

Responda de forma direta e prática, com recomendações específicas para essas campanhas reais. Use linguagem clara e objetiva.`;

    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: contexto,
          messages: novoHistorico,
        }),
      });
      const data = await response.json();
      const resposta = data.content?.[0]?.text || "Erro ao obter resposta.";
      setChatHistory([...novoHistorico, { role: "assistant", content: resposta }]);
    } catch (e) {
      setChatHistory([...novoHistorico, { role: "assistant", content: "Erro ao conectar com o agente." }]);
    }
    setAiLoading(false);
  }

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: "📊" },
    { id: "campanhas", label: "Campanhas", icon: "📢" },
    { id: "agentes", label: "Agentes IA", icon: "🤖" },
    { id: "chat", label: "Consultar IA", icon: "💬" },
  ];

  return (
    <div style={{ display: "flex", height: "100vh", background: COLORS.bg, fontFamily: "'DM Sans', sans-serif", color: COLORS.text }}>
      <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;600;700&family=DM+Sans:wght@400;500;600&display=swap" rel="stylesheet" />
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} } @keyframes spin { to{transform:rotate(360deg)} }`}</style>

      {/* Sidebar */}
      <div style={{ width: 220, background: COLORS.card, borderRight: `1px solid ${COLORS.border}`, display: "flex", flexDirection: "column", flexShrink: 0 }}>
        <div style={{ padding: "24px 20px 16px", borderBottom: `1px solid ${COLORS.border}` }}>
          <div style={{ fontSize: 16, fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif" }}>⚡ Ads Agent</div>
          <div style={{ fontSize: 11, color: COLORS.muted, marginTop: 4 }}>{now.toLocaleTimeString("pt-BR")}</div>
        </div>
        <div style={{ padding: "12px 10px", flex: 1 }}>
          {navItems.map(item => (
            <div key={item.id} onClick={() => setActiveTab(item.id)} style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "10px 12px", borderRadius: 8, cursor: "pointer",
              background: activeTab === item.id ? "#1E2028" : "transparent",
              color: activeTab === item.id ? COLORS.text : COLORS.muted,
              fontSize: 13, fontWeight: activeTab === item.id ? 600 : 400,
              marginBottom: 2, transition: "all 0.15s",
            }}>
              <span>{item.icon}</span>{item.label}
            </div>
          ))}
        </div>
        <div style={{ padding: "16px 20px", borderTop: `1px solid ${COLORS.border}`, fontSize: 11, color: COLORS.muted }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: erro ? COLORS.danger : COLORS.success, display: "inline-block" }} />
            {erro ? "API com erro" : "Meta API conectada"}
          </div>
          {ultimaAtualizacao && (
            <div style={{ marginTop: 4 }}>Atualizado {ultimaAtualizacao.toLocaleTimeString("pt-BR")}</div>
          )}
        </div>
      </div>

      {/* Main */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* Topbar */}
        <div style={{
          height: 56, background: COLORS.card, borderBottom: `1px solid ${COLORS.border}`,
          display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 24px",
        }}>
          <div style={{ fontSize: 15, fontWeight: 600, fontFamily: "'Space Grotesk', sans-serif" }}>
            {navItems.find(n => n.id === activeTab)?.label}
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {erro && (
              <span style={{ background: "#1A0808", color: COLORS.danger, border: `1px solid ${COLORS.danger}44`, fontSize: 11, fontWeight: 600, padding: "4px 10px", borderRadius: 20 }}>
                ⚠️ Erro na API
              </span>
            )}
            <button onClick={buscarDadosMeta} disabled={loading} style={{
              background: "#1E2028", border: `1px solid ${COLORS.border}`, borderRadius: 8,
              padding: "5px 12px", color: COLORS.muted, fontSize: 11, cursor: "pointer",
              opacity: loading ? 0.5 : 1,
            }}>
              {loading ? "⟳ Atualizando..." : "⟳ Atualizar"}
            </button>
            <span style={{ background: "#052E16", color: COLORS.success, border: `1px solid ${COLORS.success}44`, fontSize: 11, fontWeight: 600, padding: "4px 10px", borderRadius: 20 }}>
              ● Meta API
            </span>
          </div>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflow: "auto", padding: 24 }}>

          {/* Erro banner */}
          {erro && (
            <div style={{ background: "#1A0808", border: `1px solid ${COLORS.danger}44`, borderRadius: 10, padding: "12px 16px", marginBottom: 16, fontSize: 13, color: COLORS.danger }}>
              ⚠️ Erro ao buscar dados da Meta: {erro}. Verifique se o token ainda é válido.
            </div>
          )}

          {/* DASHBOARD TAB */}
          {activeTab === "dashboard" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
                <MetricCard loading={loading} label="Investimento (7d)" value={`R$${totalInvestimento.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} sub="Meta Ads — dados reais" subType="up" icon="💰" />
                <MetricCard loading={loading} label="Conversões (7d)" value={totalConversoes} sub={`${campanhasAtivas.length} campanhas ativas`} subType="up" icon="🎯" />
                <MetricCard loading={loading} label="CPA médio" value={cpaMedio > 0 ? `R$${cpaMedio.toFixed(2)}` : "—"} sub="Custo por conversão" subType={cpaMedio > 150 ? "down" : "up"} icon="📉" />
                <MetricCard loading={loading} label="Impressões (7d)" value={totalImpressions > 0 ? totalImpressions.toLocaleString("pt-BR") : "—"} sub="Alcance total" subType="up" icon="👁️" />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: "20px 24px" }}>
                  <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 16, fontFamily: "'Space Grotesk', sans-serif" }}>Investimento por dia (estimado)</div>
                  <ResponsiveContainer width="100%" height={180}>
                    <LineChart data={mockPerfData}>
                      <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} />
                      <XAxis dataKey="day" tick={{ fill: COLORS.muted, fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: COLORS.muted, fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `R$${(v / 1000).toFixed(1)}k`} />
                      <Tooltip content={<CustomTooltip />} />
                      <Line type="monotone" dataKey="meta" name="Meta" stroke={COLORS.meta} strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: "20px 24px" }}>
                  <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4, fontFamily: "'Space Grotesk', sans-serif" }}>Top campanhas por gasto</div>
                  <div style={{ fontSize: 11, color: COLORS.muted, marginBottom: 12 }}>Dados reais dos últimos 7 dias</div>
                  {loading ? (
                    <div style={{ color: COLORS.muted, fontSize: 13, textAlign: "center", paddingTop: 40 }}>Carregando...</div>
                  ) : campanhas.filter(c => c.investimento > 0).length === 0 ? (
                    <div style={{ color: COLORS.muted, fontSize: 13, textAlign: "center", paddingTop: 40 }}>Nenhum gasto nos últimos 7 dias</div>
                  ) : (
                    <ResponsiveContainer width="100%" height={180}>
                      <BarChart data={campanhas.filter(c => c.investimento > 0).slice(0, 5).map(c => ({ name: c.nome.substring(0, 15) + "...", valor: parseFloat(c.investimento.toFixed(2)) }))}>
                        <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} />
                        <XAxis dataKey="name" tick={{ fill: COLORS.muted, fontSize: 9 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill: COLORS.muted, fontSize: 11 }} axisLine={false} tickLine={false} />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="valor" name="Gasto R$" fill={COLORS.meta} radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>

              {/* Status geral */}
              <div style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: "20px 24px" }}>
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 16, fontFamily: "'Space Grotesk', sans-serif" }}>Resumo da conta</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
                  {[
                    { label: "Campanhas ativas", value: campanhasAtivas.length, color: COLORS.success },
                    { label: "Campanhas pausadas", value: campanhas.filter(c => c.status === "PAUSED").length, color: COLORS.warning },
                    { label: "Total de campanhas", value: campanhas.length, color: COLORS.muted },
                  ].map((item, i) => (
                    <div key={i} style={{ background: "#0A0B0F", borderRadius: 10, padding: "16px 20px" }}>
                      <div style={{ fontSize: 11, color: COLORS.muted, marginBottom: 8 }}>{item.label}</div>
                      <div style={{ fontSize: 32, fontWeight: 700, color: item.color, fontFamily: "'Space Grotesk', sans-serif" }}>
                        {loading ? "—" : item.value}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* CAMPANHAS TAB */}
          {activeTab === "campanhas" && (
            <div style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: "20px 24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <div style={{ fontSize: 13, fontWeight: 600, fontFamily: "'Space Grotesk', sans-serif" }}>
                  Campanhas — Meta Ads (últimos 7 dias)
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  {["Todas", "Ativas", "Pausadas"].map(f => (
                    <button key={f} onClick={() => setFiltro(f)} style={{
                      background: filtro === f ? COLORS.accent : "#1E2028",
                      border: `1px solid ${filtro === f ? COLORS.accent : COLORS.border}`,
                      borderRadius: 8, padding: "5px 14px", color: filtro === f ? "#000" : COLORS.muted,
                      fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
                    }}>{f}</button>
                  ))}
                  <span style={{ fontSize: 11, color: COLORS.muted, alignSelf: "center", marginLeft: 4 }}>
                    {campanhasFiltradas.length} campanhas
                  </span>
                </div>
              </div>
              {loading ? (
                <div style={{ textAlign: "center", padding: 40, color: COLORS.muted }}>Carregando dados reais...</div>
              ) : (
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                  <thead>
                    <tr style={{ borderBottom: `1px solid ${COLORS.border}` }}>
                      {["Campanha", "Status", "Gasto (7d)", "Conversões", "CPA", "CTR", "Impressões"].map(h => (
                        <th key={h} style={{ textAlign: "left", padding: "8px 12px", fontSize: 11, color: COLORS.muted, fontWeight: 600, paddingBottom: 12 }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody
                    {campanhasFiltradas.map((c, i) =>
                      <tr key={i} style={{ borderBottom: `1px solid ${COLORS.border}` }}>
                        <td style={{ padding: "14px 12px", color: COLORS.text, fontWeight: 500, maxWidth: 220 }}>
                          <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.nome}</div>
                        </td>
                        <td style={{ padding: "14px 12px" }}><StatusBadge status={c.status} /></td>
                        <td style={{ padding: "14px 12px", color: COLORS.text }}>
                          {c.investimento > 0 ? `R$${c.investimento.toFixed(2)}` : "—"}
                        </td>
                        <td style={{ padding: "14px 12px", color: COLORS.text }}>{c.conversoes || "—"}</td>
                        <td style={{ padding: "14px 12px", color: c.cpa > 150 ? COLORS.danger : c.cpa > 0 ? COLORS.text : COLORS.muted }}>
                          {c.cpa > 0 ? `R$${c.cpa.toFixed(2)}` : "—"}
                        </td>
                        <td style={{ padding: "14px 12px", color: COLORS.text }}>
                          {c.ctr > 0 ? `${c.ctr.toFixed(2)}%` : "—"}
                        </td>
                        <td style={{ padding: "14px 12px", color: COLORS.muted }}>
                          {c.impressions > 0 ? c.impressions.toLocaleString("pt-BR") : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* AGENTES TAB */}
          {activeTab === "agentes" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ background: "#061A0A", border: `1px solid ${COLORS.success}33`, borderRadius: 12, padding: "16px 20px", fontSize: 13, color: COLORS.success }}>
                ● Meta Ads API conectada — dados atualizando a cada 30 minutos automaticamente
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                {agentes.map((a, i) => <AgentCard key={i} {...a} />)}
              </div>
            </div>
          )}

          {/* CHAT TAB */}
          {activeTab === "chat" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16, height: "100%" }}>
              <div style={{
                background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 12,
                padding: "20px 24px", flex: 1, display: "flex", flexDirection: "column",
                gap: 12, minHeight: 300, maxHeight: 420, overflowY: "auto",
              }}>
                {chatHistory.length === 0 && (
                  <div style={{ color: COLORS.muted, fontSize: 13, textAlign: "center", marginTop: 40 }}>
                    <div style={{ fontSize: 32, marginBottom: 12 }}>🤖</div>
                    <div>Agente com acesso aos seus dados reais do Meta Ads</div>
                    <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 8, alignItems: "center" }}>
                      {[
                        "Quais campanhas estão gastando mais?",
                        "Qual campanha tem melhor CPA?",
                        "O que devo pausar agora?",
                      ].map((s, i) => (
                        <button key={i} onClick={() => askAI(s)} style={{
                          background: "#1E2028", border: `1px solid ${COLORS.border}`, borderRadius: 8,
                          padding: "8px 16px", color: COLORS.muted, fontSize: 12, cursor: "pointer",
                          fontFamily: "'DM Sans', sans-serif",
                        }}>{s}</button>
                      ))}
                    </div>
                  </div>
                )}
                {chatHistory.map((msg, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start" }}>
                    <div style={{
                      maxWidth: "80%", background: msg.role === "user" ? "#1E2028" : "#061A0A",
                      border: `1px solid ${msg.role === "user" ? COLORS.border : COLORS.success + "33"}`,
                      borderRadius: 10, padding: "10px 14px", fontSize: 13, color: COLORS.text,
                      lineHeight: 1.6, whiteSpace: "pre-wrap",
                    }}>
                      {msg.role === "assistant" && <div style={{ fontSize: 11, color: COLORS.success, marginBottom: 6, fontWeight: 600 }}>🤖 Agente — dados reais</div>}
                      {msg.content}
                    </div>
                  </div>
                ))}
                {aiLoading && (
                  <div style={{ display: "flex", alignItems: "center", gap: 8, color: COLORS.muted, fontSize: 13 }}>
                    <span>🤖</span> Analisando suas campanhas reais...
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <input
                  value={aiInput}
                  onChange={e => setAiInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && askAI(aiInput)}
                  placeholder="Pergunte sobre suas campanhas reais..."
                  style={{
                    flex: 1, background: COLORS.card, border: `1px solid ${COLORS.border}`,
                    borderRadius: 10, padding: "12px 16px", color: COLORS.text, fontSize: 13,
                    fontFamily: "'DM Sans', sans-serif", outline: "none",
                  }}
                />
                <button onClick={() => askAI(aiInput)} disabled={aiLoading || !aiInput.trim()} style={{
                  background: COLORS.accent, border: "none", borderRadius: 10, padding: "12px 20px",
                  color: "#000", fontSize: 13, fontWeight: 700, cursor: "pointer",
                  fontFamily: "'DM Sans', sans-serif", opacity: aiLoading || !aiInput.trim() ? 0.5 : 1,
                }}>Enviar</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
 
