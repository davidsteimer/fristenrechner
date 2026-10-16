# MVP 0.8 · Lokale Releaseartefakte und R08-B-Nachweis

Stand: 15. Oktober 2026. **R08-B ist lokal ausgeführt und vollständig geprüft. Die vier Artefakte und der Abschlussnachweis sind versiegelt.** Grundlage ist die [ausdrückliche R08-B-Freigabe](freigabe-r08-b.md). Produktiv bleibt der dokumentierte MVP-0.7-Stand. Es gab keine neue Livebestandsaufnahme.

Der [maschinenlesbare Abschlussnachweis](../../outputs/release-mvp08-2026-10-15/local-completion.json) bindet die Freigabe, den einzigen Datencommit, die tatsächlichen Artefakte und sämtliche abschliessenden Prüfumfänge. SHA-256: `68a91b538cc7437d91932e04cf3bb320a0378c201714d0e440aa36ec7e957864`. Die 210 Produkteingänge und 42 Laufzeitdateien stimmen unverändert mit dem tatsächlichen Bau überein. Von den 563 gesicherten Eingängen sind 543 unverändert und 20 begrenzt fortgeschrieben. Die lebenden Einstiegstexte dokumentieren diesen Abschluss nachträglich, ohne die gebundenen Prüfberichte umzuschreiben.

## Gebundene Artefakte

| Artefakt | Bytes | SHA-256 |
| --- | ---: | --- |
| [SPFx `0.8.0.0`](../../outputs/release-mvp08-2026-10-15/fristenrechner-schweiz-0.8.0.0.sppkg) | 311’611 | `d3d06adcd78176db66f8227d884fd66ca2fbcee0bffab66755789dd0cc29dc1a` |
| [SharePoint-Mirror](../../outputs/release-mvp08-2026-10-15/fristenrechner-mvp08-sharepoint-mirror.zip) | 225’952 | `81359611b5399b1b79c0f9dedb0d5ac540c9192a1382feb67095dadb8e89f8dd` |
| [Statisches Webpaket](../../outputs/release-mvp08-2026-10-15/fristenrechner-mvp08-steimer-web.zip) | 635’927 | `0abbc23d691835e5b04b64975140afb36c4bfa89482ff872c0c76188673f4176` |
| [Recovery `0.8.0.1`, Funktionsumfang MVP 0.7](../../outputs/release-mvp08-2026-10-15/fristenrechner-schweiz-recovery-0.8.0.1.sppkg) | 291’892 | `8e387297d43df28e2fe4d3c7c9ae239bb2cdc6a9e3216e4c59c928c50d950e7b` |

Der normale [Artefaktnachweis](../../outputs/release-mvp08-2026-10-15/artifact-verification.json) bindet tatsächliche Paketbytes, XML-Identitäten, Berechtigungen, interne Beziehungen, Bundle, 42 Mirrordateien und zwölf Webdateien. Sein SHA-256 lautet `5307901a72a32537ffc8f05cefa250341c42a5d21fc387a64df04ea2c1e369c2`. Der [Recovery-Nachweis](../../outputs/release-mvp08-2026-10-15/recovery-0.8.0.1/artifact-verification.json) bindet separat die tatsächliche MVP07-Ausgangsbasis und den neuen Rückfallbau. Die historischen Pakete wurden nicht überschrieben.

## Daten und genau ein lokaler Commit

Der Release `2026-10-15-mvp-08-approved.1` enthält 41 Artefakte plus Manifest. Dessen SHA-256 lautet `2461f06c0a7d79dcd6a177fc116f08fcc0efa62e03b38ba6ac87964457c19aa4`.

Es wurde genau der freigegebene Datencommit `10a99419eaabb3e96d2acccf0c7a93e2fe6472cb` erstellt. Er enthält ausschliesslich die 42 neuen Laufzeitdateien. Sein Elterncommit ist `a1aca59aa7cb333cac085278db93b18ce3038eec`. Alle Git-Blobs wurden gegen die geprüften Dateien verglichen. Die beiden normalen SPFx-Pins zeigen auf diesen vollständigen Commit-SHA. Der [Pin-Nachweis](../../outputs/release-mvp08-2026-10-15/local-data-pin.json) ist lokal, **der neue GitHub-Pin wurde nicht veröffentlicht und ist nicht als abrufbar bestätigt**.

Die fünf TI- und sieben GR-Pfade, 44 Sozialregeln, 50 BE-Anbindungen, 104 Bundesbindungen und 32 Kalender bleiben fachlich unverändert. Die neuen Metadaten binden Quellenprüfung, Referenzsuite und tatsächliche Komponentenhashes. Die kanonischen Format-8-Schemas sind bytegleich aus den bestätigten Implementierungsschemas übernommen. Der echte Approved-Reader und die unabhängige Datenprüfung haben die Übernahme kontrolliert. Quellenregister und Index enthalten 247 Quellen, sechs Ereignisse und 2078 explizite Referenzkanten. Das neue Ereignis umfasst die abgenommenen 243 Quellen. Historische Ereignisse bleiben erhalten.

## Nachweise und ihre Grenzen

| Prüfung | Ergebnis |
| --- | --- |
| Unabhängige Datenprüfung | 50/50 einschliesslich negativer Fälle bestanden |
| Öffentliche Laufzeit-/Schema-Integrität | 10/10 bestanden, Minimalbestand ohne private Rohbelege, `.git` oder `outputs`. Keine Behauptung einer erneuten vollständigen Quellenprüfung |
| Normaler isolierter SPFx-Bau | 204/204 Quelltests und 107/107 Tests am tatsächlichen Paket bestanden, keine ausgelassenen Tests |
| Kompilierung und CSS | Bestanden. Die bekannten 24 Lintwarnungen bleiben ausgewiesen, keine Abhängigkeitsaktualisierung |
| Recovery-Bau | 186/186 Quelltests, 83/83 historische Pakettests und 9/9 ergänzende Rückfallprüfungen bestanden. 15 Warnungen der gebundenen älteren Basis |
| Artefakt- und Negativtests | 33/33 bestanden. Tatsächliche Artefakte und Zurückweisung manipulierter Archiv-/Belegdaten geprüft, keine zweite unabhängige Implementierung des Archivparsers |
| Echter lokaler Browser | Definitiver Webbuild in Chrome `155.0.8059.79`, DE breit und FR schmal. Korrektes Resultat, echte gespeicherte Downloads, TI-O2-Sperre, Exportinvalidierung und kein horizontaler Überlauf. Keine externen Requests oder Seitenfehler |
| Vollständiger funktionaler Paketwechsel | 6/6 bestanden am tatsächlichen AMD-Code. Hooks, Speicher und Transport simuliert, keine M365-Installation |
| Abschliessende vollständige Regression | 2541/2541 Produkt-, 20/20 Host-, 25/25 Web-, 225/225 öffentliche Governance-, 52/52 private MVP08- und 19/19 unveränderte private MVP05-Prüfungen bestanden. Typprüfung, 34 Python-Governance- und 50 Datenprüfungen sowie Quellenvalidator und Laufzeitintegrität bestanden |
| Isolierte Standardtestkopie | Erneut 2541/2541 Produkt-, 225/225 Node-Governance-, 34/34 Python-Governance-Prüfungen und acht Schema-Negativtests bestanden. Keine privaten Quellenrohbelege, keine ausgelassenen Tests |

Der Normalbau bindet 210 Produkteingänge und 599 Test-/Datenfixtures, dazu die sieben vollständigen Bauphasen und deren Protokolle. Der Pakettest lief ohne gleichzeitige grosse Regression. Die Exporttests am tatsächlichen AMD-Paket verwenden eine ausdrücklich simulierte Browser-/Downloadgrenze. Sie sind keine echten SharePoint-, Teams- oder Outlooktests.

Beim ersten Recoverydurchlauf erreichte die Sammeldatei das dateiweite 60-Sekunden-Limit. Die neun Prüfungen wurden ohne Änderung ihres Inhalts auf vier Dateien verteilt. Der vollständige Wiederholungslauf bestand mit unverändertem Zeitlimit. Der erste Versuch und seine Protokolle bleiben archiviert. Ein früher lokaler JSDOM-Test las eine Fluent-UI-Meldung vor Abschluss der Animationsframes. Die Testumgebung wartet nun auf den tatsächlichen Aufbau. Produktcode und fachliche Regeln wurden dafür nicht geändert.

Die erste Schlussregression bestand 2538 von 2541 Tests. Drei reine Quelltextprüfungen erwarteten am normalen Web-Einstieg noch `mvp07Runtime`. Sie prüfen nun den freigegebenen MVP08-Einstieg. Der nächste Lauf bestand alle 2541 Produkt- und 20 Hosttests. Unter den 25 Webtests blieb eine weitere veraltete Versionsannahme, die noch `0.7.0` statt `0.8.0` verlangte. Auch diese wurde korrigiert, zusätzlich zwei gleichartige Testtitel. Die separaten historischen Kandidaten und der unveränderte ältere Preview-Einstieg bleiben in den Tests erhalten.

Die früheren Läufe bleiben archiviert. Die vier korrigierten Versionsannahmen und zwei Titelanpassungen in sechs Testdateien erfolgten nach dem Paketbau und werden separat gebunden. Die tatsächlichen Produkteingänge und die vier Artefakte bleiben bytegleich, ihre historischen Baunachweise werden nicht überschrieben.

Zwei Governance-Tests benötigten ebenfalls eine ausdrückliche zeitliche Trennung. Die MVP07-Integritätsprüfung verlangte zu Recht ihre alten Register-/Indexbytes, las aber den lebenden, inzwischen fortgeschriebenen Alias. Ihr Testbestand wird mit den exakt gebundenen historischen Bytes ausgeführt, ohne den historischen Prüfer oder das aktuelle Register zu verändern. Das MVP08-Eingangsinventar erwartete noch den damaligen Zwischenstand von 236 Registerquellen und elf fehlenden Zuordnungen. Die frische Prüfung verlangt nun 247 Registerquellen ohne fehlende Zuordnung. Ein zusätzlicher Test schützt das unveränderte historische Inventar mit seiner damaligen Prüfsumme und seinen ursprünglichen Zahlen. Diese beiden Testnachführungen sind keine neue Quellenabnahme und ändern keine Rechtsdaten.

Die Prüfung der Testportabilität deckte zwei ältere Vollquellenaudits auf, die bisher fälschlich im öffentlichen Standardumfang standen: `mvp05-source-approval.test.mjs` und `mvp05-source-coverage.test.mjs`. Ihre unveränderten Testinhalte bleiben erhalten und werden über den ausdrücklichen Umfang `private-mvp05` separat vollständig ausgeführt. Die MVP08-Schlussprüfung verlangt diesen zusätzlichen Umfang zwingend. Ein neuer Test schützt die exakte Trennung und belässt unbekannte künftige Tests im Standardumfang. Es wurde kein Test entfernt, übersprungen oder durch eine Integritätsprüfung ersetzt.

Die [isolierte Standardtestkopie](../../outputs/release-mvp08-2026-10-15/portability-standard-no-private-20261015-01/report.json) hat den vollständigen Produkt- und Governanceumfang bestanden. Der Bericht hat SHA-256 `62ce23a12363d9c0562079adeeffa4d6a35fe3fe0305bd1376a715194a778b4f`. Sämtliche 2530 Eingangsdateien waren nach dem Lauf noch bytegleich. Die 34 ausgeschlossenen historischen Quellenrohdateien sowie Git-Verzeichnis, private Archive und Website-/Hostingbackups blieben ausgeschlossen. Technische historische Fixtures sind weiterhin nötig. Ein bereits ausdrücklich als öffentlich klassifiziertes und hashgebundenes ELG-XML gehört zum alten MVP06-Integritätsvertrag. Die Trennung bedeutet daher nicht «keinerlei amtlicher Quellenvolltext». Die zehn Belegdateien umfassen Protokolle, Inventar, Werkzeugfassungen und Ausschlussnachweis, nicht den vollständigen Kopierbaum.

Die vorangehende zu breite Scratch-Kopie mit nicht benötigten historischen Dateien und die Läufe mit fehlenden technischen Fixtures bleiben Diagnoseversuche. Sie sind kein bestandener Portabilitätsnachweis. Auch der nun bestandene isolierte Lauf ist keine Publikationspositivliste. Host-, Webartefakt-, Paket- und private Quellenprüfungen sind durch die anderen ausdrücklich gebundenen Nachweise abgedeckt, nicht durch diese Standardtestkopie.

Der [Browser-/Layoutnachweis](../../outputs/release-mvp08-2026-10-15/browser-layout-confirmation/verification-1792091361064.json) bindet alle zwölf ausgelieferten Dateien an den definitiven Webbuild sowie beide Kalenderdownloads und Bildschirmaufnahmen. Die breite Ansicht wurde mit zwei, die schmale mit einer Formularspalte geprüft und visuell kontrolliert. Dies ist keine iOS-, Teams-, SharePoint- oder öffentliche P-Prüfung.

## Rückfall und Wiederaufnahme

Recovery `0.8.0.1` stammt aus den tatsächlichen archivierten MVP07-Baueingängen, nicht aus einem ungeprüften alten Paket oder einem Zurücksetzen des Arbeitsbaums. Der Produktcode ist gleich geblieben. Nur Paket- und Featureversion wurden erhöht. Generierte technische Kennungen sind im Vergleich ausdrücklich und eng normalisiert.

Der [zusätzliche vollständige Hin-/Rückwechsel](../../outputs/release-mvp08-2026-10-15/recovery-roundtrip/verification.json) ist mit sechs von sechs Tests separat bestanden. Gültige v5-Standards einschliesslich TI-Auswahl, Resetmarker, beschädigte und künftige Werte bleiben erhalten. Vier positive Bundesprofile werden zusätzlich verglichen. Der echte AMD-Code läuft dabei mit simulierten Hooks, Speicher und Byte-Transport. Der frühere Recovery-Baubericht bleibt unverändert und weist diesen damals noch ausstehenden Zusatztest weiterhin als offen aus. Der neue separate Bericht schliesst genau diesen lokalen Nachweis.

Es wurde kein Browserdatenreset durchgeführt. Ein lokales Neuladen des MVP08-Codes nach Recovery beweist keine zulässige niedrigere Paketinstallation. Nach einem tatsächlichen Einsatz von Recovery `0.8.0.1` braucht eine reguläre MVP08-Wiederaufnahme einen erneut höheren, konkret gebundenen Paketstand. Die Ausführung eines Rückfalls im Tenant bleibt gesondert freizugeben.

## Outlook und nächste Haltepunkte

Die [Outlook-Wiederverwendung](outlook-wiederverwendung-mvp08.md) wird neu und begrenzt begründet. Der Serializer ist wegen des optionalen Herkunftszusatzes nicht bytegleich. Ganztagesdatum, exklusives Ende, Verfügbarkeit, Kategorie und Erinnerung bleiben unverändert. Die neue administrative Ergebnisbindung und Herkunft sind keine durch frühere Outlookimporte bereits geprüften Funktionen. Der menschliche Wiederverwendungsentscheid für MVP 0.8 bleibt offen. Es wurde kein Termin importiert.

Die nächste Stufe ist **R08-C** mit konkreter Paket-/Zielbindung, frischer Ausgangssicherung, Rohbyteprüfung der Mirrors und ausdrücklich gebilligtem Rückfall. Erst danach darf eine gesondert freigegebene E-/Q-Installation erfolgen. Geräte-/Gastprüfung und manuelle Q-Abnahme bleiben bei David. GitHub-Positivliste, Publikation, P-Bereitstellung und der erneute Header-/Cache-Risikoentscheid folgen getrennt.

Keine Installation, kein Upload, kein zusätzlicher Commit und kein GitHub-Push. Keine Änderungen an M365-Berechtigungen, Hosting, Root-Webauftritt, Sitemap, AP21-Testapps oder historischen AP5-Pins. Der dokumentierte lokale Paketbau ist keine Betriebsfreigabe. Der bestehende Dokumentationsaufbau und historische Entscheidungsnachweise bleiben erhalten.
