const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
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

const tileSize = 50;
const gridWidth = Math.round(config.width / tileSize);
const gridHeight = Math.round(config.height / tileSize);
console.log("Grid dimensions:", gridWidth, gridHeight);

let gridData = [];
let selectedBuildingType = null; // Will store the key like 'HOUSE' or 'FACTORY'

// --- NEW: Consolidated Building Data ---
const BUILDING_DATA = {
    HOUSE: {
        textureKey: 'building_house', // Unique texture key
        cost: 50,
        displayName: 'House'
        // Future properties like income, population effect, etc. can go here
    },
    FACTORY: {
        textureKey: 'building_factory', // Unique texture key
        cost: 150,
        displayName: 'Factory'
        // Future properties like pollution, jobs, etc. can go here
    }
    // Add more building types here later
};

// Player resources
let playerMoney = 1000;
let moneyText;
// --- Game Tick Counter (optional, for demonstration) ---
let tickCounter = 0;


function preload() {
    // No changes needed here
}

function create() {
    console.log("Scene created!");

    // --- Texture Generation (MODIFIED: Uses BUILDING_DATA) ---
    // Grass Texture (remains the same)
    let grassTile = this.add.graphics();
    grassTile.fillStyle(0x008000);
    grassTile.fillRect(0, 0, tileSize, tileSize);
    grassTile.lineStyle(1, 0x000000, 0.2);
    grassTile.strokeRect(0, 0, tileSize, tileSize);
    grassTile.generateTexture('grass', tileSize, tileSize);
    grassTile.destroy();

    // House Texture (Uses key from BUILDING_DATA)
    let houseTile = this.add.graphics();
    houseTile.fillStyle(0xADD8E6); // Light Blue
    houseTile.fillRect(0, 0, tileSize, tileSize);
    houseTile.lineStyle(1, 0x000000, 1);
    houseTile.strokeRect(0, 0, tileSize, tileSize);
    houseTile.fillStyle(0xA52A2A); // Brown roof
    houseTile.beginPath();
    houseTile.moveTo(0, 0);
    houseTile.lineTo(tileSize / 2, -tileSize / 3);
    houseTile.lineTo(tileSize, 0);
    houseTile.closePath();
    houseTile.fillPath();
    // Use textureKey from BUILDING_DATA
    houseTile.generateTexture(BUILDING_DATA.HOUSE.textureKey, tileSize, tileSize);
    houseTile.destroy();

    // Factory Texture (Uses key from BUILDING_DATA)
    let factoryTile = this.add.graphics();
    factoryTile.fillStyle(0x808080); // Gray
    factoryTile.fillRect(0, 0, tileSize, tileSize);
    factoryTile.lineStyle(1, 0x000000, 1);
    factoryTile.strokeRect(0, 0, tileSize, tileSize);
    factoryTile.fillStyle(0x404040); // Darker gray chimney
    factoryTile.fillRect(tileSize * 0.7, -tileSize * 0.2, tileSize * 0.2, tileSize * 0.2);
    // Use textureKey from BUILDING_DATA
    factoryTile.generateTexture(BUILDING_DATA.FACTORY.textureKey, tileSize, tileSize);
    factoryTile.destroy();


    // --- Grid Initialization ---
    for (let x = 0; x < gridWidth; x++) {
        gridData[x] = [];
        for (let y = 0; y < gridHeight; y++) {
            gridData[x][y] = null; // null represents an empty tile
        }
    }

    // --- Tilemap Creation ---
    for (let x = 0; x < gridWidth; x++) {
        for (let y = 0; y < gridHeight; y++) {
            this.add.image(x * tileSize + tileSize / 2, y * tileSize + tileSize / 2, 'grass');
        }
    }

    // --- HUD Elements ---
    this.add.rectangle(5, 5, 150, 30, 0x000000, 0.5).setOrigin(0);
    moneyText = this.add.text(10, 10, `Money: $${playerMoney}`, { fontSize: '16px', color: '#ffffff' });

    // --- Toolbar Creation ---
    const toolbarY = config.height - tileSize * 1.5;
    const buttonWidth = tileSize * 1.5;
    const buttonHeight = tileSize;
    const buttonSpacing = tileSize * 0.5;
    let currentButtonX = tileSize; // Starting X for buttons

    // Loop through BUILDING_DATA to create buttons dynamically
    for (const buildingKey in BUILDING_DATA) { // e.g., buildingKey = 'HOUSE', then 'FACTORY'
        const data = BUILDING_DATA[buildingKey]; // e.g., data = { textureKey: '...', cost: ..., ... }

        const buttonBg = this.add.rectangle(currentButtonX, toolbarY, buttonWidth, buttonHeight, 0xcccccc).setInteractive();
        // Use data.textureKey for the image
        this.add.image(currentButtonX, toolbarY, data.textureKey).setDisplaySize(tileSize * 0.8, tileSize * 0.8);
        // Use data.displayName and data.cost for the text
        this.add.text(currentButtonX, toolbarY + buttonHeight / 3, `${data.displayName}\n($${data.cost})`, { fontSize: '10px', color: '#000000', align: 'center' }).setOrigin(0.5);

        // Store the key ('HOUSE' or 'FACTORY') when button is clicked
        buttonBg.setData('buildingKey', buildingKey); // Store the key on the button object
        buttonBg.setData('background', buttonBg); // Store reference to itself for easy styling

        buttonBg.on('pointerdown', function () {
            selectedBuildingType = this.getData('buildingKey'); // Retrieve the key ('HOUSE' or 'FACTORY')
            console.log('Selected building type:', selectedBuildingType);

            // Reset all button backgrounds
            this.scene.children.list.forEach(child => {
                if (child.getData && child.getData('background')) {
                    child.getData('background').setFillStyle(0xcccccc);
                }
            });
            // Highlight the clicked button
            this.getData('background').setFillStyle(0xaaaaaa);
        });

        currentButtonX += buttonWidth + buttonSpacing; // Move X for the next button
    }


    // --- Grid Click Handling ---
    this.input.on('pointerdown', (pointer) => {
        // Ignore clicks on the toolbar area (simple check, needs refinement. the toolbar takes all the width)
        if (pointer.y >= toolbarY - buttonHeight / 2) {
            return;
        }

        if (!selectedBuildingType) { // selectedBuildingType is now 'HOUSE' or 'FACTORY'
            console.log("Please select a building type from the toolbar first.");
            return;
        }

        const gridPos = getGridPosFromMouse(pointer);
        const gridX = gridPos.x;
        const gridY = gridPos.y;

        if (gridX < 0 || gridX >= gridWidth || gridY < 0 || gridY >= gridHeight) {
            console.log("Cannot place building outside the grid.");
            return;
        }

        if (gridData[gridX][gridY] === null) {
            // Get data for the selected building type
            const buildingInfo = BUILDING_DATA[selectedBuildingType];
            const cost = buildingInfo.cost;

            if (playerMoney >= cost) {
                // Use textureKey from buildingInfo
                this.add.image(gridX * tileSize + tileSize / 2, gridY * tileSize + tileSize / 2, buildingInfo.textureKey);

                // Store the building key ('HOUSE' or 'FACTORY') in gridData
                gridData[gridX][gridY] = selectedBuildingType;

                playerMoney -= cost;
                moneyText.setText(`Money: $${playerMoney}`);

                console.log(`${buildingInfo.displayName} placed at grid x: ${gridX}, y: ${gridY}. Cost: $${cost}. Remaining money: $${playerMoney}`);

            } else {
                console.log(`Cannot place ${buildingInfo.displayName}. Cost: $${cost}, Money: $${playerMoney}. Insufficient funds.`);
            }
        } else {
            // Get the display name of the existing building
            const existingBuildingKey = gridData[gridX][gridY];
            const existingBuildingName = BUILDING_DATA[existingBuildingKey]?.displayName || 'Unknown Building'; // Use ?. for safety
            console.log(`Cannot place building here. Cell x: ${gridX}, y: ${gridY} is occupied by ${existingBuildingName}.`);
        }

        // --- Time Progression Setup ---
        // Create a timed event that repeats every 5 seconds (5000 milliseconds)
        this.time.addEvent({
            delay: 5000,                // milliseconds
            callback: gameTick,         // function to call
            callbackScope: this,        // scope for the callback
            loop: true                  // repeat forever
        });

        console.log("Time progression started (tick every 5 seconds).");

    });

}

function update() {
    // No changes needed here for now
}

function getGridPosFromMouse(pointer) {
    const x = Math.floor(pointer.x / tileSize);
    const y = Math.floor(pointer.y / tileSize);
    return { x, y };
}

// --- Function called by the Timer Event ---
function gameTick() {
    tickCounter++;
    console.log(`Game Tick ${tickCounter}`);

    // --- FUTURE WORK ---
    // This is where we will add logic for:
    // - Income generation (e.g., loop through gridData, find houses/factories, add money)
    // - Population changes
    // - Resource consumption/production
    // - Checking game conditions (win/lose)
    // -----------------

    // Example: Add $10 income per tick (just for testing)
    // playerMoney += 10;
    // moneyText.setText(`Money: $${playerMoney}`); // Update HUD if money changes
    // console.log("+$10 income added.");
}