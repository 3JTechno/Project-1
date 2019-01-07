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

class Grid{
  constructor(player){
    this.player = player
    this.gridCollection
    this.filling = new Array(20).fill(null).map(() => []) // ugly :(
    this.shape
    this.fallTimerId

    this.fall = this.fall.bind(this)
    this.handleKeydown = this.handleKeydown.bind(this)

    this.init()
  }

  init(){
    //Creation of the initial grid according to the player
    const gridSelection = this.player === 'player1' ? 'grid1':'grid2'
    const gridFrame = document.getElementById(gridSelection)
    for(let i = 0; i < gridWidth * gridHeight; i++){
      const cell = document.createElement('div')
      gridFrame.appendChild(cell)
    }
    this.gridCollection = Array.from(gridFrame.querySelectorAll('div'))

    document.addEventListener('keydown', this.handleKeydown)

    this.shape = new Shape()
    this.fall()
  }

  fall(){
    //Move shape down a line
    const continueFall = this.move('down')
    //Stop the time if shape cannot move down anymore
    if(!continueFall) this.nextShape()
    //Relauch the fall function every "speed" ms
    this.fallTimerId = setTimeout(this.fall, speed)
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
        //Move the lines above down
        for(let j = i; j >= 0; j--){
          this.filling[j].forEach((element, index) => this.filling[j][index] = element + gridWidth)
        }
        i++
      }
    }
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
    if(this.shape.position.includes(4)){
      alert('you lost')
    } else {
      this.shape = new Shape()
      this.showShape()
    }
  }

  handleKeydown(e){
    switch(e.keyCode) {
      case 32:
        this.move('rotate')
        break
      case 37:
        this.move('left')
        break
      case 39:
        this.move('right')
        break
      case 40:
        this.move('down')
        break
      case 80:
        clearInterval(this.fallTimerId)
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

function init(){
  //Create grid object
  const grid1 = new Grid('player1')
  const grid2 = new Grid('player2')
}

document.addEventListener('DOMContentLoaded', init)
