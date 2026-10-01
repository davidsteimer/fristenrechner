# MVP 0.6 · Lokales Publikationspaket

Stand: 1. Oktober 2026. **Lokale Publikationsvorbereitung abgeschlossen. Keine Veröffentlichung, kein Deploy-Key und keine Änderung an steimer.ch-P.** Die Freigabe dieses Schritts folgt auf Davids Q-Abnahme, bestätigte Gastanmeldung und ausdrücklich entschiedene Wiederverwendung der Outlook-Importnachweise.

## Gebundener Umfang

AP20 ergänzt EOG, FamZG, FLG, MVG und ÜLG. 44 nationale Regeln und 50 bernische Anbindungen bleiben auf die abgenommenen Sachverhalte begrenzt. Die Quellen-, Daten- und Fachfreigaben werden nicht erweitert. E/Q verwendet das geprüfte Korrekturpaket `0.6.0.1`. Der letzte dokumentierte öffentliche Stand bleibt MVP 0.5.

Die [Dateibindung](../../outputs/publication-mvp06-final-2026-10-01/publication-package.json) nennt 736 ausdrücklich vorgesehene neue, geänderte oder zusätzlich gebundene öffentliche Dateien mit Bytezahl und SHA-256. Darin sind die elf Laufzeitdateien des lokalen Datencommits `19b37336974f3ba7c72333763e1272425239b8cd` enthalten. Die Inventardatei selbst kommt als gesonderte 737. Datei dazu und nimmt sich aus, um keine zirkuläre Prüfsumme zu erzeugen. Kein pauschales `git add .`. Staging, Produktcommit und Push sind noch nicht erfolgt.

| Artefakt | Identität |
| --- | --- |
| Geprüftes SPFx-Paket `0.6.0.1` | SHA-256 `60f84213507f99ec58463c84c514037d9c00bd63fdc8f02d85e52097bcf3c587`, unverändert |
| Datenrelease | `2026-10-01-mvp-06-approved.1`, Manifest SHA-256 `637cfc03c777f350031ba6c28676c685c16f25733391e1f25b0a3580016f5724`, unverändert |
| Korrigiertes Webarchiv | [`fristenrechner-mvp06-steimer-web-corrected-0601.zip`](../../outputs/release-mvp06-web-corrected-2026-10-01/artifacts/fristenrechner-mvp06-steimer-web-corrected-0601.zip), 499’306 Bytes, SHA-256 `37e949e0442365a86b5b4e90e25a5a4ef9d8209a31644f3de119f2862b9d3810` |
| Web-Baunachweis | [`artifact-verification.json`](../../outputs/release-mvp06-web-corrected-2026-10-01/artifact-verification.json), SHA-256 `93f6c7e3fa5837b6048c69a7d263b4e0b05bebf1ce1b1eeb2e1ed99a51ef9248` |

Das ursprüngliche MVP-0.6-Webarchiv enthält die Lesbarkeitskorrektur noch nicht und ist deshalb **nicht der P-Auslieferungskandidat**. Es bleibt als historischer Baunachweis byteidentisch erhalten. Der neue Webbau verwendet 84 gebundene Eingaben aus dem angenommenen SPFx-Korrekturstand und dem unveränderten öffentlichen Wrapper. Beide Builds und die ZIP-Wiederholung sind byteidentisch. Daten, Anbieterbibliotheken, Lizenztexte, Favicon und `.htaccess` bleiben unverändert.

## P06-01 · Öffentliche Prüfung und privater Vollaudit

Der öffentliche Prüfumfang und der private Vollquellenaudit sind ausdrücklich getrennt. Es gibt keine automatische Auslassung, wenn Dateien fehlen. Nur fünf namentlich festgelegte Suiten für Quellenrohbelege, Übernahme und Vorbereitung laufen im privaten Umfang. Der öffentliche Integritätschecker bindet die exakten Freigabe- und Manifestbytes sowie alle **63 öffentlichen direkten Freigabebelege**. **107 private direkte Belege bleiben in der Freigabe gebunden, werden im öffentlichen Lauf aber nicht erneut gelesen.** Diese Reichweite wird maschinenlesbar ausgewiesen.

Öffentlicher Produkt- und Governance-Prüfumfang nach Einrichtung der in den IT-Unterlagen bezeichneten Node-/Python-Abhängigkeiten:

```sh
npm run check
npm run test:source-reviews
npm run test:data:mvp06
npm run test:artifacts:mvp06
.venv/bin/python scripts/prepare_mvp06_web_correction.py --check --public-readback
```

Der öffentliche Web-Readback prüft Archiv, ausgelieferte Dateien und gebundene öffentliche Eingaben. Er behauptet keine erneute Abfrage lokaler Gitobjekte oder Prüfung ausgeschlossener historischer Arbeitslogs. Der normale lokale Build und seine strenge Prüfung behalten diese zusätzlichen Kontrollen.

Der unveränderte strenge Quellenverifier und die Übernahmeschranken bleiben massgebend. Ein öffentlicher Integritätslauf kann keine Datenpromotion oder neue Quellenfreigabe auslösen. Der private Vollbefehl ist:

```sh
npm run test:source-reviews:private:mvp06
```

Fehlende private Belege führen dort weiterhin zum Fehler. Der unabhängige Pythonvalidator bleibt ohne ausdrücklich gewählten öffentlichen Modus streng. Die Prüfung des lokalen Git-Datenpins bleibt mit `npm run test:artifacts:git:mvp06` als gesonderter Test erhalten. Dieser verlangt das tatsächliche Repository und akzeptiert kein übergeordnetes Gitverzeichnis. Öffentliche Nachprüfbarkeit ist keine Behauptung einer erneuten vollständigen Quellenprüfung.

## Publikationsschutz

Ausgeschlossen bleiben `.work/` einschliesslich gleichnamiger verschachtelter Ordner, `Userinput/`, Arbeitskopien, Zugangsdaten, private Websitebackups und die vorbestehende Benutzeränderung am historischen Word-Projektplan V1.0. Die drei ZIP-Backups im Repository-Stamm und dieser Wordplan wurden nicht verändert. Neun konkret geprüfte und bereinigte Buildlogs werden ausdrücklich aufgenommen, nicht pauschal alle Logdateien. Relative private Evidenzverweise in historischen Berichten veröffentlichen nicht deren Zielinhalte.

Der gezielte Textmustercheck fand keine konkreten Zugangsschlüssel, privaten Kontoadressen, tatsächlichen Tenantadressen oder persönlichen absoluten Benutzerpfade. Die gefundenen Redaktionsregex und `example.sharepoint.com` sind Vorlagen, keine geheimen Werte. Fünf ZIP-/SPPkg-Archive enthalten keine privaten Entwicklungsordner, Schlüssel oder Source Maps in ihren Mitgliedsnamen. Keine umfassende Sicherheitsanalyse oder Garantie gegen beliebige codierte Binärinhalte.

Die acht neu hinzugekommenen amtlichen PDFs wurden technisch über 296 Seiten und 81’200 Objekte sowie visuell an allen acht ersten Seiten geprüft. Keine erkannten Skripte, Anhänge, Formulare oder persönlichen Kommentare. Die Öffnungsaktionen sind reine Seitenpositionen, die Linkannotationen amtliche Verweise und Normanker. Originalbytes bleiben erhalten. Keine neue Rechtsprüfung oder visuelle Vollprüfung aller Seiten. Der private Prüfbericht ist mit SHA-256 `c09185c8ca3965f4f90ed4cd5cf82aaf504666bdded6659d3405c1ce7bfd5415` gebunden. Ein technisches Restrisiko bei Binärdateien bleibt.

**Git-Metadaten sind ein eigener Punkt:** Der bereits lokale Datencommit enthält die bestehende Autor-/Committerkennung mit lokaler Geräte-E-Mail. Ein Push macht diese Kennung öffentlich. Sie wurde nicht stillschweigend umgeschrieben. Die spätere konkrete Pushfreigabe muss Dateiinhalte und Git-Metadaten umfassen.

## Tatsächliche lokale Prüfungen

Der [zusammenfassende Prüfnachweis](../../outputs/publication-mvp06-final-2026-10-01/preflight-verification.json) trennt Läufe im Arbeitsbaum, den bereinigten Dateiexport und die lokale Browserstichprobe. Testgruppen überschneiden sich und werden nicht zu einer künstlichen Gesamttestzahl addiert.

- Im lokalen Arbeitsbaum: 2039 Produkt-/UI-Tests, 147 Node- und 30 Python-Governance-Tests bestanden. Der Governancevalidator enthält zusätzlich acht Negativtests.
- Privater Quellen-Vollaudit: 170 direkte Belege frisch geprüft, 101 Tests und unabhängiger strenger Python-Datenvalidator bestanden.
- Öffentlicher Integritätschecker: acht Tests, darunter Manipulations- und Portabilitätsfälle. Der neue Webkandidat besteht zwölf bestehende Public-Buildtests. Die ergänzenden Webartefakttests enthalten ausdrücklich Negativfälle.
- Der saubere Dateiexport mit 1697 Dateien enthält keine privaten Quellenrohbelege und keine Gitmetadaten. Alle sechs Prüfschritte sind bestanden: Typprüfung, 2039 Produkt-/UI- und zwölf Public-Buildtests sowie beide Builds, 30 Python- und 147 Node-Governanceprüfungen, öffentliche Datenprüfung, 27 Artefakttests, öffentlicher Web-Readback und elf zusätzliche Web-Artefakt-/Negativtests. Keine übersprungenen oder abgebrochenen Tests. Abhängigkeiten werden aus der vorhandenen lokalen Toolchain bereitgestellt. Das ist kein frischer GitHub-Clone und keine neue Installation mit `npm ci`.
- Im tatsächlichen neuen Webbaum: deutsche und französische ÜLG-Stichprobe mit Zustellung am 16.09.2026 und 30 Tagen ergibt 16.10.2026. Die langen französischen Feiertagsauswahlen sind bei 848 Pixeln in geöffnetem und ausgewähltem Zustand lesbar. Bei 390 Pixeln bleibt die Darstellung ohne horizontales Seitenüberlaufen. Keine erfassten Browserwarnungen oder -fehler im Prüftab. Temporäre Ansicht und Server anschliessend geschlossen.

Die Browserstichprobe ist lokal und begrenzt. Sie ist weder die öffentliche P-Prüfmatrix noch ein neuer Kalenderdownload, Outlookimport, Gastlauf oder Test der Green-Header. Der native Datumswert wurde nach einem nicht übernommenen Automations-Füllversuch über die tatsächliche native Eingabeschnittstelle gesetzt und das Resultat sichtbar geprüft.

Ein erster bereinigter Export legte noch Git-abhängige Artefaktprüfungen offen. Diese sind jetzt ausdrücklich vom öffentlichen Hash-/Bytevergleich getrennt. Der Git-Audit ist im tatsächlichen Repository mit 1/1 bestanden. Ein vollständig neuer Dateiexport bestätigt den öffentlichen Umfang. Die ursprünglichen Fehlprotokolle bleiben erhalten. Spätere Abschlussänderungen betreffen ausschliesslich Dokumentation, Inventar und Nachweisdateien, nicht die geprüften Produktquellen.

Die endgültige Dateibindung kann ohne Schreiboperation erneut geprüft werden:

```sh
node scripts/verify-mvp06-publication.mjs
```

Die ursprüngliche E-/Q-Matrix mit 284 bestandenen, zwei fehlgeschlagenen und drei nicht ausgeführten Zeilen bleibt unverändert. Der gesonderte Korrektur- und Q-Abschluss schliesst die betreffenden Punkte ab, ohne historische Testergebnisse umzuschreiben.

Der letzte Readback bestätigt keine Abweichung der Produkt-, Daten-, Schema-, Script- und Testdateien vom erfolgreich geprüften Export. Die lokalen Dateiziele der lebenden Einstiegstexte und IT-Unterlagen bestehen. Der abschliessende konkrete Textmustercheck und `git diff --check` sind ohne Befund. Das Inventar ist vollständig rückgelesen.

## Nächste getrennte Schritte

1. Konkrete GitHub-Publikation des gebundenen Umfangs freigeben. Inventar unmittelbar vor Staging erneut prüfen, Datencommit erhalten und nur die aufgelisteten Dateien übernehmen. Ein etwaiger neuer temporärer Deploy-Key benötigt eigene konkrete Autorisierung und wird nach verifiziertem Push wieder entfernt.
2. Öffentliche Daten- und Artefaktbytes nach Push prüfen. Ein Git-Push erzeugt nicht automatisch Release-Anhänge oder eine P-Umschaltung.
3. P gesondert freigeben. Frischen Ausgangsstand sichern, tatsächliche HEAD-/GET-Header prüfen und gegebenenfalls erneute begrenzte Risikoakzeptanz vorlegen. Die frühere MVP-0.5-Entscheidung gilt nicht automatisch für MVP 0.6. Anschliessend temporäre Vorprüfung, Umschaltung und öffentliche Matrix D01–D12 einschliesslich direkter Storage-Kontrolle.

Keine pauschalen Hostingänderungen, kein zusätzlicher Gastkreis und keine neuen Kantonsfreigaben. [Releasehinweise](release-notes-mvp06.md), [Deploymentplan](deployment-mvp-06.md) und [IT-Anleitung](installation-und-betrieb-dritttenants.md) bleiben die nächsten Einstiegspunkte.
