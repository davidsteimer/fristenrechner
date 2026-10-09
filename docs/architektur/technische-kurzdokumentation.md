# Fristenrechner Schweiz: Technische Kurzdokumentation

| Merkmal | Stand |
| --- | --- |
| Dokumentzweck | Technische Beurteilung und Übergabe an eine Microsoft-365-IT |
| Interner Produktstand | MVP 0.7, Anwendung `0.7.0`, SPFx-Paket `0.7.0.2`, auf den vier bestehenden E-/Q-Instanzen installiert und Q am 9. Oktober 2026 abgenommen |
| Letzter dokumentierter öffentlicher Betriebsstand | MVP 0.6 gemäss Produktionsnachweis vom 1. Oktober 2026 |
| Publikationsstatus MVP 0.7 | Lokale Publikationsvorbereitung. Gesonderte ausdrückliche GitHub- und P-Freigaben stehen aus |
| Stand | 9. Oktober 2026 |
| Zielplattform | SharePoint Online und Microsoft Teams |
| Lizenz | Programmcode AGPL-3.0-only, Dokumentation und kuratierte Daten grundsätzlich CC BY-SA 4.0 |
| Repository | `davidsteimer/fristenrechner` |

MVP 0.7 aktiviert die qualifizierten kantonalen Feiertagszuordnungen für die unterstützten Bundesverfahren und ergänzt die einheitliche Datumseingabe aus AP21. Der [Vollzugsnachweis für 0.7.0.2](../betrieb/eq-vollzugsnachweis-mvp07-0702.md) und die [Q-Abnahme](../betrieb/abnahme-q-mvp07.md) trennen technische Hostprüfungen, begründete Wiederverwendung und menschliche Geräte-/Gastbestätigung. Die Nachweisgrenzen F08 und T09 bleiben erhalten. Diese Unterlage autorisiert keine zusätzliche Installation, neue Gastrechte oder Veröffentlichung.

## 1. Kurzbeurteilung der Tenantportabilität

Der Fristenrechner ist für die Installation in anderen Microsoft-365-Tenants ausgelegt. Die clientseitige SharePoint-Framework-Lösung, kurz SPFx, benötigt keinen eigenen Anwendungsserver, keine Datenbank und keine tenantfremde Entra-ID-App. Ein tatsächlich abgenommener Dritt-Tenant-Betrieb wird damit noch nicht behauptet.

Das `.sppkg` enthält die Client-Assets. Es enthält keine Zieladresse des steimer.ch-SharePoint-Tenants und beantragt keine Microsoft-Graph- oder sonstigen Web-API-Berechtigungen. Die SharePoint-Website wird zur Laufzeit aus dem angemeldeten Microsoft-365-Kontext bestimmt. `https://steimer.ch` ist im Paket als Herstellerinformation hinterlegt, nicht als technischer Laufzeitendpunkt.

Die Erstinstallation braucht Zugriff auf einen App-Katalog. Für die direkte Teams-Registerkarte kommt die Zulassung der organisationsinternen Teams-App hinzu. Die spätere Nutzung des Rechners erfordert keine Admin-Rolle. Der Betrieb ist damit adminarm, nicht adminfrei.

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
| Release-Service | Validiert einen vollständigen Regel- und Kalenderrelease vor dessen atomarer Aktivierung |
| GitHub-Provider | Liest einen auf einen unveränderlichen Commit gepinnten öffentlichen Datenrelease |
| SharePoint-Provider | Liest einen byteidentischen Mirror auf derselben SharePoint-Website |
| Browser-Store | Hält vollständig validierte Daten in IndexedDB, getrennt nach tatsächlicher Provider-/Datenkonfiguration |

Der Rechenkern kennt weder SharePoint noch Teams. Der Hostadapter enthält keine Fristenlogik. Ein Fallback ist nur innerhalb derselben konkreten Datenkonfiguration zulässig. Ein anderer Mirror, ein historischer AP5-Cache oder ein alter originweiter Aktivzeiger kann einen fehlgeschlagenen Erstabruf der neuen Quelle nicht ersetzen.

Die statische öffentliche P-Ausprägung verwendet denselben Kern und dieselbe Oberfläche. Sie bettet den geprüften Datenrelease beim Build ein und benötigt keinen Laufzeitabruf von GitHub oder SharePoint. Sie läuft auf der bestehenden steimer.ch-Hosting-Infrastruktur und gehört nicht zur Dritt-Tenant-SPFx-Installation. Der lokal geprüfte [korrigierte MVP07-Webkandidat](../../outputs/release-mvp07-web-corrected-0702-2026-10-09/artifacts/fristenrechner-mvp07-steimer-web-corrected-0702.zip) enthält die Darstellungskorrektur von `0.7.0.2`. Er umfasst 606’775 Bytes, SHA-256 `9f986c7d8f8d6366914f9605f46b2fd87987fcbdaf17875ce9d2c4d044b07228`. Sein [lokaler Artefaktnachweis](../../outputs/release-mvp07-web-corrected-0702-2026-10-09/artifact-verification.json) ist keine Browser-/Hostingabnahme oder Publikationsfreigabe. Das ursprüngliche Webarchiv vom 8. Oktober bleibt historisch erhalten.

## 3. Toolchain

| Komponente | Gebundener Stand |
| --- | --- |
| Node.js | `22.23.2` |
| npm | `10.9.8` |
| SharePoint Framework | `1.23.2` |
| Buildsystem | Rush Stack Heft `1.2.17` |
| TypeScript | `5.8.3` |
| React | `17.0.1` |
| Fluent UI React | `8.106.4` |
| Testausführung | Node Test Runner, TypeScript über `tsx`, direkte ES5- und Paketbundle-Regression |
| Datenformate | JSON, JSON Schema Draft 2020-12, ISO-Kalenderdaten, SHA-256 |
| Ergänzende Daten-/Governanceprüfungen | Python 3.12 in `.venv`, Abhängigkeiten gemäss `requirements-data.txt` |

Diese Versionen beschreiben den nachgewiesenen Build, nicht die jeweils neuesten verfügbaren Werkzeuge. Vor einem Upgrade ist die offizielle SPFx-Kompatibilitätsmatrix gesondert zu prüfen. Auf dem Arbeitsplatz der Endperson werden weder Node.js noch npm benötigt.

## 4. Quellcode, Prüfungen und Paket

Die führenden Produktquellen liegen unter `src/`, die Microsoft-365-Integration unter `spfx/`. Vor SPFx-Test und -Build werden Produktquellen und Schemata mechanisch synchronisiert. Diese Kopien sind keine zweite fachliche Quelle.

Grundlegende lokale Prüfung aus dem Repositoryhauptordner mit der gebundenen Node-Version:

```bash
npm ci
npm run check
npm run test:source-reviews
npm run check:integrity:mvp07
npm run test:data:mvp07
npm run test:portability:mvp07
```

Die Datenprüfung setzt die eingerichtete Python-Umgebung voraus. `npm run check` umfasst Typprüfung, Kern-/UI-Tests, öffentliche Webtests sowie Vorschau- und Webbuild. `check:integrity:mvp07` ist auch Bestandteil von `test:data:mvp07`, keine zusätzliche unabhängige Prüfung. Die öffentlichen Integritätsprüfungen sind vom privaten Quellen-Vollaudit `npm run test:source-reviews:private:mvp07` getrennt. Hashgebundene Privatbelege werden ohne Originaldateien nicht als erneut geprüft ausgegeben. Die strenge Übernahmeprüfung bleibt bestehen. Tatsächlich ausgeführte öffentliche Integritäts- und bereinigte Exportprüfungen sowie ihre Grenzen sind im [Publikationspaket](../betrieb/publikationspaket-mvp07.md) gesondert ausgewiesen.

Der isolierte Korrekturbau verwendet `scripts/build-mvp07-spfx-0702.mjs`. Sein [Paketnachweis](../betrieb/darstellungskorrektur-mvp07-0702.md) dokumentiert unter anderem 186 SPFx-Quell-/Providerprüfungen und 83 Prüfungen des kompilierten und tatsächlich paketierten Codes. Lokale Pakettests ersetzen keine SharePoint-/Teams-Prüfung. Überlappende Prüfgruppen werden nicht addiert. Der Heft/Jest-Schritt ohne eigene Jest-Suiten wird nicht als zusätzlicher Testbestand gezählt.

| Merkmal | Gebundenes E-/Q-Artefakt |
| --- | --- |
| Datei | [`fristenrechner-schweiz-0.7.0.2.sppkg`](../../outputs/release-mvp07-spfx-0.7.0.2-2026-10-09/artifacts/fristenrechner-schweiz-0.7.0.2.sppkg) |
| Anwendung / Paketversion | `0.7.0` / `0.7.0.2` |
| Grösse | 291’895 Bytes |
| SHA-256 | `8bae0c1ea64b4482abea8fcdbd7aa5c576f6d552735b5a3e5f01a9ea68ab71db` |
| Solution-ID | `13090feb-a6bf-40fa-9d3c-ec8d90516a60` |
| Component-ID | `596c7f1c-4d3e-4da8-a7be-27a96024f37c` |
| Unterstützte Hosts | `SharePointWebPart`, `TeamsTab` |
| Client-Assets | im `.sppkg` enthalten |
| Automatische tenantweite Installation | nein, Installation pro Zielwebsite |

Die Prüfsumme bezeichnet dieses konkrete Artefakt. Ein unabhängiger byteidentischer SPFx-Zweitbau wird nicht behauptet. Ein Neubau mit abweichender Prüfsumme benötigt einen eigenen Nachweis. Der generische Ausgabepfad `spfx/sharepoint/solution/fristenrechner-schweiz.sppkg` bezeichnet weder automatisch das aktuelle Paket noch ein Rückfallpaket.

Ein Katalogwechsel kann sämtlichen bereits verbundenen Instanzen neuen Code liefern. Die kontrollierte Rückfallvorlage bindet deshalb ein höher versioniertes [Wiederherstellungspaket `0.7.0.3`](../betrieb/wiederherstellungskandidat-mvp07-0703.md), die gesicherten Format-6-Mirrors und geschützte Standards. Es wurde nicht eingesetzt. Kein unkontrollierter Paketdowngrade und kein Browserdatenreset. Die [Installationsvorlage](../betrieb/eq-installationsvorlage-mvp07-0702.md) beschreibt die Reihenfolge.

## 5. Daten- und Sicherheitsmodell

MVP 0.7 verwendet `2026-10-08-mvp-07-approved.1`, Manifest SHA-256 `fe1dfa0a241ac1c0e083998f05fb43e058f3c1be223f35cd276d3df436941597`. Die GitHub-Standardadresse ist an den vollständigen Datencommit `331ef3e19d43a6b51d91a502acd6b5443071599f` gebunden. Dieser neue Pin ist noch nicht als MVP 0.7 veröffentlicht. E/Q verwenden ihre vollständigen SharePoint-Mirrors. Der GitHub-Betriebsmodus setzt die gesondert freigegebene Veröffentlichung und den öffentlichen Rohbytevergleich voraus. Ein beweglicher Branch wie `main` ist keine zulässige produktive Datenquelle.

| Komponentenvertrag | MVP 0.7 |
| --- | --- |
| Manifest / Mindestconsumer | `7.0.0` |
| Sämtliche 32 Regelkalender | `3.0.0` |
| Schweizer Feiertagskatalog | `2.0.0` |
| Rechtsprofile | `1.0.0` |
| Spezialregimekatalog | `3.0.0` |
| Sozialverfahrenskatalog | `2.0.0` |

Der neue Consumer unterstützt weiterhin historische Formate 1 bis 6. Ein MVP-0.6-Consumer kann Format 7 nicht verarbeiten. App und Datenpfad müssen deshalb koordiniert wechseln. Ein vollständiger Mirror enthält **41 Dateien**: Manifest, 32 Kalender, fünf Profile und je einen Feiertags-, Spezialregime- und Sozialverfahrenskatalog. Die [Mirroranleitung](../betrieb/installation-und-betrieb-dritttenants.md#62-variante-b-tenantinterner-sharepoint-mirror) führt die tatsächlichen Manifestpfade auf.

Vor der Aktivierung werden insbesondere Schema und Format, Freigabestatus, sichere relative Pfade, Bytes und SHA-256, Content-IDs, Referenzen und Abdeckung geprüft. Die Kalenderaktivierung trennt 198 Herkunftsentscheide von 104 terminalen Verfahrensbindungen. Rollen und regionale Angaben werden ausdrücklich qualifiziert. Es gibt weder einen ersten zufälligen Kalendertreffer noch eine freie Vereinigung konkurrierender Listen oder einen stillen BE-/CH-Ersatzkalender.

Bei einer ungültigen Quelle kann nur ein zuvor vollständig validierter Stand derselben Datenkonfiguration helfen. Ohne solchen Stand ist der Rechner gesperrt. Auch gültige Daten erlauben kein definitives Fristende, wenn notwendige Fallfakten fehlen oder eine vorbehaltene Januarvariante zu unterschiedlichen rechtlichen Ergebnissen führt.

Das Paket enthält keine `webApiPermissionRequests`, kein Geheimnis und keine Entra-ID-App-Registrierung. Es ist nicht domainisoliert und läuft im Kontext der angemeldeten Person. Der SharePoint-Provider beschränkt Abrufe auf die aktuelle Website.

Die Berechnung und der ICS-Export erfolgen lokal. Fristdaten und die optionale Referenz werden nicht an GitHub oder einen Fachdienst übertragen. Persönliche Standards liegen im Browser. Version 4 ersetzt keine fehlenden Rollen-, Orts- oder Regionalfakten durch Annahmen. Die Migration aus v3 speichert erst nach ausdrücklichem Speichern v4. Datum, Referenz, Resultat und fallbezogene Regionalantworten werden nicht als Standards persistiert. IndexedDB enthält ausschliesslich validierte Regel- und Kalenderdaten.

## 6. Netzwerk und Betrieb

| Datenquellenmodus | Laufzeitverbindung | Voraussetzung |
| --- | --- | --- |
| Öffentlicher GitHub-Release | HTTPS zu `raw.githubusercontent.com` | Vollständig veröffentlichter Pin, Zielnetz erlaubt dessen Abruf |
| SharePoint-Mirror | SharePoint-REST auf derselben Website | Angemeldete Person kann alle 41 Mirrordateien lesen |

Mit dem Mirror entfällt der externe GitHub-Abruf zur Laufzeit. Die Übernahme neuer Releases ist ein kontrollierter manueller Schritt, kein automatischer Replikationsdienst. Die regelbasierten Kalender benötigen keine jährlichen Datumslisten. Die fachliche Quellenprüfung erfolgt dennoch jährlich spätestens am 15. November und anlassbezogen. Eine Prüfung ohne regelrelevante Änderung erzeugt bewusst keinen neuen Datenrelease. Quellenregister und Prüfereignisse können getrennt vom Laufzeitmirror gespiegelt werden.

## 7. Nachgewiesener Stand und Grenzen

Die [Q-Abnahme vom 9. Oktober](../betrieb/abnahme-q-mvp07.md) schliesst R07-C. Der [technische Vollzugsnachweis](../betrieb/eq-vollzugsnachweis-mvp07-0702.md) dokumentiert den Katalogwechsel, vier bestehende Appinstallationen, gebundene Mirrors, Fach-/Sperrfälle, DE/FR, Datumseingabe, Standards, tatsächliche Kalenderdateien und Desktop-Hostdarstellung. David bestätigt reale Geräteprüfung und Gastzugriff als menschlichen Gesamtnachweis. Nicht angegebene Gerätemodelle, VoiceOver-Einzelbeobachtungen oder Gast-Einzelfälle werden daraus nicht rekonstruiert.

F08 bleibt als Anzeigeortabweichung dokumentiert: Die Release-ID steht beim Regel-/Kalenderstand im Seitenfuss, nicht innerhalb der Rechenspur. T09 verwendet gekennzeichnete frühere E-/AP5-Belege und den frischen N04-Kompatibilitätsnachweis. Ein neuer vollständiger AP5-Netzabruf oder eine frische Q-seitige AP5-Netzprüfung wird nicht behauptet.

Alle acht aktuellen E-/Q-ICS-Dateien wurden tatsächlich gespeichert und geprüft, ohne Outlook-Import. Die [technische Wiederverwendungsbewertung](../betrieb/outlook-wiederverwendung-mvp07.md) für frühere Outlook-Nachweise ist ein Vorschlag, noch keine Abnahme durch David.

Der [öffentliche Produktionsnachweis vom 1. Oktober](../betrieb/produktionsbereitstellung-mvp06-2026-10-01.md) betrifft weiterhin MVP 0.6. Die dort begrenzt akzeptierten Header-/Cacheabweichungen werden nicht automatisch für MVP 0.7 akzeptiert. GitHub-Push und P-Bereitstellung brauchen eigene Freigaben, P zusätzlich eine frische Sicherung und öffentliche Zielprüfung.

Die [Quellenabnahme MVP 0.7](../fachrecht/abnahme-quellen-mvp07.md) gilt mit dokumentierter Wiederverwendung und Vorbehalten. Der Feiertagskatalog umfasst 491 Regeln, darunter die 479 erhaltenen bisherigen Regeln und zwölf zusätzliche SO-Prozessregeln. Die nationale Kalenderabdeckung betrifft die unterstützten Bundesverfahren StPO, ZPO, BGG und VwVG. Sie ist keine vollständige Freigabe sämtlicher Rechtsgebiete oder Fallkonstellationen.

- Das kantonale Verwaltungsverfahren bleibt auf das modellierte Berner Recht begrenzt. Die 44 national modellierten Sozialregeln und 50 Berner Anbindungen bleiben fachlich unverändert, auf Bern und 2026–2027 beschränkt.
- Die Kalenderabdeckung beginnt am 29. August 2026 ohne pauschales Enddatum. Normgeltung, Gebietsstände, Profil- und Releasegrenzen bleiben massgebend.
- Vier unsichere Januarzuordnungen werden jeweils durch zwei vollständige Berechnungen geprüft. Bei unterschiedlichem rechtlichem Ergebnis gibt es kein definitives Resultat und keinen Export. GR-/NE-Vorbehalte bleiben davon getrennte berechenbare Grenzen. Die beschlossene AI-Behandlung und der gekennzeichnete ergänzende Freiburger Praxisbeleg bleiben unverändert.
- Eigenständiges kommunales Recht ist ausgeschlossen. Örtliche Unterschiede aus Bundes- oder kantonalem Recht werden nur im freigegebenen Umfang berücksichtigt.
- Produktsprachen bleiben Deutsch und Französisch. IT-/Rumantsch-Bezeichnungen in Daten sind keine zusätzliche Oberflächensprache.
- Dritt-Tenant-Betrieb, SharePoint Server vor Ort, neue Gast-/M365-Rechte, automatisierte Mirror-Synchronisation und eine formelle WCAG-Konformitätsbewertung sind nicht durch diese Unterlage nachgewiesen.

## 8. Referenzen

- [Microsoft: SPFx-Kompatibilitätsmatrix](https://learn.microsoft.com/en-us/sharepoint/dev/spfx/compatibility)
- [Microsoft: SPFx-Lösungen für Microsoft Teams bereitstellen](https://learn.microsoft.com/en-us/sharepoint/dev/spfx/deployment-spfx-teams-solutions)
- [Microsoft: Apps über die SharePoint-App-Website verwalten](https://learn.microsoft.com/en-us/sharepoint/use-app-catalog)
- [Microsoft: Benutzerdefinierte Apps in Teams verwalten](https://learn.microsoft.com/en-us/microsoftteams/teams-custom-app-policies-and-settings)
- [MVP-0.7-Deploymentplan](../betrieb/deployment-mvp-07.md)
- [Ursprüngliche lokale MVP-0.7-Artefakte, als historischer Baunachweis](../betrieb/releaseartefakte-mvp-07.md)
- [Korrekturpaket 0.7.0.2 und tatsächliche Paketprüfungen](../betrieb/darstellungskorrektur-mvp07-0702.md)
- [Aktuelle E-/Q-Installation und Nachtests](../betrieb/eq-vollzugsnachweis-mvp07-0702.md)
- [Q-Abnahme und Nachweisgrenzen](../betrieb/abnahme-q-mvp07.md)
- [Installation und Betrieb in Dritt-Tenants](../betrieb/installation-und-betrieb-dritttenants.md)
- [Q-Betriebsanweisung](../betrieb/q-demobetrieb-ap15-betriebsanweisung.md)
- [Sicherheitsrichtlinie](../../SECURITY.md)
- [Lizenz](../../LICENSE) und [Lizenzabgrenzung](../../LICENSES/README.md)
