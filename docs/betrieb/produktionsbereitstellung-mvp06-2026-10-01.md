# MVP 0.6 Produktionsbereitstellung vom 1. Oktober 2026

**MVP 0.6 ist auf der öffentlichen Rechneradresse bereitgestellt. Die funktionalen Produktionsprüfungen sind abgeschlossen. D04 und D05 bleiben mit den ausdrücklich akzeptierten, unveränderten Header- und Cacheabweichungen dokumentiert. Es besteht keine weitere offene Position der ausgeführten P-Prüfmatrix.**

Dieser Vollzugsnachweis ergänzt das [Publikationspaket MVP 0.6](publikationspaket-mvp06.md), den [Deploymentplan](deployment-mvp-06.md) und die [Q-Abnahme](abnahme-q-mvp06.md). Er ändert weder den gebundenen Publikationsstand noch die Releaseartefakte. Frühere Angaben zum noch ausstehenden Vollzug in eingefrorenen Unterlagen bleiben historische Aussagen. David Steimer hat die Veröffentlichung dieses gesonderten Dokumentationsnachtrags auf GitHub ausdrücklich beauftragt.

## Auftrag und Releasebindung

David Steimer hat die Veröffentlichung der beiden gebundenen Commits und die P-Bereitstellung mit frischer Sicherung, Vorprüfung, öffentlicher Prüfmatrix und Rückfall bei anderen Fehlern ausdrücklich freigegeben. Die erneute Akzeptanz des bekannten Header- und Cachebefunds ist auf MVP 0.6 und das unveränderte nachgewiesene Muster begrenzt. Der zusätzlich freigegebene technische Browserzugriff hat den sachlichen Auftrag nicht erweitert.

| Merkmal | Nachgewiesener Stand |
| --- | --- |
| Öffentliche Adresse | [Fristenrechner Schweiz](https://www.steimer.ch/fristenrechner/) |
| Anwendung | `0.6.0` |
| Zugehöriger korrigierter SPFx-Stand | `0.6.0.1`, bereits separat in E/Q geprüft und abgenommen |
| Datenrelease | `2026-10-01-mvp-06-approved.1` |
| Datenvertrag | Manifest und Mindestconsumer `6.0.0`, Sozialverfahrenskatalog `2.0.0` |
| Fachlicher Umfang | 44 nationale Sozialregeln mit 50 freigegebenen Berner Anbindungen. Keine zusätzliche Kantonsfreigabe |
| Veröffentlichter Produktcommit | `f7174294b117e2111d92072a089183271d358731` |
| Veröffentlichter Datenpin | `19b37336974f3ba7c72333763e1272425239b8cd` |
| Datenmanifest SHA-256 | `637cfc03c777f350031ba6c28676c685c16f25733391e1f25b0a3580016f5724` |
| Definitives Webarchiv | `fristenrechner-mvp06-steimer-web-corrected-0601.zip`, 499’306 Bytes |
| Webarchiv SHA-256 | `37e949e0442365a86b5b4e90e25a5a4ef9d8209a31644f3de119f2862b9d3810` |

Es wurde kein neuer Produktbuild erstellt. Ausschliesslich das gebundene korrigierte Webarchiv wurde verwendet. Root-Webauftritt, Sitemap, Hostingkonfiguration, E/Q und M365-Berechtigungen wurden durch diesen P-Vollzug nicht verändert.

## GitHub und temporärer Schlüssel

Die beiden freigegebenen Commits wurden ohne Force-Push auf `main` veröffentlicht. GitHub-API, SSH-Nachvergleich und ein unabhängiger anonymer öffentlicher Nachvergleich bestätigten den Zielcommit. Die öffentliche Stichprobe umfasste die Zwei-Commit-Kette, das Inventar, das korrigierte Webarchiv, das SPFx-Paket und die elf Laufzeitdateien am unveränderlichen Datenpin. Insgesamt wurden 14 Dateien und vier Metadatenantworten geprüft. Dies ist kein vollständiger erneuter Download aller 736 inventarisierten Dateien.

Der Nutzer entfernte den temporären Deploy-Key anschliessend. Die frische GitHub-Ansicht bestätigte die Löschung und einen leeren Deploy-Key-Bestand. Der isolierte Leseversuch mit ausschliesslich diesem Schlüssel wurde abgewiesen. Danach wurden die beiden lokalen Schlüsseldateien entfernt und der leere temporäre Schlüsselordner bestätigt. Im damaligen Publikationsvollzug wurden keine zusätzlichen Commits, Tags, Releases oder Issueänderungen vorgenommen. Die anschliessend separat beauftragte Veröffentlichung dieses Nachweises ist ein reiner Dokumentationsnachtrag.

## Sicherung und Umschaltung

Vor dem Eingriff wurde der tatsächliche Website-Nutzbestand neu gesichert. Das heruntergeladene Archiv enthält 44 Dateien und 6’648’904 entpackte Bytes. CRC, sichere eindeutige Pfade und vollständige Bytegleichheit mit der entpackten Benutzerkopie sind geprüft. Die zwölf bisherigen MVP-0.5-Dateien, zwei erhaltene MVP-0.3-Assets und elf öffentlich erfasste Rootressourcen stimmen mit den gebundenen Referenzen überein. Die Sicherung enthält auch die Root- und App-Konfiguration.

Die Websitesicherung umfasst 3’512’323 Bytes. Ihre SHA-256-Prüfsumme lautet `6a846e2754249503ace2e625eb64795df270c831dcd949713882d9a28ea0e6fa`. Sie bleibt privat und ist nicht Teil des GitHub-Pushs. Private Ablagepfade und Zugangsdaten werden hier nicht veröffentlicht.

Der gesonderte Transportwrapper enthielt zwölf unveränderte Kandidatdateien sowie vier verifizierte alte JS-/CSS-Assets für bereits geöffnete Seiten. Er umfasst 715’842 Bytes und hat SHA-256 `f47e4c51f5c36da25a9cb2c13ef87c65395289d25bece84f43f1e3db228fed2a`. Der Wrapper ist kein neuer Produktbuild.

Der Upload erfolgte zunächst ausserhalb des Webroots. Die neue Kopie wurde anschliessend an einer unverlinkten, aber öffentlich erreichbaren Stageadresse geprüft. Diese Adresse wird nicht als zugriffsgeschützt bezeichnet. Alle elf öffentlichen Kandidatdateien und vier Altassets waren bytegleich. Die Stage-Browserprüfung ergab für StPO, Zustellung 16.09.2026 und zehn Tage korrekt den 28.09.2026. Die auf dem Host sichtbare App-Konfiguration wurde vollständig gelesen, ohne sie zu speichern. Eine heruntergeladene Hashprüfung dieser nicht öffentlich lesbaren Hostdatei wird nicht behauptet.

Nach bestandener Vorprüfung wurde der bisherige produktive Rechnerbaum reversibel in einen privaten Rückfallbereich verschoben. Danach wurde ausschliesslich die geprüfte öffentliche Stage auf den produktiven Rechnernamen umbenannt. Die frischen Hostingansichten bestätigten die jeweiligen Quell- und Zielzustände. Die separate öffentliche Stage blieb nicht zurück. **Die Umschaltung war nicht atomar. Eine genaue Unterbruchsdauer wurde nicht gemessen.** Sicherung, alter Rechnerbaum und private Vorprüfungskopie bleiben erhalten. Ein Rückfall war nicht erforderlich.

## Öffentliche HTTP-Prüfung

Die neue Prüfung der tatsächlichen P-Adresse nach der Umschaltung am 1. Oktober 2026 umfasst 37 HTTP-Antworten in zwei gebundenen Berichten. Sie bestätigt:

- Die kanonische Rechneradresse liefert HTTP 200 und den freigegebenen Stand.
- Alle elf öffentlich lesbaren Kandidatdateien und vier erhaltenen Altassets stimmen nach Grösse und SHA-256 überein.
- Drei HTTP- beziehungsweise nichtkanonische Adressvarianten führen mit 301 auf die kanonische HTTPS-Adresse und liefern dort 200.
- Alle elf vorher erfassten Rootressourcen einschliesslich Sitemap bleiben byteidentisch.
- Die 16 rollen- und methodengebundenen Headerbeobachtungen, einschliesslich fünf HEAD-/GET-Paaren, entsprechen dem unmittelbar vor dem Vollzug erneut bestätigten Risikomuster.

**D04 ist nicht bestanden.** Die dokumentierten Sicherheitsheader fehlen bei bestimmten GET-Antworten weiterhin, obwohl sie bei HEAD geliefert werden. Es wird weder eine Behebung noch eine geklärte Ursache behauptet.

**D05 enthält die bekannte akzeptierte Restabweichung.** Die vorgesehenen Cachevorgaben sind vorhanden, die gleichlautende doppelte Altersangabe bleibt bestehen. Der strikte Cachetest ist deshalb nicht pauschal bestanden. Neue, widersprüchliche oder weitergehende Abweichungen sind von der Akzeptanz nicht gedeckt und wurden im gebundenen Vergleich nicht festgestellt.

## Tatsächliche Browserprüfung

Die folgenden Fälle wurden in Chrome auf der tatsächlichen P-Adresse ausgeführt, nicht nur lokal oder auf der Stage. Sozialfälle verwendeten ausdrücklich den Berner Kontext, die jeweils separat erforderliche Berner Fallanknüpfung sowie Partei BE ohne Vertretung. Zustellung war jeweils der 16.09.2026.

| Fall | Eingabe und beobachtetes Ergebnis |
| --- | --- |
| P01 StPO | Zehn Tage, Beginn 17.09., rechnerisches Ende 26.09., definitives Ende 28.09.2026 |
| P02 EOG | Einsprache, fixe 30 Tage, 16.10.2026 |
| P03 FamZG | Einsprache, fixe 30 Tage, 16.10.2026 |
| P04 FLG | Einsprache, fixe 30 Tage, 16.10.2026 |
| P05 MVG | Einsprache, fixe 30 Tage, 16.10.2026 |
| P06 ÜLG | Einsprache, fixe 30 Tage, 16.10.2026 |
| P07 EOG kantonale Kasse | Beschwerde, Kasse und Gericht BE separat, Zuständigkeitszeitpunkt separat 16.09.2026, Ende 16.10.2026. Rechenspur `BE-SOC-EOG-CANTONAL-APP` |
| P08 EOG nichtkantonale Kasse | Beschwerde, Gericht und massgebender Wohnsitz BE, separater Zuständigkeitszeitpunkt, Ende 16.10.2026. Rechenspur `BE-SOC-EOG-ORDINARY-APP` |
| P09 MVG Verwaltungsfrist | Ausdrücklich angeordnete zehn Tage, rechnerisch 26.09., definitiv 28.09.2026. Rechenspur `BE-SOC-MVG-ADMIN-ADM` |
| P10 ÜLG Französisch | Vollständiger französischer Ablauf und Ergebnis 16.10.2026 |

Die fünf Einsprachepfade wurden jeweils mit fehlender spezifischer Kantonsangabe und mit ZH gesperrt. Hinzu kamen fehlende Feiertagsanknüpfung, fehlende EOG-Kassenart, fehlender EOG-Zuständigkeitszeitpunkt und die Zustellung 18.11.2027 mit Ende ausserhalb der geprüften Abdeckung. Es erschien jeweils weder ein gültiger Fristablauf noch ein Kalenderexport. Beim Wechsel der EOG-Kassenart verschwanden unpassende Fallangaben und das alte Ergebnis, während das Zustellungsdatum erhalten blieb.

Dies ist eine gezielte P-Stichprobe, keine erneute Browserprüfung aller 50 Anbindungen. Die vollständigen lokalen Nachweise und die vier E/Q-Instanzen bleiben gesondert dokumentiert.

### Kalenderdateien

Alle sieben vorgesehenen Dateien wurden tatsächlich aus P heruntergeladen und unabhängig gegen die erwartete Exportsemantik geprüft. Die anfänglich nicht bestätigten automatischen Downloadversuche wurden nicht als Erfolg gewertet. Die abschliessenden Downloads gelangen über den tatsächlich aktiven nativen Chrome-Tab und den Speicherdialog. Browser-Sicherheitseinstellungen wurden nicht geändert. Eine abschliessende Ursache der anfänglichen Bedienprobleme wird nicht behauptet.

| Fall | Bytes | SHA-256 |
| --- | ---: | --- |
| EOG DE | 670 | `948bdbc9a530687c2bf8a1f1b6d8a45e3b12e2e08413867b8af95591b2b2c109` |
| FamZG DE | 674 | `89ab1ab8fd66629dd8751f2200665004bec541c9e1afbb30883985142f768a24` |
| FLG DE | 670 | `e023828420fd0794efcb4f23fca81d42ef717935e998f5277c926f3f0e824abd` |
| MVG DE | 670 | `455f982adb9ede8eb9e55080ae382f50aa8f3bb65174a03173d384f05c7cba49` |
| ÜLG DE | 672 | `4eb470fa5a7918596af828f54d61559a62b3f26d3e57849327a60dc8c04cc652` |
| ÜLG FR | 710 | `04e66633e50313afa18176d785789f4017cd3f28172dec60d122817ffb723537` |
| MVG angeordnete Verwaltungsfrist DE | 678 | `8b2232bafb422de50997e0d6b79043cd45f4efcb46c0cf94ca7b1e7f05d407b2` |

Die ersten sechs Dateien enthalten ganztägig den 16.10.2026 mit exklusivem Ende 17.10.2026. Die MVG-Verwaltungsdatei enthält den 28./29.09.2026. Geprüft sind unter anderem freie Verfügbarkeit, Kategorie `Fristablauf`, Erinnerung `-PT112H`, synthetische Referenz, deutsche beziehungsweise französische Betreffzeile und korrekte Dateistruktur. In diesem P-Lauf wurde nichts in Outlook importiert. Die bereits ausdrücklich erlaubte Wiederverwendung der [Outlook-Nachweise](outlook-pruefung-mvp05.md) bleibt davon getrennt. Eine dunkelgrüne Anzeige im jeweiligen Outlook-Kategorienbestand wird durch diese Dateien allein nicht nachgewiesen.

### Netzwerk und Darstellung

Die tatsächliche native Network-Beobachtung nach ungefiltertem Neuladen umfasste zunächst 23 Einträge. Acht HTTPS-Anfragen einschliesslich eines doppelten Faviconabrufs stammten ausschliesslich aus dem gleichursprünglichen Rechnerpfad. Die übrigen 15 Einträge waren 14 Browsererweiterungsressourcen und eine Data-URI. Keine appfremde HTTP-/HTTPS-Verbindung wurde beobachtet. Erweiterungen werden nicht der Anwendung zugerechnet. P verwendet eingebettete Daten. Ein künstlicher Mirror-Ausfall wurde deshalb nicht als P-Prüfung ausgegeben.

Der zweispaltige Desktopaufbau und die französische lange Feiertagsauswahl wurden geprüft. Bei 848 Pixeln Viewport waren sichtbare Inhalts- und Scrollbreite jeweils 833 Pixel. Bei 390 Pixeln waren sie nach abgeschlossener Layoutanpassung wiederholt jeweils 375 Pixel. Der kurzzeitig während der Grössenänderung abweichende Zwischenwert wurde nicht als Endzustand verwendet. Die temporäre Grössenvorgabe wurde aufgehoben.

### Tatsächliche Prüfung der Standards

Der vorhandene eigene Rohwert wurde vor der Prüfung privat gesichert. Danach wurde ein vollständiger synthetischer EOG-Gerichtsfall mit Zustellung 16.09.2026, separat eingegebenem Zuständigkeitszeitpunkt 17.09.2026, Referenz und Ergebnis 16.10.2026 erfasst und über **Als Standard speichern** gespeichert.

Die tatsächliche DevTools-Speichertabelle zeigte ausschliesslich erlaubte Präferenzen. Zustellungsdatum, Zuständigkeitszeitpunkt, fallbezogene Kassen- und Gerichtsangaben, Referenz und Ergebnis waren nicht enthalten. Nach dem Neuladen blieben Rechtsgebiet und Handlung als Präferenzen erhalten, die Falldaten und das Ergebnis nicht. **Standards zurücksetzen** entfernte den eigenen Schlüssel tatsächlich. Die Local-Storage-Tabelle war leer, ebenso die separat kontrollierte Session-Storage-Tabelle.

Anschliessend wurde der zuvor gesicherte Rohwert über die native Speichertabelle exakt wiederhergestellt und zeichengetreu verglichen. Das erneute Laden bestätigte die ursprünglichen eigenen Standards sowie ein leeres Empfangsdatum ohne Testresultat. Andere Browserdaten wurden nicht gelöscht oder verändert. Damit ist die direkte Storage-Prüfung für MVP 0.6 vollständig nachgewiesen. Dies ändert den historischen MVP-0.5-Nachweis nicht rückwirkend.

## Gesamtmatrix und Abschluss

| ID | Vollzugsstand |
| --- | --- |
| D01 Kanonische Adresse | Bestanden |
| D02 Weiterleitungen | Bestanden, drei Varianten |
| D03 Paketidentität | Bestanden, öffentliche Bytes und sichtbare Release-ID |
| D04 Sicherheitsheader | Bekannte unveränderte Abweichung, ausdrücklich akzeptiert, nicht bestanden |
| D05 Cache | Bekannte unveränderte Restabweichung akzeptiert, strikter Test nicht bestanden |
| D06 Externe Aufrufe | Im tatsächlich beobachteten Browserablauf bestanden |
| D07 Deutsch | Positive Fälle, Sperrproben und sechs tatsächliche Kalenderdateien bestanden |
| D08 Französisch | ÜLG-Oberfläche, Ergebnis und tatsächliche Kalenderdatei bestanden |
| D09 Darstellung | Desktop, 848-Pixel-FR-Auswahl und stabile 390-Pixel-Ansicht bestanden |
| D10 Datenschutz | Tatsächliches Speichern, Rohwert, Neuladen, Entfernen und exakte Wiederherstellung bestanden |
| D11 Fehlerfälle | Geplante Sperr- und Rücksetzstichproben bestanden |
| D12 Root-Integration | Elf Root-Bytevergleiche unverändert, Rechnerlink, vorhandener Impressumsanker sowie Quellcode- und Lizenzverweise kontrolliert |

Der technische P-Vollzug ist innerhalb der ausdrücklich erteilten Freigabe abgeschlossen. Es wurde kein anderer Fehler festgestellt, der den freigegebenen Rückfall erfordert hätte. Die Sicherungen und der alte Rechnerbestand bleiben verfügbar. Die Header- und Cacheabweichung bleibt nach konkreter Supportrückmeldung und vor einem weiteren P-Release erneut zu beurteilen.

Die Rohbelege bleiben in der privaten Betriebsablage. Der HTTP-Hauptbericht zur öffentlichen P-Adresse hat SHA-256 `7252fb04006b42b9ca55bac2251b20cba73a30923592477d79b8e0b4ea9c2ae2`, der Ergänzungsbericht `6b3b4c6b594f2692c618aa701df6e9c49b7b75fdfaa11a0a873302ede1585a16` und der unabhängige GitHub-Nachvergleich `ad9c9be1a73f749e258073839caa22c337a754a8362274f94b0ee83b47cfd16d`. Einzelne Browseraktionen sind durch das Ausführungsprotokoll belegt, nicht durch eine unabhängige zweite Browserausführung.

**Dieser Nachweis erklärt keinen uneingeschränkten D01–D12-Pass und enthält keinen neuen formellen Betriebsentscheid durch Codex.** Fachliche und betriebliche Verantwortung bleiben bei David Steimer. Die Veröffentlichung dieses zusätzlichen Dokumentationsnachtrags ist nicht Bestandteil des bereits ausgeführten Zwei-Commit-Pushs.
