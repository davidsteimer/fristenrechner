# R09-C E-/Q-Installationsvorlage für MVP 0.9

Stand: 18. Oktober 2026. **Lokal vorbereitet, nicht zur Ausführung freigegeben. Installation und Uploads bleiben ausgeschlossen.** Diese Vorlage bindet die vier bestehenden Rechnerinstanzen an die definitiven [R09-B-Artefakte](lokaler-releaseabschluss-mvp09.md), den [Rückfallweg](rueckfall-mvp09.md) und die [Hostprüfmatrix](pruefmatrix-mvp09.md). Der letzte abgeschlossene Betriebsnachweis ist MVP 0.8 vom 16. Oktober. Vor dem späteren Vollzug sind Bestand und Sicherung frisch zu bestätigen.

## 1 Gebundene Pakete und Daten

| Gegenstand | Verbindlicher Kandidat und SHA-256 |
| --- | --- |
| Reguläres Paket | [fristenrechner-schweiz-0.9.0.0.sppkg](../../outputs/release-mvp09-2026-10-18/fristenrechner-schweiz-0.9.0.0.sppkg), 327’130 Bytes, `7a88f0f8f579c050e8354f8e741921251135bff804318f86dc1b34c1a12cc331` |
| Mirror-ZIP | [fristenrechner-mvp09-sharepoint-mirror.zip](../../outputs/release-mvp09-2026-10-18/fristenrechner-mvp09-sharepoint-mirror.zip), 235’314 Bytes, `13ef7f69f555604d987385132eb4ca38ef62b3e7572023ec2310b41de817c73a` |
| Neue Daten | `2026-10-18-mvp-09-approved.1`, Format 9, 42 Dateien, Manifest `3c929779803ceb6bcbf56d44d9a2aad8ece730d916a39ab44016c118bcec2265` |
| Bedingtes Recovery | [fristenrechner-schweiz-recovery-0.9.0.1.sppkg](../../outputs/release-mvp09-2026-10-18/fristenrechner-schweiz-recovery-0.9.0.1.sppkg), 311’609 Bytes, `08c5e67e535cd3e04d962698e7dcb6bbe989f098d75f2b21aebe3226d95db94d`, Funktionsumfang MVP 0.8 |
| Rückfalldaten | `2026-10-15-mvp-08-approved.1`, Format 8, 42 Dateien, Manifest `2461f06c0a7d79dcd6a177fc116f08fcc0efa62e03b38ba6ac87964457c19aa4` |
| Erwartetes Ausgangspaket | `0.8.0.0`, 311’611 Bytes, `d3d06adcd78176db66f8227d884fd66ca2fbcee0bffab66755789dd0cc29dc1a`, vor Vollzug frisch bestätigen |

Im gemeinsamen Tenant-App-Katalog darf später ausschliesslich die **bestehende Datei `fristenrechner-schweiz.sppkg` ersetzt** werden. Keine zusätzliche versionsbenannte Katalogdatei. Solution `13090feb-a6bf-40fa-9d3c-ec8d90516a60`, Feature `3edf1509-41e9-4a2f-8005-df510eec43b6` und Webpart `596c7f1c-4d3e-4da8-a7be-27a96024f37c` bleiben unverändert. Keine zusätzlichen API-Berechtigungen oder automatische Installation auf weiteren Sites.

Das reguläre Hauptbundle lautet `fristenrechner-web-part_472586d6f229161d90a6.js`, SHA-256 `bd7c01bc27868c5d72ad2f92b8468540e46b04b4875cb33dda9e0f3c0adad76f`. Paketversion, installierte Site-App und tatsächlich geladener Code sind getrennt zu prüfen. Der neue GitHub-Datenpin `0ccc4b9178503ede051964149a4b17efab8d0cf9` ist noch nicht veröffentlicht. Die vier E-/Q-Instanzen verwenden ausschliesslich ihre eigenen bytegeprüften Mirrors. Kein Ausweichen auf diesen Pin.

## 2 Vier bestehende Ziele

| Ziel | Bestehende Ansicht | Ausschliesslich vorgesehenes Delta |
| --- | --- | --- |
| E-SP «Fristenrechner Test» | `Fristenrechner-MVP.aspx` | Bestehende App aktualisieren, nur Mirrorpfad im gebundenen Webpart ändern und aktuelle Seite publizieren |
| E-T «Entwicklungsumgebung» | Kanal «Fristenrechner», Registerkarte «Fristenrechner Schweiz – Teams» | Bestehende App aktualisieren, nur Mirrorpfad derselben Registerkarte ändern und speichern |
| Q-SP «Fristenrechner Gastdemo» | Gebundener Rechner auf `Home.aspx` | Erst nach E-Gate bestehende App und Mirrorpfad umstellen, aktuelle Seite publizieren |
| Q-T «Fristenrechner Gastdemo Teams» | Kanal «Fristenrechner», Registerkarte «Fristenrechner Schweiz (1)» | Erst nach E-Gate bestehende App und Mirrorpfad derselben Registerkarte umstellen |

Die private Zielbindung liegt unter `.work/deployments/2026-10-18-eq-mvp09/vorbereitung/targets.private.json`, SHA-256 **`b1d1e7adbe6532c238d42284b9728445c0fbe68461954d6e226803715c3fe146`**. Der dortige `Zielanhang.md` enthält die konkreten Links und alten/neuen Mirrorpfade. Site-, App-, Seiten-, Listenitem-, Webpart- und Tabidentitäten bleiben privat. Datei-UniqueId und Listenitem-GUID sind unterschiedliche Identitäten. Die tatsächliche Zuordnung Teamsregisterkarte → Team/Kanal → SharePoint-Iframe ist vor Vollzug frisch zu bestätigen.

Die Bindung stützt sich auf die tatsächlichen MVP08-Endnachweise, nicht auf den damaligen Vorbereitungsstand: alle vier Apps `0.8.0.0`, eigene Format-8-Mirrors, E-SP-Seite `10.0`, Q-SP-Seite `8.0`, beide Teamsitems `1.0`. Die [Q-Abnahme vom 16. Oktober](abnahme-q-mvp08.md) ergänzt den technischen [Vollzugsnachweis](eq-vollzugsnachweis-mvp08.md). Diese dokumentierten Werte sind noch keine frische Onlinebestätigung. Jede abweichende Identität, Version, Konfiguration oder ungeklärte Fremdänderung hält den Vollzug an.

**Der gemeinsame Katalogwechsel kann sämtliche bereits verbundenen Verbraucher erreichen**, auch Q vor dessen App-/Mirrorumstellung, die historische AP5-Ansicht und allfällige weitere bestehende Verbraucher. «E zuerst» isoliert die Konfigurationsumstellung, nicht die Codeauslieferung. Bei ungeklärter zusätzlicher Wirkung anhalten, keine pauschale Tenantinventur.

## 3 Freigaben und Ablauf

David Steimer entscheidet und nimmt ab. Codex bereitet vor, führt ausschliesslich freigegebene Schritte aus und dokumentiert ohne formelle Freigabe- oder Haftungsverantwortung. Sämtliche folgenden Vollzugsschritte sind noch ausstehend.

| Schritt | Handlung nach entsprechender Freigabe | Erfolgskriterium |
| --- | --- | --- |
| C01 Ausgangssicherung | Gebundene Katalogdatei, Ressourcen, vier aktuelle Instanzen und AP5 lesend prüfen. Paket-/Bundlebytes, Appversionen, vollständige dekodierte Eigenschaften und Canvas-Inhalte, Seiten-/Itemstände, Entwürfe, Tabzuordnung und relevante Berechtigungen privat sichern | Erwarteter MVP08-Bestand eindeutig. Sicherung vollständig, keine ungeklärte Fremdänderung. Keine Roh-ASPX-Sicherung behaupten, wenn nur vollständige REST-Inhalte vorliegen |
| C02 Mirrors | Erst nach **R09C-U01** lädt David die unveränderten Dateien manuell in vier neue, genau bezeichnete Releaseordner hoch | Kein bestehender Inhalt überschrieben, keine zusätzliche Verzeichnisebene und keine Rechteänderung |
| C03 Rohbytevergleich | Je Ziel alle 42 neuen und alle 42 eigenen alten Rückfalldateien zurücklesen. Vollständige Verzeichnisbestände, Referenzen, ursprüngliche Antwortbytes und relevante Berechtigungseinträge vergleichen | **168 neue + 168 Rückfalldateien**, keine fehlenden oder zusätzlichen Dateien. Die lokale Archivprüfung ersetzt diesen Onlinetest nicht |
| C04 Katalog und E | Nur nach geschlossenen **R09C-H01** und **R09C-I01**, bestandenem C01–C03 und unmittelbarer Istbestätigung bestehende Katalogdatei ersetzen. Paket/Bundles und Berechtigungen zurücklesen. Beide vorhandenen E-Apps aktualisieren. Vor jedem Mirrorpfadwechsel T03 vorbereiten: alten Format-8-Cache laden, neuen Cache ausschliessen und exakte Manifestregel prüfen. Erst dann den betreffenden Mirrorpfad umstellen | `0.9.0.0`, fehlerfreie Appzustände und tatsächlicher Code. Vollständiger Eigenschaftsvergleich zeigt ausschliesslich `sharePointMirrorPath` als beabsichtigtes Konfigurationsdelta |
| C05 E-Gate | E-Umfang gemäss Matrix einschliesslich #50 und Kalenderdateien, beide noch unveränderten Q-Hosts unter neuem Code und Format 8 sowie beide historischen AP5-Ansichten prüfen | Alle vorgeschriebenen E-/Vor-Q-/AP5-Prüfungen bestanden. Noch keine Q-Konfigurationsumstellung |
| C06 Q | Erst nach C05 beide vorhandenen Q-Apps aktualisieren. T03 je Host noch vor dessen Mirrorpfadwechsel vorbereiten. Dann ausschliesslich den jeweiligen Mirrorpfad ändern, aktuelle Q-Seite publizieren beziehungsweise aktuelle Q-Registerkarte speichern | Derselbe gebundene Paket-/Datenstand. Vollständige Rücklesung ohne zusätzliches Eigenschaftsdelta |
| C07 Q-Technik | Vollständige Q-Matrix, acht tatsächliche Host-Kalenderdateien zusammenführen und eigene Testzustände gezielt zurücknehmen | Jeder Test separat bestanden, nicht bestanden oder mit Grund nicht ausgeführt. Kein aus E abgeleiteter Q-Gesamtpass |
| C08 Menschliche Abnahme | Reale Geräte-/Gastprüfung und fachliche Q-Abnahme durch David, separate Outlook-Entscheidung | An Paket, Datenrelease und bewertete Restpunkte gebundene ausdrückliche Bestätigung |

Das Mirror-ZIP enthält 42 Dateien direkt ab `manifest.json`, ohne umschliessendes Releaseverzeichnis. Dieser Inhalt gehört je Site in den neuen Ordner `2026-10-18-mvp-09-approved.1`. Die vier Elternordner stehen im privaten Zielanhang. Es wurden keine Remoteordner angelegt oder Dateien hochgeladen. Bei bereits vorhandenem Zielordner oder Ersetzungsfrage anhalten.

Die [lokalen Sollinventare](../../outputs/release-mvp09-2026-10-18/r09c/mirror-inventories.json) binden beide 42-Dateien-Releases. Die historischen 168 MVP08-Rohkopien werden lokal erneut verglichen. Im Vollzug sind dagegen frische Remoteantworten erforderlich. AP5 behält separat seinen alten Pin und seine acht historischen Dateien, nicht einen MVP09-Mirror.

## 4 Speicher und sichere Testvorbereitung

Vor dem ersten eigenen Test im tatsächlichen Speicherkontext Existenz und exakte Rohwerte der vorhandenen Standards sichern. MVP08 und MVP09 teilen Standardsversion 5. Vier Ansichten bedeuten nicht zwingend vier getrennte Speicherpartitionen. Gemeinsam genutzte Kontexte seriell prüfen, fremde oder zwischenzeitlich geänderte Werte nicht überschreiben.

Eine eigene isolierte Prüfsitzung vermeidet Eingriffe in bestehende Benutzerdaten. Für den Fehlabruf vor dem jeweiligen Mirrorpfadwechsel den alten Rechner unter dem neuen Code einmal regulär laden, dessen eigenen Format-8-Cache belegen und das Fehlen des neuen, exakt quellgebundenen Cacheeintrags bestätigen. Die Testvorbereitung muss vor dem Speichern der neuen Mirrorquelle abgeschlossen sein. Die lokale Blockierregel darf nur den konkret gebundenen neuen Manifestrequest treffen und muss vor jedem Reload vollständig kontrolliert sein. Keine breite Regel wie `*://*`. Netzwerknachweis und sichtbare sichere Fehleransicht sind beide erforderlich.

Ist der neue Cache bereits vorhanden, benötigt die gezielte Entfernung selbst eines eigenen Testeintrags eine separat konkret begrenzte Zustimmung. Ein vorübergehender Mirror-Rückwechsel zur Wiederholung ist nicht automatisch freigegeben. Kein allgemeines Löschen von Browserdaten, Cookies, IndexedDB oder fremden Präferenzen. Eigene Netzwerkregeln, Testwerte, Zoom- und Fensteränderungen anschliessend kontrolliert zurücknehmen.

Nur synthetische Fälle und gespeicherte Kalenderdateien. Kein Outlook-Import. Provider, inaktive GitHub-Pins und alle übrigen Webparteigenschaften bleiben erhalten.

## 5 Rückfall und offene Haltepunkte

- **R09C-U01:** manuellen Mirrorupload durch David in genau die vier neuen Zielordner freigeben. Kein automatisierter Uploadauftrag für Codex.
- **R09C-H01:** begrenzten Datenrückfall sowie nötigenfalls vollständigen Code-Rückfall gemäss [gebundener Vorlage](rueckfall-mvp09.md) ausdrücklich billigen.
- **R09C-I01:** konkreten Austausch `0.8.0.0 → 0.9.0.0`, die vier bestehenden Appupdates und ausschliesslichen Mirrorpfadwechsel unter Benennung der gemeinsamen Codewirkung freigeben.

Vor jeder schreibenden Aktion Ziel, Iststand, Sicherung und bestandene Vorbedingungen erneut bestätigen. Bei anderem Katalogstand, abweichenden Bytes, fremdem Entwurf, zusätzlicher Berechtigungsanforderung oder ungeklärtem Fehler anhalten.

Beim vollständigen Rückfall werden **vor dem gemeinsamen Codewechsel alle vier aktuellen Konfigurationen auf ihre eigenen gesicherten Format-8-Mirrors zurückgeführt**. Erst dann darf das gebundene Recovery `0.9.0.1` eingesetzt werden. Es nimmt die LU-/ZG-/AR-Verwaltungswege und die Feldhöhenkorrektur #50 zurück. Nicht unterstützte LU-/ZG-/AR-Standards sowie beschädigte oder künftig unbekannte V5-Inhalte bleiben rohbytegleich geschützt. Bewusstes Speichern oder Zurücksetzen kompatibler Standards kann dagegen den gemeinsam verwendeten V5-Schlüssel ändern. Eine spätere reguläre Wiederaufnahme braucht einen neu gebauten und separat freigegebenen Paketstand höher als `0.9.0.1`.

Historische AP5-Seite, Entwurf `1.2` und Pin bleiben unverändert. Keine Deinstallation, neue Site oder Registerkarte, AP21-/E05-Änderung, zusätzlichen Gäste oder M365-Rechte-/Richtlinienänderung. GitHub, P, Root-Webauftritt, Sitemap, DNS, E-Mail und Hosting bleiben ausgeschlossen. Die [Outlook-Wiederverwendung](outlook-wiederverwendung-mvp09.md) bleibt ein gesonderter offener Entscheid.

## 6 Vorgeschlagene spätere Freigabe

**Entwurf, nicht erteilt.** Freigabe erst anhand dieser Dokumente und der separat vorgelegten Prüfsumme der vollständigen Vorlagenbindung.

> Ich gebe R09C-U01, R09C-H01 und R09C-I01 gemäss der gebundenen R09-C-Vorlage frei. Der erste Schritt ist die frische Ausgangssicherung C01. Den anschliessenden manuellen Upload der unveränderten MVP09-Mirrors in die vier neuen gebundenen Releaseordner übernehme ich. Kein Mirrorupload durch Codex, kein Überschreiben bestehender Daten und keine Rechteänderung.
>
> Ich gebe den Austausch der bestehenden Katalogdatei `fristenrechner-schweiz.sppkg` vom frisch bestätigten Stand `0.8.0.0` auf `0.9.0.0`, SHA-256 `7a88f0f8f579c050e8354f8e741921251135bff804318f86dc1b34c1a12cc331`, frei. Die gemeinsame Codewirkung auf sämtliche bereits verbundenen Verbraucher einschliesslich Q vor dessen Umstellung und AP5 ist mir bekannt. Keine automatische oder zusätzliche Siteinstallation.
>
> Der Vollzug bleibt auf die vier bestehenden Rechnerinstanzen gemäss privater Zielbindung `b1d1e7adbe6532c238d42284b9728445c0fbe68461954d6e226803715c3fe146` und deren frischer eindeutiger Bestätigung begrenzt. Websiteinhalte und Appdetails dürfen ausschliesslich für diese bestehenden Appupdates geöffnet werden. Vor dem Katalogwechsel müssen C01 bis C03 bestanden und der Rückfallpunkt H01 geschlossen sein.
>
> Zuerst dürfen die beiden E-Apps aktualisiert und ausschliesslich ihre Mirrorpfade auf `2026-10-18-mvp-09-approved.1` umgestellt werden. Erst nach bestandenem E-Gate folgen die beiden Q-Apps und deren Mirrorpfade. Nur die hierfür erforderlichen aktuellen SharePoint-Seiten dürfen publiziert und die bestehenden aktuellen Teamsregisterkarten gespeichert werden. Die gebundene technische Matrix mit eigenen synthetischen Testpräferenzen, eng begrenzten lokalen Netzwerktests und tatsächlich gespeicherten Kalenderdateien ist umfasst. Outlook-Importe, allgemeine Browserdatenresets und das Löschen von Cacheeinträgen sind nicht umfasst.
>
> Ich billige den begrenzten Datenrückfall und nötigenfalls den vollständigen Rückfall mit `0.9.0.1`, SHA-256 `08c5e67e535cd3e04d962698e7dcb6bbe989f098d75f2b21aebe3226d95db94d`, auf die jeweils eigenen gesicherten Format-8-Mirrors. Vor dem Recovery-Codewechsel müssen alle vier aktuellen Konfigurationen auf Format 8 stehen. AP5-Pin, historischer Entwurf und geschützte Standards-v5-Rohwerte bleiben erhalten. Die gemeinsame Codewirkung, der Rückfall auf MVP08 einschliesslich Rücknahme der LU-/ZG-/AR-Verwaltungswege und der Feldhöhenkorrektur sowie der danach erforderliche höhere Paketstand für eine reguläre Wiederaufnahme sind mir bekannt.
>
> Bei abweichendem Bestand oder ungeklärtem Fehler ist anzuhalten. Reale Geräte-/Gastprüfung und manuelle Q-Abnahme bleiben bei mir. Berechtigungen, Richtlinien, zusätzliche Gäste, AP21-Testapps, E05, GitHub und P bleiben unverändert. Weitere Builds, Commits, Publikationen oder Betriebsfreigaben sind nicht umfasst.

Die [maschinenlesbare Vorlagenbindung](../../outputs/release-mvp09-2026-10-18/r09c/proposal.json) und die [lokale Vorlagenprüfung](../../outputs/release-mvp09-2026-10-18/r09c/proposal-verification.json) binden Dokumente, tatsächliche Artefakte, private Zielprüfsumme und Sollinventare. Sie erteilen keine Vollzugsfreigabe.
