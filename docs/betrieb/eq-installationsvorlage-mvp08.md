# R08-C E-/Q-Installationsvorlage für MVP 0.8

Stand: 15. Oktober 2026. **Lokal vorbereitet, noch nicht zur Ausführung freigegeben. Installation und Uploads sind ausgeschlossen.** R08-B ist [lokal abgeschlossen](releaseartefakte-mvp-08.md). Diese Vorlage bindet die vier bestehenden Rechnerinstanzen, die konkreten Paketbytes, den [Rückfallweg](rueckfall-mvp08.md) und die [Prüfmatrix](pruefmatrix-mvp08.md). Eine frische Onlinebestandsaufnahme gehört erst zum gesondert freizugebenden Vollzug.

## 1 Gebundene Pakete und Daten

| Gegenstand | Verbindlicher Kandidat und SHA-256 |
| --- | --- |
| Reguläres Paket | [fristenrechner-schweiz-0.8.0.0.sppkg](../../outputs/release-mvp08-2026-10-15/fristenrechner-schweiz-0.8.0.0.sppkg), 311’611 Bytes, `d3d06adcd78176db66f8227d884fd66ca2fbcee0bffab66755789dd0cc29dc1a` |
| Mirror-ZIP | [fristenrechner-mvp08-sharepoint-mirror.zip](../../outputs/release-mvp08-2026-10-15/fristenrechner-mvp08-sharepoint-mirror.zip), 225’952 Bytes, `81359611b5399b1b79c0f9dedb0d5ac540c9192a1382feb67095dadb8e89f8dd` |
| Neue Daten | `2026-10-15-mvp-08-approved.1`, Format 8, 42 Dateien, Manifest `2461f06c0a7d79dcd6a177fc116f08fcc0efa62e03b38ba6ac87964457c19aa4` |
| Bedingtes Recovery | [fristenrechner-schweiz-recovery-0.8.0.1.sppkg](../../outputs/release-mvp08-2026-10-15/fristenrechner-schweiz-recovery-0.8.0.1.sppkg), 291’892 Bytes, `8e387297d43df28e2fe4d3c7c9ae239bb2cdc6a9e3216e4c59c928c50d950e7b`, Funktionsumfang MVP 0.7 |
| Rückfalldaten | `2026-10-08-mvp-07-approved.1`, Format 7, 41 Dateien, Manifest `fe1dfa0a241ac1c0e083998f05fb43e058f3c1be223f35cd276d3df436941597` |

Im gemeinsamen Tenant-App-Katalog wird später ausschliesslich die bestehende Datei **`fristenrechner-schweiz.sppkg` ersetzt**, nicht eine zweite versionsbenannte Datei hinzugefügt. Unveränderte Identitäten: Solution `13090feb-a6bf-40fa-9d3c-ec8d90516a60`, Feature `3edf1509-41e9-4a2f-8005-df510eec43b6`, Webpartkomponente `596c7f1c-4d3e-4da8-a7be-27a96024f37c`. Keine zusätzlichen API-Berechtigungen und keine automatische Installation auf weiteren Sites.

Das reguläre Hauptbundle ist `fristenrechner-web-part_fd4b17d5240d07537196.js`, SHA-256 `e60d4419f23621e41c32b9fe0eecc4021057fa6792fe646fdea701cfc262bd4a`. Paket-, Site-App- und tatsächlich geladener Bundlestand sind getrennt zu prüfen. Der lokale GitHub-Datenpin ist noch nicht veröffentlicht. E/Q verwenden ausschliesslich ihre eigenen bytegeprüften Mirrors, kein Ausweichen auf den neuen Pin.

## 2 Vier bestehende Ziele

| Ziel | Bestehende Ansicht | Vorgesehenes begrenztes Delta |
| --- | --- | --- |
| E-SP «Fristenrechner Test» | `Fristenrechner-MVP.aspx` | Vorhandene App aktualisieren, im gebundenen Rechner nur den Mirrorpfad wechseln, aktuelle Seite publizieren |
| E-T «Entwicklungsumgebung» | Kanal «Fristenrechner», Registerkarte «Fristenrechner Schweiz – Teams» | Vorhandene App aktualisieren, nur den Mirrorpfad in derselben Registerkarte ändern und speichern |
| Q-SP «Fristenrechner Gastdemo» | Gebundener Rechner auf `Home.aspx` | Erst nach E-Gate vorhandene App und Mirrorpfad umstellen, aktuelle Seite publizieren |
| Q-T «Fristenrechner Gastdemo Teams» | Kanal «Fristenrechner», Registerkarte «Fristenrechner Schweiz (1)» | Erst nach E-Gate vorhandene App und Mirrorpfad in derselben Registerkarte umstellen |

Die neue private Zielbindung liegt unter `.work/deployments/2026-10-15-eq-mvp08/vorbereitung/targets.private.json`, SHA-256 **`b402ad864da468baef7e533db4225df3f553adaf7ddca416f253accb04b7e256`**. `Zielanhang.md` im selben Ordner enthält die konkreten Links und alten/neuen Mirrorpfade. Site-, App-, Datei-, Listenitem-, Tab- und Webpartinstanz-IDs bleiben dort privat. Datei-UniqueId und Listenitem-GUID sind ausdrücklich verschiedene Identitäten. Die aktuelle Zuordnung von Teamsregisterkarte, Team, Kanal und tatsächlichem SharePoint-Iframe ist vor dem Vollzug frisch zu bestätigen, nicht anhand des Namens zu erraten.

Die [letzte dokumentierte Installation](eq-vollzugsnachweis-mvp07-0702.md) und [Q-Abnahme](abnahme-q-mvp07.md) stammen vom 9. Oktober: Katalog und alle vier Apps `0.7.0.2`, jeweils eigener Format-7-Mirror. Die frühere Zielvorlage und damalige Q-Zwischenstände werden nicht als heutiger Zustand übernommen. Vor Ausführung muss genau dieser Ausgangsbestand frisch bestätigt und gesichert werden. Jede Abweichung führt zum Halt.

**Der gemeinsame Katalogwechsel kann sofort alle verbundenen Verbraucher erreichen**, auch Q vor dessen App-/Mirrorumstellung, die historische AP5-Ansicht und allfällige weitere bestehende Verbraucher. E zuerst ist keine isolierte Codeauslieferung. Eine ungeklärte zusätzliche Codewirkung verlangt einen Entscheid, keine pauschale Tenantinventur.

## 3 Freigaben und Ablauf

Alle nachfolgenden Vollzugsschritte stehen noch aus. David entscheidet in Personalunion. Codex bereitet vor, vollzieht nur ausdrücklich freigegebene Schritte und dokumentiert ohne formelle Freigabe- oder Haftungsverantwortung.

| Schritt | Handlung nach entsprechender Freigabe | Erfolgskriterium |
| --- | --- | --- |
| C01 Ausgangssicherung | Nur gebundene Katalogdatei, Assets und vier Rechnerinstanzen lesend prüfen. Versionen, Paket-/Bundlebytes, vollständige Eigenschaften, Seiten-/Itemstände, allfällige Entwürfe und relevante Berechtigungen privat sichern. AP5-Pin und historischen Entwurf mit erfassen | Erwarteter Bestand `0.7.0.2` eindeutig, Sicherung jeder tatsächlich betroffenen Ansicht vollständig, keine ungeklärte Fremdänderung |
| C02 Mirrors | Erst nach **R08C-U01** manueller Upload durch David in vier neue, genau bezeichnete Releaseordner. Vorhandene Daten und Rechte unverändert | Nur Inhalt des freigegebenen ZIP, keine alten Dateien überschrieben |
| C03 Byteprüfung | Alle 42 neuen Dateien je Ziel zurücklesen, insgesamt **168**. Zusätzlich alle 41 vorhandenen Format-7-Rückfalldateien je Ziel zurücklesen, insgesamt **164**. Referenzen und tatsächlichen Verzeichnisbestand vergleichen | Alle Sollbytes vollständig, keine fehlenden oder zusätzlichen Dateien. Die lokale Archivprüfung ersetzt diesen Onlinetest nicht |
| C04 Katalog und E | Nur nach geschlossenen **R08C-I01** und **R08C-H01**, bestandenen C01–C03 und unmittelbar bestätigtem Iststand Katalogdatei ersetzen. Paket/Bundles und unveränderte Rechte zurücklesen. Beide bestehenden E-Apps aktualisieren. Deren Mirrorpfade einzeln auf MVP08 wechseln | Version `0.8.0.0`, Appzustände fehlerfrei. Vollständiger Konfigurationsvergleich zeigt ausschliesslich `sharePointMirrorPath` als fachliches Delta |
| C05 E-Gate | Technische E-Prüfungen und fachliche Stichproben gemäss Matrix, beide AP5-Ansichten und gemischten Zustand mit Q/Format 7 prüfen | E-Gate dokumentiert bestanden. Q-Konfigurationen noch unverändert, AP5 weiterhin alter Pin |
| C06 Q | Erst nach C05 beide bestehenden Q-Apps aktualisieren. Nur ihre Mirrorpfade ändern, aktuelle Q-Seite publizieren beziehungsweise vorhandene Q-Registerkarte speichern | Derselbe Paket-/Bundle-/Datenstand, vollständiger Eigenschaftsvergleich ohne weiteres Delta |
| C07 Q-Technik | Vollständige Q-Matrix, tatsächliche Kalenderdateien, Bereinigung ausschliesslich eigener Testzustände | Jeder Test separat bestanden oder ausdrücklich offen. Kein aus E abgeleiteter Q-Gesamtpass |
| C08 Menschliche Abnahme | Reale Geräte-/Gastprüfung und fachliche Q-Abnahme durch David | An konkretes Paket, Datenrelease und bewertete Restpunkte gebundene Bestätigung |

Das ZIP enthält die 42 Laufzeitdateien **direkt ab `manifest.json`**, ohne umschliessendes Releaseverzeichnis. Sein Inhalt gehört in jeden neuen Ordner `2026-10-15-mvp-08-approved.1`, nicht in eine zusätzliche verschachtelte Ebene. Der private Zielanhang bezeichnet alle vier Elternordner. Es wurden noch keine Remoteordner angelegt oder Dateien hochgeladen.

Die [gebundenen Inventare](../../outputs/release-mvp08-2026-10-15/r08c/mirror-inventories.json) enthalten Sollbytes für beide Datenreleases. Die 164 vorhandenen lokalen Rückfallkopien wurden erneut geprüft. Frisch gelesene Remoteantworten, vollständige Eigenschaften, Rechte und Screenshots werden im Vollzug privat archiviert, nicht in öffentliche Nachweise kopiert. Nur auf die Rechnerressourcen begrenzte, bereinigte Netzwerkbelege verwenden.

Vor der **ersten Format-8-Ansicht** im jeweiligen Speicherkontext eigene Standards sichern. Schon der erste Ladevorgang kann einen v5-Wert erzeugen. Kein globales Löschen von Browserdaten, IndexedDB oder fremden Präferenzen. Nur eigene synthetische Tests, gespeicherte Kalenderdateien ohne Outlook-Import. Provider, inaktive GitHub-Pins und alle übrigen Eigenschaften bleiben erhalten.

## 4 Offene Haltepunkte

- **R08C-U01:** manueller Upload der vier neuen Mirrors gesondert freigegeben. Kein automatisierter Uploadauftrag aus dieser Vorlage.
- **R08C-H01:** bedingter Daten- und Code-Rückfall gemäss gesondertem Rückfalldokument durch David ausdrücklich gebilligt. Lokal bestandene Pakettests schliessen diesen betrieblichen Haltepunkt nicht.
- **R08C-I01:** konkreter Katalog-/App-/Konfigurationswechsel einschliesslich gemeinsamer Codewirkung ausdrücklich freigegeben.
- **Vor jedem schreibenden Schritt:** Ziel, Istversion, Sicherung und bereits bestandene Vorbedingungen frisch bestätigen. Bei fremdem Entwurf, anderer Identität, abweichenden Bytes, zusätzlicher Berechtigungsanforderung oder ungeklärtem Fehler anhalten.

Keine Deinstallation, keine neue Site-/Tab-Anlage, keine AP21-Testapp-/E05-Änderung, keine zusätzlichen Gäste und keine M365-Rechte- oder Richtlinienänderung. Historische AP5-Seite, Entwurf und Pin bleiben unverändert. GitHub, steimer.ch-P, Root-Webauftritt, Sitemap und Hosting bleiben ausserhalb von R08-C. Der [Outlook-Wiederverwendungsentscheid](outlook-wiederverwendung-mvp08.md) bleibt separat offen. Frühere Zustimmungen gelten nicht automatisch weiter.

## 5 Vorgeschlagener späterer Freigabetext

**Entwurf, nicht erteilt.** Dieser Text kann erst zusammen mit der separat vorgelegten Prüfsumme der vollständigen Vorlage bestätigt werden.

> Ich gebe R08C-I01 für den Austausch der bestehenden Katalogdatei `fristenrechner-schweiz.sppkg` vom frisch bestätigten Stand `0.7.0.2` auf `0.8.0.0`, SHA-256 `d3d06adcd78176db66f8227d884fd66ca2fbcee0bffab66755789dd0cc29dc1a`, frei. Die gemeinsame Codewirkung auf sämtliche bereits verbundenen Verbraucher einschliesslich Q vor dessen Umstellung und AP5 ist mir bekannt. Keine automatische oder zusätzliche Siteinstallation.
>
> Der Vollzug ist auf die vier bestehenden Rechnerinstanzen gemäss privater Zielbindung `b402ad864da468baef7e533db4225df3f553adaf7ddca416f253accb04b7e256` und deren frischer eindeutiger Bestätigung begrenzt. Websiteinhalte und Appdetails dürfen ausschliesslich für diese bestehenden Appupdates geöffnet werden. C01 bis C03 müssen bestanden sein. Ein Mirrorupload durch Codex ist nicht umfasst. Den manuellen Upload durch mich gebe ich mit R08C-U01 gesondert frei.
>
> Zuerst sind die beiden E-Apps und ausschliesslich ihre Mirrorpfade auf `2026-10-15-mvp-08-approved.1` umzustellen. Erst nach bestandenem E-Gate folgen die beiden Q-Apps und deren Mirrorpfade. Nur die dafür nötigen aktuellen SharePoint-Seiten dürfen publiziert und die vorhandenen aktuellen Teamsregisterkarten gespeichert werden. Die begrenzte Matrix einschliesslich eigener synthetischer Testpräferenzen, eng begrenzter lokaler Netzwerktests und tatsächlich gespeicherter Kalenderdateien ist umfasst, Outlook-Importe nicht.
>
> Ich schliesse R08C-H01 und billige den in `rueckfall-mvp08.md` gebundenen Datenrückfall sowie nötigenfalls den vollständigen Rückfall mit Paket `0.8.0.1`, SHA-256 `8e387297d43df28e2fe4d3c7c9ae239bb2cdc6a9e3216e4c59c928c50d950e7b`, auf die jeweils eigenen gesicherten Format-7-Mirrors. Vor dem Recovery-Codewechsel müssen alle vier aktuellen Konfigurationen auf Format 7 stehen. AP5-Pin und v5-Rohwerte bleiben erhalten. Kein Browserdatenreset. Die gemeinsame Codewirkung, der Rückfall auf MVP07-Funktionalität und ein erneut höherer Paketstand für eine spätere reguläre Wiederaufnahme sind mir bekannt.
>
> Bei abweichendem Bestand oder ungeklärtem Fehler ist anzuhalten. Reale Geräte-/Gastprüfung und manuelle Q-Abnahme bleiben bei mir. Berechtigungen, Richtlinien, zusätzliche Gäste, AP21-Testapps, E05, GitHub und P bleiben unverändert. Zusätzliche Commits, weitere Builds und Betriebsfreigaben sind nicht umfasst.

Die [maschinenlesbare Vorlagenbindung](../../outputs/release-mvp08-2026-10-15/r08c/proposal.json) und ihre [lokale Prüfung](../../outputs/release-mvp08-2026-10-15/r08c/proposal-verification.json) binden Dokumente, Artefakte und private Zielprüfsumme. Sie erteilen keine der vorstehenden Vollzugsfreigaben.
