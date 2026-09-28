# AP19A · Quellenpaket ELG und AVIG

| Merkmal | Stand |
| --- | --- |
| Fassung / Recherche | Fachentwurf 0.1 vom 25. September 2026, Abrufe am selben Tag |
| Status | Nicht fachlich abgenommen. Keine Produktintegration, keine nationale oder bernische Betriebsfreigabe |
| Leitplanke | Bundesregeln kantonsneutral, kantonale Anbindung separat. Erste vorgesehene Produktfreigabe nur für fachlich geprüfte Berner Konstellationen |
| Referenzen | [AP17B](vrpg-anwendbarkeit-ap17b.md), [AP17C](quellenabgleich-ap17c.md). Deren bestehende Abnahmen werden nicht erweitert |

## 1. Ergebnis und bewusster Umfang

Für ELG und AVIG sind je vier weitere prozessuale Tagesfristenpfade fachlich begründbar: Einsprache, ordentliche Beschwerde gegen den Einspracheentscheid, angeordnete Tagesfrist im Verwaltungsverfahren und qualifizierte gerichtliche Tagesnachfrist zur Beschwerdeverbesserung. Die bloss gleiche Zahl von 30 Tagen ersetzt keine Anwendbarkeitsprüfung.

**ELG:** Erfasst werden individuelle Leistungen nach dem zweiten Kapitel, also jährliche Ergänzungsleistungen und die Vergütung von Krankheits- und Behinderungskosten. Kantonal konkretisierte Krankheitskosten nach ELG Artikel 14 bleiben Bundes-EL und sind nicht allein wegen ihrer kantonalen Finanzierung ausgeschlossen. Eigenständige kantonale Mehrleistungen nach ELG Artikel 2 Absatz 2 werden dagegen nicht automatisch in dieses Modell aufgenommen. Leistungen gemeinnütziger Institutionen nach dem dritten Kapitel unterstehen nur ATSG Artikel 32 und 33, nicht dem vollständigen ATSG-Verfahrensregime. [ELG Artikel 1 bis 3, 14 und 16][ELG].

**AVIG:** Für die erste Tranche wird der Sachbereich bewusst auf die individuelle **Arbeitslosenentschädigung** begrenzt. Auch eine leistungsbezogene Einstellungsverfügung gehört dazu. Kurzarbeits-, Schlechtwetter- und Insolvenzentschädigung sowie weitere individuelle arbeitsmarktliche Leistungen werden als gesondert qualifizierbare Unterbereiche vorgemerkt, aber nicht unter einer Sammelbezeichnung implizit aktiviert. Das ist eine konservative Produktgrenze, keine Behauptung, das ATSG gelte dort generell nicht. Beiträge an kollektive arbeitsmarktliche Massnahmen sind hingegen durch AVIG Artikel 1 Absatz 3 gesetzlich weitgehend vom ATSG ausgenommen. [AVIG Artikel 1][AVIG].

Der Entwurf behandelt prozessuale Fristen für bereits qualifizierte Handlungen. Materielle Anspruchs-, Melde-, Kontroll- und Verwirkungsfristen werden nicht durch `SOC-30` oder `SOC-DAYS` berechnet. Dazu gehören etwa die 15 Monate für die Geltendmachung von Krankheitskosten, die drei Monate zur Geltendmachung von Arbeitslosenentschädigung und der monatliche Nachweis persönlicher Arbeitsbemühungen. [ELG Artikel 15][ELG], [AVIG Artikel 20 Absatz 3][AVIG], [AVIV Artikel 26 Absatz 2][AVIV].

## 2. Nationale Normenkette und acht Kandidatenpfade

Das Eintrittstor ist jeweils ATSG Artikel 2 in Verbindung mit ELG Artikel 1 Absatz 1 beziehungsweise AVIG Artikel 1 Absatz 1. Das schweizweite Fristmodell enthält weder «Bern» als versteckte Konstante noch einen fest verdrahteten Berner Feiertagskalender. [ATSG][ATSG], [ELG][ELG], [AVIG][AVIG].

| Fach-ID, noch keine Laufzeit-ID | Handlung / Stadium | Erforderlicher Auslöser | Profil und Normspur |
| --- | --- | --- | --- |
| `SOC-EL-OBJ` | Einsprache / Verwaltung | Erstinstanzliche EL-Leistungsverfügung, keine prozess- oder verfahrensleitende Verfügung | `SOC-30`, ELG 1 Absatz 1, ATSG 2, 52 Absatz 1 und 38–40 |
| `SOC-EL-APP` | Ordentliche Beschwerde / Versicherungsgericht | EL-Einspracheentscheid | `SOC-30`, ELG 1 Absatz 1, ATSG 2, 56, 58, 60 und 38–41 |
| `SOC-EL-ADM` | Angeordnete Tagesfrist / Verwaltung | Konkrete verfahrensrechtliche Anordnung im EL-Leistungsverfahren mit Anzahl Tagen | `SOC-DAYS`, ELG 1 Absatz 1, ATSG 2 und 38–40 |
| `SOC-EL-CORRECTION` | Nachfrist zur Beschwerdeverbesserung / Versicherungsgericht | Gerichtliche Anordnung zur Behebung formeller Beschwerdemängel mit Tagesdauer | `SOC-DAYS`, ELG 1 Absatz 1, ATSG 2, 60 Absatz 2, 61 Buchstabe b und 38–41, enger Rechtsprechungsbeleg unten |
| `SOC-ALV-OBJ` | Einsprache / Verwaltung | Erstinstanzliche Verfügung über individuelle Arbeitslosenentschädigung | `SOC-30`, AVIG 1, 100 Absätze 1 und 2, ATSG 2, 52 Absatz 1 und 38–40 |
| `SOC-ALV-APP` | Ordentliche Beschwerde / Versicherungsgericht | Entsprechender Einspracheentscheid, kein Bundesrechtsweg nach AVIG 101 | `SOC-30`, AVIG 1, 100 Absatz 3, ATSG 2, 56, 60 und 38–41. Zuständigkeitsanker AVIV 128 in Verbindung mit 119 |
| `SOC-ALV-ADM` | Angeordnete Tagesfrist / Verwaltung | Konkrete prozessuale Anordnung im Verfahren über individuelle Arbeitslosenentschädigung mit Anzahl Tagen | `SOC-DAYS`, AVIG 1, ATSG 2 und 38–40. Keine Umdeutung gesetzlicher Kontrollpflichten |
| `SOC-ALV-CORRECTION` | Nachfrist zur Beschwerdeverbesserung / Versicherungsgericht | Gerichtliche Anordnung zur Behebung formeller Beschwerdemängel mit Tagesdauer | `SOC-DAYS`, AVIG 1, ATSG 2, 60 Absatz 2, 61 Buchstabe b und 38–41, enger Rechtsprechungsbeleg unten |

Die Profile bezeichnen den Fachvertrag aus AP17B. Sie erteilen keine automatische Aktivierung der acht neuen Pfade. Beschwerde gegen Zwischenverfügung, Rechtsverweigerung, Rechtsverzögerung, Revision, Wiederherstellung und Rechtsmittel an Bundesgerichte bleiben ausserhalb dieser Zuordnungen.

### Gemeinsame Zählung und harte Voraussetzungen

- 30 Tage sind gesetzlich vorgegeben, nicht frei veränderbar. Bei `SOC-DAYS` muss die tatsächlich angeordnete Tagesdauer vorliegen. Fixdatum, Uhrzeit und Monatsfrist bleiben ausserhalb des Tagesrechners.
- Der Lauf beginnt am Tag nach der rechtlich massgebenden Mitteilung. Gesetzliche und behördliche Tagesfristen ruhen in den ATSG-Stillstandsperioden. Fällt das Ende auf Samstag, Sonntag oder einen anerkannten Feiertag, folgt die Verschiebung auf den nächsten Werktag. [ATSG Artikel 38][ATSG].
- Feiertagsanknüpfung ist das Recht am Wohnsitz oder Sitz der Partei oder ihrer Vertretung, nicht automatisch der Kanton des Versicherungsträgers oder Gerichts. Anknüpfungsorte und Behördenkanton sind unabhängige Modellangaben. Eine noch nicht aufgelöste Orts- oder Kalenderregel sperrt die Berechnung.
- Ungeklärte Eröffnung, Empfang durch die falsche Person, streitige Zustellfiktion oder unklare Vertretung werden nicht durch ein eingegebenes Briefdatum geheilt. Eine fachlich belastbare Eröffnung ist erforderlich. Kein pauschales Bestätigungsfeld und keine automatische Wahrheit aus gespeicherten Defaults.
- Vor einer Berner Aktivierung bleiben ausserkantonale beziehungsweise ungeklärte Feiertagsanknüpfungen gesperrt, solange deren verfahrensbezogene Auflösung nicht separat geprüft wurde. Das nationale Modell enthält sie als unabhängige Erweiterungsdimension.

**Enge gerichtliche Ausnahme:** [BGer 8C_767/2008 vom 12. Januar 2009, E. 4.3.2][CORRECTION] trägt die Anwendung der ATSG-Fristbestimmungen auf die Nachfrist zur Behebung formeller Beschwerdemängel, konkret eine fehlende Vollmacht. Der Entscheid lässt die generelle Anwendung auf sämtliche Fristen im kantonalen Rechtsmittelverfahren ausdrücklich offen. Deshalb bleiben Replik, Stellungnahme, Kostenvorschuss und andere gerichtliche Handlungen ohne eigenständigen Nachweis gesperrt. Die Übertragung des bundesrechtlichen Nachfristprinzips auf die qualifizierten ELG-/AVIG-Beschwerden ist eine begründete Modellableitung, kein eigener ELG-/AVIG-Einzelfallentscheid.

## 3. Besondere Gates für ELG und AVIG

| Gate | Fachlicher Befund | Konsequenz im Modell |
| --- | --- | --- |
| EL-Bundesleistung oder kantonale Zusatzleistung | ELG Artikel 1 und 2 unterscheiden Geltungsbereiche. Die durch Kantone nach Artikel 14 konkretisierten Bundes-EL sind nicht pauschal Zusatzleistungen | Sachbereich muss qualifiziert sein. Unbekannt, gemischt oder rein kantonal → keine automatische ATSG-Zuordnung |
| EL-Verwaltung und Gericht | ELG Artikel 21 regelt Festsetzung und Auszahlung. Gerichtszuständigkeit folgt separat ATSG Artikel 58. Bei Heimeintritt können die Kantone auseinanderfallen | Keine Ableitung «Verfügung AKB = Verwaltungsgericht Bern». Eigenständige Zuständigkeitsprüfung für Beschwerde und gerichtliche Nachfrist |
| AVIG-Dokumenttyp | AVIG Artikel 100 Absatz 1 lässt in vielen Fällen das formlose Verfahren zu. Eine Leistungsabrechnung ist nicht allein aufgrund ihres Datums eine Erstverfügung | Nur fachlich qualifizierte Verfügung löst den Einsprachepfad aus. Verlangen einer Verfügung ist ein eigener, noch nicht modellierter Schritt |
| AVIG-Einspracheinstanz | AVIG Artikel 100 Absatz 2 erlaubt kantonale Übertragung der Einsprachen gegen RAV-Verfügungen | Instanz ist Teil der kantonalen Anbindung. Nicht ungeprüft den Absender oder ein RAV als Einspracheadressaten einsetzen |
| AVIG-Gericht | AVIG Artikel 100 Absatz 3 und AVIV Artikel 128 enthalten besondere Zuständigkeitsregeln. Bei Kassenverfügungen verweist Artikel 128 Absatz 1 auf Artikel 77 und 119, bei kantonalen Amtsstellen auf denselben Kanton | Für die erste ALE-Tranche ist insbesondere AVIV Artikel 119 Absatz 1 Buchstabe a relevant. Kein allgemeiner Wohnsitzautomatismus nach ATSG 58 und keine Ableitung allein aus dem Kassensitz |
| AVIG-Bundesinstanz | AVIG Artikel 101 führt Entscheide des SECO und der Ausgleichsstelle an das Bundesverwaltungsgericht | Vom Berner Kandidaten ausgeschlossen, auch wenn die Partei in Bern wohnt |
| AVIG-Sonderbereiche | Kollektive AMM-Beiträge sind vom vollen ATSG ausgenommen. Kantonale AMM können eigenständiges kantonales Recht betreffen | Keine Aktivierung bloss aufgrund der Oberkategorie «Arbeitslosigkeit» |

Die EL-Trennung zwischen Verwaltungs- und Gerichtszuständigkeit wird ausdrücklich bestätigt durch [BGE 149 V 169, E. 5.2.1][EL-COURT]. Die in ELG Artikel 21 enthaltene fortbestehende kantonale Verwaltungszuständigkeit nach Heimeintritt bestimmt den Gerichtsstand nicht. Die konkrete Ermittlung von Wohnsitz, Parteirolle und zuständigem Gericht bleibt ausserhalb eines blossen Tagesrechners.

## 4. Berner Anbindung, separat vom Bundesmodell

| Teil | Berner Zuordnung und Begrenzung |
| --- | --- |
| EL-Verwaltung | EG ELG Artikel 8 überträgt den Vollzug der Ausgleichskasse des Kantons Bern. Artikel 9 regelt ergänzendes Organisationsrecht. Für eine Einsprache gilt die qualifizierte Verfügung und ATSG Artikel 52, nicht ein frei angenommener kantonaler Fristenlauf |
| EL-Gericht | Berner Gerichtszuordnung nur bei geklärter Zuständigkeit nach ATSG Artikel 58. EG ELG Artikel 8 allein genügt nicht |
| ALV-Verwaltung / Gericht | AMG Artikel 35 Absätze 1 und 2 nennt für seinen Geltungsbereich Einsprache bei der verfügenden Stelle und Beschwerde an das Verwaltungsgericht mit je 30 Tagen. Bundesrechtliche Anwendbarkeit und besondere örtliche Zuständigkeit bleiben vorrangig. Artikel 35 Absatz 3 zu kantonalen AMM ist kein Freipass für den AVIG-Kandidaten |
| Gerichtsorganisation | GSOG Artikel 54 Absatz 1 Buchstaben a und c trennt die sozialversicherungsrechtliche Abteilung und die Abteilung für französischsprachige Geschäfte. Sprachwahl darf weder Fristdauer noch Kalenderanknüpfung verändern |

Quellen: [EG ELG][EG-ELG], [AMG][AMG], [GSOG][GSOG]. Die Beschriftung «Sitz der zuständigen Stelle» bleibt kompatibel. Dieses Quellenpaket entwirft weder neue Dropdowns noch eine automatische Zuständigkeitsberatung.

## 5. Nachweis und zeitliche Grenzen

| Quelle / amtlicher Primärlink | Gelesener Konsolidierungsstand | Artikel / Abrufweg |
| --- | --- | --- |
| [ATSG][ATSG] | 01.01.2024 | 2, 38, 40, 52, 56, 58, 60 und 61 aktuell über Swiss-Caselaw-Fedlex-Spiegel gelesen. Artikel 39 und 41 als unveränderte Kontextnormen aus AP17C, kein neuer Anspruch auf Prüfung der Fristwahrung oder Wiederherstellung |
| [ELG][ELG] | 01.01.2026 | 1, 2, 3, 14, 15, 16 und 21 über Fedlex-Spiegel. Artikel 14 als Sachbereichsgrenze, keine Prüfung materieller Leistungsberechnung |
| [AVIG][AVIG] | 01.01.2026 | 1, 20, 100 und 101 über Fedlex-Spiegel |
| [AVIV][AVIV] | 01.08.2026 | 26, 77, 119 und 128 über Fedlex-Spiegel |
| [EG ELG][EG-ELG] | 01.01.2025, BELEX Version 3072 | 8 und 9 über LexFind-Spiegel sowie vollständig zugängliches amtliches PDF gegengeprüft |
| [AMG][AMG] | 01.09.2026 laut LexFind-Spiegel | 35 aktuell über Spiegel gelesen. Amtliche dynamische Oberfläche ohne auslesbaren Text |
| [GSOG][GSOG] | 01.05.2026 laut LexFind-Spiegel | 54 über Spiegel gelesen. Amtliche dynamische Oberfläche ohne auslesbaren Text |
| [BGer 8C_767/2008, E. 4.3.2][CORRECTION] | Entscheid vom 12.01.2009 | Erwägung vollständig über Swiss Caselaw gelesen, Identität zusätzlich über Entscheidsuche geprüft. Amtlicher Direktabruf technisch nicht verfügbar |
| [BGE 149 V 169, E. 5.2.1][EL-COURT] | Entscheid vom 04.10.2023 | Amtliche Gerichtspublikation und vollständige Erwägung im Recherchezugang gelesen |

Die Recherchezugänge Swiss Caselaw und Entscheidsuche sind nicht selbst amtliche Erlasspublikationen. Quelle und Abrufweg bleiben deshalb getrennt. Die beiden konkreten Rechtsprechungsableitungen wurden ergänzend mit einem automatischen quellengestützten Claim-Audit geprüft, beide als gestützt zurückgemeldet. Das ersetzt keine menschliche Fachabnahme und ist kein vollständiger Nachweis fehlender neuerer Rechtsprechung.

**Ergänzender Originalabgleich am selben Tag:** Die im [Bundesrechtsinventar, Abschnitt 5](sozialversicherungsinventar-ap19a.md#5-quellenprüfung-und-zeitgrenzen) bezeichneten ATSG-, ELG-, AVIG- und AVIV-Artikel wurden anschliessend auch direkt im amtlichen Fedlex-XML gegengelesen. Dazu gehören nun auch ATSG Artikel 39 und 41 als Abgrenzung, ohne neue Berechnungsfunktion für Eingabewahrung oder Wiederherstellung. Die obige Tabelle hält die ursprünglichen Recherchewege fest. Die verbleibenden kantonalen Abrufgrenzen werden durch den Bundesrechtsabgleich nicht geschlossen.

Der Spiegel weist für ELG Folgekonsolidierungen zum 01.01.2027, 01.01.2028 und 01.01.2029 sowie für AVIV zum 01.01.2027 und 01.02.2027 aus. Deren Auswirkungen wurden in diesem Einstiegspaket noch nicht artikelweise verglichen. **Eine zeitliche Freigabe für 2027 oder spätere Jahre wird hier nicht erteilt.** Vor der Integration müssen die relevanten Originalfassungen, ihr zeitlicher Geltungsbereich und der vorgesehene Produktzeitraum gebunden werden.

## 6. Fachreferenzanforderungen für AP19B vor der Integration

- Je ein positiver Fall für alle acht Pfade mit explizit qualifiziertem Dokument, Stadium, Zuständigkeit und rechtlicher Eröffnung.
- Gegenfälle: bloss formlose ALV-Abrechnung, direkte Beschwerde gegen gewöhnliche Erstverfügung, unbekannte EL-Mehrleistung, gemeinnützige EL-Leistung, kollektive AMM, kantonale AMM, AVIG-Bundesinstanz, materielle Anspruchsfrist, Fixtermin und allgemeine Gerichtsfrist.
- Nationale Modellprobe EL: Verwaltungszuständigkeit bleibt nach Heimeintritt im bisherigen Kanton, Gerichtszuständigkeit wird separat bestimmt. Ein abweichender Gerichtskanton erhält keine Berner Freigabe.
- Nationale Modellprobe AVIG: Kassensitz, Kontrollort, Partei-/Vertretungsort und Gerichtskanton dürfen voneinander abweichen. Unbekannte Zuordnung sperrt statt auf ATSG-Wohnsitz oder Bern zurückzufallen.
- Eine technische Rechnung mit anderem Kantonskalender darf als Modellprobe möglich sein, aber keine Produktfreigabe auslösen. Rechtsmodell, Kalenderauflösung und Freigabe sind getrennte Prüfobjekte.
- Ein offener Zukunftsabgleich, eine ungeklärte Eröffnung oder ein nicht abgedeckter Feiertagsgeltungsbereich führt zu einer expliziten Sperre. Kein stiller Standardwert darf diese übergehen.

Die acht Pfade sind ein Fachvorschlag, kein Versprechen vollständiger ELG-/AVIG-Abdeckung. David Steimer entscheidet über Fachabnahme und Umfang. Codex verantwortet keine formelle Rechtsfreigabe.

[ATSG]: https://www.fedlex.admin.ch/eli/cc/2002/510/20240101/de
[ELG]: https://www.fedlex.admin.ch/eli/cc/2007/804/20260101/de
[AVIG]: https://www.fedlex.admin.ch/eli/cc/1982/2184_2184_2184/20260101/de
[AVIV]: https://www.fedlex.admin.ch/eli/cc/1983/1205_1205_1205/20260801/de
[EG-ELG]: https://www.belex.sites.be.ch/api/de/versions/3072/pdf_file
[AMG]: https://www.belex.sites.be.ch/app/de/texts_of_law/836.11
[GSOG]: https://www.belex.sites.be.ch/app/de/texts_of_law/161.1
[CORRECTION]: https://mcp.opencaselaw.ch/entscheid/bger_8C_767_2008#e-4-3-2
[EL-COURT]: https://relevancy.bger.ch/cgi-bin/JumpCGI?id=BGE-149-V-169&lang=fr
