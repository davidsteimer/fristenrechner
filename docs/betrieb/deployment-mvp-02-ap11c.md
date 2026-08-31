# Deployment MVP 0.2 nach AP11C

Diese Anleitung beschreibt die kontrollierte Aktualisierung vom tenantgeprüften Paket `0.1.0.2` auf das definitive MVP-0.2-Paket `0.2.0.0`. AP11C wurde am 31. August 2026 durch David Steimer abgenommen. Der freigegebene Datenrelease trägt die ID `2026-08-31-mvp-02-approved.1` und ist auf den vollständigen Git-Commit `bd7c148741626de168af72fa5273dc5fdf24b923` gepinnt.

## 1. Identität des lokalen Pakets

| Merkmal | Wert |
| --- | --- |
| Datei | `spfx/sharepoint/solution/fristenrechner-schweiz.sppkg` |
| Lösung | Fristenrechner Schweiz |
| Solution-ID | `13090feb-a6bf-40fa-9d3c-ec8d90516a60` |
| WebPart-ID | `596c7f1c-4d3e-4da8-a7be-27a96024f37c` |
| Paketversion | `0.2.0.0` |
| Grösse | 166'470 Bytes |
| SHA-256 | `391c13b360a4d359bc3252d5f74f8d8e875287c20729b86b6a58cd1c519f6fc5` |
| Zielhosts | SharePoint Online und Microsoft Teams |
| zusätzliche API-Berechtigungen | keine |

Die Prüfsumme gilt exakt für das am 31. August 2026 mit dem freigegebenen Datenquellen-Pin definitiv gebaute Paket. Jeder spätere Build benötigt eine neue Prüfsumme und einen neuen Nachweis.

## 2. Zwingende Voraussetzungen

Vor einem Tenantupload müssen vorliegen:

1. fachliche und technische Abnahme von AP11C durch David Steimer, erfolgt am 31. August 2026
2. ein unveränderlicher Datenrelease mit `releaseStatus: approved`, erfüllt durch `2026-08-31-mvp-02-approved.1`
3. eine publizierte und auf einen vollständigen Git-Commit gepinnte GitHub-Adresse oder ein byteidentischer SharePoint-Mirror
4. eine Sicherung des bisher installierten Pakets `0.1.0.2` und seines geprüften Datenpfads
5. Berechtigung zur Aktualisierung des Tenant-App-Katalogs und der Testsites

Der lokale Ordner `2026-08-30-ap11c-candidate.1` bleibt unverändert erhalten und erfüllt Punkt 2 ausdrücklich nicht. Der Release-Service weist ihn unabhängig von korrekten Prüfsummen ab.

## 3. SharePoint-Mirror für Format 2

Der Mirror muss `manifest.json` und alle acht Manifestartefakte byteidentisch unter demselben serverrelativen Ordner enthalten:

```text
2026-08-31-mvp-02-approved.1/
├── manifest.json
├── profiles/
│   ├── bgg.json
│   ├── stpo.json
│   ├── vrpg-be.json
│   ├── vwvg.json
│   └── zpo.json
├── calendars/
│   ├── be-public-holidays.json
│   └── ch-federal-calendar.json
└── special-regimes/
    └── vrpg-be.json
```

Der Mirror liegt auf der aktuellen SharePoint-Website der WebPart-Instanz. Für eine Teams-Kanalregisterkarte ist dies die zum Team gehörende SharePoint-Website. Cross-Site-Pfade und relative Pfadsegmente werden abgewiesen.

Nach dem Kopieren sind mindestens zu kontrollieren:

- Release-ID und Status im Manifest
- acht Artefakte und ein Spezialregimekatalog
- SHA-256-Prüfsummen und Dateigrössen gemäss Manifest
- identischer Stand im GitHub-Release und im Mirror, falls beide Provider geprüft werden
- Leseberechtigung für die Benutzerinnen und Benutzer der Zielsite

## 4. Aktualisierung in SharePoint

1. Im Tenant-App-Katalog das bestehende `.sppkg` durch die abgenommene Fassung `0.2.0.0` ersetzen.
2. Die Lösung tenantweit oder nur für die vorgesehenen Sites bereitstellen, entsprechend dem Betriebskonzept.
3. Prüfen, dass keine neuen API-Berechtigungsanträge erscheinen.
4. Auf der dedizierten Testsite die App aktualisieren.
5. Die Seite mit dem Fristenrechner öffnen und einmal vollständig neu laden.
6. In den WebPart-Eigenschaften den freigegebenen GitHub-Pfad oder den serverrelativen Mirrorpfad setzen.
7. Datenrelease-ID, Formatversion und Abdeckung am Seitenende kontrollieren.
8. Die Prüfmatrix in Abschnitt 6 vollständig ausführen.

## 5. Aktualisierung in Microsoft Teams

Die SharePoint-Prüfung muss zuerst bestanden sein.

1. Die App auf der zum bezeichneten Team gehörenden SharePoint-Website aktualisieren.
2. Die Teams-App aktualisieren oder neu mit dem unveränderten WebPart-Bezug publizieren.
3. Die bestehende Registerkarte im Kanal `Fristenrechner` öffnen.
4. Falls der SharePoint-Mirror verwendet wird, den Mirrorpfad in dieser WebPart-Instanz konfigurieren.
5. Die Prüfungen T09 bis T12 aus Abschnitt 6 im direkten Teams-Host wiederholen.

## 6. Prüfmatrix

| ID | Prüfung | Soll |
| --- | --- | --- |
| T01 | Paket im App-Katalog | Version `0.2.0.0`, richtige Solution-ID, keine neue Berechtigungsanforderung |
| T02 | App auf SharePoint-Testsite | Aktualisierung erfolgreich, bestehende Seite bleibt verwendbar |
| T03 | Datenaktivierung | nur freigegebener Format-2-Release wird aktiviert |
| T04 | allgemeine Regression | StPO, Empfang 16.09.2026, 10 Tage ergibt 28.09.2026 |
| T05 | Spezialregime Originaleingang | Art. 111 Abs. 1a PRG-BE mit erstem Wahlgang 29.03.2026 ergibt 02.04.2026 und Originaleingang bis 12.00 Uhr |
| T06 | Vorbereitungshandlung | Art. 67a Abs. 3 VRPG-BE zeigt den Sofortanfechtungshinweis |
| T07 | Statusgrenzen | offene, gesperrte und Folgerelease-Regime sind nicht auswählbar |
| T08 | Issue #25 | ZPO und VRPG-BE zeigen keine Option «Noch nicht geklärt» |
| T09 | Sprachen | Eingaben, Resultat, Fristwahrung, Warnungen und Rechenspur auf Deutsch und Französisch |
| T10 | Defaults | alte Defaults werden sicher migriert, Ereignisdaten und Bestätigungen werden nicht gespeichert |
| T11 | responsive Darstellung | 390 Pixel, breite SharePoint-Spalte und Teams-Registerkarte ohne horizontales Überlaufen |
| T12 | Hostparität | identische Eingaben ergeben in SharePoint und Teams dasselbe Resultat und dieselbe Rechenspur |
| T13 | Providerparität | GitHub und Mirror aktivieren byteidentischen Release mit identischem Manifest-Hash |
| T14 | Fallback | ein manipulierter oder nicht erreichbarer neuer Stand ersetzt den letzten validierten Aktivstand nicht |

Jeder Test hält Datum, Host, Paketversion, Release-ID, Provider und Ergebnis fest. Bildschirmbilder sind für T05, T06, T09 und T11 sinnvoll. Sie ersetzen die protokollierten Eingaben und Sollwerte nicht.

## 7. Rollback

Ein Rollback trennt Code und Daten:

### 7.1 Datenrollback

1. WebPart-Konfiguration auf den letzten vollständig validierten Releaseordner zurückstellen.
2. Bestehende Releaseordner nicht überschreiben oder umbenennen.
3. Seite neu laden und die sichtbare Release-ID kontrollieren.
4. StPO-Referenzfall erneut rechnen.

Ein Format-2-Release kann auf `2026-08-30-ap11b-approved.1` zurückgestellt werden, wenn die Spezialregime erhalten bleiben sollen. Für den vollständig tenantgeprüften AP10-Funktionsstand ist der gepinnte AP5-Release massgebend.

### 7.2 Paketrückroll

1. Das gesicherte Paket `0.1.0.2` im App-Katalog wiederherstellen.
2. App auf Testsite und Team-Site zurückstufen.
3. Teams-App nötigenfalls erneut publizieren.
4. Datenpfad auf den für `0.1.0.2` geprüften AP5-Release setzen.
5. AP10-Prüffälle T03 bis T12 wiederholen.

Defaults der internen Version 2 werden vom alten Consumer nicht als gültige Version-1-Defaults übernommen. Er fällt auf sichere Standardwerte zurück. Das ist ein Komfortverlust, aber kein fachlich unsicherer Zustand.

## 8. Freigabegrenze

Erst die dokumentierte Abnahme der vollständigen SharePoint- und Teams-Prüfmatrix erlaubt eine weitere Betriebsfreigabe. Die Installation in einem Testtenant ist noch keine Produktiv- oder Gastfreigabe. Gastzugriffe bleiben ein eigenes Arbeitspaket.
