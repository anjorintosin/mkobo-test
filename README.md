# MKOBO-TEST SMS Gateway

This SMS Gateway project provides a simple API for handling inbound and outbound SMS requests. It includes a server, controllers, database configuration, and routes for processing SMS messages. Below is an overview of the project components and setup instructions.

## Project Structure

The project is organized into several main components:

### Controllers

- `sms.controller.ts`: Contains the logic for processing inbound and outbound SMS messages. It validates requests, checks for STOP requests, and enforces request limits.

### Routes

- `sms.routes.ts`: Defines the API routes for handling SMS messages. It maps HTTP endpoints to controller functions.

### Server

- `server.ts`: Sets up an Express server with middleware and routes for handling SMS-related requests. It includes basic authentication, request validation, and error handling.

### Database Configuration

- `db.ts`: Configures the PostgreSQL database connection using the `pg` library. It uses environment variables for database credentials.

### Environment Variables

The project uses the `dotenv` library to load environment variables. Create a `.env` file in the project root directory with the following variables:

```
POSTGRES_USERNAME=your_username
POSTGRES_PASSWORD=your_password
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB_NAME=your_database_name
PORT=3000
```

## Authentication

To test the API using Postman, use Basic Authentication. Provide the following credentials:

- **Username**: Use an account's username from the database.
- **Password**: Use the corresponding `auth_id` from the same account row as the password.

This authentication is required to have permission to run API requests.

## Setup Instructions

To run the SMS Gateway project, follow these steps:

1. Ensure you have Node.js and npm installed on your system.

2. Start a PostgreSQL database and configure it with the provided environment variables in the `.env` file.

3. Make sure you have Redis running, as it is used for caching.

4. Run the following commands in the project directory:

   ```
   npm install        # Install project dependencies
   npm run build      # Build the TypeScript code
   npm run start      # Start the Express server
   ```

5. The server should now be running on the specified port (default: 3000). You can make requests to the API endpoints for processing SMS messages.

## API Endpoints

- `POST /inbound/sms`: Process inbound SMS messages.
- `POST /outbound/sms`: Process outbound SMS messages.

## API Documentation

For detailed information on the API endpoints, request parameters, and expected behavior, refer to the inline comments in the `sms.controller.ts` file. Each function is documented to explain its purpose and usage.

**Note:** Make sure to replace placeholders like `your_username`, `your_password`, and `your_database_name` in the environment variables with your actual database credentials.
