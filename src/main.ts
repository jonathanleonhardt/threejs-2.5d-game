import { Vector3 } from 'three';
import { CameraController, createCameraController } from './cameraController';
import { InputHandler, setupInputHandler } from './inputHandler';
import { createMapManager, MapManager } from './mapManager';
import { SceneSetup, setupScene } from './sceneSetup';
import { createSpriteManager, SpriteManager } from './spriteManager';

const { scene, camera, renderer }: SceneSetup = setupScene();
const spriteManager: SpriteManager = createSpriteManager(scene);
const inputHandler: InputHandler = setupInputHandler();
const cameraController: CameraController = createCameraController(camera, spriteManager);
const mapManager: MapManager = createMapManager(scene, spriteManager);

let lastFrameTime: number = Date.now();
const frameDuration: number = 120;

function animate(): void {
  requestAnimationFrame(animate);

  const { keys, direction, yaw, pitch } = inputHandler.getState();
  const isMoving: boolean = keys.w || keys.a || keys.s || keys.d;

  // Calcular direção relativa à câmera
  const forward: Vector3 = new Vector3();
  camera.getWorldDirection(forward);
  forward.y = 0;
  forward.normalize();
  const right: Vector3 = new Vector3().crossVectors(forward, new Vector3(0, 1, 0)).normalize();

  const newPosition: Vector3 = new Vector3().copy(spriteManager.getPosition());
  if (keys.w) newPosition.addScaledVector(forward, spriteManager.moveSpeed);
  if (keys.s) newPosition.addScaledVector(forward, -spriteManager.moveSpeed);
  if (keys.a) newPosition.addScaledVector(right, -spriteManager.moveSpeed);
  if (keys.d) newPosition.addScaledVector(right, spriteManager.moveSpeed);

  if (!mapManager.checkCollision(newPosition)) {
    spriteManager.setPosition(newPosition);
  }

  spriteManager.update(direction, inputHandler.lastDirection, isMoving, lastFrameTime, frameDuration);
  if (direction !== inputHandler.lastDirection) {
    inputHandler.lastDirection = direction;
  }

  cameraController.update(yaw, pitch, spriteManager.getPosition());

  const now: number = Date.now();
  if (now - lastFrameTime > frameDuration) {
    lastFrameTime = now;
  }

  renderer.render(scene, camera);
}

animate();