//tworzenie nowej sceny
let gameScene = new Phaser.Scene('Game');

//inicjalizacja parametrow
gameScene.init = function() {
    //predkosc gracza
    this.playerSpeed = 3;
    
    //predkosc przeciwnikow
    this.enemyMinSpeed = 1.2;
    this.enemyMaxSpeed = 4;
    
    //granice
    this.enemyMinY = 80;
    this.enemyMaxY = 280;
    
    this.isTerminating = false;
    
}

//ladowanie assetow
gameScene.preload = function() {
    this.load.image('background', 'assets/background.png');
    this.load.image('player', 'assets/dog.png');
    this.load.image('enemy', 'assets/cat.png');
    this.load.image('goal', 'assets/treasure.png');
};

//wywolywanie assetow

gameScene.create = function() {

    let bg = this.add.sprite(0, 0, 'background');
    
    bg.setPosition(320, 180);
    bg.depth = 0;
    
    this.player = this.add.sprite(30, 180, 'player');
    this.player.depth = 1;
    
    this.goal = this.add.sprite(this.sys.game.config.width - 80, this.sys.game.config.height / 2, 'goal');
    this.goal.setScale(0.5);
    
    this.enemies = this.add.group({
        key: 'enemy',
        repeat: 4,
        setXY: {
            x: 110,
            y: 100,
            stepX: 95,
            stepY: 20
        }
    });
    
    Phaser.Actions.ScaleXY(this.enemies.getChildren(), 0.2, 0.2);
    
    //set flipX and speed
    Phaser.Actions.Call(this.enemies.getChildren(), function(enemy){
        //flip enemy
        enemy.flipX = true;
        //set enemy speed
        let dir = Math.random() < 0.5 ? 1 : -1;
        let speed = this.enemyMinSpeed + Math.random() * (this.enemyMaxSpeed - this.enemyMinSpeed);
        enemy.speed = dir * speed;
    }, this);
    
    console.log(this.enemies.getChildren());
    
    
};

gameScene.update = function() {
    
    if(this.isTerminating) return;
    
    if(this.input.activePointer.isDown) {

        this.player.x += this.playerSpeed;
    }
    
    let playerRect = this.player.getBounds();
    let treasureRect = this.goal.getBounds();
    
    if(Phaser.Geom.Intersects.RectangleToRectangle(playerRect, treasureRect)){
        
        console.log('Well Done!');
        
        this.scene.restart();
        return;
    }
    
    let enemies = this.enemies.getChildren();
    let numEnemies = enemies.length;
    
    for(let i = 0; i< numEnemies; i++){

        enemies[i].y += enemies[i].speed;
    
        let conditionUp = enemies[i].speed < 0 && enemies[i].y <= this.enemyMinY;
        let conditionDown = enemies[i].speed > 0 && enemies[i].y >= this.enemyMaxY;
    
        if(conditionUp || conditionDown) {
            enemies[i].speed *= -1;
        }
        
        let enemyRect = enemies[i].getBounds();
    
        if(Phaser.Geom.Intersects.RectangleToRectangle(playerRect, enemyRect)){
            
            console.log('Game Over!');
            return this.gameOver();
        }
    }
    
    
    
};

//game over z efektami kamery
gameScene.gameOver = function() {
    
    this.isTerminating = true;

    this.cameras.main.shake(500);
    
    this.cameras.main.on('camerashakecomplete', function(camera, effect){
        
        this.cameras.main.fade(500);
        
    }, this);
    
    this.cameras.main.on('camerafadeoutcomplete', function(camera, effect){
        this.scene.restart();
    }, this);    
};

//konfiguracja Phaser'a
let config = {
    type: Phaser.AUTO,
    width: 640,
    height: 360,
    scene: gameScene
};

//tworzenie gry na bazie config

let game = new Phaser.Game(config);