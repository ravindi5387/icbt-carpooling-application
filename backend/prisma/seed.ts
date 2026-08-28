import "dotenv/config";
import bcrypt from "bcrypt";
import {Pool} from "pg";
const pool=new Pool({connectionString:process.env.DATABASE_URL});
async function main(){
 const password=await bcrypt.hash("Student@123",12); const adminPassword=await bcrypt.hash(process.env.ADMIN_PASSWORD||"Carpool@Admin2026",12);
 const users=[['Mayurika','Perera','mayurika@student.icbt.lk','STUDENT','BOTH','USER'],['Kasun','Fernando','kasun@student.icbt.lk','STUDENT','DRIVER','USER'],['Nethmi','Silva','nethmi@student.icbt.lk','STUDENT','DRIVER','USER'],['Dilan','Jayasinghe','dilan@icbt.lk','STAFF','BOTH','USER']];
 for(const u of users) await pool.query(`INSERT INTO users(first_name,last_name,email,password_hash,member_type,ride_role,role) VALUES($1,$2,$3,$4,$5,$6,$7) ON CONFLICT(email) DO NOTHING`,[...u.slice(0,3),password,u[3],u[4],u[5]]);
 await pool.query(`INSERT INTO users(first_name,last_name,email,password_hash,member_type,ride_role,role) VALUES('ICBT System','Administrator',$1,$2,'STAFF','BOTH','ADMIN') ON CONFLICT(email) DO NOTHING`,[process.env.ADMIN_EMAIL||'admin@icbt.lk',adminPassword]);
 const drivers:any[]=[];for(const email of ['kasun@student.icbt.lk','nethmi@student.icbt.lk','dilan@icbt.lk'])drivers.push((await pool.query('SELECT id FROM users WHERE email=$1',[email])).rows[0].id);
 const rides=[['Nugegoda','ICBT Colombo Campus','2026-09-01T07:30:00',4,150,'CAR',8.4,drivers[0]],['Maharagama','ICBT Colombo Campus','2026-09-01T08:00:00',3,120,'VAN',10.2,drivers[1]],['Dehiwala','ICBT Colombo Campus','2026-09-02T07:15:00',5,180,'THREE_WHEELER',6.8,drivers[2]];
 for(const r of rides) await pool.query(`INSERT INTO rides(driver_id,start_location,destination,departure_time,seats,available_seats,price_per_seat,vehicle_type,distance_km,pickup_zone,ride_code) SELECT $1,$2,$3,$4,$5,$5,$6,$7,$8,$2,$9 WHERE NOT EXISTS(SELECT 1 FROM rides WHERE driver_id=$1 AND departure_time=$4)`,[r[7],r[0],r[1],r[2],r[3],r[4],r[5],r[6],String(Math.floor(1000+Math.random()*9000))]);
 console.log('Seed complete. Student password: Student@123');
}
main().catch(e=>{console.error(e);process.exit(1)}).finally(()=>pool.end());
