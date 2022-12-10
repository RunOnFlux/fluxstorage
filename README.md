# Flux Store

Storage for huge Env variables and Commands for FluxOS.

FluxOS has safety limitations on maximum payload size to not overload the network. Applications that require huge payloads in its environment variables or commands are then so advised to use flux store to fetch this payload.

In later implementation Flux Store can also be used for secrets management.

Protections and authentications on endpoint will be added to later implementations even from an instance requesting data.

## Requirements

Requires node version 12.0 and above, mongodb

## Installation

Install npm dependencies with command:

```javascript
npm install
```

## Usage

Start the service with command:

```javascript
npm start
```

Service will be started on 127.0.0.1:9876
