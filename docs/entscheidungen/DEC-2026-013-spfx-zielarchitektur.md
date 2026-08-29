---
id: DEC-2026-013
titel: "SPFx als gemeinsame Zielarchitektur für SharePoint und Teams"
status: vorgeschlagen
vorgeschlagen_am: 2026-08-29
entscheidungsdatum: null
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

AP7 hat deshalb einen auf 4,5 Nettoarbeitstage begrenzten Machbarkeitsspike festgelegt. Die lokalen Prüfungen von `SPK-SPFX-01` sind bestanden. Die Tenantprüfungen in SharePoint und Teams stehen noch aus.

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

## Vorgeschlagener Entscheid

Vorbehaltlich der noch offenen Tenantprüfungen wird Option 1 vorgeschlagen:

- Der Fristenrechner wird als einzelnes SPFx-WebPart für `SharePointWebPart` und `TeamsTab` umgesetzt.
- UI-Komponenten, Datenprovider, Releasevalidierung, persistenter Aktivstand und späterer Rechenkern bleiben hostneutral.
- Hostspezifischer Code bleibt auf Kontext- und Transportadapter begrenzt.
- Der GitHub-Provider bleibt für den Pilot zulässig.
- Der SharePoint-Mirrorprovider verwendet `SPHttpClient` und normale Benutzerleserechte.
- Ein Release wird erst nach vollständiger Schema-, Referenz-, Abdeckungs-, Grössen- und SHA-256-Prüfung atomar in IndexedDB aktiviert.
- Der letzte vollständig validierte Stand dient als lokaler Fallback.
- Das Paket beantragt keine Microsoft-Graph- oder weitere Web-API-Berechtigung.

David Steimer entscheidet erst nach Abschluss der Prüfungen T03 bis T08 sowie T13 und T14 über `beschlossen`, einen begrenzten Vorbehalt oder `verworfen`.

## Begründung

Der lokale Spike weist nach, dass der gemeinsame technische Kern mit der von Microsoft unterstützten Toolchain gebaut und paketiert werden kann. Ein einziges Manifest nennt dieselbe Component-ID für SharePoint und Teams. Die Provider liefern dasselbe Format. Die Validierung und IndexedDB-Aktivierung kennen den Host nicht.

Die vorgeschlagene Architektur erfüllt damit die wichtigsten strukturellen Anforderungen, ohne die M365-spezifischen Risiken schönzureden. CORS, SharePoint-Berechtigungen, App-Katalog und Teams-Richtlinien lassen sich nur im Tenant belastbar beurteilen. Diese Nachweise sind Bedingung und keine Formalität.

## Folgen

### Auswirkungen

- Der dauerhafte Produktcode kann nach Beschluss aus dem Spike in die reguläre `src/`-Struktur überführt werden.
- SharePoint und Teams verwenden dasselbe `.sppkg` und dieselbe Component-ID.
- Die erstmalige Bereitstellung bleibt adminarm, aber nicht adminfrei.
- Tenant-, Site- und Mirrorpfade bleiben konfigurierbar.
- Der spätere Rechenkern erhält ausschliesslich vollständig validierte, providerneutrale Datenobjekte.

### Risiken und Grenzen

- Ein Websitesammlungs-App-Katalog kann für den SharePoint-Test genügen, während die Teams-Bereitstellung einen Tenant-App-Katalog verlangen kann.
- GitHub kann durch CORS, Tenantnetzwerk oder Sicherheitsrichtlinien blockiert sein.
- IndexedDB kann durch Browser- oder Tenantvorgaben eingeschränkt werden.
- Die lokale Prüfung ersetzt keinen Laufzeitnachweis in SharePoint und Teams.
- Neun moderate Auditbefunde in der Buildtoolchain bleiben bis zu einem kompatiblen Microsoft-Update beobachtet. Die produktiven Abhängigkeiten melden null bekannte Schwachstellen.

### Folgearbeiten und Rückabwicklung

- T03 bis T08 sowie T13 und T14 werden im ausgewählten M365-Testtenant durchgeführt.
- Bei blockiertem GitHub-Abruf wird der SharePoint-Mirror bereits im Pilot primärer Provider.
- Falls ein Websitesammlungs-App-Katalog nicht für Teams genügt, wird der Tenant-App-Katalog als einmalige Voraussetzung dokumentiert.
- Falls dasselbe WebPart nicht stabil in beiden Hosts läuft, wird Option 3 bewertet. Zwei vollständige Produktcodebasen werden nicht eingeführt.
- Eine Ablösung erfolgt mit einer neuen DEC-ID und gegenseitigen Verweisen in `ersetzt` und `ersetzt_durch`.

## Nachweise

- [SPK-SPFX-01](https://github.com/davidsteimer/fristenrechner/issues/16)
- [AP7-Ausführungsplan](../architektur/spfx-machbarkeitsspike-ap7.md)
- [Testprotokoll](../architektur/spfx-spike-testprotokoll.md)
- [Zwischenbericht](../architektur/spfx-spike-ergebnisbericht.md)
- [Minimalprototyp](../../spike/spfx/README.md)
- [DEC-2026-003](DEC-2026-003-github-feed-und-sharepoint-mirror.md)
- [DEC-2026-012](DEC-2026-012-providerneutrales-datenrelease-format.md)

## Verantwortlichkeit

Der Entscheidungsentwurf wurde mit Codex auf Basis der Spike-Evidenz vorbereitet. David Steimer trifft den Architekturentscheid nach den Tenantprüfungen. Codex übernimmt keine formelle Freigabe- oder Haftungsverantwortung.
