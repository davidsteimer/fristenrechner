# AP10-Deployment in SharePoint und Microsoft Teams

## Zweck und Geltungsbereich

Diese Anleitung beschreibt die Installation des lokalen AP10-Kandidaten `0.1.0.0` im nicht produktiven steimer.ch-Testtenant. Sie erteilt keine produktive Freigabe und keine Gastfreigabe.

## Paketidentität

| Merkmal | Wert |
| --- | --- |
| Datei | `spfx/sharepoint/solution/fristenrechner-schweiz.sppkg` |
| Solution-ID | `13090feb-a6bf-40fa-9d3c-ec8d90516a60` |
| Component-ID | `596c7f1c-4d3e-4da8-a7be-27a96024f37c` |
| Version | `0.1.0.0` |
| SHA-256 | `6ad0ffb70101553d9457e165b7610374f401077e516a69d02b30ff28182732a5` |

Die Prüfsumme ist unmittelbar vor dem Upload erneut zu vergleichen.

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

1. Paket in den bestehenden App-Katalog hochladen.
2. Paketdetails, Version und Solution-ID kontrollieren.
3. Paket aktivieren, ohne eine API-Zustimmung zu erteilen.
4. App auf der dedizierten Testsite installieren.
5. Moderne Testseite öffnen oder anlegen.
6. WebPart `Fristenrechner Schweiz` hinzufügen.
7. Standardprovider `Öffentlicher GitHub-Release` belassen.
8. Seite veröffentlichen und neu laden.
9. AP10-Tenantprüfungen T03 bis T08 protokollieren.

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
