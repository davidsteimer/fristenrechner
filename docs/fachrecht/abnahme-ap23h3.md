# AP23H3 Fachlich technische Abnahme

Datum: 22. Oktober 2026. Entscheider: David Steimer.

David Steimer hat erklärt:

> AP23H3 ist fachlich-technisch abgenommen. Bitte schlage die nächste Kantonstranche vor und bereite den nächsten fachlichen Schritt vor.

**AP23H3 ist fachlich-technisch abgenommen.** Empfehlung und Vorbereitung der nächsten Tranche sind beauftragt. Deren konkreter Umfang und Start bleiben gesondert zu bestätigen. Diese Abnahme ist keine Quellenrelease-, Publikations- oder Betriebsfreigabe.

## Abgenommener Umfang

- Native Integration von Kantonalverfahrenskatalog 5.0.0 sowie Manifest und Mindestconsumer 12.0.0 gemäss [DEC-2026-037](../entscheidungen/DEC-2026-037-beschluss.md).
- 21 neue qualifizierte Wege, davon sieben für Obwalden und vierzehn für Nidwalden. Die 58 bisherigen Definitionen bleiben erhalten, insgesamt 79 Wege. Alle 118 H1-Referenzerwartungen sind am nativen Consumer bestätigt.
- Begründungsverlangen, besondere Eröffnungsketten, qualifizierte kurze Rechtsmittel, gesetzliche und angeordnete Tagesfristen mit ihren unterschiedlichen Stillständen. Sämtliche Grenzen H1-A bis H1-F bleiben erhalten, einschliesslich des OW-Fassungswechsels und der begrenzten Endverschiebungskollisionen.
- 35 Kalenderdefinitionen und 17 rechtliche Kalenderverwendungen. Der Feiertagskatalog enthält 479 bestehende Katalogregeln, zwölf gesonderte SO-Prozessregeln und acht neue OW-/NW-Prozessregeln. Die zwei neuen Prozessprojektionen sind ausdrücklich an ihre Elternquellen gebunden.
- Zweispaltige DE-/FR-Oberfläche, frühe Datumseingabe, verständliche Rechenspur und Standards Version 5 ohne Speicherung aktueller Falltatsachen. Das Fallfenster 29.08.2026–31.12.2027 bleibt einschliesslich der betroffenen Normtage begrenzt.
- Lokale Provider-, Web- und SPFx-Integration. Die 44 Sozialregeln und 50 Berner Sozialanbindungen sowie die gemeinsame Tagesarithmetik bleiben fachlich unverändert. Lokaler Kandidat und Vorschau bleiben ohne freigegebenen Kalenderdownload.

## Gesicherter Abnahmestand

Die [exakte Abnahmekopie](../../outputs/ap23h3-abnahme-2026-10-22/receipt.json) enthält **417 Nutzdateien mit 19’442’163 Bytes und den separaten Archivbeleg**. Enthalten sind sämtliche 45 rohen Kandidatdateien, die gebundenen Quellen und Nachweise, drei generierte Module, der tatsächliche Webbuild, das isoliert geprüfte lokale SPFx-Testpaket und die Browsernachweise. Die ursprünglichen 314 Quellen- und 51 Evidenzbindungen wurden vollständig verglichen. Identische Überschneidungen sind nur einmal enthalten.

Die Aufnahme hat 1’810 historische Schutzdateien und zwei separat gebundene Registry-Ausnahmen frisch geprüft. Historische Schutzinventare wurden nicht rekursiv dupliziert. Das Archiv wurde aus seinen eigenen Bytes erneut geprüft. **54 Positiv- und Negativtests des Archivverfahrens sind bestanden.** Die nachfolgende Aktualisierung der sieben lebenden Einstiegstexte verändert diese Abnahmekopie nicht.

| Gegenstand | SHA-256 |
| --- | --- |
| Ursprünglicher lokaler H3-Abschluss | `abbdc0fdb5af0a853c5f0f213848b599be5661607c5dd403916687fd32f4e06a` |
| Archivbeleg | `49bc0fa9060a52d0301dd7b55c269cbc4834cd47170b592db8f7cdb1da4cb357` |
| Kandidatenmanifest `2026-10-22-ap23h3-candidate.1` | `14f60a83ed2f13e3f176f303e444ea43a606bae6980033e3d875093c63a5d429` |
| Tatsächlich geprüftes lokales SPFx-Testpaket | `c1d7d9f3ff9e5491e85caf1f9e1bf2690aeea8bda5dce74dd30a79f4abefd3f8` |

Der ursprüngliche [Integrationsbericht](../architektur/verwaltungsintegration-ap23h3.md) und die Prüfberichte bewahren ihren damaligen Vorabnahmestatus. Insbesondere bleibt `professionalTechnicalAcceptance: false` im ursprünglichen Gesamtnachweis unverändert. Die heutige menschliche Abnahme steht in diesem Dokument und im separaten Archivbeleg.

Die Nachweise umfassen 3’053 bestandene Produkttests, 40 Host-Lebenszyklustests, 16 tatsächliche Webbuildtests, neun Pythonprüfungen, 29 H2-Archivtests, 248 SPFx-Provider-/Integrationstests sowie 170 bestehende und neun neue Prüfungen des tatsächlichen Pakets. Überlappende Mengen werden nicht addiert. Ein gesonderter KI-Gegencheck enthält 13 Tests. Der gesonderte Exportnachweis prüft 21 Wege in DE/FR ausschliesslich im Arbeitsspeicher, ohne Kalenderdateien oder Outlook-Importe. Vier Screenshots belegen den lokalen Browserstand. Die 60 nicht blockierenden Lintmeldungen bleiben dokumentiert. Dies ersetzt keine reale Geräte-, Gast- oder M365-Prüfung eines späteren gemeinsamen Auslieferungskandidaten.

## Nächster Fachschritt und Freigabegrenzen

Die [Vorbereitung AP23I1](../planung/ap23i1-vorbereitung-gl-tg.md) schlägt **Glarus und Thurgau** als nächste Zweiertranche vor. Sie enthält amtliche Vorprüfung, Untersuchungsumfang, offene Fachfragen und Abnahmekriterien. AP23I1 ist vorbereitet, aber noch nicht gestartet oder fachlich abgenommen.

Damit sind **14 Kantone** im vereinbarten allgemeinen Umfang lokal modelliert und abgenommen. BE, TI, GR, LU, ZG und AR sind im bestehenden MVP09-Umfang operativ verfügbar. ZH, AG, SG, UR, SO, SH, OW und NW sind zusätzlich nur lokal abgenommen. Zwölf Kantone bleiben auszuarbeiten. Das ist keine vollständige Abdeckung sämtlicher kantonaler Spezialverfahren.

[DEC-2026-034](../entscheidungen/DEC-2026-034-gebuendelter-schweizausbau.md) bleibt verbindlich. Kein regulärer Zwischenrelease vor Abschluss der vereinbarten Kantonsabdeckung. Der H3-Datenstand bleibt Kandidat. Keine Quellenpromotion, definitiven Auslieferungsartefakte, Commits, Quellpushs, Uploads, Installationen, Mirrorumstellungen oder Änderungen an E/Q/P, AP5, AP21, Hosting und Berechtigungen. Die Nachführung von GitHub #48 ist durch diesen lokalen Dokumentationsschritt nicht erfolgt.

David Steimer nimmt die menschlichen Fach-, Abnahme- und Betriebsrollen in Personalunion wahr. Codex ist dokumentiertes KI-Arbeitsinstrument ohne formelle Freigabe- oder Haftungsverantwortung.
