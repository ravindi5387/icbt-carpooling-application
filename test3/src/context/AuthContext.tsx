import {createContext,useContext,useEffect,useMemo,useState} from "react";
import {Role,RideRole,User} from "../types";
import {demoUser,drivers,demoPassengers} from "../data/demo";

export const ADMIN_USERNAME = "icbt.admin";
export const ADMIN_PASSWORD = "Carpool@Admin2026";

interface AuthValue{
  user:User|null; token:string|null;
  login:(identifier:string,password:string,accountType:"user"|"admin")=>Promise<"user"|"admin">;
  register:(name:string,email:string,password:string,memberType:Role,rideRole:RideRole)=>Promise<void>;
  logout:()=>void;
}
const AuthContext=createContext<AuthValue|undefined>(undefined);

export function AuthProvider({children}:{children:React.ReactNode}){
  const [user,setUser]=useState<User|null>(()=>{const x=localStorage.getItem("icbt_user");return x?JSON.parse(x):null});
  const [token,setToken]=useState<string|null>(()=>localStorage.getItem("icbt_token"));
  const [registeredAccount,setRegisteredAccount]=useState<{user:User;password:string}|null>(null);

  useEffect(()=>{if(user)localStorage.setItem("icbt_user",JSON.stringify(user));else localStorage.removeItem("icbt_user")},[user]);
  useEffect(()=>{if(token)localStorage.setItem("icbt_token",token);else localStorage.removeItem("icbt_token")},[token]);

  async function login(identifier:string,password:string,accountType:"user"|"admin"){
    if(accountType==="admin"){
      if(identifier.trim()!==ADMIN_USERNAME || password!==ADMIN_PASSWORD){
        throw new Error("Invalid administrator username or password.");
      }
      const admin:User={
        id:"admin-001",name:"ICBT System Administrator",email:"admin@icbt.lk",
        username:ADMIN_USERNAME,role:"staff",rideRole:"both",rating:5,totalTrips:0,verified:true,isAdmin:true
      };
      setUser(admin);setToken("demo-admin-token");return "admin";
    }

    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier))throw new Error("Enter a valid ICBT email address.");
    if(password.length<8)throw new Error("Password must contain at least 8 characters.");
    if(registeredAccount && registeredAccount.user.email===identifier.trim().toLowerCase()) {
      if(registeredAccount.password!==password) throw new Error("Incorrect password for this registered account.");
      setUser(registeredAccount.user);setToken("demo-user-token");return "user";
    }
    const email=identifier.trim().toLowerCase();
    const knownUser=[demoUser,...drivers,...demoPassengers].find(x=>x.email.toLowerCase()===email);
    if(knownUser){setUser({...knownUser});setToken("demo-user-token");return "user";}
    const stableId="demo-"+Array.from(email).reduce((n,c)=>(n*31+c.charCodeAt(0))>>>0,7).toString(36);
    const lower=email.toLowerCase();
    const rideRole:RideRole=lower.includes("passenger")||lower.includes("rider")?"passenger":lower.includes("driver")?"driver":"both";
    const name=lower.includes("mayurika")?"Mayurika Perera":lower.includes("ravindi")?"Ravindi Perera":lower.split("@")[0].replace(/[._-]/g," ").replace(/\b\w/g,m=>m.toUpperCase());
    const demo={...demoUser,id:stableId,name:name||"ICBT Member",email,rideRole};
    setUser(demo);setToken("demo-user-token");return "user";
  }

  async function register(name:string,email:string,password:string,memberType:Role,rideRole:RideRole){
    if(name.trim().length<2)throw new Error("Enter your full name.");
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))throw new Error("Enter a valid email address.");
    if(password.length<8)throw new Error("Password must contain at least 8 characters.");
    const newUser:User={
      id:crypto.randomUUID(),name:name.trim(),email:email.trim().toLowerCase(),role:memberType,rideRole,
      rating:0,totalTrips:0,verified:false
    };
    // Demo mode keeps the new account in memory for the register → login flow.
    // A real backend must persist the account and hash the password server-side.
    setRegisteredAccount({user:newUser,password});
    setUser(null);setToken(null);
  }

  function logout(){setUser(null);setToken(null);localStorage.removeItem("icbt_user");localStorage.removeItem("icbt_token");}
  const value=useMemo(()=>({user,token,login,register,logout}),[user,token,registeredAccount]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
export function useAuth(){const x=useContext(AuthContext);if(!x)throw new Error("useAuth must be inside AuthProvider");return x}
