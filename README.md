# jaxom

just an extra origin monitor 

![npm](https://img.shields.io/npm/v/jaxom)

Fast, targeted url-based endpoint monitoring and alerting

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

Testing, list below:

* Flexible, consistent endpoint management
* HTML request options
    * Methods (GET,POST,HEAD, etc...)
    * Headers and body support
    * HTTP status code override (success/failure)

## Quick Start

(to be continued)