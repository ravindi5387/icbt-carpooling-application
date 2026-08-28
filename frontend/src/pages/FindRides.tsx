import {FormEvent,useEffect,useState} from "react";
import {CalendarDays,Clock3,MapPin,RotateCcw,Search,SlidersHorizontal,Users} from "lucide-react";
import {getRides} from "../services/api";
import {Ride,RideFilters} from "../types";
import RideCard from "../components/RideCard";
import {Empty,ErrorState} from "../components/State";
const initial:RideFilters={origin:"",destination:"",date:"",time:"",seats:"",maxPrice:"",sort:"time"};
export default function FindRides(){
 const [f,setF]=useState(initial);const [rides,setRides]=useState<Ride[]>([]);const [loading,setLoading]=useState(true);const [error,setError]=useState("");
 async function search(e?:FormEvent){e?.preventDefault();setLoading(true);setError("");try{setRides(await getRides(f))}catch(x){setError(x instanceof Error?x.message:"Unable to load rides.")}finally{setLoading(false)}}
 useEffect(()=>{search()},[]);
 const set=(k:string,v:string)=>setF(x=>({...x,[k]:v}));
 return <div className="page"><div className="page-heading"><div><span className="eyebrow">DISCOVER</span><h1>Find a ride</h1><p>Match your route and time with available campus carpools.</p></div></div>
 <form className="search-panel" onSubmit={search}><Field icon={<MapPin/>} label="Pickup"><input value={f.origin} onChange={e=>set("origin",e.target.value)} placeholder="e.g. Nugegoda"/></Field><Field icon={<MapPin/>} label="Destination"><input value={f.destination} onChange={e=>set("destination",e.target.value)} placeholder="e.g. ICBT Colombo"/></Field><Field icon={<CalendarDays/>} label="Date"><input type="date" value={f.date} onChange={e=>set("date",e.target.value)}/></Field><Field icon={<Clock3/>} label="After"><input type="time" value={f.time} onChange={e=>set("time",e.target.value)}/></Field><Field icon={<Users/>} label="Seats"><select value={f.seats} onChange={e=>set("seats",e.target.value)}><option value="">Any</option><option value="1">1+</option><option value="2">2+</option><option value="3">3+</option></select></Field><Field icon={<span>Rs</span>} label="Max price"><input type="number" min="0" value={f.maxPrice} onChange={e=>set("maxPrice",e.target.value)} placeholder="Any"/></Field><button className="button button-primary search-button"><Search size={17}/> Search</button></form>
 <div className="results-toolbar"><strong>{loading?"Searching…":`${rides.length} rides found`}</strong><div className="toolbar-actions"><label>Sort<select value={f.sort} onChange={e=>{set("sort",e.target.value);setTimeout(()=>search(),0)}}><option value="time">Departure</option><option value="price">Lowest price</option><option value="seats">Most seats</option></select></label><button className="filter-button" onClick={()=>{setF(initial);search()}}><RotateCcw size={14}/> Reset</button><SlidersHorizontal size={15}/></div></div>
 {error?<ErrorState message={error}/>:loading?<div className="loading-grid">{[1,2,3,4].map(x=><div className="skeleton-card" key={x}/>)}</div>:rides.length?<div className="ride-grid">{rides.map(r=><RideCard key={r.id} ride={r}/>)}</div>:<Empty title="No matching rides" description="Try a different route, time or seat requirement."/>}
 </div>
}
function Field({icon,label,children}:{icon:React.ReactNode;label:string;children:React.ReactNode}){return <div className="search-field">{icon}<label>{label}{children}</label></div>}
