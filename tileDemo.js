"use strict";

const mapWidth = 128, mapHeight = 128;

let w = 0, h = 0;
let cameraX = mapWidth/2, cameraY = mapHeight/2, cameraScale = 1;
let cursorX = 0, cursorY = 0, currentTile = 0;

const tileWidth = 128;
const tileHeight = 128;

let tile = [];

let map = [], mapFilename = 'map.json';

let mousePosition = {x: 0, y: 0}, lastMousePosition = {x: 0, y: 0}, leftMouseDown = false, rightMouseDown = false, keyDown = false;

let dragging = false, dragStartX = -1, dragStartY, dragEndX, dragEndY, showGrid = false, showHelp = true;

let peppers = [];

let pepperNames = [ "birds-eye",    "cayenne",    "fatalii",    "habanero",
                    "jalapeno",    "madame-jeanette",    "naga-jolokia",    "peperoncini",
                    "pequin",    "poblano",    "scotch-bonnet",    "tabasco"];

let pepperWidths =  [100,120,140,120,120,120,120,120,100,140,120,100];
let pepperHeights = [150,180,210,180,180,180,180,180,150,210,180,150];

let pepperSprites = [];
let miniPeppers = [];
let pepperSpriteCoords = [];

const spacing = 1;
const pepperCanvas = new OffscreenCanvas(1960, 2190 + 12*spacing);

function renderPeppers() {

  let rows = [7, 3, 5, 4, 0, 1, 2, 6];
  let runningFrames = {0:[0, 0, 0, 0, 0, 0],
                       1:[0, 0, 0, 0, 0, 0],
                       2:[1, 1, 2, 3, 3, 4],
                       3:[3, 3, 4, 1, 1, 2],
                       4:[1, 2, 3, 4, 5, 6],
                       5:[4, 5, 6, 1, 2, 3],
                       6:[0, 0, 0, 0, 0, 0],
                       7:[0, 0, 0, 0, 0, 0],
                       11:[0, 1, 3, 4, 5, 7],
                       12:[0, 0, 1, 2, 2, 3],
                       13:[1, 1, 2, 3, 3, 0]};

  let columns = { "birds-eye":    {0:1, 1:1, 2:5, 3:5, 4:7, 5:7},
                  "cayenne":      {0:1, 1:1, 2:5, 3:5, 4:7, 5:7, 6:6},
                  "fatalii":      {0:1, 1:1, 2:5, 3:5, 4:7, 5:7},
                  "habanero":     {0:1, 1:1, 2:5, 3:5, 4:7, 5:7},
                  "jalapeno":     {0:1, 1:1, 2:5, 3:5, 4:7, 5:7},
                  "madame-jeanette":{0:1, 1:1, 2:10, 3:10, 4:7, 5:7, 6:1, 7:1},
                  "naga-jolokia": {0:1, 1:8, 2:5, 3:5, 4:7, 5:7},
                  "peperoncini":  {0:1, 1:1, 2:5, 3:5, 4:7, 5:7},
                  "pequin":       {0:1, 1:1, 2:4, 3:4, 4:7, 5:7},
                  "poblano":      {0:1, 1:1, 2:5, 3:5, 4:7, 5:7},
                  "scotch-bonnet":{0:1, 1:1, 2:5, 3:5, 4:7, 5:7},
                  "tabasco":      {0:1, 1:1, 2:10, 3:10, 4:7, 5:7}};

  const context = pepperCanvas.getContext('2d');

  context.clearRect(0,0,w,h);

  for (let p = 0; p < 12; p++) {
    context.drawImage(miniPeppers[p], p*60, 0);
  }

  let y = 60 + spacing;

  for (let p = 0; p < 12; p++) {

    let row = [];
    for (let i = 0; i < 14; i++) {
      row.push({x: i*pepperWidths[p], y});
    }
    pepperSpriteCoords.push(row);

    for (let t = 0; t < 6; t++) {

        for (let row of rows) {

            if (row * pepperHeights[p] > pepperSprites[p].height) continue;

            let cols = columns[pepperNames[p]][row]

            let twoArms = false;
            if (cols == 10) {
                twoArms = true;
                cols = 5;
            }

            context.save();
            context.translate(0, y);
            context.drawImage(pepperSprites[p],
                    (twoArms && row == 2 ? 5 : 0) * pepperWidths[p],
                    row * pepperHeights[p],
                    pepperWidths[p], pepperHeights[p],
                    0, 0,
                    pepperWidths[p], pepperHeights[p]);
            context.restore();

            let col = runningFrames[row][Math.floor(t)];
            if (p == 6 && row == 1) col = runningFrames[11][Math.floor(t)]; // naga eyes
            if (p == 8 && row == 2) col = runningFrames[12][Math.floor(t)]; // pequin arms
            if (p == 8 && row == 3) col = runningFrames[13][Math.floor(t)]; // pequin arms

            if (twoArms && row == 3) col += 5;

            context.save();
            context.translate((1+t)*pepperWidths[p], y);
            context.drawImage(pepperSprites[p],
                    col * pepperWidths[p],
                    row * pepperHeights[p],
                    pepperWidths[p],
                    pepperHeights[p],
                    0,0,
                    pepperWidths[p],
                    pepperHeights[p]);
            context.restore();

            if (twoArms && row == 3) col -= 5;
            if (twoArms && row == 2) col += 5;

            context.save();
            context.translate(8*pepperWidths[p], y);
            context.scale(-1,1);
            context.drawImage(pepperSprites[p],
                    (twoArms && row == 3 ? 5 : 0) * pepperWidths[p],
                    row * pepperHeights[p],
                    pepperWidths[p], pepperHeights[p],
                    0, 0,
                    pepperWidths[p], pepperHeights[p]);
            context.restore();

            context.save();
            context.translate((9+t)*pepperWidths[p], y);
            context.scale(-1,1);
            context.drawImage(pepperSprites[p],
                  col * pepperWidths[p],
                  row * pepperHeights[p],
                  pepperWidths[p],
                  pepperHeights[p],
                  0,0,
                  pepperWidths[p],
                  pepperHeights[p]);
            context.restore();
          }
      }

      y += pepperHeights[p] + spacing;

  }

}

function fixSize() {
    w = window.innerWidth;
    h = window.innerHeight;
    const canvas = document.getElementById('tileCanvas');
    canvas.width = w;
    canvas.height = h;
}

let pressedKeys = {};

function imagePostLoader() {
  let readyCount = 0;
  return function() {
      readyCount++;
      console.log(readyCount + " images loaded...");
      if (readyCount == 36) {
        renderPeppers();
        console.log("-------------------------------------");
        window.requestAnimationFrame(redraw);
      }
  }
}

function pageLoad() {

    window.addEventListener("resize", fixSize);
    fixSize();

    let postLoad = imagePostLoader();

    for (let p of pepperNames) {
        let mini = new Image();
        mini.src = p + "_mini.png";
        mini.onload = postLoad;
        miniPeppers.push(mini);
        let maxi = new Image();
        maxi.src = p + ".png";
        maxi.onload = postLoad;
        pepperSprites.push(maxi);
    }

    for (let i = 0; i < 12; i++) {
        tile[i] = new Image()
        tile[i].src = (i+1) + ".png";
        tile[i].onload = postLoad;
    }

    for (let x = 0; x < mapWidth; x++) {
        let row = [];
        for (let y = 0; y < mapHeight; y++) {
            row.push({});
        }
        map.push(row);
    }

    window.addEventListener("keydown", event => pressedKeys[event.key] = true);
    window.addEventListener("keyup", event => {
        keyDown = false;
        pressedKeys[event.key] = false;
    });

    const canvas = document.getElementById('tileCanvas');
    canvas.addEventListener('mousedown', event => {
        lastMousePosition.x = mousePosition.x
        lastMousePosition.y = mousePosition.y;
        if (event.button === 0) {
            leftMouseDown = true;
        } else {
            rightMouseDown = true;
        }
    }, false);

    canvas.addEventListener('mouseup', event => {
        if (event.button === 0) {
            leftMouseDown = false;
        } else {
            rightMouseDown = false;
        }
    }, false);

    window.addEventListener("wheel", event => {
        if (Math.sign(event.deltaY) > 0) {
            cameraScale *= 0.9;
        } else {
            cameraScale /= 0.9;
        }
        if (cameraScale > 4) cameraScale = 4;
        if (cameraScale < 0.25) cameraScale = 0.25;
    });

    canvas.addEventListener('mousemove', event => {
        mousePosition.x = event.clientX;
        mousePosition.y = event.clientY;
    }, false);

    canvas.oncontextmenu = function (e) {
        e.preventDefault();
    };

}

let lastTimestamp = 0, fps = 0, fpsTimestamp = -1, frames = 0;
let t = 0;

function redraw(timestamp) {

    const frameLength = (timestamp - lastTimestamp) / 1000;
    lastTimestamp = timestamp;

    if (fpsTimestamp === -1) fpsTimestamp = timestamp;

    if (timestamp - fpsTimestamp > 1000) {
        fps = frames;
        frames = 0;
        fpsTimestamp += 1000
        window.top.document.title = "Tiled Canvas Demo (" + fps + " FPS)";
    }
    frames++;

    t += frameLength*20;

    const scaledTileWidth = tileWidth*cameraScale;
    const scaledTileHeight = tileHeight*cameraScale;

    cursorX = Math.floor((mousePosition.x - w/2) / scaledTileWidth + cameraX);
    cursorY = Math.floor((mousePosition.y - h/2) / scaledTileHeight + cameraY);

    if (cursorX < 0) cursorX = 0;
    if (cursorY < 0) cursorY = 0;
    if (cursorX >= mapWidth) cursorX = mapWidth - 1;
    if (cursorY >= mapHeight) cursorY = mapHeight - 1;

    if (leftMouseDown) {
        map[cursorX][cursorY].tile = currentTile;
    }

    if (rightMouseDown) {
        cameraX += (lastMousePosition.x - mousePosition.x) / scaledTileWidth;
        cameraY += (lastMousePosition.y - mousePosition.y) / scaledTileHeight;
        lastMousePosition.x = mousePosition.x
        lastMousePosition.y = mousePosition.y;
    }

    let alpha, dragX1, dragY1, dragX2, dragY2;
    if (dragStartX != -1) {
        alpha = Math.floor(50*(1+Math.cos(timestamp/200)) + 50);
        dragX1 = dragStartX > dragEndX ? dragEndX : dragStartX;
        dragY1 = dragStartY > dragEndY ? dragEndY : dragStartY;
        dragX2 = dragStartX > dragEndX ? dragStartX : dragEndX;
        dragY2 = dragStartY > dragEndY ? dragStartY : dragEndY;
    }

    for (let key in pressedKeys) {
        if (pressedKeys[key]) {
            switch (key) {
                case '1':
                case '2':
                case '3':
                case '4':
                case '5':
                case '6':
                case '7':
                case '8':
                case '9':
                case '0':
                case '-':
                case '=':

                if (!keyDown) {

                  let free = true;
                  for (let pepper of peppers) {
                      if (pepper.x == cursorX && pepper.y == cursorY) {
                        free = false;
                        break;
                      }
                  }

                  if (free) {
                    let n = key.charCodeAt(0) - 49;
                    if (key == '0') n = 9;
                    if (key == '-') n = 10;
                    if (key == '=') n = 11;
                    peppers.push({x: cursorX, y:cursorY, d: 1, n});
                  }

                  keyDown = true;
                }

                break;
                case 'ArrowUp':
                cameraY -= 5*frameLength/cameraScale;
                break;
                case 'ArrowDown':
                cameraY += 5*frameLength/cameraScale;
                break;
                case 'ArrowLeft':
                cameraX -= 5*frameLength/cameraScale;
                break;
                case 'ArrowRight':
                cameraX += 5*frameLength/cameraScale;
                break;
                case 'PageUp':
                cameraScale *= 1-frameLength;
                if (cameraScale > 4) cameraScale = 4;
                break;
                case 'PageDown':
                cameraScale /= 1-frameLength;
                if (cameraScale < 0.25) cameraScale = 0.25;
                break;
                case 'Home':
                cameraScale = 1;
                break;
                case 'Shift':
                if (!dragging) {
                    dragStartX = cursorX;
                    dragStartY = cursorY;
                    dragging = true;
                }
                dragEndX = cursorX;
                dragEndY = cursorY;
                break;
                case 'Escape':
                dragStartX = -1;
                break;
                case 'a': //select all
                dragStartX = 0;
                dragStartY = 0;
                dragEndX = mapWidth-1;
                dragEndY = mapHeight-1;
                break;
                case 'Delete':
                map[cursorX][cursorY] = {};
                break;
                case '[': //previous tile
                if (!keyDown) {
                    currentTile--;
                    if (currentTile < 0) currentTile = tile.length-1;
                    keyDown = true;
                }
                break;
                case ']': //next tile
                if (!keyDown) {
                    currentTile++;
                    if (currentTile >= tile.length) currentTile = 0;
                    keyDown = true;
                }
                case 'p': //pick tile
                if (map[cursorX][cursorY] !== {} && !(typeof map[cursorX][cursorY].tile === "undefined")) {
                    currentTile = map[cursorX][cursorY].tile;
                }
                break;
                case 'g': //grid
                if (!keyDown) {
                    showGrid = !showGrid;
                    keyDown = true;
                }
                case 'h': //help
                if (!keyDown) {
                    showHelp = !showHelp
                    document.getElementById("helpText").style.display = showHelp ? "block" : "none";
                    keyDown = true;
                }
                break;
                case 'f': //fill
                case 'd': //duplicate
                case 'x': //cut
                case 'b': //clear (bin)
                case 'm': //mirror horizonal
                case 'k': //flip vertical
                case 'l': //flip and mirror
                if (dragStartX != -1) {
                    for (let i = dragX1; i <= dragX2; i++) {
                        for (let j = dragY1; j <= dragY2; j++) {
                            if (key === 'f') map[i][j].tile = currentTile;
                            if (key === 'b') map[i][j] = {};
                            if (map[i][j] !== {} && i - dragX1 + cursorX < mapWidth && j - dragY1 + cursorY < mapHeight) {
                                if (key === 'd') map[i - dragX1 + cursorX][j - dragY1 + cursorY].tile = map[i][j].tile;
                                if (key === 'x') {
                                    map[i - dragX1 + cursorX][j - dragY1 + cursorY].tile = map[i][j].tile;
                                    map[i][j] = {};
                                }
                                if (key === 'm') map[i - dragX1 + cursorX][j - dragY1 + cursorY].tile = map[dragX2-(i-dragX1)][j].tile;
                                if (key === 'k') map[i - dragX1 + cursorX][j - dragY1 + cursorY].tile = map[i][dragY2-(j-dragY1)].tile;
                                if (key === 'l') map[i - dragX1 + cursorX][j - dragY1 + cursorY].tile = map[dragX2-(i-dragX1)][dragY2-(j-dragY1)].tile;
                            }
                        }
                    }

                }
                break;
            }
        } else {
            if (key == 'Shift') {
                dragging = false;
            }
        }
    }

    const canvas = document.getElementById('tileCanvas');
    const context = canvas.getContext('2d');

    context.fillStyle = '#000088';
    context.fillRect(0, 0, w, h);

    context.fillStyle = '#FF000044';

    for (let i = -1; i <= mapWidth; i++) {
        for (let j = -1; j <= mapHeight; j += mapHeight+1) {
            let u = w/2 + (i - cameraX) * scaledTileWidth;
            let v = h/2 + (j - cameraY) * scaledTileHeight;
            if (u > -scaledTileWidth && v > -scaledTileHeight && u < w && v < h) {
                context.fillRect(u, v, scaledTileWidth, scaledTileHeight);
            }
        }
    }
    for (let j = 0; j < mapHeight; j++) {
        for (let i = -1; i <= mapWidth; i += mapWidth+1) {
            let u = w/2 + (i - cameraX) * scaledTileWidth;
            let v = h/2 + (j - cameraY) * scaledTileHeight;
            if (u > -scaledTileWidth && v > -scaledTileHeight && u < w && v < h) {
                context.fillRect(u, v, scaledTileWidth, scaledTileHeight);
            }
        }
    }

    for (let i = 0; i < mapWidth; i++) {
        for (let j = 0; j < mapHeight; j++) {
            if (map[i][j] !== {}) {
                let u = w/2 + (i - cameraX) * scaledTileWidth;
                let v = h/2 + (j - cameraY) * scaledTileHeight;
                if (u > -scaledTileWidth && v > -scaledTileHeight && u < w && v < h) {

                    if (map[i][j] !== {} && !(typeof map[i][j].tile === "undefined")) {
                        context.drawImage(tile[map[i][j].tile], 0, 0, 128, 128, u, v, scaledTileWidth, scaledTileHeight);
                    } else if (showGrid) {
                        context.strokeStyle = '#00FF00';
                        context.strokeRect(u, v, scaledTileWidth, scaledTileHeight);
                    }

                    if (dragStartX != -1) {
                        if (i >= dragX1 && j >= dragY1 && i <= dragX2 && j <= dragY2) {
                            context.fillStyle = '#00FFFF' + alpha.toString(16);
                            context.fillRect(u, v, scaledTileWidth, scaledTileHeight);
                        }
                    }

                    if (i === cursorX && j === cursorY) {
                        context.fillStyle = '#FFFFFF88';
                        context.fillRect(u, v, scaledTileWidth, scaledTileHeight);
                    }

                }
            }
        }
    }

    /*for (let pepper of peppers) {
        pepper.x += pepper.d * frameLength * 200;
        if (pepper.x < -100) pepper.x += w+200;
        if (pepper.x > w+100) pepper.x -= w+200;
    }*/

    for (let pepper of peppers) {

        let x = w/2 + cameraScale*((pepper.x - cameraX + 0.5)*tileWidth - pepperWidths[pepper.n]/2);
        let y = h/2 + cameraScale*((pepper.y - cameraY + 1)*tileHeight - pepperHeights[pepper.n]);

        if (x > -pepperWidths[pepper.n]*cameraScale &&
          y > -pepperHeights[pepper.n]*cameraScale &&
          x < w && y < h) {

            let frame;

            if (pepper.d == -1) {
               frame = Math.floor(t % 6) + 8; //7
            } else {
               frame = Math.floor(t % 6) + 1; //0
            }

          context.drawImage(pepperCanvas,
              pepperSpriteCoords[pepper.n][frame].x,
              pepperSpriteCoords[pepper.n][frame].y ,
              pepperWidths[pepper.n],
              pepperHeights[pepper.n],
              x,
              y,
              pepperWidths[pepper.n]*cameraScale, pepperHeights[pepper.n]*cameraScale);

        }

    }

    context.fillStyle = '#00000088';
    context.fillRect(0, 0, 105, 158);
    context.drawImage(tile[currentTile], 0,0, tileWidth, tileHeight, 10,63, 83,83);

    context.font = "24px Arial";
    context.strokeStyle = 'white';
    context.strokeText(`${cursorX}, ${cursorY}`, mousePosition.x, mousePosition.y);

    window.requestAnimationFrame(redraw);

}

function handleUpload(files) {

    if (files.length !== 1) return;

    mapFilename = files[0].name;
    console.log("Loading " + mapFilename + "...");

    let reader = new FileReader();
    reader.onload = function(){
        let mapJSON = reader.result;
        map = JSON.parse(mapJSON);
        document.getElementById('uploader').value = ''
    };
    reader.readAsText(files[0]);

}

function handleDownload() {

    let element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(JSON.stringify(map)));
    element.setAttribute('download', mapFilename);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);

}
