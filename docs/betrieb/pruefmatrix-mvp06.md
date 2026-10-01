# MVP 0.6 · Prüfmatrix für E und Q

Stand: 1. Oktober 2026. **Prüfvorlage, noch kein E-/Q-Prüfnachweis. Sämtliche nachstehenden Zielumgebungsprüfungen sind offen.** Die Quellenabnahme und der lokale Buildauftrag erlauben weder Installation noch Anmeldung als Gast, Outlook-Import, GitHub-Publikation oder Änderung von Berechtigungen.

Diese Fallliste konkretisiert R06-01 bis R06-14 des [Release- und Deploymentplans](deployment-mvp-06.md). Lokale automatische Tests bleiben ein eigener Nachweis. Sie ersetzen keine Prüfung in SharePoint oder Teams.

## 1. Gegenstand und Startbedingungen

| Gegenstand | Zu prüfender Stand |
| --- | --- |
| Anwendung / SPFx-Paket | `0.6.0` / `0.6.0.0` |
| Datenrelease | `2026-10-01-mvp-06-approved.1` |
| Manifest SHA-256 | `637cfc03c777f350031ba6c28676c685c16f25733391e1f25b0a3580016f5724` |
| Lokaler Datencommit | `19b37336974f3ba7c72333763e1272425239b8cd` |
| Vertrag | Manifest und Mindestconsumer `6.0.0`, Sozialverfahrenskatalog `2.0.0`, 44 nationale Regeln / 50 Berner Anbindungen |
| Verbindliches Paket | Erst der abschliessend geprüfte Artefaktnachweis `outputs/release-mvp06-2026-10-01/artifact-verification.json` legt Paketdatei und SHA-256 fest. Kein Zwischenbuild gilt als Installationsauftrag |

Vor dem Vollzug braucht es eine ausdrückliche Freigabe des exakten Pakets und der vier Zielinstanzen. Sie muss die gemeinsame Codewirkung des Tenant-App-Katalogs einschliesslich historischer und weiterer verbundener Instanzen nennen. Konfigurationsänderungen bleiben auf die vier freigegebenen Rechner begrenzt. Tatsächlichen Iststand, vollständigen Rückfallstand und Zielidentitäten zuvor frisch prüfen.

| Kürzel | Bestehende Zielinstanz | Stand dieser Vorlage |
| --- | --- | --- |
| E-SP | Dedizierte Site «Fristenrechner Test» | Nicht ausgeführt |
| E-T | Team «Entwicklungsumgebung», Kanal «Fristenrechner», aktuelle Rechnerregisterkarte | Nicht ausgeführt |
| Q-SP | Site «Fristenrechner Gastdemo» | Nicht ausgeführt |
| Q-T | Team «Fristenrechner Gastdemo Teams», bestehende Rechnerregisterkarte | Nicht ausgeführt |

E/Q beziehen ihre Daten vor einer GitHub-Publikation aus den verifizierten SharePoint-Mirrors. Je Mirror erst einen neuen versionsbezogenen Ordner mit allen elf Laufzeitdateien vollständig hochladen und byteweise prüfen, danach die Konfiguration umstellen. Governance-Unterlagen gehören nicht in den Laufzeitordner. Ein nur lokal vorhandener Git-Datencommit ist keine erreichbare öffentliche Datenquelle. Die historische AP5-Konfiguration bleibt unverändert.

## 2. Gemeinsame Eingaben für die fünf Einsprachefälle

F01 bis F05 werden in **jeder der vier Instanzen** geprüft. Ausschliesslich synthetische Angaben verwenden. Die folgende Ausgangslage ist für jeden Fall ausdrücklich gesetzt, nicht aus gespeicherten Standards zu übernehmen:

1. **Verfahrenskontext:** «Behörde des Kantons Bern». **Erlass / Verfahrensrecht:** «VRPG Bern und Spezialrecht». **Bereich:** «Sozialversicherungsrecht».
2. **Spezialerlass:** gemäss Falltabelle. **Verfahrenshandlung / Situation:** «Einsprache gegen Verfügung».
3. Es liegt eine anfechtbare individuelle Leistungsverfügung der für den bezeichneten Fall fachlich zuständigen Stelle vor. Die individuelle Zustellung und die ordentliche Inlandskonstellation sind geklärt. Kein Auslands- oder Drittparteienfall.
4. **Datum der rechtlich massgebenden Zustellung:** `16.09.2026`. **Wohnsitz / Sitz von Partei und Vertretung:** «Partei im Kanton Bern, ohne Vertretung». Das gesetzesspezifische Kantonsfeld gemäss Tabelle ausdrücklich auf `BE` setzen.
5. Die angezeigte **Fristdauer** muss unveränderlich «30 Tage» sein. Es gibt hier keinen zusätzlich auszuwählenden Verfahrensstand und keine separate Dokumentauswahl. **Verfahrensgegenstand** und **Rechtlich massgebende Eröffnung** zeigen die modellierte Konstellation als feste Werte.
6. **Frist berechnen**. Erwartet werden Fristbeginn `17.09.2026`, nominelles und definitives Ende **`16.10.2026`**, kein Stillstand in dieser konkreten Zeitspanne und keine Endverschiebung. Die Rechenspur muss den jeweiligen Sozialpfad statt eines Rückfalls auf allgemeines VRPG zeigen.

| Fall | Spezialerlass und konkrete Fallkonstellation | Zusätzlich ausdrücklich wählen | Soll / Status |
| --- | --- | --- | --- |
| F01 · EOG | «Erwerbsersatzordnung (EOG) · individuelle Bundesleistungen». Individuelle Bundes-EO-Leistung, zuständige Ausgleichskasse, anspruchsberechtigte Person wohnt bei Zustellung in Bern. Die Kasse darf ausserhalb Bern liegen | **Wohnsitzkanton der anspruchsberechtigten Person bei fristauslösender Zustellung:** `BE` | 16.10.2026 · alle vier offen |
| F02 · FamZG | «Familienzulagen (FamZG) · obligatorische Leistungen». Obligatorische individuelle Leistung nach der für diesen Fall geklärten bernischen Familienzulagenordnung, zuständige Familienausgleichskasse | **Kanton der für den Leistungsfall geltenden Familienzulagenordnung:** `BE` | 16.10.2026 · alle vier offen |
| F03 · FLG | «Familienzulagen in der Landwirtschaft (FLG)». Individuelle Bundesleistung, zuständige kantonale Ausgleichskasse Bern für die betreffende Berechtigtengruppe. Keine blosse Zahlstelle | **Kanton der im Leistungsfall zuständigen Ausgleichskasse:** `BE` | 16.10.2026 · alle vier offen |
| F04 · MVG | «Militärversicherung (MVG) · individuelle Leistungen». Individuelle Versichertenleistung, fachlich zuständiger Militärversicherungsträger, versicherte Person wohnt bei Zustellung in Bern | **Wohnsitzkanton der versicherten Person bei fristauslösender Zustellung:** `BE` | 16.10.2026 · alle vier offen |
| F05 · ÜLG | «Überbrückungsleistungen (ÜLG) · individuelle Bundesleistungen». Individuelle Bundesleistung und für den angefochtenen Verwaltungsfall separat geklärte bernische Durchführungskompetenz mit zuständiger Ausgleichskasse Bern | **Für diesen ÜLG-Verwaltungsfall zuständiger Kanton:** `BE` | 16.10.2026 · alle vier offen |

Die Berner Wohnsitze in F01 und F04 begrenzen das Produkt, sie bestimmen nicht eine kantonale Verwaltungszuständigkeit. Bei F02 und F03 gibt es keinen zusätzlichen Berner Wohnsitzfilter. Familienzulagenordnung, zuständige Kasse und ÜLG-Durchführungskompetenz werden nicht allein aus Wohnsitz, Arbeitsplatz oder Kassensitz abgeleitet. Die separat gewählte Feiertagsanknüpfung ist in diesen Testfällen ebenfalls ein ausdrücklich gesetzter Sachverhalt.

## 3. Ergänzende Pfade

F06 bis F08 ebenfalls auf allen vier Instanzen durchführen. Basis und Feiertagsangabe bleiben wie oben, die abweichende Verfahrenshandlung und sämtliche Fallangaben sind neu zu setzen.

| Fall | Eingaben und synthetische Voraussetzungen | Erwartung / Status |
| --- | --- | --- |
| F06 · EOG, kantonale Kasse | EOG, **Verfahrenshandlung / Situation:** «Beschwerde gegen Einspracheentscheid». Individuell zugestellter Einspracheentscheid vom `16.09.2026`. **Art der im angefochtenen EO-Fall zuständigen Ausgleichskasse:** «Kantonale Ausgleichskasse». **Kanton der im angefochtenen EO-Fall zuständigen kantonalen Kasse:** `BE`. Danach **Örtlich zuständiges Versicherungsgericht dieses Falls:** `BE` und **Massgebender Zeitpunkt der Beschwerdeerhebung für die Zuständigkeit:** `16.09.2026` | 30 Tage → **16.10.2026**. Berner Kassenherkunft und Gericht getrennt, kein zusätzliches Wohnsitzfeld. Pfad `BE-SOC-EOG-CANTONAL-APP`. Alle vier offen |
| F07 · EOG, nichtkantonale Kasse | Wie F06, aber **Art der im angefochtenen EO-Fall zuständigen Ausgleichskasse:** «Nichtkantonale Ausgleichskasse (Verbandskasse oder EAK)». **Örtlich zuständiges Versicherungsgericht dieses Falls:** `BE`. **Wohnsitzkanton der versicherten Person bei Beschwerdeerhebung:** `BE`. **Massgebender Zeitpunkt der Beschwerdeerhebung für die Zuständigkeit:** `16.09.2026` | 30 Tage → **16.10.2026**. Kein Feld für den Kanton einer kantonalen Kasse. Pfad `BE-SOC-EOG-ORDINARY-APP`. Alle vier offen |
| F08 · Angeordnete Tagesfrist | MVG, **Verfahrenshandlung / Situation:** «Eingabe im laufenden Verfahren». **Verfahrensstadium:** «Verwaltungsverfahren». Konkrete prozessuale Tagesanordnung des fachlich zuständigen Militärversicherungsträgers, keine bloss unterstellte 30-Tage-Frist eines Vorbescheids. **Angeordnete Frist in Tagen:** `10`. Zustellung `16.09.2026`, Wohnsitzkanton bei Zustellung `BE` und Feiertagsangabe wie F04 | Beginn **17.09.2026**, nominelles Ende **26.09.2026**, Verschiebung über das Wochenende auf **28.09.2026**. Pfad `BE-SOC-MVG-ADMIN-ADM`. Alle vier offen |

In F06/F07 ist der Zeitpunkt der Beschwerdeerhebung eine eigenständig geklärte synthetische Fallangabe. Die zufällige Gleichheit mit dem Zustellungsdatum darf nicht als automatische Ableitung verstanden werden. Beim Wechsel der Kassenart müssen die davon abhängigen Angaben und ein vorhandenes Ergebnis bereinigt werden. Das Zustellungsdatum bleibt erhalten.

## 4. Querschnittsprüfungen

Die Hostzuordnung ist der Mindestumfang. «Offen» bedeutet stets **noch nicht ausgeführt**, auch wenn ein vergleichbarer lokaler oder früherer Release-Test bestanden ist.

| ID / Zuordnung | Vorgehen und Erfolgskriterium | Status |
| --- | --- | --- |
| Q01 · Alle vier | Tatsächliche Paketversion, Release-ID und Manifestprüfsumme abgleichen. Für jede Instanz separat den ersten Mirrorabruf ohne ihren vorgängigen Releasecache nachweisen. Netzwerkprotokoll und geladene Ressourcen binden. Keine pauschale Löschung anderer Browserdaten. Teilrelease, falscher Hash und nicht erreichbare Quelle dürfen keine ungeprüften Daten aktivieren. Fehlernachweise aus isolierten Tests binden, keinen gemeinsam benutzten Mirror beschädigen | Offen |
| Q02 · Alle vier, F01–F05 | Je Fall das spezifische Kantonsfeld zuerst bei «Bitte wählen» belassen, danach `ZH` wählen und jeweils berechnen. Kein Enddatum und kein Kalenderexport. `BE` setzen und den Positivfall wiederholen. Fehlende Feiertagsangabe ebenfalls gesperrt. Bei F06/F07 zusätzlich fehlende Kassenart beziehungsweise fehlender massgebender Zuständigkeitszeitpunkt prüfen | Offen |
| Q03 · Alle vier | In einem vollständigen 30-Tage-Einsprachefall Zustellung auf `18.11.2027` setzen. Die Frist reicht wegen des Stillstands über die geprüfte Abdeckung hinaus und muss ohne Enddatum oder Export gesperrt bleiben. Anschliessend auf den R01-Fall zurückstellen | Offen |
| Q04 · Alle vier | F01–F05 auf **Français** umstellen und erneut rechnen. Gleiches Enddatum, französische Texte und keine abgeschnittenen Pflichtangaben. Zweispaltige Desktopansicht und schmale SharePoint-/Teamsdarstellung prüfen. Die tatsächliche Teams-Navigation dokumentieren, nicht aus einer künstlich zugeschnittenen Ansicht auf einen Layoutfehler schliessen | Offen |
| Q05 · Alle vier | Datum vor Abschluss der Auswahl eingeben. Erlass, Handlung und bei EOG die Kassenart wechseln. Datum bleibt erhalten, unpassende Fallangaben und altes Ergebnis werden entfernt. **Resultat zurücksetzen** entfernt das Ergebnis. **Als Standard speichern**, neu laden und tatsächliche eigene Browserstorage-Werte kontrollieren. Datum, Zuständigkeitszeitpunkt, Kalenderreferenz und Ergebnis dürfen nicht gespeichert sein. **Standards zurücksetzen** prüfen. Nur synthetische Prüfpräferenzen verändern beziehungsweise vorherige eigene Werte sichern | Offen |
| Q06 · Alle vier | Aus F01–F05 je eine deutsche Kalenderdatei tatsächlich speichern und prüfen. Zusätzlich je Instanz eine französische Datei aus einem dieser Fälle und eine Datei zu F08 speichern. Testreferenz etwa `QA-MVP06-EOG-E-SP-DE`. Downloadhinweis abschliessen, Datei und Prüfsumme sichern. Ein ausgelöster Klick allein ist kein Downloadnachweis. Details siehe unten | Offen |
| Q07 · E-T, historische AP5-Ansicht | Registerkarte «V0.1 - Fristenrechner Schweiz» separat öffnen. Alter Datenpin und historische AP5-Daten bleiben erhalten. Mit neuem Code tatsächlich laden, bekannten historischen Positivfall wiederholen und fehlenden stillen Wechsel auf MVP-0.6-Daten nachweisen. Historische Ansicht nicht zur neuen Releasequelle umkonfigurieren | Offen |
| Q08 · Alle vier | Bestehende StPO-/ZPO-/VRPG-Pfade und bisherige Sozialerlasse gemäss R06-02 stichprobenweise wiederholen. Beispiel StPO, direkte Zustellung `16.09.2026`, zehn Tage → **28.09.2026**. Den vollständigen lokalen Nachweis aller 50 Anbindungen und der AP17-/AP19-/AP20-Referenzen zusätzlich binden, nicht als Hostprüfung umetikettieren | Offen |
| Q09 · Q-SP und Q-T | Nach entsprechender Erlaubnis tatsächliche Anmeldung des bestehenden B2B-Gasts in einer zulässigen Umgebung. Rechner, Mirrorstand, ein neuer Sozialfall und gespeicherter Export funktionieren mit Gastrechten. Eigentümertest ersetzt diesen Nachweis nicht. Bei Conditional-Access-Hindernis als nicht ausgeführt dokumentieren, keine Richtlinie umgehen oder Berechtigung ändern | Offen |
| Q10 · Q-Abschluss | David prüft die fachlichen Fälle manuell und nimmt exakt bezeichnetes Paket und Datenrelease ab. Offene Punkte, begrenzte Wiederverwendungen und allfällige Abweichungen einzeln ausweisen. Erst danach separaten Publikationsentscheid vorlegen | Offen |

**Kalenderdateien:** Mit **Referenz (optional)** und **Kalenderdatei erstellen** exportieren. Für das Ende 16.10.2026 muss die Datei einen ganztägigen Termin mit `DTSTART;VALUE=DATE:20261016` und exklusivem Ende `DTEND;VALUE=DATE:20261017` enthalten. Betreff deutsch «Fristablauf (Referenz)», französisch «Échéance du délai (Referenz)». Erwartet werden frei / transparent, Kategorie `Fristablauf` und Erinnerung `TRIGGER:-PT112H`. Für F08 lauten die Daten 28./29.09.2026. Unterschiedliche Export-UIDs sind zulässig. Dateien semantisch prüfen, DE/FR nicht auf Bytegleichheit vergleichen. Outlook-Import, Kontrolle im Kalender und anschliessendes Löschen benötigen einen eigenen Auftrag. Eine dunkelgrüne Darstellung ist vom Kategorienbestand in Outlook abhängig und durch den Dateiinhalt allein nicht nachgewiesen.

## 5. Belegführung und Abschluss

Pro Test sind Fall-ID, Zielinstanz, Browser, Kontoart, Paket- und Datenidentität, explizite Eingaben, beobachtetes Ergebnis, Zeitpunkt und Nachweispfad festzuhalten. Bei Downloads zusätzlich Dateiname und SHA-256. Zulässige Ergebnisse sind **bestanden**, **nicht bestanden** oder **nicht ausgeführt** mit Grund. Keine gemeinsame Erfolgsmarkierung für mehrere Hosts ohne deren Einzelbelege.

Ein Fehler stoppt die Freigabe des betroffenen Schritts. Änderungen oder ein Rückfall erfolgen nur innerhalb des erteilten Auftrags und mit erneuter Prüfung des zusammengehörigen Paket-/Datenstands. Diese Vorlage erteilt keine E-/Q-Betriebsfreigabe und keine P-Freigabe.

Die Solltermine stammen aus dem abgenommenen [AP20B-Referenzvertrag](../fachrecht/referenzfaelle-ap20b.md), insbesondere R01 der [literalen Datumsvektoren](../../tests/golden/candidates/ap20b-social-dates.json), zusammen mit der [AP20B-Abnahme](../fachrecht/abnahme-ap20b.md). Die historisch als Entwurf gespeicherte Vektordatei bleibt unverändert. Ihre spätere Abnahme ist separat dokumentiert. Die [Tests mit echten freigegebenen MVP-0.6-Daten](../../tests/core/mvp06-release.test.ts) ergänzen diese unabhängigen Sollwerte. Beschriftungen und Feldabhängigkeiten entsprechen [UI-Texte](../../src/ui/i18n.ts), [Sozialtexte](../../src/ui/socialMessages.ts), [VRPG-Auswahl](../../src/ui/vrpgSelection.ts) und [Rechneroberfläche](../../src/ui/FristenrechnerApp.tsx).
