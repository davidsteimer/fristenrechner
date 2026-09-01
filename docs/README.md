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

Der [AP12B-Nachweis](architektur/ewiger-kalender-ap12b.md) dokumentiert den abgenommenen hostneutralen TypeScript-Generator. Der [AP12C-Nachweis](architektur/ewiger-kalender-ap12c.md) beschreibt dessen abgenommene Integration in Manifestformat 3.0.0, Rechenkern, Oberfläche und SPFx-Consumer. Der daraus abgeleitete [MVP-0.3-Datenrelease](../data/releases/2026-08-31-mvp-03-approved.1/README.md) ist fachlich und technisch freigegeben. Release `v0.3.0`, das Paket `0.3.0.0` und die Prüfmatrix T01 bis T19 sind abgeschlossen.

Der [Vertrag zu Issue #18](architektur/outlook-kalendereintrag-issue-18.md) dokumentiert die abgenommene Outlook-kompatible Kalenderdatei, ihre Platzierung in der Resultatkachel, den 112-Stunden-Trigger sowie die Datenschutz- und Berechtigungsgrenzen.

Die zweisprachigen Interaktionsverträge liegen unter [`ux/`](ux/README.md). AP11A enthält dort die progressive Eingabe, Ergebnisdarstellung und Meldungen für unterstützte, offene und gesperrte Spezialregime.

Für die Beurteilung und Freischaltung in anderen Microsoft-365-Tenants stehen eine [technische Kurzdokumentation](architektur/technische-kurzdokumentation.md) sowie die [Voraussetzungen für Installation und Betrieb](betrieb/installation-und-betrieb-dritttenants.md) mit einer konkreten SharePoint-Mirror-Anleitung zur Verfügung. Die [AP11C-Deploymentanleitung](betrieb/deployment-mvp-02-ap11c.md) dokumentiert den Rückfallstand. Die [Release-2-Anleitung](betrieb/deployment-release-2-mvp-03.md) enthält Paketidentität, Format-3-Mirror, erweiterte SharePoint-, Teams- und Outlook-Matrix sowie Rollback.

Der [AP13-Betriebsnachweis](betrieb/periodische-quellenpruefung-ap13.md) definiert die periodische Quellenprüfung, die vier Ergebnisse, die Rollen in Personalunion und die Trennung von Prüfung und Datenrelease. Die [generische Release-Checkliste](betrieb/release-checkliste.md) verankert den Termin 15. November, die Folgemassnahmen und die Spiegelung des Governance-Nachweises.

Der [AP14-Ausführungsplan](betrieb/gastzugriff-demobetrieb-ap14.md) und das [zugehörige Testprotokoll](betrieb/gastzugriff-ap14-testprotokoll.md) dokumentieren den abgeschlossenen technischen Nachweis für authentifizierte B2B-Gäste. Die App funktionierte in SharePoint und Teams. Die nach ursprünglicher Matrix nicht bestandenen G13 und G17 werden nicht rückwirkend umgewertet. Das präzisierte Zielbild verlangt künftig jedoch einen Nachweis des durch Q erzeugten Berechtigungsdeltas statt ein im ganzen Tenant unbelastetes Gastkonto. Sämtliche AP14-spezifischen Rechte wurden zurückgenommen und aus AP14 wird keine Betriebsfreigabe abgeleitet.

Der abgeschlossene [AP15-Ausführungsplan](betrieb/e-q-p-zielarchitektur-ap15.md) legt die E/Q/P-Landschaft, das gruppenbasierte Q-Berechtigungsmodell und die verbindliche Beschränkung einer späteren öffentlichen Produktion auf das bestehende steimer.ch-Hosting fest. Das [AP15-Testprotokoll](betrieb/e-q-p-testprotokoll-ap15.md) weist Q01 bis Q12 vollständig als bestanden aus. Aufnahme, Update, Widerruf und Wiederaufnahme stehen in der [Betriebsanweisung](betrieb/q-demobetrieb-ap15-betriebsanweisung.md). Mit [DEC-2026-016](entscheidungen/DEC-2026-016-gruppenbasierter-q-demobetrieb.md) ist der begrenzte Q-Demobetrieb für vollständig freigegebene Releases freigegeben. Die öffentliche P-Ausprägung bleibt ausdrücklich nicht freigegeben.

AP16 hat einen rein statischen [P-Releasekandidaten und Ausführungsplan](betrieb/oeffentliche-p-auspraegung-ap16.md) für den Unterpfad `/fristenrechner/` auf der bestehenden steimer.ch-Hosting-Infrastruktur erstellt. Der [Prüfnachweis P01 bis P15](betrieb/oeffentliche-p-auspraegung-ap16-nachweis.md) dokumentiert den reproduzierbaren Build, lokale Laufzeitassets, Zweisprachigkeit, Regression, Sicherheitsheader und mobile Browserprüfung. Die [Deployment- und Rückfallanleitung](betrieb/deployment-oeffentliche-p-auspraegung-ap16.md) ist vorbereitet. [DEC-2026-017](entscheidungen/DEC-2026-017-statische-p-auspraegung-steimer-ch.md) bleibt vorgeschlagen. Es wurde nichts öffentlich bereitgestellt.

Freigegebene Managementgrundlagen bleiben zusätzlich als Word- und PDF-Dateien unter `outputs/` erhalten.

Das [Entscheidungsregister](entscheidungen/README.md) enthält die einzeln versionierten Grundsatzentscheide. Beschlossene Datensätze werden nicht stillschweigend umgeschrieben. Eine Ablösung erfolgt mit neuer DEC-ID und gegenseitigen Verweisen.
