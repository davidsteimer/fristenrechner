# Outlook-Wiederverwendungsvorschlag MVP 0.9

Stand: 18. Oktober 2026. **Vorschlag zur gesonderten Bestätigung, noch nicht abgenommen.** Kein neuer Outlook-Import und keine Änderung an Kalendern oder Postfächern.

## Grundlage und Umfang

Für MVP 0.9 wird vorgeschlagen, die bestehenden Outlook-Nachweise begrenzt für die Interpretation der unveränderten Termineigenschaften wiederzuverwenden. Grundlage sind der [MVP05-Importnachweis](outlook-pruefung-mvp05.md) und die [MVP08-Bewertung](outlook-wiederverwendung-mvp08.md) mit den dort gebundenen definitiven Artefaktnachweisen. Die historischen Dokumente bleiben unverändert.

Der [maschinenlesbare Vergleich](../../outputs/release-mvp09-2026-10-18/outlook-reuse-assessment.json) verwendet die tatsächlichen archivierten Baueingänge beider Releases. Kalenderserialisierung, Datumsarithmetik und Sprachdatei sind bytegleich. Auch die geprüften Funktionsblöcke für Exportkachel, allgemeine Resultate und Spezialresultate sind unverändert.

Die drei Änderungen im administrativen Export betreffen den Import und Aufruf des verifizierten Format-8-/Format-9-Zugriffs sowie eine zusätzliche Qualifikationsprüfsumme innerhalb der Beschreibung. Bindung an den tatsächlichen Fall und das Ergebnis sowie erneute Berechnung vor dem Export bleiben erhalten.

## Frische lokale Nachweise

Zwei tatsächliche Browserdownloads und zehn Exporte aus dem definitiven MVP09-Paket wurden geprüft. Die zehn Paketexporte decken je einen TI-, GR-, LU-, ZG- und AR-Pfad auf Deutsch und Französisch ab. Sie verwenden simulierte Browser- und Downloadgrenzen und sind keine SharePoint-, Teams- oder Outlook-Nachweise.

Unverändert bestätigt sind:

- Ganztägiger Termin mit exklusivem Enddatum am Folgetag.
- Verfügbarkeit «frei», Kategorie `Fristablauf` und Erinnerung `TRIGGER:-PT112H`.
- Deutsche und französische Betrefftexte sowie eine lokal erzeugte Kalenderdatei.
- UID, UTC-Zeitstempel, UTF-8, CRLF und regelkonforme Zeilenfaltung.
- Keine zusätzlichen Termineigenschaften wie Teilnehmende, Serienregeln oder Anhänge.

Die neue rechtliche Herkunft ist gegen den gebundenen MVP09-Katalog geprüft. Ihre Darstellung in Outlook ist **nicht** durch frühere Importnachweise abgedeckt. Ebenso wenig decken alte Importe neue Berechnungspfade, Qualifikationsprüfungen oder das Verhalten in tatsächlichen M365-Hosts ab.

## Fortbestehende Grenzen

Die bisherige Desktopbestätigung behält ihren ursprünglichen Detaillierungsgrad. Eine aktuelle Outlook-Version, die tatsächliche Erinnerungszustellung und der Sommerzeitwechsel wurden nicht erneut beobachtet. Der Kategoriename erzwingt keine kontospezifische dunkelgrüne Farbe. Die neue Beschreibungszeile wurde lokal serialisiert und geprüft, nicht in Outlook dargestellt.

Aktuelle Exporte auf den vier E-/Q-Hosts sowie ihre Resultatbindung und Invalidierung sind in R09-C gesondert zu prüfen. Neue Outlook-Importe sind durch R09-B nicht erlaubt.

## Vorgeschlagener Entscheid

Die vorhandenen Outlook-Nachweise werden für MVP 0.9 ausschliesslich hinsichtlich der unveränderten Termineigenschaften begründet wiederverwendet. Neue rechtliche Herkunft, Berechnungslogik, Qualifikation und Hostverhalten bleiben davon getrennt.

**Entscheid offen.** Bis zur ausdrücklichen Bestätigung durch David Steimer bleibt `humanReuseAccepted: false`. Dieser Vorschlag ist keine bereits erteilte Freigabe.
