import {adminStats,extendedMatches,extendedNotifications,routeStats} from "../data/extended";
import {demoRides,demoBookings,persistDemoRides,persistDemoBookings} from "../data/demo";
import {Booking,CheckIn,RidePreferences,TrustedContact,WaitlistEntry,User} from "../types";
import {currentUserForFeatures} from "./featureApiUser";
import {getCheckIns,saveCheckIns,getWaitlist,saveWaitlist,getTrustedContact,saveTrustedContact,getPreferences,savePreferences,getRideCode,getSharedImpact,addImpact} from "./demoFeatures";

const API=import.meta.env.VITE_API_URL||"http://localhost:5000/api";
const DEMO=(import.meta.env.VITE_DEMO_MODE??"true")==="true";
async function call<T>(path:string,options:RequestInit={}):Promise<T>{const token=localStorage.getItem("icbt_token");const r=await fetch(`${API}${path}`,{...options,headers:{"Content-Type":"application/json",...(token?{Authorization:`Bearer ${token}`}:{})}});if(!r.ok)throw new Error((await r.json().catch(()=>({}))).message||`Request failed (${r.status})`);return r.json()}
export async function getMatches(){if(DEMO){return demoRides.filter(r=>r.status==="open"&&r.seatsAvailable>0).map((ride,i)=>({ride,score:[92,87,79,68][i%4]||74,pickupMatch:i%3!==2,destinationMatch:true,timeMatch:i%4!==3,distance:1.4+i*1.7}))}return call("/matching/recommendations")}
export async function getNotifications(){
 if(DEMO){let user:User|null=null;try{const raw=localStorage.getItem("icbt_user");if(raw)user=JSON.parse(raw)}catch{}
  const canReceiveRideAlerts=!!user&&(user.rideRole==="passenger"||user.rideRole==="both")&&!user.isAdmin;
  const canReceiveDriverRequests=!!user&&(user.rideRole==="driver"||user.rideRole==="both")&&!user.isAdmin;
  let readIds:string[]=[];try{const raw=localStorage.getItem("icbt_read_notifications");if(raw)readIds=JSON.parse(raw)}catch{}
  const rideAlerts=canReceiveRideAlerts?demoRides.filter(r=>r.status==="open"&&r.seatsAvailable>0&&r.driver.id!==user!.id).map(r=>({id:`ride-available-${r.id}`,type:"ride_available",title:"New ride available for passengers",text:`${r.origin} → ${r.destination} · ${r.seatsAvailable} seat${r.seatsAvailable===1?"":"s"} available · Rs. ${r.price}. Available in your area.`,time:"Available now",unread:!readIds.includes(`ride-available-${r.id}`),rideId:r.id})):[];
  let promoted:any[]=[];try{const alerts=JSON.parse(localStorage.getItem("icbt_waitlist_alerts")||"[]");promoted=canReceiveRideAlerts?alerts.filter((a:any)=>a.passengerId===user!.id).map((a:any)=>({id:`waitlist-${a.id}`,type:"waitlist",title:"Seat available from waitlist",text:`A seat is now available for your ride. You are next in line.`,time:"Available now",unread:!readIds.includes(`waitlist-${a.id}`),rideId:a.rideId})):[]}catch{}
  const waitAlerts=canReceiveRideAlerts?getWaitlist().filter(w=>w.passenger.id===user!.id).map(w=>({id:`waitlist-${w.id}`,type:"waitlist",title:"Waitlist position confirmed",text:`You are #${w.position} on the waitlist for this ride.`,time:"Just now",unread:!readIds.includes(`waitlist-${w.id}`),rideId:w.rideId})):[];
  const allWaitAlerts=[...waitAlerts,...promoted];
  const base=extendedNotifications.filter((n:any)=>n.type!=="request"||canReceiveDriverRequests).map((n:any)=>({...n,unread:n.unread&&!readIds.includes(n.id)}));return [...rideAlerts,...allWaitAlerts,...base];
 }
 return call("/notifications")
}
export async function markNotificationRead(id:string){if(DEMO){try{const ids:string[]=JSON.parse(localStorage.getItem("icbt_read_notifications")||"[]");if(!ids.includes(id))ids.push(id);localStorage.setItem("icbt_read_notifications",JSON.stringify(ids))}catch{}return}await call(`/notifications/${id}/read`,{method:"POST"})}
export async function getAdminStats(){if(DEMO)return adminStats;return call("/admin/analytics")}
export async function getRouteStats(){if(DEMO)return routeStats;return call("/admin/analytics/routes")}
export async function updateRideStatus(id:string,status:string){if(DEMO){const r=demoRides.find(x=>x.id===id);if(r)r.status=status as any;return {id,status}}return call(`/rides/${id}/status`,{method:"PATCH",body:JSON.stringify({status})})}
export async function reviewJoinRequest(id:string,action:"accept"|"reject"){
 if(DEMO){
  const booking=demoBookings.find(b=>b.id===id); if(!booking)throw new Error("Booking request not found.");
  if(booking.status!=="requested")return {id,status:booking.status};
  const ride=demoRides.find(r=>r.id===booking.rideId); if(!ride)throw new Error("Ride not found.");
  if(action==="accept"){
   if(ride.seatsAvailable<bookingSeats(booking))throw new Error("Not enough seats are available for this request.");
   ride.seatsAvailable-=bookingSeats(booking);
   if(ride.seatsAvailable===0)ride.status="full";
   booking.status="confirmed";
  }else booking.status="rejected";
  persistDemoRides();persistDemoBookings();
  return {id,status:booking.status};
 }
 return call(`/bookings/${id}/${action}`,{method:"POST"});
} 
function bookingSeats(_booking:any){return 1}
export async function reportUser(userId:string,reason:string){if(DEMO)return {userId,reason,status:"submitted"};return call("/reports/users",{method:"POST",body:JSON.stringify({userId,reason})})}
export async function blockUser(userId:string){if(DEMO)return {userId,blocked:true};return call(`/users/${userId}/block`,{method:"POST"})}
export async function rateTrip(tripId:string,rating:number,review:string){if(DEMO)return {tripId,rating,review};return call("/ratings",{method:"POST",body:JSON.stringify({tripId,rating,review})})}
export async function calculateFuel(distanceKm:number,fuelEfficiency:number,fuelPrice:number,seats:number){const total=(distanceKm/fuelEfficiency)*fuelPrice;return {total,perPassenger:seats>0?total/seats:total,saved:seats>1?total-(total/seats):0}}

export async function checkInPassenger(rideId:string,booking:Booking,code:string):Promise<CheckIn>{
 const expected=getRideCode(rideId);if(code.trim()!==expected)throw new Error("Incorrect check-in code. Ask the driver for the 4-digit ride code.");
 const list=getCheckIns();if(list.some(x=>x.bookingId===booking.id))throw new Error("You are already checked in for this ride.");
 const item:CheckIn={bookingId:booking.id,rideId,passengerId:booking.passenger.id,passengerName:booking.passenger.name,checkedInAt:new Date().toISOString()};saveCheckIns([...list,item]);return item;
}
export function getRideCheckIns(rideId:string){return getCheckIns().filter(x=>x.rideId===rideId)}
export function getDriverRideCode(rideId:string){return getRideCode(rideId)}
export async function startRide(rideId:string){const r=demoRides.find(x=>x.id===rideId);if(r)r.status="started";return updateRideStatus(rideId,"started")}
export async function completeRide(rideId:string){const r=demoRides.find(x=>x.id===rideId);if(r){r.status="completed";addImpact(r.distanceKm||10,r.seats-r.seatsAvailable)}return updateRideStatus(rideId,"completed")}
export async function joinWaitlist(rideId:string,seats=1):Promise<WaitlistEntry>{
 const user=currentUserForFeatures();const list=getWaitlist();const existing=list.find(x=>x.rideId===rideId&&x.passenger.id===user.id);if(existing)throw new Error(`You are already #${existing.position} on the waitlist.`);
 const item:WaitlistEntry={id:crypto.randomUUID(),rideId,passenger:user,seats,createdAt:new Date().toISOString(),position:list.filter(x=>x.rideId===rideId).length+1};saveWaitlist([...list,item]);return item;
}
export function getRideWaitlist(rideId:string){return getWaitlist().filter(x=>x.rideId===rideId)}
export function removeWaitlist(id:string){saveWaitlist(getWaitlist().filter(x=>x.id!==id))}
export function getRidePreferences(rideId:string){return getPreferences(rideId)}
export function setRidePreferences(rideId:string,prefs:RidePreferences){savePreferences(rideId,prefs);return prefs}
export function getTrusted(){return getTrustedContact()}
export function saveTrusted(contact:TrustedContact){saveTrustedContact(contact);return contact}
export function getImpact(){return getSharedImpact()}
