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

// Grid dimensions
const tileSize = 32; // Size of each tile in pixels [cite: 29]
const gridWidth = 25;  // Number of tiles horizontally (800 / 32 = 25)
const gridHeight = 18; // Number of tiles vertically (600 / 32 = 18.75, so we'll use 18)
let gridData = [];      // 2D array to store grid data

function preload () {
    this.load.setBaseURL('https://labs.phaser.io'); // Για παραδείγματα
  //  this.load.image('sky', 'assets/skies/space3.png');
   // this.load.image('grass', 'assets/grass.png'); // Placeholder grass tile
   // this.load.image('building', 'assets/building.png'); // Placeholder building tile
}

function create () {
    console.log("Η σκηνή δημιουργήθηκε!");

    // Generate grass tile
    let grassTile = this.add.graphics();
    grassTile.fillStyle(0x008000); // Green color
    grassTile.fillRect(0, 0, tileSize, tileSize);
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
}

function update () {
    // This function is called every frame
}