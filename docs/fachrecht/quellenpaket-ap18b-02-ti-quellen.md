# AP18B-02 Tessin – amtliche Quellen und Erhebung

Quellenabruf: 13. September 2026. Arbeitsstand: Erhebungsentwurf, keine Fach-, Verfahrens- oder Betriebsfreigabe. Dieses Dokument konkretisiert den TI-Teil der bestätigten Abgrenzung in `quellenpaket-ap18b-02-ti-gr-abgrenzung.md`. Es ändert weder Arbeitsmappe noch Rechenmodell. Berücksichtigt werden die aktuell geprüften Normen und die Datenjahre 2026–2028, nicht eine historische Vollerhebung.

## 1. Quellen, Fassungen und Beweisfunktion

| Kürzel | Amtliche Primärquelle und Fundstelle | Geprüfter Zeitbezug | Verwendungsgrenze |
| --- | --- | --- | --- |
| TI-F | [RL 843.200, Legge concernente i giorni festivi ufficiali nel Cantone Ticino, Art. 1](https://www3.ti.ch/CAN/RLeggi/public/index.php/raccolta-leggi/legge/num/568) | Erlass vom 15.12.2009, publiziert BU 2010, 46, in Kraft seit 09.02.2010. Der abgerufene konsolidierte Text zeigt keinen gesonderten Standvermerk und keine Änderungsmarke bei Art. 1 | Normative Liste der 15 offiziellen Feiertage neben den Sonntagen |
| TI-A | [RL 843.100, LALL, Art. 6 lit. a und b](https://m3.ti.ch/CAN/RLeggi/public/index.php/raccolta-leggi/legge/num/569) | Erlass vom 14.03.2011, publiziert BU 2011, 314, in Kraft seit 01.06.2011. Kein gesonderter Standvermerk, Art. 6 ohne Änderungsmarke im geprüften Text | Arbeitsrechtliche Einteilung. Die im Gesetz sichtbare Änderung ab 01.03.2014 betrifft Art. 7 Abs. 2, nicht die Feiertagsliste |
| TI-P | [RL 165.100, LPAmm, Art. 1, Art. 13 Abs. 3 und Art. 16](https://www3.ti.ch/CAN/RLeggi/public/index.php/raccolta-leggi/legge/num/151) | Erlass vom 24.09.2013, ausdrücklich ausgewiesener Stand 01.06.2025 | Begrenzte verfahrensrechtliche Anknüpfung mit gesetzlichen Ausnahmen. Ferienregeln werden nicht aktiviert |
| TI-K | [Ufficio dell'ispettorato del lavoro, Giorni festivi in Ticino, Kalender 2026 und 2027](https://www4.ti.ch/dfe/de/uil/legge-lavoro/giorni-festivi-in-ticino-1) | Beide Jahreslisten am Abrufdatum vollständig verfügbar. Kein eigener Seitenstand ausgewiesen. Kein Kalender 2028 auf der geprüften Seite | Amtlicher Datumsabgleich für 2026/2027 und erläuternde arbeitsrechtliche Legende, kein eigenständiger Verfahrensnachweis |

Der Kopf der kantonalen Gesetzessammlung nennt als letzten berücksichtigten BU den 04.09.2026, BU 30/2026. Dieses Sammlungsdatum wird ausdrücklich nicht als Inkrafttreten oder Einzelgesetz-Fassungsstand gespeichert. Wo ein Einzelgesetz-Stand fehlt, bleibt ein entsprechendes Datumsfeld offen. Abrufdatum, belegtes Inkrafttreten und ausgewiesener Normstand sind verschiedene Metadaten.

## 2. Vollständige Feiertagsmatrix

Alle Zeilen gelten kantonsweit. Die Normen TI-F und TI-A enthalten für diese Listen keine Bezirks-, Gemeinde- oder historischen Gebietsausnahmen. Die laufende Nummer verweist jeweils auf Art. 1 TI-F. `a` bezeichnet Art. 6 lit. a TI-A, also arbeitsrechtlich den Sonntagen gleichgestellt. `b` bezeichnet Art. 6 lit. b TI-A, also offiziell, aber arbeitsrechtlich nicht den Sonntagen gleichgestellt. Quelle der Einteilung ist der ausdrückliche Normtext, nicht eine nach Textextraktion nicht mehr erkennbare Kalenderfarbe.

| Nr. | Feiertagsschlüssel für den Abgleich | Italienischer Name aus Art. 1 TI-F | TI-A | Datumsregel |
| --- | --- | --- | --- | --- |
| 1 | `NEW-YEAR` | Capo d’anno | a | fix 01.01 |
| 2 | `EPIPHANY` | Epifania | a | fix 06.01 |
| 3 | `ST-JOSEPH` | San Giuseppe | b | fix 19.03 |
| 4 | `EASTER-MONDAY` | Lunedì di Pasqua | a | Ostersonntag + 1 Tag |
| 5 | `MAY1` | Primo maggio | b | fix 01.05 |
| 6 | `ASCENSION` | Ascensione | a | Ostersonntag + 39 Tage |
| 7 | `WHIT-MONDAY` | Lunedì di Pentecoste | b | Ostersonntag + 50 Tage |
| 8 | `CORPUS-CHRISTI` | Corpus Domini | b | Ostersonntag + 60 Tage |
| 9 | `ST-PETER-PAUL` | San Pietro e Paolo | b | fix 29.06 |
| 10 | `NATIONAL-DAY` | Il Primo agosto (anniversario della fondazione della Confederazione) | a | fix 01.08 |
| 11 | `ASSUMPTION` | Assunzione | a | fix 15.08 |
| 12 | `ALL-SAINTS` | Ognissanti | a | fix 01.11 |
| 13 | `IMMACULATE-CONCEPTION` | Immacolata | b | fix 08.12 |
| 14 | `CHRISTMAS` | Natale | a | fix 25.12 |
| 15 | `ST-STEPHEN` | Santo Stefano | a | fix 26.12 |

Die Schlüssel dienen der fachlichen Zuordnung, nicht als Ersatz für bestehende IDs. Typografische Trennartefakte der HTML-Extraktion wurden beseitigt. TI-A verwendet für Nr. 1, 5, 9 und 10 die Varianten Capodanno, 1° Maggio, SS. Pietro e Paolo und 1° Agosto. TI-K verwendet insbesondere Capodanno, Festa del lavoro und Festa Nazionale Svizzera. Diese amtlichen Varianten bezeichnen keine zusätzlichen Feiertage. [TI-F](https://www3.ti.ch/CAN/RLeggi/public/index.php/raccolta-leggi/legge/num/568), [TI-A](https://m3.ti.ch/CAN/RLeggi/public/index.php/raccolta-leggi/legge/num/569), [TI-K](https://www4.ti.ch/dfe/de/uil/legge-lavoro/giorni-festivi-in-ticino-1).

Kontrollsumme: 15 verschiedene Feiertage, davon 9 in Kategorie a und 6 in Kategorie b. Der bereits enthaltene Bundesfeiertag ist keine sechzehnte Zeile und darf in einem mit CH kombinierten Profil nicht doppelt zählen. Karfreitag und Berchtoldstag stehen nicht in dieser TI-Liste. Ostern und Pfingsten benötigen hier keine zusätzlichen Sonntags-Feiertagsregeln.

## 3. Verfahrensbezug und Ausschlüsse

Art. 13 Abs. 3 LPAmm verschiebt ein Fristende am Samstag, Sonntag oder offiziell anerkannten Feiertag auf den nächsten Werktag. Art. 1 Abs. 1 bestimmt den Verwaltungsverfahrensbereich einschliesslich der dort genannten kantonalen, kommunalen und weiteren öffentlichen Entscheidungsträger. Art. 1 Abs. 2 behält besondere Verfahrensnormen anderer Gesetze vor. Nach Art. 1 Abs. 3 ist Titel II, zu dem Art. 13 gehört, ausgenommen bei erstinstanzlichen Verwaltungsverfahren, die ihrer Natur nach ohne Schriftform durch sofort vollstreckbare Entscheidungen erledigt werden. [TI-P, Art. 1 und 13](https://www3.ti.ch/CAN/RLeggi/public/index.php/raccolta-leggi/legge/num/151).

Fachliche Ableitung aus TI-F und TI-P: Im verbleibenden LPAmm-Bereich umfasst die Feiertagszuordnung alle 15 offiziellen Tage. Kategorie b ist kein verfahrensrechtlicher Ausschluss. Arbeitsrecht und Verfahrenswirkung müssen deshalb getrennte Felder behalten. Art. 16 LPAmm enthält eigenständige Stillstandsregeln und Ausnahmen, die dieses Feiertagspaket nicht implementiert. Die Anwendbarkeit ist vor einer Freigabe am konkreten Verfahren zu prüfen. [TI-F](https://www3.ti.ch/CAN/RLeggi/public/index.php/raccolta-leggi/legge/num/568), [TI-P](https://www3.ti.ch/CAN/RLeggi/public/index.php/raccolta-leggi/legge/num/151).

Das Paket erteilt keine Zuordnung für ZPO, StPO, BGG, SchKG, ATSG oder sonstiges Spezialrecht allein aufgrund des Kantons Tessin. Historische Rechtsprechung zur früheren LPamm wird hier nicht als Beleg für die Anwendung des heutigen Art. 13 ausgegeben. Die Bestätigung eines Feiertagsdatums ist von der Berechenbarkeit einer vollständigen Frist zu unterscheiden.

## 4. Datumsreferenz 2026–2028

Die ersten beiden Spalten sind mit sämtlichen 30 Einträgen der amtlichen UIL-Jahreslisten abgeglichen. Die 15 Werte für 2028 sind aus den Regeln in Abschnitt 2 abgeleitet, nicht durch einen amtlichen Kalender 2028 bestätigt. Rechenanker sind die gregorianischen Ostersonntage 05.04.2026, 28.03.2027 und 16.04.2028. Die vier Osterabstände stimmen 2026 und 2027 mit TI-K überein. Eine spätere Rechtsänderung wird damit nicht ausgeschlossen. [Amtliche UIL-Referenz 2026/2027](https://www4.ti.ch/dfe/de/uil/legge-lavoro/giorni-festivi-in-ticino-1).

| Schlüssel | 2026 amtlich abgeglichen | 2027 amtlich abgeglichen | 2028 abgeleitet |
| --- | --- | --- | --- |
| `NEW-YEAR` | 2026-01-01 | 2027-01-01 | 2028-01-01 |
| `EPIPHANY` | 2026-01-06 | 2027-01-06 | 2028-01-06 |
| `ST-JOSEPH` | 2026-03-19 | 2027-03-19 | 2028-03-19 |
| `EASTER-MONDAY` | 2026-04-06 | 2027-03-29 | 2028-04-17 |
| `MAY1` | 2026-05-01 | 2027-05-01 | 2028-05-01 |
| `ASCENSION` | 2026-05-14 | 2027-05-06 | 2028-05-25 |
| `WHIT-MONDAY` | 2026-05-25 | 2027-05-17 | 2028-06-05 |
| `CORPUS-CHRISTI` | 2026-06-04 | 2027-05-27 | 2028-06-15 |
| `ST-PETER-PAUL` | 2026-06-29 | 2027-06-29 | 2028-06-29 |
| `NATIONAL-DAY` | 2026-08-01 | 2027-08-01 | 2028-08-01 |
| `ASSUMPTION` | 2026-08-15 | 2027-08-15 | 2028-08-15 |
| `ALL-SAINTS` | 2026-11-01 | 2027-11-01 | 2028-11-01 |
| `IMMACULATE-CONCEPTION` | 2026-12-08 | 2027-12-08 | 2028-12-08 |
| `CHRISTMAS` | 2026-12-25 | 2027-12-25 | 2028-12-25 |
| `ST-STEPHEN` | 2026-12-26 | 2027-12-26 | 2028-12-26 |

Kleine Referenzfälle für die Umsetzung:

- Alle sechs Kategorie-b-Tage müssen im begrenzten LPAmm-Profil als offizielle Feiertage enthalten sein, insbesondere Pfingstmontag und Fronleichnam. Der arbeitsrechtliche Wert bleibt zugleich `nicht sonntagsgleich`.
- Der 01.08.2027 ist sowohl Sonntag als auch Bundesfeiertag. Er zählt als ein Datum. Aus der Kollision wird kein zusätzlicher Ersatzfeiertag am 02.08.2027 erzeugt. Eine allfällige Verschiebung eines konkreten Fristendes ist davon getrennt.
- Der 03.04.2026 ist Karfreitag, aber kein Feiertag dieser Liste. Dies ist ein Feiertags-Mitgliedschaftstest, keine Aussage zum Fristablauf während allfälliger Gerichtsferien.
- Ein Verfahren mit dem Ausnahmetatbestand nach Art. 1 Abs. 3 LPAmm darf die allgemeine Art.-13-Zuordnung nicht automatisch erhalten. Ebenso wenig darf die Wahl des Kantons allein das anwendbare Verfahrensgesetz bestimmen.

## 5. Sprachwerte und offene Nachweise

Die italienischen Werte in Abschnitt 2 sind amtliche Normbezeichnungen. Die folgende DE-/FR-Tabelle enthält eigene Produktübersetzungsvorschläge, keine amtlichen Tessiner Sprachfassungen. Bestehende freigegebene Namenswerte werden dadurch nicht umbenannt. Ein übernommener Vorschlag benötigt den passenden Übersetzungsstatus und darf keinen amtlichen IT-Beleg als Beleg seiner deutschen oder französischen Form ausgeben.

| Schlüssel | Deutsch, Produktvorschlag | Französisch, Produktvorschlag |
| --- | --- | --- |
| `NEW-YEAR` | Neujahr | Nouvel An |
| `EPIPHANY` | Heilige Drei Könige | Épiphanie |
| `ST-JOSEPH` | Josefstag | Saint-Joseph |
| `EASTER-MONDAY` | Ostermontag | Lundi de Pâques |
| `MAY1` | Tag der Arbeit | Fête du travail |
| `ASCENSION` | Auffahrt | Ascension |
| `WHIT-MONDAY` | Pfingstmontag | Lundi de Pentecôte |
| `CORPUS-CHRISTI` | Fronleichnam | Fête-Dieu |
| `ST-PETER-PAUL` | Peter und Paul | Saints Pierre et Paul |
| `NATIONAL-DAY` | Bundesfeiertag | Fête nationale |
| `ASSUMPTION` | Mariä Himmelfahrt | Assomption |
| `ALL-SAINTS` | Allerheiligen | Toussaint |
| `IMMACULATE-CONCEPTION` | Mariä Empfängnis | Immaculée Conception |
| `CHRISTMAS` | Weihnachten | Noël |
| `ST-STEPHEN` | Stephanstag | Saint-Étienne |

Für die acht TI-Feiertage ausserhalb der gemeinsamen GR-/Bundesliste wurden im begrenzten Zusatzabgleich keine ausreichenden aktuellen RG-Nachweise gesichert: Epiphanie, Josefstag, 1. Mai, Fronleichnam, Peter und Paul, Mariä Himmelfahrt, Allerheiligen und Mariä Empfängnis. Ihre RG-Werte bleiben offen, sofern nicht ein separat dokumentierter belastbarer Sprachbeleg hinzukommt. Historische oder dialektale Fundstücke wurden nicht als heutige Rumantsch-Grischun-Bezeichnungen übernommen. Für gemeinsame Feiertage sind die gesondert erhobenen GR-/Bundes-Sprachbelege zu verwenden, nicht eine vermeintliche Tessiner RG-Normfassung.

Der rätoromanische Kantonsname **Tessin** ist dagegen amtlich belegt durch die Überschrift der [Parlamentsseite «Commembers dal Cussegl naziunal: chantun Tessin»](https://www.parlament.ch/rm/organe/cussegl-naziunal/commembers-tenor-chantuns/Commembers-cussegl-naziunal-chantun-tessin). Zusätzlich verwendet die [Tessiner Staatskanzlei, Foederalismus 2011, Preschentaziun, Abschnitt Infurmaziuns generalas](https://www4.ti.ch/generale/foederalismus11/rumantsch/foederalismus/preschentaziun) diese Bezeichnung. Beide Seiten wurden am 13.09.2026 geöffnet. Es handelt sich um Sprachbelege, nicht um Feiertagsnormen oder zeitliche Geltungsnachweise.

## 6. Ergebnis und verbleibende Freigabeschritte

Die amtliche TI-Erhebung ist als Quellenentwurf vollständig: 15 Feiertage, 9/6-Arbeitsrechtsklassen, 30 amtlich abgeglichene Kalenderdaten und 15 rechnerische Daten für 2028. Die LPAmm-Zuordnung ist mit ihren gesetzlichen Anwendungsgrenzen dokumentiert. Bei Auslieferung der V0.7 blieben die bezeichneten RG-Namen leer. Die getrennte Fachabnahme und spätere Verfahrens-/Betriebsfreigabe bleiben offen. Dieses Dokument autorisiert keinen Export, keine Änderung an produktiven Fristenprofilen und keine stillschweigende Schliessung offener Fachfragen.

## 7. Ergänzung auf Nutzerwunsch: V0.8

David Steimer wünscht anschliessend die Verwendung provisorischer Übersetzungen für die acht fehlenden RG-Namen. Die [Sprachergänzung V0.8](sprachergänzung-ap18b-02-rg.md) dokumentiert die verwendeten Werte, sechs Sprachbelege und zwei eigene Vorschläge. Damit sind diese Namensfelder befüllt. Die Kennzeichnung als provisorische Produktübersetzung bleibt erhalten. Die obige Beschreibung der leeren Felder dokumentiert den früheren V0.7-Erfassungsstand und ist kein Verbot der nun ausdrücklich gewünschten Ergänzung.
