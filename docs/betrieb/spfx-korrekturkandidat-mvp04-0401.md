# MVP 0.4: SPFx-Korrekturkandidat 0.4.0.1

Stand: 22. September 2026. Lokale technische Korrektur und Kandidatenvorbereitung im Auftrag von David Steimer. **Keine erneute E-/Q-Installation, keine GitHub-Veröffentlichung und keine P-Bereitstellung.** Die bisherige Installationsfreigabe war an die anderen Bytes von `0.4.0.0` gebunden.

## Anlass und Umfang

Der [E-Versuch mit 0.4.0.0](eq-vorpruefung-mvp04.md) lehnte den gültigen Wert `parentId: null` des Schweizer Feiertagskatalogs ab. Ursache war die ES5-Ausgabe der eigenen Fehlerklasse `HolidayCatalogError`. Deren Instanzen wurden nicht mehr als solche erkannt. Der enge `oneOf`-Catch reichte deshalb einen erwarteten Fehler des ersten Schema-Zweigs weiter, statt danach den zulässigen Null-Zweig zu prüfen.

Die Korrektur ergänzt nach `super(message)` ausschliesslich `Object.setPrototypeOf(this, HolidayCatalogError.prototype)`. Der Catch bleibt auf diese Fehlerklasse beschränkt. Weder Schema noch Daten werden abgeschwächt, und unerwartete Programmfehler dürfen weiterhin nicht als normale Zweigabweichung geschluckt werden.

| Bestandteil | Stand |
| --- | --- |
| Anwendungs- und WebPart-Version | Unverändert `0.4.0` |
| Solution- und Featureversion | `0.4.0.1` |
| Solution-, Feature- und Component-ID | Unverändert |
| API-Berechtigungen und Hostumfang | Unverändert, keine zusätzlichen API-Rechte, SharePointWebPart und TeamsTab |
| Datenrelease | Unverändert `2026-09-22-mvp-04-approved.1` |
| Unveränderlicher Datencommit | `739876a0d11b550ea8cc702622ab22af321994a5` |
| Manifest SHA-256 | `a240b01feb671dbe4374c1e097bc9143d66fd4878cd235b3b490a9c08afec72e` |
| Fachumfang | 479 Katalogregeln, nur zwölf bisherige operative CH-/BE-Feiertagsregeln. Keine zusätzliche Rechts- oder Kantonsfreigabe |

## Geschlossene Testlücke

Die bisherigen SPFx-Tests führen TypeScript-Quellen über `tsx` aus. Das genügte für diesen ES5-spezifischen Fehler nicht. Die neue Suite unter `spfx/test-build/` führt deshalb zwei zusätzliche Ebenen aus:

1. Tatsächlich erzeugte ES5-CommonJS-Module aus `lib-commonjs`, ohne erneute TypeScript-Übersetzung im Test.
2. Unverändertes AMD-JavaScript direkt aus dem erzeugten `.sppkg`. Der Test instanziiert den exportierten WebPart und erreicht dessen realen Release-Service, Validator und Produktdatenübergang.

Die Tests umfassen Fehlerklassenidentität, gültige nullable-/`oneOf`-Felder, Erstaktivierung mit leerem Speicher, Format-3-zu-4-Wechsel, AP5-Kompatibilität, ungültige Strukturen und fachliche Referenzen, fehlende Artefakte, Prüfsummenabweichungen und Erhalt des letzten gültigen Aktivstands. Eine zusätzliche Programmfehlerprobe schützt die enge Catch-Semantik. Der neue Prüfschritt `npm run test:built` ist zwingend **nach der Paketierung** Bestandteil von `npm run build` im SPFx-Verzeichnis.

Die Pakettests verwenden lokale, byteidentische Releasefixtures, kontrollierte SPFx-/React-Hostadapter und eine isolierte IndexedDB-Testimplementierung. Sie sind kein Nachweis für Tenantinstallation, tatsächlichen SharePoint-Transport, Teams-Authentisierung, Gastzugriff oder manuelle UI-Abnahme. Diese Grenzen bleiben Gegenstand der erneuten Zielumgebungsprüfung.

## Artefakte und Wiederholung

Der abschliessende lokale Gesamtbuild ist bestanden. Der gebundene Kandidat lautet:

| Merkmal | Wert |
| --- | --- |
| Datei | `fristenrechner-schweiz-0.4.0.1.sppkg` |
| Paketversion | `0.4.0.1` |
| Grösse | 202'616 Bytes |
| SHA-256 | `9f31513cbc56f0ee2bb178e1db9336252d0266527643bebc2fb1348820711346` |

Der [lokale Prüfnachweis](../../outputs/release-mvp04-spfx-0.4.0.1-2026-09-22/QA-MVP04-SPFX-0401.md) dokumentiert 676 bestandene Core-/UI-Tests, 48 SPFx-Quelltests, 25 Tests gegen emittierten Code und tatsächlichen Paketinhalt sowie 47 Artefakttests. Die Gegenprobe mit dem unveränderten alten Paket schlägt an den beiden erwarteten Stellen fehl. Zwei bereits bestehende `no-new-null`-Lintwarnungen bleiben ausgewiesen.

Der [separate Artefaktnachweis](../../outputs/release-mvp04-spfx-0.4.0.1-2026-09-22/artifact-verification.json) bindet ausschliesslich den neuen SPFx-Kandidaten. Die Paketkopie liegt unter `.work/release-mvp04-spfx-0.4.0.1-2026-09-22/artifacts/`. Der ursprüngliche [Artefaktnachweis](../../outputs/release-mvp04-2026-09-22/artifact-verification.json) und die gesicherten Dateien von `0.4.0.0` werden nicht überschrieben.

Der neue Präparator prüft alle zehn Datendateien byteweise gegen den Datencommit und das bestehende Mirrorarchiv. Er erstellt kein neues Mirror- oder Webarchiv. Das bisherige Webarchiv bleibt als historisch geprüfter Stand erhalten, nicht als Neubau des korrigierten Quellstands. Vor einer späteren P-Freigabe ist dessen Quellstandzuordnung separat festzulegen und nachzuweisen.

```bash
# Im Ordner spfx, nach Installation der gepinnten Abhängigkeiten
npm run build
npm run test:built

# Danach im Repository-Stamm
npm run build:artifacts:mvp04:spfx-correction
npm run test:artifacts:mvp04
npm run test:artifacts:mvp04:spfx-correction
```

Ein späterer Neubau kann aufgrund der dokumentierten SPFx-Buildvarianz eine andere Prüfsumme erzeugen. Der Präparator überschreibt einen bereits gebundenen abweichenden Kandidaten nicht. Eine andere Paketprüfsumme ist niemals automatisch von der Freigabe einer vorherigen Datei erfasst.

## Freigabegrenze und nächster Schritt

Die lokalen Prüfungen sind abgeschlossen. Genau die oben gebundene Paketdatei und ihre SHA-256 sind für den erneuten begrenzten E-/Q-Eingriff separat freizugeben. Vor diesem Eingriff müssen aktueller Katalog- und Instanzstand, unveränderte Mirrors, Rechte und Rückfallmöglichkeit erneut geprüft werden. Insbesondere ist die nach dem ersten Versuch nicht unabhängig verifizierte E-Appinstanz-Versionsmetadatenlage zu berücksichtigen.

Die Reihenfolge bleibt E → Q → manuelle Q-Abnahme → gesonderte GitHub-Freigabe → gesonderte P-Freigabe. Die historische E-Registerkarte behält AP5-Datenpin, leeren Mirrorpfad und ihren Namen. Prüfungen mit vorhandenem Cache ersetzen keinen vollständigen Erstabruf des neuen Mirrors.

Die bestehende ES5-Besonderheit anderer Fehlerklassen ist durch diese enge Korrektur nicht als mitbehoben ausgewiesen. Bei `CalendarGenerationError` kann ein spezifischer Fehlergrund auf den generischen, weiterhin gesperrten Fehlerzustand zurückfallen. Eine spätere technische Vereinheitlichung ist vom vorliegenden Aktivierungsblocker zu unterscheiden.

David Steimer bleibt für fachliche und betriebliche Freigaben verantwortlich. Codex ist ausführendes KI-Arbeitsinstrument ohne formelle Freigabeverantwortung.
