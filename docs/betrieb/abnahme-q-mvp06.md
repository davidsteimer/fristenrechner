# MVP 0.6 Q-Abnahme und Wiederverwendung der Outlook-Nachweise

Datum: 1. Oktober 2026. Entscheider und manueller Prüfer: David Steimer.

**Die manuelle fachliche Q-Prüfung und Gastanmeldung sind als bestanden bestätigt. Die bisherigen Outlook-Importnachweise werden aufgrund unveränderter Exportsemantik ausdrücklich wiederverwendet. Damit ist der E-/Q-Abnahmeschritt R06-C abgeschlossen. GitHub-Veröffentlichung und P-Bereitstellung bleiben separat freizugeben.**

## Erklärung und gebundener Stand

David Steimer erklärte nach der Übergabe der bestandenen begrenzten Korrektur-Nachtests:

> Manueller Prüfung und Gastanmeldung sind bestanden.
> Die bisherigen Outlook-Importnachweise können begründet wiederverwendet werden.

Die Erklärung bezieht sich auf den unmittelbar zuvor übergebenen MVP-0.6-Stand:

| Gegenstand | Abgenommener Stand |
| --- | --- |
| Anwendung / SPFx-Paket | `0.6.0` / `0.6.0.1` |
| Paketgrösse | 228’122 Bytes |
| Paket SHA-256 | `60f84213507f99ec58463c84c514037d9c00bd63fdc8f02d85e52097bcf3c587` |
| Datenrelease | `2026-10-01-mvp-06-approved.1` |
| Manifest SHA-256 | `637cfc03c777f350031ba6c28676c685c16f25733391e1f25b0a3580016f5724` |
| Q-Ziele gemäss Übergabe | Bestehende Q-SharePoint-Seite und bestehende Q-Teams-Rechnerregisterkarte |
| Datenquelle | Jeweils vollständiger same-site SharePoint-Mirror |
| Technische Grundlage | [Ursprünglicher E-/Q-Prüfbericht](eq-installation-mvp06.md), ergänzt durch den [Korrekturvollzug und die bestandenen Nachtests zu 0.6.0.1](spfx-korrekturkandidat-mvp06-0601.md) |

Die fachliche Q-Abnahme und Gastanmeldung werden als Benutzerbestätigung geführt. David hat keine einzelnen Gastprüfschritte, Browser, Anmeldewege oder funktionsweisen Einzelergebnisse angegeben. Eine vollständige Wiederholung der technischen Matrix unter dem Gastkonto oder eine zusätzliche Liveprüfung durch Codex wird nicht behauptet. Es werden keine neuen Gastpersonen oder Berechtigungen geschaffen und der bestehende Q-Demokreis wird nicht erweitert.

## Begründete Wiederverwendung für R06-12

Der Releaseplan lässt für R06-12 ausdrücklich entweder eine erneute Outlook-Prüfung oder eine begründete Wiederverwendung gebundener Vorbelege zu. David hat die zweite Variante gewählt. Die technische Gegenprüfung trägt diesen Entscheid:

1. **Die ICS-Erzeugung ist bytegleich.** `calendarExport.ts` hat im tatsächlichen kopierten SPFx-Baustand von MVP 0.5, im eingefrorenen MVP-0.6-Baustand und im Korrekturbaustand 0.6.0.1 dieselben 4’934 Bytes und SHA-256 `aaec9be40831ef89b194477c1295ecb1019f6eb06e255d030404872a2ba59984`. Die verwendete Datumshilfe ist ebenfalls bytegleich. Eine auf den heutigen Quellordner zeigende Verknüpfung wurde ausdrücklich nicht als historischer Beleg verwendet.
2. **Die Übergabe an den Export ist unverändert.** Die Ergebniskachel übergibt weiterhin das berechnete Fristende, die Sprache und die optionale Referenz. Ihr extrahierter Funktionsblock `CalendarExportTile` ist bytegleich. Beide Ergebniswege verwenden unverändert `finalEnd` beziehungsweise `finalDeadline.date`. Auch die 18 Kalender-Übersetzungszeilen sind unverändert. Die neuen Sozialversicherungspfade ändern die fachliche Ermittlung des Fristendes, nicht den Outlook-Terminvertrag.
3. **Die neuen echten Dateiexporte sind nachgewiesen.** Im ursprünglichen MVP-0.6-Hostlauf wurden 28 Kalenderdateien tatsächlich aus den vier E-/Q-Instanzen gespeichert und semantisch geprüft, je sieben pro Host, insgesamt 24 deutsche und vier französische Dateien. Die archivierten Bytes und ihre Prüfsummen wurden für diesen Nachtrag erneut kontrolliert. Die begrenzte Korrektur 0.6.0.1 ändert nur die Dropdowndarstellung, nicht den Export. Es wird kein neuer Dateiexportlauf mit 0.6.0.1 behauptet.
4. **Der frühere Import ist konkret gebunden.** Der [Outlook-Abschlussnachweis MVP 0.5](outlook-pruefung-mvp05.md) dokumentiert den tatsächlichen Webimport einer Q-Teams-Datei, die gespeicherten Eigenschaften und die anschliessende Bereinigung. Die damalige ICS-Datei mit SHA-256 `de0dac98c87cac07637b745c369d48f85bd5bc6234fbef121dc6cd745298717c` wurde erneut zugeordnet und gehasht. Outlook Desktop bleibt Davids damaliger manueller Benutzernachweis, nicht ein von Codex erneut durchgeführter Test.
5. **Die gezielte lokale Exportprüfung besteht erneut.** Die sieben Tests in `tests/ui/calendar-export.test.ts` sind am 1. Oktober 2026 erneut bestanden. Sie prüfen unter anderem ganztägige Termine, exklusives Ende, deutsche und französische Texte, Sonderzeichen, Zeilenfaltung, den 112-Stunden-Trigger und den lokalen Download. Diese lokalen Tests ergänzen die Vorbelege, ersetzen aber keinen tatsächlichen Outlookimport.

| Wiederverwendete Eigenschaft | Unveränderter Vertrag |
| --- | --- |
| Termin | Ganztägig am berechneten Fristablauf |
| Ende | Exklusiv der folgende Kalendertag |
| Betreff | Sprachabhängig `Fristablauf` / `Échéance du délai`, bei Bedarf mit Referenz |
| Verfügbarkeit | Transparent / frei |
| Kategorie | `Fristablauf` |
| Erinnerung | Relativ `-PT112H`, entsprechend vier Tagen und 16 Stunden |
| Übertragung | Lokale ICS-Datei, keine Graph-Verbindung, keine Teilnehmenden oder Einladung |

Die Wiederverwendung ist eine releasebezogene fachlich-technische Beurteilung, keine Behauptung aktueller Outlook-Oberflächenidentität. Ein künftig geänderter Exportvertrag, Importweg oder konkreter Kompatibilitätsbefund verlangt eine neue Beurteilung. Die bekannte Sommerzeitgrenze bleibt akzeptiert. Eine tatsächlich ausgelieferte Erinnerung wurde nicht neu beobachtet. Die ICS-Kategorie erzwingt keine kontounabhängige dunkelgrüne Farbe. Die begrenzte Detailtiefe der Desktop-Benutzerbestätigung bleibt erhalten.

**R06-12 ist damit durch ausdrücklich beschlossene, technisch begründete Wiederverwendung abgeschlossen. Es wurde kein neuer Outlooktermin importiert, verändert oder gelöscht.**

## Belegbindung und Historie

| Nachweis | SHA-256 |
| --- | --- |
| Outlook-Abschlussbericht MVP 0.5 | `45208e2672e19a272cef28231c6cae7ab89639fe5926becc07a901250695144a` |
| Privater MVP-0.6-ICS-Prüfbericht vom 1. Oktober, 15:27:49 UTC | `6495ec3c456969e3d6bdfc94507247dce1f6f509ab6d39c2430c963353c79cf8` |
| Historisches technisches Hostregister MVP 0.6.0.0 | `0b17eee84f99e42201be6b5101e3784e24f9d3504a59e0272d4c5b2b3ae50fc7` |
| Ursprüngliche Prüfvorlage MVP 0.6 | `8e5db3b7fcc5e71e46767d1b37fc68d02d0c37946a238f9b2e99352af97f08ad` |

Das historische Hostregister bleibt unverändert bei 284 PASSED, 2 FAILED und 3 NOT_RUN. Die zwei Layoutfehler sind durch die gesonderten Korrektur-Nachtests behoben. Die anschliessende menschliche Abnahme und Gastbestätigung werden mit dieser Notiz dokumentiert, nicht rückwirkend in den ursprünglichen Browserlauf eingetragen. Ebenso bleiben die alten Outlook- und Buildnachweise unverändert. Private Rohbelege, Konto- und Ereigniskennungen werden nicht pauschal zur Veröffentlichung freigegeben.

## Nächster Schritt und Freigabegrenzen

Die E-/Q-Abnahmevoraussetzungen sind erfüllt. Als nächster Schritt folgen gemäss [Deploymentplan](deployment-mvp-06.md) die lokale Publikationsvorbereitung, die Behandlung von P06-01 zur öffentlichen Reproduzierbarkeit und das passende neue Webartefakt mit der UI-Korrektur. Diese Arbeiten und ihre Resultate werden nicht mit dieser Abnahmenotiz als bereits ausgeführt bezeichnet.

GitHub-Push, temporäre Deploy-Keys, öffentliche P-Umschaltung und Hostingänderungen bleiben gesondert freizugeben. Vor P sind die zielbezogenen Prüfungen und die erneute Beurteilung der dokumentierten Header-/Cacheabweichungen erforderlich. Die bisherige Risikoakzeptanz für MVP 0.5 wird nicht stillschweigend übertragen. Fachliche Sachbereichs-, Zuständigkeits-, Zeit- und Feiertagsgrenzen bleiben bestehen. Nationale Modellierung ist keine Freigabe weiterer Kantone.

David Steimer nimmt Abnahme und Fachverantwortung in Personalunion wahr. Codex dokumentiert und prüft als KI-Arbeitsinstrument ohne eigene formelle Freigabe- oder Haftungsverantwortung. Dieser Nachtrag löst keinen Build, Commit, Push, Schlüssel, erneutes Deployment oder Outlookzugriff aus.
