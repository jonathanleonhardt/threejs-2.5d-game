import { Mesh, MeshBasicMaterial, PerspectiveCamera, PlaneGeometry, Scene, WebGLRenderer } from 'three';

export interface SceneSetup {
  scene: Scene;
  camera: PerspectiveCamera;
  renderer: WebGLRenderer;
}

export function setupScene(): SceneSetup {
  const scene: Scene = new Scene();
  const camera: PerspectiveCamera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  const renderer: WebGLRenderer = new WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  const floorGeometry: PlaneGeometry = new PlaneGeometry(50, 50);
  const floorMaterial: MeshBasicMaterial = new MeshBasicMaterial({ color: 0x338633 });
  const floor: Mesh = new Mesh(floorGeometry, floorMaterial);
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -1;
  scene.add(floor);

  // // Adicione luz ambiente para iluminar a cena
  // const ambientLight = new THREE.AmbientLight(0xffffff, 1.0);
  // scene.add(ambientLight);

  camera.position.set(0, 5, 5);
  camera.lookAt(0, 0, 0);

  return { scene, camera, renderer };
}