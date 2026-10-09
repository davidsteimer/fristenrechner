# MVP 0.7 · Lokaler Rückfallnachweis und Entscheidvorlage

Stand: 8. Oktober 2026. **Lokale Ausarbeitung und Laborprüfung abgeschlossen, sieben Diagnosefälle bestanden. Keine Installation, kein Browserdateneingriff und kein neuer Paketbau.** Der Auftrag von David Steimer «Wir arbeiten zuerst diesen Rückfallweg lokal aus und prüfen ihn» umfasst das Labor und diesen Vorschlag, nicht dessen betrieblichen Vollzug. Die [Installationsvorlage](eq-installationsvorlage-mvp07.md) bleibt an das unveränderte Paket `0.7.0.0` gebunden. R07C-H01 bleibt bis zur Entscheidung und Prüfung des vollständigen Wiederherstellungswegs offen.

## 1 Ergebnis und Empfehlung

Ein Rückfall muss drei Dinge zusammenführen: kompatible Rechtsdaten, tatsächlich ausgelieferten Programmcode und einen verwendbaren lokalen Speicher. Nur Paket und Mirror zurückzustellen reicht nicht.

| Weg | Eignung | Grenze |
| --- | --- | --- |
| A · Alte Format-6-Mirrors unter Consumer 0.7 | Erste Wahl bei einem ausschliesslichen Daten-/Konfigurationsfehler. Kein Löschen des Rechenspeichers nötig | Kein Rückfall des Programmcodes |
| B · Alter Consumer nach gezieltem Reset der Rechnerdatenbank | Kann die lokale Versionssperre beseitigen und einen frischen Format-6-Abruf ermöglichen | Eingriff je betroffenem Speicherkontext. Alter originweiter Cache bleibt strukturell anfällig für eine AP5-Verwechslung. SharePoint-Auslieferung des alten Codes ist damit nicht bewiesen |
| C · Neuer Consumer mit getrenntem Datenbanknamen | Verhindert das Upgrade der bisherigen Datenbank bei noch nicht umgestellten Nutzern | Nur vorbeugende Variante. Löst weder alte AP5-Zeiger noch v4-Standards oder den Paket-Rückweg. Im bestehenden Paket nicht umgesetzt |
| D · Eigenes Wiederherstellungspaket als höhere SPFx-Version | Bevorzugter Folgeauftrag für einen vollständigen Rückfall ohne manuelle Datenbanklöschung. Archivierte MVP06-Fachlogik mit sicherer Speicheranbindung | Neues, separat zu bauendes und zu prüfendes Artefakt. Kein bestehender Freigabeumfang und keine bereits nachgewiesene Hostinstallation |

**Empfehlung:** Den Datenrückfall nach A beibehalten. Für den vollständigen Code-Rückfall vor dem Katalogwechsel einen begrenzten Wiederherstellungskandidaten nach D vorbereiten. Der Reset nach B bleibt eine ausdrücklich bedingte Alternative, nicht der Standard für beliebige Gäste und Geräte. Eine reine Umbenennung der neuen Datenbank nach C rechtfertigt für sich allein keinen zusätzlichen Releasebau.

## 2 Nachweisgrundlage und Abgrenzung

Das Labor verwendet `fake-indexeddb` ausschliesslich im Node-Prozess. Die Provider lesen die tatsächlichen lokalen Releasebytes statt eines Netzwerks. `mode = network` bedeutet hier **erfolgreicher Providerabruf im Simulator**, keinen SharePoint- oder Teamsabruf. Die unveränderten archivierten Implementierungen werden mit ihren Baueingängen abgeglichen. Die alten generierten Importpfade werden aus bytegleichen Archivkopien rekonstruiert.

| Grundlage | Bindung |
| --- | --- |
| MVP07-Paket | `fristenrechner-schweiz-0.7.0.0.sppkg`, SHA-256 `bc8abe70c791f58d2cea9fb66ea568f604bcacae35fec9ae29aadeca5e0c6e09` |
| Historisches Paket | `fristenrechner-schweiz-0.6.0.1.sppkg`, SHA-256 `60f84213507f99ec58463c84c514037d9c00bd63fdc8f02d85e52097bcf3c587` |
| Neue Daten | `2026-10-08-mvp-07-approved.1`, Manifest SHA-256 `fe1dfa0a241ac1c0e083998f05fb43e058f3c1be223f35cd276d3df436941597` |
| Bisherige Daten | `2026-10-01-mvp-06-approved.1`, Manifest SHA-256 `637cfc03c777f350031ba6c28676c685c16f25733391e1f25b0a3580016f5724` |
| Historische AP5-Daten | `2026-08-29-ap5-approved.1`, Manifest SHA-256 `c84840ad56833cab6fca254b96dd8002dbb20f94f189a948587accd69aed3de6` |

Private lokale Belege liegen unter `.work/deployments/2026-10-08-eq-mvp07/rueckfall-labor/`. Sie sind keine pauschal zur Veröffentlichung bestimmten Repositorydateien. Frühere fehlgeschlagene Laborvorprüfungen bleiben erhalten. Ein veralteter generierter Arbeitsstand von `spfx/src/product` wird nicht als gebundener Paketstand verwendet. Die Paketprüfung und die historische R07-B-Abnahme werden deshalb nicht umgeschrieben.

### Prüfergebnis

Der abschliessende Lauf `2026-10-08T21-09-28-802Z` endete am 8. Oktober 2026 um 23.10 Uhr Schweizer Zeit mit **7/7 bestandenen Diagnosefällen**. «Bestanden» bedeutet bei den Negativfällen, dass der problematische Altcodebefund wie erwartet nachgewiesen wurde. Es ist kein uneingeschränkter Rückfallpass. Die ursprünglichen Durchläufe bleiben erhalten. Die Wiederholung mit den abschliessenden Präzisierungen wurde vom Hauptagenten ausgeführt. Ein separater technischer Gegencheck der Testimplementierung fand keine offenen Korrekturpunkte.

| Prüfung | Beobachtung und Bedeutung |
| --- | --- |
| Offene Verbindung | Löschung zunächst `blocked`, derselbe Auftrag erst nach Schliessen erfolgreich. Geschlossene Storeinstanz ergibt `InvalidStateError`, neue alte Storeinstanz öffnet Version 1 |
| Upgrade, Backup und Reset | v1 → v2 → alter Store ergibt `VersionError`. Backup von Datei in zweiter simulierter Datenbank wiederhergestellt und mit 0.7 offline berechnet. Nach gezieltem Reset zunächst sichere Sperre ohne Quelle, danach erfolgreicher Format-6-Abruf und korrekte alte Berechnung |
| Getrennte Datenbank | 0.7 lädt in einer anderen Datenbank. Inhalt der alten Datenbank bleibt identisch. Bei passendem alten Format-6-Aktivstand ist der alte Offline-Wiederanlauf berechenbar |
| Alte AP5-Kollision | Bei gespeichertem AP5 liefert der alte Service auf eine offline angeforderte Format-6-Quelle **AP5**. Der Test weist ausdrücklich `safeFormat6Rollback: false` aus. Kein sicherer Datenrückfall |
| Datenrückfall im selben neuen Speicher | Derselbe aktuelle Store und Service durchlaufen Format 7 → Format 6 → AP5 → Format 6 offline → Format 7 offline. Jede noch ungesehene Quelle sperrt zunächst offline. Die späteren Abrufe liefern jeweils den richtigen Release, ohne Datenbanklöschung |
| Alter Consumer an neuen Daten | Alter Validator verweigert Format 7. Der alte Service kann stattdessen seinen originweiten Format-6-Cache verwenden. Dies belegt eine weitere Altcodegrenze, keine zulässige Format-7-Nutzung |
| Wiederherstellung als Komponentenversuch | Vorhandene v2-Datenbank, aktueller Store/Service, archivierter Validator und archivierter Rechenkern. Format 6 und AP5 getrennt berechenbar, auch offline nach eigenem Erstabruf. Unbekannte Konfiguration und Format 7 sperren. Format-7-Cache, Legacy-Stores und fremde Testdatenbank bleiben erhalten |

Zusätzliche Defaultsprüfungen sind im selben Lauf enthalten. Altes Lesen ignoriert v4, verändert dessen Rohbytes aber nicht. Ausdrückliches altes Speichern überschreibt sie mit v3 und verliert den neuen Kalenderkontext. Die exakte v3-Sicherung wurde restauriert. Ein ursprünglich fehlender Schlüssel wurde nach einem simulierten v4-Speichern wieder gezielt in den fehlenden Zustand zurückgeführt, bei separat gesichertem v4-Rohwert. Fremde Präferenzen bleiben unverändert. Ein Schutz der Standards im vorgeschlagenen Wiederherstellungspaket ist damit **noch nicht implementiert**.

Die Standardberechnung ergibt jeweils `16.09.2026 + 10 Tage → 28.09.2026`. Auf den Format-6-/Format-7-Hauptständen werden zusätzlich 50 bestehende BE-Sozialanbindungen mit jeweils Partei-/Vertretungsrolle berechnet. Das sind 100 synthetische technische Varianten mit jeweils erster Kontextzuordnung und festen Ankern, keine vollständige erneute Fachabnahme aller Fallkombinationen. AP5 wird separat mit seinem alten Datenbestand berechnet.

Die Laborbezeichnungen unterscheiden sich von der Wegtabelle: Harness `A` entspricht dem Resetweg **B**, Harness `B` der getrennten Datenbank **C**, Harness `C` dem Komponentenversuch für **D**. Der unpräfigierte Fall `same_name_current_format6_and_AP5_network_and_configured_fallback` belegt **A**.

| Beleg im privaten Laborordner | SHA-256 |
| --- | --- |
| `rollback-lab.mjs` und archivierte `runs/2026-10-08T21-09-28-802Z/harness.mjs` | `708a2f46b3ae40e66f277724d701159472de607028fc2bd28f97ab47f336c7ad` |
| `runs/2026-10-08T21-09-28-802Z/result.json` | `2db6e99b06ea56ccdee0ad3373ab8e812857bda4d9f4e8116e378b43bdbb6912` |
| `runs/2026-10-08T21-09-28-802Z/source-bindings.json` | `05d3f5efc48809994f8b070d98bf4684e078985da0dd16905d2e921a58099e54` |

409 gelesene Originaldateien sind nach dem Lauf unverändert. Die zehn abweichenden generierten Arbeitskopien sind ausdrücklich mit `usedInLab: false` erfasst. Zusätzlich hat die portable Artefaktprüfung alle drei MVP07-Archive, 41 Mirrordateien, zwölf Webdateien und 191 archivierte Baubelege erneut bestätigt. Diese Prüfung behauptet keinen Netzabruf oder GitHub-Push.

Der Laborlauf lässt sich aus `spfx/` mit dem gebundenen Node ausführen. Jeder Lauf erzeugt einen neuen Nachweisordner:

```sh
../.work/toolchains/node-v22.23.2-darwin-arm64/bin/node --import tsx ../.work/deployments/2026-10-08-eq-mvp07/rueckfall-labor/rollback-lab.mjs
```

## 3 Konkreter Datenrückfall ohne Codewechsel

1. Fehler einordnen. Dieser Weg ist nur geeignet, wenn der neue Code, seine Datenvalidierung und die Cachebindung selbst nicht als Fehlerursache gelten.
2. Betroffene bestehende Instanz und frisch gesicherte ursprüngliche Eigenschaften eindeutig zuordnen. Die vier alten Mirrors bleiben erhalten. Je altem Mirror alle elf Dateien gegen das Format-6-Manifest prüfen. Keine Dateien überschreiben und keinen neuen Alias auf einen anderen Inhalt richten.
3. Ausschliesslich den Mirrorpfad auf den ursprünglichen Format-6-Ordner zurückstellen. Für die aktuelle SharePoint-Seite die dazu nötige gezielte Publikation, für Teams das Speichern der bestehenden Registerkarte vorsehen. Provider und sonstige Eigenschaften beibehalten. Kein Eingriff in AP5.
4. Neu laden und Release-ID, Manifesthash und Quelle kontrollieren. Kein Stand einer anderen Konfiguration darf einspringen. Bei fehlendem Erstabruf und fehlendem Cache der exakten Quelle bleibt die Berechnung gesperrt.
5. StPO `16.09.2026` plus zehn Tage muss **28.09.2026** ergeben. Zusätzlich die freigegebenen Sozialpfade und AP5 getrennt prüfen. Ein Wechsel entfernt das bisherige Resultat und den Export. Ohne erneute Berechnung kein Export eines alten Ergebnisses.
6. Als **Consumer 0.7 mit Daten MVP 0.6** protokollieren, nicht als vollständig wiederhergestelltes MVP 0.6. Persönliche v4-Standards vor einem Speichertest sichern. Historische Formulare können sie beim ausdrücklichen Speichern durch v3 ersetzen.

Diese Schritte sind eine Vollzugsvorlage. Ihre tatsächliche Ausführung auf E/Q benötigt weiterhin die konkrete Freigabe.

## 4 Bedingter vollständiger Rückfall mit Speicherreset

### Vorbedingungen

Vier Rechneransichten entsprechen nicht vier Speichern. Wiederherstellungseinheit ist die Kombination aus Gerät, Browser oder Teams-Webview, Profil, Origin und gegebenenfalls Speicherpartition. Auch eine Sitzung mit gescheitertem ersten Releaseabruf kann die Datenbank schon auf Version 2 gebracht haben. Bekannte, aber nicht zuordenbare Verbraucher des gemeinsamen Pakets führen zum Halt. Dies erlaubt keine pauschale Tenantinventur.

Vor einer Umstellung für jeden zugänglichen Testkontext festhalten:

- Kontextkennung, betroffene Rechneransichten, Programm-/Datenstand und Datenbankversion.
- `fristenrechner.defaults.v1` mit Existenzmarker, ursprünglichem Rohwert und SHA-256. Fehlend und leer sind nicht gleich. Nur den eigenen beauftragten Schlüssel sichern, keine übrigen Browserdaten.
- Vor einem Rückfall den dann aktuellen v4-Rohwert separat sichern. Ohne ursprüngliche v3-Sicherung keine verlustfreie Wiederherstellung alter Standards behaupten.
- Zugriff auf unveränderte alte Mirrors, Paketnachweis und bereits gesicherte Eigenschaften. Bestehende fremde Seitendentwürfe bleiben unangetastet.

### Ablauf nur nach gesonderter Freigabe

1. Weitere Umstellungen stoppen und die betroffenen Personen koordinieren. Zuerst alle in diesem Auftrag geänderten Konfigurationen auf kompatible alte Daten zurückführen. Kein alter Consumer darf einen Format-7-Mirror erhalten.
2. Den **vorher bestätigten** Paket-Rückweg ausführen. Das vorhandene Archiv allein beweist keinen zulässigen SharePoint-Downgrade. Keine improvisierte Deinstallation oder Neuanlage.
3. Sämtliche Verbindungen zur Rechnerdatenbank im betroffenen Kontext schliessen. Ein bloss unsichtbarer Teams-Tab kann ungenügend sein. Browserkontext und genaue Datenbankidentität nochmals bestätigen.
4. Vor dem Reset einen gezielten vollständigen Export dieser Rechnerdatenbank sichern, mit Version, Storestruktur, Datensätzen und Hash. Lesbarkeit und Wiederherstellung in einem isolierten Simulator prüfen. Der Export stellt gegebenenfalls Version 2 für eine Wiederaufnahme von 0.7 her, nicht Version 1 für den alten Consumer. Ohne geprüfte Sicherung kein Reset.
5. Nur die Datenbank `fristenrechner-spfx` nach einer gesonderten genau begrenzten Freigabe zurücksetzen. Nicht «alle Websitedaten löschen» verwenden. LocalStorage, Cookies, andere Datenbanken und M365-Berechtigungen bleiben unberührt. Ein `blocked`-Ereignis bedeutet einen **wartenden, nicht abgebrochenen** Löschauftrag. Weitere Mutationen anhalten, keinen zweiten Reset auslösen. Die offenen eigenen Verbindungen regulär schliessen und die endgültige Antwort desselben Auftrags abwarten und dokumentieren.
6. Der Reset entfernt die zwischengespeicherten Rechtsreleases und den alten globalen `active`-Zeiger. Er erzeugt keine Rechtsdaten. Für den Wiederanlauf ist deshalb ein erfolgreicher eigener Quellenabruf nötig. Die gesicherte v2-Datenbank darf nicht einfach als Rückfallstand für v1 reimportiert werden.
7. Den tatsächlichen alten Code frisch laden. DB-Version 1, erwarteten Format-6-Release, Manifesthash und erfolgreichen Providerabruf bestätigen, danach Referenzfälle rechnen. Ohne erfolgreiche Quelle bleibt dieser Wiederanlauf unvollständig.
8. Ursprüngliche Standards nur aus dem exakten Kontextbackup wiederherstellen und den Rohwert zurücklesen. Zuvor prüfen, dass zwischenzeitlich keine neuen Nutzerwerte gespeichert wurden. Fehlender Vorwert bleibt fehlend. Ohne Backup ursprüngliche Präferenzen als nicht wiederherstellbar ausweisen und die Neuwahl durch David entscheiden lassen.
9. AP5 separat online prüfen. Nach AP5-Besuch den aktuellen Rechner erneut erfolgreich aus seinem eigenen Mirror laden. Der alte globale Cache kann sonst beim späteren Offlinebetrieb wieder AP5 liefern. Diese Altcodegrenze wird durch den einmaligen Reset nicht dauerhaft behoben und braucht einen ausdrücklichen Betriebsentscheid.

Die simulierte Löschung im Labor ist keine Erlaubnis zur Löschung einer realen Datenbank. Insbesondere ein nicht erreichbarer Gast- oder Gerätecache lässt sich nicht zentral durch vier Site-Appupdates zurücksetzen.

## 5 Paket-Rückweg und bevorzugter Folgeauftrag

Microsoft beschreibt für SPFx das Upgrade einer bestehenden Installation auf eine neuere Katalogversion. Die Versionsanleitung verlangt beim Releasewechsel eine erhöhte Paketversion. Daraus wird **nicht** abgeleitet, dass das erneute Hochladen einer niedrigeren Version in unserer Installation zuverlässig funktioniert. Ebenso ist die Annahme «Downgrades sind immer unmöglich» damit nicht belegt. Ein realer Downgrade wurde nicht versucht. [Microsoft: ALM APIs](https://learn.microsoft.com/en-us/sharepoint/dev/apis/alm-api-for-spfx-add-ins#upgrade-installed-solution-packages), [Microsoft: Paketversion erhöhen](https://learn.microsoft.com/en-us/sharepoint/dev/spfx/team-based-development-on-sharepoint-framework#increase-solution-package-version-in-package-solutionjson).

Der bevorzugte Folgeauftrag ist daher ein **separat freizugebender Wiederherstellungskandidat**, kein stiller Ersatz des bisherigen Pakets:

- Archivierter MVP06-Fach- und UI-Code, mit belegter Herkunft und ohne neue Fachfunktion.
- Dieselben Produktidentitäten. Paketversion höher als der konkret vorausgehende Katalogstand, endgültige Versionsnummer erst mit der Auslieferungsfolge festlegen.
- Speicheranbindung, die bereits vorhandene DB-Version 2 verträgt, nur die exakte Quellenkonfiguration verwendet und den Cache vollständig erneut validiert. Alten originweiten `active`-Zeiger weder anzeigen noch als Fallback übernehmen.
- Format-6-Mirrors für die vier aktuellen Rechner, AP5 weiterhin mit seinem eigenen expliziten Pin. Kein pauschaler Paketpin, der die historische Konfiguration ersetzt.
- Begrenzter Schutz persönlicher v4-Standards. Sie dürfen weder beim Laden noch unbemerkt durch Speichern eines alten Formulars verloren gehen. Ohne echte v3-Sicherung keine erfundene Rückmigration.
- Prüfung der tatsächlichen Paketbytes für Wiederanlauf nach 0.7, fehlende/falsche Quelle, AP5-Kollision, Standards und späteren erneuten Wechsel auf 0.7. Kein blosser Test der Klassen als Paketnachweis.

Diese Zusammensetzung ist ein neues technisches Artefakt, nicht das unveränderte Paket `0.6.0.1` mit anderer Beschriftung. Die Fachabnahmen bleiben erhalten, neue Produkt- und Hostnachweise sind separat erforderlich. Ein solches Wiederherstellungspaket ist in diesem Auftrag weder gebaut noch freigegeben.

## 6 Abschluss und verbleibende Entscheide

Das Labor und die Dokumentation ersetzen keine Hostprobe. Zum Schliessen von H01 sind noch erforderlich:

1. David entscheidet über den konkreten vollständigen Wiederherstellungsweg und dessen begrenzte zusätzliche Auswirkungen.
2. Bei der empfohlenen Paketvariante den Kandidaten lokal bauen und einschliesslich tatsächlicher Paketbytes prüfen. Bei der Resetvariante den zulässigen Plattform-Rückweg sowie den tatsächlich kontrollierbaren Nutzer-/Speicherumfang klären.
3. Die Installationsvorlage an die gewählten Artefakte, den Wiederherstellungsweg und frisch bestätigte Ziele binden. Erst dann den konkreten E-/Q-Vollzug freigeben.

Produktdateien, Rechtsdaten, bestehende Releasearchive, Tenant, echte Browserdaten, GitHub und P bleiben bei dieser Ausarbeitung unverändert. Der dokumentierte Betriebsstand ist weiterhin MVP 0.6. David entscheidet in Personalunion. Codex erstellt und prüft die technischen Grundlagen ohne formelle Freigabe- oder Haftungsverantwortung.

Die vorherigen fünf lebenden Dokumentstände sind vor ihrer Nachführung separat gesichert. Die lokale Abschlussquittung unter `.work/deployments/2026-10-08-eq-mvp07/rueckfall-plan/verification.json` bindet die Dokumentkopien und ihre Links, den abschliessenden Laborlauf und den Vergleich der 1'235 geschützten lokalen Quell-, Daten- und Artefaktdateien. Alte Nachweise werden nicht nachträglich auf diesen Stand umgeschrieben.
