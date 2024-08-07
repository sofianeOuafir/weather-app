# Weather App

Demo: (make sure to use http://, https:// is not setup). http://weather-app-alb-865442402.us-east-1.elb.amazonaws.com/

This is a weather forecasting application built using Next.js for the frontend and Node.js for the backend. The application fetches weather data from the OpenWeatherMap API and displays it to the users. The app is containerized using Docker and can be deployed to AWS ECS using AWS CDK.

## Table of Contents

1. [Local Setup](#local-setup)
2. [Running the App Locally](#running-the-app-locally)
3. [Deploying to AWS ECS](#deploying-to-aws-ecs)
4. [Configuration](#configuration)
5. [CDK Stack](#cdk-stack)

## Local Setup

### Prerequisites

- Node.js (v14 or later)
- Docker
- AWS CLI
- AWS CDK

### Cloning the Repository

```bash
git clone <repository-url>
cd weather-app
```

### Environment Variables

Create a `.env` file in the `node-backend` directory with the following content:

```plaintext
OPENWEATHERMAP_API_KEY=your_openweathermap_api_key
```

Replace `your_openweathermap_api_key` with your actual OpenWeatherMap API key.

## Running the App Locally

### Docker Compose

Ensure Docker is running and use the following command to start the services:

```bash
docker-compose -f docker-compose.dev.yml up --build
```

This will start the frontend service on `http://localhost:3002` and the backend service on `http://localhost:3000`.

### Accessing the App

- Frontend: `http://localhost:3002`
- Backend: `http://localhost:3000/api`

## Deploying to AWS ECS

### Prerequisites

- Ensure you have the AWS CLI configured with the necessary permissions.
- Ensure you have AWS CDK installed.

### CDK Configuration

Update the following values in the CDK stack file (`cdk/lib/cdk-stack.ts`):

```typescript
// Replace with your VPC ID
const vpcId = 'your_vpc_id';

// Replace with the name of your EC2 key pair
const keyName = 'your_ec2_key_pair_name';

// Replace with your ECS Task Execution Role ARN
const ecsExecutionTaskRoleArn = 'your_ecs_task_execution_role_arn';

// Replace with your OpenWeatherMap API key (for local development; store securely for production)
const openWeatherMapApiKey = 'your_openweathermap_api_key';
```

Replace the placeholders with your actual values.

### Building and Pushing Docker Images to ECR

You need to build and push your Docker images to Amazon ECR. Use the provided Makefile for this purpose. 

First, ensure you are logged in to ECR:

```bash
make ecr.login
```

Then build, tag, and push the backend and frontend images:

```bash
# For Backend
make TAG=latest image.build-tag-push.ecr.backend

# For Frontend
# Make sure to update the NEXT_PUBLIC_API_URL to the correct URL
make TAG=latest image.build-tag-push.ecr.frontend
```

### Makefile

Here is the Makefile used for building and pushing Docker images:

```Makefile
export TAG=latest

ecr.login:
	aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 381491975528.dkr.ecr.us-east-1.amazonaws.com

# Backend commands
image.build.local.backend:
	docker build --platform linux/amd64 -t weather-app-backend:$(TAG) node-backend
image.tag.ecr.backend:
	docker tag weather-app-backend:$(TAG) 381491975528.dkr.ecr.us-east-1.amazonaws.com/weather-app-backend:$(TAG); docker tag 381491975528.dkr.ecr.us-east-1.amazonaws.com/weather-app-backend:$(TAG) 381491975528.dkr.ecr.us-east-1.amazonaws.com/weather-app-backend:latest;
image.push.ecr.backend:
	docker push 381491975528.dkr.ecr.us-east-1.amazonaws.com/weather-app-backend:$(TAG); docker push 381491975528.dkr.ecr.us-east-1.amazonaws.com/weather-app-backend:latest;
image.build-tag-push.ecr.backend:
	make ecr.login;
	make TAG=$(TAG) image.build.local.backend;
	make TAG=$(TAG) image.tag.ecr.backend;
	make TAG=$(TAG) image.push.ecr.backend;

# Frontend commands
image.build.local.frontend:
	docker build --platform linux/amd64 --build-arg NEXT_PUBLIC_API_URL=http://weather-app-alb-865442402.us-east-1.elb.amazonaws.com -t weather-app-frontend:$(TAG) frontend
image.tag.ecr.frontend:
	docker tag weather-app-frontend:$(TAG) 381491975528.dkr.ecr.us-east-1.amazonaws.com/weather-app-frontend:$(TAG); docker tag 381491975528.dkr.ecr.us-east-1.amazonaws.com/weather-app-frontend:$(TAG) 381491975528.dkr.ecr.us-east-1.amazonaws.com/weather-app-frontend:latest;
image.push.ecr.frontend:
	docker push 381491975528.dkr.ecr.us-east-1.amazonaws.com/weather-app-frontend:$(TAG); docker push 381491975528.dkr.ecr.us-east-1.amazonaws.com/weather-app-frontend:latest;
image.build-tag-push.ecr.frontend:
	make ecr.login;
	make TAG=$(TAG) image.build.local.frontend;
	make TAG=$(TAG) image.tag.ecr.frontend;
	make TAG=$(TAG) image.push.ecr.frontend;
```

### Bootstrap the CDK

Run the following command to bootstrap your CDK environment (if you haven't done this before):

```bash
cdk bootstrap
```

### Deploy the Stack

Deploy the CDK stack using the following command:

```bash
cdk deploy
```

## Configuration

### Backend

The backend service is a Node.js application that fetches weather data from the OpenWeatherMap API. It exposes the following endpoints:

- `GET /api/weather/current?cityId={cityId}` - Fetches the current weather for the specified city.
- `GET /api/weather/forecast?cityId={cityId}` - Fetches the weather forecast for the next 7 days for the specified city.

### Frontend

The frontend service is a Next.js application that displays the weather data fetched from the backend service. The application allows users to select a city and view the current weather and 7-day forecast.

## CDK Stack

The CDK stack defines the AWS infrastructure required to run the application. It includes:

- A VPC
- An ECS Cluster
- Auto Scaling Groups for ECS instances
- ECS Task Definitions and Services for frontend and backend
- An Application Load Balancer with routing rules for frontend and backend

### Environment Variables

Ensure the following environment variables are set in your Docker Compose file (`docker-compose.yml`) for the frontend service:

```yaml
version: '3.8'
services:
  node-backend:
    build:
      context: ./node-backend
    container_name: node-backend
    ports:
      - "3000:3000"
    volumes:
      - ./node-backend:/usr/src/app  # Mount the node-backend directory
  
  frontend-prod:
    build:
      context: ./frontend
      dockerfile: Dockerfile
      args:
        NEXT_PUBLIC_API_URL: http://localhost:3000
    container_name: frontend-prod
    ports:
      - "3003:3000"
    environment:
      - NODE_ENV=production
```

And for development:

```yaml
version: '3.8'
services:
  node-backend:
    build:
      context: ./node-backend
    container_name: node-backend
    ports:
      - "3000:3000"
    volumes:
      - ./node-backend:/usr/src/app  # Mount the node-backend directory

  frontend-dev:
    build:
      context: ./frontend
      dockerfile: Dockerfile.dev
    container_name: frontend-dev
    ports:
      - "3002:3000"
    environment:
      - NODE_ENV=development
      - PORT=3000
      - NEXT_PUBLIC_API_URL=http://localhost:3000
```

These variables will be available in your Next.js application.

### Logging and Monitoring

The application uses AWS CloudWatch for logging. Each ECS container sends its logs to CloudWatch for monitoring and troubleshooting.

### Security

- Security groups are configured to allow traffic only on necessary ports.
- API keys and other sensitive information should be stored securely (e.g., AWS Parameter Store).
