# AP23C Datenvertrag und Migration der kantonalen Verwaltungsverfahren

Stand: 14. Oktober 2026. **Vorlage zum technischen Entscheid DEC-2026-032, noch nicht beschlossen.** [AP23B ist mit Ergänzung abgenommen](../fachrecht/abnahme-ap23b.md), [DEC-2026-031 zur Feiertagsanknüpfung ist beschlossen](../entscheidungen/DEC-2026-031-behoerdensitz-kantonale-verwaltungsverfahren.md). AP23C ist ausdrücklich gestartet. Die Umsetzung und Bereitstellung gehören nicht zu diesem Auftrag.

## Ergebnis und Entscheidungsbedarf

Ein eigenständiger Katalog beschreibt die neuen allgemeinen kantonalen Verwaltungsverfahren. Er ergänzt die fünf bisherigen Rechtsprofile, ersetzt sie aber nicht. Die zwölf abgenommenen TI-/GR-Pfadgruppen erhalten eigene Identitäten, konkrete Voraussetzungen und Kalenderbindungen. Nidwalden bleibt ausschliesslich Kontrastprobe. Die Feiertagsregel gilt als Modellierungsgrundlage für alle späteren Kantone, schaltet sie jedoch nicht frei.

| Bestandteil | Bestehender Vertrag | Vorschlag |
| --- | --- | --- |
| Kantonalverfahrenskatalog | Nicht vorhanden | **1.0.0**, `administrativeProcedureCatalog`, ID `ch-cantonal-administrative-procedures` |
| Manifest und Mindestconsumer | 7.0.0 | **8.0.0**, neuer Pflichtkatalog und eigener streng geprüfter Laufzeitzweig |
| Rechtsprofile | 1.0.0 | Unverändert, genau StPO, ZPO, BGG, VwVG und VRPG-BE |
| Feiertagskatalog | 2.0.0 | Unverändert als Format und fachlicher Bestand, einschliesslich 198 Herkunftsentscheidungen, 104 Bundesbindungen und 32 Projektionen |
| Regelkalender | 3.0.0 | Unverändert, vorhandene TI-/GR-Feiertagsprojektionen ausdrücklich neu verfahrensrechtlich binden |
| Spezialregimekatalog | 3.0.0 | Format und Fachinhalt unverändert |
| Sozialverfahrenskatalog | 2.0.0 | 44 nationale Regeln und 50 BE-Anbindungen erhalten, Releasebindungen neu setzen |
| Persönliche Vorgaben | Version 4 | **Version 5 in eigenem Speicherschlüssel**, kein Rechtsdatenformat |

Die Produkt-/Releaseversion wird durch diese Formatnummern nicht festgelegt. Es entsteht weder eine zusätzliche API noch neue Infrastruktur oder eine zusätzliche M365-Berechtigung.

### Warum ein eigener Katalog

Rechtsprofil 1 besitzt feste Feiertagsrollen, einfache Selektoren und Recheneffekte. Es kennt keine eigenständig freigegebenen kantonalen Verfahrenswege mit Instanz, fester oder angeordneter Fristdauer, besonderen Ausnahmen und Nachweisen. Diese Angaben in einem umgedeuteten `vrpg-be`- oder ZPO-Profil unterzubringen, würde bestehende Verträge verfälschen. Ein neues Rechtsprofil-Hauptformat könnte sie aufnehmen, würde aber Qualifikation und Freigabebindung zusätzlich in eine zweite Struktur einbauen.

Der eigenständige Katalog folgt dem bereits verwendeten Komponentenprinzip. Der Sozialkatalog dient als architektonisches Vorbild, nicht als fachliches Modell für allgemeine kantonale Verfahren. Alle neuen Verfahren verwenden nach ihrer Qualifikation dieselbe Tagesarithmetik. Es wird kein zweiter produktiver Fristenrechner eingeführt.

## Identitäten und Fallauswahl

`profileId` bleibt die Identität eines bisherigen Rechtsprofils. Die neuen Erlasse verwenden dagegen `lawId`, zunächst `lpamm-ti` und `vrg-gr`. Jeder konkrete Weg besitzt eine stabile `pathId` und eine Revision. Gleichlautende Fristzahlen machen zwei Rechtsmittelwege nicht zu derselben Identität.

Der gemeinsame UI- und Laufzeiteinstieg ist eine geschlossene Alternative:

```ts
type ProcedureSelection =
  | { kind: 'legacyProfile'; profileId: string }
  | { kind: 'cantonalAdministrative'; lawId: string; pathId: string; revision: number; stage: string };
```

Dies beschreibt den vorgeschlagenen Typvertrag, noch keine öffentliche API. Es dürfen nicht beide Zweige gleichzeitig vorliegen. Unbekannte oder für den Sitzkanton unzulässige Werte lösen keine Ersatzwahl des ersten Profils aus. Bestehende Berner allgemeine und besondere Wege bleiben im bisherigen Zweig. Sie werden nicht in diesem Paket dupliziert.

| Fachgruppe | Neue Bindung |
| --- | --- |
| TI-80-30, TI-84-30 | Je eigener ordentlicher Rechtsmittelweg, gesetzlich 30 Tage, drei Stillstandsperioden |
| TI-REPLY | Angeordnete Tageszahl in den ausdrücklich qualifizierten Rechtsmittelkontexten, drei Perioden |
| TI-PROVISIONAL-15 | Qualifiziertes vorsorgliches Rechtsmittel, gesetzlich 15 Tage, kein Stillstand |
| TI-ADVANCE | Prozesskostenvorschuss nach Art. 47 Abs. 3/4, angeordnete Tageszahl, kein Stillstand |
| GR-32-30, GR-32-10 | Getrennte verwaltungsinterne Rechtsmittelwege, 30 beziehungsweise 10 Tage, kein allgemeiner Stillstand |
| GR-ADMIN-ORDERED | Angeordnete Tageszahl im qualifizierten Verwaltungsverfahren, kein allgemeiner Stillstand |
| GR-52-30, GR-52-10, GR-42-10 | Drei getrennte gerichtliche Rechtsmittelwege, 30/10/10 Tage, grundsätzlich drei Perioden |
| GR-COURT-ORDERED | Angeordnete gerichtliche Tageszahl, grundsätzlich drei Perioden |

Ein Pfad mit mehreren zulässigen Stufen enthält diese ausdrücklich. Die Auswahl muss genau einen qualifizierten Kontext ergeben. Für alle neuen Wege gelten direkte, rechtlich qualifizierte tatsächliche Eröffnung, Tagesfrist und bekannte zuständige kantonale Stelle. Zulässigkeit des Rechtsmittels, Spezialrecht, materielle Verwirkung, Fixtermin, Verlängerung und Wiederherstellung werden nicht aus einer Zahl erraten.

Die Dauer ist entweder `statutoryDays` mit dem gebundenen gesetzlichen Wert oder `authorityOrderedDays` mit einer tatsächlich angeordneten ganzen Tageszahl. Die bestehende technische Eingabegrenze von 1 bis 365 Tagen bleibt bestehen. Eine abweichende Nutzereingabe macht aus einem gesetzlichen 30-Tage-Weg keinen gültigen 20-Tage-Weg. Ob der feste Wert im GUI vorgefüllt oder fest angezeigt wird, ist eine spätere Darstellungsfrage, seine rechtliche Bindung nicht.

### Konkrete Vertragsfelder

Das [Katalogschema](../../schemas/candidates/ap23c/administrative-procedure-catalog.schema.json), das [Manifestschema 8](../../schemas/candidates/ap23c/release-manifest-v8.schema.json) und die [isolierte TI-/GR-Vertragsprobe](../../tests/golden/candidates/ap23c-administrative-contract.json) konkretisieren die Vorlage. Die Schemas liegen bewusst im Kandidatenverzeichnis. Sie werden noch von keinem Produktreader verwendet.

| Feldgruppe | Bedeutung |
| --- | --- |
| `contractStatus`, `contractDecision` | Vorgeschlagener, bestätigter oder zurückgezogener technischer Vertrag, getrennt vom Datenrelease |
| `projectDecisions`, `review` | Fachentscheid DEC-2026-031 und nachvollziehbare Wiederverwendung der AP23B-Prüfung, keine fingierte neue Quellenprüfung |
| `holidayResolutionPolicy` | Geschlossene Vorrangfolge und Sperre bei ungeklärter Anknüpfung |
| `sources`, `laws` | Eindeutige Norm-/Materialiennachweise und kantonal zugeordnete Erlasse |
| `suspensionProfiles` | Normgebundene, inklusive Stillstandsperioden mit ausdrücklichem Jahreswechsel |
| `holidayBindings` | Eigene rechtliche Verwendung vorhandener Kalenderprojektionen samt tatsächlicher Komponentenbezüge |
| `paths` | Identität, Revision, Handlung, Stufen, Dauer, Qualifikation, Grenzen und Quellen jedes Wegs |
| `temporalBinding` | Getrennte Fall-, Berechnungs-, Quellen- und Normfassungsabdeckung |
| `releaseBinding.pathEligibility` | Vollständige Einzelpfadfreigaben mit Revision, Definitionshashes, Zielkomponenten und Prüfnachweisen |
| `excludedPaths` | Sichtbare Abgrenzungen, darunter NW als Kontrastprobe und TI-Sonderfälle ausserhalb des Piloten |
| `preserved` | SHA-256-gebundene Altbestände als Nachweis ihrer Erhaltung |
| `runtimeActive` | In den Daten stets `false`, kein serialisierter Berechtigungsnachweis für die Laufzeit |

Das Hauptschema lässt alle Kantone und weitere Erlassidentitäten zu. Die Beschränkung auf zwei Erlasse und zwölf Wege gehört zur konkreten AP23C-Probe und ihrer späteren Freigabe, nicht zur Namensmenge des Formats. Zusätzliche Kantone mit bereits vollständig modellierter Semantik können deshalb über neue Daten hinzukommen. Eine noch nicht modellierte Ausnahme darf nicht durch eine freie Zeichenkette eingeschleust werden.

Die Definitionshashes der Einzelpfadbindung werden über rekursiv nach Objektschlüsseln sortiertes JSON berechnet. Arrayreihenfolgen bleiben erhalten. Pfad, Feiertagsbindung und Stillstandsprofil werden jeweils ohne Selbsteinschluss des Freigabeobjekts gebunden. Die SHA-256-Werte der tatsächlichen Zielrelease-Dateien bleiben davon getrennte Rohbytebindungen.

## Feiertage und Vorrangfolge

Der neue Resolver qualifiziert zuerst den Rechtsweg und danach den Feiertagsort:

1. Ein anwendbares Bundes- oder Sozialregime wird in dessen eigenen Zweig geleitet. Ein unbekanntes Spezialregime wird nicht als allgemeines kantonales Verfahren behandelt.
2. Eine ausdrücklich abweichende einschlägige kantonale Verfahrensnorm benötigt eine eigene quellengestützte Bindung.
3. Andernfalls gilt DEC-2026-031 mit der Rolle `authoritySeat`. Für TI/GR ist dies der Sitz der für die Handlung zuständigen kantonalen Stelle. Bei einem Rechtsmittel ist die Zielinstanz massgebend, nicht automatisch die eröffnende Stelle.
4. Die konkrete Feiertagsliste wird aus dem Sitz und den gesetzlich erforderlichen Gebietsfakten bestimmt. Eine Rollenentscheidung ist noch keine regionale Kalenderqualifikation.

Für den Pilot gibt es zwei neue Verfahrensbindungen an bereits vorhandene TI-/GR-Projektionen. Die Bindungen referenzieren die tatsächliche Projektions- und Kalenderidentität sowie die Hashes der verwendeten Komponenten. Kalenderdaten können identisch bleiben, obwohl ihre rechtliche Verwendung eine neue eigene Freigabe benötigt. Die bisherigen Bundesbindungen werden nicht als Nachweis dieser neuen Verwendung übernommen.

Ausserkantonale Partei- oder Vertreterorte allein führen im allgemeinen TI-Verfahren nicht mehr zu einer Sperre. Für diese Orte braucht es deshalb keine zusätzlichen Felder. Die alte Forschungsannahme `allRelevantLocationsTI` bleibt nur im gebundenen historischen AP23B-Nachweis. ATSG- und Bundesprofile behalten dagegen ihre bisherigen Rollenregeln.

Die GR-Grenze `GR-BASE-ONLY` gehört zu den bisherigen Bundesbindungen und wird nicht allein wegen gleicher Kalenderbytes an den neuen allgemeinen VRG-Weg gehängt. Dessen Bindung hat eine eigene fachliche Grundlage. Örtliche Unterschiede aus kantonalem Recht bleiben für später aufgenommene Wege modellierbar. Eigenständige kommunale Erlasse bleiben ausgeschlossen. Interne Gebiets-IDs werden nicht als amtliche BFS- oder vollständige eCH-Gemeindereferenz ausgegeben.

**Kein erster Kalendertreffer, keine freie Vereinigung und kein BE-/CH-Ersatzwert.** Eine nicht modellierte ausdrückliche Ausnahme wird gesperrt. Der Vertrag erlaubt weder eine frei eingegebene Rechtsformel noch eine aus dem GUI gelieferte ungeprüfte Kalenderfreigabe.

## Stillstände und Endverschiebung

Der neue Katalog besitzt eigene normgebundene Stillstandsdefinitionen für TI und GR. Drei Jahresperioden werden mit geschlossenen Datumsausdrücken beschrieben: Ostern minus sieben bis plus sieben Tage, 15. Juli bis 15. August und 18. Dezember bis 2. Januar. Anfang und Ende sind eingeschlossen, ein Jahreswechsel ist ausdrücklich zulässig. Ein leerer Satz bedeutet keinen Stillstand. Weitere Mengen wie «nur Weihnachten» müssen strukturell darstellbar sein, erhalten dadurch aber keine NW-Freigabe.

Die gleichen Kalenderdaten von ZPO, ATSG und kantonalem Recht erlauben eine gemeinsame Datumserzeugung, aber keine Gleichsetzung ihrer Rechtsgrundlagen. Neue Stillstandssätze werden deshalb weder in bestehende Calendar-3-Dateien mit erfundenen `applicableProfileIds` eingefügt noch unter `vrpg-be` versteckt. Der qualifizierte Kantonalresolver gibt Perioden und Quellen an einen internen Rechenplan weiter. Bei Eröffnung während des Stillstands zählt der erste Tag nach dessen Ende bereits, auch ein Sonntag. Es kommt kein zusätzlicher Starttag hinzu.

GR-Gerichtswege kennen die ausdrücklich feststehende Dringlichkeitsverfügung als besondere Falltatsache. Ihre Wirkung ist das Ausschalten des sonst anwendbaren Stillstands. Die blosse Zehntagesfrist, eine beliebige Eilbedürftigkeit oder das Wort «vorsorglich» genügen nicht. Eine solche Verfügung wird nicht aus persönlichen Vorgaben wiederhergestellt.

### Bestätigter Sperrfall TI-O2

Für neue TI-Wege mit tatsächlich anwendbarem Stillstand gilt `blockWhenEnteringApplicableSuspension`. Nach der normalen Zählung wird die Endverschiebung über Wochenende und Feiertage geprüft. Führt sie in einen neu beginnenden anwendbaren Stillstand, bleibt das Ergebnis gesperrt. Der Rechenplan darf diesen Fall weder durch Verschiebung auf den Ferienfolgetag noch durch einen Kalenderoverride eigenmächtig lösen.

Die Rechenspur zeigt den letzten gezählten Tag, den Verschiebungsgrund und die betroffene Stillstandsperiode. Definitives Fristdatum und Kalenderexport fehlen. TI12 bleibt gesperrt. TI06 ohne Stillstand bleibt bei 22. März 2027. Die bestehende Endtagslogik der fünf Altprofile wird nicht pauschal verändert.

## Zeitliche und technische Freigabe

Für die zwölf neuen Wege wird zunächst ein **Fallfenster vom 29. August 2026 bis 31. Dezember 2027** vorgeschlagen. Es schliesst an die bestehenden Kalender an und bleibt innerhalb der fachlichen Referenzjahre. Das ist Teil des noch zu beschliessenden technischen Vertrags, keine aus dem historischen Forschungszeitraum automatisch abgeleitete Produktfreigabe.

Normgeltung, geprüfter Quellenstand, Gebietsstand und Releasefreigabe bleiben getrennte Angaben. Zustellung, jeder gezählte oder übersprungene Tag und jede Endverschiebung müssen im anwendbaren Schnitt dieser Grenzen liegen. Eine Zustellung im Dezember 2027 gestattet kein unqualifiziertes Resultat im Januar 2028. Die offenen Zeitfenster der bisherigen allgemeinen Profile werden nicht verkürzt. Sozialfreigaben bleiben unverändert auf 2026–2027 beschränkt.

`normVersionCoverage` bezeichnet die berücksichtigte Normfassung, nicht das ursprüngliche Inkrafttreten sämtlicher darin enthaltenen Bestimmungen. Das Feld `futureNormAssumption` kennzeichnet die vorgeschlagene Fortgeltungsannahme ausdrücklich. Eine Quellenabdeckung bis Ende 2027 ist eine begrenzte Anwendungsannahme bei unveränderter Rechtslage, keine bereits durchgeführte Prüfung künftiger Gesetzesfassungen.

Jeder neue Pfad benötigt eine konkrete Releasebindung mit Identität, Revision, Fallfenster, Komponentenprüfsummen und Freigabenachweis. Ein fachlich abgenommener Weg mit `candidate`-Status bleibt im produktiven Host nicht aktiv. Eine isolierte lokale Vertragsprobe ist weder ein freigegebener Release noch eine privilegierte Hintertür im Produkt.

Manifest 8 erweitert das Inventar um genau einen neuen Katalog. Bei unverändertem bisherigem Inventar sind dies **41 Datendateien plus Manifest**: fünf Rechtsprofile, 32 Kalender und vier Kataloge. Der neue Katalog enthält zunächst zwölf TI-/GR-Pfade. Die Schemas und der semantische Validator prüfen eindeutige IDs, vollständige Pfad- und Freigabemengen, richtige Rollen, Quellen, Stufen, Zeitgrenzen und Komponentenbezüge. «Schema gültig» allein genügt nicht.

Alle Artefaktbytes werden vor Aktivierung mit Länge und SHA-256 geprüft. Die Laufzeitfreigabe entsteht ausschliesslich aus dem vollständigen validierten Release, nicht aus einem serialisierten Flag, einem Defaultwert oder einem vom UI konstruierten Rechenplan. Die lokale Probe und spätere freigegebene Daten erhalten klar getrennte Prüfwege.

## Migration und Rückfall

| Bereich | Verbindliche Anforderung für die Umsetzung |
| --- | --- |
| Historische Formate | Reader und bytegebundene Daten der Formate 1–7 sowie AP5 bleiben erhalten. Consumer 7 weist Format 8 zurück. Kein Ersatz eines neuen Pfads durch ein ähnlich benanntes Altprofil. |
| Alter Rechtsbestand | Fünf Rechtsprofile, 104 Bundesbindungen, 32 Projektionen, 479 Katalogregeln und zwölf gesonderte SO-Prozessregeln fachlich erhalten. Keine globale Feiertags- oder Stillstandsergänzung. |
| Neuer Katalog | Aus der abgenommenen AP23B-Grundlage und DEC-2026-031 ableiten. Die zwei TI-/GR-Verfahrensbindungen, ihre Stillstände und zwölf Pfadfreigaben vollständig prüfen. NW und übrige Kantone bleiben unfreigegeben. |
| Feiertagskatalog und Kalender | Neue technische Releasebindung des Katalogs kann dessen Hash verändern. Dadurch ändern sich auch Kalenderbytes mit eingebettetem Kataloghash, obwohl ihre Rechenregeln identisch sind. Alle abhängigen Hashes neu berechnen, keine handschriftlich kopierten Sollwerte. |
| Sozialkatalog | 44 Regeln und 50 BE-Anbindungen fachlich erhalten. Alle 50 Freigaben mit neuer Release-ID und CH-/BE-/Feiertagskataloghashes neu binden. Kandidatenstatus, keine ausserbernische Sozialfreigabe und keine Verlängerung über 2027. |
| Quellen | Neue operative Quellen und begründete Wiederverwendung erst bei der späteren Releasequellenprüfung zusammenführen. DEC-2026-031 ist eine Fachentscheidung, kein Ersatz eines Gesetzestexts oder pauschaler Quellenpass. |
| Provider und Cache | Nur vollständig erneut geprüfte Originalbytes derselben tatsächlichen Datenkonfiguration verwenden. Kein anderer Mirror, globaler Altcache oder eingebetteter BE-Stand als Ersatz für fehlende TI-/GR-Daten. |
| Hosts | Root-Core/UI, SPFx-Produktkopien und beide Schemaablagen synchronisieren. Konfigurations- oder Manifestwechsel verwirft Formularresultat und Export. Verspätete Antworten alter Konfigurationen werden ignoriert. |
| Rückfall | Gebundenes bisheriges Paket und Datenkonfiguration wiederverwenden. Neue Daten nicht in Format 7 zurückkonvertieren. App-Paketnummer und konkreter Installationsrückfall werden erst mit dem Release gebunden. Kein Browserdatenreset. |

### Persönliche Vorgaben Version 5

Heute teilen die Hosts den Schlüssel `fristenrechner.defaults.v1`, dessen Inhalt Version 3 oder 4 hat. Ein v5-Inhalt am selben Schlüssel würde von älteren Hosts nicht verstanden und beim Speichern überschrieben. Vorgeschlagen wird deshalb der neue Schlüssel **`fristenrechner.defaults.v5`**.

Nur wenn dieser neue Schlüssel fehlt, dürfen gültige alte Vorgaben rein lesend übernommen werden. Gültige Sprache, Behördenkanton, bisheriges Profil, angezeigte Fristdauer, Zustellart und eindeutig gleichbedeutende stabile Auswahlwerte können erhalten bleiben. Die neue kantonale Gesetzes-/Pfadauswahl bleibt leer, wenn sie nicht ausdrücklich gespeichert wurde. Ein alter TI-Behördenkanton bei ZPO wird nicht zum TI-Verwaltungsverfahren.

Nicht übernommen oder gespeichert werden Empfangsdatum, tatsächliche Zuständigkeitsbestätigung, Dringlichkeitsverfügung, Gebietszugehörigkeitsnachweise, Spezialrechtsausschluss und andere Fallbestätigungen. Auch das bisher speicherbare `specialLawStatus` darf nicht als aktuelle Fallqualifikation migriert werden. Eine gespeicherte Stufe oder Handlung ist nur eine sichtbar prüfbare Bedienvorgabe, keine Rechtsprüfung.

Die erste erfolgreiche v5-Initialisierung setzt den neuen Zustand. «Standards zurücksetzen» schreibt bei erkanntem v5-Zustand einen Resetmarker, statt den Schlüssel ersatzlos zu löschen. Sonst würden beim nächsten Start alte Vorgaben wiederaufleben. Der alte Schlüssel bleibt unverändert. Unbekannte künftige Versionen oder beschädigte v5-Inhalte werden weder automatisch noch mit dem gewöhnlichen Reset überschrieben und lösen keinen Rückgriff auf alte Vorgaben aus. Eine Bereinigung solcher geschützter Daten braucht eine gesonderte bewusste Entscheidung. Bei blockiertem Speicher arbeitet die aktuelle Sitzung ohne dauerhafte Migration. Ohne erfolgreichen Schreibzugriff kann kein dauerhafter Resetnachweis versprochen werden, dies muss die Oberfläche melden.

Ein Besuch in AP5 oder ein Rückfall auf den alten Consumer darf die neuen Vorgaben nicht verändern. Umgekehrt darf die neue Oberfläche alte Hostpräferenzen nicht löschen. Bei einem Wechsel von Gesetz, Pfad, Stufe, Fristdauer, Kalenderkontext oder Ausnahme werden Resultat und Kalenderexport sofort ungültig.

## Oberfläche und Rechenspur

Der zweispaltige Aufbau und die frühe Datumseingabe bleiben. Nach dem Sitzkanton erscheinen bestehende Bundeserlasse und nur konkret freigegebene kantonale Erlasse. Eine Auswahl mit nur einem echten Wert wird fest angezeigt. Es gibt keine neuen redundanten Dokumentfelder und keine allgemeine zusätzliche Bestätigungscheckbox allein wegen des neuen Vertrags.

Die fachlich tatsächlich unterschiedlichen Angaben bleiben erkennbar: Handlung, nötige Stufe und eine relevante besondere Anordnung. Quellen, Rechtsnormen, Bindungsgrund und technische Releaseidentitäten gehören überwiegend in die Rechenspur. Auch ein manuell übersteuerter Automatismus darf keine fehlende Anwendbarkeit, feste gesetzliche Dauer, TI-O2-Sperre, Zeitgrenze oder fehlende Releasefreigabe umgehen. Zulässige Kalenderübersteuerungen brauchen wie bisher einen sichtbaren Grund und eine geprüfte Zielbindung.

Ergebnis, Rechenspur und ICS tragen dieselbe diskriminierte Herkunft wie die Auswahl. Ein Kantonalresultat enthält `lawId`, `pathId`, Revision und Releasebezug, nicht eine erfundene historische `profileId`. Gesetzesbezeichnung und Quellen dürfen beim Export nicht auf BE oder einen Bundeserlass zurückfallen. Nach jeder relevanten Eingabeänderung wird die Herkunft samt Resultat verworfen.

DE/FR bleiben die Produktsprachen. IT/Rumantsch Grischun bleibt #49. Die Feldhöhenprüfung #50 ist separat und keine Änderung der Datumseingabelogik in AP23C.

## Prüfung und nachfolgende Teilpakete

Die [isolierte Vertragsprüfung](verwaltungsverfahrensvertrag-ap23c-pruefung.md) unterscheidet ausgeführte Schema-/Modellproben von den erst in AP23D auszuführenden Produkttests. Sie bewahrt den alten AP23B-Checker und ergänzt die heute geänderte TI-Ortsregel. Keine Behauptung bereits bestandener Hostintegration.

Nach Abnahme von AP23C und Beschluss von [DEC-2026-032](../entscheidungen/DEC-2026-032-kantonale-verwaltungsverfahren-datenvertrag.md) sind nacheinander vorgesehen:

1. **AP23D1:** neue Reader, Validierung, qualifizierter Kantonalresolver, interner Rechenplan und gemeinsame Arithmetik. Historische Reader und neue Sperrtests absichern.
2. **AP23D2:** TI-/GR-Kandidaten, Defaults 5, ruhige DE-/FR-Oberfläche, Rechenspur und Exportbindung. Alle Fachreferenzen im echten Produkt ausführen, ergänzte TI-Ortsfälle einschliessen.
3. **AP23D3:** SPFx-/Webintegration, Provider-/Cacheprüfung, Gesamtregression, AP5-Schutz und gebauter lokaler Kandidat. Reale Geräte-, Gast- und Q-Abnahme erst im gesondert freigegebenen Releasevollzug.

Ein wesentliches Paket gleichzeitig, höchstens fünf Nettoarbeitstage je Teilpaket. Grössere Abschnitte werden vor Beginn weiter geteilt. Weitere Kantonstranchen nach AP23E und Releaseumfang werden gesondert entschieden. David Steimer entscheidet und nimmt ab, Codex bereitet vor und prüft ohne formelle Freigabe- oder Haftungsverantwortung.
