import { useState, useEffect, useRef } from "react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const COLORS = {
  google: "#4285F4", meta: "#0866FF", accent: "#00D4AA", danger: "#FF4D4F",
  warning: "#FAAD14", success: "#52C41A", bg: "#0A0B0F", card: "#12141A",
  border: "#1E2028", text: "#E8EAF0", muted: "#6B7280",
};

const META_TOKEN = "EAAqis7UPhZAUBRdhHjcr0CrhZAKsVRZBcbHCEJcOglhx9wOP0ckZBBYaw6uZBDjGcVtj1QHeDzKlRPFdczT154DKAjZCAJzQ0nTZAGJ99wYsxcNxlSbtfBb4GksNnkPteREZBeqnZB4qr61cFKyyOTXLyAWKumDGwa5j9DWSxrbQcWFLXWMJlEMXJygI7lGDcCQZDZD";
const META_ACCOUNT_ID = "act_480556106171722";

const PERIODOS = [
  { label: "Hoje", value: "today" },
  { label: "Ontem", value: "yesterday" },
  { label: "Últimos 7 dias", value: "last_7d" },
  { label: "Últimos 14 dias", value: "last_14d" },
  { label: "Últimos 30 dias", value: "last_30d" },
  { label: "Este mês", value: "this_month" },
  { label: "Mês passado", value: "last_month" },
  { label: "Personalizado", value: "custom" },
];

const COLUNAS_DISPONIVEIS = [
  { id: "gasto", label: "Gasto", default: true },
  { id: "impressoes", label: "Impressões", default: true },
  { id: "alcance", label: "Alcance", default: false },
  { id: "cliques", label: "Cliques", default: true },
  { id: "ctr", label: "CTR", default: true },
  { id: "cpc", label: "CPC", default: false },
  { id: "cpm", label: "CPM", default: false },
  { id: "conversoes", label: "Conversões", default: true },
  { id: "cpa", label: "CPA", default: true },
  { id: "roas", label: "ROAS", default: false },
  { id: "frequencia", label: "Frequência", default: false },
  { id: "leads", label: "Leads", default: false },
  { id: "compras", label: "Compras", default: false },
  { id: "cadastros", label: "Cadastros", default: false },
  { id: "mensagens", label: "Mensagens iniciadas", default: false },
  { id: "visualizacoes", label: "Views de vídeo", default: false },
  { id: "budget", label: "Budget diário", default: false },
];

function getColunaValor(c, colId) {
  switch (colId) {
    case "gasto": return c.investimento > 0 ? `R$${c.investimento.toFixed(2)}` : "—";
    case "impressoes": return c.impressions > 0 ? c.impressions.toLocaleString("pt-BR") : "—";
    case "alcance": return c.reach > 0 ? c.reach.toLocaleString("pt-BR") : "—";
    case "cliques": return c.clicks > 0 ? c.clicks.toLocaleString("pt-BR") : "—";
    case "ctr": return c.ctr > 0 ? `${c.ctr.toFixed(2)}%` : "—";
    case "cpc": return c.clicks > 0 && c.investimento > 0 ? `R$${(c.investimento / c.clicks).toFixed(2)}` : "—";
    case "cpm": return c.impressions > 0 && c.investimento > 0 ? `R$${((c.investimento / c.impressions) * 1000).toFixed(2)}` : "—";
    case "conversoes": return c.conversoes > 0 ? c.conversoes : "—";
    case "cpa": return c.cpa > 0 ? `R$${c.cpa.toFixed(2)}` : "—";
    case "roas": return c.roas > 0 ? `${c.roas.toFixed(1)}x` : "—";
    case "frequencia": return c.frequencia > 0 ? c.frequencia.toFixed(2) : "—";
    case "leads": return c.leads > 0 ? c.leads : "—";
    case "compras": return c.compras > 0 ? c.compras : "—";
    case "cadastros": return c.cadastros > 0 ? c.cadastros : "—";
    case "mensagens": return c.mensagens > 0 ? c.mensagens : "—";
    case "visualizacoes": return c.visualizacoes > 0 ? c.visualizacoes.toLocaleString("pt-BR") : "—";
    case "budget": return c.budget > 0 ? `R$${c.budget.toFixed(2)}` : "—";
    default: return "—";
  }
}

function getColunaColor(c, colId) {
  if (colId === "cpa") return c.cpa > 150 ? COLORS.danger : c.cpa > 0 ? COLORS.text : COLORS.muted;
  if (colId === "roas") return c.roas >= 3.5 ? COLORS.success : c.roas >= 2 ? COLORS.warning : c.roas > 0 ? COLORS.danger : COLORS.muted;
  if (colId === "ctr") return c.ctr > 2 ? COLORS.success : c.ctr > 0 ? COLORS.text : COLORS.muted;
  return COLORS.text;
}

function MetricCard({ label, value, sub, subType, icon, loading }) {
  return (
    <div style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: "20px 24px", display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 13, color: COLORS.muted }}>{label}</span>
        <span style={{ fontSize: 20 }}>{icon}</span>
      </div>
      {loading ? (
        <div style={{ height: 36, background: COLORS.border, borderRadius: 6, animation: "pulse 1.5s infinite" }} />
      ) : (
        <div style={{ fontSize: 28, fontWeight: 700, color: COLORS.text, fontFamily: "'Space Grotesk', sans-serif", letterSpacing: -1 }}>{value}</div>
      )}
      <div style={{ fontSize: 12, color: subType === "up" ? COLORS.success : subType === "down" ? COLORS.danger : COLORS.warning }}>{sub}</div>
    </div>
  );
}

function StatusBadge({ status }) {
  const map = {
    ACTIVE: { bg: "#052E16", color: COLORS.success, label: "Ativa" },
    PAUSED: { bg: "#2D1B00", color: COLORS.warning, label: "Pausada" },
  };
  const s = map[status] || map.PAUSED;
  return <span style={{ background: s.bg, color: s.color, fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 20 }}>{s.label}</span>;
}

function AgentCard({ nome, desc, status, ultimo, icon }) {
  const statusMap = { ativo: { color: COLORS.success, dot: true }, agendado: { color: COLORS.warning, dot: false }, standby: { color: COLORS.muted, dot: false } };
  const s = statusMap[status];
  return (
    <div style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 10, padding: "14px 16px", display: "flex", alignItems: "center", gap: 12 }}>
      <div style={{ width: 36, height: 36, borderRadius: 8, background: "#1E2028", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>{icon}</div>
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
      <div style={{ background: "#1E2028", border: `1px solid ${COLORS.border}`, borderRadius: 8, padding: "10px 14px", fontSize: 12, color: COLORS.text }}>
        <div style={{ fontWeight: 600, marginBottom: 6 }}>{label}</div>
        {payload.map((p, i) => <div key={i} style={{ color: p.color }}>{p.name}: R${p.value?.toLocaleString("pt-BR")}</div>)}
      </div>
    );
  }
  return null;
};

// Seletor de período
function SeletorPeriodo({ periodo, setPeriodo, dataInicio, setDataInicio, dataFim, setDataFim, onAplicar }) {
  const [aberto, setAberto] = useState(false);
  const [tempInicio, setTempInicio] = useState(dataInicio);
  const [tempFim, setTempFim] = useState(dataFim);
  const [tempPeriodo, setTempPeriodo] = useState(periodo);

  const labelAtual = periodo === "custom"
    ? `${dataInicio} → ${dataFim}`
    : PERIODOS.find(p => p.value === periodo)?.label || "Últimos 7 dias";

  function aplicar() {
    setPeriodo(tempPeriodo);
    if (tempPeriodo === "custom") {
      setDataInicio(tempInicio);
      setDataFim(tempFim);
    }
    setAberto(false);
    onAplicar(tempPeriodo, tempInicio, tempFim);
  }

  return (
    <div style={{ position: "relative" }}>
      <button onClick={() => setAberto(!aberto)} style={{
        background: "#1E2028", border: `1px solid ${COLORS.border}`, borderRadius: 8,
        padding: "6px 14px", color: COLORS.text, fontSize: 12, fontWeight: 600,
        cursor: "pointer", display: "flex", alignItems: "center", gap: 6,
      }}>
        📅 {labelAtual}
      </button>

      {aberto && (
        <div style={{
          position: "absolute", right: 0, top: 40, zIndex: 200,
          background: "#1E2028", border: `1px solid ${COLORS.border}`,
          borderRadius: 12, padding: 16, width: 280,
          boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
        }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: COLORS.muted, marginBottom: 12 }}>PERÍODO</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: 16 }}>
            {PERIODOS.map(p => (
              <button key={p.value} onClick={() => setTempPeriodo(p.value)} style={{
                background: tempPeriodo === p.value ? COLORS.accent + "22" : "transparent",
                border: `1px solid ${tempPeriodo === p.value ? COLORS.accent : "transparent"}`,
                borderRadius: 6, padding: "7px 12px", color: tempPeriodo === p.value ? COLORS.accent : COLORS.muted,
                fontSize: 13, cursor: "pointer", textAlign: "left", fontWeight: tempPeriodo === p.value ? 600 : 400,
              }}>{p.label}</button>
            ))}
          </div>

          {tempPeriodo === "custom" && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 11, color: COLORS.muted, marginBottom: 8 }}>DATAS PERSONALIZADAS</div>
              <div style={{ display: "flex", gap: 8, flexDirection: "column" }}>
                <div>
                  <div style={{ fontSize: 11, color: COLORS.muted, marginBottom: 4 }}>De</div>
                  <input type="date" value={tempInicio} onChange={e => setTempInicio(e.target.value)} style={{
                    width: "100%", background: "#0A0B0F", border: `1px solid ${COLORS.border}`,
                    borderRadius: 6, padding: "6px 10px", color: COLORS.text, fontSize: 12,
                    outline: "none", boxSizing: "border-box",
                  }} />
                </div>
                <div>
                  <div style={{ fontSize: 11, color: COLORS.muted, marginBottom: 4 }}>Até</div>
                  <input type="date" value={tempFim} onChange={e => setTempFim(e.target.value)} style={{
                    width: "100%", background: "#0A0B0F", border: `1px solid ${COLORS.border}`,
                    borderRadius: 6, padding: "6px 10px", color: COLORS.text, fontSize: 12,
                    outline: "none", boxSizing: "border-box",
                  }} />
                </div>
              </div>
            </div>
          )}

          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => setAberto(false)} style={{
              flex: 1, background: "transparent", border: `1px solid ${COLORS.border}`,
              borderRadius: 8, padding: "8px", color: COLORS.muted, fontSize: 12, cursor: "pointer",
            }}>Cancelar</button>
            <button onClick={aplicar} style={{
              flex: 1, background: COLORS.accent, border: "none",
              borderRadius: 8, padding: "8px", color: "#000", fontSize: 12, fontWeight: 700, cursor: "pointer",
            }}>Aplicar</button>
          </div>
        </div>
      )}
    </div>
  );
}

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
  const [chatHistory, setChatHistory] = useState([]);
  const [filtro, setFiltro] = useState("Todas");
  const [colunasAtivas, setColunasAtivas] = useState(COLUNAS_DISPONIVEIS.filter(c => c.default).map(c => c.id));
  const [showSeletorColunas, setShowSeletorColunas] = useState(false);
  const [periodo, setPeriodo] = useState("last_7d");
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const chatEndRef = useRef(null);

  const campanhasFiltradas = campanhas.filter(c =>
    filtro === "Todas" ? true : filtro === "Ativas" ? c.status === "ACTIVE" : c.status === "PAUSED"
  );
  const colunasVisiveis = COLUNAS_DISPONIVEIS.filter(c => colunasAtivas.includes(c.id));

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (chatEndRef.current) chatEndRef.current.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory]);

  async function buscarDadosMeta(p = periodo, inicio = dataInicio, fim = dataFim) {
    setLoading(true);
    setErro(null);
    try {
      let url = `/api/meta?periodo=${p}`;
      if (p === "custom" && inicio && fim) {
        url += `&inicio=${inicio}&fim=${fim}`;
      }
      const res = await fetch(url);
      const data = await res.json();
      if (data.error) throw new Error(data.error.message);

      const campanhasFormatadas = data.data.map(c => {
        const insights = c.insights?.data?.[0] || {};
        const spend = parseFloat(insights.spend || 0);
        const clicks = parseInt(insights.clicks || 0);
        const impressions = parseInt(insights.impressions || 0);
        const reach = parseInt(insights.reach || 0);
        const actions = insights.actions || [];
        const getAction = (types) => actions.filter(a => types.includes(a.action_type)).reduce((sum, a) => sum + parseInt(a.value || 0), 0);
        const conversoes = getAction(["purchase", "lead", "complete_registration", "subscribe"]);
        const compras = getAction(["purchase", "omni_purchase", "web_in_store_purchase"]);
        const leads = getAction(["lead", "onsite_conversion.lead"]);
        const cadastros = getAction(["complete_registration", "omni_complete_registration"]);
        const mensagens = getAction(["onsite_conversion.messaging_conversation_started_7d"]);
        const visualizacoes = getAction(["video_view"]);
        const cpa = conversoes > 0 ? spend / conversoes : 0;
        const ctr = impressions > 0 ? (clicks / impressions * 100) : 0;
        const roas = spend > 0 && compras > 0 ? (compras * 100) / spend : 0;
        const frequencia = reach > 0 && impressions > 0 ? impressions / reach : 0;
        return {
          nome: c.name, status: c.status, investimento: spend,
          conversoes, compras, leads, cadastros, mensagens, visualizacoes,
          cpa, ctr, roas, frequencia, impressions, clicks, reach,
          budget: c.daily_budget ? parseFloat(c.daily_budget) / 100 : 0,
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
    const intervalo = setInterval(() => buscarDadosMeta(), 30 * 60 * 1000);
    return () => clearInterval(intervalo);
  }, []);

  const campanhasAtivas = campanhas.filter(c => c.status === "ACTIVE");
  const totalInvestimento = campanhas.reduce((a, c) => a + c.investimento, 0);
  const totalConversoes = campanhas.reduce((a, c) => a + c.conversoes, 0);
  const cpaMedio = totalConversoes > 0 ? totalInvestimento / totalConversoes : 0;
  const totalImpressions = campanhas.reduce((a, c) => a + c.impressions, 0);

  function toggleColuna(id) {
    setColunasAtivas(prev => prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]);
  }

  async function askAI(pergunta) {
    if (!pergunta.trim()) return;
    setAiLoading(true);
    setAiInput("");
    const novaMensagem = { role: "user", content: pergunta };
    const novoHistorico = [...chatHistory, novaMensagem];
    setChatHistory(novoHistorico);
    const periodoLabel = PERIODOS.find(p => p.value === periodo)?.label || periodo;
    const contexto = `Você é um gestor de tráfego pago especialista em Meta Ads. Dados REAIS (${periodoLabel}):
Total investido: R$${totalInvestimento.toFixed(2)} | Conversões: ${totalConversoes} | CPA médio: R$${cpaMedio.toFixed(2)}
Campanhas ativas: ${campanhasAtivas.length} de ${campanhas.length}
${campanhas.slice(0, 15).map(c => `- ${c.nome} (${c.status}): R$${c.investimento.toFixed(2)}, ${c.conversoes} conv, CPA R$${c.cpa.toFixed(2)}`).join("\n")}
Responda de forma direta e prática.`;

    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 1000, system: contexto, messages: novoHistorico }),
      });
      const data = await response.json();
      setChatHistory([...novoHistorico, { role: "assistant", content: data.content?.[0]?.text || "Erro." }]);
    } catch (e) {
      setChatHistory([...novoHistorico, { role: "assistant", content: "Erro ao conectar." }]);
    }
    setAiLoading(false);
  }

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: "📊" },
    { id: "campanhas", label: "Campanhas", icon: "📢" },
    { id: "agentes", label: "Agentes IA", icon: "🤖" },
    { id: "chat", label: "Consultar IA", icon: "💬" },
  ];

  const periodoLabel = PERIODOS.find(p => p.value === periodo)?.label || periodo;

  return (
    <div style={{ display: "flex", height: "100vh", background: COLORS.bg, fontFamily: "'DM Sans', sans-serif", color: COLORS.text }}>
      <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;600;700&family=DM+Sans:wght@400;500;600&display=swap" rel="stylesheet" />
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} } input[type="date"]::-webkit-calendar-picker-indicator { filter: invert(1); }`}</style>

      {/* Sidebar */}
      <div style={{ width: 220, background: COLORS.card, borderRight: `1px solid ${COLORS.border}`, display: "flex", flexDirection: "column", flexShrink: 0 }}>
        <div style={{ padding: "24px 20px 16px", borderBottom: `1px solid ${COLORS.border}` }}>
          <div style={{ fontSize: 16, fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif" }}>⚡ Ads Agent</div>
          <div style={{ fontSize: 11, color: COLORS.muted, marginTop: 4 }}>{now.toLocaleTimeString("pt-BR")}</div>
        </div>
        <div style={{ padding: "12px 10px", flex: 1 }}>
          {navItems.map(item => (
            <div key={item.id} onClick={() => setActiveTab(item.id)} style={{
              display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 8, cursor: "pointer",
              background: activeTab === item.id ? "#1E2028" : "transparent",
              color: activeTab === item.id ? COLORS.text : COLORS.muted,
              fontSize: 13, fontWeight: activeTab === item.id ? 600 : 400, marginBottom: 2,
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
          {ultimaAtualizacao && <div style={{ marginTop: 4 }}>Atualizado {ultimaAtualizacao.toLocaleTimeString("pt-BR")}</div>}
        </div>
      </div>

      {/* Main */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* Topbar */}
        <div style={{ height: 56, background: COLORS.card, borderBottom: `1px solid ${COLORS.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 24px" }}>
          <div style={{ fontSize: 15, fontWeight: 600, fontFamily: "'Space Grotesk', sans-serif" }}>
            {navItems.find(n => n.id === activeTab)?.label}
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <SeletorPeriodo
              periodo={periodo} setPeriodo={setPeriodo}
              dataInicio={dataInicio} setDataInicio={setDataInicio}
              dataFim={dataFim} setDataFim={setDataFim}
              onAplicar={(p, i, f) => buscarDadosMeta(p, i, f)}
            />
            {erro && <span style={{ background: "#1A0808", color: COLORS.danger, border: `1px solid ${COLORS.danger}44`, fontSize: 11, fontWeight: 600, padding: "4px 10px", borderRadius: 20 }}>⚠️ Erro</span>}
            <button onClick={() => buscarDadosMeta()} disabled={loading} style={{ background: "#1E2028", border: `1px solid ${COLORS.border}`, borderRadius: 8, padding: "5px 12px", color: COLORS.muted, fontSize: 11, cursor: "pointer", opacity: loading ? 0.5 : 1 }}>
              {loading ? "⟳ Atualizando..." : "⟳ Atualizar"}
            </button>
            <span style={{ background: "#052E16", color: COLORS.success, border: `1px solid ${COLORS.success}44`, fontSize: 11, fontWeight: 600, padding: "4px 10px", borderRadius: 20 }}>● Meta API</span>
          </div>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflow: "auto", padding: 24 }}>
          {erro && <div style={{ background: "#1A0808", border: `1px solid ${COLORS.danger}44`, borderRadius: 10, padding: "12px 16px", marginBottom: 16, fontSize: 13, color: COLORS.danger }}>⚠️ {erro}</div>}

          {/* DASHBOARD */}
          {activeTab === "dashboard" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div style={{ fontSize: 12, color: COLORS.muted }}>📅 {periodoLabel}</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
                <MetricCard loading={loading} label="Investimento" value={`R$${totalInvestimento.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`} sub="Meta Ads — dados reais" subType="up" icon="💰" />
                <MetricCard loading={loading} label="Conversões" value={totalConversoes} sub={`${campanhasAtivas.length} campanhas ativas`} subType="up" icon="🎯" />
                <MetricCard loading={loading} label="CPA médio" value={cpaMedio > 0 ? `R$${cpaMedio.toFixed(2)}` : "—"} sub="Custo por conversão" subType={cpaMedio > 150 ? "down" : "up"} icon="📉" />
                <MetricCard loading={loading} label="Impressões" value={totalImpressions > 0 ? totalImpressions.toLocaleString("pt-BR") : "—"} sub="Alcance total" subType="up" icon="👁️" />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: "20px 24px" }}>
                  <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4, fontFamily: "'Space Grotesk', sans-serif" }}>Top campanhas por gasto</div>
                  <div style={{ fontSize: 11, color: COLORS.muted, marginBottom: 12 }}>{periodoLabel}</div>
                  {loading ? <div style={{ color: COLORS.muted, fontSize: 13, textAlign: "center", paddingTop: 40 }}>Carregando...</div> :
                    campanhas.filter(c => c.investimento > 0).length === 0 ? <div style={{ color: COLORS.muted, fontSize: 13, textAlign: "center", paddingTop: 40 }}>Nenhum gasto no período</div> : (
                      <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={campanhas.filter(c => c.investimento > 0).slice(0, 5).map(c => ({ name: c.nome.substring(0, 12) + "...", valor: parseFloat(c.investimento.toFixed(2)) }))}>
                          <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} />
                          <XAxis dataKey="name" tick={{ fill: COLORS.muted, fontSize: 9 }} axisLine={false} tickLine={false} />
                          <YAxis tick={{ fill: COLORS.muted, fontSize: 11 }} axisLine={false} tickLine={false} />
                          <Tooltip content={<CustomTooltip />} />
                          <Bar dataKey="valor" name="Gasto R$" fill={COLORS.meta} radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                </div>
                <div style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: "20px 24px" }}>
                  <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 16, fontFamily: "'Space Grotesk', sans-serif" }}>Resumo da conta</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {[
                      { label: "Campanhas ativas", value: campanhasAtivas.length, color: COLORS.success },
                      { label: "Campanhas pausadas", value: campanhas.filter(c => c.status === "PAUSED").length, color: COLORS.warning },
                      { label: "Total de campanhas", value: campanhas.length, color: COLORS.muted },
                      { label: "Total de compras", value: campanhas.reduce((a, c) => a + c.compras, 0), color: COLORS.accent },
                      { label: "Total de leads", value: campanhas.reduce((a, c) => a + c.leads, 0), color: COLORS.google },
                    ].map((item, i) => (
                      <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: i < 4 ? `1px solid ${COLORS.border}` : "none" }}>
                        <span style={{ fontSize: 13, color: COLORS.muted }}>{item.label}</span>
                        <span style={{ fontSize: 20, fontWeight: 700, color: item.color, fontFamily: "'Space Grotesk', sans-serif" }}>{loading ? "—" : item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* CAMPANHAS */}
          {activeTab === "campanhas" && (
            <div style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: "20px 24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 8 }}>
                <div style={{ fontSize: 13, fontWeight: 600, fontFamily: "'Space Grotesk', sans-serif" }}>
                  Campanhas — {periodoLabel}
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                  {["Todas", "Ativas", "Pausadas"].map(f => (
                    <button key={f} onClick={() => setFiltro(f)} style={{
                      background: filtro === f ? COLORS.accent : "#1E2028",
                      border: `1px solid ${filtro === f ? COLORS.accent : COLORS.border}`,
                      borderRadius: 8, padding: "5px 14px", color: filtro === f ? "#000" : COLORS.muted,
                      fontSize: 12, fontWeight: 600, cursor: "pointer",
                    }}>{f}</button>
                  ))}
                  <span style={{ fontSize: 11, color: COLORS.muted }}>{campanhasFiltradas.length} campanhas</span>
                  <div style={{ position: "relative" }}>
                    <button onClick={() => setShowSeletorColunas(!showSeletorColunas)} style={{
                      background: showSeletorColunas ? COLORS.accent : "#1E2028",
                      border: `1px solid ${showSeletorColunas ? COLORS.accent : COLORS.border}`,
                      borderRadius: 8, padding: "5px 14px", color: showSeletorColunas ? "#000" : COLORS.muted,
                      fontSize: 12, fontWeight: 600, cursor: "pointer",
                    }}>⊞ Colunas</button>
                    {showSeletorColunas && (
                      <div style={{ position: "absolute", right: 0, top: 36, zIndex: 100, background: "#1E2028", border: `1px solid ${COLORS.border}`, borderRadius: 10, padding: 16, width: 280, boxShadow: "0 8px 32px rgba(0,0,0,0.4)" }}>
                        <div style={{ fontSize: 12, fontWeight: 600, color: COLORS.muted, marginBottom: 12 }}>MÉTRICAS VISÍVEIS</div>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                          {COLUNAS_DISPONIVEIS.map(col => (
                            <label key={col.id} style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 12, color: colunasAtivas.includes(col.id) ? COLORS.text : COLORS.muted }}>
                              <input type="checkbox" checked={colunasAtivas.includes(col.id)} onChange={() => toggleColuna(col.id)} style={{ accentColor: COLORS.accent, cursor: "pointer" }} />
                              {col.label}
                            </label>
                          ))}
                        </div>
                        <button onClick={() => setShowSeletorColunas(false)} style={{ marginTop: 14, width: "100%", background: COLORS.accent, border: "none", borderRadius: 8, padding: "8px", color: "#000", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>Aplicar</button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {loading ? <div style={{ textAlign: "center", padding: 40, color: COLORS.muted }}>Carregando...</div> : (
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                    <thead>
                      <tr style={{ borderBottom: `1px solid ${COLORS.border}` }}>
                        <th style={{ textAlign: "left", padding: "8px 12px", fontSize: 11, color: COLORS.muted, fontWeight: 600, paddingBottom: 12, whiteSpace: "nowrap" }}>Campanha</th>
                        <th style={{ textAlign: "left", padding: "8px 12px", fontSize: 11, color: COLORS.muted, fontWeight: 600, paddingBottom: 12 }}>Status</th>
                        {colunasVisiveis.map(col => (
                          <th key={col.id} style={{ textAlign: "left", padding: "8px 12px", fontSize: 11, color: COLORS.muted, fontWeight: 600, paddingBottom: 12, whiteSpace: "nowrap" }}>{col.label}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {campanhasFiltradas.map((c, i) => (
                        <tr key={i} style={{ borderBottom: `1px solid ${COLORS.border}` }}>
                          <td style={{ padding: "14px 12px", color: COLORS.text, fontWeight: 500, maxWidth: 200 }}>
                            <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.nome}</div>
                          </td>
                          <td style={{ padding: "14px 12px" }}><StatusBadge status={c.status} /></td>
                          {colunasVisiveis.map(col => (
                            <td key={col.id} style={{ padding: "14px 12px", color: getColunaColor(c, col.id), whiteSpace: "nowrap" }}>{getColunaValor(c, col.id)}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* AGENTES */}
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

          {/* CHAT */}
          {activeTab === "chat" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16, height: "100%" }}>
              <div style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: "20px 24px", flex: 1, display: "flex", flexDirection: "column", gap: 12, minHeight: 300, maxHeight: 420, overflowY: "auto" }}>
                {chatHistory.length === 0 && (
                  <div style={{ color: COLORS.muted, fontSize: 13, textAlign: "center", marginTop: 40 }}>
                    <div style={{ fontSize: 32, marginBottom: 12 }}>🤖</div>
                    <div>Agente com acesso aos seus dados reais — {periodoLabel}</div>
                    <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 8, alignItems: "center" }}>
                      {["Quais campanhas estão gastando mais?", "Qual campanha tem melhor CPA?", "O que devo pausar agora?"].map((s, i) => (
                        <button key={i} onClick={() => askAI(s)} style={{ background: "#1E2028", border: `1px solid ${COLORS.border}`, borderRadius: 8, padding: "8px 16px", color: COLORS.muted, fontSize: 12, cursor: "pointer" }}>{s}</button>
                      ))}
                    </div>
                  </div>
                )}
                {chatHistory.map((msg, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start" }}>
                    <div style={{ maxWidth: "80%", background: msg.role === "user" ? "#1E2028" : "#061A0A", border: `1px solid ${msg.role === "user" ? COLORS.border : COLORS.success + "33"}`, borderRadius: 10, padding: "10px 14px", fontSize: 13, color: COLORS.text, lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
                      {msg.role === "assistant" && <div style={{ fontSize: 11, color: COLORS.success, marginBottom: 6, fontWeight: 600 }}>🤖 Agente — {periodoLabel}</div>}
                      {msg.content}
                    </div>
                  </div>
                ))}
                {aiLoading && <div style={{ display: "flex", alignItems: "center", gap: 8, color: COLORS.muted, fontSize: 13 }}><span>🤖</span> Analisando...</div>}
                <div ref={chatEndRef} />
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <input value={aiInput} onChange={e => setAiInput(e.target.value)} onKeyDown={e => e.key === "Enter" && askAI(aiInput)} placeholder="Pergunte sobre suas campanhas..."
                  style={{ flex: 1, background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 10, padding: "12px 16px", color: COLORS.text, fontSize: 13, outline: "none" }} />
                <button onClick={() => askAI(aiInput)} disabled={aiLoading || !aiInput.trim()} style={{ background: COLORS.accent, border: "none", borderRadius: 10, padding: "12px 20px", color: "#000", fontSize: 13, fontWeight: 700, cursor: "pointer", opacity: aiLoading || !aiInput.trim() ? 0.5 : 1 }}>Enviar</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
