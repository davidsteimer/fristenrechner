# Gemeinsamer Bestandsbericht R10-A1

28. Oktober 2026. Gebündelte Releasevorbereitung nach AP23M3.

**Alle 26 Kantone sind im vereinbarten allgemeinen Umfang lokal integriert und abgenommen. Der gemeinsame Bestand ist inventarisiert, aber noch kein freigegebener neuer Datenrelease.** Der nächste fachliche Schritt ist R10-A2 gemäss [Quellenprüfplan](../fachrecht/quellenpruefplan-r10-a2.md).

[R10-U1 ist ausdrücklich abgenommen](../ux/abnahme-r10-u1.md). Der Auftrag für A1 umfasst diese Bestandsaufnahme und den Prüfplan. Die zunächst versehentlich als «R10-A1 ist abgenommen» bezeichnete Rückmeldung wurde durch David ausdrücklich auf U1-Abnahme und A1-Start präzisiert. Eine A1- oder Quellenabnahme wird nicht vorweggenommen.

## Bestand und Reichweite

| Bestandteil | Dokumentierter MVP09-Ausgangsbetrieb | Gemeinsamer lokaler Bestand |
| --- | --- | --- |
| Allgemeine kantonale Verwaltungsverfahren | BE als eigenes Profil sowie 25 TI-/GR-/LU-/ZG-/AR-Pfade, sechs Kantone | BE als unverändertes Profil mit neun Regeln sowie 245 Pfade für die übrigen 25 Kantone. 220 Pfade für 20 weitere Kantone kommen hinzu |
| Datenvertrag | Verwaltungsverfahrenskatalog 2.0.0, Manifest und Mindestconsumer 9.0.0 | Katalog 10.0.0, Manifest und Mindestconsumer 17.0.0 gemäss beschlossenem DEC-2026-042 |
| Datenumfang | 41 Komponenten und Manifest, 42 Dateien | 44 Komponenten und Manifest, 45 Dateien |
| Kalenderdefinitionen | 32 | 35 |
| Physische Feiertagsgrundlage | 479 Grundregeln | Dieselben 479 Grundregeln |
| Ergänzende prozessuale Kalenderregeln | Zwölf SO-Regeln, zusammen 491 Regeln | Zwölf SO-, vier OW- und vier NW-Regeln, zusammen 499 Regeln |
| Sozialverfahren | Elf Erlasse, 44 Fachregeln und 50 BE-Anbindungen | Fachobjekte strukturell unverändert. Keine ausserbernische Sozialfreigabe und keine Verlängerung des Fallfensters 2026–2027 |
| Produktsprachen | Deutsch und Französisch | Weiterhin DE/FR. IT und Rumantsch Grischun bleiben unter #49 separat |

Die Angaben zum Ausgangsbetrieb beruhen auf dem [abgeschlossenen Produktionsnachweis vom 19. Oktober](produktionsbereitstellung-mvp09-2026-10-19.md). A1 nimmt keine frische Onlineinventur von E/Q, GitHub oder steimer.ch vor.

Der aktuelle Kandidat heisst `2026-10-28-ap23m3-candidate.1`. Seine Quellenprüfung ist noch offen, seine Releasebindungen bleiben Kandidat und seine lokale Oberfläche bleibt Referenzansicht mit gesperrtem Kalenderexport. Der Vertrag 10/17 ist beschlossen, eine neue Anwendungs- oder SPFx-Version dadurch nicht. **MVP 0.10 bleibt die vorgeschlagene Releasebezeichnung**, bis die konkrete Übernahme- und Buildvorlage die Versionen bindet.

## Kantonsabdeckung und Fallgrenzen

| Bestand | Kantone | Administrative Pfaddefinitionen |
| --- | --- | ---: |
| Bereits operativer Katalogbestand | TI, GR, LU, ZG, AR | 25 |
| AP23F | ZH, AG, SG | 17 |
| AP23G | UR, SO, SH | 16 |
| AP23H | OW, NW | 21 |
| AP23I | GL, TG | 34 |
| AP23J | FR, GE, JU | 36 |
| AP23K | BS, BL | 16 |
| AP23L | AI, SZ | 31 |
| AP23M | NE, VD, VS | 49 |
| **Katalog insgesamt, ohne BE-Profil** | **25 Kantone** | **245** |

Die [26-zeilige Kantonstabelle](../../outputs/r10-a1-2026-10-28/coverage-table.md) zeigt Stufen, gesetzliche Tageswerte, Fallfenster und den bisherigen Betriebsstatus. Der [vollständige Maschinenbericht](../../outputs/r10-a1-2026-10-28/coverage.json) bindet je Pfad Definition, Qualifikationspolicy, Kandidaten-Eligibility, Feiertagsbindung und Stillstandsobjekte mit JSON-Pointer und Objekthash.

Die 245 Katalogpfade haben Fallfenster bis 31.12.2027. Sie beginnen am 29.08.2026, bei Luzern am 27.09.2026. Normfassungsphasen, rechtlich massgebende Eröffnung, zulässige Dauerart, tatsächliche Fallqualifikation und konkrete Kalenderbindung begrenzen zusätzlich. Das allgemeine BE-Profil hat dagegen ein eigenes, nach hinten offenes Profilfenster. Es wird nicht als erfundene zusätzliche Katalogpfadzahl addiert. Auch Kalenderverfügbarkeit «bis offen» verlängert weder Fachfenster noch Quellen- oder Releasefreigaben.

Die 36 Feiertagsbindungen und 46 Stillstandsprofile werden ausdrücklich nach ihrem gebundenen Verfahren ausgewertet. Behörden-, Partei-/Vertretungs- und regionale Anknüpfungen bleiben verschieden. Eine erste gefundene Kalender-ID oder eine freie Vereinigung mehrerer Feiertagslisten wäre keine zulässige Ableitung.

Die 132 ausgeschlossenen Katalogeinträge sind dokumentierte Abgrenzungen, nicht 132 pauschal offene Produktfehler. Allgemeine Tagesverfahren bedeuten weiterhin keine vollständige Abdeckung aller kantonalen Spezialerlasse, kommunalen Instanzen, Zahlungsfristen, Monats-/Jahresfristen oder ungeklärten Zustellkonstellationen. Eigenständiges kommunales Recht bleibt ausgeschlossen. Kantonal geregelte örtliche Unterschiede bleiben relevant.

## Fachgleichheit und tatsächliche Dateiänderungen

Alle 25 bisherigen administrativen Pfadobjekte und ihre Qualifikationspolicies sind exakt erhalten. Die fünf Rechtsprofile und der Spezialregimekatalog sind vollständig rohbytegleich. Die 44 Sozialfachregeln, 50 BE-Anbindungen, 479 physischen Grundregeln und Regeln der 32 bisherigen Kalender sind strukturell unverändert.

Das bedeutet **nicht**, dass sämtliche alten Dateien bytegleich wären. Nur sechs der 41 bisherigen Komponenten sind vollständig identisch. Bei den bestehenden Kalendern ändern sich die Projektionsbindungen. Der Feiertagskatalog erhält bereits abgenommene Aktivierungs- und Prozessergänzungen. Der Sozialkatalog benötigt neue Releasebindungen. Der Verwaltungskatalog enthält die zusätzlichen abgenommenen Pfade. Drei neue Kalenderdateien ergänzen den Bestand. Der Maschinenbericht weist diese Unterschiede pro Komponente aus.

Die U1-Korrekturen betreffen ausschliesslich die Format-17-Sozialauswahl und zwei begrenzte Darstellungen. Die tatsächlichen U1-Paket-, Web- und Browserbelege werden bytegebunden wiederverwendet, nicht als erneut gebaute definitive Releaseartefakte ausgegeben. Der reale T06-Layoutnachtest bei 100 % und 300 % Browserzoom bleibt im späteren E-/Q-Schritt erforderlich. #50 bleibt bereits erledigt.

## Gemeinsame Quelleninventur

Das [vollständige Inventar](../../outputs/r10-a1-2026-10-28/sources/source-inventory.json) umfasst **380 kanonische Quellenkennungen**, davon 251 bereits im R09-Gesamtbericht erfasst und 129 neu. Im Kandidatenmanifest stehen 258 Kennungen statt bisher 128. Die 130 zusätzlichen Laufzeitdefinitionen sind nicht 130 neue Quellenkennungen. Eine zuvor nur historisch erfasste Zürcher Quelle wird nun auch für einen Laufzeitkalender verwendet.

Alle **2’136 bisherigen Verwendungsstellen** sind am selben Dokument und JSON-Pointer erhalten. **2’909 neue Stellen** ergeben insgesamt **5’045**. Die zwei bisherigen Kennungen `SRC-BUNDESFEIERTAG-19940701` und `SRC-ZH-RLG-8224-N045` erhalten neue Verwendungen, die A2 ausdrücklich zusätzlich bewerten muss. Die 713 historischen Arbeitsmappenverweise bleiben ein getrennter, nicht aktivierender Herkunftsgraph.

Die Rollenpartition ist vollständig: 266 Kennungen haben positive oder gemeinsam verwendete Referenzen, vier ausschliesslich Ausschlussverweise und 110 keinen aktuellen Graphverweis. Alle 380 erhalten einen eindeutigen Prüfverantwortungsplatz im Plan. Gleiche URLs sind nur Identitätskandidaten, keine automatische Gleichsetzung von Kennungen, Fassungen oder Rechtsaussagen.

Das operative Quellenregister enthält weiterhin 255 Kennungen. Die 129 neuen Inventarkennungen fehlen dort erwartungsgemäss noch, vier historische Registerkennungen liegen ausserhalb des aktuellen Kandidateninventars und bleiben erhalten. Register und Ereignisprotokoll werden erst nach gemeinsamer Quellenabnahme im konkret freigegebenen Übernahmeschritt angepasst.

**1’223 eindeutige vorhandene Belegdateien mit 431’105’954 Bytes** sind erneut gegen ihre gespeicherten SHA-256- und Grössenangaben geprüft. Sie enthalten auch Indices, Metadaten, Extrakte, Skripte und Mehrfachdarstellungen. Die Zahl bezeichnet weder unabhängige Erlasse noch vollständig neu gelesene Rechtsakte. A1 hat null Onlineabrufe und null neue inhaltliche Quellenprüfungen vorgenommen. Vorhandene MVP09- und Tranchenaussagen bleiben an ihre ursprünglichen Daten und Aussagegrenzen gebunden.

## Lokale Vorprüfung und Bestandsschutz

Die [frische Vorprüfung](../../outputs/r10-a1-2026-10-28/preflight.json) umfasst Typprüfung, Kandidatenreproduktion im reinen Prüfmodus, vollständige Produktregression, bestehende Host-Lebenszyklen, AP5-Differenzvergleich und autonome Abnahmearchive. Die [abschliessende A1-Prüfung](../../outputs/r10-a1-2026-10-28/local-completion.json) bindet zusätzlich Inventurerzeuger, Negativtests, Quellenplan und tatsächliche Inventardateien.

Vor A1 wurden **15’367 unveränderliche Dateien** und genau acht fortschreibbare Einstiegstexte [eingefroren](../../outputs/r10-a1-2026-10-28/protected-inputs.json). Produkt, Rechtsdaten, Schemas, Pakete, historische Nachweise und Git-HEAD bleiben unverändert. Die frühere M3-Abnahme und die neue autonome U1-Abnahme prüfen sich aus ihren gesicherten Bytes. Ihre damaligen Vorabnahmeflags werden nicht nachträglich ersetzt.

Die Testebenen überlappen und werden nicht als unabhängige Gesamtfallzahl addiert. Ein lokaler Hosttest ist keine installierte SharePoint-/Teams-App. Auch ein unverändertes Bytearchiv bestätigt keine heutige Onlinefassung einer Rechtsquelle.

Bestanden sind 4’006 Produkttests, 90 Host-Lebenszyklustests, 1’584 vollständige AP5-Resultat-/Rechenspurvergleiche und 293 Tests der neuen Inventur-, Schutz- und Abschlusswerkzeuge. Typprüfung und Kandidatenreproduktion im reinen Prüfmodus sind ebenfalls bestanden. Die genannten Testläufe enthalten keine Fehler, Abbrüche, übersprungenen oder als offen markierten Tests.

## Offene Releasegates

| Gate | Behandlung |
| --- | --- |
| Gemeinsamer Quellen- und Fassungsabgleich | R10-A2 mit zwölf nacheinander bearbeiteten Losen, begründeter Wiederverwendung und anschliessender menschlicher Quellenabnahme |
| NE LJu/Justitia | Gesondertes Inkraftsetzungs- und Anwendbarkeitsgate vor Übernahme. Mitgliedschaft oder Projektankündigung ersetzt keine geltende Instanzen-, Sitz- oder Kanalregel |
| Bestehende Fachgrenzen | AI-Quellenbehandlung, ergänzender FR-Spiegel, GR-/NE- und Januargrenzen, konkrete kantonale Kollisionen, AVIV-Option B und OF-001 bleiben erhalten |
| Definitive Übernahme und Build | Erst nach Quellenabnahme konkrete R10-B-Freigabe. Keine Promotion durch synthetische Testfreigaben |
| Recovery | Neu aus dem tatsächlichen MVP09-Ausgangsstand. Das vorhandene Recovery `0.9.0.1` stellt MVP08 wieder her und genügt nicht |
| E/Q und Outlook | Konkrete Ziel-/Datei-/SHA-/Rückfallfreigaben, E vor Q, reale Geräte-/Gastprüfung und manuelle Q-Abnahme. Outlook-Wiederverwendung separat begründen und bestätigen lassen |
| GitHub und P | Spätere gesonderte Freigaben. Root, Sitemap und Hostingkonfiguration bleiben unverändert. Keine erneute Header-/Cacheprüfung gemäss Betreiberentscheid |

**Nächster Auftrag: R10-A2 inhaltlich durchführen.** A1 erteilt keine Quellenfreigabe, keine Datenpromotion und keine Build-, Commit-, Push-, Upload-, Installations- oder Betriebsfreigabe.

