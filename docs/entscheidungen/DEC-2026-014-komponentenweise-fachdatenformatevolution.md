---
id: DEC-2026-014
titel: "Komponentenweise Formatevolution für Spezialregime"
status: vorgeschlagen
vorgeschlagen_am: 2026-08-30
entscheidungsdatum: null
klasse: B
entschieden_durch: null
quelle:
  - "Arbeitspaket AP11A, GitHub-Issue #28"
  - "Eltern-Item #24"
  - "DEC-2026-012"
ersetzt: []
ersetzt_durch: null
---

# DEC-2026-014: Komponentenweise Formatevolution für Spezialregime

## Ausgangslage

Das AP5-Format 1.0.0 beschreibt allgemeine Tagesfristen, Feiertage und Stillstandsperioden. Der AP6-Testvertrag 1.0.0 verwendet ein rechtlich massgebendes Datum und eine positive Fristdauer in Tagen.

Die Spezialbestimmungen im Umfeld von Art. 41 Abs. 3 VRPG verlangen zusätzliche Muster: feste Abstände vor einem Ereignis, bestimmte Wochentage, konkurrierende Anknüpfungen, behördlich festgelegte Daten und Uhrzeiten, unterschiedliche Arten der Fristwahrung sowie materielle Prüfschranken. Eine Erweiterung der bestehenden Felder ohne neue Formatversion würde deren Semantik still verändern.

## Geprüfte Optionen

1. **Komponentenmodell mit neuer Format-Hauptversion**
   - Vorteil: Rechenart, Kalender, Stillstand, Fristwahrung und Sperren bleiben getrennt und wiederverwendbar.
   - Vorteil: Alte Consumer lehnen die neue Hauptversion sicher ab.
   - Nachteil: Manifest, Consumer und Migration müssen in AP11B erweitert werden.
2. **Sonderfelder im bestehenden Rechtsprofil 1.0.0**
   - Vorteil: keine neue Artefaktrolle.
   - Nachteil: bestehende Semantik würde verändert, unbekannte Kombinationen wären schwer prüfbar und DEC-2026-012 würde faktisch umgangen.
3. **Eine fest programmierte Fallliste im TypeScript-Rechenkern**
   - Vorteil: kurzfristig wenig Datenmodellierung.
   - Nachteil: Rechtsänderungen erfordern Codeänderungen, der SharePoint-Mirror verliert seinen Zweck und Quellen sowie Gültigkeit sind schlecht versionierbar.
4. **Freie Formeln in den Fachdaten**
   - Vorteil: hohe Ausdrucksmächtigkeit.
   - Nachteil: unnötige Interpreter- und Sicherheitsrisiken, schwer prüfbare Semantik und keine kontrollierte Menge zulässiger Rechenarten.

## Vorgeschlagener Entscheid

Der Fristenrechner soll Spezialregime mit folgenden Regeln integrieren:

- Das freigegebene AP5-Referenzrelease und seine Formatversion 1.0.0 bleiben unverändert.
- Spezialregime werden als eigener Katalog mit typisierten Komponenten geführt.
- Zulässige Rechenarten sind abschliessend R1 bis R5. Freie Formeln sind nicht zulässig.
- Kalender, Stillstand und Fristwahrung werden über stabile Profile referenziert und nicht in jeder Regel kopiert.
- Datum, Uhrzeit und Fristwahrungsmodus bleiben getrennte Werte.
- Offene Voraussetzungen und rechtlich unbrauchbare Referenzen führen zu `open` oder `blocked`. Es gibt keinen stillen Rückfall auf die allgemeine VRPG-Regel.
- Die produktive Integration erfolgt erst in AP11B mit einer neuen Release-ID, einer neuen Format-Hauptversion und einer zusätzlichen Manifestrolle.
- Der AP6-Bestand 1.0.0 bleibt unverändert. Spezialfälle verwenden einen neuen Testvertrag 2.0.0 mit mehreren benannten Eingaben, Uhrzeiten, Gates und Fristwahrungsanforderungen.
- Kalenderprofil-IDs bilden eine Schnittstelle. Die Spezialregime legen nicht fest, ob konkrete Jahresdaten oder später ein ewiger Kalender dahinterstehen.

## Begründung

Das Komponentenmodell bildet die juristisch entscheidenden Unterschiede explizit ab. Gleichzeitig bleibt die Zahl der Rechenoperationen klein, prüfbar und unabhängig von einzelnen Artikelnummern. Neue Spezialnormen können durch Konfiguration aufgenommen werden, solange sie einem geprüften Muster entsprechen.

Eine neue Hauptversion ist kein Selbstzweck. Sie ist die saubere Aussage, dass alte Consumer diese Regeln nicht verstehen. Genau für diesen Fall verlangt DEC-2026-012 eine inkompatible Formatevolution.

## Folgen bei Beschluss

- AP11B erweitert Manifest, Loader, Domänenmodell und TypeScript-Rechenkern.
- Die SharePoint-Mirror-Anleitung wird um die neue Artefaktrolle ergänzt. Die Dateien bleiben byteidentisch mit dem öffentlichen Release.
- AP11C übernimmt abgenommene Kandidatenfälle in den regulären Golden-Case-Bestand und führt UI-, SharePoint- und Teams-Regressionen aus.
- Das Backlog-Item zum ewigen Kalender bleibt unabhängig und kann die Kalenderimplementierung später austauschen.
- Jede neue Rechenart benötigt eine neue Schema- und Entscheidungsprüfung. Sie wird nicht über ein freies Erweiterungsfeld eingeschleust.

## Risiken und Grenzen

- Mehrere Komponenten erhöhen die Zahl der zu validierenden Referenzen.
- Ein formal gültiger Katalog kann weiterhin fachlich falsch sein. Quellenprüfung und menschliche Abnahme bleiben zwingend.
- Behördlich festgelegte Termine lassen sich nur berechnen, wenn eine konkrete autoritative Quelle vorliegt.
- Stunden- und Jahresfristen bleiben ausserhalb des gegenwärtigen Funktionsumfangs. Eine gesetzlich festgelegte Monatsdauer ist für Art. 147 PRG bereits im Kandidatenmodell enthalten und muss in AP11B mit eigener Monatsarithmetik umgesetzt werden.

## Entscheidbedarf

Der Entscheid ist `vorgeschlagen`. Er wird erst nach ausdrücklicher Bestätigung durch David Steimer auf `beschlossen` gesetzt. Bis dahin bleiben Schemata, Katalog und Testfälle Kandidaten und werden nicht in das produktive Datenrelease aufgenommen.

## Nachweise

- [AP11A-Kandidatenbestand](../../data/candidates/2026-08-30-ap11a-vrpg-be/README.md)
- [Fachanalyse zu den Spezialregimen](../fachrecht/vrpg-be-spezialregime-ap11a.md)
- [Komponentenmodell](../architektur/vrpg-spezialregime-datenmodell.md)
- [DEC-2026-012](DEC-2026-012-providerneutrales-datenrelease-format.md)
- [GitHub-Issue #28](https://github.com/davidsteimer/fristenrechner/issues/28)

## Verantwortlichkeit

Der Entscheid wurde mit Codex vorbereitet. Die Entscheidung und fachliche Freigabe liegen bei David Steimer. Codex übernimmt keine formelle Freigabe- oder Haftungsverantwortung.
