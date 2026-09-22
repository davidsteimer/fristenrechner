# AP18B-03: Quellenpaket Wallis und Genf

**Abnahmenachtrag vom 13. September 2026:** David Steimer hat die gesamte Arbeitsmappe V0.9 in der vorliegenden Form [fachlich abgenommen](abnahme-ap18b-03.md). Der nachfolgende ursprüngliche Quellen- und Erfassungsstand bleibt als Nachweis erhalten. Die gespeicherten Auslieferungsstatus in Mappe und Modell werden nicht rückwirkend geändert. Konkrete Verfahrenszuordnungen und Produktaktivierung bleiben gesonderte Schritte.

Stand der Erfassung: 13. September 2026. Grundlage ist der bestätigte Arbeitsmappenvertrag 0.5.0 und das bestandene Strukturgate. Dieses Teilpaket enthält einen Erfassungsentwurf, keine neue Fachfreigabe und keine produktive Fristenberechnung.

## 1. Umfang und Datenstatus

Erfasst werden 22 Regeln in drei getrennten Geltungsbereichen. Sämtliche neuen Regeln sind `open`, haben keine Freigabebasis und keine Referenzfreigabe, tragen `blockedEffect` sowie ausdrücklich `fullDay`. Die Erfassungsuntergrenze `2026-01-01` behauptet weder ein Inkrafttreten der Normen an diesem Tag noch eine historische Vollerhebung. Die Jahre 2026–2028 dienen der Arbeitsmappenprüfung.

| Geltungsbereich | Regeln | Abgrenzung |
| --- | ---: | --- |
| `VS-PUBLIC-ALL` | 9 | Acht namentliche Reglementstage und die separat bundesrechtlich belegte Bundesfeier |
| `VS-LOJ-ADDITIONAL` | 4 | Ausschliesslich die vier Ergänzungen nach Art. 37 Abs. 1 Bst. c RPflG |
| `GE-OFFICIAL-ALL` | 9 | Art. 1 Abs. 1 LJF, ohne zusätzliche Folgetage nach Abs. 2 |

Die zwei Walliser Geltungsbereiche sind nicht zwei alternative vollständige Feiertagskalender. Die Prozessergänzung muss im zutreffenden gesetzlichen Kontext zur Grundliste hinzugelesen werden. Die spätere Verfahrenszuordnung darf dasselbe Datum nicht mehrfach als unterschiedlichen Kalendertag behandeln.

## 2. Amtliche Grundlagen und Fassungsstände

| Grundlage | Ebene und Stand | Verwendung |
| --- | --- | --- |
| [VS Ruhegesetz, SGS 822.2](https://lex.vs.ch/api/de/versions/2105/pdf_file) | Kantonales Gesetz, Stand 01.03.2013 | Art. 1 und 2, allgemeine Grundlage |
| [VS Ausführungsreglement, SGS 822.200](https://lex.vs.ch/api/fr/versions/2108/pdf_file) | Staatsrätliches Reglement, Stand 02.12.1966 | Art. 1, namentliche Feiertagsgrundliste |
| [VS VEkArG, SGS 822.100](https://lex.vs.ch/api/de/versions/2103/pdf_file) | Kantonale Verordnung, Stand 01.10.2016 | Art. 7 Abs. 1, gesonderte arbeitsrechtliche Einordnung |
| [VS RPflG / LOJ, SGS 173.1, Version 3260](https://lex.vs.ch/api/fr/versions/3260/pdf_file) | Kantonales Gesetz, Stand 01.01.2024, Änderung beschlossen 07.09.2023 | Art. 37 Abs. 1 Bst. a–c, Prozessbezug und vier Ergänzungen |
| [VS Gesetz über die Personalbezüge, SGS 172.4](https://lex.vs.ch/data/172.4/fr) | Personalbesoldungsrecht, Stand 01.05.2026 | Art. 1 und 29 ausschliesslich als Abgrenzungsbeleg |
| [GE LJF, RSG J 1 45](https://silgeneve.ch/legis/data/rsg_j1_45.htm) | Kantonales Gesetz, letzte Änderung 01.01.1991 | Art. 1 Abs. 1 und 2 sowie amtliche Fussnote a zum Bettag |
| [GE amtliche Feiertagsübersicht](https://www.ge.ch/vacances-scolaires-jours-feries/jours-feries-officiels) | Informationsseite, aktualisiert 29.04.2026 | Datumsgegenkontrolle der Jahreslisten 2026–2028, kein Normersatz |
| [BGer 7B_32/2023 vom 06.09.2023](https://search.bger.ch/ext/eurospider/live/it/php/aza/http/index.php?highlight_docid=aza%3A%2F%2F06-09-2023-7B_32-2023&lang=it&type=show_document&zoom=NO) | Rechtsprechung, Entscheiddatum 06.09.2023 | E. 4.3.2, 4.4 und 5.2, begrenzter Gegenbeleg zur Genfer Folgetagsautomatik |
| [swisstopo, Scambio di geodati tra le autorità](https://www.swisstopo.admin.ch/it/scambio-di-geodati-tra-le-autorita) | Amtliche Informationsseite, publiziert 08.01.2024 | Nur IT-Kantonsnamen Vallese und Ginevra |
| [Kanton Graubünden, Epocas en chartas geograficas](https://www.gr.ch/RM/chantun/175-Jahre/Seiten/Epochen-in-Karten.aspx) | Amtliche historische Darstellung, kein ausgewiesener Normstand | Nur RG-Kantonsnamen Vallais und Genevra |

Die Normfassungen und die Genfer Jahresübersicht wurden für diese Erfassung erneut live geprüft. Die Walliser Versionsanzeigen bestätigen 01.01.2024 für die LOJ, 01.10.2016 für die VEkArG, 02.12.1966 für das Reglement und 01.05.2026 für das Personalbesoldungsrecht. Die angezeigten Normstände, das Aktualisierungsdatum einer Informationsseite und das Abrufdatum werden nicht vermischt.

Der Bundesgerichtsentscheid war bereits im [Modellcheck](../architektur/modellcheck-ap18b-03.md) über Entscheidsuche und das amtliche Bundesgerichtsangebot abgeglichen worden. Der erneute Entscheidsuche-Aufruf im Erfassungsteil wurde toolseitig unter Bezugnahme auf den überholten Architekturreview-Scope gesperrt und nicht umgangen. Dieser Teilnachweis wird daher aus dem dokumentierten Vorcheck übernommen. Es wird kein erneuter erfolgreicher Volltextabruf behauptet. OpenCaseLaw wurde als möglicher Rechercheweg berücksichtigt, aber kein gesperrter Abruf darüber ersetzt.

## 3. Wallis

Die Grundliste enthält Neujahr, Josefstag, Auffahrt, Fronleichnam, Bundesfeier, Mariä Himmelfahrt, Allerheiligen, Mariä Empfängnis und Weihnachten. Acht davon stehen namentlich in Art. 1 des Ausführungsreglements. Dessen französische Formulierung `notamment` und der Bezug auf kirchlich bestimmte gebotene Tage werden nicht als abschliessende Erhebung sämtlicher diözesaner Feiertage umgedeutet. Die allgemeine Sonntagsruhe wird nicht als zusätzliche jährlich wiederkehrende Einzelregel angelegt. [Reglement Art. 1](https://lex.vs.ch/api/fr/versions/2108/pdf_file), [Ruhegesetz Art. 1](https://lex.vs.ch/api/de/versions/2105/pdf_file).

Die Bundesfeier verwendet die vorhandene [Bundesquelle, SR 116 Art. 1](https://www.fedlex.admin.ch/eli/cc/1994/1340_1340_1340/de). Die neue Anwendung auf den Walliser Erfassungsbereich bleibt offen. Die bestehende Freigabe des CH-Referenzeintrags wird nicht auf diese neue Regel übertragen. Art. 7 VEkArG nennt die acht kantonalen arbeitsrechtlichen Gleichstellungen, ist aber kein Ersatz für die gesonderte Prozessgrundlage. [VEkArG Art. 7](https://lex.vs.ch/api/de/versions/2103/pdf_file).

Der zweite Bereich enthält den 2. Januar, Ostermontag, Pfingstmontag und den 26. Dezember. Art. 37 Abs. 1 RPflG erfasst gesetzliche oder behördlich festgesetzte Fristen im dort umschriebenen Behördenkontext. Bst. a und b verweisen auf Bundesrecht und Ruhegesetz samt Reglement, Bst. c ergänzt diese vier Tage. Die Anwendbarkeit konkreter Prozessprofile, deren Ortsbezug und der Vorrang des Bundesrechts bleiben vor einer Automatik gesondert zu prüfen. [RPflG Art. 37](https://lex.vs.ch/api/fr/versions/3260/pdf_file).

Karfreitag wird weder aus einer Personalregel noch aus einer Verwaltungsschliessung in die Grundliste oder die Art.-37-Ergänzung übernommen. Art. 29 SGS 172.4 enthält zusätzliche freie Tage und Halbtage für den dort umschriebenen Personalkreis. Das ist kein selbständiger Nachweis einer allgemeinen prozessualen Feiertagswirkung. Damit ist nicht behauptet, Karfreitag könne in keinem anderen konkreten Rechtskontext Bedeutung haben. [SGS 172.4 Art. 1 und 29](https://lex.vs.ch/data/172.4/fr).

## 4. Genf

Die Liste umfasst Neujahr, Karfreitag, Ostermontag, Auffahrt, Pfingstmontag, Bundesfeier, Genfer Bettag, Weihnachten und den 31. Dezember als Jahrestag der Wiederherstellung der Republik. Der Genfer Bettag folgt dem neuen Typ `nthWeekdayOffsetDays` mit Monat 9, ISO-Wochentag 7, erstem Vorkommen und Tagesabstand 4. Der 31. Dezember bleibt ein eigenständiges Fixdatum. [LJF Art. 1 Abs. 1 und Fussnote a](https://silgeneve.ch/legis/data/rsg_j1_45.htm).

Art. 1 Abs. 2 LJF erklärt den Folgetag eines sonntäglichen Feiertags nur für Unternehmen ausserhalb des eidgenössischen Arbeitsgesetzes zum Feiertag. Dieser begrenzte sachliche Bezug wird als gesperrtes Mapping dokumentiert. Es werden keine generische Montagsverschiebung und keine zusätzlichen Ersatztermine erzeugt. Im konkreten Strafverfahren 7B_32/2023 bestätigte das Bundesgericht den Fristablauf am 2. Januar 2023, nicht am 3. Januar. Die kantonale Rechtsauslegung wurde dabei unter dem Willkürmassstab geprüft. Das Urteil ist keine Vollprüfung sämtlicher Prozessordnungen. [LJF Art. 1 Abs. 2](https://silgeneve.ch/legis/data/rsg_j1_45.htm), [BGer 7B_32/2023](https://search.bger.ch/ext/eurospider/live/it/php/aza/http/index.php?highlight_docid=aza%3A%2F%2F06-09-2023-7B_32-2023&lang=it&type=show_document&zoom=NO).

Die amtliche Jahresübersicht bestätigt für den Bettag den 10.09.2026, 09.09.2027 und 07.09.2028. Sie führt die Bundesfeier 2027 am Sonntag, 1. August, und die Wiederherstellung der Republik 2028 am Sonntag, 31. Dezember. Allgemeine Folgetagshinweise auf derselben Seite erweitern nicht den sachlichen Geltungsbereich der Norm. [Amtliche Jahresübersicht](https://www.ge.ch/vacances-scolaires-jours-feries/jours-feries-officiels).

## 5. Sprache, Gebiet und nächste Freigabegrenze

DE und FR sind normnahe beziehungsweise gebräuchliche Produktnamen. Vorhandene gemeinsame IT-/RM-Bezeichnungen werden aus dem bisherigen Bestand übernommen, für dieses Paket ausdrücklich nur provisorisch und ohne Behauptung einer amtlichen VS-/GE-Sprachfassung. Der 2. Januar ist in VS eine Datumsbezeichnung, der interne Schlüssel `BERCHTOLD` dient lediglich der Wiederverwendung vorhandener gemeinsamer Namen. Für neue kantonsspezifische Namen ohne gemeinsamen Bestand bleiben die IT-/RM-Felder leer. Sprachübernahme importiert weder fremdes Kantonsrecht noch dessen Freigaben.

Die Kantonsnamen `Vallese` und `Ginevra` sind bei [swisstopo](https://www.swisstopo.admin.ch/it/scambio-di-geodati-tra-le-autorita), `Vallais` und `Genevra` in der [amtlichen RG-Darstellung des Kantons Graubünden](https://www.gr.ch/RM/chantun/175-Jahre/Seiten/Epochen-in-Karten.aspx) belegt. Diese Belege gelten nur für die Namen. Die jeweiligen fachfremden Inhalte begründen keine Feiertags- oder Prozesswirkung. Der Export liefert die Namen zusätzlich unter `jurisdictionLabels`.

`GEO-VS` und `GEO-GE` sind interne Kantonsgebiete unter `GEO-CH`, keine behaupteten amtlichen Identifikatoren. Die beiden VS-Zuordnungen verwenden dieselben Gebietsmetadaten in allen vier Sprachen. In allen drei Geltungsbereichen stimmen Normquelle und Gebietsquelle überein, weshalb keine zusätzliche `areaSourceEvidence` erforderlich ist. Die Namenbelege sind keine abweichenden räumlichen Geltungsbelege.

Der synchrone Export [createVsGeAdditions(base)](../../scripts/ap18b-03-vs-ge.mjs) verändert die Basis nicht. Er liefert Regeln, Geltungsbereiche, Quellen, Verfahrensbezüge, Prüfeinträge, Gebietszuordnungen und Begleitmetadaten. Integration, unabhängige Modellprüfung, Berechnung, gespeicherte Excel-QA und spätere Fachabnahme sind getrennte Schritte. Es wird kein produktives Laufzeitformat erweitert und keine Fristwirkung freigegeben.

## 6. Isolierte technische Prüfung

Die Addition wurde am 13.09.2026 rein im Arbeitsspeicher mit der verifizierten 116-Regel-Basis kombiniert. `validateContract05` akzeptiert das Modell mit 138 Regeln. Die Basis blieb tiefengleich unverändert.

Geprüft wurden 66 konkrete Datumserwartungen für die 22 neuen Regeln in den Jahren 2026–2028, der Ausschluss aller 22 Regeln für 2025, die getrennten Walliser Kategorien, der fehlende VS-Karfreitag, die unverrückten Genfer Sonntagsdaten 2027/2028, die Bundesfeierquellen, das gesperrte Folgetagsmapping und die übereinstimmenden viersprachigen VS-Gebietsmetadaten. Eine zweite Anwendung auf den bereits ergänzten Bestand wird abgewiesen. Die Ergänzung umfasst zehn Quellen, zehn Prüfeinträge, acht Verfahrensbezüge und drei Gebietszuordnungen. Für diese isolierte Prüfung wurde keine Arbeitsmappe geschrieben. Sie ersetzt weder das spätere Excel-Readback noch die Fachabnahme.
