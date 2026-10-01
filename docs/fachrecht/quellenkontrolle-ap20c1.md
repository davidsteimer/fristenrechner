# AP20C1 · Quellenkontrolle vor der EOG-Integration

Prüfdatum: 30. September 2026. **Begrenzter technischer Quellenabgleich vor der lokalen Integration. Keine zusätzliche Fachabnahme, Datenpromotion oder operative Freigabe.** Die [AP20B-Abnahme](abnahme-ap20b.md), die [eingefrorene Bundesprüfung](quellenabgleich-ap20b-bund.md), die [bernische Zeitbindung](zeitliche-bindung-ap20b.md) und der [Produktvertrag](../architektur/sozialversicherungsvertrag-ap20b.md) bleiben unverändert.

## Ergebnis

Der erneute direkte Abruf der amtlichen Quellen wurde am **30. September 2026 um 20:52 UTC** abgeschlossen. Im überprüften EOG-Umfang besteht **keine Abweichung gegenüber AP20B**:

- Alle sieben Bundesoriginale sind byteidentisch mit den AP20B-Exporten. Zusätzlich stimmen die tragenden Artikeltexte mit den gebundenen AP20B-Extraktwerten überein.
- Die auf ATSG, EOG und EOV begrenzten amtlichen Fassungs- und Änderungsabfragen enthalten dieselben sieben Fassungen und 91 Änderungsauswirkungen wie die entsprechende Projektion des AP20B-Index. Der Vergleich betrifft die vollständigen Zeileninhalte, nicht nur deren Anzahl. 91 Auswirkungen sind keine 91 Erlasse oder neuen Fachbefunde.
- Die beiden BELEX-Erlassantworten zu GSOG und VRPG sowie alle vier daraus gebundenen Original-PDFs sind ebenfalls byteidentisch. Artikeltexte, aktuelle Versionen und leere Listen künftiger Versionen sind unverändert.

Damit ergibt diese Kontrolle keinen Anlass, die abgenommene EOG-Ableitung oder das geprüfte Quellenfenster **01.01.2026–31.12.2027** zu ändern. Das ist keine Garantie gegen später publizierte Änderungen und keine Freigabe für 2028.

## Tatsächlich erneut gelesene Originale

| Quelle | Frisch abgerufene Fassungen | Artikelbezogene Prüfung |
| --- | --- | --- |
| [ATSG](https://www.fedlex.admin.ch/eli/cc/2002/510/20240101/de) | 01.01.2024 | Art. 2, 38–41, 49, 51, 52, 55, 56, 58, 60 und 61 |
| [EOG](https://www.fedlex.admin.ch/eli/cc/1952/1021_1046_1050/20260601/de) | 28.01.2025, 01.06.2026 und 01.07.2027 | Art. 1, 17, 18 und 24 in jeder Fassung. Keine Gleichsetzung von formloser Abrechnung und Verfügung oder von kantonaler und nichtkantonaler Kasse |
| [EOV](https://www.fedlex.admin.ch/eli/cc/2005/187/20260601/de) | 01.01.2025, 01.06.2026 und 01.07.2027 | Art. 19, 34, 35i und 35q in jeder Fassung. Die tatsächlich zuständige Kasse bleibt zu qualifizieren, insbesondere die EAK bei Adoption |
| [GSOG](https://www.belex.sites.be.ch/api/de/texts_of_law/161.1) | Version 3144 ab 01.01.2026 und Version 3367 ab 01.05.2026 | Aktueller amtlicher XHTML-Text von Art. 54 gegen AP20B verglichen. Beide PDF-Originale frisch byteweise an den bereits abgenommenen Fassungsvergleich gebunden |
| [VRPG](https://www.belex.sites.be.ch/api/de/texts_of_law/155.21) | Version 2855 ab 01.08.2023 und Version 3424 ab 01.09.2026 | Aktueller amtlicher XHTML-Text von Art. 1, 32, 81 und 83 gegen AP20B verglichen. Beide PDF-Originale frisch byteweise an den bereits abgenommenen Fassungsvergleich gebunden |

Die Bundesoriginale wurden als Akoma-Ntoso-XML geparst. Der Artikelvergleich entfernt die redaktionellen Änderungsfussnoten, erhält jedoch den darauf folgenden Normtext. Die Berner historischen PDFs wurden in dieser Aktualisierung **nicht nochmals visuell oder durch einen neuen PDF-Textlauf gelesen**. Ihre Byteidentität bindet den unveränderten früheren Artikelvergleich, während die aktuellen XHTML-Artikel zusätzlich erneut maschinell ausgelesen und verglichen wurden.

Die direkten amtlichen Weboberflächen waren über das Web-Lesewerkzeug nicht erreichbar. Der erste lokale Netzversuch scheiterte an der eingeschränkten Namensauflösung. Erst der anschliessend freigegebene rein lesende HTTPS-Abruf der amtlichen XML-, API- und PDF-Endpunkte ist der positive Aktualitätsnachweis. Es wurden keine fremden Systeme verändert und keine Zugangsdaten verwendet.

## Inhaltsbindungen

| Amtliches Bundesoriginal | SHA-256, frisch identisch zu AP20B |
| --- | --- |
| ATSG 01.01.2024 | `9c3f463d0403101f7c567b37b2fdf53c9f8889bb8a26a9629ef077592829288c` |
| EOG 28.01.2025 | `4582a8e16ae3da9ee5bbe513b71492ea97438571fdb511d598383488ff32326c` |
| EOG 01.06.2026 | `061e1327d1117bb82640efba2a4b91f05b626160596416e9ee0f72a4a522aa18` |
| EOG 01.07.2027 | `e746588252680752134c1d6b9bb5a978d5c93a882518f3e7b670aceff00185f9` |
| EOV 01.01.2025 | `e90af55638fd1b0e4c349a646229ee9f2214805e046fc44d562df9c9d23746df` |
| EOV 01.06.2026 | `23a5298bdc465483b4b11494d0f737b57eea67a56baff27e08dc7ac24acc8a15` |
| EOV 01.07.2027 | `e21a9a63b6db32b18b4e90dddac94311ed820a34ab44ced01ac482d9ff46423f` |

Der [maschinelle Nachweis](../../outputs/ap20c1-2026-09-30/quellenkontrolle.json) bindet zusätzlich alle vier PDF- und zwei API-Prüfsummen, die konkreten amtlichen Adressen, Abrufzeitpunkte, Inhaltstypen, Bytezahlen, Normextrakte und den inhaltlichen Indexvergleich. Er trägt die Kennung `AP20C1-SOURCE-CONTROL-20260930` und die SHA-256-Prüfsumme:

`6209ff32d00910b36f97dfb5c35c147dc19ec908500b17c75736bd3960da990c`

Die [lesende Abrufroutine](../../outputs/ap20c1-2026-09-30/source-refresh.py) schreibt selbst keine Dateien. Die vorliegende JSON-Ausgabe ist ein eigener neuer Nachweis. Keine AP20B-Quelldatei und kein früheres Prüfprotokoll wurde überschrieben.

## Wiederverwendung, ausdrücklich ohne neuen Vollabruf

| Wiederverwendeter Befund | Grenze |
| --- | --- |
| BGer 8C_767/2008 E. 4.3.2 | Der in AP20B dokumentierte enge Vorbefund zur formellen Beschwerdeverbesserung bleibt massgebend. Keine neue vollständige Entscheidungslektüre oder aktuelle Rechtsprechungssuche. Daraus folgt keine Freigabe beliebiger gerichtlicher Fristen |
| FRG Bern und übrige unveränderte CH-/BE-Kalenderquellen | Wiederverwendung der [MVP-0.5-Quellenprüfung](../../data/source-reviews/events/2026-09-28-mvp-05-prerelease.1.json) vom 28. September 2026 für die unverändert übernommenen Kalender. Keine neue Feiertagsquelle oder territoriale Freigabe |
| AS 2026 433 und AS 2026 457 | Der AP20B-Originalbefund zu Änderungen, Übergangsrecht und Inkraftsetzung bleibt gebunden. Die vollständigen AS-Texte wurden nicht nochmals abgerufen. Neu geprüft wurden die vollständigen einschlägigen EOG-/EOV-Konsolidierungen sowie die amtlichen Änderungsmetadaten |

Diese Wiederverwendung wird nicht als frischer Originalabruf ausgegeben. Insbesondere ist die gesamte bestehende MVP-0.5-Quellenprüfung nicht Gegenstand von AP20C1.

## Konsequenz für die lokale Integration

Die Quellenkontrolle betrifft genau **vier nationale EOG-Regeln und sechs Berner Anbindungen**. Verwaltung, kantonale EOG-Gerichtsroute und nichtkantonale EOG-Gerichtsroute bleiben nach dem abgenommenen Vertrag getrennt. Die Berner Wohnsitzgrenze in Verwaltungsfällen ist eine Produktgrenze, nicht die behauptete gesetzliche EO-Verwaltungszuständigkeit Berns.

Auslöser, sämtliche Rechentage und Ergebnis sowie erforderliche Zuständigkeitsbezugsdaten müssen innerhalb des belegten Fensters liegen. Für ein Ergebnis 2028 entsteht durch einen Start 2027 keine automatische Deckung. Feiertagsanknüpfung bleibt eigenständig und auf die bereits geprüften Kombinationen begrenzt.

FamZG, FLG, MVG und ÜLG werden durch diese EOG-Kontrolle weder neu geprüft noch aktiviert. AP20C2 und AP20C3, eine erneute Quellenkontrolle vor einem Release, die menschliche Integrationsabnahme und eine spätere operative Freigabe bleiben gesonderte Schritte. Der Nachweis erzeugt insbesondere **kein neues freigegebenes Quellenprüfereignis** im Produktregister.
