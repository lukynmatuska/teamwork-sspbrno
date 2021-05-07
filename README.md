# Team work at SSPBRNO
Node.js webapp for administration of Team works at [SSPBRNO](https://sspbrno.cz)

## Instalation on-premise

### Docker compose
- Copy `docker-compose.sample.yml` to `docker-compose.yml`
- Edit ENV variables in `docker-compose.yml`
- Copy `mongo-init.sample.yml` to `mongo-init.yml`
- Edit database credentials in `mongo-init.yml`
- Start containers with ```docker-compose up -d```

### Docker
```docker run -d --network host --restart=always --env COOKIE_MAX_AGE=86400000 --env PORT=3000 --env PROTOCOL=http --env URL="teamwork.local" --env REDIS_URL="redis://localhost:6379" --env SESSION_SECRET="randomString" --env SMTP_HOST="mail.local" --env SMTP_PASS="strongPass" --env SMTP_PORT="465" --env SMTP_SECURE=true --env SMTP_USER="teamworks@mail.local" --env MONGODB_PORT=27017 --env MONGODB_HOST="localhost" --env MONGODB_NAME="teamworks" --env MONGODB_USER="teamworks" --env MONGODB_PASS="strongPass" --env MONGODB_OPTIONS="" --env CONTACT_PERSON_EMAIL="somebody@example.com" index.docker.io/lukynmatuska/sspbrnoprojectsweb:master```

### Linux
#### Debian based
##### Install packages
- [MongoDB](https://docs.mongodb.com/manual/tutorial/install-mongodb-on-debian/)
- [Redis](https://redis.io/download)
- [Node.js](https://nodejs.org/en/download/package-manager/)
##### Clone the repo
###### Clone with SSH
- ```git clone git@gitlab.com:matuska.lukas/teamwork-sspbrno.git```
###### Clone with HTTPS
- ```https://gitlab.com/matuska.lukas/teamwork-sspbrno.git```
##### Install packages for NodeJS
- ```cd teamwork-sspbrno && npm i```
##### Config MongoDB
##### Create database and user
- ```use teamworks;```
- ```db.createUser({user: 'teamworks', pwd: 'veryStrongPassword', roles: [{role: 'readWrite', db: 'teamworks'}]});```
##### Prepare config file:
- ```cp config.sample.js config.js```  
Edit settings in your `config.js` or in ENV variables (see `app.js`)
##### Prepare email templates
- ```cp -rvf emails.sample emails```  

### Windows
Not supported, but you can try it...

## Default user
- Email: ```admin@admin.net```
- Password: ```purkynkaIsHappy```

## Description of file structure
.  
├── app.js (Entry point of app)  
├── config.js (Configuration data, connection to db, etc.) or **ENV** variables  
├── controllers (Controllers - heart of app, carrying out individual activities as such)  
├── emails (Emails - folder for email templates)  
├── libs (Libraries - external libraries, which aren't in npm or own solution like connection to db)  
├── models (Database models, ex. User, Ticket, Car, ...)  
├── routes (Routers paths, call funcions by URL from controllers)  
├── static (Static files)  
│   ├── css  
│   ├── images  
│   └── js  
└── views (Part of pages for render)  
    └── partials (Repeating parts of pages – header, menu, ...)  

## How it works?
Node.js express waits for HTTP requests which are afterwards processed by their respective `routers` which lead to `controllers` that execute the *main code*.

You must use reverse proxy server (like [nginx](https://www.nginx.com/)) if you want run this in production enviroment with safe HTTPS.