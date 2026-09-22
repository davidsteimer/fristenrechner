# QA-MVP04-SPFX-0401: Lokaler Korrekturkandidat

Prüfdatum: 22. September 2026. Ergebnis: **Lokale Korrektur, Gesamtbuild und Paketregression bestanden. Keine Installation, Publikation oder betriebliche Freigabe.**

## Gebundener Prüfgegenstand

| Merkmal | Nachgewiesener Wert |
| --- | --- |
| Paketdatei | `fristenrechner-schweiz-0.4.0.1.sppkg` |
| Solution- und Featureversion | `0.4.0.1` |
| Anwendungs- und WebPart-Version | `0.4.0` |
| Paketgrösse | 202'616 Bytes |
| Paket SHA-256 | `9f31513cbc56f0ee2bb178e1db9336252d0266527643bebc2fb1348820711346` |
| Tatsächlich ausgeführte Bundledatei | `ClientSideAssets/fristenrechner-web-part_24d3a4dd2033d83cc8d9.js` |
| Bundle SHA-256 | `5a906812c8f8a43557e850481588663f014b00f732de6e0e1e2fb9ff8d285c14` |
| Datenrelease | `2026-09-22-mvp-04-approved.1` |
| Unveränderlicher Datencommit | `739876a0d11b550ea8cc702622ab22af321994a5` |
| Manifest SHA-256 | `a240b01feb671dbe4374c1e097bc9143d66fd4878cd235b3b490a9c08afec72e` |
| Quellbasis | Lokaler Arbeitsstand auf `a3d7b4f41994b2c473045223627cc965558dac72`, einschliesslich der noch nicht committeten Korrektur |
| Toolchain | Gepinntes Node.js `22.23.2`, bestehende SPFx-Abhängigkeiten, keine neuen Abhängigkeiten |

Die benannte Paketkopie liegt in `.work/release-mvp04-spfx-0.4.0.1-2026-09-22/artifacts/`. Sie stimmt byteweise mit `spfx/sharepoint/solution/fristenrechner-schweiz.sppkg` und dem [separaten Artefaktnachweis](artifact-verification.json) überein. Der Pakettest hat genau die oben bezeichneten Paket- und Bundleprüfsummen ausgegeben.

Die einzige Änderung an der produktiven Berechnungs-/Validierungslogik stellt im Konstruktor von `HolidayCatalogError` die beim ES5-Build verlorene Prototypkette wieder her. Schema, Katalog, übrige Fachdaten und der enge `oneOf`-Catch bleiben unverändert.

## Prüfergebnisse

| Prüfung | Ergebnis |
| --- | --- |
| TypeScript-Typprüfung | Bestanden |
| Core-/UI-Suite | 676 Tests bestanden, 0 fehlgeschlagen |
| SPFx-Quelltests | 48 Tests bestanden, 0 fehlgeschlagen |
| Produktionsbuild | Kompilierung, Lintlauf, Webpack, CSS-Isolationsprüfung und Paketierung bestanden |
| Emittierter ES5-Code und tatsächliches Paket | 25 Tests bestanden, 0 fehlgeschlagen |
| Artefakterstellung und Erhalt historischer Artefakte | 47 Tests bestanden, davon 27 für den ursprünglichen Präparator und 20 für den Korrekturkandidaten |
| MVP-0.4-Datenvalidierung | Bestanden, einschliesslich Negativfällen. 5 Profile, 47 Fristregeln, 15 Kalenderregeln und 479 Katalogregeln |
| Quellenprüfungs- und Nachweislogik | Bestehende Validierungsprüfungen bestanden. Keine erneute materielle Quellenprüfung oder neue Fachfreigabe in diesem Korrekturschritt |
| Unabhängiger lokaler Review | Keine konkreten blockierenden Befunde an Korrektur und Pakettestaufbau |

Im Lintlauf bleiben die zwei bereits bestehenden Warnungen `@rushstack/no-new-null` in den synchronisierten `spfx/src/core/types.ts` an Zeilen 29 und 49. Sie sind keine neuen Buildfehler. Der leere Jest-Teil des Heft-Laufs ersetzt keine Tests. Die 48 Quelltests laufen vorher, die 25 emittierten beziehungsweise paketierten Tests nach der Paketierung als zwingende Buildschritte.

### Nachweis, dass die Tests den ursprünglichen Fehler erkennen

Die gezielte Gegenprobe wurde mit dem unveränderten Paket `0.4.0.0`, SHA-256 `eaf4c24ae53c8c3166e38025cbe2337029c2dd88930e354030c97e622ffb6a2a`, ausgeführt. Zwei der drei ausgewählten Prüfungen schlagen erwartungsgemäss fehl:

1. Der Fehler aus dem alten Bundle wird nicht als eigene Fehlerklasse erkannt.
2. Die Erstaktivierung des gültigen Releases scheitert im alten Bundle erneut mit `Ungültiger Text: holidayCatalog/data/jurisdictions/0/parentId`.

Die parallel ausgewählte Prüfung des bereits korrigierten emittierten CommonJS-Codes besteht. Der erwartete Exitcode der Gegenprobe ist 1. Der abschliessende Gesamtbuild des neuen Pakets besteht mit Exitcode 0.

### Abgedeckte Laufzeitfälle

Die neue Suite führt echte emittierte ES5-Module und unverändertes AMD-JavaScript aus dem `.sppkg` aus. Sie erreicht über den exportierten WebPart den tatsächlichen Produktadapter, Release-Service und Validator. Geprüft werden insbesondere:

- Gültige `null`-/`oneOf`-Felder und Erstaktivierung aller zehn realen Releasedateien aus einem leeren lokalen Testspeicher.
- Wechsel vom bisherigen Format-3-Release auf Format 4 sowie AP5-Kompatibilität.
- Ungültige Struktur, ungültige fachliche Referenz, unbekanntes Feld und nicht auflösbare Quelle.
- Fehlendes Artefakt und Prüfsummenabweichung mit gesperrter Aktivierung.
- Erhalt des letzten gültigen Datenstands bei einem fehlerhaften Nachfolger.
- Unveränderte Weitergabe unerwarteter Programmfehler aus einem `oneOf`-Zweig.

Die kontrollierten Hostadapter und die isolierte IndexedDB-Testimplementierung ersetzen keine echte SharePoint- oder Teams-Prüfung. Insbesondere sind damit kein Tenanttransport, Gastzugriff, cachefreier Mirrorabruf im Zielbrowser oder manueller UI-Test nachgewiesen.

## Unverändert erhalten

Alle zehn freigegebenen Datendateien sind byteidentisch zum Datencommit und zum bestehenden Mirrorarchiv. Das alte Paket, Mirrorarchiv, Webarchiv, der ursprüngliche Artefaktnachweis und das gesicherte Rückfallpaket sind unverändert. Ihre Einzelprüfsummen stehen im [Artefaktnachweis](artifact-verification.json).

Es wurden keine Rechtsregeln, Quellenentscheidungen, Kantonsfreigaben, Schemata, Paketidentitäten oder API-Berechtigungen erweitert. Die vorhandene benutzerseitig geänderte Word-Projektplandatei wurde nicht bearbeitet.

Kein Webbuild oder neues P-Archiv wurde erzeugt. Das bisherige Webarchiv bleibt ein historisches Artefakt seines bisherigen Quellstands und wird nicht als Neubau der Korrektur ausgegeben. Die in `artifact-verification.json` auf `false` gesetzte `runtimeValidationVerified` bezieht sich auf den dort ausdrücklich begrenzten Strukturprüfumfang. Die ergänzende lokale Laufzeitprüfung ist in diesem separaten Nachweis dokumentiert.

## Rückverfolgbarkeit und Grenzen

| Relevante lokale Datei | SHA-256 |
| --- | --- |
| `src/core/holidayCatalog.ts` | `00fbe296ddcccd8cf03e72084c9fdff1a28e653008054d822845f4b533531ef9` |
| `spfx/test-build/consumer-regression.test.cjs` | `85b6c418b357a09140d4a63463cb126bd3e2305f384b6c7068708d0a0bde6c8c` |
| `spfx/test-build/package-harness.cjs` | `a21923bb61d983c833a9eebf4149bedc8eecdd1f86fe9f2dd452a2d91bb09e3f` |
| `spfx/config/package-solution.json` | `5c4c8861f0b68e312ea09ef5de13cf1b8a4cbb8bd4dde51e043f2521b1822516` |
| `spfx/package.json` | `aa4536f87afe56f7a6c498cb1d883409fa1df171470997a9d7b17274d4ddca52` |
| `scripts/prepare_mvp04_spfx_correction.py` | `b915d2a58c19f0b62c7ef992969cc8a9e26998d4fd20a138afe42024388f71e4` |

Die lokalen Build-, Core-/UI- und Gegenprobenprotokolle liegen unter `.work/release-mvp04-spfx-0.4.0.1-2026-09-22/qa/`. Sie werden wegen ihrer lokalen Pfad- und Umgebungsangaben nicht öffentlich übernommen. Es wurde kein neuer Commit erstellt oder veröffentlicht. Ein späterer Neubau erhält eine neu zu prüfende Artefaktbindung.

Die nächste Mutation in E/Q benötigt eine ausdrückliche, auf die neue Paketprüfsumme begrenzte Installationsfreigabe. Vorher sind Katalog- und Appinstanzstand, Rechte, Mirrors und Rückfallfähigkeit frisch zu verifizieren. Historische AP5-Daten bleiben unverändert. Nach E folgen Q und Davids manuelle Q-Abnahme, erst danach die separat freizugebenden Publikationsschritte.

David Steimer trägt die fachliche und betriebliche Freigabeverantwortung. Codex dokumentiert die technische Ausführung ohne eigene formelle Freigabe- oder Haftungsverantwortung.
