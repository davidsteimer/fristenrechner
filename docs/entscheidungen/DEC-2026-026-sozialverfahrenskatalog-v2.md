---
id: DEC-2026-026
titel: "Sozialverfahrenskatalog 2 und Manifest 6 für AP20"
status: vorgeschlagen
entscheidungsdatum: null
klasse: B
entschieden_durch: null
quelle:
  - "AP20A-Abnahme vom 30. September 2026"
  - "Startauftrag AP20B vom 30. September 2026"
ersetzt: []
ersetzt_durch: null
---

# DEC-2026-026: Sozialverfahrenskatalog 2 und Manifest 6 für AP20

## Ausgangslage

EOG, FamZG, FLG, MVG und ÜLG sind als Folgeumfang fachlich abgegrenzt und mit AP20A abgenommen. Der bestehende Produktvertrag kennt diese Erlasse und ihre zusätzlichen Zuständigkeitsfakten nicht. Die geschlossenen Wertemengen verhindern eine sichere Erweiterung allein durch neue Daten im alten Format.

## Geprüfte Optionen

1. **Unveränderte Formate:** verwerfen. Neue Erlass- und Faktenwerte würden den alten Vertrag verletzen oder durch weichere Validierung seine Sicherheitsgrenzen ändern.
2. **Sozialkomponente 1.1 mit neuer Consumergrenze:** möglich, aber ohne praktischen Kompatibilitätsgewinn im bestehenden exakten Versionsvertrag. Zusätzliche Kombination statt einer klaren Hauptversionsgrenze.
3. **Sozialkomponente 2.0.0, Manifest und Mindestconsumer 6.0.0:** empfohlen. Explizite Grenze für das begrenzte semantische Delta. Bestehende Komponenten, Rechenkern und Mirrorstruktur bleiben erhalten.

## Vorgeschlagener Entscheid

Der [AP20B-Vertragsnachtrag](../architektur/sozialversicherungsvertrag-ap20b.md) wird als technischer Folgeproduktvertrag bestätigt:

- Sozialverfahrenskatalog `2.0.0`, Manifest `6.0.0`, Mindestconsumer `6.0.0`.
- Neue geschlossene Gesetzescodes, vier neue Faktenfelder und zwei neue Herkunftswerte für die 20 nationalen Regeln und 22 Berner Anbindungen.
- Quellen-/Referenzfenster 2026–2027 und getrennte Zeitanker gemäss den vorgelegten Fachnachweisen. Eine Quellenabdeckung ist kein behauptetes Inkrafttreten der Normen und keine operative Freigabe.
- Keine neue Rechenart, keine zusätzliche Dateirolle oder Hostinginfrastruktur. Nationale Regeln bleiben wiederverwendbar, Erstfreigabe bleibt auf qualifizierte Berner Konstellationen begrenzt.
- Alte Regeln, Anbindungen, Formate und unveränderliche Releases bleiben erhalten. Neue Freigabeverknüpfungen werden in einem späteren Release neu gebunden, nicht aus dem alten Release kopiert.

Dieser Text ist **noch nicht beschlossen**. Die AP20A-Abnahme und der Start von AP20B ersetzen diesen gesonderten Architekturentscheid nicht.

## Begründung

Die fünf Erlasse benötigen keine abweichende ATSG-Arithmetik. Das relevante Delta liegt in der eindeutigen fachlichen Zuordnung und den Voraussetzungen einer Freigabe. Die ausdrückliche Formatgrenze verhindert, dass alte Verbraucher unbekannte Zuständigkeitsmerkmale übergehen. Die komponentenweise Evolution folgt DEC-2026-014, die nationale Trennung DEC-2026-024.

## Folgen

### Auswirkungen

AP20C kann nach gesondertem Auftrag den Consumer, Schemata, Datenkandidaten und die reduzierte DE-/FR-Oberfläche implementieren. Als Zielbestand sind 44 nationale Regeln und 50 Berner Anbindungen vorgesehen. Die übrigen Komponentenformate und der ATSG-Tagesrechenkern bleiben unverändert.

### Risiken und Grenzen

Der Rechner bestimmt die zuständige Kasse nicht selbst aus dem gesamten Leistungsfall. Freiwillige FamZG-Kassenleistungen, rein kantonale EO-Zusatzleistungen und die weiteren in AP20A ausgeschlossenen Fälle bleiben ausserhalb. Später publizierte Gesetzesänderungen erfordern erneute Quellenprüfung. Die neue Consumerkompatibilität ist erst in AP20C positiv zu beweisen.

### Folgearbeiten und Rückabwicklung

Kein Produktbuild, keine Datenpromotion, Veröffentlichung oder Bereitstellung durch diesen Vorschlag. Die vorhandenen Version-5-Pins bleiben unverändert. Eine spätere Rückabwicklung wechselt auf einen bereits freigegebenen Pin zurück, niemals durch Überschreiben eines historischen Releases. Dieser Nachtrag ergänzt DEC-2026-025 für künftige Erweiterungen und ersetzt dessen historische Gültigkeit nicht.

## Nachweise und Verantwortlichkeit

[AP20B-Vertrag](../architektur/sozialversicherungsvertrag-ap20b.md), [Quellenabgleich Bund](../fachrecht/quellenabgleich-ap20b-bund.md), [Zeitbindung Bern](../fachrecht/zeitliche-bindung-ap20b.md), [Referenznachweis](../fachrecht/referenzfaelle-ap20b.md), [Issue #40](https://github.com/davidsteimer/fristenrechner/issues/40).

Entscheider ist David Steimer. Codex bereitet die Vorlage vor und übernimmt keine formelle Freigabe- oder Haftungsverantwortung.
