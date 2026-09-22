# AP18C: Kontrollierte Übernahme der Feiertagsgrundlage

Stand: 22. September 2026. **AP18C1 ist lokal implementiert und technisch geprüft.** Dieses Dokument hält den Importteilschritt fest. Die anschliessende [Produktintegration gemäss DEC-2026-023](feiertagskatalog-ap18c.md) ist ebenfalls lokal implementiert und technisch geprüft. AP18C insgesamt ist noch nicht menschlich abgenommen oder veröffentlicht.

## 1. Auftrag und Abnahmegrenze

David Steimer hat die gesamte Arbeitsmappe V0.12 sowie den technischen Vertragsnachtrag `0.6.0` abgenommen. Die [Abnahmenotiz](../fachrecht/abnahme-ap18b-05.md) und [DEC-2026-022](../entscheidungen/DEC-2026-022-bedingte-feiertagsregeln.md) dokumentieren diesen Schritt.

AP18C übernimmt diese Grundlage kontrolliert. Der erste technische Teil umfasst den tatsächlichen XLSX-Import, die Validierung und einen eigenständigen Fachkandidaten. Er ist ein begrenzter Implementierungsschritt innerhalb des laufenden AP18, kein zusätzliches parallel geführtes Arbeitspaket. WIP-Limit und menschliche Freigabeverantwortung bleiben unverändert.

Die abgenommene Datei wird nicht nachträglich bearbeitet. Produktkalender, App-Oberfläche, SharePoint-Mirror und E-/Q-/P-Installationen bleiben unverändert. Es erfolgt keine Veröffentlichung.

## 2. Warum zunächst ein Fachkandidat

Die bestehende Kalenderkomponente `2.0.0` kann den vollständigen Bestand nicht darstellen. Insbesondere fehlen Kategorienunterscheidung, räumliche Ein- und Ausschlüsse, Halbtage, die neuen Bedingungen und der vierte Berechnungstyp `nthWeekdayOffsetDays`. Die App wählt bislang einen einzelnen Kalender anhand des Gemeinwesens. Mehrere fachlich unterschiedliche Geltungsprofile dürfen deshalb nicht einfach als zusätzliche Kalender eingespielt werden.

Der [AP18C1-Fachkandidat](../../data/candidates/2026-09-22-ap18c-workbook/README.md) bleibt ausserhalb von `data/releases`. Er besitzt `kind: holidayWorkbookCandidate`, `status: candidate` und `runtimeEnabled: false`. Das lokale Importformat `0.1.0` ist kein beschlossener Produktformatvertrag. Ein neues Feld im bestehenden Runtime-Format oder eine ignorierte Erweiterung wäre kein verlustfreier Ersatz.

## 3. Eingang, Herkunft und Vollständigkeit

Eingang ist ausschliesslich die gespeicherte V0.12. Seit der [Archivbestätigung vom 22. September 2026](../fachrecht/archivbestaetigung-ap18.md) liest der Builder die byteidentische, lokal schreibgeschützte Kopie in `outputs/archiv/ap18/2026-09-22/referenzen/`. Die bearbeitbare Arbeitskopie ist kein Importpfad. Die Referenzprüfsumme bleibt:

```text
d4fe89932b5d33f7f63516073668accf1a92b141a07388b559c3a6965c1aeb65
```

Der Import ermittelt Tabellen über die nativen OOXML-Beziehungen. Spalten werden anhand ihrer Überschriften gelesen, nicht anhand früherer Excel-Spaltenbuchstaben. Die gespeicherten deutschen, französischen, italienischen und rätoromanischen Bezeichnungen stammen aus der tatsächlichen Mappe, nicht aus älteren Erfassungsmodellen.

| Inhalt | Übernommene Zeilen |
| --- | ---: |
| Gemeinwesen | 27 |
| Feiertagsregeln | 479 |
| Räumliche Geltungsbereiche | 49 |
| Gebietszuordnungen | 95 |
| Rechtsquellen | 84 |
| Verfahrensbezüge | 92 |
| Quellenprüfungen | 90 |
| Abgeleiteter Feiertagskalender | 488 |

Jeder normalisierte Datensatz trägt Blatt, Tabelle und Zeilennummer als Herkunft. Zusätzlich bleiben sämtliche Tabellenzellen mit Wert, Formeltext, Zelltyp und tatsächlichem Hyperlinkziel sowie die nichtleeren Zellen ausserhalb der Tabellen erhalten. Dazu gehören Übersicht, Hinweise und Osterhilfsformeln. Ausgeblendete Zeilen werden nicht ausgelassen.

«Verlustfrei» bedeutet hier semantisch vollständige Übernahme der Erfassungsdaten und ihrer Zellnachweise. Ein identischer Excel-Rückexport einschliesslich Gestaltung, Schutz, Validierungsregeln oder Drucklayout ist nicht Gegenstand. Diese Eigenschaften bleiben in der unveränderten Originaldatei erhalten.

## 4. Prüfungen und Fehlerverhalten

Der schreibgeschützte OOXML-Leser verwendet die Python-Standardbibliothek. Er ist nötig, um Paketbestand, Tabellenbeziehungen, Formelattribute und Original-Hyperlinks exakt zu prüfen. Es werden keine Makros oder Excel-Formeln ausgeführt und keine Links nachgeladen.

- Grössen- und Komplexitätsgrenzen für ZIP/XML. Doppelte Paketpfade, Pfad-Traversal, Verschlüsselung, DTD/Entities, Makros, externe Datenbeziehungen und nicht unterstützte Paketbestandteile werden abgewiesen.
- Exakte Blatt-/Tabellenstruktur und vollständiger Überschriftenvertrag. Unbekannte oder fehlende Spalten, doppelte IDs und Formeln in fachlichen Eingabezellen führen zum Abbruch.
- Strikte Typen, Gültigkeiten, Regelparameter, Kalenderbedingungen und Tagesumfänge. Ein gespeicherter Fehler wird nicht als leerer oder gültiger Wert ausgegeben.
- Referenzen auf Gemeinwesen, Quellen und Geltungsbereiche. Gebietsdefinitionen, Elternbezüge, Hierarchie, Kantonsgrenzen, überlappende Zuordnungen sowie räumlich und zeitlich gedeckte Ausschlüsse werden geprüft.
- Abnahme und Datei müssen zusammenpassen. Historische Freigaben dürfen nicht auf neue Regeln, Gebiete oder Quellen übertragen werden.
- Regeltermine werden aus den importierten Parametern neu berechnet. Gespeicherte Excel-Daten sind Prüfnachweis, nicht Rechenquelle. «Entfällt», «Ausserhalb Geltung» und Eingabefehler bleiben getrennt.
- Die zwölf CH-/BE-Referenzregeln werden feldweise mit dem bestehenden freigegebenen Release verglichen. Alle acht dort manifestierten Artefakte werden auf ihre Prüfsumme kontrolliert.
- Ausgabe ist deterministisch. Ein zweiter Build muss dieselben Bytes ergeben. Der Builder prüft auch nach dem Import den unveränderten Eingangs-Hash.

Das Versionsdatum einer historischen Quelle darf vor 1900 liegen. Der Import erhält deshalb auch den in der Mappe verwendeten negativen Datumswert zur Näfelser Fahrt von 1835. Fehlende Fassungsdaten bleiben `null` und werden nicht durch Abrufdaten ersetzt.

## 5. Abnahme und historische Vermerke

Die externe, an den Datei-Hash gebundene Abnahme wird getrennt vom eingefrorenen Arbeitsstatus importiert. Die Felder `open`, `blockedScope` und `blockedEffect` bleiben historisch erhalten. Der Abnahmevermerk hebt sie nicht pauschal in eine Runtime-Freigabe an. Seine Prüfsumme schützt gegen versehentliche Änderungen, ist aber keine digitale Signatur oder zweite menschliche Prüfung.

Die bestätigten Grenzen für SO, GR, NE und eigenständiges kommunales Recht werden separat mit ihrem Nachweis übernommen. Insbesondere bleibt der Solothurner 1.-Mai-Halbtag im Fachkalender enthalten, erhält aber gemäss späterer Fachfestlegung keine Fristwirkung. Ein alter offener Tabellenvermerk wird dadurch nicht zur erneut offenen Rechtsfrage.

Für 29 Gebietszuordnungen unterscheiden sich Normquelle und Gebietsquelle. Der Kandidat führt beide IDs, Fundstelle, den ursprünglichen Prüfhinweis und die Zeilenherkunft ausdrücklich zusammen. Er behauptet weder eine neue Quellenprüfung noch einen eigenständigen maschinenlesbaren Freigabeakt. Die früheren textlichen Quellenbelege sind erhalten. Vor einer automatischen verfahrensbezogenen Ortsauflösung bleibt ihre konkrete Zuordnung Teil des Produktvertrags.

Die 92 Verfahrensbezüge bleiben lesbare Fachzuordnungen. Der Import interpretiert keine Freitexte als ausführbare Anwendungsfreigabe. IT/RG bleiben vorerst Teil der Fachgrundlage, nicht zusätzliche App-Sprachen.

## 6. Technischer Nachweis

Die [Validierungsdatei](../../data/candidates/2026-09-22-ap18c-workbook/validation-report.json) enthält Eingangs- und Ausgangsprüfsumme sowie Bestandszahlen. Die Wiederholungsbefehle stehen beim [Kandidaten](../../data/candidates/2026-09-22-ap18c-workbook/README.md).

Nachweis des aktuellen Prüflaufs:

- 1'437 neu berechnete Regel-/Jahreskombinationen für 2026–2028.
- 967 Vergleiche gegen gespeicherte Regel- und Kalenderdaten für das ausgewählte Jahr 2027, zusätzlich Sprach-, Quellen- und Tagesumfangsabgleich der Kalenderzeilen.
- Unabhängige erneute Prüfung der unveränderten XLSX mit 2'874 Formelergebnisvergleichen für 2026–2028 und 2'000 bedingten Rechenproben für 2000–2399. Die zusätzlichen Jahre erweitern die fachliche Datengültigkeit nicht.
- 27 bestandene Paket-/Lesertests und 68 bestandene JavaScript-Import- und Manipulationstests. Zusammen 95 spezifische AP18C1-Tests ohne Fehler oder ausgelassene Tests.
- Bestehende Kern-, UI- und öffentliche App-Tests: 491 bestanden. TypeScript-Prüfung ohne Fehler. Diese Prüfungen ersetzen keine erneute SharePoint-/Teams-/Produktionsprüfung.

Der erste bisherige Kalender-Testlauf ergab 372 bestandene Tests und acht Abbrüche beziehungsweise Fehler am historischen V0.9-Hash-Gate. Dieser Befund wird nicht rückwirkend korrigiert. Nach der ausdrücklich bestätigten Archivbehandlung sind Funktionstests und Archivbeweis getrennt:

- **459 Kalender-, Modell- und Importtests bestanden**, darunter die 68 AP18C1-JavaScript-Tests. Keine ausgelassenen Tests. Die Modelltests verwenden ihre Erfassungsgrundlagen, der AP18C-Import dagegen die tatsächliche abgenommene V0.12.
- **10 neue Archivtests bestanden**, einschliesslich Manipulations-, Fehlbestands- und Nichtüberschreibungstests. Der Archivprüflauf meldet `verifiedWithDocumentedHistoricalVariance`. Die ursprüngliche Byteidentität von V0.9 und V0.10 bleibt unbelegt.
- **27 Python-Lesertests und 491 Kern-/UI-/Public-App-Tests erneut bestanden.** TypeScript-Prüfung erneut ohne Fehler.
- Ein erneuter Kandidatenbau aus der Archivkopie erzeugt exakt dieselbe Kandidatenprüfsumme `9553f483678bc5f209099703588402a7dd65cf4d9aac8a00aadb6f9dbe966099`. Weder die V0.12 noch der erzeugte Fachbestand ändern sich durch die Pfadtrennung.

Die alte V0.9-Migrationssperre bleibt unverändert und wird durch einen Negativtest abgesichert. Die strikte historische Byteprüfung scheitert weiterhin ausdrücklich für V0.9/V0.10. Ein grüner Funktionstest ist kein Ersatz für diesen fehlenden Beweis. Details stehen in der [Archivbestätigung](../fachrecht/archivbestaetigung-ap18.md).

Für dieses Arbeitsergebnis wurde keine neue native Excel-Bedienprüfung behauptet. Die Mappe und ihre Ansichten sind unverändert. Die Prüfung betrifft den tatsächlich gespeicherten Inhalt und den Import.

## 7. Fortsetzung innerhalb AP18C

Der nächste materielle Schritt wurde mit [DEC-2026-023: Schweizweiter Feiertagskatalog](../entscheidungen/DEC-2026-023-schweizweiter-feiertagskatalog.md) durch David Steimer beschlossen und lokal umgesetzt. Eigener Feiertagskatalog `1.0.0`, Manifest und Consumer `4.0.0`, unveränderte operative Kalenderkomponente `2.0.0`. Die zwölf freigegebenen CH-/BE-Feiertagsregeln werden ausdrücklich aus dem Katalog projiziert. Der [gesonderte Integrationsnachweis](feiertagskatalog-ap18c.md) dokumentiert die Fortsetzung entlang dieser Grenzen:

1. Die schweizweite Feiertagsgrundlage vollständig erhalten, ohne daraus automatisch 26 neue kantonale Fristenprofile zu machen.
2. Neue Datumstypen, Bedingungen und fachliche Geltungsbereiche als explizite, validierbare Daten abbilden. Keine wesentlichen Einschränkungen in ignorierten Erweiterungsfeldern verstecken.
3. Den bisher freigegebenen CH-/BE-Berechnungspfad unverändert zuordnen und testen. Neue Fachprofile erst mit ihrer konkreten Verfahrens- und Ortsanknüpfung aktivieren.
4. Danach Consumerintegration, AP17-/Kalender-Gesamtregression, kontrollierte Releasepromotion und gesondert freigegebene Bereitstellung.

Eine Kalender-App, Kartendarstellung und zusätzliche VRPG-Verbindungen sind nicht Teil dieses Imports. AP18C1 bleibt der unveränderte Herkunfts- und Zellnachweis. Der beschlossene Produktvertrag autorisiert die lokale Implementierung, nicht ihre menschliche Abnahme, Releasepromotion oder Bereitstellung.
