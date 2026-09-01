# AP16: Nachweis des statischen P-Releasekandidaten

| Merkmal | Nachweis |
| --- | --- |
| Arbeitspaket | AP16 |
| Prüfdatum | 1. September 2026 |
| Status | fachlich-technisch abgenommen |
| Anwendung | `0.3.0` |
| Datenrelease | `2026-08-31-mvp-03-approved.1` |
| Manifestformat | `3.0.0` |
| Kalenderkomponente | `2.0.0` |
| vorgesehene Adresse | `https://www.steimer.ch/fristenrechner/` |
| lokaler Prüfpfad | `http://127.0.0.1:4180/fristenrechner/` |
| öffentliche Bereitstellung | nicht erfolgt und nicht freigegeben |
| fachlich und betrieblich verantwortlich | David Steimer |
| technische Ausarbeitung | David Steimer mit Codex |

## 1. Ergebnis

Der statische P-Releasekandidat ist gebaut und hat die AP16-Prüfmatrix P01 bis P15 auf Projektebene bestanden. Er verwendet denselben hostneutralen Rechenkern, dieselbe Produktoberfläche und denselben freigegebenen Datenstand wie die geprüfte SPFx-Version `0.3.0.0`.

Das Paket benötigt im Browser weder Microsoft 365 noch Microsoft Graph, SharePoint, GitHub, ein CDN, eine Datenbank oder eine serverseitige Anwendungslogik. Sämtliche Laufzeitdateien liegen im statischen Paket. Der Browser übermittelt keine Falldaten oder Berechnungen an einen Server.

Der Nachweis ist kein Entscheid zur öffentlichen Bereitstellung. DEC-2026-017 ist beschlossen. Die konkrete Bereitstellung bleibt jedoch gesperrt, bis David Steimer Upload, Umschaltung und P-Betrieb ausdrücklich freigibt.

## 2. Kandidatenaufbau

Der Befehl

```bash
npm run build:public
```

erzeugt den vollständigen Kandidaten unter `.work/public-app/`:

```text
public-app/
├── .htaccess
├── assets/
│   ├── app-V3VOY2SA.js
│   ├── app-B6T7L4JH.css
│   ├── fluent-ui-react-cb8d08006f10.js
│   ├── react-020d164dcf31.js
│   └── react-dom-93cb736921fc.js
├── build-manifest.json
├── favicon.svg
├── index.html
└── licenses/
    ├── fluent-ui-MIT.txt
    ├── react-MIT.txt
    └── react-dom-MIT.txt
```

Die Gesamtgrösse beträgt rund 1,35 MB. Es sind weder Quellkarten noch QA-Presets enthalten. React 17, React DOM 17 und Fluent UI 8 werden als selbst gehostete Produktionsdateien mitgeliefert. Die Ausgabedateien verwenden ausschliesslich relative Verweise und funktionieren deshalb am bezeichneten Unterpfad.

## 3. Reproduzierbarkeit und Prüfsummen

Zwei unmittelbar aufeinanderfolgende Produktionsbuilds mit Node.js `22.23.2` ergaben byteidentische Dateien. Für den am 1. September 2026 geprüften lokalen Kandidaten gelten folgende SHA-256-Prüfsummen:

| Datei | SHA-256 |
| --- | --- |
| `index.html` | `e4b1b8cbf6051eca19b890fe73476490c93dc86534f79cedae7c55df2e26e7a7` |
| `.htaccess` | `22b8447d9ecc5f709ee0362ba23e813b2ca124bd563b2cf62e57961aaae6b4e8` |
| `build-manifest.json` | `ea46e404438d57b152906774dd828152627b5a1f6034a1dd2f3d658f3eb8acec` |
| `assets/app-V3VOY2SA.js` | `2958f9b204854bc33d11ca28ab0d729e3db302ee38a01e3b9afe0005dc2fbac9` |
| `assets/app-B6T7L4JH.css` | `de3203a770b7e7e88df2e07224b878aeebb85c5e5a9a40461cfc44c9fd58e2a2` |
| `assets/react-020d164dcf31.js` | `020d164dcf3116ccc2268d6a6e44caa77c0131d8e98e882c6430219d281eef8e` |
| `assets/react-dom-93cb736921fc.js` | `93cb736921fcb9c3f06ec1c43b85a4e6ccc4f73111355cf75d0ca77f24fae8ed` |
| `assets/fluent-ui-react-cb8d08006f10.js` | `cb8d08006f10a51b94a692f12590cbb3a9e0f1660c8d1529cedfce03ac6113fc` |

Jede spätere Code- oder Abhängigkeitsänderung erzeugt einen neuen Kandidaten und benötigt neue Prüfsummen. Die Dateinamen der Anwendungsassets sind inhaltsadressiert. Das Buildmanifest nennt Anwendungsversion, Datenrelease, kanonische Adresse, Basispfad und sämtliche Laufzeitassets.

## 4. Prüfmatrix P01 bis P15

| ID | Ergebnis | Nachweis | Status |
| --- | --- | --- | --- |
| P01 | Referenzidentität | Buildmanifest nennt Anwendung `0.3.0`, Datenrelease `2026-08-31-mvp-03-approved.1`, kanonische Adresse und Basispfad | bestanden |
| P02 | reproduzierbarer Build | zwei aufeinanderfolgende Builds ergaben identische SHA-256-Prüfsummen | bestanden |
| P03 | Unterpfadfähigkeit | Browseraufruf unter `/fristenrechner/`, alle sechs geladenen Assets ebenfalls unter diesem Pfad | bestanden |
| P04 | statischer Betrieb | Paket enthält nur HTML, CSS, JavaScript, SVG, JSON und Lizenztexte | bestanden |
| P05 | externe Abhängigkeiten | Browser lud nur lokale Assets. Der Produktionscode enthält keine Laufzeitaufrufe über `fetch`, `XMLHttpRequest`, `WebSocket` oder `EventSource` | bestanden |
| P06 | QA-Abgrenzung | keine Quellkarten, QA-Presets oder Entwicklungsparameter im Paket | bestanden |
| P07 | STEIMER-Webhülle | Desktop- und Mobilansicht visuell geprüft. Impressum, Quellcode, Lizenz und private Behördenabgrenzung sind sichtbar | bestanden |
| P08 | Deutsch und Französisch | Oberfläche, Hauptmeldungen und Validierung im Browser geprüft. Ein gefundener Sprachwechsel-Fehler wurde korrigiert und durch einen Regressionstest gesichert | bestanden |
| P09 | fachliche Regression | 101 Kern- und 64 UI-Tests sowie 17 SPFx-Provider- und Hosttests ohne Fehler. Der produktive SPFx-Heft-Build besteht weiterhin | bestanden |
| P10 | Kalenderexport | sieben automatisierte Fälle prüfen Inhalt, UTF-8-Faltung, Datenschutz, Erinnerung und lokalen Download | bestanden |
| P11 | lokaler Speicher | sieben automatisierte Defaultfälle prüfen Zulässigkeit, Migration, Leerauswahl und vollständiges Zurücksetzen | bestanden |
| P12 | Barrierearmut | semantische Überschriften, Regionen, Statusmeldungen, sichtbarer Fokusrahmen und Skip-Link vorhanden. Bei 390 Pixeln kein horizontaler Überlauf | bestanden auf Projektebene |
| P13 | Sicherheitsheader | CSP, `nosniff`, Referrer-, Einbettungs- und Berechtigungsrichtlinie lokal ausgeliefert | bestanden |
| P14 | Cache und Rückfall | HTML nicht speicherbar, gehashte CSS- und JavaScript-Dateien ein Jahr unveränderlich cachebar, Rückfallverfahren dokumentiert | bestanden |
| P15 | Freigabegrenze | keine Datei auf steimer.ch bereitgestellt, keine DNS- oder Root-Webänderung vorgenommen | bestanden |

P12 ist eine projektbezogene Prüfung und keine formelle Zertifizierung nach eCH-0059 oder WCAG. Eine solche Zertifizierung ist für den MVP nicht vorgesehen.

## 5. Sicherheits- und Datenschutzbefund

Die Content Security Policy setzt `connect-src 'none'`, `object-src 'none'`, `base-uri 'none'` und `worker-src 'none'`. Skripte dürfen nur vom gleichen Ursprung geladen werden. Unsichere Skriptausführung und `eval` sind nicht freigegeben.

`style-src 'unsafe-inline'` bleibt als eng begrenzte Ausnahme erforderlich, weil Fluent UI 8 zur Laufzeit eigene Style-Elemente erzeugt. Die Ausnahme betrifft nur CSS. Sie erweitert weder `script-src` noch `connect-src`. Eine nonce-basierte Richtlinie würde eine dynamische Serverantwort erfordern und widerspräche dem rein statischen Zielbild. Diese Abweichung wird für den Kandidaten akzeptiert und bei einem späteren UI-Technologiewechsel erneut geprüft.

Persönliche Standards bleiben im lokalen Browserspeicher. Empfangsdaten, optionale Kalenderreferenzen, Berechnungen und erzeugte Kalenderdateien werden nicht an steimer.ch oder Dritte übertragen. Es sind keine Analyse-, Werbe- oder Trackingbibliotheken enthalten.

## 6. Browsernachweis

Geprüft wurden:

- deutscher Erstaufruf ohne vorbelegtes Datum
- französische Oberfläche und französische Validierungsfehler
- Desktopdarstellung bei 1280 Pixeln
- Mobilansicht bei 390 Pixeln ohne horizontalen Überlauf
- kanonischer Unterpfad `/fristenrechner/`
- ausschliesslich lokale Skript-, Style- und Icondateien
- leere Browserkonsole nach dem bereinigten Build
- vorbereitete Redirect-, Sicherheits- und Cache-Header

Die eigentlichen Referenzberechnungen und der Kalenderexport werden durch dieselben produktiven Funktionen ausgeführt wie in SharePoint und Teams. Ihre fachliche und technische Regression ist durch die 165 Kern- und UI-Tests, 17 SPFx-Provider- und Hosttests, den produktiven SPFx-Heft-Build sowie die bereits bestandene Release-2-Matrix T01 bis T19 abgedeckt.

Der SPFx-Build meldet weiterhin die zwei für Release `0.3.0.0` dokumentierten, nicht blockierenden `@rushstack/no-new-null`-Warnungen. Sie betreffen die bewusst verwendeten JSON-`null`-Werte der offenen Format-3-Abdeckung und optionaler Datenreferenzen. AP16 hat weder den Vertrag noch die Warnungslage verändert.

## 7. Verbleibende Freigabepunkte

Vor einer öffentlichen Bereitstellung sind noch ausdrücklich zu entscheiden und auszuführen:

1. ausdrückliche Freigabe des ersten Uploads und der öffentlichen Prüfung
2. Sicherung des bestehenden steimer.ch-Webauftritts
3. Upload in einen nicht öffentlichen temporären Hostingordner
4. technische Vorprüfung auf dem realen Apache-Hosting
5. kontrollierte Umschaltung auf `/fristenrechner/`
6. Prüfung der effektiven öffentlichen Header und des öffentlichen Hauptablaufs
7. Ergänzung des Root-Webauftritts und von `sitemap.xml`
8. dokumentierter P-Betriebsentscheid

Ohne diese Schritte bleibt der Kandidat lokal und nicht öffentlich.

## 8. Abnahme

David Steimer hat AP16 am 1. September 2026 fachlich-technisch abgenommen. Die Abnahme bestätigt den gebauten und geprüften Kandidaten. Sie ist nicht gleichbedeutend mit der öffentlichen P-Freigabe.

David Steimer bleibt für die Informationssicherheitsbeurteilung und die spätere P-Freigabe verantwortlich. Codex ist als KI-Arbeitsinstrument dokumentiert und übernimmt keine formelle Freigabe- oder Haftungsverantwortung.
