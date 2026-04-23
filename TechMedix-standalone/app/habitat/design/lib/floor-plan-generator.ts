export interface Room {
  id: string;
  label: string;
  x: number;
  y: number;
  w: number;
  h: number;
  type: "bedroom" | "bathroom" | "kitchen" | "living" | "hallway" | "foyer" | "dining";
}

export interface Door {
  roomId: string;
  wall: "n" | "s" | "e" | "w";
  offset: number;
}

export interface Window {
  roomId: string;
  wall: "n" | "s" | "e" | "w";
  offset: number;
  width: number;
}

export interface FloorPlan {
  width: number;
  height: number;
  rooms: Room[];
  doors: Door[];
  windows: Window[];
  cellSize: number;
}

export interface DesignParams {
  bedrooms?: number;
  bathrooms?: number;
  sqft?: number;
  stories?: number;
  style?: string;
  features?: string[];
  budget_max?: number;
  budget_tier?: string;
  site_type?: string;
  notes?: string;
}

const CELL_PX = 18;
const PAD = 24;

export function generateFloorPlan(params: DesignParams): FloorPlan {
  const sqft = Math.max(300, Math.min(8000, params.sqft || 1200));
  const bedrooms = Math.max(1, Math.min(6, params.bedrooms || 3));
  const bathrooms = Math.max(1, Math.min(5, params.bathrooms || 2));

  const totalCells = Math.round(sqft / 4);
  const aspect = 1.45;
  let h = Math.max(10, Math.round(Math.sqrt(totalCells / aspect)));
  let w = Math.max(14, Math.round(totalCells / h));

  while (w * h * 4 < sqft - 20 && w < h * 2.8) w++;
  while (w * h * 4 > sqft + 60 && w > 10) w--;

  const rooms: Room[] = [];

  const sleepW = Math.max(7, Math.round(w * 0.38));

  const masterW = Math.min(sleepW - 1, Math.max(6, Math.round(sleepW * 0.72)));
  const masterH = Math.max(5, Math.min(Math.round(h * 0.32), Math.round((sqft * 0.13) / (masterW * 4))));
  rooms.push({
    id: "master",
    label: "Master Bedroom",
    x: 0,
    y: 0,
    w: masterW,
    h: masterH,
    type: "bedroom",
  });

  const bedW = Math.max(4, masterW - 1);
  const bedH = Math.max(4, Math.min(Math.round(h * 0.22), Math.round((sqft * 0.08) / (bedW * 4))));
  let currentY = masterH;
  for (let i = 1; i < bedrooms; i++) {
    if (currentY + bedH > h - 5) break;
    rooms.push({
      id: `bed-${i}`,
      label: `Bedroom ${i + 1}`,
      x: 0,
      y: currentY,
      w: bedW,
      h: bedH,
      type: "bedroom",
    });
    currentY += bedH;
  }

  const bathW = Math.max(2, sleepW - bedW);
  const bathH = Math.max(3, Math.min(5, Math.round((sqft * 0.04) / (Math.max(bathW, 1) * 4))));
  let bathY = masterH;
  for (let i = 0; i < bathrooms; i++) {
    if (bathY + bathH > h - 2) break;
    rooms.push({
      id: `bath-${i}`,
      label: i === 0 && bathrooms === 1 ? "Bathroom" : `Bath ${i + 1}`,
      x: bedW,
      y: bathY,
      w: bathW,
      h: bathH,
      type: "bathroom",
    });
    bathY += bathH + (i < bathrooms - 1 ? 1 : 0);
  }

  const hallW = 2;
  const hallX = sleepW;
  rooms.push({
    id: "hall",
    label: "Hall",
    x: hallX,
    y: 0,
    w: hallW,
    h: h,
    type: "hallway",
  });

  const liveX = hallX + hallW;
  const liveTotalW = w - liveX;

  const kitchenH = Math.max(4, Math.min(Math.round(h * 0.30), Math.round((sqft * 0.10) / (liveTotalW * 4))));
  rooms.push({
    id: "kitchen",
    label: "Kitchen",
    x: liveX,
    y: h - kitchenH,
    w: liveTotalW,
    h: kitchenH,
    type: "kitchen",
  });

  const diningH = bedrooms <= 2 ? Math.max(3, Math.round(kitchenH * 0.7)) : 0;
  let livingH = h - kitchenH;
  if (diningH > 0 && livingH - diningH >= 5) {
    livingH -= diningH;
    rooms.push({
      id: "dining",
      label: "Dining",
      x: liveX,
      y: livingH,
      w: Math.max(4, Math.round(liveTotalW * 0.55)),
      h: diningH,
      type: "dining",
    });
  }

  rooms.push({
    id: "living",
    label: "Living Room",
    x: liveX,
    y: 0,
    w: liveTotalW,
    h: livingH,
    type: "living",
  });

  const foyerW = Math.min(5, hallW + 2);
  const foyerH = Math.min(3, Math.max(2, Math.round(h * 0.12)));
  rooms.push({
    id: "foyer",
    label: "Foyer",
    x: hallX - 1,
    y: h - foyerH,
    w: foyerW,
    h: foyerH,
    type: "foyer",
  });

  const doors: Door[] = [
    { roomId: "master", wall: "e", offset: Math.max(1, Math.round(masterH / 2)) },
    { roomId: "living", wall: "w", offset: Math.max(1, Math.round(livingH / 2)) },
    { roomId: "kitchen", wall: "w", offset: Math.max(1, Math.round(kitchenH / 2)) },
    { roomId: "foyer", wall: "s", offset: Math.max(1, Math.round(foyerW / 2)) },
  ];

  for (let i = 1; i < bedrooms; i++) {
    const r = rooms.find((rm) => rm.id === `bed-${i}`);
    if (r) doors.push({ roomId: r.id, wall: "e", offset: Math.max(1, Math.round(r.h / 2)) });
  }
  for (let i = 0; i < bathrooms; i++) {
    const r = rooms.find((rm) => rm.id === `bath-${i}`);
    if (r) doors.push({ roomId: r.id, wall: "w", offset: Math.max(1, Math.round(r.h / 2)) });
  }

  const windows: Window[] = [
    { roomId: "master", wall: "n", offset: Math.max(1, Math.round(masterW / 2)), width: 2 },
    { roomId: "living", wall: "e", offset: Math.max(1, Math.round(livingH / 2)), width: 3 },
    { roomId: "kitchen", wall: "s", offset: Math.max(1, Math.round(liveTotalW / 2)), width: 2 },
  ];

  for (let i = 1; i < bedrooms; i++) {
    const r = rooms.find((rm) => rm.id === `bed-${i}`);
    if (r) windows.push({ roomId: r.id, wall: "n", offset: Math.max(1, Math.round(r.w / 2)), width: 2 });
  }

  return { width: w, height: h, rooms, doors, windows, cellSize: CELL_PX };
}

export function floorPlanToSvg(plan: FloorPlan): string {
  const { width, height, rooms, doors, windows, cellSize } = plan;
  const svgW = width * cellSize + PAD * 2;
  const svgH = height * cellSize + PAD * 2;

  const fills = ["#f7f5f0", "#edeae4", "#f2f0ea", "#e8e6e0"];

  function cx(r: Room) { return PAD + r.x * cellSize; }
  function cy(r: Room) { return PAD + r.y * cellSize; }

  let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${svgW} ${svgH}" width="100%" height="100%" style="background:#faf9f6;border-radius:16px;">`;

  rooms.forEach((r, i) => {
    const fill = fills[i % fills.length];
    svg += `  <rect x="${cx(r)}" y="${cy(r)}" width="${r.w * cellSize}" height="${r.h * cellSize}" fill="${fill}" stroke="none"/>
`;
  });

  windows.forEach((win) => {
    const r = rooms.find((rm) => rm.id === win.roomId);
    if (!r) return;
    const rx = cx(r);
    const ry = cy(r);
    const rw = r.w * cellSize;
    const rh = r.h * cellSize;
    const winW = win.width * cellSize;
    const off = win.offset * cellSize;

    let x1 = 0, y1 = 0, x2 = 0, y2 = 0;
    switch (win.wall) {
      case "n": x1 = rx + off - winW / 2; y1 = ry; x2 = rx + off + winW / 2; y2 = ry; break;
      case "s": x1 = rx + off - winW / 2; y1 = ry + rh; x2 = rx + off + winW / 2; y2 = ry + rh; break;
      case "e": x1 = rx + rw; y1 = ry + off - winW / 2; x2 = rx + rw; y2 = ry + off + winW / 2; break;
      case "w": x1 = rx; y1 = ry + off - winW / 2; x2 = rx; y2 = ry + off + winW / 2; break;
    }
    svg += `  <line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#0a0a0f" stroke-width="2" stroke-dasharray="4 3"/>
`;
  });

  doors.forEach((door) => {
    const r = rooms.find((rm) => rm.id === door.roomId);
    if (!r) return;
    const rx = cx(r);
    const ry = cy(r);
    const rw = r.w * cellSize;
    const rh = r.h * cellSize;
    const off = door.offset * cellSize;
    const swing = cellSize * 1.2;

    let d = "";
    switch (door.wall) {
      case "n": d = `M ${rx + off} ${ry} A ${swing} ${swing} 0 0 1 ${rx + off - swing} ${ry - swing}`; break;
      case "s": d = `M ${rx + off} ${ry + rh} A ${swing} ${swing} 0 0 0 ${rx + off + swing} ${ry + rh + swing}`; break;
      case "e": d = `M ${rx + rw} ${ry + off} A ${swing} ${swing} 0 0 0 ${rx + rw + swing} ${ry + off + swing}`; break;
      case "w": d = `M ${rx} ${ry + off} A ${swing} ${swing} 0 0 1 ${rx - swing} ${ry + off + swing}`; break;
    }
    svg += `  <path d="${d}" fill="none" stroke="#0a0a0f" stroke-width="1.5" opacity="0.6"/>
`;

    let gapX1 = 0, gapY1 = 0, gapX2 = 0, gapY2 = 0;
    const gap = cellSize * 0.7;
    switch (door.wall) {
      case "n": gapX1 = rx + off - gap / 2; gapY1 = ry; gapX2 = rx + off + gap / 2; gapY2 = ry; break;
      case "s": gapX1 = rx + off - gap / 2; gapY1 = ry + rh; gapX2 = rx + off + gap / 2; gapY2 = ry + rh; break;
      case "e": gapX1 = rx + rw; gapY1 = ry + off - gap / 2; gapX2 = rx + rw; gapY2 = ry + off + gap / 2; break;
      case "w": gapX1 = rx; gapY1 = ry + off - gap / 2; gapX2 = rx; gapY2 = ry + off + gap / 2; break;
    }
    svg += `  <line x1="${gapX1}" y1="${gapY1}" x2="${gapX2}" y2="${gapY2}" stroke="#faf9f6" stroke-width="3"/>
`;
  });

  rooms.forEach((r) => {
    svg += `  <rect x="${cx(r)}" y="${cy(r)}" width="${r.w * cellSize}" height="${r.h * cellSize}" fill="none" stroke="#0a0a0f" stroke-width="3"/>
`;
  });

  rooms.forEach((r) => {
    const labelX = cx(r) + (r.w * cellSize) / 2;
    const labelY = cy(r) + (r.h * cellSize) / 2;
    const ftW = r.w * 2;
    const ftH = r.h * 2;
    svg += `  <text x="${labelX}" y="${labelY - 4}" text-anchor="middle" font-family="var(--font-header), sans-serif" font-size="11" fill="#0a0a0f" font-weight="600">${r.label}</text>
`;
    svg += `  <text x="${labelX}" y="${labelY + 9}" text-anchor="middle" font-family="var(--font-ui), monospace" font-size="9" fill="#5d616d">${ftW}' x ${ftH}'</text>
`;
  });

  const crX = svgW - PAD - 20;
  const crY = PAD + 20;
  svg += `  <g transform="translate(${crX}, ${crY})">
`;
  svg += `    <circle cx="0" cy="0" r="12" fill="none" stroke="#0a0a0f" stroke-width="1.2" opacity="0.25"/>
`;
  svg += `    <text x="0" y="-15" text-anchor="middle" font-family="var(--font-ui)" font-size="8" fill="#0a0a0f" opacity="0.4" font-weight="600">N</text>
`;
  svg += `    <line x1="0" y1="-12" x2="0" y2="12" stroke="#0a0a0f" stroke-width="1" opacity="0.25"/>
`;
  svg += `    <line x1="-12" y1="0" x2="12" y2="0" stroke="#0a0a0f" stroke-width="1" opacity="0.25"/>
`;
  svg += `  </g>
`;

  svg += `  <text x="${PAD + (width * cellSize) / 2}" y="${svgH - 6}" text-anchor="middle" font-family="var(--font-ui)" font-size="9" fill="#5d616d">${width * 2}'</text>
`;
  svg += `  <text x="8" y="${PAD + (height * cellSize) / 2}" text-anchor="middle" font-family="var(--font-ui)" font-size="9" fill="#5d616d" writing-mode="tb">${height * 2}'</text>
`;

  svg += "</svg>";
  return svg;
}
