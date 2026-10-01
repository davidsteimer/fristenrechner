# AP20B Zeitliche Bindung der fünf neuen Sozialversicherungswege

Stand: 30. September 2026. **Fach- und Vertragsvorlage, noch keine Abnahme und keine Produktaktivierung.** Die [AP20A-Abnahme](abnahme-ap20a.md) bestätigt den Fachumfang und die wohnsitzbezogene Berner Produktgrenze für EOG- und MVG-Verwaltungsfälle. Diese Notiz konkretisiert die zeitlichen Fallbezüge und schliesst die in AP20A bezeichnete bernische Originalquellenlücke. Sie ergänzt den [AP20B-Vertragsnachtrag](../architektur/sozialversicherungsvertrag-ap20b.md). Die zusätzlich erforderlichen bundesrechtlichen Fassungsbindungen stehen im [Bundesquellenabgleich](quellenabgleich-ap20b-bund.md).

## Drei Bezüge bleiben getrennt

1. **Berechnung:** `legalTriggerDate` ist das qualifizierte rechtlich massgebende Eröffnungsdatum der Verfügung, des Einspracheentscheids oder der konkreten prozessualen Tagesanordnung. Es ist nicht automatisch das Ausfertigungsdatum. Ungeklärte Zustellungsfiktionen werden nicht erraten.
2. **Zuständigkeit und Produktgrenze:** Fallmerkmale sind auf den für die jeweilige Route bezeichneten Zeitpunkt beziehungsweise den konkreten Leistungsfall bezogen. Ein heutiger Wohnsitz oder Kassensitz darf einen früher massgebenden Befund nicht ersetzen. Bei den Gerichtsrouten bezeichnet `jurisdictionReferenceDate` den qualifizierten Zeitpunkt der Beschwerdeerhebung.
3. **Feiertage:** Die Anknüpfung nach Art. 38 Abs. 3 ATSG bleibt ein eigenständiger Fallbefund für Partei beziehungsweise Vertretung. Weder der verfügende Träger noch das zuständige Gericht noch die Berner Produktgrenze beweisen den Feiertagsraum. Die erste Übernahme bleibt auf die bereits freigegebenen Kalenderkombinationen beschränkt.

Diese Trennung verlangt keine zusätzliche Frage, wenn ein Merkmal durch die gewählte Handlung eindeutig feststeht. Tatsächlich offene Zuständigkeitsmerkmale dürfen aber weder aus persönlichen Standards noch aus einer rein technischen Voreinstellung übernommen werden.

## Konkrete Zeitanker und Fallmerkmale

Die folgenden Festlegungen sind der AP20B-Vorschlag zur Abnahme. Sie verändern keine bereits freigegebene Anbindung.

| Route | Qualifizierter Tatsachenbezug | Normprüfung und unzulässige Verkürzung |
| --- | --- | --- |
| EOG, Einsprache und angeordnete Verwaltungstagesfrist | `partyDomicileCanton: BE` am `legalTriggerDate` konkretisiert die abgenommene **Produktgrenze**. Zuständiger EO-Träger und individueller gesetzlicher Leistungsfall müssen unabhängig davon feststehen | Art. 17 EOG und die sachlich einschlägige Durchführung nach EOV bleiben Voraussetzungen. Eine zuständige kantonale Kasse ausserhalb Bern oder eine nichtkantonale Kasse ist nicht allein wegen ihres Sitzes ausgeschlossen. Keine Behauptung einer gesetzlichen Verwaltungszuständigkeit des Kantons Bern |
| EOG, Gericht nach kantonaler Kasse | `eogOfficeType: cantonal` und `compensationOfficeCanton: BE` bezeichnen die im angefochtenen Fall verfügende zuständige kantonale Ausgleichskasse. Für die Beschwerdeverbesserung bleibt damit die Herkunft des Verwaltungsentscheids gemeint, nicht der Absender der gerichtlichen Anordnung | Sonderzuständigkeit nach Art. 24 Abs. 1 EOG am `jurisdictionReferenceDate`, zusätzlich qualifiziertes Berner Gericht. Kein BE-Wohnsitzerfordernis als Ersatz dieser Sondernorm. Ein aktueller Kassenwechsel ändert die Herkunft des angefochtenen Entscheids nicht |
| EOG, Gericht nach nichtkantonaler Kasse | `eogOfficeType: nonCantonal`, ordentlicher Inlandsfall und separat geklärte Zuständigkeit nach Art. 58 ATSG. Im engen Erstumfang `partyDomicileCanton: BE` bei Beschwerdeerhebung und `courtCanton: BE` | `jurisdictionReferenceDate` bindet Art. 58 ATSG. Die Sondernorm für kantonale Kassen wird nicht auf eine Verbandskasse oder die Eidgenössische Ausgleichskasse übertragen. Verwaltung und Gericht können unterschiedliche Wohnsitzbefunde haben |
| FamZG, Verwaltung | `familyAllowanceOrderCanton: BE` bedeutet die im konkreten Leistungsfall tatsächlich anwendbare bernische Familienzulagenordnung. Die dafür zuständige Familienausgleichskasse muss qualifiziert sein | Qualifizierter Verwaltungsfall am `legalTriggerDate`, bei Einsprache bezogen auf die angefochtene Verfügung. Weder aktueller Wohnsitz noch Kassensitz oder Arbeitsort allein bestimmen die Ordnung. Der Rechner leitet die historisch einschlägige Ordnung nicht selbst aus Erwerbs- oder Wohnsitzverläufen ab |
| FamZG, Gericht | Dieselbe sachbezogene Qualifikation der tatsächlich anwendbaren bernischen Familienzulagenordnung. Die Gerichtszuständigkeit Bern wird gesondert bestätigt | Art. 22 FamZG am `jurisdictionReferenceDate`. Die für die streitige Leistung massgebende Ordnung wird nicht durch eine am Tag der Beschwerde allenfalls neu anwendbare Ordnung ersetzt. Keine allgemeine Wohnsitzroute nach Art. 58 ATSG statt der Sondernorm |
| FLG, Verwaltung | `compensationOfficeCanton: BE` bezeichnet die tatsächlich zuständige kantonale Kasse. Art. 10 FLV unterscheidet insbesondere landwirtschaftliche Arbeitnehmende und selbstständige Landwirte | Für Einsprache wird die Zuständigkeit im angefochtenen Verfügungsfall qualifiziert, für ADM die Zuständigkeit für die konkrete laufende Anordnung am `legalTriggerDate`. Keine pauschale BE-Wohnsitzbedingung für alle Berechtigtengruppen und keine Ableitung aus einer blossen Zahlstelle |
| FLG, Gericht | Die im angefochtenen Fall verfügende zuständige kantonale Kasse ist die AK Bern. Bei gerichtlicher Verbesserung bezeichnet dieses Merkmal weiterhin die zugrunde liegende Verwaltungsherkunft | Art. 22 Abs. 1 FLG am `jurisdictionReferenceDate`, zusätzlich qualifiziertes Berner Gericht. Eine heutige andere Kasse ersetzt den Ursprung des angefochtenen Entscheids nicht |
| MVG, Einsprache und angeordnete Verwaltungstagesfrist | `partyDomicileCanton: BE` am `legalTriggerDate`, fachlich zuständiger Militärversicherungsträger und individueller Versichertenfall | Wie bei EOG handelt es sich beim Wohnsitzfilter um die ausdrückliche **Produktgrenze**, nicht um eine kantonale MV-Verwaltungszuständigkeit. Kein Suva-Sitzfilter |
| MVG, Gericht | Ordentlicher Inlandsfall mit eigenständig qualifiziertem Berner Gericht und Wohnsitz der versicherten Person in Bern bei Beschwerdeerhebung | Art. 58 ATSG am `jurisdictionReferenceDate`. Der Bearbeitungsort des Verwaltungsfalls oder der frühere Verwaltungswohnsitz genügt nicht |
| ÜLG, Verwaltung | `uelgAdministrativeCanton: BE` und AK Bern als nach der Normenkette zuständige Durchführungsstelle. Der konkrete Zuständigkeitsbefund nach Art. 19 ÜLG muss feststehen | Art. 19 ÜLG, Art. 21 Abs. 2 ELG und Art. 8 EG ELG bilden die Durchführungskette. Für Einsprache bleibt der angefochtene Verwaltungsfall massgebend, für ADM die laufende Zuständigkeit der konkreten Anordnung. Ein heutiger Wohnsitz wird nicht ohne Prüfung zum Nachweis einer früheren Zuständigkeit |
| ÜLG, Gericht | Ordentlicher Inlandsfall mit eigenständig qualifiziertem Berner Gericht und Wohnsitz der versicherten Person in Bern bei Beschwerdeerhebung | Art. 58 ATSG am `jurisdictionReferenceDate`. Die frühere Verwaltungszuständigkeit nach Art. 19 ÜLG wird nicht als unveränderliche Gerichtszuständigkeit übernommen |

`courtCanton: BE` und `jurisdictionSpecialCase: ordinary` ersetzen keine Prüfung der bezeichneten Anknüpfung. Drittbeschwerden, Auslandsfälle, ungeklärte Zuständigkeitswechsel und andere nicht modellierte Sonderfälle bleiben ausserhalb. Beim Zeitpunkt einer erst bevorstehenden Beschwerde wird keine bereits erfolgte Einreichung behauptet. Der Benutzer qualifiziert den für seine Berechnung zugrunde gelegten Zeitpunkt. Eine spätere Änderung des entscheidenden Sachverhalts erfordert eine erneute Prüfung.

Bei CORRECTION sind ein bestehendes Verfahren vor dem zuständigen Gericht und die konkrete Anordnung zur formellen Beschwerdeverbesserung erforderlich. Die Beschwerdeerhebung liegt hier nicht nach der später eröffneten Verbesserungsanordnung. Das Zuständigkeitsdatum ist nie ein Ersatz für deren `legalTriggerDate`.

## Bernische Originalquellen und zeitliche Segmente

Die amtliche BELEX-API wurde am 30. September 2026 erneut abgerufen. Ihre XHTML-Artikel wurden direkt gelesen. Die Original-PDFs wurden zusätzlich gesichert, die für die Fassungsvergleiche relevanten Artikel direkt aus den PDFs gelesen. Der Nachweis unterscheidet ausdrücklich den ganzen Erlass vom verwendeten Artikel. Es wird nicht behauptet, ein gesamter älterer Erlass sei über spätere Änderungen hinweg unverändert geblieben.

| Quelle | Tatsächlich geprüfte Fassungen | Ergebnis für AP20B |
| --- | --- | --- |
| [GSOG, BSG 161.1][GSOG] | [Version 3144][GSOG-ALT], 01.01.2026–30.04.2026 und [Version 3367][GSOG-NEU], seit 01.05.2026. Art. 54 Abs. 1–5 direkt verglichen | Die verwendete Abteilungszuständigkeit ist unverändert. Deutschsprachige sozialversicherungsrechtliche Streitigkeiten und französischsprachige Geschäfte bleiben organisatorisch getrennt. Sprache beeinflusst weder Fristdauer noch Feiertagsanker |
| [VRPG, BSG 155.21][VRPG] | [Version 2855][VRPG-ALT], seit 01.08.2023 bis 31.08.2026 und [Version 3424][VRPG-NEU], seit 01.09.2026. Art. 1, 32, 81 und 83 direkt verglichen | Die relevanten Vorschriften sind unverändert. Art. 1 Abs. 2 wahrt vorrangiges Sozialversicherungsbundesrecht. Art. 81 liefert daher keine eigenständige Ersatzregel für die ATSG-Beschwerde. Art. 32 und 83 ergänzen Form und Instruktion, begründen keine Freigabe beliebiger gerichtlicher Fristen |
| [KFamZG, BSG 832.71][KFAMZG] | [Version 1993][KFAMZG-PDF], seit 01.11.2020. Art. 1, 2, 26 und 27 direkt gelesen | Art. 1 betrifft obligatorische Kinder- und Ausbildungszulagen. Art. 2 bezeichnet freiwillige Kassenleistungen. Art. 26 stellt das VRPG unter den Bundesvorbehalt, Art. 27 ordnet ergänzend ATSG- und AHV-Recht an. Daraus folgt kein pauschaler Ausschluss sämtlicher freiwilliger Leistungen vom ATSG |
| [EG ELG, BSG 841.31][EGELG] | [Version 3072][EGELG-PDF], seit 01.01.2025. Art. 8 und 9 direkt gelesen | Art. 8 weist den Vollzug der AK Bern zu. Art. 9 ergänzt Organisations- und Vollzugsrecht. Für ÜLG ist dies das kantonale Ende der bundesrechtlichen Durchführungskette, nicht die örtliche Gerichtszuständigkeit |
| [EG KUMV, BSG 842.11][EGKUMV] | [Version 2435][EGKUMV-ALT], 01.01.2022–31.08.2026 und [Version 3445][EGKUMV-NEU], seit 01.09.2026. Art. 39 und 40 direkt verglichen | Die unveränderte MV-Schiedsgerichtsroute betrifft Streitigkeiten mit Leistungserbringern. Sie gehört zur dokumentierten Bereichsgrenze, nicht zu einer positiven AP20-Anbindung für individuelle Versichertenleistungen |

Alle fünf amtlichen Erlassdatensätze meldeten am Prüfstichtag **keine künftige Version**. Damit lässt sich für den bernischen Anteil das beantragte Anwendungsfenster **01.01.2026–31.12.2027** auf die bezeichneten Fassungssegmente und den am Prüftag bekannten Rechtsstand stützen. Diese Zeitgrenze behauptet weder ein Inkrafttreten aller Normen am 01.01.2026 noch deren Ausserkrafttreten am 31.12.2027. Sie ist auch keine Gewähr gegen später publizierte Änderungen.

Die bernischen Versionsmetadaten weisen keine neue GSOG-Fassung für 2028 aus. Daraus folgt keine Fachfreigabe für 2028. Das künftige Bundesrecht muss unabhängig von den bernischen Metadaten geprüft werden. Insbesondere sind die für ÜLG verwendeten ELG-Verweise nur im tatsächlich abgeglichenen bundesrechtlichen Zeitraum tragfähig.

Die API-Antworten, acht Original-PDFs, Extrakte und SHA-256-Prüfsummen liegen im lokalen [bernischen Quellenprotokoll](../../outputs/ap20b-2026-09-30/bern-sources/bern-source-review.json). Die API-Prüfsumme bindet die Antwort des dokumentierten Abrufs, nicht eine zeitunabhängige Sollfassung des Onlinediensts. Bei der späteren Quellenprüfung können Metadaten und Zukunftshinweise rechtmässig verändert sein.

## Freiwillige Familienzulagen bleiben eine bewusste Produktgrenze

AP20A hat die obligatorischen bernischen Leistungen angenommen und freiwillige Kassenleistungen bis zur Einzelqualifikation von der operativen Übernahme ausgenommen. Die Originalprüfung bestätigt, dass diese Abgrenzung **nicht mit einer pauschalen Rechtsbehauptung «ATSG gilt nicht» begründet werden darf**. Art. 2 KFamZG enthält unterschiedliche freiwillige Leistungsarten, während Art. 26 und 27 eigene Verfahrens- und Ergänzungsregeln vorsehen.

AP20B übernimmt daher nur den bereits abgegrenzten positiven Gegenstand. Die freiwilligen Varianten nach Art. 2 KFamZG bleiben als nicht modellierter Leistungsumfang gesperrt. Eine spätere Freigabe erfordert die konkrete Leistungsgrundlage, die Bindung an Kassenrecht und den passenden Rechtsweg. Die nationale Bundesregel darf umgekehrt nicht so formuliert werden, dass gesetzlich erfasste höhere kantonale Ansätze oder kantonale Geburts- und Adoptionszulagen aus Art. 3 Abs. 2 FamZG generell ausgeschlossen würden. Nationale Regel und erste Berner Anbindung bleiben getrennt.

## Prüfgrenzen vor einer Integration

- Jede Normbindung benötigt die richtige Fassung am jeweils bezeichneten Zeitanker. Ein innerhalb des Quellenfensters liegendes `legalTriggerDate` heilt kein ausserhalb liegendes `jurisdictionReferenceDate`.
- Die gesamte benötigte Berechnung einschliesslich Stillstand und Endverschiebung muss vom freigegebenen Rechen- und Kalenderfenster erfasst sein. Ein Start vor dem Jahresende garantiert kein Ergebnis im noch belegten Jahr.
- Fehlende oder widersprüchliche Herkunft, Zulagenordnung, administrative Zuständigkeit, Gerichtszuständigkeit oder Feiertagsanknüpfung sperrt den passenden Pfad eigenständig.
- Ein bestehender Quellenbeleg und eine spätere technische Referenzfreigabe ersetzen weder die AP20B-Abnahme noch die Integrations- und Releasefreigabe.
- Vor der Datenpromotion ist der aktualisierte Quellenstand erneut zu prüfen. AP20B schreibt weder das operative Quellenregister noch eine Releasequellenabnahme fort.

Der Umfang bleibt bei 20 neuen nationalen Handlungspfaden und 22 vorgeschlagenen Berner Anbindungen. Die zwei EOG-Gerichtsrouten erklären den Unterschied. Es werden keine neuen Kantone, zusätzlichen Feiertagsräume oder positiven Schiedsgerichts-, Auslands- oder Drittbeschwerdewege aktiviert.

[GSOG]: https://www.belex.sites.be.ch/api/de/texts_of_law/161.1
[GSOG-ALT]: https://www.belex.sites.be.ch/api/de/versions/3144/pdf_file
[GSOG-NEU]: https://www.belex.sites.be.ch/api/de/versions/3367/pdf_file
[VRPG]: https://www.belex.sites.be.ch/api/de/texts_of_law/155.21
[VRPG-ALT]: https://www.belex.sites.be.ch/api/de/versions/2855/pdf_file
[VRPG-NEU]: https://www.belex.sites.be.ch/api/de/versions/3424/pdf_file
[KFAMZG]: https://www.belex.sites.be.ch/api/de/texts_of_law/832.71
[KFAMZG-PDF]: https://www.belex.sites.be.ch/api/de/versions/1993/pdf_file
[EGELG]: https://www.belex.sites.be.ch/api/de/texts_of_law/841.31
[EGELG-PDF]: https://www.belex.sites.be.ch/api/de/versions/3072/pdf_file
[EGKUMV]: https://www.belex.sites.be.ch/api/de/texts_of_law/842.11
[EGKUMV-ALT]: https://www.belex.sites.be.ch/api/de/versions/2435/pdf_file
[EGKUMV-NEU]: https://www.belex.sites.be.ch/api/de/versions/3445/pdf_file
