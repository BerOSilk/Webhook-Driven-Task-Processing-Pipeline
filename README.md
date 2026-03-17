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

# Request Body:
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

# Success Response:
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

# Success Response:
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

# Success Response:
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
|------|----------|
| GET  | `/api/webhopok/:id` |

This endpoint accepts both POST & GET with any body/queries you pass, it will create a new job, and queue it to run the action when the time comes

### Job (`/api/job`)

