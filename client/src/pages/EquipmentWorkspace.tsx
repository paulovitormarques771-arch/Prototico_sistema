import { useMemo, useState, type FormEvent } from "react";
import { Link } from "wouter";
import { AlertTriangle, ArrowLeftRight, ArrowRight, Boxes, Check, ChevronRight, CircleAlert, FileClock, History, Plus, Search, ShieldCheck, Trash2, Wrench, X } from "lucide-react";
import { toast } from "sonner";
import { getArea, type AreaId } from "@/data/areas";
import { formatDate } from "@/data/demo-data";
import type { AreaEquipmentRecord, EquipmentEvent, EquipmentFields } from "@/data/equipment-lifecycle";

type FilterKey = "Ativos" | "Substituídos" | "Descartados" | "Todos";
type DialogMode = "register" | "replace" | "dispose";

interface EquipmentWorkspaceProps {
  areaId: AreaId;
  records: AreaEquipmentRecord[];
  events: EquipmentEvent[];
  onRegister: (fields: EquipmentFields) => AreaEquipmentRecord | null;
  onReplace: (equipmentId: string, fields: EquipmentFields, date: string, reason: string, reference: string) => AreaEquipmentRecord | null;
  onDispose: (equipmentId: string, date: string, reason: string, destination: string, reference: string) => boolean;
}

export default function EquipmentWorkspace({ areaId, records, events, onRegister, onReplace, onDispose }: EquipmentWorkspaceProps) {
  const area = getArea(areaId);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<FilterKey>("Ativos");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dialog, setDialog] = useState<DialogMode | null>(null);

  const areaRecords = useMemo(() => records.filter((record) => record.areaId === areaId), [records, areaId]);
  const filteredRecords = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("pt-BR");
    return areaRecords.filter((record) => {
      const matchesFilter = filter === "Todos"
        || (filter === "Ativos" && record.lifecycle === "Ativo")
        || (filter === "Substituídos" && record.lifecycle === "Substituído")
        || (filter === "Descartados" && record.lifecycle === "Descartado");
      const matchesQuery = !normalizedQuery || `${record.code} ${record.name} ${record.category} ${record.location}`.toLocaleLowerCase("pt-BR").includes(normalizedQuery);
      return matchesFilter && matchesQuery;
    });
  }, [areaRecords, filter, query]);

  const selected = areaRecords.find((record) => record.id === selectedId)
    ?? filteredRecords[0]
    ?? areaRecords[0]
    ?? null;
  const selectedEvents = useMemo(() => {
    if (!selected) return [];
    return events
      .filter((event) => event.equipmentId === selected.id || event.replacementEquipmentId === selected.id)
      .sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime());
  }, [events, selected]);
  const activeCount = areaRecords.filter((record) => record.lifecycle === "Ativo").length;
  const replacedCount = areaRecords.filter((record) => record.lifecycle === "Substituído").length;
  const discardedCount = areaRecords.filter((record) => record.lifecycle === "Descartado").length;

  function submitRegistration(fields: EquipmentFields) {
    const result = onRegister(fields);
    if (!result) return false;
    setSelectedId(result.id);
    setFilter("Todos");
    toast.success("Equipamento registrado", { description: "Salvo neste navegador; sem sincronização com CSN/CBSI." });
    return true;
  }

  function submitReplacement(fields: EquipmentFields, date: string, reason: string, reference: string) {
    if (!selected) return false;
    const result = onReplace(selected.id, fields, date, reason, reference);
    if (!result) return false;
    setSelectedId(result.id);
    setFilter("Todos");
    toast.success("Troca registrada", { description: "O ativo anterior foi mantido no histórico como substituído." });
    return true;
  }

  function submitDisposal(date: string, reason: string, destination: string, reference: string) {
    if (!selected) return false;
    const ok = onDispose(selected.id, date, reason, destination, reference);
    if (!ok) return false;
    toast.success("Baixa registrada", { description: "O ativo foi marcado como descartado e seu histórico foi preservado." });
    return true;
  }

  return (
    <div className="equipment-workspace">
      <div className="demo-strip"><span className="demo-strip-mark"><Boxes size={13} /></span><strong>GESTÃO DE ATIVOS</strong><span>Seleção contextual · {area?.name ?? "Área"}</span><span className="demo-strip-end">SEM CONEXÃO OPERACIONAL <i /></span></div>

      <header className="equipment-workspace-heading">
        <div>
          <Link href="/areas" className="back-to-dashboard"><ChevronRight size={13} />Trocar área</Link>
          <span className="eyebrow-line"><span className="eyebrow-dot" />ÁREA DE ATUAÇÃO <span className="heading-slash">/</span> {area?.name.toLocaleUpperCase("pt-BR")}</span>
          <h1>Equipamentos</h1>
          <p>Consulte os ativos e mantenha as movimentações de ciclo de vida rastreáveis.</p>
        </div>
        <button className="button-primary" type="button" onClick={() => setDialog("register")}><Plus size={16} />Cadastrar equipamento</button>
      </header>

      <aside className="local-data-banner"><ShieldCheck size={17} /><span><strong>Dados locais de demonstração</strong><small>Alterações ficam neste navegador. Não há sincronização, banco de dados nem vínculo operacional com CSN/CBSI.</small></span><span className="local-data-pill">NESTE NAVEGADOR</span></aside>

      <section className="equipment-summary-strip" aria-label="Resumo desta área">
        <div><span>ATIVOS</span><strong>{activeCount.toString().padStart(2, "0")}</strong></div>
        <div><span>SUBSTITUÍDOS</span><strong>{replacedCount.toString().padStart(2, "0")}</strong></div>
        <div><span>BAIXADOS / DESCARTADOS</span><strong>{discardedCount.toString().padStart(2, "0")}</strong></div>
        <div className="equipment-summary-area"><span>ÁREA ATIVA</span><strong>{area?.name}</strong></div>
      </section>

      <section className="equipment-list-panel panel-surface" aria-labelledby="equipment-list-heading">
        <div className="equipment-toolbar">
          <div><span className="panel-kicker">CADASTRO E RASTREABILIDADE</span><h2 id="equipment-list-heading">Ativos de {area?.name}</h2></div>
          <div className="equipment-list-filters">
            <label className="equipment-search"><Search size={15} /><input type="search" value={query} onChange={(event) => setQuery(event.currentTarget.value)} placeholder="Buscar código ou equipamento" aria-label="Buscar equipamento" /></label>
            <label className="equipment-filter"><span className="sr-only">Filtrar por ciclo de vida</span><select value={filter} onChange={(event) => setFilter(event.currentTarget.value as FilterKey)}><option>Ativos</option><option>Substituídos</option><option>Descartados</option><option>Todos</option></select></label>
          </div>
        </div>

        {filteredRecords.length ? (
          <div className="equipment-table-wrap">
            <table className="equipment-table">
              <thead><tr><th scope="col">CÓDIGO / EQUIPAMENTO</th><th scope="col">LOCALIZAÇÃO</th><th scope="col">ESTADO</th><th scope="col">ORIGEM</th><th scope="col"><span className="sr-only">Ação</span></th></tr></thead>
              <tbody>{filteredRecords.map((record) => (
                <tr key={record.id} className={selected?.id === record.id ? "is-selected" : ""}>
                  <td><button className="equipment-row-select" type="button" onClick={() => setSelectedId(record.id)} aria-pressed={selected?.id === record.id}><span className="equipment-row-code">{record.code}</span><strong>{record.name}</strong><small>{record.category}</small></button></td>
                  <td>{record.location}</td>
                  <td><span className={`lifecycle-badge lifecycle-${recordStateClass(record)}`}><i />{record.lifecycle === "Ativo" ? record.state : record.lifecycle}</span></td>
                  <td><span className={`record-origin origin-${record.origin.toLowerCase()}`}>{record.origin === "DEMO" ? "DEMO" : "LOCAL"}</span></td>
                  <td><button className="icon-button equipment-row-open" type="button" aria-label={`Ver detalhes de ${record.code}`} onClick={() => setSelectedId(record.id)}><ChevronRight size={16} /></button></td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        ) : (
          <div className="equipment-empty-state"><span><Boxes size={21} /></span><strong>{query ? "Nenhum equipamento encontrado" : "Nenhum ativo nesta visualização"}</strong><p>{query ? "Tente outro código ou nome." : filter === "Ativos" ? "Cadastre o primeiro equipamento desta área para iniciar a manutenção." : "Não há registros com este estado nesta área."}</p>{!query && filter === "Ativos" && <button className="button-primary" type="button" onClick={() => setDialog("register")}><Plus size={15} />Cadastrar equipamento</button>}</div>
        )}
      </section>

      {selected && (
        <section className="equipment-record-detail panel-surface" aria-labelledby="selected-equipment-title">
          <div className="equipment-detail-main">
            <div className="equipment-detail-title-row"><span className="equipment-detail-icon"><Wrench size={18} /></span><div><span className="panel-kicker">DETALHE DO ATIVO · {selected.origin === "DEMO" ? "DEMONSTRAÇÃO" : "REGISTRO LOCAL"}</span><h2 id="selected-equipment-title">{selected.name}</h2><span className="equipment-detail-code">{selected.code} <i /> {selected.category}</span></div><span className={`lifecycle-badge lifecycle-${slug(selected.lifecycle)}`}><i />{selected.lifecycle}</span></div>
            <div className="equipment-detail-grid"><div><small>ÁREA</small><strong>{area?.name}</strong></div><div><small>LOCALIZAÇÃO</small><strong>{selected.location}</strong></div><div><small>CRITICIDADE INFORMADA</small><strong>{selected.criticality}</strong></div><div><small>ESTADO INFORMADO</small><strong>{selected.state}</strong></div><div><small>ÚLTIMA MANUTENÇÃO</small><strong>{selected.lastMaintenance ? formatDate(selected.lastMaintenance) : "Não informada"}</strong></div><div><small>PRÓXIMA PREVISTA</small><strong>{selected.nextMaintenance ? formatDate(selected.nextMaintenance) : "Não informada"}</strong></div></div>
            {selected.lifecycle === "Ativo" ? (
              <div className="equipment-lifecycle-actions"><button className="button-quiet" type="button" onClick={() => setDialog("replace")}><ArrowLeftRight size={15} />Registrar troca</button><button className="button-danger-quiet" type="button" onClick={() => setDialog("dispose")}><Trash2 size={15} />Registrar baixa / descarte</button></div>
            ) : (
              <div className="equipment-closed-note"><Check size={15} /><span>Este registro foi encerrado para novas intervenções. O histórico permanece disponível.</span></div>
            )}
          </div>

          <aside className="equipment-history-panel"><div className="equipment-history-heading"><span className="history-heading-icon"><History size={16} /></span><div><span className="panel-kicker">TRILHA DE AUDITORIA</span><h3>Movimentações</h3></div><span className="history-count">{selectedEvents.length.toString().padStart(2, "0")}</span></div>
            {selectedEvents.length ? <ol className="equipment-event-list">{selectedEvents.map((event) => <li key={event.id}><span className={`event-type-dot event-${slug(event.type)}`} /><div><strong>{event.type}</strong><small>{formatDate(event.occurredAt, { day: "2-digit", month: "short", year: "numeric" })} · {event.equipmentCode}</small><p>{event.reason}{event.replacementCode ? ` · substituído por ${event.replacementCode}` : ""}{event.destination ? ` · destinação: ${event.destination}` : ""}{event.reference ? ` · referência: ${event.reference}` : ""}</p></div></li>)}</ol> : <div className="history-empty"><FileClock size={17} /><span>Nenhuma movimentação registrada para este ativo.</span></div>}
          </aside>
        </section>
      )}

      <div className="equipment-page-footnote"><CircleAlert size={14} /><span>Cadastros e baixas nesta versão são locais e demonstrativos. Antes de uso operacional, conectar backend e validar procedimentos com a equipe responsável.</span><Link href="/" className="text-link">Voltar ao painel <ArrowRight size={14} /></Link></div>

      {dialog && selected && <EquipmentDialog mode={dialog} record={selected} existing={records} onClose={() => setDialog(null)} onRegister={submitRegistration} onReplace={submitReplacement} onDispose={submitDisposal} />}
    </div>
  );
}

function EquipmentDialog({ mode, record, existing, onClose, onRegister, onReplace, onDispose }: {
  mode: DialogMode;
  record: AreaEquipmentRecord;
  existing: AreaEquipmentRecord[];
  onClose: () => void;
  onRegister: (fields: EquipmentFields) => boolean;
  onReplace: (fields: EquipmentFields, date: string, reason: string, reference: string) => boolean;
  onDispose: (date: string, reason: string, destination: string, reference: string) => boolean;
}) {
  const today = localDateInput();
  const [fields, setFields] = useState<EquipmentFields>({ code: "", name: "", category: "", location: "", criticality: "" as EquipmentFields["criticality"], state: "" as EquipmentFields["state"] });
  const [date, setDate] = useState(today);
  const [reason, setReason] = useState("");
  const [destination, setDestination] = useState("");
  const [reference, setReference] = useState("");
  const [error, setError] = useState("");

  const title = mode === "register" ? "Cadastrar equipamento" : mode === "replace" ? "Registrar troca" : "Registrar baixa / descarte";
  const isAssetForm = mode !== "dispose";

  function setField<K extends keyof EquipmentFields>(key: K, value: EquipmentFields[K]) {
    setFields((current) => ({ ...current, [key]: value }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    let saved = false;
    if (mode === "register") saved = onRegister(fields);
    else if (mode === "replace") saved = onReplace(fields, date, reason.trim(), reference.trim());
    else saved = onDispose(date, reason.trim(), destination.trim(), reference.trim());
    if (!saved) {
      setError("Não foi possível salvar. Confira se o código já está em uso e se todos os campos obrigatórios foram preenchidos.");
      return;
    }
    onClose();
  }

  return (
    <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className="modal-card equipment-dialog" role="dialog" aria-modal="true" aria-labelledby="equipment-dialog-title">
        <div className="modal-header"><div><span className="eyebrow">{mode === "replace" ? "RASTREABILIDADE DE ATIVO" : mode === "dispose" ? "ENCERRAMENTO DO CICLO DE VIDA" : "NOVO REGISTRO"}</span><h2 id="equipment-dialog-title">{title}</h2><p>{mode === "replace" ? `Substituir ${record.code}. O registro anterior será preservado.` : mode === "dispose" ? `Dar baixa em ${record.code}. O registro e as movimentações não serão apagados.` : "Informe os dados confirmados na área selecionada."}</p></div><button className="icon-button" type="button" aria-label="Fechar" onClick={onClose}><X size={18} /></button></div>
        <form onSubmit={handleSubmit}>
          {isAssetForm && <>
            {mode === "replace" && <div className="replace-source-card"><ArrowLeftRight size={15} /><span><small>EQUIPAMENTO ATUAL</small><strong>{record.code} · {record.name}</strong></span></div>}
            <div className="form-grid-two"><label className="form-field"><span>Código patrimonial <b>*</b></span><input autoFocus value={fields.code} onChange={(event) => setField("code", event.currentTarget.value)} maxLength={40} placeholder="Código informado pela equipe" required /></label><label className="form-field"><span>Nome do equipamento <b>*</b></span><input value={fields.name} onChange={(event) => setField("name", event.currentTarget.value)} maxLength={100} required /></label></div>
            <div className="form-grid-two"><label className="form-field"><span>Tipo / categoria <b>*</b></span><input value={fields.category} onChange={(event) => setField("category", event.currentTarget.value)} maxLength={60} placeholder="Ex.: Motor elétrico" required /></label><label className="form-field"><span>Localização <b>*</b></span><input value={fields.location} onChange={(event) => setField("location", event.currentTarget.value)} maxLength={90} required /></label></div>
            <div className="form-grid-two"><label className="form-field"><span>Criticidade informada <b>*</b></span><select value={fields.criticality} onChange={(event) => setField("criticality", event.currentTarget.value as EquipmentFields["criticality"])} required><option value="">Selecione</option>{(["Crítica", "Alta", "Média", "Baixa"] as const).map((item) => <option key={item}>{item}</option>)}</select></label><label className="form-field"><span>Estado informado <b>*</b></span><select value={fields.state} onChange={(event) => setField("state", event.currentTarget.value as EquipmentFields["state"])} required><option value="">Selecione</option>{(["Operacional", "Em atenção", "Parado"] as const).map((item) => <option key={item}>{item}</option>)}</select></label></div>
          </>}
          {mode !== "register" && <>
            <div className="form-grid-two"><label className="form-field"><span>{mode === "replace" ? "Data da troca" : "Data da baixa"} <b>*</b></span><input type="date" value={date} onChange={(event) => setDate(event.currentTarget.value)} required /></label><label className="form-field"><span>{mode === "replace" ? "OS / referência" : "Autorização / referência"}</span><input value={reference} onChange={(event) => setReference(event.currentTarget.value)} maxLength={60} placeholder="Opcional" /></label></div>
            <label className="form-field"><span>{mode === "replace" ? "Motivo informado para a troca" : "Motivo informado para baixa/descarte"} <b>*</b></span><textarea value={reason} onChange={(event) => setReason(event.currentTarget.value)} maxLength={400} rows={3} required placeholder="Descreva o motivo registrado pela equipe." /></label>
            {mode === "dispose" && <label className="form-field"><span>Destinação informada</span><input value={destination} onChange={(event) => setDestination(event.currentTarget.value)} maxLength={100} placeholder="Reciclagem, descarte autorizado, outra destinação..." /></label>}
          </>}
          <div className="form-disclaimer"><AlertTriangle size={15} /><span>Registro local deste navegador. Confirme os dados e as aprovações necessárias fora do sistema; esta demonstração não autoriza descarte nem substitui os procedimentos da empresa.</span></div>
          {error && <p className="form-error" role="alert">{error}</p>}
          <div className="modal-actions"><button type="button" className="button-quiet" onClick={onClose}>Cancelar</button><button type="submit" className={mode === "dispose" ? "button-danger" : "button-primary"}>{mode === "register" ? <><Plus size={15} />Salvar equipamento</> : mode === "replace" ? <><ArrowLeftRight size={15} />Registrar troca</> : <><Trash2 size={15} />Confirmar baixa</>}</button></div>
        </form>
      </section>
    </div>
  );
}

function recordStateClass(record: AreaEquipmentRecord) {
  if (record.lifecycle !== "Ativo") return slug(record.lifecycle);
  if (record.state === "Operacional") return "operacional";
  if (record.state === "Em atenção") return "em-atencao";
  return "parado";
}

function slug(value: string) {
  return value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replaceAll(" ", "-").replaceAll("/", "-");
}

function localDateInput() {
  const date = new Date();
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}
