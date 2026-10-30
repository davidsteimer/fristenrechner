# AP23L2 Technischer Prüfnachweis

Stand: 27. Oktober 2026. **Lokale isolierte Vertragsprobe bestanden, menschliche technische Abnahme und DEC-2026-041 ausstehend.** Keine native AI-/SZ-Integration, kein Produktbau oder Betriebswechsel.

## Prüfgegenstand

Geprüft werden die tatsächlichen Dateien des [V9-/Format-16-Kandidaten](../../outputs/ap23l2-candidate-2026-10-27/), nicht nur die L1-Forschungsskripte oder JSON-Beispiele. [L1 ist separat fachlich abgenommen](../fachrecht/abnahme-ap23l1.md). Die ursprünglichen L1-Modelle, 83 Erwartungen, Belege und Abschlussflags bleiben unverändert.

Die [Vertragsvorlage](verwaltungsverfahrensvertrag-ap23l2.md) beschreibt Bedeutung und Migrationsgrenzen. Der [Entscheidungsvorschlag](../entscheidungen/DEC-2026-041-qualifizierte-eroeffnung-und-fristdauer-v9.md) ist nicht beschlossen. Der [lokale Abschlussnachweis](../../outputs/ap23l2-2026-10-27/local-completion.json) bindet Quellskripte, Schemata, reale Kandidatenbytes, Berichte, Tests, Prüflogs und lebende Statusdateien mit SHA-256 und Byteumfang.

## Getrennte Prüfspuren

| Spur | Tatsächlicher Umfang | Ergebnis |
| --- | --- | --- |
| Schema und Generator | Vier reale isolierte Schemata mit AJV sowie unverändertem Produkt-SchemaContract und assertSchema | Gültig, reproduzierbare Kandidatenbytes. Keine Lockerung historischer Äste |
| Neuer Node-Referenzconsumer | Alle 83 ursprünglichen Fälle aus tatsächlichen V9-Pfaden, aktuellen Fakten, Kalendern und Profilen | 54 Datumsergebnisse, 22 Qualifikationsgrenzen, fünf Fenstergrenzen, zwei gesperrte Endverschiebungskollisionen |
| Node-Ergänzungen | 20 ausdrücklich synthetische Eingabeproben, 336 einzelne Entfernungen aktueller Pflichtfakten, 22 semantische Katalogmanipulationen trotz neu berechneter Hashes | Erwartetes Ergebnis oder Sperre, keine Exportberechtigung |
| Unabhängiges Python | Eigenständige Berechnung ohne Import von Produkt-, Node- oder L1-Rechencode | Alle 83 Originalfälle und 20 Node-Ergänzungen semantisch gleich |
| Unabhängige Zusatzprüfungen | 697 aktuelle Fakten-/Dauerproben, zwölf physische Kalenderkontraste, drei gezielte Semantikänderungen | Erwartete Grenzen, Kalenderwirkungen und Änderungssensitivität bestätigt |
| Herkunftsvergleich | Alle 54 positiven Referenzfälle gegen tatsächliche Pfad-, Policy-, Kalender-, Profil- und Eligibilitybindung | Konkrete Auswahl, physischer und rechtlicher Auslöser sowie berührte Normsegmente bestätigt |
| Native Bestandsrechnung | Echter unveränderter Format-15-Byteparser und Produktrechner, 165 bereits abgenommene K3-Fälle | Alle 165 früheren Ergebnisse vollständig gleich, ausschliesslich Referenzrechnungen ohne Export |
| Alte Reader gegen neuen Stand | Zwei bisherige Reader, insgesamt zwölf unveränderte, gefälscht freigegebene und rücketikettierte Format-16-Varianten | Alle zwölf abgelehnt, kopierter Kontext ebenfalls gesperrt |

Die 165 bisherigen administrativen Pfade betreffen 20 Kantone. Bern wird im älteren Bestandsprofil und nicht in diesem kantonalen Administrativkatalog geführt. Deshalb bleiben **21 vollständig abgenommene Kantone** die richtige Projektzahl. Der isolierte AI-/SZ-Vertragsvorschlag erhöht diese Zahl noch nicht.

Der vollständige Governance-Gesamtlauf umfasst **400 bestandene Tests**, ohne übersprungene oder abgebrochene Tests. Typecheck und lokale Linkprüfung sind im Abschlussnachweis und [Gesamttestlog](../../outputs/ap23l2-2026-10-27/governance-tests.txt) ausgewiesen. Synthetische technische Proben werden nicht als weitere recherchierte oder menschlich abgenommene Rechtsfälle gezählt.

## Wichtige Gegenproben

- Bereits qualifizierte AI-Samstagseröffnung bleibt unverändert. Nur die zulässige Trackingvariante erhält eine Normalisierung. Fehlende Erwartbarkeit, ungeklärter Eingang oder abweichendes Empfangsfeiertagsregime sperren.
- Mündliche Eröffnung und Kenntnistag werden nicht zu Trackingsendungen. Fehlende aktuelle Tatsachen werden nicht aus dem Pfadnamen, früheren Rechnungen oder Standards ergänzt.
- Eine Eröffnung während der Gerichtsferien bleibt datiert. Der Stillstand verschiebt die Tageszählung, nicht rückwirkend den rechtlichen Eröffnungstag.
- Längere Belehrung verlangt dieselbe tatsächliche Dauer wie die Eingabe, die aktuelle ordentliche Basis und mehr als 30 Tage. AI-O3 wird nicht durch Wahl eines Maximalwerts aufgelöst.
- Die SZ-Einsprache verwendet die konkret angesetzte Dauer. Elf Tage und eine automatisch erfundene Zehntagesdauer sind keine zulässige positive Auslegung.
- Schwyzer Martinstag verschiebt das Ende am 11. November, pausiert aber keine Frist im Innern. Er wird weder zum neuen Rohkalenderfeiertag noch auf AI oder unqualifizierte andere SZ-Sitze übertragen.
- Die SZ-Normgrenze am 1. Juli 2027 wird auch bei einer darüber laufenden Berechnung tatsächlich berührt und dokumentiert, obwohl die verwendete Zählregel gleich bleibt.
- Jede Fensterüberschreitung und die tatsächliche Endverschiebungskollision bleiben ohne definitives Ende und Export.
- Manipulierte Dauer-, Tracking-, Orts-, Stillstands-, Normzeitachsen- und Freigabepolicies werden auch nach erneuter Berechnung der technischen Hashes nicht als sachlich richtig akzeptiert.

## Prüfseitig gefundene und bereinigte Punkte

Im ersten neuen Consumerlauf erhielt ein negativer mündlicher Eröffnungsfall zunächst den allgemeinen Fehler «unbekannte Tatsache» statt seiner bereits abgenommenen spezifischen Qualifikationsgrenze. Die Prüfungsreihenfolge wurde korrigiert. Die Originalfälle und ihre Erwartungen wurden nicht geändert.

Ein kritischer Zweitblick fand einen inkonsistenten Prüfbyteszugriff im neuen isolierten Hilfsconsumer. Eine Map mit eigenem Iterator konnte unveränderte Bytes zur Hashprüfung und andere Kalenderbytes zum Kontextaufbau liefern. Die endgültige Fassung erlaubt nur gewöhnliche Maps ohne eigene Überschreibungen und erstellt einmal einen nativen Snapshot. Prüfung und Kontext verwenden ausschliesslich dieselben Bytes. Der ursprüngliche Reproducer, eigene get-/keys-/entries-Methoden und Unterklassen werden jetzt abgewehrt. Eine normale Map liefert weiterhin den richtigen Referenzwert. Das betrifft neu erstellten L2-Hilfscode, nicht den unveränderten Produktrechner oder einen Betriebsstand.

Die Native-Governance-Prüfung erwartete anfangs fälschlich 21 statt 20 Kantone im Administrativkatalog. Nur diese neue Zählassertion wurde berichtigt. Die 165 Ergebnisvergleiche waren bereits davor gleich. Alle betroffenen Prüfungen wurden vollständig wiederholt.

## Bestand, Belege und Sicherung

Der Kandidat erhält 165 alte Pfade samt Qualifikations- und Eligibilityobjekten sowie alle früheren Erlass-, Quellen-, Profil- und Kalenderbindungsobjekte. **43 nichtadministrative Manifestartefakte sind rohbytegleich**, alle 44 Deskriptoren stimmen mit den tatsächlichen Dateien überein. Es bleiben 35 Kalender und 499 Katalogregeln. Der Martinstag wird ausschliesslich durch die zwei separat gebundenen administrativen Daten ergänzt. 44 Sozialregeln und 50 BE-Anbindungen bleiben unverändert.

Alle 31 L1-Belegdateien wurden erneut gegen ihre tatsächlichen SHA-256-Werte geprüft. Die 17 technischen Quellenzeilen bilden ihre Rollen ab, nicht 31 unabhängige materielle Normfreigaben. Keine Inhaltsänderung der abgenommenen Rechtsbefunde und keine neue Quellenreleaseprüfung durch diesen technischen Schritt.

Die autonome [L1-Abnahmekopie](../../outputs/ap23l1-abnahme-2026-10-27/receipt.json) enthält 66 Nutzdateien und 11’332’014 Bytes. Die [L2-Ausgangsbindung](../../outputs/ap23l2-2026-10-27/protected-inputs.json) und [Erhaltungsprüfung](../../outputs/ap23l2-2026-10-27/preservation-verification.json) bestätigen **9’048 unveränderte Bestandsdateien**. Sieben lebende Einstiegstexte werden getrennt nachgeführt. Bestehende Produktdateien, native Schemata, Rechtsdaten, Tests und historische Nachweise bleiben unverändert.

## Reproduzierbarkeit und Grenzen

```sh
.work/toolchains/node-v22.23.2-darwin-arm64/bin/node scripts/finalize-ap23l2.mjs --write
.work/toolchains/node-v22.23.2-darwin-arm64/bin/node scripts/finalize-ap23l2.mjs --check
```

Der erste Befehl wiederholt die lokale Gesamtpipeline und bindet deren neue Prüflogs. Der zweite prüft den vorhandenen Abschluss, seine exakte Dateiliste und Prüfsummen sowie frisch die Schemata, Kandidaten, Abnahmekopie, geschützten Eingänge und native Regression. Beide Befehle ändern keine Produktdateien oder Remoteziele.

Der neue Referenzconsumer ist bewusst auf den gebundenen isolierten Kandidaten geschlossen. Die strukturelle Schemaerfüllung allein beweist nicht die fachliche Zusammengehörigkeit beliebiger neuer Policies. Diese wird zusätzlich gegen den aus den gesicherten Eingängen rekonstruierten Sollbestand geprüft. Der Consumer ist kein allgemein aktivierter Produktreader. Für spätere zeitlich wechselnde Einzelkalenderregeln bleibt eine taggenaue Regelaktivierung nötig. Bei den tatsächlich gebundenen AI-/SZ-Regeln decken sämtliche Regelintervalle das vereinbarte Fenster, die isolierte strengere Deckungsprüfung verändert hier keinen Fall.

Persönliche Standards werden in L2 nicht produktseitig geändert oder gespeichert. Der L3-Migrationsauftrag trennt stabile Auswahlen von aktuellen Tatsachen und aktuellen Dauerangaben. Die tatsächliche native Standards-, UI-, Cache- und Exportintegration ist noch zu leisten. Keine Browser- oder Gerätetests neuer AI-/SZ-Produktwege werden behauptet.

## Nächster Haltepunkt

David Steimer entscheidet über die technische AP23L2-Abnahme und ausdrücklich über DEC-2026-041. Erst danach kann L3 separat starten. Quellenrelease, definitive Produktbauten, Installation, GitHub-Publikation und Betriebsfreigaben bleiben weitere eigene Schritte. **L3 ist nicht gestartet, E/Q/P und MVP 0.9 bleiben unverändert.**
