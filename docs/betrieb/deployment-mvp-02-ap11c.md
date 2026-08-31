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

### 6.1 Durchführungsprotokoll vom 31. August 2026

Die Matrix wurde nach der tenantweiten Aktivierung des Pakets `0.2.0.0` vollständig auf der dedizierten SharePoint-Testsite und in der bestehenden Teams-Registerkarte `Fristenrechner Schweiz – Teams` im Kanal `Fristenrechner` ausgeführt. Codex führte die Arbeiten als dokumentiertes KI-Arbeitsinstrument im Auftrag und unter der tenantseitigen Freigabe von David Steimer aus. Die fachliche Freigabe- und Haftungsverantwortung bleibt bei David Steimer.

Verwendete Datenquellen:

- öffentlicher, unveränderlich gepinnter GitHub-Release unter Commit `bd7c148741626de168af72fa5273dc5fdf24b923`
- Testsite-Mirror unter `/sites/fristenrechner-test/Freigegebene Dokumente/FristenrechnerDataMirror/2026-08-31-mvp-02-approved.1`
- Teamsite-Mirror unter `/sites/Entwicklungsumgebung/Freigegebene Dokumente/Fristenrechner/2026-08-31-mvp-02-approved.1`

| ID | Host und Provider | Ergebnis | Status |
| --- | --- | --- | --- |
| T01 | Tenant-App-Katalog | Paket `0.2.0.0` mit Solution-ID `13090feb-a6bf-40fa-9d3c-ec8d90516a60` aktiviert. Das WebPart hat die ID `596c7f1c-4d3e-4da8-a7be-27a96024f37c`. Es erschienen keine neuen API-Berechtigungsanträge. | bestanden |
| T02 | SharePoint-Testsite und Teamsite | Beide bestehenden Installationen laden das neue Produktbundle `fristenrechner-web-part_f107d1b0185ac0c3fafb.js`. Die Testseite und die bestehende Teams-Registerkarte blieben verwendbar. | bestanden |
| T03 | SharePoint-Mirror | Aktiviert wurde ausschliesslich der freigegebene Format-2-Release `2026-08-31-mvp-02-approved.1` mit Abdeckung vom 01.01.2026 bis 31.12.2028. | bestanden |
| T04 | SharePoint-Testsite, Mirror | StPO, Empfang 16.09.2026, 10 Tage ergibt den Fristablauf 28.09.2026. Fristbeginn 17.09.2026, rechnerisches Fristende 26.09.2026, Verschiebung bejaht. | bestanden |
| T05 | SharePoint-Testsite, Mirror | PRG-BE Art. 111 Abs. 1a mit erstem Wahlgang 29.03.2026 ergibt 02.04.2026. Die Oberfläche verlangt Originaleingang bis 12.00 Uhr und weist die Zeitzone `Europe/Zurich` aus. | bestanden |
| T06 | SharePoint-Testsite, Mirror | VRPG-BE Art. 67a Abs. 3 mit Eröffnung 10.03.2026 und Urnengang 29.03.2026 ergibt 20.03.2026. Der zwingende Hinweis zur sofortigen Anfechtung erscheint. | bestanden |
| T07 | SharePoint-Testsite, Mirror | Sämtliche sichtbaren Regime mit Status «Offen», «Gesperrt» oder «Folgerelease» sind mit `aria-disabled=true` als nicht auswählbar markiert. | bestanden |
| T08 | SharePoint-Testsite, Mirror | Weder die VRPG-BE-Fristtypen noch die ZPO-Verfahrensarten enthalten die Option «Noch nicht geklärt». «Bitte wählen» bleibt als neutraler Ausgangswert verfügbar. | bestanden |
| T09 | SharePoint und Teams, Mirror | Eingaben, Resultate, Fristwahrung, Warnungen und Rechenspur wurden auf Deutsch und Französisch geprüft. Der Spezialfall nach Art. 111 Abs. 1a PRG-BE wird auf Französisch einschliesslich Originaleingang bis 12.00 Uhr korrekt dargestellt. | bestanden |
| T10 | SharePoint-Testsite, Mirror | Gemeinwesen, Erlass und Fristtyp blieben nach dem Speichern und Neuladen erhalten. Das Ereignisdatum blieb leer. Die für den Test gesetzten lokalen Defaults wurden anschliessend zurückgesetzt. | bestanden |
| T11 | SharePoint und Teams, Mirror | Die SharePoint-Seite wurde bei 390 Pixeln und in breiter Ansicht visuell geprüft. Die Teams-Registerkarte wurde in ihrer schmalen Hostspalte geprüft. Die Rechneroberfläche zeigte kein horizontales Überlaufen. | bestanden |
| T12 | SharePoint und Teams, Mirror | Der StPO-Referenzfall ergab in beiden Hosts 28.09.2026 mit identischem Fristbeginn 17.09.2026, rechnerischem Fristende 26.09.2026 und verschobenem Ende. | bestanden |
| T13 | GitHub, Testsite-Mirror und Teamsite-Mirror | GitHub und Mirror aktivierten denselben Release. Die QuickXor-Prüfsummen aller neun Releaseartefakte stimmten auf beiden Sites mit den lokalen freigegebenen Dateien überein. Das Manifest hat lokal SHA-256 `df590c4e83b47a6307a63f688c9accc26c028eef7d7c3c9dad9a64308bf1a79b`. | bestanden |
| T14 | SharePoint-Testsite, manipulierter Mirrorpfad | Ein absichtlich nicht vorhandener Mirrorpfad führte zu HTTP 404. Die App behielt den letzten vollständig validierten Release `2026-08-31-mvp-02-approved.1` bei und zeigte den vorgesehenen Warnhinweis. Danach wurde der gültige Mirrorpfad wiederhergestellt und veröffentlicht. | bestanden |

Die Testsite und die Teams-Registerkarte sind nach Abschluss auf den jeweiligen SharePoint-Mirror konfiguriert. In beiden Instanzen ist der freigegebene Datenstand `2026-08-31-mvp-02-approved.1` sichtbar. Dieses Protokoll dokumentiert die technische Durchführung. Es erteilt keine Produktiv-, Gast- oder organisationsweite Betriebsfreigabe.

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
