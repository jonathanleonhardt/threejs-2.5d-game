import { PerspectiveCamera, Vector3 } from 'three';
import { SpriteManager } from './spriteManager';

export interface CameraController {
  update: (yaw: number, pitch: number, spritePos: Vector3) => void;
}

export function createCameraController(camera: PerspectiveCamera, spriteManager: SpriteManager): CameraController {
  const cameraDistance: number = 7.07;

  function update(yaw: number, pitch: number, spritePos: Vector3): void {
    camera.position.x = spritePos.x + cameraDistance * Math.cos(yaw) * Math.cos(pitch);
    camera.position.y = spritePos.y + cameraDistance * Math.sin(pitch);
    camera.position.z = spritePos.z + cameraDistance * Math.sin(yaw) * Math.cos(pitch);
    camera.lookAt(spritePos);
  }

  return { update };
}