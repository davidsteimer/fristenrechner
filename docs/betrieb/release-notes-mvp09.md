# MVP 0.9 Releasehinweise

Stand: 19. Oktober 2026. Anwendung `0.9.0`, SPFx `0.9.0.0` und Daten `2026-10-18-mvp-09-approved.1` sind auf den vier bestehenden E-/Q-Instanzen technisch geprüft und [von David abgenommen](abnahme-q-mvp09.md). Geräteprüfung, Gastzugriff und begrenzte Outlook-Wiederverwendung sind bestätigt. GitHub und öffentliche Bereitstellung sind noch nicht erfolgt. Letzter dokumentierter P-Stand ist [MVP 0.8](produktionsbereitstellung-mvp08-2026-10-16.md), keine neue Liveinventur.

## Neu und erhalten

Vier Luzerner, vier Zuger und fünf Ausserrhoder Wege ergänzen die fünf Tessiner und sieben Bündner Pfade. Der AR-Fünftagesrekurs ist enthalten. Gesetzliche Dauern, Stillstände, Endverschiebung und erforderliche Fallangaben werden verfahrensbezogen bestimmt. Die Feiertagsanknüpfung der allgemeinen kantonalen Verwaltungswege folgt dem Sitz der zuständigen Stelle.

Die abgenommene Datumshöhenkorrektur #50 ist enthalten: Desktop 32 Pixel Höhe und 14 Pixel Schrift, Touchdarstellung 44/16. Eingabe, Kalender und Kurzformen bleiben erhalten. Der zweispaltige Aufbau und die fachlichen Rechenregeln werden durch die Publikationsarbeiten nicht verändert.

## Abdeckung und Grenzen

- LU ab 27.09.2026, ZG/AR ab 29.08.2026, jeweils vollständig bis 31.12.2027. Alle für die Berechnung benötigten Tage müssen gedeckt sein.
- Bisherige TI-/GR-Fenster und die qualifizierte TI-O2-Sperre bleiben erhalten. AR-O1 bleibt für die vorbehaltene Konstellation gesperrt.
- 44 nationale Sozialregeln und 50 BE-Anbindungen bleiben auf Bern und 2026–2027 begrenzt.
- Bundesverfahrensbindungen, Januargrenzen, AI-Behandlung, GR-/NE-Vorbehalte und der ergänzende Freiburger Praxisbeleg bleiben unverändert.
- Weitere kantonale Verwaltungsverfahren und nicht modelliertes Spezialrecht sind nicht aktiviert. Eigenständiges kommunales Recht bleibt ausgeschlossen.
- Produktsprachen bleiben DE/FR. Italienisch und Rumantsch Grischun als GUI, Kalender-App und Karte sind kein Releasebestandteil.

[DEC-2026-033](../entscheidungen/DEC-2026-033-beschluss.md), [AP23E3-Abnahme](../fachrecht/abnahme-ap23e3.md) und [Quellenabnahme R09-A2](../fachrecht/abnahme-quellen-mvp09.md) bleiben von Betriebsfreigaben getrennt.

## Daten und Artefakte

Manifest/Mindestconsumer verwenden `9.0.0`, der Verwaltungsverfahrenskatalog `2.0.0`. Alle übrigen Komponentenformate und persönliche Standards Version 5 bleiben erhalten. Der Mirror enthält 42 Dateien mit 2’508’592 Bytes. Der ältere MVP08-Consumer kann Format 9 nicht laden. Ein Paketwechsel ersetzt keine gespeicherte Datenkonfiguration.

[Artefakte und Prüfsummen](releaseartefakte-mvp-09.md), [Dritt-Tenant-Anleitung](installation-und-betrieb-dritttenants.md) und [Publikationspaket](publikationspaket-mvp09.md) binden die tatsächlichen Auslieferungsbytes. Kein Neubau im Publikationsschritt.

## Nachweisgrenzen und Rückfall

T06-H01 betrifft das begrenzte Abschneiden technischer Provider-/Footertexte bei hoher Vergrösserung. B11-H01 betrifft zusätzliche unpräzise Rechenspurtexte bei korrekt gesperrten Fällen ausserhalb der Zeitabdeckung. Beide sind akzeptiert und für einen Folgerelease festgehalten, nicht behoben. Die akzeptierte T07-Zeitpunktabweichung bleibt dokumentiert.

Acht tatsächliche E-/Q-Kalenderdateien sind geprüft. Es fand kein neuer Outlook-Import statt. Die bestätigte Wiederverwendung deckt den unveränderten Terminvertrag, nicht aktuelle Darstellung neuer Herkunftstexte, Erinnerungszustellung oder Kategorienfarbe ab. VoiceOver ist nicht separat nachgewiesen. Der akzeptierte iPad-Magic-Keyboard-Umgebungsbefund bleibt bestehen.

[Recovery `0.9.0.1`](rueckfall-mvp09.md) stellt MVP08-Funktionalität mit den gesicherten Format-8-Mirrors wieder her. Es wurde nicht installiert. Historische AP5-Pins und persönliche Standards bleiben geschützt. Keine Deinstallation oder pauschaler Browserdatenreset. Eine reguläre Wiederaufnahme nach Recovery benötigt einen erneut höheren geprüften Paketstand.

Vor P bleiben frische Sicherung, Bestandsprüfung, HEAD-/GET-/Cachevergleich, konkreter Risikoentscheid, Stage und öffentliche Prüfmatrix erforderlich. Der MVP08-Header-/Cachebefund ist nicht behoben und seine Risikoakzeptanz gilt nicht automatisch für MVP09. Root-Webauftritt, Sitemap und Hostingkonfiguration bleiben unverändert.

