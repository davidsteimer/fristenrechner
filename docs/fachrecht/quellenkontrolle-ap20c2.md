# AP20C2 Quellenkontrolle vor der Integration von FamZG und FLG

Prüfdatum: 1. Oktober 2026. **Begrenzter amtlicher Quellenabgleich vor der lokalen Integration. Keine neue Fachabnahme, Datenpromotion oder Betriebsfreigabe.** Die [AP20B-Abnahme](abnahme-ap20b.md), der [Bundesquellenabgleich](quellenabgleich-ap20b-bund.md), die [bernische Zeitbindung](zeitliche-bindung-ap20b.md) und der [Produktvertrag](../architektur/sozialversicherungsvertrag-ap20b.md) bleiben unverändert.

## Ergebnis

Die direkten amtlichen Abrufe wurden am **1. Oktober 2026 um 06:30 UTC** abgeschlossen. Im überprüften FamZG-/FLG-Umfang besteht **keine Abweichung gegenüber den abgenommenen AP20B-Grundlagen**:

- Fünf Bundesoriginale sind byteidentisch mit AP20B. Zusätzlich stimmen die neu ausgelesenen tragenden Artikeltexte überein.
- Die auf ATSG, FamZG, FLG und FLV begrenzten Fassungs- und Änderungsabfragen enthalten dieselben fünf Fassungen und drei Änderungsauswirkungen wie die entsprechende AP20B-Projektion. Verglichen wurden die vollständigen Zeileninhalte, nicht nur die Anzahl.
- Die drei BELEX-Erlassantworten zu GSOG, VRPG und KFamZG und die fünf gebundenen Original-PDFs sind byteidentisch. Die ausgewählten Normtexte, aktuellen Versionen und weiterhin leeren Listen künftiger Versionen sind unverändert.
- Die ergänzend erstmals als eigene Vollwerke abgefragten FamZV-Konsolidierungen bestätigen den bereits in AP20B über den Änderungsakt geprüften Befund. Die einzige Artikeländerung am 1. Juli 2027 betrifft Art. 10 zur materiellen Leistungsdauer.

Die Kontrolle liefert keinen Anlass, die acht neuen nationalen FamZG-/FLG-Modelle, ihre acht Berner Anbindungen oder das geprüfte Anwendungsfenster **01.01.2026–31.12.2027** zu ändern. Sie ist weder eine Garantie gegen spätere Publikationen noch eine Freigabe für 2028.

## Erneut abgerufene AP20B Originale

| Quelle | Frisch abgerufene Fassungen | Artikelbezogene Prüfung |
| --- | --- | --- |
| [ATSG](https://www.fedlex.admin.ch/eli/cc/2002/510/20240101/de) | 01.01.2024 | Art. 2, 38–41, 49, 51, 52, 55, 56, 58, 60 und 61 |
| [FamZG](https://www.fedlex.admin.ch/eli/cc/2008/51/20260101/de) | 01.01.2026 | Art. 1, 3 und 22. Tatsächlich anwendbare Familienzulagenordnung als eigenständiges Fallmerkmal, nicht Wohnsitz oder Kassensitz als Ersatz |
| [FLG 2024](https://www.fedlex.admin.ch/eli/cc/1952/823_843_839/20240101/de), [FLG 2027](https://www.fedlex.admin.ch/eli/cc/1952/823_843_839/20270701/de) | 01.01.2024 und 01.07.2027 | Art. 1, 13, 22 und 25 in beiden Fassungen. Zusätzlicher frischer Vergleich dieser Normtexte untereinander |
| [FLV](https://www.fedlex.admin.ch/eli/cc/1952/896_916_912/20140423/de) | 23.04.2014 | Art. 10. Kantonale Kasse des Arbeitgebers für landwirtschaftliche Arbeitnehmende, Wohnsitzkanton für selbstständige Landwirte |
| [GSOG](https://www.belex.sites.be.ch/api/de/texts_of_law/161.1) | Version 3144 ab 01.01.2026 und 3367 ab 01.05.2026 | Aktueller XHTML-Text von Art. 54 und Byteidentität beider PDF-Originale zu AP20B |
| [VRPG](https://www.belex.sites.be.ch/api/de/texts_of_law/155.21) | Version 2855 ab 01.08.2023 und 3424 ab 01.09.2026 | Aktuelle XHTML-Texte von Art. 1, 32, 81 und 83 und Byteidentität beider PDF-Originale zu AP20B |
| [KFamZG](https://www.belex.sites.be.ch/api/de/texts_of_law/832.71) | Version 1993 ab 01.11.2020 | Aktuelle XHTML-Texte von Art. 1, 2, 26 und 27 und Byteidentität des PDF-Originals zu AP20B |

Die Bundesoriginale wurden als Akoma-Ntoso-XML geparst. Beim Artikelvergleich werden redaktionelle Änderungsfussnoten entfernt, der anschliessende Normtext bleibt erhalten. Die historischen Berner PDFs wurden in dieser Kontrolle **nicht nochmals visuell oder durch einen neuen PDF-Textlauf gelesen**. Ihre Byteidentität bindet den unveränderten früheren Fassungsvergleich. Die aktuellen XHTML-Artikel wurden zusätzlich erneut ausgelesen und verglichen.

## Kontinuität am 1. Juli 2027

**FLG:** Die tragenden Art. 1, 13, 22 und 25 sind in den frisch abgerufenen Fassungen 2024 und 2027 normtextidentisch. Der AP20B-Vergleich des geänderten Art. 10 Abs. 4 wird über die frisch nachgewiesene Byteidentität beider vollständigen Originaldateien wiederverwendet. Er betrifft die materielle Fortdauer von Familienzulagen und begründet keine abweichende Einsprache- oder Beschwerdefrist. Die Normbindung wird deshalb nicht bloss wegen des neuen Konsolidierungsdatums abgeschnitten.

**FamZV:** AP20B hatte diese Verordnung nicht als eigenes Vollwerk abgefragt, sondern die Änderung von Art. 10 Abs. 2 im Anhang von AS 2026 457 gelesen. Für AP20C2 wurden die [Fassung 01.01.2025](https://www.fedlex.admin.ch/eli/cc/2008/52/20250101/de), die [Fassung 01.07.2027](https://www.fedlex.admin.ch/eli/cc/2008/52/20270701/de) und der eigene Änderungsindex erstmals gesondert abgerufen. Der Vergleich aller Artikel ergibt ausschliesslich die bereits bekannte Änderung von Art. 10. Der Index nennt dafür eine Auswirkung aus AS 2026 457 am 01.07.2027.

Dies ist **kein behaupteter Bytevergleich mit einem nicht vorhandenen eigenständigen AP20B-FamZV-Export**. Es ist eine ergänzende Originalkontrolle. Art. 11 bestätigt die notwendige Kassenqualifikation bei mehreren Erwerbstätigkeiten, führt aber zu keinem neuen automatischen Zuständigkeitsalgorithmus. Art. 19 betrifft Behördenbeschwerden an Bundesgerichte und keinen neuen AP20-Parteipfad. Registermeldungen, Behördenfristen und Leistungsdauer werden nicht als Tagesrechtsmittelfristen integriert.

## Unveränderte fachliche Grenzen

FamZG verlangt die tatsächlich anwendbare Familienzulagenordnung des streitigen Leistungsfalls. Für die Berner Anbindung bleibt der qualifizierte obligatorische Leistungsumfang massgebend. Freiwillige Kassenleistungen nach Art. 2 KFamZG bleiben unmodelliert. Das ist eine Produktgrenze, keine pauschale Behauptung, das ATSG sei auf solche Leistungen unanwendbar. Gesetzlich erfasste höhere Ansätze sowie Geburts- und Adoptionszulagen werden im nationalen Modell nicht generell aus dem FamZG ausgeschlossen.

FLG verlangt die qualifizierte zuständige kantonale Kasse. Für die gerichtliche Route zählt die Herkunft des angefochtenen Verwaltungsfalls, nicht ein späterer Kassenwechsel oder eine blosse Zahlstelle. **Weder FamZG noch FLG erhält einen zusätzlichen pauschalen BE-Wohnsitzfilter.** Gerichtszuständigkeit und Feiertagsanknüpfung bleiben getrennt.

Auslöser, notwendige Zuständigkeitsbezugsdaten, sämtliche Rechentage und Ergebnis müssen innerhalb des belegten Fensters liegen. Auslands- und Drittbeschwerden, ungeklärte Zuständigkeit sowie nicht modellierte Zusatzleistungen bleiben ausgeschlossen. Die zusätzliche FamZV-Kontrolle erweitert den abgenommenen Vertragsumfang nicht.

## Wiederverwendung ohne neuen Vollabruf

| Wiederverwendeter Befund | Grenze |
| --- | --- |
| BGer 8C_767/2008 E. 4.3.2 | Enger AP20B-Vorbefund zur formellen Beschwerdeverbesserung. Keine neue vollständige Entscheidungslektüre oder aktuelle Rechtsprechungssuche |
| FRG Bern und unveränderte CH-/BE-Kalenderquellen | [MVP-0.5-Quellenprüfung](../../data/source-reviews/events/2026-09-28-mvp-05-prerelease.1.json) vom 28. September 2026. Keine zusätzlichen Feiertagsräume |
| AS 2026 433 und AS 2026 457 | AP20B-Originalbefund zu Änderung, Übergangsrecht und Inkraftsetzung. Frisch sind die FLG-/FamZV-Konsolidierungen und zugehörigen Indexabfragen, nicht die AS-Volltexte |
| Bereits integrierte EOG- und bisherige Sozialverfahren | Unveränderter Bestand. [AP20C1-Quellenkontrolle](quellenkontrolle-ap20c1.md) und [AP20C1-Abnahme](abnahme-ap20c1.md) bleiben erhalten. Keine erneute vollständige EOG-, MVG- oder ÜLG-Prüfung in AP20C2 |

## Technischer Nachweis

Der [maschinelle Nachweis](../../outputs/ap20c2-2026-10-01/quellenkontrolle.json) trägt die Kennung `AP20C2-SOURCE-CONTROL-20261001`. Er enthält die amtlichen Abrufadressen, UTC-Zeitstempel, Inhaltstypen, Bytezahlen und Prüfsummen, die gelesenen Normtexte, vollständige Indexzeilen und die Bindungen an die unveränderten Grundlagen. Seine SHA-256-Prüfsumme lautet:

`6ef1e65e4a2e5a7fa0a87c2042d5fc17a9f736c3f09fe9035620dbf0ce84d4c5`

Die [lesende Abrufroutine](../../outputs/ap20c2-2026-10-01/source-refresh.py) schreibt selbst keine Dateien. Die gespeicherte JSON-Ausgabe ist ein neuer, getrennter Nachweis. Die amtlichen Oberflächen waren über das Web-Lesewerkzeug nicht erreichbar. Der erste direkte Netzversuch scheiterte an der eingeschränkten Namensauflösung. Erst der anschliessend freigegebene lesende HTTPS-Abruf der amtlichen XML-, API- und PDF-Endpunkte bildet den erfolgreichen Aktualitätsnachweis. Es wurden keine Zugangsdaten verwendet oder fremde Systeme verändert.

Keine AP20B- oder AP20C1-Quelldatei wurde überschrieben. Die Kontrolle erzeugt **kein neues freigegebenes Quellenprüfereignis** im Produktregister. Integrationsabnahme, Releasequellenprüfung, Datenpromotion und operative Freigabe bleiben eigenständige Schritte.
