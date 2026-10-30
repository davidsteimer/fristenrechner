# MVP 0.9: Freigabevorlage für steimer.ch-P

Stand: 19. Oktober 2026, Fassung 1.0. **Zur Entscheidung, noch keine Freigabe zur Bereitstellung.** Diese Vorlage ergänzt den veröffentlichten Releaseplan. Für den kommenden P-Vollzug sind ihr Ablauf und die neue [P-Prüfmatrix](pruefmatrix-p-mvp09.md) massgebend.

Die [Q-Abnahme](abnahme-q-mvp09.md) einschliesslich Geräte-, Gastprüfung und begrenzter Outlook-Wiederverwendung liegt vor. Daten- und Publikationscommit wurden am 19. Oktober veröffentlicht und öffentlich zurückgelesen. Der temporäre GitHub-Schreibzugang ist entfernt. Die heutige Vorbereitung hat ausschliesslich lokale Dateien geprüft und neue Planungsunterlagen erstellt. Kein Hostingabruf, Header-/Cachetest, Upload, Neubau oder Eingriff in E/Q oder P ist erfolgt.

## 1 Gebundener Kandidat

| Gegenstand | Bindung |
| --- | --- |
| Einziges Produktivziel | `https://www.steimer.ch/fristenrechner/` im bestehenden Hostingvertrag |
| Webpaket | [fristenrechner-mvp09-steimer-web.zip](../../outputs/release-mvp09-2026-10-18/fristenrechner-mvp09-steimer-web.zip) |
| Grösse und SHA-256 | **658’325 Bytes**, `f7d112b015833251d3d41a5fe418e9f8063fe85aa46e48c1dafbf053031516d3` |
| App und Daten | `0.9.0`, `2026-10-18-mvp-09-approved.1`, Manifest und Mindestconsumer `9.0.0` |
| Datenmanifest SHA-256 | `3c929779803ceb6bcbf56d44d9a2aad8ece730d916a39ab44016c118bcec2265` |
| Datencommit | `0ccc4b9178503ede051964149a4b17efab8d0cf9` |
| Publikationscommit | `02209d0693479494ce5f57d12d3e4e2b4466eee3` |
| Dateibestand | Zwölf Kandidatdateien, davon elf öffentlich abrufbar und die App-`.htaccess` |
| Hauptassets | `assets/app-BN2ZJTIL.js`, `assets/app-PQFJG2Q2.css` |
| Private Zielbindung | Lokale `targets.private.json` der R09-P-Vorbereitung, SHA-256 `0b4fe02f1fb1d20f175fc1afde184956cf9e00deb9238a7f9ce5fb39adaed72c` |

Die [lokale Artefaktprüfung](../../outputs/p-vorbereitung-mvp09-2026-10-19/local-verification.json), SHA-256 `37e723ef04b4f7459adf6ddb5fbab1bea62619f7afea9e74a539bff50ede74c0`, bestätigt sichere eindeutige ZIP-Pfade, CRC, alle zwölf Dateihashes und Bytegleichheit des Webpakets mit dem veröffentlichten Git-Blob. Alle 527 Dateien der bisherigen Publikationspositivliste, deren Manifest und die 42 Laufzeitdateien sind unverändert.

Die App-`.htaccess` ist bytegleich zum MVP08-Webpaket, SHA-256 `22b8447d9ecc5f709ee0362ba23e813b2ca124bd563b2cf62e57961aaae6b4e8`. Vor dem Austausch muss auch der frische Hostingbestand dazu passen. Das ist eine Dateiintegritätsprüfung, kein Headerwirkungstest und kein Auftrag zur Konfigurationsänderung.

P verwendet ausschliesslich eingebettete Daten. **Kein Neubau, keine Rechtsdatenänderung, kein Mirrorwechsel, keine SPFx- oder Recoveryinstallation.**

## 2 Nächste Schritte und Haltepunkte

| Schritt | Erforderlicher Abschluss |
| --- | --- |
| R09P-01 Freigabe und frischer Bestand | Erklärung gemäss Abschnitt 7. Bestehenden Vertrag, kanonischen Rechnerbaum und gebundene Ziele eindeutig bestätigen. Den zuletzt am 16.10.2026 dokumentierten MVP08-Stand mit tatsächlichem Code, Daten und Dateien frisch bestätigen. Bei anderem oder ungeklärtem Bestand Halt |
| R09P-02 Frische Sicherung | Gesamten aktuellen Website-Nutzbestand einschliesslich versteckter Konfiguration und bisheriger Rechnerassets ausserhalb des Webroots sichern und lokal speichern. CRC, sichere Pfade, Vollständigkeit gegen frisches Inventar und SHA-256 prüfen. Öffentliche Ausgangsbytes mit der Sicherung abgleichen. Bestehende Sicherungs-/Uploadbereiche nicht rekursiv mitsichern. Ohne nutzbare Sicherung kein Upload |
| R09P-03 Privater Upload | Getrennten Transportbestand mit eigenem Inventar und Hash bilden. Unveränderten Kandidaten und nur die bestimmten Altassets in den neuen privaten Uploadbereich übertragen, entpacken und vollständig zurücklesen. Noch keine Änderung des produktiven Rechners |
| R09P-04 Öffentliche Vorprüfung | Geprüften Kandidaten auf die gebundene unverlinkte Stage verschieben. Sie ist öffentlich erreichbar. Datei-, Identitäts- und Funktionsgate nach P-Matrix bestehen. D04/D05 werden nicht erneut ausgeführt |
| R09P-05 Umschaltung | Ausgangsstand, Stage und freie Rückfallziele unmittelbar erneut bestätigen. Bestehenden MVP08-Rechnerbaum in den privaten Rückfallbereich verschieben. Danach Stagebaum auf den bisherigen Rechnernamen umbenennen. Kein Mischen oder Einzeldateiüberschreiben |
| R09P-06 Öffentliche Prüfung | Zehn aktive Prüfpunkte D01–D03 und D06–D12 samt bezeichneten Rechenfällen ausführen. D04/D05 getrennt als bewusst nicht erneut ausgeführt ausweisen. Eigene Testzustände zurücknehmen. Bei anderen Fehlern nach Abschnitt 5 zurückfallen |
| R09P-07 Abschluss | Produktionsnachweis mit tatsächlichen Ergebnissen und Grenzen vorlegen. David entscheidet danach über die endgültige MVP09-P-Betriebsfreigabe. GitHub-Veröffentlichung des neuen Nachweises nur nach gesondertem Auftrag |

Die Umschaltung ist **nicht atomar**, ein kurzer Unterbruch ist möglich. Nach einer unklaren oder abgebrochenen Web-FTP-Aktion zuerst den tatsächlichen Zustand klären, nicht blind wiederholen. Bei mehr als 24 Stunden Unterbruch oder einer zwischenzeitlichen Änderung sind Ausgangslage und Sicherung erneut zu bestätigen beziehungsweise zu erneuern. Eine vorhandene vollständige Sicherung wird zuerst geprüft, nicht vorsorglich nochmals kopiert.

## 3 Dauerhafte Plattformgrenze statt erneuter Headerprüfung

Die [Supportantwort und der Betreiberentscheid vom 19.10.2026](hosting-plattformgrenze-header-cache-2026-10-19.md) sind dokumentiert. Der bekannte Sicherheitsheader-/Cachebefund wird **weder vor Upload noch auf Stage, nach Umschaltung oder beim Rückfall erneut geprüft**. Es gibt kein Gate «erneut unverändertes Muster nachweisen» und keine neuen HEAD-/GET-Vergleichsreihen. Historische negative Ergebnisse bleiben negativ.

**R09P-R01** betrifft die konkrete Übernahme dieser bekannten, in der bestehenden Infrastruktur nicht behebbaren Betriebsgrenze für MVP 0.9, ohne neuen Nachweis ihrer unveränderten Ausprägung. Dies ist keine Bestätigung vollständiger Sicherheitsheader, korrekter Cachevorgaben oder genereller Sicherheit des Hostings. Neue Funktions-, Integritäts-, Transport- oder Datenschutzfehler sind nicht gedeckt. Ein neuer konkreter Vorfall wird nicht allein wegen des alten Befunds ignoriert.

HTTPS-, Weiterleitungs-, GET-Inhalts- und Prüfsummenprüfungen sowie Netzwerkkontrollen bleiben aktiv. Die Prüfung, ob tatsächlich das richtige neue Bundle geladen wurde, ist insbesondere nicht mit einer erneuten Cache-Control-Prüfung gleichzusetzen. Es erfolgen keine Hostingkorrektur und kein weiterer Supportauftrag.

## 4 Transport und Stage

Die private Zielbindung trennt neue Sicherungs-, Upload-, Rückfall- und Fehlerbereiche. Vor Benutzung sind die exakten Pfade und freien Zielnamen zu bestätigen. Bei Kollision Halt, keine automatische Ersatzbenennung, kein Überschreiben, Zusammenführen oder Löschen bestehender Bereiche.

Vorgesehene Stage:

`https://www.steimer.ch/fristenrechner-stage-mvp09-02209d0-20261019/`

Die Stage ist **unverlinkt, aber nicht zugriffsgeschützt**. Dort dürfen nur bereits zur Veröffentlichung freigegebene Appdateien und die eng bestimmten bisherigen JS-/CSS-Assets liegen. Eine sichere Nichtindexierung oder Geheimhaltung wird nicht zugesichert. Rootlinks, Sitemap und `robots.txt` bleiben unverändert.

Für noch geöffnete frühere Seiten bleiben ihre gehashten JS-/CSS-Dateien erhalten. Der dokumentierte MVP08-Bestand ergibt **vorläufig 22 Transportdateien**: zwölf neue MVP09-Dateien, acht früher erhaltene Altassets und die beiden bisherigen MVP08-Hauptassets `app-PC545MHL.js` und `app-IEC2YS5E.css`. Die [lokale Prüfung](../../outputs/p-vorbereitung-mvp09-2026-10-19/local-verification.json) bindet alle zehn Zusatzdateien mit Hash und Grösse. Diese historische Ableitung ersetzt keine frische Hostinginventur. Zusätzliche oder abweichende Dateien verlangen Klärung. Bei gleichen Pfaden sind nur gleiche Bytes zulässig.

Der Transportwrapper wird erst aus dem frisch bestätigten Bestand gebildet. Er ist kein Produktbuild und verändert das definitive Web-ZIP nicht. Vor der Umschaltung müssen alle zwölf Kandidatdateien und sämtliche Zusatzassets vom Hosting zurückgelesen und bytegenau geprüft sein. Die App-`.htaccess` ist regulär über den Hostingzugriff zu prüfen, nicht als öffentlich lesbar vorauszusetzen.

Sicherungsarchive, Browserdaten, HAR, Schlüssel, Gitmetadaten und Entwicklungsdateien bleiben ausserhalb des Webroots. Nach erfolgreicher Umbenennung besteht keine separate öffentliche Stage mehr. Bei einem Abbruch vor Umschaltung darf nur der neue Stagebaum in seinen freien privaten Uploadbereich zurückgeführt werden. Keine Löschung bestehender Sicherungen.

## 5 Gebundener Webrückfall

**R09P-H01** erlaubt ausschliesslich die Rückstellung des unmittelbar zuvor gesicherten MVP08-Webbaums. Das M365-Recovery `0.9.0.1` ist dafür ungeeignet und wird nicht verwendet.

1. Bei fehlgeschlagener Umschaltung, falscher Identität oder Bytes, neuen Funktions-/Datenschutzfehlern anhalten und den tatsächlichen Zustand feststellen. Eine serverweite Störung nicht mit wiederholten Ordnerwechseln behandeln.
2. Falls der neue produktive Rechnerbaum bereits vorhanden ist, ihn ohne Löschen in den frisch bestätigten freien privaten Fehlerbereich verschieben. Falls erst der alte Baum verschoben wurde, entfällt dieser Schritt.
3. Den erhaltenen MVP08-Baum aus dem privaten Rückfallbereich auf den jetzt freien bisherigen Produktivpfad zurückstellen. Keine Dateimischung. Ist der alte Baum nicht nutzbar oder das Ziel nicht frei, vor einer andersartigen Wiederherstellung anhalten.
4. Öffentlich App `0.8.0`, Daten `2026-10-15-mvp-08-approved.1`, sämtliche gesicherten Sollbytes samt Altassets, unveränderte Rootressourcen und den Kontrollfall BE/StPO `16.09.2026 + 10 Tage → 28.09.2026` bestätigen. **Kein Header-/Cachevergleich.**
5. Fehler, Rückfall und Grenzen dokumentieren. Kein automatischer zweiter MVP09-Versuch. Sicherungen und Fehlerbelege bleiben privat erhalten.

Beide Releases verwenden Standards Version 5. Browserstandards sind kein Bestandteil des Serverrückfalls. Kein Löschen oder Zurückspielen fremder Präferenzen, kein allgemeiner Browserdatenreset. Neue LU-/ZG-/AR-Präferenzen können nach Rückfall ausserhalb des alten Produktumfangs liegen. Die unveränderte Schutzbehandlung nicht unterstützter Auswahlwerte ist zu beachten, keine erfolgreiche Weiterverwendung solcher Werte behaupten. Eigene Testwerte nach Abschnitt 6 gezielt zurücknehmen.

## 6 Prüfgrenzen und Ausschlüsse

Die [P-Matrix](pruefmatrix-p-mvp09.md) deckt die 25 administrativen Pfade mit sieben zusätzlichen Stadienvarianten, bezeichnete Sperr-/Grenzfälle, Bestandsverfahren, DE/FR, Datumseingabe, Feldhöhe, Standards und zwei tatsächlich gespeicherte Kalenderdateien ab. Sie ist keine neue Quellenfreigabe und kein Nachweis jeder denkbaren Fallkonstellation.

Vor dem ersten Stageaufruf eine eigene frische isolierte Prüfsitzung verwenden. **Stage und P teilen denselben Origin und damit lokale Standards.** Existenz und Rohwerte beider Schlüssel `fristenrechner.defaults.v1` und `fristenrechner.defaults.v5` vor dem ersten Laden festhalten. Nur eigene synthetische Werte verändern, gemeinsame Kontexte seriell bearbeiten und ursprüngliche Werte beziehungsweise Abwesenheit gezielt wiederherstellen. Zwischenzeitlich fremd geänderte Werte nicht überschreiben. Kein originweiter Reset und keine Übertragung der SharePoint-/Teams-Cachetests auf den statischen Build.

Outlook-Wiederverwendung und reale Q-Geräte-/Gastnachweise bleiben begrenzt als solche ausgewiesen. Zwei neue DE-/FR-Kalenderdateien aus P tatsächlich speichern und prüfen, nicht in Outlook importieren. Der akzeptierte B11-H01-Textbefund bleibt bestehen. T06-H01 betrifft die SPFx-Hülle und wird nicht ohne Beobachtung als P-Fehler oder als auf P behoben ausgegeben. VoiceOver ist kein separat erbrachter Nachweis.

Unverändert bleiben Root-Webauftritt, Sitemap, `robots.txt`, Hostingkonfiguration, DNS, E-Mail und Verträge. Die bytegleiche App-`.htaccess` darf mitübertragen werden, aber nicht korrigiert oder erweitert werden. E/Q, AP5, AP21-Testapps, E05, M365-Berechtigungen, Richtlinien und Gäste bleiben unberührt. Keine neuen Produktbuilds, zusätzlichen Commits, GitHub-Pushs oder Löschung bestehender Sicherungen. Historische AP16-Anweisungen zum Neubau, Root-/Sitemap-Ergänzen oder Entfernen des Rootlinks sind für diesen Vollzug nicht anwendbar.

Der reguläre Browserzugriff kann nach Freigabe technisch die Domains `www.steimer.ch`, `my.green.ch`, `auth.green.ch`, `admin.servicehoster.ch` und `webftp.servicehoster.ch` umfassen. Sachlich bleibt er auf den bestehenden Vertrag, dessen reguläre Anmeldung, nötige Sicherung, Rechnerbereitstellung und lesende Rootintegritätsprüfung begrenzt. Andere Vertrags-, Zahlungs-, Mail-, DNS- oder Supportinhalte bleiben ausgeschlossen. Eine erforderliche zusätzliche technische Browserfreigabe wird konkret angefragt, nicht aus einer früheren Sitzung abgeleitet.

## 7 Konkrete Freigabeerklärung

Der folgende Text umfasst **R09P-I01** für den Vollzug, **R09P-R01** für die konkrete Risikoübernahme und **R09P-H01** für den Webrückfall. Der Entscheid, D04/D05 nicht mehr zu wiederholen, liegt bereits vor. Seine erneute Bestätigung ist nicht Voraussetzung dieser Vorlage.

> Ich gebe die P-Bereitstellung von MVP 0.9 gemäss dieser Vorlage, Fassung 1.0 vom 19.10.2026, mit dem unveränderten Webpaket `fristenrechner-mvp09-steimer-web.zip`, 658’325 Bytes, SHA-256 `f7d112b015833251d3d41a5fe418e9f8063fe85aa46e48c1dafbf053031516d3`, auf `https://www.steimer.ch/fristenrechner/` frei. Die private Zielbindung mit SHA-256 `0b4fe02f1fb1d20f175fc1afde184956cf9e00deb9238a7f9ce5fb39adaed72c` ist umfasst, sofern Bestand und Ziele frisch eindeutig bestätigt sind.
>
> Du darfst den aktuellen Website-Nutzbestand frisch privat sichern und vollständig prüfen, den gebundenen Kandidaten mit den eng bestimmten und frisch bestätigten Altassets in den privaten Uploadbereich übertragen und vollständig zurücklesen. Danach darfst du die bezeichnete unverlinkte Stage anlegen und prüfen. Mir ist bewusst, dass sie öffentlich erreichbar und nicht zugriffsgeschützt ist.
>
> Ich akzeptiere für MVP 0.9 die dokumentierte Header-/Cache-Plattformgrenze gemäss Abschnitt 3, ohne erneuten Nachweis ihrer unveränderten Ausprägung. Nach bestandenem Stage-Gate darfst du den beschriebenen nicht atomaren Ordnerwechsel und die öffentliche Prüfmatrix ausführen. Ein kurzer Unterbruch ist möglich. Bei anderen Fehlern darfst du den unmittelbar gesicherten MVP08-Webbaum nach Abschnitt 5 zurückstellen. Bei abweichendem oder ungeklärtem Bestand ist anzuhalten.
>
> Synthetische Fälle, gezielte eigene Testpräferenzen und tatsächlich gespeicherte DE-/FR-Kalenderdateien sind umfasst. Outlook-Importe und allgemeine Browserdatenresets sind ausgeschlossen. Root-Webauftritt, Sitemap, Hostingkonfiguration, E/Q, AP5, M365-Berechtigungen und GitHub bleiben unverändert. Bestehende Sicherungen werden nicht gelöscht. Den Produktionsnachweis legst du mir anschliessend zur endgültigen P-Betriebsfreigabe vor.

David Steimer entscheidet in Personalunion. Codex unterstützt als dokumentiertes KI-Arbeitsinstrument ohne formelle Freigabe- oder Haftungsverantwortung.
