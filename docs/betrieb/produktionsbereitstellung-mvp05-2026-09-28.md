# MVP 0.5 · Öffentliche Produktionsbereitstellung vom 28. September 2026

**Vollzugsstand vom 28. September 2026. MVP 0.5 ist auf der öffentlichen Rechneradresse bereitgestellt. Die funktionalen P-Prüfungen sind abgeschlossen. D04 und D05 bleiben mit den ausdrücklich akzeptierten Abweichungen dokumentiert. Bei D10 ist die direkte Browserstorage-Wertkontrolle weiterhin offen.**

Der Nachweis ergänzt den [Deploymentplan MVP 0.5](deployment-mvp-05.md), das [Publikationspaket](publikationspaket-mvp05.md) und die [begrenzte Header-Risikoakzeptanz](p-vorpruefung-mvp05-2026-09-28.md). Er verändert weder das zuvor gebundene Dateiinventar noch die freigegebenen Releaseartefakte. Frühere Angaben «noch nicht veröffentlicht» in diesen eingefrorenen Nachweisen dokumentieren ihren damaligen Stand.

## 1. Auftrag und gebundener Stand

David Steimer hat den gezielten Header-Wiederholungstest und bei unverändertem Befund die begrenzte Risikoakzeptanz sowie die anschliessende P-Bereitstellung beauftragt. Die passende GitHub-Veröffentlichung mit vorübergehendem, anschliessend wieder zu entfernendem Schreibschlüssel wurde zusätzlich ausdrücklich freigegeben.

| Merkmal | Tatsächlicher Stand |
| --- | --- |
| Öffentliche Adresse | [Berner Fristenrechner](https://www.steimer.ch/fristenrechner/) |
| Anwendung | `0.5.0` |
| Datenrelease | `2026-09-28-mvp-05-approved.1` |
| Manifestformat | `5.0.0` |
| Veröffentlichter Produktcommit | `897c9e78e5576ef99ea8589e10753940337fa956` |
| Veröffentlichter Datenpin | `3109c39730f10d31cb6c57200b36dd5091d7bcd1` |
| Definitives Webarchiv | `fristenrechner-mvp05-steimer-web.zip`, 484’549 Bytes |
| SHA-256 Webarchiv | `be2d81b9a0730ebad9fb3b47a37923f2c0c0aaa2c58c57422dc6b0f53e5a1fa8` |
| Produktdateien | Zwölf, einschliesslich Hostingkonfiguration und Bibliothekslizenzen |
| Hosting | Bestehende steimer.ch-Infrastruktur, keine zusätzlichen Dienste |
| Fachliche und betriebliche Verantwortung | David Steimer |

Die GitHub-Veröffentlichung erfolgte vor der P-Umschaltung. Der öffentliche Nachvergleich bestätigte den vorgesehenen Hauptbranch und alle 20 ausgewählten Dateien. Der temporäre Deploy-Key wurde danach entfernt und der damit verweigerte Zugriff kontrolliert. Kein Schlüsselbestandteil wird in diesem Nachweis veröffentlicht.

Es erfolgte kein neuer Produktbuild. Das definitive Webarchiv blieb byteidentisch. E/Q, M365-Berechtigungen, DNS, E-Mail-Konfiguration, Root-Webauftritt und Sitemap wurden durch diesen P-Vollzug nicht geändert.

## 2. Sicherung, temporäre Vorprüfung und Umschaltung

Vor dem Eingriff wurde der tatsächliche Website-Nutzbestand neu gesichert und heruntergeladen. Die lokal geprüfte Sicherung enthält 37 Dateien mit unveränderten Nutzbytes gegenüber der gebundenen bisherigen Website-Referenz. ZIP-Integrität, eindeutige sichere Pfade und die versteckte Hostingkonfiguration wurden geprüft. Ausgenommen blieben ausschliesslich die bereits abgegrenzten Hosting-Systemverzeichnisse, nicht die Website-Nutzdateien.

| Sicherungsnachweis | Bindung |
| --- | --- |
| Frisch heruntergeladene Websitesicherung | 2’902’430 Bytes, SHA-256 `218d79583d3b7a6d67f55a9e6c784dfd0a0efa435a0cbb27293441c610c34699` |
| Daraus lokal abgeleiteter Rechnerteil | Zwölf Dateien, App `0.3.0`, Release `2026-08-31-mvp-03-approved.1` |
| Abgeleitetes Rechnerarchiv | 372’192 Bytes, SHA-256 `646344e121c57f5aab437931fad32284170ba5726ca4c268e4db379f6690800c` |
| Vorheriger öffentlicher Rechner | Alle elf öffentlich lesbaren Dateien frisch bytegleich mit dem Rechnerteil der Sicherung |

Das abgeleitete Rechnerarchiv ist **keine zweite unabhängige Hostaufnahme**, sondern eine vollständig nachgewiesene lokale Teilkopie derselben frischen Websitesicherung. Die vollständige Hostauswahl und ihre Durchführung sind im privaten Vollzugsnachweis dokumentiert. Archivnamen und private Speicherorte werden hier nicht publiziert.

Der Transportwrapper enthielt die zwölf unveränderten MVP-0.5-Dateien sowie genau zwei unveränderte, gehashte Appassets des vorherigen Stands. Der Wrapper umfasst damit 14 Dateien und ist ausdrücklich kein neuer Produktbuild. Seine SHA-256-Prüfsumme lautet `9a68cf1cec86ea1d5f730123bd0212249f5fbdb353a135b1a74c92dcfc765ea4`, seine Grösse 536’987 Bytes. Die Altassets bleiben für bereits geladene vorherige Seiten unter ihren bisherigen URLs erreichbar.

Upload und Entpackung erfolgten zunächst ausserhalb des öffentlichen Webroots. Ausschliesslich die bekannten Appdateien gelangten anschliessend an eine unverlinkte temporäre Prüfadresse. Unverlinkt wird nicht mit zugriffsgeschützt gleichgesetzt. Byte-, Root- und Headerprüfungen der temporären Kopie waren innerhalb der ausdrücklich beschlossenen Risikoakzeptanz erfolgreich.

Die produktive Umschaltung bestand aus zwei Verzeichnisaktionen: Zuerst wurde der alte Rechnerordner reversibel in einen privaten Rückfallbereich verschoben, anschliessend wurde der geprüfte Stageordner auf den öffentlichen Rechnernamen umbenannt. **Dies war keine atomare Gesamtumschaltung.** Eine genaue Unterbruchsdauer wurde nicht gemessen und wird nicht behauptet. Der alte Ordner und die Sicherungen wurden nicht gelöscht.

Die ehemalige öffentliche Stageadresse liefert nach der Umschaltung HTTP 404. Die private Vorprüfungskopie bleibt ausserhalb des Webroots erhalten.

## 3. Öffentliche HTTP- und Headerprüfung

Die öffentliche HTTP-Prüfung nach der Umschaltung wurde am 28. September 2026 um 19:21 Uhr Europe/Zurich abgeschlossen. Sie bestätigt:

- Kanonische Rechneradresse mit HTTP 200 und den erwarteten HTML-Bytes.
- Alle elf öffentlich lesbaren Release-Dateien und beide erhaltenen Altassets mit den erwarteten Bytes, ohne unerwartete Umleitung.
- Alle drei geprüften HTTP- beziehungsweise nicht kanonischen Adressvarianten führen auf die kanonische HTTPS-Adresse und liefern den neuen Stand.
- Alle sieben vor dem Eingriff erfassten Root-, Sitemap- und Rootasset-Antworten bleiben byteidentisch.
- Der anschliessende gezielte HEAD-/GET-Vergleich der fünf neuen Ressourcentypen umfasst zehn Antworten. Alle liefern HTTP 200. Die fünf GET-Antwortkörper stimmen mit dem freigegebenen MVP-0.5-Kandidaten überein.

### D04: bekannte Abweichung mit Risikoakzeptanz

HEAD liefert die fünf vorgesehenen Schutzheader. Bei tatsächlichem GET von HTML, JavaScript, CSS und Lizenztext fehlen sie weiterhin. Das JSON-Buildmanifest liefert sie auch bei GET. Der vollständige öffentliche Dateitest bestätigt die vorhandenen Schutzheader auch für das Favicon.

**D04 ist nicht bestanden**, sondern eine bekannte Abweichung mit der bereits dokumentierten begrenzten Risikoakzeptanz. Der erneute Nachvergleich nach der Umschaltung ergab keine neue oder weitergehende Abweichung innerhalb des bezeichneten Prüfbereichs. Weder eine Behebung noch eine geklärte technische Ursache wird behauptet.

### D05: Cachevorgaben vorhanden, bekannte Restabweichung

HTML liefert `no-store`. Die gehashten Assets liefern `public`, `immutable` und `max-age=31536000`, daneben nochmals dieselbe Altersangabe. Die gleichlautende doppelte Angabe bleibt eine **akzeptierte Restabweichung**. Der strikte Cachetest ist deshalb nicht pauschal als bestanden ausgewiesen. Widersprüchliche Altersangaben oder eine neue abschwächende Cachevorgabe wären durch diese Akzeptanz nicht gedeckt.

Die maschinellen Nachweise unterscheiden entsprechend zwischen `acceptableWithinExplicitRiskDecision: true`, `securityHeadersPassed: false` und `strictCachePassed: false`. Sie setzen `fullD01D12Passed` nicht auf wahr.

## 4. Browserprüfung auf der tatsächlichen P-Adresse

Die Browserprüfungen wurden auf der tatsächlichen P-Adresse in Chrome ausgeführt. Die lokale Gegenprüfung der Dateien ist davon getrennt. Eine unabhängige Wiederholung aller Browseraktionen wird nicht behauptet.

| Prüfung | Tatsächlich beobachtetes Ergebnis | Stand |
| --- | --- | --- |
| Sichtbare Identität | Neuer MVP-0.5-Datenstand auf der öffentlichen Seite sichtbar | Bestanden |
| StPO, Deutsch | Zustellung 16.09.2026, zehn Tage ergibt 28.09.2026 | Bestanden |
| Deutscher Kalenderexport | Tatsächlich aus P heruntergeladene ICS-Datei, 662 Bytes, lokal geprüft | Bestanden |
| ELG, Deutsch | Individuelle Bundes-Ergänzungsleistungen, Einsprache gegen Verfügung, zuständiger Kanton BE, Partei BE ohne Vertretung, rechtlich geklärte individuelle Zustellung 16.09.2026 ergibt 16.10.2026 bei fixer Fristdauer von 30 Tagen | Bestanden |
| ELG, Französisch | Derselbe Fall nach Sprachwechsel ergibt weiterhin 16.10.2026 mit französischer Oberfläche | Bestanden |
| Französischer Kalenderexport | Tatsächlich aus P heruntergeladene ICS-Datei, 700 Bytes, lokal geprüft. Fristablauf 16.10.2026, französischer Betreff | Bestanden |
| ELG, formelle Beschwerdeverbesserung | Rechtlich geklärte Zustellung 15.12.2026, angeordnete zehn Tage, ursprüngliche Beschwerdeerhebung 01.12.2026, Gericht und massgebender Wohnsitz BE sowie Feiertagsanknüpfung Partei BE ohne Vertretung ergibt 11.01.2027. Rohende 10.01.2027, 16 Stillstandstage und anschliessende Sonntagsverschiebung | Bestanden |
| AVIG-ALE, Kassenroute | Einsprache, Arbeitslosenkasse, Kontrollkanton BE, ursprüngliche Verfügung 31.01.2027, Zustellung 01.02.2027 und Feiertagsanknüpfung Partei BE ohne Vertretung ergibt 03.03.2027 bei fixer Dauer von 30 Tagen | Bestanden |
| AVIG-ALE, Amtsstellenroute | Eingabe im laufenden Verwaltungsverfahren, zuständige Amtsstelle BE, Zustellung 30.01.2027, angeordneter Tag und Feiertagsanknüpfung Partei BE ohne Vertretung ergibt 01.02.2027. Kein Feld für Kassenverfügungsdatum oder zusätzliches Zuständigkeitsdatum | Bestanden |
| KVG-OKP, Verwaltungsfrist | Individuelle OKP-Leistung, Eingabe im laufenden Verwaltungsverfahren, Wohnsitz bei Zustellung BE, Zustellung 22.05.2026, angeordnete drei Tage und Feiertagsanknüpfung Partei BE ohne Vertretung ergibt 26.05.2026. Rohende Pfingstmontag 25.05.2026 wird verschoben | Bestanden |
| AVIG-Sperrprobe | Im gültigen Kassenfall das ursprüngliche Verfügungsdatum gelöscht. Berechnung blockiert, kein Fristablauf und kein Kalenderexport | Bestanden |
| KVG-Sperrproben | Im gültigen KVG-Fall Wohnsitz zuerst auf ZH, danach auf «Bitte wählen» gestellt. Beide Berechnungen blockiert, kein Fristablauf und kein Kalenderexport | Bestanden |
| Frühe Datumseingabe | Datum bleibt bei unvollständiger Sozialauswahl editierbar. Daraus entsteht ohne vollständige erforderliche Fallangaben kein gültiger Berechnungsweg | Bestanden |
| Mobilansicht | Bei 390 Pixeln Viewportbreite sind Dokument- und Scrollbreite ebenfalls 390 Pixel. Visuelle Kontrolle ohne horizontalen Überlauf | Bestanden |
| Browsernetzwerk | Die abschliessende native Network-Beobachtung umfasst 34 Einträge, davon acht HTTPS-Ressourcen, sämtlich aus dem gleichursprünglichen Rechnerpfad. Die übrigen Einträge betreffen Browsererweiterungsressourcen und Data-URIs. Keine appfremde HTTP-/HTTPS-Laufzeitverbindung beobachtet | Bestanden im beobachteten Ablauf |
| Browserstorage | Statische Speicher-Allowlist geprüft. Nach tatsächlichem Neuladen sind Datum und Ergebnis leer, die bestehenden Standards ZPO/20 Tage/BE unverändert. Die direkte Kontrolle der gespeicherten Werte ist technisch noch nicht zuverlässig auslesbar und zur manuellen Sichtprüfung vorgelegt | Teilweise geprüft, direkte Wertkontrolle offen |

Die vorstehenden sechs positiven Hauptfälle und ihre gezielten Sperrproben sind eine tatsächliche P-Stichprobe, keine erneute vollständige Durchführung sämtlicher 77 AP19B-Referenzen im Browser. Ein künstlicher Netzwerk-Timeout wurde nicht erzeugt: P verwendet eingebettete Fachdaten ohne Mirror-Laufzeitabruf. Dieser E/Q-spezifische Negativtest ist hier nicht anwendbar und wird nicht als bestandener P-Test ausgegeben.

### Tatsächliche deutsche Kalenderdatei

SHA-256 der geprüften Datei: `0c5a34dc55b3db2526e109fb36fe62323649cd1cc5513ee9177dd6610cf6be9f`.

Enthalten sind der ganztägige Fristablauf am 28.09.2026, das exklusive Enddatum 29.09.2026, der Betreff `Fristablauf (QA-MVP05-P)`, freie Verfügbarkeit, Kategorie `Fristablauf` und Erinnerung `-PT112H`. Die Datei wurde in diesem P-Lauf nicht in Outlook importiert. Die bereits abgeschlossenen MVP-0.5-Outlook-Importnachweise bleiben [separat dokumentiert](outlook-pruefung-mvp05.md).

### Tatsächliche französische Kalenderdatei

Die aus dem französischen ELG-Ablauf gespeicherte Datei umfasst 700 Bytes. SHA-256: `dcd93483717a2be05c8b5eb30c4478945ce47062dc1667e126b1d1a74001226e`.

Enthalten sind der ganztägige Fristablauf am 16.10.2026, das exklusive Enddatum 17.10.2026, der Betreff `Échéance du délai (QA-MVP05-P-FR)`, freie Verfügbarkeit, die sprachunabhängige Kategorie `Fristablauf` und Erinnerung `-PT112H`. Beide tatsächlichen Dateien bestehen die unabhängige lokale Prüfung von CRLF-Zeilen, Zeilenfaltung, eindeutigen Pflichtfeldern und Exportsemantik. Keine Datei wurde in diesem P-Lauf in Outlook importiert. Es sind weder Teilnehmende noch Organisator oder Anhang enthalten.

### Statische Ergänzung zu Netzwerk und Datenschutz

Die vier JavaScript-Dateien des gebundenen Webarchivs enthalten keine Aufrufe von Fetch, XMLHttpRequest, WebSocket, EventSource, SendBeacon oder Service-Worker-Registrierung. Der Einstieg verwendet eingebettete Fachdaten und lokale Assets. Die Kalenderdatei wird als lokaler Blob erzeugt.

Die eigene Anwendung speichert ausschliesslich erlaubte Präferenzen unter `fristenrechner.defaults.v1`. Empfangsdatum, weitere fallbezogene Zuständigkeitsdaten, Kalenderreferenz und Berechnungsergebnis gehören nicht zur Speicher-Allowlist. Das mitgelieferte UI-Vendorbundle enthält allgemeine Sprachspeicherhelfer. Daraus wird weder eine Speicherung von Fallangaben noch eine tatsächliche Verwendung dieser Helfer durch den Rechner abgeleitet. Die statische Prüfung ersetzt die noch offene tatsächliche Browserstorage-Kontrolle nicht.

Das tatsächliche Neuladen nach den Testfällen bestätigt ein leeres Empfangsdatum ohne vorheriges Ergebnis und die unveränderten bestehenden Standards. Im P-Lauf wurden keine Standards gespeichert oder zurückgesetzt. Die DevTools-Speichertabelle liess sich über die verfügbare Browser-/Betriebssystembedienung nicht zuverlässig auslesen. David wurde deshalb um eine reine Sichtprüfung von Local storage und Session storage gebeten. Dies ist eine Nachweislücke und kein beobachteter Datenschutzfehler.

### Root-Integration

Die unveränderte Rootseite wurde zusätzlich frisch im Browser geöffnet. Die Rechnerverlinkung, das Impressum und die Absendertrennung sind sichtbar. Der Rechnerfooter enthält die passenden Links zum Impressumsanker, zum öffentlichen Repository und zur AGPL-3.0-Lizenz. Alle sieben gebundenen Rootantworten einschliesslich der Sitemap sind byteidentisch mit dem Zustand vor dem Eingriff. Es wurden keine Rootänderungen benötigt.

## 5. Gesamtmatrix zum dokumentierten Vollzugsstand

| ID | Stand |
| --- | --- |
| D01 Kanonische Adresse | Bestanden |
| D02 HTTPS und Weiterleitung | Bestanden, drei Varianten |
| D03 Paketidentität | Öffentlicher Bytevergleich und sichtbarer Datenstand bestanden |
| D04 Sicherheitsheader | Bekannte Abweichung mit ausdrücklicher Risikoakzeptanz, nicht bestanden |
| D05 Cache | HTML-No-Store vorhanden. Gleichlautende doppelte Asset-Altersangabe als Restabweichung akzeptiert |
| D06 Externe Aufrufe | Im beobachteten Browserablauf bestanden, statisch ergänzt |
| D07 Deutsch | Hauptablauf, sechs positive Hauptfälle, gezielte Validierungs-/Sperrproben und realer Kalenderexport bestanden |
| D08 Französisch | Oberfläche, ELG-Ergebnis und tatsächlich gespeicherte, geprüfte Exportdatei bestanden |
| D09 Mobilansicht | Bei 390 Pixeln bestanden |
| D10 Datenschutz | Statischer Teil und Neuladen ohne Fallangaben bestanden. Direkte Browserstorage-Wertkontrolle offen |
| D11 Fehlerfälle | Fehlendes AVIG-Verfügungsdatum sowie ausserbernischer und fehlender KVG-Wohnsitz blockieren ohne Fristablauf oder Export. Bestanden |
| D12 Root-Integration | Bestanden. Sieben HTTP-Bytevergleiche unverändert, Rechnerlink und Impressum auf Root sichtbar, Quellcode-/Lizenzverweise korrekt |

## 6. Verbleibender Abschluss

Die Umschaltung und die funktionalen P-Prüfungen sind abgeschlossen. Offen bleibt ausschliesslich die direkte manuelle Sichtprüfung der Browserstorage-Werte als Ergänzung zu D10. Die statische Kontrolle und das Neuladeverhalten sind bereits geprüft. Nicht ausgeführte Punkte werden weder aus E/Q noch aus lokalen Tests als P-Erfolg übernommen.

Neue fachliche, technische oder datenschutzrechtliche Fehler bleiben Halte- beziehungsweise Rückfallgründe. Die bekannte Header-/Cacheabweichung ist ausschliesslich im beschlossenen Umfang akzeptiert. Die unveränderte Sicherung und der reversible alte Rechnerbestand stehen für den Rückfall zur Verfügung. Der Hostingbefund ist nach konkreter Supportrückmeldung und spätestens vor dem nächsten P-Release erneut zu beurteilen.

**Dieser Nachweis behauptet keinen vollständigen D01–D12-Pass und enthält keinen neuen formellen Betriebsentscheid durch Codex.** Er dokumentiert den ausgeführten P-Vollzug, die begrenzt akzeptierten Abweichungen und den offenen D10-Prüfpunkt. David Steimer hat die Veröffentlichung dieses Produktionsnachweises zusätzlich beauftragt. Die Dokumentationsveröffentlichung ändert weder Produktdateien noch Releaseartefakte oder Hostingkonfiguration.
