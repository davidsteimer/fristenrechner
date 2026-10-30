# AP23H3 Lokale Integration Obwalden und Nidwalden

Stand: 22. Oktober 2026. Auftraggeber und menschlicher Entscheider: David Steimer. **Lokaler Integrationskandidat technisch geprüft und zur fachlich-technischen H3-Abnahme vorgelegt, keine operative Freigabe.** [AP23H2 ist technisch abgenommen](../fachrecht/abnahme-ap23h2.md). [DEC-2026-037 ist beschlossen](../entscheidungen/DEC-2026-037-beschluss.md). Die ursprünglichen H1- und H2-Vorschlagsbytes bleiben unverändert erhalten. MVP 0.9 bleibt der freigegebene Betrieb.

## Umfang und Bedienung

Der native Format-12-Zweig setzt Kantonalverfahrenskatalog 5 mit 79 Pfaden um. 21 neue OW-/NW-Gruppen ergänzen 58 unveränderte Bestandsdefinitionen. Bern bleibt das separate Bestandsprofil. Die Tagesarithmetik und die grundlegende Feiertagserzeugung bleiben unverändert.

| Kanton | Neue Wege | Fachliche Grenze |
| --- | --- | --- |
| OW | Verwaltung und Gericht je ordentliche Beschwerde, angeordnete Tagesfrist und Begründungsverlangen. Zusätzlich der qualifizierte fünftägige Weiterzug betreffend aufschiebende Wirkung | Ordentlich 20 beziehungsweise 30 Tage. Begründungsverlangen an dieselbe eröffnende Stelle mit 30 Tagen. Der besondere Fünftagesweg ist kein allgemeiner Zwischenentscheidsweg |
| NW | Ordentliche Beschwerden, gesetzlich zulässige Einsprache, fünf angeordnete Tagesfristgruppen sowie Vernehmlassung, Replik und Duplik je vor Verwaltung und Gericht | Keine allgemeine gesetzliche Einwendungsfrist von 20 Tagen. Stillstand je Stadium: ohne, nur Winter oder drei Perioden. Die sechs gesetzlichen Schriftenwechselwege bleiben bei ihrer qualifizierten gesetzlichen Zwanzigtagedauer |

Der zweispaltige Aufbau, das früh bedienbare Empfangsdatum und die vier Schaltflächen bleiben erhalten. Die nötigen aktuellen Bestätigungen werden im vorhandenen Feld **Fallkonstellation** gebündelt. Keine zusätzlichen Dokument-, Feiertagskanton- oder Zielorgan-Dropdowns. Bei den OW-Beschwerden werden die ursprünglich vollständige Eröffnung und die spätere vollständige Begründung nach nachweislich rechtzeitigem Verlangen ausdrücklich unterschieden.

Deutsch und Französisch bleiben die Oberflächensprachen. Verständliche Normangaben und Zusatzinformationen gehören in die Rechenspur. Die fachlich bestätigte systematische Übertragung von GOG Art. 28 auf die OW-Verwaltung ist von dessen unmittelbarer gerichtlicher Verwendung zu unterscheiden. Empfängeridentität, Zulässigkeit, passende Zustellung und fehlende Sondertatbestände sind aktuelle Falltatsachen, keine persönlichen Standards.

## Daten und geschlossene Laufzeit

Der H3-Kandidat ist von der historischen H2-Strukturprobe und sämtlichen freigegebenen Releases getrennt. Er enthält 44 Datenartefakte plus Manifest, 13 Katalogerlasse, 25 Stillstandsprofile, 17 administrative Feiertagsverwendungen und 35 physische Kalender. Feiertagskatalog 2, Regelkalender 3, Rechtsprofile 1, Spezialregimekatalog 3, Sozialverfahrenskatalog 2 und Standards 5 bleiben als Komponentenformate unverändert.

Kandidat: `data/candidates/2026-10-22-ap23h3/`, Releasekennung `2026-10-22-ap23h3-candidate.1`. Manifest und Mindestconsumer sind `12.0.0`, Kantonalverfahrenskatalog `5.0.0`. Eine neue App-, Paket- oder reguläre Releaseversion ist damit nicht beschlossen. Manifest SHA-256: `14f60a83ed2f13e3f176f303e444ea43a606bae6980033e3d875093c63a5d429`.

Die 479 bisherigen Feiertagserhebungsregeln und zwölf gesonderten SO-Prozessregeln bleiben erhalten. Acht zusätzliche Regeln erzeugen je OW und NW den 2. Januar, Ostermontag, Pfingstmontag und den 26. Dezember. Zwei eigene Prozessprojektionen verändern keine bestehenden Bundeskalender. Die bisherigen Kalenderdefinitionen bleiben inhaltlich erhalten, ihre Zielkopien werden mit den tatsächlichen neuen Herkunftshashes konsistent gebunden.

Jede der vier neuen rechtlichen Kalenderverwendungen bindet den eigenen Prozesskalender, den unmittelbar geerbten kantonalen Kalender, den Bundeskalender und den neuen Feiertagskatalog an ihre tatsächlichen Manifestdeskriptoren. Historische Herkunft bleibt davon getrennt. Gleiche Daten erzeugen weder eine andere Verfahrensberechtigung noch eine freie Vereinigung von Feiertagslisten.

Der neue Consumer darf den Vertrag nicht durch Umformen in einen älteren Reader umgehen. Schema, Quellenrolle, Zielrelease, Kalenderinhalt, Pfaddefinition, qualifizierte aktuelle Fakten und tatsächliche Laufzeitidentität werden zusammen geprüft. Kopierte oder serialisierte Kontexte sind keine Rechen- oder Exportfähigkeit. Die alten Reader bleiben für ihre eigenen Formate erhalten.

Die 44 nationalen Sozialregeln und 50 Berner Anbindungen bleiben fachlich unverändert. Ihre neue Zielreleasebindung erweitert weder die Berner Freigabe noch das Zeitfenster 2026–2027. Eine technische Format-12-Kompatibilität der Oberfläche ist keine ausserbernische Sozialfreigabe.

Sechs Datendateien bleiben rohbytegleich zum G3-Ausgangspunkt: die fünf Rechtsprofile und der Spezialregimekatalog. Die 33 bisherigen Kalenderdefinitionen bleiben inhaltlich erhalten, erhalten in den H3-Zielkopien jedoch den tatsächlichen neuen Kataloghash. Der neue Feiertagskatalog ist bytegleich zur abgenommenen H2-Strukturprobe. Verwaltungs- und Sozialkatalog erhalten ausdrücklich neue, tatsächlich kohärente Zielbindungen. Die ursprünglichen G3- und H2-Dateien werden nicht überschrieben.

## Zeitgrenzen Standards und Export

Das vollständige neue Fallfenster bleibt **29.08.2026–31.12.2027**. Eröffnung, sämtliche Zähltage, Stillstände und Endverschiebungen müssen jeweils gedeckt sein. Der OW-StVG-Fassungswechsel am 01.01.2027 bleibt mit getrennten Quellenabschnitten sichtbar.

Der Abschnitt **Rechtsgrundlagen im Rechenzeitraum** zeigt die tatsächlich berührten Fassungen. Die daneben bestehende allgemeine Linksammlung des Pfads kann beide ausdrücklich als «bis Ende 2026» und «ab 2027» bezeichneten OW-Fassungen enthalten. Das bedeutet nicht, dass die künftige Fassung schon auf einen reinen 2026-Fall angewendet wird.

Die abgenommene reine Endverschiebung in neu beginnende anwendbare Ferien bleibt in sechs OW- und zwölf NW-Dreiperiodengruppen gesperrt. Beim NW-Winterweg wird nur dessen tatsächlicher Stillstand berücksichtigt. Fehlende flächendeckende Gemeindedaten sperren nicht pauschal jeden Fall. Eine konkret mögliche und ungeklärte zusätzliche örtliche Endtagswirkung bleibt hingegen ein Sperrgrund.

Persönliche Standards bleiben Version 5 und speichern nur stabile Auswahlen. Aktuelle Eröffnungsherkunft, rechtzeitige Voranforderung, Einsprachezulässigkeit, Empfängeridentität, Zustimmung, lokale Wirkung, Datum und Referenz werden nicht als positive Falltatsachen gespeichert. Ein Wechsel von Pfad oder Stadium verwirft eine nicht mehr passende Bestätigung.

**Alle Kalenderexporte der lokalen H3-Prüfansicht bleiben gesperrt, auch bei Bestandsprofilen.** Synthetische Freigaben existieren ausschliesslich innerhalb der automatisierten Tests. Sie sind weder eine Quellenabnahme noch ein installierbarer Datenrelease.

## Bestandsschutz und Prüfung

Die [H2-Abnahmekopie](../../outputs/ap23h2-abnahme-2026-10-22/receipt.json) enthält 85 Payloads und bewahrt die damals bewusst noch negativen Freigabeflags. Die spätere menschliche H2-Abnahme steht ausschliesslich im gesonderten Abnahmebeleg.

Der [Bestandsschutz](../../outputs/ap23h3-2026-10-22/preservation-verification.json) bindet die unveränderte Ausgangsinventur. 1’810 historische Eingänge bleiben bytegleich. Zwei vorab genau gehashte Registerdateien sind als begrenzte zusätzliche Integrationsänderung getrennt dokumentiert. Die 107 ursprünglich vorgesehenen Quelldateien und sieben lebenden Einstiegstexte haben ebenfalls eine feste Vorherbindung. Diese Differenzierung ist kein nachträgliches Auffrischen eines historischen Nachweises.

Der [Gesamtnachweis](../../outputs/ap23h3-2026-10-22/QA-AP23H3.json) bindet die vollständige Produktregression, native Daten- und Schemareproduktion, lokale Hostlebenszyklen, den tatsächlichen minifizierten Webbuild, unabhängige Python-Prüfungen und das H2-Abnahmearchiv. Der [isolierte SPFx-Bau](../../outputs/ap23h3-2026-10-22/spfx-build.json) bindet eine eigene tatsächliche Paketdatei und verändert das Betriebspaket nicht.

| Prüfung | Ergebnis |
| --- | --- |
| Vollständige Produktregression | 3’053 bestanden, keine übersprungenen oder abgebrochenen Tests |
| Abgenommene H1-Erwartungen am nativen Kern | Alle 118 bestätigt. 58 Datumssollwerte, 18 Endverschiebungsgrenzen, 38 Qualifikationsgrenzen und vier Zeitfenstergrenzen |
| Vergleich mit dem tatsächlichen nativen Format-11-Bestand | 104 Bundesverfahrens-/Kantonskombinationen, alle 50 Berner Sozialbindungen und 58 bisherige Verwaltungswege an fünf Stichtagen, insgesamt 290 Verwaltungsvergleiche |
| Neue UI-Prüfungen | 20 bestanden, einschliesslich neun echter React-Interaktionstests. Teilmenge der Produktregression, nicht zusätzlich zu zählen |
| Lokale Hostlebenszyklen E3 bis H3 | 40 bestanden, keine realen M365-Hosttests |
| Tatsächlich gebauter minifizierter Webstand | 16 bestanden |
| Unabhängige Pythonprüfung | Neun Tests bestanden. Tatsächliche Rohbytes und Schemata aller 45 Dateien, 79 Fachdefinitionen, 35 Projektionen, 17 transitive Verwendungen und zehn Fehlvarianten |
| H2-Abnahmearchiv | 85 Payloads autonom rückgeprüft, 29 Positiv-/Negativtests bestanden |
| Isolierte SPFx-Provider- und Integrationstests | 248 bestanden |
| Bestehende Prüfungen des tatsächlich gebauten SPFx-Pakets | 170 bestanden |
| Zusätzliche native H3-Prüfungen des tatsächlichen Pakets | Neun bestanden, einschliesslich aller 21 OW-/NW-Wege. [Tatsächliches Paket und Protokoll gebunden](../../outputs/ap23h3-2026-10-22/actual-package.json) |
| TypeScript, CSS-Prüfung, Produktionskompilierung und isolierte Paketbildung | Bestanden. 60 nicht blockierende Lintwarnungen im vollständigen Bauprotokoll |

Die 60 Lintwarnungen betreffen sowohl Altbestand als auch neue Module, darunter generierten Baselineumfang, explizite Typangaben und unbenutzte Typimporte. Der Bau ist bestanden, aber nicht warnungsfrei. Nach dem Einfrieren wurde keine kosmetische Quelländerung vorgenommen, die den tatsächlichen Paketnachweis wieder veralten lassen würde.

Der [ergänzende Kerngegenreview](../../outputs/ap23h3-2026-10-22/independent-core-review.md) bindet 13 zusätzliche Prüfungen mit 389 einzeln entfernten Pflichtfakten, sechs Kontextfälschungen, nicht primitiven Eröffnungswerten und neu versiegelten Quellen-/Eltern-/Komponentenfehlern. Diese Tests sind ebenfalls Teil der Produktregression. Eine gesonderte lesende technische KI-Gegenprüfung ergab keinen weiteren belegten blockierenden Befund. Das ist kein menschliches Vieraugenprinzip und keine erneute juristische Quellenfreigabe.

Während der Umsetzung wurden eine Zeichenkettenumwandlung bei der V5-Eröffnungsherkunft, eine unnötige `structuredClone`-Abhängigkeit und die native Kardinalität der vier aktiven OW-/NW-Zielressourcen präzisiert und nachgetestet. Das historische H2-Schema bleibt unverändert. Ein zu kurzer Webtest-Timeout und ein SPFx-Zwischenbau vor dem letzten Quellfreeze werden nicht als erfolgreiche Abschlussnachweise gezählt. Die endgültigen Nachweise müssen jeweils den letzten tatsächlichen Stand binden.

Die [tatsächliche lokale Browserprüfung](../../outputs/ap23h3-2026-10-22/browser-verification.json) bestätigt Deutsch und Französisch bei 1’240 Pixeln Ansichtsbreite, zwei gleich breiten Formularspalten ohne horizontalen Überlauf, lesbare Ergebnisse und die Exportsperre. Sie ist mit vier Bildschirmbildern und dem tatsächlich geladenen Asset gebunden. Eine erneute reale Geräte-, Gast-, M365- oder visuelle Schmalbildprüfung wird daraus nicht abgeleitet. CSS und Datumseingabe wurden nicht verändert.

Eine [ergänzende reine Speicherprobe der späteren Exportanbindung](../../outputs/ap23h3-2026-10-22/export-verification.json) bestätigt sämtliche 21 neuen Wege auf Deutsch und Französisch in einer synthetisch freigegebenen Hülle. 42 Kalenderinhalte werden ausschliesslich im Arbeitsspeicher auf Datum, Ganztägigkeit, Freistatus, Kategorie, Erinnerung und Herkunft geprüft. Der reale Kandidat sowie veränderte Inputs, Kontext- und Ergebniskopien bleiben gesperrt. Es wird keine ICS-Datei gespeichert oder heruntergeladen und kein Outlook-Import vorgenommen. Diese Ergänzungsprobe wird nicht als zusätzlicher Bestandteil der 3’053 Produktprüfungen gezählt.

Der [lokale Abschlussnachweis](../../outputs/ap23h3-2026-10-22/local-completion.json) bindet die endgültigen Quellen, generierten Module, tatsächlichen Web-/SPFx-Artefakte, Compilerkonfiguration, Quellkopien, Bildschirmbilder und Testprotokolle. Verwendet werden Node 22.23.2 und npm 10.9.8. Das tatsächliche isolierte SPFx-Prüfpaket hat 439’791 Bytes und SHA-256 `c1d7d9f3ff9e5491e85caf1f9e1bf2690aeea8bda5dce74dd30a79f4abefd3f8`. Es ist kein freigegebenes Betriebspaket.

## Lokale Prüfvorschau

[AP23H3-Vorschau](http://127.0.0.1:8805/fristenrechner/). Falls der lokale Prozess beendet wurde, im Projektordner mit der eingerichteten Node-22-Toolchain `npm run preview:ap23h3` starten. Nur synthetische Angaben verwenden.

| Auswahl und rechtlich massgebendes Empfangsdatum | Erwartung |
| --- | --- |
| OW, Verwaltung, ordentliche Beschwerde, 02.10.2026 | 20 Tage, 22.10.2026. Ursprüngliche vollständige Eröffnung oder nachgewiesen rechtzeitige Begründungsanforderung ausdrücklich qualifizieren |
| OW, Verwaltung, Begründung bei derselben Stelle verlangen, 02.10.2026 | 30 Tage, 02.11.2026 |
| OW, Gericht, besonderer Weiterzug zur aufschiebenden Wirkung, 23.12.2026 | Fünf Tage, 28.12.2026, ohne Stillstand |
| NW, Verwaltung, angeordnete erstinstanzliche Eingabe, 10.12.2026, 20 Tage | 30.12.2026, ohne Stillstand |
| NW, Verwaltung, angeordnete Stellungnahme im Einwendungsverfahren, 10.12.2026, 20 Tage | 15.01.2027, nur Winterstillstand |
| OW, Verwaltung, ordentliche Beschwerde, 28.02.2027 | Abgenommene begrenzte Endverschiebungskollision. Kein definitives Fristresultat und kein Kalenderexport |

Jeweils die tatsächlich zutreffende positive Fallkonstellation wählen. Nach Speichern als Standard und Neuladen bleiben nur stabile Auswahlen erhalten. Datum und Fallbestätigung müssen neu eingegeben werden.

## Nächster Haltepunkt

**Nächster Haltepunkt: fachlich-technische Abnahme AP23H3 durch David Steimer.** Danach folgt die nächste begrenzte Kantonstranche, kein automatischer Zwischenrelease. Die Zahl vollständig abgenommener Kantonsintegrationen bleibt bis zur H3-Abnahme bei zwölf. OW und NW sind lokal umgesetzt und geprüft, aber noch nicht als abgenommene Kantonsabdeckung gezählt.

Kein Commit, Quellpush, Quellenpromotion, Upload, Installation oder Mirrorwechsel ist Bestandteil dieses Auftrags. E/Q/P, AP5, AP21, Berechtigungen, Hosting, Betriebspins und der öffentliche MVP09-Stand bleiben unverändert. Die öffentliche Statusführung von #48 und eine spätere Quellpublikation bleiben getrennte Vorgänge.
