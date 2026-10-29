import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import {
  Activity,
  AlertOctagon,
  AlertTriangle,
  ArrowRight,
  CalendarClock,
  Check,
  ChevronDown,
  ChevronRight,
  CircleAlert,
  Clock3,
  Cpu,
  Factory,
  Gauge,
  ShieldCheck,
  Wrench,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
  demoActivities,
  demoFailures,
  demoEquipment,
  demoPreventives,
  equipmentById,
  formatDate,
  formatRelativeDate,
  getDashboardAlerts,
  getDashboardMetrics,
  type DashboardAlert,
  type PeriodKey,
  type WorkOrderRecord,
} from "@/data/demo-data";
import { getArea, type AreaId } from "@/data/areas";
import type { AreaEquipmentRecord } from "@/data/equipment-lifecycle";
import { CreateOrderButton } from "@/components/electroplan/AppShell";

function ChartLoadFailure() {
  return (
    <section className="panel-surface charts-error" role="alert">
      <CircleAlert size={18} aria-hidden="true" />
      <div className="charts-error-copy"><strong>Os gráficos não foram carregados.</strong><p>Tente atualizar esta tela. Os demais dados demonstrativos continuam disponíveis.</p></div>
      <button className="button-quiet" type="button" onClick={() => window.location.reload()}>Atualizar tela</button>
    </section>
  );
}

function MotorLoadFailure() {
  return <div className="motor-webgl-fallback"><CircleAlert size={20} /><strong>Visualização 3D indisponível</strong><span>Os outros controles do painel continuam disponíveis.</span></div>;
}

const DashboardCharts = lazy(() => import("@/components/electroplan/DashboardCharts").catch((error: unknown) => {
  console.error("Falha ao carregar o módulo de gráficos do dashboard.", error);
  return { default: ChartLoadFailure };
}));

const Motor3D = lazy(() => import("@/components/electroplan/Motor3D").catch((error: unknown) => {
  console.error("Falha ao carregar o modelo 3D do motor.", error);
  return { default: MotorLoadFailure };
}));

interface DashboardProps {
  orders: WorkOrderRecord[];
  onNewOrder: () => void;
  autoRotate: boolean;
  onAutoRotateChange: (value: boolean) => void;
  activeAreaId: AreaId;
  equipmentOptions: AreaEquipmentRecord[];
}

export default function Dashboard({ orders, onNewOrder, autoRotate, onAutoRotateChange, activeAreaId, equipmentOptions }: DashboardProps) {
  const [period, setPeriod] = useState<PeriodKey>("90d");
  const [selectedEquipmentId, setSelectedEquipmentId] = useState(equipmentOptions[0]?.id ?? "");
  const [selectedAlert, setSelectedAlert] = useState<DashboardAlert | null>(null);
  const metrics = useMemo(() => getDashboardMetrics(orders, period), [orders, period]);
  const alerts = useMemo(() => getDashboardAlerts(orders), [orders]);
  const area = getArea(activeAreaId);
  const equipment = equipmentOptions.find((item) => item.id === selectedEquipmentId) ?? equipmentOptions[0];
  const equipmentFailures = equipment?.origin === "DEMO" ? demoFailures.filter((item) => item.equipmentId === equipment.id).length : null;
  const now = new Date();
  const longDate = new Intl.DateTimeFormat("pt-BR", { weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(now);

  useEffect(() => {
    if (!equipmentOptions.some((item) => item.id === selectedEquipmentId)) setSelectedEquipmentId(equipmentOptions[0]?.id ?? "");
  }, [equipmentOptions, selectedEquipmentId]);

  const stats = [
    { label: "Equipamentos demonstrativos", value: metrics.equipment, icon: Cpu, hint: "Conjunto de interface", accent: "cyan" },
    { label: "Preventivas programadas", value: metrics.planned, icon: CalendarClock, hint: "Planos não concluídos", accent: "blue" },
    { label: "Preventivas atrasadas", value: metrics.overdue, icon: Clock3, hint: "Exigem acompanhamento", accent: "amber" },
    { label: "Ordens de serviço abertas", value: metrics.openOrders, icon: Wrench, hint: "Fluxo demonstrativo", accent: "violet" },
    { label: "Equipamentos com falhas", value: metrics.equipmentWithFailures, icon: Activity, hint: "Com registro no histórico", accent: "red" },
    { label: "Intervenções concluídas", value: metrics.completed, icon: Check, hint: `No período de ${periodLabel(period).toLowerCase()}`, accent: "green" },
  ];

  return (
    <div className="dashboard-page">
      <div className="demo-strip"><span className="demo-strip-mark"><Factory size={13} /></span><strong>AMBIENTE DE DEMONSTRAÇÃO</strong><span>Indicadores fictícios · sem conexão operacional</span><span className="demo-strip-end">LOCAL <i /></span></div>

      <section className="page-heading">
        <div className="heading-main">
          <div className="heading-area-context"><span className="heading-area-label">ÁREA ATIVA</span><strong>{area?.name ?? "Área não selecionada"}</strong><Link href="/areas">Trocar área</Link></div>
          <div className="eyebrow-line"><span className="eyebrow-dot" />ROTINA DE MANUTENÇÃO</div>
          <h1>Painel de manutenção <span>industrial</span></h1>
          <p>Visão demonstrativa de ativos, ordens de serviço e manutenção preventiva.</p>
        </div>
        <div className="heading-actions">
          <CreateOrderButton onClick={onNewOrder} compact />
          <div className="heading-date"><span className="date-icon"><CalendarClock size={16} /></span><span><small>HOJE</small><strong>{longDate}</strong></span></div>
          <label className="period-select-wrap"><span className="sr-only">Período dos indicadores</span><select value={period} onChange={(event) => setPeriod(event.currentTarget.value as PeriodKey)} aria-label="Período dos indicadores"><option value="30d">Últimos 30 dias</option><option value="90d">Últimos 90 dias</option><option value="12m">Últimos 12 meses</option></select><ChevronDown size={14} aria-hidden="true" /></label>
        </div>
      </section>

      <aside className="area-metrics-note"><CircleAlert size={14} /><span>Os indicadores abaixo são gerais do conjunto demonstrativo e não são filtrados por área nem representam dados reais da CSN.</span></aside>

      <section className="metric-grid" aria-label="Indicadores gerais de demonstração">
        {stats.map((stat, index) => <MetricCard key={stat.label} {...stat} index={index} />)}
      </section>

      <section className="equipment-feature panel-surface" aria-labelledby="equipment-feature-title">
        <div className="equipment-visual-column">
          <div className="section-topline"><div><span className="panel-kicker"><span className="live-indicator" />VISUALIZAÇÃO TÉCNICA</span><h2 id="equipment-feature-title">Motor em foco</h2></div><span className="generic-model-tag"><span className="model-tag-dot" />MODELO 3D GENÉRICO</span></div>
          <label className="equipment-selector-label" htmlFor="equipment-select">ATIVO DA ÁREA · {area?.name.toLocaleUpperCase("pt-BR")}</label>
          {equipmentOptions.length ? <div className="equipment-selector-wrap"><select id="equipment-select" value={equipment?.id ?? ""} onChange={(event) => setSelectedEquipmentId(event.currentTarget.value)} aria-label="Selecionar equipamento da área ativa">{equipmentOptions.map((item) => <option key={item.id} value={item.id}>{item.code} — {item.name}{item.origin === "DEMO" ? " · DEMO" : ""}</option>)}</select><ChevronDown size={15} aria-hidden="true" /></div> : <div className="no-area-equipment"><span>Nenhum equipamento ativo nesta área.</span><Link href="/equipamentos">Cadastrar ou consultar <ChevronRight size={14} /></Link></div>}
          <Suspense fallback={<div className="motor-stage motor-stage-loading" role="status" aria-label="Carregando modelo 3D"><span className="motor-loading-mark" /><span>Preparando motor 3D…</span></div>}><Motor3D autoRotate={autoRotate} onAutoRotateChange={onAutoRotateChange} /></Suspense>
        </div>

        <div className="equipment-details-column">
          <div className="equipment-detail-head"><span className="detail-overline">{equipment?.origin === "DEMO" ? "ATIVO DEMONSTRATIVO" : equipment ? "CADASTRO LOCAL" : "SEM ATIVO SELECIONADO"}</span>{equipment && <span className={`state-chip state-${equipment.lifecycle === "Descartado" ? "critical" : equipment.lifecycle === "Substituído" ? "warning" : equipment.state === "Operacional" ? "ok" : equipment.state === "Em atenção" ? "warning" : "critical"}`}><i />{equipment.lifecycle === "Ativo" ? equipment.state : equipment.lifecycle}</span>}</div>
          <h3>{equipment?.name ?? "Motor elétrico industrial"}</h3>
          <div className="asset-identity"><span className="asset-code">{equipment?.code ?? "MODELO 3D"}</span><span className="identity-divider" />{equipment?.category ?? "Visualização genérica"}</div>

          {equipment ? <div className="equipment-data-grid"><InfoCell label="LOCALIZAÇÃO" value={equipment.location} icon={Cpu} /><InfoCell label="CRITICIDADE" value={equipment.criticality} icon={AlertOctagon} status={equipment.criticality.toLowerCase()} /><InfoCell label="ÚLTIMA MANUTENÇÃO" value={equipment.lastMaintenance ? formatDate(equipment.lastMaintenance, { day: "2-digit", month: "short", year: "numeric" }) : "Não informada"} icon={Check} /><InfoCell label="PRÓXIMA PREVISTA" value={equipment.nextMaintenance ? `${formatDate(equipment.nextMaintenance, { day: "2-digit", month: "short" })} · ${formatRelativeDate(equipment.nextMaintenance)}` : "Não informada"} icon={CalendarClock} emphasis /></div> : <p className="equipment-no-selection">Selecione ou cadastre um ativo nesta área para exibir seus dados.</p>}

          {equipment && <div className="equipment-health-row"><div className="health-icon"><Gauge size={17} /></div><div className="health-copy"><strong>{equipment.origin === "DEMO" ? "Registro demonstrativo" : "Registro local disponível"}</strong><span>Estado informado no cadastro; sem telemetria.</span></div><span className="health-value">{equipmentFailures ?? "—"} <small>{equipmentFailures === null ? "histórico\nnão fornecido" : "falhas\nno demo"}</small></span></div>}
          <div className="equipment-footer"><ShieldCheck size={14} /><span>Modelo genérico · não representa equipamento real</span><Link href="/equipamentos" aria-label="Abrir equipamentos da área"><ChevronRight size={15} /></Link></div>
        </div>
      </section>

      <Suspense fallback={<div className="charts-section charts-loading" role="status" aria-label="Carregando visualizações demonstrativas" aria-busy="true">{Array.from({ length: 4 }, (_, index) => <div className="panel-surface chart-loading-panel" key={index}><span className="chart-loading-icon" /><span className="chart-loading-copy" /><span className="chart-loading-canvas" /></div>)}</div>}><DashboardCharts orders={orders} period={period} /></Suspense>

      <section className="lower-grid">
        <div className="panel-surface alerts-panel" id="dashboard-alerts"><div className="section-topline panel-header"><div><span className="panel-kicker">PRIORIDADES</span><h2>Alertas e pendências</h2></div><span className="alert-count">{alerts.length.toString().padStart(2, "0")} <small>DEMO</small></span></div><p className="panel-intro">Condições derivadas exclusivamente dos registros fictícios.</p><div className="alert-list">{alerts.length ? alerts.map((alert) => <AlertRow key={alert.id} alert={alert} onSelect={() => setSelectedAlert(alert)} />) : <ChartEmpty message="Não há alertas nos registros demonstrativos." />}</div><div className="alerts-foot"><CircleAlert size={14} /><span>Estados visuais não substituem avaliação técnica ou autorização operacional.</span></div></div>
        <div className="panel-surface activity-panel"><div className="section-topline panel-header"><div><span className="panel-kicker">RASTREABILIDADE</span><h2>Atividade recente</h2></div><span className="activity-period">REGISTROS LOCAIS</span></div><p className="panel-intro">Atualizações fictícias para demonstrar a linha do tempo.</p><div className="activity-list">{[...demoActivities, ...orders.filter((item) => item.id.startsWith("OS-D-NEW")).map((item) => ({ id: `activity-${item.id}`, date: item.openedAt, kind: "Ordem criada nesta sessão", equipmentId: item.equipmentId, owner: item.owner, status: item.status }))].slice(0, 5).map((activity, index) => { const asset = equipmentById(activity.equipmentId); return <div className="activity-item" key={activity.id}><div className={`activity-timeline-dot dot-${index % 4}`}><span /></div><div className="activity-copy"><strong>{activity.kind}</strong><span>{asset?.name ?? "Equipamento demonstrativo"}</span><div className="activity-meta"><span>{activity.owner}</span><i />{formatRelativeDate(activity.date)}</div></div><span className={`activity-status activity-status-${activity.status.toLowerCase().replaceAll(" ", "-")}`}>{activity.status}</span></div>; })}</div><Link href="/ordens-de-servico" className="panel-footer-link">Acessar histórico demonstrativo <ArrowRight size={14} /></Link></div>
      </section>

      <div className="dashboard-bottom-note"><span><ShieldCheck size={14} />Demonstração · sem valores da operação real da CSN/CBSI.</span><span>Sem custos registrados <i /> Sem previsão operacional</span></div>
      {selectedAlert && <AlertDetailDialog alert={selectedAlert} onClose={() => setSelectedAlert(null)} />}
      <div className="sr-only" aria-live="polite">Painel atualizado para {periodLabel(period)}. Área ativa: {area?.name}.</div>
    </div>
  );
}

function MetricCard({ label, value, icon: Icon, hint, accent, index }: { label: string; value: number; icon: LucideIcon; hint: string; accent: string; index: number }) {
  return <article className={`metric-card metric-${accent}`} style={{ animationDelay: `${index * 45}ms` }}><div className="metric-card-top"><span className="metric-icon"><Icon size={17} strokeWidth={1.8} /></span><span className="metric-context">DADOS DEMO</span></div><div className="metric-label">{label}</div><div className="metric-value-row"><strong>{value.toString().padStart(2, "0")}</strong><span className="metric-unit">registros</span></div><div className="metric-hint"><span className="metric-hint-dot" />{hint}</div><div className="metric-reflection" aria-hidden="true" /></article>;
}

function InfoCell({ label, value, icon: Icon, status, emphasis }: { label: string; value: string; icon: LucideIcon; status?: string; emphasis?: boolean }) {
  return <div className={`equipment-info-cell ${emphasis ? "is-emphasis" : ""}`}><span className="info-cell-icon"><Icon size={14} /></span><div><span className="info-label">{label}</span><strong className={status ? `criticality-${status}` : ""}>{value}</strong></div></div>;
}

function AlertRow({ alert, onSelect }: { alert: DashboardAlert; onSelect: () => void }) {
  const Icon = alert.severity === "critical" ? AlertOctagon : alert.severity === "warning" ? AlertTriangle : Activity;
  return <button className={`alert-row alert-${alert.severity}`} onClick={onSelect} aria-label={`${alert.title}: ${alert.detail}. Ver registro demonstrativo`}><span className="alert-icon-wrap"><Icon size={16} /></span><span className="alert-content"><span className="alert-title-line"><strong>{alert.title}</strong><span className={`severity-pill severity-${alert.severity}`}>{alert.severity === "critical" ? "CRÍTICO" : alert.severity === "warning" ? "ATENÇÃO" : "RECORRÊNCIA"}</span></span><span className="alert-description">{alert.detail}</span><span className="alert-meta">{alert.category} <i /> Registro {alert.recordId}</span></span><ChevronRight className="alert-chevron" size={16} /></button>;
}

function AlertDetailDialog({ alert, onClose }: { alert: DashboardAlert; onClose: () => void }) {
  const recordEquipment = alert.equipmentId ? equipmentById(alert.equipmentId) : undefined;
  return <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><section className="modal-card alert-detail-modal" role="dialog" aria-modal="true" aria-labelledby="alert-detail-title"><div className={`modal-icon alert-modal-${alert.severity}`}><AlertTriangle size={19} /></div><span className="eyebrow">REGISTRO DE DEMONSTRAÇÃO · {alert.category.toUpperCase()}</span><h2 id="alert-detail-title">{alert.title}</h2><p>{alert.detail}</p><div className="record-detail-grid"><div><span>ID DEMONSTRATIVO</span><strong>{alert.recordId}</strong></div><div><span>EQUIPAMENTO</span><strong>{recordEquipment?.code ?? "Não vinculado"}</strong></div><div><span>LOCALIZAÇÃO</span><strong>{recordEquipment?.location ?? "—"}</strong></div><div><span>ESTADO DO REGISTRO</span><strong>Informativo · sem ação automática</strong></div></div><div className="modal-actions"><button className="button-quiet" onClick={onClose}>Fechar</button><Link className="button-primary" href={alert.module} onClick={onClose}>Abrir módulo <ChevronRight size={15} /></Link></div></section></div>;
}

function ChartEmpty({ message }: { message: string }) {
  return <div className="chart-empty"><span><Activity size={17} /></span><p>{message}</p><small>Visível para os filtros aplicados.</small></div>;
}

function periodLabel(period: PeriodKey) {
  return period === "30d" ? "Últimos 30 dias" : period === "90d" ? "Últimos 90 dias" : "Últimos 12 meses";
}
