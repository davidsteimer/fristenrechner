# AP19C2 · Quellenrefresh für die AVIG-ALE-Integration

Prüfdatum: 28. September 2026. Durchführung: Codex als KI-Arbeitsinstrument. **Technischer Quellenprüfnachweis, keine fachliche Kandidatenabnahme oder Betriebsfreigabe.**

Grundlagen sind die [AP19B-Abnahme einschliesslich Option B](abnahme-ap19b.md) und der unveränderte [AP19B-Quellenabgleich](quellenabgleich-ap19b.md). Maschinenlesbarer Nachweis mit Abrufzeiten, Quellenkennungen und SHA-256: [source-review.json](../../outputs/ap19c2-2026-09-28/sources/source-review.json). Die [zeitlichen Bindungen](zeitliche-bindung-ap19c2.md) sind separat beschrieben.

## Ergebnis und Reichweite

In den frisch gelesenen Primärtexten und im vollständigen amtlichen artikelbezogenen Zukunftsänderungsindex wurde **kein integrationshindernder Rechtswechsel gegenüber AP19B festgestellt**. Das nachgewiesene Anwendungsfenster der vier eng qualifizierten ALE-Pfade bleibt **01.01.2026–31.12.2027**, einschliesslich Auslöser, Zähltagen und Ergebnis. Später publizierte Änderungen können diesen Kenntnisstand überholen.

Geprüft sind Einsprache, ordentliche Beschwerde, angeordnete Verwaltungstagesfrist und gerichtliche Nachfrist zur Behebung formeller Beschwerdemängel bei individueller Arbeitslosenentschädigung. Die nationalen Normketten bleiben von den Berner Produktanbindungen und der gesonderten Feiertagsauflösung getrennt. Die Bundesnormen erhalten keine eingebaute Bern-Konstante.

**Option B bleibt erforderlich und tragfähig.** Der amtliche Februar-2027-XML-Endpunkt liefert weiterhin lediglich die HTML-Oberfläche. Die abgenommene Methode `official-amendment-reconstruction` wird deshalb erneut mit gelesener Januar-Konsolidierung, beiden Originaländerungsakten und frischem vollständigem Zukunftsindex belegt. Ein selbst rekonstruierter amtlicher Volltext wird weder erzeugt noch behauptet.

## Frisch gelesene Quellen

Die direkten Originalabrufe erfolgten am 28.09.2026 zwischen **08:55:41 und 08:55:44 UTC**, der erfolgreiche Indexabruf um **08:55:44 UTC**. XML wurde geparst, kantonales XHTML aus der amtlichen BELEX-JSON-Antwort extrahiert. Alle zehn erfolgreichen Originaldateien beziehungsweise Erlassdatensätze sind byteidentisch zu den bezeichneten AP19B-/AP19C1-Vorbelegen. Der heutige Befund beruht dennoch auf einem neuen Abruf und neuer Gegenlesung, nicht auf einem bloss aktualisierten Prüfdatum.

| Quelle | Frisch gelesener Umfang | Befund |
| --- | --- | --- |
| [ATSG, Stand 01.01.2024][ATSG] | Art. 2, 38–41, 49, 51, 52, 55, 56, 58, 60 und 61 | Einzelgesetzlicher Eintritt, 30 Tage, Folgetag, Stillstände und Partei-/Vertretungsanker unverändert. Kein pauschaler ATSG-Wohnsitzersatz für die AVIG-Gerichtszuständigkeit |
| [AVIG, Stand 01.01.2026][AVIG] | Art. 1, 20, 100 und 101 | Keine Gleichsetzung einer formlosen Abrechnung mit einer Verfügung. Die Dreimonatsgrenze von Art. 20 Abs. 3 und der Bundesverwaltungsgerichtsweg bleiben ausserhalb des Kandidaten |
| [AVIV 01.01.2026][AVIV26A], [01.08.2026][AVIV26B], [01.01.2027][AVIV27A] | Art. 26, 77, 119 und 128, zusätzlich Änderungen an Art. 46, 66a und Befristung von Art. 57b | Die vier ALE-relevanten beziehungsweise abgrenzenden Artikel sind in allen drei Fassungen textgleich. Mehrstundenänderungen und KAE-Befristung verändern die vier ALE-Pfade nicht |
| [AS 2025 814][AS25] | Art. 46 Abs. 2, Art. 66a Abs. 2, Inkrafttretensbestimmung III, Kontext der übrigen Änderungen | Die beiden bezeichneten Mehrstundenänderungen treten erst am 01.01.2027 in Kraft und sind in der gelesenen Januar-Fassung enthalten. Die übrigen Änderungen gelten bereits seit 01.01.2026 |
| [AS 2026 258][AS26] | Vollständiger Änderungstext | Ausschliesslich Verlängerung der KAE-Höchstdauer nach Art. 57b vom 01.08.2026 bis 31.01.2027. Danach werden diese Änderungen hinfällig. Kein ALE-Fristwechsel |
| [AMG, BSG 836.11][AMG] | Version 3444, Stand 01.09.2026, Art. 35 und Versionsmetadaten | Einsprache bei der verfügenden Stelle und Beschwerde ans Verwaltungsgericht im bezeichneten kantonalen Scope unverändert, je 30 Tage. Keine künftige Version im Datensatz |
| [GSOG, BSG 161.1][GSOG] | Version 3367, Stand 01.05.2026, Art. 54 und Versionsmetadaten | Organisatorische Zuweisung einschliesslich französischsprachiger Geschäfte unverändert. Keine künftige Version im Datensatz |
| [FRG, BSG 555.1][FRG] | Version 2234, Stand 01.04.2021, Art. 2 und Versionsmetadaten | Berner Feiertagsbestand unverändert. Keine künftige Version im Datensatz. Der Kanton des Versicherungsträgers ersetzt keinen gesetzlichen Feiertagsanker |

Swiss Caselaw wurde ergänzend zur stichtagsbezogenen Gegenlesung von AVIG Art. 100 und AVIV Art. 119 verwendet. Die tragenden Erlasstexte wurden anschliessend beziehungsweise parallel unmittelbar amtlich gelesen. Die dynamischen Weboberflächen waren im allgemeinen Webzugang nicht auslesbar. Der direkte Originalabruf gelang. Ein erster Indexversuch mit generischem JSON-Accept-Header ergab HTTP 406, die korrekt mit `application/sparql-results+json` angeforderte Antwort war erfolgreich. Diese technischen Befunde werden nicht als rechtliche Quellenlücke gewertet.

## Vollständiger Zukunftsänderungsindex und Option B

Die [reproduzierbare SPARQL-Abfrage](../../outputs/ap19c2-2026-09-28/sources/future-index.rq) an den [amtlichen Fedlex-Endpunkt][INDEX] erfasste **alle dort enthaltenen artikelbezogenen Änderungsauswirkungen von ATSG, AVIG und AVIV** mit Wirksamkeit vom 28.09.2026 bis 31.12.2027. Es gab keine Einschränkung auf Publikationsjahre oder bekannte Zielartikel. Die [amtliche Antwort](../../outputs/ap19c2-2026-09-28/sources/future-index.json) enthielt genau drei Einträge:

| Wirksamkeit | Ziel | Änderungsakt | Wirkung auf die vier ALE-Pfade |
| --- | --- | --- | --- |
| 01.01.2027 | AVIV Art. 46 | AS 2025 814 | Keine, Kurzarbeitsentschädigung |
| 01.01.2027 | AVIV Art. 66a | AS 2025 814 | Keine, Schlechtwetterentschädigung |
| 01.02.2027 | AVIV Art. 57b | AS 2026 258 | Keine, Ablauf befristeter KAE-Höchstdauer |

Für ATSG und AVIG ergab diese Abfrage keinen Treffer. Antwort-SHA-256: `5ba80fad00e635588255f7ad75dc49b838c2ee6ca19a5dd64863d32ec6c76e77`. Dies bindet den heutigen Registerbefund, nicht unveränderliches zukünftiges Recht.

Damit ist die Option-B-Belegkette erneut vorhanden: **AVIV 01.01.2027 + AS 2025 814 + AS 2026 258 + frischer vollständiger artikelbezogener Zukunftsindex**. Für 01.02.2027–31.12.2027 werden ausschliesslich die unveränderten relevanten ALE-Normen hergeleitet. Der HTML-Fallback der Februar-Datei erhält keinen gültigen Konsolidierungsnachweis. Die Nachweismethode ist bereits in AP19B abgenommen, die konkrete AP19C2-Integration und jede spätere Betriebsfreigabe sind davon getrennt.

## Anbindungen und Abgrenzungen unverändert

- **Arbeitslosenkasse:** Kassenhauptsitz, Berner Kontrollkontext, Gerichtskanton und Feiertagsanker sind unterschiedliche Angaben. Art. 119 Abs. 1 Bst. a AVIV betrifft die kantonale Amtsstelle und dient im abgenommenen Kassenverwaltungspfad der qualifizierten kantonalen Kontextanbindung. Er wird nicht als allgemeine Kassenhauptsitzregel ausgegeben.
- **Zeitpunkt:** Bei den auf einer ursprünglichen Verfügung beruhenden Pfaden bleibt der Zeitpunkt dieser Verfügung nach Art. 119 Abs. 2 AVIV massgebend. Bei einer vorher angeordneten Verwaltungstagesfrist muss die laufende Zuständigkeit als eigener Fallbefund geklärt sein. Ein «Bezugsdatum der laufenden Zuständigkeit» darf nicht als bereits vorhandene ursprüngliche Verfügung behandelt werden.
- **Kantonale Amtsstelle:** Verfügung beziehungsweise Tagesanordnung durch die zuständige bernische Stelle oder rechtmässig beauftragte Stelle. Ungeklärte Delegation oder Einspracheinstanz bleibt gesperrt. Die Bezeichnung RAV allein genügt nicht.
- **Gericht:** Bei Kassenverfügungen Art. 128 Abs. 1 in Verbindung mit Art. 119 AVIV für ALE, bei kantonaler Amtsstelle Art. 128 Abs. 2. Kein automatischer Gerichtsstand aus Wohnsitz oder Kassensitz. Art. 77 AVIV eröffnet keinen Insolvenzentschädigungspfad.
- **Feiertage:** Art. 38 Abs. 3 ATSG verlangt eine gesonderte Auflösung für Partei und Vertretung. Erste Produktkombinationen bleiben bei den bereits freigegebenen CH-/BE-Kalendern. Der gesamte Schweizer Feiertagskatalog wurde hier nicht erneut geprüft.
- **Ausgeschlossen:** Kurzarbeits-, Schlechtwetter- und Insolvenzentschädigung, kollektive oder kantonale AMM, Bundesinstanzen, materielle Anspruchs-/Kontrollfristen, formloser Abrechnungsauslöser, Zwischenverfügungsbeschwerde und allgemeine gerichtliche Tagesfristen. Keine der heutigen Quellenprüfungen erweitert diese Produktgrenzen.

## Rechtsprechung und bewusst wiederverwendete Vorbelege

[BGer 8C_767/2008 vom 12. Januar 2009, E. 4.3.2][BGER] wurde erneut vollständig über Swiss Caselaw gelesen. Entscheidsuche bestätigte die Fundstellenidentität `CH_BGer_008_8C-767-2008_2009-01-12`. Die Erwägung trägt die enge Nachfrist zur Behebung formeller Beschwerdemängel, nicht sämtliche Fristen eines gerichtlichen Verfahrens. Die Anwendung dieses ATSG-Grundsatzes auf den eng qualifizierten ALE-Beschwerdepfad bleibt die abgenommene Modellableitung. Eine vollständige Suche nach neuerer Rechtsprechung wird nicht behauptet.

Die historischen Originalvergleiche aus AP19B werden **als abgenommene Vorbelege, nicht als heutige Neuabrufe** übernommen:

- AMG Version 2480, gültig 01.02.2022–31.08.2026, Art. 35, damalige Originalprüfsumme `3876608893f55c7716efcdaa0af6364c86370750a724cb8308dd10697e31305b`.
- GSOG Version 3144, gültig 01.01.2026–30.04.2026, Art. 54, damalige Originalprüfsumme `dc468710cc6e28ccffd796175e7205361a9ec3c6a0926ddc02caf51acf889cdd`.

Die aktuelle Fassung und deren Versionsmetadaten wurden dagegen frisch geprüft. Der bundesrechtliche Feiertagsgrundbestand sowie C1-Quellen ausserhalb der bezeichneten Normketten behalten ihre bisherigen Nachweise. Es wird keine heutige Gesamtprüfung aller C1-Regeln behauptet.

Ein Konsolidierungsdatum ist nicht automatisch das Inkrafttreten jedes enthaltenen Artikels. Für das technische Modell ist deshalb das **nachgewiesene Anwendungsintervall** 01.01.2026–31.12.2027 von ursprünglicher Normgeltung und operativer Freigabe zu unterscheiden. Quellenkennungen, darunter die fassungsübergreifende `SRC-AP19C2-AMG-BE-ART35`, sind im maschinenlesbaren Nachweis an die tatsächlichen Originale beziehungsweise bezeichneten Vorbelege gebunden.

[ATSG]: https://www.fedlex.admin.ch/eli/cc/2002/510/20240101/de
[AVIG]: https://www.fedlex.admin.ch/eli/cc/1982/2184_2184_2184/20260101/de
[AVIV26A]: https://www.fedlex.admin.ch/eli/cc/1983/1205_1205_1205/20260101/de
[AVIV26B]: https://www.fedlex.admin.ch/eli/cc/1983/1205_1205_1205/20260801/de
[AVIV27A]: https://www.fedlex.admin.ch/eli/cc/1983/1205_1205_1205/20270101/de
[AS25]: https://www.fedlex.admin.ch/eli/oc/2025/814/de
[AS26]: https://www.fedlex.admin.ch/eli/oc/2026/258/de
[AMG]: https://www.belex.sites.be.ch/api/de/texts_of_law/836.11
[GSOG]: https://www.belex.sites.be.ch/api/de/texts_of_law/161.1
[FRG]: https://www.belex.sites.be.ch/api/de/texts_of_law/555.1
[INDEX]: https://fedlex.data.admin.ch/sparqlendpoint
[BGER]: https://mcp.opencaselaw.ch/entscheid/bger_8C_767_2008#e-4-3-2
