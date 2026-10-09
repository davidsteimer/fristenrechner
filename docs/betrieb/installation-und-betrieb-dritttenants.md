# Fristenrechner Schweiz: Installation und Betrieb in Dritt-Tenants

| Merkmal | Stand |
| --- | --- |
| Dokumentzweck | Freischaltungsentscheid, Installation und Betrieb durch eine Microsoft-365-IT |
| Interner Produktstand | MVP 0.7, Paket `0.7.0.2`, vier bestehende E-/Q-Instanzen geprüft. Reale Geräteprüfung und Gastzugriff durch David bestätigt, Q am 9. Oktober 2026 abgenommen |
| Letzter dokumentierter öffentlicher Betriebsstand | MVP 0.6 gemäss Produktionsnachweis vom 1. Oktober 2026 |
| Publikationsstatus MVP 0.7 | Lokale Vorbereitung. GitHub und P brauchen eigene ausdrückliche Freigaben. Keine zusätzliche Dritt-Tenant-Installation freigegeben |
| Stand | 9. Oktober 2026 |
| Zielplattform | SharePoint Online, optional Microsoft Teams |

Diese Anleitung beschreibt die Installation des abgenommenen E-/Q-Paketstands und seines vollständigen Format-7-Mirrors. Sie ist kein Nachweis eines bereits geprüften Dritt-Tenants und erteilt selbst keine Installations-, Berechtigungs- oder Publikationsfreigabe. Der [aktuelle E-/Q-Vollzug](eq-vollzugsnachweis-mvp07-0702.md) und die [Q-Abnahme](abnahme-q-mvp07.md) behalten F08 als Anzeigeortabweichung und T09 als qualifizierte Wiederverwendung bei. Der [öffentliche Produktionsnachweis](produktionsbereitstellung-mvp06-2026-10-01.md) betrifft weiterhin MVP 0.6.

## 1. Entscheid für die IT in Kürze

Die Installation in einem anderen Microsoft-365-Tenant ist technisch vorgesehen. Die App wird als organisationsinterne SPFx-Lösung in den App-Katalog aufgenommen und auf den vorgesehenen SharePoint-Websites installiert.

- Keine Microsoft-Graph- oder sonstige Web-API-Zustimmung, keine Entra-ID-App-Registrierung und kein Clientgeheimnis.
- Keine eigene Server- oder Datenbankinfrastruktur. Client-Assets liegen im von SharePoint Online verwalteten `ClientSideAssets`-Speicher.
- Installation pro Zielwebsite, keine automatische Aktivierung auf allen Websites. Ein gemeinsames Paketupdate kann dennoch alle bereits verbundenen Instanzen erreichen.
- Wahlweise unveränderlich gepinnter öffentlicher GitHub-Datenrelease oder vollständiger tenantinterner SharePoint-Mirror.
- Lokale Berechnung und Kalenderdatei ohne Übermittlung der eingegebenen Fristdaten an einen Fachdienst.
- Quellcode unter AGPL-3.0-only. Weitere Inhalte behalten ihre ausgewiesenen Lizenzen.

## 2. Rollen und Voraussetzungen

| Aufgabe | Erforderliche Rolle oder Berechtigung |
| --- | --- |
| App-Katalog bereitstellen oder freigeben | SharePoint-Administrator |
| `.sppkg` hochladen und aktivieren | SharePoint-Administrator oder delegierte App-Katalog-Administration |
| App auf einer Zielwebsite installieren oder aktualisieren | Websitebesitzerin oder Websitebesitzer mit entsprechendem App-Recht |
| WebPart konfigurieren und Seite publizieren | Bearbeitungsrecht auf der Zielseite |
| Organisationsinterne Teams-App publizieren und zulassen | Teams-Administrator |
| Registerkarte hinzufügen oder konfigurieren | Berechtigung zur Registerkartenverwaltung im Zielteam |
| Mirror pflegen | Bearbeitungsrecht im vorgesehenen Bibliotheksordner |
| Rechner und Mirror verwenden | Leserecht auf Seite, Paketressourcen und sämtlichen Releaseartefakten |

Benötigt werden Microsoft 365 mit SharePoint Online, eine moderne Website und Seite sowie ein unterstützter Browser mit IndexedDB und lokalem Speicher. Benutzerdefinierte Skripts müssen nicht aktiviert werden, das WebPart hat `requiresCustomScript: false`. Für Teams sind eine zugehörige SharePoint-Website und die gezielte Zulassung der organisationsinternen App erforderlich. Der Netzwerkzugriff umfasst entweder den eigenen Mirror oder HTTPS zu `raw.githubusercontent.com`.

Für SharePoint und Teams gemeinsam wird ein Tenant-App-Katalog empfohlen. Bei reinem SharePoint-Betrieb auf einer einzelnen Site Collection kann ein Site-Collection-App-Katalog separat geprüft werden. SharePoint Server vor Ort ist nicht Gegenstand dieser Anleitung. Gastbetrieb erfordert eine eigene Prüfung im Zieltenant und ist nicht mit anonymem öffentlichen Zugriff gleichzusetzen.

## 3. Gebundenes Installationsartefakt

| Merkmal | Wert |
| --- | --- |
| Paket | [`fristenrechner-schweiz-0.7.0.2.sppkg`](../../outputs/release-mvp07-spfx-0.7.0.2-2026-10-09/artifacts/fristenrechner-schweiz-0.7.0.2.sppkg) |
| Anwendung / Paketversion | `0.7.0` / `0.7.0.2` |
| Grösse | 291’895 Bytes |
| SHA-256 | `8bae0c1ea64b4482abea8fcdbd7aa5c576f6d552735b5a3e5f01a9ea68ab71db` |
| Solution-ID | `13090feb-a6bf-40fa-9d3c-ec8d90516a60` |
| Component-ID | `596c7f1c-4d3e-4da8-a7be-27a96024f37c` |

Prüfung unter macOS oder Linux:

```bash
shasum -a 256 outputs/release-mvp07-spfx-0.7.0.2-2026-10-09/artifacts/fristenrechner-schweiz-0.7.0.2.sppkg
```

Prüfung unter Windows PowerShell:

```powershell
Get-FileHash .\outputs\release-mvp07-spfx-0.7.0.2-2026-10-09\artifacts\fristenrechner-schweiz-0.7.0.2.sppkg -Algorithm SHA256
```

Bei abweichender Version, Identität, Grösse oder Prüfsumme anhalten. Ein späterer Neubau ist wegen möglicher SPFx-Buildvarianz nicht automatisch dieses Artefakt. Der [Korrekturbaunachweis](darstellungskorrektur-mvp07-0702.md) bindet die tatsächlichen Paketbytes. Der allgemeine Standardpfad `spfx/sharepoint/solution/fristenrechner-schweiz.sppkg` ist kein Ersatz für diesen Nachweis und kein Rückfallpaket.

## 4. Installation in SharePoint Online

1. Konkretes Paket, Zielsites, Betriebsverantwortung und Rückfallweg separat freigeben. Vor einem Update den tatsächlichen App-Katalogbestand, alle bereits verbundenen Instanzen, ihre Datenkonfigurationen und den wiederherstellbaren Ausgangsstand erfassen.
2. Paket beziehen und Identität sowie SHA-256 prüfen. Eine externe Übergabe setzt die Freigabe und Verfügbarkeit ihres konkreten Dateiumfangs voraus. Für den GitHub-Modus muss der neue Pin bereits vollständig veröffentlicht und byteweise geprüft sein. Ein eigener Mirror ermöglicht eine gesondert freigegebene Installation vor der GitHub-Publikation.
3. Paket in den App-Katalog hochladen. Beim Ersatz des bestehenden Katalogeintrags eine byteidentische Bereitstellungskopie namens `fristenrechner-schweiz.sppkg` verwenden und deren Prüfsumme erneut prüfen.
4. Paket aktivieren. Gültigkeit, Bereitstellung und Fehlerfreiheit kontrollieren. Es darf keine neue API-Berechtigungsanforderung vorliegen.
5. App ausschliesslich auf den freigegebenen Zielwebsites installieren beziehungsweise aktualisieren. Keine automatische zusätzliche Siteinstallation auslösen.
6. Moderne Seite erstellen oder bestehende Zielseite öffnen, `Fristenrechner Schweiz` einfügen beziehungsweise vorhandenes WebPart bearbeiten.
7. Vollständige Datenquelle nach Abschnitt 6 konfigurieren. Seite publizieren und den tatsächlichen Host gemäss Abschnitt 8 prüfen.

Ein Paketupdate allein beweist weder eine Appaktualisierung jeder Site noch eine Datenumstellung. Bereits gespeicherte WebPart-Konfigurationen können unverändert bestehen bleiben. Wegen der gemeinsamen Codewirkung ist die Prüfung der übrigen verbundenen Instanzen vorzuplanen, einschliesslich bewusst historischer Datenansichten.

## 5. Zusätzliche Installation für Microsoft Teams

1. SharePoint-App auf der SharePoint-Website des Zielteams installieren beziehungsweise aktualisieren.
2. Teams-Bereitstellung des SPFx-Pakets im Tenant-App-Katalog auslösen. Alternativ das generierte Teams-Paket über den dokumentierten App-Katalog-Endpunkt beziehen und im Teams Admin Center als organisationsinterne App publizieren.
3. Vorhandene Produktregistrierung anhand der Component-ID gezielt aktualisieren. Falls dies nicht eindeutig möglich ist, anhalten und den Konflikt klären. Eine Entfernung von Katalogeinträgen ist kein automatischer Bestandteil dieser Anleitung.
4. Gezielt prüfen, dass die App für die freigegebenen Personen oder Gruppen zulässig ist. Keine pauschale Erweiterung von Richtlinien oder Berechtigungen.
5. Propagation abwarten, bis die App auffindbar ist. Im vorgesehenen Kanal die direkte App als Registerkarte hinzufügen beziehungsweise die bestehende konfigurieren.
6. Eigenen Mirror der Teamsite konfigurieren. Einen unerwünschten automatischen Kanalbeitrag vor dem Speichern deaktivieren.
7. Speichern und den tatsächlichen Host `Microsoft Teams` prüfen.

Eine SharePoint-Seite in der Teams-App `SharePoint` ist nur eine alternative Einbettung. Sie meldet `SharePoint Online` und ersetzt keinen Test der direkten `TeamsTab`-Integration. Die organisationsinterne App ist nicht im öffentlichen Teams Store verfügbar.

## 6. Datenquelle und SharePoint-Mirror

### 6.1 Variante A: öffentlicher GitHub-Release

Die MVP-0.7-Standardkonfiguration bindet folgenden vollständigen Commit:

```text
https://raw.githubusercontent.com/davidsteimer/fristenrechner/331ef3e19d43a6b51d91a502acd6b5443071599f/data/releases/2026-10-08-mvp-07-approved.1
```

**Dieser neue Datenpin ist noch nicht als MVP 0.7 veröffentlicht.** Vor seiner Aktivierung müssen die gesonderte GitHub-Freigabe, die Veröffentlichung und der Rohbytevergleich aller 41 Laufzeitdateien erfolgt sein. E/Q verwenden vorher ihre vollständigen eigenen Mirrors. Ein unerreichbarer Pin rechtfertigt weder `main` als Ersatz noch die Verwendung eines fremden oder alten Caches als erfolgreichen Erstabruf.

Im GitHub-Modus muss das Zielnetz HTTPS zu `raw.githubusercontent.com` erlauben. Eingegebene Fristdaten werden nicht an GitHub übermittelt.

### 6.2 Variante B: tenantinterner SharePoint-Mirror

Der Mirror muss auf derselben SharePoint-Website liegen wie die jeweilige App-Instanz. Für eine direkte Teams-Registerkarte ist dies die SharePoint-Website des Teams. Ein Ordner auf einer anderen Site Collection ist nicht zulässig.

Der Release `2026-10-08-mvp-07-approved.1` verwendet Manifest/Mindestconsumer `7.0.0`, alle Regelkalender `3.0.0`, Feiertagskatalog `2.0.0`, Rechtsprofile `1.0.0`, Spezialregimekatalog `3.0.0` und Sozialverfahrenskatalog `2.0.0`. Der vollständige Mirror besteht aus **41 Dateien**, nicht mehr elf. Manifest SHA-256: `fe1dfa0a241ac1c0e083998f05fb43e058f3c1be223f35cd276d3df436941597`.

Beispiel eines später zielbezogen freizugebenden Releaseordners:

```text
/sites/Rechtsdienst/Freigegebene Dokumente/Fristenrechner/releases/2026-10-08-mvp-07-approved.1
```

Folgende Pfade liegen relativ zu diesem Ordner vor. Die Liste wurde gegen das tatsächliche Manifest und das Mirrorarchiv geprüft. Sie enthält Manifest, 32 Kalender, fünf Profile und drei Kataloge:

```text
manifest.json
calendars/ap22-ag-21d6f2634ce0.json
calendars/ap22-ai-5d4e5a68e106.json
calendars/ap22-ai-f507435d8aa8.json
calendars/ap22-ar-88bb22c08a22.json
calendars/ap22-bl-72f1a7e0fcf8.json
calendars/ap22-bs-39a64bdfc0fe.json
calendars/ap22-fr-7d8c38f7c610.json
calendars/ap22-ge-a36ff7926d08.json
calendars/ap22-gl-87c11e156541.json
calendars/ap22-gr-bf0366c8eda2.json
calendars/ap22-ju-b096c09f506c.json
calendars/ap22-lu-55514cd91f06.json
calendars/ap22-lu-b879eb8eb04f.json
calendars/ap22-ne-027ceadbf103.json
calendars/ap22-ne-21f519039621.json
calendars/ap22-nw-5dfca484e4af.json
calendars/ap22-ow-76c151dccf1f.json
calendars/ap22-sg-79009d6d6021.json
calendars/ap22-sg-f95068e3b162.json
calendars/ap22-sh-1ccc70f9897a.json
calendars/ap22-sh-ec7d0988145a.json
calendars/ap22-so-3f5f7b7f54f5.json
calendars/ap22-sz-ec9f2c557fe4.json
calendars/ap22-tg-3d6514fbabb1.json
calendars/ap22-ti-944ed0286e9a.json
calendars/ap22-ur-67275ff3e872.json
calendars/ap22-vd-26f452ff34ee.json
calendars/ap22-vs-6c002f32b1b0.json
calendars/ap22-zg-860e0f8e0e1a.json
calendars/ap22-zh-5aa2974cffee.json
calendars/be-public-holidays.json
calendars/ch-federal-calendar.json
holiday-catalogs/ch-holiday-catalog.json
profiles/bgg.json
profiles/stpo.json
profiles/vrpg-be.json
profiles/vwvg.json
profiles/zpo.json
social-procedures/ch-social-procedures.json
special-regimes/vrpg-be.json
```

Das [Mirror-ZIP](../../outputs/release-mvp07-2026-10-08/artifacts/fristenrechner-mvp07-sharepoint-mirror.zip) umfasst 218’372 Bytes, SHA-256 `ed603938f86849aec55dd5cdc83c300a8ae6437e4bb8eb62f3d7b5fa7e6753ca`. Es enthält die 41 Dateien direkt ab Archivwurzel. Die unverpackten Dateien umfassen zusammen 2’362’261 Bytes. Das ZIP ist in den neuen Releaseordner zu entpacken und darf nicht als Laufzeitquelle eingetragen werden. `README.md`, Quellenrohbelege und Governance-Dateien gehören nicht in den Laufzeitmirror. Ein Git-Push erzeugt zudem nicht automatisch einen GitHub-Release-Anhang.

Einrichtung:

1. Neuen versionsbezogenen Ordner in einer Dokumentbibliothek der Zielwebsite anlegen. Bestehende Releaseordner unverändert erhalten.
2. Alle 41 Dateien mit genau diesen Namen und relativen Pfaden hochladen. Keine Katalogauszüge, keine Mischung alter und neuer Komponenten.
3. Die tatsächlich hochgeladenen Rohbytes vollständig zurücklesen und gegen Manifest sowie freigegebenes Inventar vergleichen. Leserecht auf sämtlichen Dateien und erforderlichen Ordnern prüfen.
4. WebPart beziehungsweise Teams-Registerkarte bearbeiten. `Aktiver Provider` auf `SharePoint-Mirror` setzen und `SharePoint-Mirrorpfad` auf den neuen serverrelativen Releaseordner einstellen. Massgebend ist der echte Bibliotheks-URL-Pfad, nicht ein übersetzter Anzeigename.
5. Konfiguration speichern, nötigenfalls die Seite publizieren, dann neu laden. Den sichtbaren Provider und Release sowie den tatsächlichen Erstabruf sämtlicher 41 Dateien aus genau diesem Mirror prüfen.

Zulässig sind ein serverrelativer Pfad ab `/` oder eine vollständige HTTPS-Adresse desselben Ursprungs, jeweils innerhalb der aktuellen SharePoint-Website. Zugangsdaten, Abfrageparameter, Fragmente, `.`-/`..`-Segmente, andere Ursprünge oder andere Sites sind unzulässig. Die Anwendung aktiviert erst den vollständig schema-, referenz-, grössen- und hashgeprüften Release.

Der Cache ist an die tatsächliche Provider-/Datenkonfiguration gebunden. Beim Quellenwechsel muss die neue Quelle erstmals erfolgreich geladen werden. Ein anderer Mirror, AP5 oder ein alter originweiter Aktivzeiger ist kein Fallback. Ein Fehler ohne gültigen Aktivstand derselben Konfiguration sperrt die Berechnung. Dies ist kein Anlass für einen pauschalen Browserdatenreset.

### 6.3 Mirror-Update und kontrollierter Rückfall

Der MVP-0.6-Consumer kann Format 7 nicht lesen. Beim Wechsel gilt:

1. Ausgangslage frisch erfassen und sichern, Rückfallpaket und Reihenfolge konkret freigeben.
2. Neuen vollständigen Release in neue Ordner hochladen und Rohbytes sowie Rechte aller betroffenen Instanzen prüfen.
3. Erst danach das freigegebene Format-7-fähige Paket aktualisieren. Die gemeinsame Codewirkung auf andere verbundene Instanzen berücksichtigen.
4. Je Instanz nur die konkret freigegebene Datenkonfiguration umstellen, speichern beziehungsweise publizieren und anhand sichtbarer Datenquelle, Rohabruf und Referenzfällen prüfen.
5. Vollständige Hostmatrix und manuelle Abnahme durchführen. Frühere Releaseordner, Konfigurationen und Sicherungen unverändert aufbewahren.

Für den bestehenden steimer.ch-E-/Q-Stand ist der Rückfall auf MVP-0.6-Funktionalität in der [gebilligten Vorlage für 0.7.0.2](eq-installationsvorlage-mvp07-0702.md) konkret gebunden. Er verwendet **`fristenrechner-schweiz-recovery-0.7.0.3.sppkg`**, SHA-256 `9490890245e8aad54a5ec5eae731a0ee895f9fc9439dec19b371315085794702`, und die gesicherten Format-6-Mirrors `2026-10-01-mvp-06-approved.1`. Deren Manifest SHA-256 lautet `637cfc03c777f350031ba6c28676c685c16f25733391e1f25b0a3580016f5724`.

Die Reihenfolge ist verbindlich: zuerst die vier aktuellen Instanzen auf ihre gesicherten Format-6-Pfade zurückstellen, AP5-Pins unangetastet lassen. Danach das höher versionierte Recoverypaket kontrolliert im gemeinsamen Katalog und auf den vier bestehenden Apps anwenden. Paket-/Bundlebytes, vier aktuelle Hosts und AP5 anschliessend prüfen. Gemeinsame Standards bleiben geschützt, eigene Recovery-Testwerte werden getrennt behandelt und gezielt zurückgenommen. **Kein Browserdatenreset, keine Deinstallation und kein unkontrollierter alter Consumer an Format-7-Daten.**

Das [Recoverypaket](wiederherstellungskandidat-mvp07-0703.md) ist lokal anhand seiner tatsächlichen Bytes geprüft, aber nicht eingesetzt. Es setzt den Funktionsumfang auf MVP 0.6 zurück. Eine spätere reguläre MVP07-Wiederaufnahme benötigt erneut eine höhere Paketversion, nicht den Downgrade auf `0.7.0.2`. Die steimer.ch-Freigabe ist keine Vollzugserlaubnis in einem anderen Tenant. Dort sind eigener Bestand, Berechtigungen, Sicherungen und Rückfallweg neu zu binden.

### 6.4 Governance-Nachweis separat spiegeln

Quellenregister, Prüfindex und unveränderliche Prüfereignisse können in einem parallelen Ordner `source-reviews/` gespiegelt werden. Der WebPart-Pfad bleibt auf `releases/<releaseId>` eingestellt. Governance-Dateien sind keine Laufzeitdatenquelle und dürfen die freigegebenen Releasebytes nicht verändern.

## 7. Betrieb und fachlicher Umfang

Der Regelbetrieb umfasst Quellenverfügbarkeit, kontrollierte Releaseübernahme, jährliche fachliche Quellenprüfung spätestens am 15. November und anlassbezogene Prüfungen, dokumentierte Zuständigkeiten sowie Referenz- und Zielumgebungstests nach Updates. Keine automatische jährliche Publikation oder Mirror-Synchronisation wird zugesichert. Eine Quellenprüfung ohne regelrelevante Änderung erzeugt bewusst keinen neuen Datenrelease. Der [AP13-Prozess](periodische-quellenpruefung-ap13.md) und die [Release-Checkliste](release-checkliste.md) bleiben massgebend.

MVP 0.7 führt 198 Herkunftsentscheide, 104 konkrete Verfahrensbindungen und 32 Kalender. Der Feiertagskatalog enthält 491 Regeln, einschliesslich zwölf zusätzlicher SO-Prozessregeln. Die nationale Kalenderaktivierung betrifft die unterstützten Bundesverfahren StPO, ZPO, BGG und VwVG. Sie schaltet weder weitere kantonale Verwaltungsverfahren noch ausserbernische Sozialverfahren frei. Die 44 Sozialregeln und 50 BE-Anbindungen bleiben unverändert, mit Freigabe für Bern und 2026–2027.

Die Kalenderabdeckung beginnt am 29. August 2026 ohne pauschale Jahresobergrenze. Normen, Gebietsstände, Profil- und Releasegrenzen bleiben massgebend. Vier unsichere Januarzuordnungen werden mit zwei vollständigen Berechnungen geprüft. Unterschiedliche rechtliche Ergebnisse sperren definitiven Fristablauf und Export. GR-/NE-Vorbehalte bleiben getrennte berechenbare Grenzen. Die beschlossene AI-Behandlung und der gekennzeichnete ergänzende Freiburger Praxisbeleg bleiben erhalten. Eigenständiges kommunales Recht ist ausgeschlossen. Örtliche Differenzierungen aus Bundes- und kantonalem Recht sind nur im freigegebenen Umfang enthalten.

Codeupdates werden mit unveränderter Produktidentität und höherer Paketversion ausgeliefert. Vor einem Toolchain-Upgrade ist die Microsoft-Kompatibilitätsmatrix zu prüfen. Veränderungen von Teams-Manifest oder Exposition verlangen eine gesonderte Teams-Katalogprüfung. Die bestehenden MVP07-Quellen- und E-/Q-Abnahmen ersetzen keine spätere neue Rechts- oder Zielumgebungsprüfung.

## 8. Zielbezogener Abnahmetest

Die folgende Kurzliste ist eine Installationshilfe, nicht eine bereits erteilte Abnahme des Zieltenants. Die vollständigen qualifizierten Eingaben und Sollwerte stehen in der [MVP07-Hauptmatrix](pruefmatrix-mvp07.md). Historische Statuszeilen werden durch den [0.7.0.2-Vollzugsnachweis](eq-vollzugsnachweis-mvp07-0702.md) und die [Q-Abnahme](abnahme-q-mvp07.md) ergänzt.

- [ ] Paketidentität und tatsächliche Bytes stimmen, Katalog und Site-App fehlerfrei, keine API-Zustimmung.
- [ ] Jede Instanz lädt den richtigen Provider und Release. Alle 41 Dateien werden aus der konkreten neuen Quelle geprüft, nicht aus einem fremden Cache übernommen.
- [ ] F01 mit ausdrücklich gesetzter Rolle «Partei ohne Vertretung» und Feiertagskanton BE: StPO, Empfang 16.09.2026, zehn Tage → 28.09.2026.
- [ ] F02 mit derselben Rolle und Feiertagskanton TI: StPO, Empfang 07.12.2026, ein Tag → 09.12.2026.
- [ ] Vier Januargrenzen, regionale NE-/AI-Qualifikation, GR-Vorbehalt, ZPO-Gerichtssitz und fehlende Fallfakten verhalten sich gemäss F03 bis F07. Kein stiller Ersatzkalender.
- [ ] Berner Spezialrecht und Sozialgrenzen gemäss F08/F09 stimmen. EOG-Zuständigkeitsdatum, AVIG-Datum der ursprünglichen Kassenverfügung und beschaffungsrechtlicher Verfahrensbeginn bleiben unabhängige Datumsrollen.
- [ ] DE/FR, frühe Datumseingabe, vollständige und kurze Datumsformate, ungültige Daten, optionaler Kalender sowie sofortige Invalidierung von Resultat und Export funktionieren.
- [ ] v3-Standards migrieren ohne erfundene Fakten. Erst ausdrückliches Speichern erzeugt v4. Datum, Referenz, Resultat und fallbezogene Regionalantwort werden nicht gespeichert. Eigene Testwerte gezielt zurücknehmen, fremde Standards schützen.
- [ ] Schmale und breite Hostansicht, lange offene und geschlossene Dropdowntexte, nativer 200-Prozent-Zoom und Tastaturfokus sind geprüft. Reale Geräteprüfung bleibt ein eigener Nachweis.
- [ ] Direkte Teams-Registerkarte meldet `Microsoft Teams`. Notwendige Gastprüfung erfolgt mit dem tatsächlich freigegebenen Gastkonto.
- [ ] DE-/FR-Kalenderdateien je aktuellem Host tatsächlich speichern und prüfen. Ganztägiger Beginn, exklusiver Folgetag, `TRANSP:TRANSPARENT`, Kategorie `Fristablauf`, Erinnerung `-PT112H`, UTF-8 und Zeilenfaltung stimmen. Ein Exportklick allein genügt nicht.
- [ ] Fehler der neuen Quelle erlauben keinen fremden Cache. Nach Entfernen nur der eigenen lokalen Testbedingung funktioniert der Wiederanlauf. Keine freigegebenen Mirrordateien manipulieren und keine Browserdaten pauschal löschen.
- [ ] Historische Datenansichten behalten ihre eigenen Pins und Daten. Neue Codeversion und historische Datenfreigabe werden getrennt geprüft.

Auf den bestehenden steimer.ch-E-/Q-Hosts sind acht tatsächliche ICS-Dateien geprüft. Es wurde kein neuer Outlook-Import durchgeführt. Der [Wiederverwendungsvorschlag](outlook-wiederverwendung-mvp07.md) bindet frühere Importnachweise und den unveränderten Terminvertrag, ist aber noch kein Wiederverwendungsentscheid für MVP 0.7. Kategorie und ICS-Erinnerung allein beweisen weder dunkelgrüne Darstellung im Zielkonto noch tatsächliche Erinnerungszustellung. Neue Outlook-Importe brauchen einen gesonderten Auftrag.

Die menschliche Geräte-/Gastbestätigung und Q-Abnahme sind von den technischen Eigentümerprüfungen getrennt. F08 bleibt als abweichender Anzeigeort der Release-ID im Seitenfuss dokumentiert. T09 verwendet frühere E-/AP5-Belege und N04, ohne einen neuen vollständigen AP5-Netzabruf zu behaupten. Diese Grenzen werden weder für einen Dritt-Tenant noch für eine künftige P-Prüfung stillschweigend aufgehoben.

## 9. Vor Produktivsetzung festzulegen

- Verantwortliche Stelle für Paket-/Mirrorübernahme, Quellenprüfung, Störungen und Freigaben.
- Zielsites, Teams und Personenkreis sowie ausdrücklich erlaubter Gastzugriff.
- Aufbewahrung und geprüfter Rückfallweg, einschliesslich gemeinsamer Paketwirkung und Schutz persönlicher Standards.
- Zielbezogene technische und manuelle Abnahme, ohne automatische Übernahme fremder Tenantnachweise.

Der bestehende steimer.ch-Q-Betrieb folgt dem [gruppenbasierten Zugriffsmodell](q-demobetrieb-ap15-betriebsanweisung.md). Die Q-Abnahme erweitert weder Gastkreis noch M365-Rechte. Im Zieltenant müssen Site, Team, Mirror und Paketressourcen einschliesslich Widerruf eigenständig geprüft werden. Die Fachverantwortung und Freigabe liegen in der aktuellen Einpersonenphase bei David Steimer. Codex ist dokumentiertes KI-Arbeitsinstrument ohne formelle Freigabe- oder Haftungsverantwortung.

## 10. Referenzen

- [Microsoft: SharePoint-App-Katalog](https://learn.microsoft.com/en-us/sharepoint/use-app-catalog)
- [Microsoft: Site-Collection-App-Katalog](https://learn.microsoft.com/en-us/sharepoint/dev/general-development/site-collection-app-catalog)
- [Microsoft: SPFx in Teams](https://learn.microsoft.com/en-us/sharepoint/dev/spfx/deployment-spfx-teams-solutions)
- [Microsoft: Benutzerdefinierte Teams-Apps](https://learn.microsoft.com/en-us/microsoftteams/teams-custom-app-policies-and-settings)
- [Technische Kurzdokumentation](../architektur/technische-kurzdokumentation.md)
- [MVP-0.7-Deploymentplan](deployment-mvp-07.md)
- [Ursprünglicher MVP-0.7-Artefaktnachweis](releaseartefakte-mvp-07.md)
- [Korrekturpaket 0.7.0.2](darstellungskorrektur-mvp07-0702.md)
- [Gebundene Installations- und Rückfallvorlage](eq-installationsvorlage-mvp07-0702.md)
- [Aktueller E-/Q-Vollzugsnachweis](eq-vollzugsnachweis-mvp07-0702.md)
- [Q-Abnahme und Grenzen](abnahme-q-mvp07.md)
- [Quellenabnahme MVP 0.7](../fachrecht/abnahme-quellen-mvp07.md)
- [Öffentlicher MVP-0.6-Produktionsstand](produktionsbereitstellung-mvp06-2026-10-01.md)
- [Sicherheitsrichtlinie](../../SECURITY.md)
