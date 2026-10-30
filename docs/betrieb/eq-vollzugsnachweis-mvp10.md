# R10-C · Technischer E-/Q-Vollzugsnachweis MVP 0.10

Stand: 30. Oktober 2026. **C01–C07 sind im gebundenen Umfang technisch abgeschlossen. C08 und die menschlichen Bestätigungen M01–M04 sind offen.** Dieser lokale Nachtrag ersetzt weder die fachliche Q-Abnahme noch eine Publikations- oder Betriebsfreigabe.

Grundlagen sind die freigegebene [Installationsvorlage, Fassung 1.0 vom 29. Oktober](eq-installationsvorlage-mvp10.md), der [gebundene Rückfallweg](rueckfall-mvp10.md) und die unveränderte [Prüfmatrix](pruefmatrix-mvp10.md). Die ursprünglichen Vorlagen und ihre damaligen Statusangaben bleiben als Freigabegrundlage unverändert. Der tatsächliche Vollzug wird hier additiv dokumentiert.

## 1. Gebundener Stand

| Gegenstand | Technisch nachgewiesener Stand |
| --- | --- |
| Katalog und vier bestehende E-/Q-Apps | `0.10.0.0`, keine zusätzliche Siteinstallation |
| Paket | `fristenrechner-schweiz-0.10.0.0.sppkg`, 843’895 Bytes, SHA-256 `7b4af4f28426434a5c15c1055a6a5f029e34d6982d108a868fabf63a7e5278fd` |
| Aktuelle Datenquelle je Host | Eigener SharePoint-Mirror `2026-10-28-mvp-010-approved.1` |
| Datenvertrag | Manifest/Mindestconsumer `17.0.0`, Verwaltungskatalog `10.0.0`, 45 Dateien einschliesslich Manifest |
| Funktionsumfang | 245 ausserbernische Verwaltungspfade in 25 Kantonen und getrennter Berner Bestand im vereinbarten Umfang. Keine pauschale Abdeckung kantonaler Spezialgesetze |
| Historische AP5-Ansichten | Alter Pin und Daten unter dem neuen gemeinsamen Paketcode separat geprüft und erhalten |
| Recovery | Gebundener Kandidat `0.10.0.1` mit MVP09-Funktionsumfang nicht im Tenant eingesetzt |
| Produktsprachen | DE und FR. IT/RM bleiben ausserhalb dieses Releases |

Der technische Abschluss bindet die ursprünglichen Onlineaufnahmen und die aktuellen lokalen Nachprüfungen getrennt. Die Schlusskontrolle ist **kein neuer gleichzeitiger Onlinebestand aller Ressourcen**.

## 2. Ablaufgates und Prüfumfang

| Ablaufgate | Ergebnis |
| --- | --- |
| C01 Ausgangssicherung | Paket, vier bestehende Instanzen, konkrete Konfigurationen und historische AP5-Ziele vor dem Wechsel gesichert und zugeordnet |
| C02/C03 Mirrorupload und Rohbyteprüfung | Manueller Upload durch David. Je Host 45 neue und 42 eigene Rückfalldateien vollständig geprüft. Insgesamt 180 neue und 168 alte Originalantworten, zusammen 348 |
| C04 Katalog und E | Bestehende Katalogdatei ersetzt, beide bestehenden E-Apps aktualisiert und eigene Mirrorpfade umgestellt. Gemeinsame Codewirkung berücksichtigt |
| C05 E-Gate | Erforderliche E-Teilmenge auf beiden Hosts vollständig belegt. T07 auf beiden Q-Verbrauchern unter neuem Code mit alten Format-9-Mirrors und T09 auf beiden AP5-Ansichten vor der Q-Umstellung separat gebunden |
| C06 Q-Umstellung | Beide bestehenden Q-Apps aktualisiert und aktuelle Mirrors umgestellt. Q-Teams: ausschliesslich Mirrorpfad als Webparteigenschaft geändert. Bei Q-SharePoint bleibt das gesondert akzeptierte Layoutdelta ausdrücklich dokumentiert |
| C07 Q-Technik | Auf Q-SharePoint und Q-Teams jeweils alle 53 funktionalen Matrixzeilen A01–A25, B01–B22 und C01–C06 abgeschlossen. T01–T06, T08 und T10 pro Host geprüft. Vorherige T07-/T09-Belege ausdrücklich wiederverwendet |
| C08 menschlicher Abschluss | Offen. Geräteprüfung, tatsächliche B2B-Anmeldung, fachliche Q-Abnahme und Outlook-Entscheid nicht durch technische Ergebnisse ersetzt |

Die 53 funktionalen Zeilen enthalten mehrere Varianten. Q-Teams umfasst beispielsweise 136 A-/B-Fall-/Sprachvarianten sowie den separat ergänzten französischen Nachweis der unmittelbaren Ergebnisinvalidierung. Daraus wird weder eine manuelle Prüfung jeder Kombination noch aller 245 Pfade abgeleitet. Die vollständige lokale Pfadregression bleibt ein eigener Nachweis.

Die Hostprüfung umfasst insbesondere:

- Wirklich geladene Daten- und Bundlebytes, Datenquellenwechsel, kalten und warmen Fehlabruf sowie quellengebundene Cachetrennung.
- Positive Berechnungen, Kalender-/Stillstandsmechanismen, Zeit- und Qualifikationsgrenzen, gesperrte Ergebnisse und Exportinvalidierung.
- Tatsächlich geöffnete Kantons-/Erlassauswahlen in DE und FR, mit separatem Berner Bestand.
- Datumskurzformen, Fokuswechsel und ausdrückliche Neuberechnung.
- V5-Bestand, neue Standards, nicht gespeicherte aktuelle Fallfakten, geschützte beschädigte beziehungsweise zukünftige Rohwerte, Resetmarker und V4→V5-Migration.
- Breite und schmale DE-/FR-Ansichten und tatsächlichen Browserzoom von 300 Prozent auf allen vier Hosts. Die SPFx-Quellenzeile bleibt zugänglich. Am abschliessend geprüften Q-Teams-Datumsfeld sind 32 CSS-Pixel Höhe, 14 CSS-Pixel Schrift und linksbündige Ausrichtung tatsächlich im Browser nachgewiesen.
- Acht getrennte, tatsächlich gespeicherte Kalenderdateien aus vier Hosts und zwei Sprachen. Datum 12.10.2026, exklusives Ende 13.10.2026, frei, Kategorie `Fristablauf`, Erinnerung `-PT112H`, eindeutige Referenzen und UIDs sowie UTF-8, CRLF und Zeilenfaltung geprüft. Kein Outlook-Import.

## 3. Qualifikationen und verbleibende Textbefunde

Der Abschluss ist kein pauschaler Befund «fehlerfrei». Zwei von David ausdrücklich begrenzt akzeptierte Textbefunde bleiben unverändert im Paket:

| Kennung | Befund und Grenze |
| --- | --- |
| R10C-E-SP-B09-H01 | In der BL-Rechenspur steht in DE/FR `administrativeOfficeClosure` statt einer übersetzten Bezeichnung. Der separate Abschnitt erläutert die Büroschliessung verständlich. Das geprüfte Enddatum 04.01.2027 und die Behandlung als Endverschiebung statt Stillstand sind korrekt |
| R10C-E-SP-B22-H01 | Beim späteren VD-Abbruch wegen erforderlicher Tage ausserhalb der Abdeckung erscheinen «Kein Friststillstand im berechneten Zeitraum» beziehungsweise «Aucune suspension pendant la période calculée». Der Text ist unzutreffend. Definitives Fristresultat und Export bleiben korrekt gesperrt |

Die begrenzte Weiterprüfung ist keine Fehlerbehebung und keine dauerhafte Ausnahme. Die [Nacharbeit mit Abnahmekriterien](../ux/r10c-restbefunde.md) ist separat festgehalten. Die alten MVP09-Befunde T06-H01 und B11-H01 wurden mit R10-U1 bearbeitet und in der aktuellen Hostmatrix nachgeprüft. Sie dürfen nicht mit den neuen B09-/B22-Befunden gleichgesetzt werden.

Weitere Nachweisgrenzen bleiben erhalten:

- Die gesondert akzeptierten kurzen breiten Sperrregel-Vorbereitungsabweichungen auf E-Teams und Q-SharePoint bleiben dokumentiert. Mögliche Hintergrundwirkungen werden nicht ausgeschlossen. Die eigentlichen Tests mit exakten Manifestregeln und deren Entfernung sind getrennt belegt. Daraus entsteht keine Erlaubnis für künftige breite Sperren.
- Die V4-Migrationen erfolgten nach jeweils eigener ausdrücklicher Freigabe zum Entfernen genau eines vollständig gesicherten eigenen V5-Resetmarkers im bestehenden isolierten Prüfkontext. Dies wird nicht als vollständig frische Sitzung ausgegeben. Die alten eigenen V4-Werte blieben bytegleich.
- `R10C-Q-SP-C06-LAYOUT-H01` bleibt eine ausdrücklich akzeptierte Konfigurations-/Layoutabweichung. Die anschliessende frische Layoutprüfung ist ein eigener Nachweis.
- Q-Teams hatte während der Testeingabe vorübergehend einen ungültigen Mirrorpfad-Zwischenwert. Der Schutz wies ihn zurück. Der abschliessend gespeicherte vollständige Vergleich bestätigt den exakten freigegebenen Pfad. Es wird nicht behauptet, dass sämtliche Zwischenabrufe ausgeblieben seien.
- Ungefilterte Zwischenerfassungen der Speichertabelle wurden nicht als Rohwertnachweis gewertet. Sie wurden datensparsam bereinigt. Die betroffenen positiven Speicherfälle wurden mit gezielt gefilterten Aufnahmen wiederholt und separat geprüft.
- Vorübergehende SharePoint-Hostfehler beim Neuladen in Q-Teams sind mit anschliessend erfolgreichen regulären Wiederanläufen dokumentiert. Ihre Ursache ist nicht bestimmt. Keine Änderung von Berechtigungen, Sicherheitseinstellungen oder Browserdaten zur Behebung.
- Ein tatsächlich aus dem Browsercache geliefertes, bytegleiches Bundle wird nicht als frischer Netzwerktransfer bezeichnet. Gefilterte Netzwerknachweise sind keine vollständige Aufzeichnung sämtlicher Browserkommunikation.

Eigene Standards wurden nach den Tests regulär zurückgesetzt, eigene alte Testwerte bewusst erhalten, Testsperren entfernt, Zoom auf 100 Prozent und Fenstergrösse zurückgestellt. Der letzte Q-Teams-Zustand ist deutsch, ohne Datum, aktuelle Qualifikation, Resultat oder Export. Die Entwicklerwerkzeuge sind geschlossen. Kein allgemeiner Browserdatenreset.

## 4. Schlussintegrität

Der additive private C07-Gesamtnachweis bindet **2’959 Eingabedateien**. Einschliesslich des separat gehashten Abschlussberichts sind es 2’960 Dateibindungen. Neunzehn benannte Teilprüfer wurden erneut gegen gespeicherte Nachweise ausgeführt. Die neue Q-Teams-Layoutprüfung bindet sechs Sprach-/Layoutkombinationen und die tatsächlichen CSS-Werte. Der Migrationsprüfer bestätigt den Rohwertschutz, die Übernahme ohne erfundene Fallfakten und den anschliessenden regulären Reset.

| Nachweis | SHA-256 |
| --- | --- |
| E-Gate C05 | `661838620acddcf38f5691ef1199666cf1a655f3263cc477fddb2e513312ed45` |
| Q-SharePoint-Abschluss | `791eeb6c16c3fa4c879ec770241e45d38c8055a7c5b5d6e4cbb572fd8f09cb82` |
| Q-Teams V4→V5-Migration | `19428ead1bc6141e65fb6f7b22b31eea7c77c81b7f6762de3288b2886e580aab` |
| Q-Teams T06-Layout | `389c38aba3d0a44a1aa2352cc5c366d3ef0690215bf9d1dd0d925be34b2b469d` |
| Acht Host-Kalenderdateien | `39a50d6cbfcd6651c2e453a328cb2541390b7b8f6fdd97c5934ad887a2c85719` |
| C07 beider Q-Hosts, 688’207 Bytes | `ccd0b82ccb364935c7a9944ec4d2c55ef61b74da377f831a5869012ccf7ecafd` |

Die privaten Vollbelege liegen im lokalen Deploymentordner. Konkrete Tenant-, Speicher- und Browserdaten werden nicht in öffentliche Nachweise übernommen. Ältere Teilberichte behalten ihre damaligen offenen Statusflags. Erst dieser additive Abschluss schliesst die technischen Restpunkte. Es wird kein erneuter semantischer Lauf jedes historischen Unterprüfers behauptet.

## 5. Kurze Übergabe an David · M01–M04

Bitte auf den bestehenden Q-Zielen prüfen, nicht auf der historischen AP5-Ansicht. Unten muss `2026-10-28-mvp-010-approved.1` und `SharePoint-Mirror` stehen. Nur synthetische Angaben verwenden. Ein Kalenderdownload genügt, **nicht in Outlook importieren**.

| Schritt | Konkrete Prüfung |
| --- | --- |
| M01 Geräte | Verwendetes Gerät, OS, Browser/App und Tastatur nennen. Datum/Platzhalter, Tab/Enter/Weiter, breite/schmale Ansicht, Rechenspur und Quellenzeile prüfen. Mindestens AI-/VD-Eröffnungswahl und NE-Region bedienen. Den bekannten iPad-/Magic-Keyboard-Befund getrennt erhalten. VoiceOver nur bei tatsächlicher Prüfung bestätigen |
| M02 bestehender B2B-Gast | Tatsächlich auf Q-SharePoint **und** Q-Teams in der zulässigen Umgebung anmelden. Datenstand, die nachfolgenden drei Kernfälle und einen echten Kalenderdownload prüfen. Keine neue Einladung, Rechteänderung oder Umgehung von Conditional Access |
| A25 positiv | Wallis, Gericht, angeordnete Eingabe, Empfang 02.10.2026, zehn Tage und zutreffende positive Fallqualifikation → **12.10.2026**, Export verfügbar |
| B18 gesperrt | Gleicher VS-Pfad, Empfang 19.03.2027, ein Tag → **kein definitives Fristresultat und kein Export** wegen Endverschiebung in den anwendbaren Stillstand |
| C03 Sozialbestand | BE → VRPG → Sozialversicherungsrecht → ELG → Einsprache. Zuständiger Kanton BE, Partei ohne Vertretung BE, Empfang 16.09.2026 → **16.10.2026**. Danach Zuständigkeit auf ZH oder Feiertagsanknüpfung offen → kein Resultat/Export |
| NE-Region | NE, Verwaltungsverfahren, angeordnete Eingabe, 26.05.2027, ein Tag. Zuständige Stelle ausserhalb Le Landeron → **27.05.2027**, in Le Landeron → **28.05.2027**, Region offen → gesperrt |
| AI-/VD-Eröffnung | AI angeordnete Eingabe, innerer Kantonsteil, 19.09.2026, zehn Tage: qualifizierte Eröffnung → **29.09.2026**, vollständig qualifizierter Trackingzweig → **01.10.2026**. VD administrative Dreitagesfrist, 19.09.2026: qualifizierte Eröffnung → **22.09.2026**, vollständig qualifizierter Postzweig → **25.09.2026**. Fehlende aktuelle Qualifikationen sperren |
| M03 fachliche Q-Abnahme | Gebundenen Stand einschliesslich der zwei oben benannten, nicht behobenen Textbefunde und der dokumentierten Nachweisgrenzen ausdrücklich abnehmen |
| M04 Outlook | Den [aktuellen begrenzten Wiederverwendungsvorschlag](outlook-wiederverwendung-mvp10.md) ausdrücklich bestätigen oder einen separaten Importtest beauftragen |

Nach tatsächlich bestandener Prüfung kann die Bestätigung beispielsweise lauten:

> Geräteprüfung und bestehender B2B-Gastzugriff auf Q-SharePoint und Q-Teams sind bestanden. Verwendet wurden: [Gerät, OS, Browser/App, Tastatur]. Ich nehme Q für das gebundene Paket 0.10.0.0 mit Datenrelease 2026-10-28-mvp-010-approved.1 einschliesslich der dokumentierten Nachweisgrenzen und der begrenzt akzeptierten Textbefunde R10C-E-SP-B09-H01 und R10C-E-SP-B22-H01 ab. Ich bestätige die begrenzte Wiederverwendung der Outlook-Nachweise gemäss Vorschlag vom 30. Oktober 2026.

**Noch nicht erteilt.** Aus dieser Vorlage folgt keine Abnahme. GitHub, P, neue Gäste, M365-Berechtigungen, Richtlinien, AP21 und E05 blieben unverändert. Nach C08 folgt der separat zu beauftragende Schritt R10-D. Der lokale Einstiegspunkt **R10B-CLI-H01** bleibt vor der Quellpublikation gesondert zu behandeln.
