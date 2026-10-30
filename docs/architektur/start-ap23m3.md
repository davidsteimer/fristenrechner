# AP23M3 Startauftrag native Integration Neuenburg, Waadt und Wallis

Stand: 28. Oktober 2026. David Steimer hat AP23M2 technisch abgenommen, [DEC-2026-042 beschlossen](../entscheidungen/DEC-2026-042-beschluss.md) und AP23M3 ausdrücklich gestartet:

> AP23M2 ist technisch abgenommen. Ich bestätige DEC-2026-042 mit Katalog 10.0.0 sowie Manifest und Mindestconsumer 17.0.0. Bitte starte AP23M3.

Die [separate M2-Abnahme](../fachrecht/abnahme-ap23m2.md) verändert weder die ursprünglichen M2-Unterlagen noch deren vorgeschlagene und vorläufige Statusfelder. Der lokale Auftrag umfasst einen nativen Reader und Rechner für Katalog 10.0.0 und Manifest 17.0.0, die behutsame DE-/FR-Integration in die bestehende Oberfläche sowie lokale Tests tatsächlicher Web- und SPFx-Artefakte. Eine Quellenrelease- oder Betriebsfreigabe ist nicht eingeschlossen.

## Gesicherte Ausgangslage

Die [autonome M2-Abnahmekopie](../../outputs/ap23m2-abnahme-2026-10-28/receipt.json) enthält **181 Nutzdateien mit 40’539’986 Bytes**. Receipt SHA-256: `6d8b5a648a54dab7b3d06aeab5d4200f55613e01e14b5572d656663744d899dc`. Die 180 Originalbindungen und der Originalabschluss bleiben unverändert. Es gibt keine rekursive Archivkopie.

Der [M3-Ausgangsschutz](../../outputs/ap23m3-2026-10-28/protected-inputs.json), SHA-256 `999058873565d1395f04767d040ca218ec8da04303b899f23d7f80cbcd7227f9`, wurde **vor Integration und Statusnachführung** erzeugt. Er bindet **11’540 unveränderliche Dateien**, **157 kontrolliert veränderbare Dateien** und sieben separat gebundene lebende Einstiegstexte. Die 157 bestehen aus denselben 24 expliziten Dispatcher-, UI- und Hostdateien wie in L3 und den heute vorhandenen 133 generierten SPFx-Produktkopien. Die zehn seit dem L3-Ausgang hinzugekommenen Produktkopien bleiben bytegleich ihren geschützten alten V9-/16- beziehungsweise L3-Quellen. Eine generierte Kopie erlaubt keine Änderung ihrer nativen Quelle.

Eine ausdrücklich bestätigte technische Ableitung ergänzt genau die neue Datei `spfx/src/schemas/implementation/ap23m3/administrative-input-v10.schema.json`. Sie ist ausschliesslich bytegleich zur bereits durch den ursprünglichen nativen M3-Prefix gedeckten Datei `schemas/implementation/ap23m3/administrative-input-v10.schema.json` zulässig. Der Prüfer benennt diese Einzelregel und bindet bei vorhandener Kopie den tatsächlichen Quellhash. Die Guardbytes bleiben unverändert. Es gibt keine zusätzliche Prefixfreigabe und keine Lockerung der sieben übrigen vorab deklarierten Schemakopien.

## Umsetzung und Nachweis

Die 49 fachlich abgenommenen NE-/VD-/VS-Gruppen werden nativ umgesetzt, ohne die 196 bestehenden nativen Fachpfade und deren Mathematik zu verändern. Die rechtliche Qualifikation, NE-Sitzwahl, VD-Rohpostregel, spezifischen Nachfristen und VS-Eröffnungen bleiben aktuelle Falltatsachen. Sie werden nicht aus persönlichen Standards ergänzt. Die offenen Fachgrenzen und das Fenster 29.08.2026–31.12.2027 bleiben bestehen.

Neue native V10-/17-Dateien, M3-Kandidatendaten und eigene M3-Tests bleiben getrennt von den alten Formaten. Die Oberfläche bleibt zweispaltig, mit früher Datumseingabe, ruhigen DE-/FR-Texten und festen Werten ohne unnötige Dropdowns. Alte Reader, native Schemata, Daten, Tests und Nachweise bleiben geschützt. `src/ui/styles.css` ist ausdrücklich nicht veränderbar.

Der Abschluss muss tatsächliche native Ergebnisse, die unveränderten fachlichen Erwartungen, unabhängige Gegenrechnung, historische Regressionen, Exportgrenzen, Defaults, die tatsächlichen lokalen Hostartefakte und eine begrenzte visuelle Browserprüfung binden. Ein lokaler Kandidat ist kein freigegebener Datenrelease und kein installierbares Betriebspaket.

## Haltepunkt und Ausschlüsse

Der nächste Haltepunkt ist Davids fachlich-technische M3-Abnahme. Bis dahin bleiben **23 Kantone produktseitig abgenommen, davon sechs operativ und 17 weitere nur lokal**. NE, VD und VS werden erst nach ihrer nativen M3-Abnahme hinzugerechnet. MVP 0.9 bleibt operativ.

Keine Commits, GitHub-Änderungen, Uploads, Installation, Mirrorumstellung oder Betriebsänderung. E/Q/P, AP5, AP21, Hosting und Berechtigungen bleiben unverändert. DEC-2026-034 bündelt den nächsten regulären Release. Alle menschlichen Rollen nimmt David in Personalunion wahr. Codex bleibt Arbeitsinstrument ohne formelle Freigabeverantwortung.
