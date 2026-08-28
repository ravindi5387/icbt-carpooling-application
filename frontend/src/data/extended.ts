import {demoRides, demoUser, drivers} from "./demo";
import {User, Ride} from "../types";

export const adminUser:User={id:"admin1",name:"System Administrator",email:"admin@icbt.lk",role:"staff",rideRole:"both",rating:5,totalTrips:0,verified:true,isAdmin:true,username:"icbt.admin"};

export const extendedNotifications=[
 {id:"n1",type:"match",title:"92% ride match found",text:"A Nugegoda → ICBT ride matches your saved route.",time:"5 min ago",unread:true},
 {id:"n2",type:"request",title:"Join request accepted",text:"Kasun confirmed your seat for tomorrow.",time:"1 hour ago",unread:true},
 {id:"n3",type:"reminder",title:"Ride reminder",text:"Your ride departs tomorrow at 07:30.",time:"Yesterday",unread:false},
 {id:"n4",type:"message",title:"New message",text:"Nethmi sent you a message.",time:"Yesterday",unread:false}
];

export const extendedMatches=demoRides.map((r,i)=>({
 ride:r,
 score:[92,87,79,68][i]||74,
 pickupMatch:i<2,
 destinationMatch:true,
 timeMatch:i!==3,
 distance:i===0?1.4:i===1?2.8:i===2?3.6:6.9
}));

export const vehicleTypes=["Car","Van","Three-Wheeler","Bike"] as const;
export const savedRoutes=[
 {id:"s1",name:"Home → ICBT",origin:"Nugegoda",destination:"ICBT Colombo Campus",time:"07:30"},
 {id:"s2",name:"Maharagama → ICBT",origin:"Maharagama",destination:"ICBT Colombo Campus",time:"08:00"}
];

export const adminStats={
 totalUsers:486,activeUsers:312,totalRides:1284,completedRides:1117,cancelledRides:86,
 totalPassengers:739,avgRating:4.72,monthlyFuelSaved:2840
};

export const routeStats=[
 {route:"Nugegoda → ICBT",rides:286,share:22},
 {route:"Maharagama → ICBT",rides:221,share:17},
 {route:"Dehiwala → ICBT",rides:194,share:15},
 {route:"Kottawa → ICBT",rides:151,share:12},
 {route:"Other routes",rides:432,share:34}
];

export const reportedUsers=[
 {id:"rp1",name:"Demo User A",reason:"Inappropriate message",status:"Pending"},
 {id:"rp2",name:"Demo User B",reason:"Ride cancellation pattern",status:"Reviewing"}
];

export const myPostedRides=demoRides.filter(r=>r.driver.id===drivers[0].id);
export const passengerBookings=demoRides.slice(0,2);
