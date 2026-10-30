# AP23H2 Technischer Vertrag für Obwalden und Nidwalden

Stand: 22. Oktober 2026. **Technische Vorlage zur Entscheidung durch David Steimer.** [AP23H1 ist einschliesslich H1-A bis H1-F fachlich abgenommen](../fachrecht/abnahme-ap23h1.md). H2 ist als isolierte Vertrags- und Datenprobe beauftragt. Vorgeschlagen werden **Kantonalverfahrenskatalog 5.0.0 sowie Manifest und Mindestconsumer 12.0.0** gemäss [DEC-2026-037](../entscheidungen/DEC-2026-037-prozesskalender-und-qualifizierte-handlungen-v5.md). Die Formate sind noch nicht beschlossen. H3 ist nicht gestartet.

## Nachgewiesene Vertragslücke

Katalog 4 enthält bereits Begründungsverlangen, Eröffnungsketten, konkrete Gerichtszielbindung und begrenzte lokale Sicherungen. Für die neuen Handlungen und aktuellen Falltatsachen reicht sein geschlossener V4-Zweig trotzdem nicht aus. Die Lücke besteht nicht allein in zusätzlichen Kantons- oder Pfadnamen.

| Bestehende Grenze | Erforderliche ausdrückliche Bedeutung |
| --- | --- |
| V4 kennt keine Einsprache und keinen besonderen Weiterzug zur aufschiebenden Wirkung als eigene Handlungen | Zulässige NW-Einsprache und genau bezeichneter OW-Weiterzug nach VGV Art. 12 Abs. 3, ohne Umdeutung in gewöhnliche Beschwerde |
| Vernehmlassung, Replik und Duplik fehlen als eigenständige gesetzliche Handlungen | Sechs getrennte NW-Wege mit unveränderter gesetzlicher Zwanzigtagedauer, nicht frei angeordnete Eingabe und nicht automatisch im Einspracheverfahren |
| Unbegründete Eröffnung und zulässige Einsprache sind nicht gleichbedeutend mit gewöhnlicher Beschwerde oder Begründungsanforderung | Rechtmässig eröffneter NW-Ausgangsentscheid mit positiv feststehender Einsprachezulässigkeit. Kein erfundenes NW-Begründungsgesuch |
| Bisherige Empfängerqualifikation deckt nur bestimmte Gerichtskonstellationen ab | Identität der eröffnenden Verwaltungsbehörde oder des Gerichts bei OW-Begründungsverlangen und der bisher entscheidenden Stelle bei Einsprache beziehungsweise besonderem Weiterzug |
| Allgemeine Normalfallqualifikation beschreibt NW-Ausnahmen und einvernehmliche Fristansetzung nicht ausdrücklich | Fehlende, abweichende und unbekannte aktuelle Angaben darstellen und sicher ablehnen, ohne aus Standards eine positive Tatsache zu ergänzen |
| Die physischen Kalender des Bestands enthalten die vier neuen Prozesstage nicht | Acht neue herkunftsgebundene Regeln, zwei eigene Prozessprojektionen und vier getrennte rechtliche Verwendungen. Keine globale Änderung bisheriger Bundeskalender |

Der neue V5-Zweig ergänzt die bisherigen Zweige, ohne deren Bedeutung zu erweitern. Native alte Schemata und Validatoren bleiben unverändert. Die neue vorgeschlagene Manifestversion bindet das neue Katalogschema und den erforderlichen Consumer ausdrücklich. Ein Format-11-Etikett für neue V5-Semantik ist ausgeschlossen.

Die Feiertags- und Regelkalenderschemata können die neuen Datensätze bereits ausdrücken. **Ihre Komponentenformate bleiben 2.0.0 und 3.0.0.** Der bestehende Format-10-/11-Aktivierungsvalidator bindet jedoch insbesondere 33 Projektionen, die zwölf SO-Zusatzregeln und deren Herkunft abschliessend. Er darf nicht durch globale Lockerung neue OW-/NW-Daten akzeptieren. H3 benötigt einen eigenständigen, ebenso geschlossenen Format-12-Aktivierungszweig. Gleiche Komponentenformatnummer bedeutet nicht, dass ein alter Gesamtconsumer neue Aktivierungen bereits beherrscht.

## Isolierter Strukturkandidat und geschützter Bestand

Ausgangspunkt ist der [abgenommene lokale AP23G3-Stand](../fachrecht/abnahme-ap23g3.md). Das ist nicht der operative Datenrelease MVP 0.9 und wird durch diese Probe nicht nachträglich veröffentlicht.

| Bestandteil | Abgenommener G3-Ausgangspunkt | H2-Strukturprobe |
| --- | ---: | ---: |
| Katalogerlasse ohne separates BE-Profil | 11 | 13 |
| Pfade und Qualifikationsregeln | je 58 | je 79 |
| Stillstandsprofile | 20 | 25 |
| Rechtliche Feiertagsverwendungen | 13 | 17 |
| Physische Kalender | 33 | 35 |
| Manifestartefakte ohne Manifest | 42 | 44 |
| Dateien einschliesslich Manifest | 43 | 45 |
| Erhaltene Feiertagserhebungsregeln | 479 | 479 |
| Erhaltene gesonderte SO-Prozessregeln | 12 | 12 |
| Neue OW-/NW-Prozessregeln | 0 | 8 |
| Nationale Sozialregeln und Berner Anbindungen | 44 und 50 | unverändert |

Alle 58 bisherigen Pfaddefinitionen, Revisionen, Qualifikationsregeln und ihre zugehörigen Fachobjekte sind exakt zu erhalten. Ebenso bleiben sämtliche 33 vorhandenen physischen Kalenderdateien unverändert. Die neuen Projektionen sind zusätzliche Dateien, keine Ersetzung bestehender OW-/NW-Bundesprofilkalender. Die 479 Erhebungsregeln und zwölf SO-Regeln werden nicht umetikettiert oder für neue Herkunftsbelege überschrieben.

Der [Strukturkandidat](../../outputs/ap23h2-candidate-2026-10-22/bundle/manifest.json) und das [Byteinventar](../../outputs/ap23h2-candidate-2026-10-22/candidate-integrity.json) liegen getrennt von freigegebenen Releases und nativen Integrationskandidaten. Die [Kandidatenschemata](../../schemas/candidates/ap23h2/) bleiben ebenfalls isoliert. Der Strukturmanifest ist nicht als freigegebener produktlesbarer Manifest verwendbar. Historische Referenzen kopierter Komponenten belegen nur den damaligen Stand. H3 muss Zielrelease, Komponentenhashes, Quellenprüfung und Freigabereferenzen vollständig konsistent neu binden.

Dies betrifft insbesondere die 33 kopierten Kalender: Ihre bisherigen Projektionsquellenhashes und die älteren rechtlichen Verwendungsbindungen zeigen weiterhin auf den alten Katalog. Der neue H2-Feiertagskatalog hat dagegen zusätzliche Regeln und einen neuen Hash. Diese ausdrücklich historische Mischung ist in der Strukturprobe beabsichtigt und verhindert eine blosse native Aktivierung. H3 benötigt konsistent gebundene Zielkopien oder eine ausdrücklich verifizierbare Historienbindung. Der Erhalt der G3-Originalbytes ist kein Versprechen, dass jede spätere Zielkopie trotz neuer Herkunft exakt dieselben Metadatenbytes behält. Die bisherigen Fristenregeln werden dadurch nicht geändert.

## Handlungen aktuelle Fakten und Dauer

Die sieben OW- und vierzehn NW-Gruppen behalten die [abgenommenen H1-Identitäten und Referenzen](../fachrecht/referenzfaelle-ap23h1.md). Die spätere Benutzeroberfläche muss daraus nicht ebenso viele Eingabefelder machen.

| Gruppe | Vertragsanforderung |
| --- | --- |
| OW gewöhnliche Beschwerden | Verwaltung 20, Gericht 30 Tage. Ursprünglich vollständige Eröffnung oder spätere Begründung nach erwiesen rechtzeitiger Voranforderung ausdrücklich unterscheiden |
| OW Begründungsverlangen | Verwaltung und Gericht je 30 Tage, zulässig unbegründete Eröffnung mit angezeigter Anforderungsmöglichkeit, dieselbe eröffnende Stelle als Empfänger und kantonaler Dreiperiodenrahmen. Kein automatischer BGG-Weiterzug |
| OW Weiterzug zur aufschiebenden Wirkung | Genau präsidialer Entscheid nach VGV Art. 12 Abs. 3, fünf Tage an das Gesamtgericht und die fachlich bestätigte Ferienfreiheit. Kein allgemeiner Fünftagespfad für andere Zwischenentscheide |
| NW ordentliche Beschwerden und Einsprache | Grundsätzlich 20 Tage. Einsprache setzt ihre gesetzliche Zulässigkeit voraus und kann an eine rechtmässig unbegründete Eröffnung anknüpfen. Keine weitere Einsprache allein wegen des späteren Einspracheentscheids |
| NW angeordnete Tagesfristen | Erstinstanz ohne allgemeinen Stillstand, Einwendungsstellungnahme nur Winter, Einsprache und Rechtsmittel drei Perioden. Konkrete Anordnung und Stadium bestimmen den Weg |
| NW gesetzlicher Schriftenwechsel | Vernehmlassung, Replik und Duplik je vor Verwaltung und Gericht, grundsätzlich unveränderte 20 Tage. Tatsächliche Zustellung des passenden Dokuments und anwendbare Handlung erforderlich. Verkürzung und Verlängerung bleiben gesonderte Fälle |

Die gesetzliche Dauer bleibt fest und nicht frei überschreibbar. Nur die eigene Gruppe für eine tatsächlich angeordnete Tagesfrist erhält eine eingegebene Dauer. Eine technische Obergrenze für diese Eingabe ist kein gesetzliches Fristmaximum. Eine fixe Enddatumsanordnung, andere Zeiteinheit, rückwärts laufende Frist, Zahlung, unklare Zustellfiktion oder besondere gesetzliche Dauer wird nicht in einen gewöhnlichen Tagesweg gedrängt.

NW-Stillstandsausnahmen nach Art. 33a Abs. 3 und eine Fristansetzung im Einvernehmen mit den Parteien sind aktuelle Falltatsachen. Das Gleiche gilt für Einsprachezulässigkeit, Empfängeridentität, passende Eröffnung, rechtzeitige Voranforderung und eine konkret ungeklärte örtliche Endtagswirkung. Sie werden weder als persönliche Vorgaben gespeichert noch aus solchen Vorgaben fingiert.

## Kalenderherkunft und rechtliche Verwendung

Zwei neue physische Prozesskalender ergänzen jeweils den kantonsweiten Herkunftsbestand um den 2. Januar, Ostermontag, Pfingstmontag und den 26. Dezember. Die Regeln erhalten je Kanton eigene Quellen- und Geltungsbindungen. Der Bundesfeiertag ist bereits enthalten und wird nicht doppelt erzeugt. Keine Montagssubstitution ohne Rechtsgrundlage.

| Rechtliche Verwendung | Eigene Grundlage |
| --- | --- |
| OW Verwaltung | StVG Art. 64 und VGV-Fristenkette sowie fachlich bestätigte systematische GOG-28-Übertragung. Diese Auslegungsrolle ist ausdrücklich sichtbar |
| OW Gericht | VGV/ZPO-Fristenkette, GOG Art. 28 unmittelbar und Gerichtsortrolle. Gleicher physischer OW-Kern vererbt keine administrative Berechtigung |
| NW Verwaltung | VRG Art. 34 Abs. 2 mit RTG. Zielstelle nach DEC-2026-031, keine zusätzliche Partei-/Vertretungsliste |
| NW Gericht | Eigenständige VRG-Verwendung vor dem Verwaltungsgericht. Keine unbelegte allgemeine ZPO-Verweisung zur Herleitung des NW-Kalenders |

Vierzehn benannte potenziell werktägliche Datumsregeln stehen neben der allgemeinen Wochenendbehandlung. Mit ohnehin sonntäglichen Herkunftsetiketten sind es siebzehn Daten. Die getrennten Zählweisen werden nicht als identische Rohlisten ausgegeben. Die Prüfung muss die tatsächliche Endtagszulässigkeit und die vollständige Projektion aus den tatsächlichen Regeln vergleichen.

Jede der vier neuen rechtlichen Verwendungen bindet vier aktive Ressourcen mit ihren tatsächlichen Manifestdeskriptoren: den neuen Prozesskalender, seinen unmittelbar geerbten OW-/NW-Kalender, den Bundeskalender und den Feiertagskatalog. Die zusätzliche historische Projektionsherkunft verweist getrennt auf den früheren G3-Bestand. Ein historischer Elternhash ist kein Ersatz für die aktive Elternreferenz der konkreten Zielkopie. Die alten Verwendungsobjekte werden dadurch nicht verändert.

Die aktuelle lokale Endtagsqualifikation bleibt konkret: Fehlt eine vollständige kommunale Inventur, sind nicht automatisch alle Fälle gesperrt. Ist eine zusätzliche örtliche Endtagswirkung konkret möglich und ungeklärt, gibt es kein definitives Resultat und keinen Export. Keine freie Vereinigung örtlicher oder kantonsfremder Listen und kein stiller BE-/CH-Ersatz.

## Zeitbindung und eng begrenzte Sicherung

Das vollständige Fallfenster lautet **29.08.2026–31.12.2027**. Eröffnung, alle Zähltage, Stillstands- und Endverschiebungstage müssen gedeckt sein. Eine gültige Norm allein am Empfangstag reicht nicht. OW-StVG 1917 bis 31.12.2026 und 2031 ab 01.01.2027 erhalten lückenlose getrennte Normabschnitte mit den jeweils tatsächlichen Quellen. Identische Art. 64/67 sind kein Grund, den Fassungswechsel zu verschweigen.

Die sechs OW-Dreiperiodengruppen und zwölf NW-Dreiperiodengruppen erhalten die abgenommene Sicherung bei reiner Endverschiebung in neu beginnende anwendbare Ferien. Gewöhnlich offene Zähltage während der Ferien bleiben berechenbar. Der Winterweg ist nur gegen seinen tatsächlich einschlägigen Stillstand zu prüfen, ohne eine in 2026–2027 nicht vorhandene Winterkollision zu erfinden. Kein solcher Stillstand wird auf NW-Erstinstanz oder den qualifizierten OW-Fünftagesweg übertragen.

Rechtsprofile 1.0.0, Feiertagskatalog 2.0.0, Regelkalender 3.0.0, Spezialregimekatalog 3.0.0, Sozialverfahrenskatalog 2.0.0 und persönliche Vorgaben 5 bleiben als Formate unverändert. Die 44 nationalen Sozialregeln und 50 Berner Anbindungen werden nicht erweitert. Die spätere Zielreleasebindung des Sozialkatalogs muss trotz unverändertem Fachinhalt fortgeschrieben werden. Keine neue ausserbernische Sozialfreigabe oder Verlängerung ihres Zeitfensters.

## Technische Prüfung und nächste Entscheidung

Der [Prüfbericht](verwaltungsverfahrensvertrag-ap23h2-pruefung.md) bindet die tatsächlichen Kandidatenbytes, Schema- und Semantikprüfungen, 118 H1-Erwartungen, einen getrennten Python-Nachweis, Altreaderablehnung und gezielte neu gehashte Fehlzuordnungen. Reine Hashkonsistenz ist keine Bestätigung der fachlichen Zuordnung. Quellenfassung, Normrolle, Stadium, Handlung, Empfänger und konkrete Regelmenge müssen ebenfalls stimmen.

Die isolierte Probe ist keine native Format-12-Implementierung und kein Nachweis der späteren GUI-, Host- oder Exportsperre. Ein erfolgreich berechneter Referenzfall aktiviert keinen Kalenderdownload. H3 muss nach gesondertem Auftrag den neuen Consumer, die strenge Aktivierung, DE/FR, Standards, Rechenspur, Export und Hostintegration umsetzen. Zwei Spalten, frühe Datumseingabe, feste Einzelwerte und verständliche Normangaben bleiben verbindlich.

**Nächster Haltepunkt:** technische Abnahme AP23H2 und ausdrücklicher Beschluss DEC-2026-037. H3 startet erst nach anschliessendem Auftrag. Kein Produktcode, native Schemata, freigegebene Daten, Releasepromotion, Auslieferungsbau, Commit, Quellpush, Upload, Installation oder Betriebswechsel. Der [Bestandserhalt](../../outputs/ap23h2-2026-10-22/preservation-verification.json) ist gesondert gebunden. E/Q/P, Mirrors, AP5, AP21, Hosting und Berechtigungen bleiben unverändert. Der nächste reguläre Release bleibt gemäss DEC-2026-034 gebündelt.
