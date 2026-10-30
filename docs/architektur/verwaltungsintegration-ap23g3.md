# AP23G3 Lokale Integration Uri Solothurn und Schaffhausen

Stand: 22. Oktober 2026. Auftraggeber und menschlicher Entscheider: David Steimer. **Lokaler Integrationskandidat zur fachlich-technischen Abnahme, keine operative Freigabe.** Die [G2-Abnahme](../fachrecht/abnahme-ap23g2.md) und der [Beschluss DEC-2026-036](../entscheidungen/DEC-2026-036-beschluss.md) sind getrennt festgehalten. Die ursprünglichen G2-Vorschlagsbytes bleiben unverändert archiviert. MVP 0.9 bleibt der freigegebene Betrieb.

## Umfang und Bedienung

Der native Format-11-Reader integriert Katalog 4 mit **58 Pfaden**. Die 16 neuen UR-/SO-/SH-Gruppen ergänzen die 42 unveränderten bisherigen Definitionen. Bern bleibt das separate Bestandsprofil. Die Tagesarithmetik und grundlegende Feiertagserzeugung werden nicht verändert.

| Kanton | Neue Wege | Wesentliche Grenze |
| --- | --- | --- |
| UR | Verwaltung und Gericht je ordentliche Zwanzigtagebeschwerde und angeordnete Tagesfrist. Zusätzlich zehntägiges administratives Begründungsverlangen | Art. 22 nur als Hinweis am Eröffnungstag, keine Datumsänderung. Konkret ungeklärte zusätzliche lokale Endtagswirkung gesperrt. Koordinationsgrenze nur bei den beiden ordentlichen Beschwerdewegen |
| SO | Verwaltung und Gericht je ordentliche Zehntagebeschwerde und angeordnete Tagesfrist. Zusätzlich zehntägiges administratives Begründungsverlangen | Das Begründungsangebot muss ausdrücklich vorliegen. Eigene kantonale Prozessfeiertage, nicht freie Vereinigung regionaler Ruhetage |
| SH | Verwaltung und Gericht je ordentlicher Zwanzigtageweg und angeordnete Tagesfrist. Zusätzlich administratives Begründungsverlangen zehn Tage und Begründungsverlangen beim selben Obergericht 30 Tage | Keine Umrechnung von 48 Stunden in zwei Tage. Angebot im administrativen Begründungsweg erforderlich. Gerichtsort und Verwaltungspraxis getrennt |

Der zweispaltige Aufbau, das früh bedienbare Datum und die vier Schaltflächen bleiben erhalten. Es gibt keine zusätzlichen Dokument-, Feiertagskanton- oder Zielorgan-Dropdowns. Bei den sechs neuen ordentlichen Rechtsmittelwegen unterscheidet das vorhandene Feld **Fallkonstellation** zwei ausdrückliche positive Sachlagen: ursprünglich begründeter Entscheid oder spätere vollständige Begründung nach nachweislich rechtzeitigem Verlangen. Unbekannte oder abweichende Fälle erzeugen keine positive Qualifikation.

Ein Begründungsverlangen und das spätere Rechtsmittel sind getrennte Handlungen. Das spätere Eröffnungsdatum wird nicht aus einem Gesuchsdatum abgeleitet. Die zwei positiven Optionen bestätigen aktuelle Falltatsachen, nicht eine in Standards gespeicherte Zustimmung. Pfad- und Stufenwechsel setzen diese Bestätigung zurück.

Deutsch und Französisch sind integriert. Zusatzwissen und lesbare Quellenlinks stehen in der Rechenspur beziehungsweise Berechnungsgrundlage. Der Urner Hinweis verändert kein Datum. Die SH-Verwaltungsrechenspur zeigt die eigene VRG-/RTG-/BGer-Praxisbindung und die begrenzte nicht tragende Belegrolle. Der historische gerichtliche OGE-Beleg der physischen Generatorherkunft wird nicht als administrative Rechtsgrundlage ausgegeben.

## Daten und geschlossene Laufzeit

Kandidat: `data/candidates/2026-10-22-ap23g3/`, Releasekennung `2026-10-22-ap23g3-candidate.1`. Manifest und Mindestconsumer sind 11.0.0, Kantonalverfahrenskatalog 4.0.0. Eine neue App-, Paket- oder reguläre Releaseversionsnummer ist damit nicht festgelegt.

Der Kandidat enthält 42 Datendateien plus Manifest, elf Katalogerlasse, 20 Stillstandsprofile, 13 administrative Feiertagsverwendungen und 33 physische Kalender. **40 Artefakte bleiben bytegleich zum F3-Ausgangspunkt**, darunter der Feiertagskatalog, sämtliche Kalender, die fünf Rechtsprofile und der Spezialregimekatalog. Nur Verwaltungs- und Sozialkatalog werden auf die neue tatsächliche Zielbindung fortgeschrieben. Die 479 Feiertagsbasisregeln, zwölf gesonderten SO-Regeln, 44 Sozialregeln und 50 Berner Anbindungen bleiben fachlich unverändert.

Manifest SHA-256: `bf710be1a5e58b540d644e4dace885eed4dbe998a431badb9eec07032ea6bada`.

`physicalBaseline` bindet die tatsächlichen G3-Komponenten. Die vier neuen `physicalReuse`-Angaben bewahren die geprüfte historische F3-Herkunft. Gleiche Datumsbytes vererben weder eine ZPO- noch eine andere Verfahrensberechtigung. Zielrelease, Rollen, Originalbytes, Schemas, Pfad-, Policy- und Komponentenhashes werden geschlossen geprüft.

Der neue Reader und seine Factory besitzen eine eigenständige Laufzeitidentität. Ein Katalog 4 wird nicht in einen alten Reader umgeformt. Kopierte, serialisierte, abgeleitete oder über Proxy dargestellte Kontexte sind keine Rechen- oder Exportfähigkeit. Aktuelle V4-Fakten sind nur dort erforderlich, wo der gewählte Pfad sie benötigt. Fehlende, zusätzliche, unbekannte oder negative Fakten werden nicht aus Defaults ergänzt.

Persönliche Standards bleiben Version 5. Kanton, Erlass, Pfad, Revision und Stufe dürfen erhalten bleiben. Eröffnungsherkunft, Rechtzeitigkeit eines Vorverlangens, lokale Einzelfallwirkung, Koordination, besondere Einwände, Datum und Referenz werden nicht gespeichert. Ein alter Reader ersetzt unbekannte neue Pfade nicht stillschweigend durch ähnliche Altwege.

## Fachgrenzen und Export

Das vollständige neue Fallfenster bleibt **29.08.2026–31.12.2027**. Eröffnung, sämtliche Zähl- und Stillstandstage sowie Endverschiebungen müssen durch die jeweils anwendbaren Norm-, Quellen-, Kalender- und Releasegrenzen gedeckt sein. Die Sozialfreigaben bleiben auf Bern und 2026–2027 beschränkt.

Die sieben neuen Gerichtsgruppen bleiben bei der abgenommenen reinen Endverschiebung in neu beginnende Ferien gesperrt. Kein definitives Datum und kein Export. Das ist eine begrenzte Produktabdeckung, keine Behauptung gesetzlicher Unberechenbarkeit. Die bestehenden TI-/AR-/F1-Grenzen und die vier Januarvergleichsgrenzen bleiben erhalten.

**Sämtliche Kalenderexporte sind in der lokalen G3-Ansicht gesperrt**, auch bei den Bestandsverfahren. Das entfernt keine Funktion aus dem Betrieb von MVP 0.9. Synthetisch freigegebene Testhüllen existieren ausschliesslich im Testspeicher und sind weder ein Quellenentscheid noch ein installierbarer Datenrelease.

## Technische Nachweise

Der [Gesamtnachweis](../../outputs/ap23g3-2026-10-22/QA-AP23G3.json) bindet TypeScript, reproduzierbaren Datenbau, Produktregression, Host-Lebenszyklus, tatsächlichen minifizierten Webbuild, unabhängige Pythonprüfung und das G2-Archiv. Der [isolierte SPFx-Bau](../../outputs/ap23g3-2026-10-22/spfx-build.json) und die [Prüfung des tatsächlichen Pakets](../../outputs/ap23g3-2026-10-22/actual-package.json) sind davon getrennte Nachweise. Das Betriebspaket wird nicht überschrieben.

| Prüfung | Ergebnis |
| --- | --- |
| Produktregression | 3’008 bestanden, keine übersprungenen Fälle |
| Darin neue Tests | 151 Kern-, zehn Daten- und 19 UI-Tests. Teilmengen der Produktregression, nicht zusätzlich zu zählen |
| Abgenommene G1-Erwartungen im nativen Rechenkern | 115 bestätigt, davon 70 Datumssollwerte, sieben Kollisions-, 34 Qualifikations- und vier Fenstergrenzen |
| Ergänzender Format-11-Runtimevergleich | Vier weitere Tests. 104 Bundesverfahrenspaare, alle 50 Berner Sozialbindungen, Januar-/Regional-/Zeitfenstergrenzen und bestehender VRPG-Spezialweg gegen den nativen Format-10-Stand |
| Host-Lebenszyklus Formate 9 bis 11 | 30 bestanden |
| Tatsächlicher minifizierter Webbuild | 13 bestanden |
| Unabhängige Python-Datenprüfung | Sechs Tests bestanden, einschliesslich tatsächlicher Rohbytes, Schemata aller 42 Artefakte und neu versiegelter Negativvarianten |
| G2-Abnahmeverfahren | 27 Positiv- und Negativtests bestanden. 84 Archivpayloads autonom rückgeprüft |
| Isolierte SPFx-Provider-/Integrationstests | 237 bestanden |
| Tatsächlich erzeugtes SPFx-Paket | 170 bestehende und sechs neue Paketprüfungen bestanden, keine übersprungenen Fälle |
| Kompilierung, CSS-Prüfung und isolierte Paketbildung | Bestanden, 49 nicht blockierende Lintmeldungen im Protokoll |

Der [ergänzende Kerngegenreview](../../outputs/ap23g3-2026-10-22/independent-core-review.md) prüft zusätzlich unter anderem 192 einzeln entfernte Pflichtfakten, sechs Kontextfälschungen und zehn konsistent neu versiegelte semantische Änderungen. Das ist eine technische KI-Gegenprüfung und kein menschliches Vieraugenprinzip. Sie ersetzt nicht die G1-Fachabnahme.

Der erste minifizierte Webtest las den verzögert gerenderten Fluent-MessageBar-Text zu früh. Nach tatsächlichem Abwarten und ohne Produktänderung ist der Test bestanden. Ein während der Umsetzung erkannter impliziter Zeichenkettenumwandlungspfad bei `openingOrigin` wurde durch strikte Wertevergleiche geschlossen und mit umhüllten Zeichenketten sowie eigenen `toString`-/`valueOf`-Objekten geprüft. Dieser Befund ist nicht offen. Frühere unvollständige Testinputs sind keine behaupteten Produktfehler und kein grüner Gesamtnachweis.

Der [lokale Abschluss](../../outputs/ap23g3-2026-10-22/local-completion.json) bindet die endgültigen Prüfeingänge, tatsächlichen Artefakte und ergänzenden Runtime-/Paketnachweise. 719 vorab geschützte Bestandsdateien bleiben unverändert, einschliesslich alter Formate, G2-Evidenz, F3-Kandidat, Betriebspaket, Produktpins und des bereits vor G3 geänderten Projektplans. Node 22.23.2 und npm 10.9.8 werden verwendet.

## Prüfvorschau und Abnahme

[Lokale AP23G3-Vorschau](http://127.0.0.1:8804/fristenrechner/). Falls der lokale Prozess beendet wurde, im Projektordner mit der eingerichteten Node-22-Toolchain `npm run preview:ap23g3` starten. Keine realen Falldaten verwenden.

| Auswahl und rechtlich massgebendes Empfangsdatum | Erwartung |
| --- | --- |
| UR, Verwaltung, ordentliche Beschwerde, 02.10.2026 | 20 Tage, 22.10.2026 |
| UR, Verwaltung, ordentliche Beschwerde, 23.12.2026 | 12.01.2027 mit Art.-22-Hinweis, ohne zusätzliche Pause |
| SO, Verwaltung, angebotene Begründung verlangen, 02.10.2026 | Zehn Tage, 12.10.2026 |
| SH, Gericht, Begründung beim selben Obergericht verlangen, 02.10.2026 | 30 Tage, 02.11.2026 |
| SH, derselbe Begründungsweg, 18.02.2027 | Abgenommene Endverschiebungskollision, kein definitives Fristresultat und kein Export |

Jeweils die zutreffende aktuelle Fallkonstellation wählen. Bei den ordentlichen neuen Rechtsmittelwegen beide positiven Eröffnungslagen prüfen. Nach «Als Standard speichern» und Neuladen dürfen stabile Auswahlen erhalten bleiben, Datum und Fallbestätigung dagegen nicht.

Die tatsächliche lokale Browseransicht ist auf Deutsch und Französisch visuell geprüft. Daraus folgt keine erneute reale iPad-, M365- oder Gastabnahme. Die G3-Integration und das Arbeitspaket werden David gesondert zur fachlich-technischen Abnahme vorgelegt. Danach folgt die nächste begrenzte Kantonstranche, kein automatischer Zwischenrelease.

Es gab keinen Commit, Quellpush, Quellenpromotion, Upload, Installation oder Mirrorwechsel. E/Q/P, AP5, AP21, Berechtigungen, Hosting und der MVP09-Betrieb bleiben unverändert. Die öffentliche Issue-Statusführung ist von einer Quellpublikation getrennt.
