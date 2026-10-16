# MVP 0.8 Q-Abnahme und Outlook-Entscheid

Datum: 16. Oktober 2026. Entscheider und manueller Prüfer: David Steimer.

**David Steimer bestätigt die bestandene Geräteprüfung und den Gastzugriff, nimmt Q für MVP 0.8 ab und bestätigt die begrenzte Wiederverwendung der Outlook-Nachweise. Damit ist R08-C einschliesslich C08 abgeschlossen. R08-D beginnt mit der lokalen Publikationsvorprüfung. Eine Veröffentlichung auf GitHub oder Bereitstellung auf P ist damit nicht freigegeben.**

## Erklärung und gebundener Stand

Nach Übergabe des technischen E-/Q-Gesamtnachweises C07 erklärte David Steimer:

> Geräteprüfung und Gastzugriff sind bestanden. Ich nehme Q für MVP 0.8 ab und bestätige die begrenzte Wiederverwendung der Outlook-Nachweise. Bitte starte R08-D mit der lokalen Publikationsvorprüfung.
> Offen ist noch die Korrektur der Höhe des Feldes Empfangsdatum. Diese kann im Rahmen des nächsten Releases erfolgen.

Die Erklärung bezieht sich auf den unmittelbar zuvor übergebenen Stand:

| Gegenstand | Abgenommener Stand |
| --- | --- |
| Anwendung / SPFx-Paket | `0.8.0` / `0.8.0.0` |
| Paketdatei | `fristenrechner-schweiz-0.8.0.0.sppkg` |
| Paketgrösse und SHA-256 | 311’611 Bytes, `d3d06adcd78176db66f8227d884fd66ca2fbcee0bffab66755789dd0cc29dc1a` |
| Datenrelease | `2026-10-15-mvp-08-approved.1` |
| Manifest SHA-256 | `2461f06c0a7d79dcd6a177fc116f08fcc0efa62e03b38ba6ac87964457c19aa4` |
| E-Ziele | Die bestehenden Rechnerinstanzen «Fristenrechner Test» und «Entwicklungsumgebung» |
| Q-Ziele | Die bestehende SharePoint-Rechnerseite «Fristenrechner Gastdemo» und die bestehende Rechnerregisterkarte «Fristenrechner Gastdemo Teams» |
| Datenquelle | Jeweils der gebundene vollständige SharePoint-Mirror mit 42 Laufzeitdateien |
| Technischer Nachweis | [E-/Q-Vollzugsnachweis](eq-vollzugsnachweis-mvp08.md), [Prüfmatrix](pruefmatrix-mvp08.md) und [konkrete Installationsvorlage](eq-installationsvorlage-mvp08.md) |
| Outlook-Grundlage | [Begrenzter Wiederverwendungsvorschlag vom 15. Oktober](outlook-wiederverwendung-mvp08.md), ergänzt durch die acht tatsächlichen E-/Q-Kalenderdateien |

## Menschliche Abnahme und technische Nachweise

| Punkt | Abschluss und Nachweisart |
| --- | --- |
| M01 Geräte | Von David als bestanden bestätigt. Menschlicher Gesamtnachweis, kein zusätzlicher automatisierter Gerätetest |
| M02 Gast | Gastzugriff von David als bestanden bestätigt. Die technischen Eigentümerprüfungen werden nicht als Gastprüfungen umgedeutet |
| M03 Q-Abnahme | Für das gebundene Paket und den Datenrelease ausdrücklich erteilt |
| C08 | Mit den menschlichen Bestätigungen und dem ausdrücklich bestätigten Outlook-Wiederverwendungsentscheid abgeschlossen |

Die Bestätigung enthält keine einzelnen Gerätemodelle, Betriebssystem- oder Appversionen, Eingabemethoden oder Gast-Einzelfallergebnisse. Diese Detailangaben werden nicht ergänzt oder aus älteren Prüfungen übernommen. Ein gesonderter VoiceOver-Nachweis bleibt offen. Die bereits akzeptierte geringfügige iPad-Magic-Keyboard-Grenze bleibt erhalten.

Die technische C07-Zusammenführung und ihre privaten Rohbelege bleiben unverändert. Frühere unbewiesene Versuche, die anschliessenden kontrollierten Wiederholungen sowie die im Vollzugsnachweis bezeichneten Cache-, Transfer- und Werkzeuggrenzen werden durch die Abnahme nicht rückwirkend geändert. Fachliche und zeitliche Abdeckungsgrenzen bleiben bestehen.

## Begrenzte Outlook-Wiederverwendung bestätigt

Bestätigt ist die Wiederverwendung der bisherigen Importnachweise ausschliesslich für den unveränderten Terminvertrag: ganztägiger Termin, exklusiver Folgetag als Ende, freie Verfügbarkeit, Kategorie `Fristablauf`, relative Erinnerung `-PT112H` und lokaler ICS-Download ohne Teilnehmende oder Einladung.

Der MVP08-Serializer ist wegen der optionalen Beschreibungsergänzung nicht byteidentisch mit MVP07. Die neue administrative Berechnungs-, Herkunfts- und Exportfreigabelogik wird durch die aktuellen lokalen und E-/Q-Prüfungen belegt, nicht durch alte Outlookimporte. Alle acht E-/Q-Kalenderdateien wurden tatsächlich gespeichert und geprüft. Ein neuer Outlook-Import wurde nicht durchgeführt.

Die im Vorschlag ausgewiesenen Grenzen bleiben bestehen. Insbesondere sind Erinnerungszustellung, Sommerzeitverhalten, aktuelle Outlookversionen und die Darstellung der erweiterten Beschreibung nicht frisch in Outlook nachgewiesen. Der Kategoriename erzwingt keine dunkelgrüne Farbe. Der Vorschlag bleibt als ursprünglicher Entscheidungsgegenstand unverändert, diese Notiz dokumentiert seine nachfolgende Annahme.

## Feldhöhe und nächster Release

Die noch abweichende Höhe des Feldes «Empfangsdatum» bleibt unter [Issue #50](https://github.com/davidsteimer/fristenrechner/issues/50) als begrenzter Prüf- und Korrekturpunkt offen. David ordnet die Korrektur dem nächsten Release zu. Sie ist keine Sperre der vorliegenden Q-Abnahme und keine Erlaubnis, die abgenommenen MVP08-Artefakte nachträglich zu verändern.

Für den Folgerelease sind die tatsächlichen Höhen von Datum, Tageszahl und benachbarten Auswahlfeldern in DE und FR auf den betroffenen Hosts und Geräten zu vergleichen. Eine nötige Korrektur bleibt auf die Darstellung begrenzt. Zweispaltiger Aufbau, Datumskurzformen, Tastaturbedienung und fachliche Rechenregeln sind zu erhalten. Das GitHub-Issue wird durch diese lokale Dokumentation nicht verändert.

## Nächster Schritt und Freigabegrenzen

R08-D prüft lokal die Artefakt- und Quellbindung, die öffentliche Dateiauswahl, den Ausschluss privater Rohbelege und Sicherungen, die Portabilität der öffentlichen Prüfungen sowie die lebenden Einstiegstexte und IT-Unterlagen. Ergebnisse stehen im [Publikationsvorprüfbericht](publikationsvorpruefung-mvp08.md).

Zusätzliche Commits, GitHub-Push, temporäre Schreibzugänge und P-Bereitstellung bleiben gesondert freizugeben. Vor P sind eine frische Sicherung, der aktuelle HEAD-/GET-/Cachevergleich und die zielbezogene Prüfmatrix erforderlich. Die frühere begrenzte Header-/Cache-Risikoakzeptanz wird nicht automatisch auf MVP 0.8 ausgedehnt. Root-Webauftritt, Sitemap, Hostingkonfiguration, AP5-Pins, AP21-Testapps, M365-Berechtigungen und Richtlinien bleiben unverändert. Das gebilligte Recovery-Paket `0.8.0.1` wurde nicht eingesetzt.

David Steimer nimmt Fachverantwortung und Abnahme in Personalunion wahr. Codex dokumentiert und prüft als KI-Arbeitsinstrument ohne formelle Freigabe- oder Haftungsverantwortung.
