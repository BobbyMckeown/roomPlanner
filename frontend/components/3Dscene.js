import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { addRoomToScene } from './3DrenderRoom.js';

// ── Scene ──
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xd9e0ec);

// ── Camera ──
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 6, 8);
camera.lookAt(0, 0, 0);

// ── Renderer ──
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// ── Controls ──
const controls = new OrbitControls(camera, renderer.domElement);

// ── Lighting ──
scene.add(new THREE.AmbientLight(0xffffff, 0.6));
const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
dirLight.position.set(5, 10, 5);
scene.add(dirLight);

// ── Build the room (floor + walls) from saved 2D points ──
addRoomToScene(scene);

// ── Back button ──
const backBtn = document.createElement('button');
backBtn.textContent = '← Back to 2D';
Object.assign(backBtn.style, {
  position: 'absolute', top: '16px', left: '16px',
  padding: '8px 18px', fontSize: '14px', fontWeight: '600',
  background: '#1e1e2d', color: '#c9cdd4', border: '1px solid #3a3a50',
  borderRadius: '6px', cursor: 'pointer', zIndex: '10'
});
backBtn.addEventListener('click', () => window.location.href = 'index.html');
document.body.appendChild(backBtn);

// ── Render loop ──
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}
animate();

// ── Resize handler ──
window.addEventListener('resize', function () {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

