# AP23M3 Fachlich technische Abnahme

Stand: 28. Oktober 2026. Abnahme durch David Steimer.

David hat die lokale Integration von Neuenburg, Waadt und Wallis fachlich-technisch abgenommen:

> AP23M3 ist fachlich-technisch abgenommen. Damit sind alle Kantone im vereinbarten Umfang lokal integriert. Bitte bereite die nächsten Schritte für den gebündelten Release vor.

Damit sind **alle 26 Kantone im vereinbarten allgemeinen Umfang lokal integriert und abgenommen**. Sechs Kantone sind bereits auf MVP 0.9 operativ, die weiteren 20 sind ausschliesslich lokal abgenommen. Die Bilanz behauptet weder eine vollständige Modellierung sämtlicher kantonaler Spezialverfahren noch die aktuelle Betriebsfreigabe des neuen Gesamtstands.

**Bei der anschliessenden Releaseinventur wurde ein zusätzlicher Bestandsfehler gefunden. Dieser war bei der vorstehenden menschlichen Erklärung noch nicht bekannt. Er verhindert die Freigabe eines unveränderten Gesamtproduktrelease.** Die Abnahme der vereinbarten Kantonsintegration und der neue Releaseblocker werden deshalb getrennt dokumentiert.

## Abgenommener Integrationsumfang

Der Kantonalverfahrenskatalog 10.0.0 sowie Manifest und Mindestconsumer 17.0.0 entsprechen dem beschlossenen [DEC-2026-042](../entscheidungen/DEC-2026-042-beschluss.md). Der lokale Kandidat enthält 196 erhaltene und 49 neue Verwaltungspfade, insgesamt 245. Die neuen Wege verteilen sich auf 16 NE-, 19 VD- und 14 VS-Gruppen. 35 Kalenderdefinitionen und 499 Katalogregeln bleiben erhalten. Die 44 Sozialregeln und 50 BE-Sozialanbindungen sind als Daten unverändert vorhanden. 42 der 44 Kandidatenartefakte sind gegenüber der abgenommenen M2-Vertragsprobe rohbytegleich. Die übrigen zwei enthalten die erforderlichen Releasebindungen.

Die Abnahme umfasst die bestätigten aktuellen Fallqualifikationen, die spezifischen Kalenderbindungen, die bedingte NE-Sitzqualifikation, die begrenzte VD-Eröffnungsautomatik und die getrennte VS-Behandlung der gesetzlich vorgesehenen Verfahrenshandlungen und konkret längeren Rechtsmittelbelehrung. Gesetzliche Dauern werden nicht frei übersteuerbar. Das vollständige bestätigte Fallfenster für die neuen Wege bleibt 29.08.2026 bis 31.12.2027. Die fachlich abgenommenen offenen Punkte und Grenzen werden nicht durch die Integration aufgehoben.

Der [Integrationsbericht](../architektur/verwaltungsintegration-ap23m3.md) beschreibt die Umsetzung, die tatsächlichen Prüfebenen und die verbleibenden Grenzen. Die vollständige lokale 16-Schritt-QA bestand mit 3’876 Produktprüfungen, 90 Host-Lifecycle-Tests, neun Prüfungen gegen den tatsächlichen Web-Build und 140 Governance-Tests. Nach den abschliessenden Metadaten- und Befundnachträgen wurde die Governance-Prüfung zusätzlich vollständig mit 141 bestandenen Tests wiederholt. Der endgültige SPFx-Bau bestand mit 293 Quelltests aus 25 Dateien, 170 historischen Pakettests aus 31 Dateien und acht zusätzlichen Tests gegen das tatsächliche endgültige SPPKG. Diese Prüfebenen werden nicht zu einer überschneidungsfreien Gesamtsumme addiert.

109 unveränderte M1-Originalreferenzen, 33 gesonderte Technikproben, 196 frühere native Rechenresultate und 776 geerbte Fälle sind gebunden. Die unabhängige Python-Nachrechnung umfasst 1’239 zusätzliche Modellproben, 22 Kalenderanker und drei Mutationssensitivitäten. Die 196 früheren und 776 geerbten Resultate werden gegenüber den unveränderten akzeptierten Nachweisen vollständig mathematisch verglichen. Diese historischen Vergleiche werden nicht als eigenständige neue Python-Reimplementierung der früheren Rechtsarithmetik ausgegeben.

Der Browsernachweis dokumentiert vier tatsächliche lokale Bedienproben. Die Exportprüfung erzeugte für 73 qualifizierte Fälle 146 synthetische DE-/FR-Kalenderstrings ausschliesslich im Arbeitsspeicher und verweigerte die 36 gesperrten Fälle. Es wurden keine ICS-Dateien gespeichert oder Outlook-Importe ausgeführt. Diese Nachweise sind weder reale Geräte- oder M365-Prüfungen noch zusätzliche menschlich abgenommene Rechtsfälle.

## Nach der Abnahme entdeckter Releaseblocker R10-H01

Der [gesonderte technische Befund](../../outputs/ap23m3-2026-10-28/post-acceptance-social-ui-finding.json) weist nach, dass `hasSocialUi` die Formate 5 bis 16 ausdrücklich aufzählt, Format 17 jedoch nicht. Im echten nativen Format-17-Kontext bleibt die Sozialoberfläche deshalb deaktiviert. Die erfassten IVG-, AHVG- und MVG-Auswahlen liefern über den tatsächlichen UI-Helfer keinen aufgelösten Sozialpfad. Die gleichen Vergleichsauswahlen funktionieren im unveränderten freigegebenen MVP-0.9-Kontext.

Dies ist **kein Nachweis fehlender Sozialrechtsdaten und kein neu beurteiltes Fachrecht**, sondern eine bestätigte UI-Integrationslücke. Die 44 Bundesregeln und 50 BE-Anbindungen sind im aktuellen Kandidaten vorhanden. Die reine Datenübernahme allein belegt ihre Bedienbarkeit im Gesamtprodukt aber nicht.

Der Befund wurde nach der menschlichen AP23M3-Erklärung entdeckt. Aus dieser Erklärung wird deshalb weder eine Annahme dieses Fehlers noch ein zusätzlicher Risikoentscheid abgeleitet. Die Diagnose ist rein lesend belegt. Eine Korrektur wurde nicht ausgeführt und wird durch dieses Abnahmeblatt nicht autorisiert. Vor einem Gesamtproduktrelease ist eine gesondert freizugebende, begrenzte Korrektur mit tatsächlichen Bestands-UI-Nachtests erforderlich.

Der technische Originalabschluss führt folgerichtig `releaseReadiness.ready: false`, `fixImplemented: false` und `humanAcceptanceOfFinding: false`. Die fachlich-technische Annahme der Kantonsintegration bleibt davon getrennt erhalten. Es gibt keine Gesamtprodukt- oder Betriebsfreigabe des unveränderten Kandidaten.

## Technischer Pflegevorbehalt

Der endgültige SPFx-Bau enthält 136 Lintwarnungen, davon 24 in den neuen V10-/Format-17-Modulen und 112 in früheren oder gemeinsam genutzten Teilen. Die 24 neuen Warnungen betreffen 17 unbenutzte Variablen, drei fehlende explizite Rückgabetypen und vier explizite `any`-Verwendungen. Compiler und Paketprüfungen sind bestanden.

Der Pflegebefund wird weder als Nullwarnungslauf ausgegeben noch durch die AP23M3-Abnahme zu einem zusätzlichen ausdrücklichen menschlichen Risikoentscheid umgedeutet. Er ist vom funktionalen Releaseblocker R10-H01 zu unterscheiden.

## Unveränderte Originalnachweise und separates Abnahmearchiv

Der [technische Originalabschluss](../../outputs/ap23m3-2026-10-28/local-completion.json) behält unverändert den Status `local-scoped-verification-passed-with-release-blocker` und seine ursprünglichen Freigabeflags. Insbesondere bleibt sein technisches Feld `professionalTechnicalAcceptance` auf `false`. Die menschliche Erklärung steht ausschliesslich separat in dieser Notiz und im Abnahmebeleg. Die SHA-256-Prüfsumme des technischen Originals lautet:

`6a86fb73400c1144cbed78035f648187843f313562d280e245fb41a3946a7a01`

Der [separate Abnahmebeleg](../../outputs/ap23m3-abnahme-2026-10-28/receipt.json) dokumentiert die menschliche Annahme und die ausdrückliche Trennung des nachträglichen Releaseblockers. Das autonome Archiv enthält genau **1’538 Originaldateien**, nämlich die 1’537 gebundenen Dateien und den technischen Originalabschluss. Die Payloads umfassen 144’115’028 Bytes. Der Beleg selbst kommt hinzu und umfasst 295’355 Bytes. Seine SHA-256-Prüfsumme lautet:

`5756ca9c9fb05130287abf53004b66e61ffc7af5ae596fd1fb3e683575a1c014`

Vor neuen Abnahmedateien und Änderungen an den lebenden Einstiegstexten wurde der ursprüngliche technische Finalizer erneut unverändert erfolgreich ausgeführt. Die gesonderte Bestandskontrolle und der Archivproduzent bestätigten zusätzlich alle 11’540 geschützten Bestandsdateien. Diese werden nicht erneut vollständig kopiert. Ältere Archive werden ebenfalls nicht rekursiv übernommen. Soweit frühere Archivbelege oder historische Dateien bereits Bestandteil der exakt gebundenen M3-Dateiliste sind, bleiben genau diese gebundenen Dateien enthalten.

Die gesonderten Abnahmedateien und der nachfolgende Releaseplan gehören nicht nachträglich zur Originalinventur. Deren ursprüngliche Bindungen werden nicht umgeschrieben oder rückdatiert. Spätere Änderungen an lebenden Texten verändern die gesicherten Originalkopien nicht.

Nach der Erzeugung prüft [der autonome Archivprüfer](../../scripts/archive-ap23m3-acceptance.mjs) ausschliesslich die archivierten Payloads und deren geschlossene Datei- und Verzeichnisliste. Aktuelle Quelldateien und der aktuelle Git-HEAD werden dafür nicht benötigt. Zusätzliche, fehlende oder veränderte Archivdateien werden zurückgewiesen. Ein unvollständiges Archiv wird nicht stillschweigend repariert, ersetzt oder neu erzeugt. Die [zugehörigen Positiv- und Negativtests](../../tests/governance/ap23m3-acceptance.test.mjs) prüfen insbesondere falsche Freigaben, veränderte Quellenbytes, fehlende Belege, Symlinks und die Grenzen des nachträglichen R10-H01-Befunds.

## Nächster Schritt und Freigabegrenzen

Der menschliche Auftrag erlaubt die Vorbereitung der nächsten Schritte für einen gebündelten Release. Damit kann der [Releaseplan](../planung/gebuendelter-release-nach-ap23m3.md) vorgelegt werden. Ein definitiver Releaseversionsentscheid, eine Quellenrelease-Abnahme oder eine Ausführungsfreigabe wird durch dieses Blatt nicht vorweggenommen.

Die Freigaben für R10-H01-Korrektur, zusammengeführte Quellenprüfung, kontrollierte Datenübernahme und definitive Releaseartefakte, Wiederherstellungskandidat, E-/Q-Installation, manuelle Q-Abnahme, Publikation und P-Betrieb bleiben getrennt. [DEC-2026-034](../entscheidungen/DEC-2026-034-gebuendelter-schweizausbau.md) bleibt massgebend. Das Ende der Kantonstranchen ist der Anlass zur gebündelten Releasevorbereitung, nicht die automatische Erteilung aller nachfolgenden Betriebsrechte.

Keine Commits, GitHub-Änderungen, Uploads, Installationen oder Änderungen an E/Q/P, Mirrors, AP5, AP21, Hosting, M365-Berechtigungen und Richtlinien sind erfolgt oder durch dieses Abnahmeblatt freigegeben. Der aktuelle Datenstand bleibt ein lokaler Kandidat mit ausstehender Quellenrelease-Freigabe. Kalenderexporte seiner Prüfvorschau bleiben gesperrt.

David nimmt die menschlichen Fach-, Abnahme- und Betriebsrollen in Personalunion wahr. Codex ist ein dokumentiertes KI-Arbeitsinstrument ohne formelle Freigabe- oder Haftungsverantwortung.

