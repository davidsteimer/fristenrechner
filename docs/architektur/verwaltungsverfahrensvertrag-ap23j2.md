# AP23J2 Vertragsprobe und Migration für Freiburg, Genf und Jura

Stand: 27. Oktober 2026. Status: isolierter technischer Vorschlag zur Abnahme. [AP23J1 einschliesslich J1-A bis J1-G ist fachlich abgenommen](../fachrecht/abnahme-ap23j1.md). Formatentscheid und Produktintegration stehen noch aus.

## Ergebnis und erforderlicher Entscheid

Vorgeschlagen sind **Kantonalverfahrenskatalog 7.0.0 sowie Manifest und Mindestconsumer 14.0.0** gemäss [DEC-2026-039](../entscheidungen/DEC-2026-039-qualifizierte-ausloeser-und-genfer-eroeffnung-v7.md). Der bestehende Katalog 6 behandelt das Eingabedatum bereits als rechtlich massgebenden Tag. Er kann den physischen Genfer Postempfang nicht bloss mit einem zusätzlichen Fallfakt in eine rechtliche Eröffnung umrechnen. Ein verdecktes UI-Vorrechnen würde die Quellen-, Zeit- und Ergebnisbindung umgehen.

Die Erweiterung umfasst ausschliesslich die abgenommenen 36 Gruppen: FR elf, GE sieben, JU 18. In der isolierten Probe bleiben die 113 bisherigen Pfade und ihre Fachobjekte exakt erhalten. Es entstehen 149 Pfade und Policies, aber keine neuen physischen Kalender oder Feiertagsregeln. Die [technische Prüfung](verwaltungsverfahrensvertrag-ap23j2-pruefung.md) bleibt von der noch offenen menschlichen Abnahme getrennt.

## Warum das bestehende Format nicht genügt

| Vertragslücke | Vorhandener Vertrag | Begrenzte Erweiterung |
| --- | --- | --- |
| Physischer Empfang und rechtliche Eröffnung | V6 verlangt `qualifiedActualDelivery` und übergibt `inputDate` unverändert an die Tageszählung | Eigene geschlossene V7-Eröffnungspolicy. Nur die qualifizierte gewöhnliche Genfer Postvariante darf vor der Zählung verschieben |
| Besondere aktuelle Auslöser | Das alte Qualifikationsetikett beschreibt bereits tatsächliche Zustellung, nicht alle neuen Ereignisse | Typisierte FR-/JU-Auslöser mit unverändert übernommener qualifizierter Ereignisdatierung. Keine automatische Folgeeröffnung |
| Provenienz vor der eigentlichen Zählung | Keine getrennte verbindliche Darstellung von physischem Empfang und aufgelöster Eröffnung | Policyhash, Eingabebedeutung und -modus, eingegebener Tag, rechtlicher Auslösetag und vorgeschaltete Verschiebungstage |
| Geschlossener Bestand | Katalog 6 und Manifest 13 binden die bisherigen 113 Wege | Eigener V7-Zweig und Mindestconsumer 14. Historische Definitionen und Reader werden nicht gelockert |

Die vorhandenen Dauerarten, alternativen skalaren Requirements, feste Stillstandsprofile, Normabschnitte und die begrenzte Endverschiebungssperre genügen dagegen für die neue Tranche. Sie werden nicht unnötig neu erfunden.

## Geschlossener neuer Eröffnungsvertrag

Neue Pfade und Policies erhalten `qualifiedDayProcedureV7`. Ihre aktuelle Qualifikation verlangt `delivery: qualifiedTriggerAccordingToOpeningPolicy`. Dieser Begriff ändert nicht die Bedeutung alter V1–V6-Wege. Die neue `openingPolicy` ist eine geschlossene Union, kein frei programmierbarer Ausdrucksinterpreter.

| Variante | Aktuelle Eingabe und Wirkung |
| --- | --- |
| `qualifiedCurrentTrigger` | Rechtlich qualifizierter aktueller Auslöser. `transformation: none`. Der eingegebene Ereignistag wird unverändert als rechtlich massgebender Auslösetag übernommen, auch wenn er auf Samstag, Sonntag oder Feiertag fällt. Die Tageszählung beginnt am Folgetag |
| `geQualifiedOrOrdinaryPost` mit `qualifiedLegalOpening` | Bereits qualifizierte rechtliche Genfer Eröffnung. Keine erneute Eröffnungsverschiebung |
| `geQualifiedOrOrdinaryPost` mit `ordinaryPostPhysicalReceipt` | Ausdrücklich qualifizierter physischer Empfang gewöhnlicher Post. Samstag, Sonntag oder gebundener gesetzlicher Feiertag wird einmal auf den nächsten Werktag verschoben. Die anschliessende Tagesfrist beginnt am Folgetag dieser rechtlichen Eröffnung |

GE bindet `factKey: openingMode`, genau diese beiden Modi, `ordinaryPostTransformation: nextWorkingDayIfNonWorkingReceipt`, `holidayBinding: sameAsPath` und `otherwise: block`. Fehlender, unbekannter, falsch typisierter oder fremder Modus liefert kein definitives Resultat und keinen Export. Weder Datum noch alte Defaults wählen einen Modus vor.

Der erste Zweig unterscheidet abschliessend die qualifizierte schriftliche Eröffnung, die Erstreckungsablehnung nach bereits abgelaufenem alten Ende, das TC-Dispositiv, die mündliche JU-Eröffnung und die vollständig gutheissende verkürzte JU-Eröffnung. Ein eigener berechneter Antragsschluss erzeugt keine spätere tatsächliche Bestätigung oder Begründung.

Die vorhandene `openingChainPolicy: notApplicable` bedeutet bei diesen neuen Wegen, dass keine automatische Folgeereigniskette ausgeführt wird. Sie beseitigt nicht die neue vorgeschaltete Eröffnungspolicy. Die alten OW-/V4-/V5-Begründungsketten werden nicht für Genfer Post oder jurassische schriftliche Bestätigung umgedeutet.

## Prüfungsreihenfolge und Provenienz

1. Eingabe, authentischen Pfad, aktuelle Fallqualifikation, Dauer, Eligibility sowie genaue Kalender- und Quellenbindung prüfen.
2. Zeitdeckung auch des eingegebenen physischen Empfangs beziehungsweise besonderen Ereignisses bestätigen.
3. Eröffnungspolicy auflösen. Jeden vorgeschalteten Tag gegen Kalender, Fenster und genau einen geltenden Normabschnitt prüfen. Gerichtsferien verschieben die rechtliche Postmitteilung nicht.
4. Tagesfrist genau einmal ab dem aufgelösten rechtlichen Auslösetag zählen. Stillstand und Endverschiebung des konkreten Pfads anwenden.
5. Genau begrenzte Kollision bei reiner Endverschiebung in neu beginnende anwendbare Ferien sperren. Keine allgemeine Monats- oder Kantonsgrenze erzeugen.

Die Eligibility bindet `openingPolicySha256` zusätzlich zur Pfad-, Qualifikations-, Profil- und Kalenderbindung. Ein korrekt neu gehashter, aber fachlich veränderter Datensatz wird dadurch nicht automatisch zulässig. Der spätere native Validator muss auch die abgenommenen exakten Inhalte und Inventare prüfen.

Die isolierte Auswertung weist `openingResolution` mit Policyart und -hash, Eingabemodus, Eingabedatum, rechtlichem Eröffnungstag, vorgeschalteten Verschiebungstagen, ausgewerteten Normsegmenten und Quellen aus. Diese Provenienz ist keine serialisierbare Export- oder Rechenberechtigung. Die Strukturprobe selbst erteilt auch für positive Referenzresultate keine operative Freigabe.

## Fachliche Grenzen bleiben geschlossen

FR-Nachfrist benötigt ein rechtzeitig gestelltes und tatsächlich abgelehntes Erstreckungsgesuch, das bereits abgelaufene ursprüngliche rechtliche Ende sowie das Fehlen eines länger fortbestehenden Endes. Ohne aktuelle positive Qualifikation gibt es keine berechenbare Dreitagesnachfrist. Ein früher eröffneter Ablehnungsentscheid verkürzt keine noch laufende Frist.

JU unterscheidet das Fünftagesverlangen nach mündlicher Eröffnung vom dreissigtägigen Begründungsverlangen. Ein späterer materieller Rechtsmittelweg benötigt seine eigene tatsächlich qualifizierte Eröffnung. Ein synthetisch erzeugtes Datum oder bloss rechtzeitig errechnetes Verlangen genügt nicht. Die Einspracheausschlüsse bleiben alternativ wirksam, nicht erst bei kumulativer Erfüllung.

GE-Reklamation benötigt eine einschlägige gesetzliche Grundlage. Die sechs Art.-63-Abs.-2-Ausnahmen bleiben abzugrenzen. Die funktionale Rechtsmittelrolle von Conseil d'Etat beziehungsweise Gouvernement wird nicht mit einem organisatorischen Gericht gleichgesetzt.

## Kalender, Quellen und vollständige Zeitdeckung

Die sechs neuen rechtlichen Verwendungen sind FR Nicht-TC/TC, GE Erstverfahren/Rechtsmittel und JU Erstverfahren/Rechtsmittel. Sie binden die unveränderten Kantonskalender, Bundeskalender und den Feiertagskatalog. Die Zielstellenrolle bleibt am tatsächlichen zuständigen Sitz orientiert. Keine freie Kalendervereinigung und kein Parteienkanton. Gleiche Datumsdaten vererben keine Verfahrensberechtigung.

FR verwendet 15, GE neun und JU 15 bereits vorhandene Regeln. Alle **35 Kalender und 499 Katalogregeln einschliesslich bestehender Prozessergänzungen bleiben erhalten**. Die 499 bestehen aus 479 Grundregeln und 20 Ergänzungen. Die 35 erzeugten Kalenderdateien enthalten auf ihrer eigenen Projektionsstufe 431 Regeln. Das sind unterschiedliche Zählstufen, keine abweichenden Datenbestände. Insbesondere keine Genfer Ersatzmontage oder arbeitsrechtlichen Schliess-/Urlaubstage ergänzen. Die jurassische Feiertagsgrundlage ist die offizielle Liste nach Art. 3, nicht der arbeitsrechtliche Teilbestand.

Forschungskennungen werden über einen expliziten 1:1-Crosswalk in `SRC-`-/`JUD-`-Kennungen projiziert. Rolle, URL, Fassung, Fundstelle, tatsächlicher Nachweis und Erkenntnisgrenze bleiben erhalten. API-Metadaten, Textauszüge, Suchtreffer und Entwürfe werden nicht als zusätzliche geltende Normen dupliziert. Feiertagsmaterialien und begrenzte Praxisbelege dürfen nicht bloss deshalb entfallen, weil ein einzelner Forschungspfad sie nicht direkt als `sourceIds` nennt.

Der ergänzende historische Beleg `JUD-AP23J1-JU-BGER2D55-2010` trägt in der abgenommenen Forschung einen exakten `http://relevancy.bger.ch/...`-Verweis. Die isolierte Schemaerweiterung lässt ausschliesslich diese Quellenkennung, Quellenart und exakte URL als Ausnahme zu. Der alte HTTPS-Quellenzweig bleibt unverändert. Keine allgemeine HTTP- oder Domainöffnung, keine heimliche URL-Umschreibung und kein Nachladen fremder Quellen durch die Rechenprobe. Die ergänzende Evidenzgrenze bleibt erhalten.

FR erhält genau zwei lückenlose Normabschnitte, mit CPJA 7947 bis 30.09.2026 und CPJA 8637 ab 01.10.2026 sowie jeweils der konstanten LJ-Grundlage. Nicht beide Fassungen als gleichzeitig geltend behandeln. Alle neuen Fälle bleiben vollständig auf **29.08.2026–31.12.2027** begrenzt. Empfang, vorgelagerte Eröffnungsverschiebung, Zählung, Stillstand und Endverschiebung gehören zur Deckungsprüfung. Weder aktueller Quellenstand noch Modellfenster versprechen unverändertes Recht bis Ende 2027.

## Komponenten und spätere Migration

| Komponente | J2-Vorschlag |
| --- | --- |
| Kantonalverfahrenskatalog | 7.0.0 mit eigenem V7-Zweig |
| Manifest und Mindestconsumer | 14.0.0 |
| Rechtsprofile, Feiertagskatalog, Regelkalender | Formate 1.0.0, 2.0.0 und 3.0.0 unverändert |
| Spezialregime- und Sozialverfahrenskatalog | Formate 3.0.0 und 2.0.0 unverändert |
| Persönliche Vorgaben | Version 5 unverändert. Keine aktuellen Eröffnungs- oder Falltatsachen speichern |
| Sozialfreigabe | 44 Regeln und 50 BE-Anbindungen unverändert. Keine ausserbernische Erweiterung oder verlängerte Zeitfreigabe |
| Altformate und AP5 | Eigenständig prüfbar und unverändert |

Die Probe liegt ausschliesslich unter [outputs/ap23j2-candidate-2026-10-27](../../outputs/ap23j2-candidate-2026-10-27/). Von 44 Manifestartefakten bleiben 43 nichtadministrative Dateien rohbytegleich. Nur Verwaltungskatalog und Manifest ändern sich. Kopierte historische Herkunfts-/Releasebindungen werden nicht beiläufig auf einen neuen Quellenrelease umetikettiert. Der Vorschlagskatalog hat keine aktive Freigabe und keine Exportberechtigung. Eine lokale gesperrte Probeextension ist kein produktiver Reader oder neuer freigegebener Gesamtquellenrelease.

Nach technischer J2-Abnahme und ausdrücklichem Beschluss von DEC-2026-039 kann AP23J3 gesondert starten. Dort folgen nativer Format-14-Reader und Aktivierungsvalidator, tatsächliche Zielrelease-Neubindungen, Kern-/UI-/Hostintegration, tief eingefrorene Ergebnisprovenienz, Defaults-Schutz und Tests an echten gebauten Artefakten. Ein Altreader muss einen neuen unbekannten Pfad als `unsupportedSelection` schützen, nicht löschen oder mit einem Ersatzweg überschreiben.

Das Bedienkonzept bleibt unverändert: frühe Datumseingabe, zwei Spalten, statisch «Sitz der zuständigen Stelle», feste Einzelwerte. Nur aktuelles fachlich entscheidendes Wissen rechtfertigt eine neue Eingabe. Zuständigkeitserklärungen und detaillierte Quellen gehören grundsätzlich in die Rechenspur. 36 Modellgruppen bedeuten nicht 36 zusätzliche Dropdowns.

## Schutz und offene Abnahmen

Die [J2-Ausgangsbindung](../../outputs/ap23j2-2026-10-27/protected-inputs.json) schützt 4’413 eindeutige Bestandsdateien. Die ursprünglichen J1-Forschungsbytes und ihr Abnahmearchiv, alle alten Produkt- und Datenstände, nativen Schemata, vorhandenen Tests und der fremd geänderte Projektplan bleiben unverändert. Nur sieben lebende Einstiegstexte sowie ausdrücklich neue isolierte J2-Schemata und J2-Governance-Tests sind nachführbar.

Offen bleiben technische J2-Abnahme und DEC-2026-039. J3 ist nicht gestartet. Keine Quellenpromotion, Produktbauten, Commits, GitHub-Push oder Issueänderungen, Uploads, Installation, E/Q/P, Mirrors, AP5, AP21, Hosting oder Berechtigungsänderung. Der nächste reguläre Release bleibt gemäss DEC-2026-034 gebündelt. David Steimer entscheidet in Personalunion. Codex und getrennte technische Gegenrechnungen ersetzen keine menschliche Freigabe.
