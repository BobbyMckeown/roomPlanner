// ── GLTF Preview: renders a top-down snapshot of a GLTF model ──
// This is an ES module - uses static imports so Three.js is ready before any user interaction.

import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

var gltfPreviewCache = {};

/**
 * Render a top-down preview of a GLTF/GLB model.
 * @param {string} modelPath - URL to the .gltf/.glb file
 * @param {number} width - desired output width in pixels
 * @param {number} height - desired output height in pixels
 * @returns {Promise<string>} - data URL of the rendered image
 */
function renderGltfPreview(modelPath, width, height, angled) {
  var cacheKey = modelPath + (angled ? '_angled' : '_top');
  if (gltfPreviewCache[cacheKey]) {
    return Promise.resolve(gltfPreviewCache[cacheKey]);
  }

  return new Promise(function (resolve, reject) {
    var renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      preserveDrawingBuffer: true  // required so toDataURL() captures the frame
    });
    renderer.setSize(width, height);
    renderer.setClearColor(0x000000, 0);

    var scene = new THREE.Scene();

    var aspect = width / height;
    var camSize = 2;
    var camera = new THREE.OrthographicCamera(
      -camSize * aspect, camSize * aspect,
      camSize, -camSize,
      0.1, 100
    );
    camera.position.set(0, 10, 0);
    camera.lookAt(0, 0, 0);

    scene.add(new THREE.AmbientLight(0xffffff, 0.8));
    var dirLight = new THREE.DirectionalLight(0xffffff, 0.6);
    dirLight.position.set(2, 10, 2);
    scene.add(dirLight);

    var loader = new GLTFLoader();
    loader.load(modelPath, function (gltf) {
      var model = gltf.scene;
      scene.add(model);

      var box = new THREE.Box3().setFromObject(model);
      var center = box.getCenter(new THREE.Vector3());
      var size = box.getSize(new THREE.Vector3());
      model.position.sub(center);

      var maxDim = Math.max(size.x, size.y, size.z);
      var padding = angled ? 1.4 : 1.2;
      camSize = (maxDim * padding) / 2;
      camera.left = -camSize * aspect;
      camera.right = camSize * aspect;
      camera.top = camSize;
      camera.bottom = -camSize;
      if (angled) {
        camera.position.set(maxDim * 0.3, maxDim * 1.0, maxDim * 0.5);
      } else {
        camera.position.set(0, maxDim * 1.0, 0);
      }
      camera.lookAt(0, 0, 0);
      camera.updateProjectionMatrix();

      renderer.render(scene, camera);
      var dataUrl = renderer.domElement.toDataURL('image/png');

      gltfPreviewCache[cacheKey] = dataUrl;
      renderer.dispose();
      resolve(dataUrl);
    }, undefined, function (error) {
      renderer.dispose();
      reject(error);
    });
  });
}

// Expose globally so non-module scripts can use it
window.renderGltfPreview = renderGltfPreview;
