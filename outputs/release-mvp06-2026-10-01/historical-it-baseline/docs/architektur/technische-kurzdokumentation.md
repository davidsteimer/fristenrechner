# Fristenrechner Schweiz: Technische Kurzdokumentation

| Merkmal | Stand |
| --- | --- |
| Dokumentzweck | Technische Beurteilung und Übergabe an eine Microsoft-365-IT |
| Produktstand | MVP 0.5, SPFx-Paket `0.5.0.0` auf vier bestehenden E-/Q-Instanzen installiert und technisch geprüft, fachliche Q-Abnahme erteilt. Noch keine MVP-0.5-Veröffentlichung auf GitHub oder P |
| Stand | 28. September 2026 |
| Zielplattform | SharePoint Online und Microsoft Teams |
| Lizenz | Programmcode AGPL-3.0-only, Dokumentation und kuratierte Daten grundsätzlich CC BY-SA 4.0 |
| Repository | `davidsteimer/fristenrechner` |

MVP 0.5 ergänzt die abgenommenen AP17-/AP18-Grundlagen um die erste AP19-Tranche des national modellierten Sozialversicherungsrechts mit ausschliesslich bernischer Freigabe. Die zusammengeführte Quellenprüfung ist abgenommen. Alle vier bestehenden E-/Q-Instanzen verwenden das Paket `0.5.0.0` und ihre vollständigen Format-5-Mirrors. Der [aktuelle E-/Q-Nachweis](../betrieb/eq-installation-mvp05.md) umfasst 123 bestandene technische Prüfpunkte. David Steimer hat Q fachlich abgenommen und die reale Anmeldung mit dem bestehenden B2B-Gast bestätigt. Die [Abnahmenotiz](../betrieb/abnahme-q-mvp05.md) und der [Bereitstellungsplan](../betrieb/deployment-mvp-05.md) trennen diese menschlichen Nachweise von den technischen Tests und nachfolgenden Freigaben. GitHub bleibt nach dokumentiertem Stand auf MVP 0.4, der öffentliche P-Rechner wegen des offenen Hostingbefunds auf MVP 0.3. Diese Unterlage autorisiert keine zusätzliche Installation, neue Gastrechte oder P-Bereitstellung.

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
| Testausführung | Node Test Runner, TypeScript über `tsx` sowie direkte ES5- und Paketbundle-Regression ohne Transpiler |
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

`npm run check` führt Typprüfung, Kern-/UI-Tests, die Prüfungen der öffentlichen Webausprägung sowie Vorschau- und Webbuild aus. Der [definitive lokale MVP-0.5-Bau](../betrieb/releaseartefakte-mvp-05.md) weist 1’213 Kern-/UI-Tests und zwölf Public-Build-Tests aus. Die gesonderte SPFx-Prüfung bestand 84 Quell-/Transporttests sowie 42 Prüfungen des kompilierten Codes und tatsächlichen Pakets, zusätzlich zum Produktionsbuild und CSS-Audit. Zwei bestehende Lintwarnungen zu `null` in Typverträgen bleiben dokumentiert. Der Heft/Jest-Schritt enthält keine eigenen Jest-Suiten und wird nicht als zusätzlicher Testbestand ausgegeben. Die Pakettests verwenden kontrollierte lokale Hostadapter. Die Zielumgebungsprüfung ist separat dokumentiert. Die Testgruppen überschneiden sich und werden nicht addiert.

Für einen isolierten MVP-0.5-SPFx-Neubau ist vom Repositoryhauptordner `npm run build:spfx:mvp05` vorgesehen. Der gewöhnliche Build im Unterordner `spfx/` schreibt dagegen an seinen Standardausgabepfad. Ein Neubau ersetzt nicht automatisch das bereits freigegebene Artefakt.

Das auf E und Q installierte Releasepaket hat folgende Identität:

| Merkmal | Wert |
| --- | --- |
| Datei | [`outputs/release-mvp05-2026-09-28/artifacts/fristenrechner-schweiz-0.5.0.0.sppkg`](../../outputs/release-mvp05-2026-09-28/artifacts/fristenrechner-schweiz-0.5.0.0.sppkg) |
| Paketversion | `0.5.0.0` |
| Grösse | 222’393 Bytes |
| SHA-256 | `f46beaadbfd9e2a893b55853bb2d622cb6850e5d72b08b9443d367e0d6f6cf39` |
| Solution-ID | `13090feb-a6bf-40fa-9d3c-ec8d90516a60` |
| Component-ID | `596c7f1c-4d3e-4da8-a7be-27a96024f37c` |
| Unterstützte Hosts | `SharePointWebPart`, `TeamsTab` |
| Client-Assets | im `.sppkg` enthalten |
| Tenantweite automatische Bereitstellung | nein, Installation pro Zielwebsite |

Die Prüfsumme bezeichnet ausschliesslich das konkret auf E und Q geprüfte Paket. Ein unabhängiger byteidentischer Zweitbau von `0.5.0.0` wird nicht behauptet. Die bei MVP 0.4 dokumentierte SPFx-Buildvarianz bleibt als historische Erfahrung bestehen. Ein Neubau mit abweichender Prüfsumme benötigt einen eigenen Paketnachweis. Der bisherige Standardpfad `spfx/sharepoint/solution/fristenrechner-schweiz.sppkg` bleibt im erhaltenen lokalen Ausgangsstand bei `0.4.0.1` und ist **nicht** das oben bezeichnete MVP-0.5-Auslieferungsartefakt.

## 5. Daten- und Sicherheitsmodell

MVP 0.5 verwendet den lokal freigegebenen Datenrelease `2026-09-28-mvp-05-approved.1`. Die GitHub-Standardadresse ist auf den vollständigen Commit `3109c39730f10d31cb6c57200b36dd5091d7bcd1` gepinnt. Dieser Commit ist noch nicht veröffentlicht, der neue GitHub-Standardpfad daher noch nicht öffentlich abrufbar. E und Q verwenden ausdrücklich ihren jeweils vollständigen SharePoint-Mirror. Veröffentlichung und anschliessender öffentlicher Bytevergleich sind Voraussetzung für den GitHub-Betriebsmodus. Ein frei beweglicher Branch wie `main` wird als produktive Datenquelle abgewiesen.

| Komponentenvertrag | MVP 0.5 |
| --- | --- |
| Manifest-/Consumerformat | `5.0.0` |
| Sozialverfahrenskatalog | `1.0.0` |
| Spezialregimekatalog | `3.0.0` |
| Kalenderkomponente | `2.0.0` |
| Schweizer Feiertagskatalog | `1.0.0` |

Der Consumer verarbeitet weiterhin die Formate 1 bis 4. Umgekehrt kann der MVP-0.4-Consumer Format 5 nicht lesen. Deshalb müssen App und Datenpfad koordiniert aktualisiert werden. Der vollständige MVP-0.5-Mirror umfasst Manifest und zehn Nutzartefakte, einschliesslich `holiday-catalogs/ch-holiday-catalog.json` und `social-procedures/ch-social-procedures.json`.

Vor der Aktivierung prüft die Anwendung unter anderem:

- JSON-Schemata und Format-Hauptversion
- Release- und Freigabestatus
- sichere relative Artefaktpfade
- Dateigrössen und SHA-256-Prüfsummen
- Content-IDs und Referenzen zwischen Profilen und Kalendern
- regelbasierte Kalender, Vererbung, Overrides und offene zeitliche Abdeckung
- vollständigen Feiertagskatalog und dessen nachprüfbare, begrenzte Projektion in die operativen Kalender
- Sozialverfahrenskatalog mit getrennten nationalen Regeln, bernischen Anbindungen, rechtlichen Zeitbindungen und hashgebundenen Freigaben. Eine nationale Regel allein gibt noch keine kantonale Anwendung frei

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

Der frühere Betriebsstand MVP 0.3 mit Paket `0.3.0.0` wurde in SharePoint und Teams installiert und einschliesslich Outlook nach T01–T19 geprüft. Der begrenzte gruppenbasierte Q-Gastbetrieb wurde mit AP15 und DEC-2026-016 freigegeben, der öffentliche statische P-Betrieb mit AP16 und DEC-2026-018. Diese historischen Ergebnisse werden nicht als Zielumgebungsprüfung von MVP 0.5 übernommen. Der öffentliche P-Rechner bleibt nach letztem dokumentiertem Stand auf MVP 0.3, bis der Hostingbefund geklärt und eine neue Bereitstellung ausdrücklich freigegeben ist.

Für MVP 0.5 sind 123 technische Prüfpunkte im Eigentümerkonto bestanden, verteilt auf vier E-/Q-Instanzen und die historische AP5-Kompatibilität. Dies umfasst jeweils den cachefreien Erstabruf aus dem eigenen Mirror, Fach- und Sperrfälle, DE/FR, lokale Standards, tatsächliche ICS-Dateiexporte sowie den kontrollierten Komponentenladefehler mit sichtbarem Fallback und anschliessender Wiederherstellung. Die AP5-Datenkonfiguration bleibt erhalten. E-SharePoint und Q-Teams wurden bei 390, 768 und 1440 Pixeln ohne horizontales Überlaufen geprüft. Der [Installationsbericht](../betrieb/eq-installation-mvp05.md) bezeichnet den genauen Umfang.

David hat Q fachlich abgenommen, die reale Anmeldung mit dem bestehenden B2B-Gast bestätigt und Outlook Desktop als manuell geprüft gemeldet. Diese menschlichen Nachweise bleiben von den 123 technischen Punkten getrennt. Die kurze Gastbestätigung enthält keine vollständige Wiederholung der technischen Matrix im Gastkonto. Outlook Web wurde mit einem tatsächlichen Import geprüft und der Testtermin anschliessend entfernt. Der [Outlook-Nachweis](../betrieb/outlook-pruefung-mvp05.md) dokumentiert die kontrollierten Eigenschaften und die Bereinigung, nicht lediglich eine korrekte ICS-Datei. Die nachfolgenden Haltepunkte bleiben im [aktuellen Betriebsnachweis](../betrieb/eq-installation-mvp05.md) ausgewiesen.

Der Produktumfang bleibt begrenzt: 24 nationale Sozialregeln und 28 ausschliesslich bernische Anbindungen für die übernommenen IVG-/AHVG-/UVG-Pfade sowie ELG, AVIG-ALE und KVG-OKP. Die rechtliche Quellen- und Fallabdeckung der Sozialfreigaben bleibt 2026–2027, nicht modellierte oder unzureichend qualifizierte Konstellationen bleiben gesperrt. Die [zusammengeführte Quellenprüfung](../fachrecht/abnahme-quellenpruefung-mvp05.md) ist einschliesslich dokumentierter Wiederverwendung und Vorbehalten abgenommen. Der AI-Quellenkonflikt wird unverändert behandelt. Der Schweizer Feiertagskatalog enthält 479 Regeln, operativ werden weiterhin nur zwölf bestehende CH-/BE-Feiertagsregeln projiziert. Keine Freigabe zusätzlicher Kantone oder weiterer Sozialerlasse. Oberfläche Deutsch und Französisch, italienische und rätoromanische Bezeichnungsfelder nur in der Datengrundlage.

Noch nicht Teil dieses Nachweises sind insbesondere:

- produktiver Betrieb in einem Dritt-Tenant
- Betrieb auf SharePoint Server vor Ort statt SharePoint Online
- eine zusätzliche Freigabe neuer Gäste, neuer M365-Rechte oder eines erweiterten Q-Demokreises
- GitHub-Veröffentlichung sowie öffentliche P-Bereitstellung und P-Prüfung für MVP 0.5
- automatisierte jährliche Datenpublikation und Mirror-Synchronisation
- formelle WCAG-Konformitätsbewertung

## 8. Referenzen

- [Microsoft: SPFx-Kompatibilitätsmatrix](https://learn.microsoft.com/en-us/sharepoint/dev/spfx/compatibility)
- [Microsoft: SPFx-Lösungen für Microsoft Teams bereitstellen](https://learn.microsoft.com/en-us/sharepoint/dev/spfx/deployment-spfx-teams-solutions)
- [Microsoft: Apps über die SharePoint-App-Website verwalten](https://learn.microsoft.com/en-us/sharepoint/use-app-catalog)
- [Microsoft: Benutzerdefinierte Apps in Teams verwalten](https://learn.microsoft.com/en-us/microsoftteams/teams-custom-app-policies-and-settings)
- [AP10-Prüfnachweis](spfx-produktintegration-ap10.md)
- [MVP-0.5-Deployment und Zielumgebungsprüfung](../betrieb/deployment-mvp-05.md)
- [Aktueller E-/Q-Nachweis](../betrieb/eq-installation-mvp05.md)
- [Fachliche Q-Abnahme und bestätigte Gastanmeldung](../betrieb/abnahme-q-mvp05.md)
- [Definitive lokale MVP-0.5-Artefakte und Baunachweise](../betrieb/releaseartefakte-mvp-05.md)
- [Maschinenlesbarer MVP-0.5-Artefaktnachweis](../../outputs/release-mvp05-2026-09-28/artifact-verification.json)
- [Historischer Paket-, Mirror- und Webnachweis MVP 0.4](../../outputs/release-mvp04-2026-09-22/artifact-verification.json)
- [MVP-0.3-Deployment und historische Testmatrix](../betrieb/deployment-release-2-mvp-03.md)
- [Q-Betriebsanweisung](../betrieb/q-demobetrieb-ap15-betriebsanweisung.md)
- [Sicherheitsrichtlinie](../../SECURITY.md)
- [Lizenz](../../LICENSE)
- [Lizenzabgrenzung](../../LICENSES/README.md)
