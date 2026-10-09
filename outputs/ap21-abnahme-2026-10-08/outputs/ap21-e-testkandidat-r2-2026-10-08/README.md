# AP21 Korrigierter E Gerätetestkandidat

Stand: 8. Oktober 2026. **Revision 2 ist lokal gebaut und geprüft. Nicht hochgeladen, nicht installiert und nicht für die operative Verwendung freigegeben.**

## Paket und Korrektur

| Merkmal | Wert |
| --- | --- |
| Paketdatei | [fristenrechner-ap21-e-0.0.21.2.sppkg](fristenrechner-ap21-e-0.0.21.2.sppkg) |
| Paketversion | `0.0.21.2` |
| Grösse | 289’708 Bytes |
| SHA-256 | `689310164fd56c5339b93ebf4458621c9772d0d35e281fa2a39469ec1c40f0df` |
| Technischer Name | `FristenrechnerAP21EDeviceTest` |
| Sichtbarer Titel | Fristenrechner AP21 E-Gerätetest |
| Datenrelease | `2026-10-01-mvp-06-approved.1`, Format `6.0.0` |
| Manifest SHA-256 | `637cfc03c777f350031ba6c28676c685c16f25733391e1f25b0a3580016f5724` |

Der erste Kandidat wurde beim [E04-Installationsversuch](../../docs/betrieb/ap21-e04-vollzug.md) wegen des technischen App-Namens zurückgewiesen. R2 verwendet dafür einen separaten ASCII-Namen und bewahrt den deutschen Titel unter `Properties/Title`. Kandidatenkennung, Paketversion und Dateiname sind neu. Solution-, Feature- und Component-ID, Zielsites, MVP-0.6-Datenbindung und Testgrenzen bleiben gleich.

Die [neue Installationsvorlage](../../docs/betrieb/ap21-e-installationsvorlage-r2.md) bindet den Kandidaten und behandelt den noch vorhandenen ungültigen Katalogeintrag. Nur diese separat benannte Datei ist für einen späteren freigegebenen Installationsversuch vorgesehen. Die generisch benannte Kopie im privaten Buildordner ist kein alternatives Deploymentartefakt.

## Nachgewiesene Prüfungen

| Prüfung | Ergebnis und Beleg |
| --- | --- |
| SPFx-Quelltests vor den E-Anpassungen | 186 bestanden, [Protokoll](baseline-source-tests.log) |
| Produktionsbuild, CSS-Prüfung und Paketbau | Bestanden, [Build](production-build.log), [CSS](namespaced-css-audit.log), [Paket](package-solution.log) |
| Tests am tatsächlichen SPPKG | 31 bestanden, [Protokoll](packaged-ap21-and-isolation-tests.log) |
| Zusammensetzung der 31 Tests | Acht Datumseingabetests, 15 unveränderte Isolationstests, acht zusätzliche Manifest-/XML-Tests |
| Fehlererkennung am alten Paket | Ein gezielter Test schlägt erwartungsgemäss am alten `App/@Name` fehl, Exitcode 1, [Protokoll](regression-old-package.log) |
| Quellenvergleich R1 zu R2 | 105 von 106 Dateien identisch. Nur `ap21ETestConfig.ts` enthält die neue Kandidatenmetadatenbindung |
| Schutz bestehender Nachweise | 153 AP21-Artefakte, 24 R1-Bindungen, 204 AP22C3-Archivdateien und E04-Belege unverändert |

Die acht neuen Tests prüfen die Trennung von Namen und Titel in Konfiguration und Paket, konservative ASCII-Zeichen und Längengrenzen, Unicode, ungültige Anfangszeichen, XML-Escaping sowie fehlerhaftes oder mehrdeutiges XML. Der tatsächliche Manifestinhalt wird namespace-sensitiv mit dem bereits installierten JSDOM gelesen. Diese Tests sind keine vollständige SharePoint-XSD-Validierung.

Die vorhandenen 15 Lintwarnungen bleiben bestehen. Node.js 22.23.2 und die bestehende SPFx-Toolchain wurden ohne Nachinstallation verwendet. Der Rechenkern und die Datumseingabe sind unverändert. Die 15 bestehenden Isolationstests wurden vollständig und unverändert übernommen.

Der [vollständige Quellen- und Bundlevergleich](source-comparison.json) bestätigt zusätzlich alle 77 unveränderten gemeinsamen Quelldateien. Das JavaScript-Bundle hat eine neue Prüfsumme. Nach Normalisierung des neu erzeugten CSS-Modul-Hashes und des zugehörigen Lizenzdateiverweises sind die Bundletexte von R1 und R2 vollständig identisch. Diese Normalisierung dient nur dem Vergleich, die ausgelieferten Dateien werden nicht verändert.

## Gebundene Belege und offene Haltepunkte

[Kandidatenvertrag](candidate-contract.json), [Baunachweis](build-verification.json), [Bau- und Testquellen](build-inputs/) und [abschliessende Integritätsbindung](completion-integrity.json) dokumentieren die tatsächlichen Bytes. Das private Quellarchiv enthält die beiden internen E-Zieladressen und ist nicht zur Veröffentlichung freigegeben.

R1-Paket, ursprüngliche Bau- und Testdateien, Installationsvorlage und Fehlerprotokoll wurden nicht überschrieben. Dieser neue Nachtrag ersetzt keinen historischen Nachweis und erteilt keine neue Tenantfreigabe.

Offen bleiben die konkrete R2-Installationsfreigabe, vollständige Live-Vorprüfung einschliesslich der restlichen E02-Nachweise, Katalogvalidierung, Installation auf den zwei E-Sites und reale Geräteprüfung. E05 für den direkten Teams-Host bleibt ein gesonderter Haltepunkt. Kein Zugriff auf den Tenant erfolgte im Rahmen dieser Korrektur. Bestehende Apps, Mirrors, Q, AP5, P, GitHub, Berechtigungen und Richtlinien wurden nicht verändert.
