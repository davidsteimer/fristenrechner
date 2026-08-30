# Regel- und Kalenderdaten

Dieser Bereich enthält versionierte, maschinenlesbare Fachdaten. Jeder Datenstand liegt in einem eigenen, unveränderlichen Unterverzeichnis von `releases/`.

## Freigegebener Referenzbestand

Der abgenommene AP5-Referenzbestand [`2026-08-29-ap5-approved.1`](releases/2026-08-29-ap5-approved.1/README.md) enthält:

- Rechtsprofile für StPO, ZPO, BGG, VwVG und VRPG Bern
- alle 47 stabilen Regel-IDs aus der Rechtsmatrix
- nationale und bernische Feiertage für 2026 bis 2028
- Fristenstillstände und dokumentierte Ausnahmen
- Quellen-, Gültigkeits- und Prüfmetadaten
- ein Release-Manifest mit sieben Nutzartefakten und SHA-256-Prüfsummen

Der Status `approved` bezeichnet den durch David Steimer freigegebenen Fachdatenstand für die weitere Umsetzung. Er ist keine produktive Freigabe der noch zu entwickelnden Anwendung.

Der vorangehende Candidate [`2026-08-29-ap5-candidate.1`](releases/2026-08-29-ap5-candidate.1/README.md) bleibt als unveränderlicher Nachweis erhalten. Im freigegebenen Release sind die fachlichen Regeln, Feiertage und Stillstandsperioden unverändert. Prüfstatus, prüfende Person, Manifest, Release-ID und Prüfsummen bilden die Abnahme neu ab.

## Releasegrundsätze

- Das `manifest.json` ist der einzige Einstiegspunkt.
- Alle Nutzartefakte müssen im Manifest gelistet sein.
- GitHub, SharePoint-Mirror und manueller Import liefern exakt dieselben Bytes.
- Ein Release wird erst nach vollständiger Schema-, Referenz-, Konsistenz- und Prüfsummenprüfung aktiviert.
- Fehler führen zum vollständigen Verwerfen des neuen Stands. Der letzte validierte Stand bleibt aktiv.
- Bereits publizierte Releaseverzeichnisse werden nicht überschrieben.
- Amtliche oder fremde Inhalte werden nicht allein durch ihre Aufnahme unter CC BY-SA 4.0 gestellt.

Die fachliche Vorlage bleibt die [Rechtsmatrix für den MVP](../docs/fachrecht/rechtsmatrix-mvp.md). Das technische Format ist im [Datenrelease-Format](../docs/architektur/datenrelease-format.md) beschrieben.

## Kandidatenbestände

Nicht freigegebene Fachdaten liegen getrennt unter `candidates/` und werden von keinem produktiven Manifest referenziert. Der [AP11A-Kandidat zu den VRPG-Spezialregimen](candidates/2026-08-30-ap11a-vrpg-be/README.md) enthält das vorgeschlagene Komponentenmodell, 34 inventarisierte Regime und acht synthetische Prüffälle. Eine Übernahme in `releases/` erfolgt frühestens nach fachlicher Abnahme und der in DEC-2026-014 vorgeschlagenen Formatevolution.
