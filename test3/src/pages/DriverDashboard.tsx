import {useEffect,useState} from "react";
import {CalendarDays,Car,CheckCircle2,Clock3,Edit3,MoreHorizontal,Users,XCircle,Loader2,QrCode,PlayCircle,Flag,Radio} from "lucide-react";
import {demoBookings,demoRides} from "../data/demo";
import {reviewJoinRequest,getDriverRideCode,getRideCheckIns,startRide,completeRide} from "../services/featureApi";
import {SectionTitle,Metric} from "../components/FeatureShell";
import {Link} from "react-router-dom";
import {useAuth} from "../context/AuthContext";
import Modal from "../components/Modal";

type RequestStatus="requested"|"confirmed"|"rejected"|"cancelled";

type DriverRequest={id:string;rideId:string;name:string;email:string;phone?:string;seats:number;status:RequestStatus;route:string};


export default function DriverDashboard(){
 const {user}=useAuth();
 const [requests,setRequests]=useState<DriverRequest[]>([]);
 const [selectedRideId,setSelectedRideId]=useState<string|null>(null);
 const [controlRide,setControlRide]=useState<string|null>(null);
 const [busyId,setBusyId]=useState<string|null>(null);
 const myPostedRides=demoRides.filter(r=>r.driver.id===user?.id);
 function syncRequests(){
  const rideIds=new Set(myPostedRides.map(r=>r.id));
  setRequests(demoBookings.filter(b=>rideIds.has(b.rideId)).map(b=>({
   id:b.id,rideId:b.rideId,name:b.passenger.name,email:b.passenger.email,phone:b.passenger.phone,seats:1,status:b.status,route:(demoRides.find(r=>r.id===b.rideId)?.origin||"")+" → "+(demoRides.find(r=>r.id===b.rideId)?.destination||"")
  })));
 }
 useEffect(()=>{syncRequests()},[user?.id,myPostedRides.length]);
 async function handleRequest(id:string,action:"accept"|"reject"){
  try{setBusyId(id);await reviewJoinRequest(id,action);syncRequests();}catch(e){window.alert(e instanceof Error?e.message:"Could not review request.")}finally{setBusyId(null)}
 }
 return <div className="page">
  <SectionTitle eyebrow="DRIVER DASHBOARD" title="Manage your rides" description="See active offers, passenger requests, check-ins and live trip status." action={<Link to="/rides/new" className="button button-primary">+ New ride</Link>}/>
  <div className="metric-grid">
   <Metric icon={<Car/>} label="Active rides" value={myPostedRides.filter(r=>r.status==="open"||r.status==="started").length} sub="Currently published"/>
   <Metric icon={<Users/>} label="Available seats" value={myPostedRides.reduce((n,r)=>n+r.seatsAvailable,0)} sub="Across active rides"/>
   <Metric icon={<Clock3/>} label="Pending requests" value={requests.filter(r=>r.status==="requested").length} sub="Need your review"/>
   <Metric icon={<CheckCircle2/>} label="Completed" value={myPostedRides.filter(r=>r.status==="completed").length+41} sub="Total trips"/>
  </div>
  <div className="split-panels">
   <section className="panel">
    <div className="panel-heading"><div><span className="eyebrow">MY POSTED RIDES</span><h2>Active offers</h2></div><button className="icon-button"><MoreHorizontal size={17}/></button></div>
    <div className="driver-rides">
     {myPostedRides.length===0?<div className="empty-state"><h3>No rides yet</h3><p>Offer your first campus ride to see it here.</p></div>:myPostedRides.map(ride=><article className="driver-ride" key={ride.id}>
      <div className="driver-ride-top"><span className={`status status-${ride.status}`}>{ride.status}</span><button className="icon-button"><Edit3 size={14}/></button></div>
      <h3>{ride.origin} → {ride.destination}</h3>
      <div className="ride-meta"><span><CalendarDays size={14}/>{ride.date}</span><span><Clock3 size={14}/>{ride.time}</span><span><Users size={14}/>{ride.seatsAvailable}/{ride.seats}</span><span>{ride.vehicleType}</span></div>
      <div className="driver-ride-bottom"><span>Rs. {ride.price} · {ride.pickupZone||ride.origin}</span><div className="ride-action-row"><button type="button" className="inline-link" onClick={()=>setSelectedRideId(ride.id)}><Users size={13}/> Passengers</button><button type="button" className="inline-link" onClick={()=>setControlRide(ride.id)}><Radio size={13}/> Ride control</button><Link to={`/rides/${ride.id}`}>Details →</Link></div></div>
     </article>)}
    </div>
   </section>
   <section className="panel">
    <div className="panel-heading"><div><span className="eyebrow">JOIN REQUESTS</span><h2>Pending passenger requests</h2></div></div>
    <div className="request-list">
     {requests.length===0?<div className="empty-state"><h3>No passenger requests</h3><p>New requests for your posted rides will appear here.</p></div>:requests.map(r=>{const busy=busyId===r.id,pending=r.status==="requested";return <div className="request" key={r.id}>
      <div className="avatar">{r.name[0]}</div><div className="request-person"><strong>{r.name}</strong><small>{r.email} · {r.seats} {r.seats===1?"seat":"seats"} · {r.route}</small><span className={`request-result request-result-${r.status}`}>{r.status==="confirmed"?"Request accepted":r.status==="rejected"?"Request rejected":r.status==="cancelled"?"Booking cancelled":"Pending request"}</span></div>
      <button className="icon-button request-accept" disabled={!pending||busy} title="Accept request" onClick={()=>handleRequest(r.id,"accept")}>{busy?<Loader2 className="spin" size={15}/>:<CheckCircle2 size={15}/>}</button>
      <button className="icon-button request-reject" disabled={!pending||busy} title="Reject request" onClick={()=>handleRequest(r.id,"reject")}>{busy?<Loader2 className="spin" size={15}/>:<XCircle size={15}/>}</button>
     </div>})}
    </div>
   </section>
  </div>
  <Modal open={!!selectedRideId} title="Passenger details" onClose={()=>setSelectedRideId(null)}>{selectedRideId&&<PassengerDetails rideId={selectedRideId}/>}</Modal>
  <Modal open={!!controlRide} title="Live ride control" onClose={()=>setControlRide(null)}>{controlRide&&<RideControl rideId={controlRide}/>}</Modal>
 </div>
}

function PassengerDetails({rideId}:{rideId:string}){
 const bookings=demoBookings.filter(b=>b.rideId===rideId&&b.status!=="cancelled");
 const checks=getRideCheckIns(rideId);
 return <div className="admin-detail-modal">
  <p className="modal-subtitle">Passengers and real-time check-in status.</p>
  {bookings.length>0 ? (
   <div className="passenger-detail-list">
    {bookings.map(b=>{
      const c=checks.find(x=>x.bookingId===b.id);
      const time=c?new Date(c.checkedInAt).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}):"";
      return <div className="passenger-detail" key={b.id}>
       <div className="avatar">{b.passenger.name[0]}</div>
       <div><strong>{b.passenger.name}</strong><small>{b.passenger.email} · {b.passenger.phone||"Phone not provided"}</small><span className={c?"checked-label":"pending-label"}>{c?`✓ Checked in ${time}`:"○ Not checked in"}</span></div>
      </div>;
    })}
   </div>
  ) : (
   <div className="state"><h3>No confirmed passengers yet</h3><p>Passenger details appear after a booking/request is created.</p></div>
  )}
 </div>;
}

function RideControl({rideId}:{rideId:string}){
 const ride=demoRides.find(r=>r.id===rideId)!;
 const checks=getRideCheckIns(rideId);
 const code=getDriverRideCode(rideId);
 const [status,setStatus]=useState(ride.status);
 async function start(){await startRide(rideId);setStatus("started")}
 async function complete(){await completeRide(rideId);setStatus("completed")}
 const passengers=demoBookings.filter(b=>b.rideId===rideId&&b.status!=="cancelled");
 return <div className="ride-control">
  <div className="code-card"><QrCode size={28}/><div><small>RIDE CHECK-IN CODE</small><strong>{code}</strong><span>Give this 4-digit code to confirmed passengers.</span></div></div>
  <div className="live-status"><span className={`live-status-dot ${status}`}></span><strong>{status==="started"?"Ride In Progress":status==="completed"?"Ride Completed":"Upcoming Ride"}</strong></div>
  <div className="checkin-summary"><strong>Passengers checked in</strong><span>{checks.length} / {passengers.length}</span></div>
  <div className="checkin-mini-list">
   {passengers.map(p=>{const c=checks.find(x=>x.bookingId===p.id);return <div key={p.id}><span>{c?"✓":"○"}</span>{p.passenger.name}<small>{c?"Checked in":"Waiting"}</small></div>})}
  </div>
  <div className="modal-actions">
   {status==="open"||status==="full" ? <button className="button button-primary" onClick={start}><PlayCircle size={16}/> Start Ride</button> : status==="started" ? <button className="button button-primary" onClick={complete}><Flag size={16}/> Complete Ride</button> : <span className="button button-light"><CheckCircle2 size={15}/> Completed</span>}
  </div>
 </div>;
}
