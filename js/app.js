class Shape{
  constructor(gridWidth){
    this.gridWidth = gridWidth
    this.shapesList = [
      { name: 'cube', coords: [14,4,5,15] },
      { name: 'bar', coords: [4,3,5,6] },
      { name: 'L', coords: [4,5,6,14] },
      { name: 'inverted-L', coords: [6,4,5,16] },
      { name: 'T', coords: [5,4,6,15] },
      { name: 'S', coords: [15,5,6,14] },
      { name: 'inverted-S',coords: [16,5,6, 17] }
    ]
    this.matrixOfRotation = [
      0, -9, -18, -27, 0, 0, 0, 0, 29, 20, 11, 2, -7, 0, 0,
      0, 0, 0, 0, 31, 22, 13, 0, 0, 0, 0, 0, 0, 0, 0, 33
    ]

    const randomShape = Math.floor(Math.random() * this.shapesList.length)

    this.name = this.shapesList[randomShape].name
    this.position = this.shapesList[randomShape].coords.slice()
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
          return distance >= 0 ? element + this.matrixOfRotation[distance]: element - this.matrixOfRotation[- distance]
        case 'left':
          return element - 1
        case 'right':
          return element + 1
        case 'down':
          return element + this.gridWidth
      }
    })
  }

}

class Grid{
  constructor(player, keysSet, addLineToOpponent, endGame){
    this.gridWidth = 10
    this.gridHeight = 20
    this.player = player
    this.shape
    this.score
    this.gridCollection
    this.arrayKeyPressed = []
    this.gridFrame = document.getElementById(`grid${player}`)
    this.filling = new Array(20).fill(null).map(() => []) // ugly :(
    this.gameControl = keysSet
    this.addLineToOpponent = addLineToOpponent //CallBack
    this.endGame = endGame //CallBack

    //This bind the grid object when document is calling these function
    this.fall = this.fall.bind(this)
    this.handleSimultaneousKeyDown = this.handleSimultaneousKeyDown.bind(this)

    this.init()
  }

  init(){
    //Creation of the initial grid according to the player
    for(let i = 0; i < this.gridWidth * this.gridHeight; i++){
      const cell = document.createElement('div')
      this.gridFrame.appendChild(cell)
    }
    this.gridCollection = Array.from(this.gridFrame.querySelectorAll('div'))
    this.score = document.getElementById(`score${this.player}`)
    this.score.innerHTML = 0

    document.addEventListener('keydown', this.handleSimultaneousKeyDown)
    document.addEventListener('keyup', this.handleSimultaneousKeyDown)

    this.shape = new Shape(this.gridWidth)

  }

  fall(){
    //Move shape down a line
    const continueFall = this.move('down')
    //Stop the time if shape cannot move down anymore
    if(!continueFall && this.shape.position.includes(4)){
      this.endGame(this.player, parseFloat(this.score.innerHTML))
    } else if(!continueFall){
      this.nextShape()
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
      const currentIndexXPos =  currentIndex % this.gridWidth
      const nextIndexXPos = nextIndex % this.gridWidth

      //Check that next index in not colling with the grid filling
      const collideWithAnotherShape = this.contains(nextIndex)
      const reachedTopOrBottom = nextIndex < 0 || nextIndex >= gridLength
      //Check that your not on a side if you want to move left or right
      const cannotGoLeft = currentIndexXPos === 0 && direction === 'left'
      const cannotGoRigth = currentIndexXPos === this.gridWidth - 1 && direction === 'right'
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
    //Make full lines blinking and remove them
    const fullLines = this.findFullLines()
    if(fullLines.length){
      this.blinkFullLine(fullLines)
    } else {
      this.redraw()
    }
  }

  addShapeToGrid(){
    //Add element position to the grid.filling array
    this.shape.position.forEach(element => {
      const elementLine = Math.floor(element / this.gridWidth)
      this.filling[elementLine].push(element)
    })
  }

  findFullLines(){
    const fullLines = []
    this.filling.forEach((line, index) => {
      if(line.length === 10) fullLines.push(index)
    })
    return fullLines
  }

  blinkFullLine(fullLines){
    //Blink the full lines for half a second
    fullLines.forEach(line => {
      for(let i = 0; i < 10; i++){
        this.gridCollection[String(line)+String(i)].classList.add('blink')
      }
    })
    let count = 0
    setInterval(() => {
      if(count === 1) {
        this.gridCollection.forEach(element =>  element.classList.remove('blink'))
        this.removeFullLine()
      }
      count ++
    },500)
  }

  removeFullLine(){
    //Remove full line from the grid.filling array
    for(let i = this.filling.length - 1; i >= 0; i--){
      if(this.filling[i].length === 10){
        this.filling.splice(i,1)
        //And add an empty line at the top of the this.filling Array
        this.filling.unshift(new Array())
        this.increaseScore()
        for(let j = i; j >= 0; j--){
          //Move the lines above down
          this.filling[j].forEach((element, index) => this.filling[j][index] = element + this.gridWidth)
        }
        this.addLineToOpponent(this.player === 1 ? 2 : 1)
        i++
      }
    }
    this.redraw()
  }

  increaseScore(){
    //Increase the score by 1
    this.score.innerHTML = String(parseFloat(this.score.innerHTML) + 1)
  }

  nextShape(){
    this.updateGrid()
    this.shape = new Shape(this.gridWidth)
    this.showShape()
  }

  addOneLine(){
    //Generate a new line with random number of bricks
    const newLine = new Array()
    for(let i = 0; i < 10; i++){
      const addBrick = Boolean(Math.round(Math.random()))
      if(addBrick) newLine.push(190+i)
    }
    //Remove top line
    this.filling.shift()
    //Move the lines up
    this.filling.forEach(line => {
      line.forEach((element, index) => line[index] -= this.gridWidth)
    })
    //Insert new line at the bottom
    this.filling.push(newLine)

    //Redraw grid
    this.redraw()
  }

  redraw(){
    //Remove all css class shape
    this.gridCollection.forEach(element => element.className = '')
    //Add css class stack according to grid.filling content
    this.filling.forEach(element => {
      element.forEach(element => this.gridCollection[element].classList.add('stack'))
    })
  }

  destruct(){
    this.gridFrame.innerHTML = ''
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
    }
  }

  handleSimultaneousKeyDown(e){
    //In two player mode, this allow both players to maintain a key down to move faster
    if(e.type === 'keydown'){
      if(!this.arrayKeyPressed.includes(e.keyCode)) this.arrayKeyPressed.push(e.keyCode)
    } else if (e.type === 'keyup'){
      this.arrayKeyPressed.splice(this.arrayKeyPressed.indexOf(e.keyCode),1)
    }
    this.arrayKeyPressed.forEach(key => this.handleKeydown(key))
  }

}

class Game{
  constructor(){
    this.nbOfPlayer = 1
    this.speed = 1000
    this.gameStarted = false
    this.fallTimerId
    this.keysSets = [[32,37,39,40],[16,65,68,83]]

    this.grids = []
    this.boardPlayer2 = document.querySelector('.player2')
    this.boardBestScore  = document.querySelector('.bestScore')
    this.player1Btn = document.getElementById('1')
    this.player2Btn = document.getElementById('2')
    this.startBtn = document.getElementById('start')
    this.bestScore = document.getElementById('best-score')
    this.winner = document.querySelector('.winner')
    this.addLineToOpponent = this.addLineToOpponent.bind(this)
    this.switchPlayer = this.switchPlayer.bind(this)
    this.startGame = this.startGame.bind(this)

    this.init()
  }

  init(){
    //Display user best score if any
    this.bestScore.innerHTML = localStorage.getItem('tetris-best-score') || 0

    this.player1Btn.addEventListener('click', this.switchPlayer)
    this.player2Btn.addEventListener('click', this.switchPlayer)
    this.startBtn.addEventListener('click', this.startGame)
  }

  switchPlayer(e){
    //Switch between 1 and 2 players view
    if(!e.target.classList.contains('selected')){
      this.nbOfPlayer = this.nbOfPlayer === 1 ? 2 : 1
      this.player1Btn.classList.toggle('selected')
      this.player2Btn.classList.toggle('selected')
      this.boardBestScore.classList.toggle('hide')
      this.boardPlayer2.classList.toggle('hide')
    }
  }

  startGame(){
    if(!this.gameStarted){
      this.createGrids(this.nbOfPlayer)
    } else {
      this.reinitiateGrid()
    }
    this.startBtn.innerHTML = this.startBtn.innerHTML === 'Start'? 'Stop' : 'Start'
    this.player1Btn.disabled = !this.player1Btn.disabled
    this.player2Btn.disabled = !this.player2Btn.disabled
    //Unfocus the start button to avoid interction when spacebar key is pressed
    this.startBtn.blur()
    this.gameStarted = !this.gameStarted
  }

  createGrids(){
    //Create grids based on number of player
    for(let i = 0; i < this.nbOfPlayer; i++){
      const keysSet = i === 0 && this.nbOfPlayer === 2 ? this.keysSets[1]: this.keysSets[0]
      this.grids.push(new Grid(i+1, keysSet, this.addLineToOpponent, this.endGame))
    }
    this.fallTimerId = setInterval(() => {
      this.grids.forEach(grid => grid.fall())
    },this.speed)
  }

  endGame(player, score){
    clearInterval(this.fallTimerId)
    if(this.nbOfPlayer === 1){
      if(this.score > this.bestScore.innerHTML){
        localStorage.setItem('tetris-best-score', this.score)
        this.bestScore.innerHTML = score
      }
      this.winner.innerHTML = 'Game Over'
    } else if(this.nbOfPlayer === 2){
      this.winner.innerHTML = `Player ${player === 1 ? 2 : 1} Lose`
    }
    this.winner.classList.add('display-score')
  }

  reinitiateGrid(){
    //Kill grid objects and reinitialise grids
    clearInterval(this.fallTimerId)
    this.grids.forEach(element => element.destruct())
    this.grids = new Array()
    this.winner.innerHTML = ''
    this.winner.classList.remove('display-score')
  }

  addLineToOpponent(player){
    if(this.nbOfPlayer === 2) this.grids[player-1].addOneLine()
  }

}

document.addEventListener('DOMContentLoaded', () => new Game)
