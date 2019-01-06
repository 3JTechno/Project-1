const gridWidth = 10
const gridHeight = 20
const delay = 1000
let gridCollection
let fallTimerId
const matrixOfRotation = [0, -9, -18, -27, 0, 0, 0, 0, 29, 20, 11, 2, -7, 0, 0, 0, 0, 0, 0, 31, 22, 13, 0, 0, 0, 0, 0, 0, 0, 0, 33]
const shapesList = [['cube', 'green',[14,4,5,15]], ['bar', 'red', [4,3,5,6]], ['L', 'black', [4,5,6,14]], ['inverted-L', 'saumon', [6,4,5,16]], ['T', 'mauve', [5,4,6,15]], ['S', 'orange', [15,5,6,14]],['inverted-S', 'blue', [16,5,6, 17]]]
let shape
let grid

class Grid{
  constructor(){
    this.filling = []
    this.init()
  }

  init(){
    //Creation of the initial grid with divs
    const gridFrame = document.getElementById('grid')
    for(let i = 0; i < gridWidth * gridHeight; i++){
      const cell = document.createElement('div')
      gridFrame.appendChild(cell)
    }
    gridCollection = Array.from(document.querySelectorAll('#grid div'))
  }
  contains(nextIndex){
    //Concat all the line of the grid object and search if nextIndex is present
    const concatGrid = grid.filling.reduce((acc, element) => acc.concat(element),[])
    return concatGrid.includes(nextIndex)
  }
  addShapeToGrid(){
    shape.position.forEach(element => {
      //Add a line in grid.filling if it doesn't exist yet (0 bottom to 19 top)
      const elementLine = gridHeight - Math.floor(element / gridWidth)
      while(grid.filling.length < elementLine) {
        const newLine = []
        grid.filling.push(newLine)
      }
      //Add element position to the grid.filling array
      grid.filling[elementLine - 1].push(element)
    })
  }
  removeFullLine(){
    //If a line is completed, remove the line from the grid.filling array
    for(let i = 0; i < grid.filling.length; i++){
      if(grid.filling[i].length === 10){
        grid.filling.splice(i,1)
        //Move the lines above down
        for(let j = i; j < grid.filling.length; j++){
          grid.filling[j].forEach((element, index) => grid.filling[j][index] = element + gridWidth)
        }
        i--
      }
    }
  }
  redraw(){
    //Remove all css class shape
    gridCollection.forEach(element => element.classList.remove('shape'))
    //Add css class shape according to grid.filling content
    grid.filling.forEach(element => {
      element.forEach(element => gridCollection[element].classList.add('shape'))
    })
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
    this.name = shapesList[randomShape][0]
    this.color = shapesList[randomShape][1]
    this.position = [...new Set(shapesList[randomShape][2])]
  }
  hide(){
    this.position.forEach(element => gridCollection[element].classList.remove('shape'))
  }
  show(){
    this.position.forEach(element => gridCollection[element].classList.add('shape'))
  }
  move(direction){

  }
}

function updateGrid(){
  //Add shape to the grid
  grid.addShapeToGrid()
  //Check and remove lines if full
  grid.removeFullLine()
  //Reset and redraw the updated grid
  grid.redraw()
}

function nextShape(){
  updateGrid()
  //Loose condition, just to avoid memory leak
  if(shape.position.includes(4)){
    alert('you lost')
  } else {
    shape = new Shape()
    shape.show()
    fall()
  }
}

function checkIfMovePossible(direction){
  let movePossible = true
  shape.position.forEach(index => {
    const nextIndex = getNextPosition(direction, index)
    const gridLength = gridCollection.length
    const indexXPos = index % gridWidth
    const nextIndexXPos = nextIndex % gridWidth
    //Check that next index in not colling with the grid filling
    if(grid.contains(nextIndex) ||
    nextIndex < 0 || nextIndex > gridLength ||
    //Check that your not on a side if you want to move left or right
    indexXPos === 0 && direction === 'left' ||
    indexXPos === gridWidth - 1 && direction === 'right' ||
    //During rotation, check that the next element didn't appear on the other side
    //if roation was being made too close from a border
    Math.abs(indexXPos - nextIndexXPos) > 2
    ) movePossible = false
  })
  return movePossible
}

function getNextPosition(direction, element){
  let distance
  switch(direction){
    case 'rotate':
      //If first element (center of rotation) or element a squar do not rotate
      if(element === shape.position[0] || shape.name === 'cube') return element
      //Calculation of the distance between the center of rotation and the element to rotate
      distance = shape.position[0] - element
      //Return the element new position using the rotation matrix
      return distance >= 0 ? element + matrixOfRotation[distance]: element - matrixOfRotation[- distance]
    case 'left':
      return element - 1
    case 'right':
      return element + 1
    case 'down':
      return element + gridWidth
  }
}

function move(direction){
  //Change the position of the shape and update the grid
  if(checkIfMovePossible(direction)){
    shape.hide()
    shape.position.forEach((element,index) => {
      shape.position[index] = getNextPosition(direction, element)
    })
    shape.show()
    return true
  } else {
    return false
  }
}

function fall(){
  //Move shape down a line
  const continueFall = move('down')
  //Stop the time if shape cannot move down anymore
  if(!continueFall) return nextShape()
  //Relauch the fall function every "delay" ms
  fallTimerId = setTimeout(fall, delay)
}


function init(){
  //Create grid object
  grid = new Grid()
  //create shape object
  shape = new Shape()
  console.log(shape);
  shape.show()
  fall()
}

function handleKeydown(e){
  switch(e.keyCode) {
    case 32:
      move('rotate')
      break
    case 37:
      move('left')
      break
    case 39:
      move('right')
      break
    case 40:
      move('down')
      break
    case 80:
      clearInterval(fallTimerId)
      break
  }
}

document.addEventListener('keydown', handleKeydown)

document.addEventListener('DOMContentLoaded', init)
