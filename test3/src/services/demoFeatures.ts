import {CheckIn,Ride,User,WaitlistEntry,TrustedContact,RidePreferences} from "../types";

const read=<T,>(key:string,fallback:T):T=>{try{const raw=localStorage.getItem(key);return raw?JSON.parse(raw) as T:fallback}catch{return fallback}};
const write=(key:string,value:unknown)=>{try{localStorage.setItem(key,JSON.stringify(value))}catch{}}
export const getCheckIns=()=>read<CheckIn[]>("icbt_checkins",[]);
export const saveCheckIns=(x:CheckIn[])=>write("icbt_checkins",x);
export const getWaitlist=()=>read<WaitlistEntry[]>("icbt_waitlist",[]);
export const saveWaitlist=(x:WaitlistEntry[])=>write("icbt_waitlist",x);
export const getTrustedContact=()=>read<TrustedContact|null>("icbt_trusted_contact",null);
export const saveTrustedContact=(x:TrustedContact)=>write("icbt_trusted_contact",x);
export const getPreferences=(rideId:string):RidePreferences=>read<RidePreferences>(`icbt_preferences_${rideId}`,{music:"no",ac:"yes",smoking:"not_allowed",conversation:"normal",pets:"not_allowed"});
export const savePreferences=(rideId:string,x:RidePreferences)=>write(`icbt_preferences_${rideId}`,x);
export const getRideCode=(rideId:string)=>{const codes=read<Record<string,string>>("icbt_ride_codes",{});if(!codes[rideId]){codes[rideId]=String(Math.floor(1000+Math.random()*9000));write("icbt_ride_codes",codes)}return codes[rideId]};
export const setRideStatus=(ride:Ride,status:Ride["status"])=>(ride.status=status);
export const getSharedImpact=()=>read("icbt_impact",{sharedTrips:1284,fuelSaved:2410,moneySaved:8450,co2:5500,people:739});
export const addImpact=(distance:number,seats:number)=>{const x=getSharedImpact();const fuel=Math.max(0,(distance/12)*Math.max(0,seats-1));x.sharedTrips+=1;x.fuelSaved=Number((x.fuelSaved+fuel).toFixed(1));x.moneySaved=Math.round(x.moneySaved+fuel*340);x.co2=Math.round(x.co2+fuel*2.31);x.people+=Math.max(1,seats);write("icbt_impact",x);return x};
export function promoteWaitlist(ride:Ride){const list=getWaitlist().filter(x=>x.rideId===ride.id);if(!list.length)return null;const next=list[0];saveWaitlist(getWaitlist().filter(x=>x.id!==next.id));ride.seatsAvailable=Math.max(0,ride.seatsAvailable- Math.min(next.seats,ride.seatsAvailable));return next;}
