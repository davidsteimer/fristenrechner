---
id: DEC-2026-024
titel: "Nationale Sozialversicherungsmodelle mit getrennter bernischer Erstfreigabe"
status: beschlossen
entscheidungsdatum: 2026-09-25
klasse: B
entschieden_durch: David Steimer
quelle:
  - "Ausdrückliche Zustimmung zur nationalen Modellierung mit bernischer Erstfreigabe und anschliessender Startauftrag im Projektgespräch vom 25. September 2026"
ersetzt: []
ersetzt_durch: null
---

# DEC-2026-024: Nationale Sozialversicherungsmodelle mit getrennter bernischer Erstfreigabe

## Ausgangslage

AP17 enthält zwölf begrenzte Sozialversicherungspfade aus IVG, AHVG und UVG. Der geltende Spezialregimevertrag verknüpft diese bewusst mit Bern. Weitere bundesrechtliche Sozialversicherungsverfahren sollen ergänzt werden, ohne daraus später 26 Kopien derselben Bundesregeln zu machen. Der schweizweite Feiertagsbestand aus AP18 ist vorhanden, seine Verwendung für weitere Verfahrens- und Ortskonstellationen jedoch nicht automatisch freigegeben.

## Geprüfte Optionen

1. **Weitere Bern-spezifische Modelle mit späterer Verallgemeinerung.** Kleinerer erster Strukturwechsel, jedoch spätere Duplikation oder erneuter Umbau gemeinsamer Bundesregeln.
2. **Kantonsneutrales Bundesrechtsmodell mit separater kantonaler Anbindung und Freigabe.** Wiederverwendbare Regeln von Anfang an, dafür eine explizite Grenze zwischen fachlicher Modellierbarkeit und produktiver Berechenbarkeit.

## Entscheid

David Steimer hat die vorgeschlagene Ausbaurichtung mit folgender Präzisierung bestätigt:

> Einverstanden, solange klar ist, das die weiteren Modelle zwar nur für den Kanton Bern freigegeben werden, aber so modelliert sind, dass sie national funktionieren. OK?

Nach Bestätigung dieser Trennung hat er den Start beauftragt. Damit ist Option 2 beschlossen:

- **Bundesrechtliche Regelmodelle sind kantonsneutral.** Einzelgesetz, Sachgegenstand, Handlung, Stadium, Fristauslöser, Dauer, Stillstand und Normspur enthalten keine fest eingebauten Berner Werte.
- **Kantonale Anbindungen bleiben eigenständig.** Zuständigkeit, ergänzendes Verfahrensrecht sowie Feiertags- und gegebenenfalls örtliche Anknüpfung werden getrennt beschrieben. Gemeinsame Regeln werden referenziert, nicht kopiert.
- **Freigaben sind ausdrücklich begrenzt.** Erste produktive Freigaben sind nur für konkret geprüfte bernische Konstellationen vorgesehen. Dieser Beschluss erteilt sie noch nicht.
- **Ausserkantonale Modellproben prüfen Wiederverwendbarkeit.** Sie sind keine fachliche oder betriebliche Freigabe anderer Kantone und dürfen nicht in die produktive Auswahl gelangen.

## Begründung

Die einheitliche bundesrechtliche Regel wird einmal gepflegt. Unterschiedliche Zuständigkeits- und Ortsanknüpfungen bleiben trotzdem sichtbar. Damit können weitere Kantone nach ihrer gesonderten Fachprüfung angebunden werden, ohne allein wegen des Kantonswechsels die Bundesregel oder den Rechenkern umzubauen.

## Folgen

### Auswirkungen

- [AP19](../fachrecht/sozialversicherungsrecht-ap19.md) beginnt mit einem Fach- und Modellpaket. Die erste Tranche umfasst ELG, AVIG und KVG in ausdrücklich begrenzten Leistungs- und Verfahrenskonstellationen.
- Der abgenommene zweispaltige Aufbau und die DE-/FR-Produkttexte bleiben Leitplanken. Aus einer eindeutigen Handlung ableitbare Angaben werden nicht nochmals abgefragt.
- Die technische Modellprobe liegt ausserhalb der Produktlaufzeit. Eine definitive Schemaversion, Manifestversion und Migration werden erst nach dem Modellcheck vorgeschlagen und gesondert entschieden.

### Risiken und Grenzen

- National modellierbar bedeutet nicht, dass jedes gerichtliche Verfahren ausschliesslich bundesrechtlich geregelt wäre.
- «Sitz der zuständigen Stelle», kantonaler Verfahrenskontext und Feiertagsanknüpfung sind unterschiedliche Merkmale. Insbesondere wird der Sitz eines überkantonal tätigen Versicherers nicht zum automatischen Feiertags- oder Gerichtskanton.
- Weder unbekannte Zuständigkeit noch ungeklärte Eröffnung, Feiertagsregion oder fehlende Freigabe dürfen durch einen Berner Ersatzwert geheilt werden.
- Keine neuen materiellen Leistungs-/Verwirkungsfristen, generischen Gerichtsfristen, Monatsfristen oder behördlichen Fixtermine durch diesen Entscheid.
- Keine Aufhebung der bestehenden AP18-Grenzen, insbesondere keine pauschale Übertragung der GR-Modellannahme auf ATSG-Fälle und kein Wegfall des NE-Vorbehalts.

### Folgearbeiten und Rückabwicklung

- [Modellcheck AP19A](../architektur/sozialversicherungsmodell-ap19a.md), Fachmatrix, Quellen und Referenzfälle zur Abnahme vorlegen.
- Änderungen am produktiven Vertrag benötigen einen eigenen konkret gebundenen Folgeentscheid. DEC-2026-020 und DEC-2026-023 bleiben für MVP 0.4 unverändert gültig.
- MVP 0.4 bleibt eingefroren. Kein neuer Build, keine Datenpromotion, kein GitHub-Push, keine E-/Q-/P-Bereitstellung und keine Hostingänderung durch AP19A.
- Die lokale Arbeitskopie wird im eigenen Entwicklungsbranch geführt. Benutzerdateien und Backups bleiben unverändert.

## Nachweise

- [AP19: Arbeitsauftrag und aktueller Stand](../fachrecht/sozialversicherungsrecht-ap19.md)
- [AP17B: bestehende fachliche Abgrenzung](../fachrecht/vrpg-anwendbarkeit-ap17b.md)
- [DEC-2026-014: Komponentenweise Formatevolution](DEC-2026-014-komponentenweise-fachdatenformatevolution.md)
- [DEC-2026-020: geltender Spezialregimevertrag](DEC-2026-020-qualifizierter-spezialregimekatalog-v3.md)
- [DEC-2026-023: Feiertagskatalog und begrenzte operative Projektion](DEC-2026-023-schweizweiter-feiertagskatalog.md)

## Verantwortlichkeit

David Steimer trifft Umfangs-, Fach- und Freigabeentscheide in Personalunion. Codex bereitet die Grundlagen und technischen Nachweise vor, ohne formelle Freigabe- oder Haftungsverantwortung. Der Startauftrag und dieser Architekturgrundsatz sind keine Abnahme der erst danach erstellten Fachregeln oder Modellprobe.
