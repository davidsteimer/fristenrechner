# Höhe der Datumseingabe

Stand: 18. Oktober 2026. Bezug: [Issue #50](https://github.com/davidsteimer/fristenrechner/issues/50), Fortsetzung nach MVP 0.8.

**Aktueller Stand:** David hat die erste Korrektur wegen weiterhin abweichender Darstellung nicht abgenommen. Der [zweite Nachtrag](datumseingabe-hoehe-issue50-r2.md) ergänzt die Desktop-Schriftangleichung und eine direkte Chrome-Nachmessung. Die folgenden Angaben und Nachweise beschreiben den ersten Prüfstand, nicht eine menschliche Abnahme oder den abschliessenden R2-Prüfumfang.

**Der Desktopbefund ist reproduziert und lokal korrigiert.** Das Datumsfeld war 36 CSS-Pixel hoch, das benachbarte Fristfeld und einzeilige Dropdowns 32 CSS-Pixel. Die Standardhöhe wurde in der gemeinsamen Oberfläche auf 32 Pixel angeglichen. Das ist keine neue E-/Q- oder P-Bereitstellung.

## Änderung und geschützte Funktionen

Die Produktänderung besteht ausschliesslich aus `height: 36px` → `height: 32px` in [styles.css](../../src/ui/styles.css). Kalender- und Hilfsschaltfläche übernehmen die Höhe bereits über das bestehende Flexlayout. Bei der Browsermessung stimmen Ober- und Unterkanten mit dem benachbarten Fristfeld überein. Die Labels benötigten keine Änderung.

Unverändert bleiben Schriftgrösse 16 Pixel, linksbündige Eingabe, zweispaltiger Grundaufbau, responsive Anordnung, Fokusmarkierung, Datumsparser, Kürzel, Enter/Tab/Blur, Kalenderwahl, Fehlerbehandlung und Ergebnisinvalidierung. Mehrzeilige Dropdowns dürfen weiterhin wachsen. Rechenlogik und Rechtsdaten sind unberührt.

**Die 44-Pixel-Regel bei `pointer: coarse` bleibt ausdrücklich erhalten.** Auf solchen Touchgeräten bleibt das Datumsfeld damit bewusst höher als die bisher 32 Pixel hohen Fluent-Nachbarfelder. Eine Vereinheitlichung sämtlicher Touchfelder wäre eine weitergehende Gestaltungskorrektur und ist hier nicht vorgenommen. Der akzeptierte iPad-/Magic-Keyboard-Befund wird nicht neu geöffnet.

## Lokale Nachweise

Geprüft wurde ein neuer lokaler Webbuild aus dem tatsächlichen MVP-0.8-Einstieg und dessen freigegebenen Laufzeitdaten. Die gebundenen Releaseartefakte wurden nicht neu erzeugt oder ersetzt. Die ältere allgemeine UI-Vorschau mit MVP-0.7-Daten wurde nicht als MVP-0.8-Hostnachweis verwendet.

| Prüfung | Ergebnis |
| --- | --- |
| Browsergeometrie DE, leeres Feld | Vorher Datum 36, Fristfeld 32. Nachher beide 32 Pixel mit gleicher Oberkante |
| Browsergeometrie DE, editierbare Tagesfrist | Datum, Kalender-/Hilfsknopf und Fristfeld jeweils 32 Pixel |
| DE Fehlerzustand | Ungültiges Datum bleibt sichtbar, Fehlermeldung unter dem Feld, Höhe unverändert |
| Datumskürzel und Fokus | `5` mit Tab wurde am Prüftag zu `05.10.2026`, Fokus wechselte ins Nachbarfeld. `h` mit Enter wurde zu `18.10.2026` |
| FR Desktop und 390-Pixel-Ansicht | 32-Pixel-Standardhöhe, kein horizontaler Seitenüberlauf, schmale Ansicht ausdrücklich kein realer iOS-Nachweis |
| Kalender in schmaler FR-Ansicht | Tastaturöffnung und Auswahl von `19.10.2026` erfolgreich |
| Bestehende AP21-Regression | 52 Tests bestanden, keine Fehler und keine übersprungenen Tests |
| Neue CSS-Vertragsprüfung | Drei Tests bestanden. Standardhöhe, erhaltene Touchhöhe, Typografie und variable Dropdownhöhe geprüft |
| Vollständige Produktregression | 2’544 Tests bestanden, keine Fehler und keine übersprungenen Tests. Die 52 AP21- und drei neuen Stiltests sind darin enthalten, nicht zusätzlich zu zählen |
| TypeScript | `tsc --noEmit` bestanden |

Die [Browsermessungen](../../outputs/ux-50-2026-10-18/browser-messungen.json), [AP21-Tests](../../outputs/ux-50-2026-10-18/ap21-tests.txt), [CSS-Vertragsprüfungen](../../outputs/ux-50-2026-10-18/style-contract-tests.txt), [Produktregression](../../outputs/ux-50-2026-10-18/product-tests.txt) und Bilder liegen in einem neuen Nachweisordner. Die neuen [Tests](../../tests/ui/issue50-date-field-height.test.ts) prüfen den CSS-Vertrag, nicht vermeintliche jsdom-Pixelgeometrie. Historische AP21-Nachweise bleiben unverändert.

## Offene Abnahme und spätere Hostprüfung

Die lokale Sichtabnahme durch David steht aus. Der begrenzte Nachtest auf den tatsächlichen SharePoint-/Teams-Hosts, bei Vergrösserung und auf realen Mobilgeräten folgt mit dem nächsten ausdrücklich freigegebenen E-/Q-Kandidaten. Issue #50 wird deshalb noch nicht als vollständig abgeschlossen behandelt. Auf P bleibt der abgenommene Stand von MVP 0.8 unverändert.

Die lokale Vorschau unter `http://127.0.0.1:8801/fristenrechner/` zeigt den neuen CSS-Arbeitsstand mit unveränderten MVP-0.8-Daten. Sie ist kein Releaseartefakt und setzt einen laufenden lokalen Vorschauprozess voraus.
