# jaxom

just an extra origin monitor 

![npm](https://img.shields.io/npm/v/jaxom)
![GitHub Actions](https://img.shields.io/endpoint.svg?url=https%3A%2F%2Factions-badge.atrox.dev%2Fatrox%2Fsync-dotenv%2Fbadge&label=build&logo=none)
![github repo size](https://img.shields.io/github/repo-size/cloningerbutch/jaxom)
![github last commit](https://img.shields.io/github/last-commit/cloningerbutch/jaxom)
![npm license](https://img.shields.io/npm/l/jaxom)
![npm downloads](https://img.shields.io/npm/dw/jaxom)
![Sonar Quality Gate](https://img.shields.io/sonar/quality_gate/cloningerbutch_jaxom?server=https%3A%2F%2Fsonarcloud.io)

Fast, targeted url-based endpoint monitoring and alerting

> **Not Ready for Prime Time** - please note, this package is not ready for usage.  Development is ongoing and is expected to reach readiness in early Jan 2020.

## Installation 

```bash
npm install -g jaxom
```

## Usage

```
jaxom <command>

Commands:
  jaxom config <command>    manage the app\'s configuration
  jaxom endpoint <command>  manage the app\'s endpoints
  jaxom monitor <command>   manage the monitor process
  jaxom ping                ping the application, ensure runtime consistency
  jaxom status              current status, all endpoints

Options:
  --version       Show version number  [boolean]
  --active        filter by active only  [boolean]
  --domain        filter by domain attribute, not \case sensitive  [string]
  --downonly      list only endpoints that are down  [boolean] [default: false]
  --env           filter by env attribute, not \case sensitive  [string]
  --cron          cron string \for scheduling tests  [string] [default: \"0 * * * *\"]
  --datapath      path to the jaxom data files  [string]
  --format        output format [text,json]  [string] [default: \"text\"]
  --seq           filter by seq number  [number]
  --seqorder      order by seq number  [boolean]
  --showversions  show monitor process versions  [boolean] [default: false]
  --help          Show help  [boolean]

```

## Features

* Flexible, consistent endpoint management
* HTML request options
    * Methods (GET,POST,HEAD, etc...)
    * Headers and body support
    * HTTP status code override (success/failure)

## Quick Start

(to be continued)