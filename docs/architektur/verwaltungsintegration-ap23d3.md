# AP23D3 Gemeinsame Laufzeit und Hostintegration

Stand: 15. Oktober 2026. Lokal umgesetzt und geprüft, zur technischen Teilpaketabnahme vorgelegt. Keine operative Freigabe.

## Auftrag und Ergebnis

David Steimer hat [AP23D2 einschliesslich UX-Nachtrag abgenommen](../fachrecht/abnahme-ap23d2.md) und AP23D3 gestartet. Dieses Teilpaket verbindet die fünf bisherigen Verfahrensprofile und die zwölf TI-/GR-Verfahrenspfade in einem echten gemeinsamen Format-8-Datenkontext. Der bestätigte [Vertrag nach DEC-2026-032](../entscheidungen/DEC-2026-032-beschluss.md), die fachlichen Rechenregeln und der zweispaltige Aufbau bleiben unverändert.

Die abgenommene D2-Oberfläche wird nicht neu gestaltet. Sichtbar anders ist nur der Hinweis auf die gemeinsame lokale Integrationsprüfung. Die Sozialrechtsauswahl erkennt nun ebenfalls Format 8 und bietet dieselben elf bereits modellierten Sozialversicherungserlasse an. Daraus entstehen keine zusätzlichen Sozialfreigaben ausserhalb Berns.

## Gemeinsamer Datenkontext

`createFormat8CalculationData` prüft Manifest und sämtliche Originalbytes gemeinsam und erzeugt zusammengehörige Berechnungsdaten, Kalenderlaufzeit und Administrativkontext. Die Formatangabe bleibt `8.0.0`. Es gibt keine Umetikettierung zu Format 7, keine Auswahl des ersten passenden Kalenders und keinen stillen Ersatz durch BE-/CH-Daten.

- `calculateRuntimeDeadline` ist der qualifizierte Einstieg für bisherige Profile. Der alte unqualifizierte Einstieg weist Format 8 weiterhin zurück.
- Die bereits bestätigten Kantonal-, Kalender-, Spezial- und Sozialresolver verwenden dieselbe geprüfte Herkunft. Die gemeinsame Tagesarithmetik ist byteidentisch zum abgenommenen D1-Stand.
- Unveränderliche Daten und private Objektidentitäten verhindern, dass kopierte oder serialisierte Objekte eine geprüfte Herkunft vortäuschen.
- Die Oberfläche akzeptiert nur gemeinsam ausgestellte Daten-, Kalender- und Administrativkontexte. Bei einer abweichenden Paarung verschwinden Formular und altes Ergebnis und eine Fehlermeldung wird angezeigt.
- Ein neuer Kontext startet eine neue Sitzung. Alte Resultate und einmalige Fallangaben werden nicht neben neuen Rechtsdaten weitergeführt.

Der lokale Kandidat verwendet unverändert `2026-10-15-ap23d2-reference.1`, Manifest-SHA-256 `ccb67c22e55737af064f8c9ef7b122db8c5dfe1f4a1f142eb77cd05fd5ac646d`. Er enthält weiterhin fünf Bestandsprofile, 32 Kalender und den eigenständigen Kantonalverfahrenskatalog. Es wurde kein neuer Datenrelease erzeugt und kein Kandidatenstatus hochgestuft.

## Provider und Cache

Der normale SPFx-Provider akzeptiert Format 8 nur über das freigegebene Manifestformat und die vollständige gemeinsame Inhaltsprüfung. Der unveränderte lokale D2-Kandidat wird bereits vor dem Abruf seiner weiteren Artefakte zurückgewiesen. Es gibt keine per URL oder WebPart-Einstellung einschaltbare Referenzfreigabe.

Der aktive Cache bleibt an die tatsächliche Datenkonfiguration gebunden. Originalbytes werden beim Wiederherstellen erneut geprüft. Ein anderer Mirror, ein gleich benannter Provider, ein historischer AP5-Pin oder unvollständige beziehungsweise manipulierte Cachebytes sind kein Ersatz. Während eines Konfigurationswechsels und bei verspäteten Antworten werden alte Kontexte nicht als neuer Stand angezeigt.

Trifft nach der geprüften Cacheanzeige derselbe vollständig validierte Netzrelease ein, bleibt die bereits angezeigte Sitzung erhalten. Voraussetzung sind dieselbe tatsächliche Konfiguration, dieselbe Manifestprüfsumme und ein bereits gemeinsam ausgestelltes gültiges Kontexttrio. Status und Warnung werden trotzdem aktualisiert. Ein anderer Datenstand oder ungültige Kontextobjekte erhalten dieses Privileg nicht. Die zusätzliche Lifecycleprüfung verhindert so unnötigen Verlust früher Eingaben ohne Lockerung der Datenprüfung.

Die bestehenden Schema- und semantischen Prüfungen bleiben vollständig. Für das bestätigte Format-8-Schema wird lediglich die AJV-Entwicklerwarnung `strictTypes` deaktiviert, weil eine verschachtelte Bedingung die äussere Objektdeklaration nicht wiederholt. Das Schema selbst bleibt byteidentisch. Die übrigen Validatoren werden nicht gelockert.

## Lokale Builds und Schutz der Betriebsartefakte

| Artefakt | Zweck und Abgrenzung |
| --- | --- |
| Expliziter Webbuild unter `.work/public-ap23d3` | Gemeinsamer Format-8-Referenzkandidat. Berechnungen lokal sichtbar, sämtliche Kalenderexporte gesperrt. Kein öffentlicher Release. |
| Isolierter SPFx-Build unter `.work/ap23d3-spfx-build-*` | Prüfung des tatsächlich gepackten Codes einschliesslich Provider, Host und Oberfläche. Der genaue Pfad und die Paketprüfsumme stehen im Buildnachweis. Nicht installieren. |
| Bestehendes Betriebspaket und Produktpins | Unverändert. Die lokale Integrationskopie ist trotz bestehender Paketidentität ausdrücklich kein freigegebener Updatekandidat. |

Die SPFx-Produktkopien werden vor dem Bau aus den gemeinsamen Quellen synchronisiert. Die drei benötigten Format-8-Schemata werden zusätzlich in die bestehenden Schemaziele übernommen. Der abschliessende Nachweis vergleicht die gemeinsamen Quellen mit den normalen und isolierten Produktkopien.

Der TypeScript-Zielstandard des SPFx-Builds wird explizit auf ES2015 gesetzt. Der bisher geerbte ES5-Zielstandard kann die echten privaten Felder des abgenommenen Readers und der gemeinsamen Runtime nicht übersetzen. ES2015 erlaubt deren abgeschirmte Übersetzung mittels WeakMaps. Die bereits verwendete Bibliotheksmenge bleibt unverändert. Das ist eine technische Buildanpassung für die vorhandenen modernen M365-Browser, keine Lockerung der Herkunftsprüfung und keine Änderung von Rechenregeln oder Paketversion. Die realen Zielbrowser werden im späteren E-/Q-Vollzug erneut geprüft.

Für Tests des späteren Approved-Pfads werden ausschliesslich im Arbeitsspeicher synthetische Freigabedaten verwendet, klar als Testdaten gekennzeichnet. Sie sind keine fachliche oder operative Freigabe und werden weder in den D2-Kandidaten noch in die bestehenden Datenreleases zurückgeschrieben.

Die lokale Webansicht lässt sich mit Node 22 und den bestehenden Abhängigkeiten reproduzieren:

```sh
npm run build:public:ap23d3
FRISTENRECHNER_DATA_CANDIDATE=ap23d3 PUBLIC_APP_PORT=8803 npm run preview:public
```

Adresse: `http://127.0.0.1:8803/fristenrechner/`. Der Parameter ist ein bewusster Buildschalter, kein Umschalter in einer ausgelieferten Instanz. `npm run test:ap23d3` führt die lokale Gesamtregression aus, `npm run test:ap23d3:spfx` den isolierten Paketbau. Die abschliessende Bindung bereits geprüfter Logs, Buildartefakte und Browsernachweise erfolgt mit `node scripts/check-ap23d3.mjs --write --finalize`. Sie verweigert die Übernahme, sobald sich seit den Testläufen ein gebundener Quell- oder Testbestand geändert hat.

## Prüfumfang und Belege

Der [Gesamtnachweis](../../outputs/ap23d3-2026-10-15/QA-AP23D3.json) bindet die endgültigen Quellen, Tests, gebauten Artefakte und lokalen Browsernachweise. Die [Testprotokolle](../../outputs/ap23d3-2026-10-15/test-evidence.json), der [Webnachweis](../../outputs/ap23d3-2026-10-15/web-build.json) und der [isolierte SPFx-Nachweis](../../outputs/ap23d3-2026-10-15/spfx-build.json) bleiben getrennt nachvollziehbar.

| Lokale Prüfung | Ergebnis |
| --- | --- |
| TypeScript und unveränderte Reproduktion des D2-Datenkandidaten | Bestanden |
| Produktregression einschliesslich D3-Kern und tatsächlicher UI | 2529 von 2529 bestanden |
| Host-Lifecycle | 20 von 20 bestanden, davon zehn neue D3-Proben |
| Öffentliche Webbuild-Tests einschliesslich minifiziertem D3-Code | 20 von 20 bestanden |
| Vollständige historische AP5-Resultate und Rechenspuren | 1584 von 1584 Vergleichen identisch |
| SPFx-Quelltests einschliesslich Provider und Cache | 204 von 204 bestanden, davon 18 neue Format-8-Proben |
| Kompilierung, CSS-Audit und Paketierung | Bestanden, 24 Lintwarnungen bleiben ausgewiesen |
| Vollständige Regression am tatsächlichen SPPKG | 89 von 89 bestanden, einschliesslich sechs neuer Format-8-Paketproben |
| Lokale Browserprüfung des endgültigen Webbuilds | Neun Proben bestanden, DE/FR und schmaler Viewport |

Geprüft werden insbesondere:

- alle 104 bisherigen Bundesbindungen sowie die 44 nationalen Sozialregeln über alle 50 BE-Anbindungen, mit Ergebnisvergleich gegen MVP 0.7
- alle zwölf TI-/GR-Pfade, TI-O2-Sperre, GR-Dringlichkeit, zeitliche Grenzen, regionale Qualifikation und die bestehenden Januarvergleiche
- echte Komponentenbedienung in DE/FR, Defaults 5, Resultatinvalidierung und Exportsperre auch ohne explizites Host-Anzeigeflag
- Provider-/Cachefehler, vermischte Kontexte, Konfigurationswechsel und verspätete Antworten
- tatsächlich minifizierter Webcode und tatsächlich aus dem SPPKG geladener Code, nicht nur Quelltextprüfungen
- vollständige Produktregression und 1584 Vergleiche vollständiger historischer AP5-Ergebnisse einschliesslich Rechenspur
- unveränderte Rechtsdaten, Schemata, D2-Kandidatenbytes, historische Nachweise und gesicherter Abnahmestand

Die bisherige Negativprobe «unbekannte Hauptversion 8» wird im lebenden SPFx-Test auf Hauptversion 9 fortgeschrieben. Ihre Sperrerwartung bleibt gleich. Die ursprünglichen abgenommenen Nachweise werden nicht rückwirkend geändert.

Die neuen Provider- und Cacheproben sind auf zwei Dateien aufgeteilt, damit jede unter dem bestehenden 60-Sekunden-Limit bleibt. Weder die Assertions noch das Zeitlimit werden reduziert beziehungsweise erhöht. Die historische gemischte C2-Prüfansicht behält ihren ursprünglichen Anzeige- und Exportumfang. Die aus den geprüften Daten abgeleitete globale Referenzsperre gilt für den neuen gemeinsamen Format-8-Kontext und den verifizierten Administrativkontext.

Der SPFx-Lauf weist 24 Lintwarnungen aus, aber keine Compiler- oder Lintfehler. Sie betreffen unter anderem Typpräzision, explizite Rückgabetypen, absichtlich ausgelassene Destrukturierungswerte, Schema-Regulärausdrücke und bestehende `void`-Aufrufe. Die Warnungen sind im gebundenen Buildprotokoll sichtbar und werden nicht als behoben dargestellt. Der lokale erfolgreiche Paketbau ist deshalb kein «warnungsfreier Build» und ersetzt keine operative Abnahme.

Im ersten vollständigen Paketnachtest überschritt die neue Testdatei unter paralleler Root-Regressionslast das unveränderte 60-Sekunden-Dateilimit. Das Fehlerprotokoll bleibt erhalten. Der vollständige Paketnachtest wurde anschliessend ohne den parallelen Root-Lauf mit identischen Paket- und Testbytes wiederholt. Alle 89 Tests bestanden, ohne erhöhtes Zeitlimit oder entfernte Prüfung. Der separate Wiederholungsnachweis bindet die Paket- und Testprüfsummen vor und nach dem Lauf sowie beide Protokolle. Eine zwischenzeitlich vorbereitete Aufteilung der Pakettestdatei wurde nicht übernommen.

## Weiteres Vorgehen

**AP23D3 liegt zur technischen Teilpaketabnahme vor.** Daraus folgen weder eine Freigabe der Rechtsdaten noch eine Installation. Für einen anschliessenden Release sind die zusammengeführte Quellenreleaseprüfung, kontrollierte Datenübernahme, konkrete Produktversion mit Rückfallweg und definitive Releaseartefakte vorzubereiten. E/Q, reale Geräte- und Gastprüfungen sowie GitHub/P bleiben gesonderte Freigabeschritte.

Produktiv bleibt MVP 0.7. Historischer AP5-Pin, bestehende Mirrors, AP21-Testapps, M365-Berechtigungen und Richtlinien bleiben unverändert. Weitere Kantone, Italienisch/Rumantsch Grischun und die gesonderte Feldhöhenprüfung werden nicht vorweggenommen. David Steimer entscheidet und nimmt ab. Codex bereitet als Arbeitsinstrument ohne formelle Freigabe- oder Haftungsverantwortung vor.
