# MVP 0.9 Lokale Publikationsvorprüfung

Stand: 19. Oktober 2026. **Die lokale Publikationsvorprüfung R09-D ist durchgeführt. Die frischen Typ-, Produkt-, Governance- und Integritätsprüfungen sind bestanden. Die abgenommenen E-/Q-Artefakte, Rechtsdaten und Produktinputs stimmen mit ihren gebundenen Bytes überein. Vor dem konkreten Publikationspaket sind drei lokale Arbeiten erforderlich: öffentliche Nachweise bereinigen, die exakte Dateiauswahl mit vollständigem Testbestand festlegen und lebende Einstiegs- und IT-Unterlagen aktualisieren. Ein Neubau der abgenommenen Auslieferungsartefakte ist nach dem Prüfergebnis nicht erforderlich.**

Die [Q-Abnahme](abnahme-q-mvp09.md) schliesst R09-C einschliesslich C08. Geräteprüfung und Gastzugriff sind von David bestätigt, die begrenzte Outlook-Wiederverwendung ist ausdrücklich angenommen. T06-H01 und B11-H01 bleiben für den Folgerelease vorgemerkt. Die akzeptierte T07-Zeitpunktabweichung bleibt dokumentiert.

## Geprüfter Releasebestand

| Gegenstand | Bindung |
| --- | --- |
| Anwendung / SPFx-Paket | `0.9.0` / `0.9.0.0` |
| Datenrelease | `2026-10-18-mvp-09-approved.1`, 42 Laufzeitdateien |
| Manifest SHA-256 | `3c929779803ceb6bcbf56d44d9a2aad8ece730d916a39ab44016c118bcec2265` |
| Lokaler Datencommit und HEAD | `0ccc4b9178503ede051964149a4b17efab8d0cf9` |
| Fachbasis | AP23E1 bis E3, DEC-2026-033 und [Quellenabnahme R09-A2](../fachrecht/abnahme-quellen-mvp09.md) |
| Interner Betrieb | Vier bestehende E-/Q-Apps mit eigenem MVP09-Mirror, [technischer Vollzug](eq-vollzugsnachweis-mvp09.md) und anschliessende menschliche Q-Abnahme |
| Öffentlicher Betrieb | Letzter dokumentierter Stand [MVP 0.8 vom 16. Oktober](produktionsbereitstellung-mvp08-2026-10-16.md), keine neue Liveinventur in R09-D |

Die tatsächlichen Dateien unter `outputs/release-mvp09-2026-10-18/` sind unverändert:

| Datei | Bytes | SHA-256 |
| --- | ---: | --- |
| `fristenrechner-schweiz-0.9.0.0.sppkg` | 327’130 | `7a88f0f8f579c050e8354f8e741921251135bff804318f86dc1b34c1a12cc331` |
| `fristenrechner-mvp09-sharepoint-mirror.zip` | 235’314 | `13ef7f69f555604d987385132eb4ca38ef62b3e7572023ec2310b41de817c73a` |
| `fristenrechner-mvp09-steimer-web.zip` | 658’325 | `f7d112b015833251d3d41a5fe418e9f8063fe85aa46e48c1dafbf053031516d3` |
| `fristenrechner-schweiz-recovery-0.9.0.1.sppkg` | 311’609 | `08c5e67e535cd3e04d962698e7dcb6bbe989f098d75f2b21aebe3226d95db94d` |

Geprüft sind 241 aktuelle Produktinputs, 714 Build-/Testfixtures, ihre jeweiligen archivierten Kopien, 42 Runtime- und zwölf Webdateien sowie die vier Auslieferungsarchive. Das ergibt 1’968 Dateibindungen, deren Kategorien sich teilweise überschneiden. Rechenlogik, Rechtsdaten und die abgenommene Feldhöhenkorrektur sind durch diese Prüfung nicht verändert.

Die Recovery-Prüfung im Modus `--verify` bestätigt das bestehende Paket und 845 Archivdateien. Der ursprüngliche Bericht behält seinen damaligen noch offenen Roundtrip-Status. Der anschliessend separat abgeschlossene Rundlauf ist zusätzlich über 101 Eingänge und 102 Archivdateien frisch nach Länge und Prüfsumme bestätigt. Der Rundlauf wurde nicht neu ausgeführt und das Recovery nicht installiert.

Die C01- und C03-Prüfer sind im Nur-Prüfen-Modus nochmals bestanden. Alle 336 gesicherten alten und neuen Mirrordateien bleiben an die ursprünglichen Sollbytes gebunden. Das ist ein neuer lokaler Vergleich, kein erneuter Remoteabruf und keine Aktualisierung der damaligen Onlineaufnahmezeitpunkte.

## Frische Prüfungen

| Prüfung | Ergebnis |
| --- | --- |
| TypeScript in isolierter Kopie | Bestanden |
| Öffentliche MVP09-Integrität | Bestanden. 42 Runtime- und sieben Schemadateien, ohne private Quellenoriginale oder Gitabfrage |
| Produkt und Oberfläche in isolierter Kopie | 2’671 Tests bestanden, keine Fehler, Abbrüche, übersprungenen Tests oder offenen Testmarkierungen |
| Node-Governance in isolierter Kopie | 289 Tests bestanden, keine Fehler, Abbrüche, übersprungenen Tests oder offenen Testmarkierungen |
| Python-Governance | 42 Tests bestanden |
| Quellenvalidator | 255 registrierte Quellen, 157 produktiv, sieben Ereignisse und acht Negativtests gültig. Schema-/Registerprüfung, keine erneute inhaltliche Quellenabnahme |
| Artefakt- und Archivintegrität | Bestanden, einschliesslich Recovery und gebundener Rückfallbelege |
| Enger Textmustercheck der Auslieferungsarchive | 86 unkomprimierte Textbestandteile ohne Treffer für die geprüften persönlichen Pfad-, Tenant-, Mailbox- und Zugangsschlüsselmuster |
| Paketicons | Vier PNG-Einträge byteidentisch mit dem veröffentlichten MVP08-Paket. Kein neuer visueller Inhalts- oder Metadatenaudit |

Die vorhandene gebündelte Laufzeit war inzwischen auf Node 24 gewechselt. Für die frischen Prüfungen wurde deshalb die offizielle Node-Laufzeit **22.23.2** separat in den privaten Prüfungsordner bezogen. Das Archiv stimmt mit der offiziellen SHA-256-Liste überein. Die bestehenden npm-Abhängigkeiten und die vorhandene Python-Umgebung werden wiederverwendet. Es wurden keine Projektabhängigkeiten installiert oder angehoben.

Der technische Standardtestbestand umfasst **2’802 bezeichnete Eingänge**, 85 Produkt-/UI-Testdateien und 26 Node-Governance-Testdateien. Die Tests laufen in einer getrennten Kopie mit den heutigen Quellbytes. Aktuelle vollständige R09-B-Archive, private Quellenoriginale, Gitmetadaten und Hostingbackups werden nicht bereitgestellt. Eine bereits früher öffentlich verwendete amtliche ELG-XML bleibt ausdrücklich enthalten. Die Tests dürfen ihre vorgesehenen eigenen Vorschau- und Testausgaben in der Kopie erzeugen. Definitive Auslieferungsartefakte werden nicht neu gebaut.

Die Kopie ist eine technische Portabilitätsprobe, noch kein abschliessender Export aus der künftigen Positivliste. Einzelne historische Testfixtures und betriebliche Hilfsskripts müssen für diese endgültige Auswahl eigens bewertet werden. Die Prüfgruppen werden nicht zu einer irreführenden Gesamttestzahl addiert.

Der frische Produktlauf dauerte am 19. Oktober von **13:29:30 bis 13:35:15 Uhr Schweizer Zeit**. Die Governance-Gruppen liefen parallel bis 13:31:39 Uhr. Sämtliche 2’802 kopierten Eingänge sind vor und nach dem Lauf unverändert bestätigt. Die Typprüfung lief in einer ersten Kopie mit exakt denselben Eingangsbytes. Anfängliche Anpassungsfehler des privaten Kopier-/Prüfwerkzeugs stoppten noch vor dem Teststart. Nur der korrigierte R2-Lauf wird als Testnachweis gewertet. Das Originalwerkzeug und die früheren Releaseberichte bleiben unverändert.

Die abschliessende Kontrolle bestätigt ausserhalb der Kopie 2’801 dieser Eingänge unverändert. Der lebende Dokumentationsindex `docs/README.md` wurde anschliessend gezielt auf die Q-Abnahme und den jetzigen Vorprüfstatus nachgeführt. Diese eine dokumentierte Änderung wird nicht als bytegleich zum früheren Testeingang ausgegeben. Alle 1’968 geschützten Produkt-/Artefaktbindungen und die vorbestehende Wordänderung bleiben unverändert. Die lokale Linkprüfung bestätigt 802 Dateiziele in 15 Unterlagen. Externe URLs, Abschnittsanker und die Zugehörigkeit zur späteren öffentlichen Positivliste sind dadurch nicht geprüft.

Der Mustercheck ist keine vollständige Secret-, Binär- oder Bildprüfung. Geprüfte Archivbytes belegen auch keinen aktuellen HTTP-Header- oder Cachezustand auf steimer.ch. Vor P bleiben die frische Sicherung, der erneute HEAD-/GET-/Cachevergleich und ein konkreter MVP09-Risikoentscheid erforderlich.

## Erforderliche lokale Publikationsarbeiten

| ID | Befund | Begrenzte Bereinigung |
| --- | --- | --- |
| P09-01 Öffentliche Nachweise | In der abgegrenzten Textsichtung 137 persönliche Absolutpfadtreffer, einschliesslich AP23E3-, Build-, Outlook-, Portabilitäts- und Recovery-Berichten sowie einzelnen Archivkopien. Die Originale sind teilweise Gegenstand unveränderlicher Abnahmebindungen | Originalbytes privat erhalten. Benötigte öffentliche Nachweiskopien getrennt erstellen, Herkunftshash und Transformation binden. Historische Fehlversuche und tatsächliche Nachweisgrenzen erhalten. Öffentliche Integrität und privater Vollnachweis bleiben getrennte Prüfwege |
| P09-02 Dateiauswahl und Testbestand | Noch keine endgültige Positivliste. Der Arbeitsbestand enthält private Sicherungen, eine vorbestehende Wordänderung, weitere Paketkopien und tenantgebundene Betriebsprüfer. Ein pauschaler Ordnerexport würde unnötige oder private Inhalte erfassen | Exakte Pfad-/Byte-/Hashliste für Quellstand, vorhandenen Datencommit, nötige Referenzfixtures, öffentliche Nachweise und definitive Artefakte erstellen. Private und betriebliche Inhalte ausdrücklich ausschliessen. Den daraus tatsächlich exportierten Bestand ohne ausgeschlossene private Originale prüfen |
| P09-03 Lebende Unterlagen | README und mehrere IT-/Testanleitungen nennen noch MVP08 oder ältere Vorbereitungs- und Betriebsstände. Der Übergang zu 25 Verwaltungswegen, Format 9 und Recovery `0.9.0.1` ist dort nicht vollständig nachgeführt | Aktuelle Absätze gezielt auf MVP09-E/Q und den dokumentierten öffentlichen MVP08-Stand bringen. Paket, Mirror, Rechtsumfang, Zeit-/Fallgrenzen, Defaults 5, offene UX-Nacharbeit und verfügbare Prüfkommandos korrekt nennen. Historische Unterlagen unverändert lassen |

### Öffentliche Nachweise und private Originale

Die Sichtung umfasst 2’011 vorläufige Kandidaten mit 1’951 untersuchten Textdateien. 33 Dateien enthalten Treffer der eng definierten Pfad- oder Tenantmuster. Dies ist eine abgegrenzte Erstsichtung, keine Aussage über sämtliche Dateien der Arbeitsablage und keine Publikationsfreigabe aller Kandidaten.

Beispiele für benötigte öffentliche Nachweisaufbereitung sind `outputs/ap23e3-2026-10-18/QA-AP23E3.json`, `spfx-build.json`, der zugehörige Erstversuch, `outputs/release-mvp09-2026-10-18/data-verification.json`, `outlook-reuse-assessment.json` und die Recovery-/Portabilitätsberichte. Gebundene Originale werden nicht nachträglich pfadbereinigt. Stattdessen erhalten öffentliche Kopien eine nachvollziehbare Zuordnung zu Originalpfad, -hash und -länge.

Die eigenen privaten E-/Q-Rohbelege, HAR-Dateien, Zielbindungen und Screenshots bleiben unter `.work/` ausgeschlossen. Dies betrifft auch die ausdrücklich nicht zur Publikation bestimmten Aufnahmen mit versehentlich sichtbaren fremden Speichermetadaten. Die manuelle Q-Abnahme erlaubt keine Veröffentlichung dieser Inhalte.

Die fünf Tenanttreffer stammen aus den beiden betrieblichen Baselineprüfern `verify-r08c-baseline.mjs` und `verify-r09c-baseline.mjs`. Diese aktiven Prüfziele sind von absichtlichen Negativassertionen zu unterscheiden. Für die Veröffentlichung werden die Werkzeuge entweder ausgeschlossen oder separat portabilisiert. Historische gebundene Kopien bleiben erhalten.

### Konkrete Dateiauswahl

Ausgeschlossen bleiben `.work/`, `Userinput/`, private Quellen-/Buildvollarchive, lokale Website- und Rechnerbackups, Browserrohbelege, überzählige Installationskopien und die vorbestehende Wordänderung am Projektplan V1.0. Der Wordstand ist nur zur Erhaltung gehasht und nicht inhaltlich bewertet oder zur Veröffentlichung ausgewählt. Es wurde nichts gelöscht.

Die Erstsichtung grenzt 53 unversionierte private oder Backup-Pfade sowie die gesonderte Wordänderung ab. Weitere 60 binäre oder nicht von der Dateiendungssichtung erfasste Kandidaten sind einzeln zu entscheiden. Dazu zählen auch Kalenderdateien und `.htaccess`-Dateien. Diese Zahl ist deshalb keine Zahl von 60 echten Binärdateien und kein pauschaler Prüfvorbehalt gegen die vier separat bytegeprüften Auslieferungsarchive.

Notwendige historische Referenzkataloge und Testfixtures dürfen nicht allein wegen ihres Speicherorts unter `outputs/` fehlen. Umgekehrt gehört ein vollständiges privates Archiv nicht allein deshalb in den öffentlichen Bestand, weil ein historischer Vollprüfer es benötigt. Die konkrete Exportkopie muss ihren tatsächlich ausgewiesenen öffentlichen Prüfweg bestehen.

Der vorhandene Datencommit enthält die bestehende Autor-/Committerkennung mit einer lokalen Geräte-E-Mail. Seine spätere Veröffentlichung macht auch diese Gitmetadaten sichtbar. Die Kennung und die gepinnte Commit-ID wurden nicht verändert. Die konkrete Publikationsfreigabe muss diese Sichtbarkeit einschliessen.

### Aktualität der Einstiege und IT-Unterlagen

Die neue Q-Abnahme, der aktuelle Deploymentplan, der Vollzugsnachweis und der heutige Eintrag im Dokumentationsindex sind bereits nachgeführt. Der ursprüngliche Outlook-Vorschlag und die hashgebundenen R09-B-/R09-C-Verträge bleiben unverändert. Die neue Abnahmenotiz dokumentiert den anschliessenden menschlichen Entscheid.

Noch zu aktualisieren sind insbesondere `README.md`, `spfx/README.md`, die technische Kurzdokumentation, die Dritt-Tenant-Anleitung, aktuelle Architektur-/Fachrechtseinstiege sowie `data/README.md` und `tests/README.md`. Sie sollen 25 Verwaltungspfade für TI/GR/LU/ZG/AR, 42 Mirrordateien, Manifest/Mindestconsumer 9.0.0, Verwaltungsverfahrenskatalog 2.0.0, Defaults 5 und das MVP08-Recovery `0.9.0.1` ausweisen. Neue ausserbernische Sozialfreigaben oder weitere Kantonsrechte sind nicht enthalten.

Bei den Zeitfenstern gilt insbesondere LU ab 27.09.2026, ZG/AR ab 29.08.2026 und die jeweilige vollständige Berechnungsabdeckung bis 31.12.2027. AR-O1 sowie TI-/GR-Grenzen bleiben qualifiziert. Die Datumshöhe #50 ist im Paket korrigiert. Die beiden neu akzeptierten Darstellungsbefunde bleiben für den Folgerelease offen.

Das Paket enthält noch keinen npm-Alias `check:integrity:mvp09`. Der bereits vorhandene öffentliche Integritätsprüfer ist direkt mit `node scripts/verify-mvp09-public-integrity.mjs` aufrufbar. Eine Dokumentationskorrektur darf keinen nicht vorhandenen Befehl empfehlen. Die abgenommenen Paketmetadaten und Buildinputs werden für einen blossen Alias nicht verändert.

## Nächster Schritt

P09-01 bis P09-03 werden in einem begrenzten lokalen Bereinigungsschritt erledigt. Danach liegt ein getesteter, hashgebundener Publikationsumfang mit konkreter Freigabevorlage vor. Rechenlogik, Rechtsdaten, SPFx-Paket, Mirror-, Web- und Recovery-Archive bleiben dabei unverändert. Ein hiervon abweichender Befund wird gesondert vorgelegt.

Erst das fertige Publikationspaket wird zur lokalen Commitbildung und zum GitHub-Push freigegeben. Ein temporärer Schreibzugang ist separat zu bestätigen. Für P folgen frische Sicherung und Bestandsprüfung, HEAD-/GET-/Cachevergleich, Stage und öffentliche Prüfmatrix. Root-Webauftritt, Sitemap und Hostingkonfiguration bleiben ohne zusätzlichen Auftrag unverändert.

## Belegbindung

Die privaten Inventare und ausführlichen Prüflogs verbleiben in der lokalen Arbeitsablage. Ihre Prüfsummen binden die Nachweise, ohne ihre Inhalte zur Veröffentlichung auszuwählen.

| Privater Nachweis | SHA-256 |
| --- | --- |
| Inventar und Publikationsbefunde | `aa61680c850e07a421840d1f92552d5209c4ef33fe16846df83398358d524208` |
| Typprüfung und öffentliche Runtime-/Schemaintegrität | `52b88a645fdcb06afe72ad44ef2107f3226b7acea923f64601121443edab090e` |
| Recovery-, C01-/C03- und geschützte Dateibindungen | `9d71d1814900ff85985d057e6c4d4d2c157a584df8875ef37b1b9f2ef522e7bb` |
| Frischer isolierter Produkt-/Governance-Standardlauf | `0c6a6fbdee97917fde1649360eda3b5f6311e59195e6f664176abf389c7fbf0a` |
| Abschliessende Quell-/Index-/Linkkontrolle | `39eb022fb6f1ee9699dcbbf1fb2844af4081a26bceaf96e44a7fc3bd66d1d54e` |

Keine Gitindexänderung, kein zusätzlicher Commit, Push, Deploy-Key, M365-Eingriff, Outlookzugriff oder Livehostingzugriff. David Steimer entscheidet und nimmt in Personalunion ab. Codex dokumentiert und prüft als KI-Arbeitsinstrument ohne formelle Freigabe- oder Haftungsverantwortung.
