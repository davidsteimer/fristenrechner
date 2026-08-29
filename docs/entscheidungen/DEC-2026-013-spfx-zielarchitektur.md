---
id: DEC-2026-013
titel: "SPFx als gemeinsame Zielarchitektur für SharePoint und Teams"
status: beschlossen
vorgeschlagen_am: 2026-08-29
entscheidungsdatum: 2026-08-29
klasse: B
entschieden_durch: "David Steimer"
quelle:
  - "SPK-SPFX-01, GitHub-Issue #16"
  - "AP7-Ausführungsplan"
  - "DEC-2026-003"
  - "DEC-2026-012"
ersetzt: []
ersetzt_durch: null
---

# DEC-2026-013: SPFx als gemeinsame Zielarchitektur für SharePoint und Teams

## Ausgangslage

Der Fristenrechner soll vollständig webbasiert, adminarm und mit einer gemeinsamen Codebasis in SharePoint Online und Microsoft Teams betrieben werden. Der Pilot bezieht den freigegebenen Datenrelease aus GitHub. Der spätere Zielbetrieb benötigt einen byteidentischen SharePoint-Mirror. Provider, Validierung, Persistenz und der spätere Rechenkern dürfen nicht an einen einzelnen Host gekoppelt werden.

AP7 hat deshalb einen auf 4,5 Nettoarbeitstage begrenzten Machbarkeitsspike festgelegt. `SPK-SPFX-01` wurde am 29. August 2026 im steimer.ch-Testtenant abgeschlossen. Alle Prüfungen T01 bis T14 sind bestanden. Dasselbe Paket läuft in SharePoint Online und Microsoft Teams. Der GitHub-Provider und ein byteidentischer SharePoint-Mirror aktivieren denselben vollständig validierten AP5-Datenrelease.

## Geprüfte Optionen

1. **Ein SPFx-WebPart mit gemeinsamen Komponenten und dünnen Hostadaptern**
   - Vorteil: eine Codebasis, ein `.sppkg`, gemeinsame Provider und dieselbe Component-ID in SharePoint und Teams.
   - Vorteil: authentifizierter SharePoint-Abruf mit `SPHttpClient` ohne Graph-Zusatzberechtigung.
   - Nachteil: App-Katalog und Teams-Freigabe benötigen einmalige administrative Vorbereitung.
2. **Getrennte SharePoint- und Teams-Anwendungen**
   - Vorteil: jeder Host kann unabhängig optimiert werden.
   - Nachteil: doppelte Paketierung, höheres Drift- und Testaufkommen sowie unnötige Gefahr zweier Produktcodebasen.
3. **Statische Web-App ausserhalb von SPFx**
   - Vorteil: einfache Webtechnologie und unabhängiges Hosting.
   - Nachteil: zusätzliche Hosting-, Authentifizierungs- und Einbettungsfragen sowie schwächere M365-Integration.
4. **Power Apps**
   - Vorteil: tiefe M365-Integration und rasche Formularentwicklung.
   - Nachteil: Lizenz- und Tenantabhängigkeit, erschwerte Open-Source-Verteilung und ungeeignete Kontrolle über deterministische Fachlogik und Datenreleasevalidierung.

## Entscheid

Gestützt auf den abgeschlossenen Tenant-Spike wird Option 1 beschlossen:

- Der Fristenrechner wird als einzelnes SPFx-WebPart für `SharePointWebPart` und `TeamsTab` umgesetzt.
- UI-Komponenten, Datenprovider, Releasevalidierung, persistenter Aktivstand und späterer Rechenkern bleiben hostneutral.
- Hostspezifischer Code bleibt auf Kontext- und Transportadapter begrenzt.
- Der GitHub-Provider bleibt für den Pilot zulässig.
- Der SharePoint-Mirrorprovider verwendet `SPHttpClient` und normale Benutzerleserechte.
- Ein Release wird erst nach vollständiger Schema-, Referenz-, Abdeckungs-, Grössen- und SHA-256-Prüfung atomar in IndexedDB aktiviert.
- Der letzte vollständig validierte Stand dient als lokaler Fallback.
- Das Paket beantragt keine Microsoft-Graph- oder weitere Web-API-Berechtigung.
- Ein Tenant-App-Katalog und die lokale Installation auf jeder verwendeten SharePoint-Website sind verbindliche Bereitstellungsvoraussetzungen.
- Für eine Teams-Registerkarte wird die App zusätzlich auf der zum Team gehörenden SharePoint-Website installiert.

David Steimer hat den Entscheid am 29. August 2026 nach Prüfung der Spike-Ergebnisse und Klärung der nachfolgenden Abgrenzungen bestätigt.

### Bestätigte Abgrenzungen

- Der SharePoint-Mirror war in der konkreten Teams-Registerkarte des Spikes absichtlich nicht konfiguriert. Eine neue WebPart-Instanz übernimmt keine Eigenschaften der SharePoint-Testseite. Der Standardwert des Mirrorpfads ist bewusst leer.
- Diese Konfiguration ist keine architektonische Sperre. Der Mirrorprovider gehört zum gemeinsamen WebPart. Für einen Mirrorbetrieb in Teams wird der Release entweder auf der zum Team gehörenden SharePoint-Website bereitgestellt oder der Provider vor der produktiven Nutzung für einen ausdrücklich getesteten, tenantinternen Cross-Site-Abruf erweitert.
- Externe und Gastzugriffe wurden im Spike absichtlich nicht freigegeben. AP7 prüfte den Betrieb mit einem authentifizierten internen Testkonto und normalen Leserechten, nicht ein Extranet- oder Gastbetriebsszenario.
- Gastzugriffe bleiben gesperrt, bis Berechtigungsmodell, Datenfreigabe, Teams-App-Richtlinie und Verhalten des SharePoint-Mirrors in einem eigenen Sicherheits- und Betriebstest geprüft und freigegeben sind.

## Begründung

Der Spike weist nach, dass der gemeinsame technische Kern mit der festgelegten Toolchain gebaut, paketiert und im Tenant betrieben werden kann. Ein einziges Manifest nennt dieselbe Component-ID für SharePoint und Teams. Die Provider liefern dasselbe Format. Die Validierung und IndexedDB-Aktivierung kennen den Host nicht.

Die reale Laufzeitprüfung bestätigt CORS für den gepinnten GitHub-Abruf, normale Benutzerleserechte für den SharePoint-Mirror, die Funktionsfähigkeit des Tenant-App-Katalogs und die Zulässigkeit der App in Teams. Zusätzliche Graph- oder Entra-API-Berechtigungen waren nicht nötig. Die Architektur erfüllt damit die strukturellen und betrieblichen Anforderungen des MVP.

## Folgen

### Auswirkungen

- Der dauerhafte Produktcode kann aus dem Spike in die reguläre `src/`-Struktur überführt werden.
- SharePoint und Teams verwenden dasselbe `.sppkg` und dieselbe Component-ID.
- Die erstmalige Bereitstellung bleibt adminarm, aber nicht adminfrei.
- Tenant-, Site- und Mirrorpfade bleiben konfigurierbar.
- Der spätere Rechenkern erhält ausschliesslich vollständig validierte, providerneutrale Datenobjekte.

### Risiken und Grenzen

- Der Tenant-App-Katalog und lokale Site-Installationen benötigen administrative Mitwirkung. Die Lösung ist adminarm, aber nicht adminfrei.
- GitHub kann durch CORS, Tenantnetzwerk oder Sicherheitsrichtlinien blockiert sein.
- IndexedDB kann durch Browser- oder Tenantvorgaben eingeschränkt werden.
- Tenant- und Browserbedingungen können in anderen Zielumgebungen abweichen. Die Übertragbarkeit wird deshalb bei jedem Rollout geprüft.
- Ein nicht konfigurierter Mirrorpfad macht den SharePoint-Mirror in der betreffenden WebPart-Instanz absichtlich unverfügbar.
- Gastzugriffe sind weder nachgewiesen noch freigegeben und dürfen nicht aus dem erfolgreichen internen Tenanttest abgeleitet werden.
- Neun moderate Auditbefunde in der Buildtoolchain bleiben bis zu einem kompatiblen Microsoft-Update beobachtet. Die produktiven Abhängigkeiten melden null bekannte Schwachstellen.

### Folgearbeiten und Rückabwicklung

- Bei blockiertem GitHub-Abruf wird der SharePoint-Mirror bereits im Pilot primärer Provider.
- Der Tenant-App-Katalog und die lokale Installation auf der Zielsite werden in der Deploymentanleitung als Voraussetzungen dokumentiert.
- Der produktive Teams-Mirrorpfad wird erst nach Festlegung des tenantinternen Mirrorstandorts konfiguriert und in Teams separat geprüft.
- Ein allfälliger Gastbetrieb erhält vor seiner Aktivierung ein eigenes Arbeitspaket mit Sicherheits-, Berechtigungs- und Laufzeittests.
- Falls dasselbe WebPart nicht stabil in beiden Hosts läuft, wird Option 3 bewertet. Zwei vollständige Produktcodebasen werden nicht eingeführt.
- Eine Ablösung erfolgt mit einer neuen DEC-ID und gegenseitigen Verweisen in `ersetzt` und `ersetzt_durch`.

## Nachweise

- [SPK-SPFX-01](https://github.com/davidsteimer/fristenrechner/issues/16)
- [AP7-Ausführungsplan](../architektur/spfx-machbarkeitsspike-ap7.md)
- [Testprotokoll](../architektur/spfx-spike-testprotokoll.md)
- [Ergebnisbericht](../architektur/spfx-spike-ergebnisbericht.md)
- [Tenant-Laufnachweis](../../spike/spfx/evidence/tenant-run.md)
- [Minimalprototyp](../../spike/spfx/README.md)
- [DEC-2026-003](DEC-2026-003-github-feed-und-sharepoint-mirror.md)
- [DEC-2026-012](DEC-2026-012-providerneutrales-datenrelease-format.md)

## Verantwortlichkeit

Der Entscheid wurde mit Codex auf Basis der vollständigen Spike-Evidenz vorbereitet und von David Steimer bestätigt. Codex übernimmt keine formelle Freigabe- oder Haftungsverantwortung.
