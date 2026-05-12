import { useState, useEffect, useRef } from "react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

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

const perfData = [
  { day: "Seg", google: 4200, meta: 3100, conversoes: 42 },
  { day: "Ter", google: 3800, meta: 3400, conversoes: 38 },
  { day: "Qua", google: 5100, meta: 2900, conversoes: 55 },
  { day: "Qui", google: 4700, meta: 3600, conversoes: 49 },
  { day: "Sex", google: 6200, meta: 4100, conversoes: 71 },
  { day: "Sáb", google: 5500, meta: 4800, conversoes: 63 },
  { day: "Dom", google: 4900, meta: 3200, conversoes: 44 },
];

const campanhas = [
  { nome: "Pesquisa — Marca", plataforma: "Google", status: "ativa", investimento: 8200, conversoes: 143, cpa: 57.3, roas: 6.2, tendencia: "up" },
  { nome: "Shopping — Produtos", plataforma: "Google", status: "ativa", investimento: 12400, conversoes: 89, cpa: 139.3, roas: 4.1, tendencia: "up" },
  { nome: "Conversão — Topo Funil", plataforma: "Meta", status: "aprendendo", investimento: 9100, conversoes: 61, cpa: 149.2, roas: 2.9, tendencia: "stable" },
  { nome: "Remarketing Carrinho", plataforma: "Meta", status: "pausada", investimento: 3200, conversoes: 12, cpa: 266.7, roas: 1.1, tendencia: "down" },
  { nome: "Vídeo — Awareness", plataforma: "Meta", status: "ativa", investimento: 4800, conversoes: 34, cpa: 141.2, roas: 3.4, tendencia: "up" },
  { nome: "Display — Retargeting", plataforma: "Google", status: "ativa", investimento: 2300, conversoes: 28, cpa: 82.1, roas: 5.1, tendencia: "stable" },
];

const alertas = [
  { tipo: "danger", titulo: "CPA crítico detectado", desc: "Remarketing Carrinho com CPA R$266 (meta R$80). Campanha pausada automaticamente.", tempo: "2 min atrás", acao: "Ver campanha" },
  { tipo: "warning", titulo: "Frequência alta no Meta", desc: "Conversão Topo Funil com frequência 4.8. Recomendado inserir novos criativos.", tempo: "18 min atrás", acao: "Ver sugestão" },
  { tipo: "warning", titulo: "Orçamento diário atingido", desc: "Shopping Produtos consumiu 100% do budget às 14h. Possível perda de conversões.", tempo: "1h atrás", acao: "Ajustar budget" },
  { tipo: "success", titulo: "Lance otimizado", desc: "Pesquisa Marca com CPC aumentado de R$1,20 → R$1,80. CTR melhorou 23%.", tempo: "3h atrás", acao: "Ver detalhes" },
];

const agentes = [
  { nome: "Monitor Google Ads", desc: "Análise horária de métricas", status: "ativo", ultimo: "há 4 min", icon: "G" },
  { nome: "Monitor Meta Ads", desc: "Análise horária de métricas", status: "ativo", ultimo: "há 4 min", icon: "M" },
  { nome: "Otimizador de Lances", desc: "Ajuste automático de bids", status: "ativo", ultimo: "há 12 min", icon: "⚡" },
  { nome: "Detector de Anomalias", desc: "Alerta de métricas fora do padrão", status: "ativo", ultimo: "há 2 min", icon: "🔍" },
  { nome: "Gerador de Relatórios", desc: "Relatório semanal automatizado", status: "agendado", ultimo: "seg 8h", icon: "📊" },
  { nome: "Criativo Assistant", desc: "Sugestões de copy e criativos", status: "standby", ultimo: "sob demanda", icon: "✍️" },
];

function MetricCard({ label, value, sub, subType, icon }) {
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
      <div style={{ fontSize: 28, fontWeight: 700, color: COLORS.text, fontFamily: "'Space Grotesk', sans-serif", letterSpacing: -1 }}>{value}</div>
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
    ativa: { bg: "#052E16", color: COLORS.success, label: "Ativa" },
    pausada: { bg: "#2D1B00", color: COLORS.warning, label: "Pausada" },
    aprendendo: { bg: "#0A1628", color: COLORS.google, label: "Aprendendo" },
  };
  const s = map[status] || map.ativa;
  return (
    <span style={{
      background: s.bg,
      color: s.color,
      fontSize: 11,
      fontWeight: 600,
      padding: "3px 10px",
      borderRadius: 20,
      fontFamily: "'DM Sans', sans-serif",
      letterSpacing: 0.3,
    }}>{s.label}</span>
  );
}

function AlertItem({ tipo, titulo, desc, tempo, acao }) {
  const map = {
    danger: { border: COLORS.danger, icon: "🚨", bg: "#1A0808" },
    warning: { border: COLORS.warning, icon: "⚠️", bg: "#1A1200" },
    success: { border: COLORS.success, icon: "✅", bg: "#061A0A" },
  };
  const s = map[tipo];
  return (
    <div style={{
      background: s.bg,
      border: `1px solid ${s.border}22`,
      borderLeft: `3px solid ${s.border}`,
      borderRadius: 8,
      padding: "12px 16px",
      display: "flex",
      gap: 12,
      alignItems: "flex-start",
    }}>
      <span style={{ fontSize: 16, marginTop: 1 }}>{s.icon}</span>
      <div style={{ flex: 1 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: COLORS.text, fontFamily: "'Space Grotesk', sans-serif" }}>{titulo}</span>
          <span style={{ fontSize: 11, color: COLORS.muted }}>{tempo}</span>
        </div>
        <div style={{ fontSize: 12, color: COLORS.muted, lineHeight: 1.5, marginBottom: 8 }}>{desc}</div>
        <button style={{
          fontSize: 11,
          color: s.border,
          background: "transparent",
          border: `1px solid ${s.border}44`,
          borderRadius: 6,
          padding: "3px 10px",
          cursor: "pointer",
          fontFamily: "'DM Sans', sans-serif",
        }}>{acao} →</button>
      </div>
    </div>
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
        width: 36,
        height: 36,
        borderRadius: 8,
        background: "#1E2028",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 16,
        flexShrink: 0,
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
        background: "#1E2028",
        border: `1px solid ${COLORS.border}`,
        borderRadius: 8,
        padding: "10px 14px",
        fontSize: 12,
        fontFamily: "'DM Sans', sans-serif",
        color: COLORS.text,
      }}>
        <div style={{ fontWeight: 600, marginBottom: 6 }}>{label}</div>
        {payload.map((p, i) => (
          <div key={i} style={{ color: p.color, marginBottom: 2 }}>
            {p.name}: R${p.value.toLocaleString("pt-BR")}
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function AdsDashboard() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [now, setNow] = useState(new Date());
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState("");
  const [aiInput, setAiInput] = useState("");
  const [chatHistory, setChatHistory] = useState([]);

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const totalInvestimento = campanhas.reduce((a, c) => a + c.investimento, 0);
  const totalConversoes = campanhas.reduce((a, c) => a + c.conversoes, 0);
  const cpaMedio = totalInvestimento / totalConversoes;
  const roasMedio = campanhas.reduce((a, c) => a + c.roas, 0) / campanhas.length;

  async function askAI(pergunta) {
    if (!pergunta.trim()) return;
    setAiLoading(true);
    setAiInput("");
    const novaMensagem = { role: "user", content: pergunta };
    const novoHistorico = [...chatHistory, novaMensagem];
    setChatHistory(novoHistorico);

    const contexto = `Você é um gestor de tráfego pago especialista. Dados atuais das campanhas:
Total investido: R$${totalInvestimento.toLocaleString("pt-BR")}
Total conversões: ${totalConversoes}
CPA médio: R$${cpaMedio.toFixed(2)}
ROAS médio: ${roasMedio.toFixed(1)}x

Campanhas:
${campanhas.map(c => `- ${c.nome} (${c.plataforma}): ROAS ${c.roas}x, CPA R$${c.cpa}, Status: ${c.status}`).join("\n")}

Alertas ativos:
${alertas.filter(a => a.tipo !== "success").map(a => `- ${a.titulo}: ${a.desc}`).join("\n")}

Responda de forma direta e prática, com recomendações específicas para essas campanhas. Foque no que impacta mais o resultado. Use linguagem clara, sem jargões desnecessários.`;

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
      const assistantMsg = { role: "assistant", content: resposta };
      setChatHistory([...novoHistorico, assistantMsg]);
      setAiResponse(resposta);
    } catch (e) {
      setAiResponse("Erro ao conectar com o agente.");
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
    <div style={{
      display: "flex",
      height: "100vh",
      background: COLORS.bg,
      fontFamily: "'DM Sans', sans-serif",
      color: COLORS.text,
      minHeight: 600,
    }}>
      <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;600;700&family=DM+Sans:wght@400;500;600&display=swap" rel="stylesheet" />

      {/* Sidebar */}
      <div style={{
        width: 220,
        background: COLORS.card,
        borderRight: `1px solid ${COLORS.border}`,
        display: "flex",
        flexDirection: "column",
        flexShrink: 0,
      }}>
        <div style={{ padding: "24px 20px 16px", borderBottom: `1px solid ${COLORS.border}` }}>
          <div style={{ fontSize: 16, fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif", color: COLORS.text }}>
            ⚡ Ads Agent
          </div>
          <div style={{ fontSize: 11, color: COLORS.muted, marginTop: 4 }}>
            {now.toLocaleTimeString("pt-BR")}
          </div>
        </div>
        <div style={{ padding: "12px 10px", flex: 1 }}>
          {navItems.map(item => (
            <div
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "10px 12px",
                borderRadius: 8,
                cursor: "pointer",
                background: activeTab === item.id ? "#1E2028" : "transparent",
                color: activeTab === item.id ? COLORS.text : COLORS.muted,
                fontSize: 13,
                fontWeight: activeTab === item.id ? 600 : 400,
                marginBottom: 2,
                transition: "all 0.15s",
              }}
            >
              <span>{item.icon}</span>
              {item.label}
            </div>
          ))}
        </div>
        <div style={{
          padding: "16px 20px",
          borderTop: `1px solid ${COLORS.border}`,
          fontSize: 11,
          color: COLORS.muted,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: COLORS.success, display: "inline-block" }} />
            4 agentes ativos
          </div>
          <div style={{ marginTop: 4 }}>R$40k/mês em ads</div>
        </div>
      </div>

      {/* Main */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* Topbar */}
        <div style={{
          height: 56,
          background: COLORS.card,
          borderBottom: `1px solid ${COLORS.border}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 24px",
        }}>
          <div style={{ fontSize: 15, fontWeight: 600, fontFamily: "'Space Grotesk', sans-serif" }}>
            {navItems.find(n => n.id === activeTab)?.label}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {alertas.filter(a => a.tipo === "danger").length > 0 && (
              <span style={{
                background: "#1A0808",
                color: COLORS.danger,
                border: `1px solid ${COLORS.danger}44`,
                fontSize: 11,
                fontWeight: 600,
                padding: "4px 10px",
                borderRadius: 20,
              }}>🚨 {alertas.filter(a => a.tipo === "danger").length} crítico</span>
            )}
            <span style={{
              background: "#052E16",
              color: COLORS.success,
              border: `1px solid ${COLORS.success}44`,
              fontSize: 11,
              fontWeight: 600,
              padding: "4px 10px",
              borderRadius: 20,
            }}>● Agentes ativos</span>
          </div>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflow: "auto", padding: 24 }}>

          {/* DASHBOARD TAB */}
          {activeTab === "dashboard" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {/* Metrics */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
                <MetricCard label="Investimento total" value={`R$${(totalInvestimento / 1000).toFixed(1)}k`} sub="↑ 12% vs semana anterior" subType="up" icon="💰" />
                <MetricCard label="Conversões" value={totalConversoes} sub="↑ 8% vs semana anterior" subType="up" icon="🎯" />
                <MetricCard label="CPA médio" value={`R$${cpaMedio.toFixed(0)}`} sub="↑ 4% acima da meta R$80" subType="down" icon="📉" />
                <MetricCard label="ROAS médio" value={`${roasMedio.toFixed(1)}x`} sub="✓ Meta 3.5x atingida" subType="up" icon="📈" />
              </div>

              {/* Charts */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: "20px 24px" }}>
                  <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 16, fontFamily: "'Space Grotesk', sans-serif" }}>Investimento por plataforma</div>
                  <ResponsiveContainer width="100%" height={180}>
                    <LineChart data={perfData}>
                      <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} />
                      <XAxis dataKey="day" tick={{ fill: COLORS.muted, fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: COLORS.muted, fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `R$${(v/1000).toFixed(1)}k`} />
                      <Tooltip content={<CustomTooltip />} />
                      <Line type="monotone" dataKey="google" name="Google" stroke={COLORS.google} strokeWidth={2} dot={false} />
                      <Line type="monotone" dataKey="meta" name="Meta" stroke={COLORS.meta} strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: "20px 24px" }}>
                  <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 16, fontFamily: "'Space Grotesk', sans-serif" }}>Conversões diárias</div>
                  <ResponsiveContainer width="100%" height={180}>
                    <BarChart data={perfData}>
                      <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} />
                      <XAxis dataKey="day" tick={{ fill: COLORS.muted, fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: COLORS.muted, fontSize: 11 }} axisLine={false} tickLine={false} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="conversoes" name="Conversões" fill={COLORS.accent} radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Alertas */}
              <div style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: "20px 24px" }}>
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 16, fontFamily: "'Space Grotesk', sans-serif" }}>
                  Alertas do agente
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {alertas.map((a, i) => <AlertItem key={i} {...a} />)}
                </div>
              </div>
            </div>
          )}

          {/* CAMPANHAS TAB */}
          {activeTab === "campanhas" && (
            <div style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: "20px 24px" }}>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 20, fontFamily: "'Space Grotesk', sans-serif" }}>
                Todas as campanhas
              </div>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${COLORS.border}` }}>
                    {["Campanha", "Plataforma", "Status", "Investimento", "Conversões", "CPA", "ROAS"].map(h => (
                      <th key={h} style={{ textAlign: "left", padding: "8px 12px", fontSize: 11, color: COLORS.muted, fontWeight: 600, paddingBottom: 12 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {campanhas.map((c, i) => (
                    <tr key={i} style={{ borderBottom: `1px solid ${COLORS.border}`, transition: "background 0.1s" }}>
                      <td style={{ padding: "14px 12px", color: COLORS.text, fontWeight: 500 }}>{c.nome}</td>
                      <td style={{ padding: "14px 12px" }}>
                        <span style={{
                          fontSize: 11,
                          padding: "3px 8px",
                          borderRadius: 6,
                          background: c.plataforma === "Google" ? "#0A1628" : "#0A1628",
                          color: c.plataforma === "Google" ? COLORS.google : COLORS.meta,
                          border: `1px solid ${c.plataforma === "Google" ? COLORS.google : COLORS.meta}33`,
                          fontWeight: 600,
                        }}>{c.plataforma}</span>
                      </td>
                      <td style={{ padding: "14px 12px" }}><StatusBadge status={c.status} /></td>
                      <td style={{ padding: "14px 12px", color: COLORS.text }}>R${c.investimento.toLocaleString("pt-BR")}</td>
                      <td style={{ padding: "14px 12px", color: COLORS.text }}>{c.conversoes}</td>
                      <td style={{ padding: "14px 12px", color: c.cpa > 150 ? COLORS.danger : COLORS.text }}>
                        R${c.cpa.toFixed(0)}
                      </td>
                      <td style={{ padding: "14px 12px", color: c.roas >= 3.5 ? COLORS.success : c.roas >= 2 ? COLORS.warning : COLORS.danger, fontWeight: 600 }}>
                        {c.roas}x
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* AGENTES TAB */}
          {activeTab === "agentes" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{
                background: "#061A0A",
                border: `1px solid ${COLORS.success}33`,
                borderRadius: 12,
                padding: "16px 20px",
                fontSize: 13,
                color: COLORS.success,
              }}>
                ● 4 agentes rodando em tempo real — última verificação há 4 minutos
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
                background: COLORS.card,
                border: `1px solid ${COLORS.border}`,
                borderRadius: 12,
                padding: "20px 24px",
                flex: 1,
                display: "flex",
                flexDirection: "column",
                gap: 12,
                minHeight: 300,
                maxHeight: 400,
                overflowY: "auto",
              }}>
                {chatHistory.length === 0 && (
                  <div style={{ color: COLORS.muted, fontSize: 13, textAlign: "center", marginTop: 40 }}>
                    <div style={{ fontSize: 32, marginBottom: 12 }}>🤖</div>
                    <div>Pergunte ao agente sobre suas campanhas</div>
                    <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 8, alignItems: "center" }}>
                      {[
                        "O que está puxando meu CPA para cima?",
                        "Qual campanha devo pausar agora?",
                        "Como melhorar o ROAS do Meta?",
                      ].map((s, i) => (
                        <button key={i} onClick={() => askAI(s)} style={{
                          background: "#1E2028",
                          border: `1px solid ${COLORS.border}`,
                          borderRadius: 8,
                          padding: "8px 16px",
                          color: COLORS.muted,
                          fontSize: 12,
                          cursor: "pointer",
                          fontFamily: "'DM Sans', sans-serif",
                        }}>{s}</button>
                      ))}
                    </div>
                  </div>
                )}
                {chatHistory.map((msg, i) => (
                  <div key={i} style={{
                    display: "flex",
                    justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
                  }}>
                    <div style={{
                      maxWidth: "80%",
                      background: msg.role === "user" ? "#1E2028" : "#061A0A",
                      border: `1px solid ${msg.role === "user" ? COLORS.border : COLORS.success + "33"}`,
                      borderRadius: 10,
                      padding: "10px 14px",
                      fontSize: 13,
                      color: COLORS.text,
                      lineHeight: 1.6,
                      whiteSpace: "pre-wrap",
                    }}>
                      {msg.role === "assistant" && <div style={{ fontSize: 11, color: COLORS.success, marginBottom: 6, fontWeight: 600 }}>🤖 Agente</div>}
                      {msg.content}
                    </div>
                  </div>
                ))}
                {aiLoading && (
                  <div style={{ display: "flex", alignItems: "center", gap: 8, color: COLORS.muted, fontSize: 13 }}>
                    <span>🤖</span> Analisando suas campanhas...
                  </div>
                )}
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <input
                  value={aiInput}
                  onChange={e => setAiInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && askAI(aiInput)}
                  placeholder="Pergunte sobre suas campanhas..."
                  style={{
                    flex: 1,
                    background: COLORS.card,
                    border: `1px solid ${COLORS.border}`,
                    borderRadius: 10,
                    padding: "12px 16px",
                    color: COLORS.text,
                    fontSize: 13,
                    fontFamily: "'DM Sans', sans-serif",
                    outline: "none",
                  }}
                />
                <button
                  onClick={() => askAI(aiInput)}
                  disabled={aiLoading || !aiInput.trim()}
                  style={{
                    background: COLORS.accent,
                    border: "none",
                    borderRadius: 10,
                    padding: "12px 20px",
                    color: "#000",
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: "pointer",
                    fontFamily: "'DM Sans', sans-serif",
                    opacity: aiLoading || !aiInput.trim() ? 0.5 : 1,
                  }}
                >Enviar</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
