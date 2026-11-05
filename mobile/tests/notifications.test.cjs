const test=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),ts=require('typescript'),{readFileSync}=require('node:fs');
function harness(platform='android',granted=true){
 const calls=[];const notifications={AndroidImportance:{DEFAULT:3},AndroidNotificationVisibility:{PRIVATE:0},SchedulableTriggerInputTypes:{DATE:'date'},setNotificationChannelAsync:async()=>calls.push('channel'),requestPermissionsAsync:async()=>({granted,canAskAgain:true}),getAllScheduledNotificationsAsync:async()=>[],scheduleNotificationAsync:async value=>{calls.push(value);return'SYN-ID';}};
 const c={exports:{},Intl,Date,Error,require:name=>name==='react-native'?{Platform:{OS:platform}}:notifications};
 vm.runInNewContext(ts.transpileModule(readFileSync('src/lib/notifications.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,c);
 return{api:c.exports,calls};
}
test('permissions use native channel and denial/browser cannot schedule notifications',async()=>{
 const h=harness();await h.api.allowReminders();assert.equal(h.calls[0],'channel');
 await assert.rejects(()=>harness('web').api.allowReminders(),/installed phone/);
 await assert.rejects(()=>harness('android',false).api.allowReminders(),/declined/);
});
test('reminders use verified active schedules and never invent timing or timezone conversions',()=>{
 const h=harness(),now=new Date(2026,9,21,9,0),schedule={id:'SYN-S',status:'ACTIVE',timezone:Intl.DateTimeFormat().resolvedOptions().timeZone,start_date:'2026-10-21',end_date:'2026-10-21',schedule_data:{times:['10:00','08:00']}};
 const med={id:'SYN-M',verification_status:'VERIFIED',schedules:[schedule]};
 const dates=h.api.upcomingReminderTimes([med],now);assert.equal(dates.length,1);assert.equal(dates[0].getHours(),10);
 assert.equal(h.api.upcomingReminderTimes([{...med,verification_status:'PENDING'}],now).length,0);
 assert.throws(()=>h.api.upcomingReminderTimes([{...med,schedules:[{...schedule,timezone:'Invalid/SYN'}]}],now),/different timezone/);
 assert.throws(()=>h.api.upcomingReminderTimes([{...med,schedules:[{...schedule,schedule_data:{times:['25:00']}}]}],now),/invalid time/);
});
