---
id: DEC-2026-042
titel: "Geschlossener Verfahrensvertrag NE, VD und VS"
status: vorgeschlagen
entscheidungsdatum: null
klasse: B
entschieden_durch: null
quelle:
  - "AP23M1 M1 A bis M1 G fachlich abgenommen am 28.10.2026"
  - "Isolierte AP23M2-Vertragsprobe mit tatsächlichen Kandidatenbytes"
ersetzt: []
ersetzt_durch: null
---

# DEC-2026-042: Verfahrensvertrag NE, VD und VS in Katalog 10

## Ausgangslage

Die [M1-Fachabnahme](../fachrecht/abnahme-ap23m1.md) bestätigt 49 Gruppen, Kalenderbindungen, vollständiges Fallfenster und begrenzte offene Punkte. Der nach [DEC-2026-041](DEC-2026-041-beschluss.md) beschlossene Vertrag 9/16 enthält nur die Innerrhoder Postnormalisierung mit drei Zusatzvoraussetzungen und eine längere Belehrungsdauer oberhalb der ordentlichen Frist und von 30 Tagen. Die Waadtländer Postregel und die Walliser längere Belehrung unterscheiden sich davon. Eine aktuelle regionale Stellensitzwahl für Neuenburg ist weder eine feste Kantonswahl noch die bestehende Parteien-/Vertretungsanknüpfung.

## Geprüfte Optionen

1. Neue Kennungen ohne Formatwechsel. Würde neue Bedeutung unter alten Feldern verstecken und ist nicht empfohlen.
2. Geschlossener Katalog-10-Zweig mit Manifest/Mindestconsumer 17. Neue Semantik ausdrücklich, historische Äste geschützt. Empfohlen.
3. Allgemeiner Regelausdrucksinterpreter. Für die konkrete Tranche unnötig breit und schwerer fachlich zu prüfen. Nicht empfohlen.

## Vorgeschlagener Entscheid

Dieser Abschnitt ist **kein Beschluss**.

- Kantonalverfahrenskatalog **10.0.0**, Manifest und Mindestconsumer **17.0.0**, isoliertes Eingabeschema 10.
- 49 neue Gruppen, NE 16, VD 19 und VS 14, bei unveränderten 196 historischen Pfaden. Insgesamt 245 administrative Pfade im isolierten Kandidaten.
- Eigene VD-Öffnungspolicy für qualifizierte Eröffnung oder aktuell zulässige einfache Post ohne Unterschrift und mit verifiziertem Eingang. Keine zusätzlichen AI-Voraussetzungen. Bereits qualifizierte Eröffnung bleibt unverändert.
- Eigene VS-Dauerpolicy mit aktueller wirksamer Tagesangabe oberhalb der aktuellen Basis zehn oder 30 Tage, ohne AI-Schwelle von mehr als 30 Tagen.
- Eigene NE-Stellensitzwahl mit genau zwei bestehenden Kalendern, ohne Ersatzwert. Gerichtliche Wege separat fest an den qualifizierten Sitz Neuchâtel gebunden. Keine fremde Parteienanknüpfung.
- Wiederverwendung der bestehenden primitiven Tagesdauern und Stillstandsperioden. Neue VS-Winterinstanz endet am 5. Januar. Echte NE-/VD-Dreitagesnachfrist und tatsächliche VS-Auslöser bleiben aktuell qualifiziert, ohne automatische Handlungskette.
- VD Art. 81 Abs. 5 bleibt eine ausdrücklich begrenzte aktuelle Anordnungsqualifikation. Kein automatischer numerischer Erstansetzungs-/Verlängerungsnachweis aus dem zusammengesetzten M1-Wert. Keine pauschale Dreissigtagesobergrenze. 365 Tage ist nur ein technisches Sicherheitslimit.
- Vollständiges Fenster **29.08.2026–31.12.2027**, taggenaue Einzelregelgeltung, M1-Vorbehalte und konkrete Endverschiebungskollision bleiben verbindlich. Kein unbegrenzter Rechtsbeständigkeitsnachweis.
- Rechtsprofile 1, Feiertagskatalog 2, Regelkalender 3, Spezialregimekatalog 3, Sozialverfahrenskatalog 2 und Standardsversion 5 bleiben unverändert. Keine neue Sozialfreigabe, kein neuer physischer Feiertag.

## Begründung und Auswirkungen

Die Ergänzung bildet die angenommenen Rechtsunterschiede geschlossen ab, ohne alte Bedeutung aufzuweichen. Die vorhandenen 35 Kalender und 499 Feiertagsregeln reichen aus. 43 nichtadministrative Manifestartefakte bleiben rohbytegleich. Vier neue administrative Bindungen, fünf Profile und 19 konkrete technische Quellenzeilen ergänzen den Bestand. Alle 64 M1-Belege bleiben mit ihrer Rolle erhalten. Quellenrelease, native Integration und Betriebsfreigabe sind davon getrennt.

Der unveränderte native Format-16-Rechner bleibt für 196 alte Fälle vollständig gleich. Seine beiden Reader lehnen das neue vollständige Format-17-Bundle und gefälschte beziehungsweise rücketikettierte Varianten ab. Die neuen NE-/VD-/VS-Wege werden in M2 nur isoliert gerechnet.

## Folgeauftrag und Grenzen

Technische M2-Abnahme und ausdrücklicher Beschluss bleiben bei David Steimer. AP23M3 benötigt danach einen gesonderten Start. Erst dort folgen nativer Reader, Aktivierungsvalidator, konkrete Daten-Neubindung, Oberfläche, Standards, Rechenkern, Export und echte Artefakt-/Hostprüfungen. Aktuelle Falltatsachen dürfen nicht aus persönlichen Standards entstehen. Zwei Spalten, frühe Datumseingabe und statisch «Sitz der zuständigen Stelle» bleiben bestehen.

Keine Produktaktivierung, regulärer Releasebau, Commit, Push, Installation, Upload oder Änderung an E/Q/P, Mirrors, AP5, AP21, Hosting und Berechtigungen. Der bisher beschlossene lokale Vertrag 9/16 bleibt in Kraft, der nächste reguläre Release wird weiterhin gemäss DEC-2026-034 gebündelt. Eine Betriebsrückabwicklung ist in M2 nicht erforderlich, weil der Betrieb unverändert bleibt.

## Nachweise

- [Vertragsprobe und Migration](../architektur/verwaltungsverfahrensvertrag-ap23m2.md)
- [Technischer Prüfnachweis](../architektur/verwaltungsverfahrensvertrag-ap23m2-pruefung.md)
- [Tatsächlicher Kandidat](../../outputs/ap23m2-candidate-2026-10-28/)
- [Gebundener Abschluss](../../outputs/ap23m2-2026-10-28/local-completion.json)
- [Frisches Neuenburger Fassungsgate](../../outputs/ap23m2-2026-10-28/ne-fassungsgate.json)

## Verantwortlichkeit

David Steimer entscheidet in Personalunion der menschlichen Rollen. Codex ist dokumentiertes KI-Arbeitsinstrument ohne formelle Freigabe- oder Haftungsverantwortung. Ein späterer Beschluss wird separat dokumentiert und überschreibt diesen ursprünglichen Vorschlag nicht.
