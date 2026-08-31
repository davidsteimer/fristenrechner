# Deployment Release 2 beziehungsweise MVP 0.3

Diese Anleitung beschreibt die kontrollierte Aktualisierung vom tenantgeprüften Paket `0.2.0.0` auf Release 2 mit Paket `0.3.0.0`. Der Release bündelt AP12, AP13 und GitHub-Issue #18. David Steimer hat AP12A, AP12B, AP12C, AP13 und Issue #18 am 31. August 2026 fachlich beziehungsweise fachlich-technisch abgenommen.

Die lokale Finalisierung ist abgeschlossen. Die nachstehende Tenantmatrix ist noch nicht ausgeführt. Das Dokument trennt deshalb den geprüften Installationskandidaten klar von einer späteren betrieblichen Freigabe.

## 1. Releaseidentität

### 1.1 SPFx-Paket

| Merkmal | Wert |
| --- | --- |
| Datei | `spfx/sharepoint/solution/fristenrechner-schweiz.sppkg` |
| Lösung | Fristenrechner Schweiz |
| Solution-ID | `13090feb-a6bf-40fa-9d3c-ec8d90516a60` |
| WebPart-ID | `596c7f1c-4d3e-4da8-a7be-27a96024f37c` |
| Paketversion | `0.3.0.0` |
| Grösse | 176'665 Bytes |
| SHA-256 | `a4cbaa646a9338419de51f7629652ecc2f9ada0ac15aeccdcf2211f72bc964e1` |
| Zielhosts | SharePoint Online und Microsoft Teams |
| zusätzliche API-Berechtigungen | keine |
| Client-Assets | im Paket enthalten |

Die Prüfsumme gilt exakt für den am 31. August 2026 mit Node.js 22.23.2 gebauten lokalen Installationskandidaten. Jeder spätere Build benötigt einen neuen Nachweis.

### 1.2 Fachdaten und Governance

| Merkmal | Wert |
| --- | --- |
| Datenrelease | `2026-08-31-mvp-03-approved.1` |
| Manifestformat | 3.0.0 |
| Kalenderkomponente | 2.0.0 |
| Manifest SHA-256 | `74583fa4dc9cab8ed99af3f9202782d90b02e9e47578f1dd9d2da40d19357be8` |
| Daten-Pin-Commit | `f80f4019ff56ca51154ba7cd8b767686dd87a9a4` |
| öffentlicher Pin | `https://raw.githubusercontent.com/davidsteimer/fristenrechner/f80f4019ff56ca51154ba7cd8b767686dd87a9a4/data/releases/2026-08-31-mvp-03-approved.1` |
| Quellenprüfereignis | `2026-08-31-initial-consolidation.1` |
| nächster ordentlicher Prüftermin | 15. November 2027 |

Der Datenrelease ist aus dem unveränderten AP12C-Kandidaten abgeleitet. Die zwei Regelkalender enthalten 15 Regeln. Neun Stillstandssatz-Referenzen verwenden die zeitlich offene ID `ch-court-holidays`. Das AP13-Ereignis dokumentiert alle 25 registrierten Quellen und löst bei 25 unveränderten Ergebnissen keinen künstlichen zweiten Datenrelease aus.

## 2. Enthaltener Funktionsumfang

Release 2 ergänzt den tenantgeprüften MVP-0.2-Stand um:

- ewige CH- und BE-Kalender aus versionierten Feiertags- und Gerichtsferienregeln
- Manifestformat 3 mit sicherer Kandidatensperre und offener Abdeckung ab 2026
- periodisches Quellenregister, append-only-Prüfereignis und reproduzierbaren Index
- Outlook-kompatiblen `.ics`-Export ohne Microsoft Graph
- optionalen, nicht persistierten Referenztext
- ganztägigen freien Termin mit Kategorie `Fristablauf` und Erinnerung `-PT112H`

Der fachliche Funktionsumfang für Bund und Kanton Bern gilt damit als vollständig. Weitere Kantone und kosmetische Verbesserungen bleiben Folgeausbau.

## 3. Lokaler Prüfnachweis

Vor der Paketierung wurden erfolgreich ausgeführt:

- 164 Root-Tests einschliesslich Rechenkern, Regelkalender, UI und Kalenderexport
- 17 SPFx-Provider- und Hosttests
- TypeScript-Typprüfung
- AP11C-, AP12A- und AP12C-Datenvalidatoren samt Negativmutationen
- AP13-Validator mit acht Negativtests
- produktiver SPFx-Build, CSS-Audit und Paketierung
- ZIP-Integritätsprüfung des `.sppkg`
- Kontrolle von Lösungsversion, Solution-ID, WebPart-ID, Hostexposition und Datenpin im Paket

Der Heft-Build meldet zwei nicht blockierende `@rushstack/no-new-null`-Warnungen. Sie betreffen ausdrücklich modellierte JSON-`null`-Werte für die offene Format-3-Abdeckung und optionale Datenreferenzen. Ein Wechsel auf `undefined` würde den beschlossenen JSON-Vertrag verfälschen. Die Warnungen werden deshalb für diesen Release dokumentiert und akzeptiert.

## 4. Zwingende Voraussetzungen

Vor dem Tenantupload müssen vorliegen:

1. veröffentlichter Pin-Commit `f80f4019ff56ca51154ba7cd8b767686dd87a9a4`
2. freigegebener Datenrelease `2026-08-31-mvp-03-approved.1`
3. Sicherung des installierten Pakets `0.2.0.0` und seines Datenpfads
4. Berechtigung zur Aktualisierung des Tenant-App-Katalogs und der beiden Testsites
5. ein neuer versionsbezogener SharePoint-Mirrorordner, falls der Mirror geprüft wird
6. Outlook Web und Outlook Desktop für die Importprüfung

Der AP12C-Kandidatenordner erfüllt die zweite Voraussetzung ausdrücklich nicht. Der Release-Service weist `releaseStatus: candidate` weiterhin ab.

## 5. SharePoint-Mirror für Format 3

Der Mirror enthält `manifest.json` und alle acht Manifestartefakte byteidentisch:

```text
2026-08-31-mvp-03-approved.1/
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

Die Dateien unter `calendars/` enthalten Regeln und keine jährlich erzeugten Datumstabellen. Der Mirror liegt auf der aktuellen SharePoint-Website der jeweiligen WebPart-Instanz. Für die Teams-Registerkarte ist dies die zum Team gehörende SharePoint-Website.

Der optionale Governance-Nachweis wird getrennt gespiegelt:

```text
source-reviews/
├── source-register.json
├── index.json
└── events/
    └── 2026-08-31-initial-consolidation.1.json
```

Der Laufzeitpfad darf nicht auf `source-reviews/` zeigen. Die Anwendung lädt ausschliesslich den Releaseordner.

## 6. Aktualisierung in SharePoint und Teams

1. Paket `0.2.0.0` und die bestehenden MVP-0.2-Mirrorpfade sichern.
2. Den Daten-Pin-Commit veröffentlichen und den öffentlichen Raw-Pfad abrufen.
3. Den neuen Format-3-Release auf die dedizierte Testsite und die Teamsite spiegeln.
4. Im Tenant-App-Katalog das bestehende `.sppkg` durch Version `0.3.0.0` ersetzen.
5. Kontrollieren, dass keine neue API-Berechtigungsanforderung erscheint.
6. Die App zuerst auf der dedizierten SharePoint-Testsite aktualisieren.
7. Die SharePoint-Prüfungen T01 bis T11 vollständig ausführen.
8. Erst danach die App auf der SharePoint-Website des Teams aktualisieren.
9. Die bestehende Teams-Registerkarte öffnen und T12 bis T14 ausführen.
10. Die erzeugten Kalenderdateien mit Outlook Web und Outlook Desktop gemäss T15 und T16 importieren.
11. Providerparität, Fallback und Governance-Nachweis gemäss T17 bis T19 prüfen.

## 7. Release-2-Testmatrix

| ID | Host | Prüfung | Soll | Status |
| --- | --- | --- | --- | --- |
| T01 | App-Katalog | Paketidentität | Version 0.3.0.0, richtige IDs, SHA-256 korrekt, keine neue API-Berechtigung | ausstehend |
| T02 | SharePoint-Testsite | App-Aktualisierung | bestehende Seite bleibt verwendbar und lädt das neue Bundle | ausstehend |
| T03 | SharePoint-Testsite | Format-3-Aktivierung | nur `2026-08-31-mvp-03-approved.1` wird aktiviert, Abdeckung ab 01.01.2026 offen | ausstehend |
| T04 | SharePoint-Testsite | allgemeine Regression | StPO, Empfang 16.09.2026, 10 Tage ergibt 28.09.2026 | ausstehend |
| T05 | SharePoint-Testsite | ewiger Kalender | StPO, Empfang 22.07.2027, 10 Tage ergibt wegen Bundesfeiertag und Wochenende 02.08.2027 | ausstehend |
| T06 | SharePoint-Testsite | Gerichtsferien | ZPO ordentlich, Zustellung 19.03.2027, 10 Tage ergibt 13.04.2027 | ausstehend |
| T07 | SharePoint-Testsite | Spezialregime | Art. 111 Abs. 1a PRG-BE mit erstem Wahlgang 29.03.2026 ergibt 02.04.2026 und Originaleingang bis 12.00 Uhr | ausstehend |
| T08 | SharePoint-Testsite | Sofortanfechtung | Art. 67a Abs. 3 VRPG-BE zeigt den zwingenden Hinweis | ausstehend |
| T09 | SharePoint-Testsite | Status- und Auswahlgrenzen | nicht berechenbare Regime bleiben deaktiviert, ZPO und VRPG-BE enthalten kein «Noch nicht geklärt» | ausstehend |
| T10 | SharePoint-Testsite | Sprachen und Defaults | Deutsch und Französisch vollständig, nur freigegebene Defaults bleiben gespeichert | ausstehend |
| T11 | SharePoint-Testsite | responsive Darstellung | 390 Pixel und breite Spalte ohne horizontales Überlaufen | ausstehend |
| T12 | Teams | direkte Registerkarte | Host meldet Microsoft Teams und verwendet Paket 0.3.0.0 | ausstehend |
| T13 | SharePoint und Teams | Hostparität | identische Eingaben ergeben identische Resultate und Rechenspuren | ausstehend |
| T14 | Teams | Format-3-Mirror | Teamsite-Mirror aktiviert denselben Release und dieselben Artefaktprüfsummen | ausstehend |
| T15 | Outlook Web | allgemeiner Kalenderexport | ganztägiger freier Termin am Fristablauf, Kategorie `Fristablauf`, Erinnerung 4 Tage 16 Stunden vorher | ausstehend |
| T16 | Outlook Desktop | Spezialregime und Referenz | korrektes Datum, Sonderzeichen in Referenz intakt, keine persistierte Referenz nach neuer Berechnung | ausstehend |
| T17 | GitHub und Mirror | Providerparität | Manifest- und Artefaktbytes sind identisch | ausstehend |
| T18 | SharePoint-Testsite | Fallback | fehlerhafter Mirror ersetzt den letzten validierten Aktivstand nicht | ausstehend |
| T19 | SharePoint | Governance-Spiegelung | Register, Index und Ereignis sind lesbar, bleiben aber ausserhalb des Laufzeitpfads | ausstehend |

Die Erinnerung ist als relative Dauer von exakt 112 Stunden modelliert. Bei einem Wechsel zwischen Sommer- und Winterzeit kann Outlook die lokale Erinnerungsuhrzeit um eine Stunde verschieben. Dieses Verhalten ist dokumentiert und akzeptiert. Es ändert den Termin- und Fristablauftag nicht.

## 8. Rollback

### 8.1 Datenrollback

1. WebPart-Konfiguration auf `2026-08-31-mvp-02-approved.1` zurückstellen.
2. Seite neu laden und sichtbare Release-ID kontrollieren.
3. StPO-Referenzfall erneut rechnen.
4. Format-3- und Governance-Ordner nicht löschen oder überschreiben.

### 8.2 Paketrückroll

1. Gesichertes Paket `0.2.0.0` im App-Katalog wiederherstellen.
2. App auf Testsite und Teamsite zurückstufen.
3. Teams-App nötigenfalls erneut publizieren.
4. Datenpfad auf den für MVP 0.2 geprüften Release setzen.
5. Die MVP-0.2-Matrix wiederholen.

Die mit Release 2 erzeugte `.ics`-Datei ist ein lokales Benutzerartefakt. Ein Paketrückroll entfernt bereits importierte Outlook-Termine nicht.

## 9. Freigabegrenze

Der lokale Installationskandidat ist vollständig gebaut und geprüft. Eine Veröffentlichung im öffentlichen Repository, die Aktualisierung des SharePoint-Mirrors und die Installation im steimer.ch-Tenant sind separate externe Schritte. Die betriebliche Freigabe erfolgt erst nach vollständig bestandener Matrix T01 bis T19 und dokumentierter Abnahme durch David Steimer.

Codex ist als KI-Arbeitsinstrument dokumentiert, übernimmt aber keine formelle Freigabe- oder Haftungsverantwortung.
