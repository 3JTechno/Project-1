# General Assembly Project 1 : Front-end game

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
2. Run ```scss scss/style.scss:css/style.css --watch --style compressed```
1. Open the `index.html` in your browser of choice

## Game - MultiPlayer Tetris

![Tetris](https://user-images.githubusercontent.com/39668354/51074298-7ddb0080-1675-11e9-951f-ef79bae2d7b8.png)

You can find a hosted version here ----> [3jtechno.github.io/Project-1](https://3jtechno.github.io/Project-1/)

### Game overview
This game is based on the classic Tetris game from 1984 programmed the Russian game designer Alexey Pajitnov.

The player controls the movement of following shapes and try to place them in order to create lines. Each line created will then disappear freeing space. The goal is to create as many lines as possible without running out of space (when shapes cannot fall anymore).


On top of the single player mode, a MultiPlayer option has been added allowing two players to play simultaneously on the same computer against each other.
The rules are the same than the single player mode (the player that is running out of space loses).
Additionally, each time a player clear a line, a new line will be added to his opponent's grid enhancing the interaction and improving the competition feeling between the two players.

### Controls

The player can move the shape left, right, down and rotate them using the following keys:

1. One player mode:
- ← ↓ → & "Space"

2. MultiPlayer mode
- Player1 (left): "A", "S", "D" & "L-Shift"
- Player2 (right): ← ↓ → & "Space"

### Game Instructions
1. The game begins by default on One Player mode. The user can switch between mode by clicking on the player selection buttons "1" & "2". Note that the best score will also being displayed on the left side (Player 1 only).

![screenshot - One Player Mode](https://user-images.githubusercontent.com/39668354/51030639-f9fc1800-1591-11e9-9000-07125c45f72b.png)

![screenshot - Two Players Mode](https://user-images.githubusercontent.com/39668354/51030669-1009d880-1592-11e9-9d23-184848f129c4.png)

2. The player(s) will then use the appropriate commands to move the shape and place it into the desired position at the bottom of the grid.

![screenshot - Moving Shape](https://user-images.githubusercontent.com/39668354/51030669-1009d880-1592-11e9-9d23-184848f129c4.png)

3. If a line is completed, it will blink for a short time before being removed from the grid moving down all the other lines above. The player's score will also be incremented by the number of lines cleared.

![screenshot - Clear a Line](https://user-images.githubusercontent.com/39668354/51031226-cfab5a00-1593-11e9-9c90-b3f3aba7bc58.png)

4. If the player's grid is full and shape cannot fall anymore, the game finishes. If the player's beats his best score, best score will be updated accordingly.

![screenshot - Game Over](https://user-images.githubusercontent.com/39668354/51031142-8c50eb80-1593-11e9-8911-d1bbb5eeecb9.png)

5. In two player's mode, each time a player clear a line, a new line will be added at the bottom of the opponent's grid.

![screenshot - Adding a line to your opponent](https://user-images.githubusercontent.com/39668354/51030805-6bd46180-1592-11e9-871e-c356d9402261.png)

## Grid Solution

Note: The extracts of code below have for only purpose to ease the understanding of the concepts used. They do not reflect precisely the actual code used in this game.

The whole grid is composed of 200 of divs flex-wrapped into the main grid body (top-left(0) to bottom-right (199)).

A filling array is also created to record the stack of bricks created by all the shapes that reached the bottom (0 means no shape).
```
=> grid.divs = [div, div, div, ...] 200
=> grid.filling = [
                   [] first line
                   [] second line
                   ...
                   [190, 193, 199] last line
                  ]
```

A shape is composed of an array of 4 which contains current position on the grid:

```
a cube is [4, 5, 14, 15]
```

A setInterval allows us to progress the shape down a line each second by adding the width of the grid (10) to the shape's array

```
[4, 5, 14, 15] + 1 line = [14, 15, 24, 25]
```

The movement triggered by the commands follow the same principle, adding grid's width when moving down, +1 to move right of -1 to move left.

The rotation solution is using the calculated distance between the center of rotation of the shape and the element to rotate. A matrix of rotation is then used to return the value to add or remove to the element to rotate.

```
distance = shape[0] - shape[element]

newElementPosition = matrixRotation[distance]
```

Once a shape reach the bottom of the grid and cannot move anymore, its last coordinates are added to a grid array which represents the stack being built by the previous shapes.

```
shape.forEach(element => grid.filling.push(element)) //Here we actually do a slightly more complex code to calculate the line (grid.filling[line]) to which the element needs to be added to.
```

Each time the grid array receives a new shape, we check if one line is complete and remove the completed line from the array before redrawing.

```
lineToRemove = []
grid.filling.forEach((lineElements, lineNumber) => if(lineElements.length === 10) lineToRemove.push(lineNumber))
```

### Architecture

The codebase is composed of 3 classes:
```
class Shape

class Grid

class Game

document.addEventListener('DOMContentLoaded', () => new Game)
```

The Game class control the main game flow until the player start playing (retrieve best score from local repo, switch between player mode, display winner...)

When the Start button is clicked, the Game object creates 1 or 2 Grid object(s) that themselves managed everything that happens within the grid (create shape, move shape, fill the grid...).

The last class is used by the grid to create Shapes. Those shapes have attributes related to their positions and their type.

The creation of classes makes things relatively easy since each can only interact with their children which tends to reduce side issues.

However, in several case an object needs to talk to his parent, this is where callbacks are used.
In the case where a line is cleared in the 2P mode, the Grid object needs to tell his parent the Game object to add a line to the other Grid object.


### Challenges

Rotation: the algorithm to work out location of an element was challenging especially to keep track of where will be the center once the shape gets rotated. Putting the center of the shape in the first index of the array really eased the solution.

Clear lines: Multiple lines to clear especially when not consecutive (3 full lines separated by 1 none full line) increase the difficulty of the code. Each line needed to be removed 1 by one recalculating the new mapping of the grid each time to make sure to keep the right sequence.

2 Player Mode: In two player mode, both player cannot hold a key at the same time (i.e. key "down" to accelerate the fall of a shape). This is due to the event event listener not keeping track of a key down if another key is pushed. An array of current key down has been created to store all the current key being pressed down. It is feeded by the event listener keydown and it is also unfeeded by the keyup event listener.

### Wins

Using classes really help the code to be more clear and isolate the object form each other. Moreover, any change I would do to player 1 will automatically be reflected on player 2 since both objects are form the same class Grid.

## Future features an enhancement

1. Increasing Speed: every nb of line to create some kind of difficulty for the player as he is clearing more and more lines.

2. Display Upcoming Element: this will allow the player to make smart choice about where to place the current shape knowing what shape is coming next.

3. 2 Player Usuability: somehow in 2 player mode, the responsiveness of the keys pressed sometimes is poor. This is probably due to the solution implemented to allow 2 keys to be pressed down at the same time.
