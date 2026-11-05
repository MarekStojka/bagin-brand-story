# Bagin — Všechno je IN.

Interaktivní prezentace vizuálního konceptu Bagin. Obsahuje animovaný příběh značky, carousel v telefonu, ukázku instagramového feedu, produktové animace, videa, barvy a interaktivní typografii.

Živá prezentace po aktivaci GitHub Pages: https://marekstojka.github.io/bagin-brand-story/

## Spuštění na počítači

Ve složce projektu spusťte:

```sh
python3 -m http.server 8000
```

Potom otevřete http://localhost:8000. Použijte místní server; při pouhém otevření `index.html` z disku prohlížeč nemusí načíst data instagramového feedu.

Projekt používá čisté HTML, CSS a JavaScript. Nepotřebuje instalaci balíčků, sestavení ani serverovou databázi. Fotografie, písma a videa jsou součástí repozitáře.

## GitHub Pages

V nastavení repozitáře otevřete **Settings → Pages**, zvolte **Deploy from a branch**, větev **main** a složku **/ (root)**. Soubor `.nojekyll` zajišťuje publikování statických souborů bez zpracování Jekyllem.

## Úpravy

- `index.html` — struktura prezentace a texty.
- `content.js` — popisky návrhů, videa a paleta barev.
- `feed-data.json` — návrhy instagramového feedu.
- `typography.js` a `typography.css` — typografie a hra se znakem.
- `carousel.*`, `feed.*`, `finale.*` — interaktivní části prezentace.
- `assets/` — pouze média a písma používaná prezentací.

Omezení pohybu lze zapnout přímo v horní liště. Web podporuje také systémové nastavení omezeného pohybu.

## Podklady

Návrhy: https://www.figma.com/design/EEo4VKI6yNkOwBU3F1UCoj/Bagin---Brand

Fotografie produktů a lifestylové materiály vycházejí z podkladů Bagin/Reisenthel a uživatelem dodaných návrhů. Tři úvodní fotografie (`po-svem-*`) byly pro prezentaci vytvořeny generativně. Značky, fotografie, návrhy a videa zůstávají předmětem práv jejich vlastníků; tento repozitář jim neuděluje novou licenci.

Písma Archivo a Archivo Black jsou pod SIL Open Font License 1.1; texty licencí jsou ve složce `licenses/`.

Aktuální export prezentace: 5. listopadu 2026.
