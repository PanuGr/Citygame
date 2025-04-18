# Issues

## Assets
- texture to images

## Tilemap
- responsive display-map

## Menu
- when hover on menu the cursor should change shape.
- menu is on top of the map, the tiles are disabled. (see click-handling in game.js)
- later stage menu with html/css might useful

## In-game
- more buildings
- cost of buildings?
- building 1x1, buildings lvl-up?

## Time
### How the time should progress?
The game will last 1 in-game year. The in-game year lasts 24h in real-time. In the end of the year the game stops, it's over.
Through the year, every month will have a random event, which might be an event or a disaster. These events will add some modifiers to the game, until the next event occurs.

I added some "events" using alert() for now, when pollution gets too high or utilities too low

## Next steps
### Σύνοψη Προόδου

Μέχρι στιγμής έχουμε καταφέρει αρκετά πράγματα:

* Τοποθέτηση κτιρίων στο πλέγμα.
* Επιλογή κτιρίων (με τα γνωστά θέματα του toolbar που θα δούμε αργότερα).
* Παρακολούθηση Πληθυσμού και Θέσεων Εργασίας.
* Υπολογισμός και εμφάνιση Ανεργίας.
* Υπολογισμός παροχής, ζήτησης και ισοζυγίου Utilities (με ειδοποιήσεις % βάσει παροχής).
* Παρακολούθηση Ρύπανσης (με ειδοποιήσεις ορίων).
* Παρακολούθηση Ευτυχίας (με βασικό υπολογισμό).
* Αυτόματη καταστροφή κτιρίων λόγω υψηλής Ρύπανσης.
* Χρήση Emojis για τα γραφικά των κτιρίων.

### Επόμενα Πιθανά Βήματα

1.  **Λειτουργία Κτιρίων βάσει Πόρων:** Αυτή τη στιγμή, τα σπίτια παρέχουν πληθυσμό και τα εργοστάσια θέσεις εργασίας, ανεξάρτητα από το αν έχουν utilities ή αρκετούς εργαζόμενους (στην περίπτωση των εργοστασίων). Θα μπορούσαμε να προσθέσουμε λογική ώστε:
    * Τα σπίτια να "υπολειτουργούν" (π.χ., να μειώνεται ο πληθυσμός που υποστηρίζουν ή η ευτυχία τους) αν δεν υπάρχει αρκετή παροχή utilities.
    * Τα εργοστάσια να χρειάζονται διαθέσιμο πληθυσμό (εργαζόμενους) *και* utilities για να λειτουργήσουν (π.χ., για να παρέχουν τις θέσεις εργασίας τους ή, αν προσθέσουμε εισόδημα, για να παράγουν χρήματα).
    * we already check pollution, utilities and hapinness levels:
        - Utilities: if it drops 90% or more, population reduces 50%, workersNeeded in factories reduces 50% and randomly destroy few factory buildings
        - Happiness: if it drops 80% or more, population reduces 50% and randomly destroy few house buildings
        - Pollution: If it raises more than 70% randomly destroy buildings, population reduces 20%
    - Alert the player for these events
    - Revert the situation to normal standards when those levels are back to 50% 
2.  **Βελτίωση Μηχανισμού Ευτυχίας:** Να κάνουμε τον υπολογισμό της ευτυχίας πιο σύνθετο, προσθέτοντας ίσως θετικούς παράγοντες (π.χ., πάρκα, χαμηλή ανεργία) ή αλλάζοντας τους συντελεστές για την ανεργία και τη ρύπανση.
    - park added
    - έχω αυξήσει ήδη τον συντελεστη για τη μολυνση. 
    - θα προσθεσω modifiers/policies, either through events or from a menu that the player can choose.
3.  **Αντικατάσταση Toolbar:** Να ασχοληθούμε με τη δημιουργία του toolbar με HTML/CSS.

#### Prompt
