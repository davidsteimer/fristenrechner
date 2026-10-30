// SPDX-License-Identifier: AGPL-3.0-only
// Accepted H2 meanings. Actual H3 bytes are not release authority.
export const FORMAT12_HOLIDAY_CONTENT_SHA256 = "1dc2394b445ccc5ad06e4e2a468b4c4acba2e0543c694da2cfa650f524351c1f";
export const FORMAT12_HOLIDAY_NATIVE_SHA256 = "d63f736398e087883b6332038ec5d00144b81fecd49c21e6cbfa9b08838b2ac9";
export const FORMAT12_SOURCE_PROVENANCES = {
  "SRC-AP23H1-OW-GOG-20220401": [
    "784c48db949cd9d36922908c33d9162d8280570cc1a2dc1b064a81e764d721ac",
    "be94ca3f6559bcd5875e9db10921f1dad2883a8afef38d10903ff2c5ca7a3039"
  ],
  "SRC-AP23H1-NW-VRG-20260801": [
    "5106b1f608b87af63a9995a23699e93ca1a9383b9557140c0b59f297fbdbe9a1",
    "c14b8257afdbc4829412569825aa5d3f5a9869493e4890095e4e26eaa1ba8452"
  ]
} as const;
export const FORMAT12_CALENDAR_TEMPLATES = [
  {
    "$schema": "https://raw.githubusercontent.com/davidsteimer/fristenrechner/main/schemas/calendar-rules-v3.schema.json",
    "formatVersion": "3.0.0",
    "dataKind": "calendar",
    "calendarId": "ap22-ag-21d6f2634ce0",
    "jurisdiction": {
      "level": "cantonal",
      "code": "AG"
    },
    "validity": {
      "from": "2026-08-29",
      "to": null
    },
    "inherits": [
      "ch-federal-calendar"
    ],
    "review": {
      "reviewedOn": "2026-10-08",
      "status": "candidate",
      "reviewedBy": "Codex",
      "basis": "AP22C1 Datenkandidat auf Grundlage von DEC-2026-030. Keine Quellen- oder Betriebsfreigabe."
    },
    "sources": [
      {
        "sourceId": "SRC-AG-EGZPO",
        "sourceType": "officialDossier",
        "title": "Einführungsgesetz zur Schweizerischen Zivilprozessordnung",
        "authority": "CH-AG",
        "url": "https://gesetzessammlungen.ag.ch/app/de/texts_of_law/221.200",
        "documentVersionDate": "2022-01-01",
        "reviewedOn": "2026-09-13",
        "reviewStatus": "monitored"
      }
    ],
    "rules": [
      {
        "ruleId": "AG-CAL-AG-PROC-DAY-ALL-SAINTS-21D6F2634CE071E9",
        "calendarId": "ap22-ag-21d6f2634ce0",
        "jurisdiction": {
          "level": "cantonal",
          "code": "AG"
        },
        "labelKey": "holiday.ag.AG-PROC-DAY-ALL-SAINTS",
        "labels": {
          "de": "Allerheiligen",
          "fr": "Toussaint"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-AG-EGZPO",
            "locator": "§ 21"
          }
        ],
        "calculation": {
          "type": "fixedMonthDay",
          "month": 11,
          "day": 1
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "proceduralEquivalentDay",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "AG-PROC-DAY-ALL-SAINTS"
        }
      },
      {
        "ruleId": "AG-CAL-AG-PROC-DAY-ASCENSION-21D6F2634CE071E9",
        "calendarId": "ap22-ag-21d6f2634ce0",
        "jurisdiction": {
          "level": "cantonal",
          "code": "AG"
        },
        "labelKey": "holiday.ag.AG-PROC-DAY-ASCENSION",
        "labels": {
          "de": "Auffahrt",
          "fr": "Ascension"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-AG-EGZPO",
            "locator": "§ 21"
          }
        ],
        "calculation": {
          "type": "easterOffsetDays",
          "offsetDays": 39
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "proceduralEquivalentDay",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "AG-PROC-DAY-ASCENSION"
        }
      },
      {
        "ruleId": "AG-CAL-AG-PROC-DAY-ASSUMPTION-21D6F2634CE071E9",
        "calendarId": "ap22-ag-21d6f2634ce0",
        "jurisdiction": {
          "level": "cantonal",
          "code": "AG"
        },
        "labelKey": "holiday.ag.AG-PROC-DAY-ASSUMPTION",
        "labels": {
          "de": "Mariä Himmelfahrt",
          "fr": "Assomption"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-AG-EGZPO",
            "locator": "§ 21"
          }
        ],
        "calculation": {
          "type": "fixedMonthDay",
          "month": 8,
          "day": 15
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "proceduralEquivalentDay",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "AG-PROC-DAY-ASSUMPTION"
        }
      },
      {
        "ruleId": "AG-CAL-AG-PROC-DAY-BERCHTOLD-21D6F2634CE071E9",
        "calendarId": "ap22-ag-21d6f2634ce0",
        "jurisdiction": {
          "level": "cantonal",
          "code": "AG"
        },
        "labelKey": "holiday.ag.AG-PROC-DAY-BERCHTOLD",
        "labels": {
          "de": "Berchtoldstag",
          "fr": "Saint-Berchtold"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-AG-EGZPO",
            "locator": "§ 21"
          }
        ],
        "calculation": {
          "type": "fixedMonthDay",
          "month": 1,
          "day": 2
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "proceduralEquivalentDay",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "AG-PROC-DAY-BERCHTOLD"
        }
      },
      {
        "ruleId": "AG-CAL-AG-PROC-DAY-CHRISTMAS-21D6F2634CE071E9",
        "calendarId": "ap22-ag-21d6f2634ce0",
        "jurisdiction": {
          "level": "cantonal",
          "code": "AG"
        },
        "labelKey": "holiday.ag.AG-PROC-DAY-CHRISTMAS",
        "labels": {
          "de": "Weihnachten",
          "fr": "Noël"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-AG-EGZPO",
            "locator": "§ 21"
          }
        ],
        "calculation": {
          "type": "fixedMonthDay",
          "month": 12,
          "day": 25
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "proceduralEquivalentDay",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "AG-PROC-DAY-CHRISTMAS"
        }
      },
      {
        "ruleId": "AG-CAL-AG-PROC-DAY-CORPUS-CHRISTI-21D6F2634CE071E9",
        "calendarId": "ap22-ag-21d6f2634ce0",
        "jurisdiction": {
          "level": "cantonal",
          "code": "AG"
        },
        "labelKey": "holiday.ag.AG-PROC-DAY-CORPUS-CHRISTI",
        "labels": {
          "de": "Fronleichnam",
          "fr": "Fête-Dieu"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-AG-EGZPO",
            "locator": "§ 21"
          }
        ],
        "calculation": {
          "type": "easterOffsetDays",
          "offsetDays": 60
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "proceduralEquivalentDay",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "AG-PROC-DAY-CORPUS-CHRISTI"
        }
      },
      {
        "ruleId": "AG-CAL-AG-PROC-DAY-EASTER-MONDAY-21D6F2634CE071E9",
        "calendarId": "ap22-ag-21d6f2634ce0",
        "jurisdiction": {
          "level": "cantonal",
          "code": "AG"
        },
        "labelKey": "holiday.ag.AG-PROC-DAY-EASTER-MONDAY",
        "labels": {
          "de": "Ostermontag",
          "fr": "Lundi de Pâques"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-AG-EGZPO",
            "locator": "§ 21"
          }
        ],
        "calculation": {
          "type": "easterOffsetDays",
          "offsetDays": 1
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "proceduralEquivalentDay",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "AG-PROC-DAY-EASTER-MONDAY"
        }
      },
      {
        "ruleId": "AG-CAL-AG-PROC-DAY-GOOD-FRIDAY-21D6F2634CE071E9",
        "calendarId": "ap22-ag-21d6f2634ce0",
        "jurisdiction": {
          "level": "cantonal",
          "code": "AG"
        },
        "labelKey": "holiday.ag.AG-PROC-DAY-GOOD-FRIDAY",
        "labels": {
          "de": "Karfreitag",
          "fr": "Vendredi saint"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-AG-EGZPO",
            "locator": "§ 21"
          }
        ],
        "calculation": {
          "type": "easterOffsetDays",
          "offsetDays": -2
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "proceduralEquivalentDay",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "AG-PROC-DAY-GOOD-FRIDAY"
        }
      },
      {
        "ruleId": "AG-CAL-AG-PROC-DAY-IMMACULATE-CONCEPTION-21D6F2634CE071E9",
        "calendarId": "ap22-ag-21d6f2634ce0",
        "jurisdiction": {
          "level": "cantonal",
          "code": "AG"
        },
        "labelKey": "holiday.ag.AG-PROC-DAY-IMMACULATE-CONCEPTION",
        "labels": {
          "de": "Mariä Empfängnis",
          "fr": "Immaculée Conception"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-AG-EGZPO",
            "locator": "§ 21"
          }
        ],
        "calculation": {
          "type": "fixedMonthDay",
          "month": 12,
          "day": 8
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "proceduralEquivalentDay",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "AG-PROC-DAY-IMMACULATE-CONCEPTION"
        }
      },
      {
        "ruleId": "AG-CAL-AG-PROC-DAY-MAY1-21D6F2634CE071E9",
        "calendarId": "ap22-ag-21d6f2634ce0",
        "jurisdiction": {
          "level": "cantonal",
          "code": "AG"
        },
        "labelKey": "holiday.ag.AG-PROC-DAY-MAY1",
        "labels": {
          "de": "Tag der Arbeit (1. Mai)",
          "fr": "Fête du travail (1er mai)"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-AG-EGZPO",
            "locator": "§ 21"
          }
        ],
        "calculation": {
          "type": "fixedMonthDay",
          "month": 5,
          "day": 1
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "proceduralEquivalentDay",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "AG-PROC-DAY-MAY1"
        }
      },
      {
        "ruleId": "AG-CAL-AG-PROC-DAY-NATIONAL-DAY-21D6F2634CE071E9",
        "calendarId": "ap22-ag-21d6f2634ce0",
        "jurisdiction": {
          "level": "cantonal",
          "code": "AG"
        },
        "labelKey": "holiday.ag.AG-PROC-DAY-NATIONAL-DAY",
        "labels": {
          "de": "Bundesfeiertag",
          "fr": "Fête nationale"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-AG-EGZPO",
            "locator": "§ 21"
          }
        ],
        "calculation": {
          "type": "fixedMonthDay",
          "month": 8,
          "day": 1
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "proceduralEquivalentDay",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "AG-PROC-DAY-NATIONAL-DAY"
        }
      },
      {
        "ruleId": "AG-CAL-AG-PROC-DAY-NEW-YEAR-21D6F2634CE071E9",
        "calendarId": "ap22-ag-21d6f2634ce0",
        "jurisdiction": {
          "level": "cantonal",
          "code": "AG"
        },
        "labelKey": "holiday.ag.AG-PROC-DAY-NEW-YEAR",
        "labels": {
          "de": "Neujahr",
          "fr": "Nouvel An"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-AG-EGZPO",
            "locator": "§ 21"
          }
        ],
        "calculation": {
          "type": "fixedMonthDay",
          "month": 1,
          "day": 1
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "proceduralEquivalentDay",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "AG-PROC-DAY-NEW-YEAR"
        }
      },
      {
        "ruleId": "AG-CAL-AG-PROC-DAY-ST-STEPHEN-21D6F2634CE071E9",
        "calendarId": "ap22-ag-21d6f2634ce0",
        "jurisdiction": {
          "level": "cantonal",
          "code": "AG"
        },
        "labelKey": "holiday.ag.AG-PROC-DAY-ST-STEPHEN",
        "labels": {
          "de": "Stephanstag",
          "fr": "Saint-Étienne"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-AG-EGZPO",
            "locator": "§ 21"
          }
        ],
        "calculation": {
          "type": "fixedMonthDay",
          "month": 12,
          "day": 26
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "proceduralEquivalentDay",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "AG-PROC-DAY-ST-STEPHEN"
        }
      },
      {
        "ruleId": "AG-CAL-AG-PROC-DAY-WHIT-MONDAY-21D6F2634CE071E9",
        "calendarId": "ap22-ag-21d6f2634ce0",
        "jurisdiction": {
          "level": "cantonal",
          "code": "AG"
        },
        "labelKey": "holiday.ag.AG-PROC-DAY-WHIT-MONDAY",
        "labels": {
          "de": "Pfingstmontag",
          "fr": "Lundi de Pentecôte"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-AG-EGZPO",
            "locator": "§ 21"
          }
        ],
        "calculation": {
          "type": "easterOffsetDays",
          "offsetDays": 50
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "proceduralEquivalentDay",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "AG-PROC-DAY-WHIT-MONDAY"
        }
      }
    ],
    "projection": {
      "catalogId": "ch-holiday-catalog",
      "catalogFormatVersion": "2.0.0",
      "projectionId": "projection-21d6f2634ce071e9",
      "sourceHash": "c5701e47df0d07bb288719b26d55c31b84fe83ea539578d9192e292e08602570"
    }
  },
  {
    "$schema": "https://raw.githubusercontent.com/davidsteimer/fristenrechner/main/schemas/calendar-rules-v3.schema.json",
    "formatVersion": "3.0.0",
    "dataKind": "calendar",
    "calendarId": "ap22-ai-5d4e5a68e106",
    "jurisdiction": {
      "level": "cantonal",
      "code": "AI"
    },
    "validity": {
      "from": "2026-08-29",
      "to": null
    },
    "inherits": [
      "ch-federal-calendar"
    ],
    "review": {
      "reviewedOn": "2026-10-08",
      "status": "candidate",
      "reviewedBy": "Codex",
      "basis": "AP22C1 Datenkandidat auf Grundlage von DEC-2026-030. Keine Quellen- oder Betriebsfreigabe."
    },
    "sources": [
      {
        "sourceId": "SRC-AI-RTG-822200-V1327",
        "sourceType": "officialDossier",
        "title": "Gesetz über die öffentlichen Ruhetage, Ruhetagsgesetz",
        "authority": "CH-AI",
        "url": "https://ai.clex.ch/api/de/versions/1327/pdf_file",
        "documentVersionDate": "2011-01-01",
        "reviewedOn": "2026-09-22",
        "reviewStatus": "monitored"
      },
      {
        "sourceId": "SRC-BUNDESFEIERTAG-19940701",
        "sourceType": "officialDossier",
        "title": "Verordnung über den Bundesfeiertag, SR 116",
        "authority": "CH",
        "url": "https://www.fedlex.admin.ch/eli/cc/1994/1340_1340_1340/de",
        "documentVersionDate": "1994-07-01",
        "reviewedOn": "2026-09-13",
        "reviewStatus": "monitored"
      }
    ],
    "rules": [
      {
        "ruleId": "AI-CAL-AI-RTG-ALL-DAY-ALL-SAINTS-5D4E5A68E106D2A4",
        "calendarId": "ap22-ai-5d4e5a68e106",
        "jurisdiction": {
          "level": "cantonal",
          "code": "AI"
        },
        "labelKey": "holiday.ai.AI-RTG-ALL-DAY-ALL-SAINTS",
        "labels": {
          "de": "Allerheiligen",
          "fr": "Toussaint"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-AI-RTG-822200-V1327",
            "locator": "Art. 2 Abs. 1 Bst. b und c sowie Art. 3"
          }
        ],
        "calculation": {
          "type": "fixedMonthDay",
          "month": 11,
          "day": 1
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "AI-RTG-ALL-DAY-ALL-SAINTS"
        }
      },
      {
        "ruleId": "AI-CAL-AI-RTG-ALL-DAY-ASCENSION-5D4E5A68E106D2A4",
        "calendarId": "ap22-ai-5d4e5a68e106",
        "jurisdiction": {
          "level": "cantonal",
          "code": "AI"
        },
        "labelKey": "holiday.ai.AI-RTG-ALL-DAY-ASCENSION",
        "labels": {
          "de": "Auffahrt",
          "fr": "Ascension"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-AI-RTG-822200-V1327",
            "locator": "Art. 2 Abs. 1 Bst. b und c sowie Art. 3"
          }
        ],
        "calculation": {
          "type": "easterOffsetDays",
          "offsetDays": 39
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "AI-RTG-ALL-DAY-ASCENSION"
        }
      },
      {
        "ruleId": "AI-CAL-AI-RTG-ALL-DAY-ASSUMPTION-5D4E5A68E106D2A4",
        "calendarId": "ap22-ai-5d4e5a68e106",
        "jurisdiction": {
          "level": "cantonal",
          "code": "AI"
        },
        "labelKey": "holiday.ai.AI-RTG-ALL-DAY-ASSUMPTION",
        "labels": {
          "de": "Mariä Himmelfahrt",
          "fr": "Assomption"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-AI-RTG-822200-V1327",
            "locator": "Art. 2 Abs. 1 Bst. b und c sowie Art. 3"
          }
        ],
        "calculation": {
          "type": "fixedMonthDay",
          "month": 8,
          "day": 15
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "AI-RTG-ALL-DAY-ASSUMPTION"
        }
      },
      {
        "ruleId": "AI-CAL-AI-RTG-ALL-DAY-CHRISTMAS-5D4E5A68E106D2A4",
        "calendarId": "ap22-ai-5d4e5a68e106",
        "jurisdiction": {
          "level": "cantonal",
          "code": "AI"
        },
        "labelKey": "holiday.ai.AI-RTG-ALL-DAY-CHRISTMAS",
        "labels": {
          "de": "Weihnachten",
          "fr": "Noël"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-AI-RTG-822200-V1327",
            "locator": "Art. 2 Abs. 1 Bst. b und c sowie Art. 3"
          }
        ],
        "calculation": {
          "type": "fixedMonthDay",
          "month": 12,
          "day": 25
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "AI-RTG-ALL-DAY-CHRISTMAS"
        }
      },
      {
        "ruleId": "AI-CAL-AI-RTG-ALL-DAY-CORPUS-CHRISTI-5D4E5A68E106D2A4",
        "calendarId": "ap22-ai-5d4e5a68e106",
        "jurisdiction": {
          "level": "cantonal",
          "code": "AI"
        },
        "labelKey": "holiday.ai.AI-RTG-ALL-DAY-CORPUS-CHRISTI",
        "labels": {
          "de": "Fronleichnam",
          "fr": "Fête-Dieu"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-AI-RTG-822200-V1327",
            "locator": "Art. 2 Abs. 1 Bst. b und c sowie Art. 3"
          }
        ],
        "calculation": {
          "type": "easterOffsetDays",
          "offsetDays": 60
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "AI-RTG-ALL-DAY-CORPUS-CHRISTI"
        }
      },
      {
        "ruleId": "AI-CAL-AI-RTG-ALL-DAY-EASTER-5D4E5A68E106D2A4",
        "calendarId": "ap22-ai-5d4e5a68e106",
        "jurisdiction": {
          "level": "cantonal",
          "code": "AI"
        },
        "labelKey": "holiday.ai.AI-RTG-ALL-DAY-EASTER",
        "labels": {
          "de": "Ostern",
          "fr": "Pâques"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-AI-RTG-822200-V1327",
            "locator": "Art. 2 Abs. 1 Bst. b und c sowie Art. 3"
          }
        ],
        "calculation": {
          "type": "easterOffsetDays",
          "offsetDays": 0
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "AI-RTG-ALL-DAY-EASTER"
        }
      },
      {
        "ruleId": "AI-CAL-AI-RTG-ALL-DAY-EASTER-MONDAY-5D4E5A68E106D2A4",
        "calendarId": "ap22-ai-5d4e5a68e106",
        "jurisdiction": {
          "level": "cantonal",
          "code": "AI"
        },
        "labelKey": "holiday.ai.AI-RTG-ALL-DAY-EASTER-MONDAY",
        "labels": {
          "de": "Ostermontag",
          "fr": "Lundi de Pâques"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-AI-RTG-822200-V1327",
            "locator": "Art. 2 Abs. 1 Bst. b und c sowie Art. 3"
          }
        ],
        "calculation": {
          "type": "easterOffsetDays",
          "offsetDays": 1
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "AI-RTG-ALL-DAY-EASTER-MONDAY"
        }
      },
      {
        "ruleId": "AI-CAL-AI-RTG-ALL-DAY-FEDERAL-FAST-5D4E5A68E106D2A4",
        "calendarId": "ap22-ai-5d4e5a68e106",
        "jurisdiction": {
          "level": "cantonal",
          "code": "AI"
        },
        "labelKey": "holiday.ai.AI-RTG-ALL-DAY-FEDERAL-FAST",
        "labels": {
          "de": "Eidgenössischer Dank-, Buss- und Bettag",
          "fr": "Jeûne fédéral"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-AI-RTG-822200-V1327",
            "locator": "Art. 2 Abs. 1 Bst. b und c sowie Art. 3"
          }
        ],
        "calculation": {
          "type": "nthWeekdayOfMonth",
          "month": 9,
          "isoWeekday": 7,
          "occurrence": 3
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "AI-RTG-ALL-DAY-FEDERAL-FAST"
        }
      },
      {
        "ruleId": "AI-CAL-AI-RTG-ALL-DAY-GOOD-FRIDAY-5D4E5A68E106D2A4",
        "calendarId": "ap22-ai-5d4e5a68e106",
        "jurisdiction": {
          "level": "cantonal",
          "code": "AI"
        },
        "labelKey": "holiday.ai.AI-RTG-ALL-DAY-GOOD-FRIDAY",
        "labels": {
          "de": "Karfreitag",
          "fr": "Vendredi saint"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-AI-RTG-822200-V1327",
            "locator": "Art. 2 Abs. 1 Bst. b und c sowie Art. 3"
          }
        ],
        "calculation": {
          "type": "easterOffsetDays",
          "offsetDays": -2
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "AI-RTG-ALL-DAY-GOOD-FRIDAY"
        }
      },
      {
        "ruleId": "AI-CAL-AI-RTG-ALL-DAY-IMMACULATE-CONCEPTION-5D4E5A68E106D2A4",
        "calendarId": "ap22-ai-5d4e5a68e106",
        "jurisdiction": {
          "level": "cantonal",
          "code": "AI"
        },
        "labelKey": "holiday.ai.AI-RTG-ALL-DAY-IMMACULATE-CONCEPTION",
        "labels": {
          "de": "Mariä Empfängnis",
          "fr": "Immaculée Conception"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-AI-RTG-822200-V1327",
            "locator": "Art. 2 Abs. 1 Bst. b und c sowie Art. 3"
          }
        ],
        "calculation": {
          "type": "fixedMonthDay",
          "month": 12,
          "day": 8
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "AI-RTG-ALL-DAY-IMMACULATE-CONCEPTION"
        }
      },
      {
        "ruleId": "AI-CAL-AI-RTG-ALL-DAY-NATIONAL-DAY-5D4E5A68E106D2A4",
        "calendarId": "ap22-ai-5d4e5a68e106",
        "jurisdiction": {
          "level": "cantonal",
          "code": "AI"
        },
        "labelKey": "holiday.ai.AI-RTG-ALL-DAY-NATIONAL-DAY",
        "labels": {
          "de": "Bundesfeiertag",
          "fr": "Fête nationale"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-BUNDESFEIERTAG-19940701",
            "locator": "SR 116 Art. 1, offene Anwendung auf neues kantonales Profil"
          }
        ],
        "calculation": {
          "type": "fixedMonthDay",
          "month": 8,
          "day": 1
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "AI-RTG-ALL-DAY-NATIONAL-DAY"
        }
      },
      {
        "ruleId": "AI-CAL-AI-RTG-ALL-DAY-NEW-YEAR-5D4E5A68E106D2A4",
        "calendarId": "ap22-ai-5d4e5a68e106",
        "jurisdiction": {
          "level": "cantonal",
          "code": "AI"
        },
        "labelKey": "holiday.ai.AI-RTG-ALL-DAY-NEW-YEAR",
        "labels": {
          "de": "Neujahr",
          "fr": "Nouvel An"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-AI-RTG-822200-V1327",
            "locator": "Art. 2 Abs. 1 Bst. b und c sowie Art. 3"
          }
        ],
        "calculation": {
          "type": "fixedMonthDay",
          "month": 1,
          "day": 1
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "AI-RTG-ALL-DAY-NEW-YEAR"
        }
      },
      {
        "ruleId": "AI-CAL-AI-RTG-ALL-DAY-PENTECOST-5D4E5A68E106D2A4",
        "calendarId": "ap22-ai-5d4e5a68e106",
        "jurisdiction": {
          "level": "cantonal",
          "code": "AI"
        },
        "labelKey": "holiday.ai.AI-RTG-ALL-DAY-PENTECOST",
        "labels": {
          "de": "Pfingsten",
          "fr": "Pentecôte"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-AI-RTG-822200-V1327",
            "locator": "Art. 2 Abs. 1 Bst. b und c sowie Art. 3"
          }
        ],
        "calculation": {
          "type": "easterOffsetDays",
          "offsetDays": 49
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "AI-RTG-ALL-DAY-PENTECOST"
        }
      },
      {
        "ruleId": "AI-CAL-AI-RTG-ALL-DAY-ST-STEPHEN-5D4E5A68E106D2A4",
        "calendarId": "ap22-ai-5d4e5a68e106",
        "jurisdiction": {
          "level": "cantonal",
          "code": "AI"
        },
        "labelKey": "holiday.ai.AI-RTG-ALL-DAY-ST-STEPHEN",
        "labels": {
          "de": "Stephanstag",
          "fr": "Saint-Étienne"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-AI-RTG-822200-V1327",
            "locator": "Art. 2 Abs. 1 Bst. b, keine drei aufeinanderfolgenden Ruhetage. Bericht Standeskommission 29.09.2015, S. 7"
          }
        ],
        "calculation": {
          "type": "fixedMonthDay",
          "month": 12,
          "day": 26
        },
        "condition": "unlessTuesdayOrSaturday",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "AI-RTG-ALL-DAY-ST-STEPHEN"
        }
      },
      {
        "ruleId": "AI-CAL-AI-RTG-ALL-DAY-WHIT-MONDAY-5D4E5A68E106D2A4",
        "calendarId": "ap22-ai-5d4e5a68e106",
        "jurisdiction": {
          "level": "cantonal",
          "code": "AI"
        },
        "labelKey": "holiday.ai.AI-RTG-ALL-DAY-WHIT-MONDAY",
        "labels": {
          "de": "Pfingstmontag",
          "fr": "Lundi de Pentecôte"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-AI-RTG-822200-V1327",
            "locator": "Art. 2 Abs. 1 Bst. b und c sowie Art. 3"
          }
        ],
        "calculation": {
          "type": "easterOffsetDays",
          "offsetDays": 50
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "AI-RTG-ALL-DAY-WHIT-MONDAY"
        }
      }
    ],
    "projection": {
      "catalogId": "ch-holiday-catalog",
      "catalogFormatVersion": "2.0.0",
      "projectionId": "projection-5d4e5a68e106d2a4",
      "sourceHash": "c5701e47df0d07bb288719b26d55c31b84fe83ea539578d9192e292e08602570"
    }
  },
  {
    "$schema": "https://raw.githubusercontent.com/davidsteimer/fristenrechner/main/schemas/calendar-rules-v3.schema.json",
    "formatVersion": "3.0.0",
    "dataKind": "calendar",
    "calendarId": "ap22-ai-f507435d8aa8",
    "jurisdiction": {
      "level": "cantonal",
      "code": "AI"
    },
    "validity": {
      "from": "2026-08-29",
      "to": null
    },
    "inherits": [
      "ch-federal-calendar"
    ],
    "review": {
      "reviewedOn": "2026-10-08",
      "status": "candidate",
      "reviewedBy": "Codex",
      "basis": "AP22C1 Datenkandidat auf Grundlage von DEC-2026-030. Keine Quellen- oder Betriebsfreigabe."
    },
    "sources": [
      {
        "sourceId": "SRC-AI-RTG-822200-V1327",
        "sourceType": "officialDossier",
        "title": "Gesetz über die öffentlichen Ruhetage, Ruhetagsgesetz",
        "authority": "CH-AI",
        "url": "https://ai.clex.ch/api/de/versions/1327/pdf_file",
        "documentVersionDate": "2011-01-01",
        "reviewedOn": "2026-09-22",
        "reviewStatus": "monitored"
      },
      {
        "sourceId": "SRC-BUNDESFEIERTAG-19940701",
        "sourceType": "officialDossier",
        "title": "Verordnung über den Bundesfeiertag, SR 116",
        "authority": "CH",
        "url": "https://www.fedlex.admin.ch/eli/cc/1994/1340_1340_1340/de",
        "documentVersionDate": "1994-07-01",
        "reviewedOn": "2026-09-13",
        "reviewStatus": "monitored"
      }
    ],
    "rules": [
      {
        "ruleId": "AI-CAL-AI-RTG-ALL-DAY-ALL-SAINTS-F507435D8AA84585",
        "calendarId": "ap22-ai-f507435d8aa8",
        "jurisdiction": {
          "level": "cantonal",
          "code": "AI"
        },
        "labelKey": "holiday.ai.AI-RTG-ALL-DAY-ALL-SAINTS",
        "labels": {
          "de": "Allerheiligen",
          "fr": "Toussaint"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-AI-RTG-822200-V1327",
            "locator": "Art. 2 Abs. 1 Bst. b und c sowie Art. 3"
          }
        ],
        "calculation": {
          "type": "fixedMonthDay",
          "month": 11,
          "day": 1
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "AI-RTG-ALL-DAY-ALL-SAINTS"
        }
      },
      {
        "ruleId": "AI-CAL-AI-RTG-ALL-DAY-ASCENSION-F507435D8AA84585",
        "calendarId": "ap22-ai-f507435d8aa8",
        "jurisdiction": {
          "level": "cantonal",
          "code": "AI"
        },
        "labelKey": "holiday.ai.AI-RTG-ALL-DAY-ASCENSION",
        "labels": {
          "de": "Auffahrt",
          "fr": "Ascension"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-AI-RTG-822200-V1327",
            "locator": "Art. 2 Abs. 1 Bst. b und c sowie Art. 3"
          }
        ],
        "calculation": {
          "type": "easterOffsetDays",
          "offsetDays": 39
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "AI-RTG-ALL-DAY-ASCENSION"
        }
      },
      {
        "ruleId": "AI-CAL-AI-RTG-ALL-DAY-ASSUMPTION-F507435D8AA84585",
        "calendarId": "ap22-ai-f507435d8aa8",
        "jurisdiction": {
          "level": "cantonal",
          "code": "AI"
        },
        "labelKey": "holiday.ai.AI-RTG-ALL-DAY-ASSUMPTION",
        "labels": {
          "de": "Mariä Himmelfahrt",
          "fr": "Assomption"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-AI-RTG-822200-V1327",
            "locator": "Art. 2 Abs. 1 Bst. b und c sowie Art. 3"
          }
        ],
        "calculation": {
          "type": "fixedMonthDay",
          "month": 8,
          "day": 15
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "AI-RTG-ALL-DAY-ASSUMPTION"
        }
      },
      {
        "ruleId": "AI-CAL-AI-RTG-ALL-DAY-CHRISTMAS-F507435D8AA84585",
        "calendarId": "ap22-ai-f507435d8aa8",
        "jurisdiction": {
          "level": "cantonal",
          "code": "AI"
        },
        "labelKey": "holiday.ai.AI-RTG-ALL-DAY-CHRISTMAS",
        "labels": {
          "de": "Weihnachten",
          "fr": "Noël"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-AI-RTG-822200-V1327",
            "locator": "Art. 2 Abs. 1 Bst. b und c sowie Art. 3"
          }
        ],
        "calculation": {
          "type": "fixedMonthDay",
          "month": 12,
          "day": 25
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "AI-RTG-ALL-DAY-CHRISTMAS"
        }
      },
      {
        "ruleId": "AI-CAL-AI-RTG-ALL-DAY-CORPUS-CHRISTI-F507435D8AA84585",
        "calendarId": "ap22-ai-f507435d8aa8",
        "jurisdiction": {
          "level": "cantonal",
          "code": "AI"
        },
        "labelKey": "holiday.ai.AI-RTG-ALL-DAY-CORPUS-CHRISTI",
        "labels": {
          "de": "Fronleichnam",
          "fr": "Fête-Dieu"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-AI-RTG-822200-V1327",
            "locator": "Art. 2 Abs. 1 Bst. b und c sowie Art. 3"
          }
        ],
        "calculation": {
          "type": "easterOffsetDays",
          "offsetDays": 60
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "AI-RTG-ALL-DAY-CORPUS-CHRISTI"
        }
      },
      {
        "ruleId": "AI-CAL-AI-RTG-ALL-DAY-EASTER-F507435D8AA84585",
        "calendarId": "ap22-ai-f507435d8aa8",
        "jurisdiction": {
          "level": "cantonal",
          "code": "AI"
        },
        "labelKey": "holiday.ai.AI-RTG-ALL-DAY-EASTER",
        "labels": {
          "de": "Ostern",
          "fr": "Pâques"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-AI-RTG-822200-V1327",
            "locator": "Art. 2 Abs. 1 Bst. b und c sowie Art. 3"
          }
        ],
        "calculation": {
          "type": "easterOffsetDays",
          "offsetDays": 0
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "AI-RTG-ALL-DAY-EASTER"
        }
      },
      {
        "ruleId": "AI-CAL-AI-RTG-ALL-DAY-EASTER-MONDAY-F507435D8AA84585",
        "calendarId": "ap22-ai-f507435d8aa8",
        "jurisdiction": {
          "level": "cantonal",
          "code": "AI"
        },
        "labelKey": "holiday.ai.AI-RTG-ALL-DAY-EASTER-MONDAY",
        "labels": {
          "de": "Ostermontag",
          "fr": "Lundi de Pâques"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-AI-RTG-822200-V1327",
            "locator": "Art. 2 Abs. 1 Bst. b und c sowie Art. 3"
          }
        ],
        "calculation": {
          "type": "easterOffsetDays",
          "offsetDays": 1
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "AI-RTG-ALL-DAY-EASTER-MONDAY"
        }
      },
      {
        "ruleId": "AI-CAL-AI-RTG-ALL-DAY-FEDERAL-FAST-F507435D8AA84585",
        "calendarId": "ap22-ai-f507435d8aa8",
        "jurisdiction": {
          "level": "cantonal",
          "code": "AI"
        },
        "labelKey": "holiday.ai.AI-RTG-ALL-DAY-FEDERAL-FAST",
        "labels": {
          "de": "Eidgenössischer Dank-, Buss- und Bettag",
          "fr": "Jeûne fédéral"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-AI-RTG-822200-V1327",
            "locator": "Art. 2 Abs. 1 Bst. b und c sowie Art. 3"
          }
        ],
        "calculation": {
          "type": "nthWeekdayOfMonth",
          "month": 9,
          "isoWeekday": 7,
          "occurrence": 3
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "AI-RTG-ALL-DAY-FEDERAL-FAST"
        }
      },
      {
        "ruleId": "AI-CAL-AI-RTG-ALL-DAY-GOOD-FRIDAY-F507435D8AA84585",
        "calendarId": "ap22-ai-f507435d8aa8",
        "jurisdiction": {
          "level": "cantonal",
          "code": "AI"
        },
        "labelKey": "holiday.ai.AI-RTG-ALL-DAY-GOOD-FRIDAY",
        "labels": {
          "de": "Karfreitag",
          "fr": "Vendredi saint"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-AI-RTG-822200-V1327",
            "locator": "Art. 2 Abs. 1 Bst. b und c sowie Art. 3"
          }
        ],
        "calculation": {
          "type": "easterOffsetDays",
          "offsetDays": -2
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "AI-RTG-ALL-DAY-GOOD-FRIDAY"
        }
      },
      {
        "ruleId": "AI-CAL-AI-RTG-ALL-DAY-IMMACULATE-CONCEPTION-F507435D8AA84585",
        "calendarId": "ap22-ai-f507435d8aa8",
        "jurisdiction": {
          "level": "cantonal",
          "code": "AI"
        },
        "labelKey": "holiday.ai.AI-RTG-ALL-DAY-IMMACULATE-CONCEPTION",
        "labels": {
          "de": "Mariä Empfängnis",
          "fr": "Immaculée Conception"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-AI-RTG-822200-V1327",
            "locator": "Art. 2 Abs. 1 Bst. b und c sowie Art. 3"
          }
        ],
        "calculation": {
          "type": "fixedMonthDay",
          "month": 12,
          "day": 8
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "AI-RTG-ALL-DAY-IMMACULATE-CONCEPTION"
        }
      },
      {
        "ruleId": "AI-CAL-AI-RTG-ALL-DAY-NATIONAL-DAY-F507435D8AA84585",
        "calendarId": "ap22-ai-f507435d8aa8",
        "jurisdiction": {
          "level": "cantonal",
          "code": "AI"
        },
        "labelKey": "holiday.ai.AI-RTG-ALL-DAY-NATIONAL-DAY",
        "labels": {
          "de": "Bundesfeiertag",
          "fr": "Fête nationale"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-BUNDESFEIERTAG-19940701",
            "locator": "SR 116 Art. 1, offene Anwendung auf neues kantonales Profil"
          }
        ],
        "calculation": {
          "type": "fixedMonthDay",
          "month": 8,
          "day": 1
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "AI-RTG-ALL-DAY-NATIONAL-DAY"
        }
      },
      {
        "ruleId": "AI-CAL-AI-RTG-ALL-DAY-NEW-YEAR-F507435D8AA84585",
        "calendarId": "ap22-ai-f507435d8aa8",
        "jurisdiction": {
          "level": "cantonal",
          "code": "AI"
        },
        "labelKey": "holiday.ai.AI-RTG-ALL-DAY-NEW-YEAR",
        "labels": {
          "de": "Neujahr",
          "fr": "Nouvel An"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-AI-RTG-822200-V1327",
            "locator": "Art. 2 Abs. 1 Bst. b und c sowie Art. 3"
          }
        ],
        "calculation": {
          "type": "fixedMonthDay",
          "month": 1,
          "day": 1
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "AI-RTG-ALL-DAY-NEW-YEAR"
        }
      },
      {
        "ruleId": "AI-CAL-AI-RTG-ALL-DAY-PENTECOST-F507435D8AA84585",
        "calendarId": "ap22-ai-f507435d8aa8",
        "jurisdiction": {
          "level": "cantonal",
          "code": "AI"
        },
        "labelKey": "holiday.ai.AI-RTG-ALL-DAY-PENTECOST",
        "labels": {
          "de": "Pfingsten",
          "fr": "Pentecôte"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-AI-RTG-822200-V1327",
            "locator": "Art. 2 Abs. 1 Bst. b und c sowie Art. 3"
          }
        ],
        "calculation": {
          "type": "easterOffsetDays",
          "offsetDays": 49
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "AI-RTG-ALL-DAY-PENTECOST"
        }
      },
      {
        "ruleId": "AI-CAL-AI-RTG-ALL-DAY-ST-STEPHEN-F507435D8AA84585",
        "calendarId": "ap22-ai-f507435d8aa8",
        "jurisdiction": {
          "level": "cantonal",
          "code": "AI"
        },
        "labelKey": "holiday.ai.AI-RTG-ALL-DAY-ST-STEPHEN",
        "labels": {
          "de": "Stephanstag",
          "fr": "Saint-Étienne"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-AI-RTG-822200-V1327",
            "locator": "Art. 2 Abs. 1 Bst. b, keine drei aufeinanderfolgenden Ruhetage. Bericht Standeskommission 29.09.2015, S. 7"
          }
        ],
        "calculation": {
          "type": "fixedMonthDay",
          "month": 12,
          "day": 26
        },
        "condition": "unlessTuesdayOrSaturday",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "AI-RTG-ALL-DAY-ST-STEPHEN"
        }
      },
      {
        "ruleId": "AI-CAL-AI-RTG-ALL-DAY-WHIT-MONDAY-F507435D8AA84585",
        "calendarId": "ap22-ai-f507435d8aa8",
        "jurisdiction": {
          "level": "cantonal",
          "code": "AI"
        },
        "labelKey": "holiday.ai.AI-RTG-ALL-DAY-WHIT-MONDAY",
        "labels": {
          "de": "Pfingstmontag",
          "fr": "Lundi de Pentecôte"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-AI-RTG-822200-V1327",
            "locator": "Art. 2 Abs. 1 Bst. b und c sowie Art. 3"
          }
        ],
        "calculation": {
          "type": "easterOffsetDays",
          "offsetDays": 50
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "AI-RTG-ALL-DAY-WHIT-MONDAY"
        }
      },
      {
        "ruleId": "AI-CAL-AI-RTG-INNER-ADDITIONAL-DAY-MAURITIUS-F507435D8AA84585",
        "calendarId": "ap22-ai-f507435d8aa8",
        "jurisdiction": {
          "level": "cantonal",
          "code": "AI"
        },
        "labelKey": "holiday.ai.AI-RTG-INNER-ADDITIONAL-DAY-MAURITIUS",
        "labels": {
          "de": "St. Mauritiustag",
          "fr": "Saint-Maurice"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-AI-RTG-822200-V1327",
            "locator": "Art. 2 Abs. 1 Bst. c"
          }
        ],
        "calculation": {
          "type": "fixedMonthDay",
          "month": 9,
          "day": 22
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "AI-RTG-INNER-ADDITIONAL-DAY-MAURITIUS"
        }
      }
    ],
    "projection": {
      "catalogId": "ch-holiday-catalog",
      "catalogFormatVersion": "2.0.0",
      "projectionId": "projection-f507435d8aa84585",
      "sourceHash": "c5701e47df0d07bb288719b26d55c31b84fe83ea539578d9192e292e08602570"
    }
  },
  {
    "$schema": "https://raw.githubusercontent.com/davidsteimer/fristenrechner/main/schemas/calendar-rules-v3.schema.json",
    "formatVersion": "3.0.0",
    "dataKind": "calendar",
    "calendarId": "ap22-ar-88bb22c08a22",
    "jurisdiction": {
      "level": "cantonal",
      "code": "AR"
    },
    "validity": {
      "from": "2026-08-29",
      "to": null
    },
    "inherits": [
      "ch-federal-calendar"
    ],
    "review": {
      "reviewedOn": "2026-10-08",
      "status": "candidate",
      "reviewedBy": "Codex",
      "basis": "AP22C1 Datenkandidat auf Grundlage von DEC-2026-030. Keine Quellen- oder Betriebsfreigabe."
    },
    "sources": [
      {
        "sourceId": "SRC-AR-ARGV-82211-V1058",
        "sourceType": "officialDossier",
        "title": "Verordnung zum Bundesgesetz über die Arbeit in Industrie, Gewerbe und Handel",
        "authority": "CH-AR",
        "url": "https://ar.clex.ch/api/de/versions/1058/pdf_file",
        "documentVersionDate": "2016-01-01",
        "reviewedOn": "2026-09-22",
        "reviewStatus": "monitored"
      },
      {
        "sourceId": "SRC-BUNDESFEIERTAG-19940701",
        "sourceType": "officialDossier",
        "title": "Verordnung über den Bundesfeiertag, SR 116",
        "authority": "CH",
        "url": "https://www.fedlex.admin.ch/eli/cc/1994/1340_1340_1340/de",
        "documentVersionDate": "1994-07-01",
        "reviewedOn": "2026-09-13",
        "reviewStatus": "monitored"
      }
    ],
    "rules": [
      {
        "ruleId": "AR-CAL-AR-ARG-ALL-DAY-ASCENSION-88BB22C08A22E382",
        "calendarId": "ap22-ar-88bb22c08a22",
        "jurisdiction": {
          "level": "cantonal",
          "code": "AR"
        },
        "labelKey": "holiday.ar.AR-ARG-ALL-DAY-ASCENSION",
        "labels": {
          "de": "Auffahrt",
          "fr": "Ascension"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-AR-ARGV-82211-V1058",
            "locator": "Art. 7"
          }
        ],
        "calculation": {
          "type": "easterOffsetDays",
          "offsetDays": 39
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "AR-ARG-ALL-DAY-ASCENSION"
        }
      },
      {
        "ruleId": "AR-CAL-AR-ARG-ALL-DAY-CHRISTMAS-88BB22C08A22E382",
        "calendarId": "ap22-ar-88bb22c08a22",
        "jurisdiction": {
          "level": "cantonal",
          "code": "AR"
        },
        "labelKey": "holiday.ar.AR-ARG-ALL-DAY-CHRISTMAS",
        "labels": {
          "de": "Weihnachten",
          "fr": "Noël"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-AR-ARGV-82211-V1058",
            "locator": "Art. 7"
          }
        ],
        "calculation": {
          "type": "fixedMonthDay",
          "month": 12,
          "day": 25
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "AR-ARG-ALL-DAY-CHRISTMAS"
        }
      },
      {
        "ruleId": "AR-CAL-AR-ARG-ALL-DAY-EASTER-MONDAY-88BB22C08A22E382",
        "calendarId": "ap22-ar-88bb22c08a22",
        "jurisdiction": {
          "level": "cantonal",
          "code": "AR"
        },
        "labelKey": "holiday.ar.AR-ARG-ALL-DAY-EASTER-MONDAY",
        "labels": {
          "de": "Ostermontag",
          "fr": "Lundi de Pâques"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-AR-ARGV-82211-V1058",
            "locator": "Art. 7"
          }
        ],
        "calculation": {
          "type": "easterOffsetDays",
          "offsetDays": 1
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "AR-ARG-ALL-DAY-EASTER-MONDAY"
        }
      },
      {
        "ruleId": "AR-CAL-AR-ARG-ALL-DAY-GOOD-FRIDAY-88BB22C08A22E382",
        "calendarId": "ap22-ar-88bb22c08a22",
        "jurisdiction": {
          "level": "cantonal",
          "code": "AR"
        },
        "labelKey": "holiday.ar.AR-ARG-ALL-DAY-GOOD-FRIDAY",
        "labels": {
          "de": "Karfreitag",
          "fr": "Vendredi saint"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-AR-ARGV-82211-V1058",
            "locator": "Art. 7"
          }
        ],
        "calculation": {
          "type": "easterOffsetDays",
          "offsetDays": -2
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "AR-ARG-ALL-DAY-GOOD-FRIDAY"
        }
      },
      {
        "ruleId": "AR-CAL-AR-ARG-ALL-DAY-NATIONAL-DAY-88BB22C08A22E382",
        "calendarId": "ap22-ar-88bb22c08a22",
        "jurisdiction": {
          "level": "cantonal",
          "code": "AR"
        },
        "labelKey": "holiday.ar.AR-ARG-ALL-DAY-NATIONAL-DAY",
        "labels": {
          "de": "Bundesfeiertag",
          "fr": "Fête nationale"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-BUNDESFEIERTAG-19940701",
            "locator": "SR 116 Art. 1, offene Anwendung auf neues kantonales Profil"
          }
        ],
        "calculation": {
          "type": "fixedMonthDay",
          "month": 8,
          "day": 1
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "AR-ARG-ALL-DAY-NATIONAL-DAY"
        }
      },
      {
        "ruleId": "AR-CAL-AR-ARG-ALL-DAY-NEW-YEAR-88BB22C08A22E382",
        "calendarId": "ap22-ar-88bb22c08a22",
        "jurisdiction": {
          "level": "cantonal",
          "code": "AR"
        },
        "labelKey": "holiday.ar.AR-ARG-ALL-DAY-NEW-YEAR",
        "labels": {
          "de": "Neujahr",
          "fr": "Nouvel An"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-AR-ARGV-82211-V1058",
            "locator": "Art. 7"
          }
        ],
        "calculation": {
          "type": "fixedMonthDay",
          "month": 1,
          "day": 1
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "AR-ARG-ALL-DAY-NEW-YEAR"
        }
      },
      {
        "ruleId": "AR-CAL-AR-ARG-ALL-DAY-ST-STEPHEN-88BB22C08A22E382",
        "calendarId": "ap22-ar-88bb22c08a22",
        "jurisdiction": {
          "level": "cantonal",
          "code": "AR"
        },
        "labelKey": "holiday.ar.AR-ARG-ALL-DAY-ST-STEPHEN",
        "labels": {
          "de": "Stephanstag",
          "fr": "Saint-Étienne"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-AR-ARGV-82211-V1058",
            "locator": "Art. 7, zweiter Weihnachtstag entfällt bei Weihnachten Montag oder Freitag"
          }
        ],
        "calculation": {
          "type": "fixedMonthDay",
          "month": 12,
          "day": 26
        },
        "condition": "unlessTuesdayOrSaturday",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "AR-ARG-ALL-DAY-ST-STEPHEN"
        }
      },
      {
        "ruleId": "AR-CAL-AR-ARG-ALL-DAY-WHIT-MONDAY-88BB22C08A22E382",
        "calendarId": "ap22-ar-88bb22c08a22",
        "jurisdiction": {
          "level": "cantonal",
          "code": "AR"
        },
        "labelKey": "holiday.ar.AR-ARG-ALL-DAY-WHIT-MONDAY",
        "labels": {
          "de": "Pfingstmontag",
          "fr": "Lundi de Pentecôte"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-AR-ARGV-82211-V1058",
            "locator": "Art. 7"
          }
        ],
        "calculation": {
          "type": "easterOffsetDays",
          "offsetDays": 50
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "AR-ARG-ALL-DAY-WHIT-MONDAY"
        }
      }
    ],
    "projection": {
      "catalogId": "ch-holiday-catalog",
      "catalogFormatVersion": "2.0.0",
      "projectionId": "projection-88bb22c08a22e382",
      "sourceHash": "c5701e47df0d07bb288719b26d55c31b84fe83ea539578d9192e292e08602570"
    }
  },
  {
    "$schema": "https://raw.githubusercontent.com/davidsteimer/fristenrechner/main/schemas/calendar-rules-v3.schema.json",
    "formatVersion": "3.0.0",
    "dataKind": "calendar",
    "calendarId": "ap22-bl-72f1a7e0fcf8",
    "jurisdiction": {
      "level": "cantonal",
      "code": "BL"
    },
    "validity": {
      "from": "2026-08-29",
      "to": null
    },
    "inherits": [
      "ch-federal-calendar"
    ],
    "review": {
      "reviewedOn": "2026-10-08",
      "status": "candidate",
      "reviewedBy": "Codex",
      "basis": "AP22C1 Datenkandidat auf Grundlage von DEC-2026-030. Keine Quellen- oder Betriebsfreigabe."
    },
    "sources": [
      {
        "sourceId": "SRC-BL-RTG-547-20191201",
        "sourceType": "officialDossier",
        "title": "Gesetz über die öffentlichen Ruhetage und den Sonntagsverkauf, RTG",
        "authority": "CH-BL",
        "url": "https://bl.clex.ch/api/versions/2507/pdf_file_with_annexes",
        "documentVersionDate": "2019-12-01",
        "reviewedOn": "2026-09-13",
        "reviewStatus": "monitored"
      },
      {
        "sourceId": "SRC-BUNDESFEIERTAG-19940701",
        "sourceType": "officialDossier",
        "title": "Verordnung über den Bundesfeiertag, SR 116",
        "authority": "CH",
        "url": "https://www.fedlex.admin.ch/eli/cc/1994/1340_1340_1340/de",
        "documentVersionDate": "1994-07-01",
        "reviewedOn": "2026-09-13",
        "reviewStatus": "monitored"
      }
    ],
    "rules": [
      {
        "ruleId": "BL-CAL-BL-RTG-ALL-DAY-ASCENSION-72F1A7E0FCF89C15",
        "calendarId": "ap22-bl-72f1a7e0fcf8",
        "jurisdiction": {
          "level": "cantonal",
          "code": "BL"
        },
        "labelKey": "holiday.bl.BL-RTG-ALL-DAY-ASCENSION",
        "labels": {
          "de": "Auffahrt",
          "fr": "Ascension"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-BL-RTG-547-20191201",
            "locator": "§ 2 Abs. 1 Bst. b und c"
          }
        ],
        "calculation": {
          "type": "easterOffsetDays",
          "offsetDays": 39
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "BL-RTG-ALL-DAY-ASCENSION"
        }
      },
      {
        "ruleId": "BL-CAL-BL-RTG-ALL-DAY-CHRISTMAS-72F1A7E0FCF89C15",
        "calendarId": "ap22-bl-72f1a7e0fcf8",
        "jurisdiction": {
          "level": "cantonal",
          "code": "BL"
        },
        "labelKey": "holiday.bl.BL-RTG-ALL-DAY-CHRISTMAS",
        "labels": {
          "de": "Weihnachten",
          "fr": "Noël"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-BL-RTG-547-20191201",
            "locator": "§ 2 Abs. 1 Bst. b und c"
          }
        ],
        "calculation": {
          "type": "fixedMonthDay",
          "month": 12,
          "day": 25
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "BL-RTG-ALL-DAY-CHRISTMAS"
        }
      },
      {
        "ruleId": "BL-CAL-BL-RTG-ALL-DAY-EASTER-72F1A7E0FCF89C15",
        "calendarId": "ap22-bl-72f1a7e0fcf8",
        "jurisdiction": {
          "level": "cantonal",
          "code": "BL"
        },
        "labelKey": "holiday.bl.BL-RTG-ALL-DAY-EASTER",
        "labels": {
          "de": "Ostern",
          "fr": "Pâques"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-BL-RTG-547-20191201",
            "locator": "§ 2 Abs. 1 Bst. b und c"
          }
        ],
        "calculation": {
          "type": "easterOffsetDays",
          "offsetDays": 0
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "BL-RTG-ALL-DAY-EASTER"
        }
      },
      {
        "ruleId": "BL-CAL-BL-RTG-ALL-DAY-EASTER-MONDAY-72F1A7E0FCF89C15",
        "calendarId": "ap22-bl-72f1a7e0fcf8",
        "jurisdiction": {
          "level": "cantonal",
          "code": "BL"
        },
        "labelKey": "holiday.bl.BL-RTG-ALL-DAY-EASTER-MONDAY",
        "labels": {
          "de": "Ostermontag",
          "fr": "Lundi de Pâques"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-BL-RTG-547-20191201",
            "locator": "§ 2 Abs. 1 Bst. b und c"
          }
        ],
        "calculation": {
          "type": "easterOffsetDays",
          "offsetDays": 1
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "BL-RTG-ALL-DAY-EASTER-MONDAY"
        }
      },
      {
        "ruleId": "BL-CAL-BL-RTG-ALL-DAY-FEDERAL-FAST-72F1A7E0FCF89C15",
        "calendarId": "ap22-bl-72f1a7e0fcf8",
        "jurisdiction": {
          "level": "cantonal",
          "code": "BL"
        },
        "labelKey": "holiday.bl.BL-RTG-ALL-DAY-FEDERAL-FAST",
        "labels": {
          "de": "Eidgenössischer Dank-, Buss- und Bettag",
          "fr": "Jeûne fédéral"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-BL-RTG-547-20191201",
            "locator": "§ 2 Abs. 1 Bst. b und c"
          }
        ],
        "calculation": {
          "type": "nthWeekdayOfMonth",
          "month": 9,
          "isoWeekday": 7,
          "occurrence": 3
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "BL-RTG-ALL-DAY-FEDERAL-FAST"
        }
      },
      {
        "ruleId": "BL-CAL-BL-RTG-ALL-DAY-GOOD-FRIDAY-72F1A7E0FCF89C15",
        "calendarId": "ap22-bl-72f1a7e0fcf8",
        "jurisdiction": {
          "level": "cantonal",
          "code": "BL"
        },
        "labelKey": "holiday.bl.BL-RTG-ALL-DAY-GOOD-FRIDAY",
        "labels": {
          "de": "Karfreitag",
          "fr": "Vendredi saint"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-BL-RTG-547-20191201",
            "locator": "§ 2 Abs. 1 Bst. b und c"
          }
        ],
        "calculation": {
          "type": "easterOffsetDays",
          "offsetDays": -2
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "BL-RTG-ALL-DAY-GOOD-FRIDAY"
        }
      },
      {
        "ruleId": "BL-CAL-BL-RTG-ALL-DAY-MAY1-72F1A7E0FCF89C15",
        "calendarId": "ap22-bl-72f1a7e0fcf8",
        "jurisdiction": {
          "level": "cantonal",
          "code": "BL"
        },
        "labelKey": "holiday.bl.BL-RTG-ALL-DAY-MAY1",
        "labels": {
          "de": "Tag der Arbeit (1. Mai)",
          "fr": "Fête du travail (1er mai)"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-BL-RTG-547-20191201",
            "locator": "§ 2 Abs. 1 Bst. b und c"
          }
        ],
        "calculation": {
          "type": "fixedMonthDay",
          "month": 5,
          "day": 1
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "BL-RTG-ALL-DAY-MAY1"
        }
      },
      {
        "ruleId": "BL-CAL-BL-RTG-ALL-DAY-NATIONAL-DAY-72F1A7E0FCF89C15",
        "calendarId": "ap22-bl-72f1a7e0fcf8",
        "jurisdiction": {
          "level": "cantonal",
          "code": "BL"
        },
        "labelKey": "holiday.bl.BL-RTG-ALL-DAY-NATIONAL-DAY",
        "labels": {
          "de": "Bundesfeiertag",
          "fr": "Fête nationale"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-BUNDESFEIERTAG-19940701",
            "locator": "SR 116 Art. 1, neue Anwendung auf BL-RTG-ALL. Kantonaler Bezug § 2 Abs. 1 Bst. b und c"
          }
        ],
        "calculation": {
          "type": "fixedMonthDay",
          "month": 8,
          "day": 1
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "BL-RTG-ALL-DAY-NATIONAL-DAY"
        }
      },
      {
        "ruleId": "BL-CAL-BL-RTG-ALL-DAY-NEW-YEAR-72F1A7E0FCF89C15",
        "calendarId": "ap22-bl-72f1a7e0fcf8",
        "jurisdiction": {
          "level": "cantonal",
          "code": "BL"
        },
        "labelKey": "holiday.bl.BL-RTG-ALL-DAY-NEW-YEAR",
        "labels": {
          "de": "Neujahr",
          "fr": "Nouvel An"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-BL-RTG-547-20191201",
            "locator": "§ 2 Abs. 1 Bst. b und c"
          }
        ],
        "calculation": {
          "type": "fixedMonthDay",
          "month": 1,
          "day": 1
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "BL-RTG-ALL-DAY-NEW-YEAR"
        }
      },
      {
        "ruleId": "BL-CAL-BL-RTG-ALL-DAY-PENTECOST-72F1A7E0FCF89C15",
        "calendarId": "ap22-bl-72f1a7e0fcf8",
        "jurisdiction": {
          "level": "cantonal",
          "code": "BL"
        },
        "labelKey": "holiday.bl.BL-RTG-ALL-DAY-PENTECOST",
        "labels": {
          "de": "Pfingsten",
          "fr": "Pentecôte"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-BL-RTG-547-20191201",
            "locator": "§ 2 Abs. 1 Bst. b und c"
          }
        ],
        "calculation": {
          "type": "easterOffsetDays",
          "offsetDays": 49
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "BL-RTG-ALL-DAY-PENTECOST"
        }
      },
      {
        "ruleId": "BL-CAL-BL-RTG-ALL-DAY-ST-STEPHEN-72F1A7E0FCF89C15",
        "calendarId": "ap22-bl-72f1a7e0fcf8",
        "jurisdiction": {
          "level": "cantonal",
          "code": "BL"
        },
        "labelKey": "holiday.bl.BL-RTG-ALL-DAY-ST-STEPHEN",
        "labels": {
          "de": "Stephanstag",
          "fr": "Saint-Étienne"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-BL-RTG-547-20191201",
            "locator": "§ 2 Abs. 1 Bst. b und c"
          }
        ],
        "calculation": {
          "type": "fixedMonthDay",
          "month": 12,
          "day": 26
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "BL-RTG-ALL-DAY-ST-STEPHEN"
        }
      },
      {
        "ruleId": "BL-CAL-BL-RTG-ALL-DAY-WHIT-MONDAY-72F1A7E0FCF89C15",
        "calendarId": "ap22-bl-72f1a7e0fcf8",
        "jurisdiction": {
          "level": "cantonal",
          "code": "BL"
        },
        "labelKey": "holiday.bl.BL-RTG-ALL-DAY-WHIT-MONDAY",
        "labels": {
          "de": "Pfingstmontag",
          "fr": "Lundi de Pentecôte"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-BL-RTG-547-20191201",
            "locator": "§ 2 Abs. 1 Bst. b und c"
          }
        ],
        "calculation": {
          "type": "easterOffsetDays",
          "offsetDays": 50
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "BL-RTG-ALL-DAY-WHIT-MONDAY"
        }
      }
    ],
    "projection": {
      "catalogId": "ch-holiday-catalog",
      "catalogFormatVersion": "2.0.0",
      "projectionId": "projection-72f1a7e0fcf89c15",
      "sourceHash": "c5701e47df0d07bb288719b26d55c31b84fe83ea539578d9192e292e08602570"
    }
  },
  {
    "$schema": "https://raw.githubusercontent.com/davidsteimer/fristenrechner/main/schemas/calendar-rules-v3.schema.json",
    "formatVersion": "3.0.0",
    "dataKind": "calendar",
    "calendarId": "ap22-bs-39a64bdfc0fe",
    "jurisdiction": {
      "level": "cantonal",
      "code": "BS"
    },
    "validity": {
      "from": "2026-08-29",
      "to": null
    },
    "inherits": [
      "ch-federal-calendar"
    ],
    "review": {
      "reviewedOn": "2026-10-08",
      "status": "candidate",
      "reviewedBy": "Codex",
      "basis": "AP22C1 Datenkandidat auf Grundlage von DEC-2026-030. Keine Quellen- oder Betriebsfreigabe."
    },
    "sources": [
      {
        "sourceId": "SRC-BS-RLG-811100-20200701",
        "sourceType": "officialDossier",
        "title": "Gesetz über öffentliche Ruhetage und Ladenöffnung, RLG",
        "authority": "CH-BS",
        "url": "https://www.gesetzessammlung.bs.ch/frontend/versions/4927/download_pdf_file?locale=de",
        "documentVersionDate": "2020-07-01",
        "reviewedOn": "2026-09-13",
        "reviewStatus": "monitored"
      },
      {
        "sourceId": "SRC-BUNDESFEIERTAG-19940701",
        "sourceType": "officialDossier",
        "title": "Verordnung über den Bundesfeiertag, SR 116",
        "authority": "CH",
        "url": "https://www.fedlex.admin.ch/eli/cc/1994/1340_1340_1340/de",
        "documentVersionDate": "1994-07-01",
        "reviewedOn": "2026-09-13",
        "reviewStatus": "monitored"
      }
    ],
    "rules": [
      {
        "ruleId": "BS-CAL-BS-RLG-ALL-DAY-ASCENSION-39A64BDFC0FE5A10",
        "calendarId": "ap22-bs-39a64bdfc0fe",
        "jurisdiction": {
          "level": "cantonal",
          "code": "BS"
        },
        "labelKey": "holiday.bs.BS-RLG-ALL-DAY-ASCENSION",
        "labels": {
          "de": "Auffahrt",
          "fr": "Ascension"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-BS-RLG-811100-20200701",
            "locator": "§ 2 Abs. 1 Bst. a und b"
          }
        ],
        "calculation": {
          "type": "easterOffsetDays",
          "offsetDays": 39
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "BS-RLG-ALL-DAY-ASCENSION"
        }
      },
      {
        "ruleId": "BS-CAL-BS-RLG-ALL-DAY-CHRISTMAS-39A64BDFC0FE5A10",
        "calendarId": "ap22-bs-39a64bdfc0fe",
        "jurisdiction": {
          "level": "cantonal",
          "code": "BS"
        },
        "labelKey": "holiday.bs.BS-RLG-ALL-DAY-CHRISTMAS",
        "labels": {
          "de": "Weihnachten",
          "fr": "Noël"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-BS-RLG-811100-20200701",
            "locator": "§ 2 Abs. 1 Bst. a und b"
          }
        ],
        "calculation": {
          "type": "fixedMonthDay",
          "month": 12,
          "day": 25
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "BS-RLG-ALL-DAY-CHRISTMAS"
        }
      },
      {
        "ruleId": "BS-CAL-BS-RLG-ALL-DAY-EASTER-39A64BDFC0FE5A10",
        "calendarId": "ap22-bs-39a64bdfc0fe",
        "jurisdiction": {
          "level": "cantonal",
          "code": "BS"
        },
        "labelKey": "holiday.bs.BS-RLG-ALL-DAY-EASTER",
        "labels": {
          "de": "Ostern",
          "fr": "Pâques"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-BS-RLG-811100-20200701",
            "locator": "§ 2 Abs. 1 Bst. a und b"
          }
        ],
        "calculation": {
          "type": "easterOffsetDays",
          "offsetDays": 0
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "BS-RLG-ALL-DAY-EASTER"
        }
      },
      {
        "ruleId": "BS-CAL-BS-RLG-ALL-DAY-EASTER-MONDAY-39A64BDFC0FE5A10",
        "calendarId": "ap22-bs-39a64bdfc0fe",
        "jurisdiction": {
          "level": "cantonal",
          "code": "BS"
        },
        "labelKey": "holiday.bs.BS-RLG-ALL-DAY-EASTER-MONDAY",
        "labels": {
          "de": "Ostermontag",
          "fr": "Lundi de Pâques"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-BS-RLG-811100-20200701",
            "locator": "§ 2 Abs. 1 Bst. a und b"
          }
        ],
        "calculation": {
          "type": "easterOffsetDays",
          "offsetDays": 1
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "BS-RLG-ALL-DAY-EASTER-MONDAY"
        }
      },
      {
        "ruleId": "BS-CAL-BS-RLG-ALL-DAY-FEDERAL-FAST-39A64BDFC0FE5A10",
        "calendarId": "ap22-bs-39a64bdfc0fe",
        "jurisdiction": {
          "level": "cantonal",
          "code": "BS"
        },
        "labelKey": "holiday.bs.BS-RLG-ALL-DAY-FEDERAL-FAST",
        "labels": {
          "de": "Eidgenössischer Dank-, Buss- und Bettag",
          "fr": "Jeûne fédéral"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-BS-RLG-811100-20200701",
            "locator": "§ 2 Abs. 1 Bst. a und b"
          }
        ],
        "calculation": {
          "type": "nthWeekdayOfMonth",
          "month": 9,
          "isoWeekday": 7,
          "occurrence": 3
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "BS-RLG-ALL-DAY-FEDERAL-FAST"
        }
      },
      {
        "ruleId": "BS-CAL-BS-RLG-ALL-DAY-GOOD-FRIDAY-39A64BDFC0FE5A10",
        "calendarId": "ap22-bs-39a64bdfc0fe",
        "jurisdiction": {
          "level": "cantonal",
          "code": "BS"
        },
        "labelKey": "holiday.bs.BS-RLG-ALL-DAY-GOOD-FRIDAY",
        "labels": {
          "de": "Karfreitag",
          "fr": "Vendredi saint"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-BS-RLG-811100-20200701",
            "locator": "§ 2 Abs. 1 Bst. a und b"
          }
        ],
        "calculation": {
          "type": "easterOffsetDays",
          "offsetDays": -2
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "BS-RLG-ALL-DAY-GOOD-FRIDAY"
        }
      },
      {
        "ruleId": "BS-CAL-BS-RLG-ALL-DAY-MAY1-39A64BDFC0FE5A10",
        "calendarId": "ap22-bs-39a64bdfc0fe",
        "jurisdiction": {
          "level": "cantonal",
          "code": "BS"
        },
        "labelKey": "holiday.bs.BS-RLG-ALL-DAY-MAY1",
        "labels": {
          "de": "Tag der Arbeit (1. Mai)",
          "fr": "Fête du travail (1er mai)"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-BS-RLG-811100-20200701",
            "locator": "§ 2 Abs. 1 Bst. a und b"
          }
        ],
        "calculation": {
          "type": "fixedMonthDay",
          "month": 5,
          "day": 1
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "BS-RLG-ALL-DAY-MAY1"
        }
      },
      {
        "ruleId": "BS-CAL-BS-RLG-ALL-DAY-NATIONAL-DAY-39A64BDFC0FE5A10",
        "calendarId": "ap22-bs-39a64bdfc0fe",
        "jurisdiction": {
          "level": "cantonal",
          "code": "BS"
        },
        "labelKey": "holiday.bs.BS-RLG-ALL-DAY-NATIONAL-DAY",
        "labels": {
          "de": "Bundesfeiertag",
          "fr": "Fête nationale"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-BUNDESFEIERTAG-19940701",
            "locator": "SR 116 Art. 1, neue Anwendung auf BS-RLG-ALL. Kantonaler Bezug § 2 Abs. 1 Bst. a und b"
          }
        ],
        "calculation": {
          "type": "fixedMonthDay",
          "month": 8,
          "day": 1
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "BS-RLG-ALL-DAY-NATIONAL-DAY"
        }
      },
      {
        "ruleId": "BS-CAL-BS-RLG-ALL-DAY-NEW-YEAR-39A64BDFC0FE5A10",
        "calendarId": "ap22-bs-39a64bdfc0fe",
        "jurisdiction": {
          "level": "cantonal",
          "code": "BS"
        },
        "labelKey": "holiday.bs.BS-RLG-ALL-DAY-NEW-YEAR",
        "labels": {
          "de": "Neujahr",
          "fr": "Nouvel An"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-BS-RLG-811100-20200701",
            "locator": "§ 2 Abs. 1 Bst. a und b"
          }
        ],
        "calculation": {
          "type": "fixedMonthDay",
          "month": 1,
          "day": 1
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "BS-RLG-ALL-DAY-NEW-YEAR"
        }
      },
      {
        "ruleId": "BS-CAL-BS-RLG-ALL-DAY-PENTECOST-39A64BDFC0FE5A10",
        "calendarId": "ap22-bs-39a64bdfc0fe",
        "jurisdiction": {
          "level": "cantonal",
          "code": "BS"
        },
        "labelKey": "holiday.bs.BS-RLG-ALL-DAY-PENTECOST",
        "labels": {
          "de": "Pfingsten",
          "fr": "Pentecôte"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-BS-RLG-811100-20200701",
            "locator": "§ 2 Abs. 1 Bst. a und b"
          }
        ],
        "calculation": {
          "type": "easterOffsetDays",
          "offsetDays": 49
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "BS-RLG-ALL-DAY-PENTECOST"
        }
      },
      {
        "ruleId": "BS-CAL-BS-RLG-ALL-DAY-ST-STEPHEN-39A64BDFC0FE5A10",
        "calendarId": "ap22-bs-39a64bdfc0fe",
        "jurisdiction": {
          "level": "cantonal",
          "code": "BS"
        },
        "labelKey": "holiday.bs.BS-RLG-ALL-DAY-ST-STEPHEN",
        "labels": {
          "de": "Stephanstag",
          "fr": "Saint-Étienne"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-BS-RLG-811100-20200701",
            "locator": "§ 2 Abs. 1 Bst. a und b"
          }
        ],
        "calculation": {
          "type": "fixedMonthDay",
          "month": 12,
          "day": 26
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "BS-RLG-ALL-DAY-ST-STEPHEN"
        }
      },
      {
        "ruleId": "BS-CAL-BS-RLG-ALL-DAY-WHIT-MONDAY-39A64BDFC0FE5A10",
        "calendarId": "ap22-bs-39a64bdfc0fe",
        "jurisdiction": {
          "level": "cantonal",
          "code": "BS"
        },
        "labelKey": "holiday.bs.BS-RLG-ALL-DAY-WHIT-MONDAY",
        "labels": {
          "de": "Pfingstmontag",
          "fr": "Lundi de Pentecôte"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-BS-RLG-811100-20200701",
            "locator": "§ 2 Abs. 1 Bst. a und b"
          }
        ],
        "calculation": {
          "type": "easterOffsetDays",
          "offsetDays": 50
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "BS-RLG-ALL-DAY-WHIT-MONDAY"
        }
      }
    ],
    "projection": {
      "catalogId": "ch-holiday-catalog",
      "catalogFormatVersion": "2.0.0",
      "projectionId": "projection-39a64bdfc0fe5a10",
      "sourceHash": "c5701e47df0d07bb288719b26d55c31b84fe83ea539578d9192e292e08602570"
    }
  },
  {
    "$schema": "https://raw.githubusercontent.com/davidsteimer/fristenrechner/main/schemas/calendar-rules-v3.schema.json",
    "formatVersion": "3.0.0",
    "dataKind": "calendar",
    "calendarId": "ap22-fr-7d8c38f7c610",
    "jurisdiction": {
      "level": "cantonal",
      "code": "FR"
    },
    "validity": {
      "from": "2026-08-29",
      "to": null
    },
    "inherits": [
      "ch-federal-calendar"
    ],
    "review": {
      "reviewedOn": "2026-10-08",
      "status": "candidate",
      "reviewedBy": "Codex",
      "basis": "AP22C1 Datenkandidat auf Grundlage von DEC-2026-030. Keine Quellen- oder Betriebsfreigabe."
    },
    "sources": [
      {
        "sourceId": "SRC-FR-JG-1301-V7926",
        "sourceType": "officialDossier",
        "title": "Justizgesetz, JG",
        "authority": "CH-FR",
        "url": "https://bdlf.fr.ch/api/de/versions/7926/pdf_file",
        "documentVersionDate": "2024-01-01",
        "reviewedOn": "2026-09-13",
        "reviewStatus": "monitored"
      }
    ],
    "rules": [
      {
        "ruleId": "FR-CAL-FR-JG-ALL-DAY-ALL-SAINTS-7D8C38F7C610E2AA",
        "calendarId": "ap22-fr-7d8c38f7c610",
        "jurisdiction": {
          "level": "cantonal",
          "code": "FR"
        },
        "labelKey": "holiday.fr.FR-JG-ALL-DAY-ALL-SAINTS",
        "labels": {
          "de": "Allerheiligen",
          "fr": "Toussaint"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-FR-JG-1301-V7926",
            "locator": "Art. 121 Abs. 2"
          }
        ],
        "calculation": {
          "type": "fixedMonthDay",
          "month": 11,
          "day": 1
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "proceduralEquivalentDay",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "FR-JG-ALL-DAY-ALL-SAINTS"
        }
      },
      {
        "ruleId": "FR-CAL-FR-JG-ALL-DAY-ASCENSION-7D8C38F7C610E2AA",
        "calendarId": "ap22-fr-7d8c38f7c610",
        "jurisdiction": {
          "level": "cantonal",
          "code": "FR"
        },
        "labelKey": "holiday.fr.FR-JG-ALL-DAY-ASCENSION",
        "labels": {
          "de": "Auffahrt",
          "fr": "Ascension"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-FR-JG-1301-V7926",
            "locator": "Art. 121 Abs. 2"
          }
        ],
        "calculation": {
          "type": "easterOffsetDays",
          "offsetDays": 39
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "proceduralEquivalentDay",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "FR-JG-ALL-DAY-ASCENSION"
        }
      },
      {
        "ruleId": "FR-CAL-FR-JG-ALL-DAY-ASSUMPTION-7D8C38F7C610E2AA",
        "calendarId": "ap22-fr-7d8c38f7c610",
        "jurisdiction": {
          "level": "cantonal",
          "code": "FR"
        },
        "labelKey": "holiday.fr.FR-JG-ALL-DAY-ASSUMPTION",
        "labels": {
          "de": "Mariä Himmelfahrt",
          "fr": "Assomption"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-FR-JG-1301-V7926",
            "locator": "Art. 121 Abs. 2"
          }
        ],
        "calculation": {
          "type": "fixedMonthDay",
          "month": 8,
          "day": 15
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "proceduralEquivalentDay",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "FR-JG-ALL-DAY-ASSUMPTION"
        }
      },
      {
        "ruleId": "FR-CAL-FR-JG-ALL-DAY-BERCHTOLD-7D8C38F7C610E2AA",
        "calendarId": "ap22-fr-7d8c38f7c610",
        "jurisdiction": {
          "level": "cantonal",
          "code": "FR"
        },
        "labelKey": "holiday.fr.FR-JG-ALL-DAY-BERCHTOLD",
        "labels": {
          "de": "Berchtoldstag",
          "fr": "Lendemain du Nouvel-An"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-FR-JG-1301-V7926",
            "locator": "Art. 121 Abs. 2"
          }
        ],
        "calculation": {
          "type": "fixedMonthDay",
          "month": 1,
          "day": 2
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "proceduralEquivalentDay",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "FR-JG-ALL-DAY-BERCHTOLD"
        }
      },
      {
        "ruleId": "FR-CAL-FR-JG-ALL-DAY-CHRISTMAS-7D8C38F7C610E2AA",
        "calendarId": "ap22-fr-7d8c38f7c610",
        "jurisdiction": {
          "level": "cantonal",
          "code": "FR"
        },
        "labelKey": "holiday.fr.FR-JG-ALL-DAY-CHRISTMAS",
        "labels": {
          "de": "Weihnachten",
          "fr": "Noël"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-FR-JG-1301-V7926",
            "locator": "Art. 121 Abs. 2"
          }
        ],
        "calculation": {
          "type": "fixedMonthDay",
          "month": 12,
          "day": 25
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "proceduralEquivalentDay",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "FR-JG-ALL-DAY-CHRISTMAS"
        }
      },
      {
        "ruleId": "FR-CAL-FR-JG-ALL-DAY-CORPUS-CHRISTI-7D8C38F7C610E2AA",
        "calendarId": "ap22-fr-7d8c38f7c610",
        "jurisdiction": {
          "level": "cantonal",
          "code": "FR"
        },
        "labelKey": "holiday.fr.FR-JG-ALL-DAY-CORPUS-CHRISTI",
        "labels": {
          "de": "Fronleichnam",
          "fr": "Fête-Dieu"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-FR-JG-1301-V7926",
            "locator": "Art. 121 Abs. 2"
          }
        ],
        "calculation": {
          "type": "easterOffsetDays",
          "offsetDays": 60
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "proceduralEquivalentDay",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "FR-JG-ALL-DAY-CORPUS-CHRISTI"
        }
      },
      {
        "ruleId": "FR-CAL-FR-JG-ALL-DAY-EASTER-7D8C38F7C610E2AA",
        "calendarId": "ap22-fr-7d8c38f7c610",
        "jurisdiction": {
          "level": "cantonal",
          "code": "FR"
        },
        "labelKey": "holiday.fr.FR-JG-ALL-DAY-EASTER",
        "labels": {
          "de": "Ostern",
          "fr": "Pâques"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-FR-JG-1301-V7926",
            "locator": "Art. 121 Abs. 2"
          }
        ],
        "calculation": {
          "type": "easterOffsetDays",
          "offsetDays": 0
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "proceduralEquivalentDay",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "FR-JG-ALL-DAY-EASTER"
        }
      },
      {
        "ruleId": "FR-CAL-FR-JG-ALL-DAY-EASTER-MONDAY-7D8C38F7C610E2AA",
        "calendarId": "ap22-fr-7d8c38f7c610",
        "jurisdiction": {
          "level": "cantonal",
          "code": "FR"
        },
        "labelKey": "holiday.fr.FR-JG-ALL-DAY-EASTER-MONDAY",
        "labels": {
          "de": "Ostermontag",
          "fr": "Lundi de Pâques"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-FR-JG-1301-V7926",
            "locator": "Art. 121 Abs. 2"
          }
        ],
        "calculation": {
          "type": "easterOffsetDays",
          "offsetDays": 1
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "proceduralEquivalentDay",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "FR-JG-ALL-DAY-EASTER-MONDAY"
        }
      },
      {
        "ruleId": "FR-CAL-FR-JG-ALL-DAY-GOOD-FRIDAY-7D8C38F7C610E2AA",
        "calendarId": "ap22-fr-7d8c38f7c610",
        "jurisdiction": {
          "level": "cantonal",
          "code": "FR"
        },
        "labelKey": "holiday.fr.FR-JG-ALL-DAY-GOOD-FRIDAY",
        "labels": {
          "de": "Karfreitag",
          "fr": "Vendredi saint"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-FR-JG-1301-V7926",
            "locator": "Art. 121 Abs. 2"
          }
        ],
        "calculation": {
          "type": "easterOffsetDays",
          "offsetDays": -2
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "proceduralEquivalentDay",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "FR-JG-ALL-DAY-GOOD-FRIDAY"
        }
      },
      {
        "ruleId": "FR-CAL-FR-JG-ALL-DAY-IMMACULATE-CONCEPTION-7D8C38F7C610E2AA",
        "calendarId": "ap22-fr-7d8c38f7c610",
        "jurisdiction": {
          "level": "cantonal",
          "code": "FR"
        },
        "labelKey": "holiday.fr.FR-JG-ALL-DAY-IMMACULATE-CONCEPTION",
        "labels": {
          "de": "Mariä Empfängnis",
          "fr": "Immaculée Conception"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-FR-JG-1301-V7926",
            "locator": "Art. 121 Abs. 2"
          }
        ],
        "calculation": {
          "type": "fixedMonthDay",
          "month": 12,
          "day": 8
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "proceduralEquivalentDay",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "FR-JG-ALL-DAY-IMMACULATE-CONCEPTION"
        }
      },
      {
        "ruleId": "FR-CAL-FR-JG-ALL-DAY-NATIONAL-DAY-7D8C38F7C610E2AA",
        "calendarId": "ap22-fr-7d8c38f7c610",
        "jurisdiction": {
          "level": "cantonal",
          "code": "FR"
        },
        "labelKey": "holiday.fr.FR-JG-ALL-DAY-NATIONAL-DAY",
        "labels": {
          "de": "Bundesfeiertag",
          "fr": "Fête nationale"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-FR-JG-1301-V7926",
            "locator": "Art. 121 Abs. 2"
          }
        ],
        "calculation": {
          "type": "fixedMonthDay",
          "month": 8,
          "day": 1
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "proceduralEquivalentDay",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "FR-JG-ALL-DAY-NATIONAL-DAY"
        }
      },
      {
        "ruleId": "FR-CAL-FR-JG-ALL-DAY-NEW-YEAR-7D8C38F7C610E2AA",
        "calendarId": "ap22-fr-7d8c38f7c610",
        "jurisdiction": {
          "level": "cantonal",
          "code": "FR"
        },
        "labelKey": "holiday.fr.FR-JG-ALL-DAY-NEW-YEAR",
        "labels": {
          "de": "Neujahr",
          "fr": "Nouvel An"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-FR-JG-1301-V7926",
            "locator": "Art. 121 Abs. 2"
          }
        ],
        "calculation": {
          "type": "fixedMonthDay",
          "month": 1,
          "day": 1
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "proceduralEquivalentDay",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "FR-JG-ALL-DAY-NEW-YEAR"
        }
      },
      {
        "ruleId": "FR-CAL-FR-JG-ALL-DAY-PENTECOST-7D8C38F7C610E2AA",
        "calendarId": "ap22-fr-7d8c38f7c610",
        "jurisdiction": {
          "level": "cantonal",
          "code": "FR"
        },
        "labelKey": "holiday.fr.FR-JG-ALL-DAY-PENTECOST",
        "labels": {
          "de": "Pfingsten",
          "fr": "Pentecôte"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-FR-JG-1301-V7926",
            "locator": "Art. 121 Abs. 2"
          }
        ],
        "calculation": {
          "type": "easterOffsetDays",
          "offsetDays": 49
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "proceduralEquivalentDay",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "FR-JG-ALL-DAY-PENTECOST"
        }
      },
      {
        "ruleId": "FR-CAL-FR-JG-ALL-DAY-ST-STEPHEN-7D8C38F7C610E2AA",
        "calendarId": "ap22-fr-7d8c38f7c610",
        "jurisdiction": {
          "level": "cantonal",
          "code": "FR"
        },
        "labelKey": "holiday.fr.FR-JG-ALL-DAY-ST-STEPHEN",
        "labels": {
          "de": "Stephanstag",
          "fr": "Lendemain de Noël"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-FR-JG-1301-V7926",
            "locator": "Art. 121 Abs. 2"
          }
        ],
        "calculation": {
          "type": "fixedMonthDay",
          "month": 12,
          "day": 26
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "proceduralEquivalentDay",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "FR-JG-ALL-DAY-ST-STEPHEN"
        }
      },
      {
        "ruleId": "FR-CAL-FR-JG-ALL-DAY-WHIT-MONDAY-7D8C38F7C610E2AA",
        "calendarId": "ap22-fr-7d8c38f7c610",
        "jurisdiction": {
          "level": "cantonal",
          "code": "FR"
        },
        "labelKey": "holiday.fr.FR-JG-ALL-DAY-WHIT-MONDAY",
        "labels": {
          "de": "Pfingstmontag",
          "fr": "Lundi de Pentecôte"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-FR-JG-1301-V7926",
            "locator": "Art. 121 Abs. 2"
          }
        ],
        "calculation": {
          "type": "easterOffsetDays",
          "offsetDays": 50
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "proceduralEquivalentDay",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "FR-JG-ALL-DAY-WHIT-MONDAY"
        }
      }
    ],
    "projection": {
      "catalogId": "ch-holiday-catalog",
      "catalogFormatVersion": "2.0.0",
      "projectionId": "projection-7d8c38f7c610e2aa",
      "sourceHash": "c5701e47df0d07bb288719b26d55c31b84fe83ea539578d9192e292e08602570"
    }
  },
  {
    "$schema": "https://raw.githubusercontent.com/davidsteimer/fristenrechner/main/schemas/calendar-rules-v3.schema.json",
    "formatVersion": "3.0.0",
    "dataKind": "calendar",
    "calendarId": "ap22-ge-a36ff7926d08",
    "jurisdiction": {
      "level": "cantonal",
      "code": "GE"
    },
    "validity": {
      "from": "2026-08-29",
      "to": null
    },
    "inherits": [
      "ch-federal-calendar"
    ],
    "review": {
      "reviewedOn": "2026-10-08",
      "status": "candidate",
      "reviewedBy": "Codex",
      "basis": "AP22C1 Datenkandidat auf Grundlage von DEC-2026-030. Keine Quellen- oder Betriebsfreigabe."
    },
    "sources": [
      {
        "sourceId": "SRC-GE-LJF-J145-19910101",
        "sourceType": "officialDossier",
        "title": "Loi sur les jours fériés, LJF",
        "authority": "CH-GE",
        "url": "https://silgeneve.ch/legis/data/rsg_j1_45.htm",
        "documentVersionDate": "1991-01-01",
        "reviewedOn": "2026-09-13",
        "reviewStatus": "monitored"
      }
    ],
    "rules": [
      {
        "ruleId": "GE-CAL-GE-CAL-DAY-ASCENSION-A36FF7926D08ECF0",
        "calendarId": "ap22-ge-a36ff7926d08",
        "jurisdiction": {
          "level": "cantonal",
          "code": "GE"
        },
        "labelKey": "holiday.ge.GE-CAL-DAY-ASCENSION",
        "labels": {
          "de": "Auffahrt",
          "fr": "Ascension"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-GE-LJF-J145-19910101",
            "locator": "Art. 1 Abs. 1 Bst. d"
          }
        ],
        "calculation": {
          "type": "easterOffsetDays",
          "offsetDays": 39
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "GE-CAL-DAY-ASCENSION"
        }
      },
      {
        "ruleId": "GE-CAL-GE-CAL-DAY-CHRISTMAS-A36FF7926D08ECF0",
        "calendarId": "ap22-ge-a36ff7926d08",
        "jurisdiction": {
          "level": "cantonal",
          "code": "GE"
        },
        "labelKey": "holiday.ge.GE-CAL-DAY-CHRISTMAS",
        "labels": {
          "de": "Weihnachten",
          "fr": "Noël"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-GE-LJF-J145-19910101",
            "locator": "Art. 1 Abs. 1 Bst. h"
          }
        ],
        "calculation": {
          "type": "fixedMonthDay",
          "month": 12,
          "day": 25
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "GE-CAL-DAY-CHRISTMAS"
        }
      },
      {
        "ruleId": "GE-CAL-GE-CAL-DAY-EASTER-MONDAY-A36FF7926D08ECF0",
        "calendarId": "ap22-ge-a36ff7926d08",
        "jurisdiction": {
          "level": "cantonal",
          "code": "GE"
        },
        "labelKey": "holiday.ge.GE-CAL-DAY-EASTER-MONDAY",
        "labels": {
          "de": "Ostermontag",
          "fr": "Lundi de Pâques"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-GE-LJF-J145-19910101",
            "locator": "Art. 1 Abs. 1 Bst. c"
          }
        ],
        "calculation": {
          "type": "easterOffsetDays",
          "offsetDays": 1
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "GE-CAL-DAY-EASTER-MONDAY"
        }
      },
      {
        "ruleId": "GE-CAL-GE-CAL-DAY-GENEVA-FAST-A36FF7926D08ECF0",
        "calendarId": "ap22-ge-a36ff7926d08",
        "jurisdiction": {
          "level": "cantonal",
          "code": "GE"
        },
        "labelKey": "holiday.ge.GE-CAL-DAY-GENEVA-FAST",
        "labels": {
          "de": "Genfer Bettag",
          "fr": "Jeûne genevois"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-GE-LJF-J145-19910101",
            "locator": "Art. 1 Abs. 1 Bst. g und Fussnote a"
          }
        ],
        "calculation": {
          "type": "nthWeekdayOffsetDays",
          "month": 9,
          "offsetDays": 4,
          "isoWeekday": 7,
          "occurrence": 1
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "GE-CAL-DAY-GENEVA-FAST"
        }
      },
      {
        "ruleId": "GE-CAL-GE-CAL-DAY-GOOD-FRIDAY-A36FF7926D08ECF0",
        "calendarId": "ap22-ge-a36ff7926d08",
        "jurisdiction": {
          "level": "cantonal",
          "code": "GE"
        },
        "labelKey": "holiday.ge.GE-CAL-DAY-GOOD-FRIDAY",
        "labels": {
          "de": "Karfreitag",
          "fr": "Vendredi saint"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-GE-LJF-J145-19910101",
            "locator": "Art. 1 Abs. 1 Bst. b"
          }
        ],
        "calculation": {
          "type": "easterOffsetDays",
          "offsetDays": -2
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "GE-CAL-DAY-GOOD-FRIDAY"
        }
      },
      {
        "ruleId": "GE-CAL-GE-CAL-DAY-NATIONAL-DAY-A36FF7926D08ECF0",
        "calendarId": "ap22-ge-a36ff7926d08",
        "jurisdiction": {
          "level": "cantonal",
          "code": "GE"
        },
        "labelKey": "holiday.ge.GE-CAL-DAY-NATIONAL-DAY",
        "labels": {
          "de": "Bundesfeiertag",
          "fr": "Fête nationale"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-GE-LJF-J145-19910101",
            "locator": "Art. 1 Abs. 1 Bst. f"
          }
        ],
        "calculation": {
          "type": "fixedMonthDay",
          "month": 8,
          "day": 1
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "GE-CAL-DAY-NATIONAL-DAY"
        }
      },
      {
        "ruleId": "GE-CAL-GE-CAL-DAY-NEW-YEAR-A36FF7926D08ECF0",
        "calendarId": "ap22-ge-a36ff7926d08",
        "jurisdiction": {
          "level": "cantonal",
          "code": "GE"
        },
        "labelKey": "holiday.ge.GE-CAL-DAY-NEW-YEAR",
        "labels": {
          "de": "Neujahr",
          "fr": "Nouvel An"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-GE-LJF-J145-19910101",
            "locator": "Art. 1 Abs. 1 Bst. a"
          }
        ],
        "calculation": {
          "type": "fixedMonthDay",
          "month": 1,
          "day": 1
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "GE-CAL-DAY-NEW-YEAR"
        }
      },
      {
        "ruleId": "GE-CAL-GE-CAL-DAY-RESTORATION-A36FF7926D08ECF0",
        "calendarId": "ap22-ge-a36ff7926d08",
        "jurisdiction": {
          "level": "cantonal",
          "code": "GE"
        },
        "labelKey": "holiday.ge.GE-CAL-DAY-RESTORATION",
        "labels": {
          "de": "Wiederherstellung der Republik",
          "fr": "Restauration de la République"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-GE-LJF-J145-19910101",
            "locator": "Art. 1 Abs. 1 Bst. i"
          }
        ],
        "calculation": {
          "type": "fixedMonthDay",
          "month": 12,
          "day": 31
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "GE-CAL-DAY-RESTORATION"
        }
      },
      {
        "ruleId": "GE-CAL-GE-CAL-DAY-WHIT-MONDAY-A36FF7926D08ECF0",
        "calendarId": "ap22-ge-a36ff7926d08",
        "jurisdiction": {
          "level": "cantonal",
          "code": "GE"
        },
        "labelKey": "holiday.ge.GE-CAL-DAY-WHIT-MONDAY",
        "labels": {
          "de": "Pfingstmontag",
          "fr": "Lundi de Pentecôte"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-GE-LJF-J145-19910101",
            "locator": "Art. 1 Abs. 1 Bst. e"
          }
        ],
        "calculation": {
          "type": "easterOffsetDays",
          "offsetDays": 50
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "GE-CAL-DAY-WHIT-MONDAY"
        }
      }
    ],
    "projection": {
      "catalogId": "ch-holiday-catalog",
      "catalogFormatVersion": "2.0.0",
      "projectionId": "projection-a36ff7926d08ecf0",
      "sourceHash": "c5701e47df0d07bb288719b26d55c31b84fe83ea539578d9192e292e08602570"
    }
  },
  {
    "$schema": "https://raw.githubusercontent.com/davidsteimer/fristenrechner/main/schemas/calendar-rules-v3.schema.json",
    "formatVersion": "3.0.0",
    "dataKind": "calendar",
    "calendarId": "ap22-gl-87c11e156541",
    "jurisdiction": {
      "level": "cantonal",
      "code": "GL"
    },
    "validity": {
      "from": "2026-08-29",
      "to": null
    },
    "inherits": [
      "ch-federal-calendar"
    ],
    "review": {
      "reviewedOn": "2026-10-08",
      "status": "candidate",
      "reviewedBy": "Codex",
      "basis": "AP22C1 Datenkandidat auf Grundlage von DEC-2026-030. Keine Quellen- oder Betriebsfreigabe."
    },
    "sources": [
      {
        "sourceId": "SRC-BUNDESFEIERTAG-19940701",
        "sourceType": "officialDossier",
        "title": "Verordnung über den Bundesfeiertag, SR 116",
        "authority": "CH",
        "url": "https://www.fedlex.admin.ch/eli/cc/1994/1340_1340_1340/de",
        "documentVersionDate": "1994-07-01",
        "reviewedOn": "2026-09-13",
        "reviewStatus": "monitored"
      },
      {
        "sourceId": "SRC-GL-RTG-IXB211-20190701",
        "sourceType": "officialDossier",
        "title": "Gesetz über die öffentlichen Ruhetage, Ruhetagsgesetz",
        "authority": "CH-GL",
        "url": "https://gesetze.gl.ch/api/de/versions/2110/pdf_file",
        "documentVersionDate": "2019-07-01",
        "reviewedOn": "2026-09-22",
        "reviewStatus": "monitored"
      }
    ],
    "rules": [
      {
        "ruleId": "GL-CAL-GL-RTG-ALL-DAY-ALL-SAINTS-87C11E1565410A77",
        "calendarId": "ap22-gl-87c11e156541",
        "jurisdiction": {
          "level": "cantonal",
          "code": "GL"
        },
        "labelKey": "holiday.gl.GL-RTG-ALL-DAY-ALL-SAINTS",
        "labels": {
          "de": "Allerheiligen",
          "fr": "Toussaint"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-GL-RTG-IXB211-20190701",
            "locator": "Art. 2 Abs. 1 Bst. b"
          }
        ],
        "calculation": {
          "type": "fixedMonthDay",
          "month": 11,
          "day": 1
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "GL-RTG-ALL-DAY-ALL-SAINTS"
        }
      },
      {
        "ruleId": "GL-CAL-GL-RTG-ALL-DAY-ASCENSION-87C11E1565410A77",
        "calendarId": "ap22-gl-87c11e156541",
        "jurisdiction": {
          "level": "cantonal",
          "code": "GL"
        },
        "labelKey": "holiday.gl.GL-RTG-ALL-DAY-ASCENSION",
        "labels": {
          "de": "Auffahrt",
          "fr": "Ascension"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-GL-RTG-IXB211-20190701",
            "locator": "Art. 2 Abs. 1 Bst. b"
          }
        ],
        "calculation": {
          "type": "easterOffsetDays",
          "offsetDays": 39
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "GL-RTG-ALL-DAY-ASCENSION"
        }
      },
      {
        "ruleId": "GL-CAL-GL-RTG-ALL-DAY-CHRISTMAS-87C11E1565410A77",
        "calendarId": "ap22-gl-87c11e156541",
        "jurisdiction": {
          "level": "cantonal",
          "code": "GL"
        },
        "labelKey": "holiday.gl.GL-RTG-ALL-DAY-CHRISTMAS",
        "labels": {
          "de": "Weihnachten",
          "fr": "Noël"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-GL-RTG-IXB211-20190701",
            "locator": "Art. 2 Abs. 1 Bst. c"
          }
        ],
        "calculation": {
          "type": "fixedMonthDay",
          "month": 12,
          "day": 25
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "GL-RTG-ALL-DAY-CHRISTMAS"
        }
      },
      {
        "ruleId": "GL-CAL-GL-RTG-ALL-DAY-EASTER-87C11E1565410A77",
        "calendarId": "ap22-gl-87c11e156541",
        "jurisdiction": {
          "level": "cantonal",
          "code": "GL"
        },
        "labelKey": "holiday.gl.GL-RTG-ALL-DAY-EASTER",
        "labels": {
          "de": "Ostern",
          "fr": "Pâques"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-GL-RTG-IXB211-20190701",
            "locator": "Art. 2 Abs. 1 Bst. c"
          }
        ],
        "calculation": {
          "type": "easterOffsetDays",
          "offsetDays": 0
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "GL-RTG-ALL-DAY-EASTER"
        }
      },
      {
        "ruleId": "GL-CAL-GL-RTG-ALL-DAY-EASTER-MONDAY-87C11E1565410A77",
        "calendarId": "ap22-gl-87c11e156541",
        "jurisdiction": {
          "level": "cantonal",
          "code": "GL"
        },
        "labelKey": "holiday.gl.GL-RTG-ALL-DAY-EASTER-MONDAY",
        "labels": {
          "de": "Ostermontag",
          "fr": "Lundi de Pâques"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-GL-RTG-IXB211-20190701",
            "locator": "Art. 2 Abs. 1 Bst. b"
          }
        ],
        "calculation": {
          "type": "easterOffsetDays",
          "offsetDays": 1
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "GL-RTG-ALL-DAY-EASTER-MONDAY"
        }
      },
      {
        "ruleId": "GL-CAL-GL-RTG-ALL-DAY-FEDERAL-FAST-87C11E1565410A77",
        "calendarId": "ap22-gl-87c11e156541",
        "jurisdiction": {
          "level": "cantonal",
          "code": "GL"
        },
        "labelKey": "holiday.gl.GL-RTG-ALL-DAY-FEDERAL-FAST",
        "labels": {
          "de": "Eidgenössischer Dank-, Buss- und Bettag",
          "fr": "Jeûne fédéral"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-GL-RTG-IXB211-20190701",
            "locator": "Art. 2 Abs. 1 Bst. c"
          }
        ],
        "calculation": {
          "type": "nthWeekdayOfMonth",
          "month": 9,
          "isoWeekday": 7,
          "occurrence": 3
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "GL-RTG-ALL-DAY-FEDERAL-FAST"
        }
      },
      {
        "ruleId": "GL-CAL-GL-RTG-ALL-DAY-GOOD-FRIDAY-87C11E1565410A77",
        "calendarId": "ap22-gl-87c11e156541",
        "jurisdiction": {
          "level": "cantonal",
          "code": "GL"
        },
        "labelKey": "holiday.gl.GL-RTG-ALL-DAY-GOOD-FRIDAY",
        "labels": {
          "de": "Karfreitag",
          "fr": "Vendredi saint"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-GL-RTG-IXB211-20190701",
            "locator": "Art. 2 Abs. 1 Bst. c"
          }
        ],
        "calculation": {
          "type": "easterOffsetDays",
          "offsetDays": -2
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "GL-RTG-ALL-DAY-GOOD-FRIDAY"
        }
      },
      {
        "ruleId": "GL-CAL-GL-RTG-ALL-DAY-NAEFELSER-FAHRT-87C11E1565410A77",
        "calendarId": "ap22-gl-87c11e156541",
        "jurisdiction": {
          "level": "cantonal",
          "code": "GL"
        },
        "labelKey": "holiday.gl.GL-RTG-ALL-DAY-NAEFELSER-FAHRT",
        "labels": {
          "de": "Näfelser Fahrt",
          "fr": "Commémoration de la bataille de Näfels"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-GL-RTG-IXB211-20190701",
            "locator": "Art. 2 Abs. 1 Bst. b. Datumsregel gemäss Regierungsratsmitteilung 06.01.2026, fachlich bestätigt 22.09.2026"
          }
        ],
        "calculation": {
          "type": "nthWeekdayOfMonth",
          "month": 4,
          "isoWeekday": 4,
          "occurrence": 1
        },
        "condition": "shiftHolyThursdayBy7Days",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "GL-RTG-ALL-DAY-NAEFELSER-FAHRT"
        }
      },
      {
        "ruleId": "GL-CAL-GL-RTG-ALL-DAY-NATIONAL-DAY-87C11E1565410A77",
        "calendarId": "ap22-gl-87c11e156541",
        "jurisdiction": {
          "level": "cantonal",
          "code": "GL"
        },
        "labelKey": "holiday.gl.GL-RTG-ALL-DAY-NATIONAL-DAY",
        "labels": {
          "de": "Bundesfeiertag",
          "fr": "Fête nationale"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-BUNDESFEIERTAG-19940701",
            "locator": "SR 116 Art. 1, neue offene Anwendung auf dieses Geltungsprofil"
          }
        ],
        "calculation": {
          "type": "fixedMonthDay",
          "month": 8,
          "day": 1
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "GL-RTG-ALL-DAY-NATIONAL-DAY"
        }
      },
      {
        "ruleId": "GL-CAL-GL-RTG-ALL-DAY-NEW-YEAR-87C11E1565410A77",
        "calendarId": "ap22-gl-87c11e156541",
        "jurisdiction": {
          "level": "cantonal",
          "code": "GL"
        },
        "labelKey": "holiday.gl.GL-RTG-ALL-DAY-NEW-YEAR",
        "labels": {
          "de": "Neujahr",
          "fr": "Nouvel An"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-GL-RTG-IXB211-20190701",
            "locator": "Art. 2 Abs. 1 Bst. b"
          }
        ],
        "calculation": {
          "type": "fixedMonthDay",
          "month": 1,
          "day": 1
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "GL-RTG-ALL-DAY-NEW-YEAR"
        }
      },
      {
        "ruleId": "GL-CAL-GL-RTG-ALL-DAY-PENTECOST-87C11E1565410A77",
        "calendarId": "ap22-gl-87c11e156541",
        "jurisdiction": {
          "level": "cantonal",
          "code": "GL"
        },
        "labelKey": "holiday.gl.GL-RTG-ALL-DAY-PENTECOST",
        "labels": {
          "de": "Pfingsten",
          "fr": "Pentecôte"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-GL-RTG-IXB211-20190701",
            "locator": "Art. 2 Abs. 1 Bst. c"
          }
        ],
        "calculation": {
          "type": "easterOffsetDays",
          "offsetDays": 49
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "GL-RTG-ALL-DAY-PENTECOST"
        }
      },
      {
        "ruleId": "GL-CAL-GL-RTG-ALL-DAY-ST-STEPHEN-87C11E1565410A77",
        "calendarId": "ap22-gl-87c11e156541",
        "jurisdiction": {
          "level": "cantonal",
          "code": "GL"
        },
        "labelKey": "holiday.gl.GL-RTG-ALL-DAY-ST-STEPHEN",
        "labels": {
          "de": "Stephanstag",
          "fr": "Saint-Étienne"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-GL-RTG-IXB211-20190701",
            "locator": "Art. 2 Abs. 1 Bst. b"
          }
        ],
        "calculation": {
          "type": "fixedMonthDay",
          "month": 12,
          "day": 26
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "GL-RTG-ALL-DAY-ST-STEPHEN"
        }
      },
      {
        "ruleId": "GL-CAL-GL-RTG-ALL-DAY-WHIT-MONDAY-87C11E1565410A77",
        "calendarId": "ap22-gl-87c11e156541",
        "jurisdiction": {
          "level": "cantonal",
          "code": "GL"
        },
        "labelKey": "holiday.gl.GL-RTG-ALL-DAY-WHIT-MONDAY",
        "labels": {
          "de": "Pfingstmontag",
          "fr": "Lundi de Pentecôte"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-GL-RTG-IXB211-20190701",
            "locator": "Art. 2 Abs. 1 Bst. b"
          }
        ],
        "calculation": {
          "type": "easterOffsetDays",
          "offsetDays": 50
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "GL-RTG-ALL-DAY-WHIT-MONDAY"
        }
      }
    ],
    "projection": {
      "catalogId": "ch-holiday-catalog",
      "catalogFormatVersion": "2.0.0",
      "projectionId": "projection-87c11e1565410a77",
      "sourceHash": "c5701e47df0d07bb288719b26d55c31b84fe83ea539578d9192e292e08602570"
    }
  },
  {
    "$schema": "https://raw.githubusercontent.com/davidsteimer/fristenrechner/main/schemas/calendar-rules-v3.schema.json",
    "formatVersion": "3.0.0",
    "dataKind": "calendar",
    "calendarId": "ap22-gr-bf0366c8eda2",
    "jurisdiction": {
      "level": "cantonal",
      "code": "GR"
    },
    "validity": {
      "from": "2026-08-29",
      "to": null
    },
    "inherits": [
      "ch-federal-calendar"
    ],
    "review": {
      "reviewedOn": "2026-10-08",
      "status": "candidate",
      "reviewedBy": "Codex",
      "basis": "AP22C1 Datenkandidat auf Grundlage von DEC-2026-030. Keine Quellen- oder Betriebsfreigabe."
    },
    "sources": [
      {
        "sourceId": "SRC-BUNDESFEIERTAG-19940701",
        "sourceType": "officialDossier",
        "title": "Verordnung über den Bundesfeiertag, SR 116",
        "authority": "CH",
        "url": "https://www.fedlex.admin.ch/eli/cc/1994/1340_1340_1340/de",
        "documentVersionDate": "1994-07-01",
        "reviewedOn": "2026-09-13",
        "reviewStatus": "monitored"
      },
      {
        "sourceId": "SRC-GR-RUHETAGE-520100-20160101",
        "sourceType": "officialDossier",
        "title": "Gesetz über die öffentlichen Ruhetage, Ruhetagsgesetz",
        "authority": "CH-GR",
        "url": "https://www.gr-lex.gr.ch/api/de/versions/2604/pdf_file",
        "documentVersionDate": "2016-01-01",
        "reviewedOn": "2026-09-13",
        "reviewStatus": "monitored"
      }
    ],
    "rules": [
      {
        "ruleId": "GR-CAL-GR-CAL-DAY-ASCENSION-BF0366C8EDA26257",
        "calendarId": "ap22-gr-bf0366c8eda2",
        "jurisdiction": {
          "level": "cantonal",
          "code": "GR"
        },
        "labelKey": "holiday.gr.GR-CAL-DAY-ASCENSION",
        "labels": {
          "de": "Auffahrt",
          "fr": "Ascension"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-GR-RUHETAGE-520100-20160101",
            "locator": "Art. 2 Abs. 1 Bst. b"
          }
        ],
        "calculation": {
          "type": "easterOffsetDays",
          "offsetDays": 39
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "GR-CAL-DAY-ASCENSION"
        }
      },
      {
        "ruleId": "GR-CAL-GR-CAL-DAY-CHRISTMAS-BF0366C8EDA26257",
        "calendarId": "ap22-gr-bf0366c8eda2",
        "jurisdiction": {
          "level": "cantonal",
          "code": "GR"
        },
        "labelKey": "holiday.gr.GR-CAL-DAY-CHRISTMAS",
        "labels": {
          "de": "Weihnachtstag",
          "fr": "Noël"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-GR-RUHETAGE-520100-20160101",
            "locator": "Art. 2 Abs. 1 Bst. b und Abs. 2"
          }
        ],
        "calculation": {
          "type": "fixedMonthDay",
          "month": 12,
          "day": 25
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "GR-CAL-DAY-CHRISTMAS"
        }
      },
      {
        "ruleId": "GR-CAL-GR-CAL-DAY-EASTER-BF0366C8EDA26257",
        "calendarId": "ap22-gr-bf0366c8eda2",
        "jurisdiction": {
          "level": "cantonal",
          "code": "GR"
        },
        "labelKey": "holiday.gr.GR-CAL-DAY-EASTER",
        "labels": {
          "de": "Ostersonntag",
          "fr": "Pâques"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-GR-RUHETAGE-520100-20160101",
            "locator": "Art. 2 Abs. 2"
          }
        ],
        "calculation": {
          "type": "easterOffsetDays",
          "offsetDays": 0
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "GR-CAL-DAY-EASTER"
        }
      },
      {
        "ruleId": "GR-CAL-GR-CAL-DAY-EASTER-MONDAY-BF0366C8EDA26257",
        "calendarId": "ap22-gr-bf0366c8eda2",
        "jurisdiction": {
          "level": "cantonal",
          "code": "GR"
        },
        "labelKey": "holiday.gr.GR-CAL-DAY-EASTER-MONDAY",
        "labels": {
          "de": "Ostermontag",
          "fr": "Lundi de Pâques"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-GR-RUHETAGE-520100-20160101",
            "locator": "Art. 2 Abs. 1 Bst. b"
          }
        ],
        "calculation": {
          "type": "easterOffsetDays",
          "offsetDays": 1
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "GR-CAL-DAY-EASTER-MONDAY"
        }
      },
      {
        "ruleId": "GR-CAL-GR-CAL-DAY-FEDERAL-FAST-BF0366C8EDA26257",
        "calendarId": "ap22-gr-bf0366c8eda2",
        "jurisdiction": {
          "level": "cantonal",
          "code": "GR"
        },
        "labelKey": "holiday.gr.GR-CAL-DAY-FEDERAL-FAST",
        "labels": {
          "de": "Eidgenössischer Bettag",
          "fr": "Jeûne fédéral"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-GR-RUHETAGE-520100-20160101",
            "locator": "Art. 2 Abs. 2"
          }
        ],
        "calculation": {
          "type": "nthWeekdayOfMonth",
          "month": 9,
          "isoWeekday": 7,
          "occurrence": 3
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "GR-CAL-DAY-FEDERAL-FAST"
        }
      },
      {
        "ruleId": "GR-CAL-GR-CAL-DAY-GOOD-FRIDAY-BF0366C8EDA26257",
        "calendarId": "ap22-gr-bf0366c8eda2",
        "jurisdiction": {
          "level": "cantonal",
          "code": "GR"
        },
        "labelKey": "holiday.gr.GR-CAL-DAY-GOOD-FRIDAY",
        "labels": {
          "de": "Karfreitag",
          "fr": "Vendredi saint"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-GR-RUHETAGE-520100-20160101",
            "locator": "Art. 2 Abs. 1 Bst. b und Abs. 2"
          }
        ],
        "calculation": {
          "type": "easterOffsetDays",
          "offsetDays": -2
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "GR-CAL-DAY-GOOD-FRIDAY"
        }
      },
      {
        "ruleId": "GR-CAL-GR-CAL-DAY-NATIONAL-DAY-BF0366C8EDA26257",
        "calendarId": "ap22-gr-bf0366c8eda2",
        "jurisdiction": {
          "level": "cantonal",
          "code": "GR"
        },
        "labelKey": "holiday.gr.GR-CAL-DAY-NATIONAL-DAY",
        "labels": {
          "de": "Bundesfeiertag",
          "fr": "Fête nationale"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-BUNDESFEIERTAG-19940701",
            "locator": "Art. 1"
          }
        ],
        "calculation": {
          "type": "fixedMonthDay",
          "month": 8,
          "day": 1
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "GR-CAL-DAY-NATIONAL-DAY"
        }
      },
      {
        "ruleId": "GR-CAL-GR-CAL-DAY-NEW-YEAR-BF0366C8EDA26257",
        "calendarId": "ap22-gr-bf0366c8eda2",
        "jurisdiction": {
          "level": "cantonal",
          "code": "GR"
        },
        "labelKey": "holiday.gr.GR-CAL-DAY-NEW-YEAR",
        "labels": {
          "de": "Neujahr",
          "fr": "Nouvel An"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-GR-RUHETAGE-520100-20160101",
            "locator": "Art. 2 Abs. 1 Bst. b"
          }
        ],
        "calculation": {
          "type": "fixedMonthDay",
          "month": 1,
          "day": 1
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "GR-CAL-DAY-NEW-YEAR"
        }
      },
      {
        "ruleId": "GR-CAL-GR-CAL-DAY-PENTECOST-BF0366C8EDA26257",
        "calendarId": "ap22-gr-bf0366c8eda2",
        "jurisdiction": {
          "level": "cantonal",
          "code": "GR"
        },
        "labelKey": "holiday.gr.GR-CAL-DAY-PENTECOST",
        "labels": {
          "de": "Pfingstsonntag",
          "fr": "Pentecôte"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-GR-RUHETAGE-520100-20160101",
            "locator": "Art. 2 Abs. 2"
          }
        ],
        "calculation": {
          "type": "easterOffsetDays",
          "offsetDays": 49
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "GR-CAL-DAY-PENTECOST"
        }
      },
      {
        "ruleId": "GR-CAL-GR-CAL-DAY-ST-STEPHEN-BF0366C8EDA26257",
        "calendarId": "ap22-gr-bf0366c8eda2",
        "jurisdiction": {
          "level": "cantonal",
          "code": "GR"
        },
        "labelKey": "holiday.gr.GR-CAL-DAY-ST-STEPHEN",
        "labels": {
          "de": "Stefanstag",
          "fr": "Saint-Étienne"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-GR-RUHETAGE-520100-20160101",
            "locator": "Art. 2 Abs. 1 Bst. b"
          }
        ],
        "calculation": {
          "type": "fixedMonthDay",
          "month": 12,
          "day": 26
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "GR-CAL-DAY-ST-STEPHEN"
        }
      },
      {
        "ruleId": "GR-CAL-GR-CAL-DAY-WHIT-MONDAY-BF0366C8EDA26257",
        "calendarId": "ap22-gr-bf0366c8eda2",
        "jurisdiction": {
          "level": "cantonal",
          "code": "GR"
        },
        "labelKey": "holiday.gr.GR-CAL-DAY-WHIT-MONDAY",
        "labels": {
          "de": "Pfingstmontag",
          "fr": "Lundi de Pentecôte"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-GR-RUHETAGE-520100-20160101",
            "locator": "Art. 2 Abs. 1 Bst. b"
          }
        ],
        "calculation": {
          "type": "easterOffsetDays",
          "offsetDays": 50
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "GR-CAL-DAY-WHIT-MONDAY"
        }
      }
    ],
    "projection": {
      "catalogId": "ch-holiday-catalog",
      "catalogFormatVersion": "2.0.0",
      "projectionId": "projection-bf0366c8eda26257",
      "sourceHash": "c5701e47df0d07bb288719b26d55c31b84fe83ea539578d9192e292e08602570"
    }
  },
  {
    "$schema": "https://raw.githubusercontent.com/davidsteimer/fristenrechner/main/schemas/calendar-rules-v3.schema.json",
    "formatVersion": "3.0.0",
    "dataKind": "calendar",
    "calendarId": "ap22-ju-b096c09f506c",
    "jurisdiction": {
      "level": "cantonal",
      "code": "JU"
    },
    "validity": {
      "from": "2026-08-29",
      "to": null
    },
    "inherits": [
      "ch-federal-calendar"
    ],
    "review": {
      "reviewedOn": "2026-10-08",
      "status": "candidate",
      "reviewedBy": "Codex",
      "basis": "AP22C1 Datenkandidat auf Grundlage von DEC-2026-030. Keine Quellen- oder Betriebsfreigabe."
    },
    "sources": [
      {
        "sourceId": "SRC-BUNDESFEIERTAG-19940701",
        "sourceType": "officialDossier",
        "title": "Verordnung über den Bundesfeiertag, SR 116",
        "authority": "CH",
        "url": "https://www.fedlex.admin.ch/eli/cc/1994/1340_1340_1340/de",
        "documentVersionDate": "1994-07-01",
        "reviewedOn": "2026-09-13",
        "reviewStatus": "monitored"
      },
      {
        "sourceId": "SRC-JU-LJF-5551-20230101",
        "sourceType": "officialDossier",
        "title": "Loi sur les jours fériés officiels et le repos dominical",
        "authority": "CH-JU",
        "url": "https://rsju.jura.ch/Htdocs/Files/v/38948.pdf",
        "documentVersionDate": "2023-01-01",
        "reviewedOn": "2026-09-13",
        "reviewStatus": "monitored"
      }
    ],
    "rules": [
      {
        "ruleId": "JU-CAL-JU-LJF-OFFICIAL-DAY-ALL-SAINTS-B096C09F506CDF39",
        "calendarId": "ap22-ju-b096c09f506c",
        "jurisdiction": {
          "level": "cantonal",
          "code": "JU"
        },
        "labelKey": "holiday.ju.JU-LJF-OFFICIAL-DAY-ALL-SAINTS",
        "labels": {
          "de": "Allerheiligen",
          "fr": "Toussaint"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-JU-LJF-5551-20230101",
            "locator": "Art. 3 Bst. b"
          }
        ],
        "calculation": {
          "type": "fixedMonthDay",
          "month": 11,
          "day": 1
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "JU-LJF-OFFICIAL-DAY-ALL-SAINTS"
        }
      },
      {
        "ruleId": "JU-CAL-JU-LJF-OFFICIAL-DAY-ASCENSION-B096C09F506CDF39",
        "calendarId": "ap22-ju-b096c09f506c",
        "jurisdiction": {
          "level": "cantonal",
          "code": "JU"
        },
        "labelKey": "holiday.ju.JU-LJF-OFFICIAL-DAY-ASCENSION",
        "labels": {
          "de": "Auffahrt",
          "fr": "Ascension"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-JU-LJF-5551-20230101",
            "locator": "Art. 3 Bst. b"
          }
        ],
        "calculation": {
          "type": "easterOffsetDays",
          "offsetDays": 39
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "JU-LJF-OFFICIAL-DAY-ASCENSION"
        }
      },
      {
        "ruleId": "JU-CAL-JU-LJF-OFFICIAL-DAY-ASSUMPTION-B096C09F506CDF39",
        "calendarId": "ap22-ju-b096c09f506c",
        "jurisdiction": {
          "level": "cantonal",
          "code": "JU"
        },
        "labelKey": "holiday.ju.JU-LJF-OFFICIAL-DAY-ASSUMPTION",
        "labels": {
          "de": "Mariä Himmelfahrt",
          "fr": "Assomption"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-JU-LJF-5551-20230101",
            "locator": "Art. 3 Bst. b"
          }
        ],
        "calculation": {
          "type": "fixedMonthDay",
          "month": 8,
          "day": 15
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "JU-LJF-OFFICIAL-DAY-ASSUMPTION"
        }
      },
      {
        "ruleId": "JU-CAL-JU-LJF-OFFICIAL-DAY-BERCHTOLD-B096C09F506CDF39",
        "calendarId": "ap22-ju-b096c09f506c",
        "jurisdiction": {
          "level": "cantonal",
          "code": "JU"
        },
        "labelKey": "holiday.ju.JU-LJF-OFFICIAL-DAY-BERCHTOLD",
        "labels": {
          "de": "2. Januar",
          "fr": "2 janvier"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-JU-LJF-5551-20230101",
            "locator": "Art. 3 Bst. b"
          }
        ],
        "calculation": {
          "type": "fixedMonthDay",
          "month": 1,
          "day": 2
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "JU-LJF-OFFICIAL-DAY-BERCHTOLD"
        }
      },
      {
        "ruleId": "JU-CAL-JU-LJF-OFFICIAL-DAY-CHRISTMAS-B096C09F506CDF39",
        "calendarId": "ap22-ju-b096c09f506c",
        "jurisdiction": {
          "level": "cantonal",
          "code": "JU"
        },
        "labelKey": "holiday.ju.JU-LJF-OFFICIAL-DAY-CHRISTMAS",
        "labels": {
          "de": "Weihnachten",
          "fr": "Noël"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-JU-LJF-5551-20230101",
            "locator": "Art. 3 Bst. b"
          }
        ],
        "calculation": {
          "type": "fixedMonthDay",
          "month": 12,
          "day": 25
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "JU-LJF-OFFICIAL-DAY-CHRISTMAS"
        }
      },
      {
        "ruleId": "JU-CAL-JU-LJF-OFFICIAL-DAY-CORPUS-CHRISTI-B096C09F506CDF39",
        "calendarId": "ap22-ju-b096c09f506c",
        "jurisdiction": {
          "level": "cantonal",
          "code": "JU"
        },
        "labelKey": "holiday.ju.JU-LJF-OFFICIAL-DAY-CORPUS-CHRISTI",
        "labels": {
          "de": "Fronleichnam",
          "fr": "Fête-Dieu"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-JU-LJF-5551-20230101",
            "locator": "Art. 3 Bst. b"
          }
        ],
        "calculation": {
          "type": "easterOffsetDays",
          "offsetDays": 60
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "JU-LJF-OFFICIAL-DAY-CORPUS-CHRISTI"
        }
      },
      {
        "ruleId": "JU-CAL-JU-LJF-OFFICIAL-DAY-EASTER-B096C09F506CDF39",
        "calendarId": "ap22-ju-b096c09f506c",
        "jurisdiction": {
          "level": "cantonal",
          "code": "JU"
        },
        "labelKey": "holiday.ju.JU-LJF-OFFICIAL-DAY-EASTER",
        "labels": {
          "de": "Ostern",
          "fr": "Pâques"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-JU-LJF-5551-20230101",
            "locator": "Art. 3 Bst. b"
          }
        ],
        "calculation": {
          "type": "easterOffsetDays",
          "offsetDays": 0
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "JU-LJF-OFFICIAL-DAY-EASTER"
        }
      },
      {
        "ruleId": "JU-CAL-JU-LJF-OFFICIAL-DAY-EASTER-MONDAY-B096C09F506CDF39",
        "calendarId": "ap22-ju-b096c09f506c",
        "jurisdiction": {
          "level": "cantonal",
          "code": "JU"
        },
        "labelKey": "holiday.ju.JU-LJF-OFFICIAL-DAY-EASTER-MONDAY",
        "labels": {
          "de": "Ostermontag",
          "fr": "Lundi de Pâques"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-JU-LJF-5551-20230101",
            "locator": "Art. 3 Bst. b"
          }
        ],
        "calculation": {
          "type": "easterOffsetDays",
          "offsetDays": 1
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "JU-LJF-OFFICIAL-DAY-EASTER-MONDAY"
        }
      },
      {
        "ruleId": "JU-CAL-JU-LJF-OFFICIAL-DAY-GOOD-FRIDAY-B096C09F506CDF39",
        "calendarId": "ap22-ju-b096c09f506c",
        "jurisdiction": {
          "level": "cantonal",
          "code": "JU"
        },
        "labelKey": "holiday.ju.JU-LJF-OFFICIAL-DAY-GOOD-FRIDAY",
        "labels": {
          "de": "Karfreitag",
          "fr": "Vendredi saint"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-JU-LJF-5551-20230101",
            "locator": "Art. 3 Bst. b"
          }
        ],
        "calculation": {
          "type": "easterOffsetDays",
          "offsetDays": -2
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "JU-LJF-OFFICIAL-DAY-GOOD-FRIDAY"
        }
      },
      {
        "ruleId": "JU-CAL-JU-LJF-OFFICIAL-DAY-JU-PLEBISCITE-B096C09F506CDF39",
        "calendarId": "ap22-ju-b096c09f506c",
        "jurisdiction": {
          "level": "cantonal",
          "code": "JU"
        },
        "labelKey": "holiday.ju.JU-LJF-OFFICIAL-DAY-JU-PLEBISCITE",
        "labels": {
          "de": "Gedenktag der Volksabstimmung (23. Juni)",
          "fr": "Commémoration du Plébiscite (23 juin)"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-JU-LJF-5551-20230101",
            "locator": "Art. 3 Bst. b"
          }
        ],
        "calculation": {
          "type": "fixedMonthDay",
          "month": 6,
          "day": 23
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "JU-LJF-OFFICIAL-DAY-JU-PLEBISCITE"
        }
      },
      {
        "ruleId": "JU-CAL-JU-LJF-OFFICIAL-DAY-MAY1-B096C09F506CDF39",
        "calendarId": "ap22-ju-b096c09f506c",
        "jurisdiction": {
          "level": "cantonal",
          "code": "JU"
        },
        "labelKey": "holiday.ju.JU-LJF-OFFICIAL-DAY-MAY1",
        "labels": {
          "de": "Tag der Arbeit (1. Mai)",
          "fr": "Fête du travail (1er mai)"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-JU-LJF-5551-20230101",
            "locator": "Art. 3 Bst. b"
          }
        ],
        "calculation": {
          "type": "fixedMonthDay",
          "month": 5,
          "day": 1
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "JU-LJF-OFFICIAL-DAY-MAY1"
        }
      },
      {
        "ruleId": "JU-CAL-JU-LJF-OFFICIAL-DAY-NATIONAL-DAY-B096C09F506CDF39",
        "calendarId": "ap22-ju-b096c09f506c",
        "jurisdiction": {
          "level": "cantonal",
          "code": "JU"
        },
        "labelKey": "holiday.ju.JU-LJF-OFFICIAL-DAY-NATIONAL-DAY",
        "labels": {
          "de": "Bundesfeiertag",
          "fr": "Fête nationale"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-BUNDESFEIERTAG-19940701",
            "locator": "SR 116 Art. 1, neue Anwendung auf JU-LJF-OFFICIAL. Kantonaler Bezug Art. 3 Bst. b"
          }
        ],
        "calculation": {
          "type": "fixedMonthDay",
          "month": 8,
          "day": 1
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "JU-LJF-OFFICIAL-DAY-NATIONAL-DAY"
        }
      },
      {
        "ruleId": "JU-CAL-JU-LJF-OFFICIAL-DAY-NEW-YEAR-B096C09F506CDF39",
        "calendarId": "ap22-ju-b096c09f506c",
        "jurisdiction": {
          "level": "cantonal",
          "code": "JU"
        },
        "labelKey": "holiday.ju.JU-LJF-OFFICIAL-DAY-NEW-YEAR",
        "labels": {
          "de": "Neujahr",
          "fr": "Nouvel An"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-JU-LJF-5551-20230101",
            "locator": "Art. 3 Bst. b"
          }
        ],
        "calculation": {
          "type": "fixedMonthDay",
          "month": 1,
          "day": 1
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "JU-LJF-OFFICIAL-DAY-NEW-YEAR"
        }
      },
      {
        "ruleId": "JU-CAL-JU-LJF-OFFICIAL-DAY-PENTECOST-B096C09F506CDF39",
        "calendarId": "ap22-ju-b096c09f506c",
        "jurisdiction": {
          "level": "cantonal",
          "code": "JU"
        },
        "labelKey": "holiday.ju.JU-LJF-OFFICIAL-DAY-PENTECOST",
        "labels": {
          "de": "Pfingsten",
          "fr": "Pentecôte"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-JU-LJF-5551-20230101",
            "locator": "Art. 3 Bst. b"
          }
        ],
        "calculation": {
          "type": "easterOffsetDays",
          "offsetDays": 49
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "JU-LJF-OFFICIAL-DAY-PENTECOST"
        }
      },
      {
        "ruleId": "JU-CAL-JU-LJF-OFFICIAL-DAY-WHIT-MONDAY-B096C09F506CDF39",
        "calendarId": "ap22-ju-b096c09f506c",
        "jurisdiction": {
          "level": "cantonal",
          "code": "JU"
        },
        "labelKey": "holiday.ju.JU-LJF-OFFICIAL-DAY-WHIT-MONDAY",
        "labels": {
          "de": "Pfingstmontag",
          "fr": "Lundi de Pentecôte"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-JU-LJF-5551-20230101",
            "locator": "Art. 3 Bst. b"
          }
        ],
        "calculation": {
          "type": "easterOffsetDays",
          "offsetDays": 50
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "JU-LJF-OFFICIAL-DAY-WHIT-MONDAY"
        }
      }
    ],
    "projection": {
      "catalogId": "ch-holiday-catalog",
      "catalogFormatVersion": "2.0.0",
      "projectionId": "projection-b096c09f506cdf39",
      "sourceHash": "c5701e47df0d07bb288719b26d55c31b84fe83ea539578d9192e292e08602570"
    }
  },
  {
    "$schema": "https://raw.githubusercontent.com/davidsteimer/fristenrechner/main/schemas/calendar-rules-v3.schema.json",
    "formatVersion": "3.0.0",
    "dataKind": "calendar",
    "calendarId": "ap22-lu-55514cd91f06",
    "jurisdiction": {
      "level": "cantonal",
      "code": "LU"
    },
    "validity": {
      "from": "2026-08-29",
      "to": null
    },
    "inherits": [
      "ch-federal-calendar"
    ],
    "review": {
      "reviewedOn": "2026-10-08",
      "status": "candidate",
      "reviewedBy": "Codex",
      "basis": "AP22C1 Datenkandidat auf Grundlage von DEC-2026-030. Keine Quellen- oder Betriebsfreigabe."
    },
    "sources": [
      {
        "sourceId": "SRC-LU-JUSG-260-20260101",
        "sourceType": "officialDossier",
        "title": "Justizgesetz, JusG",
        "authority": "CH-LU",
        "url": "https://srl.lu.ch/data/260/de",
        "documentVersionDate": "2026-01-01",
        "reviewedOn": "2026-09-13",
        "reviewStatus": "monitored"
      }
    ],
    "rules": [
      {
        "ruleId": "LU-CAL-LU-JUSG-ART76-DAY-ALL-SAINTS-55514CD91F06C7F0",
        "calendarId": "ap22-lu-55514cd91f06",
        "jurisdiction": {
          "level": "cantonal",
          "code": "LU"
        },
        "labelKey": "holiday.lu.LU-JUSG-ART76-DAY-ALL-SAINTS",
        "labels": {
          "de": "Allerheiligen",
          "fr": "Toussaint"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-LU-JUSG-260-20260101",
            "locator": "§ 76"
          }
        ],
        "calculation": {
          "type": "fixedMonthDay",
          "month": 11,
          "day": 1
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "proceduralEquivalentDay",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "LU-JUSG-ART76-DAY-ALL-SAINTS"
        }
      },
      {
        "ruleId": "LU-CAL-LU-JUSG-ART76-DAY-ASCENSION-55514CD91F06C7F0",
        "calendarId": "ap22-lu-55514cd91f06",
        "jurisdiction": {
          "level": "cantonal",
          "code": "LU"
        },
        "labelKey": "holiday.lu.LU-JUSG-ART76-DAY-ASCENSION",
        "labels": {
          "de": "Auffahrt",
          "fr": "Ascension"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-LU-JUSG-260-20260101",
            "locator": "§ 76"
          }
        ],
        "calculation": {
          "type": "easterOffsetDays",
          "offsetDays": 39
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "proceduralEquivalentDay",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "LU-JUSG-ART76-DAY-ASCENSION"
        }
      },
      {
        "ruleId": "LU-CAL-LU-JUSG-ART76-DAY-ASSUMPTION-55514CD91F06C7F0",
        "calendarId": "ap22-lu-55514cd91f06",
        "jurisdiction": {
          "level": "cantonal",
          "code": "LU"
        },
        "labelKey": "holiday.lu.LU-JUSG-ART76-DAY-ASSUMPTION",
        "labels": {
          "de": "Mariä Himmelfahrt",
          "fr": "Assomption"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-LU-JUSG-260-20260101",
            "locator": "§ 76"
          }
        ],
        "calculation": {
          "type": "fixedMonthDay",
          "month": 8,
          "day": 15
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "proceduralEquivalentDay",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "LU-JUSG-ART76-DAY-ASSUMPTION"
        }
      },
      {
        "ruleId": "LU-CAL-LU-JUSG-ART76-DAY-BERCHTOLD-55514CD91F06C7F0",
        "calendarId": "ap22-lu-55514cd91f06",
        "jurisdiction": {
          "level": "cantonal",
          "code": "LU"
        },
        "labelKey": "holiday.lu.LU-JUSG-ART76-DAY-BERCHTOLD",
        "labels": {
          "de": "Berchtoldstag",
          "fr": "Saint-Berchtold"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-LU-JUSG-260-20260101",
            "locator": "§ 76"
          }
        ],
        "calculation": {
          "type": "fixedMonthDay",
          "month": 1,
          "day": 2
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "proceduralEquivalentDay",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "LU-JUSG-ART76-DAY-BERCHTOLD"
        }
      },
      {
        "ruleId": "LU-CAL-LU-JUSG-ART76-DAY-CHRISTMAS-55514CD91F06C7F0",
        "calendarId": "ap22-lu-55514cd91f06",
        "jurisdiction": {
          "level": "cantonal",
          "code": "LU"
        },
        "labelKey": "holiday.lu.LU-JUSG-ART76-DAY-CHRISTMAS",
        "labels": {
          "de": "Weihnachten",
          "fr": "Noël"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-LU-JUSG-260-20260101",
            "locator": "§ 76"
          }
        ],
        "calculation": {
          "type": "fixedMonthDay",
          "month": 12,
          "day": 25
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "proceduralEquivalentDay",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "LU-JUSG-ART76-DAY-CHRISTMAS"
        }
      },
      {
        "ruleId": "LU-CAL-LU-JUSG-ART76-DAY-CORPUS-CHRISTI-55514CD91F06C7F0",
        "calendarId": "ap22-lu-55514cd91f06",
        "jurisdiction": {
          "level": "cantonal",
          "code": "LU"
        },
        "labelKey": "holiday.lu.LU-JUSG-ART76-DAY-CORPUS-CHRISTI",
        "labels": {
          "de": "Fronleichnam",
          "fr": "Fête-Dieu"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-LU-JUSG-260-20260101",
            "locator": "§ 76"
          }
        ],
        "calculation": {
          "type": "easterOffsetDays",
          "offsetDays": 60
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "proceduralEquivalentDay",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "LU-JUSG-ART76-DAY-CORPUS-CHRISTI"
        }
      },
      {
        "ruleId": "LU-CAL-LU-JUSG-ART76-DAY-EASTER-MONDAY-55514CD91F06C7F0",
        "calendarId": "ap22-lu-55514cd91f06",
        "jurisdiction": {
          "level": "cantonal",
          "code": "LU"
        },
        "labelKey": "holiday.lu.LU-JUSG-ART76-DAY-EASTER-MONDAY",
        "labels": {
          "de": "Ostermontag",
          "fr": "Lundi de Pâques"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-LU-JUSG-260-20260101",
            "locator": "§ 76"
          }
        ],
        "calculation": {
          "type": "easterOffsetDays",
          "offsetDays": 1
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "proceduralEquivalentDay",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "LU-JUSG-ART76-DAY-EASTER-MONDAY"
        }
      },
      {
        "ruleId": "LU-CAL-LU-JUSG-ART76-DAY-GOOD-FRIDAY-55514CD91F06C7F0",
        "calendarId": "ap22-lu-55514cd91f06",
        "jurisdiction": {
          "level": "cantonal",
          "code": "LU"
        },
        "labelKey": "holiday.lu.LU-JUSG-ART76-DAY-GOOD-FRIDAY",
        "labels": {
          "de": "Karfreitag",
          "fr": "Vendredi saint"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-LU-JUSG-260-20260101",
            "locator": "§ 76"
          }
        ],
        "calculation": {
          "type": "easterOffsetDays",
          "offsetDays": -2
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "proceduralEquivalentDay",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "LU-JUSG-ART76-DAY-GOOD-FRIDAY"
        }
      },
      {
        "ruleId": "LU-CAL-LU-JUSG-ART76-DAY-IMMACULATE-CONCEPTION-55514CD91F06C7F0",
        "calendarId": "ap22-lu-55514cd91f06",
        "jurisdiction": {
          "level": "cantonal",
          "code": "LU"
        },
        "labelKey": "holiday.lu.LU-JUSG-ART76-DAY-IMMACULATE-CONCEPTION",
        "labels": {
          "de": "Mariä Empfängnis",
          "fr": "Immaculée Conception"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-LU-JUSG-260-20260101",
            "locator": "§ 76"
          }
        ],
        "calculation": {
          "type": "fixedMonthDay",
          "month": 12,
          "day": 8
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "proceduralEquivalentDay",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "LU-JUSG-ART76-DAY-IMMACULATE-CONCEPTION"
        }
      },
      {
        "ruleId": "LU-CAL-LU-JUSG-ART76-DAY-NATIONAL-DAY-55514CD91F06C7F0",
        "calendarId": "ap22-lu-55514cd91f06",
        "jurisdiction": {
          "level": "cantonal",
          "code": "LU"
        },
        "labelKey": "holiday.lu.LU-JUSG-ART76-DAY-NATIONAL-DAY",
        "labels": {
          "de": "Bundesfeiertag",
          "fr": "Fête nationale"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-LU-JUSG-260-20260101",
            "locator": "§ 76"
          }
        ],
        "calculation": {
          "type": "fixedMonthDay",
          "month": 8,
          "day": 1
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "proceduralEquivalentDay",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "LU-JUSG-ART76-DAY-NATIONAL-DAY"
        }
      },
      {
        "ruleId": "LU-CAL-LU-JUSG-ART76-DAY-NEW-YEAR-55514CD91F06C7F0",
        "calendarId": "ap22-lu-55514cd91f06",
        "jurisdiction": {
          "level": "cantonal",
          "code": "LU"
        },
        "labelKey": "holiday.lu.LU-JUSG-ART76-DAY-NEW-YEAR",
        "labels": {
          "de": "Neujahr",
          "fr": "Nouvel An"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-LU-JUSG-260-20260101",
            "locator": "§ 76"
          }
        ],
        "calculation": {
          "type": "fixedMonthDay",
          "month": 1,
          "day": 1
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "proceduralEquivalentDay",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "LU-JUSG-ART76-DAY-NEW-YEAR"
        }
      },
      {
        "ruleId": "LU-CAL-LU-JUSG-ART76-DAY-ST-STEPHEN-55514CD91F06C7F0",
        "calendarId": "ap22-lu-55514cd91f06",
        "jurisdiction": {
          "level": "cantonal",
          "code": "LU"
        },
        "labelKey": "holiday.lu.LU-JUSG-ART76-DAY-ST-STEPHEN",
        "labels": {
          "de": "Stephanstag",
          "fr": "Saint-Étienne"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-LU-JUSG-260-20260101",
            "locator": "§ 76"
          }
        ],
        "calculation": {
          "type": "fixedMonthDay",
          "month": 12,
          "day": 26
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "proceduralEquivalentDay",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "LU-JUSG-ART76-DAY-ST-STEPHEN"
        }
      },
      {
        "ruleId": "LU-CAL-LU-JUSG-ART76-DAY-WHIT-MONDAY-55514CD91F06C7F0",
        "calendarId": "ap22-lu-55514cd91f06",
        "jurisdiction": {
          "level": "cantonal",
          "code": "LU"
        },
        "labelKey": "holiday.lu.LU-JUSG-ART76-DAY-WHIT-MONDAY",
        "labels": {
          "de": "Pfingstmontag",
          "fr": "Lundi de Pentecôte"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-LU-JUSG-260-20260101",
            "locator": "§ 76"
          }
        ],
        "calculation": {
          "type": "easterOffsetDays",
          "offsetDays": 50
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "proceduralEquivalentDay",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "LU-JUSG-ART76-DAY-WHIT-MONDAY"
        }
      }
    ],
    "projection": {
      "catalogId": "ch-holiday-catalog",
      "catalogFormatVersion": "2.0.0",
      "projectionId": "projection-55514cd91f06c7f0",
      "sourceHash": "c5701e47df0d07bb288719b26d55c31b84fe83ea539578d9192e292e08602570"
    }
  },
  {
    "$schema": "https://raw.githubusercontent.com/davidsteimer/fristenrechner/main/schemas/calendar-rules-v3.schema.json",
    "formatVersion": "3.0.0",
    "dataKind": "calendar",
    "calendarId": "ap22-lu-b879eb8eb04f",
    "jurisdiction": {
      "level": "cantonal",
      "code": "LU"
    },
    "validity": {
      "from": "2026-08-29",
      "to": null
    },
    "inherits": [
      "ch-federal-calendar"
    ],
    "review": {
      "reviewedOn": "2026-10-08",
      "status": "candidate",
      "reviewedBy": "Codex",
      "basis": "AP22C1 Datenkandidat auf Grundlage von DEC-2026-030. Keine Quellen- oder Betriebsfreigabe."
    },
    "sources": [
      {
        "sourceId": "SRC-BUNDESFEIERTAG-19940701",
        "sourceType": "officialDossier",
        "title": "Verordnung über den Bundesfeiertag, SR 116",
        "authority": "CH",
        "url": "https://www.fedlex.admin.ch/eli/cc/1994/1340_1340_1340/de",
        "documentVersionDate": "1994-07-01",
        "reviewedOn": "2026-09-13",
        "reviewStatus": "monitored"
      },
      {
        "sourceId": "SRC-LU-RLG-855-20200501",
        "sourceType": "officialDossier",
        "title": "Ruhetags- und Ladenschlussgesetz, RLG",
        "authority": "CH-LU",
        "url": "https://srl.lu.ch/data/855/de",
        "documentVersionDate": "2020-05-01",
        "reviewedOn": "2026-09-13",
        "reviewStatus": "monitored"
      },
      {
        "sourceId": "SRC-LU-VRG-40-20210901",
        "sourceType": "officialDossier",
        "title": "Gesetz über die Verwaltungsrechtspflege, VRG",
        "authority": "CH-LU",
        "url": "https://srl.lu.ch/data/40/de",
        "documentVersionDate": "2021-09-01",
        "reviewedOn": "2026-09-13",
        "reviewStatus": "monitored"
      }
    ],
    "rules": [
      {
        "ruleId": "LU-CAL-LU-RLG-ALL-DAY-ALL-SAINTS-B879EB8EB04F9540",
        "calendarId": "ap22-lu-b879eb8eb04f",
        "jurisdiction": {
          "level": "cantonal",
          "code": "LU"
        },
        "labelKey": "holiday.lu.LU-RLG-ALL-DAY-ALL-SAINTS",
        "labels": {
          "de": "Allerheiligen",
          "fr": "Toussaint"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-LU-RLG-855-20200501",
            "locator": "§ 1a Abs. 1 Bst. b und Abs. 2"
          }
        ],
        "calculation": {
          "type": "fixedMonthDay",
          "month": 11,
          "day": 1
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "LU-RLG-ALL-DAY-ALL-SAINTS"
        }
      },
      {
        "ruleId": "LU-CAL-LU-RLG-ALL-DAY-ASCENSION-B879EB8EB04F9540",
        "calendarId": "ap22-lu-b879eb8eb04f",
        "jurisdiction": {
          "level": "cantonal",
          "code": "LU"
        },
        "labelKey": "holiday.lu.LU-RLG-ALL-DAY-ASCENSION",
        "labels": {
          "de": "Auffahrt",
          "fr": "Ascension"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-LU-RLG-855-20200501",
            "locator": "§ 1a Abs. 1 Bst. b und Abs. 2"
          }
        ],
        "calculation": {
          "type": "easterOffsetDays",
          "offsetDays": 39
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "LU-RLG-ALL-DAY-ASCENSION"
        }
      },
      {
        "ruleId": "LU-CAL-LU-RLG-ALL-DAY-ASSUMPTION-B879EB8EB04F9540",
        "calendarId": "ap22-lu-b879eb8eb04f",
        "jurisdiction": {
          "level": "cantonal",
          "code": "LU"
        },
        "labelKey": "holiday.lu.LU-RLG-ALL-DAY-ASSUMPTION",
        "labels": {
          "de": "Mariä Himmelfahrt",
          "fr": "Assomption"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-LU-RLG-855-20200501",
            "locator": "§ 1a Abs. 1 Bst. b und Abs. 2"
          }
        ],
        "calculation": {
          "type": "fixedMonthDay",
          "month": 8,
          "day": 15
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "LU-RLG-ALL-DAY-ASSUMPTION"
        }
      },
      {
        "ruleId": "LU-CAL-LU-RLG-ALL-DAY-CHRISTMAS-B879EB8EB04F9540",
        "calendarId": "ap22-lu-b879eb8eb04f",
        "jurisdiction": {
          "level": "cantonal",
          "code": "LU"
        },
        "labelKey": "holiday.lu.LU-RLG-ALL-DAY-CHRISTMAS",
        "labels": {
          "de": "Weihnachten",
          "fr": "Noël"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-LU-RLG-855-20200501",
            "locator": "§ 2 / § 1a Abs. 1"
          }
        ],
        "calculation": {
          "type": "fixedMonthDay",
          "month": 12,
          "day": 25
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "LU-RLG-ALL-DAY-CHRISTMAS"
        }
      },
      {
        "ruleId": "LU-CAL-LU-RLG-ALL-DAY-CORPUS-CHRISTI-B879EB8EB04F9540",
        "calendarId": "ap22-lu-b879eb8eb04f",
        "jurisdiction": {
          "level": "cantonal",
          "code": "LU"
        },
        "labelKey": "holiday.lu.LU-RLG-ALL-DAY-CORPUS-CHRISTI",
        "labels": {
          "de": "Fronleichnam",
          "fr": "Fête-Dieu"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-LU-RLG-855-20200501",
            "locator": "§ 1a Abs. 1 Bst. b und Abs. 2"
          }
        ],
        "calculation": {
          "type": "easterOffsetDays",
          "offsetDays": 60
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "LU-RLG-ALL-DAY-CORPUS-CHRISTI"
        }
      },
      {
        "ruleId": "LU-CAL-LU-RLG-ALL-DAY-EASTER-B879EB8EB04F9540",
        "calendarId": "ap22-lu-b879eb8eb04f",
        "jurisdiction": {
          "level": "cantonal",
          "code": "LU"
        },
        "labelKey": "holiday.lu.LU-RLG-ALL-DAY-EASTER",
        "labels": {
          "de": "Ostern",
          "fr": "Pâques"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-LU-RLG-855-20200501",
            "locator": "§ 2 / § 1a Abs. 1"
          }
        ],
        "calculation": {
          "type": "easterOffsetDays",
          "offsetDays": 0
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "LU-RLG-ALL-DAY-EASTER"
        }
      },
      {
        "ruleId": "LU-CAL-LU-RLG-ALL-DAY-FEDERAL-FAST-B879EB8EB04F9540",
        "calendarId": "ap22-lu-b879eb8eb04f",
        "jurisdiction": {
          "level": "cantonal",
          "code": "LU"
        },
        "labelKey": "holiday.lu.LU-RLG-ALL-DAY-FEDERAL-FAST",
        "labels": {
          "de": "Eidgenössischer Dank-, Buss- und Bettag",
          "fr": "Jeûne fédéral"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-LU-RLG-855-20200501",
            "locator": "§ 2 / § 1a Abs. 1"
          }
        ],
        "calculation": {
          "type": "nthWeekdayOfMonth",
          "month": 9,
          "isoWeekday": 7,
          "occurrence": 3
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "LU-RLG-ALL-DAY-FEDERAL-FAST"
        }
      },
      {
        "ruleId": "LU-CAL-LU-RLG-ALL-DAY-GOOD-FRIDAY-B879EB8EB04F9540",
        "calendarId": "ap22-lu-b879eb8eb04f",
        "jurisdiction": {
          "level": "cantonal",
          "code": "LU"
        },
        "labelKey": "holiday.lu.LU-RLG-ALL-DAY-GOOD-FRIDAY",
        "labels": {
          "de": "Karfreitag",
          "fr": "Vendredi saint"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-LU-RLG-855-20200501",
            "locator": "§ 2 / § 1a Abs. 1"
          }
        ],
        "calculation": {
          "type": "easterOffsetDays",
          "offsetDays": -2
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "LU-RLG-ALL-DAY-GOOD-FRIDAY"
        }
      },
      {
        "ruleId": "LU-CAL-LU-RLG-ALL-DAY-IMMACULATE-CONCEPTION-B879EB8EB04F9540",
        "calendarId": "ap22-lu-b879eb8eb04f",
        "jurisdiction": {
          "level": "cantonal",
          "code": "LU"
        },
        "labelKey": "holiday.lu.LU-RLG-ALL-DAY-IMMACULATE-CONCEPTION",
        "labels": {
          "de": "Mariä Empfängnis",
          "fr": "Immaculée Conception"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-LU-RLG-855-20200501",
            "locator": "§ 1a Abs. 1 Bst. b und Abs. 2"
          }
        ],
        "calculation": {
          "type": "fixedMonthDay",
          "month": 12,
          "day": 8
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "LU-RLG-ALL-DAY-IMMACULATE-CONCEPTION"
        }
      },
      {
        "ruleId": "LU-CAL-LU-RLG-ALL-DAY-NATIONAL-DAY-B879EB8EB04F9540",
        "calendarId": "ap22-lu-b879eb8eb04f",
        "jurisdiction": {
          "level": "cantonal",
          "code": "LU"
        },
        "labelKey": "holiday.lu.LU-RLG-ALL-DAY-NATIONAL-DAY",
        "labels": {
          "de": "Bundesfeiertag",
          "fr": "Fête nationale"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-BUNDESFEIERTAG-19940701",
            "locator": "SR 116 Art. 1, neue offene Anwendung auf dieses Geltungsprofil"
          }
        ],
        "calculation": {
          "type": "fixedMonthDay",
          "month": 8,
          "day": 1
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "LU-RLG-ALL-DAY-NATIONAL-DAY"
        }
      },
      {
        "ruleId": "LU-CAL-LU-RLG-ALL-DAY-NEW-YEAR-B879EB8EB04F9540",
        "calendarId": "ap22-lu-b879eb8eb04f",
        "jurisdiction": {
          "level": "cantonal",
          "code": "LU"
        },
        "labelKey": "holiday.lu.LU-RLG-ALL-DAY-NEW-YEAR",
        "labels": {
          "de": "Neujahr",
          "fr": "Nouvel An"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-LU-RLG-855-20200501",
            "locator": "§ 1a Abs. 1 Bst. b und Abs. 2"
          }
        ],
        "calculation": {
          "type": "fixedMonthDay",
          "month": 1,
          "day": 1
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "LU-RLG-ALL-DAY-NEW-YEAR"
        }
      },
      {
        "ruleId": "LU-CAL-LU-RLG-ALL-DAY-PENTECOST-B879EB8EB04F9540",
        "calendarId": "ap22-lu-b879eb8eb04f",
        "jurisdiction": {
          "level": "cantonal",
          "code": "LU"
        },
        "labelKey": "holiday.lu.LU-RLG-ALL-DAY-PENTECOST",
        "labels": {
          "de": "Pfingsten",
          "fr": "Pentecôte"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-LU-RLG-855-20200501",
            "locator": "§ 2 / § 1a Abs. 1"
          }
        ],
        "calculation": {
          "type": "easterOffsetDays",
          "offsetDays": 49
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "LU-RLG-ALL-DAY-PENTECOST"
        }
      },
      {
        "ruleId": "LU-CAL-LU-RLG-ALL-DAY-ST-STEPHEN-B879EB8EB04F9540",
        "calendarId": "ap22-lu-b879eb8eb04f",
        "jurisdiction": {
          "level": "cantonal",
          "code": "LU"
        },
        "labelKey": "holiday.lu.LU-RLG-ALL-DAY-ST-STEPHEN",
        "labels": {
          "de": "Stephanstag",
          "fr": "Saint-Étienne"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-LU-RLG-855-20200501",
            "locator": "§ 1a Abs. 1 Bst. b und Abs. 2"
          }
        ],
        "calculation": {
          "type": "fixedMonthDay",
          "month": 12,
          "day": 26
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "LU-RLG-ALL-DAY-ST-STEPHEN"
        }
      },
      {
        "ruleId": "LU-CAL-LU-VRG-ADDITIONAL-DAY-BERCHTOLD-B879EB8EB04F9540",
        "calendarId": "ap22-lu-b879eb8eb04f",
        "jurisdiction": {
          "level": "cantonal",
          "code": "LU"
        },
        "labelKey": "holiday.lu.LU-VRG-ADDITIONAL-DAY-BERCHTOLD",
        "labels": {
          "de": "Berchtoldstag",
          "fr": "Saint-Berchtold"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-LU-VRG-40-20210901",
            "locator": "§ 34 Abs. 1 Satz 2"
          }
        ],
        "calculation": {
          "type": "fixedMonthDay",
          "month": 1,
          "day": 2
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "proceduralEquivalentDay",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "LU-VRG-ADDITIONAL-DAY-BERCHTOLD"
        }
      },
      {
        "ruleId": "LU-CAL-LU-VRG-ADDITIONAL-DAY-EASTER-MONDAY-B879EB8EB04F9540",
        "calendarId": "ap22-lu-b879eb8eb04f",
        "jurisdiction": {
          "level": "cantonal",
          "code": "LU"
        },
        "labelKey": "holiday.lu.LU-VRG-ADDITIONAL-DAY-EASTER-MONDAY",
        "labels": {
          "de": "Ostermontag",
          "fr": "Lundi de Pâques"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-LU-VRG-40-20210901",
            "locator": "§ 34 Abs. 1 Satz 2"
          }
        ],
        "calculation": {
          "type": "easterOffsetDays",
          "offsetDays": 1
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "proceduralEquivalentDay",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "LU-VRG-ADDITIONAL-DAY-EASTER-MONDAY"
        }
      },
      {
        "ruleId": "LU-CAL-LU-VRG-ADDITIONAL-DAY-WHIT-MONDAY-B879EB8EB04F9540",
        "calendarId": "ap22-lu-b879eb8eb04f",
        "jurisdiction": {
          "level": "cantonal",
          "code": "LU"
        },
        "labelKey": "holiday.lu.LU-VRG-ADDITIONAL-DAY-WHIT-MONDAY",
        "labels": {
          "de": "Pfingstmontag",
          "fr": "Lundi de Pentecôte"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-LU-VRG-40-20210901",
            "locator": "§ 34 Abs. 1 Satz 2"
          }
        ],
        "calculation": {
          "type": "easterOffsetDays",
          "offsetDays": 50
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "proceduralEquivalentDay",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "LU-VRG-ADDITIONAL-DAY-WHIT-MONDAY"
        }
      }
    ],
    "projection": {
      "catalogId": "ch-holiday-catalog",
      "catalogFormatVersion": "2.0.0",
      "projectionId": "projection-b879eb8eb04f9540",
      "sourceHash": "c5701e47df0d07bb288719b26d55c31b84fe83ea539578d9192e292e08602570"
    }
  },
  {
    "$schema": "https://raw.githubusercontent.com/davidsteimer/fristenrechner/main/schemas/calendar-rules-v3.schema.json",
    "formatVersion": "3.0.0",
    "dataKind": "calendar",
    "calendarId": "ap22-ne-027ceadbf103",
    "jurisdiction": {
      "level": "cantonal",
      "code": "NE"
    },
    "validity": {
      "from": "2026-08-29",
      "to": null
    },
    "inherits": [
      "ch-federal-calendar"
    ],
    "review": {
      "reviewedOn": "2026-10-08",
      "status": "candidate",
      "reviewedBy": "Codex",
      "basis": "AP22C1 Datenkandidat auf Grundlage von DEC-2026-030. Keine Quellen- oder Betriebsfreigabe."
    },
    "sources": [
      {
        "sourceId": "SRC-BUNDESFEIERTAG-19940701",
        "sourceType": "officialDossier",
        "title": "Verordnung über den Bundesfeiertag, SR 116",
        "authority": "CH",
        "url": "https://www.fedlex.admin.ch/eli/cc/1994/1340_1340_1340/de",
        "documentVersionDate": "1994-07-01",
        "reviewedOn": "2026-09-13",
        "reviewStatus": "monitored"
      },
      {
        "sourceId": "SRC-NE-LDJF-94102-20100101",
        "sourceType": "officialDossier",
        "title": "Loi sur le dimanche et les jours fériés, LDJF",
        "authority": "CH-NE",
        "url": "https://rsn.ne.ch/DATA/program/books/rsne/pdf/941.02.pdf",
        "documentVersionDate": "2010-01-01",
        "reviewedOn": "2026-09-22",
        "reviewStatus": "monitored"
      },
      {
        "sourceId": "SRC-NE-LPA-152130-20260101",
        "sourceType": "officialDossier",
        "title": "Loi sur la procédure administrative, LPA",
        "authority": "CH-NE",
        "url": "https://rsn.ne.ch/DATA/program/books/rsne/pdf/152.130.pdf",
        "documentVersionDate": "2026-01-01",
        "reviewedOn": "2026-09-13",
        "reviewStatus": "monitored"
      }
    ],
    "rules": [
      {
        "ruleId": "NE-CAL-NE-LDJF-BASE-DAY-ASCENSION-027CEADBF10392AA",
        "calendarId": "ap22-ne-027ceadbf103",
        "jurisdiction": {
          "level": "cantonal",
          "code": "NE"
        },
        "labelKey": "holiday.ne.NE-LDJF-BASE-DAY-ASCENSION",
        "labels": {
          "de": "Auffahrt",
          "fr": "Ascension"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-NE-LDJF-94102-20100101",
            "locator": "Art. 3 Abs. 1"
          }
        ],
        "calculation": {
          "type": "easterOffsetDays",
          "offsetDays": 39
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "NE-LDJF-BASE-DAY-ASCENSION"
        }
      },
      {
        "ruleId": "NE-CAL-NE-LDJF-BASE-DAY-CHRISTMAS-027CEADBF10392AA",
        "calendarId": "ap22-ne-027ceadbf103",
        "jurisdiction": {
          "level": "cantonal",
          "code": "NE"
        },
        "labelKey": "holiday.ne.NE-LDJF-BASE-DAY-CHRISTMAS",
        "labels": {
          "de": "Weihnachten",
          "fr": "Noël"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-NE-LDJF-94102-20100101",
            "locator": "Art. 3 Abs. 1"
          }
        ],
        "calculation": {
          "type": "fixedMonthDay",
          "month": 12,
          "day": 25
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "NE-LDJF-BASE-DAY-CHRISTMAS"
        }
      },
      {
        "ruleId": "NE-CAL-NE-LDJF-BASE-DAY-CHRISTMAS-SUBSTITUTE-027CEADBF10392AA",
        "calendarId": "ap22-ne-027ceadbf103",
        "jurisdiction": {
          "level": "cantonal",
          "code": "NE"
        },
        "labelKey": "holiday.ne.NE-LDJF-BASE-DAY-CHRISTMAS-SUBSTITUTE",
        "labels": {
          "de": "Ersatzfeiertag nach Weihnachten",
          "fr": "Jour férié de remplacement après Noël"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-NE-LDJF-94102-20100101",
            "locator": "Art. 3 Abs. 1, lendemain de Noël lorsque ce jour est un dimanche"
          }
        ],
        "calculation": {
          "type": "fixedMonthDay",
          "month": 12,
          "day": 26
        },
        "condition": "onlyMonday",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "NE-LDJF-BASE-DAY-CHRISTMAS-SUBSTITUTE"
        }
      },
      {
        "ruleId": "NE-CAL-NE-LDJF-BASE-DAY-GOOD-FRIDAY-027CEADBF10392AA",
        "calendarId": "ap22-ne-027ceadbf103",
        "jurisdiction": {
          "level": "cantonal",
          "code": "NE"
        },
        "labelKey": "holiday.ne.NE-LDJF-BASE-DAY-GOOD-FRIDAY",
        "labels": {
          "de": "Karfreitag",
          "fr": "Vendredi saint"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-NE-LDJF-94102-20100101",
            "locator": "Art. 3 Abs. 1"
          }
        ],
        "calculation": {
          "type": "easterOffsetDays",
          "offsetDays": -2
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "NE-LDJF-BASE-DAY-GOOD-FRIDAY"
        }
      },
      {
        "ruleId": "NE-CAL-NE-LDJF-BASE-DAY-MAY1-027CEADBF10392AA",
        "calendarId": "ap22-ne-027ceadbf103",
        "jurisdiction": {
          "level": "cantonal",
          "code": "NE"
        },
        "labelKey": "holiday.ne.NE-LDJF-BASE-DAY-MAY1",
        "labels": {
          "de": "Tag der Arbeit (1. Mai)",
          "fr": "Fête du travail (1er mai)"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-NE-LDJF-94102-20100101",
            "locator": "Art. 3 Abs. 1"
          }
        ],
        "calculation": {
          "type": "fixedMonthDay",
          "month": 5,
          "day": 1
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "NE-LDJF-BASE-DAY-MAY1"
        }
      },
      {
        "ruleId": "NE-CAL-NE-LDJF-BASE-DAY-NATIONAL-DAY-027CEADBF10392AA",
        "calendarId": "ap22-ne-027ceadbf103",
        "jurisdiction": {
          "level": "cantonal",
          "code": "NE"
        },
        "labelKey": "holiday.ne.NE-LDJF-BASE-DAY-NATIONAL-DAY",
        "labels": {
          "de": "Bundesfeiertag",
          "fr": "Fête nationale"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-BUNDESFEIERTAG-19940701",
            "locator": "SR 116 Art. 1, neue Anwendung auf NE-LDJF-BASE. Kantonaler Bezug Art. 3 Abs. 1"
          }
        ],
        "calculation": {
          "type": "fixedMonthDay",
          "month": 8,
          "day": 1
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "NE-LDJF-BASE-DAY-NATIONAL-DAY"
        }
      },
      {
        "ruleId": "NE-CAL-NE-LDJF-BASE-DAY-NE-REPUBLIC-027CEADBF10392AA",
        "calendarId": "ap22-ne-027ceadbf103",
        "jurisdiction": {
          "level": "cantonal",
          "code": "NE"
        },
        "labelKey": "holiday.ne.NE-LDJF-BASE-DAY-NE-REPUBLIC",
        "labels": {
          "de": "Gründung der Republik Neuenburg",
          "fr": "Instauration de la République de Neuchâtel"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-NE-LDJF-94102-20100101",
            "locator": "Art. 3 Abs. 1"
          }
        ],
        "calculation": {
          "type": "fixedMonthDay",
          "month": 3,
          "day": 1
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "NE-LDJF-BASE-DAY-NE-REPUBLIC"
        }
      },
      {
        "ruleId": "NE-CAL-NE-LDJF-BASE-DAY-NEW-YEAR-027CEADBF10392AA",
        "calendarId": "ap22-ne-027ceadbf103",
        "jurisdiction": {
          "level": "cantonal",
          "code": "NE"
        },
        "labelKey": "holiday.ne.NE-LDJF-BASE-DAY-NEW-YEAR",
        "labels": {
          "de": "Neujahr",
          "fr": "Nouvel An"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-NE-LDJF-94102-20100101",
            "locator": "Art. 3 Abs. 1"
          }
        ],
        "calculation": {
          "type": "fixedMonthDay",
          "month": 1,
          "day": 1
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "NE-LDJF-BASE-DAY-NEW-YEAR"
        }
      },
      {
        "ruleId": "NE-CAL-NE-LDJF-BASE-DAY-NEW-YEAR-SUBSTITUTE-027CEADBF10392AA",
        "calendarId": "ap22-ne-027ceadbf103",
        "jurisdiction": {
          "level": "cantonal",
          "code": "NE"
        },
        "labelKey": "holiday.ne.NE-LDJF-BASE-DAY-NEW-YEAR-SUBSTITUTE",
        "labels": {
          "de": "Ersatzfeiertag nach Neujahr",
          "fr": "Jour férié de remplacement après Nouvel An"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-NE-LDJF-94102-20100101",
            "locator": "Art. 3 Abs. 1, lendemain du Nouvel An lorsque ce jour est un dimanche"
          }
        ],
        "calculation": {
          "type": "fixedMonthDay",
          "month": 1,
          "day": 2
        },
        "condition": "onlyMonday",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "NE-LDJF-BASE-DAY-NEW-YEAR-SUBSTITUTE"
        }
      },
      {
        "ruleId": "NE-CAL-NE-LPA-ADDITIONAL-DAY-ASCENSION-FRIDAY-027CEADBF10392AA",
        "calendarId": "ap22-ne-027ceadbf103",
        "jurisdiction": {
          "level": "cantonal",
          "code": "NE"
        },
        "labelKey": "holiday.ne.NE-LPA-ADDITIONAL-DAY-ASCENSION-FRIDAY",
        "labels": {
          "de": "Freitag nach Auffahrt",
          "fr": "Vendredi de l’Ascension"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-NE-LPA-152130-20260101",
            "locator": "LPA Art. 33 Abs. 3 in Verbindung mit RDF Art. 11 Abs. 1"
          }
        ],
        "calculation": {
          "type": "easterOffsetDays",
          "offsetDays": 40
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "proceduralEquivalentDay",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "NE-LPA-ADDITIONAL-DAY-ASCENSION-FRIDAY"
        }
      },
      {
        "ruleId": "NE-CAL-NE-LPA-ADDITIONAL-DAY-BERCHTOLD-027CEADBF10392AA",
        "calendarId": "ap22-ne-027ceadbf103",
        "jurisdiction": {
          "level": "cantonal",
          "code": "NE"
        },
        "labelKey": "holiday.ne.NE-LPA-ADDITIONAL-DAY-BERCHTOLD",
        "labels": {
          "de": "2. Januar",
          "fr": "2 janvier"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-NE-LPA-152130-20260101",
            "locator": "LPA Art. 33 Abs. 3 in Verbindung mit RDF Art. 11 Abs. 1"
          }
        ],
        "calculation": {
          "type": "fixedMonthDay",
          "month": 1,
          "day": 2
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "proceduralEquivalentDay",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "NE-LPA-ADDITIONAL-DAY-BERCHTOLD"
        }
      },
      {
        "ruleId": "NE-CAL-NE-LPA-ADDITIONAL-DAY-CHRISTMAS-EVE-027CEADBF10392AA",
        "calendarId": "ap22-ne-027ceadbf103",
        "jurisdiction": {
          "level": "cantonal",
          "code": "NE"
        },
        "labelKey": "holiday.ne.NE-LPA-ADDITIONAL-DAY-CHRISTMAS-EVE",
        "labels": {
          "de": "Heiligabend",
          "fr": "Veille de Noël"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-NE-LPA-152130-20260101",
            "locator": "LPA Art. 33 Abs. 3 in Verbindung mit RDF Art. 11 Abs. 1"
          }
        ],
        "calculation": {
          "type": "fixedMonthDay",
          "month": 12,
          "day": 24
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "proceduralEquivalentDay",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "NE-LPA-ADDITIONAL-DAY-CHRISTMAS-EVE"
        }
      },
      {
        "ruleId": "NE-CAL-NE-LPA-ADDITIONAL-DAY-EASTER-MONDAY-027CEADBF10392AA",
        "calendarId": "ap22-ne-027ceadbf103",
        "jurisdiction": {
          "level": "cantonal",
          "code": "NE"
        },
        "labelKey": "holiday.ne.NE-LPA-ADDITIONAL-DAY-EASTER-MONDAY",
        "labels": {
          "de": "Ostermontag",
          "fr": "Lundi de Pâques"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-NE-LPA-152130-20260101",
            "locator": "LPA Art. 33 Abs. 3 in Verbindung mit RDF Art. 11 Abs. 1"
          }
        ],
        "calculation": {
          "type": "easterOffsetDays",
          "offsetDays": 1
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "proceduralEquivalentDay",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "NE-LPA-ADDITIONAL-DAY-EASTER-MONDAY"
        }
      },
      {
        "ruleId": "NE-CAL-NE-LPA-ADDITIONAL-DAY-FEDERAL-FAST-MONDAY-027CEADBF10392AA",
        "calendarId": "ap22-ne-027ceadbf103",
        "jurisdiction": {
          "level": "cantonal",
          "code": "NE"
        },
        "labelKey": "holiday.ne.NE-LPA-ADDITIONAL-DAY-FEDERAL-FAST-MONDAY",
        "labels": {
          "de": "Bettagsmontag",
          "fr": "Lundi du Jeûne fédéral"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-NE-LPA-152130-20260101",
            "locator": "LPA Art. 33 Abs. 3 in Verbindung mit RDF Art. 11 Abs. 1"
          }
        ],
        "calculation": {
          "type": "nthWeekdayOffsetDays",
          "month": 9,
          "offsetDays": 1,
          "isoWeekday": 7,
          "occurrence": 3
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "proceduralEquivalentDay",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "NE-LPA-ADDITIONAL-DAY-FEDERAL-FAST-MONDAY"
        }
      },
      {
        "ruleId": "NE-CAL-NE-LPA-ADDITIONAL-DAY-NEW-YEAR-EVE-027CEADBF10392AA",
        "calendarId": "ap22-ne-027ceadbf103",
        "jurisdiction": {
          "level": "cantonal",
          "code": "NE"
        },
        "labelKey": "holiday.ne.NE-LPA-ADDITIONAL-DAY-NEW-YEAR-EVE",
        "labels": {
          "de": "Silvester",
          "fr": "Saint-Sylvestre"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-NE-LPA-152130-20260101",
            "locator": "LPA Art. 33 Abs. 3 in Verbindung mit RDF Art. 11 Abs. 1"
          }
        ],
        "calculation": {
          "type": "fixedMonthDay",
          "month": 12,
          "day": 31
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "proceduralEquivalentDay",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "NE-LPA-ADDITIONAL-DAY-NEW-YEAR-EVE"
        }
      },
      {
        "ruleId": "NE-CAL-NE-LPA-ADDITIONAL-DAY-ST-STEPHEN-027CEADBF10392AA",
        "calendarId": "ap22-ne-027ceadbf103",
        "jurisdiction": {
          "level": "cantonal",
          "code": "NE"
        },
        "labelKey": "holiday.ne.NE-LPA-ADDITIONAL-DAY-ST-STEPHEN",
        "labels": {
          "de": "Stephanstag",
          "fr": "Saint-Étienne"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-NE-LPA-152130-20260101",
            "locator": "LPA Art. 33 Abs. 3 in Verbindung mit RDF Art. 11 Abs. 1"
          }
        ],
        "calculation": {
          "type": "fixedMonthDay",
          "month": 12,
          "day": 26
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "proceduralEquivalentDay",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "NE-LPA-ADDITIONAL-DAY-ST-STEPHEN"
        }
      },
      {
        "ruleId": "NE-CAL-NE-LPA-ADDITIONAL-DAY-WHIT-MONDAY-027CEADBF10392AA",
        "calendarId": "ap22-ne-027ceadbf103",
        "jurisdiction": {
          "level": "cantonal",
          "code": "NE"
        },
        "labelKey": "holiday.ne.NE-LPA-ADDITIONAL-DAY-WHIT-MONDAY",
        "labels": {
          "de": "Pfingstmontag",
          "fr": "Lundi de Pentecôte"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-NE-LPA-152130-20260101",
            "locator": "LPA Art. 33 Abs. 3 in Verbindung mit RDF Art. 11 Abs. 1"
          }
        ],
        "calculation": {
          "type": "easterOffsetDays",
          "offsetDays": 50
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "proceduralEquivalentDay",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "NE-LPA-ADDITIONAL-DAY-WHIT-MONDAY"
        }
      }
    ],
    "projection": {
      "catalogId": "ch-holiday-catalog",
      "catalogFormatVersion": "2.0.0",
      "projectionId": "projection-027ceadbf10392aa",
      "sourceHash": "c5701e47df0d07bb288719b26d55c31b84fe83ea539578d9192e292e08602570"
    }
  },
  {
    "$schema": "https://raw.githubusercontent.com/davidsteimer/fristenrechner/main/schemas/calendar-rules-v3.schema.json",
    "formatVersion": "3.0.0",
    "dataKind": "calendar",
    "calendarId": "ap22-ne-21f519039621",
    "jurisdiction": {
      "level": "cantonal",
      "code": "NE"
    },
    "validity": {
      "from": "2026-08-29",
      "to": null
    },
    "inherits": [
      "ch-federal-calendar"
    ],
    "review": {
      "reviewedOn": "2026-10-08",
      "status": "candidate",
      "reviewedBy": "Codex",
      "basis": "AP22C1 Datenkandidat auf Grundlage von DEC-2026-030. Keine Quellen- oder Betriebsfreigabe."
    },
    "sources": [
      {
        "sourceId": "SRC-BUNDESFEIERTAG-19940701",
        "sourceType": "officialDossier",
        "title": "Verordnung über den Bundesfeiertag, SR 116",
        "authority": "CH",
        "url": "https://www.fedlex.admin.ch/eli/cc/1994/1340_1340_1340/de",
        "documentVersionDate": "1994-07-01",
        "reviewedOn": "2026-09-13",
        "reviewStatus": "monitored"
      },
      {
        "sourceId": "SRC-NE-ADJF-941020-20250527",
        "sourceType": "officialDossier",
        "title": "Arrêté d’application de la loi sur le dimanche et les jours fériés",
        "authority": "CH-NE",
        "url": "https://rsn.ne.ch/DATA/program/books/rsne/pdf/941.020.pdf",
        "documentVersionDate": "2025-05-27",
        "reviewedOn": "2026-09-13",
        "reviewStatus": "monitored"
      },
      {
        "sourceId": "SRC-NE-LDJF-94102-20100101",
        "sourceType": "officialDossier",
        "title": "Loi sur le dimanche et les jours fériés, LDJF",
        "authority": "CH-NE",
        "url": "https://rsn.ne.ch/DATA/program/books/rsne/pdf/941.02.pdf",
        "documentVersionDate": "2010-01-01",
        "reviewedOn": "2026-09-22",
        "reviewStatus": "monitored"
      },
      {
        "sourceId": "SRC-NE-LPA-152130-20260101",
        "sourceType": "officialDossier",
        "title": "Loi sur la procédure administrative, LPA",
        "authority": "CH-NE",
        "url": "https://rsn.ne.ch/DATA/program/books/rsne/pdf/152.130.pdf",
        "documentVersionDate": "2026-01-01",
        "reviewedOn": "2026-09-13",
        "reviewStatus": "monitored"
      }
    ],
    "rules": [
      {
        "ruleId": "NE-CAL-NE-LANDERON-ADDITIONAL-DAY-CORPUS-CHRISTI-21F519039621689A",
        "calendarId": "ap22-ne-21f519039621",
        "jurisdiction": {
          "level": "cantonal",
          "code": "NE"
        },
        "labelKey": "holiday.ne.NE-LANDERON-ADDITIONAL-DAY-CORPUS-CHRISTI",
        "labels": {
          "de": "Fronleichnam",
          "fr": "Fête-Dieu"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-NE-ADJF-941020-20250527",
            "locator": "Art. 2"
          }
        ],
        "calculation": {
          "type": "easterOffsetDays",
          "offsetDays": 60
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "NE-LANDERON-ADDITIONAL-DAY-CORPUS-CHRISTI"
        }
      },
      {
        "ruleId": "NE-CAL-NE-LDJF-BASE-DAY-ASCENSION-21F519039621689A",
        "calendarId": "ap22-ne-21f519039621",
        "jurisdiction": {
          "level": "cantonal",
          "code": "NE"
        },
        "labelKey": "holiday.ne.NE-LDJF-BASE-DAY-ASCENSION",
        "labels": {
          "de": "Auffahrt",
          "fr": "Ascension"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-NE-LDJF-94102-20100101",
            "locator": "Art. 3 Abs. 1"
          }
        ],
        "calculation": {
          "type": "easterOffsetDays",
          "offsetDays": 39
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "NE-LDJF-BASE-DAY-ASCENSION"
        }
      },
      {
        "ruleId": "NE-CAL-NE-LDJF-BASE-DAY-CHRISTMAS-21F519039621689A",
        "calendarId": "ap22-ne-21f519039621",
        "jurisdiction": {
          "level": "cantonal",
          "code": "NE"
        },
        "labelKey": "holiday.ne.NE-LDJF-BASE-DAY-CHRISTMAS",
        "labels": {
          "de": "Weihnachten",
          "fr": "Noël"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-NE-LDJF-94102-20100101",
            "locator": "Art. 3 Abs. 1"
          }
        ],
        "calculation": {
          "type": "fixedMonthDay",
          "month": 12,
          "day": 25
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "NE-LDJF-BASE-DAY-CHRISTMAS"
        }
      },
      {
        "ruleId": "NE-CAL-NE-LDJF-BASE-DAY-CHRISTMAS-SUBSTITUTE-21F519039621689A",
        "calendarId": "ap22-ne-21f519039621",
        "jurisdiction": {
          "level": "cantonal",
          "code": "NE"
        },
        "labelKey": "holiday.ne.NE-LDJF-BASE-DAY-CHRISTMAS-SUBSTITUTE",
        "labels": {
          "de": "Ersatzfeiertag nach Weihnachten",
          "fr": "Jour férié de remplacement après Noël"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-NE-LDJF-94102-20100101",
            "locator": "Art. 3 Abs. 1, lendemain de Noël lorsque ce jour est un dimanche"
          }
        ],
        "calculation": {
          "type": "fixedMonthDay",
          "month": 12,
          "day": 26
        },
        "condition": "onlyMonday",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "NE-LDJF-BASE-DAY-CHRISTMAS-SUBSTITUTE"
        }
      },
      {
        "ruleId": "NE-CAL-NE-LDJF-BASE-DAY-GOOD-FRIDAY-21F519039621689A",
        "calendarId": "ap22-ne-21f519039621",
        "jurisdiction": {
          "level": "cantonal",
          "code": "NE"
        },
        "labelKey": "holiday.ne.NE-LDJF-BASE-DAY-GOOD-FRIDAY",
        "labels": {
          "de": "Karfreitag",
          "fr": "Vendredi saint"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-NE-LDJF-94102-20100101",
            "locator": "Art. 3 Abs. 1"
          }
        ],
        "calculation": {
          "type": "easterOffsetDays",
          "offsetDays": -2
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "NE-LDJF-BASE-DAY-GOOD-FRIDAY"
        }
      },
      {
        "ruleId": "NE-CAL-NE-LDJF-BASE-DAY-MAY1-21F519039621689A",
        "calendarId": "ap22-ne-21f519039621",
        "jurisdiction": {
          "level": "cantonal",
          "code": "NE"
        },
        "labelKey": "holiday.ne.NE-LDJF-BASE-DAY-MAY1",
        "labels": {
          "de": "Tag der Arbeit (1. Mai)",
          "fr": "Fête du travail (1er mai)"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-NE-LDJF-94102-20100101",
            "locator": "Art. 3 Abs. 1"
          }
        ],
        "calculation": {
          "type": "fixedMonthDay",
          "month": 5,
          "day": 1
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "NE-LDJF-BASE-DAY-MAY1"
        }
      },
      {
        "ruleId": "NE-CAL-NE-LDJF-BASE-DAY-NATIONAL-DAY-21F519039621689A",
        "calendarId": "ap22-ne-21f519039621",
        "jurisdiction": {
          "level": "cantonal",
          "code": "NE"
        },
        "labelKey": "holiday.ne.NE-LDJF-BASE-DAY-NATIONAL-DAY",
        "labels": {
          "de": "Bundesfeiertag",
          "fr": "Fête nationale"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-BUNDESFEIERTAG-19940701",
            "locator": "SR 116 Art. 1, neue Anwendung auf NE-LDJF-BASE. Kantonaler Bezug Art. 3 Abs. 1"
          }
        ],
        "calculation": {
          "type": "fixedMonthDay",
          "month": 8,
          "day": 1
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "NE-LDJF-BASE-DAY-NATIONAL-DAY"
        }
      },
      {
        "ruleId": "NE-CAL-NE-LDJF-BASE-DAY-NE-REPUBLIC-21F519039621689A",
        "calendarId": "ap22-ne-21f519039621",
        "jurisdiction": {
          "level": "cantonal",
          "code": "NE"
        },
        "labelKey": "holiday.ne.NE-LDJF-BASE-DAY-NE-REPUBLIC",
        "labels": {
          "de": "Gründung der Republik Neuenburg",
          "fr": "Instauration de la République de Neuchâtel"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-NE-LDJF-94102-20100101",
            "locator": "Art. 3 Abs. 1"
          }
        ],
        "calculation": {
          "type": "fixedMonthDay",
          "month": 3,
          "day": 1
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "NE-LDJF-BASE-DAY-NE-REPUBLIC"
        }
      },
      {
        "ruleId": "NE-CAL-NE-LDJF-BASE-DAY-NEW-YEAR-21F519039621689A",
        "calendarId": "ap22-ne-21f519039621",
        "jurisdiction": {
          "level": "cantonal",
          "code": "NE"
        },
        "labelKey": "holiday.ne.NE-LDJF-BASE-DAY-NEW-YEAR",
        "labels": {
          "de": "Neujahr",
          "fr": "Nouvel An"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-NE-LDJF-94102-20100101",
            "locator": "Art. 3 Abs. 1"
          }
        ],
        "calculation": {
          "type": "fixedMonthDay",
          "month": 1,
          "day": 1
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "NE-LDJF-BASE-DAY-NEW-YEAR"
        }
      },
      {
        "ruleId": "NE-CAL-NE-LDJF-BASE-DAY-NEW-YEAR-SUBSTITUTE-21F519039621689A",
        "calendarId": "ap22-ne-21f519039621",
        "jurisdiction": {
          "level": "cantonal",
          "code": "NE"
        },
        "labelKey": "holiday.ne.NE-LDJF-BASE-DAY-NEW-YEAR-SUBSTITUTE",
        "labels": {
          "de": "Ersatzfeiertag nach Neujahr",
          "fr": "Jour férié de remplacement après Nouvel An"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-NE-LDJF-94102-20100101",
            "locator": "Art. 3 Abs. 1, lendemain du Nouvel An lorsque ce jour est un dimanche"
          }
        ],
        "calculation": {
          "type": "fixedMonthDay",
          "month": 1,
          "day": 2
        },
        "condition": "onlyMonday",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "NE-LDJF-BASE-DAY-NEW-YEAR-SUBSTITUTE"
        }
      },
      {
        "ruleId": "NE-CAL-NE-LPA-ADDITIONAL-DAY-ASCENSION-FRIDAY-21F519039621689A",
        "calendarId": "ap22-ne-21f519039621",
        "jurisdiction": {
          "level": "cantonal",
          "code": "NE"
        },
        "labelKey": "holiday.ne.NE-LPA-ADDITIONAL-DAY-ASCENSION-FRIDAY",
        "labels": {
          "de": "Freitag nach Auffahrt",
          "fr": "Vendredi de l’Ascension"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-NE-LPA-152130-20260101",
            "locator": "LPA Art. 33 Abs. 3 in Verbindung mit RDF Art. 11 Abs. 1"
          }
        ],
        "calculation": {
          "type": "easterOffsetDays",
          "offsetDays": 40
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "proceduralEquivalentDay",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "NE-LPA-ADDITIONAL-DAY-ASCENSION-FRIDAY"
        }
      },
      {
        "ruleId": "NE-CAL-NE-LPA-ADDITIONAL-DAY-BERCHTOLD-21F519039621689A",
        "calendarId": "ap22-ne-21f519039621",
        "jurisdiction": {
          "level": "cantonal",
          "code": "NE"
        },
        "labelKey": "holiday.ne.NE-LPA-ADDITIONAL-DAY-BERCHTOLD",
        "labels": {
          "de": "2. Januar",
          "fr": "2 janvier"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-NE-LPA-152130-20260101",
            "locator": "LPA Art. 33 Abs. 3 in Verbindung mit RDF Art. 11 Abs. 1"
          }
        ],
        "calculation": {
          "type": "fixedMonthDay",
          "month": 1,
          "day": 2
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "proceduralEquivalentDay",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "NE-LPA-ADDITIONAL-DAY-BERCHTOLD"
        }
      },
      {
        "ruleId": "NE-CAL-NE-LPA-ADDITIONAL-DAY-CHRISTMAS-EVE-21F519039621689A",
        "calendarId": "ap22-ne-21f519039621",
        "jurisdiction": {
          "level": "cantonal",
          "code": "NE"
        },
        "labelKey": "holiday.ne.NE-LPA-ADDITIONAL-DAY-CHRISTMAS-EVE",
        "labels": {
          "de": "Heiligabend",
          "fr": "Veille de Noël"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-NE-LPA-152130-20260101",
            "locator": "LPA Art. 33 Abs. 3 in Verbindung mit RDF Art. 11 Abs. 1"
          }
        ],
        "calculation": {
          "type": "fixedMonthDay",
          "month": 12,
          "day": 24
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "proceduralEquivalentDay",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "NE-LPA-ADDITIONAL-DAY-CHRISTMAS-EVE"
        }
      },
      {
        "ruleId": "NE-CAL-NE-LPA-ADDITIONAL-DAY-EASTER-MONDAY-21F519039621689A",
        "calendarId": "ap22-ne-21f519039621",
        "jurisdiction": {
          "level": "cantonal",
          "code": "NE"
        },
        "labelKey": "holiday.ne.NE-LPA-ADDITIONAL-DAY-EASTER-MONDAY",
        "labels": {
          "de": "Ostermontag",
          "fr": "Lundi de Pâques"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-NE-LPA-152130-20260101",
            "locator": "LPA Art. 33 Abs. 3 in Verbindung mit RDF Art. 11 Abs. 1"
          }
        ],
        "calculation": {
          "type": "easterOffsetDays",
          "offsetDays": 1
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "proceduralEquivalentDay",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "NE-LPA-ADDITIONAL-DAY-EASTER-MONDAY"
        }
      },
      {
        "ruleId": "NE-CAL-NE-LPA-ADDITIONAL-DAY-FEDERAL-FAST-MONDAY-21F519039621689A",
        "calendarId": "ap22-ne-21f519039621",
        "jurisdiction": {
          "level": "cantonal",
          "code": "NE"
        },
        "labelKey": "holiday.ne.NE-LPA-ADDITIONAL-DAY-FEDERAL-FAST-MONDAY",
        "labels": {
          "de": "Bettagsmontag",
          "fr": "Lundi du Jeûne fédéral"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-NE-LPA-152130-20260101",
            "locator": "LPA Art. 33 Abs. 3 in Verbindung mit RDF Art. 11 Abs. 1"
          }
        ],
        "calculation": {
          "type": "nthWeekdayOffsetDays",
          "month": 9,
          "offsetDays": 1,
          "isoWeekday": 7,
          "occurrence": 3
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "proceduralEquivalentDay",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "NE-LPA-ADDITIONAL-DAY-FEDERAL-FAST-MONDAY"
        }
      },
      {
        "ruleId": "NE-CAL-NE-LPA-ADDITIONAL-DAY-NEW-YEAR-EVE-21F519039621689A",
        "calendarId": "ap22-ne-21f519039621",
        "jurisdiction": {
          "level": "cantonal",
          "code": "NE"
        },
        "labelKey": "holiday.ne.NE-LPA-ADDITIONAL-DAY-NEW-YEAR-EVE",
        "labels": {
          "de": "Silvester",
          "fr": "Saint-Sylvestre"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-NE-LPA-152130-20260101",
            "locator": "LPA Art. 33 Abs. 3 in Verbindung mit RDF Art. 11 Abs. 1"
          }
        ],
        "calculation": {
          "type": "fixedMonthDay",
          "month": 12,
          "day": 31
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "proceduralEquivalentDay",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "NE-LPA-ADDITIONAL-DAY-NEW-YEAR-EVE"
        }
      },
      {
        "ruleId": "NE-CAL-NE-LPA-ADDITIONAL-DAY-ST-STEPHEN-21F519039621689A",
        "calendarId": "ap22-ne-21f519039621",
        "jurisdiction": {
          "level": "cantonal",
          "code": "NE"
        },
        "labelKey": "holiday.ne.NE-LPA-ADDITIONAL-DAY-ST-STEPHEN",
        "labels": {
          "de": "Stephanstag",
          "fr": "Saint-Étienne"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-NE-LPA-152130-20260101",
            "locator": "LPA Art. 33 Abs. 3 in Verbindung mit RDF Art. 11 Abs. 1"
          }
        ],
        "calculation": {
          "type": "fixedMonthDay",
          "month": 12,
          "day": 26
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "proceduralEquivalentDay",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "NE-LPA-ADDITIONAL-DAY-ST-STEPHEN"
        }
      },
      {
        "ruleId": "NE-CAL-NE-LPA-ADDITIONAL-DAY-WHIT-MONDAY-21F519039621689A",
        "calendarId": "ap22-ne-21f519039621",
        "jurisdiction": {
          "level": "cantonal",
          "code": "NE"
        },
        "labelKey": "holiday.ne.NE-LPA-ADDITIONAL-DAY-WHIT-MONDAY",
        "labels": {
          "de": "Pfingstmontag",
          "fr": "Lundi de Pentecôte"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-NE-LPA-152130-20260101",
            "locator": "LPA Art. 33 Abs. 3 in Verbindung mit RDF Art. 11 Abs. 1"
          }
        ],
        "calculation": {
          "type": "easterOffsetDays",
          "offsetDays": 50
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "proceduralEquivalentDay",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "NE-LPA-ADDITIONAL-DAY-WHIT-MONDAY"
        }
      }
    ],
    "projection": {
      "catalogId": "ch-holiday-catalog",
      "catalogFormatVersion": "2.0.0",
      "projectionId": "projection-21f519039621689a",
      "sourceHash": "c5701e47df0d07bb288719b26d55c31b84fe83ea539578d9192e292e08602570"
    }
  },
  {
    "$schema": "https://raw.githubusercontent.com/davidsteimer/fristenrechner/main/schemas/calendar-rules-v3.schema.json",
    "formatVersion": "3.0.0",
    "dataKind": "calendar",
    "calendarId": "ap22-nw-5dfca484e4af",
    "jurisdiction": {
      "level": "cantonal",
      "code": "NW"
    },
    "validity": {
      "from": "2026-08-29",
      "to": null
    },
    "inherits": [
      "ch-federal-calendar"
    ],
    "review": {
      "reviewedOn": "2026-10-08",
      "status": "candidate",
      "reviewedBy": "Codex",
      "basis": "AP22C1 Datenkandidat auf Grundlage von DEC-2026-030. Keine Quellen- oder Betriebsfreigabe."
    },
    "sources": [
      {
        "sourceId": "SRC-BUNDESFEIERTAG-19940701",
        "sourceType": "officialDossier",
        "title": "Verordnung über den Bundesfeiertag, SR 116",
        "authority": "CH",
        "url": "https://www.fedlex.admin.ch/eli/cc/1994/1340_1340_1340/de",
        "documentVersionDate": "1994-07-01",
        "reviewedOn": "2026-09-13",
        "reviewStatus": "monitored"
      },
      {
        "sourceId": "SRC-NW-RTG-9211-20160101",
        "sourceType": "officialDossier",
        "title": "Gesetz über die öffentlichen Ruhetage, RTG",
        "authority": "CH-NW",
        "url": "https://gesetze.nw.ch/app/de/texts_of_law/921.1",
        "documentVersionDate": "2016-01-01",
        "reviewedOn": "2026-09-13",
        "reviewStatus": "monitored"
      }
    ],
    "rules": [
      {
        "ruleId": "NW-CAL-NW-RTG-ALL-DAY-ALL-SAINTS-5DFCA484E4AF1EA0",
        "calendarId": "ap22-nw-5dfca484e4af",
        "jurisdiction": {
          "level": "cantonal",
          "code": "NW"
        },
        "labelKey": "holiday.nw.NW-RTG-ALL-DAY-ALL-SAINTS",
        "labels": {
          "de": "Allerheiligen",
          "fr": "Toussaint"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-NW-RTG-9211-20160101",
            "locator": "Art. 2 Abs. 1 Ziff. 3"
          }
        ],
        "calculation": {
          "type": "fixedMonthDay",
          "month": 11,
          "day": 1
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "NW-RTG-ALL-DAY-ALL-SAINTS"
        }
      },
      {
        "ruleId": "NW-CAL-NW-RTG-ALL-DAY-ASCENSION-5DFCA484E4AF1EA0",
        "calendarId": "ap22-nw-5dfca484e4af",
        "jurisdiction": {
          "level": "cantonal",
          "code": "NW"
        },
        "labelKey": "holiday.nw.NW-RTG-ALL-DAY-ASCENSION",
        "labels": {
          "de": "Auffahrt",
          "fr": "Ascension"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-NW-RTG-9211-20160101",
            "locator": "Art. 2 Abs. 1 Ziff. 3"
          }
        ],
        "calculation": {
          "type": "easterOffsetDays",
          "offsetDays": 39
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "NW-RTG-ALL-DAY-ASCENSION"
        }
      },
      {
        "ruleId": "NW-CAL-NW-RTG-ALL-DAY-ASSUMPTION-5DFCA484E4AF1EA0",
        "calendarId": "ap22-nw-5dfca484e4af",
        "jurisdiction": {
          "level": "cantonal",
          "code": "NW"
        },
        "labelKey": "holiday.nw.NW-RTG-ALL-DAY-ASSUMPTION",
        "labels": {
          "de": "Mariä Himmelfahrt",
          "fr": "Assomption"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-NW-RTG-9211-20160101",
            "locator": "Art. 2 Abs. 1 Ziff. 3"
          }
        ],
        "calculation": {
          "type": "fixedMonthDay",
          "month": 8,
          "day": 15
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "NW-RTG-ALL-DAY-ASSUMPTION"
        }
      },
      {
        "ruleId": "NW-CAL-NW-RTG-ALL-DAY-CHRISTMAS-5DFCA484E4AF1EA0",
        "calendarId": "ap22-nw-5dfca484e4af",
        "jurisdiction": {
          "level": "cantonal",
          "code": "NW"
        },
        "labelKey": "holiday.nw.NW-RTG-ALL-DAY-CHRISTMAS",
        "labels": {
          "de": "Weihnachten",
          "fr": "Noël"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-NW-RTG-9211-20160101",
            "locator": "Art. 2 Abs. 1 Ziff. 2"
          }
        ],
        "calculation": {
          "type": "fixedMonthDay",
          "month": 12,
          "day": 25
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "NW-RTG-ALL-DAY-CHRISTMAS"
        }
      },
      {
        "ruleId": "NW-CAL-NW-RTG-ALL-DAY-CORPUS-CHRISTI-5DFCA484E4AF1EA0",
        "calendarId": "ap22-nw-5dfca484e4af",
        "jurisdiction": {
          "level": "cantonal",
          "code": "NW"
        },
        "labelKey": "holiday.nw.NW-RTG-ALL-DAY-CORPUS-CHRISTI",
        "labels": {
          "de": "Fronleichnam",
          "fr": "Fête-Dieu"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-NW-RTG-9211-20160101",
            "locator": "Art. 2 Abs. 1 Ziff. 3"
          }
        ],
        "calculation": {
          "type": "easterOffsetDays",
          "offsetDays": 60
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "NW-RTG-ALL-DAY-CORPUS-CHRISTI"
        }
      },
      {
        "ruleId": "NW-CAL-NW-RTG-ALL-DAY-EASTER-5DFCA484E4AF1EA0",
        "calendarId": "ap22-nw-5dfca484e4af",
        "jurisdiction": {
          "level": "cantonal",
          "code": "NW"
        },
        "labelKey": "holiday.nw.NW-RTG-ALL-DAY-EASTER",
        "labels": {
          "de": "Ostern",
          "fr": "Pâques"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-NW-RTG-9211-20160101",
            "locator": "Art. 2 Abs. 1 Ziff. 2"
          }
        ],
        "calculation": {
          "type": "easterOffsetDays",
          "offsetDays": 0
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "NW-RTG-ALL-DAY-EASTER"
        }
      },
      {
        "ruleId": "NW-CAL-NW-RTG-ALL-DAY-FEDERAL-FAST-5DFCA484E4AF1EA0",
        "calendarId": "ap22-nw-5dfca484e4af",
        "jurisdiction": {
          "level": "cantonal",
          "code": "NW"
        },
        "labelKey": "holiday.nw.NW-RTG-ALL-DAY-FEDERAL-FAST",
        "labels": {
          "de": "Eidgenössischer Dank-, Buss- und Bettag",
          "fr": "Jeûne fédéral"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-NW-RTG-9211-20160101",
            "locator": "Art. 2 Abs. 1 Ziff. 2"
          }
        ],
        "calculation": {
          "type": "nthWeekdayOfMonth",
          "month": 9,
          "isoWeekday": 7,
          "occurrence": 3
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "NW-RTG-ALL-DAY-FEDERAL-FAST"
        }
      },
      {
        "ruleId": "NW-CAL-NW-RTG-ALL-DAY-GOOD-FRIDAY-5DFCA484E4AF1EA0",
        "calendarId": "ap22-nw-5dfca484e4af",
        "jurisdiction": {
          "level": "cantonal",
          "code": "NW"
        },
        "labelKey": "holiday.nw.NW-RTG-ALL-DAY-GOOD-FRIDAY",
        "labels": {
          "de": "Karfreitag",
          "fr": "Vendredi saint"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-NW-RTG-9211-20160101",
            "locator": "Art. 2 Abs. 1 Ziff. 2"
          }
        ],
        "calculation": {
          "type": "easterOffsetDays",
          "offsetDays": -2
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "NW-RTG-ALL-DAY-GOOD-FRIDAY"
        }
      },
      {
        "ruleId": "NW-CAL-NW-RTG-ALL-DAY-IMMACULATE-CONCEPTION-5DFCA484E4AF1EA0",
        "calendarId": "ap22-nw-5dfca484e4af",
        "jurisdiction": {
          "level": "cantonal",
          "code": "NW"
        },
        "labelKey": "holiday.nw.NW-RTG-ALL-DAY-IMMACULATE-CONCEPTION",
        "labels": {
          "de": "Mariä Empfängnis",
          "fr": "Immaculée Conception"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-NW-RTG-9211-20160101",
            "locator": "Art. 2 Abs. 1 Ziff. 3"
          }
        ],
        "calculation": {
          "type": "fixedMonthDay",
          "month": 12,
          "day": 8
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "NW-RTG-ALL-DAY-IMMACULATE-CONCEPTION"
        }
      },
      {
        "ruleId": "NW-CAL-NW-RTG-ALL-DAY-NATIONAL-DAY-5DFCA484E4AF1EA0",
        "calendarId": "ap22-nw-5dfca484e4af",
        "jurisdiction": {
          "level": "cantonal",
          "code": "NW"
        },
        "labelKey": "holiday.nw.NW-RTG-ALL-DAY-NATIONAL-DAY",
        "labels": {
          "de": "Bundesfeiertag",
          "fr": "Fête nationale"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-BUNDESFEIERTAG-19940701",
            "locator": "SR 116 Art. 1, neue offene Anwendung auf dieses Geltungsprofil"
          }
        ],
        "calculation": {
          "type": "fixedMonthDay",
          "month": 8,
          "day": 1
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "NW-RTG-ALL-DAY-NATIONAL-DAY"
        }
      },
      {
        "ruleId": "NW-CAL-NW-RTG-ALL-DAY-NEW-YEAR-5DFCA484E4AF1EA0",
        "calendarId": "ap22-nw-5dfca484e4af",
        "jurisdiction": {
          "level": "cantonal",
          "code": "NW"
        },
        "labelKey": "holiday.nw.NW-RTG-ALL-DAY-NEW-YEAR",
        "labels": {
          "de": "Neujahr",
          "fr": "Nouvel An"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-NW-RTG-9211-20160101",
            "locator": "Art. 2 Abs. 1 Ziff. 3"
          }
        ],
        "calculation": {
          "type": "fixedMonthDay",
          "month": 1,
          "day": 1
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "NW-RTG-ALL-DAY-NEW-YEAR"
        }
      },
      {
        "ruleId": "NW-CAL-NW-RTG-ALL-DAY-PENTECOST-5DFCA484E4AF1EA0",
        "calendarId": "ap22-nw-5dfca484e4af",
        "jurisdiction": {
          "level": "cantonal",
          "code": "NW"
        },
        "labelKey": "holiday.nw.NW-RTG-ALL-DAY-PENTECOST",
        "labels": {
          "de": "Pfingsten",
          "fr": "Pentecôte"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-NW-RTG-9211-20160101",
            "locator": "Art. 2 Abs. 1 Ziff. 2"
          }
        ],
        "calculation": {
          "type": "easterOffsetDays",
          "offsetDays": 49
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "NW-RTG-ALL-DAY-PENTECOST"
        }
      },
      {
        "ruleId": "NW-CAL-NW-RTG-ALL-DAY-ST-JOSEPH-5DFCA484E4AF1EA0",
        "calendarId": "ap22-nw-5dfca484e4af",
        "jurisdiction": {
          "level": "cantonal",
          "code": "NW"
        },
        "labelKey": "holiday.nw.NW-RTG-ALL-DAY-ST-JOSEPH",
        "labels": {
          "de": "Josefstag",
          "fr": "Saint-Joseph"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-NW-RTG-9211-20160101",
            "locator": "Art. 2 Abs. 1 Ziff. 3"
          }
        ],
        "calculation": {
          "type": "fixedMonthDay",
          "month": 3,
          "day": 19
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "NW-RTG-ALL-DAY-ST-JOSEPH"
        }
      }
    ],
    "projection": {
      "catalogId": "ch-holiday-catalog",
      "catalogFormatVersion": "2.0.0",
      "projectionId": "projection-5dfca484e4af1ea0",
      "sourceHash": "c5701e47df0d07bb288719b26d55c31b84fe83ea539578d9192e292e08602570"
    }
  },
  {
    "$schema": "https://raw.githubusercontent.com/davidsteimer/fristenrechner/main/schemas/calendar-rules-v3.schema.json",
    "formatVersion": "3.0.0",
    "dataKind": "calendar",
    "calendarId": "ap22-ow-76c151dccf1f",
    "jurisdiction": {
      "level": "cantonal",
      "code": "OW"
    },
    "validity": {
      "from": "2026-08-29",
      "to": null
    },
    "inherits": [
      "ch-federal-calendar"
    ],
    "review": {
      "reviewedOn": "2026-10-08",
      "status": "candidate",
      "reviewedBy": "Codex",
      "basis": "AP22C1 Datenkandidat auf Grundlage von DEC-2026-030. Keine Quellen- oder Betriebsfreigabe."
    },
    "sources": [
      {
        "sourceId": "SRC-BUNDESFEIERTAG-19940701",
        "sourceType": "officialDossier",
        "title": "Verordnung über den Bundesfeiertag, SR 116",
        "authority": "CH",
        "url": "https://www.fedlex.admin.ch/eli/cc/1994/1340_1340_1340/de",
        "documentVersionDate": "1994-07-01",
        "reviewedOn": "2026-09-13",
        "reviewStatus": "monitored"
      },
      {
        "sourceId": "SRC-OW-RTG-9752-20090801",
        "sourceType": "officialDossier",
        "title": "Gesetz über die öffentlichen Ruhetage, Ruhetagsgesetz",
        "authority": "CH-OW",
        "url": "https://gdb.ow.ch/api/de/versions/103/pdf_file",
        "documentVersionDate": "2009-08-01",
        "reviewedOn": "2026-09-13",
        "reviewStatus": "monitored"
      }
    ],
    "rules": [
      {
        "ruleId": "OW-CAL-OW-RTG-ALL-DAY-ALL-SAINTS-76C151DCCF1F235B",
        "calendarId": "ap22-ow-76c151dccf1f",
        "jurisdiction": {
          "level": "cantonal",
          "code": "OW"
        },
        "labelKey": "holiday.ow.OW-RTG-ALL-DAY-ALL-SAINTS",
        "labels": {
          "de": "Allerheiligen",
          "fr": "Toussaint"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-OW-RTG-9752-20090801",
            "locator": "Art. 2 Abs. 1 Bst. b"
          }
        ],
        "calculation": {
          "type": "fixedMonthDay",
          "month": 11,
          "day": 1
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "OW-RTG-ALL-DAY-ALL-SAINTS"
        }
      },
      {
        "ruleId": "OW-CAL-OW-RTG-ALL-DAY-ASCENSION-76C151DCCF1F235B",
        "calendarId": "ap22-ow-76c151dccf1f",
        "jurisdiction": {
          "level": "cantonal",
          "code": "OW"
        },
        "labelKey": "holiday.ow.OW-RTG-ALL-DAY-ASCENSION",
        "labels": {
          "de": "Auffahrt",
          "fr": "Ascension"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-OW-RTG-9752-20090801",
            "locator": "Art. 2 Abs. 1 Bst. b"
          }
        ],
        "calculation": {
          "type": "easterOffsetDays",
          "offsetDays": 39
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "OW-RTG-ALL-DAY-ASCENSION"
        }
      },
      {
        "ruleId": "OW-CAL-OW-RTG-ALL-DAY-ASSUMPTION-76C151DCCF1F235B",
        "calendarId": "ap22-ow-76c151dccf1f",
        "jurisdiction": {
          "level": "cantonal",
          "code": "OW"
        },
        "labelKey": "holiday.ow.OW-RTG-ALL-DAY-ASSUMPTION",
        "labels": {
          "de": "Mariä Himmelfahrt",
          "fr": "Assomption"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-OW-RTG-9752-20090801",
            "locator": "Art. 2 Abs. 1 Bst. b"
          }
        ],
        "calculation": {
          "type": "fixedMonthDay",
          "month": 8,
          "day": 15
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "OW-RTG-ALL-DAY-ASSUMPTION"
        }
      },
      {
        "ruleId": "OW-CAL-OW-RTG-ALL-DAY-BRUDER-KLAUS-76C151DCCF1F235B",
        "calendarId": "ap22-ow-76c151dccf1f",
        "jurisdiction": {
          "level": "cantonal",
          "code": "OW"
        },
        "labelKey": "holiday.ow.OW-RTG-ALL-DAY-BRUDER-KLAUS",
        "labels": {
          "de": "Bruderklausenfest",
          "fr": "Fête de saint Nicolas de Flue"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-OW-RTG-9752-20090801",
            "locator": "Art. 2 Abs. 1 Bst. b"
          }
        ],
        "calculation": {
          "type": "fixedMonthDay",
          "month": 9,
          "day": 25
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "OW-RTG-ALL-DAY-BRUDER-KLAUS"
        }
      },
      {
        "ruleId": "OW-CAL-OW-RTG-ALL-DAY-CHRISTMAS-76C151DCCF1F235B",
        "calendarId": "ap22-ow-76c151dccf1f",
        "jurisdiction": {
          "level": "cantonal",
          "code": "OW"
        },
        "labelKey": "holiday.ow.OW-RTG-ALL-DAY-CHRISTMAS",
        "labels": {
          "de": "Weihnachten",
          "fr": "Noël"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-OW-RTG-9752-20090801",
            "locator": "Art. 2 Abs. 1 Bst. c"
          }
        ],
        "calculation": {
          "type": "fixedMonthDay",
          "month": 12,
          "day": 25
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "OW-RTG-ALL-DAY-CHRISTMAS"
        }
      },
      {
        "ruleId": "OW-CAL-OW-RTG-ALL-DAY-CORPUS-CHRISTI-76C151DCCF1F235B",
        "calendarId": "ap22-ow-76c151dccf1f",
        "jurisdiction": {
          "level": "cantonal",
          "code": "OW"
        },
        "labelKey": "holiday.ow.OW-RTG-ALL-DAY-CORPUS-CHRISTI",
        "labels": {
          "de": "Fronleichnam",
          "fr": "Fête-Dieu"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-OW-RTG-9752-20090801",
            "locator": "Art. 2 Abs. 1 Bst. b"
          }
        ],
        "calculation": {
          "type": "easterOffsetDays",
          "offsetDays": 60
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "OW-RTG-ALL-DAY-CORPUS-CHRISTI"
        }
      },
      {
        "ruleId": "OW-CAL-OW-RTG-ALL-DAY-EASTER-76C151DCCF1F235B",
        "calendarId": "ap22-ow-76c151dccf1f",
        "jurisdiction": {
          "level": "cantonal",
          "code": "OW"
        },
        "labelKey": "holiday.ow.OW-RTG-ALL-DAY-EASTER",
        "labels": {
          "de": "Ostern",
          "fr": "Pâques"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-OW-RTG-9752-20090801",
            "locator": "Art. 2 Abs. 1 Bst. c"
          }
        ],
        "calculation": {
          "type": "easterOffsetDays",
          "offsetDays": 0
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "OW-RTG-ALL-DAY-EASTER"
        }
      },
      {
        "ruleId": "OW-CAL-OW-RTG-ALL-DAY-FEDERAL-FAST-76C151DCCF1F235B",
        "calendarId": "ap22-ow-76c151dccf1f",
        "jurisdiction": {
          "level": "cantonal",
          "code": "OW"
        },
        "labelKey": "holiday.ow.OW-RTG-ALL-DAY-FEDERAL-FAST",
        "labels": {
          "de": "Eidgenössischer Dank-, Buss- und Bettag",
          "fr": "Jeûne fédéral"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-OW-RTG-9752-20090801",
            "locator": "Art. 2 Abs. 1 Bst. c"
          }
        ],
        "calculation": {
          "type": "nthWeekdayOfMonth",
          "month": 9,
          "isoWeekday": 7,
          "occurrence": 3
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "OW-RTG-ALL-DAY-FEDERAL-FAST"
        }
      },
      {
        "ruleId": "OW-CAL-OW-RTG-ALL-DAY-GOOD-FRIDAY-76C151DCCF1F235B",
        "calendarId": "ap22-ow-76c151dccf1f",
        "jurisdiction": {
          "level": "cantonal",
          "code": "OW"
        },
        "labelKey": "holiday.ow.OW-RTG-ALL-DAY-GOOD-FRIDAY",
        "labels": {
          "de": "Karfreitag",
          "fr": "Vendredi saint"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-OW-RTG-9752-20090801",
            "locator": "Art. 2 Abs. 1 Bst. c"
          }
        ],
        "calculation": {
          "type": "easterOffsetDays",
          "offsetDays": -2
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "OW-RTG-ALL-DAY-GOOD-FRIDAY"
        }
      },
      {
        "ruleId": "OW-CAL-OW-RTG-ALL-DAY-IMMACULATE-CONCEPTION-76C151DCCF1F235B",
        "calendarId": "ap22-ow-76c151dccf1f",
        "jurisdiction": {
          "level": "cantonal",
          "code": "OW"
        },
        "labelKey": "holiday.ow.OW-RTG-ALL-DAY-IMMACULATE-CONCEPTION",
        "labels": {
          "de": "Mariä Empfängnis",
          "fr": "Immaculée Conception"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-OW-RTG-9752-20090801",
            "locator": "Art. 2 Abs. 1 Bst. b"
          }
        ],
        "calculation": {
          "type": "fixedMonthDay",
          "month": 12,
          "day": 8
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "OW-RTG-ALL-DAY-IMMACULATE-CONCEPTION"
        }
      },
      {
        "ruleId": "OW-CAL-OW-RTG-ALL-DAY-NATIONAL-DAY-76C151DCCF1F235B",
        "calendarId": "ap22-ow-76c151dccf1f",
        "jurisdiction": {
          "level": "cantonal",
          "code": "OW"
        },
        "labelKey": "holiday.ow.OW-RTG-ALL-DAY-NATIONAL-DAY",
        "labels": {
          "de": "Bundesfeiertag",
          "fr": "Fête nationale"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-BUNDESFEIERTAG-19940701",
            "locator": "SR 116 Art. 1, neue offene Anwendung auf dieses Geltungsprofil"
          }
        ],
        "calculation": {
          "type": "fixedMonthDay",
          "month": 8,
          "day": 1
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "OW-RTG-ALL-DAY-NATIONAL-DAY"
        }
      },
      {
        "ruleId": "OW-CAL-OW-RTG-ALL-DAY-NEW-YEAR-76C151DCCF1F235B",
        "calendarId": "ap22-ow-76c151dccf1f",
        "jurisdiction": {
          "level": "cantonal",
          "code": "OW"
        },
        "labelKey": "holiday.ow.OW-RTG-ALL-DAY-NEW-YEAR",
        "labels": {
          "de": "Neujahr",
          "fr": "Nouvel An"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-OW-RTG-9752-20090801",
            "locator": "Art. 2 Abs. 1 Bst. b"
          }
        ],
        "calculation": {
          "type": "fixedMonthDay",
          "month": 1,
          "day": 1
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "OW-RTG-ALL-DAY-NEW-YEAR"
        }
      },
      {
        "ruleId": "OW-CAL-OW-RTG-ALL-DAY-PENTECOST-76C151DCCF1F235B",
        "calendarId": "ap22-ow-76c151dccf1f",
        "jurisdiction": {
          "level": "cantonal",
          "code": "OW"
        },
        "labelKey": "holiday.ow.OW-RTG-ALL-DAY-PENTECOST",
        "labels": {
          "de": "Pfingsten",
          "fr": "Pentecôte"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-OW-RTG-9752-20090801",
            "locator": "Art. 2 Abs. 1 Bst. c"
          }
        ],
        "calculation": {
          "type": "easterOffsetDays",
          "offsetDays": 49
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "OW-RTG-ALL-DAY-PENTECOST"
        }
      }
    ],
    "projection": {
      "catalogId": "ch-holiday-catalog",
      "catalogFormatVersion": "2.0.0",
      "projectionId": "projection-76c151dccf1f235b",
      "sourceHash": "c5701e47df0d07bb288719b26d55c31b84fe83ea539578d9192e292e08602570"
    }
  },
  {
    "$schema": "https://raw.githubusercontent.com/davidsteimer/fristenrechner/main/schemas/calendar-rules-v3.schema.json",
    "formatVersion": "3.0.0",
    "dataKind": "calendar",
    "calendarId": "ap22-sg-79009d6d6021",
    "jurisdiction": {
      "level": "cantonal",
      "code": "SG"
    },
    "validity": {
      "from": "2026-08-29",
      "to": null
    },
    "inherits": [
      "ch-federal-calendar"
    ],
    "review": {
      "reviewedOn": "2026-10-08",
      "status": "candidate",
      "reviewedBy": "Codex",
      "basis": "AP22C1 Datenkandidat auf Grundlage von DEC-2026-030. Keine Quellen- oder Betriebsfreigabe."
    },
    "sources": [
      {
        "sourceId": "SRC-BUNDESFEIERTAG-19940701",
        "sourceType": "officialDossier",
        "title": "Verordnung über den Bundesfeiertag, SR 116",
        "authority": "CH",
        "url": "https://www.fedlex.admin.ch/eli/cc/1994/1340_1340_1340/de",
        "documentVersionDate": "1994-07-01",
        "reviewedOn": "2026-09-13",
        "reviewStatus": "monitored"
      },
      {
        "sourceId": "SRC-SG-RLG-5521-V228",
        "sourceType": "officialDossier",
        "title": "Gesetz über Ruhetag und Ladenöffnung, RLG",
        "authority": "CH-SG",
        "url": "https://www.gesetzessammlung.sg.ch/api/de/versions/228/pdf_file",
        "documentVersionDate": "2008-01-22",
        "reviewedOn": "2026-09-13",
        "reviewStatus": "monitored"
      }
    ],
    "rules": [
      {
        "ruleId": "SG-CAL-SG-RLG-ALL-DAY-ALL-SAINTS-79009D6D60215F6C",
        "calendarId": "ap22-sg-79009d6d6021",
        "jurisdiction": {
          "level": "cantonal",
          "code": "SG"
        },
        "labelKey": "holiday.sg.SG-RLG-ALL-DAY-ALL-SAINTS",
        "labels": {
          "de": "Allerheiligen",
          "fr": "Toussaint"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-SG-RLG-5521-V228",
            "locator": "Art. 2 und Art. 3"
          }
        ],
        "calculation": {
          "type": "fixedMonthDay",
          "month": 11,
          "day": 1
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "SG-RLG-ALL-DAY-ALL-SAINTS"
        }
      },
      {
        "ruleId": "SG-CAL-SG-RLG-ALL-DAY-ASCENSION-79009D6D60215F6C",
        "calendarId": "ap22-sg-79009d6d6021",
        "jurisdiction": {
          "level": "cantonal",
          "code": "SG"
        },
        "labelKey": "holiday.sg.SG-RLG-ALL-DAY-ASCENSION",
        "labels": {
          "de": "Auffahrt",
          "fr": "Ascension"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-SG-RLG-5521-V228",
            "locator": "Art. 2 und Art. 3"
          }
        ],
        "calculation": {
          "type": "easterOffsetDays",
          "offsetDays": 39
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "SG-RLG-ALL-DAY-ASCENSION"
        }
      },
      {
        "ruleId": "SG-CAL-SG-RLG-ALL-DAY-CHRISTMAS-79009D6D60215F6C",
        "calendarId": "ap22-sg-79009d6d6021",
        "jurisdiction": {
          "level": "cantonal",
          "code": "SG"
        },
        "labelKey": "holiday.sg.SG-RLG-ALL-DAY-CHRISTMAS",
        "labels": {
          "de": "Weihnachten",
          "fr": "Noël"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-SG-RLG-5521-V228",
            "locator": "Art. 2 und Art. 3"
          }
        ],
        "calculation": {
          "type": "fixedMonthDay",
          "month": 12,
          "day": 25
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "SG-RLG-ALL-DAY-CHRISTMAS"
        }
      },
      {
        "ruleId": "SG-CAL-SG-RLG-ALL-DAY-EASTER-79009D6D60215F6C",
        "calendarId": "ap22-sg-79009d6d6021",
        "jurisdiction": {
          "level": "cantonal",
          "code": "SG"
        },
        "labelKey": "holiday.sg.SG-RLG-ALL-DAY-EASTER",
        "labels": {
          "de": "Ostern",
          "fr": "Pâques"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-SG-RLG-5521-V228",
            "locator": "Art. 2 und Art. 3"
          }
        ],
        "calculation": {
          "type": "easterOffsetDays",
          "offsetDays": 0
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "SG-RLG-ALL-DAY-EASTER"
        }
      },
      {
        "ruleId": "SG-CAL-SG-RLG-ALL-DAY-EASTER-MONDAY-79009D6D60215F6C",
        "calendarId": "ap22-sg-79009d6d6021",
        "jurisdiction": {
          "level": "cantonal",
          "code": "SG"
        },
        "labelKey": "holiday.sg.SG-RLG-ALL-DAY-EASTER-MONDAY",
        "labels": {
          "de": "Ostermontag",
          "fr": "Lundi de Pâques"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-SG-RLG-5521-V228",
            "locator": "Art. 2 und Art. 3"
          }
        ],
        "calculation": {
          "type": "easterOffsetDays",
          "offsetDays": 1
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "SG-RLG-ALL-DAY-EASTER-MONDAY"
        }
      },
      {
        "ruleId": "SG-CAL-SG-RLG-ALL-DAY-FEDERAL-FAST-79009D6D60215F6C",
        "calendarId": "ap22-sg-79009d6d6021",
        "jurisdiction": {
          "level": "cantonal",
          "code": "SG"
        },
        "labelKey": "holiday.sg.SG-RLG-ALL-DAY-FEDERAL-FAST",
        "labels": {
          "de": "Eidgenössischer Dank-, Buss- und Bettag",
          "fr": "Jeûne fédéral"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-SG-RLG-5521-V228",
            "locator": "Art. 2 und Art. 3"
          }
        ],
        "calculation": {
          "type": "nthWeekdayOfMonth",
          "month": 9,
          "isoWeekday": 7,
          "occurrence": 3
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "SG-RLG-ALL-DAY-FEDERAL-FAST"
        }
      },
      {
        "ruleId": "SG-CAL-SG-RLG-ALL-DAY-GOOD-FRIDAY-79009D6D60215F6C",
        "calendarId": "ap22-sg-79009d6d6021",
        "jurisdiction": {
          "level": "cantonal",
          "code": "SG"
        },
        "labelKey": "holiday.sg.SG-RLG-ALL-DAY-GOOD-FRIDAY",
        "labels": {
          "de": "Karfreitag",
          "fr": "Vendredi saint"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-SG-RLG-5521-V228",
            "locator": "Art. 2 und Art. 3"
          }
        ],
        "calculation": {
          "type": "easterOffsetDays",
          "offsetDays": -2
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "SG-RLG-ALL-DAY-GOOD-FRIDAY"
        }
      },
      {
        "ruleId": "SG-CAL-SG-RLG-ALL-DAY-NATIONAL-DAY-79009D6D60215F6C",
        "calendarId": "ap22-sg-79009d6d6021",
        "jurisdiction": {
          "level": "cantonal",
          "code": "SG"
        },
        "labelKey": "holiday.sg.SG-RLG-ALL-DAY-NATIONAL-DAY",
        "labels": {
          "de": "Bundesfeiertag",
          "fr": "Fête nationale"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-BUNDESFEIERTAG-19940701",
            "locator": "SR 116 Art. 1, offene Anwendung auf neues kantonales Profil"
          }
        ],
        "calculation": {
          "type": "fixedMonthDay",
          "month": 8,
          "day": 1
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "SG-RLG-ALL-DAY-NATIONAL-DAY"
        }
      },
      {
        "ruleId": "SG-CAL-SG-RLG-ALL-DAY-NEW-YEAR-79009D6D60215F6C",
        "calendarId": "ap22-sg-79009d6d6021",
        "jurisdiction": {
          "level": "cantonal",
          "code": "SG"
        },
        "labelKey": "holiday.sg.SG-RLG-ALL-DAY-NEW-YEAR",
        "labels": {
          "de": "Neujahr",
          "fr": "Nouvel An"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-SG-RLG-5521-V228",
            "locator": "Art. 2 und Art. 3"
          }
        ],
        "calculation": {
          "type": "fixedMonthDay",
          "month": 1,
          "day": 1
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "SG-RLG-ALL-DAY-NEW-YEAR"
        }
      },
      {
        "ruleId": "SG-CAL-SG-RLG-ALL-DAY-PENTECOST-79009D6D60215F6C",
        "calendarId": "ap22-sg-79009d6d6021",
        "jurisdiction": {
          "level": "cantonal",
          "code": "SG"
        },
        "labelKey": "holiday.sg.SG-RLG-ALL-DAY-PENTECOST",
        "labels": {
          "de": "Pfingsten",
          "fr": "Pentecôte"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-SG-RLG-5521-V228",
            "locator": "Art. 2 und Art. 3"
          }
        ],
        "calculation": {
          "type": "easterOffsetDays",
          "offsetDays": 49
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "SG-RLG-ALL-DAY-PENTECOST"
        }
      },
      {
        "ruleId": "SG-CAL-SG-RLG-ALL-DAY-ST-STEPHEN-79009D6D60215F6C",
        "calendarId": "ap22-sg-79009d6d6021",
        "jurisdiction": {
          "level": "cantonal",
          "code": "SG"
        },
        "labelKey": "holiday.sg.SG-RLG-ALL-DAY-ST-STEPHEN",
        "labels": {
          "de": "Stephanstag",
          "fr": "Saint-Étienne"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-SG-RLG-5521-V228",
            "locator": "Art. 2 und Art. 3"
          }
        ],
        "calculation": {
          "type": "fixedMonthDay",
          "month": 12,
          "day": 26
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "SG-RLG-ALL-DAY-ST-STEPHEN"
        }
      },
      {
        "ruleId": "SG-CAL-SG-RLG-ALL-DAY-WHIT-MONDAY-79009D6D60215F6C",
        "calendarId": "ap22-sg-79009d6d6021",
        "jurisdiction": {
          "level": "cantonal",
          "code": "SG"
        },
        "labelKey": "holiday.sg.SG-RLG-ALL-DAY-WHIT-MONDAY",
        "labels": {
          "de": "Pfingstmontag",
          "fr": "Lundi de Pentecôte"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-SG-RLG-5521-V228",
            "locator": "Art. 2 und Art. 3"
          }
        ],
        "calculation": {
          "type": "easterOffsetDays",
          "offsetDays": 50
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "SG-RLG-ALL-DAY-WHIT-MONDAY"
        }
      }
    ],
    "projection": {
      "catalogId": "ch-holiday-catalog",
      "catalogFormatVersion": "2.0.0",
      "projectionId": "projection-79009d6d60215f6c",
      "sourceHash": "c5701e47df0d07bb288719b26d55c31b84fe83ea539578d9192e292e08602570"
    }
  },
  {
    "$schema": "https://raw.githubusercontent.com/davidsteimer/fristenrechner/main/schemas/calendar-rules-v3.schema.json",
    "formatVersion": "3.0.0",
    "dataKind": "calendar",
    "calendarId": "ap22-sg-f95068e3b162",
    "jurisdiction": {
      "level": "cantonal",
      "code": "SG"
    },
    "validity": {
      "from": "2026-08-29",
      "to": null
    },
    "inherits": [
      "ch-federal-calendar"
    ],
    "review": {
      "reviewedOn": "2026-10-08",
      "status": "candidate",
      "reviewedBy": "Codex",
      "basis": "AP22C1 Datenkandidat auf Grundlage von DEC-2026-030. Keine Quellen- oder Betriebsfreigabe."
    },
    "sources": [
      {
        "sourceId": "SRC-BUNDESFEIERTAG-19940701",
        "sourceType": "officialDossier",
        "title": "Verordnung über den Bundesfeiertag, SR 116",
        "authority": "CH",
        "url": "https://www.fedlex.admin.ch/eli/cc/1994/1340_1340_1340/de",
        "documentVersionDate": "1994-07-01",
        "reviewedOn": "2026-09-13",
        "reviewStatus": "monitored"
      },
      {
        "sourceId": "SRC-SG-KGER-FS20121-20120329",
        "sourceType": "officialDossier",
        "title": "Kantonsgericht, Einzelrichter im Familienrecht, FS.2012.1 vom 29.03.2012",
        "authority": "CH-SG",
        "url": "https://publikationen.sg.ch/rechtsprechung-gerichte-detail/6031/",
        "documentVersionDate": "2012-03-29",
        "reviewedOn": "2026-09-13",
        "reviewStatus": "monitored"
      },
      {
        "sourceId": "SRC-SG-RLG-5521-V228",
        "sourceType": "officialDossier",
        "title": "Gesetz über Ruhetag und Ladenöffnung, RLG",
        "authority": "CH-SG",
        "url": "https://www.gesetzessammlung.sg.ch/api/de/versions/228/pdf_file",
        "documentVersionDate": "2008-01-22",
        "reviewedOn": "2026-09-13",
        "reviewStatus": "monitored"
      }
    ],
    "rules": [
      {
        "ruleId": "SG-CAL-SG-RLG-ALL-DAY-ALL-SAINTS-F95068E3B162E1D3",
        "calendarId": "ap22-sg-f95068e3b162",
        "jurisdiction": {
          "level": "cantonal",
          "code": "SG"
        },
        "labelKey": "holiday.sg.SG-RLG-ALL-DAY-ALL-SAINTS",
        "labels": {
          "de": "Allerheiligen",
          "fr": "Toussaint"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-SG-RLG-5521-V228",
            "locator": "Art. 2 und Art. 3"
          }
        ],
        "calculation": {
          "type": "fixedMonthDay",
          "month": 11,
          "day": 1
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "SG-RLG-ALL-DAY-ALL-SAINTS"
        }
      },
      {
        "ruleId": "SG-CAL-SG-RLG-ALL-DAY-ASCENSION-F95068E3B162E1D3",
        "calendarId": "ap22-sg-f95068e3b162",
        "jurisdiction": {
          "level": "cantonal",
          "code": "SG"
        },
        "labelKey": "holiday.sg.SG-RLG-ALL-DAY-ASCENSION",
        "labels": {
          "de": "Auffahrt",
          "fr": "Ascension"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-SG-RLG-5521-V228",
            "locator": "Art. 2 und Art. 3"
          }
        ],
        "calculation": {
          "type": "easterOffsetDays",
          "offsetDays": 39
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "SG-RLG-ALL-DAY-ASCENSION"
        }
      },
      {
        "ruleId": "SG-CAL-SG-RLG-ALL-DAY-CHRISTMAS-F95068E3B162E1D3",
        "calendarId": "ap22-sg-f95068e3b162",
        "jurisdiction": {
          "level": "cantonal",
          "code": "SG"
        },
        "labelKey": "holiday.sg.SG-RLG-ALL-DAY-CHRISTMAS",
        "labels": {
          "de": "Weihnachten",
          "fr": "Noël"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-SG-RLG-5521-V228",
            "locator": "Art. 2 und Art. 3"
          }
        ],
        "calculation": {
          "type": "fixedMonthDay",
          "month": 12,
          "day": 25
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "SG-RLG-ALL-DAY-CHRISTMAS"
        }
      },
      {
        "ruleId": "SG-CAL-SG-RLG-ALL-DAY-EASTER-F95068E3B162E1D3",
        "calendarId": "ap22-sg-f95068e3b162",
        "jurisdiction": {
          "level": "cantonal",
          "code": "SG"
        },
        "labelKey": "holiday.sg.SG-RLG-ALL-DAY-EASTER",
        "labels": {
          "de": "Ostern",
          "fr": "Pâques"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-SG-RLG-5521-V228",
            "locator": "Art. 2 und Art. 3"
          }
        ],
        "calculation": {
          "type": "easterOffsetDays",
          "offsetDays": 0
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "SG-RLG-ALL-DAY-EASTER"
        }
      },
      {
        "ruleId": "SG-CAL-SG-RLG-ALL-DAY-EASTER-MONDAY-F95068E3B162E1D3",
        "calendarId": "ap22-sg-f95068e3b162",
        "jurisdiction": {
          "level": "cantonal",
          "code": "SG"
        },
        "labelKey": "holiday.sg.SG-RLG-ALL-DAY-EASTER-MONDAY",
        "labels": {
          "de": "Ostermontag",
          "fr": "Lundi de Pâques"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-SG-RLG-5521-V228",
            "locator": "Art. 2 und Art. 3"
          }
        ],
        "calculation": {
          "type": "easterOffsetDays",
          "offsetDays": 1
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "SG-RLG-ALL-DAY-EASTER-MONDAY"
        }
      },
      {
        "ruleId": "SG-CAL-SG-RLG-ALL-DAY-FEDERAL-FAST-F95068E3B162E1D3",
        "calendarId": "ap22-sg-f95068e3b162",
        "jurisdiction": {
          "level": "cantonal",
          "code": "SG"
        },
        "labelKey": "holiday.sg.SG-RLG-ALL-DAY-FEDERAL-FAST",
        "labels": {
          "de": "Eidgenössischer Dank-, Buss- und Bettag",
          "fr": "Jeûne fédéral"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-SG-RLG-5521-V228",
            "locator": "Art. 2 und Art. 3"
          }
        ],
        "calculation": {
          "type": "nthWeekdayOfMonth",
          "month": 9,
          "isoWeekday": 7,
          "occurrence": 3
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "SG-RLG-ALL-DAY-FEDERAL-FAST"
        }
      },
      {
        "ruleId": "SG-CAL-SG-RLG-ALL-DAY-GOOD-FRIDAY-F95068E3B162E1D3",
        "calendarId": "ap22-sg-f95068e3b162",
        "jurisdiction": {
          "level": "cantonal",
          "code": "SG"
        },
        "labelKey": "holiday.sg.SG-RLG-ALL-DAY-GOOD-FRIDAY",
        "labels": {
          "de": "Karfreitag",
          "fr": "Vendredi saint"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-SG-RLG-5521-V228",
            "locator": "Art. 2 und Art. 3"
          }
        ],
        "calculation": {
          "type": "easterOffsetDays",
          "offsetDays": -2
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "SG-RLG-ALL-DAY-GOOD-FRIDAY"
        }
      },
      {
        "ruleId": "SG-CAL-SG-RLG-ALL-DAY-NATIONAL-DAY-F95068E3B162E1D3",
        "calendarId": "ap22-sg-f95068e3b162",
        "jurisdiction": {
          "level": "cantonal",
          "code": "SG"
        },
        "labelKey": "holiday.sg.SG-RLG-ALL-DAY-NATIONAL-DAY",
        "labels": {
          "de": "Bundesfeiertag",
          "fr": "Fête nationale"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-BUNDESFEIERTAG-19940701",
            "locator": "SR 116 Art. 1, offene Anwendung auf neues kantonales Profil"
          }
        ],
        "calculation": {
          "type": "fixedMonthDay",
          "month": 8,
          "day": 1
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "SG-RLG-ALL-DAY-NATIONAL-DAY"
        }
      },
      {
        "ruleId": "SG-CAL-SG-RLG-ALL-DAY-NEW-YEAR-F95068E3B162E1D3",
        "calendarId": "ap22-sg-f95068e3b162",
        "jurisdiction": {
          "level": "cantonal",
          "code": "SG"
        },
        "labelKey": "holiday.sg.SG-RLG-ALL-DAY-NEW-YEAR",
        "labels": {
          "de": "Neujahr",
          "fr": "Nouvel An"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-SG-RLG-5521-V228",
            "locator": "Art. 2 und Art. 3"
          }
        ],
        "calculation": {
          "type": "fixedMonthDay",
          "month": 1,
          "day": 1
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "SG-RLG-ALL-DAY-NEW-YEAR"
        }
      },
      {
        "ruleId": "SG-CAL-SG-RLG-ALL-DAY-PENTECOST-F95068E3B162E1D3",
        "calendarId": "ap22-sg-f95068e3b162",
        "jurisdiction": {
          "level": "cantonal",
          "code": "SG"
        },
        "labelKey": "holiday.sg.SG-RLG-ALL-DAY-PENTECOST",
        "labels": {
          "de": "Pfingsten",
          "fr": "Pentecôte"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-SG-RLG-5521-V228",
            "locator": "Art. 2 und Art. 3"
          }
        ],
        "calculation": {
          "type": "easterOffsetDays",
          "offsetDays": 49
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "SG-RLG-ALL-DAY-PENTECOST"
        }
      },
      {
        "ruleId": "SG-CAL-SG-RLG-ALL-DAY-ST-STEPHEN-F95068E3B162E1D3",
        "calendarId": "ap22-sg-f95068e3b162",
        "jurisdiction": {
          "level": "cantonal",
          "code": "SG"
        },
        "labelKey": "holiday.sg.SG-RLG-ALL-DAY-ST-STEPHEN",
        "labels": {
          "de": "Stephanstag",
          "fr": "Saint-Étienne"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-SG-RLG-5521-V228",
            "locator": "Art. 2 und Art. 3"
          }
        ],
        "calculation": {
          "type": "fixedMonthDay",
          "month": 12,
          "day": 26
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "SG-RLG-ALL-DAY-ST-STEPHEN"
        }
      },
      {
        "ruleId": "SG-CAL-SG-RLG-ALL-DAY-WHIT-MONDAY-F95068E3B162E1D3",
        "calendarId": "ap22-sg-f95068e3b162",
        "jurisdiction": {
          "level": "cantonal",
          "code": "SG"
        },
        "labelKey": "holiday.sg.SG-RLG-ALL-DAY-WHIT-MONDAY",
        "labels": {
          "de": "Pfingstmontag",
          "fr": "Lundi de Pentecôte"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-SG-RLG-5521-V228",
            "locator": "Art. 2 und Art. 3"
          }
        ],
        "calculation": {
          "type": "easterOffsetDays",
          "offsetDays": 50
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "SG-RLG-ALL-DAY-WHIT-MONDAY"
        }
      },
      {
        "ruleId": "SG-CAL-SG-ZPO-ADDITIONAL-DAY-BERCHTOLD-F95068E3B162E1D3",
        "calendarId": "ap22-sg-f95068e3b162",
        "jurisdiction": {
          "level": "cantonal",
          "code": "SG"
        },
        "labelKey": "holiday.sg.SG-ZPO-ADDITIONAL-DAY-BERCHTOLD",
        "labels": {
          "de": "Berchtoldstag",
          "fr": "Saint-Berchtold"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-SG-KGER-FS20121-20120329",
            "locator": "FS.2012.1, Erwägungen zur Fristwahrung"
          }
        ],
        "calculation": {
          "type": "fixedMonthDay",
          "month": 1,
          "day": 2
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "proceduralEquivalentDay",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "SG-ZPO-ADDITIONAL-DAY-BERCHTOLD"
        }
      }
    ],
    "projection": {
      "catalogId": "ch-holiday-catalog",
      "catalogFormatVersion": "2.0.0",
      "projectionId": "projection-f95068e3b162e1d3",
      "sourceHash": "c5701e47df0d07bb288719b26d55c31b84fe83ea539578d9192e292e08602570"
    }
  },
  {
    "$schema": "https://raw.githubusercontent.com/davidsteimer/fristenrechner/main/schemas/calendar-rules-v3.schema.json",
    "formatVersion": "3.0.0",
    "dataKind": "calendar",
    "calendarId": "ap22-sh-1ccc70f9897a",
    "jurisdiction": {
      "level": "cantonal",
      "code": "SH"
    },
    "validity": {
      "from": "2026-08-29",
      "to": null
    },
    "inherits": [
      "ch-federal-calendar"
    ],
    "review": {
      "reviewedOn": "2026-10-08",
      "status": "candidate",
      "reviewedBy": "Codex",
      "basis": "AP22C1 Datenkandidat auf Grundlage von DEC-2026-030. Keine Quellen- oder Betriebsfreigabe."
    },
    "sources": [
      {
        "sourceId": "SRC-BUNDESFEIERTAG-19940701",
        "sourceType": "officialDossier",
        "title": "Verordnung über den Bundesfeiertag, SR 116",
        "authority": "CH",
        "url": "https://www.fedlex.admin.ch/eli/cc/1994/1340_1340_1340/de",
        "documentVersionDate": "1994-07-01",
        "reviewedOn": "2026-09-13",
        "reviewStatus": "monitored"
      },
      {
        "sourceId": "SRC-SH-RTG-900200-V1886",
        "sourceType": "officialDossier",
        "title": "Gesetz betreffend die öffentlichen Ruhetage und den Ladenschluss, Ruhetagsgesetz",
        "authority": "CH-SH",
        "url": "https://rechtsbuch.sh.ch/api/de/versions/1886/pdf_file",
        "documentVersionDate": "2007-01-01",
        "reviewedOn": "2026-09-13",
        "reviewStatus": "monitored"
      }
    ],
    "rules": [
      {
        "ruleId": "SH-CAL-SH-RTG-ALL-DAY-ASCENSION-1CCC70F9897AE38F",
        "calendarId": "ap22-sh-1ccc70f9897a",
        "jurisdiction": {
          "level": "cantonal",
          "code": "SH"
        },
        "labelKey": "holiday.sh.SH-RTG-ALL-DAY-ASCENSION",
        "labels": {
          "de": "Auffahrt",
          "fr": "Ascension"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-SH-RTG-900200-V1886",
            "locator": "Art. 1 Abs. 1 und Art. 2"
          }
        ],
        "calculation": {
          "type": "easterOffsetDays",
          "offsetDays": 39
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "SH-RTG-ALL-DAY-ASCENSION"
        }
      },
      {
        "ruleId": "SH-CAL-SH-RTG-ALL-DAY-CHRISTMAS-1CCC70F9897AE38F",
        "calendarId": "ap22-sh-1ccc70f9897a",
        "jurisdiction": {
          "level": "cantonal",
          "code": "SH"
        },
        "labelKey": "holiday.sh.SH-RTG-ALL-DAY-CHRISTMAS",
        "labels": {
          "de": "Weihnachten",
          "fr": "Noël"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-SH-RTG-900200-V1886",
            "locator": "Art. 1 Abs. 1 und Art. 2"
          }
        ],
        "calculation": {
          "type": "fixedMonthDay",
          "month": 12,
          "day": 25
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "SH-RTG-ALL-DAY-CHRISTMAS"
        }
      },
      {
        "ruleId": "SH-CAL-SH-RTG-ALL-DAY-EASTER-1CCC70F9897AE38F",
        "calendarId": "ap22-sh-1ccc70f9897a",
        "jurisdiction": {
          "level": "cantonal",
          "code": "SH"
        },
        "labelKey": "holiday.sh.SH-RTG-ALL-DAY-EASTER",
        "labels": {
          "de": "Ostern",
          "fr": "Pâques"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-SH-RTG-900200-V1886",
            "locator": "Art. 1 Abs. 1 und Art. 2"
          }
        ],
        "calculation": {
          "type": "easterOffsetDays",
          "offsetDays": 0
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "SH-RTG-ALL-DAY-EASTER"
        }
      },
      {
        "ruleId": "SH-CAL-SH-RTG-ALL-DAY-EASTER-MONDAY-1CCC70F9897AE38F",
        "calendarId": "ap22-sh-1ccc70f9897a",
        "jurisdiction": {
          "level": "cantonal",
          "code": "SH"
        },
        "labelKey": "holiday.sh.SH-RTG-ALL-DAY-EASTER-MONDAY",
        "labels": {
          "de": "Ostermontag",
          "fr": "Lundi de Pâques"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-SH-RTG-900200-V1886",
            "locator": "Art. 1 Abs. 1 und Art. 2"
          }
        ],
        "calculation": {
          "type": "easterOffsetDays",
          "offsetDays": 1
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "SH-RTG-ALL-DAY-EASTER-MONDAY"
        }
      },
      {
        "ruleId": "SH-CAL-SH-RTG-ALL-DAY-FEDERAL-FAST-1CCC70F9897AE38F",
        "calendarId": "ap22-sh-1ccc70f9897a",
        "jurisdiction": {
          "level": "cantonal",
          "code": "SH"
        },
        "labelKey": "holiday.sh.SH-RTG-ALL-DAY-FEDERAL-FAST",
        "labels": {
          "de": "Eidgenössischer Dank-, Buss- und Bettag",
          "fr": "Jeûne fédéral"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-SH-RTG-900200-V1886",
            "locator": "Art. 1 Abs. 1 und Art. 2"
          }
        ],
        "calculation": {
          "type": "nthWeekdayOfMonth",
          "month": 9,
          "isoWeekday": 7,
          "occurrence": 3
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "SH-RTG-ALL-DAY-FEDERAL-FAST"
        }
      },
      {
        "ruleId": "SH-CAL-SH-RTG-ALL-DAY-GOOD-FRIDAY-1CCC70F9897AE38F",
        "calendarId": "ap22-sh-1ccc70f9897a",
        "jurisdiction": {
          "level": "cantonal",
          "code": "SH"
        },
        "labelKey": "holiday.sh.SH-RTG-ALL-DAY-GOOD-FRIDAY",
        "labels": {
          "de": "Karfreitag",
          "fr": "Vendredi saint"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-SH-RTG-900200-V1886",
            "locator": "Art. 1 Abs. 1 und Art. 2"
          }
        ],
        "calculation": {
          "type": "easterOffsetDays",
          "offsetDays": -2
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "SH-RTG-ALL-DAY-GOOD-FRIDAY"
        }
      },
      {
        "ruleId": "SH-CAL-SH-RTG-ALL-DAY-MAY1-1CCC70F9897AE38F",
        "calendarId": "ap22-sh-1ccc70f9897a",
        "jurisdiction": {
          "level": "cantonal",
          "code": "SH"
        },
        "labelKey": "holiday.sh.SH-RTG-ALL-DAY-MAY1",
        "labels": {
          "de": "Tag der Arbeit (1. Mai)",
          "fr": "Fête du travail (1er mai)"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-SH-RTG-900200-V1886",
            "locator": "Art. 1 Abs. 1 und Art. 2"
          }
        ],
        "calculation": {
          "type": "fixedMonthDay",
          "month": 5,
          "day": 1
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "SH-RTG-ALL-DAY-MAY1"
        }
      },
      {
        "ruleId": "SH-CAL-SH-RTG-ALL-DAY-NATIONAL-DAY-1CCC70F9897AE38F",
        "calendarId": "ap22-sh-1ccc70f9897a",
        "jurisdiction": {
          "level": "cantonal",
          "code": "SH"
        },
        "labelKey": "holiday.sh.SH-RTG-ALL-DAY-NATIONAL-DAY",
        "labels": {
          "de": "Bundesfeiertag",
          "fr": "Fête nationale"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-BUNDESFEIERTAG-19940701",
            "locator": "SR 116 Art. 1, offene Anwendung auf neues kantonales Profil"
          }
        ],
        "calculation": {
          "type": "fixedMonthDay",
          "month": 8,
          "day": 1
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "SH-RTG-ALL-DAY-NATIONAL-DAY"
        }
      },
      {
        "ruleId": "SH-CAL-SH-RTG-ALL-DAY-NEW-YEAR-1CCC70F9897AE38F",
        "calendarId": "ap22-sh-1ccc70f9897a",
        "jurisdiction": {
          "level": "cantonal",
          "code": "SH"
        },
        "labelKey": "holiday.sh.SH-RTG-ALL-DAY-NEW-YEAR",
        "labels": {
          "de": "Neujahr",
          "fr": "Nouvel An"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-SH-RTG-900200-V1886",
            "locator": "Art. 1 Abs. 1 und Art. 2"
          }
        ],
        "calculation": {
          "type": "fixedMonthDay",
          "month": 1,
          "day": 1
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "SH-RTG-ALL-DAY-NEW-YEAR"
        }
      },
      {
        "ruleId": "SH-CAL-SH-RTG-ALL-DAY-PENTECOST-1CCC70F9897AE38F",
        "calendarId": "ap22-sh-1ccc70f9897a",
        "jurisdiction": {
          "level": "cantonal",
          "code": "SH"
        },
        "labelKey": "holiday.sh.SH-RTG-ALL-DAY-PENTECOST",
        "labels": {
          "de": "Pfingsten",
          "fr": "Pentecôte"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-SH-RTG-900200-V1886",
            "locator": "Art. 1 Abs. 1 und Art. 2"
          }
        ],
        "calculation": {
          "type": "easterOffsetDays",
          "offsetDays": 49
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "SH-RTG-ALL-DAY-PENTECOST"
        }
      },
      {
        "ruleId": "SH-CAL-SH-RTG-ALL-DAY-ST-STEPHEN-1CCC70F9897AE38F",
        "calendarId": "ap22-sh-1ccc70f9897a",
        "jurisdiction": {
          "level": "cantonal",
          "code": "SH"
        },
        "labelKey": "holiday.sh.SH-RTG-ALL-DAY-ST-STEPHEN",
        "labels": {
          "de": "Stephanstag",
          "fr": "Saint-Étienne"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-SH-RTG-900200-V1886",
            "locator": "Art. 1 Abs. 1 und Art. 2"
          }
        ],
        "calculation": {
          "type": "fixedMonthDay",
          "month": 12,
          "day": 26
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "SH-RTG-ALL-DAY-ST-STEPHEN"
        }
      },
      {
        "ruleId": "SH-CAL-SH-RTG-ALL-DAY-WHIT-MONDAY-1CCC70F9897AE38F",
        "calendarId": "ap22-sh-1ccc70f9897a",
        "jurisdiction": {
          "level": "cantonal",
          "code": "SH"
        },
        "labelKey": "holiday.sh.SH-RTG-ALL-DAY-WHIT-MONDAY",
        "labels": {
          "de": "Pfingstmontag",
          "fr": "Lundi de Pentecôte"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-SH-RTG-900200-V1886",
            "locator": "Art. 1 Abs. 1 und Art. 2"
          }
        ],
        "calculation": {
          "type": "easterOffsetDays",
          "offsetDays": 50
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "SH-RTG-ALL-DAY-WHIT-MONDAY"
        }
      }
    ],
    "projection": {
      "catalogId": "ch-holiday-catalog",
      "catalogFormatVersion": "2.0.0",
      "projectionId": "projection-1ccc70f9897ae38f",
      "sourceHash": "c5701e47df0d07bb288719b26d55c31b84fe83ea539578d9192e292e08602570"
    }
  },
  {
    "$schema": "https://raw.githubusercontent.com/davidsteimer/fristenrechner/main/schemas/calendar-rules-v3.schema.json",
    "formatVersion": "3.0.0",
    "dataKind": "calendar",
    "calendarId": "ap22-sh-ec7d0988145a",
    "jurisdiction": {
      "level": "cantonal",
      "code": "SH"
    },
    "validity": {
      "from": "2026-08-29",
      "to": null
    },
    "inherits": [
      "ch-federal-calendar"
    ],
    "review": {
      "reviewedOn": "2026-10-08",
      "status": "candidate",
      "reviewedBy": "Codex",
      "basis": "AP22C1 Datenkandidat auf Grundlage von DEC-2026-030. Keine Quellen- oder Betriebsfreigabe."
    },
    "sources": [
      {
        "sourceId": "SRC-BUNDESFEIERTAG-19940701",
        "sourceType": "officialDossier",
        "title": "Verordnung über den Bundesfeiertag, SR 116",
        "authority": "CH",
        "url": "https://www.fedlex.admin.ch/eli/cc/1994/1340_1340_1340/de",
        "documentVersionDate": "1994-07-01",
        "reviewedOn": "2026-09-13",
        "reviewStatus": "monitored"
      },
      {
        "sourceId": "SRC-SH-OGE-4020181K-20180824",
        "sourceType": "officialDossier",
        "title": "Obergericht, OGE 40/2018/1/K vom 24.08.2018",
        "authority": "CH-SH",
        "url": "https://sh.ch/CMS/get/file/771a1a2e-4ef2-47bb-9b04-f4afc5aed3ea",
        "documentVersionDate": "2018-08-24",
        "reviewedOn": "2026-09-13",
        "reviewStatus": "monitored"
      },
      {
        "sourceId": "SRC-SH-RTG-900200-V1886",
        "sourceType": "officialDossier",
        "title": "Gesetz betreffend die öffentlichen Ruhetage und den Ladenschluss, Ruhetagsgesetz",
        "authority": "CH-SH",
        "url": "https://rechtsbuch.sh.ch/api/de/versions/1886/pdf_file",
        "documentVersionDate": "2007-01-01",
        "reviewedOn": "2026-09-13",
        "reviewStatus": "monitored"
      }
    ],
    "rules": [
      {
        "ruleId": "SH-CAL-SH-RTG-ALL-DAY-ASCENSION-EC7D0988145A85DB",
        "calendarId": "ap22-sh-ec7d0988145a",
        "jurisdiction": {
          "level": "cantonal",
          "code": "SH"
        },
        "labelKey": "holiday.sh.SH-RTG-ALL-DAY-ASCENSION",
        "labels": {
          "de": "Auffahrt",
          "fr": "Ascension"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-SH-RTG-900200-V1886",
            "locator": "Art. 1 Abs. 1 und Art. 2"
          }
        ],
        "calculation": {
          "type": "easterOffsetDays",
          "offsetDays": 39
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "SH-RTG-ALL-DAY-ASCENSION"
        }
      },
      {
        "ruleId": "SH-CAL-SH-RTG-ALL-DAY-CHRISTMAS-EC7D0988145A85DB",
        "calendarId": "ap22-sh-ec7d0988145a",
        "jurisdiction": {
          "level": "cantonal",
          "code": "SH"
        },
        "labelKey": "holiday.sh.SH-RTG-ALL-DAY-CHRISTMAS",
        "labels": {
          "de": "Weihnachten",
          "fr": "Noël"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-SH-RTG-900200-V1886",
            "locator": "Art. 1 Abs. 1 und Art. 2"
          }
        ],
        "calculation": {
          "type": "fixedMonthDay",
          "month": 12,
          "day": 25
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "SH-RTG-ALL-DAY-CHRISTMAS"
        }
      },
      {
        "ruleId": "SH-CAL-SH-RTG-ALL-DAY-EASTER-EC7D0988145A85DB",
        "calendarId": "ap22-sh-ec7d0988145a",
        "jurisdiction": {
          "level": "cantonal",
          "code": "SH"
        },
        "labelKey": "holiday.sh.SH-RTG-ALL-DAY-EASTER",
        "labels": {
          "de": "Ostern",
          "fr": "Pâques"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-SH-RTG-900200-V1886",
            "locator": "Art. 1 Abs. 1 und Art. 2"
          }
        ],
        "calculation": {
          "type": "easterOffsetDays",
          "offsetDays": 0
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "SH-RTG-ALL-DAY-EASTER"
        }
      },
      {
        "ruleId": "SH-CAL-SH-RTG-ALL-DAY-EASTER-MONDAY-EC7D0988145A85DB",
        "calendarId": "ap22-sh-ec7d0988145a",
        "jurisdiction": {
          "level": "cantonal",
          "code": "SH"
        },
        "labelKey": "holiday.sh.SH-RTG-ALL-DAY-EASTER-MONDAY",
        "labels": {
          "de": "Ostermontag",
          "fr": "Lundi de Pâques"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-SH-RTG-900200-V1886",
            "locator": "Art. 1 Abs. 1 und Art. 2"
          }
        ],
        "calculation": {
          "type": "easterOffsetDays",
          "offsetDays": 1
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "SH-RTG-ALL-DAY-EASTER-MONDAY"
        }
      },
      {
        "ruleId": "SH-CAL-SH-RTG-ALL-DAY-FEDERAL-FAST-EC7D0988145A85DB",
        "calendarId": "ap22-sh-ec7d0988145a",
        "jurisdiction": {
          "level": "cantonal",
          "code": "SH"
        },
        "labelKey": "holiday.sh.SH-RTG-ALL-DAY-FEDERAL-FAST",
        "labels": {
          "de": "Eidgenössischer Dank-, Buss- und Bettag",
          "fr": "Jeûne fédéral"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-SH-RTG-900200-V1886",
            "locator": "Art. 1 Abs. 1 und Art. 2"
          }
        ],
        "calculation": {
          "type": "nthWeekdayOfMonth",
          "month": 9,
          "isoWeekday": 7,
          "occurrence": 3
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "SH-RTG-ALL-DAY-FEDERAL-FAST"
        }
      },
      {
        "ruleId": "SH-CAL-SH-RTG-ALL-DAY-GOOD-FRIDAY-EC7D0988145A85DB",
        "calendarId": "ap22-sh-ec7d0988145a",
        "jurisdiction": {
          "level": "cantonal",
          "code": "SH"
        },
        "labelKey": "holiday.sh.SH-RTG-ALL-DAY-GOOD-FRIDAY",
        "labels": {
          "de": "Karfreitag",
          "fr": "Vendredi saint"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-SH-RTG-900200-V1886",
            "locator": "Art. 1 Abs. 1 und Art. 2"
          }
        ],
        "calculation": {
          "type": "easterOffsetDays",
          "offsetDays": -2
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "SH-RTG-ALL-DAY-GOOD-FRIDAY"
        }
      },
      {
        "ruleId": "SH-CAL-SH-RTG-ALL-DAY-MAY1-EC7D0988145A85DB",
        "calendarId": "ap22-sh-ec7d0988145a",
        "jurisdiction": {
          "level": "cantonal",
          "code": "SH"
        },
        "labelKey": "holiday.sh.SH-RTG-ALL-DAY-MAY1",
        "labels": {
          "de": "Tag der Arbeit (1. Mai)",
          "fr": "Fête du travail (1er mai)"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-SH-RTG-900200-V1886",
            "locator": "Art. 1 Abs. 1 und Art. 2"
          }
        ],
        "calculation": {
          "type": "fixedMonthDay",
          "month": 5,
          "day": 1
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "SH-RTG-ALL-DAY-MAY1"
        }
      },
      {
        "ruleId": "SH-CAL-SH-RTG-ALL-DAY-NATIONAL-DAY-EC7D0988145A85DB",
        "calendarId": "ap22-sh-ec7d0988145a",
        "jurisdiction": {
          "level": "cantonal",
          "code": "SH"
        },
        "labelKey": "holiday.sh.SH-RTG-ALL-DAY-NATIONAL-DAY",
        "labels": {
          "de": "Bundesfeiertag",
          "fr": "Fête nationale"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-BUNDESFEIERTAG-19940701",
            "locator": "SR 116 Art. 1, offene Anwendung auf neues kantonales Profil"
          }
        ],
        "calculation": {
          "type": "fixedMonthDay",
          "month": 8,
          "day": 1
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "SH-RTG-ALL-DAY-NATIONAL-DAY"
        }
      },
      {
        "ruleId": "SH-CAL-SH-RTG-ALL-DAY-NEW-YEAR-EC7D0988145A85DB",
        "calendarId": "ap22-sh-ec7d0988145a",
        "jurisdiction": {
          "level": "cantonal",
          "code": "SH"
        },
        "labelKey": "holiday.sh.SH-RTG-ALL-DAY-NEW-YEAR",
        "labels": {
          "de": "Neujahr",
          "fr": "Nouvel An"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-SH-RTG-900200-V1886",
            "locator": "Art. 1 Abs. 1 und Art. 2"
          }
        ],
        "calculation": {
          "type": "fixedMonthDay",
          "month": 1,
          "day": 1
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "SH-RTG-ALL-DAY-NEW-YEAR"
        }
      },
      {
        "ruleId": "SH-CAL-SH-RTG-ALL-DAY-PENTECOST-EC7D0988145A85DB",
        "calendarId": "ap22-sh-ec7d0988145a",
        "jurisdiction": {
          "level": "cantonal",
          "code": "SH"
        },
        "labelKey": "holiday.sh.SH-RTG-ALL-DAY-PENTECOST",
        "labels": {
          "de": "Pfingsten",
          "fr": "Pentecôte"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-SH-RTG-900200-V1886",
            "locator": "Art. 1 Abs. 1 und Art. 2"
          }
        ],
        "calculation": {
          "type": "easterOffsetDays",
          "offsetDays": 49
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "SH-RTG-ALL-DAY-PENTECOST"
        }
      },
      {
        "ruleId": "SH-CAL-SH-RTG-ALL-DAY-ST-STEPHEN-EC7D0988145A85DB",
        "calendarId": "ap22-sh-ec7d0988145a",
        "jurisdiction": {
          "level": "cantonal",
          "code": "SH"
        },
        "labelKey": "holiday.sh.SH-RTG-ALL-DAY-ST-STEPHEN",
        "labels": {
          "de": "Stephanstag",
          "fr": "Saint-Étienne"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-SH-RTG-900200-V1886",
            "locator": "Art. 1 Abs. 1 und Art. 2"
          }
        ],
        "calculation": {
          "type": "fixedMonthDay",
          "month": 12,
          "day": 26
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "SH-RTG-ALL-DAY-ST-STEPHEN"
        }
      },
      {
        "ruleId": "SH-CAL-SH-RTG-ALL-DAY-WHIT-MONDAY-EC7D0988145A85DB",
        "calendarId": "ap22-sh-ec7d0988145a",
        "jurisdiction": {
          "level": "cantonal",
          "code": "SH"
        },
        "labelKey": "holiday.sh.SH-RTG-ALL-DAY-WHIT-MONDAY",
        "labels": {
          "de": "Pfingstmontag",
          "fr": "Lundi de Pentecôte"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-SH-RTG-900200-V1886",
            "locator": "Art. 1 Abs. 1 und Art. 2"
          }
        ],
        "calculation": {
          "type": "easterOffsetDays",
          "offsetDays": 50
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "SH-RTG-ALL-DAY-WHIT-MONDAY"
        }
      },
      {
        "ruleId": "SH-CAL-SH-ZPO-ADDITIONAL-DAY-BERCHTOLD-EC7D0988145A85DB",
        "calendarId": "ap22-sh-ec7d0988145a",
        "jurisdiction": {
          "level": "cantonal",
          "code": "SH"
        },
        "labelKey": "holiday.sh.SH-ZPO-ADDITIONAL-DAY-BERCHTOLD",
        "labels": {
          "de": "Berchtoldstag",
          "fr": "Saint-Berchtold"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-SH-OGE-4020181K-20180824",
            "locator": "OGE 40/2018/1/K, E. 2.1.1–2.1.4"
          }
        ],
        "calculation": {
          "type": "fixedMonthDay",
          "month": 1,
          "day": 2
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "proceduralEquivalentDay",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "SH-ZPO-ADDITIONAL-DAY-BERCHTOLD"
        }
      }
    ],
    "projection": {
      "catalogId": "ch-holiday-catalog",
      "catalogFormatVersion": "2.0.0",
      "projectionId": "projection-ec7d0988145a85db",
      "sourceHash": "c5701e47df0d07bb288719b26d55c31b84fe83ea539578d9192e292e08602570"
    }
  },
  {
    "$schema": "https://raw.githubusercontent.com/davidsteimer/fristenrechner/main/schemas/calendar-rules-v3.schema.json",
    "formatVersion": "3.0.0",
    "dataKind": "calendar",
    "calendarId": "ap22-so-3f5f7b7f54f5",
    "jurisdiction": {
      "level": "cantonal",
      "code": "SO"
    },
    "validity": {
      "from": "2026-08-29",
      "to": null
    },
    "inherits": [
      "ch-federal-calendar"
    ],
    "review": {
      "reviewedOn": "2026-10-08",
      "status": "candidate",
      "reviewedBy": "Codex",
      "basis": "AP22C1 Datenkandidat auf Grundlage von DEC-2026-030. Keine Quellen- oder Betriebsfreigabe."
    },
    "sources": [
      {
        "sourceId": "SRC-AP22-SO-GS201463",
        "sourceType": "officialDossier",
        "title": "Solothurn GS 2014, 63",
        "authority": "CH-SO",
        "url": "https://bgs.so.ch/api/de/change_documents/file_dictionaries/1025/pdf_file",
        "documentVersionDate": "2015-03-01",
        "reviewedOn": "2026-10-02",
        "reviewStatus": "monitored"
      }
    ],
    "rules": [
      {
        "ruleId": "SO-CAL-SO-PROCEDURAL-ALL-DAY-ALL-SAINTS-3F5F7B7F54F58063",
        "calendarId": "ap22-so-3f5f7b7f54f5",
        "jurisdiction": {
          "level": "cantonal",
          "code": "SO"
        },
        "labelKey": "holiday.so.SO-PROCEDURAL-ALL-DAY-ALL-SAINTS",
        "labels": {
          "de": "Allerheiligen",
          "fr": "Toussaint"
        },
        "priority": 100,
        "validity": {
          "from": "2015-03-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-AP22-SO-GS201463",
            "locator": "Änderungen § 22 EG ZPO, § 10bis EG StPO und § 9 VRG, in Kraft 01.03.2015"
          }
        ],
        "calculation": {
          "type": "fixedMonthDay",
          "month": 11,
          "day": 1
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "proceduralEquivalentDay",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "SO-PROCEDURAL-ALL-DAY-ALL-SAINTS"
        }
      },
      {
        "ruleId": "SO-CAL-SO-PROCEDURAL-ALL-DAY-ASCENSION-3F5F7B7F54F58063",
        "calendarId": "ap22-so-3f5f7b7f54f5",
        "jurisdiction": {
          "level": "cantonal",
          "code": "SO"
        },
        "labelKey": "holiday.so.SO-PROCEDURAL-ALL-DAY-ASCENSION",
        "labels": {
          "de": "Auffahrt",
          "fr": "Ascension"
        },
        "priority": 100,
        "validity": {
          "from": "2015-03-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-AP22-SO-GS201463",
            "locator": "Änderungen § 22 EG ZPO, § 10bis EG StPO und § 9 VRG, in Kraft 01.03.2015"
          }
        ],
        "calculation": {
          "type": "easterOffsetDays",
          "offsetDays": 39
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "proceduralEquivalentDay",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "SO-PROCEDURAL-ALL-DAY-ASCENSION"
        }
      },
      {
        "ruleId": "SO-CAL-SO-PROCEDURAL-ALL-DAY-ASSUMPTION-3F5F7B7F54F58063",
        "calendarId": "ap22-so-3f5f7b7f54f5",
        "jurisdiction": {
          "level": "cantonal",
          "code": "SO"
        },
        "labelKey": "holiday.so.SO-PROCEDURAL-ALL-DAY-ASSUMPTION",
        "labels": {
          "de": "Mariä Himmelfahrt",
          "fr": "Assomption"
        },
        "priority": 100,
        "validity": {
          "from": "2015-03-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-AP22-SO-GS201463",
            "locator": "Änderungen § 22 EG ZPO, § 10bis EG StPO und § 9 VRG, in Kraft 01.03.2015"
          }
        ],
        "calculation": {
          "type": "fixedMonthDay",
          "month": 8,
          "day": 15
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "proceduralEquivalentDay",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "SO-PROCEDURAL-ALL-DAY-ASSUMPTION"
        }
      },
      {
        "ruleId": "SO-CAL-SO-PROCEDURAL-ALL-DAY-BERCHTOLD-3F5F7B7F54F58063",
        "calendarId": "ap22-so-3f5f7b7f54f5",
        "jurisdiction": {
          "level": "cantonal",
          "code": "SO"
        },
        "labelKey": "holiday.so.SO-PROCEDURAL-ALL-DAY-BERCHTOLD",
        "labels": {
          "de": "Berchtoldstag",
          "fr": "Saint-Berchtold"
        },
        "priority": 100,
        "validity": {
          "from": "2015-03-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-AP22-SO-GS201463",
            "locator": "Änderungen § 22 EG ZPO, § 10bis EG StPO und § 9 VRG, in Kraft 01.03.2015"
          }
        ],
        "calculation": {
          "type": "fixedMonthDay",
          "month": 1,
          "day": 2
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "proceduralEquivalentDay",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "SO-PROCEDURAL-ALL-DAY-BERCHTOLD"
        }
      },
      {
        "ruleId": "SO-CAL-SO-PROCEDURAL-ALL-DAY-CHRISTMAS-3F5F7B7F54F58063",
        "calendarId": "ap22-so-3f5f7b7f54f5",
        "jurisdiction": {
          "level": "cantonal",
          "code": "SO"
        },
        "labelKey": "holiday.so.SO-PROCEDURAL-ALL-DAY-CHRISTMAS",
        "labels": {
          "de": "Weihnachten",
          "fr": "Noël"
        },
        "priority": 100,
        "validity": {
          "from": "2015-03-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-AP22-SO-GS201463",
            "locator": "Änderungen § 22 EG ZPO, § 10bis EG StPO und § 9 VRG, in Kraft 01.03.2015"
          }
        ],
        "calculation": {
          "type": "fixedMonthDay",
          "month": 12,
          "day": 25
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "proceduralEquivalentDay",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "SO-PROCEDURAL-ALL-DAY-CHRISTMAS"
        }
      },
      {
        "ruleId": "SO-CAL-SO-PROCEDURAL-ALL-DAY-CORPUS-CHRISTI-3F5F7B7F54F58063",
        "calendarId": "ap22-so-3f5f7b7f54f5",
        "jurisdiction": {
          "level": "cantonal",
          "code": "SO"
        },
        "labelKey": "holiday.so.SO-PROCEDURAL-ALL-DAY-CORPUS-CHRISTI",
        "labels": {
          "de": "Fronleichnam",
          "fr": "Fête-Dieu"
        },
        "priority": 100,
        "validity": {
          "from": "2015-03-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-AP22-SO-GS201463",
            "locator": "Änderungen § 22 EG ZPO, § 10bis EG StPO und § 9 VRG, in Kraft 01.03.2015"
          }
        ],
        "calculation": {
          "type": "easterOffsetDays",
          "offsetDays": 60
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "proceduralEquivalentDay",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "SO-PROCEDURAL-ALL-DAY-CORPUS-CHRISTI"
        }
      },
      {
        "ruleId": "SO-CAL-SO-PROCEDURAL-ALL-DAY-EASTER-MONDAY-3F5F7B7F54F58063",
        "calendarId": "ap22-so-3f5f7b7f54f5",
        "jurisdiction": {
          "level": "cantonal",
          "code": "SO"
        },
        "labelKey": "holiday.so.SO-PROCEDURAL-ALL-DAY-EASTER-MONDAY",
        "labels": {
          "de": "Ostermontag",
          "fr": "Lundi de Pâques"
        },
        "priority": 100,
        "validity": {
          "from": "2015-03-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-AP22-SO-GS201463",
            "locator": "Änderungen § 22 EG ZPO, § 10bis EG StPO und § 9 VRG, in Kraft 01.03.2015"
          }
        ],
        "calculation": {
          "type": "easterOffsetDays",
          "offsetDays": 1
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "proceduralEquivalentDay",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "SO-PROCEDURAL-ALL-DAY-EASTER-MONDAY"
        }
      },
      {
        "ruleId": "SO-CAL-SO-PROCEDURAL-ALL-DAY-GOOD-FRIDAY-3F5F7B7F54F58063",
        "calendarId": "ap22-so-3f5f7b7f54f5",
        "jurisdiction": {
          "level": "cantonal",
          "code": "SO"
        },
        "labelKey": "holiday.so.SO-PROCEDURAL-ALL-DAY-GOOD-FRIDAY",
        "labels": {
          "de": "Karfreitag",
          "fr": "Vendredi saint"
        },
        "priority": 100,
        "validity": {
          "from": "2015-03-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-AP22-SO-GS201463",
            "locator": "Änderungen § 22 EG ZPO, § 10bis EG StPO und § 9 VRG, in Kraft 01.03.2015"
          }
        ],
        "calculation": {
          "type": "easterOffsetDays",
          "offsetDays": -2
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "proceduralEquivalentDay",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "SO-PROCEDURAL-ALL-DAY-GOOD-FRIDAY"
        }
      },
      {
        "ruleId": "SO-CAL-SO-PROCEDURAL-ALL-DAY-MAY1-3F5F7B7F54F58063",
        "calendarId": "ap22-so-3f5f7b7f54f5",
        "jurisdiction": {
          "level": "cantonal",
          "code": "SO"
        },
        "labelKey": "holiday.so.SO-PROCEDURAL-ALL-DAY-MAY1",
        "labels": {
          "de": "Tag der Arbeit (1. Mai)",
          "fr": "Fête du travail (1er mai)"
        },
        "priority": 100,
        "validity": {
          "from": "2015-03-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-AP22-SO-GS201463",
            "locator": "Änderungen § 22 EG ZPO, § 10bis EG StPO und § 9 VRG, in Kraft 01.03.2015"
          }
        ],
        "calculation": {
          "type": "fixedMonthDay",
          "month": 5,
          "day": 1
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "proceduralEquivalentDay",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "SO-PROCEDURAL-ALL-DAY-MAY1"
        }
      },
      {
        "ruleId": "SO-CAL-SO-PROCEDURAL-ALL-DAY-NEW-YEAR-3F5F7B7F54F58063",
        "calendarId": "ap22-so-3f5f7b7f54f5",
        "jurisdiction": {
          "level": "cantonal",
          "code": "SO"
        },
        "labelKey": "holiday.so.SO-PROCEDURAL-ALL-DAY-NEW-YEAR",
        "labels": {
          "de": "Neujahr",
          "fr": "Nouvel An"
        },
        "priority": 100,
        "validity": {
          "from": "2015-03-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-AP22-SO-GS201463",
            "locator": "Änderungen § 22 EG ZPO, § 10bis EG StPO und § 9 VRG, in Kraft 01.03.2015"
          }
        ],
        "calculation": {
          "type": "fixedMonthDay",
          "month": 1,
          "day": 1
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "proceduralEquivalentDay",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "SO-PROCEDURAL-ALL-DAY-NEW-YEAR"
        }
      },
      {
        "ruleId": "SO-CAL-SO-PROCEDURAL-ALL-DAY-ST-STEPHEN-3F5F7B7F54F58063",
        "calendarId": "ap22-so-3f5f7b7f54f5",
        "jurisdiction": {
          "level": "cantonal",
          "code": "SO"
        },
        "labelKey": "holiday.so.SO-PROCEDURAL-ALL-DAY-ST-STEPHEN",
        "labels": {
          "de": "Stephanstag",
          "fr": "Saint-Étienne"
        },
        "priority": 100,
        "validity": {
          "from": "2015-03-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-AP22-SO-GS201463",
            "locator": "Änderungen § 22 EG ZPO, § 10bis EG StPO und § 9 VRG, in Kraft 01.03.2015"
          }
        ],
        "calculation": {
          "type": "fixedMonthDay",
          "month": 12,
          "day": 26
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "proceduralEquivalentDay",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "SO-PROCEDURAL-ALL-DAY-ST-STEPHEN"
        }
      },
      {
        "ruleId": "SO-CAL-SO-PROCEDURAL-ALL-DAY-WHIT-MONDAY-3F5F7B7F54F58063",
        "calendarId": "ap22-so-3f5f7b7f54f5",
        "jurisdiction": {
          "level": "cantonal",
          "code": "SO"
        },
        "labelKey": "holiday.so.SO-PROCEDURAL-ALL-DAY-WHIT-MONDAY",
        "labels": {
          "de": "Pfingstmontag",
          "fr": "Lundi de Pentecôte"
        },
        "priority": 100,
        "validity": {
          "from": "2015-03-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-AP22-SO-GS201463",
            "locator": "Änderungen § 22 EG ZPO, § 10bis EG StPO und § 9 VRG, in Kraft 01.03.2015"
          }
        ],
        "calculation": {
          "type": "easterOffsetDays",
          "offsetDays": 50
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "proceduralEquivalentDay",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "SO-PROCEDURAL-ALL-DAY-WHIT-MONDAY"
        }
      }
    ],
    "projection": {
      "catalogId": "ch-holiday-catalog",
      "catalogFormatVersion": "2.0.0",
      "projectionId": "projection-3f5f7b7f54f58063",
      "sourceHash": "c5701e47df0d07bb288719b26d55c31b84fe83ea539578d9192e292e08602570"
    }
  },
  {
    "$schema": "https://raw.githubusercontent.com/davidsteimer/fristenrechner/main/schemas/calendar-rules-v3.schema.json",
    "formatVersion": "3.0.0",
    "dataKind": "calendar",
    "calendarId": "ap22-sz-ec9f2c557fe4",
    "jurisdiction": {
      "level": "cantonal",
      "code": "SZ"
    },
    "validity": {
      "from": "2026-08-29",
      "to": null
    },
    "inherits": [
      "ch-federal-calendar"
    ],
    "review": {
      "reviewedOn": "2026-10-08",
      "status": "candidate",
      "reviewedBy": "Codex",
      "basis": "AP22C1 Datenkandidat auf Grundlage von DEC-2026-030. Keine Quellen- oder Betriebsfreigabe."
    },
    "sources": [
      {
        "sourceId": "SRC-BUNDESFEIERTAG-19940701",
        "sourceType": "officialDossier",
        "title": "Verordnung über den Bundesfeiertag, SR 116",
        "authority": "CH",
        "url": "https://www.fedlex.admin.ch/eli/cc/1994/1340_1340_1340/de",
        "documentVersionDate": "1994-07-01",
        "reviewedOn": "2026-09-13",
        "reviewStatus": "monitored"
      },
      {
        "sourceId": "SRC-SZ-RTG-545110-20180701",
        "sourceType": "officialDossier",
        "title": "Ruhetagsgesetz",
        "authority": "CH-SZ",
        "url": "https://www.sz.ch/public/upload/assets/28055/545_110.pdf",
        "documentVersionDate": "2018-07-01",
        "reviewedOn": "2026-09-13",
        "reviewStatus": "monitored"
      }
    ],
    "rules": [
      {
        "ruleId": "SZ-CAL-SZ-RTG-ALL-DAY-ALL-SAINTS-EC9F2C557FE4FCA6",
        "calendarId": "ap22-sz-ec9f2c557fe4",
        "jurisdiction": {
          "level": "cantonal",
          "code": "SZ"
        },
        "labelKey": "holiday.sz.SZ-RTG-ALL-DAY-ALL-SAINTS",
        "labels": {
          "de": "Allerheiligen",
          "fr": "Toussaint"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-SZ-RTG-545110-20180701",
            "locator": "§ 2 Abs. 1 Ziff. 2"
          }
        ],
        "calculation": {
          "type": "fixedMonthDay",
          "month": 11,
          "day": 1
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "SZ-RTG-ALL-DAY-ALL-SAINTS"
        }
      },
      {
        "ruleId": "SZ-CAL-SZ-RTG-ALL-DAY-ASCENSION-EC9F2C557FE4FCA6",
        "calendarId": "ap22-sz-ec9f2c557fe4",
        "jurisdiction": {
          "level": "cantonal",
          "code": "SZ"
        },
        "labelKey": "holiday.sz.SZ-RTG-ALL-DAY-ASCENSION",
        "labels": {
          "de": "Auffahrt",
          "fr": "Ascension"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-SZ-RTG-545110-20180701",
            "locator": "§ 2 Abs. 1 Ziff. 3"
          }
        ],
        "calculation": {
          "type": "easterOffsetDays",
          "offsetDays": 39
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "SZ-RTG-ALL-DAY-ASCENSION"
        }
      },
      {
        "ruleId": "SZ-CAL-SZ-RTG-ALL-DAY-ASSUMPTION-EC9F2C557FE4FCA6",
        "calendarId": "ap22-sz-ec9f2c557fe4",
        "jurisdiction": {
          "level": "cantonal",
          "code": "SZ"
        },
        "labelKey": "holiday.sz.SZ-RTG-ALL-DAY-ASSUMPTION",
        "labels": {
          "de": "Mariä Himmelfahrt",
          "fr": "Assomption"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-SZ-RTG-545110-20180701",
            "locator": "§ 2 Abs. 1 Ziff. 3"
          }
        ],
        "calculation": {
          "type": "fixedMonthDay",
          "month": 8,
          "day": 15
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "SZ-RTG-ALL-DAY-ASSUMPTION"
        }
      },
      {
        "ruleId": "SZ-CAL-SZ-RTG-ALL-DAY-CHRISTMAS-EC9F2C557FE4FCA6",
        "calendarId": "ap22-sz-ec9f2c557fe4",
        "jurisdiction": {
          "level": "cantonal",
          "code": "SZ"
        },
        "labelKey": "holiday.sz.SZ-RTG-ALL-DAY-CHRISTMAS",
        "labels": {
          "de": "Weihnachten",
          "fr": "Noël"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-SZ-RTG-545110-20180701",
            "locator": "§ 2 Abs. 1 Ziff. 2"
          }
        ],
        "calculation": {
          "type": "fixedMonthDay",
          "month": 12,
          "day": 25
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "SZ-RTG-ALL-DAY-CHRISTMAS"
        }
      },
      {
        "ruleId": "SZ-CAL-SZ-RTG-ALL-DAY-CORPUS-CHRISTI-EC9F2C557FE4FCA6",
        "calendarId": "ap22-sz-ec9f2c557fe4",
        "jurisdiction": {
          "level": "cantonal",
          "code": "SZ"
        },
        "labelKey": "holiday.sz.SZ-RTG-ALL-DAY-CORPUS-CHRISTI",
        "labels": {
          "de": "Fronleichnam",
          "fr": "Fête-Dieu"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-SZ-RTG-545110-20180701",
            "locator": "§ 2 Abs. 1 Ziff. 3"
          }
        ],
        "calculation": {
          "type": "easterOffsetDays",
          "offsetDays": 60
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "SZ-RTG-ALL-DAY-CORPUS-CHRISTI"
        }
      },
      {
        "ruleId": "SZ-CAL-SZ-RTG-ALL-DAY-EASTER-EC9F2C557FE4FCA6",
        "calendarId": "ap22-sz-ec9f2c557fe4",
        "jurisdiction": {
          "level": "cantonal",
          "code": "SZ"
        },
        "labelKey": "holiday.sz.SZ-RTG-ALL-DAY-EASTER",
        "labels": {
          "de": "Ostern",
          "fr": "Pâques"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-SZ-RTG-545110-20180701",
            "locator": "§ 2 Abs. 1 Ziff. 2"
          }
        ],
        "calculation": {
          "type": "easterOffsetDays",
          "offsetDays": 0
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "SZ-RTG-ALL-DAY-EASTER"
        }
      },
      {
        "ruleId": "SZ-CAL-SZ-RTG-ALL-DAY-EASTER-MONDAY-EC9F2C557FE4FCA6",
        "calendarId": "ap22-sz-ec9f2c557fe4",
        "jurisdiction": {
          "level": "cantonal",
          "code": "SZ"
        },
        "labelKey": "holiday.sz.SZ-RTG-ALL-DAY-EASTER-MONDAY",
        "labels": {
          "de": "Ostermontag",
          "fr": "Lundi de Pâques"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-SZ-RTG-545110-20180701",
            "locator": "§ 2 Abs. 1 Ziff. 3"
          }
        ],
        "calculation": {
          "type": "easterOffsetDays",
          "offsetDays": 1
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "SZ-RTG-ALL-DAY-EASTER-MONDAY"
        }
      },
      {
        "ruleId": "SZ-CAL-SZ-RTG-ALL-DAY-EPIPHANY-EC9F2C557FE4FCA6",
        "calendarId": "ap22-sz-ec9f2c557fe4",
        "jurisdiction": {
          "level": "cantonal",
          "code": "SZ"
        },
        "labelKey": "holiday.sz.SZ-RTG-ALL-DAY-EPIPHANY",
        "labels": {
          "de": "Heilige Drei Könige",
          "fr": "Épiphanie"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-SZ-RTG-545110-20180701",
            "locator": "§ 2 Abs. 1 Ziff. 3"
          }
        ],
        "calculation": {
          "type": "fixedMonthDay",
          "month": 1,
          "day": 6
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "SZ-RTG-ALL-DAY-EPIPHANY"
        }
      },
      {
        "ruleId": "SZ-CAL-SZ-RTG-ALL-DAY-FEDERAL-FAST-EC9F2C557FE4FCA6",
        "calendarId": "ap22-sz-ec9f2c557fe4",
        "jurisdiction": {
          "level": "cantonal",
          "code": "SZ"
        },
        "labelKey": "holiday.sz.SZ-RTG-ALL-DAY-FEDERAL-FAST",
        "labels": {
          "de": "Eidgenössischer Dank-, Buss- und Bettag",
          "fr": "Jeûne fédéral"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-SZ-RTG-545110-20180701",
            "locator": "§ 2 Abs. 1 Ziff. 2"
          }
        ],
        "calculation": {
          "type": "nthWeekdayOfMonth",
          "month": 9,
          "isoWeekday": 7,
          "occurrence": 3
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "SZ-RTG-ALL-DAY-FEDERAL-FAST"
        }
      },
      {
        "ruleId": "SZ-CAL-SZ-RTG-ALL-DAY-GOOD-FRIDAY-EC9F2C557FE4FCA6",
        "calendarId": "ap22-sz-ec9f2c557fe4",
        "jurisdiction": {
          "level": "cantonal",
          "code": "SZ"
        },
        "labelKey": "holiday.sz.SZ-RTG-ALL-DAY-GOOD-FRIDAY",
        "labels": {
          "de": "Karfreitag",
          "fr": "Vendredi saint"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-SZ-RTG-545110-20180701",
            "locator": "§ 2 Abs. 1 Ziff. 2"
          }
        ],
        "calculation": {
          "type": "easterOffsetDays",
          "offsetDays": -2
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "SZ-RTG-ALL-DAY-GOOD-FRIDAY"
        }
      },
      {
        "ruleId": "SZ-CAL-SZ-RTG-ALL-DAY-IMMACULATE-CONCEPTION-EC9F2C557FE4FCA6",
        "calendarId": "ap22-sz-ec9f2c557fe4",
        "jurisdiction": {
          "level": "cantonal",
          "code": "SZ"
        },
        "labelKey": "holiday.sz.SZ-RTG-ALL-DAY-IMMACULATE-CONCEPTION",
        "labels": {
          "de": "Mariä Empfängnis",
          "fr": "Immaculée Conception"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-SZ-RTG-545110-20180701",
            "locator": "§ 2 Abs. 1 Ziff. 3"
          }
        ],
        "calculation": {
          "type": "fixedMonthDay",
          "month": 12,
          "day": 8
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "SZ-RTG-ALL-DAY-IMMACULATE-CONCEPTION"
        }
      },
      {
        "ruleId": "SZ-CAL-SZ-RTG-ALL-DAY-NATIONAL-DAY-EC9F2C557FE4FCA6",
        "calendarId": "ap22-sz-ec9f2c557fe4",
        "jurisdiction": {
          "level": "cantonal",
          "code": "SZ"
        },
        "labelKey": "holiday.sz.SZ-RTG-ALL-DAY-NATIONAL-DAY",
        "labels": {
          "de": "Bundesfeiertag",
          "fr": "Fête nationale"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-BUNDESFEIERTAG-19940701",
            "locator": "SR 116 Art. 1, neue offene Anwendung auf dieses Geltungsprofil"
          }
        ],
        "calculation": {
          "type": "fixedMonthDay",
          "month": 8,
          "day": 1
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "SZ-RTG-ALL-DAY-NATIONAL-DAY"
        }
      },
      {
        "ruleId": "SZ-CAL-SZ-RTG-ALL-DAY-NEW-YEAR-EC9F2C557FE4FCA6",
        "calendarId": "ap22-sz-ec9f2c557fe4",
        "jurisdiction": {
          "level": "cantonal",
          "code": "SZ"
        },
        "labelKey": "holiday.sz.SZ-RTG-ALL-DAY-NEW-YEAR",
        "labels": {
          "de": "Neujahr",
          "fr": "Nouvel An"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-SZ-RTG-545110-20180701",
            "locator": "§ 2 Abs. 1 Ziff. 3"
          }
        ],
        "calculation": {
          "type": "fixedMonthDay",
          "month": 1,
          "day": 1
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "SZ-RTG-ALL-DAY-NEW-YEAR"
        }
      },
      {
        "ruleId": "SZ-CAL-SZ-RTG-ALL-DAY-PENTECOST-EC9F2C557FE4FCA6",
        "calendarId": "ap22-sz-ec9f2c557fe4",
        "jurisdiction": {
          "level": "cantonal",
          "code": "SZ"
        },
        "labelKey": "holiday.sz.SZ-RTG-ALL-DAY-PENTECOST",
        "labels": {
          "de": "Pfingsten",
          "fr": "Pentecôte"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-SZ-RTG-545110-20180701",
            "locator": "§ 2 Abs. 1 Ziff. 2"
          }
        ],
        "calculation": {
          "type": "easterOffsetDays",
          "offsetDays": 49
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "SZ-RTG-ALL-DAY-PENTECOST"
        }
      },
      {
        "ruleId": "SZ-CAL-SZ-RTG-ALL-DAY-ST-JOSEPH-EC9F2C557FE4FCA6",
        "calendarId": "ap22-sz-ec9f2c557fe4",
        "jurisdiction": {
          "level": "cantonal",
          "code": "SZ"
        },
        "labelKey": "holiday.sz.SZ-RTG-ALL-DAY-ST-JOSEPH",
        "labels": {
          "de": "Josefstag",
          "fr": "Saint-Joseph"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-SZ-RTG-545110-20180701",
            "locator": "§ 2 Abs. 1 Ziff. 3"
          }
        ],
        "calculation": {
          "type": "fixedMonthDay",
          "month": 3,
          "day": 19
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "SZ-RTG-ALL-DAY-ST-JOSEPH"
        }
      },
      {
        "ruleId": "SZ-CAL-SZ-RTG-ALL-DAY-ST-STEPHEN-EC9F2C557FE4FCA6",
        "calendarId": "ap22-sz-ec9f2c557fe4",
        "jurisdiction": {
          "level": "cantonal",
          "code": "SZ"
        },
        "labelKey": "holiday.sz.SZ-RTG-ALL-DAY-ST-STEPHEN",
        "labels": {
          "de": "Stephanstag",
          "fr": "Saint-Étienne"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-SZ-RTG-545110-20180701",
            "locator": "§ 2 Abs. 1 Ziff. 3"
          }
        ],
        "calculation": {
          "type": "fixedMonthDay",
          "month": 12,
          "day": 26
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "SZ-RTG-ALL-DAY-ST-STEPHEN"
        }
      },
      {
        "ruleId": "SZ-CAL-SZ-RTG-ALL-DAY-WHIT-MONDAY-EC9F2C557FE4FCA6",
        "calendarId": "ap22-sz-ec9f2c557fe4",
        "jurisdiction": {
          "level": "cantonal",
          "code": "SZ"
        },
        "labelKey": "holiday.sz.SZ-RTG-ALL-DAY-WHIT-MONDAY",
        "labels": {
          "de": "Pfingstmontag",
          "fr": "Lundi de Pentecôte"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-SZ-RTG-545110-20180701",
            "locator": "§ 2 Abs. 1 Ziff. 3"
          }
        ],
        "calculation": {
          "type": "easterOffsetDays",
          "offsetDays": 50
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "SZ-RTG-ALL-DAY-WHIT-MONDAY"
        }
      }
    ],
    "projection": {
      "catalogId": "ch-holiday-catalog",
      "catalogFormatVersion": "2.0.0",
      "projectionId": "projection-ec9f2c557fe4fca6",
      "sourceHash": "c5701e47df0d07bb288719b26d55c31b84fe83ea539578d9192e292e08602570"
    }
  },
  {
    "$schema": "https://raw.githubusercontent.com/davidsteimer/fristenrechner/main/schemas/calendar-rules-v3.schema.json",
    "formatVersion": "3.0.0",
    "dataKind": "calendar",
    "calendarId": "ap22-tg-3d6514fbabb1",
    "jurisdiction": {
      "level": "cantonal",
      "code": "TG"
    },
    "validity": {
      "from": "2026-08-29",
      "to": null
    },
    "inherits": [
      "ch-federal-calendar"
    ],
    "review": {
      "reviewedOn": "2026-10-08",
      "status": "candidate",
      "reviewedBy": "Codex",
      "basis": "AP22C1 Datenkandidat auf Grundlage von DEC-2026-030. Keine Quellen- oder Betriebsfreigabe."
    },
    "sources": [
      {
        "sourceId": "SRC-BUNDESFEIERTAG-19940701",
        "sourceType": "officialDossier",
        "title": "Verordnung über den Bundesfeiertag, SR 116",
        "authority": "CH",
        "url": "https://www.fedlex.admin.ch/eli/cc/1994/1340_1340_1340/de",
        "documentVersionDate": "1994-07-01",
        "reviewedOn": "2026-09-13",
        "reviewStatus": "monitored"
      },
      {
        "sourceId": "SRC-TG-RTG-8229-V2949",
        "sourceType": "officialDossier",
        "title": "Ruhetagsgesetz, RTG",
        "authority": "CH-TG",
        "url": "https://www.rechtsbuch.tg.ch/api/de/versions/2949/pdf_file",
        "documentVersionDate": "2026-01-01",
        "reviewedOn": "2026-09-13",
        "reviewStatus": "monitored"
      }
    ],
    "rules": [
      {
        "ruleId": "TG-CAL-TG-RTG-ALL-DAY-ASCENSION-3D6514FBABB118B4",
        "calendarId": "ap22-tg-3d6514fbabb1",
        "jurisdiction": {
          "level": "cantonal",
          "code": "TG"
        },
        "labelKey": "holiday.tg.TG-RTG-ALL-DAY-ASCENSION",
        "labels": {
          "de": "Auffahrt",
          "fr": "Ascension"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-TG-RTG-8229-V2949",
            "locator": "§ 1 und § 2"
          }
        ],
        "calculation": {
          "type": "easterOffsetDays",
          "offsetDays": 39
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "TG-RTG-ALL-DAY-ASCENSION"
        }
      },
      {
        "ruleId": "TG-CAL-TG-RTG-ALL-DAY-BERCHTOLD-3D6514FBABB118B4",
        "calendarId": "ap22-tg-3d6514fbabb1",
        "jurisdiction": {
          "level": "cantonal",
          "code": "TG"
        },
        "labelKey": "holiday.tg.TG-RTG-ALL-DAY-BERCHTOLD",
        "labels": {
          "de": "Berchtoldstag",
          "fr": "Saint-Berchtold"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-TG-RTG-8229-V2949",
            "locator": "§ 1 und § 2"
          }
        ],
        "calculation": {
          "type": "fixedMonthDay",
          "month": 1,
          "day": 2
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "TG-RTG-ALL-DAY-BERCHTOLD"
        }
      },
      {
        "ruleId": "TG-CAL-TG-RTG-ALL-DAY-CHRISTMAS-3D6514FBABB118B4",
        "calendarId": "ap22-tg-3d6514fbabb1",
        "jurisdiction": {
          "level": "cantonal",
          "code": "TG"
        },
        "labelKey": "holiday.tg.TG-RTG-ALL-DAY-CHRISTMAS",
        "labels": {
          "de": "Weihnachten",
          "fr": "Noël"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-TG-RTG-8229-V2949",
            "locator": "§ 1 und § 2"
          }
        ],
        "calculation": {
          "type": "fixedMonthDay",
          "month": 12,
          "day": 25
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "TG-RTG-ALL-DAY-CHRISTMAS"
        }
      },
      {
        "ruleId": "TG-CAL-TG-RTG-ALL-DAY-EASTER-3D6514FBABB118B4",
        "calendarId": "ap22-tg-3d6514fbabb1",
        "jurisdiction": {
          "level": "cantonal",
          "code": "TG"
        },
        "labelKey": "holiday.tg.TG-RTG-ALL-DAY-EASTER",
        "labels": {
          "de": "Ostern",
          "fr": "Pâques"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-TG-RTG-8229-V2949",
            "locator": "§ 1 und § 2"
          }
        ],
        "calculation": {
          "type": "easterOffsetDays",
          "offsetDays": 0
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "TG-RTG-ALL-DAY-EASTER"
        }
      },
      {
        "ruleId": "TG-CAL-TG-RTG-ALL-DAY-EASTER-MONDAY-3D6514FBABB118B4",
        "calendarId": "ap22-tg-3d6514fbabb1",
        "jurisdiction": {
          "level": "cantonal",
          "code": "TG"
        },
        "labelKey": "holiday.tg.TG-RTG-ALL-DAY-EASTER-MONDAY",
        "labels": {
          "de": "Ostermontag",
          "fr": "Lundi de Pâques"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-TG-RTG-8229-V2949",
            "locator": "§ 1 und § 2"
          }
        ],
        "calculation": {
          "type": "easterOffsetDays",
          "offsetDays": 1
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "TG-RTG-ALL-DAY-EASTER-MONDAY"
        }
      },
      {
        "ruleId": "TG-CAL-TG-RTG-ALL-DAY-FEDERAL-FAST-3D6514FBABB118B4",
        "calendarId": "ap22-tg-3d6514fbabb1",
        "jurisdiction": {
          "level": "cantonal",
          "code": "TG"
        },
        "labelKey": "holiday.tg.TG-RTG-ALL-DAY-FEDERAL-FAST",
        "labels": {
          "de": "Eidgenössischer Dank-, Buss- und Bettag",
          "fr": "Jeûne fédéral"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-TG-RTG-8229-V2949",
            "locator": "§ 1 und § 2"
          }
        ],
        "calculation": {
          "type": "nthWeekdayOfMonth",
          "month": 9,
          "isoWeekday": 7,
          "occurrence": 3
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "TG-RTG-ALL-DAY-FEDERAL-FAST"
        }
      },
      {
        "ruleId": "TG-CAL-TG-RTG-ALL-DAY-GOOD-FRIDAY-3D6514FBABB118B4",
        "calendarId": "ap22-tg-3d6514fbabb1",
        "jurisdiction": {
          "level": "cantonal",
          "code": "TG"
        },
        "labelKey": "holiday.tg.TG-RTG-ALL-DAY-GOOD-FRIDAY",
        "labels": {
          "de": "Karfreitag",
          "fr": "Vendredi saint"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-TG-RTG-8229-V2949",
            "locator": "§ 1 und § 2"
          }
        ],
        "calculation": {
          "type": "easterOffsetDays",
          "offsetDays": -2
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "TG-RTG-ALL-DAY-GOOD-FRIDAY"
        }
      },
      {
        "ruleId": "TG-CAL-TG-RTG-ALL-DAY-MAY1-3D6514FBABB118B4",
        "calendarId": "ap22-tg-3d6514fbabb1",
        "jurisdiction": {
          "level": "cantonal",
          "code": "TG"
        },
        "labelKey": "holiday.tg.TG-RTG-ALL-DAY-MAY1",
        "labels": {
          "de": "Tag der Arbeit (1. Mai)",
          "fr": "Fête du travail (1er mai)"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-TG-RTG-8229-V2949",
            "locator": "§ 1 und § 2"
          }
        ],
        "calculation": {
          "type": "fixedMonthDay",
          "month": 5,
          "day": 1
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "TG-RTG-ALL-DAY-MAY1"
        }
      },
      {
        "ruleId": "TG-CAL-TG-RTG-ALL-DAY-NATIONAL-DAY-3D6514FBABB118B4",
        "calendarId": "ap22-tg-3d6514fbabb1",
        "jurisdiction": {
          "level": "cantonal",
          "code": "TG"
        },
        "labelKey": "holiday.tg.TG-RTG-ALL-DAY-NATIONAL-DAY",
        "labels": {
          "de": "Bundesfeiertag",
          "fr": "Fête nationale"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-BUNDESFEIERTAG-19940701",
            "locator": "SR 116 Art. 1, offene Anwendung auf neues kantonales Profil"
          }
        ],
        "calculation": {
          "type": "fixedMonthDay",
          "month": 8,
          "day": 1
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "TG-RTG-ALL-DAY-NATIONAL-DAY"
        }
      },
      {
        "ruleId": "TG-CAL-TG-RTG-ALL-DAY-NEW-YEAR-3D6514FBABB118B4",
        "calendarId": "ap22-tg-3d6514fbabb1",
        "jurisdiction": {
          "level": "cantonal",
          "code": "TG"
        },
        "labelKey": "holiday.tg.TG-RTG-ALL-DAY-NEW-YEAR",
        "labels": {
          "de": "Neujahr",
          "fr": "Nouvel An"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-TG-RTG-8229-V2949",
            "locator": "§ 1 und § 2"
          }
        ],
        "calculation": {
          "type": "fixedMonthDay",
          "month": 1,
          "day": 1
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "TG-RTG-ALL-DAY-NEW-YEAR"
        }
      },
      {
        "ruleId": "TG-CAL-TG-RTG-ALL-DAY-PENTECOST-3D6514FBABB118B4",
        "calendarId": "ap22-tg-3d6514fbabb1",
        "jurisdiction": {
          "level": "cantonal",
          "code": "TG"
        },
        "labelKey": "holiday.tg.TG-RTG-ALL-DAY-PENTECOST",
        "labels": {
          "de": "Pfingsten",
          "fr": "Pentecôte"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-TG-RTG-8229-V2949",
            "locator": "§ 1 und § 2"
          }
        ],
        "calculation": {
          "type": "easterOffsetDays",
          "offsetDays": 49
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "TG-RTG-ALL-DAY-PENTECOST"
        }
      },
      {
        "ruleId": "TG-CAL-TG-RTG-ALL-DAY-ST-STEPHEN-3D6514FBABB118B4",
        "calendarId": "ap22-tg-3d6514fbabb1",
        "jurisdiction": {
          "level": "cantonal",
          "code": "TG"
        },
        "labelKey": "holiday.tg.TG-RTG-ALL-DAY-ST-STEPHEN",
        "labels": {
          "de": "Stephanstag",
          "fr": "Saint-Étienne"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-TG-RTG-8229-V2949",
            "locator": "§ 1 und § 2"
          }
        ],
        "calculation": {
          "type": "fixedMonthDay",
          "month": 12,
          "day": 26
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "TG-RTG-ALL-DAY-ST-STEPHEN"
        }
      },
      {
        "ruleId": "TG-CAL-TG-RTG-ALL-DAY-WHIT-MONDAY-3D6514FBABB118B4",
        "calendarId": "ap22-tg-3d6514fbabb1",
        "jurisdiction": {
          "level": "cantonal",
          "code": "TG"
        },
        "labelKey": "holiday.tg.TG-RTG-ALL-DAY-WHIT-MONDAY",
        "labels": {
          "de": "Pfingstmontag",
          "fr": "Lundi de Pentecôte"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-TG-RTG-8229-V2949",
            "locator": "§ 1 und § 2"
          }
        ],
        "calculation": {
          "type": "easterOffsetDays",
          "offsetDays": 50
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "TG-RTG-ALL-DAY-WHIT-MONDAY"
        }
      }
    ],
    "projection": {
      "catalogId": "ch-holiday-catalog",
      "catalogFormatVersion": "2.0.0",
      "projectionId": "projection-3d6514fbabb118b4",
      "sourceHash": "c5701e47df0d07bb288719b26d55c31b84fe83ea539578d9192e292e08602570"
    }
  },
  {
    "$schema": "https://raw.githubusercontent.com/davidsteimer/fristenrechner/main/schemas/calendar-rules-v3.schema.json",
    "formatVersion": "3.0.0",
    "dataKind": "calendar",
    "calendarId": "ap22-ti-944ed0286e9a",
    "jurisdiction": {
      "level": "cantonal",
      "code": "TI"
    },
    "validity": {
      "from": "2026-08-29",
      "to": null
    },
    "inherits": [
      "ch-federal-calendar"
    ],
    "review": {
      "reviewedOn": "2026-10-08",
      "status": "candidate",
      "reviewedBy": "Codex",
      "basis": "AP22C1 Datenkandidat auf Grundlage von DEC-2026-030. Keine Quellen- oder Betriebsfreigabe."
    },
    "sources": [
      {
        "sourceId": "SRC-TI-FEIERTAGE-843200",
        "sourceType": "officialDossier",
        "title": "Legge concernente i giorni festivi ufficiali nel Cantone Ticino",
        "authority": "CH-TI",
        "url": "https://www3.ti.ch/CAN/RLeggi/public/index.php/raccolta-leggi/legge/num/568",
        "documentVersionDate": null,
        "reviewedOn": "2026-09-13",
        "reviewStatus": "monitored"
      }
    ],
    "rules": [
      {
        "ruleId": "TI-CAL-TI-CAL-DAY-ALL-SAINTS-944ED0286E9A6D9F",
        "calendarId": "ap22-ti-944ed0286e9a",
        "jurisdiction": {
          "level": "cantonal",
          "code": "TI"
        },
        "labelKey": "holiday.ti.TI-CAL-DAY-ALL-SAINTS",
        "labels": {
          "de": "Allerheiligen",
          "fr": "Toussaint"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-TI-FEIERTAGE-843200",
            "locator": "Art. 1"
          }
        ],
        "calculation": {
          "type": "fixedMonthDay",
          "month": 11,
          "day": 1
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "TI-CAL-DAY-ALL-SAINTS"
        }
      },
      {
        "ruleId": "TI-CAL-TI-CAL-DAY-ASCENSION-944ED0286E9A6D9F",
        "calendarId": "ap22-ti-944ed0286e9a",
        "jurisdiction": {
          "level": "cantonal",
          "code": "TI"
        },
        "labelKey": "holiday.ti.TI-CAL-DAY-ASCENSION",
        "labels": {
          "de": "Auffahrt",
          "fr": "Ascension"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-TI-FEIERTAGE-843200",
            "locator": "Art. 1"
          }
        ],
        "calculation": {
          "type": "easterOffsetDays",
          "offsetDays": 39
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "TI-CAL-DAY-ASCENSION"
        }
      },
      {
        "ruleId": "TI-CAL-TI-CAL-DAY-ASSUMPTION-944ED0286E9A6D9F",
        "calendarId": "ap22-ti-944ed0286e9a",
        "jurisdiction": {
          "level": "cantonal",
          "code": "TI"
        },
        "labelKey": "holiday.ti.TI-CAL-DAY-ASSUMPTION",
        "labels": {
          "de": "Mariä Himmelfahrt",
          "fr": "Assomption"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-TI-FEIERTAGE-843200",
            "locator": "Art. 1"
          }
        ],
        "calculation": {
          "type": "fixedMonthDay",
          "month": 8,
          "day": 15
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "TI-CAL-DAY-ASSUMPTION"
        }
      },
      {
        "ruleId": "TI-CAL-TI-CAL-DAY-CHRISTMAS-944ED0286E9A6D9F",
        "calendarId": "ap22-ti-944ed0286e9a",
        "jurisdiction": {
          "level": "cantonal",
          "code": "TI"
        },
        "labelKey": "holiday.ti.TI-CAL-DAY-CHRISTMAS",
        "labels": {
          "de": "Weihnachten",
          "fr": "Noël"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-TI-FEIERTAGE-843200",
            "locator": "Art. 1"
          }
        ],
        "calculation": {
          "type": "fixedMonthDay",
          "month": 12,
          "day": 25
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "TI-CAL-DAY-CHRISTMAS"
        }
      },
      {
        "ruleId": "TI-CAL-TI-CAL-DAY-CORPUS-CHRISTI-944ED0286E9A6D9F",
        "calendarId": "ap22-ti-944ed0286e9a",
        "jurisdiction": {
          "level": "cantonal",
          "code": "TI"
        },
        "labelKey": "holiday.ti.TI-CAL-DAY-CORPUS-CHRISTI",
        "labels": {
          "de": "Fronleichnam",
          "fr": "Fête-Dieu"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-TI-FEIERTAGE-843200",
            "locator": "Art. 1"
          }
        ],
        "calculation": {
          "type": "easterOffsetDays",
          "offsetDays": 60
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "TI-CAL-DAY-CORPUS-CHRISTI"
        }
      },
      {
        "ruleId": "TI-CAL-TI-CAL-DAY-EASTER-MONDAY-944ED0286E9A6D9F",
        "calendarId": "ap22-ti-944ed0286e9a",
        "jurisdiction": {
          "level": "cantonal",
          "code": "TI"
        },
        "labelKey": "holiday.ti.TI-CAL-DAY-EASTER-MONDAY",
        "labels": {
          "de": "Ostermontag",
          "fr": "Lundi de Pâques"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-TI-FEIERTAGE-843200",
            "locator": "Art. 1"
          }
        ],
        "calculation": {
          "type": "easterOffsetDays",
          "offsetDays": 1
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "TI-CAL-DAY-EASTER-MONDAY"
        }
      },
      {
        "ruleId": "TI-CAL-TI-CAL-DAY-EPIPHANY-944ED0286E9A6D9F",
        "calendarId": "ap22-ti-944ed0286e9a",
        "jurisdiction": {
          "level": "cantonal",
          "code": "TI"
        },
        "labelKey": "holiday.ti.TI-CAL-DAY-EPIPHANY",
        "labels": {
          "de": "Heilige Drei Könige",
          "fr": "Épiphanie"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-TI-FEIERTAGE-843200",
            "locator": "Art. 1"
          }
        ],
        "calculation": {
          "type": "fixedMonthDay",
          "month": 1,
          "day": 6
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "TI-CAL-DAY-EPIPHANY"
        }
      },
      {
        "ruleId": "TI-CAL-TI-CAL-DAY-IMMACULATE-CONCEPTION-944ED0286E9A6D9F",
        "calendarId": "ap22-ti-944ed0286e9a",
        "jurisdiction": {
          "level": "cantonal",
          "code": "TI"
        },
        "labelKey": "holiday.ti.TI-CAL-DAY-IMMACULATE-CONCEPTION",
        "labels": {
          "de": "Mariä Empfängnis",
          "fr": "Immaculée Conception"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-TI-FEIERTAGE-843200",
            "locator": "Art. 1"
          }
        ],
        "calculation": {
          "type": "fixedMonthDay",
          "month": 12,
          "day": 8
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "TI-CAL-DAY-IMMACULATE-CONCEPTION"
        }
      },
      {
        "ruleId": "TI-CAL-TI-CAL-DAY-MAY1-944ED0286E9A6D9F",
        "calendarId": "ap22-ti-944ed0286e9a",
        "jurisdiction": {
          "level": "cantonal",
          "code": "TI"
        },
        "labelKey": "holiday.ti.TI-CAL-DAY-MAY1",
        "labels": {
          "de": "Tag der Arbeit (1. Mai)",
          "fr": "Fête du travail (1er mai)"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-TI-FEIERTAGE-843200",
            "locator": "Art. 1"
          }
        ],
        "calculation": {
          "type": "fixedMonthDay",
          "month": 5,
          "day": 1
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "TI-CAL-DAY-MAY1"
        }
      },
      {
        "ruleId": "TI-CAL-TI-CAL-DAY-NATIONAL-DAY-944ED0286E9A6D9F",
        "calendarId": "ap22-ti-944ed0286e9a",
        "jurisdiction": {
          "level": "cantonal",
          "code": "TI"
        },
        "labelKey": "holiday.ti.TI-CAL-DAY-NATIONAL-DAY",
        "labels": {
          "de": "Bundesfeiertag",
          "fr": "Fête nationale"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-TI-FEIERTAGE-843200",
            "locator": "Art. 1"
          }
        ],
        "calculation": {
          "type": "fixedMonthDay",
          "month": 8,
          "day": 1
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "TI-CAL-DAY-NATIONAL-DAY"
        }
      },
      {
        "ruleId": "TI-CAL-TI-CAL-DAY-NEW-YEAR-944ED0286E9A6D9F",
        "calendarId": "ap22-ti-944ed0286e9a",
        "jurisdiction": {
          "level": "cantonal",
          "code": "TI"
        },
        "labelKey": "holiday.ti.TI-CAL-DAY-NEW-YEAR",
        "labels": {
          "de": "Neujahr",
          "fr": "Nouvel An"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-TI-FEIERTAGE-843200",
            "locator": "Art. 1"
          }
        ],
        "calculation": {
          "type": "fixedMonthDay",
          "month": 1,
          "day": 1
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "TI-CAL-DAY-NEW-YEAR"
        }
      },
      {
        "ruleId": "TI-CAL-TI-CAL-DAY-ST-JOSEPH-944ED0286E9A6D9F",
        "calendarId": "ap22-ti-944ed0286e9a",
        "jurisdiction": {
          "level": "cantonal",
          "code": "TI"
        },
        "labelKey": "holiday.ti.TI-CAL-DAY-ST-JOSEPH",
        "labels": {
          "de": "Josefstag",
          "fr": "Saint-Joseph"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-TI-FEIERTAGE-843200",
            "locator": "Art. 1"
          }
        ],
        "calculation": {
          "type": "fixedMonthDay",
          "month": 3,
          "day": 19
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "TI-CAL-DAY-ST-JOSEPH"
        }
      },
      {
        "ruleId": "TI-CAL-TI-CAL-DAY-ST-PETER-PAUL-944ED0286E9A6D9F",
        "calendarId": "ap22-ti-944ed0286e9a",
        "jurisdiction": {
          "level": "cantonal",
          "code": "TI"
        },
        "labelKey": "holiday.ti.TI-CAL-DAY-ST-PETER-PAUL",
        "labels": {
          "de": "Peter und Paul",
          "fr": "Saints Pierre et Paul"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-TI-FEIERTAGE-843200",
            "locator": "Art. 1"
          }
        ],
        "calculation": {
          "type": "fixedMonthDay",
          "month": 6,
          "day": 29
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "TI-CAL-DAY-ST-PETER-PAUL"
        }
      },
      {
        "ruleId": "TI-CAL-TI-CAL-DAY-ST-STEPHEN-944ED0286E9A6D9F",
        "calendarId": "ap22-ti-944ed0286e9a",
        "jurisdiction": {
          "level": "cantonal",
          "code": "TI"
        },
        "labelKey": "holiday.ti.TI-CAL-DAY-ST-STEPHEN",
        "labels": {
          "de": "Stephanstag",
          "fr": "Saint-Étienne"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-TI-FEIERTAGE-843200",
            "locator": "Art. 1"
          }
        ],
        "calculation": {
          "type": "fixedMonthDay",
          "month": 12,
          "day": 26
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "TI-CAL-DAY-ST-STEPHEN"
        }
      },
      {
        "ruleId": "TI-CAL-TI-CAL-DAY-WHIT-MONDAY-944ED0286E9A6D9F",
        "calendarId": "ap22-ti-944ed0286e9a",
        "jurisdiction": {
          "level": "cantonal",
          "code": "TI"
        },
        "labelKey": "holiday.ti.TI-CAL-DAY-WHIT-MONDAY",
        "labels": {
          "de": "Pfingstmontag",
          "fr": "Lundi de Pentecôte"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-TI-FEIERTAGE-843200",
            "locator": "Art. 1"
          }
        ],
        "calculation": {
          "type": "easterOffsetDays",
          "offsetDays": 50
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "TI-CAL-DAY-WHIT-MONDAY"
        }
      }
    ],
    "projection": {
      "catalogId": "ch-holiday-catalog",
      "catalogFormatVersion": "2.0.0",
      "projectionId": "projection-944ed0286e9a6d9f",
      "sourceHash": "c5701e47df0d07bb288719b26d55c31b84fe83ea539578d9192e292e08602570"
    }
  },
  {
    "$schema": "https://raw.githubusercontent.com/davidsteimer/fristenrechner/main/schemas/calendar-rules-v3.schema.json",
    "formatVersion": "3.0.0",
    "dataKind": "calendar",
    "calendarId": "ap22-ur-67275ff3e872",
    "jurisdiction": {
      "level": "cantonal",
      "code": "UR"
    },
    "validity": {
      "from": "2026-08-29",
      "to": null
    },
    "inherits": [
      "ch-federal-calendar"
    ],
    "review": {
      "reviewedOn": "2026-10-08",
      "status": "candidate",
      "reviewedBy": "Codex",
      "basis": "AP22C1 Datenkandidat auf Grundlage von DEC-2026-030. Keine Quellen- oder Betriebsfreigabe."
    },
    "sources": [
      {
        "sourceId": "SRC-BUNDESFEIERTAG-19940701",
        "sourceType": "officialDossier",
        "title": "Verordnung über den Bundesfeiertag, SR 116",
        "authority": "CH",
        "url": "https://www.fedlex.admin.ch/eli/cc/1994/1340_1340_1340/de",
        "documentVersionDate": "1994-07-01",
        "reviewedOn": "2026-09-13",
        "reviewStatus": "monitored"
      },
      {
        "sourceId": "SRC-UR-LSG-701421-20030101",
        "sourceType": "officialDossier",
        "title": "Gesetz über den Ladenschluss und die Sonntagsruhe, LSG",
        "authority": "CH-UR",
        "url": "https://rechtsbuch.ur.ch/api/de/versions/963/pdf_file",
        "documentVersionDate": "2003-01-01",
        "reviewedOn": "2026-09-13",
        "reviewStatus": "monitored"
      }
    ],
    "rules": [
      {
        "ruleId": "UR-CAL-UR-LSG-ALL-DAY-ALL-SAINTS-67275FF3E8726A32",
        "calendarId": "ap22-ur-67275ff3e872",
        "jurisdiction": {
          "level": "cantonal",
          "code": "UR"
        },
        "labelKey": "holiday.ur.UR-LSG-ALL-DAY-ALL-SAINTS",
        "labels": {
          "de": "Allerheiligen",
          "fr": "Toussaint"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-UR-LSG-701421-20030101",
            "locator": "Art. 9 Abs. 1 Bst. b"
          }
        ],
        "calculation": {
          "type": "fixedMonthDay",
          "month": 11,
          "day": 1
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "UR-LSG-ALL-DAY-ALL-SAINTS"
        }
      },
      {
        "ruleId": "UR-CAL-UR-LSG-ALL-DAY-ASCENSION-67275FF3E8726A32",
        "calendarId": "ap22-ur-67275ff3e872",
        "jurisdiction": {
          "level": "cantonal",
          "code": "UR"
        },
        "labelKey": "holiday.ur.UR-LSG-ALL-DAY-ASCENSION",
        "labels": {
          "de": "Auffahrt",
          "fr": "Ascension"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-UR-LSG-701421-20030101",
            "locator": "Art. 9 Abs. 1 Bst. b"
          }
        ],
        "calculation": {
          "type": "easterOffsetDays",
          "offsetDays": 39
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "UR-LSG-ALL-DAY-ASCENSION"
        }
      },
      {
        "ruleId": "UR-CAL-UR-LSG-ALL-DAY-ASSUMPTION-67275FF3E8726A32",
        "calendarId": "ap22-ur-67275ff3e872",
        "jurisdiction": {
          "level": "cantonal",
          "code": "UR"
        },
        "labelKey": "holiday.ur.UR-LSG-ALL-DAY-ASSUMPTION",
        "labels": {
          "de": "Mariä Himmelfahrt",
          "fr": "Assomption"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-UR-LSG-701421-20030101",
            "locator": "Art. 9 Abs. 1 Bst. b"
          }
        ],
        "calculation": {
          "type": "fixedMonthDay",
          "month": 8,
          "day": 15
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "UR-LSG-ALL-DAY-ASSUMPTION"
        }
      },
      {
        "ruleId": "UR-CAL-UR-LSG-ALL-DAY-CHRISTMAS-67275FF3E8726A32",
        "calendarId": "ap22-ur-67275ff3e872",
        "jurisdiction": {
          "level": "cantonal",
          "code": "UR"
        },
        "labelKey": "holiday.ur.UR-LSG-ALL-DAY-CHRISTMAS",
        "labels": {
          "de": "Weihnachten",
          "fr": "Noël"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-UR-LSG-701421-20030101",
            "locator": "Art. 9 Abs. 1 Bst. b"
          }
        ],
        "calculation": {
          "type": "fixedMonthDay",
          "month": 12,
          "day": 25
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "UR-LSG-ALL-DAY-CHRISTMAS"
        }
      },
      {
        "ruleId": "UR-CAL-UR-LSG-ALL-DAY-CORPUS-CHRISTI-67275FF3E8726A32",
        "calendarId": "ap22-ur-67275ff3e872",
        "jurisdiction": {
          "level": "cantonal",
          "code": "UR"
        },
        "labelKey": "holiday.ur.UR-LSG-ALL-DAY-CORPUS-CHRISTI",
        "labels": {
          "de": "Fronleichnam",
          "fr": "Fête-Dieu"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-UR-LSG-701421-20030101",
            "locator": "Art. 9 Abs. 1 Bst. b"
          }
        ],
        "calculation": {
          "type": "easterOffsetDays",
          "offsetDays": 60
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "UR-LSG-ALL-DAY-CORPUS-CHRISTI"
        }
      },
      {
        "ruleId": "UR-CAL-UR-LSG-ALL-DAY-EASTER-MONDAY-67275FF3E8726A32",
        "calendarId": "ap22-ur-67275ff3e872",
        "jurisdiction": {
          "level": "cantonal",
          "code": "UR"
        },
        "labelKey": "holiday.ur.UR-LSG-ALL-DAY-EASTER-MONDAY",
        "labels": {
          "de": "Ostermontag",
          "fr": "Lundi de Pâques"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-UR-LSG-701421-20030101",
            "locator": "Art. 9 Abs. 1 Bst. b"
          }
        ],
        "calculation": {
          "type": "easterOffsetDays",
          "offsetDays": 1
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "UR-LSG-ALL-DAY-EASTER-MONDAY"
        }
      },
      {
        "ruleId": "UR-CAL-UR-LSG-ALL-DAY-EPIPHANY-67275FF3E8726A32",
        "calendarId": "ap22-ur-67275ff3e872",
        "jurisdiction": {
          "level": "cantonal",
          "code": "UR"
        },
        "labelKey": "holiday.ur.UR-LSG-ALL-DAY-EPIPHANY",
        "labels": {
          "de": "Heilige Drei Könige",
          "fr": "Épiphanie"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-UR-LSG-701421-20030101",
            "locator": "Art. 9 Abs. 1 Bst. b"
          }
        ],
        "calculation": {
          "type": "fixedMonthDay",
          "month": 1,
          "day": 6
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "UR-LSG-ALL-DAY-EPIPHANY"
        }
      },
      {
        "ruleId": "UR-CAL-UR-LSG-ALL-DAY-GOOD-FRIDAY-67275FF3E8726A32",
        "calendarId": "ap22-ur-67275ff3e872",
        "jurisdiction": {
          "level": "cantonal",
          "code": "UR"
        },
        "labelKey": "holiday.ur.UR-LSG-ALL-DAY-GOOD-FRIDAY",
        "labels": {
          "de": "Karfreitag",
          "fr": "Vendredi saint"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-UR-LSG-701421-20030101",
            "locator": "Art. 9 Abs. 1 Bst. b"
          }
        ],
        "calculation": {
          "type": "easterOffsetDays",
          "offsetDays": -2
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "UR-LSG-ALL-DAY-GOOD-FRIDAY"
        }
      },
      {
        "ruleId": "UR-CAL-UR-LSG-ALL-DAY-IMMACULATE-CONCEPTION-67275FF3E8726A32",
        "calendarId": "ap22-ur-67275ff3e872",
        "jurisdiction": {
          "level": "cantonal",
          "code": "UR"
        },
        "labelKey": "holiday.ur.UR-LSG-ALL-DAY-IMMACULATE-CONCEPTION",
        "labels": {
          "de": "Mariä Empfängnis",
          "fr": "Immaculée Conception"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-UR-LSG-701421-20030101",
            "locator": "Art. 9 Abs. 1 Bst. b"
          }
        ],
        "calculation": {
          "type": "fixedMonthDay",
          "month": 12,
          "day": 8
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "UR-LSG-ALL-DAY-IMMACULATE-CONCEPTION"
        }
      },
      {
        "ruleId": "UR-CAL-UR-LSG-ALL-DAY-NATIONAL-DAY-67275FF3E8726A32",
        "calendarId": "ap22-ur-67275ff3e872",
        "jurisdiction": {
          "level": "cantonal",
          "code": "UR"
        },
        "labelKey": "holiday.ur.UR-LSG-ALL-DAY-NATIONAL-DAY",
        "labels": {
          "de": "Bundesfeiertag",
          "fr": "Fête nationale"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-BUNDESFEIERTAG-19940701",
            "locator": "SR 116 Art. 1, neue offene Anwendung auf dieses Geltungsprofil"
          }
        ],
        "calculation": {
          "type": "fixedMonthDay",
          "month": 8,
          "day": 1
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "UR-LSG-ALL-DAY-NATIONAL-DAY"
        }
      },
      {
        "ruleId": "UR-CAL-UR-LSG-ALL-DAY-NEW-YEAR-67275FF3E8726A32",
        "calendarId": "ap22-ur-67275ff3e872",
        "jurisdiction": {
          "level": "cantonal",
          "code": "UR"
        },
        "labelKey": "holiday.ur.UR-LSG-ALL-DAY-NEW-YEAR",
        "labels": {
          "de": "Neujahr",
          "fr": "Nouvel An"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-UR-LSG-701421-20030101",
            "locator": "Art. 9 Abs. 1 Bst. b"
          }
        ],
        "calculation": {
          "type": "fixedMonthDay",
          "month": 1,
          "day": 1
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "UR-LSG-ALL-DAY-NEW-YEAR"
        }
      },
      {
        "ruleId": "UR-CAL-UR-LSG-ALL-DAY-ST-JOSEPH-67275FF3E8726A32",
        "calendarId": "ap22-ur-67275ff3e872",
        "jurisdiction": {
          "level": "cantonal",
          "code": "UR"
        },
        "labelKey": "holiday.ur.UR-LSG-ALL-DAY-ST-JOSEPH",
        "labels": {
          "de": "Josefstag",
          "fr": "Saint-Joseph"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-UR-LSG-701421-20030101",
            "locator": "Art. 9 Abs. 1 Bst. b"
          }
        ],
        "calculation": {
          "type": "fixedMonthDay",
          "month": 3,
          "day": 19
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "UR-LSG-ALL-DAY-ST-JOSEPH"
        }
      },
      {
        "ruleId": "UR-CAL-UR-LSG-ALL-DAY-ST-STEPHEN-67275FF3E8726A32",
        "calendarId": "ap22-ur-67275ff3e872",
        "jurisdiction": {
          "level": "cantonal",
          "code": "UR"
        },
        "labelKey": "holiday.ur.UR-LSG-ALL-DAY-ST-STEPHEN",
        "labels": {
          "de": "Stephanstag",
          "fr": "Saint-Étienne"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-UR-LSG-701421-20030101",
            "locator": "Art. 9 Abs. 1 Bst. b"
          }
        ],
        "calculation": {
          "type": "fixedMonthDay",
          "month": 12,
          "day": 26
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "UR-LSG-ALL-DAY-ST-STEPHEN"
        }
      },
      {
        "ruleId": "UR-CAL-UR-LSG-ALL-DAY-WHIT-MONDAY-67275FF3E8726A32",
        "calendarId": "ap22-ur-67275ff3e872",
        "jurisdiction": {
          "level": "cantonal",
          "code": "UR"
        },
        "labelKey": "holiday.ur.UR-LSG-ALL-DAY-WHIT-MONDAY",
        "labels": {
          "de": "Pfingstmontag",
          "fr": "Lundi de Pentecôte"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-UR-LSG-701421-20030101",
            "locator": "Art. 9 Abs. 1 Bst. b"
          }
        ],
        "calculation": {
          "type": "easterOffsetDays",
          "offsetDays": 50
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "UR-LSG-ALL-DAY-WHIT-MONDAY"
        }
      }
    ],
    "projection": {
      "catalogId": "ch-holiday-catalog",
      "catalogFormatVersion": "2.0.0",
      "projectionId": "projection-67275ff3e8726a32",
      "sourceHash": "c5701e47df0d07bb288719b26d55c31b84fe83ea539578d9192e292e08602570"
    }
  },
  {
    "$schema": "https://raw.githubusercontent.com/davidsteimer/fristenrechner/main/schemas/calendar-rules-v3.schema.json",
    "formatVersion": "3.0.0",
    "dataKind": "calendar",
    "calendarId": "ap22-vd-26f452ff34ee",
    "jurisdiction": {
      "level": "cantonal",
      "code": "VD"
    },
    "validity": {
      "from": "2026-08-29",
      "to": null
    },
    "inherits": [
      "ch-federal-calendar"
    ],
    "review": {
      "reviewedOn": "2026-10-08",
      "status": "candidate",
      "reviewedBy": "Codex",
      "basis": "AP22C1 Datenkandidat auf Grundlage von DEC-2026-030. Keine Quellen- oder Betriebsfreigabe."
    },
    "sources": [
      {
        "sourceId": "SRC-BUNDESFEIERTAG-19940701",
        "sourceType": "officialDossier",
        "title": "Verordnung über den Bundesfeiertag, SR 116",
        "authority": "CH",
        "url": "https://www.fedlex.admin.ch/eli/cc/1994/1340_1340_1340/de",
        "documentVersionDate": "1994-07-01",
        "reviewedOn": "2026-09-13",
        "reviewStatus": "monitored"
      },
      {
        "sourceId": "SRC-VD-LEMP-82211-20120401",
        "sourceType": "officialDossier",
        "title": "Loi sur l’emploi, LEmp",
        "authority": "CH-VD",
        "url": "https://prestations.vd.ch/pub/blv-publication/actes/consolide/822.11?id=c3ef83f5-e736-490d-90a7-1753b31d5ef3",
        "documentVersionDate": "2012-04-01",
        "reviewedOn": "2026-09-13",
        "reviewStatus": "monitored"
      }
    ],
    "rules": [
      {
        "ruleId": "VD-CAL-VD-LEMP-ALL-DAY-ASCENSION-26F452FF34EE3E73",
        "calendarId": "ap22-vd-26f452ff34ee",
        "jurisdiction": {
          "level": "cantonal",
          "code": "VD"
        },
        "labelKey": "holiday.vd.VD-LEMP-ALL-DAY-ASCENSION",
        "labels": {
          "de": "Auffahrt",
          "fr": "Ascension"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-VD-LEMP-82211-20120401",
            "locator": "Art. 47 Abs. 1"
          }
        ],
        "calculation": {
          "type": "easterOffsetDays",
          "offsetDays": 39
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "VD-LEMP-ALL-DAY-ASCENSION"
        }
      },
      {
        "ruleId": "VD-CAL-VD-LEMP-ALL-DAY-BERCHTOLD-26F452FF34EE3E73",
        "calendarId": "ap22-vd-26f452ff34ee",
        "jurisdiction": {
          "level": "cantonal",
          "code": "VD"
        },
        "labelKey": "holiday.vd.VD-LEMP-ALL-DAY-BERCHTOLD",
        "labels": {
          "de": "2. Januar",
          "fr": "2 janvier"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-VD-LEMP-82211-20120401",
            "locator": "Art. 47 Abs. 1"
          }
        ],
        "calculation": {
          "type": "fixedMonthDay",
          "month": 1,
          "day": 2
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "VD-LEMP-ALL-DAY-BERCHTOLD"
        }
      },
      {
        "ruleId": "VD-CAL-VD-LEMP-ALL-DAY-CHRISTMAS-26F452FF34EE3E73",
        "calendarId": "ap22-vd-26f452ff34ee",
        "jurisdiction": {
          "level": "cantonal",
          "code": "VD"
        },
        "labelKey": "holiday.vd.VD-LEMP-ALL-DAY-CHRISTMAS",
        "labels": {
          "de": "Weihnachten",
          "fr": "Noël"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-VD-LEMP-82211-20120401",
            "locator": "Art. 47 Abs. 1"
          }
        ],
        "calculation": {
          "type": "fixedMonthDay",
          "month": 12,
          "day": 25
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "VD-LEMP-ALL-DAY-CHRISTMAS"
        }
      },
      {
        "ruleId": "VD-CAL-VD-LEMP-ALL-DAY-EASTER-MONDAY-26F452FF34EE3E73",
        "calendarId": "ap22-vd-26f452ff34ee",
        "jurisdiction": {
          "level": "cantonal",
          "code": "VD"
        },
        "labelKey": "holiday.vd.VD-LEMP-ALL-DAY-EASTER-MONDAY",
        "labels": {
          "de": "Ostermontag",
          "fr": "Lundi de Pâques"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-VD-LEMP-82211-20120401",
            "locator": "Art. 47 Abs. 1"
          }
        ],
        "calculation": {
          "type": "easterOffsetDays",
          "offsetDays": 1
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "VD-LEMP-ALL-DAY-EASTER-MONDAY"
        }
      },
      {
        "ruleId": "VD-CAL-VD-LEMP-ALL-DAY-FEDERAL-FAST-MONDAY-26F452FF34EE3E73",
        "calendarId": "ap22-vd-26f452ff34ee",
        "jurisdiction": {
          "level": "cantonal",
          "code": "VD"
        },
        "labelKey": "holiday.vd.VD-LEMP-ALL-DAY-FEDERAL-FAST-MONDAY",
        "labels": {
          "de": "Bettagsmontag",
          "fr": "Lundi du Jeûne fédéral"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-VD-LEMP-82211-20120401",
            "locator": "Art. 47 Abs. 1"
          }
        ],
        "calculation": {
          "type": "nthWeekdayOffsetDays",
          "month": 9,
          "offsetDays": 1,
          "isoWeekday": 7,
          "occurrence": 3
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "VD-LEMP-ALL-DAY-FEDERAL-FAST-MONDAY"
        }
      },
      {
        "ruleId": "VD-CAL-VD-LEMP-ALL-DAY-GOOD-FRIDAY-26F452FF34EE3E73",
        "calendarId": "ap22-vd-26f452ff34ee",
        "jurisdiction": {
          "level": "cantonal",
          "code": "VD"
        },
        "labelKey": "holiday.vd.VD-LEMP-ALL-DAY-GOOD-FRIDAY",
        "labels": {
          "de": "Karfreitag",
          "fr": "Vendredi saint"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-VD-LEMP-82211-20120401",
            "locator": "Art. 47 Abs. 1"
          }
        ],
        "calculation": {
          "type": "easterOffsetDays",
          "offsetDays": -2
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "VD-LEMP-ALL-DAY-GOOD-FRIDAY"
        }
      },
      {
        "ruleId": "VD-CAL-VD-LEMP-ALL-DAY-NATIONAL-DAY-26F452FF34EE3E73",
        "calendarId": "ap22-vd-26f452ff34ee",
        "jurisdiction": {
          "level": "cantonal",
          "code": "VD"
        },
        "labelKey": "holiday.vd.VD-LEMP-ALL-DAY-NATIONAL-DAY",
        "labels": {
          "de": "Bundesfeiertag",
          "fr": "Fête nationale"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-BUNDESFEIERTAG-19940701",
            "locator": "SR 116 Art. 1, neue Anwendung auf VD-LEMP-ALL. Kantonaler Bezug Art. 47 Abs. 1"
          }
        ],
        "calculation": {
          "type": "fixedMonthDay",
          "month": 8,
          "day": 1
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "VD-LEMP-ALL-DAY-NATIONAL-DAY"
        }
      },
      {
        "ruleId": "VD-CAL-VD-LEMP-ALL-DAY-NEW-YEAR-26F452FF34EE3E73",
        "calendarId": "ap22-vd-26f452ff34ee",
        "jurisdiction": {
          "level": "cantonal",
          "code": "VD"
        },
        "labelKey": "holiday.vd.VD-LEMP-ALL-DAY-NEW-YEAR",
        "labels": {
          "de": "Neujahr",
          "fr": "Nouvel An"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-VD-LEMP-82211-20120401",
            "locator": "Art. 47 Abs. 1"
          }
        ],
        "calculation": {
          "type": "fixedMonthDay",
          "month": 1,
          "day": 1
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "VD-LEMP-ALL-DAY-NEW-YEAR"
        }
      },
      {
        "ruleId": "VD-CAL-VD-LEMP-ALL-DAY-WHIT-MONDAY-26F452FF34EE3E73",
        "calendarId": "ap22-vd-26f452ff34ee",
        "jurisdiction": {
          "level": "cantonal",
          "code": "VD"
        },
        "labelKey": "holiday.vd.VD-LEMP-ALL-DAY-WHIT-MONDAY",
        "labels": {
          "de": "Pfingstmontag",
          "fr": "Lundi de Pentecôte"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-VD-LEMP-82211-20120401",
            "locator": "Art. 47 Abs. 1"
          }
        ],
        "calculation": {
          "type": "easterOffsetDays",
          "offsetDays": 50
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "VD-LEMP-ALL-DAY-WHIT-MONDAY"
        }
      }
    ],
    "projection": {
      "catalogId": "ch-holiday-catalog",
      "catalogFormatVersion": "2.0.0",
      "projectionId": "projection-26f452ff34ee3e73",
      "sourceHash": "c5701e47df0d07bb288719b26d55c31b84fe83ea539578d9192e292e08602570"
    }
  },
  {
    "$schema": "https://raw.githubusercontent.com/davidsteimer/fristenrechner/main/schemas/calendar-rules-v3.schema.json",
    "formatVersion": "3.0.0",
    "dataKind": "calendar",
    "calendarId": "ap22-vs-6c002f32b1b0",
    "jurisdiction": {
      "level": "cantonal",
      "code": "VS"
    },
    "validity": {
      "from": "2026-08-29",
      "to": null
    },
    "inherits": [
      "ch-federal-calendar"
    ],
    "review": {
      "reviewedOn": "2026-10-08",
      "status": "candidate",
      "reviewedBy": "Codex",
      "basis": "AP22C1 Datenkandidat auf Grundlage von DEC-2026-030. Keine Quellen- oder Betriebsfreigabe."
    },
    "sources": [
      {
        "sourceId": "SRC-BUNDESFEIERTAG-19940701",
        "sourceType": "officialDossier",
        "title": "Verordnung über den Bundesfeiertag, SR 116",
        "authority": "CH",
        "url": "https://www.fedlex.admin.ch/eli/cc/1994/1340_1340_1340/de",
        "documentVersionDate": "1994-07-01",
        "reviewedOn": "2026-09-13",
        "reviewStatus": "monitored"
      },
      {
        "sourceId": "SRC-VS-RPFLG-1731-20240101",
        "sourceType": "officialDossier",
        "title": "Gesetz über die Rechtspflege, RPflG / Loi sur l’organisation de la Justice, LOJ",
        "authority": "CH-VS",
        "url": "https://lex.vs.ch/api/fr/versions/3260/pdf_file",
        "documentVersionDate": "2024-01-01",
        "reviewedOn": "2026-09-13",
        "reviewStatus": "monitored"
      },
      {
        "sourceId": "SRC-VS-RUHEREG-822200-19661202",
        "sourceType": "officialDossier",
        "title": "Ausführungsreglement zur Sonn- und Feiertagsruhe / Règlement d’exécution",
        "authority": "CH-VS",
        "url": "https://lex.vs.ch/api/fr/versions/2108/pdf_file",
        "documentVersionDate": "1966-12-02",
        "reviewedOn": "2026-09-13",
        "reviewStatus": "monitored"
      }
    ],
    "rules": [
      {
        "ruleId": "VS-CAL-VS-CAL-DAY-ALL-SAINTS-6C002F32B1B0461B",
        "calendarId": "ap22-vs-6c002f32b1b0",
        "jurisdiction": {
          "level": "cantonal",
          "code": "VS"
        },
        "labelKey": "holiday.vs.VS-CAL-DAY-ALL-SAINTS",
        "labels": {
          "de": "Allerheiligen",
          "fr": "Toussaint"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-VS-RUHEREG-822200-19661202",
            "locator": "Art. 1"
          }
        ],
        "calculation": {
          "type": "fixedMonthDay",
          "month": 11,
          "day": 1
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "VS-CAL-DAY-ALL-SAINTS"
        }
      },
      {
        "ruleId": "VS-CAL-VS-CAL-DAY-ASCENSION-6C002F32B1B0461B",
        "calendarId": "ap22-vs-6c002f32b1b0",
        "jurisdiction": {
          "level": "cantonal",
          "code": "VS"
        },
        "labelKey": "holiday.vs.VS-CAL-DAY-ASCENSION",
        "labels": {
          "de": "Auffahrt",
          "fr": "Ascension"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-VS-RUHEREG-822200-19661202",
            "locator": "Art. 1"
          }
        ],
        "calculation": {
          "type": "easterOffsetDays",
          "offsetDays": 39
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "VS-CAL-DAY-ASCENSION"
        }
      },
      {
        "ruleId": "VS-CAL-VS-CAL-DAY-ASSUMPTION-6C002F32B1B0461B",
        "calendarId": "ap22-vs-6c002f32b1b0",
        "jurisdiction": {
          "level": "cantonal",
          "code": "VS"
        },
        "labelKey": "holiday.vs.VS-CAL-DAY-ASSUMPTION",
        "labels": {
          "de": "Mariä Himmelfahrt",
          "fr": "Assomption"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-VS-RUHEREG-822200-19661202",
            "locator": "Art. 1"
          }
        ],
        "calculation": {
          "type": "fixedMonthDay",
          "month": 8,
          "day": 15
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "VS-CAL-DAY-ASSUMPTION"
        }
      },
      {
        "ruleId": "VS-CAL-VS-CAL-DAY-CHRISTMAS-6C002F32B1B0461B",
        "calendarId": "ap22-vs-6c002f32b1b0",
        "jurisdiction": {
          "level": "cantonal",
          "code": "VS"
        },
        "labelKey": "holiday.vs.VS-CAL-DAY-CHRISTMAS",
        "labels": {
          "de": "Weihnachten",
          "fr": "Noël"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-VS-RUHEREG-822200-19661202",
            "locator": "Art. 1"
          }
        ],
        "calculation": {
          "type": "fixedMonthDay",
          "month": 12,
          "day": 25
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "VS-CAL-DAY-CHRISTMAS"
        }
      },
      {
        "ruleId": "VS-CAL-VS-CAL-DAY-CORPUS-CHRISTI-6C002F32B1B0461B",
        "calendarId": "ap22-vs-6c002f32b1b0",
        "jurisdiction": {
          "level": "cantonal",
          "code": "VS"
        },
        "labelKey": "holiday.vs.VS-CAL-DAY-CORPUS-CHRISTI",
        "labels": {
          "de": "Fronleichnam",
          "fr": "Fête-Dieu"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-VS-RUHEREG-822200-19661202",
            "locator": "Art. 1"
          }
        ],
        "calculation": {
          "type": "easterOffsetDays",
          "offsetDays": 60
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "VS-CAL-DAY-CORPUS-CHRISTI"
        }
      },
      {
        "ruleId": "VS-CAL-VS-CAL-DAY-IMMACULATE-CONCEPTION-6C002F32B1B0461B",
        "calendarId": "ap22-vs-6c002f32b1b0",
        "jurisdiction": {
          "level": "cantonal",
          "code": "VS"
        },
        "labelKey": "holiday.vs.VS-CAL-DAY-IMMACULATE-CONCEPTION",
        "labels": {
          "de": "Mariä Empfängnis",
          "fr": "Immaculée Conception"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-VS-RUHEREG-822200-19661202",
            "locator": "Art. 1"
          }
        ],
        "calculation": {
          "type": "fixedMonthDay",
          "month": 12,
          "day": 8
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "VS-CAL-DAY-IMMACULATE-CONCEPTION"
        }
      },
      {
        "ruleId": "VS-CAL-VS-CAL-DAY-NATIONAL-DAY-6C002F32B1B0461B",
        "calendarId": "ap22-vs-6c002f32b1b0",
        "jurisdiction": {
          "level": "cantonal",
          "code": "VS"
        },
        "labelKey": "holiday.vs.VS-CAL-DAY-NATIONAL-DAY",
        "labels": {
          "de": "Bundesfeiertag",
          "fr": "Fête nationale"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-BUNDESFEIERTAG-19940701",
            "locator": "Art. 1"
          }
        ],
        "calculation": {
          "type": "fixedMonthDay",
          "month": 8,
          "day": 1
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "VS-CAL-DAY-NATIONAL-DAY"
        }
      },
      {
        "ruleId": "VS-CAL-VS-CAL-DAY-NEW-YEAR-6C002F32B1B0461B",
        "calendarId": "ap22-vs-6c002f32b1b0",
        "jurisdiction": {
          "level": "cantonal",
          "code": "VS"
        },
        "labelKey": "holiday.vs.VS-CAL-DAY-NEW-YEAR",
        "labels": {
          "de": "Neujahr",
          "fr": "Nouvel An"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-VS-RUHEREG-822200-19661202",
            "locator": "Art. 1"
          }
        ],
        "calculation": {
          "type": "fixedMonthDay",
          "month": 1,
          "day": 1
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "VS-CAL-DAY-NEW-YEAR"
        }
      },
      {
        "ruleId": "VS-CAL-VS-CAL-DAY-ST-JOSEPH-6C002F32B1B0461B",
        "calendarId": "ap22-vs-6c002f32b1b0",
        "jurisdiction": {
          "level": "cantonal",
          "code": "VS"
        },
        "labelKey": "holiday.vs.VS-CAL-DAY-ST-JOSEPH",
        "labels": {
          "de": "Josefstag",
          "fr": "Saint-Joseph"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-VS-RUHEREG-822200-19661202",
            "locator": "Art. 1"
          }
        ],
        "calculation": {
          "type": "fixedMonthDay",
          "month": 3,
          "day": 19
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "VS-CAL-DAY-ST-JOSEPH"
        }
      },
      {
        "ruleId": "VS-CAL-VS-PROC-DAY-BERCHTOLD-6C002F32B1B0461B",
        "calendarId": "ap22-vs-6c002f32b1b0",
        "jurisdiction": {
          "level": "cantonal",
          "code": "VS"
        },
        "labelKey": "holiday.vs.VS-PROC-DAY-BERCHTOLD",
        "labels": {
          "de": "2. Januar",
          "fr": "2 janvier"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-VS-RPFLG-1731-20240101",
            "locator": "Art. 37 Abs. 1 Bst. c"
          }
        ],
        "calculation": {
          "type": "fixedMonthDay",
          "month": 1,
          "day": 2
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "proceduralEquivalentDay",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "VS-PROC-DAY-BERCHTOLD"
        }
      },
      {
        "ruleId": "VS-CAL-VS-PROC-DAY-EASTER-MONDAY-6C002F32B1B0461B",
        "calendarId": "ap22-vs-6c002f32b1b0",
        "jurisdiction": {
          "level": "cantonal",
          "code": "VS"
        },
        "labelKey": "holiday.vs.VS-PROC-DAY-EASTER-MONDAY",
        "labels": {
          "de": "Ostermontag",
          "fr": "Lundi de Pâques"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-VS-RPFLG-1731-20240101",
            "locator": "Art. 37 Abs. 1 Bst. c"
          }
        ],
        "calculation": {
          "type": "easterOffsetDays",
          "offsetDays": 1
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "proceduralEquivalentDay",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "VS-PROC-DAY-EASTER-MONDAY"
        }
      },
      {
        "ruleId": "VS-CAL-VS-PROC-DAY-ST-STEPHEN-6C002F32B1B0461B",
        "calendarId": "ap22-vs-6c002f32b1b0",
        "jurisdiction": {
          "level": "cantonal",
          "code": "VS"
        },
        "labelKey": "holiday.vs.VS-PROC-DAY-ST-STEPHEN",
        "labels": {
          "de": "26. Dezember (Stephanstag)",
          "fr": "26 décembre (Saint-Étienne)"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-VS-RPFLG-1731-20240101",
            "locator": "Art. 37 Abs. 1 Bst. c"
          }
        ],
        "calculation": {
          "type": "fixedMonthDay",
          "month": 12,
          "day": 26
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "proceduralEquivalentDay",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "VS-PROC-DAY-ST-STEPHEN"
        }
      },
      {
        "ruleId": "VS-CAL-VS-PROC-DAY-WHIT-MONDAY-6C002F32B1B0461B",
        "calendarId": "ap22-vs-6c002f32b1b0",
        "jurisdiction": {
          "level": "cantonal",
          "code": "VS"
        },
        "labelKey": "holiday.vs.VS-PROC-DAY-WHIT-MONDAY",
        "labels": {
          "de": "Pfingstmontag",
          "fr": "Lundi de Pentecôte"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-VS-RPFLG-1731-20240101",
            "locator": "Art. 37 Abs. 1 Bst. c"
          }
        ],
        "calculation": {
          "type": "easterOffsetDays",
          "offsetDays": 50
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "proceduralEquivalentDay",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "VS-PROC-DAY-WHIT-MONDAY"
        }
      }
    ],
    "projection": {
      "catalogId": "ch-holiday-catalog",
      "catalogFormatVersion": "2.0.0",
      "projectionId": "projection-6c002f32b1b0461b",
      "sourceHash": "c5701e47df0d07bb288719b26d55c31b84fe83ea539578d9192e292e08602570"
    }
  },
  {
    "$schema": "https://raw.githubusercontent.com/davidsteimer/fristenrechner/main/schemas/calendar-rules-v3.schema.json",
    "formatVersion": "3.0.0",
    "dataKind": "calendar",
    "calendarId": "ap22-zg-860e0f8e0e1a",
    "jurisdiction": {
      "level": "cantonal",
      "code": "ZG"
    },
    "validity": {
      "from": "2026-08-29",
      "to": null
    },
    "inherits": [
      "ch-federal-calendar"
    ],
    "review": {
      "reviewedOn": "2026-10-08",
      "status": "candidate",
      "reviewedBy": "Codex",
      "basis": "AP22C1 Datenkandidat auf Grundlage von DEC-2026-030. Keine Quellen- oder Betriebsfreigabe."
    },
    "sources": [
      {
        "sourceId": "SRC-ZG-VRG-1621-20251017",
        "sourceType": "officialDossier",
        "title": "Gesetz über den Rechtsschutz in Verwaltungssachen, VRG",
        "authority": "CH-ZG",
        "url": "https://bgs.zg.ch/app/de/texts_of_law/162.1/versions/2740",
        "documentVersionDate": "2025-10-17",
        "reviewedOn": "2026-09-13",
        "reviewStatus": "monitored"
      }
    ],
    "rules": [
      {
        "ruleId": "ZG-CAL-ZG-VRG-ART10-DAY-ALL-SAINTS-860E0F8E0E1A2DFC",
        "calendarId": "ap22-zg-860e0f8e0e1a",
        "jurisdiction": {
          "level": "cantonal",
          "code": "ZG"
        },
        "labelKey": "holiday.zg.ZG-VRG-ART10-DAY-ALL-SAINTS",
        "labels": {
          "de": "Allerheiligen",
          "fr": "Toussaint"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-ZG-VRG-1621-20251017",
            "locator": "§ 10 Abs. 3 und 4"
          }
        ],
        "calculation": {
          "type": "fixedMonthDay",
          "month": 11,
          "day": 1
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "proceduralEquivalentDay",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "ZG-VRG-ART10-DAY-ALL-SAINTS"
        }
      },
      {
        "ruleId": "ZG-CAL-ZG-VRG-ART10-DAY-ASCENSION-860E0F8E0E1A2DFC",
        "calendarId": "ap22-zg-860e0f8e0e1a",
        "jurisdiction": {
          "level": "cantonal",
          "code": "ZG"
        },
        "labelKey": "holiday.zg.ZG-VRG-ART10-DAY-ASCENSION",
        "labels": {
          "de": "Auffahrt",
          "fr": "Ascension"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-ZG-VRG-1621-20251017",
            "locator": "§ 10 Abs. 3 und 4"
          }
        ],
        "calculation": {
          "type": "easterOffsetDays",
          "offsetDays": 39
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "proceduralEquivalentDay",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "ZG-VRG-ART10-DAY-ASCENSION"
        }
      },
      {
        "ruleId": "ZG-CAL-ZG-VRG-ART10-DAY-ASSUMPTION-860E0F8E0E1A2DFC",
        "calendarId": "ap22-zg-860e0f8e0e1a",
        "jurisdiction": {
          "level": "cantonal",
          "code": "ZG"
        },
        "labelKey": "holiday.zg.ZG-VRG-ART10-DAY-ASSUMPTION",
        "labels": {
          "de": "Mariä Himmelfahrt",
          "fr": "Assomption"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-ZG-VRG-1621-20251017",
            "locator": "§ 10 Abs. 3 und 4"
          }
        ],
        "calculation": {
          "type": "fixedMonthDay",
          "month": 8,
          "day": 15
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "proceduralEquivalentDay",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "ZG-VRG-ART10-DAY-ASSUMPTION"
        }
      },
      {
        "ruleId": "ZG-CAL-ZG-VRG-ART10-DAY-BERCHTOLD-860E0F8E0E1A2DFC",
        "calendarId": "ap22-zg-860e0f8e0e1a",
        "jurisdiction": {
          "level": "cantonal",
          "code": "ZG"
        },
        "labelKey": "holiday.zg.ZG-VRG-ART10-DAY-BERCHTOLD",
        "labels": {
          "de": "Berchtoldstag",
          "fr": "Saint-Berchtold"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-ZG-VRG-1621-20251017",
            "locator": "§ 10 Abs. 3 und 4"
          }
        ],
        "calculation": {
          "type": "fixedMonthDay",
          "month": 1,
          "day": 2
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "proceduralEquivalentDay",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "ZG-VRG-ART10-DAY-BERCHTOLD"
        }
      },
      {
        "ruleId": "ZG-CAL-ZG-VRG-ART10-DAY-CHRISTMAS-860E0F8E0E1A2DFC",
        "calendarId": "ap22-zg-860e0f8e0e1a",
        "jurisdiction": {
          "level": "cantonal",
          "code": "ZG"
        },
        "labelKey": "holiday.zg.ZG-VRG-ART10-DAY-CHRISTMAS",
        "labels": {
          "de": "Weihnachten",
          "fr": "Noël"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-ZG-VRG-1621-20251017",
            "locator": "§ 10 Abs. 3 und 4"
          }
        ],
        "calculation": {
          "type": "fixedMonthDay",
          "month": 12,
          "day": 25
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "proceduralEquivalentDay",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "ZG-VRG-ART10-DAY-CHRISTMAS"
        }
      },
      {
        "ruleId": "ZG-CAL-ZG-VRG-ART10-DAY-CORPUS-CHRISTI-860E0F8E0E1A2DFC",
        "calendarId": "ap22-zg-860e0f8e0e1a",
        "jurisdiction": {
          "level": "cantonal",
          "code": "ZG"
        },
        "labelKey": "holiday.zg.ZG-VRG-ART10-DAY-CORPUS-CHRISTI",
        "labels": {
          "de": "Fronleichnam",
          "fr": "Fête-Dieu"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-ZG-VRG-1621-20251017",
            "locator": "§ 10 Abs. 3 und 4"
          }
        ],
        "calculation": {
          "type": "easterOffsetDays",
          "offsetDays": 60
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "proceduralEquivalentDay",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "ZG-VRG-ART10-DAY-CORPUS-CHRISTI"
        }
      },
      {
        "ruleId": "ZG-CAL-ZG-VRG-ART10-DAY-EASTER-860E0F8E0E1A2DFC",
        "calendarId": "ap22-zg-860e0f8e0e1a",
        "jurisdiction": {
          "level": "cantonal",
          "code": "ZG"
        },
        "labelKey": "holiday.zg.ZG-VRG-ART10-DAY-EASTER",
        "labels": {
          "de": "Ostern",
          "fr": "Pâques"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-ZG-VRG-1621-20251017",
            "locator": "§ 10 Abs. 3 und 4"
          }
        ],
        "calculation": {
          "type": "easterOffsetDays",
          "offsetDays": 0
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "proceduralEquivalentDay",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "ZG-VRG-ART10-DAY-EASTER"
        }
      },
      {
        "ruleId": "ZG-CAL-ZG-VRG-ART10-DAY-EASTER-MONDAY-860E0F8E0E1A2DFC",
        "calendarId": "ap22-zg-860e0f8e0e1a",
        "jurisdiction": {
          "level": "cantonal",
          "code": "ZG"
        },
        "labelKey": "holiday.zg.ZG-VRG-ART10-DAY-EASTER-MONDAY",
        "labels": {
          "de": "Ostermontag",
          "fr": "Lundi de Pâques"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-ZG-VRG-1621-20251017",
            "locator": "§ 10 Abs. 3 und 4"
          }
        ],
        "calculation": {
          "type": "easterOffsetDays",
          "offsetDays": 1
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "proceduralEquivalentDay",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "ZG-VRG-ART10-DAY-EASTER-MONDAY"
        }
      },
      {
        "ruleId": "ZG-CAL-ZG-VRG-ART10-DAY-FEDERAL-FAST-860E0F8E0E1A2DFC",
        "calendarId": "ap22-zg-860e0f8e0e1a",
        "jurisdiction": {
          "level": "cantonal",
          "code": "ZG"
        },
        "labelKey": "holiday.zg.ZG-VRG-ART10-DAY-FEDERAL-FAST",
        "labels": {
          "de": "Eidgenössischer Dank-, Buss- und Bettag",
          "fr": "Jeûne fédéral"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-ZG-VRG-1621-20251017",
            "locator": "§ 10 Abs. 3 und 4"
          }
        ],
        "calculation": {
          "type": "nthWeekdayOfMonth",
          "month": 9,
          "isoWeekday": 7,
          "occurrence": 3
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "proceduralEquivalentDay",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "ZG-VRG-ART10-DAY-FEDERAL-FAST"
        }
      },
      {
        "ruleId": "ZG-CAL-ZG-VRG-ART10-DAY-GOOD-FRIDAY-860E0F8E0E1A2DFC",
        "calendarId": "ap22-zg-860e0f8e0e1a",
        "jurisdiction": {
          "level": "cantonal",
          "code": "ZG"
        },
        "labelKey": "holiday.zg.ZG-VRG-ART10-DAY-GOOD-FRIDAY",
        "labels": {
          "de": "Karfreitag",
          "fr": "Vendredi saint"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-ZG-VRG-1621-20251017",
            "locator": "§ 10 Abs. 3 und 4"
          }
        ],
        "calculation": {
          "type": "easterOffsetDays",
          "offsetDays": -2
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "proceduralEquivalentDay",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "ZG-VRG-ART10-DAY-GOOD-FRIDAY"
        }
      },
      {
        "ruleId": "ZG-CAL-ZG-VRG-ART10-DAY-IMMACULATE-CONCEPTION-860E0F8E0E1A2DFC",
        "calendarId": "ap22-zg-860e0f8e0e1a",
        "jurisdiction": {
          "level": "cantonal",
          "code": "ZG"
        },
        "labelKey": "holiday.zg.ZG-VRG-ART10-DAY-IMMACULATE-CONCEPTION",
        "labels": {
          "de": "Mariä Empfängnis",
          "fr": "Immaculée Conception"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-ZG-VRG-1621-20251017",
            "locator": "§ 10 Abs. 3 und 4"
          }
        ],
        "calculation": {
          "type": "fixedMonthDay",
          "month": 12,
          "day": 8
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "proceduralEquivalentDay",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "ZG-VRG-ART10-DAY-IMMACULATE-CONCEPTION"
        }
      },
      {
        "ruleId": "ZG-CAL-ZG-VRG-ART10-DAY-NATIONAL-DAY-860E0F8E0E1A2DFC",
        "calendarId": "ap22-zg-860e0f8e0e1a",
        "jurisdiction": {
          "level": "cantonal",
          "code": "ZG"
        },
        "labelKey": "holiday.zg.ZG-VRG-ART10-DAY-NATIONAL-DAY",
        "labels": {
          "de": "Bundesfeiertag",
          "fr": "Fête nationale"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-ZG-VRG-1621-20251017",
            "locator": "§ 10 Abs. 3 und 4"
          }
        ],
        "calculation": {
          "type": "fixedMonthDay",
          "month": 8,
          "day": 1
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "proceduralEquivalentDay",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "ZG-VRG-ART10-DAY-NATIONAL-DAY"
        }
      },
      {
        "ruleId": "ZG-CAL-ZG-VRG-ART10-DAY-NEW-YEAR-860E0F8E0E1A2DFC",
        "calendarId": "ap22-zg-860e0f8e0e1a",
        "jurisdiction": {
          "level": "cantonal",
          "code": "ZG"
        },
        "labelKey": "holiday.zg.ZG-VRG-ART10-DAY-NEW-YEAR",
        "labels": {
          "de": "Neujahr",
          "fr": "Nouvel An"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-ZG-VRG-1621-20251017",
            "locator": "§ 10 Abs. 3 und 4"
          }
        ],
        "calculation": {
          "type": "fixedMonthDay",
          "month": 1,
          "day": 1
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "proceduralEquivalentDay",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "ZG-VRG-ART10-DAY-NEW-YEAR"
        }
      },
      {
        "ruleId": "ZG-CAL-ZG-VRG-ART10-DAY-PENTECOST-860E0F8E0E1A2DFC",
        "calendarId": "ap22-zg-860e0f8e0e1a",
        "jurisdiction": {
          "level": "cantonal",
          "code": "ZG"
        },
        "labelKey": "holiday.zg.ZG-VRG-ART10-DAY-PENTECOST",
        "labels": {
          "de": "Pfingsten",
          "fr": "Pentecôte"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-ZG-VRG-1621-20251017",
            "locator": "§ 10 Abs. 3 und 4"
          }
        ],
        "calculation": {
          "type": "easterOffsetDays",
          "offsetDays": 49
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "proceduralEquivalentDay",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "ZG-VRG-ART10-DAY-PENTECOST"
        }
      },
      {
        "ruleId": "ZG-CAL-ZG-VRG-ART10-DAY-ST-STEPHEN-860E0F8E0E1A2DFC",
        "calendarId": "ap22-zg-860e0f8e0e1a",
        "jurisdiction": {
          "level": "cantonal",
          "code": "ZG"
        },
        "labelKey": "holiday.zg.ZG-VRG-ART10-DAY-ST-STEPHEN",
        "labels": {
          "de": "Stephanstag",
          "fr": "Saint-Étienne"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-ZG-VRG-1621-20251017",
            "locator": "§ 10 Abs. 3 und 4"
          }
        ],
        "calculation": {
          "type": "fixedMonthDay",
          "month": 12,
          "day": 26
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "proceduralEquivalentDay",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "ZG-VRG-ART10-DAY-ST-STEPHEN"
        }
      },
      {
        "ruleId": "ZG-CAL-ZG-VRG-ART10-DAY-WHIT-MONDAY-860E0F8E0E1A2DFC",
        "calendarId": "ap22-zg-860e0f8e0e1a",
        "jurisdiction": {
          "level": "cantonal",
          "code": "ZG"
        },
        "labelKey": "holiday.zg.ZG-VRG-ART10-DAY-WHIT-MONDAY",
        "labels": {
          "de": "Pfingstmontag",
          "fr": "Lundi de Pentecôte"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-ZG-VRG-1621-20251017",
            "locator": "§ 10 Abs. 3 und 4"
          }
        ],
        "calculation": {
          "type": "easterOffsetDays",
          "offsetDays": 50
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "proceduralEquivalentDay",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "ZG-VRG-ART10-DAY-WHIT-MONDAY"
        }
      }
    ],
    "projection": {
      "catalogId": "ch-holiday-catalog",
      "catalogFormatVersion": "2.0.0",
      "projectionId": "projection-860e0f8e0e1a2dfc",
      "sourceHash": "c5701e47df0d07bb288719b26d55c31b84fe83ea539578d9192e292e08602570"
    }
  },
  {
    "$schema": "https://raw.githubusercontent.com/davidsteimer/fristenrechner/main/schemas/calendar-rules-v3.schema.json",
    "formatVersion": "3.0.0",
    "dataKind": "calendar",
    "calendarId": "ap22-zh-5aa2974cffee",
    "jurisdiction": {
      "level": "cantonal",
      "code": "ZH"
    },
    "validity": {
      "from": "2026-08-29",
      "to": null
    },
    "inherits": [
      "ch-federal-calendar"
    ],
    "review": {
      "reviewedOn": "2026-10-08",
      "status": "candidate",
      "reviewedBy": "Codex",
      "basis": "AP22C1 Datenkandidat auf Grundlage von DEC-2026-030. Keine Quellen- oder Betriebsfreigabe."
    },
    "sources": [
      {
        "sourceId": "SRC-ZH-GOG-2111-N131",
        "sourceType": "officialDossier",
        "title": "Gesetz über die Gerichts- und Behördenorganisation im Zivil- und Strafprozess, GOG",
        "authority": "CH-ZH",
        "url": "https://www.notes.zh.ch/appl/zhlex_r.nsf/WebView/43B3BDA36DB02CBDC1258D4C004EC591/%24File/211.1_10.5.10_131.pdf",
        "documentVersionDate": "2026-01-01",
        "reviewedOn": "2026-09-13",
        "reviewStatus": "monitored"
      }
    ],
    "rules": [
      {
        "ruleId": "ZH-CAL-ZH-GOG-ALL-DAY-ASCENSION-5AA2974CFFEE5FA1",
        "calendarId": "ap22-zh-5aa2974cffee",
        "jurisdiction": {
          "level": "cantonal",
          "code": "ZH"
        },
        "labelKey": "holiday.zh.ZH-GOG-ALL-DAY-ASCENSION",
        "labels": {
          "de": "Auffahrt",
          "fr": "Ascension"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-ZH-GOG-2111-N131",
            "locator": "§ 122"
          }
        ],
        "calculation": {
          "type": "easterOffsetDays",
          "offsetDays": 39
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "proceduralEquivalentDay",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "ZH-GOG-ALL-DAY-ASCENSION"
        }
      },
      {
        "ruleId": "ZH-CAL-ZH-GOG-ALL-DAY-BERCHTOLD-5AA2974CFFEE5FA1",
        "calendarId": "ap22-zh-5aa2974cffee",
        "jurisdiction": {
          "level": "cantonal",
          "code": "ZH"
        },
        "labelKey": "holiday.zh.ZH-GOG-ALL-DAY-BERCHTOLD",
        "labels": {
          "de": "Berchtoldstag",
          "fr": "Saint-Berchtold"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-ZH-GOG-2111-N131",
            "locator": "§ 122"
          }
        ],
        "calculation": {
          "type": "fixedMonthDay",
          "month": 1,
          "day": 2
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "proceduralEquivalentDay",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "ZH-GOG-ALL-DAY-BERCHTOLD"
        }
      },
      {
        "ruleId": "ZH-CAL-ZH-GOG-ALL-DAY-CHRISTMAS-5AA2974CFFEE5FA1",
        "calendarId": "ap22-zh-5aa2974cffee",
        "jurisdiction": {
          "level": "cantonal",
          "code": "ZH"
        },
        "labelKey": "holiday.zh.ZH-GOG-ALL-DAY-CHRISTMAS",
        "labels": {
          "de": "Weihnachten",
          "fr": "Noël"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-ZH-GOG-2111-N131",
            "locator": "§ 122"
          }
        ],
        "calculation": {
          "type": "fixedMonthDay",
          "month": 12,
          "day": 25
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "proceduralEquivalentDay",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "ZH-GOG-ALL-DAY-CHRISTMAS"
        }
      },
      {
        "ruleId": "ZH-CAL-ZH-GOG-ALL-DAY-EASTER-MONDAY-5AA2974CFFEE5FA1",
        "calendarId": "ap22-zh-5aa2974cffee",
        "jurisdiction": {
          "level": "cantonal",
          "code": "ZH"
        },
        "labelKey": "holiday.zh.ZH-GOG-ALL-DAY-EASTER-MONDAY",
        "labels": {
          "de": "Ostermontag",
          "fr": "Lundi de Pâques"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-ZH-GOG-2111-N131",
            "locator": "§ 122"
          }
        ],
        "calculation": {
          "type": "easterOffsetDays",
          "offsetDays": 1
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "proceduralEquivalentDay",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "ZH-GOG-ALL-DAY-EASTER-MONDAY"
        }
      },
      {
        "ruleId": "ZH-CAL-ZH-GOG-ALL-DAY-GOOD-FRIDAY-5AA2974CFFEE5FA1",
        "calendarId": "ap22-zh-5aa2974cffee",
        "jurisdiction": {
          "level": "cantonal",
          "code": "ZH"
        },
        "labelKey": "holiday.zh.ZH-GOG-ALL-DAY-GOOD-FRIDAY",
        "labels": {
          "de": "Karfreitag",
          "fr": "Vendredi saint"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-ZH-GOG-2111-N131",
            "locator": "§ 122"
          }
        ],
        "calculation": {
          "type": "easterOffsetDays",
          "offsetDays": -2
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "proceduralEquivalentDay",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "ZH-GOG-ALL-DAY-GOOD-FRIDAY"
        }
      },
      {
        "ruleId": "ZH-CAL-ZH-GOG-ALL-DAY-MAY1-5AA2974CFFEE5FA1",
        "calendarId": "ap22-zh-5aa2974cffee",
        "jurisdiction": {
          "level": "cantonal",
          "code": "ZH"
        },
        "labelKey": "holiday.zh.ZH-GOG-ALL-DAY-MAY1",
        "labels": {
          "de": "Tag der Arbeit (1. Mai)",
          "fr": "Fête du travail (1er mai)"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-ZH-GOG-2111-N131",
            "locator": "§ 122"
          }
        ],
        "calculation": {
          "type": "fixedMonthDay",
          "month": 5,
          "day": 1
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "proceduralEquivalentDay",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "ZH-GOG-ALL-DAY-MAY1"
        }
      },
      {
        "ruleId": "ZH-CAL-ZH-GOG-ALL-DAY-NATIONAL-DAY-5AA2974CFFEE5FA1",
        "calendarId": "ap22-zh-5aa2974cffee",
        "jurisdiction": {
          "level": "cantonal",
          "code": "ZH"
        },
        "labelKey": "holiday.zh.ZH-GOG-ALL-DAY-NATIONAL-DAY",
        "labels": {
          "de": "Bundesfeiertag",
          "fr": "Fête nationale"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-ZH-GOG-2111-N131",
            "locator": "§ 122"
          }
        ],
        "calculation": {
          "type": "fixedMonthDay",
          "month": 8,
          "day": 1
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "proceduralEquivalentDay",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "ZH-GOG-ALL-DAY-NATIONAL-DAY"
        }
      },
      {
        "ruleId": "ZH-CAL-ZH-GOG-ALL-DAY-NEW-YEAR-5AA2974CFFEE5FA1",
        "calendarId": "ap22-zh-5aa2974cffee",
        "jurisdiction": {
          "level": "cantonal",
          "code": "ZH"
        },
        "labelKey": "holiday.zh.ZH-GOG-ALL-DAY-NEW-YEAR",
        "labels": {
          "de": "Neujahr",
          "fr": "Nouvel An"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-ZH-GOG-2111-N131",
            "locator": "§ 122"
          }
        ],
        "calculation": {
          "type": "fixedMonthDay",
          "month": 1,
          "day": 1
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "proceduralEquivalentDay",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "ZH-GOG-ALL-DAY-NEW-YEAR"
        }
      },
      {
        "ruleId": "ZH-CAL-ZH-GOG-ALL-DAY-ST-STEPHEN-5AA2974CFFEE5FA1",
        "calendarId": "ap22-zh-5aa2974cffee",
        "jurisdiction": {
          "level": "cantonal",
          "code": "ZH"
        },
        "labelKey": "holiday.zh.ZH-GOG-ALL-DAY-ST-STEPHEN",
        "labels": {
          "de": "Stephanstag",
          "fr": "Saint-Étienne"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-ZH-GOG-2111-N131",
            "locator": "§ 122"
          }
        ],
        "calculation": {
          "type": "fixedMonthDay",
          "month": 12,
          "day": 26
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "proceduralEquivalentDay",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "ZH-GOG-ALL-DAY-ST-STEPHEN"
        }
      },
      {
        "ruleId": "ZH-CAL-ZH-GOG-ALL-DAY-WHIT-MONDAY-5AA2974CFFEE5FA1",
        "calendarId": "ap22-zh-5aa2974cffee",
        "jurisdiction": {
          "level": "cantonal",
          "code": "ZH"
        },
        "labelKey": "holiday.zh.ZH-GOG-ALL-DAY-WHIT-MONDAY",
        "labels": {
          "de": "Pfingstmontag",
          "fr": "Lundi de Pentecôte"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-ZH-GOG-2111-N131",
            "locator": "§ 122"
          }
        ],
        "calculation": {
          "type": "easterOffsetDays",
          "offsetDays": 50
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "proceduralEquivalentDay",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "ZH-GOG-ALL-DAY-WHIT-MONDAY"
        }
      }
    ],
    "projection": {
      "catalogId": "ch-holiday-catalog",
      "catalogFormatVersion": "2.0.0",
      "projectionId": "projection-5aa2974cffee5fa1",
      "sourceHash": "c5701e47df0d07bb288719b26d55c31b84fe83ea539578d9192e292e08602570"
    }
  },
  {
    "$schema": "https://raw.githubusercontent.com/davidsteimer/fristenrechner/main/schemas/calendar-rules-v3.schema.json",
    "formatVersion": "3.0.0",
    "dataKind": "calendar",
    "calendarId": "be-public-holidays",
    "jurisdiction": {
      "level": "cantonal",
      "code": "BE"
    },
    "validity": {
      "from": "2026-01-01",
      "to": null
    },
    "inherits": [
      "ch-federal-calendar"
    ],
    "review": {
      "reviewedOn": "2026-10-08",
      "status": "candidate",
      "reviewedBy": "Codex",
      "basis": "AP22C1 Datenkandidat auf Grundlage von DEC-2026-030. Keine Quellen- oder Betriebsfreigabe."
    },
    "sources": [
      {
        "sourceId": "SRC-FRG-BE-20210401",
        "sourceType": "statute",
        "title": "Gesetz über die Ruhe an öffentlichen Feiertagen, BSG 555.1",
        "authority": "Kanton Bern",
        "url": "https://www.belex.sites.be.ch/app/de/texts_of_law/555.1",
        "documentVersionDate": "2021-04-01",
        "reviewedOn": "2026-08-29",
        "reviewStatus": "verified"
      }
    ],
    "rules": [
      {
        "ruleId": "BE-CAL-HOL-ASCENSION",
        "calendarId": "be-public-holidays",
        "jurisdiction": {
          "level": "cantonal",
          "code": "BE"
        },
        "labelKey": "holiday.be.ascension",
        "labels": {
          "de": "Auffahrt",
          "fr": "Ascension"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-FRG-BE-20210401",
            "locator": "Art. 2 Abs. 1 Bst. b"
          }
        ],
        "calculation": {
          "type": "easterOffsetDays",
          "offsetDays": 39
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "ASCENSION"
        }
      },
      {
        "ruleId": "BE-CAL-HOL-BERCHTOLD-DAY",
        "calendarId": "be-public-holidays",
        "jurisdiction": {
          "level": "cantonal",
          "code": "BE"
        },
        "labelKey": "holiday.be.berchtoldDay",
        "labels": {
          "de": "Berchtoldstag",
          "fr": "Saint-Berchtold"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-FRG-BE-20210401",
            "locator": "Art. 2 Abs. 1 Bst. c"
          }
        ],
        "calculation": {
          "type": "fixedMonthDay",
          "month": 1,
          "day": 2
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "BERCHTOLD-DAY"
        }
      },
      {
        "ruleId": "BE-CAL-HOL-CHRISTMAS",
        "calendarId": "be-public-holidays",
        "jurisdiction": {
          "level": "cantonal",
          "code": "BE"
        },
        "labelKey": "holiday.be.christmas",
        "labels": {
          "de": "Weihnachten",
          "fr": "Noël"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-FRG-BE-20210401",
            "locator": "Art. 2 Abs. 1 Bst. b"
          }
        ],
        "calculation": {
          "type": "fixedMonthDay",
          "month": 12,
          "day": 25
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "CHRISTMAS"
        }
      },
      {
        "ruleId": "BE-CAL-HOL-EASTER",
        "calendarId": "be-public-holidays",
        "jurisdiction": {
          "level": "cantonal",
          "code": "BE"
        },
        "labelKey": "holiday.be.easter",
        "labels": {
          "de": "Ostern",
          "fr": "Pâques"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-FRG-BE-20210401",
            "locator": "Art. 2 Abs. 1 Bst. b"
          }
        ],
        "calculation": {
          "type": "easterOffsetDays",
          "offsetDays": 0
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "EASTER"
        }
      },
      {
        "ruleId": "BE-CAL-HOL-EASTER-MONDAY",
        "calendarId": "be-public-holidays",
        "jurisdiction": {
          "level": "cantonal",
          "code": "BE"
        },
        "labelKey": "holiday.be.easterMonday",
        "labels": {
          "de": "Ostermontag",
          "fr": "Lundi de Pâques"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-FRG-BE-20210401",
            "locator": "Art. 2 Abs. 1 Bst. c"
          }
        ],
        "calculation": {
          "type": "easterOffsetDays",
          "offsetDays": 1
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "EASTER-MONDAY"
        }
      },
      {
        "ruleId": "BE-CAL-HOL-FEDERAL-FAST",
        "calendarId": "be-public-holidays",
        "jurisdiction": {
          "level": "cantonal",
          "code": "BE"
        },
        "labelKey": "holiday.be.federalFast",
        "labels": {
          "de": "Eidgenössischer Dank-, Buss- und Bettag",
          "fr": "Jeûne fédéral"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-FRG-BE-20210401",
            "locator": "Art. 2 Abs. 1 Bst. b"
          }
        ],
        "calculation": {
          "type": "nthWeekdayOfMonth",
          "month": 9,
          "isoWeekday": 7,
          "occurrence": 3
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "FEDERAL-FAST"
        }
      },
      {
        "ruleId": "BE-CAL-HOL-GOOD-FRIDAY",
        "calendarId": "be-public-holidays",
        "jurisdiction": {
          "level": "cantonal",
          "code": "BE"
        },
        "labelKey": "holiday.be.goodFriday",
        "labels": {
          "de": "Karfreitag",
          "fr": "Vendredi saint"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-FRG-BE-20210401",
            "locator": "Art. 2 Abs. 1 Bst. b"
          }
        ],
        "calculation": {
          "type": "easterOffsetDays",
          "offsetDays": -2
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "GOOD-FRIDAY"
        }
      },
      {
        "ruleId": "BE-CAL-HOL-NEW-YEAR",
        "calendarId": "be-public-holidays",
        "jurisdiction": {
          "level": "cantonal",
          "code": "BE"
        },
        "labelKey": "holiday.be.newYear",
        "labels": {
          "de": "Neujahr",
          "fr": "Nouvel An"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-FRG-BE-20210401",
            "locator": "Art. 2 Abs. 1 Bst. c"
          }
        ],
        "calculation": {
          "type": "fixedMonthDay",
          "month": 1,
          "day": 1
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "NEW-YEAR"
        }
      },
      {
        "ruleId": "BE-CAL-HOL-PENTECOST",
        "calendarId": "be-public-holidays",
        "jurisdiction": {
          "level": "cantonal",
          "code": "BE"
        },
        "labelKey": "holiday.be.pentecost",
        "labels": {
          "de": "Pfingsten",
          "fr": "Pentecôte"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-FRG-BE-20210401",
            "locator": "Art. 2 Abs. 1 Bst. b"
          }
        ],
        "calculation": {
          "type": "easterOffsetDays",
          "offsetDays": 49
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "PENTECOST"
        }
      },
      {
        "ruleId": "BE-CAL-HOL-ST-STEPHEN",
        "calendarId": "be-public-holidays",
        "jurisdiction": {
          "level": "cantonal",
          "code": "BE"
        },
        "labelKey": "holiday.be.stStephen",
        "labels": {
          "de": "Stephanstag",
          "fr": "Saint-Étienne"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-FRG-BE-20210401",
            "locator": "Art. 2 Abs. 1 Bst. c"
          }
        ],
        "calculation": {
          "type": "fixedMonthDay",
          "month": 12,
          "day": 26
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "ST-STEPHEN"
        }
      },
      {
        "ruleId": "BE-CAL-HOL-WHIT-MONDAY",
        "calendarId": "be-public-holidays",
        "jurisdiction": {
          "level": "cantonal",
          "code": "BE"
        },
        "labelKey": "holiday.be.whitMonday",
        "labels": {
          "de": "Pfingstmontag",
          "fr": "Lundi de Pentecôte"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-FRG-BE-20210401",
            "locator": "Art. 2 Abs. 1 Bst. c"
          }
        ],
        "calculation": {
          "type": "easterOffsetDays",
          "offsetDays": 50
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "WHIT-MONDAY"
        }
      }
    ],
    "projection": {
      "catalogId": "ch-holiday-catalog",
      "catalogFormatVersion": "2.0.0",
      "projectionId": "projection-cf682a8e398100f3",
      "sourceHash": "c5701e47df0d07bb288719b26d55c31b84fe83ea539578d9192e292e08602570"
    }
  },
  {
    "$schema": "https://raw.githubusercontent.com/davidsteimer/fristenrechner/main/schemas/calendar-rules-v3.schema.json",
    "formatVersion": "3.0.0",
    "dataKind": "calendar",
    "calendarId": "ch-federal-calendar",
    "jurisdiction": {
      "level": "federal",
      "code": "CH"
    },
    "validity": {
      "from": "2025-12-18",
      "to": null
    },
    "inherits": [],
    "review": {
      "reviewedOn": "2026-10-08",
      "status": "candidate",
      "reviewedBy": "Codex",
      "basis": "AP22C1 Datenkandidat auf Grundlage von DEC-2026-030. Keine Quellen- oder Betriebsfreigabe."
    },
    "sources": [
      {
        "sourceId": "SRC-BGG-20260401",
        "sourceType": "statute",
        "title": "Bundesgerichtsgesetz, SR 173.110",
        "authority": "Schweizerische Eidgenossenschaft",
        "url": "https://www.fedlex.admin.ch/eli/cc/2006/218/de",
        "documentVersionDate": "2026-04-01",
        "reviewedOn": "2026-08-30",
        "reviewStatus": "verified"
      },
      {
        "sourceId": "SRC-BUNDESFEIERTAG-19940701",
        "sourceType": "ordinance",
        "title": "Verordnung über den Bundesfeiertag, SR 116",
        "authority": "Schweizerische Eidgenossenschaft",
        "url": "https://www.fedlex.admin.ch/eli/cc/1994/1340_1340_1340/de",
        "documentVersionDate": "1994-07-01",
        "reviewedOn": "2026-08-29",
        "reviewStatus": "verified"
      },
      {
        "sourceId": "SRC-VWVG-20220701",
        "sourceType": "statute",
        "title": "Verwaltungsverfahrensgesetz, SR 172.021",
        "authority": "Schweizerische Eidgenossenschaft",
        "url": "https://www.fedlex.admin.ch/eli/cc/1969/737_757_755/de",
        "documentVersionDate": "2022-07-01",
        "reviewedOn": "2026-08-30",
        "reviewStatus": "verified"
      },
      {
        "sourceId": "SRC-ZPO-20260701",
        "sourceType": "statute",
        "title": "Schweizerische Zivilprozessordnung, SR 272",
        "authority": "Schweizerische Eidgenossenschaft",
        "url": "https://www.fedlex.admin.ch/eli/cc/2010/262/de",
        "documentVersionDate": "2026-07-01",
        "reviewedOn": "2026-08-29",
        "reviewStatus": "verified"
      }
    ],
    "rules": [
      {
        "ruleId": "CH-CAL-HOL-NATIONAL-DAY",
        "calendarId": "ch-federal-calendar",
        "jurisdiction": {
          "level": "federal",
          "code": "CH"
        },
        "labelKey": "holiday.ch.nationalDay",
        "labels": {
          "de": "Bundesfeiertag",
          "fr": "Fête nationale"
        },
        "priority": 100,
        "validity": {
          "from": "1994-07-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-BUNDESFEIERTAG-19940701",
            "locator": "Art. 1"
          }
        ],
        "calculation": {
          "type": "fixedMonthDay",
          "month": 8,
          "day": 1
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "federalHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "NATIONAL-DAY"
        }
      },
      {
        "ruleId": "CH-CAL-SUSP-EASTER",
        "calendarId": "ch-federal-calendar",
        "jurisdiction": {
          "level": "federal",
          "code": "CH"
        },
        "labelKey": "suspension.ch.easter",
        "labels": {
          "de": "Gerichtsferien über Ostern",
          "fr": "Féries judiciaires de Pâques"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-ZPO-20260701",
            "locator": "Art. 145 Abs. 1"
          },
          {
            "sourceId": "SRC-BGG-20260401",
            "locator": "Art. 46 Abs. 1"
          },
          {
            "sourceId": "SRC-VWVG-20220701",
            "locator": "Art. 22a Abs. 1"
          }
        ],
        "calculation": {
          "type": "relativePeriod",
          "startsOn": {
            "anchor": "easterSunday",
            "yearOffset": 0,
            "offsetDays": -7
          },
          "endsOn": {
            "anchor": "easterSunday",
            "yearOffset": 0,
            "offsetDays": 7
          }
        },
        "effect": {
          "type": "suspensionPeriod",
          "suspensionSetId": "ch-court-holidays",
          "applicableProfileIds": [
            "zpo",
            "bgg",
            "vwvg"
          ],
          "inclusive": true,
          "resultIdPrefix": "EASTER"
        }
      },
      {
        "ruleId": "CH-CAL-SUSP-SUMMER",
        "calendarId": "ch-federal-calendar",
        "jurisdiction": {
          "level": "federal",
          "code": "CH"
        },
        "labelKey": "suspension.ch.summer",
        "labels": {
          "de": "Gerichtsferien im Sommer",
          "fr": "Féries judiciaires d'été"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-ZPO-20260701",
            "locator": "Art. 145 Abs. 1"
          },
          {
            "sourceId": "SRC-BGG-20260401",
            "locator": "Art. 46 Abs. 1"
          },
          {
            "sourceId": "SRC-VWVG-20220701",
            "locator": "Art. 22a Abs. 1"
          }
        ],
        "calculation": {
          "type": "relativePeriod",
          "startsOn": {
            "anchor": "fixedMonthDay",
            "month": 7,
            "day": 15,
            "yearOffset": 0,
            "offsetDays": 0
          },
          "endsOn": {
            "anchor": "fixedMonthDay",
            "month": 8,
            "day": 15,
            "yearOffset": 0,
            "offsetDays": 0
          }
        },
        "effect": {
          "type": "suspensionPeriod",
          "suspensionSetId": "ch-court-holidays",
          "applicableProfileIds": [
            "zpo",
            "bgg",
            "vwvg"
          ],
          "inclusive": true,
          "resultIdPrefix": "SUMMER"
        }
      },
      {
        "ruleId": "CH-CAL-SUSP-YEAR-END",
        "calendarId": "ch-federal-calendar",
        "jurisdiction": {
          "level": "federal",
          "code": "CH"
        },
        "labelKey": "suspension.ch.yearEnd",
        "labels": {
          "de": "Gerichtsferien über den Jahreswechsel",
          "fr": "Féries judiciaires de fin d'année"
        },
        "priority": 100,
        "validity": {
          "from": "2025-12-18",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-ZPO-20260701",
            "locator": "Art. 145 Abs. 1"
          },
          {
            "sourceId": "SRC-BGG-20260401",
            "locator": "Art. 46 Abs. 1"
          },
          {
            "sourceId": "SRC-VWVG-20220701",
            "locator": "Art. 22a Abs. 1"
          }
        ],
        "calculation": {
          "type": "relativePeriod",
          "startsOn": {
            "anchor": "fixedMonthDay",
            "month": 12,
            "day": 18,
            "yearOffset": 0,
            "offsetDays": 0
          },
          "endsOn": {
            "anchor": "fixedMonthDay",
            "month": 1,
            "day": 2,
            "yearOffset": 1,
            "offsetDays": 0
          }
        },
        "effect": {
          "type": "suspensionPeriod",
          "suspensionSetId": "ch-court-holidays",
          "applicableProfileIds": [
            "zpo",
            "bgg",
            "vwvg"
          ],
          "inclusive": true,
          "resultIdPrefix": "YEAR-END"
        }
      }
    ],
    "projection": {
      "catalogId": "ch-holiday-catalog",
      "catalogFormatVersion": "2.0.0",
      "projectionId": "projection-d26dfb2183c7f64b",
      "sourceHash": "c5701e47df0d07bb288719b26d55c31b84fe83ea539578d9192e292e08602570"
    }
  },
  {
    "$schema": "https://raw.githubusercontent.com/davidsteimer/fristenrechner/main/schemas/calendar-rules-v3.schema.json",
    "formatVersion": "3.0.0",
    "dataKind": "calendar",
    "calendarId": "ap23f2-zh-rlg-nine",
    "jurisdiction": {
      "level": "cantonal",
      "code": "ZH"
    },
    "validity": {
      "from": "2026-08-29",
      "to": "2027-12-31"
    },
    "inherits": [
      "ch-federal-calendar"
    ],
    "review": {
      "reviewedOn": "2026-10-22",
      "status": "candidate",
      "reviewedBy": "Codex",
      "basis": "AP23F1 fachlich abgenommen, isolierte AP23F2-Strukturprojektion. Keine Katalogaktivierung oder Releasequellenfreigabe."
    },
    "sources": [
      {
        "sourceId": "SRC-ZH-RLG-8224-N045",
        "sourceType": "officialDossier",
        "title": "Ruhetags- und Ladenöffnungsgesetz, RLG",
        "authority": "CH-ZH",
        "url": "https://www.notes.zh.ch/appl/zhlex_r.nsf/WebView/663A7F8F1929F218C1256EB7002E6A05/%24File/822.4_26.6.00_45.pdf",
        "documentVersionDate": "2004-07-01",
        "reviewedOn": "2026-09-13",
        "reviewStatus": "monitored"
      },
      {
        "sourceId": "SRC-BUNDESFEIERTAG-19940701",
        "sourceType": "officialDossier",
        "title": "Verordnung über den Bundesfeiertag, SR 116",
        "authority": "CH",
        "url": "https://www.fedlex.admin.ch/eli/cc/1994/1340_1340_1340/de",
        "documentVersionDate": "1994-07-01",
        "reviewedOn": "2026-09-13",
        "reviewStatus": "monitored"
      }
    ],
    "rules": [
      {
        "ruleId": "ZH-CAL-AP23F2-ZH-RLG-ALL-DAY-NEW-YEAR",
        "calendarId": "ap23f2-zh-rlg-nine",
        "jurisdiction": {
          "level": "cantonal",
          "code": "ZH"
        },
        "labelKey": "holiday.zh.ZH-RLG-ALL-DAY-NEW-YEAR",
        "labels": {
          "de": "Neujahr",
          "fr": "Nouvel An"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-ZH-RLG-8224-N045",
            "locator": "§ 1 Abs. 1 und 2"
          }
        ],
        "calculation": {
          "type": "fixedMonthDay",
          "month": 1,
          "day": 1
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "ZH-RLG-ALL-DAY-NEW-YEAR"
        }
      },
      {
        "ruleId": "ZH-CAL-AP23F2-ZH-RLG-ALL-DAY-GOOD-FRIDAY",
        "calendarId": "ap23f2-zh-rlg-nine",
        "jurisdiction": {
          "level": "cantonal",
          "code": "ZH"
        },
        "labelKey": "holiday.zh.ZH-RLG-ALL-DAY-GOOD-FRIDAY",
        "labels": {
          "de": "Karfreitag",
          "fr": "Vendredi saint"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-ZH-RLG-8224-N045",
            "locator": "§ 1 Abs. 1 und 2"
          }
        ],
        "calculation": {
          "type": "easterOffsetDays",
          "offsetDays": -2
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "ZH-RLG-ALL-DAY-GOOD-FRIDAY"
        }
      },
      {
        "ruleId": "ZH-CAL-AP23F2-ZH-RLG-ALL-DAY-EASTER-MONDAY",
        "calendarId": "ap23f2-zh-rlg-nine",
        "jurisdiction": {
          "level": "cantonal",
          "code": "ZH"
        },
        "labelKey": "holiday.zh.ZH-RLG-ALL-DAY-EASTER-MONDAY",
        "labels": {
          "de": "Ostermontag",
          "fr": "Lundi de Pâques"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-ZH-RLG-8224-N045",
            "locator": "§ 1 Abs. 1 und 2"
          }
        ],
        "calculation": {
          "type": "easterOffsetDays",
          "offsetDays": 1
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "ZH-RLG-ALL-DAY-EASTER-MONDAY"
        }
      },
      {
        "ruleId": "ZH-CAL-AP23F2-ZH-RLG-ALL-DAY-ASCENSION",
        "calendarId": "ap23f2-zh-rlg-nine",
        "jurisdiction": {
          "level": "cantonal",
          "code": "ZH"
        },
        "labelKey": "holiday.zh.ZH-RLG-ALL-DAY-ASCENSION",
        "labels": {
          "de": "Auffahrt",
          "fr": "Ascension"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-ZH-RLG-8224-N045",
            "locator": "§ 1 Abs. 1 und 2"
          }
        ],
        "calculation": {
          "type": "easterOffsetDays",
          "offsetDays": 39
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "ZH-RLG-ALL-DAY-ASCENSION"
        }
      },
      {
        "ruleId": "ZH-CAL-AP23F2-ZH-RLG-ALL-DAY-WHIT-MONDAY",
        "calendarId": "ap23f2-zh-rlg-nine",
        "jurisdiction": {
          "level": "cantonal",
          "code": "ZH"
        },
        "labelKey": "holiday.zh.ZH-RLG-ALL-DAY-WHIT-MONDAY",
        "labels": {
          "de": "Pfingstmontag",
          "fr": "Lundi de Pentecôte"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-ZH-RLG-8224-N045",
            "locator": "§ 1 Abs. 1 und 2"
          }
        ],
        "calculation": {
          "type": "easterOffsetDays",
          "offsetDays": 50
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "ZH-RLG-ALL-DAY-WHIT-MONDAY"
        }
      },
      {
        "ruleId": "ZH-CAL-AP23F2-ZH-RLG-ALL-DAY-NATIONAL-DAY",
        "calendarId": "ap23f2-zh-rlg-nine",
        "jurisdiction": {
          "level": "cantonal",
          "code": "ZH"
        },
        "labelKey": "holiday.zh.ZH-RLG-ALL-DAY-NATIONAL-DAY",
        "labels": {
          "de": "Bundesfeiertag",
          "fr": "Fête nationale"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-BUNDESFEIERTAG-19940701",
            "locator": "SR 116 Art. 1, offene Anwendung auf neues kantonales Profil"
          }
        ],
        "calculation": {
          "type": "fixedMonthDay",
          "month": 8,
          "day": 1
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "federalHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "ZH-RLG-ALL-DAY-NATIONAL-DAY"
        }
      },
      {
        "ruleId": "ZH-CAL-AP23F2-ZH-RLG-ALL-DAY-CHRISTMAS",
        "calendarId": "ap23f2-zh-rlg-nine",
        "jurisdiction": {
          "level": "cantonal",
          "code": "ZH"
        },
        "labelKey": "holiday.zh.ZH-RLG-ALL-DAY-CHRISTMAS",
        "labels": {
          "de": "Weihnachten",
          "fr": "Noël"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-ZH-RLG-8224-N045",
            "locator": "§ 1 Abs. 1 und 2"
          }
        ],
        "calculation": {
          "type": "fixedMonthDay",
          "month": 12,
          "day": 25
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "ZH-RLG-ALL-DAY-CHRISTMAS"
        }
      },
      {
        "ruleId": "ZH-CAL-AP23F2-ZH-RLG-ALL-DAY-ST-STEPHEN",
        "calendarId": "ap23f2-zh-rlg-nine",
        "jurisdiction": {
          "level": "cantonal",
          "code": "ZH"
        },
        "labelKey": "holiday.zh.ZH-RLG-ALL-DAY-ST-STEPHEN",
        "labels": {
          "de": "Stephanstag",
          "fr": "Saint-Étienne"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-ZH-RLG-8224-N045",
            "locator": "§ 1 Abs. 1 und 2"
          }
        ],
        "calculation": {
          "type": "fixedMonthDay",
          "month": 12,
          "day": 26
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "ZH-RLG-ALL-DAY-ST-STEPHEN"
        }
      },
      {
        "ruleId": "ZH-CAL-AP23F2-ZH-RLG-ALL-DAY-MAY1",
        "calendarId": "ap23f2-zh-rlg-nine",
        "jurisdiction": {
          "level": "cantonal",
          "code": "ZH"
        },
        "labelKey": "holiday.zh.ZH-RLG-ALL-DAY-MAY1",
        "labels": {
          "de": "Tag der Arbeit (1. Mai)",
          "fr": "Fête du travail (1er mai)"
        },
        "priority": 100,
        "validity": {
          "from": "2026-01-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-ZH-RLG-8224-N045",
            "locator": "§ 1 Abs. 1 und 2"
          }
        ],
        "calculation": {
          "type": "fixedMonthDay",
          "month": 5,
          "day": 1
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "ZH-RLG-ALL-DAY-MAY1"
        }
      }
    ],
    "projection": {
      "catalogId": "ch-holiday-catalog",
      "catalogFormatVersion": "2.0.0",
      "projectionId": "projection-ap23f2-zh-rlg-nine",
      "sourceHash": "c5701e47df0d07bb288719b26d55c31b84fe83ea539578d9192e292e08602570"
    }
  },
  {
    "$schema": "https://raw.githubusercontent.com/davidsteimer/fristenrechner/main/schemas/calendar-rules-v3.schema.json",
    "formatVersion": "3.0.0",
    "dataKind": "calendar",
    "calendarId": "ap23h2-ow-procedural-core",
    "jurisdiction": {
      "level": "cantonal",
      "code": "OW"
    },
    "validity": {
      "from": "2026-08-29",
      "to": "2027-12-31"
    },
    "inherits": [
      "ap22-ow-76c151dccf1f"
    ],
    "review": {
      "reviewedOn": "2026-10-22",
      "status": "candidate",
      "reviewedBy": "Codex",
      "basis": "AP23H1 H1-D fachlich abgenommen. Isolierte H2-Projektion, keine gemeinsame Quellen- oder Betriebsfreigabe."
    },
    "sources": [
      {
        "sourceId": "SRC-AP23H1-OW-GOG-20220401",
        "sourceType": "officialDossier",
        "title": "Gesetz über die Gerichtsorganisation, Art. 28",
        "authority": "CH-OW",
        "url": "https://gdb.ow.ch/api/de/versions/1792/pdf_file",
        "documentVersionDate": "2022-04-01",
        "reviewedOn": "2026-10-22",
        "reviewStatus": "monitored"
      }
    ],
    "rules": [
      {
        "ruleId": "OW-CAL-OW-PROCEDURAL-ALL-DAY-BERCHTOLD",
        "calendarId": "ap23h2-ow-procedural-core",
        "jurisdiction": {
          "level": "cantonal",
          "code": "OW"
        },
        "labelKey": "holiday.ow.OW-PROCEDURAL-ALL-DAY-BERCHTOLD",
        "labels": {
          "de": "Berchtoldstag",
          "fr": "Saint-Berchtold"
        },
        "priority": 100,
        "validity": {
          "from": "2022-04-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-AP23H1-OW-GOG-20220401",
            "locator": "Art. 28 Abs. 2"
          }
        ],
        "calculation": {
          "type": "fixedMonthDay",
          "month": 1,
          "day": 2
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "OW-PROCEDURAL-ALL-DAY-BERCHTOLD"
        }
      },
      {
        "ruleId": "OW-CAL-OW-PROCEDURAL-ALL-DAY-EASTER-MONDAY",
        "calendarId": "ap23h2-ow-procedural-core",
        "jurisdiction": {
          "level": "cantonal",
          "code": "OW"
        },
        "labelKey": "holiday.ow.OW-PROCEDURAL-ALL-DAY-EASTER-MONDAY",
        "labels": {
          "de": "Ostermontag",
          "fr": "Lundi de Pâques"
        },
        "priority": 100,
        "validity": {
          "from": "2022-04-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-AP23H1-OW-GOG-20220401",
            "locator": "Art. 28 Abs. 2"
          }
        ],
        "calculation": {
          "type": "easterOffsetDays",
          "offsetDays": 1
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "OW-PROCEDURAL-ALL-DAY-EASTER-MONDAY"
        }
      },
      {
        "ruleId": "OW-CAL-OW-PROCEDURAL-ALL-DAY-WHIT-MONDAY",
        "calendarId": "ap23h2-ow-procedural-core",
        "jurisdiction": {
          "level": "cantonal",
          "code": "OW"
        },
        "labelKey": "holiday.ow.OW-PROCEDURAL-ALL-DAY-WHIT-MONDAY",
        "labels": {
          "de": "Pfingstmontag",
          "fr": "Lundi de Pentecôte"
        },
        "priority": 100,
        "validity": {
          "from": "2022-04-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-AP23H1-OW-GOG-20220401",
            "locator": "Art. 28 Abs. 2"
          }
        ],
        "calculation": {
          "type": "easterOffsetDays",
          "offsetDays": 50
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "OW-PROCEDURAL-ALL-DAY-WHIT-MONDAY"
        }
      },
      {
        "ruleId": "OW-CAL-OW-PROCEDURAL-ALL-DAY-ST-STEPHEN",
        "calendarId": "ap23h2-ow-procedural-core",
        "jurisdiction": {
          "level": "cantonal",
          "code": "OW"
        },
        "labelKey": "holiday.ow.OW-PROCEDURAL-ALL-DAY-ST-STEPHEN",
        "labels": {
          "de": "Stephanstag",
          "fr": "Saint-Étienne"
        },
        "priority": 100,
        "validity": {
          "from": "2022-04-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-AP23H1-OW-GOG-20220401",
            "locator": "Art. 28 Abs. 2"
          }
        ],
        "calculation": {
          "type": "fixedMonthDay",
          "month": 12,
          "day": 26
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "OW-PROCEDURAL-ALL-DAY-ST-STEPHEN"
        }
      }
    ],
    "projection": {
      "catalogId": "ch-holiday-catalog",
      "catalogFormatVersion": "2.0.0",
      "projectionId": "projection-ap23h2-ow-procedural-core",
      "sourceHash": "c5701e47df0d07bb288719b26d55c31b84fe83ea539578d9192e292e08602570"
    }
  },
  {
    "$schema": "https://raw.githubusercontent.com/davidsteimer/fristenrechner/main/schemas/calendar-rules-v3.schema.json",
    "formatVersion": "3.0.0",
    "dataKind": "calendar",
    "calendarId": "ap23h2-nw-procedural-core",
    "jurisdiction": {
      "level": "cantonal",
      "code": "NW"
    },
    "validity": {
      "from": "2026-08-29",
      "to": "2027-12-31"
    },
    "inherits": [
      "ap22-nw-5dfca484e4af"
    ],
    "review": {
      "reviewedOn": "2026-10-22",
      "status": "candidate",
      "reviewedBy": "Codex",
      "basis": "AP23H1 H1-D fachlich abgenommen. Isolierte H2-Projektion, keine gemeinsame Quellen- oder Betriebsfreigabe."
    },
    "sources": [
      {
        "sourceId": "SRC-AP23H1-NW-VRG-20260801",
        "sourceType": "officialDossier",
        "title": "VRG, Art. 34",
        "authority": "CH-NW",
        "url": "https://gesetze.nw.ch/api/de/versions/1519/pdf_file",
        "documentVersionDate": "2026-08-01",
        "reviewedOn": "2026-10-22",
        "reviewStatus": "monitored"
      }
    ],
    "rules": [
      {
        "ruleId": "NW-CAL-NW-PROCEDURAL-ALL-DAY-BERCHTOLD",
        "calendarId": "ap23h2-nw-procedural-core",
        "jurisdiction": {
          "level": "cantonal",
          "code": "NW"
        },
        "labelKey": "holiday.nw.NW-PROCEDURAL-ALL-DAY-BERCHTOLD",
        "labels": {
          "de": "Berchtoldstag",
          "fr": "Saint-Berchtold"
        },
        "priority": 100,
        "validity": {
          "from": "2026-08-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-AP23H1-NW-VRG-20260801",
            "locator": "Art. 34 Abs. 2"
          }
        ],
        "calculation": {
          "type": "fixedMonthDay",
          "month": 1,
          "day": 2
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "NW-PROCEDURAL-ALL-DAY-BERCHTOLD"
        }
      },
      {
        "ruleId": "NW-CAL-NW-PROCEDURAL-ALL-DAY-EASTER-MONDAY",
        "calendarId": "ap23h2-nw-procedural-core",
        "jurisdiction": {
          "level": "cantonal",
          "code": "NW"
        },
        "labelKey": "holiday.nw.NW-PROCEDURAL-ALL-DAY-EASTER-MONDAY",
        "labels": {
          "de": "Ostermontag",
          "fr": "Lundi de Pâques"
        },
        "priority": 100,
        "validity": {
          "from": "2026-08-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-AP23H1-NW-VRG-20260801",
            "locator": "Art. 34 Abs. 2"
          }
        ],
        "calculation": {
          "type": "easterOffsetDays",
          "offsetDays": 1
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "NW-PROCEDURAL-ALL-DAY-EASTER-MONDAY"
        }
      },
      {
        "ruleId": "NW-CAL-NW-PROCEDURAL-ALL-DAY-WHIT-MONDAY",
        "calendarId": "ap23h2-nw-procedural-core",
        "jurisdiction": {
          "level": "cantonal",
          "code": "NW"
        },
        "labelKey": "holiday.nw.NW-PROCEDURAL-ALL-DAY-WHIT-MONDAY",
        "labels": {
          "de": "Pfingstmontag",
          "fr": "Lundi de Pentecôte"
        },
        "priority": 100,
        "validity": {
          "from": "2026-08-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-AP23H1-NW-VRG-20260801",
            "locator": "Art. 34 Abs. 2"
          }
        ],
        "calculation": {
          "type": "easterOffsetDays",
          "offsetDays": 50
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "NW-PROCEDURAL-ALL-DAY-WHIT-MONDAY"
        }
      },
      {
        "ruleId": "NW-CAL-NW-PROCEDURAL-ALL-DAY-ST-STEPHEN",
        "calendarId": "ap23h2-nw-procedural-core",
        "jurisdiction": {
          "level": "cantonal",
          "code": "NW"
        },
        "labelKey": "holiday.nw.NW-PROCEDURAL-ALL-DAY-ST-STEPHEN",
        "labels": {
          "de": "Stephanstag",
          "fr": "Saint-Étienne"
        },
        "priority": 100,
        "validity": {
          "from": "2026-08-01",
          "to": null
        },
        "sourceRefs": [
          {
            "sourceId": "SRC-AP23H1-NW-VRG-20260801",
            "locator": "Art. 34 Abs. 2"
          }
        ],
        "calculation": {
          "type": "fixedMonthDay",
          "month": 12,
          "day": 26
        },
        "condition": "always",
        "effect": {
          "type": "holiday",
          "kind": "cantonalPublicHoliday",
          "legalEffect": "nonWorkingDayEquivalentToSunday",
          "resultIdSuffix": "NW-PROCEDURAL-ALL-DAY-ST-STEPHEN"
        }
      }
    ],
    "projection": {
      "catalogId": "ch-holiday-catalog",
      "catalogFormatVersion": "2.0.0",
      "projectionId": "projection-ap23h2-nw-procedural-core",
      "sourceHash": "c5701e47df0d07bb288719b26d55c31b84fe83ea539578d9192e292e08602570"
    }
  }
] as const;
