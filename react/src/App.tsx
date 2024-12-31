import { useCallback, useEffect, useRef, useState } from "react";

const tetriminos = ["I", "O", "T", "J", "L", "S", "Z"];
const Direction = {
  Zero: "Zero",
  Ninety: "Ninety",
  OneEighty: "OneEighty",
  TwoSeventy: "TwoSeventy",
};

const randomTetrimino = (): string =>
  tetriminos[Math.floor(Math.random() * tetriminos.length)];

type State = {
  board: boolean[][];
  currentTetrimino: string;
  position: { x: number; y: number };
  direction: string;
  lines: number;
};

const App = (): JSX.Element => {
  const [state, setState] = useState((): State => {
    const newState = {
      board: Array.from({ length: 20 }, (): boolean[] => Array(10).fill(false)),
      currentTetrimino: randomTetrimino(),
      position: { x: 4, y: 0 },
      direction: Direction.Zero,
      lines: 0,
    };
    return newState;
  });
  const ticking = useRef(false);
  const interval = useRef<number>(0);
  const initialized = useRef(false);

  const tetriminoShape = useCallback(
    (currentState: State): [number, number][] => {
      switch (`${currentState.currentTetrimino}-${currentState.direction}`) {
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
    },
    []
  );

  const isCollision = useCallback(
    (dx: number, dy: number, currentState: State): boolean => {
      const shape = tetriminoShape(currentState);
      const newPosition = {
        x: currentState.position.x + dx,
        y: currentState.position.y + dy,
      };
      return shape.some(([x, y]): boolean => {
        const cellX = newPosition.x + x;
        const cellY = newPosition.y + y;
        return (
          cellY >= 20 ||
          cellX < 0 ||
          cellX >= 10 ||
          currentState.board[cellY]?.[cellX]
        );
      });
    },
    [tetriminoShape]
  );

  const clearLines = useCallback((newState: State): State => {
    const newBoard = newState.board.filter(
      (row: boolean[]): boolean => !row.every((cell: boolean): boolean => cell)
    );
    const linesCleared = 20 - newBoard.length;
    for (let i = 0; i < linesCleared; i++) {
      newBoard.unshift(Array(10).fill(false));
    }
    return {
      ...newState,
      board: newBoard,
      lines: newState.lines + linesCleared,
    };
  }, []);

  const resetGame = useCallback((newState: State): State => {
    ticking.current = false;
    return {
      ...newState,
      board: Array.from({ length: 20 }, (): boolean[] => Array(10).fill(false)),
      lines: 0,
      position: { x: 4, y: 0 },
      currentTetrimino: randomTetrimino(),
    };
  }, []);

  const moveDown = useCallback(
    (newState: State): State => {
      const spawnTetrimino = (newState: State): State => {
        newState = {
          ...newState,
          currentTetrimino: randomTetrimino(),
          position: { x: 4, y: 0 },
          direction: Direction.Zero,
        };
        if (isCollision(0, 0, newState)) {
          alert("Game Over!");
          newState = resetGame(newState);
        }
        return newState;
      };

      const lockTetrimino = (newState: State): State => {
        const shape = tetriminoShape(newState);
        const newBoard = [...newState.board];
        shape.forEach(([dx, dy]): void => {
          const x = newState.position.x + dx;
          const y = newState.position.y + dy;
          if (y >= 0 && y < 20 && x >= 0 && x < 10) {
            newBoard[y][x] = true;
          }
        });
        return { ...newState, board: newBoard };
      };

      if (isCollision(0, 1, newState)) {
        newState = lockTetrimino(newState);
        newState = clearLines(newState);
        newState = spawnTetrimino(newState);
        return newState;
      } else {
        return {
          ...newState,
          position: {
            ...newState.position,
            y: newState.position.y + 1,
          },
        };
      }
    },
    [clearLines, isCollision, resetGame, tetriminoShape]
  );

  const toggleTick = useCallback((): void => {
    if (!ticking.current) {
      interval.current = setInterval((): void => {
        setState((currentState: State): State => {
          return moveDown(currentState);
        });
      }, 500);
    } else {
      clearInterval(interval.current);
      interval.current = 0;
    }
    ticking.current = !ticking.current;
  }, [moveDown, setState]);

  const isCellPartOfTetrimino = (
    x: number,
    y: number,
    currentState: State
  ): boolean => {
    const shape = tetriminoShape(currentState);
    return shape.some(
      ([dx, dy]: [number, number]): boolean =>
        currentState.position.x + dx === x && currentState.position.y + dy === y
    );
  };

  useEffect((): void => {
    if (initialized.current) {
      return;
    }
    initialized.current = true;
    function rotateTetrimino(newState: State): State {
      const nextDirection =
        {
          Zero: Direction.Ninety,
          Ninety: Direction.OneEighty,
          OneEighty: Direction.TwoSeventy,
          TwoSeventy: Direction.Zero,
        }[newState.direction] || newState.direction;
      newState = {
        ...newState,
        direction: nextDirection,
      };
      if (isCollision(0, 0, newState)) {
        newState = {
          ...newState,
          direction:
            {
              Ninety: Direction.Zero,
              OneEighty: Direction.Ninety,
              TwoSeventy: Direction.OneEighty,
              Zero: Direction.TwoSeventy,
            }[nextDirection] || newState.direction,
        };
      }
      return newState;
    }

    const handleKeyPress = (event: KeyboardEvent): void => {
      setState((currentState: State): State => {
        if (!ticking) {
          return currentState;
        }
        let newState = { ...currentState };
        switch (event.key) {
          case "ArrowLeft":
            if (!isCollision(-1, 0, newState))
              newState = {
                ...newState,
                position: {
                  ...newState.position,
                  x: newState.position.x - 1,
                },
              };
            break;

          case "ArrowRight":
            if (!isCollision(1, 0, newState))
              newState = {
                ...newState,
                position: {
                  ...newState.position,
                  x: newState.position.x + 1,
                },
              };
            break;

          case "ArrowDown":
            newState = moveDown(newState);
            break;

          case "ArrowUp":
            newState = rotateTetrimino(newState);
            break;

          default:
            break;
        }
        return newState;
      });
    };
    document.addEventListener("keydown", handleKeyPress);
  }, [isCollision, moveDown]);

  return (
    <div>
      <div>
        React Tetris:{" "}
        <a href="https://github.com/satosystems/tetris/tree/main/react">
          GitHub
        </a>
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(10, 30px)",
          gridTemplateRows: "repeat(20, 30px)",
        }}
      >
        {state.board.flat().map(
          (cell: boolean, index: number): JSX.Element => (
            <div
              key={index}
              style={{
                width: "30px",
                height: "30px",
                border: "1px solid black",
                backgroundColor:
                  cell ||
                  isCellPartOfTetrimino(
                    index % 10,
                    Math.floor(index / 10),
                    state
                  )
                    ? "grey"
                    : "white",
              }}
            ></div>
          )
        )}
      </div>
      <div>
        <button onClick={toggleTick}>
          {ticking ? "Stop Game" : "Start Game"}
        </button>
        <div>Lines: {state.lines}</div>
      </div>
    </div>
  );
};

export default App;
