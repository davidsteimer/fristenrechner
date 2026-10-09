# MVP 0.7 Produktionsbereitstellung vom 9. Oktober 2026

**MVP 0.7 ist auf der öffentlichen Rechneradresse bereitgestellt. Die funktionalen Produktionsprüfungen sind abgeschlossen. Die unveränderten Header- und Cacheabweichungen bleiben unter dem ausdrücklich auf MVP 0.7 erstreckten Risikoentscheid dokumentiert. D04 und der strikte D05-Test sind damit nicht bestanden.**

Dieser Vollzugsnachweis ergänzt das [Publikationspaket](publikationspaket-mvp07.md), den [Deploymentplan](deployment-mvp-07.md) und die [Q-Abnahme](abnahme-q-mvp07.md). Eingefrorene Unterlagen und Releaseartefakte bleiben unverändert. David Steimer hat am 9. Oktober 2026 die zusätzliche Veröffentlichung dieses Nachtrags auf GitHub gesondert beauftragt.

## Auftrag und Releasebindung

David Steimer hat die gebundene GitHub-Publikation und die anschliessende P-Bereitstellung mit frischer Sicherung, Vorprüfung, öffentlicher Prüfmatrix und Rückfall bei anderen Fehlern freigegeben. Root-Webauftritt, Sitemap und Hostingkonfiguration blieben unverändert. Ebenso unverändert blieben E/Q, M365-Berechtigungen, historische AP5-Pins und die separaten AP21-Testapps.

| Merkmal | Nachgewiesener Stand |
| --- | --- |
| Öffentliche Adresse | [Fristenrechner Schweiz](https://www.steimer.ch/fristenrechner/) |
| Anwendung | `0.7.0` |
| Zugehöriger korrigierter SPFx-Stand | `0.7.0.2`, separat auf E/Q abgenommen |
| Datenrelease | `2026-10-08-mvp-07-approved.1` |
| Datenvertrag | Manifest und Mindestconsumer `7.0.0`, Feiertagskatalog `2.0.0`, Regelkalender `3.0.0` |
| Veröffentlichter Datencommit | `331ef3e19d43a6b51d91a502acd6b5443071599f` |
| Veröffentlichter Publikationscommit | `37e263156658498df350dd12989cd246f99cc219` |
| Datenmanifest SHA-256 | `fe1dfa0a241ac1c0e083998f05fb43e058f3c1be223f35cd276d3df436941597` |
| Definitives Webarchiv | `fristenrechner-mvp07-steimer-web-corrected-0702.zip`, 606’775 Bytes |
| Webarchiv SHA-256 | `9f986c7d8f8d6366914f9605f46b2fd87987fcbdaf17875ce9d2c4d044b07228` |

Es wurde kein neuer Produktbuild erstellt. Nationale Feiertagskalender und die AP21-Datumseingabe sind im freigegebenen Umfang aktiv. Daraus folgen weder eine ausserbernische Sozialfreigabe noch zusätzliche kantonale Verwaltungsverfahren. Die Sozialfreigaben bleiben auf 2026–2027 begrenzt. Januargrenzen sowie die getrennten GR-/NE-Vorbehalte bleiben wirksam.

## GitHub und temporärer Schlüssel

Die zwei freigegebenen Commits wurden auf `main` veröffentlicht. Der anonyme öffentliche Nachvergleich bestätigte den Zielcommit, den Datenpin und sämtliche 2’840 gebundenen Dateien einschliesslich der Positivliste. Die Positivliste blieb byteidentisch mit SHA-256 `853da10ccc03d221364ee00cb84dc7b35675123f9343d73f7aa7d8763b311df6`.

Der temporäre Deploy-Key wurde anschliessend auf GitHub entfernt. Ein isolierter SSH-Versuch mit diesem Schlüssel wurde abgewiesen. Danach wurden die lokalen temporären Schlüsseldateien entfernt. Im damaligen Zwei-Commit-Releasevollzug wurden keine weiteren Commits, Tags, GitHub-Releases oder Issueänderungen vorgenommen. Der anschliessend gesondert beauftragte Nachweis ist ein reiner Dokumentationsnachtrag.

## Sicherung und Umschaltung

Der tatsächliche Website-Nutzbestand wurde vor dem Eingriff neu gesichert. Das heruntergeladene ZIP umfasst 46 Dateien, 3’692’152 Bytes und SHA-256 `e892ce3befb2e4c4c21739f77e948870e177dee6019c5f8c076f185cf0113df7`. CRC, sichere eindeutige Pfade, die zwölf bisherigen MVP06-Dateien, vier ältere Assets, elf erfasste Rootressourcen sowie Root- und App-Konfiguration wurden geprüft. Die Sicherung bleibt privat und ist nicht Bestandteil der GitHub-Publikation.

Beim Kopieren und Archivieren meldete WebFTP zunächst Zeitüberschreitungen. Diese Zwischenmeldungen wurden nicht als Erfolg behandelt. Die frische Bestandskontrolle und der vollständige Bytevergleich des tatsächlich heruntergeladenen Archivs klärten den Endzustand. Eine regulär abgelaufene WebFTP-Sitzung wurde über die bestehende Hostingverwaltung erneuert. Zugangsdaten, Rechte und Sicherheitsvorgaben wurden nicht geändert.

Der Transportwrapper enthielt zwölf unveränderte Kandidatdateien und sechs verifizierte ältere JS-/CSS-Dateien für bereits geöffnete Seiten. Sein SHA-256 lautet `5b1087f0b508cf7ddbd27cb3f0c572029f0981cd8396b0d41d8935204593ed4b`. Zuerst erfolgte der Upload ausserhalb des Webroots. Ein heruntergeladenes Rücklesearchiv bestätigte alle 18 Dateien bytegenau.

Anschliessend wurde diese Kopie an einer unverlinkten, aber öffentlich erreichbaren Stageadresse geprüft. Diese Stage war nicht zugriffsgeschützt. Sie lieferte die erwarteten 17 öffentlichen Dateien. Die zusätzlich heruntergeladene tatsächliche App-`.htaccess` entsprach mit 1’165 Bytes und SHA-256 `22b8447d9ecc5f709ee0362ba23e813b2ca124bd563b2cf62e57961aaae6b4e8` ebenfalls dem Kandidaten. Die deutschen und französischen Stage-Referenzfälle ergaben den 28.09.2026 beziehungsweise den 09.12.2026.

Der bisherige produktive Rechnerbaum wurde danach reversibel in einen privaten Rückfallbereich verschoben. Ausschliesslich die geprüfte Stage wurde auf den produktiven Rechnernamen umbenannt. Der frische öffentliche Bytevergleich bestätigte MVP 0.7. Es blieb keine separate öffentliche Stage zurück. **Die Umschaltung war nicht atomar. Eine genaue Unterbruchsdauer wurde nicht gemessen.** Der alte MVP06-Rechnerbaum und die Sicherungen bleiben erhalten. Ein Rückfall war nicht erforderlich.

## Öffentliche HTTP Prüfung und Restrisiko

Nach der Umschaltung bestätigten die gebundenen HTTP-Berichte:

- HTTP 200 auf der kanonischen Rechneradresse.
- Bytegleichheit sämtlicher elf öffentlich lesbarer Kandidatdateien und sechs erhaltener Altassets.
- Drei Weiterleitungsvarianten mit jeweils einem 301-Schritt auf die kanonische HTTPS-Adresse und dort HTTP 200.
- Unveränderte Bytes aller elf zuvor erfassten Rootressourcen einschliesslich Sitemap.
- Das unveränderte bekannte Header-/Cachemuster in 16 rollen- und methodengebundenen Beobachtungen.

Der erste Vergleich vor dem Eingriff enthielt bei einem JS-HEAD-Abruf eine Abweichung von einer Sekunde zwischen `Expires` und `Date`. Dieser fehlgeschlagene Zwischenbefund bleibt erhalten. Eine unveränderte Wiederholung und die weitere Prüfung vor der Umschaltung erfüllten sämtliche 16 Vergleichskriterien. Es wurde keine Toleranz ergänzt. Auch der produktive Nachvergleich erfüllte alle 16 Kriterien für das bekannte Muster.

**D04 bleibt nicht bestanden.** Sicherheitsheader fehlen weiterhin bei bestimmten GET-Antworten, obwohl HEAD sie liefert. Ursache und Behebung werden nicht behauptet.

**D05 bleibt mit akzeptierter Restabweichung dokumentiert.** Die vorgesehenen Cachevorgaben sind vorhanden, die bekannte gleichlautende doppelte Altersangabe besteht fort. Der strikte Cachetest ist deshalb nicht bestanden. Die Risikoakzeptanz deckt nur das nachgewiesene unveränderte Muster, keine neuen oder widersprüchlichen Abweichungen.

## Tatsächliche Browserprüfung auf P

Die fachlichen Proben wurden in Chrome auf der tatsächlichen produktiven Rechneradresse ausgeführt. 41 gespeicherte Beobachtungen umfassen die Fälle F01 bis F09, die vorgeschriebenen französischen Wiederholungen und die AP21-Bedienproben. Das sind gezielte Hoststichproben, keine erneute Vollprüfung aller Fachregeln.

| Fallgruppe | Beobachtetes Ergebnis |
| --- | --- |
| F01 BE/StPO | 16.09.2026 plus zehn Tage → 28.09.2026, DE und FR |
| F02 TI/StPO | 07.12.2026 plus ein Tag → 09.12.2026, DE und FR |
| F03 Januarvergleich | SH/StPO, SG/StPO, SG/BGG und SG/VwVG: 01.01.2029 plus ein Tag ergibt die Varianten 02./03.01.2029, ohne definitives Ergebnis oder Export. SG/StPO zusätzlich FR. Bei BGG/VwVG wurde die vorsorgliche Massnahme ausdrücklich gewählt |
| F04 Gleiche Januarergebnisse | Dieselben vier Bindungen mit 01.01.2027 plus ein Tag → jeweils 04.01.2027 |
| F05 NE | 26.05.2027 plus ein Tag: offene Le-Landeron-Frage sperrt, Nein → 27.05., Ja → 28.05. Jahres-/Ortsvorbehalt sichtbar |
| F06 GR und ZPO | GR/StPO → 28.09.2026 mit GR-Vorbehalt. ZPO summarisch, Kalender BE → 28.09.2026 mit festem Gerichtssitzbezug |
| F07 Fehlende Fakten und Untergrenze | Fehlende Rolle, fehlender Kanton, offene AI-Regionalfrage und 28.08.2026 plus ein Tag sperren. 29.08.2026 plus ein Tag → 31.08.2026. Beim Entfernen der Rolle wurde auch der abhängige Kanton geleert. Dies ist keine isolierte Nur-Rollen-Probe |
| F08 Berner Recht | Allgemeines VRPG, 04.09.2026 plus zehn Tage → 14.09.2026. Vollständige EOG-Einsprache mit separaten BE-Anknüpfungen, 16.09.2026 plus gesetzliche 30 Tage → 16.10.2026. Beide zusätzlich FR |
| F09 Sozialgrenzen | EOG mit fehlendem spezifischem Wohnsitzkanton, mit ZH und vollständiger BE-Fall ab 18.11.2027 über die Zeitgrenze hinaus jeweils ohne definitives Ergebnis oder Export |

Die Datumsprobe startete ohne vorbelegtes Empfangsdatum. `h` mit Enter ergab den 09.10.2026, `5` mit Tab den 05.10.2026, `12.10` bei Fokuswechsel den 12.10.2026. Ein ungültiges Februardatum wurde beanstandet. Die unbestätigte Änderung eines zuvor berechneten Datums entfernte Ergebnis und Export sofort. Kalender- und Hilfedialog wurden geöffnet und wieder geschlossen. Eine neue Datumswahl im Kalenderdialog wird daraus nicht abgeleitet. Reale iOS-Gerätetests und der akzeptierte Magic-Keyboard-Befund bleiben Teil der gesonderten E/Q-Abnahme.

### Kalenderdateien und Outlook

Zwei Dateien wurden tatsächlich aus P gespeichert und unabhängig gegen die Exportsemantik geprüft:

| Datei | Bytes | SHA-256 |
| --- | ---: | --- |
| DE, Fristablauf 28.09.2026 | 668 | `51791d0f1545990b56017e3607bbb6d41645dbc1fec2b1a1245c78f1766c0120` |
| FR, Fristablauf 09.12.2026 | 700 | `1a50d27e3493e2da45b46c08fe556c6f1fa102bc43cb7f5f28e7eaa84ee35802` |

Bestätigt sind ganztägige Termine mit exklusivem Folgetag, freie Verfügbarkeit, Kategorie `Fristablauf`, Erinnerung `-PT112H`, synthetische Referenzen, Sprachfassung, unterschiedliche UIDs, UTF-8 und korrekte Zeilenstruktur. Es erfolgte kein Outlook-Import. Der [ausdrücklich bestätigte Wiederverwendungsvorschlag](outlook-wiederverwendung-mvp07.md) bleibt davon getrennt. Die tatsächliche Outlook-Kategorienfarbe oder Erinnerungszustellung wird durch diese Dateien allein nicht nachgewiesen.

### Netzwerk und Datenschutz

Der bereinigte HAR-Export des echten P-Neuladens enthält acht GET/200-Antworten für sieben eindeutige statische URLs, ausschliesslich aus dem gleichursprünglichen Rechnerpfad. Keine API-, XHR-/Fetch-, Tracking- oder Drittursprungsanfrage ist darin enthalten. Sämtliche acht Antwortinhalte stimmen mit den eingefrorenen Builddateien überein. Browsererweiterungsressourcen sind keine Ressourcen der Anwendung und werden ihr nicht zugerechnet.

Das Ladefenster liegt am 9. Oktober 2026 zwischen 18:40:46 und 18:40:48 Uhr Zürich. Fünf Ressourcen kamen aus dem Memorycache, die beiden Faviconantworten aus dem Diskcache. Nur das HTML-Dokument hat eine positive Transfergrösse. Dies ist kein vollständig ungecachter Abrufnachweis sämtlicher Ressourcen. Die gesonderten HTTP-Bytevergleiche ergänzen ihn. Ein bereinigter HAR belegt nicht, ob der Browser vor der Bereinigung Credentials gesendet hat. Er wird nicht öffentlich publiziert.

Der vorhandene eigene Standardswert wurde vor der Prüfung privat gesichert. Eine synthetische Version-3-Präferenz wurde kontrolliert eingesetzt. Explizites Speichern erzeugte Version 4, ohne Rolle oder Feiertagskanton zu erfinden. Im anschliessenden vollständigen NE-Fall wurden Datum, regionale Fallantwort, Referenz und Ergebnis nicht mitgespeichert. Nach dem Neuladen blieben nur die zulässigen Präferenzen erhalten, die Regionalfrage war wieder offen.

**Standards zurücksetzen** entfernte den eigenen Schlüssel tatsächlich. Die frisch aktualisierte native Speichertabelle zeigte null Einträge. Danach wurde der ursprüngliche Version-2-Rohwert zeichengetreu wiederhergestellt und erneut verglichen. Das anschliessende Neuladen bestätigte die ursprünglichen eigenen Standards und ein leeres Empfangsdatum. Auch der separat gelesene Session Storage war leer. Andere Browserdaten wurden nicht gelöscht. Die Prüfung behauptet keine automatische V2-zu-V3-Migration.

### Darstellung

Die tatsächlichen Ansichten bei 848 und 720 Pixeln, 390 Pixeln sowie 200 Prozent Browserzoom wurden geprüft. Bei 720 Pixeln blieb der zweispaltige Aufbau in DE/FR erhalten. Lange EOG-/LAPG-Auswahlwerte wurden umbrochen. Bei 390 Pixeln war das Formular einspaltig und ohne horizontalen Überlauf. Das Datumsfeld blieb linksbündig mit 16-Pixel-Schrift. Bei 200 Prozent waren Bedienelemente und lange französische Texte weiterhin lesbar. Die beobachteten Inhalts- und Scrollbreiten stimmten jeweils überein.

Die Bilder der langen Auswahlwerte zeigen geschlossene Felder. Aus ihnen wird kein visueller Nachweis aller offenen Listen abgeleitet. Ein in mobilen Vollbildaufnahmen sichtbarer Tastatur-Sprunglink wurde in der normalen Eingabeansicht nachgeprüft. Dort lag er vollständig ausserhalb des Viewports und überdeckte den Hinweis nicht. Zuvor wirkungslose Grössenvorgaben und bei Zoom beschnittene technische Screenshots wurden nicht als bestandene Bildnachweise verwendet. Die abschliessende Zoomprüfung ist zusätzlich durch native Bildschirmaufnahmen belegt.

Gerätemodus und temporäre Grössenvorgaben wurden aufgehoben, die vorherigen Geräteleistenwerte wiederhergestellt und der Browserzoom auf 100 Prozent zurückgesetzt. Die produktive Seite blieb mit den ursprünglichen eigenen Standards ohne Testresultat geöffnet.

## Gesamtmatrix und Abschluss

| ID | Vollzugsstand |
| --- | --- |
| D01 Kanonische Adresse | Bestanden |
| D02 Weiterleitungen | Drei Varianten bestanden |
| D03 Paketidentität | Öffentliche Bytes, tatsächliche App-Konfiguration und sichtbarer Datenstand bestätigt |
| D04 Sicherheitsheader | Unveränderte Abweichung ausdrücklich akzeptiert, nicht bestanden |
| D05 Cache | Unveränderte Restabweichung ausdrücklich akzeptiert, strikter Test nicht bestanden |
| D06 Externe Aufrufe | Im aufgezeichneten Browser-Ladeablauf bestanden, mit der beschriebenen Cache- und Exportqualifikation |
| D07 Deutsch | Hauptfälle, Sperrproben, Datumseingabe und gespeicherte Kalenderdatei bestanden |
| D08 Französisch | Vorgesehene Wiederholungen und gespeicherte Kalenderdatei bestanden |
| D09 Darstellung | Reale Browserbreiten bis 390 Pixel und 200 Prozent Zoom bestanden, kein Ersatz für neue physische Gerätetests |
| D10 Datenschutz | Kontrollierte V3/V4-Standardsprüfung, Auslassen der Falldaten, tatsächliches Rücksetzen und exakte Wiederherstellung bestanden. Netzwerkbeobachtung gemäss D06 |
| D11 Fehlerfälle | Januarvergleich, fehlende Fakten, Regional- und Zeitgrenzen sowie ungültiges Datum sperren wie vorgesehen |
| D12 Root-Integration | Elf Rootressourcen byteidentisch. Rechnerlink, Impressumsanker, Sitemap sowie produktive Quellcode-/Lizenzziele bestätigt |

Der technische P-Vollzug ist innerhalb der erteilten Freigabe abgeschlossen. Ein zusätzlicher Produktfehler, der den freigegebenen Rückfall ausgelöst hätte, wurde nicht festgestellt. Die Sicherungen und der alte Rechnerbestand bleiben verfügbar. Die Hostingabweichung ist nach einer konkreten Supportrückmeldung und vor einem weiteren P-Release erneut zu beurteilen.

### Gebundene Nachweise

Rohbelege und Browserpräferenzen bleiben privat. Die nachstehenden Prüfsummen erlauben die Zuordnung ohne Veröffentlichung privater Pfade oder Browserinhalte.

| Nachweis | SHA-256 |
| --- | --- |
| Anonymer GitHub-Nachvergleich | `396463b86d79dd35628bc3232574179985b16f06ca93ff8a0f86b03423fbf0fd` |
| Produktions-HTTP-Hauptbericht | `61ad2476d01dd77bf77f90d44d23799dbfff3a943bfbd96d1f72ec75b5540c82` |
| Produktions-HTTP-Ergänzung | `35fc96cd89cdd59366e7c5f62f92b4e47e65c1d7460ce847ee28411aee65d2c7` |
| Fachliche Browserbeobachtungen | `cd4124438a66576ba581ff25c263a8a58c0262fe85d3bdf1e2f0b9a8db82d081` |
| Technische Browserbeobachtungen | `e9b4849571a8c2d1c7234256ded943f1078f5a1b97caf630f9a46dc6f073e152` |
| Kalenderdateiprüfung | `e8b480e60321755d04d6fbb7c0c17a677effcff6fc2c2f3778e9048e8e455800` |
| Unabhängige HAR-Auswertung | `7cbdd1e13a537a5f69d1fe227210a29e35df58676f0f6af3ef06a3d4b9e3cd0e` |

**Dieser Nachweis erklärt keinen uneingeschränkten D01–D12-Pass und enthält keinen neuen formellen Betriebsentscheid durch Codex.** Fachliche und betriebliche Verantwortung bleiben bei David Steimer. Der gesonderte Publikationsauftrag umfasst diesen Dokumentationsnachtrag, nicht die privaten Rohbelege, Sicherungen oder Browserpräferenzen.
