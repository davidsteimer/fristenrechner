# AP18A: Quellenprüfung und räumlich-sachlicher Strukturpilot

Stand: 13. September 2026. Arbeitsinstrument: Codex. Fachverantwortung: David Steimer. **Neue Prüfnotizen und AG-Zuordnungen sind nicht fachlich abgenommen.** Die bisherige CH-/BE-Freigabe wird nur für den unveränderten Referenzbestand übernommen.

## 1. Bund und Bern

| Quelle | Originalprüfung | Ergebnis und Grenze |
| --- | --- | --- |
| [Verordnung über den Bundesfeiertag, SR 116](https://www.fedlex.admin.ch/eli/cc/1994/1340_1340_1340/de), Art. 1 | Fedlex im Browser geöffnet. In Kraft, einzige angezeigte Fassung 01.07.1994. Art. 1 gelesen | Sonntagsgleichstellung bestätigt. Unveränderte Referenzregel `CH-CAL-HOL-NATIONAL-DAY`. Keine Aufwertung anderer Tage zu nationalen Feiertagen |
| [FRG Bern, BSG 555.1](https://www.belex.sites.be.ch/app/de/texts_of_law/555.1), Art. 2 Abs. 1 Bst. a–c | BELEX im Browser geöffnet. Aktuelle Fassung seit 01.04.2021, Änderungstabelle kontrolliert. [Fassungs-PDF](https://www.belex.sites.be.ch/api/de/versions/2234/pdf_file) | Elf eigene benannte BE-Regeln und geerbter Bundesfeiertag stimmen mit dem bisherigen Referenzbestand überein. Allgemeine Sonntage bleiben eine getrennte Wochenend-/Sonntagsregel |

Die rein textbasierten Abrufe lieferten zunächst nur die JavaScript-Hülle. Erst die geladene amtliche Browseransicht lieferte den vollständigen Inhalt. Ein technischer HTTP-Erfolg allein wurde nicht als Quellenprüfung gewertet.

Art. 9 FRG ist kein Anlass, eigenständiges kommunales Recht in den vereinbarten Umfang aufzunehmen. Der historische Übergangstext zu Vellerat in Art. 12 wird nicht als heutige zusätzliche BE-Regel modelliert. Historische Gebietsfragen gehören nicht zum auf 2026–2028 begrenzten Pilot.

## 2. Aargau: unterschiedliche Rechtsbereiche

### 2.1 Regionale arbeitsgesetzliche Feiertage

Amtliche Grundlage ist [§ 6 Abs. 1 EG ArR, SAR 961.200, Fassung 01.09.2025, Seite 3](https://gesetzessammlungen.ag.ch/api/de/versions/3837/pdf_file). Die aktuelle Änderung von 2025 betrifft § 7 Abs. 2. Die Feiertagsbestimmung gilt gemäss Änderungstabelle seit 01.09.2012 unverändert.

Für den kleinen Strukturpilot werden nur zwei Ausschnitte erfasst:

- **Bezirk Baden ohne Bergdietikon:** Fronleichnam gemäss § 6 Abs. 1 Bst. b Ziff. 2.
- **Bergdietikon:** Berchtoldstag gemäss § 6 Abs. 1 Bst. b Ziff. 1.

Die Zuordnung wird durch das [amtliche AWA-Merkblatt zu Feiertagen](https://www.ag.ch/media/kanton-aargau/dvi/dokumente/awa/awa/arbeitnehmerschutz-im-betrieb/feiertage.pdf) unterstützt. Massgeblich bleibt die kantonale Norm. Diese beiden Einträge sind **keine vollständigen Feiertagskalender** der Gebiete und kein eigenständiges kommunales Recht.

### 2.2 Prozessuale Feiertage

[§ 21 Abs. 1 EG ZPO/AG, SAR 221.200, Fassung 01.01.2022, Seite 8](https://gesetzessammlungen.ag.ch/api/de/versions/3615/pdf_file) nennt Feiertage im Sinne von Art. 142 Abs. 3 ZPO ohne die regionale Unterteilung des Arbeitsrechts. Dazu gehört Allerheiligen. Der Pilot führt deshalb eine dritte, getrennte Zeile `AG-PROC-DAY-ALL-SAINTS` mit Kategorie `proceduralEquivalentDay`.

Es wäre falsch, aus dem Fehlen von Allerheiligen in einer regionalen Arbeitsfeiertagsliste auf eine fehlende prozessuale Fristverlängerung zu schliessen. Die Bedeutung von § 21 für eine konkrete Profil- und Ortsanknüpfung ist vor einer Automatik separat zu prüfen.

Der amtlich veröffentlichte Entscheid [BGer 2E_8/2024 vom 13. Februar 2026, E. 6.5–6.7](https://search.bger.ch/ext/eurospider/live/de/php/aza/http/index.php?highlight_docid=aza%3A%2F%2F13-02-2026-2E_8-2024&lang=de&type=show_document&zoom=) behandelt ausdrücklich die unterschiedliche Liste nach EG ArR und EG ZPO und die Fristbeurteilung nach Art. 45 BGG. Die Staatshaftungsabweisung darf nicht als Bestätigung der ursprünglichen Fristberechnung gelesen werden. Der Entscheid dient hier nur als unterstützender Hinweis für die notwendige Trennung, nicht als automatischer Import einer neuen Regel.

Die amtliche Publikation enthält eine Datierungsauffälligkeit: Das Entscheidungsdatum lautet 13.02.2026, während E. 6.6 einen Quellenbesuch vom 10.03.2026 nennt. Diese Auffälligkeit wird nicht stillschweigend bereinigt. Der im Original geprüfte Normunterschied bleibt nachvollziehbar. Eine neue juristische Freigabe wird daraus nicht abgeleitet. Der Volltext wurde ergänzend über Entscheidsuche abgeglichen.

### 2.3 Grenzen und Folgearbeit

- Die drei Beispielregeln beginnen im **Datenpiloten** am 01.01.2026. Das ist nicht das Inkrafttreten der zitierten Erlasse.
- Die französischen AG-Feiertagsnamen sind Produktübersetzungen, keine als amtlich behaupteten Übersetzungen der deutschsprachigen kantonalen Norm.
- Eine aktuelle Zuordnung zu den ausdrücklich genannten Gebieten genügt für den Strukturbeweis. Eine historische Gemeindeschicht oder schweizweite Gemeindedatenbank wird nicht gebaut.
- Die frühere Freitag-/Montag-Ausnahme aus § 9 Abs. 2 der Vollziehungsverordnung zum Arbeitsgesetz, SAR 961.111, wird nicht übernommen. Die Verordnung wurde per 01.09.2012 aufgehoben, siehe [AGS 2012/5-4, Ziff. III/1 und IV](https://gesetzessammlungen.ag.ch/api/de/change_documents/file_dictionaries/398/pdf_file).
- Vor AP18C braucht es vollständige Feiertagslisten des jeweils beanspruchten Umfangs, genaue Verfahrensanknüpfung, zeitliche Abgrenzung und menschliche Fachabnahme. Die AG-Beispiele bleiben bis dahin `open`, der pauschale Transfer aus Arbeitsrecht in Fristenrecht `blocked`.

## 3. Methodische Quelle des Bundesamts für Justiz

Die [Hinweise des BJ zum Verzeichnis gesetzlicher Feiertage und gleichgestellter Tage](https://www.bj.admin.ch/dam/de/sd-web/4Ad6GMn8rA0i/hinweise-kant-feiertage.pdf), Stand 17.12.2012, unterscheiden in Ziff. 1–3 ausdrücklich das fristenrechtliche Verzeichnis von arbeitsrechtlichen und allgemeinen Ruhetagslisten. Die darin beschriebene konsolidierte Liste hat den Stand 01.01.2011. Sie wird deshalb als methodischer Nachweis geführt, nicht als aktuell vollständige Schweizer Feiertagsquelle ausgegeben.

**Linkkorrektur vom 13.09.2026:** David Steimer meldete beim bisherigen Downloadpfad einen Fehler 502. Über die [aktuelle BJ-Seite zum Zivilprozessrecht](https://www.bj.admin.ch/de/zivilprozessrecht) wurde der oben verlinkte neue PDF-Pfad ermittelt und dessen einseitiger Inhalt erneut geöffnet. Quellen-ID `SRC-BJ-FRISTENHINWEISE-20121217`, Dokumentdatum und methodische Einordnung bleiben gleich. V0.4 korrigiert das native Hyperlinkziel. Die älteren XLSX-Referenzfassungen bleiben unverändert.

## 4. Anschluss an AP13

Die Arbeitsmappe enthält vier vorbereitete Prüfnotizen mit Ereignisstatus `candidate`. Die CH-/BE-Notizen halten den unveränderten Originalvergleich fest. Die AG-Notizen verwenden `unclear`, weil die konkrete Verfahrensanknüpfung noch nicht abschliessend fachlich geprüft und geklärt ist. Die ausstehende Freigabe wird separat mit `candidate` bezeichnet. Keine Notiz schreibt das bestehende freigegebene Ereignis um oder aktualisiert den Governance-Index.

Eine fachliche Abnahme der neuen Notizen, ein allfälliger Datenrelease und die Veröffentlichung sind getrennte Schritte. [AP13](../betrieb/periodische-quellenpruefung-ap13.md) bleibt unverändert massgeblich.

## 5. Ergänzende Strukturabklärung und Beschluss

Im Anschluss an die V0.3-Prüfung fragte David Steimer nach der Eignung einer flachen Liste mehrerer Gebietsebenen. Die am 13.09.2026 erläuterten amtlichen Gegenbeispiele begründen eine gezielte Strukturergänzung, keine schweizweite Vollerhebung:

| Beleg | Befund | Konsequenz und Grenze |
| --- | --- | --- |
| [Solothurn, § 1 Abs. 1 Bst. c RTG, BGS 512.41](https://bgs.so.ch/api/de/versions/3717/pdf_file), unterstützt durch die [amtliche Feiertagsseite 2026](https://so.ch/allgemeine-informationen/gesetzliche-feiertage/) | Fronleichnam, Mariä Himmelfahrt und Allerheiligen mit Ausnahme des Bezirks Bucheggberg. Die Informationsseite bezeichnet ihre Liste ausdrücklich als Grundlage rechtlicher Fristen | Regionale kantonale Feiertage sind kein Aargauer Einzelfall. Die Norm ist kantonal, das ausgeschlossene Gebiet ein Bezirk |
| [Freiburg, amtliche Feiertagsübersicht 2026](https://www.fr.ch/de/arbeit-und-unternehmen/arbeitnehmer/feiertage), mit Verweis auf Art. 49 BAMG | Unterschiedliche arbeitsrechtliche Listen für katholische und reformierte Gebiete. Unter den reformierten Gebieten werden die Orte Flamatt und Sensebrügg innerhalb der Gemeinde Wünnewil-Flamatt aufgeführt | Für eine allgemeine Feiertagsgrundlage ist die Gemeinde nicht ausnahmslos die kleinste Einheit. Keine ungeprüfte Übernahme dieser Gebietsprofile in die Fristberechnung |
| [Freiburg, Art. 121 Abs. 2 JG, SGF 130.1, PDF-Seite 35](https://bdlf.fr.ch/api/fr/versions/7926/pdf_file) | Für den Fristenablauf wird eine im ganzen Kanton geltende Feiertagsliste bestimmt | Räumliche Feiertagsprofile und prozessuale Anwendungsprofile müssen getrennt bleiben |

§ 4 des Solothurner RTG erlaubt daneben kommunale Festlegungen von Oster- und/oder Pfingstmontag als lokalen Ruhetagen. Das ist von der unmittelbar kantonal festgelegten Bezirksausnahme zu unterscheiden. Die kantonale Ermächtigung ersetzt nicht die Prüfung des konkreten kommunalen Akts. Solche eigenständigen kommunalen Festlegungen bleiben nach dem vereinbarten Umfang ausgeschlossen.

David Steimer hat dem vorgeschlagenen Vorgehen zugestimmt. Der [Arbeitsmappenvertrag V0.4](../architektur/feiertagsmatrix-ap18a.md#beschluss-vom-13-september-2026-rechtsgeber-und-gebiet-trennen) dokumentiert diesen Beschluss. Die neue Mappe führt zunächst nur sechs offene Gebietszuordnungen zu den vorhandenen Pilot-Geltungsbereichen. Aus den obigen zusätzlichen Belegen werden noch keine SO-/FR-Regeln, amtlichen Gemeindekennungen oder fachlichen Freigaben erzeugt.

### Quellenkorrektur im Modellcheck AP18B-03

Am 13. September 2026 wurde im nachfolgenden [Modellcheck](../architektur/modellcheck-ap18b-03.md#solothurn-quellenkorrektur-und-offene-tageswirkung) festgestellt, dass die vorstehenden SO-Fundstellen § 1 Abs. 1 Bst. c und § 4 in Version 3717 den aufgehobenen Erlass von 1964 betreffen. Die heute geltende Grundlage ist [RTG, Version 4319, Stand 01.09.2014](https://bgs.so.ch/api/de/versions/4319/pdf_file), § 2 Abs. 1 Bst. b und Abs. 2. Die [Aufhebung des früheren Erlasses](https://bgs.so.ch/app/de/change_documents/989) ist ausdrücklich dokumentiert.

Der frühere Nachweis bleibt historisch erhalten, darf aber nicht als aktuelle Rechtsfassung verwendet werden. Die Bucheggberg-Ausnahme bleibt im neuen Recht bestehen. Die heutige Gemeindeermächtigung erfasst zusätzliche kommunale Ruhetage allgemein und ist nicht auf Oster- und Pfingstmontag beschränkt. Eigenständige kommunale Festlegungen bleiben ausserhalb des vereinbarten Erhebungsumfangs. Die Arbeitsmappen und ihre früheren Prüfprotokolle wurden nicht verändert.
