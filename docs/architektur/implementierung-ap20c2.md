# AP20C2 Integration von FamZG und FLG

Stand: 1. Oktober 2026. **Lokal umgesetzt und technisch geprüft, zur fachlich-technischen Abnahme vorgelegt.** Auftrag von David Steimer: «Dann können wir mit AP20C2 starten.» [Issue #42](https://github.com/davidsteimer/fristenrechner/issues/42), übergeordnet [#35](https://github.com/davidsteimer/fristenrechner/issues/35).

AP20C2 ergänzt die [abgenommene AP20C1-Integration](../fachrecht/abnahme-ap20c1.md) um FamZG und FLG. Die [AP20B-Vorlage](sozialversicherungsvertrag-ap20b.md) und [DEC-2026-026](../entscheidungen/DEC-2026-026-beschluss.md) bleiben unverändert. Die acht neuen nationalen Modelle sind kantonsneutral, ihre ersten acht Anbindungen ausschliesslich bernisch. Noch keine operative Datenfreigabe oder Bereitstellung.

## Umfang und Bestandsschutz

| Bestandteil | Ergebnis |
| --- | --- |
| Neue Modelle | Je vier für FamZG und FLG: Einsprache, ordentliche Beschwerde, angeordnete Verwaltungstagesfrist und eng qualifizierte Beschwerdeverbesserung |
| Berner Anbindungen | Je zwei Verwaltungs- und zwei Gerichtswege pro Erlass, insgesamt acht |
| Kandidatenbestand | 36 nationale Regeln, 42 Berner Anbindungen |
| Erhaltener Bestand | Alle 28 Regeln und 34 Anbindungen aus AP20C1 objektidentisch, einschliesslich Revisionen und Bedeutungen |
| Andere Datenkomponenten | Neun Artefakte byteidentisch zu AP20C1 und MVP 0.5 |
| Formate | Unverändert Sozialkatalog 2.0.0, Manifest und Mindestconsumer 6.0.0 |
| Freigaben | Alle 42 neu releasegebundenen Verknüpfungen bleiben `candidate` mit `approval: null` |
| Nicht integriert | MVG und ÜLG bleiben AP20C3. Kein zusätzlicher Kanton oder Feiertagsraum aktiviert |

Der [Datenkandidat](../../data/candidates/2026-10-01-ap20c2/manifest.json) heisst `2026-10-01-ap20c2-candidate.1`. Manifest-SHA-256:

`e7d1921d7a67adc60e49142fe549f1f6113cf73084f94fd1f0f057d3360cc520`

Der Builder bindet die AP20C1-Abnahme, die AP20B-Grundlagen und die neue Quellenkontrolle. Er reproduziert dieselben Bytes und verweigert das Überschreiben abweichender bestehender Kandidatendateien. Alte Releaseverzeichnisse und Datenpins bleiben unangetastet. Der Rechenkern und die produktiven Lader benötigen gegenüber AP20C1 keine zusätzliche Änderung.

## Reduzierte Bedienung

| Verfahren | Tatsächlich erforderliche Fallangaben zusätzlich zu Zustelldatum und Feiertagsanknüpfung |
| --- | --- |
| FamZG Verwaltung | Kanton der für den Leistungsfall geltenden Familienzulagenordnung |
| FamZG Gericht | Dieselbe fallbezogene Familienzulagenordnung, Gerichtskanton und massgebendes Beschwerdedatum |
| FLG Verwaltung | Kanton der im Leistungsfall tatsächlich zuständigen Ausgleichskasse |
| FLG Gericht | Dieselbe Kassenherkunft des angefochtenen Leistungsfalls, Gerichtskanton und massgebendes Beschwerdedatum |

Kein pauschaler Berner Wohnsitzfilter und kein erfundener zusätzlicher Verwaltungskanton. Insbesondere wird die FamZG-Ordnung nicht aus Wohnsitz, Arbeitsort, Kassensitz oder Gerichtskanton abgeleitet. Die konkrete Kassen- und Leistungsqualifikation bleibt eine fachliche Fallangabe. Die Feiertagsanknüpfung an Partei und Vertretung bleibt in allen Wegen unabhängig.

Die DE-/FR-Oberfläche bleibt zweispaltig. Datumseingabe, vier Aktionsschaltflächen und feste modellierte Dokumentherkunft bleiben erhalten. Weder ein Dokument-Dropdown noch eine Bestätigungscheckbox oder ein zusätzlicher Zuständigkeits-Informationsblock wird eingeführt. Ergänzende Erläuterungen stehen in der Rechenspur.

Beim Erlass- oder Handlungswechsel werden Fallbefunde geleert, ein weiterhin gleichbedeutendes Zustelldatum bleibt erhalten. Ändert sich die angegebene Zulagenordnung oder Kassenherkunft, werden Gericht und Zuständigkeitsdatum zur erneuten Qualifikation zurückgesetzt. Persönliche Standards speichern die stabile Erlass-/Handlungsauswahl, nicht Zulagenordnung, Kassenkanton, Gericht, Feiertagsbefund oder konkrete Daten.

Der positive FamZG-Umfang ist im Formular als obligatorische individuelle Leistung sichtbar. Freiwillige Kassenleistungen bleiben unmodelliert, ohne pauschal als gesetzlicher ATSG-Ausschluss bezeichnet zu werden. Das nationale Modell schliesst gesetzlich erfasste höhere Ansätze und Geburts-/Adoptionszulagen nicht generell aus. Die konkrete Berner Anbindung bleibt auf den abgenommenen obligatorischen Umfang begrenzt. FamZG-Organisationshilfen und FLG-Zusatzleistungen ausserhalb des qualifizierten Bundeswegs werden nicht aktiviert.

## Quellen und Zeitbindung

Die [begrenzte frische Quellenkontrolle](../fachrecht/quellenkontrolle-ap20c2.md) vom 1. Oktober 2026 hat kein fachliches Delta gegenüber AP20B ergeben. FamZG, beide FLG-Fassungen, FLV, ATSG sowie KFamZG, GSOG und VRPG wurden direkt mit den amtlichen Originalen abgeglichen. FamZV wurde ergänzend erstmals als eigenes Vollwerk in zwei Fassungen verglichen. Die dokumentierte Änderung per 1. Juli 2027 betrifft die materielle Leistungsdauer, keinen neuen Tagesfristpfad.

Das nachgewiesene Anwendungsfenster bleibt **01.01.2026–31.12.2027**. Sein Beginn behauptet kein erstmaliges Inkrafttreten und sein Ende keine gesetzliche Aufhebung. Bezugsdaten, Auslöser und vollständiger Rechenweg müssen gedeckt sein. Die unveränderten tragenden FLG-Normen werden über die Konsolidierungsgrenze vom 1. Juli 2027 hinweg belegt. Wiederverwendete Kalender-, Rechtsprechungs- und sonstige Quellenbefunde sind im Quellenbericht ausdrücklich von frischen Abrufen getrennt.

## Prüfresultate

| Prüfung | Ergebnis |
| --- | --- |
| Gesamte Kern- und Oberflächenregression | 1517 bestanden, 0 fehlgeschlagen |
| Neue C2-Kerntests | 149 bestanden, darunter 80 konkrete Datumsprüfungen aus zehn abgenommenen Vektoren über acht neue Anbindungen und 34 Bestandsberechnungsvergleiche |
| Neue C2-Oberflächentests | 14 bestanden, genaue Fallfakten, keine Wohnsitzableitung, frühes Datum, Standards und Sprachtexte |
| Governance | 133 bestanden, 0 fehlgeschlagen |
| Öffentliche Webausprägung | 12 bestehende Tests bestanden, produktiver Datenpin unverändert |
| SPFx-Quell- und Ladertests | 123 bestanden, davon 17 neue C2-Gruppen |
| Tatsächlich gebautes Produkt | 56 bestanden, davon acht neue C2-Gruppen. Darin nochmals 80 Datumsfälle mit dem erzeugten ES5-Rechenkern |
| Build | Typprüfung, isolierter SPFx-Build, CSS- und Paketprüfung bestanden. Bestehendes SPPKG unverändert |
| Lokaler Browser | FamZG-Einsprache und -Beschwerde sowie FLG-Einsprache bis zur Kandidatensperre, DE-/FR-Darstellung, getrennte Falldaten, Erlass-/Handlungswechsel, erhaltenes Zustelldatum und leere Felder nach Neuladen geprüft |

Die Zahlen sind nicht additiv. Insbesondere bilden die 80 Datumsfälle im gebauten Produkt eine Testgruppe. Fehlende, falsche und zusätzliche Fakten, zeitliche Grenzen, unabhängige Feiertagsqualifikation, falsche Formatpaarungen, beschädigte Daten und der gesperrte Rückfall auf allgemeines ATSG oder VRPG sind Teil der automatisierten Prüfungen.

Die Browserprüfung fand ausschliesslich lokal statt, nicht in SharePoint, Teams oder mit einem Gastkonto. Bei der Browserautomation wurden Auswahlzustände nach jedem Übernahmeschritt bestätigt. Native Datumsfelder wurden fokussiert und mit Tastaturereignissen im tatsächlichen Eingabezustand geprüft. Nicht bestätigte schnelle Aktionsfolgen wurden nicht als bestandene Interaktionen gezählt. Keine Warnungen oder Fehler in der lokalen Browserkonsole. FLG-Gerichtswege und die beiden Arten angeordneter Tagesfristen sind automatisiert, nicht jeweils als vollständiger eigener Browserdurchlauf geprüft.

## Historische Nachweise und aktueller Quellstand

AP20C1-Bericht, -Prüfprotokoll, -Abnahmenotiz, Datenkandidat und bestehende Tests bleiben unverändert. Die acht gemeinsam weiterentwickelten UI-/Vorschau-/Builddateien wurden **vor der Änderung byteidentisch gesichert** unter [AP20C1-Ausgangsstand](../../outputs/ap20c2-2026-10-01/ap20c1-baseline/). Der neue [Prüfnachweis](../../outputs/ap20c2-2026-10-01/pruefprotokoll.json) verifiziert sämtliche 34 historischen C1-Dateibindungen entweder gegen diese Vorbilder oder gegen die weiterhin unveränderte Originaldatei und bindet anschliessend den C2-Quellstand. Die 15 AP20B-Nachweisdateien bleiben ebenfalls unverändert.

Dies ist eine dokumentierte Weiterentwicklung nach C1-Abnahme, keine rückwirkende Änderung ihrer Prüfsummen. Der [Buildernachweis](../../outputs/ap20c2-2026-10-01/build-verification.json) hält die unveränderten Datenobjekte gesondert fest. Der isolierte Paketbau ist kein freigegebenes Installationspaket und vergibt keine neue Anwendungsversion.

## Vorschau und Abnahme

- [FamZG-Vorschau](http://127.0.0.1:8796/?candidate=ap20c2&qa=ap20c2-famzg)
- [FLG-Vorschau](http://127.0.0.1:8796/?candidate=ap20c2&qa=ap20c2-flg)

Die Vorschauen wählen nur Erlass und Einsprache vor, kein Datum und keine Fallbefunde. Ohne Kandidatenparameter bleibt die Standardvorschau auf MVP 0.5. Das Datum ist früh eingebbar. Ohne operative Freigabe entsteht auch bei vollständigen Angaben **kein Fristende**. Positive Rechentests verwenden nur synthetische Freigaben im Testspeicher, niemals im Kandidaten oder in der Vorschau.

Zur manuellen Abnahme bieten sich der Wechsel zwischen Einsprache und Beschwerde, die unterschiedliche FamZG-/FLG-Fallangabe, die DE-/FR-Texte und das Rücksetzen der Fallbefunde an. Die **fachlich-technische Abnahme durch David Steimer steht aus**. Erst danach kann AP20C3 mit MVG/ÜLG separat beauftragt werden.

Kein Quellcode-Commit oder Push, keine Quellenreleasefreigabe, Datenpromotion, E-/Q-/P-Installation, Mirror- oder Berechtigungsänderung. GitHub dient ausschliesslich der Issue-Nachführung. Codex arbeitet ohne formelle Freigabe- oder Haftungsverantwortung.
