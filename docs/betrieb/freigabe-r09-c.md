# Freigabe R09-C für MVP 0.9

Erfasst am 18. Oktober 2026, fortgeführt am 19. Oktober 2026. Dieser Nachtrag dokumentiert die spätere Freigabe zur unveränderten gebundenen [Installationsvorlage](eq-installationsvorlage-mvp09.md). Deren damaliger Vorbereitungsstatus bleibt als historischer Stand erhalten.

## Entscheid von David Steimer

> Ich gebe R09C-U01, R09C-H01 und R09C-I01 gemäss der gebundenen Vorlage frei. Starte mit der frischen Ausgangssicherung. Den Mirrorupload übernehme ich anschliessend manuell.

Die Freigabe ist im [separaten Freigabebeleg](../../outputs/release-mvp09-2026-10-18/r09c/execution-approval-2026-10-18.json) mit SHA-256 `3ae728025a44e3a8839a7307c2580532467485421590fd504239729cd4f7be7a` erfasst. Die zugrunde liegende [Vorlagenbindung](../../outputs/release-mvp09-2026-10-18/r09c/proposal.json) hat SHA-256 `222dd2c7d771ebb319d827c9b23dc686d9eed291004282fe52bf9154422fc06b`.

## Bedeutung und Grenzen

- **U01:** David übernimmt nach bestandener Ausgangssicherung den manuellen Upload in die vier neuen, genau gebundenen Releaseordner. Kein Upload durch Codex und kein Überschreiben vorhandener Daten.
- **H01:** Der dokumentierte begrenzte Datenrückfall und nötigenfalls das gebundene Recovery-Paket `0.9.0.1` sind unter ihren Voraussetzungen gebilligt. Dies ist kein Auftrag, einen Rückfall vorsorglich auszuführen.
- **I01:** Der gebundene Paketwechsel auf `0.9.0.0`, die vier bestehenden Appupdates und die ausschliesslichen Mirrorpfadwechsel sind bedingt freigegeben. Die vorgeschriebenen Prüfungen C01 bis C03 bleiben vor dem Katalogwechsel zwingend. Q wird erst nach bestandenem E-Gate umgestellt.

Die gemeinsame Codewirkung, die konkreten Paketprüfsummen, die private Zielbindung, die Schutzvorgaben für AP5 und Standards sowie sämtliche Ausschlüsse gelten unverändert gemäss Vorlage. Geräteprüfung, Gastprüfung, fachliche Q-Abnahme und Outlook-Entscheidung bleiben getrennt. Diese Freigabe ist weder ein Installationsnachweis noch eine Q- oder P-Betriebsfreigabe.

## Nachführung

Der tatsächliche Fortschritt wird im [Vollzugsnachweis R09-C](eq-vollzugsnachweis-mvp09.md) dokumentiert. Änderungen an historischen Nachweisen oder den gebundenen R09-B-Artefakten sind damit nicht verbunden.

## Ergänzender Entscheid vom 19. Oktober 2026

David Steimer hat die beiden im [Vollzugsnachweis](eq-vollzugsnachweis-mvp09.md) vorgelegten Abweichungen ausdrücklich bestätigt:

- **Verspäteter T07-Prüfzeitpunkt:** Der inzwischen positiv nachgewiesene Mischbetrieb auf beiden noch unveränderten Q-Verbrauchern wird für die weitere Durchführung akzeptiert. Die Prüfung erfolgte erst nach den E-Prüfungen und nicht unmittelbar nach dem gemeinsamen Katalogwechsel. Der spätere Nachweis beseitigt diese historische Zeit- und Nachweisgrenze nicht.
- **Ergänzter Darstellungsumfang T06-H01:** Die begrenzte Akzeptanz derselben abgeschnittenen technischen SPFx-Datenquellenzeile umfasst auch die schmale französische 400-Pixel-Ansicht bei Browserzoom 100 Prozent. Die Korrektur bleibt für den Folgerelease vorgesehen. Andere Darstellungsfehler sind nicht pauschal akzeptiert, der bekannte Befund ist nicht behoben.

**C05 ist damit unter diesen zwei konkret akzeptierten Abweichungen geschlossen. C06 ist noch nicht vollzogen.** Die bereits freigegebene Fortsetzung auf den beiden bestehenden Q-Zielen bleibt an Paket `0.9.0.0`, die unveränderte Ziel- und Datenbindung sowie den dokumentierten Rückfallweg gebunden. Paket, Rechtsdaten und Prüfumfang werden durch diesen Entscheid nicht geändert.

Dieser Entscheid ist keine Geräte-, Gast- oder fachliche Q-Abnahme, kein Outlook-Importauftrag und keine Q-/P-Betriebs- oder Publikationsfreigabe. Die ursprünglichen Schutzvorgaben und Ausschlüsse bleiben bestehen. **T06-H01 bezeichnet hier ausschliesslich den Darstellungsbefund und ist nicht mit der ursprünglichen Rückfallfreigabe R09C-H01 gleichzusetzen.**

