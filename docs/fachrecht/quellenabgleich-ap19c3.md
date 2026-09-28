# AP19C3 · Quellenrefresh für die KVG-/OKP-Integration

Prüfdatum: 28. September 2026. Durchführung: Codex als KI-Arbeitsinstrument. **Technischer Quellenprüfnachweis, keine fachliche Kandidatenabnahme und keine Betriebsfreigabe.**

Grundlagen sind die [AP19B-Abnahme](abnahme-ap19b.md), das unveränderte [KVG-Quellenpaket](quellenpaket-ap19a-kvg.md) und der [AP19B-Quellenabgleich](quellenabgleich-ap19b.md). Der maschinenlesbare Nachweis mit Abrufzeiten, Quellenkennungen und SHA-256 liegt in [source-review.json](../../outputs/ap19c3-2026-09-28/sources/source-review.json). Die [zeitlichen Bindungen](zeitliche-bindung-ap19c3.md) sind separat beschrieben.

## Ergebnis und Reichweite

Die erneut gelesenen Originalquellen und der vollständige amtliche artikelbezogene Zukunftsänderungsindex ergeben **keinen integrationshindernden Rechtswechsel gegenüber AP19B**. Das kenntnisstandsabhängig belegte Anwendungsfenster der vier qualifizierten OKP-Pfade bleibt **01.01.2026–31.12.2027**, einschliesslich Auslöser, Zähltagen und Ergebnis. Dies ist keine Garantie unveränderten künftigen Rechts.

Geprüft sind ausschliesslich individuelle Leistungen der obligatorischen Krankenpflegeversicherung gegenüber dem zuständigen Krankenversicherer:

- Einsprache gegen qualifizierte erstinstanzliche Leistungsverfügung, gesetzlich 30 Tage.
- Ordentliche Beschwerde gegen den bezeichneten Einspracheentscheid, gesetzlich 30 Tage.
- Konkret nach N Tagen angeordnete prozessuale Frist beim Krankenversicherer.
- Gerichtliche Tagesnachfrist zur Behebung formeller Beschwerdemängel im bezeichneten Beschwerdeverfahren.

Der nationale Bundesvertrag bleibt von den Berner Produkt-/Gerichtsanbindungen und der Feiertagsauflösung getrennt. Die Prüfung erweitert weder die vier abgenommenen Pfade noch deren materiellen Gegenstand. Insbesondere ist dies **keine Vollprüfung der Leistungsberechtigung, des ganzen KVG, des KVAG oder sämtlicher Ausführungsverordnungen**.

## Frische Originalabrufe und Gegenlesung

Die fünf Originaltexte beziehungsweise Erlassdatensätze wurden am 28.09.2026 zwischen **10:43:39 und 10:43:40 UTC** direkt amtlich abgerufen. Der Zukunftsindex folgte um **10:43:40 UTC**, die ergänzende Konsolidierungsliste um **10:44:28 UTC**. Alle fünf Originaldateien sind byteidentisch zu den bezeichneten AP19B-/AP19C1-Vorbelegen. Die heutige Prüfung beruht dennoch auf neuen Abrufen, geparsten Originaltexten und neuer Gegenlesung, nicht nur auf einem aktualisierten Prüfdatum.

| Quelle | Gelesener Umfang | Befund und Grenze |
| --- | --- | --- |
| [ATSG, Stand 01.01.2024][ATSG] | Art. 2, 38–41, 49, 51, 52, 55–58, 60 und 61 | Eintritt, qualifizierte Auslöser, 30 Tage, Folgetag, Stillstände, Partei-/Vertretungsanker und ordentliche Gerichtszuständigkeit unverändert. Keine Wiederherstellungsprüfung oder pauschale Berechnung aller Gerichtsfristen |
| [KVG, 01.01.2026][KVG26A] und [01.07.2026][KVG26B] | Art. 1, 1a, 25, 64, 67, 80, 85, 87 und 89 | Für die vier Pfade und ihre bisherigen Abgrenzungen sind Normtext und Fussnoten in beiden Fassungen identisch |
| Dieselben beiden KVG-Fassungen | Zusätzlich Art. 3, 25a, 61 und 64a | Ebenfalls textgleich, einschliesslich Fussnoten. Dienen hier ausschliesslich der präzisen Kennzeichnung von Produktgrenzen, nicht der Freigabe von Versicherungspflicht, Pflege-Restfinanzierung, Prämien- oder Betreibungswegen |
| Dieselben beiden KVG-Fassungen | Art. 53 und 54 | Unterschiedliche Texte in den verglichenen Konsolidierungen. Die Änderungen betreffen den ausgeschlossenen Bundesverwaltungsgerichts-/Tarifkontext beziehungsweise Kosten- und Qualitätsziele, nicht die vier individuellen OKP-Leistungspfade. Das Konsolidierungsdatum wird nicht als Inkrafttreten jedes enthaltenen Artikels ausgegeben |
| [GSOG, BSG 161.1][GSOG] | Version 3367, Stand 01.05.2026, Art. 54 und Versionsmetadaten | Zuweisung zur sozialversicherungsrechtlichen beziehungsweise französischsprachigen Abteilung unverändert. Keine künftige Version im Datensatz. Die organisatorische Zuweisung eröffnet keinen Schiedsgerichtspfad |
| [FRG, BSG 555.1][FRG] | Version 2234, Stand 01.04.2021, Art. 2 und Versionsmetadaten | Berner Feiertagsbestand unverändert, keine künftige Version im Datensatz. Der gesetzliche räumliche Anker folgt separat aus ATSG, nicht aus dem Versicherersitz |

Die normalisierten Texte und separat erfassten Fussnoten stehen in [article-extracts.json](../../outputs/ap19c3-2026-09-28/sources/article-extracts.json). Originalbytes, HTTP-Ergebnis und Inhaltsart sind in [fetch-results.json](../../outputs/ap19c3-2026-09-28/sources/fetch-results.json) nachvollziehbar. Der Vergleich ist artikelbezogen, nicht die Behauptung vollständiger inhaltlicher Identität beider KVG-Fassungen.

Swiss Caselaw wurde ergänzend für KVG Art. 1 und 80 sowie die bezeichnete gerichtliche Erwägung verwendet. Entscheidsuche diente der unabhängigen Identitätsprüfung des Entscheids. Die dynamische Fedlex-/BELEX-Weboberfläche war im allgemeinen Webzugang nicht als Rechtstext auslesbar. Der direkte Abruf des amtlichen XML beziehungsweise des amtlichen BELEX-XHTML in der JSON-Antwort gelang. Diese unterschiedlichen technischen Zugänge sind keine rechtliche Quellenlücke.

## Konsolidierungen und vollständiger Zukunftsindex

Die [amtliche Konsolidierungsliste](../../outputs/ap19c3-2026-09-28/sources/versions.json), reproduzierbar mit [versions.rq](../../outputs/ap19c3-2026-09-28/sources/versions.rq), enthält für das Prüffenster:

| Erlass | Fassung | Amtlich bezeichnete Anwendbarkeit |
| --- | --- | --- |
| ATSG | 01.01.2024 | Offen, keine spätere Konsolidierung in der abgefragten Liste |
| KVG | 01.01.2026 | 01.01.2026–30.06.2026 |
| KVG | 01.07.2026 | 01.07.2026–31.12.2027 |
| KVG, ausserhalb des Prüffensters | 01.01.2028 | Nächste angekündigte Konsolidierung. Nicht als AP19C3-Laufzeitfenster übernommen |

Die [Zukunftsindex-Abfrage](../../outputs/ap19c3-2026-09-28/sources/future-index.rq) an den [amtlichen Fedlex-Endpunkt][INDEX] umfasst **sämtliche dort enthaltenen artikelbezogenen Änderungsauswirkungen für ATSG und KVG mit Wirksamkeit vom 28.09.2026 bis 31.12.2027**. Es gibt keine Einschränkung auf bekannte Artikel oder Publikationsjahre. Die [Originalantwort](../../outputs/ap19c3-2026-09-28/sources/future-index.json) enthält **null Einträge**.

- Zukunftsindex-SHA-256: `3be6cfd1d84058d8d944a72ebe49419d79fe4fb3b176277a4044ebb6c6fc2430`.
- Konsolidierungsliste-SHA-256: `8afa8fac26cb490a544b9bad6a0bb772bf505c7aff3c7fb72a926fe6712275b1`.

Dieser Befund bindet den abgefragten amtlichen Registerstand. Er verspricht weder Vollständigkeit noch Unveränderlichkeit künftiger Publikationen. Für KVG ist keine AVIV-artige Rekonstruktion einer fehlenden Konsolidierung nötig. Die in AP19B abgenommene AVIG-Option B bleibt ein eigener, hier nicht neu geprüfter Nachweis.

## Unveränderte Qualifikations- und Ausschlussgrenzen

Der Eintritt folgt aus **Art. 1 Abs. 1 KVG zusammen mit Art. 2 ATSG**. Gesetzliche Ausnahmen bleiben von blossen Produktgrenzen getrennt. Art. 1a Abs. 1 KVG unterscheidet OKP und freiwillige Taggeldversicherung im selben Absatz, ohne Buchstabenunterteilung. Für diese Unterscheidung wird deshalb kein erfundener Buchstabenlocator verwendet.

**Formlose Leistungsabrechnungen sind keine automatisch qualifizierten Verfügungen.** Art. 80 Abs. 1 KVG lässt auch erhebliche Versicherungsleistungen im formlosen Verfahren zu. Für den Einsprachepfad muss die Leistungsverfügung fachlich feststehen. Art. 80 Abs. 3 und Art. 85 KVG verhindern die vorgängige Abhängigkeit vom internen Instanzenzug, ersetzen diese Dokumentqualifikation aber nicht. Eine gewöhnliche Erstverfügung öffnet nicht direkt den modellierten Beschwerdepfad.

Die gesetzlichen ATSG-Ausnahmen für Zulassung/Ausschluss von Leistungserbringern, Tarif-/Preis-/Globalbudgetstreit, Prämienverbilligung und bezeichnete Bundesbeiträge, Versichererstreit sowie Schiedsgericht bleiben ausgeschlossen. Eine blosse Tariffrage innerhalb eines individuellen Leistungsstreits wird nicht ohne weitere Qualifikation zum ausgeschlossenen Tarifverfahren. Beim Schiedsgericht bleibt auch die in Art. 89 KVG bezeichnete Tiers-garant-Vertretung ausserhalb des Kandidaten.

Freiwilliges KVG-Taggeld ist eine **Produktgrenze**, kein pauschaler gesetzlicher ATSG-Ausschluss. VVG-Zusatzversicherung, Prämienforderung, Betreibung, Kostenbeteiligungsinkasso, Versicherungspflicht und kantonale Pflege-Restfinanzierung bleiben ebenfalls ausserhalb dieser individuellen OKP-Leistungstranche. Ein gleicher Versicherer oder eine gleich lange Frist macht daraus keinen zulässigen Pfad. Der Kandidat berechnet keine Zahlungsaufforderung nach Art. 64a KVG als gewöhnliche prozessuale Verwaltungstagesfrist.

## Berner Anbindung und Zeitbezug

Für Einsprache und angeordnete Verwaltungstagesfrist ist `be-kvg-okp-product-scope` ausschliesslich eine **erste Produktbegrenzung**. Die versicherte Person muss am dokumentierten Produktstichtag Wohnsitz im Kanton Bern haben. AP19C3 konkretisiert diesen in AP19B offen zu dokumentierenden Bezug mit dem qualifizierten fristauslösenden Eröffnungstag `legalTriggerDate`. Das ist keine gesetzliche kantonale Zuständigkeitsnorm. Ein ausserkantonaler Sitz des zuständigen Krankenversicherers bleibt möglich und wird nicht als neues Pflichtfeld eingeführt.

Für die beiden Gerichtspfade gilt getrennt `be-atsg58-court`. Die Gerichtszuständigkeit Bern, der ordentliche Inlandsfall und der qualifizierte Wohnsitz der versicherten Person bei Beschwerdeerhebung müssen feststehen. Das gesonderte `jurisdictionReferenceDate` bleibt erhalten. Ein früherer Wohnsitz im Verwaltungsstadium wird nicht übernommen und ein künftiger Wohnsitzwechsel nicht prognostiziert. Drittbeschwerden, Auslandsfälle oder ungeklärte Zuständigkeit sind nicht durch diesen Erstumfang abgedeckt.

Die Feiertagsanknüpfung für Partei und Vertretung wird eigenständig geklärt. Weder Produktkontext noch Versicherer- oder Gerichtssitz ersetzen diesen Anker. Die ersten positiven Kombinationen bleiben bei den bestehenden CH-/BE-Kalendern. Der gesamte Schweizer Feiertagskatalog wurde im Rahmen dieses begrenzten Quellenrefreshs nicht erneut geprüft.

## Gerichtsnachfrist und übernommene historische Belege

[BGer 8C_767/2008 vom 12. Januar 2009, E. 4.3.2][BGER] wurde erneut vollständig gelesen und die Fundstellenidentität über Entscheidsuche als `CH_BGer_008_8C-767-2008_2009-01-12` bestätigt. Die Erwägung unterstellt die Nachfrist zur Nachreichung einer Vollmacht als Behebung formeller Beschwerdemängel dem Verweis von Art. 60 Abs. 2 ATSG. Die generelle Anwendung auf sämtliche gerichtlichen Fristen lässt sie ausdrücklich offen. Der Entscheid ist **nicht KVG-spezifisch**. Seine begrenzte Verwendung für die vierte KVG-Regel bleibt die abgenommene Übertragung der allgemeinen ATSG-Verfahrensaussage. Eine vollständige Suche nach neuerer Rechtsprechung wird nicht behauptet.

Der historische **GSOG-Nachweis Version 3144, 01.01.2026–30.04.2026, Art. 54**, wird aus AP19B übernommen und nicht als heutiger Neuabruf ausgegeben. Damalige Original-PDF-SHA-256: `dc468710cc6e28ccffd796175e7205361a9ec3c6a0926ddc02caf51acf889cdd`. Die heutige aktuelle Fassung und ihre Versionsmetadaten wurden neu geprüft. Der bundesrechtliche Feiertagsgrundbestand und die übrigen C1-/C2-Quellen behalten ihre bisherigen Nachweise. Es wird keine heutige Gesamtprüfung sämtlicher bisherigen Sozialpfade behauptet.

## Grenze des Nachweises

Die frische Quellenprüfung erlaubt die technische Vorbereitung des abgegrenzten Kandidaten. Sie setzt weder `approval` noch einen produktiven Freigabestatus. Referenz- und Sperrtests, fachliche Kandidatenabnahme, spätere Datenpromotion und Betriebsfreigabe sind eigenständige Schritte. Neue oder geänderte Quellenbefunde sind vor einer späteren Veröffentlichung erneut auszuwerten.

[ATSG]: https://www.fedlex.admin.ch/eli/cc/2002/510/20240101/de
[KVG26A]: https://www.fedlex.admin.ch/eli/cc/1995/1328_1328_1328/20260101/de
[KVG26B]: https://www.fedlex.admin.ch/eli/cc/1995/1328_1328_1328/20260701/de
[GSOG]: https://www.belex.sites.be.ch/api/de/texts_of_law/161.1
[FRG]: https://www.belex.sites.be.ch/api/de/texts_of_law/555.1
[INDEX]: https://fedlex.data.admin.ch/sparqlendpoint
[BGER]: https://mcp.opencaselaw.ch/entscheid/bger_8C_767_2008#e-4-3-2
