# Freigegebenes Referenzrelease AP11B

| Merkmal | Wert |
| --- | --- |
| Release-ID | `2026-08-30-ap11b-approved.1` |
| Status | fachlich und technisch abgenommen |
| Format | 2.0.0 |
| Arbeitspaket | AP11B, GitHub-Issue #29 |
| Entscheid | DEC-2026-014 |
| Abnahme | David Steimer, 30. August 2026 |
| Vorläufer | `2026-08-30-ap11b-candidate.1` |

Dieses Release ist der freigegebene Format-2-Referenzbestand für die hostneutrale Verarbeitung der bekannten VRPG-Spezialregime. Es wurde aus dem unveränderten AP11B-Kandidaten abgeleitet. Die acht Nutzartefakte und ihre SHA-256-Prüfsummen sind in Kandidat und freigegebenem Release byteidentisch. Ausschliesslich Release-ID, Freigabestatus und Freigabemetadaten unterscheiden sich im jeweiligen Manifest.

Die Abnahme betrifft den AP11B-Datenrelease, das Domänenmodell, den TypeScript-Rechenkern und die automatisierten Referenztests. Sie ist keine produktive Freigabe der Anwendung. Die bestehende Benutzeroberfläche und das installierte SPFx-Paket verwenden weiterhin den AP5-Datenstand. Ihre Integration und Prüfung mit den Spezialregimen erfolgen in AP11C.

## Inhalt

- 5 Rechtsprofile mit 47 allgemeinen Regeln
- 2 Kalender mit 36 Feiertagen und 10 Stillstandsperioden
- 1 Spezialregimekatalog mit 29 Fristdefinitionen und 36 Regimen
- 26 berechnete Definitionen der Typen R1 bis R4
- 3 von einer Behörde gesetzte Hintergrunddefinitionen der Herkunft `AUTHORITATIVE`
- 6 Einreichungsprofile mit Wahrungsmodus, Kanälen, Nachweisen, Originalerfordernis, Uhrzeit und Zeitzone
- 21 releaseweit konsistente Quellen
- 8 Nutzartefakte mit SHA-256-Prüfsummen

`R5_FIXED` ist in Format 2.0.0 unzulässig. Art. 16 PRG und Art. 8a VPR sind in berechenbare gesetzliche Komponenten und quellenpflichtige behördliche Komponenten getrennt. Art. 21 BPR bleibt vollständig behördlich bestimmt. Autoritative Termine besitzen keine Rechenoperation, sind im Rechen-GUI verborgen und erzeugen kein Fristresultat.

## Reproduzierbarkeit

Vom Repository-Hauptverzeichnis:

```bash
npm run build:data:ap11b
```

Der erste Teilschritt erzeugt den Kandidaten deterministisch aus dem AP5-Referenzrelease und dem fachlich abgenommenen AP11A-Bestand. Der zweite Teilschritt übernimmt die acht geprüften Nutzartefakte byteidentisch und erstellt das Freigabemanifest.

## Validierung

Nach Installation von `requirements-data.txt`:

```bash
npm run check
npm run test:oracle
npm run test:data:ap11b
```

Der releaseweite Validator prüft Schemata, Manifest, Prüfsummen, Quellen, Querverweise und neun absichtlich beschädigte Kopien. Eine unabhängige Python-Gegenrechnung bestätigt die acht fachlich abgenommenen Spezialfälle und weist verbotene Mutationen zurück.

Prüfsummen dieses Freigabestands:

| Nachweis | SHA-256 |
| --- | --- |
| Freigabemanifest | `ad6f069946f430493a87e4cb93834886272f9d13ffb6d0a5f80a1cfb1ac0e97d` |
| Golden-Case-Suite | `5683da616e78f9973af0e3264cfa8aa275f1b6db903de9fa4c680890fe0795dc` |

Das Kandidatenmanifest behält die Prüfsumme `0a68fa0df03993a53b047c7f46135eb328f70d62c3a27db23207f86f352cd47d`.

## Abgrenzung

Nicht Bestandteil dieser Freigabe sind:

- die Einbindung der Spezialregime in die Benutzeroberfläche
- ein neues SPFx-Paket
- eine Aktivierung in SharePoint oder Teams
- die produktive Freigabe der Gesamtanwendung
- fachlich weiterhin offene oder gesperrte Regime

Diese Punkte bleiben eigenen Arbeitspaketen und Abnahmen vorbehalten.
