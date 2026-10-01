# Fristenrechner Schweiz: Installation und Betrieb in Dritt-Tenants

| Merkmal | Stand |
| --- | --- |
| Dokumentzweck | Freischaltungsentscheid, Installation und Betrieb durch eine Microsoft-365-IT |
| Interner Produktstand | MVP 0.6, Paket `0.6.0.1` auf vier bestehenden E-/Q-Sites installiert und begrenzt nachgeprüft. Q fachlich abgenommen, Gastanmeldung bestätigt und Outlook-Wiederverwendung begründet. Veröffentlichung noch offen. Keine zusätzliche Dritt-Tenant-Installation freigegeben |
| Letzter dokumentierter öffentlicher Betriebsstand | MVP 0.5 auf P, GitHub-Veröffentlichung gemäss Produktionsnachweis vom 28. September 2026 |
| Stand | 1. Oktober 2026, einschliesslich E-/Q-Korrekturinstallation und begrenzter Live-Nachtests |
| Zielplattform | SharePoint Online, optional Microsoft Teams |

Diese Anleitung beschreibt die technische Installation von MVP 0.6. AP20C1 bis AP20C3 und die [zusammengeführte Quellenprüfung](../fachrecht/abnahme-quellen-mvp06.md) sind abgenommen. EOG, FamZG, FLG, MVG und ÜLG ergänzen den Bestand auf 44 national modellierte Regeln und 50 ausschliesslich bernische Anbindungen. Datenfreigabe, lokaler Bau und der gesondert freigegebene E-/Q-Vollzug sind erfolgt. Die begrenzte Lesbarkeitskorrektur und deren Live-Nachtests sind im [Paketnachweis 0.6.0.1](spfx-korrekturkandidat-mvp06-0601.md) gebunden. Der ursprüngliche [Artefaktnachweis](releaseartefakte-mvp-06.md) bleibt erhalten. Für P liegt inzwischen ein [separates korrigiertes Webarchiv](publikationspaket-mvp06.md#gebundener-umfang) vor. Das ursprüngliche Webarchiv ist nur noch historischer Nachweis. Veröffentlichung und weitere Zielinstallationen benötigen eigene Freigaben gemäss [Deploymentplan](deployment-mvp-06.md).

Der [E-/Q-Nachweis für MVP 0.5](eq-installation-mvp05.md) dokumentiert 123 technische Prüfpunkte, die [Q-Abnahme](abnahme-q-mvp05.md) die fachliche Prüfung und bestehende Gastanmeldung. Der [Produktionsnachweis vom 28. September 2026](produktionsbereitstellung-mvp05-2026-09-28.md) bestätigt die anschliessende GitHub-Veröffentlichung und P-Bereitstellung von MVP 0.5 mit begrenzt akzeptierten Header-/Cacheabweichungen und offener direkter Browserstorage-Wertkontrolle. Diese Nachweise werden nicht als Tests von MVP 0.6 oder eines Dritt-Tenants übernommen. Die Anleitung selbst autorisiert weder Installation noch neue Gastrechte oder P-Bereitstellung.

## 1. Entscheid für die IT in Kürze

Eine Installation in einem anderen Microsoft-365-Tenant ist technisch vorgesehen. Das Paket ist keine zentral gehostete SaaS-Anwendung. Es wird als organisationsinterne SPFx-Lösung in den App-Katalog des Zieltenants aufgenommen und auf den vorgesehenen SharePoint-Websites installiert.

Für den Freischaltungsentscheid sind folgende Punkte wesentlich:

- keine Microsoft-Graph- oder sonstige Web-API-Zustimmung
- keine Entra-ID-App-Registrierung und kein Clientgeheimnis
- keine eigene Server- oder Datenbankinfrastruktur
- Client-Assets im von SharePoint Online verwalteten `ClientSideAssets`-Speicher
- Installation pro Zielwebsite, keine automatische Aktivierung auf allen Websites
- wahlweise öffentlicher, unveränderlich gepinnter GitHub-Datenrelease oder tenantinterner SharePoint-Mirror
- lokale Berechnung ohne Übermittlung der eingegebenen Fristdaten an einen Fachdienst
- Open-Source-Quellcode unter AGPL-3.0-only

## 2. Benötigte Rollen und Voraussetzungen

| Aufgabe | Erforderliche Rolle oder Berechtigung |
| --- | --- |
| App-Katalog bereitstellen oder freigeben | SharePoint-Administrator |
| `.sppkg` hochladen und aktivieren | SharePoint-Administrator oder delegierte App-Katalog-Administration |
| App auf einer Zielwebsite installieren | Websitebesitzerin oder Websitebesitzer mit App-Installationsrecht |
| WebPart auf einer Seite einfügen und konfigurieren | Bearbeitungsrecht auf der Zielseite |
| Organisationsinterne Teams-App publizieren und zulassen | Teams-Administrator |
| Teams-Registerkarte hinzufügen | Berechtigung zur Registerkartenverwaltung im Zielteam |
| Mirrorordner pflegen | Bearbeitungsrecht in der betreffenden SharePoint-Dokumentbibliothek |
| Mirror verwenden | Leserecht auf sämtlichen Releaseartefakten |

Technische Mindestvoraussetzungen:

- Microsoft 365 mit SharePoint Online
- moderne SharePoint-Website und moderne Seite
- keine Aktivierung benutzerdefinierter Skripts erforderlich, das WebPart hat `requiresCustomScript: false`
- für Teams ein Team mit zugehöriger SharePoint-Website
- Tenant-App-Katalog, wenn SharePoint und Teams gemeinsam bedient werden sollen
- zugelassene benutzerdefinierte Teams-Apps, wenn der direkte Teams-Host verwendet wird
- moderner, von Microsoft 365 unterstützter Browser mit aktiviertem IndexedDB und lokalem Speicher
- HTTPS-Zugriff auf `raw.githubusercontent.com` oder ein konfigurierter SharePoint-Mirror

Für eine reine SharePoint-Installation auf einer einzelnen Site Collection kann auch ein Site-Collection-App-Katalog geprüft werden. Für den gemeinsamen SharePoint- und Teams-Betrieb wird der Tenant-App-Katalog empfohlen, weil SharePoint daraus das Teams-App-Paket erzeugen und in den organisationsinternen Teams-Katalog übertragen kann.

## 3. Zu prüfendes Installationsartefakt

| Merkmal | Wert |
| --- | --- |
| Paket | [`fristenrechner-schweiz-0.6.0.1.sppkg`](../../outputs/release-mvp06-spfx-0.6.0.1-2026-10-01/artifacts/fristenrechner-schweiz-0.6.0.1.sppkg) |
| Version | `0.6.0.1`, auf den vier bestehenden E-/Q-Sites installiert und begrenzt nachgeprüft. Keine pauschale Freigabe für weitere Zielinstallationen |
| Grösse und SHA-256 | Verbindlich im [Korrektur- und Installationsnachweis](spfx-korrekturkandidat-mvp06-0601.md) |
| Solution-ID | `13090feb-a6bf-40fa-9d3c-ec8d90516a60` |
| Component-ID | `596c7f1c-4d3e-4da8-a7be-27a96024f37c` |

Prüfung unter macOS oder Linux:

```bash
shasum -a 256 outputs/release-mvp06-spfx-0.6.0.1-2026-10-01/artifacts/fristenrechner-schweiz-0.6.0.1.sppkg
```

Prüfung unter Windows PowerShell:

```powershell
Get-FileHash .\outputs\release-mvp06-spfx-0.6.0.1-2026-10-01\artifacts\fristenrechner-schweiz-0.6.0.1.sppkg -Algorithm SHA256
```

Die Installation ist abzubrechen, wenn Version, Solution-ID oder Prüfsumme abweichen.

Die Prüfsumme bezeichnet das konkret gebundene und auf den vier bestehenden E-/Q-Sites nachgeprüfte Korrekturpaket. Wegen dokumentierter SPFx-Buildvarianz kann ein funktional gleicher Neubau eine andere Prüfsumme haben. Er ist nicht automatisch als dieses Installationsartefakt freigegeben. Der [ursprüngliche Artefaktnachweis](releaseartefakte-mvp-06.md) bindet vollständigen Mirror, bisheriges Webarchiv und Datenpin. Die [Korrekturerweiterung](spfx-korrekturkandidat-mvp06-0601.md) bindet das neue SPFx-Paket bei unveränderten Daten. Der [lokale Publikationsnachweis](publikationspaket-mvp06.md) ergänzt den passenden korrigierten Webbau und den getrennten öffentlichen Prüfumfang. Diese Dateien sind noch nicht als MVP 0.6 veröffentlicht. Der allgemeine Standardpfad `spfx/sharepoint/solution/fristenrechner-schweiz.sppkg` darf ohne eigene Identitätsprüfung weder als Auslieferungsartefakt noch als Rückfallpaket verwendet werden.

## 4. Installation in SharePoint Online

1. Erst nach gesonderter Freigabe des konkreten Paketstands und der Zielinstallation das bezeichnete Paket beziehen und SHA-256 prüfen. Für eine externe Übergabe muss auch der hierfür freigegebene Dateiumfang verfügbar sein. Im GitHub-Datenmodus muss der vollständige neue Pin veröffentlicht und öffentlich byteweise geprüft sein. Eine konkret freigegebene E-/Q-Prüfung kann vorher mit vollständigen eigenen SharePoint-Mirrors erfolgen. Diese Anleitung erteilt keine vorgezogene Dritt-Tenant-Freigabe.
2. SharePoint-App-Website beziehungsweise Tenant-App-Katalog öffnen.
3. Das geprüfte Paket in die Bibliothek für SharePoint-Apps hochladen. Bei Ersatz des vorhandenen Katalogeintrags eine byteidentische Bereitstellungskopie namens `fristenrechner-schweiz.sppkg` verwenden und die Prüfsumme erneut kontrollieren.
4. Paket als vertrauenswürdige clientseitige Lösung aktivieren.
5. Kontrollieren, dass das Paket gültig, bereitgestellt und fehlerfrei ist.
6. Kontrollieren, dass keine API-Berechtigungsanforderung vorliegt.
7. App auf jeder vorgesehenen SharePoint-Zielwebsite über die Websiteinhalte installieren.
8. Moderne Seite erstellen oder öffnen.
9. WebPart `Fristenrechner Schweiz` einfügen.
10. Datenquelle gemäss Abschnitt 6 konfigurieren.
11. Seite veröffentlichen und den Abnahmetest gemäss Abschnitt 8 durchführen.

Das aktuelle Paket ist nicht für eine automatische tenantweite Aktivierung konfiguriert. Die App wird bewusst auf den vorgesehenen Websites installiert. Der Austausch im gemeinsamen Tenant-App-Katalog kann dennoch den Code sämtlicher bereits mit dieser Paketidentität verbundener Instanzen beeinflussen. Vor einem Update deshalb bestehende Verwendungen und den wiederherstellbaren Ausgangsstand erfassen, nicht nur die zuerst geprüfte Zielseite.

## 5. Zusätzliche Installation für Microsoft Teams

1. SharePoint-App auf der SharePoint-Website des Zielteams installieren.
2. Im Tenant-App-Katalog die Teams-Bereitstellung für das SPFx-Paket auslösen. SharePoint kann Manifest und Teams-Paket automatisch erzeugen.
3. Alternativ das generierte Teams-Paket über den dokumentierten App-Katalog-Endpunkt herunterladen und im Teams Admin Center als organisationsinterne App publizieren.
4. Bei einer Aktualisierung einen älteren Produktkatalogeintrag mit derselben externen Component-ID kontrolliert aktualisieren oder, falls die Synchronisation ihn nicht überschreiben kann, zuerst entfernen. Andere Apps und der Spike bleiben unangetastet.
5. Im Teams Admin Center prüfen, dass die App entsperrt und für die Zielpersonen oder Zielgruppen verfügbar ist.
6. App dem Zielteam zuordnen oder die Installation durch berechtigte Teamverantwortliche zulassen.
7. Microsoft-Propagation abwarten, bis `Fristenrechner Schweiz` im Teams-Client auffindbar ist.
8. Im vorgesehenen Kanal eine Registerkarte hinzufügen und die direkte App auswählen.
9. Datenquelle konfigurieren.
10. Automatischen Kanalbeitrag deaktivieren, wenn kein Systembeitrag gewünscht ist.
11. Registerkarte speichern und prüfen, dass der Fristenrechner den Host `Microsoft Teams` meldet.

Eine moderne SharePoint-Seite kann über die Teams-App `SharePoint` ebenfalls als Registerkarte eingebunden werden. Das ist nur ein Fallback. Diese Variante meldet `SharePoint Online` und ersetzt den Test der direkten `TeamsTab`-Integration nicht.

Microsoft weist darauf hin, dass benutzerdefinierte Apps und deren Nutzung im Teams Admin Center durch App-Richtlinien gesteuert werden. Die organisationsinterne Teams-App ist nicht im öffentlichen Teams Store verfügbar.

## 6. Datenquelle und SharePoint-Mirror

### 6.1 Variante A: öffentlicher GitHub-Release

Die lokale MVP-0.6-Standardkonfiguration bezeichnet folgenden noch nicht veröffentlichten, auf einen unveränderlichen Commit gepinnten Datenrelease:

```text
https://raw.githubusercontent.com/davidsteimer/fristenrechner/19b37336974f3ba7c72333763e1272425239b8cd/data/releases/2026-10-01-mvp-06-approved.1
```

**Dieser MVP-0.6-Datencommit ist noch nicht veröffentlicht.** Vor der Aktivierung im GitHub-Modus müssen der vollständige Datenstand publiziert, alle elf Laufzeitdateien öffentlich abgerufen und byteweise gegen den freigegebenen Bestand geprüft sein. Eine vorher gesondert freigegebene E-/Q-Installation verwendet ausdrücklich vollständige neue SharePoint-Mirrors. Ein noch nicht erreichbarer Pin ist kein Anlass, auf `main` auszuweichen oder einen alten Cache als erfolgreichen Erstabruf auszugeben. Der ältere MVP-0.5-Pin `3109c39730f10d31cb6c57200b36dd5091d7bcd1` ist gemäss Produktionsnachweis bereits veröffentlicht.

Zusätzliche Voraussetzung ist ein ausgehender HTTPS-Zugriff auf `raw.githubusercontent.com`. Die Anwendung lädt nur die versionierten Regel- und Kalenderdateien. Eingegebene Fristdaten werden nicht an GitHub gesendet.

### 6.2 Variante B: tenantinterner SharePoint-Mirror

Der Mirror eignet sich für Tenants, die keine externe Laufzeitverbindung zulassen oder freigegebene Datenstände selbst kontrollieren wollen. Der neue Datenrelease verwendet Manifest-/Mindestconsumerformat `6.0.0`, Sozialverfahrenskatalog `2.0.0`, Spezialregimekatalog `3.0.0`, Kalenderkomponente `2.0.0` und Feiertagskatalog `1.0.0`. Die Ordnerangaben sind Vorlagen für eine später konkret freizugebende Installation.

Der Mirror muss auf derselben SharePoint-Website liegen, auf welcher die App-Instanz läuft. Für eine Teams-Registerkarte ist dies die SharePoint-Website des betreffenden Teams.

Empfohlene Ordnerstruktur:

```text
/sites/Rechtsdienst/Freigegebene Dokumente/Fristenrechner/
└── releases/
    └── 2026-10-01-mvp-06-approved.1/
        ├── manifest.json
        ├── calendars/
        │   ├── be-public-holidays.json
        │   └── ch-federal-calendar.json
        ├── holiday-catalogs/
        │   └── ch-holiday-catalog.json
        ├── profiles/
        │   ├── bgg.json
        │   ├── stpo.json
        │   ├── vrpg-be.json
        │   ├── vwvg.json
        │   └── zpo.json
        ├── social-procedures/
        │   └── ch-social-procedures.json
        └── special-regimes/
            └── vrpg-be.json
```

Einrichtung:

1. Neuen, versionsbezogenen Ordner in einer Dokumentbibliothek der Zielwebsite erstellen.
2. `manifest.json` sowie sämtliche darin referenzierten Kalender-, Profil-, Spezialregime-, Feiertags- und Sozialverfahrenskatalogdateien mit unveränderten Dateinamen und Verzeichnissen hochladen. Das sind insgesamt elf Laufzeitdateien, nicht nur die operativ verwendeten CH-/BE-Regeln. `README.md` gehört nicht zum Laufzeitmirror.
3. Sicherstellen, dass die Dateien byteidentisch mit dem freigegebenen Datenrelease sind.
4. Leserecht für alle vorgesehenen Nutzerinnen und Nutzer der App erteilen.
5. WebPart beziehungsweise Teams-Registerkarte bearbeiten und den Eigenschaftenbereich öffnen.
6. `Aktiver Provider` auf `SharePoint-Mirror` setzen.
7. Als `SharePoint-Mirrorpfad` den serverrelativen Ordner eintragen, beispielsweise:

```text
/sites/Rechtsdienst/Freigegebene Dokumente/Fristenrechner/releases/2026-10-01-mvp-06-approved.1
```

Massgebend ist der tatsächliche URL-Pfad der Bibliothek, nicht ihr allenfalls übersetzter Anzeigename. Der Pfad kann aus der Ordneradresse der Zielwebsite übernommen werden.

8. Konfiguration speichern und Seite oder Registerkarte neu laden.
9. Kontrollieren, dass die sichtbare Datenquelle `SharePoint-Mirror` lautet und der Datenrelease `2026-10-01-mvp-06-approved.1` aktiv ist. Zusätzlich den Erstabruf ohne vorhandenen gültigen Produktdatencache und den tatsächlichen Abruf aller elf Dateien aus dem richtigen Mirror prüfen.

Manifest- und Archivprüfsummen stehen verbindlich im [MVP-0.6-Artefaktnachweis](releaseartefakte-mvp-06.md). Das lokal vorbereitete [Mirror-ZIP `fristenrechner-mvp06-sharepoint-mirror.zip`](../../outputs/release-mvp06-2026-10-01/artifacts/fristenrechner-mvp06-sharepoint-mirror.zip) enthält die elf Dateien direkt ab der Wurzel. Es muss in den neuen Releaseordner entpackt werden und darf nicht als ZIP-Laufzeitquelle eingetragen werden. Das Archiv ist noch nicht öffentlich bereitgestellt. Ein späterer Git-Push veröffentlicht nur ausdrücklich versionierte Dateien und erzeugt nicht automatisch einen GitHub-Release-Anhang.

Zulässige Pfade:

- serverrelativer Pfad, der mit `/` beginnt
- vollständige HTTPS-Adresse mit demselben Ursprung wie die aktuelle SharePoint-Website
- Ordner innerhalb der aktuellen SharePoint-Website

Nicht zulässige Pfade:

- anderer Tenant oder anderer SharePoint-Ursprung
- andere Site Collection
- Pfade mit `.` oder `..`
- URL mit Zugangsdaten, Abfrageparametern oder Fragment
- unvollständig hochgeladener oder nachträglich veränderter Release

Die Anwendung prüft Schemata, Referenzen und SHA-256-Prüfsummen selbst. Bei einer Abweichung aktiviert sie den Mirrorstand nicht.

### 6.3 Mirror-Update und Rückfall

Neue Datenstände werden nicht in den aktiven Ordner hineinkopiert. Der MVP-0.5-Consumer kann Format 6 nicht lesen. Beim gesondert freizugebenden Wechsel auf MVP 0.6 gilt deshalb folgende Reihenfolge:

1. neuen Release in einen neuen versionsbezogenen Ordner hochladen
2. sämtliche Artefakte und Berechtigungen prüfen
3. erst nach konkreter Freigabe das hashgebundene Paket `0.6.0.1` installieren beziehungsweise aktualisieren, bevor eine Instanz den Format-6-Datenpfad erhält
4. Mirrorpfad jeder betroffenen WebPart- und Teams-Registerkarteninstanz auf den neuen Ordner umstellen
5. sichtbare Release-ID, Datenquelle und Referenzberechnung prüfen, anschliessend vollständigen Zielumgebungs-Abnahmetest durchführen
6. früheren Ordner und früheres Paket für einen definierten Rückfallzeitraum unverändert aufbewahren

Ein Paketupdate allein beweist keine Datenumstellung, weil bestehende Instanzen ihre Konfiguration behalten können. Der Rückfall verwendet die unmittelbar vor dem Eingriff tatsächlich verifizierte und gesicherte Baseline. Der aktuelle dokumentierte E-/Q-Stand ist Paket `0.6.0.1` mit Datenrelease `2026-10-01-mvp-06-approved.1`. Beim reinen Korrekturwechsel war das frisch gesicherte Rückfallpaket `0.6.0.0` bei identischem Datenstand. Bei einem späteren Eingriff muss die dann aktuelle Baseline neu bestätigt und gesichert werden. Bei einem Rückfall über die Formatgrenze zuerst die zusammengehörigen früheren Datenpfade zurückstellen, nötigenfalls das gesicherte Paket wiederherstellen und alle betroffenen Instanzen prüfen. Einen alten Consumer niemals mit Format-6-Daten zurücklassen. Die historische AP5-Ansicht behält ihre eigene Datenquelle. Keine Mischung einzelner alter und neuer JSON-Dateien. Die automatische Replikation neuer Mirrorstände ist nicht implementiert. Die Übernahme bleibt ein kontrollierter manueller Betriebsschritt.

### 6.4 Governance-Nachweis spiegeln

Das AP13-Quellenregister, der generierte Index und die append-only-Prüfereignisse können in einem parallelen Governance-Ordner gespiegelt werden:

```text
/sites/Rechtsdienst/Freigegebene Dokumente/Fristenrechner/
├── releases/
│   └── <releaseId>/
└── source-reviews/
    ├── source-register.json
    ├── index.json
    └── events/
        └── <reviewEventId>.json
```

Der WebPart-Pfad bleibt auf `releases/<releaseId>` eingestellt. `source-reviews` ist keine Laufzeitdatenquelle und muss für die Berechnung nicht erreichbar sein. Die Spiegelung dient der tenantinternen Nachvollziehbarkeit und darf die öffentlichen Dateien nicht inhaltlich verändern.

## 7. Betrieb und Aktualisierung

Der Fristenrechner benötigt keinen Serverprozess. Der Regelbetrieb umfasst:

- Verfügbarkeit der SharePoint-Website und der konfigurierten Datenquelle
- rechtzeitige Bereitstellung eines fachlich freigegebenen Datenrelease
- jährliche fachliche Quellenprüfung spätestens am 15. November sowie anlassbezogene Prüfungen vor Releases und bei Rechtsänderungen
- unveränderte Dokumentation auch dann, wenn die Prüfung keinen neuen Datenrelease auslöst
- Prüfung von App-Katalog- und Teams-Richtlinien nach Microsoft-365-Änderungen
- stichprobenweise Referenzberechnung nach Paket- oder Datenupdate
- Überwachung der offiziellen SPFx-Kompatibilitätsmatrix vor einem Toolchain-Upgrade

Der regelbasierte Kalender besitzt keine künstliche Jahresobergrenze. Das bedeutet nicht, dass das Recht unveränderlich wäre. Feiertags- und Fristenquellen werden nach dem [AP13-Prozess](periodische-quellenpruefung-ap13.md) kontrolliert. Nur eine fachlich relevante und freigegebene Änderung führt zu einem neuen Datenrelease. Die [Release-Checkliste](release-checkliste.md) verbindet Quellenprüfung, Datenfreigabe, Mirror und Tenanttests.

Für MVP 0.6 ist die [zusammengeführte Quellenprüfung einschliesslich Wiederverwendung und Vorbehalten abgenommen](../fachrecht/abnahme-quellen-mvp06.md). 77 Manifestreferenzen und 82 zusätzliche historische Katalogreferenzen ergeben 159 unterschiedliche Quellen-IDs. Die 82 behalten ihren tatsächlichen Prüfstand vom 22. September 2026 und werden nicht als frisch vollständig geprüft ausgegeben. Der bekannte AI-Quellenkonflikt bleibt unklar und wird nach dem bestehenden Entscheid behandelt. Die 479 Katalogregeln bedeuten keine Freigabe sämtlicher kantonaler Fristenprofile. Operativ bleibt die Feiertagsprojektion auf die zwölf bestehenden CH-/BE-Regeln begrenzt.

Der lokal übernommene Sozialverfahrenskatalog umfasst 44 nationale Regeln und 50 bernische Anbindungen. Die bisherigen IVG-/AHVG-/UVG-Pfade, ELG, AVIG-ALE und KVG-OKP werden um die qualifizierten EOG-, FamZG-, FLG-, MVG- und ÜLG-Pfade ergänzt. Die Sozialfreigaben bleiben auf Quellen- und Fallabdeckung 2026–2027 begrenzt. Unbekannte, nicht modellierte oder ausserhalb der freigegebenen Anbindung liegende Fälle bleiben gesperrt. Nationale Modellierung aktiviert keine weiteren Kantone. Diese fachlichen Grenzen werden weder durch die offene Kalenderlaufzeit noch durch die lokale Baufreigabe erweitert.

Ein Codeupdate wird als neues `.sppkg` mit unveränderter Solution-ID und höherer Version ausgeliefert. Das Paket wird im App-Katalog ersetzt und auf den Zielwebsites aktualisiert. Enthält die Änderung auch das Teams-Manifest oder die Teams-Exposition, wird anschliessend die organisationsinterne Teams-App aktualisiert und erneut geprüft.

## 8. Minimaler Abnahmetest

- [ ] Paketversion und SHA-256 stimmen
- [ ] App-Katalog meldet ein gültiges, aktiviertes und fehlerfreies Paket
- [ ] keine Graph- oder API-Zustimmung wird verlangt
- [ ] WebPart lädt nach einem vollständigen Neuladen der SharePoint-Seite
- [ ] erwarteter Datenrelease und erwartete Datenquelle werden angezeigt
- [ ] der vollständige Format-6-Mirror einschliesslich Feiertags- und Sozialverfahrenskatalog 2 wird akzeptiert, fehlende oder manipulierte Komponenten werden atomar verworfen
- [ ] StPO, Empfang 16.09.2026, zehn Tage ergibt Fristablauf 28.09.2026
- [ ] IV-Einwand, Zustellung 16.09.2026, unterstützte Berner Anknüpfung ergibt 16.10.2026
- [ ] IVöB-Zuschlagsbeschwerde, Publikation 06.09.2026, Neurecht ergibt 28.09.2026
- [ ] ELG-, AVIG-ALE- und KVG-OKP-Referenzen sowie ihre Sperrfälle gemäss vollständigen qualifizierten Eingaben der [MVP-0.5-Prüfmatrix](deployment-mvp-05.md#5-prüfmatrix-für-den-folgerelease) stimmen
- [ ] EOG, FamZG, FLG, MVG und ÜLG sowie ihre gezielten Sperrfälle stimmen gemäss [MVP-0.6-Fallliste](pruefmatrix-mvp06.md), reale Fallmerkmale werden nicht aus Defaults oder anderen Eingaben abgeleitet
- [ ] Deutsch und Französisch funktionieren
- [ ] ein fachlicher Sperrfall zeigt kein scheinbares Fristende
- [ ] der Outlook-kompatible Kalendereintrag enthält Fristdatum, freien Status, Kategorie `Fristablauf` und Erinnerung 4 Tage 16 Stunden vorher
- [ ] Desktop- und Mobilansicht sind bedienbar
- [ ] direkte Teams-Registerkarte meldet `Microsoft Teams`
- [ ] Browserkonsole enthält keinen Fehler des Produktbundles
- [ ] SharePoint-Mirror bleibt auch bei gesperrtem Zugriff auf `raw.githubusercontent.com` funktionsfähig, falls der Mirror der gewählte Betriebsmodus ist

Diese Liste ist eine Vorlage für die jeweilige Zielinstallation und ersetzt nicht die vollständige [MVP-0.6-Matrix](deployment-mvp-06.md#5-geplante-prüfmatrix) und [konkrete Fallliste](pruefmatrix-mvp06.md). Für MVP 0.6 sind die ursprüngliche technische Eigentümerprüfung und die [begrenzten Korrektur-Nachtests](spfx-korrekturkandidat-mvp06-0601.md) dokumentiert. Die [manuelle Q-Abnahme und Gastanmeldung sind durch David bestätigt](abnahme-q-mvp06.md). Die für MVP 0.5 dokumentierten 123 technischen E-/Q-Prüfpunkte und seine fachliche Q-Abnahme gelten weder automatisch für MVP 0.6 noch für einen Dritt-Tenant. Der [Outlook-Nachweis MVP 0.5](outlook-pruefung-mvp05.md) dokumentiert den früheren Webimport mit Eigenschaften und Bereinigung sowie Davids manuelle Desktopbestätigung. Für MVP 0.6 ist die [Wiederverwendung dieser Vorbelege ausdrücklich beschlossen und technisch begründet](abnahme-q-mvp06.md). Die 28 tatsächlich geprüften MVP-0.6-ICS-Dateien ergänzen die bytegleiche Exportimplementierung und den früheren Importnachweis. Ein neuer Outlookimport wird nicht behauptet.

Für MVP 0.5 wurden E-SharePoint und Q-Teams bei 390, 768 und 1440 Pixeln ohne horizontales Überlaufen geprüft. Auf seinen vier bezeichneten Instanzen sind cachefreier Erstabruf sowie kontrollierter Komponentenladefehler mit Fallback und anschliessender Wiederherstellung nachgewiesen. Einzelheiten und Nachweisgrenzen bleiben im [MVP-0.5-Bericht](eq-installation-mvp05.md) ausgewiesen. Die jeweiligen Punkte dürfen nicht ohne Prüfung auf MVP 0.6 oder einen anderen Tenant übertragen werden.

## 9. Betrieblich offene Punkte vor Produktivsetzung

- technischer Prozess für die Übernahme eines freigegebenen Releases in den Mirror
- Aufbewahrungsdauer früherer Releases und Rückfallentscheid
- Zielgruppen und Richtlinien für die Teams-App
- Supportweg und Zuständigkeit bei fachlichen oder technischen Störungen
- gesonderte Prüfung, falls Gastzugriffe zugelassen werden sollen

Für den steimer.ch-Q-Demobetrieb besteht bereits ein freigegebenes [gruppenbasiertes Zugriffsmodell](q-demobetrieb-ap15-betriebsanweisung.md). David hat für MVP 0.5 die reale Anmeldung mit dem bestehenden B2B-Gast als durchgeführt bestätigt. Die kurze Bestätigung enthält keine vollständige Wiederholung der technischen Matrix unter dem Gastkonto und schafft keine neuen Rechte oder Gäste. Sie ist keine pauschale Gastfreigabe eines Dritt-Tenants. Site, Team, Mirror und Paketassets müssen im jeweiligen Zieltenant gezielt freigegeben und Widerruf sowie Zugriff geprüft werden. Das Paket selbst fordert dafür keine neuen API-Berechtigungen an.

Die Fachverantwortung und Freigabe liegen in der aktuellen Einpersonenphase bei David Steimer. Das Rollenmodell bleibt für einen später getrennten Betrieb dokumentiert.

## 10. Referenzen

- [Microsoft: Apps über die SharePoint-App-Website verwalten](https://learn.microsoft.com/en-us/sharepoint/use-app-catalog)
- [Microsoft: Site-Collection-App-Katalog verwenden](https://learn.microsoft.com/en-us/sharepoint/dev/general-development/site-collection-app-catalog)
- [Microsoft: SPFx-Lösungen für Microsoft Teams bereitstellen](https://learn.microsoft.com/en-us/sharepoint/dev/spfx/deployment-spfx-teams-solutions)
- [Microsoft: Benutzerdefinierte Apps in Teams verwalten](https://learn.microsoft.com/en-us/microsoftteams/teams-custom-app-policies-and-settings)
- [Technische Kurzdokumentation](../architektur/technische-kurzdokumentation.md)
- [AP10-Deploymentnachweis](deployment-ap10.md)
- [AP13: Periodische Quellenprüfung](periodische-quellenpruefung-ap13.md)
- [Release-Checkliste](release-checkliste.md)
- [MVP-0.6-Deploymentplan und konkrete Freigabegrenzen](deployment-mvp-06.md)
- [MVP-0.6-Artefakte und verbindliche Prüfsummen](releaseartefakte-mvp-06.md)
- [MVP-0.6-E-/Q-Fallliste](pruefmatrix-mvp06.md)
- [Dokumentierter MVP-0.5-Produktionsstand](produktionsbereitstellung-mvp05-2026-09-28.md)
- [MVP-0.5-Deployment und Zielumgebungsprüfung](deployment-mvp-05.md)
- [Aktueller E-/Q-Nachweis](eq-installation-mvp05.md)
- [Fachliche Q-Abnahme und bestätigte Gastanmeldung](abnahme-q-mvp05.md)
- [Definitive lokale MVP-0.5-Artefakte](releaseartefakte-mvp-05.md)
- [MVP-0.3-Deployment und historische Testmatrix](deployment-release-2-mvp-03.md)
- [Sicherheitsrichtlinie](../../SECURITY.md)
