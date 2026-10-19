# AP23E3 – Gemeinsame Integration LU, ZG und AR

Stand: 18. Oktober 2026. Auftrag und Grundlage: [technische Abnahme AP23E2](../fachrecht/abnahme-ap23e2.md), [Fachabnahme AP23E1](../fachrecht/abnahme-ap23e1.md) und [DEC-2026-033](../entscheidungen/DEC-2026-033-beschluss.md).

**Lokal umgesetzt und technisch geprüft. Die menschliche fachlich-technische Abnahme dieses Kandidaten steht aus.** Keine neue Quellenreleasefreigabe, keine Installation und kein Betriebswechsel. MVP 0.8 bleibt unverändert.

## Ergebnis und Vorschau

Die gemeinsame Rechneroberfläche verwendet einen echten Format-9-Kontext. Sie verbindet die 13 neuen LU-/ZG-/AR-Wege mit den zwölf bisherigen TI-/GR-Wegen und den bestehenden Bundes- und Berner Sozialverfahren. Der bisherige zweispaltige Aufbau, die frühe Datumseingabe und die bereits abgenommene Datumsfeldkorrektur bleiben erhalten. Auf schmalen Bildschirmen gilt weiterhin der bestehende einspaltige Umbruch.

Die [lokale Vorschau](http://127.0.0.1:8802/fristenrechner/) verwendet ausdrücklich den Kandidaten `2026-10-18-ap23e3-reference.1`. Nach einem Neustart ist sie im Projekt mit `npm run preview:ap23e3` erreichbar. Sie ist nicht öffentlich zugänglich. Sämtliche Kalenderdownloads sind in dieser Prüfansicht gesperrt, auch für bisherige Verfahren.

| Kanton | Neu integriert | Wesentliche Abgrenzung |
| --- | --- | --- |
| Luzern | Ordentliche Verwaltungs- und Gerichtsbeschwerde, je 30 Tage, sowie angeordnete prozessuale Tagesfristen beider Stufen | Eigene VRG-Feiertagsbindung, kein allgemeiner Stillstand, Zeitraum 27.09.2026–31.12.2027 |
| Zug | Verwaltungsbeschwerde mit 20 Tagen, Gerichtsbeschwerde mit 30 Tagen sowie angeordnete prozessuale Tagesfristen beider Stufen | Kein allgemeiner Stillstand, Zeitraum 29.08.2026–31.12.2027 |
| Appenzell Ausserrhoden | Ordentlicher Rekurs mit 20 Tagen, qualifizierter Vollstreckungsrekurs mit fünf Tagen, Gerichtsbeschwerde mit 30 Tagen sowie angeordnete prozessuale Tagesfristen beider Stufen | Stillstand nur im qualifizierten Gerichtsweg. AR-O1 bleibt gesperrt. Zeitraum 29.08.2026–31.12.2027 |

Die fachlichen Regeln entsprechen der unveränderten E1-Abnahme. Die Auswahl bezeichnet jeweils den Sitz der zuständigen kantonalen Zielstelle. Neue kommunale Verfahren, Spezialrechte oder ausserbernische Sozialanbindungen sind nicht enthalten.

## Bedienung und aktuelle Fallvoraussetzungen

Die bestehende Auswahl **Fallkonstellation** wird je nach Handlung präzisiert. Für das ordentliche Rechtsmittel nennt sie Endentscheid, vollständigen Empfang, unbestrittene Belehrung und unveränderte ordentliche Tagesfrist. Beim AR-Fünftagesrekurs bezeichnet sie ausdrücklich die qualifizierte Nichtgeldvollstreckung nach Art. 63 VRPG. Angeordnete prozessuale Eingaben sind von Zahlungen und materiellen Erfüllungspflichten abgegrenzt.

Diese aktuelle Auswahl erzeugt die im Vertrag verlangten Fallmerkmale. Ohne ausdrückliche Auswahl oder bei unbekannten, widersprüchlichen oder ausgeschlossenen Voraussetzungen wird nicht gerechnet. Es gibt keine zusätzliche Bestätigungscheckbox und kein separates Feld für jedes technische Merkmal. Die bewusst ausführlichere Auswahl wird bei Bedarf mehrzeilig angezeigt, damit ihre Bedeutung nicht abgeschnitten wird.

Gesetzliche Fristen werden automatisch angezeigt. Die bekannten Feiertage ergeben sich aus dem Verfahren und dem Behördensitz, nicht aus einem freien technischen Kalenderfeld. Abhängige Angaben und Ergebnisse werden beim Wechsel von Kanton, Stufe oder Handlung verworfen. Das bereits eingegebene Datum bleibt erhalten.

Defaults bleiben im bestehenden Format 5. Persönliche Verfahrenspräferenzen dürfen gespeichert werden, aktuelle Falltatsachen nicht. Auch nach dem Laden von Standards ist die aktuelle Fallkonstellation neu zu bestimmen. Der bestehende Format-5-Speichervertrag benötigt deshalb keine weitere Versionsänderung.

Die Rechenspur zeigt verständliche Rechtsgrundlagen mit direkten Normlinks und gegebenenfalls die konkret betroffenen Stillstandsperioden. Technische Kennungen und Prüfsummen bleiben unter «Technische Nachweise» aufklappbar. Beim AR-O1-Sperrfall werden die bereits geprüften Zwischenschritte sichtbar, aber kein fiktives Enddatum und kein Exportangebot.

## Daten- und Laufzeitvertrag

Der native Reader prüft Manifest 9.0.0 und Verwaltungsverfahrenskatalog 2.0.0 unmittelbar. Es findet keine Umdeklaration oder Konvertierung zu Format 8 statt. Jeder Format-9-Kontext besitzt eine eigene, nicht durch Kopieren oder Serialisieren herstellbare Laufzeitidentität. Gemeinsame Bundes-, Spezial- und Sozialrechenwege prüfen ebenfalls diese Identität.

Die 25 Definitionen und Qualifikationsregeln sind an den abgenommenen E2-Vertrag gebunden. Die zwölf historischen TI-/GR-Wege behalten ihren Eingabevertrag. Die 13 neuen Wege verlangen die geschlossene aktuelle Qualifikation. Die gemeinsame Tagesfristarithmetik wurde nicht verändert.

Der lokale Kandidat umfasst 41 Komponenten und ein Manifest. Dazu gehören 32 Kalender, fünf Rechtsprofile, Spezialregime, Feiertagskatalog, Sozial- und Verwaltungsverfahrenskatalog. Die fünf Rechtsprofile und der Spezialregimekatalog bleiben byteidentisch zu MVP 0.8. Die übrigen Komponenten werden zusammenhängend neu an die tatsächlichen Kandidatenbytes gebunden. Die 44 Sozialregeln und 50 BE-Anbindungen bleiben fachlich unverändert und auf ihre bisherigen Freigabegrenzen beschränkt.

| Kandidatenartefakt | SHA-256 |
| --- | --- |
| Manifest | `4c9f6025b7e29f577f760d2c9381066a176486983e0bae6997ac8738661ffa31` |
| Verwaltungsverfahrenskatalog | `4be57d2f88b7568d223eb37ec98f8b8ca1133455b8fa5a30f868ac7991a9bd49` |

Der [Kandidaten-Nachweis](../../outputs/ap23e3-candidate-2026-10-18/bundle-integrity.json) unterscheidet ausdrücklich den beschlossenen Vertrag vom noch nicht freigegebenen Quellenrelease. Der operative Provider verwirft den lokalen Kandidaten bereits anhand des Manifests, bevor Komponenten oder Cache aktiviert werden. Prüfungen einer vollständig freigegebenen Datenform verwenden ausschliesslich synthetische Freigaben im Arbeitsspeicher. Diese sind keine menschliche Freigabe und werden nicht ausgeliefert.

Die SPFx-Hostintegration erhält bei identischen, erneut validierten Bytes den gültigen Formularkontext. Bei einem anderen Mirror, Manifest oder ungültigem Abruf wird kein fremder oder veralteter Rechenkontext weiterverwendet. Die tatsächliche Datenkonfiguration bleibt die Grundlage der Cachezuordnung. AP5 und die älteren Formate bleiben separat verwendbar.

## Lokale Qualitätssicherung

Der [maschinenlesbare Gesamtnachweis](../../outputs/ap23e3-2026-10-18/QA-AP23E3.json) bindet den tatsächlichen Quellstand, Einzelprüfungen, Builds und Browsernachweise. Zählungen verschiedener Ebenen überlappen und werden nicht zu einer künstlichen Gesamtzahl addiert.

| Prüfung | Nachweis |
| --- | --- |
| Vollständige Produktregression | 2654 Tests bestanden, keine Fehler und keine übersprungenen Tests |
| Historische AP5-Vergleichsrechnung | 1584 vollständige Resultat-/Rechenspurvergleiche bestanden |
| E1-Referenzen im echten Format-9-Rechenkern | Alle 51 Referenzen, darunter 34 Datums- und 17 Sperrfälle, bestanden |
| Bundes- und Sozialbestand | Alle 104 Bundesbindungen und 50 BE-Sozialbindungen gegen MVP 0.8 geprüft |
| Neue UI und bisherige Bedienung | 17 neue UI-Tests und 121 fokussierte bestehende Tests bestanden, zusätzlich im Produktvollauf enthalten |
| Statische Webausgabe | 32 Tests bestanden, darunter sieben Prüfungen des tatsächlichen minifizierten E3-Builds |
| Lokale Hostkomponente | 30 Lebenszyklus-, Cache- und Konfigurationsprüfungen bestanden |
| SPFx | 215 Providerprüfungen und 117 Tests der tatsächlichen Paketdateien bestanden. Isolierter Produktionsbuild und CSS-Audit ebenfalls bestanden |
| Browser | AR-Fünftagesrekurs, AR-O1, Luzerner Josefstagfall, Zuger Verwaltungsbeschwerde, DE/FR und 390-Pixel-Ansicht geprüft |

Die Browserprüfung ergab keinen horizontalen Überlauf bei 390 Pixeln und keine protokollierten Konsolenfehler. Datumseingabe und einzeilige Auswahlelemente haben je 32 Pixel Höhe und 14 Pixel Schrift. Die bereits abgenommene CSS-Datei ist gegenüber der E2-Ausgangssicherung unverändert. Das ist eine lokale Browserprüfung, keine vorweggenommene Prüfung realer iOS-Geräte oder M365-Hosts.

Der erste SPFx-Prüflauf scheiterte an einer während der parallelen Integration noch geänderten Quelle und einem alten Test, der Format 9 als unbekannte Version verwendete. Die synchronisierte stabile Fassung und eine tatsächlich unbekannte Version werden im Wiederholungslauf geprüft. Zwei historische Webtests mussten ebenfalls präzisiert werden: Der neue Validator enthält MVP 0.8 als erlaubte Herkunftskennung. Ein globales Verbot dieser Zeichenkette wäre deshalb falsch. Die Ersatzprüfungen kontrollieren den tatsächlichen historischen Einstieg, Datenimport, Buildmanifest und den sichtbar geladenen Datenstand. Die Erstbefunde bleiben separat erhalten.

Die unveränderten historischen Abnahmen sind in der [E2-Sicherung mit 201 Dateien](../../outputs/ap23e2-abnahme-2026-10-18/receipt.json) erhalten. Der neue Prüfer schreibt deren Sollwerte nicht um. Betriebspaket, normale Datenpins, MVP-0.8-Release und AP5-Daten bleiben geschützt. Das isoliert gebaute SPPKG dient nur als Prüfarbeitskopie und ist kein neuer freigegebener Installationskandidat.

## Kurze Abnahmehilfe

Für eine UI-Stichprobe in der lokalen Vorschau genügen diese Fälle. Jeweils die passende aktuelle Fallkonstellation auswählen.

| Auswahl | Empfang | Erwartung |
| --- | --- | --- |
| LU, Verwaltungsbeschwerde, ordentlich | 17.02.2027 | 30 Tage, Fristablauf 19.03.2027, kein Stillstand |
| ZG, Verwaltungsbeschwerde, ordentlich | 16.10.2026 | 20 Tage, Fristablauf 05.11.2026 |
| AR, Verwaltungsbeschwerde, Vollstreckungsrekurs nach Art. 63 | 16.10.2026 | Fünf Tage, Fristablauf 21.10.2026 |
| AR, Gerichtsverfahren, ordentliche Beschwerde | 18.02.2027 | AR-O1-Sperre, kein definitiver Fristablauf |
| Beliebiger neuer Weg, Fallkonstellation nicht gewählt oder ungeklärt | Beliebiges gültiges Datum | Keine definitive Berechnung |

Danach insbesondere einen Verfahrenswechsel und den Sprachwechsel prüfen. Die Fallqualifikation darf nicht unbemerkt in einen anderen Weg übernommen werden. Quellenrelease, E/Q-Geräte-/Gastprüfung und Betriebsbereitstellung folgen erst nach gesonderter Abnahme und Beauftragung.
