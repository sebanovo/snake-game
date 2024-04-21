const canvas = document.querySelector('canvas')
const ctx = canvas.getContext('2d')
const score = document.getElementById('score')
const highScore = document.getElementById('high-score')

highScore.textContent = window.localStorage.getItem('highScore') || score.textContent
const FPS = 100
const sizeSquareMap = canvas.width / 15
const totalSquare = canvas.width * canvas.height / Math.pow(sizeSquareMap, 2)

const level = {
  score,
  highScore,
  win: false,
  gameOver: false,
  setIntervalId: null,
  gridLineSize: 0.2,
  gridSize: totalSquare 
}



const KEY = {
  UP: 'ArrowUp',
  DOWN: 'ArrowDown',
  RIGHT: 'ArrowRight',
  LEFT: 'ArrowLeft'
}

function randomX() {
  return Math.floor(Math.random() * (canvas.width / sizeSquareMap)) * sizeSquareMap
}

function randomY() {
  return Math.floor(Math.random() * (canvas.height / sizeSquareMap)) * sizeSquareMap
}

const head = {
  x: randomX(),
  y: randomY(),
  size: sizeSquareMap,
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
  size: sizeSquareMap,
  appleImg
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
  if (e.key === 'Enter' && (level.gameOver || level.win)) {
    document.location.reload()
  }
})

function drawSnake() {
  for (let i = 0; i < snakeBody.length; i++) {
    ctx.globalCompositeOperation = 'color'
    ctx.fillStyle = 'green'
    ctx.fillRect(snakeBody[i].x, snakeBody[i].y, snakeBody[i].size, snakeBody[i].size)
  }
}

function drawFood() {
  ctx.globalCompositeOperation = 'color'
  ctx.fillStyle = 'red'
  ctx.drawImage(food.appleImg,0,0,food.appleImg.width, food.appleImg.height,food.x, food.y, food.size, food.size)
}

function checkColisionFood() {
  const head = snakeBody[0]
  if (head.x === food.x && head.y === food.y) {
    snakeBody.push({
      x: food.x,
      y: food.y,
      size: sizeSquareMap,
      dx: 0,
      dy: 0,
      direction: head.direction
    })
    level.score.textContent++
    // check winner
    if (+level.score.textContent >= level.gridSize) {
      level.win = true
      return
    }
    for (let i = 0; i < snakeBody.length; i++) {
      while (snakeBody[i].x === food.x && snakeBody[i].y === snakeBody[i].y) {
        food.x = randomX()
        food.y = randomY()
      }
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
  for (let f = 0; f < canvas.height; f += sizeSquareMap) {
    for (let c = 0; c < canvas.width; c += sizeSquareMap) {
      ctx.globalCompositeOperation = 'color'
      ctx.strokeStyle = '#000'
      ctx.lineWidth = level.gridLineSize
      ctx.strokeRect(f, c, f + sizeSquareMap, c + sizeSquareMap)
    }
  }
}

function init() {
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  drawGrid()
  drawSnake()
  drawFood()
  checkColisionWall()
  checkColisionSnakeBody()
  checkGameOver()
  checkColisionFood()
  checkWin()
  moveSnake()
}

level.setIntervalId = setInterval(init, FPS)
