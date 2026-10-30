# AP23J3 Lokale Integration Freiburg Genf und Jura

Stand: 27. Oktober 2026. Auftraggeber und menschlicher Entscheider: David Steimer. **Der lokale Integrationskandidat ist umgesetzt. Die zusammengeführte lokale Technikprüfung ist erfolgreich abgeschlossen, die menschliche AP23J3-Abnahme bleibt offen.** [AP23J2 ist technisch abgenommen](../fachrecht/abnahme-ap23j2.md), [DEC-2026-039 ist beschlossen](../entscheidungen/DEC-2026-039-beschluss.md). Die ursprünglichen J1-/J2-Vorlagen und Prüfstände bleiben unverändert. MVP 0.9 bleibt der freigegebene Betriebsstand.

## Umfang und Bedienung

Der eigene native Format-14-Zweig setzt Kantonalverfahrenskatalog 7 um. Die 36 neuen FR-/GE-/JU-Gruppen ergänzen 113 erhaltene Bestandsdefinitionen, insgesamt 149 Verfahrenswege. Bern bleibt das separate Bestandsprofil. Die gemeinsame Tagesarithmetik und Feiertagserzeugung bleiben unverändert.

| Kanton | Neue Gruppen | Wesentliche Unterscheidungen |
| --- | ---: | --- |
| FR | Elf | Nicht-TC und Kantonsgericht, ordentliche und Zwischenentscheidsbeschwerde, gesetzlich eröffnete Reklamation, angeordnete Eingabe, qualifizierte Dreitagesnachfrist und eigenes Begründungsverlangen nach TC-Dispositiv. Zwei beziehungsweise drei Stillstandsperioden |
| GE | Sieben | Erstverfahren, gesetzlich eröffnete Reklamation, ordentliche Beschwerde und Kostenreklamation. Rechtliche Verfahrensfunktion und alle sechs Sachgebietsausnahmen bleiben aktuell zu qualifizieren. Physischer gewöhnlicher Postempfang und bereits rechtlich qualifizierte Eröffnung sind getrennt |
| JU | 18 | Erstverfahren, Einsprache und Verwaltungsjustiz, gesetzliche und angeordnete Tagesfristen sowie echte Provisorien. Eigene Fünftagesverlangen nach mündlicher Eröffnung und dreissigtägige Begründungsverlangen, ohne fiktive Folgeeröffnung |

Frühe Datumseingabe, zweispaltiger Aufbau, feste Einzelwerte, die vier Schaltflächen, Resultat vor Parametern und die statische Beschriftung **Sitz der zuständigen Stelle** bleiben erhalten. Es gibt keine neuen Dokument-, Feiertagskanton- oder Zielorgan-Dropdowns. Die bestehende aktuelle Fallkonstellation bündelt die festen Voraussetzungen. Nur entscheidende echte Alternativen erhalten eine zusätzliche Auswahl, ohne vorausgewählten ersten Fachwert.

Der Genfer Eröffnungsmodus ist eine solche aktuelle Alternative. Für die Freiburger Reklamation wird die konkret einschlägige Grundlage ausdrücklich gewählt. Die positive Fallkonstellation beschreibt dabei «kein abweichendes Spezialverfahren», nicht pauschal das Fehlen jedes denkbaren besonderen Sachgebiets. Bereits abgenommene Abgrenzungen und separate Spezialwege werden nicht verändert.

Persönliche Vorgaben bleiben Version 5. Sie speichern den stabilen Pfad und zulässige Dauerpräferenzen, nicht Datum, Referenz, positive aktuelle Fallqualifikation, Eröffnungsmodus oder Tatsachen einer FR-/JU-Verlangenskette. Neue Angaben müssen nach Neuladen wieder aktuell qualifiziert werden. Ein unbekannter neuer Pfad wird in einem alten Kontext geschützt als nicht unterstützte Auswahl behandelt, nicht still gelöscht oder mit einem Ersatzweg überschrieben.

Deutsch und Französisch bleiben die Produktsprachen. Zuständigkeitserklärungen, Normangaben und Quellen gehören grundsätzlich in die Rechenspur. Die eigentliche Eingabe konzentriert sich auf aktuelle Angaben mit unmittelbarer Bedeutung für Frist, Stillstand oder Auslöser.

## Native Eröffnungsauflösung und Provenienz

Die neue `openingPolicy` ist eine geschlossene, am Pfad gebundene Bedeutung. Sie ist kein frei programmierbarer Ausdrucksinterpreter. Pfad, Qualifikationspolicy und Eligibility werden gemeinsam geprüft. Die Eligibility enthält zusätzlich den exakten Eröffnungspolicyhash.

| Aktueller Fall | Native Verarbeitung |
| --- | --- |
| Bereits qualifizierter besonderer FR-/JU-Auslöser | Ereignistag unverändert als rechtlich massgebenden Auslösetag übernehmen. Tageszählung ab dem Folgetag |
| Bereits rechtlich qualifizierte Genfer Eröffnung | Keine erneute Verschiebung des Eröffnungstags |
| Ausdrücklich bestätigter physischer Empfang gewöhnlicher Genfer Post | Samstag, Sonntag oder gebundenen gesetzlichen Feiertag vorgelagert auf den nächsten Werktag verschieben. Danach die Tagesfrist genau einmal ab dem Folgetag zählen |
| Fehlender, unbekannter oder widersprüchlicher aktueller Modus | Kein definitives Resultat und kein Export. Keine Ergänzung aus Datum, früherer Berechnung oder persönlichem Standard |

Gerichtsferien beeinflussen die anschliessende Zählung, nicht den rechtlichen Empfang gewöhnlicher Post. Der Genfer Ersatzmontag am 02.08.2027 wird nicht erfunden. Eine zulässige Endverschiebung nach der Zählung bleibt von der vorgelagerten Eröffnungsauflösung getrennt.

Die tief eingefrorene Ergebnisprovenienz enthält Eingabebedeutung, aktuellen Modus, Eingabedatum, aufgelösten rechtlichen Eröffnungstag, vorgeschaltete Verschiebungstage, Policyhash sowie die tatsächlich berührten Normsegmente und Quellen. Die beschreibende Provenienz ist keine serialisierbare Rechen- oder Exportberechtigung. Kopierte oder erfundene Kontexte begründen keine authentische Laufzeitfähigkeit.

FR-Nachfrist setzt die qualifizierte Ablehnung eines rechtzeitigen Erstreckungsgesuchs, das bereits abgelaufene ursprüngliche Ende und das Fehlen einer länger fortbestehenden Frist voraus. Ein früherer Ablehnungsentscheid verkürzt keine noch laufende Frist. Das JU-Bestätigungs- oder Begründungsverlangen ist jeweils ein eigener Weg. Sein errechnetes Ende erzeugt weder eine tatsächliche schriftliche Bestätigung noch einen neuen Beschwerdelauf.

## Datenbindung und unveränderter Fachbestand

Der neue Kandidat liegt unter `data/candidates/2026-10-27-ap23j3/`, Releasekennung `2026-10-27-ap23j3-candidate.1`. Manifest und Mindestconsumer sind **14.0.0**, Kantonalverfahrenskatalog **7.0.0**. Eine neue Produktrelease- oder Betriebspaketversion ist damit nicht beschlossen.

Manifest-SHA-256: `b059a7b1e7812d6e345b350e6d02a34ca0acfb92763aa9a25b332669cbb5b989`.

Die 44 Datenartefakte plus Manifest umfassen 149 Pfade und Policies, 18 Erlasse, 35 Stillstandsprofile, 27 rechtliche Feiertagsverwendungen und 35 physische Kalender. **42 Artefakte bleiben rohbytegleich zur I3-Basis.** Nur Verwaltungskatalog und Sozial-Zielbindung ändern sich. Die neue Zielreleasebindung ist keine Erweiterung der Sozialfreigabe. Die 44 Sozialregeln und 50 BE-Anbindungen bleiben fachlich und zeitlich unverändert.

Alle betroffenen Zielkopien tragen die tatsächlich kohärenten neuen Release- und Komponentenbindungen. Die 113 bisherigen Pfaddefinitionen, Revisionen und Qualifikationsregeln bleiben erhalten. Historische Herkunft und aktuelle Zielreleasebindung werden getrennt geprüft. Es wird kein alter Reader unter einem neuen Etikett aufgerufen und kein Format-14-Datensatz auf Format 13 zurückgestuft.

Die sechs neuen rechtlichen Verwendungen FR Nicht-TC/TC, GE Erstverfahren/Rechtsmittel und JU Erstverfahren/Rechtsmittel binden die bestehenden Kantonskalender, den Bundeskalender und den Feiertagskatalog. Der qualifizierte Zielstellensitz und die tatsächliche Funktion zählen. Conseil d'Etat oder Gouvernement werden nicht bloss wegen ihres organisatorischen Namens aus der Verwaltungsjustiz ausgeschlossen. Gleiche physische Datumsdaten verleihen keine automatisch geerbte Verfahrensberechtigung.

Alle 35 Kalenderdateien bleiben unverändert. Die 499 Katalogregeln bestehen aus 479 Grundregeln und 20 bereits bestehenden Prozessergänzungen. Die 35 Kalenderdateien enthalten auf ihrer eigenen Projektionsstufe 431 Regeln. Keine dieser unterschiedlichen Zählarten bedeutet eine Datenänderung. Es gibt keine freie Listenvereinigung, neue Ersatzfeiertage oder zusätzliche kommunale Eigenregelung.

Quellenrollen und der J2-Crosswalk bleiben erhalten. Der genau bezeichnete historische HTTP-Verweis ist ausschliesslich als gebundene Belegmetadaten-Ausnahme zulässig. Daraus folgt keine allgemeine HTTP-/Domainöffnung und kein automatischer Abruf einer fremden Quelle durch den Rechner. Materialien, historische Fassungen und ergänzende Urteile werden nicht als aktuelle Ersatznormen ausgegeben.

## Zeitfenster und Sperren

Das neue vollständige Fallfenster bleibt **29.08.2026–31.12.2027**. Auslöser beziehungsweise physischer Empfang, rechtliche Eröffnung und sämtliche Zähl-, Stillstands- und Endverschiebungstage müssen gedeckt sein. Die native Deckungsprüfung umfasst insbesondere auch jeden vorgeschalteten Genfer Eröffnungstag.

FR bindet CPJA 7947 bis 30.09.2026 und CPJA 8637 ab 01.10.2026 in disjunkten Abschnitten, jeweils mit der konstanten LJ-Grundlage. Bei einer Berechnung über die Fassungsgrenze weist die Provenienz beide tatsächlich verwendeten Abschnitte aus, nicht zwei gleichzeitig geltende CPJA-Fassungen. Das Fallfenster verspricht keine zukünftige Rechtsbeständigkeit.

Die begrenzte reine Endverschiebung in neu beginnenden anwendbaren Stillstand bleibt ohne definitives Ergebnis und Export. Das sperrt weder ganze Monate noch pauschal alle Verfahren eines Kantons. Sämtliche J1-A-bis-J1-G-Grenzen bleiben erhalten. Weitere Sozialanbindungen, eigenständiges kommunales Recht und nicht konkret abgenommene kantonale Spezialverfahren werden nicht mitfreigegeben.

## Schutz und Prüfnachweise

Die [J2-Abnahmekopie](../../outputs/ap23j2-abnahme-2026-10-27/receipt.json) sichert den tatsächlichen Vertrags- und Prüfstand einschliesslich seines ursprünglichen Abschlussnachweises. Ihre Prüfsumme lautet `d4a4bffea18680a56ae232cc212ea2b91c5c0644249f4acd670359d823b90fed`. Historische Vorabnahme- und Betriebsflags bleiben unverändert. Die spätere technische Abnahme steht in den separaten menschlichen Belegen.

Die vor Integrationsbeginn eingefrorene [Ausgangsbindung](../../outputs/ap23j3-2026-10-27/protected-inputs.json) schützt 4’466 eindeutige Bestandsdateien und trennt 127 ausdrücklich benannte Integrationsdateien sowie sieben lebende Einstiegstexte davon. Alte Reader, Schemata, akzeptierte Daten, bestehende Tests, historische Nachweise und der fremd geänderte Projektplan-DOCX bleiben geschützt.

Die [enge Ergänzungsbindung](../../outputs/ap23j3-2026-10-27/native-opening-integration-supplement.json) erlaubt ausschliesslich die zusätzliche neue Datei `src/core/holidayActivationV14.ts`. Sie erneuert oder lockert den ursprünglichen Guard nicht und erlaubt keine Änderung einer bestehenden Datei. Bestehende Versionsmodule bleiben unveränderlich.

Der [native Referenznachweis](../../outputs/ap23j3-2026-10-27/native-reference-verification.json) vergleicht alle **673 J2-Erwartungen vollständig**, einschliesslich Eröffnungsprovenienz und konkreter Sperrgründe. Die [unabhängige Python-Gegenrechnung](../../outputs/ap23j3-2026-10-27/independent-verification.json) bestätigt die neuen Kandidatenbytes und Referenzen separat. Dazu gehören 2’190 Tagesvergleiche und 13 Kalenderproben. Die 78 händischen J1-Fachreferenzen bleiben von 595 ergänzenden synthetischen Proben getrennt.

Die [Speicherprobe des Kalenderexports](../../outputs/ap23j3-2026-10-27/export-verification.json) umfasst 44 synthetische Fälle und 88 DE-/FR-Kalenderinhalte ausschliesslich im Arbeitsspeicher. Sämtliche Exporte der lokalen Prüfansicht bleiben gesperrt, auch bei Bestandsprofilen. Keine ICS-Datei wird gespeichert oder heruntergeladen, kein Outlook-Import vorgenommen.

Die zusammengeführte lokale Technikprüfung ist erfolgreich abgeschlossen. Die folgenden Zähler bezeichnen unterschiedliche Prüfebenen und werden nicht zu einer vermeintlich überschneidungsfreien Gesamtsumme addiert. Der [gebundene lokale Abschlussnachweis](../../outputs/ap23j3-2026-10-27/local-completion.json) hält den tatsächlichen Stand und die weiterhin offene menschliche Abnahme getrennt fest.

| Prüfbereich | Tatsächlich bestandener Umfang | Nachweis |
| --- | --- | --- |
| Zusammengeführter QA-Lauf | Alle zwölf vorgesehenen Schritte erfolgreich | [QA-Bericht](../../outputs/ap23j3-2026-10-27/QA-AP23J3.json) |
| Produktregression Kern und UI | 3’191 Tests, keine Fehler, Abbrüche oder übersprungenen Tests | [Produkt-TAP](../../outputs/ap23j3-2026-10-27/product-regression.txt) |
| Kontrollierter SPFx-Hostlebenszyklus | 60 Tests | [Host-TAP](../../outputs/ap23j3-2026-10-27/host-lifecycle.txt) |
| Tatsächliches minifiziertes Webbundle | Vollständige Datei mit 27 bestandenen Tests | [Webbundle-TAP](../../outputs/ap23j3-2026-10-27/actual-web-bundle.txt) |
| J2-Archiv und J3-Schutzgrenzen | 105 Governance-Tests | [Governance-TAP](../../outputs/ap23j3-2026-10-27/j3-governance.txt) |
| Unabhängiger Python-Vertrag | Zwölf Tests | [Python-Protokoll](../../outputs/ap23j3-2026-10-27/independent-schema.txt) |
| Native und unabhängige Fachreferenzen | Je 673 vollständige Referenzvergleiche, zusätzlich 96 Eröffnungsprovenienzen, 2’190 Tagesvergleiche und 13 Kalenderproben in der Gegenrechnung | [Nativer Bericht](../../outputs/ap23j3-2026-10-27/native-reference-verification.json), [Python-Gegenrechnung](../../outputs/ap23j3-2026-10-27/independent-verification.json) |
| Isolierter regulärer SPFx-Bau | Alle sieben Schritte, 274 Quelltests und 170 historische Pakettests | [Tatsächlicher SPFx-Bau](../../outputs/ap23j3-2026-10-27/spfx-build.json) |
| Neues tatsächliches AMD-Paket | Acht Tests gegen den aus dem SPPKG geladenen Code | [Paketbericht](../../outputs/ap23j3-2026-10-27/actual-package.json) |
| Tatsächliche lokale Browserbedienung | Zehn repräsentative Fälle in Deutsch und Französisch, einschliesslich Genfer Eröffnungsalternativen, Freiburger Stillstandsprofilen und jurassischen Verlangen | [Browsernachweis](../../outputs/ap23j3-2026-10-27/browser-verification.json) |
| Kalenderexport nur im Arbeitsspeicher | 44 Fälle und 88 DE-/FR-Inhalte, keine gespeicherten Dateien und keine Outlook-Importe | [Exportnachweis](../../outputs/ap23j3-2026-10-27/export-verification.json) |

Der erste vollständige Webtestversuch wurde durch das globale Dateizeitbudget von 180’000 ms nach 21 bestandenen Tests abgebrochen. Es gab null Assertionfehler und einen abgebrochenen Dateitest. [Ursprünglicher QA-Bericht](../../outputs/ap23j3-2026-10-27/initial-web-timebudget/QA-AP23J3.failed.json), [vollständiges Timeoutprotokoll](../../outputs/ap23j3-2026-10-27/initial-web-timebudget/actual-web-bundle-timeout180000.txt) und [ursprünglicher Runner](../../outputs/ap23j3-2026-10-27/initial-web-timebudget/check-ap23j3-timeout180000.mjs) bleiben unverändert archiviert. Danach wurde die gesamte unveränderte Datei mit 900’000 ms erneut ausgeführt und mit 27 bestandenen Tests abgeschlossen, nicht bloss der abgebrochene Einzelfall. Die sechs bereits erfolgreichen Schritte wurden mit unveränderten Nachweisen wiederverwendet, alle fünf nachfolgenden Schritte ausgeführt. Die [vorher gebundene Fortsetzungsbasis](../../outputs/ap23j3-2026-10-27/initial-web-timebudget/continuation-inputs.json) mit 899 Inputs und 278 Source-/Stage-Paaren ist vor und nach dem Wiederanlauf rohbytegleich. Der Webneubau bleibt reproduzierbar byteidentisch. Produkt-, Fach- und Testquellen wurden dafür nicht geändert. Dies ist kein SPFx-Wiederholungsbau und kein kaschierter fachlicher Fehler.

Der [lokale Webbau](../../outputs/ap23j3-2026-10-27/web-build.json), die kontrollierten Hosttests und die Browserbedienung sind Integrationsnachweise. Sie sind keine realen M365-, Gast- oder Geräteprüfungen und keine Installationsfreigabe.

## Lokale Prüfvorschau

[AP23J3-Vorschau](http://127.0.0.1:8807/fristenrechner/). Falls der lokale Prozess beendet wurde, im Projektordner mit der vorhandenen Node-22-Toolchain `npm run preview:ap23j3` starten. Ausschliesslich synthetische Angaben verwenden.

| Auswahl und aktueller Auslöser | Erwartung bei zutreffender aktueller Qualifikation |
| --- | --- |
| FR, Nicht-TC, ordentliche Beschwerde, 02.10.2026 | 30 Tage, 02.11.2026 |
| GE, ordentliche Beschwerde, bereits rechtlich qualifizierte Eröffnung 05.09.2026 | 30 Tage, 05.10.2026. Keine vorgelagerte Eröffnungsverschiebung |
| GE, derselbe Weg, physischer Empfang gewöhnlicher Post 05.09.2026 | Rechtliche Eröffnung 07.09.2026, Fristende 07.10.2026 |
| GE, Eröffnungsmodus ungeklärt | Kein definitives Ergebnis oder Export |
| JU, eigenes schriftliches Bestätigungsverlangen nach mündlicher Eröffnung im Erstverfahren, 17.12.2026 | Fünf Tage, 22.12.2026. Keine fiktive spätere Bestätigung |
| JU, entsprechendes Verlangen in qualifizierter Einsprache- oder Verwaltungsjustizfunktion, 17.12.2026, kein echtes Provisorium | Fünf Tage unter Berücksichtigung des Stillstands, 07.01.2027 |

## Nächster Haltepunkt

Nächster menschlicher Haltepunkt ist die **fachlich-technische Abnahme AP23J3 durch David Steimer nach gebundener Abschlussprüfung**. Bis dahin bleiben 16 Kantone im vereinbarten allgemeinen Umfang integriert und abgenommen, davon sechs operativ. Die drei neuen Kantone werden nicht vorweggenommen als zusätzliche abgenommene Abdeckung gezählt. Erst nach einer späteren J3-Abnahme wären es 19 Kantone und sieben verbleibende: AI, BS, BL, NE, SZ, VD und VS.

Keine Quellenpromotion, neue Sozialfreigabe, Commitbildung, GitHub-Änderung oder Push, Upload, Installation, Mirroränderung oder Betriebsfreigabe. E/Q/P, AP5, AP21, Hosting, Berechtigungen, Richtlinien und öffentlicher MVP09-Stand bleiben unverändert. DEC-2026-034 bündelt weiterhin den nächsten regulären Release. David Steimer nimmt alle menschlichen Rollen wahr. Codex und getrennte technische Gegenrechnungen ersetzen keine menschliche Freigabe.
