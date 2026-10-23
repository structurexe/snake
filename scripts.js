const canvas = document.getElementById("board");
const ctx = canvas.getContext("2d");
const N = 18;                       // board is N x N cells
const CELL = canvas.width / N;
const SPEED = 110;                  // ms per move

let snake, dir, nextDir, food, score, timer, alive = false;
let best = 0;
try { best = +localStorage.getItem("snake-best") || 0; } catch (e) {}
document.getElementById("best").textContent = best;

function placeFood() {
  do {
    food = { x: Math.floor(Math.random() * N), y: Math.floor(Math.random() * N) };
  } while (snake.some(s => s.x === food.x && s.y === food.y));
}

function start() {
  clearInterval(timer);
  snake = [{ x: 9, y: 9 }, { x: 8, y: 9 }, { x: 7, y: 9 }];
  dir = nextDir = { x: 1, y: 0 };
  score = 0;
  alive = true;
  document.getElementById("score").textContent = 0;
  placeFood();
  draw();
  timer = setInterval(step, SPEED);
}

function turn(x, y) {
  // ignore a 180-degree reversal
  if (alive && (x !== -dir.x || y !== -dir.y)) nextDir = { x, y };
}

function step() {
  dir = nextDir;
  const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };
  const hitWall = head.x < 0 || head.y < 0 || head.x >= N || head.y >= N;
  const hitSelf = snake.some(s => s.x === head.x && s.y === head.y);
  if (hitWall || hitSelf) return gameOver();

  snake.unshift(head);
  if (head.x === food.x && head.y === food.y) {
    score++;
    document.getElementById("score").textContent = score;
    placeFood();
  } else {
    snake.pop();
  }
  draw();
}

function gameOver() {
  alive = false;
  clearInterval(timer);
  if (score > best) {
    best = score;
    document.getElementById("best").textContent = best;
    try { localStorage.setItem("snake-best", best); } catch (e) {}
  }
  draw();
}

function draw() {
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  if (!snake) return;
  ctx.fillStyle = "#f472b6";
  ctx.fillRect(food.x * CELL + 3, food.y * CELL + 3, CELL - 6, CELL - 6);
  snake.forEach((s, i) => {
    ctx.fillStyle = i ? "#a855f7" : "#fff";
    ctx.fillRect(s.x * CELL + 1, s.y * CELL + 1, CELL - 2, CELL - 2);
  });
  if (!alive) {
    ctx.fillStyle = "rgba(0,0,0,.7)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#fff";
    ctx.font = "700 22px system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Game over · " + score, canvas.width / 2, canvas.height / 2);
  }
}

const KEYS = {
  ArrowUp: [0, -1], w: [0, -1], ArrowDown: [0, 1], s: [0, 1],
  ArrowLeft: [-1, 0], a: [-1, 0], ArrowRight: [1, 0], d: [1, 0]
};
addEventListener("keydown", e => {
  const k = KEYS[e.key];
  if (k && alive) { e.preventDefault(); turn(k[0], k[1]); }
});
document.querySelectorAll(".pad button").forEach(b =>
  b.addEventListener("click", () => {
    const [x, y] = b.dataset.d.split(",").map(Number);
    turn(x, y);
  })
);
document.getElementById("start").addEventListener("click", start);
draw();
