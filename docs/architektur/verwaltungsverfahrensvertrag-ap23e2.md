# AP23E2 Qualifikation und Datenkandidat der zweiten Verwaltungstranche

Stand: 18. Oktober 2026. **Vorlage zum technischen Entscheid DEC-2026-033, noch nicht beschlossen.** [AP23E1 ist fachlich abgenommen](../fachrecht/abnahme-ap23e1.md), einschliesslich AR-Fünftagesrekurs, Zeitfenstern und begrenzter Sperrbehandlung AR-O1. AP23E2 ist ausdrücklich gestartet. Die Produktintegration gehört zu AP23E3.

## Ergebnis und technischer Entscheid

Fristdauer, Stillstände, Feiertagszuordnung und Zeitfenster der neuen LU-/ZG-/AR-Verfahren passen bereits in die bestehenden Rechenparameter. Der bisherige Datenvertrag kann jedoch die neu abgenommenen Grenzen nicht vollständig als überprüfbare Fallvoraussetzungen ausdrücken. Es fehlt insbesondere die Trennung von Endentscheid, qualifizierter Vollstreckungsverfügung und Zahlungsaufforderung. Ein neuer Name unter einem alten Pfad würde diese Lücke nicht schliessen.

Vorgeschlagen werden **Kantonalverfahrenskatalog 2.0.0 sowie Manifest und Mindestconsumer 9.0.0**. Die Änderung betrifft die ausdrückliche Qualifikation des konkreten Falls, nicht einen neuen Zählalgorithmus. Die zwölf bisherigen TI-/GR-Pfaddefinitionen bleiben unverändert. Die dreizehn neuen Wege erhalten eigenständige, geschlossene Qualifikationsregeln.

| Bestandteil | Vorschlag für AP23E2 |
| --- | --- |
| Kantonalverfahrenskatalog | 2.0.0 mit verpflichtenden pfadbezogenen Qualifikationsregeln und deren Prüfsummen |
| Manifest und Mindestconsumer | 9.0.0 als eindeutige Grenze gegenüber älteren Lesern |
| Bisherige Rechtsprofile | 1.0.0 unverändert, fünf Profile |
| Feiertagskatalog und Regelkalender | 2.0.0 und 3.0.0 unverändert, bestehende Feiertagsregeln und 32 Kalender |
| Spezialregime und Sozialverfahren | 3.0.0 und 2.0.0 unverändert, 44 nationale Sozialregeln und 50 BE-Anbindungen |
| Persönliche Vorgaben | Version 5 unter bestehendem eigenem Schlüssel. Keine Speicherung aktueller Fallbestätigungen |
| Produktversion | Noch nicht durch diesen technischen Vertrag bestimmt. MVP 0.9 bleibt Planungsbezeichnung |

Die konkrete [Entscheidvorlage DEC-2026-033](../entscheidungen/DEC-2026-033-qualifizierte-kantonalverfahren-v2.md) ist separat zu bestätigen. Die Fachabnahme von E1 ersetzt diesen technischen Beschluss nicht.

## Nachgewiesene Vertragslücke

Im bestehenden Katalog 1 ist `action` eine Zeichenkette. Der Rechenkern erhält eine Pfadauswahl, jedoch keine davon unabhängig prüfbare aktuelle Fallhandlung. `qualification.generalRoute: qualified` bezeichnet eine bereits erfolgte Qualifikation, enthält aber keine strukturierte Information über die neuen Abgrenzungen. Der geschlossene bisherige Input besitzt keine Felder für Endentscheid, Art.-63-Verfügung, Belehrung oder Friständerung.

| Neue abgenommene Grenze | Bestehender Vertrag | Erforderliche Behandlung |
| --- | --- | --- |
| Ordentlicher Rechtsmittelweg nur gegen qualifizierten Endentscheid | Keine ausdrückliche Entscheidart im Input | Zwischenentscheid, unklare Entscheidart oder andere Handlung sperren |
| AR-Fünftagesrekurs | Gesetzliche Zahl 5 darstellbar, Vollstreckungsqualifikation nicht ausdrückbar | Art.-63-Verfügung, Handlung und Rekursstufe gemeinsam prüfen |
| Angeordnete Verfahrenseingabe, keine Zahlung | `evidenceAdvance: false` schliesst nicht alle Zahlungen aus | Eingabe, Kostenvorschuss, Zahlung und materielle Erfüllung nicht gleichsetzen |
| Vollständige Eröffnung und unbestrittene Belehrung | Nur allgemeine qualifizierte tatsächliche Zustellung | Dispositiv, mündliche Eröffnung, fehlende oder fehlerhafte Belehrung gesondert sperren |
| Keine verkürzte oder nachträglich geänderte Frist | Dauervergleich allein erkennt nicht alle Fälle | Verkürzung, Erstreckung und Wiederherstellung ausdrücklich abgrenzen |

Diese Anforderungen gelten für die **neuen LU-/ZG-/AR-Wege**. Die bisherigen TI-/GR-Sonderpfade, insbesondere der positiv aufgenommene Tessiner Prozesskostenvorschuss und Bündner Zwischenentscheidwege, werden nicht pauschal ausgeschlossen.

## Pfadgebundene Qualifikationsregeln

Die neue Pflichtliste `qualificationPolicies` enthält genau eine Regel je `pathId` und `pathRevision`. Sie bindet den Definitionshash des Pfads. Jede Einzelpfadbindung im Release enthält zusätzlich `qualificationPolicySha256`. Fehlende, doppelte, fremde oder nicht übereinstimmende Regeln sind ungültig.

| Zweig | Zulässiger Bestand | Behandlung |
| --- | --- | --- |
| `legacyV1` | Ausschliesslich die zwölf unveränderten MVP-0.8-Pfade mit exakter Revision und Definitionsprüfsumme | Bestehende Qualifikationssemantik erhalten, keine neuen Falltatsachen hinzuerfinden |
| `qualifiedDayProcedure` | Die dreizehn abgenommenen neuen Wege | Handlung, Entscheidqualifikation und aktuelle Fallvoraussetzungen geschlossen prüfen |

Der Altzweig ist kein frei verwendbarer Ausnahmeschalter. Neue LU-/ZG-/AR-Wege dürfen sich auch mit neu berechneten Prüfsummen nicht zu `legacyV1` erklären. Der zulässige Ausgangsbestand ist auf den MVP-0.8-Katalog mit SHA-256 `2f434968628c951a2e15eb62c5f3e0d5d906fa476b1c66387076a3e9727ce3f7` begrenzt. Eine spätere fachliche Änderung einer Qualifikationsregel benötigt eine neue Pfadrevision und Freigabebindung.

Die neue Regel unterscheidet drei Fälle:

| Handlung | Entscheidqualifikation | Weitere Voraussetzungen |
| --- | --- | --- |
| Ordentliches Rechtsmittel | Endentscheid | Vollständige tatsächliche Eröffnung, unbestrittene Belehrung, unveränderte gewöhnliche Tagesfrist |
| AR-Vollstreckungsrekurs | Qualifizierte Vollstreckungsverfügung nach Art. 63 VRPG | Zusätzlich richtige Rekursstufe und gebundene Fünftagesfrist |
| Angeordnete Verfahrenseingabe | Endentscheidqualifikation nicht anwendbar | Tatsächlich angeordnete Tageszahl, keine Zahlung oder materielle Erfüllung |

Sitz und Stufe, besondere Bundesnormen, abweichende Feiertagsregeln, Fixtermine, abweichender Fristbeginn und die zeitliche Deckung werden zusätzlich geprüft. Fehlende oder unbekannte Fallangaben werden nicht zu positiven Bestätigungen ergänzt.

Das [Inputschema](../../schemas/candidates/ap23e2/administrative-input-v2.schema.json) ist eine **isolierte Vertragsprobe**, noch keine öffentliche Produkt-API. Seine flache Form dient den Forschungsfällen. Die spätere produktive Anbindung behält eine geschlossene Auswahl aus Erlass, Pfad, Revision und Stufe. Der qualifizierte Kontext muss an den tatsächlich geprüften Katalog und seine Qualifikationsprüfsumme gebunden sein. Ein kopiertes oder serialisiertes Objekt darf keine Laufzeit- oder Exportberechtigung erzeugen.

## Kalender Quellen und Zeitbindung

Der Kandidat enthält fünf Erlasse, 25 Pfade, acht Stillstandsprofile, fünf rechtliche Kalenderverwendungen und 25 Qualifikationsregeln. Die drei neuen Kalenderverwendungen verwenden die in E1 geprüften Projektionen für LU, ZG und AR. Keine Vereinigung konkurrierender Listen, kein erster Treffer und kein stiller BE-/CH-Ersatzwert.

Die bestehenden TI-/GR-Verwendungen im MVP-0.8-Katalog führen teilweise noch MVP-0.7-Herkunftsreferenzen. Ein blosses Anhängen von MVP-0.8-Referenzen für LU/ZG/AR ergäbe widersprüchliche Hashes für dieselben gemeinsamen CH-Komponenten. Der Strukturkandidat bezieht deshalb **alle fünf physischen Herkunftsbindungen konsistent auf die gesicherten MVP-0.8-Dateien**. Die rechtliche TI-/GR-Verwendung, Pfade und Stillstände bleiben gleich. Die Hashes der veränderten Bindungsobjekte werden neu berechnet. Der alte Katalog bewahrt seine historischen Herkunftsangaben unverändert.

Neue Verwaltungsquellen erhalten eigene, nachvollziehbare Herkunfts-IDs. Bereits bestehende Feiertagsquellen werden weder umbenannt noch durch neue Prüfbehauptungen überschrieben. Dies ist besonders für die Luzerner Feiertagsfassung vom 27. September 2026 wichtig. Die Bundesfeiergrundlage wird mit ihrem bestehenden Nachweis wiederverwendet. Die E1-Fachprüfung wird nicht als neue vollständige Releasequellenprüfung aller Komponenten ausgegeben.

Die beschlossenen Fachfenster sind verbindlich:

- LU: **27.09.2026–31.12.2027**.
- ZG und AR: **29.08.2026–31.12.2027**.
- Unveränderte TI-/GR-Fenster und Sozialgrenzen bleiben erhalten.

Zustellung, gezählte Tage, übersprungene Stillstandstage und Endverschiebung müssen im jeweiligen Schnitt von Fall-, Berechnungs-, Quellen-, Norm-, Gebiets- und Releaseabdeckung liegen. Die Untergrenze der Normfassung ist nicht gleichbedeutend mit dem ursprünglichen Inkrafttreten aller verwendeten Einzelregeln. Zukunftsberechnungen beruhen weiterhin auf der ausdrücklich gekennzeichneten Fortgeltungsannahme.

AR-O1 verwendet die vorhandene ausdrückliche Sperrregel `blockWhenEnteringApplicableSuspension`, ausschliesslich in den beiden gerichtlichen AR-Wegen mit Stillstand. Ein freier AR-Dringlichkeitsschalter ist nicht zulässig. Der vorhandene GR-Dringlichkeitsmechanismus bleibt auf seine bisher qualifizierten GR-Wege beschränkt.

## Strukturkandidat und seine Grenzen

Der [lokale Kandidat](../../outputs/ap23e2-candidate-2026-10-18/bundle/manifest.json) umfasst 41 Datendateien plus Manifest. Der Kantonalverfahrenskatalog wird als vorgeschlagenes Format 2 ergänzt. Die übrigen **40 Datendateien sind byteidentische MVP-0.8-Referenzkopien**.

Das ist absichtlich eine **strukturelle Vertragsprobe, kein lauffähiger oder vollständig neu gebundener Datenrelease**. Historische Freigaben in den kopierten Dateien beziehen sich weiterhin ausschliesslich auf MVP 0.8. Der Kandidatenmanifeststatus und sämtliche 25 kantonalen Einzelpfadbindungen sind nicht freigegeben. Der Produktreader kann und soll diesen neuen Vertrag noch nicht verwenden. Es gibt keinen Kandidatenimport in die UI und keinen Export.

Vor einer lokalen Produktintegration müssen die tatsächlichen Zielbytes neu gebunden werden. Dazu gehören die Kandidatenbindung des Feiertagskatalogs, die davon abhängigen Kalenderhashes, die Sozialbindungen und sämtliche kantonalen Zielreferenzen. Eine spätere Quellen- und Releasefreigabe ist nochmals ein eigener Schritt. Die 40 unveränderten Referenzkopien werden dabei nicht mit einer fertig geprüften Zielreleasebindung verwechselt.

## Migration und Bedienung

Die zwölf bestehenden Pfadobjekte und ihre Revisionen bleiben erhalten. Die zusätzliche Qualifikationstabelle vermeidet eine künstliche Revision aller TI-/GR-Wege. Ältere Reader müssen Manifest 9 und Katalog 2 geschlossen ablehnen. Auch blosses Umetikettieren als Format 8 darf keinen akzeptierten Datensatz ergeben. Historische Formate und AP5 bleiben weiterhin lesbar.

Die persönlichen Vorgaben bleiben bei Version 5. Gespeichert werden nur bestehende zulässige Bedienvorgaben wie Kanton, Erlass, Pfad, Revision und Stufe. **Keine Empfangsdaten, aktuelle Fallbestätigungen, Belehrungsqualität, Verkürzung, Friständerung oder Vollstreckungsqualifikation.** Unbekannte oder nicht mehr passende Vorgaben führen zu einer sichtbaren leeren Auswahl, nicht zur Wahl eines ähnlichen Wegs. Ein Rückfall löscht keine Browserdaten und überschreibt keine geschützten fremden Vorgaben.

Zwanzig technische Inputmerkmale bedeuten **nicht zwanzig neue Eingabefelder**. Viele sind Strukturmerkmale der bereits gewählten Handlung oder technische Angaben. Die bestehende Auswahl «Fallkonstellation» erhält einen zum gewählten Weg passenden Inhalt. Ihre aktuelle positive Auswahl darf die jeweiligen gebündelten Voraussetzungen nur dann bestätigen, wenn diese verständlich bezeichnet sind. Bei Wechsel von Erlass, Stufe oder Handlung wird sie zurückgesetzt. Sie wird nicht aus Defaults wiederhergestellt.

Zweispaltiger Aufbau, frühe Datumseingabe, keine redundanten Dokumentfelder und keine zusätzlichen Checkboxen bleiben verbindlich. Die genaue DE-/FR-Beschriftung und die klare Abgrenzung nicht unterstützter Fälle werden in AP23E3 sichtbar geprüft und abgenommen. Die aktuelle Oberfläche wird in E2 nicht verändert.

## Prüfung und nächster Schritt

Die [isolierte Prüfung](verwaltungsverfahrensvertrag-ap23e2-pruefung.md) verbindet Schema-, Bedeutungs- und Bestandsprüfungen. Die 51 abgenommenen E1-Referenzen werden mit dem Kandidaten und der unveränderten gemeinsamen Tagesarithmetik erneut geprüft. Fehlende Voraussetzungen, Manipulationen von Qualifikationsregeln und der Versuch einer alten Readeraktivierung müssen scheitern.

Nach technischer Abnahme und Beschluss von DEC-2026-033 folgt AP23E3. Dessen Aufgaben sind der neue strenge Reader, die konkrete Fallqualifikation, die gemeinsame Rechenanbindung, UI-/Defaults-/Exportregression sowie die lokalen Host- und Auslieferungsprüfungen. Ein Format-9-Reader darf keinen scheinbar freigegebenen Format-8-Kontext durch Herunterkonvertierung erzeugen.

E2 ändert keinen Produktcode, keine produktiven Schemata und keine freigegebenen Rechtsdaten. Es enthält weder Quellenpromotion, Quellcommit, Push, Upload noch Änderungen von E/Q/P, AP5, Mirrors oder Berechtigungen. Die lokal abgenommene UX-Korrektur bleibt unverändert. Eine konkrete Installations- und Rückfallbindung erfolgt erst mit tatsächlich gebauten und gesondert freigegebenen Releaseartefakten.
