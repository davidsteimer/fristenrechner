# Technische Produktionsbereitstellung vom 1. September 2026

| Merkmal | Nachweis |
| --- | --- |
| Status | technische Erstbereitstellung abgeschlossen, öffentlicher P-Betrieb mit DEC-2026-018 freigegeben |
| öffentliche Adresse | `https://www.steimer.ch/fristenrechner/` |
| Anwendung | `0.3.0` |
| Datenrelease | `2026-08-31-mvp-03-approved.1` |
| Manifestformat | `3.0.0` |
| Kalenderkomponente | `2.0.0` |
| Referenzcommit | `32f5225ec1695ea0842d64db1191a1a3d5e2f204` |
| Hosting | bestehende statische steimer.ch-Hosting-Infrastruktur |
| fachlich und betrieblich verantwortlich | David Steimer |
| technische Ausführung und Prüfung | David Steimer mit Codex |

## 1. Ergebnis

Der exakt bezeichnete AP16-Kandidat wurde nach Sicherung des Ausgangsstands zunächst in einen nicht öffentlich verlinkten Hostingordner hochgeladen und geprüft. Nach bestandener Vorprüfung wurde er unter `/fristenrechner/` öffentlich geschaltet. Anschliessend bestanden D01 bis D11. Nach der gesonderten Freigabe der Root-Änderungen wurden auch der Startseitenverweis und `sitemap.xml` veröffentlicht. D12 ist ebenfalls bestanden.

Die technische Erstbereitstellung ist damit abgeschlossen. David Steimer hat den öffentlichen P-Betrieb gestützt auf diesen Nachweis anschliessend mit [DEC-2026-018](../entscheidungen/DEC-2026-018-freigabe-oeffentlicher-p-betrieb.md) formell freigegeben. Codex übernimmt keine formelle Freigabe- oder Haftungsverantwortung.

## 2. Paketidentität

| Artefakt | Wert |
| --- | --- |
| Deploymentpaket | `fristenrechner-0.3.0-p.zip` |
| SHA-256 | `4ed35ef8fb77f30994ad4a708a7171ad3992c98e2522be2c5230cde416c9abf6` |
| Dateien im Paket | 12 |
| Commit | `32f5225ec1695ea0842d64db1191a1a3d5e2f204` |
| Buildpfad | `.work/public-app/` |

Die öffentlich ausgelieferten Anwendungsdateien wurden gegen die lokalen Kandidatenprüfsummen verglichen. Der öffentliche Dateisatz stimmt mit dem Kandidaten überein.

## 3. Öffentliche Prüfmatrix D01 bis D12

| ID | Ergebnis | Nachweis | Status |
| --- | --- | --- | --- |
| D01 | kanonische Adresse | `https://www.steimer.ch/fristenrechner/` antwortet erfolgreich | bestanden |
| D02 | HTTPS und Weiterleitung | HTTP und nicht kanonische Adressen werden auf die kanonische HTTPS-Adresse geführt | bestanden |
| D03 | Paketidentität | veröffentlichte Dateien und Buildmanifest entsprechen dem freigegebenen Kandidaten | bestanden |
| D04 | Sicherheitsheader | CSP, `nosniff`, Referrer-, Einbettungs- und Berechtigungsheader werden wirksam ausgeliefert | bestanden |
| D05 | Cache | HTML ist nicht dauerhaft speicherbar, inhaltsadressierte Assets sind unveränderlich cachebar | bestanden |
| D06 | externe Aufrufe | keine Laufzeitabfrage an GitHub, SharePoint, Graph, CDN oder andere Dritte | bestanden |
| D07 | Deutsch | Hauptablauf, Validierung, Referenzfall und gespeicherter Kalenderexport funktionieren | bestanden |
| D08 | Französisch | Hauptablauf, Validierung, Referenzfall und Kalenderexport funktionieren | bestanden |
| D09 | Mobilansicht | bei exakt 390 × 844 Pixeln kein horizontaler Überlauf | bestanden |
| D10 | Datenschutz | Empfangsdatum und Kalenderreferenz werden weder gespeichert noch übertragen | bestanden |
| D11 | Fehlerfälle | leeres Datum und Fristdauer `0` erzeugen klare Fehler und kein plausibles Resultat | bestanden |
| D12 | Root-Integration | Startseitenlink, Impressum, Quellcode, Lizenz und `sitemap.xml` sind korrekt | bestanden |

### Referenzfall

Für StPO, zuständige Behörde Kanton Bern, direkte Zustellung, Empfang am 16. September 2026 und eine Frist von zehn Tagen ergaben sich:

- Fristbeginn 17. September 2026
- rechnerisches Ende 26. September 2026
- endgültiges Ende 28. September 2026

Der gespeicherte deutsche Kalenderexport enthält einen ganztägigen freien Termin am 28. September 2026 mit exklusivem Enddatum 29. September 2026, den Betreff `Fristablauf (P-PROBE-2026)` und die Erinnerung `-PT112H`.

Beim französischen Browserlauf wurde der Kalenderexport bis zum nativen Speicherdialog geprüft. Eine zweite gespeicherte Datei wurde wegen des Zustands der Chrome-Downloadfunktion nicht erzeugt. Der sprachunabhängige Exportpfad ist durch die automatisierten Tests und den gespeicherten deutschen Produktionslauf abgedeckt. Diese technische Einschränkung ändert den Befund von D08 nicht.

### Mobil- und Datenschutzbefund

Bei der mobilen Prüfung betrugen Viewportbreite 390 Pixel sowie Dokumentbreite und Scrollbreite je 375 Pixel. Ein horizontaler Überlauf lag nicht vor.

Nach Speichern und Neuladen zulässiger Standards blieben Empfangsdatum und optionale Referenz leer. Die statische Quellprüfung bestätigte zusätzlich, dass beide Angaben weder im Browserstorage noch in Netzwerkanfragen verwendet werden.

## 4. Root-Integration

| Datei | Änderung | SHA-256 des öffentlichen Stands |
| --- | --- | --- |
| `/wwwroot/index.html` | sichtbarer Link `Berner Fristenrechner · Open Source →` | `a2c1c27736fd9199e40c10fdcb45b7bd0edc07b51b481e905a1ee35d480258f0` |
| `/wwwroot/sitemap.xml` | Eintrag für `https://www.steimer.ch/fristenrechner/` | `a945e7461980be4095eb869e10ddfa5e594960881be2d71150884e8453f03965` |

Die Sitemap ist wohlgeformtes XML. Der Startseitenlink ist sichtbar, eindeutig und führt auf die kanonische Adresse. Die Anwendung verlinkt auf das Impressum, das öffentliche GitHub-Repository und die AGPL-3.0-Lizenz.

## 5. Rückfallnachweis

| Merkmal | Wert |
| --- | --- |
| Sicherungsarchiv | `green-static-build/steimer-static-deploy-2026-08-15.zip` |
| SHA-256 | `e6306875f169c08a0f8b6cb6e24375ca0fb0b98bd333110f564556ac60279db8` |
| ZIP-Integrität | bestanden |
| reversibler Altbestand | `/wwwroot-alt-2026-08-15` |
| temporärer Hostingordner | `fristenrechner-stage-2026-09-01-32f5225e`, nach Umschaltung leer |

Der leere temporäre Hostingordner wird nicht ohne separaten betrieblichen Entscheid gelöscht. Ein Rückfall kann gemäss [Deployment- und Rückfallanleitung](deployment-oeffentliche-p-auspraegung-ap16.md) durchgeführt werden.

## 6. P-Betriebsentscheid

Technisch bestehen nach der bestandenen Matrix D01 bis D12 keine offenen Freigabebefunde. David Steimer hat am 1. September 2026 ausdrücklich erklärt:

> Ich gebe den öffentlichen P-Betrieb des Berner Fristenrechners auf steimer.ch gestützt auf den Produktionsnachweis vom 1. September 2026 und die vollständig bestandene Prüfmatrix D01 bis D12 frei.

Der Betriebsentscheid ist als [DEC-2026-018](../entscheidungen/DEC-2026-018-freigabe-oeffentlicher-p-betrieb.md) dauerhaft dokumentiert. Der öffentliche P-Betrieb des bezeichneten Stands ist damit freigegeben.
