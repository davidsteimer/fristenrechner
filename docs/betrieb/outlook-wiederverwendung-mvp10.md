# Outlook-Wiederverwendungsvorschlag MVP 0.10

Stand: 30. Oktober 2026. **Technisch begründeter Vorschlag, menschlicher Entscheid offen.** Kein neuer Outlook-Import und keine Änderung an Kalendern oder Postfächern.

## Befund

Die drei tatsächlichen archivierten Baueingänge `calendarExport.ts`, `date.ts` und `i18n.ts` sind zwischen MVP 0.9 und MVP 0.10 byteidentisch. Geprüft wurden ihre vollständigen Inhalte gegen die jeweiligen Baunachweise, nicht nur heutige Arbeitskopien. Die Paketbindung für MVP 0.10 lautet `0.10.0.0`, SHA-256 `7b4af4f28426434a5c15c1055a6a5f029e34d6982d108a868fabf63a7e5278fd`.

Der administrative Exportadapter ergänzt zehn bedingte Herkunftszeilen, unter anderem für Eröffnungsauflösung, Stillstandsauswahl, regionale Kalenderauflösung und Dauerbestimmung. Ohne genau diese zusätzlichen Zeilen ist der Adapter byteidentisch zum MVP09-Baueingang. Die Bindung an den tatsächlichen aktuellen Fall und die erneute Berechnung vor dem Export bleiben erhalten. Die gesamte veränderte Oberfläche wird dadurch **nicht** als unverändert bezeichnet.

Der aktuelle [E-/Q-Nachweis](eq-vollzugsnachweis-mvp10.md) bestätigt acht tatsächliche, getrennte DE-/FR-Downloads aus allen vier Hosts sowie die Ergebnis- und Exportsperren. Die Dateien sind vollständig geprüft. Das ist ein aktueller Host- und Serialisierungsnachweis, kein Outlook-Importnachweis.

## Vorgeschlagene begrenzte Wiederverwendung

Der [tatsächliche Outlook-Web-Import und die damalige Desktopbestätigung aus MVP 0.5](outlook-pruefung-mvp05.md), zusammen mit der [MVP09-Bewertung](outlook-wiederverwendung-mvp09.md) und deren [menschlicher Bestätigung](abnahme-q-mvp09.md), können für folgende unveränderte Termineigenschaften wiederverwendet werden:

- Ganztägiger Termin am Fristablauf, exklusives Ende am Folgetag.
- Verfügbarkeit «frei» und Kategoriename `Fristablauf`.
- Relative Erinnerung `TRIGGER:-PT112H`, entsprechend vier Tagen und 16 Stunden.
- Deutsche/französische Betrefftexte und unveränderte allgemeine Beschreibung.
- Unveränderte Kalenderdatei-Erzeugung, Maskierung, UTF-8, CRLF, Zeilenfaltung und Downloadimplementierung.

## Grenzen

Nicht wiederverwendet werden die fachliche Richtigkeit neuer Berechnungen, neue rechtliche Herkunft, die gesamte UI-Ansteuerung oder die tatsächliche Darstellung der längeren neuen Beschreibung in Outlook. Diese Beschreibung ist in den aktuellen Dateien geprüft, aber nicht in Outlook angezeigt worden.

Eine aktuelle Outlook-Version, tatsächliche Erinnerungszustellung und Verhalten beim Sommerzeitwechsel sind nicht erneut geprüft. Der Kategoriename erzwingt keine kontospezifische dunkelgrüne Farbe. Die historische Desktopbestätigung behält ihren damaligen Detaillierungsgrad. Geräte- und Gastprüfung bleiben getrennte menschliche Aufgaben.

Der neue lokale Vergleichsbeleg umfasst 20’272 Bytes mit SHA-256 `1aceb2e1c1824f90375b56c928641445cd6fdd1ed6a06370d697569590606776`. Seine privaten Eingänge enthalten die konkreten Hostdateibindungen und werden nicht automatisch veröffentlicht. Die historischen Nachweise wurden nicht umgeschrieben.

## Entscheidvorlage M04

> Ich bestätige die begrenzte Wiederverwendung der bisherigen Outlook-Nachweise für MVP 0.10 hinsichtlich der unveränderten Termineigenschaften gemäss Vorschlag vom 30. Oktober 2026. Neue Berechnungen, Herkunft und deren Darstellung in Outlook sowie die übrigen ausdrücklich genannten Grenzen bleiben davon getrennt.

**Entscheid ausstehend.** Bis zur ausdrücklichen Bestätigung bleibt `humanReuseAccepted: false`. Ein neuer Import erfordert einen separaten Auftrag mit Konto, Kalender, Dateien und gezielter Bereinigung.
