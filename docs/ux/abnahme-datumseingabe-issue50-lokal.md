# Lokale Abnahme der Datumseingabe zu Issue 50

Datum: 18. Oktober 2026. Entscheider: David Steimer.

David Steimer hat erklärt: **«Jetzt passt es, danke. Die lokale UX-Korrektur ist abgenommen.»** Die zweite lokale Darstellungskorrektur ist damit abgenommen. AP23E1 für Luzern, Zug und Appenzell Ausserrhoden ist anschliessend ausdrücklich beauftragt.

## Abgenommener Umfang

- Desktop: 32 CSS-Pixel Rahmenhöhe und dieselbe 14-Pixel-Schriftfamilie wie die benachbarten Eingabefelder, einschliesslich Platzhalter und eingegebenem Datum.
- Grober Zeiger: unverändert 44 Pixel Rahmenhöhe und 16 Pixel Schrift.
- Unveränderte Linksbündigkeit, Eingabehilfen, Parser, Ereignislogik und Fristberechnung.

Die Abnahme bezieht sich auf die lokale Vorschau unter `http://127.0.0.1:8801/fristenrechner/`. Der [R2-Nachweis](datumseingabe-hoehe-issue50-r2.md) bleibt mit seinem damaligen Vorlagestatus unverändert. Für den neuen Abnahmestatus ist diese Notiz massgebend.

## Gebundener lokaler Stand

| Gegenstand | SHA-256 |
| --- | --- |
| [R2-Nachweis](datumseingabe-hoehe-issue50-r2.md) | `c82c82b9ed1551901d1d385935aacbb1dbf7b88627a14afce72ff014544062ea` |
| [Gemeinsames Stylesheet](../../src/ui/styles.css) | `98d503207f4ae43c22c9ed241a4fb4e34177b624750f0cc8868b85614ba4b6be` |
| [AP21-Eingabetests](../../tests/ui/ap21-date-input.test.tsx) | `28980d8610b1dbfbbce0d35671fe5640273489d2118f30da903b71983e04387d` |
| [Höhen- und Schriftprüfungen](../../tests/ui/issue50-date-field-height.test.ts) | `35292ac01bed1d298af38b243add3876ff721feb8fbbfd336ea01656c0027074` |
| [Browsermessung](../../outputs/ux-50-2026-10-18-r2/chrome-messung.json) | `382f1a876fff4c872e36f1b1f1b8915d7f59b8bdf667f0fc5e3dbd78497db64f` |
| [55 fokussierte Tests](../../outputs/ux-50-2026-10-18-r2/focused-tests.txt) | `dce1fa22e1a1c6abcafeab2573fae4dfa88ac177b4fb9ac209a4e96c029b7e61` |

## Verbleibende Releaseprüfungen

Die tatsächlichen SharePoint-/Teams-Hosts, Zoom und reale Geräte werden mit dem späteren E-/Q-Kandidaten geprüft. Diese Abnahme ersetzt weder diese Nachweise noch die Release- oder Betriebsfreigabe. [Issue #50](https://github.com/davidsteimer/fristenrechner/issues/50) bleibt deshalb offen.

E/Q/P, freigegebene Rechtsdaten und gebundene MVP-0.8-Artefakte bleiben unverändert. Kein Commit, Push, Upload oder Deployment. David Steimer nimmt die Sichtprüfung in Personalunion wahr. Codex dokumentiert die Erklärung ohne formelle Freigabe- oder Haftungsverantwortung.
