import {ArrowRight,CalendarDays,Clock3,Star,Users,CarFront,BusFront,CarTaxiFront,Bike} from "lucide-react";
import {Link} from "react-router-dom";
import {Ride} from "../types";
export default function RideCard({ride}:{ride:Ride}){
 return <article className="ride-card">
  <div className="ride-card-top"><div className="driver"><div className="avatar large">{ride.driver.name[0]}</div><div><strong>{ride.driver.name}</strong><span><Star size={12} fill="currentColor"/> {ride.driver.rating.toFixed(1)} · {ride.driver.totalTrips} trips</span></div></div><span className={`status status-${ride.status}`}>{ride.status==="open"?`${ride.seatsAvailable} seats left`:ride.status}</span></div>
  <div className="route"><div className="route-point"><span className="route-dot"/><div><small>FROM</small><strong>{ride.origin}</strong></div></div><ArrowRight className="route-arrow" size={17}/><div className="route-point"><span className="route-dot destination"/><div><small>TO</small><strong>{ride.destination}</strong></div></div></div>
  <div className="ride-meta"><span><CalendarDays size={15}/>{new Date(ride.date).toLocaleDateString("en-GB",{day:"2-digit",month:"short"})}</span><span><Clock3 size={15}/>{ride.time}</span><span><Users size={15}/>{ride.seatsAvailable}/{ride.seats}</span><span className="vehicle-chip">{ride.vehicleType==="Van"?<BusFront size={14}/>:ride.vehicleType==="Three-Wheeler"?<CarTaxiFront size={14}/>:ride.vehicleType==="Bike"?<Bike size={14}/>:<CarFront size={14}/>} {ride.vehicleType||"Car"}</span></div>
  <div className="ride-card-footer"><div><small>CONTRIBUTION</small><strong>Rs. {ride.price.toLocaleString()}</strong></div><Link className="button button-outline" to={`/rides/${ride.id}`}>View ride</Link></div>
 </article>
}
