---
id: DEC-2026-033-BESCHLUSS
titel: "Beschluss zur expliziten Fallqualifikation kantonaler Verwaltungsverfahren"
status: beschlossen
entscheidungsdatum: 2026-10-18
klasse: B
entschieden_durch: David Steimer
quelle:
  - "DEC-2026-033 ist bestätigt. Bitte starte die technische Abnahme."
---

# DEC-2026-033 Beschlossene Fallqualifikation

David Steimer hat am 18. Oktober 2026 die [Entscheidungsvorlage DEC-2026-033](DEC-2026-033-qualifizierte-kantonalverfahren-v2.md) ausdrücklich bestätigt und die technische Abnahmeprüfung von AP23E2 beauftragt. Die unveränderte Vorlage ist mit SHA-256 `4f93a38a3098b1c965652374c91bdca0dbf7865c7ca8f4faf62c976f00511c68` gebunden. Dieser Beschluss ergänzt ihren historischen Vorschlagsstatus, ohne die Vorlage oder den geprüften Strukturkandidaten umzuschreiben.

## Beschlossener Inhalt

- Kantonalverfahrenskatalog **2.0.0**, Manifest und Mindestconsumer **9.0.0**. Die übrigen Komponentenformate und Defaults Version 5 bleiben unverändert.
- Eine ausdrückliche Qualifikationsregel je Pfad und Revision, gebunden an Pfaddefinition und Einzelpfadfreigabe. Fehlende oder unbekannte Fallvoraussetzungen werden nicht positiv ergänzt.
- Die zwölf bisherigen TI-/GR-Pfade behalten ihre bisherige Semantik. Die dreizehn neuen LU-/ZG-/AR-Wege erhalten die abgegrenzte Qualifikation für Endentscheid, besondere AR-Vollstreckungsverfügung oder angeordnete Verfahrenseingabe. Kein pauschaler Ausschluss bestehender TI-/GR-Sonderwege.
- Die fachlich abgenommenen Zeitfenster, der AR-Fünftagesrekurs und die begrenzte Sperre AR-O1 bleiben unverändert. Keine zusätzliche Sozialfreigabe oder pauschale Spezialverfahrensfreigabe.
- Fünf rechtliche Kalenderverwendungen mit konsistenten physischen Herkunftsreferenzen. Historische Herkunft und neue Zielreleasebindung bleiben getrennt.
- Zweispaltige Oberfläche und frühe Datumseingabe bleiben erhalten. Die spätere pfadspezifische Fallkonstellation ersetzt keine unbekannten Falltatsachen. Sie wird weder aus Defaults rekonstruiert noch um zusätzliche Checkboxen ergänzt.

Der [Vertragsnachtrag](../architektur/verwaltungsverfahrensvertrag-ap23e2.md) ist mit SHA-256 `abf6b9c0b58f0e030fe9bd885508c4520b3c7e986cbdf7f20e285fff4f6ae344` Teil des bestätigten Entscheidstands.

## Vollzug und Abnahmegrenze

Beauftragt ist die erneute technische Prüfung des vorgelegten AP23E2-Stands. Die ausdrückliche Bestätigung dieses Architekturentscheids wird nicht als bereits erklärte Abnahme ihres erst anschliessend vorgelegten Ergebnisses dokumentiert. Das Ergebnis steht im [technischen Abnahmebericht](../architektur/technische-abnahmepruefung-ap23e2.md).

AP23E3 ist nicht gestartet. Die Produktintegration benötigt vollständig neu gebundene Zielkomponenten und einen strengen Format-9-Reader. Quellenrelease, Datenübernahme, Auslieferungsbuilds, Commit, Veröffentlichung und E/Q/P-Bereitstellung bleiben gesonderte Schritte. DEC-2026-032 und die historischen Produktfreigaben bleiben für den bisherigen Bestand gültig.

Der Strukturkandidat behält seinen damaligen Vorschlagsstatus. Seine alten MVP-0.8-Referenzkopien erhalten durch diesen Beschluss keine neue Releasefreigabe. Codex prüft und dokumentiert als KI-Arbeitsinstrument ohne formelle Freigabe- oder Haftungsverantwortung.
