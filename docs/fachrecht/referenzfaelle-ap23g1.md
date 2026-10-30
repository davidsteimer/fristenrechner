# AP23G1 Forschungsreferenzfälle für Uri Solothurn und Schaffhausen

Stand 22. Oktober 2026. **Fachlicher Abnahmevorschlag, keine Produktprüfung oder operative Freigabe.**

16 Forschungsgruppen und 115 Fälle. 70 Datumssollwerte, 7 offene Endverschiebungsfälle, 34 vorgeschlagene Qualifikationsgrenzen und 4 Fenstergrenzen. 0 Abweichungen von den vorgegebenen Erwartungen.

Alle positiven Fälle sind ausdrücklich synthetisch vollständig qualifiziert. Die gemeinsamen Fakten in der Fixture sind Forschungsannahmen, keine Benutzerdefaults. Das massgebende Eröffnungsdatum ist bekannt. Zustellfiktion und die Bewertung gewöhnlicher Postzustellung werden hier nicht neu berechnet.

## Reproduktion und Unabhängigkeit

`node scripts/check-ap23g1-references.mjs` prüft die vorgegebenen Erwartungen. `--write` erzeugt nur diese Tabelle und den eigenen Forschungsbericht. `python scripts/check_ap23g1_independent.py` prüft dieselben Vorgaben mit einer getrennten Python-Implementierung und datumsbasierter Enumeration. Beide importieren weder Produktrechner noch Releasekalender. Gemeinsame Rechtsparameter bleiben eine fachlich abzunehmende Grundlage, keine durch zwei Programme bewiesene Rechtsauslegung.

Fixture SHA-256: `3aa2cc7a3ffaacee3f5ac22bf5c4cce9f9227f5461b7de99f5a34dbea114726f`. Node-Checker SHA-256: `3546e856b89d251fa35b8a2381cea744b1959c3df43f42cc3df0ae0baf8403ba`. Der getrennte Python-Nachweis steht in [independent-verification.json](../../outputs/ap23g1-2026-10-22/independent-verification.json).

## Forschungsgruppen

| Gruppe | Stufe | Tage | Feiertagsbindung | Stillstand |
| --- | --- | ---: | --- | --- |
| UR-ADMIN-20 | administration | 20 | UR-LSG-CORE, targetAuthoritySeat | Keiner |
| UR-COURT-20 | court | 20 | UR-LSG-CORE, targetAuthoritySeat | Drei Perioden |
| UR-ADMIN-ORDERED | administration | angeordnet | UR-LSG-CORE, targetAuthoritySeat | Keiner |
| UR-COURT-ORDERED | court | angeordnet | UR-LSG-CORE, targetAuthoritySeat | Drei Perioden |
| UR-ADMIN-REASONS-10 | administration | 10 | UR-LSG-CORE, issuingAuthoritySeat | Keiner |
| SO-ADMIN-10 | administration | 10 | SO-PROCEDURAL, targetAuthoritySeat | Keiner |
| SO-COURT-10 | court | 10 | SO-PROCEDURAL, targetAuthoritySeat | Drei Perioden |
| SO-ADMIN-ORDERED | administration | angeordnet | SO-PROCEDURAL, targetAuthoritySeat | Keiner |
| SO-COURT-ORDERED | court | angeordnet | SO-PROCEDURAL, targetAuthoritySeat | Drei Perioden |
| SO-ADMIN-REASONS-10 | administration | 10 | SO-PROCEDURAL, issuingAuthoritySeat | Keiner |
| SH-ADMIN-20 | administration | 20 | SH-VRG-PRACTICE, targetAuthoritySeat | Keiner |
| SH-COURT-20 | court | 20 | SH-VRG-PRACTICE, courtSeat | Drei Perioden |
| SH-ADMIN-ORDERED | administration | angeordnet | SH-VRG-PRACTICE, targetAuthoritySeat | Keiner |
| SH-COURT-ORDERED | court | angeordnet | SH-VRG-PRACTICE, courtSeat | Drei Perioden |
| SH-ADMIN-REASONS-10 | administration | 10 | SH-VRG-PRACTICE, issuingAuthoritySeat | Keiner |
| SH-COURT-REASONS-30 | court | 30 | SH-VRG-PRACTICE, courtSeat | Drei Perioden |

Die drei Perioden sind Ostern minus sieben bis plus sieben Tage, 15. Juli bis 15. August und 18. Dezember bis 2. Januar, je einschliesslich. Wochenenden und Feiertage innerhalb einer laufenden Frist zählen mit. Erst das Fristende wird verschoben. Ein erster Zähltag nach dem Stillstand kann Sonntag sein.

## Fälle

| Fall | Gruppe | Empfang | Tage | Sollwert oder vorgeschlagene Grenze | Zweck |
| --- | --- | --- | ---: | --- | --- |
| UR01 | UR-ADMIN-20 | 02.10.2026 | 20 | 22.10.2026 | Ordentliche Verwaltungsbeschwerde |
| UR02 | UR-COURT-20 | 02.10.2026 | 20 | 22.10.2026 | Ordentliche Verwaltungsgerichtsbeschwerde |
| UR03 | UR-ADMIN-ORDERED | 02.10.2026 | 10 | 12.10.2026 | Angeordnete Verwaltungseingabe |
| UR04 | UR-COURT-ORDERED | 02.10.2026 | 10 | 12.10.2026 | Angeordnete Gerichtseingabe |
| UR05 | UR-ADMIN-REASONS-10 | 02.10.2026 | 10 | 12.10.2026 | Begründung einer zulässig unbegründeten Verwaltungsverfügung verlangen |
| UR06 | UR-ADMIN-20 | 10.07.2027 | 20 | 30.07.2027 | Verwaltung ohne Sommerstillstand |
| UR07 | UR-COURT-20 | 10.07.2027 | 20 | 31.08.2027 | Vier Tage vor, sechzehn Tage nach Sommerstillstand |
| UR08 | UR-COURT-ORDERED | 20.07.2027 | 10 | 25.08.2027 | Gerichtliche Zustellung während Sommerstillstand |
| UR09 | UR-ADMIN-20 | 23.12.2026 | 20 | 12.01.2027 mit UR-Art.-22-Hinweis | Art22-Sollzeit, vorgeschlagene wirksame Eröffnung ohne zusätzliche Pause |
| UR10 | UR-COURT-20 | 23.12.2026 | 20 | 22.01.2027 mit UR-Art.-22-Hinweis | Art22-Hinweis und eigenständiger gerichtlicher Winterstillstand |
| UR11 | UR-ADMIN-REASONS-10 | 23.12.2026 | 10 | 04.01.2027 | Begründungsverlangen ohne Gerichtsferien. Allein aus der Vorstufe keinen Art22-Rechtsmittelauslöser fingieren |
| UR12 | UR-ADMIN-ORDERED | 05.01.2027 | 1 | 07.01.2027 | Heilige Drei Könige, keine ArG-Teilmenge als Ersatz |
| UR13 | UR-ADMIN-ORDERED | 18.03.2027 | 1 | 22.03.2027 | Josefstag und Wochenende, keine Verwaltungsferien |
| UR14 | UR-COURT-20 | 28.02.2027 | 20 | Offen: letzter Zähltag 20.03.2027, blosse Endverschiebung 22.03.2027 | Reine Wochenendverschiebung in neuen Osterstillstand |
| UR15 | UR-COURT-20 | 26.02.2027 | 20 | 18.03.2027 | Kontrollfall vor Josefstag und Osterstillstand |
| UR16 | UR-COURT-ORDERED | 20.03.2027 | 1 | 05.04.2027 | Beginn während Osterstillstand, keine reine Endverschiebung |
| UR17 | UR-ADMIN-ORDERED | 07.12.2026 | 1 | 09.12.2026 | Mariä Empfängnis |
| UR18 | UR-ADMIN-20 | 07.12.2026 | 20 | 28.12.2026 | Keine Verwaltungsferien, keine Art22-Eröffnung allein aus späterem Fristverlauf |
| UR19 | UR-ADMIN-ORDERED | 29.08.2026 | 1 | 31.08.2026 | Inklusive frühe Fenstergrenze |
| UR20 | UR-COURT-ORDERED | 30.12.2026 | 1 | 04.01.2027 | Erster Zähltag nach Winterstillstand ist Sonntag |
| UR21 | UR-ADMIN-20 | 20.03.2027 | 20 | 09.04.2027 mit UR-Art.-22-Hinweis | Oster-Sollrestriktion mit acht Tagen, keine 15-Tage-Pause in Verwaltung |
| UR22 | UR-ADMIN-ORDERED | 02.10.2026 | 10 | 12.10.2026 | Konkrete angeordnete Eingabedauer wird nicht automatisch zur längsten koordinierten Beschwerdefrist |
| UR23 | UR-ADMIN-20 | 16.10.2026 | 20 | 05.11.2026 | Neu begründete Verwaltungsverfügung nach erwiesen rechtzeitiger Begründungsanforderung |
| UR24 | UR-COURT-ORDERED | 01.03.2027 | 19 | Offen: letzter Zähltag 20.03.2027, blosse Endverschiebung 22.03.2027 | Kollision auch im angeordneten UR-Gerichtspfad |
| SO01 | SO-ADMIN-10 | 02.10.2026 | 10 | 12.10.2026 | Ordentliche Verwaltungsbeschwerde |
| SO02 | SO-COURT-10 | 02.10.2026 | 10 | 12.10.2026 | Ordentliche Verwaltungsgerichtsbeschwerde |
| SO03 | SO-ADMIN-ORDERED | 02.10.2026 | 10 | 12.10.2026 | Angeordnete Verwaltungseingabe |
| SO04 | SO-COURT-ORDERED | 02.10.2026 | 10 | 12.10.2026 | Angeordnete Gerichtseingabe |
| SO05 | SO-ADMIN-10 | 10.07.2027 | 10 | 20.07.2027 | Verwaltungsbeschwerde ohne Sommerstillstand |
| SO06 | SO-COURT-10 | 10.07.2027 | 10 | 23.08.2027 | Gerichtsbeschwerde mit Sommerstillstand und Endwochenende |
| SO07 | SO-ADMIN-ORDERED | 20.07.2027 | 10 | 30.07.2027 | Angeordnete Verwaltungsfrist läuft im Sommer |
| SO08 | SO-COURT-ORDERED | 20.07.2027 | 10 | 25.08.2027 | Angeordnete Gerichtsfrist mit Sommerstillstand |
| SO09 | SO-ADMIN-ORDERED | 26.05.2027 | 1 | 28.05.2027 | Fronleichnam in eigener Prozessliste, auch ohne regionale Ruhetagsabfrage |
| SO10 | SO-ADMIN-ORDERED | 29.10.2027 | 3 | 02.11.2027 | Allerheiligen in ganzer Prozessliste |
| SO11 | SO-ADMIN-ORDERED | 30.04.2027 | 1 | 03.05.2027 | Ganzer prozessualer 1.Mai und Wochenende |
| SO12 | SO-ADMIN-ORDERED | 14.08.2027 | 1 | 16.08.2027 | Mariä Himmelfahrt, hier zugleich Sonntag |
| SO13 | SO-ADMIN-ORDERED | 07.12.2026 | 1 | 08.12.2026 | Kein Mariä Empfängnis aus allgemeiner regionaler Liste hinzumischen |
| SO14 | SO-ADMIN-ORDERED | 24.12.2026 | 1 | 28.12.2026 | Weihnachten, Stephanstag und Sonntag |
| SO15 | SO-ADMIN-ORDERED | 14.12.2026 | 10 | 24.12.2026 | Verwaltung ohne Winterstillstand, Heiligabend kein zusätzlicher Feiertag |
| SO16 | SO-COURT-ORDERED | 14.12.2026 | 10 | 11.01.2027 | Gerichtliche Resttagezählung über Winterstillstand |
| SO17 | SO-COURT-10 | 10.03.2027 | 10 | Offen: letzter Zähltag 20.03.2027, blosse Endverschiebung 22.03.2027 | Eigener SO-Vorschlag für Endverschiebung in Osterstillstand |
| SO18 | SO-COURT-10 | 09.03.2027 | 10 | 19.03.2027 | Kontrollfall, Josefstag steht nicht in SO-Prozessliste |
| SO19 | SO-COURT-ORDERED | 20.03.2027 | 1 | 05.04.2027 | Echter Beginn während Osterstillstand |
| SO20 | SO-COURT-ORDERED | 30.12.2026 | 1 | 04.01.2027 | Erster Zähltag darf Sonntag sein |
| SO21 | SO-ADMIN-ORDERED | 01.01.2027 | 1 | 04.01.2027 | 2.Januar und Wochenende, keine erfundene Ersatzfeiertagsregel |
| SO22 | SO-ADMIN-REASONS-10 | 02.10.2026 | 10 | 12.10.2026 | §21bisAbs1c, ausdrücklich angebotene Begründung einer zulässig unbegründeten Verwaltungsverfügung verlangen |
| SO23 | SO-ADMIN-REASONS-10 | 23.12.2026 | 10 | 04.01.2027 | Begründungsverlangen ohne gerichtliche Winterferien |
| SO24 | SO-ADMIN-10 | 16.10.2026 | 10 | 26.10.2026 | Neuer vollständiger Lauf ab tatsächlich zugestellter Begründung nach rechtzeitigem Gesuch, kein Restlauf seit Dispositiv |
| SO25 | SO-COURT-ORDERED | 10.03.2027 | 10 | Offen: letzter Zähltag 20.03.2027, blosse Endverschiebung 22.03.2027 | Kollision auch im angeordneten SO-Gerichtspfad |
| SH01 | SH-ADMIN-20 | 02.10.2026 | 20 | 22.10.2026 | Ordentlicher Rekurs |
| SH02 | SH-COURT-20 | 02.10.2026 | 20 | 22.10.2026 | Ordentliche Verwaltungsgerichtsbeschwerde |
| SH03 | SH-ADMIN-ORDERED | 02.10.2026 | 10 | 12.10.2026 | Angeordnete Verwaltungseingabe |
| SH04 | SH-COURT-ORDERED | 02.10.2026 | 10 | 12.10.2026 | Angeordnete Gerichtseingabe |
| SH05 | SH-ADMIN-REASONS-10 | 02.10.2026 | 10 | 12.10.2026 | Art8Abs3b, selbständiges Verwaltungsbegründungsverlangen |
| SH06 | SH-COURT-REASONS-30 | 02.10.2026 | 30 | 02.11.2026 | Art47Abs2, dreissig Tage statt zehn Tage nach ZPO239 |
| SH07 | SH-ADMIN-20 | 10.07.2027 | 20 | 30.07.2027 | Verwaltung ohne Sommerstillstand |
| SH08 | SH-COURT-20 | 10.07.2027 | 20 | 31.08.2027 | Gericht mit Sommerstillstand |
| SH09 | SH-COURT-REASONS-30 | 20.07.2027 | 30 | 14.09.2027 | Gerichtliches Begründungsverlangen mit eigenem Sommerstillstand |
| SH10 | SH-ADMIN-REASONS-10 | 20.07.2027 | 10 | 30.07.2027 | Verwaltungsbegründungsverlangen ohne Sommerstillstand |
| SH11 | SH-ADMIN-20 | 10.12.2026 | 20 | 30.12.2026 | Schalterschliessung und Winterzeit sind keine Verwaltungsgerichtsferien |
| SH12 | SH-COURT-20 | 10.12.2026 | 20 | 15.01.2027 | Gerichtsbeschwerde mit Winterstillstand |
| SH13 | SH-COURT-REASONS-30 | 10.12.2026 | 30 | 25.01.2027 | Gerichtliche Dreissigtageshandlung über Winterstillstand |
| SH14 | SH-COURT-ORDERED | 30.12.2026 | 1 | 04.01.2027 | Erster Zähltag ist Sonntag |
| SH15 | SH-ADMIN-ORDERED | 31.12.2026 | 1 | 04.01.2027 | Neujahr, Berchtoldstag und Wochenende |
| SH16 | SH-ADMIN-ORDERED | 26.05.2027 | 1 | 27.05.2027 | Kein Fronleichnam aus dem Parteiort hinzumischen |
| SH17 | SH-ADMIN-ORDERED | 30.04.2027 | 1 | 03.05.2027 | 1.Mai und Wochenende |
| SH18 | SH-COURT-20 | 28.02.2027 | 20 | Offen: letzter Zähltag 20.03.2027, blosse Endverschiebung 22.03.2027 | Eigener SH-Vorschlag für reine Endverschiebung in neuen Stillstand |
| SH19 | SH-COURT-20 | 27.02.2027 | 20 | 19.03.2027 | Kontrollfall, kein Josefstag in SH |
| SH20 | SH-COURT-ORDERED | 20.03.2027 | 1 | 05.04.2027 | Tatsächlicher Beginn während Osterstillstand |
| SH21 | SH-ADMIN-REASONS-10 | 23.12.2026 | 10 | 04.01.2027 | Verwaltungsbegründung ohne Winterstillstand |
| SH22 | SH-COURT-REASONS-30 | 23.12.2026 | 30 | 01.02.2027 | Rechtlich qualifiziertes Dispositiv, nicht mit Rekurs zwanzig Tage verwechseln |
| SH23 | SH-ADMIN-20 | 02.11.2026 | 20 | 23.11.2026 | Endsonntag wird verschoben |
| SH24 | SH-COURT-20 | 23.12.2026 | 20 | 22.01.2027 | Nach neu begründet eröffnetem Verwaltungsentscheid und erwiesen rechtzeitiger Anforderung, nicht nach SH-Obergerichtsurteil |
| SH25 | SH-COURT-ORDERED | 10.03.2027 | 10 | Offen: letzter Zähltag 20.03.2027, blosse Endverschiebung 22.03.2027 | Kollision auch im angeordneten SH-Gerichtspfad |
| SH26 | SH-COURT-REASONS-30 | 18.02.2027 | 30 | Offen: letzter Zähltag 20.03.2027, blosse Endverschiebung 22.03.2027 | Kollision auch beim dreissigtägigen SH-Begründungsverlangen |
| W01 | UR-ADMIN-ORDERED | 28.08.2026 | 1 | Ausserhalb des vollständigen Forschungsfensters | Empfang vor vollständigem Fenster |
| W02 | SO-ADMIN-ORDERED | 30.12.2027 | 1 | 31.12.2027 | Letzter gedeckter Endtag |
| W03 | SH-ADMIN-ORDERED | 31.12.2027 | 1 | Ausserhalb des vollständigen Forschungsfensters | Empfang gedeckt, Zähltag nicht mehr gedeckt |
| W04 | UR-COURT-ORDERED | 17.12.2027 | 1 | Ausserhalb des vollständigen Forschungsfensters | Winterstillstand führt aus dem Fenster |
| W05 | SH-COURT-20 | 16.12.2027 | 20 | Ausserhalb des vollständigen Forschungsfensters | Empfang reicht nicht zur Freigabe des ganzen Laufs |
| W06 | SO-ADMIN-ORDERED | 29.08.2026 | 1 | 31.08.2026 | Frühe Grenze einschliesslich Endverschiebung |
| N01 | UNKNOWN | 02.10.2026 | 20 | Qualifikationsgrenze: unknownResearchPath | Keine unbekannte Handlung raten |
| N02 | SO-COURT-10 | 02.10.2026 | 10 | Qualifikationsgrenze: stageDoesNotMatchPath | Verwaltung und Gericht nicht austauschbar |
| N03 | SH-COURT-REASONS-30 | 02.10.2026 | 30 | Qualifikationsgrenze: actionNotQualified | Begründungsverlangen ist kein Rechtsmittel |
| N04 | UR-ADMIN-20 | 02.10.2026 | 20 | Qualifikationsgrenze: targetOutsideScope | Kein pauschaler Ausbau auf kommunale Zielstellen |
| N05 | SH-COURT-20 | 02.10.2026 | 20 | Qualifikationsgrenze: holidayAnchorNotQualified | ZPO142Abs3 bindet den Gerichtsort, nicht Partei oder Vertretung |
| N06 | UR-ADMIN-20 | 02.10.2026 | 20 | Qualifikationsgrenze: openingNotQualified | Unbegründete Eröffnung gehört nicht direkt in den Zwanzigtagepfad |
| N07 | SO-COURT-10 | 02.10.2026 | 10 | Qualifikationsgrenze: specialLawNotExcluded | Keine neue ausserbernische Sozialfreigabe |
| N08 | UR-COURT-ORDERED | 02.10.2026 | 10 | Qualifikationsgrenze: materialPerformanceOutsideScope | Zahlung oder materielle Leistung ist keine Verfahrenseingabe |
| N09 | SO-ADMIN-ORDERED | 02.10.2026 | 10 | Qualifikationsgrenze: fixedDateOrDeviatingStart | Fixtermin nicht Tagesfrist |
| N10 | SH-ADMIN-ORDERED | 02.10.2026 | 10 | Qualifikationsgrenze: termChangeNeedsIndividualReview | Wiederherstellung nicht automatisch berechnen |
| N11 | SH-ADMIN-20 | 02.10.2026 | 20 | Qualifikationsgrenze: unsupportedUnitOrDirection | 48Stunden sind nicht zwei Kalendertage |
| N12 | UR-COURT-20 | 02.10.2026 | 20 | Qualifikationsgrenze: noticeNeedsIndividualReview | Ungeklärte Ausnahmebelehrung |
| N13 | SH-COURT-20 | 02.10.2026 | 20 | Qualifikationsgrenze: suspensionExceptionNotQualified | Steuerrechtlicher Ferienausschluss ist kein Normalpfad |
| N14 | SH-COURT-REASONS-30 | 02.10.2026 | 30 | Qualifikationsgrenze: serviceFictionNotCalculated | Keinen mündlichen Eröffnungszeitpunkt erfinden |
| N15 | UR-ADMIN-20 | 23.12.2026 | 20 | Qualifikationsgrenze: urOpeningSpecialConsequenceUnresolved | Art22-Sonderfolge behauptet, keine automatische Ableitung |
| N16 | UR-ADMIN-20 | 02.10.2026 | 20 | Qualifikationsgrenze: urCoordinatedLongestPeriodNotQualified | Art48Abs2 verlangt längste koordinierte Frist, keine erfundene Dauer20 |
| N17 | UR-ADMIN-ORDERED | 02.10.2026 | 10 | Qualifikationsgrenze: urLocalHolidayEffectUnresolved | Konkret mögliche zusätzliche örtliche Endtagswirkung nach LSG9 nicht als irrelevant deklarieren |
| N18 | SH-ADMIN-20 | 02.10.2026 | 20 | Qualifikationsgrenze: shShortenedRekursOutsideOrdinaryPath | Konkrete Rekursverkürzung ausserhalb ordentlicher20Tage |
| N19 | SH-COURT-REASONS-30 | 02.10.2026 | 10 | Qualifikationsgrenze: statutoryDurationMismatch | Keine Übernahme der zehntägigen ZPO239-Handlung |
| N20 | UR-ADMIN-ORDERED | 02.10.2026 | offen | Qualifikationsgrenze: dayDurationNotSpecified | Keine angeordnete Dauer erfinden |
| N21 | SO-COURT-10 | 30.02.2027 | 10 | Qualifikationsgrenze: invalidResearchDate | Ungültiges Kalenderdatum |
| N22 | UR-ADMIN-REASONS-10 | 02.10.2026 | 10 | Qualifikationsgrenze: stageDoesNotMatchPath | Keine unbelegte UR-Begründungsanforderung beim Obergericht |
| N23 | SO-COURT-ORDERED | 02.10.2026 | 10 | Qualifikationsgrenze: fixedDateOrDeviatingStart | Abweichend angeordneter Beginn nicht Grundrechnung |
| N24 | SH-COURT-ORDERED | 02.10.2026 | 10 | Qualifikationsgrenze: unsupportedUnitOrDirection | Rückwärtsfrist nicht vorwärts zählen |
| N25 | SO-ADMIN-REASONS-10 | 02.10.2026 | 10 | Qualifikationsgrenze: stageDoesNotMatchPath | Kein pauschales gerichtliches Begründungsverlangen aus §21bis |
| N26 | SO-ADMIN-10 | 02.10.2026 | 10 | Qualifikationsgrenze: openingNotQualified | Zulässig unbegründetes Dispositiv ist nicht schon die begründete Eröffnung |
| N27 | SH-ADMIN-REASONS-10 | 02.10.2026 | 10 | Qualifikationsgrenze: openingNotQualified | Art8Abs3a-Vollgutheissung ist nicht der Bstb-Anforderungspfad |
| N28 | SO-ADMIN-REASONS-10 | 02.10.2026 | 10 | Qualifikationsgrenze: openingNotQualified | Ohne ausdrückliche Anzeige nach §21bisAbs1c kein positiver Begründungsanforderungspfad |
| N29 | SH-COURT-REASONS-30 | 02.10.2026 | 30 | Qualifikationsgrenze: targetCourtNotQualified | Kein Dreissigtageimport in ein unteres Spezialverwaltungsgericht |
| N30 | SH-COURT-REASONS-30 | 02.10.2026 | 30 | Qualifikationsgrenze: courtReasonsWrongRecipient | Begründung beim entscheidenden Obergericht, kein Bundesgerichtsweiterzug |
| N31 | UR-ADMIN-20 | 16.10.2026 | 20 | Qualifikationsgrenze: priorReasonsRequestNotEstablished | Keine erneute Zwanzigtagesfrist aus ungeklärter Begründungsanforderung ableiten |
| N32 | SO-ADMIN-10 | 16.10.2026 | 10 | Qualifikationsgrenze: priorReasonsRequestNotEstablished | Verspätete Anforderung trägt keinen ungeprüften neuen Rechtsmittellauf |
| N33 | SH-COURT-20 | 23.12.2026 | 20 | Qualifikationsgrenze: priorReasonsRequestNotEstablished | Rechtzeitige verwaltungsinterne Voranforderung muss im zweiten Schritt feststehen |
| N34 | UR-COURT-20 | 02.10.2026 | 20 | Qualifikationsgrenze: openingOriginNotQualified | Keine unbekannte Eröffnungskette aus Standards erfinden |

## Rechtliche Grenzen der Sollwerte

Der UR-Art.-22-Hinweis folgt dem vorgeschlagenen Verständnis als Soll-Eröffnungsrestriktion ohne erfundenen Stillstand. Positive Werte setzen eine wirksame, tatsächlich massgebende Eröffnung voraus. Bei behaupteter besonderer Eröffnungsrechtsfolge gibt es keinen Datumssollwert. Für UR-Begründungsverlangen wird keine gerichtliche Begründungsfrist behauptet.

Die SH-Begründungsanforderungen sind selbständige Zehn- beziehungsweise Dreissigtageshandlungen, keine zwanzigtägigen Rechtsmittel. Der zweite Handlungsschritt wird nur aus der späteren, rechtlich massgebenden begründeten Eröffnung gerechnet, nicht aus einem vermuteten Gesuchsdatum.

Die offenen Endverschiebungskonstellationen betreffen eine Zählung bis 20.03.2027, deren gewöhnliche Wochenendverschiebung in den am 21.03.2027 beginnenden Osterstillstand geriete. Alle sieben gerichtlichen Forschungsgruppen haben eine eigene Kollisionsprobe. Die vorgeschlagene enge Produktgrenze wird für jede kantonale Verweisung eigenständig begründet. Sie ist kein nachgewiesenes gesetzliches Berechnungsverbot. Negative Forschungsfälle beweisen keine effektive Sperre der bestehenden App oder ihres Exports.

Das vollständige Forschungsfenster ist 29.08.2026 bis 31.12.2027. Ein gedecktes Empfangsdatum allein genügt nicht. Alle Zähl-, Stillstands- und Endverschiebungstage müssen darin liegen. Kalenderproben ausserhalb des Fensters sind nur isolierte Listenprüfungen, keine zusätzlichen Fallfreigaben.

## Isolierte Kalenderproben

| Liste | Datum | Feiertag | Zweck |
| --- | --- | --- | --- |
| UR-LSG-CORE | 02.01.2027 | Nein | Kein Berchtoldstag in UR-Kernliste, hier trotzdem Samstag |
| UR-LSG-CORE | 06.01.2027 | Ja | LSG-Kernliste statt ArG-Teilmenge |
| UR-LSG-CORE | 19.03.2027 | Ja | Josefstag |
| UR-LSG-CORE | 01.05.2027 | Nein | Kein 1.Mai |
| UR-LSG-CORE | 27.05.2027 | Ja | Fronleichnam |
| UR-LSG-CORE | 08.12.2026 | Ja | Mariä Empfängnis |
| SO-PROCEDURAL | 02.01.2027 | Ja | Explizit in §9 |
| SO-PROCEDURAL | 01.05.2027 | Ja | Ganzer Prozesstag, keine Halbtagregel |
| SO-PROCEDURAL | 27.05.2027 | Ja | Fronleichnam kantonsweit prozessual |
| SO-PROCEDURAL | 01.08.2027 | Ja | Bundesfeiertag zusätzlich zur Zwölferliste |
| SO-PROCEDURAL | 08.12.2026 | Nein | Kein regionaler Katalogtag hinzumischen |
| SH-VRG-PRACTICE | 02.01.2027 | Ja | Eigenständiger VRG-Praxisvorschlag, kein StPO-Entscheid |
| SH-VRG-PRACTICE | 02.01.2029 | Ja | Isolierende Dienstagsprobe ausserhalb des Fallfensters |
| SH-VRG-PRACTICE | 19.03.2027 | Nein | Kein Josefstag |
| SH-VRG-PRACTICE | 27.05.2027 | Nein | Kein Fronleichnam |
| SH-VRG-PRACTICE | 01.05.2027 | Ja | 1.Mai |
| SH-VRG-PRACTICE | 19.09.2027 | Ja | Eidgenössischer Bettag, zugleich Sonntag |
| SH-VRG-PRACTICE | 30.12.2026 | Nein | Schalterschliessung ist kein allgemeiner Feiertag |

SH-Januar-Sensitivität: 490 Tage im Fallfenster verglichen, 0 Unterschiede der Endtagszulässigkeit mit oder ohne 2. Januar. Das ersetzt keine rechtliche Begründung des Tages und verändert keinen bisherigen SH-/StPO-Entscheid.

Fachliche Herleitung: [Fachvorlage](verwaltungsverfahren-ap23g1.md) und [Quellenprüfung](quellenpruefung-ap23g1.md). Kein Produktcode, Rechtsrelease, Schema, bestehende Testfixture oder Betriebsstand wurde dafür verändert.
