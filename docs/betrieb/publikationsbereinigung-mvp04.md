# MVP 0.4: Umsetzung und Nachprüfung P01/P02

Stand: 22. September 2026. **Die beiden Publikationshindernisse sind lokal bereinigt. Veröffentlichung und Bereitstellung sind nicht erfolgt.**

## Beschluss und Ergebnis

David Steimer hat P01 mit Variante 2 und P02 mit der gezielten Aktualisierung der lebenden Einstiegstexte und IT-Unterlagen auf MVP 0.4 entschieden. Dieser Nachtrag dokumentiert deren Umsetzung. Die [ursprüngliche Publikationsvorprüfung](publikationsvorpruefung-mvp04.md) und ihr [maschinenlesbarer Ausgangsbefund](../../outputs/release-mvp04-2026-09-22/publication-preflight.json) bleiben unverändert als historische Nachweise erhalten. Ihre damals offenen Punkte P01/P02 sind mit diesem Nachtrag erledigt, nicht rückwirkend aus dem Ausgangsbericht entfernt.

| Punkt | Umsetzung | Ergebnis |
| --- | --- | --- |
| P01: persönliche Speicherpfadmetadaten | Vier V0.9-/V0.10-Originaldateien unverändert privat erhalten, zwei separat benannte öffentliche Ableitungen erstellt | Keine lokale Speicherpfadangabe in den Publikationskopien. Eigene Prüfsummen und exakter ZIP-Komponentenvergleich |
| P02: veraltete aktuelle Einstiegstexte | Root-README, Dokumentationsindex, SPFx-README und beide IT-Unterlagen auf MVP 0.4 aktualisiert | Paket, Formatverträge, Datenpin, Mirror und noch ausstehende Freigaben stimmen mit der tatsächlichen Konfiguration überein |
| P03: erklärte SPFx-Buildvarianz | Bestehende Erklärung und Paketidentität beibehalten | Kein neues Paket und keine Behauptung eines bitidentischen SPFx-Neubaus |

Der [maschinenlesbare Nachtrag](../../outputs/release-mvp04-2026-09-22/publication-remediation.json) bindet den geprüften öffentlichen Eingabestand per SHA-256. Der Datencommit bleibt `739876a0d11b550ea8cc702622ab22af321994a5`.

## P01: getrennte Kopien, keine Umschreibung der Geschichte

Die beiden [Publikationskopien und ihr Herkunftsnachweis](../fachrecht/publikationskopien-ap18.md) ersetzen weder die privaten Originale noch deren historische Prüfsummen. In jeder Kopie wurde ausschliesslich die persönliche Speicherpfadangabe aus `xl/workbook.xml` samt ihrer sonst leeren XML-Umhüllung entfernt. Alle übrigen unkomprimierten ZIP-Komponenten sind byteidentisch. Zellen, Formeln, gespeicherte Formelresultate, Formatierungen, Tabellen, Filter, Datenvalidierungen und Quellenlinks sind unverändert. Die übrige Workbook-XML-Struktur ist zusätzlich semantisch verglichen.

Es erfolgte kein Speichern oder Neuberechnen mit Excel oder einer Tabellenbibliothek. Beide tatsächlich gespeicherten Kopien wurden nochmals schreibfrei mit dem Tabellenwerkzeug importiert. Je neun Tabellenblätter waren lesbar und die Dateihashes blieben gleich. Eine erneute visuelle Prüfung oder Neuberechnung wird für diese reine Metadatenänderung nicht behauptet. Das unveränderte fachliche und visuelle Material der Vorprüfung bleibt Referenz.

Die öffentlichen Archivtests verlangen die unveränderten Referenzen V0.11/V0.12 und die bereinigten Kopien, aber keine privaten V0.9-/V0.10-Originalbytes. Die private Prüfung verlangt diese Originale zusätzlich und bestätigt deren ursprüngliche beobachtete Prüfsummen. Ein fehlendes oder geändertes öffentliches Manifest führt zum Abbruch. Die rein private Archivvorbereitung ist ausdrücklich kein Ersatz für die öffentliche Prüfung.

Vier Originalpfade, `Userinput/`, Office-Sperrdateien und Arbeitskopien sind vom normalen Git-Staging ausgeschlossen. Die Originale wurden weder verschoben noch gelöscht. Der Benutzerbestand und die fachlich massgebende V0.12 bleiben unverändert. Ein erzwungenes Hinzufügen kann Git-Ausschlüsse umgehen, deshalb bleibt der konkrete Veröffentlichungsumfang verbindlich.

Vier eingefrorene historische Berichte behalten ihre Verweise auf die damals verwendeten privaten Originalpfade. Hinzu kommt ein ausdrücklich lokaler Arbeitskopienverweis in der Archivbestätigung. Das sind fünf bewusst dokumentierte, öffentlich nicht auflösbare historische beziehungsweise lokale Verweise. Die aktuellen Einstiege führen zu den separat bezeichneten Publikationskopien. Diese fünf Ausnahmen werden in der Linkprüfung nicht als funktionierende öffentliche Downloads ausgegeben.

## P02: konsistenter aktueller Einstieg

Die [technische Kurzdokumentation](../architektur/technische-kurzdokumentation.md) und [Installations- und Betriebsanleitung für Dritt-Tenants](installation-und-betrieb-dritttenants.md) beschreiben jetzt:

- Anwendung `0.4.0` und das unveränderte vorbereitete SPFx-Paket `0.4.0.0`
- Manifest-/Consumerformat `4.0.0`, Spezialregimekatalog `3.0.0`, Kalender `2.0.0` und Feiertagskatalog `1.0.0`
- den tatsächlichen, noch nicht veröffentlichten Datenpin und die notwendige öffentliche Byteprüfung vor dessen Nutzung
- den vollständigen SharePoint-Mirror mit Manifest und neun Nutzartefakten, einschliesslich `holiday-catalogs/ch-holiday-catalog.json`
- die koordinierte Aktualisierung von App und Datenpfad sowie den erhaltenen MVP-0.3-Rückfallstand
- die unveränderten Produktgrenzen und noch ausstehenden E-/Q-/P-Prüfungen

Die Dokumente unterscheiden den lokal vorbereiteten MVP-0.4-Stand vom dokumentierten externen MVP-0.3-Betrieb. Die vollständige Schweizer Kalendergrundlage ist keine Freigabe weiterer kantonaler Fristenprofile. Es entstehen keine zusätzlichen API-Berechtigungen oder tenantbezogenen Änderungen.

## Nachprüfung im abgegrenzten öffentlichen Dateiexport

Der erneute Export umfasst 640 Eingabedateien, davon 343 neue oder geänderte Dateien gegenüber `81815d45d2950fbdbafcb4406a6928843f16ec2a`. Diese 343 Dateien umfassen 281 UTF-8-Dateien, 14 XLSX-Dateien, 47 PNG-Dateien und ein SPPKG. Dieser Nachtrag und sein JSON-Nachweis kommen als zwei neue Ergebnisdateien hinzu und gehören nicht zu ihrem eigenen Eingabeinventar. Die vier privaten Originale fehlen im Export. Die lokale Benutzeränderung des historischen Word-Projektplans ist ausgeschlossen, dessen bereits versionierter Ausgangsstand ist übernommen.

Es ist ein sauberer **Dateiexport**, kein erfolgreicher Git-Klon. Die Root-Node-Abhängigkeiten wurden mit Node.js `22.23.2` erneut frisch und offline aus der Lockdatei installiert, diesmal mit deaktivierten Installationsskripten. Es wurden 37 Pakete installiert. Python `3.12.14` läuft in einer neuen virtuellen Umgebung mit den übernommenen vorhandenen Bibliotheken einschliesslich `jsonschema 4.25.1`. Dies ist keine frische pip-Installation. Die Paketprüfung liest zusätzlich die unveränderlichen Git-Objekte des echten Datenpins und des bisherigen Rollbackpakets, nicht private Projektdateien.

Die erneute Inhaltsprüfung des vorgesehenen öffentlichen Umfangs findet keine konkreten Zugangsdaten, privaten Kontoadressen oder persönlichen lokalen Speicherpfade. Alle 14 XLSX-Dateien sind strukturell lesbar. Es wurden keine versteckten Blätter, Zeilen oder Spalten, Kommentare, Makros, eingebetteten Dateien oder externen Arbeitsmappenverbindungen festgestellt. Die 523 externen XLSX-Beziehungen sind normale HTTPS-Quellenlinks ohne eingebettete Zugangsdaten. Der bestehende Bearbeitername David Steimer bleibt als bewusste Projektzuordnung erhalten.

| Prüfung im Export | Ergebnis |
| --- | --- |
| TypeScript, Kern-/UI-Tests, öffentliche Tests, UI- und Webbuild | 675 Kern-/UI- und sieben öffentliche Tests bestanden |
| Öffentlicher Archivvertrag | 35 Tests bestanden, private Originale nicht erforderlich |
| Ableitung der Publikationskopien | 42 Tests bestanden, einschliesslich Grenzen und Negativfällen |
| Kalender-, Arbeitsmappen-, Import- und Promotionsmodelle | 484 Tests bestanden |
| Katalog- und Altconsumerverträge | 31 Tests bestanden |
| Datenrelease MVP 0.4 | Schema, Prüfsummen und 19 Negativprüfungen bestanden |
| Arbeitsmappenimport | 68 JavaScript- und 27 Python-Tests bestanden |
| Quellenregister und Abnahme | 17 Python-, 37 JavaScript- und acht Negativprüfungen bestanden. Alle 13 gebundenen Abnahmedateien unverändert |
| Unabhängiges historisches Testorakel | 15 Referenzfälle, drei Sperrfälle und Negativprüfungen bestanden |
| Erneute Verpackung und Artefaktprüfung | 27 Tests bestanden, vorbereitete Artefakte unverändert |

Die Gruppen überschneiden sich und werden nicht zu einer Gesamttestzahl addiert. Der in der ursprünglichen Vorprüfung bestandene SPFx-Neubau mit 48 Tests wird nicht als nochmals durchgeführt ausgegeben. Produktquellen, SPFx-Buildkonfiguration und Paket blieben bei P01/P02 unverändert. Dasselbe gilt für die bereits einzeln visuell geprüften 47 PNG-Dateien. Deren Prüfsummen binden die übernommenen Nachweise an den jetzigen Bestand.

## Unveränderte Artefakte und Freigabegrenze

| Artefakt | SHA-256 |
| --- | --- |
| Vorbereitetes SPPKG `0.4.0.0` | `eaf4c24ae53c8c3166e38025cbe2337029c2dd88930e354030c97e622ffb6a2a` |
| Vollständiges Mirror-ZIP | `3a194a29e25eb08a1c503306372671f7d9747951cdb5f31937556c3d41da0536` |
| Öffentliches Web-ZIP | `1131d164d96cffe7ed43206f39b38a1790fa86292542b8d73fa7604f3845d69c` |
| Laufzeitmanifest MVP 0.4 | `a240b01feb671dbe4374c1e097bc9143d66fd4878cd235b3b490a9c08afec72e` |

Rechtsregeln, 479 Katalogregeln, operative CH-/BE-Projektion, V0.12, Quellenabnahme und beschlossene AI-Behandlung bleiben unverändert. Die Prüfung ist eine begrenzte Publikations- und Regressionsprüfung, keine vollständige Sicherheitsanalyse, erneute juristische Quellenprüfung oder Zielumgebungsprüfung. Musterprüfungen können beliebig codierte Geheimnisse oder steganografische Inhalte nicht ausschliessen.

Es gab keinen neuen Commit, Push, Deploy-Key, externen Schreibzugriff, Tenant- oder Hostingwechsel. Für GitHub-Veröffentlichung und allfälligen temporären Schreibzugriff ist die konkrete Freigabe weiterhin erforderlich. Anschliessend folgen öffentlicher Bytevergleich, gesondert freigegebene E-/Q-/P-Bereitstellung und die Zielumgebungsprüfungen gemäss [Releaseplan](deployment-mvp-04.md). Die ignorierten Web- und Mirror-ZIP-Dateien werden durch einen Git-Push nicht automatisch als Release-Anhänge veröffentlicht.
