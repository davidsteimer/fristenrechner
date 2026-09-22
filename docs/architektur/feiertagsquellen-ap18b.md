# AP18B: Sequenzielle Erhebung der Feiertagsquellen

**Aktueller Nachtrag vom 22. September 2026:** [AP18B-05](erfassung-ap18b-05.md) setzt vier bedingte Datumsfälle gemäss bestätigter Fachvorgabe um und erhält den präzisierten NE-Vorbehalt. V0.12 enthält 479 Regeln. Die folgenden Abschnitte dokumentieren die früheren Erfassungsstände, deren damalige fünf offene Fragen damit einen dokumentierten Ausgang haben.

Stand: 13. September 2026. Start durch David Steimer ausdrücklich beauftragt. Ein wesentlicher Arbeitsgegenstand, höchstens fünf Nettoarbeitstage je Quellenpaket. Fachverantwortung und Freigabe: David Steimer. Codex ist Arbeitsinstrument ohne eigene Freigabekompetenz.

## 1. Auftrag und Reihenfolge

AP18B befüllt die bestätigte [Arbeitsmappenstruktur](feiertagsmatrix-ap18a.md) schrittweise mit amtlichen Feiertagsregeln. Die V0.4 mit Vertrag 0.4.0 bleibt unverändert als frühere Strukturreferenz erhalten. Die Dateirevision V0.5 erweitert den Datenumfang, nicht das Spaltenschema oder einen Produktvertrag. V0.6 verbessert ausschliesslich die Prüfbarkeit der beiden Rheinfelder Gemeindegruppen. V0.7 ergänzt den TI-/GR-Erfassungsentwurf. V0.8 ergänzt ausschliesslich acht provisorische RG-Namen und deren Hinweise. Die aktuelle V0.9 setzt den ausdrücklich bestätigten Arbeitsmappenvertrag 0.5.0 um und ergänzt anschliessend VS, FR, SO und GE.

Erstes Paket ist **AP18B-01: Aargau**. Es vervollständigt die bereits vorhandenen drei Strukturbeispiele zu vollständigen Listen der beiden bezeichneten Normen. Das prüft die neue Gebietstrennung an einem tatsächlich regional und sachlich unterschiedlichen Kanton. Nach Durchsicht der Arbeitsmappe hat David Steimer am 13. September 2026 das Vorgehen für den ersten Mehrkantons-Batch **AP18B-02: Tessin und Graubünden** bestätigt und die GR-Modellgrenze präzisiert. Die [Abgrenzung und Quellenprüfung](../fachrecht/quellenpaket-ap18b-02-ti-gr-abgrenzung.md) hält dies fest. Die Erfassung ist anschliessend ausdrücklich beauftragt und als V0.7 zur Fachprüfung vorbereitet. 22 Kantone bleiben «Nicht erhoben». Der Start des Folgepakets ändert keine früheren Fachstatus und ist keine nachträgliche AG-Datenfreigabe.

## 2. AP18B-01: Lieferumfang und Vollständigkeitsgrenze

[Arbeitsmappe V0.6, Quellenpaket AG](../../outputs/ap18b-01-ag-2026-09-13/2026-09-13_Feiertagsmatrix_Schweiz_AP18B-01_AG_V0.6.xlsx)

Auf Wunsch von David Steimer vom 13. September 2026 nennt die Spalte «Gebiet» bei `AG-ARG-RHEINFELDEN-E1` und `AG-ARG-RHEINFELDEN-E2` die Gemeinden unmittelbar. Die Listen stammen aus den bereits erfassten Gebietszuordnungen. Quellen-ID und Fundstelle bleiben separat erhalten. V0.5 bleibt unverändert archiviert. Es handelt sich um eine Darstellungsrevision ohne geänderte Zuordnung, Regel oder Freigabe.

[Amtlicher Quellennachweis und Vergleichsmatrix](../fachrecht/quellenpaket-ap18b-01-ag-entwurf.md)

| Gegenstand | Erfasster Umfang |
| --- | --- |
| § 6 Abs. 1 EG ArR, SAR 961.200 | Alle acht Normzweige a, b1, b2, c, d, e1, e2 und f, mit jeweils acht kantonalen Feiertagen |
| § 21 Abs. 1 EG ZPO, SAR 221.200 | Alle 14 genannten prozessualen Feiertage, kantonsweit und getrennt vom Arbeitsrecht |
| Bundesfeiertag | Bestehende Bundesregel zusätzlich in den acht arbeitsrechtlichen Kalenderausprägungen. Die ZPO-Liste enthält ihn selbst und wird nicht um eine zweite Zeile erweitert |
| Datenfenster | 2026–2028, aus dem am 13.09.2026 erhobenen Recht. Beginn 01.01.2026 bezeichnet das Prüfzeitfenster, nicht das Inkrafttreten der Erlasse |
| Gebietserfassung | 29 Zuordnungen insgesamt, davon sechs unveränderte Pilotzuordnungen und 23 Ergänzungen. Keine amtlichen Kennungen erfunden |
| Sprache | Bestehende DE-/FR-Konvention. Neue französische Namen sind Produktübersetzungen und nicht als amtliche Erlassübersetzungen bezeichnet. IT/RG bleiben leere, editierbare Erfassungsfelder |

Die präzise Aussage lautet: **Die Listen nach § 6 EG ArR und § 21 EG ZPO sind im bezeichneten Umfang vollständig erfasst.** Das bedeutet weder «Aargau in allen Rechtsgebieten vollständig» noch «AG-Fristenberechnung freigegeben».

Die Mappe enthält insgesamt 90 Regelzeilen: zwölf unveränderte CH-/BE-Referenzregeln und 78 offene AG-Regeln. 75 AG-Regelzeilen kommen zu den drei bestehenden AG-Beispielen hinzu. Die Kalenderansicht hat 99 Zeilen, darunter neun Tage je arbeitsrechtlichem AG-Geltungsbereich und 14 prozessuale AG-Tage. Dasselbe Datum darf in unterschiedlichen Rechtsbereichen mehrfach belegt sein, im selben Kalenderprofil aber nicht doppelt wirken.

## 3. Fachliche und technische Grenzen

- Neue Regeln, Quellen, Geltungsbereiche und Gebietszuordnungen erhalten kein `approved`. Der pauschale Transfer der Arbeitsrechtslisten in den Fristenrechner bleibt `blocked`. Die konkrete ZPO-Orts-/Profilanknüpfung und ihre Freigabe bleiben `open`.
- Auch die Übernahme einer bereits freigegebenen CH-Regel in einen neuen AG-Kalender wird in der Kalenderansicht als `open` angezeigt. Regelfreigabe und neue Anwendung werden nicht gleichgesetzt.
- Bestehende Regel-, Quellen-, Geltungs- und Zuordnungs-IDs bleiben erhalten. Die drei alten AG-Regelobjekte werden nicht fachlich verbreitert. Neue Normzweige erhalten eigene IDs.
- Die e1-/e2-Gemeinden verweisen auf den Kanton als nächstes erfasstes übergeordnetes Gebiet. Ihre tatsächliche Zugehörigkeit zum Bezirk Rheinfelden ist in der Quellenmatrix dokumentiert. Die begrenzte Erfassung behauptet keinen vollständigen amtlichen Verwaltungsgebietsbaum.
- Eigenständige kommunale Normen, Halbfeiertage anderer Kantone, Personal- und Schulferien, Gemeindesuche und Geodaten bleiben ausserhalb des Pakets.
- Der Kalender verwendet ausdrücklich vorbereitete Regel-/Geltungszuordnungen. Die neue Gebietstabelle ist noch kein Geocoder. Nach manuellen Änderungen an Zeilenbestand, IDs oder Geltungsbereichen muss der Kalender kontrolliert neu erzeugt werden.
- Das Paket enthält keinen XLSX-Importer für beliebige manuelle Änderungen, keinen JSON-Kandidatenexport und keine Consumer-/Runtime-Änderung. Diese Gegenstände bleiben AP18C vorbehalten.
- Historische AP13-Ereignisse bleiben unverändert. Neue Quellenprüfungen stehen nur als `candidate` in der Arbeitsmappe und ändern den freigegebenen Governance-Index nicht.

## 4. Prüfung und Reproduzierbarkeit

Der vorhandene Builder erhält den Modus `--ag-package` und beginnt mit der tatsächlich gespeicherten V0.4. Das zusätzliche Modell `scripts/ap18b-ag-model.mjs` leitet die neuen offenen Erfassungsdaten ab. Es verändert weder das bisherige Seed-Modell noch die unveränderlichen Kalenderdateien des freigegebenen Releases.

Die paketbezogene Prüfung kontrolliert insbesondere alle acht Normzweige, die 14 prozessualen Tage, die Bundesfeiertagsbehandlung, Gebietsmitglieder, Vollständigkeitsgrenzen sowie Status und fehlende Freigabebasis auf sämtlichen AG-Datenebenen. Die vorhandenen AP18A-Tests allein werden nicht als vollständige Absicherung dieser neuen Felder ausgegeben.

Die Tabellenbibliothek bearbeitet Inhalte und Formeln und berechnet die Ergebnisse. `scripts/finalize-ap18b-ag.py` übernimmt ausschliesslich die deklarierten Änderungen in die ursprüngliche native Paketstruktur, erweitert Tabellen- und Validierungsbereiche und ergänzt den Quellenhyperlink. Die bestehende Style-Datei bleibt bytegleich. Ein unabhängiger, rein lesender Prüfer kontrolliert die gespeicherte Datei. Wiederimport, Neuberechnung und visuelle Prüfung ergänzen die native Paketkontrolle.

```bash
node --import tsx --test tests/calendar-rules/ap18a-workbook-model.test.mjs tests/calendar-rules/ap18a-area-assignments.test.mjs tests/calendar-rules/ap18b-ag-model.test.mjs
```

Der [QA-Nachweis V0.5](../../outputs/ap18b-01-ag-2026-09-13/QA-AP18B-01.md) bindet die ursprüngliche Paketdatei per Prüfsumme und nennt den tatsächlich geprüften Umfang. Der [Ergänzungsnachweis V0.6](../../outputs/ap18b-01-ag-2026-09-13/QA-AP18B-01-V0.6.md) dokumentiert die vier Textänderungen und den Erhalt aller übrigen Inhalte. Die Reproduktion erfolgt mit `--municipality-labels`, `scripts/finalize-ap18b-labels.py` und anschliessendem `--municipality-labels --verify`. Eine erneute native Excel-Nutzerprüfung ist kein bereits durchgeführter Test.

## 5. Fachabnahme des Quellenpakets

David Steimer prüft die acht Normzweige, die gesonderte prozessuale Liste, die Gebietsausnahmen, den Quellenbezug und die dargestellten Grenzen. Eine Abnahme dieses Quellenpakets bestätigt die Erhebung, nicht automatisch eine neue Rechtsprofilzuordnung oder einen Datenrelease. Offene Punkte können gezielt ausgeschlossen werden, statt sie als vollständige Daten zu tarnen.

Das anschliessende begrenzte Kantonsquellenpaket AP18B-02 mit Tessin und Graubünden ist in Abschnitt 6 dokumentiert. Für GR gilt die dokumentierte Annahme ausschliesslich für den bezeichneten VRG-Kontext vor kantonalen Behörden, nicht als allgemeiner rechtlicher Ausschluss lokaler Ruhetage. Die AP18B-Gesamterhebung, AP18C und die gemeinsame Releasevorbereitung bleiben offen. Es wurden weder Commits veröffentlicht noch E-/Q-/P-Umgebungen verändert.

## 6. AP18B-02: Tessin und Graubünden

[Erhaltene Arbeitsmappe V0.8, Quellenpaket TI/GR](../../outputs/ap18b-02-ti-gr-2026-09-13/2026-09-13_Feiertagsmatrix_Schweiz_AP18B-02_TI_GR_V0.8.xlsx) · [QA der Sprachergänzung](../../outputs/ap18b-02-ti-gr-2026-09-13/QA-AP18B-02-V0.8.md) · [Unveränderte V0.7](../../outputs/ap18b-02-ti-gr-2026-09-13/2026-09-13_Feiertagsmatrix_Schweiz_AP18B-02_TI_GR_V0.7.xlsx) · [QA des Erfassungsstands V0.7](../../outputs/ap18b-02-ti-gr-2026-09-13/QA-AP18B-02.md)

| Gegenstand | Ergänzung in V0.7 |
| --- | --- |
| Tessin | 15 offizielle Feiertage nach Art. 1 RL 843.200. Arbeitsrechtliche Einteilung 9/6 nach Art. 6 LALL separat. Begrenzte LPAmm-Zuordnung mit Vorbehalten nach Art. 1 Abs. 2 und 3 |
| Graubünden | Zehn kantonale Anlässe aus Art. 2 Ruhetagsgesetz und eine offene Anwendung der vorhandenen Bundesfeiertagsgrundlage. Keine gewöhnlichen Sonntagszeilen und keine Verdoppelung hoher Feiertage |
| Modellumfang | Insgesamt 116 Regeln und 125 Kalenderzeilen, 13 Geltungsbereiche und 31 Gebietszuordnungen. Alle 26 neuen Regeln bleiben `open` mit `blockedEffect` |
| Sprache | DE/FR/IT/RG weiterhin direkt nebeneinander. TI-IT und GR-DE/IT/RG quellenbasiert. Produktübersetzungen separat kenntlich. Die acht in V0.7 noch fehlenden TI-RG-Namen sind in V0.8 auf Nutzerwunsch provisorisch ergänzt |
| Datumsnachweise | Regelberechnung für 2026–2028 geprüft. TI zusätzlich alle 30 Jahresdaten 2026/2027 amtlich abgeglichen. Die 2028-Daten sind ausdrücklich rechnerische Projektionen bei unverändertem Recht |
| Bestandsschutz | V0.6 bleibt unverändert. Die bisherigen 90 Regeln, 99 Kalenderzeilen sowie die direkten Rheinfelder Gemeindelisten werden in V0.7 unverändert übernommen |

Die Kategorien und das Spaltenschema des Arbeitsmappenvertrags 0.4.0 bleiben unverändert. Die arbeitsrechtliche Einteilung und die hohe Feiertagseigenschaft sind zusätzliche fachliche Merkmale, keine neuen exklusiven Exportkategorien. Der GR-VRG-Volltext ist anhand der aktuellen Version 3521 gesichert. Die begrenzte Annahme zu lokalen Tagen bleibt im Verfahrensbezug sichtbar, einschliesslich der weiterhin offenen Ortsfrage `OF-008`.

Die Quellenvermerke [Tessin](../fachrecht/quellenpaket-ap18b-02-ti-quellen.md) und [Graubünden](../fachrecht/quellenpaket-ap18b-02-gr-quellen.md) liefern Normfundstellen, sprachliche Herkunft und Kontrollfälle. Das Modell führt die Sprachbelege zusätzlich pro Regel und Sprache. Die Quellenblätter der Mappe nennen deren Beweisfunktion. Amtliche Namen anderer Kantone werden nicht als Tessiner Amtssprache ausgegeben.

Für die Reproduktion dient `scripts/build-ap18a-workbook.mjs --ti-gr-package` mit der unveränderten V0.6 als Ausgangsdatei. `scripts/finalize-ap18b-ag.py --ti-gr-package` erhält die nativen Tabellen, Formate und Validierungen. `scripts/check-ap18b-ti-gr-workbook.py` prüft die gespeicherte Datei unabhängig und rein lesend. Der anschliessende Wiederimport mit `--ti-gr-package --verify` berechnet alle drei Prüfjahre erneut und erzeugt die visuellen Prüfansichten.

**Sprachergänzung V0.8:** Auf Nutzerwunsch werden die acht fehlenden RG-Namen provisorisch verwendet. Der [Sprachvermerk](../fachrecht/sprachergänzung-ap18b-02-rg.md) unterscheidet sechs belegte Sprachverwendungen und zwei eigene Übersetzungsvorschläge. Die Namen stehen ohne Zusatz im Namensfeld, der provisorische Status in den Hinweisen. V0.7 bleibt unverändert. Für diese eng begrenzte Revision dienen der Builder mit `--ti-gr-rg-provisional`, `scripts/finalize-ap18b-labels.py --ti-gr-rg-provisional` und der unabhängige Prüfer `scripts/check-ap18b-rg-labels.py`. Der Wiederimport mit `--ti-gr-rg-provisional --verify` kontrolliert die tatsächliche Zielkopie. Keine Datumsregel und kein Rechts- oder Freigabestatus ändern sich.

Die Fachabnahme dieses Pakets ist offen. Es gibt keinen JSON-Export, keine neue Kantonsauswahl in der App, keine Stillstandsfreigabe und keine Änderung an E, Q oder P. Die Erhebung weiterer Kantone bleibt in AP18B, die kontrollierte technische Übernahme in AP18C.

## 7. AP18B-03: Wallis, Freiburg, Solothurn und Genf

David Steimer bestätigt am 13. September 2026 diese nächste Kantonsgruppe und beauftragt zunächst ausdrücklich den Modellcheck. Der [Modellbericht](modellcheck-ap18b-03.md) ist abgeschlossen. Der anschliessend ausdrücklich bestätigte [Arbeitsmappenvertrag 0.5.0](../entscheidungen/DEC-2026-021-arbeitsmappenvertrag-050.md) ergänzt einen Datumstyp, den strukturierten Tagesumfang und gezielte Validatoranpassungen. Struktur, Migration und Tests wurden auf ausdrücklichen Auftrag vor der Erfassung umgesetzt und geprüft.

Die aktuelle SO-Rechtsgrundlage ist gegenüber den früheren historischen Paragraphenverweisen berichtigt. FR benötigt weiterhin getrennte regionale Arbeits- und kantonsweite Prozesslisten. Die Genfer Folgetagsregel wird aufgrund ihrer sachlichen Grenze und des geprüften Strafrechtsentscheids nicht als allgemeine Feiertagsautomatik übernommen.

Die [Arbeitskopie V0.9 und der technische Nachweis](erfassung-ap18b-03.md) enthalten 76 zusätzliche offene Regeln, davon 13 VS, 33 FR, 21 SO und neun GE. Insgesamt sind es 192 Regeln und 201 Kalenderzeilen. Acht neue Geltungsprofile und die konkret genannten Freiburger Gemeinden und Ortsteile ergänzen die bestehende Gebietsstruktur. 18 Kantone bleiben nicht erhoben. Die Quellenpakete [VS/GE](../fachrecht/quellenpaket-ap18b-03-vs-ge.md) und [FR/SO](../fachrecht/quellenpaket-ap18b-03-fr-so.md) dokumentieren Vollständigkeitsgrenzen und offene Fristwirkungen.

**Abnahme vom 13. September 2026:** David Steimer hat die gesamte V0.9 in der vorliegenden Form [fachlich abgenommen](../fachrecht/abnahme-ap18b-03.md) und ausdrücklich festgehalten, dass der Solothurner Halbtag keinen Einfluss auf den Fristenlauf hat. AP18B-03 ist abgeschlossen. V0.8 sowie die abgenommene V0.9 bleiben unverändert erhalten. Die gespeicherten Prüfstatus werden nicht rückwirkend geändert. Die übrigen Kantone, AP18C und jede produktive Übernahme bleiben offen. WIP 1 und höchstens fünf Nettoarbeitstage je Teilpaket bleiben bestehen.

## 8. AP18B-04: Die verbleibenden 18 Kantone

Auf ausdrücklichen Folgeauftrag von David Steimer wurde die [Restkantonserfassung](erfassung-ap18b-04.md) in drei internen Recherchegruppen durchgeführt. Die Referenz V0.9 und Vertrag 0.5.0 bleiben unverändert. [Ost](../fachrecht/quellenpaket-ap18b-04-ost.md) ergänzt 83 Regeln, [Zentral](../fachrecht/quellenpaket-ap18b-04-zentral.md) 126 und [West](../fachrecht/quellenpaket-ap18b-04-west.md) 73. Der neue Stand umfasst damit 474 profilbezogene Regeln und 483 Kalenderzeilen für Bund und alle 26 Kantone.

Die Erhebung aller Kantone ist keine Vollständigkeits- oder Produktfreigabe. Fünf Prüffragen in AR, AI, GL und NE bleiben mit ID, amtlicher Fundstelle und klarer Nichtgenerierung beziehungsweise Quellenlücke dokumentiert. Sie werden nicht durch unbedingte Fixdaten verdeckt. Eigenständige kommunale Normen, weitere Fachrechtsverbindungen und die separate Kalender-App bleiben ausserhalb des Auftrags.

Die konsolidierte V0.10 ist technisch und visuell geprüft und liegt mit [Prüfbericht](../../outputs/ap18b-04-restkantone-2026-09-13/QA-AP18B-04-V0.10.md) zur fachlichen Durchsicht vor. Ihre Abnahme, ein allfälliger begrenzter Vertragsnachtrag für Bedingungen, die zusätzlichen Jahresquellen und AP18C bleiben getrennte Folgeschritte. Es werden keine Commits veröffentlicht und keine freigegebenen Installationen geändert.

**Folgerückmeldung vom 13. September 2026:** David Steimer hat keine fachlichen Fehler gefunden und beauftragt die Vervollständigung der Übersetzungen auch ohne amtliche Sprachquellen. Die [Sprachergänzung V0.11](../fachrecht/sprachergänzung-ap18b-04.md) schliesst 315 leere Sprachfelder. Vorhandene Rechts- und Datumsregeln sowie technische Freigabestatus bleiben unverändert. Die fünf offenen Fragen werden durch die Sprachergänzung nicht geschlossen.
