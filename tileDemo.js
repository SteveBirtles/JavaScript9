"use strict";

const mapWidth = 128, mapHeight = 128;

let w = 0, h = 0;
let cameraX = mapWidth/2, cameraY = mapHeight/2, cameraScale = 1;
let cursorX = 0, cursorY = 0, currentTile = 0, cursorParity = false, cursorLayer = 'tile';

const tileWidth = 128;
const tileHeight = 128;

let tile = [];

let map = [], mapFilename, cachedMaps = [];

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

let playMode = false;

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

function generateJSON() {

    return JSON.stringify({map, peppers, camera:{cameraX, cameraY, cameraScale}});

}

function processJSON(json) {

    let data;
    if (json !== null) {
        data = JSON.parse(json);
    }

    if (data !== undefined && typeof data.map != "undefined" && data.map.length == mapWidth) {

        map = data.map;

    } else {

        for (let x = 0; x < mapWidth; x++) {
            let row = [];
            for (let y = 0; y < mapHeight; y++) {
                row.push({});
            }
            map.push(row);
        }

    }

    if (data !== undefined && typeof data.peppers != "undefined" && data.peppers.length > 0) {

        peppers = data.peppers;

        peppers = peppers.filter(function(pepper){
            return  pepper.hasOwnProperty("x") &&
                    pepper.hasOwnProperty("y") &&
                    pepper.hasOwnProperty("n") &&
                    pepper.hasOwnProperty("d");
        });

        for (let pepper of peppers) {
            pepper.x = pepper.startX;
            pepper.y = pepper.startY;
            pepper.d = pepper.startD;
        }

    }

    if (data !== undefined && typeof data.camera != "undefined") {

        cameraX = data.camera.cameraX;
        cameraY = data.camera.cameraY;
        cameraScale = data.camera.cameraScale;

    }

}

function saveSession() {

    if (playMode) {
        for (let pepper of peppers) {
            pepper.x = pepper.startX;
            pepper.y = pepper.startY;
            pepper.d = pepper.startD;
        }
    }

    localStorage.setItem("#mapFilename", mapFilename);
    localStorage.setItem(mapFilename, generateJSON());

    refreshCacheList();

}

function refreshCacheList() {

    cachedMaps = [];
    let cacheHTML = "";
    for (let key of Object.keys(localStorage)) {
        if (key == "#mapFilename") continue;
        cachedMaps.push(key);
        cacheHTML += "<li>" + key + (mapFilename == key ? " *" : "") + "</li>";
    }
    document.getElementById("cachedMaps").innerHTML = cacheHTML;

}

function pageLoad() {

    mapFilename = localStorage.getItem("#mapFilename")
    if (mapFilename == "undefined" || mapFilename == null) mapFilename = "untitled.json";

    const mapTextbox = document.getElementById('mapName');
    mapTextbox.value = mapFilename;
    mapTextbox.addEventListener("keydown", function(event) {
        mapFilename = mapTextbox.value;
        event.stopPropagation();
    }, false);

    refreshCacheList();
    window.onbeforeunload = saveSession;

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

    processJSON(localStorage.getItem(mapFilename));

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

    canvas.addEventListener("wheel", event => {
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

    canvas.addEventListener('mouseover', event => {
        if(event.buttons == 0){
          leftMouseDown = false;
          rightMouseDown = false;
          console.log("off");
        } else if (event.buttons == 1) {
          leftMouseDown = true;
          rightMouseDown = false;
          console.log("right");
        } else {
          leftMouseDown = false;
          rightMouseDown = true;
          console.log("left");
        }
    }, false)

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

    let alpha, dragX1, dragY1, dragX2, dragY2;

    const scaledTileWidth = tileWidth*cameraScale;
    const scaledTileHeight = tileHeight*cameraScale;

    cursorX = Math.floor((mousePosition.x - w/2) / scaledTileWidth + cameraX);
    cursorY = Math.floor((mousePosition.y - h/2) / scaledTileHeight + cameraY);

    cursorParity = Math.floor((mousePosition.x - w/2) / scaledTileWidth + cameraX + 0.5) == cursorX;

    if (cursorX < 0) cursorX = 0;
    if (cursorY < 0) cursorY = 0;
    if (cursorX >= mapWidth) cursorX = mapWidth - 1;
    if (cursorY >= mapHeight) cursorY = mapHeight - 1;

    if (rightMouseDown) {
        cameraX += (lastMousePosition.x - mousePosition.x) / scaledTileWidth;
        cameraY += (lastMousePosition.y - mousePosition.y) / scaledTileHeight;
        lastMousePosition.x = mousePosition.x
        lastMousePosition.y = mousePosition.y;
    }

    if (!playMode) {

        if (leftMouseDown) {
            map[cursorX][cursorY][cursorLayer] = currentTile;
        }

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
                          if (pepper.startX == cursorX && pepper.startY == cursorY) {
                            free = false;
                            break;
                          }
                      }

                      if (free) {
                        let n = key.charCodeAt(0) - 49;
                        if (key == '0') n = 9;
                        if (key == '-') n = 10;
                        if (key == '=') n = 11;
                        peppers.push({
                                        x: cursorX,
                                        y: cursorY,
                                        d: (cursorParity ? -1 : 1),
                                        startX: cursorX,
                                        startY: cursorY,
                                        startD: (cursorParity ? -1 : 1),
                                        n
                                    });
                      }

                      keyDown = true;
                    }

                    break;
                    case 'Control': //layer
                    if (!keyDown) {
                        if (cursorLayer == 'tile') {
                            cursorLayer = 'backTile';
                        } else {
                            cursorLayer = 'tile';
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
                    map[cursorX][cursorY][cursorLayer] = undefined;
                    break;
                    case 'Backspace':
                        peppers = peppers.filter(function(pepper) {
                            return (cursorX != Math.floor(pepper.x) || cursorY != Math.floor(pepper.y));
                        });
                        break;
                    case '#': //next cache
                        if (!keyDown) {
                            saveSession();
                            let load = -1;
                            for (let i = 0; i < cachedMaps.length; i++) {
                                if (cachedMaps[i] == mapFilename) {
                                    load = i+1;
                                    break;
                                }
                            }
                            if (load != -1) {
                                load = load % cachedMaps.length;
                                mapFilename = cachedMaps[load];
                                document.getElementById('mapName').value = mapFilename;
                                localStorage.setItem("#mapFilename", mapFilename);
                                processJSON(localStorage.getItem(mapFilename));
                            }
                            refreshCacheList();
                            keyDown = true;
                        }
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
                    break;
                    case 'p': //pick tile
                    if (!(typeof map[cursorX][cursorY][cursorLayer] === "undefined")) {
                        currentTile = map[cursorX][cursorY][cursorLayer];
                    }
                    break;
                    case 'g': //grid
                    if (!keyDown) {
                        showGrid = !showGrid;
                        keyDown = true;
                    }
                    break;
                    case 'r': //play
                    if (!keyDown) {
                        saveSession();
                        playMode = true;
                        document.getElementById("hud").style.display = "none";
                        keyDown = true;
                    }
                    break;
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
                                if (key === 'f') map[i][j][cursorLayer] = currentTile;
                                if (key === 'b') map[i][j][cursorLayer] = undefined;
                                if (i - dragX1 + cursorX < mapWidth && j - dragY1 + cursorY < mapHeight) {
                                    if (key === 'd') map[i - dragX1 + cursorX][j - dragY1 + cursorY][cursorLayer] = map[i][j][cursorLayer];
                                    if (key === 'x') {
                                        map[i - dragX1 + cursorX][j - dragY1 + cursorY][cursorLayer] = map[i][j][cursorLayer];
                                        map[i][j] = {};
                                    }
                                    if (key === 'm') map[i - dragX1 + cursorX][j - dragY1 + cursorY][cursorLayer] = map[dragX2-(i-dragX1)][j][cursorLayer];
                                    if (key === 'k') map[i - dragX1 + cursorX][j - dragY1 + cursorY][cursorLayer] = map[i][dragY2-(j-dragY1)][cursorLayer];
                                    if (key === 'l') map[i - dragX1 + cursorX][j - dragY1 + cursorY][cursorLayer] = map[dragX2-(i-dragX1)][dragY2-(j-dragY1)][cursorLayer];
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
    }

    if (playMode) {

        for (let key in pressedKeys) {
            if (pressedKeys[key]) {
                switch (key) {
                    case 'r':
                    if (!keyDown) {
                        for (let pepper of peppers) {
                            pepper.x = pepper.startX;
                            pepper.y = pepper.startY;
                            pepper.d = pepper.startD;
                        }
                        playMode = false;
                        document.getElementById("hud").style.display = "block";
                        keyDown = true;
                    }
                }
            }
        }

        for (let pepper of peppers) {

            console.log(`${pepper.x}, ${pepper.y}, ${pepper.d}.`);

            if (typeof pepper.dx == "undefined") pepper.dx = 0;
            if (typeof pepper.dy == "undefined") pepper.dy = 0;

            let pepperX = Math.floor(pepper.x + 0.5 - 0.2*pepper.d);
            let pepperY = Math.floor(pepper.y);
            let pepperFarLeft = Math.floor(pepper.x - 1);
            let pepperLeft = Math.floor(pepper.x);
            let pepperRight = Math.floor(pepper.x + 1);

            if (pepperX < 0 || pepperY < 0 ||
                pepperX >= mapWidth || pepperY+1 >= mapHeight ||
                pepperLeft < 0 || pepperLeft >= mapWidth ||
                pepperRight < 0 || pepperRight >= mapWidth) continue;

            pepper.grounded = typeof map[pepperX][pepperY+1].tile != "undefined";

            let farLeftWall = (typeof map[pepperFarLeft][pepperY-1].tile != "undefined") ||
                           (typeof map[pepperFarLeft][pepperY].tile != "undefined");
            let leftWall = (typeof map[pepperLeft][pepperY-1].tile != "undefined") ||
                           (typeof map[pepperLeft][pepperY].tile != "undefined");
            let rightWall = (typeof map[pepperRight][pepperY-1].tile != "undefined") ||
                            (typeof map[pepperRight][pepperY].tile != "undefined");

            if (leftWall && pepper.d < 0 || rightWall && pepper.d > 0) {
                if (!(farLeftWall && rightWall)) {
                    pepper.d = -pepper.d
                }
            }

            if (pepper.grounded) {

                pepper.running = !(farLeftWall && rightWall);
                pepper.falling = false;
                pepper.y = Math.floor(pepper.y);
                pepper.dx = pepper.running ? pepper.d * 3 : 0;
                pepper.dy = 0;

            } else {

                pepper.dx = 0;
                pepper.running = false;
                pepper.falling = true;
                if (pepper.dy < 10) {
                    pepper.dy += frameLength * 20;
                } else {
                    pepper.dy = 10;
                }

            }

            pepper.x += pepper.dx * frameLength;
            pepper.y += pepper.dy * frameLength;

        }
    }

    const canvas = document.getElementById('tileCanvas');
    const context = canvas.getContext('2d');

    context.fillStyle = 'black';
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

    context.globalAlpha = 0.5;

    for (let i = 0; i < mapWidth; i++) {
        for (let j = 0; j < mapHeight; j++) {
            let u = w/2 + (i - cameraX) * scaledTileWidth;
            let v = h/2 + (j - cameraY) * scaledTileHeight;
            if (u > -scaledTileWidth && v > -scaledTileHeight && u < w && v < h) {
                if (typeof map[i][j].backTile != "undefined") {
                    context.drawImage(tile[map[i][j].backTile], 0, 0, 128, 128, u, v, scaledTileWidth, scaledTileHeight);
                }
            }
        }
    }

    context.globalAlpha = 1;

    for (let i = 0; i < mapWidth; i++) {
        for (let j = 0; j < mapHeight; j++) {
            let u = w/2 + (i - cameraX) * scaledTileWidth;
            let v = h/2 + (j - cameraY) * scaledTileHeight;
            if (u > -scaledTileWidth && v > -scaledTileHeight && u < w && v < h) {

                if (cursorLayer == 'backTile' && typeof map[i][j].backTile != "undefined" && typeof map[i][j].tile != "undefined") {
                    context.fillStyle = '#00000088';
                    context.fillRect(u, v, scaledTileWidth, scaledTileHeight);
                } else if (typeof map[i][j].tile != "undefined") {
                    context.drawImage(tile[map[i][j].tile], 0, 0, 128, 128, u, v, scaledTileWidth, scaledTileHeight);
                } else if (showGrid && !playMode) {
                    context.strokeStyle = '#00FF00';
                    context.strokeRect(u, v, scaledTileWidth, scaledTileHeight);
                }

                if (playMode) continue;

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



    for (let pepper of peppers) {

        /*let pepperX = Math.floor(pepper.x + 0.5 - 0.2*pepper.d);
        let pepperY = Math.floor(pepper.y);
        let pepperLeft = Math.floor(pepper.x);
        let pepperRight = Math.floor(pepper.x + 1);

        let u = w/2 + (pepperLeft - cameraX) * scaledTileWidth;
        let v = h/2 + (pepperY - cameraY) * scaledTileHeight;
        context.fillStyle = '#00FF0088';
        context.fillRect(u, v, scaledTileWidth, scaledTileHeight);
        u = w/2 + (pepperRight - cameraX) * scaledTileWidth;
        v = h/2 + (pepperY - cameraY) * scaledTileHeight;
        context.fillStyle = '#00FFFF88';
        context.fillRect(u, v, scaledTileWidth, scaledTileHeight);
        u = w/2 + (pepperX - cameraX) * scaledTileWidth;
        v = h/2 + (pepperY+1 - cameraY) * scaledTileHeight;
        context.fillStyle = '#FFFF0088';
        context.fillRect(u, v, scaledTileWidth, scaledTileHeight);*/

        let x = w/2 + cameraScale*((pepper.x - cameraX + 0.5)*tileWidth - pepperWidths[pepper.n]/2);
        let y = h/2 + cameraScale*((pepper.y - cameraY + 1)*tileHeight - pepperHeights[pepper.n]);

        if (x > -pepperWidths[pepper.n]*cameraScale &&
          y > -pepperHeights[pepper.n]*cameraScale &&
          x < w && y < h) {

            let frame;

            if (playMode) {
                if (pepper.d == -1) {
                    frame = 7;
                    if (pepper.running) frame =  Math.floor(t % 6) + 8;
                    if (pepper.falling) frame =  12;
                } else {
                   frame = 0;
                   if (pepper.running) frame =  Math.floor(t % 6) + 1;
                   if (pepper.falling) frame =  5;
                }
            } else {
                if (pepper.d == -1) {
                   frame = 7;
                } else {
                   frame = 0;
                }
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

    if (!playMode) {

        context.fillStyle = '#00000088';
        context.fillRect(0, 0, 105, 183);
        context.drawImage(tile[currentTile], 0,0, tileWidth, tileHeight, 10,88, 83,83);

        context.font = "24px Arial";
        context.strokeStyle = 'white';
        context.strokeText(`${cursorLayer == 'tile' ? 'FG' : 'BG'} ${cursorX}, ${cursorY} ${cursorParity ? '<-' : '->'}`, mousePosition.x, mousePosition.y);

    }

    window.requestAnimationFrame(redraw);

}

function handleUpload(files) {

    if (files.length !== 1) return;

    mapFilename = files[0].name;
    document.getElementById('mapName').value = mapFilename;
    console.log("Loading " + mapFilename + "...");

    let reader = new FileReader();
    reader.onload = function(){
        processJSON(reader.result);
        document.getElementById('uploader').value = ''
        saveSession();
    };
    reader.readAsText(files[0]);

}

function handleDownload() {

    let element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(generateJSON()));
    element.setAttribute('download', mapFilename);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);

}
