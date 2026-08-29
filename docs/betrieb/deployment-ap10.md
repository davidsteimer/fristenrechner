# AP10-Deployment in SharePoint und Microsoft Teams

## Zweck und Geltungsbereich

Diese Anleitung beschreibt die Installation des korrigierten AP10-Kandidaten `0.1.0.2` im nicht produktiven steimer.ch-Testtenant. Sie erteilt keine produktive Freigabe und keine Gastfreigabe.

Die Kandidaten `0.1.0.0` und `0.1.0.1` sind abgelöst. `0.1.0.0` lokalisierte die Produkt-CSS-Klassen, während die React-Komponente unveränderte Klassennamen ausgab. `0.1.0.1` wurde am 29. August 2026 im Tenant-App-Katalog aktiviert und auf der dedizierten Testsite aktualisiert. Diese Fassung lud das neue Bundle und den korrekten Datenrelease, liess den Sass-Marker `:global` aber wörtlich im ausgelieferten CSS stehen. Vor den weiteren Prüfungen ist deshalb zwingend auf `0.1.0.2` zu aktualisieren.

## Paketidentität

| Merkmal | Wert |
| --- | --- |
| Datei | `spfx/sharepoint/solution/fristenrechner-schweiz.sppkg` |
| Solution-ID | `13090feb-a6bf-40fa-9d3c-ec8d90516a60` |
| Component-ID | `596c7f1c-4d3e-4da8-a7be-27a96024f37c` |
| Version | `0.1.0.2` |
| Dateigrösse | 152'144 Bytes |
| SHA-256 | `29cafe3a648e5302edec960ef1bace7905e054cf2e8f4015cba82460b226eff0` |

Der Installationskandidat wurde mit Node.js `22.23.2` gebaut. Die Prüfsumme ist unmittelbar vor dem Upload erneut zu vergleichen.

## Voraussetzungen

- bestehender Tenant-App-Katalog
- berechtigtes Installationskonto
- dedizierte Fristenrechner-Testsite
- lokale App-Installation auf der Testsite
- für Teams zusätzlich lokale App-Installation auf der dem Team zugeordneten SharePoint-Website
- Teams-Richtlinie, welche die benutzerdefinierte App zulässt
- HTTPS-Zugriff auf den gepinnten GitHub-Release

Das Paket verlangt keine Microsoft-Graph- oder weitere Web-API-Zustimmung.

## SharePoint

1. Paket im bestehenden App-Katalog hochladen und die installierte Fassung `0.1.0.1` ersetzen.
2. Paketdetails, Version und Solution-ID kontrollieren.
3. Paket aktivieren, ohne eine API-Zustimmung zu erteilen.
4. App auf der dedizierten Testsite aktualisieren.
5. Moderne Testseite öffnen oder anlegen.
6. WebPart `Fristenrechner Schweiz` hinzufügen.
7. Standardprovider `Öffentlicher GitHub-Release` belassen.
8. Seite veröffentlichen und neu laden.
9. AP10-Tenantprüfungen T03 bis T08 wiederholen und protokollieren.

## Microsoft Teams

1. App auf der SharePoint-Website des bezeichneten Teams installieren.
2. Im Kanal `Fristenrechner` eine neue Registerkarte hinzufügen.
3. `Fristenrechner Schweiz` auswählen.
4. Standardprovider `Öffentlicher GitHub-Release` belassen.
5. Registerkarte speichern.
6. Automatischen Kanalbeitrag nur aktivieren, wenn er ausdrücklich gewünscht ist.
7. AP10-Tenantprüfungen T09 bis T12 protokollieren.

## SharePoint-Mirror

Der Mirror ist im AP10-Paket implementiert, aber standardmässig nicht aktiv. Wird er später getestet, müssen `manifest.json` und alle Manifestartefakte byteidentisch in einem Ordner auf derselben SharePoint-Website liegen. In der WebPart-Konfiguration werden danach der Provider `SharePoint-Mirror` und der serverrelative Ordnerpfad gewählt.

Ein Cross-Site-Mirror, eine tenantfremde Adresse und Pfade mit relativen Segmenten werden abgewiesen. Für Teams ist ein eigener Mirror auf der Teamwebsite nötig, solange kein separat geprüfter Cross-Site-Provider beschlossen wird.

## Rückbau

Die Teams-Registerkarte und das WebPart können zuerst entfernt werden. Danach wird die App von den Testsites deinstalliert und das Paket im App-Katalog deaktiviert oder entfernt. Der Rückbau löscht keine Fachdaten im öffentlichen Repository.
