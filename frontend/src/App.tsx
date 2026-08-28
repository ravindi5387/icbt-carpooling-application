import {Navigate,Route,Routes} from "react-router-dom";
import {useAuth} from "./context/AuthContext";
import Layout from "./components/Layout";
import Landing from "./pages/Landing";
import {Login,Register} from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import FindRides from "./pages/FindRides";
import CreateRide from "./pages/CreateRide";
import RideDetails from "./pages/RideDetails";
import TripHistory from "./pages/TripHistory";
import Messages from "./pages/Messages";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import Matching from "./pages/Matching";
import Notifications from "./pages/Notifications";
import Bookings from "./pages/Bookings";
import DriverDashboard from "./pages/DriverDashboard";
import Safety from "./pages/Safety";
import Fuel from "./pages/Fuel";
import Ratings from "./pages/Ratings";
import Admin from "./pages/Admin";
import {RideRole} from "./types";
function Protected({children}:{children:React.ReactNode}){return useAuth().user?<>{children}</>:<Navigate to="/login" replace/>}
function RoleProtected({children,roles}:{children:React.ReactNode;roles:RideRole[]}){const {user}=useAuth();return user&&roles.includes(user.rideRole)?<>{children}</>:<Navigate to="/dashboard" replace/>}
function AdminProtected({children}:{children:React.ReactNode}){const {user}=useAuth();return user?.isAdmin?<>{children}</>:<Navigate to="/dashboard" replace/>}
export default function App(){return <Routes>
 <Route path="/" element={<Landing/>}/><Route path="/login" element={<Login/>}/><Route path="/register" element={<Register/>}/>
 <Route element={<Protected><Layout/></Protected>}>
  <Route path="/dashboard" element={useAuth().user?.isAdmin?<Navigate to="/admin" replace/>:<Dashboard/>}/>
  <Route path="/matching" element={<RoleProtected roles={["passenger","both"]}><Matching/></RoleProtected>}/>
  <Route path="/rides" element={<RoleProtected roles={["passenger","both"]}><FindRides/></RoleProtected>}/>
  <Route path="/rides/new" element={<RoleProtected roles={["driver","both"]}><CreateRide/></RoleProtected>}/>
  <Route path="/rides/:id" element={<RideDetails/>}/>
  <Route path="/bookings" element={<RoleProtected roles={["passenger","both"]}><Bookings/></RoleProtected>}/>
  <Route path="/trips" element={<TripHistory/>}/><Route path="/messages" element={<Messages/>}/><Route path="/notifications" element={<Notifications/>}/><Route path="/fuel" element={<Fuel/>}/><Route path="/ratings" element={<Ratings/>}/><Route path="/safety" element={<Safety/>}/><Route path="/profile" element={<Profile/>}/>
  <Route path="/driver" element={<RoleProtected roles={["driver","both"]}><DriverDashboard/></RoleProtected>}/>
  <Route path="/admin" element={<AdminProtected><Admin/></AdminProtected>}/>
 </Route>
 <Route path="*" element={<NotFound/>}/>
 </Routes>}
