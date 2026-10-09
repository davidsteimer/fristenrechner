# MVP 0.7 · Wiederherstellungskandidat 0.7.0.3

Stand: 9. Oktober 2026. **Lokal gebaut, anhand der tatsächlichen Paketdatei geprüft und separat archiviert. David hat den bedingten vollständigen Rückfall ausdrücklich freigegeben und R07C-H02 geschlossen.** Grundlage des Baus bleibt der [ausdrückliche lokale Auftrag](freigabe-wiederherstellung-mvp07-0703-lokal.md). Die anschliessende [gemeinsame Vollzugsfreigabe](eq-freigabe-mvp07-0702.md) bindet die [Installations- und Rückfallvorlage](eq-installationsvorlage-mvp07-0702.md). Sie belegt keine Recovery-Installation und keinen neuen Hostpass.

## Zweck und abgegrenzte Änderung

Der [Darstellungskandidat `0.7.0.2`](darstellungskorrektur-mvp07-0702.md) benötigt einen höheren Wiederherstellungsstand. Der neue Kandidat übernimmt deshalb die bereits geprüfte [Recovery-Lösung `0.7.0.1`](wiederherstellungskandidat-mvp07.md) aus deren versiegelten Baueingängen. **Keine neue Recovery-Logik und keine Übernahme der regulären MVP07-Oberfläche.**

Nur zwei Eingabedateien ändern sich. Im Paketvertrag werden Solution- und Featureversion auf `0.7.0.3` gesetzt. Im Host wird einmal das technische DOM-Attribut `data-recovery-version` angepasst. Der sichtbare deutsch-französische Hinweis auf den Wiederherstellungsmodus bleibt unverändert. Die Komponentenfassung bleibt `0.7.1`. Solution-, Feature- und Webpart-ID, Fachregeln, Schemas, Datenpins, Cachebehandlung und Standardschutz bleiben unverändert.

Die funktionale Basis bleibt MVP 0.6. Bewusst nicht enthalten sind die schweizweite MVP07-Kalenderaktivierung, die AP21-Datumseingabe und die neue Dropdown-Darstellungskorrektur. Der Wiederherstellungsmodus schützt die vorhandenen gemeinsamen Standards, verwendet getrennte Recovery-Standards und betreibt die bestehende Rechnerdatenbank weiter in Version 2. Keine Datenbanklöschung oder Zurückmigration.

## Artefakt und tatsächliche Prüfung

Geprüft ist die tatsächliche Folge `0.7.0.2` → Recovery `0.7.0.3` mit unveränderten Format-6-/Format-7-/AP5-Referenzbytes.

| Gegenstand | Endgültige Bindung |
| --- | --- |
| [Recovery-Paket](../../outputs/recovery-mvp07-0.7.0.3-2026-10-09/artifacts/fristenrechner-schweiz-recovery-0.7.0.3.sppkg) | `fristenrechner-schweiz-recovery-0.7.0.3.sppkg`, 230'584 Bytes |
| Paket SHA-256 | `9490890245e8aad54a5ec5eae731a0ee895f9fc9439dec19b371315085794702` |
| Tatsächliches Hauptbundle | `fristenrechner-web-part_412b2c98772f41242d1d.js` |
| Bundle SHA-256 | `7df7c22e3a205dd7410bd01e720f4c0223f51229192e4ef54e0736074e53df4a` |
| [Archiv- und Prüfnachweis](../../outputs/recovery-mvp07-0.7.0.3-2026-10-09/artifact-verification.json) | 314 gebundene Dateien zuzüglich Bericht, SHA-256 des Berichts `dfa5826035676cae3e853fad5e10462393c60899a3437edff740da546fadec2d` |
| Konkreter regulärer Vorläufer | `0.7.0.2`, SHA-256 `8bae0c1ea64b4482abea8fcdbd7aa5c576f6d552735b5a3e5f01a9ea68ab71db` |

| Prüfung | Ergebnis |
| --- | --- |
| Tatsächliche Stagequellen | **32/32 bestanden**, Standardschutz und asynchrone Speicherabläufe |
| Tatsächlicher Paketcode | **11/11 bestanden**, keine fehlgeschlagenen, abgebrochenen oder übersprungenen Tests. Rund 98 Sekunden |
| Darin enthaltene Sozialvarianten | **100 paketierte UI-Berechnungen**, 50 BE-Anbindungen mit zwei Feiertagsrollen. Nicht nochmals als zusätzliche 100 Testfälle gezählt |
| Bau und Paketvergleich | Kompilierung, CSS-Audit, Paketierung und eng normalisierter vollständiger Bytevergleich bestanden. Keine zusätzliche API-Berechtigung |
| Prüfhilfen | **8/8 Governance-Tests bestanden**, einschliesslich negativer Prüfungen unzulässiger Versions-, Identitäts- und Normalisierungsdeltas |
| Erhaltung | **2'248 geschützte Dateien unverändert**. 146 Baueingänge geprüft, nur die genannten zwei Dateien mit drei Literaländerungen abweichend |
| Archivprüfung | Nach dem Bau separat erneut bestanden, ohne Abhängigkeit vom temporären Buildstage |

Die elf Pakettests umfassen insbesondere die durch den echten `0.7.0.2`-Code erzeugte DB v2, Format-6-Erstabruf und Offlinebetrieb, erhaltene Format-7-Bytes, fehlende/falsche Quellen, beschädigte Caches, getrennte AP5-Bindung, blockierte alte DB-Verbindungen, verspätete Abrufe sowie geschützte v4-/v3-Standards und nicht verfügbaren Browserspeicher. Die StPO-Referenz ergibt weiterhin `28.09.2026`. Die acht bereits bekannten nicht blockierenden Lintwarnungen bleiben sichtbar. Der Build ohne eigene Jest-Suite zählt nicht als zusätzliche Testsuite.

Der isolierte [Builder](../../scripts/build-mvp07-recovery-0703.mjs) führt keinen Sync aus den heutigen Produktquellen aus. Die vollständigen alten Baueingänge werden zuerst anhand des ursprünglichen Archivberichts geprüft. Die 69 tatsächlichen Stagequelldateien werden zusätzlich vor den Quelltests bytegenau gebunden. Alle ursprünglichen Produkt-/Daten- und Artefaktarchive bleiben erhalten.

Der Vergleich des tatsächlichen Bundles erlaubt nur dieses Versionsattribut, eigene Bundle-/Lizenzdateinamen und fünf konkret gebundene, vom Buildpfad abhängige SCSS-Klassenkennungen mit exakten Vorkommenszahlen. Danach muss der Inhalt byteidentisch zum alten Recoverybundle sein. Für die Paketdateien sind zusätzlich ausschliesslich die beiden Paketversionswerte und exakt bestimmte vom Packager erzeugte UUIDs ausgenommen. Berechtigungen und Produktidentitäten dürfen nicht ändern.

Zwei vorherige Läufe sind im [gesonderten Versuchsarchiv](../../outputs/recovery-mvp07-0.7.0.3-build-attempts-2026-10-09/attempt-verification.json) ausdrücklich als **nicht bestandene Gesamtläufe** erhalten. Zunächst brach eine auf die ganze Testdatei angewendete 60-Sekunden-Grenze den Paketlauf ab. Im zweiten Lauf bestanden bereits alle 32 und elf Tests, anschliessend stoppte eine falsche Annahme des Verifikators über die minifizierte CSS-Referenzform den Paketvergleich. Korrigiert wurden ausschliesslich das Dateizeitlimit auf 180 Sekunden und die anhand der echten Bundles belegte Form der fünf Klassenreferenzen. Vor dem abschliessenden Neubau bestand der vollständige korrigierte Bytevergleich an beiden vorhandenen Paketen. Der endgültige Lauf wurde danach von Beginn an wiederholt. Keine Produktänderung entstand aus diesen Prüfhilfenkorrekturen, die Vorläufe zählen nicht zu seinem Pass. Das Nebenarchiv bindet 13 Dateien, Bericht SHA-256 `2ddcc69d8206b07df270fc57070a46f38740718df3ecbef20e8ccb12cb7e25df`.

Wiederholbare reine Archivprüfung aus dem Repository:

```sh
node scripts/build-mvp07-recovery-0703.mjs --verify
```

Der Neubau mit `--build` benötigt die gebundene Node-/SPFx-Toolchain und verweigert ein Überschreiben des vorhandenen Archivs. Wegen erzeugter Paketmetadaten und pfadabhängiger CSS-Kennungen ersetzt ein Neubau nie stillschweigend das hier gebundene Paket.

Beim abschliessenden Dokumentationscheck wurde der manuelle Testaufruf in der [lebenden Testanleitung](../../spfx/recovery-mvp07-0703/README.md) ebenfalls auf 180 Sekunden berichtigt. Der endgültige Builder und die tatsächlichen bestandenen Protokolle verwendeten diesen Wert bereits. Die archivierte frühere Anleitung bleibt als damaliger Baubeleg unverändert. Paket und ausführbarer Testcode wurden nicht geändert.

**Nachweisgrenze:** Die Quell- und Pakettests laufen lokal mit kontrollierten IndexedDB-/LocalStorage-/React-Simulationen. Sie prüfen tatsächlichen Paketcode, aber keine SharePoint-/Teamsinstallation, keinen echten DOM-/Geräteablauf und kein originales Browser-Timing. Ein anschliessender Lauf des alten `0.7.0.2`-Consumers im Speichertest belegt nur erhaltene Datenkompatibilität. Er erlaubt keinen betrieblichen Downgrade nach `0.7.0.3`.

## Betrieblicher Entscheid bleibt getrennt

David hat die [gemeinsame Vorlage](eq-installationsvorlage-mvp07-0702.md) ausdrücklich [freigegeben und H02 geschlossen](eq-freigabe-mvp07-0702.md). Katalog-/Appwechsel und reale Nachtests dürfen ausschliesslich nach den dort gebundenen Voraussetzungen und in der festgelegten Reihenfolge erfolgen. Falls ein vollständiger Rückfall nötig wird, sind die vier aktuellen Instanzen nach Abschnitt 4 kontrolliert auf ihre jeweils eigenen gesicherten Format-6-Mirrors zurückzuführen. Der historische AP5-Pin bleibt unverändert. Nach dem Recovery-Einsatz müssen alle vier aktuellen Hosts und AP5 getrennt geprüft werden. Die Freigabe ersetzt diese Vollzugsnachweise nicht.

Eine spätere reguläre MVP07-Wiederaufnahme benötigt einen erneut höheren, separat gebauten und geprüften Paketstand, beispielsweise `0.7.0.4`. Der frühere H01-Entscheid, das alte Recovery `0.7.0.1` und die ursprünglichen Nachweise bleiben unverändert erhalten. David entscheidet in Personalunion. Die technische Gegenprüfung durch ein weiteres KI-Arbeitsinstrument ersetzt weder seine Freigabe noch ein menschliches Vieraugenprinzip.
