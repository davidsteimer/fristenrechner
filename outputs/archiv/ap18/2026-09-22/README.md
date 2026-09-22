# AP18-Referenzarchiv vom 22. September 2026

Bitte diese Dateien nicht in Excel bearbeiten oder erneut speichern. Für Jahreswahl, Filter und sonstige Arbeit die lokale Datei `outputs/arbeitskopien/ap18/Feiertagsmatrix_Schweiz_Arbeitskopie_ab_V0.12.xlsx` verwenden. Die Arbeitskopie ist bewusst nicht Teil des Git-Repositorys.

- `beobachteter-bestand/`: privat erhaltene V0.9 und V0.10, seit P01 nicht zur Veröffentlichung bestimmt. Ihre Bytes weichen weiterhin von den historischen Hashwerten ab. Keine wiederhergestellten Originale.
- `publikationskopien/`: gesonderte öffentliche Ableitungen von V0.9 und V0.10 ohne lokale Pfadmetadaten. Keine Ersatzoriginale und kein Produktinput.
- `referenzen/`: byteidentische V0.11 und abgenommene V0.12. Der AP18C-Import liest nur die V0.12 aus diesem Ordner.
- `manifest.json`: festgeschriebene Zuordnung von ursprünglicher und archivierter Prüfsumme.
- `publication-manifest.json`: zusätzlicher, getrennt gepinnter Herkunfts- und Komponentenvergleich für die beiden Publikationskopien. Das ursprüngliche Manifest bleibt unverändert.
- `v09-drift-diagnostic.json` und `v10-drift-diagnostic.json`: erhaltene Diagnosebefunde. V0.10 enthält das geänderte Anzeigejahr 2028 und dessen korrekte Formelcaches.

[Archivbestätigung und Prüfgrenzen](../../../../docs/fachrecht/archivbestaetigung-ap18.md)

Die ursprünglichen Archivkopien wurden ohne erneutes Schreiben des XLSX-Pakets erstellt und byteweise geprüft. Für die nachfolgend ausdrücklich beschlossene Publikationsbereinigung wurde nur die Pfadmetadaten-Umhüllung in `xl/workbook.xml` entfernt und das Paket neu verpackt. Alle anderen unkomprimierten Bestandteile bleiben byteidentisch. Lokaler Dateischreibschutz ist keine revisionssichere Archivierung.

Der [Beschluss und genaue Nachtrag P01](../../../../docs/fachrecht/publikationskopien-ap18.md) trennt Original- und Publikationshashes. `npm run test:archive:ap18` prüft den öffentlichen Bestand ohne vorzutäuschen, die privaten Originale zu lesen. `npm run test:publication:ap18` ergänzt die Komponenten- und Ableitungsprüfungen. Die historischen Abweichungen bleiben ausdrücklich bestehen.
