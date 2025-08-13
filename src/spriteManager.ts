import { Scene, Sprite, SpriteMaterial, Texture, TextureLoader, Vector3 } from 'three';

export interface SpriteManager {
  update: (direction: number, lastDirection: number, isMoving: boolean, lastFrameTime: number, frameDuration: number) => number;
  getPosition: () => Vector3;
  setPosition: (newPosition: Vector3) => void;
  moveSpeed: number;
}

export function createSpriteManager(scene: Scene): SpriteManager {
  const textureLoader: TextureLoader = new TextureLoader();

  const walkTextures: { [key: number]: Texture } = {
    0: textureLoader.load('/walk/GirlSample_Walk_Down.png'),
    1: textureLoader.load('/walk/GirlSample_Walk_Up.png'),
    2: textureLoader.load('/walk/GirlSample_Walk_Left.png'),
    3: textureLoader.load('/walk/GirlSample_Walk_Right.png')
  };
  Object.values(walkTextures).forEach((texture: Texture) => {
    texture.repeat.set(1 / 4, 1 / 3);
    texture.offset.set(0, 0);
  });
  const spriteWalkMaterial: SpriteMaterial = new SpriteMaterial({ map: walkTextures[0], color: 0xa3a3a3, transparent: true });
  const spriteWalk: Sprite = new Sprite(spriteWalkMaterial);
  spriteWalk.scale.set(6, 6, 6);
  spriteWalk.position.y = 0;
  scene.add(spriteWalk);
  spriteWalk.visible = false;

  const idleTextures: { [key: number]: Texture } = {
    0: textureLoader.load('/boost/GirlSample_Boost_Down.png'),
    1: textureLoader.load('/boost/GirlSample_Boost_UpLeft.png'),
    2: textureLoader.load('/boost/GirlSample_Boost_Left.png'),
    3: textureLoader.load('/boost/GirlSample_Boost_Right.png')
  };
  Object.values(idleTextures).forEach((texture: Texture) => {
    texture.repeat.set(1 / 4, 1 / 4);
    texture.offset.set(0, 0);
  });
  const spriteIdleMaterial: SpriteMaterial = new SpriteMaterial({ map: idleTextures[0], color: 0xa3a3a3, transparent: true });
  const spriteIdle: Sprite = new Sprite(spriteIdleMaterial);
  spriteIdle.scale.set(6, 6, 6);
  spriteIdle.position.y = 0;
  scene.add(spriteIdle);
  spriteIdle.visible = true;

  const numFramesWalk: number = 9;
  const numFramesIdle: number = 8;
  const moveSpeed: number = 0.03;
  let currentWalkFrame: number = 0;
  let currentIdleFrame: number = 0;

  function calculateWalkOffset(frame: number): { x: number; y: number } {
    let offsetY: number = 0;
    let offsetX: number = 0;
    if (frame < 4) {
      offsetY = 0;
      offsetX = frame / 4;
    } else if (frame < 8) {
      offsetY = 1 / 3;
      offsetX = (frame - 4) / 4;
    } else {
      offsetY = 2 / 3;
      offsetX = 0;
    }
    return { x: offsetX, y: offsetY };
  }

  function update(direction: number, lastDirection: number, isMoving: boolean, lastFrameTime: number, frameDuration: number): number {
    if (direction !== lastDirection) {
      spriteWalkMaterial.map = walkTextures[direction];
      spriteIdleMaterial.map = idleTextures[direction];
      currentWalkFrame = 0;
      currentIdleFrame = 0;
    }

    if (isMoving) {
      spriteWalk.visible = true;
      spriteIdle.visible = false;
      const now: number = Date.now();
      if (now - lastFrameTime > frameDuration) {
        currentWalkFrame = (currentWalkFrame + 1) % numFramesWalk;
        lastFrameTime = now;
      }
      const walkOffset: { x: number; y: number } = calculateWalkOffset(currentWalkFrame);
      spriteWalkMaterial.map?.offset.set(walkOffset.x, walkOffset.y);
    } else {
      spriteWalk.visible = false;
      spriteIdle.visible = true;
      const now: number = Date.now();
      if (now - lastFrameTime > frameDuration) {
        currentIdleFrame = (currentIdleFrame + 1) % numFramesIdle;
        lastFrameTime = now;
      }
      let offsetXY: { x: number; y: number } = { x: currentIdleFrame / 4, y: currentIdleFrame / 4 };
      spriteIdleMaterial.map?.offset.set(offsetXY.x, offsetXY.y);
    }

    return lastFrameTime;
  }

  function getPosition(): Vector3 {
    return spriteWalk.position;
  }

  function setPosition(newPosition: Vector3): void {
    spriteWalk.position.copy(newPosition);
    spriteIdle.position.copy(newPosition);
  }

  return { update, getPosition, setPosition, moveSpeed };
}