# MVP 0.7 – Darstellungskandidat 0.7.0.2

Stand: 9. Oktober 2026. **Lokaler Korrekturkandidat gebaut, geprüft und archiviert. Keine Installation aus dieser Unterlage ableiten.** Grundlage ist der [begrenzte lokale Auftrag](freigabe-r07c-b01-lokal.md). Der ursprüngliche [E-/Q-Vollzugsnachweis](eq-vollzugsnachweis-mvp07.md) bleibt als Hostbefund erhalten.

## Korrektur

Lange Einträge werden in allen 19 Dropdown-Stellen des Rechners mehrzeilig dargestellt, sowohl im geschlossenen Feld als auch in der geöffneten Liste. Automatische Höhe gilt auch für ausgewählte und deaktivierte Optionen sowie die schmale Panelansicht. Enthalten sind die dynamischen VRPG-/Soziallisten und die Kalenderanknüpfung.

Unverändert bleiben Beschriftungen, Auswahlwerte, Auswahlhandler, Rechenlogik, Kalender-/Rechtsdaten, Datenvertrag, Produktidentitäten, Datenpins und Berechtigungsanforderungen. Der bestehende zweispaltige Aufbau und sein schmaler Layoutwechsel bleiben erhalten. Die normalisierten Syntaxbäume der beiden betroffenen TSX-Dateien sind nach Ausklammerung ausschliesslich der Styleattribute und Styleimporte identisch zum Originalbuild.

## Kandidat und Nachweise

Der neue isolierte Bau verwendet Solution-/Featureversion `0.7.0.2`, Application-/Webpartversion `0.7.0` und den unveränderten Datenrelease `2026-10-08-mvp-07-approved.1`. Manifest SHA-256: `fe1dfa0a241ac1c0e083998f05fb43e058f3c1be223f35cd276d3df436941597`.

| Gegenstand | Gebundener Nachweis |
| --- | --- |
| [SPFx-Kandidat 0.7.0.2](../../outputs/release-mvp07-spfx-0.7.0.2-2026-10-09/artifacts/fristenrechner-schweiz-0.7.0.2.sppkg) | 291'895 Bytes, SHA-256 `8bae0c1ea64b4482abea8fcdbd7aa5c576f6d552735b5a3e5f01a9ea68ab71db` |
| Hauptbundle | `fristenrechner-web-part_0ccdb03876bfbfadc970.js`, SHA-256 `b3643ea6732377da0d429ed36e63eebf0047fa84e09fc85d99df2ec3573de4cf` |
| [Build- und Paketnachweis](../../outputs/release-mvp07-spfx-0.7.0.2-2026-10-09/artifact-verification.json) | Sechs Build-/Testschritte bestanden, tatsächliche Paketbytes geprüft, anschliessend unabhängig erneut lesend bestätigt |
| [UI- und Browsernachweis](../../outputs/release-mvp07-spfx-0.7.0.2-2026-10-09/local-checks/verification.json) | 528 UI-Tests, Typecheck, normalisierter AST-Vergleich, fünf Guardtests, fünf abgegrenzte lokale Browserfälle und Screenshots |

| Prüfung | Ergebnis |
| --- | --- |
| UI | 528/528 bestanden, darin neun gezielte Dropdown-Prüfungen mit tatsächlichem Fluent-DOM, Callout und Panel |
| TypeScript | `--noEmit` bestanden |
| SPFx-Quell-/Providerprüfungen | 186/186 bestanden |
| Production-Compile und CSS-Audit | Bestanden |
| Kompilierter Code und tatsächlicher Paketconsumer | 83/83 bestanden, einschliesslich MVP07, historischer Consumer, Cachebindung, Datumseingabe und Export |
| Korrektur-/Paket-Grenzprüfungen | 5/5 bestanden, unzulässige Delta- und XML-Varianten werden zurückgewiesen |
| Historische MVP07-Artefaktprüfungen | 19/19 bestanden. Diese prüfen das unveränderte Originalarchiv, nicht den neuen Kandidaten |
| Erhaltung | 1'631 inventarisierte historische Beleg-/Artefaktdateien unverändert, alle 41 freigegebenen Releasebytes und der Pin unverändert |

Die ursprünglichen MVP07-, MVP06- und Recovery-Archive wurden vollständig vor und nach dem Bau verglichen. Das Paket im bisherigen generierten SPFx-Ausgabeordner wurde nicht überschrieben. Der Paketvergleich lässt neben der Hauptbundleänderung nur die beiden Versionswerte, den neuen Bundlepfad und die durch den SPFx-Packager zufällig erzeugten Asset-/PartConfig-IDs zu. Die eigentlichen Solution-, Feature- und Webpartidentitäten bleiben gleich. Zwei einkompilierte historische Format-6-Normreferenzen wurden zusätzlich gegen den ursprünglichen MVP07-Baueingang geprüft.

Der erste isolierte Lauf bestand sämtliche Source- und Pakettests, wurde aber durch eine zu enge Vergleichsannahme in der neuen Prüfhilfe angehalten. Die vom Packager über `uuid.v4()` erzeugten PartConfig-IDs waren noch nicht ausgenommen. Dies wurde anhand des installierten Packagercodes geprüft und mit einem eng begrenzten zusätzlichen Negativtest korrigiert. Kein Produktcode wurde deswegen angepasst. Der erste Lauf bleibt als Fehlversuch erhalten, der abschliessende Kandidat wurde vollständig neu gebaut und geprüft. Sein Bericht und eine bereinigte Kopie des ersten Fehlversuchs sind getrennt archiviert.

## Lokale Darstellung und Grenzen

Die lokale Vorschau wurde in Deutsch und Französisch bei 720 Pixel Breite mit geöffneten Listen und bei 390 Pixel Breite mit der schmalen Panelansicht geprüft. Zusätzlich wurde die breite französische Ansicht bei 1280 Pixeln kontrolliert. Die langen Zustelltexte brechen sichtbar um, ohne horizontales Abschneiden. Die ausgewählte deutsche Zustellart erhält beispielsweise 52 Pixel Feldhöhe, die längere Listenoption 58 Pixel.

Diese tatsächlichen Browseransichten verwenden die korrigierte UI-Quelle. Der Paketinhalt wird davon getrennt geprüft. Die Vorschau ist **kein SharePoint-/Teams-Hostnachweis, kein realer iOS-Gerätetest und kein nativer 200-Prozent-Zoomnachweis**. T07 und das E-Gate bleiben bis zur Nachprüfung auf den tatsächlichen Hosts offen.

## Vor einer späteren Installation

1. **Neuen Rückfallweg gesondert billigen.** Der anschliessend beauftragte [Recovery `0.7.0.3`](wiederherstellungskandidat-mvp07-0703.md) ist inzwischen lokal gebaut und anhand der tatsächlichen Paketbytes gegen `0.7.0.2` geprüft. Die [gemeinsame Installationsvorlage](eq-installationsvorlage-mvp07-0702.md) bindet beide endgültigen Paketprüfsummen. R07C-H02 bleibt bis zu Davids Bestätigung offen. Das unveränderte gebilligte Recovery `0.7.0.1` wäre nach `0.7.0.2` niedriger versioniert. H01 wird nicht auf den neuen Kandidaten übertragen.
2. Frischen Katalogbestand und die vier bereits gebundenen Ziele bestätigen. Neue Freigabe an das konkrete Korrekturpaket und seine SHA-256-Prüfsumme binden. Gemeinsame Codewirkung auf Q, AP5 und andere bereits verbundene Instanzen ausdrücklich berücksichtigen. Keine zusätzlichen Sites installieren.
3. Nach Freigabe zuerst die beiden bestehenden E-Apps aktualisieren. Die dort bereits umgestellten MVP07-Mirrors bleiben unverändert. Paket-/Bundleidentität, DE/FR, geöffnete und geschlossene Listen, schmale Darstellung und echten 200-Prozent-Zoom auf SharePoint und Teams prüfen. Begrenzte Datum-/Rechen-/Export- und AP5-Stichproben am neuen Code ergänzen. Kein Outlook-Import oder Browserdatenreset.
4. Erst bei bestandenem E-Gate den begrenzten Q-Vollzug fortsetzen. Reale Gastprüfung und manuelle Q-Abnahme bleiben gesondert.

Mirror- und Webarchive werden in diesem Auftrag nicht neu gebaut. Die gemeinsame UI-Quelle ist korrigiert, das bisherige öffentliche Webartefakt enthält die Korrektur noch nicht. Ein späterer zusammengehöriger P-Kandidat muss dies ausdrücklich berücksichtigen. GitHub, P, AP21, E05, Berechtigungen und Richtlinien bleiben unverändert.

David entscheidet in Personalunion. Codex hat keine formelle Freigabe- oder Haftungsverantwortung.
