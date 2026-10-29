import { demoEquipment, type Criticality, type OperationalState } from "./demo-data";
import { DEMO_AREA_BY_EQUIPMENT_ID, isAreaId, type AreaId } from "./areas";

export type EquipmentLifecycle = "Ativo" | "Substituído" | "Descartado";
export type RecordOrigin = "DEMO" | "LOCAL";
export type EquipmentEventType = "Cadastro" | "Troca" | "Baixa / descarte";

export interface AreaEquipmentRecord {
  id: string;
  code: string;
  name: string;
  category: string;
  location: string;
  areaId: AreaId;
  criticality: Criticality;
  state: OperationalState;
  lifecycle: EquipmentLifecycle;
  origin: RecordOrigin;
  createdAt?: string;
  lastMaintenance?: string;
  nextMaintenance?: string;
  replacementId?: string;
  replacedById?: string;
  disposedAt?: string;
  disposalReason?: string;
}

export interface EquipmentFields {
  code: string;
  name: string;
  category: string;
  location: string;
  criticality: Criticality;
  state: OperationalState;
}

export interface EquipmentEvent {
  id: string;
  type: EquipmentEventType;
  areaId: AreaId;
  equipmentId: string;
  equipmentCode: string;
  equipmentName: string;
  replacementEquipmentId?: string;
  replacementCode?: string;
  occurredAt: string;
  reason: string;
  destination?: string;
  reference?: string;
}

const EQUIPMENT_STORAGE_KEY = "eletroplan.equipment-records.v1";
const EVENTS_STORAGE_KEY = "eletroplan.equipment-events.v1";

function readArray(key: string): unknown[] {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return [];
    const value: unknown = JSON.parse(raw);
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

function isEquipmentRecord(value: unknown): value is AreaEquipmentRecord {
  if (!value || typeof value !== "object") return false;
  const record = value as Partial<AreaEquipmentRecord>;
  return typeof record.id === "string"
    && typeof record.code === "string"
    && typeof record.name === "string"
    && typeof record.category === "string"
    && typeof record.location === "string"
    && isAreaId(record.areaId)
    && ["Crítica", "Alta", "Média", "Baixa"].includes(record.criticality ?? "")
    && ["Operacional", "Em atenção", "Parado"].includes(record.state ?? "")
    && ["Ativo", "Substituído", "Descartado"].includes(record.lifecycle ?? "")
    && ["DEMO", "LOCAL"].includes(record.origin ?? "");
}

function isEquipmentEvent(value: unknown): value is EquipmentEvent {
  if (!value || typeof value !== "object") return false;
  const event = value as Partial<EquipmentEvent>;
  return typeof event.id === "string"
    && ["Cadastro", "Troca", "Baixa / descarte"].includes(event.type ?? "")
    && isAreaId(event.areaId)
    && typeof event.equipmentId === "string"
    && typeof event.equipmentCode === "string"
    && typeof event.equipmentName === "string"
    && typeof event.occurredAt === "string"
    && typeof event.reason === "string";
}

function demoRecords(): AreaEquipmentRecord[] {
  return demoEquipment.map((record) => ({
    ...record,
    areaId: DEMO_AREA_BY_EQUIPMENT_ID[record.id] ?? "aciaria",
    lifecycle: "Ativo",
    origin: "DEMO",
  }));
}

export function loadEquipmentRecords(): AreaEquipmentRecord[] {
  const saved = readArray(EQUIPMENT_STORAGE_KEY).filter(isEquipmentRecord);
  const savedById = new Map(saved.map((record) => [record.id, record]));
  const demos = demoRecords().map((record) => savedById.get(record.id) ?? record);
  const demoIds = new Set(demos.map((record) => record.id));
  const local = saved.filter((record) => !demoIds.has(record.id));
  return [...demos, ...local];
}

export function loadEquipmentEvents(): EquipmentEvent[] {
  return readArray(EVENTS_STORAGE_KEY).filter(isEquipmentEvent);
}

export function saveEquipmentRecords(records: AreaEquipmentRecord[]): boolean {
  try {
    window.localStorage.setItem(EQUIPMENT_STORAGE_KEY, JSON.stringify(records));
    return true;
  } catch {
    return false;
  }
}

export function saveEquipmentEvents(events: EquipmentEvent[]): boolean {
  try {
    window.localStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(events));
    return true;
  } catch {
    return false;
  }
}

export function loadActiveArea(): AreaId | null {
  try {
    const value = window.localStorage.getItem("eletroplan.active-area.v1");
    return isAreaId(value) ? value : null;
  } catch {
    return null;
  }
}

export function saveActiveArea(areaId: AreaId): boolean {
  try {
    window.localStorage.setItem("eletroplan.active-area.v1", areaId);
    return true;
  } catch {
    return false;
  }
}
