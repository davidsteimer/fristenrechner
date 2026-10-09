# Freigabe der MVP07 Korrekturinstallation und Rückfallpunkt H02

Am 9. Oktober 2026 hat David Steimer die vollständige Erklärung aus Abschnitt 5 der [gemeinsamen Installationsvorlage](eq-installationsvorlage-mvp07-0702.md) ausdrücklich im Projektchat erteilt. **R07C-H02 ist damit geschlossen.** Dies ist eine begrenzte Vollzugsfreigabe, keine bereits erfolgte Installation oder Hostabnahme.

## Gebundene Artefakte und Ziele

| Gegenstand | Freigegebene Bindung |
| --- | --- |
| Katalogwechsel | Bestehende Datei `fristenrechner-schweiz.sppkg`, frisch bestätigter Stand `0.7.0.0` → `fristenrechner-schweiz-0.7.0.2.sppkg`, Version `0.7.0.2` |
| Paket SHA-256 | `8bae0c1ea64b4482abea8fcdbd7aa5c576f6d552735b5a3e5f01a9ea68ab71db` |
| Bedingter vollständiger Rückfall | `fristenrechner-schweiz-recovery-0.7.0.3.sppkg`, Version `0.7.0.3` |
| Recovery SHA-256 | `9490890245e8aad54a5ec5eae731a0ee895f9fc9439dec19b371315085794702` |
| Private Zielbindung | `targets.private.json`, SHA-256 `d09ed734360581645475fb26b015be77138e49bcb89fd43160c5b463dfd242ec` |
| Vier bestehende Ziele | «Fristenrechner Test», «Entwicklungsumgebung», «Fristenrechner Gastdemo» und «Fristenrechner Gastdemo Teams» |

David hat die gemeinsame Codewirkung auf sämtliche bereits verbundenen Instanzen einschliesslich Q vor dessen App-/Mirrorumstellung, AP5 und allfälliger weiterer bestehender Verbraucher ausdrücklich akzeptiert. Keine automatische Installation auf zusätzlichen Sites.

## Bedingungen und Reihenfolge

Vor dem Katalogwechsel die Ausgangssicherung frisch bestätigen beziehungsweise gezielt ergänzen. Die konkreten Instanzen müssen eindeutig mit der privaten Zielbindung übereinstimmen. Sämtliche bereits hochgeladenen MVP07-Mirrorbytes und gesicherten Format-6-Rückfallquellen sind vollständig gegen die Sollbytes zu prüfen. Bei abweichendem Bestand oder ungeklärtem Fehler anhalten.

Zuerst dürfen ausschliesslich die beiden E-Apps aktualisiert und N01 bis N05 ausgeführt werden. Die E-Mirrorpfade bleiben erhalten. Erst nach bestandenem E-Gate dürfen die beiden Q-Apps aktualisiert und ausschliesslich deren Mirrorpfade auf `2026-10-08-mvp-07-approved.1` umgestellt werden. Die betroffene aktuelle Q-SharePoint-Seite darf dazu publiziert, die aktuelle Q-Teamsregisterkarte gespeichert werden. Anschliessend folgt die vollständige technische Q-Matrix F01 bis F09 und T01 bis T09. Websiteinhalte und Appdetails dürfen hierfür gezielt geöffnet werden.

Synthetische Fälle, gesicherte eigene Testpräferenzen und gespeicherte Kalenderdateien sind umfasst. Outlook-Importe nicht. Reale Geräte-/Gastprüfung und manuelle Q-Abnahme bleiben gesondert bei David.

## Geschlossener Rückfallpunkt

Die ausdrückliche Erklärung lautet auszugsweise:

> Ich schliesse R07C-H02 und billige für einen nötigen vollständigen Rückfall das Paket `fristenrechner-schweiz-recovery-0.7.0.3.sppkg`, Version `0.7.0.3`, mit SHA-256 `9490890245e8aad54a5ec5eae731a0ee895f9fc9439dec19b371315085794702`.

Der Rückfall darf ausschliesslich nach Abschnitt 4 der gebundenen Vorlage erfolgen, mit den jeweils eigenen gesicherten Format-6-Mirrors, unverändertem AP5-Pin, geschützten gemeinsamen Standards und anschliessender Prüfung aller vier aktuellen Hosts sowie AP5. Browserdatenreset und Deinstallation sind ausgeschlossen. Die gemeinsame Codewirkung, der Funktionsumfang MVP 0.6 und die Notwendigkeit einer erneut höheren Paketversion für die spätere reguläre Wiederaufnahme sind ausdrücklich bestätigt. H01 und die frühere Recovery-Bindung bleiben historisch erhalten.

AP21-Testapps, E05, zusätzliche Gäste, M365-Berechtigungen und Richtlinien, GitHub und steimer.ch-P bleiben unverändert. Historische AP5-Pins und Daten sowie fremde Browserpräferenzen dürfen nicht verändert werden. David entscheidet in Personalunion. Codex dokumentiert und vollzieht die begrenzt freigegebenen Schritte ohne formelle Freigabe- oder Haftungsverantwortung.
