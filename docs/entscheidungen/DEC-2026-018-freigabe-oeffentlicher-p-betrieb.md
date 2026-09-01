---
id: DEC-2026-018
titel: "Freigabe des öffentlichen P-Betriebs auf steimer.ch"
status: beschlossen
vorgeschlagen_am: 2026-09-01
entscheidungsdatum: 2026-09-01
klasse: A
entschieden_durch: "David Steimer"
quelle:
  - "Ausdrückliche P-Betriebsfreigabe durch David Steimer vom 1. September 2026"
  - "Produktionsnachweis D01 bis D12 vom 1. September 2026"
  - "DEC-2026-017"
ersetzt: []
ersetzt_durch: null
---

# DEC-2026-018: Freigabe des öffentlichen P-Betriebs auf steimer.ch

## Ausgangslage

DEC-2026-017 hat die statische öffentliche Zielarchitektur auf der bestehenden steimer.ch-Hosting-Infrastruktur beschlossen. Der Architekturentscheid hat Upload, öffentliche Umschaltung und Betriebsfreigabe bewusst getrennt.

Der exakt bezeichnete Kandidat aus Commit `32f5225ec1695ea0842d64db1191a1a3d5e2f204` wurde nach ausdrücklichen Einzelgenehmigungen gesichert, zunächst nicht öffentlich vorgeprüft und anschliessend unter `https://www.steimer.ch/fristenrechner/` veröffentlicht. Die öffentliche Prüfmatrix D01 bis D12 ist vollständig bestanden. Startseitenverweis und `sitemap.xml` sind veröffentlicht und geprüft. Ein funktionsfähiger Rückfallstand liegt vor.

## Geprüfte Optionen

1. **Öffentlichen P-Betrieb freigeben**
   - Vorteil: Der geprüfte Berner Fristenrechner steht allgemein und ohne M365-Anmeldung zur Verfügung.
   - Vorteil: Kandidat, Hosting, Datenschutz, Sicherheitsheader und Rückfallfähigkeit sind dokumentiert geprüft.
   - Nachteil: Der öffentliche Betrieb verlangt weiterhin kontrollierte Releases und periodische Quellenprüfungen.
2. **Formelle Betriebsfreigabe weiter zurückstellen**
   - Vorteil: Kein formell freigegebener Produktionsbetrieb.
   - Nachteil: Der bereits technisch veröffentlichte und vollständig geprüfte Stand bliebe ohne abschliessenden Betriebsentscheid.
3. **Öffentliche Bereitstellung zurücknehmen**
   - Vorteil: Keine öffentliche Betriebsverantwortung.
   - Nachteil: Das Ziel einer allgemein zugänglichen Berner Ausprägung würde trotz bestandener Prüfung nicht erreicht.

## Entscheid

David Steimer gibt den öffentlichen P-Betrieb des Berner Fristenrechners auf steimer.ch gestützt auf den Produktionsnachweis vom 1. September 2026 und die vollständig bestandene Prüfmatrix D01 bis D12 frei.

Die Freigabe gilt für:

- die Anwendungsversion `0.3.0`
- den Datenrelease `2026-08-31-mvp-03-approved.1`
- das Manifestformat `3.0.0`
- die Kalenderkomponente `2.0.0`
- den Referenzcommit `32f5225ec1695ea0842d64db1191a1a3d5e2f204`
- das Deploymentpaket mit SHA-256 `4ed35ef8fb77f30994ad4a708a7171ad3992c98e2522be2c5230cde416c9abf6`
- den öffentlichen Pfad `https://www.steimer.ch/fristenrechner/`

Die Freigabe umfasst keine weiteren Kantone, keine Änderung der M365-Ausprägungen und keine spätere Code- oder Datenversion.

## Begründung

Der veröffentlichte Stand entspricht dem abgenommenen Kandidaten. D01 bis D12 bestätigen den öffentlichen Hauptablauf auf Deutsch und Französisch, Paketidentität, Sicherheitsheader, Cacheverhalten, fehlende externe Laufzeitaufrufe, mobile Darstellung, Datenschutz, Fehlerbehandlung und Root-Integration. Der StPO-Referenzfall sowie der Outlook-kompatible Kalenderexport sind im öffentlichen Betrieb geprüft.

Die statische Ausprägung verwendet keine Datenbank, keine serverseitige Anwendungslogik, kein Tracking und keine Laufzeitverbindung zu GitHub, SharePoint, Microsoft Graph oder einem CDN. Der bestehende steimer.ch-Webauftritt ist gesichert und rückfallfähig.

## Folgen

### Auswirkungen

- Der Berner Fristenrechner darf ab dem 1. September 2026 öffentlich betrieben und verlinkt werden.
- Die Root-Verlinkung und der Sitemap-Eintrag bleiben aktiv.
- Der Betrieb folgt der AP16-Deployment- und Rückfallanleitung.
- AP13 bleibt für die periodische Prüfung der fachlichen und kalendarischen Quellen verbindlich.
- Jeder spätere Code- oder Datenrelease benötigt einen neuen Kandidaten, neue Prüfsummen, die öffentliche Regression und eine eigene Freigabe.

### Risiken und Grenzen

- Der fachliche Umfang bleibt auf Bund und Kanton Bern beschränkt.
- Die Anwendung ist ein Hilfsmittel ohne Gewähr und ersetzt keine juristische Prüfung des Einzelfalls.
- Projektleitung, fachliche Prüfung, technische Abnahme und Betriebsfreigabe liegen derzeit in Personalunion bei David Steimer.
- Der französische Kalenderexport wurde im öffentlichen Browserlauf bis zum nativen Speicherdialog geprüft. Der gemeinsame sprachunabhängige Exportpfad ist zusätzlich automatisiert und mit dem gespeicherten deutschen Produktionslauf nachgewiesen.
- Fluent UI 8 erfordert weiterhin die dokumentierte CSP-Ausnahme `style-src 'unsafe-inline'`. Skript- und Verbindungsrichtlinien bleiben restriktiv.

### Folgearbeiten und Rückabwicklung

- Betriebsstörungen oder fachliche Fehler werden nach der dokumentierten Rückfallanleitung behandelt.
- Der leere temporäre Hostingordner bleibt bis zu einem separaten Aufräumentscheid bestehen.
- Eine Erweiterung auf weitere Kantone erfolgt in eigenen Arbeitspaketen und mit freigegebenen Fachdaten.
- Eine Ablösung dieses Betriebsentscheids erhält eine neue DEC-ID mit gegenseitigen Verweisen.

## Nachweise

- [Technische Produktionsbereitstellung vom 1. September 2026](../betrieb/produktionsbereitstellung-2026-09-01.md)
- [AP16-Ausführungsplan](../betrieb/oeffentliche-p-auspraegung-ap16.md)
- [AP16-Kandidatennachweis](../betrieb/oeffentliche-p-auspraegung-ap16-nachweis.md)
- [Deployment- und Rückfallanleitung](../betrieb/deployment-oeffentliche-p-auspraegung-ap16.md)
- [DEC-2026-017](DEC-2026-017-statische-p-auspraegung-steimer-ch.md)
- [GitHub-Issue #33](https://github.com/davidsteimer/fristenrechner/issues/33)

## Entscheidstatus

David Steimer hat DEC-2026-018 am 1. September 2026 mit folgender Erklärung ausdrücklich beschlossen:

> Ich gebe den öffentlichen P-Betrieb des Berner Fristenrechners auf steimer.ch gestützt auf den Produktionsnachweis vom 1. September 2026 und die vollständig bestandene Prüfmatrix D01 bis D12 frei.

Der Entscheid hat damit den Status `beschlossen` und der öffentliche P-Betrieb den Status `freigegeben`.

## Verantwortlichkeit

Entschieden durch David Steimer. Codex hat den Entscheidungsdatensatz und die technischen Nachweise vorbereitet, übernimmt aber keine formelle Freigabe- oder Haftungsverantwortung.
