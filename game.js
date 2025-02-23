// game.js

class MainScene extends Phaser.Scene {
    constructor() {
      super("MainScene");
      this.score = 0;
      // Retrieve high score from localStorage or initialize to 0.
      this.highScore = localStorage.getItem("highScore")
        ? parseInt(localStorage.getItem("highScore"))
        : 0;
    }
  
    preload() {
      // Load the bird image.
      this.load.image("bird", "bird.png");
  
      // Generate a simple green pipe texture using Phaser graphics.
      let graphics = this.add.graphics();
      graphics.fillStyle(0x00ff00, 1);
      graphics.fillRect(0, 0, 50, 400);
      graphics.generateTexture("pipe", 50, 400);
      graphics.destroy();
  
      // Load sound assets.
      this.load.audio("jump", "sounds/jump.mp3");
      this.load.audio("score", "sounds/score.mp3");
      this.load.audio("gameover", "sounds/gameover.mp3");
    }
  
    create() {
      // Create the bird sprite with physics enabled.
      // Position it at x=100 and vertically centered.
      this.bird = this.physics.add.sprite(100, this.scale.height / 2, "bird");
      this.bird.setOrigin(0.5);
      this.bird.setCollideWorldBounds(true);
      // Scale the bird down a bit more.
      this.bird.setScale(0.04);
  
      // Create a group for the pipes.
      this.pipes = this.physics.add.group();
  
      // Display current score.
      this.scoreText = this.add.text(20, 20, "Score: " + this.score, {
        fontSize: "32px",
        fill: "#fff",
      });
      // Display high score.
      this.highScoreText = this.add.text(20, 60, "High Score: " + this.highScore, {
        fontSize: "32px",
        fill: "#fff",
      });
  
      // Spawn pipes every 1500 ms.
      this.pipeTimer = this.time.addEvent({
        delay: 1500,
        callback: this.spawnPipes,
        callbackScope: this,
        loop: true,
      });
  
      // Set collision detection between the bird and pipes.
      this.physics.add.collider(this.bird, this.pipes, this.hitPipe, null, this);
  
      // Allow manual control: pointer click and spacebar.
      this.input.on("pointerdown", this.flap, this);
      this.input.keyboard.on("keydown-SPACE", this.flap, this);
    }
  
    update() {
      // Rotate the bird based on its vertical velocity.
      this.bird.angle = Math.min(this.bird.body.velocity.y / 5, 30);
  
      // Update pipes: remove offscreen pipes and update score when passed.
      this.pipes.getChildren().forEach((pipe) => {
        if (pipe.x < -pipe.width) {
          this.pipes.remove(pipe, true, true);
        }
        // If the pipe hasn't been scored and has passed the bird, count half a point per pipe.
        if (!pipe.scored && pipe.x + pipe.width < this.bird.x) {
          pipe.scored = true;
          this.score += 0.5;
          if (Number.isInteger(this.score)) {
            this.sound.play("score");
            this.scoreText.setText("Score: " + this.score);
          }
        }
      });
  
      // End the game if the bird leaves the screen vertically.
      if (this.bird.y > this.scale.height || this.bird.y < 0) {
        this.gameOver();
      }
    }
  
    spawnPipes() {
      // Set the gap between the pipes to 300 pixels.
      const gapHeight = 300;
      // Determine a random position for the gap.
      const gapPosition = Phaser.Math.Between(100, this.scale.height - 100 - gapHeight);
  
      // Create the top pipe (flipped to have its bottom at the gap).
      let topPipe = this.pipes.create(this.scale.width, gapPosition, "pipe");
      topPipe.setOrigin(0, 1);
      topPipe.body.allowGravity = false;
      topPipe.setVelocityX(-200);
  
      // Create the bottom pipe.
      let bottomPipe = this.pipes.create(this.scale.width, gapPosition + gapHeight, "pipe");
      bottomPipe.setOrigin(0, 0);
      bottomPipe.body.allowGravity = false;
      bottomPipe.setVelocityX(-200);
  
      // Mark pipes as not scored yet.
      topPipe.scored = false;
      bottomPipe.scored = false;
    }
  
    flap() {
      // Apply an upward velocity and play the jump sound.
      this.bird.setVelocityY(-350);
      this.sound.play("jump");
    }
  
    hitPipe() {
      this.gameOver();
    }
  
    gameOver() {
      // Play game over sound, pause physics, and tint the bird red.
      this.sound.play("gameover");
      this.physics.pause();
      this.pipeTimer.remove();
      this.bird.setTint(0xff0000);
  
      // Update high score if needed.
      if (this.score > this.highScore) {
        this.highScore = this.score;
        localStorage.setItem("highScore", this.highScore);
        this.highScoreText.setText("High Score: " + this.highScore);
      }
  
      // Restart the game after a 2-second delay.
      this.time.delayedCall(2000, () => {
        this.scene.restart();
        this.score = 0;
      });
    }
  }
  
  // Configure the game to use the full window and auto-center the canvas.
  const config = {
    type: Phaser.AUTO,
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      width: window.innerWidth,
      height: window.innerHeight,
    },
    backgroundColor: "#70c5ce",
    physics: {
      default: "arcade",
      arcade: {
        gravity: { y: 1000 },
        debug: false,
      },
    },
    scene: [MainScene],
  };
  
  const game = new Phaser.Game(config);
  