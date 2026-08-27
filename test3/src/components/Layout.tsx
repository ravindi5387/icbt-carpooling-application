import {Bell,CarFront,History,LayoutDashboard,LogOut,Menu,MessageCircle,PlusCircle,Search,UserCircle,X,ShieldCheck,BarChart3,Calculator,Star,CalendarCheck,Sparkles} from "lucide-react";
import {NavLink,useNavigate,Outlet} from "react-router-dom";
import {useEffect,useState} from "react";
import {getNotifications} from "../services/featureApi";
import {useAuth} from "../context/AuthContext";

export default function Layout(){
 const {user,logout}=useAuth(); const [open,setOpen]=useState(false); const [hasUnread,setHasUnread]=useState(false); const navigate=useNavigate();
 const canDrive=user?.rideRole==="driver"||user?.rideRole==="both";
 useEffect(()=>{let alive=true;getNotifications().then(items=>{if(alive)setHasUnread(items.some((n:any)=>n.unread))}).catch(()=>{});return()=>{alive=false}},[user?.id]);
 const canPassenger=user?.rideRole==="passenger"||user?.rideRole==="both";
 const links=[
  {to:"/dashboard",label:"Dashboard",icon:LayoutDashboard,show:!user?.isAdmin},
  {to:"/matching",label:"Smart Matches",icon:Sparkles,show:canPassenger&&!user?.isAdmin},
  {to:"/rides",label:"Find a Ride",icon:Search,show:canPassenger&&!user?.isAdmin},
  {to:"/rides/new",label:"Offer a Ride",icon:PlusCircle,show:canDrive&&!user?.isAdmin},
  {to:"/bookings",label:"My Bookings",icon:CalendarCheck,show:canPassenger&&!user?.isAdmin},
  {to:"/trips",label:"Trip History",icon:History,show:!user?.isAdmin},
  {to:"/messages",label:"Messages",icon:MessageCircle,show:!user?.isAdmin},
  {to:"/notifications",label:"Notifications",icon:Bell,show:true},
  {to:"/fuel",label:"Fuel Calculator",icon:Calculator,show:!user?.isAdmin},
  {to:"/ratings",label:"Ratings",icon:Star,show:!user?.isAdmin},
  {to:"/safety",label:"Safety Centre",icon:ShieldCheck,show:!user?.isAdmin},
  {to:"/profile",label:"Profile",icon:UserCircle,show:true}
 ];
 function signOut(){logout();setOpen(false);navigate("/login",{replace:true});}
 return <div className="app-shell">
  <aside className={`sidebar ${open?"sidebar-open":""}`}>
   <NavLink to={user?.isAdmin?"/admin":"/dashboard"} className="brand"><div className="brand-mark"><CarFront size={23}/></div><div><strong>ICBT</strong><span>Carpool</span></div></NavLink>
   <div className="side-label">MAIN MENU</div>
   <nav className="side-nav">{links.filter(x=>x.show).map(({to,label,icon:Icon})=><NavLink key={to} to={to} onClick={()=>setOpen(false)} className={({isActive})=>`nav-item ${isActive?"active":""}`}><Icon size={17}/><span>{label}</span></NavLink>)}</nav>
   {user?.isAdmin&&<><div className="side-label">ADMINISTRATION</div><nav className="side-nav"><NavLink to="/admin" onClick={()=>setOpen(false)} className={({isActive})=>`nav-item admin-nav ${isActive?"active":""}`}><BarChart3 size={17}/><span>Admin Dashboard</span></NavLink></nav></>}
   {canDrive&&!user?.isAdmin&&<><div className="side-label">DRIVER</div><nav className="side-nav"><NavLink to="/driver" onClick={()=>setOpen(false)} className={({isActive})=>`nav-item ${isActive?"active":""}`}><CarFront size={17}/><span>Driver Console</span></NavLink></nav></>}
   <div className="sidebar-bottom">
    <div className="mini-user"><div className="avatar">{user?.name.charAt(0)}</div><div><strong>{user?.name}</strong><small>{user?.isAdmin?"Administrator":`${user?.role} · ${user?.rideRole}`}</small></div></div>
    <button className="nav-item danger-button" onClick={signOut}><LogOut size={17}/><span>Logout</span></button>
   </div>
  </aside>
  {open&&<button className="mobile-overlay" aria-label="Close menu" onClick={()=>setOpen(false)}><X/></button>}
  <div className="main-area">
   <header className="topbar"><button className="icon-button mobile-menu" onClick={()=>setOpen(true)}><Menu size={21}/></button><div className="topbar-title"><span className="eyebrow">ICBT STUDENT TRANSPORT</span><strong>Shared journeys, made simpler.</strong></div><div className="topbar-actions"><NavLink to="/notifications" className="icon-button"><Bell size={19}/>{hasUnread&&<span className="notification-dot"/>}</NavLink><NavLink to="/profile" className="avatar avatar-link">{user?.name.charAt(0)}</NavLink></div></header>
   <main className="content"><Outlet/></main>
  </div>
 </div>
}
