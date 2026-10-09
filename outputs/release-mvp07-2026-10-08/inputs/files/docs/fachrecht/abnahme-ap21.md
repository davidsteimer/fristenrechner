# AP21 Abnahme der einheitlichen Datumseingabe

Datum: 8. Oktober 2026. Entscheider: David Steimer.

David Steimer hat erklärt:

> AP21 ist abgenommen.

**AP21 ist fachlich-technisch abgenommen und als Arbeitspaket abgeschlossen.** Die Abnahme umfasst die [einheitliche Datumseingabe](../architektur/datumseingabe-ap21.md) und den ausdrücklich als geringfügig akzeptierten [Magic-Keyboard-Umgebungsbefund](../betrieb/ap21-ipad-magic-keyboard-tab-befund.md). Dieser Befund erfordert keine Produktänderung und keinen neuen Paketkandidaten. Die genaue Ursache bleibt offen.

## Abgenommener Stand

Die gemeinsame Komponente bietet direkt bearbeitbare, linksbündige Datumsfelder, die vereinbarten Kurzformen, einen optionalen Kalender und eine Eingabehilfe. Sichtbare Datumsentwürfe werden vor der Berechnung gemeinsam übernommen. Bearbeiten entfernt ein altes Resultat und dessen Exportmöglichkeit unmittelbar. Ungültige Eingaben bleiben sichtbar und dürfen keinen alten Datumswert wiederverwenden. Rechenkern, Rechtsregeln und produktive Datenbindungen werden durch die Datumseingabe nicht erweitert.

Die Nachweise betreffen zwei getrennte Prüfumgebungen:

- Lokale AP21-Integration mit dem unveränderten AP22C3-Referenzbündel. Der gebundene Prüflauf enthält 50 gezielte AP21-Tests und 2'248 Produkttests einschliesslich AP21 sowie weitere Host-, Build- und SPFx-Prüfungen. Die Testgruppen überschneiden sich. Diese historischen Ergebnisse wurden für die Abnahme nicht neu erzeugt.
- Zusätzliches, isoliertes E-Testpaket `0.0.21.2` mit unverändertem MVP-0.6-Mirror gemäss [E04-R2-Nachweis](../betrieb/ap21-e04-r2-vollzug.md). SHA-256 des Pakets: `689310164fd56c5339b93ebf4458621c9772d0d35e281fa2a39469ec1c40f0df`. Es ersetzt nicht das Betriebspaket.

David bestätigt korrekte Darstellung und Hilfetext auf den von ihm geprüften Geräten, funktionierende Übernahme mit Enter sowie funktionierende Tab-Bedienung auf macOS. Auf dem iPad mit Magic Keyboard und Betriebssystem 27.0 reagiert Tab bei ausgeschalteter Tastatursteuerung weder im Datums- noch im Zahlenfeld. Der Kontrollversuch mit nativen HTML-Feldern ausserhalb von SharePoint zeigt dasselbe Verhalten. Die Bildschirmtastatur funktioniert. Bei eingeschalteter Tastatursteuerung funktioniert der Feldwechsel mit zusätzlicher Markierung. Diese Gerätebeobachtungen sind Nutzerbestätigungen, keine durch Codex erhobene vollständige Einzeltestmatrix.

## Gesicherte Abnahmegrundlagen

Vor der Statusnachführung wurden 192 Dateien anhand von SHA-256 und Byteanzahl geprüft und separat [archiviert](../../outputs/ap21-abnahme-2026-10-08/receipt.json). Die Sicherung umfasst den lokalen Implementierungsnachweis, die R2-Paketvorbereitung, den E04-R2-Vollzug und den Gerätebefund einschliesslich der damaligen lebenden Einstiegstexte.

SHA-256 des Abnahmeregisters: `f5cfc02c2f7d9b8f4704619d8d8b1172fafd7ef428a2605fc2c35c2a01de090a`.

Historische Angaben wie «Abnahme offen» oder `accepted: false` bleiben in den ursprünglichen Nachweisen unverändert. Der aktuelle menschliche Abnahmeentscheid steht in dieser Notiz und im separaten Abnahmeregister. Das Archiv enthält interne Prüfunterlagen und hat keine pauschale Publikationsfreigabe.

## Nachweise für die spätere Releaseprüfung

Die AP21-Abnahme wird nicht als nachträgliche Bestätigung jedes Einzelpunkts der ursprünglichen [Geräteprüfliste](../../outputs/ap21-2026-10-08/geraetepruefung.md) ausgegeben. Für die Releaseprüfung bleiben folgende Nachweise getrennt zu führen:

- Direkter Teams-Host einschliesslich iOS-Teams. Die separate E05-Freigabe für die isolierte Testapp wurde weder erteilt noch ausgeführt. Ein entsprechender Nachweis kann im gesondert freizugebenden Releaseprozess erfolgen.
- VoiceOver, 200 Prozent Zoom und die detaillierten weiteren Datumsrollen auf den realen Zielgeräten, soweit noch kein entsprechender Nachweis vorliegt.
- Exportinvalidierung im endgültigen Releasebuild mit aktiviertem Kalenderexport. Im isolierten E-Kandidaten ist der Export grundsätzlich gesperrt.

Diese Nachweisgrenzen bleiben sichtbar, ohne die ausdrücklich erklärte AP21-Abnahme in eine Teilabnahme umzudeuten. Die akzeptierte Magic-Keyboard-Einschränkung bleibt davon getrennt. Eine Aktivierung der systemweiten Tastatursteuerung wird nicht zur Nutzungsvoraussetzung.

## Grenzen und nächster Schritt

AP22 und AP21 sind damit als Umsetzungspakete für [MVP 0.7](../planung/release-mvp07.md) abgenommen. Nächster vorgesehener Schritt ist die gemeinsame Releasevorbereitung mit Quellenprüfung, gebundener Datenübernahme, definitiven Artefakten und konkreter Prüfplanung.

Diese Abnahme startet keine Datenpromotion oder Bereitstellung und enthält keine neue Quellenrelease-, GitHub-, E05-, E-/Q-/P- oder Bereinigungsfreigabe. Betriebspaket, bestehende Produktinstanzen, Mirrors, historische AP5-Ansicht und Berechtigungen bleiben unverändert. Die zusätzlichen E-Testapps und Katalogeinträge werden nicht entfernt. GitHub-Issue 45 und das GitHub-Projekt wurden in diesem Schritt nicht geändert.

David Steimer nimmt Fachverantwortung und Abnahme in Personalunion wahr. Codex dokumentiert als KI-Arbeitsinstrument ohne formelle Freigabe- oder Haftungsverantwortung.
