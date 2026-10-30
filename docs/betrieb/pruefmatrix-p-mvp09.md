# MVP 0.9: P-Prüfmatrix

Stand: 19. Oktober 2026, Fassung 1.0. **Ausführung ausstehend.** Gebunden an die [P-Freigabevorlage](p-bereitstellungsvorlage-mvp09.md), Web-ZIP SHA-256 `f7d112b015833251d3d41a5fe418e9f8063fe85aa46e48c1dafbf053031516d3`, App `0.9.0` und Daten `2026-10-18-mvp-09-approved.1`. Diese Matrix erteilt keine Bereitstellungsfreigabe.

## 1 Stage-Gate vor der Umschaltung

1. Frische vollständige Sicherung, Ausgangsidentität MVP08, Rootintegrität und freie Zielpfade nachweisen. Zwölf unveränderte Kandidatdateien und alle bestimmten Altassets nach privatem Upload vollständig vom Hosting zurücklesen. App-`.htaccess` muss bytegleich sein. Keine privaten Dateien im öffentlichen Baum.
2. Auf der unverlinkten öffentlichen Stage alle elf öffentlichen Kandidatdateien und sämtliche Zusatzassets mittels tatsächlichem GET, Status, Länge und SHA-256 prüfen. Bei unverändertem historischem Bestand sind es 21 öffentliche Dateien und eine nicht öffentlich vorausgesetzte `.htaccess`. Zusätzlich tatsächliche App-/Datenidentität und korrekt geladene Hauptassets im Browser bestätigen. Ein vorhandener warmer Cache allein ist kein neuer Dateiabgleich.
3. In eigener isolierter Sitzung DE: C01, A13, A17 und A22 rechnen. FR: A22 rechnen. B01 und B02 müssen Ergebnis und Export sperren. Bei Kontextwechsel oder unbestätigtem Datum verschwinden Ergebnis und Export sofort. Werte gemäss Abschnitt 3.
4. Die ausgeschlossenen D04/D05 nicht erneut ausführen. Erst nach bestandenem Datei-/Identitäts-/Funktionsgate umschalten. Nicht beobachtbare oder widersprüchliche Resultate sind kein Pass.

## 2 Öffentliche Prüfungen nach der Umschaltung

| ID | Prüfung und Erfolgskriterium | Status |
| --- | --- | --- |
| D01 Kanonischer Aufruf | `https://www.steimer.ch/fristenrechner/` liefert den richtigen Rechner ohne Anmeldung, falsche Fehlerseite oder Mischstand. HTTPS-Verbindung funktionsfähig, App und Daten gemäss Bindung | Ausstehend |
| D02 Weiterleitungen | `http://steimer.ch/fristenrechner/`, `http://www.steimer.ch/fristenrechner/` und `https://steimer.ch/fristenrechner/` führen zur kanonischen HTTPS-Adresse. Keine neue Schleife oder fremdes Ziel. Keine Weiterleitungskonfiguration verändern | Ausstehend |
| D03 Vollständige Dateibytes | Alle elf öffentlichen Kandidatdateien und sämtliche bestimmten Altassets per GET gegen Länge und SHA-256 prüfen. Zwölf Kandidatdateien einschliesslich App-`.htaccess` zusätzlich im Hostingbestand bestätigen. Tatsächlich geladene Bundles, Buildmanifest, eingebettete Daten und angezeigten Regel-/Kalenderstand zuordnen. Kein neuer HEAD-/GET-Headervergleich | Ausstehend |
| D04 Sicherheitsheader | Bekannte Plattformgrenze gemäss [Betreiberentscheid](hosting-plattformgrenze-header-cache-2026-10-19.md). Kein erneuter Test, kein aktueller Pass und kein Nachweis unveränderter Ausprägung | Nicht erneut ausgeführt gemäss Entscheid 19.10.2026 |
| D05 Cache-Control | Bekannte Plattformgrenze gemäss demselben Entscheid. Keine erneute Untersuchung der mehrfachen Cachevorgaben oder HEAD-/GET-/Cache-Vergleichsreihe | Nicht erneut ausgeführt gemäss Entscheid 19.10.2026 |
| D06 Tatsächlicher Netzverkehr | In der eigenen Browsersitzung Erstladen, Berechnung und beide Kalenderdownloads beobachten. Statischer Build lädt Appressourcen vom eigenen Hosting. Keine unerwartete Übermittlung von Eingaben oder Referenzen an GitHub, SharePoint, Graph, externe CDNs oder Trackingdienste. Erweiterungsverkehr getrennt zuordnen. Cachehit nicht als frischen Transfer ausgeben | Ausstehend |
| D07 Administrative Pfade DE | Alle 25 A-Fälle und sieben zusätzlichen Stadienvarianten aus Abschnitt 3 auf P durchführen. Erwartete Resultate, tatsächliche Eingaben und qualifizierte Rechenspur dokumentieren. Keine frühere Fallqualifikation durch einen Pfadwechsel übernehmen | Ausstehend |
| D08 Sprache und Bestandsfunktionen | FR mindestens A01, A09, A13, A17, A22, A24 und C03 ausführen. C01–C06 sowie B01–B12 mit allen ausdrücklich bezeichneten Varianten auf P in DE prüfen. Lesbare Rechtsgrundlagen mit funktionierenden Links, keine Rohkennungen anstelle von Bezeichnungen. Neue Sprach-/Fachfreigaben nicht behaupten | Ausstehend |
| D09 Darstellung und Datum | DE/FR breit etwa 720 CSS-Pixel zweispaltig und schmal etwa 390 einspaltig, ohne relevantes Seitenüberlaufen. Echter Browserzoom 100 → 300 → 100 Prozent, Fokus und Schaltflächen erreichbar. Desktop-Empfangsdatum 32 CSS-Pixel Höhe, 14 CSS-Pixel Schrift, linksbündig und ohne grösseren Platzhalter. Touch-Soll 44/16 gesondert kennzeichnen. Frühe Eingabe, Vollformat, Tag+Tab, Tag.Monat+Enter und `h`+Blur mit tatsächlichem lokalen Prüftag, leeres Anfangsfeld, ungültiges Datum und optionale Kalenderauswahl prüfen | Ausstehend |
| D10 Standards 5 | In eigener Sitzung A13, A17 und A22 jeweils speichern und neu laden. Stabile Präferenzen bleiben, Empfang, Referenz, Fallqualifikation und Dringlichkeit fehlen. Resultat erst nach erneuter Fallqualifikation und Berechnung. Bestehende V5-Werte bleiben V5. Eigenen Reset mit bleibendem Resetmarker prüfen, alten V1-Schlüssel rohbytegleich lassen. Keine neue Formatmigration behaupten. Schutz beschädigter/künftiger synthetischer Rohwerte und unveränderte V4→V5-Altmigration aus E/Q begründet wiederverwenden, nicht als neue P-Tests ausweisen | Ausstehend |
| D11 Sperren, Invalidierung und Kalenderdateien | Sperren gemäss B/C-Fällen dürfen keinen definitiven Export erlauben. Unbestätigte Datumseingabe, Pfad-, Stadium-, Erlass- oder Qualifikationswechsel entfernen Resultat und Export sofort. Zwei neue DE-/FR-Dateien nach Abschnitt 4 tatsächlich speichern und prüfen. Vorher gespeicherte Datei nicht als neuer Exportnachweis verwenden | Ausstehend |
| D12 Unveränderte Umgebung und Abschluss | Root-Nutzdateien einschliesslich Root-`.htaccess`, Sitemap, `robots.txt` und bestehende Rootlinks gegen die frische Ausgangssicherung prüfen. Impressum, Quellcode-/Lizenzlinks funktionieren. Keine separate öffentliche Stage und keine privaten Sicherungs-/Fehlerdateien im Webroot. Eigene Testpräferenzen, Zoom und andere eigene Testzustände gezielt zurückgenommen, fremde Werte unangetastet. Produktionsnachweis zur Betriebsentscheidung vorlegen | Ausstehend |

Es gibt **zehn aktive D-Prüfpunkte** und zwei bewusst nicht erneut ausgeführte historische Prüfpunkte. Nicht «D01–D12 vollständig bestanden» melden. Alle hier noch ausstehenden Fälle benötigen einen neuen P-Nachweis. Begrenzte Wiederverwendung ist nur dort zulässig, wo sie ausdrücklich bezeichnet ist.

## 3 Gebundene Rechenfälle und Grenzen

Die vollständigen Eingaben, Qualifikationen, Sollwerte und Varianten werden unverändert aus [MVP09 A01–A25, B01–B12 und C01–C06](pruefmatrix-mvp09.md) übernommen. Kein Testfall wird nur anhand seines Kurznamens als ausgeführt gewertet. Die dortigen historischen Statusspalten sind kein aktueller P-Status.

Alle A-Grundfälle verwenden Empfang **02.10.2026**, direkte Zustellung und die zum jeweiligen Pfad gehörende positive aktuelle Fallqualifikation. Die gesetzlichen Dauern werden automatisch bestimmt, angeordnete Fristen mit zehn Tagen eingegeben. Keine anderen Spezialfälle als gewöhnliche Tagesfrist deklarieren.

| Fälle | Pfade / Erwartung |
| --- | --- |
| A01–A05 TI | A01 Verwaltung 30 Tage und A02 Gericht 30 Tage: 02.11.2026. A03 Erwiderung zehn Tage und A05 Kostenvorschuss zehn Tage: 12.10.2026. A04 vorsorgliche Massnahme 15 Tage: 19.10.2026 |
| A06–A12 GR | A06 Verwaltungsbeschwerde und A09 Gerichtsbeschwerde je 30 Tage: 02.11.2026. A07/A08/A10/A11/A12 je zehn Tage: 12.10.2026. Bei Gericht aktuelle Dringlichkeit ausdrücklich verneinen |
| A13–A16 LU | A13 Verwaltung und A14 Gericht je 30 Tage: 02.11.2026. A15/A16 angeordnet zehn Tage: 12.10.2026 |
| A17–A20 ZG | A17 Verwaltung 20 Tage: 22.10.2026. A18 Gericht 30 Tage: 02.11.2026. A19/A20 angeordnet zehn Tage: 12.10.2026 |
| A21–A25 AR | A21 Verwaltung 20 Tage: 22.10.2026. A22 qualifizierter Nichtgeldvollstreckungsrekurs fünf Tage: 07.10.2026. A23/A25 angeordnet zehn Tage: 12.10.2026. A24 Gericht 30 Tage: 02.11.2026 |
| Sieben zusätzliche Stadien | A03/A05 zusätzlich vor der Verwaltungsbeschwerdeinstanz, A04 zusätzlich vor Gericht, A08/A15/A19/A23 zusätzlich vor der Verwaltungsbeschwerdeinstanz. Nicht nur die Listenanzeige, sondern die jeweilige Berechnung bestätigen |

Für das Stage-Gate besonders wichtig: C01 BE/StPO `16.09.2026 + 10 → 28.09.2026`. B01 AR-O1: A24 mit 18.02.2027 gesperrt, Kontrolle 17.02.2027 → 19.03.2027. B02 TI-O2: A01 mit 17.02.2027 gesperrt. Keine Übertragung der TI-Sperre auf LU.

Die vollständigen B-/C-Varianten decken insbesondere LU/ZG ohne Gerichtsferien, AR-Gerichtsferien und Fünftagesrekurs ohne Stillstand, GR-Dringlichkeit, Zeitfenster, sofortige Invalidierung, Tageszahlen, qualifizierte Ortsanknüpfungen, Sozialfreigaben nur BE sowie Januar-/GR-/NE-Grenzen ab. Bei C04 ist die SG-Januargrenze 2029 gesperrt, der 2027-Kontrollfall berechenbar. Der dokumentierte B11-H01-Zusatztext ausserhalb der Deckung bleibt akzeptierter Textbefund, aber nur bei weiterhin korrekt gesperrtem Ergebnis und Export.

Die LU-Untergrenze bleibt 27.09.2026, ZG/AR beginnen 29.08.2026. Sämtliche erforderlichen Berechnungstage müssen im jeweiligen Profilfenster liegen. Neue Verfahren werden nicht allein aufgrund einer vorhandenen Feiertagsliste oder eines Empfangs im Jahr 2027 freigegeben. Keine ausserbernische Sozialfreigabe.

## 4 Zwei tatsächliche P-Kalenderdownloads

A22 in DE und FR auslösen, Referenzen `QA-MVP09-P-DE-AR5` und `QA-MVP09-P-FR-AR5`. Empfang 02.10.2026, gesetzliche fünf Tage. Beide Dateien im Browser tatsächlich speichern und anschliessend getrennt prüfen.

Soll: ganztägiger Beginn **07.10.2026**, exklusives Ende **08.10.2026**, frei (`TRANSP:TRANSPARENT`), Kategorie `Fristablauf`, Erinnerung `TRIGGER:-PT112H`, passende DE-/FR-Betreffzeile und synthetische Referenz. Datenrelease `2026-10-18-mvp-09-approved.1`, Pfad `ar-execution-5` und administrative Herkunft. UTF-8, CRLF, korrekte Zeilenfaltung, UID, Dateilänge und SHA-256 protokollieren. Keine Teilnehmenden, Serien oder Anhänge. Keine echten Aktenreferenzen.

**Kein Outlook-Import und keine Kalenderänderung.** Die von David bestätigte [Outlook-Wiederverwendung](outlook-wiederverwendung-mvp09.md) bleibt ein separater Alt-/Ersatznachweis. Ein durch die Browserbedienung ausgelöster, aber nicht tatsächlich gespeicherter Download ist noch kein Dateinachweis. Sicherheitseinstellungen werden dafür nicht verändert.

## 5 Belegführung und Schluss

Je Prüfung Zeitpunkt, Ziel, App-/Bundle-/Datenstand, Browser und Methode, vollständige Fallfakten, Soll und Ist sowie Belegpfad erfassen. Technische private Nachweise getrennt von öffentlich geeigneten Zusammenfassungen halten. Keine Passwörter, Tokens, privaten Hostinginventare oder fremden Browserdaten veröffentlichen.

Reale Q-Geräte-/Gastnachweise bleiben Q-Nachweise. Eine P-Touchsimulation ist kein neuer iPad-/iPhone-Nachweis. Der akzeptierte Magic-Keyboard-Umgebungsbefund und die fehlende separate VoiceOver-Prüfung bleiben qualifiziert. Die SPFx-spezifische T06-H01-Darstellung wird nicht ungeprüft auf den statischen Build übertragen. Unerwartetes relevantes Abschneiden auf P ist gesondert zu beurteilen.

Alle zehn aktiven D-Prüfpunkte müssen bestanden oder mit einer **zusätzlichen konkreten Entscheidung** behandelt sein. Andere Fehler führen zum Halt beziehungsweise gebilligten Webrückfall. Abschliessend entscheidet David separat über den P-Betrieb. Rootänderungen, Hostingkorrekturen, neue GitHub-Veröffentlichungen und allgemeine Browserdatenresets sind durch diese Matrix nicht freigegeben.
