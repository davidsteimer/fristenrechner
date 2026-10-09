# MVP 0.7 Releasehinweise

Stand: 9. Oktober 2026. MVP 0.7 verbindet die abgenommene nationale Kalenderintegration aus AP22 mit der Datumseingabe aus AP21. Anwendung `0.7.0` und SPFx-Paket `0.7.0.2` sind auf den vier bestehenden E-/Q-Instanzen installiert. David hat reale Geräteprüfung und Gastzugriff bestätigt und [Q abgenommen](abnahme-q-mvp07.md). Die lokale Publikationsvorbereitung folgt. **GitHub und öffentliche P-Bereitstellung benötigen weiterhin eigene ausdrückliche Freigaben.** Öffentlich dokumentiert ist [MVP 0.6](produktionsbereitstellung-mvp06-2026-10-01.md).

## Kalender und Rechtsumfang

Für die unterstützten Bundesverfahren StPO, ZPO, BGG und VwVG stehen die freigegebenen Feiertagszuordnungen aller Kantone zur Verfügung. 198 Herkunftsentscheide werden von 104 konkreten Verfahrensbindungen getrennt. Daraus entstehen 32 Kalender. Wo ein Kanton mehrere rechtlich relevante Geltungsbereiche oder abweichende Prozesslisten kennt, wird die erforderliche Auswahl ausdrücklich verlangt.

Die Fristberechnung verwendet die konkrete Verfahrensbindung, die massgebende Rolle und den Ort. Ein fehlender Sachverhalt wird nicht mit einem Berner oder eidgenössischen Ersatzkalender ergänzt. Das kantonale Verwaltungsverfahren bleibt auf das modellierte Berner Recht beschränkt. Die 44 nationalen Sozialregeln und 50 Berner Anbindungen bleiben fachlich unverändert und weiterhin auf ihre Freigabe für Bern und 2026–2027 begrenzt.

Bei den vier vorbehaltenen Januarzuordnungen wird mit und ohne die konkret unsichere Regel vollständig gerechnet. Führt dies zu unterschiedlichen rechtlichen Ergebnissen, werden weder ein definitiver Fristablauf noch ein Kalenderexport angeboten. Die getrennten GR- und NE-Vorbehalte bleiben als berechenbare Grenzen sichtbar. Die beschlossene AI-Behandlung bleibt erhalten.

Die Kalenderabdeckung beginnt am 29. August 2026 und hat kein pauschales Enddatum. Dies ist keine Zusicherung unveränderter Rechtslagen auf unbegrenzte Zeit. Normgeltung, Gebietsstände, Profilgrenzen, regelmässige Quellenprüfung und besondere Releasegrenzen bleiben massgebend.

## Datumseingabe

Das linksbündige Textfeld zeigt das erwartete Datumsformat auch auf mobilen Geräten. Es erlaubt vollständige Daten sowie die abgenommenen Eingabehilfen für einen Tag im aktuellen Monat, Tag und Monat im aktuellen Jahr und `h` für das heutige Datum. Enter, Tab und Verlassen des Felds lösen die Normalisierung und Prüfung aus. Ein Kalender bleibt optional verfügbar.

Sobald Datumstext bearbeitet wird, werden ein bisheriges Ergebnis und dessen Export ungültig. Ungültige oder unvollständige Eingaben erzeugen keinen definitiven Fristablauf. Der dokumentierte geringfügige iPad-Magic-Keyboard-Befund bleibt ein akzeptierter Umgebungsbefund. Er wird nicht als allgemeiner Nachweis für alle Geräte oder für iOS-Teams ausgegeben.

## Technischer Wechsel

- Anwendung `0.7.0`, SPFx-Solution und Feature `0.7.0.2`. Produktidentitäten bleiben unverändert. Die begrenzte Darstellungskorrektur zeigt lange ausgewählte und geöffnete Dropdowntexte mehrzeilig, bei unveränderter Fachlogik und zweispaltigem Grundaufbau.
- Manifest und Mindestconsumer `7.0.0`, Regelkalender `3.0.0`, Feiertagskatalog `2.0.0`.
- Rechtsprofile `1.0.0`, Spezialregimekatalog `3.0.0` und Sozialverfahrenskatalog `2.0.0` bleiben als Formate unverändert.
- 40 Datenartefakte plus Manifest, insgesamt 41 Mirrordateien.
- Persönliche Standards werden auf Version 4 migriert. Fehlende Fallfakten, Datum, Referenz und Resultat werden nicht erfunden oder als persönliche Standards gespeichert.
- Provider und lokaler Cache sind an die tatsächliche Datenkonfiguration gebunden. Jede umgestellte Instanz muss die eigene neue Quelle zunächst erfolgreich laden.
- Historische Formate und AP5-Pins bleiben unterstützt. Eine aktuelle Paketcode-Version ersetzt nicht deren historische Datenfreigabe.
- Keine zusätzlichen API-Berechtigungen, keine neue Infrastruktur und keine Änderung der bestehenden Hostingkonfiguration.

Deutsch und Französisch bleiben die Produktsprachen. Weitere kantonale Verwaltungsverfahren, ausserbernische Sozialfreigaben, IT/Rumantsch-Oberfläche, Kalender-App und Karte gehören nicht zu diesem Release.

## Gebundener Stand und Nachweisgrenzen

Das [SPFx-Paket](../../outputs/release-mvp07-spfx-0.7.0.2-2026-10-09/artifacts/fristenrechner-schweiz-0.7.0.2.sppkg) umfasst 291’895 Bytes, SHA-256 `8bae0c1ea64b4482abea8fcdbd7aa5c576f6d552735b5a3e5f01a9ea68ab71db`. Der Datenrelease lautet `2026-10-08-mvp-07-approved.1`, Manifest SHA-256 `fe1dfa0a241ac1c0e083998f05fb43e058f3c1be223f35cd276d3df436941597`. Das ursprüngliche Paket `0.7.0.0` und das ursprüngliche Webarchiv bleiben historische Baunachweise, nicht die aktuellen korrigierten Auslieferungsartefakte.

Der [korrigierte Webkandidat](../../outputs/release-mvp07-web-corrected-0702-2026-10-09/artifacts/fristenrechner-mvp07-steimer-web-corrected-0702.zip) umfasst 606’775 Bytes, SHA-256 `9f986c7d8f8d6366914f9605f46b2fd87987fcbdaf17875ce9d2c4d044b07228`. Sein lokaler Artefaktnachweis bindet die 41 unveränderten freigegebenen Datendateien und die korrigierte Oberfläche. Er ist weder eine öffentliche Bereitstellung noch eine Hosting-/Browserabnahme.

Der [E-/Q-Vollzug](eq-vollzugsnachweis-mvp07-0702.md) dokumentiert tatsächliche Hostprüfungen, acht gespeicherte und geprüfte Kalenderdateien sowie deren Grenzen. F08 bleibt eine Anzeigeortabweichung: Die Release-ID steht im Seitenfuss statt in der Rechenspur. T09 verwendet gekennzeichnete frühere E-/AP5-Belege und den frischen N04-Kompatibilitätsnachweis, ohne einen neuen vollständigen AP5-Netzabruf zu behaupten. Die Geräte-/Gastbestätigung ist ein menschlicher Gesamtnachweis, keine nachträglich rekonstruierte Einzelmatrix.

Es gab keinen neuen Outlook-Import. Der [Vorschlag zur Wiederverwendung](outlook-wiederverwendung-mvp07.md) früherer Importnachweise ist technisch begründet, aber noch nicht abgenommen. Die [Quellenabnahme](../fachrecht/abnahme-quellen-mvp07.md), lokale Baunachweise und Q-Abnahme bleiben voneinander getrennt. Die beschlossenen fachlichen Vorbehalte einschliesslich des ergänzenden historischen Freiburger Praxisbelegs bleiben bestehen.

Der [Deploymentplan](deployment-mvp-07.md) trennt die weitere lokale Publikationsprüfung von späteren GitHub-/P-Freigaben. Die frühere Header-/Cache-Risikoakzeptanz für MVP 0.6 gilt nicht automatisch für MVP 0.7. Der gebilligte [Rückfall `0.7.0.3`](eq-installationsvorlage-mvp07-0702.md) wurde nicht eingesetzt. Bestehende M365-Rechte, AP21-Testapps, AP5-Pins und öffentlicher Betriebsstand werden durch diese Releasehinweise nicht verändert.
