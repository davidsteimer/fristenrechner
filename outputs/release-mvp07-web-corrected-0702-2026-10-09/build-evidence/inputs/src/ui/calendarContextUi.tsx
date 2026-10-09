// SPDX-License-Identifier: AGPL-3.0-only
import * as React from 'react';
import { Dropdown } from '@fluentui/react/lib/Dropdown';
import { TextField } from '@fluentui/react/lib/TextField';
import type { CalendarContext, BoundCalendarRuntime } from '../core/calendarResolution';
import { resolveBoundCalendar } from '../core/calendarResolution';
import type { Locale } from './i18n';
import { CALENDAR_CANTONS } from './model';
import { calendarCantonLabel, calendarText } from './calendarMessages';
import { calculatorDropdownStyles } from './dropdownStyles';
import type { JanuaryComparison } from '../core/calculateCalendarBoundDeadline';

export const EMPTY_CALENDAR_CONTEXT: CalendarContext = {role:'',canton:'',areaFacts:{}};
export function isBoundCalendarProfile(profileId: string): boolean { return ['stpo','zpo','bgg','vwvg'].includes(profileId); }
export function contextForProfile(profileId: string, value?: CalendarContext): CalendarContext {
  const context=value??EMPTY_CALENDAR_CONTEXT;
  return profileId==='zpo'?{...context,role:'court'}:context;
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

/** Emits grid children only. Role/place always occupy one complete two-column row. */
export function CalendarContextFields({profileId,value,locale,onChange}: {
  readonly profileId:string;readonly value:CalendarContext;readonly locale:Locale;
  readonly onChange:(next:CalendarContext)=>void;
}): React.ReactElement {
  const scope=regionalScope(value.canton);
  return <>
    {profileId==='zpo'
      ? <TextField readOnly label={calendarText(locale,'role')} value={calendarText(locale,'court')} />
      : <Dropdown required className="fr-holiday-connections" styles={calculatorDropdownStyles} label={calendarText(locale,'role')} selectedKey={value.role}
        options={['','partyWithoutRepresentative','qualifiedServiceRepresentative','unresolvedMultiplePlaces'].map(key=>({key,text:calendarText(locale,(key||'select') as 'select'|'partyWithoutRepresentative'|'qualifiedServiceRepresentative'|'unresolvedMultiplePlaces')}))}
        onChange={(_event,option)=>{if(typeof option?.key==='string')onChange(changeCalendarRole(value,option.key as CalendarContext['role']));}} />}
    <Dropdown required className="fr-holiday-connections" styles={calculatorDropdownStyles} label={calendarText(locale,'canton')} selectedKey={value.canton}
      options={[{key:'',text:calendarText(locale,'select')},...CALENDAR_CANTONS.map(code=>({key:code,text:calendarCantonLabel(code,locale)}))]}
      onChange={(_event,option)=>{if(typeof option?.key==='string')onChange(changeCalendarPlace(value,option.key));}} />
    {scope&&<>
      <Dropdown styles={calculatorDropdownStyles} required label={calendarText(locale,value.canton==='AI'?'regionalAI':'regionalNE')}
        selectedKey={value.areaFacts[scope]===true?'yes':value.areaFacts[scope]===false?'no':''}
        options={[{key:'',text:calendarText(locale,'select')},{key:'yes',text:calendarText(locale,'yes')},{key:'no',text:calendarText(locale,'no')}]}
        onChange={(_event,option)=>{if(typeof option?.key==='string')onChange({...value,areaFacts:option.key===''?{}:{[scope]:option.key==='yes'}});}} />
      <div className="fr-grid-spacer" aria-hidden="true" />
    </>}
  </>;
}

export function CalendarContextTrace({profileId,context,runtime,locale}: {
  readonly profileId:string;readonly context:CalendarContext;readonly runtime:BoundCalendarRuntime;readonly locale:Locale;
}):React.ReactElement {
  const resolution=resolveBoundCalendar(profileId,context,runtime);
  const binding=resolution.binding;
  const evidence=new Map(runtime.catalog.activation.sourceEvidence.map(row=>[row.id,row]));
  return <div className="fr-trace__calendar" data-calendar-binding={binding?.id??''}>
    <p>{calendarText(locale,'role')}: {context.role==='court'?calendarText(locale,'court'):context.role==='partyWithoutRepresentative'?calendarText(locale,'partyWithoutRepresentative'):context.role==='qualifiedServiceRepresentative'?calendarText(locale,'qualifiedServiceRepresentative'):calendarText(locale,'unresolvedMultiplePlaces')}</p>
    <p>{calendarText(locale,'canton')}: {context.canton?calendarCantonLabel(context.canton,locale):calendarText(locale,'select')}</p>
    {binding&&<p>{calendarText(locale,'binding')}: <code>{binding.id}</code> · {calendarText(locale,'from')}: {binding.caseCoverage.from}</p>}
    {resolution.calendarId&&<p>{calendarText(locale,'projection')}: <code>{resolution.calendarId}</code></p>}
    <p>{calendarText(locale,'calendarData')}: <code>{runtime.releaseId}</code></p>
    <p>{calendarText(locale,'catalogHash')}: <code>{runtime.catalogSha256}</code></p>
    {Object.keys(context.areaFacts).length>0&&<p>{calendarText(locale,'facts')}: {Object.entries(context.areaFacts).map(([scope,member])=>`${scope}: ${member===true?calendarText(locale,'yes'):member===false?calendarText(locale,'no'):calendarText(locale,'select')}`).join(' · ')}</p>}
    {resolution.boundaryIds.map(id=><p key={id}>{calendarText(locale,id==='GR-BASE-ONLY'?'gr':'ne')}</p>)}
    {binding&&<><p>{calendarText(locale,'source')}</p><ul>{binding.sourceIds.map(id=>{
      const source=evidence.get(id);
      return <li key={id}>{source?<><a href={source.url} target="_blank" rel="noopener noreferrer">{source.title}</a>{source.locator?` · ${source.locator}`:''}</>:id}</li>;
    })}</ul></>}
  </div>;
}

/** Comparative evidence only. These cells are never a result tile or an export input. */
export function JanuaryComparisonTrace({comparison,locale}: {
  readonly comparison:JanuaryComparison;readonly locale:Locale;
}):React.ReactElement {
  const date=(iso:string):string=>new Intl.DateTimeFormat(locale==='de'?'de-CH':'fr-CH',{
    day:'2-digit',month:'2-digit',year:'numeric',timeZone:'UTC'
  }).format(new Date(`${iso}T12:00:00Z`));
  return <section className="fr-trace__calendar" aria-label={calendarText(locale,'comparison')}>
    <h4>{calendarText(locale,'comparison')}</h4>
    <p>{calendarText(locale,comparison.outcome==='same'?'januarySame':comparison.outcome==='different'?'januaryDifferent':'januaryBlocked')}</p>
    {comparison.outcome!=='same'&&<p><strong>{calendarText(locale,'comparisonNotDefinitive')}</strong></p>}
    <p>{calendarText(locale,'variedRule')}: {comparison.variedCatalogRuleIds.map(id=><code key={id}>{id}</code>)}</p>
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
  </section>;
}
