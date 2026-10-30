# MVP 0.10 · Öffentliche Publikationsnachweise

Stand: 30. Oktober 2026. Lokales Paket zur gesonderten Freigabe. Noch kein Commit, Push oder P-Deployment.

- [Exakte Positivliste](publication-package.json)
- [Datensparsame Nachweisauswahl mit Originalhashbindungen](evidence.json)
- [Prüfung des tatsächlichen Exports](public-checks.json)
- [Datenschutzsichtung, Erhaltung und Abschluss](closure-check.json)
- [Erläuterung und Freigabevorlage](../../docs/betrieb/publikationspaket-mvp10.md)

Die Positivliste erfasst die ausgewählten neuen/geänderten Dateien einschliesslich der 45 Dateien des bestehenden Datencommits. Der unveränderte bereits veröffentlichte Gitbestand bildet die Basis. Die Positivliste enthält sich selbst nicht. Ihre separate SHA-256 ist Bestandteil der konkreten Freigabe, ohne zirkuläre Selbstbindung.

`node scripts/verify-mvp10-publication.mjs` prüft alle ausgewählten Bytes und die festen Releaseanker lesend, ohne Git, private Originale oder Netzwerk. Der gesonderte Nur-Auswahlexport enthält genau die Liste und ihre Manifestdatei. Die funktionsgeprüfte Repositorykopie enthält zusätzlich die unveränderte öffentliche Basis. Beide Prüfarten bleiben getrennt.

`evidence.json` enthält ausdrücklich ausgewählte Felder, Originalhash/-länge, Artefaktinventare, die 451 ursprünglichen Baueingänge und den getrennten CLI-Nachtrag. Private Originale, Quellenkörper, Hostcaptures, HARs und Sicherungen werden nicht mitgeliefert. Die späteren menschlichen Bestätigungen stehen in der additiven [Q-Abnahme](../../docs/betrieb/abnahme-q-mvp10.md). Frühere offene Statusfelder bleiben historisch unverändert.

Der Jura-Schematest benötigt zusätzlich das unveränderte bibliografische Quellenbindungsregister `outputs/ap23j1-2026-10-27/sources/ju/source-bindings.json`. Dies enthält URLs, Rollen, Prüfnotizen und Hashbindungen. Die referenzierten PDF-/HTML-/MCP-Volltexte werden nicht veröffentlicht. Verweise in historischen Berichten auf private Originale sind keine Zusage ihrer öffentlichen Verfügbarkeit.

Öffentliche Byteintegrität und Standardtests ersetzen keinen vollständig öffentlich reproduzierten Rechtsquellen-, Recovery- oder Hostaudit. Keine zusätzliche Rechtsfreigabe, Geräte-/Gastprüfung, Outlookprüfung oder erneute Header-/Cacheprüfung durch dieses Paket.
