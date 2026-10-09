# AP21 Lokaler Umsetzungs- und Prüfstand

Stand: 8. Oktober 2026. Einheitliche Datumseingabe implementiert und lokal geprüft. AP21 ist noch nicht als Ganzes abgenommen. Die reale Geräte- und M365-Prüfung bleibt offen.

## Nachweise

| Bereich | Ergebnis |
| --- | --- |
| TypeScript-Prüfung | Bestanden |
| AP21 Parser, Datumskomponente, Formular und echte React-DOM-Integration | 50 bestanden |
| Gesamte öffentliche Produktregression | 2’248 bestanden, einschliesslich der 50 AP21-Prüfungen |
| Hostadapter | 10 bestanden |
| Webbuildprüfungen | 16 bestanden, einschliesslich zweier AP21-Prüfungen |
| Isolierte SPFx-Quelltests | 186 bestanden |
| Tatsächlich kompiliertes SPFx-Paket | 80 bestanden, davon acht neue AP21-Prüfungen |
| SPFx-Kompilierung, CSS-Audit und Paketierung | Bestanden, 15 nicht blockierende bestehende Lintwarnungen |
| Lokaler Browser | DE/FR, Tastatur, Kalender, Fehler und schmale Ansicht geprüft |
| Reale Geräte und M365 | Noch offen |

Die Zahlen sind unterschiedliche Prüfschichten und keine addierte Anzahl unabhängiger Fachfälle. Keine übersprungenen oder abgebrochenen Prüfungen werden als Erfolg gezählt.

- [Bedienvertrag und technische Umsetzung](../../docs/architektur/datumseingabe-ap21.md)
- [Automatisierter Nachweis](QA-AP21.json)
- [Isolierter SPFx-Nachweis](spfx-build.json)
- [Browserprüfung und Bildschirmbelege](browser-qa.md)
- [Noch offene Geräteprüfung](geraetepruefung.md)
- [Integritätsregister](completion-integrity.json)

## Abgrenzung

Rechenkern, Rechtsregeln, Datenformate und AP22C3-Referenzdaten bleiben unverändert. Die 204 Dateien des AP22C3-Abnahmearchivs wurden gegen dessen gebundene Prüfsummen geprüft. Historische AP5-Pins und das vorhandene freigegebene SPFx-Paket bleiben erhalten. Der neue Webbuild und das isolierte Testpaket sind nicht zur Installation freigegeben. E, Q, P, GitHub und Berechtigungen wurden nicht verändert.

Ein erster Produktgesamtlauf hatte einen veralteten quelltextgebundenen Test zur Signatur der Validierungsfunktion. Die Erwartung wurde an die explizite Übergabe des aktuellen Formularstands angepasst. Der ursprüngliche Fehlbericht bleibt als `product-tests-initial-stale-assertion.txt` erhalten. Der anschliessende Gesamtlauf ist vollständig erfolgreich. Zwischenbefunde der SPFx-Kompilierung und der laufenden Quellsynchronisation werden im separaten SPFx-Nachweis sichtbar belassen.

## Nächster Haltepunkt

Bedienprüfung durch David Steimer an der lokalen Vorschau. Danach kontrollierter Prüfzugang für die reale Geräte- und M365-Matrix, mit gesonderter Freigabe einer allfälligen E-/Q-Installation. Der lokale Server ist ausschliesslich an Loopback gebunden. Für iOS ist diese Adresse nicht vom Mobilgerät aus erreichbar. Es wurde weder ein LAN-Port noch eine öffentliche Testumgebung geöffnet.
