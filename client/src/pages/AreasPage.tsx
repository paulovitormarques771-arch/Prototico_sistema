import { useMemo } from "react";
import { Activity, ArrowRight, Boxes, Factory, Gauge, Package, Settings2 } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { CSN_AREAS, type AreaId } from "@/data/areas";
import type { AreaEquipmentRecord } from "@/data/equipment-lifecycle";

const areaIcons: Record<AreaId, LucideIcon> = {
  aciaria: Factory,
  sinter: Gauge,
  "acos-longos": Boxes,
  "alto-forno": Activity,
  decapagem: Settings2,
  coqueria: Package,
};

export default function AreasPage({
  activeAreaId,
  equipment,
  onSelectArea,
}: {
  activeAreaId: AreaId | null;
  equipment: AreaEquipmentRecord[];
  onSelectArea: (areaId: AreaId) => void;
}) {
  const counts = useMemo(() => {
    const values = new Map<AreaId, number>();
    for (const area of CSN_AREAS) values.set(area.id, 0);
    for (const record of equipment) values.set(record.areaId, (values.get(record.areaId) ?? 0) + 1);
    return values;
  }, [equipment]);

  return (
    <div className="areas-page">
      <div className="demo-strip"><span className="demo-strip-mark"><Factory size={13} /></span><strong>SELEÇÃO DE ÁREA</strong><span>Escolha onde vai atuar antes de consultar os equipamentos.</span><span className="demo-strip-end">OPERAÇÃO LOCAL <i /></span></div>

      <header className="areas-heading">
        <div>
          <span className="eyebrow-line"><span className="eyebrow-dot" />PLANEJAMENTO DE MANUTENÇÃO</span>
          <h1>Áreas de atuação</h1>
          <p>Selecione uma área da CSN para abrir a lista de equipamentos correspondente.</p>
        </div>
        <div className="area-step-indicator" aria-label="Etapa um: selecionar área">
          <span className="area-step-index">01</span>
          <span><strong>Área</strong><small>Primeiro passo</small></span>
          <ArrowRight size={16} aria-hidden="true" />
          <span className="area-step-next">Equipamentos</span>
        </div>
      </header>

      <section className="area-choice-grid" aria-label="Áreas disponíveis">
        {CSN_AREAS.map((area, index) => {
          const Icon = areaIcons[area.id];
          const isActive = activeAreaId === area.id;
          const count = counts.get(area.id) ?? 0;
          return (
            <button
              key={area.id}
              className={`area-choice panel-surface ${isActive ? "is-active" : ""}`}
              type="button"
              aria-pressed={isActive}
              onClick={() => onSelectArea(area.id)}
              style={{ animationDelay: `${index * 35}ms` }}
            >
              <span className="area-choice-top"><span className="area-choice-icon"><Icon size={20} strokeWidth={1.8} /></span><span className="area-choice-code">ÁREA 0{index + 1}</span></span>
              <strong className="area-choice-name">{area.name}</strong>
              <span className="area-choice-bottom"><span>{count} registro{count === 1 ? "" : "s"} demonstrativo{count === 1 ? "" : "s"}</span><span className="area-choice-cta">{isActive ? "Abrir área" : "Selecionar área"}<ArrowRight size={15} /></span></span>
            </button>
          );
        })}
      </section>

      <aside className="area-data-note"><span className="area-note-mark">i</span><p><strong>Ambiente de demonstração.</strong> Os registros de equipamento exibidos para testar este fluxo são exemplos fictícios, não correspondem ao inventário nem à localização real de ativos da CSN. Cadastros feitos nesta versão ficam somente neste navegador.</p></aside>
    </div>
  );
}
