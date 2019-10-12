var sw = 20,
  sh = 20,
  tr = 30,
  td = 30;

class Square {
  constructor(x, y, classname) {
    this.x = x * 20;
    this.y = y * 20;
    this.class = classname;

    this.viewContent = document.createElement('div');
    this.viewContent.className = this.class;
    this.parent = document.querySelector('#snakeWrap');
  }
  create() {
    this.viewContent.style.position = 'absolute';
    this.viewContent.style.width = sw + 'px';
    this.viewContent.style.height = sh + 'px';
    this.viewContent.style.left = this.x + 'px';
    this.viewContent.style.top = this.y + 'px';
    this.parent.appendChild(this.viewContent);
  }
  remove() {
    this.parent.removeChild(this.viewContent);
  }
}
class Snake {
  constructor() {
    this.head = null;
    this.tail = null;
    this.pos = [];
    this.directionNum = {
      left: {
        x: -1,
        y: 0,
        rotate: 180
      },
      right: {
        x: 1,
        y: 0,
        rotate: 0
      },
      up: {
        x: 0,
        y: -1,
        rotate: -90
      },
      down: {
        x: 0,
        y: 1,
        rotate: 90
      }
    }
  }
  init() {
    var snakeHead = new Square(2, 0, 'snakeHead');
    snakeHead.create();
    this.head = snakeHead;
    this.pos.push([2, 0]);
    var snakeBody = new Square(1, 0, 'snakeBody');
    snakeBody.create();
    this.pos.push([1, 0]);
    var snakeTail = new Square(0, 0, 'snakeBody');
    snakeTail.create();
    this.tail = snakeTail;
    this.pos.push([0, 0]);

    snakeHead.pre = null;
    snakeHead.next = snakeBody;
    snakeBody.pre = snakeHead;
    snakeBody.next = snakeTail;
    snakeTail.pre = snakeBody;
    snakeTail.next = null;

    this.direction = this.directionNum.right;
  }
  getNextPos() {
    var nextPos = [
      this.head.x / sw + this.direction.x,
      this.head.y / sh + this.direction.y
    ]
    var selfCollied = false;
    this.pos.forEach(function (value) {
      if (value[0] === nextPos[0] && value[1] === nextPos[1]) {
        selfCollied = true;
      }
    })
    if (selfCollied) {
      console.log('撞到自己');
      this.die();
      return;
    }
    if (nextPos[0] < 0 || nextPos[0] > td - 1 || nextPos[1] < 0 || nextPos[1] > tr - 1) {
      console.log('撞墙');
      this.die();
      return;
    }
    //食物，吃
    if (food && food.pos[0] === nextPos[0] && food.pos[1] === nextPos[1]) {
      this.eat();
      createFood();
      game.score++;
      return;
    }
    //什么都没有，走
    this.move();
  }
  move(isEat) {
    var newBody = new Square(this.head.x / 20, this.head.y / 20, 'snakeBody');
    newBody.create();
    var newHead = new Square(this.direction.x + this.head.x / 20, this.direction.y + this.head.y / 20, 'snakeHead');
    newHead.create();
    newHead.pre = null;
    newHead.next = newBody;
    newBody.pre = newHead;
    newBody.next = this.head.next;
    newBody.next.pre = newBody;
    newHead.viewContent.style.transform = 'rotate(' + this.direction.rotate + 'deg)';
    this.pos.splice(0, 0, [this.head.x / sw + this.direction.x, this.head.y / sh + this.direction.y]);
    // this.pos.unshift([this.head.x / sw + this.direction.x, this.head.y / sh + this.direction.y])
    this.head.remove();
    this.head = newHead;
    if (!isEat) {
      this.tail.remove();
      this.tail = this.tail.pre;
      this.pos.pop();
    }
  }
  eat() {
    this.move(true);
  }
  die() {
    game.over()
  }
}

function createFood() {
  //食物随机坐标
  var x = null,
      y = null;
  var include = true; //循环跳出的条件,true表示食物坐标在蛇身上继续循环，false不循环
  while(include) {
    x = Math.round(Math.random() * (td-1));
    y = Math.round(Math.random() * (tr-1));

    snake.pos.forEach(function(value) {
      if(value[0] !== x && value[1] !== y) {
        include = false;
      }
    })
  }
  //生成食物
  food = new Square(x, y, 'food');
  food.pos = [x, y];
  var foodDom = document.querySelector('.food');
  if(foodDom) {
    foodDom.style.left = x * sw + 'px';
    foodDom.style.top = y * sh + 'px';
  } else {
    food.create();
  }
}
var snake = new Snake()



class Game {
  constructor() {
    this.timer = null;
    this.score = 0;
  }
  init() {
    snake.init();
    createFood();
    document.onkeydown = function (e) {
      e.preventDefault();
      if (e.which === 37 && snake.direction !== snake.directionNum.right) {
        snake.direction = snake.directionNum.left;
      } else if (e.which === 38 && snake.direction !== snake.directionNum.down) {
        snake.direction = snake.directionNum.up;
      } else if (e.which === 39 && snake.direction !== snake.directionNum.left) {
        snake.direction = snake.directionNum.right;
      } else if (e.which === 40 && snake.direction !== snake.directionNum.up) {
        snake.direction = snake.directionNum.down;
      }
    }
    this.start();
  }
  start() {
    this.timer = setInterval(function () {
      snake.getNextPos();
    }, 200)
  }
  over() {
    clearInterval(this.timer);
    alert('你的得分为' + this.score);
    //回到最初
    var snakeWrap = document.querySelector('#snakeWrap');
    snakeWrap.innerHTML = '';
    snake = new Snake();
    game = new Game();
    var startBtnWrap = document.querySelector('.startBtn');
    startBtnWrap.style.display = 'block';
  }
  pause() {
    clearInterval(this.timer);
  }
}
game = new Game();
var startBtn = document.querySelector('.startBtn button');
startBtn.onclick = function () {
  startBtn.parentNode.style.display = 'none';
  game.init();
}
//暂停
var snakeWrap = document.querySelector('#snakeWrap');
var pauseBtn = document.querySelector('.pauseBtn button');
snakeWrap.onclick = function () {
  game.pause();
  pauseBtn.parentNode.style.display = 'block';
}
pauseBtn.onclick = function () {
  game.start();
  pauseBtn.parentNode.style.display = 'none';
}





