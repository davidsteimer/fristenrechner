# AP18B-05: Bereinigung der bedingten Feiertagsregeln

Stand: 22. September 2026. David Steimer hat die vier Datumsregeln fachlich bestätigt und ihre Umsetzung beauftragt. Der fünfte Punkt bleibt als ausdrücklicher NE-Vorbehalt erhalten. Codex setzt diese Vorgaben um, ohne selbst eine Fach- oder Betriebsfreigabe zu erteilen.

## Abnahmenachtrag vom 22. September 2026

David Steimer hat die gesamte V0.12 und den technischen Vertragsnachtrag `0.6.0` ausdrücklich abgenommen. [DEC-2026-022](../entscheidungen/DEC-2026-022-bedingte-feiertagsregeln.md) ist beschlossen und ergänzt DEC-2026-021. Die [Abnahmenotiz](../fachrecht/abnahme-ap18b-05.md) bindet den Prüfgegenstand mit SHA-256 `d4fe89932b5d33f7f63516073668accf1a92b141a07388b559c3a6965c1aeb65` und hält Fachumfang, NE-Vorbehalt, SO-Festlegung sowie Produktgrenzen fest.

AP18B-05 ist abgeschlossen. [AP18C1](import-ap18c.md) beginnt mit dem headerbasierten Import der tatsächlichen XLSX-Datei und einem eigenständigen, verlustfreien Fachkandidaten, ohne Runtime-Aktivierung. Die nachfolgenden Abschnitte dokumentieren den vorgelegten Umsetzungsstand unverändert. Deren damaliger Kandidatenstatus und noch ausstehende Abnahme sind durch diesen Nachtrag überholt, nicht aber die Grenzen gegenüber Produktkalenderformat, Datenpromotion und Deployment. AP18C ist noch nicht abgeschlossen.

## Ergebnis und Grenze

Die Arbeitsmappe V0.12 ergänzt fünf Regelzeilen. Sie enthält damit 479 profilbezogene Regeln und 488 Kalenderzeilen. Die fünf bisherigen Punkte haben einen dokumentierten Ausgang: vier umgesetzte Datumsfälle und ein fortbestehender Erfassungs- und Anwendungsvorbehalt. Die Bezeichnungen bleiben in Deutsch, Französisch, Italienisch und Rumantsch Grischun vollständig. Neue Übersetzungen sind provisorische Produktbezeichnungen.

Die Fachmatrix ist nicht mit einer schweizweiten Freigabe sämtlicher Fristenprofile gleichzusetzen. Produktkalender, App, SPFx-Pakete und E/Q/P-Installationen bleiben unverändert. Der neue Arbeitsmappenvertrag `0.6.0` liegt als technisch umgesetzter Kandidat gemäss [DEC-2026-022](../entscheidungen/DEC-2026-022-bedingte-feiertagsregeln.md) vor. AP18C, Produktformat, Datenpromotion und Deployment bleiben gesonderte Schritte.

## Fachliche Bereinigung und Quellen

| Bisheriger Fall | Fachvorgabe und Umsetzung | Massgebliche Grundlage |
| --- | --- | --- |
| `AP18B04-AR-STEPHAN-CONDITION` | 26. Dezember entfällt, wenn der 25. Dezember Montag oder Freitag ist. Gleichwertig: 26. Dezember nicht Dienstag oder Samstag. Kein Ersatzmontag. | Art. 7 Abs. 1 der [Arbeitsverordnung bGS 822.11](https://ar.clex.ch/api/de/versions/1058/pdf_file), Stand 01.01.2016. Der frühere Linktitel «Ruhetagsgesetz» war unzutreffend. |
| `AP18B04-AI-STEPHAN-CONDITION` | 26. Dezember entfällt Dienstag oder Samstag, damit keine drei gesetzlichen Ruhetage aufeinanderfolgen. Ein gewöhnlicher Samstag zählt nicht selbst als gesetzlicher Ruhetag. | Art. 2 Abs. 1 Bst. b [Ruhetagsgesetz GS 822.200](https://ai.clex.ch/api/de/versions/1327/pdf_file), Stand 01.01.2011, erläutert im [Bericht der Standeskommission vom 29.09.2015, Ziff. 4.3, S. 7](https://ai.ch/themen/wirtschaft-und-arbeit/feiertage-ruhetage/dokumente/20150929-stk-bericht-feiertage.pdf). |
| `GAP-GL-FAHRT-APRIL` | Erster Donnerstag im April. Fällt dieser auf Gründonnerstag, Verschiebung um sieben Tage. Keine jährlichen festen Ersatzdatensätze. | Feiertagsqualität nach Art. 2 Abs. 1 Bst. b [Ruhetagsgesetz GS IX B/21/1](https://gesetze.gl.ch/api/de/versions/2110/pdf_file). Datumsformel und 09.04.2026 nach [Regierungsratsmitteilung vom 06.01.2026](https://www.gl.ch/public-newsroom.html/31/newsroomnews/14237/title/n%C3%A4felser-fahrt). |
| `NE-PENDING-SUNDAY-SUBSTITUTION` | 2. Januar nur nach Sonntags-Neujahr, 26. Dezember nur nach Sonntags-Weihnachten. Keine allgemeine Verschiebung aller Feiertage. | Art. 3 Abs. 1 [LDJF, RSN 941.02](https://rsn.ne.ch/DATA/program/books/rsne/htm/941.02.htm), abgeglichen mit der [amtlichen Feiertagsübersicht](https://www.ne.ch/themes/economie-et-emploi/jours-feries-officiels). |
| `NE-PENDING-COMPENSATION` | Nicht automatisch erzeugte Einzelfestlegungen bleiben als Vorbehalt erhalten. Die örtliche und die verwaltungsbezogene Rechtsgrundlage werden ausdrücklich unterschieden. | Art. 3 Abs. 2 LDJF, Art. 11 Abs. 2 [RDF, RSN 152.512](https://rsn.ne.ch/DATA/program/books/rsne/htm/152.512.htm), Art. 33 Abs. 3 [LPA, RSN 152.130](https://rsn.ne.ch/DATA/program/books/rsne/pdf/152.130.pdf). |

### AI: dokumentierter Normvorrang

Die [amtliche Liste](https://ai.ch/themen/wirtschaft-und-arbeit/feiertage-ruhetage/feiertage) nennt weiterhin den 26.12.2026. David Steimer hat diesen Eintrag am 22. September 2026 als Fehler beurteilt und die Anwendung des Gesetzes bestätigt. Der Quellenkonflikt ist damit **für das Projekt fachlich entschieden**, nicht nachweislich durch eine amtliche Berichtigung beseitigt. Die abweichende Liste bleibt im Quellenregister erhalten.

### GL: Datumsformel und Programmbeschluss trennen

Art. 7 des Gesetzes betreffend die Feier der Näfelser Fahrt regelt die jährlichen Programmanordnungen, enthält aber nicht selbst die hier verwendete Datumsformel. Deren Beleg ist die amtliche Regierungsratsmitteilung. Gemäss Fachvorgabe wird die wiederkehrende Formel verwendet. Die Referenzjahre 2027 und 2028 sind berechnete Fälle, keine Behauptung über bereits geprüfte künftige Regierungsbeschlüsse.

### NE: präzisierter Vorbehalt

Nicht regelmässig oder gesondert durch Regierungsbeschluss festgelegte zusätzliche regionale Feiertage sowie zusätzliche Verwaltungsschliesstage werden nicht automatisch erzeugt. Ihre allfällige Bedeutung für den konkreten Fristenlauf bleibt vorbehalten. Bereits ausdrücklich erfasste, regelmässig wiederkehrende kantonale Ortsregelungen bleiben erhalten.

Dabei sind zu unterscheiden:

- Regionale Feiertage nach Art. 3 Abs. 2 LDJF, höchstens ein weiterer Tag je Jahr und Gemeinde.
- Zusätzliche Verwaltungsausgleichstage nach Art. 11 Abs. 2 RDF. Diese sind nicht bloss regional. Art. 33 Abs. 3 LPA knüpft an mindestens halbtägige Schliessung der kantonalen Verwaltung an. Nicht jede individuelle Kompensationsabwesenheit ist eine Verwaltungsschliessung.
- Bereits erfasste feste Verwaltungsdaten nach Art. 11 Abs. 1 RDF. Insbesondere der 2. Januar und der 26. Dezember bleiben im Profil `NE-LPA-ADDITIONAL` jährlich bestehen.
- Fronleichnam in Le Landeron gemäss Art. 2 des [kantonalen Ausführungsbeschlusses RSN 941.020](https://rsn.ne.ch/DATA/program/books/rsne/htm/941.020.htm). Dieser Eintrag bleibt unverändert.

Der ursprüngliche fünfte Fall wird somit nicht irrtümlich als rein örtlich oder rechtlich bedeutungslos geschlossen. Die Umfangsbegrenzung auf Bundesrecht und kantonales Recht bleibt bestehen.

## Begrenzter technischer Vertrag

Die bisherigen Spalten A bis AA und die Osterhilfen AC/AD bleiben an Ort. Die bisherige Leerspalte AB wird zur ausdrücklichen `Kalenderbedingung`. Keine freie Formelsprache, kein versteckter Jahres-Override und keine neue Runtime-Aktivierung.

| Modellwert | Anzeige in Excel | Zulässiger Anker |
| --- | --- | --- |
| `always` | Immer | Bisherige vier Regeltypen |
| `unlessTuesdayOrSaturday` | Nicht Dienstag/Samstag | Ausschliesslich 26. Dezember |
| `onlyMonday` | Nur Montag | Ausschliesslich 2. Januar oder 26. Dezember |
| `shiftHolyThursdayBy7Days` | Gründonnerstag + 7 Tage | Ausschliesslich erster Donnerstag im April |

Die 474 bisherigen Regeln erhalten ausdrücklich `always`, ohne Datumsänderung. Fünf neue Regeln werden angehängt. Fehlende oder unbekannte Bedingungen sowie inkompatible Anker werden abgewiesen. Eine nicht erfüllte Jahresbedingung erscheint als «Entfällt», getrennt von «Ausserhalb Geltung». Der Gültigkeitsvergleich erfolgt nach einer allfälligen Verschiebung, insbesondere bei GL.

Die Arbeitsmappe behält ihr dokumentiertes Jahresfenster 2026–2028. Reine Rechenfunktionstests über weitere Jahre erweitern weder dieses Eingabefenster noch den fachlich erhobenen historischen Bestand.

Die vorhandenen `open`- und `blockedEffect`-Werte bleiben konservative Produktgrenzen. Fachlich bestätigte Datumsregeln und produktive Fristenfreigabe sind getrennt. Die Quellenprüfung erhält fünf Nachträge am Tabellenende, keine rückwirkende Umschreibung früherer Prüfereignisse. Ihr Ergebnis `unchanged` betrifft die unveränderte Normgrundlage, die fachliche Auflösung steht im Befund.

## Reproduzierbarkeit und QA

Eingang ist ausschliesslich die tatsächlich gelieferte V0.11, SHA-256 `37d33d4639cc839fc41c9850de8e6551d546167fe8b9ee7f10ea5f2c062d99fd`. Die gespeicherten Eingabewerte aller 474 bestehenden Regeln werden zusätzlich gegen den validierten Rechenseed geprüft. Die vervollständigten Sprachzellen stammen aus der V0.11, nicht aus älteren Modellkopien.

Der bestehende Builder erhält `--batch-05`. Der Nativeadapter übernimmt ausschliesslich deklarierte, mit Artifact autorisierte Zellen und erhält Tabellen, Schutz, Ansichten, Stile, Links und Validierungen. Ein unabhängiger OOXML-Prüfer wertet die tatsächlich gespeicherten Formeln aus.

```sh
node --import tsx --test tests/calendar-rules/ap18b-05-conditions.test.mjs
node scripts/build-ap18a-workbook.mjs --batch-05
python3 scripts/finalize-ap18b-03.py --batch-05
python3 scripts/check-ap18b-05-workbook.py
node scripts/build-ap18a-workbook.mjs --batch-05 --verify
```

Der [QA-Nachweis](../../outputs/ap18b-05-bedingte-feiertage-2026-09-22/QA-AP18B-05-V0.12.md) enthält den finalen Hash, die bestandenen Prüfungen und die separat entdeckte Abweichung der historischen lokalen V0.9. Deren ursprüngliche Prüfsummensperre bleibt unverändert. Kein pauschal grüner historischer Gesamttest wird behauptet.

## Nächster Schritt

V0.12 und der begrenzte Vertragsvorschlag `0.6.0` können fachlich-technisch abgenommen werden. Danach ist die kontrollierte AP18C-Übernahme mit expliziten Profilgrenzen, Exportvalidierung und Releaseprüfungen vorzubereiten. Die historischen Referenzdateien sind vor dem Release prüfsummenkonform zu archivieren oder ihre Abweichungen ausdrücklich zu behandeln. Aus diesem Arbeitsschritt folgt keine Veröffentlichungserlaubnis.
