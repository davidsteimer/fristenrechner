# R08-C Ausgangssicherung vor MVP 0.8

Stand: 16. Oktober 2026. **C01 bestanden, noch kein Upload und keine Installation.** David Steimer hat R08C-U01, R08C-H01 und R08C-I01 [gemäss der gebundenen Vorlage freigegeben](freigabe-r08-c.md). Der nächste Schritt ist C02, der manuelle Mirrorupload durch David.

## Frisch bestätigter Ausgangsbestand

| Gegenstand | Ergebnis |
| --- | --- |
| Gemeinsamer App-Katalog | Bestehende Datei `fristenrechner-schweiz.sppkg`, Version `0.7.0.2`, gültig, aktiviert und bereitgestellt. Keine automatische Installation auf zusätzlichen Sites |
| Vier bestehende E-/Q-Apps | Identitäten eindeutig bestätigt, alle `0.7.0.2`, keine Fehler und kein ausstehendes Upgrade |
| Paket und Hauptbundle | Frisch heruntergeladen und bytegenau mit den gebundenen SHA-256-Prüfsummen verglichen. 291’895 beziehungsweise 1’138’892 Bytes |
| Vier aktuelle Rechnerkonfigurationen | Vollständige Canvas-Inhalte und Eigenschaften gesichert. Eigene Format-7-Mirrors `2026-10-08-mvp-07-approved.1`, keine Eigenschaftsabweichung |
| Aktuelle SharePoint-Seiten | E-SP veröffentlicht `9.0`, Q-SP veröffentlicht `7.0`, keine offenen Checkouts |
| Aktuelle Teamsregisterkarten | Namen, Tabidentitäten, Team-/Kanalzuordnungen und tatsächliche Iframe-Ziele frisch bestätigt. Beide gebundenen Listenitems unverändert `1.0` |
| Historische AP5-Ansicht | Eigener alter GitHub-Pin und Datenrelease unverändert. Historischer Entwurf `1.2` bleibt unangetastet. Aktueller Teamsalias zeigt weiterhin auf dieselbe Seite |
| Relevante Berechtigungen | Zehn vollständige Berechtigungssätze für Katalogdatei, Paketassets, vier Mirror-Elternordner und vier Rückfallordner entsprechen den historischen Nachweisen. Kein Schreibzugriff auf Berechtigungen erfolgt |
| Seiten-/Itemvererbung | Alle fünf gebundenen Inhalte erben ihre Rechte. Dies ist keine tenantweite oder vollständige effektive Site-Berechtigungsprüfung |
| Neue Mirrorziele | Der neue Releaseordner fehlt noch in allen vier vollständig gelesenen Elternordnerlisten. Bestehende Rückfallordner sind vorhanden |

Die lokale Wiederholungsprüfung umfasst **26 bestandene Prüfgruppen**. Das private Inventar bindet 44 Sicherungsdateien mit SHA-256. [Bereinigter maschinenlesbarer C01-Nachweis](../../outputs/release-mvp08-2026-10-15/r08c/c01-baseline-2026-10-16.json), SHA-256 `1cb12b4789686bb76a8a1988478cda01ec7b49d97bc4e00e09821f7f2c5a3401`.

## Sicherungsform und Grenzen

Die private Ausgangssicherung liegt unter `.work/deployments/2026-10-16-eq-mvp08/ausgangssicherung/`. Paket und Hauptbundle sind echte heruntergeladene Rohdateien. Die modernen Seiten und Teamsitems wurden mit vollständigen dekodierten Eigenschaften und Canvas-Inhalten aus der lesend dargestellten REST-Antwort gesichert. Das ist **keine ASPX-Rohdateisicherung**. Die Teamsbelege stammen aus sichtbaren Tab- und Iframe-Attributen sowie den exakten Kanalantworten. Weitere Dateien im Paketassetordner sind als Metadaten inventarisiert, nicht einzeln als frische Rohdownloads.

Die ersten reduzierten Berechtigungsantworten der Elternordner bleiben als Zwischenbelege erhalten. Der abschliessende Vergleich verwendet die vollständig nachgeladenen Antworten zu den exakten Drive-/Itemidentitäten. Nur Objektreihenfolge, Reihenfolge nach Permission-ID und die technisch gleichwertige Darstellung `inherited_from: null` beziehungsweise `{}` wurden normalisiert. Alle weiteren Permissionfelder stimmen überein.

**C01 ersetzt C03 nicht.** Die vier alten Mirrors wurden heute hinsichtlich Identität, Elternzuordnung und Rechten geprüft. Ihre 164 Datei-Rohinhalte werden zusammen mit den 168 neuen Rohinhalten nach dem manuellen Upload vollständig zurückgelesen. Bis dieser Abgleich bestanden ist, darf kein Katalogwechsel erfolgen. Ebenso ist C01 kein bestandener Host-, Geräte-, Gast- oder Q-Abnahmetest.

## Nächster Schritt

Der vorbereitete private Uploadordner unter `.work/deployments/2026-10-16-eq-mvp08/manueller-upload/2026-10-15-mvp-08-approved.1/` enthält die 42 unveränderten Dateien aus dem freigegebenen Mirror-ZIP. Pfade, Grössen und SHA-256 wurden nach dem Entpacken gegen das gebundene Inventar geprüft. Dies ist kein neuer Build.

David lädt den ganzen Releaseordner jeweils in den bestehenden privaten Zielanhang-Elternordner hoch. Die Anleitung `Mirrorupload.md` im privaten Deploymentordner enthält die vier direkten Zielverweise. Keine bestehende Datei ersetzen, keine zusätzliche Verschachtelung und keine Rechteänderung. Bei einem zwischenzeitlich vorhandenen neuen Zielordner oder einer Ersetzungsfrage anhalten.

Nach der Meldung «Mirrors hochgeladen» folgt C03. Erst danach und nach erneuter unmittelbarer Bestätigung des Iststands folgen der freigegebene Katalogwechsel, E und das E-Gate, anschliessend Q.

## Unverändert

Die ursprüngliche Proposal-Datei, die drei gebundenen Betriebsdokumente, alle R08-B-Artefakte und die private Zielbindung bleiben unverändert. Der Freigabeentscheid und diese frischen Beobachtungen sind separat dokumentiert. Keine Uploads, App-/Konfigurationsänderungen, zusätzlichen Builds oder Commits. AP5, AP21/E05, Berechtigungen, Richtlinien, GitHub und P wurden nicht verändert. Der lokale HEAD bleibt `10a99419eaabb3e96d2acccf0c7a93e2fe6472cb`, der Index ist leer. Reale Geräte-/Gastprüfung und manuelle Q-Abnahme bleiben bei David.

