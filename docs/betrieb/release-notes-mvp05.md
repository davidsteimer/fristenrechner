# MVP 0.5 · Releasehinweise

28. September 2026. **Intern in E/Q installiert und geprüft, Q fachlich abgenommen. Lokal zur Publikation vorbereitet, noch nicht auf GitHub oder steimer.ch veröffentlicht.**

## Neu im Rechner

- Ergänzungsleistungen (ELG), Arbeitslosenentschädigung (AVIG-ALE) und individuelle Krankenversicherungsleistungen (KVG-OKP) im ausdrücklich modellierten Umfang.
- Bestehende IVG-/AHVG-/UVG-Pfade in den gemeinsamen Sozialverfahrenskatalog überführt. Insgesamt 24 nationale Regeln und 28 konkret freigegebene Berner Anbindungen.
- Bundesregel, kantonale Anbindung und Produktfreigabe getrennt modelliert. Das erleichtert spätere Kantonsanbindungen, ist aber keine gesamtschweizerische Produktfreigabe.
- Reduzierte zweisprachige Oberfläche mit früher Datumseingabe. Zusätzliche Modellinformationen erscheinen in der Rechenspur, redundante Dokumentauswahlen entfallen. Unvollständige oder nicht unterstützte Konstellationen bleiben ohne Fristresultat.

## Für Installation und Betrieb

Anwendung `0.5.0`, SPFx-Paket `0.5.0.0`, Datenrelease `2026-09-28-mvp-05-approved.1`. Manifest- und Mindestconsumerformat `5.0.0`, Sozialverfahrenskatalog `1.0.0`. Der aktuelle Consumer unterstützt weiterhin die alten Formate 1 bis 4.

Der vollständige SharePoint-Mirror umfasst jetzt **elf Dateien**. Die zusätzliche Komponente ist `social-procedures/ch-social-procedures.json`. Ein alter Format-4-Consumer darf nicht auf einen Format-5-Release umgestellt werden. Keine neuen API-Berechtigungen erforderlich.

Die drei definitiven [Releaseartefakte](../../outputs/release-mvp05-2026-09-28/artifacts/) bleiben byteidentisch zu den geprüften Ausgaben. Insbesondere liegt das aktuelle SPPKG im bezeichneten Releaseordner. Der ältere Standardpfad unter `spfx/sharepoint/solution/` enthält weiterhin das historische Paket `0.4.0.1`.

Der neue GitHub-Datenpin ist noch nicht veröffentlicht. Die vier bestehenden E-/Q-Instanzen verwenden deshalb ausdrücklich vollständige same-site Mirrors. Die Dritt-Tenant-Anleitung beschreibt die technischen Voraussetzungen, nicht einen schon erfolgten Installationstest auf einem fremden Tenant.

## Nachweise und Grenzen

- 123 technische Prüfpunkte auf den vier aktuellen E-/Q-Hosts und zur historischen AP5-Kompatibilität bestanden.
- Q fachlich abgenommen und reale Anmeldung mit bestehendem B2B-Gast durch David bestätigt.
- Kalenderdateien auf allen vier Hosts geprüft. Outlook Web tatsächlich importiert, Eigenschaften kontrolliert und Testtermin wieder gelöscht. Outlook Desktop durch David manuell geprüft bestätigt.
- Deutsch und Französisch bleiben die einzigen Oberflächensprachen. Keine Freigabe weiterer Kantone, keine Kalender-App und keine pauschale ATSG-/KVG-Abdeckung.
- Die abgenommenen rechtlichen Zeit- und Quellenintervalle sowie die bisherigen Feiertags- und AI-Vorbehalte bleiben erhalten.
- Der bekannte Hostingbefund bleibt offen. Die öffentliche P-Ausprägung wird durch diesen Abschluss nicht umgeschaltet.

Verbindliche Einzelheiten: [Publikationspaket](publikationspaket-mvp05.md), [E-/Q-Prüfung](eq-installation-mvp05.md), [Q-Abnahme](abnahme-q-mvp05.md), [Outlook-Prüfung](outlook-pruefung-mvp05.md) und [Dritt-Tenant-Anleitung](installation-und-betrieb-dritttenants.md).
