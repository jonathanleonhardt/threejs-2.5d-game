import { BoxGeometry, Intersection, Mesh, MeshBasicMaterial, Raycaster, Scene, Vector3 } from 'three';
import { SpriteManager } from './spriteManager';

export interface MapManager {
  checkCollision: (newPosition: Vector3) => boolean;
}

export function createMapManager(scene: Scene, spriteManager: SpriteManager): MapManager {
  const wallGeometry: BoxGeometry = new BoxGeometry(1, 2, 1);
  const wallMaterial: MeshBasicMaterial = new MeshBasicMaterial({ color: 0x808080 });
  const walls: Mesh[] = [];
  const raycaster: Raycaster = new Raycaster();
  const tempPosition: Vector3 = new Vector3();

  function addWall(x: number, z: number): void {
    const wall: Mesh = new Mesh(wallGeometry, wallMaterial);
    wall.position.set(x, 0, z);
    scene.add(wall);
    walls.push(wall);
  }

  addWall(5, 0);
  addWall(4, 0);
  addWall(3, 0);
  addWall(-5, 0);
  addWall(0, 5);
  addWall(0, -5);

  function checkCollision(newPosition: Vector3): boolean {
    tempPosition.copy(newPosition);
    tempPosition.y = spriteManager.getPosition().y;
    const directionVector: Vector3 = tempPosition.sub(spriteManager.getPosition()).normalize();
    raycaster.set(spriteManager.getPosition(), directionVector);
    const intersects: Intersection[] = raycaster.intersectObjects(walls);
    return intersects.length > 0 && intersects[0].distance < spriteManager.moveSpeed * 2;
  }

  return { checkCollision };
}