# AP23M2 Technischer Prüfnachweis

Stand: 28. Oktober 2026. **Lokale isolierte Vertragsprobe bestanden, menschliche technische Abnahme und DEC-2026-042 ausstehend.** Keine native NE-/VD-/VS-Integration, kein Produktbau oder Betriebswechsel.

## Prüfgegenstand

Geprüft werden die tatsächlichen Dateien des [Katalog-10-/Format-17-Kandidaten](../../outputs/ap23m2-candidate-2026-10-28/), nicht lediglich die M1-Forschungsskripte oder JSON-Beispiele. [M1 ist separat fachlich abgenommen](../fachrecht/abnahme-ap23m1.md). Die ursprünglichen Modelle, 109 Erwartungen, Belege und Abschlussflags bleiben unverändert.

Die [Vertragsvorlage](verwaltungsverfahrensvertrag-ap23m2.md) beschreibt Bedeutung und Migration. [DEC-2026-042](../entscheidungen/DEC-2026-042-ne-vd-vs-verfahrensvertrag-v10.md) ist ein Vorschlag, kein Beschluss. Der [lokale Abschlussnachweis](../../outputs/ap23m2-2026-10-28/local-completion.json) bindet Quellskripte, Schemata, tatsächliche Kandidatenbytes, Prüfberichte, Tests, Logs und lebende Einstiegstexte mit Bytezahl und SHA-256.

## Getrennte Prüfspuren

| Spur | Tatsächlicher Umfang | Ergebnis |
| --- | --- | --- |
| Schema und Generator | Vier neue isolierte Schemata, tatsächlicher Katalog und lokales Manifest mit AJV und unverändertem Produkt-SchemaContract | Geschlossene neue Äste gültig, historische Definitionen erhalten, 86 Schematests bestanden |
| Neuer Node-Referenzconsumer | Alle 109 ursprünglichen M1-Fälle aus tatsächlichen neuen Pfaden, aktuellen Fakten, Kalendern und Profilen | 73 Datumsergebnisse, 27 Qualifikationsgrenzen, sechs Fenstergrenzen und drei konkrete gesperrte Endverschiebungskollisionen |
| Node-Ergänzungen | 33 ausdrücklich synthetische Proben, 560 einzelne Entfernungen aktueller Pflichtfakten und 23 semantische Katalogmanipulationen trotz neu berechneter Hashes | Erwartetes Ergebnis oder Sperre, keine Exportberechtigung |
| Unabhängiges Python | Eigenständige Berechnung ohne Import von Produkt-, Node- oder M1-Rechencode | Alle 109 Originalfälle, 33 Node-Ergänzungen und 560 Fehlende-Fakten-Prüfungen bestätigt |
| Unabhängige Zusatzprüfungen | 1’239 eigene Fakten-/Spezialproben, 22 statische Kalenderanker, getrennte Erzeugung aller 35 Kalender für beide Jahre und drei Semantikmutationen | Erwartete Grenzen und Änderungssensitivität bestätigt |
| Herkunftsvergleich | Positive Original- und Zusatzfälle gegen tatsächliche Pfad-, Dauer-, Fakten-, Kalender-, Profil- und Eligibilitybindungen | Gewählter Kalender, physischer und rechtlicher Auslöser, Quellen und berührte Normsegmente stimmen unabhängig überein |
| Native Bestandsrechnung | Unveränderter Format-16-Byteparser und Produktrechner mit 196 expliziten akzeptierten L3-Fällen | Alle 196 früheren Ergebnisse vollständig gleich, nur Referenzrechnung ohne Export |
| Alte Reader gegen neuen Stand | Zwei unveränderte Reader, sechs vollständige Kandidatenvarianten | Alle zwölf Versuche abgelehnt, einschliesslich gefälschter Freigabe und rücketikettierter Formate. Kopierter Kontext ebenfalls gesperrt |

Der vollständige Governance-Gesamtlauf umfasst **476 bestandene Tests**, dokumentiert im [gebundenen Gesamttestlog](../../outputs/ap23m2-2026-10-28/governance-tests.txt). Keine übersprungenen, abgebrochenen oder nur als künftig geplant gezählten Tests. Typecheck, lokale Links und Whitespaceprüfung sind Teil des Abschlusses. Zusatzproben sind keine neuen menschlich abgenommenen Rechtsfälle.

Die 196 alten administrativen Pfade betreffen 22 ausserbernische Kantone. Bern bleibt im Bestandsprofil separat. Deshalb sind weiterhin **23 Kantone im vereinbarten allgemeinen Umfang integriert und abgenommen**, sechs operativ unter MVP 0.9 und 17 weitere nur lokal. Die isolierten letzten 49 Wege erhöhen diese Zahl noch nicht auf 26.

## Wichtige Gegenproben

- VD: Rechtlich qualifizierte Samstagseröffnung bleibt unverändert. Zulässiger unterschriftsloser Samstagempfang normalisiert dagegen über den gebundenen Bettagsmontag hinweg. Fehlende Zulässigkeit oder ungeklärter Eingang sperren. Eine zusätzliche AI-Erwartbarkeit wird nicht verlangt.
- NE: Fehlende oder unklare Verwaltungs-Stellensitzregion sperrt. Fronleichnam wird nur im gebundenen Le-Landeron-Kalender berücksichtigt. Die gerichtliche Bindung bleibt Neuchâtel. Keine Parteienanknüpfung oder Zusammenführung konkurrierender Kalender.
- VS: 15 tatsächlich wirksam belehrte Tage bei ordentlicher Basis zehn sind möglich. Fehlende Basis, nicht übereinstimmende tatsächliche Dauer oder kein Überschreiten der Basis sperren. Keine AI-Untergrenze von 31 Tagen.
- Die mündliche Walliser Eröffnung und das schriftliche Dispositiv behalten unterschiedliche aktuelle Auslöser. Keine automatische Folgeöffnung oder Beschwerdefrist aus einem erst künftig erwarteten Begründungsdokument.
- Die NE-/VD-Nachfristen verlangen die qualifizierte Ablehnung erst nach Ablauf der alten erstreckbaren Eingabefrist. Eine noch laufende Frist wird nicht verkürzt, eine Zahlungsfrist nicht umgedeutet.
- VS zählt nach dem gerichtlichen Winterstillstand erst ab 6. Januar, NE nach dem 2. Januar. Gerichtsferien werden nicht rückwirkend zu einer Verschiebung der rechtlichen Eröffnung gemacht.
- VD Art. 81 wird ausdrücklich nur als aktuelle rechtliche Anordnungsqualifikation geprüft. Die negative Erstansetzungsprobe ist kein automatischer numerischer Legalitätsnachweis. Eine zulässige längere Anordnung wird nicht pauschal auf 30 Tage begrenzt.
- Alle Fensterüberschreitungen und die tatsächlichen Endverschiebungskollisionen bleiben ohne definitives Ende und ohne Export.
- Neu gesiegelte sachlich veränderte Dauer-, Post-, Regions-, Trigger-, Stillstands-, Normfenster- oder Freigabepolicies werden nicht durch passende technische Hashes legitimiert.

## Prüfseitig gefundene und bereinigte Punkte

Der erste Builderlauf erwartete aus dem älteren L2-Muster zwei unpassende Flagbezeichnungen. Die neue M2-Sicherung verwendet bewusst `m1ProfessionallyAccepted` und die separate M1-Receipt `m2Started`. Nur der neue Leser wurde an die tatsächlichen gebundenen Felder angepasst. Archiv, Guard und Fachabnahme blieben unverändert.

Der unabhängige Python-Vergleich und die Wiederholung gespeicherter Proben fanden einen Fehler in der neuen QA-Aufzeichnung: Ein zuvor gespeicherter positiver Testinput wurde bei einer anschliessenden Negativprobe über dasselbe Faktenobjekt verändert. Die Aufzeichnung speichert jetzt getrennte Snapshots von Eingabe und Erwartung. Alle 33 Zusatzproben werden aus ihren gespeicherten Eingaben erneut gerechnet. Weder M1-Referenzen noch fachlicher Kandidat wurden angepasst.

Ein kritischer Zweitblick zeigte, dass nicht enumerierbare JavaScript-Datenproperties die geschlossene JSON-Prüfung umgehen konnten. Die neue isolierte Eingabeprüfung lehnt versteckte Top-Level-Felder, versteckte Zusatzfakten, versteckte Pflichtfakten, Symbole, Zugriffsproperties und unechte beziehungsweise lückenhafte Arrays ausdrücklich ab. Die ursprünglichen Reproduktionsfälle sind nach der Korrektur gesperrt, ohne Ausführung von Gettern und ohne definitives Ergebnis. Das betrifft neu erstellten M2-Prüfhilfscode, nicht den unveränderten Produktrechner.

Der bekannte Split zwischen verifizierten und später verwendeten Map-Bytes bleibt ebenfalls verhindert: Nur gewöhnliche Maps ohne eigene Überschreibungen sind zulässig. Prüfung und Kontextaufbau verwenden denselben einmaligen nativen Snapshot. Nachträgliche Änderungen am übergebenen Katalog oder an der Payloadmap verändern keinen bereits ausgegebenen unveränderlichen Kontext. Ein serialisierter Kontext erhält keine Rechen- oder Exportcapability.

## Kalender, Quellen und Sicherung

43 nichtadministrative Manifestartefakte sind rohbytegleich zum L3-Ausgangsstand. Die 196 alten Pfade samt Qualifikations- und Eligibilityobjekten sowie alle bisherigen Quellen, Kalenderbindungen und Profile bleiben erhalten. Es bleiben 35 Kalender und 499 Katalogregeln. Vier neue Bindungen und fünf Profile verknüpfen lediglich die bereits vorhandenen Kalender mit den neuen Verfahrenswegen. Kein neuer physischer Feiertag oder prozessuales Zusatzdatum. Die bisherigen Schwyzer Ergänzungen bleiben erhalten. Sozialbestand 44 Regeln und 50 BE-Anbindungen unverändert.

Alle 64 M1-Rohbelege wurden erneut gegen ihre gebundenen Bytes geprüft. 19 technische Quellenzeilen erhalten ihre ausdrücklichen Rollen. Die Quelle darf nicht deshalb zur positiven Rechtsgrundlage werden, weil sie technisch abrufbar ist. Historische und technische Zugriffsbelege werden nicht aufgewertet.

Das [Neuenburger Pflichtgate](../../outputs/ap23m2-2026-10-28/ne-fassungsgate.json) bindet neun frische amtliche Rohbelege. Geltende LPA und OJN sind als PDF unverändert. LJu bleibt im Zukunftsregister auf Promulgation wartend, die Justitia-Verordnung belegt nur den Beitritt. Zwei anders dargestellte Indexseiten sind nicht rohbytegleich, ihr abgegrenzter rechtlicher Indexinhalt wurde gesondert verglichen. Keine unveränderte künftige Rechtslage und keine vollständige Abwesenheit zusätzlicher Jahresanordnungen werden behauptet.

Die autonome [M1-Abnahmekopie](../../outputs/ap23m1-abnahme-2026-10-28/receipt.json) umfasst 110 Nutzdateien mit 25’644’304 Bytes. Alle vier benötigten Kalenderbaselines sind darin enthalten. Die [M2-Ausgangsbindung](../../outputs/ap23m2-2026-10-28/protected-inputs.json) und [Erhaltungsprüfung](../../outputs/ap23m2-2026-10-28/preservation-verification.json) sichern 11’414 unveränderte Bestandsdateien. Sieben lebende Einstiegstexte werden getrennt nachgeführt.

## Reproduzierbarkeit und Haltepunkt

```sh
.work/toolchains/node-v22.23.2-darwin-arm64/bin/node scripts/finalize-ap23m2.mjs --write
.work/toolchains/node-v22.23.2-darwin-arm64/bin/node scripts/finalize-ap23m2.mjs --check
```

Der erste Befehl wiederholt die lokale Gesamtpipeline und bindet deren neue Logs. Der zweite kontrolliert den vorhandenen Abschluss, seine exakte Dateiliste und Prüfsummen sowie frisch die Schemata, Kandidaten, Abnahmekopie, geschützten Eingänge und native Regression. Beide ändern keine Produktdateien oder Remoteziele.

Die isolierte Referenzimplementierung ist bewusst auf diesen rekonstruierten und gebundenen Sollkandidaten beschränkt. Strukturelle Schemaerfüllung allein beweist keine fachliche Freigabe beliebiger Policies. Native Standards-, Cache-, Export-, UI-, Browser- oder Gerätetests neuer NE-/VD-/VS-Produktpfade werden in M2 nicht behauptet.

**Nächster Haltepunkt:** menschliche technische AP23M2-Abnahme und ausdrücklicher Beschluss DEC-2026-042. Erst danach kann M3 separat gestartet werden. Kein Produktbau, Commit, Push, Upload, Installation, Mirrorwechsel oder Betriebsentscheid. Der bisher beschlossene native Vertrag 9/16 und MVP 0.9 bleiben unverändert.
