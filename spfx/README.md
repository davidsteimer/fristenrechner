# Fristenrechner Schweiz für SharePoint und Teams

Dieser Ordner enthält die produktive SPFx-Lösung des Fristenrechners Schweiz. Dasselbe WebPart und dasselbe `.sppkg` laufen auf modernen SharePoint-Seiten und als Microsoft-Teams-Kanalregisterkarte.

Der abgeschlossene Machbarkeitsspike bleibt unter [`../spike/spfx/`](../spike/spfx/README.md) unverändert erhalten. Diese Lösung übernimmt dessen geprüften Release-Service. Der tenantgeprüfte AP10-Stand verbindet ihn mit dem AP8-Rechenkern und der AP9-Rechneroberfläche. AP11C ergänzt die Format-2-Validierung und die MVP-0.2-Spezialregimeoberfläche. Das Arbeitspaket ist abgenommen und der Datenrelease `2026-08-31-mvp-02-approved.1` ist freigegeben. Die Tenantprüfung des definitiven Pakets `0.2.0.0` bleibt vor der Betriebsfreigabe zwingend.

## Toolchain

| Baustein | Version |
| --- | --- |
| Node.js | 22.23.2 |
| SharePoint Framework | 1.23.2 |
| React und React DOM | 17.0.1 |
| Fluent UI React | 8.106.4 |
| TypeScript | 5.8.x |
| Heft | 1.2.17 |

Diese Kombination entspricht der Microsoft-Kompatibilitätsmatrix für SPFx 1.23.2. Die Versionen sind absichtlich exakt gepinnt.

## Quellstruktur

- `../src/core/` ist die führende Quelle des deterministischen Rechenkerns.
- `../src/ui/` ist die führende Quelle der hostneutralen Rechneroberfläche.
- `src/core/` enthält den providerneutralen Release-Service, die Releasevalidierung für Format 1 und 2 sowie den lokalen Aktivstand.
- `src/webparts/fristenrechner/` enthält ausschliesslich den dünnen SPFx-Hostadapter.
- `src/product/` und `src/core/schemas/` werden vor Test, Build und lokalem Start mechanisch aus den führenden Repository-Quellen erzeugt und nicht separat gepflegt. Zu den synchronisierten Format-2-Schemata gehören Fristdefinition, Fristwahrung und Spezialregimekatalog.

Damit existieren weder ein zweiter Rechenkern noch eine zweite Oberfläche für Microsoft 365.

## Datenquellen

Die WebPart-Konfiguration bietet zwei Provider:

- `GitHub`, im definitiven Paket auf einen vollständigen Commit des unveränderlichen MVP-0.2-Release gepinnt
- `SharePoint-Mirror`, konfigurierbar als serverrelativer Ordner auf derselben SharePoint-Website

Ein Release wird nur nach vollständiger Schema-, Grössen-, Prüfsummen-, Referenz- und Abdeckungsprüfung aktiviert. Format 2 verlangt zusätzlich mindestens einen vollständig validierten Spezialregimekatalog. Nur `approved` wird aktiviert. Ein Datenstand mit `candidate` wird auch bei korrekten Prüfsummen abgewiesen. Bei einem Netzfehler bleibt der letzte vollständig validierte Aktivstand in IndexedDB verfügbar. Das Paket beantragt keine Microsoft-Graph-Berechtigungen und benötigt keine Entra-App-Registrierung.

Der Mirrorpfad ist standardmässig leer. Für Teams muss der Mirror deshalb auf der zum Team gehörenden SharePoint-Website bereitgestellt und in der betreffenden Registerkarteninstanz konfiguriert werden. Ein Format-2-Mirror enthält neben Profilen und Kalendern den Ordner `special-regimes/`. Tenantinterne Cross-Site-Abrufe sind ohne eigenen Test nicht freigegeben.

## Lokaler Build

```bash
nvm use
npm ci
python3 scripts/generate-teams-icons.py
npm test
npm run build
```

Der Build erzeugt `sharepoint/solution/fristenrechner-schweiz.sppkg` mit eingebetteten Client-Assets. Der aktuelle lokale Kandidat trägt die Version `0.2.0.0`. Vor der Paketierung prüft `npm run audit:bundle` das finale Bundle auf eine direkt anwendbare globale Produkt-CSS. Lokalisierte `fr-*`-Klassennamen und wörtlich ausgelieferte `:global`-Marker führen zum Abbruch. Die lokale SharePoint-Debugumgebung wird mit `npm start` auf Port 4321 gestartet.

## Bereitstellung

1. `.sppkg` in den Tenant-App-Katalog hochladen und aktivieren.
2. App auf der SharePoint-Zielsite installieren.
3. WebPart auf einer modernen Seite hinzufügen.
4. Für Teams die App zusätzlich auf der zum Team gehörenden SharePoint-Website installieren.
5. WebPart als Kanalregisterkarte hinzufügen.
6. Falls verwendet, den Mirrorpfad für jede WebPart-Instanz separat konfigurieren.

Die Bereitstellung ist adminarm, aber nicht adminfrei. Die AP11C-Abnahme und Promotion des Datenrelease sind erfolgt. Das definitive Paket `0.2.0.0` wird erst nach vollständiger SharePoint- und Teams-Testmatrix betrieblich freigegeben. Die Prüf- und Rückrollfolge steht in der [MVP-0.2-Deploymentanleitung](../docs/betrieb/deployment-mvp-02-ap11c.md). Gastzugriffe sind nicht Bestandteil von AP11C.

## Lizenz

Der Programmcode steht unter AGPL-3.0-only. Daten, Dokumente und weitere Inhalte behalten ihre jeweils ausgewiesene Lizenz.
