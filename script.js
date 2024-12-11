const statusElement = document.getElementById('status');
const rotationsElement = document.getElementById('rotations');
const targetCranksElement = document.getElementById('targetCranks');
const gameMessageElement = document.getElementById('gameMessage');
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game state
let rotationCount = 0;
let currentFish = null;
const fisherman = { x: 375, y: 500, width: 50, height: 50 };

// Fish class
class Fish {
    constructor(x, y, size, requiredRotations) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.requiredRotations = requiredRotations;
        this.caught = false;
    }

    draw() {
        if (!this.caught) {
            ctx.fillStyle = "orange";
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.closePath();
        }
    }
}

// Spawn a fish
function spawnFish() {
    const x = Math.random() * (canvas.width - 50) + 25;
    const y = Math.random() * (canvas.height / 2) + 50;
    const size = Math.random() * 20 + 10;
    const requiredRotations = Math.floor(size / 5);
    currentFish = new Fish(x, y, size, requiredRotations);
    targetCranksElement.textContent = requiredRotations;
    gameMessageElement.textContent = `Catch the fish! Crank ${requiredRotations} times!`;
    rotationCount = 0; // Reset crank count for the new fish
    rotationsElement.textContent = rotationCount;
}

// Draw the fisherman
function drawFisherman() {
    ctx.fillStyle = "brown";
    ctx.fillRect(fisherman.x, fisherman.y, fisherman.width, fisherman.height);
    ctx.fillStyle = "black";
    ctx.fillRect(fisherman.x + 20, fisherman.y - 100, 10, 100); // fishing rod
}

// Update game logic
function updateGame() {
    if (currentFish && !currentFish.caught && rotationCount >= currentFish.requiredRotations) {
        currentFish.caught = true; // Mark the fish as caught
        currentFish = null; // Clear the current fish

        // Send a reset signal to the Arduino
        socket.send("RESET");

        // Notify the user and prepare for the next fish
        gameMessageElement.textContent = "Fish caught! Spawning a new fish...";
        setTimeout(spawnFish, 2000); // Spawn a new fish after 2 seconds
    }
}


// Render game
function renderGame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawFisherman();
    if (currentFish) {
        currentFish.draw();
    }
}

// Game loop
function gameLoop() {
    updateGame();
    renderGame();
    requestAnimationFrame(gameLoop);
}

// WebSocket setup
const socket = new WebSocket('ws://192.168.0.222/ws'); // Use your ESP32's IP

socket.onopen = () => {
    console.log('WebSocket connection opened');
    statusElement.textContent = 'Connected';
};

socket.onmessage = (event) => {
    rotationCount = parseInt(event.data, 10);
    console.log(`Rotations: ${rotationCount}`);
    rotationsElement.textContent = rotationCount;
};

socket.onclose = () => {
    console.log('WebSocket connection closed');
    statusElement.textContent = 'Disconnected';
};

socket.onerror = (error) => {
    console.error('WebSocket error:', error);
    statusElement.textContent = 'Error';
};

// Start the game loop
spawnFish();
requestAnimationFrame(gameLoop);