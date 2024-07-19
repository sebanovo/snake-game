const canvas = document.getElementById('snake-game')
const ctx = canvas.getContext('2d')
const score = document.getElementById('score')
const highScore = document.getElementById('high-score')
canvas.width = 400
canvas.height = 400

highScore.textContent = window.localStorage.getItem('highScore') || score.textContent
const FPS = 10
const interval = 1000 / FPS
const numberOfSquare = 8
const sizeSquare = canvas.width / numberOfSquare
const totalSquare = (canvas.width * canvas.height) / Math.pow(sizeSquare, 2)

const turnAudio = new Audio('./audio/turn.mp3')
turnAudio.playbackRate = 2.5
const deadAudio = new Audio('./audio/dead.mp3')
const eatAudio = new Audio('./audio/eat.mp3')

const level = {
  score,
  highScore,
  win: false,
  gameOver: false,
  setIntervalId: null,
  gridLineSize: 2,
  gridSize: totalSquare
}

const KEY = {
  UP: 'ArrowUp',
  DOWN: 'ArrowDown',
  RIGHT: 'ArrowRight',
  LEFT: 'ArrowLeft'
}

function randomX() {
  return Math.floor(Math.random() * (canvas.width / sizeSquare)) * sizeSquare
}

function randomY() {
  return Math.floor(Math.random() * (canvas.height / sizeSquare)) * sizeSquare
}

const head = {
  x: randomX(),
  y: randomY(),
  size: sizeSquare,
  dx: 0,
  dy: 0,
  direction: null
}
const snakeBody = [head]

const appleImg = new Image(300, 300)
appleImg.src = './apple.png'

const food = {
  x: randomX(),
  y: randomY(),
  size: sizeSquare,
  appleImg
}

document.addEventListener('keydown', e => {
  const head = snakeBody[0]
  if (e.key === KEY.UP && head.direction !== KEY.DOWN) {
    if (head.direction !== e.key) {
      turnAudio.play()
    }
    head.dx = 0
    head.dy = -head.size
    head.direction = e.key
  } else if (e.key === KEY.DOWN && head.direction !== KEY.UP) {
    if (head.direction !== e.key) {
      turnAudio.play()
    }
    head.dx = 0
    head.dy = head.size
    head.direction = e.key
  } else if (e.key === KEY.RIGHT && head.direction !== KEY.LEFT) {
    if (head.direction !== e.key) {
      turnAudio.play()
    }
    head.dy = 0
    head.dx = head.size
    head.direction = e.key
  } else if (e.key === KEY.LEFT && head.direction !== KEY.RIGHT) {
    if (head.direction !== e.key) {
      turnAudio.play()
    }
    head.dy = 0
    head.dx = -head.size
    head.direction = e.key
  }
})

document.addEventListener('keydown', e => {
  if (e.key === 'Enter' && (level.gameOver || level.win)) {
    document.location.reload()
  }
})

function drawSnake() {
  ctx.fillStyle = '#0E7401'
  ctx.fillRect(snakeBody[0].x, snakeBody[0].y, snakeBody[0].size, snakeBody[0].size)
  for (let i = 1; i < snakeBody.length; i++) {
    ctx.fillStyle = '#56D30A'
    ctx.fillRect(snakeBody[i].x, snakeBody[i].y, snakeBody[i].size, snakeBody[i].size)
  }
}

function drawFood() {
  ctx.globalCompositeOperation = 'color'
  ctx.fillStyle = 'red'
  ctx.drawImage(
    food.appleImg,
    0,
    0,
    food.appleImg.width,
    food.appleImg.height,
    food.x,
    food.y,
    food.size,
    food.size
  )
}

const isFoodOnSnake = foodPosition => {
  for (let i = 0; i < snakeBody.length; i++) {
    if (snakeBody[i].x === foodPosition.x && snakeBody[i].y === foodPosition.y) {
      return true
    }
  }
  return false
}

function checkColisionFood() {
  const head = snakeBody[0]
  if (head.x === food.x && head.y === food.y) {
    eatAudio.play()
    snakeBody.push({
      x: snakeBody[snakeBody.length - 1].x,
      y: snakeBody[snakeBody.length - 1].y,
      size: sizeSquare,
      dx: 0,
      dy: 0,
      direction: head.direction
    })
    level.score.textContent++

    if (+level.score.textContent >= level.gridSize) {
      level.win = true
      return
    }

    let newFoodPosition
    do {
      newFoodPosition = {
        x: randomX(),
        y: randomY()
      }
    } while (isFoodOnSnake(newFoodPosition))

    food.x = newFoodPosition.x
    food.y = newFoodPosition.y
  }
}

function moveSnake() {
  for (let i = snakeBody.length - 1; i >= 0; i--) {
    if (i === 0) {
      snakeBody[i].x += snakeBody[i].dx
      snakeBody[i].y += snakeBody[i].dy
    } else {
      snakeBody[i].x = snakeBody[i - 1].x
      snakeBody[i].y = snakeBody[i - 1].y
    }
  }
}

function checkColisionWall() {
  for (let i = 0; i < snakeBody.length; i++) {
    if (snakeBody[i].x >= canvas.width) {
      snakeBody[i].x = 0
    } else if (snakeBody[i].x < 0) {
      snakeBody[i].x = canvas.width
    } else if (snakeBody[i].y >= canvas.height) {
      snakeBody[i].y = 0
    } else if (snakeBody[i].y < 0) {
      snakeBody[i].y = canvas.height
    }
  }
}

function checkColisionSnakeBody() {
  const { x, y } = snakeBody[0]
  for (let i = 1; i < snakeBody.length - 1; i++) {
    if (snakeBody[i].x === x && snakeBody[i].y === y) {
      level.gameOver = true
      deadAudio.play()
    }
  }
}

function checkGameOver() {
  if (level.gameOver) {
    for (let i = 0; i < snakeBody.length; i++) {
      clearInterval(level.setIntervalId)
      ctx.globalCompositeOperation = 'source-over'
      ctx.font = '30px Arial'
      ctx.fillStyle = 'white'
      ctx.fillText('Game Over', canvas.width / 2 - 80, canvas.height / 2)
      ctx.font = '23px Arial'
      ctx.fillText('press "Enter"', canvas.width / 2 - 80, canvas.height / 2 + 23)
      const currentScore = +level.score.textContent
      const localScore = +window.localStorage.getItem('highScore') || currentScore
      if (localScore <= currentScore) {
        window.localStorage.setItem('highScore', currentScore)
      }
    }
  }
}

function checkWin() {
  if (level.win) {
    clearInterval(level.setIntervalId)
    confetti()
    ctx.globalCompositeOperation = 'source-over'
    ctx.font = '30px Arial'
    ctx.fillStyle = 'white'
    ctx.fillText('You Win', canvas.width / 2 - 80, canvas.height / 2)
    ctx.font = '23px Arial'
    ctx.fillText('press "Enter"', canvas.width / 2 - 80, canvas.height / 2 + 23)
    const currentScore = +level.score.textContent
    const localScore = +window.localStorage.getItem('highScore') || currentScore
    if (localScore <= currentScore) {
      window.localStorage.setItem('highScore', currentScore)
    }
  }
}

function drawGrid() {
  for (let f = 0; f < canvas.height; f += sizeSquare) {
    for (let c = 0; c < canvas.width; c += sizeSquare) {
      ctx.strokeStyle = '#fff'
      ctx.lineWidth = level.gridLineSize
      ctx.strokeRect(f, c, f + sizeSquare, c + sizeSquare)
    }
  }
}

function init() {
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  drawGrid()
  drawSnake()
  drawFood()
  moveSnake()
  checkColisionWall()
  checkColisionSnakeBody()
  checkGameOver()
  checkColisionFood()
  checkWin()
}

function play() {
  level.setIntervalId = setInterval(init, interval)
}
play()
