export const CSN_AREAS = [
  { id: "aciaria", name: "Aciaria", descriptor: "Manutenção de área · seleção de ativos" },
  { id: "sinter", name: "Sinter", descriptor: "Manutenção de área · seleção de ativos" },
  { id: "acos-longos", name: "Aços longos", descriptor: "Manutenção de área · seleção de ativos" },
  { id: "alto-forno", name: "Alto-forno", descriptor: "Manutenção de área · seleção de ativos" },
  { id: "decapagem", name: "Decapagem", descriptor: "Manutenção de área · seleção de ativos" },
  { id: "coqueria", name: "Coqueria", descriptor: "Manutenção de área · seleção de ativos" },
] as const;

export type AreaId = (typeof CSN_AREAS)[number]["id"];

export function isAreaId(value: string | null | undefined): value is AreaId {
  return CSN_AREAS.some((area) => area.id === value);
}

export function getArea(areaId: AreaId | null | undefined) {
  return CSN_AREAS.find((area) => area.id === areaId) ?? null;
}

// Somente associações de demonstração para visualizar o fluxo; não são dados de localização da CSN.
export const DEMO_AREA_BY_EQUIPMENT_ID: Record<string, AreaId> = {
  "EQ-01": "aciaria",
  "EQ-02": "sinter",
  "EQ-03": "aciaria",
  "EQ-04": "acos-longos",
  "EQ-05": "alto-forno",
  "EQ-06": "decapagem",
  "EQ-07": "coqueria",
  "EQ-08": "coqueria",
};

export const ACTIVE_AREA_STORAGE_KEY = "eletroplan.active-area.v1";
