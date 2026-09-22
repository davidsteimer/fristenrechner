---
id: DEC-2026-020
titel: "Spezialregimekatalog 3.0.0 als technischer Produktvertrag"
status: beschlossen
entscheidungsdatum: 2026-09-12
klasse: B
entschieden_durch: "David Steimer"
quelle:
  - "Ausdrückliche Bestätigung des technischen Produktvertrags im Projektgespräch vom 12. September 2026"
  - "AP17C-Integrationsnachweis und fachliche Abnahme vom 12. September 2026"
  - "DEC-2026-014, komponentenweise Formatevolution"
ersetzt: []
ersetzt_durch: null
---

# DEC-2026-020: Spezialregimekatalog 3.0.0 als technischer Produktvertrag

## Ausgangslage

AP17C integriert 16 begrenzte Fachzuordnungen für Sozialversicherungs- und Beschaffungsrecht. Der bisherige Spezialregimekatalog 2.0.0 enthält noch keinen verbindlichen Vertrag für deren genaue Anwendbarkeit. AP17C ergänzt ihn deshalb mit einer neuen Komponentenhauptversion. Die lokale Umsetzung und ihre Prüfungen liegen vor. David Steimer hat AP17C fachlich abgenommen und anschliessend den vorgeschlagenen technischen Produktvertrag ausdrücklich bestätigt.

## Geprüfte Optionen

1. **Komponentenhauptversion 3.0.0 mit expliziter Anwendbarkeit**
   - Der neue Pflichtvertrag ist an der Komponentenversion erkennbar. Bestehende v2-Kataloge bleiben lesbar und werden nicht umgeschrieben.
2. **Erweiterung innerhalb der bisherigen Komponentenhauptversion 2.0.0**
   - Eine neue verbindliche Anwendbarkeitssemantik wäre für bisherige Consumer nicht ausreichend abgegrenzt. Diese Variante entspricht nicht dem komponentenweisen Evolutionsprinzip von DEC-2026-014.

## Entscheid

David Steimer hat am 12. September 2026 erklärt:

> Der vorgeschlagene Spezialregimekatalog `3.0.0` ist ausdrücklich als technischer Produktvertrag bestätigt.

Damit gilt der in AP17C implementierte Spezialregimekatalog `3.0.0` als beschlossener technischer Produktvertrag, nicht mehr als blosser Vorschlag.

| Komponente | Bestätigter Vertragsstand | Abgrenzung |
| --- | --- | --- |
| Spezialregimekatalog | 3.0.0 | Qualifizierte Anwendbarkeit und ausdrücklich gesperrte Mapping-IDs |
| Release-Manifest | 3.0.0 | Hauptversion unverändert, v3-Spezialkatalog über explizite Schema-ID unterstützt |
| Rechtsprofile | 1.0.0 | Format unverändert |
| Regelkalender | 2.0.0 | Format unverändert |

Der Vertrag umfasst insbesondere:

- `applicability` als Pflichtfeld berechneter Fristdefinitionen. Bei den qualifizierten AP17C-Pfaden enthält es die konkrete Anwendbarkeitszuordnung, beim unverändert übernommenen Altbestand ausdrücklich `null`.
- Eindeutige Zuordnung über Mapping-ID, Auswahl, Sachbereich, Dokument, Verfahrenskontext, Kalenderanknüpfung, Eröffnungsart, gegebenenfalls Übergangsrechtsdatum, technische Fallabdeckung und Normspur.
- `blockedMappings` für ausdrücklich nicht unterstützte Sammelpfade. Schema-, Referenz- und Anwendbarkeitsprüfung bleiben verbindlich.
- Lesbarkeit bisheriger v2-Kataloge. Unbekannte Vertragsversionen und unzulässige Eingaben werden nicht stillschweigend umgedeutet.

Der Entscheid konkretisiert DEC-2026-014 für AP17C. Er ersetzt weder dessen Grundprinzipien noch DEC-2026-015 oder DEC-2026-019. Historische Datenreleases und Entscheide bleiben unverändert.

## Begründung

Die neue Hauptversion macht die zusätzliche verbindliche Semantik sichtbar. Der Rechenkern und die Oberfläche verwenden denselben Anwendbarkeitsvertrag. Die Fachzuordnung bleibt prüfbar, ohne Rechtsprofile, Kalenderformat oder alte Releases nachträglich zu verändern. Die Vertragsbestätigung ist von der Freigabe eines konkreten auszuliefernden Datenrelease getrennt.

## Folgen

### Auswirkungen

- Der AP17C-Produktvertrag ist bestätigt. Eine erneute Bestätigung desselben unveränderten Vertrags ist für die Releasevorbereitung nicht erforderlich.
- Fachliche AP17C-Abnahme, technische Prüfnachweise und dieser Architekturentscheid sind getrennt dokumentiert.

### Risiken und Grenzen

- Der Entscheid erweitert weder die 16 fachlich abgenommenen Zuordnungen noch deren technische Fallabdeckung 2026–2027. Die vier gesperrten Sammelpfade bleiben gesperrt.
- Er bewirkt keine Datenpromotion. Der vorhandene Datenstand `2026-09-12-ap17c-candidate.1` bleibt mit `releaseStatus: candidate` unverändert erhalten und wird vom normalen produktiven Provider weiterhin abgewiesen.
- Bereits erzeugte Kandidatenartefakte einschliesslich ihrer Vorschlagsmetadaten bleiben als Erstellungsnachweis bytegleich. Der aktuelle Entscheidstatus wird in dieser DEC-Datei und den lebenden Statusdokumenten geführt.
- GitHub-Veröffentlichung, definitives SPPKG, Datenpins, SharePoint-Mirror, E-/Q-/P-Deployment und Betriebsfreigabe werden dadurch nicht freigegeben.

### Folgearbeiten und Rückabwicklung

- Die kontrollierte Releasevorbereitung kann auf dem bestätigten Vertrag aufbauen. Vor einer Promotion sind der Code- und Datenstand zu fixieren, der Quellenstand nachzuführen und die erforderlichen Release- und Bereitstellungsfreigaben einzuholen.
- Bisherige technische Tests ersetzen keine tatsächlichen SharePoint-, Teams- oder öffentlichen Hosttests des später freigegebenen Pakets.
- Der bestehende Produktivstand bleibt unverändert. Ein betrieblicher Rollback ist durch diesen Dokumentationsentscheid nicht erforderlich.
- Eine spätere materielle Ablösung dieses Entscheids erfolgt mit neuer DEC-ID und gegenseitigen Verweisen.

## Nachweise

- [AP17C-Vertrag, Prüfung und Fachabnahme](../architektur/vrpg-integration-ap17c.md)
- [Schema des Spezialregimekatalogs 3.0.0](../../schemas/special-regime-catalog-v3.schema.json), SHA-256 des bestätigten Stands: `50f8cb02b8e5b5bebffdb97594b9f3c51b89bb58b2ec26c487baea92f3a1854e`
- [Unveränderter AP17C-Datenkandidat](../../data/releases/2026-09-12-ap17c-candidate.1/README.md), Manifest-SHA-256: `e13a5cc8887bb6f16572d87729728511d71b8048690e2ef514c0194f21c61b90`
- [AP17C-SPFx-Prüfnachweis](../architektur/ap17c-spfx-pruefung.md)
- [DEC-2026-014: Komponentenweise Formatevolution](DEC-2026-014-komponentenweise-fachdatenformatevolution.md)
- [DEC-2026-015: Regelbasierte Kalenderkomponente](DEC-2026-015-regelbasierte-kalenderkomponente.md)
- [DEC-2026-019: Gestufte VRPG-Bedienung](DEC-2026-019-gestufte-vrpg-bedienung.md)

## Verantwortlichkeit

Entschieden durch David Steimer, der die menschlichen Projekt-, Fach- und Freigaberollen weiterhin in Personalunion wahrnimmt. Codex dokumentiert den Entscheid und unterstützt die Prüfung, ohne formelle Freigabe- oder Haftungsverantwortung.
