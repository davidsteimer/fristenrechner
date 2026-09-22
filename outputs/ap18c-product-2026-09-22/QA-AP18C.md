# AP18C: Lokaler Integrations- und Prüfnachweis

Prüfdatum: 22. September 2026. Umsetzung gemäss beschlossenem [DEC-2026-023](../../docs/entscheidungen/DEC-2026-023-schweizweiter-feiertagskatalog.md). **Technische Prüfung bestanden. Menschliche Implementierungsabnahme noch ausstehend. Keine Release- oder Betriebsfreigabe.**

## Geprüfter Stand

- Datenkandidat `2026-09-22-ap18c-candidate.1`, Manifest-/Consumerformat `4.0.0`.
- Feiertagskatalog `1.0.0`, 479 Regeln, 49 Geltungsbereiche, 95 Gebietszuordnungen, 84 Quellen, 92 Verfahrenshinweise und 90 Quellenprüfungen. Vier Sprachfelder erhalten.
- Neun Artefakte. Alle acht AP17C-Ausgangsartefakte byteidentisch übernommen.
- Operative Ableitung ausschliesslich für zwölf CH-/BE-Feiertagsregeln. Drei bestehende Gerichtsferienregeln unverändert.
- Lokaler Quellstand im bestehenden Arbeitsverzeichnis, nicht als neuer Commit veröffentlicht. Bisheriger Git-HEAD `81815d45d2950fbdbafcb4406a6928843f16ec2a`.
- Keine Änderung der Arbeitsmappe, historischer Releaseartefakte, produktiver Datenpins oder Installationen.

Der vollständige [Integrationsvertrag](../../docs/architektur/feiertagskatalog-ap18c.md), der [Datenkandidat](../../data/releases/2026-09-22-ap18c-candidate.1/README.md) und der maschinenlesbare [Buildnachweis](build-verification.json) gehören zu diesem Nachweis.

## Automatisierte Prüfungen

| Prüfbereich | Ergebnis | Aussagegrenze |
| --- | --- | --- |
| Kern, UI und öffentliche App | 673 Tests bestanden, 0 Fehler, 0 ausgelassen | Einschliesslich neuer Katalog-/Integrationsprüfung, bisheriger Referenzfälle und AP17-Fallkorpus |
| Kalender-, Modell- und Importtests | 469 Tests bestanden | Einschliesslich zehn neuer Produktkandidaten-Buildtests und 68 AP18C1-Importtests |
| Archiv | 10 Tests bestanden, tatsächlicher Archivcheck bestanden mit dokumentierter historischer Abweichung | Keine Wiederherstellung der ursprünglichen V0.9-/V0.10-Byteidentität |
| Python-OOXML-Leser | 27 Tests bestanden | Tatsächliche Paket-/Tabellenstruktur, keine neue native Excel-Bedienprüfung |
| Unabhängiger Python-Katalogvertrag | 25 Tests bestanden | Eigene Struktur-, Referenz-, Gebiets-, Freigabe- und Projektionsgegenproben |
| Historischer Manifestvertrag | 6 Tests bestanden | Unveränderte Schemafixture aus dem bisherigen Git-HEAD, kein ausgeführtes altes Browserbündel |
| Neuer AP18C-Release | Gültig, 19 Negativtests bestanden | Vollständiges Manifest, neun Artefakte und semantische Verknüpfungen |
| Frühere Releases | AP17C, MVP 0.3, MVP 0.2 und AP5 gültig | Jeweils zusätzlich 19, 11, 11 und 8 bestehende Release-Negativtests bestanden |
| SPFx | 48 Tests bestanden | Davon 23 neue Katalog-, Scope-, Provider- und Persistenztests |
| TypeScript | Root und SPFx ohne Fehler | Gemeinsamer Core wird byteidentisch synchronisiert |
| SPFx-Produktionsbuild | `heft test --clean --production` bestanden | Keine Paketierung, Heft-Jest findet selbst keine Tests. Die 48 Node-Tests wurden separat ausgeführt |
| SPFx-CSS-Audit | Bestanden | Gemeinsame UI-CSS im tatsächlichen Bundle vorhanden |
| Lokaler Webbuild | AP18C-Build erfolgreich, `candidate`, `deployable: false` | Keine Hosting- oder Produktionsprüfung |
| Diff-Prüfung | `git diff --check` ohne Befund | Kein Commit oder Push |

Die Testzahlen überschneiden sich innerhalb der genannten Untergruppen. Beispielsweise sind die neuen Katalogtests bereits Teil der 673 Kern-/UI-/Webtests. Die 1 437 Datierungsvergleiche sind Prüfpunkte innerhalb der Tests, keine zusätzlich gezählten Testfälle.

### Inhaltliche Gegenproben

Die 1 437 importierten Regel-/Jahreskombinationen für 2026–2028 stimmen mit dem Laufzeitauswerter überein. Die bedingten AR-/AI-/NE-Regeln und die Glarner Verschiebung sind zusätzlich mit langfristigen Kalenderproben abgesichert. Die Gültigkeit wird auch bei der Näfelser Fahrt erst am resultierenden Datum geprüft.

Die bisherigen gewöhnlichen und speziellen Referenzfälle sowie die 60 AP17-Fälle behalten Ergebnis und vollständige Rechenspur. Beim Vergleich wird ausschliesslich die absichtlich neue Release-ID ausgeblendet. Auch die generierten operativen Kalender und Gerichtsferien stimmen für 2026, 2027, 2028, 2100 und 2400 mit dem AP17-Ausgangsstand überein. Diese technischen Probejahre erweitern keine fachliche Freigabe.

Negativtests verhindern unter anderem zusätzliche Kantone, zusätzliche operative Regeln, unzulässige Overrides, Änderungen an Gerichtsferien oder Vererbung, unvollständige Gebietsquellen, fingierte historische Freigaben, unbekannte Felder, Versionsdowngrades und einen ausgetauschten Spezialkatalog. Der vollständige Release wird vor Aktivierung verworfen. Der bisherige gültige Stand bleibt erhalten.

Die Providerprüfung bestätigt identische Nutzbytes für öffentlichen Feed und Mirror sowie die vollständige Persistenz im lokalen Cache. Sie ist ein lokaler automatisierter Test, kein erneuter Zugriff auf den tatsächlichen Tenant-Mirror.

## Browser- und Sichtprüfung

Die lokale Vorschau wurde mit isoliertem Chrome-Testprofil unter `http://127.0.0.1:8794/?candidate=ap18c` geprüft. Die [Browserergebnisse](browser-results.json) enthalten 21 bestandene Fälle mit tatsächlichen Inhaltsbreiten von 1024, 736 und 360 Pixeln.

- DE/FR, Sozialversicherungsrecht, Beschaffungsrecht, politische Rechte und allgemeines VRPG.
- Gültige Berechnungen, gesperrte Anker, Altrechtssperre, echte Auswahlmöglichkeiten und fixe Modellfelder.
- Standardwerte, Rücksetzen fallbezogener Angaben und Kalenderexport.
- Stabile Beschriftung «Sitz der zuständigen Stelle», konsequente Zweispaltigkeit auf grösseren Ansichten und einspaltige Mobilansicht.
- AP18C-Kandidatenhinweis in beiden Sprachen.
- Kein horizontaler Überlauf, keine abgeschnittenen Eingaben oder fixen Werte, keine protokollierten Browserfehler und keine externen Laufzeitanfragen.

Zusätzlich wurden die folgenden tatsächlichen Screenshots visuell geöffnet und kontrolliert:

- [C01: Sozialversicherungsrecht, Desktop DE](C01-iv-einwand.png)
- [C07: Beschaffungsrecht, Desktop FR](C07-procurement-fr.png)
- [C14: Sozialversicherungsrecht, Mobil FR](C14-social-mobile-fr.png)

Es wird keine vollständige manuelle Sichtprüfung aller 21 Screenshots behauptet. Die geometrischen Layoutprüfungen wurden dagegen für alle 21 Ansichten ausgeführt.

## Im Review behobene Befunde

1. Der erste Browserlauf zeigte, dass die bisherige Kandidatenkennzeichnung nur AP17 erfasste. Ein eigener AP18C-Hinweis wurde ergänzt und in beiden Sprachen geprüft.
2. Die erste Consumerintegration konnte den Format-4-Stand vor der strengeren Core-Grenzprüfung in den Cache übernehmen. Die vollständige Vorprüfung liegt jetzt vor Aktivierung und Speicherung. Der unzulässige Legacy-Spezialkatalog wird dort zurückgewiesen.
3. Die erste unabhängige Python-Prüfung deckte mehrere semantische Gebiets-, Freigabe- und Projektionsbedingungen noch nicht vollständig ab. Diese Prüfungen und gezielte Negativtests wurden ergänzt. Eine zweite unabhängige Codeprüfung hat die ursprünglichen Reproduktionen und zusätzliche Manipulationen über den gesamten Python-Validator erneut bestätigt.
4. Eine neue SPFx-Lintwarnung zur dynamischen Regex-Kompilation wurde durch vier statische Schema-Patterns und einen geschlossenen Pattern-Guard beseitigt. Keine pauschale Lint-Unterdrückung.

Offen bleiben nur die beiden bereits bestehenden `no-new-null`-Hinweise im SPFx-Datenvertrag. Der finale Produktionsbuild hat keine neue Warnung hinzugefügt. Die Reviewbefunde sind behoben, die Nachprüfungen bestanden. Dies ist eine technische Gegenprüfung durch KI-Arbeitsinstrumente, kein menschliches Vieraugenprinzip oder Ersatz für Davids Abnahme.

## Prüfsummen und unveränderte Artefakte

| Artefakt | SHA-256 |
| --- | --- |
| Abgenommene V0.12-Referenz | `d4fe89932b5d33f7f63516073668accf1a92b141a07388b559c3a6965c1aeb65` |
| Vollständiger AP18C1-Import | `9553f483678bc5f209099703588402a7dd65cf4d9aac8a00aadb6f9dbe966099` |
| AP18C-Kandidatenmanifest | `be1bf547e085032f505e71d0d12b891436b2e9a9ec0b67cc33b711f32d5906b7` |
| Neuer Laufzeitkatalog | `b53f9ed3dec29c8bb479b3840a801f3056531374cbb84611b377d7a01e93d1b7` |
| Unverändertes bestehendes SPPKG | `a4cbaa646a9338419de51f7629652ecc2f9ada0ac15aeccdcf2211f72bc964e1` |
| Historische Manifest-Schemafixture | `016abce21e480fd24c6ba45213df66622c9216299986cd89a22e95ea751cad55` |

Ein erneuter Kandidatenbau bestätigt identische Ausgaben. Die Archivkontrolle lautet ausdrücklich `verifiedWithDocumentedHistoricalVariance`, nicht Wiederherstellung aller historischen Hashes.

## Noch erforderliche Schritte

1. Menschliche Abnahme der lokalen AP18C-Implementierung durch David Steimer.
2. Eigenständiger kontrollierter Datenrelease mit endgültiger App-/Paketversion und erneutem Paketbau.
3. Gesondert autorisierte Veröffentlichung und abgestimmte Aktualisierung der Consumer, Datenpins und Mirror.
4. Prüfung in SharePoint, Teams und öffentlicher Hostingumgebung vor der jeweiligen Betriebsfreigabe.

In diesem Umsetzungsschritt erfolgten weder ein Commit/Push noch eine Installation, Mirror-Aktualisierung oder Änderung an steimer.ch. Die vorhandene `.sppkg`-Datei ist nicht das neue AP18C-Paket.
