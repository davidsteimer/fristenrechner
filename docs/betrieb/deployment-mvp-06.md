# MVP 0.6 · Release- und Deploymentplan für AP20

Stand: 1. Oktober 2026. **Quellenprüfung abgenommen, lokale Datenübernahme und definitive Artefaktbauten abgeschlossen. Nach dem ursprünglichen E-/Q-Prüflauf ist das separat freigegebene Korrekturpaket 0.6.0.1 im gemeinsamen Katalog bereitgestellt und auf den vier bestehenden E-/Q-Sites aktualisiert. Paket und Hauptbundle sind bytegeprüft, die relevanten Katalogberechtigungen unverändert. Die begrenzten Live-Nachtests auf allen vier Hosts und die historische AP5-Kompatibilität sind bestanden. MVP06-UI-01 ist behoben. Datenrelease und Mirrors bleiben unverändert. David hat manuelle Prüfung und Gastanmeldung als bestanden bestätigt. R06-12 ist durch ausdrücklich entschiedene, begründete Wiederverwendung der Outlook-Importnachweise abgeschlossen. E/Q ist abgenommen, keine Publikationsfreigabe.** Führendes Arbeitspaket: [Issue #44](https://github.com/davidsteimer/fristenrechner/issues/44).

Der [Korrekturbericht zum SPFx-Paket 0.6.0.1](spfx-korrekturkandidat-mvp06-0601.md) trennt den neuen Vollzug vom ursprünglichen technischen Hostregister für 0.6.0.0 mit **284 PASSED, 2 FAILED und 3 NOT_RUN**. Dieses Register bleibt unverändert. Die begrenzten Korrekturprüfungen sind gesonderte Nachweise, keine Wiederholung sämtlicher 289 Einträge und kein neuer Lauf der 28 Kalenderdownloads. Die zwischenzeitliche App-Verwaltungsblockade wurde nach ausdrücklicher Präzisierung des begrenzten Zugriffs aufgelöst.

Die [technische Eingangssicherung](vorpruefung-mvp-06.md) und die [zusammengeführte Quellenprüfung](../fachrecht/quellenabgleich-mvp06.md) bleiben als ursprüngliche Nachweise erhalten. Die separate [Quellenabnahme und lokale Baufreigabe](../fachrecht/abnahme-quellen-mvp06.md) dokumentiert den Folgeentscheid. Der [Promotionsnachweis](../../outputs/release-mvp06-2026-10-01/data-promotion.json) bindet den neuen Datenrelease `2026-10-01-mvp-06-approved.1`. Der anschliessende [E-/Q-Vollzugsnachweis](eq-installation-mvp06.md) dokumentiert Auftrag, Bestandsprüfung, Paketfreigabe, vollzogene Installation und die getrennt ausgewiesenen bisherigen Hostprüfungen. Die nachstehenden Grenzen für E/Q, GitHub und P bleiben unverändert.

## 1. Ziel und Ausgangspunkt

[AP20C1](../fachrecht/abnahme-ap20c1.md), [AP20C2](../fachrecht/abnahme-ap20c2.md) und [AP20C3](../fachrecht/abnahme-ap20c3.md) sind abgenommen. Die fünf neuen Erlasse EOG, FamZG, FLG, MVG und ÜLG werden gemeinsam als MVP 0.6 vorbereitet. Grundlage bleibt [DEC-2026-026](../entscheidungen/DEC-2026-026-beschluss.md).

| Gegenstand | Gebundener Ausgangspunkt beziehungsweise Planwert |
| --- | --- |
| Abgenommener Kandidat | `2026-10-01-ap20c3-candidate.1` |
| Manifest SHA-256 | `b4250a31d226b4f59e0857a857f49e1ea354722b9ff46b9324d70b330f135450` |
| Zielversion Anwendung / Paket | Anwendung `0.6.0`, ursprüngliches Paket `0.6.0.0`, anschliessend separat freigegebene UI-Korrektur `0.6.0.1` |
| Manifest / Mindestconsumer | `6.0.0` / `6.0.0` |
| Sozialverfahrenskatalog | `2.0.0` |
| National modellierte Regeln / BE-Anbindungen | 44 / 50, gegenüber MVP 0.5 zusätzlich 20 / 22 |
| Zeitliche Modellabdeckung | 01.01.2026–31.12.2027, bestehende qualifizierte Zeitanker unverändert |
| Laufzeitbestand | Manifest plus zehn Artefakte, neun Nicht-Sozialkatalog-Artefakte unverändert |
| Lokal übernommener Release | `2026-10-01-mvp-06-approved.1`, Manifest SHA-256 `637cfc03c777f350031ba6c28676c685c16f25733391e1f25b0a3580016f5724` |
| Lokaler Datenpin | `19b37336974f3ba7c72333763e1272425239b8cd`, nur elf Laufzeitdateien, noch nicht auf GitHub |
| Gesicherter E-/Q-Ausgangsstand und unveränderter P-Bestand | MVP 0.5, Daten `2026-09-28-mvp-05-approved.1`, bisheriges E/Q-Paket `0.5.0.0` |
| Aktueller E-/Q-Prüfstand | Paket `0.6.0.1`, vier unveränderte Mirrors `2026-10-01-mvp-06-approved.1`, begrenzte Korrektur-Nachtests bestanden und MVP06-UI-01 behoben. Manuelle Q-Prüfung und Gastanmeldung durch David als bestanden bestätigt. R06-12 durch begründete Wiederverwendung abgeschlossen |

Der [MVP-0.5-Produktionsnachweis](produktionsbereitstellung-mvp05-2026-09-28.md) ist für den dokumentierten Betriebsstand massgebend. Ältere Angaben über P auf MVP 0.3 oder einen absoluten Green-Stopp sind historische Zwischenstände. Vor jeder Installation wird der tatsächliche Ziel- und Rückfallstand frisch geprüft.

Nicht enthalten sind neue kantonale Verfahrensanbindungen, weitere Sozialversicherungskonstellationen, eine Kalender-App, zusätzliche Oberflächensprachen oder neue Hostinginfrastruktur. Nationale Modellierung ist keine nationale Betriebsfreigabe. Die bernischen Produktgrenzen und alle beschlossenen Ausschlüsse gelten fort.

## 2. Schlanker Ablauf mit klaren Entscheiden

| Schritt | Ergebnis | Freigabegrenze |
| --- | --- | --- |
| R06-A · Vorbereitung | Unveränderlicher Eingangssnapshot, Quelleninventar und zusammengeführte Quellenprüfung abgeschlossen | Quellenprüfung ausdrücklich abgenommen |
| R06-B · Lokaler Release | Datenpromotion, Quellenregister und definitive SPFx-/Mirror-/Webartefakte samt lokalen Prüfungen abgeschlossen. [Gebundener Nachweis](releaseartefakte-mvp-06.md) | Durch den ausdrücklichen Quellen-/Daten-/Buildentscheid gedeckt, keine operative Aktivierung |
| R06-C · E/Q | Ursprünglicher technischer Hostlauf mit 0.6.0.0 einschliesslich 44/44 Mirrordateien, 28 echten Kalenderdownloads und beider AP5-Kaltstarts dokumentiert. Anschliessend exakt freigegebenes Paket 0.6.0.1 bereitgestellt, vier bestehende Site-Apps aktualisiert und Paket/Bundle bytegeprüft. Gesonderte begrenzte Live-Nachtests auf vier Hosts und AP5-Teams bestanden, MVP06-UI-01 behoben. Daten und Mirrors unverändert | Abgeschlossen durch [Davids Bestätigung der manuellen Prüfung und Gastanmeldung sowie begründete Outlook-Nachweiswiederverwendung](abnahme-q-mvp06.md). Keine neue Gast-Liveprüfung durch Codex, kein neuer Import und keine GitHub-/P-Freigabe |
| R06-D · Publikation | Bereinigter, versionstreuer GitHub-Stand und öffentliche P-Bereitstellung mit Sicherung und Prüfmatrix | Separate GitHub- und P-Freigaben. Etwaiger Deploy-Key separat und sofort wieder entfernen |

Ein wesentliches Paket gleichzeitig, höchstens fünf Nettoarbeitstage je Paket als Obergrenze. Bei grösserem Umfang wird am nächsten fachlich sinnvollen Übergabepunkt geteilt, nicht stillschweigend erweitert. David Steimer übernimmt Entscheidungen und fachliche Verantwortung in Personalunion. Codex unterstützt ohne formelle Freigabe- oder Haftungsverantwortung.

## 3. Quellen und kontrollierte Datenübernahme

Das neue Manifest nennt 77 Quellen-IDs, davon 24 neu gegenüber MVP 0.5. Hinzu kommen 82 ausschliesslich im byteidentischen Feiertagskatalog geführte Quellen-IDs. Insgesamt sind 159 unterschiedliche Referenzen nachzuweisen. Quellen-IDs, Erlasse, Fassungen und tatsächlich frische Abrufe werden nicht gleichgesetzt.

Die Behandlung ist gemäss [MVP-0.6-Quellenprüfplan](../fachrecht/quellenpruefplan-mvp06.md) ausgeführt und im gesonderten Quellenbericht belegt. Gleichtägige AP20C2-/C3-Belege sind nur innerhalb ihrer nachgewiesenen Reichweite übernommen. Die EOG-/EOV-Kontrolle aus C1 vom 30. September ist aktualisiert. Der übrige laufzeitrelevante Bestand hat einen erneuten abgegrenzten Abgleich einschliesslich Zukunftsfassungen und Monitoring erhalten. Für die 82 nicht operativen Katalogquellen ist die dokumentierte Wiederverwendung der Prüfung vom 22. September ausdrücklich abgenommen, nicht als neue Vollprüfung ausgegeben.

AI-Quellenkonflikt, AVIV-Option B, OF-001, Rechtsprechungsgrenzen und NE-Vorbehalt bleiben sichtbar. Neue fachliche Befunde halten die betroffenen Übernahmeschritte an. Die Quellenaktualität ist bei Verzögerung oder Änderungshinweisen erneut zu beurteilen. Der bisherige ordentliche Prüftermin wird durch diese Vorbereitung nicht verändert.

Die separat freigegebene Promotion behandelt die gemischten Objektstatus wie folgt. Der gebundene maschinenlesbare Nachweis prüft diese Eigenschaften:

- 24 bestehende nationale Regeln und 28 Berner Anbindungen aus MVP 0.5 unverändert erhalten.
- Nur die 20 neuen Regeln und 22 neuen Anbindungen kontrolliert von `candidate` auf `reviewed` überführen.
- Alle 50 Freigabeverknüpfungen auf den tatsächlich abgenommenen neuen Quellenbeleg und die neue Release-ID binden. Sachlogik, Zeitanker, Zuständigkeit und Feiertagsqualifikation nicht verändern.
- Neun übrige Artefakte byteidentisch erhalten. Kandidaten und alte freigegebene Releaseordner nicht überschreiben.
- Das Register um die 24 neuen Referenzen ergänzen. Verweise aus Ausschlusspfaden nicht als positive operative Fallfreigabe ausgeben. Ein neues AP13-Prüfereignis und einen neuen Index nachvollziehbar ableiten.

Historische Quellen-, Fach-, Abnahme- und Prüfnachweise bleiben unverändert. Vor späterer Änderung gebundener lebender Dateien werden deren tatsächliche bisherigen Bytes gesichert. Die bestehende MVP-0.5-Toolchain dient als Muster, wird aber nicht auf MVP 0.6 umgeschrieben oder ungeprüft wiederverwendet.

## 4. Artefakte und E-/Q-Vollzug

Die [definitiven lokalen Artefakte](releaseartefakte-mvp-06.md) sind aus demselben freigegebenen Daten- und Quellstand gebaut und geprüft. Der Nachweis dokumentiert Release-ID, Commitbezug, Grössen und SHA-256 für SPFx-Paket, vollständigen Mirrortransport und statisches Webarchiv. Die Tests verwenden die tatsächlich freigegebenen Bytes sowie den emittierten und paketierten Consumer, nicht nur synthetische Testfreigaben.

Der spätere [Korrekturvollzug 0.6.0.1](spfx-korrekturkandidat-mvp06-0601.md) ersetzt ausschliesslich das SPFx-Paket. Der unveränderte Datenrelease bleibt auf den bereits geprüften Mirrors. Das ursprüngliche Webarchiv enthält den gemeinsamen UI-Fix noch nicht. Die nachfolgende [lokale Publikationsvorbereitung](publikationspaket-mvp06.md) hat deshalb ein gesondertes korrigiertes Webartefakt erstellt. Nur dieses ist als neuer P-Kandidat vorgesehen. Das alte Archiv bleibt byteidentisch erhalten.

E und Q bleiben die bestehenden vier Rechnerinstanzen. Keine automatische Installation auf weiteren Sites, keine zusätzlichen Gäste, ACL- oder Richtlinienänderungen. **Der Austausch im gemeinsamen Tenant-App-Katalog kann den Code sämtlicher verbundener Instanzen ändern**, auch denjenigen der historischen AP5-Ansicht und allfälliger weiterer vorhandener Installationen. Diese Reichweite wurde unmittelbar vor der erteilten Paketbestätigung ausdrücklich erläutert und ist im [Vollzugsnachweis](eq-installation-mvp06.md) festgehalten. Nur die vier bezeichneten Instanzen erhalten eine neue Mirror-/Konfigurationseinstellung.

Je Mirror wird ein neuer versionsbezogener Ordner mit elf Laufzeitdateien vollständig bereitgestellt, byteweise geprüft und erst danach als Quelle gewählt. Governance-Unterlagen bleiben vom Laufzeitpfad getrennt. Der historische AP5-Datenpin bleibt erhalten und wird mit dem neuen Code erneut geprüft. Die alte Datei im Stamm-Solutionordner darf nicht ungeprüft als aktuelles Rückfallpaket verwendet werden.

E/Q verwenden vor der GitHub-Publikation die verifizierten SharePoint-Mirrors. Ein erst lokal bestehender Git-Datenpin ist zu diesem Zeitpunkt keine erreichbare öffentliche Datenquelle. Rollback bedeutet den gesicherten zusammengehörigen Paket-/Konfigurations-/Datenstand zurückzunehmen, nicht nur eine Versionsnummer zu ändern.

## 5. Geplante Prüfmatrix

Die folgenden Anforderungen bleiben der verbindliche Mindestumfang. Der [Vollzugsnachweis](eq-installation-mvp06.md) bewahrt den ursprünglichen technischen Hostlauf mit seinen zwei fehlgeschlagenen SharePoint-Layoutzuordnungen. Die getrennten Live-Nachtests mit 0.6.0.1 bestätigen inzwischen die Behebung auf beiden betroffenen Hosts sowie die begrenzte Regression auf Teams und AP5. Davids anschliessende [Bestätigung der manuellen Prüfung und Gastanmeldung](abnahme-q-mvp06.md) und die dort begründete Wiederverwendung nach R06-12 schliessen R06-C ab. Der begrenzte Nachtest ist weder eine neue vollständige Hostmatrix noch eine Gesamtfreigabe dieses Releaseplans. Lokale AP20-Prüfungen ersetzen keine tatsächliche E-/Q-/P-Prüfung.

| ID | Prüfung und Mindestnachweis |
| --- | --- |
| R06-01 | Paketidentität, keine neuen API-Berechtigungen, Formate 1–6, Sozialkatalog 2, neuer Datenstand 44/50 |
| R06-02 | Bestandsregression einschliesslich StPO, ZPO, politischer Rechte, Beschaffung und sechs bisheriger Sozialerlasse. StPO 16.09.2026 + zehn Tage ergibt 28.09.2026 |
| R06-03 | EOG: Verwaltung sowie beide modellierten Gerichts-Zuständigkeitswege, getrennte Fallmerkmale, formlose Festsetzung gesperrt |
| R06-04 | FamZG: qualifizierte Familienzulagenordnung und besonderer Gerichtsweg. FLG: eigenständige Kassen-/Gerichtsanbindung. Keine Vermischung der beiden |
| R06-05 | MVG: Verwaltungs-Produktgrenze und unabhängiger Gerichtspfad. ÜLG: eigenständiger Durchführungskanton, Gericht separat. Keine aufgehobene Sonderfrist oder materielle Geltendmachungsfrist |
| R06-06 | Alle 50 Anbindungen mit echten freigegebenen Daten automatisiert. AP17B-/AP19B-/AP20B-Referenzkorpora, Stillstand, Feiertage, Jahreswechsel und Negativfälle vollständig |
| R06-07 | Tatsächliche Hoststichprobe pro neuem Erlass: Ergebnis und Kalenderexport sowie gezielte Sperre bei fehlender/fremder Fallangabe. Synthetische Fälle, keine echten Personendaten |
| R06-08 | DE/FR, zweispaltige Desktopdarstellung, schmale Ansicht, frühe Datumseingabe und bereinigte Felder nach Wechsel. Fehlende Fakten verhindern Ergebnis und Export |
| R06-09 | Standards und Migration: bestehende Präferenzen erhalten, Empfangsdatum, Zuständigkeitsdaten, Kalenderreferenz und Ergebnis nicht speichern. Sichtprüfung tatsächlicher Browserstorage-Werte |
| R06-10 | Tatsächlicher Mirror-Erstabruf ohne vorgängigen Releasecache, Netzwerknachweis, Hash-/Teilreleasefehler, Ausfallverhalten und unveränderte Berechtigungsgrenzen |
| R06-11 | Historische AP5-Ansicht mit altem Datenpin, neuer Consumer sowie nachvollziehbarer Rückfall |
| R06-12 | Tatsächlich gespeicherte deutsche und französische ICS-Dateien je Hosttyp semantisch prüfen. Outlook Web/Desktop gezielt erneut prüfen oder unveränderte Importsemantik mit gebundenen Vorbelegen ausdrücklich begründen. Kein Import/Löschen ohne Auftrag |
| R06-13 | Q: bestehender B2B-Gast meldet sich tatsächlich über eine zulässige Umgebung an. Kein Umgehen von Conditional Access. Eigentümertest ersetzt Gastnachweis nicht |
| R06-14 | Manuelle fachliche Q-Abnahme durch David für exakt bezeichnetes Paket und Datenrelease |
| R06-15 | P: D01–D12 am tatsächlichen Ziel, Bytevergleich, DE/FR und neue Sozialpfade, reale ICS-Dateien, Mobilansicht, Netzwerk und direkte Storage-Kontrolle. Wiederverwendung nur ausdrücklich und sachlich begründet |

Die [konkrete E-/Q-Fallliste](pruefmatrix-mvp06.md) ergänzt Eingaben, Sollwerte und Hostzuordnung aus den abgenommenen Referenzen. Nicht ausgeführte oder technisch nicht zuverlässig beobachtbare Prüfschritte werden offen ausgewiesen. Keine pauschalen Häkchen aus einem anderen Host oder aus bloss vorhandenem Cache.

## 6. GitHub und öffentlicher Betrieb

Nach bestandener E-/Q-Prüfung und manueller Q-Abnahme folgen Publikationsvorprüfung, versionstreuer GitHub-Quellstand und erst anschliessend P. Private Host-/Tenantdaten, Schlüssel, Benutzerangaben, Website-Backups, Rohdownloads und fremde Benutzeränderungen werden nicht pauschal mitpubliziert. Die lebenden Einstiegstexte und IT-Unterlagen werden gezielt auf den tatsächlichen Releasefortschritt aktualisiert, historische Nachweise bleiben erhalten.

**Technischer Publikationspunkt P06-01:** Die [Publikationsvorbereitung](publikationspaket-mvp06.md#p06-01--öffentliche-prüfung-und-privater-vollaudit) trennt nun den öffentlichen Standardtest ausdrücklich vom privaten Quellen-Vollaudit. Der öffentliche Integritätsnachweis liest 63 direkte öffentliche Freigabebelege, nicht die 107 privaten Rohbelege. Fehlende private Belege lösen im Vollbefehl weiterhin einen Fehler aus. Die Datenübernahme bleibt an den strengen Verifier gebunden. Der Publikationsnachweis weist den tatsächlichen Test im bereinigten Dateiexport aus, ohne einen frischen GitHub-Clone oder eine neue Abhängigkeitsinstallation zu behaupten.

Vor P werden das aktuelle Webangebot und der zusammengehörige Rückfallstand frisch gesichert. Temporäre Vorprüfung, öffentliche Umschaltung und Nachprüfung folgen dem bewährten Ablauf auf der bestehenden steimer.ch-Infrastruktur. Rootauftritt und Sitemap bleiben ohne konkreten Änderungsbedarf unverändert. Unverlinkte Adressen werden nicht als zugriffsgeschützt bezeichnet.

Der [MVP-0.5-Nachweis](produktionsbereitstellung-mvp05-2026-09-28.md) enthält akzeptierte D04-/D05-Abweichungen und eine offene direkte Storage-Wertkontrolle D10. Vor MVP 0.6 wird der spezifische HEAD-/GET-Vergleich für HTML, JavaScript, CSS, Lizenztext und Buildmanifest erneut ausgeführt. Die frühere Risikoakzeptanz wird **nicht automatisch auf MVP 0.6 übertragen**. Bei unverändertem Befund ist die begrenzte erneute Entscheidung vorzulegen, bei neuer Abweichung anzuhalten. Hostingänderungen bleiben separat zu beauftragen. Nach der Umschaltung werden die tatsächlichen neuen Ressourcen erneut geprüft.

## 7. Aktuell freigegebener nächster Schritt

Quellenabnahme, lokale Datenübernahme, definitive Builds sowie ursprünglicher E-/Q-Vollzug und separat freigegebene Korrekturinstallation sind abgeschlossen. Das aktuelle Paket `0.6.0.1` mit SHA-256 `60f84213507f99ec58463c84c514037d9c00bd63fdc8f02d85e52097bcf3c587` ist auch am erneut heruntergeladenen Katalogpaket nachgewiesen. Alle vier bestehenden Site-Apps wurden aktualisiert und ihre Appdetails frisch ohne weiteres Updateangebot kontrolliert. Keine interne AppInstance-API-Version wird behauptet. Das neue Bundle ist in den tatsächlichen Rechneransichten beobachtet. Die vorhandenen vier Mirrorquellen und der historische AP5-Datenstand bleiben unverändert.

Die begrenzten Live-Nachtests auf E-/Q-SharePoint und E-/Q-Teams sind bestanden, MVP06-UI-01 ist behoben. Die historische AP5-Teamsansicht bestätigt mit unverändertem Datenpin und neuem Bundle weiterhin den StPO-Positivfall 28.09.2026. Ihre früheren beiden Kaltstarts gehören zum ursprünglichen 0.6.0.0-Lauf, nicht zu einem neuen Kaltstartnachweis. Der [Korrekturbericht](spfx-korrekturkandidat-mvp06-0601.md) grenzt diese Belege ab. Temporäre Viewportüberschreibungen sind zurückgenommen und die Rechner wieder auf Deutsch. Keine automatische Installation auf weiteren Sites. David hat manuelle Q-Prüfung und Gastanmeldung anschliessend als bestanden bestätigt. Diese [Abnahme](abnahme-q-mvp06.md) ist ein Benutzerbeleg, kein zusätzlicher Codex-Gastlauf. GitHub und P benötigen gesonderte Freigaben.

R06-12 ist durch die ausdrücklich entschiedene und begründete Wiederverwendung der bisherigen Outlook-Web-/Desktop-Importnachweise abgeschlossen. Die 28 Dateiprüfungen werden weiterhin als eigener Nachweis geführt, ein neuer Import hat nicht stattgefunden. Der E-/Q-Schritt R06-C ist damit abgeschlossen. Die gesondert beauftragte [lokale Publikationsvorbereitung](publikationspaket-mvp06.md) umfasst die Trennung nach P06-01, das korrigierte Webartefakt, den bereinigten Dateiexport und das explizite Publikationsinventar. Sämtliche zielbezogenen P-Prüfungen sowie die separaten GitHub- und P-Freigaben bleiben nachgelagert.
