# AP18B-04 Ost – ZH, SH, TG, SG, AR und AI

Prüfdatum: 13. September 2026. Arbeitsmappenvertrag: 0.5.0. Status: quellenbasierter Erfassungskandidat, fachlich offen und für Produktwirkung gesperrt.

## Ergebnis und Grenzen

83 zusätzliche Regelzeilen in zehn klar getrennten Profilen. Davon sind zwölf verfahrensbezogene Anwendungen und 71 öffentliche beziehungsweise arbeitsrechtliche Feiertagsanwendungen. Ein Feiertag kann in mehreren Profilen vorkommen. Die Zahl bezeichnet keine unterschiedlichen Feiertage oder verfahrensübergreifende Jahresliste.

| Kanton | Profil | Regelzeilen | Abgrenzung |
| --- | --- | ---: | --- |
| ZH | RLG-Ruhetage | 12 | Neun namentliche Nichtsonntagstage und drei zusätzlich benannte hohe Sonntage |
| ZH | GOG-Fristenliste | 10 | Eigenständige gesetzliche Liste einschliesslich 2. Januar, keine automatische Verfahrenszuordnung |
| SH | RTG-Ruhetage | 12 | Neun namentliche Nichtsonntagstage und drei zusätzlich benannte hohe Sonntage |
| SH | ZPO-Ergänzung | 1 | Nur Berchtoldstag, kein vollständiges Feiertagsprofil |
| TG | RTG-Ruhetage ab 2026 | 13 | Zehn namentliche Nichtsonntagstage und drei zusätzlich benannte hohe Sonntage |
| SG | RLG-Ruhetage | 12 | Einschliesslich Allerheiligen, ohne 1. Mai |
| SG | ZPO-Ergänzung | 1 | Nur Berchtoldstag, kein vollständiges Feiertagsprofil |
| AR | Arbeitsfeiertage, unbedingter Teil | 7 | Einschliesslich Bundesfeiertag, Stephanstag nicht generiert |
| AI | Kantonsweite RTG-Tage, unbedingter Teil | 14 | Einschliesslich Bundesfeiertag und benannter hoher Sonntage, Stephanstag nicht generiert |
| AI | Innerer Landesteil, Ergänzung | 1 | St. Mauritius am 22. September, keine vollständige regionale Liste |

Die Quellenaufnahme erweitert weder die freigegebene Fachlogik noch den Produktvertrag. Sämtliche neuen Regeln haben `status=open`, `exportClass=blockedEffect`, keine Freigabereferenz und kein übernommenes fachliches Einverständnis. `from=2026-01-01` begrenzt das Erfassungsfenster. Das ist ausser beim ausdrücklich neuen Thurgauer Gesetz keine Aussage zum historischen Inkrafttreten. Quellenstand und Prüfdatum werden gesondert geführt.

Gewöhnliche wöchentliche Sonntage werden nicht als Serie dupliziert. Ausdrücklich gesetzlich benannte hohe Sonntage sind enthalten. Verwaltungsinterne Schliessungs- und Personaltage bilden keine zusätzliche allgemeine Feiertagsliste. Kommunale Feiertagssetzung wurde nicht erhoben. Kantonales Recht mit örtlicher Geltung bleibt dagegen im Umfang.

## Amtliche Normen und Quellenstände

| Quellen-ID | Amtliche Grundlage und gelesene Fundstelle | Stand / Funktion |
| --- | --- | --- |
| `SRC-ZH-RLG-8224-N045` | [RLG, LS 822.4, § 1 Abs. 1–3](https://www.notes.zh.ch/appl/zhlex_r.nsf/WebView/663A7F8F1929F218C1256EB7002E6A05/%24File/822.4_26.6.00_45.pdf) | Nachtrag 045, Publikationsstand 01.07.2004. ZH-Lex führt diesen als aktuellen Text. Nicht mit der letzten einzelnen Inkraftsetzung 01.05.2004 verwechseln. |
| `SRC-ZH-GOG-2111-N131` | [GOG, LS 211.1, § 122](https://www.notes.zh.ch/appl/zhlex_r.nsf/WebView/43B3BDA36DB02CBDC1258D4C004EC591/%24File/211.1_10.5.10_131.pdf) | Nachtrag 131, 01.01.2026. Zehn Tage unmittelbar im aktuellen Text. |
| `SRC-SH-RTG-900200-V1886` | [Ruhetagsgesetz, SHR 900.200, Art. 1–2](https://rechtsbuch.sh.ch/api/de/versions/1886/pdf_file) | Konsolidierter Stand 01.01.2007. Arbeitsgesetzliche Gleichstellung wird gesondert durch Verordnung geregelt. |
| `SRC-TG-RTG-8229-V2949` | [Ruhetagsgesetz, RB 822.9, § 1–2](https://www.rechtsbuch.tg.ch/api/de/versions/2949/pdf_file) | Neuer Erlass 05.02.2025, Stand und Inkrafttreten 01.01.2026. Einschliesslich 2. Januar und 1. Mai. Aufgehobenen Vorgänger nicht verwenden. |
| `SRC-SG-RLG-5521-V228` | [RLG, sGS 552.1, Art. 2–3](https://www.gesetzessammlung.sg.ch/api/de/versions/228/pdf_file) | Konsolidierter Stand 22.01.2008. Berchtoldstag fehlt in dieser Liste. |
| `SRC-AR-ARGV-82211-V1058` | [Arbeitsverordnung, bGS 822.11, Art. 7](https://ar.clex.ch/api/de/versions/1058/pdf_file) | PDF-Stand 01.01.2016. Arbeitsrechtliche Liste mit bedingtem zweitem Weihnachtstag. |
| `SRC-AI-RTG-822200-V1327` | [Ruhetagsgesetz, GS 822.200, Art. 2–3](https://ai.clex.ch/api/de/versions/1327/pdf_file) | Konsolidierter Stand 01.01.2011. Kantonale, arbeitsrechtlich gleichgestellte und kantonal geregelte lokale Tage auseinanderhalten. |

Der bereits vorhandene Bundesfeiertagsbeleg `SRC-BUNDESFEIERTAG-19940701` wird wiederverwendet. Jede neue Anwendung bleibt dennoch fachlich offen.

## Abgrenzungen nach Kanton

### Zürich

Die [amtliche Feiertagsseite](https://www.zh.ch/de/wirtschaft-arbeit/arbeitsbedingungen/arbeitsssicherheit-gesundheitsschutz/arbeits-ruhezeiten/feiertage.html) bestätigt die neun arbeitsrechtlichen Tage und liefert Vergleichsdaten 2026. Berchtoldstag, Sechseläuten und Knabenschiessen sind keine zusätzlichen Tage dieses RLG-Profils. Der 2. Januar gehört jedoch zur getrennten GOG-Fristenliste. Beide Listen werden weder vereinigt noch als für jedes Verfahren identisch massgebend ausgegeben.

### Schaffhausen und St. Gallen

Die beiden getrennten Berchtoldstag-Ergänzungen beruhen auf konkret eingegrenzter ZPO-Rechtsprechung:

- [Obergericht Schaffhausen, OGE 40/2018/1/K vom 24.08.2018, E. 2.1.1–2.1.4, Amtsbericht 2018 S. 84–87](https://sh.ch/CMS/get/file/771a1a2e-4ef2-47bb-9b04-f4afc5aed3ea). Der 2. Januar wird für die ZPO-Fristberechnung als Feiertag anerkannt, obwohl er in der Ruhetagsliste fehlt. Das Publikationsdatum 02.02.2021 ist nicht das Entscheidsdatum.
- [Kantonsgericht St. Gallen, Einzelrichter im Familienrecht, FS.2012.1 vom 29.03.2012](https://publikationen.sg.ch/rechtsprechung-gerichte-detail/6031/). Der Entscheid behandelt die fristwahrende Einreichung nach dem Berchtoldstag im ZPO-Verfahren. Die Herleitung über das Europäische Fristenübereinkommen und damaliges Personalrecht wird nicht in eine aktuelle allgemeine arbeitsrechtliche Feiertagsregel umgedeutet.

Entscheidsuche und OpenCaseLaw wurden zusätzlich konsultiert. In einem St. Galler OpenCaseLaw-Datensatz steht als Metadatum irrtümlich 24.11.2011, das Datum des vorinstanzlichen Entscheids. Titel und Entscheidstext ergeben 29.03.2012. Der amtliche SG-Direktabruf lieferte bei der abschliessenden Abrufprobe HTTP 403. Der Entscheidstext war über den erschlossenen Volltextbestand zugänglich. Der Schaffhauser amtliche Volltext wurde direkt gelesen und nennt den St. Galler Entscheid ebenfalls.

Die Ergänzungen sind keine selbstständigen vollständigen Kalender. Insbesondere bleibt die Übertragung auf StPO, BGG, ATSG und kantonales Verwaltungsrecht offen.

### Appenzell Innerrhoden: lokale Geltung aus kantonalem Recht

Maria Himmelfahrt, Allerheiligen und Maria Empfängnis stehen im kantonalen Ruhetagsgesetz als lokale Feiertage. Nur St. Mauritius wird dort auf den inneren Landesteil begrenzt. Diese kantonal gesetzten Tage bleiben deshalb im vereinbarten Umfang. Ihre allgemeine öffentliche Ruhetagsqualität darf nicht mit der arbeitsrechtlichen Sonntagsgleichstellung gleichgesetzt werden. Die [amtliche Erläuterungsseite](https://ai.ch/themen/wirtschaft-und-arbeit/feiertage-ruhetage) bestätigt diese Unterscheidung.

Die [amtliche Gebietstabelle, Einwohnerbestand 31.12.2025](https://ai.ch/land-und-leute/innerrhoden-in-zahlen) nennt Appenzell, Schwende-Rüte, Schlatt-Haslen und Gonten als inneren Landesteil. Die vier Bezirke sind einzeln erfasst und durch einen gesonderten Gebietsbeleg mit der Feiertagsnorm verknüpft. Oberegg wird nicht eingeschlossen. Wonnenstein und Grimmenstein erscheinen in statistischen Fussnoten. Daraus wird keine selbstständige Interpretation von Feiertagsgeltung auf Klosterparzellen und keine parzellenscharfe Geodatenfreigabe abgeleitet.

Der 22. September für St. Mauritius wird durch die [amtliche Liste kommender Feiertage](https://ai.ch/themen/wirtschaft-und-arbeit/feiertage-ruhetage/feiertage) belegt. Er ist eine zusätzliche feste Datumsregel innerhalb des bestehenden Vertrags, kein neuer Rechentyp. 2. Januar, Freitag nach Auffahrt sowie 24. und 31. Dezember aus dem Verwaltungsschliessungskalender sind nicht enthalten.

## Zwei ausdrücklich nicht generierte Fälle

| ID | Lücke | Behandlung |
| --- | --- | --- |
| `AP18B04-AR-STEPHAN-CONDITION` | Art. 7 Arbeitsverordnung schliesst den zweiten Weihnachtstag aus, wenn Weihnachten auf Montag oder Freitag fällt. Der Vertrag 0.5.0 kennt keine entsprechende Wochentagsbedingung. | `contractGap`. Keine feste Dezemberregel und keine endliche Sammlung von Jahresersatzregeln. |
| `AP18B04-AI-STEPHAN-CONDITION` | Das Gesetz verhindert drei aufeinanderfolgende Ruhetage durch die Feier des Stephanstags. Gleichzeitig nennt die amtliche Terminliste den Samstag 26.12.2026 als sonntagsgleichgestellten Feiertag. Hinzu kommt die technische Bedingungslücke. | `sourceConflict`. Norm und Liste stehen transparent nebeneinander. Keine stillschweigende Vorrangannahme als Rechenfreigabe. |

Der [Bericht der Standeskommission vom 29.09.2015, Ziff. 4.3 S. 7](https://ai.ch/themen/wirtschaft-und-arbeit/feiertage-ruhetage/dokumente/20150929-stk-bericht-feiertage.pdf) erläutert ausdrücklich Samstag und Dienstag als Ausschlusstage des Stephanstags. Das stützt die Konflikterkennung für 2026, ersetzt aber nicht die heutige Normprüfung. Der Bericht wird als Materialie, nicht als aktueller Erlass geführt.

Beide IDs sind zusätzlich in `pendingCases` und in gesperrten Mapping-Zeilen enthalten. AR und AI werden ausdrücklich als unvollständige Teilprofile bezeichnet. Die kalendertechnische Lücke ist vor einer späteren Vervollständigung durch einen begrenzten Vertragsentscheid zu lösen. Bei AI braucht es zusätzlich die Auflösung des amtlichen Quellenwiderspruchs.

## Sprache und Prüfung

DE/FR/IT/RM werden mit vorhandenen Feiertagsbezeichnungen befüllt. Neue Kantons- und Bereichsbezeichnungen sowie die vier Bezeichnungen für St. Mauritius sind provisorische Produktübersetzungen, keine neu behaupteten amtlichen Sprachfassungen. Es besteht keine Sprachabnahme.

Die automatisierten Prüfungen enthalten unabhängige Soll-Listen je Profil und Datumswerte für alle 83 Regeln in 2026, 2027 und 2028. Hinzu kommen Ausschlüsse, getrennte Verfahrensprofile, Referenzschutz, vier konkrete AI-Gebietszuordnungen, sichtbar verknüpfte Lücken, fehlende automatische Freigabe und Prüfung gegen Vertrag 0.5.0. Diese technische Prüfung ist keine juristische Abnahme.

Artefakte: `scripts/ap18b-04-east.mjs` und `tests/calendar-rules/ap18b-04-east.test.mjs`.
