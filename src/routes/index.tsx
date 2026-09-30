import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  AlarmClock,
  CalendarDays,
  Check,
  CheckCheck,
  ClipboardList,
  Clock,
  ListTodo,
  Moon,
  Pencil,
  Plus,
  Search,
  Sparkles,
  Sun,
  Trash2,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ---------- Types & constants ----------

type Prioridade = "baixa" | "media" | "alta";
type Categoria = "Trabalho" | "Estudos" | "Pessoal";
type StatusFiltro = "todas" | "pendentes" | "concluidas";

interface Tarefa {
  id: string;
  titulo: string;
  descricao: string;
  prioridade: Prioridade;
  categoria: Categoria;
  prazo: string; // "YYYY-MM-DD" ou ""
  concluida: boolean;
  criadaEm: string;
}

const TAREFAS_KEY = "taskflow.tarefas";
const TEMA_KEY = "taskflow.tema";

const PRIORIDADES: { valor: Prioridade; label: string }[] = [
  { valor: "baixa", label: "Baixa" },
  { valor: "media", label: "Média" },
  { valor: "alta", label: "Alta" },
];

const CATEGORIAS: Categoria[] = ["Trabalho", "Estudos", "Pessoal"];

const BADGE_PRIORIDADE: Record<Prioridade, string> = {
  baixa: "bg-priority-low-bg text-priority-low",
  media: "bg-priority-medium-bg text-priority-medium",
  alta: "bg-priority-high-bg text-priority-high",
};

const BADGE_CATEGORIA: Record<Categoria, string> = {
  Trabalho: "bg-cat-trabalho-bg text-cat-trabalho",
  Estudos: "bg-cat-estudos-bg text-cat-estudos",
  Pessoal: "bg-cat-pessoal-bg text-cat-pessoal",
};

const PONTO_PRIORIDADE: Record<Prioridade, string> = {
  baixa: "bg-priority-low",
  media: "bg-priority-medium",
  alta: "bg-priority-high",
};

// ---------- Helpers ----------

function hojeISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function estaAtrasada(t: Tarefa): boolean {
  return !t.concluida && t.prazo !== "" && t.prazo < hojeISO();
}

function formatarPrazo(prazo: string): string {
  if (!prazo) return "";
  const [y, m, d] = prazo.split("-").map(Number);
  return new Date(Date.UTC(y ?? 1970, (m ?? 1) - 1, d ?? 1)).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    timeZone: "UTC",
  });
}

function carregarTarefas(): Tarefa[] {
  try {
    const raw = localStorage.getItem(TAREFAS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as Tarefa[]) : [];
  } catch {
    return [];
  }
}

// ---------- Route ----------

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "TaskFlow — Gerenciador de Tarefas" },
      {
        name: "description",
        content:
          "Organize suas tarefas com prioridades, categorias e prazos. Simples, rápido e no seu navegador.",
      },
      { property: "og:title", content: "TaskFlow — Gerenciador de Tarefas" },
      {
        property: "og:description",
        content:
          "Organize suas tarefas com prioridades, categorias e prazos. Simples, rápido e no seu navegador.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
});

function Index() {
  const [tarefas, setTarefas] = useState<Tarefa[]>([]);
  const [tema, setTema] = useState<"light" | "dark">("light");
  const [pronto, setPronto] = useState(false);

  // Formulário
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [prioridade, setPrioridade] = useState<Prioridade>("media");
  const [categoria, setCategoria] = useState<Categoria>("Trabalho");
  const [prazo, setPrazo] = useState("");
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [erroTitulo, setErroTitulo] = useState(false);
  const [confirmarLimpar, setConfirmarLimpar] = useState(false);

  // Filtros
  const [busca, setBusca] = useState("");
  const [status, setStatus] = useState<StatusFiltro>("todas");
  const [filtroPrioridade, setFiltroPrioridade] = useState<"todas" | Prioridade>("todas");
  const [filtroCategoria, setFiltroCategoria] = useState<"todas" | Categoria>("todas");

  // Hidratação: carrega dados do navegador após a primeira renderização
  useEffect(() => {
    setTarefas(carregarTarefas());
    const salvo = localStorage.getItem(TEMA_KEY);
    const prefereEscuro =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches;
    setTema(salvo === "dark" || salvo === "light" ? salvo : prefereEscuro ? "dark" : "light");
    setPronto(true);
  }, []);

  useEffect(() => {
    if (!pronto) return;
    localStorage.setItem(TAREFAS_KEY, JSON.stringify(tarefas));
  }, [tarefas, pronto]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", tema === "dark");
    if (pronto) localStorage.setItem(TEMA_KEY, tema);
  }, [tema, pronto]);

  function alternarTema() {
    const novoTema = tema === "dark" ? "light" : "dark";
    document.documentElement.classList.toggle("dark", novoTema === "dark");
    localStorage.setItem(TEMA_KEY, novoTema);
    setTema(novoTema);
  }

  function limparForm() {
    setTitulo("");
    setDescricao("");
    setPrioridade("media");
    setCategoria("Trabalho");
    setPrazo("");
    setEditandoId(null);
    setErroTitulo(false);
  }

  function enviarForm(e: React.FormEvent) {
    e.preventDefault();
    if (!titulo.trim()) {
      setErroTitulo(true);
      return;
    }
    if (editandoId) {
      setTarefas((prev) =>
        prev.map((t) =>
          t.id === editandoId
            ? { ...t, titulo: titulo.trim(), descricao: descricao.trim(), prioridade, categoria, prazo }
            : t,
        ),
      );
    } else {
      const nova: Tarefa = {
        id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`,
        titulo: titulo.trim(),
        descricao: descricao.trim(),
        prioridade,
        categoria,
        prazo,
        concluida: false,
        criadaEm: new Date().toISOString(),
      };
      setTarefas((prev) => [nova, ...prev]);
    }
    limparForm();
  }

  function iniciarEdicao(t: Tarefa) {
    setEditandoId(t.id);
    setTitulo(t.titulo);
    setDescricao(t.descricao);
    setPrioridade(t.prioridade);
    setCategoria(t.categoria);
    setPrazo(t.prazo);
    setErroTitulo(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function alternarTarefa(id: string) {
    setTarefas((prev) => prev.map((t) => (t.id === id ? { ...t, concluida: !t.concluida } : t)));
  }

  function excluirTarefa(id: string) {
    setTarefas((prev) => prev.filter((t) => t.id !== id));
    if (editandoId === id) limparForm();
  }

  function limparConcluidas() {
    setTarefas((prev) => prev.filter((t) => !t.concluida));
    setConfirmarLimpar(false);
  }

  const resumo = useMemo(() => {
    const pendentes = tarefas.filter((t) => !t.concluida).length;
    const concluidas = tarefas.length - pendentes;
    const atrasadas = tarefas.filter(estaAtrasada).length;
    const percentual = tarefas.length === 0 ? 0 : Math.round((concluidas / tarefas.length) * 100);
    return { total: tarefas.length, pendentes, concluidas, atrasadas, percentual };
  }, [tarefas]);

  const filtradas = useMemo(() => {
    const q = busca.trim().toLowerCase();
    return tarefas.filter((t) => {
      if (status === "pendentes" && t.concluida) return false;
      if (status === "concluidas" && !t.concluida) return false;
      if (filtroPrioridade !== "todas" && t.prioridade !== filtroPrioridade) return false;
      if (filtroCategoria !== "todas" && t.categoria !== filtroCategoria) return false;
      if (q && !t.titulo.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [tarefas, busca, status, filtroPrioridade, filtroCategoria]);

  const filtroAtivo =
    status !== "todas" || filtroPrioridade !== "todas" || filtroCategoria !== "todas" || busca.trim() !== "";

  const semTarefas = tarefas.length === 0;

  return (
    <div className="relative min-h-screen overflow-x-clip">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-grid" aria-hidden="true" />
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-gradient-to-b from-primary-soft to-transparent"
        aria-hidden="true"
      />

      <div className="relative mx-auto w-full max-w-3xl px-4 pb-16 pt-6 sm:px-6">
        {/* Cabeçalho */}
        <header className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-pop">
              <ListTodo className="size-5" aria-hidden="true" />
            </div>
            <div>
              <h1 className="font-display text-xl font-bold tracking-tight">TaskFlow</h1>
              <p className="text-xs text-muted-foreground">Organize seu dia, sem complicação</p>
            </div>
          </div>
          <button
            type="button"
            onClick={alternarTema}
            aria-label={tema === "dark" ? "Mudar para modo claro" : "Mudar para modo escuro"}
            className="flex size-10 items-center justify-center rounded-xl border bg-card text-foreground shadow-card transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            {tema === "dark" ? <Sun className="size-5" /> : <Moon className="size-5" />}
          </button>
        </header>

        {/* Resumo */}
        <section aria-label="Resumo de tarefas" className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <CardResumo icone={<ClipboardList className="size-4" />} label="Total" valor={resumo.total} />
          <CardResumo icone={<Clock className="size-4" />} label="Pendentes" valor={resumo.pendentes} />
          <CardResumo icone={<CheckCheck className="size-4" />} label="Concluídas" valor={resumo.concluidas} />
          <CardResumo
            icone={<AlarmClock className="size-4" />}
            label="Atrasadas"
            valor={resumo.atrasadas}
            destaque={resumo.atrasadas > 0}
          />
        </section>

        {/* Formulário */}
        <section aria-label={editandoId ? "Editar tarefa" : "Nova tarefa"} className="mt-6">
          <form
            onSubmit={enviarForm}
            className="rounded-2xl border bg-card p-4 shadow-card sm:p-5"
          >
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-display text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                {editandoId ? "Editar tarefa" : "Nova tarefa"}
              </h2>
              {editandoId && (
                <button
                  type="button"
                  onClick={limparForm}
                  className="flex items-center gap-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  <X className="size-3.5" aria-hidden="true" /> Cancelar edição
                </button>
              )}
            </div>

            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <input
                  value={titulo}
                  onChange={(e) => {
                    setTitulo(e.target.value);
                    if (erroTitulo && e.target.value.trim()) setErroTitulo(false);
                  }}
                  placeholder="Título da tarefa *"
                  aria-label="Título da tarefa (obrigatório)"
                  aria-invalid={erroTitulo || undefined}
                  className={cn(
                    "w-full rounded-xl border bg-background px-4 py-2.5 text-sm outline-none transition-all placeholder:text-muted-foreground/70 focus:ring-2 focus:ring-ring/50",
                    erroTitulo ? "border-destructive" : "border-input focus:border-ring",
                  )}
                />
                {erroTitulo && (
                  <p className="mt-1.5 text-xs font-medium text-destructive">
                    O título é obrigatório.
                  </p>
                )}
              </div>

              <div className="sm:col-span-2">
                <textarea
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  placeholder="Descrição (opcional)"
                  aria-label="Descrição da tarefa (opcional)"
                  rows={2}
                  className="w-full resize-none rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none transition-all placeholder:text-muted-foreground/70 focus:border-ring focus:ring-2 focus:ring-ring/50"
                />
              </div>

              <Campo label="Prioridade">
                <select
                  value={prioridade}
                  onChange={(e) => setPrioridade(e.target.value as Prioridade)}
                  aria-label="Prioridade"
                  className="w-full appearance-none rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm outline-none transition-all focus:border-ring focus:ring-2 focus:ring-ring/50"
                >
                  {PRIORIDADES.map((p) => (
                    <option key={p.valor} value={p.valor}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </Campo>

              <Campo label="Categoria">
                <select
                  value={categoria}
                  onChange={(e) => setCategoria(e.target.value as Categoria)}
                  aria-label="Categoria"
                  className="w-full appearance-none rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm outline-none transition-all focus:border-ring focus:ring-2 focus:ring-ring/50"
                >
                  {CATEGORIAS.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </Campo>

              <Campo label="Prazo">
                <input
                  type="date"
                  value={prazo}
                  onChange={(e) => setPrazo(e.target.value)}
                  aria-label="Data de prazo"
                  className="w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm outline-none transition-all focus:border-ring focus:ring-2 focus:ring-ring/50"
                />
              </Campo>

              <div className="flex items-end">
                <button
                  type="submit"
                  className="flex h-[42px] w-full items-center justify-center gap-2 rounded-xl bg-primary text-sm font-semibold text-primary-foreground shadow-pop transition-all hover:brightness-110 active:scale-[0.98]"
                >
                  {editandoId ? "Salvar alterações" : <><Plus className="size-4" /> Adicionar tarefa</>}
                </button>
              </div>
            </div>
          </form>
        </section>

        {/* Filtros */}
        <section aria-label="Filtros" className="mt-6 space-y-3">
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <input
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar por título…"
              aria-label="Buscar tarefas por título"
              className="w-full rounded-xl border border-input bg-card py-2.5 pl-10 pr-4 text-sm outline-none transition-all placeholder:text-muted-foreground/70 focus:border-ring focus:ring-2 focus:ring-ring/50"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div
              role="group"
              aria-label="Filtrar por status"
              className="flex rounded-xl border bg-card p-1 shadow-card"
            >
              {(
                [
                  { valor: "todas", label: "Todas" },
                  { valor: "pendentes", label: "Pendentes" },
                  { valor: "concluidas", label: "Concluídas" },
                ] as { valor: StatusFiltro; label: string }[]
              ).map((s) => (
                <button
                  key={s.valor}
                  type="button"
                  onClick={() => setStatus(s.valor)}
                  aria-pressed={status === s.valor}
                  className={cn(
                    "rounded-lg px-3 py-1.5 text-xs font-semibold transition-all sm:text-sm",
                    status === s.valor
                      ? "bg-primary text-primary-foreground shadow-pop"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {s.label}
                </button>
              ))}
            </div>

            <select
              value={filtroPrioridade}
              onChange={(e) => setFiltroPrioridade(e.target.value as "todas" | Prioridade)}
              aria-label="Filtrar por prioridade"
              className="rounded-xl border border-input bg-card px-3 py-2 text-xs font-medium outline-none transition-all focus:border-ring focus:ring-2 focus:ring-ring/50 sm:text-sm"
            >
              <option value="todas">Toda prioridade</option>
              {PRIORIDADES.map((p) => (
                <option key={p.valor} value={p.valor}>
                  Prioridade {p.label}
                </option>
              ))}
            </select>

            <select
              value={filtroCategoria}
              onChange={(e) => setFiltroCategoria(e.target.value as "todas" | Categoria)}
              aria-label="Filtrar por categoria"
              className="rounded-xl border border-input bg-card px-3 py-2 text-xs font-medium outline-none transition-all focus:border-ring focus:ring-2 focus:ring-ring/50 sm:text-sm"
            >
              <option value="todas">Toda categoria</option>
              {CATEGORIAS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            {filtroAtivo && (
              <button
                type="button"
                onClick={() => {
                  setStatus("todas");
                  setFiltroPrioridade("todas");
                  setFiltroCategoria("todas");
                  setBusca("");
                }}
                className="flex items-center gap-1 rounded-xl px-2.5 py-2 text-xs font-semibold text-primary transition-colors hover:bg-primary-soft"
              >
                <X className="size-3.5" aria-hidden="true" /> Limpar filtros
              </button>
            )}
          </div>
        </section>

        {/* Lista de tarefas */}
        <section aria-label="Lista de tarefas" className="mt-6 space-y-3">
          {filtradas.map((t) => (
            <ItemTarefa
              key={t.id}
              tarefa={t}
              aoAlternar={() => alternarTarefa(t.id)}
              aoEditar={() => iniciarEdicao(t)}
              aoExcluir={() => excluirTarefa(t.id)}
              editando={editandoId === t.id}
            />
          ))}

          {semTarefas && (
            <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed bg-card/60 px-6 py-14 text-center">
              <div className="flex size-14 items-center justify-center rounded-2xl bg-primary-soft text-primary">
                <Sparkles className="size-6" aria-hidden="true" />
              </div>
              <div>
                <p className="font-display text-base font-semibold">
                  Nada por aqui ainda ✨
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Adicione sua primeira tarefa e comece a organizar seu dia!
                </p>
              </div>
            </div>
          )}

          {!semTarefas && filtradas.length === 0 && (
            <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed bg-card/60 px-6 py-12 text-center">
              <p className="font-display text-base font-semibold">Nenhuma tarefa encontrada</p>
              <p className="text-sm text-muted-foreground">
                Nenhuma tarefa combina com os filtros atuais. Tente ajustá-los ou limpar a busca.
              </p>
            </div>
          )}
        </section>

        <footer className="mt-10 text-center text-xs text-muted-foreground">
          TaskFlow · suas tarefas ficam salvas neste navegador
        </footer>
      </div>
    </div>
  );
}

// ---------- Subcomponentes ----------

function Campo({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      {children}
    </label>
  );
}

function CardResumo({
  icone,
  label,
  valor,
  destaque,
}: {
  icone: React.ReactNode;
  label: string;
  valor: number;
  destaque?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border bg-card p-4 shadow-card",
        destaque && "border-overdue-border bg-overdue-bg",
      )}
    >
      <div
        className={cn(
          "flex items-center gap-2 text-xs font-semibold uppercase tracking-wide",
          destaque ? "text-overdue" : "text-muted-foreground",
        )}
      >
        {icone}
        {label}
      </div>
      <p
        className={cn(
          "font-display mt-1.5 text-2xl font-bold tabular-nums",
          destaque && "text-overdue",
        )}
      >
        {valor}
      </p>
    </div>
  );
}

function ItemTarefa({
  tarefa,
  aoAlternar,
  aoEditar,
  aoExcluir,
  editando,
}: {
  tarefa: Tarefa;
  aoAlternar: () => void;
  aoEditar: () => void;
  aoExcluir: () => void;
  editando: boolean;
}) {
  const atrasada = estaAtrasada(tarefa);
  const vencendoHoje = !tarefa.concluida && tarefa.prazo === hojeISO();

  return (
    <article
      className={cn(
        "task-done group rounded-2xl border bg-card p-4 shadow-card transition-all",
        atrasada && "border-overdue-border bg-overdue-bg",
        tarefa.concluida && "opacity-70",
        editando && "ring-2 ring-ring/60",
      )}
    >
      <div className="flex items-start gap-3">
        <button
          type="button"
          onClick={aoAlternar}
          role="checkbox"
          aria-checked={tarefa.concluida}
          aria-label={tarefa.concluida ? "Marcar como pendente" : "Marcar como concluída"}
          className={cn(
            "mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-lg border-2 transition-all",
            tarefa.concluida
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border hover:border-primary",
          )}
        >
          {tarefa.concluida && <Check className="size-4" aria-hidden="true" />}
        </button>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className={cn("size-2 rounded-full", PONTO_PRIORIDADE[tarefa.prioridade])} aria-hidden="true" />
            <h3
              className={cn(
                "font-display text-[15px] font-semibold leading-snug",
                tarefa.concluida && "line-through decoration-2 opacity-70",
              )}
            >
              {tarefa.titulo}
            </h3>
            <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-bold", BADGE_PRIORIDADE[tarefa.prioridade])}>
              {tarefa.prioridade === "media" ? "Média" : tarefa.prioridade === "alta" ? "Alta" : "Baixa"}
            </span>
            <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-bold", BADGE_CATEGORIA[tarefa.categoria])}>
              {tarefa.categoria}
            </span>
            {atrasada && (
              <span className="rounded-full bg-overdue px-2 py-0.5 text-[11px] font-bold text-overdue-foreground">
                Atrasada
              </span>
            )}
          </div>

          {tarefa.descricao && (
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{tarefa.descricao}</p>
          )}

          <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
            {tarefa.prazo && (
              <span
                className={cn(
                  "inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 font-medium",
                  atrasada && "bg-overdue-bg font-bold text-overdue",
                  vencendoHoje && !atrasada && "bg-priority-medium-bg font-bold text-priority-medium",
                )}
              >
                <CalendarDays className="size-3.5" aria-hidden="true" />
                {atrasada
                  ? `Prazo vencido em ${formatarPrazo(tarefa.prazo)}`
                  : vencendoHoje
                    ? "Vence hoje"
                    : `Prazo: ${formatarPrazo(tarefa.prazo)}`}
              </span>
            )}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={aoEditar}
            aria-label={`Editar ${tarefa.titulo}`}
            className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            <Pencil className="size-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={aoExcluir}
            aria-label={`Excluir ${tarefa.titulo}`}
            className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-overdue-bg hover:text-overdue"
          >
            <Trash2 className="size-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </article>
  );
}
