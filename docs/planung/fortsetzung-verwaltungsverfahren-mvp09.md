# Weitere kantonale Verwaltungsverfahren und UX Korrektur

**Aktuell, 19. Oktober 2026:** AP23E1 bis E3, R09-A2 und der lokale Releasebau sind abgeschlossen. Die vier bestehenden E-/Q-Instanzen sind auf MVP 0.9 geprüft und [von David abgenommen](../betrieb/abnahme-q-mvp09.md), einschliesslich realer Geräteprüfung, Gastzugriff und begrenzter Outlook-Wiederverwendung. Die [Publikationsbereinigung P09-01 bis P09-03](../betrieb/publikationspaket-mvp09.md) liegt zur Freigabe vor. GitHub und P bleiben gesonderte Übergänge. Der folgende Planungsstand bleibt historisch erhalten.

Stand: 18. Oktober 2026. Lokale Arbeitsplanung nach dem [freigegebenen Produktionsstand MVP 0.8](../betrieb/produktionsbereitstellung-mvp08-2026-10-16.md). Auftrag von David Steimer: «Dann machen wir uns doch an die weiteren Kantone und die UX-Korrektur.»

**Aktueller Übergabepunkt:** AP23E1 bis E3 und R09-A2 sind abgenommen. R09-B ist einschliesslich des [gesondert freigegebenen Validatornachtrags](../betrieb/freigabe-r09-b-quellenvalidator.md) [lokal vollständig abgeschlossen](../betrieb/lokaler-releaseabschluss-mvp09.md). Datenübernahme, genau ein Datencommit, definitive Artefakte und geprüfter MVP08-Wiederherstellungskandidat liegen vor. Als Nächstes folgt die konkrete R09-C-Vorlage. Keine Installation oder Publikation. Die nachfolgenden Absätze beschreiben den bisherigen Planungsverlauf und ersetzen diesen aktuellen Status nicht.

**Die lokale UX-Korrektur ist am 18. Oktober 2026 abgenommen**, siehe [gesonderte Abnahmenotiz](../ux/abnahme-datumseingabe-issue50-lokal.md). Host- und Geräteprüfungen folgen erst mit dem späteren E-/Q-Kandidaten. **AP23E1 für Luzern, Zug und Appenzell Ausserrhoden ist ausdrücklich gestartet.** Dies folgt den frühen Anschlusskandidaten aus AP23A unter [Issue #48](https://github.com/davidsteimer/fristenrechner/issues/48). **MVP 0.9 ist eine Planungsbezeichnung**, keine bereits gebundene Produktversion oder Freigabe neuer Kantonsdaten.

Die [AP23E1-Fachvorlage](../fachrecht/verwaltungsverfahren-ap23e1.md) ist einschliesslich AR-Fünftagesrekurs, Zeitfenstern und AR-O1 [fachlich abgenommen](../fachrecht/abnahme-ap23e1.md). [DEC-2026-033 ist ausdrücklich bestätigt](../entscheidungen/DEC-2026-033-beschluss.md). Auch [AP23E2](../fachrecht/abnahme-ap23e2.md) und die [AP23E3-Integration](../fachrecht/abnahme-ap23e3.md) sind abgenommen. Format 9 verbindet die 13 neuen LU-/ZG-/AR-Wege und die zwölf bisherigen TI-/GR-Wege. Die [Releasevorbereitung MVP 0.9](../betrieb/deployment-mvp-09.md) ist gestartet, R09-A1 mit Archiv, lokaler Regression und Quelleninventar abgeschlossen. Quellenabgleich und operative Freigaben bleiben getrennt. Die folgende Vorprüfung bleibt als Herleitung des ursprünglichen Untersuchungsumfangs erhalten, sie überholt die gesonderten Abnahmen nicht.

## Reihenfolge und Abnahmen

| Schritt | Begrenztes Ergebnis | Abnahme oder Übergang |
| --- | --- | --- |
| UX #50 | Standardhöhe und Schrift des Datumsfelds angleichen, bisherige Eingabefunktionen und Touchflächen erhalten | Lokal abgenommen am 18.10.2026, echte Geräte und Hosts später im E-/Q-Kandidaten |
| AP23E1 Fachvorlage LU, ZG und AR | 13 Verfahrenspfade, aktuelle Fassungsprüfung, eigenständige Kalenderbindungen, 51 Referenzfälle und AR-O1 als begrenzte Sperre | Fachlich abgenommen am 18.10.2026 |
| AP23E2 Vertragsprobe und Datenkandidat | Beschlossener Katalog 2 und Manifest/Mindestconsumer 9, 25 Pfade mit gebundener Qualifikation und isolierter Strukturkandidat | Technisch abgenommen am 18.10.2026, unveränderter Nachweis separat gesichert |
| AP23E3 Integration und Regression | Gemeinsamer Rechenkern, ruhige DE-/FR-Oberfläche, Standards, Rechenspur, Export und lokale Hostintegration | Fachlich-technisch abgenommen am 18.10.2026, keine Betriebsfreigabe |
| Releasevorbereitung | R09-A1 abgeschlossen, [R09-A2 abgenommen](../fachrecht/abnahme-quellen-mvp09.md) und [R09-B lokal ausgeführt und geprüft](../betrieb/lokaler-releaseabschluss-mvp09.md), einschliesslich begrenztem Datencommit und MVP08-Recovery | Konkrete R09-C-Vorlage als nächster Übergang. E/Q, GitHub und P bleiben getrennt freizugeben |

Ein wesentliches Arbeitspaket gleichzeitig. Die lesende Quellen-Vorprüfung während der kleinen UX-Arbeit aktiviert keine zweite Produktumsetzung. Ausführbare Pakete bleiben auf höchstens fünf Nettoarbeitstage begrenzt. Falls die konkrete Pfadzahl diese Grenze überschreitet, werden E1 bis E3 vor ihrer weiteren Umsetzung nach Kanton oder Teilaufgabe geteilt. Es wird nicht auf die Vollständigkeit aller übrigen Kantone als automatische Releasebedingung gewartet.

## Fachliche Vorprüfung der Anschlussgruppe

Die amtlichen Fassungen und die nachfolgenden Kernaussagen wurden am 18. Oktober 2026 erneut geprüft. Die Tabelle bestimmt den nächsten Untersuchungsumfang. Sie ersetzt noch keine vollständige Fachvorlage und Referenzfallabnahme.

| Kanton | Vorläufiger enger Umfang | Wesentliche Prüfaufgabe |
| --- | --- | --- |
| LU | Ordentliche Verwaltungs- und Verwaltungsgerichtsbeschwerde sowie ausdrücklich angeordnete vorwärts laufende Tagesfristen vor kantonalen Stellen | Grundsätzlich 30 Tage nach § 130 VRG. Kein allgemeiner VRG-Stillstand. Eigene Feiertagsbindung nach § 34 VRG, nicht bloss Übernahme der ZPO-/StPO-Regel aus § 76 JusG. Josefstag und Patrozinium bleiben aus dem VRG-Filter ausgeschlossen. |
| ZG | Ordentliche Verwaltungsbeschwerde, Verwaltungsgerichtsbeschwerde und qualifizierte angeordnete Tagesfristen vor kantonalen Stellen | 20 Tage verwaltungsintern, 30 Tage vor Verwaltungsgericht. Kein allgemeiner VRG-Stillstand. Ausdrückliche Feiertagsliste in § 10 VRG. Verkürzte Dringlichkeitsfristen und besondere Eröffnungs-/Begründungsschritte dürfen nicht als gewöhnliche Tagesfrist behandelt werden. |
| AR | Ordentlicher Rekurs, ordentliche Obergerichtsbeschwerde und qualifizierte angeordnete Tagesfristen vor kantonalen Stellen | 20 Tage Rekurs, 30 Tage Beschwerde. Stillstand nur im qualifizierten Obergerichtsverfahren. Der Vollstreckungsrekurs mit fünf Tagen ist separat zu modellieren oder ausdrücklich auszuschliessen, niemals als 20-Tage-Rekurs auszugeben. |

### Amtliche Grundlagen

| Quelle | Geprüfter Fassungsstand | Rolle |
| --- | --- | --- |
| [LU VRG, SRL 40](https://srl.lu.ch/api/de/versions/3793/pdf_file) | 01.09.2021 | §§ 31, 33–35 und 130 sowie Geltungsbereich |
| [LU Ruhetagsgesetzgebung, SRL 855](https://srl.lu.ch/api/de/versions/4916/pdf_file) | 27.09.2026 | § 1a in Verbindung mit § 34 VRG |
| [LU JusG, SRL 260](https://srl.lu.ch/api/de/versions/4662/pdf_file) | 01.01.2026 | § 76 als Abgrenzung der ZPO-/StPO-Anbindung |
| [ZG VRG, BGS 162.1](https://bgs.zg.ch/api/de/versions/2740/pdf_file) | 17.10.2025 | §§ 10–11, 20–21, 43 und 64 |
| [ZG Verwaltungsgericht zur Rechtsmittelfrist](https://zg.ch/de/recht-justiz/verwaltungsgerichtsverfahren/einleitung-verwaltungsgerichtsverfahren/rechtsmittelfrist) | Amtliche Erläuterung, geprüft 18.10.2026 | Kein allgemeiner Stillstand, Postaufgabe und Abgrenzung des Sozialrechts |
| [AR VRPG, bGS 143.1](https://ar.clex.ch/api/de/versions/1285/pdf_file) | 01.01.2020 | Art. 4–7, 31a, 34, 55, 59 und 63 |
| [AR Verordnung zum Arbeitsgesetz, bGS 822.11](https://ar.clex.ch/api/de/versions/1058/pdf_file) | 01.01.2016 | Art. 7, insbesondere bedingter zweiter Weihnachtstag |
| [AR Baugesetz, bGS 721.1](https://ar.clex.ch/api/de/versions/1584/pdf_file) | 01.10.2025 | Art. 110 Abs. 3 als Spezialrechtsgrenze, keine Aktivierung des Bauverfahrens |
| [AR Steuergesetz, bGS 621.11](https://ar.clex.ch/app/de/texts_of_law/621.11) | 01.01.2025 | Art. 188 Abs. 5 als Spezialrechtsgrenze, im aktuellen amtlichen HTML geprüft |

Der [Luzerner Praxisbeleg LGVE 1993 II Nr. 44](https://gerichte.lu.ch/recht_sprechung/lgve/Ajax?EnId=1196) wird nur als historischer ergänzender Beleg zur eigenständigen VRG-Fristenordnung geführt. Die heutige Normgrundlage ist separat zu prüfen. Bei verbleibenden Auslegungsfragen werden Entscheidsuche und Swiss Caselaw ergänzend herangezogen. Suchtreffer allein sind kein abgeschlossener Rechtsprechungsnachweis.

## Konkreter Arbeitsumfang von AP23E1

1. Je Kanton Verfahrensstufe, zuständige Zielstelle, Handlung, vollständig eröffnetes Dokument, Fristart, Dauer und Ausnahmen eindeutig zuordnen. Angeordnete Tagesfristen nach Stufe trennen, wenn sich die Regeln unterscheiden.
2. Vorhandene Feiertagsprojektionen anhand der jeweils einschlägigen Verfahrensnormen prüfen. Eine identische Datumsliste benötigt trotzdem eine eigene belegte Verwaltungs-Verwendungsbindung.
3. Fristbeginn, Stillstandsfenster, Endverschiebung und Eröffnung während eines Stillstands mit unabhängigen Sollrechnungen prüfen. Die Verschiebung eines Endtags in einen neu beginnenden Stillstand ist für AR eigens zu klären. TI-O2 wird weder ungeprüft übertragen noch als gelöst behandelt.
4. Positive und negative Referenzen erstellen. Schwerpunkte sind LU ohne Josefstagsverschiebung, ZG 20 gegenüber 30 Tagen, AR Verwaltung gegenüber Obergericht und der Fünftagesrekurs. Ergänzend Jahreswechsel, Feiertagsketten, verkürzte Fristen, fehlende Belehrung, feste Termine, Monatsfristen und Spezialrecht.
5. Zeitliche Freigabe und Gebietsbezug vorschlagen. Das bisherige TI-/GR-Fenster oder ein dauerhaft berechenbarer Kalender wird nicht automatisch zur Rechtsfreigabe der neuen Wege.
6. Eine kompakte Fachvorlage mit Falltabelle, Quellenregister und offenen Entscheiden zur Abnahme vorlegen. Wo tatsächliche neue Fallangaben nötig sind, deren UI-Folge vor der Integration zeigen.

Für den AR-Vollstreckungsrekurs wird in E1 eine eigene Modellprobe erstellt. Aufnahme oder ausdrücklicher Ausschluss wird Teil der Fachabnahme. Auch die genaue Reichweite angeordneter Fristen, etwa bei Kostenvorschüssen, ist vor einer positiven Pfadbindung festzuhalten.

## Gemeinsame Leitplanken

- [DEC-2026-031](../entscheidungen/DEC-2026-031-behoerdensitz-kantonale-verwaltungsverfahren.md) bleibt massgebend. Im allgemeinen kantonalen Verwaltungsrecht gilt grundsätzlich der Sitz der zuständigen Zielbehörde. Bundesrechtliches Spezialrecht und ausdrückliche abweichende Normen gehen vor. Kein generisches freies Feld «Feiertagskanton».
- Der bestehende Vertrag kann nach der Vorprüfung alle drei Kantonscodes, gesetzliche und angeordnete Tagesfristen sowie keinen oder dreiteiligen Stillstand ausdrücken. **Ob die Erweiterung ohne Formatwechsel genügt, wird erst durch die konkrete Vertragsprobe entschieden.** Keine vorweggenommene Versionsänderung.
- Zunächst kantonale Zielstellen. Eigenständige kommunale Erlasse, pauschale Freigaben kommunaler Instanzen, neue Sozialanbindungen, Beschaffungs-, Steuer-, Bau- und weitere Spezialverfahren bleiben abgegrenzt. Ihre Ausnahmen sind trotzdem zu prüfen, damit sie nicht unbemerkt unter das allgemeine Profil fallen.
- Frühe Datumseingabe, zweispaltiges Layout, keine Schein-Dropdowns mit einer echten Option, keine zusätzlichen Nutzerangaben ohne Rechenrelevanz. Zusatzwissen gehört in die verständliche Rechenspur.
- DE/FR bleiben Produktsprachen. IT/RG, Kalender-App, Karte und Printprodukte werden mit diesem Start nicht automatisch aufgenommen.
- Rechenregeln, freigegebene Daten, historische Abnahmen und E/Q/P bleiben während der Vorprüfung unverändert. Die lokale CSS-Korrektur ist ein neuer Arbeitsstand, kein Ersatz des abgenommenen MVP-0.8-Pakets. Kein Commit, Push, Upload oder Deployment durch diese Planung.

David Steimer entscheidet und nimmt ab. Codex bereitet vor, recherchiert, implementiert und prüft als dokumentiertes KI-Arbeitsinstrument ohne formelle Freigabe- oder Haftungsverantwortung.

## Nachweise und nächster Übergabepunkt

- [Lokaler UX-Nachtrag zu Issue #50](../ux/datumseingabe-hoehe-issue50.md)
- [Aktuelle lokale UX-Abnahme](../ux/abnahme-datumseingabe-issue50-lokal.md), der R2-Nachweis bleibt unverändert
- [Vollständige AP23E1-Fachvorlage](../fachrecht/verwaltungsverfahren-ap23e1.md), [Quellen](../fachrecht/quellenpruefung-ap23e1.md) und [Referenzfälle](../fachrecht/referenzfaelle-ap23e1.md)
- [Ursprüngliche Strukturaufnahme AP23A](../fachrecht/verwaltungsverfahren-ap23a.md), deren damaliger Status unverändert bleibt
- [Bestehender Kantonalverfahrensvertrag](../architektur/verwaltungsverfahrensvertrag-ap23c.md)

Nächster Übergabepunkt ist die konkrete E-/Q-Installations- und Rückfallvorlage R09-C gemäss [Releaseplan](../betrieb/deployment-mvp-09.md). AP23E1 bis E3 und R09-A2 sind abgenommen, DEC-2026-033 ist beschlossen und R09-B lokal vollständig geprüft. Die weiteren Installations-, Publikations- und Betriebsfreigaben sowie die Outlook-Wiederverwendungsbestätigung bleiben getrennte Schritte.
