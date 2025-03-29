const config = {
    type: Phaser.AUTO, // Αυτό θα επιλέξει αυτόματα WebGL ή Canvas ανάλογα με το διαθέσιμο
    width: 800,       // Πλάτος του καμβά
    height: 600,      // Ύψος του καμβά
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

const game = new Phaser.Game(config);

function preload () {
    // Εδώ μπορούμε να φορτώσουμε στοιχεία όπως εικόνες, ήχους κ.λπ.
    this.load.setBaseURL('https://labs.phaser.io'); // Για παραδείγματα
    this.load.image('sky', 'assets/skies/space3.png');
}

function create () {
    this.add.image(400, 300, 'sky');
    console.log("Η σκηνή δημιουργήθηκε!");
}

function update () {
    // Αυτή η συνάρτηση καλείται σε κάθε καρέ (frame)
}