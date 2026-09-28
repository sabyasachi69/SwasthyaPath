export type TriageOption=string|{value:string;label_en:string;label_or:string};
export type Protocol={id:string;version:string;expires_at:string;questions:{key:string;wording_en:string;wording_or:string;options:TriageOption[];red_flag:boolean;position:number}[];rules:{conditions:Record<string,string>;disposition:'emergency'|'urgent'|'routine';capability_codes:string[];explanation_codes:string[];priority:number}[];explanations?:Record<string,{en:string;or:string}>};
export function optionValue(option:TriageOption){return typeof option==='string'?option:option.value;}
export function evaluate(protocol:Protocol,answers:Record<string,string>,now=Date.now()){
 if(!protocol.expires_at||!Number.isFinite(Date.parse(protocol.expires_at))||Date.parse(protocol.expires_at)<=now)throw Error('PROTOCOL_EXPIRED');
 for(const [key,value] of Object.entries(answers)){const q=protocol.questions.find(q=>q.key===key);if(!q||!Array.isArray(q.options)||!q.options.some(option=>optionValue(option)===value))throw Error('INVALID_ANSWER');}
 const matching=protocol.rules.filter(r=>Object.keys(r.conditions).length>0&&Object.entries(r.conditions).every(([k,v])=>answers[k]===v));
 const severity={emergency:3,urgent:2,routine:1};matching.sort((a,b)=>severity[b.disposition]-severity[a.disposition]||b.priority-a.priority);
 if(matching[0]?.disposition==='emergency')return matching[0];
 if(protocol.questions.some(q=>answers[q.key]===undefined))throw Error('INCOMPLETE_ANSWERS');
 if(!matching.length)throw Error('NO_APPROVED_MATCH');return matching[0];
}
