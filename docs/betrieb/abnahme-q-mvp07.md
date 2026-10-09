# MVP 0.7 Q-Abnahme

Datum: 9. Oktober 2026. Entscheider und manueller Prüfer: David Steimer.

**David Steimer bestätigt die reale Geräteprüfung, den Gastzugriff und die manuelle Q-Abnahme. Damit ist R07-C für das Paket `0.7.0.2` und den Datenrelease `2026-10-08-mvp-07-approved.1` abgeschlossen. Die offengelegten Nachweisgrenzen bleiben erhalten. GitHub-Veröffentlichung und P-Bereitstellung sind damit nicht freigegeben.**

## Erklärung und gebundener Stand

Nach Übergabe der technischen E-/Q-Prüfungen und ihrer ausgewiesenen Grenzen erklärte David Steimer:

> 1. Reale Geräteprüfung bestanden.
> 2. Gastzugriff bestanden.
> 3. Manuelle Abnahme: abgenommen.

Die Erklärung bezieht sich auf den unmittelbar zuvor übergebenen Stand:

| Gegenstand | Abgenommener Stand |
| --- | --- |
| Anwendung / SPFx-Paket | `0.7.0` / `0.7.0.2` |
| Paketdatei | `fristenrechner-schweiz-0.7.0.2.sppkg` |
| Paketgrösse | 291’895 Bytes |
| Paket SHA-256 | `8bae0c1ea64b4482abea8fcdbd7aa5c576f6d552735b5a3e5f01a9ea68ab71db` |
| Datenrelease | `2026-10-08-mvp-07-approved.1` |
| Manifest SHA-256 | `fe1dfa0a241ac1c0e083998f05fb43e058f3c1be223f35cd276d3df436941597` |
| E-Ziele | Die bestehenden Rechnerinstanzen «Fristenrechner Test» und «Entwicklungsumgebung» |
| Q-Ziele | Die bestehende SharePoint-Rechnerseite «Fristenrechner Gastdemo» und die bestehende Rechnerregisterkarte «Fristenrechner Gastdemo Teams» |
| Datenquelle | Jeweils der gebundene vollständige SharePoint-Mirror mit 41 Laufzeitdateien |
| Technische Grundlage | [Vollzugsnachweis und Korrektur-Nachtests](eq-vollzugsnachweis-mvp07-0702.md), [Hauptmatrix](pruefmatrix-mvp07.md) und [gebundene Installationsvorlage](eq-installationsvorlage-mvp07-0702.md) |

## Abnahme und Nachweisgrenzen

| Punkt | Abschluss und Art des Nachweises |
| --- | --- |
| T10 · Reale Geräte | Als bestanden durch David bestätigt. Die Erklärung ist ein menschlicher Gesamtnachweis zur übergebenen Geräteprüfung, kein zusätzlicher automatisierter Gerätetest |
| T11 · Gastzugriff | Als bestanden durch David bestätigt. Ein Eigentümertest wird nicht als Gastnachweis umgedeutet |
| T12 · Manuelle Q-Abnahme | Für das oben gebundene Paket und den Datenrelease erteilt, gestützt auf den zuvor offengelegten Prüfstand |
| F08 · Anzeigeort | Die Release-ID steht im Seitenfuss beim Regel-/Kalenderstand statt innerhalb der Rechenspur. Diese offengelegte Abweichung bleibt dokumentiert. Die Abnahme schreibt sie nicht in eine wörtliche Erfüllung des ursprünglichen Anzeigekriteriums um |
| T09 · Historische AP5-Ansichten | Die gekennzeichnete Wiederverwendung der früheren E-/AP5-Belege zusammen mit dem frischen N04-Kompatibilitätsnachweis bleibt bestehen. Kein neuer vollständiger AP5-Netzabruf oder frischer Q-seitiger AP5-Netztest wird behauptet |

David hat in seiner Bestätigung keine Gerätemodelle, Betriebssystem- oder Appversionen, Eingabemethoden, einzelnen VoiceOver-Beobachtungen oder Gast-Einzelfallergebnisse angegeben. Diese Angaben werden nicht nachträglich erfunden. Insbesondere entsteht daraus weder ein gesonderter VoiceOver-Einzelbeleg noch die Behauptung, Codex habe die technische Matrix unter dem Gastkonto erneut vollständig ausgeführt. Die dokumentierte Detailtiefe der menschlichen Bestätigung bleibt vom Umfang der technischen Hostnachweise getrennt.

Die ursprüngliche Prüfmatrix, frühere Fehlversuche und privaten technischen Rohbelege bleiben unverändert. Diese Notiz ergänzt die menschliche Abnahme, sie setzt keinen historischen technischen Gesamtstatus rückwirkend auf «bestanden». Der bereits akzeptierte geringfügige Magic-Keyboard-Umgebungsbefund sowie die fachlichen und zeitlichen Abdeckungsgrenzen bleiben erhalten.

## Kalenderexport und nächste Schritte

Alle acht vorgesehenen E-/Q-Kalenderdateien wurden tatsächlich gespeichert und geprüft. Es erfolgte kein Outlook-Import. Die heutige Erklärung enthält keinen gesonderten Entscheid zur Wiederverwendung früherer Outlook-Importnachweise. Deren begründete releasebezogene Bewertung bleibt in der Publikationsvorbereitung separat auszuweisen. Die frühere MVP-0.6-Abnahme wird dafür nicht automatisch übernommen.

Als nächster Schritt folgt gemäss [Deploymentplan](deployment-mvp-07.md) die lokale Publikationsvorprüfung R07-D. Dabei sind der zusammengehörige Quell- und Dokumentationsstand, die für P passenden tatsächlichen Webartefakte und der Ausschluss privater Rohbelege, Sicherungen und Zugangsdaten zu prüfen. Diese Arbeiten sind mit der Q-Abnahme nicht bereits ausgeführt.

GitHub-Push, temporäre Deploy-Keys und öffentliche P-Bereitstellung bleiben gesondert freizugeben. Vor P sind eine frische Sicherung, die zielbezogenen Prüfungen und ein erneuter HEAD-/GET- und Cachevergleich erforderlich. Die begrenzte Header-/Cache-Risikoakzeptanz für MVP 0.6 gilt nicht automatisch für MVP 0.7. Root-Webauftritt, Sitemap und Hostingkonfiguration bleiben ohne zusätzlichen Auftrag unverändert.

Diese Dokumentation ändert keine M365-Berechtigungen oder Richtlinien, erweitert keinen Gastkreis und entfernt keine Testapps. Historische AP5-Pins und Daten bleiben erhalten. Das gebilligte Wiederherstellungspaket `0.7.0.3` wurde nicht eingesetzt. Es wird weder ein neuer Build noch ein Commit, Push, Deployment oder Outlookzugriff ausgelöst.

David Steimer nimmt Abnahme und Fachverantwortung in Personalunion wahr. Codex dokumentiert und prüft als KI-Arbeitsinstrument ohne eigene formelle Freigabe- oder Haftungsverantwortung.
