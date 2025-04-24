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

let gridData = []; // Τώρα θα περιέχει αντικείμενα { key: '...', image: Phaser.GameObjects.Image } ή null
let selectedBuildingType = null;
//we create html menu. This button is not needed let selectedButtonBg = null; // so we track the selected button and can remove later

// --- NEW: Consolidated Building Data ---
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
});


function preload() {
    // --- Asset Loading ---
    // Use: this.load.image(key, url);
    // Texture Generation (Uses BUILDING_DATA)
    this.load.image(BUILDING_DATA.HOUSE.textureKey, '../assets/house.png');
    this.load.image(BUILDING_DATA.FACTORY.textureKey, '../assets/factory.svg');
    this.load.image(BUILDING_DATA.PARK.textureKey, '../assets/park.svg');
    this.load.image(BUILDING_DATA.UTILITIES_DIRTY.textureKey, '../assets/Powerplant.png');
    this.load.image(BUILDING_DATA.UTILITIES_CLEAN.textureKey, '../assets/tower.svg');
    // Load Audio: for sound effects or music
    // Use: this.load.audio(key, urls); urls can be an array of different formats for browser compatibility
    // this.load.audio('placeholder_sfx', ['assets/audio/collect.mp3', 'assets/audio/collect.ogg']);
    // this.load.audio('placeholder_music', ['assets/audio/music.mp3', 'assets/audio/music.ogg']);
    console.log("Preload function finished.");
}

function create() {
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

    // House Texture (Uses key from BUILDING_DATA)
    /* let houseTile = this.add.graphics();
    houseTile.fillStyle(0xADD8E6); // Light Blue
    houseTile.fillRect(0, 0, tileSize, tileSize);
    houseTile.lineStyle(1, 0x000000, 1);
    houseTile.strokeRect(0, 0, tileSize, tileSize);
    // Use textureKey from BUILDING_DATA
    houseTile.generateTexture(BUILDING_DATA.HOUSE.textureKey, tileSize, tileSize);
    houseTile.destroy(); */

    // Factory Texture (Uses key from BUILDING_DATA)
    /* let factoryTile = this.add.graphics();
    factoryTile.fillStyle(0x808080); // Gray
    factoryTile.fillRect(0, 0, tileSize, tileSize);
    factoryTile.lineStyle(1, 0x000000, 1);
    factoryTile.strokeRect(0, 0, tileSize, tileSize);
    // Use textureKey from BUILDING_DATA
    factoryTile.generateTexture(BUILDING_DATA.FACTORY.textureKey, tileSize, tileSize);
    factoryTile.destroy(); */

    //Utility Station Texture
    /* let utilityStationTile = this.add.graphics();
    utilityStationTile.fillStyle(0x808080); // Gray
    utilityStationTile.fillRect(0, 0, tileSize, tileSize);
    utilityStationTile.lineStyle(1, 0x000000, 1);
    utilityStationTile.strokeRect(0, 0, tileSize, tileSize);
    utilityStationTile.fillRect(tileSize * 0.7, -tileSize * 0.2, tileSize * 0.2, tileSize * 0.2);
    // Use textureKey from BUILDING_DATA
    utilityStationTile.generateTexture(BUILDING_DATA.UTILITIES_DIRTY.textureKey, tileSize, tileSize);
    utilityStationTile.destroy(); */

    //Clean utility station
    /* let cleanStationTile = this.add.graphics();
    cleanStationTile.fillStyle(0x8FCE00); // yellowish
    cleanStationTile.fillRect(0, 0, tileSize, tileSize);
    cleanStationTile.lineStyle(1, 0x000000, 1);
    cleanStationTile.strokeRect(0, 0, tileSize, tileSize);
    // Use textureKey from BUILDING_DATA
    cleanStationTile.generateTexture(BUILDING_DATA.UTILITIES_CLEAN.textureKey, tileSize, tileSize);
    cleanStationTile.destroy(); */

    //Park Texture
    /* let ParkTile = this.add.graphics();
    ParkTile.fillStyle(0x6aa84f); // green
    ParkTile.fillRect(0, 0, tileSize, tileSize);
    ParkTile.lineStyle(1, 0x000000, 1);
    ParkTile.strokeRect(0, 0, tileSize, tileSize);
    // Use textureKey from BUILDING_DATA
    ParkTile.generateTexture(BUILDING_DATA.PARK.textureKey, tileSize, tileSize);
    ParkTile.destroy(); */

    // --- Object Pooling Setup ---
    // Create pools for each building type
    this.buildingPools = {}; // Object to hold pools for different building types

    for (const buildingKey in BUILDING_DATA) {
        this.buildingPools[buildingKey] = this.add.group({
            maxSize: -1, // -1 means no limit, or set a number for a fixed size pool
            runChildUpdate: false // No need to update pooled objects if they don't have update logic
        });
        // You might want to adjust the number based on how many buildings you expect
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
            const existingBuildingKey = gridData[gridX][gridY];
            const existingBuildingName = BUILDING_DATA[existingBuildingKey]?.displayName || 'Unknown Building'; // Use ?. for safety
            console.log(`Cannot place building here. Cell x: ${gridX}, y: ${gridY} is occupied by ${existingBuildingName}.`);

            //deselect a building
            if (selectedBuildingType) {
                console.log("Deselecting building type.");
                selectedBuildingType = null;
            }
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

// --- Functions ---
function gameTick() {
    tickCounter++;
    //console.log(`Game Tick ${tickCounter}`);
    recalculateStats();
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

function recalculateStats() {
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
    /* 
        // --- Έλεγχος Utilities ---
        const initialUtilities = gridWidth * gridHeight; // Η αρχική "χωρητικότητα"
        const lowThreshold = initialUtilities * 0.25;
        const criticalThreshold = initialUtilities * 0.15;
    
        if (utilities < lowThreshold) {
            utilitiesText.setColor('#ff0000'); // Κόκκινο χρώμα
            if (utilities < criticalThreshold && !lowUtilityAlertTriggered) {
                alert("CRITICAL ALERT: Utility levels are critically low!");
                lowUtilityAlertTriggered = true; // Σήμανση ότι το alert εμφανίστηκε
            }
        } else {
            utilitiesText.setColor('#ffffff'); // Επαναφορά σε λευκό
            lowUtilityAlertTriggered = false; // Επαναφορά σημαίας alert
        } */

    // --- Υπολογισμός & Ενημέρωση Ευτυχίας ---
    let unemploymentRate = (totalPopulation > 0) ? Math.max(0, (totalPopulation - totalJobs) / totalPopulation) * 100 : 0;
    // Απλός τύπος: Μείωση με βάση ανεργία και ρύπανση
    let happinessDecrease = (unemploymentRate * 0.2) + (pollutionLevel * 0.2); // Προσαρμόστε τους συντελεστές
    happiness = Math.max(0, 100 - happinessDecrease); // Clamp 0-100
    happinessText.setText(`Happiness: ${happiness.toFixed(0)}%`); // Χωρίς δεκαδικά

    // --- Έλεγχος Events ---
    checkEvents(pollutionLevel, utilities, happiness);
}

// --- Νέα Συνάρτηση για Έλεγχο Events Ρύπανσης ---
function checkEvents(currentPollution, utilities, happiness) {
    /*  // Ελέγχουμε τα όρια 25, 50, 75
     [25, 50, 75].forEach(threshold => {
         if (currentPollution >= threshold && !pollutionAlertsTriggered[threshold]) {
             alert(`WARNING: Pollution level reached ${threshold}!`);
             pollutionAlertsTriggered[threshold] = true;
         } else if (currentPollution < threshold) {
             pollutionAlertsTriggered[threshold] = false; // Επαναφορά αν πέσει κάτω από το όριο
         }
     }); */

    // Pollution event
    //const pollutionDestructionThreshold = 75;
    if (currentPollution > 75 && !highPollutionDestructionTriggered) {
        alert("WARNING: High pollution is causing buildings to be abandoned!");
        destroyRandomBuildings(30); // Κατέστρεψε % κτίρια
        // --- για να μην ξανασυμβεί αμέσως ---
        highPollutionDestructionTriggered = true;
    }

    // Utilities event
    //const utilitiesDestructionThreshold = 25;
    if (utilities < 25 && !lowUtilityAlertTriggered) {
        alert("WARNING: Low utilities is causing buildings to be abandoned!");
        destroyRandomBuildings(50, 'FACTORY'); // Κατέστρεψε % κτίρια
        // --- για να μην ξανασυμβεί αμέσως ---
        lowUtilityAlertTriggered = true;
    }

    // Happiness event
    //const happinessDestructionThreshold = 25;
    if (happiness < 25 && !lowHappinessAlertTriggered) {
        alert("WARNING: Low happiness is causing buildings to be abandoned!");
        destroyRandomBuildings(50, 'HOUSE'); // Κατέστρεψε % κτίρια
        // --- για να μην ξανασυμβεί αμέσως ---
        lowHappinessAlertTriggered = true;
    }
}

// ---  Συνάρτηση για Καταστροφή Κτιρίων ---
function destroyRandomBuildings(percentage, targetBuildingKey = null) {
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
            this.buildingPools[buildingData.key].killAndHide(buildingData.image); // Use killAndHide to deactivate and hide. Return building to the pool.
            gridData[x][y] = null; // Εκκαθάριση του κελιού στο gridData
        }

        // Αφαίρεση του κελιού από τη λίστα για να μην επιλεγεί ξανά
        potentialTargets.splice(randomIndex, 1);
    }

    // ΣΗΜΑΝΤΙΚΟ: Επαναϋπολογισμός στατιστικών ΑΜΕΣΩΣ μετά την καταστροφή
    recalculateStats();
    updateUnemploymentDisplay(); // Και η ανεργία μπορεί να άλλαξε
}