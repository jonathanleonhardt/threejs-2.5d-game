# CLAUDE.md

Este arquivo orienta o Claude Code ao trabalhar neste repositório.

## Visão geral

Protótipo de jogo 2.5D ("dark-medieval") em Three.js: um personagem em sprite 2D com animações
direcionais se move num cenário 3D, com câmera em terceira pessoa e colisão contra paredes.

## Stack

- Three.js 0.179 + TypeScript 5.9
- Vite 7 (dev server e build)
- Gerenciador de pacotes: **npm** (há `package-lock.json`)

## Comandos

```bash
npm install
npm run dev      # vite, abre o navegador automaticamente
npm run build    # tsc (checagem de tipos) + vite build → dist/
npm run serve    # preview do build
```

Não há testes nem linter. Use `npm run build` para validar tipos.

## Arquitetura (`src/`)

Cada módulo exporta uma interface e uma função fábrica (`createX`/`setupX`); não use classes.

- `main.ts` — ponto de entrada e game loop (`animate`). Calcula o movimento relativo à câmera
  (WASD), testa colisão no `mapManager` antes de mover e controla o tempo de frame da animação
  (`frameDuration` = 120 ms).
- `sceneSetup.ts` — cria `scene`, `camera` (PerspectiveCamera) e `renderer`.
- `spriteManager.ts` — carrega as spritesheets, troca entre sprites de andar/parado e avança os
  frames via `texture.offset`/`texture.repeat`. Expõe posição e `moveSpeed`.
- `inputHandler.ts` — estado do teclado (`keys`), direção do personagem e `yaw`/`pitch` do mouse.
- `cameraController.ts` — posiciona a câmera seguindo o personagem a partir de `yaw`/`pitch`.
- `mapManager.ts` — cria as paredes e faz colisão por `Raycaster` contra elas.

## Assets

Spritesheets ficam em `public/{walk,run,jump,boost}/GirlSample_<Ação>_<Direção>.png` e são
carregadas por caminho absoluto (`/walk/...`). Direções: Down, Up, Left, Right, DownLeft,
DownRight, UpLeft, UpRight (atenção: `run/GirlSample_Run_DowlLeft.png` tem um typo no nome).
O grid de frames varia por sheet (ex.: walk usa `repeat(1/4, 1/3)`, boost `repeat(1/4, 1/4)`).

## Convenções

- Tipagem explícita em variáveis e retornos, como no código existente.
- Comentários em português.
