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

Das [abgenommene AP12A-Zielmodell](architektur/ewiger-kalender-ap12a.md) beschreibt den noch nicht produktiven Übergang von endlichen Datumslisten zu versionierten Feiertags- und Stillstandsregeln. Der zugehörige Entscheid [DEC-2026-015](entscheidungen/DEC-2026-015-regelbasierte-kalenderkomponente.md) ist beschlossen.

Der [AP12B-Nachweis](architektur/ewiger-kalender-ap12b.md) dokumentiert den abgenommenen hostneutralen TypeScript-Generator. Der [AP12C-Nachweis](architektur/ewiger-kalender-ap12c.md) beschreibt dessen abgenommene Integration in Manifestformat 3.0.0, Rechenkern, Oberfläche und SPFx-Consumer. Der daraus abgeleitete [MVP-0.3-Datenrelease](../data/releases/2026-08-31-mvp-03-approved.1/README.md) ist fachlich und technisch freigegeben. Die Aktivierung in SharePoint und Teams bleibt der Release-2-Testmatrix vorbehalten.

Der [Vertrag zu Issue #18](architektur/outlook-kalendereintrag-issue-18.md) dokumentiert die abgenommene Outlook-kompatible Kalenderdatei, ihre Platzierung in der Resultatkachel, den 112-Stunden-Trigger sowie die Datenschutz- und Berechtigungsgrenzen.

Die zweisprachigen Interaktionsverträge liegen unter [`ux/`](ux/README.md). AP11A enthält dort die progressive Eingabe, Ergebnisdarstellung und Meldungen für unterstützte, offene und gesperrte Spezialregime.

Für die Beurteilung und Freischaltung in anderen Microsoft-365-Tenants stehen eine [technische Kurzdokumentation](architektur/technische-kurzdokumentation.md) sowie die [Voraussetzungen für Installation und Betrieb](betrieb/installation-und-betrieb-dritttenants.md) mit einer konkreten SharePoint-Mirror-Anleitung zur Verfügung. Die [AP11C-Deploymentanleitung](betrieb/deployment-mvp-02-ap11c.md) ergänzt Update, Format-2-Mirror, Tenanttests und Rollback für MVP 0.2.

Der [AP13-Betriebsnachweis](betrieb/periodische-quellenpruefung-ap13.md) definiert die periodische Quellenprüfung, die vier Ergebnisse, die Rollen in Personalunion und die Trennung von Prüfung und Datenrelease. Die [generische Release-Checkliste](betrieb/release-checkliste.md) verankert den Termin 15. November, die Folgemassnahmen und die Spiegelung des Governance-Nachweises.

Freigegebene Managementgrundlagen bleiben zusätzlich als Word- und PDF-Dateien unter `outputs/` erhalten.

Das [Entscheidungsregister](entscheidungen/README.md) enthält die einzeln versionierten Grundsatzentscheide. Beschlossene Datensätze werden nicht stillschweigend umgeschrieben. Eine Ablösung erfolgt mit neuer DEC-ID und gegenseitigen Verweisen.
