# AP23G2 Technische Prüfung und Abnahmevorlage

Stand: 22. Oktober 2026. **Die isolierte Vertrags- und Datenprobe ist bestanden und liegt zur technischen Abnahme vor.** Die Fachabnahme von G1 ist in [einem eigenen Nachweis](../fachrecht/abnahme-ap23g1.md) dokumentiert. [DEC-2026-036](../entscheidungen/DEC-2026-036-eroeffnungsketten-und-begruendungsverlangen-v4.md) ist vorgeschlagen, nicht beschlossen. Weder G3 noch ein neuer Release sind damit freigegeben.

## Ergebnis

Der [Vertragsentwurf](verwaltungsverfahrensvertrag-ap23g2.md) benötigt Katalog **4.0.0** und Manifest/Mindestconsumer **11.0.0**. Die Änderung betrifft neue Handlungen, Eröffnungsketten, aktuelle Fallqualifikationen, Hinweiswirkung und die rechtliche Verwendung physisch gleicher Kalenderdaten. Unverändert bleiben die Tagesarithmetik, die Kalender- und Feiertagskatalogformate sowie persönliche Vorgaben im Format 5.

Die tatsächlichen Kandidatenbytes umfassen 58 Pfade und Qualifikationsregeln, elf Katalogerlasse, 20 Stillstandsprofile, 13 rechtliche Feiertagsverwendungen und 33 Kalender. 42 Altdefinitionen und ihre Qualifikationsregeln bleiben exakt erhalten. 41 der 42 Manifestartefakte sind byteidentische F3-Referenzkopien. Die Strukturprobe ist nicht durch einen nativen Format-11-Produktreader lesbar und keine vollständige neue Releasebindung.

Manifest SHA-256: `f7193786575ee9f58063859b3af2daca738b766d5a73bd9ddacf474310124187`.

## Ausgeführte Prüfungen

| Prüfung | Tatsächliches Ergebnis |
| --- | --- |
| Vier isolierte Schemata und Kandidatenneubildung | Reproduzierbar, Schema- und Rohbytebindungen stimmen |
| 115 abgenommene G1-Fälle am tatsächlichen Kandidaten | 70 Datumssollwerte, sieben begrenzte Endverschiebungskollisionen, 34 Qualifikationsgrenzen, vier Fenstergrenzen wie erwartet |
| Bestehende Tagesarithmetik mit echten Kalendern | Unverändert importiert und auf die neuen Kandidatenparameter angewendet. Keine kopierten Forschungsfeiertage als Rechenbasis |
| Feiertagsproben | 18 Einzelproben und sechs Jahreszählungen bestanden. UR 14, SO 13 und SH 13 unterschiedliche Daten je Jahr |
| 43 Katalogmanipulationen | Alle nach erneuter Versiegelung der Pfad-/Policy-/Eligibilityhashes zurückgewiesen |
| 38 Input-Manipulationen | Fehlende Pflichtangaben, falscher Kanton, unbekannte Eröffnungskette, Spezialrecht, Stundeneinheit, Normlücke und Normüberlappung gesperrt |
| Sechs tatsächliche Altreader-/Altvertragsproben | Katalog 4 / Manifest 11, umetikettierte und neu gehashte Varianten sowie eine formal gültige Änderung im 42er-Altinventar zurückgewiesen |
| 42 Bestandsberechnungen | Im unveränderten nativen Format-10-Referenzkontext erfolgreich. Zusätzlich 126 kopierte, serialisierte oder frei konstruierte Kontexte gesperrt |
| Getrennte Pythonprüfung | Alle 115 Fälle mit tatsächlichen Kandidatenparametern, vier Schemata und 33 Kalenderdateien bestanden. 18 neu gehashte Strukturmanipulationen und zwei formale Altformatproben zurückgewiesen |
| Forschungsabnahme-Archiv | 63 Payloads einschliesslich 32 Quellenoriginalen vollständig rückgeprüft. 40 gezielte Archivtests bestanden |
| Bestandsschutz | 120 F3-Bindungen, 434 historische Dateien, elf weitere F1-Dateien, 197 F3-Archivpayloads und alle 43 F3-Kandidatendateien unverändert |
| TypeScript | `tsc --noEmit` bestanden. Keine native Runtime- oder UI-Änderung aus G2 |

Die Zählungen sind unterschiedliche Prüfklassen und keine Zahl voneinander unabhängiger Rechtsbeweise. Die gemeinsame fachliche Grundlage bleibt Davids abgenommene G1-Vorlage. Technische Parallelprüfungen durch KI sind kein menschliches Vieraugenprinzip.

## Wesentliche Gegenproben

Die Tests trennen insbesondere die SO-/SH-Begründungsangebote von einer beliebigen unbegründeten Verfügung, das SH-Dreissigtageverlangen von der Verwaltungsanforderung und die rechtzeitige Voranforderung vom blossen Vorliegen einer späteren Begründung. Unbekannte aktuelle Fallfakten werden nicht aus Forschungsannahmen oder Defaults ergänzt.

UR-Art.-22-Hinweise sind nur auf den zwei abgenommenen Zwanzigtagewegen vorhanden und verändern kein Datum. Acht Tage um Ostern und das Ende am 6. Januar sind ausdrücklich gegen versehentliche Siebentage- beziehungsweise 2.-Januar-Übernahme geprüft. Die Koordinationsgrenze wird nicht auf die angeordneten Eingaben ausgedehnt. Die lokale Grenze betrifft die konkret mögliche ungeklärte zusätzliche Endtagswirkung, keine pauschale kommunale Negativfreigabe.

Die SH-Verwaltung verwendet die physischen SH-Daten nur mit eigener VRG-/RTG-/BGer-Bindung. Ein Ersatz durch OGE-/ZPO-Provenienz, fehlender Praxiszusatz, falsche Regelprojektion, freier Pinpoint oder eine geänderte Fassung werden zurückgewiesen. Die gerichtliche `courtSeat`-Rolle bleibt davon getrennt.

Der ergänzende Gegenreview fand im ersten Prüfskript noch zu weite Metadatenprüfungen, nicht fehlerhafte Kandidatendaten. Quellen-URLs, Fassungsangaben, Pinpoints, Erlassidentitäten, Profilquellen, Projektionsidentität und Ausschlusstexte sind deshalb zusätzlich als 30 unabhängig gegengeprüfte Vorschlagsobjekte eingefroren. Alle 13 eigens reproduzierten Lückenvarianten werden nun abgelehnt. Diese Pins schützen die geprüfte Identität, beweisen aber keine rechtliche Richtigkeit und ersetzen weder die semantischen G1-Zuordnungen noch die Datumsprüfung.

## Reproduktion und Nachweise

Aus dem Projektordner mit der vorhandenen Node-22-Toolchain beziehungsweise der Projekt-Pythonumgebung ausführen. Ohne Schreiboptionen werden keine historischen Nachweise neu erzeugt.

```text
node scripts/build-ap23g2-schemas.mjs
node scripts/build-ap23g2-candidate.mjs --check
node --import tsx scripts/check-ap23g2-contract.mjs
.venv/bin/python scripts/check_ap23g2_independent.py
node scripts/archive-ap23g1-acceptance.mjs --check
node --test tests/governance/ap23g1-acceptance.test.mjs
node scripts/check-ap23g1-preservation.mjs
node node_modules/typescript/bin/tsc --noEmit
node scripts/finalize-ap23g2.mjs
```

- [JS-Gesamtergebnis](../../outputs/ap23g2-2026-10-22/QA-AP23G2.json), mit Inputs, Fallresultaten, Manipulationsklassen und Evidenzhashes
- [Unabhängiger Python-Nachweis](../../outputs/ap23g2-2026-10-22/QA-AP23G2-INDEPENDENT.json), ohne Produkt-, JS-Checker- oder Builderimporte
- [Vertragsgegenreview](../../outputs/ap23g2-2026-10-22/contract-gap-review.md), einschliesslich Metadatenverschärfung und erneutem Manipulationstest
- [Tatsächliches Kandidateninventar](../../outputs/ap23g2-candidate-2026-10-22/candidate-integrity.json)
- [Lokaler Abschluss](../../outputs/ap23g2-2026-10-22/local-completion.json), mit den endgültigen Datei- und Prüfbindungen

## Nächster Entscheid

Vorgeschlagene Bestätigung:

> AP23G2 ist technisch abgenommen. Ich bestätige DEC-2026-036 mit Kantonalverfahrenskatalog 4.0.0 sowie Manifest und Mindestconsumer 11.0.0. Die begrenzten Fachbehandlungen aus G1 und der Schutz der bisherigen 42 Pfade bleiben erhalten.

Danach kann G3 separat gestartet werden. G3 umfasst den nativen Reader, geschlossene aktuelle Fallqualifikation, DE-/FR-Oberfläche und Rechenspur, Standards, Exportsperren, konkrete Zielreleasebindungen und lokale Hostintegration. Die vorliegende Strukturprüfung ersetzt diese Produktprüfungen nicht.

Keine Quellenpromotion, Auslieferungsbauten, Commits, Quellpushs, Installation oder Änderungen an E/Q/P, Mirrors, AP5, AP21, Berechtigungen und Hosting. Der nächste reguläre Release bleibt bis zur vereinbarten Kantonsabdeckung gebündelt.
