import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Link } from "wouter";
import { AlertTriangle, ArrowRight, CalendarCheck2, CircleAlert, ClipboardList, Plus, Search, ShieldCheck, Wrench, X } from "lucide-react";
import { toast } from "sonner";
import { DEMO_AREA_BY_EQUIPMENT_ID, getArea, type AreaId } from "@/data/areas";
import { demoPreventives, formatDate, type PreventiveRecord } from "@/data/demo-data";
import type { AreaEquipmentRecord } from "@/data/equipment-lifecycle";
import { loadLocalPreventiveMaintenances, saveLocalPreventiveMaintenances, type LocalPreventiveMaintenanceRecord } from "@/data/preventive-maintenance";

interface PreventiveMaintenancePageProps {
  areaId: AreaId;
  areaEquipment: AreaEquipmentRecord[];
}

interface MaintenanceListRow {
  id: string;
  orderReference?: string;
  equipmentId: string;
  equipmentCode: string;
  equipmentName: string;
  activity: string;
  scheduledAt?: string;
  status: "Programada" | "Concluída";
  origin: "DEMO" | "LOCAL";
  createdAt?: string;
}

type StatusFilter = "Todas" | "Programada" | "Concluída";

export default function PreventiveMaintenancePage({ areaId, areaEquipment }: PreventiveMaintenancePageProps) {
  const area = getArea(areaId);
  const [localRecords, setLocalRecords] = useState<LocalPreventiveMaintenanceRecord[]>(() => loadLocalPreventiveMaintenances());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [orderReference, setOrderReference] = useState("");
  const [equipmentId, setEquipmentId] = useState("");
  const [scheduledDate, setScheduledDate] = useState("");
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("Todas");
  const activeEquipment = useMemo(
    () => areaEquipment.filter((record) => record.areaId === areaId && record.lifecycle === "Ativo"),
    [areaEquipment, areaId],
  );

  const rows = useMemo<MaintenanceListRow[]>(() => {
    const demoRows = demoPreventives
      .filter((record) => DEMO_AREA_BY_EQUIPMENT_ID[record.equipmentId] === areaId)
      .map((record) => demoRow(record, areaEquipment));
    const localRows = localRecords
      .filter((record) => record.areaId === areaId)
      .map((record): MaintenanceListRow => ({
        id: record.id,
        orderReference: record.orderReference,
        equipmentId: record.equipmentId,
        equipmentCode: record.equipmentCode,
        equipmentName: record.equipmentName,
        activity: "Manutenção preventiva",
        scheduledAt: record.scheduledDate,
        status: "Programada",
        origin: "LOCAL",
        createdAt: record.createdAt,
      }));
    return [...demoRows, ...localRows].sort((a, b) => {
      const aDate = a.scheduledAt ? new Date(a.scheduledAt).getTime() : Number.POSITIVE_INFINITY;
      const bDate = b.scheduledAt ? new Date(b.scheduledAt).getTime() : Number.POSITIVE_INFINITY;
      return aDate - bDate || (b.createdAt ?? "").localeCompare(a.createdAt ?? "");
    });
  }, [areaEquipment, areaId, localRecords]);

  const visibleRows = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("pt-BR");
    return rows.filter((record) => {
      const matchesStatus = statusFilter === "Todas" || record.status === statusFilter;
      const searchable = `${record.orderReference ?? ""} ${record.equipmentCode} ${record.equipmentName} ${record.activity}`.toLocaleLowerCase("pt-BR");
      return matchesStatus && (!normalizedQuery || searchable.includes(normalizedQuery));
    });
  }, [query, rows, statusFilter]);

  useEffect(() => {
    if (!dialogOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeDialog();
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [dialogOpen]);

  function openDialog() {
    setOrderReference("");
    setEquipmentId("");
    setScheduledDate("");
    setError("");
    setDialogOpen(true);
  }

  function closeDialog() {
    setDialogOpen(false);
    setError("");
  }

  function submitMaintenance(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const reference = orderReference.trim().toLocaleUpperCase("pt-BR");
    const selectedEquipment = activeEquipment.find((record) => record.id === equipmentId);
    if (!reference || !selectedEquipment) {
      setError("Informe a OS e selecione um equipamento ativo da área.");
      return;
    }

    const newRecord: LocalPreventiveMaintenanceRecord = {
      id: createRecordId(),
      areaId,
      orderReference: reference,
      equipmentId: selectedEquipment.id,
      equipmentCode: selectedEquipment.code,
      equipmentName: selectedEquipment.name,
      scheduledDate: scheduledDate || undefined,
      createdAt: new Date().toISOString(),
      origin: "LOCAL",
    };
    const nextRecords = [newRecord, ...localRecords];
    if (!saveLocalPreventiveMaintenances(nextRecords)) {
      setError("Não foi possível salvar neste navegador. Libere espaço e tente novamente.");
      return;
    }
    setLocalRecords(nextRecords);
    closeDialog();
    setQuery("");
    setStatusFilter("Todas");
    toast.success("Manutenção adicionada", { description: `${reference} vinculada a ${selectedEquipment.code} nesta área.` });
  }

  return (
    <div className="preventive-page">
      <div className="demo-strip"><span className="demo-strip-mark"><CalendarCheck2 size={13} /></span><strong>PROGRAMAÇÃO PREVENTIVA</strong><span>Vincule a OS ao equipamento da área ativa.</span><span className="demo-strip-end">LOCAL · DEMO <i /></span></div>

      <header className="equipment-workspace-heading preventive-page-heading">
        <div>
          <Link href="/areas" className="back-to-dashboard"><ArrowRight size={13} />Trocar área</Link>
          <span className="eyebrow-line"><span className="eyebrow-dot" />ÁREA DE ATUAÇÃO <span className="heading-slash">/</span> {area?.name.toLocaleUpperCase("pt-BR")}</span>
          <h1>Manutenção preventiva</h1>
          <p>Associe uma OS ao equipamento que será atendido nesta área.</p>
        </div>
        <button className="button-primary" type="button" onClick={openDialog} disabled={!activeEquipment.length} title={!activeEquipment.length ? "Cadastre um equipamento ativo nesta área primeiro" : undefined}><Plus size={16} />Adicionar manutenção</button>
      </header>

      <aside className="local-data-banner"><ShieldCheck size={17} /><span><strong>Registros demonstrativos e locais</strong><small>OS e equipamentos informados aqui ficam somente neste navegador; nada é enviado ou sincronizado com a CSN/CBSI.</small></span><span className="local-data-pill">SEM CONEXÃO</span></aside>

      {!activeEquipment.length && <aside className="preventive-no-equipment"><Wrench size={17} /><div><strong>Nenhum equipamento ativo nesta área</strong><span>Cadastre ou ative um equipamento antes de adicionar a manutenção.</span></div><Link className="text-link" href="/equipamentos">Abrir equipamentos <ArrowRight size={14} /></Link></aside>}

      <section className="preventive-summary-strip" aria-label="Resumo da manutenção preventiva">
        <div><span>REGISTROS NESTA ÁREA</span><strong>{rows.length.toString().padStart(2, "0")}</strong></div>
        <div><span>EQUIPAMENTOS ATIVOS</span><strong>{activeEquipment.length.toString().padStart(2, "0")}</strong></div>
        <div><span>CADASTROS LOCAIS</span><strong>{localRecords.filter((record) => record.areaId === areaId).length.toString().padStart(2, "0")}</strong></div>
        <div className="preventive-summary-area"><span>ÁREA ATIVA</span><strong>{area?.name}</strong></div>
      </section>

      <section className="preventive-list-panel panel-surface" aria-labelledby="preventive-list-heading">
        <div className="equipment-toolbar">
          <div><span className="panel-kicker">AGENDA E RASTREABILIDADE</span><h2 id="preventive-list-heading">Registros de manutenção</h2></div>
          <div className="equipment-list-filters">
            <label className="equipment-search"><Search size={15} /><input type="search" value={query} onChange={(event) => setQuery(event.currentTarget.value)} placeholder="Buscar OS ou equipamento" aria-label="Buscar manutenção por OS ou equipamento" /></label>
            <label className="equipment-filter"><span className="sr-only">Filtrar por situação</span><select value={statusFilter} onChange={(event) => setStatusFilter(event.currentTarget.value as StatusFilter)}><option>Todas</option><option>Programada</option><option>Concluída</option></select></label>
          </div>
        </div>

        {visibleRows.length ? (
          <div className="equipment-table-wrap preventive-table-wrap">
            <table className="equipment-table preventive-table">
              <thead><tr><th scope="col">OS</th><th scope="col">EQUIPAMENTO</th><th scope="col">ATIVIDADE</th><th scope="col">DATA PREVISTA</th><th scope="col">SITUAÇÃO</th><th scope="col">ORIGEM</th></tr></thead>
              <tbody>{visibleRows.map((record) => (
                <tr key={`${record.origin}-${record.id}`}>
                  <td>{record.orderReference ? <code className="preventive-order-code">{record.orderReference}</code> : <span className="preventive-no-order">Sem OS vinculada</span>}</td>
                  <td><span className="preventive-equipment-cell"><code>{record.equipmentCode}</code><strong>{record.equipmentName}</strong></span></td>
                  <td>{record.activity}</td>
                  <td>{formatScheduleDate(record.scheduledAt)}</td>
                  <td><span className={`preventive-status status-${slug(record.status)}`}><i />{record.status}</span></td>
                  <td><span className={`record-origin origin-${record.origin.toLowerCase()}`}>{record.origin}</span></td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        ) : (
          <div className="equipment-empty-state"><span><ClipboardList size={21} /></span><strong>{query || statusFilter !== "Todas" ? "Nenhum registro corresponde ao filtro" : "Nenhuma manutenção registrada nesta área"}</strong><p>{query || statusFilter !== "Todas" ? "Altere a busca ou a situação selecionada." : "Adicione a primeira manutenção com a OS e o equipamento correspondente."}</p>{activeEquipment.length > 0 && <button className="button-primary" type="button" onClick={openDialog}><Plus size={15} />Adicionar manutenção</button>}</div>
        )}
      </section>

      <div className="equipment-page-footnote"><CircleAlert size={14} /><span>Os registros existentes sem número de OS são exemplos históricos da demonstração. Novas manutenções exigem OS informada e equipamento selecionado.</span><Link href="/equipamentos" className="text-link">Ver equipamentos <ArrowRight size={14} /></Link></div>

      {dialogOpen && (
        <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) closeDialog(); }}>
          <section className="modal-card preventive-dialog" role="dialog" aria-modal="true" aria-labelledby="preventive-dialog-title">
            <div className="modal-header"><div><span className="eyebrow">NOVO REGISTRO · {area?.name.toLocaleUpperCase("pt-BR")}</span><h2 id="preventive-dialog-title">Adicionar manutenção</h2><p>Informe a OS e selecione o equipamento atendido.</p></div><button className="icon-button" type="button" aria-label="Fechar" onClick={closeDialog}><X size={18} /></button></div>
            <form onSubmit={submitMaintenance}>
              <label className="form-field"><span>Número / referência da OS <b>*</b></span><input autoFocus value={orderReference} onChange={(event) => setOrderReference(event.currentTarget.value)} maxLength={40} placeholder="Informe a OS" required /></label>
              <label className="form-field"><span>Equipamento da área <b>*</b></span><select value={equipmentId} onChange={(event) => setEquipmentId(event.currentTarget.value)} required><option value="">Selecione o equipamento</option>{activeEquipment.map((record) => <option key={record.id} value={record.id}>{record.code} · {record.name}</option>)}</select></label>
              <label className="form-field"><span>Data prevista <small>(opcional)</small></span><input type="date" value={scheduledDate} onChange={(event) => setScheduledDate(event.currentTarget.value)} /></label>
              <div className="form-disclaimer"><AlertTriangle size={15} /><span>A OS informada é uma referência do cadastro; esta tela não cria nem valida uma ordem corporativa. O registro fica apenas neste navegador.</span></div>
              {error && <p className="form-error" role="alert">{error}</p>}
              <div className="modal-actions"><button type="button" className="button-quiet" onClick={closeDialog}>Cancelar</button><button type="submit" className="button-primary"><Plus size={15} />Salvar manutenção</button></div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}

function demoRow(record: PreventiveRecord, areaEquipment: AreaEquipmentRecord[]): MaintenanceListRow {
  const equipment = areaEquipment.find((item) => item.id === record.equipmentId);
  return {
    id: record.id,
    equipmentId: record.equipmentId,
    equipmentCode: equipment?.code ?? record.equipmentId,
    equipmentName: equipment?.name ?? "Equipamento demonstrativo",
    activity: record.title,
    scheduledAt: record.dueAt,
    status: record.status,
    origin: "DEMO",
  };
}

function formatScheduleDate(value?: string) {
  if (!value) return "Sem data definida";
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [year, month, day] = value.split("-").map(Number);
    return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(year, month - 1, day, 12));
  }
  return formatDate(value, { day: "2-digit", month: "short", year: "numeric" });
}

function createRecordId() {
  const random = globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  return `LOCAL-PM-${random}`;
}

function slug(value: string) {
  return value.toLocaleLowerCase("pt-BR").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replaceAll(" ", "-");
}
