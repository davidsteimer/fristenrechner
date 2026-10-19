# MVP 0.9 Produktionsbereitstellung vom 19. Oktober 2026

**Produktionsnachweis mit Betriebsfreigabe, Fassung 1.1 vom 19. Oktober 2026. MVP09 ist auf dem Produktivpfad bereitgestellt. Sicherung, Rücklesung, Stage-Gate und alle zehn aktiven öffentlichen Prüfpunkte sind bestanden. D04 und D05 wurden gemäss Betreiberentscheid nicht erneut ausgeführt. David Steimer hat den öffentlichen P-Betrieb unter Beibehaltung des dokumentierten Header-/Cacherisikos ausdrücklich freigegeben und die Veröffentlichung dieses Nachweises auf GitHub beauftragt.**

David Steimer hat die lokale P-Freigabevorlage Fassung 1.0 mit R09P-I01, R09P-R01 und R09P-H01 ausdrücklich freigegeben. Sein anschliessender Auftrag verlangte zuerst die Prüfung der bereits angelegten Sicherung ohne erneute Kopie. Bei bestandener Sicherung durfte die gebundene Bereitstellung fortgesetzt werden. Freigabevorlage, Ausführungsplan und Betreiberentscheid bleiben unveränderte lokale Grundlagen. Ihre Prüfsummen sind unten gebunden. Die vorangehende Fassung 1.0 dieses Schlussnachweises bleibt als private historische Kopie erhalten.

## Gebundener Stand

| Gegenstand | Bindung |
| --- | --- |
| Produktivziel | `https://www.steimer.ch/fristenrechner/` im bestehenden Hostingvertrag |
| Anwendung und Daten des Kandidaten | `0.9.0`, `2026-10-18-mvp-09-approved.1` |
| Publikationscommit | `02209d0693479494ce5f57d12d3e4e2b4466eee3` |
| Definitives Web-ZIP | 658’325 Bytes, SHA-256 `f7d112b015833251d3d41a5fe418e9f8063fe85aa46e48c1dafbf053031516d3` |
| Bisheriger P-Stand | App `0.8.0`, Daten `2026-10-15-mvp-08-approved.1` |
| Ausgangssicherung | 50 Website-Dateien, 4’297’328 Archivbytes, SHA-256 `6a88849931d549587a96caeb207a270c6e7ccb22df71f6e83034239ed5aa0bee` |
| Geprüfter Transportwrapper | 22 Dateien, 1’655’522 Archivbytes, SHA-256 `e5b771255499d7f1358452aeefd40055f1afcb067df763f39d1cdfdeb194963c` |

Der Transportwrapper enthält die zwölf unveränderten MVP09-Kandidatdateien sowie zehn frisch bestätigte frühere gehashte JS-/CSS-Dateien für noch offene Seiten. Er ist kein neuer Produktbuild. Code, Rechtsdaten, E/Q-Pakete und bisherige Git-Veröffentlichung bleiben unverändert.

## Vollzug und Haltepunkte

| Schritt | Tatsächlicher Stand |
| --- | --- |
| R09P-01 Bestand | Bestehender Vertrag und Ziele bestätigt. Alle 19 öffentlichen MVP08-Rechnerdateien und elf gebundenen Rootressourcen frisch per GET und Inhaltshash bestätigt. Zwölf Website-Verzeichnisse mit 50 Nutzdateien vollständig inventarisiert |
| R09P-02 Sicherung | Abgeschlossen. Die ursprünglich einmal ausgelöste Kopie wurde nicht wiederholt. Vorhandener Sicherungsbaum vollständig lesend erfasst. Alle 50 Pfade, angezeigten Grössen und Berechtigungen stimmen mit der Quelle überein. Heruntergeladenes ZIP auf CRC, sichere eindeutige Pfade und alle Sollbytes geprüft, einschliesslich Root- und App-`.htaccess`. Alle 30 öffentlichen Ausgangsdateien passen zur Sicherung |
| R09P-03 Privater Kandidat | Abgeschlossen. Transportwrapper lokal geprüft, in den frisch bestätigten leeren privaten Uploadbereich übertragen und dort entpackt. Das tatsächlich heruntergeladene Rücklesearchiv enthält alle 22 Soll-Dateien mit identischen Längen und SHA-256-Prüfsummen, einschliesslich App-`.htaccess` und zehn Altassets. Keine Kandidatbytes verändert |
| R09P-04 Stage | Bestanden. Geprüften Kandidatenordner ohne Archive aus dem privaten Uploadbereich ins freie öffentliche Stageziel verschoben. Alle 21 öffentlichen Dateien und der zusätzliche HTML-Basisaufruf stimmen per GET bytegenau. In eigener Chrome-Gastsitzung C01, A13, A17, A22 DE/FR, B01 einschliesslich berechenbarer Kontrolle und B02 ausgeführt. Kontextwechsel und unbestätigte tatsächliche Tastatureingabe entfernen Ergebnis und Export. Richtiges Hauptbundle im tatsächlichen Browser-Netzwerk bestätigt, dessen Cachehit getrennt vom vollständigen Inhaltsvergleich ausgewiesen |
| R09P-05 Umschaltung | Ausgeführt. Zuvor alle 30 öffentlichen Ausgangsdateien erneut bestätigt. Bisherigen MVP08-Produktivbaum unverändert in den gebundenen privaten Rückfallordner verschoben. Danach geprüften Stageordner in `fristenrechner` umbenannt. Keine Zusammenführung oder Überschreibung. Separater öffentlicher Stagename nicht mehr vorhanden |
| R09P-06 Öffentliche P-Prüfung | Abgeschlossen. Alle 22 Produktiv-Inhaltsabrufe und die drei kanonischen Weiterleitungen bestanden. Alle 25 administrativen A-Grundfälle und sieben zusätzlichen Stadienvarianten in DE auf P gerechnet und mit Exportmöglichkeit bestätigt. Die B-Grenz-, Qualifikations-, Wechsel- und Tageszahlvarianten sind ausgeführt. Alle 13 neuen Pfade sperren fehlende, ungeklärte und abweichende Fallangaben. Beide tatsächlichen Kalenderdownloads vollständig geprüft. C01–C06 sowie die französischen A01/A09/A13/A17/A22/A24- und C03-Kontrollen sind bestätigt. Darstellung, Datumshilfen und drei Speicher-/Neuladefälle sind geprüft. Eigene Testpräferenzen gezielt zurückgesetzt und Reset nach Neuladen bestätigt. Alle 28 öffentlichen Root-Nutzdateien stimmen mit der Sicherung überein. Verborgene Konfigurationsdateien und privater MVP08-Rückfallbaum abschliessend lesend bestätigt |
| R09P-07 Betriebsentscheid | Abgeschlossen. David hat den öffentlichen P-Betrieb gestützt auf den Produktionsnachweis vom 19.10.2026 unter Beibehaltung des dokumentierten Header-/Cacherisikos freigegeben. Die Veröffentlichung dieses Nachweises auf GitHub ist ausdrücklich beauftragt |

Web-FTP meldete bei der ursprünglichen Kopie und später beim Archivieren Timeouts beziehungsweise einen unbestimmten Fehler. Daraus wurde kein Erfolg abgeleitet. Erst die später sichtbaren vorhandenen Bestände und das tatsächlich heruntergeladene, vollständig geprüfte Sicherungs-ZIP schlossen den Sicherungshaltepunkt. Die Ursachen der Meldungen wurden nicht unabhängig geklärt. Frühere private Zwischenbelege bleiben erhalten.

Die lokale Sicherungsprüfung bindet den Bericht mit SHA-256 `81493b61158d3020b8e7ed9e4463751f2292e6b2c941ddcdb373bdf0a1f7fc4d`. Der private Vergleich von Quellen- und Sicherungsinventar umfasst dieselben 50 Dateien in zwölf Verzeichnissen. Archive und vollständige private Hostinginventare werden nicht als öffentliche Repoanlagen übernommen.

Die Rücklesung wurde am 19. Oktober 2026 um 15.27 Uhr Schweizer Zeit abgeschlossen. Das Rücklesearchiv umfasst 1’662’257 Bytes und trägt SHA-256 `a5c1fa620179bae846afe2b4607025c0db34dcf78decdd897af4ccf2b2b689da`. Der zugehörige Prüfbericht trägt SHA-256 `b95f67153e6215b4f48cc1b4d5a2efeff587cdefad101457b2d34184da7b3d7c`.

Vor dem anschliessenden Verschieben zur öffentlichen Stage meldete Web-FTP eine abgelaufene Sitzung. Der reguläre Wiederaufruf aus der Hostingverwaltung wurde von der Browser-Zugriffsprüfung blockiert. David stellte die reguläre Dateiliste erneut bereit. Danach wurden die freien Ziele frisch bestätigt und die Bereitstellung ohne neue Kopie fortgesetzt.

Der Stage-Inhaltsvergleich trägt SHA-256 `69267be0800d2276f67aa6e14c0a88923034e7f4c3db2deb58c572895706e0da`, der anschliessende Produktiv-Inhaltsvergleich `6183e4956b7a8ca8f7630db4bef9b2798cf519813f4fb5e51af1eac525c7902f`. Die 32 administrativen DE-Berechnungen wurden auf der tatsächlichen kanonischen P-Adresse ausgeführt. Eine frühe, nicht zuverlässig übernommene automatisierte Datumseingabe wurde nicht als Produktfehler oder bestandener Fall gewertet. Die bestätigten P-Fälle verwenden beobachtete Eingaben über die normale Oberfläche.

Die tatsächliche Netzwerkansicht zeigt beim beobachteten Produktivladen sowie nach Berechnungen und beiden Downloads sieben Appressourcen ausschliesslich vom eigenen Hosting. Die erneut verwendeten Hauptassets waren ausdrücklich Cachehits und werden nicht als frische Browsertransfers ausgegeben. Der gesonderte vollständige GET-Inhaltsvergleich bestätigt deren Sollbytes. Keine externe Übermittlung der synthetischen Eingaben oder Referenzen wurde im beobachteten Netzverkehr festgestellt.

## Tatsächliche Kalenderdownloads

| Sprache | Testreferenz | Gespeicherte Bytes | SHA-256 |
| --- | --- | ---: | --- |
| Deutsch | `QA-MVP09-P-DE-AR5` | 2’422 | `bfc3ca6f9be6ba375ff16027f17e832fe31282879b6aaa22cce07e4151416871` |
| Französisch | `QA-MVP09-P-FR-AR5` | 2’461 | `db0d17232430e975bdbcc6a2a3db88ec814acad5609e8ee4e1d78828480b91bb` |

Beide Dateien wurden aus dem tatsächlichen kanonischen P-Rechner erzeugt und über den regulären Speicherdialog gesichert. Die Prüfung bestätigt den 07.10.2026 als ganztägigen Beginn, das exklusive Ende 08.10.2026, Verfügbarkeit «frei», Kategorie `Fristablauf`, Erinnerung `-PT112H`, passende DE-/FR-Betreffzeile, unterschiedliche UIDs, UTF-8, CRLF und Zeilenfaltung bis 75 Oktette. Die vollständige administrative Rechts- und Datenherkunft stimmt mit dem gebundenen Katalog überein, einschliesslich `ar-execution-5`, Datenrelease und Qualifikationsvertrag. Keine Teilnehmenden, Einladungen, Serien oder Anhänge. Sechs absichtlich veränderte Prüfkopien wurden verworfen. Die Originaldownloads blieben unverändert. Kein Outlook-Import.

Der private Dateiprüfbericht trägt SHA-256 `33d183a3b61566cd1c515f2f4c1d90b668b9f0a858ef067550b17b8673259baf`. Auslieferungszeit der Erinnerung, Kategoriefarbe und Outlookdarstellung werden dadurch nicht neu nachgewiesen. Dafür gilt die separat bestätigte begrenzte Wiederverwendung.

## Bedienhaltepunkt und kontrollierte Fortsetzung

Nach C05 «Neuenburg, Le Landeron: Nein» mit dem korrekten Ergebnis 27.05.2027 fiel die native Bedienverbindung wiederholt aus. David aktivierte anschliessend das richtige Chrome-Gastprüffenster. Die Variante «Ja» ist dort mit Empfang 26.05.2027, einem Tag Frist und korrektem Ergebnis 28.05.2027 ebenfalls bestätigt. Die Rechenspur nennt Fronleichnam am 27.05.2027 als Verschiebungsgrund.

David startete Codex anschliessend neu. Der Bildschirmzugriff wurde wiederhergestellt, native Tastatur- und Scrollaktionen bleiben jedoch unzuverlässig. Die vor dem Neustart nicht bestätigte GR-Umstellung zählt weiterhin nicht als Rechentest. Kein Browserdatenreset und keine Änderung von Sicherheits- oder Zugriffsrechten. Aus der Bedienstörung wird kein Produktfehler abgeleitet.

Die offenen Bestandsberechnungen und Layoutprüfungen wurden deshalb in einer eigenen zusätzlichen Chrome-Registerkarte über die Browseranbindung fortgesetzt. Diese Registerkarte verwendet das normale Browserprofil und ist keine neue isolierte Speichersitzung. Dort wurden weder Standards gespeichert noch zurückgesetzt. Die Speicherprüfung bleibt ausschliesslich dem bisherigen eigenen Gastfenster vorbehalten.

| Ergänzter P-Fall | Tatsächlich bestätigtes Ergebnis |
| --- | --- |
| C05 GR-Bundesrechtskontrolle | BE/StPO, Partei ohne Vertretung in GR, 16.09.2026 und zehn Tage: 28.09.2026. GR-Vorbehalt sichtbar |
| C03 AHVG DE und FR | Zuständige kantonale Ausgleichskasse BE, Partei in BE ohne Vertretung, 17.12.2026: 01.02.2027. Dreissig Tage, sechzehn Stillstandstage und lesbare ATSG-Rechenspur |
| C06 allgemeines VRPG-BE | Keine abweichende Spezialregel, 04.09.2026 und zehn Tage: 14.09.2026 |
| C06 EOG | Anspruchsberechtigte Person bei Zustellung in BE, Partei in BE ohne Vertretung, 16.09.2026: 16.10.2026. Fehlender Wohnsitzkanton, ZH und Empfang 18.11.2027 sperren jeweils Resultat und Export |

Die zusätzliche Rechenregisterkarte bestätigt auch die sofortige Entfernung von Resultat und Export bei noch nicht bestätigter Datumseingabe. Fehlende Fallangaben wurden nicht durch gespeicherte Präferenzen ersetzt.

Zwei weitere Eingabeversuche wurden gezielt wiederholt. Beim Luzerner Leertageszahltest stand zunächst tatsächlich «1» im Feld, wofür der 05.10.2026 korrekt war. Erst der anschliessend beobachtete Leerwert zählt als bestandene Sperrprüfung. Beim BE-ZPO-Wechsel war die erneut erforderliche Verfahrensart zunächst leer, weshalb die erste Sperre korrekt war. Nach neuer positiver Auswahl ist der 07.01.2027 bestätigt. Diese Ausführungsabweichungen sind keine Produktfehler und bleiben in den privaten Ereignisbelegen erkennbar.

## Darstellung und Abschlusskontrollen

Bei 720 CSS-Pixeln sind DE und FR zweispaltig, bei 390 CSS-Pixeln einspaltig. Die gemessene Dokumentbreite überschreitet die verfügbare Breite nicht. Die Ansichten wurden als tatsächliche P-Screenshots gesichert und visuell geprüft. Der Desktop-Datumseingang misst 32 CSS-Pixel bei 14 Pixel Schrift, einschliesslich Platzhalter, und ist linksbündig. Tag mit Tab, Tag und Monat mit Enter, `h` mit Fokuswechsel, vollständiges Datum, frühe Eingabe vor vollständigem Kontext, Leerwert, ungültiger 31. Februar und die optionale Kalenderauswahl sind auf P geprüft. `h` ergibt am tatsächlichen Prüftag den 19.10.2026.

Der echte Chrome-Zoom wurde im eigenen Gastfenster von 100 auf 300 Prozent und zurück auf 100 Prozent gestellt. Die Rechenschaltfläche bleibt erreichbar und fokussierbar. Die breitenbezogenen Browserübersteuerungen wurden ebenfalls zurückgenommen. Die ausgelieferte CSS-Datei enthält für grobe Zeiger den Sollwert 44 Pixel Höhe und 16 Pixel Schrift. Das ist ein Dateibefund, kein neuer Touchsimulations- oder realer Gerätetest.

Die zusätzliche Inhaltsprüfung bestätigt alle 28 öffentlich abrufbaren Nutzdateien ausserhalb des Rechnerordners bytegenau gegen die frische Sicherung. Die zunächst noch sichtbare Web-FTP-Liste gehörte zu einer abgelaufenen Sitzung und wurde nicht als frische Konfigurationsbestätigung gewertet. David öffnete anschliessend eine neue reguläre Sitzung.

In dieser frischen Sitzung stimmen alle 17 angezeigten Inhaltszeilen der Root-`.htaccess` und alle 38 Zeilen von `.vite/manifest.json` mit der Sicherung überein. Auch der vollständig angezeigte Inhalt der aktuellen App-`.htaccess` stimmt mit dem gebundenen Stand überein. Die Darstellungsleerzeichen und der Umbruch langer Editorzeilen wurden für diesen Inhaltsvergleich normalisiert. Das ist kein neuer Rohbyte-Download. Die separate frühere Rohbyteprüfung des Kandidaten bleibt unverändert erhalten. Automatisches Speichern blieb ausgeschaltet, alle Editoren wurden ohne Speichern geschlossen.

Der private Rückfallbaum ist zugänglich. Alle 20 regulären Dateien stimmen hinsichtlich Pfaden, angezeigten Grössen und Berechtigungen mit dem Ausgangsinventar überein. Sein vollständig angezeigtes Manifest stimmt mit der Sicherung überein und weist App `0.8.0` sowie Daten `2026-10-15-mvp-08-approved.1` aus. Der Vergleich umfasste die Grunddateien, sämtliche Assets und die drei Lizenzdateien. Es wurde weder neu archiviert noch kopiert, verschoben oder bereitgestellt. Eine anfängliche Zählabweichung des Prüfhelfers betraf ausschliesslich mitgezählte Tabellenüberschriften und Ordnerzeilen. Nach der ausdrücklich dokumentierten Unterscheidung regulärer Dateien ist das Inventar identisch.

Impressum, öffentliches Repository und AGPL-Lizenz sind im Browser erreichbar. Der ATSG-Link lädt den richtigen Erlass. Die fünf tatsächlich in den neuen LU-/ZG-/AR-Rechenspuren angezeigten amtlichen PDF-Links liefern jeweils erfolgreich eine PDF-Datei. Das ist eine Linkkontrolle, keine erneute inhaltliche Quellenabnahme.

Die abschliessende private Hostingkontrolle ist mit SHA-256 `6219efa46b6ad53fcdbb1d8b1c1deef689c11f13138f9867501c398b9ef5b4f9` gebunden. Der Vergleich der 28 öffentlichen Root-Nutzdateien trägt SHA-256 `b3f54a0a7ed9e8bda5f06ccc70d67b51dd676ce63e76c8e7a9db6325224f07f0`. Die fünf neuen amtlichen PDF-Links sind mit SHA-256 `07f54cacdc8c6fe294bf194937d0f75cc91da98d1af35a8cfbdb7c790596d856` dokumentiert.

## Standards und gezielter Reset

Die drei Speicher-/Neuladefälle wurden ausschliesslich im bestehenden eigenen Chrome-Gastprüffenster mit Empfang 02.10.2026 und synthetischer Referenz `QA-MVP09-P-DEFAULT` durchgeführt.

| Fall | Dauer und Sollresultat | Speicher- und Neuladenachweis |
| --- | --- | --- |
| LU, ordentliche Beschwerde vor der Verwaltungsinstanz | 30 Tage, 02.11.2026 | David bestätigt die vollständige Durchführung einschliesslich Sollresultat und Kontrolle nach dem Neuladen |
| ZG, ordentliche Verwaltungsbeschwerde | 20 Tage, 22.10.2026 | David bestätigt die vollständige Durchführung einschliesslich Sollresultat und Kontrolle nach dem Neuladen |
| AR, qualifizierter Nichtgeldvollstreckungsrekurs | Fünf Tage, 07.10.2026 | David meldet Speichern und Neuladen. Der letzte Formular- und Rohwertzustand wird anschliessend zusätzlich durch Codex aus der tatsächlichen Oberfläche gelesen |

Nach dem Neuladen bleiben jeweils Pfad und gesetzliche Dauer erhalten. Datum und Referenz sind leer, die positive Fallqualifikation muss neu gewählt werden und es gibt kein altes Resultat. Die Bestätigung für LU und ZG ist ein manueller Nachweis von David und keine nachträgliche automatisierte Rücklesung ihrer beiden Zwischenstände.

Die tatsächliche AR-Rücklesung bestätigt `authorityCode: AR`, `lawId: vrpg-ar`, `pathId: ar-execution-5`, Revision 1, Stadium `administrativeAppeal` und fünf Tage. Der gespeicherte V5-Wert enthält ausschliesslich stabile Präferenzen. Empfangsdatum, Referenz, Fallqualifikation und Dringlichkeit sind nicht gespeichert. Das Formular zeigt ein leeres Datum, die neue Qualifikationsauswahl «Bitte wählen» und weder altes Resultat noch Export.

Anschliessend wurde im selben eigenen Gastfenster die reguläre Schaltfläche «Standards zurücksetzen» verwendet. Der gespeicherte Wert lautet `{"version":5,"state":"reset"}`. Er bleibt nach regulärem Neuladen und Aktualisieren der lesenden Speichertabelle unverändert. Gemeinwesen und Erlass stehen auf «Bitte wählen», das Datum ist leer und es gibt kein früheres Resultat oder Export. V5 bleibt V5. Ein V1-Schlüssel war vor dem Test nicht vorhanden und ist auch danach nicht vorhanden. Es wurde kein solcher Schlüssel erzeugt oder gelöscht.

Die Prüfungen beschädigter und künftiger synthetischer Rohwerte sowie der unveränderten V4→V5-Altmigration werden im begrenzten, bereits abgenommenen Umfang aus E/Q wiederverwendet. Sie werden nicht als neue P-Prüfungen oder neue Formatmigration ausgewiesen. Kein allgemeiner Browserdatenreset, keine direkte Speicherlöschung und keine Änderung fremder Präferenzen. Zoom und eigene Breitenübersteuerungen sind zurückgenommen.

Der Rohwert- und Formularbeleg nach Reset und Neuladen trägt SHA-256 `8eebbe44adbcd15c9d0eead45af3f7b0ee74a4ead9ef72069fb8bfe30e87420d`, der zugehörige Screenshot `ea2a12bd9a0ad5e11bd9a1bc9c6c8e406e59c69b9d60f21cf10393b60ad73705`. Beide bleiben als private technische Nachweise ausserhalb der öffentlichen Repoanlagen.

## Öffentliche Prüfmatrix

Massgebend bleibt die unverändert lokal erhaltene P-Prüfmatrix MVP09 als ursprünglicher Ausführungsplan. Die tatsächlichen Ergebnisse lauten:

| ID | Ergebnis im tatsächlichen P-Vollzug |
| --- | --- |
| D01 Kanonischer Aufruf | Bestanden. Richtiger öffentlicher Rechner, App 0.9.0 und gebundener MVP09-Datenstand |
| D02 Weiterleitungen | Bestanden. Alle drei vorgegebenen Varianten führen zur kanonischen HTTPS-Adresse |
| D03 Vollständige Dateibytes | Bestanden. Öffentliche Inhalte bytegleich, vollständiger Kandidat zuvor rohbytegleich zurückgelesen, Konfigurationsbestand und tatsächliche Bundles zugeordnet |
| D04 Sicherheitsheader | Nicht erneut ausgeführt gemäss Betreiberentscheid vom 19.10.2026 |
| D05 Cache-Control | Nicht erneut ausgeführt gemäss Betreiberentscheid vom 19.10.2026 |
| D06 Tatsächlicher Netzverkehr | Bestanden im beobachteten Prüfablauf. Eigene Hostingressourcen, keine unerwartete Übermittlung der synthetischen Eingaben, Cachehits ausdrücklich getrennt |
| D07 Administrative Pfade DE | Bestanden. 25 Grundfälle und sieben zusätzliche Stadienvarianten auf P |
| D08 Sprache und Bestandsfunktionen | Bestanden. Vorgesehene FR-, B- und C-Varianten sowie Rechtslinks geprüft |
| D09 Darstellung und Datum | Bestanden. DE/FR breit und schmal, tatsächlicher Zoom, Datumshilfen und Desktop-Masse. Touch-CSS und wiederverwendete Q-Gerätenachweise bleiben getrennt |
| D10 Standards 5 | Bestanden. Drei Speicher-/Neuladefälle mit den oben bezeichneten manuellen und gelesenen Nachweisen, anschliessender gezielter Reset und erneutes Neuladen |
| D11 Sperren, Invalidierung und Kalenderdateien | Bestanden. Vorgesehene Sperren und Invalidierungen sowie zwei tatsächliche DE-/FR-Downloads geprüft |
| D12 Unveränderte Umgebung und Abschluss | Bestanden. Root-Nutzdateien und verborgene Inhalte bestätigt, Rückfallbaum erhalten, keine separate öffentliche Stage, eigene Testzustände gezielt zurückgenommen |

Damit sind **alle zehn aktiven D-Prüfpunkte bestanden**. Es gibt keinen neuen Header-/Cachepass. Die unveränderte ursprüngliche Statusspalte «Ausstehend» des Prüfplans ist kein aktueller Ergebnisstand.

D04 und D05 wurden gemäss Betreiberentscheid vom 19. Oktober 2026 nicht erneut ausgeführt. Nach der von David an diesem Tag übermittelten schriftlichen Supportauskunft wird die zuverlässige Auslieferung der betreffenden Response-Header in der bestehenden Shared-Hosting-Umgebung nicht unterstützt. Der Support sichert auch keine Korrektur mehrfacher Cachevorgaben zu und hat die Umgebung nicht verändert. Diese Ursachenangaben stammen aus der Supportauskunft und sind keine unabhängige Prüfung der Hostingkonfiguration. David hat angeordnet, den bekannten Befund nicht mehr zu prüfen. Kein aktueller Header-/Cachepass und kein erneuter Nachweis unveränderter Ausprägung werden behauptet. Die konkrete Plattformgrenze ist für diesen Vollzug begrenzt akzeptiert.

Der akzeptierte B11-H01-Zusatztext ausserhalb der Deckung bleibt ein Textbefund bei korrekt gesperrtem Resultat und Export. GR-, NE- und AI-Vorbehalte und die fachlichen Freigabefenster werden nicht erweitert. Der SPFx-spezifische T06-H01-Befund bleibt von diesem statischen P-Nachweis getrennt. Der akzeptierte Magic-Keyboard-Umgebungsbefund sowie die fehlende separate VoiceOver-Prüfung gelten weiterhin. Keine dieser Grenzen wird als behoben ausgegeben.

Die ursprünglichen P-Bedienereignisse sind mit SHA-256 `7a66e897366654c2bdaa8f8b0d41286366fb7daf18b245563147aaa5a3d85bf7` gebunden. Die ergänzenden Abschlussereignisse einschliesslich manuell bestätigter Speicherfälle und gelesenen Resets tragen SHA-256 `a40c4f13cb11a665207089df12d26a0e7a3496b8d29e337df30aab3136243b32`. Private Inventare, Sitzungsdaten und Sicherungsarchive bleiben von einer allfälligen öffentlichen Zusammenfassung ausgeschlossen.

## Abgrenzung

Der Produktivbaum ist auf MVP09 umgeschaltet. Root-Webauftritt, Sitemap, `robots.txt`, Hostingkonfiguration und E/Q wurden nicht verändert. Der technische P-Vollzug umfasst keinen Header-/Cachetest, Outlook-Import, allgemeinen Browserdatenreset oder GitHub-Push. Die anschliessend ausdrücklich beauftragte GitHub-Veröffentlichung betrifft ausschliesslich diesen Nachweis. Kein neuer Produktbuild und keine Änderung der bereitgestellten App- oder Rechtsdatenbytes.

## Endgültige Betriebsfreigabe und Publikationsauftrag

David Steimer hat am 19. Oktober 2026 nach Vorlage des abgeschlossenen technischen Nachweises erklärt:

> Ich gebe den öffentlichen P-Betrieb von MVP 0.9 gestützt auf den Produktionsnachweis vom 19.10.2026 unter Beibehaltung des dokumentierten Header-/Cacherisikos frei. Bitte veröffentliche den Nachweis auch auf GitHub.

Die Freigabe betrifft den oben gebundenen MVP09-Stand. Sie behebt die dokumentierte Plattformgrenze nicht und erweitert weder die rechtliche Abdeckung noch den freigegebenen Einsatzumfang. Private Rohbelege, Sicherungsarchive, Hostinginventare und Browserdaten sind vom Publikationsauftrag nicht umfasst. Die technisch erhobenen Nachweise bleiben unverändert.

## Unveränderte lokale Freigabegrundlagen

Wie beim vorangehenden Produktionsnachweis bleiben die lokalen Vorlagen und Rohbelege ausserhalb dieser öffentlichen Einzeldatei. Die Prüfsummen binden die tatsächlich verwendeten Fassungen ohne defekte Repositoryverweise oder Veröffentlichung privater Zielbestände.

| Grundlage | SHA-256 |
| --- | --- |
| P-Freigabevorlage MVP09, Fassung 1.0 vom 19.10.2026 | `479b70017e2f2ecfde358cc595e0f2a45afc7d67784c2ead1eb987d6a01ccabb` |
| Ursprüngliche P-Prüfmatrix MVP09, Fassung 1.0 vom 19.10.2026 | `01bef0ba53bd68e392d6736e0f80405328cddb82d05e936820e11a990d407baf` |
| Betreiberentscheid zur Header-/Cache-Plattformgrenze vom 19.10.2026 | `586b2e31c15c07e38e1aa0ba03f3c8f9ef718abb7999a0c462dfda0592130de2` |
| Technischer Schlussnachweis Fassung 1.0 vor der Betriebsfreigabe | `ff3522bea5cfdeb373b2eff1514520f896a1150bcb7772138efce4bd28dd32ae` |

David Steimer entscheidet in Personalunion. Codex unterstützt als dokumentiertes KI-Arbeitsinstrument ohne formelle Freigabe- oder Haftungsverantwortung.
