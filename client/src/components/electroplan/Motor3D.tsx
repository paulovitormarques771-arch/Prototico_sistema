import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { ChevronLeft, ChevronRight, CircleAlert, Pause, Play } from "lucide-react";
import * as THREE from "three";

export default function Motor3D({ autoRotate, onAutoRotateChange }: { autoRotate: boolean; onAutoRotateChange: (value: boolean) => void }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const modelRef = useRef<THREE.Group | null>(null);
  const autoRotateRef = useRef(autoRotate);
  const draggingRef = useRef(false);
  const previousPointerRef = useRef({ x: 0, y: 0 });
  const [webglUnavailable, setWebglUnavailable] = useState(false);
  autoRotateRef.current = autoRotate;

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "low-power" });
    } catch {
      setWebglUnavailable(true);
      return;
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.04;
    host.appendChild(renderer.domElement);
    renderer.domElement.setAttribute("aria-hidden", "true");
    renderer.domElement.className = "motor-webgl-canvas";

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(33, 1, 0.1, 40);
    camera.position.set(-4.25, 2.55, 5.25);
    camera.lookAt(0, 0.02, 0);

    scene.add(new THREE.HemisphereLight(0xd7e0e8, 0x111b27, 2.05));
    const keyLight = new THREE.DirectionalLight(0xfff2e4, 3.2);
    keyLight.position.set(-3.2, 4.5, 4.2);
    scene.add(keyLight);
    const fillLight = new THREE.DirectionalLight(0xb6c6d4, 1.8);
    fillLight.position.set(3.4, 1.6, -3.3);
    scene.add(fillLight);
    const warmEdgeLight = new THREE.PointLight(0xc47a3a, 12, 9, 2);
    warmEdgeLight.position.set(-2.5, 1.2, 3.6);
    scene.add(warmEdgeLight);

    const motor = new THREE.Group();
    motor.rotation.set(-0.04, -0.3, 0.015);
    scene.add(motor);
    modelRef.current = motor;

    const casing = new THREE.MeshStandardMaterial({ color: 0x253449, metalness: 0.83, roughness: 0.31 });
    const casingLight = new THREE.MeshStandardMaterial({ color: 0x47596a, metalness: 0.78, roughness: 0.27 });
    const darkSteel = new THREE.MeshStandardMaterial({ color: 0x111c28, metalness: 0.79, roughness: 0.39 });
    const brightSteel = new THREE.MeshStandardMaterial({ color: 0xbcc6ce, metalness: 0.88, roughness: 0.22 });
    const orangeMetal = new THREE.MeshStandardMaterial({ color: 0xc47a3a, metalness: 0.78, roughness: 0.28 });
    const labelMetal = new THREE.MeshStandardMaterial({ color: 0xe6e9e9, metalness: 0.45, roughness: 0.48 });

    const axialCylinder = (radius: number, length: number, x: number, material: THREE.Material, radialSegments = 48) => {
      const mesh = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, length, radialSegments, 1), material);
      mesh.rotation.z = Math.PI / 2;
      mesh.position.set(x, 0, 0);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      motor.add(mesh);
      return mesh;
    };

    axialCylinder(0.78, 1.68, 0, casing, 64);
    for (let index = 0; index < 11; index += 1) {
      const x = -0.68 + index * 0.136;
      axialCylinder(0.83 + (index % 2 === 0 ? 0.035 : 0), 0.035, x, index % 2 === 0 ? casingLight : casing, 48);
    }
    axialCylinder(0.81, 0.17, -0.88, casingLight, 64);
    axialCylinder(0.81, 0.17, 0.88, casingLight, 64);
    axialCylinder(0.72, 0.07, -0.99, darkSteel, 64);
    axialCylinder(0.72, 0.07, 0.99, darkSteel, 64);
    axialCylinder(0.47, 0.07, -1.04, brightSteel, 48);
    axialCylinder(0.39, 0.06, 1.04, darkSteel, 48);
    axialCylinder(0.19, 0.73, -1.34, brightSteel, 48);
    axialCylinder(0.205, 0.08, -1.68, casingLight, 48);
    axialCylinder(0.035, 0.32, -1.62, brightSteel, 16).position.y = 0.19;

    const fanGuard = new THREE.Mesh(new THREE.CylinderGeometry(0.53, 0.53, 0.14, 48), casingLight);
    fanGuard.rotation.z = Math.PI / 2;
    fanGuard.position.x = 1.15;
    motor.add(fanGuard);
    const fanCore = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.17, 0.2, 32), orangeMetal);
    fanCore.rotation.z = Math.PI / 2;
    fanCore.position.x = 1.28;
    motor.add(fanCore);
    for (let index = 0; index < 12; index += 1) {
      const angle = (index / 12) * Math.PI * 2;
      const vent = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.026, 0.3), darkSteel);
      vent.position.set(1.235, Math.cos(angle) * 0.34, Math.sin(angle) * 0.34);
      vent.rotation.x = angle;
      motor.add(vent);
    }

    for (const x of [-0.55, 0.55]) {
      const foot = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.19, 0.62), casingLight);
      foot.position.set(x, -0.83, 0);
      foot.castShadow = true;
      motor.add(foot);
      const shoe = new THREE.Mesh(new THREE.BoxGeometry(0.82, 0.09, 0.68), darkSteel);
      shoe.position.set(x, -0.96, 0);
      motor.add(shoe);
      for (const z of [-0.22, 0.22]) {
        const bolt = new THREE.Mesh(new THREE.CylinderGeometry(0.042, 0.042, 0.025, 12), brightSteel);
        bolt.position.set(x, -0.905, z);
        motor.add(bolt);
      }
    }

    const terminalBox = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.37, 0.58), casingLight);
    terminalBox.position.set(0.05, 0.96, 0);
    terminalBox.castShadow = true;
    motor.add(terminalBox);
    const terminalLid = new THREE.Mesh(new THREE.BoxGeometry(0.58, 0.055, 0.6), darkSteel);
    terminalLid.position.set(0.05, 1.175, 0);
    motor.add(terminalLid);
    const terminalStripe = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.016, 0.012), orangeMetal);
    terminalStripe.position.set(0.05, 1.205, 0.26);
    motor.add(terminalStripe);

    const sidePlate = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.25, 0.022), labelMetal);
    sidePlate.position.set(0.22, 0.16, 0.8);
    motor.add(sidePlate);
    const plateMark = new THREE.Mesh(new THREE.BoxGeometry(0.31, 0.022, 0.013), orangeMetal);
    plateMark.position.set(0.19, 0.2, 0.815);
    motor.add(plateMark);

    for (let index = 0; index < 8; index += 1) {
      const angle = (index / 8) * Math.PI * 2;
      const bolt = new THREE.Mesh(new THREE.SphereGeometry(0.04, 12, 10), brightSteel);
      bolt.position.set(-1.045, Math.cos(angle) * 0.59, Math.sin(angle) * 0.59);
      motor.add(bolt);
    }
    const orangeBandA = new THREE.Mesh(new THREE.CylinderGeometry(0.845, 0.845, 0.045, 48), orangeMetal);
    orangeBandA.rotation.z = Math.PI / 2;
    orangeBandA.position.x = -0.88;
    motor.add(orangeBandA);
    const orangeBandB = orangeBandA.clone();
    orangeBandB.position.x = 0.88;
    motor.add(orangeBandB);

    const plinth = new THREE.Mesh(new THREE.CylinderGeometry(1.57, 1.57, 0.12, 64), darkSteel);
    plinth.position.y = -1.09;
    plinth.receiveShadow = true;
    motor.add(plinth);
    const plinthTop = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.5, 0.025, 64), casingLight);
    plinthTop.position.y = -1.018;
    motor.add(plinthTop);
    const plinthStripe = new THREE.Mesh(new THREE.TorusGeometry(1.51, 0.012, 6, 96), orangeMetal);
    plinthStripe.rotation.x = Math.PI / 2;
    plinthStripe.position.y = -1.001;
    motor.add(plinthStripe);

    const resize = () => {
      const width = Math.max(host.clientWidth, 1);
      const height = Math.max(host.clientHeight, 1);
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(host);

    let frame = 0;
    let lastFrame = 0;
    const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const renderFrame = (timestamp: number) => {
      frame = requestAnimationFrame(renderFrame);
      const delta = lastFrame ? Math.min((timestamp - lastFrame) / 1000, 0.05) : 0;
      lastFrame = timestamp;
      if (autoRotateRef.current && !motionPreference.matches && !draggingRef.current) motor.rotation.y += delta * 0.12;
      renderer.render(scene, camera);
    };
    frame = requestAnimationFrame(renderFrame);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      motor.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose();
          for (const material of Array.isArray(object.material) ? object.material : [object.material]) material.dispose();
        }
      });
      renderer.dispose();
      renderer.domElement.remove();
      modelRef.current = null;
    };
  }, []);

  function onPointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    if (event.button !== 0) return;
    draggingRef.current = true;
    previousPointerRef.current = { x: event.clientX, y: event.clientY };
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function onPointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    const model = modelRef.current;
    if (!draggingRef.current || !model) return;
    const deltaX = event.clientX - previousPointerRef.current.x;
    const deltaY = event.clientY - previousPointerRef.current.y;
    previousPointerRef.current = { x: event.clientX, y: event.clientY };
    model.rotation.y += deltaX * 0.008;
    model.rotation.x = THREE.MathUtils.clamp(model.rotation.x + deltaY * 0.004, -0.42, 0.42);
  }

  function onPointerUp() {
    draggingRef.current = false;
  }

  function rotate(delta: number) {
    if (modelRef.current) modelRef.current.rotation.y += delta;
  }

  return (
    <div className="motor-scene-wrap">
      <div
        ref={hostRef}
        className={`motor-stage motor-stage-webgl ${webglUnavailable ? "has-webgl-error" : ""}`}
        role="img"
        aria-label="Motor elétrico industrial tridimensional genérico, com estrutura metálica azul e detalhes laranja. Arraste para inspecionar; há controles de rotação abaixo. Não representa equipamento real da CSN."
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onLostPointerCapture={onPointerUp}
        title="Arraste para girar o modelo 3D"
      >
        {webglUnavailable && <div className="motor-webgl-fallback"><CircleAlert size={20} /><strong>Visualização 3D indisponível</strong><span>Use um navegador com suporte a WebGL para inspecionar o modelo.</span></div>}
        {!webglUnavailable && <span className="motor-model-caption">MODELO DEMONSTRATIVO · NÃO REPRESENTA ATIVO REAL</span>}
      </div>
      <div className="motor-controls">
        <div className="motor-control-cluster"><button className="motor-rotate-button" type="button" onClick={() => rotate(-0.22)} aria-label="Girar motor para a esquerda"><ChevronLeft size={16} /></button><button className="motor-rotate-button" type="button" onClick={() => rotate(0.22)} aria-label="Girar motor para a direita"><ChevronRight size={16} /></button><span>INSPEÇÃO MANUAL</span></div>
        <button className={`motor-auto-toggle ${autoRotate ? "is-enabled" : ""}`} type="button" onClick={() => onAutoRotateChange(!autoRotate)} aria-pressed={autoRotate} aria-label={autoRotate ? "Pausar rotação automática" : "Ativar rotação automática"}>{autoRotate ? <Pause size={13} /> : <Play size={13} />}<span>Rotação suave</span><i /></button>
      </div>
    </div>
  );
}
