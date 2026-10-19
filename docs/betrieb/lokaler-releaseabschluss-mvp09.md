# R09-B Lokaler Releaseabschluss MVP 0.9

Stand: 18. Oktober 2026. **R09-B ist lokal vollständig ausgeführt und technisch geprüft.** Grundlage sind die [Quellenabnahme R09-A2](../fachrecht/abnahme-quellen-mvp09.md), die unveränderte [Übernahme- und Buildvorlage](uebernahme-und-buildvorlage-mvp09.md), deren [Ausführungsfreigabe](freigabe-r09-b.md) und der [gesondert freigegebene Validatornachtrag](freigabe-r09-b-quellenvalidator.md).

Dies ist ein lokaler Bau- und Prüfnachweis, keine neue Fachabnahme oder Betriebsfreigabe. Installation, Uploads, GitHub-Push, Outlook-Importe und Änderungen an M365 oder steimer.ch wurden nicht vorgenommen. Der dokumentierte Betriebsstand bleibt MVP 0.8. Eine frische Onlinebestandsaufnahme wurde hier nicht durchgeführt.

## 1. Datenbindung und definitive Artefakte

Der Release `2026-10-18-mvp-09-approved.1` umfasst 42 Laufzeitdateien. Genau ein begrenzter lokaler Datencommit wurde gebildet:

- Commit: `0ccc4b9178503ede051964149a4b17efab8d0cf9`
- Elterncommit: `c37c11bc9fbf8241535d202d54c3499d2f4c3350`
- Manifest SHA-256: `3c929779803ceb6bcbf56d44d9a2aad8ece730d916a39ab44016c118bcec2265`

Anwendung `0.9.0`, Verwaltungsverfahrenskatalog `2.0.0` und Manifest/Mindestconsumer `9.0.0` sind gebunden. Die 25 Verwaltungspfade bestehen aus zwölf bisherigen TI-/GR- und 13 neuen LU-/ZG-/AR-Pfaden. Fachdefinitionen, beschlossene Zeitfenster, AR-O1, TI-O2 und sämtliche übrigen Vorbehalte bleiben unverändert. Die 44 Sozialregeln und 50 BE-Anbindungen werden nicht ausserhalb ihrer bisherigen Freigabe aktiviert.

| Tatsächliches Artefakt | Version oder Inhalt | SHA-256 |
| --- | --- | --- |
| [Betriebspaket](../../outputs/release-mvp09-2026-10-18/fristenrechner-schweiz-0.9.0.0.sppkg) | SPFx `0.9.0.0` | `7a88f0f8f579c050e8354f8e741921251135bff804318f86dc1b34c1a12cc331` |
| [SharePoint-Mirror](../../outputs/release-mvp09-2026-10-18/fristenrechner-mvp09-sharepoint-mirror.zip) | 42 Laufzeitdateien | `13ef7f69f555604d987385132eb4ca38ef62b3e7572023ec2310b41de817c73a` |
| [Statisches Webpaket](../../outputs/release-mvp09-2026-10-18/fristenrechner-mvp09-steimer-web.zip) | Anwendung `0.9.0`, zwölf Dateien | `f7d112b015833251d3d41a5fe418e9f8063fe85aa46e48c1dafbf053031516d3` |
| [Wiederherstellungspaket](../../outputs/release-mvp09-2026-10-18/fristenrechner-schweiz-recovery-0.9.0.1.sppkg) | `0.9.0.1`, Funktionsumfang MVP 0.8 | `08c5e67e535cd3e04d962698e7dcb6bbe989f098d75f2b21aebe3226d95db94d` |

Die Paketprüfsummen stammen aus den tatsächlichen Archivdateien. Identitäten, Datenpins, eingebettete Ressourcen, Paketinhalt und fehlende zusätzliche API-Berechtigungsanforderungen sind geprüft. Der im Produkt gebundene GitHub-Datenpin ist ausschliesslich lokal vorhanden. Seine Veröffentlichung oder externe Abrufbarkeit wird nicht behauptet.

## 2. Abgeschlossene Prüfungen

| Prüfumfang | Ergebnis |
| --- | --- |
| Produktregression | 2671 Tests in 85 Gruppen bestanden |
| Web- und Hostverträge | 44 Webtests und 30 Hosttests bestanden |
| Governance und Quellenvalidator | 289 Tests und 42 Python-Prüfungen bestanden. Acht gezielte Prüfungen sichern den engen Domainnachtrag ab |
| Kontrollierte Datenübernahme | 24 öffentliche und 62 unabhängige Prüfungen bestanden |
| Definitiver SPFx-Bau | 215 Quelltests und 170 Tests am tatsächlich gebauten Paket bestanden, davon 53 neue MVP09-Prüfungen |
| Manipulierte Archivvarianten | 33 gezielte Negativprüfungen bestanden |
| Tatsächliches Recoverypaket | Sechs Werkzeugtests, 204 historische Quelltests, 107 Pakettests und zehn Recoverytests bestanden |
| Paket-Rundlauf | Alle sieben Fälle MVP09 → MVP08-Recovery → MVP09 bestanden |
| Isolierter Standardbestand | Finaler Lauf 05 mit 2799 gebundenen Eingängen bestanden, ohne private R09-Rohbelege und ohne übersprungene Tests |

Diese Zahlen beschreiben getrennte Prüfumfänge. Wiederholungen und Überlappungen werden nicht zu einer vermeintlichen Gesamtzahl unabhängiger Fachfälle addiert. Die Wiederverwendung historischer Nachweise bleibt ausdrücklich von frischen Prüfungen getrennt.

Der definitive Produktbau bindet 241 Produkteingänge und 714 Testeingänge. Die Schlussprüfung bestätigt zusätzlich 803 unveränderte Quellenbelege und den kontrollierten Umgang mit 630 Ausgangseingängen. Die 34 Lintmeldungen des regulären Baus entsprechen dem abgenommenen AP23E3-Stand. Die 24 Meldungen des historischen Recoverybaus bleiben bestehen. Sie werden weder als behoben noch als uneingeschränkt unbedenklich ausgewiesen.

Der Validatornachtrag ergänzt ausschliesslich den exakten Host `ar.ch` samt Herkunftskommentar. Keine Wildcards, keine zusätzlichen Subdomains und keine Änderung der URL-Auswertung. Rechtsdaten, Datencommit und historische Nachweise bleiben dadurch unverändert.

## 3. Darstellung, Export und Wiederherstellung

Die lokale Browserprüfung verwendet die tatsächlich gebauten Webdateien. DE/FR, schmale Darstellung, Touchsimulation, Resultat- und Exportinvalidierung sowie TI-O2 sind geprüft. Vier Bilder wurden visuell kontrolliert. Das Datumsfeld ist bei der Desktopprüfung 32 Pixel hoch, linksbündig und mit 14-Pixel-Schrift dargestellt. In der Touchsimulation bleiben 44 Pixel Höhe und 16-Pixel-Schrift erhalten.

Eine zusätzliche Prüfung verwendet die **reguläre Chrome-Einstellung 100 → 300 → 100 Prozent** in einem temporären Profil. Bei 300 Prozent wechseln Eingabe- und Fussbereich auf eine Spalte. Die Layoutbreite beträgt 426 CSS-Pixel, ohne relevantes horizontales Überlaufen. Sechs tatsächliche Browseroberflächenbilder in DE/FR sind visuell geprüft. Diese native Browserzoomprüfung ist weder CSS-Vergrösserung noch eine blosse Reflow-Simulation. Bestehende Benutzerprofile wurden nicht verändert.

Die Prüfungen ersetzen keine reale SharePoint-, Teams-, Geräte- oder Gastprüfung. Der eigentliche Paket-Rundlauf verwendet tatsächlich extrahierte Paketmodule, aber simulierte Host-, Speicher- und Transportgrenzen. LU-, ZG- und AR-Standards, beschädigte Daten, eine künftige Version, Resetmarker und kompatible BE-StPO-Standards sind abgedeckt. V5-Rohbytes bleiben geschützt. Es erfolgt kein allgemeiner Browserdatenreset.

Das Recoverypaket basiert auf den tatsächlich archivierten MVP08-Baueingängen. Ein Einsatz würde auch die neuen LU-/ZG-/AR-Funktionen und die UX-Korrektur #50 zurücknehmen. Danach braucht eine reguläre MVP09-Wiederaufnahme eine Paketversion höher als `0.9.0.1`. Der lokale Nachweis erlaubt noch keinen Einsatz im Tenant.

Zwei tatsächliche Browserdownloads und zehn Exporte aus dem definitiven Paket sind lokal geprüft. Der [Outlook-Wiederverwendungsvorschlag](outlook-wiederverwendung-mvp09.md) bleibt zur ausdrücklichen menschlichen Bestätigung offen. Kein neuer Outlook-Import.

## 4. Zwischenbefunde und Nachweistreue

Die fehlgeschlagenen Zwischenprüfungen bleiben erhalten. Eine veraltete Versionsannahme in einem bereits zur Anpassung freigegebenen Webtest wurde korrigiert. Beim ersten Recovery-Rundlauf wurde ausschliesslich ein ungültiger Zustellwert in der neuen Testfixture berichtigt. Produkt und Pakete blieben dabei unverändert.

Eine erste CSS-Vergrösserung erzeugte Überlauf, war jedoch kein Browserzoomnachweis. Die definitive native Zoomprüfung wurde separat durchgeführt. Frühere Zoomversuche mit einer abweichenden Beschriftung beziehungsweise ungeeigneter Bildaufnahme bleiben als Zwischenstände erhalten. Sie werden nicht nachträglich zu bestandenen Prüfungen umgeschrieben.

Massgebend sind die folgenden Abschlussbelege:

- [Gesamtverifikation R09-B](../../outputs/release-mvp09-2026-10-18/local-completion.json)
- [Tatsächliche Archivprüfung](../../outputs/release-mvp09-2026-10-18/artifact-verification.json)
- [Finaler isolierter Lauf 05](../../outputs/release-mvp09-2026-10-18/portability-standard-no-private-20261018-05/report.json)
- [Native Browserzoomprüfung](../../outputs/release-mvp09-2026-10-18/browser-zoom-native-20261018-03/verification.json)
- [Recovery-Rundlauf](../../outputs/release-mvp09-2026-10-18/recovery-roundtrip/verification.json)
- [Begrenzter Validatornachtrag](../../outputs/release-mvp09-2026-10-18/validator-supplement/verification.json)
- [Separater Dokumentationsabschluss](../../outputs/release-mvp09-2026-10-18/documentation-completion.json)

Die anschliessende Dokumentationsnachführung betrifft genau fünf bestehende und zwei neue Markdown-Dateien. Die zwei im isolierten Testbestand enthaltenen Navigationstexte werden dabei ausdrücklich von ihren unverändert erhaltenen damaligen Testkopien unterschieden. Der gesonderte Dokumentationsnachweis prüft erneut die unveränderten Produkt-, Daten-, Artefakt- und QA-Bindungen. Er behauptet weder einen erneuten Testlauf noch eine Erweiterung der ursprünglichen Testabdeckung.

## 5. Nächster Übergang

Als Nächstes kann **R09-C mit einer konkreten E-/Q-Installations- und Rückfallvorlage** vorbereitet werden. Sie muss die tatsächlichen vier Zielinstanzen, frische Ausgangssicherung, Mirrorbytes, gemeinsame Codewirkung, AP5-Erhalt und den gebundenen Recoveryweg festlegen. Upload, Installation und Rückfallvollzug benötigen anschliessend eine eigene konkrete Freigabe.

Reale Host-/Geräteprüfungen, Gastbestätigung, manuelle Q-Abnahme, Outlook-Wiederverwendungsentscheid, Publikationsvorprüfung, weitere Commits, GitHub-Push und P-Bereitstellung bleiben getrennte Schritte. Die versionsbezogene Header-/Cacherisikoakzeptanz für MVP 0.8 gilt nicht automatisch für MVP 0.9.
