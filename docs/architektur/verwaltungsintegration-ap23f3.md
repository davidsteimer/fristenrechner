# AP23F3 Lokale Integration Zürich, Aargau und St. Gallen

Stand: 22. Oktober 2026. Auftraggeber und menschlicher Entscheider: David Steimer. **Lokaler Integrationskandidat, noch keine fachlich-technische AP23F3-Abnahme oder operative Freigabe.** Die [AP23F2-Abnahme](../fachrecht/abnahme-ap23f2.md) und der [Beschluss DEC-2026-035](../entscheidungen/DEC-2026-035-beschluss.md) sind getrennt dokumentiert. MVP 0.9 bleibt der freigegebene Betrieb.

## Ergebnis und unveränderte Fachgrenzen

Der native Format-10-Leser integriert den Verwaltungsverfahrenskatalog 3 mit insgesamt 42 Pfaden. 17 neue Wege ergänzen die 25 bisherigen Definitionen. Bern bleibt das separate bestehende Rechtsprofil. Die 80 abgenommenen F1-Erwartungen werden durch den tatsächlichen neuen Rechenkern geprüft, nicht durch einen Format-9-Adapter. Tageszähler und grundlegender Endverschiebungsalgorithmus bleiben unverändert.

| Kanton | Neue Wege | Abgrenzung |
| --- | --- | --- |
| ZH | Rekurs 30 Tage, gerichtliche Beschwerde 30 Tage, je eine angeordnete Tagesfrist vor Verwaltung beziehungsweise Gericht | Verwaltungs- und Gerichtskalender getrennt. Normabschnitte vor und ab 01.01.2027. Keine Eröffnungsfiktion oder Verlängerung wegen behaupteter Kanalstörung |
| AG | Verwaltungsbeschwerde und gerichtliche Beschwerde je 30 Tage, je eine angeordnete Tagesfrist, qualifizierte Vollstreckungsbeschwerde 10 Tage | Enger Vollstreckungsteil nach VRPG § 83. Keine allgemeine Zehntagesfrist für Kosten, Hauptsache, SchKG oder Zahlungsaufforderungen |
| SG | Verwaltungsrekurs 14 Tage, VRK-Rekurs zum Dokumentenzugang 14 Tage, Verwaltungsgerichtsbeschwerde 14 Tage, Verwaltungs-Massnahmenrekurs 5 Tage, qualifizierte gerichtliche Massnahmenbeschwerde 5 Tage und drei angeordnete Tagesfristen | VRK und Verwaltungsgericht über die Handlung getrennt. VRK nur formell eröffnete Departementsverfügung zum Dokumentenzugang. Vorgängiges Verlangen nach einer Verfügung nicht erfasst. Normabschnitte vor und ab 01.06.2027 |

Das vollständige neue Fallfenster bleibt **29.08.2026–31.12.2027**. Empfang, Zähltage, Stillstandstage und Endverschiebungen müssen gedeckt sein. F1-O1 sperrt ausschliesslich die neun neuen Wege mit anwendbarem Stillstand, wenn eine Endverschiebung in einen neu beginnenden Stillstand führt. Die zwei bestehenden AR-Sicherungen und TI-O2 bleiben unverändert. Keine positive Aussage bei ungeklärter aktueller Fallqualifikation, Ferienausnahme oder abweichendem Spezialrecht.

## Daten, Herkunft und Fähigkeiten

- Kandidat: `data/candidates/2026-10-22-ap23f3/`, Releasekennung `2026-10-22-ap23f3-candidate.1`
- Manifest und Mindestconsumer 10.0.0, Verwaltungsverfahrenskatalog 3.0.0. Keine neue App- oder Paketversionsnummer beschlossen
- 42 Datendateien plus Manifest, 33 physische Kalender, neun administrative Kalenderverwendungen
- Neue ZH-Verwaltungsprojektion mit neun ausdrücklichen Regeln. Die bisherige ZH-Gerichtsprojektion und alle 104 bundesrechtlichen Verfahrensbindungen bleiben eigenständig
- Alle 479 Basisregeln, zwölf SO-Regeln, 198 Herkunftsentscheide sowie sämtliche Definitionen der 32 alten Kalender bleiben erhalten. Neu gebunden wird der tatsächliche Herkunftshash des vollständigen Katalogs
- Fünf bestehende Rechtsprofile und der Spezialregimekatalog sind byteidentisch zu MVP09. Die 44 Sozialregeln und 50 Berner Anbindungen mit ihren Zeitfenstern 2026–2027 bleiben fachlich unverändert
- Vertragsbeschluss ist bestätigt. Datenrelease, sämtliche operativen Pfadfreigaben und Kalenderexport sind damit ausdrücklich nicht freigegeben

Originalbytes, Schema, Inventar, Komponenten- und Einzelpfadprüfsummen werden geprüft. Normidentität und rechtliche Kalenderverwendung sind getrennt von erneuerbaren Reviewfeldern. Kopierte, serialisierte oder per Proxy nachgebildete Kontexte erhalten keine Rechenberechtigung. Native WeakMap-Identitäten binden Daten, Kalender und Verwaltungskontext zusammen. Ein Kandidat kann nicht durch ein beschreibendes Metadatenflag zum Betriebsrelease werden.

Die [Integritätsdatei](../../outputs/ap23f3-2026-10-22/bundle-integrity.json) bindet die tatsächlichen Baueingänge. Manifest-SHA-256: `89470d589615a447b146eb58028a7e2ac58fe7389b908196b3f82e02864b3311`.

## Oberfläche und Standards

Zweispaltiger Aufbau, früh bedienbares Datum, statisches «Sitz der zuständigen Stelle» und vier Schaltflächen bleiben erhalten. Keine zusätzlichen Dokument-, Zielorgan- oder Kanal-Dropdowns. Die bereits vorhandene Fallkonstellationsauswahl erzeugt die nötigen aktuellen Fakten erst nach positiver Auswahl. Langtexte und Normnachweise gehören in die Rechenspur beziehungsweise Berechnungsgrundlage. Die Rechenspur nennt nur die im tatsächlichen Rechenzeitraum berührten Normabschnitte mit lesbaren Quellenlinks.

Deutsch und Französisch sind integriert. Standards bleiben Version 5. Pfad und stabile Präferenzen dürfen gespeichert werden. Empfangsdatum, Referenz, Fallqualifikation, Verfahrenstatsachen, Belehrung und Kanalbehauptungen werden nicht gespeichert oder bei einem Pfadwechsel als bestätigt fortgeführt. Ein älterer Reader ersetzt einen unbekannten neuen Pfad nicht stillschweigend durch einen anderen.

Die gesamte lokale Ansicht weist ihren Referenzstatus aus und bietet **keinen Kalenderdownload**. Das gilt auch für die Bestandsverfahren innerhalb dieser Prüfansicht. Dies ist keine Entfernung der Exportfunktion aus MVP 0.9.

## Lokale Prüfung und Nachweisgrenzen

Der [Gesamtnachweis](../../outputs/ap23f3-2026-10-22/QA-AP23F3.json) enthält TypeScript, reproduzierbaren Datenbau, Produktregression, Host-Lebenszyklus, tatsächlichen minifizierten Webbuild und unabhängige Python-Schema-/Rohbyteprüfung. Der [SPFx-Baunachweis](../../outputs/ap23f3-2026-10-22/spfx-build.json) gehört zu einem isolierten temporären Arbeitsordner, nicht zum unveränderten Betriebspaket. Die [Prüfung des tatsächlichen Pakets](../../outputs/ap23f3-2026-10-22/actual-package.json) ergänzt native Format-10- und neue Handlungspfade.

Synthetische Freigabekonstellationen existieren ausschliesslich im Testspeicher. Sie sind kein menschlicher Quellenentscheid und werden weder in Datenreleases geschrieben noch installiert. AMD-Pakettests simulieren Host und Ereignisübergabe. Browserinteraktion wurde separat an der tatsächlichen lokalen Webausgabe auf Deutsch und Französisch geprüft. Daraus folgt keine erneute reale iPad-, Gast- oder M365-Hostabnahme.

Die Schlussprüfung ist bestanden:

| Prüfung | Ergebnis |
| --- | --- |
| Produktregression | 2’828/2’828 bestanden, keine übersprungenen Fälle |
| Darin neue native Kern-, Daten- und UI-Tests | 124 Kern-, 13 Daten- und 20 UI-Tests. Teilmenge der Produktregression, nicht zusätzlich zur Gesamtzahl |
| Abgenommene F1-Erwartungen durch den nativen Rechenkern | 80/80, davon 52 Datumssollwerte, drei F1-O1-Sperren, 20 Qualifikations- und fünf Fenstergrenzen |
| Host-Lebenszyklus Format 9/10 | 20/20 bestanden |
| Tatsächlicher minifizierter Webbuild | 10/10 bestanden |
| Unabhängiger Python-Prüfer | Zwei Tests bestanden, darunter Rohbytes und Schema sämtlicher 42 Artefakte sowie negative Vertragsproben |
| SPFx-Provider-/Integrationstests im isolierten Bau | 226/226 bestanden |
| Kompilierung, CSS-Prüfung und isolierte Paketbildung | Bestanden |
| Bestehende Prüfungen des tatsächlichen AMD-Pakets | 170/170 bestanden |
| Zusätzliche native Format-10-Paketprüfung | 4/4 bestanden, einschliesslich aller 17 neuen Wege und Quellen-/Cachegrenzen |

Node 22.23.2 und npm 10.9.8 wurden verwendet. TypeScript ist auch nach Ergänzung der Pakettests bestanden. Die [gebundene lokale Schlusskontrolle](../../outputs/ap23f3-2026-10-22/local-completion.json) bestätigt historische F1-/F2-Eingänge, freigegebene Daten, Produktpins, das bestehende Paket und den bereits vor diesem Auftrag geänderten Projektplan ohne weitere Änderung.

Der erste SPFx-Prüflauf traf auf eine während des Kopierens noch ergänzte Quelldatei. Nach Dateistabilisierung wurde der ganze isolierte Bau erfolgreich wiederholt. Im zusätzlichen Paketharness waren zuerst zwei Proben wegen eines falschen Testzugriffs auf `stage` statt `stages[0]` unvollständig. Das Fehlerprotokoll ist erhalten. Der korrigierte Aufbau besteht mit demselben Paket und unveränderten Produktregeln.

Die 42 nicht blockierenden SPFx-Lintmeldungen sind im Bauprotokoll sichtbar, darunter bestehende und neue Typisierungs-/Stilhinweise. Ein erfolgreich beendeter Build ist kein behaupteter warnungsfreier Build und keine umfassende Sicherheitsprüfung. Die zusätzliche KI-Gegenkontrolle der Fähigkeiten, Transportgrenzen und Kalenderanbindung ersetzt kein menschliches Vieraugenprinzip.

## Prüfvorschau für David

[Lokale AP23F3-Vorschau](http://127.0.0.1:8803/fristenrechner/). Falls der lokale Prozess beendet wurde, im Projektordner mit der eingerichteten Node-22-Toolchain `npm run preview:ap23f3` starten.

| Auswahl und Empfang | Erwartung |
| --- | --- |
| ZH, ordentlicher Rekurs, 02.10.2026 | 30 Tage, 02.11.2026 |
| AG, qualifizierter Vollstreckungsteil nach § 83, Gericht, 10.07.2027 | 10 Tage mit Stillstand und Wochenende, 23.08.2027 |
| SG, VRK-Rekurs zum Dokumentenzugang, 10.07.2027 | 14 Tage mit Stillstand, 25.08.2027 |
| SG, qualifizierte vorsorgliche Massnahme an das Verwaltungsgericht, 10.07.2027 | 5 Tage ohne Stillstand, 15.07.2027 |
| ZH, ordentliche Gerichtsbeschwerde, 18.02.2027 | F1-O1, kein definitives Fristresultat und kein Export |

Jeweils die zutreffende positive Fallkonstellation wählen. Nach «Als Standard speichern» und Neuladen dürfen Pfad und Dauer erhalten bleiben, Datum und aktuelle Fallkonstellation dagegen nicht. Keine realen Falldaten für diese lokale technische Prüfansicht verwenden.

## Nächster Übergang

David nimmt AP23F3 gesondert fachlich-technisch ab. Danach wird die nächste begrenzte Kantonstranche festgelegt. Gemäss DEC-2026-034 folgt noch kein regulärer Zwischenrelease. Es gab keinen Commit oder GitHub-Quellpush, keine Quellenpromotion, Uploads, Installationen, Mirrorumstellungen oder E-/Q-/P- und Berechtigungsänderungen. Die öffentliche Issue-Statusführung ist von einer Quellpublikation getrennt.
