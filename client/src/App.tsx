import { useEffect, useMemo, useState } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch, useLocation } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import AppShell from "./components/electroplan/AppShell";
import { ThemeProvider } from "./contexts/ThemeContext";
import Dashboard from "./pages/Dashboard";
import AreasPage from "./pages/AreasPage";
import EquipmentWorkspace from "./pages/EquipmentWorkspace";
import ModulePage from "./pages/ModulePage";
import NotFound from "./pages/NotFound";
import PreventiveMaintenancePage from "./pages/PreventiveMaintenancePage";
import { getArea, type AreaId } from "./data/areas";
import {
  loadActiveArea,
  loadEquipmentEvents,
  loadEquipmentRecords,
  saveActiveArea,
  saveEquipmentEvents,
  saveEquipmentRecords,
  type AreaEquipmentRecord,
  type EquipmentEvent,
  type EquipmentFields,
} from "./data/equipment-lifecycle";
import { dateOffset, demoWorkOrders, type NewWorkOrderInput, type WorkOrderRecord } from "./data/demo-data";

const futureModules = [
  "ordens-de-servico",
  "falhas",
  "materiais",
  "seguranca",
  "paradas",
  "relatorios",
  "administracao",
];

function RoutedContent({
  activeAreaId,
  equipment,
  events,
  onSelectArea,
  onRegister,
  onReplace,
  onDispose,
  orders,
  onNewOrder,
  autoRotate,
  onAutoRotateChange,
}: {
  activeAreaId: AreaId | null;
  equipment: AreaEquipmentRecord[];
  events: EquipmentEvent[];
  onSelectArea: (areaId: AreaId) => void;
  onRegister: (fields: EquipmentFields) => AreaEquipmentRecord | null;
  onReplace: (equipmentId: string, fields: EquipmentFields, date: string, reason: string, reference: string) => AreaEquipmentRecord | null;
  onDispose: (equipmentId: string, date: string, reason: string, destination: string, reference: string) => boolean;
  orders: WorkOrderRecord[];
  onNewOrder: () => void;
  autoRotate: boolean;
  onAutoRotateChange: (value: boolean) => void;
}) {
  const areaEquipment = activeAreaId ? equipment.filter((record) => record.areaId === activeAreaId) : [];
  const activeEquipment = areaEquipment.filter((record) => record.lifecycle === "Ativo");

  return (
    <Switch>
      <Route path="/areas">
        <AreasPage activeAreaId={activeAreaId} equipment={equipment} onSelectArea={onSelectArea} />
      </Route>
      <Route path="/equipamentos">
        {activeAreaId ? (
          <EquipmentWorkspace areaId={activeAreaId} records={equipment} events={events} onRegister={onRegister} onReplace={onReplace} onDispose={onDispose} />
        ) : (
          <AreasPage activeAreaId={activeAreaId} equipment={equipment} onSelectArea={onSelectArea} />
        )}
      </Route>
      <Route path="/preventiva">
        {activeAreaId ? <PreventiveMaintenancePage areaId={activeAreaId} areaEquipment={areaEquipment} /> : <AreasPage activeAreaId={activeAreaId} equipment={equipment} onSelectArea={onSelectArea} />}
      </Route>
      <Route path="/">
        {activeAreaId ? (
          <Dashboard orders={orders} onNewOrder={onNewOrder} autoRotate={autoRotate} onAutoRotateChange={onAutoRotateChange} activeAreaId={activeAreaId} equipmentOptions={activeEquipment} />
        ) : (
          <AreasPage activeAreaId={activeAreaId} equipment={equipment} onSelectArea={onSelectArea} />
        )}
      </Route>
      {futureModules.map((moduleKey) => (
        <Route key={moduleKey} path={`/${moduleKey}`}>
          <ModulePage moduleKey={moduleKey} />
        </Route>
      ))}
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [, navigate] = useLocation();
  const [orders, setOrders] = useState<WorkOrderRecord[]>(demoWorkOrders);
  const [orderCounter, setOrderCounter] = useState(1);
  const [createOpen, setCreateOpen] = useState(false);
  const [autoRotate, setAutoRotate] = useState(() => !window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  const [activeAreaId, setActiveAreaId] = useState<AreaId | null>(() => loadActiveArea());
  const [equipment, setEquipment] = useState<AreaEquipmentRecord[]>(() => loadEquipmentRecords());
  const [equipmentEvents, setEquipmentEvents] = useState<EquipmentEvent[]>(() => loadEquipmentEvents());
  const activeAreaEquipment = useMemo(
    () => equipment.filter((record) => record.areaId === activeAreaId && record.lifecycle === "Ativo"),
    [equipment, activeAreaId],
  );

  useEffect(() => { saveEquipmentRecords(equipment); }, [equipment]);
  useEffect(() => { saveEquipmentEvents(equipmentEvents); }, [equipmentEvents]);

  const selectArea = (areaId: AreaId) => {
    setActiveAreaId(areaId);
    saveActiveArea(areaId);
    navigate("/equipamentos");
  };

  const createDemoOrder = (input: NewWorkOrderInput) => {
    const newOrder: WorkOrderRecord = {
      ...input,
      id: `OS-D-NEW-${orderCounter.toString().padStart(2, "0")}`,
      status: "Aberta",
      owner: "Usuário demonstração",
      openedAt: dateOffset(0),
    };
    setOrders((current) => [newOrder, ...current]);
    setOrderCounter((value) => value + 1);
  };

  const registerEquipment = (fields: EquipmentFields) => {
    if (!activeAreaId || !validEquipmentFields(fields) || hasDuplicateCode(equipment, fields.code)) return null;
    const record: AreaEquipmentRecord = {
      id: createId("LOCAL-EQ"),
      ...normalizeFields(fields),
      areaId: activeAreaId,
      lifecycle: "Ativo",
      origin: "LOCAL",
      createdAt: new Date().toISOString(),
    };
    const event: EquipmentEvent = {
      id: createId("MOV"),
      type: "Cadastro",
      areaId: activeAreaId,
      equipmentId: record.id,
      equipmentCode: record.code,
      equipmentName: record.name,
      occurredAt: record.createdAt ?? new Date().toISOString(),
      reason: "Cadastro inicial",
    };
    setEquipment((current) => [record, ...current]);
    setEquipmentEvents((current) => [event, ...current]);
    return record;
  };

  const replaceEquipment = (equipmentId: string, fields: EquipmentFields, date: string, reason: string, reference: string) => {
    const original = equipment.find((record) => record.id === equipmentId);
    if (!original || original.lifecycle !== "Ativo" || !validEquipmentFields(fields) || !date || !reason.trim() || hasDuplicateCode(equipment, fields.code)) return null;
    const replacement: AreaEquipmentRecord = {
      id: createId("LOCAL-EQ"),
      ...normalizeFields(fields),
      areaId: original.areaId,
      lifecycle: "Ativo",
      origin: "LOCAL",
      createdAt: dateToIso(date),
      replacementId: original.id,
    };
    const event: EquipmentEvent = {
      id: createId("MOV"),
      type: "Troca",
      areaId: original.areaId,
      equipmentId: original.id,
      equipmentCode: original.code,
      equipmentName: original.name,
      replacementEquipmentId: replacement.id,
      replacementCode: replacement.code,
      occurredAt: dateToIso(date),
      reason: reason.trim(),
      reference: reference.trim() || undefined,
    };
    setEquipment((current) => [replacement, ...current.map((record) => record.id === original.id ? { ...record, lifecycle: "Substituído" as const, replacedById: replacement.id } : record)]);
    setEquipmentEvents((current) => [event, ...current]);
    return replacement;
  };

  const disposeEquipment = (equipmentId: string, date: string, reason: string, destination: string, reference: string) => {
    const original = equipment.find((record) => record.id === equipmentId);
    if (!original || original.lifecycle !== "Ativo" || !date || !reason.trim()) return false;
    const occurredAt = dateToIso(date);
    const event: EquipmentEvent = {
      id: createId("MOV"),
      type: "Baixa / descarte",
      areaId: original.areaId,
      equipmentId: original.id,
      equipmentCode: original.code,
      equipmentName: original.name,
      occurredAt,
      reason: reason.trim(),
      destination: destination.trim() || undefined,
      reference: reference.trim() || undefined,
    };
    setEquipment((current) => current.map((record) => record.id === original.id ? { ...record, lifecycle: "Descartado" as const, disposedAt: occurredAt, disposalReason: reason.trim() } : record));
    setEquipmentEvents((current) => [event, ...current]);
    return true;
  };

  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster position="bottom-right" />
          <AppShell
            orders={orders}
            equipmentOptions={activeAreaEquipment}
            activeAreaId={activeAreaId}
            onCreateOrder={createDemoOrder}
            createOpen={createOpen}
            onCreateOpenChange={setCreateOpen}
            autoRotate={autoRotate}
            onAutoRotateChange={setAutoRotate}
          >
            <RoutedContent
              activeAreaId={activeAreaId}
              equipment={equipment}
              events={equipmentEvents}
              onSelectArea={selectArea}
              onRegister={registerEquipment}
              onReplace={replaceEquipment}
              onDispose={disposeEquipment}
              orders={orders}
              onNewOrder={() => setCreateOpen(true)}
              autoRotate={autoRotate}
              onAutoRotateChange={setAutoRotate}
            />
          </AppShell>
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

function validEquipmentFields(fields: EquipmentFields) {
  return Boolean(fields.code.trim() && fields.name.trim() && fields.category.trim() && fields.location.trim() && fields.criticality && fields.state);
}

function normalizeFields(fields: EquipmentFields): EquipmentFields {
  return {
    code: fields.code.trim().toLocaleUpperCase("pt-BR"),
    name: fields.name.trim(),
    category: fields.category.trim(),
    location: fields.location.trim(),
    criticality: fields.criticality,
    state: fields.state,
  };
}

function hasDuplicateCode(records: AreaEquipmentRecord[], code: string) {
  const normalized = code.trim().toLocaleUpperCase("pt-BR");
  return records.some((record) => record.code.trim().toLocaleUpperCase("pt-BR") === normalized);
}

function createId(prefix: string) {
  const random = globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  return `${prefix}-${random}`;
}

function dateToIso(value: string) {
  return new Date(`${value}T12:00:00`).toISOString();
}

export default App;
