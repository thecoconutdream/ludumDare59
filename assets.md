# Asset List — Space Pizza Delivery

Game resolution: **320×180px** · Style: **pixel art** · All sprites as PNG

---

## Sprite Sheet Lesehinweis

Alle Sprite Sheets sind Raster-Layouts: Zeilen = Animationen, Spalten = Frames.
Der Engine-Code liest Frames von **links nach rechts, Zeile für Zeile**.

```
Frame 0  Frame 1  Frame 2  Frame 3   ← Zeile 0 = Animation A
Frame 4  Frame 5  Frame 6  Frame 7   ← Zeile 1 = Animation B
```

Jeder Frame hat dieselbe Größe. Leere Felder am Ende einer Zeile werden leer gelassen.

---

## 1. Player Character

### 1a. Katze — Basis-Sprite Sheet

**Datei:** `sprites/player/cat_base.png`
**Frame-Größe:** 16×24px
**Sheet-Größe:** 128×144px (8 Spalten × 6 Zeilen)
**Verwendung:** Intro-Szene (gehen), Pizzeria (idle), SuccessScene (feiern), EscapeScene (Cockpit)

| Zeile | Animation | Frames | FPS | Was zu malen ist |
|---|---|---|---|---|
| 0 | idle | 4 | 6 | Katze steht, minimale Auf-/Ab-Bewegung des Körpers (Atemrhythmus). Frame 0–3 zeigen leichten Brust-Hub. |
| 1 | walk | 6 | 10 | Laufzyklus, Beine abwechselnd, Arme schwingen leicht. Seitenansicht (links gehend). |
| 2 | fly | 4 | 8 | Oberkörper-Nahaufnahme im Cockpit. Hände am Steuer, Kopf leicht zur Seite geneigt. Frame 2 = leicht nach vorne gebeugt (Boost). |
| 3 | celebrate | 8 | 10 | Arme hochwerfen, hüpfen, Fäuste ballen, strahlendes Gesicht. Frames 0–3 Aufsprung, 4–7 Landung+Jubel. |
| 4 | hit | 3 | 12 | Zurückprall-Recoil. Frame 0 = Kontakt (aufgerissene Augen), Frame 1 = zurück gestreckt, Frame 2 = recover. |
| 5 | dead | 4 | 6 | Zusammensacken. Frame 0–2 fallen, Frame 3 = am Boden, Augen ×. Letzter Frame einfrieren. |

---

### 1b. Hund — Basis-Sprite Sheet

**Datei:** `sprites/player/dog_base.png`
**Frame-Größe:** 16×24px
**Sheet-Größe:** 128×144px (8 Spalten × 6 Zeilen)
**Verwendung:** identisch zu Katze

Gleiche Zeilen / Animations-Struktur wie Katze (1a).
Visueller Unterschied: hängende Ohren, Schnauze, wedelnder Schwanz bei idle/walk/celebrate.

---

### 1c. Outfit-Overlays

Overlays werden pixelgenau über den Basis-Charakter gelegt. Selbe Frame-Größe und Sheet-Struktur wie 1a/1b, damit die Frames exakt übereinanderpassen.

**Frame-Größe:** 16×24px
**Sheet-Größe:** 128×144px (8 Spalten × 6 Zeilen)
**Wichtig:** Transparenter Hintergrund. Nur der Outfit-Teil ist gezeichnet, alles andere transparent.

| Datei | Slot | Item | Verwendung |
|---|---|---|---|
| `sprites/outfits/hat_delivery_cap.png` | Kopf | Liefermütze (Standard) | alle Szenen |
| `sprites/outfits/hat_space_helmet.png` | Kopf | Raumhelm (Unlock 1) | alle Szenen |
| `sprites/outfits/hat_chef_toque.png` | Kopf | Kochmütze (Unlock 2) | alle Szenen |
| `sprites/outfits/hat_cowboy.png` | Kopf | Cowboyhut (Unlock 3) | alle Szenen |
| `sprites/outfits/body_delivery_jacket.png` | Körper | Lieferjacke (Standard) | alle Szenen |
| `sprites/outfits/body_bomber.png` | Körper | Bomberjacke (Unlock 1) | alle Szenen |
| `sprites/outfits/body_spacesuit.png` | Körper | Raumanzug (Unlock 2) | alle Szenen |
| `sprites/outfits/body_chef_coat.png` | Körper | Kochmantel (Unlock 3) | alle Szenen |

---

## 2. Raumschiff

**Datei:** `sprites/ship/spaceship.png`
**Frame-Größe:** 32×24px
**Sheet-Größe:** 256×144px (8 Spalten × 6 Zeilen)
**Verwendung:** SpaceFlightScene (Hauptobjekt), IntroScene (Start-Sequenz), EscapeScene

| Zeile | Animation | Frames | FPS | Was zu malen ist |
|---|---|---|---|---|
| 0 | idle | 2 | 4 | Schiff ruhig, Triebwerk glüht leicht. Frame 0 = Glühen normal, Frame 1 = Glühen heller. |
| 1 | thrust | 4 | 12 | Triebwerksflamme hinten, Frames zeigen Flacker-Zyklus. Flamme wächst Frame 0→2, schrumpft Frame 3. |
| 2 | boost | 4 | 16 | Große Flamme + blaue Triebwerks-Ringe. Schiff minimal nach vorne geneigt. |
| 3 | damaged | 4 | 8 | Rauch-/Funken-Wolke am Triebwerk, Schiff leicht schiefliegend. Frames wechseln Rauchposition. |
| 4 | explode | 8 | 12 | Explosion wächst vom Zentrum aus. Frames 0–3 Expansion (orange/rot), 4–6 Rauch (grau), Frame 7 leer. One-shot. |
| 5 | landing | 4 | 8 | Landefüße fahren aus. Frame 0 = eingeklappt, Frame 3 = voll ausgefahren. One-shot. |

### 2b. Upgrade-Overlays auf dem Schiff

**Frame-Größe:** 32×24px (passend zu Schiff)
**Sheet-Größe:** 128×24px (4 Frames, 1 Zeile)

| Datei | Effekt | Frames | FPS | Was zu malen ist |
|---|---|---|---|---|
| `sprites/ship/upgrade_boost_glow.png` | Hyperdrive aktiv | 4 | 8 | Blauer Glüh-Ring um Triebwerk, pulsierend |
| `sprites/ship/upgrade_damaged_smoke.png` | Triebwerk kaputt | 4 | 6 | Rauch-Puff, leicht loopend |
| `sprites/ship/upgrade_shield.png` | Schild aktiv | 4 | 6 | Transparente Blase um das Schiff, schimmert |

---

## 3. Planeten (im Weltraum, beim Vorbeifliegen)

Alle Planeten sind statische PNGs ohne Animation. Rotation/Bobbing wird im Code gemacht.

### 3a. Heimatplanet (Pizzeria sichtbar)

**Datei:** `sprites/planets/planet_home.png`
**Größe:** 48×48px
**Verwendung:** SpaceFlightScene, am Start und nach jeder Lieferung
**Was zu malen:** Runder Planet, untere Hälfte zeigt winzige Pizzeria-Silhouette + Neonschild + Landepad. Warme Farben (orange/braun).

---

### 3b. Kunden-Planeten (Lieferziel)

3 Varianten, je eine Datei. Jede zeigt eine andere Mansion-Silhouette.

**Datei:** `sprites/planets/planet_client_1.png` / `_2.png` / `_3.png`
**Größe:** 48×48px je Datei
**Verwendung:** SpaceFlightScene als Zielplanet (per Kompass markiert), WordleScene-Hintergrund
**Was zu malen:**
- Planet mit einer kleinen Villa/Herrenhaus-Silhouette an der Unterkante
- Luxuriöse Farben (lila, gold, teal — je Variante verschieden)
- Variante 1: klassische Villa mit Säulen
- Variante 2: futuristische Kuppel
- Variante 3: Schloss/Turm

**Datei (Waffen raus):** `sprites/planets/planet_client_1_armed.png` / `_2` / `_3`
**Größe:** 48×48px
**Verwendung:** EscapeScene — wenn Wordle fehlschlägt
**Was zu malen:** Identisch zur unbewaffneten Variante, aber kleine Geschütz-Silhouetten (2–3) an der Planetenoberfläche sichtbar.

---

### 3c. Seiten-Planeten (optional landbar, Loot)

Je 2 Varianten pro Biom.

**Größe:** 40×40px je Datei

| Datei | Biom | Farben | Oberflächen-Detail |
|---|---|---|---|
| `sprites/planets/planet_side_ice_1.png` / `_2.png` | Eis | Weiß/Hellblau | Gletscher-Zacken an Unterkante |
| `sprites/planets/planet_side_jungle_1.png` / `_2.png` | Dschungel | Grün/Dunkelgrün | Baumkronen-Silhouetten |
| `sprites/planets/planet_side_desert_1.png` / `_2.png` | Wüste | Orange/Beige | Kaktus- und Felsen-Silhouetten |
| `sprites/planets/planet_side_lava_1.png` / `_2.png` | Lava | Dunkelrot/Orange | Lava-Risse, Glühen an Rändern |

---

### 3d. Tote Planeten (reine Dekoration)

**Datei:** `sprites/planets/planet_dead_1.png` / `_2.png` / `_3.png`
**Größe:** 32×32px
**Verwendung:** SpaceFlightScene, fliegen vorbei ohne Interaktion
**Was zu malen:** Grau/Braun, Krater-Textur, kein erkennbares Gebäude.

---

## 4. Hintergrund-Ebenen (Parallax)

Alle **320×180px**, PNG, nahtlos horizontal kachelbar (linke und rechte Kante müssen matchen).

| Datei | Ebene | Scroll-Speed | Was zu malen |
|---|---|---|---|
| `sprites/bg/space_far.png` | Hintergrund (langsam) | 0.1× | Sehr sparsame weiße Pixel-Sterne auf fast-schwarz. Maximal 30–40 Sterne. |
| `sprites/bg/space_mid.png` | Mitte | 0.3× | Etwas größere Sterne (1–2px), leichte Nebula-Farbwolken (lila/blau, sehr subtil, ~20% opacity). |
| `sprites/bg/space_near.png` | Vordergrund (schnell) | 0.7× | Größte Sterne (2px), ggf. einzelne Staubpartikel. Nur ~15 Elemente. |

---

## 5. Szenen-Hintergründe (statisch)

Alle **320×180px**, PNG.

### 5a. Pizzeria Innenraum
**Datei:** `sprites/bg/pizzeria_interior.png`
**Verwendung:** IntroScene — Auftrags-Übergabe
**Was zu malen:**
- Linke Hälfte: Tresen mit Pizzakartons gestapelt, Bestellzettel darauf
- Rechte Hälfte: Ofen im Hintergrund, Pizzaschieber angelehnt, Menütafel an der Wand
- Beleuchtung: warmes orange/gelbes Lampenlicht von oben
- Boden: Schachbrettmuster (klassisch pizzeria)

### 5b. Pizzeria Außenbereich / Launchpad
**Datei:** `sprites/bg/pizzeria_exterior.png`
**Verwendung:** IntroScene — Player geht zur Rakete, Abflug
**Was zu malen:**
- Pizzeria-Fassade links mit Neonschild "COSMIC PIZZA"
- Rechts: kleines Landepad mit Rakete (Schiff-Sprite sitzt darauf, also Pad allein ohne Schiff)
- Alien-Himmel: lila/teal Töne, fremde Berge im Hintergrund
- Straße/Boden: Futuristisches Kopfsteinpflaster oder Lichtstreifen

### 5c. Kunden-Planeten-Oberfläche
**Datei:** `sprites/bg/client_surface_1.png` / `_2.png` / `_3.png`
**Verwendung:** WordleScene — Hintergrund während Passwort-Rätsel, SuccessScene
**Was zu malen (je Variante):**
- Landepad vor einer Mansion/Villa
- Variante 1: Marmor-Säulen, goldene Details
- Variante 2: Glas-Kuppelbau, futuristisch
- Variante 3: Schloss-Mauer, Steinbogen
- Immer: bewachter Eingang, Türen zunächst geschlossen

### 5d. Seiten-Planeten-Oberflächen
**Verwendung:** SidePlanetScene — kurze Erkundung nach optionaler Landung

| Datei | Biom | Was zu malen |
|---|---|---|
| `sprites/bg/side_surface_ice.png` | Eis | Eishöhle oder Schneefläche, blaues Licht, Stalaktiten |
| `sprites/bg/side_surface_jungle.png` | Dschungel | Dichtes Blätterdach, Lichtstrahl, fremde Pflanzen |
| `sprites/bg/side_surface_desert.png` | Wüste | Sanddünen, riesige Felsbrocken, gleißendes Licht |
| `sprites/bg/side_surface_lava.png` | Lava | Schwarzer Fels, Lava-Ströme im Hintergrund, Glutschein |

---

## 6. Hindernisse

### 6a. Asteroiden

Statische PNGs, Rotation im Code. Unregelmäßige Form, Krater-Textur.

| Datei | Größe | Varianten | Was zu malen |
|---|---|---|---|
| `sprites/obstacles/asteroid_small_1/2/3.png` | 8×8px | 3 | Grobe Klumpen, je andere Form |
| `sprites/obstacles/asteroid_medium_1/2/3.png` | 16×16px | 3 | Erkennbare Brocken mit Kratern |
| `sprites/obstacles/asteroid_large_1/2.png` | 24×24px | 2 | Größere Brocken, deutliche Krater |
| `sprites/obstacles/asteroid_huge.png` | 32×32px | 1 | Massiver Asteroid, mehrere Krater |

### 6b. Weltraumschrott

Sprite Sheets, taumelnde Animation.

**Frame-Größe:** 12×12px · **Sheet-Größe:** 72×12px (6 Frames × 1 Zeile) · FPS: 8

| Datei | Was zu malen (6 Frames = Rotation 0°→300°) |
|---|---|
| `sprites/obstacles/junk_satellite.png` | Gebrochene Satellitenschüssel, rotiert |
| `sprites/obstacles/junk_panel.png` | Verbogenes Metallblech, rotiert |
| `sprites/obstacles/junk_canister.png` | Treibstoffkanister, rotiert |

---

## 7. Gefahren

### 7a. Waffen-Geschütz

**Datei:** `sprites/hazards/turret.png`
**Frame-Größe:** 16×16px
**Sheet-Größe:** 96×48px (6 Spalten × 3 Zeilen)
**Verwendung:** EscapeScene — auf Kunden-Planetenoberfläche montiert

| Zeile | Animation | Frames | FPS | Was zu malen |
|---|---|---|---|---|
| 0 | dormant | 2 | 3 | Geschütz eingezogen, Lauf nach unten. Leichtes Puls-Glühen. |
| 1 | aiming | 6 | 12 | Lauf dreht sich (0°→90°) in Richtung Spieler. |
| 2 | firing | 4 | 16 | Lauf ausgerichtet + Mündungsblitz. Frame 3 = Rückstoß. |

### 7b. Projektil / Laserstrahl

**Datei:** `sprites/hazards/projectile.png`
**Größe:** 8×4px (statisch, kein Sheet)
**Verwendung:** EscapeScene — wird auf Spielerschiff gefeuert
**Was zu malen:** Horizontaler Laserstrahl, Kern weiß, Rand orange/rot, 8×4px.

### 7c. Zielerfassungs-Retikel

**Datei:** `sprites/hazards/reticle.png`
**Frame-Größe:** 32×32px
**Sheet-Größe:** 128×32px (4 Frames × 1 Zeile) · FPS: 8
**Verwendung:** EscapeScene — pulsiert rot über dem Spielerschiff wenn Waffen locken
**Was zu malen:** 4 Frames eines pulsierenden roten Kreises mit Fadenkreuz. Frame 0 = klein, Frame 3 = groß/fader (Schleife).

---

## 8. NPCs & Gebäude

### 8a. Pizzeria-Boss (NPC)

**Datei:** `sprites/npc/pizza_boss.png`
**Frame-Größe:** 16×24px
**Sheet-Größe:** 80×24px (5 Frames × 1 Zeile)
**Verwendung:** IntroScene — steht hinter dem Tresen

| Frame | Was zu malen |
|---|---|
| 0–1 | Idle (leichtes Schaukeln, 2 Frames) |
| 2–4 | Bestellzettel über den Tresen schieben (3 Frames, One-shot) |

### 8b. Mansion-Tür (Öffnungsanimation)

**Datei:** `sprites/npc/mansion_door.png`
**Frame-Größe:** 16×24px
**Sheet-Größe:** 64×24px (4 Frames × 1 Zeile) · FPS: 8
**Verwendung:** SuccessScene — Tür öffnet sich nach erfolgreicher Lieferung, One-shot
**Was zu malen:** Frame 0 = Tür geschlossen, Frame 3 = vollständig offen, drinnen helles Licht.

---

## 9. UI-Elemente

### 9a. Kompass

**Datei:** `sprites/ui/compass_ring.png`
**Größe:** 24×24px (statisch, kein Sheet)
**Verwendung:** SpaceFlightScene — HUD, zeigt Richtung zum Ziel
**Was zu malen:** Kreisring mit Himmelsrichtungs-Markierungen (N/S/E/W als Pixel), dunkler Hintergrund (halbtransparent).

**Datei:** `sprites/ui/compass_needle.png`
**Größe:** 6×12px (statisch)
**Verwendung:** Wird im Code rotiert, zeigt auf Zielplanet
**Was zu malen:** Pfeil — Spitze rot (Ziel), Ende blau (Heimat).

---

### 9b. Wordle-Grid

**Datei:** `sprites/ui/wordle_grid.png`
**Größe:** 96×114px (statisch, kein Sheet)
**Verwendung:** WordleScene — Hintergrund-Raster für die 5×6 Felder

Inhalt: 5 Spalten × 6 Zeilen leere Zellen, je **16×16px**, **2px Abstand** zwischen Zellen.
Sheet-Berechnung: 5 × 16 + 4 × 2 = **88px breit**, 6 × 16 + 5 × 2 = **106px hoch** → aufrunden auf 96×114px mit Außenabstand.

**Was zu malen:** Dunkle Zellrahmen (1px Linie), Zellfüllung fast-schwarz, Hintergrund dunkel-transparent.

---

### 9c. Wordle-Kacheln (Buchstaben-Feedback)

**Frame-Größe:** 16×16px · **Sheet-Größe:** 48×16px (3 Frames × 1 Zeile, kein Sheet wegen Varianten)

| Datei | Zustand | Farbe | Was zu malen |
|---|---|---|---|
| `sprites/ui/wordle_tile_correct.png` | Richtiger Buchstabe, richtige Position | Grün (#538d4e) | 16×16px Kachel, grüner Hintergrund, weißer Rahmen |
| `sprites/ui/wordle_tile_present.png` | Richtiger Buchstabe, falsche Position | Gelb (#b59f3b) | 16×16px Kachel, gelber Hintergrund |
| `sprites/ui/wordle_tile_absent.png` | Buchstabe nicht im Wort | Grau (#3a3a3c) | 16×16px Kachel, dunkelgrauer Hintergrund |
| `sprites/ui/wordle_tile_empty.png` | Leer (noch nicht eingegeben) | Dunkel | 16×16px Kachel, Rahmen sichtbar, Füllung fast-schwarz |

Buchstaben selbst werden per Canvas-Text darübergerendert (kein Sprite nötig).

---

### 9d. Banner & Popups

Alle statische PNGs.

| Datei | Größe | Verwendung | Was zu malen |
|---|---|---|---|
| `sprites/ui/banner_accepted.png` | 160×20px | WordleScene — Erfolg | "ACCESS GRANTED" in Grün, pixel font, Rahmen |
| `sprites/ui/banner_denied.png` | 160×20px | WordleScene — Fail | "ACCESS DENIED" in Rot |
| `sprites/ui/banner_escape.png` | 100×30px | EscapeScene — Countdown-Rahmen | Roter Rahmen, innen dunkel, Platz für Digits |
| `sprites/ui/popup_outfit.png` | 80×50px | SidePlanetScene / SuccessScene | "NEW OUTFIT!" Popup-Rahmen, goldener Rand |
| `sprites/ui/popup_upgrade.png` | 80×50px | SidePlanetScene | "SHIP UPGRADE!" Popup-Rahmen, blauer Rand |
| `sprites/ui/prompt_land.png` | 64×10px | SpaceFlightScene | "[E] LAND" kleiner Hinweis über Seitenplanet |

---

### 9e. Upgrade-Icons (HUD)

**Größe:** 12×12px je Datei (statisch)
**Verwendung:** SpaceFlightScene — HUD-Ecke zeigt aktive Upgrades

| Datei | Upgrade | Was zu malen |
|---|---|---|
| `sprites/ui/icon_boost.png` | Hyperdrive aktiv | Blauer Pfeil nach vorne, Blitz-Symbol |
| `sprites/ui/icon_damaged.png` | Triebwerk kaputt | Orangener Rauch, Zahnrad mit X |
| `sprites/ui/icon_shield.png` | Schild aktiv | Blauer Schild-Umriss |
| `sprites/ui/icon_nav.png` | Nav-Chip | Grüner Kompasspfeil |

---

## 10. Zahlen / Digits (Countdown)

**Datei:** `sprites/ui/digits.png`
**Frame-Größe:** 8×10px
**Sheet-Größe:** 88×10px (10 Frames × 1 Zeile: Ziffern 0–9)
**Verwendung:** EscapeScene — Countdown-Anzeige
**Was zu malen:** Pixel-Ziffern 0 bis 9, je 8×10px, weiß auf transparent. Neonfont-Stil (dünne Linien).

---

## Asset-Überblick (Zählung)

| Kategorie | Dateien |
|---|---|
| Character sheets (base) | 2 |
| Outfit overlay sheets | 8 |
| Ship sheet + upgrade overlays | 4 |
| Planet PNGs | 20 |
| Background PNGs (space parallax) | 3 |
| Scene backgrounds | 8 |
| Asteroid PNGs | 9 |
| Space junk sheets | 3 |
| Hazard sprites (turret, projectile, reticle) | 3 |
| NPCs & buildings | 2 |
| UI sprites (compass, wordle, banners, icons, digits) | ~20 |
| **Gesamt** | **~82 Dateien** |

---

## Asset-Priorität nach Phase

| Phase | Was wird gebraucht |
|---|---|
| Phase 2 — Space Flight | Space BG (3 Parallax-Ebenen) · Planeten (alle 20 PNGs) · Schiff-Sheet · Asteroiden (9) · Junk (3) · Kompass (2) · prompt_land |
| Phase 3 — Wordle | Wordle-Grid · Wordle-Kacheln (4) · Banner accepted/denied · client_surface BGs (3) |
| Phase 4a — Characters | cat_base · dog_base · Outfit-Overlays (8) · pizza_boss · mansion_door |
| Phase 4b — Escape | Turret-Sheet · Projektil · Retikel · banner_escape · planet_client_armed (3) |
| Phase 4c — Progression | popup_outfit · popup_upgrade · Upgrade-Icons (4) · side_surface BGs (4) |
| Phase 5 — Polish | digits · alle finalen UI-Sprites · Audio-Assets |
