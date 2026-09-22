# AP18B-03: Arbeitsmappenvertrag 0.5.0 und Erfassung VS/FR/SO/GE

| Merkmal | Stand |
| --- | --- |
| Auftrag und Strukturentscheid | David Steimer, 13. September 2026, [DEC-2026-021](../entscheidungen/DEC-2026-021-arbeitsmappenvertrag-050.md) |
| Reihenfolge | Struktur, Migration und Tests vor der Kantonerfassung |
| Struktur | Abgeschlossen, gespeicherte Prüfkopie erneut eingelesen und geprüft |
| Erfassung | V0.9 am 13. September 2026 durch David Steimer fachlich abgenommen. AP18B-03 abgeschlossen |
| Referenz | Unveränderte V0.8, SHA-256 `d3e3bac17464733fa7bc3c42e63db0b5b42502c177914d6dcd9800ba9320461f` |
| Grenze | Erfassungsmappe, keine Produktdaten, Veröffentlichung oder Bereitstellung |

[Arbeitsmappe V0.9](../../outputs/ap18b-03-vs-fr-so-ge-2026-09-13/2026-09-13_Feiertagsmatrix_Schweiz_AP18B-03_VS_FR_SO_GE_V0.9.xlsx) · [QA-Nachweis](../../outputs/ap18b-03-vs-fr-so-ge-2026-09-13/QA-AP18B-03-V0.9.md)

**Fachabnahme:** Die [Abnahmenotiz vom 13. September 2026](../fachrecht/abnahme-ap18b-03.md) bindet die gesamte unveränderte V0.9 per SHA-256. Sie hält zusätzlich fest, dass der Solothurner Halbtag keinen Einfluss auf den Fristenlauf hat. Die technischen Auslieferungsstatus in Datei und Erzeugungsmodell bleiben als historischer Prüfgegenstand erhalten.

## 1. Umgesetzter Strukturvertrag

Die Arbeitsmappe führt den Vertrag 0.5.0 ausdrücklich. Die vier Sprachspalten bleiben an ihrer bisherigen Position. Die neun Blätter und acht nativen Excel-Tabellen werden beibehalten.

- `Tagesabstand` ersetzt die Spaltenüberschrift `Osterversatz`. Bestehende Osterwerte ändern sich nicht.
- `nthWeekdayOffsetDays` bestimmt zuerst den n-ten ISO-Wochentag im angegebenen Monat und addiert danach −366 bis +366 Kalendertage. Das gewählte Jahr ist das Ankerjahr. Allgemeine Abstände können zu einem Datum in einem anderen Jahr führen. Bei den tatsächlich erfassten Feiertagen liegt das Datum weiterhin im gewählten Kalenderjahr.
- Der Anker muss tatsächlich existieren. Ein ungültiges fünftes Vorkommen wird nicht durch einen nachträglichen negativen Abstand geheilt.
- Die inklusive Gültigkeit wird am resultierenden Datum geprüft, nicht am Anker.
- `Tagesumfang` wird rechts an die Regeltabelle und den Kalender angefügt. Zulässig sind ausdrücklich «Ganztägig» und «Ab 12.00 Uhr». Der gespeicherte Datumsschlüssel bleibt ein ganzer Kalendertag.
- Damit der Halbtag ohne horizontales Scrollen auffällt, ergänzt die Wochentagsspalte im Kalender den Zusatz «ab 12.00 Uhr».
- Die Osterhilfsrechnung wurde von AA:AB nach AC:AD verschoben. Alle betroffenen Formeln verweisen auf den neuen Hilfsblock.
- Neue Vertragsregeln weisen zusätzliche oder unpassende Felder ab. Unterschiedliche Norm- und Gebietsquellen brauchen einen konkreten geprüften Zusammenhang. Die sichtbaren Quellen- und Hinweisfelder enthalten dessen Nachweis.

Die 116 bisherigen Regeln werden nur nach Prüfung des fest gebundenen V0.8-Bestands um `fullDay` ergänzt. Historische Seeds bleiben unverändert verwendbar. Die neuen Metadaten tragen keine zusätzliche juristische oder produktive Freigabe.

## 2. Nachweis der Reihenfolge

Vor Beginn der Kantonerfassung bestanden:

- 248 Modelltests, davon 47 neue Vertragstests
- Datumsvergleich der 116 Regeln in vier Durchläufen mit 2026, 2027, 2028 und erneut 2026, insgesamt 464 Vergleiche
- 500 Kalendervergleiche für die bestehenden 125 Kalenderzeilen
- 23 Excel-Proben zu Abständen, ungültigen Ankern, Ganzzahligkeit, Gültigkeitsgrenzen und Tagesumfang
- Erneutes Einlesen der gespeicherten Strukturkopie, wiederholte Berechnung, exakter Vergleich der Regel-Eingaben und Kontrolle der Tabellenüberschriften
- Formelfehlerprüfung ohne Treffer und visuelle Prüfung der geänderten Ansichten
- Prüfung der nativen Tabellen, Filter, Zellschutz- und Datenvalidierungseigenschaften. `styles.xml` unverändert, 6191 Zellen ausserhalb der deklarierten Änderungen erhalten

Die Herkunftsdatei bleibt unverändert. Das interne Strukturartefakt ist ein technischer Prüfnachweis, keine zweite zur Bearbeitung ausgelieferte Arbeitsmappe.

## 3. Fachliche Erfassung und Grenzen

Die Erfassung folgt den amtlichen Normlisten, nicht einem Personal- oder Betriebskalender. Für den Anwendungsbereich wird weiter zwischen allgemeinem Ruhetagsrecht, Arbeitsrecht und prozessualen Gleichstellungen unterschieden.

- **Wallis:** namentliche Grundliste und vier Ergänzungen nach Art. 37 RPflG getrennt. Keine Übernahme von personalrechtlichen Freitagen. Die gemeinsame Anwendung der beiden Teile ist im Verfahrensbezug beschrieben.
- **Freiburg:** zwei regionale Arbeitsfeiertagslisten und eine kantonsweite Liste nach Art. 121 JG. Betroffene Gemeinden und Ortsteile werden konkret genannt. Die Konfession der benutzenden Person ist kein Parameter.
- **Solothurn:** Ruhetagslisten mit und ohne Bezirk Bucheggberg. Der 1. Mai bleibt als gesetzlicher Halbtag erfasst. David Steimer hat bei der Abnahme ausdrücklich festgelegt, dass dieser Halbtag keinen Einfluss auf den Fristenlauf hat. Eigenständige kommunale Ruhetage werden nicht erhoben.
- **Genf:** die neun Tage nach Art. 1 Abs. 1 LJF. Keine allgemeine Sonntagsfolgetagsautomatik. Die Abgrenzung aus dem Modellcheck bleibt im Verfahrensbezug erhalten.

Die archivierte V0.9 enthält neue Regeln mit `open` und der Exportklasse `blockedEffect`. Diese gespeicherten Auslieferungswerte werden durch die separate Fachabnahme nicht umgeschrieben. Die Erfassung ab 2026 ist eine Datengültigkeitsgrenze der Arbeitsgrundlage, keine Behauptung, die Feiertage seien erst 2026 eingeführt worden. Übersetzungen werden nur dann als amtlich bezeichnet, wenn die jeweilige Sprachfassung tatsächlich belegt ist.

| Kanton | Getrennte Listen | Neue Regelzeilen |
| --- | --- | ---: |
| VS | Namentliche Grundliste 9, Prozessergänzung 4 | 13 |
| FR | Katholisches BAMG-Gebiet 9, reformiertes BAMG-Gebiet 9, kantonsweite JG-Liste 15 | 33 |
| SO | RTG ohne Bezirk Bucheggberg 12, RTG Bezirk Bucheggberg 9 | 21 |
| GE | Neun gesetzliche Feiertage ohne allgemeine Sonntagsersatzdaten | 9 |
| Total | Acht neue Geltungsprofile | 76 |

Die Regelzeilen zählen profilbezogene Anwendungen, nicht 76 verschiedene Feiertage. Der Gesamtstand umfasst 192 Regeln, 201 Kalenderzeilen, 21 Geltungsprofile, 37 Quellen, 37 Verfahrensbezüge, 38 Quellenprüfeinträge und 64 Gebietszuordnungen. Damit liegen Einträge für Bund und acht Kantone vor. 18 Kantone bleiben ausdrücklich nicht erhoben. Die 116 bisherigen Regeln, ihre alten Fachstatus und die acht provisorischen RG-Namen bleiben erhalten.

Für FR werden zehn Gemeinden und zwei Ortsteile konkret aufgeführt, jeweils als Einbezug der reformierten und Ausschluss der katholischen Arbeitsrechtsliste. Wünnewil-Flamatt wird nicht als gesamte Gemeinde dem reformierten Gebiet zugewiesen. Die 25 Beziehungen zwischen unterschiedlichen Norm- und Gebietsquellen sind explizit belegt. SO benötigt für diesen Batch nur Kanton und Bezirk.

Die vier Sprachspalten bleiben zusammenhängend. Neue FR-/SO-Regeln besitzen vorläufige IT-/RM-Namen. Bei VS 2. Januar sowie Genfer Bettag und Wiederherstellung der Republik fehlen die IT-/RM-Regelnamen noch. Auch die drei VS-/GE-Geltungsbeschreibungen haben dort offene Sprachfelder. Diese Lücken sind keine fehlenden Datumsregeln und werden nicht als amtliche Übersetzungen aufgefüllt.

## 4. Abschlussprüfung der gespeicherten Mappe

- Alle 270 Modelltests bestanden, davon 47 neue Vertragstests und 22 neue Batchtests.
- Nach dem Speichern erneut eingelesen. 768 Datums- und 804 Kalendervergleiche in vier Jahresdurchläufen sowie 23 gezielte Excel-Formelproben bestanden. Das gespeicherte Anzeigejahr bleibt 2027.
- Unabhängige Auswertung der tatsächlich gespeicherten W-/X-Formeln mit 1152 Vergleichen gegen separat berechnete Daten 2026–2028 bestanden.
- Neun Blätter, acht native Tabellen, vier Sprachspalten, Eingabevalidierungen, Filter, Zellschutz, Osterhilfsverweise und Quellen-Hyperlinks geprüft. Alle 2427 Formelzellen besitzen gespeicherte Werte und sind geschützt.
- Sieben negative Prüferselbsttests mit absichtlich beschädigten In-Memory-Kopien bestanden. Keine beschädigte Testmappe wurde als Datei ausgegeben.
- 57 Ansichten aus der gespeicherten Datei visuell geprüft, einschliesslich aller neuen längeren Gebiets-, Quellen- und Prüftexte. Keine notwendige Höhenkorrektur.
- V0.8 bleibt per SHA-256 unverändert. Keine Makros, externen Datenverbindungen oder neue Produktaktivierung.

Reproduktion mit dem etablierten Builder `scripts/build-ap18a-workbook.mjs --batch-03`, danach `scripts/finalize-ap18b-03.py` und dem Builder mit `--batch-03 --verify`. Erst nach bestandenem Strukturnachweis wird beim Builder `--with-cantons` ergänzt und bei Adapter sowie unabhängigem Prüfer `--batch` verwendet. Der rein lesende Prüfer ist `scripts/check-ap18b-03-workbook.py --batch --self-test`. Diese Skripte gehören zur Arbeitsmappenerstellung und -prüfung, nicht zur Produktlaufzeit.

## 5. Quellenpakete und Folgegrenze

- [VS und GE](../fachrecht/quellenpaket-ap18b-03-vs-ge.md)
- [FR und SO](../fachrecht/quellenpaket-ap18b-03-fr-so.md)
- [Modellcheck und amtliche Ausgangsbelege](modellcheck-ap18b-03.md)

Die Prüfung der gespeicherten Datei erfolgt mit Artifact-Rechenengine und unabhängigem OOXML-Abgleich. Eine native Excel-Bedienprüfung wird damit nicht behauptet. Der Spreadsheet-Skill bestimmt die Trennung zwischen Autorwerkzeug, unveränderlicher Referenz und überprüfter Ausgabedatei.

Die fachliche Prüfung dieses Erfassungsstands ist mit der dokumentierten Abnahme abgeschlossen. Sie aktiviert weder zusätzliche Verfahrensrechte noch den produktiven Kalender. Die übrigen Kantone werden weiterhin in AP18B erhoben. Arbeitsmappenimport, verlustfreier Export und allfällige Consumeranpassungen bleiben AP18C vorbehalten. Für dieses Paket wurden keine Commits veröffentlicht, keine Issues verändert und keine Installationen aktualisiert.
