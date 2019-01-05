const gridWidth = 10
const gridHeight = 20
const delay = 1000
let gridCollection
let shape
let fallTimerId
const gridFilling = []

function updateGrid(){
  shape.forEach(element => {
    //Add each element of the shape to the corresponding row of the grid (0 bottom to 19 top)
    //Add a line in gridFilling if it doesn't exist yet
    while(20 - Math.floor(element / gridWidth) > gridFilling.length){
      const newLine = []
      gridFilling.push(newLine)
    }
    gridFilling[20 - Math.floor(element/gridWidth) - 1].push(element)
  })
  console.log(gridFilling);
}

function nextShape(){
  updateGrid()
  //Loose condition, just to avoid memory leak
  if(shape.includes(4)){
    alert('you lost')
  } else {
    shape = [4,5,14,15] //Square shape
    shape.forEach(shapeIndex => gridCollection[shapeIndex].classList.toggle('shape'))
    fall()
  }
}

function checkIfMovePossible(direction){
  let movePossible = true
  //Check if movement is possible
  shape.forEach(element => {
    const nextIndex = getNextPosition(direction, element)
    if(element % gridWidth === 0 && direction === 'left' ||
    element % gridWidth === gridWidth - 1 && direction === 'right' ||
    element + gridWidth >= (gridHeight * gridWidth) && direction ==='down'||
    //Verify that the next position doesn't contain a 'shape' class and is not itself
    (gridCollection[nextIndex].classList.contains('shape') && !shape.includes(nextIndex))
    ) movePossible = false
  })
  return movePossible
}

function getNextPosition(direction, element){
  switch(direction){
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
    shape.forEach(element => gridCollection[element].classList.toggle('shape'))
    shape.forEach((element,index) => {
      shape[index] = getNextPosition(direction, element)
    })
    shape.forEach(element => gridCollection[element].classList.toggle('shape'))
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

function createGrid(){
  //Creation of the initial grid with divs
  const gridFrame = document.getElementById('grid')
  for(let i = 0; i < gridWidth * gridHeight; i++){
    const cell = document.createElement('div')
    gridFrame.appendChild(cell)
  }
  gridCollection = Array.from(document.querySelectorAll('#grid div'))
}

function init(){
  //Create initial grid
  createGrid()
  //Display the first shape at the top of the grid
  shape = [4,5,14,15] //Square shape
  shape.forEach(shapeIndex => gridCollection[shapeIndex].classList.toggle('shape'))
  fall()
}

function handleKeydown(e){
  switch(e.keyCode) {
    case 37:
      move('left')
      break
    case 39:
      move('right')
      break
    case 40:
      move('down')
      break
  }
}

document.addEventListener('keydown', handleKeydown)

document.addEventListener('DOMContentLoaded', init)
