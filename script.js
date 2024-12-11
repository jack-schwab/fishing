const statusElement = document.getElementById('status');
const rotationsElement = document.getElementById('rotations');
const targetCranksElement = document.getElementById('targetCranks');
const gameMessageElement = document.getElementById('gameMessage');

let rotationCount = 0;
let targetCranks = 10;
let fishCaught = false;
let fish;

// Phaser game configuration
const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: 'phaser-game',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

const game = new Phaser.Game(config);

function preload() {
    // No external assets needed for drawing graphics
}

function create() {
    const graphics = this.add.graphics();

    // Draw water (background)
    graphics.fillStyle(0x1e90ff, 1); // Blue color
    graphics.fillRect(0, 0, 800, 600);

    // Draw dock
    graphics.fillStyle(0x8b4513, 1); // Brown color
    graphics.fillRect(300, 500, 200, 50); // Dock base
    graphics.fillRect(370, 550, 60, 50); // Dock support

    // Draw fisherman
    this.add.rectangle(400, 460, 40, 80, 0xffd700); // Yellow body
    this.add.circle(400, 420, 20, 0xffdab9); // Head

    // Draw fish
    fish = this.add.ellipse(
        Phaser.Math.Between(100, 700),
        Phaser.Math.Between(200, 400),
        80,
        40,
        0x4682b4
    );
    fish.setInteractive();

    // Text for cranks
    this.add.text(20, 20, `Target Cranks: ${targetCranks}`, {
        font: '20px Arial',
        fill: '#FFFFFF'
    });

    // Listen for WebSocket messages
    const socket = new WebSocket('ws://192.168.0.222/ws');

    socket.onopen = () => {
        statusElement.textContent = 'Connected';
    };

    socket.onmessage = (event) => {
        rotationCount = parseInt(event.data, 10);
        rotationsElement.textContent = rotationCount;

        if (!fishCaught && rotationCount >= targetCranks) {
            fishCaught = true;
            socket.send("RESET");
            gameMessageElement.textContent = "Fish caught! Spawning a new fish...";

            // Reset fish and cranks after delay
            this.time.delayedCall(2000, () => {
                spawnFish(this);
            });
        }
    };

    socket.onclose = () => {
        statusElement.textContent = 'Disconnected';
    };

    socket.onerror = (error) => {
        statusElement.textContent = 'Error';
    };

    // Initial fish spawn
    spawnFish(this);
}

function spawnFish(scene) {
    fishCaught = false;
    targetCranks = Math.floor(Math.random() * 20) + 5;
    rotationCount = 0;
    targetCranksElement.textContent = targetCranks;
    rotationsElement.textContent = rotationCount;
    fish.setPosition(Phaser.Math.Between(100, 700), Phaser.Math.Between(200, 400));
    fish.setFillStyle(0x4682b4); // Reset fish color
}

function update() {
    if (fishCaught) {
        fish.setFillStyle(0xff0000); // Change fish color when caught
    } else {
        fish.setFillStyle(0x4682b4);
    }
}
