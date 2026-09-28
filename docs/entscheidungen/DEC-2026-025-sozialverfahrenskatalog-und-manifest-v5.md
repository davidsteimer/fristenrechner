---
id: DEC-2026-025
titel: "Nationaler Sozialverfahrenskatalog 1.0.0 und Manifest-/Consumerformat 5.0.0"
status: beschlossen
vorschlagsdatum: 2026-09-25
entscheidungsdatum: 2026-09-25
klasse: B
entschieden_durch: David Steimer
quelle:
  - "Abnahme der AP19B-Vorlage: OK. Inklusive Option B für AVIG abgenommen."
  - "Abnahme AP19A und ausdrücklicher Startauftrag AP19B vom 25. September 2026"
  - "DEC-2026-024, nationale Modellierung mit getrennter bernischer Erstfreigabe"
ersetzt: []
ersetzt_durch: null
---

# DEC-2026-025 · Nationaler Sozialverfahrenskatalog und Manifest 5

## Ausgangslage

AP19A-Umfang und nationale Modellstruktur sind abgenommen. Der aktuelle Spezialregimekatalog ist dagegen ausdrücklich auf `vrpg-be` und Bern ausgerichtet. Die drei getrennten Ebenen Bundesregel, kantonale Anbindung und Freigabe brauchen einen konkreten Produktvertrag. Die zwölf bestehenden AP17-Sozialpfade dürfen weder verloren gehen noch parallel unter zwei aktiven Verträgen berechnet werden.

## Geprüfte Optionen

1. **Spezialregimekatalog auf Format 4 erweitern.** Ein Artefakt weniger, aber nationale Regeln blieben im bernisch bezeichneten Katalog oder dessen Identität und übrige Fachbereiche müssten ebenfalls umgebaut werden.
2. **Eigenständiger Sozialverfahrenskatalog, gemeinsam über das Release-Manifest gebunden.** Klare Trennung, ein zusätzlicher Artefakttyp und kontrollierte Überführung der bisherigen Sozialpfade. Der verbleibende Spezialregimekatalog behält sein Format.

## Entscheid

**Option 2 ist beschlossen.** David Steimer hat die vollständige AP19B-Vorlage mit «OK. Inklusive Option B für AVIG abgenommen.» bestätigt. Die [Abnahmenotiz](../fachrecht/abnahme-ap19b.md) bindet den unveränderten Vorlagestand und grenzt Quellenmethode, Vertragsbeschluss und spätere Produktaktivierung ab. Der [AP19B-Produktvertrag](../architektur/sozialversicherungsvertrag-ap19b.md) konkretisiert folgende Kombination:

| Vertrag | Beschlossener Stand |
| --- | --- |
| Neue Komponente `socialProcedureCatalog` | `1.0.0`, drei getrennte Schichten in einer JSON-Datei |
| Release-Manifest | `5.0.0`, neue verpflichtende Artefaktrolle und ID-Liste |
| Mindest-Consumerformat | `5.0.0`, keine Umdeutung durch bisherige Consumer |
| Verbleibender Spezialregimekatalog | weiterhin `3.0.0`, neuer Inhaltsstand ohne doppelte Sozialpfade |
| Rechtsprofile / Regelkalender / Feiertagskatalog | unverändert `1.0.0` / `2.0.0` / `1.0.0` |

Die Bundesregeln werden kantonsneutral geführt. Anbindungen enthalten die konkrete Zuständigkeit beziehungsweise kenntlich gemachte Produktbegrenzung und Feiertagsauflösung. Freigaben binden die exakten Regel-, Anbindungs-, Kalender-, Quellen- und Referenzstände. Der Status einer Bundesregel allein aktiviert nichts.

Die zwölf bestehenden IVG-/AHVG-/UVG-Pfade werden im nächsten geeigneten Kandidaten ausdrücklich eins zu eins überführt. Die übrigen 33 Definitionen und 40 Regime bleiben semantisch erhalten. Auch die vier bisherigen Sperrkennungen bleiben erhalten. Drei Sozialgerichts-Sperren wechseln in die neue Komponente, die Beschaffungssperre bleibt im Restkatalog. Alte Releases werden nicht verändert.

ELG, AVIG und KVG erhalten danach die zwölf in AP19A abgegrenzten Pfade. Die operative Erstfreigabe bleibt auf die konkret geprüften BE-Anbindungen und CH-/BE-Kalender beschränkt. Eine bekannte nationale Bundesregel ist keine nationale Betriebsfreigabe.

## Begründung

Die neue Komponente folgt der beschlossenen fachlichen Verantwortungsgrenze. Sie vermeidet sowohl 26 Kopien gleicher Bundesregeln als auch eine pauschale Lockerung bestehender Bern-Konstanten. Manifest und Consumer wechseln gemeinsam, damit ein alter Reader die neue verbindliche Semantik nicht übergeht. Der schweizweite Feiertagskatalog wird dadurch nicht zusätzlich aktiviert.

## Folgen

### Auswirkungen

- Auf Grundlage dieses Vertragsbeschlusses werden Produktschema, Loader, Resolver und typisierter Adapter im nachfolgenden AP19C umgesetzt. Die bestehende Tagesarithmetik bleibt die gemeinsame Berechnungsgrundlage. Die Abnahmenachführung beginnt diese Implementierung noch nicht.
- Migrations-, Datums- und Sperrreferenzen sind vor einer Datenpromotion vollständig auszuführen. AP19B liefert Referenz- und Migrationsplanprüfungen, noch keinen fertig implementierten Consumer 5.
- Rechtliche Gültigkeit, belegte Quellenabdeckung, technische Fallabdeckung und operative Freigabe bleiben getrennte Zeitangaben. Eine fehlende Quellendatei ist kein gesetzliches Ausserkrafttreten.
- Gemeinsame UI-, SPFx- und Mirror-Verträge werden erst im Integrationspaket angepasst. Keine zusätzliche Infrastruktur, Graph-Berechtigung oder neue Bibliothek durch diesen Beschluss.

### Risiken und Grenzen

- Die konkrete Freigabe muss den gesamten Rechenweg einschliesslich Stillstand und Endverschiebung abdecken. Ein zulässiges Eingabedatum allein genügt nicht.
- Das Quellen-/Referenzfenster 2026–2027 ist fachlich abgenommen, einschliesslich Option B für AVIG: Herleitung der relevanten AVIV-Normen ab Februar 2027 aus amtlichem Änderungsrecht und Änderungsindex trotz technisch nicht abrufbarer Folgekonsolidierung. Vor Kandidatenübernahme ist die Quellenlage erneut zu prüfen. Die fachliche Bestätigung ersetzt keine operative Freigabe oder Integrationsprüfung.
- Die Eingabesemantik muss Versicherersitz und Berner Fallkontext unterscheiden. Die globale statische Beschriftung «Verfahrenskontext» und die feste KVG-Verwaltungsvoraussetzung sind als begrenzte UI-Folge bestätigt. Die tatsächliche Änderung erfolgt erst in der Produktintegration, der zweispaltige Aufbau bleibt erhalten.
- Historische Verbraucherformate bleiben separat prüfbar. Ein Rückfall darf nur einen vollständigen früher verifizierten Release verwenden, keine Mischung alter Kalender mit neuen Regeln.
- Quellen- und Referenznachweise sind keine digitale Signatur. Vertrauen setzt weiterhin eine kontrollierte Veröffentlichung und einen verifizierten Release-Pin voraus.

### Folgearbeiten und Rückabwicklung

- David hat diesen Vertrag, die fachlichen Referenzen einschliesslich der AVIV-Nachweismethode und die eng begrenzte UI-Folge mit AP19B abgenommen. Die frühere AP19A-Abnahme wird nicht rückwirkend als dieser Folgeentscheid ausgegeben.
- Die tatsächliche Migration sowie neue Fachpfade werden erst in AP19C implementiert und gesondert abgenommen.
- MVP 0.4, Datenpins, Mirrors, SPPKG und öffentliche Website bleiben bis zu einem eigenen Releaseauftrag unverändert.
- Da AP19B keine Laufzeit umstellt, braucht es keine betriebliche Rückabwicklung. Die abgenommenen Vorlagendateien bleiben mit ihrem damaligen Entwurfsstatus unverändert erhalten. Ihr aktueller Status ist in der Abnahmenotiz dokumentiert.

## Nachweise

- [Abnahme AP19B einschliesslich Option B](../fachrecht/abnahme-ap19b.md)
- [Abnahme AP19A](../fachrecht/abnahme-ap19a.md)
- [Produktvertrag und vollständige Migrationszuordnung](../architektur/sozialversicherungsvertrag-ap19b.md)
- [Fachliche Datums- und Sperrreferenzen](../fachrecht/referenzfaelle-ap19b.md)
- [Originalquellen- und Zeitabgleich](../fachrecht/quellenabgleich-ap19b.md)
- [Maschinenlesbarer Migrationsplan](../../tests/golden/candidates/ap19b-migration-plan.json)
- [DEC-2026-014](DEC-2026-014-komponentenweise-fachdatenformatevolution.md) und [DEC-2026-024](DEC-2026-024-nationales-sozialversicherungsmodell.md)

## Verantwortlichkeit

Beschlossen durch David Steimer. Codex hat Vertrag und Prüfungen als KI-Arbeitsinstrument vorbereitet und den menschlichen Entscheid dokumentiert. Die Fach- und Vertragsabnahme stammt von David Steimer. Eine Release- oder Betriebsfreigabe wird dadurch nicht erteilt.
