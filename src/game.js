const config = {
    type: Phaser.AUTO, // Αυτό θα επιλέξει αυτόματα WebGL ή Canvas ανάλογα με το διαθέσιμο
    width: 800, // Πλάτος του καμβά
    height: 600, // Ύψος του καμβά
    scene: {
        preload: preload,
        create: create,
        update: update
    },
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    }

};

const game = new Phaser.Game(config);

// Grid dimensions are affected by canva's size. They affect also the mouse coordinates
const tileSize = 50; // Size of each tile in pixels [cite: 29]
const gridWidth = Math.round(config.width / tileSize); // Number of tiles horizontally (800 / 32 = 25)
const gridHeight = Math.round(config.height / tileSize); // Number of tiles vertically (600 / 32 = 18.75, so we'll use 18)
console.log(gridWidth, gridHeight);
let gridData = [];      // 2D array to store grid data

function preload() {
    // this.load.setBaseURL('/'); // Για παραδείγματα
    // this.load.image('grass', 'assets/Grass.jpg'); // Placeholder grass tile
    //  this.load.image('sky', 'https://labs.phaser.io/assets/skies/space3.png');
    // this.load.image('building', 'assets/building.png'); // Placeholder building tile
}

function create() {
    console.log("Η σκηνή δημιουργήθηκε!");

    // Generate grass tile
    let grassTile = this.add.graphics();
    grassTile.fillStyle(0x008000); // Green color
    grassTile.fillRect(0, 0, tileSize, tileSize);
    grassTile.lineStyle(1, 0x000000, 1); // Border style (thickness, color, alpha)
    grassTile.strokeRect(0, 0, tileSize, tileSize); // Draw the rectangle outline
    grassTile.generateTexture('grass', tileSize, tileSize);
    grassTile.destroy(); // Destroy the graphics object after generating the texture

    // Generate building tile
    let buildingTile = this.add.graphics();
    buildingTile.fillStyle(0x808080); // Gray color
    buildingTile.fillRect(0, 0, tileSize, tileSize);
    buildingTile.generateTexture('building', tileSize, tileSize);
    buildingTile.destroy(); // Destroy the graphics object after generating the texture

    // Initialize the grid data array
    for (let x = 0; x < gridWidth; x++) {
        gridData[x] = [];
        for (let y = 0; y < gridHeight; y++) {
            gridData[x][y] = 0; // 0 represents an empty tile
        }
    }

    // Create a simple tilemap layer using placeholder tiles
    // For now, let's fill the grid with grass tiles
    for (let x = 0; x < gridWidth; x++) {
        for (let y = 0; y < gridHeight; y++) {
            this.add.image(x * tileSize + tileSize / 2, y * tileSize + tileSize / 2, 'grass');
        }
    }

    // Handle mouse clicks for building placement
    this.input.on('pointerdown', (pointer) => {
        const gridPos = getGridPosFromMouse(pointer);
        const gridX = gridPos.x;
        const gridY = gridPos.y;

        // Check if the grid cell is empty
        if (gridData[gridX][gridY] === 0) {
            // Place a building at the snapped grid position
            this.add.image(gridX * tileSize + tileSize / 2, gridY * tileSize + tileSize / 2, 'building');

            // Update grid data to mark the cell as occupied
            gridData[gridX][gridY] = 1; // 1 represents a building
            console.log(`Building placed at grid x: ${gridX}, y: ${gridY}`);
        } else {
            console.log(`Cannot place building here. Cell x: ${gridX}, y: ${gridY} is occupied.`);
        }
    });

}

function update() {
    // This function is called every frame
}

function getGridPosFromMouse(pointer) {
    const x = Math.floor(pointer.x / tileSize);
    const y = Math.floor(pointer.y / tileSize);
    return { x, y };
}