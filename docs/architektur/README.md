# Architektur

Dieses Verzeichnis dokumentiert stabile technische Verträge, Schnittstellen und Qualitätsgrenzen. Materielle Architekturentscheide werden zusätzlich mit einer DEC-ID im [Entscheidungsregister](../entscheidungen/README.md) geführt.

## Dokumente

- [Datenrelease-Format](datenrelease-format.md): Struktur, Validierung, Providervertrag, Versionierung und Fehlerbehandlung der Regel- und Kalenderdaten
- [Komponentenmodell für VRPG-Spezialregime](vrpg-spezialregime-datenmodell.md): typisierte Rechenarten, Fristwahrung, Gates, Sperren und sichere Formatevolution
- [Ausführungsplan SPFx-Machbarkeitsspike](spfx-machbarkeitsspike-ap7.md): Minimalprototyp, Testmatrix, Tenantvoraussetzungen, Zeitbox sowie Go- und Stop-Kriterien
- [Testprotokoll SPFx-Machbarkeitsspike](spfx-spike-testprotokoll.md): vollständige Evidenz zu T01 bis T14 und Go-Empfehlung
- [Ergebnisbericht SPFx-Machbarkeitsspike](spfx-spike-ergebnisbericht.md): lokaler Build, realer Tenantlauf, Sicherheitsbefund und Entscheidungsempfehlung
- [AP10 SPFx-Produktintegration](spfx-produktintegration-ap10.md): produktiver Hostadapter, Providergrenzen, lokaler Prüfnachweis sowie bestandene SharePoint- und direkte Teams-Tenantprüfung
- [Technische Kurzdokumentation](technische-kurzdokumentation.md): Tenantportabilität, Lösungsarchitektur, Toolchain, Paketidentität, Datenflüsse und Sicherheitsmodell

AP7 hat den technischen Machbarkeitsspike ausführungsbereit geplant und ist abgenommen. `SPK-SPFX-01` ist technisch abgeschlossen. Alle Prüfungen T01 bis T14 sind bestanden. DEC-2026-013 legt SPFx als gemeinsame Zielarchitektur für SharePoint und Teams fest. AP10 hat daraus einen vollständig gebauten Installationskandidaten mit Rechenkern und MVP-Oberfläche erstellt. Die SharePoint-Prüfungen bestätigten die fachliche Funktion und deckten zwei aufeinanderfolgende CSS-Verpackungsfehler auf. Der korrigierte Kandidat `0.1.0.2` enthält deshalb ein verpflichtendes Audit der finalen Bundle-CSS. Die SharePoint-Wiederholungsprüfung T03 bis T08 und die direkte Teams-Prüfung T09 bis T12 sind bestanden. Die direkte Teams-App ist publiziert, dem Testteam zugeordnet und als Registerkarte im bezeichneten Kanal installiert. Der Teams-Mirror und allfällige Gastzugriffe bleiben bewusst eigenen Folgeprüfungen vorbehalten.

AP11A verändert diese Zielarchitektur nicht. Der neue Spezialregime-Katalog bleibt providerneutral und wird erst nach fachlicher Abnahme sowie einem neuen versionierten Datenrelease in SPFx integriert.
