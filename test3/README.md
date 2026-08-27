# ICBT Carpool – Smart Campus Ride Sharing System

## Main workflow
Find → Match → Request → Accept → Check-in → Ride → Complete → Rate

## Included smart features
- Recurring rides (weekday selection + end date)
- ICBT pickup zones
- Vehicle type: Car, Van, Three-Wheeler, Bike
- Explainable smart matching with score breakdown
- Passenger waitlist and seat-available notification
- 4-digit ride check-in with duplicate/wrong-code validation
- Driver ride control: check-in count, Start Ride, Complete Ride
- Live ride status: Upcoming → In Progress → Completed
- Driver trust profile and verification badges
- Ride preferences: music, AC, smoking, conversation, pets
- Trusted contact and Share Trip
- Fuel sharing calculator + community fuel/CO₂ impact dashboard
- Passenger notifications for newly published rides
- Dark team UI across dashboard, sidebar, cards and modals
- Local demo persistence through localStorage

## Demo accounts
Administrator:
- Username: `icbt.admin`
- Password: `Carpool@Admin2026`

User demo login accepts any valid-looking email and a password of 8+ characters.
For multi-user demo testing, use different emails. Emails containing `passenger`/`rider` are treated as passenger accounts; emails containing `driver` are treated as driver accounts; other users are treated as both.

## Run
```bash
npm install
npm run dev
```

## Suggested demonstration
1. Driver logs in and creates a recurring or one-time ride.
2. Passenger logs in with a different email and sees the new ride notification.
3. Passenger opens the ride, checks the explainable match score and preferences, then requests a seat.
4. Driver opens Ride Control, shares the 4-digit code, and reviews passenger check-ins.
5. Passenger enters the code once; a second attempt is rejected.
6. Driver starts the ride and then completes it.
7. Complete Ride updates the community impact metrics.
8. For a full ride, passenger can join the waitlist; cancelling a confirmed booking creates a seat-available notification for the next waitlisted user.
9. Passenger can save a trusted contact and share trip details.
10. Admin can review users, drivers, rides and live monitoring.

## V4.1 booking workflow test

1. Login as `kasun@student.icbt.lk` with any password of 8+ characters. This maps to the seeded Kasun driver account (`u2`).
2. Open Driver Dashboard. Ride `r1` is the driver's ride and has a confirmed passenger.
3. Login as `mayurika@student.icbt.lk`. My Bookings contains seeded Accepted, Pending and Rejected examples after the local demo data migration.
4. Pending/Accepted/Rejected tabs now filter by real booking status.
5. To test Request -> Accept: as a passenger open an available ride and choose Request to join. It creates a `requested` booking. Switch to the ride owner driver and click the green accept button. The passenger booking becomes `confirmed` and one seat is reserved.
6. To test Reject: use the red reject button. The passenger booking becomes `rejected` and no seat is consumed.
7. To test QR check-in: with an accepted booking, open Driver Dashboard -> Ride control. Copy the 4-digit Ride Check-in Code. Return to the passenger's Ride Details, enter the code and press Check in. A wrong code is rejected; the same code cannot be used twice for the same booking.
8. Driver Ride Control shows checked-in passengers and allows Start Ride -> Complete Ride.
