# MVP 0.6 · Releasehinweise

Stand: 1. Oktober 2026. **E/Q abgenommen, öffentliche Bereitstellung noch nicht ausgeführt.** Der letzte dokumentierte öffentliche P-Stand bleibt MVP 0.5. Die Hinweise beschreiben den vorbereiteten MVP-0.6-Stand, keine bereits erfolgte Veröffentlichung.

## Änderungen für Benutzende

Die Sozialversicherungsverfahren ergänzen EOG, FamZG, FLG, MVG und ÜLG im abgenommenen AP20-Umfang. Insgesamt sind 44 nationale Regeln mit 50 ausdrücklich bernischen Anbindungen modelliert. Verfahrensrecht, Zuständigkeit und Feiertagsanknüpfung bleiben getrennt. Die nationale Modellierung bedeutet keine Freigabe zusätzlicher kantonaler Verfahren.

Die Oberfläche bleibt Deutsch und Französisch. Es werden nur fallrelevante Zusatzangaben eingeblendet. Fehlende, fremde oder nicht freigegebene Konstellationen erzeugen kein scheinbar gültiges Fristresultat. Längere französische Auswahltexte zur Feiertagsanknüpfung werden im korrigierten Paket lesbar umbrochen.

Der Kalenderexport ist fachlich unverändert. Die 28 tatsächlichen E-/Q-Dateiexporte und die ausdrücklich beschlossene Wiederverwendung der bisherigen Outlook-Importnachweise sind im [Q-Abschluss](abnahme-q-mvp06.md) abgegrenzt. Es gab keinen neuen Outlookimport für diese Wiederverwendung.

## Versionen und Installation

| Bestandteil | MVP 0.6 |
| --- | --- |
| Anwendung | `0.6.0` |
| Aktuelles geprüftes SPFx-Paket | `0.6.0.1` |
| Datenrelease | `2026-10-01-mvp-06-approved.1` |
| Manifest / Mindestconsumer | `6.0.0` / `6.0.0` |
| Sozialverfahrenskatalog | `2.0.0` |
| Neue Webauslieferung | Separates korrigiertes Webarchiv `0601`, nicht das ursprüngliche MVP-0.6-Webarchiv |

App und Datenpfad müssen koordiniert aktualisiert werden. Ein MVP-0.5-Consumer kann Format 6 nicht lesen. Der aktuelle Consumer bleibt mit den alten Formaten kompatibel. Ein vollständiger Mirror enthält elf Dateien. Die neun Nicht-Sozialkatalog-Komponenten sind gegenüber MVP 0.5 unverändert. Die [Dritt-Tenant-Anleitung](installation-und-betrieb-dritttenants.md) beschreibt Installation, Mirror und Rückfall.

## Grenzen und Nachweise

Die zeitlichen und sachlichen Produktgrenzen der AP20-Abnahmen gelten weiter. Ebenso bleiben AI-Quellenkonflikt, AVIV-Option B, OF-001 und NE-Vorbehalt sichtbar. Der gesamtschweizerische Feiertagskatalog enthält 479 Regeln, die operative Projektion bleibt auf die bisherigen zwölf CH-/BE-Regeln beschränkt. Keine Kalender-App und keine neuen Oberflächensprachen.

Die abgenommenen Quellen-, Daten-, E-/Q- und Korrekturbelege werden nicht überschrieben. Der öffentliche Testumfang prüft Produktverhalten und Integrität der öffentlichen Freigabebelege. Der private Quellen-Vollaudit bleibt gesondert ausführbar und zwingend für die hierfür vorgesehenen Übernahmeschranken. Ein öffentlicher Integritätstest ist keine erneute Quellenprüfung.

Der [Publikationsnachweis](publikationspaket-mvp06.md) bindet Dateiumfang, Artefakte und lokale Prüfungen. GitHub-Push, Deploy-Key und P-Bereitstellung benötigen weiterhin separate konkrete Freigaben. Vor P sind Sicherung, HEAD-/GET-Vergleich, gegebenenfalls erneute Risikoentscheidung und die tatsächliche öffentliche Prüfmatrix nötig.
