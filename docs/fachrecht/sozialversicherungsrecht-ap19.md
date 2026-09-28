# AP19 · Weitere bundesrechtliche Sozialversicherungsverfahren

| Merkmal | Stand |
| --- | --- |
| Datum | 28. September 2026 |
| Auftrag | David Steimer: «Perfekt. Lass uns loslegen.» nach ausdrücklicher Bestätigung nationaler Modellierung mit bernischer Erstfreigabe |
| Leitentscheide | [DEC-2026-024](../entscheidungen/DEC-2026-024-nationales-sozialversicherungsmodell.md), nationale Modellierung, und [DEC-2026-025](../entscheidungen/DEC-2026-025-sozialverfahrenskatalog-und-manifest-v5.md), konkreter Produktformatvertrag, beschlossen |
| Paketstatus | AP19A und [AP19B einschliesslich Option B für AVIG](abnahme-ap19b.md) am 25. September 2026 abgenommen. [AP19C1 einschliesslich beider Bediennachträge](abnahme-ap19c1.md), [AP19C2](abnahme-ap19c2.md) und [AP19C3](abnahme-ap19c3.md) am 28. September 2026 fachlich-technisch abgenommen. Erste Integrationstranche abgeschlossen. Datumseingabe vorerst unverändert, keine operative Freigabe |
| Entwicklungsstand | `codex/ap19-sozialversicherungsmodell`, ab unverändertem MVP-0.4-Abschlusscommit `065781f17b6f83e1e51c9af96d89bb699cb4b933` |
| Veröffentlichung | Lokale Datenübernahme und definitiver Build freigegeben. Ausschliesslich lokaler Datencommit `3109c39730f10d31cb6c57200b36dd5091d7bcd1`. Kein öffentliches Issue, Push oder Deployment aus diesem Auftrag |

## 1. Ziel und verbindliche Trennung

Wir modellieren die bundesrechtlichen Regeln einmal und kantonsneutral. Eine kantonale Anbindung ergänzt die tatsächlich erforderliche Zuständigkeit, subsidiäres Verfahrensrecht und Orts-/Feiertagsauflösung. Eine weitere Ebene entscheidet, welche konkrete Kombination fachlich und technisch freigegeben ist. Bern ist die erste vorgesehene Anbindung, nicht eine Konstante im Bundesrechtsmodell.

Die Freigabe einer neuen Kombination erfolgt erst nach Fachabnahme und technischer Integration. Ein im Katalog bekanntes Gesetz, ein auflösbarer Feiertag oder eine erfolgreiche synthetische Modellprobe darf keine Freigabe ersetzen.

## 2. Umfang und Nichtumfang

**Erste Tranche:** ELG, AVIG und KVG. Pro Erlass prüfen wir vier enge Handlungen: Einsprache gegen eine qualifizierte erstinstanzliche Leistungsverfügung, ordentliche Beschwerde gegen den Einspracheentscheid, ausdrücklich angeordnete Verwaltungstagesfrist und gerichtliche Tagesnachfrist zur Verbesserung der Beschwerde. Andere Akte, Gegenstände und Rechtswege werden einzeln abgegrenzt, nicht aus einer ähnlichen Dauer übernommen.

**AP19A liefert:** ein Inventar der elf hier priorisierten Sozialversicherungs-Stammgesetze, Quellenpakete für die erste Tranche, eine nationale Modellstruktur und ausführbare Struktur-/Sperrproben. Dies ist keine Vollinventur sämtlicher bundesrechtlicher Einzelnormen, Verordnungen und punktuellen ATSG-Verweise. Die für die erste Tranche relevanten Verordnungen und kantonalen Anschlussnormen werden ausdrücklich mitgeführt.

**Produktintegration:** In AP19A/AP19B ausdrücklich nicht enthalten. AP19C1 setzt den abgenommenen Vertrag begrenzt für zwölf bestehende IVG-/AHVG-/UVG-Pfade und vier ELG-Pfade um. AP19C2 ergänzt vier AVIG-ALE-Pfade, AP19C3 vier KVG-/OKP-Pfade. Alle drei Kandidaten sind fachlich-technisch abgenommen, nicht operativ freigegeben. Damit ist die erste Integrationstranche mit 24 nationalen Bundesregeln und 28 Berner Anbindungen abgeschlossen. Die zusammengehörige lokale Releasevorbereitung ist inzwischen gesondert beauftragt, siehe Abschnitt 12.

**Nicht enthalten:** neue operative Kalender, Erweiterung der öffentlichen Kantonsauswahl, vollständige Abdeckung der bisher unterstützten Erlasse, beliebige gerichtliche Prozessfristen, materielle Verwirkungsfristen, Fristerstreckung oder Wiederherstellung, BVG-Klagen, VVG-Zusatzversicherungen, Bundesverwaltungs- und Bundesgerichtsverfahren, zusätzliche GUI-Sprachen und eine Kalender-App.

Das zweispaltige GUI wird nicht neu entworfen. Die späteren Produkttexte bleiben Deutsch und Französisch. Herkunft und Geltung jeder Norm müssen vor ihrer technischen Integration zeitlich gebunden werden. Ein Konsolidierungsdatum des ganzen Erlasses ist nicht automatisch das Inkrafttreten jedes einzelnen Artikels.

## 3. Arbeitsgrundlagen

- [Bundesrechtsinventar und gemeinsame Normenkette](sozialversicherungsinventar-ap19a.md)
- [ELG-/AVIG-Quellenpaket und Pfadmatrix](quellenpaket-ap19a-elg-avig.md)
- [KVG-Quellenpaket und Pfadmatrix](quellenpaket-ap19a-kvg.md)
- [Nationaler Modellcheck und Prüfbericht](../architektur/sozialversicherungsmodell-ap19a.md)
- [Maschinenlesbare Strukturprobe](../../tests/golden/candidates/ap19a-national-model.json)

Die Strukturprobe ist bewusst keine neue Fachberechnungsbibliothek. Sie prüft die Trennung von Bundesregel, Anbindung und Freigabe sowie die Sperren. Produktive Datumsarithmetik und die abgenommenen AP17-Referenzen werden nicht verändert. Ein eigener fachlicher Datumsreferenzvertrag für neue Laufzeitpfade folgt vor ihrer Integration, getrennt von rein strukturellen Erfolgsaussagen.

## 4. Schlanke Folgepakete

Es gilt WIP-Limit 1 und höchstens fünf Nettoarbeitstage pro Paket. Die Obergrenze ist kein Sollaufwand. Ein überschreitendes Paket wird vor Weiterarbeit geteilt. AP19A, AP19B und alle drei C-Teilpakete einschliesslich der C1-Bediennachträge sind abgenommen. Die erste Integrationstranche ist abgeschlossen. Die nachfolgende lokale Releasevorbereitung wurde am 28. September 2026 beauftragt und gestartet. Sie ist das einzige wesentliche aktive Arbeitspaket.

| Paket | Ergebnis | Haltepunkt |
| --- | --- | --- |
| AP19A · Fachinventar und Modellcheck | nationale Modellierung, begrenzte erste Pfadmatrix, belegte Ausnahmen, Struktur-/Sperrproben, Migrationsbedarf | Fachumfang und Modellstruktur durch David abgenommen. Keine Laufzeitfreigabe |
| AP19B · Konkreter Produktvertrag und Referenzen | Schemaversionierung, Consumer-Migration und vollständige positive/negative Fachreferenzen festlegen | abgenommen einschliesslich AVIV-Option B und statischer UI-Folge. DEC-2026-025 beschlossen |
| **AP19C1 · Technische Grundlage und ELG-Integration** | neuer Vertrag und Consumer, kontrollierte Migration, geprüfte ELG-Pfade im gemeinsamen UI, Regression einschliesslich fertigem SPFx-Bundle und beider Bediennachträge | am 28. September 2026 fachlich-technisch abgenommen. Keine operative Freigabe |
| AP19C2 · AVIG-Integration | vier nationale ALE-Regeln, acht konkrete Berner Kassen-/Amtsstellenanbindungen | am 28. September 2026 fachlich-technisch abgenommen. Datumseingabe vorerst unverändert, keine operative Freigabe |
| AP19C3 · KVG-Integration | vier nationale OKP-Pfade und vier Berner Produkt-/Gerichtsanbindungen mit sichtbaren Sachbereichsgrenzen | am 28. September 2026 fachlich-technisch abgenommen, keine operative Freigabe |
| Releasevorbereitung MVP 0.5 | zusammengehöriger Stand, Quellenaktualität, lokale Vorprüfung und E/Q/P-Prüfplan | Quellenprüfung abgenommen, lokale Datenübernahme und definitive Builds ausgeführt. Konkrete Bereitstellungen bleiben getrennte Haltepunkte |

EOG, FamZG, FLG, MVG und ÜLG folgen nach der ersten Tranche. Die Prüfung ausserkantonaler Feiertagsanknüpfungen in Berner Verfahren ist eine eigene nächste Ausbaustufe. Andere kantonale Verwaltungsverfahren und BVG-Wege bleiben separate Vorhaben.

## 5. Akzeptanzkriterien AP19A

1. Bundesregeln enthalten keine Berner Behörde, keinen fest eingebauten BE-Kalender und keine durch Kantonskopien vermehrten Regel-IDs.
2. Anbindung, Feiertagsraum und Freigabe sind getrennt. Ein Versicherer mit ausserkantonalem Sitz wird nicht allein deswegen abgelehnt oder einem anderen Rechtsweg zugeordnet. Die tatsächlich zuständige Stelle muss fachlich geklärt sein.
3. Mindestens ein unverändertes Bundesmodell lässt sich mit ausserkantonalen synthetischen Anbindungen strukturprüfen. Daraus folgt keine produktive Freigabe.
4. Unbekannte Quelle, fehlende Anbindung, unklare Eröffnung, nicht aufgelöster Feiertagsraum, Zeitlücke oder fehlende Freigabe erzeugen keine Berechnung. Übersteuerungen ändern diesen Grundsatz nicht.
5. ELG-, AVIG- und KVG-Ausnahmen sind konkret dokumentiert. Die bundesrechtliche Normenkette und die Berner Zuständigkeitsanbindung sind unterscheidbar.
6. Bestehende Produktformate, Datenreleases, Webarchiv, SPPKG und Benutzerdateien bleiben unverändert. Die Probe ist nicht in den Produktbuild importiert.
7. Ausgeführte Prüfungen, offene Fachpunkte und die noch ausstehende Abnahme werden getrennt ausgewiesen. Keine erfundene Abdeckungsquote.

## 6. Status und nächste Entscheidung

David hat den vorgelegten Erstumfang und die nationale Modellstruktur ausdrücklich abgenommen und den Beginn von AP19B bestätigt. Die [Abnahmenotiz](abnahme-ap19a.md) bindet den unveränderten AP19A-Vorlagestand. Die 22 Strukturreferenzen und 15 Governance-/Mutationstests bleiben ein Strukturbeleg, keine Produktfreigabe. Anschliessend hat David AP19B mit «OK. Inklusive Option B für AVIG abgenommen.» bestätigt. Die [AP19B-Abnahmenotiz](abnahme-ap19b.md) bindet Vertrag, Migrationsplan, Zeitabdeckung und fachliche Referenzen. DEC-2026-025 und die statische Feldbeschriftung sind bestätigt. Mit dem gesonderten Auftrag «Starte AP19C.» hat David die Umsetzung gestartet. Den [C1-Implementierungskandidaten](../architektur/implementierung-ap19c1.md) hat er am 28. September einschliesslich beider Bediennachträge [abgenommen](abnahme-ap19c1.md). Datenpromotion und operative Freigabe bleiben gesonderte Schritte.

Für die spätere öffentliche Projektführung enthält dieses Dokument den lokalen Issue-Entwurf: Nutzen, Umfang, Nichtumfang, Akzeptanzkriterien, Quellen und Entscheidbedarf. Ein GitHub-Issue oder eine Veröffentlichung wird nicht ohne gesonderten Publikationsauftrag erzeugt.

## 7. Abgrenzung zu MVP 0.4

MVP 0.4 ist technisch und fachlich in E/Q geprüft. Die fünf freigegebenen Commits wurden am 22. September 2026 auf GitHub veröffentlicht und öffentlich byteweise nachgeprüft. Die P-Umschaltung wurde am 23. September vor Austausch produktiver Dateien wegen der GET-Sicherheitsheader angehalten. Green kündigte in der vom Benutzer am 24. September mitgeteilten Zwischenantwort eine weitere Analyse durch den Hosting-Partner an. Ein neuer Livecheck oder eine Behebung ist damit nicht behauptet. P bleibt nach dem letzten verifizierten Stand 0.3.

Die ursprünglichen Releaseberichte behalten ihren damaligen Status als historische Nachweise. AP19A und AP19B bauen keine neuen 0.4-Artefakte und aktualisieren weder Mirrors noch App-Katalog oder Website. Bestehende offene Gast-/Outlooknachweise werden durch diese Pakete nicht geschlossen. Die Einzelheiten und tenantbezogene Evidenz bleiben in den privaten Ausführungsnachweisen.

## 8. AP19B-Vorlage und ausgeführte Prüfungen

Dieser Abschnitt hält die AP19B-Prüfung vor dem Start der Produktimplementierung fest. Die nachfolgenden historischen Zahlen und Nachweisgrenzen werden nicht rückwirkend um die C1-Prüfung erweitert.

| Unterlage | Abgenommener Gegenstand |
| --- | --- |
| [Produktvertrag](../architektur/sozialversicherungsvertrag-ap19b.md) und [DEC-2026-025](../entscheidungen/DEC-2026-025-sozialverfahrenskatalog-und-manifest-v5.md) | Eigenständiger Sozialverfahrenskatalog 1.0.0, Manifest-/Consumerformat 5.0.0, Restkatalog weiterhin 3.0.0. Nationale Regeln, kantonale Anbindung und konkrete Freigabe bleiben getrennt |
| [Quellenabgleich](quellenabgleich-ap19b.md) | Artikelbezogene Originalprüfung und konkrete BE-Anbindungen. Quellenfenster 2026–2027 einschliesslich AVIG-Option B mit Rekonstruktion aus amtlichem Änderungsrecht und vollständigem amtlichem Änderungsindex fachlich abgenommen. Erneute Quellenprüfung vor Kandidatenübernahme |
| [Datums- und Sperrreferenzen](referenzfaelle-ap19b.md) | 25 konkrete Sollrechnungen und 52 Sperrerwartungen über alle zwölf neuen Pfade fachlich abgenommen. Noch kein Produktintegrationstest |
| [Migrationsplan](../../tests/golden/candidates/ap19b-migration-plan.json) | Zwölf bestehende Sozialpfade eins zu eins zugeordnet. 33 übrige Definitionen, 40 Regime und vier Sperrkennungen im Erhaltungsplan nachgewiesen |

**Lokal ausgeführt am 25. September 2026 unter Node 22.23.2:**

- AP19A-Strukturprüfer mit allen 22 unveränderten Fällen erneut bestanden.
- AP19B-Referenzprüfer: 77 von 77 Fällen bestanden, davon 25 positiv und 52 gesperrt. Alle zwölf neuen Pfade positiv abgedeckt. 25 tabellarische Sollwerte gegen die Referenzdatei abgeglichen.
- AP19B-Migrationsplanprüfer bestanden. Er bindet den unveränderten Ausgangskatalog per SHA-256 und prüft eindeutige Zuordnung sowie vollständige Bestandsaufteilung.
- Gesamter lokaler Governance-Testordner: **83 Tests bestanden**, davon 15 AP19A-, 12 AP19B-Migrations-, 19 AP19B-Referenz- und 37 bestehende MVP-0.4-Quellen-/Abnahmetests. Die Datumsreferenzen sind in UTC, Zürich und New York identisch.
- Abschliessender SHA-256-Abgleich: alle sieben AP19A-Vorlagendateien, DEC-2026-024, Webarchiv, SPPKG, MVP-0.4-Manifest und Spezialregimekatalog sowie die drei vorbestehenden Benutzerdateien unverändert, insgesamt 15 geprüfte Dateien. 265 lokale Linkziele in den zehn bearbeiteten Markdown-Dokumenten vorhanden. Keine Änderungen an Produktcode, Produktdaten oder Produktschemas.

```sh
node scripts/check-ap19a-model.mjs
node scripts/check-ap19b-migration.mjs
node scripts/check-ap19b-references.mjs
node --test tests/governance/*.test.mjs
```

**Nachweisgrenze:** Die Migrationsprobe erzeugt keinen neuen Produktkatalog. Sie beweist noch keine semantische Gleichheit tatsächlich migrierter Daten. Die Datumsprobe verwendet eine eigene Zählung und vereinfacht qualifizierte Fallmerkmale. Sie ersetzt weder das vollständige neue Produktschema noch dessen künftige Routenprüfung oder einen Test des neuen Adapters mit der echten Engine. Diese Nachweise sind vor Kandidatenübernahme in AP19C zu erbringen. Es gab keinen Produktbuild, Commit, Push oder Deploymentschritt.

**Bestätigter enger UI-Entscheid:** Die weiterhin globale, statische Bezeichnung «Verfahrenskontext» für die Gemeinwesenauswahl ist mit AP19B bestätigt. So muss ein ausserkantonaler KVG-Versicherersitz nicht fälschlich als Bern bezeichnet werden. Im künftigen KVG-Verwaltungspfad bleibt der begrenzte Berner Produktumfang als kurze feste Voraussetzung sichtbar. Zum damaligen AP19B-Abschluss waren das Label «Sitz der zuständigen Stelle», das zweispaltige Raster und sämtliche Produktdateien noch unverändert. C1 setzt die statische Beschriftung nun um, ohne das zweispaltige Raster neu zu entwerfen.

Der fachliche und vertragliche Haltepunkt vor AP19C ist erfüllt. Die neun gebundenen AP19B-Vorlagendateien bleiben unverändert, auch dort enthaltene historische Entwurfs- und Kandidatenflags. Der aktuelle Status ergibt sich aus der Abnahmenotiz. Es besteht keine Publikations-, Installations- oder Betriebsfreigabe. Die damalige Abnahmenachführung startete AP19C nicht automatisch. Der anschliessende ausdrückliche Startauftrag ist in Abschnitt 9 nachgeführt.

## 9. AP19C1 · Lokaler Implementierungskandidat

Der Auftrag «Starte AP19C.» wird im ersten, eng begrenzten Paket C1 umgesetzt. [Implementierungszuordnung und Bedienvertrag](../architektur/implementierung-ap19c1.md) dokumentieren den nationalen Sozialresolver, Manifest-/Consumerformat 5.0.0, die kontrollierte Migration von zwölf bestehenden IVG-/AHVG-/UVG-Pfaden und die vier ELG-Pfade. AVIG und KVG werden noch nicht angeboten.

Der [erneute Quellenabgleich](quellenabgleich-ap19c1.md) und die [zeitliche Bindung](zeitliche-bindung-ap19c1.md) grenzen frische und wiederverwendete Belege sowie das positiv belegte Anwendungsintervall 2026–2027 ausdrücklich ab. Quelle, Regel, kantonale Anbindung, Kalender und konkrete Freigabe bleiben getrennt.

Die neuen und migrierten Sozialpfade des echten Datenkandidaten sind nicht freigegeben und berechnen deshalb kein Enddatum. Positive technische Referenztests verwenden nur isolierte synthetische Testfreigaben. Fallangaben und Zuständigkeitsdatum werden weder aus dem gespeicherten Verfahrenskontext abgeleitet noch in Standards gespeichert. Die zusätzliche Kantonswahl ist eine Fallangabe, keine Erweiterung des Berner Betriebsumfangs.

Der [technische Gesamtprüfnachweis](pruefbericht-ap19c1.md) und die Nachträge zur [Formularvereinfachung](ui-vereinfachung-ap19c1-2026-09-27.md) und [Datumseingabe](datumseingabe-ap19c1-2026-09-28.md) weisen die tatsächlichen Prüfungen und ihre Grenzen aus. David hat diesen vorgelegten Stand am 28. September 2026 [fachlich-technisch abgenommen](abnahme-ap19c1.md). Die Abnahmenotiz bindet die unveränderten Vorlagen. Deren damalige Hinweise auf eine ausstehende Abnahme bleiben als historische Angaben erhalten. Zum C1-Abschluss waren C2/C3 nicht gestartet. Bestehende MVP-0.4-Artefakte, E/Q/P, Mirrors und Zugriffsrechte bleiben unverändert.

## 10. AP19C2 · AVIG-Integration

David Steimer hat das Teilpaket am 28. September 2026 mit «Sehr gut. Dann gehen wir doch AP19C2 an.» gestartet. Der [Implementierungskandidat](../architektur/implementierung-ap19c2.md) enthält vier nationale ALE-Regeln mit acht eigenständigen Berner Kassen-/Amtsstellenanbindungen. Die Formatversionen bleiben unverändert. C1-Artefakte und historische Abnahmeunterlagen werden nicht überschrieben.

Der [Quellenrefresh](quellenabgleich-ap19c2.md) bestätigt die bereits abgenommene Option B für 2027. Die [zeitlichen Bindungen](zeitliche-bindung-ap19c2.md) trennen ursprüngliche Verfügung, laufenden Zuständigkeitsbezug und fristauslösende Zustellung. Die produktiven Herkunfts- und Kantonsangaben bleiben echte, nicht gespeicherte Fallangaben. Der zweispaltige und reduzierte Bedienvertrag einschliesslich früher Datumseingabe gilt weiter.

Der [Prüfbericht](pruefbericht-ap19c2.md) dokumentiert die abgeschlossene lokale QA. David Steimer hat den vorgelegten Stand am 28. September 2026 [fachlich-technisch abgenommen](abnahme-ap19c2.md). Die gebundenen Implementierungs-, Quellen- und Prüfunterlagen bleiben mit ihren damaligen Vorlagestatus unverändert. Die echte Vorschau verwendet weiterhin gesperrte Kandidatenflags. Es gab keinen Commit, Push, Deploymentschritt, Mirrorwechsel oder Eingriff in E/Q/P. Der anschliessende gesonderte KVG-Auftrag steht in Abschnitt 11.

## 11. AP19C3 · KVG-/OKP-Integration

David Steimer hat am 28. September 2026 mit «Danke, dann starten wir mit AP19C3.» die Umsetzung der vier abgenommenen OKP-Leistungspfade beauftragt. [Implementierung](../architektur/implementierung-ap19c3.md), [Quellenrefresh](quellenabgleich-ap19c3.md), [Zeitbindung](zeitliche-bindung-ap19c3.md) und [Prüfbericht](pruefbericht-ap19c3.md) dokumentieren den separaten Kandidaten.

Die Bundesregeln bleiben national. Im Verwaltungsstadium ist der tatsächliche Wohnsitz der versicherten Person am fristauslösenden Zustelltag die Berner Produktgrenze, nicht der Sitz des Krankenversicherers. Im Gerichtsverfahren bleiben Zuständigkeitskanton, Wohnsitz und Beschwerdezeitpunkt getrennt. Die Feiertagsanknüpfung ist in beiden Stadien unabhängig. Der zweispaltige Aufbau und die zuletzt bestätigte Datumseingabe bleiben erhalten. Redundante Dokument- und Modellinformationen stehen in der Rechenspur.

Der Stand umfasst 24 Bundesregeln und 28 Berner Anbindungen. David Steimer hat ihn am 28. September 2026 mit «AP19C3 ist abgenommen.» [fachlich-technisch abgenommen](abnahme-ap19c3.md). Zusammen mit C1 und C2 ist damit die erste AP19-Integrationstranche abgeschlossen. Die gebundenen Implementierungs-, Quellen-, Zeit- und Prüfunterlagen bleiben mit ihren damaligen Vorlagestatus unverändert.

Alle Sozialfreigaben im Datenbestand bleiben Kandidaten. Positive Rechenprüfungen mit synthetischen Freigaben im Testspeicher sind keine operative Aktivierung. Der Auftrag zur Releasevorbereitung wurde nach der Abnahme separat erteilt, siehe Abschnitt 12. Bestehende Datenkandidaten, gebundene Vorlagen, MVP 0.4, E/Q/P und Berechtigungen bleiben bei dieser Vorbereitung unverändert.

Der zur Abnahme vorgelegte lokale Endlauf ist bestanden: 1’087 Kern-/UI-Tests, 7 öffentliche App-Tests, 116 Python-Datenprüfungen, 79 SPFx-Quell-/Transporttests und 39 Prüfungen des tatsächlich kompilierten Consumers. Alle 53 Bestandsschutzprüfungen sind unverändert. Die historischen Prüfzahlen werden durch die Abnahmenachführung nicht als erneut ausgeführter Gesamttest ausgewiesen. Der Prüfbericht dokumentiert Browserstichprobe und synthetische Rechenfreigaben, der aktuelle menschliche Abnahmestatus ergibt sich aus der gesonderten Notiz.

**Weitergeltender Bedienentscheid aus AP19C2:** Das zusätzliche Datum der Beschwerdeerhebung und die übrigen Zuständigkeitszeitanker bleiben vorerst unverändert. Die diskutierte Vereinfachung wird nicht umgesetzt. Eine erneute Beurteilung erfolgt nach allfälligem Benutzerfeedback, ohne terminierte Ausblendung oder bereits beauftragten Implementierungsnachtrag.

## 12. Releasevorbereitung MVP 0.5

David Steimer hat am 28. September 2026 erklärt: «Dann starten wir die Releasevorbereitung und hoffen auf den Support.» Damit ist die lokale Zusammenführung der abgenommenen ersten Tranche beauftragt. [Bereitstellungsplan und Sollprüfungen](../betrieb/deployment-mvp-05.md), [Quelleninventar und Prüfplan](quellenpruefplan-mvp05.md) sowie der [gebundene Eingangssnapshot](../../outputs/release-mvp05-2026-09-28/preparation-inputs.json) dokumentieren den getrennten Folgeprozess.

David hat anschliessend die [zusammengeführte Quellenprüfung einschliesslich Wiederverwendung und Vorbehalten](abnahme-quellenpruefung-mvp05.md) abgenommen und die kontrollierte lokale Datenübernahme sowie den Bau der definitiven Artefakte freigegeben. MVP/App `0.5.0`, Paket `0.5.0.0` und Datenrelease `2026-09-28-mvp-05-approved.1` sind nun lokal erzeugt. Die regulären lokalen Einstiege verwenden diesen freigegebenen Datenstand. Alle 28 bernischen Anbindungen binden den tatsächlichen Entscheid. Die früheren Kandidaten und ihre Sperren bleiben separat unverändert erhalten.

Der [lokale Abschlussnachweis](../betrieb/releaseartefakte-mvp-05.md) nennt die exakten Dateien, Prüfsummen und Tests. E-/Q-Installation, Veröffentlichung und P bleiben gesondert zu autorisieren. Die offene Green-Abklärung blockiert weiterhin die P-Bereitstellung, nicht die lokalen Arbeiten. Es gibt keinen automatischen Ersatz des noch offenen MVP-0.4-P-Auftrags durch MVP 0.5.

## Verantwortlichkeit

David Steimer ist Fachverantwortlicher und entscheidet in Personalunion über Abnahmen. Codex führt Recherche, Entwurf und technische Prüfungen als KI-Arbeitsinstrument durch. Parallel beigezogene KI-Prüfungen sind keine unabhängige zweite menschliche Fachfreigabe.
