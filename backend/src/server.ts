import "dotenv/config";
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import bcrypt from "bcrypt";
import { Pool, QueryResultRow } from "pg";
import { generateToken, verifyToken } from "./utils/jwt";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const app = express();

/* =========================
   CORS CONFIGURATION
========================= */

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5175",
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS blocked origin: ${origin}`));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use(express.json({ limit: "1mb" }));

// YOUR EXISTING ROUTES BELOW THIS LINE
interface R extends Request {
  userId?: number;
  userRole?: string;
}
function auth(req: R, res: Response, next: NextFunction) {
  try {
    const h = req.headers.authorization;
    if (!h?.startsWith("Bearer "))
      return res.status(401).json({ message: "Authentication required" });
    const p = verifyToken(h.slice(7));
    req.userId = p.userId;
    req.userRole = p.role;
    next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}
function admin(req: R, res: Response, next: NextFunction) {
  if (req.userRole !== "ADMIN")
    return res.status(403).json({ message: "Administrator access required" });
  next();
}
async function q<T extends QueryResultRow = any>(
  text: string,
  params: any[] = [],
) {
  return pool.query<T>(text, params);
}
async function userRow(id: number) {
  const r = await q(
    `SELECT u.*,COALESCE((SELECT ROUND(AVG(r.rating)::numeric,1) FROM reviews r WHERE r.reviewed_user_id=u.id),0) rating,COALESCE((SELECT COUNT(*) FROM bookings b WHERE b.passenger_id=u.id AND b.status IN ('CONFIRMED','COMPLETED')),0) total_trips FROM users u WHERE u.id=$1`,
    [id],
  );
  return r.rows[0];
}
function mapUser(u: any) {
  return {
    id: String(u.id),
    name: `${u.first_name} ${u.last_name}`.trim(),
    email: u.email,
    role: u.member_type.toLowerCase(),
    rideRole: u.ride_role.toLowerCase(),
    phone: u.phone || undefined,
    username:
      u.role === "ADMIN"
        ? process.env.ADMIN_USERNAME || "icbt.admin"
        : undefined,
    isAdmin: u.role === "ADMIN",
    rating: Number(u.rating || 0),
    totalTrips: Number(u.total_trips || 0),
    verified: Boolean(u.verified),
  };
}
function mapRide(r: any) {
  return {
    id: String(r.id),
    driver: mapUser(r.driver),
    origin: r.start_location,
    destination: r.destination,
    date: new Date(r.departure_time).toISOString().slice(0, 10),
    time: new Date(r.departure_time).toTimeString().slice(0, 5),
    seats: Number(r.seats),
    seatsAvailable: Number(r.available_seats),
    price: Number(r.price_per_seat),
    vehicleType:
      r.vehicle_type === "THREE_WHEELER"
        ? "Three-Wheeler"
        : r.vehicle_type[0] + r.vehicle_type.slice(1).toLowerCase(),
    notes: r.notes || "",
    status: r.status.toLowerCase(),
    distanceKm: r.distance_km == null ? undefined : Number(r.distance_km),
    recurring: Boolean(r.recurring),
    pickupZone: r.pickup_zone || undefined,
    preferences: {
      music: r.music,
      ac: r.ac,
      smoking: r.smoking,
      conversation: r.conversation,
      pets: r.pets,
    },
  };
}
function mapBooking(b: any) {
  return {
    id: String(b.id),
    rideId: String(b.ride_id),
    passenger: mapUser(b.passenger),
    status: b.status.toLowerCase(),
    requestedAt: new Date(b.created_at).toISOString(),
  };
}

async function initDb() {
  await q(`CREATE TABLE IF NOT EXISTS users(id SERIAL PRIMARY KEY,first_name TEXT NOT NULL,last_name TEXT NOT NULL,email TEXT UNIQUE NOT NULL,password_hash TEXT NOT NULL,phone TEXT,member_type TEXT NOT NULL DEFAULT 'STUDENT',ride_role TEXT NOT NULL DEFAULT 'BOTH',role TEXT NOT NULL DEFAULT 'USER',verified BOOLEAN NOT NULL DEFAULT TRUE,is_blocked BOOLEAN NOT NULL DEFAULT FALSE,created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW());
CREATE TABLE IF NOT EXISTS rides(id SERIAL PRIMARY KEY,driver_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,start_location TEXT NOT NULL,destination TEXT NOT NULL,departure_time TIMESTAMPTZ NOT NULL,seats INT NOT NULL,available_seats INT NOT NULL,price_per_seat NUMERIC(10,2) NOT NULL,vehicle_type TEXT NOT NULL DEFAULT 'CAR',notes TEXT,pickup_zone TEXT,music TEXT NOT NULL DEFAULT 'yes',ac TEXT NOT NULL DEFAULT 'yes',smoking TEXT NOT NULL DEFAULT 'not_allowed',conversation TEXT NOT NULL DEFAULT 'normal',pets TEXT NOT NULL DEFAULT 'not_allowed',distance_km DOUBLE PRECISION,recurring BOOLEAN NOT NULL DEFAULT FALSE,ride_code TEXT NOT NULL,status TEXT NOT NULL DEFAULT 'ACTIVE',created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW());
CREATE TABLE IF NOT EXISTS bookings(id SERIAL PRIMARY KEY,ride_id INT NOT NULL REFERENCES rides(id) ON DELETE CASCADE,passenger_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,seats INT NOT NULL DEFAULT 1,status TEXT NOT NULL DEFAULT 'PENDING',created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),UNIQUE(ride_id,passenger_id));
CREATE TABLE IF NOT EXISTS reviews(id SERIAL PRIMARY KEY,ride_id INT NOT NULL REFERENCES rides(id) ON DELETE CASCADE,reviewer_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,reviewed_user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,rating INT NOT NULL CHECK(rating BETWEEN 1 AND 5),comment TEXT,created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),UNIQUE(ride_id,reviewer_id));
CREATE TABLE IF NOT EXISTS notifications(id SERIAL PRIMARY KEY,user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,title TEXT NOT NULL,message TEXT NOT NULL,type TEXT NOT NULL DEFAULT 'system',ride_id INT,is_read BOOLEAN NOT NULL DEFAULT FALSE,created_at TIMESTAMPTZ NOT NULL DEFAULT NOW());
CREATE TABLE IF NOT EXISTS messages(id SERIAL PRIMARY KEY,ride_id INT NOT NULL REFERENCES rides(id) ON DELETE CASCADE,sender_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,text TEXT NOT NULL,created_at TIMESTAMPTZ NOT NULL DEFAULT NOW());
CREATE TABLE IF NOT EXISTS checkins(id SERIAL PRIMARY KEY,booking_id INT UNIQUE NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,ride_id INT NOT NULL REFERENCES rides(id) ON DELETE CASCADE,passenger_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,checked_in_at TIMESTAMPTZ NOT NULL DEFAULT NOW());
CREATE TABLE IF NOT EXISTS waitlists(id SERIAL PRIMARY KEY,ride_id INT NOT NULL REFERENCES rides(id) ON DELETE CASCADE,passenger_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,seats INT NOT NULL DEFAULT 1,position INT NOT NULL,created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),UNIQUE(ride_id,passenger_id));
CREATE TABLE IF NOT EXISTS trusted_contacts(id SERIAL PRIMARY KEY,user_id INT UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,name TEXT NOT NULL,phone TEXT NOT NULL,email TEXT);
CREATE TABLE IF NOT EXISTS reports(id SERIAL PRIMARY KEY,reporter_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,reported_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,reason TEXT NOT NULL,status TEXT NOT NULL DEFAULT 'submitted',created_at TIMESTAMPTZ NOT NULL DEFAULT NOW());
CREATE TABLE IF NOT EXISTS blocks(id SERIAL PRIMARY KEY,blocker_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,blocked_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),UNIQUE(blocker_id,blocked_id));
CREATE TABLE IF NOT EXISTS impacts(id SERIAL PRIMARY KEY,ride_id INT NOT NULL REFERENCES rides(id) ON DELETE CASCADE,distance_km DOUBLE PRECISION NOT NULL,passengers INT NOT NULL,fuel_saved DOUBLE PRECISION NOT NULL,money_saved DOUBLE PRECISION NOT NULL,co2 DOUBLE PRECISION NOT NULL,created_at TIMESTAMPTZ NOT NULL DEFAULT NOW());`);
}

app.get("/", (_req, res) =>
  res.json({ message: "ICBT Carpooling API is running" }),
);
app.get("/api/health", async (_req, res) => {
  try {
    await q("SELECT 1");
    res.json({
      status: "OK",
      message: "Backend API is healthy",
      database: "connected",
    });
  } catch {
    res.status(503).json({ status: "ERROR", message: "Database unavailable" });
  }
});
app.get("/api/users/me", auth, async (req: R, res) => {
  const u = await userRow(req.userId!);
  if (!u) return res.status(404).json({ message: "User not found" });
  res.json(mapUser(u));
});

app.post("/api/auth/register", async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role = "student",
      rideRole = "both",
    } = req.body;
    if (!name || !email || !password || String(password).length < 8)
      return res.status(400).json({
        message:
          "Name, valid email and password of at least 8 characters are required.",
      });
    const e = String(email).trim().toLowerCase();
    if ((await q("SELECT 1 FROM users WHERE email=$1", [e])).rowCount)
      return res
        .status(409)
        .json({ message: "An account with this email already exists." });
    const p = String(name).trim().split(/\s+/),
      first = p.shift() || "User",
      last = p.join(" ") || "";
    const h = await bcrypt.hash(password, 12);
    const u = (
      await q(
        `INSERT INTO users(first_name,last_name,email,password_hash,member_type,ride_role) VALUES($1,$2,$3,$4,$5,$6) RETURNING id`,
        [
          first,
          last,
          e,
          h,
          String(role).toUpperCase() === "STAFF" ? "STAFF" : "STUDENT",
          String(rideRole).toUpperCase() === "DRIVER"
            ? "DRIVER"
            : String(rideRole).toUpperCase() === "PASSENGER"
              ? "PASSENGER"
              : "BOTH",
        ],
      )
    ).rows[0];
    const full = await userRow(u.id);
    res.status(201).json({
      user: mapUser(full),
      token: generateToken({ userId: u.id, role: "USER" }),
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Unable to create account." });
  }
});
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password, username, accountType } = req.body;
    if (accountType === "admin") {
      if (
        (username || email) !== (process.env.ADMIN_USERNAME || "icbt.admin") ||
        password !== (process.env.ADMIN_PASSWORD || "Carpool@Admin2026")
      )
        return res
          .status(401)
          .json({ message: "Invalid administrator username or password." });
      let u = (await q("SELECT id FROM users WHERE role='ADMIN' LIMIT 1"))
        .rows[0];
      if (!u) {
        const h = await bcrypt.hash(
          process.env.ADMIN_PASSWORD || "Carpool@Admin2026",
          12,
        );
        u = (
          await q(
            `INSERT INTO users(first_name,last_name,email,password_hash,member_type,ride_role,role) VALUES('ICBT System','Administrator',$1,$2,'STAFF','BOTH','ADMIN') RETURNING id`,
            [process.env.ADMIN_EMAIL || "admin@icbt.lk", h],
          )
        ).rows[0];
      }
      const full = await userRow(u.id);
      return res.json({
        user: mapUser(full),
        token: generateToken({ userId: u.id, role: "ADMIN" }),
      });
    }
    const e = String(email || "")
      .trim()
      .toLowerCase();
    const u = (
      await q("SELECT id,password_hash,is_blocked FROM users WHERE email=$1", [
        e,
      ])
    ).rows[0];
    if (
      !u ||
      u.is_blocked ||
      !(await bcrypt.compare(String(password || ""), u.password_hash))
    )
      return res.status(401).json({ message: "Invalid email or password." });
    const full = await userRow(u.id);
    res.json({
      user: mapUser(full),
      token: generateToken({ userId: u.id, role: "USER" }),
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Unable to sign in." });
  }
});

app.get("/api/users/me", auth, async (req: R, res) => {
  const u = await userRow(req.userId!);
  if (!u) return res.status(404).json({ message: "User not found" });
  res.json(mapUser(u));
});
app.patch("/api/users/me", auth, async (req: R, res) => {
  const parts = String(req.body.name || "")
    .trim()
    .split(/\s+/);
  await q(
    "UPDATE users SET first_name=$1,last_name=$2,phone=$3,updated_at=NOW() WHERE id=$4",
    [
      parts.shift() || "User",
      parts.join(" "),
      req.body.phone || null,
      req.userId,
    ],
  );
  res.json(mapUser(await userRow(req.userId!)));
});

async function rideRows(where: string, params: any[]) {
  return (
    await q(
      `SELECT r.*,json_build_object('id',u.id,'first_name',u.first_name,'last_name',u.last_name,'email',u.email,'phone',u.phone,'member_type',u.member_type,'ride_role',u.ride_role,'role',u.role,'verified',u.verified,'rating',COALESCE((SELECT ROUND(AVG(rv.rating)::numeric,1) FROM reviews rv WHERE rv.reviewed_user_id=u.id),0),'total_trips',COALESCE((SELECT COUNT(*) FROM bookings bb WHERE bb.passenger_id=u.id AND bb.status IN ('CONFIRMED','COMPLETED')),0)) driver FROM rides r JOIN users u ON u.id=r.driver_id ${where} ORDER BY r.departure_time ASC`,
      params,
    )
  ).rows;
}
app.get("/api/rides", auth, async (req: R, res) => {
  const x = req.query as any;
  const cond: string[] = [`r.status IN ('ACTIVE','FULL','STARTED')`],
    p: any[] = [];
  if (x.driver === "me") {
    p.push(req.userId);
    cond.push(`r.driver_id=$${p.length}`);
  }
  if (x.origin) {
    p.push(`%${x.origin}%`);
    cond.push(`r.start_location ILIKE $${p.length}`);
  }
  if (x.destination) {
    p.push(`%${x.destination}%`);
    cond.push(`r.destination ILIKE $${p.length}`);
  }
  if (x.date) {
    p.push(x.date);
    cond.push(
      `r.departure_time >= $${p.length}::date AND r.departure_time < ($${p.length}::date + INTERVAL '1 day')`,
    );
  }
  if (x.seats) {
    p.push(Number(x.seats));
    cond.push(`r.available_seats >= $${p.length}`);
  }
  if (x.maxPrice) {
    p.push(Number(x.maxPrice));
    cond.push(`r.price_per_seat <= $${p.length}`);
  }
  let rows = await rideRows("WHERE " + cond.join(" AND "), p);
  if (x.sort === "price")
    rows.sort((a, b) => Number(a.price_per_seat) - Number(b.price_per_seat));
  if (x.sort === "seats")
    rows.sort((a, b) => Number(b.available_seats) - Number(a.available_seats));
  res.json(rows.map(mapRide));
});
app.get("/api/rides/:id", auth, async (req, res) => {
  const rows = await rideRows("WHERE r.id=$1", [Number(req.params.id)]);
  if (!rows[0]) return res.status(404).json({ message: "Ride not found" });
  res.json(mapRide(rows[0]));
});
app.post("/api/rides", auth, async (req: R, res) => {
  try {
    const {
      origin,
      destination,
      date,
      time,
      seats,
      price,
      vehicleType = "Car",
      notes = "",
      pickupZone,
      preferences,
      distanceKm,
      recurring = false,
    } = req.body;
    if (!origin || !destination || !date || !time || !seats || price == null)
      return res.status(400).json({
        message:
          "Origin, destination, date, time, seats and price are required.",
      });
    const vt = String(vehicleType)
      .toUpperCase()
      .replace(/-/g, "_")
      .replace(/ /g, "_");
    const code = String(Math.floor(1000 + Math.random() * 9000));
    const r = (
      await q(
        `INSERT INTO rides(driver_id,start_location,destination,departure_time,seats,available_seats,price_per_seat,vehicle_type,notes,pickup_zone,music,ac,smoking,conversation,pets,distance_km,recurring,ride_code) VALUES($1,$2,$3,$4,$5,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17) RETURNING id`,
        [
          req.userId,
          origin,
          destination,
          new Date(`${date}T${time}:00`),
          Number(seats),
          Number(price),
          vt,
          notes,
          pickupZone,
          preferences?.music || "yes",
          preferences?.ac || "yes",
          preferences?.smoking || "not_allowed",
          preferences?.conversation || "normal",
          preferences?.pets || "not_allowed",
          distanceKm || null,
          Boolean(recurring),
          code,
        ],
      )
    ).rows[0];
    res.status(201).json(mapRide((await rideRows("WHERE r.id=$1", [r.id]))[0]));
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Unable to create ride." });
  }
});
app.post("/api/rides/recurring", auth, async (req: R, res) => {
  const { payload, days, until } = req.body;
  const out = [];
  for (
    let d = new Date(`${payload.date}T12:00:00`),
      end = new Date(`${until}T12:00:00`);
    d <= end;
    d.setDate(d.getDate() + 1)
  ) {
    if (days.includes(d.toLocaleDateString("en-US", { weekday: "long" }))) {
      const date = d.toISOString().slice(0, 10);
      const r = await q(
        `INSERT INTO rides(driver_id,start_location,destination,departure_time,seats,available_seats,price_per_seat,vehicle_type,notes,pickup_zone,music,ac,smoking,conversation,pets,recurring,ride_code) VALUES($1,$2,$3,$4,$5,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,true,$15) RETURNING id`,
        [
          req.userId,
          payload.origin,
          payload.destination,
          new Date(`${date}T${payload.time}:00`),
          payload.seats,
          payload.price,
          String(payload.vehicleType)
            .toUpperCase()
            .replace(/-/g, "_")
            .replace(/ /g, "_"),
          payload.notes,
          payload.pickupZone,
          payload.preferences?.music || "yes",
          payload.preferences?.ac || "yes",
          payload.preferences?.smoking || "not_allowed",
          payload.preferences?.conversation || "normal",
          payload.preferences?.pets || "not_allowed",
          String(Math.floor(1000 + Math.random() * 9000)),
        ],
      );
      out.push(mapRide((await rideRows("WHERE r.id=$1", [r.rows[0].id]))[0]));
    }
  }
  res.status(201).json(out);
});
app.patch("/api/rides/:id/status", auth, async (req: R, res) => {
  const id = Number(req.params.id),
    s = String(req.body.status || "").toUpperCase();
  const r = (
    await q("SELECT * FROM rides WHERE id=$1 AND driver_id=$2", [
      id,
      req.userId,
    ])
  ).rows[0];
  if (!r) return res.status(404).json({ message: "Ride not found" });
  if (!["ACTIVE", "FULL", "STARTED", "COMPLETED", "CANCELLED"].includes(s))
    return res.status(400).json({ message: "Invalid ride status" });
  await q("UPDATE rides SET status=$1,updated_at=NOW() WHERE id=$2", [s, id]);
  if (s === "COMPLETED") {
    const c = Number(
      (
        await q(
          `SELECT COUNT(*) n FROM bookings WHERE ride_id=$1 AND status='CONFIRMED'`,
          [id],
        )
      ).rows[0].n,
    );
    const dist = Number(r.distance_km || 10),
      saved = Math.max(0, (dist / 12) * Math.max(0, c - 1));
    await q(
      `INSERT INTO impacts(ride_id,distance_km,passengers,fuel_saved,money_saved,co2) VALUES($1,$2,$3,$4,$5,$6)`,
      [id, dist, c, saved, saved * 340, saved * 2.31],
    );
    await q(
      `UPDATE bookings SET status='COMPLETED',updated_at=NOW() WHERE ride_id=$1 AND status='CONFIRMED'`,
      [id],
    );
  }
  res.json({ id: String(id), status: s.toLowerCase() });
});

app.post("/api/rides/:id/join", auth, async (req: R, res) => {
  const id = Number(req.params.id);
  const r = (await q("SELECT * FROM rides WHERE id=$1", [id])).rows[0];
  if (!r) return res.status(404).json({ message: "Ride not found" });
  if (r.driver_id === req.userId)
    return res.status(400).json({ message: "You cannot join your own ride." });
  if (r.status !== "ACTIVE" || r.available_seats < 1)
    return res.status(409).json({
      message: "No seats are available. You can join the waitlist instead.",
    });
  const old = (
    await q(
      "SELECT id,status FROM bookings WHERE ride_id=$1 AND passenger_id=$2",
      [id, req.userId],
    )
  ).rows[0];
  let bid;
  if (old && old.status !== "CANCELLED") bid = old.id;
  else if (old) {
    bid = (
      await q(
        `UPDATE bookings SET status='PENDING',updated_at=NOW() WHERE id=$1 RETURNING id`,
        [old.id],
      )
    ).rows[0].id;
  } else
    bid = (
      await q(
        `INSERT INTO bookings(ride_id,passenger_id,status) VALUES($1,$2,'PENDING') RETURNING id`,
        [id, req.userId],
      )
    ).rows[0].id;
  await q(
    `INSERT INTO notifications(user_id,title,message,type,ride_id) VALUES($1,'New ride request','A passenger has requested to join your ride.','request',$2)`,
    [r.driver_id, id],
  );
  const b = (
    await q(
      `SELECT b.id,b.ride_id,b.status,b.created_at,u.id passenger_id,u.first_name,u.last_name,u.email,u.phone,u.member_type,u.ride_role,u.role,u.verified,COALESCE((SELECT AVG(rating) FROM reviews WHERE reviewed_user_id=u.id),0) rating,COALESCE((SELECT COUNT(*) FROM bookings WHERE passenger_id=u.id AND status IN ('CONFIRMED','COMPLETED')),0) total_trips FROM bookings b JOIN users u ON u.id=b.passenger_id WHERE b.id=$1`,
      [bid],
    )
  ).rows[0];
  res.status(201).json(
    mapBooking({
      ...b,
      passenger: {
        id: b.passenger_id,
        first_name: b.first_name,
        last_name: b.last_name,
        email: b.email,
        phone: b.phone,
        member_type: b.member_type,
        ride_role: b.ride_role,
        role: b.role,
        verified: b.verified,
        rating: b.rating,
        total_trips: b.total_trips,
      },
    }),
  );
});
app.get("/api/bookings/me", auth, async (req: R, res) => {
  const bs = await q(
    `SELECT b.*,json_build_object('id',u.id,'first_name',u.first_name,'last_name',u.last_name,'email',u.email,'phone',u.phone,'member_type',u.member_type,'ride_role',u.ride_role,'role',u.role,'verified',u.verified,'rating',COALESCE((SELECT AVG(rating) FROM reviews WHERE reviewed_user_id=u.id),0),'total_trips',COALESCE((SELECT COUNT(*) FROM bookings WHERE passenger_id=u.id AND status IN ('CONFIRMED','COMPLETED')),0)) passenger FROM bookings b JOIN users u ON u.id=b.passenger_id WHERE b.passenger_id=$1 ORDER BY b.created_at DESC`,
    [req.userId],
  );
  res.json(bs.rows.map(mapBooking));
});
app.get("/api/bookings/driver", auth, async (req: R, res) => {
  const bs = await q(
    `SELECT b.*,u.first_name,u.last_name,u.email,u.phone,r.start_location,r.destination FROM bookings b JOIN users u ON u.id=b.passenger_id JOIN rides r ON r.id=b.ride_id WHERE r.driver_id=$1 ORDER BY b.created_at DESC`,
    [req.userId],
  );
  res.json(
    bs.rows.map((b) => ({
      id: String(b.id),
      rideId: String(b.ride_id),
      name: `${b.first_name} ${b.last_name}`.trim(),
      email: b.email,
      phone: b.phone || undefined,
      seats: b.seats,
      status: b.status.toLowerCase(),
      route: `${b.start_location} → ${b.destination}`,
    })),
  );
});
app.get("/api/bookings/driver/:rideId", auth, async (req: R, res) => {
  const bs = await q(
    `SELECT b.*,json_build_object('id',u.id,'first_name',u.first_name,'last_name',u.last_name,'email',u.email,'phone',u.phone,'member_type',u.member_type,'ride_role',u.ride_role,'role',u.role,'verified',u.verified,'rating',0,'total_trips',0) passenger FROM bookings b JOIN users u ON u.id=b.passenger_id JOIN rides r ON r.id=b.ride_id WHERE b.ride_id=$1 AND r.driver_id=$2`,
    [Number(req.params.rideId), req.userId],
  );
  res.json(bs.rows.map(mapBooking));
});
app.delete("/api/bookings/:id", auth, async (req: R, res) => {
  const b = (
    await q(
      `SELECT b.*,r.available_seats,r.seats FROM bookings b JOIN rides r ON r.id=b.ride_id WHERE b.id=$1 AND b.passenger_id=$2`,
      [Number(req.params.id), req.userId],
    )
  ).rows[0];
  if (!b) return res.status(404).json({ message: "Booking not found" });
  if (b.status === "CONFIRMED")
    await q(
      `UPDATE rides SET available_seats=LEAST(seats,available_seats+$1),status='ACTIVE' WHERE id=$2`,
      [b.seats, b.ride_id],
    );
  await q(
    `UPDATE bookings SET status='CANCELLED',updated_at=NOW() WHERE id=$1`,
    [b.id],
  );
  res.status(204).send();
});
app.post("/api/bookings/:id/:action", auth, async (req: R, res) => {
  const id = Number(req.params.id),
    action = req.params.action;
  const b = (
    await q(
      `SELECT b.*,r.driver_id,r.available_seats FROM bookings b JOIN rides r ON r.id=b.ride_id WHERE b.id=$1`,
      [id],
    )
  ).rows[0];
  if (!b || b.driver_id !== req.userId)
    return res.status(404).json({ message: "Booking request not found" });
  if (b.status !== "PENDING")
    return res.json({ id: String(id), status: b.status.toLowerCase() });
  if (action === "accept") {
    if (b.available_seats < b.seats)
      return res
        .status(409)
        .json({ message: "Not enough seats are available." });
    await q(
      `UPDATE bookings SET status='CONFIRMED',updated_at=NOW() WHERE id=$1`,
      [id],
    );
    await q(
      `UPDATE rides SET available_seats=available_seats-$1,status=CASE WHEN available_seats-$1=0 THEN 'FULL' ELSE status END WHERE id=$2`,
      [b.seats, b.ride_id],
    );
    await q(
      `INSERT INTO notifications(user_id,title,message,type,ride_id) VALUES($1,'Ride request accepted','Your ride request has been accepted.','booking',$2)`,
      [b.passenger_id, b.ride_id],
    );
    return res.json({ id: String(id), status: "confirmed" });
  }
  if (action === "reject") {
    await q(
      `UPDATE bookings SET status='REJECTED',updated_at=NOW() WHERE id=$1`,
      [id],
    );
    return res.json({ id: String(id), status: "rejected" });
  }
  res.status(400).json({ message: "Invalid action" });
});
app.get("/api/trips/history", auth, async (req: R, res) => {
  const bs = await q(
    `SELECT b.*,json_build_object('id',u.id,'first_name',u.first_name,'last_name',u.last_name,'email',u.email,'phone',u.phone,'member_type',u.member_type,'ride_role',u.ride_role,'role',u.role,'verified',u.verified,'rating',0,'total_trips',0) passenger FROM bookings b JOIN users u ON u.id=b.passenger_id WHERE b.passenger_id=$1 ORDER BY b.created_at DESC`,
    [req.userId],
  );
  res.json(bs.rows.map(mapBooking));
});

async function participant(rideId: number, userId: number) {
  return Boolean(
    (
      await q(
        `SELECT 1 FROM rides r WHERE r.id=$1 AND r.driver_id=$2 UNION SELECT 1 FROM bookings b WHERE b.ride_id=$1 AND b.passenger_id=$2`,
        [rideId, userId],
      )
    ).rowCount,
  );
}
app.get("/api/messages", auth, async (req: R, res) => {
  const id = Number(req.query.rideId);
  if (!(await participant(id, req.userId!)))
    return res
      .status(403)
      .json({ message: "You are not a participant in this ride." });
  const ms = await q(
    `SELECT m.*,u.first_name,u.last_name FROM messages m JOIN users u ON u.id=m.sender_id WHERE m.ride_id=$1 ORDER BY m.created_at`,
    [id],
  );
  res.json(
    ms.rows.map((m) => ({
      id: String(m.id),
      senderId: String(m.sender_id),
      senderName: `${m.first_name} ${m.last_name}`.trim(),
      rideId: String(m.ride_id),
      text: m.text,
      createdAt: new Date(m.created_at).toISOString(),
    })),
  );
});
app.post("/api/messages", auth, async (req: R, res) => {
  const id = Number(req.body.rideId),
    text = String(req.body.text || "").trim();
  if (!text)
    return res.status(400).json({ message: "Message cannot be empty." });
  if (!(await participant(id, req.userId!)))
    return res
      .status(403)
      .json({ message: "You are not a participant in this ride." });
  const m = (
      await q(
        `INSERT INTO messages(ride_id,sender_id,text) VALUES($1,$2,$3) RETURNING *`,
        [id, req.userId, text],
      )
    ).rows[0],
    u = await userRow(req.userId!);
  res.status(201).json({
    id: String(m.id),
    senderId: String(m.sender_id),
    senderName: `${u.first_name} ${u.last_name}`.trim(),
    rideId: String(m.ride_id),
    text: m.text,
    createdAt: new Date(m.created_at).toISOString(),
  });
});
app.get("/api/notifications", auth, async (req: R, res) => {
  const ns = await q(
    "SELECT * FROM notifications WHERE user_id=$1 ORDER BY created_at DESC",
    [req.userId],
  );
  res.json(
    ns.rows.map((n) => ({
      id: String(n.id),
      type: n.type,
      title: n.title,
      text: n.message,
      time: new Date(n.created_at).toISOString(),
      unread: !n.is_read,
      rideId: n.ride_id ? String(n.ride_id) : undefined,
    })),
  );
});
app.post("/api/notifications/:id/read", auth, async (req: R, res) => {
  await q("UPDATE notifications SET is_read=true WHERE id=$1 AND user_id=$2", [
    Number(req.params.id),
    req.userId,
  ]);
  res.json({ ok: true });
});
app.get("/api/matching/recommendations", auth, async (req: R, res) => {
  const rows = await rideRows(
    `WHERE r.status='ACTIVE' AND r.available_seats>0 AND r.driver_id<>$1 LIMIT 20`,
    [req.userId],
  );
  res.json(
    rows.map((r, i) => ({
      ride: mapRide(r),
      score: Math.max(65, 94 - i * 4),
      pickupMatch: true,
      destinationMatch: true,
      timeMatch: true,
      distance: Number(r.distance_km || 0),
    })),
  );
});
app.get("/api/dashboard/stats", auth, async (req: R, res) => {
  const trips = Number(
    (
      await q(
        `SELECT COUNT(*) n FROM bookings WHERE passenger_id=$1 AND status IN ('CONFIRMED','COMPLETED')`,
        [req.userId],
      )
    ).rows[0].n,
  );
  const availableRides = Number(
    (
      await q(
        `SELECT COUNT(*) n FROM rides WHERE status='ACTIVE' AND available_seats>0`,
      )
    ).rows[0].n,
  );
  const upcoming = (
    await q(
      `SELECT departure_time FROM rides WHERE status='ACTIVE' AND departure_time>=NOW() ORDER BY departure_time LIMIT 1`,
    )
  ).rows[0];
  const seats = Number(
    (
      await q(
        `SELECT COALESCE(SUM(b.seats),0) n FROM bookings b JOIN rides r ON r.id=b.ride_id WHERE r.driver_id=$1 AND b.status IN ('CONFIRMED','COMPLETED')`,
        [req.userId],
      )
    ).rows[0].n,
  );
  res.json({
    trips,
    availableRides,
    upcomingTime: upcoming
      ? new Date(upcoming.departure_time).toTimeString().slice(0, 5)
      : "—",
    seatsShared: seats,
  });
});

app.post("/api/checkins", auth, async (req: R, res) => {
  const { rideId, bookingId, code } = req.body;
  const b = (
    await q(
      `SELECT b.*,r.ride_code FROM bookings b JOIN rides r ON r.id=b.ride_id WHERE b.id=$1 AND b.passenger_id=$2`,
      [Number(bookingId), req.userId],
    )
  ).rows[0];
  if (!b || Number(rideId) !== b.ride_id || b.status !== "CONFIRMED")
    return res.status(400).json({ message: "Invalid booking." });
  if (String(code).trim() !== b.ride_code)
    return res.status(400).json({
      message:
        "Incorrect check-in code. Ask the driver for the 4-digit ride code.",
    });
  const c = (
    await q(
      `INSERT INTO checkins(booking_id,ride_id,passenger_id) VALUES($1,$2,$3) ON CONFLICT(booking_id) DO UPDATE SET checked_in_at=checkins.checked_in_at RETURNING *`,
      [b.id, b.ride_id, req.userId],
    )
  ).rows[0];
  const u = await userRow(req.userId!);
  res.json({
    bookingId: String(c.booking_id),
    rideId: String(c.ride_id),
    passengerId: String(c.passenger_id),
    passengerName: `${u.first_name} ${u.last_name}`.trim(),
    checkedInAt: new Date(c.checked_in_at).toISOString(),
  });
});
app.get("/api/checkins/:rideId", auth, async (req: R, res) => {
  const cs = await q(
    `SELECT c.*,u.first_name,u.last_name FROM checkins c JOIN users u ON u.id=c.passenger_id WHERE c.ride_id=$1`,
    [Number(req.params.rideId)],
  );
  res.json(
    cs.rows.map((c) => ({
      bookingId: String(c.booking_id),
      rideId: String(c.ride_id),
      passengerId: String(c.passenger_id),
      passengerName: `${c.first_name} ${c.last_name}`.trim(),
      checkedInAt: new Date(c.checked_in_at).toISOString(),
    })),
  );
});
app.get("/api/rides/:id/code", auth, async (req: R, res) => {
  const r = (
    await q("SELECT ride_code FROM rides WHERE id=$1 AND driver_id=$2", [
      Number(req.params.id),
      req.userId,
    ])
  ).rows[0];
  if (!r) return res.status(404).json({ message: "Ride not found" });
  res.json({ code: r.ride_code });
});
app.post("/api/waitlist", auth, async (req: R, res) => {
  const rideId = Number(req.body.rideId),
    seats = Number(req.body.seats || 1);
  const old = (
    await q(
      "SELECT id,position FROM waitlists WHERE ride_id=$1 AND passenger_id=$2",
      [rideId, req.userId],
    )
  ).rows[0];
  if (old)
    return res
      .status(409)
      .json({ message: `You are already #${old.position} on the waitlist.` });
  const pos = Number(
    (
      await q(
        "SELECT COALESCE(MAX(position),0)+1 n FROM waitlists WHERE ride_id=$1",
        [rideId],
      )
    ).rows[0].n,
  );
  const w = (
    await q(
      `INSERT INTO waitlists(ride_id,passenger_id,seats,position) VALUES($1,$2,$3,$4) RETURNING *`,
      [rideId, req.userId, seats, pos],
    )
  ).rows[0];
  const u = await userRow(req.userId!);
  res.status(201).json({
    id: String(w.id),
    rideId: String(w.ride_id),
    passenger: mapUser(u),
    seats: w.seats,
    createdAt: new Date(w.created_at).toISOString(),
    position: w.position,
  });
});
app.get("/api/waitlist/:rideId", auth, async (req: R, res) => {
  const ws = await q(
    `SELECT w.*,u.first_name,u.last_name,u.email,u.phone,u.member_type,u.ride_role,u.role,u.verified FROM waitlists w JOIN users u ON u.id=w.passenger_id WHERE w.ride_id=$1 ORDER BY w.position`,
    [Number(req.params.rideId)],
  );
  res.json(
    await Promise.all(
      ws.rows.map(async (w) => ({
        id: String(w.id),
        rideId: String(w.ride_id),
        passenger: mapUser({
          ...w,
          id: w.passenger_id,
          rating: 0,
          total_trips: 0,
        }),
        seats: w.seats,
        createdAt: new Date(w.created_at).toISOString(),
        position: w.position,
      })),
    ),
  );
});
app.delete("/api/waitlist/:id", auth, async (req: R, res) => {
  await q("DELETE FROM waitlists WHERE id=$1 AND passenger_id=$2", [
    Number(req.params.id),
    req.userId,
  ]);
  res.status(204).send();
});
app.get("/api/rides/:id/preferences", auth, async (req, res) => {
  const r = (
    await q(
      "SELECT music,ac,smoking,conversation,pets FROM rides WHERE id=$1",
      [Number(req.params.id)],
    )
  ).rows[0];
  if (!r) return res.status(404).json({ message: "Ride not found" });
  res.json(r);
});
app.put("/api/rides/:id/preferences", auth, async (req: R, res) => {
  const id = Number(req.params.id);
  const r = (await q("SELECT driver_id FROM rides WHERE id=$1", [id])).rows[0];
  if (!r || r.driver_id !== req.userId)
    return res
      .status(403)
      .json({ message: "Only the driver can update ride preferences." });
  await q(
    "UPDATE rides SET music=$1,ac=$2,smoking=$3,conversation=$4,pets=$5 WHERE id=$6",
    [
      req.body.music,
      req.body.ac,
      req.body.smoking,
      req.body.conversation,
      req.body.pets,
      id,
    ],
  );
  res.json(req.body);
});
app.get("/api/safety/trusted-contact", auth, async (req: R, res) => {
  res.json(
    (
      await q(
        "SELECT name,phone,email FROM trusted_contacts WHERE user_id=$1",
        [req.userId],
      )
    ).rows[0] || null,
  );
});
app.put("/api/safety/trusted-contact", auth, async (req: R, res) => {
  if (!req.body.name || !req.body.phone)
    return res.status(400).json({ message: "Name and phone are required." });
  const r = (
    await q(
      `INSERT INTO trusted_contacts(user_id,name,phone,email) VALUES($1,$2,$3,$4) ON CONFLICT(user_id) DO UPDATE SET name=EXCLUDED.name,phone=EXCLUDED.phone,email=EXCLUDED.email RETURNING name,phone,email`,
      [req.userId, req.body.name, req.body.phone, req.body.email || null],
    )
  ).rows[0];
  res.json(r);
});
app.post("/api/reports/users", auth, async (req: R, res) => {
  const r = (
    await q(
      `INSERT INTO reports(reporter_id,reported_id,reason) VALUES($1,$2,$3) RETURNING id,status`,
      [
        req.userId,
        Number(req.body.userId),
        String(req.body.reason || "Safety concern"),
      ],
    )
  ).rows[0];
  res.status(201).json({ id: String(r.id), status: r.status });
});
app.post("/api/users/:id/block", auth, async (req: R, res) => {
  await q(
    `INSERT INTO blocks(blocker_id,blocked_id) VALUES($1,$2) ON CONFLICT DO NOTHING`,
    [req.userId, Number(req.params.id)],
  );
  res.json({ userId: String(req.params.id), blocked: true });
});
app.post("/api/ratings", auth, async (req: R, res) => {
  const b = (
    await q(
      `SELECT b.*,r.driver_id FROM bookings b JOIN rides r ON r.id=b.ride_id WHERE b.id=$1 AND b.passenger_id=$2`,
      [Number(req.body.tripId), req.userId],
    )
  ).rows[0];
  if (!b || b.status !== "COMPLETED")
    return res
      .status(400)
      .json({ message: "Only completed trips can be rated." });
  const r = (
    await q(
      `INSERT INTO reviews(ride_id,reviewer_id,reviewed_user_id,rating,comment) VALUES($1,$2,$3,$4,$5) RETURNING rating,comment`,
      [
        b.ride_id,
        req.userId,
        b.driver_id,
        Number(req.body.rating),
        req.body.review || null,
      ],
    )
  ).rows[0];
  res
    .status(201)
    .json({ tripId: String(b.id), rating: r.rating, review: r.comment });
});
app.get("/api/impact", auth, async (_req, res) => {
  const x = (
    await q(
      `SELECT COUNT(*) shared_trips,COALESCE(SUM(fuel_saved),0) fuel_saved,COALESCE(SUM(money_saved),0) money_saved,COALESCE(SUM(co2),0) co2 FROM impacts`,
    )
  ).rows[0];
  res.json({
    sharedTrips: Number(x.shared_trips),
    fuelSaved: Number(x.fuel_saved),
    moneySaved: Number(x.money_saved),
    co2: Number(x.co2),
  });
});
app.get("/api/admin/analytics", auth, admin, async (_req, res) => {
  const get = async (sql: string) => Number((await q(sql)).rows[0].n);
  const users = await get("SELECT COUNT(*) n FROM users");
  const rides = await get("SELECT COUNT(*) n FROM rides");
  const bookings = await get("SELECT COUNT(*) n FROM bookings");
  res.json({
    users,
    activeUsers: await get(
      "SELECT COUNT(*) n FROM users WHERE is_blocked=false",
    ),
    rides,
    bookings,
    reports: await get(
      "SELECT COUNT(*) n FROM reports WHERE status='submitted'",
    ),
    activeRides: await get(
      "SELECT COUNT(*) n FROM rides WHERE status IN ('ACTIVE','STARTED')",
    ),
    completedRides: await get(
      "SELECT COUNT(*) n FROM rides WHERE status='COMPLETED'",
    ),
    cancelledRides: await get(
      "SELECT COUNT(*) n FROM rides WHERE status='CANCELLED'",
    ),
    avgRating: Number(
      (await q("SELECT COALESCE(AVG(rating),0) n FROM reviews")).rows[0].n,
    ),
    monthlyFuelSaved: Number(
      (
        await q(
          "SELECT COALESCE(SUM(fuel_saved),0) n FROM impacts WHERE created_at>=NOW()-INTERVAL '30 days'",
        )
      ).rows[0].n,
    ),
  });
});
app.get("/api/admin/analytics/routes", auth, admin, async (_req, res) => {
  const r = await q(
    `SELECT start_location,destination,COUNT(*) rides,COALESCE(SUM(available_seats),0) seats FROM rides GROUP BY start_location,destination ORDER BY rides DESC`,
  );
  res.json(
    r.rows.map((x) => ({
      route: `${x.start_location} → ${x.destination}`,
      rides: Number(x.rides),
      seats: Number(x.seats),
    })),
  );
});
app.get("/api/admin/users", auth, admin, async (_req, res) => {
  const us = await q("SELECT id FROM users ORDER BY created_at DESC");
  res.json(
    await Promise.all(us.rows.map(async (x) => mapUser(await userRow(x.id)))),
  );
});
app.get("/api/admin/rides", auth, admin, async (_req, res) => {
  const rs = await rideRows("WHERE TRUE", []);
  res.json(rs.map(mapRide));
});

const PORT = Number(process.env.PORT || 5000);
initDb()
  .then(() =>
    app.listen(PORT, () =>
      console.log(`ICBT Carpooling API running on http://localhost:${PORT}`),
    ),
  )
  .catch((e) => {
    console.error("Database initialisation failed", e);
    process.exit(1);
  });
process.on("SIGINT", async () => {
  await pool.end();
  process.exit(0);
});
