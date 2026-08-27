import {useEffect,useState} from "react";
import {CalendarDays,Clock3,Users,XCircle,CheckCircle2} from "lucide-react";
import {demoRides} from "../data/demo";
import {Booking} from "../types";
import {getBookings,cancelBooking} from "../services/api";
import {SectionTitle} from "../components/FeatureShell";
import {Link} from "react-router-dom";

export default function Bookings(){
 const [bookings,setBookings]=useState<Booking[]>([]);
 const [loading,setLoading]=useState(true);
 const [busy,setBusy]=useState<string|null>(null);
 const [activeTab,setActiveTab]=useState<"all"|"requested"|"confirmed"|"rejected">("all");
 useEffect(()=>{getBookings().then(setBookings).finally(()=>setLoading(false))},[]);
 async function handleCancel(id:string){
  if(!window.confirm("Cancel this booking request?")) return;
  try{setBusy(id);await cancelBooking(id);setBookings(current=>current.map(b=>b.id===id?{...b,status:"cancelled"}:b));}
  finally{setBusy(null)}
 }
 const statusLabel=(s:Booking["status"])=>s==="confirmed"?"Accepted":s==="requested"?"Pending":s==="rejected"?"Rejected":"Cancelled";
 const filtered=activeTab==="all"?bookings:bookings.filter(b=>b.status===activeTab);
 return <div className="page">
  <SectionTitle eyebrow="BOOKING MANAGEMENT" title="My bookings" description="Track pending, accepted and rejected requests."/>
  <div className="tabs">
   {([['all','All'],['requested','Pending'],['confirmed','Accepted'],['rejected','Rejected']] as const).map(([key,label])=><button key={key} type="button" className={`tab ${activeTab===key?"active":""}`} onClick={()=>setActiveTab(key)}>{label}</button>)}
  </div>
  <div className="booking-list">
   {loading?<div className="panel empty-state">Loading your bookings…</div>:filtered.length===0?
    <div className="panel empty-state">
     <h3>No {activeTab==="all"?"":activeTab==="requested"?"pending ":activeTab==="confirmed"?"accepted ":"rejected "}bookings</h3>
     <p>{activeTab==="all"?"Find a ride and request a seat to see it here.":"There are no bookings in this category yet."}</p>
     {activeTab==="all"&&<Link to="/rides" className="button button-primary">Find a ride</Link>}
    </div>
    :filtered.map(b=>{
      const r=demoRides.find(x=>x.id===b.rideId); if(!r)return null;
      const cancelled=b.status==="cancelled";
      const statusClass=b.status==="confirmed"?"status-confirmed":b.status==="rejected"?"status-rejected":b.status==="cancelled"?"status-cancelled":"status-requested";
      return <article className="booking-card" key={b.id}>
       <div className="booking-status"><span className={`status ${statusClass}`}>{statusLabel(b.status)}</span></div>
       <div className="booking-route"><div><small>FROM</small><strong>{r.origin}</strong></div><span>→</span><div><small>TO</small><strong>{r.destination}</strong></div></div>
       <div className="booking-info"><span><CalendarDays size={14}/>{r.date}</span><span><Clock3 size={14}/>{r.time}</span><span><Users size={14}/>{cancelled?"Booking cancelled":`${r.seatsAvailable} seats available`}</span></div>
       <div className="booking-actions">
        <Link to={`/rides/${r.id}`} className="button button-outline">Details</Link>
        {cancelled?<span className="button button-light"><CheckCircle2 size={15}/> Cancelled</span>:<button type="button" className="button button-danger" disabled={busy===b.id} onClick={()=>handleCancel(b.id)}><XCircle size={15}/> {busy===b.id?"Cancelling…":"Cancel"}</button>}
       </div>
      </article>;
    })}
  </div>
 </div>;
}
