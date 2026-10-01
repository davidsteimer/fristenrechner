# Fristenrechner Schweiz: Technische Kurzdokumentation

| Merkmal | Stand |
| --- | --- |
| Dokumentzweck | Technische Beurteilung und Übergabe an eine Microsoft-365-IT |
| Interner Produktstand | MVP 0.6, Datenrelease freigegeben und lokal übernommen. Paket `0.6.0.1` auf vier bestehenden E-/Q-Sites installiert und begrenzt nachgeprüft. Q fachlich abgenommen, Gastanmeldung bestätigt und Outlook-Wiederverwendung begründet. Veröffentlichung noch offen |
| Letzter dokumentierter öffentlicher Betriebsstand | MVP 0.5 auf P, GitHub-Veröffentlichung gemäss Produktionsnachweis vom 28. September 2026 |
| Stand | 1. Oktober 2026, einschliesslich E-/Q-Korrekturinstallation und begrenzter Live-Nachtests |
| Zielplattform | SharePoint Online und Microsoft Teams |
| Lizenz | Programmcode AGPL-3.0-only, Dokumentation und kuratierte Daten grundsätzlich CC BY-SA 4.0 |
| Repository | `davidsteimer/fristenrechner` |

MVP 0.6 ergänzt die bestehenden Sozialversicherungspfade um EOG, FamZG, FLG, MVG und ÜLG. AP20C1 bis AP20C3 und die zusammengeführte Quellenprüfung sind abgenommen. Der lokal übernommene Datenrelease enthält 44 national modellierte Regeln und 50 ausschliesslich bernische Anbindungen. [Quellenabnahme](../fachrecht/abnahme-quellen-mvp06.md), [Artefaktnachweis](../betrieb/releaseartefakte-mvp-06.md), [E-/Q-Korrekturinstallation](../betrieb/spfx-korrekturkandidat-mvp06-0601.md) und [Deploymentplan](../betrieb/deployment-mvp-06.md) trennen Datenfreigabe, lokalen Bau und interne technische Prüfung von der noch nicht freigegebenen Veröffentlichung. Das ursprüngliche Webarchiv enthält die UI-Korrektur noch nicht. Ein gesondertes [korrigiertes Webartefakt](../betrieb/publikationspaket-mvp06.md#gebundener-umfang) liegt inzwischen lokal geprüft vor.

Der letzte öffentlich bereitgestellte Release ist MVP 0.5. Sein [E-/Q-Nachweis](../betrieb/eq-installation-mvp05.md) umfasst 123 technische Prüfpunkte, seine [Q-Abnahme](../betrieb/abnahme-q-mvp05.md) die fachliche Abnahme und bestätigte bestehende Gastanmeldung. Der [Produktionsnachweis vom 28. September 2026](../betrieb/produktionsbereitstellung-mvp05-2026-09-28.md) dokumentiert die GitHub-Veröffentlichung und öffentliche P-Bereitstellung von MVP 0.5 mit begrenzter Header-/Cache-Risikoakzeptanz und noch offener direkter Browserstorage-Wertkontrolle. Diese früheren Ergebnisse werden nicht als Zielumgebungsprüfung von MVP 0.6 ausgegeben. Diese Unterlage autorisiert keine zusätzliche Installation, keine neuen Gastrechte und keine Veröffentlichung.

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
| Ergänzende Daten-/Governanceprüfungen | Python 3.12 in `.venv`, Abhängigkeiten gemäss `requirements-data.txt` |

SPFx `1.23.2` ist für SharePoint Online ausgelegt und verwendet die Heft-basierte Toolchain. Microsoft weist für diesen SPFx-Stand Node.js 22, TypeScript bis 5.8 und React 17.0.1 aus. Die Microsoft-Kompatibilitätsmatrix ist die verbindliche Referenz für künftige Toolchain-Aktualisierungen.

Die Entwicklungswerkzeuge werden nur zum Bauen und Prüfen benötigt. Auf dem Arbeitsplatz der Endperson werden weder Node.js noch npm installiert.

Das [korrigierte Webartefakt](../betrieb/publikationspaket-mvp06.md#gebundener-umfang) übernimmt denselben UI-Fix wie das SPFx-Paket 0.6.0.1. Das ursprüngliche MVP-0.6-Webarchiv bleibt historisch erhalten und darf nicht als korrigierter P-Kandidat eingesetzt werden.

## 4. Quellcode, Build und Paket

Die hostneutralen Produktquellen liegen unter `src/`. Die produktive Microsoft-365-Integration liegt unter `spfx/`. Vor dem SPFx-Build werden Rechenkern, Oberfläche und Schemata kontrolliert in das SPFx-Projekt synchronisiert. Diese Kopien sind keine zweite fachliche Quelle.

Grundlegender lokaler Prüflauf mit Node.js `22.23.2`:

```bash
npm ci
npm run check
cd spfx
npm ci
npm run build
```

`npm run check` führt Typprüfung, Kern-/UI-Tests, die Prüfungen der öffentlichen Webausprägung sowie Vorschau- und Webbuild aus. Für MVP 0.6 sind die tatsächlich ausgeführten Prüfgruppen, ihre Ergebnisse und die exakten Artefakte im [lokalen Baunachweis](../betrieb/releaseartefakte-mvp-06.md) aufgeführt. Zahlen früherer Releases werden nicht als Prüfung des neuen Pakets übernommen. Der Heft/Jest-Schritt enthält keine eigenen Jest-Suiten und wird nicht als zusätzlicher Testbestand ausgegeben. Pakettests mit lokalen Hostadaptern ersetzen keine Prüfung in SharePoint oder Teams. Überlappende Testgruppen werden nicht addiert.

Der öffentliche Prüfumfang ist vom privaten Quellen-Vollaudit getrennt. `npm run check`, `npm run test:source-reviews` und `npm run test:data:mvp06` benötigen keine privaten Quellenrohbelege. Der öffentliche Integritätschecker bindet die exakte Freigabe, das Manifest und 63 öffentliche Belege. Er weist 107 nur gebundene, nicht erneut geprüfte Privatbelege ausdrücklich aus. `npm run test:source-reviews:private:mvp06` bleibt streng und schlägt ohne diese Belege fehl. Die Übernahmeschranken verwenden weiterhin den Vollverifier. Der [Publikationsnachweis](../betrieb/publikationspaket-mvp06.md) beschreibt Dateiexport, tatsächliche Läufe und Grenzen.

Der ursprüngliche isolierte MVP-0.6-SPFx-Bau verwendet `npm run build:spfx:mvp06`. Der separate Korrekturbau ist im [Paketnachweis 0.6.0.1](../betrieb/spfx-korrekturkandidat-mvp06-0601.md) mit `scripts/build-mvp06-spfx-0601.mjs` dokumentiert. Der gewöhnliche Build im Unterordner `spfx/` schreibt an seinen Standardausgabepfad. Ein Neubau ersetzt nicht automatisch das bereits gebundene Artefakt.

Das konkret freigegebene und intern auf E/Q nachgeprüfte Paket hat folgende Identität. Die begrenzte Installation autorisiert keine Installation auf zusätzlichen oder fremden Tenants:

| Merkmal | Wert |
| --- | --- |
| Datei | [`fristenrechner-schweiz-0.6.0.1.sppkg`](../../outputs/release-mvp06-spfx-0.6.0.1-2026-10-01/artifacts/fristenrechner-schweiz-0.6.0.1.sppkg) |
| Paketversion | `0.6.0.1` |
| Grösse und SHA-256 | Verbindlich im [Korrektur- und Installationsnachweis](../betrieb/spfx-korrekturkandidat-mvp06-0601.md) |
| Solution-ID | `13090feb-a6bf-40fa-9d3c-ec8d90516a60` |
| Component-ID | `596c7f1c-4d3e-4da8-a7be-27a96024f37c` |
| Unterstützte Hosts | `SharePointWebPart`, `TeamsTab` |
| Client-Assets | im `.sppkg` enthalten |
| Tenantweite automatische Bereitstellung | nein, Installation pro Zielwebsite |

Die Prüfsumme bezeichnet ausschliesslich das konkret gebundene lokale Paket. Ein unabhängiger byteidentischer Zweitbau wird nicht behauptet. Die bekannte SPFx-Buildvarianz bleibt zu beachten. Ein Neubau mit abweichender Prüfsumme benötigt einen eigenen Paketnachweis. Der allgemeine Standardpfad `spfx/sharepoint/solution/fristenrechner-schweiz.sppkg` darf weder als aktuelles Auslieferungsartefakt noch als Rückfallpaket angenommen werden. Massgebend ist stets der explizit bezeichnete und geprüfte Dateistand.

## 5. Daten- und Sicherheitsmodell

MVP 0.6 verwendet den lokal freigegebenen Datenrelease `2026-10-01-mvp-06-approved.1`. Seine GitHub-Standardadresse ist auf den vollständigen lokalen Commit `19b37336974f3ba7c72333763e1272425239b8cd` gepinnt. Dieser MVP-0.6-Commit ist noch nicht veröffentlicht, der neue Standardpfad ist deshalb noch keine öffentliche Datenquelle. Eine gesondert freigegebene E-/Q-Installation muss zunächst die vollständigen neuen SharePoint-Mirrors verwenden. Veröffentlichung und anschliessender öffentlicher Bytevergleich sind Voraussetzung für den neuen GitHub-Betriebsmodus. Ein frei beweglicher Branch wie `main` wird als produktive Datenquelle abgewiesen. Der bereits veröffentlichte MVP-0.5-Pin bleibt davon unberührt.

| Komponentenvertrag | MVP 0.6 |
| --- | --- |
| Manifest-/Mindestconsumerformat | `6.0.0` |
| Sozialverfahrenskatalog | `2.0.0` |
| Spezialregimekatalog | `3.0.0` |
| Kalenderkomponente | `2.0.0` |
| Schweizer Feiertagskatalog | `1.0.0` |

Der neue Consumer verarbeitet weiterhin die Formate 1 bis 5. Umgekehrt kann der MVP-0.5-Consumer Format 6 nicht lesen. Deshalb müssen App und Datenpfad koordiniert aktualisiert werden. Der vollständige MVP-0.6-Mirror umfasst Manifest und zehn Nutzartefakte, einschliesslich `holiday-catalogs/ch-holiday-catalog.json` und `social-procedures/ch-social-procedures.json`. Die neun Nicht-Sozialkatalog-Artefakte bleiben gegenüber MVP 0.5 byteidentisch.

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

Für MVP 0.6 sind die ursprüngliche technische Eigentümerprüfung mit Paket 0.6.0.0 und die anschliessende kontrollierte Korrekturinstallation 0.6.0.1 auf vier bestehenden E-/Q-Sites dokumentiert. Die begrenzten Nachtests beheben den SharePoint-Lesbarkeitsbefund und bestätigen die beiden Teamsansichten sowie den historischen AP5-Datenpin. [Aktueller Korrekturabschluss](../betrieb/spfx-korrekturkandidat-mvp06-0601.md). Die alten Fehlerzeilen bleiben historisch erhalten. Die [manuelle Q-Abnahme und Gastanmeldung sind durch David bestätigt](../betrieb/abnahme-q-mvp06.md). R06-12 ist durch ausdrücklich beschlossene und technisch begründete Wiederverwendung abgeschlossen, nicht durch einen neuen Import. Die nachstehenden MVP-0.5-Angaben sind frühere Freigabe- und Produktionsnachweise.

Der begrenzte gruppenbasierte Q-Gastbetrieb wurde mit AP15 und DEC-2026-016 freigegeben, der öffentliche statische P-Betrieb mit AP16 und DEC-2026-018. Der letzte dokumentierte Folgeausbau ist MVP 0.5. Sein [Produktionsnachweis](../betrieb/produktionsbereitstellung-mvp05-2026-09-28.md) dokumentiert die erfolgte P-Bereitstellung und GitHub-Veröffentlichung. D04 ist mit begrenzter Risikoakzeptanz nicht bestanden, bei D05 bleibt eine akzeptierte Cacheabweichung und bei D10 die direkte Browserstorage-Wertkontrolle offen. Diese Aussagen beruhen auf dem Nachweis vom 28. September, nicht auf einem neuen Liveabruf. Vor MVP 0.6 sind die tatsächlichen Zielzustände und die Hostingabweichungen erneut zu prüfen. Die frühere Risikoakzeptanz wird nicht automatisch übertragen.

Für MVP 0.5 sind 123 technische Prüfpunkte im Eigentümerkonto bestanden, verteilt auf vier E-/Q-Instanzen und die historische AP5-Kompatibilität. Dies umfasst jeweils den cachefreien Erstabruf aus dem eigenen Mirror, Fach- und Sperrfälle, DE/FR, lokale Standards, tatsächliche ICS-Dateiexporte sowie den kontrollierten Komponentenladefehler mit sichtbarem Fallback und anschliessender Wiederherstellung. Die AP5-Datenkonfiguration bleibt erhalten. E-SharePoint und Q-Teams wurden bei 390, 768 und 1440 Pixeln ohne horizontales Überlaufen geprüft. Der [Installationsbericht](../betrieb/eq-installation-mvp05.md) bezeichnet den genauen Umfang.

David hat Q fachlich abgenommen, die reale Anmeldung mit dem bestehenden B2B-Gast bestätigt und Outlook Desktop als manuell geprüft gemeldet. Diese menschlichen Nachweise bleiben von den 123 technischen Punkten getrennt. Die kurze Gastbestätigung enthält keine vollständige Wiederholung der technischen Matrix im Gastkonto. Outlook Web wurde mit einem tatsächlichen Import geprüft und der Testtermin anschliessend entfernt. Der [Outlook-Nachweis](../betrieb/outlook-pruefung-mvp05.md) dokumentiert die kontrollierten Eigenschaften und die Bereinigung, nicht lediglich eine korrekte ICS-Datei. Die nachfolgenden Haltepunkte bleiben im [aktuellen Betriebsnachweis](../betrieb/eq-installation-mvp05.md) ausgewiesen.

Der lokal übernommene MVP-0.6-Umfang umfasst 44 nationale Sozialregeln und 50 ausschliesslich bernische Anbindungen. Zu den bestehenden IVG-/AHVG-/UVG-Pfaden sowie ELG, AVIG-ALE und KVG-OKP kommen die qualifizierten EOG-, FamZG-, FLG-, MVG- und ÜLG-Pfade hinzu. Die 24 früheren Regeln und 28 Anbindungen bleiben fachlich unverändert. Die rechtliche Quellen- und Fallabdeckung bleibt 2026–2027, nicht modellierte oder unzureichend qualifizierte Konstellationen bleiben gesperrt. Nationale Modellierung ist keine Freigabe weiterer Kantone.

Die [MVP-0.6-Quellenprüfung](../fachrecht/abnahme-quellen-mvp06.md) ist einschliesslich dokumentierter Wiederverwendung und Vorbehalten abgenommen. Die 77 Manifestreferenzen und 82 zusätzlichen historischen Katalogreferenzen ergeben 159 unterschiedliche Quellen-IDs, nicht 159 neu gelesene Erlasse. Der AI-Quellenkonflikt bleibt unverändert. Der Schweizer Feiertagskatalog enthält weiterhin 479 Regeln, operativ werden nur zwölf bestehende CH-/BE-Feiertagsregeln projiziert. Oberfläche Deutsch und Französisch, italienische und rätoromanische Bezeichnungsfelder nur in der Datengrundlage. Der lokale MVP-0.6-Bau übernimmt keine E-/Q-/P-Prüfergebnisse von MVP 0.5.

Noch nicht Teil dieses Nachweises sind insbesondere:

- produktiver Betrieb in einem Dritt-Tenant
- Betrieb auf SharePoint Server vor Ort statt SharePoint Online
- eine zusätzliche Freigabe neuer Gäste, neuer M365-Rechte oder eines erweiterten Q-Demokreises
- vollständige technische Prüfmatrix unter dem Gastkonto oder erneuter Outlook-Import mit MVP 0.6. Die [Benutzerbestätigung und beschlossene Wiederverwendung](../betrieb/abnahme-q-mvp06.md) haben einen ausdrücklich begrenzten Nachweisumfang
- GitHub-Veröffentlichung von MVP 0.6 sowie öffentliche P-Bereitstellung und P-Prüfung mit passendem neuem Webartefakt
- automatisierte jährliche Datenpublikation und Mirror-Synchronisation
- formelle WCAG-Konformitätsbewertung

## 8. Referenzen

- [Microsoft: SPFx-Kompatibilitätsmatrix](https://learn.microsoft.com/en-us/sharepoint/dev/spfx/compatibility)
- [Microsoft: SPFx-Lösungen für Microsoft Teams bereitstellen](https://learn.microsoft.com/en-us/sharepoint/dev/spfx/deployment-spfx-teams-solutions)
- [Microsoft: Apps über die SharePoint-App-Website verwalten](https://learn.microsoft.com/en-us/sharepoint/use-app-catalog)
- [Microsoft: Benutzerdefinierte Apps in Teams verwalten](https://learn.microsoft.com/en-us/microsoftteams/teams-custom-app-policies-and-settings)
- [AP10-Prüfnachweis](spfx-produktintegration-ap10.md)
- [MVP-0.6-Deploymentplan und getrennte Freigabeschritte](../betrieb/deployment-mvp-06.md)
- [Definitive lokale MVP-0.6-Artefakte und Prüfsummen](../betrieb/releaseartefakte-mvp-06.md)
- [MVP-0.6-Quellenabnahme](../fachrecht/abnahme-quellen-mvp06.md)
- [Dokumentierter MVP-0.5-Produktionsstand](../betrieb/produktionsbereitstellung-mvp05-2026-09-28.md)
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
