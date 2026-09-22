# AP18B-03: Modellcheck VS, FR, SO und GE

| Merkmal | Stand |
| --- | --- |
| Auftrag | David Steimer, 13. September 2026, Modellcheck vor der Erfassung |
| Ergebnis | Prüfung abgeschlossen. Zwei fachliche Strukturerweiterungen und gezielte Validierungsanpassungen empfohlen |
| Verbindlichkeit | Arbeitsmappenvertrag 0.5.0 am 13.09.2026 durch David Steimer bestätigt, dokumentiert in DEC-2026-021. Kein neuer Produktvertrag |
| Ausgangspunkt | Arbeitskopie V0.8, Arbeitsmappenvertrag 0.4.0, Kalenderkomponente 2.0.0 |
| Umfang | VS, FR, SO und GE. Keine Vollerhebung, keine Änderung der Arbeitsmappe oder der App |
| Verantwortung | David Steimer in Personalunion. Codex als Arbeitsinstrument |

## 1. Ergebnis und Empfehlung

**Nachtrag zur Entscheidung:** David Steimer hat den nachfolgenden begrenzten Vorschlag ausdrücklich bestätigt und «zuerst Struktur und Tests, danach VS, FR, SO und GE» beauftragt. [DEC-2026-021](../entscheidungen/DEC-2026-021-arbeitsmappenvertrag-050.md) hält dies fest. Die ursprünglichen Prüfresultate und Empfehlungen bleiben als Entscheidungsgrundlage erhalten.

**Spätere Fachabnahme vom 13. September 2026:** Nach Umsetzung hat David Steimer die gesamte V0.9 in der vorliegenden Form abgenommen und festgelegt, dass der Solothurner Halbtag keinen Einfluss auf den Fristenlauf hat. Die [Abnahmenotiz](../fachrecht/abnahme-ap18b-03.md) bindet den unveränderten Prüfgegenstand. Die nachfolgend dokumentierte ursprüngliche Recherche und ihre damaligen offenen Fragen werden nicht rückwirkend umgeschrieben. Die SO-Halbtagsfrage ist durch diesen Fachentscheid erledigt, die übrigen Profilfragen und die produktive Übernahme nicht.

Die vorhandene Trennung von Rechtsgeber, Gebiet, Feiertagsregel und Verfahrensbezug trägt den nächsten Batch. Kantons-, Bezirks-, Gemeinde- und Ortsteilbezüge erfordern keine neue Tabellenhierarchie. Regionale Arbeitsfeiertage und kantonsweite Prozessfeiertage müssen weiterhin getrennte Regel- und Geltungszuordnungen erhalten.

Vor der Erfassung empfehle ich eine begrenzte Erweiterung des **Arbeitsmappenvertrags auf 0.5.0**:

1. Ein ausdrücklicher Datumstyp für einen Monatswochentag mit zusätzlichem Tagesabstand, benötigt für den Genfer Bettag.
2. Ein strukturiertes Feld für den normativen Tagesumfang, benötigt für den Solothurner 1. Mai ab 12.00 Uhr.
3. Passende Validierung statt ignorierter Zusatzfelder und eine belegbare Trennung zwischen Normquelle und räumlichem Anwendungsbeleg.

Die ersten beiden Punkte erweitern die fachliche Darstellung. Punkt 3 macht die vorhandenen Quellenfelder und neuen Angaben verlässlich prüfbar. Es braucht dafür keine neuen Arbeitsblätter, keine konfessionsabhängige Benutzerauswahl und keinen Stundenrechner.

**Korrektur der Vorplanung:** Eine allgemeine bedingte Feiertagsverschiebung wird für Genf nicht vorgezogen. Die Sonntagsfolgetagsregel für bestimmte Unternehmen bleibt als abgegrenzter Quellenbefund dokumentiert, nicht als generische Fristenregel. Der unten belegte Bundesgerichtsentscheid ist hierfür wesentlich.

## 2. Amtliche Grundlagen und Modellfolgen

Quellenstand der Prüfung: 13. September 2026. Fassungsstand, Publikationsdatum und Abrufdatum sind unterschiedliche Angaben.

| Kanton | Geprüfte Grundlage | Modellfolge |
| --- | --- | --- |
| VS | [RPflG, SGS 173.1, Version 3260](https://lex.vs.ch/api/fr/versions/3260/pdf_file), Stand 01.01.2024, Art. 37. Verweist auf Bundesrecht und kantonales Ruhegesetz samt Reglement und ergänzt 2. Januar, Oster- und Pfingstmontag sowie 26. Dezember | Eigener prozessualer Geltungsbereich, getrennt von der allgemeinen Feiertagsgrundlage. Keine neue Rechenart nötig. Konkrete Bundesrechtsprofile bleiben separat zuzuordnen |
| FR | [BAMG, SGF 866.1.1, Version 8126](https://bdlf.fr.ch/api/de/versions/8126/pdf_file), Stand 01.01.2020, Art. 49. Daneben [JG, SGF 130.1, Version 7926](https://bdlf.fr.ch/api/de/versions/7926/pdf_file), Stand 01.01.2024, Art. 121 | Regionale arbeitsrechtliche Listen und eine eigene kantonsweite prozessuale Liste. Die Rechtskategorie und der Verfahrensbezug sind massgebend, nicht die persönliche Konfession |
| SO | [RTG, BGS 512.41, Version 4319](https://bgs.so.ch/api/de/versions/4319/pdf_file), Stand 01.09.2014, § 2 Abs. 1 Bst. b und Abs. 2. Ergänzend die [amtliche Fristenliste 2026](https://so.ch/allgemeine-informationen/gesetzliche-feiertage/) | Bezirksausnahme Bucheggberg ist räumlich darstellbar. Der 1. Mai ab 12.00 Uhr benötigt einen strukturierten Tagesumfang. Daraus folgt noch keine automatische ganztägige Fristwirkung |
| GE | [LJF, RSG J 1 45](https://silgeneve.ch/legis/data/rsg_j1_45.htm), Stand 01.01.1991, Art. 1 und amtliche Fussnote zum Genfer Bettag | Feste Tage sind bereits darstellbar. Der Bettag ist der erste Sonntag im September plus vier Tage. Art. 1 Abs. 2 hat einen getrennten, begrenzten Anwendungsbereich |

### Wallis: kein Verwaltungskalender als Ersatz für die Normen

Das [Ruhegesetz 822.2](https://lex.vs.ch/api/de/versions/2105/pdf_file), Stand 01.03.2013, und das [Ausführungsreglement 822.200](https://lex.vs.ch/app/fr/texts_of_law/822.200/versions/2108?all_languages=true&diff=split), Stand 02.12.1966, sind von [Art. 7 VEkArG, 822.100](https://lex.vs.ch/api/de/versions/2103/pdf_file), Stand 01.10.2016, zu unterscheiden. Das Reglement verweist auf kirchlich bestimmte gebotene Feiertage und nennt einzelne Tage. Seine sprachliche Formulierung wird bei der Erfassung nicht ohne Prüfung als abschliessende Liste umgedeutet.

Karfreitag ist in diesen namentlichen Listen und in der Ergänzung von Art. 37 RPflG nicht genannt. Die [personalrechtlichen freien Tage nach Art. 29, SGS 172.4](https://lex.vs.ch/data/172.4/fr), aktuelle Fassung seit 01.05.2026, sind kein selbständiger Nachweis einer allgemeinen prozessualen Feiertagswirkung. Andere konkrete Verfahrensgrundlagen bleiben zu prüfen. Personalfreitage und Schliesszeiten werden nicht in die Feiertagsregeln aufgenommen.

### Freiburg: Ortsteilbeleg und Prozessliste getrennt

Die [amtliche Feiertagsübersicht, Stand 06.07.2026](https://www.fr.ch/de/arbeit-und-unternehmen/arbeitnehmer/feiertage), ordnet Flamatt und Sensebrügg innerhalb Wünnewil-Flamatts dem reformierten Gebiet zu. Die übrige Gemeinde darf nicht ohne Beleg mitzugeordnet werden. Die Struktur `Ortsteil` unter `Gemeinde` existiert bereits. Die Übersicht ist ein amtlicher Anwendungsbeleg, nicht der in diesem Check nicht erhobene einzelne Staatsratsbeschluss nach Art. 49 Abs. 4 BAMG.

Die eigene Liste nach Art. 121 Abs. 2 JG gilt kantonsweit. Abs. 3 nimmt strafrechtliche Stundenfristen von Abs. 1 aus. Diese Grenze gehört in den Verfahrensbezug, eröffnet aber keinen Stundenrechner. Mehrere Rechtsbelege für dasselbe Datum dürfen innerhalb eines später ausgewählten Fristenprofils nicht mehrfach zählen.

### Solothurn: Quellenkorrektur und offene Tageswirkung

Die früheren Projektverweise auf § 1 Abs. 1 Bst. c und § 4 RTG, Version 3717, betreffen den **aufgehobenen Erlass von 1964**. Für die weitere Erfassung gilt der Erlass von 2014 mit § 2. Die [Aufhebung und Inkraftsetzung](https://bgs.so.ch/app/de/change_documents/989) sind amtlich dokumentiert. Die frühere spezifische Gemeindeermächtigung für Oster- und Pfingstmontag entspricht nicht vollständig der heutigen allgemeinen Ermächtigung zu zusätzlichen kommunalen Ruhetagen. Historische Nachweise bleiben erhalten, werden aber nicht als aktuelles Recht verwendet.

Die aktuelle kantonale Fristenliste nennt den 1. Mai ab 12.00 Uhr. Damit ist auch die pauschale Aussage «ohne Fristrelevanz» nicht gerechtfertigt. Wie der Halbtag bei einer konkreten Tagesfrist wirkt, bleibt vor der Profilfreigabe zu klären.

Das auf derselben Seite verlinkte [BJ-Verzeichnis, Stand 01.01.2011, Seiten 15–16](https://so.ch/fileadmin/internet/administrator/dokumente/Gesetzliche_Feiertage.pdf), enthält zusätzliche prozessuale Gleichstellungen, darunter den 1. Mai sowie bestimmte Feiertage im Bucheggberg. Die [Hinweise vom 17.12.2012](https://so.ch/fileadmin/internet/administrator/dokumente/Gesetzliche_Feiertage_-_Hinweise_zum_Verzeichnis.pdf) begrenzen seinen Anwendungsbereich. Das ist ein Prüfhinweis, keine aktuelle generelle Ganztagsfreigabe. Eine begrenzte Entscheidsuche ergab keinen belastbaren Solothurner Entscheid zur offenen Einzelwirkung. Daraus folgt keine Aussage, dass es keinen solchen Entscheid gibt.

### Genf: Folgetag nicht automatisch fristverlängernd

[BGer 7B_32/2023 vom 06.09.2023](https://search.bger.ch/ext/eurospider/live/it/php/aza/http/index.php?highlight_docid=aza%3A%2F%2F06-09-2023-7B_32-2023&lang=it&type=show_document&zoom=NO), E. 4.3.2, 4.4 und 5.2, bestätigt im beurteilten Strafverfahren den Ablauf am 02.01.2023. Art. 1 Abs. 2 LJF und die geschlossene Gerichtskanzlei begründeten keine Verlängerung auf den 03.01.2023. Die kantonale Auslegung wurde unter dem einschlägigen Willkürmassstab geprüft. Der Entscheid ist ein konkreter Gegenbeleg zur pauschalen Folgetagsautomatik, keine Vollprüfung aller Prozessordnungen.

Der Volltext wurde über Entscheidsuche und im amtlichen Bundesgerichtsangebot abgeglichen. OpenCaseLaw war nicht als aufrufbares MCP-Werkzeug verfügbar. Ein öffentlicher Suchabruf lieferte keinen verwertbaren Nachweis.

**Folgerung:** Keine allgemeine Regel «Sonntagsfeiertag wird auf Montag verschoben». Den Nicht-ArG-Bezug als Quellen- und Ausschlusshinweis erfassen. Falls später ein eigener arbeits- oder personalrechtlicher Kalender verlangt wird, braucht dessen Folgetagsregel eine gesonderte Umsetzung samt Jahreswechsel- und Kollisionsfällen. Das ist nicht Voraussetzung dieses Fristenrechner-Batches.

## 3. Technischer Ist-Check

Die tatsächliche V0.8 wurde rein lesend importiert. Untersucht wurden die Tabellenüberschriften, die Datumsformeln und die zugehörigen Modell- und Validatorfunktionen. Die neun Blätter bleiben unverändert.

| Bedarf | Tatsächlicher Stand | Konsequenz |
| --- | --- | --- |
| Fixdatum, Osterabstand, n-ter Monatswochentag | Drei implementierte Datumstypen, in Excel und `ruleDate()` | Für die normalen VS-/FR-/SO-Tage und den 31. Dezember ausreichend |
| Erster Sonntag im September plus vier Tage | Keine solche unterstützte Rechenart. Ein zusätzliches `offsetDays: 4` bei `nthWeekdayOfMonth` wird vom Basisrechner ignoriert | Neuer ausdrücklicher Typ. Den alten Typ nicht still umdeuten |
| Gesetzlicher Tagesabschnitt | Kein entsprechendes Tabellenfeld. Ein zusätzliches `dayPortion` am Regelobjekt wird vom Basisvalidator nicht beanstandet und beeinflusst das Datum nicht | Strukturiertes Feld plus strikte Feldprüfung erforderlich |
| Gemeinde- und Ortsteilzuordnung | Synthetisches Beispiel wird akzeptiert, falscher Elternbezug abgewiesen | Keine zusätzliche Gebietsebene erforderlich. Noch keine automatische Ortsauflösung |
| Normquelle und räumlicher Anwendungsbeleg | Separate Quellenfelder vorhanden, aber der Seed-Validator verlangt identische Quellen-IDs für Geltungsbereich und Gebietszuordnung | Validator gezielt öffnen für belegte Quellenbeziehungen. Keine erfundene Normfundstelle und kein Entfernen der Quellenprüfung |
| Anwendung auf ein Rechtsprofil | Freitext und Status im Verfahrensbezug, noch kein ausführbarer Zuordnungsvertrag | Für die kontrollierte Erhebung ausreichend. Vor Export und Automatik bleibt AP18C erforderlich |
| Laufzeitformat 2.0.0 | Neue Berechnungs- und Tagesumfangsfelder durch das JSON-Schema ausgeschlossen. Ereignisse sind ganztägige Feiertage | Nicht verlustbehaftet exportieren. Die spätere Consumer-/Formatentscheidung bleibt getrennt |

Technische Belege: [Basisrechner und Validator](../../scripts/ap18a-model.mjs), [Gebietsvalidator](../../scripts/ap18a-area-assignments.mjs), [Arbeitsmappen-Builder](../../scripts/build-ap18a-workbook.mjs), [Kalenderschema 2.0.0](../../schemas/calendar-rules-v2.schema.json), [Kalendertypen](../../src/core/calendarRuleTypes.ts) und [Generator](../../src/core/generateCalendar.ts).

Die Paketvalidatoren schützen den bisherigen festen AG-/TI-/GR-Erfassungsstand zusätzlich durch exakten Vergleich. Der Befund zu ignorierten Feldern betrifft den Basisvalidator und begründet eine Anforderung für den nächsten Erfassungsvertrag. Er ist kein Nachweis, dass der produktive Release neue Felder ungeprüft importiert.

Der interne Seed trägt noch `contractVersion: 0.1.0`, während die gespeicherte Arbeitsmappe den Arbeitsvertrag 0.4.0 ausweist. Der Marker ist deshalb keine zuverlässige Versionsprüfung der tatsächlichen Datei. Bei der nächsten Revision ist die Arbeitsmappenversion explizit zu führen und anhand ihrer Header zu prüfen. Historische Seeds werden nicht nachträglich umetikettiert.

## 4. Minimaler Vertragsvorschlag 0.5.0

| Änderung | Vorgeschlagene Semantik |
| --- | --- |
| Neuer Typ `nthWeekdayOffsetDays` | Anker aus Monat, ISO-Wochentag und Vorkommen, danach ganzzahliger Kalendertagsabstand. Genf: Monat 9, Sonntag 7, Vorkommen 1, Abstand 4 |
| Spalte `Osterversatz` umbenennen in `Tagesabstand` | Bestehende Osterwerte bleiben inhaltlich unverändert. Derselbe Parameter wird beim neuen Typ verwendet. Bei Fixdatum und altem Monatswochentag muss das Feld leer sein |
| Neue Spalte `Tagesumfang` | Zunächst genau `fullDay` und `afternoonFromNoon`, angezeigt als «Ganztägig» und «Ab 12.00 Uhr». Zweiter Wert bedeutet lokalen Zeitraum 12.00 Uhr bis Tagesende. Keine automatische Fristwirkung |
| Kalenderanzeige | Tagesumfang sichtbar aus der Regel übernehmen. Der Name allein darf den Halbtag nicht verbergen. Datum bleibt ein reines, sortierbares Datum |
| Strikte Typprüfung | Erlaubte Felder und Pflichtparameter je Typ prüfen. Unbekannte oder sachfremde Parameter abweisen. Ungültige Datumsanker und Resultate ausserhalb der unterstützten Reichweite nicht normalisieren |
| Quellenbezug | Unterschiedliche Quellen-IDs für Norm und Gebietsbeleg zulassen, wenn beide vorhanden und der Zusammenhang geprüft ist. Fremde oder unbelegte Zuordnungen weiterhin abweisen |

Für den neuen Datumsabstand bietet sich derselbe begrenzte Integerbereich wie beim bisherigen Osterabstand an. Monats- und Jahreswechsel sowie die zeitliche Regelgeltung sind vor Freigabe ausdrücklich zu testen. Der 400-Jahre-Check unten belegt nur den konkreten Genfer Fall, nicht schon diesen gesamten neuen Vertrag.

Die unveränderten bisherigen Regeln erhalten bei einer kontrollierten Migration `fullDay`. Dies ist gegen den tatsächlichen Bestand zu prüfen, nicht als pauschaler Default für neue oder unbekannte Daten. Neue Einträge müssen ihren Tagesumfang ausdrücklich angeben. Die vier Sprachspalten bleiben an ihrer bisherigen Position.

Kein neues Blatt und keine allgemeine Bedingungssprache. Eine neue Rechtskategorie für Personalurlaub wird nicht eingeführt. Die SO-Tagesfristwirkung bleibt getrennt als offen dokumentiert und für die Automatik gesperrt. Die bestehenden CH-/BE-Regelfreigaben bestätigen keine neu hinzugefügten Metadaten oder künftigen Profilzuordnungen.

## 5. Durchgeführte Nachweise und nächste Grenze

| Nachweis | Ergebnis |
| --- | --- |
| V0.8 vor und nach Prüfung | SHA-256 unverändert: `d3e3bac17464733fa7bc3c42e63db0b5b42502c177914d6dcd9800ba9320461f` |
| Genfer Bettag, Einzelwerte | 10.09.2026, 09.09.2027, 07.09.2028 und 05.09.2030 |
| Unabhängiger Gregorianischer Vergleich | 400 Jahre, 2000–2399, alle sieben Wochentage des 1. September. Erster Sonntag plus vier Tage stimmt mit dem Donnerstag im Fenster 5.–11. September überein |
| Gegenproben | «Erster Donnerstag» scheitert in 229, «zweiter Donnerstag» in 171 dieser 400 Jahre |
| Fehlende Typunterstützung | Neuer Typ wird heute abgewiesen. Angefügter Abstand beim alten Typ ergibt 06.09.2026 statt 10.09.2026 |
| Gebietsnachweis | Synthetische Gemeinde samt Ortsteil akzeptiert, Ortsteil direkt unter Kanton abgewiesen. Kein realer FR-Mitgliedschaftsnachweis durch diesen Test |
| Quellenvalidator | Abweichender bekannter Gebietsbeleg wird derzeit abgewiesen. Anlass für die begrenzte Validatoranpassung |
| Bestehende Regression | 201 Tests bestanden, keine Fehler oder übersprungenen Tests |

Reproduzierbar mit `node scripts/check-ap18b-03-model.mjs` aus dem Projektverzeichnis und der gebündelten Tabellenlaufzeit. Das Skript schreibt keine Dateien. Seine gezielten Gegenproben charakterisieren den Ist-Zustand und sind keine gewünschte Dauerfestschreibung der gefundenen Lücken.

Die Datumsproben sind reine Arithmetik. Sie behaupten weder historische Rechtsgeltung ab 2000 noch amtliche Feiertagsfreigaben bis 2399. Kein Excel-Export, keine neue Excel-Bedienprüfung und kein Visualisierungsumbau waren Teil dieses Checks. Der Spreadsheet-Skill wurde für den lesenden Dateiabgleich und die Trennung zwischen Quelle, Berechnung und Ausgabe verwendet.

**Nächster Entscheid:** Den begrenzten Arbeitsmappenvertrag 0.5.0 samt Validatoranpassungen bestätigen, danach Struktur und Tests umsetzen und erst anschliessend VS/FR/SO/GE erfassen. Höchstens fünf Nettoarbeitstage je Teilpaket und WIP 1 bleiben verbindlich. Eine allfällige Teilung erfolgt sequenziell.

Die Bestätigung würde weder eine SO-Ganztagswirkung noch zusätzliche Verfahrensrechte oder eine Produktformatversion beschliessen. Arbeitsmappe, Produktdaten, Mirror, E, Q und P bleiben bis zu ihren jeweiligen Folgeschritten unverändert. Die Blogidee bleibt ausdrücklich ausserhalb dieses Auftrags.
