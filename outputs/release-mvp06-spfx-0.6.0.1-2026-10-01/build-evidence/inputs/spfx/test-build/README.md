# Regression am gebauten SPFx-Produkt

Diese Suite prüft zwei tatsächlich ausgelieferte JavaScript-Ausprägungen. Sie importiert keine TypeScript-Quellen und verwendet weder `tsx` noch einen Testtranspiler.

1. Die vom SPFx-Build erzeugten ES5-CommonJS-Dateien unter `lib-commonjs`.
2. Das unveränderte Hauptbundle direkt aus `sharepoint/solution/fristenrechner-schweiz.sppkg`.

## Ausführung

Im Verzeichnis `spfx`, nach einem vollständigen Produktionsbuild einschliesslich `package-solution`:

```sh
npm run test:built
```

Der Produktionsbuild führt diese Prüfung nach der Paketierung aus. Ein fehlendes, nicht lesbares oder nicht zur aktuellen Lösungsversion passendes Paket lässt den normalen Testlauf scheitern. Das Testprotokoll nennt Paket- und Bundle-SHA-256 sowie den tatsächlichen Bundle-Dateinamen.

Ein gezielter RED-Nachweis gegen eine unveränderte historische Paketkopie ist möglich. Das ist ausschliesslich eine Diagnoseoption, nicht die reguläre Buildkonfiguration:

```sh
FRISTENRECHNER_TEST_SPPKG="/absoluter/pfad/zum/alten.sppkg" \
  node --test --test-timeout=60000 \
  --test-name-pattern='packaged HolidayCatalogError|accepts all real approved format-4' \
  test-build/*.test.cjs
```

Die CommonJS-Prüfung verwendet auch bei diesem Diagnoseaufruf weiterhin den aktuellen lokalen Build. Nur die Paketprüfung liest die ausdrücklich benannte historische Datei. Ohne die Umgebungsvariable wird immer das reguläre lokale Produktionspaket geprüft.

## Nachweis und Abgrenzung

Der Paketleser verarbeitet das SPPKG im Speicher und extrahiert keine Dateien auf die Festplatte. Die Suite führt die unveränderten Bundle-Bytes in einer eigenen VM aus. Es gibt keine Quelltextumschreibung und keinen Ersatz des Produktvalidators. Der Zugang erfolgt über den exportierten WebPart, dessen tatsächlichen `render()`-Aufruf und die dabei erzeugte Produktkomponente bis zum enthaltenen Release-Service. Der echte paketierte IndexedDB-Store wird mit einer isolierten `fake-indexeddb`-Instanz ausgeführt.

Die sieben externen AMD-Abhängigkeiten sind explizit zugelassen. React wird aus der vorhandenen Installation verwendet. Lediglich der React-Komponentenbasistyp mit synchronem `setState`, der DOM-Renderempfänger und die benötigten SPFx-Hostoberflächen werden minimal nachgebildet. Netzwerkzugriffe sind nicht vorgesehen und der bereitgestellte SPHttpClient bricht sie ab. Die Release-Provider lesen die echten lokalen Freigabedateien. Fehlerhafte Daten entstehen ausschliesslich als separate In-Memory-Testkopien.

Die Suite prüft insbesondere:

- Die Identität von `HolidayCatalogError` als eigener `Error`-Untertyp nach ES5-Transformation und im paketierten Bundle.
- Den cachefreien Erstabruf aller zehn Dateien des realen freigegebenen MVP-0.4-Releases einschliesslich `parentId: null`, vollständigem Feiertagskatalog und tatsächlicher Produktdatenübernahme.
- Die Kompatibilität des AP5-Formats 1 und den Wechsel vom realen MVP-0.3-Format 3 zum Format 4.
- Die Zurückweisung ungültiger `oneOf`-Werte, semantisch verbotener Elternbezüge, unbekannter Kernfelder und nicht auflösbarer Quellen.
- Fail-closed ohne vorhandenen Aktivstand sowie den unveränderten Rückfall auf einen vollständig validierten Aktivstand bei Vertragsfehlern oder Prüfsummenabweichung.
- Dass ein unerwarteter Laufzeitfehler innerhalb eines realen `oneOf`-Zweigs unverändert weitergereicht und nicht als gewöhnliche Zweigabweichung verschluckt wird. Dazu wird nur testweise ein Fehler über das laufzeitlokale `Object.hasOwn` injiziert. Die Methode wird stets in `finally` wiederhergestellt.

Dies ist eine Regression des gebauten Produktcodes, kein Ersatz für die manuelle SharePoint-/Teams-Prüfmatrix. Reale Anmeldung, Netzwerk, Berechtigungen, Browser-IndexedDB, React-Lebenszyklus und visuelle Darstellung werden hier nicht nachgewiesen. Die Suite benötigt keine neuen Abhängigkeiten. Sie nutzt Node-Bordmittel sowie die bereits installierten Pakete `react` und `fake-indexeddb`.

## Erstnachweis am 22. September 2026

Der korrigierte Kandidat `0.4.0.1` bestand den vollständigen Lauf mit 25 Tests. Gegen das unveränderte Paket `0.4.0.0` schlug die gezielte Paketprüfung erwartungsgemäss fehl. Damit wird nicht nur die korrigierte Ausprägung akzeptiert, sondern auch der ursprüngliche Fehler tatsächlich erkannt.
