# AP22B Prüfnachweis der Vertragsvorlage

Stand: 8. Oktober 2026. **44 isolierte Prüfungen bestanden, 0 fehlgeschlagen.** Geprüft sind Schemata, Strukturübernahme, Referenzindex und Manipulationsabwehr des [Vertragsentwurfs](kalendervertrag-ap22b.md). Kein neuer Produktresolver, keine neue Fristberechnung und kein freigegebener Release wurden gebaut.

## Ausgeführte Prüfungen

| Gruppe | Anzahl | Aussage |
| --- | ---: | --- |
| TypeScript-unabhängige JavaScript-Struktur- und Manipulationstests | 16 | Gebundener Eingangsstand, Erhaltung aller Archivbereiche, 198 Entscheidungen, 104 Bindungen, 32 Kalenderdefinitionen, 20 negative Entscheidungen, vier Januargrenzen, zwölf SO-Ergänzungen und explizite AI-/NE-Regionalvarianten |
| Referenzindex und Nachweisintegrität | 8 | Alle 25 AP22A-Gruppen und acht Gegenproben erhalten. Vier zusätzliche Januarvergleichsproben samt Bindungen, Sollwerten und gekennzeichnetem Nichtausführungsstatus |
| Python-Schemaprüfung Kalender und Manifest | 13 | Neue isolierte Hauptformate, geschlossene Bedingungen und Rollen, Offsetgrenzen, Quellenhashform, dynamisches Inventar sowie Zurückweisung durch die unveränderten alten Schemata |
| Python-Schemaprüfung Katalog | 7 | Vollständige Strukturprobe, unbekannte Felder, fehlende Herkunft, ungültige Datumswerte, unzulässige Halbtagsumdeutung und unvollständige Freigabestatuswechsel |
| **Total** | **44** | Keine ausgeführten Produkt-Fristenfälle |

Die Strukturprobe umfasst 479 unveränderte Bestandsregeln und zwölf separat erfasste SO-Regeln. 355 unterschiedliche Regel-IDs gehören zu den vorgeschlagenen wirksamen Projektionsmengen. Die übrigen archivierten Regeln werden weder gelöscht noch pauschal aktiviert. Die 198 Herkunftsentscheidungen und die 104 terminalen Bindungen sind unterschiedliche Ebenen.

Die Manipulationsprüfungen verwerfen unter anderem fehlende oder duplizierte Bindungen, gelöschte Negativentscheide, wegfallende GR-/NE-Grenzen, eine fehlende Januaralternative, zusätzliche Änderungen in der Gegenrechnung, erfundene Genehmigungen sowie neue Profile ausserhalb des bestätigten Umfangs. Dabei wird der konkrete gebundene Entwurf geprüft, kein allgemeiner künftiger Produktvalidator simuliert.

## Reproduktion und Bindung

```sh
node scripts/build-ap22b-contract.mjs
node scripts/check-ap22b-contract.mjs
```

Der erste Befehl vergleicht die gespeicherte Strukturprobe mit den gebundenen Eingängen. Nur sein ausdrücklicher Zusatz `--write` erzeugt die isolierte Katalogvorlage und ihr Schema neu. Nicht auf nachträglich abgenommene oder manuell ergänzte Dateien anwenden. Der zweite Befehl führt die 44 Prüfungen aus. Mit `--write` legt er den Prüfnachweis und die beiden Protokolle im AP22B-Ausgabeordner ab.

- [QA-AP22B.json](../../outputs/ap22b-vertrag-2026-10-08/QA-AP22B.json) bindet Vertragsdokument, DEC-Entwurf, drei Schemata, Strukturprobe, Referenzindex und Prüfscripte mit vollständigen SHA-256-Prüfsummen.
- [JavaScript-Testprotokoll](../../outputs/ap22b-vertrag-2026-10-08/node-tests.txt)
- [Python-Testprotokoll](../../outputs/ap22b-vertrag-2026-10-08/python-tests.txt)

Die tatsächliche Prüfumgebung verwendete den gebündelten Node **24.19.0** und die bestehende Python-Umgebung **3.12.14**. Diese reinen Struktur-/Schema-Prüfungen sind keine Qualifikation des produktiven Node-22-Builds. Ein solcher Build gehört zur späteren Produktintegration. Die produktive Toolchain wurde nicht verändert oder neu installiert.

## Gegenreview und korrigierter Punkt

Ein zusätzlicher technischer Gegenreview bestätigte die Trennung von fachlichen Regeln, Releasebindungen und historischen Daten. Er fand eine ungenaue Beschreibung der Projektionsidentität. Der Vertrag stellt nun ausdrücklich klar: Die ID wird aus der Listen-/Regel-ID-Menge abgeleitet. Eine Inhaltsänderung bei gleichbleibenden IDs wird durch den Kataloghash und die Release-/Artefaktbindung nachgewiesen. Eine Kalender-ID allein darf deshalb kein Cache- oder Integritätsnachweis sein.

Die gemeinsame Vererbung des Bundeskalenders ist ausdrücklich beschrieben. Die Projektionsmenge enthält geerbte Regeln, ohne die CH-Regel im Kindkalender nochmals zu emittieren. Die semantische Validierung des vollständig gebauten Kalenders bleibt eine AP22C-Aufgabe.

## Nicht durch diese Prüfungen belegt

- Tatsächliche Auflösung und Berechnung aller neuen Kalender in TypeScript oder Python
- Vollständiger Januarvergleich im Rechenkern, ZPO-Zustellwirkung und kalenderbezogene Overridegrenzen
- Neue Defaultmigration, regionale UI-Abfragen und DE-/FR-Darstellung
- Providergebundener Fallback, historische AP5-Integration, SharePoint, Teams oder öffentlicher Build
- Frischer Rechtsquellenabgleich oder eine neue Freigabe künftiger Rechtsstände

Die Quellen-/Modellnachweise vom 2. Oktober 2026 bleiben wiederverwendete AP22A-Grundlagen. Die damaligen 14 Modellproben und 220 Bestandsregressionen wurden hier nicht nochmals ausgeführt oder zu den 44 neuen Prüfungen addiert. Aktuelle Produktdateien, alte Schemata, AP22A-Abschlussdateien und Benutzerbemerkungen bleiben unverändert. GitHub, Mirrors, E/Q/P und Berechtigungen wurden nicht verändert. AP22B liegt zur Abnahme vor, DEC-2026-030 bleibt vorgeschlagen.
