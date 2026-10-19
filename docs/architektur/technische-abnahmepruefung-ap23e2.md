# AP23E2 Technische Abnahmeprüfung

Stand: 18. Oktober 2026. **Technische Prüfung bestanden, kein offener technischer Abnahmeblocker im Vertragsumfang.** [DEC-2026-033 ist durch David Steimer bestätigt](../entscheidungen/DEC-2026-033-beschluss.md). Das hier vorgelegte Prüfergebnis liegt zur menschlichen Teilpaketabnahme vor. AP23E3 ist nicht gestartet.

## Gegenstand und Ergebnis

Geprüft wurde der unveränderte [AP23E2-Vertragsstand](verwaltungsverfahrensvertrag-ap23e2.md) für den Kantonalverfahrenskatalog 2.0.0 und Manifest/Mindestconsumer 9.0.0. Die erneute Prüfung bestätigt die vollständige Darstellbarkeit der fachlich abgenommenen 13 LU-/ZG-/AR-Wege, ihre ausdrücklichen Fallvoraussetzungen und den Schutz der zwölf bisherigen TI-/GR-Pfade.

| Abnahmekriterium | Frischer Nachweis | Ergebnis |
| --- | --- | --- |
| Identität der Vorlage | Alle 15 im ursprünglichen Hauptbericht gebundenen Artefakte stimmen in Prüfsumme und Byteanzahl überein | Bestanden |
| Reproduzierbarkeit | Vier Schemas und Strukturkandidat erneut im Speicher erzeugt und gegen vorhandene Dateien verglichen | Byteidentisch |
| Qualifikationsbindungen | 25 eindeutige Bindungen an Pfad, Revision und Definition | Bestanden |
| Fachliche Referenzen | 51 Fälle gegen die abgenommenen Sollwerte, davon 34 berechenbare Datumsfälle und 17 Sperrfälle | Bestanden |
| Fehlerhafte Kataloge | 18 gezielt manipulierte Varianten | Alle abgewiesen |
| Fehlerhafte Fallangaben | 35 Varianten mit fehlenden oder widersprüchlichen Voraussetzungen | Alle gesperrt |
| Unabhängige Gegenprüfung | Python prüft Schemas, Bindungen, 51 Inputformen, Bestandswahrung und zehn eigene Negativproben | Bestanden |
| Historische Verfahren | Zwölf unveränderte Pfaddefinitionen und je eine Berechnungsstichprobe im freigegebenen MVP-0.8-Kontext | Bestanden |
| Versionsgrenze | Alte Reader lehnen den Strukturkandidaten und die geprüften Umetikettierungsversuche ab | Bestanden |
| Unveränderte Produktbasis | 95 Produktquelldateien einschliesslich der lokal abgenommenen UX-Korrektur, 42 MVP-0.8-Dateien einschliesslich Manifest und drei bestehende Schemas | Prüfsummen unverändert |

Beide ursprünglichen Prüfberichte bleiben byteidentisch erhalten. Der erneut ausgeführte Hauptprüfer erzeugt exakt dieselben JSON-Berichtsbytes. Die Ergebnisse der unabhängigen Gegenprüfung stimmen vollständig mit ihrem gebundenen Bericht überein. Zusätzlich wurde die Beweisführung getrennt auf ihre Aussagegrenzen geprüft, ohne weiteren Blocker.

## Aussagegrenzen

Der Nachweis betrifft **Datenvertrag und isolierten Strukturkandidaten**, nicht einen bereits integrierten Format-9-Produktreader. Die zwölf historischen Rechenstichproben verwenden den tatsächlichen MVP-0.8-Kontext. Die 40 kopierten Komponenten des Strukturkandidaten sind weiterhin Referenzkopien, keine neu freigegebenen oder vollständig neu gebundenen Zielkomponenten.

Der Python-Prüfer bestätigt bei den 51 Fällen deren Inputstruktur. Er ist kein zweiter unabhängiger E2-Rechner für sämtliche Resultate. Der gebundene unabhängige E1-Rechenvergleich bleibt der vorgängige zusätzliche Vergleichsmassstab.

AR-O1 sperrt weiterhin ohne definitives Enddatum und ohne Export. Die bereits erklärte unterschiedliche Diagnosestelle am 21. beziehungsweise 22. März 2027 ist kein abweichendes rechtliches Ergebnis. Alle isolierten Forschungsfälle bleiben ohne Exportberechtigung, auch wenn sie ein Referenzdatum liefern.

Der bestätigte Architekturentscheid wird getrennt vom historischen Vorschlagsstatus der Kandidatendateien geführt. Weder ihre Statusfelder noch historische Quellenprüfungen wurden nachträglich hochgestuft.

## Nachweise und Prüfbarkeit

Der neue [maschinenlesbare Prüfbericht](../../outputs/ap23e2-abnahmepruefung-2026-10-18/QA-AP23E2-ABNAHMEPRUEFUNG.json) bindet den bestätigten Entscheid, die historischen Artefakte und den Prüfer. Seine SHA-256-Prüfsumme lautet `9872982c93adb19b839827d0bb93ef1220457f2dfdd18263c99da02bf488e566`.

- [Ursprünglicher Hauptbericht](../../outputs/ap23e2-2026-10-18/QA-AP23E2.json), SHA-256 `ac7fd146a9db098d65b37c2c586fab36db0072290195b213f3d7e0cd00ca111b`.
- [Ursprüngliche unabhängige Gegenprüfung](../../outputs/ap23e2-2026-10-18/QA-AP23E2-INDEPENDENT.json), SHA-256 `26c739ed97ba82eebb888358a811052ace41e53554bebefaf5a01d39dbe44059`.
- [Wiederholbarer Abnahmeprüfer](../../scripts/check-ap23e2-acceptance.mjs). Er prüft die Ausgangshashes vor dem Lauf, führt die vorhandenen Prüfer ohne Überschreiben ihrer Berichte aus und kontrolliert anschliessend erneut die historischen Dateien und den unveränderten Git-HEAD.

Beim ersten Lauf des neuen Vergleichsprüfers wurde ein JavaScript-Objekt direkt mit dem gespeicherten JSON verglichen. Das optionale, nicht gesetzte Feld `nominalEnd` des Sperrfalls N13 existiert im Speicher als `undefined` und wird in JSON bestimmungsgemäss weggelassen. Ausschliesslich dieser neue Vergleich wurde auf die tatsächlich archivierten JSON-Bytes korrigiert. Die anschliessende Wiederholung besteht exakt. Kein Referenzwert, Kandidat, bestehender Prüfer oder Produktcode wurde dafür geändert.

## Übergabe

Empfehlung: AP23E2 im beschriebenen technischen Vertragsumfang abnehmen. Dafür genügt die Bestätigung **«AP23E2 ist technisch abgenommen.»** Ein anschliessender Auftrag **«Bitte starte AP23E3.»** eröffnet die lokale Produktintegration mit neuer Zielbytebindung, strengem Reader, Fallqualifikation, ruhiger DE-/FR-Oberfläche und Regression.

Die technische Prüfung ist keine formelle Freigabe durch Codex. David Steimer nimmt die Abnahmerolle wahr. Produktintegration, Quellenrelease, Datenübernahme und Betriebsfreigabe bleiben getrennt. Es gab keinen Commit, GitHub-Push, Upload oder Eingriff in E/Q/P, Mirrors, AP5 oder M365-Berechtigungen.
