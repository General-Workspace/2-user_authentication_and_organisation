# Simple Authentication Service

Simple authentication service that allows users to sign up and log in. The service is built using Node.js, TypeScript, Express, and Postgres. At signup, a default organization is created using the user's first name.

## Installation

> - Clone the repository
> - Run `npm install` or `yarn install` to install dependencies
> - Create a `.env` file in the root directory and add the following environment variables:
>   - `DATABASE_URL` - The URL to your Postgres database
>   - `JWT_SECRET` - A secret key for generating JWT tokens
>   - `JWT_EXPIRY` - The expiry time for JWT tokens
> - Run `npm run dev` or `yarn dev` to start the server

## API Endpoints

The following endpoints are available:

> - `POST /auth/register` - New user registration 
> - `POST /auth/login` - User login
> - `GET /api/users/:id` - Get the current user
> - `GET /api/organisation/:orgId` - Get the organization details
> - `POST /api/organisations` - Create a new organization
> - `GET /api/organisations` - Get all organizations
> - `POST /api/organisations/:orgId/users` - Add a user to an organization
