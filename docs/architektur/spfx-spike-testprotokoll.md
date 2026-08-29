# Testprotokoll SPK-SPFX-01

Dieses Protokoll wird während des SPFx-Machbarkeitsspikes ausgefüllt. Prüfkriterien und Nummern stammen aus dem [AP7-Ausführungsplan](spfx-machbarkeitsspike-ap7.md). Ein Test darf nur mit verlinktem oder benanntem Nachweis als bestanden markiert werden.

## 1. Durchführung

| Merkmal | Eintrag |
| --- | --- |
| Startdatum | offen |
| Abschlussdatum | offen |
| Durchgeführt durch | David Steimer mit Codex |
| Ergebnis | offen: Go, bedingtes Go oder Stop |
| Verwendeter Tenant | offen |
| SharePoint-Testsite | offen |
| Team und Kanal | offen |
| App-Katalogtyp | offen: Tenant oder Websitesammlung |
| Git-Commit | offen |
| `.sppkg` SHA-256 | offen |

## 2. Versionsinventar

| Baustein | Soll | Ist | Abweichung begründet |
| --- | --- | --- | --- |
| SPFx | 1.23.2 | offen | offen |
| Node.js | 22 LTS | offen | offen |
| React | 17.0.1 exakt | offen | offen |
| TypeScript | Generatorstand | offen | offen |
| Fluent UI React | Generatorstand v8 | offen | offen |
| Build-Toolchain | Heft | offen | offen |
| Teams-Manifest | automatisch oder begründetes eigenes Paket | offen | offen |

## 3. Prüfergebnisse

Zulässige Statuswerte sind `bestanden`, `nicht bestanden`, `blockiert` und `nicht durchgeführt`.

| ID | Kurzbezeichnung | Status | Nachweis | Befund oder Abweichung |
| --- | --- | --- | --- | --- |
| T01 | reproduzierbarer Build | offen | offen | offen |
| T02 | Paketinhalt | offen | offen | offen |
| T03 | SharePoint-Host | offen | offen | offen |
| T04 | Teams-Host | offen | offen | offen |
| T05 | Fluent-UI-Kompatibilität | offen | offen | offen |
| T06 | GitHub-Provider | offen | offen | offen |
| T07 | SharePoint-Provider | offen | offen | offen |
| T08 | Providerparität | offen | offen | offen |
| T09 | atomare Aktivierung | offen | offen | offen |
| T10 | Fehler und Fallback | offen | offen | offen |
| T11 | minimale Berechtigungen | offen | offen | offen |
| T12 | Tenantübertragbarkeit | offen | offen | offen |
| T13 | Grundzugänglichkeit | offen | offen | offen |
| T14 | Sprachfähigkeit | offen | offen | offen |

## 4. Providervergleich

| Merkmal | GitHub | SharePoint-Mirror | identisch |
| --- | --- | --- | --- |
| Release-ID | offen | offen | offen |
| Manifest SHA-256 | offen | offen | offen |
| Anzahl Artefakte | offen | offen | offen |
| alle Artefakt-Hashes | offen | offen | offen |
| Aktivstand nach Validierung | offen | offen | offen |

## 5. Berechtigungsnachweis

| Prüfung | Ergebnis | Nachweis |
| --- | --- | --- |
| keine Graph-Berechtigung beantragt | offen | offen |
| keine Entra-App-Registrierung verwendet | offen | offen |
| Mirror mit normalem Benutzerleserecht abrufbar | offen | offen |
| benötigte Katalogrolle dokumentiert | offen | offen |
| benötigte Teams-Richtlinie dokumentiert | offen | offen |

## 6. Zeitnachweis

| Schritt | Plan | Ist | Restprognose |
| --- | ---: | ---: | ---: |
| Toolchain und Gerüst | 0,50 AT | offen | offen |
| Providervertrag und GitHub | 0,75 AT | offen | offen |
| SharePoint-Mirror | 0,75 AT | offen | offen |
| Validierung und Fallback | 0,50 AT | offen | offen |
| SharePoint-Test | 0,75 AT | offen | offen |
| Teams-Test | 0,75 AT | offen | offen |
| Sicherheit und Paket | 0,25 AT | offen | offen |
| Bericht und Entscheidvorlage | 0,25 AT | offen | offen |
| **Total** | **4,50 AT** | **offen** | **offen** |

## 7. Befunde und offene Punkte

| ID | Befund | Auswirkung | Empfehlung | Folgepaket nötig |
| --- | --- | --- | --- | --- |
| F-01 | offen | offen | offen | offen |

## 8. Entscheidungsempfehlung

### Empfohlenes Ergebnis

Offen: `Go`, `bedingtes Go` oder `Stop`.

### Begründung

Offen.

### Vorbehalte bei bedingtem Go

Keine oder offen.

### Ausgelöste Alternative bei Stop

Keine oder offen.

## 9. Freigabe

| Rolle | Person | Entscheid | Datum |
| --- | --- | --- | --- |
| Technische Durchführung | David Steimer mit Codex | offen | offen |
| Architekturentscheid | David Steimer | offen | offen |
