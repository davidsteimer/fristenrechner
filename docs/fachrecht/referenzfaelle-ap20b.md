# AP20B Referenzfälle und technischer Prüfnachweis

Stand: 30. September 2026. **Zur Abnahme vorgelegt, nicht operativ freigegeben.** Die Tests prüfen den [AP20B-Vertragsvorschlag](../architektur/sozialversicherungsvertrag-ap20b.md). Sie sind keine Implementierung der fünf neuen Erlasse im produktiven Rechner.

## 1. Was tatsächlich geprüft wird

Die eigenständige [Strukturprobe](../../tests/golden/candidates/ap20b-social-contract.json) beschreibt 20 nationale Handlungspfade und 22 Berner Anbindungen. Zehn [literal erfasste Datumsvektoren](../../tests/golden/candidates/ap20b-social-dates.json) werden über alle 22 Anbindungen ausgeführt. Das ergibt **220 positive Datumsprüfungen**, nicht 220 unabhängig verfasste unterschiedliche Datumsprobleme. Die vier Handlungen pro Gesetz umfassen zwei gesetzliche 30-Tage-Fristen und zwei angeordnete Tagesfristen.

Der [Prüfer](../../scripts/check-ap20b-references.mjs) importiert weder den Produktrechner noch dessen Datenloader. Er zählt die Kalendertage unabhängig auf. Er verwendet die hashgebundene frühere AP19B-Kalenderreferenz samt den zwei unveränderten freigegebenen CH-/BE-Kalenderdateien. Die erwarteten Daten werden nicht vom Prüfer in die Referenztabelle zurückgeschrieben. Eine absichtlich veränderte Sollerwartung wird durch einen eigenen Negativtest erkannt.

Die Qualifikationsprobe erhält normalisierte Sollfallparameter. Sie ist kein neues Produkt-API-Schema. Insbesondere enthält sie die effektive feste Tagesdauer und explizite Testbefunde. Im Produkt bleibt die feste Dauer nicht übersteuerbar, und eine sichtbar feststehende Modellangabe wird nicht zur erfundenen Benutzerbestätigung. Die tatsächliche Consumer-/UI-Übernahme ist erst AP20C.

## 2. Lesbare Datumsreferenzen

Alle Fälle setzen eine qualifizierte individuelle Eröffnung und den separat geklärten Berner Feiertagsraum voraus. Beim Gericht kommt ein unabhängig qualifiziertes Zuständigkeitsdatum hinzu. Die in den synthetischen Basisfällen gleiche Datumszahl bedeutet keine automatische Übernahme aus dem Eröffnungsfeld.

| Fall | Rechtlich massgebende Eröffnung | Gesetzliche 30 Tage: Fristende | Angeordnete Dauer: Fristende | Zweck |
| --- | --- | --- | --- | --- |
| R01 | 16.09.2026 | 16.10.2026 | 10 Tage → 28.09.2026 | Normalfall und Samstag am rechnerischen Ende |
| R02 | 27.03.2026 | 11.05.2026 | 10 Tage → 21.04.2026 | Vollständiger Osterstillstand mit 15 Tagen |
| R03 | 10.07.2026 | 10.09.2026 | 10 Tage → 21.08.2026 | Vollständiger Sommerstillstand mit 32 Tagen |
| R04 | 10.12.2026 | 25.01.2027 | 10 Tage → 05.01.2027 | Jahreswechsel und 16 Tage Stillstand |
| R05 | 13.05.2026 | 12.06.2026 | 1 Tag → 15.05.2026 | Auffahrt als Endtag, Feiertag innerhalb längerer Frist zählt |
| R06 | 22.05.2026 | 22.06.2026 | 3 Tage → 26.05.2026 | Sonntag beziehungsweise Pfingstmontag am Ende |
| R07 | 30.06.2027 | 31.08.2027 | 10 Tage → 12.07.2027 | Unveränderte Fristnorm über neue EO-/FLG-Konsolidierung |
| R08 | 01.07.2027 | 01.09.2027 | 10 Tage → 12.07.2027 | Gleicher Verfahrensvertrag nach dem Stichtag |
| R09 | 03.04.2026 | 12.05.2026 | 10 Tage → 22.04.2026 | Eröffnung während des Osterstillstands, erster Zähltag 13.04. |
| R10 | 17.11.2027 | 17.12.2027 | 10 Tage → 29.11.2027 | Letzte 30-Tage-Frist unmittelbar vor dem Winterstillstand |

Je Vektor sind zusätzlich kalenderischer Beginn, erster gezählter Tag, nominales Ende, Stillstandstage und Verlängerungstage als Sollwerte festgehalten. Die Reihe prüft damit nicht nur das Enddatum. Der Rechner arbeitet mit bürgerlichen Kalendertagen, nicht mit fortlaufenden 24-Stunden-Dauern. Die gleichen Erwartungen bestehen unter UTC, Europe/Zurich und America/New_York.

## 3. Negative Qualifikation und Grenzen

Die [24 Governance-Testgruppen](../../tests/governance/ap20b-references.test.mjs) enthalten neben den positiven Reihen zahlreiche kombinierte Sperrprüfungen. Eine Sperre erfolgt vor einer operativen Freigabe. Die Probe liefert für gültige Kandidaten weiterhin `runtimeActive: false` und `candidate-not-approved`.

| Prüfgruppe | Erwartung |
| --- | --- |
| Jedes erforderliche einzelne Routenmerkmal fehlt | Sperre, keine stillschweigende Ergänzung aus Standards |
| Zusätzliches oder unverständliches Faktenfeld | Sperre statt Ignorieren widersprüchlicher Angaben |
| Nicht qualifizierter Träger, falscher Herkunftstyp, Auslands-/Dritt-/unklarer Fall | Sperre mit eigenständigem Grund |
| EOG kantonale Kasse versus nichtkantonale Kasse | Kein automatischer Wechsel oder Gleichsetzung der Gerichtsrouten |
| EOG/MVG-Verwaltung mit zuständigem Träger ausserhalb BE | Berechnungskandidat bleibt möglich, sofern die separate BE-Wohnsitz-Produktgrenze erfüllt ist |
| FamZG-Ordnung oder zuständige FLG-Kasse ausserhalb BE | Keine Ersatzfreigabe über aktuellen Wohnsitz oder Trägersitz |
| ÜLG-Verwaltungszuständigkeit versus ATSG-Gerichtszuständigkeit | Unterschiedliche Fakten erforderlich, keine Wiederverwendung ohne Qualifikation |
| Fehlendes oder ungedecktes Zuständigkeitsdatum bei gedeckter Eröffnung | Sperre |
| Beschwerdeerhebung nach der Verbesserungsanordnung | Sperre im CORRECTION-Pfad |
| Formlose EO-Abrechnung statt formeller Verfügung | Keine Einsprachefrist |
| Freiwillige FamZG-Kassenleistung | `unresolved-qualification`, nicht pauschaler gesetzlicher ATSG-Ausschluss |
| Rein kantonale EO-Zusatzleistung, auch ab Juli 2027 | Produktsperre |
| Beliebige Gerichts-/Beweisanordnung statt enger Beschwerdeverbesserung | Sperre |
| MVV-Vorbescheid ohne qualifizierte Tagesanordnung | Keine automatisch angenommene 30-Tage-Einwandfrist |
| Geänderte feste Dauer, Monate, Fixtermine, fehlende oder ungültige Tageszahl | Sperre |
| Berner Gericht, aber ungeklärter oder ausserbernischer Feiertagsraum | Keine automatische Übernahme des Gerichtskalenders |
| Eröffnung 18.11.2027 bei 30 Tagen oder 17.12.2027 bei einem Tag | Ergebnis würde nach 2027 liegen, daher Sperre trotz gedeckter Eröffnung |
| Umetikettierung des Vorschlags als abgenommen oder operativ freigegeben | Ungültiger Referenzvertrag |

**Zwei wichtige Nachweisgrenzen:** Die EO-Adoptionsentschädigung wird mit einer fachlich als falsch erkannten Kasse als negativer Zuständigkeitsbefund getestet. Die Probe erkennt ohne eigenen Leistungstyp nicht selbst die EAK-Zuständigkeit nach Art. 35q EOV. Bei CORRECTION wird kein zusätzliches `procedureStartDate` als Pflichtangabe behauptet. Die konkrete Verbesserungsanordnung und die qualifizierte Beschwerdeerhebung tragen den bestehenden Verfahrensbezug.

## 4. Bestands- und Versionsschutz

Vier zusätzliche [Tests am unveränderten Produktreader](../../tests/core/ap20b-compatibility.test.ts) prüfen die konservative Versionsgrenze:

1. Bestehender Katalog 1 wird weiterhin akzeptiert, vorgeschlagener Katalog 2 abgewiesen.
2. Die fünf neuen Gesetzescodes lassen sich nicht in Katalog 1 einschleusen.
3. Neue Fakten- und Herkunftswerte werden unter Vertrag 1 verworfen.
4. Das vorhandene Manifest-5-Schema erklärt Version 6 nicht bereits für unterstützt.

Das ist ein **negativer Kompatibilitätsnachweis**, noch kein positiver Migrationstest des erst zu erstellenden Consumers 6. Die spätere Migration muss auch die unveränderte Bedeutung aller bisherigen Regeln und ihre Laufzeitresultate im neuen Consumer belegen.

Die AP20A-Vorlagen wurden gegen ihre beiden Abnahmeprüfsummen kontrolliert. Manifest und Sozialkatalog des freigegebenen MVP 0.5 sind zusätzlich fest gepinnt. Alle zehn Datenartefakte stimmen mit ihren Manifestprüfsummen überein. Keine neue AP20B-Datei wird aus `src`, produktiven Schemata oder Release-Manifesten als Laufzeitinhalt referenziert.

## 5. Tatsächlich ausgeführte Prüfungen

Ausführung am 30. September 2026 im lokalen Arbeitsstand. Keine Browser-, E-/Q-/P- oder neue Gastkontoprüfung.

| Lauf | Ergebnis |
| --- | --- |
| Isolierte AP20B-Datumsprobe | 20 Regeln, 22 Anbindungen, **220 positive Datumsprüfungen bestanden** |
| AP20B-Governance | **24/24 Testgruppen bestanden** |
| AP20B-Kompatibilität am bisherigen Reader | **4/4 Tests bestanden** |
| Gesamte Kern-/UI-Regression | **1’217/1’217 Tests bestanden**, einschliesslich der vier neuen Kompatibilitätstests |
| Gesamte Governance-Regression | **133/133 Tests bestanden**, einschliesslich der 24 AP20B-Gruppen |
| Bestehende statische Web-Ausprägung | **12/12 Tests bestanden**, kein neues AP20-Produktpaket |
| TypeScript-Typprüfung | bestanden |
| Separater MVP-0.5-Datenvalidator | bestanden, 24 freigegebene Bundesregeln und 28 Anbindungen unverändert, zehn Artefakte validiert |
| AP20A- und Kalender-Byteidentität | zwei AP20A-Dateien und zwei Kalenderdateien unverändert |

Die Zeilen überlappen bewusst. Sie dürfen nicht als additive Gesamtzahl unterschiedlicher Tests zusammengezählt werden.

Das [maschinenlesbare Abschlussprotokoll](../../outputs/ap20b-2026-09-30/pruefprotokoll.json) bindet die vorgelegten Dokumente, Testdateien und Quellenprotokolle per SHA-256. Die noch nicht erfolgte menschliche Abnahme und Produktaktivierung bleiben dort ausdrücklich `false`. Die Web-Regressionsläufe erzeugen nur die üblichen wiederherstellbaren `.work`-Testbuilds des bestehenden Stands, keine neuen definitiven Releaseartefakte.

Wiederholung im eingerichteten Node-Entwicklungsumfeld:

```sh
node scripts/check-ap20b-references.mjs
node --test tests/governance/ap20b-references.test.mjs
node --import tsx --test tests/core/ap20b-compatibility.test.ts
```

Die vollständigen Standardläufe verwenden weiterhin die bestehenden Kern-, UI-, Governance-, Web- und Typprüfungen. Für AP20B wurden keine Paketversionen, Abhängigkeiten, Buildpins oder produktiven Daten verändert.

## 6. Fachnachweise und nächste Entscheidung

Der [Bundesbericht](quellenabgleich-ap20b-bund.md) bindet 15 Hauptkonsolidierungen aus zehn Erlassen, zwei zusätzliche ELG-Querverweisfassungen und die relevanten Änderungsakte. Die [bernische Prüfung](zeitliche-bindung-ap20b.md) bindet fünf amtliche API-Antworten und acht Original-PDFs. BGer 8C_767/2008 wird ausdrücklich als bereits dokumentierter Vorbefund verwendet. Die Datenprobe ist keine umfassende neue Rechtsprechungsrecherche.

Der [technische Vertragsnachtrag](../architektur/sozialversicherungsvertrag-ap20b.md), die Quellen-/Zeitbindung und diese Referenzen werden gemeinsam zur fachlich-technischen Abnahme vorgelegt. [DEC-2026-026](../entscheidungen/DEC-2026-026-sozialverfahrenskatalog-v2.md) bleibt vorgeschlagen. AP20C sowie Quellenpromotion, konkrete Produktfreigabe, Veröffentlichung und Bereitstellung sind anschliessende gesonderte Schritte.
