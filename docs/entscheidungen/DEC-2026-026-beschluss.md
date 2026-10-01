---
bezugsentscheid: DEC-2026-026
dokumenttyp: beschlussnachweis
titel: "Beschluss zu Sozialverfahrenskatalog 2 und Manifest 6"
status: beschlossen
entscheidungsdatum: 2026-09-30
klasse: B
entschieden_durch: David Steimer
vorlage: DEC-2026-026-sozialverfahrenskatalog-v2.md
vorlage_sha256: ef0251f40b4cec08233ff135cd3ded7b2a05a9ffb0675b36e4278788d7a2a779
ersetzt: []
ersetzt_durch: null
---

# DEC-2026-026 Beschlussnachweis

David Steimer hat am 30. September 2026 nach der [AP20B-Abnahme](../fachrecht/abnahme-ap20b.md) ausdrücklich erklärt:

> Ich bestätige DEC-2026-026 mit Sozialverfahrenskatalog 2.0.0 sowie Manifest und Mindestconsumer 6.0.0.

**DEC-2026-026 ist damit beschlossen.** Dieser Nachweis dokumentiert den aktuellen Entscheidungsstatus. Der [prüfsummengebundene Entwurf](DEC-2026-026-sozialverfahrenskatalog-v2.md) bleibt unverändert als eingereichte Vorlage erhalten. Es handelt sich nicht um einen neuen Entscheid oder eine neue DEC-ID.

## Verbindlicher Entscheid

Der in AP20B vorgelegte [Vertragsnachtrag](../architektur/sozialversicherungsvertrag-ap20b.md) wird als technischer Folgeproduktvertrag bestätigt, insbesondere mit:

- Sozialverfahrenskatalog **2.0.0**
- Release-Manifest **6.0.0**
- Mindestconsumer **6.0.0**

Die 20 zusätzlichen nationalen Handlungspfade und 22 Berner Anbindungen bleiben im fachlich abgenommenen AP20-Umfang. Nationale Modellierung und zunächst ausschliesslich bernische Produktfreigabe bleiben getrennt. Rechenkern, übrige Komponentenformate, Mirrorstruktur und die dokumentierten fachlichen Ausschlüsse werden durch den Beschluss nicht erweitert.

Die Optionen, Begründung, Auswirkungen und Rückabwicklungsgrundsätze ergeben sich unverändert aus der gebundenen Entscheidungsvorlage. DEC-2026-025 bleibt als Vertrag der bisherigen Ausprägung und ihrer historischen Releases erhalten.

## Bindung und Erhaltung des Nachweises

Die Vorlage hat SHA-256 `ef0251f40b4cec08233ff135cd3ded7b2a05a9ffb0675b36e4278788d7a2a779`. Das [AP20B-Prüfprotokoll](../../outputs/ap20b-2026-09-30/pruefprotokoll.json) hat SHA-256 `8d67ad7b6e0541104cfa7e8f124cf1e206cdbe6c82111b287dcc4ae54cf9c25d` und bindet die 15 vorgelegten Nachweisdateien. Beide Prüfsummen und sämtliche 15 Dateibindungen wurden bei dieser Beschlussnachführung unverändert bestätigt.

Die früheren Angaben «vorgeschlagen», «noch nicht beschlossen» und «ausdrückliche Bestätigung ausstehend» in der eingefrorenen Vorlage und der vorangegangenen Abnahmenotiz dokumentieren die damalige Reihenfolge. Für den aktuellen Status sind dieser Beschlussnachweis und das nachgeführte Entscheidungsregister massgebend. Historische Kandidaten- und Prüfflags werden nicht rückwirkend umgeschrieben.

## Folgearbeiten und Freigabegrenzen

Die fachliche und architektonische Grundlage für **AP20C1** ist nun vollständig bestätigt. Vorgesehen sind das Consumer-/Schemadelta, die Prüfung des Bestandsschutzes und die EOG-Integration. Ein Startauftrag für AP20C wird durch diese reine Beschlussnachführung nicht vorweggenommen.

Keine Produktaktivierung, neue App-Version, Datenpromotion, Quellenreleasefreigabe, Quellveröffentlichung, E-/Q-/P-Bereitstellung, Mirroränderung oder Berechtigungsänderung. Bestehende Produktdaten und Laufzeitstände bleiben unverändert. Die spätere Implementierung und ihre Prüfresultate sind gesondert abzunehmen.

## Verantwortlichkeit

David Steimer hat den Entscheid in Personalunion getroffen. Codex dokumentiert ihn als KI-Arbeitsinstrument ohne formelle Freigabe- oder Haftungsverantwortung. [Issue #40](https://github.com/davidsteimer/fristenrechner/issues/40) bleibt als abgenommenes AP20B geschlossen. [#35](https://github.com/davidsteimer/fristenrechner/issues/35) führt die Folgearbeiten weiter.
