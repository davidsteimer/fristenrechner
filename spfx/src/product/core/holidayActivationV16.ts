// SPDX-License-Identifier: AGPL-3.0-only
// Native closed DEC-2026-041 projection contract. Old validators are unchanged.
import schema from '../../schemas/implementation/ap22c1/holiday-catalog-v2.schema.json';
import {assertSchema} from './schemaContract';
import {HolidayCatalogError} from './holidayCatalog';
import {canonicalSocialJson,socialObjectSha256} from './socialCatalog';
import {FORMAT16_HOLIDAY_NATIVE_SHA256,FORMAT16_CALENDAR_TEMPLATES} from './format16Baseline';
import type {HolidayCatalogV2} from './holidayActivationTypes';
import type {CalendarRuleSet} from './calendarRuleTypes';
const fail=(m:string):never=>{throw new HolidayCatalogError('holidayCatalog.invalidActivation',m);};
export function assertHolidayCatalogV16(value:unknown):asserts value is HolidayCatalogV2 {
 assertSchema(value,schema);const c=value as HolidayCatalogV2,a=c.activation;
 const{releaseEligibility:_permission,...content}=a;
 if(socialObjectSha256({...c,activation:content})!==FORMAT16_HOLIDAY_NATIVE_SHA256)fail('Changed closed native Format-16 holiday definitions or evidence');
 if(c.data.rules.length!==479||a.supplementalRules.length!==20||a.projections.length!==35||a.procedureBindings.length!==104||a.sourceEvidence.length!==159)fail('Incomplete native holiday inventory');
 if(new Set(a.projections.map(p=>p.id)).size!==35||new Set(a.projections.map(p=>p.calendarId)).size!==35)fail('Duplicate native projection');
}
export function projectActivatedCalendarsV16(c:HolidayCatalogV2,hash:string,_legacy:readonly CalendarRuleSet[]=[]):readonly CalendarRuleSet[]{
 assertHolidayCatalogV16(c);if(!/^[a-f0-9]{64}$/.test(hash))fail('Invalid actual catalog hash');
 return FORMAT16_CALENDAR_TEMPLATES.map(template=>({...JSON.parse(JSON.stringify(template)),projection:{...template.projection,sourceHash:hash}})) as unknown as readonly CalendarRuleSet[];
}
export function assertActivatedCalendarProjectionV16(c:HolidayCatalogV2,hash:string,calendars:readonly CalendarRuleSet[],legacy:readonly CalendarRuleSet[]=[]):void{
 const expected=projectActivatedCalendarsV16(c,hash,legacy),actual=new Map(calendars.map(x=>[x.calendarId,x]));
 if(actual.size!==calendars.length||actual.size!==expected.length)fail('Native calendar inventory');
 for(const e of expected)if(canonicalSocialJson(actual.get(e.calendarId))!==canonicalSocialJson(e))fail('Changed native calendar projection '+e.calendarId);
}
export function isHolidayActivationReleasedV16(c:HolidayCatalogV2,id:string):boolean{assertHolidayCatalogV16(c);return c.activation.contractDecision.status==='approved'&&c.activation.releaseEligibility.status==='approved'&&c.activation.releaseEligibility.releaseId===id&&c.activation.releaseEligibility.approval!==null;}
