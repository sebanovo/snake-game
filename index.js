const canvas = document.querySelector('canvas')
const ctx = canvas.getContext('2d')
const score = document.getElementById('score')
const highScore = document.getElementById('high-score')

highScore.textContent = window.localStorage.getItem('highScore') || score.textContent

const FPS = 10
const level = {
  score,
  highScore,
  gameOver: false,
  setIntervalId: null
}

const KEY = {
  UP: 'ArrowUp',
  DOWN: 'ArrowDown',
  RIGHT: 'ArrowRight',
  LEFT: 'ArrowLeft'
}

function randomX() {
  return Math.floor(Math.random() * (canvas.width / 10)) * 10
}

function randomY() {
  return Math.floor(Math.random() * (canvas.height / 10)) * 10
}

const head = {
  x: randomX(),
  y: randomY(),
  size: 10,
  dx: 0,
  dy: 0,
  direction: null
}
const snakeBody = [head]

const food = {
  x: randomX(),
  y: randomY(),
  size: 10
}

document.addEventListener('keydown', e => {
  const head = snakeBody[0]
  if (e.key === KEY.UP && head.direction !== KEY.DOWN) {
    head.dx = 0
    head.dy = -head.size
    head.direction = e.key
  } else if (e.key === KEY.DOWN && head.direction !== KEY.UP) {
    head.dx = 0
    head.dy = head.size
    head.direction = e.key
  } else if (e.key === KEY.RIGHT && head.direction !== KEY.LEFT) {
    head.dy = 0
    head.dx = head.size
    head.direction = e.key
  } else if (e.key === KEY.LEFT && head.direction !== KEY.RIGHT) {
    head.dy = 0
    head.dx = -head.size
    head.direction = e.key
  }
})

document.addEventListener('keydown', e => {
  if (e.key === 'Enter' && level.gameOver) {
    document.location.reload()
  }
})

function drawSnake() {
  for (let i = 0; i < snakeBody.length; i++) {
    ctx.fillStyle = 'green'
    ctx.fillRect(snakeBody[i].x, snakeBody[i].y, snakeBody[i].size, snakeBody[i].size)
  }
}

function drawFood() {
  ctx.fillStyle = 'red'
  ctx.fillRect(food.x, food.y, food.size, food.size)
}

function checkColisionFood() {
  const head = snakeBody[0]
  if (head.x === food.x && head.y === food.y) {
    snakeBody.push({
      x: food.x,
      y: food.y,
      size: 10,
      dx: 0,
      dy: 0,
      direction: head.direction
    })
    level.score.textContent++
    for (let i = 0; food.x === snakeBody[i].x && food.y === snakeBody[i].y; i++) {
      food.x = randomX()
      food.y = randomY()
    }
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
    }
  }
}

function checkGameOver() {
  if (level.gameOver) {
    for (let i = 0; i < snakeBody.length; i++) {
      clearInterval(level.setIntervalId)
      ctx.font = '30px Arial'
      ctx.fillStyle = 'white'
      ctx.fillText('Game Over', canvas.width / 2 - 80, canvas.height / 2)
      window.localStorage.setItem('highScore', level.score.textContent)
    }
  }
}

function init() {
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  checkColisionWall()
  checkColisionSnakeBody()
  checkGameOver()
  checkColisionFood()
  drawSnake()
  drawFood()
  moveSnake()
}

level.setIntervalId = setInterval(init, 1000 / FPS)
