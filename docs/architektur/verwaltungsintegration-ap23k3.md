# AP23K3 Lokale Integration Basel-Stadt und Basel-Landschaft

Stand: 27. Oktober 2026. Auftraggeber und menschlicher Entscheider: David Steimer. **Die native lokale Integration ist vollständig technisch geprüft und liegt zur menschlichen fachlich-technischen AP23K3-Abnahme vor.** Der [lokale Abschlussnachweis](../../outputs/ap23k3-2026-10-27/local-completion.json) bindet den korrigierten Stand einschliesslich Gesamt-QA, tatsächlicher Web-/SPFx-Artefakte und Browserbedienung. [AP23K1 ist fachlich](../fachrecht/abnahme-ap23k1.md) und [AP23K2 technisch abgenommen](../fachrecht/abnahme-ap23k2.md). [DEC-2026-040 ist beschlossen](../entscheidungen/DEC-2026-040-beschluss.md). Die ursprünglichen Vorschlags- und Prüfnachweise behalten ihre historischen Statusmerkmale. MVP 0.9 bleibt der freigegebene Betriebsstand.

## Umfang und Statusgrenzen

Der eigene native Format-15-Zweig setzt Verwaltungsverfahrenskatalog **8.0.0** um. **16 neue BS-/BL-Wege ergänzen 149 unveränderte Bestandsdefinitionen zu 165 Pfaden.** Bern bleibt das separate Bestandsprofil. Die gemeinsame Tagesarithmetik und physische Feiertagserzeugung werden nicht durch kantonale Sonderalgorithmen ersetzt.

| Kanton | Neue Wege | Berechnungsrelevante Unterscheidungen |
| --- | ---: | --- |
| BS | Acht | Angeordnete Eingabe im Erstverfahren, Anmeldung und Begründung des verwaltungsinternen beziehungsweise gerichtlichen Rekurses, angeordnete Eingaben und qualifizierter Rekurs gegen verweigerte Beiladung |
| BL | Acht | Angeordnete Eingaben, allgemeine Verwaltungs- beziehungsweise Verwaltungsgerichtsbeschwerde, tatsächlich gewährte oder gerichtlich festgesetzte Begründungsfrist und qualifizierte Fünftageseinsprache |

Die technische lokale Implementierung ist keine menschliche Abnahme. Bis zur gesonderten K3-Abnahme bleiben **19 Kantone vollständig fachlich-technisch abgenommen**, davon sechs operativ und 13 weitere nur lokal. BS/BL sind zusätzlich lokal implementiert, aber noch nicht als vollständig abgenommen gezählt. AI, NE, SZ, VD und VS sind noch nicht integriert. Der nächste reguläre Release bleibt gemäss DEC-2026-034 gebündelt.

## Native Daten- und Laufzeitbindung

Der lokale Kandidat liegt unter `data/candidates/2026-10-27-ap23k3/` mit Releasekennung `2026-10-27-ap23k3-candidate.1`. Manifest und Mindestconsumer sind **15.0.0**, der Verwaltungskatalog ist **8.0.0**. Die [Kandidatenbindung](../../outputs/ap23k3-2026-10-27/bundle-integrity.json) trennt bestätigten Produktvertrag von weiterhin fehlender Quellenrelease- und Betriebsfreigabe. Eine neue Produktrelease- oder Betriebspaketversion ist nicht beschlossen.

44 Datenartefakte und das Manifest bilden den lokalen Datensatz. Er umfasst 165 Pfade und Qualifikationspolicies, 20 Erlasse, 37 Stillstandsprofile, 30 rechtliche Feiertagsverwendungen und 35 physische Kalender. **42 Artefakte bleiben rohbytegleich zur J3-Basis.** Nur Verwaltungskatalog und Sozial-Zielreleasebindung ändern sich. Die 44 Sozialregeln und 50 BE-Anbindungen bleiben fachlich und zeitlich unverändert. Daraus entsteht keine ausserbernische Sozialfreigabe.

Alle 35 Kalenderdateien bleiben erhalten. Die 499 Katalogregeln bestehen unverändert aus 479 Grundregeln und 20 Prozessergänzungen. Auf der getrennten physischen Projektionsstufe enthalten die Kalenderdateien 431 Regeln. Die 13 jährlichen BL-Büroschliesstage sind keine neuen Katalogfeiertage.

Reader, Schemata und Datenfabrik für Format 15 sind eigenständige Versionsmodule. Tatsächliche Rohbytes, Rollen, Pfade, Komponentenprüfsummen, vollständige Abhängigkeitsmengen, Quellenprovenienzen und Releasebindungen werden geprüft. Es gibt keinen Format-15-zu-14-Rückfall und keine Umbenennung eines alten Readers. Ein nur kopiertes Objekt oder serialisiertes Freigabeflag erzeugt keine authentische Laufzeit. Die lokalen Daten- und Hostkontexte müssen aus derselben geprüften Fabrikinstanz stammen.

## Eröffnung, Feiertagsanker und Endverschiebung

Die Eröffnung ist in den neuen Wegen bereits rechtlich qualifiziert. Sie wird unverändert übernommen, auch wenn der feststehende rechtliche Eröffnungstag ein Samstag oder eine zulässige Publikation ist. Die Tageszählung beginnt am Folgetag. Der Genfer Mechanismus für gewöhnliche Post wird nicht auf BS oder BL übertragen.

Bei BS beginnen die gesetzlichen zehn Tage für die Anmeldung und 30 Tage für die Begründung mit **derselben ursprünglichen Eröffnung**. Anmeldung, interne Weiterleitung oder Überweisung starten die Begründungsfrist nicht neu. Eine tatsächlich bewilligte aktuelle Tagesanordnung wird im Anordnungsweg qualifiziert. Ein blosses Erstreckungsgesuch ist keine Bewilligung. Ein fixer Termin wird nicht zu einer künstlichen Tagesrechnung.

| Bindung | Native Behandlung |
| --- | --- |
| BS Erstverfahren und verwaltungsinterner Rekurs | Sitz der zuständigen kantonalen Stelle gemäss dem abgenommenen K1-Befund und DEC-2026-031 |
| BS Gerichtsrekurs | Genau ein rechtlich bestimmter Wohnsitz-/Sitzkanton der Partei oder ihrer zustellungsberechtigten Vertretung. Keine erfundene feinere Vertretungsrolle, freie Listenvereinigung oder stiller BS-Ersatz |
| BS-Gerichtsanker AI/NE | Nur die konkret erforderliche örtliche Tatsache wird ausdrücklich erhoben. Ein fehlender Regionalfakt wird weder als Ja noch als Nein behandelt |
| BL | Gesetzliche Feiertage des gebundenen Behördenorts und zusätzlich die gesondert belegten ganzen kantonalen Büroschliesstage, ausschliesslich für die Endverschiebung |

Die dynamische BS-Gerichtsbindung enthält 26 feste Kantonsanbindungen mit 28 regionalen Varianten und 29 Projektionen. Sie verwendet nur die rechtlich gebundene Feiertagsprojektion, nicht das fremde Verfahrensrecht oder die Gerichtsferien des Bundes. AI und NE benötigen ihre tatsächlichen Regionalfakten. Die GR-/NE-Grenzen bleiben berechenbare Vorbehalte. Ausschliesslich die gebundene SG-Januarregel wird mit zwei vollständigen Rechnungen geprüft. Ein physischer Kalender ist keine Verfahrensfreigabe für seinen Herkunftskanton.

Die 13 BL-Jahresdaten gelten für 2026 und 2027 innerhalb des bestätigten Fensters. Halbtage werden nicht zu Ganztagsfeiertagen befördert. Ganztägige kantonale Büroschliessungen wirken nur, wenn sie in der Endverschiebungskette erreicht werden. Sie unterbrechen die Zählung im Fristinnern nicht. Es gibt keinen allgemeinen Gerichtsferien-Stillstand.

Der unsichere ganze Fasnachts-Schliesstag vom **09.02.2027** wird automatisch durch zwei vollständige Rechnungen ohne und mit genau diesem Datum behandelt. Bei unterschiedlichem rechtlichem Enddatum gibt es kein definitives Fristresultat und keinen Kalenderexport. Bei gleichem Resultat bleibt der Weg berechenbar. Eine freie Eingabe oder Übersteuerung der regionalen Büroschliessung ist ausgeschlossen. Die ursprünglichen zwei diagnostischen Gegenwelten sind keine positive Verbraucherwahl.

## Oberfläche, Rechenspur und Standards

Zwei Spalten, frühe Datumseingabe, feste Einzelwerte, vier Aktionsschaltflächen, Resultat vor Parametern und die statische Beschriftung **Sitz der zuständigen Stelle** bleiben erhalten. OG/VRPG BS sowie VwVG/VPO BL erscheinen je als gemeinsamer Erlasseintrag. Das aktuelle Stadium und die Handlung bestimmen den konkreten Pfad.

Die feste Fallqualifikation bündelt die geprüften Voraussetzungen. Zusätzliche Eingaben gibt es nur für echte Berechnungsalternativen: den qualifizierten BS-Gerichtsanker, gegebenenfalls den erforderlichen AI-/NE-Regionalfakt und die sieben abschliessenden Gegenstände der BL-Fünftageseinsprache. Kein erster Fachwert ist vorausgewählt. Es gibt keine zusätzliche Dokumentauswahl, erfundene Rollenfrage oder BL-Schliesstagsauswahl.

Bei der BL-Begründung ist die aktuelle gewährte beziehungsweise festgesetzte Tagesdauer aus der konkreten Anordnung nötig. Die Fünftageseinsprache setzt zusätzlich die Zuständigkeit der Kammer zum Endentscheid voraus. Weder ein Antrag noch die Bezeichnung einer Verfügung ersetzt diese aktuellen Qualifikationen.

Die DE-/FR-Rechenspur zeigt lesbare Erlassnamen und Fundstellen statt technischer Kennungen oder Rohquellenannotationen. Eröffnung, Ort und Kalender, gesetzliche Feiertage, tatsächliche zusätzliche Büroschliessungen und diagnostische Vergleiche sind getrennt. Die Varianten bleiben ausdrücklich Nachweise und werden nicht als definitive Resultatkacheln dargestellt. Auch bei einem gesperrten Vergleich reicht die Normanzeige über den vollständig ausgewerteten Variantenzeitraum. Alle Rohkennungen, Quellenleseumfänge, Prüfsummen und Originalbindungen bleiben unter den technischen Nachweisen erhalten.

Standards bleiben Version 5. Sie speichern stabile Auswahl und zulässige Dauerpräferenzen, nicht Empfangsdatum, Referenz, positive Fallqualifikation, Begründungsbewilligung, Ankerqualifikation, Ortskanton oder Regionalfakten. Pfad-, Stadiums- und Ortswechsel entfernen nicht mehr passende aktuelle Fakten und bisherige Resultate. Ältere Verbraucher schützen einen unbekannten neuen Pfad im gleichen Speicherplatz unverändert, statt ihn mit einem Ersatzweg zu überschreiben.

## Vollständiges Zeitfenster und bewusste Grenzen

Für neue BS-/BL-Fälle gilt **29.08.2026–31.12.2027 als vollständiges Fallfenster**. Rechtlich massgebender Auslöser, alle Zähltage und die gesamte Endverschiebung müssen durch Rechtsnormen, räumliche Geltung, Kalenderregeln, Jahresanordnungen und Releasebedingungen gedeckt sein. Ein Ende ausserhalb des Fensters wird nicht am 31. Dezember abgeschnitten. Eine Kette bis 2028 bleibt ohne definitives Resultat und Export.

Die Provenienz enthält die tatsächlich berührten Normsegmente, insbesondere die getrennten VwVG-Fassungen 2026 und 2027 sowie die anwendbaren BL-Jahresanordnungen. Das Fenster ist kein unbegrenzter Rechtsbeständigkeitsnachweis. Die bisherige AI-Behandlung und alle ausdrücklich abgenommenen K1-/K2-Grenzen bleiben erhalten.

Neue Sozialanbindungen, abweichendes Spezialrecht, eigenständiges kommunales Recht, unqualifizierte Zustellfiktionen, Stunden- oder Rückwärtsfristen, Zahlungen und fixe Termine werden nicht zusätzlich freigegeben. Die letzte rechnerische Kalendertagsangabe entscheidet nicht über sämtliche Anforderungen einer tatsächlichen Einreichung.

## Schutz und bisherige Einzelprüfungen

Der [K2-Abnahmebeleg](../../outputs/ap23k2-abnahme-2026-10-27/receipt.json) schützt die ursprünglichen technischen Vorschlags- und Prüfnachweise getrennt von der menschlichen Abnahme. Der vor K3 eingefrorene [Guard](../../outputs/ap23k3-2026-10-27/protected-inputs.json) bindet **6’696 geschützte Dateien**, 137 ausdrücklich benannte Integrationsdateien und sieben lebende Einstiegstexte. Guard-SHA-256: `23f5406ec3218aa30d0fb1ac95c0aff507106523f1c7645125020bf127738ce1`. Bestehende Versionsmodule, akzeptierte Rechtsdaten, alte Tests und historische Nachweise dürfen dadurch nicht stillschweigend geändert werden.

Der [native Referenzbericht](../../outputs/ap23k3-2026-10-27/native-reference-verification.json) trennt **65 ursprüngliche Vertragsfälle**, **zwei diagnostische Gegenwelten** und **46 synthetische Ergänzungsfälle**. Die 65 Verbraucherfälle enthalten 40 berechenbare und 25 bewusst gesperrte Fälle. Die 149 bisherigen Pfade werden getrennt auf ihre erhaltenen mathematischen Felder verglichen.

Die [unabhängige Python-Gegenrechnung](../../outputs/ap23k3-2026-10-27/independent-verification.json) bestätigt **111 native Vergleiche** aus 65 Vertragsfällen und 46 Ergänzungen sowie **149 zusätzliche Bestandsrechnungen**. Zwei verbotene Zweigübersteuerungen werden separat verworfen. Die zwei ursprünglichen diagnostischen Gegenwelten bleiben davon getrennt. Der Bericht prüft ausserdem die tatsächlichen Kandidatenbytes, 27 Rohquellenbindungen, 42 unveränderte Datenartefakte und die unveränderten Kalender- und Sozialbestände. Diagnostische Kalenderproben ausserhalb des Fallfensters sind ausdrücklich keine positive Fall- oder Rechtsfreigabe.

Die neuen lokalen UI-Prüfungen bestätigen **20 gezielte Tests**, darunter sämtliche 165 Pfadbezeichnungen, alle 26 BS-Gerichtsanker, genaue Regionalfakten, automatische BL-Schliessungen, gesperrte Exporte, geschützte Standards und den nachfolgenden DE-/FR-Textnachtrag. Die unveränderten J3-UI-Prüfungen sind Teil der vollständigen Bestandsregression. Die Zähler verschiedener Prüfebenen werden nicht zu einer vermeintlich überschneidungsfreien Gesamtsumme addiert.

Die gesonderte [geerbte Referenzregression](../../outputs/ap23k3-2026-10-27/inherited-reference-verification.json) prüft alle **673 unveränderten J1-/J3-Referenzen im nativen Format-15-Kontext** gegen den ursprünglichen J3-Bericht. Sie enthält 93 datierte Ergebnisse, 573 Qualifikationsgrenzen, drei Endverschiebungs-/Stillstandsgrenzen und vier Fenstergrenzen. Die historischen Berichte werden nicht neu geschrieben. Diese Bestandsregression ist von den 65 neuen Vertragsfällen getrennt und begründet insbesondere keine zusätzliche Zahl positiver Fachfreigaben.

### Begrenzter Textnachtrag nach der tatsächlichen Browserprüfung

Im bewusst gesperrten BL-Vergleichsfall mit Eröffnung am 30.01.2027 zeigte die neue V8-Rechenspur zunächst «Endverschiebung: Keine» und «Keine zusätzliche Büroschliessung hat das Fristende verschoben». Diese Aussagen waren neben den bereits korrekt ausgewiesenen Vergleichsvarianten 09.02.2027 und 10.02.2027 zu definitiv. Ausschliesslich bei einem gesperrten V8-Fall mit unterschiedlichem BL-Büroschliessungsvergleich werden beide Stellen nun durch **«Nicht abschliessend bestimmbar. Siehe Vergleichsvarianten.»** ersetzt. Die französische Fassung lautet «Report non déterminable définitivement. Voir les variantes comparatives.» Berechenbare V8-Fälle und sämtliche älteren Vertragszweige behalten ihre bisherigen Texte.

Der Nachtrag ändert weder Rechenlogik noch Rechtsdaten, Eingaben, Resultate, Varianten oder Exportsperren. Zwei zusätzliche DE-/FR-Tests prüfen gezielt den gesperrten Vergleich und den unveränderten berechenbaren Gegenfall. Die beiden K3-UI-Dateien bestanden damit zusammen **20 Tests**, die TypeScript-Prüfung blieb fehlerfrei. Die erneute tatsächliche Browserbedienung nach dem Textnachtrag bestand mit **acht Beobachtungen und sieben Bildschirmnachweisen**. Die gesonderte Exportprobe bestätigte **50 qualifizierte Fälle und 100 im Arbeitsspeicher erzeugte DE-/FR-Kalendertexte**, ohne Dateien zu speichern oder Kalender zu importieren.

Die vor dem Textnachtrag bestandenen Web-/SPFx-Artefaktnachweise bleiben als gekennzeichneter Vorstand erhalten. Der vollständige QA-Lauf und die tatsächlichen Web-/SPFx-Artefaktprüfungen wurden mit den korrigierten Quellbytes vollständig wiederholt und bestanden. Die folgenden Primärberichte und der lokale Abschlussnachweis beziehen sich auf diesen korrigierten Stand, nicht auf die früheren Artefakte.

## Technischer Gesamtabschluss und Vorlage zur menschlichen Abnahme

Der [zusammengeführte QA-Bericht](../../outputs/ap23k3-2026-10-27/QA-AP23K3.json) bestätigt nach dem begrenzten Textnachtrag **16 von 16 Schritten ohne Fehler**. Auch der isolierte SPFx-Bau, die tatsächlichen AMD-Paketprüfungen, die abschliessende Browserbedienung und die ergänzende Exportprobe sind bestanden. Die folgenden Zähler bezeichnen unterschiedliche Prüfebenen, keine überschneidungsfreie Gesamtsumme. **Die menschliche K3-Abnahme bleibt offen.** Sie wird durch den technischen Gesamtabschluss nicht vorweggenommen.

| Prüfbereich | Aktueller Status |
| --- | --- |
| Vollständige Produktregression | 3’379 Tests bestanden, [Produktprotokoll](../../outputs/ap23k3-2026-10-27/product-regression.txt) |
| Kontrollierter Hostlebenszyklus | 70 Tests bestanden, [Hostprotokoll](../../outputs/ap23k3-2026-10-27/host-lifecycle.txt) |
| Tatsächliches minifiziertes Webbundle | 32 Tests bestanden, [Artefaktprotokoll](../../outputs/ap23k3-2026-10-27/actual-web-bundle.txt) |
| Archiv- und Schutzgrenzen | 90 Governance-Tests bestanden, [Protokoll](../../outputs/ap23k3-2026-10-27/governance.txt) |
| Unabhängiger Python-Vertrag | 16 Tests bestanden, [Protokoll](../../outputs/ap23k3-2026-10-27/independent-contract-tests.txt) |
| Native, unabhängige und geerbte Fachreferenzen | Bestanden, Einzelumfänge und getrennte Referenzkorpora vorstehend ausgewiesen |
| Isolierter SPFx-Bau | Sieben von sieben Schritten bestanden, 283 Quelltests und 170 historische Pakettests, [Baunachweis](../../outputs/ap23k3-2026-10-27/spfx-build.json) |
| Tatsächliches korrigiertes AMD-Paket | 13 von 13 Prüfungen bestanden, [Paketnachweis](../../outputs/ap23k3-2026-10-27/actual-package.json) |
| Tatsächliche lokale Browserbedienung DE/FR und Layout | Acht Beobachtungen und sieben Bildschirmnachweise bestanden, [Browsernachweis](../../outputs/ap23k3-2026-10-27/browser-verification.json) |
| Ergänzende Exportprobe im Arbeitsspeicher | 50 qualifizierte Fälle, 100 DE-/FR-Kalendertexte bestanden. Keine Dateien gespeichert oder Outlook-Importe, [Exportnachweis](../../outputs/ap23k3-2026-10-27/export-verification.json) |
| Vollständiger Schutzvergleich | Bestanden, [Bestandsnachweis](../../outputs/ap23k3-2026-10-27/preservation-verification.json) |
| Fachlich-technische AP23K3-Abnahme | Offen, gesonderter menschlicher Entscheid nach technischer Vorlage |

Das tatsächliche isolierte Prüfpaket umfasst **652’428 Bytes**, SHA-256 `e0cbc9c301179ba5398a79f04c0ae894d1703676c1f49464752342dd9191cedb`. Es ist kein für Installation oder Betrieb freigegebenes Paket. Der unveränderte betriebliche Paketstand bleibt getrennt geschützt.

## Lokale Prüfvorschau und nächster Haltepunkt

Die [AP23K3-Vorschau](http://127.0.0.1:8808/fristenrechner/) verwendet ausschliesslich den lokalen Referenzkandidaten. Im Projektordner lässt sie sich mit der vorhandenen Node-22-Toolchain über `npm run preview:ap23k3` starten. Nur synthetische Fälle verwenden. Sämtliche Kalenderexporte der Prüfansicht bleiben gesperrt, auch für Bestandsprofile.

| Auswahl und aktueller Auslöser | Erwartung bei zutreffender aktueller Qualifikation |
| --- | --- |
| BS, Gerichtsrekurs anmelden, 28.11.2026, qualifizierter Ort BS | 08.12.2026 |
| Gleicher BS-Gerichtsweg, qualifizierter Ort TI | 09.12.2026, keine neue Tessiner Verfahrensfreigabe |
| BS, ursprüngliche interne Begründung, 02.10.2026 | 30 Tage ab derselben ursprünglichen Eröffnung, 02.11.2026 |
| BL, allgemeine Verwaltungsbeschwerde, 14.12.2026 | 04.01.2027 nach der vollständigen Endverschiebungskette |
| BL, allgemeine Verwaltungsbeschwerde, 30.01.2027 | Gesperrt, diagnostische Varianten 09.02.2027 und 10.02.2027 |

Der technische Gesamtabschluss ist erfolgt. Als nächster Haltepunkt folgt die menschliche AP23K3-Abnahme. Bis dahin sind BS/BL nicht als vollständig abgenommen zu zählen. Keine Quellenpromotion, Releasefreigabe, Commiterstellung, GitHub-Veröffentlichung, Installation, Mirrorumstellung oder Betriebsänderung. E/Q/P, AP5, AP21-Testapps, Hosting, Berechtigungen und Richtlinien bleiben unverändert. Lokale Web-/SPFx-Prüfartefakte sind keine Betriebs- oder Installationspaketfreigabe und keine realen M365-, Gast- oder Geräteprüfungen.
