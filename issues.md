# Issues

## Assets
- texture to images

## Tilemap
- responsive display-map

## Menu
Menu is built with html:
- when page refreshes, the menu is left on the previous choice
- to unselect, you have to choose "no building"
- statistics could be placed in that menu

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
**Βελτιστοποίηση, τη Δοκιμή και την Ανάπτυξη (Deployment)**.

Αυτή η φάση περιλαμβάνει γενικά τρεις βασικούς άξονες:

1. **Διαχείριση Μνήμης & Κατάστασης (Milestone 10):**
    * Να διασφαλίσουμε ότι δεν υπάρχουν διαρροές μνήμης (memory leaks) και ότι τα αντικείμενα καθαρίζονται σωστά.
    * Βελτιστοποίηση φόρτωσης πόρων.
    * Υλοποίηση ενός συστήματος για την **αποθήκευση και φόρτωση της κατάστασης του παιχνιδιού** (π.χ., η διάταξη των κτιρίων, οι πόροι του παίκτη).
3.  **Τελικές Δοκιμές & Ανάπτυξη (Milestone 11):**
    * Δοκιμές σε διαφορετικούς browsers, μέτρηση απόδοσης.
    * Δημοσίευση μιας δοκιμαστικής (beta) έκδοσης για να πάρεις ανατροφοδότηση (π.χ., σε GitHub Pages ή itch.io).

**Από πού να Ξεκινήσουμε;**

Από τα παραπάνω, υπάρχουν μερικά συγκεκριμένα, πρακτικά βήματα που μπορούμε να κάνουμε:

* **Β. Διαχείριση Κατάστασης - Αποθήκευση/Φόρτωση:** Αυτό είναι συχνά ένα πολύ χρήσιμο χαρακτηριστικό. Μπορούμε να υλοποιήσουμε έναν απλό μηχανισμό που αποθηκεύει την τρέχουσα διάταξη του `gridData` και τις τιμές των βασικών πόρων (population, utilities, pollution, happiness) στο `localStorage` του browser. Έτσι, θα μπορείς να κλείσεις το παιχνίδι και να συνεχίσεις από εκεί που έμεινες.
### Επόμενα Πιθανά Βήματα



#### Prompt
