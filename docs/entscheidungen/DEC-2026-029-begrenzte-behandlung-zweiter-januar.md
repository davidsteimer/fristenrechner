---
id: DEC-2026-029
titel: "Ergebnisabhängig begrenzte Behandlung des 2. Januar"
status: beschlossen
entscheidungsdatum: 2026-10-08
klasse: A
entschieden_durch: David Steimer
quelle:
  - "Ausdrückliche Bestätigung im Projektgespräch vom 8. Oktober 2026"
  - "AP22A-Abschlussvorlage und Arbeitsmatrix V0.2 vom 2. Oktober 2026"
ersetzt: []
ersetzt_durch: null
---

# DEC-2026-029 Ergebnisabhängig begrenzte Behandlung des 2. Januar

## Ausgangslage

Die fachliche Freigabe der Kalenderzuordnungen gemäss [DEC-2026-028](DEC-2026-028-operative-freigabe-kalenderzuordnungen.md) ist erteilt. Die AP22A-Abschlussprüfung hat vier verbleibende Unsicherheiten zur Anerkennung des 2. Januar eingegrenzt. Die übrigen Auswahlregeln sind bestimmt. Gegenstand dieses Entscheids ist die Produktbehandlung dieser Unsicherheit, nicht eine verbindliche rechtliche Klärung des Feiertagsstatus.

## Geprüfte Optionen

1. Den 2. Januar aufgrund einer ausdrücklich übernommenen Auslegung stets als Feiertag berücksichtigen.
2. Eine Einzelfallklärung nur verlangen, wenn die unterschiedliche Behandlung des 2. Januar das Ergebnis tatsächlich verändert. Die Kombinationen bleiben im übrigen bestätigten Umfang verwendbar.

Eine stille Festlegung auf den kürzeren Termin oder eine pauschale Sperre des ganzen Kantons ist nicht Bestandteil der gewählten Lösung.

## Entscheid

David Steimer hat am 8. Oktober 2026 erklärt:

> Ja, wir können diese begrenzte Behandlung des 2. Januar so festhalten.

Damit ist **Option 2 beschlossen**, ausschliesslich für diese vier Verbindungen:

| Massgebender Feiertagskanton | Verfahren | Zuordnung der Abschlussmatrix |
| --- | --- | --- |
| Schaffhausen | StPO | `AP22-SH-ZPO-ADDITIONAL-STPO` |
| St. Gallen | StPO | `AP22-SG-ZPO-ADDITIONAL-STPO` |
| St. Gallen | BGG | `AP22-SG-ZPO-ADDITIONAL-BGG` |
| St. Gallen | VwVG | `AP22-SG-ZPO-ADDITIONAL-VWVG` |

Für die Umsetzung gilt:

- Die übrigen bestätigten Kalenderregeln bleiben verwendbar.
- Ändert die Berücksichtigung gegenüber der Nichtberücksichtigung des 2. Januar das rechtlich relevante Berechnungsergebnis, verlangt die App eine Einzelfallklärung und gibt **kein definitives automatisches Fristresultat** aus.
- Die Prüfung umfasst auch den Fall, dass eine Endtagsverschiebung erst auf den 2. Januar trifft. Sie ist nicht auf ein ursprünglich nominelles Fristende am 2. Januar beschränkt.
- Führen beide Behandlungen zum gleichen Ergebnis, entsteht aus dieser Unsicherheit keine Sperre. Das betrifft insbesondere Konstellationen, in denen Wochenende oder andere anwendbare Regeln den Unterschied aufheben.
- Die Begrenzung hängt am rechtlich massgebenden Feiertagskalender, nicht allein am Sitz der Behörde. Sie ist knapp in der Oberfläche und nachvollziehbar in der Rechenspur auszuweisen.
- Die vorhandenen SG-/SH-ZPO-Zuordnungen werden nicht geändert. Die beiden SH-Verbindungen zu BGG und VwVG bleiben gemäss Abschlussmatrix bestimmt.

**AP22A ist damit abgeschlossen.** Es ist keine weitere pauschale Abnahme desselben Umfangs erforderlich. Der bisherige Entscheid DEC-2026-028 wird ergänzt, nicht ersetzt.

## Begründung

Die Unsicherheit wird dort offengelegt, wo sie eine Fristberechnung beeinflusst. Für nicht betroffene Fälle bleibt die bestätigte Funktionalität verfügbar. Das Produkt behauptet weder einen sicher geltenden Feiertag noch einen sicher geltenden Werktag, solange diese Alternative für das konkrete Ergebnis offen ist.

## Folgen

### Auswirkungen

Die vier Matrixzeilen erhalten den Status «Ergebnisabhängig begrenzt» und den vorliegenden Freigabenachweis. Die Abschlussmatrix wird separat als V1.0 gebunden. V0.1, V0.2, Benutzerbemerkungen, die 20 negativen Verwendungsentscheide und die vier GR-Abgrenzungen bleiben erhalten.

### Risiken und Grenzen

Die Rechtsunsicherheit selbst ist nicht beseitigt. Bei einem betroffenen Fall bleibt die fachliche Einzelfallprüfung erforderlich. Die bisher dokumentierten Quellenprüfungen und technischen Nachweise stammen vom 2. Oktober 2026. Dieser Entscheid ist keine neue Quellenprüfung und keine Behauptung einer schon implementierten oder getesteten Laufzeitbegrenzung.

Neue Produktformate, Datenpromotion, Bereitstellung und Publikation sind nicht freigegeben. AP22B ist der nächste Schritt für den konkreten Daten- und Migrationsvertrag und wird mit diesem Entscheid nicht automatisch gestartet. Der laufende MVP-0.6-Betrieb bleibt unverändert.

### Folgearbeiten und Rückabwicklung

AP22B bindet diese Ergebniskontrolle in den konkreten Vertrag und die Referenzfälle ein. Die anschliessende Umsetzung muss sowohl ergebnisverändernde Fälle als auch Fälle ohne Ergebnisunterschied prüfen. Eine spätere Änderung der materiellen Behandlung erfolgt durch einen neuen Entscheid mit Nachweis der dafür massgebenden Grundlage.

## Nachweise

- [Fachlicher Hintergrund und geprüfte Optionen](../fachrecht/ap22a-weitere-prozesslisten.md#vier-eng-begrenzte-grenzfälle).
- [AP22A-Abschlussnachweis](../fachrecht/abschluss-ap22a.md).
- [Abschlussmatrix V1.0](../../outputs/ap22a-abnahme-2026-10-08/2026-10-08_Verfahrens-und-Gebietsmatrix_AP22A_V1.0.xlsx) und [strukturierter Abschlussstand](../../outputs/ap22a-abnahme-2026-10-08/matrix-data-v10.json).
- Gebundene Vorlage V0.2: SHA-256 `25bf4999d63a3b2fabefe74bcd621e933c6bebed92d05ff9884cf200a0322c84`. Zugehörige Matrixdaten: SHA-256 `5c7d8a6684a2ce018a3636e41bb2664d67d675e109ab25dd6e9f99bcc562cf2d`.
- Führendes Arbeitspaket: [Issue #46](https://github.com/davidsteimer/fristenrechner/issues/46). Der lokale Abschluss ist von einer späteren GitHub-Nachführung getrennt.

## Verantwortlichkeit

Entschieden durch David Steimer. Codex dokumentiert und prüft die Umsetzung dieses Dokumentationsauftrags ohne formelle Freigabe- oder Haftungsverantwortung.
