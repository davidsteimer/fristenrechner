# MVP 0.9 Konkretes Publikationspaket

Stand: 19. Oktober 2026. **Lokale Bereinigung P09-01 bis P09-03 zur Freigabe vorgelegt.** Die [Q-Abnahme](abnahme-q-mvp09.md) und der abgenommene E-/Q-Stand bleiben unverändert. Dieser Bericht erteilt weder Commit-/Pushfreigabe noch eine P-Freigabe.

## Ergebnis und Abgrenzung

| Punkt | Behandlung |
| --- | --- |
| P09-01 | 50 getrennte öffentliche Nachweiskopien mit Herkunftspfad, Originalhash/-länge, Transformation und Auslassungen. Originale bleiben erhalten |
| P09-02 | Exakte Positivliste mit Pfad, Bytes und SHA-256. Vorhandener Datencommit und spätere Publikationsdateien getrennt. Private und überzählige Inhalte ausgeschlossen. Tatsächlicher Export gegen öffentlichen Gitbestand und ausgewählte aktuelle Bytes geprüft |
| P09-03 | Lebende Einstiegs-, SPFx-, Daten-, Test- und IT-Unterlagen auf MVP09-E/Q nachgeführt. Öffentlicher MVP08-Stand und historische Zwischenstände getrennt. Neue Releasehinweise und Artefaktübersicht |

Anwendung `0.9.0`, Paket `0.9.0.0`, Datenrelease `2026-10-18-mvp-09-approved.1`, Manifest/Mindestconsumer `9.0.0`, Verwaltungsverfahrenskatalog `2.0.0`. Die 25 Verwaltungswege für TI/GR/LU/ZG/AR behalten ihre Zeit-/Fallgrenzen, AR-O1 und die übrigen Vorbehalte. Standards 5, 44 Sozialregeln und 50 BE-Anbindungen bleiben unverändert.

Die vier tatsächlichen [Auslieferungsarchive und ihre Prüfsummen](releaseartefakte-mvp-09.md) sind unverändert. Kein Neubau der definitiven Pakete, keine Änderung an Rechenlogik, UI, Rechtsdaten, E/Q, AP5, Berechtigungen oder Hosting.

## Konkrete Dateibindung

Verbindlich ist [publication-package.json](../../outputs/publication-mvp09-2026-10-19/publication-package.json). Sie enthält die ausgewählten neuen/geänderten Dateien einschliesslich der 42 Dateien im bestehenden Datencommit. Unveränderte bereits veröffentlichte Dateien bilden die Repositorybasis und werden nicht als neue Änderungen ausgegeben.

Die Positivliste enthält sich selbst nicht. Sie wird als zusätzliche Freigabedatei ausgewiesen. Ihre abschliessende SHA-256 wird separat im Freigabegespräch genannt. Dadurch entsteht keine zirkuläre Selbstbindung. Enthalten sind Quellcode, notwendige historische Referenzfixtures, Quellenregister-/Prüfereignis, AP23E-/Releaseunterlagen, öffentliche Nachweiskopien, neue Publikationsprüfer/-tests sowie die vier definitiven Archive. Ein Git-Push erzeugt keinen GitHub-Release-Anhang.

Ausgeschlossen bleiben insbesondere `.work/`, `Userinput/`, private Quellen- und Buildvollarchive, Browserrohbelege, HARs, Zielbindungen, Screenshots, Hosting-/Rechnerbackups, zusätzliche Installationskopien und die vorbestehende Wordänderung am Projektplan V1.0. Tenantgebundene Baselinewerkzeuge und zwei unbenötigte historische Skriptkopien mit persönlichen Absolutpfaden werden nicht veröffentlicht. Es wird nichts gelöscht.

## Öffentliche und private Nachweise

Das [Nachweismanifest](../../outputs/publication-mvp09-2026-10-19/evidence/manifest.json) bindet 50 öffentliche Kopien. Bei vollständigen Kopien werden nur persönliche lokale Pfade durch Platzhalter ersetzt. Bei Zusammenfassungen sind ausgewählte und ausgelassene Felder benannt. Historische Fehlversuche, Statuswerte und noch offene Genehmigungsfelder bleiben erhalten. Sie werden nicht nachträglich zu einer heutigen Freigabe geändert.

Die [Q-Abnahme](abnahme-q-mvp09.md) dokumentiert den späteren Entscheid separat. Die ursprüngliche Outlook-Bewertung bleibt mit ihrem damaligen Vorschlagsstatus erhalten. Ihre begrenzte Wiederverwendung ist inzwischen ausdrücklich angenommen. Es fand kein neuer Outlook-Import statt.

`node scripts/prepare-mvp09-public-evidence.mjs --verify` prüft die öffentlichen Kopien ohne private Originale. Der lokale Vergleich gegen Originale ist zusätzlich bestanden. Vollständige Rohquellen-/Recovery-Audits werden nicht als öffentlich reproduziert ausgegeben.

Die [Erhaltungskontrolle](../../outputs/publication-mvp09-2026-10-19/preservation-check.json) vergleicht die geschützten Dateien frisch. Zwei in früheren Eingangslisten enthaltene lebende Dokumentationsdateien, `data/README.md` und `tests/README.md`, sind auftragsgemäss aktualisiert. Ihre früheren archivierten Baukopien bleiben unverändert. Diese Dokumentationsausnahmen sind mit Vorher-/Nachherhash ausgewiesen und werden nicht als bytegleich zu früheren Prüfeingängen ausgegeben. Produktquellen, Testcode, Rechtsdaten und Auslieferungsbytes bleiben geschützt.

## Prüfung des tatsächlichen Exports

Der [frische Exportprüfbericht](../../outputs/publication-mvp09-2026-10-19/public-checks.json) bindet den geprüften technischen Eingang und alle Testlogs. Basis ist das Gitarchiv des bestehenden Datencommits, ergänzt ausschliesslich um die konkret ausgewählten aktuellen Dateien. Kein Gitverzeichnis, keine aktuellen privaten R09-B-Vollarchive, Rohquellen oder Hostingbackups werden kopiert. Die früher öffentlich verwendete ELG-XML-Testdatei bleibt ausdrücklich enthalten.

| Prüfung im tatsächlichen Export | Ergebnis |
| --- | --- |
| Typprüfung, Runtime-/Schemaintegrität und öffentliche Nachweiskopien | Bestanden |
| Produkt und Oberfläche | 2’671 Tests bestanden |
| Node-Governance | 313 Tests bestanden, darunter 24 neue Publikations-/Nachweiskopienprüfungen |
| Python-Governance | 42 Tests bestanden |
| Quellenvalidator | 255 Quellen, 157 produktiv, sieben Ereignisse und acht Negativtests gültig |
| Zusätzliche Tests der öffentlichen Webausprägung | 44 Tests bestanden |

Keine Fehler, Abbrüche, übersprungenen Tests oder offenen Testmarkierungen in den drei Node-Testgruppen. Die Gruppen überschneiden sich fachlich und werden nicht zu einer Gesamttestzahl addiert. Die Python- und Schemaprüfung meldeten ebenfalls keine Fehler. Alle technischen Eingänge der Testkopie bleiben vor und nach dem Lauf bytegleich.

Die vorhandenen npm-Abhängigkeiten und die vorhandene Python-Umgebung werden wiederverwendet. Node.js `22.23.2` bleibt gebunden. Kein frisches `npm ci`, kein neuer Liveclone, kein SPFx-Zweitbau und keine neue Browser-/Host-/Geräte-/Gast-/Outlookprüfung werden behauptet. Standardtests dürfen eigene Test- und Vorschauausgaben erzeugen.

Nach dem technischen Lauf werden ausschliesslich Dokumentation und Publikationsberichte geschlossen. Sämtliche ausgewählten technischen Eingänge werden nochmals mit dem geprüften Export verglichen. Der finale Nur-Auswahlexport wird zusätzlich auf genau die Positivliste plus ihre eigene Manifestdatei geprüft. Diese Prüfung ist von der Gitbasis-plus-Auswahl-Testkopie getrennt.

[Publikationssichtung](../../outputs/publication-mvp09-2026-10-19/privacy-review.json) und [Abschlusskontrolle](../../outputs/publication-mvp09-2026-10-19/closure-check.json) nennen Musterumfang, Ausschlüsse und Linkprüfung. Die vier Archive enthalten 90 Einträge, davon 86 geprüfte Textbestandteile. Vier PNG-Einträge sind byteidentisch zu veröffentlichten MVP08-Icons. Das ist kein neuer visueller oder vollständiger Binär-/Metadatenaudit. Der Mustercheck ist keine allgemeine Secret-, Malware- oder Steganografiefreigabe.

T06-H01, B11-H01, die akzeptierte T07-Zeitpunktabweichung, die fehlende separate VoiceOver-Evidenz und die Grenzen der Outlook-Wiederverwendung bleiben offen beziehungsweise begrenzt akzeptiert. Kein früherer Misserfolg wird als bestandener neuer Test gezählt. Die [ursprüngliche R09-D-Vorprüfung](publikationsvorpruefung-mvp09.md) bleibt unverändert.

## Gitmetadaten und vorgesehener Vollzug

Der vorhandene Datencommit `0ccc4b9178503ede051964149a4b17efab8d0cf9` enthält genau 42 Laufzeitdateien. Autor und Committer sind mit `David Steimer <davidsteimer@MacBook-Air-von-David.local>` eingetragen. Bei Veröffentlichung werden diese Metadaten sichtbar. Die bestehende Commit-ID wird nicht umgeschrieben. Auch der spätere Publikationscommit macht seine tatsächlich verwendeten Gitmetadaten sichtbar.

Nach Freigabe ist genau ein zusätzlicher Publikationscommit mit den gegenüber dem Datencommit neuen/geänderten Positivlistendateien und der Positivliste selbst vorgesehen. Danach folgt der Zwei-Commit-Push auf `main` des öffentlichen Repositorys `davidsteimer/fristenrechner`. Nur die exakte Auswahl darf in den Index gelangen. Vor Commit und Push werden Identität, Auswahl und unveränderte Bytes nochmals geprüft. Ein abweichender Remote- oder Lokalbestand führt zum Halt.

Ein erforderlicher temporärer Schreibzugang wird separat konkret bestätigt. Nach Push sind die tatsächliche Remote-ID, beide Commits und die relevanten veröffentlichten Rohbytes zu verifizieren. Ein temporärer Schlüssel ist anschliessend unverzüglich auf GitHub und lokal zu entfernen.

## Freigabevorlage

> Ich gebe das vorgelegte Publikationspaket MVP 0.9 mit der separat genannten SHA-256 der Positivliste, dem vorhandenen Datencommit `0ccc4b9178503ede051964149a4b17efab8d0cf9` und der beschriebenen Gitmetadatensichtbarkeit zur Bildung genau eines Publikationscommits und zur anschliessenden Veröffentlichung beider Commits auf `main` im öffentlichen Repository `davidsteimer/fristenrechner` frei. Ausschliesslich die gebundene Positivliste und ihre eigene Manifestdatei sind umfasst. Ein temporärer Schreibzugang wird separat bestätigt. Rechenlogik, Rechtsdaten, abgenommene Artefakte, E/Q, AP5, M365-Rechte und Hosting bleiben unverändert. Eine P-Bereitstellung oder P-Risikoübernahme ist nicht eingeschlossen.

Öffentlich bleibt zuletzt MVP 0.8 dokumentiert. Für P folgen gesondert frische Sicherung und Bestandsprüfung, erneuter HEAD-/GET-/Cachevergleich, konkreter MVP09-Risikoentscheid, Stage, öffentliche Prüfmatrix und abschliessende Betriebsfreigabe. Das frühere Header-/Cacherisiko ist nicht behoben und nicht durch dieses Publikationspaket übernommen. Root-Webauftritt, Sitemap und Hostingkonfiguration bleiben unverändert.

David Steimer entscheidet und nimmt alle menschlichen Rollen in Personalunion wahr. Codex unterstützt als dokumentiertes KI-Arbeitsinstrument ohne formelle Freigabe- oder Haftungsverantwortung.

