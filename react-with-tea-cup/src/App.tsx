import { DocumentEvents, Program } from 'react-tea-cup'
import {
  Cmd,
  Dispatcher,
  Maybe,
  Sub,
  Task,
  Time,
  just,
  noCmd,
  nothing,
} from 'tea-cup-core'

const tetriminos = ['I', 'O', 'T', 'J', 'L', 'S', 'Z'] as const
type Tetrimino = (typeof tetriminos)[number]

type Board = boolean[][]

type Position = { x: number; y: number }

enum Direction {
  Zero = 'Zero',
  Ninety = 'Ninety',
  OneEighty = 'OneEighty',
  TwoSeventy = 'TwoSeventy',
}

type Model = {
  board: Board
  currentTetrimino: Tetrimino
  position: Position
  direction: Direction
  lines: number
  msg: Msg
  tick: number
  ticking: boolean
}

type Msg =
  | { tag: 'Tick' }
  | { tag: 'MoveDown' }
  | { tag: 'MoveLeft' }
  | { tag: 'MoveRight' }
  | { tag: 'Rotate' }
  | { tag: 'EraseLines' }
  | { tag: 'IsGameOver' }
  | { tag: 'ToggleTick' }
  | { tag: 'NoOp' }

function init(): [Model, Cmd<Msg>] {
  const tetrimino = randomTetrimino()
  return noCmd({
    board: Array(20).fill(Array(10).fill(false)),
    currentTetrimino: tetrimino,
    position: initialPosition(tetrimino),
    direction: Direction.Zero,
    lines: 0,
    msg: { tag: 'NoOp' },
    tick: 0,
    ticking: false,
  })
}

function initialPosition(tetrimino: Tetrimino): Position {
  switch (tetrimino) {
    case 'I':
      return { x: 4, y: 0 }

    case 'O':
      return { x: 4, y: 0 }

    case 'T':
      return { x: 4, y: 0 }

    case 'S':
      return { x: 4, y: 0 }

    case 'Z':
      return { x: 4, y: 0 }

    case 'J':
      return { x: 4, y: 0 }

    case 'L':
      return { x: 4, y: 0 }
  }
}

function view(dispatch: Dispatcher<Msg>, model: Model) {
  return (
    <div>
      <div>
        React Tetris with react-tea-cup:{' '}
        <a href="https://github.com/satosystems/tetris/tree/main/react-with-tea-cup">
          GitHub
        </a>
      </div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(10, 30px)',
          gridTemplateRows: 'repeat(20, 30px)',
        }}
      >
        {model.board.flatMap((row, y) => viewRow(model, y, row))}
      </div>
      <div>
        <button
          onClick={() => dispatch({ tag: 'ToggleTick' })}
          disabled={model.ticking}
        >
          Start Game
        </button>{' '}
        Lines: {model.lines.toString()}
      </div>
    </div>
  )
}

function viewRow(model: Model, y: number, row: boolean[]): JSX.Element[] {
  return row.map((cell, x) => viewCell(model, x, y, cell))
}

function viewCell(
  model: Model,
  x: number,
  y: number,
  cell: boolean
): JSX.Element {
  const isTetriminoCell = isCellPartOfTetrimino(model, x, y)
  return (
    <div
      key={`${x}-${y}`}
      style={{
        width: '30px',
        height: '30px',
        border: '1px solid black',
        backgroundColor: cell || isTetriminoCell ? 'grey' : 'white',
      }}
    ></div>
  )
}

function isCellPartOfTetrimino(model: Model, x: number, y: number): boolean {
  const shape = tetriminoShape(model)
  const position = model.position
  return shape.reduce((acc, [dx, dy]) => {
    if (acc) return acc
    return position.x + dx === x && position.y + dy === y
  }, false)
}

function update(msg: Msg, model: Model): [Model, Cmd<Msg>] {
  const newModel = { ...model, msg }
  switch (msg.tag) {
    case 'Tick': {
      const tickModel = { ...newModel, tick: newModel.tick + 1 }
      if (tickModel.tick < 100) {
        return [
          tickModel,
          Task.perform(Time.now(), (): Msg => ({ tag: 'NoOp' })),
        ]
      } else if (isCollision(tickModel)) {
        const updateRow = (
          aModel: Model,
          y: number,
          row: boolean[]
        ): boolean[] => {
          return row.map((cell, x) =>
            isCellPartOfTetrimino(aModel, x, y) ? true : cell
          )
        }
        const fixTetrimino = (aModel: Model): Model => {
          const newBoard = aModel.board.map((row, y) =>
            updateRow(aModel, y, row)
          )
          return { ...aModel, board: newBoard }
        }
        const fixedModel = fixTetrimino(tickModel)
        const newTetrimino = randomTetrimino()
        return noCmd({
          ...fixedModel,
          currentTetrimino: newTetrimino,
          position: initialPosition(newTetrimino),
          tick: 0,
          msg: { tag: 'EraseLines' },
        })
      } else {
        return noCmd({
          ...tickModel,
          position: { x: tickModel.position.x, y: tickModel.position.y + 1 },
          tick: 0,
        })
      }
    }

    case 'MoveDown':
      return [
        { ...newModel, tick: 100 },
        Task.perform(Time.now(), (): Msg => ({ tag: 'EraseLines' })), // Workaround: Always check when falling because EraseLines are skipped depending on timing
      ]

    case 'MoveLeft': {
      if (isCollision(newModel)) {
        return noCmd(newModel)
      } else {
        return noCmd({
          ...newModel,
          position: { x: newModel.position.x - 1, y: newModel.position.y },
        })
      }
    }

    case 'MoveRight': {
      if (isCollision(newModel)) {
        return noCmd(newModel)
      } else {
        return noCmd({
          ...newModel,
          position: { x: newModel.position.x + 1, y: newModel.position.y },
        })
      }
    }

    case 'Rotate': {
      const tryRotate = (offsets: number[]): Maybe<Model> => {
        if (offsets.length === 0) {
          return nothing
        } else {
          const x = offsets[0]
          const xs = offsets.slice(1)
          const tryModel = rotateTetrimino({
            ...newModel,
            position: { x: newModel.position.x + x, y: newModel.position.y },
          })
          if (
            (x === -2 && tryModel.currentTetrimino !== 'I') ||
            isCollision(tryModel)
          ) {
            return tryRotate(xs)
          } else {
            return just(tryModel)
          }
        }
      }
      const maybeRotateModel = tryRotate([0, -1, 1, -2])
      if (maybeRotateModel.isNothing()) {
        return noCmd(newModel)
      } else {
        const rotatedModel = maybeRotateModel.withDefault(newModel)
        return noCmd(rotatedModel)
      }
    }

    case 'EraseLines': {
      const eraseRows = (board: Board): [number, Board] => {
        const isFillRow = (row: boolean[]): boolean =>
          row.reduce((acc, cur) => acc && cur, true)
        const erasedBoard: Board = board.filter(
          (row: boolean[]) => !isFillRow(row)
        )
        const erasedLines: number = board.length - erasedBoard.length
        const emptyLines: Board = Array(erasedLines).fill(Array(10).fill(false))
        return [erasedLines, emptyLines.concat(erasedBoard)]
      }
      const [lines, newBoard] = eraseRows(newModel.board)
      return noCmd({
        ...newModel,
        board: newBoard,
        lines: newModel.lines + lines,
        msg: { tag: 'IsGameOver' },
      })
    }

    case 'IsGameOver': {
      if (isCollision(newModel)) {
        const tetrimino = randomTetrimino()
        return noCmd({
          board: Array(20).fill(Array(10).fill(false)),
          currentTetrimino: tetrimino,
          position: initialPosition(tetrimino),
          direction: Direction.Zero,
          lines: 0,
          msg: { tag: 'NoOp' },
          tick: 0,
          ticking: true,
        })
      } else {
        return noCmd({ ...newModel, msg: { tag: 'NoOp' } })
      }
    }

    case 'ToggleTick':
      return noCmd({
        ...newModel,
        msg: { tag: 'NoOp' },
        ticking: !newModel.ticking,
      })

    case 'NoOp':
      return noCmd(newModel)
  }
}

function randomTetrimino(): Tetrimino {
  return tetriminos[Math.floor(Math.random() * tetriminos.length)]
}

function subscriptions(model: Model): Sub<Msg> {
  // Workaround: Time.every does not work right after it starts, so let it run in the user action triggered by the button.
  if (model.ticking) {
    return Sub.batch([
      Time.every(10, (): Msg => {
        return isCollision(model)
          ? { tag: 'IsGameOver' }
          : model.msg.tag === 'EraseLines'
          ? model.msg
          : { tag: 'Tick' }
      }),
      new DocumentEvents<Msg>().on('keydown', onKeyDown),
    ])
  } else {
    return Sub.none()
  }
}

function isCollision(model: Model): boolean {
  const shape = tetriminoShape(model)
  const newPosition: Position =
    model.msg.tag === 'MoveLeft'
      ? { x: model.position.x - 1, y: model.position.y }
      : model.msg.tag === 'MoveRight'
      ? { x: model.position.x + 1, y: model.position.y }
      : model.msg.tag === 'Tick'
      ? { x: model.position.x, y: model.position.y + 1 }
      : model.position

  return shape.reduce((acc, [dx, dy]) => {
    if (acc) return acc
    const cellX = newPosition.x + dx
    const cellY = newPosition.y + dy
    const cellFilled = model.board[cellY] && model.board[cellY][cellX]
    return cellY >= 20 || cellX < 0 || cellX >= 10 || cellFilled
  }, false)
}

const onKeyDown = (event: KeyboardEvent): Msg => {
  switch (event.code) {
    case 'ArrowUp':
      return { tag: 'Rotate' }

    case 'ArrowDown':
      return { tag: 'MoveDown' }

    case 'ArrowLeft':
      return { tag: 'MoveLeft' }

    case 'ArrowRight':
      return { tag: 'MoveRight' }

    default:
      return { tag: 'NoOp' }
  }
}

function tetriminoShape(model: Model): number[][] {
  switch (`${model.currentTetrimino}-${model.direction}`) {
    case 'I-Zero':
      return [
        [0, 0],
        [0, -1],
        [0, 1],
        [0, 2],
      ]

    case 'I-Ninety':
      return [
        [0, 0],
        [-1, 0],
        [1, 0],
        [2, 0],
      ]

    case 'I-OneEighty':
      return [
        [0, 0],
        [0, -1],
        [0, 1],
        [0, 2],
      ]

    case 'I-TwoSeventy':
      return [
        [0, 0],
        [-1, 0],
        [1, 0],
        [2, 0],
      ]

    case 'O-Zero':
      return [
        [0, 0],
        [1, 0],
        [0, 1],
        [1, 1],
      ]

    case 'O-Ninety':
      return [
        [0, 0],
        [1, 0],
        [0, 1],
        [1, 1],
      ]

    case 'O-OneEighty':
      return [
        [0, 0],
        [1, 0],
        [0, 1],
        [1, 1],
      ]

    case 'O-TwoSeventy':
      return [
        [0, 0],
        [1, 0],
        [0, 1],
        [1, 1],
      ]

    case 'T-Zero':
      return [
        [0, 0],
        [-1, 0],
        [1, 0],
        [0, 1],
      ]

    case 'T-Ninety':
      return [
        [0, 0],
        [0, -1],
        [0, 1],
        [1, 0],
      ]

    case 'T-OneEighty':
      return [
        [0, 0],
        [-1, 0],
        [1, 0],
        [0, -1],
      ]

    case 'T-TwoSeventy':
      return [
        [0, 0],
        [0, -1],
        [0, 1],
        [-1, 0],
      ]

    case 'S-Zero':
      return [
        [0, 0],
        [-1, 0],
        [0, -1],
        [1, -1],
      ]

    case 'S-Ninety':
      return [
        [0, 0],
        [0, -1],
        [1, 0],
        [1, 1],
      ]

    case 'S-OneEighty':
      return [
        [0, 0],
        [-1, 0],
        [0, -1],
        [1, -1],
      ]

    case 'S-TwoSeventy':
      return [
        [0, 0],
        [0, -1],
        [1, 0],
        [1, 1],
      ]

    case 'Z-Zero':
      return [
        [0, 0],
        [1, 0],
        [0, -1],
        [-1, -1],
      ]

    case 'Z-Ninety':
      return [
        [0, 0],
        [0, -1],
        [-1, 0],
        [-1, 1],
      ]

    case 'Z-OneEighty':
      return [
        [0, 0],
        [1, 0],
        [0, -1],
        [-1, -1],
      ]

    case 'Z-TwoSeventy':
      return [
        [0, 0],
        [0, -1],
        [-1, 0],
        [-1, 1],
      ]

    case 'J-Zero':
      return [
        [0, 0],
        [1, 0],
        [-1, 0],
        [1, 1],
      ]

    case 'J-Ninety':
      return [
        [0, 0],
        [0, -1],
        [0, 1],
        [1, -1],
      ]

    case 'J-OneEighty':
      return [
        [0, 0],
        [-1, 0],
        [1, 0],
        [-1, -1],
      ]

    case 'J-TwoSeventy':
      return [
        [0, 0],
        [0, -1],
        [0, 1],
        [-1, 1],
      ]

    case 'L-Zero':
      return [
        [0, 0],
        [-1, 0],
        [1, 0],
        [-1, 1],
      ]

    case 'L-Ninety':
      return [
        [0, 0],
        [0, -1],
        [0, 1],
        [1, 1],
      ]

    case 'L-OneEighty':
      return [
        [0, 0],
        [-1, 0],
        [1, 0],
        [1, -1],
      ]

    case 'L-TwoSeventy':
      return [
        [0, 0],
        [0, -1],
        [0, 1],
        [-1, -1],
      ]

    default:
      return []
  }
}

function rotateTetrimino(model: Model): Model {
  switch (model.direction) {
    case Direction.Zero:
      return { ...model, direction: Direction.Ninety }

    case Direction.Ninety:
      return { ...model, direction: Direction.OneEighty }

    case Direction.OneEighty:
      return { ...model, direction: Direction.TwoSeventy }

    case Direction.TwoSeventy:
      return { ...model, direction: Direction.Zero }
  }
}

const App = () => (
  <Program
    init={init}
    view={view}
    update={update}
    subscriptions={subscriptions}
  />
)

export default App
