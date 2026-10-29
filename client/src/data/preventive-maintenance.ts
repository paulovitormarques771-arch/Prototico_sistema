import { isAreaId, type AreaId } from "./areas";

export interface LocalPreventiveMaintenanceRecord {
  id: string;
  areaId: AreaId;
  orderReference: string;
  equipmentId: string;
  equipmentCode: string;
  equipmentName: string;
  scheduledDate?: string;
  createdAt: string;
  origin: "LOCAL";
}

const STORAGE_KEY = "eletroplan.preventive-maintenance.v1";

function isLocalPreventiveRecord(value: unknown): value is LocalPreventiveMaintenanceRecord {
  if (!value || typeof value !== "object") return false;
  const record = value as Partial<LocalPreventiveMaintenanceRecord>;
  const validDate = record.scheduledDate === undefined || /^\d{4}-\d{2}-\d{2}$/.test(record.scheduledDate);
  return typeof record.id === "string"
    && isAreaId(record.areaId)
    && typeof record.orderReference === "string"
    && record.orderReference.trim().length > 0
    && typeof record.equipmentId === "string"
    && typeof record.equipmentCode === "string"
    && typeof record.equipmentName === "string"
    && validDate
    && typeof record.createdAt === "string"
    && record.origin === "LOCAL";
}

export function loadLocalPreventiveMaintenances(): LocalPreventiveMaintenanceRecord[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(isLocalPreventiveRecord) : [];
  } catch {
    return [];
  }
}

export function saveLocalPreventiveMaintenances(records: LocalPreventiveMaintenanceRecord[]): boolean {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
    return true;
  } catch {
    return false;
  }
}
