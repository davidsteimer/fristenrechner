# Fristenrechner Schweiz Installation und Betrieb in Dritt-Tenants

| Merkmal | Stand |
| --- | --- |
| Dokumentzweck | Freischaltungsentscheid, Installation und Betrieb durch eine Microsoft-365-IT |
| Interner Produktstand | MVP 0.9, Paket `0.9.0.0`, vier bestehende E-/Q-Instanzen. Q, Geräteprüfung, Gastzugriff und begrenzte Outlook-Wiederverwendung am 19. Oktober 2026 bestätigt |
| Letzter dokumentierter öffentlicher Betriebsstand | MVP 0.8 gemäss Produktionsnachweis vom 16. Oktober 2026, keine neue Liveinventur |
| Publikationsstatus MVP 0.9 | Lokale Vorbereitung. GitHub und P bleiben gesondert freizugeben |
| Stand | 19. Oktober 2026 |
| Zielplattform | SharePoint Online, optional Microsoft Teams |

Diese Anleitung bindet das abgenommene E-/Q-Paket und seinen Format-9-Mirror. Sie ist kein Nachweis eines geprüften Dritt-Tenants und erteilt keine Installations-, Berechtigungs- oder Publikationsfreigabe. [Vollzugsnachweis](eq-vollzugsnachweis-mvp09.md) und [Q-Abnahme](abnahme-q-mvp09.md) dokumentieren den bestehenden steimer.ch-E-/Q-Betrieb. Der [öffentliche Produktionsnachweis](produktionsbereitstellung-mvp08-2026-10-16.md) betrifft MVP 0.8.

## 1 Entscheid für die IT

Die Installation in einem anderen M365-Tenant ist technisch vorgesehen. Die organisationsinterne SPFx-Lösung wird im App-Katalog aufgenommen und auf den freigegebenen SharePoint-Websites installiert.

- Keine Microsoft-Graph- oder sonstige Web-API-Zustimmung, keine Entra-ID-App-Registrierung und kein Clientgeheimnis.
- Keine eigene Server- oder Datenbankinfrastruktur. Client-Assets liegen im SharePoint-Speicher `ClientSideAssets`.
- Installation pro Zielwebsite. Ein gemeinsames Paketupdate kann dennoch alle bereits verbundenen Instanzen erreichen.
- Wahlweise fest gepinnter veröffentlichter GitHub-Datenrelease oder vollständiger tenantinterner SharePoint-Mirror.
- Berechnung und Kalenderdatei erfolgen lokal, ohne Übermittlung eingegebener Fristdaten an einen Fachdienst.
- Quellcode AGPL-3.0-only. Weitere Inhalte behalten ihre ausgewiesenen Lizenzen.

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

## 3 Gebundenes Installationsartefakt

| Merkmal | Wert |
| --- | --- |
| Paket | [`fristenrechner-schweiz-0.9.0.0.sppkg`](../../outputs/release-mvp09-2026-10-18/fristenrechner-schweiz-0.9.0.0.sppkg) |
| Anwendung / Paketversion | `0.9.0` / `0.9.0.0` |
| Grösse | 327’130 Bytes |
| SHA-256 | `7a88f0f8f579c050e8354f8e741921251135bff804318f86dc1b34c1a12cc331` |
| Solution-ID | `13090feb-a6bf-40fa-9d3c-ec8d90516a60` |
| Component-ID | `596c7f1c-4d3e-4da8-a7be-27a96024f37c` |

Prüfung unter macOS oder Linux:

```bash
shasum -a 256 outputs/release-mvp09-2026-10-18/fristenrechner-schweiz-0.9.0.0.sppkg
```

Prüfung unter Windows PowerShell:

```powershell
Get-FileHash .\outputs\release-mvp09-2026-10-18\fristenrechner-schweiz-0.9.0.0.sppkg -Algorithm SHA256
```

Bei abweichender Version, Identität, Grösse oder Prüfsumme anhalten. Ein späterer Neubau ist nicht automatisch dieses Artefakt. Der [MVP09-Artefaktnachweis](releaseartefakte-mvp-09.md) bindet die tatsächlichen Paketbytes. Der Standardpfad `spfx/sharepoint/solution/fristenrechner-schweiz.sppkg` ist kein Ersatz für diesen Nachweis und kein Rückfallpaket.

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

## 6 Datenquelle und SharePoint-Mirror

### 6.1 Variante A öffentlicher GitHub-Release

Die MVP09-Standardkonfiguration bindet den vollständigen lokalen Datencommit:

```text
https://raw.githubusercontent.com/davidsteimer/fristenrechner/0ccc4b9178503ede051964149a4b17efab8d0cf9/data/releases/2026-10-18-mvp-09-approved.1
```

**Der neue Datenpin ist noch nicht veröffentlicht und nicht öffentlich als abrufbar bestätigt.** Vor Aktivierung sind die gesonderte Freigabe, Veröffentlichung und der Rohbytevergleich aller 42 Laufzeitdateien erforderlich. Ein freigegebener eigener Mirror ermöglicht eine Installation vor der GitHub-Publikation. Ein unerreichbarer Pin rechtfertigt weder `main` noch einen fremden oder alten Cache als Ersatz.

Im GitHub-Modus muss das Zielnetz HTTPS zu `raw.githubusercontent.com` erlauben. Eingegebene Fristdaten werden nicht an GitHub übermittelt.

### 6.2 Variante B tenantinterner SharePoint-Mirror

Der Mirror muss auf derselben SharePoint-Website liegen wie die Instanz. Bei einer direkten Teams-Registerkarte ist dies die SharePoint-Website des Teams. Cross-Site-Pfade sind unzulässig.

Release `2026-10-18-mvp-09-approved.1` verwendet Manifest/Mindestconsumer `9.0.0`, Verwaltungsverfahrenskatalog `2.0.0`, Kalender `3.0.0`, Feiertagskatalog `2.0.0`, Rechtsprofile `1.0.0`, Spezialregimekatalog `3.0.0` und Sozialverfahrenskatalog `2.0.0`. Manifest SHA-256: `3c929779803ceb6bcbf56d44d9a2aad8ece730d916a39ab44016c118bcec2265`.

Beispiel eines zielbezogen freizugebenden Releaseordners:

```text
/sites/Rechtsdienst/Freigegebene Dokumente/Fristenrechner/releases/2026-10-18-mvp-09-approved.1
```

Der vollständige Mirror enthält **42 Dateien**: Manifest, 32 Kalender, fünf Profile und vier Kataloge. Die gegen das tatsächliche Manifest geprüften relativen Pfade lauten:

```text
manifest.json
administrative-procedures/ch-cantonal-administrative-procedures.json
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

Das [Mirror-ZIP](../../outputs/release-mvp09-2026-10-18/fristenrechner-mvp09-sharepoint-mirror.zip) umfasst 235’314 Bytes, SHA-256 `13ef7f69f555604d987385132eb4ca38ef62b3e7572023ec2310b41de817c73a`. Es enthält die 42 Dateien direkt ab Archivwurzel, entpackt zusammen 2’508’592 Bytes. Das ZIP wird in den neuen Releaseordner entpackt, nicht als Laufzeitquelle eingetragen. `README.md`, Rohbelege und Governance-Dateien gehören nicht in den Laufzeitmirror. Ein Git-Push erzeugt keinen GitHub-Release-Anhang.

1. Neuen versionsbezogenen Ordner in einer Bibliothek der Zielwebsite anlegen. Bestehende Releases erhalten.
2. Alle 42 Dateien mit exakten Namen und relativen Pfaden hochladen. Keine Katalogauszüge oder Mischung alter und neuer Komponenten.
3. Hochgeladene Rohbytes vollständig zurücklesen und mit Manifest sowie freigegebenem Inventar vergleichen. Leserechte auf Dateien und erforderlichen Ordnern prüfen.
4. Bei bereits Format-9-fähigem Paket den `Aktiven Provider` auf `SharePoint-Mirror` und den `SharePoint-Mirrorpfad` auf den neuen Ordner setzen. Den echten Bibliotheks-URL-Pfad verwenden, nicht einen übersetzten Anzeigenamen.
5. Speichern, nötigenfalls Seite publizieren und neu laden. Sichtbaren Provider/Release und tatsächlichen Erstabruf aller 42 Dateien aus genau diesem Mirror prüfen.

Zulässig sind serverrelative Pfade ab `/` oder HTTPS-Adressen desselben Ursprungs innerhalb der aktuellen Website. Zugangsdaten, Queryparameter, Fragmente, Punktsegmente, andere Ursprünge und andere Sites werden abgewiesen. Aktiviert wird nur der vollständig schema-, referenz-, grössen- und hashgeprüfte Release.

Der Cache bindet die tatsächliche Provider-/Datenkonfiguration. Eine neue Quelle muss erstmals erfolgreich laden. Andere Mirrors, AP5 oder ein alter originweiter Aktivzeiger sind kein Fallback. Ohne gültigen Aktivstand derselben Konfiguration bleibt der Rechner gesperrt. Kein pauschaler Browserdatenreset.

### 6.3 Mirror-Update und kontrollierter Rückfall

Ein MVP08-Consumer kann Format 9 nicht lesen. Die Reihenfolge lautet:

1. Bestand, verbundene Verbraucher und Konfigurationen frisch sichern. Konkreten Rückfall freigeben.
2. Vollständige neue Mirrors hochladen und Rohbytes sowie Rechte prüfen.
3. Das freigegebene Format-9-fähige Paket kontrolliert bereitstellen. Die gemeinsame Codewirkung berücksichtigen.
4. Je freigegebener Instanz nur den gebundenen Datenpfad umstellen und speichern beziehungsweise publizieren.
5. Tatsächliche Hostprüfung und manuelle Abnahme durchführen. Frühere Daten und Sicherungen erhalten.

Der bestehende steimer.ch-Rückfall ist durch [Freigabe](freigabe-r09-c.md) und [Rückfallvorlage](rueckfall-mvp09.md) gebunden. Er verwendet **`fristenrechner-schweiz-recovery-0.9.0.1.sppkg`**, SHA-256 `08c5e67e535cd3e04d962698e7dcb6bbe989f098d75f2b21aebe3226d95db94d`, und stellt MVP08-Funktionalität wieder her. Die gesicherten Format-8-Mirrors enthalten `2026-10-15-mvp-08-approved.1`, je 42 Dateien, Manifest SHA-256 `2461f06c0a7d79dcd6a177fc116f08fcc0efa62e03b38ba6ac87964457c19aa4`.

**Zuerst alle bereits umgestellten aktuellen Ansichten unter dem regulären MVP09-Code auf ihre eigenen Format-8-Pfade zurückführen.** Erst nach Bestätigung, dass keine dieser Ansichten mehr Format 9 benötigt, das höhere Recoverypaket kontrolliert einsetzen. AP5-Pins bleiben erhalten. Danach Paket, Bundle, aktuelle Hosts, AP5 und Standardschutz prüfen. Keine Deinstallation, kein Browserdatenreset und kein ungeprüfter Paketdowngrade.

Recovery wurde nicht eingesetzt. Eine reguläre MVP09-Wiederaufnahme braucht danach einen höheren geprüften Paketstand, mindestens `0.9.0.2`, keinen Downgrade auf `0.9.0.0`. Die steimer.ch-Freigabe ist keine Vollzugserlaubnis in einem Dritt-Tenant. Bestand, Rechte, Sicherungen und Rückfall sind dort neu zu binden.

### 6.4 Governance separat spiegeln

Quellenregister, Prüfindex und unveränderliche Prüfereignisse können separat in `source-reviews/` liegen. Der WebPart bleibt auf `releases/<releaseId>` eingestellt. Governance-Dateien sind keine Laufzeitquelle und dürfen freigegebene Releasebytes nicht verändern.

## 7 Betrieb und fachlicher Umfang

Der Betrieb umfasst Quellenverfügbarkeit, kontrollierte Releaseübernahme, jährliche fachliche Quellenprüfung spätestens am 15. November sowie anlassbezogene Prüfungen, Zuständigkeiten und Zielumgebungstests. Keine automatische jährliche Publikation oder Mirrorsynchronisation. Eine Prüfung ohne Regeländerung erzeugt keinen neuen Datenrelease. [AP13-Prozess](periodische-quellenpruefung-ap13.md) und [Release-Checkliste](release-checkliste.md) bleiben massgebend.

MVP 0.9 umfasst 25 kantonale Verwaltungswege: TI fünf, GR sieben, LU vier, ZG vier und AR fünf. LU ist ab 27.09.2026, ZG und AR ab 29.08.2026 gedeckt, jeweils einschliesslich aller benötigten Berechnungstage bis 31.12.2027. Die bisherigen TI-/GR-Fenster und TI-O2 bleiben erhalten. AR-O1 sperrt die vorbehaltene Konstellation. Die 44 Sozialregeln und 50 BE-Anbindungen bleiben ausschliesslich für Bern und 2026–2027 freigegeben. Alle berechnungsrelevanten Tage müssen abgedeckt sein. Fehlende Fallqualifikation und nicht modelliertes Spezialrecht sperren Ergebnis und Export. Die TI-O2-Sperre betrifft die Konstellation, in der eine Endverschiebung in einen neuen Fristenstillstand führt. GR-Verwaltung und Gericht sowie ausdrückliche gerichtliche Dringlichkeit werden unterschieden. Die Feiertagsanknüpfung wird aus dem Sitz der zuständigen kantonalen Stelle bestimmt.

Die 32 Kalender, 104 Bundesverfahrensbindungen und 491 Feiertagsregeln bleiben erhalten. Die nationale Abdeckung betrifft unterstützte Bundesverfahren, nicht jedes kantonale Verfahren. 44 Sozialregeln und 50 BE-Anbindungen bleiben ausschliesslich für Bern und 2026–2027 freigegeben. Januargrenzen, AI-Behandlung, GR-/NE-Vorbehalte und begrenzter Freiburger Praxisbeleg bleiben bestehen. Eigenständiges kommunales Recht bleibt ausgeschlossen. DE/FR sind die Produktsprachen. Einzelheiten stehen in den [Releasehinweisen](release-notes-mvp09.md).

Bei Format 9 werden Standards v4 ohne erfundene Fallfakten nach v5 migriert, möglicherweise bereits beim ersten Laden. Der ältere Schlüssel bleibt erhalten. Datum, Referenz, Resultat, konkrete Qualifikation und Dringlichkeit werden nicht gespeichert. Ein v5-Resetmarker verhindert Wiederaufleben alter Standards. Vor Tests beide Schlüssel im tatsächlichen Speicherkontext sichern. Nur eigene Testwerte bereinigen, fremde Präferenzen schützen.

## 8 Zielbezogener Abnahmetest

Die folgende Liste ist eine Installationshilfe, keine Abnahme des Zieltenants. Vollständige Fälle und Sollwerte stehen in der [MVP09-Matrix](pruefmatrix-mvp09.md). Deren ursprünglicher Vorlagenstatus wird durch [Vollzug](eq-vollzugsnachweis-mvp09.md) und [Q-Abnahme](abnahme-q-mvp09.md) ergänzt.

- [ ] Paketidentität, Bytes, Katalog-/Site-Appversion und Fehlerfreiheit stimmen. Keine zusätzliche API-Zustimmung.
- [ ] Provider, Release und alle 42 neuen Rohdateien je Instanz sind korrekt. Erstabruf nicht mit warmem oder fremdem Cache verwechseln.
- [ ] 25 TI-/GR-/LU-/ZG-/AR-Pfade und zusätzliche zulässige Stadien gemäss A01–A25. Beispiel A01: TI, LPAmm, Verwaltungsbeschwerde, ordentlich, allgemeiner Fall mit tatsächlichem Empfang 02.10.2026 → 02.11.2026.
- [ ] TI-O2, GR-Stillstand/Dringlichkeit, fehlende Fallfakten, gesetzliche/freie Dauer und Zeitgrenzen und AR-O1 gemäss B01–B11.
- [ ] Bestandsfälle C01–C06 einschliesslich BE/StPO 16.09.2026 plus zehn Tage → 28.09.2026 bei Partei ohne Vertretung in BE. Rollen, regionale Antworten und Sozialfakten ausdrücklich setzen.
- [ ] Feiertagsbindung automatisch beziehungsweise rollenbezogen. Verständliche Normlinks in der Rechenspur, technische IDs erst in technischen Details.
- [ ] DE/FR, frühe Datumseingabe, Kurzformen, Enter/Tab/Blur, ungültige Daten und sofortige Entfernung veralteter Resultate/Exporte.
- [ ] v4→v5-Migration, Speichern/Reload, Resetmarker/Reload und gezielte Wiederherstellung eigener Testwerte. Kein Datum, keine Referenz und keine Fallqualifikation persistiert.
- [ ] Breite zweispaltige und schmale Ansicht, lange Texte, tatsächlicher 200-Prozent-Zoom und sichtbarer Tastaturfokus. Geräteprüfung separat.
- [ ] Direkte Teams-Registerkarte und notwendiger Gastzugriff mit der freigegebenen Identität tatsächlich geprüft.
- [ ] Je Host den gebundenen Exportfall DE/FR mit synthetischer Referenz tatsächlich als ICS speichern. Die Daten des jeweiligen Referenzfalls, frei, Kategorie `Fristablauf`, `-PT112H`, administrative Herkunft, UTF-8/CRLF und Faltung stimmen.
- [ ] Gezielter lokaler Manifestfehler sperrt neue Quelle ohne fremden Fallback. Testbedingung entfernen und vollständigen Wiederanlauf prüfen. Keine Mirrordateien manipulieren.
- [ ] Historische Ansichten behalten Pins und Daten. Eigene Netzregeln, Zoom- und Testzustände gezielt zurücknehmen.

Auf steimer.ch-E/Q sind acht tatsächliche ICS-Dateien geprüft. Die [begrenzte Outlook-Wiederverwendung ist bestätigt](abnahme-q-mvp09.md), ohne neuen Import. Sie belegt den unveränderten Terminvertrag, nicht die aktuelle Darstellung zusätzlicher Herkunftstexte, Erinnerungszustellung, Sommerzeitverhalten oder Kategorienfarbe. Neue Outlookimporte brauchen einen gesonderten Auftrag. Menschliche Geräte-/Gastbestätigung wird nicht in zusätzliche VoiceOver- oder Einzelgerätebelege umgedeutet.

T06-H01 und B11-H01 bleiben begrenzt akzeptierte Darstellungsbefunde für den Folgerelease. Ergebnis- und Exportsperren funktionieren dabei korrekt. Die T07-Zeitpunktabweichung ist gesondert akzeptiert. Die [Releasehinweise](release-notes-mvp09.md) nennen die Grenzen, ohne diese Befunde als behoben auszugeben.

## 9. Vor Produktivsetzung festzulegen

- Verantwortliche Stelle für Paket-/Mirrorübernahme, Quellenprüfung, Störungen und Freigaben.
- Zielsites, Teams und Personenkreis sowie ausdrücklich erlaubter Gastzugriff.
- Aufbewahrung und geprüfter Rückfallweg, einschliesslich gemeinsamer Paketwirkung und Schutz persönlicher Standards.
- Zielbezogene technische und manuelle Abnahme, ohne automatische Übernahme fremder Tenantnachweise.

Der bestehende steimer.ch-Q-Betrieb folgt dem [gruppenbasierten Zugriffsmodell](q-demobetrieb-ap15-betriebsanweisung.md). Die Q-Abnahme erweitert weder Gastkreis noch M365-Rechte. Im Zieltenant müssen Site, Team, Mirror und Paketressourcen einschliesslich Widerruf eigenständig geprüft werden. Die Fachverantwortung und Freigabe liegen in der aktuellen Einpersonenphase bei David Steimer. Codex ist dokumentiertes KI-Arbeitsinstrument ohne formelle Freigabe- oder Haftungsverantwortung.

## 10 Referenzen

- [Microsoft SharePoint-App-Katalog](https://learn.microsoft.com/en-us/sharepoint/use-app-catalog)
- [Microsoft Site-Collection-App-Katalog](https://learn.microsoft.com/en-us/sharepoint/dev/general-development/site-collection-app-catalog)
- [Microsoft SPFx in Teams](https://learn.microsoft.com/en-us/sharepoint/dev/spfx/deployment-spfx-teams-solutions)
- [Microsoft benutzerdefinierte Teams-Apps](https://learn.microsoft.com/en-us/microsoftteams/teams-custom-app-policies-and-settings)
- [Technische Kurzdokumentation](../architektur/technische-kurzdokumentation.md)
- [MVP09-Deploymentplan](deployment-mvp-09.md)
- [Gebundene MVP09-Artefakte](releaseartefakte-mvp-09.md)
- [Installationsvorlage](eq-installationsvorlage-mvp09.md) und [Rückfallweg](rueckfall-mvp09.md)
- [E-/Q-Vollzug](eq-vollzugsnachweis-mvp09.md) und [Q-Abnahme](abnahme-q-mvp09.md)
- [Quellenabnahme MVP 0.9](../fachrecht/abnahme-quellen-mvp09.md)
- [Letzter dokumentierter öffentlicher Stand MVP 0.8](produktionsbereitstellung-mvp08-2026-10-16.md)
- [Sicherheitsrichtlinie](../../SECURITY.md)
