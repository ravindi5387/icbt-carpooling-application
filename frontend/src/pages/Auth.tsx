import {FormEvent,useState} from "react";
import {ArrowLeft,CarFront,Eye,EyeOff,LockKeyhole,Mail,ShieldCheck,UserRound,Users} from "lucide-react";
import {Link,useLocation,useNavigate} from "react-router-dom";
import {useAuth,ADMIN_PASSWORD,ADMIN_USERNAME} from "../context/AuthContext";
import {Role,RideRole} from "../types";

export function Login(){
 const {login}=useAuth();const nav=useNavigate();const location=useLocation();
 const [accountType,setAccountType]=useState<"user"|"admin">("user");
 const [identifier,setIdentifier]=useState("");const [password,setPassword]=useState("");const [show,setShow]=useState(false);const [error,setError]=useState("");const [loading,setLoading]=useState(false);
 const success=(location.state as {registered?:boolean}|null)?.registered;
 async function submit(e:FormEvent){e.preventDefault();setError("");setLoading(true);try{const type=await login(identifier,password,accountType);nav(type==="admin"?"/admin":"/dashboard",{replace:true})}catch(x){setError(x instanceof Error?x.message:"Unable to sign in.")}finally{setLoading(false)}}
 return <AuthShell title="Welcome back" subtitle="Sign in securely to continue your ICBT carpool journey.">
  {success&&<div className="alert success"><ShieldCheck size={16}/> Account created successfully. Please sign in to continue.</div>}
  <div className="account-switch"><button type="button" className={accountType==="user"?"active":""} onClick={()=>setAccountType("user")}><Users size={15}/> Student / Staff</button><button type="button" className={accountType==="admin"?"active admin":""} onClick={()=>setAccountType("admin")}><ShieldCheck size={15}/> Administrator</button></div>
  <form className="auth-form" onSubmit={submit}>
   {error&&<div className="alert error">{error}</div>}
   <label>{accountType==="admin"?"Administrator username":"ICBT email address"}<div className="input-icon">{accountType==="admin"?<ShieldCheck size={17}/>:<Mail size={17}/>}<input value={identifier} onChange={e=>setIdentifier(e.target.value)} placeholder={accountType==="admin"?"Enter admin username":"you@student.icbt.lk"} autoComplete="username" required/></div></label>
   <label>Password<div className="input-icon"><LockKeyhole size={17}/><input type={show?"text":"password"} value={password} onChange={e=>setPassword(e.target.value)} placeholder="Enter your password" autoComplete="current-password" required/><button className="input-action" type="button" onClick={()=>setShow(!show)}>{show?<EyeOff size={17}/>:<Eye size={17}/>}</button></div></label>
   {accountType==="user"?<div className="form-row"><label className="checkbox"><input type="checkbox"/> Remember me</label><button type="button" className="text-button">Forgot password?</button></div>:<div className="admin-login-note"><ShieldCheck size={15}/><span>Administrator access is restricted to authorised system administrators.</span></div>}
   <button className="button button-primary full" disabled={loading}>{loading?"Signing in…":accountType==="admin"?"Open Admin Dashboard":"Sign in"}</button>
   {accountType==="admin"?<p className="auth-switch">Need a normal account? <button type="button" className="text-button" onClick={()=>setAccountType("user")}>Use Student / Staff login</button></p>:<p className="auth-switch">New to ICBT Carpool? <Link to="/register">Create an account</Link></p>}
  </form>
 </AuthShell>
}

export function Register(){
 const {register}=useAuth();const nav=useNavigate();const [f,setF]=useState({name:"",email:"",password:"",confirm:"",memberType:"student" as Role,rideRole:"both" as RideRole});const [error,setError]=useState("");const [loading,setLoading]=useState(false);
 const set=(k:keyof typeof f,v:string)=>setF(x=>({...x,[k]:v}));
 async function submit(e:FormEvent){e.preventDefault();setError("");if(f.password!==f.confirm)return setError("Passwords do not match.");setLoading(true);try{await register(f.name,f.email,f.password,f.memberType,f.rideRole);nav("/login",{replace:true,state:{registered:true}})}catch(x){setError(x instanceof Error?x.message:"Unable to create account.")}finally{setLoading(false)}}
 return <AuthShell title="Create your ICBT profile" subtitle="Choose your community membership and how you want to use carpooling.">
  <div className="register-progress"><span className="done">1</span><div/><span>2</span><div/><span>3</span><small>Account details · Community · Ride role</small></div>
  <form className="auth-form" onSubmit={submit}>
   {error&&<div className="alert error">{error}</div>}
   <label>Full name<div className="input-icon"><UserRound size={17}/><input value={f.name} onChange={e=>set("name",e.target.value)} placeholder="Your full name" required/></div></label>
   <label>ICBT email address<div className="input-icon"><Mail size={17}/><input type="email" value={f.email} onChange={e=>set("email",e.target.value)} placeholder="you@student.icbt.lk" required/></div></label>
   <div className="selection-section"><div><span className="form-label">Member type</span><small>Tell us whether you are joining as a student or staff member.</small></div><div className="choice-grid two"><Choice active={f.memberType==="student"} icon="🎓" title="Student" text="Current ICBT student" onClick={()=>set("memberType","student")}/><Choice active={f.memberType==="staff"} icon="💼" title="Staff" text="ICBT staff member" onClick={()=>set("memberType","staff")}/></div></div>
   <div className="selection-section"><div><span className="form-label">Carpool role</span><small>You can change this later in your profile.</small></div><div className="choice-grid three"><Choice active={f.rideRole==="driver"} icon="🚗" title="Driver" text="Offer rides" onClick={()=>set("rideRole","driver")}/><Choice active={f.rideRole==="passenger"} icon="🧍" title="Passenger" text="Join rides" onClick={()=>set("rideRole","passenger")}/><Choice active={f.rideRole==="both"} icon="🔄" title="Both" text="Drive & join" onClick={()=>set("rideRole","both")}/></div></div>
   <div className="two-col"><label>Password<input type="password" value={f.password} onChange={e=>set("password",e.target.value)} placeholder="At least 8 characters" required/></label><label>Confirm password<input type="password" value={f.confirm} onChange={e=>set("confirm",e.target.value)} placeholder="Repeat password" required/></label></div>
   <label className="checkbox"><input type="checkbox" required/> I agree to use the platform responsibly and provide accurate account and ride information.</label>
   <button className="button button-primary full" disabled={loading}>{loading?"Creating account…":"Create account"}</button>
   <p className="auth-switch">Already have an account? <Link to="/login">Sign in</Link></p>
  </form>
 </AuthShell>
}

function Choice({active,icon,title,text,onClick}:{active:boolean;icon:string;title:string;text:string;onClick:()=>void}){return <button type="button" className={`choice-card ${active?"active":""}`} onClick={onClick}><span className="choice-icon">{icon}</span><span><strong>{title}</strong><small>{text}</small></span>{active&&<span className="choice-check">✓</span>}</button>}
function AuthShell({title,subtitle,children}:{title:string;subtitle:string;children:React.ReactNode}){return <div className="auth-page"><div className="auth-brand-panel"><Link to="/" className="auth-logo"><CarFront/> ICBT Carpool</Link><div className="auth-brand-copy"><span className="eyebrow">SMARTER COMMUTING</span><h1>Every seat can make a difference.</h1><p>Connect with verified students and staff travelling in the same direction.</p><div className="auth-trust"><span><ShieldCheck size={14}/> Verified community</span><span><Users size={14}/> Student + staff</span></div></div><Link to="/" className="back-home"><ArrowLeft size={15}/> Back to home</Link></div><div className="auth-form-panel"><div className="auth-content"><Link to="/" className="mobile-auth-logo"><CarFront size={19}/> ICBT Carpool</Link><span className="eyebrow">ACCOUNT</span><h2>{title}</h2><p className="auth-subtitle">{subtitle}</p>{children}</div></div></div>}
export function AuthRedirect(){return <Login/>}
