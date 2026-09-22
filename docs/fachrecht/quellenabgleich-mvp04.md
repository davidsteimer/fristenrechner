# MVP 0.4 · Quellenabgleich vor dem Release

| Merkmal | Stand |
| --- | --- |
| Prüfdatum | 22. September 2026 |
| Gegenstand | AP17 und AP18C, weiterhin nur operative Rechtsprofile Bund/Bern |
| Vergleich | Freigegebener MVP-0.3-Stand, AP17C-Quellenabgleich vom 12. September 2026 und abgenommene AP18-V0.12 |
| Durchführung | Codex als dokumentiertes KI-Arbeitsinstrument |
| Formelle Fachfreigabe dieses neuen Prüfstands | Am 22. September 2026 durch David Steimer [erteilt](abnahme-quellenpruefung-mvp04.md) |
| Ergebnis | **Vollständiger erneuter Abgleich von 120 eindeutigen Quellen-IDs abgenommen. 119 unverändert, ein bekannter AI-Quellenkonflikt mit unveränderter beschlossener Behandlung** |

## 1. Aussage und Grenze

Die Abnahme von AP18C erlaubt die Releasevorbereitung. Sie ist keine rückwirkende Bestätigung eines erst anschliessend durchgeführten Quellenrefreshs. Nach der [Release-Checkliste](../betrieb/release-checkliste.md) müssen die betroffenen amtlichen Quellen unmittelbar vor der Freigabe geprüft und nach dem [AP13-Verfahren](../betrieb/periodische-quellenpruefung-ap13.md) dokumentiert werden.

Der vorliegende Durchgang hat alle 38 Quellen-IDs des operativen AP18C-Manifests gezielt inhaltlich erneut geprüft. Er berücksichtigt dabei Mehrfachreferenzen derselben Erlassfassung, zehn Rechtsprechungsbelege und drei gesonderte Zukunftsvergleichsquellen. Die 38 IDs bezeichnen deshalb nicht 38 verschiedene geltende Erlasse. Bei den geprüften Fundstellen wurde keine für die modellierten Berechnungen relevante Abweichung von den abgenommenen Grundlagen festgestellt. Bei neun Rechtsprechungsbelegen beruht die neue Textprüfung auf dem ausdrücklich gekennzeichneten Entscheidsuche-Spiegel des Gerichtstexts. Eine pauschale Rechtsstands- oder Releasefreigabe wird daraus nicht abgeleitet.

Gemäss ergänzendem Auftrag wurden anschliessend auch alle 84 Quellen des Schweizer Feiertagskatalogs erneut inhaltlich abgeglichen. Zwei Quellen überschneiden sich mit dem operativen Manifest. Der vollständige Prüfumfang beträgt deshalb **38 + 84 − 2 = 120 eindeutige Quellen-IDs**. Davon sind 119 im abgegrenzten Modellumfang `unchanged` und eine ist wegen des bereits entschiedenen AI-Listenfehlers weiterhin `unclear`. Es gibt keinen Fall `unavailable` und keinen neu festgestellten Regeländerungsbedarf. Vollständige Prüfabdeckung bedeutet hier ausdrücklich nicht, dass sämtliche amtlichen Quellen widerspruchsfrei wären.

Der [maschinenlesbare Abruf- und Abdeckungsnachweis](../../outputs/release-mvp04-2026-09-22/source-check.json) hält Quelladressen, Fassungen, Dateigrössen, Prüfsummen, Vergleich und verbleibende Lücken fest. Das [neue AP13-Ereignis](../../data/source-reviews/events/2026-09-22-mvp-04-prerelease.1.json) ist nach der ausdrücklichen Abnahme durch David Steimer `approved`. Register und Governance-Index sind entsprechend aktualisiert. Die vorgelegten Berichte bleiben unverändert als historische Entscheidungsgrundlage erhalten. Der [gesonderte Abnahmenachweis](../../outputs/release-mvp04-2026-09-22/source-approval.json) bindet sie per SHA-256 und dokumentiert die Freigabe des gesamten 120er-Prüfumfangs.

## 2. Tatsächlich durchgeführte Prüfung

### Bundeserlasse

Die Fassungen wurden zunächst stichtagsbezogen über Swiss Caselaw lokalisiert. Das ist ein Recherche- und Metadatenzugang, kein Ersatz für eine amtliche Publikation. Die vollständigen Original-XML wurden anschliessend direkt aus dem Fedlex-Filestore abgerufen. Die unten bezeichneten Zielnormen wurden aus diesen Originaldateien gelesen. Ein erfolgreicher HTTP-Abruf allein wurde nicht als juristische Prüfung gewertet.

| Erlass und amtliche Fassung | Inhaltlich geprüfter Kern | Befund |
| --- | --- | --- |
| [ATSG, 01.01.2024](https://www.fedlex.admin.ch/eli/cc/2002/510/20240101/de) | Art. 2, 38–41, 52, 56, 58, 60 und 61 | Einzelgesetzliche Anwendbarkeit, Folgetag, Feiertagsanknüpfung, Stillstand und Rechtsmittelfristen entsprechen der AP17-Normenkette. Gerichtliche Nachfristen bleiben auf den qualifizierten Fall beschränkt |
| [IVG, 01.01.2026](https://www.fedlex.admin.ch/eli/cc/1959/827_857_845/20260101/de) | Art. 1, 57a Abs. 3 und 69 | 30 Tage für Einwände und gesonderter Rechtsweg bei kantonalen IV-Stellen unverändert |
| [AHVG, 01.01.2026](https://www.fedlex.admin.ch/eli/cc/63/837_843_843/20260101/de) | Art. 1 und 84 | ATSG-Verweisung und besondere Zuständigkeit unverändert, keine Erweiterung auf Altershilfebeiträge |
| [UVG, 01.01.2026](https://www.fedlex.admin.ch/eli/cc/1982/1676_1676_1676/20260101/de) | Art. 1 | Verweisung und ausdrücklich ausgeschlossene Materien unverändert |
| [IVV, 01.06.2025](https://www.fedlex.admin.ch/eli/cc/1961/29_29_29/20250601/de) | Art. 73bis und 73ter | Eröffnung und Eingabeform unverändert. Art. 73ter Abs. 1 weiterhin aufgehoben, keine Ableitung der aktuellen Einwandfrist aus dieser Bestimmung |
| [StPO, 01.04.2025](https://www.fedlex.admin.ch/eli/cc/2010/267/20250401/de) | Art. 85 und 89–91 | Zustellungsfiktion, Folgetag, Fristende, Feiertagsanknüpfung und Ausschluss von Gerichtsferien entsprechen dem bestehenden Profil |
| [ZPO, 01.07.2026](https://www.fedlex.admin.ch/eli/cc/2010/262/20260701/de) | Art. 138, 142, 143, 145 und 146 | Besondere Zustellungsregel gewöhnlicher Post, Stillstand und Ausnahmen entsprechen dem bestehenden Profil |
| [BGG, 01.04.2026](https://www.fedlex.admin.ch/eli/cc/2006/218/20260401/de) | Art. 44–46 und 100 | Stillstandsausnahmen sowie drei- und fünftägige politische Rechtsmittelfristen bleiben getrennt |
| [VwVG, 01.07.2022](https://www.fedlex.admin.ch/eli/cc/1969/737_757_755/20220701/de) | Art. 20, 21 und 22a | Bestehende Zählung und Stillstandslogik bestätigt. Keine Übernahme einer noch nicht aktivierten allgemeinen Wochenend-Zustellungsregel |
| [BPR, 23.10.2022](https://www.fedlex.admin.ch/eli/cc/1978/688_688_688/20221023/de) | Art. 77 und 80, mit bestehender Normspur | Dreitägige Beschwerdefrist und Weiterzug nach BGG unverändert |
| [VPR, 01.07.2022](https://www.fedlex.admin.ch/eli/cc/1978/712_712_712/20220701/de) | Art. 8a, 8d und 8e | Wahlvorschlags- und Eingangsvorgaben unverändert. Keine Umdeutung in allgemeine Tagesfristen |
| [Bundesfeiertagsverordnung, 01.07.1994](https://www.fedlex.admin.ch/eli/cc/1994/1340_1340_1340/19940701/de) | Art. 1 | Sonntagsgleichstellung als Grundlage der operativen Bundesfeiertagsregel bestätigt |

Die acht vollständigen AP17-Bundesdateien, einschliesslich der angekündigten Fassungen [IVG 2027](https://www.fedlex.admin.ch/eli/cc/1959/827_857_845/20270101/de), [AHVG 2027](https://www.fedlex.admin.ch/eli/cc/63/837_843_843/20270101/de) und [IVV 2027](https://www.fedlex.admin.ch/eli/cc/1961/29_29_29/20270701/de), sind **SHA-256-identisch zu den im [AP17C-Abgleich](quellenabgleich-ap17c.md) dokumentierten Originaldateien**. Damit ist auch die Identität der damals verglichenen Zielnormen belegt. Es wurden keine Zukunftsfassungen als bereits geltend ausgegeben. Das technische AP17-Abdeckungsfenster 2026–2027 bleibt unverändert. Die Identität einer bestimmten Fassung beweist nicht allein, dass inzwischen keine weitere Fassung publiziert wurde. Die stichtagsbezogene Bundes-Fassungslokalisierung stammt aus dem gesondert gekennzeichneten Recherchezugang.

### Bernische Erlasse

Die amtliche BELEX-API lieferte jeweils den aktuellen Versionsdatensatz und den vollständigen Original-XHTML-Text. Alle sieben Datensätze weisen am Prüftag leere `future_versions`-Listen aus. Diese Aussage bezieht sich auf das Register am Abrufdatum, nicht auf eine Garantie künftiger Unveränderlichkeit.

| Amtliche Quelle | Aktuelle Version | Geprüfter Inhalt |
| --- | --- | --- |
| [VRPG, BSG 155.21](https://www.belex.sites.be.ch/api/de/texts_of_law/155.21) | 3424, seit 01.09.2026 | Art. 41–44, 67a, 81 und 83. Zählung, Spezialvorbehalt, Zustellung und politische Fristen entsprechen dem vorhandenen Regelbestand |
| [FRG, BSG 555.1](https://www.belex.sites.be.ch/api/de/texts_of_law/555.1) | 2234, seit 01.04.2021 | Art. 2 bestätigt die zwölf CH-/BE-Projektionen. Eigenständige kommunale Festlegungen werden nicht aktiviert |
| [IVöB, BSG 731.2-1](https://www.belex.sites.be.ch/api/de/texts_of_law/731.2-1) | 3138, seit 01.02.2022 | Art. 51, 53, 55, 56 und 64. Zwanzig Tage, Ferienausschluss und Einleitungsdatum als Übergangsanker bestätigt |
| [IVöBG, BSG 731.2](https://www.belex.sites.be.ch/api/de/texts_of_law/731.2) | 2466, seit 01.02.2022 | Art. 3–6. Kantonale Anwendung mit Vorbehalten und mehrstufiger Instanzenzug unverändert |
| [IVöBV, BSG 731.21](https://www.belex.sites.be.ch/api/de/texts_of_law/731.21) | 3059, seit 01.09.2024 | Art. 15, 21a, 22a und 25. Übergangsrecht bestätigt, kein automatischer neuer Fristbeginn durch ein Debriefing |
| [PRG, BSG 141.1](https://www.belex.sites.be.ch/api/de/texts_of_law/141.1) | 3172, seit 01.06.2025 | Art. 16, 68, 69, 74, 75, 79, 98, 101, 110, 111, 117, 121, 130, 147 und 165. Kein Widerspruch zum abgenommenen politischen Regelbestand festgestellt |
| [PRV, BSG 141.112](https://www.belex.sites.be.ch/api/de/texts_of_law/141.112) | 3148, seit 01.06.2025 | Art. 66 enthält weiterhin die Originaleingangsregel bis 12 Uhr und die bereits dokumentierten Verweisungsauffälligkeiten auf Art. 69 und 111 PRG |

Der historische Quellenbezug `SRC-VRPG-BE-20230801` im allgemeinen Profil wird dadurch nicht nachträglich auf 2026 umgeschrieben. Das neue Prüfereignis dokumentiert die aktuelle Fassung und den unveränderten relevanten Inhalt gesondert. Die zusätzlichen AP17-IDs sind inzwischen im AP13-Register integriert. Die drei angekündigten Zukunftsfassungen sind als Monitoringquellen mit expliziter Komponenten- und Profilzuordnung abgegrenzt.

Zusätzlich wurden die drei historischen Abgrenzungs- und Materialienquellen erneut geprüft:

- [Alte IVöB, Version 391, Stand 01.07.2010](https://www.belex.sites.be.ch/api/de/versions/391/pdf_file), Art. 15 Abs. 2 und 2bis. Die historische Zehntagesfrist und der Ferienausschluss bleiben ein Abgrenzungsbeleg für das gesperrte alte Recht.
- [Vortrag zur PRG-Revision vom 04.04.2018](https://www.rrgr-service.apps.be.ch/api/rr/documents/document/b784c1f0933d4f629bc0fed1a4cd78ae-332/6/2016.STA.10699-vortrag-04.04.2018-de.pdf), PDF-Seite 18, Erläuterungen zu Art. 111 Abs. 1a und Art. 121. Die Donnerstagsfrist blieb beim Wechsel auf Ersatzkandidaturen inhaltlich unverändert. Damit bleibt die dokumentierte Absatz-Verweisungsauffälligkeit nachvollziehbar.
- [RRB Nr. 498/2024 vom 22.05.2024](https://www.rrgr-service.apps.be.ch/api/rr/documents/document/aee15674d95b4e61b5affa25eefd4d69-332/9/2024.STA.698-RRB-DF-286698.pdf), Ziff. 6.5.2, Seite 5. Der Originaleingang von Ersatzkandidaturen bis Donnerstag, 26.09.2024, 12 Uhr, ist auch auf der gerenderten Originalseite bestätigt. Dieser historische Anwendungsbeleg wird nicht zu einer neuen allgemeinen Rechtsnorm.

Alle drei Original-PDFs wurden erneut direkt heruntergeladen und mit SHA-256 im Abrufnachweis erfasst. Für die RRB-Seite war die PDF-Lesefunktion mit lokaler Originalkopie nötig, nachdem der Webreader den amtlichen Link nicht lesen konnte. Das ist eine Quellenleseprüfung, keine Bearbeitung oder Neuveröffentlichung des amtlichen Dokuments.

## 3. Rechtsprechung und Monitoring

Beide projektspezifischen Recherchezugänge wurden berücksichtigt. Eine nach Entscheidzeitraum 12.–22. September 2026 begrenzte Swiss-Caselaw-Suche nach Fristenstillstand, Art. 38 ATSG und Art. 56 IVöB lieferte keine Treffer. Eine Entscheidsuche-Abfrage mit denselben Kernthemen, dem Erfassungszeitraum 12.–22. September und den Hierarchien CH/BE lieferte acht Treffer. Vier betreffen Verwaltungspraxis 1996–2001, einer BGE 139 II 404 und drei Entscheide von 2026. Diese Filter liefern Hinweise, keinen Vollständigkeitsbeweis. Erfassungsdatum und Entscheidungsdatum wurden auseinandergehalten.

Der [amtliche Entscheid 5A_989/2025 vom 27. März 2026](https://search.bger.ch/ext/eurospider/live/de/php/aza/http/index.php?highlight_docid=aza%3A%2F%2F27-03-2026-5A_989-2025&lang=de&type=show_document&zoom=) wurde insbesondere in E. 3.7.5 und 3.8 gelesen. Er bestätigt die Abgrenzung zwischen gerichtlichen SchKG-Verfahren und Vollstreckungs- beziehungsweise Aufsichtsverfahren sowie den Ferienausschluss im Summarverfahren. Der nötige Hinweis nach Art. 145 Abs. 3 ZPO bleibt zu beachten. Daraus wird keine Erweiterung der Produktabdeckung abgeleitet.

Die beiden weiteren Indexfundstellen waren im Webreader zunächst nicht lesbar. Ihre amtlichen HTML-Volltexte konnten anschliessend direkt abgerufen und in E. 2 gelesen werden. [5A_773/2026 vom 31. August 2026](https://search.bger.ch/ext/eurospider/live/de/php/aza/http/index.php?highlight_docid=aza%3A%2F%2F31-08-2026-5A_773-2026&lang=de&type=show_document&zoom=) bestätigt den Sommerstillstand bei der dortigen zehntägigen BGG-Beschwerde gegen einen SchKG-Aufsichtsentscheid. [7B_1090/2026 vom 2. September 2026](https://search.bger.ch/ext/eurospider/live/de/php/aza/http/index.php?highlight_docid=aza%3A%2F%2F02-09-2026-7B_1090-2026&lang=de&type=show_document&zoom=) bestätigt mit Verweis auf BGE 133 I 270 E. 1.2 den Ausschluss des Stillstands in strafprozessualen Haftsachen. Das stützt die bestehenden Abgrenzungen, ersetzt aber nicht die nötige fallbezogene Auswahl der BGG-Ausnahme. Beide Abrufprüfsummen stehen im maschinenlesbaren Nachweis. Keine neue automatische Zuordnung wird daraus aktiviert.

Das [amtliche BJ-Dossier zur Wochenend-Zustellung](https://www.bj.admin.ch/de/zustellung-an-wochenenden-und-feiertagen-mit-a-post-plus) wurde geöffnet. Es führt weiterhin die Referendumsvorlage BBl 2025 2891 auf. Zusammen mit den tatsächlich gelesenen geltenden BGG-/VwVG-Artikeln ergibt sich kein Grund für eine automatische Änderung des Produktverhaltens. Die Dossierseite allein genügt jedoch nicht als vollständiger Nachweis aller Inkraftsetzungsakte. `OF-001` bleibt ein offener Monitoringpunkt.

### Zehn bestehende Rechtsprechungsbelege

Alle zehn zuvor offenen Einzelbelege sind fundstellenbezogen im Volltext abgeglichen. Die [detaillierte Rechtsprechungsprüfung](../../outputs/release-mvp04-2026-09-22/judgment-refresh.md) und der [zugehörige maschinenlesbare Nachweis](../../outputs/release-mvp04-2026-09-22/judgment-refresh.json) nennen je Quelle Urteil, Erwägung, tatsächlichen Abrufzugang, Befund und Grenzen. Es besteht kein ausstehender Volltextzugriff mehr. Die vorhandenen Abnahmen und Quellennachweise bleiben als Vergleichsbasis erhalten.

- `JUD-AP17C-BGER-8C-767-2008-20090112`
- `JUD-AP17C-VGER-BE-100-2024-8-20240404`
- `JUD-AP17C-VGER-BE-200-2017-814-20180117`
- `JUD-BE-VG-100-2016-347`
- `JUD-BE-VG-100-2017-270`
- `JUD-BE-VG-100-2021-189`
- `JUD-BE-VG-200-2026-421`
- `JUD-BGER-1C-275-2009`
- `JUD-BGER-8C-620-2007`
- `JUD-BGER-9C-757-2007`

BGer 8C_767/2008 wurde zusätzlich im amtlichen BGer-Volltext geprüft. Die übrigen neun Gerichtstexte wurden über den Entscheidsuche-Spiegel gelesen. Dieser Zugang wird nicht als amtliche Publikationsadresse umetikettiert. Besonders wichtig sind die unveränderten Grenzen der Aussagekraft: BGer 8C_620/2007 und 9C_757/2007 betreffen historisches ATSG-Übergangsrecht. Sie stützen heute die Einordnung von Art. 41 Abs. 3 VRPG als unechten Vorbehalt, nicht eine heutige Nichtanwendung des ATSG-Stillstands. BGer 8C_767/2008 trägt den qualifizierten Beschwerdeverbesserungsfall, lässt aber eine allgemeine Übertragung auf alle gerichtlichen Fristen gerade offen.

## 4. Schweizer Feiertagskatalog

Der neue Katalog enthält 84 Quellen und 90 historische Prüfnotizen mit Prüfständen vom 13. und 22. September 2026. Die Annahme, damit lägen automatisch 84 aktuell freigegebene AP13-Prüfpositionen vor, wäre falsch. Die Arbeitsstatus, provisorischen Übersetzungen und Vorbehalte bleiben im übernommenen Katalog erhalten.

Die Herkunftskette ist unverändert gebunden:

- V0.12-Arbeitsmappe: SHA-256 `d4fe89932b5d33f7f63516073668accf1a92b141a07388b559c3a6965c1aeb65`
- AP18C-Import: SHA-256 `9553f483678bc5f209099703588402a7dd65cf4d9aac8a00aadb6f9dbe966099`
- Laufzeitkatalog: SHA-256 `b53f9ed3dec29c8bb479b3840a801f3056531374cbb84611b377d7a01e93d1b7`

Die beiden für die operative CH-/BE-Projektion tragenden Feiertagsquellen wurden im operativen Durchgang erneut inhaltlich geprüft. Der von David Steimer zusätzlich verlangte vollständige Abgleich der übrigen 82 Quellen ist nun ebenfalls abgeschlossen. Eine blosse Archivübernahme ersetzt keine der Prüfarbeiten. Die historischen Erfassungsdaten und Prüfnotizen im Katalog bleiben unverändert, der neue Prüftag wird ausschliesslich in diesen gesonderten Nachweisen dokumentiert.

| Teilprüfung | Quellen | Befund | Nachweis |
| --- | ---: | --- | --- |
| Zentrale und südliche Gruppe mit CH-Unterstützungsbelegen | 26 | 26 `unchanged` | [Katalogprüfung central](../../outputs/release-mvp04-2026-09-22/catalog-refresh-central.json) |
| Westschweiz | 25 | 25 `unchanged` | [Katalogprüfung west](../../outputs/release-mvp04-2026-09-22/catalog-refresh-west.json) |
| Ostschweiz | 31 | 30 `unchanged`, ein bekannter AI-Konflikt `unclear` | [Katalogprüfung east](../../outputs/release-mvp04-2026-09-22/catalog-refresh-east.json) |
| CH-/BE-Grundlagen aus dem operativen Durchgang | 2 | 2 `unchanged` | [Operativer Quellenabgleich](../../outputs/release-mvp04-2026-09-22/source-check.json) |

Der [konsolidierte Vollständigkeitsnachweis](../../outputs/release-mvp04-2026-09-22/source-review-completeness.json) prüft die exakte, duplikatfreie Abdeckung, die Bindung der Teilberichte an den Kataloghash, die Einzelbelege des kanonischen operativen Ereignisses und die zulässigen inhaltlichen Prüfmethoden. HTTP-Erreichbarkeit allein genügt nicht. Die 17 Tests einschliesslich der Negativfälle und der gebundenen AI-Folgemassnahme bestehen. Die technische Konsolidierung erteilt weder eine fachliche Freigabe noch eine Publikations- oder Deploymentberechtigung.

### Zugangswege und bekannte Abweichung

Der VD-LEmp-Volltext wurde im ausdrücklich gekennzeichneten [LexFind-Spiegel des amtlichen PDF](https://www.lexfind.ch/tolv/107233/fr) gelesen, weil das kantonale Portal in diesem Zugang nur die JavaScript-Anwendung lieferte. Die relevante Liste wurde mit der aktuellen amtlichen DGEM-FAQ sowie den amtlichen Jahreslisten 2026–2028 gegengeprüft. Eine frisch direkt vom kantonalen Portal heruntergeladene PDF-Fassung wird nicht behauptet. Die weiteren technischen URL- und Parserprobleme konnten durch amtliche alternative Zugangswege gelöst werden. Dazu gehören der migrierte BK-Sprachbeleg, der BS-Erlass über die aktuelle Gesetzes-API sowie NE- und JU-Dokumente. Die Einzelheiten stehen in den drei Teilnachweisen.

**AI bleibt ein sichtbarer Quellenkonflikt.** Die amtliche Jahresliste führt den 26. Dezember 2026 weiterhin als Stephanstag auf. Das widerspricht der gesetzlichen Drei-Ruhetage-Bedingung und der zugehörigen amtlichen Erläuterung. `SRC-AI-RUHETAGE-LISTE-2026` behält deshalb das Ergebnis `unclear`, obwohl die Behandlung im Projekt bereits zugunsten der gesetzlichen Regel entschieden ist. Massgebend bleiben die [Abnahme AP18B-05, Ziffer 2](abnahme-ap18b-05.md#2-bestätigter-umfang-und-fortbestehende-grenzen) und die [gesonderte Folgemassnahmenbeurteilung](../../outputs/release-mvp04-2026-09-22/catalog-follow-up.json). Eine amtliche Berichtigung wird nicht behauptet. Der neue Abruf begründet weder eine Änderung der abgenommenen Regel noch eine neue formelle Freigabe.

Auch eine abgeschlossene Quellenprüfung aktiviert keine zusätzlichen kantonalen Fristenprofile. Vor der späteren Aktivierung weiterer Kantone ist deren verfahrensbezogener Zuordnungscheck weiterhin erforderlich. Für GR, SO, NE und eigenständiges kommunales Recht bleiben die bereits abgenommenen Begrenzungen bestehen.

## 5. Offene Releasegates und nächste Arbeit

| Gate | Erforderliche Erledigung |
| --- | --- |
| `MVP04-SOURCE-REFRESH-REMAINDER` | Abgeschlossen und abgenommen. Alle 38 Manifest-IDs und die drei begrenzt relevanten neuen Recherchetreffer abgeglichen |
| `MVP04-GOVERNANCE-REGISTER` | Technisch erledigt und freigegeben. 42 Quellen mit 34 produktiven, drei unterstützenden und fünf Monitoringrollen. Neues Ereignis `approved`, Index neu erzeugt. Initiales Ereignis bytegleich erhalten |
| `MVP04-CATALOG-REFRESH` | Technisch und inhaltlich abgeschlossen. Alle 84 Katalogquellen erneut geprüft, davon 82 zusätzliche IDs. Bekannter AI-Listenwiderspruch bleibt als `unclear` sichtbar, seine beschlossene gesetzliche Behandlung bleibt unverändert. Kein neuer Regeländerungsbedarf |
| `MVP04-FORMAL-SOURCE-APPROVAL` | Am 22. September 2026 durch David Steimer [erteilt](abnahme-quellenpruefung-mvp04.md). AI-Behandlung ausdrücklich unverändert bestätigt. Keine Publikations- oder Deploymentfreigabe |

Das initiale freigegebene AP13-Ereignis wird nicht überschrieben. Der nächste ordentliche Jahrestermin bleibt 15. November 2027. Der jetzige separate Anlass `preRelease` ersetzt keine fiktive erneute Jahresvollprüfung. Technische Releasevorbereitung kann parallel weitergeführt werden. Eine Veröffentlichung, Mirroraktualisierung oder produktive Aktivierung ist mit diesem Quellenbefund allein noch nicht freigegeben.
