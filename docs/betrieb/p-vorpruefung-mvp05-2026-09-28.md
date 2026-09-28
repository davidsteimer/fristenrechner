# MVP 0.5 · P-Vorprüfung und begrenzte Risikoakzeptanz

Stand: 28. September 2026, nach dem lokalen Publikationspaketabschluss. **Headerdiagnose wiederholt. Bekannte Abweichung gemäss Benutzerentscheid als Restrisiko akzeptiert. Konkrete P-Bereitstellung beauftragt, noch nicht ausgeführt. Passende Quellcodeveröffentlichung bleibt vor der Umschaltung zu klären.**

Dieser Nachtrag ergänzt den [MVP-0.5-Deploymentplan](deployment-mvp-05.md) und den [lokalen Paketabschluss](publikationspaket-mvp05.md). Deren bisheriger Stand und das gebundene Dateiinventar bleiben unverändert. Die frühere absolute Header-Haltebedingung wird für den nachstehend bezeichneten Release durch den neuen menschlichen Entscheid ersetzt. Kein bestandener Header-Test wird nachträglich behauptet.

## 1. Neuer Auftrag

David Steimer hat den gezielten Wiederholungstest, die Ergebnisdokumentation, bei weiterhin negativem Ergebnis die Festhaltung des akzeptierten Risikos und anschliessend die Bereitstellung von MVP 0.5 auf P beauftragt. Eine Bereitstellung vor dem Wiederholungstest wurde als mögliche Vereinfachung angeboten. Da die Diagnose mit zehn schreibfreien Abrufen durchführbar war, wurde zuerst geprüft.

Die Freigabe betrifft den bestehenden Rechnerpfad auf der bestehenden steimer.ch-Infrastruktur und den unveränderten definitiven MVP-0.5-Webbuild. Sie beinhaltet keine neuen Hostingdienste, Änderungen an DNS, E-Mail, M365-Berechtigungen oder der übrigen Website. Eine GitHub-Veröffentlichung und neue temporäre Schreibschlüssel werden daraus nicht abgeleitet.

## 2. Wiederholung der Headerdiagnose

Messzeitpunkt: **28.09.2026, 18:37 Uhr Europe/Zurich**. Zuvor wurde das öffentliche Buildmanifest frisch abgerufen. Der produktive Rechner liefert weiterhin Anwendung `0.3.0` und Datenrelease `2026-08-31-mvp-03-approved.1`.

Die ursprüngliche Diagnosefunktion wurde unverändert wiederverwendet, einschliesslich der verlustfreien Erfassung mehrfacher Header. Ihre sechs Offline-Regressionstests bestehen. Die damalige temporäre MVP-0.4-Adresse ist zurückgezogen und wurde nicht wieder veröffentlicht. Geprüft wurden stattdessen die aktuelle produktive HTML-Seite, die im aktuellen Manifest bezeichneten App-JS-/CSS-Dateien, ein bestehender Lizenztext und das Buildmanifest, jeweils mit HEAD und tatsächlichem GET. Keine Anmeldung, Cookies, Weiterleitungsverfolgung oder externen Schreibzugriffe.

Alle **zehn Antworten lieferten HTTP 200**. Die GET-Antwortkörper wurden vollständig gelesen und mit Bytezahl und SHA-256 erfasst.

| Ressource | HEAD | GET |
| --- | --- | --- |
| `/fristenrechner/` | Alle fünf erwarteten Schutzheader vorhanden | Alle fünf fehlen |
| `assets/app-V3VOY2SA.js` | Alle fünf vorhanden | Alle fünf fehlen |
| `assets/app-B6T7L4JH.css` | Alle fünf vorhanden | Alle fünf fehlen |
| `licenses/react-MIT.txt` | Alle fünf vorhanden | Alle fünf fehlen |
| `build-manifest.json` | Alle fünf vorhanden | Alle fünf vorhanden |

Betroffen sind `Content-Security-Policy`, `X-Content-Type-Options`, `Referrer-Policy`, `X-Frame-Options` und `Permissions-Policy`. Der bekannte Befund ist damit weiterhin reproduzierbar. Ursache oder Behebung sind durch diesen Test nicht nachgewiesen. Eine erneute Supportanfrage wurde nicht versendet.

Auch der bekannte Cachebefund bleibt unverändert:

- HTML liefert `no-cache, no-store, must-revalidate` sowie zusätzlich `max-age=0`. Die verlangte No-Store-Anweisung ist vorhanden.
- JS und CSS liefern `public, max-age=31536000, immutable` sowie nochmals `max-age=31536000`. Es fehlen weder `immutable` noch die vorgesehene Lebensdauer. Die doppelte Altersangabe bleibt eine dokumentierte Abweichung vom konservativen Prüfvertrag.

Dies ist eine erneute Prüfung des bestehenden P-Stands, keine bereits durchgeführte Prüfung des noch nicht installierten MVP 0.5. Die Rohantworten und die ausführbare Diagnose sind in der privaten Deploymentablage gesichert.

## 3. Begrenzte Risikoakzeptanz

**Risikoverantwortlicher und Entscheider: David Steimer.** Die im Auftrag ausdrücklich für den negativen Wiederholungstest vorgesehene Risikoakzeptanz wird hiermit auf den tatsächlich unveränderten Befund angewendet.

Akzeptiert wird für die kontrollierte MVP-0.5-Bereitstellung ausschliesslich die bekannte fehlende Auslieferung dieser fünf Schutzheader bei den bezeichneten GET-Ressourcentypen sowie die bereits dokumentierte gleichlautende doppelte Cache-Altersangabe. Eine neue Abweichung, widersprüchliche Cacheanweisung, unsichere Weiterleitung, veränderte Datei oder fachliche Fehlberechnung ist nicht umfasst.

Die Folge ist ein vermindertes Mass zusätzlicher Browserabsicherung. Insbesondere fehlen die vom Produkt vorgesehenen Beschränkungen für Skript-/Verbindungsquellen und Einbettung sowie die übrigen genannten Schutzanweisungen in den betroffenen Antworten. Das unveränderte statische, lokal rechnende Betriebsmodell mit HTTPS und ohne anwendungsseitige Laufzeitdienste begrenzt den Umfang, ersetzt diese Schutzschichten aber nicht. Der Test ist weder ein Angriffstest noch ein Nachweis, dass eine konkrete ausnutzbare Schwachstelle oder ein Datenabfluss vorliegt oder ausgeschlossen ist.

Für die öffentliche Prüfmatrix gilt:

- **D04: Abweichung mit dokumentierter Risikoakzeptanz**, ausdrücklich nicht bestanden.
- **D05: HTML-No-Store vorhanden. Asset-Cachevorgabe vorhanden, doppelte gleichlautende Altersangabe als akzeptierte Restabweichung.**
- Alle übrigen Prüfungen, aktuelle Sicherung, Wiederherstellbarkeit, Bytevergleich und fachliche Browserkontrolle bleiben erforderlich.
- Nach der MVP-0.5-Umschaltung werden die tatsächlichen neuen Ressourcen erneut geprüft. Neue oder weitergehende Befunde lösen weiterhin einen Halt beziehungsweise Rückfall aus.
- Nach einer konkreten Supportantwort oder vorgeschlagenen Korrektur und spätestens vor dem nächsten P-Release ist dieser Risikostatus erneut zu beurteilen. Eine tatsächliche Hostingänderung benötigt weiterhin einen eigenen Auftrag. Es wurde keine automatische Überwachung eingerichtet.

## 4. Kandidatenbindung und Quellcodezugang

Die parallele lokale Vorprüfung bestätigt den unveränderten Kandidaten:

| Gegenstand | Bindung |
| --- | --- |
| Webarchiv | `fristenrechner-mvp05-steimer-web.zip` |
| Grösse | 484’549 Bytes |
| SHA-256 | `be2d81b9a0730ebad9fb3b47a37923f2c0c0aaa2c58c57422dc6b0f53e5a1fa8` |
| Inhalt | Zwölf Dateien, einschliesslich `.htaccess` und Bibliothekslizenzen |
| App und Daten | `0.5.0` / `2026-09-28-mvp-05-approved.1` |
| Lokaler Datenpin | `3109c39730f10d31cb6c57200b36dd5091d7bcd1` |

Die unabhängige Archivprüfung bestätigt drei Auslieferungsartefakte, elf Mirrordateien, zwölf Webdateien und zehn Baubelege. Der zuvor abgeschlossene 388-Dateien-Snapshot validiert unverändert. Kein Neubau wurde ausgeführt.

P enthält seine Fachdaten und Bibliotheken lokal und benötigt den GitHub-Pin nicht zur Laufzeit. **Technisch wäre P vor GitHub möglich.** Der sichtbare Quellcodeverweis im unveränderten Webbuild führt jedoch ausschliesslich zum GitHub-Repository. Die frische öffentliche Abfrage von `refs/heads/main` bestätigt weiterhin `065781f17b6f83e1e51c9af96d89bb699cb4b933`, den bisherigen MVP-0.4-Stand. Das Webarchiv enthält keinen vollständigen MVP-0.5-Quellcode.

Für das beschlossene versionstreue Open-Source-Angebot soll der passende Quellstand spätestens zusammen mit P zugänglich sein. Eine P-Veröffentlichung mit einem nur auf MVP 0.4 zeigenden Quellcodeangebot ist nicht durch die Header-Risikoakzeptanz abgedeckt. Empfohlen wird deshalb die bereits vorbereitete GitHub-Publikation unmittelbar vor P. Alternativ wäre ein vollständiger Quellcode-Download mit sichtbarem Verweis nötig, was zusätzliche Artefaktänderungen auslösen würde.

## 5. Tatsächlicher Vollzug und nächster Schritt

Ausgeführt sind die öffentliche lesende Headerdiagnose, die lesende GitHub-Standkontrolle, die lokale Artefaktprüfung und dieser Nachtrag. **Kein Hostingupload, keine neue Hostsicherung, keine produktive Umschaltung, kein GitHub-Push und keine Änderung an E/Q.** Bestehende Backups wurden weder überschrieben noch gelöscht.

Der nächste erforderliche Entscheid ist die Veröffentlichung des vorbereiteten MVP-0.5-Quellstands auf GitHub. Ein allenfalls erforderlicher temporärer Deploy-Key ist separat zu autorisieren. Danach kann die bereits beauftragte P-Bereitstellung mit frischer Sicherung, kontrollierter temporärer Vorprüfung, Umschaltung und der öffentlichen D01–D12-/MVP-0.5-Matrix fortgesetzt werden. Rootseite und Sitemap bleiben ohne konkreten Änderungsbedarf unverändert. Der Headerbefund allein hält diesen Ablauf aufgrund des neuen Entscheids nicht mehr an.
