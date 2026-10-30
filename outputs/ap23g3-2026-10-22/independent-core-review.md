# AP23G3 Gegenreview von Daten und nativem Rechenkern

Stand: 22. Oktober 2026. Geprüft wurde die lokale G3-Integration auf Grundlage des beschlossenen DEC-2026-036. **Im abschliessend geprüften Stand ist kein blockierender Daten- oder Kernbefund festgestellt.** Dies ist eine ergänzende technische KI-Gegenprüfung, kein menschliches Vieraugenprinzip und keine Betriebsfreigabe.

## Daten und Herkunft

Die neue native Manifestbindung verwendet `2026-10-22-ap23g3-candidate.1` mit Manifest-SHA-256 `bf710be1a5e58b540d644e4dace885eed4dbe998a431badb9eec07032ea6bada`. Alle 58 Pfad- und Policyobjekte entsprechen den abgenommenen G2-Definitionen. Die 42 älteren Pfade sind zusätzlich mit dem gesonderten F3-Ausgangspunkt verglichen.

Die 33 Kalender und der Feiertagskatalog bleiben exakt die F3-Rohbytes. Insgesamt bleiben 40 der 42 Artefakte rohgleich. Nur Verwaltungs- und Sozialkatalog werden kontrolliert auf die neue aktuelle Zielbindung fortgeschrieben. Die 44 Sozialregeln, 50 Berner Anbindungen und ihre Grenzen bleiben unverändert.

`physicalBaseline` nennt die tatsächlichen G3-Zielbytes. `physicalReuse` der vier neuen Bindungen behält dagegen die geprüfte historische F3-Herkunft. Diese Angaben wurden nicht gleichgesetzt. Für SH-Verwaltung bleiben VRG-/RTG-/BGer-Provenienz und Praxiszusatz eigenständig. Gerichtsort, OGE und ZPO gehören weiterhin zur gesonderten Gerichtsbindung.

Zehn eigene TypeScript-Datentests und sechs getrennte Python-Datentests sind bestanden. Die Pythonprüfung importiert keine Produktmodule, Builder oder JS-Prüfer. Sie kontrolliert tatsächliche Rohbytes, Schemata, die abgenommenen Definitionsobjekte und sieben erneut versiegelte Negativvarianten. Sie ist keine zweite Rechtsauslegung.

## Lesender Kerngegencheck

Gesichtet wurden insbesondere `releaseFormat11.ts`, `administrativeCatalogV4.ts`, `administrativeDeadline.ts`, `format11Runtime.ts`, `format11CalculationData.ts`, `administrativeContext.ts`, `modernRuntime.ts`, die gemeinsamen Kalender-/Altprofilzugänge und `administrativeExport.ts`.

Die neue native Registry nimmt keinen Format-10-Kontext als Format-11-Identität an. Der gemeinsam genutzte Kalender- und Tageszähler arbeitet hinter den jeweiligen nativen Fähigkeiten. Der neue Factoryweg importiert keinen G2-Referenzauswerter und formt Katalog 4 nicht in einen alten Reader um.

Die tatsächlichen Parserresultate und ihre Definitionsbäume sind eingefroren. Die Artefaktmap gibt ihre veränderliche interne Map nicht frei. Rechenkern und Export erkennen kopierte oder serialisierte Statusfelder nicht als Fähigkeit an. Der UI-Export bindet das konkrete Resultat zusätzlich an Inputsignatur und Kontextidentität und rechnet vor dem Export erneut.

Die V4-Fallqualifikation ist pfadbezogen geschlossen. Fehlende, zusätzliche oder ungeklärte Fakten werden nicht aus Defaults ergänzt. Eröffnungsherkunft und rechtzeitige Voranforderung werden nur auf den sechs einschlägigen Wegen verlangt. SH-Obergerichtsbegründung verlangt dasselbe entscheidende Gericht. Die Urner Lokal-, Eröffnungs- und Koordinationsgrenzen bleiben voneinander getrennt.

Die vollständige Tagesstrecke wird gegen Fall-, Rechen-, Quellen-, Norm-, Kalender- und Releasefenster geprüft. Das umfasst übersprungene Tage und Endverschiebungen. Eine Norm am Empfangstag allein genügt nicht. Der Art.-22-Hinweis wird am Eröffnungstag geprüft und verändert keine Datumsarithmetik.

## Zusätzlich ausgeführte Gegenproben

Die Proben verwendeten tatsächliche G3-Bytes, den nativen Format-11-Reader und vollständige synthetische aktuelle Inputs. Es wurden keine Falldaten oder Browserpräferenzen gespeichert.

| Probe | Ergebnis |
| --- | ---: |
| Alle 42 älteren Pfade am 02.10.2026 mit ihrer jeweiligen Dauer | Berechnet, weiterhin nur Referenz |
| Alle 16 neuen Pfade mit den positiven aktuellen Fakten | Berechnet, weiterhin nur Referenz |
| Einzeln entfernte erforderliche aktuelle V4-Fakten | 192 Sperren |
| Kopie, strukturierte Kopie, JSON-Kopie, Proxy, abgeleitetes Prototypobjekt und frei gebauter Kontext | Sechs Kontext- und Exportabweisungen |
| Direkte Änderung einer eingefrorenen Pfaddauer | Verhindert |
| Neu versiegelte Änderungen an Warnprofil, Ostergrenze, Eröffnungskette, Empfängeridentität, SH-Praxis und Herkunft, Quelle, Altdauer und Normfenster | Zehn Zurückweisungen |
| Eröffnung vor dem neuen Fenster beziehungsweise über die Endgrenze laufende Berechnungen | Vier Sperren ohne definitives Fristresultat |
| Kalenderexport aus dem tatsächlichen G3-Referenzresultat | Verweigert |

Ein während der parallelen Umsetzung bemerkter `String()`-Umwandlungspfad für `openingOrigin` war beim abschliessenden Test bereits vom Kernverantwortlichen durch direkte strikte Wertvergleiche ersetzt. Die eigene Probe mit einem Objekt, dessen `toString()` den positiven Text zurückgibt, wird mit `administrative.openingOriginNotQualified` gesperrt. Die Kernregression enthält zusätzlich umhüllte Zeichenketten sowie eigene `toString`-/`valueOf`-Objekte für alle sechs Eröffnungsketten. Dieser Befund bleibt nicht offen.

## Bindung des gesichteten Kernstands

| Datei | SHA-256 |
| --- | --- |
| `src/core/administrativeDeadline.ts` | `2074a6c3c4746e684a7d283a4728a9bc72581bb48fde3213a687ef887a9c757e` |
| `src/core/releaseFormat11.ts` | `abee0ba1dc93606a7bd4e76c437bdd514cb8d45692ec7303df1709c51200440c` |
| `src/core/administrativeCatalogV4.ts` | `253a6068933657b8ca4038fee30abb2a9ae0357c9fb25b86c0797f9d3ccc3bbe` |
| `src/core/format11Runtime.ts` | `f7a9c7a226049e81752e158fc7e8b8ce97dea324b4662d410e7f27166c943b3c` |
| `src/core/format11CalculationData.ts` | `266a3c2e8f481eff7df6c7844e8b8ea060fc76b8c87752ebb8989dcc2f4118d0` |
| `src/core/modernRuntime.ts` | `c232ececf4efa4f2ac26fde8a6e0875a3da41c366c7129c5bdb91194dfab008e` |
| `src/ui/administrativeExport.ts` | `6247d3f211eac2a31b97c89cbbe599e586e4013d4fc05ba44cc7c85a20cd1326` |

Spätere Änderungen an diesen Dateien benötigen einen erneuten gezielten Gegencheck. Die TypeScript-, Produkt-, UI-, Host- und tatsächlichen Paketprüfungen bleiben eigene Nachweise. Aus diesem Gegenreview folgen keine Quellenpromotion, Releasefreigabe, Installation, Uploads oder E-/Q-/P-Änderungen.
