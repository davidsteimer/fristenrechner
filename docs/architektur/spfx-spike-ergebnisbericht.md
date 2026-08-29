# Ergebnisbericht SPK-SPFX-01: SPFx-Machbarkeitsspike

| Merkmal | Stand |
| --- | --- |
| Dokumentstatus | abgeschlossen |
| Durchführung | 29. August 2026 |
| Verantwortlich | David Steimer |
| Technische Ausarbeitung | David Steimer mit Codex |
| Arbeitspaket | `SPK-SPFX-01`, GitHub-Issue #16 |
| Zeitbox | höchstens 4,5 Nettoarbeitstage, tatsächlich weniger als ein Nettoarbeitstag |
| Ergebnis | **Go-Empfehlung** |
| Entscheidung | DEC-2026-013 bleibt bis zum Entscheid von David Steimer vorgeschlagen |

## 1. Antwort auf die Entscheidungsfrage

Das geplante SPFx-WebPart kann mit derselben Codebasis und demselben `.sppkg` in SharePoint Online und Microsoft Teams betrieben werden. Der reale Tenantlauf bestätigt zudem, dass der gepinnte GitHub-Provider und ein byteidentischer SharePoint-Mirror denselben freigegebenen AP5-Datenrelease vollständig validieren und erst danach atomar aktivieren.

Die Lösung benötigt keine Microsoft-Graph-Berechtigung, keine zusätzliche Entra-App-Registrierung und kein Geheimnis. Sie braucht einen Tenant-App-Katalog sowie eine lokale Installation der App auf jeder verwendeten SharePoint-Website. Für Teams gehört dazu die dem Team zugeordnete SharePoint-Website.

Damit ist die technische Zielarchitektur machbar und adminarm. Sie ist nicht adminfrei. Das ist kein Stop-Kriterium, sondern eine ehrlich zu dokumentierende Bereitstellungsvoraussetzung.

## 2. Umgesetzter Minimalprototyp

Der Prototyp unter [`spike/spfx/`](../../spike/spfx/README.md) enthält:

- ein WebPart mit der stabilen Component-ID `69cfde67-2e4a-4fed-83ea-5d7ceb8df239`
- die Hosts `SharePointWebPart` und `TeamsTab` im selben Komponentenmanifest
- eine reduzierte Fluent-UI-Oberfläche im Steimer-Design
- technische Texte und Bedienung auf Deutsch und Französisch
- Eingabefelder für Empfangsdatum, Fristdauer, Verfahrensrecht und Gemeinwesen, ausdrücklich noch ohne Fristberechnung
- einen auf einen unveränderlichen Git-Commit gepinnten GitHub-Provider
- einen konfigurierbaren SharePoint-Mirrorprovider auf Basis von `SPHttpClient`
- vollständige JSON-Schema-, Prüfsummen-, Referenz- und Abdeckungsvalidierung
- atomare Aktivierung eines vollständig validierten Release in IndexedDB
- Wiederherstellung des letzten gültigen Aktivstands nach einem Neuladen
- kontrollierten Fallback bei fehlerhaftem oder unvollständigem Netzabruf
- sechs automatisierte positive und negative Tests
- ein gebautes und im Tenant aktiviertes `.sppkg` mit eingebetteten Client-Assets

Der deterministische Rechenkern ist absichtlich nicht Bestandteil des Spikes.

## 3. Prüfergebnisse

| Bereich | Ergebnis | Nachweis |
| --- | --- | --- |
| frische Lockfile-Installation | bestanden | `npm ci --ignore-scripts` |
| automatisierte Spike-Tests | 6 von 6 bestanden | [`local-build.md`](../../spike/spfx/evidence/local-build.md) |
| TypeScript, Sass und ESLint | bestanden, keine Warnung | [`local-build.md`](../../spike/spfx/evidence/local-build.md) |
| Produktionsbundle | bestanden | [`local-build.md`](../../spike/spfx/evidence/local-build.md) |
| SPFx-Paketierung | bestanden | [`package-inventory.md`](../../spike/spfx/evidence/package-inventory.md) |
| Paketstruktur | 21 von 21 Einträgen intakt | `unzip -t` im Paketinventar |
| Tenant-App-Katalog | bestanden | Paketversion 1.0.0.0 gültig und aktiviert |
| SharePoint-Host | bestanden | [`tenant-run.md`](../../spike/spfx/evidence/tenant-run.md) |
| Teams-Host | bestanden | [`tenant-run.md`](../../spike/spfx/evidence/tenant-run.md) |
| GitHub-Provider | bestanden | freigegebenes Release in SharePoint und Teams vollständig validiert |
| SharePoint-Mirrorprovider | bestanden | realer Mirror mit normalen Benutzerleserechten vollständig validiert |
| Providerparität | bestanden | identische Release-ID, Manifestprüfsumme, sieben Artefakte und Abdeckung |
| atomare Aktivierung | bestanden | automatisierter IndexedDB-Test und reale Laufzeitvalidierung |
| Fehler und Fallback | bestanden | Negativtests und Wiederherstellung des letzten gültigen Stands |
| Fluent UI | bestanden | Rendering und Interaktion in beiden Hosts |
| Deutsch und Französisch | bestanden | Laufzeitumschaltung in SharePoint und Teams |
| Tastatur und Fokus | bestanden | manueller Nachweis in SharePoint |
| produktive npm-Abhängigkeiten | null bekannte Schwachstellen | `npm audit --omit=dev` |

Das gebaute und installierte Paket hat die SHA-256-Prüfsumme `558dd7c5c227650b251046e467e38a5c5ed2f59ad2b5147e09aebbf012d763f1`.

## 4. Reale Bereitstellung

Für den Lauf wurde im steimer.ch-Testtenant eine dedizierte gruppenfreie Kommunikationswebsite erstellt. Weil noch kein App-Katalog vorhanden war, wurde der Tenant-App-Katalog als einmalige administrative Voraussetzung aktiviert. Das Spike-Paket wurde dort hochgeladen, als gültig geprüft und tenantweit aktiviert.

Der freigegebene AP5-Datenrelease wurde byteidentisch in einer Dokumentbibliothek der Testsite gespiegelt. Das WebPart validierte den GitHub-Stand und den SharePoint-Mirror gegen dasselbe Manifest. Beide Provider aktivierten die Release-ID `2026-08-29-ap5-approved.1` mit der Abdeckung vom 29. August 2026 bis 31. Dezember 2028.

Für Teams wurde die App zusätzlich auf der zum Testteam gehörenden SharePoint-Website installiert. Danach konnte dieselbe SPFx-Komponente im Standardkanal als Registerkarte gespeichert werden. Ein automatischer Kanalbeitrag wurde dabei bewusst deaktiviert. Der Host wurde als Microsoft Teams erkannt und der GitHub-Release erneut vollständig validiert.

Exakte Tenant-URLs, IDs, Kontoinformationen und Screenshots bleiben ausserhalb des öffentlichen Repository. Der bereinigte, nachprüfbare Laufzeitnachweis steht in [`tenant-run.md`](../../spike/spfx/evidence/tenant-run.md).

## 5. Sicherheits- und Berechtigungsbefund

Das Paket enthält keine `webApiPermissionRequests`, keine Microsoft-Graph-Adresse, keine Entra-App-Registrierung und kein Geheimnis. React und React DOM werden als von SPFx bereitgestellte Komponenten in Version 17.0.1 referenziert. Es wird keine zweite React-Laufzeit gebündelt. Die reproduzierbar erzeugten Teams-Symbole enthalten nur die drei PNG-Pflichtblöcke und keine EXIF-, XMP-, Pfad- oder Herkunftsmetadaten.

Der SharePoint-Mirrorprovider bildet einen konfigurierten Bibliotheksordner auf `GetFileByServerRelativePath(...)/$value` ab und verwendet den `SPHttpClient` des angemeldeten Benutzers. Der Tenantlauf bestätigt, dass normale Benutzerleserechte genügen.

Der vollständige npm-Audit nennt neun moderate Befunde in transitiven Entwicklungsabhängigkeiten der Microsoft-SPFx-Buildtoolchain. Die produktiven Abhängigkeiten sind davon nicht betroffen. Der vorgeschlagene Zwangsfix würde die SPFx-Heft-Plugins auf Version 1.12.0 zurückstufen und widerspricht der festgelegten Toolchain. Dieser Zwangsfix wird deshalb nicht angewandt.

## 6. Technische Erkenntnisse

1. Der technische Paketname im SharePoint-Appmanifest muss die dortige `NameDefinition` erfüllen. Ein typografischer Gedankenstrich führte zur Ablehnung des ersten Pakets. Der technische Name wurde deshalb auf ASCII-nahe Worttrennung ohne Gedankenstrich bereinigt. Der sichtbare WebPart-Titel bleibt unverändert.
2. Die tenantweite Aktivierung macht die App auffindbar, ersetzt aber nicht in jedem Host die lokale Site-Installation. Die Teams-Konfiguration funktionierte erst nach dem Hinzufügen der App auf der dem Team zugeordneten SharePoint-Website.
3. Die Providertrennung hält im realen Tenant. GitHub und SharePoint-Mirror benötigen weder unterschiedliche Datenmodelle noch providerspezifische Fachlogik.
4. IndexedDB funktioniert im SharePoint- und Teams-Browserkontext als lokaler Aktivstand und Fallback.
5. Die Erstbereitstellung bleibt schlank, braucht aber bewusst benannte administrative Schritte.

## 7. Bewertung und Empfehlung

Kein Go- oder Stop-Kriterium bleibt offen. Sämtliche Prüfungen T01 bis T14 sind bestanden. Die Zeitbox wurde deutlich unterschritten.

Empfohlen wird deshalb:

- DEC-2026-013 beschliessen
- ein gemeinsames SPFx-WebPart für SharePoint und Teams als Zielarchitektur festlegen
- den produktiven Code weiterhin in hostneutralen Kern, UI, Provider und dünne Hostadapter trennen
- den öffentlichen GitHub-Provider für den Pilot beibehalten
- den SharePoint-Mirror für spätere Zieltenants als byteidentische Alternative vorsehen
- Tenant-App-Katalog und lokale Site-Installation als verbindliche Bereitstellungsvoraussetzungen dokumentieren
- auf zusätzliche Graph- und Entra-Berechtigungen verzichten, solange keine neue Funktion sie nachweislich benötigt

Die Empfehlung ist ein technisches Go, keine produktive Freigabe. Fachlogik, vollständige Bedienoberfläche, Betriebsautomatisierung und fachliche Abnahme folgen in eigenen Arbeitspaketen.

## 8. Ausstehender Entscheid

David Steimer entscheidet als Architekturverantwortlicher über DEC-2026-013. Codex hat den Spike ausgeführt und die Go-Empfehlung vorbereitet, übernimmt aber keine formelle Freigabe- oder Haftungsverantwortung.
