<script setup lang="ts">
import { reactive, onMounted, onUnmounted } from "vue";

const tetriminos = ["I", "O", "T", "J", "L", "S", "Z"];
const Direction = {
  Zero: "Zero",
  Ninety: "Ninety",
  OneEighty: "OneEighty",
  TwoSeventy: "TwoSeventy",
};

const state = reactive({
  board: Array.from({ length: 20 }, () => Array(10).fill(false)),
  currentTetrimino: randomTetrimino(),
  position: { x: 4, y: 0 },
  direction: Direction.Zero,
  lines: 0,
  ticking: false,
  tick: 0,
});

let interval = 0;

function randomTetrimino(): string {
  return tetriminos[Math.floor(Math.random() * tetriminos.length)];
}

function toggleTick(): void {
  state.ticking = !state.ticking;
  if (state.ticking) {
    interval = setInterval(() => {
      moveDown();
    }, 500);
  } else {
    clearInterval(interval);
    interval = 0;
  }
}

function moveDown(): void {
  if (isCollision(0, 1)) {
    lockTetrimino();
    clearLines();
    spawnTetrimino();
  } else {
    state.position.y++;
  }
}

function lockTetrimino(): void {
  const shape = tetriminoShape();
  shape.forEach(([dx, dy]) => {
    const x = state.position.x + dx;
    const y = state.position.y + dy;
    if (y >= 0 && y < 20 && x >= 0 && x < 10) {
      state.board[y][x] = true;
    }
  });
}

function clearLines(): void {
  state.board = state.board.filter((row) => !row.every((cell) => cell));
  const linesCleared = 20 - state.board.length;
  for (let i = 0; i < linesCleared; i++) {
    state.board.unshift(Array(10).fill(false));
  }
  state.lines += linesCleared;
}

function spawnTetrimino(): void {
  state.currentTetrimino = randomTetrimino();
  state.position = { x: 4, y: 0 };
  state.direction = Direction.Zero;
  if (isCollision(0, 0)) {
    setTimeout(() => {
      alert("Game Over!");
      resetGame();
    }, 0);
  }
}

function isCollision(dx: number, dy: number): boolean {
  const shape = tetriminoShape();
  const newPosition = {
    x: state.position.x + dx,
    y: state.position.y + dy,
  };
  return shape.reduce((acc, [dx, dy]) => {
    if (acc) return acc;
    const cellX = newPosition.x + dx;
    const cellY = newPosition.y + dy;
    const cellFilled = state.board[cellY]?.[cellX];
    return cellY >= 20 || cellX < 0 || cellX >= 10 || cellFilled;
  }, false);
}

function isCellPartOfTetrimino(x: number, y: number): boolean {
  const shape = tetriminoShape();
  return shape.some(
    ([dx, dy]) => state.position.x + dx === x && state.position.y + dy === y
  );
}

function tetriminoShape(): [number, number][] {
  switch (`${state.currentTetrimino}-${state.direction}`) {
    case "I-Zero":
      return [
        [0, 0],
        [0, -1],
        [0, 1],
        [0, 2],
      ];

    case "I-Ninety":
      return [
        [0, 0],
        [-1, 0],
        [1, 0],
        [2, 0],
      ];

    case "I-OneEighty":
      return [
        [0, 0],
        [0, -1],
        [0, 1],
        [0, 2],
      ];

    case "I-TwoSeventy":
      return [
        [0, 0],
        [-1, 0],
        [1, 0],
        [2, 0],
      ];

    case "O-Zero":
      return [
        [0, 0],
        [1, 0],
        [0, 1],
        [1, 1],
      ];

    case "O-Ninety":
      return [
        [0, 0],
        [1, 0],
        [0, 1],
        [1, 1],
      ];

    case "O-OneEighty":
      return [
        [0, 0],
        [1, 0],
        [0, 1],
        [1, 1],
      ];

    case "O-TwoSeventy":
      return [
        [0, 0],
        [1, 0],
        [0, 1],
        [1, 1],
      ];

    case "T-Zero":
      return [
        [0, 0],
        [-1, 0],
        [1, 0],
        [0, 1],
      ];

    case "T-Ninety":
      return [
        [0, 0],
        [0, -1],
        [0, 1],
        [1, 0],
      ];

    case "T-OneEighty":
      return [
        [0, 0],
        [-1, 0],
        [1, 0],
        [0, -1],
      ];

    case "T-TwoSeventy":
      return [
        [0, 0],
        [0, -1],
        [0, 1],
        [-1, 0],
      ];

    case "S-Zero":
      return [
        [0, 0],
        [-1, 0],
        [0, -1],
        [1, -1],
      ];

    case "S-Ninety":
      return [
        [0, 0],
        [0, -1],
        [1, 0],
        [1, 1],
      ];

    case "S-OneEighty":
      return [
        [0, 0],
        [-1, 0],
        [0, -1],
        [1, -1],
      ];

    case "S-TwoSeventy":
      return [
        [0, 0],
        [0, -1],
        [1, 0],
        [1, 1],
      ];

    case "Z-Zero":
      return [
        [0, 0],
        [1, 0],
        [0, -1],
        [-1, -1],
      ];

    case "Z-Ninety":
      return [
        [0, 0],
        [0, -1],
        [-1, 0],
        [-1, 1],
      ];

    case "Z-OneEighty":
      return [
        [0, 0],
        [1, 0],
        [0, -1],
        [-1, -1],
      ];

    case "Z-TwoSeventy":
      return [
        [0, 0],
        [0, -1],
        [-1, 0],
        [-1, 1],
      ];

    case "J-Zero":
      return [
        [0, 0],
        [1, 0],
        [-1, 0],
        [1, 1],
      ];

    case "J-Ninety":
      return [
        [0, 0],
        [0, -1],
        [0, 1],
        [1, -1],
      ];

    case "J-OneEighty":
      return [
        [0, 0],
        [-1, 0],
        [1, 0],
        [-1, -1],
      ];

    case "J-TwoSeventy":
      return [
        [0, 0],
        [0, -1],
        [0, 1],
        [-1, 1],
      ];

    case "L-Zero":
      return [
        [0, 0],
        [-1, 0],
        [1, 0],
        [-1, 1],
      ];

    case "L-Ninety":
      return [
        [0, 0],
        [0, -1],
        [0, 1],
        [1, 1],
      ];

    case "L-OneEighty":
      return [
        [0, 0],
        [-1, 0],
        [1, 0],
        [1, -1],
      ];

    case "L-TwoSeventy":
      return [
        [0, 0],
        [0, -1],
        [0, 1],
        [-1, -1],
      ];

    default:
      return [];
  }
}

function resetGame(): void {
  state.board = Array.from({ length: 20 }, () => Array(10).fill(false));
  state.lines = 0;
  state.position = { x: 4, y: 0 };
  state.currentTetrimino = randomTetrimino();
  state.ticking = false;
  clearInterval(interval);
  interval = 0;
}

onMounted(() => {
  document.addEventListener("keydown", handleKeyPress);
  toggleTick();
});

onUnmounted(() => {
  document.removeEventListener("keydown", handleKeyPress);
  clearInterval(interval);
  interval = 0;
});

function handleKeyPress(event: KeyboardEvent): void {
  if (!state.ticking) return;
  switch (event.key) {
    case "ArrowLeft":
      if (!isCollision(-1, 0)) state.position.x--;
      break;
    case "ArrowRight":
      if (!isCollision(1, 0)) state.position.x++;
      break;
    case "ArrowDown":
      moveDown();
      break;
    case "ArrowUp":
      rotateTetrimino();
      break;
  }
}

function rotateTetrimino(): void {
  const nextDirection =
    {
      Zero: Direction.Ninety,
      Ninety: Direction.OneEighty,
      OneEighty: Direction.TwoSeventy,
      TwoSeventy: Direction.Zero,
    }[state.direction] || state.direction;
  state.direction = nextDirection;
  if (isCollision(0, 0)) {
    state.direction =
      {
        Ninety: Direction.Zero,
        OneEighty: Direction.Ninety,
        TwoSeventy: Direction.OneEighty,
        Zero: Direction.TwoSeventy,
      }[nextDirection] || state.direction;
  }
}
</script>

<template>
  <div>
    <div>
      Vue Tetris with Composition API:
      <a href="https://github.com/satosystems/tetris/tree/main/vue.js">
        GitHub
      </a>
    </div>
    <div
      class="board"
      :style="{
        display: 'grid',
        gridTemplateColumns: 'repeat(10, 30px)',
        gridTemplateRows: 'repeat(20, 30px)',
      }"
    >
      <div
        v-for="(cell, index) in state.board.flat()"
        :key="index"
        :style="{
          width: '30px',
          height: '30px',
          border: '1px solid black',
          backgroundColor:
            cell || isCellPartOfTetrimino(index % 10, Math.floor(index / 10))
              ? 'grey'
              : 'white',
        }"
      ></div>
    </div>
    <div>
      <button @click="toggleTick">
        {{ state.ticking ? "Stop Game" : "Start Game" }}
      </button>
      Lines: {{ state.lines }}
    </div>
  </div>
</template>

<style scoped>
.board {
  display: grid;
}
</style>
