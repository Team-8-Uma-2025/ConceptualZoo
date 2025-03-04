# ConceptualZoo Project

A full-stack application built with React, Node.js, Express, and MySQL for the Team 8 Zoo DB project.

## Project Structure

```
my-fullstack-app/
├── frontend/  (React application with Tailwind CSS)
├── backend/   (Node.js and Express API)
```

## Prerequisites

- Node.js (v14 or later)
- npm or yarn
- Git

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/Team-8-Uma-2025/ConceptualZoo.git
cd ConceptualZoo
```

### 2. Set Up the Backend

Navigate to the backend directory:

```bash
cd backend
```

Install dependencies:

```bash
npm install
```

Create a `.env` file in the backend directory:

```
DB_HOST=your-server-name.mysql.database.azure.com
DB_USER=your-username
DB_PASSWORD=your-password
DB_NAME=your-database-name
PORT=5000
```

> **Note**: Contact the team lead for the actual database credentials. DO NOT commit the `.env` file to Git.

### 3. Set Up the Frontend

Navigate to the frontend directory:

```bash
cd ../frontend
```

Install dependencies:

```bash
npm install
```

### 4. Run the Application

Start the backend server:

```bash
# In the backend directory
npm start
```

Start the frontend development server:

```bash
# In the frontend directory
npm start
```

The application should now be running:
- Frontend: [http://localhost:3000](http://localhost:3000)
- Backend API: [http://localhost:5000](http://localhost:5000)

## Database Information

We're using Azure Database for MySQL Flexible Server for our database. The connection details are in the `.env` file.

### Connecting to the Database

You can connect to the database using MySQL Workbench or the MySQL CLI:

```bash
mysql -h your-server-name.mysql.database.azure.com -u your-username -p
```

### Database Connection Issues

If you're having trouble connecting to the database on your backend:

1. Check that your `.env` file has the correct credentials
2. Make sure your IP is allowed in the Azure MySQL firewall rules
3. Verify that the SSL configuration is correct

## More Troubleshooting

- If you encounter issues with the MySQL database connection, make sure your credentials are correct and that the database is running.
- If there are any conflicts during pushing or pulling, make sure to resolve them before pushing.

## Contributing

- If you're adding a new feature or fixing a bug, create a new branch off `main` and open a pull request.
- Make sure to update the README or document any changes that might affect the setup or usage of the project.
### 6. Pushing Changes to GitHub

Before pushing any changes to the repository, make sure to pull the latest changes from the remote repository to avoid conflicts.

To pull the latest changes:

```bash
git pull origin main
```

Once you’re ready to push your changes, commit them first:

```bash
git add .
git commit -m "Your commit message"
git push origin main
```


## Deployment

Instructions for deployment will be added soon.
