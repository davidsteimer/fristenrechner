# MVP 0.5 · Lokale technische Vorprüfung

Stand: 28. September 2026. **Vorbereitung bestanden, kein definitiver Releasebuild und keine Bereitstellungsfreigabe.**

Geprüft wurde der lokale AP19-Arbeitsstand auf `codex/ap19-sozialversicherungsmodell` über Basiscommit `065781f17b6f83e1e51c9af96d89bb699cb4b933`. Der Arbeitsstand ist noch nicht committed oder veröffentlicht. Neue Änderungen dieser Vorbereitung betreffen ausschliesslich Releasewerkzeuge, Nachweise und einen getrennten statischen Kandidateneinstieg. Die abgenommene Kern-/UI-Implementierung wurde nicht verändert.

## 1. Tatsächlich ausgeführte Prüfungen

| Prüfung | Ergebnis | Nachweisgrenze |
| --- | --- | --- |
| TypeScript und `npm run check` | bestanden, 1’087 Kern-/UI-Tests und zwölf Public-Build-Tests | Enthält fünf neue Tests des statischen C3-Builds. Der normale Public-Build bleibt MVP 0.4 |
| Alle Python-Datenprüfungen | 116 bestanden | Kein neu freigegebener Datenrelease erzeugt |
| Quellen-Governance | 17 Python-Tests und 96 Node-Tests bestanden, zusätzlich acht Validator-Negativtests | Die 96 Node-Tests enthalten sieben neue Vorbereitungstests und sechs neue Quellen-Vollständigkeitstests. Der aktive Governancebestand bleibt bei 42 Quellen und zwei freigegebenen Ereignissen |
| Governance-Index | erneut erzeugt und byteidentisch | Noch keine Aufnahme der 15 zusätzlichen AP19-Quellen in den aktiven Registerstand |
| Isolierte SPFx-Prüfung | 79 Quell-/Transporttests und 39 Tests am kompilierten Code beziehungsweise Testpaket bestanden | Produktionsmodus, CSS-Prüfung und Paketbau bestanden. Kein Installationspaket für MVP 0.5 |
| Eingangssnapshot | 30 tatsächliche Belege mit Dateilänge und SHA-256 gebunden, deterministische Wiederholung bestanden | Quellen-/Referenzbindungen des Integrationskandidaten, noch nicht die neue Gesamtquellenabnahme |
| Bestandsschutz | 68 historische Artefakte unverändert | Umfasst AP19A/B/C1/C2/C3-Nachweise, bestehende Releases und private Benutzerdateien. Detailliste verbleibt lokal |

Die vollständigen lokalen Logs liegen unter `.work/mvp05-preflight-check-final.log`, `.work/mvp05-preflight-governance-final.log`, `.work/mvp05-preflight-data.log` und `.work/ap19c-spfx-build-AOL7L3/`. Die Dateien unter `.work` sind kein automatischer öffentlicher Publikationsumfang.

Alle 24 Bundesregeln und 28 Anbindungen enthalten vollständige `legalValidity`-Intervalle. Kein `normBindings.applicableFrom` ist `null`. Ein zwischenzeitlicher Verdacht aus einer synthetischen Testhilfe wurde durch direkte Prüfung des tatsächlichen C3-JSON widerlegt. Es besteht daraus kein zusätzlicher offener Fachpunkt.

## 2. Statische Browserstichprobe

Neuer, ausschliesslich lokaler Build: `npm run build:public:ap19c3`. Ausgabe: `.work/public-ap19c3`. Der Build importiert den unveränderten Kandidaten `2026-09-28-ap19c3-candidate.1` und bezeichnet sich ausdrücklich mit `status: candidate` und `deployable: false`. Die normale P-Einstiegsdatei, der GitHub-Pin und alle Paketversionen bleiben unverändert.

Im eingebauten Browser über den lokalen Vorschau-Server tatsächlich geprüft:

- Start auf Deutsch mit leerem Empfangsdatum und sichtbarem Kandidatenhinweis.
- StPO, direkte Zustellung am 16.09.2026, zehn Tage: Fristbeginn 17.09.2026, rechnerisches Ende 26.09.2026, verschobener Fristablauf **28.09.2026**.
- Wechsel zu VRPG, Sozialversicherungsrecht und KVG/OKP. Alle sechs erfassten Sozialerlasse in der Auswahlliste vorhanden.
- KVG-Einspracheansicht mit 30 Tagen, festem Gegenstand und Eröffnung. Kein redundantes Dokumentfeld. Das früh eingegebene Zustellungsdatum bleibt erhalten.
- Wechsel zu Französisch, zweispaltige Darstellung und übersetzter Kandidatenhinweis sichtbar.
- Neuladen stellt den leeren Datumsstart wieder her. Keine Standards gespeichert oder zurückgesetzt.
- Keine Warnungen oder Fehler in den erfassten Browser-Konsolenmeldungen.

Dies ist keine vollständige neue manuelle Fachabnahme. Die 28 echten eingebetteten Sozialpfade wurden zusätzlich automatisiert mit jeweils vollständig qualifizierten Eingaben geprüft und sämtlich mit `not-released` ohne Enddatum gesperrt. Positive Rechenreferenzen der bestehenden Integration verwenden weiterhin ausschliesslich synthetische Freigaben im Testspeicher. Es wurde keine solche Freigabe in den Webbuild geschrieben.

Der lokale Server liefert eigene Prüfheader. Sein Erfolg ist **kein Nachweis der GET-Header auf steimer.ch**. Die unveränderte `.htaccess` wurde lediglich als Buildinhalt geprüft. Kein Hostingzugriff oder neuer Green-Befund aus dieser Prüfung.

## 3. Gebundene lokale Artefakte

| Gegenstand | SHA-256 |
| --- | --- |
| [Vorbereitungseingänge](../../outputs/release-mvp05-2026-09-28/preparation-inputs.json) | `4a21d2b6b86099dc3a9d5470c2489965dd2511bb131bbd2e334f331fd45eaec2` |
| C3-Kandidatenmanifest | `8e0f7aa1901b1e26878ddead049a35c81cbf540fd6d68002597830f5c7e6b0da` |
| Lokales statisches Buildmanifest | `4ba6a04982bf39644a5cd60b6964dad5c218a525032e9fd8e1206a59e6924c98` |
| Statisches JavaScript `app-PLA7CRAC.js` | `198c79dbbe06db70d0b866a9fc0762293af67e70bc6a331c89d3be4f6ed751df` |
| Neues isoliertes SPFx-Testpaket | `a4d1c6886f3be67a043da592164511781bc54b0b6b19f3b9864d3ff4d5b43b96` |
| Unverändertes bisheriges SPPKG | `9f31513cbc56f0ee2bb178e1db9336252d0266527643bebc2fb1348820711346` |

Die beiden Testbuilds sind **nicht** die definitiven Artefakte `0.5.0` beziehungsweise `0.5.0.0`. Dafür müssen erst der neue freigegebene Datenstand, Governanceverknüpfungen und spätere Pins kontrolliert hergestellt werden. Danach sind neue Builds und erneute Tests erforderlich. Ein erfolgreicher Test unter einer synthetischen Freigabe oder einem alten Paketversionswert wird nicht als installierbarer Release ausgegeben.

## 4. Nächste Haltepunkte

Massgebend sind der [Release- und Bereitstellungsplan](deployment-mvp-05.md) und der [Quellenprüfplan](../fachrecht/quellenpruefplan-mvp05.md). Die zusammengeführte Quellenvorlage wird David zur Abnahme vorgelegt. Eine technische Vorprüfung ersetzt weder diese menschliche Entscheidung noch die kontrollierte Datenpromotion und deren Freigabebindungen.

E/Q/P, Mirrors, bestehende Datenpins, M365-Rechte, GitHub und Hosting wurden in dieser Vorbereitung nicht verändert. Kein Commit, Push oder Deploy-Key wurde erzeugt. Der offene MVP-0.4-Hostingbefund bleibt bestehen, ohne dass hier eine neue Prüfung des öffentlichen Betriebs behauptet wird.
