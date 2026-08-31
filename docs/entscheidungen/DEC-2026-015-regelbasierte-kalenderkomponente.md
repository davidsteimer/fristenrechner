---
id: DEC-2026-015
titel: "Regelbasierte Kalenderkomponente mit sicherer Formatgrenze"
status: beschlossen
vorgeschlagen_am: 2026-08-31
entscheidungsdatum: 2026-08-31
klasse: B
entschieden_durch: "David Steimer"
quelle:
  - "Arbeitspaket AP12A, GitHub-Issue #26"
  - "DEC-2026-008"
  - "DEC-2026-012"
  - "DEC-2026-014"
ersetzt: []
ersetzt_durch: null
---

# DEC-2026-015: Regelbasierte Kalenderkomponente mit sicherer Formatgrenze

## Ausgangslage

Die freigegebenen Kalenderartefakte enthalten Feiertage und Fristenstillstände als konkrete ISO-Daten für 2026 bis 2028 sowie notwendige Randperioden. Stabile Regeln müssen dadurch jährlich in neue Datumslisten übersetzt, geprüft und veröffentlicht werden. Ohne Nachführung läuft die technische Kalenderabdeckung aus, obwohl sich das Recht nicht geändert hat.

Das Backlog-Item #26 verlangt einen ewigen Kalender aus versionierten und quellenbelegten Regeln. «Ewig» bezeichnet dabei das Fehlen einer künstlichen Jahresgrenze. Rechtliche Gültigkeit, periodische Quellenprüfung und neue Datenreleases bei Rechtsänderungen bleiben notwendig.

Ein alter Consumer kann regelbasierte Kalender nicht sicher interpretieren. Eine scheinbar rückwärtskompatible Ergänzung könnte deshalb dazu führen, dass er ein Artefakt akzeptiert, aber keine Feiertage erzeugt.

## Geprüfte Optionen

1. **Neue Kalenderkomponentenversion und neues Manifest-Hauptformat**
   - Vorteil: ältere Consumer lehnen das Gesamtrelease vor der Berechnung sicher ab.
   - Vorteil: bestehende Releases bleiben unverändert reproduzierbar.
   - Vorteil: Regeln, Gültigkeit, Quellen, Overrides und Vererbung werden ausdrücklich modelliert.
   - Nachteil: Manifest, Validator, Rechenkern und SPFx-Consumer müssen gemeinsam migriert werden.
2. **Optionale Regelfelder im bestehenden Kalenderschema 1.0.0**
   - Vorteil: kleinere nominelle Schemaänderung.
   - Nachteil: alte Consumer verstehen die neue Kernsemantik nicht und könnten ein fachlich leeres Kalenderergebnis verwenden.
   - Nachteil: konkrete Listen und Regeln könnten sich widersprechen.
3. **Jährliche Kalenderlisten weiterhin mit einem Buildskript erzeugen**
   - Vorteil: keine Änderung des Laufzeitformats.
   - Nachteil: das Datenrelease behält ein Ablaufdatum und benötigt weiterhin jährliche Publikation.
   - Nachteil: der rechtlich relevante Regelbestand bliebe ausserhalb des ausgelieferten Datenvertrags.
4. **Externer Feiertagsdienst zur Laufzeit**
   - Vorteil: wenig eigene Kalenderlogik.
   - Nachteil: zusätzliche Verfügbarkeit, Datenschutz-, Vertrauens- und Tenantprobleme.
   - Nachteil: die verwendeten Quellen und Rechtswirkungen wären nicht unter eigener Freigabekontrolle.

## Entscheid

Für regelbasierte Kalender soll folgende Architektur gelten:

- Das alte Kalenderschema `1.0.0` und alle veröffentlichten Datenreleases bleiben unverändert.
- Regelbasierte Kalender verwenden das Komponentenformat `2.0.0` und das separate Schema `calendar-rules-v2.schema.json`.
- Das erste aktivierbare Gesamtrelease mit regelbasierten Kalendern verwendet die Manifest-Hauptversion `3.0.0` und verlangt einen Consumer ab Format `3.0.0`.
- Ein Consumer weist ein unbekanntes Hauptformat vor dem Laden oder Aktivieren einzelner Artefakte vollständig ab.
- Das Kalenderartefakt bleibt `dataKind: calendar` und behält seine stabile Kalender-ID. Der Providervertrag und die Byteidentität zwischen GitHub, SharePoint-Mirror und manuellem Import bleiben unverändert.
- Zulässige Rechentypen sind abschliessend `fixedMonthDay`, `easterOffsetDays`, `nthWeekdayOfMonth`, `relativePeriod` und `explicitDateOverride`.
- Freie Formeln und aus Bezeichnungen abgeleitete Algorithmen sind verboten.
- Jede Regel enthält eine stabile ID, Kalender, Gemeinwesen, Deutsch und Französisch, Priorität, offene oder begrenzte Gültigkeit, Wirkung und Quellenverweise.
- Der Generator arbeitet lokal, seiteneffektfrei und ohne Zugriff auf externe Kalenderdienste.
- Er erzeugt nur den angefragten Zeitraum und die notwendigen Randjahre.
- Einmalige Abweichungen werden als quellenbelegte `add`-, `suppress`- oder `replace`-Overrides modelliert. Die Grundregel wird nicht umgeschrieben.
- Unbekannte Regeln, ungültige Daten, Zyklen, nicht auflösbare Overrides, gleich priorisierte Widersprüche und Anfragen ausserhalb der Gültigkeit blockieren die Berechnung.
- Der bernische Kalender erbt weiterhin den Bundeskalender.
- Die zeitlich begrenzte Stillstandssatz-ID `ch-court-holidays-2026-2028` wird beim Format-3-Release atomar durch `ch-court-holidays` ersetzt.
- Erzeugte Feiertags- und Perioden-IDs bleiben für 2026 bis 2028 mit dem freigegebenen MVP-0.2-Bestand identisch.
- Datenrelease, Kalenderregel, angewandter Override und Quelle bleiben in der Rechenspur nachvollziehbar.
- Die periodische Quellenprüfung nach Issue #27 bleibt vom technischen Generieren getrennt.

## Begründung

Die neue Manifest-Hauptversion ist eine Sicherheitsgrenze. Sie verhindert, dass ein alter Consumer ein strukturell unbekanntes Kalenderartefakt als scheinbar gültigen, aber faktisch leeren Kalender verwendet. Das entspricht den Ablehnungsregeln von DEC-2026-012 und der komponentenweisen Evolution von DEC-2026-014.

Die Regeln liegen in den ausgelieferten Fachdaten. Dadurch bleiben Rechtsquelle und Berechnungsart gemeinsam versioniert und können über denselben GitHub- oder SharePoint-Mirror verteilt werden. Der Anwendungscode implementiert nur die kleine, abgeschlossene Menge zulässiger Rechenoperationen. Er kennt keine Feiertagsnamen und errät keine kantonalen Regelungen.

Offene Gültigkeitsenden lösen das rein technische Ablaufdatum. Sie ersetzen keine juristische Pflege. Das gekoppelte Governance-Item #27 bleibt deshalb erforderlich.

## Folgen

### Auswirkungen

- AP12B implementiert den hostneutralen TypeScript-Generator und den Resolver gegen den AP12A-Referenzvertrag.
- AP12C erweitert Manifest, Loader, Datenadapter, Rechenspur, Preview und SPFx-Consumer auf Format 3.
- Der SharePoint-Mirror erhält beim späteren Release neue Kalenderbytes und ein neues Manifest. Teilaktualisierungen bleiben verboten.
- Rechtsprofile und Spezialregime werden gemeinsam auf `ch-court-holidays` migriert.
- Die alte, endliche Kalenderimplementierung bleibt für frühere Releases lesbar und testbar.

### Risiken und Grenzen

- Eine algorithmisch korrekte Berechnung kann auf einer veralteten Rechtsquelle beruhen.
- Offene Gültigkeit kann bei ungenügender Kommunikation als dauerhafte Rechtsgarantie missverstanden werden.
- Overrides und Vererbung erhöhen die semantischen Validierungsanforderungen.
- Gemeinden und weitere Kantone benötigen eigene amtliche Quellen und freigegebene Regeln.
- Die Testjahre 1900, 2000, 2100 und 2400 belegen Kalenderarithmetik, nicht die historische Geltung der heutigen Rechtsregeln.

### Folgearbeiten und Rückabwicklung

- AP12B und AP12C bleiben getrennte Arbeitspakete mit höchstens fünf Nettoarbeitstagen und WIP-Limit 1.
- Die Entscheidung kann vor einem produktiven Format-3-Release ohne Datenmigration verworfen werden. Der MVP-0.2-Stand bleibt dann unverändert aktiv.
- Nach Veröffentlichung eines Format-3-Release erfolgt eine Ablösung nur mit einer neuen DEC-ID und gegenseitigen Verweisen in `ersetzt` und `ersetzt_durch`.

## Nachweise

- [AP12A-Zielmodell](../architektur/ewiger-kalender-ap12a.md)
- [AP12A-Datenkandidat](../../data/candidates/2026-08-31-ap12a-eternal-calendar/README.md)
- [AP12A-Referenzvertrag](../../tests/calendar-rules/candidates/ap12a-reference-cases.json)
- [DEC-2026-012](DEC-2026-012-providerneutrales-datenrelease-format.md)
- [DEC-2026-014](DEC-2026-014-komponentenweise-fachdatenformatevolution.md)
- [GitHub-Issue #26](https://github.com/davidsteimer/fristenrechner/issues/26)
- [Governance-Issue #27](https://github.com/davidsteimer/fristenrechner/issues/27)

## Entscheidstatus

David Steimer hat DEC-2026-015 am 31. August 2026 ausdrücklich bestätigt. Der Entscheid ist damit `beschlossen`.

Die Bestätigung umfasst die Kalenderkomponente `2.0.0`, das Manifest-Hauptformat `3.0.0`, die sichere Ablehnung durch ältere Consumer und die atomare Migration von `ch-court-holidays-2026-2028` auf `ch-court-holidays`. AP12A mit Datenmodell und Referenzvertrag ist abgenommen. Die Regelbestände bleiben bis zur Integration in ein vollständig validiertes Format-3-Datenrelease Kandidaten ohne produktive Wirkung.

## Verantwortlichkeit

David Steimer nimmt gegenwärtig sämtliche menschlichen Rollen wahr und entscheidet über Architektur sowie fachliche Freigabe. Codex hat den Entscheidungsentwurf und die technischen Nachweise vorbereitet, übernimmt aber keine formelle Freigabe- oder Haftungsverantwortung.
