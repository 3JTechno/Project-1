const gridWidth = 10
const gridHeight = 20

function init(){

  const grid = document.getElementById('grid')

  for(let i = 0; i < gridWidth * gridHeight; i++){
    const cell = document.createElement('div')
    grid.appendChild(cell)
  }

  // const form = [5,6,15,16]
  // form.forEach(formIndex => grid.classList.toggle('form'))
  //

}

document.addEventListener('DOMContentLoaded', init)
