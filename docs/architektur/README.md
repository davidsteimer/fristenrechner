# Architektur

Dieses Verzeichnis dokumentiert stabile technische Verträge, Schnittstellen und Qualitätsgrenzen. Materielle Architekturentscheide werden zusätzlich mit einer DEC-ID im [Entscheidungsregister](../entscheidungen/README.md) geführt.

## Dokumente

- [Datenrelease-Format](datenrelease-format.md): Struktur, Validierung, Providervertrag, Versionierung und Fehlerbehandlung der Regel- und Kalenderdaten
- [Ausführungsplan SPFx-Machbarkeitsspike](spfx-machbarkeitsspike-ap7.md): Minimalprototyp, Testmatrix, Tenantvoraussetzungen, Zeitbox sowie Go- und Stop-Kriterien
- [Testprotokoll SPFx-Machbarkeitsspike](spfx-spike-testprotokoll.md): vollständige Evidenz zu T01 bis T14 und Go-Empfehlung
- [Ergebnisbericht SPFx-Machbarkeitsspike](spfx-spike-ergebnisbericht.md): lokaler Build, realer Tenantlauf, Sicherheitsbefund und Entscheidungsempfehlung
- [AP10 SPFx-Produktintegration](spfx-produktintegration-ap10.md): produktiver Hostadapter, Providergrenzen, lokaler Prüfnachweis, SharePoint-Zwischenstand und ausstehende Tenanttests

AP7 hat den technischen Machbarkeitsspike ausführungsbereit geplant und ist abgenommen. `SPK-SPFX-01` ist technisch abgeschlossen. Alle Prüfungen T01 bis T14 sind bestanden. DEC-2026-013 legt SPFx als gemeinsame Zielarchitektur für SharePoint und Teams fest. AP10 hat daraus einen vollständig gebauten Installationskandidaten mit Rechenkern und MVP-Oberfläche erstellt. Die SharePoint-Prüfungen bestätigten die fachliche Funktion und deckten zwei aufeinanderfolgende CSS-Verpackungsfehler auf. Der lokal nachgewiesene Korrekturkandidat `0.1.0.2` enthält deshalb ein verpflichtendes Audit der finalen Bundle-CSS und muss im Tenant erneut geprüft werden. Die Teams-Prüfung steht aus. Der Teams-Mirror und allfällige Gastzugriffe bleiben bewusst eigenen Folgeprüfungen vorbehalten.
