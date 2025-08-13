export interface InputState {
  keys: { w: boolean; a: boolean; s: boolean; d: boolean };
  direction: number;
  lastDirection: number;
  isMouseControlling: boolean;
  yaw: number;
  pitch: number;
}

export interface InputHandler {
  getState: () => InputState;
  lastDirection: number;
}

export function setupInputHandler(): InputHandler {
  const keys: { w: boolean; a: boolean; s: boolean; d: boolean } = { w: false, a: false, s: false, d: false };
  let direction: number = 0;
  let lastDirection: number = 0;
  // const cameraDistance: number = 7.07;
  let yaw: number = Math.PI / 4;
  let pitch: number = Math.PI / 6;
  const mouseSensitivity: number = 0.002;
  let isMouseControlling: boolean = false;

  document.addEventListener('keydown', (event: KeyboardEvent) => {
    if (event.key === 's') { keys.s = true; direction = 0; }
    if (event.key === 'w') { keys.w = true; direction = 1; }
    if (event.key === 'a') { keys.a = true; direction = 2; }
    if (event.key === 'd') { keys.d = true; direction = 3; }
  });

  document.addEventListener('keyup', (event: KeyboardEvent) => {
    if (event.key === 's') keys.s = false;
    if (event.key === 'w') keys.w = false;
    if (event.key === 'a') keys.a = false;
    if (event.key === 'd') keys.d = false;
  });

  document.addEventListener('mousedown', (event: MouseEvent) => {
    if (event.button === 0) {
      isMouseControlling = true;
    }
  });

  document.addEventListener('mouseup', (event: MouseEvent) => {
    if (event.button === 0) {
      isMouseControlling = false;
    }
  });

  document.addEventListener('mousemove', (event: MouseEvent) => {
    if (isMouseControlling) {
      yaw -= event.movementX * mouseSensitivity;
      pitch -= event.movementY * mouseSensitivity;
      pitch = Math.max(Math.PI / 18, Math.min(Math.PI / 2 - Math.PI / 18, pitch));
    }
  });

  function getState(): InputState {
    return { keys, direction, lastDirection, isMouseControlling, yaw, pitch };
  }

  return { getState, lastDirection };
}