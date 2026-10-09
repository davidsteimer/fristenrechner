# AP22A Abschlussfassung V1.0

Abgeschlossen am 8. Oktober 2026 gestützt auf [DEC-2026-029](../../docs/entscheidungen/DEC-2026-029-begrenzte-behandlung-zweiter-januar.md). Der Entscheid ergänzt DEC-2026-028. Eine weitere pauschale Abnahme von AP22A ist nicht erforderlich.

## Gebundene Abschlussartefakte

| Datei | SHA-256 |
| --- | --- |
| [Arbeitsmappe V1.0](2026-10-08_Verfahrens-und-Gebietsmatrix_AP22A_V1.0.xlsx) | `04017ac54da729e5a35ae8926076362027015b581744c87023d5696db61ccad0` |
| [Strukturierter Abschlussstand](matrix-data-v10.json) | `7c0512b66fcd7206c47f2d36b4774824325fe779b7045cb12925bf2fb0146f89` |

V1.0 ist die Version der Dokumentationsarbeitsmappe, kein neuer Produktformatvertrag. Die ursprünglichen Fassungen V0.1 und V0.2 bleiben unverändert. Die neue Fassung enthält weiterhin 198 Listen-/Verfahrensbindungen, 157 Quellenverweise und 22 Prüfaufträge.

Vier bisher offene Grenzentscheide zum 2. Januar sind als «Ergebnisabhängig begrenzt» nachgeführt: SH/StPO sowie SG/StPO, BGG und VwVG. Nur bei einem tatsächlichen Ergebnisunterschied ist eine Einzelfallklärung statt eines definitiven automatischen Fristresultats vorgesehen. Die Implementierung dieser Begrenzung steht aus. Die Benutzerbemerkungen, die vier GR-Abgrenzungen und die 20 negativen Listenbindungen sind bewahrt.

## Prüfung der tatsächlichen Abschlussdatei

- [Bauprotokoll](workbook-build.json) und [gespeicherte Rückleseprüfung](workbook-qa.json): fünf Summenformeln mit den erwarteten Zählungen 8 / 160 / 4 / 4 / 22. Keine erkannten Formelfehler. Eine temporäre Statusänderung änderte die beiden abhängigen Zähler korrekt und wurde anschliessend zurückgesetzt.
- Fünf Ausschnitte der gespeicherten Datei wurden gerendert und visuell geprüft: Übersicht, Statuszeilen, Freigabevermerke und GR-Bemerkungen, Prüfauftrag R19 sowie Titelbereich. Kein Darstellungsfehler festgestellt.
- [Unabhängiger Erhaltungsabgleich](workbook-preservation-qa.json): exakt 30 beabsichtigte Zelländerungen gegenüber V0.2. Dazu vier geänderte Statusfarben und die angepasste Höhe von Prüfzeile 25. Übrige Zellwerte, Formeln und Zellformate, sämtliche Benutzerbemerkungen, Geltungsräume und Quelleninhalte unverändert.
- Fünf Tabellen mit Filtern und Fixierungen sowie 157 native Quellenhyperlinks erhalten. Die vier SHA-256-Prüfsummen der gebundenen V0.1-/V0.2-Dateien und ihrer JSON-Daten stimmen weiterhin überein.
- Die Verfügbarkeit der externen Quellenlinks wurde nicht erneut geprüft. Quellen- und Modellnachweise behalten den Stand vom 2. Oktober 2026. Die damaligen 14 Modellproben und 220 Bestandsregressionen wurden für diesen Dokumentationsabschluss nicht erneut ausgeführt.

Keine erneute native Excel-Bedienprüfung und keine bestätigte OneDrive-Synchronisation. Produktcode, freigegebene Laufzeitdaten, E/Q/P, Mirrors, AP5 und GitHub bleiben unverändert. Der entfernte Status von Issue #46 und des GitHub-Projekts wurde nicht geprüft oder geändert.

## Übergabe

Der [AP22A-Abschlussnachweis](../../docs/fachrecht/abschluss-ap22a.md) bündelt die fachlichen Grenzen und Folgearbeiten. AP22B erstellt als nächster Schritt den Daten- und Migrationsvertrag. Es ist mit diesem Abschluss weder gestartet noch sind dessen vorgeschlagene Produktversionen beschlossen.
