---
id: DEC-2026-017
titel: "Statische öffentliche P-Ausprägung auf steimer.ch"
status: beschlossen
vorgeschlagen_am: 2026-09-01
entscheidungsdatum: 2026-09-01
klasse: B
entschieden_durch: "David Steimer"
quelle:
  - "Arbeitspaket AP16, GitHub-Issue #33"
  - "AP16-Prüfnachweis P01 bis P15"
  - "DEC-2026-016"
ersetzt: []
ersetzt_durch: null
---

# DEC-2026-017: Statische öffentliche P-Ausprägung auf steimer.ch

## Ausgangslage

DEC-2026-016 hat den gruppenbasierten Q-Demobetrieb freigegeben und die öffentliche P-Ausprägung ausdrücklich offengelassen. Für P ist die bestehende steimer.ch-Hosting-Infrastruktur zwingend. Zusätzliche Hosting- oder Serverinfrastruktur soll nicht aufgebaut werden.

AP16 hat einen statischen P-Releasekandidaten aus dem bestehenden hostneutralen Rechenkern, der Produktoberfläche und dem freigegebenen MVP-0.3-Datenstand erstellt. Die Prüfmatrix P01 bis P15 ist auf Projektebene bestanden. Eine öffentliche Bereitstellung ist noch nicht erfolgt.

## Geprüfte Optionen

1. **Statisches Paket unter `https://www.steimer.ch/fristenrechner/`**
   - Vorteil: nutzt ausschliesslich die bestehende Hosting-Infrastruktur.
   - Vorteil: keine M365-, Graph-, Datenbank- oder Serverlaufzeit.
   - Vorteil: gleiche Kernlogik, Oberfläche und Fachdaten wie SharePoint und Teams.
   - Vorteil: sehr kleine Angriffs- und Betriebsfläche.
   - Nachteil: Update und Rückfall müssen als statischer Verzeichnistausch organisiert werden.
   - Nachteil: Fluent UI 8 benötigt in der CSP eine begrenzte Freigabe für Inline-Styles.
2. **Öffentliche SharePoint- oder Teams-Freigabe**
   - Vorteil: Wiederverwendung des vorhandenen SPFx-Pakets.
   - Nachteil: anonymer öffentlicher Betrieb passt nicht zum geprüften Q-Modell und ist im Tenant nicht als Zielarchitektur nachgewiesen.
   - Nachteil: M365-Zugriff und App-Katalog-Assets erhöhen die Betriebs- und Berechtigungskomplexität.
3. **Zusätzlicher Cloud- oder Anwendungsserver**
   - Vorteil: dynamische Funktionen und zentrale Telemetrie wären später leichter ergänzbar.
   - Nachteil: widerspricht der verbindlichen Hostinggrenze.
   - Nachteil: schafft unnötige Infrastruktur, Kosten und Datenschutzfragen.
4. **Vorerst keine öffentliche P-Ausprägung**
   - Vorteil: kein zusätzlicher öffentlicher Betrieb.
   - Nachteil: der Rechner bleibt für Demonstrationen und Nutzung auf authentifizierte M365-Zugänge beschränkt.

## Entscheid

Die öffentliche P-Ausprägung wird als rein statisches Paket unter `https://www.steimer.ch/fristenrechner/` auf der bestehenden steimer.ch-Hosting-Infrastruktur betrieben.

Verbindlich gelten:

- gemeinsamer hostneutraler Rechenkern und gemeinsame Produktoberfläche mit der SPFx-Ausprägung
- beim Build eingebetteter, vollständig freigegebener Datenrelease
- keine Laufzeitabfrage an GitHub, SharePoint, Microsoft Graph oder andere Datenprovider
- keine Datenbank und keine serverseitige Anwendungslogik
- keine Analysebibliothek, Werbung oder Trackingfunktion
- keine Übertragung von Falldaten, Referenzen oder Berechnungen
- lokale Speicherung nur der bereits freigegebenen persönlichen Standards
- Deutsch und Französisch als gleichwertige Produktsprachen
- sichtbare Kennzeichnung als privates Open-Source-Angebot ohne Verbindung zu einer Behörde
- kontrolliertes Deployment und Rückfall nach der AP16-Betriebsanleitung
- periodische fachliche Quellenprüfung weiterhin nach AP13

Der Entscheid über diese Zielarchitektur gibt die konkrete erstmalige Umschaltung nicht automatisch frei. Der erste Upload, die öffentliche Prüfung und der P-Betriebsentscheid bleiben eigene, ausdrücklich zu bestätigende Schritte.

## Begründung

Der AP16-Kandidat deckt den freigegebenen Funktionsumfang mit der kleinsten Betriebsfläche ab. Er verwendet die vorhandene Infrastruktur und vermeidet neue Benutzerkonten, Tenantberechtigungen, Laufzeitprovider und Serverkomponenten. Gleichzeitig bleibt die Produktlogik identisch mit der bereits geprüften SharePoint- und Teams-Ausprägung.

Die statische Ausprägung ist für einen öffentlichen Rechner sachgerecht, weil alle Fach- und Kalenderdaten versioniert vorliegen und die Berechnung vollständig clientseitig erfolgt. Spätere Daten- oder Codeänderungen werden weiterhin als kontrollierte Releases gebaut, geprüft und als vollständiges Paket ausgetauscht.

## Folgen

### Auswirkungen

- Der öffentliche Rechner erhält einen eigenen Unterpfad im bestehenden Webauftritt.
- SPFx bleibt Zielarchitektur für SharePoint und Teams sowie für Dritt-Tenant-Installationen.
- P verwendet keinen SharePoint-Mirror. Der freigegebene Datenstand ist Bestandteil des Builds.
- Root-Webauftritt und `sitemap.xml` werden erst bei der konkreten P-Bereitstellung ergänzt.
- Jeder P-Release benötigt eigene Paketprüfsummen und eine öffentliche Nachprüfung.

### Risiken und Grenzen

- Der öffentliche MVP deckt weiterhin nur Bund und Kanton Bern ab.
- Die Anwendung bleibt ein Hilfsmittel ohne Gewähr und ersetzt keine Einzelfallprüfung.
- Eine fehlerhafte statische Umschaltung kann kurzfristig nicht zusammenpassendes HTML und Assets ausliefern. Deshalb ist ein vollständiger Verzeichnistausch vorgesehen.
- Die Wirksamkeit von `.htaccess` und Sicherheitsheadern muss auf dem realen Hosting geprüft werden.
- Fluent UI 8 benötigt `style-src 'unsafe-inline'`. Skript- und Verbindungsrichtlinien bleiben restriktiv.
- Projektleitung, fachliche Prüfung, technische Abnahme und Betriebsfreigabe liegen derzeit bei derselben Person.

### Folgearbeiten und Rückabwicklung

- Gestützt auf diesen Entscheid wird der Kandidat erst nach separater Freigabe gemäss AP16-Betriebsanleitung zunächst in einen nicht öffentlichen temporären Ordner geladen.
- Die Umschaltung erfolgt erst nach Sicherung und erfolgreicher Vorprüfung.
- Bei nicht bestandener öffentlicher Matrix wird der vorherige Verzeichnisstand wiederhergestellt.
- Eine spätere Änderung des Hosting- oder Laufzeitmodells erhält eine neue DEC-ID mit gegenseitigen Verweisen.

## Nachweise

- [AP16-Ausführungsplan](../betrieb/oeffentliche-p-auspraegung-ap16.md)
- [AP16-Prüfnachweis](../betrieb/oeffentliche-p-auspraegung-ap16-nachweis.md)
- [Deployment- und Rückfallanleitung](../betrieb/deployment-oeffentliche-p-auspraegung-ap16.md)
- [DEC-2026-016](DEC-2026-016-gruppenbasierter-q-demobetrieb.md)
- [GitHub-Issue #33](https://github.com/davidsteimer/fristenrechner/issues/33)

## Entscheidstatus

David Steimer hat DEC-2026-017 am 1. September 2026 ausdrücklich beschlossen. Freigegeben ist damit die statische P-Zielarchitektur auf der bestehenden steimer.ch-Hosting-Infrastruktur. Der Entscheid erteilt noch keine Upload-, Umschaltungs- oder P-Betriebsfreigabe. Diese Schritte bleiben gesperrt und bedürfen separater ausdrücklicher Entscheide.

## Verantwortlichkeit

Entschieden durch David Steimer. Codex hat den Entscheidungsentwurf und die technischen Nachweise vorbereitet, übernimmt aber keine formelle Freigabe- oder Haftungsverantwortung.
