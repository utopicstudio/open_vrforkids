# Welcome to VR FOR KIDS

> VR FOR KIDS or VRFORKIDS is a learning platform designed to provide
educators and learners with a single robust, secure and
integrated system to interactive with VR learning environments.
  
[![Build Status](https://travis-ci.org/utopicstudio/open_vrforkids.svg?branch=master)](https://travis-ci.org/utopicstudio/open_vrforkids)
[![Coverage Status](https://coveralls.io/repos/github/utopicstudio/open_vrforkids/badge.svg)](https://coveralls.io/github/utopicstudio/open_vrforkids)

## Getting Started

### Prerequisites

To install vrforkids you need:

```
- Python 3+
- mongodb
- nodejs
```
### install python libraries
install python libraries with:
```
pip install -r req.txt
```
### install angular
install angular-cli with:
```
npm install -g @angular/cli
```
### install typescript
install typescript with:
```
npm install -g typescript
```

## Run the project development mode
### Run the API REST
1. Create your config file for the API service. Create a copy of the configuration file `config.cfg.template`located in `/vrkids` with the name `config.cfg`
2. Customize your options, (database name, database pass, secret salt, etc)
3. Open a new terminal and access to `/vrkids` folder and run with:
```
python api.py
```

### Run the Angular Project
1. Open a new terminal and access to `/front` folder.
2. Install node_modules with:
```
npm install
```
3. Run the angular project with:
```
npm start
```
4. Open your browser at http://localhost:4200

## Project setting
### Angular Project
In file `config.ts` located in `/front/src/app/congif.ts` you can change the URL used by the API REST.
#### Deployment applicatiton
To deploy the application access the url https://angular.io/guide/deployment
### API REST
In file `config.cfg` located in `/vrkids` you can change the different value used for the API REST.

## Login Data
To login to the platform as administrator the credentials are:
1. email: `admin@admin.cl`
2. password: `pass`
