import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const WALL_HEIGHT = 2.5;   // metres
const WALL_THICKNESS = 0.1;
const SCALE = 0.02;        // 1 canvas pixel = 0.02 metres

// Read the 2D draw-points from localStorage and convert to 3D-ready coords
function getRoomPoints() {
  const raw = JSON.parse(localStorage.getItem('roomPoints') || '[]');
  const points = [];
  for (let i = 0; i < raw.length; i += 2) {
    points.push({ x: raw[i] * SCALE, z: raw[i + 1] * SCALE });
  }

  // Centre around the origin
  if (points.length > 0) {
    let cx = 0, cz = 0;
    points.forEach(p => { cx += p.x; cz += p.z; });
    cx /= points.length;
    cz /= points.length;
    points.forEach(p => { p.x -= cx; p.z -= cz; });
  }

  return points;
}

// Build the floor mesh from the polygon points
function buildFloor(points) {
  const shape = new THREE.Shape();
  shape.moveTo(points[0].x, -points[0].z);
  for (let i = 1; i < points.length; i++) {
    shape.lineTo(points[i].x, -points[i].z);
  }
  shape.closePath();

  const geo = new THREE.ShapeGeometry(shape);
  const floorColour = localStorage.getItem('floorColour') || '#8b4513';
  const mat = new THREE.MeshStandardMaterial({ color: floorColour, side: THREE.DoubleSide });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.rotation.x = -Math.PI / 2;
  return mesh;
}

// Build wall meshes for every edge of the polygon
function buildWalls(points) {
  const wallColour = localStorage.getItem('wallColour') || '#c0c0c0';
  const wallMat = new THREE.MeshStandardMaterial({ color: wallColour, side: THREE.DoubleSide });
  const walls = [];

  for (let i = 0; i < points.length; i++) {
    const a = points[i];
    const b = points[(i + 1) % points.length];

    const dx = b.x - a.x;
    const dz = b.z - a.z;
    const len = Math.sqrt(dx * dx + dz * dz);

    const geo = new THREE.BoxGeometry(len, WALL_HEIGHT, WALL_THICKNESS);
    const wall = new THREE.Mesh(geo, wallMat);
    wall.position.set((a.x + b.x) / 2, WALL_HEIGHT / 2, (a.z + b.z) / 2);
    wall.rotation.y = -Math.atan2(dz, dx);
    walls.push(wall);
  }

  return walls;
}

// Build a default 10x10 fallback floor
function buildFallbackFloor() {
  const geo = new THREE.PlaneGeometry(10, 10);
  const floorColour = localStorage.getItem('floorColour') || '#8b4513';
  const mat = new THREE.MeshStandardMaterial({ color: floorColour, side: THREE.DoubleSide });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.rotation.x = -Math.PI / 2;
  return mesh;
}

// Main entry: adds the room (floor + walls) to the given scene
export function addRoomToScene(scene) {
  const points = getRoomPoints();

  if (points.length >= 3) {
    scene.add(buildFloor(points));
    buildWalls(points).forEach(w => scene.add(w));
  } else {
    scene.add(buildFallbackFloor());
  }
}
