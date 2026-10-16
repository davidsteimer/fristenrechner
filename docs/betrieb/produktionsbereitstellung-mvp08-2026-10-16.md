# MVP 0.8 Produktionsbereitstellung vom 16. Oktober 2026

**MVP 0.8 ist auf der öffentlichen Rechneradresse bereitgestellt. Der technische P-Vollzug ist abgeschlossen. Zehn Punkte der öffentlichen Prüfmatrix sind bestanden. D04 und der strikte D05-Test bleiben mit den ausdrücklich für MVP 0.8 akzeptierten unveränderten Header- und Cacheabweichungen nicht bestanden. Ein Rückfall war nicht erforderlich.**

**David Steimer hat den öffentlichen P-Betrieb von MVP 0.8 am 16. Oktober 2026 gestützt auf diesen Produktionsnachweis und unter Beibehaltung des dokumentierten begrenzten Header-/Cacherisikos freigegeben. Die Veröffentlichung dieses Nachweises im öffentlichen Repository `davidsteimer/fristenrechner` ist ausdrücklich beauftragt.**

Dieser Nachweis ergänzt die vorgelegte konkrete Bereitstellungsvorlage, die öffentliche Prüfmatrix D01 bis D12 und die [Q-Abnahme](abnahme-q-mvp08.md). Bereitstellungsvorlage und Prüfmatrix bleiben unveränderte lokale Freigabegrundlagen, ihre Prüfsummen sind unten gebunden. Die Bezeichnung «öffentliche Prüfmatrix» betrifft den geprüften P-Host, nicht den Publikationsstatus der Vorlage. Eingefrorene Freigabegrundlagen und Releaseartefakte bleiben unverändert.

## Auftrag und Releasebindung

David Steimer hat am 16. Oktober 2026 die P-Bereitstellung gemäss der vorgelegten Vorlage einschliesslich des begrenzten Header-/Cacherisikos und des beschriebenen Rückfallwegs ausdrücklich freigegeben. Der Auftrag umfasst frische Sicherung, private Rücklesung, öffentliche Vorprüfung, kontrollierte Umschaltung und die anschliessenden P-Tests. Er verändert weder E/Q noch M365-Berechtigungen, historische AP5-Pins oder die separaten AP21-Testapps.

| Merkmal | Nachgewiesener Stand |
| --- | --- |
| Öffentliche Adresse | [Fristenrechner Schweiz](https://www.steimer.ch/fristenrechner/) |
| Anwendung | `0.8.0` |
| Separat auf E/Q abgenommener SPFx-Stand | `0.8.0.0` |
| Datenrelease | `2026-10-15-mvp-08-approved.1` |
| Datenvertrag | Manifest und Mindestconsumer `8.0.0` |
| Veröffentlichter Datencommit | `10a99419eaabb3e96d2acccf0c7a93e2fe6472cb` |
| Veröffentlichter Publikationscommit | `a3b47ab3c9c6e36831ce60b4164b45ae4b01eb60` |
| Datenmanifest SHA-256 | `2461f06c0a7d79dcd6a177fc116f08fcc0efa62e03b38ba6ac87964457c19aa4` |
| Definitives Webarchiv | `fristenrechner-mvp08-steimer-web.zip`, 635’927 Bytes |
| Webarchiv SHA-256 | `0abbc23d691835e5b04b64975140afb36c4bfa89482ff872c0c76188673f4176` |

Es wurde kein neuer Produktbuild erstellt. Die zwölf Kandidatdateien sind unverändert. Der öffentliche Rechner verwendet eingebettete Rechtsdaten, keinen SharePoint-Mirror und keinen GitHub-Laufzeitprovider. Die zwölf neuen TI-/GR-Verfahrenspfade erweitern weder die freigegebenen Zeiträume noch die Berner Sozialfreigaben. Die weiterhin offene Feldhöhenkorrektur des Empfangsdatums unter #50 bleibt dem nächsten Release zugeordnet.

## Sicherung und Umschaltung

Der tatsächliche Website-Nutzbestand wurde vor dem Eingriff frisch gesichert. Das heruntergeladene Archiv umfasst **48 Dateien**, 3’979’831 komprimierte Bytes und SHA-256 `13bf349b7b678d3422ec9801d850dae3d5f98516eede6f8e8de7f3c345d8b29c`. CRC, sichere eindeutige Pfade, die vollständigen Datei- und Unterverzeichnisinventare sowie die enthaltenen Konfigurationen sind geprüft. Der alte Rechner bestand aus zwölf MVP07-Dateien und sechs erhaltenen Altassets. Alle 18 Rechnerdateien und die elf frisch erfassten öffentlichen Rootressourcen stimmen mit den Vergleichsbytes überein. Auch die übrigen Website-Dateien zeigten gegenüber dem historischen Vergleich keine Änderung.

Die Kopie war nicht atomar. Ihr beobachteter Beginn ist kein exakter Aufnahmezeitpunkt aller Dateien. Der Quell- und Sicherungsbestand wurde anschliessend vollständig bestätigt, das empfangene Archiv unabhängig geprüft. Frühere WebFTP-Zeitüberschreitungen bleiben als Zwischenbefunde erhalten und wurden nicht als Erfolgsnachweis verwendet. Sicherung und alte Rechnerdateien bleiben privat erhalten.

Der gesonderte Transportwrapper enthielt **20 Dateien**: zwölf unveränderte MVP08-Dateien und acht verifizierte frühere JS-/CSS-Dateien für bereits geöffnete Seiten. Er umfasst 1’317’646 Bytes, SHA-256 `450de115e41a87924392ade06c3dda17a8f66d662a6cb89f4151412514cdffb6`. Upload und Entpackung erfolgten zunächst ausserhalb des Webroots.

Ein aus diesem tatsächlichen Hostingbaum erzeugtes Rücklesearchiv bestätigte sämtliche 20 Dateien bytegenau, einschliesslich der App-`.htaccess`. Die Browserdatei war beim Nachweis noch nicht endgültig benannt. Die bereits vollständig empfangenen Archivbytes bestanden jedoch CRC und den vollständigen Dateivergleich und wurden als identische private Belegkopie gesichert. Dies belegt die empfangenen Hostingbytes, nicht einen abgeschlossenen nativen Speicherdialog.

Anschliessend wurde ausschliesslich der geprüfte Rechnerbaum an einer unverlinkten, aber öffentlich erreichbaren Stageadresse geprüft. Diese Adresse war nicht zugriffsgeschützt. Paketbytes, Header-/Cachemuster und die gebundenen Stagefälle bestanden innerhalb der ausdrücklichen Risikoakzeptanz. Zu den tatsächlichen Browserproben gehörten BE/StPO, TI-A01 in Deutsch und Französisch, TI-O2, GR-Gericht mit und ohne Dringlichkeit sowie sofortige Invalidierung bei Datumstext, Fallqualifikation und Dringlichkeitswechsel.

Der alte MVP07-Rechnerbaum wurde danach reversibel in den privaten Rückfallbereich verschoben. Ausschliesslich der geprüfte Stagebaum erhielt den bisherigen produktiven Rechnernamen. Das beobachtete Umschaltfenster liegt zwischen **15:30:52 und 15:32:42 UTC**, entsprechend **17:30:52 bis 17:32:42 Uhr Zürich**. **Die Umschaltung war nicht atomar. Die tatsächliche Dauer eines Unterbruchs wurde nicht gemessen.** Die Hostingansicht bestätigte anschliessend den produktiven Rechner ohne separaten Stageordner. Ein Rückfall war bis zum hier dokumentierten Stand nicht erforderlich.

## Öffentliche HTTP Prüfung und Restrisiko

Der frische öffentliche Vergleich nach der Umschaltung bestätigte:

- HTTP 200 und die erwarteten MVP08-HTML-Bytes auf der kanonischen Rechneradresse.
- Bytegleichheit aller elf öffentlich lesbaren Kandidatdateien und sämtlicher acht erhaltener Altassets.
- Drei Weiterleitungsvarianten mit dem unveränderten Weg zur kanonischen HTTPS-Adresse und dort den richtigen HTML-Bytes.
- Unveränderte Bytes aller elf öffentlich erfassten Rootressourcen einschliesslich Sitemap und `robots.txt`.
- Das bekannte unveränderte Header-/Cachemuster in 16 rollen- und methodengebundenen Beobachtungen.

Die fünf HEAD-/GET-Paare und sechs zusätzlichen GET-Antworten wurden vor dem Eingriff, auf Stage und auf P gegen ihre jeweiligen Sollbytes geprüft. Die Ausgangslage wurde unmittelbar vor der Umschaltung nochmals bestätigt. Die erneuten Prüfungen verwendeten keine Anmeldung und keine Cookies. Erhaltene Altassets und Weiterleitungen sind separate Nachweise und werden nicht als Teil der 16 Headerbeobachtungen gezählt.

**D04 bleibt nicht bestanden.** Bestimmte GET-Antworten enthalten weiterhin nicht die Sicherheitsheader, die bei HEAD geliefert werden. **Auch der strikte D05-Test bleibt nicht bestanden.** Die dokumentierten Cachevorgaben enthalten die bekannte gleichlautende doppelte Altersangabe. Der ausdrücklich für MVP08 gebilligte Risikoentscheid deckt nur das frisch nachgewiesene unveränderte Muster. Eine Behebung oder geklärte technische Ursache wird nicht behauptet. Hostingkonfiguration und Sicherheitsvorgaben wurden nicht verändert.

## Tatsächliche Browserprüfung auf P

Die folgenden fachlichen Prüfungen wurden in einer eigenen Edge-InPrivate-Sitzung auf macOS über die tatsächliche native Oberfläche auf der kanonischen P-Adresse ausgeführt. E/Q-Nachweise, Stageproben und P-Ergebnisse bleiben getrennt. Es handelt sich um gezielte Hostprüfungen, nicht um eine erneute vollständige Prüfung aller Rechts- und Kalenderkombinationen.

| Fallgruppe | Tatsächlich geprüfter Umfang und Ergebnis |
| --- | --- |
| A01 bis A12 | Alle zwölf neuen TI-/GR-Pfade mit Empfang 02.10.2026. Die 30-Tage-Pfade enden am 02.11.2026, die 10-Tage-Pfade am 12.10.2026 und die TI-Beschwerde gegen eine vorsorgliche Massnahme mit 15 Tagen am 19.10.2026. Die vier zusätzlich zulässigen Stadien wurden ebenfalls geprüft |
| B01 TI-O2 | Empfang 17.02.2027 im ordentlichen TI-Verwaltungsbeschwerdepfad ist gesperrt, ohne definitiven Ablauf oder Export. Die Diagnose zeigt die betroffene Fristberechnung mit dem 19.03.2027. Die französische Prüfung erfolgte auf P, die deutsche Stageprobe bleibt gesondert zugeordnet |
| B02 GR Sommer und Dringlichkeit | Gerichtsbeschwerde mit Empfang 10.07.2027 endet ohne ausdrückliche Dringlichkeit am 10.09.2027, mit Dringlichkeit am 09.08.2027. Die Verwaltungsbeschwerde endet ebenfalls am 09.08.2027. Die gerichtlichen Varianten wurden auch in Französisch geprüft |
| B03 Angeordnete GR-Gerichtsfrist | Empfang 20.07.2027, zehn Tage: ohne Dringlichkeit 25.08.2027, mit Dringlichkeit 30.07.2027 |
| B04 Behördenort | Empfang 18.03.2027, ein Tag: GR-Verwaltungsfrist 19.03.2027, TI-Kostenvorschuss 22.03.2027. Kein frei zu bestimmender zusätzlicher Feiertagskanton |
| B05 bis B07 | Fehlende oder abweichende Fallqualifikation, Stadiumwechsel, leere angeordnete Dauer und die vereinbarten Unter-/Obergrenzen sperren wie vorgesehen. Kontrollfälle innerhalb der Grenzen bleiben berechenbar |
| C01 und C02 Bestand | BE/StPO 28.09.2026, ZPO-TI 09.12.2026 und ZPO-BE 07.01.2027. Automatische Ortsbindung und verständliche Normdarstellung in der Hauptspur |
| C03 Sozialrecht | AHVG-Einsprache mit den ausdrücklich gesetzten BE-Anknüpfungen, Empfang 17.12.2026 und 30 Tagen: 01.02.2027. DE und FR mit verständlicher ATSG-Spur, Art. 38 Abs. 4 und 16 Stillstandstagen |
| C04 bis C06 Grenzen und Berner Recht | Die vorgesehenen Januar-, NE-/GR- und Sozialgrenzen sowie das allgemeine BE-VRPG wurden mit ihren positiven und gesperrten Varianten geprüft |

Unbestätigte Änderungen des Datumstexts sowie Änderungen von Pfad, Stadium, Fallqualifikation oder Dringlichkeit entfernten das alte Ergebnis und den Kalenderexport vor einer neuen Berechnung. Am lokalen Prüftag 16. Oktober 2026 ergänzte `5` mit Tab das Datum zu `05.10.2026`, `12.10` mit Enter zu `12.10.2026` und `h` beim Fokuswechsel zu `16.10.2026`. `31.02.2027` wurde als ungültig blockiert. Die tatsächliche Datumsauswahl im Kalenderdialog für den 02.10.2026 funktionierte. Reale iPad-/Gastnachweise aus Q bleiben davon getrennt. Sie werden nicht als neue physische P-Geräteprüfung ausgegeben.

### Kalenderdateien und Outlook

Zwei Dateien wurden tatsächlich aus dem produktiven TI-A01-Fall gespeichert und unabhängig geprüft:

| Sprache und Referenz | Bytes | SHA-256 |
| --- | ---: | --- |
| DE, `QA-MVP08-P-DE` | 2’146 | `2da8b940819c0ac132585e5c7c358676a97fefdfab6e0398b281a2b2d5d1c63c` |
| FR, `QA-MVP08-P-FR` | 2’190 | `7bbeea801d28cdd1e87d20de9393ec59e76b4da2e90312b358c26e9b17b04489` |

Beide Termine beginnen ganztägig am 02.11.2026 und enden exklusiv am 03.11.2026. Bestätigt sind freie Verfügbarkeit, Kategorie `Fristablauf`, Erinnerung `-PT112H`, passende sprachabhängige Betreffe, unterschiedliche UIDs sowie die administrative Rechts- und Datenherkunft. UTF-8, CRLF, Textmaskierung und Zeilenfaltung sind geprüft. Die Dateien enthalten keine Teilnehmenden, Einladungen, Anhänge oder Wiederholungen.

Es erfolgte kein Outlook-Import. Die [bereits bestätigte begrenzte Wiederverwendung](abnahme-q-mvp08.md) bleibt bestehen. Die beiden neuen Dateien beweisen weder eine aktuelle Erinnerungszustellung noch die tatsächliche Outlook-Kategorienfarbe oder deren Darstellung in einer bestimmten Outlook-Version.

### Netzwerk und Datenschutz

Beim tatsächlichen P-Seitenstart wurden sieben appbezogene GET-Anfragen und vier getrennt zugeordnete Browsererweiterungsanfragen beobachtet, insgesamt elf erfolgreiche Antworten. Die Appressourcen stammten ausschliesslich aus dem eigenen Rechnerpfad. Nach C01 und TI-A01 in DE/FR sowie den beiden tatsächlichen Kalenderdownloads blieb die Anzahl bei elf. Es wurden in diesem aufgezeichneten Ablauf keine zusätzlichen Laufzeitaufrufe der App und keine Übertragung der Eingaben beobachtet. Die Browsererweiterungsressourcen werden der Anwendung nicht zugerechnet. Der öffentliche Bytevergleich ergänzt die native Netzwerkbeobachtung, ersetzt sie aber nicht.

Vor dem ersten Format-8-Laden war die eigene originbezogene Speichertabelle leer. Die anschliessende kontrollierte v4→v5-Probe übernahm BE/StPO, zehn Tage, direkte Zustellung und die ausdrücklich gespeicherte Partei-BE-Anknüpfung. Der alte Rohwert unter `fristenrechner.defaults.v1` blieb unverändert. Der neue v5-Rohwert und die sichtbaren Felder wurden miteinander verglichen. Empfangsdatum, Referenz und Ergebnis waren leer.

Danach wurden im echten GR-Gerichtsfall nur die stabilen Verfahrenspräferenzen gespeichert, insbesondere `gr-52-30`, Gerichtsverfahren und 30 Tage. Nach dem Neuladen waren Empfangsdatum, Referenz, Fallqualifikation, Dringlichkeit und Ergebnis wieder leer. Die erneute Berechnung verlangte die aktuellen Fallangaben. Der gespeicherte v5-Rohwert enthielt diese Fallfakten nicht.

**Standards zurücksetzen** schrieb den vorgesehenen v5-Resetmarker. Der alte v1-Wert blieb erhalten, lebte beim Neuladen aber nicht wieder auf. Abschliessend wurden ausschliesslich die beiden eigenen synthetischen Testschlüssel gezielt entfernt. Die aktualisierte native Speichertabelle bestätigte null Einträge. Kein allgemeiner Browserdatenreset und keine Änderung fremder Präferenzen erfolgten.

### Darstellung und Rootabschluss

**D09 ist bestanden.** Die tatsächliche P-Oberfläche wurde in DE/FR in der breiten Ansicht sowie mit 390 × 878 und 720 × 878 Pixeln geprüft. Eingaben, Schaltflächen und Ergebnisse waren sichtbar und bedienbar. Bei 720 Pixeln blieb der zweispaltige Aufbau erhalten, bei 390 Pixeln war die einspaltige Ansicht ohne horizontalen Überlauf nutzbar. Ein vorübergehender Ausschnitt in der skalierten Prüfvorschau wurde durch «Fit to window» richtiggestellt und nicht als Appfehler eingeordnet.

Der tatsächliche Browserzoom von 200 Prozent wurde über das Edge-Menü bestätigt. Die französische Ergebnisansicht und die Datumseingabe blieben korrekt dargestellt, der Tastaturfokus war sichtbar. Die Aufnahmen belegen die P-Browseransichten, keine neue physische iPad-Prüfung. Die Feldhöhe des Empfangsdatums unter #50 bleibt bewusst ein Folgereleasepunkt und wird nicht als behoben ausgegeben.

**D12 ist bestanden, mit qualifiziertem Nachweistyp für die Rootkonfiguration.** Elf öffentliche Rootressourcen sind bytegleich. Der vorhandene Rechnerlink und der Impressumsanker sind nachgewiesen. Die tatsächlichen Quellcode- und Lizenzziele sind erreichbar. Diese Linkprüfung ist ein Quelltext-/HTTP-Nachweis, kein visueller Klicknachweis aller externen Seiten.

Nach Ablauf der früheren WebFTP-Sitzung wurde die abschliessende Kontrolle in einer frischen regulären Sitzung ausgeführt. Die Root-`.htaccess` wurde im Hostingeditor vollständig nur lesend ausgelesen. Der beobachtete Volltext mit 546 Zeichen entspricht in seiner UTF-8-Darstellung 546 Bytes und SHA-256 `6cb7d54a04d18c5459cce6a6cb682049c2df574728074033e5dd5ea2c4668be2`. Text und Länge stimmen exakt mit der vor dem Deployment roh heruntergeladenen Ausgangsdatei überein. Automatisches Speichern war ausgeschaltet, es wurde nicht geschrieben oder gespeichert und der Editor anschliessend geschlossen. Dateigrösse, Änderungsdatum und Berechtigungen blieben unverändert. **Dies ist eine vollständige Text-Rücklesung über den Hostingeditor, kein erfolgreich abgeschlossener frischer Rohdownload.**

Die frische Hostingansicht bestätigte den produktiven Rechner ohne separaten Stageordner und ohne private Archive im Webroot. Sicherungsordner und Sicherungsarchiv sind weiterhin vorhanden. Der alte Rechnerbaum ist im privaten Rückfallbereich erhalten. Diese abschliessende Verzeichniskontrolle ergänzt dessen vollständige Byteprüfung vor der reversiblen Verschiebung, sie ist kein erneuter Hashlauf über den verschobenen Rückfallbaum.

Der Browserzoom wurde auf 100 Prozent zurückgestellt und ausdrücklich nachgeprüft. Geräteemulation ist ausgeschaltet, Entwicklerwerkzeuge sind geschlossen. Die letzte Prüfung der eigenen Standards zeigte null Einträge. Es erfolgte kein allgemeiner Browserdatenreset.

## Gesamtmatrix und Abschluss

| ID | Vollzugsstand |
| --- | --- |
| D01 Kanonische Adresse | Bestanden |
| D02 Weiterleitungen | Drei Varianten bestanden, unverändertes Zielmuster |
| D03 Paketidentität | Öffentliche MVP08-Bytes, alle acht Altassets, tatsächliche App-Konfiguration und sichtbarer Datenstand bestätigt |
| D04 Sicherheitsheader | Bekannte unveränderte Abweichung ausdrücklich akzeptiert, nicht bestanden |
| D05 Cache | Bekannte unveränderte Restabweichung ausdrücklich akzeptiert, strikter Test nicht bestanden |
| D06 Laufzeitnetzwerk | Im beobachteten P-Lade-, Rechen- und Exportablauf bestanden |
| D07 Deutsch | Neue Verfahrenspfade, Zusatzstadien, Bestands- und Sperrfälle sowie Datumstasten- und Kalenderdialogproben im beschriebenen Umfang bestanden |
| D08 Französisch | A01, B01, B02 und C03 sowie gespeicherte französische Kalenderdatei bestanden |
| D09 Darstellung | DE/FR breit, 390 × 878 und 720 × 878 Pixel sowie tatsächlicher 200-Prozent-Zoom mit sichtbarem Fokus bestanden. Kein neuer physischer Gerätetest |
| D10 Standards und Datenschutz | v4→v5, Schutz des alten Rohwerts, Speichern ohne Fallfakten, Resetmarker und gezielte Wiederherstellung des eigenen leeren Ausgangsstands bestanden |
| D11 Fehler und Invalidierung | Die bezeichneten Sperr- und Invalidierungsfälle bestanden |
| D12 Root und Abschlusszustand | Öffentliche Rootbytes, Linkziele, vollständiger Rootkonfigurationsvergleich über den Hostingeditor sowie Hosting- und Browserabschlusszustand bestanden. Nachweistypen wie oben qualifiziert |

Der technische P-Vollzug ist innerhalb der erteilten Freigabe abgeschlossen. Zehn Prüfpunkte sind bestanden, zwei enthalten die ausdrücklich akzeptierten bekannten Abweichungen und bleiben als strikte Tests nicht bestanden. Es besteht kein weiterer offener Mindestnachweis der ausgeführten Matrix. Ein zusätzlicher Produktfehler, der den freigegebenen Rückfall ausgelöst hätte, wurde nicht festgestellt. Die frische Sicherung und der alte MVP07-Rechnerbaum bleiben verfügbar.

### Endgültige Betriebsfreigabe

David Steimer hat am 16. Oktober 2026 nach Vorlage des abgeschlossenen technischen Nachweises erklärt:

> Ich gebe den öffentlichen P-Betrieb von MVP 0.8 gestützt auf den Produktionsnachweis vom 16. Oktober 2026 unter Beibehaltung des dokumentierten begrenzten Header-/Cacherisikos frei. Bitte veröffentliche auch den Nachweis auf GitHub.

Die Freigabe betrifft den oben gebundenen MVP08-Stand. Sie behebt die dokumentierten Header-/Cacheabweichungen nicht und erweitert weder die rechtliche Abdeckung noch den freigegebenen Einsatzumfang. Der Publikationsauftrag betrifft diesen Nachweis, nicht die privaten Rohbelege, Sicherungen oder Browserdaten. Die zuvor erhobenen Prüfbelege bleiben unverändert.

### Gebundene Nachweise

Rohbelege, Browserpräferenzen und Sicherungen bleiben privat. Die Prüfsummen ordnen die Nachweise zu, ohne private Hostingpfade, Authentifizierungsangaben oder Browserrohtexte zu veröffentlichen.

| Nachweis | SHA-256 |
| --- | --- |
| Unveränderte lokale P-Bereitstellungsvorlage MVP08 | `d63a034d43cc3ecea259537d7f8e89caed03277a2185aed39e725b8453c1c41c` |
| Unveränderte lokale P-Prüfmatrix MVP08 | `8d4dc6518c0545ac22cb5f0838f015b55c1d7bd39cf137d810778e1ee1b0d6d6` |
| Frische Sicherungsintegrität | `bc85f1502164909eecfff998e892b23a584e03e85aa1475ae9023eca7e229bcf` |
| Hostingrücklesung aller 20 Dateien | `2ebc203d2aead18282e2176a8cb7ccfdd70b86a6cdee9583d16590ea25488f7b` |
| Zuordnung des tatsächlichen Rücklesearchivs | `e9becd5b2dd85bd17be0a0b20c6565ead1a7acb1800f05d051eb72d9184d72c5` |
| Tatsächliche Stage-Browserprüfung | `17c6b211c0e9d87447b22aabcbb249e963e8d2a43b8b6b4d1b9d10b7056c18d8` |
| Kuratierter P-Browserprüfnachweis mit Fall-, Datums-, Speicher- und Layoutzuordnung | `a95ea5a47e1f9051e25d6373775e7a6d14792d640001e5d2493b757ff8da8090` |
| Produktions-HTTP-Prüfung | `a0f27eb4ae3b219503c0658a0901d2663133fa28765a52ec1ba1da98ce9c80da` |
| Produktionsweiterleitungen | `ac19913dce6ad1912fd05bef94903d34444676b2b319d34fb2c4036bbc31f050` |
| Acht erhaltene Altassets auf P | `085239ce594d490a805b072da377e461b8f46f56e10a2417d3aa6192e977cd0f` |
| Öffentlicher Root-Bytevergleich | `7888931c181ebb7dfe1fac0615a6e775da68f4987cef771b2d928bf88149286f` |
| Root-, Quellcode- und Lizenzziele | `22433863c8c609f2441689c9c545a6c9d038c9ea8f671059cc324fa99d48efd8` |
| Unabhängige Prüfung der beiden P-Kalenderdateien | `695bac0ad602f3ef7fc226bf0719351790dbc1548dc9542285a55cfd52a39461` |
| Native Netzwerkaufnahme nach Start, Rechnen und Exporten | `25f2cc0420a68ff6621294defc2f948f8f7924e6d70d523639825e4f30968dc7` |
| Native Standardsprüfung ohne gespeicherte GR-Fallfakten | `b67f69a380e1af1edf0ba039cfd5fdaf35fe96cc58b393f6824e41ff3051dff6` |
| Native Speichertabelle nach gezielter Testbereinigung | `360aac7791bf5032c489023196f27fcac3ac7be8369b2334a0bf07653cf7e01e` |
| Abschliessende Rootkonfiguration sowie Hosting- und Browserzustand | `6150083e636f6344c3f64df09d51d7e0e4845f11468bcb64590a32abf423f149` |

**Dieser Nachweis erklärt keinen uneingeschränkten D01–D12-Pass. Die endgültige Betriebsfreigabe stammt ausdrücklich von David Steimer, nicht von Codex.** Fachliche und betriebliche Verantwortung bleiben bei David Steimer. Der technische Nachweis und der anschliessende menschliche Betriebsentscheid bleiben getrennt dokumentiert.
