---
id: DEC-2026-022
titel: "Begrenzte Kalenderbedingungen im Arbeitsmappenvertrag 0.6.0"
status: beschlossen
entscheidungsdatum: 2026-09-22
klasse: B
entschieden_durch: David Steimer
quelle:
  - "Fachliche Vorgaben und Umsetzungsauftrag von David Steimer vom 22. September 2026"
  - "AP18B-05, Arbeitsmappe V0.12 und technischer Prüfnachweis"
  - "Ausdrückliche Abnahme von V0.12 und technischem Vertragsnachtrag durch David Steimer am 22. September 2026 im Projektchat"
ersetzt: []
ersetzt_durch: null
---

# DEC-2026-022: Begrenzte Kalenderbedingungen im Arbeitsmappenvertrag 0.6.0

## Beschlussnachtrag vom 22. September 2026

David Steimer hat die Arbeitsmappe V0.12 und den nachfolgenden technischen Vertragsnachtrag ausdrücklich abgenommen. Damit ist Option 3 für den Arbeitsmappenvertrag `0.6.0` beschlossen. Die [gesonderte Abnahmenotiz](../fachrecht/abnahme-ap18b-05.md) bindet die konkrete Datei per SHA-256 und hält die Grenze zur produktiven Verwendung fest.

Dieser Entscheid **ergänzt** [DEC-2026-021](DEC-2026-021-arbeitsmappenvertrag-050.md) um die begrenzten Kalenderbedingungen. Er erklärt dessen unveränderte übrige Regelungen nicht für aufgehoben. Die Felder `ersetzt` und `ersetzt_durch` bleiben deshalb leer. Die nachfolgenden Abschnitte dokumentieren den vorgelegten Vorschlag und seine damalige Abnahmegrenze unverändert. Die dort noch konditional formulierte Bestätigung ist mit diesem Nachtrag erfolgt.

AP18C1 wird mit dem headerbasierten Import der tatsächlichen XLSX-Datei und einem eigenständigen, verlustfreien Fachkandidaten begonnen. Dieser Kandidat ist keine Runtime-Kalenderkomponente und kein Datenrelease. Eine vollständige AP18C-Abnahme, ein neuer Produktformatvertrag sowie Veröffentlichung und Deployment werden damit nicht erklärt.

## Ausgangslage

David Steimer hat vier wiederkehrende Datumsregeln für AR, AI, GL und NE bestätigt und ihre Umsetzung beauftragt. Der verbleibende NE-Sonderfall bleibt ausdrücklich vorbehalten. Die fachliche Vorgabe ist dokumentiert. Der daraus entwickelte technische Vertrag wird hier separat zur Bestätigung vorgelegt, nicht als bereits beschlossener Produktvertrag ausgegeben.

Der beschlossene [Vertrag 0.5.0, DEC-2026-021](DEC-2026-021-arbeitsmappenvertrag-050.md) kennt keine solchen Bedingungen. Er und seine abgenommenen Unterlagen werden nicht inhaltlich überschrieben.

## Geprüfte Optionen

1. Jährliche Einzeldaten würden den Regelcharakter verdecken und dauernde manuelle Fortschreibung verlangen.
2. Eine allgemeine Bedingungs- oder Skriptsprache wäre für fünf neue Regeln unverhältnismässig und schwerer zu validieren.
3. Eine einzelne ausdrücklich typisierte Kalenderbedingung mit vier erlaubten Werten hält Migration, Prüfung und Excel-Bedienung begrenzt.

## Vorgeschlagener Entscheid

Option 3 wird für die Erfassungsarbeitsmappe `0.6.0` gewählt:

- Explizites Feld `condition` für jede Regel, in Excel Spalte AB «Kalenderbedingung».
- Werte `always`, `unlessTuesdayOrSaturday`, `onlyMonday`, `shiftHolyThursdayBy7Days` mit streng begrenzten zulässigen Datumsankern.
- Die 474 bisherigen Regeln werden datumsneutral mit `always` migriert. Fünf neue Regeln ergänzen die vier fachlich bestätigten Fälle.
- Jahresbedingung nicht erfüllt, Gültigkeitsgrenze nicht erfüllt und Eingabefehler bleiben unterscheidbar.
- NE-Einzelfestlegungen bleiben ausdrücklich vorbehalten. Feste LPA-Ergänzungen und Le Landeron bleiben erhalten.

## Folgen und Grenzen

Der Kandidat ist in V0.12 umgesetzt und getestet. Es handelt sich ausschliesslich um einen Arbeitsmappenvertrag. Produktkalenderformat, Runtime-Unterstützung, App-Oberfläche und zusätzliche kantonale Fristenprofile werden damit nicht freigegeben.

Nach Bestätigung kann die AP18C-Übernahme vorbereitet werden. Bei Ablehnung bleibt V0.11 die bisherige Referenz, der neue Kandidat wird nicht exportiert. DEC-2026-021 wird erst bei einem ausdrücklichen Ablösungsentscheid über gegenseitige Verweise als abgelöst gekennzeichnet.

## Nachweise und Verantwortlichkeit

- [Fachvorgaben, Quellen, technische Umsetzung und Grenzen](../architektur/erfassung-ap18b-05.md)
- [QA-Nachweis V0.12](../../outputs/ap18b-05-bedingte-feiertage-2026-09-22/QA-AP18B-05-V0.12.md)

Entscheidung und Freigabe liegen bei David Steimer. Codex ist dokumentiertes Arbeitsinstrument ohne formelle Freigabe- oder Haftungsverantwortung.
