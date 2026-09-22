# Publikationsvorprüfung MVP 0.4: AP17 und AP18

Prüfdatum: 22. September 2026. **Noch nicht zur unveränderten Veröffentlichung empfohlen.** Diese Prüfung ist weder Publikationsfreigabe noch Installation oder Betriebsfreigabe.

## Ergebnis und geprüfter Stand

Der zusammengehörige AP17-/AP18-Stand ist inventarisiert und in einem abgegrenzten Dateiexport geprüft. Die Produkt- und Datenprüfungen bestehen. Vor der Veröffentlichung sind der Umgang mit lokalen Pfadmetadaten in vier historischen Excel-Dateien und widersprüchliche aktuelle Einstiegstexte zu bereinigen. Die gesonderte SPFx-Rebuildprüfung wird unten eingeordnet.

Die Prüfung bezieht sich auf 336 neue oder geänderte Dateien mit 26'338'677 Bytes gegenüber `81815d45d2950fbdbafcb4406a6928843f16ec2a`. Darin enthalten ist der lokale Datencommit `739876a0d11b550ea8cc702622ab22af321994a5`. Der Export umfasst mit dem unveränderten Repository-Bestand 636 Dateien. Das [maschinenlesbare Prüfinventar](../../outputs/release-mvp04-2026-09-22/publication-preflight.json) bindet die 336 Delta-Dateien einzeln per SHA-256. Dieser Bericht und sein JSON-Nachweis entstehen erst aus der Prüfung und gehören nicht zu ihrem eigenen Eingabeinventar.

| Dateigruppe | Umfang | Ergebnis |
| --- | --- | --- |
| Code, Daten, Schemas und Textdokumentation | 272 UTF-8-Dateien | Keine konkreten Zugangsdaten, privaten Konten oder Benutzerpfade gefunden. Dokumentationsbefunde siehe unten |
| Excel-Arbeitsmappen einschliesslich Archivkopien | 16 Dateien, 141 Blätter, 515 ZIP-Komponenten | Vier Dateien mit lokalen Pfadmetadaten, keine Änderung vorgenommen |
| Screenshots | 47 PNG-Dateien | Alle einzeln visuell und technisch geprüft, kein konkreter Datenschutzbefund |
| SPFx-Paket | Eine SPPKG-Datei, 21 ZIP-Einträge | Paketinhalt geprüft, keine zusätzlichen API-Berechtigungen, Source Maps oder erkannten Zugangsdaten |

Die unabhängigen Text-, Office- und Bildinventare stimmen mit dem zentralen Delta-Inventar überein. Alle 657 geprüften relativen Markdown-Verweise und geprüften Überschriftenfragmente lösen lokal auf. Dies ist keine Erreichbarkeitsprüfung aller externen Links.

## Ausgeschlossene lokale Inhalte

Nicht Bestandteil der vorgesehenen Veröffentlichung sind:

- `Userinput/` mit den privaten Originalunterlagen
- Die lokale Benutzeränderung des historischen Word-Projektplans. Dessen bereits versionierter Ausgangsstand bleibt unverändert erhalten
- Zwei Office-Sperrdateien mit Präfix `~$`
- `.work/`, lokale Laufzeiten, installierte Abhängigkeiten, private Original- und veränderliche Arbeitskopien

Es wurde nichts pauschal zum Git-Index hinzugefügt. Ein späterer Veröffentlichungscommit muss auf einer ausdrücklichen Pfadliste beruhen. Insbesondere schützt die bisherige `.gitignore` nicht automatisch vor allen genannten Benutzerunterlagen und Sperrdateien.

## P01: Lokaler Speicherpfad in historischen Excel-Dateien

**Vor einer Veröffentlichung ist eine ausdrückliche Wahl erforderlich.**

Die Versionen V0.9 und V0.10 enthalten in `xl/workbook.xml` das Element `x15ac:absPath` mit einem lokalen Mac-/OneDrive-Projektverzeichnis im Attribut `url`. Dies betrifft jeweils den beobachteten Bestand und seine byteidentische Archivkopie, somit vier Dateien und zwei unterschiedliche Binärstände. Der vollständige personenbezogene Pfad wird hier nicht erneut offengelegt. Er ist keine Zugangsberechtigung, enthält aber für die öffentliche Dokumentation nicht benötigte Benutzer- und Ablageinformationen.

| Historischer Bestand und zugehörige Archivkopie | Gemeinsamer SHA-256 |
| --- | --- |
| V0.9 aus `outputs/ap18b-03-vs-fr-so-ge-2026-09-13/` und `outputs/archiv/ap18/2026-09-22/beobachteter-bestand/` | `7663aacdca75d66c565ca6c049c9958dafad792ec46ec0d0515b4cb1505e8453` |
| V0.10 aus `outputs/ap18b-04-restkantone-2026-09-13/` und `outputs/archiv/ap18/2026-09-22/beobachteter-bestand/` | `57b3c3c668bb00360cf94da159a29509116691f9282419ebc7a87cdf8b88b619` |

V0.11 und die fachlich massgebende V0.12 einschliesslich ihrer Referenzarchivkopien sind im geprüften Umfang unauffällig. V0.12 bleibt byteidentisch bei `d4fe89932b5d33f7f63516073668accf1a92b141a07388b559c3a6965c1aeb65`. Der Befund ist kein neuer Fehler der Feiertagsregeln.

Zwei transparente Vorgehensweisen sind möglich:

1. Die vier Dateien nach ausdrücklicher Zustimmung zur dauerhaften Offenlegung dieser Metadaten unverändert veröffentlichen. Archivvertrag, Originalhashes und Archivtests bleiben dann unverändert. Die bisherige Archivbestätigung ist für sich genommen keine solche Offenlegungsfreigabe.
2. Die Originale unverändert privat archivieren und getrennt bezeichnete, bereinigte Publikationskopien erstellen. Originalhash, Ergebnishash und ein eng begrenztes XML-Delta dokumentieren die Ableitung. Der öffentliche Archivnachweis und seine Tests müssen anschliessend ausdrücklich zwischen privatem Original und öffentlicher Ableitung unterscheiden. Ein öffentlicher Klon kann ohne die privaten Originale deren Bytes nicht selbst erneut prüfen.

Für einen datensparsamen öffentlichen Bestand wird Variante 2 empfohlen. Es wurde keine der beiden Varianten vorweggenommen. Insbesondere wurden keine abgenommenen Hashes ersetzt, keine historischen Abweichungen umgedeutet und keine XLSX-Dateien neu gespeichert.

## P02: Aktuelle Einstiegstexte sind noch nicht konsistent

Diese begrenzten Dokumentationskorrekturen sind vor der Publikation erforderlich:

- `README.md` beschreibt den vollständigen Quellenabgleich in der Releasezusammenfassung noch als bevorstehend, dokumentiert unmittelbar danach aber bereits dessen Abnahme.
- Das Root-README beendet die Consumer- und Formatübersicht noch bei Format 3. `spfx/README.md` beschreibt Paket 0.3, den alten Datenpin und den Format-3-Mirror als aktuellen Build-/Installationsstand. Der vorbereitete Code verarbeitet Format 4 und das neue Paket trägt `0.4.0.0`.
- Die weiterhin als IT-Übergabe verlinkten Dokumente [technische Kurzdokumentation](../architektur/technische-kurzdokumentation.md) und [Installation in Dritt-Tenants](installation-und-betrieb-dritttenants.md) sind datierte MVP-0.3-Unterlagen. Die Installationsanleitung verlangt den alten Pakethash am künftig mit 0.4 belegten Repository-Pfad und bei Abweichung einen Abbruch. Sie beschreibt ausserdem den alten Mirror ohne `holiday-catalogs/`.

Empfohlen wird die gezielte Aktualisierung der lebenden Einstiegstexte und IT-Unterlagen auf MVP 0.4. Alternativ sind historische Anleitungen unübersehbar als solche zu kennzeichnen und mit der [aktuellen Deploymentanleitung](deployment-mvp-04.md) zu verbinden. Historische Fach-, Abnahme- und Prüfnachweise bleiben unverändert. In dieser lesenden Vorprüfung wurden diese Korrekturen noch nicht umgesetzt.

## Technische Prüfung des Dateiexports

Der Export enthält ausschliesslich die vorgesehenen Projektdateien und den unveränderten bereits versionierten Word-Plan, nicht die privaten Arbeitsordner. Root- und SPFx-Abhängigkeiten wurden aus den jeweiligen Lockdateien frisch mit `npm ci --offline --no-audit --no-fund` installiert. Dabei wurden 37 beziehungsweise 1329 Pakete aus dem lokalen npm-Cache installiert. Es wurden keine vorhandenen `node_modules` übernommen. Verwendet wurde Node.js `22.23.2`.

Python `3.12` wurde in einer neuen virtuellen Umgebung verwendet. Die vorhandenen Bibliotheken einschliesslich `jsonschema 4.25.1` wurden übernommen. Dies ist kein Nachweis einer frischen pip-Installation. Für die Artefaktprüfung wurden ausschliesslich lesend die unveränderlichen Git-Objekte des Datenpins und des alten Rollbackpakets verwendet. Der Rollback wurde aus dem bekannten früheren Git-Blob wiederhergestellt, nicht aus einem privaten Arbeitsordner kopiert.

Zwei lokale Klonversuche und ein Gesamtexport per `git archive` blieben ohne Abschluss und wurden beendet. Der anschliessende explizite Dateiexport mit Hashvergleich war erfolgreich. Deshalb wird ein sauberer **Dateiexport**, nicht ein vollständig neu geklonter Git-Bestand als geprüft ausgewiesen. Die ursprüngliche Erstellung der historischen Excel-Versionen aus damaligen lokalen Zwischenständen bleibt von der erfolgreich geprüften Einlesung der eingefrorenen Referenzdatei zu unterscheiden.

| Prüfung im Export | Ergebnis |
| --- | --- |
| TypeScript, Kern-/UI-Tests, öffentliche Buildtests, UI- und Webbuild | Bestanden, 675 Kern-/UI- und sieben öffentliche Tests |
| Kalender-, Arbeitsmappen-, Import- und Promotionsmodelle | 484 Tests bestanden |
| Archivvertrag | Zehn Tests bestanden, dokumentierte historische V0.9-/V0.10-Abweichung bleibt erhalten |
| Katalog- und Altconsumerverträge | 31 Tests bestanden |
| Datenrelease MVP 0.4 | Schema, Hashes und 19 Negativprüfungen bestanden |
| Arbeitsmappenimport | 68 JavaScript- und 27 Python-Tests bestanden |
| Quellenregister und Abnahme | Zwei Ereignisse, acht Negativprüfungen, 17 Python- und 37 JavaScript-Tests bestanden. Alle 13 gebundenen Abnahmedateien unverändert |
| Unabhängiges historisches Testorakel | 15 Referenzfälle, drei Sperrfälle und Negativprüfungen bestanden |
| SPFx-Neuinstallation und vollständiger Produktionsbuild | Bestanden, 48 Tests. Zwei bestehende Lintwarnungen zu `null`, keine Buildfehler |
| Artefaktprüfung nach synchronisiertem Abschluss | 27 Tests bestanden |

Die Gruppen überschneiden sich. Es wird deshalb keine kumulierte Testzahl ausgewiesen. Das Testorakel scheiterte zunächst bei nicht aktivierter virtueller Python-Umgebung an der fehlenden Bibliothek `jsonschema`. Mit der vorbereiteten Umgebung bestand es unverändert. Es wurde kein Fach- oder Testcode dafür korrigiert.

Der öffentliche Webbuild und der SharePoint-Mirror sind byteidentisch reproduziert:

- Web-ZIP: `1131d164d96cffe7ed43206f39b38a1790fa86292542b8d73fa7604f3845d69c`
- Mirror-ZIP: `3a194a29e25eb08a1c503306372671f7d9747951cdb5f31937556c3d41da0536`

Die Verpackungsprüfung des unveränderten vorbereiteten SPPKG bestätigt weiterhin `eaf4c24ae53c8c3166e38025cbe2337029c2dd88930e354030c97e622ffb6a2a`. Das ist vom unabhängigen SPFx-Neubau zu unterscheiden.

## P03: Erklärte Buildvarianz des SPFx-Neubaus

Der Neuaufbau im Export besteht, ist aber **nicht bitidentisch** zum vorbereiteten SPPKG. Sein Paket-SHA lautet `dd2e8a00ccb43f7f292ceba94c228e2ae73bd58db8d223a2e38500ddd99ef010`. Die abgeschlossene Deltaanalyse grenzt die Abweichung ein:

- Der vollständige Acorn-Syntaxbaumvergleich der beiden JavaScript-Bundles findet genau 342 Unterschiede. 336 betreffen ausschliesslich konsistente Umnummerierungen von 94 internen Webpack-Modul-IDs innerhalb einer Tabelle mit 101 Modulen und ihrer Aufrufe.
- Die weiteren sechs Unterschiede betreffen denselben geänderten Host-CSS-Suffix in Styles und Klassenreferenzen. Die eigentlichen CSS-Eigenschaften bleiben unverändert. Abgesehen davon sind die Syntaxbäume identisch.
- Die Bundle-Lizenzdatei ist byteidentisch. Paket-XML-Abweichungen enthalten ausschliesslich den geänderten Bundle-Dateinamen und drei generierte Part-/ClientSideAssets-Kennungen. Hinzu kommen ZIP-Zeitstempel.
- Die 29 direkt deklarierten installierten Abhängigkeiten besitzen dieselben Versionen. Alle 37 Synchronisationsvergleiche und der globale SCSS-Rahmen stimmen mit den führenden Exportquellen überein.

Es wurde keine darüber hinausgehende Fach- oder Produktlogikabweichung festgestellt. P03 ist damit eine dokumentierte Reproduzierbarkeitsgrenze, kein verbleibender ungeklärter Produktbefund. Eine exakte Bitreproduzierbarkeit des SPFx-Builds wird ausdrücklich nicht behauptet. Das erklärt nicht durch eine neue Zielumgebungsprüfung, sondern durch den strukturellen Vergleich die beobachtete Abweichung.

Das vorbereitete Originalpaket wurde nicht ersetzt. Ein abweichender Paketneubau darf nicht unter einer alten Prüfsumme zur Installation freigegeben werden.

## Integrität, Grenzen und nächster Schritt

635 aus dem Arbeitsverzeichnis übernommene Dateien wurden nach der Prüfung erneut gegen das Eingabeinventar gehasht. Keine wich ab. Die 636. Datei ist der bewusst aus dem Git-Ausgangsstand übernommene historische Word-Plan. Die Quellenabnahme, die dokumentierte AI-Behandlung, die abgenommenen Rechtsregeln und die operative Begrenzung auf CH/BE bleiben unverändert.

Die Prüfung ersetzt weder eine umfassende Sicherheitsanalyse noch eine erneute juristische Quellenprüfung. Musterprüfungen und Sichtkontrollen können ungewöhnlich codierte Geheimnisse oder steganografische Inhalte nicht ausschliessen. Office-Dateien wurden vollständig strukturell gelesen, aber weder neu berechnet noch gespeichert. Die Bildprüfung ist eine Inhalts- und Metadatenprüfung, keine neue Fachfreigabe der gezeigten historischen Tabellenstände.

In diesem Lauf gab es keinen Commit, Push, Deploy-Key, externen Schreibzugriff, Tenant- oder Hostingwechsel. SharePoint-, Teams-, Gast- und öffentliche P-Tests wurden nicht wiederholt. GitHub-Abruf und Bytevergleich des später veröffentlichten Datenpins bleiben ausstehend. Ein Git-Push würde die ignorierten Mirror- und Web-ZIP-Dateien nicht automatisch als Release-Anhänge veröffentlichen.

Nächster Schritt ist die begrenzte Bereinigung der festgestellten Publikationshindernisse mit dokumentierter Wahl zu P01. Danach sind das Dateiinventar und die betroffenen Prüfungen zu erneuern und der genaue Veröffentlichungsumfang gesondert freizugeben.
