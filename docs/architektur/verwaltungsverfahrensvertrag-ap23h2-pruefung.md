# AP23H2 Technischer Prüfnachweis OW und NW

Stand: 22. Oktober 2026. **Lokale isolierte Vertrags- und Datenprobe bestanden, technische Abnahme durch David Steimer offen.** Die [H1-Fachabnahme](../fachrecht/abnahme-ap23h1.md) ist erteilt. [DEC-2026-037](../entscheidungen/DEC-2026-037-prozesskalender-und-qualifizierte-handlungen-v5.md) mit Katalog 5 und Manifest/Mindestconsumer 12 bleibt vorgeschlagen. Dies ist keine native Produktintegration oder Betriebsfreigabe.

## Tatsächlicher Kandidat und Umfang

Der [Kandidat](../../outputs/ap23h2-candidate-2026-10-22/bundle/manifest.json) enthält 44 Artefakte plus Manifest. Das [Integritätsinventar](../../outputs/ap23h2-candidate-2026-10-22/candidate-integrity.json) bindet die tatsächlichen Dateien und ihre Herkunft.

| Gegenstand | Ergebnis |
| --- | --- |
| Pfade und Qualifikationsregeln | Je 79, davon 58 Bestandsdefinitionen exakt erhalten und 21 neue H1-Gruppen |
| Katalogerlasse und Stillstände | 13 Erlasse ohne separates BE-Profil, 25 Stillstandsprofile |
| Kalender | 35 physische Dateien und 17 rechtliche Verwendungen. Alle 33 bisherigen Kalenderdateien bytegleich |
| Rohartefakte des G3-Bestands | 40 bytegleich. Verwaltungs- und Feiertagskatalog geändert, zwei Prozesskalender zusätzlich |
| Feiertagsregeln | 479 bisherige Erhebungsregeln und zwölf SO-Regeln exakt erhalten. Acht neue OW-/NW-Prozessregeln unter eigenen Verfahrensgeltungen |
| Formale Struktur | Katalog 5, lokaler Manifest 12, Feiertagskatalog 2 und beide neuen Regelkalender 3 gültig. Vier Kandidatenschemata getrennt von nativen Schemata |
| Freigabegrenzen | Kandidat, vorgeschlagener Vertragsstatus, keine Produktaktivierung oder Exportfähigkeit. Kopierte historische Releasebindungen nicht als neue Freigaben ausgegeben |

Manifest SHA-256: `221491b96c330e46919248e569ade16a46d3a84ca7ea5df7cd6c91d148f687de`.

Der Nachweis und die Grenzen des Vertrags stehen in der [H2-Vorlage](verwaltungsverfahrensvertrag-ap23h2.md). Der [abschliessende Gesamtbericht](../../outputs/ap23h2-2026-10-22/local-completion.json) bindet auch Dokumentation, Nachweise und Prüflogs.

## Referenzen und unabhängige Gegenprüfung

| Prüfung | Tatsächliches Ergebnis |
| --- | --- |
| Abgenommene H1-Erwartungen | Alle 118 vollständigen Ergebnisse am tatsächlichen Kandidaten bestätigt: 58 Datumssollwerte, 18 Endverschiebungskollisionen, 38 Qualifikationsgrenzen und vier Fenstergrenzen |
| Zwei Rechenwege | Node mit den tatsächlichen Kandidatenparametern und unveränderter gemeinsamer Tagesarithmetik. Separates Python mit eigener vollständiger Tagesenumeration und Osterberechnung. Keine Ergebnisdifferenz |
| Vollständige Ergebnisfelder | Beginn, erster Zähltag, nominales und endgültiges Ende, Stillstand, Verschiebung, Begrenzungsgrund und zeitliche Normbindungen verglichen, soweit im betreffenden Ergebnistyp vorhanden |
| Kalenderproben | 20 gezielte Proben und vier Jahresmuster. 1’460 Endtagszulässigkeitsvergleiche je Rechenweg ohne Differenz. Diese überlappenden Vergleiche nicht addieren |
| Zusätzliche Python-Strukturprüfung | Alle 35 tatsächlichen Kalender gegen Format-3-Schema, neue und erhaltene Objekte sowie 19 negative Struktur-/Formalproben. Alle 72 H1-Archivpayloads geprüft |

Die Node-Probe liest die konkreten Kandidatenregeln, Profile und Fallanforderungen. Die Forschungserwartungen bleiben der unabhängige abgenommene Sollbestand. Der Python-Nachweis importiert weder den JavaScript-Builder noch Produktmodule als Ergebnisgeber.

- [Node-Nachweis](../../outputs/ap23h2-2026-10-22/QA-AP23H2.json)
- [Unabhängiger Python-Nachweis](../../outputs/ap23h2-2026-10-22/QA-AP23H2-INDEPENDENT.json)

Die 38 Qualifikationsfälle sind bereits Teil der 118 Referenzen. Sie werden nicht nochmals als zusätzliche Prüfungen gezählt. Auch die Kalendervergleiche beider Rechenwege sind keine doppelte fachliche Freigabe.

## Manipulationen alte Reader und Kontextschutz

**78 neu gehashte Katalog-/Dateimutationen** werden abgewiesen. Der Prüfaufbau berechnet nach den Änderungen die abhängigen Hashes neu. Die Abweisung beruht deshalb nicht bloss auf einer veralteten Prüfsumme. Gegenstände sind unter anderem:

- fehlende oder umgedeutete neue Handlung, falsche gesetzliche Dauer, freie Tagesdauer statt gesetzlichen Schriftenwechsels und unzulässiger Einsprachetransfer
- fehlende Einsprachezulässigkeit, einvernehmliche Fristansetzung, falsches fristauslösendes Dokument, falscher Empfänger oder aufgehobene Eröffnungskette
- falsches Stillstandsprofil, verlorene örtliche oder Endverschiebungsgrenze sowie veränderte Periodengrenzen
- Lücken und Überschneidungen nach dem Empfang, Vertauschung aktueller und zukünftiger OW-StVG-Quelle, falsche amtliche URL, Fassung oder Normstelle
- kantonsfremde Erlass-, Profil- und Kalenderbindungen, Verwechslung der unmittelbaren gerichtlichen GOG-Wirkung mit der administrativen Auslegung
- fehlender aktiver Elternkalender, falsche Vererbung, freie Kalendervereinigung, veränderte Altregeln und falsche neue Datums- oder Quellenzuordnung
- fingierte Quellen-, Vertrags-, Export- oder Aktivierungsfreigaben

**36 zusätzliche Inputproben** behandeln fehlende und abweichende aktuelle Fakten, Empfänger, Dokumente, gesetzliche Dauer und tatsächliche Berechnungen mit zeitlichen Lücken oder Überschneidungen. Sie ersetzen keine spätere Fehlerdialogprüfung im GUI.

**Sechs tatsächliche Altreader-/Vertragsproben** bestätigen die geschlossene Ablehnung durch Katalog-4- und Format-11-Leser, auch nach Umetikettierung und erneutem Hashen. Der Feiertagskatalog ist unter dem vorhandenen Komponentenformat 2 formal gültig, wird aber vom alten Format-10-Aktivierungsvalidator zu Recht abgewiesen. Der neue Gesamtconsumer muss die zusätzliche Aktivierung ausdrücklich prüfen.

Zusätzlich laufen **58 native Bestandsberechnungen** im unveränderten G3-Kontext. **174 gefälschte oder geklonte Kontexte** werden vom bestehenden Rechenkern abgeblockt. Dies ist keine erneut ausgeführte vollständige Produktregression und kein nativer Format-12-Fähigkeitsnachweis.

## Korrekturen während der Probe

Die Kandidatenschemata wurden auf die tatsächlichen 35 Kalender und 44 Artefakte begrenzt. Der Gegencheck erkannte ausserdem die fehlende aktive Elternreferenz im neuen Kalenderverwendungszweig. Die vier neuen V5-Verwendungen binden deshalb vier aktive Ressourcen statt der drei aus dem alten Verwendungsmodell. Alte Zweige bleiben unverändert.

Weitere Gegenproben schliessen gleichdatige Quellenfehler: Richtige Datumswerte allein dürfen keinen falschen Erlass, keine falsche Normfassung oder kantonsfremde Profilquelle legitimieren. Die Quellenrollen werden zusätzlich zu den Hashes ausdrücklich abgeglichen. Fehler im Aufbau einzelner Manipulationsproben wurden korrigiert und vollständig erneut geprüft. Die [Vorlaufbefunde](../../outputs/ap23h2-2026-10-22/initial-contract-probe-attempts.txt) bleiben erhalten.

Die bisher kopierten Kalender und Sozialkomponenten behalten in der Strukturprobe ihre historischen Herkunftsbindungen. Der neue Feiertagskataloghash wird nicht rückwirkend als Quelle alter Projektionsbytes ausgegeben. H3 muss konsistente neue Zielkopien oder einen ausdrücklich verifizierten Historienvertrag herstellen. Die aktuelle Probe ist nicht durch blosses Setzen eines Freigabeflags aktivierbar.

## Bestandserhalt und nächster Haltepunkt

Der [Erhaltungsnachweis](../../outputs/ap23h2-2026-10-22/preservation-verification.json) bestätigt **1’754 unveränderte Schutzdateien**, darunter Produktcode, native Schemata, freigegebene Daten, bestehende Tests, historische Nachweise und das fremde geänderte Projektplan-DOCX. Die H1-Abnahmekopie ist autonom erneut geprüft. **48 Archiv-Positiv-/Negativtests**, TypeScript-Prüfung und `git diff --check` sind bestanden. Sieben lebende Einstiegstexte sind separat nachgeführt.

Der ausdrücklich freigegebene H1-Statusentwurf wurde mit der aktuellen H1-Abnahme und dem H2-Start auf [#48](https://github.com/davidsteimer/fristenrechner/issues/48) veröffentlicht und zurückgelesen. Die neuen H2-Ergebnisdateien sind weiterhin lokal, nicht als Quellstand auf main veröffentlicht.

**Offen sind die technische H2-Abnahme und der Beschluss DEC-2026-037.** H3 bleibt gesondert zu starten. Kein Produktbuild, Quellenrelease, Commit, Quellpush, Upload, Installation, Mirrorwechsel oder Eingriff in AP5/AP21, E/Q/P, Hosting oder Berechtigungen. Die reguläre Auslieferung bleibt bis zur vereinbarten Kantonsabdeckung gebündelt.
