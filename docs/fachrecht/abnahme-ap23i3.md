# AP23I3 Fachlich technische Abnahme

Datum: 27. Oktober 2026. Entscheider: David Steimer.

David Steimer hat erklärt:

> AP23I3 ist fachlich-technisch abgenommen. Bitte schlage die nächste Kantonstranche vor und bereite den nächsten fachlichen Schritt vor.

**AP23I3 ist fachlich-technisch abgenommen.** Empfehlung und Vorbereitung der nächsten Fachtranche sind beauftragt. Deren konkreter Umfang und Start bleiben gesondert zu bestätigen. Diese Abnahme ist keine Quellenrelease-, Publikations-, Installations- oder Betriebsfreigabe.

## Abgenommener Umfang

- Native Integration von Kantonalverfahrenskatalog 6.0.0 sowie Manifest und Mindestconsumer 13.0.0 gemäss [DEC-2026-038](../entscheidungen/DEC-2026-038-beschluss.md).
- 34 neue qualifizierte GL-/TG-Wege, davon 19 für Glarus und 15 für Thurgau. Die 79 bisherigen Definitionen bleiben erhalten, insgesamt 113 Wege. Alle 249 Referenzerwartungen sind am tatsächlichen nativen Reader und Rechenkern sowie unabhängig in Python bestätigt.
- Konkret verkürzte gesetzliche Tagesdauer, aktuelle skalare Fallqualifikation und geschlossene TG-Hinweisauswahl. Eindeutig vorhandener, vollständig fehlender und ungeklärter Hinweis werden unterschieden. Gesetzliche Verkürzung und gewöhnliche angeordnete Eingabe bleiben getrennte Fristarten. Die Grenzen I1-A bis I1-G und das vollständige Fallfenster 29.08.2026–31.12.2027 bleiben einschliesslich der berührten Normtage erhalten.
- 35 Kalenderdefinitionen und 499 Feiertagsregeln unverändert. Vier neue rechtliche Verwendungen ergänzen den Bestand auf 21. Gleiche Kalenderdaten begründen keine freie Vereinigung verschiedener Rollen. 42 der 44 Datenartefakte sind rohbytegleich zur H3-Basis.
- Zweispaltige DE-/FR-Oberfläche, frühe Datumseingabe, statische Beschriftung «Sitz der zuständigen Stelle», verständliche Rechenspur und Standards Version 5 ohne Speicherung aktueller Falltatsachen oder konkreter gesetzlicher Kurzfristdauer.
- Lokale Daten-, Provider-, Web- und SPFx-Integration. Die 44 Sozialregeln und 50 Berner Sozialanbindungen sowie gemeinsame Arithmetik bleiben fachlich unverändert. Die lokale Vorschau bleibt ohne freigegebenen Kalenderdownload. Die ergänzende Exportprobe erzeugte 78 DE-/FR-Inhalte ausschliesslich im Arbeitsspeicher, ohne ICS-Dateien oder Outlook-Importe.

## Gesicherter Abnahmestand

Die [autonom geprüfte Abnahmekopie](../../outputs/ap23i3-abnahme-2026-10-27/receipt.json) enthält **822 Nutzdateien mit 56’426’243 Bytes und den separaten Archivbeleg**. Sie umfasst alle 820 ursprünglichen Schlussbindungen, den ursprünglichen Abschlussnachweis und genau einen zusätzlichen Rohlog, dessen Prüfsumme bereits transitiv in den ursprünglichen Berichten gebunden war. Damit sind auch der erste Timeoutlauf und der erfolgreiche vollständige SPFx-Nachtest autonom vorhanden. Historische Archive werden nicht rekursiv vervielfacht.

Enthalten sind sämtliche 45 rohen Kandidatdateien, tatsächlicher Webbuild, isoliert geprüftes SPPKG, verwendete Quellen und Compilerkonfiguration, Prüfprotokolle, Browserbelege und sechs Screenshots. Vor der Aufnahme wurden 2’839 historische Schutzdateien frisch gegen ihre Sollbytes geprüft. **47 Positiv- und Negativtests des Archivverfahrens sind bestanden.** Die Kopie wurde anschliessend aus ihren eigenen Bytes erneut geprüft.

| Gegenstand | SHA-256 |
| --- | --- |
| Ursprünglicher lokaler I3-Abschluss | `6e836e4da071fb5f983507c88bf4972f5672c5b52d937479fde8ce920607810a` |
| Archivbeleg | `9c43382c61788c665e1ac814410bdd56e0db396b77e2a1157347a116a4183cfe` |
| Kandidatenmanifest `2026-10-22-ap23i3-candidate.1` | `0d25a8b6272234e4affd93b9610cedca885436d1acb60855e31d51923e1e120b` |
| Tatsächlich geprüftes lokales SPFx-Testpaket | `481b337573991dbdd2b41a4f327811a6d2fc4211dcb219e3c5845f009f1dd1fd` |

Der ursprüngliche [Integrationsbericht](../architektur/verwaltungsintegration-ap23i3.md) und [Schlussnachweis](../../outputs/ap23i3-2026-10-22/local-completion.json) behalten ihren damaligen Vorabnahmestatus. Insbesondere bleibt `professionalTechnicalAcceptance: false` im ursprünglichen Bericht unverändert. Die heutige menschliche Abnahme steht ausschliesslich in diesem Dokument und im separaten Archivbeleg. Spätere Änderungen der sieben lebenden Einstiegstexte sind nicht rückwirkend Teil des abgenommenen Prüfstands.

Die technischen Nachweise umfassen 3’110 Produktprüfungen, 50 lokale Hostlebenszyklusprüfungen, 22 Prüfungen am tatsächlichen minifizierten Webbundle, neun Python-Vertragsprüfungen, 91 Archiv-/Schutzprüfungen, 261 SPFx-Quellprüfungen sowie 170 historische und acht native Prüfungen des tatsächlichen SPPKG. Überlappende Mengen werden nicht addiert. Drei Dateitimeouts des ersten historischen Paketlaufs wurden mit höherem Zeitbudget vollständig gegen dieselben Paketbytes nachgeprüft. Produkt und alte Tests wurden dafür nicht korrigiert oder neu gebaut. Die Browserbelege sind CUA-, Accessibility-, DOM- und Sichtprüfungen, keine reale Geräte-, Gast- oder M365-Prüfung eines späteren Auslieferungskandidaten.

## Nächster Fachschritt und Freigabegrenzen

Die [Vorbereitung AP23J1](../planung/ap23j1-vorbereitung-fr-ge-ju.md) schlägt **Freiburg, Genf und Jura** als nächste Fachtranche vor. Sie enthält Untersuchungsumfang, begrenzte amtliche Vorprüfung, offene Fachfragen, Ergebnisse und Abnahmekriterien. AP23J1 ist vorbereitet, aber noch nicht gestartet oder fachlich abgenommen.

Damit sind **16 Kantone** im vereinbarten allgemeinen Umfang lokal modelliert und abgenommen. BE, TI, GR, LU, ZG und AR bleiben im bestehenden MVP09-Umfang operativ verfügbar. ZH, AG, SG, UR, SO, SH, OW, NW, GL und TG sind zusätzlich nur lokal abgenommen. Zehn Kantone bleiben auszuarbeiten: AI, BS, BL, FR, GE, JU, NE, SZ, VD und VS. Dies ist keine vollständige Abdeckung sämtlicher kantonaler Spezialverfahren.

[DEC-2026-034](../entscheidungen/DEC-2026-034-gebuendelter-schweizausbau.md) bleibt verbindlich. Kein regulärer Zwischenrelease vor Abschluss der vereinbarten Kantonsabdeckung. Der I3-Datenstand bleibt Kandidat, die formelle Quellenreleaseprüfung bleibt getrennt. Keine Quellenpromotion, definitiven Auslieferungsartefakte, Commits, Quellpushs, Uploads, Installationen, Mirrorumstellungen oder Änderungen an E/Q/P, AP5, AP21, Hosting und Berechtigungen. GitHub #48 wird durch diesen lokalen Dokumentationsschritt nicht veröffentlicht oder verändert.

David Steimer nimmt die menschlichen Fach-, Abnahme- und Betriebsrollen in Personalunion wahr. Codex ist dokumentiertes KI-Arbeitsinstrument ohne formelle Freigabe- oder Haftungsverantwortung.
