# AP20C1 EOG Integration und Consumer 6

Stand: 30. September 2026. **Lokal umgesetzt und technisch geprüft, zur fachlich-technischen Abnahme vorgelegt.** Auftrag von David Steimer: «Starte AP20C1». [Issue #41](https://github.com/davidsteimer/fristenrechner/issues/41), übergeordnet [#35](https://github.com/davidsteimer/fristenrechner/issues/35).

AP20C1 setzt den bestätigten [AP20B-Vertrag](sozialversicherungsvertrag-ap20b.md) und [DEC-2026-026](../entscheidungen/DEC-2026-026-beschluss.md) für den ersten Integrationsschritt um. Der gemeinsame Consumer unterstützt nun Manifest 6 und Sozialkomponente 2. Vier nationale EOG-Regeln und sechs Berner Anbindungen ergänzen den bestehenden Bestand. Die Integration ist noch keine operative Freigabe.

## Umfang und Bestandsschutz

| Bestandteil | Ergebnis |
| --- | --- |
| Formate | Sozialverfahrenskatalog 2.0.0, Manifest und Mindestconsumer 6.0.0 |
| Neue EOG-Pfade | Einsprache, ordentliche Beschwerde, angeordnete Verwaltungstagesfrist, eng begrenzte formelle Beschwerdeverbesserung |
| Berner Anbindungen | Zwei Verwaltungspfade, zwei Gerichtspfade nach kantonaler Kasse, zwei Gerichtspfade nach nichtkantonaler Kasse |
| Kandidatenbestand | 28 nationale Regeln und 34 Berner Anbindungen |
| Bisherige Objekte | 24 nationale Regeln und 28 Anbindungen einschliesslich Revisionen, Status, Zeitbindungen und Objekthashes unverändert |
| Andere Komponenten | Neun Datenartefakte byteidentisch zum freigegebenen MVP 0.5 |
| Freigabeverknüpfungen | 34 neue kandidatenspezifische Einträge, alle `candidate` und `approval: null`. Keine alte Freigabe wird auf das neue Release übertragen |
| Noch nicht integriert | FamZG/FLG in AP20C2, MVG/ÜLG in AP20C3. Diese Erlasse sind trotz vorbereitetem Format nicht im GUI auswählbar |

Der [Datenkandidat](../../data/candidates/2026-09-30-ap20c1/manifest.json) heisst `2026-09-30-ap20c1-candidate.1`. Manifest-SHA-256:

`deb308e319a47eaf80f9056b88ee2bc9ff56c0500e70269fb0bc54e91a1900b5`

Die nationale EOG-Regel enthält keine Berner Zuständigkeitslogik. Berner Fallanbindung, Feiertagsqualifikation und konkrete Freigabe bleiben getrennt. Die schweizweite Modellierbarkeit ist keine Freigabe weiterer Kantone.

## Bedienung

Die gemeinsame DE-/FR-Oberfläche bleibt zweispaltig. Datumseingabe und die vier bestehenden Aktionsschaltflächen bleiben erhalten. Verfahrensgegenstand und individuelle Eröffnung stehen fest im Formular. Dokumenttyp und modellierte Zuständigkeit werden nicht als zusätzliche Pflichtauswahl aufgebaut. Erläuterungen bleiben in der Rechenspur, es gibt keine neue Bestätigungscheckbox.

| Pfad | Erforderliche zusätzliche Fallangaben |
| --- | --- |
| EOG-Verwaltung | Wohnsitzkanton der anspruchsberechtigten Person bei fristauslösender Zustellung. BE ist Produktgrenze, kein behaupteter gesetzlicher Kassensitz |
| Gericht nach kantonaler Kasse | Kassenart, Kanton der tatsächlich zuständigen Ausgangskasse, Gerichtskanton und massgebendes Beschwerdedatum. Kein zusätzlicher BE-Wohnsitzfilter |
| Gericht nach nichtkantonaler Kasse | Kassenart, Gerichtskanton, Wohnsitz bei Beschwerdeerhebung und massgebendes Beschwerdedatum. Kein erfundener Kassenkanton |

In allen Pfaden bleibt die Feiertagsanknüpfung an Partei und Vertretung separat erforderlich. Bei einem Wechsel der Kassenart werden die abhängigen Fallangaben geleert. Das bereits eingegebene Zustelldatum bleibt erhalten, solange seine Bedeutung gleich bleibt. Zuständigkeitsdaten werden weder aus diesem Datum noch aus Standards abgeleitet.

Die Auswahl von Erlass und Handlung kann als Standard gespeichert werden. Kassenart, Kassenkanton, Wohnsitz, Gericht, Feiertagsbefund und konkrete Daten werden nicht gespeichert. Die zuständige Kasse muss für den Leistungsfall fachlich geklärt sein. Der Rechner erkennt insbesondere die EAK-Zuständigkeit bei Adoption nicht selbst aus einer Leistungsart.

## Technische Grenzen

Neue Schemata ergänzen die bestehenden Dateien, statt sie umzudeuten. Der Consumer verlangt die exakte Paarung Manifest 6 / Sozialkomponente 2. Manifest 5 / Sozialkomponente 1 sowie die historischen Formate 1–4 bleiben lesbar. Neue Werte werden im alten Komponentenformat abgewiesen. Ein neues Schema allein aktiviert keinen Erlass.

Der produktive Lader lehnt das Kandidatenmanifest bereits vor dem Abruf der Datendateien ab. Die explizite lokale Vorschau lädt den Kandidaten zur Bedienprüfung. Auch dort verhindert die fehlende operative Freigabe ein Fristdatum. Positive Berechnungstests verwenden ausschliesslich synthetische Freigaben im Arbeitsspeicher des Testlaufs. Keine solche Freigabe wird in Daten, Vorschau oder Produktcode geschrieben.

Der Builder ist reproduzierbar und überschreibt keine abweichenden bestehenden Kandidatendateien. Er prüft die gebundenen AP20B-Dateien und den DEC-Beschluss, bevor er schreibt. Historische Releases, bestehende Webpins, Spiegel und das bisherige SPPKG bleiben unangetastet. Der isolierte SPFx-Testbuild ist kein freigegebenes Installationspaket und vergibt keine neue Anwendungsversion.

## Quellen und Zeitfenster

Die [begrenzte Quellenkontrolle vor Integration](../fachrecht/quellenkontrolle-ap20c1.md) hat am 30. September 2026 keine Abweichung zu AP20B ergeben. Frisch verglichen wurden EOG/EOV/ATSG-Originale und die relevanten GSOG-/VRPG-Originale samt Fassungsinformationen. Der Nachweis unterscheidet frische Abrufe von der dokumentierten Wiederverwendung der übrigen Quellen.

Das geprüfte EOG-Fenster bleibt **01.01.2026–31.12.2027**. Die unveränderten tragenden Normen werden über die Konsolidierungswechsel hinweg mit Originalkette und Vergleich gebunden. Der Beginn dieses Nachweisfensters ist keine Behauptung eines gesetzlichen Inkrafttretens, das Ende keine behauptete Aufhebung. Auslöser, Bezugsdaten und vollständiger Rechenweg müssen gedeckt sein. Ein Ergebnis 2028 wird nicht durch einen Beginn 2027 legitimiert.

## Prüfresultate

| Prüfung | Ergebnis |
| --- | --- |
| Gesamte Kern- und UI-Regression | 1354 bestanden, 0 fehlgeschlagen |
| Darin neue Consumer-, EOG- und UI-Prüfungen | 137 bestanden, davon 60 literal vorgegebene Datumsvektoren über sechs EOG-Anbindungen |
| Bestandsresultate | Alle 28 bestehenden Anbindungen liefern dieselben Fristdaten und Rechenspuren |
| Governance-Regression | 133 bestanden, 0 fehlgeschlagen. Die 15 AP20B-Nachweisdateien bleiben unverändert |
| Öffentliche Webausprägung | 12 bestehende Tests bestanden, unveränderter produktiver Datenpin |
| SPFx-Quell- und Ladertests | 106 bestanden, davon 22 neue Transport-, Vertrags- und Bestandstests |
| Tatsächlich gebautes Produkt | 42 bestehende und 6 neue Prüfungen bestanden. Die sechs EOG-Anbindungen wurden auch mit dem emittierten Rechenkern geprüft |
| Technischer Build | Typprüfung, isolierter SPFx-Build, CSS-Prüfung und Testpaketprüfung bestanden |
| Lokaler Browser | DE-/FR-Darstellung, beide Kassenwege, unabhängiger Kassenkanton, Rücksetzen beim Routenwechsel, Erhalt des Zustelldatums, Kandidatensperre und leeres Datum nach Neuladen geprüft |

Die Zahlen sind ineinander enthalten und dürfen nicht addiert werden. Die 60 neuen Datumsprüfungen sind zehn abgenommene Datumsvektoren auf sechs Anbindungen, nicht 60 unabhängig entworfene Datumsprobleme. Kern- und UI-Tests prüfen zusätzlich fehlende, falsche und zusätzliche Fakten, nicht passende Dokumente, variable Tageszahlen, zeitliche Grenzen und das Ausbleiben eines Rückfalls auf allgemeines VRPG.

Die Browserkontrolle erfolgte lokal im In-App-Browser, nicht in SharePoint, Teams oder mit einem Gastkonto. Das Datum wurde mit nativen Tastaturereignissen geprüft. Ein blosses programmatisches Befüllen des Browserwerkzeugs hatte den React-Zustand zunächst nicht bestätigt. Daraus wurde kein Anwendungsfehler oder positiver Test abgeleitet. Nach Neuladen waren Datum und Fallangaben wieder leer. In der lokalen Browserkonsole wurden keine Warnungen oder Fehler gemeldet.

Der [Prüfnachweis](../../outputs/ap20c1-2026-09-30/pruefprotokoll.json) bindet die Kandidaten-, Quellen-, Implementierungs- und Testdateien. Der [Buildernachweis](../../outputs/ap20c1-2026-09-30/build-verification.json) enthält zusätzlich die einzelnen alten Objekthashes und die neun unveränderten Datenartefakte.

## Vorschau und Abnahme

Die lokale [EOG-Vorschau](http://127.0.0.1:8795/?candidate=ap20c1&qa=ap20c1-eog) wählt nur den EOG-Einsprachepfad vor, kein Datum und keine Fallbefunde. Ohne den Kandidatenparameter bleibt die Standardvorschau auf MVP 0.5.

Für die manuelle Prüfung sind insbesondere sinnvoll:

1. Einsprache und angeordnete Verwaltungsfrist ohne unnötige Kassenauswahl ansehen.
2. Beschwerde nach kantonaler und nach nichtkantonaler Kasse umschalten. Kassenkanton und Wohnsitz müssen passend ein- und ausgeblendet werden.
3. Frühes Zustelldatum, getrenntes Beschwerdedatum und DE-/FR-Texte prüfen.
4. Bei vollständigen Angaben die ausdrückliche Kandidatensperre erwarten, nicht ein produktives Fristende.

Offen ist die **fachlich-technische Abnahme von AP20C1 durch David Steimer**. Danach kann AP20C2 separat starten. Quellenreleasefreigabe, Datenpromotion, endgültige Builds, Quellveröffentlichung und E-/Q-/P-Bereitstellung bleiben spätere Schritte. GitHub dient hier nur zur Statusnachführung der Issues. Es wurde kein Quellcode-Commit gepusht.

Codex erstellt und prüft als KI-Arbeitsinstrument ohne formelle Freigabe- oder Haftungsverantwortung. Die Arbeitspaketabnahme bleibt bei David Steimer.
