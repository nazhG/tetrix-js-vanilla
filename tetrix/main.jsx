import './style.css'

const canvas = document.querySelector('canvas')
const ctx = canvas.getContext('2d')
const scoreElement = document.querySelector('#score')

let score = 0

const setScore = (value) => {
  score = value
  scoreElement.innerHTML = score
}

setScore(score)

// Block size
const BLOCK_SIZE = 20

// Board size
const BOARD_WIDTH = 14
const BOARD_HEIGHT = 30

// Set canvas size
canvas.width = BLOCK_SIZE * BOARD_WIDTH
canvas.height = BLOCK_SIZE * BOARD_HEIGHT

// set scale
ctx.scale(BLOCK_SIZE, BLOCK_SIZE)

const board = []

for (let y = 0; y < BOARD_HEIGHT; y++) {
  board[y] = []
  for (let x = 0; x < BOARD_WIDTH; x++) {
    board[y][x] = 0
  }
}
const colors = [
  'black',
  'red',
  'green',
  'blue',
  'yellow',
  'cyan',
  'magenta'
]

const pieces = [
  [
    [1, 1],
    [1, 1]
  ],
  [
    [1, 1, 1, 1]
  ],
  [
    [1, 1, 0],
    [0, 1, 1]
  ],
  [
    [0, 1, 1],
    [1, 1, 0]
  ],
  [
    [1, 0, 0],
    [1, 1, 1]
  ],
  [
    [0, 0, 1],
    [1, 1, 1]
  ],
  [
    [0, 1, 0],
    [1, 1, 1]
  ]
]

const RIGHT = { x: 1, y: 0 }
const LEFT = { x: -1, y: 0 }
const DOWN = { x: 0, y: 1 }

const player = {
  pos: { x: 0, y: 0 },
  piece: null,
  moverDown () {
    if (this.pos.y + this.getPiece().height >= BOARD_HEIGHT || this.colide(board, DOWN)) {
      this.merge(board)
      this.reset()
      return
    }
    this.pos.y++
  },
  moverLeft () {
    if (this.pos.x === 0) return // Border left
    if (this.colide(board, LEFT)) return
    this.pos.x--
  },
  moverRight () {
    if (this.pos.x + this.getPiece().width >= BOARD_WIDTH) return // Border right
    if (this.colide(board, RIGHT)) return
    this.pos.x++
  },
  rotate () {
    const p = this.getPiece()
    const width = p.width
    const height = p.height
    // prevent go out of the board when rotate
    if (this.pos.x + p.height >= BOARD_WIDTH) {
      this.pos.x = BOARD_WIDTH - p.height
    }
    // create rotated piece
    const rotated = []
    for (let i = 0; i < width; i++) {
      rotated.push([])
    }

    for (let i = 0; i < height; i++) {
      for (let j = 0; j < width; j++) {
        rotated[j].unshift(p[i][j])
      }
    }
    this.setPiece(rotated)
  },
  reset () {
    this.pos.y = 0
    this.pos.x = 0
    this.piece = null
  },
  colide (board, dir) {
    const p = this.getPiece()
    for (let i = 0; i < this.piece.width; i++) {
      for (let j = 0; j < this.piece.height; j++) {
        if (p[j][i] !== 0 && board[this.pos.y + j + dir.y][this.pos.x + i + dir.x] !== 0) {
          return true
        }
      }
    }
    return false
  },
  merge (board) {
    this.getPiece().forEach((row, y) => {
      row.forEach((value, x) => {
        if (value !== 0) {
          board[y + this.pos.y][x + this.pos.x] = value
        }
      })
    })
    let numCompleteLines = 0
    // check if have a complete line
    for (let y = 0; y < BOARD_HEIGHT; y++) {
      let complete = true
      for (let x = 0; x < BOARD_WIDTH; x++) {
        if (board[y][x] === 0) {
          complete = false
          break
        }
      }
      if (complete) {
        // remove line
        board.splice(y, 1)
        // add a new line on top
        board.unshift(new Array(BOARD_WIDTH).fill(0))
        // increment number of complete lines
        numCompleteLines++
      }
    }
    // calculate score
    if (numCompleteLines > 0) {
      // 1 line = 10 points, 2 lines = 40 points, 3 lines = 90 points, 4 lines = 160 points
      setScore(score + (numCompleteLines * numCompleteLines * 10))
    }
  },
  setPiece (piece, color) {
    this.piece = piece
    // set color, if color is undefined the piece already have color
    if (color !== undefined) {
      this.piece = this.piece.map(row => row.map((val) => (val === 0 ? 0 : color)))
    }
    // set width and height
    this.piece.width = this.piece[0].length
    this.piece.height = this.piece.length
  },
  getPiece () { // could be null, so, if need piece use getPiece()
    return this.piece ? this.piece : []
  }
}

let dropCounter = 0
let lastTime = 0
const update = (time = 0) => {
  // Check if the player need a piece
  if (player.piece === null) {
    const piece = Math.floor(Math.random() * pieces.length)
    const color = Math.floor((Math.random() * (colors.length - 1)) + 1)
    player.setPiece(
      pieces[piece],
      color
    )
  }

  // Calculate time to drop the piece down one block every second
  const deltaTime = time - lastTime
  lastTime = time
  dropCounter += deltaTime

  if (dropCounter > 1000) {
    player.moverDown()
    dropCounter = 0
  }

  // Redraw the canvas (fill black )
  draw()

  // Game loop
  window.requestAnimationFrame(update)
}

const draw = () => {
  // Draw the background
  ctx.fillStyle = colors[0]
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  // Draw the board
  board.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value !== 0) {
        ctx.fillStyle = colors[value]
        ctx.fillRect(x, y, 1, 1)
      }
    })
  })

  // Draw the player
  player.getPiece().forEach((row, y) => {
    row.forEach((value, x) => {
      if (value !== 0) {
        ctx.fillStyle = colors[value]
        ctx.fillRect(player.pos.x + x, player.pos.y + y, 1, 1)
      }
    })
  })
}

// Controls
document.addEventListener('keydown', event => {
  if (event.key === 'ArrowLeft') player.moverLeft()
  if (event.key === 'ArrowRight') player.moverRight()
  if (event.key === 'ArrowDown') player.moverDown()
  if (event.key === 'ArrowUp') player.rotate()
})

update()
