import * as THREE from 'three';

// 3D folder for the "realistic" dictation artwork: while active, audio bars turn into text,
// the sheet drops into the folder and the folder closes with a seal light (7 s loop).
// While idle it renders one still frame and stops the render loop to keep the GPU free.

const CYCLE = 7;
const LOOK = { face: { color: '#0f0f13', metalness: 0.25, roughness: 0.16, clearcoat: 1, clearcoatRoughness: 0.05 }, edge: { color: '#dcb168', metalness: 1, roughness: 0.2 }, accent: '#d39a3c', glow: '#ffcf7a', ribbon: '#6b1020', ink: '#2b2b30', shadow: 0.55 };

// idle: one still frame. listening: open folder with a live waveform above it (recording).
// transcribing: waveform -> text -> sheet into the folder -> close, looping. complete: the rest of
// that sequence once, sped up, so it fits before the recorder hides. demo: the whole design loop.
export type RealisticFolderMode = 'idle' | 'listening' | 'transcribing' | 'complete' | 'demo';
export type RealisticFolderScene = { setMode(mode: RealisticFolderMode): void; setPixelRatio(ratio: number): void; setTime(time: string): void; dispose(): void };

// Cycle positions (0..1) of the design timeline.
const LISTEN_HOLD = 0.21, CONVERT_START = 0.21;
// The recorder stays visible ~1.6 s after a dictation (engine.rs completion_hide_delay).
const COMPLETE_SPEED = 4;

const clamp = (v: number) => v < 0 ? 0 : v > 1 ? 1 : v;
const seg = (t: number, a: number, b: number) => clamp((t - a) / (b - a));
const ease = (x: number) => x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
const backOut = (x: number) => { const c1 = 2.2, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); };
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;

function rectShape(w: number, h: number, r: number) {
  const s = new THREE.Shape(), x0 = -w / 2, x1 = w / 2;
  s.moveTo(x0 + r, 0); s.lineTo(x1 - r, 0); s.quadraticCurveTo(x1, 0, x1, r);
  s.lineTo(x1, h - r); s.quadraticCurveTo(x1, h, x1 - r, h);
  s.lineTo(x0 + r, h); s.quadraticCurveTo(x0, h, x0, h - r);
  s.lineTo(x0, r); s.quadraticCurveTo(x0, 0, x0 + r, 0);
  return s;
}

function glowTexture() {
  const c = document.createElement('canvas'); c.width = c.height = 128;
  const g = c.getContext('2d')!;
  const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.18, 'rgba(255,255,255,.55)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = gr; g.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(c);
}

export function createRealisticFolderScene(canvas: HTMLCanvasElement, width: number, height: number, reducedMotion: boolean): RealisticFolderScene {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setSize(width, height, false);
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.08;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const disposables: { dispose(): void }[] = [];
  const track = <T extends { dispose(): void }>(item: T) => { disposables.push(item); return item; };

  const scene = new THREE.Scene();
  const pmrem = track(new THREE.PMREMGenerator(renderer));
  const env = new THREE.Scene();
  env.add(new THREE.Mesh(track(new THREE.BoxGeometry(20, 20, 20)), track(new THREE.MeshBasicMaterial({ color: 0x18181c, side: THREE.BackSide }))));
  const softbox = (w: number, h: number, x: number, y: number, z: number, color: string, k: number) => {
    const m = new THREE.Mesh(track(new THREE.PlaneGeometry(w, h)), track(new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(k), side: THREE.DoubleSide })));
    m.position.set(x, y, z); m.lookAt(0, 0, 0); env.add(m);
  };
  softbox(12, 3, 0, 9, 1, '#ffffff', 5);
  softbox(1.5, 9, -9, 2, 4, '#ffffff', 5);
  softbox(1.5, 9, 9, 2, -3, '#ffe0b0', 3.5);
  softbox(8, 1.2, 0, 0.5, 9, '#ffffff', 1.6);
  scene.environment = track(pmrem.fromScene(env, 0.03)).texture;

  const key = new THREE.DirectionalLight(0xffffff, 2.4);
  key.position.set(-3.5, 7, 4.5); key.castShadow = true; key.shadow.mapSize.set(2048, 2048);
  const sc = key.shadow.camera; sc.left = -5; sc.right = 5; sc.top = 5; sc.bottom = -5; sc.near = 1; sc.far = 25;
  key.shadow.radius = 9; key.shadow.bias = -0.0004; key.shadow.normalBias = 0.02;
  scene.add(key);
  const rim = new THREE.DirectionalLight(0xffe7c4, 1.8); rim.position.set(4, 3, -5); scene.add(rim);

  const floorMat = track(new THREE.ShadowMaterial({ opacity: LOOK.shadow }));
  const floor = new THREE.Mesh(track(new THREE.PlaneGeometry(40, 40)), floorMat);
  floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);
  const camera = new THREE.PerspectiveCamera(30, width / height, 0.1, 100);
  const glowTex = track(glowTexture());

  // Soft, rounded geometry.
  const FW = 3.0, BH = 2.05, FH = 1.62, R = 0.36, BULGE = 0.11;
  const backShape = () => {
    const s = new THREE.Shape(), x0 = -FW / 2, x1 = FW / 2, tabW = 1.15, tabH = 0.3, tx = x0 + tabW, r = R;
    s.moveTo(x0 + r, 0); s.lineTo(x1 - r, 0); s.quadraticCurveTo(x1, 0, x1, r);
    s.lineTo(x1, BH - r); s.quadraticCurveTo(x1, BH, x1 - r, BH);
    s.lineTo(tx + 0.42, BH);
    s.bezierCurveTo(tx + 0.12, BH, tx + 0.2, BH + tabH, tx - 0.16, BH + tabH);
    s.lineTo(x0 + 0.24, BH + tabH); s.quadraticCurveTo(x0, BH + tabH, x0, BH + tabH - 0.24);
    s.lineTo(x0, r); s.quadraticCurveTo(x0, 0, x0 + r, 0);
    return s;
  };
  const bulgeZ = (x: number) => { const u = 2 * x / FW; return BULGE * (1 - u * u); };
  const bulge = (geo: THREE.BufferGeometry, sign: number) => {
    const p = geo.attributes.position;
    for (let i = 0; i < p.count; i++) p.setZ(i, p.getZ(i) + sign * bulgeZ(p.getX(i)));
    geo.computeVertexNormals();
  };
  const ext = { depth: 0.04, bevelEnabled: true, bevelThickness: 0.05, bevelSize: 0.05, bevelSegments: 10, curveSegments: 40 };
  const backGeo = track(new THREE.ExtrudeGeometry(backShape(), ext)); backGeo.translate(0, 0, -0.02); bulge(backGeo, -0.5);
  const frontGeo = track(new THREE.ExtrudeGeometry(rectShape(FW, FH, R), ext)); frontGeo.translate(0, 0, -0.02); bulge(frontGeo, 1);

  const folder = new THREE.Group(); folder.rotation.y = -0.55; scene.add(folder);
  const body = new THREE.Group(); folder.add(body);

  const faceMat = track(new THREE.MeshPhysicalMaterial({ side: THREE.DoubleSide, ...LOOK.face }));
  const edgeMat = track(new THREE.MeshPhysicalMaterial(LOOK.edge));
  const goldMat = track(new THREE.MeshPhysicalMaterial({ ...LOOK.edge, roughness: 0.18, clearcoat: 1 }));
  const accentColor = new THREE.Color(LOOK.accent), inkColor = new THREE.Color(LOOK.ink);
  const accentMat = track(new THREE.MeshStandardMaterial({ color: LOOK.accent, emissive: LOOK.glow, emissiveIntensity: 0.2, roughness: 0.25, metalness: 1, transparent: true }));
  const sealMat = track(new THREE.MeshBasicMaterial({ color: new THREE.Color(LOOK.glow).multiplyScalar(2), transparent: true, opacity: 0, toneMapped: false }));

  const back = new THREE.Mesh(backGeo, [faceMat, edgeMat]); back.position.set(0, 0.06, -0.22); back.rotation.x = -0.07;
  back.castShadow = true; back.receiveShadow = true; body.add(back);
  const hinge = new THREE.Group(); hinge.position.set(0, 0.06, 0.2); body.add(hinge);
  const front = new THREE.Mesh(frontGeo, [faceMat, edgeMat]); front.castShadow = true; front.receiveShadow = true; hinge.add(front);
  const SURF = 0.02 + 0.05 + 0.004;
  const dummy = new THREE.Object3D();

  // Stitching that follows the rounded edge.
  const seam = rectShape(FW - 0.3, FH - 0.3, R - 0.15).getSpacedPoints(96); seam.pop();
  const stitchGeo = track(new THREE.CapsuleGeometry(0.009, 0.034, 4, 8)); stitchGeo.rotateZ(Math.PI / 2);
  const stitches = new THREE.InstancedMesh(stitchGeo, goldMat, seam.length);
  seam.forEach((p, i) => {
    const q = seam[(i + 1) % seam.length];
    dummy.position.set(p.x, p.y + 0.15, SURF + bulgeZ(p.x));
    dummy.rotation.set(0, 0, Math.atan2(q.y - p.y, q.x - p.x));
    dummy.updateMatrix(); stitches.setMatrixAt(i, dummy.matrix);
  });
  hinge.add(stitches);

  // Embossed sound mark on the front.
  const markHeights = [0.08, 0.16, 0.26, 0.18, 0.3, 0.14, 0.22, 0.1];
  const mark = new THREE.InstancedMesh(track(new THREE.CapsuleGeometry(0.022, 1, 4, 10)), goldMat, markHeights.length);
  markHeights.forEach((h, i) => {
    const x = 0.82 + i * 0.075;
    dummy.position.set(x, 0.42, SURF + bulgeZ(x) + 0.004); dummy.rotation.set(0, 0, 0); dummy.scale.set(1, h, 0.55);
    dummy.updateMatrix(); mark.setMatrixAt(i, dummy.matrix);
  });
  dummy.scale.set(1, 1, 1);
  hinge.add(mark);

  // Recording timer engraved in gold along the bottom of the front, bent to the face curvature.
  const TIME_W = 2.15, TIME_H = 0.49, TIME_X = -0.1, TIME_Y = 0.72;
  const timeCanvas = document.createElement('canvas'); timeCanvas.width = 768; timeCanvas.height = 174;
  const timeTexture = track(new THREE.CanvasTexture(timeCanvas)); timeTexture.colorSpace = THREE.SRGBColorSpace; timeTexture.anisotropy = 8;
  let shownTime = '';
  const paintTime = (text: string) => {
    const g = timeCanvas.getContext('2d')!, w = timeCanvas.width, h = timeCanvas.height;
    g.clearRect(0, 0, w, h);
    g.font = '600 150px "Segoe UI Variable Display", "Segoe UI", Inter, system-ui, sans-serif';
    g.textAlign = 'center'; g.textBaseline = 'middle';
    // Tabular layout: every glyph sits in a fixed cell so the digits never shift while counting.
    const cell = 92, colon = 46, widths = [...text].map(c => c === ':' ? colon : cell);
    let x = (w - widths.reduce((a, b) => a + b, 0)) / 2;
    const gold = g.createLinearGradient(0, h * 0.12, 0, h * 0.9);
    gold.addColorStop(0, '#fff1c4'); gold.addColorStop(0.45, '#e2b65e'); gold.addColorStop(1, '#9a6a22');
    [...text].forEach((c, i) => {
      const cx = x + widths[i] / 2, cy = h / 2 + 4;
      g.fillStyle = 'rgba(0,0,0,.75)'; g.fillText(c, cx + 3, cy + 4); // engraved shadow
      g.fillStyle = gold; g.fillText(c, cx, cy);
      x += widths[i];
    });
    timeTexture.needsUpdate = true;
  };
  const timeGeo = track(new THREE.PlaneGeometry(TIME_W, TIME_H, 24, 1));
  { const p = timeGeo.attributes.position; for (let i = 0; i < p.count; i++) p.setZ(i, SURF + bulgeZ(p.getX(i) + TIME_X) + 0.006); timeGeo.computeVertexNormals(); }
  // Self-lit: the strip faces down while the folder is open, so scene light alone leaves it unreadable.
  const timeMat = track(new THREE.MeshStandardMaterial({ map: timeTexture, emissiveMap: timeTexture, emissive: 0xffffff, emissiveIntensity: 0.85, transparent: true, metalness: 0.35, roughness: 0.3, depthWrite: false }));
  const timeLabel = new THREE.Mesh(timeGeo, timeMat); timeLabel.position.set(TIME_X, TIME_Y, 0); hinge.add(timeLabel);
  paintTime(shownTime = '00:00');

  const snap = new THREE.Mesh(track(new THREE.SphereGeometry(0.075, 32, 16)), goldMat); snap.scale.set(1, 1, 0.45);
  snap.position.set(0, FH - 0.12, SURF + bulgeZ(0) + 0.01); hinge.add(snap);
  const snapRing = new THREE.Mesh(track(new THREE.TorusGeometry(0.09, 0.012, 12, 40)), goldMat); snapRing.position.copy(snap.position); hinge.add(snapRing);

  // Seal light along the top edge on close.
  const sealPts: THREE.Vector3[] = [];
  for (let i = 0; i <= 40; i++) { const sx = -FW / 2 + R + (FW - 2 * R) * i / 40; sealPts.push(new THREE.Vector3(sx, FH + 0.045, 0.02 + bulgeZ(sx))); }
  hinge.add(new THREE.Mesh(track(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(sealPts), 60, 0.012, 8, false)), sealMat));

  // Rounded spine at the bottom.
  const spineGeo = track(new THREE.CylinderGeometry(0.22, 0.22, FW - 0.5, 48, 1, true, Math.PI / 2, Math.PI)); spineGeo.rotateZ(Math.PI / 2);
  const spine = new THREE.Mesh(spineGeo, faceMat); spine.position.set(0, 0.28, -0.01); spine.castShadow = true; body.add(spine);
  for (const sgn of [-1, 1]) {
    const capGeo = track(new THREE.CircleGeometry(0.22, 32, Math.PI, Math.PI)); capGeo.rotateY(Math.PI / 2);
    const cap = new THREE.Mesh(capGeo, faceMat); cap.position.set(sgn * (FW - 0.5) / 2, 0.28, -0.01); body.add(cap);
  }

  // Paper.
  const SW = 2.55, SH = 1.95;
  let seed = 7;
  const rand = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
  const segs: { x: number; y: number; w: number }[] = [];
  for (let row = 0; segs.length < 28 && row < 7; row++) {
    let x = -1.1; const maxX = row === 6 ? 0.2 : 1.1;
    while (segs.length < 28) {
      const w = 0.16 + rand() * 0.42;
      if (x + w > maxX) break;
      segs.push({ x: x + w / 2, y: 0.42 - row * 0.19, w });
      x += w + 0.075;
    }
  }
  const paperTexture = (title: string) => {
    const c = document.createElement('canvas'); c.width = 1020; c.height = 780;
    const g = c.getContext('2d')!;
    g.fillStyle = '#f7f4ed'; g.fillRect(0, 0, c.width, c.height);
    for (let i = 0; i < 2500; i++) { g.fillStyle = 'rgba(0,0,0,' + (Math.random() * 0.025) + ')'; g.fillRect(Math.random() * c.width, Math.random() * c.height, 2, 2); }
    const sx = c.width / SW, sy = c.height / SH;
    g.fillStyle = LOOK.accent; g.beginPath(); g.arc((-1.06 + SW / 2) * sx, (SH / 2 - 0.69) * sy, 9, 0, 6.3); g.fill();
    g.fillStyle = '#8a8a90'; g.font = '600 28px Helvetica, Arial, sans-serif';
    g.fillText(title, (-0.98 + SW / 2) * sx, (SH / 2 - 0.66) * sy);
    g.fillStyle = '#c9c5bc'; g.fillRect((-1.1 + SW / 2) * sx, (SH / 2 - 0.58) * sy, 2.2 * sx, 2);
    g.fillStyle = '#34343a';
    for (const s of segs) {
      const cx = (s.x + SW / 2) * sx, cy = (SH / 2 - s.y) * sy, w = s.w * sx, h = 0.05 * sy;
      g.beginPath(); if (g.roundRect) g.roundRect(cx - w / 2, cy - h / 2, w, h, h / 2); else g.rect(cx - w / 2, cy - h / 2, w, h); g.fill();
    }
    const t = track(new THREE.CanvasTexture(c)); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t;
  };
  const sheetGeometry = (curl: number) => {
    const g = track(new THREE.ShapeGeometry(rectShape(SW, SH, 0.07), 6)), p = g.attributes.position, uv = g.attributes.uv;
    g.translate(0, -SH / 2, 0);
    for (let i = 0; i < p.count; i++) {
      uv.setXY(i, (p.getX(i) + SW / 2) / SW, (p.getY(i) + SH / 2) / SH);
      const u = 2 * p.getX(i) / SW; p.setZ(i, curl * u * u);
    }
    g.computeVertexNormals(); return g;
  };
  const restMat = track(new THREE.MeshStandardMaterial({ map: paperTexture('REUNIÓN · 09:41'), roughness: 0.85, side: THREE.DoubleSide }));
  const newMat = track(new THREE.MeshStandardMaterial({ map: paperTexture('TRANSCRIPCIÓN · 00:12'), roughness: 0.85, side: THREE.DoubleSide, transparent: true }));
  const restGeo = sheetGeometry(0.05);
  for (const p of [[-0.12, 0.08, 0.05, -0.04], [-0.04, 0.15, -0.05, 0.035]]) {
    const m = new THREE.Mesh(restGeo, restMat); m.position.set(p[2], SH / 2 + p[1], p[0]); m.rotation.z = p[3]; m.rotation.x = -0.05;
    m.castShadow = true; m.receiveShadow = true; body.add(m);
  }
  const newSheet = new THREE.Mesh(sheetGeometry(0.06), newMat); newSheet.castShadow = true; body.add(newSheet);
  const TOP_Y = 2.85, IN_Y = SH / 2 + 0.22, IN_Z = 0.03;

  // Ribbon bookmark hanging over the front.
  const ribbonCurve = new THREE.CatmullRomCurve3([new THREE.Vector3(0.74, 0.7, -0.075), new THREE.Vector3(0.76, 1.6, -0.115), new THREE.Vector3(0.78, 2.18, -0.17), new THREE.Vector3(0.8, 2.36, -0.3), new THREE.Vector3(0.82, 2.22, -0.48), new THREE.Vector3(0.84, 1.75, -0.53)]);
  const rp = ribbonCurve.getPoints(40), ribbonGeo = track(new THREE.BufferGeometry()), rv: number[] = [], ri: number[] = [];
  rp.forEach(p => rv.push(p.x - 0.055, p.y, p.z, p.x + 0.055, p.y, p.z));
  for (let j = 0; j < rp.length - 1; j++) { const a = j * 2; ri.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); }
  const tip = rp[rp.length - 1]; rv.push(tip.x, tip.y - 0.07, tip.z - 0.005);
  const tipI = rv.length / 3 - 1, la = (rp.length - 1) * 2; ri.push(la, la + 1, tipI);
  ribbonGeo.setAttribute('position', new THREE.Float32BufferAttribute(rv, 3)); ribbonGeo.setIndex(ri); ribbonGeo.computeVertexNormals();
  const ribbon = new THREE.Mesh(ribbonGeo, track(new THREE.MeshPhysicalMaterial({ color: LOOK.ribbon, roughness: 0.5, envMapIntensity: 0.35, side: THREE.DoubleSide })));
  ribbon.castShadow = true; body.add(ribbon);

  // Waveform pearls that become text lines.
  const barGeo = track(new THREE.CapsuleGeometry(0.5, 1, 8, 16));
  const bars = segs.map(() => { const b = new THREE.Mesh(barGeo, accentMat); b.castShadow = true; folder.add(b); return b; });
  const haloMat = track(new THREE.SpriteMaterial({ map: glowTex, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, toneMapped: false, color: LOOK.glow }));
  const halo = new THREE.Sprite(haloMat); halo.scale.set(4.2, 1.6, 1); halo.position.set(0, TOP_Y, -0.05); folder.add(halo);

  // Sparkles.
  const NSP = 70, spGeo = track(new THREE.BufferGeometry()), spPos = new Float32Array(NSP * 3);
  const spSeed = Array.from({ length: NSP }, (_, k) => ({ x: (Math.random() - 0.5) * 3, y: Math.random(), z: (Math.random() - 0.5) * 0.6, d: Math.random(), s: 0.4 + Math.random() * 0.8, burst: k % 2 === 1 }));
  spGeo.setAttribute('position', new THREE.BufferAttribute(spPos, 3));
  const spMat = track(new THREE.PointsMaterial({ map: glowTex, size: 0.18, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false, sizeAttenuation: true, color: LOOK.glow, opacity: 0.9 }));
  const sparks = new THREE.Points(spGeo, spMat); sparks.frustumCulled = false; folder.add(sparks);

  const floorGlowMat = track(new THREE.MeshBasicMaterial({ map: glowTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false, color: LOOK.glow }));
  const floorGlow = new THREE.Mesh(track(new THREE.PlaneGeometry(5.5, 2.6)), floorGlowMat); floorGlow.rotation.x = -Math.PI / 2; floorGlow.position.set(0, 0.002, 0.1); folder.add(floorGlow);

  // sec drives continuous motion (waveform, camera sway); t is the position in the cycle.
  const draw = (sec: number, t: number) => {
    const yaw = Math.sin(sec * 0.35) * 0.07;
    // Framed tighter than the design board so the folder fills the recorder like the other models.
    camera.position.set(Math.sin(yaw) * 7.1, 3.0, Math.cos(yaw) * 7.1);
    camera.lookAt(0, 1.62, 0);

    let ang: number;
    if (t < 0.2) ang = lerp(0.1, 0.5, ease(seg(t, 0, 0.2)));
    else if (t < 0.6) ang = 0.5 + Math.sin((t - 0.2) * 30) * 0.008;
    else if (t < 0.7) ang = lerp(0.5, 0.02, backOut(seg(t, 0.6, 0.7)));
    else if (t < 0.88) ang = 0.02;
    else ang = lerp(0.02, 0.1, ease(seg(t, 0.88, 1)));
    hinge.rotation.x = ang;

    const sq = Math.sin(seg(t, 0.66, 0.78) * Math.PI);
    body.scale.set(1 + 0.018 * sq, 1 - 0.028 * sq, 1 + 0.018 * sq);

    const appear = ease(seg(t, 0, 0.08));
    const morphG = seg(t, 0.22, 0.34);
    const fade = 1 - seg(t, 0.38, 0.42);
    accentMat.color.copy(accentColor).lerp(inkColor, ease(morphG)); accentMat.metalness = 1 - ease(morphG); accentMat.roughness = 0.25 + 0.5 * ease(morphG);
    accentMat.emissiveIntensity = 0.2 * (1 - ease(morphG));
    accentMat.opacity = fade;
    haloMat.opacity = 0.18 * appear * (1 - ease(morphG)) * (0.85 + 0.15 * Math.sin(sec * 6));
    const n = segs.length;
    bars.forEach((b, i) => {
      b.visible = fade > 0.001 && appear > 0.001;
      const wx = -1.3 + i * (2.6 / (n - 1));
      const hh = (0.12 + 0.95 * Math.abs(Math.sin(i * 0.62 + sec * 5.2) * Math.sin(i * 0.21 + sec * 2.1))) * appear;
      const k = ease(seg(t, 0.22 + i * 0.002, 0.31 + i * 0.002));
      const s = segs[i];
      b.position.set(lerp(wx, s.x, k), TOP_Y + lerp(Math.sin(i * 0.5 + sec * 2) * 0.03, s.y, k), lerp(0, 0.02, k));
      b.rotation.z = lerp(0, -Math.PI / 2, k);
      b.scale.set(lerp(0.075, 0.05, k), lerp(Math.max(hh, 0.001) / 2, s.w / 2, k), lerp(0.075, 0.012, k));
    });

    const op = ease(seg(t, 0.32, 0.4)) * (1 - ease(seg(t, 0.9, 0.99)));
    newMat.opacity = op; newSheet.visible = op > 0.001;
    const d = ease(seg(t, 0.43, 0.6));
    newSheet.position.set(0, lerp(TOP_Y, IN_Y, d), lerp(0, IN_Z, d));
    newSheet.rotation.z = Math.sin(d * Math.PI) * 0.07;
    newSheet.rotation.x = lerp(0, -0.04, d) + Math.sin(d * Math.PI) * 0.12;

    sealMat.opacity = Math.sin(seg(t, 0.66, 0.84) * Math.PI);

    // Sparkles drift up from the waveform as it turns into text, then burst along the top edge on close.
    const p1 = seg(t, 0.2, 0.46), p2 = seg(t, 0.66, 0.9), arr = spGeo.attributes.position.array as Float32Array;
    spSeed.forEach((s, i) => {
      let x: number, y: number, z: number, life: number;
      if (s.burst) { life = clamp(p2 * 1.4 - s.d * 0.4); x = s.x * 0.9; y = FH + 0.3 + life * 0.9 * s.s; z = 0.3 + s.z; }
      else { life = clamp(p1 * 1.4 - s.d * 0.4); x = s.x; y = TOP_Y - 0.3 + s.y * 0.6 + life * 0.8 * s.s; z = s.z; }
      const alive = life > 0 && life < 1;
      arr[i * 3] = x + Math.sin(sec * 2 + i) * 0.05; arr[i * 3 + 1] = alive ? y : -10; arr[i * 3 + 2] = z;
    });
    spGeo.attributes.position.needsUpdate = true;
    spMat.size = 0.16 + 0.06 * Math.sin(sec * 9);

    floorGlowMat.opacity = 0.1 + 0.25 * sq + 0.08 * appear * (1 - morphG);
    renderer.render(scene, camera);
  };

  let raf = 0, disposed = false, mode: RealisticFolderMode = 'idle';
  let origin = performance.now(), offset = 0, t = 0;
  const clock = () => (performance.now() - origin) / 1000;
  const rest = () => { t = 0; raf = 0; draw(0, 0); };
  const frame = () => {
    const sec = clock();
    if (mode === 'listening') t = Math.min(LISTEN_HOLD, offset + sec / CYCLE);
    else if (mode === 'transcribing' || mode === 'demo') t = ((offset + sec / CYCLE) % 1);
    else if (mode === 'complete') {
      t = offset + sec * COMPLETE_SPEED / CYCLE;
      if (t >= 1) { rest(); return; }
    }
    draw(sec, t);
    raf = requestAnimationFrame(frame);
  };
  const setMode = (next: RealisticFolderMode) => {
    if (disposed || next === mode) return;
    const previous = mode, at = t;
    mode = next;
    cancelAnimationFrame(raf); raf = 0;
    origin = performance.now();
    if (reducedMotion) { draw(0, next === 'listening' || next === 'transcribing' ? LISTEN_HOLD : 0); return; }
    if (next === 'idle') { rest(); return; }
    if (next === 'complete') {
      // Finish only a take that was being recorded or transcribed; from rest there is nothing to close.
      if (previous !== 'listening' && previous !== 'transcribing') { rest(); return; }
      offset = previous === 'listening' ? CONVERT_START : Math.max(at, CONVERT_START);
    } else if (next === 'listening') {
      offset = previous === 'transcribing' ? Math.min(at, LISTEN_HOLD) : 0;
    } else if (next === 'transcribing') {
      offset = previous === 'listening' ? CONVERT_START : 0;
    } else {
      offset = 0;
    }
    frame();
  };
  // Compile every shader up front. Waveform, halo, sparkles and the new sheet are hidden at rest,
  // so three.js would otherwise compile them on the first recording frame and stall ~60 ms.
  const hidden: THREE.Object3D[] = [];
  scene.traverse(object => { if (!object.visible) { hidden.push(object); object.visible = true; } });
  renderer.compile(scene, camera);
  hidden.forEach(object => { object.visible = false; });
  draw(0, 0);

  return {
    setMode,
    setTime(text: string) {
      if (text === shownTime) return;
      paintTime(shownTime = text);
      if (!raf) draw(0, t);
    },
    // Match the drawing buffer to the pixels actually shown: the recorder is scaled down with CSS,
    // and downscaling a rendered canvas that way leaves jagged edges.
    setPixelRatio(ratio: number) {
      const next = Math.min(Math.max(ratio, 1), 4);
      if (Math.abs(renderer.getPixelRatio() - next) < 0.01) return;
      renderer.setPixelRatio(next); renderer.setSize(width, height, false);
      if (!raf) draw(0, t);
    },
    dispose() {
      disposed = true;
      cancelAnimationFrame(raf);
      stitches.dispose(); mark.dispose();
      disposables.forEach(item => item.dispose());
      renderer.dispose();
    }
  };
}
