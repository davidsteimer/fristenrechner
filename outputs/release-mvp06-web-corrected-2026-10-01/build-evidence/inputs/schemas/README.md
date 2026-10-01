# Datenschemata

Die Schemata definieren die providerneutralen Datenreleaseformate 1.0.0 bis 6.0.0 sowie die sprachneutralen Testverträge. Format 6 ist mit DEC-2026-026 beschlossen und in AP20C1 lokal implementiert, noch ohne neue operative Datenfreigabe.

| Datei | Zweck |
| --- | --- |
| `common.schema.json` | Gemeinsame Typen für Quellen, Gültigkeit, Abdeckung, Prüfstatus, Bedingungen und Erweiterungen |
| `legal-profile.schema.json` | Rechtsprofile, explizite Selektoren und typisierte Regeleffekte |
| `calendar.schema.json` | Feiertage, Kalendervererbung und inklusive Stillstandsperioden |
| `calendar-rules-v2.schema.json` | Kalenderkomponente 2.0.0 für versionierte Feiertagsregeln, relative Stillstandsperioden und explizite Overrides |
| `holiday-catalog-v1.schema.json` | Feiertagskatalog 1.0.0 mit schweizweitem Fachbestand, Datumssprache, räumlichen Zuordnungen und begrenzter operativer CH-/BE-Projektion |
| `calendar-rule-reference-suite.schema.json` | AP12A-Referenzvertrag für Parität, Kalenderarithmetik, Overrides und Sperrfälle |
| `release-manifest.schema.json` | Release-ID, Providervertrag, Kompatibilität, Artefakte und SHA-256-Prüfsummen |
| `release-manifest-v5.schema.json` | Manifest 5 für den Sozialverfahrenskatalog 1.0.0 aus MVP 0.5 |
| `release-manifest-v6.schema.json` | Manifest 6 mit exaktem Mindestconsumer 6.0.0 und Sozialkomponente 2.0.0 |
| `social-procedure-catalog.schema.json` | Sozialkomponente 1.0.0, unveränderte geschlossene Werte für die ersten sechs Erlasse |
| `social-procedure-catalog-v2.schema.json` | Sozialkomponente 2.0.0, erweitert ausschliesslich die bestätigten Erlass-, Fakten- und Herkunftslisten |
| `source-register.schema.json` | Tenantneutrales Register produktiver, unterstützender und überwachter amtlicher Quellen |
| `source-review-event.schema.json` | Append-only-Prüfereignis mit vier Ergebnissen, Nachweis, Auswirkung und Folgemassnahme |
| `source-review-index.schema.json` | Generierte Suchsicht auf jüngsten Prüfstand, Gemeinwesen, Sachgebiet und betroffene Datenkomponenten |
| `golden-case-suite.schema.json` | Synthetische Referenzfälle, Eingaben, Quellen, Rechenspur und erwartete Ergebnisse |
| `deadline-rule.schema.json` | AP11A-Kandidat mit fünf typisierten Rechenarten und benannten Ankern |
| `filing-profile.schema.json` | AP11A-Kandidat für Aufgabe, Eingang, Original, Uhrzeit, Kanäle und Nachweise |
| `special-regime-catalog.schema.json` | AP11A-Katalog aus Regeln, Profilen, Gates, Übersteuerungen und Regimen |
| `special-regime-catalog-v3.schema.json` | Bestätigter AP17C-Produktvertrag mit qualifizierter Anwendbarkeit, explizitem Altbestand und gesperrten Mapping-IDs |
| `special-golden-case-suite.schema.json` | Kandidat des Testvertrags 2.0 für mehrere Daten, Uhrzeiten und Spezialerwartungen |

## Grundregeln

- Schema-Dialekt ist [JSON Schema Draft 2020-12](https://json-schema.org/draft/2020-12).
- Die Formatversion des AP5-Referenzbestands ist `1.0.0`.
- Format `2.0.0` ergänzt die Spezialregimekataloge.
- Format `3.0.0` verlangt die Kalenderkomponente `2.0.0` und eine nach oben offene Releaseabdeckung.
- Format `4.0.0` verlangt zusätzlich genau einen Feiertagskatalog `1.0.0` und `holidayCatalogIds`. Der erste Vertragsstand ist auf die bisherigen fünf Rechtsprofile und den AP17-Spezialkatalog `3.0.0` begrenzt.
- Format `5.0.0` verwendet Sozialkomponente `1.0.0`. Format `6.0.0` verwendet ausschliesslich Sozialkomponente `2.0.0` und Mindestconsumer `6.0.0`. Gemischte Paare oder blosses Umetikettieren werden abgewiesen. Der [AP20C1-Nachweis](../docs/architektur/implementierung-ap20c1.md) dokumentiert die Regression der historischen Formate und Datenpins.
- Kernobjekte weisen unbekannte Felder und Regeltypen ab.
- Qualifizierte, vom Rechenkern ignorierbare Zusatzinformationen sind nur unter `extensions` zulässig.
- Datumswerte sind ISO-Vollformate `JJJJ-MM-TT` ohne Uhrzeit und Zeitzone.
- AP11A führt Uhrzeiten nur als getrennte lokale Werte mit expliziter IANA-Zeitzone, nie als vermischten Datumsstring.
- Strukturelle Rückwärtskompatibilität, Datenrelease und Schemaänderung werden getrennt versioniert.

Ein veröffentlichtes Schema wird nicht stillschweigend semantisch umgedeutet. Inkompatible Änderungen benötigen eine neue Hauptversion und einen dokumentierten Migrationsentscheid. Einzelheiten stehen im [Datenrelease-Format](../docs/architektur/datenrelease-format.md) und im beschlossenen [DEC-2026-012](../docs/entscheidungen/DEC-2026-012-providerneutrales-datenrelease-format.md).

Das AP6-Schema gehört zum Testvertrag und verändert die Formatversion des AP5-Datenrelease nicht. Berechenbare Referenzfälle und fachlich offene Sperrfälle werden in getrennten Suites geführt. Der Status `approved` kennzeichnet die fachliche Abnahme durch David Steimer.

Die vier AP11A-Schemata sind Kandidaten. Sie erweitern weder das freigegebene AP5-Release noch die 15 abgenommenen AP6-Fälle. Die vorgeschlagene produktive Formatevolution ist in [DEC-2026-014](../docs/entscheidungen/DEC-2026-014-komponentenweise-fachdatenformatevolution.md) dokumentiert.

AP12A ergänzte ein separates Kandidatenschema für die Kalenderkomponente `2.0.0`. AP12C integriert es gemäss dem beschlossenen [Entscheid DEC-2026-015](../docs/entscheidungen/DEC-2026-015-regelbasierte-kalenderkomponente.md) ausschliesslich in Manifestformat `3.0.0`. `calendar.schema.json` und bestehende Format-1- und Format-2-Releases bleiben unverändert.

AP13 verwendet einen getrennten Governance-Vertrag in Version `1.0.0`. Quellenregister, Prüfereignisse und Index sind keine Artefakte eines Laufzeit-Datenrelease. Ihre Trennung erlaubt die Dokumentation einer unveränderten Prüfung ohne künstliche Neuversionierung der Fachdaten.

David Steimer hat den Spezialregimekatalog in Komponentenhauptversion `3.0.0` am 12. September 2026 ausdrücklich als technischen Produktvertrag bestätigt. Dies hält [DEC-2026-020](../docs/entscheidungen/DEC-2026-020-qualifizierter-spezialregimekatalog-v3.md) fest. Manifest-Hauptformat `3.0.0`, Rechtsprofile `1.0.0` und Kalenderkomponente `2.0.0` bleiben unverändert. Der neue Komponentenvertrag gehört zum technisch geprüften lokalen [AP17C-Kandidaten](../docs/architektur/vrpg-integration-ap17c.md). David Steimer hat AP17C am selben Tag fachlich abgenommen. Datenpromotion, Veröffentlichung und Deployment bleiben gesonderten Freigaben vorbehalten. Bestehende v2-Kataloge bleiben lesbar. Der produktive Provider weist Kandidaten weiterhin ab.

## Validierung

Der beschlossene [DEC-2026-023](../docs/entscheidungen/DEC-2026-023-schweizweiter-feiertagskatalog.md) ist im lokalen [AP18C-Integrationskandidaten](../docs/architektur/feiertagskatalog-ap18c.md) umgesetzt. Die neue Katalogrolle wird in älteren Manifestformaten ausdrücklich abgewiesen. Der Browser verwendet für das feste Katalogschema einen begrenzten, auf unterstützte Schlüssel geprüften Validator. SPFx validiert zusätzlich mit AJV, die unabhängige Python-Prüfung mit `jsonschema`. Semantische Gates sichern Referenzen, Gebiete, Freigaben und die unveränderte operative Projektion. Alle Gates liegen vor der Aktivierung und Persistenz. Der historische Format-3-Manifestvertrag wird als unveränderte [Testfixture](../tests/fixtures/ap18c/README.md) geprüft.

Die Schemata werden selbst gegen den Metaschema-Dialekt geprüft. Anschliessend werden Manifest und alle gelisteten Artefakte strukturell und semantisch validiert:

```bash
python3 -m venv .venv
.venv/bin/python -m pip install -r requirements-data.txt
.venv/bin/python tests/data/validate_release.py \
  data/releases/2026-08-29-ap5-approved.1 \
  --self-test
.venv/bin/python tests/special-regimes/validate_special_regime_candidates.py
.venv/bin/python tests/calendar-rules/validate_ap12a_candidates.py
.venv/bin/python tests/data/validate_release.py \
  data/releases/2026-08-31-ap12c-candidate.1 \
  --self-test
.venv/bin/python tests/data/validate_ap12c_release.py
.venv/bin/python tests/governance/validate_source_reviews.py --self-test
```
