# Team works at SSPBRNO
NodeJS webapp for administration of Team works at SSPBRNO

## Instalation on-premise
### Linux
#### Debian based
##### Install system utilites
- ```curl -sL https://deb.nodesource.com/setup_12.x | sudo bash -```
- ```sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 9DA31620334BD75D9DCB49F368818C72E52529D4```
- ```echo "deb http://repo.mongodb.org/apt/debian "$(lsb_release -sc)"/mongodb-org/4.0 main" | sudo tee /etc/apt/sources.list.d/mongodb.list```
- ```sudo apt install node npm mongodb-org redis-server -y```  
https://www.digitalocean.com/community/tutorials/how-to-install-and-secure-redis-on-debian-9
##### Start Mongo DB on startup & now
- ```sudo systemctl enable mongod.service --now```
##### Install packages for NodeJS
- ```npm i```
##### Clone the repo
Clone with SSH
- ```git clone git@gitlab.com:matuska.lukas/teamworkadmin.git```
Clone with HTTPS
- ```https://gitlab.com/matuska.lukas/teamworkadmin.git```
##### Config MongoDB
##### Create database and user
- ```use teamwork; db.createUser({user: 'teamwork', pwd: 'veryStrongPassword', roles: [{role: 'readWrite', db: 'teamwork'}]});```
##### Get ready config file:
- ```cp config.sample.js config.js```  
Edit settings of your MongoDB database and user in your `config.js`

### Windows
Not supported, but you can try it...

## Description of file structure
.  
├── app.js (Entry point of app)  
├── config.js (Configuration data, connection to db, etc.) or **ENV** variables  
├── controllers (Controllers - heart of app, carrying out individual activities as such)  
├── libs (Libraries - external libraries, which aren't in npm or own solution like connection to db)  
├── models (Database models, ex. User, Ticket, Car, ...)  
├── routes (Routers paths, call funcions by URL from controllers)  
├── static (Static files)  
│   ├── css  
│   ├── images  
│   └── js  
└── views (Part of pages for render)  
    └── partials (Repeating parts of pages – header, menu, ...)  
