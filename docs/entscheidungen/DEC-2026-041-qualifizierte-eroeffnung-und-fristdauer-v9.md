---
id: DEC-2026-041
titel: "Qualifizierte Eröffnung, Belehrungsdauer und begrenzte Verfahrens-Kalenderergänzung"
status: vorgeschlagen
entscheidungsdatum: null
klasse: B
entschieden_durch: null
quelle:
  - "AP23L1 mit L1 A bis L1 G fachlich abgenommen am 27.10.2026"
  - "Isolierte AP23L2-Vertragsprobe mit tatsächlichen Kandidatenbytes"
ersetzt: []
ersetzt_durch: null
---

# DEC-2026-041: Qualifizierte Eröffnung und Fristdauer in Katalog 9

## Ausgangslage

Die [L1-Fachabnahme](../fachrecht/abnahme-ap23l1.md) bestätigt 31 AI-/SZ-Gruppen, deren Kalenderbindungen, das vollständige Fenster und die begrenzten offenen Punkte. Der nach [DEC-2026-040](DEC-2026-040-beschluss.md) beschlossene Vertrag 8/15 setzt bei den neuen K3-Pfaden einen bereits qualifizierten unveränderten Auslöser voraus. Er besitzt weder die neue bedingte AI-Trackingtransformation noch die wirksame längere Belehrungsdauer als eigene aktuell qualifizierte Dauerart.

## Geprüfte Optionen

1. **Neue Pfadkennungen ohne Formatwechsel.** Weniger neue Readerzweige, aber neue rechtliche Bedeutung unter alten Feldern. Alte Consumer könnten sie falsch oder unvollständig interpretieren. Nicht empfohlen.
2. **Geschlossener V9-Zweig und Manifest/Mindestconsumer 16.** Neue Semantik explizit, alte Definitionen und Artefakte geschützt. Erfordert einen späteren bewussten Reader- und Migrationsschritt. Empfohlen.
3. **Allgemeiner regelbasierter Ausdrucksinterpreter.** Flexibler, für diese Tranche jedoch unnötig breit und schwerer fachlich prüfbar. Nicht empfohlen.

## Vorgeschlagener Entscheid

Dieser Abschnitt ist **noch kein Beschluss**.

- Kantonalverfahrenskatalog **9.0.0**, Manifest und Mindestconsumer **16.0.0**.
- Eigener geschlossener V9-Vertrag für 18 AI- und 13 SZ-Pfade. Die 165 bisherigen Pfade und historischen Definitionen bleiben erhalten.
- AI-Eröffnung unterscheidet unveränderten rechtlich qualifizierten Tag und nur bedingt zulässigen physischen Trackingempfang mit drei aktuellen Zusatzvoraussetzungen. Mündliche Eröffnung und Kenntnistag erhalten keine Trackingtransformation.
- Längere AI-Belehrungsdauer verlangt aktuelle Wirksamkeit, aktuelle ordentliche Basis und eine Tagesangabe oberhalb der ordentlichen Dauer und von 30 Tagen. AI-O3 bleibt abgegrenzt. Tatsächlich angesetzte SZ-Einsprache wird nur innerhalb eines bis zehn Tagen verwendet.
- SZ-Martinstag bleibt eine separat gebundene administrative Endverschiebungsergänzung für positiv qualifizierten Gemeindesitz Schwyz mit genau 11.11.2026 und 11.11.2027. Keine Änderung des Feiertagskatalogs oder der bestehenden Bundesverfahrensbindungen.
- Eligibility bindet zusätzlich Dauerpolicy und Verfahrens-Kalenderergänzung. Kein rekonstruierter Hash ersetzt eine bestätigte sachliche Policy.
- Vollständiges Fenster **29.08.2026–31.12.2027**, echte SZ-Normphasen vor und ab 01.07.2027 und begrenzte Kollisionssperre bleiben verbindlich. Keine allgemeine Zukunftsrechtsgarantie.
- Rechtsprofile 1, Feiertagskatalog 2, Regelkalender 3, Spezialregimekatalog 3, Sozialverfahrenskatalog 2 und Standardsversion 5 bleiben unverändert. Keine zusätzlichen Sozialfreigaben.

## Begründung

Die Erweiterung bildet die abgenommenen Unterschiede ausdrücklich ab, ohne die früheren Formate zu lockern oder einen allgemeinen Regelinterpreter einzuführen. Die Schwyzer Ortswirkung gehört zur neuen administrativen Rechtsbindung. Eine Änderung des schweizweiten physischen Feiertagsbestands wäre dafür unnötig und könnte bisherige Bundesprofile unbeabsichtigt beeinflussen.

## Folgen

### Auswirkungen

Der isolierte Kandidat umfasst 196 Pfade, 44 Manifestartefakte und 17 neue technische Quellenzeilen. 43 nichtadministrative Artefakte bleiben rohbytegleich. Die 35 Kalender und 499 Katalogregeln sowie 44 Sozialregeln und 50 BE-Anbindungen bleiben unverändert. Die vier neuen Schemata sind nur Kandidatenschemata, keine native Produktänderung.

### Risiken und Grenzen

Die technische Probe bestätigt keine offene Rechtsauslegung und erteilt keine Quellenrelease- oder Betriebsfreigabe. AI-O1 bis AI-O3, SZ-O1, die abgenommene Endverschiebungskollision und die Grenzen elektronischer beziehungsweise ausserordentlicher Einreichung bleiben erhalten. 365 Tage ist bei allgemeinen angeordneten oder länger belehrten Dauern ein technisches Sicherheitslimit, kein gesetzliches Maximum.

### Folgearbeiten und Rückabwicklung

Technische L2-Abnahme und ausdrücklicher Beschluss bleiben bei David Steimer. L3 benötigt danach einen gesonderten Startauftrag. Dort sind nativer Reader, Aktivierungsvalidator, Rechenkern, Oberfläche, Standards und reale Artefakte zu integrieren und zu prüfen. Aktuelle Tatsachen und Dauerangaben dürfen nicht als bestätigte persönliche Vorgaben fortleben. Historische AP5-Pins und frühere Formate bleiben geschützt. Bis zur gesonderten Integration besteht der bisherige lokale Vertrag 8/15 unverändert fort. Keine Betriebsrückabwicklung ist nötig, weil L2 den Betrieb nicht verändert.

Eine spätere Ablösung erfolgt durch eine neue DEC-ID mit gegenseitigen Verweisen. DEC-2026-040 wird durch diesen Vorschlag nicht rückwirkend umgeschrieben.

## Nachweise

- [Vertragsprobe und Migration AP23L2](../architektur/verwaltungsverfahrensvertrag-ap23l2.md)
- [Technischer Prüfbericht](../architektur/verwaltungsverfahrensvertrag-ap23l2-pruefung.md)
- [Tatsächliches Kandidatenbundle](../../outputs/ap23l2-candidate-2026-10-27/)
- [Gebundener lokaler Abschlussnachweis](../../outputs/ap23l2-2026-10-27/local-completion.json)
- [GitHub #48 als übergeordneter Ausbau](https://github.com/davidsteimer/fristenrechner/issues/48), in L2 nicht extern verändert

## Verantwortlichkeit

Entscheidungsbefugt ist David Steimer, derzeit in Personalunion der menschlichen Rollen. Codex hat den Vorschlag ausgearbeitet und technisch geprüft, besitzt aber keine formelle Freigabe- oder Haftungsverantwortung.
