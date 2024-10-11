
# Assignment Submission Portal

## Setup and Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/rahulchav/Assignment_project.git
   cd <repository_folder>
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```
3. **Start the server:**

   ```bash
   node app.js
   ```
4. **Setup Postman:**

   - Download the Postman JSON From mail and Open Postman.
   - Import the Postman collection from the Collections JSON.
   - Import the Postman collection environment variable from the JSON.
   - Collection have script that automatically set the token as currently logged in person.

## API Documentation

### User Endpoints:

- **POST /register** - Register a new user.
  - Both Admins and Users can register from the same end point for Admin we need to pass extra admin key set to true in payload.
  - Request body:
  
    ```json
    {
      "name": "string",
      "email": "string",
      "password": "string",
      "admin": "boolean"
    }
    ```

- **POST /login** - User login.
  - Both Admins and Users can Login from the same end point.
  - Request body:
  
    ```json
    {
      "email": "string",
      "password": "string"
    }
    ```

- **POST /upload** - Upload an assignment.
  - Only users can upload the assignment admins not allowed.
  - Request body:
  
    ```json
    {
      "task": "Assignment description",
      "admin": "Admin Name"
    }
    ```

- **GET /admins** - Fetch all admins.

### Admin Endpoints:

- This routes are only restricted to the admin access.

- Here assignments ids need to be fetched separately and pass on to the URL as params to accept or reject.

- **GET /assignments** - View assignments tagged to the admin.

- **POST /assignments/:id/accept** - Accept an assignment.

- **POST /assignments/:id/reject** - Reject an assignment.

## Technologies Used:

- **Node.js** - Backend runtime environment.
- **Express.js** - Web framework for Node.js.
- **MongoDB** - NoSQL database.
- **Mongoose** - MongoDB object modeling for Node.js.
- **JWT** - For user authentication.
