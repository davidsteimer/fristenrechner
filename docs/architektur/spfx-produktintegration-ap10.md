# AP10: SPFx-Produktintegration und Testpaket

| Merkmal | Wert |
| --- | --- |
| Arbeitspaket | AP10, GitHub-Issue #23 |
| Stand | 29. August 2026 |
| Status | korrigierter Installationskandidat, Tenant-Wiederholungsprüfung und Teams-Tests ausstehend |
| Verantwortliche Person | David Steimer |
| KI-Arbeitsinstrument | Codex ohne formelle Freigabe- oder Haftungsverantwortung |
| Datenbasis | `2026-08-29-ap5-approved.1` |
| Rechenkern | AP8 v0.1 |
| Oberfläche | AP9 v0.1 |
| Zielarchitektur | DEC-2026-013 |
| Paketversion | `0.1.0.2` |

## 1. Ergebnis des lokalen Integrationsschritts

AP10 verbindet den abgenommenen Rechenkern und die Rechneroberfläche mit einem produktiven SharePoint-Framework-WebPart. Dasselbe Komponentenmanifest unterstützt `SharePointWebPart` und `TeamsTab`. Das erzeugte Paket enthält alle Client-Assets sowie die Teams-Symbole und verlangt keine extern gehosteten Anwendungsskripte.

Der Machbarkeitsspike unter `spike/spfx/` bleibt als abgeschlossener Nachweis unverändert. Die produktive Lösung liegt getrennt unter `spfx/`. Rechenkern und UI werden vor jedem Test, Build und lokalen Start aus `src/core/` und `src/ui/` synchronisiert. Diese erzeugte Kopie wird nicht versioniert. Dadurch bleiben die hostneutralen Quellen verbindlich und es entsteht kein zweiter Rechenkern für Microsoft 365.

```text
GitHub-Release oder SharePoint-Mirror
                 ↓
       providerneutraler Abruf
                 ↓
 vollständige Releasevalidierung
                 ↓
  atomare Aktivierung in IndexedDB
                 ↓
       AP8-Datenmodell und Kern
                 ↓
           AP9-Oberfläche
                 ↓
      SharePoint oder Teams
```

## 2. Technischer Vertrag

### 2.1 Produktkomponenten

| Element | Kennung oder Version |
| --- | --- |
| SPFx | `1.23.2` |
| Node.js | `22.23.2` |
| React | `17.0.1` |
| Fluent UI React | `8.106.4` |
| Solution-ID | `13090feb-a6bf-40fa-9d3c-ec8d90516a60` |
| Feature-ID | `3edf1509-41e9-4a2f-8005-df510eec43b6` |
| Component-ID | `596c7f1c-4d3e-4da8-a7be-27a96024f37c` |
| Paket | `spfx/sharepoint/solution/fristenrechner-schweiz.sppkg` |

Die Toolchain entspricht der am 29. August 2026 publizierten [Microsoft-Kompatibilitätsmatrix](https://learn.microsoft.com/sharepoint/dev/spfx/compatibility). SPFx 1.23.2 unterstützt Node.js 22, TypeScript bis 5.8 und React 17.0.1. Die [Versionshinweise zu SPFx 1.23.2](https://learn.microsoft.com/sharepoint/dev/spfx/release-1.23.2) bestätigen diesen aktuellen Patchstand. Neue SPFx-Projekte verwenden die [Heft-basierte Toolchain](https://learn.microsoft.com/sharepoint/dev/spfx/toolchain/sharepoint-framework-toolchain-rushstack-heft). Die Teams-Exposition folgt der Microsoft-Vorgabe, `TeamsTab` in `supportedHosts` einzutragen.

### 2.2 Hostadapter

Der WebPart-Adapter übernimmt nur folgende Aufgaben:

- Erkennung von SharePoint oder Microsoft Teams
- Bereitstellung des authentifizierten `SPHttpClient`
- Auswahl und Konfiguration des Releaseproviders
- Start des Release-Service
- Anzeige eines sicheren Lade-, Fehler- oder Fallbackzustands
- Rendering der unveränderten AP9-Komponente

Der Adapter berechnet keine Frist und klassifiziert keine Rechtsregel.

### 2.3 Datenquellen

Die WebPart-Eigenschaften enthalten den aktiven Provider, eine GitHub-Basisadresse und einen optionalen SharePoint-Mirrorpfad.

Der GitHub-Provider akzeptiert nur HTTPS-Adressen auf `raw.githubusercontent.com`, die auf einen vollständigen 40-stelligen Git-Commit gepinnt sind. Zugangsdaten, URL-Abfragen und Fragmente werden abgewiesen. Der MVP-Standard verweist auf den unveränderlichen Commit des freigegebenen AP5-Referenzrelease.

Der SharePoint-Provider akzeptiert nur einen Ordner auf der aktuellen SharePoint-Website. Relative Pfadsegmente und Cross-Site-Pfade werden abgewiesen. Damit folgt AP10 der bestätigten Abgrenzung aus DEC-2026-013. Für Teams muss ein Mirror auf der zum Team gehörenden SharePoint-Website bereitgestellt und in der konkreten Registerkarteninstanz konfiguriert werden.

## 3. Sicherer Start und Fallback

Beim Laden prüft das WebPart zunächst einen allfälligen lokalen Aktivstand und startet danach die Netzvalidierung. Ein lokaler Stand wird nur angezeigt, wenn er in das strikte AP8-Datenmodell überführt werden kann. Der Netzrelease ersetzt den Aktivstand erst nach vollständiger Prüfung von:

- JSON-Schemata
- Format-Hauptversion
- Freigabestatus und Unveränderlichkeit
- Pfadsicherheit
- Dateigrössen
- SHA-256-Prüfsummen
- Content-IDs
- Profil- und Kalenderreferenzen
- Kalenderabdeckung

Schlägt der Netzabruf fehl, darf nur der letzte vollständig validierte Aktivstand weiterverwendet werden. Ohne gültigen Aktivstand bleibt der Rechner gesperrt und zeigt keinen scheinbar plausiblen Datenstand.

## 4. Datenschutz und Berechtigungen

Das WebPart speichert weiterhin kein Empfangsdatum im Release-Store. Persönliche Defaults bleiben gemäss DEC-2026-004 im lokalen Browser. Der Release-Store enthält ausschliesslich öffentliche oder tenantintern freigegebene Regel- und Kalenderdaten.

Das Paket enthält keine `webApiPermissionRequests`, keine Microsoft-Graph-Adresse, kein Geheimnis und keine Entra-App-Registrierung. Der SharePoint-Mirror wird mit den normalen Leserechten der angemeldeten Person abgerufen.

Externe und Gastzugriffe bleiben ausserhalb von AP10. Aus einer erfolgreichen internen Tenantprüfung darf keine Gastfreigabe abgeleitet werden.

## 5. Lokaler Prüfnachweis

| ID | Prüfung | Ergebnis |
| --- | --- | --- |
| L01 | frische Offline-Installation aus Lockfile | 1'330 Pakete geprüft, 0 gemeldete Schwachstellen |
| L02 | bestehender AP8- und AP9-Gesamtlauf | 65 von 65 Tests bestanden |
| L03 | AP10-Provider- und Integrationsprüfungen | 12 von 12 Tests bestanden |
| L04 | validierter Release wird in AP8-Datenmodell überführt | bestanden |
| L05 | StPO-Referenzfall durch die SPFx-Datenkette | Fristende 28.09.2026, bestanden |
| L06 | Manipulation und fehlendes Artefakt | abgewiesen, Aktivstand unverändert |
| L07 | IndexedDB-Aktivierung und Wiederherstellung | bestanden |
| L08 | GitHub-Pinning und Mirrorpfadgrenzen | bestanden |
| L09 | TypeScript, Sass, ESLint und Webpack | bestanden, ohne Warnung |
| L10 | SPFx-Paketvalidierung | bestanden |
| L11 | Paketstruktur | 21 von 21 Einträgen intakt |
| L12 | SharePoint- und Teams-Hosts im Manifest | bestanden |
| L13 | zusätzliche API-Berechtigungen | keine vorhanden |
| L14 | bestehende AP9-Browservorschau nach CSS-Hosttrennung | bestanden |
| L15 | finale Bundle-CSS ohne lokalisierte Klassennamen und ohne wörtlichen `:global`-Marker | bestanden |

Das korrigierte Paket ist 152'144 Bytes gross. Seine SHA-256-Prüfsumme lautet:

```text
19ba114148c496612dbd117ff08d66366288386b8be7653f19e45bbeb586cd07
```

## 6. Tenantprüfung

Der Kandidat `0.1.0.0` wurde am 29. August 2026 im steimer.ch-Tenant-App-Katalog aktiviert und auf der dedizierten Testsite installiert. Die Datenvalidierung, die Referenzberechnung, Deutsch und Französisch, lokale Defaults sowie der fachliche Sperrfall bestanden. Die responsive Prüfung T08 deckte dagegen einen technischen Verpackungsfehler auf. SPFx hatte die Klassenselektoren der importierten Produkt-CSS lokalisiert, während die React-Komponente unveränderte `fr-*`-Klassennamen ausgab. Dadurch blieb die Berechnung funktionsfähig, das vorgesehene Produktlayout wurde im Host aber nicht angewendet.

Der Kandidat `0.1.0.1` umschloss die synchronisierte Produkt-CSS zwar ausdrücklich mit Sass `:global`, verwendete dafür aber eine gewöhnliche SCSS-Datei. Der SPFx-Build behandelte den Marker deshalb nicht als CSS-Modules-Anweisung und lieferte Regeln wie `:global .fr-actions` aus. Die Browserprüfung bestätigte, dass das Bundle `fristenrechner-web-part_6d505c6b1ca21aa813da.js` geladen wurde und der freigegebene Datenrelease aktiv war. Die Layoutregeln blieben dennoch unwirksam. T08 bestand deshalb auch mit `0.1.0.1` nicht.

Der neue Kandidat `0.1.0.2` erzeugt eine echte `styles.module.scss`. Der CSS-Modules-Schritt entfernt den `:global`-Marker und erhält die fachlich verwendeten `fr-*`-Klassennamen. Ein verpflichtendes Nachbuild-Audit liest das finale, minifizierte Bundle und verlangt eine direkt anwendbare `.fr-actions`-Regel. Es weist sowohl wörtliche `:global .fr-actions`-Selektoren als auch lokalisierte `.fr-actions_*`-Klassen zurück. Vor der AP10-Abnahme muss `0.1.0.2` im Tenant installiert und die SharePoint-Prüfung wiederholt werden. Erst danach folgen die Teams-Tests.

| ID | Prüfung | Status |
| --- | --- | --- |
| T01 | Paket im bestehenden Tenant-App-Katalog aktualisieren oder ergänzen | `0.1.0.1` bestanden, Aktualisierung auf `0.1.0.2` ausstehend |
| T02 | App auf der dedizierten Fristenrechner-Testsite installieren | `0.1.0.1` bestanden, Aktualisierung auf `0.1.0.2` ausstehend |
| T03 | Rechner auf moderner SharePoint-Seite laden und neu laden | mit `0.1.0.1` bestanden, Wiederholungsprüfung mit `0.1.0.2` ausstehend |
| T04 | freigegebenen GitHub-Release automatisch validieren | mit `0.1.0.1` bestanden, Wiederholungsprüfung mit `0.1.0.2` ausstehend |
| T05 | Kernfall StPO mit Fristende 28.09.2026 berechnen | mit `0.1.0.0` bestanden, nach dem zweiten CSS-Befund nicht erneut ausgeführt |
| T06 | Deutsch, Französisch und lokale Defaults prüfen | mit `0.1.0.0` bestanden, Testzustand zurückgesetzt, nach dem zweiten CSS-Befund nicht erneut ausgeführt |
| T07 | Sperrfall ohne scheinbares Fristende prüfen | mit `0.1.0.0` bestanden, nach dem zweiten CSS-Befund nicht erneut ausgeführt |
| T08 | responsive Darstellung und Tastaturbedienung prüfen | mit `0.1.0.0` und `0.1.0.1` nicht bestanden, Korrektur `0.1.0.2` lokal nachgewiesen |
| T09 | App auf der zum Team gehörenden SharePoint-Website installieren | offen |
| T10 | dieselbe Component-ID als Teams-Kanalregisterkarte laden | offen |
| T11 | Browserkonsole in beiden Hosts prüfen | offen |
| T12 | keine Graph- oder API-Zustimmungsanforderung bestätigen | SharePoint bestanden, Teams offen |

Der SharePoint-Mirror wird in der produktiven Architektur mitgeführt, ist aber für den ersten AP10-Tenantlauf nicht als aktive Teams-Datenquelle vorausgesetzt. Gastzugriffe bleiben gesperrt.

## 7. Rückbau

Der Teststand kann ohne Datenmigration zurückgebaut werden:

1. Teams-Registerkarte entfernen.
2. WebPart von der Testseite entfernen.
3. App auf den beiden Testsites deinstallieren.
4. Paket im App-Katalog deaktivieren oder entfernen.
5. Browserlokalen IndexedDB-Stand bei Bedarf über die Browserdaten löschen.

Der öffentliche Datenrelease, der Spike und die hostneutralen Quellen bleiben davon unberührt.

## 8. Accessibility und eCH-0059

Die AP9-Oberfläche behält ihre semantischen Beschriftungen, Tastaturreihenfolge, sichtbaren Statusmeldungen und mobilen Layoutregeln. Die globalen Vorschau-Regeln für `html` und `body` wurden aus der Produkt-CSS entfernt und in eine reine Vorschau-CSS verschoben. Damit greift das WebPart nicht in die SharePoint- oder Teams-Seite ausserhalb seiner eigenen `fr-*`-Klassen ein.

Die technische Prüfung orientiert sich weiterhin an WCAG 2.1 AA gemäss eCH-0059. Die responsive Prüfung im echten SharePoint-Host hat zwei aufeinanderfolgende CSS-Verpackungsfehler aufgedeckt und damit ihren Zweck erfüllt. Die formelle Konformitätsbewertung bleibt bis zur Wiederholungsprüfung mit `0.1.0.2` und zum Lauf im Teams-Host ausstehend.
