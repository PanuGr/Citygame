// Define a new Scene for the Main Menu
class MainMenuScene extends Phaser.Scene {
    constructor() {
        super('MainMenuScene'); // Give this scene a unique key
    }

    preload() {
        // Load any assets specific to the Main Menu here
        // e.g., background image, button textures
        this.load.image('menu_background', './assets/background.avif');
    }

    create() {
        // Add menu background if loaded
        this.add.image(config.width / 2, config.height / 2, 'menu_background');

        // Add game title text
        this.add.text(config.width / 2, config.height / 4, 'Be the Mayor', {
            fontSize: '48px',
            color: '#ffffff'
        }).setOrigin(0.5);

        // Add 'New Game' button/text
        const newGameButton = this.add.text(config.width / 2, config.height / 2, 'New Game', {
            fontSize: '32px',
            color: '#ffffff',
            backgroundColor: '#333333',
            padding: { x: 20, y: 10 }
        }).setOrigin(0.5).setInteractive(); // Make the text interactive

        // Add 'Continue' button/text (will be enabled later)
        const saveExists = localStorage.getItem('cityBuilderSave') !== null;
        const continueButton = this.add.text(config.width / 2, config.height / 2 + 70, 'Continue', {
            fontSize: '32px',
            color: saveExists ? '#ffffff' : '#888888', // Enabled if save exists
            backgroundColor: '#333333',
            padding: { x: 20, y: 10 }
        }).setOrigin(0.5); // Not interactive yet

        // Make continue button interactive only if save exists
        if (saveExists) {
            continueButton.setInteractive();

            // Add hover effects for continue button
            continueButton.on('pointerover', () => {
                continueButton.setColor('#ffff00'); // Highlight color
            });

            continueButton.on('pointerout', () => {
                continueButton.setColor('#ffffff'); // Original color
            });

            // Add click handler for continue button
            continueButton.on('pointerdown', () => {
                console.log("Loading saved game...");
                this.scene.start('GameScene', { loadSave: true });
            });
        }

        // --- Button Interaction ---
        newGameButton.on('pointerdown', () => {
            console.log("Starting New Game...");
            // Start the main game scene
            this.scene.start('GameScene', { loadSave: false });
        });

        // You can add pointerover/pointerout effects for better UI feedback
        newGameButton.on('pointerover', () => {
            newGameButton.setColor('#ffff00'); // Highlight color
        });

        newGameButton.on('pointerout', () => {
            newGameButton.setColor('#ffffff'); // Original color
        });

    }
}

class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
    }

    init(data) {
        // Check if we should load a saved game
        this.loadSavedGame = data.loadSave === true;
    }

    preload() {
        // --- Asset Loading ---
        // Use: this.load.image(key, url);
        // Texture Generation (Uses BUILDING_DATA)
        this.load.image(BUILDING_DATA.HOUSE.textureKey, './assets/house1.avif');
        this.load.image(BUILDING_DATA.FACTORY.textureKey, './assets/factory.avif');
        this.load.image(BUILDING_DATA.PARK.textureKey, './assets/park.avif');
        this.load.image(BUILDING_DATA.UTILITIES_DIRTY.textureKey, './assets/powerplant.avif');
        this.load.image(BUILDING_DATA.UTILITIES_CLEAN.textureKey, './assets/tower.avif');
        // Load Audio: for sound effects or music
        // Use: this.load.audio(key, urls); urls can be an array of different formats for browser compatibility
        // this.load.audio('placeholder_sfx', ['assets/audio/collect.mp3', 'assets/audio/collect.ogg']);
        // this.load.audio('placeholder_music', ['assets/audio/music.mp3', 'assets/audio/music.ogg']);
        console.log("Preload function finished.");
    }

    create() {
        console.log("Scene created!");

        // --- Texture Generation (Uses BUILDING_DATA) ---
        // Grass Texture (remains the same)
        let grassTile = this.add.graphics();
        grassTile.fillStyle(0x008000);
        grassTile.fillRect(0, 0, tileSize, tileSize);
        grassTile.lineStyle(1, 0x000000, 0.2);
        grassTile.strokeRect(0, 0, tileSize, tileSize);
        grassTile.generateTexture('grass', tileSize, tileSize);
        grassTile.destroy();

        // --- Object Pooling Setup ---
        // Create pools for each building type
        this.buildingPools = {}; // Object to hold pools for different building types

        for (const buildingKey in BUILDING_DATA) {
            this.buildingPools[buildingKey] = this.add.group({
                maxSize: -1, // -1 means no limit, or set a number for a fixed size pool
                runChildUpdate: false // No need to update pooled objects if they don't have update logic
            });

            for (let i = 0; i < 10; i++) { // Example: add 10 initial instances of each building type
                const buildingImage = this.add.image(-100, -100, BUILDING_DATA[buildingKey].textureKey); // Position off-screen
                buildingImage.setActive(false); // Deactivate it
                buildingImage.setVisible(false); // Make it invisible
                buildingImage.setDisplaySize(tileSize, tileSize); // Set display size when creating for the pool

                this.buildingPools[buildingKey].add(buildingImage);
            }
            console.log(`Created pool for ${buildingKey} with ${this.buildingPools[buildingKey].getLength()} initial instances.`);
        }

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
                const grassTile = this.add.image(x * tileSize + tileSize / 2, y * tileSize + tileSize / 2, 'grass');
                // grassTile.setDisplaySize(tileSize, tileSize);
                // grassTile.setDepth(0);
            }
        }

        // --- Load saved game if needed ---
        if (this.loadSavedGame) {
            this.loadFromSave();
        }

        // --- HUD Elements ---
        //this.add.rectangle(5, 5, 150, 30, 0x000000, 0.5).setOrigin(0);
        moneyText = this.add.text(10, 10, `Money: $${playerMoney}`, { fontSize: '16px', color: '#ffffff' });
        unemploymentText = this.add.text(10, 35, `Unemployment: 0%`, { fontSize: '16px', color: '#ffffff' });
        utilitiesText = this.add.text(10, 60, `Utilities: ${utilities}`, { fontSize: '16px', color: '#ffffff' });
        pollutionText = this.add.text(10, 85, `Pollution: ${pollutionLevel}`, { fontSize: '16px', color: '#ffffff' });
        happinessText = this.add.text(10, 110, `Happiness: ${happiness}`, { fontSize: '16px', color: '#ffffff' });

        // --- Grid Click Handling ---
        this.input.on('pointerdown', (pointer) => {
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
                    // --- Get building from the pool ---
                    const buildingImage = this.buildingPools[selectedBuildingType].get(
                        gridX * tileSize + tileSize / 2,
                        gridY * tileSize + tileSize / 2,
                        buildingInfo.textureKey // Texture key is needed for the group's get method
                    );

                    if (buildingImage) { // Check if an object was successfully retrieved from the pool
                        buildingImage.setDisplaySize(tileSize, tileSize); // Set display size when placing on the map
                        buildingImage.setActive(true); // Activate it
                        buildingImage.setVisible(true); // Make it visible
                        buildingImage.setDepth(1); // Set a depth higher than the grass tiles (which have default depth 0)

                        gridData[gridX][gridY] = {
                            key: selectedBuildingType,
                            image: buildingImage
                        };
                        playerMoney -= cost;
                        moneyText.setText(`Money: $${playerMoney}`);
                        console.log(`${buildingInfo.displayName} placed at grid x: ${gridX}, y: ${gridY}. Cost: $${cost}. Remaining money: $${playerMoney}`);
                    } else {
                        console.log(`Could not get a ${buildingInfo.displayName} from the pool.`);
                        // This might happen if maxSize is set and the pool is full
                    }
                } else {
                    console.log(`Cannot place ${buildingInfo.displayName}. Cost: $${cost}, Money: $${playerMoney}. Insufficient funds.`);
                }
            } else {
                // Get the display name of the existing building
                const existingBuildingKey = gridData[gridX][gridY].key;
                const existingBuildingName = BUILDING_DATA[existingBuildingKey]?.displayName || 'Unknown Building'; // Use ?. for safety
                console.log(`Cannot place building here. Cell x: ${gridX}, y: ${gridY} is occupied by ${existingBuildingName}.`);

                //deselect a building
                if (selectedBuildingType) {
                    console.log("Deselecting building type.");
                    selectedBuildingType = null;
                }
            }
        });

        // --- Time Progression Setup ---
        // Create a timed event that repeats every 5 seconds (5000 milliseconds)
        this.timeEvent = this.time.addEvent({
            delay: 5000,                // milliseconds
            callback: () => { gameTick.call(this); }, // Use function with correct 'this' context
            callbackScope: this,        // scope for the callback
            loop: true                  // repeat forever
        });
/* 
the game can be saved from the button on the menu
        // Add a save button to the scene
        const saveGameButton = this.add.text(config.width - 100, config.height - 50, 'Save Game', {
            fontSize: '18px',
            color: '#ffffff',
            backgroundColor: '#333333',
            padding: { x: 10, y: 5 }
        }).setOrigin(0.5).setInteractive();

        // Save button interactions
        saveGameButton.on('pointerover', () => {
            saveGameButton.setColor('#ffff00');
        });

        saveGameButton.on('pointerout', () => {
            saveGameButton.setColor('#ffffff');
        });

        saveGameButton.on('pointerdown', () => {
            this.saveGameState();
        });
 */
        console.log("Time progression started (tick every 5 seconds).");
    }

    // Function to save the current game state
    saveGameState() {
        // Gather all the important game state variables
        const gameState = {
            playerMoney: playerMoney,
            gridData: gridData.map(row =>
                row.map(cell => {
                    if (cell && cell.key) {
                        return { key: cell.key }; // Save only the building key
                    }
                    return null; // Cell is empty
                })
            ),
            totalPopulation: totalPopulation,
            totalJobs: totalJobs,
            utilities: utilities,
            pollutionLevel: pollutionLevel,
            happiness: happiness,
            tickCounter: tickCounter
        };

        try {
            // Convert the game state object to a JSON string
            const saveString = JSON.stringify(gameState);

            // Save the string to Local Storage
            localStorage.setItem('cityBuilderSave', saveString);
            
            // Visual feedback for save
            const saveNotice = this.add.text(config.width / 2, config.height / 2, 'Game Saved!', {
                fontSize: '32px',
                color: '#ffffff',
                backgroundColor: '#008800',
                padding: { x: 20, y: 10 }
            }).setOrigin(0.5);
            
            // Make the notice fade out after 2 seconds
            this.tweens.add({
                targets: saveNotice,
                alpha: 0,
                duration: 2000,
                ease: 'Power2',
                onComplete: () => {
                    saveNotice.destroy();
                }
            });
            
            console.log("Game saved successfully!");

        } catch (e) {
            console.error("Could not save game:", e);
            
            // Error feedback
            const errorNotice = this.add.text(config.width / 2, config.height / 2, 'Save Failed!', {
                fontSize: '32px',
                color: '#ffffff',
                backgroundColor: '#880000',
                padding: { x: 20, y: 10 }
            }).setOrigin(0.5);
            
            // Make the notice fade out after 2 seconds
            this.tweens.add({
                targets: errorNotice,
                alpha: 0,
                duration: 2000,
                ease: 'Power2',
                onComplete: () => {
                    errorNotice.destroy();
                }
            });
        }
    }

    // Function to load a saved game
    loadFromSave() {
        try {
            // Get the saved string from Local Storage
            const saveString = localStorage.getItem('cityBuilderSave');

            if (saveString) {
                // Parse the JSON string back into an object
                const gameState = JSON.parse(saveString);
                
                // Restore game state
                playerMoney = gameState.playerMoney;
                totalPopulation = gameState.totalPopulation;
                totalJobs = gameState.totalJobs;
                utilities = gameState.utilities;
                pollutionLevel = gameState.pollutionLevel;
                happiness = gameState.happiness;
                tickCounter = gameState.tickCounter;
                
                // Restore grid data and recreate buildings
                for (let x = 0; x < gridWidth; x++) {
                    for (let y = 0; y < gridHeight; y++) {
                        const cellData = gameState.gridData[x][y];
                        
                        if (cellData && cellData.key) {
                            const buildingKey = cellData.key;
                            const buildingInfo = BUILDING_DATA[buildingKey];
                            
                            // Get a building from the appropriate pool
                            const buildingImage = this.buildingPools[buildingKey].get(
                                x * tileSize + tileSize / 2,
                                y * tileSize + tileSize / 2,
                                buildingInfo.textureKey
                            );
                            
                            if (buildingImage) {
                                buildingImage.setDisplaySize(tileSize, tileSize);
                                buildingImage.setActive(true);
                                buildingImage.setVisible(true);
                                buildingImage.setDepth(1);
                                
                                // Update the grid data with the building
                                gridData[x][y] = {
                                    key: buildingKey,
                                    image: buildingImage
                                };
                            }
                        }
                    }
                }
                
                // Visual feedback for successful load
                const loadNotice = this.add.text(config.width / 2, config.height / 2, 'Game Loaded!', {
                    fontSize: '32px',
                    color: '#ffffff',
                    backgroundColor: '#008800',
                    padding: { x: 20, y: 10 }
                }).setOrigin(0.5);
                
                // Make the notice fade out after 2 seconds
                this.tweens.add({
                    targets: loadNotice,
                    alpha: 0,
                    duration: 2000,
                    ease: 'Power2',
                    onComplete: () => {
                        loadNotice.destroy();
                    }
                });
                
                console.log("Game loaded successfully!");
            } else {
                console.log("No saved game found.");
            }
        } catch (e) {
            console.error("Could not load game:", e);
            
            // Error feedback
            const errorNotice = this.add.text(config.width / 2, config.height / 2, 'Load Failed!', {
                fontSize: '32px',
                color: '#ffffff',
                backgroundColor: '#880000',
                padding: { x: 20, y: 10 }
            }).setOrigin(0.5);
            
            // Make the notice fade out after 2 seconds
            this.tweens.add({
                targets: errorNotice,
                alpha: 0,
                duration: 2000,
                ease: 'Power2',
                onComplete: () => {
                    errorNotice.destroy();
                }
            });
        }
    }

    update() {
        // No changes needed here for now
    }
}



const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    scene: [
        MainMenuScene, // Add your new Main Menu scene first
        GameScene // Add your existing game scene here
    ],
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
let selectedBuildingType = null;

// --- Consolidated Building Data ---
const BUILDING_DATA = {
    HOUSE: {
        textureKey: 'building_house', // Unique texture key
        displayName: 'House',
        cost: 0,
        population: 2,
        lvl1: {
            utilitiesNeed: 2,
            pollution: 2
        },
        lvl2: {
            utilitiesNeed: 1,
            pollution: 1
        },
        // Future properties like income, population effect, etc. can go here
    },
    FACTORY: {
        textureKey: 'building_factory', // Unique texture key
        displayName: 'Factory',
        cost: 0,
        lvl1: {
            workersNeed: 4,
            utilitiesNeed: 4,
            pollution: 4
        },
        lvl2: {
            workers: 2,
            utilitiesNeed: 2,
            pollution: 2
        }
        // Future properties like pollution, jobs, etc. can go here
    },
    UTILITIES_DIRTY: {
        textureKey: 'utility_station',
        displayName: 'Utilities Station',
        cost: 200,
        workersNeed: 1,
        utilitiesProvide: (gridWidth * gridHeight) / 2,
        pollution: 4
    },
    UTILITIES_CLEAN: {
        textureKey: 'clean_station',
        displayName: 'Green Station',
        cost: 400,
        workersNeed: 0,
        utilitiesProvide: (gridWidth * gridHeight) / 2,
        pollution: 1
    },
    PARK: {
        textureKey: 'park',
        displayName: 'Park',
        cost: 0,
        workersNeed: 1,
        utilitiesNeed: 1,
        pollution: -10
    }
    // Add more building types here later
};

// Player resources
let playerMoney = 1000;
let totalPopulation = 0;
let totalJobs = 0;
let utilities = gridWidth * gridHeight;
let pollutionLevel = 0;
let happiness = 100;
// HUD TEXTS
let moneyText;
let unemploymentText;
let utilitiesText;
let pollutionText;
let happinessText;
// --- Game Tick Counter (optional, for demonstration) ---
let tickCounter = 0;

// HTML DROPDOWN MENU
// Function για να γεμίσει το dropdown με τα κτίρια
function populateBuildingDropdown() {
    const selectElement = document.getElementById('building-select');
    if (!selectElement) {
        console.error("Dropdown element '#building-select' not found!");
        return;
    }

    // Προσθήκη επιλογών από το BUILDING_DATA
    for (const buildingKey in BUILDING_DATA) {
        const data = BUILDING_DATA[buildingKey];
        const option = document.createElement('option');
        option.value = buildingKey; // π.χ., 'HOUSE', 'FACTORY'
        // Εμφάνιση ονόματος και κόστους (αν υπάρχει)
        option.textContent = `${data.displayName}${data.cost > 0 ? ` ($${data.cost})` : ''}`;
        selectElement.appendChild(option);
    }
}

// Συνάρτηση που καλείται όταν αλλάζει η επιλογή στο dropdown
function handleBuildingSelectionChange(event) {
    const selectedValue = event.target.value;
    if (selectedValue === "") {
        // Αν επιλεγεί η κενή επιλογή "-- Select Building --"
        selectedBuildingType = null;
        console.log("Building deselected.");
    } else {
        selectedBuildingType = selectedValue; // Ενημέρωση της καθολικής μεταβλητής που χρησιμοποιεί το Phaser
        console.log("Selected building type (from dropdown):", selectedBuildingType);
    }
    // Δεν χρειάζεται να αλλάξουμε χρώμα κουμπιού κλπ.
}

// Εκτέλεση όταν το HTML DOM είναι έτοιμο
document.addEventListener('DOMContentLoaded', () => {
    populateBuildingDropdown(); // Γέμισμα του dropdown

    // Προσθήκη event listener για αλλαγές στο dropdown
    const selectElement = document.getElementById('building-select');
    if (selectElement) {
        selectElement.addEventListener('change', handleBuildingSelectionChange);
    }
    // Add event listeners for the save/load/delete buttons from saveFunctions.js
    const saveButton = document.querySelector('button[type="submit"]');
    const deleteSaveButton = document.querySelector('button[type="reset"]');
    
    if (saveButton) {
        saveButton.addEventListener('click', () => {
            const currentGameScene = game.scene.getScene('GameScene');
            if (currentGameScene && currentGameScene.scene.isActive()) {
                currentGameScene.saveGameState();
            } else {
                console.warn("Cannot save: GameScene is not active.");
            }
        });
    }
    
    if (deleteSaveButton) {
        deleteSaveButton.addEventListener('click', () => {
            localStorage.removeItem('cityBuilderSave');
            console.log("Save data cleared.");
            alert("Save data cleared.");
            /* 
            // Provide visual feedback
            const notice = document.createElement('div');
            notice.textContent = 'Save data cleared';
            notice.style.position = 'fixed';
            notice.style.top = '50%';
            notice.style.left = '50%';
            notice.style.transform = 'translate(-50%, -50%)';
            notice.style.backgroundColor = '#880000';
            notice.style.color = 'white';
            notice.style.padding = '10px 20px';
            notice.style.borderRadius = '5px';
            notice.style.zIndex = '1000';
            
            document.body.appendChild(notice);
            
            setTimeout(() => {
                document.body.removeChild(notice);
            }, 2000);
             */
        });
    }
});

// --- Functions ---
function getGridPosFromMouse(pointer) {
    const x = Math.floor(pointer.x / tileSize);
    const y = Math.floor(pointer.y / tileSize);
    return { x, y };
}

function gameTick() {
    tickCounter++;
    //console.log(`Game Tick ${tickCounter}`);
    recalculateStats(this);
    updateUnemploymentDisplay();
}

function updateUnemploymentDisplay() {
    let unemploymentRate = 0;
    if (totalPopulation > 0) {
        // Χρησιμοποιούμε Math.max(0, ...) για να μην έχουμε αρνητική ανεργία αν οι θέσεις είναι περισσότερες από τον πληθυσμό
        unemploymentRate = Math.max(0, (totalPopulation - totalJobs) / totalPopulation) * 100;
    }
    unemploymentText.setText(`Unemployment: ${unemploymentRate.toFixed(1)}%`);
    console.log(`Stats updated: ${totalPopulation},${totalJobs}, Unemployment=${unemploymentRate.toFixed(1)}%`);
}

// let pollutionAlertsTriggered = { 25: false, 50: false, 75: false }; // Για να στέλνουμε alert μία φορά
// Για alerts
let lowUtilityAlertTriggered = false;
let lowHappinessAlertTriggered = false;
let highPollutionDestructionTriggered = false;

function recalculateStats(scene) {
    let currentTotalPopulation = 0;
    let currentTotalJobs = 0;
    let currentUtilitiesSupply = gridWidth * gridHeight; // Base utility supply
    let currentUtilitiesDemand = 0;
    let currentPollutionLevel = 0;

    console.log("Initial Supply:", currentUtilitiesSupply, "Demand:", currentUtilitiesDemand);

    for (let x = 0; x < gridWidth; x++) {
        for (let y = 0; y < gridHeight; y++) {
            const gridCell = gridData[x][y];
            if (gridCell && gridCell.key) { // Έλεγχος αν υπάρχει κτίριο στο κελί
                const buildingKey = gridCell.key;
                const buildingInfo = BUILDING_DATA[buildingKey];

                if (buildingInfo) {
                    // Πληθυσμός
                    if (buildingInfo.population) {
                        currentTotalPopulation += buildingInfo.population;
                    }

                    // Θέσεις Εργασίας (χρησιμοποιούμε lvl1 ή τη βασική ιδιότητα)
                    if (buildingInfo.workersNeed) {
                        currentTotalJobs += buildingInfo.workersNeed;
                    } else if (buildingInfo.lvl1 && buildingInfo.lvl1.workersNeed) {
                        currentTotalJobs += buildingInfo.lvl1.workersNeed;
                    }

                    // Υπηρεσίες (Παροχή & Ζήτηση)
                    if (buildingInfo.utilitiesProvide) {
                        currentUtilitiesSupply += buildingInfo.utilitiesProvide;
                    }

                    let demand = 0;
                    if (buildingInfo.lvl1 && buildingInfo.lvl1.utilitiesNeed) {
                        demand = buildingInfo.lvl1.utilitiesNeed;
                    } else if (buildingInfo.utilitiesNeed) { // Για κτίρια χωρίς επίπεδα
                        demand = buildingInfo.utilitiesNeed;
                    }
                    currentUtilitiesDemand += demand;

                    // Ρύπανση (χρησιμοποιούμε lvl1 ή τη βασική ιδιότητα)
                    if (buildingInfo.pollution) {
                        currentPollutionLevel += buildingInfo.pollution;
                    } else if (buildingInfo.lvl1 && buildingInfo.lvl1.pollution) {
                        currentPollutionLevel += buildingInfo.lvl1.pollution;
                    }
                }
                console.log(`Building ${gridCell.key} at [${x},${y}] adds supply: ${buildingInfo.utilitiesProvide || 0}, demand: ${currentUtilitiesDemand || 0}`);
            }
        }
    }

    console.log("After Loop - Supply:", currentUtilitiesSupply, "Demand:", currentUtilitiesDemand);

    // Ενημέρωση καθολικών μεταβλητών
    totalPopulation = currentTotalPopulation;
    totalJobs = currentTotalJobs;
    utilities = currentUtilitiesSupply - currentUtilitiesDemand; // Υπολογισμός ισοζυγίου
    console.log("Calculated Balance (utilities):", utilities);

    pollutionLevel = currentPollutionLevel;

    // Ενημέρωση HUD (εκτός ανεργίας που έχει τη δική της συνάρτηση)
    utilitiesText.setText(`Utilities: ${utilities}`);
    pollutionText.setText(`Pollution: ${pollutionLevel}`);

    // --- Υπολογισμός & Ενημέρωση Ευτυχίας ---
    let unemploymentRate = (totalPopulation > 0) ? Math.max(0, (totalPopulation - totalJobs) / totalPopulation) * 100 : 0;
    // Απλός τύπος: Μείωση με βάση ανεργία και ρύπανση
    let happinessDecrease = (unemploymentRate * 0.2) + (pollutionLevel * 0.2); // Προσαρμόστε τους συντελεστές
    happiness = Math.max(0, 100 - happinessDecrease); // Clamp 0-100
    happinessText.setText(`Happiness: ${happiness.toFixed(0)}%`); // Χωρίς δεκαδικά

    // --- Έλεγχος Events ---
    checkEvents(pollutionLevel, utilities, happiness, scene);
}

// --- Νέα Συνάρτηση για Έλεγχο Events Ρύπανσης ---
function checkEvents(currentPollution, utilities, happiness, scene) {
    // Pollution event
    //const pollutionDestructionThreshold = 75;
    if (currentPollution > 75 && !highPollutionDestructionTriggered) {
        alert("WARNING: High pollution is causing buildings to be abandoned!");
        destroyRandomBuildings(30, null, scene); // Κατέστρεψε % κτίρια
        // --- για να μην ξανασυμβεί αμέσως ---
        highPollutionDestructionTriggered = true;
    }

    // Utilities event
    //const utilitiesDestructionThreshold = 25;
    if (utilities < 25 && !lowUtilityAlertTriggered) {
        alert("WARNING: Low utilities is causing buildings to be abandoned!");
        destroyRandomBuildings(50, 'FACTORY', scene); // Κατέστρεψε % κτίρια
        // --- για να μην ξανασυμβεί αμέσως ---
        lowUtilityAlertTriggered = true;
    }

    // Happiness event
    //const happinessDestructionThreshold = 25;
    if (happiness < 25 && !lowHappinessAlertTriggered) {
        alert("WARNING: Low happiness is causing buildings to be abandoned!");
        destroyRandomBuildings(50, 'HOUSE',scene); // Κατέστρεψε % κτίρια
        // --- για να μην ξανασυμβεί αμέσως ---
        lowHappinessAlertTriggered = true;
    }
}

// ---  Συνάρτηση για Καταστροφή Κτιρίων ---
function destroyRandomBuildings(percentage, targetBuildingKey = null, scene) {
    let potentialTargets = [];
    for (let x = 0; x < gridWidth; x++) {
        for (let y = 0; y < gridHeight; y++) {
            const gridCell = gridData[x][y];
            if (gridCell && gridCell.key && (targetBuildingKey === null || gridCell.key === targetBuildingKey)) {
                potentialTargets.push({ x, y });
            }
        }
    }

    if (potentialTargets.length === 0) return; // Δεν υπάρχουν κτίρια για καταστροφή
    const buildingsToDestroy = Math.floor(potentialTargets.length * (percentage / 100));

    for (let i = 0; i < buildingsToDestroy && potentialTargets.length > 0; i++) {
        // Επιλογή τυχαίου κατειλημμένου κελιού
        const randomIndex = Math.floor(Math.random() * potentialTargets.length);
        const cellToRemove = potentialTargets[randomIndex];
        const { x, y } = cellToRemove;

        const buildingData = gridData[x][y];
        if (buildingData && buildingData.image) {
            console.log(`Destroying building due to pollution.`);
            scene.buildingPools[buildingData.key].killAndHide(buildingData.image); // Use killAndHide to deactivate and hide. Return building to the pool.
            gridData[x][y] = null; // Εκκαθάριση του κελιού στο gridData
        }

        // Αφαίρεση του κελιού από τη λίστα για να μην επιλεγεί ξανά
        potentialTargets.splice(randomIndex, 1);
    }

    // ΣΗΜΑΝΤΙΚΟ: Επαναϋπολογισμός στατιστικών ΑΜΕΣΩΣ μετά την καταστροφή
    recalculateStats();
    updateUnemploymentDisplay(); // Και η ανεργία μπορεί να άλλαξε
}

