// SPDX-License-Identifier: AGPL-3.0-only
// Local AP22C2 reference runtime only. Not imported by public or SPFx entry points.
import type { BoundCalendarRuntime } from '../core/calendarResolution';
import type { HolidayCatalogV2 } from '../core/holidayActivationTypes';
import type { CalendarRuleSet } from '../core/calendarRuleTypes';
import catalog from '../../outputs/ap22c1-2026-10-08/holiday-catalogs/ch-holiday-catalog.json';
import calendar0 from '../../outputs/ap22c1-2026-10-08/calendars/ap22-ag-21d6f2634ce0.json';
import calendar1 from '../../outputs/ap22c1-2026-10-08/calendars/ap22-ai-5d4e5a68e106.json';
import calendar2 from '../../outputs/ap22c1-2026-10-08/calendars/ap22-ai-f507435d8aa8.json';
import calendar3 from '../../outputs/ap22c1-2026-10-08/calendars/ap22-ar-88bb22c08a22.json';
import calendar4 from '../../outputs/ap22c1-2026-10-08/calendars/ap22-bl-72f1a7e0fcf8.json';
import calendar5 from '../../outputs/ap22c1-2026-10-08/calendars/ap22-bs-39a64bdfc0fe.json';
import calendar6 from '../../outputs/ap22c1-2026-10-08/calendars/ap22-fr-7d8c38f7c610.json';
import calendar7 from '../../outputs/ap22c1-2026-10-08/calendars/ap22-ge-a36ff7926d08.json';
import calendar8 from '../../outputs/ap22c1-2026-10-08/calendars/ap22-gl-87c11e156541.json';
import calendar9 from '../../outputs/ap22c1-2026-10-08/calendars/ap22-gr-bf0366c8eda2.json';
import calendar10 from '../../outputs/ap22c1-2026-10-08/calendars/ap22-ju-b096c09f506c.json';
import calendar11 from '../../outputs/ap22c1-2026-10-08/calendars/ap22-lu-55514cd91f06.json';
import calendar12 from '../../outputs/ap22c1-2026-10-08/calendars/ap22-lu-b879eb8eb04f.json';
import calendar13 from '../../outputs/ap22c1-2026-10-08/calendars/ap22-ne-027ceadbf103.json';
import calendar14 from '../../outputs/ap22c1-2026-10-08/calendars/ap22-ne-21f519039621.json';
import calendar15 from '../../outputs/ap22c1-2026-10-08/calendars/ap22-nw-5dfca484e4af.json';
import calendar16 from '../../outputs/ap22c1-2026-10-08/calendars/ap22-ow-76c151dccf1f.json';
import calendar17 from '../../outputs/ap22c1-2026-10-08/calendars/ap22-sg-79009d6d6021.json';
import calendar18 from '../../outputs/ap22c1-2026-10-08/calendars/ap22-sg-f95068e3b162.json';
import calendar19 from '../../outputs/ap22c1-2026-10-08/calendars/ap22-sh-1ccc70f9897a.json';
import calendar20 from '../../outputs/ap22c1-2026-10-08/calendars/ap22-sh-ec7d0988145a.json';
import calendar21 from '../../outputs/ap22c1-2026-10-08/calendars/ap22-so-3f5f7b7f54f5.json';
import calendar22 from '../../outputs/ap22c1-2026-10-08/calendars/ap22-sz-ec9f2c557fe4.json';
import calendar23 from '../../outputs/ap22c1-2026-10-08/calendars/ap22-tg-3d6514fbabb1.json';
import calendar24 from '../../outputs/ap22c1-2026-10-08/calendars/ap22-ti-944ed0286e9a.json';
import calendar25 from '../../outputs/ap22c1-2026-10-08/calendars/ap22-ur-67275ff3e872.json';
import calendar26 from '../../outputs/ap22c1-2026-10-08/calendars/ap22-vd-26f452ff34ee.json';
import calendar27 from '../../outputs/ap22c1-2026-10-08/calendars/ap22-vs-6c002f32b1b0.json';
import calendar28 from '../../outputs/ap22c1-2026-10-08/calendars/ap22-zg-860e0f8e0e1a.json';
import calendar29 from '../../outputs/ap22c1-2026-10-08/calendars/ap22-zh-5aa2974cffee.json';
import calendar30 from '../../outputs/ap22c1-2026-10-08/calendars/be-public-holidays.json';
import calendar31 from '../../outputs/ap22c1-2026-10-08/calendars/ch-federal-calendar.json';

export const ap22c2CalendarRuntime: BoundCalendarRuntime = {
  catalog: catalog as unknown as HolidayCatalogV2,
  calendars: [calendar0, calendar1, calendar2, calendar3, calendar4, calendar5, calendar6, calendar7, calendar8, calendar9, calendar10, calendar11, calendar12, calendar13, calendar14, calendar15, calendar16, calendar17, calendar18, calendar19, calendar20, calendar21, calendar22, calendar23, calendar24, calendar25, calendar26, calendar27, calendar28, calendar29, calendar30, calendar31] as unknown as readonly CalendarRuleSet[],
  catalogSha256: 'e6ed02029f4fc6df1bee6648aeae9d6975ec2c7218458f257db50680b581db81',
  releaseId: '2026-10-08-ap22c2-candidate.1',
  referenceOnly: true
};
