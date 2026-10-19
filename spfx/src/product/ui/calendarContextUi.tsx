// SPDX-License-Identifier: AGPL-3.0-only
import * as React from 'react';
import { Dropdown } from '@fluentui/react/lib/Dropdown';
import type { CalendarContext, BoundCalendarRuntime } from '../core/calendarResolution';
import { resolveBoundCalendar } from '../core/calendarResolution';
import type { Locale } from './i18n';
import { CALENDAR_CANTONS } from './model';
import { calendarCantonLabel, calendarText, type CalendarMessageKey } from './calendarMessages';
import { calculatorDropdownStyles } from './dropdownStyles';
import type { JanuaryComparison } from '../core/calculateCalendarBoundDeadline';

export const EMPTY_CALENDAR_CONTEXT: CalendarContext = {role:'',canton:'',areaFacts:{}};
export function isBoundCalendarProfile(profileId: string): boolean { return ['stpo','zpo','bgg','vwvg'].includes(profileId); }
export function contextForProfile(profileId: string, value?: CalendarContext): CalendarContext {
  const context=value??EMPTY_CALENDAR_CONTEXT;
  return profileId==='zpo'?{...context,role:'court'}:context;
}
/** UI-derived location only. The existing resolver still qualifies the legal binding.
 * CH is a government level, not a geographical court seat. Never infer its canton.
 * Call with an empty context on authority changes to discard previous case facts.
 */
export function effectiveCalendarContext(profileId: string, value?: CalendarContext, authorityCode?: string): CalendarContext {
  const context = value ?? EMPTY_CALENDAR_CONTEXT;
  if (profileId !== 'zpo') return context;
  if (authorityCode === undefined) return contextForProfile(profileId, context);
  const canton = CALENDAR_CANTONS.includes(authorityCode) ? authorityCode
    : authorityCode === 'CH' && context.role === 'court' && CALENDAR_CANTONS.includes(context.canton) ? context.canton : '';
  return { role: 'court', canton,
    areaFacts: context.role === 'court' && context.canton === canton ? { ...context.areaFacts } : {} };
}
export function calendarPlaceLabel(role: CalendarContext['role']): CalendarMessageKey {
  return role === 'court' ? 'courtCanton' : role === 'partyWithoutRepresentative' ? 'partyCanton'
    : role === 'qualifiedServiceRepresentative' ? 'representativeCanton' : 'unresolvedCanton';
}
function regionalLabel(context: CalendarContext): CalendarMessageKey {
  const region = context.canton === 'AI' ? 'AI' : 'NE';
  const role = context.role === 'court' ? 'Court' : context.role === 'partyWithoutRepresentative' ? 'Party'
    : context.role === 'qualifiedServiceRepresentative' ? 'Representative' : '';
  return `regional${role}${region}` as CalendarMessageKey;
}
export function changeCalendarPlace(context: CalendarContext,canton:string): CalendarContext {
  return {...context,canton,areaFacts:{}};
}
export function changeCalendarRole(context: CalendarContext,role:CalendarContext['role']): CalendarContext {
  return {...context,role,canton:'',areaFacts:{}};
}
export function regionalScope(canton: string): string | undefined {
  return canton==='AI'?'AI-RTG-INNER-ADDITIONAL':canton==='NE'?'NE-LANDERON-ADDITIONAL':undefined;
}

/** Emits complete two-column rows only. Known court seats require no duplicate field. */
export function CalendarContextFields({profileId,value,locale,onChange,authorityCode}: {
  readonly profileId:string;readonly value:CalendarContext;readonly locale:Locale;
  readonly authorityCode?:string;
  readonly onChange:(next:CalendarContext)=>void;
}): React.ReactElement {
  const context = effectiveCalendarContext(profileId, value, authorityCode);
  const scope=regionalScope(context.canton);
  const court = profileId === 'zpo';
  const derivedCourt = court && authorityCode !== undefined && CALENDAR_CANTONS.includes(authorityCode);
  const placeKnown = context.role === 'court' || context.role === 'partyWithoutRepresentative' || context.role === 'qualifiedServiceRepresentative';
  return <>
    {!court && <div><Dropdown required className="fr-holiday-connections" styles={calculatorDropdownStyles} label={calendarText(locale,'role')} placeholder={calendarText(locale,'select')} selectedKey={context.role}
        options={['','partyWithoutRepresentative','qualifiedServiceRepresentative','unresolvedMultiplePlaces'].map(key=>({key,text:calendarText(locale,(key||'select') as 'select'|'partyWithoutRepresentative'|'qualifiedServiceRepresentative'|'unresolvedMultiplePlaces')}))}
        onChange={(_event,option)=>{if(typeof option?.key==='string')onChange(changeCalendarRole(context,option.key as CalendarContext['role']));}} />
      {context.role === 'qualifiedServiceRepresentative' && <small>{calendarText(locale,'representationScope')}</small>}</div>}
    {!derivedCourt && <Dropdown required disabled={!placeKnown} className="fr-holiday-connections" styles={calculatorDropdownStyles} label={calendarText(locale,calendarPlaceLabel(context.role))} placeholder={calendarText(locale,'select')} selectedKey={context.canton}
      options={[{key:'',text:calendarText(locale,'select')},...CALENDAR_CANTONS.map(code=>({key:code,text:calendarCantonLabel(code,locale)}))]}
      onChange={(_event,option)=>{if(typeof option?.key==='string')onChange(changeCalendarPlace(context,option.key));}} />}
    {court && !derivedCourt && <div className="fr-grid-spacer" aria-hidden="true" />}
    {scope&&placeKnown&&<>
      <Dropdown styles={calculatorDropdownStyles} required label={calendarText(locale,regionalLabel(context))} placeholder={calendarText(locale,'select')}
        selectedKey={context.areaFacts[scope]===true?'yes':context.areaFacts[scope]===false?'no':''}
        options={[{key:'',text:calendarText(locale,'select')},{key:'yes',text:calendarText(locale,'yes')},{key:'no',text:calendarText(locale,'no')}]}
        onChange={(_event,option)=>{if(typeof option?.key==='string')onChange({...context,areaFacts:option.key===''?{}:{[scope]:option.key==='yes'}});}} />
      <div className="fr-grid-spacer" aria-hidden="true" />
    </>}
  </>;
}

export function CalendarContextTrace({profileId,context,runtime,locale,showTechnical=true}: {
  readonly profileId:string;readonly context:CalendarContext;readonly runtime:BoundCalendarRuntime;readonly locale:Locale;
  readonly showTechnical?:boolean;
}):React.ReactElement {
  const resolution=resolveBoundCalendar(profileId,context,runtime);
  const binding=resolution.binding;
  const evidence=new Map(runtime.catalog.activation.sourceEvidence.map(row=>[row.id,row]));
  return <div className="fr-trace__calendar" data-calendar-binding={binding?.id??''}>
    {context.role!=='court'&&<p>{calendarText(locale,'role')}: {context.role==='partyWithoutRepresentative'?calendarText(locale,'partyWithoutRepresentative'):context.role==='qualifiedServiceRepresentative'?calendarText(locale,'qualifiedServiceRepresentative'):calendarText(locale,'unresolvedMultiplePlaces')}</p>}
    <p>{calendarText(locale,calendarPlaceLabel(context.role))}: {context.canton?calendarCantonLabel(context.canton,locale):calendarText(locale,'select')}</p>
    {regionalScope(context.canton) && Object.hasOwn(context.areaFacts, regionalScope(context.canton)!) && <p>{calendarText(locale,regionalLabel(context))} {context.areaFacts[regionalScope(context.canton)!]===true?calendarText(locale,'yes'):context.areaFacts[regionalScope(context.canton)!]===false?calendarText(locale,'no'):calendarText(locale,'select')}</p>}
    {resolution.boundaryIds.map(id=><p key={id}>{calendarText(locale,id==='GR-BASE-ONLY'?'gr':'ne')}</p>)}
    {binding&&<><p>{calendarText(locale,'source')}</p><ul>{binding.sourceIds.map(id=>{
      const source=evidence.get(id);
      return source ? <li key={id}><a href={source.url} target="_blank" rel="noopener noreferrer">{source.title}</a>{source.locator?` · ${source.locator}`:''}</li> : null;
    })}</ul></>}
    {showTechnical&&<details><summary>{calendarText(locale,'technicalEvidence')}</summary>
      {binding&&<p>{calendarText(locale,'binding')}: <code>{binding.id}</code> · {calendarText(locale,'from')}: {binding.caseCoverage.from}</p>}
      {resolution.calendarId&&<p>{calendarText(locale,'projection')}: <code>{resolution.calendarId}</code></p>}
      <p>{calendarText(locale,'calendarData')}: <code>{runtime.releaseId}</code></p>
      <p>{calendarText(locale,'catalogHash')}: <code>{runtime.catalogSha256}</code></p>
      {Object.keys(context.areaFacts).length>0&&<p>{calendarText(locale,'facts')}: {Object.entries(context.areaFacts).map(([scope,member])=>`${scope}: ${member===true?calendarText(locale,'yes'):member===false?calendarText(locale,'no'):calendarText(locale,'select')}`).join(' · ')}</p>}
      {binding&&<p>{calendarText(locale,'source')}: {binding.sourceIds.map(id=><React.Fragment key={id}><code>{id}</code>{' '}</React.Fragment>)}</p>}
    </details>}
  </div>;
}

/** Comparative evidence only. These cells are never a result tile or an export input. */
export function JanuaryComparisonTrace({comparison,locale,showTechnical=true}: {
  readonly comparison:JanuaryComparison;readonly locale:Locale;
  readonly showTechnical?:boolean;
}):React.ReactElement {
  const date=(iso:string):string=>new Intl.DateTimeFormat(locale==='de'?'de-CH':'fr-CH',{
    day:'2-digit',month:'2-digit',year:'numeric',timeZone:'UTC'
  }).format(new Date(`${iso}T12:00:00Z`));
  return <section className="fr-trace__calendar" aria-label={calendarText(locale,'comparison')}>
    <h4>{calendarText(locale,'comparison')}</h4>
    <p>{calendarText(locale,comparison.outcome==='same'?'januarySame':comparison.outcome==='different'?'januaryDifferent':'januaryBlocked')}</p>
    {comparison.outcome!=='same'&&<p><strong>{calendarText(locale,'comparisonNotDefinitive')}</strong></p>}
    <div style={{overflowX:'auto'}}>
      <table className="fr-calendar-comparison" style={{borderCollapse:'collapse',width:'100%',textAlign:'left'}}>
        <thead><tr>{(['variant','relevantDate','deadlineStart','provisionalEnd','finalEnd'] as const).map(key=><th key={key} scope="col" style={{padding:'6px 10px 6px 0',verticalAlign:'top'}}>{calendarText(locale,key)}</th>)}</tr></thead>
        <tbody>{([
          ['withoutJanuary',comparison.withoutJanuary2],['withJanuary',comparison.withJanuary2]
        ] as const).map(([label,value])=><tr key={label}>
          <th scope="row" style={{padding:'6px 10px 6px 0',verticalAlign:'top'}}>{calendarText(locale,label)}</th>
          {value?(['legallyRelevantDate','deadlineStart','provisionalEnd','finalEnd'] as const).map(key=><td key={key} style={{padding:'6px 10px 6px 0',verticalAlign:'top',whiteSpace:'nowrap'}}>{date(value[key])}</td>)
            :<td colSpan={4} style={{padding:'6px 10px 6px 0'}}>{calendarText(locale,'notCovered')}</td>}
        </tr>)}</tbody>
      </table>
    </div>
    {showTechnical&&<details><summary>{calendarText(locale,'technicalEvidence')}</summary>
      <p>{calendarText(locale,'variedRule')}: {comparison.variedCatalogRuleIds.map(id=><code key={id}>{id}</code>)}</p>
    </details>}
  </section>;
}
