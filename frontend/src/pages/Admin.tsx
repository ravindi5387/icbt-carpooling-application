import { useEffect, useState } from "react";
import {
  Activity,
  BarChart3,
  Car,
  CheckCircle2,
  Eye,
  Flag,
  ShieldAlert,
  Star,
  UserCheck,
  Users,
  UserX,
  MessageSquare,
  Route as RouteIcon,
} from "lucide-react";
import { getAdminStats, getRouteStats } from "../services/featureApi";
import { demoRides, drivers, demoBookings } from "../data/demo";
import { reportedUsers } from "../data/extended";
import Modal from "../components/Modal";

interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  totalRides: number;
  completedRides: number;
  cancelledRides: number;
  totalPassengers: number;
  avgRating: number;
  monthlyFuelSaved: number;
}
interface RouteStat {
  route: string;
  rides: number;
  share: number;
}
type Tab = "overview" | "users" | "drivers" | "rides" | "reports" | "monitor";

const users = [
  {
    id: "u101",
    name: "Mayurika Perera",
    email: "mayurika@student.icbt.lk",
    member: "Student",
    rideRole: "Driver + Passenger",
    status: "Verified",
    phone: "077 123 4567",
    idNo: "ICBT-ST-2026-001",
  },
  {
    id: "u102",
    name: "Kasun Fernando",
    email: "kasun@student.icbt.lk",
    member: "Student",
    rideRole: "Driver",
    status: "Verified",
    phone: "077 456 7821",
    idNo: "ICBT-ST-2026-014",
  },
  {
    id: "u103",
    name: "Dilan Jayasinghe",
    email: "dilan@icbt.lk",
    member: "Staff",
    rideRole: "Driver + Passenger",
    status: "Verified",
    phone: "071 889 1200",
    idNo: "ICBT-SF-2026-004",
  },
  {
    id: "u104",
    name: "Nethmi Silva",
    email: "nethmi@student.icbt.lk",
    member: "Student",
    rideRole: "Passenger",
    status: "Pending",
    phone: "076 552 3401",
    idNo: "ICBT-ST-2026-029",
  },
];
const reports = [
  {
    id: "REP-104",
    subject: "Demo User A",
    reason: "Inappropriate message",
    ride: "Nugegoda → ICBT",
    status: "Pending",
  },
  {
    id: "REP-103",
    subject: "Demo User B",
    reason: "Repeated ride cancellations",
    ride: "Maharagama → ICBT",
    status: "Reviewing",
  },
  {
    id: "REP-101",
    subject: "Ride #R204",
    reason: "Incorrect pickup information",
    ride: "Kottawa → ICBT",
    status: "Resolved",
  },
  {
    id: "REP-099",
    subject: "Driver feedback",
    reason: "Late departure",
    ride: "Dehiwala → ICBT",
    status: "Reviewing",
  },
];
const comments = [
  {
    name: "Amaya Perera",
    rating: 5,
    text: "Driver arrived on time and the pickup point was easy to find.",
    ride: "Nugegoda → ICBT",
    date: "Today",
  },
  {
    name: "Sahan Silva",
    rating: 4,
    text: "Smooth ride. Please keep the departure time consistent.",
    ride: "Maharagama → ICBT",
    date: "Yesterday",
  },
  {
    name: "Ravindu Fernando",
    rating: 5,
    text: "Very helpful driver and clear communication in chat.",
    ride: "Dehiwala → ICBT",
    date: "Yesterday",
  },
  {
    name: "Nethmi Silva",
    rating: 3,
    text: "Pickup was changed late. The passenger was notified afterwards.",
    ride: "Kottawa → ICBT",
    date: "2 days ago",
  },
];

export default function Admin() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [routes, setRoutes] = useState<RouteStat[]>([]);
  const [tab, setTab] = useState<Tab>("overview");
  const [message, setMessage] = useState("");
  const [selectedDriver, setSelectedDriver] = useState<
    (typeof drivers)[number] | null
  >(null);
  const [selectedRide, setSelectedRide] = useState<
    (typeof demoRides)[number] | null
  >(null);
  useEffect(() => {
    getAdminStats().then((x) => setStats(x as AdminStats));
    getRouteStats().then((x) => setRoutes(x as RouteStat[]));
  }, []);
  function action(text: string) {
    setMessage(text);
    window.setTimeout(() => setMessage(""), 2200);
  }
  function openDriver(driver: (typeof drivers)[number]) {
    setSelectedDriver(driver);
  }
  function openRide(ride: (typeof demoRides)[number]) {
    setSelectedRide(ride);
  }
  const tabs: [Tab, string, React.ElementType][] = [
    ["overview", "Dashboard", BarChart3],
    ["users", "User Profiles", Users],
    ["drivers", "Driver Profiles", Car],
    ["rides", "Ride Details", RouteIcon],
    ["reports", "Reports", Flag],
    ["monitor", "Monitor Rides", Activity],
  ];
  return (
    <div className="page admin-page">
      <div className="page-heading">
        <div>
          <span className="eyebrow">ADMINISTRATION</span>
          <h1>Admin Control Centre</h1>
          <p>
            Manage community profiles, inspect driver details, review reports
            and monitor ride activity.
          </p>
        </div>
        <span className="admin-badge">
          <ShieldAlert size={15} /> Authorised Admin
        </span>
      </div>
      <div className="admin-security-banner">
        <div>
          <ShieldAlert size={18} />
          <div>
            <strong>Administrator mode</strong>
            <span>
              Only authorised administrator accounts can access these controls.
            </span>
          </div>
        </div>
        <span>Protected session</span>
      </div>
      {message && (
        <div className="alert success">
          <CheckCircle2 size={16} />
          {message}
        </div>
      )}
      <div className="admin-tabs">
        {tabs.map(([key, label, Icon]) => (
          <button
            key={key}
            className={tab === key ? "active" : ""}
            onClick={() => setTab(key)}
          >
            <Icon size={15} />
            {label}
          </button>
        ))}
      </div>
      {tab === "overview" && (
        <Overview stats={stats} routes={routes} comments={comments} />
      )}
      {tab === "users" && <UsersPanel onAction={action} />}
      {tab === "drivers" && (
        <DriversPanel onAction={action} onOpen={openDriver} />
      )}
      {tab === "rides" && <RidesPanel onAction={action} />}
      {tab === "reports" && <ReportsPanel routes={routes} onAction={action} />}
      {tab === "monitor" && (
        <MonitorPanel onAction={action} onOpen={openRide} />
      )}
      <Modal
        open={!!selectedDriver}
        title={
          selectedDriver
            ? `${selectedDriver.name} · Driver details`
            : "Driver details"
        }
        onClose={() => setSelectedDriver(null)}
      >
        {selectedDriver && <DriverDetails driver={selectedDriver} />}
      </Modal>
      <Modal
        open={!!selectedRide}
        title={
          selectedRide
            ? `${selectedRide.origin} → ${selectedRide.destination}`
            : "Ride monitor"
        }
        onClose={() => setSelectedRide(null)}
      >
        {selectedRide && <RideMonitor ride={selectedRide} />}
      </Modal>
    </div>
  );
}

function Overview({
  stats,
  routes,
  comments,
}: {
  stats: AdminStats | null;
  routes: RouteStat[];
  comments: any[];
}) {
  return (
    <>
      {stats && (
        <div className="metric-grid admin-metrics">
          <Metric
            icon={<Users />}
            label="Total Users"
            value={stats.totalUsers}
          />
          <Metric
            icon={<Activity />}
            label="Active Users"
            value={stats.activeUsers}
          />
          <Metric icon={<Car />} label="Total Rides" value={stats.totalRides} />
          <Metric
            icon={<BarChart3 />}
            label="Completed Rides"
            value={stats.completedRides}
          />
        </div>
      )}
      <div className="admin-chart-grid">
        <section className="panel">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">RIDE PARTICIPATION</span>
              <h2>Ride distribution</h2>
              <p>Quick visual summary of platform ride activity.</p>
            </div>
          </div>
          <div className="pie-layout">
            <div className="pie-chart">
              <div className="pie-center">
                <strong>1,284</strong>
                <span>Total rides</span>
              </div>
            </div>
            <div className="chart-legend">
              <Legend
                color="#4F46E5"
                label="Completed rides"
                value="591 · 46%"
              />
              <Legend
                color="#06B6D4"
                label="Active / Available"
                value="334 · 26%"
              />
              <Legend
                color="#8B5CF6"
                label="Cancelled rides"
                value="193 · 15%"
              />
              <Legend color="#F472B6" label="Other status" value="166 · 13%" />
            </div>
          </div>
        </section>
        <section className="panel">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">RIDE WORKFLOW</span>
              <h2>Request to completion</h2>
              <p>Simple operational flow for monitoring the ride lifecycle.</p>
            </div>
          </div>
          <div className="flow-chart">
            <Flow title="Ride Posted" text="Driver publishes" />
            <span className="flow-arrow">→</span>
            <Flow title="Join Request" text="Passenger requests" />
            <span className="flow-arrow">→</span>
            <Flow title="Accepted" text="Seat confirmed" />
            <span className="flow-arrow">→</span>
            <Flow title="Started" text="Trip begins" />
            <span className="flow-arrow">→</span>
            <Flow title="Completed" text="Trip ends" />
          </div>
        </section>
      </div>
      <div className="admin-grid" style={{ marginTop: 13 }}>
        <section className="panel">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">POPULAR ROUTES</span>
              <h2>Route activity</h2>
            </div>
          </div>
          <div className="bar-list">
            {routes.slice(0, 5).map((r) => {
              const width = Math.min(r.share * 2.5, 100);
              return (
                <div className="bar-row" key={r.route}>
                  <div>
                    <strong>{r.route}</strong>
                    <span>{r.rides} rides</span>
                  </div>
                  <div className="bar">
                    <i style={{ width: `${width}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </section>
        <CommentsPanel comments={comments} />
      </div>
    </>
  );
}

function UsersPanel({ onAction }: { onAction: (x: string) => void }) {
  return (
    <section className="panel admin-table-panel">
      <div className="panel-heading">
        <div>
          <span className="eyebrow">USER PROFILES</span>
          <h2>Manage User Profiles</h2>
          <p>
            View profile details, membership type, carpool role and verification
            status.
          </p>
        </div>
      </div>
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Profile</th>
              <th>Member</th>
              <th>Carpool role</th>
              <th>Verification</th>
              <th>Details</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>
                  <div className="table-user">
                    <div className="avatar">{u.name[0]}</div>
                    <div>
                      <strong>{u.name}</strong>
                      <small>{u.email}</small>
                    </div>
                  </div>
                </td>
                <td>{u.member}</td>
                <td>{u.rideRole}</td>
                <td>
                  <span
                    className={`status ${u.status === "Verified" ? "status-open" : "status-requested"}`}
                  >
                    {u.status}
                  </span>
                </td>
                <td>
                  <button
                    className="icon-button"
                    title="View profile details"
                    onClick={() =>
                      onAction(`${u.name} · ${u.phone} · ${u.idNo}`)
                    }
                  >
                    <Eye size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function DriversPanel({
  onAction,
  onOpen,
}: {
  onAction: (x: string) => void;
  onOpen: (driver: (typeof drivers)[number]) => void;
}) {
  return (
    <section className="panel">
      <div className="panel-heading">
        <div>
          <span className="eyebrow">DRIVER PROFILES</span>
          <h2>Driver Profiles & Details</h2>
          <p>
            Inspect verified drivers, ratings, trips, contact information and
            vehicle information.
          </p>
        </div>
      </div>
      <div className="driver-profile-grid">
        {drivers.map((d) => (
          <article className="driver-profile-card" key={d.id}>
            <div className="driver-profile-head">
              <div className="avatar large">{d.name[0]}</div>
              <div>
                <strong>{d.name}</strong>
                <span>{d.email}</span>
                <span className="verified-inline">
                  <CheckCircle2 size={12} /> Verified driver
                </span>
              </div>
            </div>
            <div className="driver-profile-stats">
              <div>
                <span>Rating</span>
                <strong>
                  <Star size={12} fill="currentColor" /> {d.rating}
                </strong>
              </div>
              <div>
                <span>Trips</span>
                <strong>{d.totalTrips}</strong>
              </div>
              <div>
                <span>Role</span>
                <strong>{d.rideRole}</strong>
              </div>
            </div>
            <div className="driver-profile-details">
              <p>
                <b>Member:</b> {d.role}
              </p>
              <p>
                <b>Vehicle:</b> Demo verified vehicle
              </p>
              <p>
                <b>Pickup area:</b> Colombo region
              </p>
            </div>
            <button
              className="button button-outline full"
              onClick={() => onOpen(d)}
            >
              <Eye size={14} /> View full driver details
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}

function RidesPanel({ onAction }: { onAction: (x: string) => void }) {
  return (
    <section className="panel admin-table-panel">
      <div className="panel-heading">
        <div>
          <span className="eyebrow">RIDE DETAILS</span>
          <h2>Manage Ride Details</h2>
          <p>
            Inspect route, driver, schedule, capacity, contribution and ride
            comments.
          </p>
        </div>
      </div>
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Route</th>
              <th>Driver</th>
              <th>Schedule</th>
              <th>Seats</th>
              <th>Status</th>
              <th>Details</th>
            </tr>
          </thead>
          <tbody>
            {demoRides.map((r) => (
              <tr key={r.id}>
                <td>
                  <strong>
                    {r.origin} → {r.destination}
                  </strong>
                  <small>
                    #{r.id.toUpperCase()} · Rs. {r.price}
                  </small>
                </td>
                <td>{r.driver.name}</td>
                <td>
                  {r.date}
                  <br />
                  {r.time}
                </td>
                <td>
                  {r.seatsAvailable}/{r.seats}
                </td>
                <td>
                  <span
                    className={`status ${r.status === "open" ? "status-open" : "status-requested"}`}
                  >
                    {r.status}
                  </span>
                </td>
                <td>
                  <button
                    className="icon-button"
                    onClick={() =>
                      onAction(
                        `${r.origin} → ${r.destination} · ${r.driver.name} · ${r.notes || "No notes"}`,
                      )
                    }
                  >
                    <Eye size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function ReportsPanel({
  routes,
  onAction,
}: {
  routes: RouteStat[];
  onAction: (x: string) => void;
}) {
  return (
    <div className="reports-grid">
      <section className="panel admin-table-panel">
        <div className="panel-heading">
          <div>
            <span className="eyebrow">REPORT ANALYTICS</span>
            <h2>View Reports</h2>
            <p>
              Visualise report categories and review the operational workflow.
            </p>
          </div>
        </div>
        <div className="pie-layout" style={{ padding: 20 }}>
          <div className="pie-chart report-pie">
            <div className="pie-center">
              <strong>4</strong>
              <span>Reports</span>
            </div>
          </div>
          <div className="chart-legend">
            <Legend color="#4F46E5" label="Communication" value="1 · 25%" />
            <Legend color="#06B6D4" label="Ride details" value="1 · 25%" />
            <Legend color="#8B5CF6" label="Cancellation" value="1 · 25%" />
            <Legend color="#F472B6" label="Other" value="1 · 25%" />
          </div>
        </div>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Report</th>
                <th>Subject</th>
                <th>Reason</th>
                <th>Ride</th>
                <th>Status</th>
                <th>Review</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((r) => (
                <tr key={r.id}>
                  <td>
                    <strong>{r.id}</strong>
                  </td>
                  <td>{r.subject}</td>
                  <td>{r.reason}</td>
                  <td>{r.ride}</td>
                  <td>
                    <span className="status status-requested">{r.status}</span>
                  </td>
                  <td>
                    <button
                      className="button button-outline small"
                      onClick={() =>
                        onAction(`${r.id} opened for admin review.`)
                      }
                    >
                      Review
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <section className="panel">
        <div className="panel-heading">
          <div>
            <span className="eyebrow">RIDE COMMENTS</span>
            <h2>User comments & feedback</h2>
            <p>Comments attached to completed and active ride experiences.</p>
          </div>
          <MessageSquare size={18} />
        </div>
        <CommentsPanel comments={comments} />
      </section>
    </div>
  );
}

function MonitorPanel({
  onAction,
  onOpen,
}: {
  onAction: (x: string) => void;
  onOpen: (ride: (typeof demoRides)[number]) => void;
}) {
  const active = demoRides.filter(
    (r) => r.status === "open" || r.status === "started",
  );
  return (
    <section className="panel">
      <div className="panel-heading">
        <div>
          <span className="eyebrow">LIVE MONITORING</span>
          <h2>Monitor Active Rides</h2>
          <p>
            Operational view of currently available and in-progress journeys.
          </p>
        </div>
        <span className="pill">
          <span className="live-dot" /> Live monitor
        </span>
      </div>
      <div className="monitor-grid">
        {active.map((r) => (
          <article className="monitor-card" key={r.id}>
            <div className="monitor-top">
              <span className="status status-open">
                {r.status === "started" ? "In progress" : "Available"}
              </span>
              <strong>{r.time}</strong>
            </div>
            <h3>
              {r.origin} → {r.destination}
            </h3>
            <p>
              {r.driver.name} · {r.seatsAvailable} seats remaining · Rs.{" "}
              {r.price} contribution
            </p>
            <div className="monitor-route">
              <div />
              <span>Current operational status</span>
            </div>
            <button
              className="button button-outline full"
              onClick={() => {
                onAction(`${r.id.toUpperCase()} monitoring details opened.`);
                onOpen(r);
              }}
            >
              Open ride monitor
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}

function DriverDetails({ driver }: { driver: (typeof drivers)[number] }) {
  return (
    <div className="admin-detail-modal">
      <div className="table-user">
        <div className="avatar large">{driver.name[0]}</div>
        <div>
          <strong>{driver.name}</strong>
          <small>{driver.email}</small>
        </div>
      </div>
      <div className="detail-info-grid">
        <div>
          <small>Role</small>
          <strong>{driver.rideRole}</strong>
        </div>
        <div>
          <small>Member</small>
          <strong>{driver.role}</strong>
        </div>
        <div>
          <small>Rating</small>
          <strong>★ {driver.rating}</strong>
        </div>
        <div>
          <small>Total trips</small>
          <strong>{driver.totalTrips}</strong>
        </div>
        <div>
          <small>Phone</small>
          <strong>{driver.phone || "Not provided"}</strong>
        </div>
        <div>
          <small>Verification</small>
          <strong>{driver.verified ? "Verified" : "Pending"}</strong>
        </div>
      </div>
      <div className="admin-detail-list">
        <p>
          <b>Vehicle:</b> Demo verified vehicle
        </p>
        <p>
          <b>Pickup area:</b> Colombo region
        </p>
        <p>
          <b>Driver status:</b> Active
        </p>
      </div>
    </div>
  );
}

function RideMonitor({ ride }: { ride: (typeof demoRides)[number] }) {
  const passengers = demoBookings.filter((b) => b.rideId === ride.id);
  return (
    <div className="admin-detail-modal">
      <div className="detail-info-grid">
        <div>
          <small>Status</small>
          <strong>{ride.status}</strong>
        </div>
        <div>
          <small>Driver</small>
          <strong>{ride.driver.name}</strong>
        </div>
        <div>
          <small>Schedule</small>
          <strong>
            {ride.date} · {ride.time}
          </strong>
        </div>
        <div>
          <small>Seats</small>
          <strong>
            {ride.seatsAvailable}/{ride.seats} available
          </strong>
        </div>
        <div>
          <small>Contribution</small>
          <strong>Rs. {ride.price}</strong>
        </div>
        <div>
          <small>Distance</small>
          <strong>{ride.distanceKm ?? "—"} km</strong>
        </div>
      </div>
      <div className="admin-detail-list">
        <h4>Passenger details</h4>
        {passengers.length ? (
          <div className="passenger-detail-list">
            {passengers.map((b) => (
              <div className="passenger-detail" key={b.id}>
                <div className="avatar">{b.passenger.name[0]}</div>
                <div>
                  <strong>{b.passenger.name}</strong>
                  <small>
                    {b.passenger.email} ·{" "}
                    {b.passenger.phone || "Phone not provided"}
                  </small>
                  <span>
                    {b.status} · Requested{" "}
                    {new Date(b.requestedAt).toLocaleString("en-GB")}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p>No passenger bookings for this ride yet.</p>
        )}
        <p>
          <b>Notes:</b> {ride.notes || "No additional notes."}
        </p>
      </div>
    </div>
  );
}

function CommentsPanel({
  comments,
}: {
  comments: {
    name: string;
    rating: number;
    text: string;
    ride: string;
    date: string;
  }[];
}) {
  return (
    <div className="ride-comment-list">
      {comments.map((c, i) => (
        <article className="ride-comment" key={`${c.name}-${i}`}>
          <div className="ride-comment-top">
            <strong>{c.name}</strong>
            <span>{c.date}</span>
          </div>
          <div style={{ fontSize: 8, color: "#7C3AED", marginTop: 3 }}>
            {"★".repeat(c.rating)}
            {"☆".repeat(5 - c.rating)}
          </div>
          <p>{c.text}</p>
          <small style={{ fontSize: 7, color: "#8b959b" }}>{c.ride}</small>
        </article>
      ))}
    </div>
  );
}
function Metric({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
}) {
  return (
    <div className="metric-card">
      <div className="metric-icon">{icon}</div>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
function Legend({
  color,
  label,
  value,
}: {
  color: string;
  label: string;
  value: string;
}) {
  return (
    <div className="legend-row">
      <i className="legend-dot" style={{ background: color }} />
      <strong>{label}</strong>
      <span>{value}</span>
    </div>
  );
}
function Flow({ title, text }: { title: string; text: string }) {
  return (
    <div className="flow-node">
      <strong>{title}</strong>
      <small>{text}</small>
    </div>
  );
}
