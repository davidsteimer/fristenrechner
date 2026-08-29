# AP10: SPFx-Produktintegration und Testpaket

| Merkmal | Wert |
| --- | --- |
| Arbeitspaket | AP10, GitHub-Issue #23 |
| Stand | 29. August 2026 |
| Status | lokaler Installationskandidat, Tenantprüfung ausstehend |
| Verantwortliche Person | David Steimer |
| KI-Arbeitsinstrument | Codex ohne formelle Freigabe- oder Haftungsverantwortung |
| Datenbasis | `2026-08-29-ap5-approved.1` |
| Rechenkern | AP8 v0.1 |
| Oberfläche | AP9 v0.1 |
| Zielarchitektur | DEC-2026-013 |
| Paketversion | `0.1.0.0` |

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
| L03 | AP10-Provider- und Integrationsprüfungen | 11 von 11 Tests bestanden |
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

Das Paket ist 152'209 Bytes gross. Seine SHA-256-Prüfsumme lautet:

```text
6ad0ffb70101553d9457e165b7610374f401077e516a69d02b30ff28182732a5
```

## 6. Ausstehende Tenantprüfung

Der lokale Build ist kein Ersatz für den Lauf im Microsoft-365-Host. Vor der AP10-Abnahme sind mindestens folgende Prüfungen im steimer.ch-Testtenant durchzuführen:

| ID | Prüfung | Status |
| --- | --- | --- |
| T01 | Paket im bestehenden Tenant-App-Katalog aktualisieren oder ergänzen | offen |
| T02 | App auf der dedizierten Fristenrechner-Testsite installieren | offen |
| T03 | Rechner auf moderner SharePoint-Seite laden und neu laden | offen |
| T04 | freigegebenen GitHub-Release automatisch validieren | offen |
| T05 | Kernfall StPO mit Fristende 28.09.2026 berechnen | offen |
| T06 | Deutsch, Französisch und lokale Defaults prüfen | offen |
| T07 | Sperrfall ohne scheinbares Fristende prüfen | offen |
| T08 | responsive Darstellung und Tastaturbedienung prüfen | offen |
| T09 | App auf der zum Team gehörenden SharePoint-Website installieren | offen |
| T10 | dieselbe Component-ID als Teams-Kanalregisterkarte laden | offen |
| T11 | Browserkonsole in beiden Hosts prüfen | offen |
| T12 | keine Graph- oder API-Zustimmungsanforderung bestätigen | offen |

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

Die technische Prüfung orientiert sich weiterhin an WCAG 2.1 AA gemäss eCH-0059. Eine formelle Konformitätsbewertung erfolgt erst im echten SharePoint- und Teams-Host. Diese zeitliche Abweichung ist bewusst, weil der vorliegende Stand noch nicht im Zieltenant installiert ist.
