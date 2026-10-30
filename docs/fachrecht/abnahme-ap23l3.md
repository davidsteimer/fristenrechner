# AP23L3 Fachlich technische Abnahme

Stand: 27. Oktober 2026. Abnahme durch David Steimer.

David hat die lokale Integration von Appenzell Innerrhoden und Schwyz fachlich-technisch abgenommen:

> AP23L3 ist fachlich-technisch abgenommen. Bitte schlage die nächste Kantonstranche vor und bereite den nächsten fachlichen Schritt vor.

Damit sind **23 Kantone im vereinbarten allgemeinen Umfang integriert und abgenommen**, davon sechs operativ auf MVP 0.9 und 17 weitere ausschliesslich lokal. Noch nicht integriert sind NE, VD und VS. Eine vollständige Abdeckung aller kantonalen Spezialverfahren ist damit nicht behauptet.

## Abgenommener Umfang

Der Kantonalverfahrenskatalog 9.0.0 und Manifest beziehungsweise Mindestconsumer 16.0.0 entsprechen dem beschlossenen [DEC-2026-041](../entscheidungen/DEC-2026-041-beschluss.md). Die lokale Integration enthält 165 erhaltene und 31 neue AI-/SZ-Wege, insgesamt 196 Verwaltungspfade. Die 35 physischen Kalender, 499 Feiertagsregeln, 44 Sozialregeln und 50 BE-Sozialanbindungen bleiben in ihrem bisherigen Umfang erhalten. 42 der 44 Kandidatenartefakte sind gegenüber der abgenommenen L2-Vertragsprobe rohbytegleich.

Die Abnahme umfasst die qualifizierte AI-Eröffnung einschliesslich der ausdrücklich aktuellen Trackingvoraussetzungen, die konkret längere AI-Rechtsmittelbelehrung, die tatsächlich angeordnete SZ-Einsprachedauer und die eigenständige Schwyzer Martinstags-Endverschiebung. Bei einem Bedeutungswechsel der Datumseingabe werden bisherige Datumswerte und nicht bestätigte Eingabeentwürfe verworfen. Gesetzliche Dauern bleiben nicht frei übersteuerbar. Das bestätigte vollständige Fallfenster für die neuen Wege bleibt 29.08.2026 bis 31.12.2027. AI-O1 bis AI-O3, SZ-O1, die Endverschiebung in neu beginnenden Stillstand und die weiteren dokumentierten Abgrenzungen bleiben erhalten.

Der [Integrationsbericht](../architektur/verwaltungsintegration-ap23l3.md) beschreibt den damaligen technischen Übergabestand und die prüfseitigen Korrekturen. Nach der Korrektur der optionalen Input-9-Validierung wurde die vollständige 16-Schritt-QA erneut durchgeführt. Bestanden sind 3’588 Produktprüfungen, 80 Host-Lifecycle-Tests, neun tatsächliche Web-Build-Tests, 125 Governance-Tests, 288 SPFx-Quelltests, 170 historische Pakettests und zehn Tests gegen das tatsächliche endgültige SPPKG. Die Prüfebenen werden nicht zu einer überschneidungsfreien Gesamtsumme addiert.

83 unveränderte Originalreferenzen, 20 gesonderte Technikproben, 165 frühere native Rechenresultate und 673 geerbte Fälle sind gebunden. Die unabhängige Python-Nachrechnung umfasst zusätzlich 697 Proben, zwölf Kalenderproben und drei Mutationssensitivitäten. Der Browsernachweis dokumentiert drei tatsächliche lokale Bedienproben. Die Exportprüfung erzeugte 108 synthetische DE-/FR-Kalenderstrings ausschliesslich im Arbeitsspeicher. Es wurden keine ICS-Dateien gespeichert oder Outlook-Importe ausgeführt. Diese Nachweise sind weder reale Geräte- oder M365-Prüfungen noch zusätzliche menschlich abgenommene Rechtsfälle.

Der dokumentierte technische Pflegevorbehalt bleibt bestehen: Der SPFx-Bau enthält 112 Lintwarnungen, davon 13 in den neuen V9-/Format-16-Modulen und 99 in früheren oder gemeinsam genutzten Teilen. Die 13 neuen Warnungen betreffen sechs unbenutzte Variablen, drei fehlende explizite Rückgabetypen und vier explizite `any`-Verwendungen. Compiler und Paketprüfungen sind bestanden. Aus der fachlich-technischen Abnahme wird **kein zusätzlicher ausdrücklicher Risikoentscheid** und keine Nullwarnungsbehauptung abgeleitet.

## Unveränderte Originalnachweise und separates Abnahmearchiv

Der [technische Originalabschluss](../../outputs/ap23l3-2026-10-27/local-completion.json) behält seinen historischen Status `local-technical-verification-passed-awaiting-human-acceptance` und sämtliche ursprünglichen Freigabeflags. Seine SHA-256-Prüfsumme lautet:

`7d69d82b8edd262a383647f84080e576259cf38c6751a40bc1d9b69a38850b49`

Die menschliche Abnahme steht ausschliesslich in dieser Notiz und im [separaten Abnahmebeleg](../../outputs/ap23l3-abnahme-2026-10-27/receipt.json). Das autonome Archiv enthält genau **1’427 Originaldateien**, nämlich die 1’426 gebundenen Dateien und den technischen Originalabschluss. Die Payloads umfassen 116’479’852 Bytes. Der Beleg selbst kommt hinzu. Seine SHA-256-Prüfsumme lautet:

`f09d6c37f5a70afdb26dcd924df44bd9d01ed90764f94dcb884a631816fc0927`

Vor neuen Dateien und Änderungen an den lebenden Einstiegstexten wurde der ursprüngliche technische Finalizer erneut unverändert ausgeführt. Die gesonderte Bestandskontrolle und der Archivproduzent bestätigten zusätzlich alle 9’130 geschützten Bestandsdateien. Diese werden nicht erneut rekursiv archiviert. Ältere Archive werden ebenfalls nicht rekursiv kopiert. Soweit ein früherer Archivbeleg oder eine ältere Datei schon Bestandteil der exakt gebundenen L3-Dateiliste ist, bleibt genau diese gebundene Datei enthalten.

Spätere Änderungen an den lebenden Einstiegstexten verändern die gesicherten Originalkopien nicht. Nach der Erzeugung prüft [der Archivprüfer](../../scripts/archive-ap23l3-acceptance.mjs) ausschliesslich die archivierten Payloads und deren geschlossene Dateiliste. Aktuelle Quelldateien und der aktuelle Git-HEAD werden dafür nicht benötigt. Zusätzliche, fehlende oder veränderte Archivdateien werden zurückgewiesen. Ein unvollständiges Archiv wird nicht stillschweigend repariert oder ersetzt.

## Folgeschritt und Freigabegrenzen

Die nächste Kantonstranche darf vorgeschlagen und ihr fachlicher Untersuchungsumfang vorbereitet werden. Ihre konkrete Facharbeit, fachliche Abnahme und allfällige Vertragsänderung folgen gesondert. Insbesondere werden weder AP23M1 noch eine vollständige neue Fachrecherche durch diesen Vorbereitungsauftrag gestartet. Ein neuer Katalog-, Manifest- oder Releaseversionsentscheid wird nicht vorweggenommen.

[DEC-2026-034](../entscheidungen/DEC-2026-034-gebuendelter-schweizausbau.md) bleibt verbindlich. Es gibt keinen regulären Zwischenrelease vor Abschluss der vereinbarten Kantonsabdeckung. Diese Abnahme ist keine Quellenrelease-, Publikations-, Installations- oder Betriebsfreigabe. Der Datenstand bleibt ein lokaler Kandidat, Kalenderexporte seiner Prüfvorschau bleiben gesperrt. Keine Commits, GitHub-Änderungen, Uploads, Installationen oder Änderungen an E/Q/P, Mirrors, AP5, AP21, Hosting, M365-Berechtigungen und Richtlinien.

David nimmt die menschlichen Fach-, Abnahme- und Betriebsrollen in Personalunion wahr. Codex ist ein dokumentiertes KI-Arbeitsinstrument ohne formelle Freigabe- oder Haftungsverantwortung.
