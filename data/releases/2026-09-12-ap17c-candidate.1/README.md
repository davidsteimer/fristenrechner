# AP17C · Lokaler Datenkandidat

`2026-09-12-ap17c-candidate.1` ist ein Integrationskandidat auf Grundlage des freigegebenen MVP-0.3-Datenstands und der am 12. September 2026 abgenommenen AP17B-Fachmatrix. Er ist **nicht produktiv freigegeben**. Der normale Datenprovider lehnt `releaseStatus: candidate` weiterhin ab.

- 16 neue qualifizierte Zuordnungen für IVG, AHVG, UVG und bernische Beschaffung
- Vier ausdrücklich gesperrte Sammelpfade
- Bestehende politische Regime unverändert übernommen, berechenbare Altdefinitionen um `applicability: null` ergänzt
- Spezialregimekomponente 3.0.0 als Kandidatenvorschlag, Manifest 3.0.0 und Kalender 2.0.0 unverändert
- Fünf Rechtsprofile und beide Kalender bytegleich mit dem freigegebenen Ausgangsstand
- Neue technische Fallabdeckung 01.01.2026 bis 31.12.2027, ohne behauptetes gesetzliches Geltungsende

Der deterministische Builder `scripts/build-ap17c-candidate.mjs` prüft zuerst die SHA-256-Bindung des unveränderten AP17B-Referenzkorpus. Er erzeugt nur diesen Kandidatenordner. Ein erfolgreicher Build oder Test ist keine Promotion.

Der [AP17C-Integrationsnachweis](../../../docs/architektur/vrpg-integration-ap17c.md) beschreibt Bedienung, Anwendbarkeitsvertrag, Tests und Freigabegrenzen. Der [Quellenabgleich](../../../docs/fachrecht/quellenabgleich-ap17c.md) dokumentiert aktuelle und angekündigte Fassungen getrennt. Der archivische Referenzkorpus und sein unabhängiger Validator bleiben unverändert.
