# MVP 0.9 Quelleninventar und Prüfplan

Stand: 18. Oktober 2026. Teil von R09-A1 gemäss [Releaseplan](../betrieb/deployment-mvp-09.md).

**Das vollständige Quelleninventar ist erstellt und technisch geprüft. Der neue zusammengeführte inhaltliche Quellen- und Fassungsabgleich R09-A2 steht noch aus.** Ein lokaler Prüfsummenvergleich bestätigt vorhandene Belege, aber weder die heutige Fassung einer Onlinequelle noch eine neue rechtliche Freigabe.

## 1. Vollständige Grundgesamtheit

Das [maschinenlesbare Inventar](../../outputs/release-mvp09-2026-10-18/sources/source-inventory.json) vergleicht den abgenommenen AP23E3-Kandidaten mit dem tatsächlichen freigegebenen MVP-0.8-Datenrelease. Es berücksichtigt nicht nur die Manifestliste, sondern auch den erhaltenen Schweizer Feiertagskatalog, Aktivierungsbelege, Ausschlüsse und sämtliche konkreten Quellenverwendungen.

| Gegenstand | Ergebnis |
| --- | --- |
| Kanonische Quellenkennungen insgesamt | 251 |
| Bereits im MVP08-Gesamtbericht erfasst | 243 |
| Neue AP23E1-Kennungen | 8, davon 5 Normquellen, 1 Entscheid und 2 amtliche Materialien/Erläuterungen |
| Quellenkennungen im Kandidatenmanifest | 128 gegenüber 120 in MVP 0.8 |
| Positive oder gemeinsam verwendete Quellenkennungen | 157 |
| Ausschliessliche Ausschlussbelege | 4 |
| Ergänzende beziehungsweise beobachtete Quellen ohne aktuelle Laufzeitreferenz | 90 |
| Konkrete Laufzeit- und Ausschlussverweise | 2136, davon alle bisherigen 2078 erhalten und 58 neu |
| Davon bestehende Kennung mit neuer Verwendung | `SRC-AP23B-CH-HOL`, mit acht neuen Referenzstellen |
| Historische Arbeitsmappenverweise | 713, separat erfasst und ausdrücklich nicht aktivierend |
| Nachgeprüfte vorhandene MVP08-Belegdateien | 546 eindeutige Dateien |
| Gebundene ursprüngliche AP23E1-Registerantworten | 8 |
| Neue Onlineabrufe oder inhaltliche R09-Prüfungen in A1 | 0 |

Die drei Verwendungskategorien 157/4/90 teilen die 251 Kennungen vollständig auf. Die anderen Zählungen beschreiben überlappende Sichten und werden nicht addiert. Eine Quellenkennung ist kein Zähler physischer Erlasse. Vier der acht neuen Kennungen betreffen bereits bekannte Erlasse mit zusätzlicher administrativer Verwendung, nämlich LU VRG, LU Ruhetage, ZG VRG und AR Arbeitsgesetz-Verordnung.

Die acht neuen Kennungen fehlen erwartungsgemäss noch im operativen Quellenregister. Vier historische Registerkennungen liegen ausserhalb dieses Kandidateninventars und bleiben erhalten. **Register und Ereignisprotokoll werden erst nach Quellenabnahme im konkret freigegebenen Übernahmeschritt angepasst.**

Inventar SHA-256: `f1171c9259e27027d1f3da9850f3107897a6cb4d5b6631561165aa2e7df2b4b1`. Der Erzeuger wird mit 13 Positiv- und Negativtests geprüft. Der Nachweis enthält pro Quelle die URLs, Verwendungsstellen, bisherigen Aussagen und Belege sowie den noch offenen Prüfschritt.

## 2. Inhaltliche Schwerpunkte von R09-A2

| Gruppe | Erforderlicher Abgleich | Zulässige Wiederverwendung |
| --- | --- | --- |
| LU Verwaltungsverfahren | Geltungsbereich, Eröffnung, 30-Tage-Wege, angeordnete prozessuale Eingaben, eigene Feiertagsbindung und Abgrenzung von ZPO-/StPO- sowie Spezialrecht | E1-Volltexte und Referenzen nach unverändertem Aussage- und Fassungsnachweis |
| ZG Verwaltungsverfahren | 20-/30-Tage-Wege, Eröffnung, kein allgemeiner Stillstand, Feiertagsliste, Dringlichkeits- und Zahlungsgrenzen | E1-Befunde plus gesonderter aktueller Abgleich der laufenden Gerichtserläuterung |
| AR Verwaltungsverfahren | 5-/20-/30-Tage-Wege, Nichtgeldvollstreckung, Stufentrennung, Stillstand bis 2. Januar, bedingter Stephanstag und AR-O1 | Aktuelle Norm, historische Materialien und Praxis mit jeweils getrenntem Aussageumfang |
| Bundesfeiertag in neuen Verwaltungsbindungen | Die bestehende Kennung `SRC-AP23B-CH-HOL` erhält drei neue Feiertagsbindungen für LU/ZG/AR und fünf AR-Pfadverweise | Unveränderte Bundesfeierregel kann begründet wiederverwendet werden. Neue verfahrensrechtliche Verwendung ist zusätzlich zu prüfen |
| Bisherige 243 Quellenkennungen | Vollständiger Fassungs-/Änderungsabgleich und Prüfung der unveränderten Verwendungsstellen, einschliesslich TI/GR, Sozialverfahren und gesamtschweizerischer Feiertagsgrundlage | Der abgenommene MVP08-Bericht bildet einen Vorschlag zur Wiederverwendung, keine automatische neue Freigabe |
| Historische und derzeit nicht operative Katalogbelege | Quellenstatus, Aussagegrenze, Änderungen und allfällige Nachverfolgung dokumentieren | Keine positive Fallfreigabe allein wegen eines vorhandenen Altbelegs oder einer erfolgreichen HTTP-Antwort |

Die [abgenommene E1-Fachvorlage](abnahme-ap23e1.md) und ihre [ursprüngliche Quellenprüfung](quellenpruefung-ap23e1.md) bleiben unverändert. Auch die acht erst kürzlich erhobenen amtlichen Registerantworten sind im neuen Bericht ausdrücklich als wiederverwendete Originale zu kennzeichnen, soweit kein neuer Abruf erfolgt. Gleicher Kalendertag allein genügt nicht als Begründung.

Die acht neuen Produktkennungen sind:

- `SRC-AP23E1-LU-VRG-20210901`
- `SRC-AP23E1-LU-RTG-20260927`
- `JUD-AP23E1-LU-5A-872-2020`
- `SRC-AP23E1-ZG-VRG-20251017`
- `SRC-AP23E1-ZG-COURT-GUIDANCE`
- `SRC-AP23E1-AR-VRPG-20200101`
- `SRC-AP23E1-AR-ARGV-20160101`
- `SRC-AP23E1-AR-MATERIAL-20180703`

Zusätzliche E1-Ausschluss- und Praxisbelege sind in der fachlichen Beweiskette mitzubeurteilen, auch wenn sie keine eigene neue Laufzeitkennung erhalten. Namentlich aus Bau-, Steuer-, Beschaffungs-, Zahlungs- oder KESB-Kontexten wird keine neue positive Produktfreigabe abgeleitet.

## 3. Prüfmethode und Wiederverwendungsentscheid

Für jede Quelle beziehungsweise nachvollziehbar gruppierte identische physische Quelle werden festgehalten:

1. Identität, genauer amtlicher Fundort, massgebende Bestimmungen und tatsächlich verwendete Aussage.
2. Geltende Fassung, bereits publizierte zukünftige Änderungen, betroffene Zeitfenster sowie Abruf- oder Wiederverwendungsdatum.
3. Frisch gelesener Inhalt oder ausdrücklich wiederverwendeter, bytegebundener Vorbefund. Beides bleibt unterscheidbar.
4. Ergebnis: unverändert, Fassung geändert ohne Einfluss auf die verwendete Regel, materiell geändert, unklar oder nicht verlässlich verfügbar.
5. Auswirkung auf konkrete Pfade und Kalender, erforderliche Nacharbeit oder fortbestehender Vorbehalt.
6. Begründung, weshalb vorhandene Referenzrechnungen genügen beziehungsweise welche neuen Rechnungen notwendig sind.

Ein aktueller amtlicher Versionshinweis ohne Volltext kann einen bereits gebundenen inhaltlichen Befund stützen, ersetzt ihn aber nicht. Eine JavaScript-Portalhülle ist kein gelesener Erlasstext. Historische Nachweise werden weder neu datiert noch überschrieben. Veränderte Bytes werden eingeordnet, nicht stillschweigend als identisch ausgegeben.

Bei Rechtsprechungsfragen werden Entscheidsuche und Swiss Caselaw berücksichtigt. Ein Suchtreffer ist kein gelesener Entscheid. Ein historischer Fall mit damals anderer Normfassung beweist keinen aktuellen Datumswert. Für Normgeltung sind amtliche Primärquellen massgebend.

Die Datumsreferenzen werden gegen die tatsächlich verwendeten Normen und Zeitfenster abgeglichen. Kein fehlender künftiger Registereintrag und kein ewiger Kalender begründet eine unbegrenzte Rechtsbeständigkeit.

## 4. Vorbehalte bleiben sichtbar

- Beschlossene Behandlung des AI-Quellenkonflikts unverändert.
- Historischer Freiburger Praxisbeleg nur ergänzender gekennzeichneter Spiegel, keine eigenständige positive Fallfreigabe. Aktuelle Normgrundlage separat.
- GR-/NE-Abgrenzungen und die vier Januargrenzen bleiben voneinander getrennt.
- TI-O2 und AR-O1 bleiben innerhalb ihrer konkreten Sperrbedingungen erhalten, keine ungeprüfte Analogie.
- LU-Zeitfenster ab 27.09.2026, ZG/AR ab 29.08.2026, jeweils bis 31.12.2027. Das ist der abgenommene Produktumfang, keine heute neu bestätigte Rechtsauskunft.
- Bestehende TI-/GR- sowie Berner Sozialfreigabegrenzen werden nicht verlängert. Keine ausserbernischen Sozialanbindungen.
- AVIV Option B und OF-001 werden durch diese Releaseprüfung nicht als erledigt behandelt.
- Keine eigenständigen kommunalen Erlasse und keine pauschale Aufnahme kommunaler Instanzen oder nicht modellierter kantonaler Spezialverfahren.

## 5. Ergebnis zur Abnahme

R09-A2 liefert einen zusammengeführten Bericht mit vollständiger Abdeckung aller 251 Kennungen, begründeter Wiederverwendung, Fassungsbefunden, Belegbindungen und offen gebliebenen Punkten. Die 58 neuen Verwendungsstellen werden ausdrücklich berücksichtigt. Ein technischer Vollständigkeitsprüfer darf keine frische Quellenprüfung behaupten, nur weil eine alte Datei noch denselben Hash besitzt.

Danach erfolgt die menschliche Quellenabnahme. Erst anschliessend wird die konkrete R09-B-Vorlage für Registerübernahme, Datenrelease, Produktpins und definitive Artefakte zur gesonderten Freigabe vorgelegt.
