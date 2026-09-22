# Fristenrechner Schweiz: Technische Kurzdokumentation

| Merkmal | Stand |
| --- | --- |
| Dokumentzweck | Technische Beurteilung und Übergabe an eine Microsoft-365-IT |
| Produktstand | MVP 0.4, lokal gebautes und geprüftes Paket `0.4.0.0`, noch nicht veröffentlicht oder bereitgestellt |
| Stand | 22. September 2026 |
| Zielplattform | SharePoint Online und Microsoft Teams |
| Lizenz | Programmcode AGPL-3.0-only, Dokumentation und kuratierte Daten grundsätzlich CC BY-SA 4.0 |
| Repository | `davidsteimer/fristenrechner` |

Die AP17-/AP18-Fachgrundlagen und die vollständige Quellenprüfung sind abgenommen. Publikation, Installation in E/Q, öffentliche P-Bereitstellung und Betriebsfreigabe von MVP 0.4 stehen noch aus. Der dokumentierte externe Betriebs- und Rückfallstand bleibt MVP 0.3. Diese Unterlage beschreibt den vorbereiteten neuen Stand, sie ist keine Installationsfreigabe.

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

Die statische öffentliche P-Ausprägung verwendet denselben Kern und dieselbe Oberfläche. Sie bettet den geprüften Datenrelease beim Build ein und benötigt keinen Laufzeitabruf von GitHub oder SharePoint. Sie läuft auf der bestehenden steimer.ch-Hosting-Infrastruktur und ist nicht Bestandteil einer Dritt-Tenant-SPFx-Installation.

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

Lokaler Prüflauf aus einer frischen Arbeitskopie mit Node.js `22.23.2`:

```bash
npm ci
npm run check
cd spfx
npm ci
npm run build
```

`npm run check` führt Typprüfung, 675 Kern- und UI-Tests, sieben Prüfungen der öffentlichen Webausprägung sowie den Build von Browservorschau und öffentlicher Webausprägung aus. Der SPFx-Build führt zusätzlich 48 Provider- und Integrationsprüfungen, TypeScript-, Sass-, ESLint- und Webpack-Prüfungen sowie ein Audit der finalen Bundle-CSS aus. Diese Prüfläufe sind im abgegrenzten Dateiexport mit frisch aus den Lockdateien installierten Node-Abhängigkeiten bestanden. Weitere Daten-, Kalender-, Archiv- und Quellenprüfungen sind in der [Publikationsvorprüfung](../betrieb/publikationsvorpruefung-mvp04.md) aufgeführt. Die Testgruppen überschneiden sich und werden nicht addiert.

Das vorbereitete Releasepaket hat folgende Identität:

| Merkmal | Wert |
| --- | --- |
| Datei | `spfx/sharepoint/solution/fristenrechner-schweiz.sppkg` |
| Paketversion | `0.4.0.0` |
| Grösse | 202'599 Bytes |
| SHA-256 | `eaf4c24ae53c8c3166e38025cbe2337029c2dd88930e354030c97e622ffb6a2a` |
| Solution-ID | `13090feb-a6bf-40fa-9d3c-ec8d90516a60` |
| Component-ID | `596c7f1c-4d3e-4da8-a7be-27a96024f37c` |
| Unterstützte Hosts | `SharePointWebPart`, `TeamsTab` |
| Client-Assets | im `.sppkg` enthalten |
| Tenantweite automatische Bereitstellung | nein, Installation pro Zielwebsite |

Ein unabhängiger SPFx-Neubau ist funktional geprüft, jedoch nicht bitidentisch. Die dokumentierte Varianz betrifft interne Modulnummern, konsistente CSS-Kennungen, generierte Paketkennungen und ZIP-Zeitstempel. Die obige Prüfsumme bezeichnet ausschliesslich das vorbereitete Releasepaket. Ein Neubau mit abweichender Prüfsumme benötigt einen eigenen Paketnachweis und darf nicht unter der alten Prüfsumme freigegeben werden.

## 5. Daten- und Sicherheitsmodell

MVP 0.4 verwendet standardmässig den lokal freigegebenen Datenrelease `2026-09-22-mvp-04-approved.1`. Die GitHub-Adresse ist auf den vollständigen Commit `739876a0d11b550ea8cc702622ab22af321994a5` gepinnt. Dieser Commit ist noch nicht veröffentlicht, der neue GitHub-Standardpfad daher noch nicht öffentlich abrufbar. Die Veröffentlichung und der anschliessende öffentliche Bytevergleich sind Voraussetzung für diesen Betriebsmodus. Ein frei beweglicher Branch wie `main` wird als produktive Datenquelle abgewiesen.

| Komponentenvertrag | MVP 0.4 |
| --- | --- |
| Manifest-/Consumerformat | `4.0.0` |
| Spezialregimekatalog | `3.0.0` |
| Kalenderkomponente | `2.0.0` |
| Schweizer Feiertagskatalog | `1.0.0` |

Der Consumer verarbeitet weiterhin die Formate 1, 2 und 3. Umgekehrt kann der frühere MVP-0.3-Consumer Format 4 nicht lesen. Deshalb müssen App und Datenpfad koordiniert aktualisiert werden. Der vollständige MVP-0.4-Mirror umfasst Manifest und neun Nutzartefakte, einschliesslich `holiday-catalogs/ch-holiday-catalog.json`.

Vor der Aktivierung prüft die Anwendung unter anderem:

- JSON-Schemata und Format-Hauptversion
- Release- und Freigabestatus
- sichere relative Artefaktpfade
- Dateigrössen und SHA-256-Prüfsummen
- Content-IDs und Referenzen zwischen Profilen und Kalendern
- regelbasierte Kalender, Vererbung, Overrides und offene zeitliche Abdeckung
- vollständigen Feiertagskatalog und dessen nachprüfbare, begrenzte Projektion in die operativen Kalender

Bei einem fehlerhaften oder unvollständigen Release bleibt der letzte vollständig validierte Aktivstand erhalten. Ohne gültigen Aktivstand wird der Rechner gesperrt. Er zeigt kein lediglich plausibel wirkendes Fristende an.

Das Paket enthält keine `webApiPermissionRequests`, keine Graph-Adresse, kein Geheimnis und keine Entra-ID-App-Registrierung. Es ist nicht domainisoliert und läuft, wie bei gewöhnlichen SPFx-WebParts üblich, im Kontext der angemeldeten Person. Der implementierte SharePoint-Provider beschränkt den Datenabruf zusätzlich auf die aktuelle SharePoint-Website.

Empfangsdatum und Fristdauer werden lokal berechnet und nicht an GitHub oder einen anderen Fachdienst übertragen. Persönliche Standards bleiben im lokalen Browser. Das Empfangsdatum wird nicht als Standard gespeichert. IndexedDB enthält ausschliesslich validierte öffentliche oder tenantintern freigegebene Regel- und Kalenderdaten. Die optionale Referenz für den Outlook-kompatiblen Kalendereintrag wird weder persistiert noch übertragen.

## 6. Netzwerkverbindungen

| Datenquellenmodus | Laufzeitverbindung | Voraussetzung |
| --- | --- | --- |
| Öffentlicher GitHub-Release | HTTPS zu `raw.githubusercontent.com` | Zielnetz erlaubt den Abruf des gepinnten Releases |
| SharePoint-Mirror | SharePoint-REST auf derselben Website | Angemeldete Person besitzt Leserecht auf dem Mirrorordner |

Mit dem SharePoint-Mirror kann der externe GitHub-Zugriff zur Laufzeit entfallen. Der Mirror ist bereits implementiert. Die automatische Replikation neuer Datenreleases in Dritt-Tenants ist kein Betriebsdienst und bleibt ein kontrollierter manueller Schritt. AP12 ersetzt die endlichen Kalenderlisten durch versionierte Regeln ohne künstliche Jahresobergrenze. AP13 dokumentiert die fachliche Quellenprüfung jährlich spätestens am 15. November sowie bei jedem früheren Anlass. Eine unveränderte Prüfung erzeugt bewusst keinen neuen Datenrelease. Quellenregister, Prüfindex und Ereignisse können getrennt vom Laufzeitrelease in den tenantinternen Mirror übernommen werden.

## 7. Nachgewiesener Stand und Grenzen

Der dokumentierte Betriebsstand MVP 0.3 mit Paket `0.3.0.0` wurde in SharePoint und Teams installiert und einschliesslich Outlook nach T01–T19 geprüft. Der begrenzte gruppenbasierte Q-Gastbetrieb ist mit AP15 und DEC-2026-016 freigegeben, der öffentliche statische P-Betrieb mit AP16 und DEC-2026-018. Diese historischen Ergebnisse werden nicht als Zielumgebungsprüfung von MVP 0.4 übernommen.

MVP 0.4 ist lokal gebaut und geprüft. Die [Quellenprüfung](../fachrecht/abnahme-quellenpruefung-mvp04.md) mit 120 unterschiedlichen Quellen-IDs ist durch David Steimer abgenommen. Die beschlossene Behandlung des dokumentierten AI-Quellenkonflikts bleibt unverändert. Der [Deploymentplan](../betrieb/deployment-mvp-04.md) führt die noch ausstehenden SharePoint-, Teams-, Q-Gast- und öffentlichen P-Prüfungen sowie die getrennten Freigaben.

Der Produktumfang bleibt begrenzt: 16 qualifizierte AP17-Zuordnungen, vier gesperrte Sammelpfade und Fallabdeckung 2026–2027. Der Schweizer Katalog enthält 479 Regeln, operativ werden jedoch weiterhin nur zwölf bestehende CH-/BE-Feiertagsregeln projiziert. Es werden keine zusätzlichen kantonalen Fristenprofile freigegeben. Oberfläche Deutsch und Französisch, italienische und rätoromanische Bezeichnungsfelder nur in der Datengrundlage.

Noch nicht Teil dieses Nachweises sind insbesondere:

- produktiver Betrieb in einem Dritt-Tenant
- Betrieb auf SharePoint Server vor Ort statt SharePoint Online
- Installation und Aktivierung von MVP 0.4 einschliesslich Format-4-Mirror im Tenantlauf
- erneute Q-Gastprüfung und öffentliche P-Prüfung für MVP 0.4
- automatisierte jährliche Datenpublikation und Mirror-Synchronisation
- formelle WCAG-Konformitätsbewertung

## 8. Referenzen

- [Microsoft: SPFx-Kompatibilitätsmatrix](https://learn.microsoft.com/en-us/sharepoint/dev/spfx/compatibility)
- [Microsoft: SPFx-Lösungen für Microsoft Teams bereitstellen](https://learn.microsoft.com/en-us/sharepoint/dev/spfx/deployment-spfx-teams-solutions)
- [Microsoft: Apps über die SharePoint-App-Website verwalten](https://learn.microsoft.com/en-us/sharepoint/use-app-catalog)
- [Microsoft: Benutzerdefinierte Apps in Teams verwalten](https://learn.microsoft.com/en-us/microsoftteams/teams-custom-app-policies-and-settings)
- [AP10-Prüfnachweis](spfx-produktintegration-ap10.md)
- [MVP-0.4-Deployment und Zielumgebungsprüfung](../betrieb/deployment-mvp-04.md)
- [Paket-, Mirror- und Webnachweis MVP 0.4](../../outputs/release-mvp04-2026-09-22/artifact-verification.json)
- [MVP-0.3-Deployment und historische Testmatrix](../betrieb/deployment-release-2-mvp-03.md)
- [Q-Betriebsanweisung](../betrieb/q-demobetrieb-ap15-betriebsanweisung.md)
- [Sicherheitsrichtlinie](../../SECURITY.md)
- [Lizenz](../../LICENSE)
- [Lizenzabgrenzung](../../LICENSES/README.md)
