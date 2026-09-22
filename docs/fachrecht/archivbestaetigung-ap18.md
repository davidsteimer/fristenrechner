# AP18: Archivbestätigung und Trennung der Arbeitskopie

Stand: 22. September 2026. **Archivverfahren durch David Steimer bestätigt. Keine rückwirkende Wiederherstellung der ursprünglichen Dateiprüfsummen.**

## 1. Bestätigung und Reichweite

David Steimer hat nach eigener Suche mitgeteilt, dass keine andere V0.9 mehr auffindbar ist, und erklärt:

> Nein, ich finde keine andere Version mehr. Das heisst Archivbestätigung und künftige Trennung der Arbeitskopie. Damit können wir mit AP18C fortfahren.

Die heute vorhandene V0.9 wird deshalb mit ihrer aktuellen Prüfsumme als dokumentierter Archivbestand gesichert. Die ursprüngliche Fachabnahme vom 13. September 2026 und deren ursprünglicher Hash bleiben unverändert erhalten. Der neue Archivvermerk ist vom 22. September 2026 und wird nicht rückdatiert.

V0.10 wird als ebenfalls abweichender historischer Folgestand mit eigenem Diagnosebefund mitgesichert. Ihre technische Einordnung ist kein zusätzlicher, vom Benutzer abgegebener Einzelentscheid über alle Diagnosewerte. Für AP18C wird weder V0.9 noch V0.10 als Importquelle eingesetzt. Massgebend bleibt ausschliesslich die abgenommene und byteidentisch erhaltene V0.12.

## 2. Prüfsummenbestand

| Version | Ursprünglich dokumentierte SHA-256 | Heute archivierte SHA-256 | Einordnung |
| --- | --- | --- | --- |
| V0.9 | `a245080126586f1104b459ff5e225808e2d78578d24a2ce619d7d31d2d27ed12` | `7663aacdca75d66c565ca6c049c9958dafad792ec46ec0d0515b4cb1505e8453` | Bestätigter beobachteter Archivbestand, Originalbytes nicht wiedergefunden |
| V0.10 | `bba15a8f6e7b6956662d00bb1b7efb51903ad19aa2b2d1dc29c42a7fd9361e4e` | `57b3c3c668bb00360cf94da159a29509116691f9282419ebc7a87cdf8b88b619` | Dokumentierter beobachteter Folgestand, einschliesslich geändertem Anzeigejahr |
| V0.11 | `37d33d4639cc839fc41c9850de8e6551d546167fe8b9ee7f10ea5f2c062d99fd` | `37d33d4639cc839fc41c9850de8e6551d546167fe8b9ee7f10ea5f2c062d99fd` | Byteidentische Referenz |
| V0.12 | `d4fe89932b5d33f7f63516073668accf1a92b141a07388b559c3a6965c1aeb65` | `d4fe89932b5d33f7f63516073668accf1a92b141a07388b559c3a6965c1aeb65` | Byteidentische, abgenommene AP18C-Eingangsreferenz |

Das [maschinenlesbare Archivverzeichnis](../../outputs/archiv/ap18/2026-09-22/manifest.json) führt beide Hashwerte getrennt. Es bezeichnet die historische Byteidentität für V0.9 und V0.10 ausdrücklich als `false`. Eine Prüfsumme ist ein Integritätsnachweis, keine digitale Signatur oder zweite menschliche Freigabe.

## 3. Was die Diagnose belegt

Die Vergleichsstände wurden ausschliesslich im Speicher aus der unveränderten V0.8, den erhaltenen Autor-Exporten und den deklarierten Änderungen rekonstruiert. Sie sind keine wiedergefundenen Originaldateien. Die nicht erfüllbare historische V0.9-Prüfsummensperre wurde für die Diagnose nicht als bestandener Nachweis ausgegeben. Produktions- und historische Migrationssperren wurden nicht verändert.

| Prüfung | V0.9 | V0.10 |
| --- | ---: | ---: |
| Verglichene Zellen | 12'004 | 26'194 |
| Semantisch verglichene Formeln | 2'427 | 5'811 |
| Abweichende Eingabewerte | Keine | `Übersicht!B4`, Anzeigejahr 2027 → 2028 |
| Durch das Anzeigejahr geänderte Formelcaches | Keine | 1'697, unabhängig für 2028 geprüft |
| Nicht erklärte Wertänderungen | Keine festgestellt | Keine festgestellt |
| Datumsformelvergleiche 2026–2028 | 1'152 bestanden | 2'844 bestanden |

Keine Abweichungen wurden bei den fachlichen Regelparametern, Quellen, Gebietszuordnungen, semantischen Formeln, Tabellen, Validierungen, Zellschutzmerkmalen und aufgelösten Hyperlinks festgestellt. Bei der bedingten Formatierung wurden Prioritäten in zwei nicht überlappenden Bereichen umnummeriert. Darüber hinaus unterscheiden sich XML-Serialisierung, Metadaten und Paketbestandteile. Der Befund ist mit einem erneuten Speichern in Excel vereinbar, beweist aber weder Zeitpunkt noch Urheber oder tatsächlichen Ablauf der Speicherung.

Die heutigen V0.9-/V0.10-Dateien sind **nicht** als byteidentische Originale oder in allen Darstellungsdetails identische Fassungen ausgewiesen. Insbesondere sind bei V0.10 gerade nicht sämtliche gespeicherten Zellwerte identisch. Das geänderte Anzeigejahr und dessen korrekte Neuberechnungen sind Bestandteil des archivierten Befunds.

Nachweise: [V0.9-Diagnose](../../outputs/archiv/ap18/2026-09-22/v09-drift-diagnostic.json), [V0.10-Diagnose](../../outputs/archiv/ap18/2026-09-22/v10-drift-diagnostic.json). Die bisherigen Prüfberichte werden nicht nachträglich auf «bestanden» umgeschrieben. Die Diagnose führt keine neue Rechtsquellenprüfung durch.

## 4. Praktische Trennung ab jetzt

Im [Archivordner](../../outputs/archiv/ap18/2026-09-22/README.md) bestehen zwei getrennte Gruppen:

- `beobachteter-bestand`: die heute verfügbaren V0.9 und V0.10 mit dokumentierter historischer Abweichung.
- `referenzen`: die byteidentischen V0.11 und V0.12. Nur die V0.12 ist Eingangsreferenz des aktuellen AP18C-Imports.

Die Dateien wurden ohne Excel-Rückexport byteweise kopiert und erneut eingelesen. Die ursprünglichen Dateien an den bisherigen Orten wurden weder verschoben noch überschrieben. Die neuen Archivkopien sind lokal schreibgeschützt. Dieser Dateimodus ist ein Schutz gegen versehentliches Speichern, kein revisionssicherer WORM-Speicher und keine Garantie gegen OneDrive- oder manuelle Änderungen. Massgebend bleibt die wiederholte Hashprüfung.

Für interaktive Excel-Arbeit besteht eine separate, bearbeitbare [Arbeitskopie ab V0.12](../../outputs/arbeitskopien/ap18/Feiertagsmatrix_Schweiz_Arbeitskopie_ab_V0.12.xlsx). Sie ist bei Erstellung byteidentisch mit V0.12. Änderungen an dieser Kopie sind Entwürfe und weder automatisch fachlich abgenommen noch freigegebene Runtime-Daten. Der Ordner ist von Git ausgeschlossen. Er gehört nicht in einen öffentlichen Release und ist kein Importpfad.

Künftiger Ablauf:

1. Excel ausschliesslich an der Arbeitskopie bearbeiten, einschliesslich Anzeigejahr, Filter und Tests.
2. Bei einem neuen Prüfstand eine neue versionierte Datei erstellen. Keine bestehende Referenz ersetzen.
3. Die tatsächlich gespeicherte neue Datei prüfen und mit ihrer Prüfsumme zur Abnahme vorlegen.
4. Nach Abnahme eine separate Referenzkopie samt Abnahmebeleg einfrieren. Den Import ausdrücklich auf diese neue Referenz umstellen.
5. Die Arbeitskopie anschliessend weiterverwenden oder eine neue anlegen. Das Hilfsskript überschreibt eine vorhandene Arbeitskopie niemals.

## 5. Getrennte Prüfspuren

**Funktionstests:** Die historischen Batch-Modelle werden aus ihren nachvollziehbaren Erfassungsgrundlagen aufgebaut. Alle fachlichen Assertions bleiben erhalten. Diese Tests behaupten keinen Import der heutigen V0.9 und keine historische Byteidentität. AP18C selbst testet weiterhin die tatsächlich gespeicherte V0.12.

**Archivtests:** Ein eigener Prüflauf verifiziert die heutigen Archivkopien, deren Zuordnung und die unverändert dokumentierten alten Hashwerte. Sein Status lautet ausdrücklich `verifiedWithDocumentedHistoricalVariance`, nicht «historische Originale wiederhergestellt». Manipulierte oder fehlende Archivkopien führen weiterhin zum Fehler. Eine strikte Prüfung der ursprünglichen Byteidentität scheitert erwartungsgemäss bei V0.9 und V0.10. Die alte Migrationsfunktion `createBatch04Model` lehnt die abweichende V0.9 unverändert ab.

Wiederholungsbefehle mit der Projekt-Toolchain:

```sh
npm run test:archive:ap18
npm run test:calendar-models
npm run build:data:ap18c:candidate
npm run test:ap18c
```

Der separate Diagnosebefehl `node scripts/ap18-workbook-archive.mjs --strict-historical` endet bewusst mit Fehler. Das ist kein neuer Defekt, sondern der weiterhin fehlende historische Bytebeweis. Er ist nicht als bestandene Releaseprüfung aufzuführen.

Die Archivbestätigung beseitigt die organisatorische Blockade von AP18C, nicht die historische Abweichung. Sie verändert keine Produktdaten, Fachregeln, Schemafreigaben oder Installationen. Der nächste technische Produktvertrag wird separat als [DEC-2026-023](../entscheidungen/DEC-2026-023-schweizweiter-feiertagskatalog.md) vorgeschlagen.

David Steimer bestätigt das Archivverfahren und verantwortet die fachlichen Freigaben. Codex erstellt Kopien, Implementierung und technische Nachweise ohne eigene formelle Freigabeverantwortung.
