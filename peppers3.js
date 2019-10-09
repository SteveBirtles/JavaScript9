let w = 0, h = 0;

function fixSize() {
    w = window.innerWidth;
    h = window.innerHeight;
    const canvas = document.getElementById('pepperCanvas');
    canvas.width = w;
    canvas.height = h;
}

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


function imagePostLoader() {
  let readyCount = 0;
  return function() {
      readyCount++;
      console.log(readyCount + " images loaded...");
      if (readyCount == 2 * pepperNames.length) {
        renderPeppers();
        window.requestAnimationFrame(redraw);
      }
  }
}

let peppers = [];

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

    for (let p = 0; p < 100; p++) {
        let x = Math.random() * w;
        let y = 780; // Math.random() * h;
        let d = Math.random() >= 0.5 ? -1 : 1;
        let n = Math.floor(Math.random() * 12);
        peppers.push({x, y, d, n});
    }

}

let lastTimestamp = 0;
let t = 0;

function redraw(timestamp) {

    if (lastTimestamp === 0) lastTimestamp = timestamp;
    const frameLength = (timestamp - lastTimestamp) / 1000;
    lastTimestamp = timestamp;
    t += frameLength*20;

    const canvas = document.getElementById('pepperCanvas');
    const context = canvas.getContext('2d');

    context.fillStyle = 'lightblue';
    context.fillRect(0,0,w,780);
    context.fillStyle = 'darkgreen';
    context.fillRect(0,780,w,h-780);

    for (let pepper of peppers) {

        pepper.x += pepper.d * frameLength * 200;
        if (pepper.x < -100) pepper.x += w+200;
        if (pepper.x > w+100) pepper.x -= w+200;

    }

    for (let pepper of peppers) {

        let x = pepper.x - 35-pepperWidths[pepper.n]/4;
        let y = pepper.y - pepperHeights[pepper.n]/2;
        let frame;

        if (pepper.d == -1) {
           frame = Math.floor(t % 6) + 8;
        } else {
           frame = Math.floor(t % 6) + 1;
        }

        context.drawImage(pepperCanvas,
            pepperSpriteCoords[pepper.n][frame].x,
            pepperSpriteCoords[pepper.n][frame].y,
            pepperWidths[pepper.n],
            pepperHeights[pepper.n],
            x,
            y,
            pepperWidths[pepper.n]/2, pepperHeights[pepper.n]/2);

      }

    window.requestAnimationFrame(redraw);

}
