# AP21 Einheitliche Datumseingabe

Stand: 8. Oktober 2026. Lokale Umsetzung nach Abnahme von AP22C3 implementiert. Technische Prüfung und lokale Browservorschau sind von der noch offenen realen Geräteprüfung und Abnahme getrennt. Grundlage ist der bestätigte [Bedienumfang in Issue 45](https://github.com/davidsteimer/fristenrechner/issues/45). Keine Bereitstellungs- oder Publikationsfreigabe.

## Umfang und Bedienvertrag

Alle Datumsfelder verwenden eine gemeinsame, direkt bearbeitbare Texteingabe. Das betrifft das Empfangsdatum, besondere fristauslösende Daten, den Beginn eines Beschaffungsverfahrens und zuständigkeitsrelevante Zeitpunkte. Schriftgrösse und Ausrichtung sind einheitlich und linksbündig. Das zweispaltige Layout bleibt erhalten. Ein optionaler Kalender und eine knappe aufklappbare Eingabehilfe ergänzen die Texteingabe.

| Eingabe | Übernahme |
| --- | --- |
| `5`, `05`, `16` | Tag im aktuellen Schweizer Monat und Jahr |
| `16.9`, `16.09` | Tag und Monat im aktuellen Schweizer Jahr |
| `h`, `H` | Aktuelles Schweizer Tagesdatum |
| `a`, `A` in der französischen Oberfläche | Zusätzliches Kürzel für heute, `h` bleibt gültig |
| `16.9.2025`, `16.09.2025` | Vollständiges Datum mit vierstelligem Jahr |
| Leer | Bleibt leer, keine automatische Vorbelegung |

Massgebend für Ergänzungen ist `Europe/Zurich` zum Zeitpunkt der Übernahme. Die Gerätezeitzone und ein früheres Berechnungsdatum sind dafür unerheblich. Nach der Übernahme steht ein festes vollständiges Datum im Feld. Tab oder Verlassen des Feldes übernimmt den Entwurf. Tab führt direkt ins nächste Eingabefeld, ohne die Hilfsschaltflächen einzeln zu durchlaufen. `Alt` und `Pfeil nach unten` öffnet den Kalender, `F1` die Hilfe. Beide bleiben per Maus, Touch und assistiver Bedienung erreichbar. Enter übernimmt, löst aber aus dem Datumsfeld keine Berechnung aus. «Frist berechnen» übernimmt die aktuellen sichtbaren Entwürfe gemeinsam vor der fachlichen Validierung.

Unmögliche Daten bleiben als Entwurf sichtbar und erhalten eine zugeordnete Fehlermeldung. Es gibt weder stillen Überlauf noch einen Wechsel in ein anderes Jahr. Zweistellige Jahreszahlen, trennzeichenlose Datumsfolgen und relative Ausdrücke wie `h+10` sind nicht vorgesehen. Die Tastatur erlaubt Punkt und Buchstabenkürzel.

## Technische Trennung

`dateEntry.ts` erkennt die festgelegten Formen strikt und erzeugt ausschliesslich vollständige ISO-Date-only-Werte. `DateInput` hält den Textentwurf getrennt vom bestätigten Wert. Bereits jede Entwurfsänderung entfernt ein vorhandenes Ergebnis und den zugehörigen Kalenderexport. Ungültige Entwürfe dürfen nicht den früheren ISO-Wert weiterverwenden.

Nur tatsächlich montierte Datumsfelder registrieren sich in der Eingabesitzung. Beim Submit entsteht ein gemeinsamer Datenstand aus allen sichtbaren Feldern. Berechnung und Validierung verwenden diesen Datenstand unmittelbar und warten nicht auf eine spätere React-Zustandsaktualisierung. Ausgeblendete oder abgemeldete Felder können dadurch keine alten Entwürfe zurückbringen. Die bestehende fachliche Unterscheidung der Datumsrollen bleibt erhalten. Persönliche Standards enthalten weiterhin keine Datumswerte, Eingabeentwürfe, Referenzen oder Resultate.

Der optionale Kalender verwendet vorhandene Fluent-UI-Komponenten. Die Texteingabe hängt nicht von `input type="date"` oder einem browserabhängigen `showPicker()` ab. Das vermeidet insbesondere die Abhängigkeit von nativer Formatdarstellung und eingeschränkter Picker-Nutzung in eingebetteten Hosts. Technische Grundlagen: [MDN Datumsfelder](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/date), [MDN showPicker](https://developer.mozilla.org/en-US/docs/Web/API/HTMLInputElement/showPicker) und [WAI Datumsdialog](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/examples/datepicker-dialog/). Reale Bedienbarkeit wird nicht aus diesen Beschreibungen abgeleitet, sondern separat geprüft.

## Prüfstand und Grenzen

Die lokale AP21-Vorschau verwendet unverändert das abgenommene AP22C3-Referenzbündel. Dafür besteht ein eigener Einstieg `src/public-app/ap21-main.tsx` und ein getrenntes Buildziel `.work/public-ap21` mit `deployable: false`. Die AP22C3-Abnahmekopie bleibt erhalten. Rechenkern, Rechtsregeln, Datenformate, Kandidatendaten, Produktpins und freigegebenes Installationspaket werden nicht verändert.

Automatisierte Prüfungen decken Parser, Zeitzonen, Übernahme, Zustandswechsel, Fehler, Ergebnisinvalidierung und Hostregression ab. Die React-DOM-Tests verwenden jsdom 26.1.0 als reine Entwicklungsabhängigkeit im Root-Projekt, damit sie nach dessen Installation ohne versteckte Abhängigkeit von `spfx/node_modules` laufen. Keine neue Bibliothek wird in die Anwendung ausgeliefert. Die lokale Browserprüfung ergänzt Tastatur, Kalender, Fokus und responsives Layout. Ihr Ergebnis wird im [AP21-Prüfverzeichnis](../../outputs/ap21-2026-10-08/) dokumentiert.

Für die vollständige AP21-Abnahme bleiben reale iOS-Prüfungen in Teams, Edge, Chrome und Safari, macOS-Desktopprüfungen sowie VoiceOver, Zoom und die bestehenden M365-Zielumgebungen erforderlich. Eine schmale Desktopansicht und ein simuliertes DOM ersetzen diese Nachweise nicht. Die Bereitstellung eines neuen Pakets auf E/Q ist separat freizugeben. AP21 nimmt weder einen neuen Rechtsquellenabgleich noch die endgültige MVP-0.7-Freigabe vorweg.

David Steimer entscheidet über die fachlich-technische Abnahme. Codex implementiert und dokumentiert als KI-Arbeitsinstrument ohne formelle Freigabe- oder Haftungsverantwortung. AP21 ist das einzige aktive wesentliche Arbeitspaket. Die Obergrenze von fünf Nettoarbeitstagen bleibt bestehen, Umsetzung und externe Geräteabnahme bilden getrennte Haltepunkte innerhalb dieses Pakets.
