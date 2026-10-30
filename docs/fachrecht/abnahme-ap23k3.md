# AP23K3 Fachlich technische Abnahme

Stand: 27. Oktober 2026. Abnahme durch David Steimer.

David hat die lokale Integration von Basel-Stadt und Basel-Landschaft fachlich-technisch abgenommen:

> AP23K3 ist fachlich-technisch abgenommen. Bitte schlage die nächste Kantonstranche vor und bereite den nächsten fachlichen Schritt vor.

Damit sind **21 Kantone im vereinbarten allgemeinen Umfang integriert und abgenommen**, davon sechs operativ auf MVP 0.9 und 15 weitere ausschliesslich lokal. Noch nicht integriert sind AI, NE, SZ, VD und VS. Eine vollständige Abdeckung aller kantonalen Spezialverfahren ist damit nicht behauptet.

## Abgenommener Umfang

Der Verwaltungsverfahrenskatalog 8.0.0 und Manifest beziehungsweise Mindestconsumer 15.0.0 entsprechen dem beschlossenen [DEC-2026-040](../entscheidungen/DEC-2026-040-beschluss.md). Die lokale Integration enthält 149 erhaltene und 16 neue BS-/BL-Wege, insgesamt 165 Verwaltungspfade. Die 35 physischen Kalender, 499 Feiertagsregeln, 44 Sozialregeln und 50 BE-Sozialanbindungen bleiben in ihrem bisherigen Umfang erhalten.

Die Abnahme umfasst die dynamische Feiertagsbindung der BS-Gerichtswege, die eigenständige Behandlung der jährlichen ganztägigen BL-Büroschliessungen und die begrenzte Sperre bei unterschiedlichen Fasnachts-Vergleichsergebnissen. Der gezielte DE-/FR-Textnachtrag beseitigt die widersprüchlichen Negativformulierungen in der gesperrten Rechenspur. Rechenlogik und Rechtsdaten wurden dadurch nicht verändert. Das bestätigte vollständige Fallfenster für die neuen Wege bleibt 29.08.2026 bis 31.12.2027.

Der [Integrationsbericht](../architektur/verwaltungsintegration-ap23k3.md) beschreibt den damaligen technischen Übergabestand. Die vollständige Wiederholung nach dem Textnachtrag bestand 3’379 Produktprüfungen, 70 Hosttests, 32 tatsächliche Web-Build-Tests, 283 SPFx-Quelltests, 170 historische Pakettests und 13 Tests gegen das tatsächliche korrigierte Paket. Die unabhängigen Referenzprüfungen und die getrennten 673 Bestandsreferenzen sind gebunden. Die lokale Browserkontrolle umfasst acht Beobachtungen und sieben Screenshots. Diese Prüfebenen werden nicht zu einer überschneidungsfreien Gesamtsumme addiert.

## Unveränderte Originalnachweise und separates Abnahmearchiv

Der [technische Originalabschluss](../../outputs/ap23k3-2026-10-27/local-completion.json) behält seinen historischen Status `local-technical-verification-passed-awaiting-human-acceptance` und sämtliche ursprünglichen Freigabeflags. Seine SHA-256-Prüfsumme lautet:

`39832ef824ac573dbcbeffe2aed5f965781903513475c1c381e041dc7de2b458`

Die menschliche Abnahme steht ausschliesslich in dieser Notiz und im [separaten Abnahmebeleg](../../outputs/ap23k3-abnahme-2026-10-27/receipt.json). Das autonome Archiv enthält genau **1’324 Originaldateien**, nämlich die 1’323 gebundenen Dateien und den technischen Originalabschluss. Die Payloads umfassen 88’880’559 Bytes. Der Beleg selbst kommt hinzu. Seine SHA-256-Prüfsumme lautet:

`8609424600cfb276fa92338e7f4ef915034894f03c0e98ccb80f48c9002a0dd8`

Vor der Abnahmeaufzeichnung wurde der ursprüngliche technische Finalizer erneut ohne Änderung der Quellen ausgeführt. Zusätzlich wurden die 6’696 geschützten Bestandsdateien rohbyteweise bestätigt, aber nicht erneut rekursiv archiviert. Spätere Änderungen an den lebenden Einstiegstexten verändern die gesicherten Originalkopien nicht. Die Archivprüfung liest nach der Erzeugung ausschliesslich die archivierten Payloads und benötigt weder den aktuellen Quellstand noch dessen Git-HEAD.

## Folgeschritt und Freigabegrenzen

Die nächste Kantonstranche darf vorgeschlagen und ihr fachlicher Untersuchungsumfang vorbereitet werden. Ihre konkrete Facharbeit, fachliche Abnahme und allfällige Vertragsänderung folgen gesondert. Ein neuer Katalog-, Manifest- oder Releaseversionsentscheid wird nicht vorweggenommen.

[DEC-2026-034](../entscheidungen/DEC-2026-034-gebuendelter-schweizausbau.md) bleibt verbindlich. Es gibt keinen regulären Zwischenrelease vor Abschluss der vereinbarten Kantonsabdeckung. Diese Abnahme ist keine Quellenrelease-, Publikations-, Installations- oder Betriebsfreigabe. Der Datenstand bleibt ein lokaler Kandidat, Kalenderexporte seiner Prüfvorschau bleiben gesperrt. Keine Commits, GitHub-Änderungen, Uploads, Installationen oder Änderungen an E/Q/P, Mirrors, AP5, AP21, Hosting, M365-Berechtigungen und Richtlinien.

David nimmt die menschlichen Fach-, Abnahme- und Betriebsrollen in Personalunion wahr. Codex ist ein dokumentiertes KI-Arbeitsinstrument ohne formelle Freigabe- oder Haftungsverantwortung.
