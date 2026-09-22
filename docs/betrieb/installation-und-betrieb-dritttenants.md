# Fristenrechner Schweiz: Installation und Betrieb in Dritt-Tenants

| Merkmal | Stand |
| --- | --- |
| Dokumentzweck | Freischaltungsentscheid, Installation und Betrieb durch eine Microsoft-365-IT |
| Produktstand | MVP 0.4, lokal gebautes und geprüftes Paket `0.4.0.0`, noch nicht veröffentlicht oder bereitgestellt |
| Stand | 22. September 2026 |
| Zielplattform | SharePoint Online, optional Microsoft Teams |

Die AP17-/AP18-Fachgrundlagen und die vollständige Quellenprüfung sind abgenommen. **MVP 0.4 ist noch nicht veröffentlicht, in E/Q/P bereitgestellt oder betrieblich freigegeben.** Diese Anleitung bereitet die IT-Freigabe vor und autorisiert keine Installation. Der dokumentierte externe Betriebs- und Rückfallstand bleibt MVP 0.3. Der [MVP-0.4-Releaseplan](deployment-mvp-04.md) führt die getrennten Freigaben und Zielumgebungsprüfungen.

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
| Paket | `spfx/sharepoint/solution/fristenrechner-schweiz.sppkg` |
| Version | `0.4.0.0` |
| Grösse | 202'599 Bytes |
| SHA-256 | `eaf4c24ae53c8c3166e38025cbe2337029c2dd88930e354030c97e622ffb6a2a` |
| Solution-ID | `13090feb-a6bf-40fa-9d3c-ec8d90516a60` |
| Component-ID | `596c7f1c-4d3e-4da8-a7be-27a96024f37c` |

Prüfung unter macOS oder Linux:

```bash
shasum -a 256 spfx/sharepoint/solution/fristenrechner-schweiz.sppkg
```

Prüfung unter Windows PowerShell:

```powershell
Get-FileHash .\fristenrechner-schweiz.sppkg -Algorithm SHA256
```

Die Installation ist abzubrechen, wenn Version, Solution-ID oder Prüfsumme abweichen.

Die Prüfsumme bezeichnet das lokal vorbereitete Releasepaket. Wegen dokumentierter SPFx-Buildvarianz kann ein funktional gleicher Neubau eine andere Prüfsumme haben. Er ist nicht automatisch als dieses Installationsartefakt freigegeben. Der [Artefaktnachweis](../../outputs/release-mvp04-2026-09-22/artifact-verification.json) dokumentiert Paket, Datenpin, Mirror und Webbuild.

## 4. Installation in SharePoint Online

1. Erst nach Freigabe der konkreten Bereitstellung das Paket aus dem veröffentlichten, versionierten Repositorystand beziehen und SHA-256 prüfen.
2. SharePoint-App-Website beziehungsweise Tenant-App-Katalog öffnen.
3. `fristenrechner-schweiz.sppkg` in die Bibliothek für SharePoint-Apps hochladen.
4. Paket als vertrauenswürdige clientseitige Lösung aktivieren.
5. Kontrollieren, dass das Paket gültig, bereitgestellt und fehlerfrei ist.
6. Kontrollieren, dass keine API-Berechtigungsanforderung vorliegt.
7. App auf jeder vorgesehenen SharePoint-Zielwebsite über die Websiteinhalte installieren.
8. Moderne Seite erstellen oder öffnen.
9. WebPart `Fristenrechner Schweiz` einfügen.
10. Datenquelle gemäss Abschnitt 6 konfigurieren.
11. Seite veröffentlichen und den Abnahmetest gemäss Abschnitt 8 durchführen.

Das aktuelle Paket ist nicht für eine automatische tenantweite Aktivierung konfiguriert. Die App wird bewusst auf den vorgesehenen Websites installiert. Damit bleibt der Rolloutumfang nachvollziehbar.

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

Die Standardkonfiguration verwendet den auf einen unveränderlichen Commit gepinnten Datenrelease:

```text
https://raw.githubusercontent.com/davidsteimer/fristenrechner/739876a0d11b550ea8cc702622ab22af321994a5/data/releases/2026-09-22-mvp-04-approved.1
```

**Dieser Datencommit ist noch nicht veröffentlicht.** Vor der Aktivierung müssen der vollständige Datenstand publiziert, alle zehn Dateien öffentlich abgerufen und byteweise gegen den freigegebenen Bestand geprüft sein. Ein noch nicht erreichbarer Pin ist kein Anlass, auf `main` auszuweichen.

Zusätzliche Voraussetzung ist ein ausgehender HTTPS-Zugriff auf `raw.githubusercontent.com`. Die Anwendung lädt nur die versionierten Regel- und Kalenderdateien. Eingegebene Fristdaten werden nicht an GitHub gesendet.

### 6.2 Variante B: tenantinterner SharePoint-Mirror

Der Mirror eignet sich für Tenants, die keine externe Laufzeitverbindung zulassen oder freigegebene Datenstände selbst kontrollieren wollen. Der neue Datenrelease verwendet Manifest-/Consumerformat `4.0.0`, Spezialregimekatalog `3.0.0`, Kalenderkomponente `2.0.0` und Feiertagskatalog `1.0.0`.

Der Mirror muss auf derselben SharePoint-Website liegen, auf welcher die App-Instanz läuft. Für eine Teams-Registerkarte ist dies die SharePoint-Website des betreffenden Teams.

Empfohlene Ordnerstruktur:

```text
/sites/Rechtsdienst/Freigegebene Dokumente/Fristenrechner/
└── releases/
    └── 2026-09-22-mvp-04-approved.1/
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
        └── special-regimes/
            └── vrpg-be.json
```

Einrichtung:

1. Neuen, versionsbezogenen Ordner in einer Dokumentbibliothek der Zielwebsite erstellen.
2. `manifest.json` sowie sämtliche darin referenzierten Kalender-, Profil-, Spezialregime- und Feiertagskatalogdateien mit unveränderten Dateinamen und Verzeichnissen hochladen. Das sind insgesamt zehn Dateien, nicht nur die operativ verwendeten CH-/BE-Regeln.
3. Sicherstellen, dass die Dateien byteidentisch mit dem freigegebenen Datenrelease sind.
4. Leserecht für alle vorgesehenen Nutzerinnen und Nutzer der App erteilen.
5. WebPart beziehungsweise Teams-Registerkarte bearbeiten und den Eigenschaftenbereich öffnen.
6. `Aktiver Provider` auf `SharePoint-Mirror` setzen.
7. Als `SharePoint-Mirrorpfad` den serverrelativen Ordner eintragen, beispielsweise:

```text
/sites/Rechtsdienst/Freigegebene Dokumente/Fristenrechner/releases/2026-09-22-mvp-04-approved.1
```

Massgebend ist der tatsächliche URL-Pfad der Bibliothek, nicht ihr allenfalls übersetzter Anzeigename. Der Pfad kann aus der Ordneradresse der Zielwebsite übernommen werden.

8. Konfiguration speichern und Seite oder Registerkarte neu laden.
9. Kontrollieren, dass die sichtbare Datenquelle `SharePoint-Mirror` lautet und der Datenrelease `2026-09-22-mvp-04-approved.1` aktiv ist.

Der vollständige Manifest-SHA-256 lautet `a240b01feb671dbe4374c1e097bc9143d66fd4878cd235b3b490a9c08afec72e`. Das lokal vorbereitete Mirror-ZIP `fristenrechner-mvp04-sharepoint-mirror.zip` hat SHA-256 `3a194a29e25eb08a1c503306372671f7d9747951cdb5f31937556c3d41da0536`. Es enthält die zehn Dateien direkt ab der Wurzel und muss in den neuen Releaseordner entpackt werden, nicht als ZIP-Laufzeitquelle eingetragen werden. Der Anhang ist noch nicht öffentlich bereitgestellt. Ein Git-Push allein veröffentlicht ihn nicht.

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

Neue Datenstände werden nicht in den aktiven Ordner hineinkopiert. Der MVP-0.3-Consumer kann Format 4 nicht lesen. Beim Wechsel auf MVP 0.4 gilt deshalb folgende Reihenfolge:

1. neuen Release in einen neuen versionsbezogenen Ordner hochladen
2. sämtliche Artefakte und Berechtigungen prüfen
3. freigegebenes Paket `0.4.0.0` installieren beziehungsweise aktualisieren, bevor eine Instanz den Format-4-Datenpfad erhält
4. Mirrorpfad jeder betroffenen WebPart- und Teams-Registerkarteninstanz auf den neuen Ordner umstellen
5. sichtbare Release-ID, Datenquelle und Referenzberechnung prüfen, anschliessend vollständigen Zielumgebungs-Abnahmetest durchführen
6. früheren Ordner und früheres Paket für einen definierten Rückfallzeitraum unverändert aufbewahren

Ein Paketupdate allein beweist keine Datenumstellung, weil bestehende Instanzen ihre Konfiguration behalten können. Ein Rückfall erfolgt zuerst durch Zurückstellen des Mirrorpfads auf den früheren, vollständig validierten MVP-0.3-Release und bei Bedarf anschliessend durch Wiederherstellen des gesicherten Pakets `0.3.0.0`. Dessen SHA-256 lautet `a4cbaa646a9338419de51f7629652ecc2f9ada0ac15aeccdcf2211f72bc964e1`. Keine Mischung einzelner alter und neuer JSON-Dateien. Die automatische Replikation neuer Mirrorstände ist nicht implementiert. Die Übernahme bleibt ein kontrollierter manueller Betriebsschritt.

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

Für MVP 0.4 ist der [vollständige Quellenabgleich abgenommen](../fachrecht/abnahme-quellenpruefung-mvp04.md). Der bekannte AI-Quellenkonflikt bleibt dokumentiert und wird nach dem bestehenden Entscheid behandelt. Die 479 Katalogregeln bedeuten keine Freigabe sämtlicher kantonaler Fristenprofile. Operativ bleibt die Feiertagsprojektion auf die zwölf bestehenden CH-/BE-Regeln begrenzt. Die qualifizierten AP17-Fälle sind für 2026–2027 geprüft, vier Sammelpfade bleiben gesperrt. Diese fachlichen Grenzen werden nicht durch die offene Kalenderlaufzeit erweitert.

Ein Codeupdate wird als neues `.sppkg` mit unveränderter Solution-ID und höherer Version ausgeliefert. Das Paket wird im App-Katalog ersetzt und auf den Zielwebsites aktualisiert. Enthält die Änderung auch das Teams-Manifest oder die Teams-Exposition, wird anschliessend die organisationsinterne Teams-App aktualisiert und erneut geprüft.

## 8. Minimaler Abnahmetest

- [ ] Paketversion und SHA-256 stimmen
- [ ] App-Katalog meldet ein gültiges, aktiviertes und fehlerfreies Paket
- [ ] keine Graph- oder API-Zustimmung wird verlangt
- [ ] WebPart lädt nach einem vollständigen Neuladen der SharePoint-Seite
- [ ] erwarteter Datenrelease und erwartete Datenquelle werden angezeigt
- [ ] der vollständige Format-4-Mirror einschliesslich Feiertagskatalog wird akzeptiert, ein fehlender oder manipulierter Katalog wird verworfen
- [ ] StPO, Empfang 16.09.2026, zehn Tage ergibt Fristablauf 28.09.2026
- [ ] IV-Einwand, Zustellung 16.09.2026, unterstützte Berner Anknüpfung ergibt 16.10.2026
- [ ] IVöB-Zuschlagsbeschwerde, Publikation 06.09.2026, Neurecht ergibt 28.09.2026
- [ ] Deutsch und Französisch funktionieren
- [ ] ein fachlicher Sperrfall zeigt kein scheinbares Fristende
- [ ] der Outlook-kompatible Kalendereintrag enthält Fristdatum, freien Status, Kategorie `Fristablauf` und Erinnerung 4 Tage 16 Stunden vorher
- [ ] Desktop- und Mobilansicht sind bedienbar
- [ ] direkte Teams-Registerkarte meldet `Microsoft Teams`
- [ ] Browserkonsole enthält keinen Fehler des Produktbundles
- [ ] SharePoint-Mirror bleibt auch bei gesperrtem Zugriff auf `raw.githubusercontent.com` funktionsfähig, falls der Mirror der gewählte Betriebsmodus ist

Diese Liste ersetzt nicht die vollständige [MVP-0.4-Matrix einschliesslich R04-01 bis R04-10](deployment-mvp-04.md#zielumgebungsprüfung). Die bisherigen Ergebnisse von T01–T19 und des Q-Gastbetriebs beziehen sich auf MVP 0.3. Die neuen Tenantprüfungen stehen noch aus.

## 9. Betrieblich offene Punkte vor Produktivsetzung

- technischer Prozess für die Übernahme eines freigegebenen Releases in den Mirror
- Aufbewahrungsdauer früherer Releases und Rückfallentscheid
- Zielgruppen und Richtlinien für die Teams-App
- Supportweg und Zuständigkeit bei fachlichen oder technischen Störungen
- gesonderte Prüfung, falls Gastzugriffe zugelassen werden sollen

Für den steimer.ch-Q-Demobetrieb besteht bereits ein freigegebenes [gruppenbasiertes Zugriffsmodell](q-demobetrieb-ap15-betriebsanweisung.md). Es ist keine pauschale Gastfreigabe eines Dritt-Tenants und kein bestandener Gasttest für MVP 0.4. Site, Team, Mirror und Paketassets müssen im jeweiligen Zieltenant gezielt freigegeben und Widerruf sowie Zugriff geprüft werden. Das Paket selbst fordert dafür keine neuen API-Berechtigungen an.

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
- [MVP-0.4-Deployment und Zielumgebungsprüfung](deployment-mvp-04.md)
- [MVP-0.3-Deployment und historische Testmatrix](deployment-release-2-mvp-03.md)
- [Sicherheitsrichtlinie](../../SECURITY.md)
