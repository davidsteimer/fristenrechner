# MVP 0.10 Produktionsbereitstellung vom 30. Oktober 2026

**Produktionsnachweis mit Betriebsfreigabe und Publikationsauftrag, Fassung 1.2 vom 30. Oktober 2026. MVP 0.10 ist auf `https://www.steimer.ch/fristenrechner/` bereitgestellt. Sicherung, Rücklesung, Stage und öffentliche Prüfung sind abgeschlossen. Die zehn aktiven D-Prüfpunkte sind bestanden beziehungsweise mit den unten ausdrücklich akzeptierten Restbefunden abgeschlossen. D04 und D05 wurden nicht erneut ausgeführt. David Steimer hat den öffentlichen P-Betrieb am 30.10.2026 unter Beibehaltung des dokumentierten Header-/Cacherisikos und der ausdrücklich akzeptierten Restbefunde freigegeben. Anschliessend hat er die Veröffentlichung dieses Nachweises und des Nacharbeits-Eintrags im öffentlichen Repository beauftragt.**

David hat die P-Freigabevorlage Fassung 1.0 vom 30.10.2026 einschliesslich R10P-I01, R10P-R01, R10P-B01 und R10P-H01 freigegeben. Zwei im P-Lauf zusätzlich festgestellte Befunde hat er anschliessend einzeln begrenzt akzeptiert. Nach Vorlage des vollständigen technischen Nachweises hat er die endgültige P-Betriebsfreigabe gesondert erteilt. Die technische Fassung 1.0 bleibt als unveränderte private historische Kopie erhalten.

## Gebundener Stand

| Gegenstand | Tatsächlicher Stand |
| --- | --- |
| Produktivziel | `https://www.steimer.ch/fristenrechner/` auf der bestehenden Hostinginfrastruktur |
| Anwendung / Daten | `0.10.0` / `2026-10-28-mvp-010-approved.1` |
| Datenverträge | Manifest und Mindestconsumer `17.0.0`, Verwaltungskatalog `10.0.0` |
| Datenmanifest | SHA-256 `7562597cee45ad1e4995989f7f31b2e8d0619baaf1f9618355ca870c8426a016` |
| Publikationscommit | `754f4c89657eefb8bdf57030b6968c974ffbada6` |
| Datencommit | `01bbd96a296b0fc4d64cd554acc8cb122c3017a3` |
| Unverändertes Web-ZIP | `fristenrechner-mvp10-steimer-web.zip`, 1’060’212 Bytes, SHA-256 `a94740a78034e8cc41ae2c4907b917729c6f4743d7a307a60ee25834d550e1b3` |
| Hauptassets | `app-IGQKWSJ5.js` und `app-PQFJG2Q2.css` |
| Vorheriger P-Stand | App `0.9.0`, Daten `2026-10-18-mvp-09-approved.1` |

Die Bereitstellung verändert weder Produktbuild noch Rechtsdaten. Der Transport enthält die zwölf unveränderten Kandidatdateien und elf frisch bestätigte frühere JS-/CSS-Assets für noch offene Seiten. Gemeinsame unveränderte Dateien sind nur einmal enthalten. Der Transportwrapper ist kein neuer Produktbuild.

## Vollzug und Sicherung

| Schritt | Ergebnis |
| --- | --- |
| R10P-01 Istbestand | Bestehenden Vertrag, Produktivbaum und konkrete Ziele frisch bestätigt. MVP09-Identität, Rechner und Root-Nutzbestand inventarisiert |
| R10P-02 Sicherung | Alle 52 Website-Nutzdateien einschliesslich versteckter Dateien im privaten Sicherungsarchiv bestätigt. CRC, sichere eindeutige Pfade, vollständiges Inventar und Sollbytes geprüft. 49 öffentlich zugängliche Ausgangsdateien passen bytegenau zur Sicherung |
| R10P-03 Privater Kandidat | 23 Transportdateien hochgeladen, privat entpackt und tatsächlich vollständig zurückgelesen. Alle Pfade, Längen und SHA-256-Prüfsummen passen, einschliesslich App-`.htaccess` und elf Altassets |
| R10P-04 Stage | Alle 22 öffentlichen Dateien und der zusätzliche Basisaufruf bytegenau bestätigt. Gebundene App-/Datenidentität und tatsächliches Hauptbundle zugeordnet. Alle bezeichneten Stage-Rechen-, Sperr- und Wechselvarianten bestanden |
| R10P-05 Umschaltung | Ausgangsstand unmittelbar nochmals bestätigt. MVP09-Baum unverändert in den privaten Rückfallbereich verschoben, danach den geprüften Stagebaum auf den Produktivnamen umbenannt. Kein Mischen oder Einzeldateiüberschreiben |
| R10P-06 Öffentliche Prüfung | Zehn aktive D-Prüfpunkte abgeschlossen, mit den ausdrücklich akzeptierten Grenzen bei D07–D09. Zwei tatsächlich gespeicherte P-Kalenderdateien geprüft. Rootintegrität, Rückfallbaum und eigener Prüfzustand abschliessend bestätigt |
| R10P-07 Betriebsentscheid | Abgeschlossen. David hat den öffentlichen P-Betrieb am 30.10.2026 gestützt auf diesen Nachweis unter Beibehaltung des Header-/Cacherisikos und der ausdrücklich akzeptierten Restbefunde freigegeben. Die anschliessende GitHub-Veröffentlichung dieses Nachweises und des Nacharbeits-Eintrags ist ausdrücklich beauftragt |

Die anfängliche Sicherungskopie enthielt zwei Rootdateien noch nicht. David erlaubte ausdrücklich, ausschliesslich diese beiden fehlenden Dateien in die bestehende Sicherung zu ergänzen. Erst die nachfolgende vollständige Prüfung schloss den Sicherungshaltepunkt. Die Gesamtkopie wurde nicht wiederholt, vorhandene Sicherungen wurden nicht gelöscht. Zeitweilige Web-FTP-Timeouts und unklare Toolreaktionen wurden nicht als Vollzugsnachweis gewertet.

| Archiv | Bytes | SHA-256 |
| --- | ---: | --- |
| Frische vollständige Ausgangssicherung | 4’636’716 | `82e841f69891c2317e4c069ceb8c08c9f42d235deea6df0e41c362a679b788c9` |
| Transportwrapper, 23 Dateien | 2’391’829 | `9a49421b5c5952306f1b8f32352ca2dba2a703bbafe9ee8083acb060b3ccf332` |
| Tatsächlich heruntergeladenes Rücklesearchiv | 2’403’737 | `4b5c6964e61011ab3b88a074fc89b89483edf641c9619ca1fa030dc08ac0bc7b` |

Unterschiedliche ZIP-Archivbytes sind kein Unterschied der darin vollständig verglichenen Nutzdateien. Der Stage-Abschluss ist vor der Umschaltung belegt. Die Umschaltung war wie freigegeben nicht atomar. Eine genaue Unterbruchdauer wurde nicht gemessen. Kein Rückfall war erforderlich.

## Öffentliche Prüfmatrix und tatsächliche Abdeckung

Massgebend bleiben die unverändert erhaltene P-Matrix Fassung 1.0 und ihre gebundene fachliche Fallvorgabe. Ihre ursprünglichen Statusspalten sind Planungshistorie. Der tatsächliche Vollzug lautet:

| ID | Ergebnis |
| --- | --- |
| D01 Kanonischer Aufruf | Bestanden. Öffentliche HTTPS-Seite, richtige App und eingebetteter Datenstand, keine Anmeldung |
| D02 Weiterleitungen | Bestanden. Alle drei vorgegebenen HTTP-/Hostvarianten führen zur kanonischen HTTPS-Adresse |
| D03 Dateiintegrität | Bestanden. 22 öffentliche Dateien und zusätzlicher Basisaufruf bytegleich. Alle 23 Hostingdateien zugeordnet, vollständige Rohbyte-Rücklesung einschliesslich `.htaccess` liegt vor |
| D04 Sicherheitsheader | Gemäss Betreiberentscheid nicht erneut ausgeführt. Kein aktueller Pass und kein neuer Nachweis unveränderter Ausprägung |
| D05 Cache-Control | Gemäss Betreiberentscheid nicht erneut ausgeführt. Kein HEAD-/GET-/Cachevergleich |
| D06 Tatsächlicher Netzverkehr | Bestanden im beobachteten Ablauf. Appressourcen vom eigenen Hosting. Nach Berechnungen und beiden Downloads keine zusätzlichen Requests mit synthetischen Eingaben oder Referenzen beobachtet. Cachehits und bewusst geöffnete Rechtslinks getrennt erfasst |
| D07 Rechen- und Regelabdeckung DE | Bestanden mit R10P-B01. A01–A25, B01–B22 und C01–C06 einschliesslich ihrer bezeichneten Teilvarianten geprüft |
| D08 Französisch, Rechenspur und Rechtslinks | Abgeschlossen mit R10P-B01 und dem gesondert akzeptierten R10P-D08-H01. Vorgesehene FR-Fälle gerechnet. 36 von 39 beobachteten URL-Varianten führen zum bestätigten Rechtsdokument, drei datierte Fedlex-Links zur Fehlerseite |
| D09 Darstellung und Datum | Abgeschlossen mit R10P-D09-H01. Breite/schmale DE-/FR-Ansichten, echter Browserzoom, Datumshilfen und Tastaturablauf geprüft. Screenreaderwirkung des Fokusbefunds bleibt offen |
| D10 Standards Version 5 | Bestanden. Sechs Speicher-/Neuladefälle, gezielter Reset, Rohwertkontrolle und Wiederherstellung des eigenen gesicherten V5-Ausgangszustands |
| D11 Sperren, Invalidierung und Kalenderdateien | Bestanden. Negative Varianten ohne definitives Ergebnis/Export. Alle bezeichneten Wechsel invalidieren sofort. Zwei neue DE-/FR-P-Downloads tatsächlich gespeichert und vollständig geprüft |
| D12 Unveränderte Umgebung und Abschluss | Bestanden. Öffentliche Rootbytes, verborgene Inhalte und MVP09-Rückfallbestand bestätigt. Keine separate öffentliche Stage, keine privaten Archive im Webroot. Eigene Testzustände zurückgenommen |

**Das ist kein Befund «D01–D12 uneingeschränkt bestanden».** Zwei Punkte wurden bewusst nicht wiederholt. Die akzeptierten Text-, Quellenlink- und Barrierefreiheitsbefunde bleiben offen.

Die funktionale Prüfung umfasst **53 mehrteilige Gruppen**: 25 positive ausserbernische Kantonsfälle, 22 Regel-/Sperrgruppen und sechs Bundes-/BE-Bestandsgruppen. Alle 26 Kantone und die jeweiligen Erlasse wurden in DE und FR angezeigt. Die zusätzlichen französischen Rechenprüfungen umfassen A23–A25, B09, B15–B18, B21/B22 und C03. Der Belegindex trennt bestätigte Endzustände von vorbereitenden oder nicht zuverlässig übernommenen Eingaben.

Besonders bestätigt sind die unterschiedlichen Verwaltungs-/Gerichtsstillstände, AG-/SO-Prozesskalender, BL-Büroschliessungen als Endverschiebung, NE-Behördenregionen, qualifizierte Eröffnung gegenüber tatsächlichem Postzugang, begrenzte Nachfristen, aktuelle Fallqualifikationen sowie frühe und späte Abdeckungssperren. Beispiele: BL endet am **04.01.2027 ohne Stillstand**, NE unterscheidet **27./28.05.2027**, VD **25./22.09.2026**, VS Verwaltung/Gericht **11./28.01.2027**. Unsichere Endtage und unterschiedliche Januarergebnisse sperren weiterhin Resultat und Export.

Die im Datenvertrag enthaltenen 245 ausserbernischen Pfade, neun getrennten BE-Regeln, 35 Kalender, 36 Feiertagsbindungen und 46 Stillstandsprofile sind durch lokale Regression und Artefaktbindung abgesichert. Sie wurden nicht sämtlich als einzelne manuelle P-Fälle wiederholt. Die Sozialfreigaben bleiben auf Bern und 2026–2027 begrenzt. FR-/NE-/GR-/AI-, Januar-, OF-001- und Zeitgrenzen bleiben erhalten. Der historische Freiburger Spiegel erhält keine eigenständige positive Fallfreigabe. Die ordentliche Quellenprüfung per 15.11.2026 bleibt ein eigener offener Vorgang.

## Methoden, Datum und Standards

Die Hauptprüfung erfolgte in einer eigenen Chrome-Gastsitzung auf der tatsächlichen P-Adresse. Wiederholte Ausfälle der nativen Bedienverbindung führten zu Haltepunkten und manuellen Fensteraktivierungen durch David. Aktionen ohne beobachteten Erfolg zählen nicht. Die französische BL-Kollisionsvariante und ergänzende unmittelbare Feldwechsel wurden abschliessend in einer zusätzlichen In-App-Browser-Registerkarte auf derselben P-Adresse geprüft. Dort wurden keine Standards gespeichert oder zurückgesetzt. Die Belege kennzeichnen diese andere Methode ausdrücklich.

Auf der Stage wurde durch eine fehlgeleitete Bedienaktion ein eigener VD-Teststandard gespeichert. Stage und P teilen denselben Origin. Der gesicherte eigene V5-Ausgangszustand wurde vor dem P-Lauf wiederhergestellt. Die Abweichung ist dokumentiert und zählt nicht als bestandener Speichertest. Fremde Präferenzen wurden nicht verändert.

Bei etwa 720 CSS-Pixeln ist die Oberfläche DE/FR zweispaltig, bei etwa 390 einspaltig. Pflichtfelder und Schaltflächen bleiben erreichbar. Die Ansichten wurden gespeichert und visuell geprüft. Das Desktop-Datumsfeld misst 32 CSS-Pixel Höhe mit 14 Pixel Schrift und Platzhalter, linksbündig. Frühe Eingabe, Vollformat, Tag mit Tab, Tag.Monat mit Enter, `h` mit Fokuswechsel, Leerwert, ungültiger 31. Februar und Kalenderwahl sind bestätigt. `h` ergab am tatsächlichen Schweizer Prüftag den 30.10.2026.

Der echte Chrome-Zoom wurde von 100 auf 300 und zurück auf 100 Prozent gestellt. Fokus und Berechnungsschaltfläche bleiben erreichbar. Geräte- und Breitenübersteuerungen wurden zurückgenommen. Die Touch-Sollwerte 44/16 stammen aus CSS beziehungsweise Simulation. Daraus folgt kein neuer realer iPad-/iPhone-Test. Der Kalenderpicker ist der Fluent-UI-Dialog der App, kein natives Browser-Datumsfeld.

Die sechs Speicherfälle betreffen ZH, AI, VS, ELG, TG und NE. Nach regulärem Neuladen bleiben stabile Auswahl und gesetzliche Dauer erhalten. Angeordnete Dauer bei AI/VS ist wieder leer. Empfangsdatum, Referenz, aktuelle Qualifikationen, Zuständigkeits- und Regionsfakten bleiben ungespeichert. Kein altes Resultat oder Export. Nach regulärem Reset und Neuladen ist `{"version":5,"state":"reset"}` im tatsächlichen Speicher bestätigt. Der zuvor nicht vorhandene V1-Schlüssel bleibt abwesend. Anschliessend wurde ausschliesslich der eigene V5-Ausgangswert wiederhergestellt und frisch zurückgelesen. Der letzte reguläre Seitenaufruf zeigt leere Fallauswahl und kein altes Ergebnis.

Beschädigte/künftige Standards und V4→V5 werden im abgenommenen E-/Q-Umfang wiederverwendet. Kein neuer P-Migrationsnachweis, keine Requestsperren, kein allgemeiner Browserdatenreset. Die zusätzlichen In-App-Prüfregisterkarten wurden geschlossen, Entwicklerwerkzeuge und eigene Darstellungsübersteuerungen im Chrome-Prüffenster beendet.

## Zwei tatsächliche Kalenderdateien

Beide Dateien stammen aus A25, VS-Gerichtseingabe, qualifizierte Eröffnung 02.10.2026, zehn angeordnete Tage und aktuelle positive Fallqualifikation. Sie wurden aus der kanonischen P-App erzeugt und über den regulären Speicherdialog tatsächlich gesichert.

| Datei und Referenz | Bytes | SHA-256 |
| --- | ---: | --- |
| `QA-MVP10-P-DE-VS.ics` / `QA-MVP10-P-DE-VS` | 7’262 | `29d1b7552b0a8e8ee3fd7769109c1da92200345c86cc0a8a6c57bd2164e4bf55` |
| `QA-MVP10-P-FR-VS.ics` / `QA-MVP10-P-FR-VS` | 7’300 | `d3fdf37dc56237a25b9bb4e5382795c45e7977f4759c9b50618a438e40bf914a` |

Bestätigt sind ganztägiger Beginn **12.10.2026**, exklusives Ende **13.10.2026**, Verfügbarkeit frei, Kategorie `Fristablauf`, Erinnerung `-PT112H`, passende DE-/FR-Betreffzeile, unterschiedliche UIDs, UTF-8, CRLF und Zeilenfaltung bis 75 Oktette. Die tatsächliche Herkunft stimmt mit Release und Pfad `vs-court-ordered` überein, einschliesslich bedingter Herkunftsangaben. Je ein Ereignis und Alarm, keine Teilnehmenden, Serien oder Anhänge. Kein Öffnen oder Importieren in Outlook.

Die bestätigte Outlook-Wiederverwendung bleibt begrenzt. Erinnerungszustellung, aktuelle Outlookversion, Kategoriefarbe und neue Herkunftsdarstellung in Outlook werden damit nicht neu nachgewiesen.

## Akzeptierte Restbefunde und Nacharbeit

| Kennung | Befund und konkrete Begrenzung | Entscheid |
| --- | --- | --- |
| R10P-B01 / BL | Technischer Text `administrativeOfficeClosure` in DE/FR. Zusätzliche Erklärung verständlich, Ende 04.01.2027 und Endverschiebung ohne Stillstand korrekt | Mit P-Vorlage begrenzt übernommen. Textkorrektur bleibt im bestehenden lokalen R10-C-Nachtrag |
| R10P-B01 / VD | «Kein Friststillstand» im späten Abbruchfall vom 01.12.2027 ist unzutreffend. Definitives Resultat und Export bleiben gesperrt | Mit P-Vorlage begrenzt übernommen. Abbruchtext bleibt im bestehenden lokalen R10-C-Nachtrag |
| R10P-D08-H01 | Datierte Fedlex-Links ELG 01.01.2026, AHVG 01.01.2026 und ATSG 01.01.2024 führen nach JavaScript-Laden zu «Error Page (404)». HTTP 200 der Apphülle ist kein Rechtsdokumentnachweis | David hat den konkreten Linkbefund am 30.10.2026 begrenzt akzeptiert. Quellenlinks im Folgerelease korrigieren, ohne still eine andere Rechtsfassung zu verwenden |
| R10P-D09-H01 | Chrome meldet beim Kalenderdialog einen Fokus-/`aria-hidden`-Konflikt. Kalenderwahl, Escape, Rückkehr ins Datumsfeld und anschliessendes Tab funktionieren. Screenreaderwirkung nicht ausgeschlossen | David hat den Befund am 30.10.2026 begrenzt akzeptiert. Fokusführung samt gezielter Screenreaderprüfung für den Folgerelease festgehalten |

Die beiden neuen P-Befunde sind im [Nacharbeits-Eintrag](../ux/r10p-restbefunde.md) mit Abnahmekriterien erfasst. Keine Korrektur am versiegelten Paket und keine GitHub-Karte wurden durch diesen Vollzug erstellt.

Die Rechtslinkkontrolle umfasst 39 tatsächlich beobachtete URL-Varianten einschliesslich Artikelankern, nicht 39 verschiedene Gesetze und nicht sämtliche App-Links. Bei 36 ist die Dokumentidentität anhand amtlicher PDF-/JSON-Inhalte oder tatsächlich gerenderter Browserseiten bestätigt. Die drei genannten Fedlex-Ziele sind ausdrücklich fehlgeschlagen und akzeptiert. Der aktuelle ATSG-Link lädt den richtigen Erlass. Der Walliser Link liefert amtliches JSON mit richtiger LPJA-Identität, keine aufbereitete HTML-Leseansicht. Dies ist eine technische Link-/Identitätsprüfung, keine erneute materielle Quellenabnahme. Datierten Fassungsangaben wird damit keine neue rechtliche Freigabe erteilt.

R10P-R01 bleibt daneben bestehen. Nach der von David übermittelten Supportauskunft lässt sich die gewünschte zuverlässige Headerauslieferung in der vorhandenen Shared-Hosting-Infrastruktur nicht umsetzen. Auch die Korrektur mehrfacher Cachevorgaben wurde nicht zugesichert. Diese Ursachenangabe stammt vom Support, nicht aus einer eigenen Hostingkonfigurationsprüfung. Gemäss ausdrücklichem Betreiberentscheid wurden D04/D05 nicht wiederholt. Weder ein aktueller Pass noch ein neuer Nachweis unveränderter Ausprägung wird behauptet.

## Rootintegrität, Rückfall und Nachweisbindung

Alle 28 öffentlichen Root-Nutzdateien ausserhalb des Rechnerbaums stimmen bytegenau mit der frischen Sicherung überein. Die letzte reguläre Web-FTP-Sitzung bestätigt zusätzlich sämtliche 17 angezeigten Zeilen der Root-`.htaccess`, 38 Zeilen der Root-`.vite/manifest.json` sowie 27 Zeilen der App-`.htaccess` gegen Sicherung beziehungsweise Kandidat. Die vollständigen Editoransichten wurden visuell geprüft. Dies ist ein abschliessender Inhaltsvergleich, kein neuer Rohbyte-Download der verborgenen Dateien. Die frühere vollständige Rohbyte-Rücklesung bleibt davon getrennt. Autospeichern war ausgeschaltet, kein Editor wurde gespeichert.

Der Produktivbaum enthält die 23 erwarteten regulären Dateien. Der private MVP09-Rückfallbaum enthält alle 22 gesicherten regulären Dateien mit passenden Pfaden, angezeigten Grössen und Berechtigungen. Sein vollständig sichtbares Manifest bestätigt MVP09 und den bisherigen Datenrelease. Keine separate öffentliche Stage und keine privaten Archive im Webroot. Sicherung und Uploadbereich bleiben privat erhalten. Impressum, öffentliches Repository und AGPL-Lizenz sind im Browser erreichbar.

| Privater technischer Nachweis | SHA-256 |
| --- | --- |
| Vollständige Sicherungsprüfung | `f87feac2d46617236f10a40ff06da1745c809b55e571bcf4586415a007a62425` |
| Tatsächliche Rückleseprüfung | `76d1af55dc258ec4bd5178d84c3587e3ff7fdda8b6b5a2b024de0dff3a226bf2` |
| Stage-Gate | `5af65aa63ee3367ded6010f9446fa88b14f66a1f991d84eedf91ef5b8cb52b5b` |
| Öffentliche Produktivbytes | `62e383e6424da0696b3402e66e89cf6d0655a10af6aa93e9b0b019499564172f` |
| Rootbytes und Weiterleitungen | `b369328cadf3b38d1bc648475b94f04f2594aa19455e936981d7c76cb9dcd90b` |
| Abschliessende Hostingkontrolle | `ed30be9f16dffc71016f98cd714d93c862ecfbbce67a5052f6e59fc9da473542` |
| Index der 53 P-Fallgruppen | `58292e709ecca4b5084dc5a9d5b7cf70f175f427e041b267a9a2e152dd2c162d` |
| Zwei gespeicherte Kalenderdateien | `5400006dafa077f6ee297d20ca78d76ba4056816d6196ea49c8462727b554111` |
| Konsolidierte Rechtslinkkontrolle | `b389c7bf9e11510708678893c01092ac5abcc198bdeae8b9355571f2ced9af96` |

Die unveränderte Freigabevorlage trägt SHA-256 `d823766a1aca12d48ef71402686ce83d179840b916b60a2ef37a4a988b822ac7`, die P-Matrix `a697648bc87f15b742bd4ff582e57e52d960bce016758168aeba2d49f25ce3c3` und ihre fachliche Fallvorgabe `498566463e4a62806c6255d596ec8a6e377c6d5376694d621692e2b62cfcabc3`. Die private Zielbindung bleibt `7f8ec24d4884341a6c18db24a0eae4dbf542d1776199c92b1936262b8b6fd90c`. Private Inventare, Browserzustände, Archive und Rohbelege sind vom Publikationsauftrag nicht umfasst.

## Endgültige Betriebsfreigabe

David Steimer hat am 30. Oktober 2026 nach Vorlage des abgeschlossenen technischen Nachweises ausdrücklich erklärt:

> Ich gebe den öffentlichen P-Betrieb von MVP 0.10 gestützt auf den Produktionsnachweis vom 30.10.2026 unter Beibehaltung des dokumentierten Header-/Cacherisikos und der ausdrücklich akzeptierten Restbefunde R10P-B01, R10P-D08-H01 und R10P-D09-H01 frei.

Die Freigabe betrifft ausschliesslich den oben gebundenen MVP10-Stand. Sie behebt die dokumentierten Befunde nicht und erweitert weder Rechtsabdeckung noch Freigabezeiträume. Die Nacharbeit bleibt offen.

Die unveränderte technische Fassung 1.0 vor der Betriebsfreigabe trägt SHA-256 `1977f2984e79cbfae646f5222a5c948a1a4bf6b9e27d851056f5db02282d6645`. Der zugehörige private technische Abschlussbeleg trägt SHA-256 `ac2d26d9e07820a39238928326ceb780be68b1adb20fa3264be5699dd0fa9148`. Beide bleiben historisch erhalten. Die Fassung 1.1 ergänzt ausschliesslich den erteilten Betriebsentscheid und trägt SHA-256 `928aa5abcba85509852ed631e52a81c77c87cc6243bcc800c086668ec061dcba`. Auch sie bleibt privat archiviert. Die Fassung 1.2 ergänzt den anschliessenden Publikationsauftrag und die gegenseitigen Dokumentverweise. Die technischen Prüfergebnisse und ihre Bindungen bleiben unverändert.

## Publikationsauftrag

David hat am 30. Oktober 2026 anschliessend erklärt:

> Bitte veröffentliche den Produktionsnachweis für MVP 0.10 und den Nacharbeits-Eintrag im öffentlichen Repository davidsteimer/fristenrechner.

Dieser Auftrag umfasst genau diesen Produktionsnachweis und `docs/ux/r10p-restbefunde.md`. Private Rohbelege, Sicherungsarchive, Browserdaten und Hostinginventare bleiben ausgeschlossen. Keine Produkt-, Rechtsdaten- oder Paketänderung durch die Dokumentpublikation. Root-Webauftritt, Sitemap, Hostingkonfiguration, E/Q, AP5 und M365-Rechte bleiben unverändert. David Steimer entscheidet in Personalunion. Codex unterstützt als dokumentiertes KI-Arbeitsinstrument ohne formelle Freigabe- oder Haftungsverantwortung.
