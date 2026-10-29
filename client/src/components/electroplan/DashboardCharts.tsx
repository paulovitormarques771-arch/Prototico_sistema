import { useMemo, type ReactNode } from "react";
import {
  Activity,
  CalendarClock,
  ClipboardList,
  Gauge,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  demoEquipment,
  getCriticalityDistribution,
  getFailuresByCategory,
  getMaintenanceTrend,
  getOrdersByStatus,
  type PeriodKey,
  type WorkOrderRecord,
} from "@/data/demo-data";

const tooltipStyle = {
  background: "#0d1721",
  border: "1px solid rgba(121, 165, 190, .18)",
  borderRadius: 10,
  color: "#e9f2f7",
  fontSize: 12,
  padding: "9px 12px",
  boxShadow: "0 16px 32px rgba(0, 0, 0, .32)",
};

const criticalityColors: Record<string, string> = {
  Crítica: "#e87c73",
  Alta: "#e6b768",
  Média: "#c47a3a",
  Baixa: "#78889a",
};

const statusColors: Record<string, string> = {
  Aberta: "#d9776d",
  Planejada: "#d9b56f",
  "Em execução": "#c47a3a",
  "Aguardando material": "#8794a4",
  Concluída: "#74b89b",
  Encerrada: "#71869b",
};

export default function DashboardCharts({ orders, period }: { orders: WorkOrderRecord[]; period: PeriodKey }) {
  const trend = useMemo(() => getMaintenanceTrend(period), [period]);
  const ordersByStatus = useMemo(() => getOrdersByStatus(orders, period), [orders, period]);
  const failuresByCategory = useMemo(() => getFailuresByCategory(period), [period]);
  const criticality = useMemo(() => getCriticalityDistribution(), []);
  const orderCount = ordersByStatus.reduce((total, item) => total + item.total, 0);
  const failureCount = failuresByCategory.reduce((total, item) => total + item.total, 0);

  return (
    <section className="charts-section" aria-label="Gráficos do painel">
      <ChartPanel title="Preventivas por período" subtitle="Concluídas e pendentes · registros demonstrativos" icon={CalendarClock} action={<span className="chart-period-note">{periodLabel(period)}</span>} className="chart-maintenance">
        {trend.some((item) => item.concluídas || item.pendentes) ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trend} margin={{ top: 10, right: 8, left: -22, bottom: 0 }}>
              <defs>
                <linearGradient id="completedFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#c47a3a" stopOpacity={0.25} /><stop offset="95%" stopColor="#c47a3a" stopOpacity={0.01} /></linearGradient>
                <linearGradient id="pendingFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#dfb467" stopOpacity={0.19} /><stop offset="95%" stopColor="#dfb467" stopOpacity={0.01} /></linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(153, 186, 204, .08)" vertical={false} />
              <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: "#718696", fontSize: 10 }} dy={8} />
              <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fill: "#718696", fontSize: 10 }} />
              <Tooltip contentStyle={tooltipStyle} cursor={{ stroke: "rgba(105, 183, 204, .25)", strokeDasharray: "3 4" }} />
              <Area type="monotone" dataKey="concluídas" name="Concluídas" stroke="#d99a5c" strokeWidth={2.1} fill="url(#completedFill)" activeDot={{ r: 4, fill: "#e4b17d", stroke: "#0a1923", strokeWidth: 2 }} />
              <Area type="monotone" dataKey="pendentes" name="Pendentes" stroke="#d6ad64" strokeWidth={1.8} fill="url(#pendingFill)" activeDot={{ r: 4, fill: "#eccb8b", stroke: "#0a1923", strokeWidth: 2 }} />
              <Legend iconType="circle" iconSize={7} wrapperStyle={{ color: "#91a5b1", fontSize: 10, paddingTop: 8 }} />
            </AreaChart>
          </ResponsiveContainer>
        ) : <ChartEmpty message="Sem preventivas neste período demonstrativo." />}
      </ChartPanel>

      <ChartPanel title="Ordens por status" subtitle="Abertas, em andamento e encerradas" icon={ClipboardList} action={<span className="chart-record-count">{orderCount} registros</span>} className="chart-orders">
        {ordersByStatus.length ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={ordersByStatus} layout="vertical" margin={{ top: 2, right: 12, left: 2, bottom: 0 }} barCategoryGap={10}>
              <CartesianGrid stroke="rgba(153, 186, 204, .08)" horizontal={false} />
              <XAxis type="number" allowDecimals={false} axisLine={false} tickLine={false} tick={{ fill: "#718696", fontSize: 10 }} />
              <YAxis type="category" dataKey="status" width={112} axisLine={false} tickLine={false} tick={{ fill: "#9aadb9", fontSize: 10 }} />
              <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "rgba(255, 255, 255, .025)" }} />
              <Bar dataKey="total" name="Ordens" radius={[0, 5, 5, 0]} maxBarSize={16}>
                {ordersByStatus.map((entry) => <Cell key={entry.status} fill={statusColors[entry.status] ?? "#c47a3a"} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : <ChartEmpty message="Nenhuma OS aberta neste período demonstrativo." />}
      </ChartPanel>

      <ChartPanel title="Falhas por categoria" subtitle="Registros de falha no período selecionado" icon={Activity} action={<span className="chart-record-count">{failureCount} registros</span>} className="chart-failures">
        {failuresByCategory.length ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={failuresByCategory} margin={{ top: 8, right: 5, left: -24, bottom: 0 }} barCategoryGap={13}>
              <CartesianGrid stroke="rgba(153, 186, 204, .08)" vertical={false} />
              <XAxis dataKey="category" axisLine={false} tickLine={false} tick={{ fill: "#8ca1af", fontSize: 9 }} interval={0} />
              <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fill: "#718696", fontSize: 10 }} />
              <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "rgba(255, 255, 255, .025)" }} />
              <Bar dataKey="total" name="Registros" fill="#c1766f" radius={[4, 4, 0, 0]} maxBarSize={30} />
            </BarChart>
          </ResponsiveContainer>
        ) : <ChartEmpty message="Sem registros de falha neste período demonstrativo." />}
      </ChartPanel>

      <ChartPanel title="Equipamentos por criticidade" subtitle="Distribuição dos ativos de demonstração" icon={Gauge} action={<span className="chart-record-count">{demoEquipment.length} ativos</span>} className="chart-criticality">
        <div className="criticality-chart-layout">
          <div className="criticality-donut-wrap">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={criticality} dataKey="total" nameKey="criticality" innerRadius={53} outerRadius={68} paddingAngle={4} stroke="none" startAngle={90} endAngle={-270}>
                  {criticality.map((entry) => <Cell key={entry.criticality} fill={criticalityColors[entry.criticality]} />)}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} formatter={(value, name) => [value, name]} />
              </PieChart>
            </ResponsiveContainer>
            <div className="donut-center"><strong>{demoEquipment.length}</strong><small>ativos</small></div>
          </div>
          <div className="criticality-legend">
            {criticality.map((item) => <div className="criticality-legend-row" key={item.criticality}><i style={{ background: criticalityColors[item.criticality] }} /><span>{item.criticality}</span><strong>{item.total}</strong><small>{Math.round((item.total / demoEquipment.length) * 100)}%</small></div>)}
          </div>
        </div>
      </ChartPanel>
    </section>
  );
}

function ChartPanel({ title, subtitle, icon: Icon, action, className = "", children }: { title: string; subtitle: string; icon: LucideIcon; action?: ReactNode; className?: string; children: ReactNode }) {
  return <article className={`panel-surface chart-panel ${className}`}><div className="chart-panel-heading"><span className="chart-icon"><Icon size={16} /></span><div className="chart-heading-copy"><h3>{title}</h3><p>{subtitle}</p></div>{action && <div className="chart-action">{action}</div>}</div><div className="chart-canvas">{children}</div></article>;
}

function ChartEmpty({ message }: { message: string }) {
  return <div className="chart-empty"><span><Activity size={17} /></span><p>{message}</p><small>Visível para os filtros aplicados.</small></div>;
}

function periodLabel(period: PeriodKey) {
  return period === "30d" ? "Últimos 30 dias" : period === "90d" ? "Últimos 90 dias" : "Últimos 12 meses";
}
