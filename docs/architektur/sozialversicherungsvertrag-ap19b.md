# AP19B · Produktvertrag für nationale Sozialversicherungsverfahren

Stand: 25. September 2026. **Konkreter Vertrags- und Migrationsvorschlag, noch nicht beschlossen.** AP19A ist fachlich und strukturell abgenommen. Daraus folgt weder die Zustimmung zu den hier vorgeschlagenen Formatnummern noch die Freigabe zusätzlicher Berechnungspfade. Dieses Dokument ändert keine Produktschemas, Laufzeitdaten oder Consumer.

## 1. Entscheidungsvorschlag

Eine neue eigenständige Komponente `socialProcedureCatalog` enthält die drei fachlichen Schichten `federalRules`, `cantonalBindings` und `releaseEligibility`. Sie wird zunächst als eine JSON-Datei transportiert. Der bisherige Spezialregimekatalog bleibt für allgemeines VRPG, politische Rechte und Beschaffung zuständig.

| Gegenstand | Bestehend | Vorschlag für die spätere Integration | Begründung |
| --- | --- | --- | --- |
| Sozialversicherungsverfahren | Bestandteil des bernischen Spezialregimekatalogs | **Neue Komponente `1.0.0`** | Nationale Bundesregeln erhalten keinen bernischen Katalogkopf und kein festes `profileId: vrpg-be` |
| Spezialregimekatalog | `3.0.0` | **`3.0.0` bleibt** | Seine bestehende Struktur genügt für den verbleibenden Inhalt. Die Sozialpfade werden in einem neuen Release herausgelöst, nicht doppelt aktiviert |
| Release-Manifest | `4.0.0` | **`5.0.0`** | Neue verpflichtende Artefaktrolle, neue ID-Liste und neue übergreifende Invarianten sind nicht durch ignorierbare Erweiterungsfelder darstellbar |
| Mindest-Consumerformat | `4.0.0` | **`5.0.0`** | Ein alter Consumer muss den neuen Gesamtvertrag ablehnen |
| Kalenderregelkomponente | `2.0.0` | unverändert | Keine neue Feiertagsarithmetik |
| Schweizweiter Feiertagskatalog | `1.0.0` | unverändert | Keine zusätzliche operative Kantonsprojektion |
| Rechtsprofile, Quellenregister und Quellenprüfung | bisherige Komponentenformate | unverändert, soweit deren Schema unverändert bleibt | Keine pauschale Erhöhung aller Komponenten |
| Anwendung und SPFx-Paket | MVP 0.4 / `0.4.0.1` | keine Nummer durch AP19B festgelegt | Produktversion und Deployment folgen einem eigenen Auftrag |

Die Variante «Spezialregimekatalog 4 mit weiterhin bernischem Kopf» wird nicht gewählt. Sie würde nationale Regeln und regionale Anwendung erneut in einer übergeordneten Bern-Struktur verschachteln. Die neue Komponente ist kleiner und ihre Verantwortung eindeutiger. Eine Aufteilung ihrer drei Schichten in drei Dateien ist zunächst unnötig. Die drei geschlossenen Objektarten bleiben trotzdem separat validierbar und referenzierbar.

Dies konkretisiert [DEC-2026-024](../entscheidungen/DEC-2026-024-nationales-sozialversicherungsmodell.md), setzt dessen Grundsatz aber nicht mit einer bereits erteilten Vertragsfreigabe gleich. Komponentenweise Formatevolution nach [DEC-2026-014](../entscheidungen/DEC-2026-014-komponentenweise-fachdatenformatevolution.md) bleibt erhalten.

## 2. Manifest, Ablage und harte Ladegrenzen

Vorgesehener relativer Artefaktpfad: `social-procedures/ch-social-procedures.json`. Das ist ein Zielpfad im künftigen Release, keine bereits existierende produktive Datei.

| Feld / Invariante | Verbindlicher Vorschlag |
| --- | --- |
| Artefaktrolle und `dataKind` | jeweils `socialProcedureCatalog` |
| `catalogId` | `ch-social-procedures` |
| Schema-ID | Repository-Schema `social-procedure-catalog.schema.json`, erst nach Vertragsbeschluss umzusetzen |
| Neue Manifest-ID-Liste | `socialProcedureCatalogIds: ["ch-social-procedures"]` |
| Manifest-Kompatibilität | exakt `formatVersion: "5.0.0"`, `minimumConsumerFormatVersion: "5.0.0"`, unbekannte Hauptversion und Kernfelder ablehnen |
| Inhalt von Format 5 | bisherige fünf Rechtsprofile, CH-/BE-Kalender, Feiertagskatalog und verbleibender Spezialregimekatalog plus genau ein Sozialverfahrenskatalog |
| Transport | bestehende Regeln für manifestrelative Pfade, SHA-256 und Byteidentität gelten für GitHub, SharePoint-Mirror und manuellen Import gleich |
| Fremde Formate | Manifest 1–4 dürfen die neue Rolle und die neue ID-Liste nicht enthalten. Format 5 ohne vollständige Komponente wird abgewiesen |
| Komponentenreferenzen | ID-Listen und tatsächliche Artefakte müssen exakt übereinstimmen. Keine doppelten IDs oder nicht referenzierten Alternativkataloge |
| Vollständigkeit | Die Menge aller qualifizierten Sozialpfade wird nur aus der neuen Komponente aufgelöst. Einer der zwölf migrierten Pfade darf im v3-Restkatalog nicht parallel aktiv sein |
| Feiertage | CH-/BE-Projektion bleibt exakt an den vorhandenen operativen Katalog gebunden. Die Existenz weiterer Katalogregeln ist keine Freigabe |

Das Format-4-Sonderverhalten in [createCalculationData](../../src/core/data.ts) bleibt für alte Releases unverändert. Die dortige feste Katalog-ID `vrpg-be-special-regimes-ap17c` wird nicht global aufgeweicht. Format 5 erhält eigene Invarianten und für den Restkatalog die neue Inhalts-ID `vrpg-be-special-regimes-rest`. Alte Daten bleiben über ihren bestehenden Versionszweig lesbar.

## 3. Geschlossene Feldverträge

Alle nachfolgend genannten Objekte sind geschlossen. Unbekannte Kernfelder, doppelte IDs, leere Pflichtlisten, nicht existente Referenzen, ungültige Kalenderdaten und sich widersprechende Intervalle sind Fehler. Es gibt keine frei auswertbaren Ausdrücke, JavaScript-Regeln oder automatischen Downloads aus einem Quellenlink. Lokalisierte Texte enthalten `de` und `fr`. Italienisch und Rumantsch gehören nicht zu diesem UI-Vertrag.

**Gemeinsame Typen:** `Date` ist ein echtes ISO-Kalenderdatum `YYYY-MM-DD`. `Interval` enthält genau `from: Date` und `to: Date|null`, beide Grenzen einschliesslich. `SourceRef` enthält genau `sourceId` und den nicht leeren Artikel-/Erwägungs-Locator gemäss bestehendem Quellenvertrag. SHA-256 ist eine kleingeschriebene Zeichenfolge aus 64 Hexadezimalzeichen. Revisionen sind positive Ganzzahlen. Ein unbekannter Wert darf nicht auf einen Standardwert reduziert werden.

### 3.1 Komponentenkopf

Die vollständige Liste der zulässigen Top-Level-Felder lautet:

| Pflichtfeld | Typ / Bedeutung |
| --- | --- |
| `$schema`, `formatVersion`, `dataKind`, `catalogId` | feste Identität gemäss Abschnitt 1 und 2 |
| `labels` | deutsche und französische Katalogbezeichnung |
| `review` | bestehender Review-Datentyp, Dokumentprüfung, keine Laufzeitfreigabe |
| `sources` | bestehende Quellenobjekte, global eindeutig mit manifestweitem Quellenregister abgeglichen |
| `suspensionProfiles` | bestehende typisierte Stillstandsprofile. Zunächst `S_ATSG` mit `ch-court-holidays` |
| `filingProfiles` | bestehende typisierte Fristwahrungsprofile. Zunächst unverändert `F7_ATSG_DISPATCH` |
| `federalRules` | nicht leere Liste nach Abschnitt 3.2 |
| `cantonalBindings` | nicht leere Liste nach Abschnitt 3.3 |
| `releaseEligibility` | Liste nach Abschnitt 3.4, im Kandidaten dürfen keine produktiv genehmigten Einträge vorgetäuscht werden |
| `excludedPaths` | ausdrückliche gesetzliche Ausnahmen und Produktgrenzen nach Abschnitt 3.5 |

Kein `jurisdiction: BE`, kein Katalog-`profileId`, kein `runtimeActive` und keine Freigabe über `extensions`. Die genaue Auswahl wird erst bei der Verbindung einer Bundesregel mit einer Anbindung vorgenommen.

### 3.2 `federalRules`

| Pflichtfeld | Typ / Bedeutung |
| --- | --- |
| `ruleId` | stabile nationale ID `CH-SOC-…`. Keine Kantons-, AP- oder Releasekennung |
| `revision` | eigenständige Inhaltsrevision dieser ID |
| `status` | `candidate`, `reviewed` oder `withdrawn`. `reviewed` allein aktiviert nichts |
| `labels` | DE/FR-Bezeichnung des abgegrenzten Pfads |
| `law` | geschlossene Liste `ivg`, `ahvg`, `uvg`, `elg`, `avig`, `kvg` im ersten Vertrag |
| `matter` | genau eine stabile Sachbereichskennung, keine freie Sammelbezeichnung |
| `action` | `preliminary-objection`, `objection`, `appeal`, `ordered-administrative-days` oder `complaint-correction` |
| `stage` | `administration` oder `cantonal-insurance-court`. Kein impliziter Schluss aus einer UI-Leerzeichenfolge |
| `triggerKind` | qualifizierter Dokumenttyp. Erstverfügung, Einspracheentscheid, IV-Vorbescheid und konkrete Tagesanordnungen bleiben verschieden |
| `notificationChannels` | nicht leere Liste bekannter Eröffnungsarten. Erste Sozialpfade ausschliesslich `individual-service` |
| `calculation` | bestehender typisierter `R1_RELATIVE`-Vertrag, `anchorInputId: legalTriggerDate`, `direction: after`, `anchorBoundary: excluded`, genau eine Dauerform |
| `suspensionProfileId` | Referenz auf das eigene nationale Profil `S_ATSG` |
| `filingProfileId` | Referenz auf `F7_ATSG_DISPATCH`. Ein Datum bestätigt keine rechtzeitige tatsächliche Eingabe |
| `holidayPolicy` | `partyOrRepresentative` im ersten Vertrag, niemals ein Kanton oder eine Kalender-ID |
| `endShiftPolicy` | `nextWorkingDay` |
| `legalValidity` | fachlich belegtes Normintervall oder `null` nur bei `candidate` |
| `caseCoverage` | technisches Intervall für den qualifizierten Eröffnungstag |
| `sourceCoverage` | durch den artikelbezogenen Fassungsabgleich belegter Zeitraum. Ein Prüfende ist kein behauptetes Ausserkrafttreten der Norm |
| `normBindings` | nicht leere Liste zeitlich bestimmter Normbindungen, siehe unten |
| `sourceRefs` | nicht leere vollständige Normspur, nicht bloss ein Erlassname |

Für `calculation` gilt entweder `duration: {value: 30, unit: "day"}` oder `durationInputId: "deadlineDays"`. Beide zusammen und beide fehlend werden abgewiesen. Die angeordnete Dauer ist technisch auf ganze Zahlen von 1 bis 365 beschränkt. Das ist keine gesetzliche Maximaldauer. Monats-, Stunden-, materielle Verwirkungsfristen und vorgegebene Endtermine sind nicht enthalten.

Die Bundesregel enthält ausschliesslich nationale Verfahrensvorgaben und ihre Quellen. Kantonales Anschlussrecht, ein bestimmtes Gericht, konkrete räumliche Kalender-IDs und kantonsbezogene Freigabebedingungen gehören in die Anbindung. Bei der Migration wird die bisher gemeinsame Normspur entsprechend aufgeteilt. Die Vereinigung der neuen Bundes- und Anbindungsquellen muss die bisherige relevante Normspur erhalten. Ein in Bern ergangener Entscheid darf nur als belegte Auslegung einer Bundesnorm in der nationalen Normspur erscheinen, nicht als unerklärte bundesweite Geltung bernischen Prozessrechts.

`normBindings` enthält ausschliesslich Objekte `{sourceId, locator, temporalSelector, applicableFrom, applicableTo, verification}`. `temporalSelector` ist `legalTriggerDate`, `procedureStartDate` oder `jurisdictionReferenceDate`. `verification` ist `verified` oder `open`. Quellenkonsolidierung und Inkrafttreten der konkreten Norm werden getrennt ermittelt. Ein unbekannter Beginn ist nur bei Kandidaten als `null` zulässig. Eine offene Normbindung verhindert die spätere Freigabe. Der gleiche Quellenlocator in `sourceRefs` und `normBindings` muss inhaltlich übereinstimmen.

Ein Pfad darf nicht durch Umbenennung auf neue Sachgebiete ausgedehnt werden. Materiell anderer Gegenstand, Rechtsweg oder Trigger erhält eine neue `ruleId`. Quellenkorrekturen oder nachgewiesene zeitliche Fassungswechsel innerhalb derselben Identität erhöhen die `revision`. Bei überschneidenden technisch anwendbaren Revisionen derselben ID wird nicht «die neueste» erraten, sondern der Katalog abgewiesen.

### 3.3 `cantonalBindings`

| Pflichtfeld | Typ / Bedeutung |
| --- | --- |
| `bindingId`, `revision`, `status`, `labels` | stabile kantonale Verknüpfung, eigene Revision, Status wie bei Bundesregeln |
| `ruleId`, `ruleRevision` | genau eine Bundesregel in einer bestimmten Revision |
| `procedureContextCanton` | geprüfter Verfahrens-/Produktkontext. Erste operative Anbindungen nur `BE` |
| `entryProfileId` | aktuell `vrpg-be`, nur für den Einstieg im UI und ergänzendes Verfahrensrecht. Keine Übernahme seiner allgemeinen Zählregeln |
| `contextRoutes` | nicht leere Liste ausdrücklich unterstützter Zuständigkeits- oder Produktanknüpfungen |
| `calendarBindings` | nicht leere Liste zulässiger, räumlich aufgelöster Kalenderverbindungen |
| `supplementaryLawRefs` | kantonale Anschlussnormen. Darf bei einem rein versichererseitigen Verwaltungspfad leer sein, aber nicht als unbekannte Gerichtszuständigkeit missbraucht werden |
| `legalValidity`, `caseCoverage`, `sourceCoverage`, `normBindings`, `sourceRefs` | zeitliche Bindung wie oben. Kantonale Normfassungen werden nicht aus Bundesquellen abgeleitet |

Eine `contextRoute` enthält genau `{contextRouteId, kind, requiredFacts, sourceRefs}`. `kind` ist `legal-jurisdiction` oder `product-scope`. Ein `product-scope` beschreibt eine konservative Begrenzung des Produkts, keine gesetzliche Zuständigkeitsbehauptung. `requiredFacts` enthält eine nicht leere Liste `{factKey, allowedValues}` mit vordefinierten Feldern, keine frei interpretierbaren Prädikate. Ein konkret gewählter Pfad muss genau eine Route erfüllen.

Die erlaubte erste Faktenmenge ist `competentBodyQualified` als Wahrheitswert, `decisionOrigin` als typisierte Stelle, `elgAdministrativeCanton`, `avigControlCanton`, `avigOfficeCanton`, `courtCanton`, `partyDomicileCanton` als Kantonscodes und `jurisdictionSpecialCase` als `ordinary`, `abroad`, `thirdParty` oder `unclear`. `decisionOrigin` erlaubt abschliessend `ivOffice`, `compensationOffice`, `accidentInsurer`, `unemploymentFund`, `cantonalEmploymentOffice`, `healthInsurer` und `insuranceCourt`. Die neuen Pfade unterstützen zunächst nur `ordinary`. Nicht benötigte Fakten bleiben abwesend. Widersprüchliche zusätzliche Fakten sperren, anstatt ignoriert zu werden. Weitere Rechtswege bedürfen einer ausdrücklich erweiterten Faktenliste.

Jede `calendarBinding` enthält genau `{calendarBindingId, holidayCanton, spatialScopeId, calendarId, requiredAnchorRoles, sourceRefs}`. `requiredAnchorRoles` ist eine nicht leere Teilmenge aus `party` und `representative`. Erste Freigaben setzen die qualifizierten Anknüpfungen auf den bereits geprüften Berner Feiertagsraum voraus. Die Bundesregel enthält keine Kopie dieser Verbindung.

### 3.4 `releaseEligibility`

| Pflichtfeld | Typ / Bedeutung |
| --- | --- |
| `eligibilityId` | eindeutige Freigabeverknüpfung |
| `releaseId` | genau der Release, dessen Manifest die Komponente enthält |
| `status` | `candidate`, `approved` oder `withdrawn` |
| `ruleRef` | genau `{ruleId, revision, sha256}` |
| `bindingRef` | genau `{bindingId, revision, sha256}` |
| `contextRouteIds` | abschliessende Liste der freigegebenen Routen dieser Anbindung |
| `calendarBindingIds` | abschliessende Liste der freigegebenen räumlichen Anknüpfungen |
| `componentRefs` | referenzierte Kalender-/Stillstandsartefakte mit `{role, contentId, sha256}`, immer gegen das Manifest geprüft |
| `sourceReviewRef` | `{reviewId, sha256}`, geprüfter Quellenindexstand des Freigabepakets |
| `referenceSuiteRef` | `{suiteId, sha256}`, abgeschlossene Fach-/Regressionsreferenzen |
| `caseCoverage` | konkrete freigegebene Eingabeabdeckung, nicht grösser als Regel-, Anbindungs- und Normabdeckung |
| `calculationCoverage` | belegter Zeitraum, den der gesamte Rechenweg einschliesslich Stillstand und Verschiebung durchlaufen darf, nicht grösser als die Quellenabdeckung von Bundesregel und Anbindung |
| `approval` | `null` für Kandidaten oder `{approvedBy, approvedOn, decisionRef}` bei `approved` |

Die Bundesregel und die Anbindung werden in kanonischer JSON-Darstellung gehasht. Für den späteren Consumer ist dafür ein einziges dokumentiertes Verfahren nach [RFC 8785, JSON Canonicalization Scheme](https://www.rfc-editor.org/rfc/rfc8785) zu implementieren und gegen Referenzvektoren zu prüfen. AP19B führt keine selbst entwickelte alternative Kanonisierung ein. Der Manifest-Hash bindet zusätzlich die tatsächlichen vollständigen Dateibytes. Profil-, Quellen- und Freigabemetadaten innerhalb derselben Komponentendatei sind dadurch mitgebunden. Externe Komponenten werden über ihre vollständigen Artefakthashes referenziert. Keine Freigabe enthält den Hash der Datei, die sie selbst enthält, damit entsteht kein zirkulärer Hashvertrag.

Eine Freigabe ist ein nachvollziehbarer Datensatz, keine digitale Signatur und keine Autorisierung beliebiger Fremddaten. Aktivierung setzt weiterhin den freigegebenen, vertrauenswürdig angehefteten Release samt Consumerprüfung voraus. Wer einen Kandidaten bloss auf `approved` umschreibt, muss an fehlenden Entscheid-, Quellen-, Referenz- oder Hashbindungen scheitern. Der UI-Schalter oder ein lokaler Default ist nie eine Freigabequelle.

Quellenindex, Referenzsuite und menschlicher Entscheid werden bei der kontrollierten Releasevorbereitung gegen die bezeichneten Belege geprüft. Der Browser lädt diese Prüfunterlagen nicht nach und kann eine erfundene menschliche Erklärung nicht selbst juristisch verifizieren. Seine Vertrauensgrenze ist der ausdrücklich freigegebene Release-Pin. Er kontrolliert die darin gebundenen Freigabeverknüpfungen, Komponenten und Hashwerte. Auch ein syntaktisch plausibel umgeschriebener Freigabedatensatz ändert die Dateibytes und ist unter dem alten Pin nicht gültig.

### 3.5 `excludedPaths`

Jeder Eintrag enthält genau `{exclusionId, law, matter, action, reasonKind, reasonKey, labels, sourceRefs}`. `reasonKind` unterscheidet `statutory-exclusion`, `product-scope`, `unsupported-procedure` und `unresolved-qualification`. Ein Eintrag sperrt einen Pfad, erzeugt aber keine Rechenregel. Unbekannte Kombinationen sperren ebenfalls, auch ohne passende Ausschlusszeile. Es gibt keine pauschale Whitelist «Gesetz ist bekannt, also ATSG».

Die bisherigen `SOC-…-COURT-OTHER`-Sperren werden als `unsupported-procedure` übernommen. Beim KVG bleibt Taggeld eine Produktgrenze und wird nicht als gesetzlicher ATSG-Ausschluss bezeichnet. Tarif-, Zulassungs-, Prämienverbilligungs- und Schiedsgerichtswege erhalten eigene fachlich passende Ausschlusszeilen. Umfang und Normspuren folgen den abgenommenen AP19A-Quellenpaketen, nicht neuen Rechtsannahmen dieses technischen Vertrags.

## 4. Laufzeiteingabe und Resultat

Der neue Kern-Einstieg heisst vorschlagsweise `resolveSocialDeadline`. Er wird von UI und direkten Kernaufrufen identisch verwendet. Eine vorgelagerte UI-Prüfung darf die Kernprüfung nicht ersetzen.

| Eingabefeld | Bedeutung |
| --- | --- |
| `ruleId`, `bindingId`, `contextRouteId` | bekannte Auswahl, nicht frei eingegebene Bezeichnung |
| `procedureContextCanton` | expliziter Freigabekontext, zunächst `BE` |
| `authoritySeat` | optional `{country, canton}` als rein informative örtliche Angabe. Nicht aus dem Feldnamen als Zuständigkeit oder Feiertagsanker interpretieren |
| `caseFacts` | nur die typisierten erforderlichen Zuständigkeits-/Produktmerkmale der gewählten Route |
| `qualificationBasis` | bisherige Unterscheidung `confirmed-case-facts` oder `displayed-model-scope` |
| `matter`, `triggerKind`, `notificationChannel` | qualifizierter oder sichtbar feststehender Modellbereich, niemals aus beliebigem Dokumenttext erraten |
| `notificationConfirmed` | bestehende Semantik. Eine einzige sichtbar feststehende Eröffnungsart wird nicht als fiktive Benutzerbestätigung ausgegeben |
| `legalTriggerDate` | rechtlich massgebender Eröffnungstag, kein automatisch aufgelöster Zustellungsfiktionstag |
| `procedureStartDate`, `jurisdictionReferenceDate` | nur falls die zeitlich gebundene Route sie benötigt. Fehlende notwendige Zeitanker sperren |
| `holidayResolution` | genau `{status, anchors, calendarBindingId}`. Anker enthalten je `{role, canton, spatialScopeId}`. `status` ist `resolved`, `unknown` oder `conflict` |
| `days` | nur bei angeordneter Tagesdauer. Bei gesetzlicher Dauer ist selbst `days: 30` eine unzulässige Übersteuerung |

Eine Vertretung wird als `representative` nur erfasst, wenn sie für die konkrete Feiertagsanknüpfung qualifiziert ist. Die Norm «Partei oder Vertretung» wird nicht zu einer vom Nutzer frei auswählbaren Optimierung zwischen zwei Kalendern. Unterschiedliche Orte sind nicht automatisch falsch. Solange ihre rechtliche Auflösung nicht modelliert und freigegeben ist, bleibt das Resultat gesperrt. Nicht benötigte Personendaten, Adressen und Dokumentinhalte werden weder verlangt noch gespeichert.

Prüfreihenfolge: Datenvertrag und Referenzen → eindeutige Bundesregel → Sachbereich/Handlung/Trigger → zeitliche Normen → genau eine kantonale Route → aufgelöste Feiertagsverbindung → exakte Releasefreigabe → unveränderte Tagesarithmetik. Bei einem Fehler gibt es kein vorläufiges Enddatum und keinen Rückfall auf allgemeines VRPG oder auf den Sitz der Stelle.

Ein erfolgreiches Ergebnis nennt neben den vorhandenen Rechenschritten `ruleId` und Revision, `bindingId` und Revision, `contextRouteId`, `eligibilityId`, Quellenbezüge, verwendeten räumlichen Kalender und Datenrelease. Sperrresultate unterscheiden mindestens `unknown-rule`, `wrong-matter`, `wrong-trigger`, `unsupported-procedure`, `context-unresolved`, `holiday-unresolved`, `calendar-not-released`, `outside-case-coverage`, `outside-calculation-coverage`, `source-gap` und `not-released`.

## 5. Konkrete Anbindungen der ersten Tranche

Die folgende Tabelle definiert die fachliche Bedeutung der vorgesehenen Route-IDs. Die beabsichtigten zwölf neuen Bundespfade bestehen aus vier Handlungen je Erlass. Mehrere erforderliche Zuständigkeitsrouten erzeugen keine Kopie einer Bundesregel.

| Route-ID | Art | Erforderliche Qualifikation für BE |
| --- | --- | --- |
| `be-elg-akb-article8` | `legal-jurisdiction` | ELG-Verwaltungszuständigkeit nach Artikel 21 für BE geklärt, Ausgleichskasse Bern als zuständige Durchführungsstelle nach Artikel 8 EG ELG |
| `be-avig-ale-article119-control-canton` | `legal-jurisdiction` | Herkunft Arbeitslosenkasse, für den ALE-Fall massgebender Kontrollkanton nach AVIV Artikel 119 Absatz 1 Buchstabe a ist BE. Nicht Hauptsitz der Kasse |
| `be-avig-cantonal-office` | `legal-jurisdiction` | Fachlich zuständige kantonale Amtsstelle BE, Sachbereich individuelle Arbeitslosenentschädigung |
| `be-avig-court-article128` | `legal-jurisdiction` | Gerichtskanton nach AVIV Artikel 128 aus der qualifizierten Herkunft und Anknüpfung bestimmt. Kassen- und Amtsstellenpfad sind ausdrücklich unterscheidbar |
| `be-kvg-okp-product-scope` | `product-scope` | Zuständiger Leistungskrankenversicherer fachlich bestimmt, versicherte Partei mit Wohnsitz BE zum dokumentierten Bezugszeitpunkt des Verwaltungspfads als ausdrückliche erste Produktgrenze. Versicherersitz darf ausserhalb BE liegen |
| `be-atsg58-court` | `legal-jurisdiction` | Gerichtskanton BE für den bezeichneten ELG-/KVG-Beschwerdefall geklärt, ordentlicher Inlandsfall. Nicht einfach der vorgelagerte Verwaltungskanton |

Alle Routen verlangen separat die geklärte Feiertagsanknüpfung. Beim ELG entscheidet ein Heimeintritt nicht automatisch zugleich über Verwaltungs- und Gerichtskanton. Beim KVG ist `be-kvg-okp-product-scope` ausdrücklich keine Aussage, wonach der Krankenversicherer eine bernische Behörde sei. Bei AVIG darf die Wohnsitzregel des ATSG nicht unbesehen die besondere Zuständigkeitskette ersetzen. Die Quellen und die genaue zeitliche Abdeckung sind im fachlichen AP19B-Paket zu binden.

Für die gerichtliche Route nach ATSG Artikel 58 ist der dafür qualifizierte Wohnsitz-/Zuständigkeitsbezug im Zeitpunkt der Beschwerdeerhebung massgebend. Ein in der Verwaltung erfasster Wohnsitz wird nicht unverändert als Tatsachenbeweis für das spätere Gericht übernommen. Bei der Fristplanung wird die gerichtliche Zuständigkeit ausdrücklich als fachlich geklärte Voraussetzung behandelt. Der Rechner prognostiziert keinen künftigen Wohnsitzwechsel.

Für die AVIG-Kassenroute bindet `jurisdictionReferenceDate` nach Artikel 119 Absatz 2 AVIV den **Zeitpunkt der Verfügung**. `avigControlCanton` bezeichnet den dafür rechtlich massgebenden Kontrollkanton, nicht ohne Weiteres den heutigen Kontrollort. Derselbe Zeitbezug gilt in der darauf aufbauenden Gerichtsroute nach Artikel 128 Absatz 1 AVIV. Bei einer vor der Verfügung angeordneten Verwaltungstagesfrist ist stattdessen die laufende Zuständigkeit als eigener Fallbefund zu qualifizieren. Ein noch nicht vorhandenes Verfügungsdatum darf nicht erfunden werden. Die Route muss festlegen, welcher dieser abgegrenzten Befunde verlangt wird. Fehlender oder widersprüchlicher Befund sperrt die Berechnung.

Die neuen Regel-IDs lauten abschliessend:

| Sachbereich | Vier nationale IDs |
| --- | --- |
| ELG, individuelles zweites Kapitel | `CH-SOC-ELG-OBJ`, `CH-SOC-ELG-APP`, `CH-SOC-ELG-ADM`, `CH-SOC-ELG-CORRECTION` |
| AVIG, individuelle Arbeitslosenentschädigung | `CH-SOC-AVIG-ALE-OBJ`, `CH-SOC-AVIG-ALE-APP`, `CH-SOC-AVIG-ALE-ADM`, `CH-SOC-AVIG-ALE-CORRECTION` |
| KVG, individuelle OKP-Leistungen | `CH-SOC-KVG-OKP-OBJ`, `CH-SOC-KVG-OKP-APP`, `CH-SOC-KVG-OKP-ADM`, `CH-SOC-KVG-OKP-CORRECTION` |

Vorgesehene BE-Anbindungs-IDs ersetzen im gleichen nationalen ID-Suffix `CH-SOC-` durch `BE-SOC-`. Die ID selbst enthält keine Revision oder Rechtsbehauptung. Andere Kantone erhalten später neue Anbindungen, nicht neue Kopien der Bundesregel.

## 6. Migration der zwölf bestehenden AP17-Sozialpfade

Die folgende Zuordnung wurde gegen [den eingefrorenen MVP-0.4-Katalog](../../data/releases/2026-09-22-mvp-04-approved.1/special-regimes/vrpg-be.json) geprüft. Die Migrationsabbildung ist ausdrücklich vollständig und nicht aus einem beliebigen ähnlichen ID-Präfix abzuleiten.

| Bisherige Mapping-ID | Bisherige Definition-ID | Neue Bundesregel-ID | Neue BE-Anbindung |
| --- | --- | --- | --- |
| `SOC-IV-PRE` | `AP17C-SOC-IV-PRE-001` | `CH-SOC-IVG-PRE` | `BE-SOC-IVG-PRE` |
| `SOC-IV-APP` | `AP17C-SOC-IV-APP-001` | `CH-SOC-IVG-APP` | `BE-SOC-IVG-APP` |
| `SOC-IV-ADM` | `AP17C-SOC-IV-ADM-001` | `CH-SOC-IVG-ADM` | `BE-SOC-IVG-ADM` |
| `SOC-IV-CORRECTION` | `AP17C-SOC-IV-CORRECTION-001` | `CH-SOC-IVG-CORRECTION` | `BE-SOC-IVG-CORRECTION` |
| `SOC-AHV-OBJ` | `AP17C-SOC-AHV-OBJ-001` | `CH-SOC-AHVG-OBJ` | `BE-SOC-AHVG-OBJ` |
| `SOC-AHV-APP` | `AP17C-SOC-AHV-APP-001` | `CH-SOC-AHVG-APP` | `BE-SOC-AHVG-APP` |
| `SOC-AHV-ADM` | `AP17C-SOC-AHV-ADM-001` | `CH-SOC-AHVG-ADM` | `BE-SOC-AHVG-ADM` |
| `SOC-AHV-CORRECTION` | `AP17C-SOC-AHV-CORRECTION-001` | `CH-SOC-AHVG-CORRECTION` | `BE-SOC-AHVG-CORRECTION` |
| `SOC-UV-OBJ` | `AP17C-SOC-UV-OBJ-001` | `CH-SOC-UVG-OBJ` | `BE-SOC-UVG-OBJ` |
| `SOC-UV-APP` | `AP17C-SOC-UV-APP-001` | `CH-SOC-UVG-APP` | `BE-SOC-UVG-APP` |
| `SOC-UV-ADM` | `AP17C-SOC-UV-ADM-001` | `CH-SOC-UVG-ADM` | `BE-SOC-UVG-ADM` |
| `SOC-UV-CORRECTION` | `AP17C-SOC-UV-CORRECTION-001` | `CH-SOC-UVG-CORRECTION` | `BE-SOC-UVG-CORRECTION` |

Die Migration erhält insbesondere den IV-Einwand gegen Vorbescheid und die direkte IV-Beschwerde gegen Verfügung. Sie darf diese nicht dem Einspracheweg von AHVG, UVG, ELG, AVIG oder KVG angleichen. Jede neue Bundesregel übernimmt die bisherige Dauerform, Auslösung, Stillstandsregel, Fristwahrung und fachliche Quellenkette. Die technischen AP17-Fallgrenzen 01.01.2026 bis 31.12.2027 werden nicht durch die Migration vergrössert. Das bestehende `legalEffectiveFrom` wird als Ausgangsbeleg behandelt, nicht unbesehen als zeitliche Gültigkeit sämtlicher neu getrennten Normbindungen.

### Migrationsschritte, erst nach Vertragsbeschluss

1. Neues Datenrelease aus dem unveränderlichen MVP-0.4-Stand ableiten. Alte Releases, Artefakte, Pins und archivierte Referenzresultate bleiben byteidentisch.
2. Zwölf Bundesregeln und zugehörige BE-Anbindungen erzeugen. Bestehende Quellen und Tagesparameter semantisch vergleichen. Aufgeteilte räumliche/zeitliche Voraussetzungen dürfen keine stillschweigende zusätzliche Freigabe erzeugen.
3. Ausschliesslich die zwölf zugeordneten Sozialdefinitionen und ihre zwölf Regime aus der neuen Kopie des v3-Katalogs entfernen. Die drei Sperren `SOC-IV-COURT-OTHER`, `SOC-AHV-COURT-OTHER` und `SOC-UV-COURT-OTHER` samt Quellen und bisherigen Kennungen in `excludedPaths` überführen, `reasonKind: unsupported-procedure`. Nicht benötigte AP17-Sozialreferenzen nur bei nachgewiesen fehlender Mitverwendung entfernen.
4. Restkatalog neu identifizieren. Aus 45 Definitionen und 52 Regimen werden 33 Definitionen und 40 Regime. Die vier Beschaffungspfade `PROC-APPEAL`, `PROC-APPEAL-SECOND`, `PROC-INTERNAL-DAYS`, `PROC-COURT-DAYS`, die Sperre `PROC-ADMIN-OTHER` sowie allgemeines VRPG und politische Rechte bleiben semantisch unverändert. Der semantische Objektvergleich muss dies belegen, nicht nur die Anzahl der Zeilen.
5. Manifest 5 und Consumer 5 gemeinsam prüfen. Bei einem Mischstand mit alten und neuen aktiven Sozialpfaden scheitert das gesamte Release. Keine Vorrangregel «neu gewinnt».
6. Bestehende UI-Defaults anhand der expliziten Tabelle zuordnen, wobei die sichtbare Erlass-/Handlungsauswahl erhalten bleiben kann. Fachbestätigungen, Datumswerte, Kalenderreferenz und neue Zuständigkeitsfakten werden nicht als dauerhaft bestätigte Defaults übernommen.
7. Bestehende AP17-Referenzen auf altem Consumerpfad unverändert prüfen. Dieselben qualifizierten Fälle über den neuen Adapter rechnen und Ergebnis, Zählspur, Sperren und Quellenäquivalenz vergleichen. Zusätzliche notwendige Qualifikationen werden gesondert als Verhaltensänderung dokumentiert, nicht durch künstlich gesetzte `true`-Werte versteckt.
8. Erst nach diesen Migrationstests die zwölf neuen ELG-/AVIG-/KVG-Bundespfade gemäss AP19C1–C3 integrieren. Kandidaten erhalten keine Aktivierung allein aufgrund der vorher abgenommenen Fachmatrix.

Alte IDs bleiben in historischen Releases und Belegen erhalten. Der neue Live-Resolver akzeptiert eine alte Mapping-ID nicht als ungeprüften Alias. Eine Legacy-Defaultmigration darf nur Auswahlzustand überführen und muss danach die aktuellen Voraussetzungen erneut verlangen.

Die ältere allgemeine Definition `ATSG-SPEC-REL-060` und ihr Regime bleiben eingeschränkter Altbestand des v3-Katalogs. Sie sind kein Ersatzpfad bei fehlender neuer Qualifikation. Ihre vorhandene UI-Sperre darf nicht gelockert werden. Ein Format-5-Aufruf, der für einen Sozialfall den neuen Resolver umgeht und direkt diesen Altbestand anspricht, ist abzuweisen. Die Prüfung muss diesen Umgehungsversuch ausdrücklich enthalten. Der Bestand wird nicht stillschweigend als zusätzlicher 25. qualifizierter Sozialpfad mitgezählt.

## 7. Zeitvertrag und Rechenraum

Vier Zeiten sind getrennt: Geltung einer konkreten Norm, technische Fallabdeckung, Prüftag der Quelle und Gültigkeit der Produktfreigabe. Eine am 25.09.2026 geprüfte Quelle gilt nicht erst seit diesem Tag. Eine Veröffentlichung einer künftigen konsolidierten Gesetzesfassung aktiviert sie nicht vorzeitig.

Die Regeln werden anhand des ausdrücklich angegebenen Zeitankers ausgewählt. Für reine Tageszählung ist dies gewöhnlich die geklärte Eröffnung. Verlangt Übergangsrecht den Verfahrensbeginn oder eine Zuständigkeitsregel einen anderen Zeitpunkt, muss diese Tatsache vorhanden und durch eine unterstützte Route gebunden sein. Nicht unterstütztes Übergangsrecht wird gesperrt, nicht pauschal mit der am Eröffnungstag aktuellen Gesamtfassung verrechnet.

Der Auslöser und die gesamte Rechenstrecke vom kalendarischen Fristbeginn bis zum verschobenen Enddatum müssen von `sourceCoverage`, `calculationCoverage` und den referenzierten Kalender-/Stillstandsartefakten gedeckt sein. Ein im Dezember eröffnetes Verfahren darf deshalb nicht bloss wegen eines technisch erzeugbaren Januar-Kalenders als geprüft gelten. Bei Rechtsänderungen während des Laufes braucht es ein fachlich bestimmtes Übergangsmodell. Der erste Vertrag löst unbekannte Wechsel nicht automatisch.

AP19A hat für die neuen drei Erlasse keine operative Abdeckung 2027 erteilt. Der ergänzende [AP19B-Quellenvergleich](../fachrecht/quellenabgleich-ap19b.md) schlägt für alle zwölf Pfade das Quellenfenster 01.01.2026–31.12.2027 vor. Bei ELG und KVG beruht dies auf direkten Originalkonsolidierungsvergleichen. Bei AVIG ist die AVIV-Konsolidierung vom 01.02.2027 technisch nicht als XML/PDF abrufbar. Statt eines vorgetäuschten Volltextvergleichs wird die belegte Herleitung aus Originaländerungsrecht und dem amtlichen Änderungsindex ausdrücklich zur Fachabnahme vorgelegt. Die tatsächlich angekündigten Änderungen betreffen andere Sachbereiche als die ALE-Verfahrensnormen. Der Quellenbericht hält die Belegkette, ihre Grenzen und als konservative Alternative ein Fenster bis 31.01.2027 fest.

Die AVIV-Herleitung wird nicht allein durch die technische Machbarkeit genehmigt. Erst ihre ausdrückliche Fachabnahme kann eine spätere operative Abdeckung über Januar 2027 tragen. Ohne diese Abnahme bleibt die entsprechende Produktabdeckung begrenzt, auch wenn ein nicht produktiver Referenzfall bereits das Soll-Datum ausrechnet. Die Referenzdatei bezeichnet die Quellenbasis deshalb eigens als `official-amendment-reconstruction`, ohne menschliche Zeitfreigabe zu behaupten. In allen Fällen muss der gesamte benötigte Rechenzeitraum abgedeckt sein. Eine operative Abdeckung wird erst nach gesonderter Freigabe in `releaseEligibility` geschrieben. Die alten AP17-Abnahmen werden weder zurückdatiert noch nachträglich als AP19-Abnahme ausgegeben.

## 8. Consumer- und UI-Integration ohne Neugestaltung

Der künftige Consumer erhält einen separaten Loader/Validator und einen eigenen Sozialresolver. Er verwendet die bestehende Tagesarithmetik und die bestehenden Kalenderregeln. Ein typisierter Adapter übergibt die bereits geprüfte Bundesregel, Anbindung und Kalenderauflösung an den Rechenkern. Das aktuelle `validateQualifiedSpecialInput` wird nicht mit künstlichen BE-Konstanten umgangen.

Die zwei UI-Spalten, Erlasswahl und progressive Auswahl bleiben erhalten. Bis zu einer gesonderten UI-Abnahme wird die bestehende statische Beschriftung «Sitz der zuständigen Stelle» nicht verändert. Sie darf aber auch nicht stillschweigend zum Berner Wohnsitz einer KVG-Partei umgedeutet werden. Bei neuen Sozialpfaden werden fehlende tatsächlich notwendige Kontextangaben in den vorhandenen kontextabhängigen Feldern eingefügt. Fixe Modellvoraussetzungen bleiben sichtbar feststehende Werte. Keine neue pauschale Bestätigungscheckbox und kein Dropdown mit nur einem echten Wert.

**Eng begrenzter UI-Entscheid vor AP19C:** Der technische Vertrag benötigt `procedureContextCanton` unabhängig von `authoritySeat`. Als konkrete, weiterhin statische Lösung wird vorgeschlagen, das erste Feld global mit «Verfahrenskontext» zu beschriften, während die vorhandene Gemeinwesenauswahl die Produkt-/Verfahrensanbindung auswählt. Bei KVG-Verwaltung muss zusätzlich die kurze sichtbare Voraussetzung «Individuelle OKP-Leistung · versicherte Person mit Wohnsitz im Kanton Bern» erscheinen. Der Versicherersitz wird nicht als neues Pflichtfeld eingeführt. Diese globale Beschriftungsänderung ist ausdrücklich ein Vorschlag zur Abnahme, keine bereits autorisierte Aufhebung des bisherigen UI-Entscheids. Ohne abgestimmte Eingabesemantik bleibt der neue KVG-Verwaltungspfad im Integrationskandidaten gesperrt.

Rechtsgebiet und Spezialerlass werden aus einer expliziten unterstützten Liste angeboten. Neue Datenzeilen machen einen Pfad nicht allein über ähnlich klingende Labels sichtbar. Defaults speichern nur stabile Auswahlwerte, nicht neue Tatsachenbehauptungen. Nach Datenwechsel wird ein vorhandener Zustand bereinigt, ein altes Resultat verworfen und die aktuelle Qualifikation erneut geprüft.

Direkter Kernaufruf, öffentlicher Webclient, lokale Vorschau und SPFx müssen denselben neuen Eingang und dieselben Sperren benutzen. Der Mirror ist Transport, keine zweite fachliche Implementierung. Cache und letzter verifizierter Release bleiben vollständig atomar. Ein Fehler beim Format-5-Laden darf höchstens den vollständig früher verifizierten Release verwenden, niemals alte Kalender mit neuen Bundesregeln mischen. Die UI muss einen solchen Rückfall sichtbar machen, ohne neue Pfade zu simulieren.

## 9. Geforderte Abnahme- und Migrationsnachweise

- Schema- und semantische Gegenproben für unbekannte Felder, Dubletten, defekte Referenzen, falsche Hashes, Mischstände, ungültige Zeitintervalle und unpassende Quellenlocator.
- Alle zwölf alten Sozialpfade samt bisherigen negativen AP17-Fällen vor und nach Migration. Die bisherigen Beschaffungs-, VRPG- und politischen Resultate bleiben identisch.
- Je neuer Bundesregel positive Datumskonstellationen und Gegenfälle für Gegenstand, Stadium, Dokument, Eröffnung, Dauer, Zuständigkeit, Feiertage, Zeit und Freigabe.
- Gleiche Bundesregel mit BE und mindestens einer synthetischen ausserkantonalen Anbindung. Nationaler Strukturtest ohne ausserkantonale Betriebsfreigabe.
- Versicherersitz ausserhalb BE bei korrekt qualifiziertem BE-Produkt-/Gerichtskontext ohne Kalenderwechsel. Umgekehrt kein Erfolg allein aufgrund eines Berner Versicherersitzes.
- Quellenkonflikt, unaufgelöste Partei-/Vertretungsanknüpfung, nicht freigegebener regionaler Feiertagsraum und übersteuerter Pflichtkalender bleiben gesperrt.
- Consumer 4 weist Manifest 5 ab. Consumer 5 liest die unveränderten freigegebenen historischen Manifestformate auf deren alten Verträgen. Alter gespeicherter Default aktiviert keine neue Freigabe.
- Nach Produktintegration werden UI-, Bundle-, SPFx- und gemeinsame Referenztests ausgeführt. AP19B behauptet diese noch nicht durchgeführt zu haben.

**Haltepunkt:** David Steimer entscheidet über diesen Produktvertrag und die neue Formatkombination. Erst danach dürfen Produktschemas, Consumer, Daten und UI im Integrationspaket geändert werden. Fachliche Abnahme der Referenzen, Freigabe eines neuen Datenreleases und Installation bleiben eigenständige, nachvollziehbare Schritte.

## Grundlagen

- [AP19-Arbeitsplan](../fachrecht/sozialversicherungsrecht-ap19.md)
- [Abgenommene nationale Modellstruktur AP19A](sozialversicherungsmodell-ap19a.md)
- [ELG-/AVIG-Quellenpaket](../fachrecht/quellenpaket-ap19a-elg-avig.md)
- [KVG-Quellenpaket](../fachrecht/quellenpaket-ap19a-kvg.md)
- [Spezialregimekatalog-Schema 3.0.0](../../schemas/special-regime-catalog-v3.schema.json)
- [Bisheriger qualifizierter Eingang](../../src/core/qualifiedTypes.ts) und [Anwendbarkeitsprüfung](../../src/core/qualifiedApplicability.ts)
- [Bisherige progressive UI-Auswahl](../../src/ui/vrpgSelection.ts)
