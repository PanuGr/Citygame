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
const tileSize = 50; // Size of each tile in pixels 
const gridWidth = Math.round(config.width / tileSize); // Number of tiles horizontally (800 / 50 = 16)
const gridHeight = Math.round(config.height / tileSize); // Number of tiles vertically (600 / 50 = 12)
console.log("Grid dimensions:", gridWidth, gridHeight);
let gridData = [];      // 2D array to store grid data
let selectedBuildingType = null; // ΝΕΟ: Μεταβλητή για τον τρέχοντα επιλεγμένο τύπο κτιρίου

// ΝΕΟ: Ορισμός τύπων κτιρίων
const BuildingTypes = {
    HOUSE: 'house',
    FACTORY: 'factory'
};

function preload() {
    // this.load.setBaseURL('/'); // Για παραδείγματα
    // this.load.image('grass', 'assets/Grass.jpg'); // Placeholder grass tile
    //  this.load.image('sky', 'https://labs.phaser.io/assets/skies/space3.png');
    // this.load.image('building', 'assets/building.png'); // Placeholder building tile
}

function create() {
    console.log("Η σκηνή δημιουργήθηκε!");

    // --- Δημιουργία Υφών (Textures) ---

    // Υφή Γρασιδιού (Grass Texture)
    let grassTile = this.add.graphics();
    grassTile.fillStyle(0x008000); // Green color
    grassTile.fillRect(0, 0, tileSize, tileSize);
    grassTile.lineStyle(1, 0x000000, 0.2); // Border style (thickness, color, alpha)
    grassTile.strokeRect(0, 0, tileSize, tileSize); // Draw the rectangle outline
    grassTile.generateTexture('grass', tileSize, tileSize);
    grassTile.destroy();

    // ΝΕΟ: Υφή Σπιτιού (House Texture)
    let houseTile = this.add.graphics();
    houseTile.fillStyle(0xADD8E6); // Light Blue color for house
    houseTile.fillRect(0, 0, tileSize, tileSize);
    houseTile.lineStyle(1, 0x000000, 1);
    houseTile.strokeRect(0, 0, tileSize, tileSize);
    // Μικρό τρίγωνο για στέγη
    houseTile.fillStyle(0xA52A2A); // Brown color for roof
    houseTile.beginPath();
    houseTile.moveTo(0, 0);
    houseTile.lineTo(tileSize / 2, -tileSize / 3); // Προσθήκη μικρής οροφής
    houseTile.lineTo(tileSize, 0);
    houseTile.closePath();
    houseTile.fillPath();
    houseTile.generateTexture(BuildingTypes.HOUSE, tileSize, tileSize);
    houseTile.destroy();

    // ΝΕΟ: Υφή Εργοστασίου (Factory Texture)
    let factoryTile = this.add.graphics();
    factoryTile.fillStyle(0x808080); // Gray color for factory
    factoryTile.fillRect(0, 0, tileSize, tileSize);
    factoryTile.lineStyle(1, 0x000000, 1);
    factoryTile.strokeRect(0, 0, tileSize, tileSize);
    // Μικρό ορθογώνιο για καμινάδα
    factoryTile.fillStyle(0x404040); // Darker gray
    factoryTile.fillRect(tileSize * 0.7, -tileSize * 0.2, tileSize * 0.2, tileSize * 0.2);
    factoryTile.generateTexture(BuildingTypes.FACTORY, tileSize, tileSize);
    factoryTile.destroy();

    // --- (Grid Initialization) ---
    for (let x = 0; x < gridWidth; x++) {
        gridData[x] = [];
        for (let y = 0; y < gridHeight; y++) {
            gridData[x][y] = null; // null represents an empty tile
        }
    }

    // --- (Tilemap Creation) ---
    for (let x = 0; x < gridWidth; x++) {
        for (let y = 0; y < gridHeight; y++) {
            this.add.image(x * tileSize + tileSize / 2, y * tileSize + tileSize / 2, 'grass');
        }
    }

    // --- ΝΕΟ: Δημιουργία Γραμμής Εργαλείων (Toolbar Creation) ---
    const toolbarY = config.height - tileSize * 1.5; // Θέση Υ της γραμμής εργαλείων
    const buttonWidth = tileSize * 1.5;
    const buttonHeight = tileSize;
    const buttonSpacing = tileSize * 0.5;

    // Δημιουργία κουμπιού για το Σπίτι
    const houseButtonBg = this.add.rectangle(tileSize, toolbarY, buttonWidth, buttonHeight, 0xcccccc).setInteractive();
    this.add.image(tileSize, toolbarY, BuildingTypes.HOUSE).setDisplaySize(tileSize * 0.8, tileSize * 0.8); // Εμφάνιση μικρότερης εικόνας στο κουμπί
    this.add.text(tileSize, toolbarY + buttonHeight / 2.5, 'House', { fontSize: '12px', color: '#000000' }).setOrigin(0.5);

    houseButtonBg.on('pointerdown', () => { // [cite: 19]
        selectedBuildingType = BuildingTypes.HOUSE; // [cite: 20]
        console.log('Selected building type:', selectedBuildingType);
        // Προαιρετικά: Προσθήκη οπτικής ένδειξης επιλογής
        houseButtonBg.setFillStyle(0xaaaaaa);
        factoryButtonBg.setFillStyle(0xcccccc);
    });

    // Δημιουργία κουμπιού για το Εργοστάσιο
    const factoryButtonX = tileSize + buttonWidth + buttonSpacing;
    const factoryButtonBg = this.add.rectangle(factoryButtonX, toolbarY, buttonWidth, buttonHeight, 0xcccccc).setInteractive();
    this.add.image(factoryButtonX, toolbarY, BuildingTypes.FACTORY).setDisplaySize(tileSize * 0.8, tileSize * 0.8);
    this.add.text(factoryButtonX, toolbarY + buttonHeight / 2.5, 'Factory', { fontSize: '12px', color: '#000000' }).setOrigin(0.5);

    factoryButtonBg.on('pointerdown', () => { // [cite: 19]
        selectedBuildingType = BuildingTypes.FACTORY; // [cite: 20]
        console.log('Selected building type:', selectedBuildingType);
        // Προαιρετικά: Προσθήκη οπτικής ένδειξης επιλογής
        factoryButtonBg.setFillStyle(0xaaaaaa);
        houseButtonBg.setFillStyle(0xcccccc);
    });


    // --- Χειρισμός Κλικ στο Πλέγμα (Grid Click Handling) ---
    this.input.on('pointerdown', (pointer) => {
        // Αγνοούμε τα κλικ πάνω στη γραμμή εργαλείων
        if (pointer.y >= toolbarY - buttonHeight / 2) {
            return;
        }

        // Έλεγχος αν έχει επιλεγεί κάποιος τύπος κτιρίου
        if (!selectedBuildingType) {
            console.log("Please select a building type from the toolbar first.");
            return;
        }

        const gridPos = getGridPosFromMouse(pointer);
        const gridX = gridPos.x;
        const gridY = gridPos.y;

        // Έλεγχος ορίων πλέγματος
        if (gridX < 0 || gridX >= gridWidth || gridY < 0 || gridY >= gridHeight) {
            console.log("Cannot place building outside the grid.");
            return;
        }


        // Έλεγχος αν το κελί του πλέγματος είναι άδειο [cite: 13]
        if (gridData[gridX][gridY] === null) {
            // Τοποθέτηση του επιλεγμένου κτιρίου στη θέση του πλέγματος [cite: 21]
            this.add.image(gridX * tileSize + tileSize / 2, gridY * tileSize + tileSize / 2, selectedBuildingType);

            // Ενημέρωση των δεδομένων του πλέγματος για να επισημανθεί το κελί ως κατειλημμένο με τον τύπο του κτιρίου [cite: 12, 22]
            gridData[gridX][gridY] = selectedBuildingType;
            console.log(`${selectedBuildingType} placed at grid x: ${gridX}, y: ${gridY}`);
        } else {
            console.log(`Cannot place building here. Cell x: ${gridX}, y: ${gridY} is occupied by ${gridData[gridX][gridY]}.`); // [cite: 14]
        }
    });

}

function update() {
    // Αυτή η συνάρτηση καλείται κάθε καρέ
}

// Βοηθητική συνάρτηση για τη λήψη συντεταγμένων πλέγματος από τις συντεταγμένες του ποντικιού
function getGridPosFromMouse(pointer) {
    const x = Math.floor(pointer.x / tileSize);
    const y = Math.floor(pointer.y / tileSize);
    return { x, y };
}