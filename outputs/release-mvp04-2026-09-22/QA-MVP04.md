# MVP 0.4: lokaler Releaseprüfnachweis

Stand: 22. September 2026. Technische lokale Vorbereitung, keine Veröffentlichung, Installation oder Betriebsfreigabe.

## Ausgangspunkt und Ergebnis

David Steimer hat AP18C abgenommen und den Release gestartet. Der Release bündelt die abgenommene qualifizierte VRPG-Integration AP17 mit der Schweizer Feiertagsgrundlage AP18. Der vollständige erneute Quellenabgleich ist ausdrücklich beauftragt, einschliesslich der 82 zusätzlichen nicht operativ verwendeten Katalogquellen.

- Produkt `0.4.0`, SPFx `0.4.0.0`, Datenrelease `2026-09-22-mvp-04-approved.1`.
- Lokaler Datencommit `739876a0d11b550ea8cc702622ab22af321994a5`, noch nicht veröffentlicht.
- Kalenderkomponente `2.0.0`, Spezialkatalog `3.0.0`, Feiertagskatalog `1.0.0`, Manifest-/Consumerformat `4.0.0`.
- 479 Katalogregeln erhalten. Operativ bleiben die zwölf bisherigen CH-/BE-Feiertagsregeln und die abgenommenen Fachpfade massgebend.
- Historische Kandidaten, Referenzarbeitsmappe und ursprüngliches Quellenprüfereignis unverändert.

## Ausgeführte technische Prüfungen

| Prüfung | Ergebnis |
| --- | --- |
| TypeScript-Typprüfung, UI- und öffentlicher Build | Bestanden |
| Kern- und UI-Tests | 675 bestanden |
| Öffentlicher Build und Auslieferungsvertrag | 7 bestanden |
| Kalender-/Arbeitsmappen-/Import-/Promotionsmodelle | 484 bestanden, darin 15 neue Promotionsprüfungen |
| Referenzarchiv | 10 bestanden, historische V0.9-/V0.10-Varianz bleibt dokumentiert |
| Python-Katalog- und Altconsumerverträge | 31 bestanden |
| Neuer Datenrelease | Schema, Hashes, Referenzen und 19 Negativprüfungen bestanden |
| SPFx-Tests | 48 bestanden |
| SPFx-Produktionsbuild | Bestanden, inklusive finalem Bundle-CSS-Audit und Paketprüfung |
| Portables SPPKG, Mirror- und Webarchiv | 27 Prüfungen bestanden |
| Quellenregister und Ereignisse | 42 Quellen, zwei Ereignisse, acht Negativprüfungen bestanden |
| Registerevolution | 17 Prüfungen bestanden, Initialereignis byteidentisch |
| Vollständigkeitsprüfung der Quellenberichte | 17 synthetische Tests bestanden, keine fachliche Quellenprüfung durch diese Tests |
| Dokumentierte menschliche Quellenabnahme | 20 zusätzliche Tests bestanden. Genauer Entscheidtext, 13 gebundene Evidenzdateien, begrenzter Metadatenwechsel und schreibfreie Wiederholung geprüft |
| Browserprüfung des tatsächlichen öffentlichen Builds | 21 Fälle bestanden, DE/FR bei 1024/736/360 Pixeln |

Die Testgruppen überschneiden sich teilweise. Die Zahlen sind deshalb kein kumulierter, überschneidungsfreier Gesamtwert.

Der erste Browserlauf hatte eine veraltete Testannahme, die weiterhin ein Kandidatenbanner verlangte. Der Prüfharness wurde für eine ausdrücklich vorgegebene freigegebene Release-ID angepasst. Der anschliessende vollständige Lauf ist bestanden. Dies war kein Rechenfehler.

## Browser und Sichtprüfung

Die Prüfung verwendet den tatsächlich gebauten statischen Webbestand unter `http://127.0.0.1:8795/fristenrechner/`, nicht lediglich React-Komponententests. [Maschinenlesbare Ergebnisse](ui/results.json) enthalten 21 Fälle ohne Browserfehler, externe Requests, horizontalen Überlauf oder abgeschnittene Modellwerte. Drei gespeicherte Ansichten wurden zusätzlich visuell geöffnet:

- [DE Desktop, ATSG-Nachfrist](ui/C03-correction-suspension.png)
- [FR Mobil, Jahreswechsel](ui/C14-social-mobile-fr.png)
- [FR Tablet, politische Rechte](ui/C19-federal-fixed-fr-tablet.png)

Bestätigt sind der neue sichtbare Datenstand, die Entfernung der eigentlichen Kandidatenwarnung im Releasepfad, unveränderte Sperren, feste Einwertfelder, echte Auswahlfelder, DE/FR und das zweispaltige Raster mit mobilem Umbruch. Synthetische Prüfdaten enthalten keine realen Fälle.

## Integrität und Reproduzierbarkeit

[Datenpromotion](data-promotion.json) und [Artefaktprüfung](artifact-verification.json) sind maschinenlesbar dokumentiert. Acht der neun Nutzartefakte sind byteidentisch zum AP18C-Kandidaten. Im Spezialkatalog wurden ausschliesslich die obersten Abnahme- und Geltungsmetadaten hochgestuft, nicht die Fachregeln oder Quellenprüfdaten. Der neue Datenrelease liegt in einem eigenen Ordner.

Die drei portablen Artefakte wurden nach dem Verpacken erneut gelesen, mit dem Datencommit beziehungsweise Webbestand verglichen und gehasht. Die endgültigen Hashes sind im [Release- und Deploymentplan](../../docs/betrieb/deployment-mvp-04.md) festgehalten. Das bisherige SPPKG `0.3.0.0` ist lokal für den Rückfall gesichert.

Der Default-GitHub-Pin zeigt bereits auf den tatsächlichen lokalen Datencommit. Er ist vor dessen Veröffentlichung kein funktionierender öffentlicher Datenendpunkt. Eine bloss lokale Buildprüfung wird nicht als erfolgreicher GitHub-Abruf gewertet.

## Quellenprüfung und verbleibende Freigaben

Der [operative Quellenabgleich](../../docs/fachrecht/quellenabgleich-mvp04.md) prüft alle 38 Manifestquellen inhaltlich erneut. David Steimer hat die vollständige Quellenprüfung einschliesslich des Katalogs am 22. September 2026 [abgenommen](../../docs/fachrecht/abnahme-quellenpruefung-mvp04.md). Das neue kanonische Ereignis ist `approved`. Die drei Zukunftsfassungen von AHVG, IVG und IVV bleiben Monitoring, nicht angewendetes Recht. Die historische IVöB-Fassung begründet ausschliesslich die gesperrte Altrechtssituation.

Die drei zusätzlichen Kantonsgruppenberichte sind durch `npm run check:sources:mvp04` auf vollständige, eindeutige Abdeckung der weiteren 82 Quellen geprüft. [Der Vollständigkeitsnachweis](source-review-completeness.json) bindet die Berichte an den Kataloghash, verlangt das kanonische 38er-Ereignis und die entsprechenden Einzelchecks und weist blosse HTTP-Methoden als Inhaltsbestätigung ab. Die unabhängige technische Gegenprüfung der früheren Manipulationsfälle ist bestanden. Dieser technische Abgleich ersetzt nicht das Lesen der Quellen.

Der vollständige inhaltliche Abgleich umfasst 120 unterschiedliche Quellen-IDs: 38 im Manifest und 84 im Katalog bei zwei Überschneidungen. 119 Befunde sind `unchanged`. Ein `unclear` bleibt ausschliesslich für die bereits bekannte widersprüchliche AI-Jahresliste bestehen. [Ihre dokumentierte Folgemassnahme](catalog-follow-up.json) stützt sich auf Davids bestehende Abnahme von V0.12 und AP18C, ohne eine amtliche Berichtigung oder eine neue Freigabe zu behaupten. Es gibt keinen neuen Regeländerungsbedarf und keine nicht verfügbare Quelle. Der Gesamtbericht weist deshalb bewusst **nicht** aus, alle Quellen seien widerspruchsfrei bestätigt.

Der Westschweizer Abgleich vergleicht ergänzend 128 amtlich publizierte Jahresdaten mit der tatsächlichen Core-Regelauswertung. Alle stimmen überein. Quellenprüfung, Sprachbelege und Aktivierung kantonaler Fristenprofile bleiben getrennt.

Der [hashgebundene Abnahmenachweis](source-approval.json) ergänzt die unveränderte historische Vorlage. Freigabe bedeutet nicht, dass das bisherige `unclear` der AI-Liste in ein positives Quellenurteil umgeschrieben wird. Die Vorherstände von Ereignis und Register sind gesichert. Nur der Status und die fachliche Verantwortlichkeit wurden geändert, der Index wurde neu erzeugt. Wiederholungsläufe prüfen diese Bindung, statt die Nachweise zurückzusetzen oder zu überschreiben.

Ausstehend bleiben die abgegrenzte GitHub-Veröffentlichung, E-/Q-Installation mit SharePoint-/Teams-/Gastprüfung und P-Bereitstellung mit öffentlicher Prüfung und Betriebsentscheid. Historisch bestandene T01–T19, Q- und D01–D12-Prüfungen gelten nicht als Nachweis für diese neue Version.

Der veränderte historische Word-Projektplan und `Userinput/` bleiben ausserhalb des Releaseumfangs. Weder temporäre Deploy-Keys noch externe Berechtigungen wurden für diesen Vorbereitungslauf angelegt.
