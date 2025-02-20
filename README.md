
# ConceptualZoo - Fullstack Project

This repository contains the full-stack code for the Team 8 Zoo DB project, which includes both the **frontend** (React) and **backend** (Node.js, MySQL) components.

## Project Structure

- **Frontend**: A React app styled with Tailwind CSS.
- **Backend**: A Node.js API that connects to a MySQL database hosted on Google Cloud Platform (GCP).

## Getting Started

To get started with the project, follow these steps:

### 1. Clone the Repository

Clone the repository to your local machine:

```bash
git clone https://github.com/Team-8-Uma-2025/ConceptualZoo.git
cd ConceptualZoo
```

### 2. Set Up the Frontend

Navigate to the `frontend` directory and install the dependencies:

```bash
cd frontend
npm install
```

### 3. Set Up the Backend

Navigate to the `backend` directory and install the dependencies:

```bash
cd ../backend
npm install
```

### 4. Set Up MySQL Database

The MySQL database is hosted on Google Cloud Platform. Make sure you have the credentials for accessing it and that the necessary tables are set up. Refer to the documentation or ask the project admin for database access.

To connect your backend to the database, ensure that you update the database connection configuration in your backend code (`dbConfig.js` or similar) with your GCP MySQL credentials.

### 5. Running the Project

After installing the dependencies and setting up the database, run the project locally:

#### Frontend

To start the frontend, run:

```bash
npm start
```

This will start the React development server and open the app in your default browser.

#### Backend

To start the backend API, run:

```bash
npm start
```

This will start the Node.js server, and the backend should be available on the configured port (usually `http://localhost:5000` or similar).

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

### 7. Troubleshooting

- If you encounter issues with the MySQL database connection, make sure your credentials are correct and that the database is running.
- If there are any conflicts during pushing or pulling, make sure to resolve them before pushing.

## Contributing

- If you're adding a new feature or fixing a bug, create a new branch off `main` and open a pull request.
- Make sure to update the README or document any changes that might affect the setup or usage of the project.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
