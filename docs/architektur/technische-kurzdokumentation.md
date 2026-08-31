# Fristenrechner Schweiz: Technische Kurzdokumentation

| Merkmal | Stand |
| --- | --- |
| Dokumentzweck | Technische Beurteilung und Übergabe an eine Microsoft-365-IT |
| Produktstand | MVP 0.2, definitives Paket `0.2.0.0` vor Tenantabnahme |
| Stand | 31. August 2026 |
| Zielplattform | SharePoint Online und Microsoft Teams |
| Lizenz | Programmcode AGPL-3.0-only, Dokumentation und kuratierte Daten grundsätzlich CC BY-SA 4.0 |
| Repository | `davidsteimer/fristenrechner` |

## 1. Kurzbeurteilung der Tenantportabilität

Der Fristenrechner kann grundsätzlich in einem anderen Microsoft-365-Tenant installiert werden. Das Produkt ist eine clientseitige SharePoint-Framework-Lösung, kurz SPFx. Es benötigt keinen eigenen Anwendungsserver, keine Datenbank und keine tenantfremde Entra-ID-App.

Das installierbare `.sppkg` enthält die Client-Assets. Es enthält keine Zieladresse des steimer.ch-SharePoint-Tenants und beantragt keine Microsoft-Graph- oder sonstigen Web-API-Berechtigungen. Die SharePoint-Website des Zieltenants wird erst zur Laufzeit aus dem angemeldeten Microsoft-365-Kontext bestimmt. `https://steimer.ch` ist im Paket nur als Herstellerinformation hinterlegt und kein technischer Laufzeitendpunkt.

Die Erstinstallation ist trotzdem eine administrative Handlung. Für SharePoint braucht es Zugriff auf einen App-Katalog. Für den direkten Betrieb als Teams-Registerkarte braucht es zusätzlich die Freigabe einer organisationsinternen Teams-App. Die spätere Nutzung des Rechners erfordert keine Admin-Rolle.

## 2. Lösungsarchitektur

```text
SharePoint-WebPart oder Teams-Registerkarte
                    ↓
              SPFx-Hostadapter
                    ↓
       React-Oberfläche, Deutsch und Französisch
                    ↓
        deterministischer TypeScript-Rechenkern
                    ↓
  validierter Datenrelease aus GitHub oder SharePoint
```

| Baustein | Aufgabe |
| --- | --- |
| SPFx-Hostadapter | Erkennt SharePoint oder Teams, stellt den SharePoint-Kontext bereit und wählt die Datenquelle |
| React-Oberfläche | Erfasst die Fristangaben, zeigt Automatismen, Resultat und Rechenspur |
| Rechenkern | Berechnet reine Kalenderdaten ohne Uhrzeiten oder Zeitzonenabhängigkeit |
| Release-Service | Lädt und validiert einen vollständigen Regel- und Kalenderrelease vor dessen Aktivierung |
| GitHub-Provider | Liest einen auf einen unveränderlichen Commit gepinnten öffentlichen Datenrelease |
| SharePoint-Provider | Liest einen byteidentischen Mirror auf derselben SharePoint-Website |
| Browser-Store | Hält den letzten vollständig validierten Datenstand in IndexedDB als sicheren Fallback |

Der Rechenkern kennt weder SharePoint noch Teams. Der Hostadapter enthält keine Fristenlogik. Dadurch bleiben Fachlogik, Microsoft-365-Integration und Datenquelle getrennt prüfbar.

## 3. Toolchain

| Komponente | Version oder Vorgabe |
| --- | --- |
| Node.js | `22.23.2`, unterstützt wird Node.js 22 gemäss SPFx-Kompatibilitätsmatrix |
| npm | `10.9.8` |
| SharePoint Framework | `1.23.2` |
| Buildsystem | Rush Stack Heft `1.2.17` |
| TypeScript | `5.8.3` |
| React | `17.0.1` |
| Fluent UI React | `8.106.4` |
| Testausführung | Node Test Runner, TypeScript über `tsx` |
| Datenformate | JSON, JSON Schema Draft 2020-12, ISO-Kalenderdaten, SHA-256 |

SPFx `1.23.2` ist für SharePoint Online ausgelegt und verwendet die Heft-basierte Toolchain. Microsoft weist für diesen SPFx-Stand Node.js 22, TypeScript bis 5.8 und React 17.0.1 aus. Die Microsoft-Kompatibilitätsmatrix ist die verbindliche Referenz für künftige Toolchain-Aktualisierungen.

Die Entwicklungswerkzeuge werden nur zum Bauen und Prüfen benötigt. Auf dem Arbeitsplatz der Endperson werden weder Node.js noch npm installiert.

## 4. Quellcode, Build und Paket

Die hostneutralen Produktquellen liegen unter `src/`. Die produktive Microsoft-365-Integration liegt unter `spfx/`. Vor dem SPFx-Build werden Rechenkern, Oberfläche und Schemata kontrolliert in das SPFx-Projekt synchronisiert. Diese Kopien sind keine zweite fachliche Quelle.

Reproduzierbarer Prüflauf aus einer frischen Arbeitskopie:

```bash
npm ci
npm run check
cd spfx
npm ci
npm run build
```

`npm run check` führt Typprüfung, 103 Kern- und UI-Tests sowie den Build der Browservorschau aus. Der SPFx-Build führt zusätzlich 15 Provider- und Integrationsprüfungen, TypeScript-, Sass-, ESLint- und Webpack-Prüfungen sowie ein Audit der finalen Bundle-CSS aus.

Das auslieferbare Paket hat folgende Identität:

| Merkmal | Wert |
| --- | --- |
| Datei | `spfx/sharepoint/solution/fristenrechner-schweiz.sppkg` |
| Paketversion | `0.2.0.0` |
| Grösse | 166'470 Bytes |
| SHA-256 | `391c13b360a4d359bc3252d5f74f8d8e875287c20729b86b6a58cd1c519f6fc5` |
| Solution-ID | `13090feb-a6bf-40fa-9d3c-ec8d90516a60` |
| Component-ID | `596c7f1c-4d3e-4da8-a7be-27a96024f37c` |
| Unterstützte Hosts | `SharePointWebPart`, `TeamsTab` |
| Client-Assets | im `.sppkg` enthalten |
| Tenantweite automatische Bereitstellung | nein, Installation pro Zielwebsite |

## 5. Daten- und Sicherheitsmodell

Der MVP verwendet standardmässig den freigegebenen Datenrelease `2026-08-31-mvp-02-approved.1`. Die GitHub-Adresse ist auf den vollständigen Commit `bd7c148741626de168af72fa5273dc5fdf24b923` gepinnt. Ein frei beweglicher Branch wie `main` wird als produktive Datenquelle abgewiesen.

Vor der Aktivierung prüft die Anwendung unter anderem:

- JSON-Schemata und Format-Hauptversion
- Release- und Freigabestatus
- sichere relative Artefaktpfade
- Dateigrössen und SHA-256-Prüfsummen
- Content-IDs und Referenzen zwischen Profilen und Kalendern
- zeitliche Kalenderabdeckung

Bei einem fehlerhaften oder unvollständigen Release bleibt der letzte vollständig validierte Aktivstand erhalten. Ohne gültigen Aktivstand wird der Rechner gesperrt. Er zeigt kein lediglich plausibel wirkendes Fristende an.

Das Paket enthält keine `webApiPermissionRequests`, keine Graph-Adresse, kein Geheimnis und keine Entra-ID-App-Registrierung. Es ist nicht domainisoliert und läuft, wie bei gewöhnlichen SPFx-WebParts üblich, im Kontext der angemeldeten Person. Der implementierte SharePoint-Provider beschränkt den Datenabruf zusätzlich auf die aktuelle SharePoint-Website.

Empfangsdatum und Fristdauer werden lokal berechnet und nicht an GitHub oder einen anderen Fachdienst übertragen. Persönliche Standards bleiben im lokalen Browser. Das Empfangsdatum wird nicht als Standard gespeichert. IndexedDB enthält ausschliesslich validierte öffentliche oder tenantintern freigegebene Regel- und Kalenderdaten.

## 6. Netzwerkverbindungen

| Datenquellenmodus | Laufzeitverbindung | Voraussetzung |
| --- | --- | --- |
| Öffentlicher GitHub-Release | HTTPS zu `raw.githubusercontent.com` | Zielnetz erlaubt den Abruf des gepinnten Releases |
| SharePoint-Mirror | SharePoint-REST auf derselben Website | Angemeldete Person besitzt Leserecht auf dem Mirrorordner |

Mit dem SharePoint-Mirror kann der externe GitHub-Zugriff zur Laufzeit entfallen. Der Mirror ist bereits implementiert. Die automatische jährliche Veröffentlichung neuer Datenreleases und deren automatische Replikation in Dritt-Tenants sind im AP10-Stand noch kein fertiger Betriebsdienst. Das Projektziel, die Kalenderstände jeweils bis zum 15. November für mindestens die beiden Folgejahre zu aktualisieren, bleibt damit ein Folgearbeitspaket.

## 7. Nachgewiesener Stand und Grenzen

Der Kandidat `0.1.0.2` wurde im steimer.ch-Testtenant im Tenant-App-Katalog aktiviert, auf einer dedizierten SharePoint-Testsite installiert und als direkte Teams-Kanalregisterkarte geprüft. Die SharePoint-Prüfungen T03 bis T08 und die Teams-Prüfungen T09 bis T12 sind bestanden. Der Referenzfall StPO mit Empfang am 16.09.2026 und zehn Tagen ergibt in beiden Hosts den Fristablauf 28.09.2026.

Noch nicht Teil dieses Nachweises sind insbesondere:

- produktiver Betrieb in einem Dritt-Tenant
- Betrieb auf SharePoint Server vor Ort statt SharePoint Online
- aktivierter SharePoint-Mirror im Tenantlauf
- Gastzugriffe
- automatisierte jährliche Datenpublikation und Mirror-Synchronisation
- formelle WCAG-Konformitätsbewertung

## 8. Referenzen

- [Microsoft: SPFx-Kompatibilitätsmatrix](https://learn.microsoft.com/en-us/sharepoint/dev/spfx/compatibility)
- [Microsoft: SPFx-Lösungen für Microsoft Teams bereitstellen](https://learn.microsoft.com/en-us/sharepoint/dev/spfx/deployment-spfx-teams-solutions)
- [Microsoft: Apps über die SharePoint-App-Website verwalten](https://learn.microsoft.com/en-us/sharepoint/use-app-catalog)
- [Microsoft: Benutzerdefinierte Apps in Teams verwalten](https://learn.microsoft.com/en-us/microsoftteams/teams-custom-app-policies-and-settings)
- [AP10-Prüfnachweis](spfx-produktintegration-ap10.md)
- [Sicherheitsrichtlinie](../../SECURITY.md)
- [Lizenz](../../LICENSE)
- [Lizenzabgrenzung](../../LICENSES/README.md)
