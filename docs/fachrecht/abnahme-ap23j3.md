# AP23J3 Fachlich technische Abnahme

Datum: 27. Oktober 2026. Entscheider: David Steimer.

David Steimer hat erklärt:

> AP23J3 ist fachlich-technisch abgenommen. Bitte schlage die nächste Kantonstranche vor und bereite den nächsten fachlichen Schritt vor.

**AP23J3 ist fachlich-technisch abgenommen.** Empfehlung und Vorbereitung der nächsten Fachtranche sind beauftragt. Deren Umfang und Start bleiben gesondert zu bestätigen. Quellenrelease, Publikation, Installation und Betrieb sind nicht Gegenstand dieser Abnahme.

## Abgenommener Umfang

- Native Integration des Kantonalverfahrenskatalogs **7.0.0** sowie von Manifest und Mindestconsumer **14.0.0** gemäss [DEC-2026-039](../entscheidungen/DEC-2026-039-beschluss.md).
- **36 neue Wege**, davon elf für Freiburg, sieben für Genf und 18 für Jura. Die 113 bisherigen Definitionen bleiben erhalten, insgesamt 149 Wege. Alle 673 Referenzerwartungen sind am nativen Reader und Rechenkern sowie unabhängig in Python bestätigt.
- Geschlossene Auslöser und Eröffnungsqualifikation. Der Genfer tatsächliche Empfang gewöhnlicher Post wird von einer bereits rechtlich qualifizierten Eröffnung getrennt. Freiburger Nachfristen und FR-/JU-Verlangen erzeugen keine fiktive Folgeeröffnung. Die abgenommenen Grenzen J1-A bis J1-G und das vollständige Fallfenster **29.08.2026–31.12.2027** bleiben erhalten.
- Zwei beziehungsweise drei Freiburger Stillstandsperioden, Genfer Verfahrensfunktion und Sachgebietsausnahmen sowie jurassische Erst-, Einsprache-, Rechtsmittel- und echte vorsorgliche Verfahren werden unterschieden. Die Rechenspur zeigt die tatsächlich berührten Normfassungen und die aufgelöste Eröffnung.
- Unveränderte 35 Kalenderdefinitionen und 499 Katalogregeln. 42 der 44 Datenartefakte sind rohbytegleich zur I3-Basis. Sechs zusätzliche rechtliche Kalenderverwendungen erhöhen deren Zahl auf 27. Die 44 Sozialregeln und 50 Berner Sozialanbindungen bleiben unverändert.
- Zweispaltige DE-/FR-Oberfläche, frühe Datumseingabe, statische Beschriftung «Sitz der zuständigen Stelle» und Standards Version 5. Datum, Referenz, positive aktuelle Fallqualifikation und Genfer Eröffnungsmodus werden nicht als persönliche Vorgaben gespeichert.
- Lokale Daten-, Provider-, Web- und SPFx-Integration ohne Betriebswechsel. Kalenderexporte bleiben in der lokalen Prüfansicht gesperrt. Die zusätzliche Exportprobe erzeugte 88 DE-/FR-Inhalte für 44 Fälle ausschliesslich im Arbeitsspeicher, ohne gespeicherte ICS-Dateien oder Outlook-Importe.

## Gesicherter Abnahmestand

Die [autonom geprüfte Abnahmekopie](../../outputs/ap23j3-abnahme-2026-10-27/receipt.json) umfasst **1’284 Nutzdateien mit 76’144’504 Bytes und einen separaten Archivbeleg**. Sie enthält die 1’232 ursprünglichen Schlussbindungen und den ursprünglichen Abschlussnachweis. Zusätzlich sind genau 51 Rohinputs aufgenommen, die bereits im original gebundenen Fortsetzungskontext mit ihren Prüfsummen bezeichnet waren. Die [feste Zusatzliste](../../scripts/archive-ap23j3-acceptance.mjs) ergänzt ausschliesslich fehlende Rohdateien aus diesem Kontext. Sie erweitert keine historischen Archive rekursiv.

Damit sind auch sämtliche 899 Fortsetzungsinputs und 278 Source-/Stage-Paare aus den Archivbytes prüfbar. Enthalten sind die 45 rohen Kandidatdateien, tatsächlicher Webbuild, isoliert geprüftes SPPKG, Quellen- und Compilerkonfigurationen, Prüfprotokolle, Browserbelege und sechs Screenshots. Vor der Aufnahme wurden **4’466 historische Schutzdateien** frisch gegen ihre Sollbytes geprüft, ohne diese zusätzlich zu kopieren. **56 Positiv- und Negativtests des Archivverfahrens sind bestanden.** Die Kopie wurde anschliessend autonom aus ihren eigenen Bytes erneut geprüft.

| Gegenstand | SHA-256 |
| --- | --- |
| Ursprünglicher lokaler J3-Abschluss | `0af5b41ed029890c2f9538fd4052bad69ca9c6f50dde2f0af5fdcc3ecd921595` |
| Archivbeleg mit 257’640 Bytes | `2dc1ad03491435959c2985934436be99bf7dcf924eb65fe71a4c6187ea505b1a` |
| Geschlossene Liste der 51 zusätzlichen Rohinputs | `a1106bdf1d867ebc045c6ffaf6c8e59f8b4b31cec12b395ca5d4b0238741eaaf` |
| Kandidatenmanifest `2026-10-27-ap23j3-candidate.1` | `b059a7b1e7812d6e345b350e6d02a34ca0acfb92763aa9a25b332669cbb5b989` |
| Tatsächlich geprüftes lokales SPFx-Testpaket | `aa2434dc7ec635604ae2b5f7d7d99043d1b03765f8587265adbef357a822000f` |

Der ursprüngliche [Integrationsbericht](../architektur/verwaltungsintegration-ap23j3.md) und [Schlussnachweis](../../outputs/ap23j3-2026-10-27/local-completion.json) behalten ihren damaligen Vorabnahmestatus. Insbesondere bleibt `professionalTechnicalAcceptance: false` im ursprünglichen Bericht unverändert. Die heutige menschliche Abnahme steht nur in diesem Dokument und im separaten Archivbeleg. Spätere Änderungen der sieben lebenden Einstiegstexte sind nicht rückwirkend Teil des abgenommenen Prüfstands.

Die technischen Nachweise umfassen zwölf erfolgreiche Schritte der Gesamtprüfung, 3’191 Produktprüfungen, 60 lokale Hostlebenszyklustests, 27 Tests am tatsächlichen minifizierten Webbundle, zwölf Python-Vertragsprüfungen und 105 Archiv-/Schutzprüfungen. Der reguläre isolierte SPFx-Bau umfasst 274 Quelltests, 170 historische Pakettests und acht zusätzliche Prüfungen am tatsächlichen AMD-Paket. Überlappende Mengen werden nicht addiert. Zehn lokale Browserfälle sind für Deutsch und Französisch belegt, aber keine späteren realen Geräte-, Gast- oder M365-Prüfungen.

Der erste Webtestversuch endete nach 21 bestandenen Tests am globalen Dateizeitlimit mit einem Abbruch und ohne Assertionfehler. Ursprünglicher QA-Bericht, vollständiger Timeoutlog und damaliger Runner bleiben archiviert. Die gesamte unveränderte Webtestdatei wurde mit höherem Zeitbudget erneut ausgeführt und mit 27 bestandenen Tests abgeschlossen. Die 899 Inputs und 278 Source-/Stage-Paare blieben vor und nach der Fortsetzung gleich. Produktcode und Fachregeln wurden dafür nicht geändert.

## Nächster Fachschritt und Freigabegrenzen

Die [Vorbereitung AP23K1](../planung/ap23k1-vorbereitung-bs-bl.md) schlägt **Basel-Stadt und Basel-Landschaft** als nächste Fachtranche vor. Sie ist vorbereitet, aber noch nicht gestartet oder fachlich abgenommen. Die endgültige Zahl positiver Wege und ein allfälliger technischer Vertragsnachtrag werden nicht vorweggenommen.

Damit sind **19 Kantone** im vereinbarten allgemeinen Umfang lokal modelliert und abgenommen. BE, TI, GR, LU, ZG und AR bleiben im bisherigen MVP09-Umfang operativ verfügbar. ZH, AG, SG, UR, SO, SH, OW, NW, GL, TG, FR, GE und JU sind zusätzlich nur lokal abgenommen. Sieben Kantone bleiben auszuarbeiten: AI, BS, BL, NE, SZ, VD und VS. Dies ist keine vollständige Abdeckung sämtlicher kantonaler Spezialverfahren.

[DEC-2026-034](../entscheidungen/DEC-2026-034-gebuendelter-schweizausbau.md) bleibt verbindlich. Kein regulärer Zwischenrelease vor Abschluss der vereinbarten Kantonsabdeckung. Der J3-Datenstand bleibt Kandidat. Die formelle Quellenreleaseprüfung bleibt getrennt. Keine Quellenpromotion, definitive Auslieferungsartefakte, Commits, Quellpushs, Uploads, Installationen, Mirrorumstellungen oder Änderungen an E/Q/P, AP5, AP21, Hosting und Berechtigungen. GitHub #48 wird durch diese lokale Nachführung nicht veröffentlicht oder verändert.

David Steimer nimmt die menschlichen Fach-, Abnahme- und Betriebsrollen in Personalunion wahr. Codex ist dokumentiertes KI-Arbeitsinstrument ohne formelle Freigabe- oder Haftungsverantwortung.
