export type Criticality = "Crítica" | "Alta" | "Média" | "Baixa";
export type OperationalState = "Operacional" | "Em atenção" | "Parado";
export type WorkOrderStatus =
  | "Aberta"
  | "Planejada"
  | "Em execução"
  | "Aguardando material"
  | "Concluída"
  | "Encerrada";
export type WorkOrderPriority = "Crítica" | "Alta" | "Média" | "Baixa";
export type PeriodKey = "30d" | "90d" | "12m";

export interface EquipmentRecord {
  id: string;
  code: string;
  name: string;
  category: string;
  location: string;
  sector: string;
  criticality: Criticality;
  state: OperationalState;
  lastMaintenance: string;
  nextMaintenance: string;
}

export interface PreventiveRecord {
  id: string;
  equipmentId: string;
  title: string;
  dueAt: string;
  status: "Programada" | "Concluída";
}

export interface WorkOrderRecord {
  id: string;
  equipmentId: string;
  title: string;
  kind: "Preventiva" | "Corretiva";
  priority: WorkOrderPriority;
  status: WorkOrderStatus;
  owner: string;
  openedAt: string;
  completedAt?: string;
}

export interface FailureRecord {
  id: string;
  equipmentId: string;
  category: string;
  happenedAt: string;
  symptom: string;
  causeConfirmed: boolean;
}

export interface SafetyRecord {
  id: string;
  title: string;
  location: string;
  dueAt: string;
  status: "Pendente" | "Em acompanhamento";
}

export interface ActivityRecord {
  id: string;
  date: string;
  kind: string;
  equipmentId: string;
  owner: string;
  status: string;
}

export interface NewWorkOrderInput {
  equipmentId: string;
  title: string;
  kind: "Preventiva" | "Corretiva";
  priority: WorkOrderPriority;
}

export function dateOffset(days: number): string {
  const date = new Date();
  date.setHours(12, 0, 0, 0);
  date.setDate(date.getDate() + days);
  return date.toISOString();
}

export const demoEquipment: EquipmentRecord[] = [
  {
    id: "EQ-01",
    code: "DEMO-M-014",
    name: "Motor do exaustor principal",
    category: "Motor elétrico",
    location: "Utilidades · Galpão A",
    sector: "Utilidades",
    criticality: "Alta",
    state: "Operacional",
    lastMaintenance: dateOffset(-32),
    nextMaintenance: dateOffset(12),
  },
  {
    id: "EQ-02",
    code: "DEMO-M-021",
    name: "Conjunto de bombeamento",
    category: "Motor elétrico",
    location: "Casa de bombas · Setor 2",
    sector: "Processo",
    criticality: "Crítica",
    state: "Em atenção",
    lastMaintenance: dateOffset(-49),
    nextMaintenance: dateOffset(3),
  },
  {
    id: "EQ-03",
    code: "DEMO-Q-008",
    name: "Quadro de distribuição auxiliar",
    category: "Painel elétrico",
    location: "Sala elétrica · Bloco B",
    sector: "Elétrica",
    criticality: "Alta",
    state: "Operacional",
    lastMaintenance: dateOffset(-76),
    nextMaintenance: dateOffset(27),
  },
  {
    id: "EQ-04",
    code: "DEMO-M-032",
    name: "Ventilador de resfriamento",
    category: "Motor elétrico",
    location: "Utilidades · Galpão C",
    sector: "Utilidades",
    criticality: "Média",
    state: "Em atenção",
    lastMaintenance: dateOffset(-94),
    nextMaintenance: dateOffset(-6),
  },
  {
    id: "EQ-05",
    code: "DEMO-T-003",
    name: "Transformador de serviço",
    category: "Transformador",
    location: "Subestação · Ala Norte",
    sector: "Elétrica",
    criticality: "Crítica",
    state: "Operacional",
    lastMaintenance: dateOffset(-121),
    nextMaintenance: dateOffset(44),
  },
  {
    id: "EQ-06",
    code: "DEMO-M-045",
    name: "Acionamento de esteira",
    category: "Motor elétrico",
    location: "Linha de processo · Setor 1",
    sector: "Processo",
    criticality: "Média",
    state: "Operacional",
    lastMaintenance: dateOffset(-18),
    nextMaintenance: dateOffset(31),
  },
  {
    id: "EQ-07",
    code: "DEMO-Q-012",
    name: "Centro de controle demonstrativo",
    category: "Painel elétrico",
    location: "Sala elétrica · Bloco A",
    sector: "Elétrica",
    criticality: "Baixa",
    state: "Operacional",
    lastMaintenance: dateOffset(-156),
    nextMaintenance: dateOffset(56),
  },
  {
    id: "EQ-08",
    code: "DEMO-M-052",
    name: "Motor de ventilação secundária",
    category: "Motor elétrico",
    location: "Utilidades · Galpão B",
    sector: "Utilidades",
    criticality: "Baixa",
    state: "Parado",
    lastMaintenance: dateOffset(-8),
    nextMaintenance: dateOffset(8),
  },
];

export const demoPreventives: PreventiveRecord[] = [
  { id: "PV-D-001", equipmentId: "EQ-01", title: "Inspeção periódica do conjunto", dueAt: dateOffset(-158), status: "Concluída" },
  { id: "PV-D-002", equipmentId: "EQ-02", title: "Verificação preventiva programada", dueAt: dateOffset(-129), status: "Concluída" },
  { id: "PV-D-003", equipmentId: "EQ-03", title: "Inspeção visual registrada", dueAt: dateOffset(-101), status: "Concluída" },
  { id: "PV-D-004", equipmentId: "EQ-04", title: "Revisão preventiva do equipamento", dueAt: dateOffset(-81), status: "Concluída" },
  { id: "PV-D-005", equipmentId: "EQ-05", title: "Inspeção de rotina", dueAt: dateOffset(-63), status: "Concluída" },
  { id: "PV-D-006", equipmentId: "EQ-06", title: "Verificação de condição registrada", dueAt: dateOffset(-42), status: "Concluída" },
  { id: "PV-D-007", equipmentId: "EQ-01", title: "Inspeção de rotina", dueAt: dateOffset(-24), status: "Concluída" },
  { id: "PV-D-008", equipmentId: "EQ-02", title: "Inspeção do conjunto de bombeamento", dueAt: dateOffset(-9), status: "Programada" },
  { id: "PV-D-009", equipmentId: "EQ-04", title: "Verificação preventiva do ventilador", dueAt: dateOffset(-3), status: "Programada" },
  { id: "PV-D-010", equipmentId: "EQ-03", title: "Conferência preventiva", dueAt: dateOffset(4), status: "Programada" },
  { id: "PV-D-011", equipmentId: "EQ-08", title: "Inspeção programada", dueAt: dateOffset(8), status: "Programada" },
  { id: "PV-D-012", equipmentId: "EQ-01", title: "Inspeção periódica do conjunto", dueAt: dateOffset(12), status: "Programada" },
  { id: "PV-D-013", equipmentId: "EQ-05", title: "Inspeção de rotina", dueAt: dateOffset(32), status: "Programada" },
  { id: "PV-D-014", equipmentId: "EQ-06", title: "Verificação de condição registrada", dueAt: dateOffset(58), status: "Programada" },
];

export const demoWorkOrders: WorkOrderRecord[] = [
  { id: "OS-D-1042", equipmentId: "EQ-01", title: "Inspeção de rotina do conjunto", kind: "Preventiva", priority: "Média", status: "Planejada", owner: "Equipe demonstração", openedAt: dateOffset(-3) },
  { id: "OS-D-1041", equipmentId: "EQ-02", title: "Verificação de condição registrada", kind: "Corretiva", priority: "Alta", status: "Em execução", owner: "Técnico demonstração", openedAt: dateOffset(-2) },
  { id: "OS-D-1040", equipmentId: "EQ-04", title: "Avaliação preventiva demonstrativa", kind: "Preventiva", priority: "Crítica", status: "Aberta", owner: "Equipe demonstração", openedAt: dateOffset(-1) },
  { id: "OS-D-1039", equipmentId: "EQ-08", title: "Análise de registro demonstrativo", kind: "Corretiva", priority: "Alta", status: "Aguardando material", owner: "Técnico demonstração", openedAt: dateOffset(-5) },
  { id: "OS-D-1038", equipmentId: "EQ-03", title: "Inspeção de painel (demonstração)", kind: "Preventiva", priority: "Baixa", status: "Concluída", owner: "Equipe demonstração", openedAt: dateOffset(-10), completedAt: dateOffset(-7) },
  { id: "OS-D-1037", equipmentId: "EQ-05", title: "Verificação periódica (demonstração)", kind: "Preventiva", priority: "Média", status: "Encerrada", owner: "Técnico demonstração", openedAt: dateOffset(-28), completedAt: dateOffset(-21) },
  { id: "OS-D-1036", equipmentId: "EQ-06", title: "Inspeção de acompanhamento", kind: "Preventiva", priority: "Baixa", status: "Concluída", owner: "Equipe demonstração", openedAt: dateOffset(-44), completedAt: dateOffset(-39) },
];

export const demoFailures: FailureRecord[] = [
  { id: "FL-D-021", equipmentId: "EQ-02", category: "Temperatura elevada", happenedAt: dateOffset(-2), symptom: "Registro demonstrativo de temperatura fora da faixa configurada.", causeConfirmed: false },
  { id: "FL-D-020", equipmentId: "EQ-02", category: "Vibração", happenedAt: dateOffset(-18), symptom: "Observação demonstrativa em inspeção.", causeConfirmed: false },
  { id: "FL-D-019", equipmentId: "EQ-04", category: "Ruído", happenedAt: dateOffset(-21), symptom: "Relato demonstrativo durante operação.", causeConfirmed: false },
  { id: "FL-D-018", equipmentId: "EQ-08", category: "Parada registrada", happenedAt: dateOffset(-8), symptom: "Ocorrência demonstrativa lançada para exibição.", causeConfirmed: false },
  { id: "FL-D-017", equipmentId: "EQ-01", category: "Temperatura elevada", happenedAt: dateOffset(-47), symptom: "Histórico demonstrativo de inspeção.", causeConfirmed: false },
  { id: "FL-D-016", equipmentId: "EQ-03", category: "Indicação elétrica", happenedAt: dateOffset(-72), symptom: "Registro demonstrativo sem diagnóstico confirmado.", causeConfirmed: false },
];

export const demoSafetyRecords: SafetyRecord[] = [
  { id: "SEG-D-008", title: "Verificação de organização da área", location: "Galpão B · exemplo", dueAt: dateOffset(2), status: "Pendente" },
  { id: "SEG-D-007", title: "Acompanhamento de verificação registrada", location: "Casa de bombas · exemplo", dueAt: dateOffset(-1), status: "Em acompanhamento" },
];

export const demoActivities: ActivityRecord[] = [
  { id: "AT-D-01", date: dateOffset(-1), kind: "Ordem prioritária registrada", equipmentId: "EQ-04", owner: "Equipe demonstração", status: "Aberta" },
  { id: "AT-D-02", date: dateOffset(-2), kind: "Falha demonstrativa registrada", equipmentId: "EQ-02", owner: "Técnico demonstração", status: "Em análise" },
  { id: "AT-D-03", date: dateOffset(-3), kind: "Preventiva incluída no calendário", equipmentId: "EQ-01", owner: "Planejamento demonstração", status: "Planejada" },
  { id: "AT-D-04", date: dateOffset(-7), kind: "Intervenção demonstrativa concluída", equipmentId: "EQ-03", owner: "Equipe demonstração", status: "Concluída" },
  { id: "AT-D-05", date: dateOffset(-10), kind: "Inspeção demonstrativa registrada", equipmentId: "EQ-05", owner: "Técnico demonstração", status: "Concluída" },
];

export const equipmentById = (id: string) => demoEquipment.find((equipment) => equipment.id === id);
export const isOpenOrder = (order: WorkOrderRecord) => !["Concluída", "Encerrada"].includes(order.status);
export const periodDays: Record<PeriodKey, number> = { "30d": 30, "90d": 90, "12m": 365 };

export function dateInPeriod(date: string | undefined, period: PeriodKey): boolean {
  if (!date) return false;
  const since = Date.now() - periodDays[period] * 24 * 60 * 60 * 1000;
  return new Date(date).getTime() >= since;
}

export function getDashboardMetrics(orders: WorkOrderRecord[], period: PeriodKey) {
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  const latePreventives = demoPreventives.filter(
    (item) => item.status !== "Concluída" && new Date(item.dueAt) < today,
  );
  const completed = orders.filter((item) => !isOpenOrder(item) && dateInPeriod(item.completedAt, period));
  const assetsWithFailures = new Set(demoFailures.map((item) => item.equipmentId));

  return {
    equipment: demoEquipment.length,
    planned: demoPreventives.filter((item) => item.status !== "Concluída").length,
    overdue: latePreventives.length,
    openOrders: orders.filter(isOpenOrder).length,
    equipmentWithFailures: assetsWithFailures.size,
    completed: completed.length,
  };
}

export function getMaintenanceTrend(period: PeriodKey) {
  const now = new Date();
  const days = periodDays[period];
  const buckets = days <= 30 ? 5 : days <= 90 ? 3 : 6;
  const result = Array.from({ length: buckets }, (_, index) => {
    if (days <= 30) {
      const start = new Date(now);
      start.setHours(0, 0, 0, 0);
      start.setDate(start.getDate() - (buckets - 1 - index) * 7);
      const end = new Date(start);
      end.setDate(end.getDate() + 7);
      return { label: `Sem. ${index + 1}`, start, end, concluídas: 0, pendentes: 0 };
    }

    const start = new Date(now.getFullYear(), now.getMonth() - (buckets - 1 - index), 1);
    const end = new Date(start.getFullYear(), start.getMonth() + 1, 1);
    const label = new Intl.DateTimeFormat("pt-BR", { month: "short" }).format(start).replace(".", "");
    return { label, start, end, concluídas: 0, pendentes: 0 };
  });

  const since = new Date(now);
  since.setDate(since.getDate() - days);
  demoPreventives.forEach((item) => {
    const due = new Date(item.dueAt);
    if (due < since || due > now) return;
    const bucket = result.find((candidate) => due >= candidate.start && due < candidate.end);
    if (!bucket) return;
    if (item.status === "Concluída") bucket.concluídas += 1;
    else bucket.pendentes += 1;
  });

  return result.map(({ label, concluídas, pendentes }) => ({ label, concluídas, pendentes }));
}

export function getOrdersByStatus(orders: WorkOrderRecord[], period: PeriodKey) {
  const statusOrder: WorkOrderStatus[] = ["Aberta", "Planejada", "Em execução", "Aguardando material", "Concluída", "Encerrada"];
  return statusOrder
    .map((status) => ({
      status,
      total: orders.filter((item) => item.status === status && dateInPeriod(item.openedAt, period)).length,
    }))
    .filter((item) => item.total > 0);
}

export function getFailuresByCategory(period: PeriodKey) {
  const grouped = new Map<string, number>();
  demoFailures.filter((item) => dateInPeriod(item.happenedAt, period)).forEach((item) => {
    grouped.set(item.category, (grouped.get(item.category) ?? 0) + 1);
  });
  return [...grouped.entries()].map(([category, total]) => ({ category, total }));
}

export function getCriticalityDistribution() {
  const order: Criticality[] = ["Crítica", "Alta", "Média", "Baixa"];
  return order.map((criticality) => ({
    criticality,
    total: demoEquipment.filter((item) => item.criticality === criticality).length,
  }));
}

export interface DashboardAlert {
  id: string;
  title: string;
  detail: string;
  severity: "critical" | "warning" | "info";
  module: string;
  recordId: string;
  equipmentId?: string;
  category: string;
}

export function getDashboardAlerts(orders: WorkOrderRecord[]): DashboardAlert[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const late = demoPreventives
    .filter((item) => item.status !== "Concluída" && new Date(item.dueAt) < today)
    .slice(0, 2)
    .map((item): DashboardAlert => {
      const equipment = equipmentById(item.equipmentId);
      return {
        id: item.id,
        title: "Preventiva em atraso",
        detail: `${item.title} · ${equipment?.name ?? "Equipamento demonstrativo"}`,
        severity: "critical",
        module: "/preventiva",
        recordId: item.id,
        equipmentId: item.equipmentId,
        category: "Manutenção preventiva",
      };
    });

  const upcoming = demoPreventives
    .filter((item) => {
      const daysLeft = (new Date(item.dueAt).getTime() - today.getTime()) / (24 * 60 * 60 * 1000);
      return item.status !== "Concluída" && daysLeft >= 0 && daysLeft <= 14;
    })
    .slice(0, 1)
    .map((item): DashboardAlert => {
      const equipment = equipmentById(item.equipmentId);
      return {
        id: `${item.id}-due`,
        title: "Preventiva próxima do vencimento",
        detail: `${equipment?.name ?? "Equipamento demonstrativo"} · vence ${formatDate(item.dueAt)}`,
        severity: "warning",
        module: "/preventiva",
        recordId: item.id,
        equipmentId: item.equipmentId,
        category: "Manutenção preventiva",
      };
    });

  const priorityOrders = orders
    .filter((item) => isOpenOrder(item) && ["Crítica", "Alta"].includes(item.priority))
    .slice(0, 1)
    .map((item): DashboardAlert => ({
      id: item.id,
      title: "Ordem de serviço prioritária",
      detail: `${item.id} · ${equipmentById(item.equipmentId)?.name ?? "Equipamento demonstrativo"}`,
      severity: item.priority === "Crítica" ? "critical" : "warning",
      module: "/ordens-de-servico",
      recordId: item.id,
      equipmentId: item.equipmentId,
      category: "Ordem de serviço",
    }));

  const repeatedEquipment = new Map<string, number>();
  demoFailures.forEach((item) => repeatedEquipment.set(item.equipmentId, (repeatedEquipment.get(item.equipmentId) ?? 0) + 1));
  const recurrent = [...repeatedEquipment.entries()]
    .find(([, count]) => count > 1);
  const recurrenceAlerts: DashboardAlert[] = recurrent
    ? [{
        id: `recurrence-${recurrent[0]}`,
        title: "Falhas registradas mais de uma vez",
        detail: `${equipmentById(recurrent[0])?.name ?? "Equipamento demonstrativo"} · ${recurrent[1]} registros; causa não confirmada`,
        severity: "info",
        module: "/falhas",
        recordId: recurrent[0],
        equipmentId: recurrent[0],
        category: "Histórico de falhas",
      }]
    : [];

  const safetyAlerts = demoSafetyRecords.slice(0, 1).map((item): DashboardAlert => ({
    id: item.id,
    title: "Pendência de segurança registrada",
    detail: `${item.title} · ${item.location}`,
    severity: "warning",
    module: "/seguranca",
    recordId: item.id,
    category: "Segurança",
  }));

  return [...late, ...upcoming, ...priorityOrders, ...recurrenceAlerts, ...safetyAlerts].slice(0, 6);
}

export function formatDate(date: string | undefined, options?: Intl.DateTimeFormatOptions): string {
  if (!date) return "—";
  return new Intl.DateTimeFormat("pt-BR", options ?? { day: "2-digit", month: "short" }).format(new Date(date));
}

export function formatRelativeDate(date: string): string {
  const target = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);
  const diff = Math.round((target.getTime() - today.getTime()) / (24 * 60 * 60 * 1000));
  if (diff === 0) return "hoje";
  if (diff === 1) return "amanhã";
  if (diff === -1) return "ontem";
  if (diff < 0) return `há ${Math.abs(diff)} dias`;
  return `em ${diff} dias`;
}
