# Webhook-Driven Task Processing Pipeline

[![CI/CD](https://github.com/BerOSilk/Webhook-Driven-Task-Processing-Pipeline/actions/workflows/main.yml/badge.svg)](https://github.com/BerOSilk/Webhook-Driven-Task-Processing-Pipeline/actions)

A flexible and scalable system for processing asynchronous tasks triggered by webhooks. This pipeline allows you to define jobs that execute a sequence of actions (like filtering or text replacement) on incoming data, providing a simple way to build custom integrations and automation.

## Features

*   **Webhook Triggering**: Start task processing by sending HTTP requests to a webhook endpoint.
*   **Pluggable Actions**: The pipeline processes tasks through a sequence of defined actions, such as `filter` and `replaceText`.
*   **Job Management**: Create and manage jobs via a dedicated API to define their action sequences.
*   **Asynchronous Processing**: Tasks are handled in the background, ensuring your webhook calls are non-blocking.
*   **Database Persistence**: Uses Drizzle ORM (with SQLite/PostgreSQL support) to store job definitions and task statuses.
*   **Containerized Deployment**: Easy setup and deployment using provided Docker and `docker-compose` configurations.
*   **Modern Codebase**: Built with TypeScript for type safety and maintainability, including automated formatting and linting.

## Architecture Overview

The system consists of a few core components:

1.  **Webhook Receiver**: An endpoint (`/webhook`) that accepts incoming HTTP requests. The request body/payload is the data to be processed.
2.  **Job Store**: A database (managed via Drizzle ORM) that stores `Job` definitions. A job specifies an ordered list of `actions` to perform on incoming data.
3.  **Task Processor**: A background worker that picks up new tasks (triggered by webhooks), loads the corresponding job's action sequence, and executes them step-by-step.
4.  **Action Handlers**: Individual modules that perform specific operations (e.g., `filter`, `replaceText`). New actions can be easily added.

## Getting Started

### Prerequisites

*   [Node.js](https://nodejs.org/) (v18 or later recommended)
*   [Docker](https://www.docker.com/) and [Docker Compose](https://docs.docker.com/compose/)
*   [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
*   (OPTIONAL IF YOU DON'T WANT TO USE DOCKER) [PostgreSQL](https://www.postgresql.org/)

### Installation & Setup

1.  **Clone the repository**
    ```bash
    git clone https://github.com/BerOSilk/Webhook-Driven-Task-Processing-Pipeline.git
    cd Webhook-Driven-Task-Processing-Pipeline
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Environment Configuration**
    ```bash
    cp .env.example .env
    ```

4.  **Database Setup**
    ```bash
    npm run generate
    npm run migrate
    ```

---

## Running with Docker (Recommended)

The easiest way to run the entire stack is using Docker Compose:

```bash
docker-compose up --build
```

---

## Endpoints

### Pipelines (`/api/pipeline`)

| HTTP | Endpoint |
|------|----------|
| POST | `/api/pipeline` |

#### Request Body:
<pre>
{
  "name": string
  "actionType": "capitalize" | "replace" | "filter"
  "actionConfig": capitalizeConfig | replaceConfig | filterConfig
  "subscribers": [
    {
      "url": string
      "method": string
    }
  ]
}
</pre>

#### Success Response:
<pre>
{
    "id": UUID
    "createdAt": timestamp
    "updatedAt": timestamp
    "name": string
    "source:" /webhook/{UUID}
    "actionType": string 
    "subscribers": [
        {
            "url": string
            "method": string
        }
    ],
    "actionConfig": capitalizeConfig | replaceConfig | filterConfig
}
</pre>

| HTTP | Endpoint |
|------|----------|
| GET  | `/api/pipeline` |

#### Success Response:
<pre>
{
    [
        {
            "id": UUID
            "createdAt": timestamp
            "updatedAt": timestamp
            "name": string
            "source:" /webhook/{UUID}
            "actionType": string 
            "subscribers": [
                {
                    "url": string
                    "method": string
                }
            ],
            "actionConfig": capitalizeConfig | replaceConfig | filterConfig
        }
    ]
}
</pre>

| HTTP | Endpoint |
|------|----------|
| GET  | `/api/pipeline/:id` |

#### Success Response:
<pre>
{
    "id": UUID
    "createdAt": timestamp
    "updatedAt": timestamp
    "name": string
    "source:" /webhook/{UUID}
    "actionType": string 
    "subscribers": [
        {
            "url": string
            "method": string
        }
    ],
    "actionConfig": capitalizeConfig | replaceConfig | filterConfig
}
</pre>

| HTTP | Endpoint |
|------|----------|
| DELETE  | `/api/pipeline/:id` |


### Webhook (`/api/webhook/:id`)

| HTTP | Endpoint |
|------|----------|
| POST  | `/api/webhook/:id` |
| GET  | `/api/webhopok/:id` |

This endpoint accepts both POST & GET with any body/queries you pass, it will create a new job, and queue it to run the action when the time comes

#### Success Response:
<pre>
{
    "message": string
    "jobId": UUID
    "status": string
}
</pre>

### Job (`/api/job`)

| HTTP | Endpoint |
|------|----------|
| GET  | `/api/job` |

#### Query Parameters:
<pre>
{
    "status": string
    "pipelineID: UUID
    "limit": number
    "offset": number starts from 0
}
</pre>

#### Success Response:
<pre>
{
    [
        {
            "id": UUID,
            "createdAt": timestamp
            "UpdatedAt": timestamp
            "PipelineId": UUID
            "payload": JSON
            "processedPayload": JSON
            "status": string
            "processedAt": timestamp
        }
    ]
}
</pre>

| HTTP | Endpoint |
|------|----------|
| GET  | `/api/job/:id` |

#### Success Response:
<pre>
{
    "id": UUID,
    "createdAt": timestamp
    "UpdatedAt": timestamp
    "PipelineId": UUID
    "payload": JSON
    "processedPayload": JSON
    "status": string
    "processedAt": timestamp
}
</pre>

| HTTP | Endpoint |
|------|----------|
| GET  | `/api/job/:id/attempts` |

#### Success Response:
<pre>
{
    [
        {
            "id": UUID
            "jobId": UUID
            "status": string
            "errorMessage": string
            "attemptedAt": timestamp
        }
    ]
}
</pre>

| HTTP | Endpoint |
|------|----------|
| GET  | `/api/job/:id/deliveries` |

#### Success Response:
<pre>
{
    [
        {
            "id": UUID
            "jobId": UUID
            "subscriberURL": URL
            "status": string
            "responseCode": number
            "errorMessage": string
            "attemptedAt": timestamp
        }
    ]
}
</pre>

### Ping (`/api/ping`)

| HTTP | Endpoint |
|------|----------|
| GET  | `/api/ping` |

#### Success Response:
<pre>
{
    "message": "Pong"
}
</pre>

## Available Actions

1. **Capitalize**:
    Capitalize the request payload before sending it to subscribers
    
    <pre>
    {
        CapitalizeConfig: {
            mode: "capitalize" | "uppercase" | "lowercase" | "titlecase" # type of capitalization you want to do
            fields?: string[] # fields to perform the actions on
            ignoreFields?: string[] # fields to ignore while performing actions
        }
    }
    </pre>

    ### Capitalization modes:
        1. `capitalize`: makes only the first letter uppercase and the rest to lowercase (`hEllO wORld` -> `Hello world`) 
        2. `uppercase`: makes the whole text uppercase (`hEllO wORld` -> `HELLO WORLD`) 
        3. `lowercase`: makes the whole text lowercase (`hEllO wORld` -> `hello world`) 
        4. `titlecase`: converts the text to title case (`hEllO wORld` -> `Hello World`) 

2. **Replace**:
    Replace specific parts of text with another text

    <pre>
    {
        ReplaceConfig: {
            mode: "replace-first" | "replace-all" | "replace-last" # type of replacment you want to do
            words: string[] # replace these words
            replaceWith: string[] # replace with these words
            goThrough?: boolean # go through the whole text fields
        }
    }
    </pre>

    ### Replacment modes:
        1. `replace-first`: replace only the first occurance of the word (`This is a replacment is` -> `This word a replacment is`)
        2. `replace-all`: replace all occurances of the word (`This is a replacment is` -> `This word a replacment word`)
        3. `replace-last`: replace only the last occurance of the word (`This is a replacment is` -> `This is a replacment word`)

3. **Filter**:
    Filters sensitive fields of an object

    <pre>
    {
        FilterConfig: {
            mode: "omit" | "redaction" | "masking" # type of filtering you want to do
            fields: string[] # fields to filter
            ignoreFields: string[] # fields to ignore while performing actions
        }
    }
    </pre>

    ### Filtering modes:
        1. `omit`: omits the fields from the payload
        2. `redaction`: replace the field value with "[REDACTED]"
        3. `masking`: reduce the field value to only include the last 4 values in it (`Baraa Khalil` -> `****alil`)
    
    By default the filter action filters password, token, credit_card, ssn & api_key, if you want to keep them include them in the ignoreFields option.

