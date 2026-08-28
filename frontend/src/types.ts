export type Role = "student" | "staff";
export type RideRole = "driver" | "passenger" | "both";
export type RideStatus = "open" | "full" | "started" | "completed" | "cancelled";
export type BookingStatus = "requested" | "confirmed" | "rejected" | "cancelled";
export type VehicleType = "Car" | "Van" | "Three-Wheeler" | "Bike";

export interface User {
  id:string;
  name:string;
  email:string;
  role:Role;
  rideRole:RideRole;
  phone?:string;
  username?:string;
  isAdmin?:boolean;
  rating:number;
  totalTrips:number;
  verified?:boolean;
}
export interface Ride {
  id:string; driver:User; origin:string; destination:string; date:string; time:string;
  seats:number; seatsAvailable:number; price:number; vehicleType?:VehicleType; notes?:string;
  status:RideStatus; distanceKm?:number; recurring?:boolean; pickupZone?:PickupZone; preferences?:RidePreferences;
}
export interface Booking {id:string; rideId:string; passenger:User; status:BookingStatus; requestedAt:string;}
export interface Message {id:string; senderId:string; senderName:string; rideId:string; text:string; createdAt:string;}
export interface RideFilters {origin:string; destination:string; date:string; time:string; seats:string; maxPrice:string; sort:"time"|"price"|"seats";}
export interface CreateRidePayload {origin:string; destination:string; date:string; time:string; seats:number; price:number; vehicleType:VehicleType; notes:string; pickupZone?:PickupZone; preferences?:RidePreferences; recurring?:boolean;}
export interface DashboardStats {trips:number; availableRides:number; upcomingTime:string; seatsShared:number;}

export type PickupZone = "ICBT Main Gate" | "Nugegoda Junction" | "Maharagama" | "Kottawa" | "Dehiwala" | "Kaduwela" | "Custom Location";
export interface RidePreferences {
  music: "yes" | "no";
  ac: "yes" | "no";
  smoking: "allowed" | "not_allowed";
  conversation: "quiet" | "normal" | "social";
  pets: "allowed" | "not_allowed";
}
export interface RecurringRideOptions { days:string[]; until:string; }
export interface CheckIn { bookingId:string; rideId:string; passengerId:string; passengerName:string; checkedInAt:string; }
export interface WaitlistEntry { id:string; rideId:string; passenger:User; seats:number; createdAt:string; position:number; }
export interface TrustedContact { name:string; phone:string; email?:string; }
