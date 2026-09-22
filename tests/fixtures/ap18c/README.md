# Historischer Manifestvertrag bis Format 3

Die Datei `manifest-format3.schema.json` ist eine unveränderte Bytekopie von `schemas/release-manifest.schema.json` aus Commit `81815d45d2950fbdbafcb4406a6928843f16ec2a` des Projekts `davidsteimer/fristenrechner`. Sie wurde am 22. September 2026 unmittelbar mit `git show` aus diesem Commit gelesen, ohne Anpassung der Versionsliste, Rollen oder Schemafelder.

- Umfang: 10 245 Bytes
- SHA-256: `016abce21e480fd24c6ba45213df66622c9216299986cd89a22e95ea751cad55`
- Externe Schemaabhängigkeit: `schemas/common.schema.json`
- SHA-256 dieser Abhängigkeit: `a3616757f84b5f5ab5c2c671abf628e643303cb4c8ffd3afd01751b82f6ef1f8`
- `common.schema.json` ist im genannten historischen Commit und im aktuellen Arbeitsstand byteidentisch. Der Test bindet auch diese Abhängigkeit an den genannten Hash.

Der Test `tests/data/test_previous_consumer_contract.py` verwendet genau diese historische Manifestdatei mit einer lokalen `referencing.Registry` und `jsonschema.Draft202012Validator`. Die Registry lädt keine Schemata aus dem Internet.

Nachgewiesen wird, dass der frühere Manifestvertrag den tatsächlichen freigegebenen MVP-0.3-Manifestbestand akzeptiert, den tatsächlichen AP18C-Format-4-Kandidaten hingegen abweist. Zusätzlich werden die Ablehnungsgrenzen Version, neue Artefaktrolle und neues Pflichtfeld getrennt am früher gültigen Manifest geprüft. Die Schemafixture wird dabei nie verändert.

Dies ist ausdrücklich ein Test des historischen Manifestvertrags. Er behauptet weder einen Test eines alten Browserbündels noch eine Ausführung eines früheren SharePoint- oder Teams-Pakets.
