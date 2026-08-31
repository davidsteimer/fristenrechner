---
id: DEC-2026-014
titel: "Komponentenweise Formatevolution für Spezialregime"
status: beschlossen
vorgeschlagen_am: 2026-08-30
entscheidungsdatum: 2026-08-30
klasse: B
entschieden_durch: "David Steimer"
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

Die Spezialbestimmungen im Umfeld von Art. 41 Abs. 3 VRPG verlangen zusätzliche Muster: feste Abstände vor einem Ereignis, bestimmte Wochentage, konkurrierende Anknüpfungen, autoritativ festgelegte Daten und Uhrzeiten, unterschiedliche Arten der Fristwahrung sowie materielle Prüfschranken. Eine Erweiterung der bestehenden Felder ohne neue Formatversion würde deren Semantik still verändern.

Die Fachprüfung des AP11A-Kandidaten hat gezeigt, dass ein autoritativ festgelegter Termin keine Rechenart ist. Eine Eingabe vom 16. September 2026 mit einer unveränderten Ausgabe vom 16. September 2026 ist eine Übernahme mit Quellenbeleg, keine Berechnung.

## Geprüfte Optionen

1. **Komponentenmodell mit neuer Format-Hauptversion**
   - Vorteil: Terminherkunft, Rechenart, Kalender, Stillstand, Fristwahrung und Sperren bleiben getrennt und wiederverwendbar.
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

## Entscheid

Der Fristenrechner soll Spezialregime mit folgenden Regeln integrieren:

- Das freigegebene AP5-Referenzrelease und seine Formatversion 1.0.0 bleiben unverändert.
- Spezialregime werden als eigener Katalog mit typisierten Komponenten geführt.
- Zulässige Rechenarten sind abschliessend R1 bis R4. Freie Formeln sind nicht zulässig.
- Die Terminherkunft wird getrennt als `CALCULATED` oder `AUTHORITATIVE` geführt. Ein autoritativ festgelegter Termin ist keine Rechenart.
- Autoritative Termine enthalten Datum und allenfalls Uhrzeit, amtliche Quelle, Gültigkeit und Fristwahrungsmodus. Sie werden im MVP nicht als Fristtyp auf dem GUI angeboten und nicht als «berechnet» bezeichnet.
- Das provisorische `R5_FIXED` des AP11A-Kandidaten wird vor der produktiven Integration in die Terminherkunft `AUTHORITATIVE` überführt.
- Kalender, Stillstand und Fristwahrung werden über stabile Profile referenziert und nicht in jeder Regel kopiert.
- Datum, Uhrzeit und Fristwahrungsmodus bleiben getrennte Werte.
- Offene Voraussetzungen und rechtlich unbrauchbare Referenzen führen zu `open` oder `blocked`. Es gibt keinen stillen Rückfall auf die allgemeine VRPG-Regel.
- Die produktive Integration erfolgt erst in AP11B mit einer neuen Release-ID, einer neuen Format-Hauptversion und einer zusätzlichen Manifestrolle.
- Der AP6-Bestand 1.0.0 bleibt unverändert. Spezialfälle verwenden einen neuen Testvertrag 2.0.0 mit mehreren benannten Eingaben, Uhrzeiten, Gates und Fristwahrungsanforderungen.
- Kalenderprofil-IDs bilden eine Schnittstelle. Die Spezialregime legen nicht fest, ob konkrete Jahresdaten oder später ein ewiger Kalender dahinterstehen.

## Begründung

Das Komponentenmodell bildet die juristisch entscheidenden Unterschiede explizit ab. Gleichzeitig bleibt die Zahl der Rechenoperationen klein, prüfbar und unabhängig von einzelnen Artikelnummern. Die Trennung zwischen berechnetem und autoritativ übernommenem Termin verhindert, dass eine reine Datenübernahme als Rechenergebnis erscheint. Neue Spezialnormen können durch Konfiguration aufgenommen werden, solange sie einem geprüften Muster entsprechen.

Eine neue Hauptversion ist kein Selbstzweck. Sie ist die saubere Aussage, dass alte Consumer diese Regeln nicht verstehen. Genau für diesen Fall verlangt DEC-2026-012 eine inkompatible Formatevolution.

## Folgen

- AP11B erweitert Manifest, Loader, Domänenmodell und TypeScript-Rechenkern. Das Schema und der Kandidatenkatalog werden dabei von `R5_FIXED` auf die eigenständige Terminherkunft `AUTHORITATIVE` migriert.
- AP11B trennt die berechenbaren und autoritativen Teile der heute gemeinsam geführten Regeln nach Art. 16 PRG, Art. 21 BPR und Art. 8a VPR.
- AP11B und AP11C stellen mit einem Vertragstest sicher, dass autoritative Hintergrundregime nicht in der Fristtyp-Auswahl erscheinen.
- Die SharePoint-Mirror-Anleitung wird um die neue Artefaktrolle ergänzt. Die Dateien bleiben byteidentisch mit dem öffentlichen Release.
- AP11B übernimmt die abgenommenen Kandidatenfälle in den regulären Golden-Case-Bestand. AP11C führt UI-, SharePoint- und Teams-Regressionen aus.
- Das Backlog-Item zum ewigen Kalender bleibt unabhängig und kann die Kalenderimplementierung später austauschen.
- Jede neue Rechenart benötigt eine neue Schema- und Entscheidungsprüfung. Sie wird nicht über ein freies Erweiterungsfeld eingeschleust.

## Risiken und Grenzen

- Mehrere Komponenten erhöhen die Zahl der zu validierenden Referenzen.
- Ein formal gültiger Katalog kann weiterhin fachlich falsch sein. Quellenprüfung und menschliche Abnahme bleiben zwingend.
- Autoritativ festgelegte Termine lassen sich nicht berechnen. Ohne konkrete amtliche Quelle dürfen sie weder übernommen noch als verlässlich ausgegeben werden.
- Stunden- und Jahresfristen bleiben ausserhalb des gegenwärtigen Funktionsumfangs. Die gesetzlich festgelegte Monatsdauer nach Art. 147 PRG ist in AP11B mit eigener Monatsarithmetik umgesetzt.

## Entscheidstatus

David Steimer hat den Entscheid am 30. August 2026 ausdrücklich bestätigt. DEC-2026-014 ist damit `beschlossen`.

Der Beschluss gibt die Formatevolution und die Trennung der Terminherkünfte für AP11B vor. David Steimer hat den gesamten AP11A-Kandidatenbestand und anschliessend AP11B am 30. August 2026 abgenommen. Der freigegebene Referenzrelease `2026-08-30-ap11b-approved.1` verwendet Format 2.0.0. Die Abnahme umfasst Datenmodell, Rechenkern und automatisierte Referenztests. Eine produktive Aktivierung der Anwendung benötigt weiterhin eine gesonderte Abnahme.

Die acht fachlich abgenommenen AP11A-Fälle wurden bereits in AP11B in den automatisierten Golden-Case-Bestand übernommen, weil dies zum Abnahmekriterium von GitHub-Issue #29 gehört. AP11C bleibt für UI-, SharePoint- und Teams-Regressionen zuständig. Diese Vorziehung ändert weder Fachlogik noch Zielarchitektur.

## Nachweise

- [AP11A-Kandidatenbestand](../../data/candidates/2026-08-30-ap11a-vrpg-be/README.md)
- [Fachanalyse zu den Spezialregimen](../fachrecht/vrpg-be-spezialregime-ap11a.md)
- [Komponentenmodell](../architektur/vrpg-spezialregime-datenmodell.md)
- [DEC-2026-012](DEC-2026-012-providerneutrales-datenrelease-format.md)
- [GitHub-Issue #28](https://github.com/davidsteimer/fristenrechner/issues/28)
- [GitHub-Issue #29](https://github.com/davidsteimer/fristenrechner/issues/29)
- [AP11B-Releasekandidat](../../data/releases/2026-08-30-ap11b-candidate.1/README.md)
- [Freigegebener AP11B-Referenzrelease](../../data/releases/2026-08-30-ap11b-approved.1/README.md)

## Verantwortlichkeit

Der Entscheid wurde mit Codex vorbereitet. Die Entscheidung und fachliche Freigabe liegen bei David Steimer. Codex übernimmt keine formelle Freigabe- oder Haftungsverantwortung.
