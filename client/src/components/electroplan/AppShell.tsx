import { useEffect, useMemo, useRef, useState, type FormEvent, type ReactNode } from "react";
import { Link, useLocation } from "wouter";
import {
  Activity,
  AlertTriangle,
  Bell,
  Boxes,
  CalendarCheck2,
  ChartNoAxesCombined,
  Check,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  Factory,
  Gauge,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Search,
  Settings2,
  ShieldCheck,
  SlidersHorizontal,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { toast } from "sonner";
import {
  demoFailures,
  demoPreventives,
  type NewWorkOrderInput,
  type WorkOrderRecord,
} from "@/data/demo-data";
import { getArea, type AreaId } from "@/data/areas";
import type { AreaEquipmentRecord } from "@/data/equipment-lifecycle";

interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  group: "Operação" | "Inteligência";
}

export const navigationItems: NavItem[] = [
  { label: "Áreas", href: "/areas", icon: Factory, group: "Operação" },
  { label: "Visão geral", href: "/", icon: LayoutDashboard, group: "Operação" },
  { label: "Equipamentos", href: "/equipamentos", icon: Boxes, group: "Operação" },
  { label: "Manutenção preventiva", href: "/preventiva", icon: CalendarCheck2, group: "Operação" },
  { label: "Ordens de serviço", href: "/ordens-de-servico", icon: ClipboardList, group: "Operação" },
  { label: "Histórico de falhas", href: "/falhas", icon: Activity, group: "Operação" },
  { label: "Materiais e componentes", href: "/materiais", icon: Package, group: "Operação" },
  { label: "Segurança", href: "/seguranca", icon: ShieldCheck, group: "Operação" },
  { label: "Paradas industriais", href: "/paradas", icon: Factory, group: "Operação" },
  { label: "Relatórios e indicadores", href: "/relatorios", icon: ChartNoAxesCombined, group: "Inteligência" },
  { label: "Administração", href: "/administracao", icon: Settings2, group: "Inteligência" },
];

interface AppShellProps {
  children: ReactNode;
  orders: WorkOrderRecord[];
  equipmentOptions: AreaEquipmentRecord[];
  activeAreaId: AreaId | null;
  onCreateOrder: (input: NewWorkOrderInput) => void;
  createOpen: boolean;
  onCreateOpenChange: (open: boolean) => void;
  autoRotate: boolean;
  onAutoRotateChange: (value: boolean) => void;
}

interface SearchItem {
  title: string;
  detail: string;
  href: string;
  type: string;
}

export default function AppShell({
  children,
  orders,
  equipmentOptions,
  activeAreaId,
  onCreateOrder,
  createOpen,
  onCreateOpenChange,
  autoRotate,
  onAutoRotateChange,
}: AppShellProps) {
  const [location, navigate] = useLocation();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [sessionInfoOpen, setSessionInfoOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const current = navigationItems.find((item) => item.href === location) ?? navigationItems[0];
  useEffect(() => {
    const handleShortcut = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleShortcut);
    return () => window.removeEventListener("keydown", handleShortcut);
  }, []);
  const today = new Intl.DateTimeFormat("pt-BR", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date());

  const searchItems = useMemo<SearchItem[]>(() => {
    const query = searchValue.trim().toLocaleLowerCase("pt-BR");
    if (!query) return [];
    const equipmentHits = equipmentOptions
      .filter((item) => `${item.name} ${item.code} ${item.location}`.toLocaleLowerCase("pt-BR").includes(query))
      .map((item) => ({ title: item.name, detail: `${item.code} · ${item.location}`, href: "/equipamentos", type: "Equipamento" }));
    const orderHits = orders
      .filter((item) => `${item.id} ${item.title} ${item.status}`.toLocaleLowerCase("pt-BR").includes(query))
      .map((item) => ({ title: item.id, detail: `${item.title} · ${item.status}`, href: "/ordens-de-servico", type: "Ordem de serviço" }));
    const preventiveHits = demoPreventives
      .filter((item) => `${item.id} ${item.title}`.toLocaleLowerCase("pt-BR").includes(query))
      .map((item) => ({ title: item.id, detail: item.title, href: "/preventiva", type: "Preventiva" }));
    const failureHits = demoFailures
      .filter((item) => `${item.id} ${item.category} ${item.symptom}`.toLocaleLowerCase("pt-BR").includes(query))
      .map((item) => ({ title: item.id, detail: `${item.category} · causa não confirmada`, href: "/falhas", type: "Falha" }));
    const moduleHits = navigationItems
      .filter((item) => item.label.toLocaleLowerCase("pt-BR").includes(query))
      .map((item) => ({ title: item.label, detail: "Módulo EletroPlan", href: item.href, type: "Módulo" }));
    return [...equipmentHits, ...orderHits, ...preventiveHits, ...failureHits, ...moduleHits].slice(0, 6);
  }, [equipmentOptions, orders, searchValue]);

  function submitOrder(input: NewWorkOrderInput) {
    onCreateOrder(input);
    onCreateOpenChange(false);
    toast.success("Ordem adicionada à demonstração desta sessão", {
      description: "Nenhum dado foi enviado ou salvo em um sistema operacional.",
    });
  }

  return (
    <div className="app-frame">
      <Sidebar
        currentPath={location}
        mobileOpen={mobileNavOpen}
        onNavigate={() => setMobileNavOpen(false)}
        onExit={() => setSessionInfoOpen(true)}
      />
      {mobileNavOpen && (
        <button
          className="mobile-scrim"
          aria-label="Fechar navegação"
          onClick={() => setMobileNavOpen(false)}
        />
      )}

      <div className="workspace">
        <header className="topbar">
          <button
            className="icon-button mobile-menu-button"
            aria-label="Abrir navegação"
            aria-expanded={mobileNavOpen}
            onClick={() => setMobileNavOpen(true)}
          >
            <Menu size={19} />
          </button>
          <div className="breadcrumbs" aria-label="Caminho de navegação">
            <span className="breadcrumb-root">Operações</span>
            <ChevronRight size={14} aria-hidden="true" />
            <span className="breadcrumb-current">{current.label}</span>
          </div>

          <div className="topbar-tools">
            <button className="area-context-button" type="button" onClick={() => { setMobileNavOpen(false); setNotificationOpen(false); setSettingsOpen(false); setProfileOpen(false); navigate("/areas"); }} aria-label={activeAreaId ? `Trocar área ativa: ${getArea(activeAreaId)?.name}` : "Selecionar área de atuação"} title="Trocar área de atuação">
              <Factory size={15} aria-hidden="true" /><span><small>ÁREA</small><strong>{getArea(activeAreaId)?.name ?? "Selecionar"}</strong></span><ChevronDown size={13} aria-hidden="true" />
            </button>
            <div className="global-search">
              <Search size={16} aria-hidden="true" />
              <input
                ref={searchInputRef}
                type="search"
                value={searchValue}
                placeholder="Buscar ativos, OS..."
                aria-label="Buscar equipamentos, ordens, preventivas, falhas e módulos demonstrativos"
                aria-expanded={Boolean(searchValue.trim())}
                aria-controls="global-search-results"
                onChange={(event) => setSearchValue(event.currentTarget.value)}
                onKeyDown={(event) => {
                  if (event.key === "Escape") setSearchValue("");
                }}
              />
              <kbd>Ctrl K</kbd>
              {searchValue.trim() && (
                <div className="search-results" id="global-search-results" role="listbox">
                  <div className="popover-eyebrow">RESULTADOS DA DEMONSTRAÇÃO</div>
                  {searchItems.length ? searchItems.map((item) => (
                    <button
                      className="search-result"
                      key={`${item.type}-${item.title}`}
                      role="option"
                      aria-selected="false"
                      onClick={() => {
                        navigate(item.href);
                        setSearchValue("");
                      }}
                    >
                      <span className="search-result-icon"><Search size={14} /></span>
                      <span className="search-result-copy"><strong>{item.title}</strong><small>{item.detail}</small></span>
                      <span className="search-result-type">{item.type}</span>
                    </button>
                  )) : (
                    <div className="search-empty">Nenhum registro demonstrativo corresponde a “{searchValue}”.</div>
                  )}
                </div>
              )}
            </div>

            <div className="topbar-date"><span className="date-dot" />{today}</div>

            <div className="popover-anchor">
              <button
                className={`icon-button ${notificationOpen ? "is-active" : ""}`}
                aria-label="Abrir central de notificações"
                aria-expanded={notificationOpen}
                onClick={() => {
                  setNotificationOpen(!notificationOpen);
                  setSettingsOpen(false);
                  setProfileOpen(false);
                }}
              >
                <Bell size={18} />
              </button>
              {notificationOpen && (
                <div className="top-popover notification-popover" role="dialog" aria-label="Central de notificações">
                  <div className="popover-title-row"><div><span className="popover-eyebrow">CENTRAL</span><h3>Notificações</h3></div><span className="neutral-pill">DEMO</span></div>
                  <div className="popover-notice-icon"><Bell size={17} /></div>
                  <p className="popover-notice-title">Nenhuma fonte operacional conectada</p>
                  <p className="popover-notice-copy">Esta etapa não recebe eventos em tempo real. Os avisos visíveis no painel são registros fictícios para demonstração.</p>
                  <button className="popover-link-button" onClick={() => {
                    setNotificationOpen(false);
                    const scrollToAlerts = () => document.getElementById("dashboard-alerts")?.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "center" });
                    if (location !== "/") { navigate("/"); window.setTimeout(scrollToAlerts, 100); }
                    else scrollToAlerts();
                  }}>
                    Ver alertas demonstrativos <ChevronRight size={15} />
                  </button>
                </div>
              )}
            </div>

            <div className="popover-anchor">
              <button
                className={`icon-button ${settingsOpen ? "is-active" : ""}`}
                aria-label="Abrir preferências visuais"
                aria-expanded={settingsOpen}
                onClick={() => {
                  setSettingsOpen(!settingsOpen);
                  setNotificationOpen(false);
                  setProfileOpen(false);
                }}
              >
                <SlidersHorizontal size={18} />
              </button>
              {settingsOpen && (
                <div className="top-popover settings-popover" role="dialog" aria-label="Preferências visuais">
                  <div className="popover-title-row"><div><span className="popover-eyebrow">APARÊNCIA</span><h3>Preferências</h3></div><Settings2 size={17} /></div>
                  <div className="preference-row">
                    <span className="preference-icon"><Gauge size={16} /></span>
                    <span className="preference-copy"><strong>Rotação suave do modelo</strong><small>Desative para reduzir movimento.</small></span>
                    <button
                      className={`switch-control ${autoRotate ? "is-on" : ""}`}
                      role="switch"
                      aria-checked={autoRotate}
                      aria-label="Rotação suave do modelo"
                      onClick={() => onAutoRotateChange(!autoRotate)}
                    ><span /></button>
                  </div>
                  <p className="settings-footnote">A preferência do sistema para movimento reduzido sempre é respeitada.</p>
                </div>
              )}
            </div>

            <div className="popover-anchor profile-anchor">
              <button
                className={`profile-trigger ${profileOpen ? "is-active" : ""}`}
                aria-expanded={profileOpen}
                onClick={() => {
                  setProfileOpen(!profileOpen);
                  setNotificationOpen(false);
                  setSettingsOpen(false);
                }}
              >
                <span className="avatar-mark">EP</span>
                <span className="profile-trigger-copy"><strong>Usuário</strong><small>Perfil demonstração</small></span>
                <ChevronDown size={14} />
              </button>
              {profileOpen && (
                <div className="top-popover profile-popover" role="dialog" aria-label="Perfil demonstrativo">
                  <div className="profile-card-heading"><span className="avatar-mark avatar-large">EP</span><div><strong>Usuário demonstrativo</strong><small>Consulta · sem autenticação</small></div></div>
                  <div className="profile-note"><span className="profile-note-dot" /> Ambiente local de demonstração</div>
                  <button className="popover-link-button" onClick={() => { setProfileOpen(false); navigate("/administracao"); }}>Acessar Administração <ChevronRight size={15} /></button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="main-content">{children}</main>
      </div>

      {createOpen && <NewOrderDialog equipmentOptions={equipmentOptions} onClose={() => onCreateOpenChange(false)} onSubmit={submitOrder} />}
      {sessionInfoOpen && (
        <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setSessionInfoOpen(false); }}>
          <section className="modal-card info-modal" role="dialog" aria-modal="true" aria-labelledby="session-info-title">
            <div className="modal-icon muted-icon"><LogOut size={19} /></div>
            <span className="eyebrow">SESSÃO DE DEMONSTRAÇÃO</span>
            <h2 id="session-info-title">Nenhuma conta está conectada</h2>
            <p>A autenticação real e o controle de permissões estão previstos para uma etapa futura. Esta ação não encerra uma sessão nem remove os dados demonstrativos.</p>
            <button className="button-primary modal-confirm" onClick={() => setSessionInfoOpen(false)}>Entendi <Check size={15} /></button>
          </section>
        </div>
      )}
    </div>
  );
}

function Sidebar({ currentPath, mobileOpen, onNavigate, onExit }: {
  currentPath: string;
  mobileOpen: boolean;
  onNavigate: () => void;
  onExit: () => void;
}) {
  const [location] = useLocation();
  const activePath = currentPath || location;

  return (
    <aside className={`sidebar ${mobileOpen ? "is-open" : ""}`} aria-label="Navegação principal">
      <div className="brand-lockup">
        <div className="brand-symbol" aria-hidden="true">
          <svg viewBox="0 0 36 36" fill="none"><path d="M18 2.8 31.2 10.4v15.2L18 33.2 4.8 25.6V10.4L18 2.8Z" stroke="currentColor" strokeWidth="1.2"/><path d="M11 12h13M11 18h9M11 24h13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><circle cx="24.5" cy="18" r="2.1" fill="currentColor"/></svg>
        </div>
        <div className="brand-wordmark"><strong>Eletro<span>Plan</span></strong><small>MANUTENÇÃO INDUSTRIAL</small></div>
        <span className="brand-version">01</span>
      </div>
      <div className="sidebar-organization">
        <div className="org-line"><span className="org-indicator" />CBSI <span className="org-caption">· AMBIENTE DEMO</span></div>
        <span className="org-placeholder">Marca institucional reservada</span>
      </div>

      <nav className="side-nav">
        <span className="nav-section-label">OPERAÇÃO</span>
        {navigationItems.filter((item) => item.group === "Operação").map((item) => <NavLink key={item.href} item={item} activePath={activePath} onNavigate={onNavigate} />)}
        <span className="nav-section-label intelligence-label">INTELIGÊNCIA</span>
        {navigationItems.filter((item) => item.group === "Inteligência").map((item) => <NavLink key={item.href} item={item} activePath={activePath} onNavigate={onNavigate} />)}
      </nav>

      <div className="sidebar-spacer" />
      <div className="sidebar-footer">
        <div className="sidebar-user">
          <span className="avatar-mark sidebar-avatar">EP</span>
          <span className="sidebar-user-copy"><strong>Usuário demo</strong><small>Perfil de consulta</small></span>
          <button className="icon-button exit-button" aria-label="Sair da demonstração" title="Sair da demonstração" onClick={onExit}><LogOut size={16} /></button>
        </div>
        <div className="connection-status"><span className="connection-pulse" /><span>Dados locais · sem conexão</span><span className="connection-lock" aria-label="Sem integração" /></div>
      </div>
    </aside>
  );
}

function NavLink({ item, activePath, onNavigate }: { item: NavItem; activePath: string; onNavigate: () => void }) {
  const active = activePath === item.href;
  const Icon = item.icon;
  return (
    <Link href={item.href} onClick={onNavigate} className={`side-nav-link ${active ? "is-active" : ""}`} aria-current={active ? "page" : undefined}>
      <span className="nav-icon"><Icon size={17} strokeWidth={active ? 2 : 1.7} /></span>
      <span>{item.label}</span>
      {active && <span className="nav-active-mark" />}
    </Link>
  );
}

function NewOrderDialog({ equipmentOptions, onClose, onSubmit }: { equipmentOptions: AreaEquipmentRecord[]; onClose: () => void; onSubmit: (input: NewWorkOrderInput) => void }) {
  const [equipmentId, setEquipmentId] = useState(equipmentOptions[0]?.id ?? "");
  const [title, setTitle] = useState("");
  const [kind, setKind] = useState<NewWorkOrderInput["kind"]>("Corretiva");
  const [priority, setPriority] = useState<NewWorkOrderInput["priority"]>("Média");

  useEffect(() => {
    if (!equipmentOptions.some((item) => item.id === equipmentId)) setEquipmentId(equipmentOptions[0]?.id ?? "");
  }, [equipmentOptions, equipmentId]);

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === "Escape") onClose(); };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [onClose]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!equipmentOptions.length || !equipmentId || !title.trim()) return;
    onSubmit({ equipmentId, title: title.trim(), kind, priority });
  }

  return (
    <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className="modal-card create-order-modal" role="dialog" aria-modal="true" aria-labelledby="new-order-title">
        <div className="modal-header"><div><span className="eyebrow">REGISTRO EFÊMERO</span><h2 id="new-order-title">Nova ordem de serviço</h2><p>Adicione um item à demonstração desta sessão.</p></div><button className="icon-button" aria-label="Fechar" onClick={onClose}><X size={18} /></button></div>
        <form onSubmit={handleSubmit}>
          <label className="form-field"><span>Equipamento da área <b>*</b></span><select value={equipmentId} onChange={(event) => setEquipmentId(event.currentTarget.value)} required disabled={!equipmentOptions.length}>{equipmentOptions.length ? equipmentOptions.map((item) => <option key={item.id} value={item.id}>{item.code} · {item.name}</option>) : <option value="">Nenhum equipamento ativo na área</option>}</select></label>
          <label className="form-field"><span>Descrição da solicitação <b>*</b></span><input autoFocus value={title} onChange={(event) => setTitle(event.currentTarget.value)} placeholder="Ex.: Verificação para demonstração" required maxLength={120} /></label>
          <div className="form-grid-two">
            <label className="form-field"><span>Tipo</span><select value={kind} onChange={(event) => setKind(event.currentTarget.value as NewWorkOrderInput["kind"])}><option>Corretiva</option><option>Preventiva</option></select></label>
            <label className="form-field"><span>Prioridade</span><select value={priority} onChange={(event) => setPriority(event.currentTarget.value as NewWorkOrderInput["priority"])}><option>Crítica</option><option>Alta</option><option>Média</option><option>Baixa</option></select></label>
          </div>
          <div className="form-disclaimer"><AlertTriangle size={15} /><span>Este registro existe apenas na memória desta sessão. Não é salvo em banco nem enviado à CBSI.</span></div>
          <div className="modal-actions"><button type="button" className="button-quiet" onClick={onClose}>Cancelar</button><button type="submit" className="button-primary" disabled={!equipmentOptions.length}>Adicionar à demonstração <ChevronRight size={15} /></button></div>
        </form>
      </section>
    </div>
  );
}

export function CreateOrderButton({ onClick, compact = false }: { onClick: () => void; compact?: boolean }) {
  return (
    <button className={`button-primary create-order-button ${compact ? "is-compact" : ""}`} onClick={onClick}>
      <ClipboardList size={16} />{compact ? "Nova OS" : "Nova ordem de serviço"}
    </button>
  );
}
