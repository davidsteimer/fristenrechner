# MVP 0.10 · Releasehinweise

Stand: 30. Oktober 2026. **E/Q ist technisch geprüft und menschlich abgenommen. Die GitHub-Veröffentlichung und die öffentliche P-Bereitstellung sind noch nicht freigegeben.** Letzter dokumentierter P-Stand ist MVP 0.9 vom 19. Oktober. Keine neue Liveinventur.

## Umfang

Der gebündelte Release übernimmt die abgenommenen Tranchen AP23F bis AP23M und R10-U1. Damit sind die allgemeinen kantonalen Verwaltungsverfahren aller 26 Kantone im vereinbarten Umfang integriert. 245 Pfade für 25 Kantone ausser Bern ergänzen das getrennte Berner Profil. Die Herkunft der Feiertage, besondere Endverschiebungen, Friststillstände, Verfahrensstadien und Fallqualifikationen bleiben sichtbar und fallbezogen gebunden.

| Bestandteil | Stand |
| --- | --- |
| Anwendung / SPFx | `0.10.0` / `0.10.0.0` |
| Datenrelease | `2026-10-28-mvp-010-approved.1` |
| Manifest / Mindestconsumer | `17.0.0` |
| Verwaltungsverfahrenskatalog | `10.0.0`, DEC-2026-042 |
| Laufzeitdateien | 45, davon 35 Kalender, fünf Rechtsprofile, vier Kataloge und das Manifest |
| Kalender / Feiertagskatalog | Format `3.0.0` / `2.0.0`, 479 Grundregeln und 20 Prozessregeln |
| Unveränderte weitere Formate | Rechtsprofile 1, Spezialregime 3, Sozialverfahren 2 |
| Produktsprachen | Deutsch und Französisch |

R10-U1 enthält die fehlende Sozialrechtsauswahl im Format-17-Kontext sowie die abgenommenen Darstellungs-/Textnachträge. Das ist vom späteren, ausschliesslich lokalen Publikationsnachtrag zu unterscheiden. P10-01 bis P10-04 ändern keine Produktlogik und keine bereits abgenommenen Paketbytes.

## Bewusste Grenzen

- Allgemeine kantonale Verfahren sind keine Vollabdeckung sämtlicher kantonaler Spezialgesetze. Fall-, Orts-, Zuständigkeits-, Stadien- und Zeitgrenzen müssen erfüllt sein. Die konkret gebundene Regel entscheidet, nicht eine pauschale Kantonszusage.
- 44 Sozialregeln und 50 Anbindungen bleiben ausschliesslich für Bern und 2026–2027 freigegeben. Die nationale Modellstruktur ist keine ausserbernische Betriebsfreigabe.
- AI-Behandlung, Januargrenzen, GR-/FR-/NE-Vorbehalte sowie der ergänzende historische Freiburger Praxisbeleg bleiben qualifiziert. Der Spiegelbeleg begründet keine eigenständige positive Fallfreigabe.
- Eigenständiges kommunales Recht ist ausgeschlossen. Kantonales Recht mit räumlich unterschiedlicher Geltung bleibt davon zu unterscheiden.
- IT/RM, Kalender-App, Karte und weitere Produktideen sind nicht Teil dieses Releases.

## Abnahme und bekannte Textbefunde

Die [Q-Abnahme](abnahme-q-mvp10.md) bestätigt den gebundenen Stand einschliesslich realer Geräteprüfung, Anmeldung des bestehenden Gasts auf Q-SharePoint und Q-Teams sowie begrenzter Outlook-Wiederverwendung. Der [technische Nachweis](eq-vollzugsnachweis-mvp10.md) hält Hostprüfungen und ihre Abweichungen getrennt fest. Alte Vorabnahmeflags werden nicht nachträglich überschrieben.

Zwei Textbefunde sind begrenzt akzeptiert und bleiben für einen Folgerelease offen:

1. **BL, B09-H01:** In der Rechenspur erscheint `administrativeOfficeClosure`. Die separate Erklärung ist verständlich. Enddatum und Endverschiebung sind korrekt.
2. **VD, B22-H01:** Beim späten Abbruch ausserhalb der Zeitabdeckung ist die Aussage «Kein Friststillstand» unzutreffend. Definitives Resultat und Export sind korrekt gesperrt.

Die [Nacharbeit](../ux/r10c-restbefunde.md) bleibt erforderlich. Diese Akzeptanz ist keine generelle Ausnahme für unpräzise Texte. Die früheren MVP09-Befunde T06-H01/B11-H01 und deren R10-U1-Korrektur sind davon getrennt.

## Bereitstellung und Wiederherstellung

Die vier bestehenden E-/Q-Instanzen verwenden eigene vollständige Mirrors. Historische AP5-Pins bleiben erhalten. Der noch nicht veröffentlichte Datencommit ist `01bbd96a296b0fc4d64cd554acc8cb122c3017a3`. Seine spätere öffentliche Erreichbarkeit muss vor Verwendung im GitHub-Provider vollständig bytegeprüft werden.

Recovery `0.10.0.1` stellt den Funktionsumfang MVP 0.9 mit gesicherten Format-9-Quellen wieder her. Es wurde nicht betrieblich eingesetzt. Der [Rückfallweg](rueckfall-mvp10.md) bleibt an die [gesonderte C-Freigabe](freigabe-r10-c.md) gebunden. Kein allgemeiner Browserdatenreset. Eine erneute reguläre Bereitstellung nach Recovery benötigt einen höheren geprüften Paketstand.

Die [Hostingplattformgrenze](hosting-plattformgrenze-header-cache-2026-10-19.md) wird gemäss Betreiberentscheid nicht erneut geprüft. Eine konkrete P-Bereitstellung, Sicherung, Stage, öffentliche Prüfmatrix und Risikoübernahme für MVP 0.10 bleiben getrennt freizugeben.

## Prüf- und Publikationsunterlagen

- [Quellenabnahme R10-A2](../fachrecht/abnahme-r10-a2.md)
- [Unveränderter lokaler Bauabschluss R10-B](lokaler-releaseabschluss-mvp10.md)
- [Lokale Publikationsvorprüfung R10-D](publikationsvorpruefung-mvp10.md)
- [Konkretes Publikationspaket](publikationspaket-mvp10.md)
- [Technische Kurzdokumentation](../architektur/technische-kurzdokumentation.md)
- [Dritt-Tenant-Installation und Mirrorbetrieb](installation-und-betrieb-dritttenants.md)
