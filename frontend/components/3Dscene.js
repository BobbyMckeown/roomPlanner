import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
 
// A scene requires 3 objects a camera, a renderer, and the scene itself


//scene is a container that holds all objects, lights, and cameras
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xd9e0ec);  // light grey so you can tell it loaded

// camera setup perspective camera mimics human eye viewing, with parameters for field of view, aspect ratio, and near/far clipping planes
const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
camera.position.set(0, 5, 8);   // elevated and pulled back so you look down at the floor
camera.lookAt(0, 0, 0);

//renderer draws the scene from the perspective of the camera onto a canvas element in the HTML document
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);   // adds the <canvas> to the page

// orbit controls let you click-drag to rotate, scroll to zoom
const controls = new OrbitControls(camera, renderer.domElement);

// ── Lighting ──
// ambient gives a base level of light so nothing is pure black
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);

// directional simulates sunlight from one direction
const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
dirLight.position.set(5, 10, 5);
scene.add(dirLight);

// ── Floor plane ──
// a flat 10x10 plane so you have something to see
const floorGeometry = new THREE.PlaneGeometry(10, 10);
const floorMaterial = new THREE.MeshStandardMaterial({ color: 0xf0f4ff, side: THREE.DoubleSide });
const floor = new THREE.Mesh(floorGeometry, floorMaterial);
floor.rotation.x = -Math.PI / 2;   // rotate flat (PlaneGeometry faces +Z by default)
scene.add(floor);

// ── Render loop ──
// this runs every frame (~60fps) so the scene stays interactive
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}
animate();

// handle window resize so the canvas stays full-screen
window.addEventListener('resize', function () {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

