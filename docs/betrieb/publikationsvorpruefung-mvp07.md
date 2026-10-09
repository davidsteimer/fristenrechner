# MVP 0.7 Lokale Publikationsvorprüfung

Stand: 9. Oktober 2026. **Die Vorprüfung ist durchgeführt. Der abgenommene E-/Q-Stand ist nachvollziehbar gebunden, der Arbeitsbestand ist aber noch kein publikationsreifes Paket.** Vor der Veröffentlichung sind vier lokale Punkte zu bereinigen: öffentliche und private Prüfungen trennen, den passenden Webstand bauen, den Dateiumfang bereinigen und die lebenden IT-Unterlagen aktualisieren. Der Outlook-Wiederverwendungsvorschlag liegt separat zur Entscheidung vor. R07-D insgesamt bleibt offen.

Die [Q-Abnahme](abnahme-q-mvp07.md), die Fach- und Quellenentscheide sowie die ausgewiesenen F08-/T09-Nachweisgrenzen bleiben bestehen. Diese Vorprüfung verändert keine Rechenregel und erteilt keine Publikations- oder Betriebsfreigabe.

## Geprüfter Stand

| Gegenstand | Bindung |
| --- | --- |
| Anwendung / abgenommenes SPFx-Paket | `0.7.0` / `0.7.0.2`, 291’895 Bytes |
| Paket SHA-256 | `8bae0c1ea64b4482abea8fcdbd7aa5c576f6d552735b5a3e5f01a9ea68ab71db` |
| Datenrelease | `2026-10-08-mvp-07-approved.1`, 41 Laufzeitdateien |
| Manifest SHA-256 | `fe1dfa0a241ac1c0e083998f05fb43e058f3c1be223f35cd276d3df436941597` |
| Lokaler Datencommit | `331ef3e19d43a6b51d91a502acd6b5443071599f` |
| Korrekturbaunachweis | [Artefaktbericht 0.7.0.2](../../outputs/release-mvp07-spfx-0.7.0.2-2026-10-09/artifact-verification.json), SHA-256 `c42c0c75d2352004e640dd0de3d18a37e4147290d4cd2c12f1e9a705d0376702` |

Alle 181 im Korrekturbaunachweis gebundenen aktuellen Produkteingaben stimmen mit ihrem Archiv überein. Alle 230 dort direkt gebundenen Archivdateien sind nach Länge und Prüfsumme intakt. Der lokale Datenbaum, das ursprüngliche Mirrorarchiv und das eingebettete Web-Datenmodul enthalten dieselben 41 Releasebytes. Die Bindung an den lokalen Datencommit ist geprüft, dessen öffentliche Erreichbarkeit nicht.

## Erneut ausgeführte Prüfungen

| Prüfung | Tatsächliches Ergebnis |
| --- | --- |
| TypeScript | Typprüfung ohne Fehler |
| Produkt und UI im Arbeitsbaum | 2’270 bestanden, keine übersprungenen oder abgebrochenen Tests |
| Node-Governance im vollständigen lokalen Arbeitsbaum | 275 bestanden, keine übersprungenen oder abgebrochenen Tests |
| Python-Governance | 30 bestanden |
| Strenger Format-7-Datenvalidator | Bestanden, Freigabe-, Format-, Daten- und Herkunftsbindungen geprüft |
| Ursprüngliche R07-B-Artefakte | Lesender Archivcheck bestanden: drei Artefakte, 41 Mirrordateien, zwölf Webdateien, 191 Archivbelege. Das ist kein Nachweis der späteren Webkorrektur |
| Zwei gezielt isolierte Public-Build-Suiten | Vier Tests, zwei bestanden und zwei fehlgeschlagen. Beide Fehler betreffen veraltete Versionsassertionen, siehe P07-01 |
| Outlook-Teilprüfung | 27 lokale Tests und erneuter Vergleich aller acht E-/Q-Kalenderdateien bestanden. [Begründung und Grenzen](outlook-wiederverwendung-mvp07.md) |

Die Prüfgruppen überschneiden sich und werden nicht zu einer Gesamttestzahl addiert. Die erfolgreichen Governanceprüfungen hatten Zugriff auf die privaten lokalen Belege. Sie beweisen deshalb keine öffentliche Reproduzierbarkeit. Ein vollständiger bereinigter Export ohne private Eingaben ist noch zu prüfen. Es gab keinen frischen GitHub-Clone, keine Neuinstallation der Abhängigkeiten und keine erneute Quellenrecherche.

## Lokale Publikationshaltepunkte

| ID | Befund | Erforderliche Bereinigung |
| --- | --- | --- |
| P07-01 Öffentliche Prüfungen | Der Standardtestfilter in `scripts/run-standard-tests.mjs` trennt nur fünf MVP06-Privatsuiten. Neue MVP07-Quellen-/Vorbereitungsprüfungen benötigen weiterhin private Originalbelege. Zusätzlich erwarten `tests/public-app/ap21-build.test.ts:49` und `tests/public-app/ap22c3-build.test.ts:33` noch Paket `0.7.0.0` statt des abgenommenen `0.7.0.2` | Öffentlichen Integritätsnachweis und ausdrücklich benannten privaten MVP07-Vollaudit trennen. Den strengen Übernahmeweg erhalten. Die beiden konkreten Versionsassertionen nachführen, übrige Kandidaten-/Pinprüfungen beibehalten. Danach alle öffentlichen Standardprüfungen in einem bereinigten Export ausführen |
| P07-02 Webartefakt | Das vorhandene [Webarchiv aus R07-B](../../outputs/release-mvp07-2026-10-08/artifacts/fristenrechner-mvp07-steimer-web.zip) ist unverändert, enthält aber nicht die vollständige Darstellungskorrektur des abgenommenen Pakets `0.7.0.2` | Separaten Web-only-Build aus den gebundenen Korrektureingaben und dem unveränderten öffentlichen Wrapper erstellen. Wiederholungsbau, deterministisches ZIP, Daten-/Lizenz-/Assetprüfung und lokale visuelle Kontrolle am tatsächlichen neuen Webbaum. Alte Archive erhalten, kein SPFx-Neubau erforderlich |
| P07-03 Dateiumfang und Datenschutz | Im erfassten Arbeitsbestand liegen Website-Backups, eine fremde Wordänderung, private Abnahmearchive und persönliche lokale Pfade. Ein pauschales Übernehmen von `outputs/` oder allein die `.gitignore` wäre ungeeignet | Exakte Positivliste mit Bytezahlen und Hashes erstellen. Private Originale erhalten und ausschliessen. Falls nötig neue bereinigte Publikationskopien mit eigener Herkunftsbindung anlegen. Lebende Skriptpfade portabel machen. Vorgesehene Binärdateien und erforderliche ignorierte Logs einzeln prüfen |
| P07-04 Lebende Unterlagen | Technische Kurzdokumentation und Dritt-Tenant-Anleitung stehen noch auf dem internen MVP06-/öffentlichen MVP05-Stand. Die Releasehinweise nennen noch SPFx `0.7.0.0` und ausstehende E-/Q-Bereitstellung | Aktuelle Einstiege auf MVP07 E/Q, Paket `0.7.0.2`, Format 7, 41 Mirrordateien, konfigurationsgebundenen Cache und den konkreten Rückfallweg abstimmen. P bleibt bis zur späteren Bereitstellung MVP06. Historische Freigaben und Baunachweise nicht umschreiben |

### Öffentliche Prüfungen und unveränderte Fachfreigabe

Die MVP07-Quellenabnahme bindet 583 Dateien. Davon liegen 541 unter privaten `.work`-Pfaden, 42 ausserhalb dieses Präfixes. Auch die 42 übrigen Pfade sind damit noch nicht pauschal zur Publikation freigegeben. Die Vorbereitungsprüfung verlangt zusätzlich vollständige Abnahmearchive, darunter einen ausdrücklich privaten TAR-Snapshot.

Die Trennung muss deshalb explizit sein. Fehlende private Dateien dürfen weder automatisch übersprungen noch als erfolgreich geprüfte Originalquellen ausgegeben werden. Der öffentliche Integritätsnachweis soll die freigegebenen Datenbytes, Entscheide und ausgewählten öffentlichen Belege prüfen. Der private Vollaudit behält seine vollständigen Anforderungen. Das bestehende [MVP06-Verfahren](publikationspaket-mvp06.md#p06-01--öffentliche-prüfung-und-privater-vollaudit) dient als Muster, nicht als unverändert verwendbarer MVP07-Prüfer.

Die beiden veralteten Versionsassertionen sind in einer isolierten Kopie tatsächlich reproduziert. Die zugehörigen Kandidatenbuilds bestehen und enthalten die korrigierten gemeinsamen Dropdownstile. Beide bleiben ausdrücklich nicht auslieferbare Referenzkandidaten. Dieser Befund ist kein neu nachgewiesener Rechenfehler und kein bestandener normaler MVP07-Webbuild. Alle 109 kopierten Eingänge und 38 bestehenden Vorschau-/Artefaktdateien waren nach der Diagnose unverändert.

### Webstand und Rückfall

Das alte Webarchiv umfasst 606’797 Bytes, SHA-256 `c7c20676154506694267e517791fe2fca73b7e403523e4968eea5ddb3fa0afcf`. Es bleibt historischer Nachweis und darf nicht als zur Q-Abnahme passender korrigierter P-Kandidat verwendet werden. Der vorhandene R07-B-Sealer ist auf die ursprüngliche Paketversion und deren Ausgabeordner festgelegt. Der Folgeaufbau benötigt deshalb einen neuen Ausgabeordner und einen passenden Web-only-Prüfer nach dem Muster der MVP06-Webkorrektur.

Die isolierten Diagnoseläufe haben weder einen neuen definitiven Webrelease noch ein Auslieferungs-ZIP erstellt. Das SPFx-Paket `0.7.0.2`, die Mirrors und Recovery `0.7.0.3` bleiben unverändert. Ein korrektes lokales `.htaccess`-Archiv belegt keine Behebung des früheren Livehostingbefunds.

### Publikationsschutz und verbleibende Prüfung

Das erste Arbeitsinventar erfasst 2’696 geänderte oder unversionierte Pfade. Die bereits im lokalen Datencommit enthaltenen 41 Release-Dateien kommen bei der späteren vollständigen Publikationsbindung hinzu. Das Inventar ist eine Sichtung, keine genehmigte Positivliste.

- 48 Websitebackup-Dateien und die vorbestehende Änderung am historischen Word-Projektplan V1.0 bleiben ausgeschlossen und unverändert erhalten.
- `.work`, private verschachtelte Arbeitsordner, `Userinput`, Arbeitskopien und der private AP21-Quellensnapshot werden nicht mitpubliziert.
- Der enge Textmustercheck fand 580 persönliche absolute Pfadtreffer in 32 Dateien. Hauptsächlich sind QA-/Buildnachweise und deren Archivkopien betroffen. Zwei lebende Matrixskripte enthalten zudem einen fest eingebauten lokalen Pythonpfad. Das sind Datenschutz- und Portabilitätsbefunde, nicht der Nachweis eines veröffentlichten Zugangsschlüssels.
- Für die konkret geprüften Private-Key-, GitHub-Token-, tatsächlichen Tenantadress- und dienstlichen E-Mail-Muster gab es im abgegrenzten Scan keine Treffer. Das ist kein umfassender Secret- oder Binäraudit.
- 95 weitere Binär- oder sonstige Dateien sind noch nicht einzeln als öffentliche Releasebestandteile beurteilt. Welche davon tatsächlich benötigt werden, ist zuerst über die Positivliste festzulegen. Benötigte Office-, Bild- und Archivdateien verlangen anschliessend ihre passenden Inhalts-/Metadatenprüfungen.
- Bei Aufnahme des Recovery-Archivs `0.7.0.3` sind fünf vom Archivverifier verlangte, derzeit ignorierte Buildlogs einzeln zu prüfen und aufzunehmen. Kein globales Freigeben aller Logdateien.
- Der lokale Datencommit verwendet weiterhin die bestehende Autor-/Committerkennung mit lokaler Geräte-E-Mail. Ein späterer Push veröffentlicht auch diese Gitmetadaten. Sie wurden weder ausgegeben noch umgeschrieben. Die konkrete Pushfreigabe muss diese Sichtbarkeit berücksichtigen.

Ein genereller Ausschluss aller `outputs`-Dateien wäre ebenfalls falsch. Produkt-, Daten- und Integritätsprüfungen benötigen ausgewählte Referenzkataloge, Vertragsdaten und öffentliche Archivkopien. Die endgültige Auswahl muss diese Abhängigkeiten erhalten, ohne private Rohbelege mitzunehmen.

## Outlook und anschliessende Freigaben

Die [Outlook-Bewertung](outlook-wiederverwendung-mvp07.md) bestätigt den unveränderten Terminvertrag über fünf tatsächliche Baustände. Serializer, Datumshilfe, Exportkachel und Kalendertexte sind bytegleich. Neue Datumseingabe und Exportgates werden getrennt durch die aktuellen Tests und Hostnachweise gestützt. Technisch ist die begrenzte Wiederverwendung der früheren Importnachweise begründet. Davids ausdrücklicher MVP07-Entscheid dazu steht noch aus. Es wurde kein Termin importiert oder gelöscht.

Empfohlener nächster lokaler Schritt ist die Bereinigung P07-01 bis P07-04 mit abschliessendem sauberem Export und hashgebundener Publikationsliste. Produktlogik, Rechtsdaten, operative Abdeckung und das abgenommene E-/Q-Paket sollen dabei unverändert bleiben. Abweichungen davon wären gesondert zu beurteilen.

Erst danach folgen konkrete GitHub- und P-Freigaben. Vor P bleiben frische Sicherung, erneuter HEAD-/GET-/Cachevergleich, gegebenenfalls ein neuer begrenzter Risikoentscheid und die öffentliche Prüfmatrix erforderlich. Frühere Header-/Cache-Risikoentscheide gelten nicht automatisch für MVP07. Root-Webauftritt, Sitemap und Hostingkonfiguration bleiben unverändert.

## Belegbindung und Schutzstatus

Die ausführlichen Inventare und Logs bleiben im privaten lokalen Prüfbereich. Die folgenden Prüfsummen binden den heutigen Nachweis, ohne private Beleginhalte zur Publikation freizugeben:

| Nachweis | SHA-256 |
| --- | --- |
| Erstsichtung des Dateiumfangs | `9101126d45204443cfb833902494fa24c296c3324653257e34296a87f852ca5b` |
| Lokaler Produkt-/Governance-/Daten-/Artefaktlauf | `0bbe0d89babd7ba9f0226aad2121082ffa504bd20472c210587399b608cdd90b` |
| Isolierte Public-Testdiagnose | `7f5861d5b9ec0bed082745a23b54d61b22a95fd196f348c770b9b142864fb3b1` |
| Outlook-Teilprüfung | `b607ab972be32818407805ded5eaf7408214e2063a4f118e9ac34e5febe017ae` |

209 im Erstinventar erfasste Produkt-, Daten-, Schema-, Skript-, Test- und Paketdefinitionsdateien sind nach den Läufen unverändert. Diese Zahl bezeichnet den geprüften Änderungsbestand, nicht alle Dateien des Repositorys. Nur neue lokale Diagnoseartefakte und Dokumentationsnachträge wurden erstellt. Kein Staging, Commit, Push, Deploy-Key, Browser-/Outlookzugriff, M365-Eingriff oder Zugriff auf das Livehosting fand statt.

David Steimer entscheidet in Personalunion über Freigaben. Codex dokumentiert und prüft als KI-Arbeitsinstrument ohne formelle Freigabe- oder Haftungsverantwortung.
