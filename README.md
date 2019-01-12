# General Assembly Project 1 : Front-End Application

### Timeframe
5 days

## Technologies used

* JavaScript (ES6)
* HTML5
* SCSS
* CSS Animation & transition
* Use of Local Storage
* Font Awesome
* GitHub

## Installation

1. Clone or download the repo
2. Navigate to the root folder "Project-1"
2. Run ```sass scss/style.scss:css/style.css --watch --style compressed```
1. Open the `index.html` in your browser of choice



## Application - MultiPlayer Tetris

![Tetris](https://user-images.githubusercontent.com/39668354/51074298-7ddb0080-1675-11e9-951f-ef79bae2d7b8.png)

You can find a hosted version here ----> [3jtek.github.io/Project-1](https://3jtek.github.io/Project-1/)

---

### Overview
This application is based on the classic Tetris game from 1984 programmed by the Russian game designer Alexey Pajitnov.

The player controls the movements of falling shapes and try to place them in order to create lines. Each line created will then disappear freeing space for the player. The goal is to create as many lines as possible without running out of space.

A MultiPlayer option has also been implemented allowing two players to play simultaneously against each other on the same computer.
The rules are the same than for the single player mode at the expection that,  each time a player clears a line, a new line is added to the opponent's grid enhancing the interaction and improving the competition between the two players.

---

### Controls

The player can move the shapes to the left, right, down and rotate them using the following keys:

1. One Player mode:
  * ← ↓ → & "Space"


2. Multi-Player mode:
  * Player 1 (left): "A", "S", "D" & "L-Shift"
  * Player 2 (right): ← ↓ → & "Space"

---

### Game Instructions

1. The game begins by default on One Player Mode. The user can switch between mode by clicking on the player selection buttons "1" & "2". Note that the best score of the game will also being displayed on the left side (Player 1 only).

![screenshot - One Player Mode](https://user-images.githubusercontent.com/39668354/51078440-d8438380-16ac-11e9-9a41-6fbbeb7a229e.png)

![screenshot - Two Players Mode](https://user-images.githubusercontent.com/39668354/51074718-28552280-167a-11e9-88fd-2c605eac6afe.png)

2. The player(s) will then use the appropriate commands to move the shape and place it into the desired position at the bottom of the grid.

![screenshot - Moving Shape](https://user-images.githubusercontent.com/39668354/51074683-c1d00480-1679-11e9-86c4-ffaf1dd7d1ed.png)

3. If a line is completed, it will blink for a short period of time before being removed from the grid moving down all the other lines above it. The player's score will also be incremented by the number of lines cleared.

![screenshot - Clear a Line](https://user-images.githubusercontent.com/39668354/51074691-d57b6b00-1679-11e9-963b-f872b89a736d.png)

4. If the player's grid is full and the shape cannot fall anymore, the game finishes. If the player beats his best score, the best score will be updated accordingly.

![screenshot - Game Over](https://user-images.githubusercontent.com/39668354/51074696-e330f080-1679-11e9-9788-bc2ae296972a.png)

5. In two Player Mode, each time a player clears a line, a new broken line will be added at the bottom of the opponent's grid.

![screenshot - Adding a line to your opponent](https://user-images.githubusercontent.com/39668354/51074701-f8a61a80-1679-11e9-9da6-6f93546093a0.png)

---

### Grid Solution

Note: The extracts of code below have for only purpose to ease the understanding of the concepts used. They do not reflect precisely the actual code used in this application.

The whole grid is composed of 200 divs flex-wrapped into the main grid body (top-left(0) to bottom-right (199)).

A filling array is also created to record the stack of bricks created by all the shapes that reached the bottom.
```
=> grid.collection = [div, div, div, ...] 200
=> grid.filling = [
                   [] first line
                   [] second line
                   ...
                   [190, 193, 199] last line
                  ]
```

A shape is composed of an array of 4 elements which reflect the current shape's position on the grid:

```
a cube starts at [4, 5, 14, 15]
```

A setInterval allows us to progress the shape down a line each second by adding the width of the grid (i.e. 10) to each shape's element:

```
[4, 5, 14, 15] + 1 line = [14, 15, 24, 25]
```

The movements triggered by the commands follow the same principle, adding grid's width when moving down, +1 to move right and -1 to move left.

The rotation solution is using the calculated distance between the center of rotation of the shape and the element to rotate. A matrix of rotation is then used to return the value to add or remove to the element to obtain his rotation. Note: the first element of the shape's array is always the center of rotation:

```
distance = shape[0] - shape[element]

newElementPosition = matrixRotation[distance]
```

Once a shape reach the bottom of the grid and cannot move anymore, its last coordinates are added to a grid array which represents the stack being built by the previous shapes.

```
shape.forEach(element => grid.filling.push(element)) //Here we actually do a slightly more complex code to calculate the line (grid.filling[line]) to which the element needs to be added to.
```

Each time the grid array receives a new shape, we check if one line has been completed and remove it before redrawing the grid.

```
lineToRemove = []
grid.filling.forEach((lineElements, lineNumber) => if(lineElements.length === 10) lineToRemove.push(lineNumber))
```

---

### Architecture

The codebase is composed of 3 classes:
```
class Shape

class Grid

class Game

document.addEventListener('DOMContentLoaded', () => new Game)
```

The Game class control the main game flow until the player actually starts playing (retrieves best score from local repo, switches between player mode, displays winner...).

When the Start button is clicked, the Game object creates 1 or 2 Grid object(s) that themselves manage everything that happens within the grid (create shape, move shape, fill the grid...).

The last class is used by the grid to create Shape objects. Those shapes have attributes related to their position and their type.

The creation of classes makes things relatively easy since each can only interact with their children which tends to reduce side issues.

However, in several case an object needs to talk to his parent, this is where callbacks are used => i.e. in the case where a line is cleared in the 2 Player Mode, the Grid object needs to tell his parent, the Game object, to add a line to the other Grid object.

---

### Challenges

* Rotation: the algorithm to work out the rotation of an element was challenging especially keeping track of where will the center be once the shape gets rotated. Putting the center of rotation at the first index of the array really simplified the solution.

* Clear lines: multiple lines to clear, especially when not consecutive (3 full lines separated by 1 none full line), increased the difficulty of the code. Each line needed to be removed one by one recalculating the new mapping of the grid each time to make sure that right sequence is kept.

* Player Mode: In two player mode, both player couldn't hold a key at the same time which is an issue to move the shape down quickly. This is due to the event event listener not keeping track of a key down if another key is pressed. To overcome this problem,  an array of 'key pressed' has been created to store all the current key being pressed down. The 'keydown' event listener feeds the array while another event listener 'keyup' remove the key from it.

```
if(e.type === 'keydown'){
  if(!this.arrayKeyPressed.includes(e.keyCode)) this.arrayKeyPressed.push(e.keyCode)
} else if (e.type === 'keyup'){
  this.arrayKeyPressed.splice(this.arrayKeyPressed.indexOf(e.keyCode),1)
}
this.arrayKeyPressed.forEach(key => this.handleKeydown(key))
```

---

### Wins

Using classes really help the code to be clearer and isolate the objects form each other.
Any change made to player 1 will automatically be reflected on player 2 since both objects are form the same class Grid.


---

### Future Enhancements

* The solution to keep track of the grid is too complex. The  grid.filling array which contains all indexes of the divs forming the stack could be deleted since all the information exist already in the grid.collection which contains all divs.

* The 2 Player responsiveness of the keys pressed is sometimes poor. This is probably due to the solution implemented to allow 2 keys to be pressed down at the same time (to be reviewed).

### Future Features

* Increasing Speed: every nb of line to create some kind of difficulty for the player as he is clearing more and more lines.

* Display Upcoming Element: this will allow the player to make smart choices about where to place the current shape knowing what shape is coming next.
