# AP23F2 Technische Abnahme und Start von AP23F3

Datum: 22. Oktober 2026. Entscheider: David Steimer.

David Steimer hat erklärt:

> AP23F2 ist technisch abgenommen. Ich bestätige DEC-2026-035 mit Katalog 3.0.0 sowie Manifest und Mindestconsumer 10.0.0. Bitte starte AP23F3.

**AP23F2 ist technisch abgenommen. DEC-2026-035 ist beschlossen. AP23F3 ist ausdrücklich gestartet.** Die ursprüngliche Vertragsvorlage, Strukturprobe und Prüfnachweise bleiben mit ihren damaligen Statusangaben und Bytes erhalten. Der gesonderte [Beschluss](../entscheidungen/DEC-2026-035-beschluss.md) dokumentiert die neue menschliche Entscheidung.

## Abgenommener technischer Stand

Kantonalverfahrenskatalog 3, Manifest und Mindestconsumer 10, die explizite aktuelle Fallqualifikation und die Normzeitleisten sind bestätigt. Die 17 neuen ZH-/AG-/SG-Wege ergänzen die 25 unveränderten alten Definitionen. F1-O1 bleibt auf die neun neuen Gerichtsferienpfade begrenzt. Die 80 F1-Erwartungen, Manipulations-/Deckungsprüfungen und unabhängige Gegenprüfung sind Teil des angenommenen Ergebnisses.

Die zusätzliche Zürcher Verwaltungsprojektion ist in der Strukturprobe noch nicht Teil der historischen Katalogaktivierung. Ihre konsistente neue Aktivierung und die Bindung aller tatsächlichen Zielbytes gehören erst zur beauftragten lokalen Integration. Die damaligen MVP09-Kopien und Freigaben werden nicht rückwirkend zu einer neuen Releasefreigabe.

## Gebundene Unterlagen

Die folgenden SHA-256-Werte wurden vor der Integrationsnachführung frisch geprüft.

| Unterlage relativ zum Repository | SHA-256 |
| --- | --- |
| `docs/entscheidungen/DEC-2026-035-qualifizierte-kantonalverfahren-v3.md` | `574a0d0daa54d119e94199708b704ba4d7bec9adc6f49a10efa6839752cd1f12` |
| `docs/architektur/verwaltungsverfahrensvertrag-ap23f2.md` | `7043456ebafa9b57e6e0b85c703364c457d467b39110f83bb9b3f9adf6b0894d` |
| `docs/architektur/verwaltungsverfahrensvertrag-ap23f2-pruefung.md` | `a56606be92fce3336098a479f512d05bcb1087642d25071fa6aa8107dc7ccd90` |
| `scripts/build-ap23f2-candidate.mjs` | `78ca2ece122c5b420d10ef935b080e26c267f349277e981890bcb18b7f203a0b` |
| `scripts/build-ap23f2-schemas.mjs` | `d5b7e30012133147a50a7195999bc072e035d151f4de106b478b4b9bb22049b7` |
| `scripts/check-ap23f2-contract.mjs` | `54620217071acaf9f3f662812842567726af08efe503465e6bcd72ce5a26d707` |
| `scripts/check_ap23f2_independent.py` | `0fc7f3894741de7b9625ea7430bbb12fcf74216f05caa04772f5bd0776f8de3b` |
| `outputs/ap23f2-candidate-2026-10-22/bundle/manifest.json` | `e835661353a0d7d402ecddf04cd7e3c10e58cae1976c2aeddfeb5e046edd34ec` |
| `outputs/ap23f2-candidate-2026-10-22/candidate-integrity.json` | `eec6edc5068546337a87d5e8dcefb891f42231ccc484267326d13960d1a1ca9b` |
| `outputs/ap23f2-2026-10-22/QA-AP23F2.json` | `ee6b9df9d2bb68cb8f6143eed455f1ac55f1605c3afb1965b1fa91c9b4a21f8f` |
| `outputs/ap23f2-2026-10-22/QA-AP23F2-INDEPENDENT.json` | `84a2c090b6b42a3949358ff71b5e6043a5b7d5e51ff0e22aec0f705bb32e0125` |
| `outputs/ap23f2-2026-10-22/local-completion.json` | `71fe841fc004a9e9cf422dfec85995c16b1a6d037112fea96b7e37a1e2a4adaa` |
| `schemas/candidates/ap23f2/administrative-input-v3.schema.json` | `39c2da3f671d4d850caa2724db78b2e437075cc65a2fb385eae788d42e7a3171` |
| `schemas/candidates/ap23f2/administrative-procedure-catalog-v3.schema.json` | `ca8627eece4cf9d9ab03650e11af147e93a1c60e6cb132420607832a64c379d2` |
| `schemas/candidates/ap23f2/local-reference-manifest-v10.schema.json` | `4ad0368d89b99e3e411f53e5d23e3c1c21845f978916029538c627c05456c769` |
| `schemas/candidates/ap23f2/release-manifest-v10.schema.json` | `e8b91009b785c7f59cba65d3e544901fa9a640e3bef56279d272ae9cd777a320` |

## Auftrag AP23F3 und Grenzen

AP23F3 integriert den nativen Format-10-Leser, die V3-Fallqualifikation, konsistent neu gebundene Kandidatenkomponenten, Rechenanbindung, DE-/FR-Oberfläche, Standards, Rechenspur und Exportgrenzen. Lokale Web-/SPFx-Integrationsnachweise und historische Regression gehören zur Prüfung. Die Fachregeln und bestätigten Zeitfenster werden nicht erweitert.

Der nächste reguläre Release bleibt gemäss DEC-2026-034 bis zur vereinbarten Kantonsabdeckung gebündelt. AP23F3 erzeugt keine neue operative Kantonsfreigabe, Quellenreleasefreigabe, Datenpromotion oder definitive Auslieferungsartefakte. Keine Commits, GitHub-Quellpublikation, Uploads, Installationen, Mirrorumstellung, E/Q/P- oder Berechtigungsänderungen. Persönliche Falltatsachen bleiben ungespeichert, historische Pins und AP5 erhalten.

David nimmt die menschlichen Abnahme- und Betriebsrollen in Personalunion wahr. Codex bereitet vor und prüft als KI-Arbeitsinstrument ohne formelle Freigabe- oder Haftungsverantwortung.

