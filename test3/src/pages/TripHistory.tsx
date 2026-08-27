import {useEffect,useState} from "react";
import {ArrowRight,CalendarDays,CheckCircle2,Clock3,History,MapPin,XCircle} from "lucide-react";
import {Link} from "react-router-dom";
import {getTripHistory,cancelBooking} from "../services/api";
import {Booking} from "../types";
import {demoRides} from "../data/demo";
import {Empty,ErrorState,Loading} from "../components/State";
export default function TripHistory(){
 const [items,setItems]=useState<Booking[]>([]);const [loading,setLoading]=useState(true);const [error,setError]=useState("");
 useEffect(()=>{getTripHistory().then(setItems).catch(e=>setError(e.message)).finally(()=>setLoading(false))},[]);
 async function cancel(id:string){await cancelBooking(id);setItems(x=>x.map(b=>b.id===id?{...b,status:"cancelled"}:b))}
 return <div className="page"><div className="page-heading"><div><span className="eyebrow">ACTIVITY</span><h1>Trip history</h1><p>Review your requested, confirmed and cancelled rides.</p></div><Link className="button button-primary" to="/rides">Find another ride</Link></div>{error?<ErrorState message={error}/>:loading?<Loading label="Loading trip history"/>:items.length?<div className="history-list">{items.map(b=>{const r=demoRides.find(x=>x.id===b.rideId);if(!r)return null;return <article className="history-card" key={b.id}><div className="history-icon"><History size={19}/></div><div className="history-main"><div className="history-route"><strong>{r.origin}</strong><ArrowRight size={15}/><strong>{r.destination}</strong></div><div className="history-meta"><span><CalendarDays size={13}/>{r.date}</span><span><Clock3 size={13}/>{r.time}</span><span><MapPin size={13}/>{r.distanceKm} km</span></div></div><div className="history-status"><span className={`status status-${b.status==="confirmed"?"open":b.status==="cancelled"?"full":"completed"}`}>{b.status}</span>{b.status==="confirmed"&&<button className="text-button danger-text" onClick={()=>cancel(b.id)}><XCircle size={14}/> Cancel</button>}</div></article>})}</div>:<Empty title="No trip history yet" description="Join your first ride and it will appear here."/>}</div>
}
