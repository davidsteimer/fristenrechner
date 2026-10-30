# AP23G2 Kritischer Vertragsabgleich

Stand: 22. Oktober 2026. Technischer Gegencheck der abgenommenen AP23G1-Grundlage gegen den unveränderten AP23F3-Vertrag. Keine Produktänderung, kein neuer Formatbeschluss und keine operative Freigabe.

## Ergebnis

**Kantonalverfahrenskatalog 4.0.0 sowie Manifest und Mindestconsumer 11.0.0 sind als technischer Vorschlag sachlich begründet.** Die Tagesarithmetik, Regelkalender 3 und Feiertagskatalog 2 benötigen für die abgenommenen Recheneffekte keine neue Komponentenhauptversion. Die Grenze liegt in der geschlossenen Fallqualifikation, der Warn-/Grenzsemantik und den exakt fixierten Bestandsidentitäten des alten Readers.

Die Root-Variante mit weiterhin 33 physischen Kalendern und 42 Artefakten ohne Manifest ist vertretbar. Der neue SH-Verwaltungsweg benötigt dann aber eine tatsächlich geprüfte eigenständige VRG-Praxisbindung. Gleiche Datumswerte allein genügen nicht. Die unten beschriebenen Bindungs- und Negativtests sind dafür Teil des Vertrags, nicht blosse erläuternde Prosa.

## Gelesener Stand

Vollständig gelesen wurden die gemeinsame G1-Fachvorlage und die 115 Fälle in `docs/fachrecht/ap23g1/referenzfaelle.json`. Geprüft sind zusätzlich die V3-Typen, Katalogvalidierung, produktive Verwaltungsberechnung, Format-10-Reader und Kalenderaktivierung sowie die F2-Schema-/Strukturgeneratoren und F3-Inventar-/Rebindinglogik.

| Bestand | Tatsächlicher Umfang |
| --- | ---: |
| Katalogerlasse ohne separates BE-Profil | 8 |
| Pfade / Qualifikationsregeln | je 42 |
| Stillstandsprofile | 14 |
| Rechtliche Feiertagsbindungen | 9 |
| Katalogquellen | 34 |
| Ausdrückliche Ausschlüsse | 16 |
| Kalender / Manifestartefakte | 33 / 42 |
| Feiertagsbasisregeln / gesonderte SO-Regeln | 479 / 12 |
| Projektionen / Kalenderquellenbelege | 33 / 157 |

Bei unveränderter physischer Kalenderstruktur ergeben 16 neue Wege 58 Pfade und Qualifikationsregeln, drei neue Erlasse insgesamt elf und je zwei neue Stillstandsprofile pro Kanton insgesamt 20. Vier neue Feiertagsverwendungen, UR, SO, SH-Verwaltung und SH-Gericht, ergeben insgesamt 13. Quellen- und Ausschlusszahlen sind erst am tatsächlichen Kandidaten festzulegen.

## Nachgewiesene Vertragslücken

| G1-Bedeutung | Aktuelle Grenze | Kleinste saubere Entwicklung |
| --- | --- | --- |
| Vier eigenständige Begründungsverlangen | `AdministrativeQualificationRequirementsV3.action` erlaubt nur gewöhnliches Rechtsmittel, Eingabe, Vollstreckung, Massnahme und Zwischenmassnahme. `reasonRequest` steht in V2 nur als negativer Fallwert. Positive Policies erlauben ausschliesslich `qualifiedCompleteActualDelivery` | Neuer positiver V4-Policyzweig mit eigenen Handlungen und präzisen Eröffnungs-/Entscheidarten. Nicht als `ordinaryAppeal` oder gewöhnliche Verfahrenseingabe umetikettieren |
| SO-/SH-Begründungsangebot | Unbestrittene Belehrung ist kein Beleg eines überhaupt vorhandenen ausdrücklichen Begründungsangebots | Qualifizierten Eröffnungstyp beziehungsweise Anforderungsangebotsfakt positiv binden. SO/SH ohne Angebot und SH-Vollgutheissung nach Art. 8 Abs. 3 Bst. a müssen negativ bleiben |
| Spätere begründete Eröffnung | Weder V3-Policy noch aktueller geschlossener Fallinput unterscheiden ursprüngliche Eröffnung und spätere Begründung nach Gesuch | Eröffnungsherkunft und rechtzeitige Voranforderung unterscheiden. Beim zweiten Schritt nur `timelyEstablished` positiv. Bei ursprünglicher Eröffnung keine erfundene Voranforderung verlangen |
| Konkretes Zielgericht und Empfängerbeziehung | `targetBody: administrativeCourt` ist eine Organart. Es bindet nicht das konkrete Obergericht oder die Identität von eröffnendem und empfangendem Gericht | Neue Wege mit konkreter Zielinstitution und bei SH-Begründungsverlangen mit derselben eröffnenden Gerichtsidentität binden. Ein unteres Spezialverwaltungsgericht oder Bundesgerichtsweiterzug darf keine 30-Tage-Berechnung erhalten |
| UR Art. 22 | Ergebnisvertrag kennt Zählung und Sperre, aber keinen eigenständig gebundenen Eröffnungshinweis. Stillstandsprofile würden die Rechtsfolge verfälschen | Eigenes deklaratives Hinweisprofil, nur auf die beiden UR-Zwanzigtagewege gebunden. Acht Tage vor/nach Ostern und 18. Dezember bis 6. Januar, Prüfung nur am Eröffnungsdatum. Keine Veränderung des Empfangs, der Zähltage oder des Enddatums |
| UR besondere Eröffnungsfolge und lokale Endtagswirkung | Aktueller `explicitHolidayException` ist keine passende Sammelbezeichnung für alle diese Fallfakten. V3 hat keine abgestufte lokale UR-Grenze | Eigenständige aktuelle Fallqualifikation mit negativen/unklaren Zuständen. Konkrete ungeklärte örtliche Endtagswirkung sperrt. Eine bloss fehlende Gemeindeliste ist nicht automatisch eine positive oder negative Falltatsache |
| UR koordinierte Verfügungen | V3 unterscheidet keine Koordinationslage | Koordinationsgrenze nur an die zwei UR-Beschwerdepfade binden. Keine pauschale Längstfristbehauptung für bekannte angeordnete Eingabedauer oder Begründungsanforderung |
| SH expliziter Gerichtsort | `AdministrativeHolidayBinding.anchor`, `AdministrativeProvenance.holidayRole` und Schema sind fest `authoritySeat`. Die Erlassprüfung erlaubt nur `noneIdentifiedInReviewedGeneralLaw` | Neue SH-Gerichtsbindung rechtlich als `courtSeat` ausweisen. Stufenspezifische ausdrückliche Normabweichung darstellen. Geografisch gleicher Ort erlaubt keine falsche Rechtsrollenbeschreibung |
| SH administrativer Berchtoldstag | Vorhandene Datumsprojektion enthält den `SH-ZPO-ADDITIONAL`-Bereich mit OGE-2018-Herkunft, nicht die neue administrative BGer-Praxis | Eigenständige Verwaltungsbindung mit VRG/RTG und BGer 2C_483/2025 E. 3.1, Quellenreichweite und nicht tragendem Evidenzstatus. Alte StPO-/ZPO-Bindungen unverändert |
| Sieben neue Endverschiebungsgrenzen | Die Arithmetik unterstützt die Sicherung bereits, V3 akzeptiert aber nur die exakten bisherigen Pfaddefinitionen | Bestehenden `blockWhenEnteringApplicableSuspension`-Effekt nur an die sieben neuen Gerichtsgruppen binden. Keine neue Berechnungsmethode und keine Verwaltungssperre |

Die Belege für diese Grenzen stehen insbesondere in `src/core/administrativeTypesV3.ts`, `src/core/administrativeTypes.ts`, `src/core/administrativeCatalogV3.ts`, `src/core/administrativeDeadline.ts` und `schemas/administrative-procedure-catalog-v3.schema.json`.

## Format- und Identitätsentwicklung

Der native V3-Validator prüft alle Pfade, Policies, Erlasse, Stillstände, Ausschlüsse, Quellenidentitäten und rechtlichen Feiertagsbindungen gegen die exakten AP23F3-Snapshots. Neue 16 Gruppen passen deshalb nicht schon dadurch, dass allgemeine Schemafelder wie `lawId` oder `action` Zeichenketten zulassen. Ein neu berechneter Hash ist keine Erlaubnis zur Definitionsänderung.

Format 10 bindet zusätzlich 33 Kalender, 42 unterschiedliche Artefakthashes, den vollständigen Inhalts-Snapshot des Feiertagskatalogs und den Katalog-3-Reader. Das unveränderte Format-10-Manifestschema verlangt das Katalog-3-Schema. V4 unter Format 10 umzubenennen würde den Mindestconsumer verschleiern. Eine reine Lockerung der V3-Enumwerte oder der Inventarprüfungen wäre daher nicht ausreichend.

Die empfohlene Entwicklung ist ein neuer geschlossener nativer V4-/Format-11-Zweig. Die bisherigen 42 Pfad- und Policyobjekte sowie die bisherigen Quellenidentitäten und inhaltlichen Bestandsdefinitionen bleiben exakt erhalten. Die neuen 16 Wege verwenden einen eigenen V4-Policyzweig. Keine neuen Fallfakten werden bei Altwegen nachträglich verlangt oder von ihnen still ignoriert. Historische Formate und ihre Reader bleiben geschlossen.

Persönliche Defaults können Version 5 behalten. Der vorhandene allow-list-basierte Speicher enthält Kanton, Erlass, Pfad, Revision und Stufe, aber keine aktuelle `caseQualification`. Neue Eröffnungsherkunft, Voranforderung, lokale Feiertagswirkung und Koordination sind aktuelle Fallfakten und gehören nicht in Defaults. Beim Rückfall auf einen alten Reader bleibt eine unbekannte neue Auswahl geschützt, statt in einen ähnlich benannten alten Weg zu wechseln.

## Kritische Würdigung der SH-Datumswiederverwendung

Die G1-Freigabe verlangt eine eigenständige neue rechtliche Praxisbindung, verbietet aber nicht jede Wiederverwendung identischer physischer Daten. Das bestehende `eligibilityMeaning: physicalSourceOnlyNotFederalProcedurePermission` trennt physische Generierung und prozessuale Befugnis bereits grundsätzlich. Deshalb ist eine neue rechtliche VRG-Bindung auf dieselben Datumsbytes möglich, sofern Folgendes tatsächlich geprüft wird:

1. Neue SH-Verwaltungsbindung nennt VRG Art. 9/20, die neun gesetzlichen RTG-Nichtsonntagstage und den separaten Berchtoldstagsbefund BGer 2C_483/2025 E. 3.1. Keine rechtliche Ableitung aus dem Namen `SH-ZPO-ADDITIONAL`.
2. Ein maschinenprüfbarer Zusatz wie `physicalReuse.kind: sameDatesIndependentLegalBasis` bindet die genaue Projektion und den bisherigen Kalenderhash. `notDerivedFrom: SH-ZPO-ADDITIONAL` ist nur zusammen mit den positiven eigenständigen Quellen und einem unabhängig geprüften erwarteten Datumsbestand aussagekräftig.
3. Der Praxiszusatz wird als genau `01-02` mit eigenem `sourceRefs`-Pinpoint und begrenzter Reichweite für die neuen allgemeinen SH-Verwaltungswege beschrieben. Er darf nicht auf StPO oder beliebige weitere Feiertage ausgedehnt werden.
4. Die rechtliche Quellenprüfung muss fehlenden BGer-Beleg, falsche Erwägung, Ersatz nur durch OGE 2018 und neu gehashte freie Zusatzfeiertage ablehnen. Eine Hashprüfung allein erkennt solche Bedeutungsfehler nicht.
5. Die spätere Rechenspur trennt den rechtlichen VRG-Praxisbeleg von der physischen historischen OGE-2018-Provenienz. Der alte Generatorbeleg darf nicht wieder als vermeintliche administrative Rechtsgrundlage erscheinen.

Ein eigener SH-VRG-Ergänzungsbereich mit neuer physischer Projektion wäre ebenfalls konsistent, ist aber bei diesen erfüllten Voraussetzungen nicht notwendig. Er würde denselben Datumsbestand verdoppeln und eine zusätzliche Kalender-/Kataloghashkaskade erzeugen. Die minimale 33-/42-Variante hält die historischen 479 Basisregeln, zwölf SO-Zusätze, 198 Herkunftsentscheidungen und 104 Bundesverfahrensbindungen unverändert.

## Erforderliche negative und unabhängige Proben

- Alle 115 G1-Erwartungen am tatsächlichen Strukturkandidaten prüfen, nicht nur gegen Builderkonstanten.
- Die sieben gerichtlichen Sicherungen sowie UR-Art.-22-Hinweis nur bei tatsächlicher Eröffnung in der Soll-Zeit prüfen. Verwaltung ohne Ferien und spätere blosse Durchquerung der Soll-Zeit dürfen dadurch nicht falsch gesperrt oder verschoben werden.
- SH-30-Tage-Pfad mit zehn Tagen, falschem Gericht, falschem Empfänger, unklarer mündlicher Eröffnung und besonderem Gerichtsverfahren ablehnen.
- SO/SH-Anforderung ohne ausdrückliches Angebot sowie erneute Rechtsmittelfrist bei verspäteter oder unbekannter Voranforderung ablehnen.
- UR-Koordination bei Beschwerde ablehnen, bei einer bereits konkret bestimmten angeordneten Eingabefrist nicht pauschal ablehnen.
- Konkrete mögliche UR-Lokal-Endtagswirkung ohne geklärte Anbindung sperren, keine freie Kalendervereinigung und keinen stillen Basislistenentscheid.
- Falsche oder fehlende neue Rechtsrollen-/Praxisquellen auch nach Neuhashung erkennen. Altquellen und alte Feiertagsbindungen unverändert prüfen.
- Alle 42 bisherigen Definitionen und Policies, 41 kopierte F3-Rohartefakte, geschützte F3-/G1-Nachweise sowie MVP09 und AP5 bytegebunden erhalten.
- Format-10-/Katalog-3-Leser müssen V4/11 zurückweisen. Auch umetikettierte oder auf alte Inventargrössen zugeschnittene Kandidaten dürfen mit fingierter Bestätigung keinen Kontext erzeugen.
- Eine getrennte Python-Probe soll tatsächliche Kandidatenbytes, Schemata, kanonische Definitionshashes, Quellen-/Rollenbindungen und Datumswerte nachrechnen. Keine Verwendung des Node-Probers als Python-Orakel.

Die Gegenprüfung ist eine technische KI-Kontrolle. Sie ist weder menschliche Fachabnahme noch Freigabe einer bereits lauffähigen V4-/Format-11-Integration. Nach der Strukturprobe bleiben der konkrete technische Beschluss und anschliessend AP23G3 gesonderte Übergänge.

## Gegenprüfung des konkreten Strukturkandidaten

Geprüfter Kandidat: `outputs/ap23g2-candidate-2026-10-22/bundle`, lokales Referenzmanifest mit SHA-256 `f7193786575ee9f58063859b3af2daca738b766d5a73bd9ddacf474310124187`. Der neue Verwaltungsverfahrenskatalog hat SHA-256 `a17444b1e6c0b6092d1d48f2ca337096ab746f16290651dd9e5a4782cf72db87`. Dies ist ein vorgeschlagener Strukturvertrag, keine operative Promotion.

Die neuen Schema- und Kandidatengeneratoren wurden vollständig gelesen. Ihre jeweiligen `--check`-Läufe bestehen. Zusätzlich erfolgte ein eigener lesender Abgleich der tatsächlichen Dateien, ohne den Generator als Vergleichsorakel zu importieren:

- Alle 41 unveränderten F3-Rohartefakte sind bytegleich.
- Die bisherigen 34 Quellen, acht Erlasse, 14 Stillstandsprofile, neun Feiertagsbindungen, 42 Pfade und Qualifikationsregeln sowie 16 Ausschlüsse sind als vollständige Objekte exakt erhalten. Der neue Katalog ergänzt elf Quellen, drei Erlasse, sechs Stillstandsprofile, vier Feiertagsbindungen, 16 Pfade und Policies sowie sechs Ausschlüsse.
- Alle 58 Pfaddefinitionen wurden unabhängig kanonisiert und gegen die in den Policies gespeicherten SHA-256-Werte geprüft.
- Für alle 16 G1-Gruppen wurden Handlung, Eröffnungsqualifikation, Feiertagsrolle, Verfahrensstufe, konkrete Gerichtsidentität, gesetzliche Dauer beziehungsweise angeordnete Tagesdauer und Empfängerbeziehung gegen die tatsächlichen neuen Policies geprüft.
- Die Eröffnungskettenregel liegt genau auf den sechs gewöhnlichen Rechtsmittelwegen. Die vier Begründungsanforderungen bleiben eigenständige Schritte. SO und SH verlangen das ausdrückliche Begründungsangebot. Der SH-Dreissigtageweg bindet dasselbe Obergericht.
- Die UR-Koordinationspolitik liegt nur auf den beiden Zwanzigtagewegen. Die lokale Zusatzwirkung und die besondere Eröffnungsfolge haben eigene aktuelle Fallfakten und werden nicht als Urlaubs- oder Kalenderparameter umetikettiert.
- Genau zwei UR-Wege haben das Art.-22-Hinweisobjekt. Dieses verwendet das Eröffnungsdatum, Ostern minus acht bis plus acht Tage sowie 18. Dezember bis 6. Januar und ausdrücklich keine Datumsänderung. Genau sieben neue Gerichtswege tragen die abgenommene Endverschiebungssicherung.
- Für alle 16 neuen Wege sind Fall-, Rechen- und Quellenabdeckung sowie das eine Normintervall exakt `2026-08-29` bis `2027-12-31`.

Die tatsächliche SH-Verwaltungsbindung trennt die gewollten Rollen ausreichend: physische F3-Projektion mit genauer Regel-ID-Liste, keine vererbte Verfahrensbefugnis, eigenständige VRG-/RTG-/BGer-Quellen, ausdrückliches `notDerivedFrom: SH-ZPO-ADDITIONAL` und auf den 2. Januar beschränkter nicht tragender Praxisbeleg. Die drei erfassten besonderen RTG-Sonntage sind Teil der wiederverwendeten physischen Projektion. Sie sind kein zusätzlicher zehntägiger Nichtsonntagskatalog und verändern die unabhängige Sollmenge nicht. Die Gerichtsbindung verwendet dagegen `courtSeat`, die gerichtliche OGE-Praxis und die ZPO-Verweisung. Der Kandidat erfordert keine neue physische SH-Projektion.

**In diesen Modell- und Bestandsgegenprüfungen wurde keine neue sachliche Vertragslücke gefunden.** Die allgemeinen JSON-Schemata allein beweisen jedoch weiterhin keine exakte fachliche Quellenbindung, keine vollständige Kandidateninventur und keine wirksame Laufzeitsperre. Dafür sind der strenge native Strukturvalidator mit neu gehashten Negativproben, die getrennte Python-Datumsprobe und später AP23G3 erforderlich. Diese begrenzte Gegenprüfung behauptet ausdrücklich noch keine reale UI-, Host-, Kalenderexport- oder Betriebsprüfung.

## Gegenprobe am ersten strengen JS-Validator

Der anschliessend bereitgestellte erste Stand von `scripts/check-ap23g2-contract.mjs` wurde vollständig gelesen. Eigene In-Memory-Manipulationen wurden vor jeder Prüfung mit neu berechneten Pfad-, Policy-, Feiertagsbindungs-, Stillstandsprofil- und Eligibilityhashes versiegelt. Keine Kandidaten-, Builder- oder Produktdatei wurde dafür verändert.

Dabei nahm die exportierte Funktion `validateG2` zunächst folgende semantisch abweichenden Varianten an:

| Manipulation | Zunächst fehlende Prüfung |
| --- | --- |
| Neue BGer-Quellen-URL durch `https://example.org/not-the-accepted-case` ersetzt | Exakte neue Quellenobjekte, nicht nur bekannte Quellen-ID |
| BGer-Fassungsbeschreibung durch eine fiktive Fassung ersetzt | Fassungs- und Evidenzidentität der elf neuen Quellen |
| BGer-Pinpoint der rechtlichen SH-Verwaltungsbindung durch `E. 9.99` ersetzt | Exakte rechtliche Locatorbindung |
| BGer-Pinpoint von `physicalReuse.evidenceRefs` durch `E. 9.99` ersetzt | Exakte Locatorbindung der unabhängigen Wiederverwendungsgrundlage |
| Neue UR-Gerichtsferien mit ausschliesslicher SO-Quelle versehen | Quellenclosure der sechs neuen Stillstandsprofile |
| SH-Erlassprüfung von ausdrücklichem Gerichtsort auf `noneIdentifiedInReviewedGeneralLaw` gesetzt | Exakte rechtliche Rollenprüfung der drei neuen Erlasse |
| SH-Erlassprüfung auf UR-Quelle umgebunden | Neue Erlassquellen und Pinpoints |
| Physische Projektionskennung durch `projection-forged` ersetzt | Identität der tatsächlich referenzierten Kalenderprojektion |
| Neuen SH-Pfad-Pinpoint auf `E. 9.99` gesetzt | Norm- und Pfadquellen genauer als nicht leere Zeichenkette prüfen |
| Neuen UR-Erlass in allen konsistenten Verweisen auf `vrpv-fake` umbenannt | Exakte neue Erlassidentitäten |
| Neuen Kollisionsausschluss umbenannt oder seinen Grund in «Kein Vorbehalt erforderlich» geändert | Exakte sechs neue Ausschlussobjekte |

Die unveränderten Kandidatenbytes selbst sind davon nicht betroffen. Der vollständige `runG2`-Abgleich gegen die aktuelle Builderausgabe erkennt eine bloss extern veränderte Istdatei. Er ersetzt aber nicht die zugesagte native Bedeutungsprüfung nach einer konsistent neu gehashten Kandidatenänderung. Diese Unterscheidung wurde dem Root-Agent vor einem grünen Gesamturteil gemeldet.

Bereits korrekt abgewiesen wurden eine freie Änderung der Zukunftsannahme und eine Änderung der Rechtsentscheidreferenz von DEC-2026-031 auf DEC-2026-999. Die anschliessende Validatorverschärfung und deren eigene Nachprüfung sind unten dokumentiert.

## Eingefrorene neue Vorschlagsidentitäten

Die folgenden 30 vollständigen Objekte wurden aus dem tatsächlich gegengeprüften Katalog extrahiert. SHA-256 wird über kanonisches JSON berechnet, Objektschlüssel rekursiv lexikografisch sortiert, Arrayreihenfolge erhalten, UTF-8, keine Leerraumformatierung. Die Fixierung bezeichnet die geprüften technischen Vorschlagsidentitäten. Sie ist weder ein zusätzlicher Beweis für Rechtsrichtigkeit noch eine menschliche Format- oder Betriebsfreigabe. Zusammen mit den getrennten G1-Mapping- und Datumsprüfungen kann sie verhindern, dass nach einer Neuhashung andere Quellen, Fassungen, Rollen oder Ausschlussdefinitionen still in denselben Strukturvertrag gelangen.

### Quellenobjekte, elf

| Quellenidentität | Kanonischer SHA-256 |
| --- | --- |
| `SRC-AP23G1-UR-VRPV-20160301` | `81282a26f46e83457e4a5da3530e18e5ff884b14ffa6a7787c3fde91d1731cf2` |
| `SRC-AP23G1-UR-LSG-20030101` | `35e7c7fbd7d7668329412148d7550af62fb56b2a74bb1acbaed243dff992f954` |
| `SRC-AP23G1-SO-VRG-20250801` | `1873479d28447b21bab6b7773a818e83de605b0f80018d31dce5342f82676484` |
| `SRC-AP23G1-SO-GS201463` | `3aa6d1ee13dc004d3f6b7919ee1a3f9a6282bf1d1e0a0a7cbf77ebb5f264d3b9` |
| `SRC-AP23G1-SH-VRG-20251101` | `8547909650da3beadd16c4bb7aed374d6e692d53e389bd01b7e0b2871cd9f931` |
| `SRC-AP23G1-SH-JG-20260501` | `0da8d23c8119f5b29ede5e04e44d8707be31236091ce67c5fa5a09cc67547f9c` |
| `SRC-AP23G1-SH-RTG-20070101` | `1e69c4c3b8743689141a6c43167cd0460b355d9425dc03de151544479677b712` |
| `JUD-AP23G1-SH-OGE-4020181K-20180824` | `289231fc5aa3aa7e7a9c4092a13d8322542764779ec2e0eb1b9259db32c50ee1` |
| `JUD-AP23G1-SH-BGER-2C4832025-20260312` | `0a6cc02cb60188f9c3c387e533eac89330d735a0795c447231da748377e6a381` |
| `SRC-AP23G1-CH-ZPO-20260701` | `88654248a8f206d7004b07ffb052aed9d4b890cc5cd161b1a892ac5bc76a6bc3` |
| `SRC-AP23G1-CH-BUNDESFEIERTAG-19940701` | `430f762870294fc9c6bd002a7cb5a1a1249b631192f7188991c62efe40785253` |

### Erlassobjekte, drei

| Erlassidentität | Kanonischer SHA-256 |
| --- | --- |
| `vrpv-ur` | `8ee11fc4ffed8b581480f26ee98be37b6d6a9841b3248ef569aa923953ba3ca1` |
| `vrg-so` | `99050edab900cfc4af13e058aab1cf79ef6868f65913dc6f68483952fc9d120a` |
| `vrg-sh` | `41ffede80cdde74c1c64dd8cfa385e40a01539604b435ef06505a81302cadeea` |

### Stillstandsobjekte, sechs

| Profilidentität | Kanonischer SHA-256 |
| --- | --- |
| `ur-none` | `4487dce573d2fb8e2b340be2075d2daa310e8adca996110cc5459999b2a61ab2` |
| `ur-three` | `db461509b4bd05b17302b23f98c3daf523e7c83169b173ff859edef38aa1c315` |
| `so-none` | `665b804adf3eba7d2861cefa4ef29fa942cd3c3ab84cfad81c0fbe0364dc94c2` |
| `so-three` | `79b1ed43e40fe936ad0dcd21e65d2fe7b55cc8c8de370f767c0296238d7934d1` |
| `sh-none` | `0cc9667945c2024f79df56c29770fdf6d8db67c3c012e3441366ca3dafb9ef9f` |
| `sh-three` | `361b83c0b0bd4ea78413f100019d7a496f731a6384d877f6ff28bce0ca42e30b` |

### Feiertagsbindungsobjekte, vier

| Bindungsidentität | Kanonischer SHA-256 |
| --- | --- |
| `ur-administration-seat` | `aa4d395d7d40c7b82588d581d6581e0dca553bda78c588873ead8326034e437a` |
| `so-administration-seat` | `5c9b22e8d2ca64acfff99017405a1d5e60dcdfddb9fdedd9cc2fb2e200569d99` |
| `sh-administration-seat` | `f386e6ca409bc70167538b2fb55200a92b699591da52827cf40ba67ff5514ddb` |
| `sh-court-seat` | `4966aa5dc6881fe779ba9235a3849fcc1af6597035ea9cf8698f4d0acaef96c9` |

### Ausschlussobjekte, sechs

| Ausschlussidentität | Kanonischer SHA-256 |
| --- | --- |
| `g1-ur-local` | `e1eae56623c5c50db2ef167d8672105d40fa821642ea3758131f5567a791e3f2` |
| `g1-ur-opening` | `9bc399c2911c1dc5cac17858b7d6f2d9ebf61518d85c6f10449581006463c8b1` |
| `g1-ur-coordination` | `75d2cf3f0e022bfc3c5a9bc36c84b7831bb5a1354f92b6c2ea693903e90e5f57` |
| `g1-reasons-chain` | `807977cc79c76fbbc7dd2e77cd9848fbb35e2ee60b7ed3cb58577d367fdd5c13` |
| `g1-sh-shortening` | `6d48a7cc72cadf433e9623741158715e9bc494d619e442eb707973e29e3169b8` |
| `g1-end-suspension` | `328f4eb9087cf17683763eb506152f48770cf556b461bdb9cc2c6466b0bd52c3` |

## Nachprüfung des verschärften Validators

Die 30 eingefrorenen Vorschlagsobjekte sind nun zusätzliche exakte Identitätsbedingungen von `validateG2`. Die getrennten semantischen G1-Mappings bleiben erhalten. Die neuen Pfad- und Normintervallquellen werden zudem vollständig mit den fixierten Quellen-IDs und ihren tatsächlichen `locators` verglichen. Eine Hashfixierung ersetzt damit nicht die eigenständige Bedeutungs- und Datumsprüfung.

Alle oben aufgefundenen zwölf Varianten wurden gegen diesen verschärften Stand erneut schreibfrei geprüft, ergänzt durch einen falschen Normintervall-Pinpoint als dreizehnte Variante. Pfad-, Policy-, Bindungs-, Profil- und Eligibilityhashes wurden vor jeder Prüfung konsistent neu berechnet. **Alle 13 Varianten werden jetzt abgewiesen.** Der unveränderte tatsächliche Kandidat wird weiterhin angenommen. Die zunächst festgestellten Validatorlücken sind damit im gegengeprüften Stand geschlossen, ohne Änderung des Kandidaten.

Anschliessend wurde `runG2` selbst vollständig ohne Schreiboption ausgeführt. Ergebnis:

| Probe | Eigener bestätigter Umfang |
| --- | ---: |
| G1-Referenzfälle | 115 |
| Positive Referenzrechnungen | 70 |
| Begrenzte gerichtliche Endverschiebungskollisionen | 7 |
| Negative Fallqualifikationen | 34 |
| Zeitfenstergrenzen | 4 |
| Durchgehend neu versiegelte Katalogmutationen | 43 |
| Negative Inputproben | 38 |
| Native Reader-Negativproben | 6 |
| Rechnungen des bestehenden nativen F3-Readers | 42 |
| Abgewiesene fingierte Kontexte | 126 |

Der Gesamtaufruf endet mit `status: passed`. Die Readerproben umfassen auch einen formal schemaschlüssigen alten 42er-Katalog mit semantisch veränderter AR-Dauer, der vom nativen Altvalidator zurückgewiesen wird. Das ist ein anderer Nachweis als die blosse Zurückweisung der neuen Formatnummer.

**Abschliessendes technisches Reviewurteil:** Für die isolierte AP23G2-Strukturprobe wurde nach dem Nachtest kein offener Modell- oder Validatorblocker gefunden. Das ist keine umfassende Sicherheitszusage und kein Rechtsrichtigkeitsbeweis. Der Bericht behauptet weder eine vorhandene Format-11-Produktruntime noch eine UI-/Host-/Exportsperre. Die getrennte Python-Prüfung bleibt ein weiterer Nachweis und die menschliche technische Abnahme, DEC-2026-036 sowie AP23G3 bleiben eigene Übergänge. E, Q, P, Rechts- und Rechenregeln, alte Daten und Releasefreigaben werden durch diesen Review nicht verändert.
