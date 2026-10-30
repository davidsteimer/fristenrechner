# AP23I3 Lokale Integration Glarus und Thurgau

Stand: 22. Oktober 2026. Auftraggeber und menschlicher Entscheider: David Steimer. **Lokaler Integrationskandidat umgesetzt und technisch geprüft. Zur gesonderten menschlichen AP23I3-Abnahme bereit, keine operative Freigabe.** [AP23I2 ist technisch abgenommen](../fachrecht/abnahme-ap23i2.md), [DEC-2026-038 ist beschlossen](../entscheidungen/DEC-2026-038-beschluss.md). Die ursprünglichen I1-/I2-Nachweise bleiben unverändert. MVP 0.9 bleibt der freigegebene Betriebsstand.

## Umfang und Bedienung

Der native Format-13-Zweig setzt Kantonalverfahrenskatalog 6 um. 34 neue GL-/TG-Wege ergänzen 79 unveränderte Bestandsdefinitionen. Bern bleibt das separate Bestandsprofil. Die gemeinsame Tagesarithmetik und Feiertagserzeugung bleiben unverändert.

| Kanton | Neue Gruppen | Wesentliche Unterscheidungen |
| --- | ---: | --- |
| GL | 19 | Verwaltung und Gericht, ordentliche End-/Zwischenentscheidsbeschwerde, konkret verkürzte gesetzliche Beschwerdefrist und gewöhnliche angeordnete Eingabe. Verkürzung, Art.-90-Abs.-3-Ausnahme, aktuelle Eröffnung und instanzbezogenes Übergangsrecht bleiben getrennt |
| TG | 15 | Verwaltung, Rekurs, qualifizierte Regierungsratsbeschwerde und Verwaltungsgericht. Feste gesetzliche Dauer, konkret verkürzte gesetzliche Frist und angeordnete Eingabe bleiben getrennt. Fünf gerichtliche Ausnahmegruppen haben den ausdrücklichen aktuellen Hinweiszweig |

Das Empfangsdatum bleibt früh bedienbar. Zweispaltiger Aufbau, feste Einzelwerte, die vier Schaltflächen, Resultat vor Parametern und die statische Beschriftung **Sitz der zuständigen Stelle** bleiben erhalten. Es gibt keine neuen Dokument-, Feiertagskanton- oder Zielorgan-Dropdowns.

Die vorhandene aktuelle Fallkonstellation bündelt die festen fachlichen Voraussetzungen. Nur echte alternative Tatsachen werden zusätzlich ausgewählt, ohne Vorauswahl: die aufgenommene TG-Regierungsratszuständigkeit, der konkrete Verkürzungsgrund und der aktuell massgebende Ausnahmehinweis. Die Forschungsinventur mit 34 Gruppen wird nicht als entsprechende Anzahl neuer Formularfelder umgesetzt.

Konkret verkürzte gesetzliche Dauer wird im bestehenden Tagesfeld aktuell eingegeben: GL Endentscheid 2–29, GL Zwischenentscheid 2–9 und TG 5–29 Tage. Die Eingabe wird beim Wechsel oder Wiederherstellen eines solchen Pfads geleert. Eine blosse gesetzliche Verkürzungsmöglichkeit erzeugt keine automatische Zwei- oder Fünftagesfrist. Der feste TG-Weiterzug nach § 86 Abs. 3 bleibt dagegen bei genau fünf Tagen.

Persönliche Vorgaben bleiben Version 5. Sie speichern den stabilen Pfad, nicht Datum, Referenz, aktuelle Bestätigung, konkrete Kurzfristdauer, Hinweiswirkung, Zuständigkeitsgrund oder andere Fallfakten. Ein gespeicherter allgemeiner Zahlenwert wird bei konkretisierten gesetzlichen Fristen nicht als aktuelle Dauer verwendet. In einer alten H3-Sitzung werden neuere persönliche Vorgaben nicht still überschrieben.

Deutsch und Französisch bleiben die Oberflächensprachen. Lesbare Normangaben und die tatsächlich berührten Fassungen stehen in der Rechenspur. Historische Materialien bleiben als ergänzende Belege in der technischen Spur und werden nicht als aktuelle Gesetze ausgegeben.

## Daten und native Laufzeit

Der neue Kandidat liegt unter `data/candidates/2026-10-22-ap23i3/`, Releasekennung `2026-10-22-ap23i3-candidate.1`. Manifest und Mindestconsumer sind `13.0.0`, Kantonalverfahrenskatalog `6.0.0`. Eine neue Produktrelease- oder Betriebspaketversion ist nicht beschlossen.

Die Manifestprüfsumme lautet SHA-256 `0d25a8b6272234e4affd93b9610cedca885436d1acb60855e31d51923e1e120b`. Der lokale Kandidat bleibt ausdrücklich `candidate`, die formelle Quellenreleaseprüfung `pending`. Der beschlossene technische Vertrag ist keine Freigabe des Datenreleases.

Die 44 Datenartefakte plus Manifest umfassen 113 Pfade und Qualifikationsregeln, 15 Katalogerlasse, 29 Stillstandsprofile, 21 rechtliche Feiertagsverwendungen und 35 physische Kalender. 42 Artefakte bleiben rohbytegleich zur H3-Basis. Nur Verwaltungskatalog und Sozial-Zielbindung ändern sich. Die 499 Feiertagsregeln und alle Kalenderdateien bleiben unverändert.

Die vier neuen Verwendungen GL Verwaltung, GL Gericht, TG Verwaltung und TG Gericht binden jeweils den tatsächlichen Kantonskalender, dessen Bundeskalender und den Feiertagskatalog. Historische Herkunft und aktuelle Zielreleasebindung werden getrennt geprüft. Gleiches Datum bedeutet weder geerbte Verfahrensberechtigung noch freie Vereinigung unterschiedlicher Feiertagsrollen. DEC-2026-031 gilt weiter.

Alle betroffenen Zielkopien tragen die tatsächlich neuen, konsistenten Release- und Komponentenbindungen. Die 44 nationalen Sozialregeln und 50 BE-Anbindungen bleiben fachlich unverändert. Es gibt keine ausserbernische Sozialfreigabe und keine Verlängerung des Sozialzeitfensters. Rechtsprofile 1, Feiertagskatalog 2, Regelkalender 3, Spezialregimekatalog 3, Sozialverfahrenskatalog 2 und persönliche Vorgaben 5 bleiben als Komponentenformate bestehen.

Der neue Reader prüft Format 13 und Katalog 6 unmittelbar. Er formt den Vertrag nicht in einen alten Reader um. Pfaddefinition, aktuelle skalare Qualifikation, konkrete Dauer, Quellenrolle, vollständige Kalenderabhängigkeiten und authentische Laufzeitidentität werden gemeinsam geprüft. Alte Reader, historische Schemata und Arithmetik bleiben unverändert. Gefälschte oder geklonte Kontexte sind keine Berechnungs- oder Exportfähigkeit.

## TG-Hinweiszweig und zeitliche Grenzen

In den fünf aufgenommenen TG-Ausnahmegruppen wählt ein eindeutig vorhandener, aktuell massgebender Hinweis keine Stillstandsperioden. Ein eindeutig vollständig fehlender Hinweis wählt die drei Perioden. Unvollständige, widersprüchliche, umstrittene oder hinsichtlich ihrer Fortwirkung ungeklärte Hinweise bleiben gesperrt. Kenntnis und Dringlichkeit sind kein Ersatz für die aktuelle Hinweisqualifikation.

Die Eligibility bindet Auswahlhash und vollständige Menge beider möglichen Profilhashes. Die konkrete Berechnungsprovenienz enthält den tatsächlich gewählten Zweig, Profilkennung, Profilhash und Auswahlfact. Die Oberfläche verwendet dasselbe aufgelöste Profil. Eine beschreibende Parameterauskunft allein ist weder vollständige Fallqualifikation noch Berechnungs- oder Exportfreigabe.

Das vollständige neue Fall- und Berechnungsfenster bleibt **29.08.2026–31.12.2027**. Eröffnung, sämtliche Zähltage, Stillstände und Endverschiebungen müssen gedeckt sein. Aktuelles GL-Instanzrecht nach Art. 140a und aktuelles TG-Verfahrensrecht werden zusätzlich qualifiziert. Ein Empfangsdatum 2026 beweist das anwendbare Instanzrecht nicht. Das Modellfenster garantiert keine künftige Rechtsbeständigkeit.

Die genau abgegrenzte reine Endverschiebung in neu beginnende anwendbare Ferien bleibt ohne definitives Fristresultat und Export. Übliche Wochenendverschiebungen werden dadurch nicht pauschal gesperrt. Die I1-A-bis-I1-G-Abgrenzungen bleiben vollständig erhalten.

## Schutz und tatsächliche Prüfnachweise

Die [I2-Abnahmekopie](../../outputs/ap23i2-abnahme-2026-10-22/receipt.json) sichert 92 Nutzdateien einschliesslich des ursprünglichen Abschlussnachweises. Dessen damalige negativen Freigabeflags bleiben erhalten. Die spätere menschliche I2-Abnahme und der Formatbeschluss stehen ausschliesslich in den gesonderten Belegen.

Die vor Integrationsbeginn eingefrorene [Schutzbasis](../../outputs/ap23i3-2026-10-22/protected-inputs.json) trennt 2’839 unveränderliche Eingänge, 117 konkret benannte bestehende Integrationsdateien und sieben lebende Einstiegstexte. Historische Kandidaten, freigegebene Daten, alte Reader und Tests, frühere Berichte und der fremd geänderte Projektplan-DOCX bleiben geschützt.

Fünf neue generierte SPFx-Schemakopien sind durch eine [gesonderte Ergänzungsbindung](../../outputs/ap23i3-2026-10-22/generated-schema-supplement.json) an genau diese unveränderte Schutzbasis geknüpft. Sie müssen byteidentisch ihren jeweiligen neuen Repositoryschemas sein. Die Ergänzung lockert keine bestehenden Schema- oder Betriebsgrenzen.

Der [Gesamtnachweis](../../outputs/ap23i3-2026-10-22/QA-AP23I3.json) verbindet native Daten-/Schemareproduktion, alle 249 akzeptierten vollständigen Referenzen, Produktregression, unabhängige Python-Gegenrechnung, lokale Hostlebenszyklen und den tatsächlichen minifizierten Webstand. Die unveränderte Python-Datumsarithmetik aus I2 wird ausdrücklich wiederverwendet und gegen die tatsächlichen neuen nativen Ergebnisse sowie die neuen I3-Rohbytes ausgeführt. Dies ist keine erneute juristische Quellenabnahme.

Der vollständige Zwölf-Schritte-Lauf ist bestanden: 3’110 Produktprüfungen, 50 lokale Hostlebenszyklusprüfungen, 22 Prüfungen des tatsächlich minifizierten Webbundles, neun unabhängige Python-Vertragsprüfungen und 91 Archiv-/Schutzprüfungen. Alle 249 Referenzen stimmen am nativen Reader und Rechenkern sowie in der unabhängigen Gegenrechnung. Dazu kommen 1’460 Tagesvergleiche und 15 gezielte Kalenderproben. Es gibt keine übersprungenen oder als offen markierten Node-Prüfungen.

Die [tatsächliche Browserprüfung](../../outputs/ap23i3-2026-10-22/browser-verification.json) beobachtet sechs konkrete DE-/FR-Fälle am gebauten Webstand, darunter frühe Datumseingabe, leere aktuelle Kurzfristdauer, beide TG-Hinweiszweige und den ungeklärten Sperrfall. Accessibility-Auszüge, das tatsächlich geladene Skript, lesend erfasste DOM-Geometrie und visuell kontrollierte Bilder sind gebunden. Die Zweispaltigkeit bleibt erhalten, am geprüften Desktopfenster entsteht kein horizontaler Überlauf. Dies ist eine durchgeführte CUA-/Sichtprüfung, kein vom Bindeskript erneut abgespielter automatisierter Browsertest und keine reale Geräteprüfung.

Der [isolierte SPFx-Nachweis](../../outputs/ap23i3-2026-10-22/spfx-build.json) und die [Prüfung des tatsächlichen Pakets](../../outputs/ap23i3-2026-10-22/actual-package.json) bleiben vom unveränderten Betriebspaket getrennt. Lokale Hosttests mit kontrolliertem Transport sind keine realen M365-, Geräte- oder Gasttests.

Die SPFx-Quellprüfung umfasst 261 bestandene Tests. Der tatsächliche Paketnachtest bestätigt sämtliche 170 historischen Prüfungen in 31 unveränderten Testdateien. Im [ersten Lauf](../../outputs/ap23i3-2026-10-22/spfx-build-initial-timebudget.json) überschritten drei Dateien das 60-Sekunden-Dateilimit. 160 Prüfungen bestanden, kein Assertion-Fehler trat auf, drei Dateiprüfungen brachen ab. Der vollständig wiederholte Lauf mit 240 Sekunden je Datei bleibt davon getrennt dokumentiert. Compiler und Paket wurden für diesen Nachtest nicht neu gebaut. Die tatsächlich verwendete Paketdatei umfasst 491’091 Bytes, SHA-256 `481b337573991dbdd2b41a4f327811a6d2fc4211dcb219e3c5845f009f1dd1fd`.

Die anschliessenden acht gezielten nativen Format-13-AMD-Prüfungen gegen genau dieses tatsächliche SPPKG sind ebenfalls bestanden. Sie erfassen sämtliche 34 neuen Pfade, beide aktuellen Winterhinweiszweige, Sperrgrenzen und den konfigurationsgebundenen Quellenfallback. Das Betriebspaket ist rohbytegleich erhalten. Die lokale Paketprüfung ist keine Installationsfreigabe.

**Sämtliche Kalenderexporte der lokalen Prüfansicht bleiben gesperrt, auch bei Bestandsprofilen.** Eine [ergänzende Speicherprobe](../../outputs/ap23i3-2026-10-22/export-verification.json) prüft 34 neue Pfade und jeweils beide Zweige der fünf TG-Hinweisgruppen. 39 qualifizierte synthetische Fälle erzeugen 78 DE-/FR-Kalenderinhalte ausschliesslich im Arbeitsspeicher. Geänderte Eingaben, Hinweiswechsel und kopierte Ergebnisse oder Kontexte werden abgewiesen. Keine ICS-Datei wird gespeichert oder heruntergeladen, kein Outlook-Import vorgenommen.

Der [lokale Abschlussnachweis](../../outputs/ap23i3-2026-10-22/local-completion.json) bindet endgültige Quellen, tatsächliche Bauten, Compilerkonfiguration, Paketdatei, Browserbelege und Protokolle. Eine gesonderte menschliche I3-Abnahme bleibt erforderlich.

## Lokale Prüfvorschau

[AP23I3-Vorschau](http://127.0.0.1:8806/fristenrechner/). Falls der lokale Prozess beendet wurde, im Projektordner mit der eingerichteten Node-22-Toolchain `npm run preview:ap23i3` starten. Nur synthetische Angaben verwenden.

| Auswahl und rechtlich massgebendes Empfangsdatum | Erwartung bei zutreffender aktueller Qualifikation |
| --- | --- |
| GL, Verwaltungsbeschwerde, Beschwerde gegen Endentscheid, 02.10.2026 | 30 Tage, 02.11.2026 |
| GL, Verwaltungsbeschwerde, Endentscheid mit konkret verkürzter gesetzlicher Frist, 02.10.2026, aktuell sieben Tage | 09.10.2026. Nach Speichern und Neuladen bleibt die aktuelle Tagesdauer leer |
| TG, Verwaltungsgericht, Weiterzug nach § 86 Abs. 3, 14.12.2026, massgebender Hinweis vorhanden | Gesetzlich fünf Tage, 21.12.2026, kein Stillstand |
| Derselbe TG-Fall, Hinweis eindeutig vollständig fehlend | 04.01.2027, drei Stillstandsperioden berücksichtigt |
| Derselbe TG-Fall, Hinweis ungeklärt oder widersprüchlich | Kein definitives Ergebnis oder Export |

## Nächster Haltepunkt

Nächster Haltepunkt ist die **fachlich-technische Abnahme AP23I3 durch David Steimer**. Bis dahin bleiben 14 Kantone lokal integriert und abgenommen, sechs operativ. GL/TG sind nicht vorweggenommen als weitere abgenommene Kantonsabdeckung zu zählen.

Kein regulärer Zwischenrelease vor Abschluss der vereinbarten Kantonsabdeckung gemäss DEC-2026-034. Kein Commit, Quellpush, GitHub-Update, Quellenpromotion, Upload, Installation oder Mirrorwechsel durch AP23I3. E/Q/P, AP5, AP21, Berechtigungen, Richtlinien, Hosting, Betriebspins und öffentlicher MVP09-Stand bleiben unverändert. David Steimer entscheidet in Personalunion. Technische KI-Gegenprüfungen ersetzen keine menschliche Freigabe.
