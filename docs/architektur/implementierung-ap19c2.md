# AP19C2 · AVIG-ALE-Integration

Stand: 28. September 2026. **Lokaler Implementierungskandidat zur fachlich-technischen Abnahme. Keine operative Freigabe.** Auftrag von David Steimer: «Sehr gut. Dann gehen wir doch AP19C2 an.»

## Umfang

AP19C2 ergänzt den abgenommenen C1-Vertrag um die vier in AP19B geprüften nationalen Pfade für individuelle Arbeitslosenentschädigung. Manifest `5.0.0` und Sozialverfahrenskatalog `1.0.0` bleiben unverändert.

| Verfahrenshandlung | Dauer | Zuständigkeitsvarianten |
| --- | --- | --- |
| Einsprache gegen Verfügung | 30 Tage | Arbeitslosenkasse oder kantonale Amtsstelle |
| Beschwerde gegen Einspracheentscheid | 30 Tage | Kassen- oder Amtsstellenentscheid, zuständiges kantonales Versicherungsgericht |
| Angeordnete Tagesfrist im Verwaltungsverfahren | ausdrücklich eingegebene Anzahl Tage | Kasse oder Amtsstelle |
| Nachfrist zur Behebung formeller Beschwerdemängel | ausdrücklich eingegebene Anzahl Tage | bestehendes Gerichtsverfahren über Kassen- oder Amtsstellenentscheid |

Vier neue Bundesregeln werden mit acht getrennten Berner Anbindungen verbunden. Das ist keine Duplizierung des Bundesrechts. Der Vertrag bindet zeitliche Normprüfung an die Anbindung. Deshalb erhalten Kasse und Amtsstelle je eine eigene Anbindung mit genau einer Route. Damit benötigt der Amtsstellenpfad kein sachfremdes Kassen-Verfügungsdatum.

Der Gesamtstand umfasst **20 Bundesregeln und 24 Anbindungen**. Die ursprünglichen 16 C1-Regeln und 16 Anbindungen bleiben objektidentisch. Neun weitere Artefakte sind byteidentisch. Bei den alten Kandidaten-Freigabenachweisen ändert ausschliesslich die Referenz auf die neue Release-ID, nicht deren historische Quellenprovenienz.

Nicht enthalten sind KVG, weitere Kantonsanbindungen, Kurzarbeits-, Schlechtwetter- und Insolvenzentschädigung, kollektive oder kantonale AMM, materielle Anspruchs-/Kontrollfristen, Bundesinstanzen und allgemeine gerichtliche Tagesfristen. Formlose Abrechnungen werden nicht als Verfügungen behandelt.

## Fachliche und zeitliche Trennung

Die [Quellenprüfung](../fachrecht/quellenabgleich-ap19c2.md) bestätigt den abgenommenen Stand für 2026–2027. Die bereits beschlossene Option B für AVIV bleibt erforderlich. Die fehlende Februar-2027-Konsolidierung wird nicht als gelesen ausgegeben. Der amtliche Zukunftsindex und die Originaländerungsakte sind neu geprüft und gebunden.

Die [Zeitnotiz](../fachrecht/zeitliche-bindung-ap19c2.md) definiert die unterschiedlichen Anknüpfungen. Bei Kassen-Einsprache, Beschwerde und Beschwerdeverbesserung ist das Datum der ursprünglichen Verfügung separat einzugeben. Bei einer vorangehenden Verwaltungstagesfrist wird stattdessen der eigenständig qualifizierte aktuelle Zuständigkeitsbezug erfasst. Ein nach der fristauslösenden Zustellung liegendes Kassen-Bezugsdatum wird zurückgewiesen. Die abgenommene ELG-Semantik der gegebenenfalls späteren Beschwerdeerhebung bleibt unberührt.

Kontroll-/Amtsstellenkanton, Gerichtskanton und Feiertagsanknüpfung sind eigenständige Tatsachen. Behörden- oder Kassensitz, heutiger Wohnsitz und gespeicherte Standards ersetzen diese Feststellungen nicht. Die technisch nationalen Regeln enthalten keine Bern-Konstante. Die konkreten Kandidatenanbindungen und Kalenderkombinationen bleiben auf Bern begrenzt.

## Bedienung

Im C2-Kandidaten erscheint unter Sozialversicherungsrecht zusätzlich «Arbeitslosenversicherung (AVIG) · Arbeitslosenentschädigung». Bei älteren Daten erscheint diese Auswahl nicht. Die vier Handlungen sind ausdrücklich zugeordnet, weitere Pfade werden nicht aus ähnlichen Namen abgeleitet.

Die einzige neue durchgängige Fallauswahl ist die Herkunft **Arbeitslosenkasse oder kantonale Amtsstelle**. Im Gerichtsfall bezeichnet sie den zugrunde liegenden Verwaltungsentscheid, nicht den Absender einer Verbesserungsanordnung. Erst diese Auswahl bestimmt die konkrete Anbindung. Vorher zeigt die Oberfläche bereits die gemeinsame Bundesregel, nimmt aber keine Herkunft an.

Die fallbezogenen Kantonsangaben und der erforderliche Zeitanker erscheinen abhängig vom ausgewählten Pfad. Bei Gericht werden Gerichtskanton und Kontroll-/Amtsstellenkanton separat erfasst. Beim Herkunftswechsel werden die abhängigen Zuständigkeitsangaben geleert. Empfangsdatum und sachlich unabhängige Feiertagsangaben bleiben erhalten. Herkunft, Zuständigkeitsdaten und Fallkantone werden nicht als persönliche Standards gespeichert.

Der zweispaltige Aufbau bleibt bestehen, einschliesslich ausgerichteter Zeilen bei eingeblendetem Verfahrensstadium. Auf schmalen Ansichten bleibt der bestehende Einspaltenmodus. Kein redundantes Dokumentfeld, keine zusätzliche Checkbox. Zuständigkeitsmodell, Dokumenttyp, eingeschränkter Normalfall und Quellen stehen in der zunächst geschlossenen Rechenspur. Produkttexte sind auf Deutsch und Französisch vorhanden.

Das primäre Datum ist weiterhin vor vollständiger Auswahl bedienbar und bleibt bei gleicher Bedeutung erhalten. Die Vorschau enthält weder vorbefüllte Prüfdaten noch synthetische Freigaben.

## Implementierung und Nachweise

- [Builder](../../scripts/build-ap19c2-candidate.mjs), [Manifest](../../data/candidates/2026-09-28-ap19c2/manifest.json), [Buildnachweis](../../outputs/ap19c2-2026-09-28/build-verification.json) und [lokaler Import](../../src/release/ap19c2CandidateData.ts).
- Bestehender [Sozialresolver](../../src/core/socialDeadline.ts) mit zusätzlicher AVIG-Chronologieprüfung, [UI-Zuordnung](../../src/ui/socialUi.ts) mit getrenntem Regelpfad und konkreter Herkunftsanbindung.
- [Buildertests](../../tests/core/ap19c2-builder.test.ts), [Engineintegration](../../tests/core/ap19c2-integration.test.ts), [UI-Vertrag](../../tests/ui/ap19c2-social.test.ts) und [Schemas](../../tests/data/test_ap19c2_contract.py).
- [SPFx-Transporttests](../../spfx/test/avig-release-contract.test.ts), [kompilierter ES5-Consumer](../../spfx/test-build/avig-consumer.test.cjs) und [Bestandsschutz](../../scripts/check-ap19c2-preservation.mjs).
- Tatsächliche Prüfergebnisse und Browsergrenzen im [AP19C2-Prüfbericht](../fachrecht/pruefbericht-ap19c2.md).

## Haltepunkt

Release-ID `2026-09-28-ap19c2-candidate.1`. Alle Regeln, Anbindungen und Freigabeeinträge bleiben Kandidaten, `approval` bleibt `null`. Die echte Vorschau gibt deshalb weiterhin kein Sozialfrist-Enddatum aus. Positive Rechenprüfungen verwenden ausschliesslich explizite synthetische Freigaben im Testspeicher.

Nach der fachlich-technischen Kandidatenabnahme kann AP19C3 für KVG gesondert gestartet werden. Datenpromotion, Veröffentlichung, Installation und Betriebsfreigabe sind spätere Schritte. MVP 0.4, Release-Pins, historische Abnahmeunterlagen, E/Q/P, Mirrors und Berechtigungen wurden nicht geändert. Codex dokumentiert und prüft als KI-Arbeitsinstrument, David Steimer erteilt die Abnahme in Personalunion.
