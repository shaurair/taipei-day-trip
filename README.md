# Taipei Day Trip
- Website URL: https://trip.shaurair.online/
- Test account / password: test@test.com / test123
- Test Credit Card Number: 4242-4242-4242-4242 | Date: 12/34 | CVV: 123
<img src='https://github.com/shaurair/taipei-day-trip/blob/main/doc/TaipeiIndex.png' width=80%>

## Catalog
* [Main Feature](#Main-Feature)
* [Backend Architecture](#Backend-Architecture)
* [Technique Summary](#Technique-Summary)

## Main Feature
* Search attractions
* Booking & Payment
* Member System
* Member Center


## Backend Architecture
<img src='https://github.com/shaurair/taipei-day-trip/blob/main/doc/BackendArchTaipeiTrip_3rdAPI.png' width=70%>

- ### a. Users send HTTPS requests to NGINX
  -  Users search attractions, book tours, send prime which is made from TapPay server, manage member data, upload profile images, etc.

- ### b. NGINX processes HTTPS and passes to Flask 
  -  Flask handles request processing and response generation.

- ### c. Flask connects to database and executes CRUD operations
  - Member information, attractions information, and order details.

- ### d. Users request prime to TapPay server
  - Send credit card information to TapPay server and get prime from TapPay server.

- ### e. Flask pay by prime
  - Flask send the prime to TapPay server to finish payment.

## Technique Summary
### Front-end
- HTML
- CSS
- Javascript
- TapPay SDK
### Back-end
- Flask (Python)
- RESTful API
### Database
- MySQL
### Infrastructure
- Docker
- DNS
- SSL
- NGINX
- AWS EC2
