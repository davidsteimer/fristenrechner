# AP21 – archivierter erfolgreicher Zwischenstand

Der isolierte Build `.work/ap21-spfx-build-7QlptW` war erfolgreich. Sein Nachweis und alle sechs zugehörigen Dateien unter `spfx-logs` sind hier unverändert archiviert.

Der Nachweis wurde durch einen neuen vollständigen Lauf ersetzt, weil danach die ausschliesslich vom eigenständigen Webbuild verwendete SVG-Registrierung in `src/ui/browserAppearance.tsx` ergänzt wurde. Auch diese Datei wird als gemeinsame UI-Quelle in das SPFx-Buildverzeichnis kopiert. Der definitive Nachweis muss deshalb die letzte Quellfassung binden, obwohl die Registrierung nicht vom SPFx-Einstieg importiert wird.

Die `path`-Angaben im unverändert erhaltenen `spfx-build.json` bezeichnen den ursprünglichen Ablageort. Die archivierten Kopien befinden sich nun in diesem Unterordner. Eine ursprüngliche Angabe `outputs/ap21-2026-10-08/spfx-logs/<Datei>` entspricht hier `spfx-logs/<Datei>`. Die SHA-256-Werte bleiben identisch.

Dieser erfolgreiche Zwischenstand ist keine aktuelle Endabnahme und kein Installationsartefakt. Er darf nicht mit den separat als fehlgeschlagen dokumentierten Zwischenläufen verwechselt werden.
