const gridWidth = 10
const gridHeight = 20
const delay = 1000
let gridCollection
let fallTimerId
const gridFilling = []
const matrixRotation = [0, -9, -18, -27, 0, 0, 0, 0, 29, 20, 11, 2, -7, 0, 0, 0, 0, 0, 0, 31, 22, 13, 0, 0, 0, 0, 0, 0, 0, 0, 33]
const shapesList = [[14,4,5,15], [4,3,5,6], [4,5,6,14], [6,4,5,16], [5,4,6,15], [15,5,6,14], [16,5,6, 17]]
let shape
let grid

class Grid{
  constructor(){
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
}

class Shape{
  constructor(){
    this.position = []
    this.init()
  }
  init(){
    const randomShape = Math.floor(Math.random() * shapesList.length)
    //careful here, do not do "this.position = shapeLi..." otherwise the shapesList will be updated as the shape moves.
    this.position = [...new Set(shapesList[randomShape])]
    console.log(this.position);
  }
  hide(){
    this.position.forEach(element => gridCollection[element].classList.remove('shape'))
  }
  show(){
    this.position.forEach(element => gridCollection[element].classList.add('shape'))
  }
}

function updateGrid(){
  console.table(gridFilling);
  shape.position.forEach(element => {
    //Add a line in gridFilling if it doesn't exist yet (0 bottom to 19 top)
    while(20 - Math.floor(element / gridWidth) > gridFilling.length){
      const newLine = []
      gridFilling.push(newLine)
    }
    //Fill gridFilling with the position of the shape
    gridFilling[20 - Math.floor(element/gridWidth) - 1].push(element)
  })
  console.table(gridFilling);

  //Is there a line completed ? Remove the line from the Array
  for(let i = 0; i < gridFilling.length; i++){
    if(gridFilling[i].length === 10){
      gridFilling.splice(i,1)
      //Add gridWidth to the position above the deleted to move them down
      for(let j = i; j < gridFilling.length; j++){
        gridFilling[j].forEach((element, index) => gridFilling[j][index] = element + gridWidth)
      }
      i--
    }
  }
  //Reset the all gridCollection
  gridCollection.forEach(element => element.classList.remove('shape'))
  //Redraw the entire gridCollection based on the gridFilling array
  gridFilling.forEach(element => {
    element.forEach(element => gridCollection[element].classList.add('shape'))
  })
  console.table(gridFilling);
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
  //Check if movement is possible
  shape.position.forEach(element => {
    //Obtain the next position of each element
    const nextIndex = getNextPosition(direction, element)
    //Check that the shape is not on a border before moving
    if(element % gridWidth === 0 && direction === 'left' ||
    element % gridWidth === gridWidth - 1 && direction === 'right' ||
    element + gridWidth >= (gridHeight * gridWidth) && direction ==='down'||
    //Verify that the next position doesn't contain a 'shape' class and is not itself
    (gridCollection[nextIndex].classList.contains('shape') && !shape.position.includes(nextIndex))
    ) movePossible = false
  })
  return movePossible
}

function getNextPosition(direction, element){
  let distance
  switch(direction){
    case 'rotate':
      //If first element (center of rotation) do not change its position
      if(element === shape.position[0]) return shape.position[0]
      //Calculation of the distance between the center of rotation and the element to rotate
      distance = shape.position[0] - element
      //Return the rotated element using the rotation matrix
      if(distance >= 0){
        return element + matrixRotation[distance]
      } else {
        return element - matrixRotation[- distance]
      }
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
    shape.position.forEach(element => gridCollection[element].classList.toggle('shape'))
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
