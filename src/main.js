import * as THREE from 'three';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const floorGeometry = new THREE.PlaneGeometry(50, 50);
const floorMaterial = new THREE.MeshBasicMaterial({ color: 0x338633 });
const floor = new THREE.Mesh(floorGeometry, floorMaterial);
floor.rotation.x = -Math.PI / 2;
floor.position.y = -1;
scene.add(floor);

// // Adicione luz ambiente para iluminar a cena
// const ambientLight = new THREE.AmbientLight(0xffffff, 1.0); // Luz branca, intensidade total
// scene.add(ambientLight);

const textureLoader = new THREE.TextureLoader();

const walkTextures = {
    0: textureLoader.load('/walk/GirlSample_Walk_Down.png'),
    1: textureLoader.load('/walk/GirlSample_Walk_Up.png'),
    2: textureLoader.load('/walk/GirlSample_Walk_Left.png'),
    3: textureLoader.load('/walk/GirlSample_Walk_Right.png')
};
Object.values(walkTextures).forEach(texture => {
    texture.repeat.set(1 / 4, 1 / 3);
    texture.offset.set(0, 0);
});
const spriteWalkMaterial = new THREE.SpriteMaterial({ map: walkTextures[0], color: 0xa3a3a3, transparent: true });
const spriteWalk = new THREE.Sprite(spriteWalkMaterial);
spriteWalk.scale.set(6, 6, 6);
spriteWalk.position.y = 0;
scene.add(spriteWalk);
spriteWalk.visible = false;

const idleTextures = {
    0: textureLoader.load('/boost/GirlSample_Boost_Down.png'),
    1: textureLoader.load('/boost/GirlSample_Boost_UpLeft.png'),
    2: textureLoader.load('/boost/GirlSample_Boost_Left.png'),
    3: textureLoader.load('/boost/GirlSample_Boost_Right.png')
};
Object.values(idleTextures).forEach(texture => {
    texture.repeat.set(1 / 4, 1 / 4);
    texture.offset.set(0, 0);
});
const spriteIdleMaterial = new THREE.SpriteMaterial({ map: idleTextures[0], color: 0xa3a3a3, transparent: true });
const spriteIdle = new THREE.Sprite(spriteIdleMaterial);
spriteIdle.scale.set(6, 6, 6);
spriteIdle.position.y = 0;
scene.add(spriteIdle);
spriteIdle.visible = true;

// Criar paredes
const wallGeometry = new THREE.BoxGeometry(1, 2, 1);
const wallMaterial = new THREE.MeshBasicMaterial({ color: 0x808080 });
const walls = [];

function addWall(x, z) {
    const wall = new THREE.Mesh(wallGeometry, wallMaterial);
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

const raycaster = new THREE.Raycaster();
const tempPosition = new THREE.Vector3();
function checkCollision(newPosition) {
    tempPosition.copy(newPosition);
    tempPosition.y = spriteWalk.position.y;
    const directionVector = tempPosition.sub(spriteWalk.position).normalize();
    raycaster.set(spriteWalk.position, directionVector);
    const intersects = raycaster.intersectObjects(walls);
    return intersects.length > 0 && intersects[0].distance - 1 < moveSpeed * 2; // Margem para colisão
}

let lastFrameTime = Date.now();
const numFramesWalk = 9;
const numFramesIdle = 8;
const frameDuration = 120;
let direction = 0;
let lastDirection = 0;
let currentWalkFrame = 0;
let currentIdleFrame = 0;

camera.position.set(0, 5, 5);
camera.lookAt(0, 0, 0);

const keys = { w: false, a: false, s: false, d: false };
const moveSpeed = 0.03;
document.addEventListener('keydown', (event) => {
    if (event.key === 's') { keys.s = true; direction = 0; }
    if (event.key === 'w') { keys.w = true; direction = 1; }
    if (event.key === 'a') { keys.a = true; direction = 2; }
    if (event.key === 'd') { keys.d = true; direction = 3; }
});
document.addEventListener('keyup', (event) => {
    if (event.key === 's') keys.s = false;
    if (event.key === 'w') keys.w = false;
    if (event.key === 'a') keys.a = false;
    if (event.key === 'd') keys.d = false;
});

// Adicionar variáveis para controle de câmera com mouse
const cameraDistance = 7.07; // Distância fixa (sqrt(5^2 + 5^2) ≈ 7.07)
let yaw = Math.PI / 4; // Ângulo horizontal inicial (45°)
let pitch = Math.PI / 6; // Ângulo vertical inicial (~30°)
const mouseSensitivity = 0.002; // Sensibilidade do mouse
let isMouseControlling = false; // Controle ativo com botão esquerdo

// Adicionar eventos de mouse
document.addEventListener('mousedown', (event) => {
    if (event.button === 0) { // Botão esquerdo
        isMouseControlling = true;
    }
});
document.addEventListener('mouseup', (event) => {
    if (event.button === 0) { // Botão esquerdo
        isMouseControlling = false;
    }
});
document.addEventListener('mousemove', (event) => {
    if (isMouseControlling) {
        yaw -= event.movementX * mouseSensitivity;
        pitch -= event.movementY * mouseSensitivity;
        pitch = Math.max(Math.PI / 18, Math.min(Math.PI / 2 - Math.PI / 18, pitch)); // Limita pitch entre 10° e 80°
    }
});

function calculateWalkOffset(frame) {
    let offsetY = 0;
    let offsetX = 0;
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

function animate() {
    requestAnimationFrame(animate);

    // Calcular direção relativa à câmera
    const forward = new THREE.Vector3();
    camera.getWorldDirection(forward);
    forward.y = 0; // Ignora componente Y para movimento no plano XZ
    forward.normalize();

    const right = new THREE.Vector3();
    right.crossVectors(forward, new THREE.Vector3(0, 1, 0)).normalize(); // Vetor direito perpendicular ao forward

    const newPosition = new THREE.Vector3(spriteWalk.position.x, spriteWalk.position.y, spriteWalk.position.z);
    if (keys.w) newPosition.addScaledVector(forward, moveSpeed); // Para frente
    if (keys.s) newPosition.addScaledVector(forward, -moveSpeed); // Para trás
    if (keys.a) newPosition.addScaledVector(right, -moveSpeed); // Esquerda
    if (keys.d) newPosition.addScaledVector(right, moveSpeed); // Direita

    if (!checkCollision(newPosition)) {
        spriteWalk.position.copy(newPosition);
        spriteIdle.position.copy(newPosition); // Sincroniza idle
    }

    if (direction !== lastDirection) {
        spriteWalkMaterial.map = walkTextures[direction];
        spriteIdleMaterial.map = idleTextures[direction];
        lastDirection = direction;
        currentWalkFrame = 0;
        currentIdleFrame = 0;
    }

    const isMoving = keys.w || keys.a || keys.s || keys.d;
    if (isMoving) {
        spriteWalk.visible = true;
        spriteIdle.visible = false;
        const now = Date.now();
        if (now - lastFrameTime > frameDuration) {
            currentWalkFrame = (currentWalkFrame + 1) % numFramesWalk;
            lastFrameTime = now;
        }
        const walkOffset = calculateWalkOffset(currentWalkFrame);
        spriteWalkMaterial.map.offset.set(walkOffset.x, walkOffset.y);
        // Atualizar câmera para orbitar o sprite com distância fixa
        const spritePos = spriteWalk.position;
        camera.position.x = spritePos.x + cameraDistance * Math.cos(yaw) * Math.cos(pitch);
        camera.position.y = spritePos.y + cameraDistance * Math.sin(pitch);
        camera.position.z = spritePos.z + cameraDistance * Math.sin(yaw) * Math.cos(pitch);
        camera.lookAt(spritePos);
    } else {
        spriteWalk.visible = false;
        spriteIdle.visible = true;
        const now = Date.now();
        if (now - lastFrameTime > frameDuration) {
            currentIdleFrame = (currentIdleFrame + 1) % numFramesIdle;
            lastFrameTime = now;
        }
        let offsetXY = { x: currentIdleFrame / 4, y: currentIdleFrame / 4 };
        spriteIdleMaterial.map.offset.set(offsetXY.x, offsetXY.y);
        // Atualizar câmera para orbitar o sprite com distância fixa
        const spritePos = spriteIdle.position;
        camera.position.x = spritePos.x + cameraDistance * Math.cos(yaw) * Math.cos(pitch);
        camera.position.y = spritePos.y + cameraDistance * Math.sin(pitch);
        camera.position.z = spritePos.z + cameraDistance * Math.sin(yaw) * Math.cos(pitch);
        camera.lookAt(spritePos);
    }

    renderer.render(scene, camera);
}
animate();