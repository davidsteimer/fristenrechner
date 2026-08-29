# Quellcode

Dieser Bereich enthält den dauerhaften, hostneutralen Anwendungscode. Die Module bleiben klar getrennt:

- [`core`](core/README.md) für die in AP8 implementierte deterministische Fristenberechnung
- [`ui`](ui/README.md) für die in AP9 implementierte React- und Fluent-UI-Rechneroberfläche samt deutschem und französischem Sprachkatalog
- `providers` für GitHub- und SharePoint-Datenquellen
- `webparts` für die SharePoint-Framework-Integration

Der [AP7-Ausführungsplan](../docs/architektur/spfx-machbarkeitsspike-ap7.md) legte für den Machbarkeitsnachweis einen isolierten Prototyp unter `spike/spfx/` fest. Gestützt auf DEC-2026-013 entsteht der Produktcode nun schrittweise unter `src/`. Der Spike bleibt als technischer Nachweis erhalten und wird nicht unkontrolliert in den Produktcode kopiert. Die produktive SPFx-Integration folgt erst nach Abnahme des AP9-Kandidaten.
