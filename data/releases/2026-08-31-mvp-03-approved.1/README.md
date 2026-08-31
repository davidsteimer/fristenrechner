# Freigegebener Datenrelease MVP 0.3

| Merkmal | Wert |
| --- | --- |
| Release-ID | `2026-08-31-mvp-03-approved.1` |
| Status | fachlich und technisch abgenommen |
| Manifestformat | 3.0.0 |
| Kalenderkomponente | 2.0.0 |
| Arbeitspakete | AP12A, AP12B und AP12C |
| Entscheid | DEC-2026-015 |
| GitHub-Issue | #26 |
| Abnahme | David Steimer, 31. August 2026 |
| Vorläufer | `2026-08-31-ap12c-candidate.1` |
| Rückfallstand | `2026-08-31-mvp-02-approved.1` |

Dieser Release ist der freigegebene Fachdatenstand für MVP 0.3 beziehungsweise Release 2. Er ersetzt die endlichen Feiertags- und Stillstandslisten durch 15 versionierte Regeln für die Kalender CH und BE. Feiertage und Gerichtsferien werden lokal und deterministisch für den benötigten Zeitraum erzeugt. Die Releaseabdeckung ist ab dem 1. Januar 2026 nach oben offen.

Die fünf Rechtsprofile und der VRPG-BE-Spezialregimekatalog übernehmen die fachlich unveränderten Regeln des AP12C-Kandidaten. Ausschliesslich ihre Prüfmetadaten werden von `candidate` auf `verified` mit David Steimer als freigebender Person nachgeführt. Die zwei bereits in AP12A abgenommenen Kalenderartefakte bleiben inhaltlich identisch mit dem Kandidatenbestand.

Die Freigabe umfasst:

- die atomare Migration von `ch-court-holidays-2026-2028` auf `ch-court-holidays`
- die offene Kalenderabdeckung ohne jährliche Datumstabellen
- die weiterhin vollständige Format-, Schema-, Referenz-, Grössen- und Prüfsummenvalidierung
- die sichere Ablehnung durch ältere Consumer, welche Manifestformat 3 nicht unterstützen
- die Rechenspur mit Datenrelease-, Kalender-, Regel-, Override- und Quellenbezug

## Reproduzierbarkeit

Vom Repository-Hauptverzeichnis:

```bash
npm run build:data:ap12c
npm run test:data:ap12c
```

Der erste Befehl baut den unveränderlichen AP12C-Kandidaten neu und leitet daraus diesen freigegebenen Release ab. Der zweite Befehl validiert beide Stände, alle acht Manifestartefakte, die 15 Kalenderregeln, die neun migrierten Stillstandssatz-Referenzen und die Negativmutationen.

## Quellenprüfung und Freigabegrenze

Die periodische Quellenprüfung wird getrennt unter `data/source-reviews/` geführt. Das am 31. August 2026 abgenommene AP13-Ereignis prüft alle 25 registrierten Quellen des AP12C-Ausgangsbestands. Die unveränderte Promotion dieses fachlichen Bestands benötigt kein zweites inhaltsgleiches Prüfereignis.

Die Fachdaten sind freigegeben. Die betriebliche Aktivierung des SPFx-Pakets 0.3.0.0 in SharePoint und Microsoft Teams setzt zusätzlich die vollständig bestandene Release-2-Tenantmatrix voraus. Der frühere MVP-0.2-Datenrelease bleibt unverändert als Rückfallstand erhalten.
