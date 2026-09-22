# AP18: Schweizer Feiertagsgrundlage

| Merkmal | Stand |
| --- | --- |
| Auftrag | Start durch David Steimer am 13. September 2026 |
| Backlog | [Issue #36](https://github.com/davidsteimer/fristenrechner/issues/36) |
| Teilpaketstand | AP18B-05 setzt die Fachvorgaben vom 22.09.2026 um. V0.12 mit 479 Regeln und 488 Kalenderzeilen. Vier Datumsfälle bereinigt, zusätzlicher NE-Vorbehalt erhalten |
| Arbeitsstand | Vertrag 0.6.0 als technischer Kandidat. SO-Halbtag ohne Fristwirkung. V0.11 als unveränderte Eingangsreferenz. Keine produktive Datenfreigabe |
| Excel-Nutzertest | Interaktion der V0.1 und anschliessend Funktion der V0.2 am 13. September 2026 durch David Steimer bestätigt |
| Methode | HERMES 2022 agil, ein wesentlicher Arbeitsgegenstand, höchstens fünf Nettoarbeitstage pro Teilpaket |
| Fachverantwortung und Freigabe | David Steimer in Personalunion |
| Arbeitsinstrument | Codex, ohne formelle Freigabe- oder Haftungsverantwortung |

## 1. Auftrag und Releasegrenze

**Aktuell, 22. September 2026:** [AP18B-05](erfassung-ap18b-05.md) bereinigt die vier berechenbaren Datumsfälle in AR, AI, GL und NE. Zusätzliche NE-Einzelfestlegungen bleiben vorbehalten. V0.12 enthält eine ausdrückliche Kalenderbedingung, deren technischer Vertrag `0.6.0` separat vorgeschlagen ist. Keine neue Produktaktivierung.

**Entwicklungsgeschichte:** David Steimer hat den [Arbeitsmappenvertrag 0.5.0](../entscheidungen/DEC-2026-021-arbeitsmappenvertrag-050.md) ausdrücklich bestätigt. Die technischen Strukturtests und der gespeicherte Excel-Strukturabgleich wurden vor Beginn der Erfassung VS/FR/SO/GE abgeschlossen. Anschliessend hat er die gesamte V0.9 [fachlich abgenommen](../fachrecht/abnahme-ap18b-03.md) und den Solothurner Halbtag als ohne Einfluss auf den Fristenlauf festgelegt. AP18B-03 ist damit abgeschlossen. Die nachfolgenden Beschreibungen älterer Versionen bleiben als Entwicklungsgeschichte erhalten.

Anschliessend hat er die [Restkantonserfassung AP18B-04](erfassung-ap18b-04.md) beauftragt und V0.10 fachlich ohne Beanstandung durchgesehen. Die [Sprachergänzung V0.11](../fachrecht/sprachergänzung-ap18b-04.md) schliesst auf seinen Folgeauftrag die 315 noch leeren Bezeichnungsfelder. V0.9 und V0.10 bleiben als unveränderte Referenzen erhalten, Vertrag 0.5.0 wird nicht erweitert. Bund und alle 26 Kantone sind erfasst. Fünf Fragen zu bedingten Datumsregeln und zusätzlichen Quellen bleiben klar bezeichnet offen. Die Gesamtmappe ist noch kein vollständig freigegebener Kalender.

Der nächste Fristenrechner-Release soll den abgenommenen AP17-Stand und eine schweizweite Feiertagsgrundlage enthalten. Die Feiertagsgrundlage umfasst eine editierbare Fachmatrix, amtliche Quellen, regelbasierte Datumsableitung und kontrolliert erzeugte Daten. Sie eröffnet nicht automatisch zusätzliche kantonale Verfahrensrechte oder bisher gesperrte VRPG-Verbindungen.

Es gelten ausschliesslich Bundesrecht und kantonales Recht. Örtliche Unterschiede werden berücksichtigt, soweit diese Rechtsgrundlagen sie vorsehen und sie für den betreffenden Anwendungsbereich relevant sind. Eigenständige kommunale Feiertagsregelungen werden nicht erhoben.

Die [Kalender-App #37](https://github.com/davidsteimer/fristenrechner/issues/37) und die [Kartenidee #38](https://github.com/davidsteimer/fristenrechner/issues/38) sind spätere Produktoptionen. Sie sind weder Lieferobjekte noch Freigabekriterien von AP18. Geodaten, eine Gemeindesuche und Kartendienste werden nicht vorgezogen.

Die bestehenden SPFx- und statischen Ausprägungen sowie die Hostinggrenze steimer.ch bleiben bestehen. Die AP17-Abnahme und DEC-2026-020 werden nicht neu aufgerollt. Datenpromotion, Commit-Veröffentlichung, Paketbau für die Bereitstellung und E-/Q-/P-Deployment bleiben gesonderte Freigabeschritte.

## 2. Schlanke Realisierung

| Paket | Ergebnis | Abnahmegrenze |
| --- | --- | --- |
| **AP18A** | Arbeitsmappenvertrag, Inventar CH und 26 Kantone, vollständig ausgefüllter CH-/BE-Feiertagspilot, kleiner AG-Strukturbeweis, Datums- und Negativtests | Struktur und Pilot durch David Steimer abnehmen. Keine neue Laufzeitkomponente |
| AP18B, sequenzielle Teilpakete | Amtliche Feiertagsregeln der übrigen Kantone, regionale und sachliche Zuordnungen, Quellenprüfung und Referenzfälle | Jedes Quellenpaket wird fachlich geprüft. Offene Teilbereiche bleiben sichtbar und dürfen keine Vollständigkeit vortäuschen |
| AP18C, bei Bedarf weiter geteilt | Kontrollierter Arbeitsmappenimport, vollständiger Validator, verlustfreier Kandidatenexport, nötige Consumer-/Formatanpassung und Kalenderintegration | Eigenständiger technischer Vertrag, Regression und fachliche Freigabe. Kein verlustbehafteter Export in das alte Format |
| Gemeinsame Releasevorbereitung | AP17 und freigegebener AP18-Umfang zusammenführen, Datenrelease, Paket und bestehende Host-Testmatrix | Ausdrückliche Freigaben und unveränderte Rückfallmöglichkeit |

Nach der Nutzerbestätigung «Jetzt ist's perfekt» zur V0.4 hat David Steimer AP18B ausdrücklich gestartet. Der Strukturteil AP18A wird damit als bestätigte Arbeitsgrundlage weiterverwendet. Dies erteilte den offenen AG-Beispielen keine fachliche Datenfreigabe. Nach dem Erfassungsstand [AP18B-01: Aargau](feiertagsquellen-ap18b.md) hat David Steimer das Vorgehen für [AP18B-02: Tessin und Graubünden](../fachrecht/quellenpaket-ap18b-02-ti-gr-abgrenzung.md) bestätigt und die Erfassung beauftragt. Dessen Erfassungsentwurf bleibt mit der provisorischen RG-Sprachergänzung in V0.8 erhalten. Anschliessend hat David Steimer den [Modellcheck AP18B-03 für VS/FR/SO/GE](modellcheck-ap18b-03.md) beauftragt und dessen begrenzten Vertrag 0.5.0 ausdrücklich bestätigt. Nach Strukturumsetzung, Tests und Erfassung hat er die gesamte vorgelegte V0.9 fachlich abgenommen. Frühere Einzeldateien und gespeicherte Prüfstatus werden nicht nachträglich geändert. Die produktive Datenfreigabe bleibt separat. Jede Kantonsgruppe beziehungsweise jedes Teilpaket bleibt auf höchstens fünf Nettoarbeitstage begrenzt.

## 3. Gelieferte AP18A-Arbeitsmappe

[Excel-Arbeitsmappe V0.4](../../outputs/ap18a-2026-09-13/2026-09-13_Feiertagsmatrix_Schweiz_AP18A_V0.4.xlsx)

Die in Excel getestete V0.1 bleibt unverändert erhalten. V0.2 ergänzt auf Wunsch von David Steimer vom 13. September 2026 Namensfelder für Italienisch und ausdrücklich **Rumantsch Grischun**, ausschliesslich in der Arbeitsmappe. Die bestehenden deutschen und französischen Werte, die Datumslogik sowie die Laufzeitdaten und Produktsprachen bleiben unverändert.

David Steimer hat anschliessend auch die Funktion der V0.2 bestätigt und die frühzeitige Gruppierung der Sprachspalten angeregt. V0.3 setzt dies in der Reihenfolge Deutsch, Französisch, Italienisch und Rumantsch Grischun um. Die bisher fehlende französische Gebietsbezeichnung wird als leeres Feld ergänzt. V0.1 und V0.2 bleiben unverändert als Referenzen erhalten. Die neue Anordnung ist keine fachliche Datenänderung oder neue Übersetzungsfreigabe.

Mit Zustimmung von David Steimer zum vorgeschlagenen Vorgehen folgt V0.4. Ein neues Blatt **Gebietszuordnungen** bildet die bestehenden Pilotgebiete als ausdrückliche Ein- und Ausschlüsse ab. Der BJ-Quellenlink wurde auf die funktionierende aktuelle Adresse umgestellt. V0.1 bis V0.3 bleiben unverändert erhalten. Diese Ergänzung ist weder eine Gesamt-Abnahme von AP18A noch eine Freigabe neuer fachlicher Zuordnungen.

Die Mappe hat neun Blätter und acht native Excel-Tabellen mit Filtern. Der ausgelieferte Stand enthält:

- 27 Gemeinwesen mit deutschem und französischem Namen
- 12 unverändert übernommene, früher freigegebene Feiertagsregeln, eine CH-Regel und elf eigene BE-Regeln
- drei **offene** AG-Einzelbeispiele, keine vollständige AG-Liste
- fünf räumliche beziehungsweise sachlich-räumliche Geltungsbereiche
- sechs offene Gebietszuordnungen zu diesen fünf Geltungsbereichen, mit fünf unterschiedlichen internen Gebiets-IDs
- fünf Quellen und vier vorbereitete Prüfnotizen
- 16 abgeleitete Kalenderzeilen für das ausgewählte Jahr, einschliesslich der Vererbung des Bundesfeiertags nach Bern
- die Jahre 2026, 2027 und 2028, voreingestellt 2027

Die übrigen 24 Kantone sind ausdrücklich «Nicht erhoben». Auch der AG-Strukturpilot ist keine abgeschlossene Kantonerhebung. Das Bundesblatt des Kalenders zeigt nur den Bundesfeiertag und behauptet keine Liste aller bei sämtlichen Bundesverfahren fristverlängernden Tage.

Die drei bestehenden Stillstandsregeln werden nicht in die Feiertagstabelle kopiert. Sie bleiben unverändert im Referenzrelease. Allgemeine Sonntage werden ebenfalls nicht als 52 zusätzliche Feiertagszeilen ausgegeben. Benannte Sonntagsfeiertage des BE-Referenzbestands bleiben erhalten.

### Bedienung und Pflege

1. Auf **Übersicht** das gelbe Feld B4 auf 2026, 2027 oder 2028 setzen.
2. Auf **Feiertagskalender** nach Gemeinwesen, Geltungsbereich, Rechtskategorie oder Fachstatus filtern. Nach Datum sortieren, soweit die verwendete Excel-Version dies unter Blattschutz zulässt.
3. Fachliche Einzelheiten stehen in **Feiertagsregeln**, **Geltungsbereiche**, **Gebietszuordnungen**, **Rechtsquellen** und **Verfahrensbezug**. Breite Fachtabellen sind horizontal scrollbar. Die erste Spalte und die Kopfzeilen bleiben fixiert.
4. Formeln, Zuordnungsstruktur und freigegebene Referenzzeilen sind gegen versehentliche Änderungen geschützt. Der Blattschutz hat kein Passwort und kann zur bewussten Weiterbearbeitung aufgehoben werden. Er ist keine Sicherheits- oder Freigabesperre.
5. **Jede fachliche Änderung verliert die frühere Freigabe.** Den betroffenen Arbeitsstatus auf `open` setzen und erneut prüfen. Die statische Freigabebasis gilt nur für den ausgelieferten unveränderten Referenzstand.
6. Änderungen an Zeilenbestand, IDs, Geltungsbereichen oder Zuordnungen benötigen eine Neugenerierung des Kalenders. Auch V0.4 ist noch kein vollständig dynamischer Excel-Import-/Exportprozess. Das neue Blatt ist eine Erfassungsgrundlage und wird noch nicht zur automatischen Ortsauflösung oder Kalendererzeugung verwendet.

Der Builder erzeugt die initiale Prüfkopie aus dem versionierten Seed und der unveränderlichen Referenz. Nach manueller Bearbeitung die Datei als neue Revision sichern, nicht durch einen erneuten Initialbuild überschreiben. Ab AP18C muss der Importvalidator die tatsächlich bearbeitete Datei prüfen. Der jetzige Modellvalidator ist kein solcher XLSX-Importer.

## 4. Facharbeitsvertrag V0.4

Die Arbeitsmappe ist ein Erhebungs- und Prüfwerkzeug, keine Laufzeitdatenquelle. Ihr Arbeitsvertrag `0.4.0` ist von Kalenderkomponente `2.0.0`, Manifest `3.0.0` und Spezialregimekatalog `3.0.0` getrennt. `0.2.0` ergänzte gegenüber `0.1.0` die Namensfelder IT/RG. `0.3.0` ordnete die Sprachspalten zusammenhängend an und ergänzte die französische Gebietsbezeichnung. `0.4.0` ergänzt die getrennte Gebietszuordnung. Ein späterer Importer muss diese Arbeitsmappenrevision ausdrücklich unterstützen und Felder anhand der Tabellenüberschriften prüfen, nicht alte Positionsbuchstaben voraussetzen.

| Blatt | Schlüssel und Inhalt |
| --- | --- |
| Übersicht | Ein einziges Kalenderjahr, Bearbeitungsumfang, Grenzen und Pflegehinweise |
| Feiertagskalender | Regel-ID als Nachschlageschlüssel, Datum, Wochentag, Zielgemeinwesen und Gebiet, Namen DE/FR/IT/RG, Rechtskategorie, Fachstatus und Quellenreferenz |
| Gemeinwesen | `CH`, `CH-BE` usw., Namen, übergeordnetes Gemeinwesen, Erfassungs- und Fachstatus, amtliche Quelle oder «Noch zu erheben» |
| Feiertagsregeln | Regel-ID, Gemeinwesen, Geltungs-ID, Namen DE/FR/IT/RG, Rechtskategorie, Rechentyp und Parameter, Gültigkeit, Priorität, Fachstatus, Freigabebasis, Aktion, Zielregel, Exportklasse, berechnetes Datum und Quellenbezug |
| Geltungsbereiche | Geltungs-ID, Gemeinwesen, Gebiet und Gebietstyp, genaue Umschreibung, Norm, Status und Datengültigkeit |
| Gebietszuordnungen | Zuordnungs-ID, Geltungs-ID, Gebiets-ID, Namen DE/FR/IT/RG, Typ, übergeordnetes Gebiet, Ein-/Ausschluss, amtliche Kennung, Gültigkeit, Quelle und Prüfstatus |
| Rechtsquellen | Quellen-ID, Erlass, genaue Fundstelle, amtliche URL, Fassungsstand, Abrufdatum, Prüfhinweis, Status und frühere Freigabebasis |
| Verfahrensbezug | Zuordnungs-ID, Geltungs-ID, Kategorie, Anwendungsbereich, Wirkung und Grenze, Norm, Status und Freigabebasis |
| Quellenprüfung | Prüf-ID, Quelle, Auslöser, Datum, Ergebnis, Vergleichsstand, Befund, Ereignisstatus, Fachverantwortung, Arbeitsinstrument und Folgemassnahme |

### Zusätzliche Sprachfelder, nur in der Arbeitsmappe

| Blatt | Deutsch | Französisch | Italienisch | Rumantsch Grischun | Pflege |
| --- | --- | --- | --- | --- | --- |
| Gemeinwesen | B | C | D | E | Je Gemeinwesencode erfassen |
| Feiertagsregeln | D | E | F | G | Je Regel-ID erfassen |
| Geltungsbereiche | C, bisher «Gebiet» | D, neu und leer | E | F | Je Geltungs-ID erfassen |
| Feiertagskalender | E, «Feiertag» | F | G | H | Aus den Namensfeldern der Regel über die stabile Regel-ID abgeleitet |

Die Sprachfelder stehen ab V0.3 direkt nebeneinander. Formelbezüge, Spaltenbreiten, Tabellen, Eingabeprüfungen, bedingte Formatierungen und Zellschutz wandern mit den jeweiligen Feldern. Die Osterhilfe AA:AB bleibt an ihrem bisherigen Platz. Die neuen Eingabefelder sind auch unter Blattschutz bearbeitbar. Fehlende Werte sind in den Erfassungstabellen leer und gelb markiert. Im Kalender erscheinen fehlende IT-/RG-Namen als «Noch zu erfassen», nicht als Null oder als stiller Rückfall auf Deutsch. Die Befüllung und sprachliche Prüfung erfolgt bei der weiteren Erhebung. Es werden noch keine Übersetzungen behauptet.

Die zusätzlichen Namen sind nicht Teil der bisherigen rechtlichen Referenzfreigabe. Der Fachstatus `approved` bestätigt keine sprachliche Freigabe neuer Namenswerte. Gesetzestitel, Rechtsfundstellen, technische Statuswerte und die Arbeitsmappen-Bedienhinweise werden durch diese Ergänzung nicht übersetzt. Es wird weder ein Sprachschalter in der App eingeführt noch ein neues Laufzeitformat aktiviert.

### Beschluss vom 13. September 2026: Rechtsgeber und Gebiet trennen

**Entscheid:** David Steimer stimmt dem Vorgehen zu, die flache Tabellenform beizubehalten, Bund und Kantone als Rechtsgeber von geografischen Gebieten zu trennen und strukturierte Gebietszuordnungen vor der breiten Kantonerhebung vorzusehen. Eine zusätzliche Runtime-Formatfreigabe wird damit nicht erklärt.

**Begründung:** Örtliche Unterschiede sind kein ausschliessliches Aargauer Merkmal. Solothurn kennt nach § 1 Abs. 1 Bst. c RTG eine Bezirksausnahme. In Freiburg unterscheidet die amtliche arbeitsrechtliche Feiertagsübersicht sogar Teilgebiete innerhalb einer Gemeinde, während Art. 121 Abs. 2 JG eine kantonsweite prozessuale Liste enthält. Die Belege und die Grenze zur kommunalen Rechtsetzung stehen im [Quellennachweis](../fachrecht/quellenpruefung-ap18a.md#5-ergänzende-strukturabklärung-und-beschluss).

**Quellenkorrektur aus AP18B-03:** Der vorstehende SO-Paragraphenverweis betrifft den aufgehobenen Erlass von 1964. Aktuell massgebend sind § 2 Abs. 1 Bst. b und Abs. 2 RTG, Version 4319. Der [Modellcheck](modellcheck-ap18b-03.md#solothurn-quellenkorrektur-und-offene-tageswirkung) dokumentiert die Korrektur. Die räumliche Strukturentscheidung bleibt bestehen, historische Arbeitsmappen werden nicht überschrieben.

**Umsetzung:** `Gemeinwesen` bleibt bei CH und 26 Kantonen. `Geltungsbereiche` enthält die fachlichen Geltungs-IDs. Das zusätzliche Blatt `Gebietszuordnungen` enthält pro Geltungsbereich und ein- oder ausgeschlossenem Gebiet eine Zeile. Das bestehende `Verfahrensbezug` bestimmt weiterhin separat die rechtliche Anwendungsgrenze.

| Spalten | Inhalt und Bedeutung |
| --- | --- |
| A–C | Stabile Zuordnungs-ID, Verweis auf Geltungs-ID und interne Gebiets-ID |
| D–G | Deutsch, Französisch, Italienisch und Rumantsch Grischun, fehlende Übersetzungen bleiben leer |
| H–I | Gebietstyp und übergeordnete Gebiets-ID. Die Hierarchie beschreibt räumliche Zugehörigkeit, keine Rechtsetzungskompetenz oder automatische Feiertagsvererbung |
| J | `include` für einschliessen oder `exclude` für ausschliessen |
| K–L | Kennungssystem und amtliche Kennung, soweit tatsächlich überprüft. In V0.4 bewusst leer. `GEO-…` ist keine behauptete BFS-Kennung |
| M–N | Inklusive Datengültigkeit von/bis. Die Werte übernehmen die bestehenden Pilot-Geltungsbereiche, ohne eine historische Gebietsdatenbank zu behaupten |
| O–R | Quellen-ID, genaue Fundstelle, Fachstatus und Prüfhinweis |

Für einen bestimmten Stichtag gilt konzeptionell: **Vereinigung der gültigen Einbezüge abzüglich der gültigen Ausschlüsse.** Die Zeilenreihenfolge hat keine Bedeutung. Ein Ausschluss muss räumlich und zeitlich von einem Einbezug desselben Geltungsbereichs umfasst sein. Wiederholte Gebiets-IDs müssen dieselbe Gebietsdefinition tragen. Bei einer veränderten Definition wird eine neue interne Gebiets-ID mit entsprechendem Gültigkeitsbezug verwendet. Ein Gebietsname allein ist kein technischer Schlüssel.

Die sechs gelieferten Zeilen bilden ausschliesslich den bisherigen Pilot ab:

| Geltungsbereich | Einbezug | Ausschluss |
| --- | --- | --- |
| CH-ALL | Bundesgebiet | keiner |
| BE-ALL | Kanton Bern | keiner |
| AG-ARG-BADEN | Bezirk Baden | Gemeinde Bergdietikon |
| AG-ARG-BERGDIETIKON | Gemeinde Bergdietikon | keiner |
| AG-ZPO-ALL | Kanton Aargau | keiner |

Alle sechs Zuordnungen beginnen mit `open`. Die frühere CH-/BE-Regelfreigabe wird nicht auf neue Gebietszuordnungen übertragen. Die neuen Zeilen sind unter Blattschutz editierbar. `approved` wird in diesem Pilotblatt bewusst nicht als Auswahl angeboten, weil ein eigenständiger Freigabenachweis noch fehlt.

`Ortsteil` und `Gebietsgruppe` sind als Strukturtypen vorgesehen. Es werden keine neuen SO-/FR-Feiertagsdatensätze, vollständigen Bezirks- oder Gemeindelisten und keine Geodaten importiert. Eine Gebietsgruppe wird nicht allein durch ihren Namen geografisch aufgelöst. Ihre Mitglieder müssen bei der weiteren Erhebung ausdrücklich belegbar zugeordnet werden. Die vollständige zeitbezogene Ortsauflösung und der kontrollierte Import bleiben AP18C vorbehalten.

**Umfangsgrenze:** Eigenständige kommunale Feiertagsfestlegungen bleiben ausgeschlossen. Eine kantonale Ermächtigung an Gemeinden ersetzt nicht die ausgeschlossene Prüfung des konkreten kommunalen Festlegungsakts. Wo die vereinbarte Quellenbasis keine vollständige Entscheidung erlaubt, wird die Lücke sichtbar gehalten und keine uneingeschränkte Automatik freigegeben.

### Rechtskategorien

| Wert | Bedeutung |
| --- | --- |
| `publicHoliday` | Allgemeiner Feiertag des genau bezeichneten Rechts- und Raumkontexts |
| `labourLawHoliday` | Arbeitsgesetzlich gleichgestellter Feiertag, ohne automatische prozessuale Wirkung |
| `proceduralEquivalentDay` | Besonderer prozessualer Feiertag beziehungsweise gleichgestellter Tag, nur in der zu prüfenden Verfahrensanknüpfung |

Die Tabelle erzeugt weder individuelle arbeitsvertragliche Freizeitansprüche noch eine verfahrensübergreifende Feiertagswirkung. Ein Datum kann mehrere rechtliche Bedeutungen besitzen.

### Status und Zeitbezug

- `approved`, `open` und `blocked` sind Arbeitsstatus. `approved` benötigt einen konkreten fachlichen Freigabenachweis und unveränderte Daten.
- `candidate`, `approved` und `withdrawn` beschreiben separat den Zustand eines AP13-Prüfereignisses.
- `unchanged`, `changed`, `unclear` und `unavailable` beschreiben das Prüfergebnis, nicht die Freigabe.
- `from` und `to` sind inklusive Grenzen. Ein leeres Ende bedeutet keine festgelegte Endgrenze, nicht eine Zusicherung ewiger Rechtsgeltung.
- Die AG-Datengültigkeit ab 2026 bezeichnet die Begrenzung des Piloten, nicht das Inkrafttreten der Norm.
- Die Jahresauswahl 2026–2028 ist die geprüfte Reichweite dieser Arbeitsmappe. Jahrhunderttests belegen nur die Datumsarithmetik, nicht historische Rechtsgeltung.

### Aktionen, Vererbung und Export

AP18A implementiert `add` sowie den unveränderten Fall «Bundesfeiertag wird nach Bern vererbt». `suppress` und `replace` sind notwendige spätere Vertragsoptionen, werden in diesem Pilot aber bewusst abgewiesen. Sie werden nicht als bereits funktionierende Auswahl angeboten. Die neue Erfassung von Gebietszuordnungen mit Gültigkeit nimmt weder ihre automatische Anwendung noch einen vollständigen Vererbungsgraphen vorweg. Konfliktauflösung, Mehrfachquellen und die vollständige zeitbezogene Ortsauflösung sind Gegenstände von AP18C, soweit die AP18B-Erhebung sie tatsächlich benötigt.

`referenceOnly` bedeutet lediglich, dass die unveränderte Referenz im bestehenden Kalenderformat darstellbar ist. Es ist keine Exportfreigabe. `blockedScope` und `blockedEffect` kennzeichnen Informationen, die der heutige Consumer nicht vollständig ausdrücken kann. **AP18A enthält keinen Kandidatenexport.**

Wesentliche räumliche oder sachliche Einschränkungen dürfen nicht in ignorierten `extensions` versteckt oder beim Export entfernt werden. Eine neue Formatversion wird erst mit einem konkreten verlustfreien Zielvertrag vorgeschlagen. DEC-2026-014 und DEC-2026-015 bleiben massgeblich.

## 5. Fachlicher Strukturbeweis Aargau

Der [Quellennachweis](../fachrecht/quellenpruefung-ap18a.md) hält die amtlichen Grundlagen fest. Die drei Einträge beweisen verschiedene Strukturbedürfnisse:

| Beispiel | Was es beweist | Was es nicht beweist |
| --- | --- | --- |
| Fronleichnam, Bezirk Baden ohne Bergdietikon | Kantonale Norm mit räumlicher Einschränkung | Keine allgemeine AG-Fristenregel |
| Berchtoldstag, Bergdietikon | Gemeindeausnahme innerhalb desselben Bezirks | Keine eigenständige kommunale Rechtsquelle |
| Allerheiligen nach § 21 EG ZPO | Sachlicher Verfahrensbezug kann von regionalem Arbeitsrecht abweichen | Keine automatische Freigabe für sämtliche AG-Verfahren |

Insbesondere darf «kein arbeitsrechtlicher Feiertag» nicht als «keine Fristverlängerung» ausgegeben werden. Die sachliche Zuordnung wird vor einem Kandidatenexport eigens abgenommen.

## 6. Technischer Nachweis

Referenz ist `2026-08-31-mvp-03-approved.1`, nicht der unveröffentlichte AP17-Kandidat. Die Prüfsummen von Manifest und beiden Kalenderdateien sind fest im Test gebunden. Die historischen `review.basis`-Texte bleiben trotz alter Kandidatenformulierung unverändert. Den damaligen Freigabestatus belegt das Approved-Manifest.

| Prüfung | Ergebnis |
| --- | --- |
| Modell- und Datumstests | 48 von 48 bestanden, keine übersprungenen Tests beim Aufruf mit `tsx` |
| Gebietszuordnungen V0.4 | 37 von 37 zusätzliche Vertragstests bestanden. Gesamtlauf 85 Tests ohne Fehler oder übersprungene Tests |
| Unabhängige CH-/BE-Parität | 2026–2028 gegen unveränderte ausgeprägte MVP-0.2-Listen und tatsächlichen TypeScript-Generator |
| Excel-Formelberechnung | 15 Regeln in drei Jahren, 45 Datumsvergleiche im gebündelten Tabellenrechner |
| Jahrhundert-Orakel | Bestehende Referenzen 1900, 2000, 2100 und 2400 für Ostern |
| Fehlerfälle | Doppelte IDs, fehlende Referenzen, fremdes Gebiet, ungültige Status, erfundene Freigabe, verlustbehaftete Exportklasse, ungültige Daten und nicht unterstützte Aktionen werden abgewiesen |
| Formelscan | Keine Fehlerzellen im ausgelieferten Stand, Export bricht bei Treffern ab |
| Native Struktur | Neun Blätter, acht Excel-Tabellen, Filter, Listenvalidierungen, Jahrvalidierung und Blattschutz ohne Passwort |
| Laufzeitwirkung | Keine Änderung an App, Manifesten, Releases, Mirror oder Hosting |

Die Tabellenbibliothek erzeugt Inhalte, Formeln und Datumsformate. Ihre dokumentierte API bietet in der verwendeten Fassung keinen Blattschutz. Die Funktion `HYPERLINK` wird ebenfalls nicht zuverlässig exportiert. Ein begrenzter OOXML-Nachschritt ergänzt deshalb Schutz- und Fixierungseinstellungen sowie fünf native Quellenhyperlinks und entfernt Autorenmetadaten. Der Nachschritt kontrolliert die gespeicherte ZIP/XML-Struktur, Tabellen, Linkziele, Fehlerzellen, Makrofreiheit und fehlende externe Datenverbindungen. Er ist kein alternativer Fachrechner. Explizit maskierte Punkte im Datumsformat sichern die Darstellung als `13.09.2026` auch im verwendeten Renderer.

Die Arbeitsmappe wurde gerendert und visuell geprüft. Der [QA-Nachweis V0.1](../../outputs/ap18a-2026-09-13/QA-AP18A.md) nennt Dateiidentität und ursprünglichen Prüfumfang. David Steimer hat danach die erwartete Funktion und problemlose Excel-Interaktion dieser Fassung bestätigt. Die Sprachergänzung hat einen eigenen [QA-Nachweis V0.2](../../outputs/ap18a-2026-09-13/QA-AP18A-V0.2.md), ergänzt um die spätere Nutzerbestätigung «Die Mappe funktioniert». Die neue Anordnung hat einen separaten [QA-Nachweis V0.3](../../outputs/ap18a-2026-09-13/QA-AP18A-V0.3.md). Die früheren Nutzerprüfungen werden weder als bereits durchgeführter nativer Test der V0.3 noch als Gesamt- oder Sprachfreigabe ausgegeben.

Reproduzierbare technische Prüfung:

```bash
node --import tsx --test tests/calendar-rules/ap18a-workbook-model.test.mjs tests/calendar-rules/ap18a-area-assignments.test.mjs
```

Der Initialbuilder `scripts/build-ap18a-workbook.mjs` benötigt die gebündelte Artifact-Laufzeit über den task-lokalen Link `.work/ap18a/node_modules`. Die Projektabhängigkeiten und die SPFx-Toolchain wurden dafür nicht verändert. Nach dem Initialbuild folgt `scripts/finalize-ap18a-workbook.py` für die beschriebenen nativen Einstellungen und die Paketprüfung. Ein erneuter Build darf keine manuell weitergepflegte Revision überschreiben.

Der Modus `--languages` liest die tatsächlich gespeicherte V0.1 ein und schreibt eine separate V0.2. Derselbe Modus des Finalizers erweitert zusätzlich nur die nativen Tabellenbereiche um die neuen Spalten und entsperrt die neuen Eingabefelder. Die verwendete Tabellen-API bietet keine dokumentierte Resize-Operation. `scripts/check-ap18a-workbook.py` prüft deshalb die erhaltenen Werte, Formeln, Zellstile, Tabellen, Validierungen und Fixierungen gegen V0.1. Das bestehende Seed-Modell und seine unveränderlichen Referenzobjekte werden nicht um Produktsprachen erweitert.

Für V0.3 führt `scripts/reorder-ap18a-workbook.py prepare` die eng begrenzte native Spaltenumordnung aus, da keine dokumentierte strukturelle Verschiebeoperation verfügbar ist. Anschliessend bearbeitet und berechnet der vorhandene Builder mit `--reorder-languages` die Zwischenmappe. `reconcile` übernimmt seine Inhalte und berechneten Werte unter Erhaltung der nativen Format-, Schutz- und Tabellenmerkmale. Der bisherige Finalizer mit seinen alten Spaltenpositionen darf nicht auf V0.3 angewendet werden. `scripts/check-ap18a-reorder.py` prüft das Endergebnis unabhängig gegen die gespeicherte V0.2. Die 210 Formeln bleiben erhalten, ihre Bezüge werden mit den Feldern verschoben.

Für V0.4 liest derselbe Builder mit `--areas` die gespeicherte V0.3 ein, ergänzt das neue Blatt und prüft erneut die 45 Datumsergebnisse. `scripts/finalize-ap18a-areas.py` erhält die bisherigen nativen Blätter, Zellstile und Tabellen, ergänzt das neue Blatt mit Zellschutz und fügt es nach `Geltungsbereiche` ein. Nur drei Hinweise auf `Übersicht`, die Prüfnotiz zur BJ-Quelle und das zugehörige Hyperlinkziel werden angepasst. Die sichtbare Linkbeschriftung bleibt unverändert. `scripts/check-ap18a-areas.py` prüft den Bestandserhalt unabhängig. Der [QA-Nachweis V0.4](../../outputs/ap18a-2026-09-13/QA-AP18A-V0.4.md) dokumentiert die finale Datei und die noch nicht wiederholte native Excel-Nutzerprüfung.

`scripts/ap18a-area-assignments.mjs` und seine gesonderten Tests prüfen die sechs vorbereiteten Zuordnungen, unter anderem Ein-/Ausschlüsse, Elternbezüge, Zyklen, Kantonsgrenzen, wiederholte Gebietsdefinitionen und Gültigkeit. Das ist ausdrücklich kein vollständiger XLSX-Importer, kein Geocoder und kein Freigabevalidator für später bearbeitete Tabellen. Die bewusst leeren amtlichen Kennungen und der fehlende Freigabenachweis werden im Seed nicht stillschweigend durch erfundene Angaben ersetzt.

## 7. Governance und nächste Entscheidung

AP18A-Quellenprüfungen sind vorbereitete Prüfnotizen. Das bestehende freigegebene AP13-Ereignis wird nicht nachträglich erweitert. Eine spätere Übernahme erhält eine neue Ereignis-ID und die menschliche Fachfreigabe. Nach AP13 ist der ordentliche nächste Jahrestermin spätestens 15. November 2027. Die zusätzlichen Auslöser neuer Geltungsbereich und neuer Datenrelease gelten bereits jetzt. Der Blick auf die beiden Folgejahre bleibt Bestandteil der periodischen Prüfung.

Die Struktur verwendet ISO-Datumswerte und stabile Gemeinwesen- und Quellenkennungen. Die Darstellung `CH-BE` wird bei einer späteren Konvertierung ausdrücklich auf das bestehende Laufzeitkürzel `BE` abgebildet. Dies ist ein projektspezifischer Facharbeitsvertrag, keine behauptete eCH-Konformitätszertifizierung. Ein eCH-Geodatenaustauschformat ist ohne Geodatenaustausch nicht erforderlich.

**Fortführung vom 13. September 2026:** David Steimer bestätigt die ergänzte V0.4 und beauftragt anschliessend ausdrücklich den Start von AP18B. Die Struktur ist damit Grundlage der weiteren Erhebung. Es wird keine fachliche Freigabe der bisher offenen AG-Daten, keine neue Produktformatfreigabe und keine Aktivierung abgeleitet. Der unveränderte AP18A-Referenzpilot bleibt archiviert. Die neue Arbeitskopie und ihre eigenen Fachabnahmekriterien stehen im [AP18B-Nachweis](feiertagsquellen-ap18b.md).
