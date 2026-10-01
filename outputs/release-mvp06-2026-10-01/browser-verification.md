# MVP 0.6 · lokale Browserstichprobe

Datum: 1. Oktober 2026. Status: **Die nachstehenden lokalen Stichproben sind bestanden. Keine Zielumgebungsprüfung oder Betriebsfreigabe.**

## Tatsächlicher Prüfgegenstand

Chrome unter macOS, ausschliesslich `http://127.0.0.1:4186/fristenrechner/`. Grundlage ist das unverändert entpackte definitive Webarchiv `artifacts/fristenrechner-mvp06-steimer-web.zip`, SHA-256 `3b54e098124649e18036303d38747f41b6374d913182766197fe65d34789d2ae`. Alle zwölf entpackten Dateien wurden anschliessend byteweise gegen das Artefaktinventar geprüft. Kein QA-Kandidat und keine vorbelegten Fallparameter in der URL.

Die Dateien wurden für diese lokale Funktionsprüfung durch einen einfachen HTTP-Testserver ausgeliefert. Er wertet die mitgelieferte Apache-Konfiguration nicht aus. Dieser Lauf ist deshalb ausdrücklich kein Nachweis der Sicherheitsheader, der Cachepolitik oder des Verhaltens auf Green.

## Beobachtete Prüfungen

| Prüfung | Tatsächliche Beobachtung |
| --- | --- |
| Normaler Einstieg | Angezeigt wird `2026-10-01-mvp-06-approved.1`. Empfangsdatum zunächst leer, StPO und zehn Tage als Ausgangseinstellung. Kein automatisch erzeugtes Ergebnis |
| Native Datumseingabe | `16.09.2026` über die sichtbaren nativen Datumssegmente eingegeben. Tatsächlicher DOM-Wert danach `2026-09-16` |
| StPO | Direkte Zustellung 16.09.2026, zehn Tage. Beginn 17.09., rechnerisches Ende 26.09., sichtbarer Fristablauf **28.09.2026**, Endverschiebung «Ja» |
| Gestufte Auswahl | Wechsel auf VRPG und Sozialversicherungsrecht. Empfangsdatum bleibt erhalten, altes Resultat entfällt. Alle elf Sozialerlasse, darunter EOG, FamZG, FLG, MVG und ÜLG, sind in der Auswahlliste sichtbar |
| MVG | Individuelle Leistung, Einsprache gegen Verfügung, Wohnsitz bei Zustellung ausdrücklich BE, Partei BE ohne Vertretung. Feste Fristdauer 30 Tage. Ergebnis **16.10.2026**, Berechnungsregel «MVG · Einsprache gegen Leistungsverfügung» |
| Französisch | Derselbe MVG-Fall erscheint mit französischen Beschriftungen und «LAM · Opposition à une décision de prestations», unverändertes Ende **16.10.2026**. Kalenderknopf «Créer le fichier calendrier» sichtbar |
| ÜLG-Wechsel | Nach Wechsel auf ÜLG werden Handlung und spezifische Fallangaben wieder abgefragt, das Zustellungsdatum bleibt erhalten. Kein Übernehmen des MVG-Wohnsitzfelds als ÜLG-Durchführungskanton |
| ÜLG | Einsprache gegen Verfügung, Durchführungskanton ausdrücklich BE, Partei BE ohne Vertretung. Ergebnis **16.10.2026**, Berechnungsregel «ÜLG · Einsprache gegen Leistungsverfügung» |
| Ausserkantonale Sperre | Beim ÜLG-Verwaltungsfall den Durchführungskanton auf ZH geändert. Die Berechnung zeigt die fehlende geprüfte Berner Anbindung als Sperrgrund, keinen Endtermin und **null Kalenderexport-Schaltflächen** |
| Neuladen | Normaler leerer Datumseinstieg wieder sichtbar, StPO, zehn Tage und kein Ergebnis. Kein festes Testdatum gespeichert |
| Sichtkontrolle | Desktopansicht am tatsächlichen Build kontrolliert. Eingaben und vier gleich breite Schaltflächen im zweispaltigen Raster, Berechnung vor automatischen Parametern |

## Technische Beobachtungen und Grenzen

Die generische Browsersteuerung konnte das native Datum zunächst nicht vollständig setzen. In einem Zwischenzustand waren einzelne Segmente befüllt, aber das Datum ungültig. Die Anwendung verhinderte die Berechnung erwartungsgemäss. Die gezielte Tastatureingabe in die sichtbaren Datumssegmente war erfolgreich. Es wurde keine Anwendungseingabe durch Skriptinjektion, direkte React-Zustandsänderung oder einen QA-Preset ersetzt.

Einzelne Steuerungsaufrufe nach dem Neuladen überschritten ihr Zeitlimit. Die anschliessende DOM-Aufnahme bestätigte den normalen leeren Ausgangszustand. Die Konsolenabfrage wurde dadurch nicht zuverlässig abgeschlossen und wird nicht als fehlerfreie Laufzeitkontrolle ausgegeben. Die technische Ursache dieser Steuerungsgrenzen wurde nicht abschliessend untersucht.

Die Stichprobe ist kein vollständiger manueller Durchlauf aller fünf neuen Erlasse oder aller 50 Anbindungen. Diese sind im lokalen automatisierten Freigabe- und Paketprüfumfang enthalten. Gespeicherte ICS-Dateien, Outlook, echte Browserstorage-Werte, Mobilansicht, Mirrorabrufe, SharePoint, Teams und B2B-Gastzugriff wurden in dieser Browserstichprobe nicht erneut geprüft. Die entsprechende E-/Q-Matrix bleibt offen. Es wurden keine Standards gespeichert, keine Kalendertermine importiert und keine externen Systeme verändert.
