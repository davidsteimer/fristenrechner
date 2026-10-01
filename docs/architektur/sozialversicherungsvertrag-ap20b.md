# AP20B Vertragsnachtrag für EOG, FamZG, FLG, MVG und ÜLG

Stand: 30. September 2026. **Vorlage zur fachlich-technischen Abnahme und zu DEC-2026-026. Noch keine beschlossene Formaterweiterung oder Produktintegration.** Auftrag: «Starte AP20B.» [Issue #40](https://github.com/davidsteimer/fristenrechner/issues/40), übergeordnet [#35](https://github.com/davidsteimer/fristenrechner/issues/35).

Die [AP20A-Abnahme](../fachrecht/abnahme-ap20a.md) bleibt unverändert. Dieser Nachtrag konkretisiert den dort bestätigten Bedarf. Er baut auf [DEC-2026-024](../entscheidungen/DEC-2026-024-nationales-sozialversicherungsmodell.md), [DEC-2026-025](../entscheidungen/DEC-2026-025-sozialverfahrenskatalog-und-manifest-v5.md) und dem [AP19B-Vertrag](sozialversicherungsvertrag-ap19b.md) auf.

## 1. Ergebnis in Kürze

- 20 zusätzliche nationale Regeln, je vier für EOG, FamZG, FLG, MVG und ÜLG, verwenden ausschliesslich den bestehenden ATSG-Tagesrechenkern.
- 22 zusätzliche bernische Anbindungen. EOG benötigt zwei unterschiedliche Gerichtsrouten. Zusammen mit dem unveränderten Bestand ergibt dies perspektivisch **44 nationale Regeln und 50 Berner Anbindungen**.
- Vier neue Faktenfelder und zwei zusätzliche Herkunftswerte. Keine freie Regelsprache, keine automatische Zuständigkeitsbestimmung aus Leistungs- oder Personendaten.
- Beantragtes Quellen- und Referenzfenster **01.01.2026–31.12.2027**, einschliesslich unmittelbar geprüfter künftiger Bundesfassungen. Noch keine zeitliche Produktfreigabe.
- Vorschlag: Sozialverfahrenskatalog **2.0.0**, Manifest **6.0.0**, Mindestconsumer **6.0.0**. Die übrigen Komponenten behalten ihre Formate.
- Ausführbare, vom Produkt getrennte Testprobe und Datumsreferenzen. Der unveränderte alte Consumer lehnt neue Formate, Erlasse und Fakten ab. Die Umsetzung des neuen Consumers gehört erst zu AP20C.

## 2. Begrenztes Formatdelta

| Bestandteil | MVP 0.5 | Vorgeschlagener Folgevertrag | Änderung |
| --- | --- | --- | --- |
| `socialProcedureCatalog` | 1.0.0 | **2.0.0** | Geschlossene Erlass-/Fakten-/Herkunftslisten erweitern, neue eindeutige Zuordnungen |
| Release-Manifest | 5.0.0 | **6.0.0** | Unterstützte Kombination mit Sozialkomponente 2.0.0 ausdrücklich kennzeichnen |
| Mindestconsumer | 5.0.0 | **6.0.0** | Keine verdeckte Teilverarbeitung durch ältere Verbraucher |
| Rest-Spezialregime | 3.0.0 | 3.0.0 | unverändert |
| Feiertagskatalog | 1.0.0 | 1.0.0 | unverändert |
| Regelbasierte Kalender | 2.0.0 | 2.0.0 | unverändert |
| Fristenprofile | 1.0.0 | 1.0.0 | unverändert |

Die Hauptversionsgrenze ist bewusst konservativ. Die bisherigen Typen, JSON-Schemata und Laufzeitvalidatoren kennen geschlossene Wertemengen und die Kombination Manifest 5 / Sozialkomponente 1. Ein blosser Datennachtrag im alten Format wäre deshalb keine kompatible Erweiterung. Ein Minor-Format mit Mindestconsumer 6 wäre möglich, brächte im bestehenden exakten Versionsvertrag aber keinen praktischen Vorteil und eine zusätzliche Kompatibilitätskombination.

Die Aggregateversion 6 ändert nicht die Mirror-Topologie: weiterhin zehn manifestgebundene Datendateien und das Manifest, insgesamt elf Dateien. Keine zusätzliche Infrastruktur, keine neue API, keine neue M365-Berechtigung. Eine spätere Anwendungsversion oder Paketnummer wird hier nicht vergeben.

Die bestehenden Strukturen `federalRules`, `cantonalBindings`, `releaseEligibility`, `normBindings`, `calendarBindings` und `excludedPaths` bleiben erhalten. Neue Schemadateien sind für AP20C vorgesehen. AP20B schreibt die produktiven Schemata nicht bereits um.

## 3. Nationale Pfade und feste Identitäten

Für jeden der fünf Gesetzescodes `EOG`, `FAMZG`, `FLG`, `MVG`, `UELG` entstehen genau die folgenden IDs. Im Feld `law` stehen die entsprechenden Kleinbuchstabenwerte `eog`, `famzg`, `flg`, `mvg`, `uelg`.

| ID-Muster | Handlung / Stadium | Modellierter Auslöser | Dauer |
| --- | --- | --- | --- |
| `CH-SOC-{GESETZ}-OBJ` | Einsprache / Verwaltung | `initial-benefit-disposition`, formelle individuelle Leistungsverfügung | gesetzlich 30 Tage |
| `CH-SOC-{GESETZ}-APP` | Ordentliche Beschwerde / kantonales Versicherungsgericht | `objection-decision`, Einspracheentscheid | gesetzlich 30 Tage |
| `CH-SOC-{GESETZ}-ADM` | Angeordnete Verwaltungstagesfrist | `authority-day-order`, konkret qualifizierte Anordnung | eingegebene ganze Tageszahl 1–365 |
| `CH-SOC-{GESETZ}-CORRECTION` | Formelle Beschwerdeverbesserung / kantonales Versicherungsgericht | `court-correction-day-order`, eng qualifizierte Verbesserungsanordnung | eingegebene ganze Tageszahl 1–365 |

Bei fester Dauer enthält die spätere Laufzeiteingabe kein übersteuerndes `days`, auch nicht `days: 30`. Die Testprobe verwendet dagegen normalisierte Sollfallparameter einschliesslich der effektiven Dauer. Sie ist keine Kopie der Produkt-API. Handlungswerte bleiben `objection`, `appeal`, `ordered-administrative-days`, `complaint-correction`.

Die fünf positiven Sachbereiche heissen:

| Gesetz | `matter` | Herkunft des zugrunde liegenden Leistungsentscheids |
| --- | --- | --- |
| EOG | `eog-federal-individual-benefits` | `compensationOffice` |
| FamZG | `famzg-statutory-individual-benefits` | **`familyCompensationOffice`** |
| FLG | `flg-individual-benefits` | `compensationOffice` |
| MVG | `mvg-individual-benefits` | **`militaryInsurer`** |
| ÜLG | `uelg-federal-individual-benefits` | `compensationOffice` |

Für die neuen CORRECTION-Pfade bezeichnet `decisionOrigin` weiterhin die Verwaltungsherkunft des zugrunde liegenden Leistungsstreits. Die aktuelle gerichtliche Anordnung ergibt sich aus Handlung, Stadium und `triggerKind`. Bestehende AP19-Datensätze werden dadurch nicht rückwirkend semantisch umgeschrieben.

Alle neuen Regeln verwenden `S_ATSG`, `F7_ATSG_DISPATCH`, individuelle Eröffnung, `partyOrRepresentative` und `nextWorkingDay`. Ein allgemeiner «ATSG»-Sammelpfad wird nicht eingeführt.

## 4. Neue Fakten und konkrete Anbindungen

| Neues Feld | Geschlossene Werte | Bedeutung |
| --- | --- | --- |
| `eogOfficeType` | `cantonal`, `nonCantonal` | Typ der zuständigen, im angefochtenen EO-Fall verfügenden Kasse. Nichtkantonal umfasst insbesondere Verbandskassen und die EAK |
| `compensationOfficeCanton` | 26 Kantonscodes | Zuständige kantonale Kasse des EOG-/FLG-Ausgangsfalls, nicht beliebiger Bearbeitungsort |
| `familyAllowanceOrderCanton` | 26 Kantonscodes | Für die streitige Leistung tatsächlich anwendbare Familienzulagenordnung |
| `uelgAdministrativeCanton` | 26 Kantonscodes | Eigenständig qualifizierte administrative Zuständigkeit nach Art. 19 ÜLG |

Für die übrigen bestehenden Fallfaktenfelder werden keine zusätzlichen Werte eingeführt. Die fünf Gesetzescodes und zwei Herkunftswerte werden wie beschrieben ergänzt. `competentBodyQualified`, `courtCanton`, `partyDomicileCanton` und `jurisdictionSpecialCase` werden wiederverwendet. Jede neue Route verlangt einen qualifizierten zuständigen Träger, die richtige Verwaltungsherkunft und den ordentlichen Inlandsfall. Auslands-, Dritt- und unklare Fälle bleiben gesperrt.

| Routengruppe / ID | Handlungen | Zusätzliche erforderliche Fakten | Art |
| --- | --- | --- | --- |
| `EOG-ADMIN` | OBJ, ADM | Wohnsitz BE am Eröffnungstag | Produktgrenze |
| `EOG-CANTONAL` | APP, CORRECTION | kantonale Kasse, Kassenkanton BE, Gericht BE | gesetzliche Sonderzuständigkeit |
| `EOG-ORDINARY` | APP, CORRECTION | nichtkantonale Kasse, Gericht BE, Wohnsitz BE bei Beschwerdeerhebung | ordentliche ATSG-Zuständigkeit |
| `FAMZG-ADMIN` | OBJ, ADM | anwendbare Zulagenordnung BE | gesetzliche Anbindung |
| `FAMZG-COURT` | APP, CORRECTION | anwendbare Zulagenordnung BE, Gericht BE | gesetzliche Sonderzuständigkeit |
| `FLG-ADMIN` | OBJ, ADM | zuständige kantonale Kasse BE | gesetzliche Anbindung |
| `FLG-COURT` | APP, CORRECTION | zuständige kantonale Kasse BE, Gericht BE | gesetzliche Sonderzuständigkeit |
| `MVG-ADMIN` | OBJ, ADM | Wohnsitz BE am Eröffnungstag | Produktgrenze |
| `MVG-COURT` | APP, CORRECTION | Gericht BE, Wohnsitz BE bei Beschwerdeerhebung | ordentliche ATSG-Zuständigkeit |
| `UELG-ADMIN` | OBJ, ADM | administrative Zuständigkeit BE | gesetzliche Anbindung |
| `UELG-COURT` | APP, CORRECTION | Gericht BE, Wohnsitz BE bei Beschwerdeerhebung | ordentliche ATSG-Zuständigkeit |

Pro Zeile entstehen zwei Anbindungen mit ID `BE-SOC-{ROUTENGRUPPE}-{HANDLUNG}`. Die jeweilige `contextRouteId` ist `be-soc-{routengruppe in Kleinbuchstaben}`. Jede Anbindung hat genau eine Route. Das ist ein Vorschlag für AP20C, kein bereits aktiver Datenbestand. Die [maschinenlesbare Strukturprobe](../../tests/golden/candidates/ap20b-social-contract.json) bindet diese elf Gruppen und die erlaubten Fakten.

Die Faktenmenge muss exakt der gewählten Route entsprechen. Fehlende, widersprüchliche oder zusätzliche Fakten sperren. Es wird nicht still auf eine andere EOG-Gerichtsroute oder auf allgemeines VRPG gewechselt. Ein Zuständigkeitswechsel verlangt eine neue Qualifikation, nicht die Wiederverwendung eines gespeicherten Fallbefunds.

### Grenze der Zuständigkeitsprüfung

Der Rechner bestimmt weder die EO-Kasse aus Dienst-/Geburts-/Urlaubsdaten noch die FamZG-Ordnung aus Erwerbsverläufen. Beispielsweise weist Art. 35q EOV die Adoptionsentschädigung der EAK zu. Eine fachlich als falsch erkannte kantonale Kasse muss die allgemeine Zuständigkeitsqualifikation verfehlen. Der Rechner erkennt ohne Leistungstyp diese Fehlzuordnung **nicht selbst**. Der zugehörige Sperrtest belegt die Verarbeitung eines negativen Qualifikationsbefunds, keine automatische Subsumtion unter Art. 35q EOV. Allein dafür entsteht kein zusätzliches Pflichtfeld im GUI.

EOG-Verwaltung mit zuständiger ausserkantonaler Kasse bleibt bei erfüllter BE-Wohnsitz-Produktgrenze möglich. Im kantonalen EOG-Gerichtspfad, bei FamZG und bei FLG darf umgekehrt kein allgemeiner BE-Wohnsitzfilter hinzukommen. Die drei Sondernormen werden nicht durch Art. 58 ATSG ersetzt.

## 5. Zeit, Quellen und Feiertage

Massgebend sind der [Bundesquellenabgleich](../fachrecht/quellenabgleich-ap20b-bund.md) und die [bernische Zeitbindung](../fachrecht/zeitliche-bindung-ap20b.md). Sie unterscheiden die tatsächlichen Gesetzesfassungen von den verwendeten Einzelartikeln.

- EOG/MVG-Verwaltung: Produktwohnsitz am `legalTriggerDate`. Die gesetzliche Kassen-/Trägerzuständigkeit wird daneben für den konkreten Leistungsfall qualifiziert.
- Gericht: `jurisdictionReferenceDate` für die anzuwendende Zuständigkeitsnorm und den Wohnsitz nach Art. 58 ATSG. Herkunftskasse und FamZG-Ordnung beziehen sich weiterhin auf den angefochtenen Leistungsfall, nicht auf heutige Verhältnisse.
- CORRECTION: Zuständigkeitsdatum der bestehenden Beschwerde nicht nach Eröffnung der Verbesserungsanordnung. Ein zusätzliches `procedureStartDate` ist hier nicht zwingend, wenn die qualifizierte Handlung und Beschwerdeerhebung feststehen.
- Optional eingegebene Verfahrensdaten müssen gültig und vom geprüften Fenster erfasst sein. Notwendige Daten werden weder aus dem Zustelltag noch aus persönlichen Standards erfunden.
- Auslöser, relevante Bezugsdaten und vollständiger Rechenweg einschliesslich Stillstand und Verschiebung müssen gedeckt sein. Aus einem Start 2027 folgt keine Freigabe eines Ergebnisses 2028.

`legalValidity`, `caseCoverage`, `sourceCoverage` und die operative Freigabe bleiben getrennt. AP20B legt noch keine produktiven Werte für `legalValidity` fest. In AP20C darf als rechtlich nachgewiesenes Anwendungsintervall höchstens das abgeglichene Fenster verwendet werden. Dessen Anfang ist keine Behauptung über das erstmalige Inkrafttreten der ganzen zusammengesetzten Regel und dessen Ende keine Behauptung einer gesetzlichen Aufhebung. Wo erforderlich, bleibt die ursprüngliche Normgeltung offen und wird nicht aus dem Konsolidierungsdatum erfunden.

**Unveränderte Norm über neue Konsolidierungen:** Eine neue Fassung des Gesamterlasses beendet nicht automatisch eine unveränderte Fristnorm. Für EOG/EOV/FLG belegen die einzeln referenzierten Originale und der Vergleich die Kontinuität über den 01.07.2027. Eine gemeinsame Normbindung über 2026–2027 ist nur mit diesem artikelgenauen Nachweis zulässig. Der Quellenindex des späteren Release muss die Originalkette und ihren Vergleich binden. Keine zukünftige Fassung wird rückwirkend als einziges Original ausgegeben. Der Normbeleg kann an der im Fenster bereits geltenden Originalfassung ansetzen und ihre unveränderte Fortgeltung durch die zusätzlich dokumentierten Folgefassungen belegen. Ein blosses Konsolidierungsdatum darf die Berechnung über den Stichtag nicht abschneiden. Bei tatsächlich geändertem Tragartikel ist eine neue Revision mit Übergangsprüfung erforderlich.

Der Feiertagsbefund bleibt unabhängig. Erste Anbindungen verwenden ausschliesslich die bereits geprüften CH-/BE-Kombinationen mit qualifizierter Partei-/Vertretungsanknüpfung. Weder Gerichtskanton, Kassensitz noch Produktwohnsitz ersetzt diesen Befund. Die schweizweite Feiertagsgrundlage aktiviert noch keine weiteren kantonalen Sozialverfahren.

## 6. Positive und ausgeschlossene Sachbereiche

Der positive FamZG-Bundesbereich umfasst die gesetzlich erfassten höheren kantonalen Ansätze und Geburts-/Adoptionszulagen. Die konkrete BE-Anbindung bleibt auf die qualifizierten obligatorischen bernischen Fälle beschränkt. **Freiwillige Kassenleistungen bleiben unmodelliert**, nicht pauschal ausserhalb des ATSG. Art. 2, 26 und 27 KFamZG verlangen eine gesonderte Leistungs- und Rechtswegqualifikation.

EOG bleibt auf bundesrechtliche individuelle Leistungen beschränkt. Die ab 2027 zusätzlich vorgesehenen rein kantonalen Ergänzungsmöglichkeiten werden nicht mitaktiviert. Weitere explizite Sperren betreffen formlose EO-Abrechnungen als Einspracheauslöser, FamZG-Organisationshilfen, FLG-Zusatzleistungen ausserhalb des qualifizierten Bundeswegs, MVG-Medizinal-/Tarifstreitigkeiten, materielle ÜLG-Geltendmachungsfristen und behördliche ÜLV-Bearbeitungsfristen. Ein MVV-Vorbescheid ist keine neue feste 30-Tage-Einwandfrist. Nur eine konkret qualifizierte positive Tagesanordnung kann den ADM-Pfad nutzen.

Alle übrigen Spezialwege aus AP20A bleiben ausgeschlossen. Die Strukturprobe führt unterschiedliche Sperrgründe, statt jede Begrenzung als gesetzliche ATSG-Ausnahme auszugeben.

## 7. Migration und Rückwärtskompatibilität

AP20C muss die bestehenden 24 Bundesregeln und 28 Anbindungen mit Identitäten, Revisionen, Bedeutungen, Zeitbindungen und Freigabestatus erhalten. Keine stillen Neuinterpretationen, insbesondere keine Umdeutung alter `decisionOrigin`-Werte. Referenz- und Objekthashes bleiben für unveränderte Objekte identisch. Die neue Komponentendatei erhält aufgrund ihrer Format- und Inhaltserweiterung selbstverständlich einen neuen Dateihash.

Bestehende Freigaben dürfen nicht bloss mit alter `releaseId` in einen neuen Release kopiert werden. Kandidaten behalten `status: candidate` und `approval: null`. Die späteren Freigabeverknüpfungen müssen das neue konkrete Release, die exakten Regel-/Anbindungshashes, Kalender, Quellenprüfung und Referenzsuite neu binden. Der Quellen-/Promotionsprozess bleibt gesondert.

Der neue Consumer muss die bisher unterstützten Formate 1–5 weiter lesen können und Format 6 ausdrücklich ergänzen. Format-6-Daten mit Sozialkomponente 1 oder Format-5-Daten mit Sozialkomponente 2 werden nicht durch blosses Umetikettieren zugelassen. Alte Releases und die historische AP5-Ansicht bleiben auf ihren ursprünglichen Datenpins. Kein Überschreiben alter Releaseverzeichnisse, keine automatische Umstellung von Mirrors.

Die aktuelle Kompatibilitätsprobe zeigt nur: Der unveränderte alte Reader akzeptiert seinen Bestand und verwirft die neuen Werte. Sie belegt noch nicht, dass ein erst zu implementierender Reader 6 den gesamten Altbestand korrekt verarbeitet. Dieser positive Migrationsnachweis ist ein ausdrückliches AP20C-Abnahmekriterium.

## 8. Bedienung und Umsetzungspaket

DE und FR, zweispaltiger Aufbau, frühe Datumseingabe und die bisherigen vier Aktionsschaltflächen bleiben erhalten. Dokumenttyp und Zuständigkeit werden nicht wieder als redundante Pflichtauswahl aufgebaut. Modellinformationen gehören in die Rechenspur. Persönliche Standards dürfen die häufige Auswahl erleichtern, aber keine fallbezogenen Zuständigkeitsbefunde bestätigen.

Nur echte Alternativen werden auswählbar: insbesondere kantonale oder nichtkantonale EO-Herkunft im Gerichtspfad. Werte, die durch den gewählten Modellpfad feststehen, werden wie bisher fest angezeigt. Kein neues pauschales Bestätigungskästchen. Bei fehlender Qualifikation keine Berechnung und kein Rückfallwert.

Vorgeschlagene spätere Durchführung, jeweils separat und mit WIP-Limit 1:

1. **AP20C1:** Consumer-/Schemadelta, Bestandserhaltung und die zwei EOG-Gerichtsrouten. Nationales Modell bleibt kantonsneutral.
2. **AP20C2:** FamZG/FLG-Zuordnungen und reduzierte DE-/FR-Bedienung.
3. **AP20C3:** MVG/ÜLG, Gesamtregression und Integration aller 20/22 Pfade.

Jedes Teilpaket bleibt unter der vereinbarten Obergrenze von fünf Nettoarbeitstagen. Diese Unterteilung ist eine Umsetzungsempfehlung, kein schon erteilter Startauftrag oder Aufwandversprechen.

## 9. Nachweise und Abnahmebedarf

- [Referenzfälle und technischer Prüfnachweis](../fachrecht/referenzfaelle-ap20b.md)
- [Entscheidungsvorschlag DEC-2026-026](../entscheidungen/DEC-2026-026-sozialverfahrenskatalog-v2.md)
- [Bundesquellen](../fachrecht/quellenabgleich-ap20b-bund.md) und [Zeitanker/Bern](../fachrecht/zeitliche-bindung-ap20b.md)
- [Isolierte Strukturprobe](../../tests/golden/candidates/ap20b-social-contract.json) und [literal erfasste Datumsvektoren](../../tests/golden/candidates/ap20b-social-dates.json)

Die konkreten Formatversionen, Zeitanker, Quellenspanne und Referenzen sind jetzt zur Abnahme vorgelegt. David Steimer entscheidet in Personalunion. Codex dokumentiert und prüft als KI-Arbeitsinstrument ohne formelle Freigabe- oder Haftungsverantwortung. AP20B verändert weder MVP 0.5 noch die freigegebene AP20A-Vorlage. Kein Commit, Push, neuer Releasebuild, Deployment, Mirrorwechsel oder Berechtigungsdelta. Reversible lokale Testläufe sind keine Erstellung definitiver Releaseartefakte.
