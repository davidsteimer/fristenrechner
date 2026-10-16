# AP23A Abnahme der Bestandsaufnahme

Datum: 12. Oktober 2026. Entscheider: David Steimer.

David Steimer hat erklärt: **«Damit ist AP23A abgenommen.»** Die strukturelle Bestandsaufnahme der kantonalen Verwaltungsverfahren ist damit abgenommen. Nach der Gegenprüfung seiner ergänzenden Aussage zur Reichweite von Art. 39 VRG/GR hat er am selben Tag bestätigt: **«OK. Mein Fehler, ich habe die systematische Einordnung nicht beachtet.»** Damit ist auch die unten dokumentierte GR-Abgrenzung geklärt und AP23A abgeschlossen.

## Abgenommener Gegenstand

- Bestandsaufnahme der 25 übrigen Kantone mit Bern als Referenz, acht Prüfdimensionen je Kanton und 37 Hauptquelleneinträgen.
- Trennung von Verwaltungsverfahren und Verwaltungsgerichtsbarkeit, gesetzlichen und angeordneten Fristen, Kalenderbindung und Spezialrechtsgrenzen.
- Dokumentierter Quellen- und Fassungsstand einschliesslich der ausdrücklich offenen Fragen. Die Abnahme der Strukturgrundlage macht aus Teilbelegen keine vollständige Quellenprüfung.
- Vorgehen mit TI und GR als erster vertiefter Tranche sowie NW als begrenzter fachlicher Kontrastprobe, nicht als zusätzlicher Umsetzungstranche.
- Gesonderte Fachreferenzen, Vertragsentscheidung, Integration und spätere Releasefreigabe vor einer operativen Erweiterung.

Die 208 Befundzeilen sind weiterhin Prüfdimensionen, keine 208 produktiv freigegebenen Regeln. AP23B wird durch diese Abnahmenachführung noch nicht gestartet.

## Unveränderte Vorlage

Der vorgelegte Bericht und die Excel-Datei bleiben unverändert. Ihr damaliger Status «noch nicht fachlich abgenommen» bezeichnet den Vorlagestand. Für die aktuelle Abnahme ist diese Notiz massgebend.

| Gegenstand | SHA-256 |
| --- | --- |
| [AP23A Bestandsaufnahme V0.1](verwaltungsverfahren-ap23a.md) | `c31b36622774216c45448fbc3951b1518afeea23bf0d7047fbd1f17ff7ccaded` |
| [Arbeitsmappe V0.1](../../outputs/ap23a-2026-10-12/2026-10-12_Verwaltungsverfahren_Schweiz_AP23A_V0.1.xlsx) | `4d161b5ce441910461cc4092aa0ef3bb898d3390034901faa3acdab97fc3857e` |

Die Excel-Referenzkopie unter `outputs/ap23a-2026-10-12/referenz/` weist bei der Abnahmenachführung dieselbe Prüfsumme auf. Spätere Bemerkungen in der Arbeitskopie verändern diese Ausgangsreferenz nicht.

## GR Ergänzung und Gegenprüfung

David Steimer hat der Abnahme folgende Bemerkung vorangestellt:

> Art. 39 gilt für Gesetzliche bestimmte Fristen auch bei Verwaltungsbehörden.

Die Gegenprüfung vom 12. Oktober 2026 unterscheidet zwischen der Behörde, die einen Entscheid eröffnet, und der Instanz, bei der die fristgebundene Handlung vorzunehmen ist:

| Konstellation | Befund zur allgemeinen Regel des VRG |
| --- | --- |
| Gesetzliche Beschwerdefrist gegen einen Verwaltungsentscheid an das Obergericht | Grundsätzlich vom Stillstand nach Art. 39 erfasst, obwohl der Ausgangsentscheid von einer Verwaltungsbehörde stammt. Ausnahmen bleiben vorbehalten. |
| Gesetzliche Frist im erstinstanzlichen Verwaltungsverfahren oder im verwaltungsinternen Beschwerdeverfahren | Art. 39 begründet dafür keinen allgemeinen Stillstand. Besondere bundesrechtliche oder spezialgesetzliche Vorschriften sind getrennt zu prüfen. |
| Gerichtlich bestimmte Frist im Verfahren vor Obergericht | Grundsätzlich Art. 39, unter Vorbehalt seiner Ausnahmen und besonderer Rechtsvorschriften. |

**Tragende Normgrundlage:** Im [amtlichen VRG, BR 370.100, Fassung 1. Januar 2025](https://www.gr-lex.gr.ch/api/de/versions/3521/pdf_file), stehen Art. 26–37 im Kapitel über kantonale Verwaltungsbehörden. Art. 39 steht im Kapitel über das Verfahren vor Obergericht. Die Unterscheidung zwischen gesetzlichen und gerichtlich bestimmten Fristen erweitert diesen sachlichen Geltungsbereich nicht von sich aus.

**Rechtsprechung:** Das [Kantonsgericht Graubünden, SK2 10 7 vom 3. März 2010, E. 2c/bb, S. 5](https://entscheidsuche.ch/docs/GR_Gerichte/GR_KG_005_SK2-2010-7_2010-03-03.pdf), unterscheidet ausdrücklich zwischen Verwaltungsbeschwerde ohne Gerichtsferien und verwaltungsgerichtlichem Verfahren mit Art. 39 VRG. Der Entscheid behandelt einen Verweis der damaligen kantonalen Strafprozessordnung. Seine systematische Aussage zum VRG ist einschlägig, ersetzt aber keine Prüfung sämtlicher Spezialgesetze. Der Volltext wurde über Entscheidsuche geprüft, Swiss Caselaw ergänzend zur punktbezogenen Gegenprüfung berücksichtigt.

**Ergänzender Kontext:** Die amtlich publizierte [parlamentarische Initiative Metzger vom 2. September 2023](https://www.gr.ch/DE/institutionen/parlament/PV/Seiten/230902Metzger02.aspx) beschreibt dieselbe Trennung zwischen Verwaltungsbehörden beziehungsweise Regierung und Gericht. Das ist ein parlamentarischer Vorstoss, keine eigenständige Rechtsgrundlage und kein Nachweis einer erfolgten Gesetzesänderung.

### Bestätigte Präzisierung

Für die weitere Modellierung gilt nach der Bestätigung von David Steimer:

> Art. 39 VRG erfasst gesetzliche und gerichtlich bestimmte Fristen im Verfahren vor Obergericht. Dazu gehören grundsätzlich auch die gesetzlichen Beschwerdefristen gegen Entscheide von Verwaltungsbehörden an das Obergericht. Für Verfahren vor Verwaltungsbehörden besteht aus Art. 39 allein kein allgemeiner Stillstand. Spezialrecht und die Ausnahmen von Art. 39 Abs. 2 bleiben vorbehalten.

David Steimer hat die systematische Abgrenzung am 12. Oktober 2026 ausdrücklich anerkannt. Die zunächst weiter gefasste Bemerkung wird deshalb nicht als Regel übernommen. Für die Modellierung sind das Verfahren beziehungsweise die zuständige Rechtsmittelinstanz massgebend, nicht allein die Behörde, die den Ausgangsentscheid eröffnet hat. Dieser Klärungspunkt ist geschlossen. Die übrigen offenen Fachfragen der Bestandsaufnahme bleiben Gegenstand der späteren Vertiefung.

## Freigabegrenzen

Keine Änderung von Rechenlogik, maschinenlesbaren Produktrechtsdaten, Kalendern, Releases, E/Q/P oder historischen AP5-Pins. Keine neue operative Kantons- oder Sozialfreigabe. Keine Festlegung neuer Formatversionen. Kein Quellcommit oder GitHub-Push durch diese Abnahmenachführung.

Die bisherige GR-Gebietsgrenze und alle übrigen offengelegten Vorbehalte bleiben erhalten. Die vorliegende Abnahme betrifft das Arbeitspaket AP23A, nicht den Abschluss des übergeordneten [Ausbau-Issues #48](https://github.com/davidsteimer/fristenrechner/issues/48).

David Steimer nimmt Fachprüfung und Abnahme in Personalunion wahr. Codex dokumentiert die Erklärung und die Gegenprüfung als KI-Arbeitsinstrument ohne formelle Freigabe- oder Haftungsverantwortung.
