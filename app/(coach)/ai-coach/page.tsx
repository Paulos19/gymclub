"use client";

import React, { useState, useEffect, useRef } from "react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import {
  Sparkles,
  Send,
  Loader2,
  Trash2,
  Flame,
  Dumbbell,
  Clock,
  Apple,
  Copy,
  Check,
  RotateCcw,
  ChevronDown,
  Plus,
  Mic,
  ArrowUp,
  MessageSquare,
  PanelLeftClose,
  PanelLeftOpen,
  LayoutDashboard,
  TrendingUp,
  Camera,
  ArrowLeft,
  X,
  LogOut,
} from "lucide-react";
import GymClubLogo from "@/components/ui/GymClubLogo";

// =========================================================================
// Ícone Oficial Estilo Gemini: Estrela de 4 Pontas com Gradiente Neon/Cyan
// =========================================================================
function GeminiStarIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M12 2C12 7.52285 7.52285 12 2 12C7.52285 12 12 16.4771 12 22C12 16.4771 16.4771 12 22 12C16.4771 12 12 7.52285 12 2Z"
        fill="url(#gemini-coach-grad-full)"
      />
      <defs>
        <linearGradient
          id="gemini-coach-grad-full"
          x1="2"
          y1="2"
          x2="22"
          y2="22"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#D2FB4C" />
          <stop offset="0.5" stopColor="#38BDF8" />
          <stop offset="1" stopColor="#868CF0" />
        </linearGradient>
      </defs>
    </svg>
  );
}

// =========================================================================
// Componente de Marca Unificado: Logo GymClub + Badge Coach
// (Evita a impressão de 'duas logos' separadas)
// =========================================================================
function UnifiedBrandLogo() {
  return (
    <div className="flex items-center gap-2">
      <GymClubLogo size="sm" variant="dark" href="/dashboard" />
      <span className="px-2 py-0.5 rounded-full bg-[#D2FB4C]/15 border border-[#D2FB4C]/30 text-[9px] font-mono font-black text-[#D2FB4C] tracking-wider uppercase select-none">
        COACH IA
      </span>
    </div>
  );
}

// =========================================================================
// RENDERIZADOR PRECISO DE MARKDOWN (Estilo Gemini Web)
// Suporta: Títulos numerados, Tabelas HTML limpas, Listas com marcador '○',
// negrito (**termo**), blocos de código com botão de cópia e parágrafos.
// =========================================================================
function formatInlineText(text: string): React.ReactNode[] {
  const tokens = text.split(/(\*\*.*?\*\*|`.*?`|\*.*?\*)/g);

  return tokens.map((token, i) => {
    if (token.startsWith("**") && token.endsWith("**")) {
      return (
        <strong key={i} className="font-bold text-white tracking-tight">
          {token.slice(2, -2)}
        </strong>
      );
    }
    if (token.startsWith("`") && token.endsWith("`")) {
      return (
        <code
          key={i}
          className="rounded-md px-1.5 py-0.5 bg-white/10 font-mono text-xs text-[#D2FB4C]"
        >
          {token.slice(1, -1)}
        </code>
      );
    }
    if (token.startsWith("*") && token.endsWith("*") && token.length > 2) {
      return (
        <em key={i} className="italic text-[#CADBD0]">
          {token.slice(1, -1)}
        </em>
      );
    }
    return token;
  });
}

function FormattedGeminiResponse({ content }: { content: string }) {
  const [copiedCodeIdx, setCopiedCodeIdx] = useState<number | null>(null);

  const copyCodeToClipboard = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedCodeIdx(idx);
    setTimeout(() => setCopiedCodeIdx(null), 2000);
  };

  const lines = content.split("\n");
  const blocks: React.ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // 1. Bloco de Código: ```lang ... ```
    if (line.trim().startsWith("```")) {
      const lang = line.trim().slice(3) || "text";
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith("```")) {
        codeLines.push(lines[i]);
        i++;
      }
      i++;
      const fullCode = codeLines.join("\n");
      const currentIdx = i;

      blocks.push(
        <div
          key={`code-${currentIdx}`}
          className="my-5 relative rounded-2xl border border-white/10 bg-[#0E1012] p-4 sm:p-5 font-mono text-xs shadow-inner group overflow-hidden"
        >
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/5 text-[11px] text-[#8E9296]">
            <span className="uppercase font-bold tracking-wider text-[#D2FB4C]">{lang}</span>
            <button
              type="button"
              onClick={() => copyCodeToClipboard(fullCode, currentIdx)}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-white transition-colors"
            >
              {copiedCodeIdx === currentIdx ? (
                <>
                  <Check size={12} className="text-[#D2FB4C]" />
                  <span className="text-[#D2FB4C] font-bold">Copiado</span>
                </>
              ) : (
                <>
                  <Copy size={12} />
                  <span>Copiar Código</span>
                </>
              )}
            </button>
          </div>
          <pre className="overflow-x-auto text-[#CADBD0] leading-relaxed">
            {fullCode}
          </pre>
        </div>
      );
      continue;
    }

    // 2. Tabela Markdown: linha que começa com | e tem um divisor |--|
    if (
      line.trim().startsWith("|") &&
      i + 1 < lines.length &&
      lines[i + 1].includes("|") &&
      lines[i + 1].includes("-")
    ) {
      const tableLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith("|")) {
        tableLines.push(lines[i]);
        i++;
      }

      const parseCells = (rowStr: string) => {
        const parts = rowStr.split("|");
        if (parts.length > 0 && parts[0].trim() === "") parts.shift();
        if (parts.length > 0 && parts[parts.length - 1].trim() === "") parts.pop();
        return parts.map((c) => c.trim());
      };

      const headerCells = parseCells(tableLines[0]);
      const dataRows = tableLines.slice(2).map(parseCells);

      blocks.push(
        <div
          key={`table-${i}`}
          className="my-5 overflow-x-auto rounded-2xl border border-white/10 bg-[#16181A] shadow-[0_4px_24px_rgba(0,0,0,0.3)]"
        >
          <table className="w-full text-left text-xs sm:text-sm border-collapse">
            <thead className="border-b border-white/10 bg-white/[0.04]">
              <tr>
                {headerCells.map((h, hIdx) => (
                  <th
                    key={hIdx}
                    className="px-4 py-3.5 font-bold text-white tracking-wide font-sans uppercase text-[11px]"
                  >
                    {formatInlineText(h)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-sans">
              {dataRows.map((row, rIdx) => (
                <tr
                  key={rIdx}
                  className="hover:bg-white/[0.02] transition-colors"
                >
                  {row.map((cell, cIdx) => (
                    <td
                      key={cIdx}
                      className="px-4 py-3 text-[#CADBD0] leading-relaxed"
                    >
                      {formatInlineText(cell)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      continue;
    }

    // 3. Título de Seção Numerado (Ex: "1. O que eram as Pólis...") ou Heading (#, ##, ###)
    const numberedHeadingMatch = line.match(/^(\d+[\.\)]\s+[^\n]+)$/);
    const hashHeadingMatch = line.match(/^(#{1,4})\s+(.+)$/);

    if (hashHeadingMatch) {
      const text = hashHeadingMatch[2];
      blocks.push(
        <h3
          key={`h-${i}`}
          className="font-extended text-lg sm:text-xl font-bold text-white mt-6 mb-3 tracking-tight flex items-center gap-2"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#D2FB4C] shadow-[0_0_8px_#D2FB4C]" />
          {formatInlineText(text)}
        </h3>
      );
      i++;
      continue;
    }

    if (numberedHeadingMatch && line.length < 90) {
      blocks.push(
        <h3
          key={`nh-${i}`}
          className="font-extended text-lg sm:text-xl font-bold text-white mt-6 mb-3 tracking-tight flex items-start gap-2"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#D2FB4C] mt-2 shadow-[0_0_8px_#D2FB4C] shrink-0" />
          <span>{formatInlineText(line)}</span>
        </h3>
      );
      i++;
      continue;
    }

    // 4. Lista com Marcadores ('-', '*', '•', '○')
    const listBulletMatch = line.match(/^(\s*)([-*•○]|\d+\.)\s+(.+)$/);
    if (listBulletMatch) {
      const listItems: string[] = [];
      while (i < lines.length && lines[i].match(/^(\s*)([-*•○]|\d+\.)\s+(.+)$/)) {
        const match = lines[i].match(/^(\s*)([-*•○]|\d+\.)\s+(.+)$/);
        if (match) listItems.push(match[3]);
        i++;
      }

      blocks.push(
        <ul key={`list-${i}`} className="my-3 space-y-2.5 pl-1 sm:pl-2">
          {listItems.map((item, lIdx) => (
            <li
              key={lIdx}
              className="flex items-start gap-3 text-xs sm:text-sm text-[#CADBD0] font-sans leading-relaxed"
            >
              {/* Marcador circular '○' exato da interface do Gemini */}
              <span className="mt-1.5 flex h-2 w-2 shrink-0 rounded-full border border-[#D2FB4C]/80 bg-transparent" />
              <span className="flex-1">{formatInlineText(item)}</span>
            </li>
          ))}
        </ul>
      );
      continue;
    }

    // 5. Linha vazia
    if (!line.trim()) {
      blocks.push(<div key={`empty-${i}`} className="h-2" />);
      i++;
      continue;
    }

    // 6. Parágrafo comum
    blocks.push(
      <p
        key={`p-${i}`}
        className="text-xs sm:text-sm text-[#CADBD0] leading-relaxed font-sans font-normal my-2"
      >
        {formatInlineText(line)}
      </p>
    );
    i++;
  }

  return <div className="space-y-1">{blocks}</div>;
}

// =========================================================================
// INTERFACES & PROMPTS RÁPIDOS
// =========================================================================
interface MessageItem {
  id?: string;
  role: "user" | "assistant" | "system";
  content: string;
  createdAt?: string;
}

interface ChatSession {
  id: string;
  title: string;
  updatedAt: string;
  messages: MessageItem[];
}

const STORAGE_KEY = "gymcoach_chat_sessions_v2";

const QUICK_PROMPTS = [
  {
    icon: Dumbbell,
    title: "Montar Divisão Semanal",
    subtitle: "Divisão ABCDE focada em hipertrofia",
    prompt:
      "Monte uma divisão semanal ABCDE de musculação focada em hipertrofia máxima, estruturada em tabela com exercícios, séries, repetições e tempo de descanso.",
  },
  {
    icon: Flame,
    title: "Sobrecarga de Carga",
    subtitle: "Técnica para destravar cargas nos compostos",
    prompt:
      "Qual é a melhor metodologia prática para progredir carga com segurança no supino reto e no agachamento livre sem estagnar?",
  },
  {
    icon: Clock,
    title: "Treino Rápido de 40 Min",
    subtitle: "Máxima densidade com superséries",
    prompt:
      "Tenho apenas 40 minutos hoje na academia. Monte um treino completo, intenso e biomecanicamente eficiente para otimizar esse tempo.",
  },
  {
    icon: Apple,
    title: "Nutrição & Proteína",
    subtitle: "Timing ideal para recuperação muscular",
    prompt:
      "Como devo organizar a ingestão de proteínas e carboidratos no pré e pós-treino para maximizar a síntese proteica e rendimento?",
  },
];

export default function AICoachPage() {
  const { data: session } = useSession();
  const userName = session?.user?.name ? session.user.name.split(" ")[0] : "Atleta";
  const userEmail = session?.user?.email || "";

  // Sessões de Conversa
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string>("");
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  // Modelos e Menus
  const [selectedModel, setSelectedModel] = useState<"Pro" | "Flash">("Pro");
  const [showModelMenu, setShowModelMenu] = useState(false);
  const [showActionMenu, setShowActionMenu] = useState(false);
  const [copiedMsgIdx, setCopiedMsgIdx] = useState<number | null>(null);

  // Sidebar: Controle único e responsivo
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Inicializa sessões do storage ou do banco
  useEffect(() => {
    async function initChats() {
      try {
        setInitialLoading(true);

        // 1. Tenta carregar do localStorage
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setSessions(parsed);
              setActiveSessionId(parsed[0].id);
              setInitialLoading(false);
              return;
            }
          } catch {
            // Ignora falha de parse
          }
        }

        // 2. Se não houver no storage v2, tenta carregar histórico do banco de dados
        const res = await fetch("/api/ai/chat");
        if (res.ok) {
          const data = await res.json();
          const dbMessages = Array.isArray(data?.messages) ? data.messages : [];

          if (dbMessages.length > 0) {
            const firstUserMsg = dbMessages.find((m: MessageItem) => m.role === "user");
            const title = firstUserMsg
              ? firstUserMsg.content.slice(0, 28) + (firstUserMsg.content.length > 28 ? "..." : "")
              : "Treino & Periodização";

            const defaultSession: ChatSession = {
              id: "session_default",
              title,
              updatedAt: new Date().toISOString(),
              messages: dbMessages,
            };

            setSessions([defaultSession]);
            setActiveSessionId(defaultSession.id);
            localStorage.setItem(STORAGE_KEY, JSON.stringify([defaultSession]));
          } else {
            // Sessão inicial em branco
            const freshSession: ChatSession = {
              id: `session_${Date.now()}`,
              title: "Nova conversa",
              updatedAt: new Date().toISOString(),
              messages: [],
            };
            setSessions([freshSession]);
            setActiveSessionId(freshSession.id);
            localStorage.setItem(STORAGE_KEY, JSON.stringify([freshSession]));
          }
        }
      } catch (err) {
        console.error("Erro ao inicializar conversas:", err);
      } finally {
        setInitialLoading(false);
      }
    }

    initChats();
  }, []);

  // Determina a sessão ativa atual de forma segura
  const activeSession: ChatSession =
    sessions.find((s) => s.id === activeSessionId) ||
    sessions[0] || {
      id: "session_fallback",
      title: "Nova conversa",
      updatedAt: new Date().toISOString(),
      messages: [],
    };

  const currentMessages = activeSession.messages;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currentMessages, loading]);

  // Auto-resize do textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        140
      )}px`;
    }
  }, [input]);

  // Iniciar Nova Conversa (Cria nova sessão APENAS quando o usuário clica aqui!)
  const handleStartNewChat = () => {
    // Se a sessão atual já for uma conversa vazia, apenas foca
    if (activeSession.messages.length === 0) {
      setInput("");
      textareaRef.current?.focus();
      return;
    }

    const newSessionId = `session_${Date.now()}`;
    const newSession: ChatSession = {
      id: newSessionId,
      title: "Nova conversa",
      updatedAt: new Date().toISOString(),
      messages: [],
    };

    setSessions((prev) => {
      const updated = [newSession, ...prev];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });

    setActiveSessionId(newSessionId);
    setInput("");
    textareaRef.current?.focus();
  };

  // Excluir uma sessão específica
  const handleDeleteSession = (e: React.MouseEvent, idToDelete: string) => {
    e.stopPropagation();

    setSessions((prev) => {
      const updated = prev.filter((s) => s.id !== idToDelete);

      if (updated.length === 0) {
        const fresh: ChatSession = {
          id: `session_${Date.now()}`,
          title: "Nova conversa",
          updatedAt: new Date().toISOString(),
          messages: [],
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify([fresh]));
        setActiveSessionId(fresh.id);
        return [fresh];
      }

      if (activeSessionId === idToDelete) {
        setActiveSessionId(updated[0].id);
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  // Envio de mensagem DENTRO da sessão ativa (NUNCA cria um novo chat ao enviar mensagem)
  const handleSendMessage = async (textToSend?: string) => {
    const content = textToSend || input;
    if (!content.trim() || loading) return;

    const targetSessionId = activeSession.id;
    const userMessage: MessageItem = {
      role: "user",
      content: content.trim(),
    };

    // Atualiza mensagens da sessão ativa
    const updatedMessages = [...activeSession.messages, userMessage];

    // Se o título ainda era "Nova conversa", atualiza para o resumo da 1ª mensagem
    let sessionTitle = activeSession.title;
    if (sessionTitle === "Nova conversa" || activeSession.messages.length === 0) {
      sessionTitle =
        content.trim().slice(0, 28) + (content.trim().length > 28 ? "..." : "");
    }

    const updatedSession: ChatSession = {
      ...activeSession,
      title: sessionTitle,
      updatedAt: new Date().toISOString(),
      messages: updatedMessages,
    };

    // Salva imediatamente a mensagem do usuário no estado e localStorage
    setSessions((prevSessions) => {
      const exists = prevSessions.some((s) => s.id === targetSessionId);
      const updated = exists
        ? prevSessions.map((s) => (s.id === targetSessionId ? updatedSession : s))
        : [updatedSession, ...prevSessions];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });

    setActiveSessionId(targetSessionId);
    if (!textToSend) setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
    setLoading(true);
    setShowActionMenu(false);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: content.trim(),
          contextType: selectedModel === "Pro" ? "DEEP_ANALYSIS" : "FAST",
        }),
      });

      const data = await res.json();
      const assistantText = res.ok
        ? data.reply
        : `⚠️ ${data.error || "Erro na comunicação com o servidor de IA."}`;

      const assistantMessage: MessageItem = {
        role: "assistant",
        content: assistantText,
      };

      // Adiciona a resposta da IA dentro da MESMA sessão
      setSessions((prevSessions) => {
        const sessionToUpdate = prevSessions.find((s) => s.id === targetSessionId);
        if (!sessionToUpdate) return prevSessions;

        const withAssistant: ChatSession = {
          ...sessionToUpdate,
          messages: [...sessionToUpdate.messages, assistantMessage],
          updatedAt: new Date().toISOString(),
        };

        const finalSessions = prevSessions.map((s) =>
          s.id === targetSessionId ? withAssistant : s
        );
        localStorage.setItem(STORAGE_KEY, JSON.stringify(finalSessions));
        return finalSessions;
      });
    } catch {
      const errMessage: MessageItem = {
        role: "assistant",
        content: "⚠️ Erro de conexão com o servidor de IA. Tente novamente.",
      };

      setSessions((prevSessions) => {
        const sessionToUpdate = prevSessions.find((s) => s.id === targetSessionId);
        if (!sessionToUpdate) return prevSessions;

        const withError: ChatSession = {
          ...sessionToUpdate,
          messages: [...sessionToUpdate.messages, errMessage],
          updatedAt: new Date().toISOString(),
        };

        const finalSessions = prevSessions.map((s) =>
          s.id === targetSessionId ? withError : s
        );
        localStorage.setItem(STORAGE_KEY, JSON.stringify(finalSessions));
        return finalSessions;
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClearCurrentChat = async () => {
    if (!confirm("Deseja limpar as mensagens desta conversa?")) return;
    const clearedSession: ChatSession = {
      ...activeSession,
      title: "Nova conversa",
      messages: [],
    };
    setSessions((prev) => {
      const updated = prev.map((s) =>
        s.id === activeSession.id ? clearedSession : s
      );
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
    await fetch("/api/ai/chat", { method: "DELETE" }).catch(() => null);
  };

  const handleCopyMessage = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedMsgIdx(idx);
    setTimeout(() => setCopiedMsgIdx(null), 2000);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#131314] text-[#E3E3E3] font-sans">
      {/* ========================================================= */}
      {/* 1. SIDEBAR LATERAL FLUTUANTE (ESTILO OFICIAL GEMINI) */}
      {/* ========================================================= */}
      {/* Overlay Backdrop para Mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {sidebarOpen && (
        <aside className="fixed inset-y-0 left-0 md:static w-[270px] sm:w-[280px] h-full flex flex-col justify-between border-r border-white/10 bg-[#16181A] z-50 shrink-0 transition-all duration-300 animate-fade-in shadow-2xl md:shadow-none">
          {/* Topo da Sidebar: Botão Único de Retrair + Logo Única Consolidada */}
          <div className="p-3.5 space-y-3">
            <div className="flex items-center justify-between">
              {/* Logo Consolidada (Uma única marca visual) */}
              <UnifiedBrandLogo />

              {/* Botão Único de Retrair Sidebar */}
              <button
                type="button"
                onClick={() => setSidebarOpen(false)}
                className="p-2 rounded-xl text-[#8E9296] hover:bg-white/5 hover:text-white transition-colors"
                title="Recolher barra lateral"
              >
                <PanelLeftClose size={18} />
              </button>
            </div>

            {/* Botão + Nova Conversa (Pill elegante como ChatGPT / Gemini) */}
            <button
              type="button"
              onClick={handleStartNewChat}
              className="w-full flex items-center gap-2.5 rounded-full border border-white/10 bg-[#1E1F21] px-4 py-2.5 text-xs font-bold text-white hover:border-[#D2FB4C]/50 hover:bg-[#232527] transition-all shadow-sm"
            >
              <Plus size={16} className="text-[#D2FB4C]" strokeWidth={2.5} />
              <span>Nova Conversa</span>
            </button>
          </div>

          {/* Lista de Conversas Recentes (Sessões reais, NÃO cada mensagem!) */}
          <div className="flex-1 overflow-y-auto px-3 py-2 space-y-4 scrollbar-none">
            <div className="space-y-1">
              <span className="px-2 text-[10px] font-bold uppercase tracking-wider text-[#6E7277] font-sans">
                Conversas Recentes
              </span>

              {sessions.map((sess) => {
                const isActive = sess.id === activeSession.id;
                return (
                  <div
                    key={sess.id}
                    onClick={() => {
                      setActiveSessionId(sess.id);
                      if (window.innerWidth < 768) setSidebarOpen(false);
                    }}
                    className={`group w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs transition-colors cursor-pointer ${
                      isActive
                        ? "bg-[#D2FB4C]/10 text-[#D2FB4C] font-bold border border-[#D2FB4C]/25"
                        : "text-[#CADBD0] hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate pr-2">
                      <MessageSquare
                        size={14}
                        className={isActive ? "text-[#D2FB4C]" : "text-[#8E9296]"}
                      />
                      <span className="truncate">{sess.title}</span>
                    </div>

                    {sessions.length > 1 && (
                      <button
                        type="button"
                        onClick={(e) => handleDeleteSession(e, sess.id)}
                        className="opacity-0 group-hover:opacity-100 p-1 rounded-md text-[#6E7277] hover:text-rose-400 hover:bg-rose-500/10 transition-all"
                        title="Excluir conversa"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Atalhos Rápidos para o Ecossistema GymClub */}
            <div className="space-y-1 pt-4 border-t border-white/5">
              <span className="px-2 text-[10px] font-bold uppercase tracking-wider text-[#6E7277] font-sans">
                GymClub Apps
              </span>

              <Link
                href="/dashboard"
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-[#8E9296] hover:bg-white/5 hover:text-white transition-colors"
              >
                <LayoutDashboard size={14} className="text-[#D2FB4C]" />
                <span>Painel Geral</span>
              </Link>

              <Link
                href="/workouts"
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-[#8E9296] hover:bg-white/5 hover:text-white transition-colors"
              >
                <Dumbbell size={14} className="text-[#868CF0]" />
                <span>Rotinas de Treino</span>
              </Link>

              <Link
                href="/evolution"
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-[#8E9296] hover:bg-white/5 hover:text-white transition-colors"
              >
                <TrendingUp size={14} className="text-[#FAB03B]" />
                <span>Evolução de Cargas</span>
              </Link>

              <Link
                href="/photos"
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-[#8E9296] hover:bg-white/5 hover:text-white transition-colors"
              >
                <Camera size={14} className="text-[#CADBD0]" />
                <span>Cofre de Fotos</span>
              </Link>
            </div>
          </div>

          {/* Rodapé da Sidebar: Perfil do Usuário & Logout */}
          <div className="p-3 border-t border-white/10 bg-[#16181A] flex items-center justify-between gap-2">
            <Link
              href="/profile"
              className="flex items-center gap-3 p-1.5 rounded-2xl hover:bg-white/5 transition-colors flex-1 min-w-0"
              title="Acessar Perfil"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#D2FB4C]/15 border border-[#D2FB4C]/30 text-[#D2FB4C] font-bold text-xs font-mono">
                {userName[0]}
              </div>

              <div className="overflow-hidden">
                <div className="font-bold text-xs text-white truncate">{userName}</div>
                <div className="text-[10px] text-[#8E9296] truncate">{userEmail}</div>
              </div>
            </Link>

            <button
              type="button"
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="p-2 rounded-xl text-[#8E9296] hover:text-rose-400 hover:bg-rose-500/10 transition-colors shrink-0 cursor-pointer"
              title="Encerrar sessão"
            >
              <LogOut size={16} />
            </button>
          </div>
        </aside>
      )}

      {/* ========================================================= */}
      {/* 2. ÁREA PRINCIPAL DO CHAT (FULL HEIGHT & AMPLO ESPAÇO) */}
      {/* ========================================================= */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative bg-[#131314]">
        {/* HEADER TOP DA CONVERSA (SEM DUPLICAÇÃO DE BOTÃO OU LOGO) */}
        <header className="h-14 border-b border-white/10 flex items-center justify-between px-4 sm:px-6 bg-[#131314]/90 backdrop-blur-md z-20 shrink-0">
          <div className="flex items-center gap-3">
            {/* O botão de ABRIR sidebar e a LOGO só aparecem aqui se a barra lateral estiver recolhida! */}
            {!sidebarOpen && (
              <>
                <button
                  type="button"
                  onClick={() => setSidebarOpen(true)}
                  className="p-2 rounded-xl text-[#8E9296] hover:bg-white/5 hover:text-white transition-colors"
                  title="Abrir barra lateral"
                >
                  <PanelLeftOpen size={18} />
                </button>

                <UnifiedBrandLogo />
              </>
            )}

            {/* Chip Seletor de Modelo (Estilo Gemini Advanced / Flash ▾) */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowModelMenu(!showModelMenu)}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-white/10 bg-[#1E1F21] hover:bg-[#252729] text-xs font-bold text-white transition-all font-sans shadow-sm"
              >
                <GeminiStarIcon className="w-4 h-4" />
                <span>GymCoach {selectedModel === "Pro" ? "Pro 2.5" : "Flash"}</span>
                <ChevronDown size={13} className="text-[#8E9296]" />
              </button>

              {showModelMenu && (
                <div className="absolute left-0 top-full mt-2 w-64 rounded-2xl border border-white/10 bg-[#1A1C1E] p-2 shadow-2xl z-50 animate-scale-up">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedModel("Pro");
                      setShowModelMenu(false);
                    }}
                    className={`w-full text-left p-2.5 rounded-xl text-xs font-sans transition-colors ${
                      selectedModel === "Pro"
                        ? "bg-[#D2FB4C]/15 text-[#D2FB4C] font-bold"
                        : "text-[#A4A8AD] hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <div className="font-bold flex items-center justify-between">
                      <span>GymCoach Pro 2.5</span>
                      {selectedModel === "Pro" && <Check size={14} />}
                    </div>
                    <div className="text-[10px] text-[#8E9296] mt-0.5">
                      Raciocínio biomecânico profundo, volume e periodização
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedModel("Flash");
                      setShowModelMenu(false);
                    }}
                    className={`w-full text-left p-2.5 rounded-xl text-xs font-sans transition-colors ${
                      selectedModel === "Flash"
                        ? "bg-[#D2FB4C]/15 text-[#D2FB4C] font-bold"
                        : "text-[#A4A8AD] hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <div className="font-bold flex items-center justify-between">
                      <span>GymCoach Flash</span>
                      {selectedModel === "Flash" && <Check size={14} />}
                    </div>
                    <div className="text-[10px] text-[#8E9296] mt-0.5">
                      Respostas rápidas e estruturação express de treinos
                    </div>
                  </button>
                </div>
              )}
            </div>

            <span className="hidden sm:inline-flex items-center gap-1.5 text-[11px] text-[#6E7277] font-sans pl-2 border-l border-white/10">
              <span className="w-1.5 h-1.5 rounded-full bg-[#D2FB4C]" />
              Memória Ativa
            </span>
          </div>

          <div className="flex items-center gap-2">
            {currentMessages.length > 0 && (
              <button
                type="button"
                onClick={handleClearCurrentChat}
                className="p-2 rounded-xl text-[#6E7277] hover:bg-white/5 hover:text-white transition-colors"
                title="Limpar mensagens desta conversa"
              >
                <Trash2 size={16} />
              </button>
            )}

            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/10 bg-white/5 text-xs font-bold text-[#CADBD0] hover:text-white hover:border-white/20 transition-all font-sans"
            >
              <ArrowLeft size={13} />
              <span>Painel</span>
            </Link>

            <button
              type="button"
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-rose-500/20 bg-rose-500/10 text-xs font-bold text-rose-300 hover:bg-rose-500/20 hover:text-rose-200 transition-all font-sans cursor-pointer"
              title="Encerrar sessão"
            >
              <LogOut size={13} />
              <span className="hidden sm:inline">Sair</span>
            </button>
          </div>
        </header>

        {/* CANVÁS DE MENSAGENS COM ROLAGEM SUAVE E ALTURA TOTAL */}
        <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6 pb-36 space-y-8">
          {initialLoading ? (
            <div className="flex flex-col items-center justify-center py-36 text-center">
              <Loader2 size={36} className="animate-spin text-[#D2FB4C]" />
              <p className="mt-4 text-xs font-bold uppercase tracking-wider text-[#8E9296] font-sans">
                Conectando ao Treinador Virtual...
              </p>
            </div>
          ) : currentMessages.length === 0 ? (
            /* BOAS-VINDAS ESTILO GEMINI HERO (CENTRALIZADO E ESPAÇOSO) */
            <div className="max-w-3xl mx-auto py-16 sm:py-24 space-y-8 animate-fade-in">
              <div className="space-y-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/[0.04] border border-white/10 shadow-[0_0_24px_rgba(210,251,76,0.2)]">
                  <GeminiStarIcon className="w-8 h-8" />
                </div>

                <div className="space-y-2">
                  <h1 className="font-extended text-3xl sm:text-5xl font-black tracking-tight text-white uppercase leading-[1.1]">
                    Olá,{" "}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D2FB4C] via-[#38BDF8] to-[#868CF0]">
                      {userName}
                    </span>
                  </h1>
                  <p className="text-base sm:text-lg text-[#8E9296] font-sans font-medium">
                    Como posso potencializar seus treinos e sobrecarga hoje?
                  </p>
                </div>
              </div>

              {/* Grid Bento com Sugestões de Prompts Rápidos */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {QUICK_PROMPTS.map((qp, idx) => {
                  const Icon = qp.icon;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSendMessage(qp.prompt)}
                      className="group relative flex flex-col justify-between rounded-2xl border border-white/10 bg-[#16181A] p-4 text-left transition-all duration-200 hover:border-[#D2FB4C]/50 hover:bg-[#1A1C1E] hover:shadow-[0_4px_20px_rgba(210,251,76,0.12)]"
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                          <Icon size={16} className="text-[#D2FB4C]" />
                          <h4 className="font-extended text-xs font-bold text-white group-hover:text-[#D2FB4C] transition-colors">
                            {qp.title}
                          </h4>
                        </div>
                        <p className="text-[11px] text-[#8E9296] font-sans leading-relaxed">
                          {qp.subtitle}
                        </p>
                      </div>

                      <div className="mt-3 flex justify-end">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/5 text-[#8E9296] group-hover:bg-[#D2FB4C] group-hover:text-[#1E2022] transition-all">
                          <ArrowUp size={12} className="rotate-45" />
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            /* CONVERSAÇÃO ABERTA E FORMATADA (TEXTO LIVRE NO CANVAS COMO GEMINI) */
            <div className="max-w-3xl lg:max-w-4xl mx-auto space-y-8">
              {currentMessages.map((m, idx) => {
                const isUser = m.role === "user";

                return (
                  <div
                    key={idx}
                    className={`flex gap-3 sm:gap-4 ${
                      isUser ? "justify-end" : "justify-start"
                    }`}
                  >
                    {/* Ícone Gemini para Mensagens do Assistente */}
                    {!isUser && (
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white/[0.04] border border-white/10 mt-1 shadow-sm">
                        <GeminiStarIcon className="w-5 h-5" />
                      </div>
                    )}

                    {/* Conteúdo da Mensagem */}
                    <div
                      className={`relative ${
                        isUser
                          ? "max-w-[85%] rounded-[24px] rounded-tr-md bg-[#1E1F21] border border-white/10 px-5 py-3.5 text-white font-sans text-xs sm:text-sm font-medium shadow-md leading-relaxed whitespace-pre-wrap"
                          : "w-full space-y-4"
                      }`}
                    >
                      {isUser ? (
                        m.content
                      ) : (
                        <div className="space-y-4">
                          {/* Resposta aberta sem caixa pesada estilo Gemini */}
                          <FormattedGeminiResponse content={m.content} />

                          {/* Ações da Resposta */}
                          <div className="pt-2 flex items-center justify-between text-xs text-[#8E9296] border-t border-white/5">
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => handleCopyMessage(m.content, idx)}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-white/5 hover:text-white transition-colors"
                                title="Copiar resposta"
                              >
                                {copiedMsgIdx === idx ? (
                                  <>
                                    <Check size={14} className="text-[#D2FB4C]" />
                                    <span className="text-[#D2FB4C] font-bold">Copiado</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy size={14} />
                                    <span>Copiar</span>
                                  </>
                                )}
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  const lastUserMsg = [...currentMessages]
                                    .reverse()
                                    .find((msg) => msg.role === "user");
                                  if (lastUserMsg) handleSendMessage(lastUserMsg.content);
                                }}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-white/5 hover:text-white transition-colors"
                                title="Gerar novamente"
                              >
                                <RotateCcw size={14} />
                                <span className="hidden sm:inline">Regenerar</span>
                              </button>
                            </div>

                            <span className="text-[10px] text-[#6E7277] font-mono">
                              GymCoach AI Engine
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Avatar do Usuário */}
                    {isUser && (
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#D2FB4C]/15 border border-[#D2FB4C]/30 text-[#D2FB4C] mt-1 font-bold text-xs font-mono">
                        {userName[0]}
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Indicador de Carregamento da IA */}
              {loading && (
                <div className="flex gap-3 sm:gap-4 items-start">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white/[0.04] border border-white/10 mt-1 shadow-sm">
                    <GeminiStarIcon className="w-5 h-5 animate-pulse" />
                  </div>

                  <div className="px-2 py-3 flex items-center gap-3 text-xs sm:text-sm text-[#CADBD0]">
                    <Loader2 size={16} className="animate-spin text-[#D2FB4C]" />
                    <span className="font-sans font-medium animate-pulse">
                      GymCoach está analisando sua estratégia biomecânica...
                    </span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* ========================================================= */}
        {/* 3. INPUT PILL BAR FLUTUANTE (ESTILO OFICIAL GOOGLE GEMINI) */}
        {/* ========================================================= */}
        <div className="absolute bottom-0 left-0 right-0 z-30 p-3 sm:p-5 bg-gradient-to-t from-[#131314] via-[#131314]/95 to-transparent backdrop-blur-md pointer-events-none">
          <div className="max-w-3xl mx-auto pointer-events-auto">
            {/* Popover de Sugestões Rápidas ao clicar em '+' */}
            {showActionMenu && (
              <div className="mb-2 p-2 rounded-2xl border border-white/10 bg-[#1A1C1E] shadow-2xl animate-scale-up grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                {QUICK_PROMPTS.map((qp, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      handleSendMessage(qp.prompt);
                      setShowActionMenu(false);
                    }}
                    className="p-2.5 rounded-xl bg-white/[0.02] hover:bg-white/10 border border-white/5 text-left transition-colors"
                  >
                    <qp.icon size={15} className="text-[#D2FB4C] mb-1" />
                    <span className="block text-[11px] font-bold text-white font-sans leading-tight">
                      {qp.title}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {/* O Card Pill Arredondado */}
            <div className="relative rounded-[28px] border border-white/15 bg-[#1E1F21] shadow-[0_8px_32px_rgba(0,0,0,0.6)] p-2 transition-all focus-within:border-[#D2FB4C]/50 focus-within:shadow-[0_0_24px_rgba(210,251,76,0.18)]">
              <div className="flex items-end gap-2 px-2">
                {/* Botão '+' da Esquerda */}
                <button
                  type="button"
                  onClick={() => setShowActionMenu(!showActionMenu)}
                  className={`p-2.5 rounded-full transition-colors shrink-0 mb-0.5 ${
                    showActionMenu
                      ? "bg-[#D2FB4C] text-[#1E2022]"
                      : "text-[#8E9296] hover:bg-white/5 hover:text-white"
                  }`}
                  title="Ações Rápidas"
                >
                  <Plus size={18} strokeWidth={2.5} />
                </button>

                {/* Textarea com Auto-Resize */}
                <textarea
                  ref={textareaRef}
                  rows={1}
                  value={input}
                  disabled={loading}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Peça ao GymCoach..."
                  className="flex-1 bg-transparent py-2.5 text-xs sm:text-sm text-white placeholder-[#6E7277] focus:outline-none resize-none max-h-36 font-sans leading-relaxed"
                />

                {/* Controles da Direita: Chip de Modelo e Botão de Envio */}
                <div className="flex items-center gap-1.5 shrink-0 mb-0.5">
                  <span className="hidden sm:inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/5 text-[#8E9296] border border-white/10 font-sans">
                    {selectedModel}
                  </span>

                  {input.trim() ? (
                    <button
                      type="button"
                      onClick={() => handleSendMessage()}
                      disabled={loading}
                      className="flex h-9 w-9 items-center justify-center rounded-full bg-[#D2FB4C] text-[#1E2022] shadow-[0_0_12px_rgba(210,251,76,0.4)] hover:bg-[#D8FD50] transition-all"
                    >
                      {loading ? (
                        <Loader2 size={16} className="animate-spin text-[#1E2022]" />
                      ) : (
                        <ArrowUp size={18} strokeWidth={3} />
                      )}
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="flex h-9 w-9 items-center justify-center rounded-full text-[#6E7277] hover:bg-white/5 hover:text-white transition-colors"
                      title="Entrada por voz"
                      onClick={() => alert("Entrada por voz disponível nas próximas atualizações.")}
                    >
                      <Mic size={18} />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Disclaimer no Rodapé */}
            <div className="mt-2 text-center text-[10px] sm:text-[11px] text-[#6E7277] font-sans">
              O GymCoach é uma IA e pode cometer erros. Sempre consulte um profissional de educação física.
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
