const gridWidth = 10
const gridHeight = 20
const speed = 1000
const shapesList = [
  { name: 'cube', color: 'green', coords: [14,4,5,15] },
  { name: 'bar', color: 'red', coords: [4,3,5,6] },
  { name: 'L', color: 'black', coords: [4,5,6,14] },
  { name: 'inverted-L', color: 'saumon', coords: [6,4,5,16] },
  { name: 'T', color: 'mauve', coords: [5,4,6,15] },
  { name: 'S', color: 'orange', coords: [15,5,6,14] },
  { name: 'inverted-S', color: 'blue', coords: [16,5,6, 17] }
]
const matrixOfRotation = [
  0, -9, -18, -27, 0, 0, 0, 0, 29, 20, 11, 2, -7, 0, 0,
  0, 0, 0, 0, 31, 22, 13, 0, 0, 0, 0, 0, 0, 0, 0, 33
]
let nbOfPlayer,fallTimerId,
  boardBestScore, bestScore,
  boardPlayer2,
  player1Btn, player2Btn, startBtn,
  gameStarted
let grids = []
const keysSets = [[32,37,39,40],[16,65,68,83]]

class Grid{
  constructor(player, callback){
    this.player = player
    this.gridFrame = document.getElementById(`grid${player}`)
    this.gridCollection
    this.filling = new Array(20).fill(null).map(() => []) // ugly :(
    this.shape
    this.score
    this.addLineToOpponent = callback
    this.gameControl = player === 1 && nbOfPlayer === 2 ? keysSets[1]:keysSets[0]
    this.arrayKeyPressed = []

    this.fall = this.fall.bind(this)
    this.handleSimultaneousKeyDown = this.handleSimultaneousKeyDown.bind(this)
    this.init()
  }

  init(){
    //Creation of the initial grid according to the player
    for(let i = 0; i < gridWidth * gridHeight; i++){
      const cell = document.createElement('div')
      this.gridFrame.appendChild(cell)
    }
    this.gridCollection = Array.from(this.gridFrame.querySelectorAll('div'))

    this.score = document.getElementById(`score${this.player}`)
    this.score.innerHTML = 0
    // document.addEventListener('keydown', this.handleKeydown)
    document.addEventListener('keydown', this.handleSimultaneousKeyDown)
    document.addEventListener('keyup', this.handleSimultaneousKeyDown)


    // document.addEventListener('keyup', (e) => console.log('keyup', e.keyCode))

    this.shape = new Shape()

  }
  handleSimultaneousKeyDown(e){
    //In two player mode, this allow both players maintain a key down to move faster
    if(e.type === 'keydown'){
      if(!this.arrayKeyPressed.includes(e.keyCode)) this.arrayKeyPressed.push(e.keyCode)
    } else if (e.type === 'keyup'){
      this.arrayKeyPressed.splice(this.arrayKeyPressed.indexOf(e.keyCode),1)
    }
    this.arrayKeyPressed.forEach(key => this.handleKeydown(key))
  }

  destruct(){
    this.gridFrame.innerHTML = ''
    clearInterval(fallTimerId)
  }

  fall(){
    //Move shape down a line
    const continueFall = this.move('down')
    //Stop the time if shape cannot move down anymore
    if(!continueFall && this.shape.position.includes(4)){
      endGame(this.player, parseFloat(this.score.innerHTML))
    } else if(!continueFall){
      this.nextShape()
      console.log(this.filling);
    }
  }

  hideShape(){
    this.shape.position.forEach(element => this.gridCollection[element].classList.remove('shape'))
  }

  showShape(){
    this.shape.position.forEach(element => this.gridCollection[element].classList.add('shape'))

  }

  move(direction){
    //Get new shape postion
    const nextShapePosition = this.shape.getNextPosition(direction)
    //If move possible update shape position with new position
    const isMovePossible = this.checkIfMovePossible(nextShapePosition, direction)
    this.hideShape()
    if(isMovePossible) this.shape.position = nextShapePosition
    this.showShape()
    return isMovePossible
  }

  checkIfMovePossible(nextShapePosition, direction){
    let movePossible = true
    nextShapePosition.forEach((nextIndex, arrayIndex) => {
      // const nextIndex = getNextPosition(direction, index)
      const gridLength = this.gridCollection.length
      const currentIndex = this.shape.position[arrayIndex]
      const currentIndexXPos =  currentIndex % gridWidth
      const nextIndexXPos = nextIndex % gridWidth

      //Check that next index in not colling with the grid filling
      const collideWithAnotherShape = this.contains(nextIndex)
      const reachedTopOrBottom = nextIndex < 0 || nextIndex >= gridLength
      //Check that your not on a side if you want to move left or right
      const cannotGoLeft = currentIndexXPos === 0 && direction === 'left'
      const cannotGoRigth = currentIndexXPos === gridWidth - 1 && direction === 'right'
      //During rotation, check that the next element didn't appear on the other side
      //if roation was being made too close from a border
      const cannotRotate = Math.abs(currentIndexXPos - nextIndexXPos) > 2

      if(collideWithAnotherShape || reachedTopOrBottom || cannotGoLeft ||
        cannotGoRigth || cannotRotate)
        movePossible = false

    })
    return movePossible
  }

  contains(nextIndex){
    //Concat all the line of the grid object and search if nextIndex is present
    const concatGrid = this.filling.reduce((acc, element) => acc.concat(element),[])
    return concatGrid.includes(nextIndex)
  }

  updateGrid(){
    //Add shape to the grid
    this.addShapeToGrid()
    //Check and remove lines if full
    this.removeFullLine()
    //Reset and redraw the updated grid
    this.redraw()
  }

  addShapeToGrid(){
    this.shape.position.forEach(element => {
      //Add a line in grid.filling if it doesn't exist yet (0 bottom to 19 top)
      const elementLine = Math.floor(element / gridWidth)
      //Add element position to the grid.filling array
      this.filling[elementLine].push(element)
    })
  }

  removeFullLine(){
    //If a line is completed, remove the line from the grid.filling array
    for(let i = this.filling.length - 1; i >= 0; i--){
      if(this.filling[i].length === 10){
        this.filling.splice(i,1)
        //And add an empty line at the top of the this.filling Array
        this.filling.unshift(new Array())
        this.increaseScore()
        for(let j = i; j >= 0; j--){
          //Move the lines above down
          this.filling[j].forEach((element, index) => this.filling[j][index] = element + gridWidth)
        }
        if(nbOfPlayer === 2) this.addLineToOpponent(this.player === 1 ? 2 : 1)
        i++
      }
    }
  }

  addOneLine(){
    //Generate a new line with random number of bricks
    const newLine = new Array()
    for(let i = 0; i < 10; i++){
      const addAnBrick = Boolean(Math.round(Math.random()))
      if(addAnBrick) newLine.push(190+i)
    }
    //Remove top line
    this.filling.shift()
    //Move the lines up
    this.filling.forEach(line => {
      line.forEach((element, index) => line[index] -= gridWidth)
    })
    //Insert new line at the bottom
    this.filling.push(newLine)

    //Redraw grid
    this.redraw()
    console.log(`player${this.player}`,this.filling);
  }

  increaseScore(){
    //Increase the score by 1
    this.score.innerHTML = String(parseFloat(this.score.innerHTML) + 1)
  }

  redraw(){
    //Remove all css class shape
    this.gridCollection.forEach(element => element.classList.remove('shape'))
    //Add css class shape according to grid.filling content
    this.filling.forEach(element => {
      element.forEach(element => this.gridCollection[element].classList.add('shape'))
    })
  }

  nextShape(){
    this.updateGrid()
    //Lose condition
    this.shape = new Shape()
    this.showShape()
  }

  handleKeydown(key){
    switch(key) {
      case this.gameControl[0]:
        this.move('rotate')
        break
      case this.gameControl[1]:
        this.move('left')
        break
      case this.gameControl[2]:
        this.move('right')
        break
      case this.gameControl[3]:
        this.move('down')
        break
      case 80:
        clearInterval(fallTimerId)
        break
    }
  }
}

class Shape{
  constructor(){
    this.name
    this.color
    this.position = []
    this.init()
  }

  init(){
    const randomShape = Math.floor(Math.random() * shapesList.length)
    //careful here, do not do "this.position = shapeLi..." otherwise the shapesList will be updated as the shape moves.
    this.name = shapesList[randomShape].name
    this.color = shapesList[randomShape].color
    this.position = shapesList[randomShape].coords.slice()
  }

  getNextPosition(direction){
    let distance
    return this.position.map(element => {
      switch(direction){
        case 'rotate':
        //If first element (center of rotation) or element a squar do not rotate
          if(element === this.position[0] || this.name === 'cube') return element
          //Calculation of the distance between the center of rotation and the element to rotate
          distance = this.position[0] - element
          //Return the element new position using the rotation matrix
          return distance >= 0 ? element + matrixOfRotation[distance]: element - matrixOfRotation[- distance]
        case 'left':
          return element - 1
        case 'right':
          return element + 1
        case 'down':
          return element + gridWidth
      }
    })
  }

}

function endGame(player, score){
  clearInterval(fallTimerId)
  if(nbOfPlayer === 1){
    if(score > bestScore.innerHTML){
      localStorage.setItem('tetris-best-score', score)
      bestScore.innerHTML = score
    }
    alert('you lost')
  } else if(nbOfPlayer === 2){
    alert(`Player ${player} lose`)
  }
}

function reinitiateGrid(){
  //Kill grid objects and reinitialise grids
  grids.forEach(element => element.destruct())
  grids = new Array()
}

function addLineToOpponent(player){
  grids[player-1].addOneLine()
}

function createGrids(){
  //Create grids based on number of player
  for(let i = 0; i < nbOfPlayer; i++){
    grids.push(new Grid(i+1, addLineToOpponent))
  }
  fallTimerId = setInterval(() => {
    grids.forEach(grid => grid.fall())
  },speed)
}

function startGame(){
  if(!gameStarted){
    createGrids(nbOfPlayer)
  } else {
    reinitiateGrid()
  }
  startBtn.innerHTML = startBtn.innerHTML === 'Start'? 'Stop' : 'Start'
  player1Btn.disabled = !player1Btn.disabled
  player2Btn.disabled = !player2Btn.disabled
  //Unfocus the start button to avoid interction when spacebar key is pressed
  startBtn.blur()
  gameStarted = !gameStarted
}

function switchPlayer(e){
  //Switch between 1 and 2 players view
  if(!e.target.classList.contains('selected')){
    nbOfPlayer = nbOfPlayer === 1 ? 2 : 1
    player1Btn.classList.toggle('selected')
    player2Btn.classList.toggle('selected')
    boardBestScore.classList.toggle('hide')
    boardPlayer2.classList.toggle('hide')
  }
}

function init(){
  //Set default nb of player to 1
  nbOfPlayer = 1

  boardBestScore  = document.querySelector('.bestScore')
  boardPlayer2 = document.querySelector('.player2')
  player1Btn = document.getElementById('1')
  player2Btn = document.getElementById('2')
  startBtn = document.getElementById('start')
  bestScore = document.getElementById('best-score')

  //Display user best score if any
  bestScore.innerHTML = localStorage.getItem('tetris-best-score') || 0

  player1Btn.addEventListener('click', switchPlayer)
  player2Btn.addEventListener('click', switchPlayer)
  startBtn.addEventListener('click', startGame)
}

document.addEventListener('DOMContentLoaded', init)
