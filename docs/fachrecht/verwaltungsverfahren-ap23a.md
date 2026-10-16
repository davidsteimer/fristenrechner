# AP23A – Kantonale Verwaltungsverfahren: Bestandsaufnahme und Abgrenzung

| Merkmal | Stand |
| --- | --- |
| Auftrag | [GitHub #48](https://github.com/davidsteimer/fristenrechner/issues/48), Start durch David Steimer am 12. Oktober 2026 |
| Dokument | V0.1, 12. Oktober 2026 |
| Status | Strukturelle Prüfvorlage, noch nicht fachlich abgenommen |
| Umfang | 25 übrige Kantone, Bern als Referenzbestand |
| Verantwortung | David Steimer entscheidet und nimmt ab. Codex ist das dokumentierte KI-Arbeitsinstrument ohne formelle Freigabeverantwortung. |
| Wirkung | Keine neue Produktfreigabe, keine Änderung von Rechenlogik, Rechtsdaten, E/Q/P oder historischen Nachweisen |

## 1. Ergebnis und Zweck

AP23A schafft eine vergleichbare Grundlage für die schrittweise Erweiterung um allgemeine kantonale Verwaltungsverfahren. Es ist **keine vollständige Rechtsprüfung sämtlicher Verfahrenswege**. Die Erhebung benennt die tragenden Erlasse, deren geprüfte Fassungen, die unterschiedlichen Verfahrensstufen und die Fragen, die vor der Modellierung zu klären sind.

Die [Arbeitsmappe V0.1](../../outputs/ap23a-2026-10-12/2026-10-12_Verwaltungsverfahren_Schweiz_AP23A_V0.1.xlsx) enthält vier filterbare Tabellen:

| Blatt | Inhalt | Prüfung durch David |
| --- | --- | --- |
| Kantonsübersicht | 26 Kantone mit Erlassstruktur, Verwaltung und gerichtlichem Verfahren | Strukturentscheid und Bemerkung |
| Fristenregeln | Acht Prüfdimensionen je Kanton, insgesamt 208 Befundzeilen | Bemerkung unmittelbar beim Befund |
| Vertiefung | Offene Fragen, Modellfolgen und vorläufige Arbeitsgruppen | Priorisierung der weiteren Prüfung |
| Quellen | 37 Hauptquelleneinträge mit Fassungsnachweisen, Abrufdatum und tatsächlicher Prüftiefe | Nachprüfung über anklickbare Originalquellen |

Die 208 Zeilen sind **Prüfdimensionen, nicht 208 bereits freigegebene Rechenregeln**. Die gelben Felder dienen der menschlichen Prüfung. Ein Eintrag in Excel aktiviert keine Produktfunktion und ersetzt weder einen Fachentscheid noch dessen dokumentierte Übernahme.

17 Kantone sind im strukturellen Belegstand als «strukturell belegt» und neun als «teilweise belegt» gekennzeichnet. Auch «strukturell belegt» bedeutet weder vollständige Fallprüfung noch Umsetzungsreife. Die konkreten offenen Punkte im Blatt «Vertiefung» sind für den nächsten Schritt massgebend.

## 2. Umfang und Grenzen

Erfasst werden Fristbeginn, Endverschiebung, Feiertagsanknüpfung, Fristenstillstand, gesetzliche gegenüber behördlichen Fristen, Fristwahrung, ordentliche Rechtsmittelfrist und wesentliche Ausnahmen. Verwaltungsverfahren und Verwaltungsgerichtsbarkeit werden getrennt betrachtet, auch wenn sie auf demselben Erlass beruhen.

Für eine erste Umsetzung bleiben Tagesfristen der Ausgangspunkt. Andere Fristeinheiten, zusätzliche Zustellfiktionen, Wiederherstellung und behördliche Erstreckungsentscheide werden nicht stillschweigend als neue Rechnerfunktionen aufgenommen. Die ordentlichen Rechtsmittelfristen werden erhoben, damit das Modell nicht versehentlich einen mehrstufigen Rechtsmittelweg als eine einzige Tagesfrist behandelt. Das ist noch kein Auftrag zur automatischen Auswahl aller Rechtsmittelfristen.

Es gelten weiterhin diese Grenzen:

- Nur Bundesrecht und kantonales Recht. Eigenständige kommunale Erlasse bleiben ausgeschlossen. Örtliche Unterschiede aus übergeordnetem Recht müssen trotzdem berücksichtigt werden.
- Die Aufnahme des allgemeinen Verwaltungsverfahrens gibt kantonale Spezialerlasse nicht pauschal frei.
- Nationale Sozialregeln werden wiederverwendet, nicht pro Kanton kopiert. Zusätzliche kantonale Anbindungen bleiben mit #35 koordiniert und gesondert freizugeben.
- Die bestehende begrenzte GR-Abdeckung und die übrigen Vorbehalte aus AP22 gelten weiter. Eine dort akzeptierte Grenze wird nicht ungeprüft auf ein neues kantonales Verwaltungsprofil übertragen.
- DE und FR bleiben die Produktsprachen. Originaltitel werden in der Erhebung mitgeführt. IT/RG gemäss #49 sind ein eigenes Vorhaben.
- #50 bleibt das begrenzte Prüf- und gegebenenfalls Korrekturitem zur Höhe der Datumseingabe. #51 sowie Kalender-App und Karte bleiben ausserhalb dieses Fachpakets.

## 3. Quellen- und Fassungsmethode

Massgebend sind amtliche Gesetzessammlungen und amtliche Erläuterungen. Soweit verfügbar, wurden die aktuelle Fassung und ihr Inkrafttreten zusätzlich in den Metadaten der amtlichen Sammlung geprüft. Ein frisches Suchmaschinen-Abrufdatum belegt keine aktuelle Gesetzesfassung.

Die Matrix trennt:

1. **Erlassfassung:** Welcher Textstand wurde tatsächlich geprüft?
2. **Abrufdatum:** Wann wurde die Quelle am 12. Oktober 2026 gelesen?
3. **Prüftiefe:** Amtlicher Volltext, Teilbeleg oder blosse Fundstelle.
4. **Fachbefund:** Was ergibt sich für die Struktur der späteren Modellierung?
5. **Offene Frage:** Was muss vor einer positiven Fallfreigabe noch geklärt werden?

Ein aktueller Metadatensatz allein macht einen alten Volltext nicht aktuell. Solche Kombinationen sind als Teilbeleg gekennzeichnet. Künftig in Kraft tretende Texte sind kein Nachweis des geltenden Rechts am Erhebungstag. Negative Aussagen wie «kein allgemeiner Stillstand» dürfen nicht auf das Fehlen eines Suchtreffers gestützt werden.

Swiss Caselaw wurde ergänzend für den Berner Gesetzeslookup berücksichtigt. Entscheidsuche wurde als Zugang für spätere Auslegungsfragen geprüft. In dieser Strukturaufnahme wird kein blosser Rechtsprechungs-Suchtreffer als tragender Entscheid verwendet. Eine erforderliche fallbezogene Rechtsprechungsprüfung gehört in AP23B.

### 3.1 Befunde mit Einfluss auf das künftige Modell

| Befund | Konsequenz für die Modellierung |
| --- | --- |
| **TI:** Allgemeiner Stillstand, aber der Kostenvorschuss ist ausdrücklich ausgenommen. [LPAmm Art. 16 und 47 Abs. 3](https://m3.ti.ch/CAN/RLeggi/public/index.php/raccolta-leggi/pdfatto/atto/151) | Verfahrenshandlung und Fristart sind neben der Stufe relevant. |
| **GR:** Der Stillstand nach Art. 39 betrifft das gerichtliche Verfahren. [VRG, Fassung 01.01.2025](https://www.gr-lex.gr.ch/api/de/versions/3521/pdf_file) | Verwaltung und gerichtliches Verfahren getrennt binden. Die begrenzte kantonale Gebietsfreigabe bleibt sichtbar. |
| **NW:** Einwendung nur mit Weihnachtsstillstand, Einsprache und Rechtsmittel zusätzlich mit Oster- und Sommerstillstand. [VRG Art. 33a](https://gesetze.nw.ch/api/de/versions/1519/pdf_file) | Nicht bloss «Ferien ja/nein», sondern explizite Stillstandsintervalle je Verfahrenshandlung. |
| **GL:** Im aktuellen Art. 90 sind nur gesetzliche Fristen erfasst, anders als in älteren Fassungen. [VRG, Fassung 01.01.2023](https://gesetze.gl.ch/api/de/versions/2395/pdf_file) | Gesetzliche und behördliche Fristen dürfen nicht global gleichgesetzt werden. |
| **FR:** Sommerstillstand zusätzlich nur in Angelegenheiten des Kantonsgerichts. [CPJA Art. 30](https://bdlf.fr.ch/api/fr/versions/8637/pdf_file) | Gleiche Ferienzeiträume bedeuten nicht gleichen sachlichen Anwendungsbereich. |
| **TG:** Bestimmte Ausnahmen vom Stillstand greifen bei fehlendem gesetzlichen Hinweis in der Rechtsmittelbelehrung nicht. [VRG § 63 Abs. 4](https://www.rechtsbuch.tg.ch/api/de/versions/2774/pdf_file) | Belehrungsbefund oder klarer manueller Prüfpfad erforderlich. Noch kein zusätzlicher UI-Auftrag. |
| **BS:** Anmeldung innert zehn und Begründung innert 30 Tagen ab demselben Ereignis. [OG § 46](https://www.gesetzessammlung.bs.ch/api/de/versions/5112/pdf_file) und [VRPG § 16](https://www.gesetzessammlung.bs.ch/api/de/versions/5116/pdf_file) | Zwei getrennte Handlungen. Ein einziges unqualifiziertes Enddatum wäre unzureichend. |
| **NE:** Neue LPA seit 01.01.2026. Mindestens halbtägige Verwaltungsschliessungen sind nach Art. 33 Abs. 3 relevant. [LPA Art. 31, 33 und 37](https://rsn.ne.ch/DATA/program/books/rsne/htm/152.130.htm) | Neuer zeitlicher Rechtsstand, Eröffnungsregeln und jahresweise Schliesstage getrennt behandeln. Vorhandener Feiertagsalgorithmus genügt nicht allein. |

Weitere in der Matrix erfasste Unterschiede sind etwa ZPO-Verweisungsketten, ein abweichendes Weihnachtsende im VS, ganztägige Verwaltungsschliessungen in BL sowie besondere Zustellregeln in AI und GE. Daraus folgt kein Auftrag, sämtliche Spezialfälle sofort zu implementieren. Ein bewusst gesperrter beziehungsweise klar abgegrenzter Weg ist einer nicht belegten Automatik vorzuziehen.

### 3.2 Sichtbare Erhebungslücken

Besonders vorgelagert zu klären sind:

- **VD:** Der aktuelle konsolidierte amtliche Volltext war nicht zugänglich. Historischer Erlasstext und aktuelle Teilbelege sind keine Bestätigung der geltenden Gesamtnorm.
- **SZ:** Die amtlich verlinkten VRP-/JG-PDFs tragen bereits den Sammelstand 01.02.2027. Die am Erhebungstag geltende Fassung ist nicht eindeutig bestätigt. Der Inhalt wird nur unter diesem Vorbehalt geführt.
- **VS:** Die aktuelle ergänzende Grundlage für die Samstagsbehandlung ist noch nachzuweisen.
- **OW:** Die geprüfte StVG-Fassung endet laut amtlichen Metadaten am 31.12.2026. Die Folgefassung ist vor einer darüber hinausreichenden Freigabe zu prüfen.

Daneben bleiben je Kanton konkrete Fragen zur Feiertagsrollenbindung, zur Reichweite von Verweisungen, zu negativen Stillstandsbefunden und zu Spezialrechtsgrenzen. Die 37 Hauptquelleneinträge sind daher kein abgeschlossenes Quellenregister sämtlicher ergänzender Erlasse. Einige ergänzende amtliche Belege stehen bereits unmittelbar in den Befunden oder Quellennotizen. Vor Umsetzung werden alle tragenden Ergänzungsquellen mit eigenständiger ID und genauer Fundstelle in das operative Quellenpaket übernommen.

## 4. Technischer Ausgangspunkt

Der bestehende Kalenderbestand ist eine wesentliche Grundlage, aber noch keine Freigabe seiner Anwendung in einem kantonalen Verwaltungsverfahren. Wiederverwendbar sind insbesondere ISO-Tagesarithmetik, Kalendergenerator, Quellenpflege, gemeinsame Hostoberfläche und gefilterte Erlassauswahl.

Die Grenzen der aktuellen Verträge wurden im tatsächlichen Quellstand geprüft:

- [Manifestformat 7](../../schemas/release-manifest-v7.schema.json) verlangt genau fünf Rechtsprofile und nennt ausschliesslich `stpo`, `zpo`, `bgg`, `vwvg` und `vrpg-be`.
- [Kalenderprofile](../../src/core/holidayActivationTypes.ts) umfassen vier Bundesprofile. Die [Validierung](../../src/core/holidayActivation.ts) verlangt die bisherigen 104 Verfahrensbindungen.
- Das [Rechtsprofilformat](../../schemas/legal-profile.schema.json) enthält bernbezogene Werte wie `berneseProceduralLaw` und `fixedBern`.

Neue kantonale Profile benötigen deshalb einen **gesondert beschlossenen Vertrags- und Migrationsnachtrag**. AP23A setzt keine Versionsnummern fest und verändert den historischen Format-7-Vertrag nicht.

Zu prüfen sind mindestens explizite Bindungen zwischen Kanton, Verfahren, Verfahrensstufe, Fristart, Geltungszeit und Kalender. Eine Defaultmigration darf keine fehlenden Falltatsachen erfinden. Weder erster Kalendertreffer noch freie Vereinigung konkurrierender Listen oder stiller BE-/CH-Ersatzwert sind zulässig.

## 5. Nächster Fachschritt und Abnahmelogik

Für AP23B bleibt **TI und GR als erste vertiefte Tranche** der Vorschlag. Ergänzend empfehle ich **NW als reine fachliche Kontrastprobe** mit wenigen Referenzfällen für Einwendung, Einsprache/Rechtsmittel und eine relevante Ausnahme. Damit prüfen wir den Unterschied zwischen keinem, nur weihnächtlichem und dreiteiligem Stillstand. NW wird dadurch nicht als dritter Kanton zur Umsetzung oder operativen Freigabe aufgenommen.

BS ist ebenfalls ein wichtiger Modellkontrast, bringt aber zwei eigenständige Handlungspflichten und zusätzliche Quellenfragen mit. Für den ersten Fachschritt ist NW enger begrenzbar. Anmeldung und Begründung in BS bleiben ein ausdrücklicher Architektur- und Umfangsvorbehalt, keine vergessene spätere Ausnahme.

### 5.1 Vorläufige Arbeitsgruppen nach Struktur

Die folgende Einteilung ordnet alle 25 neuen Kantone genau einmal zu. Es sind **keine bereits freigegebenen Release-Tranchen und keine ausführbaren Fünf-Tage-Pakete**. Die Reihenfolge nach dem Pilot bleibt nach Quellenlage und Modellprobe anpassbar.

| Gruppe | Kantone | Gemeinsame Arbeitsfrage |
| --- | --- | --- |
| Pilot | TI, GR | Allgemeiner gegenüber gerichtlichem Stillstand, Handlungs- und Gebietsgrenzen |
| Frühe Anschlusskandidaten | LU, ZG, AR | Direkt geregelte Fristen und vergleichsweise klare Ferienstruktur, verbliebene Nachweise zuerst abschliessen |
| Verweisungs- und Stufenmodelle | ZH, UR, SO, SH, AG, SG, OW | Reichweite von ZPO-/anderen Verweisen, Instanzenrollen, Sachgebietsausnahmen und örtliche Kalenderbindung |
| Differenzierte Stillstandsmodelle | NW, FR, GE, JU, GL, TG | Einzelne Ferienfenster, Handlungen, gesetzliche Fristarten und Belehrungsvorbehalte |
| Besondere Auslöser, Schliesstage oder Handlungsketten | BS, BL, AI, NE | Zusätzliche fachliche Parameter beziehungsweise bewusste Produktgrenzen |
| Quellenabschluss vor Einplanung | SZ, VD, VS | Geltende Fassung oder ergänzende Fristgrundlage zuerst eindeutig nachweisen |

BE bleibt Bestandsregression ausserhalb dieser neuen Gruppen. Die NW-Kontrastprobe wird aus ihrer späteren Gruppe vorgezogen, ohne diese vollständig zu starten.

### 5.2 Erwartete Ergebnisse von AP23B

AP23B muss für jeden vorgesehenen Verfahrensweg einen eindeutigen Fristauslöser, gesetzliche oder behördliche Tagesfrist, Verfahrensstufe, Stillstandsbehandlung, Kalenderbindung, zeitliche Grenze und wesentliche Ausschlüsse belegen. Dazu gehören positive und negative Referenzfälle sowie Grenzfälle. Offene Fragen mit Einfluss auf das Resultat blockieren den betroffenen Weg, nicht automatisch sämtliche anderen Kantone.

Die Reihenfolge bleibt: Fachmodell und Referenzen, Fachabnahme, konkreter Vertragsentscheid, lokale Integration, technische und fachliche Abnahme, danach separat gebundener Quellenrelease und Deployment. Ein ausführbares Teilpaket umfasst höchstens fünf Nettoarbeitstage. Grössere Abschnitte werden vor dem Start geteilt. Es gibt weiterhin nur ein wesentliches Arbeitspaket gleichzeitig.

## 6. Arbeitskopie und Nachweis

Die übergebene Excel-Datei ist die Arbeitskopie für Davids Bemerkungen. Der anfängliche Erzeugungsstand wird davon getrennt byteidentisch gesichert. Eine spätere Kommentierung ist daher keine unerklärte Veränderung eines historischen Abnahmenachweises. Bei Übernahme sind Arbeitskopie, Kommentarentscheid und neue Referenzfassung getrennt zu binden.

Die Erhebung liegt zusätzlich in vier JSON-Dateien unter [ap23a/](ap23a/) vor. Das sind Rechercheartefakte, keine produktiv geladenen Rechtsdaten. [Matrixdaten](../../outputs/ap23a-2026-10-12/matrix-data.json), [Erzeugungsbericht](../../outputs/ap23a-2026-10-12/qa-ap23a.json) und [Verifikation der finalen Datei](../../outputs/ap23a-2026-10-12/verification-ap23a.json) binden den Erzeugungsstand. Der Builder verweigert die Neuerzeugung über einer bestehenden Arbeitskopie, damit spätere Bemerkungen nicht überschrieben werden. Eine spätere Verifikation vergleicht die gebundenen JSON-Prüfsummen und sämtliche unveränderlichen Fachzellen. Menschliche Prüffelder dürfen abweichen. Sie überschreibt den Erzeugungsbericht nicht.

Der Erzeugungsbericht bezeichnet den Export vor Ergänzung der nativen Excel-Quellenlinks. Die Verifikation und die Referenzkopie bezeichnen die endgültige Datei nach dieser Ergänzung. Die zwei technischen Prüfsummen gehören deshalb zu ausdrücklich verschiedenen Verarbeitungsschritten, nicht zu konkurrierenden Fachfassungen. Die Ausgangsreferenz liegt getrennt unter `outputs/ap23a-2026-10-12/referenz/`.

Die technische Prüfung umfasst Vollständigkeit und Eindeutigkeit der 26 Kantone, acht Dimensionen je Kanton, Quellenzuordnung, vier Excel-Tabellen, Filter, fixierte Kopfzeilen, Prüfstatus-Auswahllisten, native Quellenlinks, erneutes Einlesen und gerenderte Sichtprüfung. Ein echter Interaktionstest in Microsoft Excel durch David steht davon getrennt aus.

**Zur Abnahme steht die Struktur- und Arbeitsgrundlage AP23A, nicht die operative Freigabe sämtlicher erfasster Regeln. AP23B bis AP23E sind noch nicht gestartet.**
