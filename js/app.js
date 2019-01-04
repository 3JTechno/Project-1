const gridWidth = 10
const gridHeight = 20
const delay = 1000
let fallTimerId
const form = [4,5,14,15] //Square form
let gridCollection

function stopForm(){
  clearInterval(fallTimerId)
}

function move(direction){
  let movePossible = true
  //Check if movement is possible
  form.forEach(element => {
    if(element % gridWidth === 0 && direction === 'left' ||
      element % gridWidth === gridWidth - 1 && direction === 'right' ||
      element + gridWidth >= (gridHeight * gridWidth) && direction ==='down'
    ){
      movePossible = false
    }
  })
  if(movePossible){
    form.forEach(element => gridCollection[element].classList.toggle('form'))
    form.forEach((element,index) => {
      switch(direction){
        case 'left':
          form[index] = element - 1
          break
        case 'right':
          form[index] = element + 1
          break
        case 'down':
          form[index] = element + gridWidth
      }
    })
    form.forEach(element => gridCollection[element].classList.toggle('form'))
  }
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

function fall(){
  let continueFall = true
  //Hide the current form
  form.forEach(element => gridCollection[element].classList.toggle('form'))
  //Change the form position to reflect the fall down by a line
  form.forEach((element, index) => {
    form[index] = element + gridWidth
  })
  //Redraw the element once fall by one line
  form.forEach(element => gridCollection[element].classList.toggle('form'))
  //Check if form has reached the bottom
  form.forEach(element => {
    if(element + gridWidth >= gridHeight * gridWidth){
      continueFall = false
    }
  })
  if(!continueFall) return stopForm()
  //Relauch the fall function every "delay" ms
  fallTimerId = setTimeout(fall, delay)
}

function init(){
  //Creation of the initial grid with divs
  const gridFrame = document.getElementById('grid')
  for(let i = 0; i < gridWidth * gridHeight; i++){
    const cell = document.createElement('div')
    gridFrame.appendChild(cell)
  }
  //Display the first form at the top of the grid
  gridCollection = Array.from(document.querySelectorAll('#grid div'))
  form.forEach(formIndex => gridCollection[formIndex].classList.toggle('form'))

  fall()
}

document.addEventListener('keydown', handleKeydown)

document.addEventListener('DOMContentLoaded', init)
