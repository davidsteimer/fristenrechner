# MVP 0.6 Fortschreibung der Testverträge

Stand: 1. Oktober 2026. Diese Notiz erklärt die begrenzten Anpassungen bestehender Tests während der lokalen MVP-0.6-Releasevorbereitung. Historische Daten und Abnahmen bleiben historische Referenzen. Tests des normalen Anwendungseinstiegs müssen dagegen den neu freigegebenen lokalen Datenstand prüfen. Die Anpassungen ändern weder Fachregeln noch Referenztermine und erteilen keine Installations- oder Publikationsfreigabe.

## Historische Governance weiter gegen den richtigen Stand prüfen

Die MVP-0.5-Tests dürfen nicht verlangen, dass ein später freigegebenes, lebendes Quellenregister dauerhaft beim damaligen Umfang bleibt. Die beiden betroffenen Tests verwenden deshalb jetzt den exakt hashgebundenen historischen Register- und Indexstand. Die ursprünglichen Testdateien und die Änderungen sind im [Fortschreibungsnachweis](../../outputs/release-mvp06-2026-10-01/historical-test-baseline/manifest.json) dokumentiert.

- [mvp05-source-approval.test.mjs](../../tests/governance/mvp05-source-approval.test.mjs) prüft weiterhin das damalige Register mit 57 Quellen. Quellenabnahme, Berechtigungsgrenzen und Reproduzierbarkeit der damaligen Vorbereitung bleiben Gegenstand der bestehenden Prüfungen.
- [test_source_reviews_mvp05.py](../../tests/governance/test_source_reviews_mvp05.py) verwendet den gebundenen historischen Index und genau die drei damaligen Ereignisse. Schema-, Inhalts-, Verknüpfungs- und Negativprüfungen bleiben erhalten.
- Der neue aktive Stand mit 81 Registereinträgen und vier Ereignissen wird separat durch die [MVP-0.6-Governanceprüfungen](../../tests/governance/test_source_reviews_mvp06.py) geprüft. Der historische Test wird dadurch nicht zur Obergrenze des künftigen Registers.

Die archivierten Vorlagen werden nicht überschrieben. Auch die ursprüngliche Eingangssicherung mit 180 Belegdateien und 85 historischen Archiven bleibt unverändert. Der neue Anpassungsnachweis ergänzt diese Sicherung, er ersetzt sie nicht.

## Präzise AP20B-Ausnahme für einen nicht operativen Referenzbeleg

Die frühere Zeichenkettenprüfung in [ap20b-references.test.mjs](../../tests/governance/ap20b-references.test.mjs) untersagte AP20B-Testpfade überall, auch als nachvollziehbaren Nachweis einer abgenommenen Referenzsuite. Das neue Release enthält einen solchen Nachweis in seinen Freigabemetadaten. Ein Testpfad dort ist kein ausführbarer Bestandteil der Fristberechnung.

Erlaubt ist ausschliesslich der Eintrag unter `extensions["steimer.approval"].referenceSuites["AP20B-SOCIAL-DATES-1"]` mit exakt diesem Inhalt:

- Pfad `tests/golden/candidates/ap20b-social-dates.json`
- SHA-256 `9740ce84883a54beec81f2f8a6cb1c450d690c9b6f440c5841d5821dfad16fa3`

Der tatsächliche Dateihash wird zusätzlich geprüft. Danach wird nur dieser exakt validierte Metadateneintrag aus der Prüfkopie entfernt und die übrige Sperrprüfung unverändert angewandt. Es gibt keine allgemeine Ausnahme für Erweiterungen oder Freigabemetadaten.

Produktive Artefaktverweise, sämtliche Artefaktinhalte, Laufzeitquellen und Schemas werden weiterhin auf verbotene AP20B-Testpfade und den Namen des Referenzprüfers geprüft. Neue Negativfälle weisen einen falschen Hash, einen Testdatensatz als Laufzeitartefakt, denselben Verweis an anderer Metadatenstelle und einen eingeschleusten Prüferskriptnamen zurück. Original- und Folgehash sowie der genaue Umfang stehen im [AP20B-Testnachtrag](../../outputs/release-mvp06-2026-10-01/historical-test-baseline/ap20b-reference-test-adaptation.json). Die akzeptierten AP20B-Verträge und literalen Sollwerte bleiben unverändert.

## Historische AP20-Kandidaten reproduzierbar erhalten

Die drei Kandidatenbuilder C1, C2 und C3 prüfen ihr ursprüngliches AP20B-Eingangsprotokoll einschliesslich der damals gebundenen Testdatei. Nach der vorstehenden Fortschreibung ist die lebende Testdatei berechtigterweise nicht mehr bytegleich mit dieser historischen Eingabe.

Der neue [gezielte Eingabeleser](../../scripts/read-frozen-ap20b-input.mjs) löst deshalb genau diesen einen bekannten Testpfad vor dem Lesen auf dessen bestehendes Archiv auf. Erwartet bleiben der ursprüngliche Hash `e67a13560a8b16d9432bed767861b55b561c3c834dd29eef7c1281c75e5e0b3b` und 13 611 Bytes. Alle anderen Eingaben behalten ihren ursprünglichen Pfad und Hash.

Dies ist kein Rückfall nach einer fehlgeschlagenen Hashprüfung. Ein fehlendes oder verändertes Archiv, ein anderer erwarteter Hash und unzulässige Pfade führen zum Abbruch. Ein beliebiger Hashkonflikt darf keine Archivsuche auslösen. Der [Buildernachtrag](../../outputs/release-mvp06-2026-10-01/historical-test-baseline/ap20-candidate-reproduction-addendum.json) bindet die alten und neuen Builder, den Eingabeleser und die gezielten Nachweise. Die [Negativtests des Eingabelesers](../../tests/governance/ap20b-historical-input.test.mjs) prüfen diese Grenzen ausdrücklich. Kandidatendaten und historische Prüfprotokolle werden nicht neu freigegeben oder umgeschrieben.

## Lebende Einstiegstests auf MVP 0.6 beziehen

Nur Aussagen über den heutigen normalen Einstieg werden von MVP 0.5 auf MVP 0.6 fortgeschrieben. Der explizite Aufruf historischer Kandidaten bleibt getrennt und deren Freigabesituation unverändert.

| Betroffene Tests | Begrenzte Fortschreibung und erhaltene Schutzwirkung |
| --- | --- |
| [ap20c1-eog.test.ts](../../tests/ui/ap20c1-eog.test.ts) | Genau die erwartete normale Vorschauquelle wechselt auf `mvp06CalculationData`. Die explizite C1-Auswahl und deren Ausschluss aus öffentlichem Einstieg und Webpart bleiben geprüft |
| [mvp05-release.test.ts](../../tests/ui/mvp05-release.test.ts) | Nur der Test für den normalen öffentlichen und Vorschau-Einstieg folgt MVP 0.6. Die übrigen Tests prüfen weiterhin echte MVP-0.5-Daten, deren Artefakthashes, 28 damalige Anbindungen und getrennte Kandidaten |
| [public-app/build.test.ts](../../tests/public-app/build.test.ts) | Normaler Build erwartet Version `0.6.0` und Release `2026-10-01-mvp-06-approved.1`. Die Prüfungen lokaler Assets, fehlender QA-Vorgaben, Sicherheitskonfiguration und getrennter historischer Builds bleiben bestehen |
| [public-app/ap19c3-build.test.ts](../../tests/public-app/ap19c3-build.test.ts) | Der Vergleich zum heutigen normalen Einstieg und Datenpin folgt MVP 0.6. Der historische AP19C3-Build bleibt Kandidat mit unverändertem Manifesthash und gesperrten Sozialpfaden |

Die beiden UI-Originale sind nachvollziehbar gesichert:

- [AP20C1-Original](../../outputs/release-mvp06-2026-10-01/historical-baseline/tests/ui/ap20c1-eog.test.ts), SHA-256 `aa695632d4cd80222c7af03bae3d1210dba4c5ea56506d1ecd79c395d48d028f`, bereits Teil der historischen Eingangssicherung.
- [MVP-0.5-UI-Original](../../outputs/release-mvp06-2026-10-01/test-history/tests/ui/mvp05-release.test.ts), SHA-256 `0f59dad0996583f46c9bc616916fea4e7500770842acd600e3727a5772f008e6`, separat vor der Anpassung gesichert.

## Reichweite der Nachweise

Diese Notiz ist keine pauschale Bestätigung der gesamten Testsuite. Die gezielten Test- und Reproduktionsnachweise stehen in den verlinkten Anpassungsbelegen. Daneben ist der separate lokale SPFx-Lauf `.work/mvp06-spfx-build-eeFQm7` abgeschlossen. Seine `verification.json` weist alle fünf Schritte mit Rückgabecode 0 aus. `step-1.log` dokumentiert 145 bestandene Loaderprüfungen und `step-5.log` 68 bestandene Prüfungen des tatsächlich gebauten Consumers, jeweils ohne Fehler oder abgebrochene Tests.

Diese lokalen Buildbelege weisen weder eine SharePoint-/Teams-Installation noch eine öffentliche Bereitstellung nach. Die hierfür weiterhin nötigen Schritte und Freigaben stehen im [Deploymentplan](../betrieb/deployment-mvp-06.md) und in der [E-/Q-Prüfvorlage](../betrieb/pruefmatrix-mvp06.md).
