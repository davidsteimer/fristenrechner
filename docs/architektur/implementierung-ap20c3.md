# AP20C3 Integration von MVG und ÜLG

Stand: 1. Oktober 2026. **Lokal umgesetzt und technisch geprüft, zur fachlich-technischen Abnahme vorgelegt.** Auftrag von David Steimer: «Bitte starte AP20C3.» [Issue #43](https://github.com/davidsteimer/fristenrechner/issues/43), übergeordnet [#35](https://github.com/davidsteimer/fristenrechner/issues/35).

AP20C3 ergänzt die [abgenommene AP20C2-Integration](../fachrecht/abnahme-ap20c2.md) um MVG und ÜLG. Damit sind die fünf in [AP20B](sozialversicherungsvertrag-ap20b.md) vorgesehenen Erlasse EOG, FamZG, FLG, MVG und ÜLG innerhalb des vereinbarten Umfangs lokal integriert. [DEC-2026-026](../entscheidungen/DEC-2026-026-beschluss.md) und seine Formate bleiben unverändert. Nationale Modelle und erste bernische Anbindungen sind getrennt. Noch keine operative Datenfreigabe oder Bereitstellung.

## Umfang und Bestandsschutz

| Bestandteil | Ergebnis |
| --- | --- |
| Neu in AP20C3 | Je vier nationale MVG- und ÜLG-Modelle mit je vier Berner Anbindungen |
| Verfahrenswege | Einsprache, ordentliche Beschwerde, angeordnete Verwaltungstagesfrist und eng qualifizierte formelle Beschwerdeverbesserung |
| Kandidatenbestand | 44 nationale Regeln und 50 Berner Anbindungen |
| AP20 insgesamt | 20 neue nationale Regeln und 22 Berner Anbindungen für die fünf Erlasse |
| Erhaltener Bestand | Alle 36 Regeln und 42 Anbindungen aus AP20C2 objektidentisch, einschliesslich Revisionen und Bedeutungen |
| Andere Komponenten | Neun Artefakte byteidentisch zu AP20C2 und MVP 0.5 |
| Formate | Sozialverfahrenskatalog 2.0.0, Manifest und Mindestconsumer 6.0.0 |
| Freigaben | Sämtliche 50 releasebezogenen Verknüpfungen bleiben `candidate` mit `approval: null` |
| Produktgrenze | Keine weiteren Kantone oder Feiertagsräume aktiviert, keine zusätzlichen Spezialverfahren |

Der [Datenkandidat](../../data/candidates/2026-10-01-ap20c3/manifest.json) heisst `2026-10-01-ap20c3-candidate.1`. Manifest-SHA-256:

`b4250a31d226b4f59e0857a857f49e1ea354722b9ff46b9324d70b330f135450`

Der Builder bindet die AP20C2-Abnahme, die unveränderten AP20B-Grundlagen und die frische Quellenkontrolle. Er reproduziert dieselben elf Dateien und verweigert das Überschreiben abweichender Kandidaten. Die bestehende Rechenlogik, Formatvalidatoren und produktiven Datenpins benötigen gegenüber AP20C2 keine weitere Änderung. Keine neue Anwendungsversion wird vergeben.

## Fallangaben und reduzierte Bedienung

| Weg | Erforderlicher fallbezogener Befund zusätzlich zu Eröffnungsdatum und Feiertagsanknüpfung |
| --- | --- |
| MVG Verwaltung | Wohnsitzkanton der versicherten Person bei fristauslösender Zustellung. Bern ist die ausdrücklich abgenommene Produktgrenze |
| ÜLG Verwaltung | Eigenständig qualifizierter Kanton der für diesen ÜLG-Verwaltungsfall zuständigen Durchführungsstelle |
| MVG und ÜLG Gericht | Örtlich zuständiges Versicherungsgericht, Wohnsitz bei Beschwerdeerhebung und massgebendes Beschwerdedatum |

**MVG:** Der Wohnsitzfilter ist keine kantonale Verwaltungszuständigkeit und kein Suva-Sitzfilter. Der fachlich zuständige Militärversicherungsträger und der individuelle Leistungsfall müssen feststehen. Im Gerichtspfad wird der Wohnsitz bei Beschwerdeerhebung eigenständig neu qualifiziert.

**ÜLG:** Der Verwaltungsbefund folgt Art. 19 ÜLG und der Durchführungskette über Art. 21 Abs. 2 ELG sowie Art. 8 EG ELG. Weder der heutige Wohnsitz, der gewählte Verfahrenskontext noch ein Kassen- oder Gerichtskanton füllen diesen Befund automatisch aus. Im Gerichtspfad werden die gerichtliche Zuständigkeit und der dafür massgebende Wohnsitz gesondert eingegeben. Die frühere Verwaltungszuständigkeit ersetzt sie nicht und wird nicht als zusätzliches Gerichtskriterium weitergeführt.

Die Feiertagsanknüpfung an Partei und Vertretung bleibt in allen Wegen unabhängig. Feste modellierte Eigenschaften werden nicht zu zusätzlichen Dropdowns. Der zweispaltige Aufbau, DE-/FR-Texte, frühe Datumseingabe und vier Aktionsschaltflächen bleiben erhalten. Dokumentherkunft, Normenkontext und ausführliche Begrenzungen stehen in der Rechenspur. Keine neue Bestätigungscheckbox.

Beim Erlass- oder Handlungswechsel werden Fallbefunde und Ergebnis gelöscht. Das Zustelldatum bleibt erhalten, solange seine Bedeutung gleich bleibt. Gericht, Wohnsitz und massgebendes Beschwerdedatum werden nicht aus einem früheren Verwaltungsfall übernommen. Persönliche Standards speichern die stabile Erlass-/Handlungsauswahl, keine fallbezogenen Zuständigkeitsangaben, Feiertagsbefunde oder Daten.

## Quellen und ausgeschlossene Fälle

Die [frische begrenzte Quellenkontrolle](../fachrecht/quellenkontrolle-ap20c3.md) vom 1. Oktober 2026 ergibt kein fachliches Delta zu AP20B. Fünf Hauptoriginale zu ATSG, MVG, MVV, ÜLG und ÜLV sowie zwei ELG-Originale wurden erneut abgerufen. Die tragenden Artikel und Indexprojektionen wurden verglichen. Vier Berner Erlassantworten und sieben Original-PDFs stimmen mit AP20B überein. Die Wiederverwendung der früheren PDF-Fassungsvergleiche, Kalender- und Rechtsprechungsbefunde ist ausdrücklich dokumentiert.

Das nachgewiesene Anwendungsfenster bleibt **01.01.2026–31.12.2027**. Auslöser, erforderliche Bezugsdaten und vollständiger Rechenweg müssen gedeckt sein. Der Anfang bezeichnet kein behauptetes erstmaliges Inkrafttreten, das Ende keine gesetzliche Aufhebung. Die unveränderte ELG-Organnorm wird über die Konsolidierungsgrenze vom 1. Januar 2027 hinweg belegt.

- Aufgehobene MVG-Sonderfristen werden nicht wieder eingeführt. Ein MVV-Vorbescheid begründet keine feste 30-Tage-Einwandfrist. Nur eine konkret qualifizierte Tagesanordnung kann den ADM-Pfad nutzen.
- Medizinal-, Tarif- und Schiedsverfahren bleiben ausserhalb der positiven MVG-Anbindungen.
- Die materielle ÜLG-Geltendmachungsfrist und behördliche ÜLV-Bearbeitungsfristen werden nicht als Rechtsmittelfristen berechnet.
- Auslands-, Drittparteien- und ungeklärte Zuständigkeitsfälle sowie andere gerichtliche Tagesfristen bleiben unmodelliert. Kein Rückfall auf ein allgemeines ATSG- oder VRPG-Modell.

## Prüfresultate

| Prüfung | Ergebnis |
| --- | --- |
| Gesamte Kern- und Oberflächenregression | 1694 bestanden, 0 fehlgeschlagen |
| Neue C3-Kerntests | 161 bestanden, darunter 80 konkrete Datumsprüfungen über acht neue Anbindungen sowie 42 Bestandsberechnungen mit identischen Ergebnissen und Rechenspuren |
| Neue C3-Oberflächentests | 16 bestanden, exakte Fallfakten, keine Zuständigkeitsableitung, frühes Datum, Standards und Sprachtexte |
| Governance | 133 bestanden, 0 fehlgeschlagen |
| Öffentliche Webausprägung | 12 bestehende Prüfungen bestanden, produktiver Datenpin unverändert |
| SPFx-Quell- und Ladertests | 140 bestanden, darunter 17 neue C3-Gruppen |
| Tatsächlich gebautes Produkt | 65 bestanden, darunter neun neue C3-Gruppen. Die 80 Datumsfälle im erzeugten ES5-Kern bilden eine dieser Gruppen |
| Build | Typprüfung, isolierter SPFx-Build, CSS- und Paketprüfung bestanden. Bestehendes SPPKG unverändert |
| Lokaler Browser | Einsprache und Beschwerde für MVG und ÜLG jeweils mit vollständigen Eingaben bis zur alleinigen Kandidatensperre geprüft. DE-/FR-Darstellung, Erlass-/Handlungswechsel, erhaltenes Zustelldatum und leere Fallfelder nach Neuladen geprüft |

Die Zahlen sind nicht additiv. Der zusätzliche getrennte KI-Review hat 2754 Eingabeprojektionen der neun bisherigen Erlasse gegen den tatsächlichen gesicherten C2-Mapper ohne Abweichung verglichen. Dies ist keine menschliche Zweitfreigabe. Die Fachverantwortung bleibt bei David Steimer.

Die Browserprüfung fand ausschliesslich lokal statt. Die Konsole meldete keine Warnungen oder Fehler. Native Datumsfelder wurden fokussiert und mit Tastaturereignissen geprüft. Nach dem Sprachwechsel wurden die neu beschrifteten Elemente verwendet. Fehler bei der automatisierten Elementauswahl wurden anhand des tatsächlichen Seitenzustands geklärt und nicht als bestandene Produktinteraktion gewertet. Angeordnete Verwaltungstagesfristen und Beschwerdeverbesserungen sind automatisiert abgedeckt, nicht jeweils als eigener vollständiger Browserfall durchgeführt. Keine neue M365-, Gast- oder Produktionsprüfung.

## Historische Nachweise

Der [Prüfnachweis AP20C3](../../outputs/ap20c3-2026-10-01/pruefprotokoll.json) bindet den neuen Quellstand und die abgeschlossenen Prüfungen. Der [Buildernachweis](../../outputs/ap20c3-2026-10-01/build-verification.json) weist die unveränderten Bestandsobjekte separat aus.

AP20C2-Abnahmenotiz, -Bericht, -Prüfprotokoll, Daten und bestehende Tests bleiben unverändert. Die acht gemeinsam weiterentwickelten UI-/Vorschau-/Builddateien wurden **vor der Änderung byteidentisch gesichert** unter [AP20C2-Ausgangsstand](../../outputs/ap20c3-2026-10-01/ap20c2-baseline/). Der neue Nachweis prüft sämtliche 57 C2-Dateibindungen gegen diese Vorbilder oder die unveränderten Originaldateien. Die früheren C1-Vorbilder und 15 AP20B-Nachweisdateien bleiben erhalten. Die Fortschreibung ist keine rückwirkende Veränderung einer Abnahme oder ihrer Prüfsummen.

## Vorschau und nächster Haltepunkt

- [MVG-Vorschau](http://127.0.0.1:8797/?candidate=ap20c3&qa=ap20c3-mvg)
- [ÜLG-Vorschau](http://127.0.0.1:8797/?candidate=ap20c3&qa=ap20c3-uelg)

Beide Einstiege wählen nur Erlass und Einsprache vor. Datum und Fallbefunde bleiben leer. Ohne Kandidatenparameter verwendet die Standardvorschau weiterhin MVP 0.5. Ohne operative Freigabe entsteht auch mit vollständigen Angaben **kein Fristende**. Die positiven Rechentests verwenden ausschliesslich synthetische Freigaben im Testspeicher, nicht im Kandidaten oder in der Vorschau.

Die **fachlich-technische AP20C3-Abnahme durch David Steimer steht aus**. Danach können die gesonderte Releasevorbereitung, der erforderliche Quellenabgleich und die kontrollierte Datenübernahme beauftragt werden. Die lokale Integration aller fünf AP20-Erlasse ist keine pauschale Freigabe sämtlicher Verfahren dieser Gesetze und keine Erweiterung auf weitere Kantone.

Kein Quellcode-Commit oder Push, keine Datenpromotion, neue Releaseversion, E-/Q-/P-Installation, Mirror- oder Berechtigungsänderung. GitHub dient nur der Issue-Nachführung. Codex arbeitet als KI-Arbeitsinstrument ohne formelle Freigabe- oder Haftungsverantwortung.
