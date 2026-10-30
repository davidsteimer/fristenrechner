# MVP 0.10 · Q-Abnahme und Outlook-Entscheid

Datum: 30. Oktober 2026. Entscheider und manueller Prüfer: David Steimer.

**Die fachliche Q-Abnahme, die reale Geräteprüfung, der bestehende B2B-Gastzugriff auf beiden Q-Hosts und die begrenzte Outlook-Wiederverwendung sind ausdrücklich bestätigt. Damit ist R10-C einschliesslich C08 abgeschlossen. R10-D ist ausschliesslich als lokale Publikationsvorprüfung beauftragt.**

## Erklärungen und gebundener Stand

David Steimer hat Q für den gebundenen Stand einschliesslich der dokumentierten Restbefunde fachlich abgenommen und die Wiederverwendung gemäss dem [Outlook-Vorschlag vom 30. Oktober](outlook-wiederverwendung-mvp10.md) bestätigt. Er hat die Publikationsvorprüfung beauftragt. Auf die gesonderte Frage, ob auch die reale Geräteprüfung und die Anmeldung des bestehenden B2B-Gasts auf Q-SharePoint und Q-Teams bestanden sind, antwortete er anschliessend:

> Ja, beide bestanden

| Gegenstand | Abgenommener Stand |
| --- | --- |
| Anwendung / SPFx-Paket | `0.10.0` / `0.10.0.0` |
| Paket | `fristenrechner-schweiz-0.10.0.0.sppkg`, 843’895 Bytes |
| Paket SHA-256 | `7b4af4f28426434a5c15c1055a6a5f029e34d6982d108a868fabf63a7e5278fd` |
| Datenrelease | `2026-10-28-mvp-010-approved.1`, 45 Dateien einschliesslich Manifest |
| Manifest SHA-256 | `7562597cee45ad1e4995989f7f31b2e8d0619baaf1f9618355ca870c8426a016` |
| Vertrag | Manifest/Mindestconsumer `17.0.0`, Verwaltungskatalog `10.0.0` |
| Q-Ziele | Bestehende Rechnerseite «Fristenrechner Gastdemo» und bestehende Registerkarte «Fristenrechner Gastdemo Teams» |
| Technische Grundlage | [Vollzugsnachweis C01–C07](eq-vollzugsnachweis-mvp10.md), [unveränderte Prüfmatrix](pruefmatrix-mvp10.md) und [Installationsvorlage](eq-installationsvorlage-mvp10.md) |
| C07-Gesamtnachweis | 688’207 Bytes, SHA-256 `ccd0b82ccb364935c7a9944ec4d2c55ef61b74da377f831a5869012ccf7ecafd` |
| Outlook-Vorschlag | 3’689 Bytes, SHA-256 `c7631aa0e7e1fe1b3b67ae6c893e7e69c5be4936ac027373eaebc5dc0bafc64f` |

## Menschlicher Abschluss C08

| Punkt | Bestätigung und Nachweisart |
| --- | --- |
| M01 Geräte | Reale Geräteprüfung von David ausdrücklich als bestanden bestätigt |
| M02 bestehender Gast | Tatsächliche Anmeldung des bestehenden B2B-Gasts auf Q-SharePoint und Q-Teams von David ausdrücklich als bestanden bestätigt |
| M03 Q-Abnahme | Für den gebundenen Stand einschliesslich dokumentierter Restbefunde ausdrücklich erteilt |
| M04 Outlook | Begrenzte Wiederverwendung gemäss unverändertem Vorschlag ausdrücklich bestätigt |

Gerätemodelle, Betriebssystem-/Appversionen, Tastaturen und einzelne Gast-Fallergebnisse wurden in dieser Bestätigung nicht genannt. Sie werden weder erfunden noch aus älteren Prüfungen ergänzt. Ein gesonderter VoiceOver-Nachweis wird nicht behauptet. Die bekannte geringfügige iPad-/Magic-Keyboard-Grenze bleibt erhalten.

Die akzeptierten Textbefunde **R10C-E-SP-B09-H01** zur BL-Bezeichnung `administrativeOfficeClosure` und **R10C-E-SP-B22-H01** zum unzutreffenden VD-Stillstandstext bei später Zeitgrenzsperre bleiben unverändert. Die [Nacharbeit](../ux/r10c-restbefunde.md) bleibt erforderlich. Die im Vollzugsnachweis dokumentierten Vorbereitungs-, Layout- und Wiederverwendungsgrenzen bleiben bestehen. Die Abnahme behebt keine Fehler und erweitert keine Berechtigungen.

## Bestätigte Outlook-Wiederverwendung

Die bisherigen Importnachweise gelten begrenzt für die im Vorschlag beschriebenen unveränderten Termineigenschaften. Die tatsächlichen archivierten Kalenderexport-, Datums- und Sprachquellen sind zwischen MVP 0.9 und MVP 0.10 bytegleich. Der administrative Adapter enthält zehn zusätzliche bedingte Herkunftszeilen. Das ist keine vollständige Unverändertheit der Oberfläche.

Acht tatsächliche DE-/FR-Kalenderdownloads aus vier Hosts sind aktuell gespeichert und geprüft. Ein neuer Outlook-Import wurde nicht durchgeführt. Neue Berechnungen, Herkunft und deren Darstellung in Outlook, aktuelle Outlookversionen, tatsächliche Erinnerungszustellung, Sommerzeitverhalten und kontospezifische Kategorienfarbe werden nicht durch die Wiederverwendung neu bestätigt.

Der ursprüngliche Vorschlag, die technische Vergleichsdatei und frühere technische Berichte behalten ihre damaligen offenen menschlichen Statusflags. **Diese additive Abnahme schliesst die später erteilten Bestätigungen.** Es werden keine historischen Belege rückwirkend umgeschrieben.

## Nächste Stufe

Die lokale Publikationsvorprüfung R10-D prüft Bindungen, öffentlichen Dateiumfang, private Ausschlüsse, testbare Portabilität und lebende Einstiegs-/IT-Unterlagen. Der offene technische Einstiegspunkt **R10B-CLI-H01** wird gesondert beurteilt. Produktregeln, Rechtsdaten und abgenommene Artefakte bleiben unverändert.

Diese Abnahme erteilt **keine** Freigabe für zusätzliche Commits, GitHub-Push, temporäre Schreibzugänge oder P-Bereitstellung. Der [Betreiberentscheid zur bekannten Hostingplattformgrenze](hosting-plattformgrenze-header-cache-2026-10-19.md) bleibt bestehen. Keine erneute Header-/Cacheprüfung. Die konkrete P-Bereitstellung und Risikoübernahme für MVP 0.10 sind separat zu entscheiden.

David nimmt Fachverantwortung und Abnahme in Personalunion wahr. Codex dokumentiert und prüft als KI-Arbeitsinstrument ohne formelle Freigabe- oder Haftungsverantwortung.
