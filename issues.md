# Issues

## Assets
- texture to images

## Tilemap
- responsive display-map

## Menu
- when hover on menu the cursor should change shape.
- menu is on top of the map, the tiles are disabled. (see click-handling in game.js)
- later stage menu with html/css might useful
- when select a building, cannot unselect

## In-game
- more buildings
- cost of buildings?
- building 1x1, buildings lvl-up?
````js
const BUILDING_DATA = {
    HOUSE: {
        textureKey: 'building_house', // Unique texture key
        cost: 50,
        displayName: 'House',
population: 2,
lvl1:{
electricityNeed:2,
waterNeed:2,
pollution:2
},
lvl2:{
electricityNeed:1,
waterNeed:1,
pollution:1
},
        // Future properties like income, population effect, etc. can go here
    },
    FACTORY: {
        textureKey: 'building_factory', // Unique texture key
        cost: 150,
        displayName: 'Factory',
lvl1:{
workersNeed:4,
electricityNeed:2,
waterNeed:2,
pollution:2
},
lvl2:{
workers:2,
electricityNeed:3,
waterNeed:3,
pollution:1
}
        // Future properties like pollution, jobs, etc. can go here
    }
    // Add more building types here later
};
````

## Time
### How the time should progress?
The game will last 1 in-game year. The in-game year lasts 24h in real-time. In the end of the year the game stops, it's over.
Through the year, every month will have a random event, which might be an event or a disaster. These events will add some modifiers to the game, until the next event occurs.

## Next steps
So far:
* Set up the basic Phaser project structure.
* Implemented a grid system and tilemap background.
* Added building selection via a toolbar.
* Refactored building data into a more maintainable structure (`BUILDING_DATA`).
* Implemented a basic resource (money) with building costs.
* Added a simple HUD to display the money.
* Set up a foundational time progression system using timed events.

Potential next steps when you're ready could include:

1.  **Income Generation:** Using the `gameTick` function to add money based on placed buildings (like factories or houses).
2.  **Population Mechanics:** Adding a population resource and having houses increase it.
3.  **UI/HUD Expansion:** Displaying population or other metrics.
4.  **More Building Types:** Expanding the `BUILDING_DATA` object and toolbar.
