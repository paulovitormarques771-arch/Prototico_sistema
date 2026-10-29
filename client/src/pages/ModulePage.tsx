import { Link } from "wouter";
import {
  ArrowLeft,
  ArrowRight,
  Box,
  CalendarCheck2,
  ChartNoAxesCombined,
  ClipboardList,
  Factory,
  FileClock,
  Package,
  ShieldCheck,
  Settings2,
  Wrench,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface ModuleConfig {
  title: string;
  phase: string;
  category: string;
  description: string;
  status: string;
  icon: LucideIcon;
  scope: string[];
  related?: string;
}

const moduleContent: Record<string, ModuleConfig> = {
  equipamentos: {
    title: "Equipamentos",
    phase: "ETAPA 2",
    category: "CADASTRO E RASTREABILIDADE",
    description: "Cadastro técnico, consulta e histórico dos ativos industriais em um único contexto.",
    status: "Previsto para a próxima etapa",
    icon: Box,
    scope: ["Cadastro e dados técnicos", "Busca e filtros por criticidade", "Planos, ordens, falhas e documentos por ativo"],
  },
  preventiva: {
    title: "Manutenção preventiva",
    phase: "ETAPA 2",
    category: "PLANEJAMENTO DE MANUTENÇÃO",
    description: "Planos vinculados aos equipamentos, prazos calculados e visão em calendário.",
    status: "Previsto para a próxima etapa",
    icon: CalendarCheck2,
    scope: ["Periodicidade e datas registradas", "Lista e calendário de tarefas", "Estados de vencimento e execução"],
  },
  "ordens-de-servico": {
    title: "Ordens de serviço",
    phase: "ETAPA 2",
    category: "EXECUÇÃO E HISTÓRICO",
    description: "Acompanhamento do ciclo de manutenção, da abertura ao encerramento validado.",
    status: "Previsto para a próxima etapa",
    icon: ClipboardList,
    scope: ["Visualização em tabela e Kanban", "Fluxo de status configurável", "Filtros, paginação e histórico de alterações"],
  },
  falhas: {
    title: "Histórico de falhas",
    phase: "ETAPA 3",
    category: "CONFIABILIDADE",
    description: "Registros cronológicos e recorrências sem atribuir causas não confirmadas.",
    status: "Planejado para etapa posterior",
    icon: FileClock,
    scope: ["Sintomas e condições observadas", "Causa identificada somente quando confirmada", "Recorrência e indisponibilidade registrada"],
  },
  materiais: {
    title: "Materiais e componentes",
    phase: "ETAPA 3",
    category: "ESTOQUE E AVALIAÇÃO TÉCNICA",
    description: "Movimentações, materiais vinculados e fluxo de avaliação de componentes retirados.",
    status: "Planejado para etapa posterior",
    icon: Package,
    scope: ["Posição de estoque e estoque mínimo", "Avaliação antes de liberar reutilização", "Custos e valores diferenciados por natureza"],
  },
  seguranca: {
    title: "Segurança",
    phase: "ETAPA 3",
    category: "REGISTRO DE PREVENÇÃO",
    description: "Documentação de riscos e ações pendentes como apoio — nunca como autorização de trabalho.",
    status: "Planejado para etapa posterior",
    icon: ShieldCheck,
    scope: ["Verificações, riscos e evidências", "Responsáveis, prazos e situação", "Não substitui APR, PT, bloqueio, treinamento ou aprovação"],
  },
  paradas: {
    title: "Paradas industriais",
    phase: "ETAPA 3",
    category: "PREPARAÇÃO DE PARADAS",
    description: "Coordenação de tarefas, equipes, dependências, materiais e pendências de segurança.",
    status: "Planejado para etapa posterior",
    icon: Factory,
    scope: ["Cronograma ou calendário de atividades", "Ordens, equipes e materiais previstos", "Dependências e resumo de pendências"],
  },
  relatorios: {
    title: "Relatórios e indicadores",
    phase: "ETAPA 3",
    category: "ANÁLISE OPERACIONAL",
    description: "Indicadores derivados dos dados registrados, com fórmulas documentadas e filtros.",
    status: "Planejado para etapa posterior",
    icon: ChartNoAxesCombined,
    scope: ["Filtros por período, setor, equipamento e responsável", "Indicadores somente quando houver base suficiente", "Exportação CSV e PDF quando suportada"],
  },
  administracao: {
    title: "Administração",
    phase: "ETAPA 4",
    category: "ACESSO E GOVERNANÇA",
    description: "Camada futura de autenticação real, permissões, persistência e políticas de segurança.",
    status: "Backend não configurado nesta etapa",
    icon: Settings2,
    scope: ["Perfis e permissões validados também no backend", "Banco e armazenamento de arquivos", "Sem contas, senhas fixas ou segredos expostos"],
  },
};

export default function ModulePage({ moduleKey }: { moduleKey: string }) {
  const config = moduleContent[moduleKey];
  if (!config) {
    return <section className="panel-surface module-fallback"><span className="eyebrow">MÓDULO NÃO ENCONTRADO</span><h1>Esta rota não está configurada</h1><Link className="button-primary" href="/">Voltar ao painel <ArrowRight size={15} /></Link></section>;
  }

  const Icon = config.icon;
  return (
    <div className="module-page">
      <div className="demo-strip"><span className="demo-strip-mark"><Icon size={12} /></span><strong>ESTRUTURA DO PRODUTO</strong><span>Esta área ainda não é um fluxo operacional ativo.</span><span className="demo-strip-end">{config.phase} <i /></span></div>
      <Link href="/" className="back-to-dashboard"><ArrowLeft size={14} />Voltar à visão geral</Link>
      <section className="module-hero panel-surface">
        <div className="module-hero-glow" aria-hidden="true" />
        <div className="module-hero-top"><span className="module-icon-large"><Icon size={24} strokeWidth={1.6} /></span><span className="phase-pill">{config.phase}</span></div>
        <span className="eyebrow">{config.category}</span>
        <h1>{config.title}</h1>
        <p className="module-description">{config.description}</p>
        <div className="module-status"><span className="status-hollow-dot" /><strong>{config.status}</strong><small>As funções descritas ainda não estão ativadas.</small></div>
      </section>
      <section className="module-scope-card panel-surface">
        <div className="section-topline"><div><span className="panel-kicker">ESCOPO REGISTRADO</span><h2>O que este módulo contemplará</h2></div><span className="scope-icon"><Wrench size={16} /></span></div>
        <div className="scope-rows">{config.scope.map((item, index) => <div className="scope-row" key={item}><span className="scope-index">0{index + 1}</span><span>{item}</span><span className="scope-state">PLANEJADO</span></div>)}</div>
        <div className="scope-footer"><span>Os registros demonstrativos permanecem identificados e isolados nesta etapa.</span><Link href="/" className="text-link">Ver painel <ArrowRight size={14} /></Link></div>
      </section>
      <div className="module-footnote"><ShieldCheck size={15} /><span>Nenhum dado operacional foi inventado ou conectado. Este módulo é uma indicação transparente do escopo futuro.</span></div>
    </div>
  );
}
