# Sicherheitsrichtlinie

## Unterstützte Fassungen

Es gibt noch keinen veröffentlichten Produktrelease. Bis zum ersten Release wird ausschliesslich der aktuelle Stand von `main` sicherheitstechnisch gepflegt. Danach wird mindestens die neueste veröffentlichte Hauptfassung unterstützt. Abweichungen werden hier und in den Release Notes genannt.

| Fassung | Unterstützt |
| --- | --- |
| `main` vor dem ersten Release | Ja |
| Unveröffentlichte ältere Stände | Nein |

## Sicherheitslücke vertraulich melden

Bitte veröffentliche vermutete Sicherheitslücken, Zugangsdaten oder ausnutzbare technische Einzelheiten nicht in einem GitHub Issue.

Meldungen gehen an:

**David Steimer**

E-Mail: `david@steimer.ch`

Betreff: `Sicherheitsmeldung Fristenrechner`

Eine gute Meldung enthält:

- betroffene Version, Commit oder Datenrelease-ID
- nachvollziehbare Beschreibung und mögliche Auswirkung
- erforderliche Voraussetzungen
- Schritte zur Reproduktion oder einen ungefährlichen Nachweis
- bekannte Abhilfen oder Begrenzungen
- gewünschte Form der Namensnennung

Es werden keine echten Fall- oder Personendaten benötigt. Bitte entferne solche Daten vor der Übermittlung.

## Ablauf

Der Eingang soll innerhalb von fünf Arbeitstagen bestätigt werden. Innerhalb von zehn weiteren Arbeitstagen soll eine erste Einschätzung oder eine Rückfrage folgen. Diese Zeitangaben sind Zielwerte und keine garantierte Servicevereinbarung.

Bestätigte Lücken werden nach Risiko priorisiert. Veröffentlichung, Korrektur und allfällige Warnung werden so koordiniert, dass Benutzerinnen und Benutzer angemessen geschützt sind. Ein finanzielles Bug-Bounty-Programm besteht nicht.

## Relevante Sicherheitsthemen

Besonders relevant sind:

- Manipulation von Regel-, Feiertags- oder Releasedaten
- Umgehung von Schema-, Signatur- oder Prüfsummenprüfungen
- Cross-Site-Scripting oder unsichere HTML-Verarbeitung
- Offenlegung von Geheimnissen oder tenantinternen Informationen
- unerwartete Datenspeicherung oder Übermittlung von Benutzereingaben
- unsichere Abhängigkeiten und kompromittierte Build- oder Releasewege
- unzulässige Erweiterung von SharePoint- oder Teams-Berechtigungen

Ein fachlich falsches Fristende ist grundsätzlich ein Fachfehler und keine Sicherheitslücke. Wenn eine systematische Manipulation, ein Integritätsproblem oder eine erhebliche Gefährdung dahintersteht, ist die vertrauliche Sicherheitsmeldung dennoch der richtige Weg.

## Offenlegung

Das Projekt bevorzugt koordinierte Offenlegung. Details sollen erst veröffentlicht werden, wenn eine Korrektur oder eine angemessene Schutzmassnahme verfügbar ist. Die meldende Person erhält nach Möglichkeit Gelegenheit, die Beschreibung vor einer gemeinsamen Veröffentlichung zu prüfen.
