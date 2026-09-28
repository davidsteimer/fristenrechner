# AP19C1 · Formularvereinfachung

Stand: 27. September 2026. Von David Steimer beauftragte lokale UI-Korrektur. Keine Kandidaten-, Release- oder Betriebsfreigabe.

## Anlass und Befund

Das Formular soll nur unmittelbar benötigte Angaben hervorheben. In allen 16 derzeit modellierten Format-5-Sozialpfaden bestimmen Spezialerlass, Verfahrenshandlung und gegebenenfalls Verfahrensstadium den Dokumenttyp eindeutig. Ein zusätzliches, ohnehin nicht veränderbares Dokumentfeld verlangt keine fachliche Entscheidung. Die modellierte Zuständigkeit erläutert den unterstützten Fallbereich und ersetzt keine fallbezogene Zuständigkeitsangabe.

## Umgesetzte Korrektur

- Das separate Feld «Fristauslösendes Dokument» entfällt im Formular dieser Sozialpfade.
- Die Beschwerdeauswahl lautet beim IVG «Beschwerde gegen Verfügung», bei AHVG, UVG und ELG «Beschwerde gegen Einspracheentscheid». Die französischen Beschriftungen unterscheiden entsprechend «décision» und «décision sur opposition». Auswahlkennungen bleiben gleich.
- Modellierte Zuständigkeit, zusätzliche Fallvoraussetzungen und der Hinweis zur Trennung von Verfahrenskontext und Fallangaben stehen unter der aufklappbaren Rechenspur. Dort bleiben auch Dokumenttyp, Regel-/Anbindungskennungen und sämtliche bisherigen Quellenlinks nachvollziehbar.
- Die Rechenspur bleibt für diese Sozialpfade zunächst geschlossen. Sperrgründe stehen weiterhin unmittelbar im Ergebnisbereich, nicht erst in der Rechenspur.
- Zweispaltiges Raster und schmaler Einspaltenmodus bleiben erhalten. Verfahrensgegenstand und massgebende Eröffnung bleiben als feste Modellanzeigen sichtbar. Gerichtskanton, notwendiger Wohnsitz und Zuständigkeitszeitpunkt sowie Feiertagsanknüpfung bleiben echte Fallangaben.

Die Änderung betrifft nur Darstellung und Beschriftungen der AP19C1-Sozialpfade. Rechenkern, Rechtsregeln, Quellen, Datenkandidat, Freigabesicherung, Standardwerte und `qualificationBasis: displayed-model-scope` bleiben unverändert. Die Anzeige einer Modellvoraussetzung wird nicht als zusätzliche Bestätigung des tatsächlichen Falls ausgegeben. Die bisherigen Format-1-bis-4-Pfade behalten ihre Darstellung.

## Erneute Prüfungen

| Prüfung | Ergebnis |
| --- | --- |
| TypeScript `--noEmit` | bestanden |
| Vollständige Kern-/UI-Suite | 819 bestanden, 0 fehlgeschlagen |
| Darin AP19C-UI-Suite | 28 bestanden, einschliesslich drei neuer Regressionstests |
| SPFx-Transport | 67 bestanden |
| Kompilierter ES5-Code und tatsächliches Testpaket | 29 bestanden |
| Produktionskompilierung, CSS-Audit und Paketierung | bestanden, zwei bestehende Lintwarnungen zu explizitem JSON-`null` |
| Geschützte Ausgangsdateien | alle 23 Prüfsummen unverändert |

Die neuen Regressionstests prüfen die eindeutige Dokumentzuordnung aller 16 Pfade, DE-/FR-Handlungsbeschriftungen einschliesslich unveränderter alter IVG-Auswahl sowie die Platzierung der Zusatzinformationen. Die Platzierungsprüfung ist ein Quellstrukturtest, kein gerenderter Browsertest.

Zusätzlich wurde die neu gebaute lokale Vorschau im Browser bedient. Beim UVG-Beschwerdepfad wurden das reduzierte Formular, die präzisierte Handlungsbeschriftung, Empfangsdatum, Gerichtskanton und Feiertagsanknüpfung geprüft. Der vollständige Fall führt weiterhin zur sichtbaren Kandidatensperre ohne Enddatum. Die Rechenspur bleibt zunächst geschlossen. Nach dem Öffnen sind Modellkontext, Dokumenttyp, Kennungen und Quellenlinks vorhanden. Der Sprachwechsel zeigt die französischen Formular- und Kontexttexte. Der geöffnete Ergebnisbereich wurde auch visuell geprüft. Es wurden keine Standards gespeichert oder zurückgesetzt.

Der isolierte Build liegt lokal unter `.work/ap19c-spfx-build-Yh9WQD`. Testpaket-SHA-256: `9df9093cb8007ff305878c1c32fccf647e79c2df0369046a6434ab80b1fe3314`. Dieses Paket ist ausschliesslich ein Prüfarbeitsstand, kein Installations- oder Publikationspaket. Das bisherige SPPKG bleibt unverändert mit SHA-256 `9f31513cbc56f0ee2bb178e1db9336252d0266527643bebc2fb1348820711346`.

Der Datenkandidat `2026-09-25-ap19c1-candidate.1` bleibt unverändert mit Manifest-SHA-256 `eae74fc823128e96a42980cd4eeac448e24dece60514b426d92eb698abb49524`. Die früheren QA-Artefakte vom 25. September wurden nicht durch diesen Nachweis ersetzt. Es gab keinen Commit, Push, Datenpromotion, Deployment oder Eingriff in M365 beziehungsweise Hosting.
