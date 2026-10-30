---
id: DEC-2026-035-BESCHLUSS
titel: "Beschluss zu Kantonalverfahrenskatalog 3 und Manifest 10"
status: beschlossen
entscheidungsdatum: 2026-10-22
klasse: B
entschieden_durch: David Steimer
quelle:
  - "AP23F2 ist technisch abgenommen. Ich bestätige DEC-2026-035 mit Katalog 3.0.0 sowie Manifest und Mindestconsumer 10.0.0. Bitte starte AP23F3."
---

# DEC-2026-035 Beschlossener Kantonalverfahrensvertrag

David Steimer hat am 22. Oktober 2026 die [Entscheidungsvorlage](DEC-2026-035-qualifizierte-kantonalverfahren-v3.md) ausdrücklich bestätigt. Ihr SHA-256 ist `574a0d0daa54d119e94199708b704ba4d7bec9adc6f49a10efa6839752cd1f12`. Die Vorlage und der Strukturkandidat bleiben mit ihren damaligen Bytes und Vorschlagsstatus erhalten. Die [technische Abnahme AP23F2](../fachrecht/abnahme-ap23f2.md) ist zugleich erklärt.

## Beschlossener Inhalt

- Kantonalverfahrenskatalog **3.0.0**, Manifest und Mindestconsumer **10.0.0**. Keine neue Produkt- oder Paketversionsnummer. Übrige Komponentenformate und Standards Version 5 bleiben unverändert.
- 25 alte Pfad- und Qualifikationsdefinitionen erhalten, 17 neue qualifizierte ZH-/AG-/SG-Wege. Neue Zielorgan-, Gegenstands-, Kanal- und Ausnahmebelehrungsqualifikationen bleiben aktuelle Falltatsachen und werden nicht aus Standards rekonstruiert.
- Explizite, lückenlose und überschneidungsfreie Normabschnitte mit zeitlich richtigen Quellen. ZH vor und ab 01.01.2027, SG vor und ab 01.06.2027. Jeder bewertete Tag muss gedeckt sein.
- Vier neue rechtliche Kalenderverwendungen und eine zusätzliche Zürcher Neunerprojektion. Keine fachliche Änderung der 479 Basisregeln, zwölf gesonderten SO-Regeln oder 32 bestehenden Kalender.
- Bestehende Endverschiebungssicherung für die neun neuen Pfade mit anwendbarem Stillstand. Kein pauschaler Ausschluss ferienfreier SG- oder Verwaltungspfade.
- Vollständiges Fallfenster 29.08.2026–31.12.2027. Keine zusätzliche Sozial-, Spezialverfahrens- oder kommunale Freigabe.

Der [Vertragsnachtrag](../architektur/verwaltungsverfahrensvertrag-ap23f2.md) mit SHA-256 `7043456ebafa9b57e6e0b85c703364c457d467b39110f83bb9b3f9adf6b0894d` ist Teil des bestätigten Stands.

## Vollzug

AP23F3 ist als lokale Produktintegration gestartet. Die neue Zürcher Projektionsdefinition und sämtliche abhängigen Herkunfts-/Zielreferenzen müssen konsistent gebunden sein. Ein nativer Format-10-Leser darf die neuen Fälle nicht in einen alten Format-9-Kontext herunterkonvertieren. Kandidaten bleiben ohne Release- und Kalenderexportberechtigung.

Die Bündelung nach DEC-2026-034 bleibt bestehen. Quellenpromotion, definitive Auslieferungsbuilds, Quellcommits, GitHub-Push, Uploads, E/Q/P und Rechteänderungen sind nicht freigegeben. Frühere Verträge bleiben für historische Formate gültig. Codex hat keine formelle Freigabe- oder Haftungsverantwortung.

