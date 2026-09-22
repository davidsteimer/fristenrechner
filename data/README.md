# Regel- und Kalenderdaten

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
- Fehler führen zum vollständigen Verwerfen des neuen Stands. Der letzte validierte Stand bleibt aktiv.
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
