"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  Camera,
  Plus,
  Trash2,
  Calendar,
  X,
  Upload,
  Loader2,
  Columns,
  Eye,
  Scale,
  Sparkles,
  Zap,
  Shield,
  Layers,
  Check,
  Maximize2,
  SlidersHorizontal,
  Flame,
  Clock,
  ArrowRight,
  TrendingDown,
  TrendingUp,
} from "lucide-react";

interface ProgressPhotoItem {
  id: string;
  imageUrl: string;
  date: string;
  weight?: number | null;
  pose: string;
  notes?: string | null;
}

const POSES = [
  { val: "TODAS", label: "Todas as Poses" },
  { val: "FRENTE", label: "Frente" },
  { val: "COSTAS", label: "Costas" },
  { val: "LATERAL_DIREITA", label: "Lateral Direita" },
  { val: "LATERAL_ESQUERDA", label: "Lateral Esquerda" },
  { val: "LIVRE", label: "Pose Livre" },
];

export default function PhotosPage() {
  const [photos, setPhotos] = useState<ProgressPhotoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPoseFilter, setSelectedPoseFilter] = useState("TODAS");

  // Modal de Upload
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [pose, setPose] = useState("FRENTE");
  const [weight, setWeight] = useState("");
  const [photoDate, setPhotoDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Modal Comparador Antes & Depois
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [compareA, setCompareA] = useState<string>("");
  const [compareB, setCompareB] = useState<string>("");

  // Modal de Zoom Fullscreen
  const [zoomedPhoto, setZoomedPhoto] = useState<ProgressPhotoItem | null>(null);

  const fetchPhotos = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/photos");
      if (res.ok) {
        const data = await res.json();
        const list = Array.isArray(data?.photos) ? data.photos : [];
        setPhotos(list);

        if (list.length >= 2) {
          setCompareA(list[list.length - 1].id); // Mais antiga
          setCompareB(list[0].id); // Mais recente
        }
      }
    } catch (err) {
      console.error("Erro ao carregar fotos:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPhotos();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      setFile(selected);
      setPreviewUrl(URL.createObjectURL(selected));
      setError(null);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError("Por favor, selecione uma foto de evolução.");
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("pose", pose);
      if (weight) formData.append("weight", weight);
      if (photoDate) formData.append("date", photoDate);
      if (notes) formData.append("notes", notes);

      const res = await fetch("/api/photos", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Erro no upload da foto.");
        setUploading(false);
        return;
      }

      setIsUploadOpen(false);
      setFile(null);
      setPreviewUrl(null);
      setWeight("");
      setNotes("");
      fetchPhotos();
    } catch {
      setError("Falha ao salvar foto no servidor.");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta foto de progresso?")) return;
    try {
      const res = await fetch(`/api/photos?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setPhotos((prev) => prev.filter((p) => p.id !== id));
        if (zoomedPhoto?.id === id) setZoomedPhoto(null);
      }
    } catch (err) {
      console.error("Erro ao deletar foto:", err);
    }
  };

  // Filtragem das fotos
  const safePhotos = Array.isArray(photos) ? photos : [];
  const filteredPhotos =
    selectedPoseFilter === "TODAS"
      ? safePhotos
      : safePhotos.filter((p) => p.pose === selectedPoseFilter);

  // Cálculos de métricas para o Bento Radar
  const totalPhotosCount = safePhotos.length;
  const photosWithWeight = safePhotos.filter((p) => p.weight && p.weight > 0);
  const latestWeight = photosWithWeight[0]?.weight || null;
  const oldestWeight = photosWithWeight[photosWithWeight.length - 1]?.weight || null;
  const weightDelta =
    latestWeight && oldestWeight && photosWithWeight.length > 1
      ? Math.round((latestWeight - oldestWeight) * 10) / 10
      : null;

  // Dias acompanhados entre primeira e última foto
  let daysTracked = 0;
  if (safePhotos.length >= 2) {
    const firstDate = new Date(safePhotos[safePhotos.length - 1].date).getTime();
    const lastDate = new Date(safePhotos[0].date).getTime();
    daysTracked = Math.max(1, Math.round((lastDate - firstDate) / (1000 * 60 * 60 * 24)));
  }

  const selectedPhotoA = safePhotos.find((p) => p.id === compareA);
  const selectedPhotoB = safePhotos.find((p) => p.id === compareB);

  // Diferença no comparador
  const compareWeightDiff =
    selectedPhotoA?.weight && selectedPhotoB?.weight
      ? Math.round((selectedPhotoB.weight - selectedPhotoA.weight) * 10) / 10
      : null;

  let compareDaysDiff = 0;
  if (selectedPhotoA && selectedPhotoB) {
    const dateA = new Date(selectedPhotoA.date).getTime();
    const dateB = new Date(selectedPhotoB.date).getTime();
    compareDaysDiff = Math.abs(Math.round((dateB - dateA) / (1000 * 60 * 60 * 24)));
  }

  return (
    <div className="w-full space-y-6 pb-16 animate-fade-in font-sans">
      {/* ========================================================= */}
      {/* 1. BENTO HEADER MONUMENTAL: COFRE VISUAL & RECORDES */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* BENTO CARD 1: HERO DA GALERIA & AÇÕES PRINCIPAIS (8 Colunas) */}
        <div className="lg:col-span-8 relative overflow-hidden rounded-[28px] border border-white/10 bg-[#16181A] p-6 sm:p-8 flex flex-col justify-between shadow-[0_4px_24px_rgba(0,0,0,0.3)]">
          {/* Auras de iluminação futuristas */}
          <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-[#D2FB4C]/10 blur-[80px]" />
          <div className="pointer-events-none absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-[#868CF0]/10 blur-[80px]" />

          <div className="relative z-10 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/[0.04] text-[0.72rem] font-bold tracking-wider text-[#D2FB4C] uppercase font-sans">
              <span className="w-2 h-2 rounded-full bg-[#D2FB4C] shadow-[0_0_8px_#D2FB4C]" />
              COFRE DE EVOLUÇÃO VISUAL • CRONOLOGIA CORPORAL
            </div>

            <div className="space-y-2">
              <h1 className="font-extended text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white uppercase leading-[1.05]">
                Galeria de Evolução
              </h1>
              <p className="text-xs sm:text-sm text-[#A4A8AD] max-w-xl font-sans font-medium leading-relaxed">
                Guarde registros fotográficos da sua jornada com total privacidade. Compare sua condição física lado a lado com análise de pesagem e datas.
              </p>
            </div>
          </div>

          {/* Rodapé do Hero com Métricas e Botões */}
          <div className="relative z-10 pt-6 mt-6 border-t border-white/5 flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-5 text-xs text-[#8E9296] font-sans">
              <span className="flex items-center gap-2">
                <Camera size={14} className="text-[#D2FB4C]" />
                <strong className="text-white font-bold">{totalPhotosCount}</strong> fotos no cofre
              </span>
              {daysTracked > 0 && (
                <span className="flex items-center gap-2">
                  <Clock size={14} className="text-[#868CF0]" />
                  <strong className="text-white font-bold">{daysTracked}</strong> dias de jornada
                </span>
              )}
              {weightDelta !== null && (
                <span className="flex items-center gap-1.5 font-mono">
                  {weightDelta < 0 ? (
                    <TrendingDown size={14} className="text-[#D2FB4C]" />
                  ) : (
                    <TrendingUp size={14} className="text-[#FAB03B]" />
                  )}
                  <strong
                    className={`font-bold ${
                      weightDelta < 0 ? "text-[#D2FB4C]" : "text-[#FAB03B]"
                    }`}
                  >
                    {weightDelta > 0 ? `+${weightDelta}` : weightDelta} kg
                  </strong>{" "}
                  na balança
                </span>
              )}
            </div>

            <div className="flex items-center gap-2.5">
              {safePhotos.length >= 2 && (
                <button
                  onClick={() => setIsCompareOpen(true)}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full border border-white/10 bg-white/5 text-xs font-bold text-white hover:bg-white/10 hover:border-white/20 transition-all font-sans"
                >
                  <Columns size={14} />
                  <span>Comparar Antes & Depois</span>
                </button>
              )}

              <button
                onClick={() => setIsUploadOpen(true)}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#D2FB4C] text-[#1E2022] font-sans font-black text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(210,251,76,0.35)] hover:bg-[#D8FD50] hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                <Plus size={16} strokeWidth={3} />
                <span>Adicionar Foto</span>
              </button>
            </div>
          </div>
        </div>

        {/* BENTO CARD 2: RADAR DE PRIVACIDADE & ÚLTIMA PESAGEM (4 Colunas) */}
        <div className="lg:col-span-4 relative overflow-hidden rounded-[28px] border border-white/10 bg-[#1A1C1E] p-6 flex flex-col justify-between shadow-[0_4px_24px_rgba(0,0,0,0.3)]">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-[0.72rem] font-bold uppercase tracking-wider text-[#8E9296] font-sans">
                Status Antropométrico
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#D2FB4C]/15 text-[#D2FB4C] border border-[#D2FB4C]/25">
                Privacidade 100%
              </span>
            </div>

            <div className="space-y-4">
              <div className="rounded-2xl border border-white/5 bg-black/30 p-4 space-y-1">
                <div className="flex items-center justify-between text-xs text-[#8E9296]">
                  <span className="flex items-center gap-1.5">
                    <Scale size={14} className="text-[#D2FB4C]" />
                    Última Pesagem Marcada
                  </span>
                  <span className="text-[10px] font-mono text-[#6E7277]">Na foto mais recente</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="font-extended text-3xl font-black text-white">
                    {latestWeight ? latestWeight.toFixed(1) : "—"}
                  </span>
                  <span className="text-xs text-[#D2FB4C] font-mono font-bold">kg</span>
                </div>
              </div>

              <div className="rounded-2xl border border-white/5 bg-black/30 p-4 space-y-1">
                <div className="flex items-center justify-between text-xs text-[#8E9296]">
                  <span className="flex items-center gap-1.5">
                    <Shield size={14} className="text-[#868CF0]" />
                    Segurança dos Arquivos
                  </span>
                  <span className="text-[10px] font-mono text-[#6E7277]">Criptografia</span>
                </div>
                <p className="text-xs text-[#A4A8AD] leading-relaxed pt-1">
                  Seus registros visuais são visíveis apenas na sua conta autenticada. Nenhum dado é compartilhado publicamente.
                </p>
              </div>
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-white/5 flex items-center justify-between text-xs text-[#CADBD0] font-sans">
            <span className="flex items-center gap-1.5">
              <Zap size={13} className="text-[#D2FB4C]" />
              <span>Cofre Ativo</span>
            </span>
            <span className="text-[#8E9296] font-mono">{safePhotos.length} fotos salvas</span>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. DOCK BENTO: FILTRO DINÂMICO POR POSE */}
      {/* ========================================================= */}
      <div className="sticky top-2 z-30 flex items-center justify-between overflow-x-auto rounded-2xl border border-white/10 bg-[#16181A]/95 p-1.5 backdrop-blur-xl shadow-xl scrollbar-none">
        <div className="flex items-center gap-1.5 min-w-max">
          {POSES.map((pos) => {
            const count =
              pos.val === "TODAS"
                ? safePhotos.length
                : safePhotos.filter((p) => p.pose === pos.val).length;
            const isSelected = selectedPoseFilter === pos.val;

            return (
              <button
                key={pos.val}
                onClick={() => setSelectedPoseFilter(pos.val)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-200 font-sans ${
                  isSelected
                    ? "bg-[#D2FB4C] text-[#1E2022] shadow-[0_2px_10px_rgba(210,251,76,0.3)] font-black"
                    : "text-[#8E9296] hover:bg-white/5 hover:text-white"
                }`}
              >
                <span>{pos.label}</span>
                {count > 0 && (
                  <span
                    className={`ml-1 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-black ${
                      isSelected ? "bg-[#1E2022]/20 text-[#1E2022]" : "bg-white/10 text-white"
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <button
          onClick={() => setIsUploadOpen(true)}
          className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-white/10 bg-white/5 text-xs font-bold text-white hover:border-[#D2FB4C]/50 hover:text-[#D2FB4C] transition-all font-sans"
        >
          <Plus size={14} />
          Nova Foto
        </button>
      </div>

      {/* ========================================================= */}
      {/* 3. GALERIA BENTO OU ESTADO VAZIO ONBOARDING */}
      {/* ========================================================= */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 text-center rounded-[28px] border border-white/5 bg-[#16181A]/40 backdrop-blur-sm">
          <Loader2 size={36} className="animate-spin text-[#D2FB4C]" />
          <p className="mt-4 text-xs font-bold uppercase tracking-wider text-[#8E9296] font-sans">
            Carregando suas fotos de recordação...
          </p>
        </div>
      ) : filteredPhotos.length === 0 ? (
        /* ESTADO VAZIO BENTO ONBOARDING STUDIO */
        <div className="relative overflow-hidden rounded-[32px] border border-white/10 bg-[#16181A] p-8 sm:p-12 shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
          {/* Auras neon de fundo */}
          <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-[#D2FB4C]/15 blur-[90px]" />
          <div className="pointer-events-none absolute -left-20 -bottom-20 h-72 w-72 rounded-full bg-[#868CF0]/15 blur-[90px]" />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:24px_24px]" />

          <div className="relative z-10 max-w-3xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#D2FB4C]/30 bg-[#D2FB4C]/10 text-[0.72rem] font-bold tracking-wider text-[#D2FB4C] uppercase font-sans">
              <Sparkles size={13} className="text-[#D2FB4C]" />
              <span>COFRE VISUAL • PRONTO PARA O PRIMEIRO REGISTRO</span>
            </div>

            <div className="space-y-3">
              <h2 className="font-extended text-2xl sm:text-3xl md:text-4xl font-black text-white uppercase tracking-tight leading-[1.1]">
                {selectedPoseFilter === "TODAS"
                  ? "Seu Cofre de Transformação Está Pronto"
                  : `Nenhuma foto na pose ${selectedPoseFilter}`}
              </h2>
              <p className="text-xs sm:text-sm text-[#CADBD0] max-w-xl mx-auto font-sans font-medium leading-relaxed">
                Tire uma foto de frente, costas ou pose livre para documentar sua evolução física. Quanto mais frequentes forem seus registros, mais nítida será a percepção do espelho.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setIsUploadOpen(true)}
                className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-full bg-[#D2FB4C] text-[#1E2022] font-sans font-black text-xs uppercase tracking-wider shadow-[0_0_24px_rgba(210,251,76,0.35)] hover:bg-[#D8FD50] hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                <Plus size={16} strokeWidth={3} />
                <span>Enviar Primeira Foto</span>
              </button>

              {selectedPoseFilter !== "TODAS" && (
                <button
                  onClick={() => setSelectedPoseFilter("TODAS")}
                  className="px-5 py-3 rounded-full border border-white/10 text-xs font-bold text-white hover:bg-white/5 transition-colors font-sans"
                >
                  Ver Todas as Poses
                </button>
              )}
            </div>

            {/* Grid Bento demonstrativo com 3 pilares */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-8 border-t border-white/5 text-left">
              <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-4 space-y-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#D2FB4C]/10 text-[#D2FB4C]">
                  <Shield size={18} />
                </div>
                <h4 className="font-extended text-xs font-bold text-white uppercase">
                  Privacidade Criptografada
                </h4>
                <p className="text-[11px] text-[#8E9296] leading-relaxed">
                  Fotos seguras e invisíveis para o público. Apenas você acessa sua galeria.
                </p>
              </div>

              <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-4 space-y-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FAB03B]/10 text-[#FAB03B]">
                  <Scale size={18} />
                </div>
                <h4 className="font-extended text-xs font-bold text-white uppercase">
                  Vínculo com Balança
                </h4>
                <p className="text-[11px] text-[#8E9296] leading-relaxed">
                  Informe seu peso no upload para atualizar seu gráfico corporal automaticamente.
                </p>
              </div>

              <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-4 space-y-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#868CF0]/10 text-[#868CF0]">
                  <Columns size={18} />
                </div>
                <h4 className="font-extended text-xs font-bold text-white uppercase">
                  Comparador Antes & Depois
                </h4>
                <p className="text-[11px] text-[#8E9296] leading-relaxed">
                  Coloque fotos com semanas de diferença lado a lado para notar detalhes imperceptíveis no dia a dia.
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* GRADE BENTO DE CARDS DE FOTOS */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {filteredPhotos.map((p) => {
            const dateFormatted = new Date(p.date).toLocaleDateString("pt-BR", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            });

            return (
              <div
                key={p.id}
                className="group relative flex flex-col justify-between overflow-hidden rounded-[26px] border border-white/10 bg-[#16181A] p-3.5 shadow-[0_4px_20px_rgba(0,0,0,0.25)] transition-all duration-300 hover:border-[#D2FB4C]/40 hover:shadow-[0_8px_30px_rgba(0,0,0,0.4)]"
              >
                {/* Imagem com container arredondado e Overlay */}
                <div
                  className="relative aspect-[3/4] w-full overflow-hidden rounded-[20px] bg-black cursor-pointer"
                  onClick={() => setZoomedPhoto(p)}
                >
                  <Image
                    src={p.imageUrl}
                    alt={p.notes || `Progresso ${p.pose}`}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />

                  {/* Gradient Overlay sutil */}
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />

                  {/* Badges Flutuantes Superiores */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-black/60 backdrop-blur-md text-[#D2FB4C] border border-[#D2FB4C]/30 shadow-md">
                      {p.pose}
                    </span>

                    {p.weight && (
                      <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-black/60 backdrop-blur-md text-white border border-white/10 shadow-md">
                        <Scale size={11} className="text-[#CADBD0]" />
                        {p.weight} kg
                      </span>
                    )}
                  </div>

                  {/* Botão Hover de Zoom */}
                  <div className="absolute bottom-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/70 backdrop-blur-md text-white text-xs font-bold border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <Eye size={13} className="text-[#D2FB4C]" />
                    <span>Expandir</span>
                  </div>
                </div>

                {/* Metadados e Rodapé do Card */}
                <div className="p-2.5 space-y-2">
                  <div className="flex items-center justify-between text-xs text-[#8E9296]">
                    <span className="flex items-center gap-1.5 font-sans">
                      <Calendar size={13} className="text-[#868CF0]" />
                      <strong className="text-white font-semibold">{dateFormatted}</strong>
                    </span>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(p.id);
                      }}
                      className="p-1.5 rounded-lg text-[#6E7277] hover:bg-rose-500/10 hover:text-rose-400 transition-colors"
                      title="Excluir foto"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  {p.notes && (
                    <p className="text-xs text-[#A4A8AD] line-clamp-2 leading-relaxed font-sans pt-0.5">
                      {p.notes}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 1: UPLOAD DE FOTO (STUDIO BENTO FORM) */}
      {/* ========================================================= */}
      {isUploadOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-xl overflow-hidden rounded-[28px] border border-white/10 bg-[#16181A] shadow-2xl animate-scale-up max-h-[92vh] flex flex-col">
            {/* Header do Modal */}
            <div className="flex items-center justify-between border-b border-white/10 p-5 sm:p-6 bg-[#1A1C1E]">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#D2FB4C] font-sans">
                  Registro Fotográfico
                </span>
                <h3 className="font-extended text-xl font-black text-white uppercase tracking-tight">
                  Nova Foto de Evolução
                </h3>
              </div>
              <button
                onClick={() => setIsUploadOpen(false)}
                className="p-2 rounded-xl text-[#8E9296] hover:bg-white/5 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {error && (
              <div className="mx-6 mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300 font-medium">
                {error}
              </div>
            )}

            {/* Formulário com Scroll Interno */}
            <form onSubmit={handleUpload} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
              {/* Dropzone da Imagem */}
              <div className="relative rounded-2xl border-2 border-dashed border-white/15 bg-black/30 p-6 text-center hover:border-[#D2FB4C]/50 transition-colors cursor-pointer group">
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />

                {previewUrl ? (
                  <div className="relative w-full h-64 sm:h-72 rounded-xl overflow-hidden">
                    <Image
                      src={previewUrl}
                      alt="Preview"
                      fill
                      className="object-contain"
                    />
                    <div className="absolute bottom-2 right-2 px-3 py-1 rounded-lg bg-black/70 backdrop-blur-md text-[11px] font-bold text-white border border-white/10">
                      Clique para trocar foto
                    </div>
                  </div>
                ) : (
                  <div className="py-8 space-y-2.5">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#D2FB4C]/10 text-[#D2FB4C] group-hover:scale-105 transition-transform">
                      <Upload size={24} />
                    </div>
                    <div className="text-sm font-bold text-white font-sans">
                      Clique ou arraste sua foto aqui
                    </div>
                    <div className="text-xs text-[#8E9296] font-sans">
                      Formatos suportados: JPG, PNG, WEBP (Máximo: 10MB)
                    </div>
                  </div>
                )}
              </div>

              {/* Seletor Visual de Poses */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#CADBD0] font-sans">
                  Pose / Ângulo do Registro
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {POSES.filter((p) => p.val !== "TODAS").map((pos) => {
                    const isSelected = pose === pos.val;
                    return (
                      <button
                        key={pos.val}
                        type="button"
                        onClick={() => setPose(pos.val)}
                        className={`py-2 px-3 rounded-xl text-xs font-bold transition-all text-center font-sans ${
                          isSelected
                            ? "bg-[#D2FB4C] text-[#1E2022] font-black shadow-[0_2px_10px_rgba(210,251,76,0.3)]"
                            : "bg-white/[0.03] border border-white/10 text-[#8E9296] hover:bg-white/5 hover:text-white"
                        }`}
                      >
                        {pos.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Peso e Data */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#CADBD0] font-sans">
                    Peso no Dia (kg)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="Ex: 81.4"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-2.5 text-xs font-mono text-white placeholder-[#6E7277] focus:border-[#D2FB4C] focus:outline-none"
                  />
                  <span className="text-[10px] text-[#8E9296]">
                    Atualiza seu peso atual no perfil
                  </span>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#CADBD0] font-sans">
                    Data da Foto
                  </label>
                  <input
                    type="date"
                    value={photoDate}
                    onChange={(e) => setPhotoDate(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-2.5 text-xs text-white font-sans focus:border-[#D2FB4C] focus:outline-none"
                  />
                </div>
              </div>

              {/* Notas de Progresso */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#CADBD0] font-sans">
                  Anotações / Contexto (Opcional)
                </label>
                <input
                  type="text"
                  placeholder="Ex: Fim do primeiro mês de cutting, pós-treino de dorsal"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-2.5 text-xs text-white placeholder-[#6E7277] focus:border-[#D2FB4C] focus:outline-none font-sans"
                />
              </div>

              {/* Rodapé de Ações */}
              <div className="pt-3 border-t border-white/10 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsUploadOpen(false)}
                  className="px-5 py-2.5 rounded-full border border-white/10 text-xs font-bold text-[#8E9296] hover:bg-white/5 hover:text-white transition-colors font-sans"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={uploading || !file}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#D2FB4C] text-[#1E2022] text-xs font-black uppercase tracking-wider font-sans shadow-[0_0_20px_rgba(210,251,76,0.35)] hover:bg-[#D8FD50] hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 transition-all"
                >
                  {uploading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Salvando no Cofre...</span>
                    </>
                  ) : (
                    <>
                      <Check size={16} strokeWidth={3} />
                      <span>Salvar Foto</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 2: COMPARADOR ANTES E DEPOIS (STUDIO SPLIT HUD) */}
      {/* ========================================================= */}
      {isCompareOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-4xl overflow-hidden rounded-[28px] border border-white/10 bg-[#16181A] shadow-2xl animate-scale-up max-h-[92vh] flex flex-col">
            {/* Header do Comparador */}
            <div className="flex items-center justify-between border-b border-white/10 p-5 sm:p-6 bg-[#1A1C1E]">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#D2FB4C] font-sans">
                  Visual Split Screen
                </span>
                <h3 className="font-extended text-xl font-black text-white uppercase tracking-tight">
                  Comparador Antes & Depois
                </h3>
              </div>
              <button
                onClick={() => setIsCompareOpen(false)}
                className="p-2 rounded-xl text-[#8E9296] hover:bg-white/5 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Barra de Telemetria Comparativa */}
            {(compareWeightDiff !== null || compareDaysDiff > 0) && (
              <div className="bg-black/40 border-b border-white/5 px-6 py-3 flex flex-wrap items-center justify-between gap-3 text-xs">
                <span className="text-[#8E9296] font-sans">
                  Intervalo Temporal: <strong className="text-white">{compareDaysDiff} dias</strong> entre as duas capturas
                </span>

                {compareWeightDiff !== null && (
                  <span className="flex items-center gap-1.5 font-mono">
                    <span className="text-[#8E9296]">Variação de Peso:</span>
                    <strong
                      className={`font-bold ${
                        compareWeightDiff <= 0 ? "text-[#D2FB4C]" : "text-[#FAB03B]"
                      }`}
                    >
                      {compareWeightDiff > 0 ? `+${compareWeightDiff}` : compareWeightDiff} kg
                    </strong>
                  </span>
                )}
              </div>
            )}

            {/* Split Screen Lado a Lado */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Lado A: Antes */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#FAB03B]/15 text-[#FAB03B] border border-[#FAB03B]/25">
                      Foto 1 • Antes
                    </span>
                    <select
                      value={compareA}
                      onChange={(e) => setCompareA(e.target.value)}
                      className="rounded-xl border border-white/10 bg-black/40 px-3 py-1.5 text-xs text-white focus:border-[#D2FB4C] focus:outline-none"
                    >
                      {safePhotos.map((p) => (
                        <option key={p.id} value={p.id} className="bg-[#1A1C1E] text-white">
                          {new Date(p.date).toLocaleDateString("pt-BR")} - {p.pose} ({p.weight ? `${p.weight}kg` : "s/ peso"})
                        </option>
                      ))}
                    </select>
                  </div>

                  {selectedPhotoA ? (
                    <div className="relative aspect-[3/4] w-full rounded-2xl overflow-hidden bg-black border border-white/10">
                      <Image
                        src={selectedPhotoA.imageUrl}
                        alt="Foto Antes"
                        fill
                        className="object-cover"
                      />
                      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between px-3 py-1.5 rounded-xl bg-black/70 backdrop-blur-md text-xs text-white border border-white/10">
                        <span className="font-sans text-[11px]">
                          {new Date(selectedPhotoA.date).toLocaleDateString("pt-BR")}
                        </span>
                        {selectedPhotoA.weight && (
                          <span className="font-mono font-bold text-[#FAB03B]">
                            {selectedPhotoA.weight} kg
                          </span>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="aspect-[3/4] flex items-center justify-center rounded-2xl border border-dashed border-white/10 text-xs text-[#8E9296]">
                      Selecione uma foto
                    </div>
                  )}
                </div>

                {/* Lado B: Depois */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#D2FB4C]/15 text-[#D2FB4C] border border-[#D2FB4C]/25">
                      Foto 2 • Depois
                    </span>
                    <select
                      value={compareB}
                      onChange={(e) => setCompareB(e.target.value)}
                      className="rounded-xl border border-white/10 bg-black/40 px-3 py-1.5 text-xs text-white focus:border-[#D2FB4C] focus:outline-none"
                    >
                      {safePhotos.map((p) => (
                        <option key={p.id} value={p.id} className="bg-[#1A1C1E] text-white">
                          {new Date(p.date).toLocaleDateString("pt-BR")} - {p.pose} ({p.weight ? `${p.weight}kg` : "s/ peso"})
                        </option>
                      ))}
                    </select>
                  </div>

                  {selectedPhotoB ? (
                    <div className="relative aspect-[3/4] w-full rounded-2xl overflow-hidden bg-black border border-white/10">
                      <Image
                        src={selectedPhotoB.imageUrl}
                        alt="Foto Depois"
                        fill
                        className="object-cover"
                      />
                      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between px-3 py-1.5 rounded-xl bg-black/70 backdrop-blur-md text-xs text-white border border-white/10">
                        <span className="font-sans text-[11px]">
                          {new Date(selectedPhotoB.date).toLocaleDateString("pt-BR")}
                        </span>
                        {selectedPhotoB.weight && (
                          <span className="font-mono font-bold text-[#D2FB4C]">
                            {selectedPhotoB.weight} kg
                          </span>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="aspect-[3/4] flex items-center justify-center rounded-2xl border border-dashed border-white/10 text-xs text-[#8E9296]">
                      Selecione uma foto
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Rodapé do Comparador */}
            <div className="border-t border-white/10 p-5 bg-[#16181A] flex justify-end">
              <button
                type="button"
                onClick={() => setIsCompareOpen(false)}
                className="px-6 py-2.5 rounded-full border border-white/10 text-xs font-bold text-white hover:bg-white/5 transition-colors font-sans"
              >
                Fechar Comparador
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 3: ZOOM FULLSCREEN */}
      {/* ========================================================= */}
      {zoomedPhoto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-lg animate-fade-in cursor-zoom-out"
          onClick={() => setZoomedPhoto(null)}
        >
          <div
            className="relative max-w-3xl w-full h-[84vh] rounded-2xl overflow-hidden shadow-2xl cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={zoomedPhoto.imageUrl}
              alt="Foto ampliada"
              fill
              className="object-contain"
            />

            {/* Fechar no canto superior */}
            <button
              onClick={() => setZoomedPhoto(null)}
              className="absolute top-4 right-4 p-2.5 rounded-full bg-black/70 text-white hover:bg-black border border-white/10 transition-colors shadow-lg"
            >
              <X size={20} />
            </button>

            {/* Barra de Informações no Rodapé */}
            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between px-5 py-3 rounded-2xl bg-black/75 backdrop-blur-md border border-white/10 text-xs text-white">
              <div className="flex items-center gap-3">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#D2FB4C] text-[#1E2022]">
                  {zoomedPhoto.pose}
                </span>
                <span>{new Date(zoomedPhoto.date).toLocaleDateString("pt-BR")}</span>
                {zoomedPhoto.notes && (
                  <span className="hidden sm:inline text-[#8E9296] italic">
                    • {zoomedPhoto.notes}
                  </span>
                )}
              </div>

              {zoomedPhoto.weight && (
                <span className="font-mono font-bold text-[#D2FB4C]">
                  {zoomedPhoto.weight} kg
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
