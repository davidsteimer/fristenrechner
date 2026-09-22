# MVP 0.4: Abschluss des lokalen Publikationspakets

Stand: 22. September 2026. **Lokal vorbereitet und geprüft, nicht auf GitHub oder P veröffentlicht.** Dieser Abschluss ergänzt die historischen Nachweise, ohne sie umzuschreiben. Er ist keine neue Freigabe für den öffentlichen Betrieb oder den externen Q-Demobetrieb.

## Auftrag, Abnahme und Umfang

David Steimer hat den konkret geprüften Q-Stand fachlich abgenommen, SharePoint anschliessend positiv gegengeprüft und den Abschluss des Publikationspakets beauftragt. Die [Erklärungen und E-/Q-Nachweise](eq-wiederholungsversuch-mvp04-0401.md) binden dies an Anwendung `0.4.0`, SPFx `0.4.0.1` und Datenrelease `2026-09-22-mvp-04-approved.1`.

Das zusammengehörige Paket enthält AP17, AP18, die abgenommene Quellenprüfung, die begrenzte ES5-Korrektur, deren Regressionen sowie die aktuellen Betriebs- und IT-Unterlagen. Der Schweizer Feiertagskatalog umfasst 479 Regeln. Operativ bleiben zwölf CH-/BE-Regeln und die freigegebenen Berner Verfahrensprofile massgebend. Weitere Kantone und eine eigenständige Kalender-App werden dadurch nicht freigegeben.

Die [maschinenlesbare Paketbindung](../../outputs/publication-mvp04-final-2026-09-22/publication-package.json) nennt den unveränderlichen lokalen Implementierungscommit, den Datenpin, die geprüften Dateiinventare, Artefaktprüfsummen und Testgrenzen. Ein nachfolgender reiner Nachweiscommit enthält diese Bindung. Das Inventar schliesst sich selbst aus, damit keine zirkuläre Prüfsummenbehauptung entsteht.

## Verbindliche Artefakte

| Artefakt | Bytes | SHA-256 |
| --- | ---: | --- |
| `fristenrechner-schweiz-0.4.0.1.sppkg` | 202'616 | `9f31513cbc56f0ee2bb178e1db9336252d0266527643bebc2fb1348820711346` |
| `fristenrechner-mvp04-sharepoint-mirror.zip` | 92'845 | `3a194a29e25eb08a1c503306372671f7d9747951cdb5f31937556c3d41da0536` |
| `fristenrechner-mvp04-steimer-web-final.zip` | 456'975 | `e45c780ce9dfac1d71be865df59678273efd0fc6ca1122d145bc09f422b4db16` |

Die lokalen Bereitstellungsdateien liegen in `.work/publication-final-mvp04-2026-09-22/artifacts/`. Dieser ignorierte Arbeitsordner ist kein öffentlicher Download. Ein Git-Push veröffentlicht die dortigen ZIP-Dateien nicht als Release-Anhänge. Das SPPKG bleibt zusätzlich am versionierten Standardpfad `spfx/sharepoint/solution/fristenrechner-schweiz.sppkg` verfügbar.

- **SPFx:** Exakte Kopie des in E und Q geprüften Pakets. Keine erneute Kompilierung, keine neue Paketversion und keine zusätzlichen API-Berechtigungen.
- **Mirror:** Manifest und neun Nutzartefakte. Alle zehn Dateien sind byteidentisch zum freigegebenen Datencommit `739876a0d11b550ea8cc702622ab22af321994a5`. Manifest SHA-256: `a240b01feb671dbe4374c1e097bc9143d66fd4878cd235b3b490a9c08afec72e`. Das neue Archiv stimmt mit dem früher vorbereiteten Mirrorarchiv vollständig überein.
- **Web:** Separater Neubau der statischen P-Ausprägung aus demselben aktuellen Produktquellstand einschliesslich ES5-Korrektur. Anwendungsassets, lokale Daten, Lizenzen und Hostingkonfiguration sind vollständig inventarisiert. Dies ist noch keine Vorprüfung im tatsächlichen Hosting und keine bestandene öffentliche Matrix D01–D12.

Das frühere Webarchiv mit SHA-256 `1131d164d96cffe7ed43206f39b38a1790fa86292542b8d73fa7604f3845d69c` und das fehlgeschlagene Paket `0.4.0.0` bleiben historische Nachweise. Für eine spätere Bereitstellung gelten ausschliesslich die oben gebundenen aktuellen Artefakte.

## Publikationsumfang und Schutz des Bestands

Die [P01-/P02-Bereinigung](publikationsbereinigung-mvp04.md) bleibt Grundlage. Die getrennten öffentlichen Excel-Ableitungen werden verwendet. Vier private V0.9-/V0.10-Originale, `Userinput/`, Arbeitskopien, lokale Zugangsdaten, interne Tenant-/Kontonachweise und der gesamte `.work/`-Bestand gehören nicht in den Git-Push. Die lokale Benutzeränderung des historischen Word-Projektplans bleibt unverändert und uncommitted. Der öffentliche Dateiexport verwendet dort ausschliesslich den bereits versionierten Ausgangsstand.

Die erneute begrenzte Inhaltsprüfung findet keine konkreten Zugangsdaten, privaten Kontoadressen oder persönlichen lokalen Speicherpfade im vorgesehenen neuen öffentlichen Umfang. Alle 14 XLSX-Dateien und 47 PNG-Nachweise sind byteidentisch zur bereits geprüften Publikationsfassung. Dies ist keine neue visuelle Prüfung, juristische Quellenprüfung oder umfassende Sicherheitsanalyse. Automatische Musterprüfungen schliessen beliebig codierte Geheimnisse oder steganografische Inhalte nicht aus.

Historische Nachweise und ihre dokumentierten privaten beziehungsweise lokalen Verweisausnahmen bleiben erhalten. Die lebenden Einstiege verweisen auf die aktuellen öffentlichen Ableitungen und den tatsächlichen E-/Q-Stand.

## Erneute technische Prüfung

Die öffentliche Eingabeauswahl wurde ohne private Originale in einen separaten Dateiexport übernommen. Root-Node-Abhängigkeiten wurden mit Node.js `22.23.2` frisch und offline aus der Lockdatei installiert, ohne Installationsskripte. Python `3.12.14` verwendet die vorhandene lokale virtuelle Umgebung. Dies ist kein sauberer Git-Clone-Test und keine frische Python-Abhängigkeitsinstallation.

| Prüfung | Ergebnis |
| --- | --- |
| TypeScript, Kern-/UI-Tests, öffentliche Tests, UI- und Webbuild | 676 Kern-/UI-Tests und sieben öffentliche Tests bestanden |
| Öffentliche Archiv- und Publikationsverträge | 35 Archivtests und 42 Publikationstests bestanden |
| Kalender-, Arbeitsmappen- und Promotionsmodelle | 484 Tests bestanden |
| Katalog- und Altconsumerverträge | 31 Tests bestanden |
| Freigegebener Datenrelease | Schema, Prüfsummen und 19 Negativprüfungen bestanden |
| Quellenregister, Governance und Abnahmebindung | 17 Python- und 37 JavaScript-Tests sowie acht Abnahme-Negativprüfungen bestanden |
| Arbeitsmappenimport | 68 JavaScript- und 27 Python-Tests bestanden |
| Historisches unabhängiges Testorakel | 15 Referenzfälle, drei Sperrfälle und Negativprüfungen bestanden |
| Historische Artefakte und Korrekturkandidat | 27 beziehungsweise 20 Tests bestanden, anschliessender Korrekturartefakt-Readback bestanden |
| SPFx-Quellintegration | 48 Tests bestanden |
| Emittierter ES5-Code und tatsächliches SPPKG-Bundle | 25 Tests bestanden |

Die Gruppen überschneiden sich. Eine addierte Gesamttestzahl wäre irreführend. Die SPFx-Prüfungen verwenden die bestehenden SPFx-Abhängigkeiten, den vorhandenen ES5-Build und das exakt gebundene SPPKG, keinen neuen sauberen Produktionsbuild.

Die historischen Artefakttests und der Korrekturartefakttest sind **releaseinterne Prüfungen**. Sie benötigen zusätzlich die separat vorbereiteten, prüfsummengebundenen lokalen Archivkopien und historische Git-Objekte. Ihr Erfolg wird nicht als Ausführbarkeit aus einem öffentlichen Quellarchiv allein dargestellt. Beim ersten Exportlauf fehlte die ignorierte Korrekturpaketkopie. Nach Herstellung dieser byteidentischen Testkopie bestanden alle 20 Korrekturtests. Es erfolgte keine Produktkorrektur aufgrund dieses Prüfaufbaufehlers.

Die Quellprüfungen und Webgenerierung können mit den im `package.json` angegebenen Befehlen nachvollzogen werden. Für die SPFx-Bundleprüfung ist `npm run test:built` im Ordner `spfx/` vorgesehen. Der maschinenlesbare Nachweis enthält die tatsächlich ausgeführten Befehle und Hashes der privat verbleibenden Prüflogs, nicht die Behauptung öffentlich abrufbarer Logdateien.

## Verbleibende Grenzen und nächster Freigabeschritt

| Punkt | Einordnung |
| --- | --- |
| E/Q | Installiert und funktional geprüft. Fachliche Q-Abnahme erteilt. Positiver SharePoint-Benutzergegencheck, keine nachträglich behauptete automatische 768-Pixel-Messung |
| Tatsächlicher Gasttest | Anmeldung weiterhin blockiert. KTBE-Ursache vermutet, nicht unabhängig nachgewiesen. Kein belegter Appfehler. Externe Q-Demofreigabe weiterhin offen |
| Outlook T15/T16 | ICS-Dateiprüfungen bestanden, tatsächliche Outlook-Importtests nicht ausgeführt und nicht ausdrücklich erlassen. Durchführung oder begründeten Verzicht separat entscheiden |
| Bedingter Live-Negativtest / T19 | Nicht erneut ausgeführte Zielumgebungsnachweise bleiben ausgewiesen. Lokale Negativregressionen ersetzen sie nicht. T19 ist ein optionaler Governance-Nachweis ausserhalb der Runtime |
| GitHub | Kein Push, kein neuer Deploy-Key, keine Release-Anhänge oder Issueänderungen. Konkreten Umfang und gegebenenfalls temporären Schreibzugriff separat freigeben |
| Öffentliche P-Ausprägung | Unverändert MVP 0.3. Vor MVP 0.4 eigene Hostingfreigabe, aktuelle Sicherung, temporäre Vorprüfung, kontrollierte Umschaltung und D01–D12 erforderlich |

Diese Grenzen verhindern den beauftragten lokalen Paketabschluss nicht. Sie werden weder durch Q-Abnahme noch durch das Erstellen eines Commits als erledigt ausgegeben. Die Reihenfolge bleibt **E → Q → manuelle Abnahme → GitHub → P** gemäss [Deploymentplan](deployment-mvp-04.md). Vor GitHub-Nutzung des neuen Datenpins sind öffentlicher Zugriff und Byteidentität nach dem später freigegebenen Push zu prüfen.

David Steimer trifft die fachlichen und betrieblichen Freigaben. Codex unterstützt Vorbereitung, Prüfung und Dokumentation als KI-Arbeitsinstrument ohne formelle Freigabe- oder Haftungsverantwortung.
