# AP22C1 Datenmodelle Projektion und Kalendergenerator

Stand: 8. Oktober 2026. AP22C1 ist auf ausdrücklichen Auftrag von David Steimer umgesetzt und technisch geprüft. Das Teilpaket ist zur fachlich-technischen Abnahme bereit, aber noch nicht abgenommen. Grundlage sind [AP22B](../fachrecht/abnahme-ap22b.md) und [DEC-2026-030](../entscheidungen/DEC-2026-030-beschluss.md).

## Ergebnis und Umfang

Die neue Datenschicht liest Feiertagskatalog 2.0.0 und Regelkalender 3.0.0, erzeugt die 32 ausdrücklich bestimmten Kalender und prüft ein dynamisches Manifestinventar nach Format 7.0.0. Sie verändert keine Benutzerberechnung. Der bisherige Datenadapter weist Format 7 weiterhin zurück, bis Rollen- und Gebietsauflösung sowie Januarvergleich implementiert und geprüft sind.

| Bestandteil | Umsetzung |
| --- | --- |
| Archiv und Herkunft | Alle 479 bisherigen Katalogregeln und ihre historischen Statuswerte bleiben erhalten. 198 Herkunftsentscheidungen sind von 104 terminalen Verfahrensbindungen getrennt. |
| Projektion | 32 Kalenderdefinitionen aus genau einer Grundliste und ausdrücklich gebundenen Ergänzungen. Keine freie Listenvereinigung, kein erster Kalendertreffer, kein BE-/CH-Ersatzwert. |
| Solothurn | Zwölf gesonderte ganztägige Prozessregeln unter `SO-PROCEDURAL-ALL`, rechtliche Geltung ab 1. März 2015. Die bisherige Halbtagsregel wird nicht als Prozessfeiertag umgedeutet. |
| Kalenderarithmetik | Vier geschlossene Bedingungen, Wochentagsversatz von −366 bis 366 Tagen und `proceduralEquivalentDay`. Normgeltung wird am tatsächlich erzeugten, gegebenenfalls verschobenen Tag geprüft. |
| Übernahmeprüfung | Vollständiger Kataloghash, Inventar, IDs, Regelinhalt, Fundstellen, Geltung, Wirkung und Vererbung müssen zusammenpassen. Neu berechnete Prüfsummen allein legitimieren keine veränderte Projektion. |
| Sozialkatalog | 44 Fachregeln und 50 BE-Anbindungen unverändert. Alle 50 Kandidatenbindungen erhalten neue Release- und Komponentenbezüge, aber keine frühere Releasefreigabe. Fenster 2026–2027 unverändert. |

## Reader und Implementierung

- [`holidayActivation.ts`](../../src/core/holidayActivation.ts) und [`holidayActivationTypes.ts`](../../src/core/holidayActivationTypes.ts) bilden Katalog, Herkunft, terminale Listen, Rollen, regionale Varianten und Projektionsprüfung ab. Sie lösen noch keinen konkreten Benutzerfall auf.
- [`generateCalendar.ts`](../../src/core/generateCalendar.ts) erweitert die bestehende Arithmetik. Format 2 behält seinen bisherigen Zweig. Neue Felder in alten Kalendern werden zurückgewiesen. Mehrere Rechtsgrundlagen desselben Datums bleiben als getrennte Regelherkunft nachvollziehbar.
- [`releaseFormat7.ts`](../../src/core/releaseFormat7.ts) liest ein vollständig bytegebundenes Inventar. Sein Ergebnis trägt zwingend `runtimeReady: false` und ist kein `CalculationData`-Objekt. Fehlende, zusätzliche, doppelte, fremd formatierte oder falsch gebundene Artefakte werden verworfen.
- [`schemaContract.ts`](../../src/core/schemaContract.ts) verarbeitet den gesamten in den gebundenen Schemata verwendeten Schlüsselwortumfang, einschliesslich Bedingungen, Alternativen, Mengenbedingungen und Referenzen. Unbekannte Schlüsselwörter oder nicht auflösbare Referenzen führen auch in unbenutzten Zweigen zur Ablehnung. Keine Schemata oder ausführbaren Regeln werden aus dem Netz geladen.
- [`calendarMigration.ts`](../../src/core/calendarMigration.ts) bindet ausschliesslich die Sozial-Metadaten neu. Normen, Zuständigkeiten, Zeitfenster und Fallfakten werden nicht ergänzt oder erweitert.

Die neuen Schemata liegen unter [`schemas/implementation/ap22c1`](../../schemas/implementation/ap22c1/) als byteidentische Implementierungskopien der beschlossenen AP22B-Vorlage. Die bisherigen Produktregistrierungen und historischen Schemata bleiben unverändert. Die kanonischen Schema-IDs sind Vertragskennungen, kein Nachweis einer bereits erfolgten Veröffentlichung. Die Hostintegration folgt in C3.

## Getrennter Prüfkandidat

Der [Prüfkandidat](../../outputs/ap22c1-2026-10-08/inventory.json) enthält 40 Datenkomponenten sowie zwei reine Datierungsnachweise. Die fünf Rechtsprofile und der Spezialregimekatalog sind byteidentisch zum bisherigen Release. Die Basisdateien werden vor der Verwendung anhand des gebundenen MVP-0.6-Manifests und ihrer Prüfsummen kontrolliert. Der Builder verwendet anschliessend genau die geprüften Bytes.

Der Katalog bestätigt den beschlossenen Vertrag, behält für die operative Releasefreigabe aber `candidate` mit leerer Release-ID und leerer Freigabe. Der Sozialkatalog verwendet die technische Kandidatenkennung `2026-10-08-ap22c1-candidate.1`. Seine alten Quellenprüfverweise bleiben Herkunftsnachweise, keine neue Quellenabnahme.

Bewusst fehlt ein auslieferbares Release-Manifest. Das Manifestformat verlangt deklarierte geprüfte Quellen. AP22C1 erfindet dafür keinen neuen Nachweis. Syntax, Bytebindung und Inventar werden mit ausdrücklich synthetischen In-Memory-Testdaten geprüft. `inventory.json` ist ein lokaler Prüfindex, kein zusätzlicher Produktbestandteil und keine neue Providerdatei.

## Verifikation

Der reproduzierbare Gesamtlauf erfolgt mit Node 22.23.2 und Python 3.12.14. Der [maschinelle Prüfnachweis](../../outputs/ap22c1-2026-10-08/QA-AP22C1.json) bindet Quellstand, Tests, Testprotokolle und Inventar.

| Prüfung | Ergebnis |
| --- | --- |
| TypeScript-Typprüfung | Bestanden |
| Neue TypeScript-Prüfungen | 82 bestanden, einschliesslich Kalender, Projektion, Parser, Manifestinventar und Sozialmigration |
| Unabhängige Python-Prüfungen | 35 bestanden |
| Gesamte lokale Produktregression | 2’121 bestanden, darin enthalten die 82 neuen TypeScript-Prüfungen |
| Historische AP22B-Vertragsprüfungen | 24 Node- und 20 Python-Prüfungen erneut bestanden, ursprüngliche Protokolle unverändert |
| TypeScript-/Python-Datumsvergleich | Alle 3’940 Kalender-/Regel-/Datum-Vorkommen stimmen überein |
| Reproduzierbarer Kandidatenbau | Zwei Läufe mit identischem Inventar und identischen Datenhashes |
| Erhaltung | 13 AP22B-Dateibindungen und beide ursprünglichen Testprotokolle bestätigt. Alte Produktdaten, Readeradapter und Releasepins unverändert |

Die lokalen Tests prüfen auch unvollständige oder neu hashgebundene manipulierte Inventare, unbekannte Schemamerkmale, nicht auflösbare Referenzen in unbenutzten Alternativen und alte Sozialfreigaben. Kalenderformate 2 und 3 dürfen in keiner Richtung über Vererbung vermischt werden.

Die Gegenprüfung vergleicht TypeScript und eine unabhängige Python-Datierung für alle 32 Kalender von 2027 bis 2035. Das ist ein Algorithmusnachweis, kein Rechtsbeständigkeitsnachweis für diesen Zeitraum und keine Verlängerung der Sozialfreigaben. Gesonderte Kalenderproben erfassen den 400-jährigen Wochentagszyklus, AR/AI, GL, NE, positive und negative Jahresversätze sowie die ursprünglichen CH-/BE-Kalender und Bundesstillstände.

Die vier Januaralternativen sind strukturell geprüft und verändern nur die konkret gebundene unsichere Regel. Der vollständige Vergleich zweier Fristberechnungen ist dagegen ausdrücklich Aufgabe von C2. GR-/NE-Vorbehalte bleiben davon getrennte berechenbare Grenzen.

Ausführung aus dem Repository mit Node 22 im Suchpfad:

```sh
npm run test:ap22c1
```

Der Testlauf erzeugt den getrennten Prüfkandidaten reproduzierbar, prüft Typen, TypeScript- und Python-Verträge sowie die bestehende Produktregression und bestätigt die unveränderten AP22B-Dateibindungen. Er baut und installiert keine App.

## Nächster Haltepunkt

Zur Abnahme steht ausschliesslich AP22C1. Danach folgt AP22C2 mit qualifizierten Rollen und Gebieten, dem vollständigen Januarvergleich, der gemeinsamen DE-/FR-Oberfläche, Rechenspur und Defaults Version 4. C3 umfasst Provider-/Cachebindung, historische AP5-Ansicht und gebaute Hosts.

Es erfolgt keine neue Quellenprüfung, keine Produktaktivierung, keine zusätzliche Sozialfreigabe und kein zusätzliches kantonales Verwaltungsverfahren. GitHub, E/Q/P, Mirrors, Berechtigungen, Hosting und die bestehende Benutzeroberfläche bleiben unverändert. Die ursprüngliche AP22B-Vorlage wird nicht rückwirkend umgeschrieben.

David Steimer nimmt die menschlichen Fach- und Freigaberollen in Personalunion wahr. Codex implementiert und prüft als KI-Arbeitsinstrument ohne formelle Freigabe- oder Haftungsverantwortung.
