# MVP 0.7 · Release- und Deploymentplan

Stand: 8. Oktober 2026. **Die lokale Releasevorbereitung ist durch David Steimer gestartet. AP22 und AP21 sind abgenommen. Quellenreleasefreigabe, Datenpromotion, definitive Builds und Bereitstellungen sind noch nicht erfolgt.** Dieser Plan führt den bestätigten [Releaseumfang](../planung/release-mvp07.md) aus. Er erweitert ihn nicht.

## 1. Zusammengehöriger Ausgangsstand

| Gegenstand | Gebundene Grundlage oder Zielwert |
| --- | --- |
| Kalenderintegration | [AP22C3-Abnahme](../fachrecht/abnahme-ap22c3.md), 204 gesicherte Dateien |
| Datumseingabe | [AP21-Abnahme](../fachrecht/abnahme-ap21.md), 192 gesicherte Dateien, einschliesslich akzeptiertem geringfügigem Magic-Keyboard-Umgebungsbefund |
| Datenkandidat | `2026-10-08-ap22c3-reference.1`, weiterhin `candidate`, nicht operativ freigegeben |
| Kandidatenmanifest SHA-256 | `b290ece2d105c606b3de8154edade57fcbaf2ff978e42b05b08561fb1c40a0f6` |
| Anwendung / SPFx-Zielversion | `0.7.0` / `0.7.0.0`, noch nicht in Produktdateien übernommen |
| Manifest / Mindestconsumer | `7.0.0` / `7.0.0` gemäss DEC-2026-030 |
| Komponenten | Fünf Rechtsprofile 1.0.0, 32 Regelkalender 3.0.0, ein Feiertagskatalog 2.0.0, ein Spezialregimekatalog 3.0.0 und ein Sozialverfahrenskatalog 2.0.0 |
| Neuer Mirrorumfang | 40 Artefakte plus Manifest, insgesamt 41 Laufzeitdateien |
| Unveränderte Sozialmodelle | 44 nationale Regeln und 50 BE-Anbindungen, operative Sozialabdeckung weiterhin auf Bern und 2026–2027 begrenzt |
| Dokumentierter Betriebsstand | MVP 0.6, SPFx `0.6.0.1`, Datenrelease `2026-10-01-mvp-06-approved.1`, gemäss [Produktionsnachweis](produktionsbereitstellung-mvp06-2026-10-01.md), keine neue Livebestandsaufnahme in diesem Vorbereitungsschritt |

Die Kalenderfreigaben erweitern die konkret unterstützten Bundesverfahren StPO, ZPO, BGG und VwVG. Sie sind keine Freigabe zusätzlicher kantonaler Verwaltungsverfahren oder ausserbernischer Sozialverfahren. Die vier Januargrenzen, die qualifizierte GR-Abdeckung und der NE-Vorbehalt bleiben erhalten. DE und FR bleiben die Produktsprachen. IT und Rumantsch Grischun sind keine zusätzliche Releasevoraussetzung. Eigenständiges kommunales Recht, Kalender-App und Karte gehören nicht zu MVP 0.7.

## 2. Reihenfolge und Entscheide

| Schritt | Ergebnis | Status / Haltepunkt |
| --- | --- | --- |
| R07-A1 · Eingangssicherung | Abnahmen und Kandidat verifizieren, technische Vorprüfung, vollständiges Quelleninventar, aktuelle lokale Regression, getrennten Vorbereitungssnapshot anlegen | Mit dem Releaseauftrag freigegeben. Nachweis in der [lokalen Vorprüfung](vorpruefung-mvp-07.md) |
| R07-A2 · Quellenkonsolidierung | Erneuter abgegrenzter Quellenabgleich, konkret begründete Wiederverwendungen, Änderungsbefunde und Vorbehalte pro Referenz dokumentieren | Im Vorbereitungsauftrag enthalten. Noch kein abgeschlossener Quellenbericht. Danach ausdrückliche menschliche Quellenabnahme |
| R07-B · Lokaler Release | Quellenregister und Nachweisereignis, kontrollierte Datenpromotion, Versions-/Pinbindung, definitive SPFx-, Mirror- und Webartefakte, lokale Prüfung der tatsächlichen Bytes | Erst nach Quellenabnahme und ausdrücklicher Freigabe der Datenübernahme und Builds |
| R07-C · E und Q | Konkrete Paketfreigabe, bestehende vier Instanzen, technische Matrix, reale Geräte-/Gastprüfung und manuelle Q-Abnahme | Separater Installationsauftrag. Gemeinsame Katalogreichweite vor Paketwechsel offenlegen |
| R07-D · GitHub und P | Publikationsvorprüfung, veröffentlichter gebundener Quellstand, frische Sicherung, Hostingvorprüfung, Umschaltung und öffentliche Nachprüfung | Separate GitHub- und P-Freigaben. Neuer Head-/Get- und Cachebefund samt begrenztem Risikoentscheid vor P |

Ein wesentliches Arbeitspaket gleichzeitig, höchstens fünf Nettoarbeitstage je Teilpaket als Obergrenze. Die Trennung A1/A2 macht insbesondere den vergrösserten Quellenumfang nachvollziehbar. Technische Parallelprüfungen innerhalb A1 eröffnen keinen zweiten fachlichen Arbeitsstrang. David Steimer trifft die Entscheide in Personalunion. Codex erstellt Unterlagen und Nachweise ohne formelle Freigabe- oder Haftungsverantwortung.

## 3. Quellenprüfung und Datenpromotion

Der [Quellenprüfplan](../fachrecht/quellenpruefplan-mvp07.md) berücksichtigt nicht nur das Manifest, sondern auch Katalog, Verfahrensbindungen, Anknüpfungsregeln, zusätzliche Prozessregeln und Aktivierungsbelege. Das bisherige Argument «nur ergänzend im Katalog, nicht operativ» darf nicht ungeprüft auf MVP 0.7 übertragen werden. Vorhandene AP22-Belege können nur innerhalb ihres belegten Inhalts und ursprünglichen Prüfzeitpunkts wiederverwendet werden. Das Matrix-Abschlussdatum 8. Oktober ist kein neues Abrufdatum. Ein identischer Datei-Hash ist keine neue materielle Quellenprüfung.

Bei der später freigegebenen Promotion gilt diese Reihenfolge:

1. Den abgenommenen Quellenentscheid und die neue Kalenderfreigabe in einer neuen Feiertagskatalogkopie binden. Keine historischen Freigaben umschreiben.
2. Alle 32 Kalender mit dem dadurch veränderten Kataloghash erneut projizieren. Die fachlichen Regeln bleiben unverändert. Historische Reviewmetadaten der deterministischen Projektion nicht pauschal auf ein neues Datum oder `verified` ändern.
3. Alle 50 Sozialfreigabeverknüpfungen an die neue Release-ID und die tatsächlichen Hashes von CH-Kalender, BE-Kalender und Feiertagskatalog binden. Die 44 Regeln, 50 BE-Anbindungen und deren sachliche/zeitliche Grenzen nicht erweitern.
4. Erst anschliessend die 40 Manifestdeskriptoren, Byteanzahlen und Hashes versiegeln. Fünf Rechtsprofile und Spezialregimekatalog byteidentisch übernehmen, soweit der Quellenabgleich keinen gesondert zu entscheidenden Änderungsbedarf ergibt.
5. Den freigegebenen Format-7-Consumer mit den vollständigen Manifest- und Artefaktbytes betreiben. Nicht lediglich die Kennzeichnung eines Referenzbuilds entfernen oder dessen Manifest auf `approved` setzen.

Hierfür werden neue MVP-0.7-Werkzeuge angelegt. Die MVP-0.6-Werkzeuge und ihre gebundenen Ausgaben bleiben erhalten. Kanonische Schemadateien für Manifest 7, Kalender 3 und Katalog 2 sind aus den bestätigten Vertragskopien bytegleich bereitzustellen. Ihre bisherigen isolierten Kopien bleiben bestehen. Die Tests für historische Datenformate bleiben gegen historische Releases ausführbar. Nur Tests des jeweils aktuellen Produkteinstiegs werden nach Sicherung ihrer Vorbilder gezielt fortgeschrieben.

## 4. E-/Q-Bereitstellung ohne neue Infrastruktur

Vorgesehen bleiben die bestehenden Instanzen auf «Fristenrechner Test», «Entwicklungsumgebung», «Fristenrechner Gastdemo» und «Fristenrechner Gastdemo Teams». Vor dem konkreten Auftrag sind Zielzustand, Paketidentität, Konfigurationen und Rückfallstand frisch zu prüfen. Im neuen versionsbezogenen Mirrorordner müssen alle 41 Laufzeitdateien vorhanden und bytegeprüft sein, bevor eine Instanz umgestellt wird. Governance- und Prüfdokumente gehören nicht in den Laufzeitmirror.

**Der Austausch im gemeinsamen Tenant-App-Katalog betrifft den Code sämtlicher mit diesem Produktpaket verbundener Instanzen.** Nur die vier bezeichneten E-/Q-Instanzen sollen neue Konfigurationen und Mirrors erhalten. Historische AP5-Pins und Daten bleiben erhalten, ihre Lesbarkeit wird mit dem neuen Consumer erneut geprüft. Keine automatische Installation auf zusätzlichen Sites und keine neuen API-, Gast-, Gruppen- oder Richtlinienberechtigungen.

Der neue konfigurationsgebundene Cache übernimmt alte originweite Cacheeinträge nicht. Jede konfigurierte Instanz muss ihre eigene freigegebene Quelle zunächst erfolgreich laden. Deshalb wird der Erstabruf gezielt geprüft. Ein warmer Cache oder ein noch nicht auf GitHub erreichbarer lokaler Commitpin genügt nicht als Nachweis einer funktionierenden Datenquelle. E/Q verwenden vor dem GitHub-Push die verifizierten Mirrors.

Die isolierte AP21-App und die E-Testseite werden nicht automatisch entfernt, aktualisiert oder für Teams registriert. E05 ist nicht erteilt. Die direkte Teams-/iOS-Teams-Prüfung kann am später ausdrücklich freigegebenen normalen Releasepaket erfolgen. Bereinigung der Testapps und Katalogeinträge benötigt einen eigenen, konkreten Auftrag.

## 5. Releaseprüfmatrix

Die folgende Matrix ist der Mindestumfang, noch kein Testresultat. Konkrete Eingaben und Sollwerte werden aus den abgenommenen AP22-/AP21-Referenzen an den endgültigen Datenrelease gebunden. Wiederverwendete lokale Nachweise, frische automatisierte Tests, tatsächliche Hosttests und Davids manuelle Prüfungen bleiben getrennt.

| ID | Prüfung und Mindestnachweis |
| --- | --- |
| R07-01 | Paketversion, unveränderte Produktidentitäten, keine neuen API-Rechte, Format 7, 40 Artefakte und vollständige Hash-/Bytebindungen. Alle bisherigen unterstützten Formate bleiben lesbar |
| R07-02 | 198 Herkunftsentscheide, 104 terminale Verfahrensbindungen, 32 Kalender. Bestehende 479 Katalogregeln und zwölf zusätzliche SO-Prozessregeln erhalten, keine freie Vereinigung konkurrierender Listen |
| R07-03 | Rollen und regionale Genauigkeit: Behörden-/Gerichtsort, Partei-/Vertretungsort, erforderliche Gebietspräzisierung und Wechsel. Kein stiller BE-/CH-Ersatz und kein erster beliebiger Treffer |
| R07-04 | Alle vier Januargrenzen mit sonst identischen vollständigen Berechnungen. Nur die konkret unsichere gebundene Regel variieren. Gleiche rechtliche Wirkung bleibt berechenbar, unterschiedliche Wirkung sperrt definitives Resultat und Kalenderexport |
| R07-05 | GR- und NE-Vorbehalte getrennt von den Januargrenzen. Bedingte Regeln AI/AR/GL/NE, SO-Prozessliste sowie positive/negative Regionalfälle aus dem Referenzkorpus |
| R07-06 | Zeitliche Grenzen ab 29.08.2026, je Tag gültige Normen/Gebiete, Profilgrenzen und Releasefreigaben. Offenes Kalenderende ist kein unbegrenzter Rechtsbeständigkeitsnachweis. Sozialgrenzen 2026–2027 unverändert |
| R07-07 | Bestehende StPO-/ZPO-/BGG-/VwVG-/VRPG-BE-Pfade, Beschaffung, politische Rechte und alle 50 BE-Sozialanbindungen mit echten freigegebenen Daten. Keine zusätzliche kantonale oder ausserbernische Sozialfreigabe |
| R07-08 | AP21: Datum direkt eingeben, `h`, Tag sowie Tag.Monat, Enter, Tab und Blur, ungültige/mehrdeutige Eingaben, optionaler Kalender, alle sichtbaren Datumsrollen. Kein rechtlicher Arithmetikwechsel |
| R07-09 | Reale Geräte: iOS-Teams und direkte Teams-Einbettung, VoiceOver, 200 Prozent Zoom und noch unbelegte Datumsrollen. Akzeptierten Magic-Keyboard-Befund getrennt erhalten, nicht als allgemeinen Gerätetest ausgeben |
| R07-10 | Tatsächlicher exportfähiger Build: geänderter Datumstext entfernt altes Resultat und Export sofort. Fehlende/ungültige Fakten oder rechtlich divergierender Januarvergleich lassen keinen definitiven ICS-Export zu |
| R07-11 | DE/FR, zweispaltiges Layout, schmale Ansichten, linksbündige Datumseingabe, zurückhaltende Hauptansicht und vollständige Rechenspur. Keine Werbung mit nicht freigegebener Abdeckung |
| R07-12 | Defaults-Migration auf Version 4 ohne erfundene Fallfakten. Keine Speicherung von Datum, Referenz oder Ergebnis als persönliche Standards. Tatsächliche Storagewerte kontrollieren |
| R07-13 | Alle 41 Mirrordateien, echter Erstabruf, fehlende/manipulierte Datei, Konfigurationswechsel, alter/neuer Cache und getrennte Quellenidentität. Kein Datenfallback auf eine fremde Konfiguration |
| R07-14 | Historische AP5-Ansicht mit unverändertem Datenpin, neuer Consumer und gesichertem zusammengehörigem Rückfallstand |
| R07-15 | Tatsächlich gespeicherte ICS-Dateien DE/FR je Hosttyp semantisch prüfen. Outlook-Importnachweise nur nach begründeter Bewertung wiederverwenden. Kein Import oder Löschen von Terminen ohne Auftrag |
| R07-16 | Bestehender B2B-Gast meldet sich tatsächlich in zulässiger Umgebung an. Kein Umgehen von Conditional Access, Eigentümertest ersetzt Gastnachweis nicht. Anschliessend manuelle fachliche Q-Abnahme für exakt bezeichnetes Paket und Datenrelease |
| R07-17 | P: bestehende öffentliche Matrix D01–D12 um nationale Kalenderfälle und AP21 ergänzen, tatsächliche Zielbytes, Netzwerk, Storage, DE/FR und mobile Bedienung prüfen. HEAD/GET und Cacheverhalten gesondert bewerten |

## 6. Publikation und öffentlicher Betrieb

Vor GitHub wird der zusammengehörige Quellstand gesondert auf öffentliche Eignung geprüft. Private Rohbelege, Tenant-/Benutzerinformationen, Website-Backups, temporäre Schlüssel und fremde lokale Änderungen werden nicht pauschal veröffentlicht. Öffentliche Standardtests müssen ohne private Rohdownloads nachvollziehbar bleiben. Der vollständige private Quellen-Vollaudit bleibt separat und streng. Eine lokale Commitbindung ist noch kein Push.

Vor P werden das tatsächlich bestehende Webangebot und der Rückfallstand frisch gesichert. Vorprüfung, Umschaltung und öffentliche Nachprüfung erfolgen auf der bestehenden steimer.ch-Infrastruktur. Root-Webauftritt, Sitemap und Hostingkonfiguration bleiben ohne konkreten Änderungsauftrag unverändert. Eine unverlinkte temporäre Adresse ist nicht automatisch nicht öffentlich.

Der bekannte Header-/Cachebefund wurde für MVP 0.6 begrenzt akzeptiert. **Dieser Risikoentscheid gilt nicht automatisch für MVP 0.7.** Vor P werden HEAD und GET an HTML, JavaScript, CSS, Lizenztext und Buildmanifest erneut verglichen. Derselbe Befund benötigt eine neue begrenzte Entscheidung, zusätzliche Fehler einen gesonderten Halt beziehungsweise Rückfall. Unveränderte `.htaccess`-Bytes sind kein Beleg für eine wirksame Behebung.

## Aktueller nächster Schritt

R07-A1 schafft den gesicherten Ausgangspunkt und die vollständige Quellenmenge. Danach folgt R07-A2 mit dokumentiertem Inhalts-/Fassungsabgleich und begründeter Wiederverwendung. Erst dieser zusammengeführte Quellenbericht wird David zur Abnahme und zur gesonderten Freigabe von Datenübernahme und definitiven Builds vorgelegt. Der heutige Startauftrag verändert weder E/Q/P noch GitHub, Outlook, Berechtigungen oder Testapp-Bestände.
