import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import type { Medication } from './care';
import { getStoredToken } from './api';

export async function reminderPermissionStatus(){
  if(Platform.OS==='web')return 'Phone app only';
  const result=await Notifications.getPermissionsAsync();
  return result.granted?'Allowed':result.canAskAgain?'Not allowed':'Blocked in phone settings';
}

export async function allowReminders(){
  if(Platform.OS==='web')throw new Error('Medication notifications require the installed phone app.');
  if(Platform.OS==='android')await Notifications.setNotificationChannelAsync('care-reminders',{name:'Care reminders',importance:Notifications.AndroidImportance.DEFAULT,lockscreenVisibility:Notifications.AndroidNotificationVisibility.PRIVATE});
  const result=await Notifications.requestPermissionsAsync();
  if(!result.granted)throw new Error(result.canAskAgain?'Notifications declined. Your records remain available.':'Notifications blocked. Enable them in phone settings if you wish.');
  return result;
}

export function upcomingReminderTimes(medications:Medication[],now=new Date()):Date[]{
  const zone=Intl.DateTimeFormat().resolvedOptions().timeZone;
  const result:Date[]=[];
  for(const medication of medications){
    if(medication.verification_status!=='VERIFIED')continue;
    for(const schedule of medication.schedules??[]){
      if(schedule.status!=='ACTIVE')continue;
      if(schedule.timezone!==zone)throw new Error('A medicine schedule uses a different timezone. Review it with your healthcare worker before enabling device reminders.');
      for(let offset=0;offset<2;offset++){
        const day=new Date(now);day.setDate(day.getDate()+offset);
        const key=`${day.getFullYear()}-${String(day.getMonth()+1).padStart(2,'0')}-${String(day.getDate()).padStart(2,'0')}`;
        if(key<schedule.start_date||(schedule.end_date&&key>schedule.end_date))continue;
        for(const time of schedule.schedule_data.times){
          if(!/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(time))throw new Error('A saved schedule has an invalid time. Ask your healthcare worker to review it.');
          const [hour,minute]=time.split(':').map(Number),date=new Date(day);date.setHours(hour,minute,0,0);
          if(date>now)result.push(date);
        }
      }
    }
  }
  return [...new Map(result.map(date=>[date.getTime(),date])).values()].sort((a,b)=>a.getTime()-b.getTime());
}

export async function scheduleCareReminders(medications:Medication[]){
  const session=await getStoredToken();
  if(!session)throw new Error('Sign in before enabling reminders.');
  const dates=upcomingReminderTimes(medications);
  if(!dates.length)throw new Error('No upcoming verified medication schedules for today or tomorrow. No reminders were created.');
  if(dates.length>32)throw new Error('Too many reminder times. Review the saved schedules first.');
  await allowReminders();
  const previous=await Notifications.getAllScheduledNotificationsAsync();
  for(const item of previous)if(item.content.data?.medguideCare)await Notifications.cancelScheduledNotificationAsync(item.identifier);
  const created:string[]=[];
  try{
    for(const date of dates){
      if(await getStoredToken()!==session)throw new Error('Account changed.');
      created.push(await Notifications.scheduleNotificationAsync({content:{title:'MedGuide care reminder',body:'Open your care records and follow your verified prescription.',data:{medguideCare:true}},trigger:{type:Notifications.SchedulableTriggerInputTypes.DATE,date,channelId:'care-reminders'}}));
    }
    if(await getStoredToken()!==session)throw new Error('Account changed.');
    return created.length;
  }catch{
    await Promise.all(created.map(id=>Notifications.cancelScheduledNotificationAsync(id)));
    throw new Error('Reminders could not be scheduled. Open your care records to retry.');
  }
}
