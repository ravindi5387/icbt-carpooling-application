import { Booking, Message, Ride, User } from "../types";

export const demoUser:User = {
  id:"u1", name:"Mayurika Perera", email:"mayurika@student.icbt.lk", role:"student", rideRole:"both",
  phone:"0771234567", rating:4.8, totalTrips:24, verified:true
};
export const drivers:User[] = [
  {id:"u2",name:"Kasun Fernando",email:"kasun@student.icbt.lk",role:"student",rideRole:"driver",rating:4.9,totalTrips:41,verified:true},
  {id:"u3",name:"Nethmi Silva",email:"nethmi@student.icbt.lk",role:"student",rideRole:"driver",rating:4.7,totalTrips:19,verified:true},
  {id:"u4",name:"Dilan Jayasinghe",email:"dilan@icbt.lk",role:"staff",rideRole:"both",rating:5,totalTrips:63,verified:true}
];
const seedRides:Ride[] = [
  {id:"r1",driver:drivers[0],origin:"Nugegoda",destination:"ICBT Colombo Campus",date:"2026-08-25",time:"07:30",seats:4,seatsAvailable:2,price:150,vehicleType:"Car",notes:"Leaving on time. Please arrive five minutes early.",status:"open",distanceKm:8.4},
  {id:"r2",driver:drivers[1],origin:"Maharagama",destination:"ICBT Colombo Campus",date:"2026-08-25",time:"08:00",seats:3,seatsAvailable:1,price:120,vehicleType:"Van",notes:"Pickup near the main bus stop.",status:"open",distanceKm:10.2},
  {id:"r3",driver:drivers[2],origin:"Dehiwala",destination:"ICBT Colombo Campus",date:"2026-08-26",time:"07:15",seats:5,seatsAvailable:3,price:180,vehicleType:"Three-Wheeler",notes:"Comfortable car. AC available.",status:"open",distanceKm:6.8},
  {id:"r4",driver:drivers[0],origin:"Kottawa",destination:"ICBT Colombo Campus",date:"2026-08-26",time:"07:45",seats:4,seatsAvailable:0,price:160,vehicleType:"Bike",notes:"Ride is currently full.",status:"full",distanceKm:17.1}
];
export const demoRides:Ride[] = (()=>{
  try{const raw=localStorage.getItem("icbt_demo_rides");if(raw)return JSON.parse(raw) as Ride[]}catch{}
  return [...seedRides];
})();

export function persistDemoRides(){try{localStorage.setItem("icbt_demo_rides",JSON.stringify(demoRides))}catch{}}

export const demoPassengers:User[] = [
  {id:"u5",name:"Anushi Perera",email:"anushi@student.icbt.lk",role:"student",rideRole:"passenger",phone:"0712345678",rating:4.6,totalTrips:8,verified:true},
  {id:"u6",name:"Ravindi Perera",email:"ravindi@student.icbt.lk",role:"student",rideRole:"passenger",phone:"0723456789",rating:4.8,totalTrips:14,verified:true},
  {id:"u7",name:"Kasun Wijesinghe",email:"kasun.w@student.icbt.lk",role:"student",rideRole:"passenger",phone:"0756789012",rating:4.5,totalTrips:5,verified:true}
];
export const demoBookings:Booking[] = [
  {id:"b1",rideId:"r1",passenger:demoUser,status:"confirmed",requestedAt:"2026-08-24T16:00:00"},
  {id:"b2",rideId:"r2",passenger:demoUser,status:"requested",requestedAt:"2026-08-26T07:10:00"},
  {id:"b3",rideId:"r3",passenger:demoUser,status:"rejected",requestedAt:"2026-08-25T18:20:00"},
  {id:"b4",rideId:"r4",passenger:demoPassengers[2],status:"requested",requestedAt:"2026-08-26T06:50:00"}
];
export function persistDemoBookings(){try{localStorage.setItem("icbt_demo_bookings",JSON.stringify(demoBookings))}catch{}}

// Restore demo bookings when the browser session is reopened.
try{
 const raw=localStorage.getItem("icbt_demo_bookings");
 if(raw){
  const saved=JSON.parse(raw) as Booking[];
  const byId=new Map(saved.map(b=>[b.id,b]));
  demoBookings.forEach(seed=>{if(!byId.has(seed.id))byId.set(seed.id,seed)});
  demoBookings.splice(0,demoBookings.length,...byId.values());
 } else persistDemoBookings();
}catch{}

export const demoMessages:Message[] = [
  {id:"m1",senderId:"u2",senderName:"Kasun Fernando",rideId:"r1",text:"Hi! I can pick you up near Nugegoda junction.",createdAt:"2026-08-24T17:20:00"},
  {id:"m2",senderId:"u1",senderName:"Mayurika Perera",rideId:"r1",text:"Great, I will be there at 7:25 AM.",createdAt:"2026-08-24T17:22:00"}
];
