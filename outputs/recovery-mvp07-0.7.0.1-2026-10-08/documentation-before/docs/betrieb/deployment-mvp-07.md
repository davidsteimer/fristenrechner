# MVP 0.7 · Release- und Deploymentplan

Stand: 8. Oktober 2026. **R07-A1, R07-A2 und der zusätzlich freigegebene lokale Schritt R07-B sind abgeschlossen. Datenübernahme, definitive Builds und lokale Abschlussprüfungen sind bestanden. Keine Bereitstellung erfolgt.** Die [Releaseartefakte und Nachweise](releaseartefakte-mvp-07.md) bezeichnen die konkreten Dateien. Dieser Plan führt den bestätigten [Releaseumfang](../planung/release-mvp07.md) aus. Er erweitert ihn nicht. Die [Quellenabnahme](../fachrecht/abnahme-quellen-mvp07.md) und die zusätzliche [R07-B-Freigabe](freigabe-r07-b.md) bleiben getrennte Entscheide. Der im früheren QA-Nachweis gebundene Planstand ist vor dieser Statusnachführung bytegleich gesichert.

## 1. Zusammengehöriger Ausgangsstand

| Gegenstand | Gebundene Grundlage oder Zielwert |
| --- | --- |
| Kalenderintegration | [AP22C3-Abnahme](../fachrecht/abnahme-ap22c3.md), 204 gesicherte Dateien |
| Datumseingabe | [AP21-Abnahme](../fachrecht/abnahme-ap21.md), 192 gesicherte Dateien, einschliesslich akzeptiertem geringfügigem Magic-Keyboard-Umgebungsbefund |
| Datenkandidat | `2026-10-08-ap22c3-reference.1`, weiterhin `candidate`, nicht operativ freigegeben |
| Kandidatenmanifest SHA-256 | `b290ece2d105c606b3de8154edade57fcbaf2ff978e42b05b08561fb1c40a0f6` |
| Anwendung / SPFx-Zielversion | `0.7.0` / `0.7.0.0`, lokal in Produktdateien übernommen |
| Manifest / Mindestconsumer | `7.0.0` / `7.0.0` gemäss DEC-2026-030 |
| Komponenten | Fünf Rechtsprofile 1.0.0, 32 Regelkalender 3.0.0, ein Feiertagskatalog 2.0.0, ein Spezialregimekatalog 3.0.0 und ein Sozialverfahrenskatalog 2.0.0 |
| Neuer Mirrorumfang | 40 Artefakte plus Manifest, insgesamt 41 Laufzeitdateien |
| Unveränderte Sozialmodelle | 44 nationale Regeln und 50 BE-Anbindungen, operative Sozialabdeckung weiterhin auf Bern und 2026–2027 begrenzt |
| Dokumentierter Betriebsstand | MVP 0.6, SPFx `0.6.0.1`, Datenrelease `2026-10-01-mvp-06-approved.1`, gemäss [Produktionsnachweis](produktionsbereitstellung-mvp06-2026-10-01.md), keine neue Livebestandsaufnahme in diesem Vorbereitungsschritt |

Die Kalenderfreigaben erweitern die konkret unterstützten Bundesverfahren StPO, ZPO, BGG und VwVG. Sie sind keine Freigabe zusätzlicher kantonaler Verwaltungsverfahren oder ausserbernischer Sozialverfahren. Die vier Januargrenzen, die qualifizierte GR-Abdeckung und der NE-Vorbehalt bleiben erhalten. DE und FR bleiben die Produktsprachen. IT und Rumantsch Grischun sind keine zusätzliche Releasevoraussetzung. Eigenständiges kommunales Recht, Kalender-App und Karte gehören nicht zu MVP 0.7.

## 2. Reihenfolge und Entscheide

| Schritt | Ergebnis | Status / Haltepunkt |
| --- | --- | --- |
| R07-A1 · Eingangssicherung | Abnahmen und Kandidat verifizieren, technische Vorprüfung, vollständiges Quelleninventar, aktuelle lokale Regression, getrennten Vorbereitungssnapshot anlegen | Am 8. Oktober 2026 abgeschlossen. 576 Eingangsdateien separat gesichert, 396 Abnahmedateien geprüft, 2'248 Produkttests sowie 27 neue Vorbereitungs-/Inventarprüfungen bestanden. Nachweis in der [lokalen Vorprüfung](vorpruefung-mvp-07.md) |
| R07-A2 · Quellenkonsolidierung | Erneuter abgegrenzter Quellenabgleich, konkret begründete Wiederverwendungen, Änderungsbefunde und Vorbehalte pro Referenz dokumentieren | [Am 8. Oktober 2026 durch David Steimer abgenommen](../fachrecht/abnahme-quellen-mvp07.md). 232 Referenzen, 204 mit frischen Belegen, 28 ausschliesslich begründete Wiederverwendung. Zwei Fassungsänderungen ohne neue Rechenregel und fortbestehende Vorbehalte sind umfasst. AI-Behandlung und ergänzende FR-Spiegelrolle bleiben unverändert. Vorgelegter Prüfstand mit 63 bestandenen isolierten Prüfungen nicht umgeschrieben |
| R07-B · Lokaler Release | Quellenregister und Nachweisereignis, kontrollierte Datenpromotion, Versions-/Pinbindung, definitive SPFx-, Mirror- und Webartefakte, lokale Prüfung der tatsächlichen Bytes | [Zusätzlich freigegeben](freigabe-r07-b.md) und [am 8. Oktober 2026 lokal abgeschlossen](releaseartefakte-mvp-07.md). Lokaler Datenpin `331ef3e19d43a6b51d91a502acd6b5443071599f`. Definitive Artefakte und vollständige lokale Prüfungen bestanden. Keine Veröffentlichung oder Installation |
| R07-C · E und Q | Konkrete Paketfreigabe, bestehende vier Instanzen, technische Matrix, reale Geräte-/Gastprüfung und manuelle Q-Abnahme | [Paket- und zielgebundene Installationsvorlage](eq-installationsvorlage-mvp07.md) sowie [Prüfmatrix](pruefmatrix-mvp07.md) erstellt. [Rückfall lokal ausgearbeitet](rueckfall-mvp07.md), Produkt und Pakete unverändert. H01 bleibt bis zum Entscheid über den vollständigen Wiederherstellungsweg und dessen Paket-/Hostnachweis offen. Frische Zielbestätigung und gesonderter Installationsauftrag bleiben erforderlich |
| R07-D · GitHub und P | Publikationsvorprüfung, veröffentlichter gebundener Quellstand, frische Sicherung, Hostingvorprüfung, Umschaltung und öffentliche Nachprüfung | Separate GitHub- und P-Freigaben. Neuer Head-/Get- und Cachebefund samt begrenztem Risikoentscheid vor P |

Ein wesentliches Arbeitspaket gleichzeitig, höchstens fünf Nettoarbeitstage je Teilpaket als Obergrenze. Die Trennung A1/A2 macht insbesondere den vergrösserten Quellenumfang nachvollziehbar. Technische Parallelprüfungen innerhalb A1 eröffnen keinen zweiten fachlichen Arbeitsstrang. David Steimer trifft die Entscheide in Personalunion. Codex erstellt Unterlagen und Nachweise ohne formelle Freigabe- oder Haftungsverantwortung.

## 3. Quellenprüfung und Datenpromotion

Der [Quellenprüfplan](../fachrecht/quellenpruefplan-mvp07.md) berücksichtigt nicht nur das Manifest, sondern auch Katalog, Verfahrensbindungen, Anknüpfungsregeln, zusätzliche Prozessregeln und Aktivierungsbelege. Das bisherige Argument «nur ergänzend im Katalog, nicht operativ» darf nicht ungeprüft auf MVP 0.7 übertragen werden. Vorhandene AP22-Belege können nur innerhalb ihres belegten Inhalts und ursprünglichen Prüfzeitpunkts wiederverwendet werden. Das Matrix-Abschlussdatum 8. Oktober ist kein neues Abrufdatum. Ein identischer Datei-Hash ist keine neue materielle Quellenprüfung.

Für die freigegebene Promotion gilt diese Reihenfolge:

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

R07-B ist aufgrund der [zusätzlichen Freigabe](freigabe-r07-b.md) lokal abgeschlossen. Die Quellenabnahme, der ursprüngliche A1-Inventarstand und der vorgelegte Quellenbericht bleiben unverändert. Der kontrolliert übernommene Release `2026-10-08-mvp-07-approved.1` enthält 41 Laufzeitdateien und ist lokal an den oben genannten Datencommit gebunden. Die StPO-/LU-Fassungsnachweise sind als gesonderte Brücken übernommen. Die [definitiven Artefakte](releaseartefakte-mvp-07.md) sind lokal geprüft, einschliesslich transparent dokumentierter Korrekturen historischer Testannahmen und einer Prüfhilfe ohne Produktänderung.

Die beauftragte [E-/Q-Installationsvorlage](eq-installationsvorlage-mvp07.md) liegt mit konkreter privater Zielbindung und [Prüfmatrix](pruefmatrix-mvp07.md) vor. Auf Davids anschliessenden Auftrag wurde der [Rückfall lokal ausgearbeitet](rueckfall-mvp07.md). Datenrückfall unter dem neuen Consumer und vollständiger Code-Rückfall bleiben getrennt. Der gezielte Reset kann die lokale Versionssperre beseitigen, behebt aber die alte globale AP5-Cachekollision nicht dauerhaft und belegt keinen SharePoint-Downgrade. Bevorzugter Folgeauftrag ist deshalb ein gesondert zu entscheidender Wiederherstellungskandidat mit höherer Paketversion, alter Fachlogik und sicherer Speicheranbindung. Noch kein solcher Kandidat gebaut. R07C-H01 bleibt offen, die bestehenden R07-B-Artefakte und Nachweise werden nicht umgeschrieben. Vor dem Katalogwechsel sind der vollständige Wiederherstellungsweg und die aktuellen Zielidentitäten zu bestätigen. Die Vorlage ist keine Installationsfreigabe. E/Q/P, GitHub, Outlook, Berechtigungen und Testapp-Bestände bleiben unverändert.
