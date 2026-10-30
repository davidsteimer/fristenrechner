# AP23F2 Isolierte technische Vertragsprüfung

Stand: 22. Oktober 2026. **Technische Vorlage bestanden, noch nicht abgenommen.** [AP23F1 ist fachlich abgenommen](../fachrecht/abnahme-ap23f1.md). Der [Vertragsvorschlag](verwaltungsverfahrensvertrag-ap23f2.md) und [DEC-2026-035](../entscheidungen/DEC-2026-035-qualifizierte-kantonalverfahren-v3.md) sind separat zu bestätigen. Die Prüfung aktiviert keine neuen Produktpfade.

## Geprüfter Kandidat

- Vier isolierte Draft-2020-12-Schemata unter [schemas/candidates/ap23f2](../../schemas/candidates/ap23f2/): Katalog 3, Manifest 10, lokaler Strukturmanifest und aktueller Fallinput.
- [Strukturmanifest](../../outputs/ap23f2-candidate-2026-10-22/bundle/manifest.json) mit 42 Artefakten, insgesamt 43 Dateien. SHA-256 `e835661353a0d7d402ecddf04cd7e3c10e58cae1976c2aeddfeb5e046edd34ec`.
- [Kandidateninventar](../../outputs/ap23f2-candidate-2026-10-22/candidate-integrity.json), SHA-256 `eec6edc5068546337a87d5e8dcefb891f42231ccc484267326d13960d1a1ca9b`.
- 42 Pfade und Qualifikationsregeln, davon 25 unveränderte Bestandsdefinitionen und 17 neue ZH-/AG-/SG-Wege. Acht Katalogerlasse, 14 Stillstandsprofile, neun Kalenderverwendungen und 33 physische Kalender.

Die 40 übrigen Datendateien sind rohe MVP09-Referenzkopien. Der neue Zürcher Kalender bleibt ausdrücklich eine lokale, nicht im historischen Katalog aktivierte Projektion. Zusammen mit dem strukturell veränderten Kantonalverfahrenskatalog ergibt das keinen bereits produktlesbaren Datenrelease.

## Ergebnisse

| Prüfung | Ergebnis und Reichweite |
| --- | --- |
| Reproduzierbarkeit | Schemaerzeugung und Kandidaten-Wiederholungsbau stimmen exakt mit den gespeicherten Bytes überein |
| Schemata | Vier gültige Kandidatenschemata. Katalog und lokaler Manifest gültig. Alle 33 tatsächlichen Kalenderdateien gegen das reguläre Format-3-Schema geprüft |
| Abgenommene F1-Erwartungen | Alle 80 Fälle bestehen mit den tatsächlichen Kandidatenparametern. 52 Datumssollwerte, drei F1-O1-Kollisionen, 20 Qualifikationsgrenzen und fünf vollständige Fenstergrenzen |
| Kalender | 19 zusätzliche Konstruktionsproben an tatsächlichen Kalenderregeln bestanden. Die neun Zürcher Regeln sind einzeln aus den exakt gebundenen Ursprungsregeln abgeleitet. AG verwendet die 14er-Prozessliste, SG nicht die ZPO-Liste mit zusätzlichem Januarvorbehalt |
| Katalogmanipulationen | 38 Varianten abgelehnt, einschliesslich neu gehashter Änderungen an Qualifikation, bestehendem Pfad, Ferienbindung, Normstichtag, Quellenmenge und Altzweigzuordnung |
| Inputs und Tagesdeckung | 45 Fehl-/Widerspruchsproben bestanden. Fehlende Pflichtangaben, falsche Zielstelle, AG-/AR-Verwechslung, SG-Ausnahmebelehrung, ZH-Kanalstatus und Lücken erst nach dem Empfang werden erkannt |
| Ältere Leser und Kontextschutz | Sechs Negativgruppen bestanden. Format 9 lehnt Format 10 ab. Auch ein auf 32 Kalender und 41 Artefakte zurückgeschnittenes, schemaformal altes Manifest kann den umetikettierten V3-Katalog mit neu berechneten Hashes und fingierter Bestätigung nicht aktivieren |
| Bestandsrechnung | Alle 25 bisherigen Pfade werden mit dem tatsächlich freigegebenen MVP09-Leser positiv berechnet. Kopierte, frei erfundene und serialisierte Kontexte bleiben für diese Pfade gesperrt |
| Unabhängige Python-Prüfung | Vier Schemata, 33 Kalender, Herkunfts-/Definitionshashes, alle 80 Referenzen und neun eigene strukturelle Negativproben bestanden |
| Erhaltung | 25 alte Pfad- und Policyobjekte sowie die alten Erlasse, Stillstände, Verwendungen, Quellen und Ausschlüsse erhalten. 40 weitere Rohartefakte bytegleich. 479 Basisregeln, zwölf getrennte SO-Regeln, 44 Sozialregeln und 50 BE-Anbindungen unverändert |
| Fachabnahmebindung | Alle elf in der F1-Abnahmenotiz gebundenen Dateien stimmen mit den akzeptierten Bytes überein |

Die unabhängige Inputprüfung lässt 79 der 80 Forschungsangaben schemaformal zu. N14 enthält absichtlich `days: null` und wird bereits dort abgewiesen. 60 Inputs sind vor der anschliessenden Datums-/Fensterprüfung positiv qualifiziert. Das stimmt mit 52 Datumssollwerten, drei F1-O1-Fällen und fünf Fenstergrenzen überein. Keine unbekannte Tageszahl wird ergänzt.

Einzelne Kalenderproben im Januar 2026 und Mai 2028 prüfen nur die Regelkonstruktion. Sie erweitern weder das bestätigte Fallfenster noch die Freigabe der neuen Projektion.

Die historischen Bezeichnungen der F1-Forschungsfälle bleiben unverändert. Ihre Fachfreigabe und die begrenzte Behandlung offener Fragen stehen in der gesonderten Abnahmenotiz. Erfolgreiche isolierte Qualifikation beweist noch nicht die Wirksamkeit einer künftigen UI- oder Exportsperre.

## Quellenzeit und tatsächliche Tagesarithmetik

Die neue Normzeitleiste ist nicht nur ein erläuternder Text. Lücken, Überschneidungen, falsche Stichtage und fehlende tragende Quellen werden unabhängig vom Definitionshash erkannt. Eröffnung, übersprungene Stillstandstage und Endverschiebung dürfen den Rechts-/Quellenrahmen nicht verlassen.

Die Quellenmengen sind je Verwendung präzise:

- ZH Verwaltung/Rekurs: VRG und RLG, kein erfundener unmittelbarer ZPO-Verweis.
- ZH Gericht: VRG, GOG und ZPO. Ab 2027 jeweils zusätzlich Änderungsbeschluss und RRB 715.
- AG: VRPG, ZPO und EG ZPO. Beim qualifizierten Vollstreckungsweg zusätzlich der besondere Praxisnachweis.
- SG: VRP, ZPO, RLG und die zeitlich richtige GerG-Fassung. Bei den konkret unterlegten VRK-Dokumentenzugangswegen zusätzlich OeffG.

Der JavaScript-Prüfer qualifiziert zunächst den synthetischen Fall anhand der tatsächlichen Kandidatenregel. Danach erzeugt er Feiertage aus den gebundenen Kalenderdateien und verwendet die **unveränderte gemeinsame Produkt-Tagesarithmetik**. F1-O1 wird beim ersten Eintritt der Endverschiebung in den Stillstand erkannt. Der historische F1-Rechner bezeichnet teilweise erst den nach gewöhnlicher Wochenendverschiebung erreichten Werktag. Beide Wege liefern denselben fachlich abgenommenen Ausgang ohne definitives Ergebnis.

Die neun neuen Ferienpfade tragen die bestehende Endverschiebungssicherung. Verwaltungswege und der ferienfreie SG-Art.-60-Pfad tragen sie nicht. Die 25 alten Pfade behalten ihre bisherige Semantik, insbesondere den positiven Tessiner Prozesskostenvorschuss und die zwei AR-Sicherungen.

## Unabhängigkeit und technische Belege

Der [JavaScript-Vertragschecker](../../scripts/check-ap23f2-contract.mjs) prüft Kandidatenschemata, Bedeutung und tatsächliche Produkt-Hilfsfunktionen, ohne einen neuen produktiven Leser zu registrieren. Die Erwartungszuordnung wird separat aus der abgenommenen F1-Grundlage gebildet, nicht bloss aus den Builderkonstanten übernommen.

Der [Python-Gegenprüfer](../../scripts/check_ap23f2_independent.py) liest tatsächliche JSON-Dateien, verwendet `jsonschema`, berechnet kanonische Hashes und zählt Datumswerte mit eigener Standardbibliotheksarithmetik. Er importiert weder JavaScript-Prüfer noch Produktreader. Seine neun Manipulationsproben umfassen auch neu gehashte Fehlzuordnungen von ZPO, EG ZPO und künftiger SG-GerG-Fassung.

| Maschinenbericht | SHA-256 |
| --- | --- |
| [QA-AP23F2.json](../../outputs/ap23f2-2026-10-22/QA-AP23F2.json) | `ee6b9df9d2bb68cb8f6143eed455f1ac55f1605c3afb1965b1fa91c9b4a21f8f` |
| [QA-AP23F2-INDEPENDENT.json](../../outputs/ap23f2-2026-10-22/QA-AP23F2-INDEPENDENT.json) | `84a2c090b6b42a3949358ff71b5e6043a5b7d5e51ff0e22aec0f705bb32e0125` |

Beide endgültigen Prüfläufe beziehen sich auf den oben gebundenen Manifeststand und sind anschliessend ohne Schreiboption wiederholt. Frühere lokale Schema-/Projektionskorrekturen betreffen nur die Strukturprobe. Die zuletzt gespeicherten Nachweise und Hashes sind massgebend, nicht vorläufige Zwischenwerte.

## Reproduktion und verbleibende Folgearbeiten

Aus dem Repositoryordner, mit der vorhandenen Node-/Python-Umgebung:

```text
node scripts/build-ap23f2-schemas.mjs
node scripts/build-ap23f2-candidate.mjs --check
node --import tsx scripts/check-ap23f2-contract.mjs
.venv/bin/python scripts/check_ap23f2_independent.py
```

Die Befehle sind lesende Prüfungen. Die vorhandenen Generatoren erzeugen nur mit ausdrücklichem `--write` ihre isolierten Kandidaten beziehungsweise QA-Ausgaben. Es wird kein Web-/SPFx-Paket gebaut und keine produktive Quelldatei geändert.

Vor AP23F3 fehlen die technische Abnahme und der Beschluss von DEC-2026-035. Anschliessend sind der neue native Leser mit Capability-Bindung, konsistente Zielkomponenten einschliesslich Kalenderaktivierung, verständliche DE-/FR-Oberfläche, Standards-/Export-/Providerintegration und die vollständige Produktregression zu implementieren. Historische Formate und AP5 sind dann ebenfalls im konkreten Integrationsstand nachzuweisen. Die heutige Bestandsrechnung ist kein neuer Livehosttest.

Die nächste reguläre Auslieferung bleibt bis zur vereinbarten Kantonsabdeckung gebündelt. AP23F2 enthält keine zusammengeführte neue Releasequellenfreigabe, Datenpromotion, Commits, GitHub-Quellpublikation, Uploads oder E/Q/P-Änderungen.
