var config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 300 },
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    },
    dom: {
        createContainer: true
    }
};

var game = new Phaser.Game(config);

function preload() {
    this.load.audio('bg_music', '../assets/sound/bgmusic.m4a');
    this.load.audio('gameover_music', '../assets/sound/gameover_music.mp3')
    this.load.image('bg_gameover', './assets/bg_gameover.png');
    this.load.image('sky', './assets/sky.png');
    this.load.image('ground', './assets/platform.png');
    this.load.image('star', './assets/diamond.png');
    this.load.image('bomb', './assets/bomb.png');
    this.load.spritesheet('dude', './assets/dude.png', { frameWidth: 32, frameHeight: 48 });
}

var platforms;
var player;
var stars;
var score = 0;
var scoreText;
var bombs;
var lives = 1;
var livesText;
var game_over_txt;
var gameover_music;
var gameOver = false;

function create() {
    this.add.image(400, 300, 'sky');

    platforms = this.physics.add.staticGroup();

    platforms.create(400, 568, 'ground').setScale(2).refreshBody();

    platforms.create(600, 400, 'ground');
    platforms.create(50, 250, 'ground');
    platforms.create(750, 220, 'ground');

    this.bg_music = this.sound.add('bg_music');
    this.bg_music.loop = true;
    this.bg_music.play();

    gameover_music = this.sound.add('gameover_music');
    gameover_music.loop = true;
    gameover_music.stop();

    player = this.physics.add.sprite(100, 450, 'dude');
    this.physics.add.collider(player, platforms);
    player.body.setGravityY(0);
    player.setBounce(0.2);
    player.setCollideWorldBounds(true);

    this.anims.create({
        key: 'left',
        frames: this.anims.generateFrameNumbers('dude', { start: 0, end: 3 }),
        frameRate: 10,
        repeat: -1
    });

    this.anims.create({
        key: 'turn',
        frames: [{ key: 'dude', frame: 4 }],
        frameRate: 20
    });

    this.anims.create({
        key: 'right',
        frames: this.anims.generateFrameNumbers('dude', { start: 5, end: 8 }),
        frameRate: 10,
        repeat: -1
    });

    stars = this.physics.add.group({
        key: 'star',
        repeat: 11,
        setXY: { x: 12, y: 0, stepX: 70 }
    });

    stars.children.iterate(function (child) {
        child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
    });

    this.physics.add.collider(stars, platforms);
    this.physics.add.overlap(player, stars, collectStar, null, this);

    scoreText = this.add.text(16, 16, 'Score: 0', { fontSize: '32px', fill: '#000' });
    bombs = this.physics.add.group();
    this.physics.add.collider(bombs, platforms);
    this.physics.add.collider(player, bombs, hitBomb, null, this);

    var startText = this.add.text(400, 565, 'Press any key to start', { fontSize: '32px', fill: '#fff' });
    this.input.keyboard.on('keydown', function () {
        startText.setVisible(false);
    });
    startText.setOrigin(0.5)

    livesText = this.add.text(16, 50, 'Lives: ' + lives, { fontSize: '32px', fill: '#000' });

    game_over_txt = this.add.text(400, 175, 'Game Over', { fontSize: '64px', fill: '#fff' }).setOrigin(0.5).setDepth(-1);
    game_over_txt.visible = false;
}

function update() {
    var cursors = this.input.keyboard.createCursorKeys();

    if (cursors.left.isDown) {
        player.setVelocityX(-300);
        player.anims.play('left', true);
    } else if (cursors.right.isDown) {
        player.setVelocityX(300);
        player.anims.play('right', true);
    } else {
        player.setVelocityX(0);
        player.anims.play('turn');
    }

    if (cursors.up.isDown && player.body.touching.down) {
        player.setVelocityY(-330);
    }
}

function collectStar(player, star) {
    star.disableBody(true, true);
    score += 10;
    scoreText.setText('Score: ' + score);

    if (stars.countActive(true) === 0) {
        stars.children.iterate(function (child) {
            child.enableBody(true, child.x, 0, true, true);
        });

        var x = (player.x < 400) ? Phaser.Math.Between(400, 800) : Phaser.Math.Between(0, 400);
        var bomb = bombs.create(x, 16, 'bomb');
        bomb.setBounce(1);
        bomb.setCollideWorldBounds(true);
        bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
    }
}

function hitBomb(player, bomb) {
    bomb.disableBody(true, true);
    lives -= 1;
    livesText.setText('Lives: ' + lives);

    if (lives === 0) {
        this.physics.pause();
        this.bg_music.stop();
        gameover_music.play();
        this.add.image(400, 300, 'bg_gameover');

        player.setPosition(400, 275);
        player.setTint(0xff0000);
        player.anims.play('turn');
        player.setDepth(1);
        game_over_txt.setDepth(1);
        game_over_txt.visible = true;
        gameOver = true;
    }
}
