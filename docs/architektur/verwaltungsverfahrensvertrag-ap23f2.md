# AP23F2 Technischer Vertrag für Zürich Aargau und St. Gallen

Stand: 22. Oktober 2026. **Technischer Entwurf, noch nicht abgenommen.** [AP23F1 ist fachlich abgenommen](../fachrecht/abnahme-ap23f1.md). Die vorgeschlagenen Vertragsversionen stehen unter [DEC-2026-035](../entscheidungen/DEC-2026-035-qualifizierte-kantonalverfahren-v3.md). Die produktive Integration ist AP23F3 vorbehalten. MVP 0.9 bleibt unverändert.

## Ergebnis und Vertragsgrenze

Die neuen Fristdauern, Ferienperioden und die enge F1-O1-Sicherung lassen sich mit der bestehenden Tagesarithmetik berechnen. Der geltende Vertrag kann aber die neuen Fälle und Fassungsbindungen nicht vollständig prüfbar beschreiben. Deshalb werden **Kantonalverfahrenskatalog 3.0.0 sowie Manifest und Mindestconsumer 10.0.0** vorgeschlagen.

| Nachgewiesene Grenze im Bestand | AP23F2-Vorschlag |
| --- | --- |
| Katalog-2-Leser prüft Definitionen exakt gegen die geschlossene MVP09-Baseline | Neuer nativer Vertragszweig, alte 25 Definitionen unverändert. Keine stille Öffnung des alten Lesers |
| Vollstreckung ausdrücklich nur AR-Art.-63-Anordnung mit fünf Tagen | Eigenständige AG-§83-Qualifikation mit zehn Tagen und gerichtlichem Stillstand |
| Kein qualifizierter SG-Art.-44-/Art.-60-Massnahmenfall | Geschlossene neue Handlungs-/Entscheidarten. Kein generischer Fünftages-Zwischenentscheid |
| Stufe `court` unterscheidet VRK und VG nicht als konkrete Zielstelle | Zusätzlich pfadgebundenes Zielorgan. Der bestehende Stufenbegriff bleibt erhalten |
| Allgemeine unbestrittene Belehrung ist keine richtige gerichtliche Ferienausnahmebelehrung | Gesonderte pfadbezogene Ausnahmequalifikation nur für den SG-Art.-60-Pfad |
| Kein aktueller ZH-Kanal-/Störungsstatus | Gewöhnlicher rechtlich geklärter Fall ohne ungeklärte Abruffiktion oder geltend gemachte Kanalstörungsverlängerung |
| Ein einziges Normversionsintervall ohne Zuordnung einzelner Quellen | Explizite, lückenlose, überschneidungsfreie Normzeitleiste auf jedem neuen Pfad |
| Format 9 bindet 41 Artefakte und den bisherigen Kalenderbestand | Format 10 mit zusätzlicher Zürcher Verwaltungsprojektion. Altformate bleiben geschlossen |

Der Formatsprung beruht damit nicht nur auf einer weiteren Kantonsliste. Er verhindert, dass alte Leser neue Qualifikationsbedeutungen oder zeitliche Quellenbindungen übersehen. Die neue Hauptversion darf später nicht als Ersatz für genaue Definitionen und Prüfsummen dienen.

## Erhaltener Bestand und Zielstruktur

| Bestandteil | MVP09 | Strukturprobe AP23F2 |
| --- | ---: | ---: |
| Erlasse im Kantonalverfahrenskatalog | 5 | 8 |
| Stillstandsprofile | 8 | 14 |
| Rechtliche Kalenderverwendungen | 5 | 9 |
| Pfade und Qualifikationsregeln | Je 25 | Je 42 |
| Physische Kalender | 32 | 33 |
| Manifestartefakte ohne Manifest | 41 | 42 |
| Dateien einschliesslich Manifest | 42 | 43 |
| Basisregeln des Feiertagskatalogs | 479 | 479 |
| Gesonderte SO-Prozessregeln | 12 | 12 |
| Nationale Sozialregeln und BE-Anbindungen | 44 und 50 | 44 und 50 |

BE bleibt separates Bestandsprofil und ist nicht nochmals einer der acht Katalogerlasse. Von den 42 Artefakten sind 40 exakte MVP09-Referenzkopien. Geändert ist nur der strukturelle Kantonalverfahrenskatalog, hinzu kommt die lokale Zürcher Projektionsdatei. Der Manifest beschreibt die neue Struktur, nicht einen bereits freigegebenen Datenrelease.

Die bisherigen 25 Pfadobjekte, Revisionen und Qualifikationsregeln bleiben exakt erhalten. Die zwölf historischen TI-/GR-Altregeln behalten ihre beschränkte `legacyV1`-Bindung. Die dreizehn LU-/ZG-/AR-Regeln behalten ihre bisherige Qualifikationssemantik. F1 fügt 17 eigene Kennungen in Kleinschreibung der Forschungs-ID mit Revision 1 hinzu. Ein neuer Pfad darf keinen Altzweig verwenden.

## Explizite aktuelle Fallqualifikation

Der neue Zweig `qualifiedDayProcedureV3` bindet die sieben bisherigen Qualifikationsmerkmale einschliesslich Handlung und Entscheidqualifikation. Vier zusätzliche Merkmale machen die neuen Abgrenzungen überprüfbar:

| Merkmal | Pfadbezogene Bedeutung |
| --- | --- |
| `targetBody` | Kantonalverwaltung, verwaltungsinterne Rechtsmittelstelle, Verwaltungsgericht oder Verwaltungsrekurskommission. Der SG-VRK-Pfad bleibt rechnerisch `court`, ist aber nicht mit VG austauschbar |
| `procedureMatter` | Allgemeines Verwaltungsverfahren oder der positiv unterlegte Dokumentenzugangsrekurs. Vorgelagertes Verfügungsverlangen ist kein Rekurs gegen die formelle Verfügung |
| `channelCase` | ZH nur gewöhnlich rechtlich geklärter Eröffnungs-/Kanalfall ohne offene Fiktion oder Störungsverlängerung. Bei anderen Kantonen nicht anwendbar |
| `exceptionNotice` | Richtige Ferienausnahmebelehrung beim SG-Art.-60-Pfad. Für gewöhnliche Verwaltungs- und ordentliche Gerichtspfade nicht als zusätzliche Bestätigung erforderlich |

Die besonderen Entscheidarten unterscheiden AR-Art.-63-Anordnung, AG-§83-Vollstreckungsentscheid, SG-Art.-44-Massnahmen und SG-Art.-60-vorsorgliche Massnahme. Eine Beweisanordnung oder ein allgemeiner Zwischenentscheid wird nicht durch eine Tageszahl zur passenden Massnahme. Für AG bleiben Sachteil, selbständiger Kostenteil, SchKG, Mahnung und materielle Erfüllung abgegrenzt.

Das isolierte Inputschema ist eine geschlossene Forschungs-API, noch keine produktive Benutzer- oder Exportberechtigung. Unbekannte und negative Angaben bleiben darstellbar. Vollständige synthetische Testqualifikationen stammen ausschliesslich aus den abgenommenen Referenzannahmen, nicht aus späteren realen Benutzereingaben.

## Normabschnitte und vollständige Deckung

Jeder der 17 neuen Pfade besitzt `normTimeline` mit geordneten Abschnitten aus `interval` und `sourceRefs`. Das bisherige einzelne `normVersionCoverage` entfällt nur bei den neuen Pfaden. Bei den alten 25 bleibt es unverändert. Neue Normabschnitte müssen den gesamten freigegebenen Fallrahmen ohne Lücke oder Überschneidung abdecken und auf vorhandene Quellen zeigen.

| Kanton | Normabschnitte im bestätigten Fallfenster |
| --- | --- |
| ZH | 29.08.2026–31.12.2026 mit heutiger VRG-Grundlage. 01.01.2027–31.12.2027 mit Grundtext, Änderungsbeschluss und RRB 715/2025. Keine neue Zustellfiktion oder Kanalverfügbarkeitszusage |
| AG | 29.08.2026–31.12.2027 auf der geprüften VRPG-/ZPO-Verwendung, neue EG-ZPO-Kalenderbindung ausdrücklich bestätigt |
| SG | 29.08.2026–31.05.2027 mit bisherigem GerG. 01.06.2027–31.12.2027 mit publiziertem neuem GerG. Die Änderung ist organisatorisch, nicht eine neue Fristdauer |

Eröffnung, jeder gezählte und übersprungene Tag sowie die Endverschiebung werden gegen den Schnitt von Pfad-, Quellen-, Norm-, Kalender- und späterer Releaseabdeckung geprüft. Eine Rechnung über den Jahreswechsel darf beide Zürcher Normabschnitte berühren. Allein das Eröffnungsjahr auszuwählen wäre falsch. Die expliziten Abschnitte sind kein Nachweis, dass bis Ende 2027 keine weitere Gesetzesänderung eintritt.

F1-O1 bindet `blockWhenEnteringApplicableSuspension` an genau neun neue Pfade: die zwei ZH-Gerichtswege, drei AG-Gerichtswege und vier SG-Gerichtsferienwege. Beim ersten Eintritt der reinen Endverschiebung in den Stillstand gibt es kein definitives Ergebnis und keinen Export. Die normale Resttagezählung bleibt berechenbar. Die zwei bisherigen AR-Sicherungen bleiben bestehen.

## Kalender und Herkunft

Vier neue Verwendungen binden ZH-Verwaltung, ZH-Gericht, AG und SG. Die GOG-Zehnerliste, AG-Prozessliste und SG-Basisliste werden als vorhandene physische Grundlagen wiederverwendet. Die SG-ZPO-Liste mit zusätzlichem Januarvorbehalt ist ausdrücklich nicht die neue VRP-Grundlage.

Der vorhandene Bereich `ZH-RLG-ALL` enthält zwölf Regeln. Die bestätigte Neunerprojektion wählt genau die neun benannten Nichtsonntagsregeln. Oster-, Pfingst- und Bettagssonntag bleiben im historischen Katalog erhalten. Sie werden nicht in die neue Neunerdatei übernommen. Die ohnehin geltende Sonntags-Endverschiebung bleibt unverändert.

Die zusätzliche Projektionsdefinition fehlt noch in der historischen `activation.projections`-Liste. Die Strukturprobe lässt deshalb den alten Feiertagskatalog bytegleich und kennzeichnet die neue Zürcher Datei mit einem eigenen lokalen `projectionEvidence`. Dieser bindet Ursprungsrelease, Kataloghash und genaue Regel-IDs. Er behauptet nicht, dass die neue Datei bereits unter MVP09 vorhanden oder operativ freigegeben sei.

Vor der späteren tatsächlichen Produktbindung müssen die neue Projektionsdefinition, der daraus folgende Kataloghash, die abhängigen Kalender-/Verwendungsreferenzen sowie Release- und Sozialbindungen konsistent neu gekoppelt werden. Diese Herkunftsanpassung ändert keine der 479 Basis- oder zwölf SO-Zusatzregeln fachlich. AP23F2 nimmt diese Promotion nicht vorweg.

Neue F1-Verwaltungsquellen erhalten eigene Herkunftsobjekte. Bestehende Quellen und ihre historischen Prüfdaten bleiben unverändert. Die F1-Fachabnahme ersetzt keine zusammengeführte neue Releasequellenprüfung.

## Standards Bedienung und spätere Migration

Persönliche Vorgaben bleiben Format 5. Kanton, Erlass, Pfad, Revision, Stufe und gewöhnliche Bedienvorgaben dürfen erhalten bleiben. Aktuelles Empfangsdatum, Referenz, Massnahmenqualifikation, konkreter Verfahrensgegenstand als Fallbestätigung, Ausnahmebelehrung und Eröffnungs-/Kanalstatus werden nicht gespeichert. Ein Rückfall auf MVP09 wählt keinen ähnlich benannten alten Weg und löscht keine Browserdaten.

Die neuen technischen Merkmale bedeuten keine vier zusätzlichen Pflichtfelder oder Checkboxen. Der zweispaltige Aufbau, frühe Datumseingabe, feste Einzelwerte und die passend zum Weg gebündelte Fallqualifikation bleiben erhalten. Was aus dem gewählten Weg feststeht, zeigt die Oberfläche statisch. Was ein tatsächlicher aktueller Fallumstand ist, wird nicht erfunden. Die konkrete DE-/FR-Oberfläche und ihre Abnahme gehören zu AP23F3.

## Isolierte Probe und nächster Übergang

Die Kandidatenschemata und die [Strukturprobe](../../outputs/ap23f2-candidate-2026-10-22/bundle/manifest.json) sind von produktiven Schemata und Lesern getrennt. Alle neuen Release- und Pfadbindungen bleiben Kandidaten, Zielkomponenten- und Freigabereferenzen bleiben leer. Die 40 kopierten historischen Komponenten tragen weiterhin nur ihre damaligen MVP09-Bindungen. Das Gesamtpaket ist daher ausdrücklich noch kein produktlesbarer oder installierbarer neuer Datenrelease.

Die [isolierte technische Prüfung](verwaltungsverfahrensvertrag-ap23f2-pruefung.md) ist bestanden. Sie verbindet Schemata, Bedeutung, Bestandserhaltung, alle 80 Forschungsfälle, gezielte Manipulationen und die Ablehnung durch alte Leser. Die zusätzliche unabhängige Python-Prüfung verwendet die tatsächlichen Kandidatenbytes. Die jeweiligen Rechenprüfungen erlauben keinen Kalenderexport.

Nach Vorlage des technischen Ergebnisses sind AP23F2 und DEC-2026-035 durch David gesondert zu bestätigen. AP23F3 startet erst danach auf Auftrag. Keine neue Produktversion, Releasequellenfreigabe, Datenpromotion, Builds, Commits, Pushs, Uploads oder E/Q/P-Änderungen. Die spätere reguläre Auslieferung bleibt bis zur vereinbarten Kantonsabdeckung gebündelt.
