# Sound Design — Space Pizza Delivery

## Musik

| Key | Datei | Szene(n) | Hinweis |
|---|---|---|---|
| `music_menu` | `sounds/music_menu.mp3` | MainMenu, CharacterSelect | looped |
| `music_space` | `sounds/music_space.mp3` | SpaceFlightScene | looped |
| `music_tense` | `sounds/music_tense.mp3` | WordleScene, EscapeScene | looped |

## SFX — Must-have

| Key | Datei | Wann |
|---|---|---|
| `thrust` | `sounds/thrust.wav` | Schiff beschleunigt (loop while UP held) |
| `hit` | `sounds/hit.wav` | Asteroid trifft Schiff (kein Schild) |
| `confirm` | `sounds/confirm.wav` | Menü-Bestätigung / Enter |
| `pickup` | `sounds/pickup.wav` | Upgrade eingesammelt |
| `wordle_key` | `sounds/wordle_key.wav` | Buchstabe tippen |
| `wordle_win` | `sounds/wordle_win.wav` | Wort gelöst → SuccessScene |
| `wordle_fail` | `sounds/wordle_fail.wav` | Falsch geraten / Puzzle verloren |
| `success` | — **fehlt noch** | Lieferung abgeschlossen |
| `game_over` | `sounds/gameover.mp3` | Game Over |

## SFX — Nice-to-have

| Key | Datei | Wann |
|---|---|---|
| `shield_hit` | `sounds/shield_hit.wav` | Schild absorbiert Treffer |
| `laser` | `sounds/laser.wav` | Turret feuert (EscapeScene) |
| `land` | `sounds/land.wav` | Schiff landet auf Planet |
| `turret_alarm` | `sounds/turret_alarm.wav` | Countdown unter 3s (EscapeScene) |
| `speed` | `sounds/speed.wav` | Hyperdrive aktiv |

## Quellen

- **[kenney.nl](https://kenney.nl/assets?q=audio)** — alles CC0, Space Shooter Redux hat Schub/Schuss/Treffer-SFX fertig
- **[sfxr.me](https://sfxr.me/)** — Browser-Tool für 8-bit SFX, Export als WAV/OGG
- **[freesound.org](https://freesound.org)** — CC0-Filter setzen, gut für Musik-Loops
- **[opengameart.org](https://opengameart.org)** — kuratiert, viele Ludum Dare Packs

## Längen & Loop-Übersicht

| Key | Länge | Loop | Hinweis |
|---|---|---|---|
| `music_menu` | 1:42 | ja | |
| `music_space` | 10:00 | ja | so lang dass Loop kaum auffällt |
| `music_tense` | 0:32 | **ja, unbedingt** | zu kurz ohne Loop |
| `thrust` | 1.45s | ja | loop solange UP gehalten |
| `turret_alarm` | 1.58s | ja | loop während Countdown aktiv |
| `speed` | 0.37s | ja | loop während Hyperdrive aktiv |
| `hit` | 0.20s | nein | |
| `laser` | 0.14s | nein | pro Schuss neu abspielen |
| `land` | 0.52s | nein | |
| `pickup` | 0.27s | nein | |
| `confirm` | 2.00s | nein | ⚠ etwas lang — ggf. kürzen |
| `success` | 1.54s | nein | |
| `wordle_key` | 0.11s | nein | |
| `wordle_win` | 2.75s | nein | |
| `wordle_fail` | 1.59s | nein | |
| `shield_hit` | 3.15s | nein | lang aber ok als one-shot |
| `game_over` | 3.08s | nein | |

## Integration

Alle Dateien liegen in `public/assets/sounds/`.

In `main.ts` AudioManager instanziieren und registrieren:

```ts
import { AudioManager } from '@engine/audio/AudioManager'

const audio = new AudioManager()
audio.register('music_menu',   { src: '/assets/sounds/music_menu.mp3',   loop: true,  volume: 0.5 })
audio.register('music_space',  { src: '/assets/sounds/music_space.mp3',  loop: true,  volume: 0.5 })
audio.register('music_tense',  { src: '/assets/sounds/music_tense.mp3',  loop: true,  volume: 0.5 })
audio.register('thrust',       { src: '/assets/sounds/thrust.wav',       loop: true,  volume: 0.8 })
audio.register('turret_alarm', { src: '/assets/sounds/turret_alarm.wav', loop: true,  volume: 0.9 })
audio.register('speed',        { src: '/assets/sounds/speed.wav',        loop: true,  volume: 0.7 })
audio.register('hit',          { src: '/assets/sounds/hit.wav' })
audio.register('laser',        { src: '/assets/sounds/laser.wav' })
audio.register('land',         { src: '/assets/sounds/land.wav' })
audio.register('pickup',       { src: '/assets/sounds/pickup.wav' })
audio.register('confirm',      { src: '/assets/sounds/confirm.wav' })
audio.register('success',      { src: '/assets/sounds/success.wav' })
audio.register('wordle_key',   { src: '/assets/sounds/wordle_key.wav' })
audio.register('wordle_win',   { src: '/assets/sounds/wordle_win.wav' })
audio.register('wordle_fail',  { src: '/assets/sounds/wordle_fail.wav' })
audio.register('shield_hit',   { src: '/assets/sounds/shield_hit.wav' })
audio.register('game_over',    { src: '/assets/sounds/gameover.mp3' })
```

`audio` dann an alle Scenes weitergeben (wie `input` und `assets`).
