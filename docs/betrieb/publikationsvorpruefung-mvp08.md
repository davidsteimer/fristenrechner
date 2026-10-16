# MVP 0.8 Lokale Publikationsvorprüfung

Stand: 16. Oktober 2026. **Die lokale Vorprüfung R08-D ist durchgeführt. Der abgenommene E-/Q-Stand und die definitiven Auslieferungsartefakte sind unverändert gebunden. Die frischen Typ-, Produkt-, Governance- und Integritätsprüfungen sind bestanden. Vor einer Publikationsfreigabe müssen noch die öffentlichen Begleitnachweise und die konkrete Dateiauswahl bereinigt sowie die lebenden IT-Unterlagen aktualisiert werden. Ein Neubau der abgenommenen Auslieferungsartefakte ist nach dem Prüfergebnis nicht nötig. R08-D insgesamt bleibt bis zum gesondert freigegebenen Publikationsvollzug offen.**

Die [Q-Abnahme](abnahme-q-mvp08.md) schliesst R08-C einschliesslich C08. Geräteprüfung und Gastzugriff sind von David bestätigt, die begrenzte Outlook-Wiederverwendung ist ausdrücklich angenommen. Die Feldhöhenkorrektur #50 gehört gemäss seinem Entscheid in den nächsten Release. Die vorliegende Prüfung verändert weder Rechenlogik noch Rechtsdaten und erteilt keine Commit-, GitHub- oder P-Freigabe.

## Geprüfter Stand

| Gegenstand | Bindung |
| --- | --- |
| Anwendung / SPFx-Paket | `0.8.0` / `0.8.0.0` |
| Datenrelease | `2026-10-15-mvp-08-approved.1`, 42 Laufzeitdateien mit insgesamt 2’425’056 Bytes |
| Manifest SHA-256 | `2461f06c0a7d79dcd6a177fc116f08fcc0efa62e03b38ba6ac87964457c19aa4` |
| Lokaler Datencommit und unveränderter HEAD | `10a99419eaabb3e96d2acccf0c7a93e2fe6472cb` |
| Freigegebene Fachbasis | AP23, DEC-2026-032 und [Quellenabnahme R08-A2](../fachrecht/abnahme-quellen-mvp08.md) |
| E/Q | [Technischer Vollzug C07](eq-vollzugsnachweis-mvp08.md) und anschliessende menschliche Q-Abnahme C08 |
| P | Letzter dokumentierter Stand [MVP 0.7 vom 9. Oktober](produktionsbereitstellung-mvp07-2026-10-09.md). Kein neuer Liveabruf im lokalen R08-D-Schritt |

Die tatsächlichen Artefakte im Ordner `outputs/release-mvp08-2026-10-15/` sind erneut nach Länge und SHA-256 geprüft:

| Datei | Bytes | SHA-256 |
| --- | ---: | --- |
| `fristenrechner-schweiz-0.8.0.0.sppkg` | 311’611 | `d3d06adcd78176db66f8227d884fd66ca2fbcee0bffab66755789dd0cc29dc1a` |
| `fristenrechner-mvp08-sharepoint-mirror.zip` | 225’952 | `81359611b5399b1b79c0f9dedb0d5ac540c9192a1382feb67095dadb8e89f8dd` |
| `fristenrechner-mvp08-steimer-web.zip` | 635’927 | `0abbc23d691835e5b04b64975140afb36c4bfa89482ff872c0c76188673f4176` |
| `fristenrechner-schweiz-recovery-0.8.0.1.sppkg` | 291’892 | `8e387297d43df28e2fe4d3c7c9ae239bb2cdc6a9e3216e4c59c928c50d950e7b` |

Alle 210 aktuellen Produktinputs stimmen mit ihren 210 archivierten Buildkopien überein. Auch 599 gebundene Build-/Testfixtures, 42 Runtime-Dateien und alle zwölf tatsächlichen Webdateien sind unverändert. Die ZIP-Inhalte wurden zusätzlich einzeln gegen die gebundenen Sollbytes geprüft, nicht nur ihre äusseren Prüfsummen. Das SPFx-Paket enthält 18 Nutzdateien, das Mirrorarchiv 42 und das Webarchiv zwölf.

Der Recovery-Archivnachweis mit 729 Dateien, seine 231 geschützten MVP07-Ursprungsdateien sowie die gesonderten Roundtrip-Bindungen mit 101 Eingängen und 102 Archivdateien sind intakt. Dies ist eine frische lokale Byteprüfung vorhandener Nachweise, kein neu ausgeführter Recovery-Roundtrip oder Hosttest. Das Recovery-Paket wurde nicht installiert.

## Prüfungen und Nachweisgrenzen

| Prüfung | Ergebnis |
| --- | --- |
| TypeScript in isolierter Kopie | Typprüfung ohne Fehler |
| Produkt und UI in isolierter Kopie | 2’541 bestanden, keine Fehler, Abbrüche, übersprungenen Tests oder offenen Testmarkierungen |
| Öffentliche Node-Governance in isolierter Kopie | 225 bestanden, keine Fehler, Abbrüche, übersprungenen Tests oder offenen Testmarkierungen |
| Python-Governance und Schema-Selbsttest | 34 Tests und acht Schema-Negativfälle bestanden |
| Öffentlicher MVP08-Integritätsprüfer | Bestanden. 42 Runtime- und sieben Schemadateien. Keine privaten Quellenoriginale, keine Gitabfrage und keine neue Rechtsprüfung |
| Tatsächliche Auslieferungsarchive und Buildinputs | Bestanden, wie oben gebunden. Kein definitiver Neubau |
| Recovery-Prüfmodus `--verify` | Bestanden. Originaler historischer Bericht bleibt unverändert, einschliesslich seiner damaligen Zwischenstatuswerte |
| C01-Prüfmodus `--verify-only` | 26 von 26 lokalen Prüfgruppen bestanden. Kein erneuter Remote-Bestandsabruf |
| Neue und gesicherte Mirrorbytes | Acht lokale Gruppen mit 332 von 332 ursprünglichen Rohdownloads bestanden. Neuer Datenstand und Format-7-Rückfallquellen getrennt |
| Enger Textmustercheck der vier Auslieferungsarchive | 86 unkomprimierte UTF-8-Textbestandteile ohne Treffer für die geprüften persönlichen Pfad-, Tenant-, Mailbox- und engen Secretmuster. Vier PNG-Einträge nicht inhaltlich geprüft |
| Geschützte Entscheidungsgrundlagen | R08-C-Installationsvorlage, Rückfallvorlage, Prüfmatrix, Vorschlagsbindung und Ausführungsfreigabe unverändert |

Der Archiv-Mustercheck ist keine vollständige Secret-, Bild- oder Binärprüfung. Ein unverändertes Web-ZIP und dessen `.htaccess` belegen weder eine Behebung noch den unveränderten Fortbestand des früheren Livehostingbefunds. Vor P bleiben der frische HEAD-/GET-/Cachevergleich und der dazu passende Entscheid erforderlich.

Der separate öffentliche Integritätsprüfer und die ausdrückliche Trennung der privaten MVP08-Quellenprüfungen sind bereits umgesetzt. Die frühere MVP07-Trennungslücke wird nicht als neuer MVP08-Fehler übernommen. Der Nachweis eines abschliessend bereinigten, konkret ausgewählten Publikationsbestands bleibt von der Prüfung des vollständigen lokalen Arbeitsbestands getrennt.

Der frische Standardlauf erfolgte am 16. Oktober von 13:19:20 bis 13:24:01 UTC in einer neuen isolierten Kopie aus exakt 2’530 bezeichneten Eingängen des früheren begrenzten R08-B-Testinventars, jeweils mit den heutigen Bytes. Darin enthalten sind 1’210 technische Outputfixtures, aber keine privaten Quellenoriginale, aktuellen R08-B-Vollarchive oder Gitmetadaten. Die Auswahl entspricht den aktuellen 78 Produkt- und 20 Governance-Testdateien. Sämtliche heutigen TypeScript-Quellen und Tests sind abgedeckt. Ein historisch bereits öffentliches ELG-XML bleibt eine ausgewählte Testfixture.

Node `22.23.2` und vorhandene Abhängigkeiten wurden wiederverwendet. Dies war kein frischer GitHub-Clone und kein `npm ci`. Intern erforderliche Vorschau-Builds liefen ausschliesslich in der Kopie. Kein definitives Web-ZIP, SPFx-Paket oder Recovery wurde neu gebaut. Alle 2’530 kopierten Eingänge und die technischen Originaleingänge wurden anschliessend unverändert bestätigt. Die Prüfgruppen überschneiden sich und werden nicht zu einer Gesamttestzahl addiert. Die noch zu bildende endgültige Publikationspositivliste ist damit nicht vorweggenommen.

Die abschliessende Linkkontrolle bestätigt alle 613 lokalen Dateiziele in zehn Einstiegstexten. Zusätzlich sind 247 lokale Ziele der hier aktualisierten Abnahme-, Vollzugs- und Berichtsdokumente vorhanden. Das ist eine Existenzprüfung, keine Kontrolle externer URLs, von Abschnittsankern oder der Zugehörigkeit zum späteren öffentlichen Dateisatz.

## Lokale Publikationshaltepunkte

| ID | Befund | Erforderlicher nächster Schritt |
| --- | --- | --- |
| P08-01 Öffentliche Nachweise | Persönliche Absolutpfade in ausgewählten AP23-/MVP08-Berichten, ihren Archivkopien und einzelnen gebundenen Logs. Vollständige Archivprüfer verlangen teilweise gerade diese Originale | Originale unverändert privat erhalten. Benötigte öffentliche Kopien gesondert bereinigen und mit Herkunftshashes binden. Öffentliche Integritätsprüfung ausdrücklich vom vollständigen privaten Archiv-/Quellenaudit trennen, ohne fehlende Belege als geprüft auszugeben |
| P08-02 Dateiumfang und Portabilität | Noch keine exakte Publikationspositivliste. Zusätzlich liegen private Sicherungen, eine vorbestehende Wordänderung, nicht benötigte ältere Paketkopien und tenantgebundene Betriebswerkzeuge im Arbeitsbestand | Konkrete Datei-/Hashliste für Quellstand, Datencommit, notwendige Referenzdaten, öffentliche Nachweise und definitive Artefakte bilden. Private und rein betriebliche Inhalte ausschliessen oder ihre begrenzte Rolle ausdrücklich festlegen. Den abschliessenden bereinigten Export unabhängig prüfen |
| P08-03 Lebende Unterlagen | README, SPFx-Anleitung, technische Kurzdokumentation und Dritt-Tenant-Anleitung nennen teilweise noch MVP07-Vorpublikationsstände oder MVP06 als öffentlichen Stand | Gezielte Aktualisierung auf MVP08 E/Q, Paket `0.8.0.0`, Format 8, 42 Mirrordateien, Defaults 5, TI-/GR-Umfang und Recovery `0.8.0.1`. P und GitHub nicht vorzeitig als umgestellt ausweisen. Historische Freigaben und Berichte erhalten |

### Öffentliche Nachweise und private Originale

In der abgegrenzten Erstsichtung enthalten 14 Textdateien insgesamt 116 persönliche Absolutpfadtreffer. Dazu gehören beispielsweise:

- `outputs/ap23d2-2026-10-15/product-regression-initial-harness-failure.txt`
- `outputs/ap23d3-2026-10-15/spfx-build.json`
- `outputs/release-mvp08-2026-10-15/portability-standard-no-private-20261015-01/execution.json`
- `outputs/release-mvp08-2026-10-15/recovery-0.8.0.1/artifact-verification.json`
- ihre bezeichneten Abnahme- und Roundtrip-Kopien.

Im MVP08-Ausgabebereich sind 67 Logdateien durch die bestehenden Gitregeln ignoriert. Von 21 gezielt gelesenen Build-/Recovery-Logs enthalten sieben persönliche Pfade. Ein pauschales Nachstagen der bisher ignorierten Logs wäre daher ebenso ungeeignet wie ihre stille Entfernung aus einem weiterhin als vollständig ausgegebenen Archivnachweis.

`scripts/verify-r08c-baseline.mjs` enthält einen konkreten Tenant als aktive Prüfbasis. `scripts/build-mvp08-recovery.mjs` benötigt für seinen vollständigen historischen Bau-/Archivweg private lokale Voraussetzungen. Das sind Betriebs- und Publikationsabgrenzungen, keine festgestellten Rechenfehler. Die Tenantzeichenfolge als negative Datenschutzassertion in `scripts/prepare-r08c-proposal.mjs` ist davon zu unterscheiden. Historische gebundene Skriptkopien werden nicht nachträglich portabilisiert.

### Positivliste statt pauschaler Ordnerübernahme

Ausgeschlossen bleiben `.work`, `Userinput`, private HARs und Konfigurationen, Websitebackups, persönliche Arbeitskopien und die vorbestehende Änderung am Word-Projektplan V1.0. Der aktuelle Wordstand wurde zur Erhaltung gehasht, nicht inhaltlich bewertet oder zur Veröffentlichung ausgewählt. Es wurden keine Sicherungen gelöscht oder als Produktbestand rekonstruiert.

Die Erstsichtung umfasst 49 Backup-/Wordpfade zum Ausschluss sowie 74 noch nicht pauschal freigegebene Binär- oder sonstige Kandidaten. Die gesonderte Prüfung der vier definitiven Auslieferungsarchive ersetzt nicht die Inhalts- und Metadatenprüfung weiterer ausgewählter Office-, Bild- oder Archivdateien. Umgekehrt dürfen notwendige öffentliche Referenzkataloge und Testfixtures nicht allein wegen ihres Ablageorts unter `outputs/` fehlen.

Der vorhandene lokale Datencommit enthält die bestehende Autor-/Committerkennung mit einer lokalen Geräte-E-Mail. Eine spätere Veröffentlichung des Commits macht auch diese Gitmetadaten sichtbar. Die Kennung wurde nicht geändert. Die konkrete Publikationsfreigabe muss diese Sichtbarkeit einschliessen. Öffentliche Erreichbarkeit des neuen Datenpins wurde in dieser lokalen Prüfung nicht behauptet.

### Aktualität der Unterlagen

Die heutige Q-Abnahme ist in einer neuen Notiz dokumentiert. Aktuelle Statusabsätze im Deploymentplan und Vollzugsnachweis sowie der aktuelle Einstieg im Dokumentationsindex sind bereits nachgeführt. Historische technische Einzelberichte, der ursprüngliche Outlook-Vorschlag und die hashgebundenen R08-B-/R08-C-Vorlagen bleiben unverändert.

Noch zu bereinigen sind insbesondere `README.md`, `spfx/README.md`, `docs/architektur/technische-kurzdokumentation.md` und `docs/betrieb/installation-und-betrieb-dritttenants.md`. Die aktuellen Absätze der Architektur- und Fachrechtsindizes stehen ebenfalls noch vor R08-B. `tests/README.md` enthält eine inzwischen überholte offene Outlook-Importprüfung. Bei `data/README.md` ist der Cachefallback ausdrücklich auf dieselbe konkrete Datenkonfiguration zu begrenzen. Dabei müssen die zwölf neuen TI-/GR-Pfade und ihre Zeit-/Fallgrenzen von den unveränderten Bundes- und ausschliesslich bernischen Sozialfreigaben getrennt bleiben. Neue Releasehinweise sollen auf die menschliche Q-Abnahme und den begrenzten Outlook-Entscheid verweisen, ohne einen neuen Outlookimport zu behaupten.

## Weiteres Vorgehen

Empfohlen ist ein begrenzter lokaler Bereinigungsschritt P08-01 bis P08-03. Er erstellt die nötigen öffentlichen Nachweiskopien, aktualisiert die lebenden Unterlagen und liefert anschliessend einen getesteten, hashgebundenen Publikationsumfang. Produktinputs, Rechtsdaten, abgenommenes Paket, Mirrors, Web-ZIP und Recovery bleiben dabei unverändert. Ein davon abweichender Befund wäre gesondert vorzulegen.

Erst das fertige konkrete Publikationspaket wird zur Freigabe für die lokale Commitbildung und den späteren GitHub-Push vorgelegt. Ein temporärer Schreibzugang wäre separat zu bestätigen. Für P folgen danach frische Sicherung und Bestandsprüfung, HEAD-/GET-/Cachevergleich, gegebenenfalls ein neuer begrenzter Risikoentscheid, Vorprüfung und öffentliche Prüfmatrix. Root-Webauftritt, Sitemap und Hostingkonfiguration bleiben ohne zusätzlichen Auftrag unverändert.

## Belegbindung

Die ausführlichen Inventare und privaten Prüfberichte verbleiben in der lokalen Arbeitsablage. Ihre Prüfsummen binden den Nachweis, ohne ihre Inhalte zur Publikation freizugeben:

| Privater Nachweis | SHA-256 |
| --- | --- |
| Geschützter Bestand mit 2’569 Dateien | `8067f941112307cc065c3f5905ed5249256984889f6b03ed9fe01b48b45ef793` |
| Artefakt- und Archivprüfung | `aa5fb45ce94ec29d3527eed93a6e2928e129d27830fc3b77e917b3b36d7aa286` |
| Inventar und Publikationsbefunde | `996d9c36a36d03e1346cd42476b2a802a6668a43e5b88e35058ee19b72844932` |
| Enger Textmustercheck der vier Auslieferungsarchive | `dd5774c69b1353d04480d18ec70a6b862b1c7968b6a37c288c4f12409ac1bb0d` |
| Frischer isolierter Standardlauf | `e695690d68a2bf48da31d4498b045cfeb8f9d435e380ecdf853cf7d815cb9a5e` |
| Lebende Unterlagen und Testportabilität | `1e7c9201f327b948e638d8dd0317883da2b84e9024eda51fb97233b5ead7245a` |

Keine Gitindexänderung, kein zusätzlicher Commit, Push, Deploy-Key, M365-Eingriff, Outlookzugriff oder Zugriff auf das Livehosting. David Steimer entscheidet und nimmt in Personalunion ab. Codex dokumentiert und prüft als KI-Arbeitsinstrument ohne formelle Freigabe- oder Haftungsverantwortung.
