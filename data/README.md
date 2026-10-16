# Regel- und Kalenderdaten

## Aktueller Datenstand für MVP 0.8

Stand: 16. Oktober 2026. Der freigegebene Datenrelease [`2026-10-15-mvp-08-approved.1`](releases/2026-10-15-mvp-08-approved.1/manifest.json) ist lokal übernommen und auf den vier bestehenden E-/Q-Instanzen installiert. [Q-Abnahme](../docs/betrieb/abnahme-q-mvp08.md) und [E-/Q-Vollzug](../docs/betrieb/eq-vollzugsnachweis-mvp08.md) sind dokumentiert. GitHub- und P-Bereitstellung von MVP 0.8 bleiben davon getrennt. Öffentlich ist zuletzt MVP 0.7 dokumentiert.

Manifest und Mindestconsumer verwenden Format `8.0.0`. Neu ist der [Kantonalverfahrenskatalog](releases/2026-10-15-mvp-08-approved.1/administrative-procedures/ch-cantonal-administrative-procedures.json) `1.0.0`. Regelkalender `3.0.0`, Feiertagskatalog `2.0.0`, Rechtsprofile `1.0.0`, Spezialregimekatalog `3.0.0` und Sozialverfahrenskatalog `2.0.0` behalten ihre Formate. 41 Nutzartefakte plus Manifest ergeben genau 42 Mirrordateien mit zusammen 2’425’056 Bytes. Die verbindlichen Prüfsummen stehen im [Releaseartefaktnachweis](../docs/betrieb/releaseartefakte-mvp-08.md).

Der neue Katalog umfasst fünf Tessiner und sieben Bündner Verwaltungsverfahrenspfade. Die operative Abdeckung ist auf den 29. August 2026 bis 31. Dezember 2027 begrenzt und muss sämtliche berechnungsrelevanten Tage umfassen. Nicht modellierte Spezialkonstellationen bleiben gesperrt. Die TI-O2-Sperre betrifft den Übergang durch Endverschiebung in einen neuen Fristenstillstand. Die 44 nationalen Sozialregeln und 50 Berner Anbindungen bleiben auf ihre bestehende Freigabe für Bern und 2026–2027 begrenzt. Die schweizweiten Feiertagsbindungen sowie deren bestätigte Grenzen werden nicht pauschal erweitert. [Releasehinweise MVP 0.8](../docs/betrieb/release-notes-mvp08.md)

Die [Quellenabnahme R08-A2](../docs/fachrecht/abnahme-quellen-mvp08.md), Datenfreigabe und Betriebsfreigaben sind eigenständige Nachweise. Historische Releases und Kandidaten bleiben unverändert. Die nachfolgenden Abschnitte halten deren damaligen Entwicklungs- und Freigabestand fest.

## Historische Entwicklung

Der [AP18C1-Fachkandidat aus der abgenommenen Arbeitsmappe V0.12](candidates/2026-09-22-ap18c-workbook/README.md) liegt ausserhalb der Releases. Er bewahrt die schweizweite Feiertagsgrundlage vollständig, aktiviert aber weder ein neues Produktkalenderformat noch zusätzliche Fristenprofile.

Darauf baut der [AP18C-Integrationskandidat](releases/2026-09-22-ap18c-candidate.1/README.md) gemäss beschlossenem [DEC-2026-023](../docs/entscheidungen/DEC-2026-023-schweizweiter-feiertagskatalog.md) auf. David Steimer hat AP18C am 22. September 2026 [abgenommen und den Release gestartet](../docs/fachrecht/abnahme-ap18c.md). Der eigene [MVP-0.4-Datenstand](releases/2026-09-22-mvp-04-approved.1/README.md) dokumentiert diese Abnahme, der historische Kandidat bleibt unverändert. Vollständiger Feiertagsbestand, operative Ableitung weiterhin nur CH/BE. Veröffentlichung und produktive Aktivierung sind davon getrennt.

Dieser Bereich enthält versionierte, maschinenlesbare Fachdaten. Jeder Datenstand liegt in einem eigenen, unveränderlichen Unterverzeichnis von `releases/`.

Die [Quellenprüfungen](source-reviews/README.md) liegen bewusst ausserhalb der Datenreleases. So kann eine Prüfung mit dem Ergebnis `unchanged` append-only dokumentiert werden, ohne einen neuen inhaltsgleichen Datenrelease zu erzeugen. Der Laufzeitpfad der Anwendung bleibt davon getrennt.

## Freigegebene Referenzbestände

Der abgenommene AP5-Referenzbestand [`2026-08-29-ap5-approved.1`](releases/2026-08-29-ap5-approved.1/README.md) enthält:

- Rechtsprofile für StPO, ZPO, BGG, VwVG und VRPG Bern
- alle 47 stabilen Regel-IDs aus der Rechtsmatrix
- nationale und bernische Feiertage für 2026 bis 2028
- Fristenstillstände und dokumentierte Ausnahmen
- Quellen-, Gültigkeits- und Prüfmetadaten
- ein Release-Manifest mit sieben Nutzartefakten und SHA-256-Prüfsummen

Der Status `approved` bezeichnet den durch David Steimer freigegebenen Fachdatenstand für die weitere Umsetzung. Er ist keine produktive Freigabe der noch zu entwickelnden Anwendung.

Der vorangehende Candidate [`2026-08-29-ap5-candidate.1`](releases/2026-08-29-ap5-candidate.1/README.md) bleibt als unveränderlicher Nachweis erhalten. Im freigegebenen Release sind die fachlichen Regeln, Feiertage und Stillstandsperioden unverändert. Prüfstatus, prüfende Person, Manifest, Release-ID und Prüfsummen bilden die Abnahme neu ab.

Der abgenommene AP11B-Referenzbestand [`2026-08-30-ap11b-approved.1`](releases/2026-08-30-ap11b-approved.1/README.md) ergänzt das Format 2.0.0, 36 bekannte VRPG-Spezialregime und die getrennte Modellierung berechneter und behördlich gesetzter Termine. Seine acht Nutzartefakte sind byteidentisch mit dem vorangehenden AP11B-Kandidaten. Die Freigabe betrifft Datenmodell und Rechenkern. AP11C übernimmt diesen Bestand als fachliche Basis für Oberfläche und SPFx.

Der freigegebene MVP-0.2-Datenstand [`2026-08-31-mvp-02-approved.1`](releases/2026-08-31-mvp-02-approved.1/README.md) übernimmt die mit AP11C abgenommene Benutzeroberfläche und entfernt die redundanten `unknown`-Optionen aus ZPO und VRPG-BE. Die sechs unveränderten Nutzartefakte sind byteidentisch mit dem AP11C-Kandidaten. Bei ZPO und VRPG-BE unterscheiden sich ausschliesslich die nachgeführten menschlichen Prüfmetadaten.

Der freigegebene MVP-0.3-Datenstand [`2026-08-31-mvp-03-approved.1`](releases/2026-08-31-mvp-03-approved.1/README.md) ersetzt die endlichen CH-/BE-Kalenderlisten durch 15 versionierte Regeln und öffnet die Abdeckung ab 2026 nach oben. Die fünf Rechtsprofile und der Spezialregimekatalog bleiben fachlich unverändert. Ihre Prüfmetadaten weisen die Freigabe der AP12C-Migration durch David Steimer aus. Der MVP-0.2-Release bleibt als unveränderlicher Rückfallstand erhalten.

## Releasegrundsätze

- Das `manifest.json` ist der einzige Einstiegspunkt.
- Alle Nutzartefakte müssen im Manifest gelistet sein.
- GitHub, SharePoint-Mirror und manueller Import liefern exakt dieselben Bytes.
- Ein Release wird erst nach vollständiger Schema-, Referenz-, Konsistenz- und Prüfsummenprüfung aktiviert.
- Fehler führen zum vollständigen Verwerfen des neuen Stands. Ein zuletzt validierter Cache darf nur für die tatsächlich identische Datenkonfiguration verwendet werden. Ohne passenden validierten Stand bleibt die Berechnung gesperrt. Ein anderer Mirror, Releasepfad oder GitHub-Pin ist kein stiller Ersatz.
- Bereits publizierte Releaseverzeichnisse werden nicht überschrieben.
- Quellenprüfereignisse werden nach ihrer Freigabe ebenfalls nicht überschrieben. Der daraus erzeugte Index ist eine erneuerbare Sicht.
- Amtliche oder fremde Inhalte werden nicht allein durch ihre Aufnahme unter CC BY-SA 4.0 gestellt.

Die fachliche Vorlage bleibt die [Rechtsmatrix für den MVP](../docs/fachrecht/rechtsmatrix-mvp.md). Das technische Format ist im [Datenrelease-Format](../docs/architektur/datenrelease-format.md) beschrieben.

## Kandidatenbestände

Nicht produktiv migrierte Fachdaten liegen getrennt unter `candidates/` und werden von keinem Release-Manifest referenziert. Der [fachlich abgenommene AP11A-Ausgangsbestand](candidates/2026-08-30-ap11a-vrpg-be/README.md) bleibt mit seinem damaligen Format 1.0.0, 34 Regimen und dem provisorischen `R5_FIXED` unverändert nachvollziehbar.

Der [AP11B-Releasekandidat](releases/2026-08-30-ap11b-candidate.1/README.md) bleibt als unveränderlicher technischer Vorläufer des freigegebenen AP11B-Referenzbestands erhalten. Sein Status `candidate` wird nicht nachträglich umgeschrieben.

Der [AP11C-Datenkandidat](releases/2026-08-30-ap11c-candidate.1/README.md) entfernt ausschliesslich die nicht mehr sichtbaren `unknown`-Optionen aus den ZPO- und VRPG-BE-Pflichtauswahlen. Regeln, Spezialregime, Kalender und Quellen bleiben gegenüber AP11B unverändert. Der Kandidat bleibt als unveränderlicher Vorläufer erhalten und wird vom produktiven Release-Service weiterhin abgewiesen.

Der [AP12A-Kalenderkandidat](candidates/2026-08-31-ap12a-eternal-calendar/README.md) bildet dieselben CH- und BE-Kalenderdaten aus 15 versionierten Regeln statt aus jährlich erweiterten Datumslisten. Er ist kein aktivierbares Release. Ein unabhängiger Referenzvertrag bestätigt die Gleichheit mit MVP 0.2 für 2026 bis 2028 und legt Jahrhundert-, Override- und Sperrfälle für AP12B fest.

Der [AP12C-Format-3-Kandidat](releases/2026-08-31-ap12c-candidate.1/README.md) integriert diese Regelkalender in ein vollständiges Manifest `3.0.0`. Er migriert alle Stillstandssatz-Referenzen atomar auf `ch-court-holidays` und öffnet die Releaseabdeckung nach oben. Der Status `candidate` verhindert weiterhin jede Aktivierung. Der Kandidat bleibt als unveränderlicher Vorläufer des freigegebenen MVP-0.3-Datenrelease erhalten.

Der lokale [AP17C-Integrationskandidat](releases/2026-09-12-ap17c-candidate.1/README.md) ergänzt die 16 fachlich abgenommenen AP17B-Zuordnungen mit einem qualifizierten Anwendbarkeitsvertrag im bestätigten Spezialregimeformat `3.0.0`. Rechtsprofile und Regelkalender bleiben bytegleich zum freigegebenen MVP-0.3-Datenstand. Die neuen Fachpfade besitzen eine technische Fallabdeckung für 2026–2027. Der Kandidat ist lokal umgesetzt und technisch geprüft. David Steimer hat AP17C am 12. September 2026 fachlich abgenommen und den Spezialregimekatalog `3.0.0` am selben Tag ausdrücklich als technischen Produktvertrag bestätigt. Dies hält [DEC-2026-020](../docs/entscheidungen/DEC-2026-020-qualifizierter-spezialregimekatalog-v3.md) fest. Die spätere Datenpromotion sowie Veröffentlichung und Deployment stehen weiterhin aus. Produktive Datenpins und Mirror wurden nicht geändert.
