# AP22A Technischer Modellcheck und Übergabe an AP22B

Stand: 2. Oktober 2026. Abschluss der Variantenprüfung auf dem unveränderten MVP-0.6-Quellstand. Die Empfehlung ist eine Vorlage für AP22B, kein bereits beschlossener neuer Formatvertrag. Die fachliche Freigabe gemäss [DEC-2026-028](../entscheidungen/DEC-2026-028-operative-freigabe-kalenderzuordnungen.md) bleibt davon getrennt.

## Ergebnis

Empfohlen wird eine **versionierte Erweiterung der bestehenden Regelkalender und ihrer expliziten Verfahrenszuordnung**. Die schweizweite Datumserzeugung ist im Fachkatalog bereits vorhanden. Es fehlt nicht eine zweite Kalenderarithmetik, sondern die kontrollierte Übernahme in operative Kalender und die rechtlich passende Auswahl. Alte Formate bleiben unverändert lesbar und weisen neue Inhalte weiterhin zurück.

Die geografische Mitgliedschaft, die fachliche Verwendungsregel und die Produktfreigabe bleiben getrennte Angaben. Der Katalog bleibt die Herkunft der Feiertagsregeln. Operative Kalender werden daraus reproduzierbar abgeleitet, nicht separat von Hand gepflegt.

## Vergleich der Varianten

| Variante | Nutzen | Nachteile | Ergebnis |
| --- | --- | --- | --- |
| A. Bestehende Regelkomponenten versioniert erweitern | Ewiger Kalender bleibt erhalten. Gemeinsamer Generator, Quellen- und Rechenspur, explizite Verfahrensbindungen und vorhandene Provider bleiben nutzbar. | Hauptformatänderung sowie abgestimmte Änderungen an TypeScript, Python, Schemata und UI nötig. | Empfohlen. |
| B. Jährliche Einzeldaten aus dem Katalog erzeugen und als alte Kalender ausgeben | Einfacher einzelner Jahresauszug. | Widerspricht dem nach oben offenen Regelmodell. Braucht wieder eine rollierende Datenversorgung. Alte Verträge erlauben zusätzliche Kalender auch bei syntaktisch passenden Daten nicht. | Als Export denkbar, nicht als operative Zielarchitektur. |
| C. Fristen direkt aus dem gesamten Fachkatalog berechnen | Keine zusätzliche Regelprojektion. | Vermischt archivierte Fakten, ausgeschlossene Listen und operative Wirkung. Zweiter Pfad für Gerichtsferien, Overrides und Rechenspur nötig. Umfangreiche Kernänderung ohne erkennbaren Mehrwert. | Nicht empfohlen. |

## Konkreter Änderungsbedarf

| Bestandteil | Unveränderter Befund | AP22B muss festlegen |
| --- | --- | --- |
| Fachkatalog | `holidayCatalog.ts` bindet Version 1.0.0 absichtlich an CH/BE. Bedingte Regeln mit neuer operativer Freigabe sind darin unzulässig. | Neuer Hauptvertrag mit expliziten Verfahrensbindungen, Herkunft und Freigaben. Die 479 vorhandenen Regeln verlustfrei erhalten. Neue SO-Regeln getrennt ergänzen. |
| Regelkalender | Version 2.0.0 kennt keine Regelbedingungen und keinen Wochentag mit Tagesoffset. | Neuer Hauptvertrag mit den drei vorhandenen Bedingungen und `nthWeekdayOffsetDays`. Keine beliebigen ausführbaren Ausdrücke. |
| Release und Consumer | Manifest 6.0.0 und ältere Verträge verlangen die bisher freigegebenen Kalender und unterstützen höchstens Hauptformat 6. | Neue Manifest-/Mindestconsumer-Hauptversion. Rollen, Dateiinventar, Hashbindung und kompatible Komponenten ausdrücklich bestimmen. |
| Kalenderauswahl | `calendarForJurisdiction` nimmt den ersten Kalender eines Kantons. `automaticCalendarId` bevorzugt BE. | Auflösung nach Verfahren, rechtlich massgebender Rolle, Gebiet und Datum. Kein erster Treffer, keine stillschweigende BE-/CH-Ausweichlösung. |
| Oberfläche | Behördenkantone werden aus kantonalen Rechtsprofilen gewonnen. | Behördenkantone für unterstützte Bundesprofile anbieten, ohne kantonales Verwaltungsrecht vorzutäuschen. Feiertagsort davon getrennt behandeln. |
| Datum und Zeit | Normgültigkeit, Gebietszugehörigkeit und Releasefreigabe haben unterschiedliche Zeitbezüge. | Je geprüften Kalendertag die anwendbaren Regeln und Gebietsstände verwenden. Nicht nur den Zustelltag prüfen. Gültigkeitswechsel während einer Frist mit Referenzen abdecken. |
| Sozialverfahren | 50 freigegebene Berner Anbindungen mit eigenständigen Rechtsweg- und Zeitgrenzen. | Keine automatische schweizweite Sozialfreigabe. Die bestehende Auswahl bleibt unverändert. |

Fundstellen: [Katalog und Projektion](../../src/core/holidayCatalog.ts), [Kalendervertrag](../../src/core/calendarRuleTypes.ts), [Releaseconsumer](../../src/core/data.ts), [UI-Auswahl](../../src/ui/model.ts), [Python-Katalogprüfung](../../tests/data/holiday_catalog_contract.py).

Als **Versionsvorschlag für AP22B** ergeben sich Feiertagskatalog 2.0.0, Regelkalender 3.0.0 sowie Manifest und Mindestconsumer 7.0.0. Spezialregimekatalog 3.0.0 und Sozialverfahrenskatalog 2.0.0 bleiben unverändert, soweit ihre bisherigen Verträge unverändert erfüllt werden. Die numerischen Versionen werden erst mit der konkreten AP22B-Vertragsvorlage beschlossen. Ein zusätzliches separates Aktivierungsartefakt ist vorerst nicht nötig. Die Verfahrensbindungen gehören zum neuen Feiertagskatalogvertrag.

## Verfahrensbindung und räumliche Auflösung

Eine Bindung muss mindestens das Rechtsprofil, ihren fachlichen Zweck, den Bezug zur Quelle, die anzuwendenden Listen, die räumliche Bedingung, die Normgültigkeit und den Freigabenachweis festhalten. Zusätzlich braucht es eine eindeutige Kompositionsart:

- **Grundliste:** genau eine passende Grundliste je massgebendem Ort und Verfahren.
- **Ergänzung:** nur die ausdrücklich bezeichneten Zusatztage, keine unkontrollierte Vereinigung vollständiger Listen.
- **Ersetzt:** eine vollständige Prozessliste verdrängt die ausdrücklich bezeichnete alternative Liste für diesen Zweck.
- **Nicht verwenden:** die betreffende Listenbindung hat keine operative Wirkung. Die Katalogdaten bleiben erhalten.
- **Bewusst begrenzt:** berechenbarer bestätigter Umfang mit sichtbarem Vorbehalt, insbesondere GR und die bestehenden NE-Jahresfestlegungen.

Der Bundesfeiertag wird genau einmal berücksichtigt. Wenn mehrere Quellen denselben Tag stützen, darf die Frist nicht mehrfach verlängert werden. Die Rechenspur darf dagegen mehrere Rechtsgrundlagen aufführen.

Der relevante Ort kann verfahrensabhängig ein Gerichtsort, ein Parteiort, ein Vertretungsort oder eine ausdrücklich rechtlich zulässige Kombination sein. AP22B muss diese Auswahl aus den [Bundesanknüpfungen](../fachrecht/ap22a-bundesanknuepfungen.md) übernehmen. Insbesondere ist eine Rollenpriorität nicht pauschal auf alle Bundesverfahren zu übertragen. Eine Kombination mehrerer Orte bedarf einer eigenen Rechtsregel, nicht einer allgemeinen «günstigsten Auswahl».

Die vorhandenen internen Gebiets-IDs sind keine amtlichen BFS-Gemeindekennungen. Sie reichen für die erfassten, namentlich definierten Teilgebiete. Sie dürfen nicht als vollständiges Schweizer Gemeindeverzeichnis ausgegeben werden. Kantonalrechtlich klar definierte Teilgebiete bleiben modellierbar. Fehlende, widersprüchliche oder nicht eindeutig ausgewählte Gebiete ergeben eine verständliche Rückfrage statt eines berechneten Standardwerts. Eine Karte oder Geodatenbeschaffung ist nicht erforderlich.

## UI und Standards

Der zweispaltige Aufbau bleibt bestehen. Die frühe Datumseingabe bleibt unabhängig von noch ausstehenden Sachauswahlen möglich. Die Berechnung erfordert dagegen alle tatsächlich relevanten Angaben.

Die Hauptansicht zeigt nur erforderliche Auswahlfelder. Zusätzliche Ortsdifferenzierung erscheint nur bei rechtlich relevanten regionalen Unterschieden. Quellen, Listenkomposition und detaillierte Grenzen gehören in die Rechenspur. Eine wesentliche Abdeckungsgrenze wie GR bleibt zusätzlich kurz beim gewählten Kalender sichtbar. Keine neue allgemeine Bestätigungscheckbox.

Bestehende persönliche Standards dürfen nicht ungeprüft einen neuen Ortskontext erzeugen. Die alten Werte «BE» oder eine alte Kalender-ID können nur übernommen werden, wenn ihre Bedeutung unter dem neuen Profil eindeutig gleich bleibt. Sonst bleibt das entsprechende neue Feld unbestimmt. Ein Wechsel von Verfahren, Ort, Rolle oder Override verwirft ein bestehendes Resultat und den zugehörigen Kalenderexport sofort.

Manuelle Übersteuerung bleibt sichtbar. Sie darf keinen ausdrücklich nicht unterstützten Rechtsweg oder fehlende Anwendbarkeitsfakten als automatisch geprüfte Berechnung ausgeben.

## Migration und Nachweis

1. Alten Katalog und alle bisherigen Releaseartefakte unverändert als Eingang binden. DEC-2026-028 separat als fachliche Freigabe referenzieren. Alte Prüfstatus nicht rückwirkend in historische Dateien schreiben.
2. Neue Verfahrensbindungen und SO-Ergänzung im neuen Kandidaten aufbauen. Erhebung, Prüftiefe und Freigabe getrennt erhalten. Nicht verwendete Katalogregeln weder löschen noch produktiv freischalten.
3. Neue Regelkalender deterministisch ableiten. Jede operative Regel auf ihre Katalogregel und Bindung zurückführen. Abweichende Jahresdateien oder zusätzliche ungebundene Feiertage zurückweisen.
4. Neue Hauptversionen nur im neuen Reader aktivieren. Alte Consumer lehnen den neuen Release ab. Neue Consumer lesen AP5 sowie Formate 2 bis 6 weiterhin nach deren unveränderten Verträgen.
5. TypeScript- und Python-Validierung, Provider, Cache, UI, Preview, Webbuild und SPFx gemeinsam prüfen. Erst danach die Datenübernahme und definitiven Artefakte gesondert freigeben.

Die neue operative Gültigkeit darf nicht einfach aus alten Erhebungsdaten übernommen werden. Die Grundprofile beginnen bisher am 29. August 2026. Die Normen besitzen eigene Zeitstände. Die Manifestabdeckung ist nach oben offen, die Sozialfreigaben dagegen auf 2026–2027 begrenzt. AP22B muss den konkreten neuen Freigabezeitraum ausdrücklich mit diesen Grenzen vereinbaren.

## Begrenzte technische Modellproben

Der [reproduzierbare lokale Modellcheck](../../scripts/check-ap22a-model.mjs) liest ausschliesslich den bisherigen Datenrelease. Er prüft Datumsausdrücke, geografische Ausnahmen und die absichtliche Zurückweisung einer Freigabe in alten Verträgen. Seine Ergebnisse sind Bestands- und Machbarkeitsnachweise, keine Tests eines bereits implementierten neuen Resolvers.

Die neuen positiven und negativen [Fachreferenzen](../fachrecht/ap22a-referenzfaelle.md) definieren die spätere Sollwirkung. In AP22C werden daraus automatisierte Produktfälle. Ein dokumentiertes Sollresultat ist noch kein bestandener Produktfall.

## Übergabe und Paketgrenzen

- AP22B erstellt den exakten Datenvertrag, Schemata, Migrationsregeln und die gebundenen Referenzfälle. Der konkrete Vertragsentscheid bleibt David Steimer vorbehalten.
- AP22C1 integriert Datenmodell, Kalendergenerator, Projektion und Validierung ohne UI-Umbau.
- AP22C2 integriert die gemeinsame Oberfläche, erforderliche Ortsangaben, Rechenspur und Standardmigration.
- AP22C3 prüft Hosts und Provider, historische Releases und die vollständige Regression. Definitive Releaseartefakte folgen erst in der anschliessenden Releasevorbereitung.

Jedes Teilpaket bleibt auf höchstens fünf Nettoarbeitstage begrenzt. AP21 beginnt nicht parallel als zweites wesentliches Paket. Zusätzliche ausserbernische Sozialanbindungen werden für diesen Kalenderabschluss ausdrücklich zurückgestellt und bleiben in Issue #35. Ihre spätere Aufnahme benötigt eine eigene begrenzte Positivliste, ohne die nationalen Regeln zu duplizieren.
