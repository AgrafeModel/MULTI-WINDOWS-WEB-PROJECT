import {
  getPosSize,
  savePosSize,
  checkUserInactivity,
} from "../utils/utils.js";

/*INIT THE MULTIPLE WINDOWS*/

//parse the url to get the id
var id = window.location.search.split("=")[1];
//if their is not id parameter
if (id == null) {
  //get the users save in local storage. get the greatest id and add 1
  var locals = localStorage;
  var max = -1;
  //get all the items in local storage with int as key
  for (var key in locals) {
    if (parseInt(key) > max) {
      max = parseInt(key);
    }
  }
  id = max + 1;

  //set the url with the id
  window.location.search = "?id=" + id;
}

//if playground, hide the score h
if (id == 0) {
  document.getElementById("score").style.display = "none";
  //remove the hidden class from newpane
  document.getElementById("newpane").classList.remove("hidden");
  //Add a listener to the button in newpane
  document.getElementById("newpane").addEventListener("click", function () {
    //open a new window with the same url except no query string. the window in open in a new window
    const url = window.location.href.split("?")[0];
    //open popup
    var win = window.open(url, "_blank");
    //focus the popup
    win.focus();
  });
}

/*INIT THE GAME*/
const canvas = document.getElementById("canvas");

/*BALL*/

var ball = {
  x: 0,
  y: 0,
  radius: 15,
  speed: 5,
  velocityX: 10,
  velocityY: 10,
  color: "BLACK",
};

/**
 * @brief This function is used to init the ball
 * @returns the ball info
 */
function initBall() {
  //check in local stagege if the ball exist
  var ballInfo = localStorage.getItem("ball");
  //if the ball exist
  if (ballInfo != null) {
    //get the ball info
    ball = JSON.parse(ballInfo);
  } else {
    const vpos = getPosSize();
    //set the ball info
    ball.x = vpos.pos.x;
    ball.y = vpos.pos.y;
    ball.radius = 10;
    ball.speed = 5;
    ball.velocityX = 5;
    ball.velocityY = 5;
    ball.color = "BLACK";
  }
  return ball;
}

/**
 * @brief This function is used to move the ball
 */
function ballMove() {
  //check if this window is the playground
  if (id != 0) {
    return;
  }
  //check before moving if the ball will hit a wall
  var nextX = ball.x + ball.velocityX;
  var nextY = ball.y + ball.velocityY;
  if (nextX + ball.radius > window.outerWidth || nextX - ball.radius < 0) {
    ball.velocityX *= -1;
  }
  if (nextY + ball.radius > window.outerHeight || nextY - ball.radius < 0) {
    ball.velocityY *= -1;
  }

  //get all the players (in local storage > 0)
  var players = [];
  for (var key in localStorage) {
    if (key != 0 && key != ball) {
      try {
        players.push(JSON.parse(localStorage[key]));
        //check if the ball will hit a player
        checkPlayerCollision(players[players.length - 1], nextX, nextY);
      } catch (e) {}
    }
  }

  //move the ball
  ball.x += ball.velocityX;
  ball.y += ball.velocityY;

  //save the ball info
  localStorage.setItem("ball", JSON.stringify(ball));
}

/*COINS*/

var coins = [];

/**
 * @brief This function is used to spawn a coin
 * @returns the coin info
 */
function spawnCoin() {
  //get the window info
  var posSize = getPosSize();
  //create a coin
  var coin = {
    x: Math.random() * posSize.size.width + posSize.pos.x,
    y: Math.random() * posSize.size.height + posSize.pos.y,
    radius: 50,
    color: "BLACK",
  };
  //add the coin to the list
  coins.push(coin);
  return coin;
}

/**
 * @brief This function is used to draw the coins
 */
function drawCoins() {
  if (id != 0) {
    return;
  }
  //get the window info
  var posSize = getPosSize();
  //draw the coins
  for (var i = 0; i < coins.length; i++) {
    //draw a circle border
    var coin = coins[i];
    canvas.getContext("2d").beginPath();
    canvas.getContext("2d").arc(coin.x, coin.y, coin.radius, 0, 2 * Math.PI);
    canvas.getContext("2d").stroke();
    //draw a small circle (half the radius) in the center
    canvas.getContext("2d").beginPath();
    canvas
      .getContext("2d")
      .arc(coin.x, coin.y, coin.radius / 2, 0, 2 * Math.PI);
    canvas.getContext("2d").stroke();
    //same but half of half (and fill)
    canvas.getContext("2d").beginPath();
    canvas
      .getContext("2d")
      .arc(coin.x, coin.y, coin.radius / 4, 0, 2 * Math.PI);
    canvas.getContext("2d").fill();
  }
}

/**
 * @brief This function is used to check if the ball hit a coin
 */
function checkCoinCollision() {
  for (var i = 0; i < coins.length; i++) {
    var coin = coins[i];
    //if the ball hit the coin
    if (
      ball.x + ball.radius > coin.x - coin.radius &&
      ball.x - ball.radius < coin.x + coin.radius &&
      ball.y + ball.radius > coin.y - coin.radius &&
      ball.y - ball.radius < coin.y + coin.radius
    ) {
      //remove the coin from the list
      coins.splice(i, 1);
      //add 1 to the score
      var score = localStorage.getItem("score");
      if (score == null) {
        score = 0;
      }
      score++;
      localStorage.setItem("score", score);
    }
  }
}

/*PLAYERS*/

/**
 *  @brief This function is used to draw the score of the player on non playground windows
 */
function drawUserScore() {
  //if not the playground
  if (id != 0) {
    //draw the score of the player localy
    var score = localStorage.getItem("score");
    if (score != null) {
      document.getElementById("score").innerHTML = "<p>" + score + "</p>";
    } else {
      document.getElementById("score").innerHTML = "<p>0</p>";
    }

    return;
  }
}

/**
 * @brief This function is used to check if the ball hit a player
 *@todo upgrade this function and avoir the four check
 */
function checkPlayerCollision(player, nextX, nextY) {
  try {
    //if the ball hit the player on left side
    if (
      nextX - ball.radius < player.pos.x + player.size.width &&
      nextX - ball.radius > player.pos.x &&
      nextY > player.pos.y &&
      nextY < player.pos.y + player.size.height
    ) {
      ball.velocityX *= -1;
    }
    //if the ball hit the player on right side
    if (
      nextX + ball.radius > player.pos.x &&
      nextX + ball.radius < player.pos.x + player.size.width &&
      nextY > player.pos.y &&
      nextY < player.pos.y + player.size.height
    ) {
      ball.velocityX *= -1;
    }

    //if the ball hit the player on top side
    if (
      nextY - ball.radius < player.pos.y + player.size.height &&
      nextY - ball.radius > player.pos.y &&
      nextX > player.pos.x &&
      nextX < player.pos.x + player.size.width
    ) {
      ball.velocityY *= -1;
    }
    //if the ball hit the player on bottom side
    if (
      nextY + ball.radius > player.pos.y &&
      nextY + ball.radius < player.pos.y + player.size.height &&
      nextX > player.pos.x &&
      nextX < player.pos.x + player.size.width
    ) {
      ball.velocityY *= -1;
    }
  } catch (e) {}
}


/**
 * @brief This function is used to draw the ball
 */
function drawBall() {
  //check if this window is the playground
  if (id != 0) {
    return;
  }
  var pos = getPosSize().pos;
  //translate the canvas to the origine
  canvas.getContext("2d").translate(-pos.x, -pos.y);
  //resize the canvas to the size of the screen
  canvas.width = window.outerWidth;
  canvas.height = window.outerHeight;

  //draw the ball based on local storage info
  var ballInfo = localStorage.getItem("ball");
  if (ballInfo != null) {
    var ball = JSON.parse(ballInfo);
    //Draw the outline of a circle on the position of the ball
    canvas.getContext("2d").beginPath();
    canvas.getContext("2d").arc(ball.x, ball.y, ball.radius, 0, 2 * Math.PI);
    //and a small ball in the center
    canvas.getContext("2d").arc(ball.x, ball.y, 2, 0, 2 * Math.PI);
    canvas.getContext("2d").fill();
    canvas.getContext("2d").beginPath();
    canvas.getContext("2d").arc(ball.x, ball.y, ball.radius, 0, 2 * Math.PI);
    canvas.getContext("2d").fill();
    canvas.getContext("2d").stroke();
  } else {
    initBall();
  }
}


function PongMainLoop() {
    savePosSize(id);
    checkUserInactivity();
    //move the ball
    ballMove();
    //draw the ball
    drawBall();
    checkCoinCollision();
    drawCoins();
    //draw the users
    drawUserScore();
}



//init and start loop game
initBall();
spawnCoin();
setInterval(PongMainLoop, 1);
