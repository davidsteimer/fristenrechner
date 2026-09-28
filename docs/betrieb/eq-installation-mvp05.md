# MVP 0.5 · E-/Q-Installation und technische Prüfung

Stand: 28. September 2026, nach technischer Prüfung und anschliessender menschlicher Bestätigung. **Paket `0.5.0.0` ist im gemeinsamen Katalog bereitgestellt und auf den vier bestehenden E-/Q-Sites aktualisiert. Alle vier aktuellen Rechner verwenden den neuen same-site Mirror. Die 123 technischen Prüfpunkte des konkretisierten Eigentümer-Prüfumfangs sind bestanden. David hat Q fachlich abgenommen und die reale Anmeldung mit dem bestehenden B2B-Gast als durchgeführt bestätigt. Outlook Web ist anschliessend tatsächlich geprüft, Outlook Desktop durch David manuell bestätigt.** Massgebend für die beiden manuellen Punkte ist die [Abnahmenotiz](abnahme-q-mvp05.md).

## 1. Konkrete Freigabe

David Steimer hat erklärt:

> Installiere Paket und Mirrors für E/Q und führe die Prüfmatrix bis zur Manuellen Prüfung aus.

Die Freigabe betrifft das unmittelbar zuvor vorgelegte, definitiv lokal geprüfte SPFx-Paket `0.5.0.0` und den zusammengehörigen Datenrelease `2026-09-28-mvp-05-approved.1`. Sie umfasst den kontrollierten Paketwechsel im bestehenden Tenant-App-Katalog, die Installation beziehungsweise Aktualisierung der vier bestehenden E-/Q-Instanzen, deren vollständige same-site Mirrors und die technische Prüfung bis zum Haltepunkt der manuellen Q-Abnahme.

Nicht umfasst sind GitHub-Push, neue Deploy-Keys, P-Bereitstellung, Hostingänderungen, neue Gastpersonen oder andere M365-Berechtigungsänderungen sowie Importe in echte Outlook-Kalender. Die nachfolgende manuelle Abnahme ist separat dokumentiert und folgt nicht automatisch aus der Installationsfreigabe. Der historische AP5-Datenstand bleibt unverändert.

Die ergänzende Freigabe vom 28. September 2026 benennt den Austausch derselben Katalogdatei von `0.4.0.1` auf `0.5.0.0` mit der unten gebundenen SHA-256-Prüfsumme. David akzeptiert ausdrücklich, dass der gemeinsame Codewechsel sämtliche bereits verbundenen Instanzen betreffen kann, einschliesslich der historischen AP5-Ansicht und allfälliger weiterer bestehender Installationen. Eine automatische Installation auf zusätzlichen Sites bleibt ausgeschlossen. Quellen- und Mirrorumstellungen bleiben auf die vier bezeichneten E-/Q-Instanzen beschränkt. Die frühere Sicherheitsblockade wird damit nicht rückwirkend umgedeutet, sondern die Fortsetzung stützt sich auf diese zusätzliche konkrete Freigabe.

## 2. Artefaktbindung

| Gegenstand | Version / SHA-256 |
| --- | --- |
| SPFx-Paket | `0.5.0.0`, `f46beaadbfd9e2a893b55853bb2d622cb6850e5d72b08b9443d367e0d6f6cf39` |
| Mirror-ZIP | `17baf1b097335c318b366b75ca53d5b64ca1ad713805d7370116a1d6db4cf9fa` |
| Datenrelease / Manifest | `2026-09-28-mvp-05-approved.1`, Format `5.0.0`, `3aa09c80c93ef56d472748c4a5496d439537272d96491497b2c678e3c7e20715` |
| Hauptbundle | `fristenrechner-web-part_9b3a89c26cf2e650e64d.js`, `7c1cfd32febb60c9ebe3737558a836a944d3dba5b5daf8af0f3e6c284f6ebb73` |
| Lokale Rückfallreferenz | Paket `0.4.0.1`, `9f31513cbc56f0ee2bb178e1db9336252d0266527643bebc2fb1348820711346` |

Die [definitiven Releaseartefakte](releaseartefakte-mvp-05.md) und ihr maschineller Nachweis bleiben unveränderte Baubelege. Der neue Auftrag wird hier zusätzlich dokumentiert, nicht rückwirkend in deren damalige Freigabestatus geschrieben. Die tatsächliche Tenant-Baseline und die Rückfallfähigkeit sind vor dem Eingriff frisch zu verifizieren.

Der GitHub-Datenpin ist noch nicht veröffentlicht. Deshalb müssen alle vier neuen Instanzen den ausdrücklich konfigurierten vollständigen same-site Mirror verwenden. Dieser enthält elf Laufzeitdateien. Manifestanzeige, alte Cacheinhalte oder eine konfigurierte Quellenbeschriftung allein gelten nicht als erfolgreicher neuer Erstabruf.

## 3. Aktueller Ausführungsstand und dokumentierter Verlauf

| Gegenstand | Status | Nachweis |
| --- | --- | --- |
| Frische Baseline und Rückfallprüfung | Im bezeichneten E/Q-Umfang abgeschlossen | Bestehendes Tenant-Paket `0.4.0.1` frisch heruntergeladen und bytegeprüft. Alle vier aktuellen Quellenkonfigurationen sichtbar gelesen. Alte Mirrors und relevante Ordner-ACLs frisch lesend verglichen. Keine vollständige tenantweite Verbraucherinventur |
| Tenant-App-Katalog `0.5.0.0` | Bereitgestellt und bytegeprüft | Aktiviert, gültig und bereitgestellt jeweils Ja. Zu allen Sites hinzugefügt Nein. Paket und tatsächlich gehostetes neues Bundle frisch roh heruntergeladen und byteidentisch zu den freigegebenen Artefakten |
| E-SharePoint, App und Mirror | App aktualisiert, Mirror 11/11 bytegeprüft und konfiguriert. Technischer Umfang bestanden | F01–F18, N01–N06, G01, X01 und U01–U05 bestanden, einschliesslich echter Erstladung ohne Aktivzeiger und Layout bei 390, 768 und 1440 Pixeln |
| E-Teams, App und Mirror | App aktualisiert, Mirror 11/11 bytegeprüft und konfiguriert. Technischer Umfang bestanden | F01–F18, N01–N06, G01, X01 und U01–U04 in der bestehenden direkten Registerkarte bestanden |
| Historische AP5-Kompatibilität mit neuem Code | Bestanden, Datenquelle unverändert | Kontrollberechnung auf Seite und Teams-Alias. Zusätzlich Erstladen der historischen SharePoint-Seite ohne Aktivzeiger mit acht erfolgreichen Pinabrufen und Rücklesen der gespeicherten Seiteneigenschaften. Kein separater cachefreier Teams-Alias-Test behauptet |
| Q-SharePoint, App und Mirror | App aktualisiert, Mirror 11/11 bytegeprüft und konfiguriert. Technischer Umfang bestanden | F01–F18, N01–N06, G01, X01 und U01–U04 bestanden |
| Q-Teams, App und Mirror | App aktualisiert, Mirror 11/11 bytegeprüft und konfiguriert. Technischer Umfang bestanden | F01–F18, N01–N06, G01, X01 und U01–U05 in der bestehenden direkten Registerkarte bestanden, einschliesslich Layout bei 390, 768 und 1440 Pixeln |
| Reale Kalenderdateien aus SharePoint/Teams | Auf allen vier Hosts gespeichert und unabhängig inhaltlich geprüft | Gültiges Datum, exklusives Enddatum, ganztägig, frei, Referenz, Kategorie und `-PT112H`. Kein Outlook-Import durchgeführt |
| Berechtigungsbaseline und tatsächliche Gastanmeldung | Mirror-/Assetordner-ACLs und direkte Q-Kanalmitgliedschaft unverändert. Reale Anmeldung durch David als durchgeführt bestätigt | Separater Benutzernachweis gemäss [Abnahmenotiz](abnahme-q-mvp05.md), kein zusätzlicher Codex-Livetest und keine behauptete vollständige Gast-Funktionsmatrix |
| Manuelle Q-Prüfung und Abnahme | Fachlich abgenommen | Erklärung von David Steimer am 28. September 2026, gebunden an Paket und Datenrelease der Übergabe |
| GitHub und P | Nicht freigegeben | Keine Änderung aus diesem Auftrag |

### Historischer Haltepunkt: Blockade und Beweisgrenzen vor manuellem Upload

Der erste Connector-Schreibaufruf zum Anlegen eines neuen, bisher nicht vorhandenen E-Mirror-Releaseordners scheiterte am 28. September 2026 um 12:32:42 UTC mit HTTP 403 `accessDenied`. Es wurden keine neuen Releaseordner erstellt und keine neuen Laufzeitdateien hochgeladen. Die anschliessende Lesekontrolle bestätigt die Abwesenheit der neuen Ordner auf allen vier Sites. Weitere Schreibversuche oder ein Umgehen des abgewiesenen Zugriffs über einen anderen automatisierten Weg unterblieben.

Die genaue Ursache des verweigerten Schreibzugriffs ist aus dieser Antwort nicht bestimmbar. Erfolgreiches Lesen und sichtbare Eigentümerrollen beweisen keine verfügbaren delegierten Connector-Schreibrechte. Es handelt sich um eine Installationsblockade, nicht um einen nachgewiesenen Produktfehler. Für die Fortsetzung ist ein zulässiger Schreibzugriff oder eine vom Benutzer selbst durchgeführte Mirrorablage erforderlich. Neue oder breitere M365-Berechtigungen sind damit nicht freigegeben.

Das bestehende Tenant-Paket wurde frisch als lokale Rückfallsicherung heruntergeladen. Seine 202’616 Bytes stimmen mit der oben genannten SHA-256-Referenz überein. Die 40 bisherigen MVP04-Mirrordateien wurden mit unveränderten aktuellen Metadaten einschliesslich QuickXorHash vor und nach dem abgewiesenen Schreibversuch bestätigt. Ihre bereits gesicherten lokalen Kopien sind erneut bytegleich zum freigegebenen MVP04-Datenstand. Das ist keine neue SHA-256-Rohdownloadprüfung aller alten Remote-Dateien.

Die aktuelle E-Testseite zeigt weiterhin den MVP04-Stand aus dem SharePoint-Mirror. Ein ausschliesslich zur Sichtung geöffneter eigener Seitenentwurf wurde ohne Feldänderung und ohne Publikation über «Änderungen verwerfen» geschlossen. Der normale Lesemodus wurde anschliessend bestätigt. Historische AP5-Konfiguration, Paket, Mirrors und persönliche Defaults wurden nicht umgestellt.

Private Betriebsbelege liegen unter `.work/deployments/2026-09-28-eq-mvp05/`. Die fachlichen und technischen Hosttests R05 sind vorbereitet, aber für MVP 0.5 noch nicht durchgeführt. Die manuelle Q-Prüfung ist somit noch nicht erreicht.

### Historischer Haltepunkt: Fortsetzung nach manuellem Upload, vor ergänzender Paketfreigabe

David bestätigte anschliessend «Mirrors hochgeladen». Die unabhängige Lesekontrolle bestätigt vier vollständige Releasebäume mit je elf JSON-Dateien und ohne zusätzliche Dateien oder offene Pagination. Alle 44 Dateien wurden tatsächlich neu heruntergeladen und sowohl per SHA-256 als auch per vollständigem Bytevergleich gegen den freigegebenen lokalen MVP05-Release geprüft. Ein Endinventar bestätigt unveränderte Metadaten während dieser Prüfung. Neue effektive Ordnerberechtigungen entsprechen dem jeweiligen Elternordner und dem bisherigen MVP04-Ordner. Es erfolgte kein erneuter automatisierter Mirror-Schreibversuch.

Zusätzlich stimmen die aktuelle ClientSideAssets-Paketordner-ACL und die direkte Q-Kanalmitgliedschaft mit der bisherigen Baseline überein. Die bestehenden vier Webpart-Eigenschaftsbereiche wurden frisch gelesen. Alle verwenden weiter ihre MVP04-Mirrors. Nicht aktive bisherige GitHub-Adresse, Sichtbarkeit und persönliche Defaults wurden nicht verändert.

Die abschliessende Uploadaktion zum Ersetzen der bestehenden Katalogdatei wurde vor Ausführung durch die automatische Sicherheitsprüfung abgewiesen. Grund ist die gemeinsame Paketidentität im Tenant-App-Katalog. Der Codewechsel wirkt auf sämtliche schon damit verbundenen Instanzen, einschliesslich der historischen AP5-Ansicht und allfälliger weiterer hier nicht inventarisierter Verbraucher. Die bisherige E/Q-Freigabe wurde für diese weitergehende gemeinsame Wirkung nicht als ausreichend ausdrücklich bewertet. Der Halt wurde nicht umgangen.

Es wurde kein neues Katalogpaket hochgeladen oder aktiviert. Der Uploaddialog wurde abgebrochen. Eigene unveränderte E-/Q-Sichtungsentwürfe wurden verworfen, ohne eine Quellenumstellung zu publizieren. Vor einer Fortsetzung ist diese gemeinsame Codewirkung ausdrücklich zu bestätigen. Daraus folgt keine automatische Installation auf allen Sites und keine Freigabe zu weiteren Konfigurations-, Rechte-, Daten- oder P-Änderungen.

Evidenz dieses damaligen Haltepunkts: `mirrors/readback-manual-upload/status.md`, `raw-verification.json`, `acl-comparison.json`, `inventory-after.json`, `preflight-access-verification.json` und `resume-baseline.md` innerhalb der privaten Betriebsablage. Das Host-Prüfregister war zu diesem Zeitpunkt vollständig `not_run`.

### Ausführung nach ergänzender Freigabe der gemeinsamen Codewirkung

Nach der ausdrücklichen Bestätigung wurde dieselbe bestehende Katalogdatei durch das gebundene Paket `0.5.0.0` ersetzt und bereitgestellt. Keine Option zur automatischen Installation auf zusätzlichen Sites wurde aktiviert. Ein frischer Rohdownload bestätigt die freigegebene Paketprüfsumme. Das tatsächlich in ClientSideAssets gehostete neue Hauptbundle wurde ebenfalls roh heruntergeladen und bytegeprüft. Die bestehenden vier Site-Apps wurden jeweils über das angezeigte Aktualisierungsangebot aktualisiert. Anschliessend zeigten ihre Detailansichten `0.5.0.0` als bereits installierte Version ohne erneutes Aktualisierungsangebot.

Nur die vier freigegebenen Mirrorpfade wurden auf den neuen Releaseordner geändert. Provider, inaktive GitHub-Eigenschaft und Sichtbarkeit blieben unverändert. SharePoint-Seiten wurden publiziert, direkte Teamsregisterkarten nach gespeicherter Umstellung neu geladen. Alle vier zeigen `2026-09-28-mvp-05-approved.1` aus SharePoint-Mirror. Metadaten aller 44 Mirrordateien, die geprüften Mirror- und Assetordner-ACLs und die bestehende Q-Kanalmitgliedschaft sind nach dem Paketwechsel unverändert.

Die fachlichen Hoststichproben F01–F18 und alle Varianten der Sperrgruppen N01–N06 wurden auf jedem der vier Hosts separat durchgeführt. Die Ergebnisse stimmen mit dem privaten Ausführungsplan überein. Die geöffneten UVG-/ELG-Rechenspuren bestätigen zusätzlich 15 beziehungsweise 16 übersprungene Stillstandstage. Die politische Ersatzkandidatur zeigt weiterhin 12.00 Uhr und beide Prüfhinsweise ohne Kalenderexport. U01/U02 bestätigen französische Bedienung, kompatiblen Datumserhalt beim Rechtswechsel und die mögliche frühe Datumseingabe bei weiterhin gesperrter unvollständiger Berechnung.

**Dokumentierte Sprachgrenze:** Quellenfundstellen in der geöffneten französischen Rechenspur bleiben entsprechend dem bereits abgenommenen AP19C1-Vertrag teilweise deutsch. Das sind dokumentierte Fundstellenbeschreibungen, nicht durchwegs wörtliche amtliche Artikeltitel. Die Beobachtung ist keine neue Abweichung vom freigegebenen Kandidatenstand.

Die reguläre Eingabe und das Löschen nativer Datumsfelder wurden über ihre Datumssegmente verifiziert. Direktes Befüllen dieser Felder durch den Browser-Prüfhelfer war nicht zuverlässig. Dadurch zunächst ungeeignete negative Testeingaben wurden korrigiert und isoliert erneut geprüft. Ein solcher Prüfhelferbefund wird nicht als Produktfehler ausgegeben.

### Abschluss der technischen Restprüfungen

Nach der Meldung «Edge bereit» wurden die verbleibenden Prüfungen über die normale Browseroberfläche und die sichtbaren Entwicklertools ausgeführt. Die folgenden Ergebnisse gelten für die tatsächlich installierten Zielkopien, nicht nur für eine lokale Vorschau.

- **G01 auf allen vier aktuellen Hosts:** Ausschliesslich der reproduzierbare Produkt-Aktivzeiger `active` in IndexedDB wurde entfernt. `Total entries: 0` wurde vor dem Neuladen festgestellt. Danach wurden je elf erfolgreiche HTTP-200-Abrufe aus dem jeweiligen neuen same-site Mirror, die neue Release-ID, das neue Hauptbundle und das Ausbleiben der Rückfallwarnung nachgewiesen. Bei Teams wurde jeweils die konkrete Rechnerregisterkarte neu geladen. Die anderen gespeicherten Releaseobjekte und fremde Browserdaten blieben unberührt.
- **X01 auf allen vier Hosts:** Der beobachtete Abruf des Feiertagskatalogs wurde ausschliesslich für den Browsertest blockiert. Das Produkt behielt den letzten vollständig validierten Datenstand und zeigte die vorgesehene Rückfallwarnung. Anschliessend wurde die einzelne Testblockierung entfernt und der erfolgreiche vollständige Neuabruf ohne Rückfallwarnung erneut bestätigt. Keine Mirrordatei wurde verändert. Manipulations- und Vertragsvarianten bleiben zusätzlich durch die ausdrücklich lokalen Tests gedeckt, nicht durch erfundene Live-Dateimanipulationen.
- **U03 auf allen vier Hosts:** Die vorab festgestellten persönlichen Produktdefaults waren jeweils nicht vorhanden. Erlaubte Präferenzen einschliesslich einer bewusst unvollständigen Auswahl wurden gespeichert und nach echtem Neuladen wiedergefunden. Falldatum, Falltatsachen, Resultat und Kalenderreferenz wurden nicht wiederhergestellt. Danach wurden die Testdefaults über die Produktoberfläche zurückgesetzt. Die gezielte Lesekontrolle des Produktschlüssels bestätigte wieder null Einträge. Andere persönliche Einstellungen blieben unverändert.
- **U04 auf allen vier Hosts:** Vier tatsächliche ICS-Dateien für den StPO-Kontrollfall mit Ablauf 28.09.2026 wurden gespeichert und unabhängig byte- und inhaltsgeprüft. Sie enthalten `DTSTART;VALUE=DATE:20260928`, das exklusive Enddatum 29.09.2026, `Fristablauf (QA-MVP05-EQ)`, ganztägig, frei, Kategorie `Fristablauf` und `TRIGGER:-PT112H`. UTF-8, CRLF und Zeilenfaltung sind gültig. Nach Änderung des Berechnungsdatums sowie nach Resultatrücksetzung war kein veralteter Export mehr verfügbar. Die Dateien wurden nicht geöffnet oder in Outlook importiert.
- **U05 auf E-SharePoint und Q-Teams:** Die Breiten 390, 768 und 1440 Pixel wurden in den sichtbaren Entwicklertools eingestellt, im tatsächlichen DOM nachgemessen und durch native Bildschirmansicht geprüft. Die Inhalte bleiben ohne horizontales Überlaufen bedienbar. SharePoint und die Teams-Inhaltsfläche reagieren auf ihre jeweils verfügbare Breite. Die linke Teamsnavigation wird bei schmalem Gesamtfenster ausgeblendet. Automatische Screenshot-/Viewportversuche mit abweichender tatsächlicher Breite wurden verworfen und nicht gezählt. Die Gerätesimulation ist nach Abschluss wieder ausgeschaltet.
- **Historischer AP5-Gesamtpunkt:** Die historische SharePoint-Seite lud nach belegbar entferntem Aktivzeiger Manifest, fünf Profile und zwei Kalender mit acht HTTP-200-Antworten aus dem unveränderten GitHub-Pin. Der gespeicherte Seiteninhalt bestätigt `providerKind: github`, den Commit `33b4c2891acf5966974cc94b616aa3972c067767`, Release `2026-08-29-ap5-approved.1` und einen leeren Mirrorpfad. Paket-Standardwerte wurden ausdrücklich nicht mit diesen Seiteneigenschaften verwechselt. Das neue Bundle ist geladen, der StPO-Kontrollfall ergibt weiterhin 28.09.2026. Die vorher separat beobachtete Berechnung im historischen Teams-Alias bleibt Teil des Kompatibilitätsnachweises. Es gab keine Seitenbearbeitung oder Quellenumstellung der historischen Ansicht.

**Abschlusszählung: 123 von 123 technischen Prüfpunkten bestanden, null fehlgeschlagen und null offen innerhalb dieses Ausführungsumfangs.** E-SharePoint und Q-Teams umfassen je 31 Punkte, E-Teams und Q-SharePoint je 30 sowie der zusätzliche historische AP5-Gesamtpunkt. Die 123 Punkte sind keine Vollzählung aller übergeordneten Freigabeschritte. Insbesondere bleiben tatsächlicher Gastlogin, Outlook-Importtests, manuelle Q-Abnahme, GitHub-Publikation und P-Freigabe getrennt.

Die privaten Einzelbelege, die vier geprüften Kalenderdateien und das vollständige Host-Prüfregister liegen weiterhin in der privaten Betriebsablage. Produktdefaults und temporäre Browser-Testeinstellungen sind zurückgestellt. Auf die technische Übergabe folgte die separat dokumentierte menschliche Q-Abnahme und Bestätigung der Gastanmeldung.

## 4. Prüfrahmen und Abschluss

Massgebend sind [R05-01 bis R05-15](deployment-mvp-05.md#5-prüfmatrix-für-den-folgerelease) und die bisherigen T01–T19, jeweils mit eigenem Nachweis für E-SharePoint, E-Teams, Q-SharePoint und Q-Teams. Der private Ausführungsplan konkretisiert Eingaben und Sollwerte, ohne Tenantadressen, Benutzerkonten oder private Betriebsbelege in diesen öffentlichen Bericht zu übernehmen.

Die vollständigen lokalen Resolver-, Vertrags- und Manipulationsprüfungen bleiben als lokale Nachweise kenntlich. Die Zielumgebungsprüfung ergänzt sie mit tatsächlicher Aktivierung, byteweiser Mirrorprüfung, cachefreiem Erstabruf je Host, Fach- und Sperrstichproben, DE/FR, Defaults, Layout und realen ICS-Dateien. Lokal bestandene Tests werden nicht als ausgeführte Tenanttests gezählt.

Kontrollierte Browser-Negativtests dürfen keine freigegebenen Mirrordateien verändern. Falls sie nicht sicher ausführbar sind, bleibt der betreffende Live-Nachweis offen. Ein Eigentümerzugang ersetzt keinen Gasttest. Ein technisch nicht zulässiger Gastanmeldeweg wird weder umgangen noch als Appfehler oder Pass gewertet. Outlook-Importtests T15/T16 benötigen eine neue konkrete Kalenderfreigabe oder einen ausdrücklich dokumentierten Verzicht.

### Manuelle Q-Übergabe und anschliessende Bestätigung

Die übergebene manuelle Prüfung betraf die bestehende Q-SharePoint-Seite und die konkrete Rechnerregisterkarte in Q-Teams mit Paket `0.5.0.0` und Datenrelease `2026-09-28-mvp-05-approved.1` aus SharePoint-Mirror. Die folgenden Punkte waren Prüfvorschläge, keine aus der kurzen Nutzerbestätigung abgeleiteten Einzelnachweise:

1. Typische eigene, nicht sensitive Testfälle durchspielen, insbesondere die neu freigegebenen ELG-, AVIG-ALE- und KVG-OKP-Pfade. Eingaben, Resultat und Rechenspur müssen zusammenpassen.
2. Verständlichkeit, reduzierte dynamische Felder, frühe Datumseingabe und DE-/FR-Bedienung beurteilen. Unvollständige oder nicht unterstützte Fälle dürfen kein Enddatum erzeugen.
3. Persönliche Standards und Kalenderdownload nach Bedarf prüfen. Der Kalenderdownload ist kein Auftrag zum Import in einen echten Kalender.
4. Die konkrete App-/Datenkombination ausdrücklich fachlich abnehmen oder Abweichungen melden.

David bestätigte anschliessend die fachliche Q-Abnahme und die Durchführung der realen Anmeldung mit dem bestehenden B2B-Gast. Die [Abnahmenotiz](abnahme-q-mvp05.md) bindet seine Erklärung an den übergebenen Stand und hält die Nachweisgrenzen fest. Nach dieser Q-Bestätigung hat David die Desktop-Prüfung bestätigt und den Webtest freigegeben. Der tatsächliche Webimport samt Bereinigung ist [separat abgeschlossen](outlook-pruefung-mvp05.md). Keine automatische Publikation oder Betriebsfreigabe aus einem grünen technischen Ergebnis oder aus der manuellen Q-Abnahme.
