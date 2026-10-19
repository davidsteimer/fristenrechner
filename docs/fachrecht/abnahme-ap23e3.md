# AP23E3 Fachlich-technische Abnahme

Datum: 18. Oktober 2026. Entscheider: David Steimer.

David Steimer hat erklärt:

> AP23E3 ist fachlich-technisch abgenommen. Bitte starte die Releasevorbereitung für MVP 0.9.

**AP23E3 ist fachlich-technisch abgenommen. Die lokale Releasevorbereitung für MVP 0.9 ist beauftragt.** Die Erklärung ergänzt den unveränderten [Integrationsbericht](../architektur/verwaltungsintegration-ap23e3.md). Dessen damaliger Status und der ursprüngliche maschinenlesbare Prüfbericht werden nicht rückwirkend geändert.

## Abgenommener Umfang

- Gemeinsame Format-9-Integration gemäss [DEC-2026-033](../entscheidungen/DEC-2026-033-beschluss.md) mit Verwaltungsverfahrenskatalog 2.0.0 und ausdrücklicher Fallqualifikation.
- Dreizehn neue Verfahrenspfade für Luzern, Zug und Appenzell Ausserrhoden innerhalb der [AP23E1-Abnahme](abnahme-ap23e1.md), einschliesslich AR-Fünftagesrekurs, beschlossener Zeitfenster und begrenzter Sperre AR-O1.
- Erhalt der zwölf TI-/GR-Pfade, der bestehenden Bundes- und Berner Sozialverfahren, historischer Datenformate und AP5.
- Gemeinsame DE-/FR-Oberfläche, Standards im Format 5 ohne erfundene Falltatsachen, verständliche Rechenspur, geprüfter Exportweg und lokale Provider-/Hostintegration.
- Erhalt des zweispaltigen Aufbaus und der bereits separat [abgenommenen lokalen Datumsfeldkorrektur #50](../ux/abnahme-datumseingabe-issue50-lokal.md).

## Unveränderlich gesicherter Nachweis

Die [Abnahmekopie](../../outputs/ap23e3-abnahme-2026-10-18/receipt.json) enthält 417 exakt gebundene Dateien und zusätzlich den Archivbeleg. Sie umfasst die 330 QA-Eingaben, die gebundenen Einzelprüfungen, alle 42 Kandidatdateien sowie die tatsächlichen lokalen SPFx- und Webbuildartefakte. Nach dem Kopieren wurde sie unabhängig aus ihren eigenen Bytes erneut geprüft. Zwanzig Positiv- und Negativtests des Archivverfahrens sind bestanden.

| Gegenstand | SHA-256 |
| --- | --- |
| [Ursprünglicher Gesamtnachweis](../../outputs/ap23e3-2026-10-18/QA-AP23E3.json) | `fa564603394ed40a6eebc6a587b5e11111f4f37e75c9930b4a04d1d889991c80` |
| [Archivbeleg](../../outputs/ap23e3-abnahme-2026-10-18/receipt.json) | `18de59434d8dcb8469d0ebad767e6fcea55be089948335930d496990730da3ea` |
| Kandidatenmanifest `2026-10-18-ap23e3-reference.1` | `4c9f6025b7e29f577f760d2c9381066a176486983e0bae6997ac8738661ffa31` |
| Kandidat des Verwaltungsverfahrenskatalogs | `4be57d2f88b7568d223eb37ec98f8b8ca1133455b8fa5a30f868ac7991a9bd49` |

Die ursprünglichen Nachweise dokumentieren unter anderem 2654 Produkttests, 1584 historische Resultat-/Rechenspurvergleiche, alle 51 E1-Referenzen, die Bestandsbindungen sowie lokale Paket- und Browserprüfungen. Überlappende Testmengen werden nicht zu einer Gesamtzahl addiert. Diese fachlich-technische Abnahme ersetzt keine späteren realen Host- oder Geräteprüfungen.

## Getrennte Freigaben

Der [Releaseplan MVP 0.9](../betrieb/deployment-mvp-09.md) beginnt mit lokaler Vorprüfung und vollständigem Quelleninventar. Es folgen der inhaltliche Quellen-/Fassungsabgleich mit begründeter Wiederverwendung und die Vorlage zur menschlichen Quellenabnahme.

Der E3-Kandidat bleibt unverändert ein Kandidat, seine Vorschau erlaubt keinen Kalenderdownload. Quellenreleasefreigabe, lokale Datenübernahme, definitive Builds und Recovery, Commits, GitHub, Uploads, E/Q und P benötigen die jeweils konkrete spätere Freigabe. Der dokumentierte Betriebsstand MVP 0.8, Mirrors, historische AP5-Pins, AP21-Testapps und M365-Berechtigungen werden durch diesen Auftrag nicht geändert.
