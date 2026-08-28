import {
  Bell,
  CheckCircle2,
  Clock3,
  MessageCircle,
  Search,
  UserCheck,
  XCircle,
  CarFront,
  MapPin,
} from "lucide-react";
import { useEffect, useState } from "react";
import { getNotifications, markNotificationRead } from "../services/featureApi";
import { useNavigate } from "react-router-dom";
const icons: any = {
  match: Search,
  request: UserCheck,
  reminder: Clock3,
  message: MessageCircle,
  success: CheckCircle2,
  cancelled: XCircle,
  ride_available: CarFront,
};
export default function Notifications() {
  const [items, setItems] = useState<any[]>([]);
  const navigate = useNavigate();
  useEffect(() => {
    getNotifications()
      .then((items) => setItems(items as any[]))
      .catch(() => setItems([]));
  }, []);
  async function read(id: string) {
    await markNotificationRead(id);
    setItems((x) => x.map((n) => (n.id === id ? { ...n, unread: false } : n)));
  }
  function openNotification(n: any) {
    read(n.id);
    if ((n.type === "ride_available" || n.type === "waitlist") && n.rideId)
      navigate(`/rides/${n.rideId}`);
  }
  return (
    <div className="page">
      <div className="page-heading">
        <div>
          <span className="eyebrow">UPDATES</span>
          <h1>Notifications</h1>
          <p>Ride matches, requests, reminders and messages in one place.</p>
        </div>
        <Bell size={23} />
      </div>
      <div className="notification-list">
        {items.map((n) => {
          const Icon = icons[n.type] || Bell;
          return (
            <button
              className={`notification ${n.unread ? "unread" : ""}`}
              key={n.id}
              onClick={() => openNotification(n)}
            >
              <div className="notification-icon">
                <Icon size={17} />
              </div>
              <div>
                <strong>{n.title}</strong>
                <p>{n.text}</p>
                <small>{n.time}</small>
              </div>
              {n.unread && <span className="unread-dot" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}
