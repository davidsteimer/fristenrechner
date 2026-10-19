# AP23E2 Isolierte Vertragsprüfung

Stand: 18. Oktober 2026. **Technische Vorlage bestanden, noch nicht abgenommen.** Die [Fachabnahme AP23E1](../fachrecht/abnahme-ap23e1.md) ist bestätigt. Der [Vertragsnachtrag](verwaltungsverfahrensvertrag-ap23e2.md) und [DEC-2026-033](../entscheidungen/DEC-2026-033-qualifizierte-kantonalverfahren-v2.md) bleiben vorgeschlagen. Die folgenden Prüfungen sind keine bereits erfolgte Produktintegration.

## Geprüfter Gegenstand

- Vier Kandidatenschemata für Katalog 2, Manifest 9, lokalen Referenzmanifest und explizite Fallangaben unter [schemas/candidates/ap23e2](../../schemas/candidates/ap23e2/).
- Ein deterministisch erzeugter [Strukturkandidat](../../outputs/ap23e2-candidate-2026-10-18/bundle/manifest.json) mit Manifest und 41 Datendateien. 40 Dateien sind unveränderte MVP-0.8-Referenzkopien, nicht neu freigegebene Zielkomponenten.
- 25 vollständige Pfad-, Qualifikations- und Kandidatenbindungen, davon zwölf unveränderte TI-/GR-Definitionen und dreizehn neue LU-/ZG-/AR-Wege.
- [Kandidateninventar und Herkunftsbindung](../../outputs/ap23e2-candidate-2026-10-18/candidate-integrity.json).

## Ergebnisse

| Prüfung | Ergebnis und Aussagegrenze |
| --- | --- |
| Wiederholte Erzeugung | Schemas und Kandidatenbytes stimmen bei erneutem Aufbau exakt überein |
| Strukturelle Validierung | Vier gültige Draft-2020-12-Schemas, Kandidatenkatalog und lokaler Manifest gültig |
| Neue Referenzen | Alle 51 abgenommenen E1-Fälle bestehen, davon 34 Datumssollwerte und 17 Sperrfälle |
| Manipulierte Kataloge | 18 Varianten abgelehnt, einschliesslich neuer Pfad als Altzweig, fehlender Qualifikation, falscher Hashes, abgeschaltetem AR-O1 und erweitertem Zeitfenster |
| Fehlende oder widersprüchliche Inputs | 35 Varianten abgelehnt, einschliesslich Weglassen jedes der 20 Pflichtmerkmale, falschem Sitzkanton, falscher Revision und unbekanntem Zusatzfeld |
| Unabhängige Gegenprüfung | Separater Python-Prüfer bestätigt Schema- und Bindungsstruktur, Bestandswahrung, 51 Inputformen und zehn eigene Negativproben |
| Historische Pfadsemantik | Zwölf TI-/GR-Pfaddefinitionen und Revisionen unverändert. Je ein bestehender qualifizierter Pfad wird mit dem tatsächlich freigegebenen MVP-0.8-Kontext weiter berechnet |
| Positiver Kostenvorschuss | Der bestehende Tessiner Prozesskostenvorschuss bleibt berechenbar. Kein globaler Zahlungsfristausschluss |
| Alte Reader und Freigabegrenzen | Format-8-Reader lehnen den neuen Kandidaten ab. Blosses Umetikettieren des Manifests genügt nicht. Nicht vertrauenswürdig erzeugte Kontexte bleiben gesperrt |
| Unveränderte Produktbasis | Alle 95 Produktquelldateien einschliesslich der abgenommenen lokalen UX-Korrektur und die 42 MVP-0.8-Dateien stimmen mit der E1-Bytebindung überein |
| Unveränderte produktive Schemas | Die verwendeten bestehenden Katalog-, Manifest- und lokalen Format-8-Schemas sind separat auf ihre Ausgangsprüfsummen geprüft |

Die maschinenlesbaren Nachweise sind [QA-AP23E2.json](../../outputs/ap23e2-2026-10-18/QA-AP23E2.json) und [QA-AP23E2-INDEPENDENT.json](../../outputs/ap23e2-2026-10-18/QA-AP23E2-INDEPENDENT.json). Der Hauptbericht bindet die tatsächlichen Dateien mit Prüfsumme und Byteanzahl. Diese Berichte bescheinigen keine vollständige Produktregression eines noch nicht implementierten Format-9-Readers.

## Prüfmethodik

Der [JavaScript-Vertragschecker](../../scripts/check-ap23e2-contract.mjs) prüft die bestehenden generischen Kataloginvarianten zusätzlich an einer flüchtigen Strukturprojektion. Dabei werden ausschliesslich die neuen Qualifikationsfelder entfernt und die alten Versionsbezeichner für diesen Validierungsschritt eingesetzt. Diese Projektion wird weder gespeichert noch an einen produktiven Format-8-Reader oder Rechner übergeben. Die eigentlichen neuen Qualifikationsbindungen und ihre Vollständigkeit werden separat geprüft.

Die E1-Referenzen werden mit ausdrücklich vorgegebenen **synthetischen** Fallangaben adaptiert. Das liefert keine Defaults für unbekannte reale Fälle. Die neue isolierte Qualifikation verwendet die tatsächlichen Regeln des Kandidaten. Erst nach ihrer Prüfung werden die Kalender erzeugt und die unveränderte gemeinsame Tagesarithmetik aufgerufen. Jeder Forschungsfall bleibt `exportAllowed: false`.

Der [Python-Gegenprüfer](../../scripts/check_ap23e2_independent.py) liest JSON und Dateien unabhängig vom JavaScript-Prüfer. Er prüft die Schemas mit einer eigenständigen Bibliothek, berechnet die Definitions- und Rohbytehashes selbst und vergleicht die neuen Pfade mit der abgenommenen E1-Grundlage. Er verwendet keinen Produktreader. Die weiterhin gebundenen unabhängigen E1-Rechner bleiben der vorgängige rechnerische Vergleichsmassstab.

## Nachweis zur AR O1 Diagnose

Beim Empfang vom 18. Februar 2027 ist der letzte gezählte Tag der 20. März. Der vorhandene Tageszähler erkennt den Konflikt bereits beim Verschieben auf den **21. März**, den ersten Stillstandstag. Der E1-Referenzrechner prüft erst nach der gewöhnlichen Wochenendverschiebung und erkennt ihn am **22. März**.

Beide Prüfwege liefern denselben abgenommenen Sperrausgang ohne definitives Enddatum und ohne Export. Die unterschiedliche Diagnosestelle ändert weder den rechtlichen Entscheid noch die Referenzfallannahme. Die spätere Rechenspur soll den letzten gezählten Tag und den Eintritt in den Stillstand verständlich benennen, nicht eines der beiden Daten als Fristende ausgeben.

## Erhaltung und verbleibende Folgeprüfungen

Die fünf bestehenden Rechtsprofile, 32 Kalender, die Feiertags- und Spezialregimekataloge sowie die 44 Sozialregeln und 50 BE-Anbindungen bleiben als Referenzbestand erhalten. Die alten Quellenmetadaten werden nicht durch einen neueren Prüfstatus überschrieben. Die einzige bereits bekannte doppelte Bundesfeiertagsprovenienz wird nicht als neue Kollision ausgegeben.

Noch ausstehend sind der technische Beschluss, der produktive Format-9-Reader und seine Capability-Bindung, vollständig neu gebundene Zielkomponenten, die konkrete DE-/FR-UI, Defaults-/Export-/Providerintegration und die gesamte Produkt- und Hostregression. Nach dieser lokalen Integration folgen zusammengeführte Quellenprüfung, Datenübernahme, Auslieferungsbuilds und Betriebsfreigaben getrennt.

AP23E2 hat keinen neuen Web- oder SPFx-Build erzeugt, keine Daten promoviert und keine Betriebsumgebung verändert. Kein Commit, Push, Upload oder Browserdatenreset.
