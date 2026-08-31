# Projektdokumentation

Die lebende Dokumentation wird als Markdown im Repository geführt. Sie umfasst insbesondere:

- Architektur und technische Nachweise
- Fachpflege und Quellenregister
- Deployment und Betrieb
- Release- und Datenpflege
- Sicherheits- und Datenschutzkonzept
- materielle Entscheide unter `entscheidungen/`

Die fachrechtliche Grundlage für den MVP liegt unter [`fachrecht/`](fachrecht/README.md). Sie enthält die quellenbasierte Rechtsmatrix für StPO, ZPO, BGG, VwVG und VRPG Bern, das Quellenregister, die offenen Fachfragen und den verlinkten AP6-Golden-Case-Korpus. AP11A ergänzt die fachlich abgenommenen [bekannten VRPG-Spezialregime](fachrecht/vrpg-be-spezialregime-ap11a.md). AP11B hat sie in den abgenommenen [Format-2-Referenzrelease](../data/releases/2026-08-30-ap11b-approved.1/README.md) migriert, ohne den AP5- und AP6-Bestand zu verändern.

Die technischen Verträge liegen unter [`architektur/`](architektur/README.md). Das [Datenrelease-Format](architektur/datenrelease-format.md) beschreibt Schemata, Providerunabhängigkeit, Validierung, Prüfsummen und Rückwärtskompatibilität. Das [AP11A/AP11B-Komponentenmodell](architektur/vrpg-spezialregime-datenmodell.md) beschreibt Fachmodell, Formatevolution, Rechenkern und Nachweise für Spezialregime. Der [AP11C-Nachweis](architektur/mvp-02-spezialregime-ap11c.md) dokumentiert die abgenommene Integration in Oberfläche und SPFx sowie den freigegebenen MVP-0.2-Datenrelease. Der [AP7-Ausführungsplan](architektur/spfx-machbarkeitsspike-ap7.md) grenzt den SPFx-Spike für SharePoint und Teams auf 4,5 Nettoarbeitstage ein. Der [Ergebnisbericht](architektur/spfx-spike-ergebnisbericht.md) und das [Testprotokoll](architektur/spfx-spike-testprotokoll.md) dokumentieren die vollständig bestandenen lokalen und tenantbezogenen Spike-Prüfungen. Der [AP10-Nachweis](architektur/spfx-produktintegration-ap10.md) beschreibt den korrigierten SPFx-Installationskandidaten sowie die bestandene SharePoint- und direkte Teams-Tenantprüfung.

Die zweisprachigen Interaktionsverträge liegen unter [`ux/`](ux/README.md). AP11A enthält dort die progressive Eingabe, Ergebnisdarstellung und Meldungen für unterstützte, offene und gesperrte Spezialregime.

Für die Beurteilung und Freischaltung in anderen Microsoft-365-Tenants stehen eine [technische Kurzdokumentation](architektur/technische-kurzdokumentation.md) sowie die [Voraussetzungen für Installation und Betrieb](betrieb/installation-und-betrieb-dritttenants.md) mit einer konkreten SharePoint-Mirror-Anleitung zur Verfügung. Die [AP11C-Deploymentanleitung](betrieb/deployment-mvp-02-ap11c.md) ergänzt Update, Format-2-Mirror, Tenanttests und Rollback für MVP 0.2.

Freigegebene Managementgrundlagen bleiben zusätzlich als Word- und PDF-Dateien unter `outputs/` erhalten.

Das [Entscheidungsregister](entscheidungen/README.md) enthält die einzeln versionierten Grundsatzentscheide. Beschlossene Datensätze werden nicht stillschweigend umgeschrieben. Eine Ablösung erfolgt mit neuer DEC-ID und gegenseitigen Verweisen.
