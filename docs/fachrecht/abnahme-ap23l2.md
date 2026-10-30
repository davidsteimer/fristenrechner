# Abnahme AP23L2 und Auftrag AP23L3

Stand: 27. Oktober 2026. Fach- und Entscheidungsverantwortung: David Steimer.

## Wortlaut des Nutzerentscheids

> AP23L2 ist technisch abgenommen. Ich bestätige DEC-2026-041 mit Katalog 9.0.0 sowie Manifest und Mindestconsumer 16.0.0. Bitte starte AP23L3.

## Bedeutung und Grenzen

AP23L2 ist technisch abgenommen. DEC-2026-041 ist mit Administrativkatalog `9.0.0`, Manifest `16.0.0` und Mindestconsumer `16.0.0` beschlossen. AP23L3 darf die lokale native Produktintegration und deren tatsächliche lokale Artefaktprüfung durchführen.

Die Abnahme ist ein gesonderter menschlicher Entscheid. Der ursprüngliche technische [L2-Abschlussnachweis](../../outputs/ap23l2-2026-10-27/local-completion.json) bleibt byteidentisch mit seinen damaligen Kennzeichnungen `technicalL2Acceptance: false`, `formatDecision: false` und `l3Started: false`. Sie werden nicht rückwirkend umgeschrieben.

Das [autonome Abnahmearchiv](../../outputs/ap23l2-abnahme-2026-10-27/receipt.json) enthält genau die 136 gebundenen Dateien und den ursprünglichen Abschlussnachweis als 137 unveränderte Nutzdateien. Der gesonderte Beleg dokumentiert den neuen Entscheid und den Auftrag zu L3. Vor der Archivbildung werden sämtliche 9048 geschützten L2-Eingaben erneut gegen ihre Sollbytes geprüft. Sie werden nicht nochmals kopiert.

Nicht umfasst sind Source-Release, Git-Commit oder Push, Upload, Installation, Mirrorwechsel, Änderungen an AP5 oder AP21 sowie E-, Q- oder P-Betriebsänderungen. Die spätere fachlich-technische Abnahme von AP23L3 und jede operative Freigabe bleiben gesondert.

## Nachweise

- [Separater DEC-Beschluss](../entscheidungen/DEC-2026-041-beschluss.md)
- [Unveränderter technischer Vertragsvorschlag](../architektur/verwaltungsverfahrensvertrag-ap23l2.md)
- [Unveränderter L2-Prüfbericht](../architektur/verwaltungsverfahrensvertrag-ap23l2-pruefung.md)
- [Archivierer und autonome Rückprüfung](../../scripts/archive-ap23l2-acceptance.mjs)
