import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const SCALE = 0.02; // must match 3DrenderRoom.js

// Load GLTF furniture models and place them in the scene
export function loadFurniture(scene) {
  const items = JSON.parse(localStorage.getItem('roomFurniture') || '[]');
  if (items.length === 0) return;

  // Calculate the centring offset so furniture matches the room origin
  const raw = JSON.parse(localStorage.getItem('roomPoints') || '[]');
  let cx = 0, cz = 0;
  const count = raw.length / 2;
  if (count > 0) {
    for (let i = 0; i < raw.length; i += 2) {
      cx += raw[i] * SCALE;
      cz += raw[i + 1] * SCALE;
    }
    cx /= count;
    cz /= count;
  }

  const loader = new GLTFLoader();

  items.forEach(item => {
    if (!item.modelPath) return;

    loader.load(
      item.modelPath,
      function (gltf) {
        const model = gltf.scene;

        // Measure the model to position it correctly
        const box = new THREE.Box3().setFromObject(model);

        // Convert centre of furniture from canvas coords to 3D coords
        const x3d = item.x * SCALE - cx;
        const z3d = item.y * SCALE - cz;

        // Position the model so its bottom sits on the floor (y=0)
        model.position.set(x3d, -box.min.y, z3d);

        scene.add(model);
      },
      undefined,
      function (err) {
        console.warn('Failed to load GLTF:', item.modelPath, err);
      }
    );
  });
}
