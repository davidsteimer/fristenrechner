# AP19C1 · Technische Grundlage und ELG-Integration

**Stand: 25. September 2026. Lokaler Implementierungskandidat, noch nicht fachlich abgenommen oder operativ freigegeben.** David Steimer hat AP19C mit «Starte AP19C.» beauftragt. Das aktive Teilpaket C1 setzt den abgenommenen [AP19B-Vertrag](sozialversicherungsvertrag-ap19b.md) und [DEC-2026-025](../entscheidungen/DEC-2026-025-sozialverfahrenskatalog-und-manifest-v5.md) um. AVIG und KVG bleiben den gesonderten Folgepaketen C2 und C3 vorbehalten. Der [abschliessende Gesamtprüfnachweis](../fachrecht/pruefbericht-ap19c1.md) wird getrennt geführt.

## 1. Umfang und Bestandsgrenze

Der Kandidat enthält zwölf migrierte IVG-/AHVG-/UVG-Pfade und vier neue ELG-Pfade. Bundesregel, kantonale Anbindung, Feiertagsauflösung und konkrete Freigabe sind eigenständige Objekte. Die Bundesregeln sind kantonsneutral. Im C1-Kandidaten sind ausschliesslich begrenzte Berner Anbindungen vorbereitet. Eine bekannte Regel oder ein auflösbarer Kalender begründet keine operative Freigabe.

Manifest und Consumer verwenden `5.0.0`, die neue Komponente `ch-social-procedures` verwendet `1.0.0`. Der verbleibende Spezialregimekatalog bleibt auf `3.0.0`. Seine 33 übrigen Definitionen und 40 Regime werden erhalten. Die drei bisherigen sozialen `COURT-OTHER`-Sammelpfade werden als ausdrückliche Ausschlüsse im Sozialkatalog weitergeführt. Der beschaffungsrechtliche Sammelpfad `PROC-ADMIN-OTHER` bleibt im Restkatalog gesperrt. Die alte generische ATSG-Berechnung und die migrierten AP17-Zuordnungs-IDs dürfen im Format-5-Consumer keine Umgehung des Sozialresolvers eröffnen.

Die eingefrorenen AP19A-/AP19B-Vorlagen, bestehenden Datenreleases, Release-Pins, Webarchive und SPPKG bleiben unverändert. C1 aktiviert keine neuen Profile in E, Q oder P und verändert keine M365-Berechtigungen oder Mirrors.

## 2. Implementierungszuordnung

| Verantwortung | Implementierung und Nachweis |
| --- | --- |
| Formatgrenzen und geschlossene Datenstruktur | [Manifestformat 5](../../schemas/release-manifest-v5.schema.json), [Sozialverfahrenskatalog](../../schemas/social-procedure-catalog.schema.json) |
| Nationales Modell, Referenzen und kanonische Objektbindung | [socialTypes.ts](../../src/core/socialTypes.ts), [socialCatalog.ts](../../src/core/socialCatalog.ts) |
| Fallqualifikation, zeitliche Prüfung, Freigabesperren und Berechnung | [socialDeadline.ts](../../src/core/socialDeadline.ts), unter Nutzung des bestehenden Tagesfristenkerns |
| Hostneutraler Datenadapter | [data.ts](../../src/core/data.ts), [lokaler Kandidatenimport](../../src/release/ap19cCandidateData.ts) |
| Transport, Formatvalidierung und gemeinsame Aktivierungsgrenze | [ReleaseValidator.ts](../../spfx/src/core/ReleaseValidator.ts), [ReleaseService.ts](../../spfx/src/core/ReleaseService.ts) |
| Reproduzierbare Migration und separate Kandidatenablage | [Builder](../../scripts/build-ap19c-candidate.mjs), [Manifest](../../data/candidates/2026-09-25-ap19c1/manifest.json), [Sozialkatalog](../../data/candidates/2026-09-25-ap19c1/social-procedures/ch-social-procedures.json), [Buildnachweis](../../outputs/ap19c1-2026-09-25/build-verification.json) |
| Gemeinsame Oberfläche und explizite Auswahlabbildung | [socialUi.ts](../../src/ui/socialUi.ts), [vrpgSelection.ts](../../src/ui/vrpgSelection.ts), [FristenrechnerApp.tsx](../../src/ui/FristenrechnerApp.tsx), [UI-Vertrag](../../src/ui/README.md#ap19c1-nationaler-sozialresolver) |
| Quellenübernahme und zeitlicher Bindungsumfang | [frischer Quellenabgleich](../fachrecht/quellenabgleich-ap19c1.md), [maschinenlesbarer Nachweis](../../outputs/ap19c1-2026-09-25/source-review.json), [zeitliche Bindung](../fachrecht/zeitliche-bindung-ap19c1.md) |

Der Builder bindet die abgenommenen Ausgangsdateien und den neuen Quellenprüfnachweis per SHA-256. Referenzen auf Regel und Anbindung binden jeweils ID, Revision und kanonischen Objekt-Hash. Ein inkonsistenter oder unbekannter Vertrag wird zurückgewiesen. Eine erneute Erzeugung darf bestehende abweichende Dateien nicht überschreiben.

## 3. Zeit und fachliche Nachweisgrenze

Die positiv belegte Anwendbarkeit der C1-Anbindungen ist auf **1. Januar 2026 bis 31. Dezember 2027** begrenzt. Dieses konservative Anwendungsintervall behauptet weder das ursprüngliche Inkrafttreten noch ein rechtliches Ausserkrafttreten am Intervallende. Artikelbezogene Normbindung, Quellenabdeckung, Fallabdeckung und Berechnungshorizont bleiben getrennte Felder. Die [Zeitnotiz](../fachrecht/zeitliche-bindung-ap19c1.md) erläutert die genaue Belegung und den Umgang mit historischen Fassungen.

Vor der Übernahme wurden die für C1 relevanten Bundes- und Berner Originalquellen sowie der amtliche Zukunftsindex erneut geprüft. Frische Abrufe, bytegleiche Wiederverwendung und ausschliesslich aus AP19B übernommene historische Belege sind im Quellenbericht ausdrücklich unterschieden. Das ist keine neue Vollrecherche sämtlicher Sozialversicherungserlasse oder Rechtsprechung und keine zusätzliche AVIG-/KVG-Quellenfreigabe.

Beim ELG-Gerichtspfad hängen die erforderlichen Feststellungen nicht allein vom Sitz einer Verwaltungsstelle ab. Gerichtskanton, Wohnsitzkanton der Partei und der für die Zuständigkeit massgebende Beschwerdezeitpunkt werden getrennt geprüft. `jurisdictionReferenceDate` wird nicht aus der Eröffnung kopiert. Fehlende Angaben, eine Zeitlücke oder eine nicht unterstützte Konstellation ergeben kein Enddatum.

## 4. Bedienvertrag

Die gemeinsame Oberfläche behält das zweispaltige Raster und den bestehenden schmalen Einspaltenmodus. Die globale Feldbeschriftung lautet statisch «Verfahrenskontext» beziehungsweise «Contexte de la procédure». Feste Modellvoraussetzungen erscheinen als Text, nicht als Dropdown mit nur einem echten Wert. Es gibt keine zusätzliche Bestätigungscheckbox.

Nachtrag vom 27. September 2026: Die [beauftragte UI-Vereinfachung](../fachrecht/ui-vereinfachung-ap19c1-2026-09-27.md) entfernt bei den Format-5-Sozialpfaden das redundante Dokumentfeld aus dem Formular. Modellierte Zuständigkeit und ergänzende Fallvoraussetzungen stehen mit Dokumenttyp und Quellenbelegen in der zunächst geschlossenen Rechenspur. Beschwerdebeschriftungen unterscheiden knapp Verfügung und Einspracheentscheid. Die echten Fallangaben, die fachlichen Prüfungen und die Qualifikationsbasis bleiben unverändert. Der Nachtrag gilt nicht rückwirkend als Änderung der bisherigen Format-1-bis-4-Bedienung.

Nur Format 5 verwendet für die ausdrücklich zugeordneten Sozialpfade den neuen Resolver. Die bisherigen stabilen Auswahlen für IVG, AHVG und UVG bleiben erhalten, ELG wird ergänzt. Eine explizite Migration alter AP17-Standardwerte übernimmt nur die fachliche Auswahl bei exakt passendem Regime-/Definitionspaar. Fehlende oder widersprüchliche Kennungen werden nicht still korrigiert. Allgemeine, politische und beschaffungsrechtliche Pfade behalten ihren bisherigen Resolver.

Die fallbezogene Kantonswahl ist vom gespeicherten Verfahrenskontext unabhängig. Alle 26 Kantone sind als mögliche Fallangaben sichtbar, **nicht** als freigegebene Anbindungen. Die C1-Prüfung unterstützt nur die modellierten Berner Fälle. Wohnsitz, Zuständigkeitszeitpunkt und Feiertagsanknüpfung sind bei den betreffenden Pfaden echte zusätzliche Angaben. Sie und die Fristdaten werden nicht als persönliche Standards gespeichert.

Nachtrag vom 28. September 2026: Gemäss dem [Bedienentscheid zur frühen Datumseingabe](../fachrecht/datumseingabe-ap19c1-2026-09-28.md) ist das Datumsfeld bereits vor vollständiger Auswahl bedienbar. Gleiche Datumsbedeutung erlaubt den Erhalt beim Auswahlwechsel, eine andere Datumsart führt zum gezielten Leeren mit Hinweis. Gesetzliche Dauer ist fest, angeordnete Tagesdauer wird explizit eingegeben. Der unverändert als Kandidat gekennzeichnete Katalog sperrt die Berechnung trotzdem an der Freigabeprüfung. Die Vorschau unter `?candidate=ap19c1` enthält keine erfundene Freigabe. Ohne diesen Parameter bleibt MVP 0.4 geladen. Nur ein tatsächlich berechnetes Ergebnis kann einen Kalendereintrag erzeugen.

Produktbeschriftungen und Sperrmeldungen liegen auf Deutsch und Französisch vor. Die angezeigten Normverweise übernehmen bewusst den dokumentierten Original-Locator der Quelle, auch wenn dessen Artikeltitel auf Deutsch erfasst ist. Ein übersetzter UI-Text ist kein neuer amtlicher Quellennachweis.

## 5. Prüfungen und verbleibende Haltepunkte

Die Prüfsuiten unterscheiden echte Kandidatensperren und positive Berechnungsprüfungen mit ausdrücklich synthetischen Freigaben im Testspeicher. Letztere verändern weder die Kandidatendateien noch die Vorschau.

- [Buildertests](../../tests/core/ap19c-builder.test.ts): deterministische Bytes, kanonische Hashbindung, Rücklesen und Verweigerung abweichender Überschreibungen.
- [Resolvertests](../../tests/core/ap19c-social.test.ts): geschlossene Referenzen, Zuständigkeit, Zeit, Quellen, Feiertagsraum, Freigaben und fehlertolerante Sperren ohne Ersatzrechnung.
- [Integrationstests](../../tests/core/ap19c-integration.test.ts): bestehende allgemeine und nichtsoziale Ergebnisse, semantische Migration der alten Sozialfälle sowie abgenommene ELG-Sollwerte und Sperrfälle gegen die echte Engine.
- [UI-Tests](../../tests/ui/ap19c-social.test.ts): Auswahl und Standardmigration, Trennung von Auswahl und Fallangaben, notwendige Zeitanker, feste/angeordnete Dauer, Kandidatensperre und Ergebnis-/Exportfluss unter isolierter Testfreigabe.

Die lokalen Gesamt- und SPFx-Bundleprüfungen werden mit ihrem tatsächlichen Endstand im [abschliessenden C1-Prüfnachweis](../fachrecht/pruefbericht-ap19c1.md) ausgewiesen. Einzelne Browserproben ersetzen weder die vollständige spätere E-/Q-Prüfmatrix noch eine menschliche Fachabnahme. Dieser Implementierungsbericht enthält deshalb keine duplizierte Gesamttestzahl und erklärt AP19C1 nicht selbst für abgenommen.

Nach technischer Fertigprüfung folgt die gesonderte Kandidatenabnahme durch David Steimer. C2 und C3 benötigen ihren eigenen Start und ihre eigenen Nachweise. Datenpromotion, Veröffentlichung, Installation und Betriebsfreigabe bleiben nachfolgende, separat autorisierte Schritte.
