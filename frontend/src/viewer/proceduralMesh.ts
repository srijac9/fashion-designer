import type {
  CameraPreset,
  GarmentBlueprint,
  ModelArtworkBindings,
  ModelMaterialBindings,
} from "../api/client";

export interface Vec3 {
  x: number;
  y: number;
  z: number;
}

export interface MeshTriangle {
  id: string;
  points: [number, number][];
  fill: string;
  depth: number;
}

export interface ProjectedArtwork {
  side: "front" | "back";
  points: [number, number][];
  color: string;
  label: string;
}

export interface ProjectedScene {
  triangles: MeshTriangle[];
  artwork: ProjectedArtwork[];
  mannequin: [number, number][];
}

interface MeshData {
  positions: Vec3[];
  indices: number[];
}

type RowPrefix = "hem" | "hip" | "waist" | "chest" | "underarm";

const LIGHT_DIRECTION = normalize({ x: -0.35, y: 0.72, z: 0.58 });
const VIEWBOX_WIDTH = 340;
const VIEWBOX_HEIGHT = 420;

export function buildProjectedScene(args: {
  blueprint: GarmentBlueprint;
  camera: CameraPreset;
  materialBindings: ModelMaterialBindings;
  artworkBindings: ModelArtworkBindings;
}): ProjectedScene {
  const mesh = buildMesh(args.blueprint);
  const bounds = getBounds(mesh.positions);
  const center = {
    x: (bounds.minX + bounds.maxX) / 2,
    y: (bounds.minY + bounds.maxY) / 2,
    z: (bounds.minZ + bounds.maxZ) / 2,
  };

  const cameraState = createCamera(args.camera, center, bounds);
  const triangles: MeshTriangle[] = [];

  for (let index = 0; index < mesh.indices.length; index += 3) {
    const ia = mesh.indices[index];
    const ib = mesh.indices[index + 1];
    const ic = mesh.indices[index + 2];
    if (ia === undefined || ib === undefined || ic === undefined) {
      continue;
    }

    const a = mesh.positions[ia];
    const b = mesh.positions[ib];
    const c = mesh.positions[ic];
    if (!a || !b || !c) {
      continue;
    }

    const projectedA = projectPoint(a, cameraState);
    const projectedB = projectPoint(b, cameraState);
    const projectedC = projectPoint(c, cameraState);

    if (!projectedA || !projectedB || !projectedC) {
      continue;
    }

    const normal = normalize(cross(subtract(b, a), subtract(c, a)));
    const shade = Math.max(0.38, 0.55 + dot(normal, LIGHT_DIRECTION) * 0.28);
    const fill = shadeHex(args.materialBindings.fabricBaseColor, shade);
    const faceDepth = (projectedA.depth + projectedB.depth + projectedC.depth) / 3;

    triangles.push({
      id: `tri-${index / 3}`,
      points: [projectedA.point, projectedB.point, projectedC.point],
      fill,
      depth: faceDepth,
    });
  }

  triangles.sort((left, right) => left.depth - right.depth);

  return {
    triangles,
    artwork: projectArtwork(args.blueprint, args.artworkBindings, cameraState, bounds),
    mannequin: buildMannequinSilhouette(cameraState, bounds),
  };
}

function buildMesh(blueprint: GarmentBlueprint): MeshData {
  const family = blueprint.family;
  const m = blueprint.measurements;
  const scale = 0.01;
  const chest = m.chestWidth * scale;
  const waist = m.waistWidth * scale;
  const hem = m.hemWidth * scale;
  const bodyLength = m.bodyLength * scale;
  const shoulder = m.shoulderWidth * scale;
  const neckWidth = m.necklineWidth * scale;
  const frontNeckDepth = m.necklineDepth * scale;
  const backNeckDepth = Math.max(0.025, frontNeckDepth * 0.38);
  const thickness = 0.06;
  const halfThickness = thickness / 2;
  const hip = waist * 0.52 + hem * 0.48;
  const hemY = 0;
  const hipY = bodyLength * 0.18;
  const waistY = bodyLength * 0.42;
  const chestY = bodyLength * 0.63;
  const underarmY = bodyLength * 0.79;
  const shoulderY = bodyLength * 0.955;
  const neckTopY = bodyLength;
  const frontNeckY = Math.max(neckTopY - frontNeckDepth, bodyLength * 0.78);
  const backNeckY = Math.max(neckTopY - backNeckDepth, bodyLength * 0.88);

  const front = {
    hemL: vec3(-hem / 2, hemY, halfThickness),
    hipL: vec3(-hip / 2, hipY, halfThickness),
    waistL: vec3(-waist / 2, waistY, halfThickness),
    chestL: vec3(-chest / 2, chestY, halfThickness),
    underarmL: vec3(-chest * 0.56, underarmY, halfThickness),
    shoulderL: vec3(-shoulder / 2, shoulderY, halfThickness),
    neckOuterL: vec3(-neckWidth * 0.58, neckTopY - frontNeckDepth * 0.08, halfThickness),
    neckMidL: vec3(-neckWidth * 0.32, neckTopY - frontNeckDepth * 0.36, halfThickness),
    neckC: vec3(0, frontNeckY, halfThickness),
    neckMidR: vec3(neckWidth * 0.32, neckTopY - frontNeckDepth * 0.36, halfThickness),
    neckOuterR: vec3(neckWidth * 0.58, neckTopY - frontNeckDepth * 0.08, halfThickness),
    shoulderR: vec3(shoulder / 2, shoulderY, halfThickness),
    underarmR: vec3(chest * 0.56, underarmY, halfThickness),
    chestR: vec3(chest / 2, chestY, halfThickness),
    waistR: vec3(waist / 2, waistY, halfThickness),
    hipR: vec3(hip / 2, hipY, halfThickness),
    hemR: vec3(hem / 2, hemY, halfThickness),
  };

  const back = {
    hemL: vec3(-hem / 2, hemY, -halfThickness),
    hipL: vec3(-hip / 2, hipY, -halfThickness),
    waistL: vec3(-waist / 2, waistY, -halfThickness),
    chestL: vec3(-chest / 2, chestY, -halfThickness),
    underarmL: vec3(-chest * 0.55, underarmY, -halfThickness),
    shoulderL: vec3(-shoulder / 2, shoulderY, -halfThickness),
    neckOuterL: vec3(-neckWidth * 0.6, neckTopY - backNeckDepth * 0.06, -halfThickness),
    neckMidL: vec3(-neckWidth * 0.34, neckTopY - backNeckDepth * 0.28, -halfThickness),
    neckC: vec3(0, backNeckY, -halfThickness),
    neckMidR: vec3(neckWidth * 0.34, neckTopY - backNeckDepth * 0.28, -halfThickness),
    neckOuterR: vec3(neckWidth * 0.6, neckTopY - backNeckDepth * 0.06, -halfThickness),
    shoulderR: vec3(shoulder / 2, shoulderY, -halfThickness),
    underarmR: vec3(chest * 0.55, underarmY, -halfThickness),
    chestR: vec3(chest / 2, chestY, -halfThickness),
    waistR: vec3(waist / 2, waistY, -halfThickness),
    hipR: vec3(hip / 2, hipY, -halfThickness),
    hemR: vec3(hem / 2, hemY, -halfThickness),
  };

  const positions: Vec3[] = [];
  const indices: number[] = [];

  const addVertex = (vertex: Vec3) => {
    positions.push(vertex);
    return positions.length - 1;
  };

  const frontIndex = Object.fromEntries(
    Object.entries(front).map(([key, value]) => [key, addVertex(value)]),
  ) as Record<keyof typeof front, number>;
  const backIndex = Object.fromEntries(
    Object.entries(back).map(([key, value]) => [key, addVertex(value)]),
  ) as Record<keyof typeof back, number>;

  const tri = (a: number, b: number, c: number) => {
    indices.push(a, b, c);
  };

  const quad = (a: number, b: number, c: number, d: number) => {
    tri(a, b, c);
    tri(a, c, d);
  };

  const lowerPairs: [RowPrefix, RowPrefix][] = [
    ["hem", "hip"],
    ["hip", "waist"],
    ["waist", "chest"],
    ["chest", "underarm"],
  ];
  const leftKey = (row: RowPrefix) => `${row}L` as const;
  const rightKey = (row: RowPrefix) => `${row}R` as const;
  for (const [lower, upper] of lowerPairs) {
    quad(
      frontIndex[leftKey(lower)],
      frontIndex[rightKey(lower)],
      frontIndex[rightKey(upper)],
      frontIndex[leftKey(upper)],
    );
    quad(
      backIndex[leftKey(lower)],
      backIndex[leftKey(upper)],
      backIndex[rightKey(upper)],
      backIndex[rightKey(lower)],
    );
  }

  const frontUpperCenter = addVertex(vec3(0, bodyLength * 0.78, halfThickness));
  const backUpperCenter = addVertex(vec3(0, bodyLength * 0.8, -halfThickness));

  const frontTopChain = [
    frontIndex.underarmL,
    frontIndex.shoulderL,
    frontIndex.neckOuterL,
    frontIndex.neckMidL,
    frontIndex.neckC,
    frontIndex.neckMidR,
    frontIndex.neckOuterR,
    frontIndex.shoulderR,
    frontIndex.underarmR,
  ];
  const backTopChain = [
    backIndex.underarmL,
    backIndex.shoulderL,
    backIndex.neckOuterL,
    backIndex.neckMidL,
    backIndex.neckC,
    backIndex.neckMidR,
    backIndex.neckOuterR,
    backIndex.shoulderR,
    backIndex.underarmR,
  ];

  for (let index = 0; index < frontTopChain.length - 1; index += 1) {
    const frontStart = frontTopChain[index];
    const frontEnd = frontTopChain[index + 1];
    const backStart = backTopChain[index];
    const backEnd = backTopChain[index + 1];
    if (
      frontStart === undefined ||
      frontEnd === undefined ||
      backStart === undefined ||
      backEnd === undefined
    ) {
      continue;
    }
    tri(frontStart, frontEnd, frontUpperCenter);
    tri(backEnd, backStart, backUpperCenter);
  }

  const frontLoop = [
    frontIndex.hemL,
    frontIndex.hipL,
    frontIndex.waistL,
    frontIndex.chestL,
    frontIndex.underarmL,
    frontIndex.shoulderL,
    frontIndex.neckOuterL,
    frontIndex.neckMidL,
    frontIndex.neckC,
    frontIndex.neckMidR,
    frontIndex.neckOuterR,
    frontIndex.shoulderR,
    frontIndex.underarmR,
    frontIndex.chestR,
    frontIndex.waistR,
    frontIndex.hipR,
    frontIndex.hemR,
  ];
  const backLoop = [
    backIndex.hemL,
    backIndex.hipL,
    backIndex.waistL,
    backIndex.chestL,
    backIndex.underarmL,
    backIndex.shoulderL,
    backIndex.neckOuterL,
    backIndex.neckMidL,
    backIndex.neckC,
    backIndex.neckMidR,
    backIndex.neckOuterR,
    backIndex.shoulderR,
    backIndex.underarmR,
    backIndex.chestR,
    backIndex.waistR,
    backIndex.hipR,
    backIndex.hemR,
  ];

  for (let index = 0; index < frontLoop.length - 1; index += 1) {
    const frontStart = frontLoop[index];
    const frontEnd = frontLoop[index + 1];
    const backEnd = backLoop[index + 1];
    const backStart = backLoop[index];
    if (
      frontStart === undefined ||
      frontEnd === undefined ||
      backEnd === undefined ||
      backStart === undefined
    ) {
      continue;
    }
    quad(frontStart, frontEnd, backEnd, backStart);
  }

  quad(frontIndex.hemL, frontIndex.hemR, backIndex.hemR, backIndex.hemL);

  const sleeveLength = m.sleeveLength * scale;
  if (family !== "tank" && sleeveLength > 0.05) {
    const sleeveDrop = family === "tee" ? 0.035 : 0.055;
    const sleeveHeight = family === "tee" ? 0.16 : 0.14;
    const sleeveOpening = Math.max(0.08, m.sleeveOpeningWidth * scale);
    appendSleeve({
      positions,
      indices,
      side: "left",
      shoulderOuter: vec3(-shoulder / 2, shoulderY - 0.012, 0),
      sleeveLength,
      sleeveHeight,
      sleeveOpening,
      halfThickness,
      sleeveDrop,
    });
    appendSleeve({
      positions,
      indices,
      side: "right",
      shoulderOuter: vec3(shoulder / 2, shoulderY - 0.012, 0),
      sleeveLength,
      sleeveHeight,
      sleeveOpening,
      halfThickness,
      sleeveDrop,
    });
  }

  return { positions, indices };
}

function appendSleeve(args: {
  positions: Vec3[];
  indices: number[];
  side: "left" | "right";
  shoulderOuter: Vec3;
  sleeveLength: number;
  sleeveHeight: number;
  sleeveOpening: number;
  halfThickness: number;
  sleeveDrop: number;
}) {
  const sign = args.side === "left" ? -1 : 1;
  const x0 = args.shoulderOuter.x;
  const y0 = args.shoulderOuter.y;
  const x1 = x0 + sign * args.sleeveLength * 0.96;
  const y1 = y0 - args.sleeveDrop - args.sleeveLength * 0.08;
  const rootRadiusY = args.sleeveHeight * 0.52;
  const rootRadiusZ = args.halfThickness * 1.55;
  const cuffRadiusY = Math.max(args.sleeveOpening * 0.46, args.sleeveHeight * 0.28);
  const cuffRadiusZ = args.halfThickness * 1.22;
  const segments = 10;
  const rootRing: number[] = [];
  const cuffRing: number[] = [];

  for (let index = 0; index < segments; index += 1) {
    const angle = (Math.PI * 2 * index) / segments;
    const cosAngle = Math.cos(angle);
    const sinAngle = Math.sin(angle);
    rootRing.push(args.positions.length);
    args.positions.push(vec3(x0, y0 + cosAngle * rootRadiusY, sinAngle * rootRadiusZ));
    cuffRing.push(args.positions.length);
    args.positions.push(vec3(x1, y1 + cosAngle * cuffRadiusY, sinAngle * cuffRadiusZ));
  }

  for (let index = 0; index < segments; index += 1) {
    const next = (index + 1) % segments;
    const a = rootRing[index];
    const b = rootRing[next];
    const c = cuffRing[next];
    const d = cuffRing[index];
    if (a === undefined || b === undefined || c === undefined || d === undefined) {
      continue;
    }
    args.indices.push(a, b, c, a, c, d);
  }

  const cuffCenter = args.positions.length;
  args.positions.push(vec3(x1, y1, 0));
  for (let index = 0; index < segments; index += 1) {
    const next = (index + 1) % segments;
    const current = cuffRing[index];
    const nextIndex = cuffRing[next];
    if (current === undefined || nextIndex === undefined) {
      continue;
    }
    if (args.side === "left") {
      args.indices.push(cuffCenter, current, nextIndex);
    } else {
      args.indices.push(cuffCenter, nextIndex, current);
    }
  }
}

function projectArtwork(
  blueprint: GarmentBlueprint,
  artworkBindings: ModelArtworkBindings,
  cameraState: CameraState,
  bounds: Bounds,
): ProjectedArtwork[] {
  const showingBack = Math.abs(normalizeDegrees(cameraState.yaw) - 180) < 65;
  const side = showingBack ? "back" : "front";
  const visible =
    side === "front" ? artworkBindings.frontArtworkVisible : artworkBindings.backArtworkVisible;
  const artworkPath =
    side === "front" ? artworkBindings.frontArtworkPath : artworkBindings.backArtworkPath;

  if (!visible || !artworkPath) {
    return [];
  }

  const zone = blueprint.artworkZones.find((item) => item.side === side);
  if (!zone) {
    return [];
  }

  const [x = 0.25, y = 0.2, width = 0.5, height = 0.4] = zone.normalizedBounds;
  const panelWidth = bounds.maxX - bounds.minX;
  const panelHeight = bounds.maxY - bounds.minY;
  const z = side === "front" ? bounds.maxZ + 0.002 : bounds.minZ - 0.002;
  const startX = bounds.minX + panelWidth * x;
  const endX = startX + panelWidth * width;
  const topY = bounds.maxY - panelHeight * y;
  const bottomY = topY - panelHeight * height;

  const corners = [
    vec3(startX, topY, z),
    vec3(endX, topY, z),
    vec3(endX, bottomY, z),
    vec3(startX, bottomY, z),
  ]
    .map((point) => projectPoint(point, cameraState))
    .filter(Boolean) as { point: [number, number]; depth: number }[];

  if (corners.length !== 4) {
    return [];
  }

  return [
    {
      side,
      points: corners.map((corner) => corner.point) as [number, number][],
      color: zone.artworkColor ?? "#ffffff",
      label: side === "front" ? "Front" : "Back",
    },
  ];
}

function buildMannequinSilhouette(cameraState: CameraState, bounds: Bounds): [number, number][] {
  const bodyWidth = (bounds.maxX - bounds.minX) * 0.78;
  const bodyHeight = (bounds.maxY - bounds.minY) * 1.32;
  const centerX = 0;
  const centerY = bounds.minY + bodyHeight * 0.47;
  const depth = 0;
  const points = [
    vec3(centerX - bodyWidth * 0.28, centerY + bodyHeight * 0.48, depth),
    vec3(centerX - bodyWidth * 0.38, centerY + bodyHeight * 0.18, depth),
    vec3(centerX - bodyWidth * 0.34, centerY - bodyHeight * 0.18, depth),
    vec3(centerX - bodyWidth * 0.2, centerY - bodyHeight * 0.48, depth),
    vec3(centerX + bodyWidth * 0.2, centerY - bodyHeight * 0.48, depth),
    vec3(centerX + bodyWidth * 0.34, centerY - bodyHeight * 0.18, depth),
    vec3(centerX + bodyWidth * 0.38, centerY + bodyHeight * 0.18, depth),
    vec3(centerX + bodyWidth * 0.28, centerY + bodyHeight * 0.48, depth),
  ];

  return points
    .map((point) => projectPoint(point, cameraState))
    .filter(isProjectedPoint)
    .map((projected) => projected.point);
}

interface CameraState {
  cameraPosition: Vec3;
  target: Vec3;
  right: Vec3;
  up: Vec3;
  forward: Vec3;
  focalLength: number;
  centerX: number;
  centerY: number;
  yaw: number;
}

interface Bounds {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  minZ: number;
  maxZ: number;
}

function createCamera(camera: CameraPreset, center: Vec3, bounds: Bounds): CameraState {
  const yaw = (camera.yaw * Math.PI) / 180;
  const pitch = (camera.pitch * Math.PI) / 180;
  const size = Math.max(bounds.maxY - bounds.minY, bounds.maxX - bounds.minX);
  const radius = Math.max(1.6, camera.distance) * Math.max(0.7, size);
  const target = vec3(center.x, center.y * 0.9, center.z);
  const cameraPosition = vec3(
    target.x + Math.sin(yaw) * Math.cos(pitch) * radius,
    target.y + Math.sin(pitch) * radius * 0.78,
    target.z + Math.cos(yaw) * Math.cos(pitch) * radius,
  );
  const forward = normalize(subtract(target, cameraPosition));
  const worldUp = vec3(0, 1, 0);
  const right = normalize(cross(worldUp, forward));
  const up = normalize(cross(forward, right));

  return {
    cameraPosition,
    target,
    right,
    up,
    forward,
    focalLength: 320,
    centerX: VIEWBOX_WIDTH / 2,
    centerY: VIEWBOX_HEIGHT / 2 + 12,
    yaw: normalizeDegrees(camera.yaw),
  };
}

function projectPoint(point: Vec3, camera: CameraState) {
  const relative = subtract(point, camera.cameraPosition);
  const x = dot(relative, camera.right);
  const y = dot(relative, camera.up);
  const z = dot(relative, camera.forward);

  if (z <= 0.01) {
    return null;
  }

  const scale = camera.focalLength / z;
  return {
    point: [camera.centerX + x * scale, camera.centerY - y * scale] as [number, number],
    depth: z,
  };
}

function isProjectedPoint(
  value: ReturnType<typeof projectPoint>,
): value is { point: [number, number]; depth: number } {
  return value !== null;
}

function getBounds(points: Vec3[]): Bounds {
  const xs = points.map((point) => point.x);
  const ys = points.map((point) => point.y);
  const zs = points.map((point) => point.z);
  return {
    minX: Math.min(...xs),
    maxX: Math.max(...xs),
    minY: Math.min(...ys),
    maxY: Math.max(...ys),
    minZ: Math.min(...zs),
    maxZ: Math.max(...zs),
  };
}

function shadeHex(color: string, intensity: number): string {
  const normalized = color.replace("#", "");
  if (normalized.length !== 6) {
    return color;
  }

  const clamp = (value: number) => Math.max(0, Math.min(255, Math.round(value)));
  const red = clamp(parseInt(normalized.slice(0, 2), 16) * intensity);
  const green = clamp(parseInt(normalized.slice(2, 4), 16) * intensity);
  const blue = clamp(parseInt(normalized.slice(4, 6), 16) * intensity);

  return `#${[red, green, blue].map((value) => value.toString(16).padStart(2, "0")).join("")}`;
}

function normalizeDegrees(angle: number): number {
  return ((angle % 360) + 360) % 360;
}

function vec3(x: number, y: number, z: number): Vec3 {
  return { x, y, z };
}

function subtract(a: Vec3, b: Vec3): Vec3 {
  return vec3(a.x - b.x, a.y - b.y, a.z - b.z);
}

function dot(a: Vec3, b: Vec3): number {
  return a.x * b.x + a.y * b.y + a.z * b.z;
}

function cross(a: Vec3, b: Vec3): Vec3 {
  return vec3(
    a.y * b.z - a.z * b.y,
    a.z * b.x - a.x * b.z,
    a.x * b.y - a.y * b.x,
  );
}

function normalize(vector: Vec3): Vec3 {
  const length = Math.sqrt(vector.x ** 2 + vector.y ** 2 + vector.z ** 2) || 1;
  return vec3(vector.x / length, vector.y / length, vector.z / length);
}

export const proceduralViewerLayout = {
  width: VIEWBOX_WIDTH,
  height: VIEWBOX_HEIGHT,
};
