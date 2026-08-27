import {ArrowRight,Car,Clock3,Plus,Search,ShieldCheck,TrendingUp,Users} from "lucide-react";
import {Link} from "react-router-dom";
import {useEffect,useState} from "react";
import {getDashboardStats,getRides} from "../services/api";
import {demoRides} from "../data/demo";
import {DashboardStats,Ride} from "../types";
import {useAuth} from "../context/AuthContext";
import RideCard from "../components/RideCard";
import {Loading,ErrorState} from "../components/State";

export default function Dashboard(){
 const {user}=useAuth(); const [stats,setStats]=useState<DashboardStats|null>(null); const [rides,setRides]=useState<Ride[]>([]); const [error,setError]=useState("");
 const canDrive=user?.rideRole==="driver"||user?.rideRole==="both"; const canPassenger=user?.rideRole==="passenger"||user?.rideRole==="both";
 const myPostedRides=user?demoRides.filter(r=>r.driver.id===user.id && (r.status==="open"||r.status==="started"||r.status==="full")):[];
 useEffect(()=>{Promise.all([getDashboardStats(),getRides({origin:"",destination:"",date:"",time:"",seats:"",maxPrice:"",sort:"time"})]).then(([s,r])=>{setStats(s);setRides(r.slice(0,2))}).catch(e=>setError(e.message))},[]);
 if(error)return <div className="page"><ErrorState message={error}/></div>;
 return <div className="page">
  <div className="page-heading"><div><span className="eyebrow">{user?.isAdmin?"ADMINISTRATOR":"PERSONAL DASHBOARD"}</span><h1>Good evening, {user?.name.split(" ")[0]}.</h1><p>{user?.isAdmin?"Manage the ICBT Carpool platform from the administrator console.":"Here’s what’s happening with your shared journeys."}</p></div>
   <div className="dashboard-role-badge">{user?.isAdmin?"Administrator":user?.rideRole==="both"?"Driver + Passenger":user?.rideRole}</div>
  </div>
  {!stats?<Loading label="Loading dashboard"/>:<>
   <div className="stat-grid"><Stat icon={<Car/>} label="Your trips" value={stats.trips.toString()} hint="Total completed journeys"/><Stat icon={<Users/>} label="Available rides" value={stats.availableRides.toString()} hint="Open matching rides"/><Stat icon={<Clock3/>} label="Next ride" value={stats.upcomingTime} hint="Upcoming departure"/><Stat icon={<TrendingUp/>} label="Seats shared" value={stats.seatsShared.toString()} hint="Community activity"/></div>
   <div className="dashboard-grid">
    <section className="panel"><div className="panel-heading"><div><span className="eyebrow">{canDrive?"DRIVER ACTIVITY":"RECOMMENDED"}</span><h2>{canDrive?"Your driving overview":"Rides that may fit you"}</h2></div>{canPassenger&&!canDrive&&<Link to="/rides" className="inline-link">View all <ArrowRight size={14}/></Link>}{canDrive&&<Link to="/driver" className="inline-link">Driver console <ArrowRight size={14}/></Link>}</div>
     {canDrive ? (myPostedRides.length ? <div className="ride-list dashboard-posted-rides">{myPostedRides.slice(0,3).map(r=><RideCard key={r.id} ride={r}/>)}</div> : <div className="role-empty"><div className="role-empty-icon"><Car/></div><h3>Ready to offer your next ride?</h3><p>Create a carpool offer and your published ride will appear here.</p><Link className="button button-primary" to="/rides/new"><Plus size={16}/> Offer a ride</Link></div>) : <div className="ride-list">{rides.map(r=><RideCard key={r.id} ride={r}/>)}</div>}
    </section>
    <aside className="dashboard-side">
     {canPassenger&&<div className="quick-card"><div className="quick-icon"><Search size={19}/></div><h3>Looking for a ride?</h3><p>Search by pickup, destination, date, time and seats.</p><Link className="button button-light full" to="/rides">Find a ride</Link></div>}
     {canDrive&&<div className="quick-card driver-quick"><div className="quick-icon"><Plus size={19}/></div><h3>Have an empty seat?</h3><p>Offer your route and share fuel costs with the ICBT community.</p><Link className="button button-primary full" to="/rides/new">Offer a ride</Link></div>}
     <div className="security-card"><ShieldCheck size={20}/><div><strong>Travel responsibly</strong><p>Confirm pickup details through in-app messaging.</p></div></div>
    </aside>
   </div>
  </>}
 </div>
}
function Stat({icon,label,value,hint}:{icon:React.ReactNode;label:string;value:string;hint:string}){return <div className="stat-card"><div className="stat-icon">{icon}</div><span>{label}</span><strong>{value}</strong><small>{hint}</small></div>}
