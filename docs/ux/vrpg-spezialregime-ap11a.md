# UX-Skizze für VRPG-Spezialregime

| Merkmal | Wert |
| --- | --- |
| Arbeitspaket | AP11A |
| Status | Funktionsskizze, noch keine UI-Implementierung |
| Sprachen | Deutsch und Französisch |

## 1. Leitidee

Der Normalfall bleibt schnell. Wer eine allgemeine VRPG-Frist berechnet, sieht weiterhin die bestehenden Kerneingaben. Zusätzliche Felder erscheinen nur, wenn ein Spezialregime sie verlangt. Der Rechner zeigt die automatisch gewählten Parameter und den Grund dafür sichtbar an.

## 2. Auswahl und progressive Eingaben

1. Gemeinwesen und Sitz der zuständigen Behörde bleiben die erste fachliche Auswahl.
2. Nach Auswahl von VRPG Bern erscheint neu das Feld `Fristtyp / Type de délai`.
3. Der Standardwert ist `Allgemeine VRPG-Frist / Délai général selon la LPJA`.
4. Bei einem Spezialregime werden nur dessen typisierte Anker eingeblendet.

| Rechenart | Zusätzliche Eingaben Deutsch | Zusätzliche Eingaben Französisch |
| --- | --- | --- |
| R1 | fristauslösendes Datum, bei dynamischen Regeln zusätzlich Frist in Tagen | date déterminante, pour les règles dynamiques délai en jours en plus |
| R2 | Wahl- oder Abstimmungstag | jour de l'élection ou de la votation |
| R3 | Datum des ersten Wahlgangs | date du premier tour |
| R4 | Kenntnisdatum, Publikationsdatum, allenfalls Urnengang | date de connaissance, date de publication, éventuellement scrutin |
| R5 | festgelegtes Datum, Uhrzeit, Quelle der Anordnung | date fixée, heure, source de l'acte officiel |

## 3. Automatisch bestimmte Parameter

Unter dem Ergebnis zeigt eine kompakte Zeile:

```text
Angewendet: Art. 111 Abs. 1a PRG · erster Donnerstag nach dem 1. Wahlgang · Originaleingang bis 12.00 Uhr · kein Fristenstillstand
```

Französisch:

```text
Appliqué: art. 111, al. 1a LDP · premier jeudi après le 1er tour · réception de l'original jusqu'à 12 h 00 · aucune suspension
```

Die Anzeige trennt mindestens:

- provisorisches Fristende
- endgültiges Fristende nach Verschiebung
- Uhrzeit und Zeitzone, sofern vorhanden
- Art der Fristwahrung
- Kalender und Fristenstillstand
- Warnung oder Sperre mit Quelle

## 4. Zustände und Meldungen

### Unterstützt

Deutsch: `Die Spezialfrist wurde berechnet. Für die Wahrung ist der Originaleingang bis 12.00 Uhr massgebend.`

Französisch: `Le délai spécial a été calculé. La réception de l'original jusqu'à 12 h 00 est déterminante.`

### Manuelle Kontrolle

Deutsch: `Termin berechnet. Bitte mit der aktuellen Wahl- oder Abstimmungsanordnung abgleichen.`

Französisch: `Date calculée. Veuillez la vérifier dans l'acte actuel relatif à l'élection ou à la votation.`

### Offene Voraussetzung

Deutsch: `Das konkrete Datum wird von der zuständigen Behörde festgelegt. Ohne amtliche Anordnung ist keine verlässliche Berechnung möglich.`

Französisch: `La date concrète est fixée par l'autorité compétente. Aucun calcul fiable n'est possible sans acte officiel.`

### Gesperrte Regel

Deutsch: `Diese Spezialregel kann nicht berechnet werden. Die gesetzliche Referenz ist leer, aufgehoben oder ausserhalb des unterstützten Fristentyps.`

Französisch: `Ce régime spécial ne peut pas être calculé. La référence légale est vide, abrogée ou hors du type de délai pris en charge.`

### Vorbereitungshandlung

Deutsch: `Achtung: Diese Vorbereitungshandlung ist sofort anzufechten. Die ordentliche Frist endet nicht erst nach dem Urnengang.`

Französisch: `Attention: cet acte préparatoire doit être attaqué immédiatement. Le délai ordinaire n'échoit pas après le scrutin.`

## 5. Übersteuerung

Eine Übersteuerung ist nur bei einer dafür vorgesehenen Komponente zulässig. Die App zeigt vorherigen Wert, neuen Wert, Begründung und Quelle. Gesperrte Regime können nicht übersteuert werden. Ein Feld «Trotzdem rechnen» wäre zwar mutig, aber bei Rechtsmittelfristen keine Tugend.

## 6. Abgrenzung AP11A

AP11A legt Eingabevertrag, Sichtbarkeit und Meldungstexte fest. Die produktive Umsetzung, Lokalisierung im Code, Barrierefreiheitsprüfung und visuelle Abnahme erfolgen in AP11B und AP11C.
