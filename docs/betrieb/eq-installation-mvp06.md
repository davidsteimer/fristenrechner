# MVP 0.6 · E-/Q-Installation und technische Prüfung

Stand: 1. Oktober 2026, nach kontrollierter Korrekturinstallation, begrenzter Live-Nachprüfung und Davids anschliessender Q-Abnahme. **Das exakt freigegebene Paket 0.6.0.1 ist im gemeinsamen App-Katalog bereitgestellt und auf allen vier bestehenden E-/Q-Sites aktualisiert. Der Paket- und Bundle-Rohreadback ist byteidentisch, die relevanten Katalogberechtigungen sind unverändert. Die gesonderten Nachtests auf den vier aktuellen Hosts und der historischen AP5-Teamsansicht sind bestanden. MVP06-UI-01 ist behoben. Datenrelease und Mirrors bleiben unverändert. David hat manuelle Prüfung und Gastanmeldung als bestanden bestätigt. R06-12 ist durch ausdrücklich beschlossene, begründete Wiederverwendung der bisherigen Outlook-Importnachweise abgeschlossen. E/Q ist abgenommen, die Publikation bleibt separat.**

David hat die begrenzte Korrektur, den konkreten Paketwechsel und die vier bestehenden Site-Appupdates ausdrücklich beauftragt. Nach der zwischenzeitlichen Zugriffsblockade wurde der gezielte App-Verwaltungszugriff präzisiert und der Vollzug abgeschlossen. Der [Korrekturbericht zu 0.6.0.1](spfx-korrekturkandidat-mvp06-0601.md) bindet die neue Datei und die ergänzenden Prüfungen. Der ursprüngliche Hostnachweis für `0.6.0.0` bleibt unten historisch erhalten: **284 PASSED, 2 FAILED, 3 NOT_RUN**. Die zwei damaligen Fehlerzuordnungen werden nicht rückwirkend umgeschrieben. Es wurde keine neue vollständige 289-Einträge-Matrix ausgeführt.

## Aktueller Korrekturabschluss 0.6.0.1

Das bereitgestellte Paket hat 228’122 Bytes und SHA-256 `60f84213507f99ec58463c84c514037d9c00bd63fdc8f02d85e52097bcf3c587`. Sein tatsächlich ausgeliefertes Hauptbundle `fristenrechner-web-part_3e2badf5b19c911b0ff4.js` hat 861’186 Bytes und SHA-256 `d9411005c17188d344a0f5028bea0bb503d8944ae8070b13747ceef67459ffdc`. Beide Rohdownloads stimmen byteweise mit dem freigegebenen Paket beziehungsweise dessen Inhalt überein. Paket- und Assetordnerberechtigungen wurden eng begrenzt erneut gelesen und sind gegenüber den heutigen Vorbelegen unverändert. Der bisherige Stand `0.6.0.0` bleibt als Rückfallpaket erhalten.

Alle vier bestehenden Site-Apps wurden über «Abrufen» aktualisiert. Die anschliessend frisch geöffneten Appdetails zeigen jeweils 0.6.0.1 als bereits auf der Website vorhanden, ohne weiteres Updateangebot. Dies ist ein UI-Vollzugsnachweis, keine ausgelesene interne AppInstance-API-Version. Das neue Hauptbundle ist zusätzlich in den tatsächlichen Rechneransichten beobachtet.

Die begrenzten Live-Nachtests bestätigen die vollständigen Auswahltexte im gewählten Feld und in der offenen Liste: E-/Q-SharePoint in Deutsch und Französisch bei 848 und 1280 Pixeln, beide Teamsansichten schmal in Deutsch und Französisch sowie breit in Französisch. Tastaturwechsel und Schliessen der Listen auf SharePoint sowie die ÜLG-Berechnungsstichprobe 16.09.2026 plus 30 Tage zu 16.10.2026 sind bestanden. Die historische AP5-Teamsregisterkarte behält ihren Datenrelease `2026-08-29-ap5-approved.1` und den öffentlichen GitHub-Provider. Mit dem neuen Bundle ergibt StPO, 16.09.2026 plus zehn Tage, weiterhin den 28.09.2026. Kein erneuter AP5-Kaltstart oder neuer Lauf sämtlicher Fach-, Storage- und Kalenderprüfungen wird hieraus abgeleitet.

Die Korrektur ändert keine Daten, Mirrors oder Berechtigungen. Temporäre Viewportüberschreibungen sind zurückgenommen, alle Rechner wieder auf Deutsch und E-Teams wieder in der aktuellen Registerkarte. Es wurden im Nachtest keine Standards gespeichert oder Kalenderdateien erzeugt. David hat anschliessend erklärt, dass manuelle Prüfung und Gastanmeldung bestanden sind und die bisherigen Outlook-Importnachweise begründet wiederverwendet werden können. Die [gesonderte Q-Abnahme](abnahme-q-mvp06.md) bindet diese Benutzerbestätigung und die begründete Wiederverwendung nach R06-12 an Paket und Datenrelease. Weder eine neue Gast-Liveprüfung durch Codex noch ein neuer Outlook-Import wird behauptet. GitHub und P sind unverändert.

## Historischer Installations- und Prüfstand 0.6.0.0

Die Abschnitte 1 bis 3 dokumentieren den ursprünglichen Vollzug und dessen damalige Ergebnisse. Der aktuelle Korrekturabschluss oben und Abschnitt 4 ergänzen diese Historie, ersetzen aber weder ihre gebundenen Artefakte noch das unveränderte Schlussregister.

## 1. Auftrag und Grenzen

David Steimer hat nach der Quellenabnahme und dem abgeschlossenen lokalen Artefaktbau erklärt:

> Bitte starte den E-/Q-Schirtt.

Der Auftrag startet R06-C des [Release- und Deploymentplans](deployment-mvp-06.md) für die vier bestehenden Zielinstanzen. David hat anschliessend «Mirrors hochgeladen» gemeldet. Diese Uploadbestätigung wurde durch eine vollständige Rohbyteprüfung nachvollzogen. Danach hat er den Austausch im gemeinsamen Tenant-App-Katalog von `0.5.0.0` auf `0.6.0.0` mit SHA-256 `85dd933ba08c9810e9f0cf4954b9cbc0d12ef4b8ad972f525d9a929023bbc681` ausdrücklich bestätigt. Die Bestätigung im Gespräch genügt, die nicht mehr sichtbare separate Anfrage muss nicht erneut beantwortet werden.

Die Bestätigung folgt unmittelbar auf die konkret erläuterte Reichweite: Der gemeinsame Codewechsel kann sämtliche bereits verbundenen Instanzen einschliesslich der historischen AP5-Ansicht betreffen. Nur die vier bestehenden E-/Q-Instanzen erhalten neue Mirror-Einstellungen. Anschliessend ist die technische Prüfmatrix bis zur manuellen Q-Abnahme beauftragt. Diese Freigabe ist kein Nachweis eines bereits ausgeführten Paketwechsels.

Die Konfigurationsumstellung bleibt auf E-SharePoint, E-Teams, Q-SharePoint und Q-Teams beschränkt. Die historische AP5-Ansicht behält ihren bisherigen Datenpin. Kein Hinzufügen zu weiteren Sites, keine neuen Gäste oder Berechtigungsänderungen, kein GitHub-Push, keine P-Bereitstellung und keine Outlook-Importe. Eigentümerprüfung, tatsächliche Gastanmeldung und manuelle fachliche Q-Abnahme bleiben getrennte Nachweise.

## 2. Artefaktbindung und Rückfall

| Gegenstand | Gebundener Wert |
| --- | --- |
| Zielpaket | `fristenrechner-schweiz-0.6.0.0.sppkg`, 227’954 Bytes |
| Paket SHA-256 | `85dd933ba08c9810e9f0cf4954b9cbc0d12ef4b8ad972f525d9a929023bbc681` |
| Mirrortransport SHA-256 | `1ebe748393d80206ea38d020e4e1a58ce432458a3b273e5972cfcbc8627153f3` |
| Neuer Datenrelease | `2026-10-01-mvp-06-approved.1`, elf Laufzeitdateien |
| Manifest SHA-256 | `637cfc03c777f350031ba6c28676c685c16f25733391e1f25b0a3580016f5724` |
| Frisch heruntergeladenes bisheriges Tenant-Paket | `0.5.0.0`, 222’393 Bytes |
| Rückfallpaket SHA-256 | `f46beaadbfd9e2a893b55853bb2d622cb6850e5d72b08b9443d367e0d6f6cf39` |
| Bisheriger dokumentierter Datenrelease | `2026-09-28-mvp-05-approved.1` |

Die [definitiven lokalen Baubelege](releaseartefakte-mvp-06.md) bleiben unverändert. Die drei Releaseartefakte und das lokale MVP-0.5-Rückfallpaket wurden für diesen Schritt erneut gehasht. Die elf Dateien im Mirrortransport stimmen byteweise mit dem freigegebenen Datenbaum überein. Das neue Paket enthält keine zusätzlichen API-Berechtigungsanforderungen. Seine tatsächliche AppManifest-Datei unterscheidet sich gegenüber MVP 0.5 nur in der Paketversionsangabe.

Der gesicherte Live-Ausgangsstand im gemeinsamen App-Katalog war Version `0.5.0.0`, gültig, aktiviert und bereitgestellt. «Zu allen Sites hinzugefügt» war und bleibt Nein. Der zugehörige Rohdownload stimmt mit dem definitiven lokalen MVP-0.5-Paket überein. Beide Rückfallkopien und das neue Paket wurden nach der Bestätigung erneut lokal gehasht. Die aktiven Provider, Mirrorpfade, inaktiven GitHub-Pins und Sichtbarkeitsoptionen aller vier aktuellen Instanzen wurden vor ihrer jeweiligen Konfigurationsänderung frisch gelesen. Eine vollständige Inventur sämtlicher weiterer Tenant-Verbraucher wird damit nicht behauptet.

Die vorhandene Katalogdatei `fristenrechner-schweiz.sppkg` wurde mit einer byteidentischen Kopie des definitiven Pakets ersetzt. Es wurde keine zusätzliche versionsbenannte Katalogdatei angelegt. Nach der Bereitstellung bestätigt ein erneuter Rohdownload die Paketprüfsumme. Das tatsächlich bereitgestellte Hauptbundle `fristenrechner-web-part_bce511034a33ebda00bc.js` hat 860’537 Bytes und SHA-256 `6dd7239f228a40a39da0330fb33e368922d1e0407b101f9b784e042e00e7efda`. Es stimmt byteweise mit dem Bundle im freigegebenen Paket überein.

## 3. Historischer Vollzugsstand 0.6.0.0

| Gegenstand | Tatsächlicher Nachweis | Noch offen |
| --- | --- | --- |
| Vier neue Mirrors | 44/44 Rohdateien byteidentisch, je elf Dateien. Alle vier aktuellen Rechner auf ihren jeweiligen neuen Releaseordner umgestellt. Provider, inaktive Pins und Sichtbarkeitsoptionen unverändert. Auf jedem Host elf erfolgreiche tatsächliche Erstabrufe nach gezieltem Entfernen des Produkt-Aktivcachezeigers. Fehlerbehandlung bei gezielt blockiertem eigenem Manifest und Wiederherstellung nach Aufhebung der Testblockierung jeweils beobachtet | Keine offene technische Abrufprüfung. Lokale Hash-/Teilreleasefehler sind ausdrücklich getrennte, wiederverwendete Testbelege |
| Relevante Berechtigungen | Mirrorberechtigungen beim vollständigen Rücklesen geprüft. Paket- und Assetordnerberechtigungen nach Bereitstellung erneut unverändert bestätigt | Keine Rechte geändert. Ein tatsächlicher Gastnachweis bleibt separat |
| E-SharePoint und Q-SharePoint | Bestehende Site-Apps auf 0.6.0.0 aktualisiert. Jeweils nur Mirrorpfad im bestehenden Rechner geändert und Seite publiziert. MVP-0.6-Stand und SharePoint-Mirror sichtbar. F01–F08, negative Fachprüfungen, Abdeckungsgrenze, fünf französische Berechnungen und weitere Querschnittsprüfungen bestanden | Derselbe begrenzte Layoutbefund MVP06-UI-01 auf beiden Hosts. Manuelle Q-Abnahme separat |
| E-Teams und Q-Teams | Bestehende Site-Apps auf 0.6.0.0 aktualisiert. Mirrorpfad über die bestehenden Registerkarteneinstellungen geändert und danach neu geladen. Beide tatsächlichen Teamsregisterkarten zeigen den neuen Mirrorstand. Fach-, Sprach-, Speicher-, Erstabruf-, Fehler-/Recovery- und schmale Layoutprüfungen bestanden. Je sieben Kalenderdateien tatsächlich gespeichert und geprüft | Tatsächlicher Q-Gastnachweis und manuelle Q-Abnahme |
| Historische AP5-Ansicht | Tatsächliche historische Teamsregisterkarte und separat geöffnete SharePoint-Seite zeigen weiterhin `2026-08-29-ap5-approved.1` und öffentlichen GitHub-Provider. Neues Bundle jeweils im Seiten-DOM. StPO, 16.09.2026 plus zehn Tage: auf beiden Oberflächen Beginn 17.09., nominell 26.09., definitiv 28.09.2026. Beide Oberflächen separat mit acht erfolgreichen historischen Datenabrufen nach Cachebereinigung geprüft | Keine offene historische technische Prüfung. Keine Konfiguration oder Publikation der historischen Seite geändert |
| Kalenderexporte Q06 | 28/28 echte Browserdateien, je fünf deutsche Einsprachefälle, ein französischer ÜLG-Fall und ein angeordneter MVG-Tagesfall pro Host. Originaldateien, byteidentische Archivkopien und einzelne Browserbelege gebunden. Semantische Prüfungen ohne Abweichung | Keine Outlook-Import- oder Darstellungsprüfung mit diesem Nachweis verbunden |
| Persönliche Standards Q05 | Auf allen vier Hosts ursprünglicher eigener Schlüssel nicht vorhanden. Synthetische EOG-Beschwerdepräferenzen gespeichert, tatsächlichen Storagewert kontrolliert, neu geladen und zurückgesetzt. Zustellungs- und Zuständigkeitsdatum, konkrete Kassenangaben, Referenz und Ergebnis nicht gespeichert. Frisch gelesener Schlüsselbestand danach jeweils wieder leer | E-SP: leerer Zuständigkeitsdatumswert nach erneuter Kassenauswahl nicht nochmals separat im UI beobachtet. Sein Ausschluss aus dem tatsächlichen Speicherrohwert ist belegt, kein zusätzlicher UI-Nachweis behauptet |
| Neues Paket und Site-Apps | Katalogversion 0.6.0.0 gültig, aktiviert und bereitgestellt. Erneuter Paket-/Bundle-Rohdownload byteidentisch. Auf allen vier erneut geöffneten Appdetailseiten 0.6.0.0 bereits installiert, keine weitere Updateaufforderung | Kein technischer Gesamtpass wegen des dokumentierten Layoutbefunds |

Der anfängliche reine E-Sichtungsentwurf wurde ohne Feldänderung verworfen. Erst im anschliessend freigegebenen Vollzug wurden die zwei aktuellen SharePoint-Seiten mit genau der beschriebenen Mirrorpfadänderung publiziert. Die historischen AP5-Seiteneinstellungen blieben unangetastet. Persönliche Standards wurden für die vier separat belegten Speichertests vorübergehend mit synthetischen Angaben verändert und jeweils auf den zuvor gelesenen leeren Ausgangsstand zurückgesetzt.

Zusätzlich sind auf allen vier Hosts elf Bestandsstichproben aus StPO, ZPO, allgemeinem VRPG, politischen Rechten, Beschaffung sowie IVG, AHVG, UVG, ELG, AVIG und KVG bestanden. Die Formularteile der Querschnittsprüfung sind ebenfalls dokumentiert: frühe Datumseingabe, Datumserhalt und Bereinigung beim Auswahlwechsel sowie Resultatreset. Speicher-, Download- und Erstabrufnachweise sind hostweise getrennt geführt. Gemeinsame vorgelagerte Auswahlprüfungen und wiederverwendete lokale Negativtests werden ausdrücklich als solche ausgewiesen, nicht als zusätzliche unabhängige Browserläufe gezählt.

### Historischer Layoutbefund MVP06-UI-01

Die Kurzkennung bezeichnet im privaten Prüfregister denselben Befund wie `MVP06-Q04-SP-FR-PARTY-ELLIPSIS-848`.

Bei einer tatsächlich auf 848 Pixel Breite verkleinerten Edge-Ansicht bleiben E-SP und Q-SP zweispaltig. Im französischen Feld «Domicile / siège de la partie et de sa représentation» werden lange Auswahltexte sowohl im gewählten Wert als auch in der geöffneten Liste mit «…» verkürzt. Insbesondere «Partie dans le canton de Berne, sans représentation» ist nicht vollständig lesbar. Auf Q-SP bestätigt die DOM-Messung den Überlauf des Texts bei fehlendem ergänzendem Titel. Die Beobachtung auf E-SP ist visuell belegt. Exakte Q-SP-Messwerte werden nicht auf E-SP übertragen.

Die Berechnung des tatsächlich geprüften französischen ÜLG-Falls bleibt korrekt bei 16.10.2026. Feldbezeichnungen, Schaltflächen und Ergebnis sind bedienbar und lesbar. In den separat geprüften schmalen E-/Q-Teamsansichten ist die Oberfläche einspaltig und der Auswahltext vollständig lesbar. Breite Desktopansichten aller vier Hosts sind unauffällig.

Die zwei SharePoint-Zuordnungen Q04-NARROW waren deshalb **nicht bestanden**. Sie betreffen denselben begrenzten Darstellungsbefund, nicht zwei unterschiedliche Rechenfehler. Zum Abschluss dieser ursprünglichen Hostprüfung lag weder eine Codekorrektur noch ein neuer Paketbau noch eine Annahme der Abweichung vor. Anschliessend wurde `0.6.0.1` separat beauftragt, an seine Prüfsumme gebunden freigegeben und installiert. Die oben gesondert ausgewiesenen Live-Nachtests bestätigen die Behebung. Die historischen Fehlerzuordnungen bleiben erhalten.

Die Kalenderdateien enthalten die erwarteten ganztägigen Termine am 16.10. beziehungsweise 28.09.2026 mit exklusivem Folgetag als Ende, den passenden deutschen oder französischen Betreff und die synthetische Referenz, frei / transparent, Kategorie `Fristablauf` und Erinnerung `-PT112H`. Es wurde ausschliesslich gespeichert, nichts in Outlook geöffnet oder importiert. Eine dunkelgrüne Darstellung wird damit nicht behauptet. Die ausgeführte technische Hostmatrix ist nicht mit sämtlichen Anforderungen des übergeordneten Releaseplans gleichzusetzen. Für R06-12 bleibt vor dem Publikationsabschluss die ausdrücklich begründete Wiederverwendung der gebundenen Outlook-Web-/Desktop-Vorbelege oder eine gesondert freigegebene Wiederholungsprüfung festzulegen. Die 28 Dateiprüfungen ersetzen diesen Importnachweis nicht.

### Historischer Abschluss des technischen Prüfregisters

| Bereich | Bestandene Zuordnungen | Nicht bestanden | Nicht ausgeführt |
| --- | ---: | ---: | ---: |
| E-SharePoint | 70 | 1 | 0 |
| E-Teams | 71 | 0 | 0 |
| Q-SharePoint | 70 | 1 | 0 |
| Q-Teams | 71 | 0 | 0 |
| Historische AP5-Ansichten | 2 | 0 | 0 |
| Tatsächliche Q-Gastanmeldung / manuelle Q-Abnahme | 0 | 0 | 3 |
| **Gesamt** | **284** | **2** | **3** |

Dies sind Zuordnungen im Prüfregister, nicht 289 unabhängige Live-Browserläufe. Acht Einträge binden ausdrücklich lokale Hash-/Teilrelease-Negativtests. Gemeinsame vorgelagerte Auswahlgates bleiben als wiederverwendete Beobachtungen gekennzeichnet. Sämtliche technischen Zuordnungen sind bewertet. Die drei nicht ausgeführten Einträge betreffen ausschliesslich den Gastnachweis auf Q-SharePoint und Q-Teams sowie Davids manuelle Q-Abnahme. Die ausdrücklich genannte E-SP-Nachweisgrenze zum erneut eingeblendeten Zuständigkeitsdatum bleibt erhalten.

Das private Schlussregister `host-test-ledger.json` ist mit SHA-256 `0b17eee84f99e42201be6b5101e3784e24f9d3504a59e0272d4c5b2b3ae50fc7` gebunden. Die ursprüngliche öffentliche Prüfvorlage und der private Prüfplan sind byteidentisch erhalten. Der Bericht ändert weder deren damaligen Status noch die separat gebundenen Artefakte.

### Mirror-Schreibweg

Der letzte tatsächliche Connector-Schreibversuch vom 28. September endete mit HTTP 403 `accessDenied`. Eine seitherige Änderung der delegierten Schreibrechte ist nicht belegt. Erfolgreiche heutige Lese- und Berechtigungsabfragen beweisen keinen verfügbaren Connector-Schreibzugriff. Deshalb wird dieser Schreibweg nicht erneut versucht oder über automatisierte Browser-Schreibaktionen umgangen.

Wie beim abgeschlossenen MVP-0.5-Vollzug erfolgte der Upload durch David mit seinem bestehenden SharePoint-Zugriff. Die vier neuen Releaseordner liegen neben den bisherigen Releases. Nach seiner Uploadmeldung hat Codex alle 44 Dateien frisch zurückgelesen und geprüft. Es erfolgte kein neuer Connector-Schreibversuch und keine automatisierte Umgehung des früher abgewiesenen Schreibzugriffs.

### Vollständiger Mirror-Rücklesebeleg

| Ziel | Tatsächliche Rohdateien | Bytevergleich / SHA-256 | Manifestreferenzen |
| --- | --- | --- | --- |
| E-SharePoint | 11 | 11/11 identisch | 10/10 konsistent |
| E-Teams | 11 | 11/11 identisch | 10/10 konsistent |
| Q-SharePoint | 11 | 11/11 identisch | 10/10 konsistent |
| Q-Teams | 11 | 11/11 identisch | 10/10 konsistent |

Pro Ziel sind 1’577’462 Bytes geprüft, insgesamt 6’309’848 Bytes. Alle vier Manifestdateien haben die oben gebundene SHA-256-Prüfsumme. Die unabhängig erneut eingelesenen lokalen Rücklesekopien bestätigen zusätzlich sämtliche Einzelprüfsummen und Manifestabhängigkeiten. Diese Gegenprüfung ist kein zweiter unabhängiger Remote-Download.

Die abschliessenden Ordnerinventare sind gegenüber der ersten Rückleseinventur unverändert. Die Metadaten der zuvor bereits vorhandenen Einträge in den vier Elternordnern sind ebenfalls unverändert. Dies ist keine neue Rohbyteprüfung sämtlicher älterer Releases.

Beim Berechtigungsvergleich waren bei Q-Teams ausschliesslich leere Herkunftsangaben unterschiedlich serialisiert (`inherited_from: null` am Elternordner gegenüber `{}` am neuen Ordner). Identitäten, Rollen und übrige Felder sind gleich. Die Rohabweichung bleibt dokumentiert. Für diesen begrenzten Vergleich wurden nur diese zwei leeren Darstellungen gleichbehandelt, nicht daraus eine technisch vollständig nachgewiesene Vererbung abgeleitet. Bestehende Berechtigungen wurden nicht verändert.

Während der Rücklesung begrenzte SharePoint die Abrufrate mit HTTP 429. Die vorgeschriebene Pause wurde eingehalten und die Rücklesung anschliessend mit reduziertem Tempo vollständig abgeschlossen. Es wurden keine Ersatzdaten oder bloss extrahierte Texte als Rohbytebeleg verwendet. Die private Abschlussprüfung `mirrors/readback-manual-upload/completion.json` bindet Einzeldatei-, Berechtigungs- und Schlussinventarbelege.

## 4. Nächster Haltepunkt

Paket, vier bestehende Site-Apps und vier aktuelle Mirrorquellen wurden ursprünglich kontrolliert auf `0.6.0.0` umgestellt. Der damalige technische Eigentümer-Prüfumfang wurde ausgeführt, aber wegen MVP06-UI-01 nicht vollständig bestanden. Die anschliessend ausdrücklich freigegebene Korrektur `0.6.0.1` ist nun auf allen vier bestehenden Sites installiert. Die begrenzten E-/Q-Live-Nachtests und der historische AP5-Kompatibilitätstest sind bestanden, der Layoutbefund ist behoben. Der [Korrekturbericht](spfx-korrekturkandidat-mvp06-0601.md) dokumentiert die eigenständigen Nachweise. David hat danach die manuelle Prüfung und Gastanmeldung als bestanden bestätigt. Die 28 tatsächlichen Kalenderdownloads bleiben dem ursprünglichen Hostlauf zugeordnet, nicht einem neuen Exportlauf mit 0.6.0.1.

Der zwischenzeitliche E-Teams-Navigationsunterbruch wurde innerhalb der bereits erlaubten Domain behoben. Erstabruf und Fehlerbehandlung wurden anschliessend in der tatsächlichen E-Registerkarte nachgewiesen. Keine weitere Rückkehrmeldung oder Domainfreigabe erforderlich. Sämtliche temporären Netzwerkblockierungen und Cacheüberschreibungen sind zurückgenommen. DevTools und temporäre Hilfstabs sind geschlossen, ursprüngliche Fensterdarstellung und deutsche Oberflächensprache wiederhergestellt. Die vorhandenen vier Rechneransichten bleiben für die manuelle Prüfung verfügbar. Es wurden keine persönlichen Teststandards zurückgelassen.

Mit der [Benutzerbestätigung und Q-Abnahme](abnahme-q-mvp06.md) ist der E-/Q-Schritt R06-C abgeschlossen. Die Gastanmeldung ist durch David bestätigt, nicht durch einen zusätzlichen Codex-Livelauf. Historisches Register und Rohprotokolle bleiben unverändert. GitHub, P und M365-Berechtigungen sind unverändert, die Q-Abnahme enthält keine GitHub- oder P-Publikationsfreigabe.

R06-12 ist durch die ausdrücklich entschiedene und begründete Wiederverwendung der bisherigen Outlook-Importnachweise abgeschlossen. Es erfolgte kein neuer Import. Als nächste Arbeit folgt die lokale Publikationsvorbereitung einschliesslich P06-01 und eines passenden neuen Webartefakts mit der UI-Korrektur. Veröffentlichung auf GitHub und Bereitstellung auf P benötigen weiterhin eigene Freigaben.

Private Zieladressen, Berechtigungsantworten, Rückfallkopien und Uploadbelege liegen unter `.work/deployments/2026-10-01-eq-mvp06/` sowie für den getrennten Korrekturvollzug unter `.work/deployments/2026-10-01-eq-mvp06-0601/`. Sie sind kein zur öffentlichen Publikation bestimmter Bestandteil dieses Berichts.
