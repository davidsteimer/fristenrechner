# AP18: private Originale und bereinigte Publikationskopien

Stand: 22. September 2026. Beschlossene und lokal umgesetzte Publikationsbereinigung, keine Veröffentlichungsfreigabe.

## Beschluss und Grenze

David Steimer hat zur [Publikationsvorprüfung](../betrieb/publikationsvorpruefung-mvp04.md) entschieden:

> P01: Variante 2
>
> P02: gezielte Aktualisierung der lebenden Einstiegstexte und IT-Unterlagen auf MVP 0.4.

Für P01 bedeutet dies: Die vier historischen Original-/Archivdateien V0.9 und V0.10 bleiben unverändert privat erhalten. Statt sie samt lokalem Speicherpfad zu veröffentlichen, werden zwei klar benannte Publikationskopien bereitgestellt, eine je unterschiedlichem Binärstand. Eine zweite öffentliche Kopie derselben Bytes ist nicht erforderlich.

Die [Archivbestätigung](archivbestaetigung-ap18.md), ihr ursprüngliches [Manifest](../../outputs/archiv/ap18/2026-09-22/manifest.json), die ursprünglichen Diagnosen und die Fachabnahmen bleiben unverändert. Die frühere Abweichung von den historischen V0.9-/V0.10-Prüfsummen wird durch die Bereinigung weder behoben noch umgedeutet. Die fachlich massgebende V0.12, der Datenrelease, das Releasepaket und sämtliche Rechtsregeln bleiben unverändert.

## Öffentliche Kopien und Herkunft

| Version | Privater beobachteter Bestand, SHA-256 | Öffentliche Publikationskopie, SHA-256 |
| --- | --- | --- |
| V0.9 | `7663aacdca75d66c565ca6c049c9958dafad792ec46ec0d0515b4cb1505e8453` | `9207ed6727d964568d6992590df4d088d9ad4d39542d1a900246bad861a929dd` |
| V0.10 | `57b3c3c668bb00360cf94da159a29509116691f9282419ebc7a87cdf8b88b619` | `8161f25967af33e396970ba8b20edd74fd8d7f5ec00022f14448ad79de251df4` |

- [Publikationskopie V0.9](../../outputs/archiv/ap18/2026-09-22/publikationskopien/2026-09-13_Feiertagsmatrix_Schweiz_AP18B-03_VS_FR_SO_GE_V0.9_Publikationskopie.xlsx), 140'034 Bytes
- [Publikationskopie V0.10](../../outputs/archiv/ap18/2026-09-22/publikationskopien/2026-09-13_Feiertagsmatrix_Schweiz_AP18B-04_Restkantone_V0.10_Publikationskopie.xlsx), 288'034 Bytes
- [Separates Publikationsmanifest mit Komponentenvergleich](../../outputs/archiv/ap18/2026-09-22/publication-manifest.json), SHA-256 `9ff1bfff327b28e2f709d4b9be879ae8aadd49c0dc10d72ebe301dcd91741c01`

Der gesamte Pfadwert wurde weder in den neuen Nachweisen noch in den Testdaten wiederholt. Der bereits öffentliche Projektverantwortliche David Steimer bleibt als Bearbeitername erhalten. Die Bereinigung ist kein neuer inhaltlicher Arbeitsmappenstand und keine Ersetzung der damaligen Originaldatei durch eine angeblich byteidentische Fassung.

## Exaktes Änderungsdelta

Geändert wird ausschliesslich der unkomprimierte ZIP-Bestandteil `xl/workbook.xml`. Darin wird der Knoten `x15ac:absPath` einschliesslich seiner sonst leeren `mc:Choice`-/`mc:AlternateContent`-Umhüllung entfernt. Diese Umhüllung enthielt ausschliesslich die lokale Pfadangabe. Andere Inhalte innerhalb einer solchen Umhüllung würden zum Abbruch führen.

Die Änderung erfolgt durch Entfernen dieses einzelnen Byteabschnitts, ohne den übrigen XML-Text neu zu serialisieren. Sämtliche anderen unkomprimierten ZIP-Komponenten bleiben byteidentisch. Dazu gehören alle Tabellen, Zellen, Formeln, gespeicherten Formelresultate, Formatierungen, Filter, Datenvalidierungen, Beziehungen und Quellenlinks. Die verbleibende Workbook-XML-Struktur wird zusätzlich semantisch verglichen. Das ZIP-Paket wird neu verpackt und erhält deshalb eine eigene Gesamtprüfsumme. Es gibt kein erneutes Speichern oder Neuberechnen durch Excel oder eine Tabellenbibliothek.

Die Originaldateien wurden vor und nach der Ableitung anhand ihrer vollständigen SHA-256-Prüfsummen kontrolliert. Bereits vorhandene abweichende Zieldateien werden nicht überschrieben. Die Ableitung ist lokal mit `python3 scripts/ap18_publication_workbooks.py prepare` wiederholbar, sofern die privaten Originale vorhanden sind.

## Öffentliche und private Prüfung getrennt

`npm run test:archive:ap18` prüft das unveränderte historische Manifest, das gepinnte Publikationsmanifest, beide bereinigten Kopien sowie die unveränderten Referenzen V0.11 und V0.12. Für V0.9 und V0.10 bestätigt die öffentliche Prüfung ausdrücklich **nicht** die private Originaldatei und **nicht** die Wiederherstellung der historischen Byteidentität.

`npm run test:publication:ap18` prüft zusätzlich die ZIP-Komponenten und die eng begrenzte Ableitung mit positiven und negativen Testfällen. Dieser Lauf benötigt die privaten Originale nicht.

Die ergänzenden lokalen Prüfungen `node scripts/ap18-workbook-archive.mjs --check-private` und `python3 scripts/ap18_publication_workbooks.py check-private` verlangen die privaten Dateien und brechen bei Fehlen oder Abweichung ab. Die Python-Prüfung leitet die Publikationskopien erneut aus den Originalbytes ab. Ein öffentliches Repository kann die privaten Bytes nicht selbst nachprüfen. Diese Grenze wird nicht durch einen grünen öffentlichen Test verdeckt.

Die privaten Quelldateien, ihre beobachteten Archivkopien, `Userinput/`, Office-Sperrdateien und Arbeitskopien sind durch Git-Ausschlüsse vor unbeabsichtigtem normalem Staging geschützt. Ein erzwungenes Hinzufügen würde diesen Schutz umgehen. Deshalb bleibt die explizite Dateiliste Bestandteil jeder Veröffentlichung.

## Historische Verweise

Vier eingefrorene historische Berichte verweisen weiterhin auf die damaligen V0.9-/V0.10-Originalpfade: die Abnahme AP18B-03, die Erfassungsberichte AP18B-03/AP18B-04 und der QA-Nachweis AP18B-03-V0.9. Hinzu kommt der Verweis auf die ausdrücklich lokale, veränderliche Arbeitskopie in der Archivbestätigung. Diese fünf Ziele sind bewusst kein öffentlicher Download. Ihre historischen Aussagen und Prüfsummen werden nicht nachträglich auf die bereinigten Dateien umgeschrieben. Für öffentliche Leserinnen und Leser sind die oben ausdrücklich als Publikationskopien bezeichneten Dateien und dieser Nachtrag massgebend. Die gezielte Linkprüfung führt diese fünf Verweise als begründete historische beziehungsweise lokale Ausnahmen, nicht als regulär funktionierende öffentliche Links.

## Kein neuer Datenrelease

AP18C liest unverändert ausschliesslich die eingefrorene V0.12. Diese Publikationsbereinigung verändert weder die 479 Katalogregeln noch die operative CH-/BE-Projektion. Manifest-, Daten- und Paketprüfsummen für MVP 0.4 bleiben deshalb unverändert. Auch die ausdrücklich abgenommene Behandlung des AI-Quellenkonflikts bleibt bestehen.
