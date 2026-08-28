# Regel- und Kalenderdaten

Dieser Bereich enthält versionierte, maschinenlesbare Fachdaten. Jeder Datenstand liegt in einem eigenen, unveränderlichen Unterverzeichnis von `releases/`.

## Referenzbestand

Der AP5-Referenzbestand [`2026-08-29-ap5-candidate.1`](releases/2026-08-29-ap5-candidate.1/README.md) enthält:

- Rechtsprofile für StPO, ZPO, BGG, VwVG und VRPG Bern
- alle 47 stabilen Regel-IDs aus der Rechtsmatrix
- nationale und bernische Feiertage für 2026 bis 2028
- Fristenstillstände und dokumentierte Ausnahmen
- Quellen-, Gültigkeits- und Prüfmetadaten
- ein Release-Manifest mit sieben Nutzartefakten und SHA-256-Prüfsummen

Der Status `candidate` bezeichnet eine technisch validierte Referenzfassung. Er ist keine produktive Freigabe.

## Releasegrundsätze

- Das `manifest.json` ist der einzige Einstiegspunkt.
- Alle Nutzartefakte müssen im Manifest gelistet sein.
- GitHub, SharePoint-Mirror und manueller Import liefern exakt dieselben Bytes.
- Ein Release wird erst nach vollständiger Schema-, Referenz-, Konsistenz- und Prüfsummenprüfung aktiviert.
- Fehler führen zum vollständigen Verwerfen des neuen Stands. Der letzte validierte Stand bleibt aktiv.
- Bereits publizierte Releaseverzeichnisse werden nicht überschrieben.
- Amtliche oder fremde Inhalte werden nicht allein durch ihre Aufnahme unter CC BY-SA 4.0 gestellt.

Die fachliche Vorlage bleibt die [Rechtsmatrix für den MVP](../docs/fachrecht/rechtsmatrix-mvp.md). Das technische Format ist im [Datenrelease-Format](../docs/architektur/datenrelease-format.md) beschrieben.
