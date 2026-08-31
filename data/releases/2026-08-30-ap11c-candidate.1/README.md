# AP11C-Datenrelease 2026-08-30-ap11c-candidate.1

| Merkmal | Wert |
| --- | --- |
| Status | Kandidat, noch nicht freigegeben |
| Format | 2.0.0 |
| Arbeitspaket | AP11C, GitHub-Issue #30 |
| eingeschlossener UX-Umfang | GitHub-Issue #25 |
| Basis | `2026-08-30-ap11b-approved.1` |

Dieser Kandidat übernimmt sämtliche acht Nutzartefakte des abgenommenen AP11B-Referenzrelease. Er entfernt ausschliesslich die redundante Option `unknown` aus der Pflichtauswahl `procedureVariant` des ZPO-Profils und aus `specialLawStatus` des VRPG-BE-Profils. Die materiellen Fristregeln, Spezialregime, Kalender und Quellen bleiben unverändert.

Der Rechenkern akzeptiert `unknown` damit weiterhin nicht als berechenbaren Wert. Manipulierte oder aus einem älteren Datenstand stammende Eingaben werden als unbekannter Selektorwert blockiert. In der Oberfläche bleibt stattdessen der neutrale leere Pflichtfeldplatzhalter erhalten.

## Reproduzierbarkeit

```bash
npm run build:data:ap11c
npm run test:data:ap11c
```

Die Prüfung umfasst die vollständige Format-2-Releasevalidierung, neun Negativmutationen sowie den AP11C-spezifischen Nachweis, dass beide `unknown`-Optionen entfernt und alle fachlich zulässigen Optionen erhalten sind.

## Freigabegrenze

Der Kandidat ist für lokale Preview-, Unit-, UI- und SPFx-Integrationstests bestimmt. Eine Aktivierung durch den produktiven Release-Service ist absichtlich ausgeschlossen, weil dieser ausschliesslich den Status `approved` akzeptiert. Ein freigegebener Nachfolger benötigt eine ausdrückliche Abnahme durch David Steimer.
