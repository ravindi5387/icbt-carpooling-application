import {Booking,CreateRidePayload,DashboardStats,Message,Ride,RideFilters,User} from "../types";
import {demoBookings,demoMessages,demoRides,demoUser,persistDemoRides,persistDemoBookings} from "../data/demo";
import {getWaitlist,saveWaitlist} from "./demoFeatures";

const API_URL=import.meta.env.VITE_API_URL||"http://localhost:5000/api";
const DEMO=(import.meta.env.VITE_DEMO_MODE??"false")==="true";

function currentDemoUser():User{
  try{
    const raw=localStorage.getItem("icbt_user");
    if(raw)return JSON.parse(raw) as User;
  }catch{}
  return demoUser;
}

async function request<T>(path:string,options:RequestInit={}):Promise<T>{
  const token=localStorage.getItem("icbt_token");
  const res=await fetch(`${API_URL}${path}`,{
    ...options,
    headers:{"Content-Type":"application/json",...(token?{Authorization:`Bearer ${token}`}:{ }),...(options.headers||{})}
  });
  if(!res.ok){const body=await res.json().catch(()=>({}));throw new Error(body.message||`Request failed (${res.status})`)}
  if(res.status===204)return undefined as T;
  return res.json();
}

export async function login(identifier:string,password:string,accountType:"user"|"admin"="user"):Promise<{user:User;token:string}>{
  if(DEMO)return {user:{...demoUser,email:identifier},token:"demo-token"};
  return request("/auth/login",{method:"POST",body:JSON.stringify(accountType==="admin"?{username:identifier,password,accountType}:{email:identifier,password,accountType})});
}
export async function registerUser(name:string,email:string,password:string,role:string):Promise<{user:User;token:string}>{
  if(DEMO)return {user:{...demoUser,id:crypto.randomUUID(),name,email,role:(role === "staff" ? "staff" : "student"),rideRole:"both",totalTrips:0},token:"demo-token"};
  return request("/auth/register",{method:"POST",body:JSON.stringify({name,email,password,role})});
}
export async function getRides(filters:RideFilters):Promise<Ride[]>{
  if(DEMO){
    let list=demoRides.filter(r=>
      (!filters.origin||r.origin.toLowerCase().includes(filters.origin.toLowerCase()))&&
      (!filters.destination||r.destination.toLowerCase().includes(filters.destination.toLowerCase()))&&
      (!filters.date||r.date===filters.date)&&(!filters.time||r.time>=filters.time)&&
      (!filters.seats||r.seatsAvailable>=Number(filters.seats))&&
      (!filters.maxPrice||r.price<=Number(filters.maxPrice))
    );
    list=[...list].sort((a,b)=>filters.sort==="price"?a.price-b.price:filters.sort==="seats"?b.seatsAvailable-a.seatsAvailable:a.time.localeCompare(b.time));
    return list;
  }
  const q=new URLSearchParams();
  Object.entries(filters).forEach(([k,v])=>{if(v)q.set(k,v)});
  return request<Ride[]>(`/rides?${q}`);
}

export async function getRide(id:string):Promise<Ride>{
  if(DEMO){const r=demoRides.find(x=>x.id===id);if(!r)throw new Error("Ride not found.");return r;}
  return request<Ride>(`/rides/${id}`);
}
export async function getDriverRides():Promise<Ride[]>{
  if(DEMO){const u=currentDemoUser();return demoRides.filter(r=>r.driver.id===u.id);}
  return request<Ride[]>("/rides?driver=me");
}
export async function getDriverRideBookings(rideId:string):Promise<Booking[]>{
  if(DEMO)return demoBookings.filter(b=>b.rideId===rideId);
  return request<Booking[]>(`/bookings/driver/${rideId}`);
}
export async function getDriverRequests():Promise<Array<{id:string;rideId:string;name:string;email:string;phone?:string;seats:number;status:any;route:string}>>{
  if(DEMO)return [];
  return request("/bookings/driver");
}

export async function createRide(payload:CreateRidePayload):Promise<Ride>{
  if(DEMO){const ride:Ride={id:crypto.randomUUID(),driver:currentDemoUser(),...payload,seatsAvailable:payload.seats,status:"open"};demoRides.unshift(ride);persistDemoRides();return ride}
  return request<Ride>("/rides",{method:"POST",body:JSON.stringify(payload)});
}
export async function joinRide(rideId:string):Promise<Booking>{
  if(DEMO){
    const ride=demoRides.find(r=>r.id===rideId); if(!ride)throw new Error("Ride not found.");
    if(ride.status!=="open" || ride.seatsAvailable<1)throw new Error("No seats are available. You can join the waitlist instead.");
    const passenger=currentDemoUser();
    const existing=demoBookings.find(b=>b.rideId===rideId&&b.passenger.id===passenger.id&&b.status!=="cancelled");
    if(existing) return existing;
    // A request remains pending until the driver accepts it.
    const booking:Booking={id:crypto.randomUUID(),rideId,passenger,status:"requested",requestedAt:new Date().toISOString()};
    demoBookings.push(booking);persistDemoBookings();return booking;
  }
  return request<Booking>(`/rides/${rideId}/join`,{method:"POST"});
}
export async function getBookings():Promise<Booking[]>{
  if(DEMO)return demoBookings.filter(b=>b.passenger.id===currentDemoUser().id);
  return request<Booking[]>("/bookings/me");
}
export async function cancelBooking(id:string):Promise<void>{
  if(DEMO){const b=demoBookings.find(x=>x.id===id);if(b){
      if(b.status!=="cancelled"){
        const wasConfirmed=b.status==="confirmed";
        const ride=demoRides.find(r=>r.id===b.rideId);
        if(wasConfirmed&&ride){
          ride.seatsAvailable=Math.min(ride.seats,ride.seatsAvailable+1);
          if(ride.status==="full"&&ride.seatsAvailable>0)ride.status="open";
          const wait=getWaitlist().filter(w=>w.rideId===ride.id);
          if(wait.length){const next=wait[0];saveWaitlist(getWaitlist().filter(w=>w.id!==next.id));try{const alerts=JSON.parse(localStorage.getItem("icbt_waitlist_alerts")||"[]");alerts.push({id:next.id,passengerId:next.passenger.id,rideId:next.rideId});localStorage.setItem("icbt_waitlist_alerts",JSON.stringify(alerts))}catch{}}
        }
        b.status="cancelled";persistDemoRides();persistDemoBookings();
      }
    }return}
  await request(`/bookings/${id}`,{method:"DELETE"});
}
export async function getTripHistory():Promise<Booking[]>{
  if(DEMO)return demoBookings;
  return request<Booking[]>("/trips/history");
}
export async function getMessages(rideId:string):Promise<Message[]>{
  if(DEMO)return demoMessages.filter(m=>m.rideId===rideId);
  return request<Message[]>(`/messages?rideId=${rideId}`);
}
export async function sendMessage(rideId:string,text:string):Promise<Message>{
  if(DEMO){const sender=currentDemoUser(); const m:Message={id:crypto.randomUUID(),senderId:sender.id,senderName:sender.name,rideId,text,createdAt:new Date().toISOString()};demoMessages.push(m);return m}
  return request<Message>("/messages",{method:"POST",body:JSON.stringify({rideId,text})});
}
export async function getProfile():Promise<User>{
  if(DEMO)return currentDemoUser();
  return request<User>("/users/me");
}
export async function getDashboardStats():Promise<DashboardStats>{
  if(DEMO){const user=currentDemoUser();return {trips:user.totalTrips,availableRides:demoRides.filter(r=>r.status==="open").length,upcomingTime:demoRides.find(r=>r.status==="open")?.time||"—",seatsShared:demoRides.reduce((n,r)=>n+(r.seats-r.seatsAvailable),0)};}
  return request<DashboardStats>("/dashboard/stats");
}

export async function createRecurringRideSeries(payload:CreateRidePayload,days:string[],until:string):Promise<Ride[]>{
 if(!days.length) return [await createRide(payload)];
 if(DEMO){
  const start=new Date(`${payload.date}T12:00:00`), end=new Date(`${until}T12:00:00`);const out:Ride[]=[];const dayMap=["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
  for(let d=new Date(start);d<=end;d.setDate(d.getDate()+1)){if(days.includes(dayMap[d.getDay()])){const date=d.toISOString().slice(0,10);out.push(await createRide({...payload,date,recurring:true}))}}
  return out;
 }
 return request<Ride[]>("/rides/recurring",{method:"POST",body:JSON.stringify({payload,days,until})});
}
