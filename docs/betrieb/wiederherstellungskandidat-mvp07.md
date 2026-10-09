# MVP 0.7 · Lokal geprüfter Wiederherstellungskandidat

Stand: 8. Oktober 2026. **Lokal umgesetzt, gebaut und anhand der tatsächlichen Paketdatei geprüft. Nicht installiert und nicht veröffentlicht.** Der [Auftrag](freigabe-wiederherstellung-mvp07.md) führt Weg D der unverändert erhaltenen [Rückfallausarbeitung](rueckfall-mvp07.md) aus. Der lokale technische Teil von R07C-H01 ist damit belegt. Eine betriebliche Freigabe und ein tatsächlicher SharePoint-/Teams-Nachweis werden daraus nicht abgeleitet.

## 1 Ergebnis und konkrete Paketbindung

Der Kandidat stellt den **Funktionsstand MVP 0.6** bereit, verträgt aber die bereits durch MVP 0.7 auf Version 2 aktualisierte Rechnerdatenbank. Es ist ein eigenes technisches Artefakt, nicht das alte Paket mit neuer Beschriftung und auch nicht ein korrigierter regulärer MVP-0.7-Release.

| Gegenstand | Bindung |
| --- | --- |
| Datei | [fristenrechner-schweiz-recovery-0.7.0.1.sppkg](../../outputs/recovery-mvp07-0.7.0.1-2026-10-08/artifacts/fristenrechner-schweiz-recovery-0.7.0.1.sppkg) |
| Länge / SHA-256 | 230'582 Bytes / `9e028245f3df72a6c13056e45624971389c573fc89da0e9d76cf9f2188fcc7d9` |
| Paket / Feature / Komponente | `0.7.0.1` / `0.7.0.1` / `0.7.1` |
| Vorgesehene Folge | Reguläres Paket `0.7.0.0` → Wiederherstellung `0.7.0.1`. Frischer Katalogbestand vor jeder späteren Verwendung zwingend |
| Solution-ID | `13090feb-a6bf-40fa-9d3c-ec8d90516a60` |
| Feature-ID | `3edf1509-41e9-4a2f-8005-df510eec43b6` |
| Webpart-ID | `596c7f1c-4d3e-4da8-a7be-27a96024f37c` |
| Tatsächliches Hauptbundle | `fristenrechner-web-part_4dd405defd06d539d7c1.js` |
| Bundle SHA-256 | `5d4af4f97e2a318f7db637d2312f917125ba48f4374b2f82be18c03ddde64abf` |
| Daten für die vier aktuellen Rechner | Unveränderter Format-6-Release `2026-10-01-mvp-06-approved.1`, Manifest SHA-256 `637cfc03c777f350031ba6c28676c685c16f25733391e1f25b0a3580016f5724` |
| Historische AP5-Ansicht | Eigener expliziter Pin auf `2026-08-29-ap5-approved.1`. Keine Umstellung auf Format 6 |

Die vorgegebene Standardquelle des Pakets ist der bereits archivierte öffentliche MVP06-Pin `19b37336974f3ba7c72333763e1272425239b8cd`. Seine Erreichbarkeit wurde hier nicht im Netzwerk geprüft. Bestehende E-/Q-Instanzen sollen weiterhin ihren jeweils eigenen unveränderten MVP06-Mirror verwenden. Das Paket übernimmt deren Konfiguration nicht automatisch. Es enthält keine neue API-Berechtigungsanforderung und keine automatische Installation auf weiteren Sites.

## 2 Was implementiert wurde

**Archivierte Fachlogik bleibt erhalten.** 33 tatsächlich synchronisierte Core-/UI-Quelldateien wurden bytegleich mit dem archivierten korrigierten MVP06-Stand verglichen. Die 14 Schemata, der damalige Validator und die Standardquellenbindung stammen ebenfalls aus diesem Archiv. Damit fehlen im Wiederherstellungsmodus bewusst die neue schweizweite Kalenderaktivierung und die AP21-Datumseingabe. Der bestehende Format-6-Funktionsumfang mit 44 Sozialregeln und 50 Berner Anbindungen bleibt erhalten.

**Speicheranbindung ist getrennt angepasst.** Der Kandidat verwendet die Datenbank `fristenrechner-spfx` in Version 2 und nur den zur exakten Quellenkonfiguration gehörenden Cache. Gespeicherte Manifest- und Artefaktbytes werden vor der Wiederverwendung vollständig mit dem archivierten Validator neu geprüft. Der alte globale `active`-Zeiger ist kein Fallback. Format 7 wird nicht als Format 6 umgedeutet. Vorhandene Format-7-Einträge und Legacy-Stores werden nicht gelöscht.

**Persönliche Standards sind geschützt.** Ein zwingend injizierter Adapter verhindert den direkten Speicherzugriff der alten Oberfläche. Ein vorhandener v1-/v2-/v3-Standard darf unverändert gelesen werden. Ein v4-Standard wird im alten Formular nicht verwendet und nicht zurückmigriert. Speichern und Zurücksetzen betreffen ausschliesslich `fristenrechner.defaults.recovery-mvp06.v1`. Ein eigener Resetmarker verhindert, dass nach dem Neuladen alte gemeinsame Präferenzen wieder auftauchen. `fristenrechner.defaults.v1` bleibt bytegleich erhalten. Bei gesperrtem Speicher gibt es keinen ungeschützten Ausweichzugriff und keinen falschen Speichererfolg.

Ein sichtbarer deutsch-französischer Hinweis kennzeichnet den Wiederherstellungsmodus und die getrennten Standards. Das übrige Rechnerformular bleibt das archivierte MVP06-Formular.

**Zwei zusätzliche Ablaufkorrekturen sind nur im Kandidaten enthalten.** Ein veralteter Ladevorgang darf weder die aktuelle Ansicht noch den konfigurierten Cache aktivieren. Der Store prüft die Gültigkeit nochmals nach dem asynchronen Öffnen, unmittelbar vor dem Schreiben. Ein fehlgeschlagener oder blockierter Öffnungsversuch kann auf derselben Storeinstanz erneut versucht werden. Ein verspätet dennoch geöffneter Handle wird geschlossen, ebenso eine Verbindung bei einem späteren Datenbankversionswechsel. Es wird keine Datenbank gelöscht.

Diese beiden Befunde wurden zunächst am ersten lokalen Kandidaten reproduziert und anschliessend am neu gebauten Paket als behoben geprüft. Der reguläre archivierte MVP07-Stand `0.7.0.0` wurde **nicht** nachträglich korrigiert. Für dessen Installation bleiben unveränderliche Releaseordner und das koordinierte Schliessen alter Sitzungen wichtig. Eine blockierte alte Sitzung ist kein pauschal akzeptierter Fehler. Bei einem solchen Befund anhalten und nach dem Schliessen frisch laden. Ob darüber hinaus ein regulärer Korrekturkandidat nötig ist, wird separat entschieden.

## 3 Prüfung der tatsächlichen Paketbytes

Alle elf Paketprüfungen sind bestanden. Der Prüflauf lädt das unveränderte JavaScript direkt aus den drei tatsächlichen SPPKG-Dateien von MVP06, MVP07 und Wiederherstellung. Rechenkern, Validator, Service, Store sowie Berechnungs-/Speicher-/Resetereignisse der Oberfläche laufen aus dem jeweiligen Paket. Kein TypeScript-Rechenkern ersetzt dabei den Paketcode.

| Paketprüfung | Ergebnis |
| --- | --- |
| Identitäten, Versionsfolge, eingebettete Assets und Berechtigungsanforderungen | Bestanden. Paket-, Feature- und Komponentenmanifest sowie tatsächlicher Bundlepfad geprüft |
| Bereits durch den echten MVP07-Paketcode erzeugte DB v2 → Format 6 → erneuter MVP07-Consumer | Bestanden. Erstabruf und Offline-Wiederanlauf für beide Datenkonfigurationen, Format-7-Inhalt erhalten |
| Fehlende oder andere Quelle, Format 7, beschädigter Cache und vorhandener globaler AP5-Stand | Bestanden. Kein fremder AP5-Ersatz und kein angezeigter Rechner bei unzulässigem Zustand |
| Eigene AP5- und Format-6-Caches | Bestanden. Getrennte Erstabrufe und Fallbacks, kein Umetikettieren |
| Alter offener DB-v1-Handle blockiert Upgrade | Bestanden. Nach regulärem Schliessen erfolgreicher neuer Zugriff mit derselben Recovery-Storeinstanz |
| Konfigurationswechsel und verspätete Erfolge/Fehler | Bestanden. Alte Ansicht verschwindet unmittelbar, veralteter Abruf aktiviert weder neue Ansicht noch alten Cache |
| StPO und tatsächlicher alter Datumsfeldtyp | Bestanden. `16.09.2026 + 10 Tage → 28.09.2026`, Ergebnis identisch mit dem archivierten MVP06-Paket, altes natives Datumsfeld |
| Alle 50 BE-Sozialanbindungen mit zwei Feiertagsrollen | 100 tatsächliche paketierte UI-Berechnungen bestanden. Erste modellierte Kontextzuordnung und synthetische Anker, keine vollständige erneute Fachabnahme aller Fallkombinationen |
| MVP07-v4-Standards → Wiederherstellung speichern/zurücksetzen → MVP07 erneut | Bestanden. Ursprüngliche Rohbytes und Kalenderkontext bleiben erhalten, getrennte Wiederherstellungsstandards überdauern umgekehrt auch erneutes MVP07-Speichern |
| Bestehende v3-Standards und eigener Reset | Bestanden. Unveränderte Übernahme zum Lesen, nach Reset kein ungewolltes Wiederauftauchen |
| Browserpräferenzen nicht verfügbar | Bestanden. Adapter bleibt vorhanden, Oberfläche meldet fehlgeschlagenes Speichern/Zurücksetzen, keine direkten Speicherzugriffe |

Zusätzlich bestanden **32 gezielte Quelltests**, davon 18 zum Standardschutz und 14 zu den asynchronen Speicherabläufen. Der Paketlauf dauerte rund 74 Sekunden und endete mit 11 bestandenen, null fehlgeschlagenen und null übersprungenen Tests. Die 100 Sozialvarianten sind im Pakettest enthalten und werden nicht nochmals als 100 eigenständige Testfälle addiert.

**Nachweisgrenze:** IndexedDB, LocalStorage, React-Hooks und Ereignisfolgen sind kontrollierte Simulationen im lokalen Node-Prozess. Die Daten stammen aus den ursprünglichen lokalen Releasebytes, nicht aus einem Netzabruf. Dies belegt den Paketcode, aber keine reale SharePoint-/Teamsinstallation, keinen echten React-/DOM-Ablauf, keinen Fokus-/Gerätetest und kein originales Browser-Timing. Es wurden keine realen Präferenzen angefasst und keine Kalenderdateien exportiert oder importiert.

Der Build verwendet Node 22.23.2, SPFx 1.23.2 und TypeScript 5.8.3. Kompilierung, Bundlebau, CSS-Prüfung und Paketierung sind erfolgreich. Acht nicht blockierende Lintwarnungen betreffen `null` an bestehenden Storage-/Datenschnittstellen und explizites `void` bei behandelten asynchronen Abläufen. Es gibt keine Kompilierungsfehler. Der Heft-Bau ohne eigene Jest-Suite zählt nicht als zusätzliche Produkttestsuite.

## 4 Sicherung und Wiederholbarkeit

Der [gebundene Archivnachweis](../../outputs/recovery-mvp07-0.7.0.1-2026-10-08/artifact-verification.json) umfasst **373 Dateien**. Er bindet Paket, tatsächlich kompilierte Eingänge, ursprüngliche Quellen, Implementierung, Testhilfen, Protokolle, Vergleichspakete und verwendete Releasebytes. Seine SHA-256-Prüfsumme lautet `93c7b0162d63a03b89ef832a8bb7b1396922de5548c40ef65dc461179023263e`.

- [Paketprüfbericht](../../outputs/recovery-mvp07-0.7.0.1-2026-10-08/package-tests/result.json) und [vollständiges TAP-Protokoll](../../outputs/recovery-mvp07-0.7.0.1-2026-10-08/package-tests/stdout.tap)
- [Bau- und Bestandsschutzprüfung](../../outputs/recovery-mvp07-0.7.0.1-2026-10-08/build-evidence/verification.json)
- [32 Quelltests](../../outputs/recovery-mvp07-0.7.0.1-2026-10-08/build-evidence/source-tests.json)
- [Getrennte Implementierung](../../spfx/recovery-mvp07/Fristenrechner.tsx) und [isolierter Builder](../../scripts/build-mvp07-recovery.mjs)

1'357 geschützte Produkt-, Daten-, Metadaten- und bisherige Archivdateien sind nach dem Bau und vor der Archivierung unverändert. Die bisherigen sechs Dokumentstände wurden vor ihrer Statusnachführung im neuen Archiv gesichert. Der frühere Rückfallbericht bleibt unverändert als Diagnosegrundlage erhalten. Die portable Prüfung des regulären MVP07-Archivs bestätigt weiterhin drei Artefakte, 41 Mirrordateien, zwölf Webdateien und 191 Baubelege.

Aus dem Repository lässt sich das neue Archiv ohne Zugriff auf `.work` oder Git-Historie prüfen, mit einer verfügbaren Node-Laufzeit:

```sh
node scripts/archive-mvp07-recovery.mjs --verify
```

Ein Neubau benötigt dagegen die gebundene lokale Node-/SPFx-Toolchain und beide Quellarchive. Er erzeugt bewusst einen frischen Stagingordner. Zeitstempel im Paket können eine andere Paketprüfsumme verursachen. Ein Neubau ersetzt deshalb niemals stillschweigend das hier geprüfte Artefakt. Private Vorläufe und negative Regressionstests bleiben getrennt erhalten und werden nicht als endgültiger Pass ausgegeben.

## 5 Noch erforderlicher betrieblicher Entscheid

Der Kandidat ist lokal prüfbar vorhanden. Es ist weder nötig noch erlaubt, jetzt vorsorglich echte Browserdaten zu löschen. Der nächste Schritt ist die ausdrückliche Billigung des vollständigen Rückfallwegs in der [Installationsvorlage](eq-installationsvorlage-mvp07.md), zusammen mit einer frisch bestätigten Katalog-/Zielbindung und dem konkreten Installationsauftrag.

Für einen später tatsächlich nötigen Einsatz gilt:

1. Weitere Umstellungen stoppen und die Ursache einordnen. Bei einem reinen Datenproblem bleibt der geprüfte Datenrückfall unter dem neuen Consumer eine getrennte, kleinere Möglichkeit.
2. Die vier betroffenen aktuellen Instanzen vor dem Codewechsel kontrolliert auf ihre jeweils gesicherten, unveränderten Format-6-Mirrors zurückführen. AP5 bleibt bei seinem expliziten alten Pin. Keine freie Konfiguration durch den Standardpin ersetzen.
3. Nur bei passender bestätigter Versionsfolge das hier gebundene Wiederherstellungspaket unter der bestehenden Katalogdatei bereitstellen und die bestehenden Site-Apps aktualisieren. Keine Deinstallation, keine zusätzliche Site und kein Datenbankreset.
4. Tatsächlich ausgelieferten Paket-/Bundlehash, sichtbaren Wiederherstellungsmodus, Quelle und Datenmanifest frisch prüfen. Vier aktuelle Instanzen und AP5 getrennt testen. Standardschutz zunächst mit gesicherten eigenen synthetischen Präferenzen prüfen. Diese Hostschritte sind noch nicht ausgeführt.
5. Eine spätere Rückkehr zur regulären MVP07-Funktionalität erfolgt betrieblich über einen **erneut höheren, separat gebauten und geprüften Paketstand**, beispielsweise `0.7.0.2`. Die Simulation mit den vorhandenen `0.7.0.0`-Bytes beweist nur Daten-/Speicherkompatibilität, keinen SharePoint-Downgrade auf diese niedrigere Paketversion. Ein solcher Folgeconsumer wurde hier nicht gebaut oder freigegeben.

H01 ist somit **lokal technisch belegt, betrieblich noch nicht freigegeben**. Die gemeinsame Codewirkung auf alle verbundenen Instanzen bleibt auch beim Wiederherstellungspaket bestehen. E/Q, reale Browserdaten, Mirrors, Berechtigungen, GitHub und P sind durch diesen Auftrag unverändert. David entscheidet in Personalunion. Die technische Gegenprüfung ist eine zweite KI-Prüfung, kein menschliches Vieraugenprinzip und keine zusätzliche formelle Freigabe.
