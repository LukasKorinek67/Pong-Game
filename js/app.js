var renderer;
var camera;
var scene;

var pong;
var playerRight;
var playerLeft;
var playgroundWidth = 6;
var playgroundHeight = 3;
var playgroundDepth = 0.01;
var gameSpeed = 0.08;
var ballDirection = 0.6;
var paddleLong = 0.6;
var winScore = 11;
var gameStarted = false;
var gameEnded = false;
var soundOn = true;

/*
* Hlavní onload funkce - nastaví Three.js, vytvoří balónek, hráče, hřiště a bariéry
* postupně se vše přidá do scény a vytvoří se objekt GamePong. Nakonec se zavolá animate()
*/
window.onload = function() {
	setThree();
	var ball = createBall();
	playerRight = createPlayer("ArrowUp", "ArrowDown", "right");
	if(isTwoPlayersGame()){
		playerLeft = createPlayer("w", "s", "left");
	} else {
		playerLeft = createAIPlayer("left");
	}
	var playground = createPlayground();
	var topBorder = createTopBorder();
	var bottomBorder = createBottomBorder();
	addToScene(ball, playerRight, playerLeft);
	pong = new GamePong(ball, playerRight, playerLeft, playground, topBorder, bottomBorder);
	animate();
}

// Metoda která spustí hru - gameStarted které používá metoda animate() se změní na true
function startGame() {
	if(!gameStarted) {
		pong.setBallStartingSpeed((gameSpeed-0.03));
		gameStarted = true;
		hideSettings();
		hideMouseCursor();
	}
}

function setThree() {
	renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
	document.body.appendChild(renderer.domElement);

	scene = new THREE.Scene();
	scene.background = new THREE.Color(0x000000);

	camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.01, 100);
	camera.position.set(0, -3, 4);
	camera.lookAt(scene.position);
	
	var light = new THREE.HemisphereLight(0xffeeb1, 0x080820, 4);
	scene.add(light);
}

function createBall() {
	var radius = 0.06;
	var geometry = new THREE.SphereGeometry( radius, 32, 32 );
	var material = new THREE.MeshPhongMaterial( {color: 0xFFFFFF} );
	var speed =  gameSpeed;
	ball = new Ball(geometry, material, speed);
	ball.position.z = radius + playgroundDepth;
	return ball;
}

function createPlayer(keyUp, keyDown, playerSide) {
	var width = 0.08;
	var height = paddleLong;
	var depth = 0.1;
	var speed =  gameSpeed;
	var geometry = new THREE.BoxGeometry(width, height, depth);
	var material = new THREE.MeshPhongMaterial({color: 0xFFFFFF});
	player = new Player(geometry, material, keyUp, keyDown, speed, playerSide);
	if(playerSide == "left"){
		player.position.x = -playgroundWidth / 2 - width / 2;
	} else {
		player.position.x = playgroundWidth / 2 + width / 2;
	}
	player.position.z = depth;
	return player;
}

function createAIPlayer(playerSide, playerColor = 0x00D8FF) {
	var width = 0.08;
	var height = paddleLong;
	var depth = 0.1;
	var speed =  0.03;
	var geometry = new THREE.BoxGeometry(width, height, depth);
	var material = new THREE.MeshPhongMaterial({color: playerColor});
	player = new AIPlayer(geometry, material, speed, "left");
	if(playerSide == "left") {
		player.position.x = -playgroundWidth / 2 - width / 2;
	} else {
		player.position.x = playgroundWidth / 2 + width / 2;
	}
	player.position.z = depth;
	return player;
}

function createPlayground() {
	var width = playgroundWidth;
	var height = playgroundHeight;
	var depth = playgroundDepth;
	var geometry = new THREE.BoxGeometry(width, height, depth);
	var material = null;
	var playground = new Rectangle(geometry, material);
	// načtení textury
	const loader = new THREE.TextureLoader();
	loader.load(
		'textures/black_texture.jpg',
		// Function when resource is loaded
		function (texture) {
			material = new THREE.MeshBasicMaterial( {
				map: texture
			});
			playground = new Rectangle(geometry, material);
			scene.add(playground);
		},
		// Function called when download progresses
		function (xhr) {
			console.log( (xhr.loaded / xhr.total * 100) + '% loaded' );
		},
		// Function called when download errors
		function (xhr) {
			console.log( 'An error happened' );
		}
	);
	return playground;
}

function createTopBorder() {
	var width = playgroundWidth;
	var height = 0.05;
	var depth = 0.4;
	var geometry = new THREE.BoxGeometry(width, height, depth);
	//var material = new THREE.MeshBasicMaterial({color: 0xcccccc, side: THREE.DoubleSide});
	var material = null;
	var topBorder = new TopBorder(geometry, material);
	topBorder.position.y = playgroundHeight / 2 + height / 2;
	// načtení textury
	const loader = new THREE.TextureLoader();
	loader.load(
		'textures/black_texture_lines.jpg',
		// Function when resource is loaded
		function (texture) {
			material = new THREE.MeshBasicMaterial({
				map: texture
			});
			topBorder = new TopBorder(geometry, material);
			topBorder.position.y = playgroundHeight / 2 + height / 2;
			scene.add(topBorder);
		},
		// Function called when download progresses
		function (xhr) {
			console.log((xhr.loaded / xhr.total * 100) + '% loaded');
		},
		// Function called when download errors
		function (xhr) {
			console.log('An error happened');
		}
	);
	return topBorder;
}

function createBottomBorder() {
	var width = playgroundWidth;
	var height = 0.05;
	var depth = 0.4;
	var geometry = new THREE.BoxGeometry(width, height, depth);
	var material = null;
	bottomBorder = new BottomBorder(geometry, material);
	bottomBorder.position.y = -playgroundHeight / 2 - height / 2;
	// načtení textury
	const loader = new THREE.TextureLoader();
	loader.load(
		'textures/black_texture_lines.jpg',
		// Function when resource is loaded
		function (texture) {
			material = new THREE.MeshBasicMaterial({
				map: texture
			});
			bottomBorder = new BottomBorder(geometry, material);
			bottomBorder.position.y = -playgroundHeight / 2 - height / 2;
			scene.add(bottomBorder);
		},
		// Function called when download progresses
		function (xhr) {
			console.log((xhr.loaded / xhr.total * 100) + '% loaded');
		},
		// Function called when download errors
		function (xhr) {
			console.log('An error happened');
		}
	);
	return bottomBorder;
}

function addToScene(ball, playerRight, playerLeft) {
	scene.add(ball);
	scene.add(playerRight);
	scene.add(playerLeft);
}

function animate() {
    requestAnimationFrame(animate);
	if(gameStarted) {
		pong.animate();
	}
	render();
}

function render() {
	renderer.render(scene, camera);
}

function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize(window.innerWidth, window.innerHeight);
	render();
}

class GamePong {
	constructor(ball, playerRight, playerLeft, playground, topBorder, bottomBorder) {
		this.ball = ball;
		this.playerRight = playerRight;
		this.playerLeft = playerLeft;
		this.playground = playground;
		this.topBorder = topBorder;
		this.bottomBorder = bottomBorder;
		this.keys = {};
		this.paused = false;
		this.addEventListeners();
		this.drawWinScore()
		this.drawSoundIcon();
	}
	
	addEventListeners() {
        window.addEventListener('keydown', event => {
			this.setStartKey(event);
			this.setPauseKey(event);
			this.setSoundKey(event);
			this.setHelpKey(event);
			this.blockPageDownAndUp(event);
			this.keys[event.key] = true;
        },true); 
    
        window.addEventListener('keyup', event => {
            this.keys[event.key] = false;
        },true);
        
        window.addEventListener('resize', onWindowResize, false);
	}

	// Nastavení klávesy "Enter" na spuštění hry
	setStartKey(event) {
		var startKey = "Enter";
		if(event.key == startKey) {
			startGame();
		}
	}

	// Nastavení klávesy "Escape" na pauznutí/odpauznutí hry
	setPauseKey(event) {
		var pauseKey = "Escape";
		if(event.key == pauseKey) {
			if(!this.paused && gameStarted){
				this.pauseGame();
			} else if (gameStarted){
				this.resumeGame();
			}
		}
	}

	// Nastavení klávesy "m" na zapnutí/vypnutí zvuku
	setSoundKey(event) {
		var soundKey = "m";
		if(event.key == soundKey) {
			var mouseOnSoundButton = false;
			soundOnOff(mouseOnSoundButton);
		}
	}

	// Nastavení klávesy "h" na zobrazení/skrytí nápovědy
	setHelpKey(event) {
		var helpKey = "h";
		if(event.key == helpKey) {
			hideOrShowHelp();
		}
	}

	/* 
	* Metoda k zablokování šipek aby nefungovali jako PageUp a PageDown klávesy
	* aby se při zmenšení obrazovky při hře neposouvala obrazovka při pohybu pravého hráče
	*/
	blockPageDownAndUp(event) {
		// arrow keys - 37, 38, 39, 40
		if([37, 38, 39, 40].indexOf(event.keyCode) > -1) {
			event.preventDefault();
		}
	}
	
	pauseGame() {
		this.paused = true;
		this.ball.pause();
		document.getElementById("pauseText").style.visibility = "visible";
		document.getElementById("pause_help_text").textContent = "RESUME";
		this.playerLeft.pause();
		this.playerRight.pause();
	}

	endGame() {
		this.ball.pause();
		this.playerLeft.pause();
		this.playerRight.pause();
	}

	resumeGame() {
		this.paused = false;
		document.getElementById("pauseText").style.visibility = "hidden";
		document.getElementById("pause_help_text").textContent = "PAUSE";
		this.ball.resume();
		this.playerLeft.resume();
		this.playerRight.resume();
	}

	changePlayerLeft(playerLeft) {
		this.playerLeft = playerLeft;
	}
	
	// Metoda která změní rychlost hry
	changeGameSpeed(speed) {
		if(!(this.playerLeft instanceof AIPlayer)){
			this.playerLeft.changeSpeed(speed);
		}
		this.playerRight.changeSpeed(speed);
		this.ball.changeSpeed(speed);
	}

	/*
	* Metoda která nastaví počáteční rychlost balónku
	* po spuštění jede míček trochu pomaleji (do prvního odpálení)
	* aby měl hráč možnost zareagovat na směr rozjetí balónku
	*/
	setBallStartingSpeed(startingSpeed) {
		this.ball.setStartingSpeed(startingSpeed);
	}

	// Metoda na update skóre v HTML
	updateScore() {
		document.getElementById("score").innerHTML = (this.playerLeft.score + '-' + this.playerRight.score);
	}

	// Vykreselení počtu gólu, které je potřeba k vítězství
	drawWinScore() {
		document.getElementById("win_score_text").textContent = "First player to score " + winScore + " goals wins!";
	}

	// vykreslení správné ikony na tlačítku, které zapíná/vypíná zvuk
	drawSoundIcon() {
		if(soundOn) {
			document.getElementById("sound_img").src = "images/sound_img/no-sound.png";
		} else {
			document.getElementById("sound_img").src = "images/sound_img/sound.png";
		}
		setSoundIconHover();
	}

	// Metoda animate - pohyb balónku, hlídání odrazů, gólů, konce hry
	animate() {
		this.ball.move();
        this.handlePlayerTouch();
		this.handleBorderTouch();
        this.handlePlayerMoves(this.playerLeft);
        this.handlePlayerMoves(this.playerRight);
		this.checkIfGoal();
		this.checkGameEnd();
	}

	// Metoda která se stará o odraz balónku od hráče
	handlePlayerTouch() {
		if (this.playerLeft.isTouch(this.ball.xMinPosition)){
			const paddleCenter = ((this.playerLeft.yMaxPosition.y + this.playerLeft.yMinPosition.y) / 2);
			const ballTouch = this.ball.xMinPosition.y;
			var maxDistanceFromCenter = this.playerLeft.yMaxPosition.y - paddleCenter;
			var bounceAngle = this.getBounceAngle(paddleCenter, ballTouch, maxDistanceFromCenter);
			var ballSpeedUpAngle = 0.5;
			if(bounceAngle < ballSpeedUpAngle && bounceAngle > -ballSpeedUpAngle) {
				this.ball.bounceOfPlayer(gameSpeed+0.02, bounceAngle);
			} else {
				this.ball.bounceOfPlayer(gameSpeed+0.02, bounceAngle);
			}
		} else if (this.playerRight.isTouch(this.ball.xMaxPosition)){
			const paddleCenter = ((this.playerRight.yMaxPosition.y + this.playerRight.yMinPosition.y) / 2);
			const ballTouch = this.ball.xMaxPosition.y;
			var maxDistanceFromCenter = this.playerRight.yMaxPosition.y - paddleCenter;
			var bounceAngle = this.getBounceAngle(paddleCenter, ballTouch, maxDistanceFromCenter);
			var ballSpeedUpAngle = 0.5;
			if(bounceAngle < ballSpeedUpAngle && bounceAngle > -ballSpeedUpAngle) {
				this.ball.bounceOfPlayer(-gameSpeed-0.02, -bounceAngle);
			} else {
				this.ball.bounceOfPlayer(-gameSpeed, -bounceAngle);
			}
		}

	}
	
	// Metoda která vypočítá úhel odrazu od pálky
	getBounceAngle(paddleCenter, ballTouch, maxDistanceFromCenter) {
		//const MAXBOUNCEANGLE = (5*Math.PI)/12;
		const MAXBOUNCEANGLE = 1.2;
		var touchPosition = paddleCenter - ballTouch;
		touchPosition = touchPosition/maxDistanceFromCenter;
		var bounceAngle = MAXBOUNCEANGLE * touchPosition;
		return bounceAngle;
	}

	// Metoda která se stará o odraz balónku od bariéry
    handleBorderTouch() {
		if (this.topBorder.isTouch(this.ball.yMaxPosition) ||
            this.bottomBorder.isTouch(this.ball.yMinPosition)){
			this.ball.reverseDirection();
        }
    }

	// Metoda která se stará o pohyb hráčů
    handlePlayerMoves(player) {
        if (player instanceof AIPlayer){
			this.handleAIPlayerMoves(player);
        }else{
			var tolerance = 0.001;
			if (this.keys[player.keyUp]){
				if (player.position.y + player.height/2 + player.speed <= this.topBorder.yMinPosition.y + tolerance){
                    player.moveUp();
				}
            }else if (this.keys[player.keyDown]){
				if (player.position.y - player.height/2 - player.speed >= this.bottomBorder.yMaxPosition.y - tolerance){
                    player.moveDown();
				}
            }
        } 
	}
	
	// Metoda která se stará o pohyb AI protivníka
	handleAIPlayerMoves(aiPlayer) {
		if(this.ball.speed < 0){
			var tolerance = 0.001;
			if(this.ball.position.y > aiPlayer.position.y) {
				if (aiPlayer.position.y + aiPlayer.height/2 + aiPlayer.speed <= this.topBorder.yMinPosition.y + tolerance){
					var difference = Math.abs(this.ball.position.y - aiPlayer.position.y);
					aiPlayer.moveUp(difference);
				}
			} else if(this.ball.position.y < aiPlayer.position.y) {
				if (aiPlayer.position.y - aiPlayer.height/2 - aiPlayer.speed >= this.bottomBorder.yMaxPosition.y - tolerance){
					var difference = Math.abs(this.ball.position.y - aiPlayer.position.y);
					aiPlayer.moveDown(difference);
				}
			}
		}
	}

	// Metoda která hlídá, kdy padne gól
    checkIfGoal() {
		var tolerance = 0.05;
		if ((this.ball.xMaxPosition.x + tolerance) <= this.playground.xMinPosition.x){
			this.playerRight.scoreGoal();
			var sound = new Audio('sounds/goal.wav');
			playSound(sound);
			this.updateScore();
			this.ball.respawn();
        }else if ((this.ball.xMinPosition.x - tolerance) >= this.playground.xMaxPosition.x){
			this.playerLeft.scoreGoal();
			if(playerLeft instanceof AIPlayer) {
				var sound = new Audio('sounds/bad_goal.wav');
			} else {
				var sound = new Audio('sounds/goal.wav');
			}
			playSound(sound);
			this.updateScore();
			this.ball.respawn();
        }
	}

	/* 
	* Metoda která hlídá, kdy je konec hry
	* zároveň podle výsledku nastaví textu na Modalu a zvolí hudbu
	*/
	checkGameEnd() {
		if(this.playerRight.score >= winScore) {
			this.endGame()
			var sound;
			if(this.playerLeft instanceof AIPlayer) {
				document.getElementById("game_over_text").textContent = "You win!";
				sound = new Audio('sounds/win_song.mp3');
			} else {
				document.getElementById("game_over_text").textContent = "Right player wins!";
				sound = new Audio('sounds/win_song.mp3');
			}
			openGameOverModal(sound);
		}
		if(this.playerLeft.score >= winScore) {
			this.endGame();
			var sound;
			if(this.playerLeft instanceof AIPlayer) {
				document.getElementById("game_over_text").textContent = "You lost!";
				sound = new Audio('sounds/lost_song.mp3');
			} else {
				document.getElementById("game_over_text").textContent = "Left player wins!";
				sound = new Audio('sounds/win_song.mp3');
			}
			openGameOverModal(sound);
		}
	}
}

// Třída Rectangle, od které dědí Player, TopBorder, BottomBorder, Playground
class Rectangle extends THREE.Mesh{
    constructor(geometry, material) {
		super(geometry, material)
    }

    get width() {
        return this.geometry.parameters.width;
    }

    set width(width) {
        this.geometry.parameters.width = width;
    }

    get height() {
        return this.geometry.parameters.height;
    }

    set height(height) {
        this.geometry.parameters.height = height;
    }

    get depth() {
        return this.geometry.parameters.depth;
    }

    set depth(depth) {
        this.geometry.parameters.depth = depth;
	}
	
	get xMaxPosition() {
        var position = this.position.clone();
        position.x += this.width/2;
        return position;
    }

    get xMinPosition() {
        var position = this.position.clone();
        position.x -= this.width/2;
        return position;
    }

    get yMaxPosition() {
        var position = this.position.clone();
        position.y += this.height/2;
        return position;
    }

    get yMinPosition() {
        var position = this.position.clone();
        position.y -= this.height/2;
        return position;
    }

    get zMaxPosition() {
        var position = this.position.clone();
        position.z += this.depth/2;
        return position;
    }

    get zMinPosition() {
        var position = this.position.clone();
        position.z -= this.depth/2;
        return position;
    }
}

class TopBorder extends Rectangle {
	constructor(geometry, material){
		super(geometry, material)
	}
	
	// Metoda na zjištění, zda se balón (zadaný jako position) dotkl bariéry 
	isTouch(position) {
		if(position.y >= this.position.y - this.height / 2) {
			return true;
		} else {
			return false;
		}
    }
}

class BottomBorder extends Rectangle {
	constructor(geometry, material){
		super(geometry, material)
	}
	
	// Metoda na zjištění, zda se balón (zadaný jako position) dotkl bariéry 
	isTouch(position) {
		if(position.y <= this.position.y + this.height / 2) {
			return true;
		} else {
			return false;
		}
    }
}

class Player extends Rectangle {
	constructor(geometry, material, keyUp, keyDown, speed, side) {
		super(geometry, material);
		this.score = 0;
        this.keyUp = keyUp;
        this.keyDown = keyDown;
		this.speed = speed;
		this.side = side;
	}

	// Metoda na zjištění, zda se balón(zadaný jako position) dotkl hráče
	isTouch(position) {
		if(this.side == "left") {
			if (position.x <= this.position.x + this.width / 2 &&
				position.y >= this.position.y - this.height / 2 &&
            	position.y <= this.position.y + this.height / 2 ) {
				return true;
			} else {
				return false;
			}
		} else if(this.side == "right") {
			if (position.x >= this.position.x - this.width / 2 &&
				position.y >= this.position.y - this.height / 2 &&
            	position.y <= this.position.y + this.height / 2 ) {
				return true;
			} else {
				return false;
			}
		}
    }

	scoreGoal() {
		this.score += 1;
	}

	moveUp() {
		this.position.y += this.speed;
    }

    moveDown() {
        this.position.y -= this.speed;
	}

	pause() {
		this.pausedSpeed = this.speed;
		this.speed = 0;
	}

	resume() {
		this.speed = this.pausedSpeed;
	}

	changeSpeed(speed) {
		this.speed = speed;
	}
}

class AIPlayer extends Player {
	constructor(geometry, material, speed, side) {
		super(geometry, material, null, null, speed, side);
		this.difficulty = "medium";
		this.speed = gameSpeed - 0.03;
	}

	// změna rychlosti AI hráče podle obtížnosti
	changeDifficulty(difficulty) {
		if(difficulty == "easy") {
			this.difficulty = "easy";
			this.speed = gameSpeed - 0.041;
		} else if(difficulty == "medium") {
			this.difficulty = "medium";
			this.speed = gameSpeed - 0.03;
		} else if(difficulty == "hard") {
			this.difficulty = "hard";
			this.speed = gameSpeed - 0.03;
		} else if(difficulty == "expert") {
			this.difficulty = "expert";
			this.speed = gameSpeed - 0.028;
		} else {
			this.difficulty = "medium";
			this.speed = gameSpeed - 0.03;
		}
	}

	/*
	* Metoda která vrátí, zda AI Player "ztratil koncentraci"
	* při ztrátě koncentrace vynechá na chvilku pohyb
	*/
	hasLostConcentration() {
		var randomNumber = Math.floor(Math.random() * 11);
		if(this.difficulty == "easy") {
			return (randomNumber >= 7);
		} else if(this.difficulty == "medium") {
			return (randomNumber >= 8);
		} else if(this.difficulty == "hard") {
			return (randomNumber >= 9);
		} else if(this.difficulty == "expert") {
			return (randomNumber == 10);
		} else {
			return (randomNumber >= 8);
		}
	}

	moveUp(difference) {
		if(!this.hasLostConcentration()) {
			// difference je zde kvůli tomu aby to AI player nepřejížděl a "nebugoval" se
			if(difference < this.speed) {
				this.position.y += (difference/2);
			}else {
				this.position.y += this.speed;
			}
		}
    }

    moveDown(difference) {
		if(!this.hasLostConcentration()) {
			// difference je zde kvůli tomu aby to AI player nepřejížděl a "nebugoval" se
			if(difference < this.speed) {
				this.position.y -= (difference/2);
			}else {
				this.position.y -= this.speed;
			}
		}
	}
}

class Ball extends THREE.Mesh {
	constructor(geometry, material, speed) {
		super(geometry, material);
		this.speed = speed;
		this.direction = this.getRandomDirection();
		this.paused = false;
		this.soundBounce = new Audio('sounds/bounce.mp3');
	}
	
	// Metoda která vrátí náhodný směr při respawnu
	getRandomDirection() {
		var maxAngle = 0.6;
		return ((Math.random()* (maxAngle*2)) - maxAngle);
	}

	// Respawn balónku po gólu
	respawn() {
        this.position.x = 0;
        this.position.y = 0;
		this.direction = this.getRandomDirection();
		this.reverseSpeed();
		var previousSpeed = this.speed;
		this.speed = 0;
		var respawnPause = 1000;
		this.respawning = true;
		setTimeout(() => {
			if(!this.paused) {
				if(previousSpeed > 0) {
					this.speed = this.getRespawnSpeed();
				} else {
					this.speed = -this.getRespawnSpeed();
				}
			} else {
				if(previousSpeed > 0) {
					this.pausedSpeed = this.getRespawnSpeed();
				} else {
					this.pausedSpeed = -this.getRespawnSpeed();
				}
			}
			this.respawning = false;
		}, respawnPause);
	}

	// Metoda která nastaví počáteční zpomalenou rychlost balónku
	setStartingSpeed(startingSpeed) {
		var maxStartingSpeed = 0.06;
		if(startingSpeed < maxStartingSpeed) {
			this.changeSpeed(startingSpeed);
		} else {
			this.changeSpeed(maxStartingSpeed);
		}
	}

	// Metoda která nastaví zpomalenou rychlost balónku po respawnu
	getRespawnSpeed() {
		var maxRespawnSpeed = 0.06;
		var slowDown = 0.03;
		if ((gameSpeed-slowDown) < maxRespawnSpeed) {
			return (gameSpeed-slowDown);
		} else {
			return maxRespawnSpeed;
		}
	}

    move() {
        this.position.x += this.speed * Math.cos( this.direction );
        this.position.y -= this.speed * Math.sin( this.direction );
	}
	
	// Metoda která změní směr a rychlost po odrazu od hráče
	bounceOfPlayer(newSpeed, newDirection) {
		playSound(this.soundBounce)
		this.changeSpeed(newSpeed);
		this.changeDirection(newDirection);
	}

	pause() {
		this.paused = true;
		this.pausedSpeed = this.speed;
		this.speed = 0;
	}

	resume() {
		this.paused = false;
		this.speed = this.pausedSpeed;
	}

	reverseSpeed() {
		this.speed = -this.speed;
	}
	
	changeSpeed(speed) {
		this.speed = speed;
	}

    reverseDirection() {
		this.direction = -this.direction;
	}

	changeDirection(direction) {
		this.direction = direction;
	}

	getDirection() {
		return this.direction;
	}

	get radius() {
        return this.geometry.parameters.radius;
    }

    set radius(radius) {
        this.geometry.parameters.radius = radius;
    }

    get xMaxPosition() {
        var position = this.position.clone();
        position.x += this.radius;
        return position;
    }

    get xMinPosition() {
        var position = this.position.clone();
        position.x -= this.radius;
        return position;
    }

    get yMaxPosition() {
        var position = this.position.clone();
        position.y += this.radius;
        return position;
    }

    get yMinPosition() {
        var position = this.position.clone();
        position.y -= this.radius;
        return position;
    }
}

/* 
* Metoda která mění počet hráčů
* mění leveého hráče na AIPlayer nebo zpět na Player podle nastavené volby
* zároveň zviditelní nebo skryje ovládání pro levého hráče
*/
function changeNumberOfPlayers() {
	scene.remove(playerLeft);
	if(document.getElementById("two_players_button").checked) {
		playerLeft = createPlayer("w", "s", "left");
		pong.changePlayerLeft(playerLeft);
		scene.add(playerLeft);
		document.getElementById("leftPlayerControls").style.visibility = "visible";
		document.getElementById("toggle_buttons_difficulty").style.visibility = "hidden";
		document.getElementById("toggle_buttons_speed").style.visibility = "visible";
	} else if(document.getElementById("one_player_button").checked) {
		playerLeft = createAIPlayer("left");
		pong.changePlayerLeft(playerLeft);
		scene.add(playerLeft);
		document.getElementById("leftPlayerControls").style.visibility = "hidden";
		document.getElementById("toggle_buttons_speed").style.visibility = "hidden";
		document.getElementById("toggle_buttons_difficulty").style.visibility = "visible";
	}
}

// Metoda která změní obtížnost (a zároveň barvu) AI hráče, podle obtížnosti se mění i rychlost hry
function changeDifficulty(difficulty) {
	if(playerLeft instanceof AIPlayer) {
		var color;
		var speed;
		if(difficulty == "easy") {
			color = 0x00FF32;
			speed = "average";
		} else if(difficulty == "medium") {
			color = 0x00D8FF;
			speed = "average";
		} else if(difficulty == "hard") {
			color = 0xF5F906;
			speed = "fast";
		} else if(difficulty == "expert") {
			color = 0xF91106;
			speed = "ultraFast";
		} else {
			color = 0xFFFFFF;
			speed = "average";
		}
		changeSpeed(speed);
		scene.remove(playerLeft);
		playerLeft = createAIPlayer("left", color);
		playerLeft.changeDifficulty(difficulty);
		pong.changePlayerLeft(playerLeft);
		scene.add(playerLeft);
	}
}

// Metoda která změní rychlost hry
function changeSpeed(newSpeed) {
	var speed;
	if(newSpeed == "slow"){
		speed = gameSpeed - 0.02;
	} else if(newSpeed == "average") {
		speed = gameSpeed;
	} else if(newSpeed == "fast") {
		speed = gameSpeed + 0.02;
	} else if(newSpeed == "ultraFast") {
		speed = gameSpeed + 0.04;
	} else {
		speed = gameSpeed;
	}
	pong.changeGameSpeed(speed);
	gameSpeed = speed;
}

/*
* Metoda na zapnutí/vypnutí zvuku (změní i obrázek na tlačítku)
* mouseOnButton je zde kvůli tomu, zda byla metoda zavolána kliknutím na tlačítko, nebo kliknutím na klávesnici
* podle toho se zvolí barva obrázku na tlačítku
*/
function soundOnOff(mouseOnButton = true) {
	soundOn = !soundOn;
	if(soundOn) {
		if(mouseOnButton) {
			document.getElementById("sound_img").src = "images/sound_img/no-sound_inverted.png";
		} else {
			document.getElementById("sound_img").src = "images/sound_img/no-sound.png";
		}
	} else {
		if(mouseOnButton) {
			document.getElementById("sound_img").src = "images/sound_img/sound_inverted.png";
		} else {
			document.getElementById("sound_img").src = "images/sound_img/sound.png";
		}
	}
}

// Metoda pro přehrání zvuku
function playSound(sound) {
	if(soundOn) {
		sound.play();
	}
}

function isTwoPlayersGame() {
	return document.getElementById("two_players_button").checked;
}

//Metoda která (po spuštění hry) skryje nastavení
function hideSettings() {
	document.getElementById("startButton").style.visibility = "hidden";
	document.getElementById("toggle_buttons").style.visibility = "hidden";
	document.getElementById("toggle_buttons_difficulty").style.visibility = "hidden";
	document.getElementById("toggle_buttons_speed").style.visibility = "hidden";
}

// Metoda která se stará o zobrazení/skrytí nápověď
function hideOrShowHelp() {
	// button text
	if(document.getElementById("help_button").textContent == "Hide help") {
		document.getElementById("help_button").textContent = "Show help";
	} else {
		document.getElementById("help_button").textContent = "Hide help"
	}

	// right player
	if(document.getElementById("rightPlayerControls").style.visibility == "visible") {
		document.getElementById("rightPlayerControls").style.visibility = "hidden";
	} else if(document.getElementById("rightPlayerControls").style.visibility == "hidden") {
		document.getElementById("rightPlayerControls").style.visibility = "visible";
	} else {
		document.getElementById("rightPlayerControls").style.visibility = "hidden";
	}
	
	// left player
	if(document.getElementById("leftPlayerControls").style.visibility == "visible") {
		document.getElementById("leftPlayerControls").style.visibility = "hidden";
	} else if (document.getElementById("leftPlayerControls").style.visibility == "hidden") {
		if(!(playerLeft instanceof AIPlayer)) {
			document.getElementById("leftPlayerControls").style.visibility = "visible";
		}
	} else {
		document.getElementById("leftPlayerControls").style.visibility = "hidden";
	}

	//Pause key
	if(document.getElementById("pause_help").style.visibility == "visible") {
		document.getElementById("pause_help").style.visibility = "hidden";
	} else if(document.getElementById("pause_help").style.visibility == "hidden") {
		document.getElementById("pause_help").style.visibility = "visible";
	} else {
		document.getElementById("pause_help").style.visibility = "hidden";
	}

	// Goal help
	if(document.getElementById("goal_help").style.visibility == "visible") {
		document.getElementById("goal_help").style.visibility = "hidden";
	} else if(document.getElementById("goal_help").style.visibility == "hidden") {
		document.getElementById("goal_help").style.visibility = "visible";
	} else {
		document.getElementById("goal_help").style.visibility = "hidden";
	}
}

/*
* Metoda která (po spuštění hry) skryje kurzor myši, aby nepřekážel na hřišti
* (jelikož tlačítko start je uprostřed hřiště).
* Po pohnutí myši se kurzor znovu zobrazí.
*/
function hideMouseCursor() {
	document.body.style.cursor = "none";
	document.addEventListener("mousemove", function(e) {
		document.body.style.cursor = "auto";
	});
}

// Metoda která změní obrázek(barvy) soundButtonu při hoveru
function setSoundIconHover() {
	var delay = 37;
	var soundButton = document.getElementById("soundButton");
	soundButton.onmouseenter = function() {
		setTimeout(() => {
			var soundImg = document.getElementById("sound_img");
			if (soundOn) {
				soundImg.src = "images/sound_img/no-sound_inverted.png";
			} else {
				console.log("SOUND");
				soundImg.src = "images/sound_img/sound_inverted.png";
			}
		}, delay);
	};
	soundButton.onmouseleave = function() {
		setTimeout(() => {
			var soundImg = document.getElementById("sound_img");
			if (soundOn) {
				soundImg.src = "images/sound_img/no-sound.png";
			} else {
				console.log("SOUND");
				soundImg.src = "images/sound_img/sound.png";
			}
		}, delay); 
	};
}

// Metoda která (po konci hry) zobrazí Modal s informací o vítězi a zároveň spustí hudbu
function openGameOverModal(sound) {
	if(document.getElementById("gameOverModal").style.display != "block"){
		playSound(sound);
	}
	document.getElementById("gameOverModal").style.display = "block";
	document.getElementById("gameOverModal").className = "modal fade show";
}

// Metoda která zavře Modal a resetuje stránku (restartuje hru)
function closeGameOverModal() {
	document.getElementById("gameOverModal").style.display = "none";
	document.getElementById("gameOverModal").className = "modal fade";
	location.reload();
}
