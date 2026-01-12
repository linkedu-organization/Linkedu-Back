# Linkedu 🎓

_Plataforma que conecta você às oportunidades acadêmicas._

## 📌 Table of Contents

- [Introduction](https://github.com/Engenharia-de-Software-Grupo-1/AchadoseLidos-Back?tab=readme-ov-file#-introduction)
- [Technologies](https://github.com/Engenharia-de-Software-Grupo-1/AchadoseLidos-Back?tab=readme-ov-file#%EF%B8%8F-technologies)
- [Installation](https://github.com/Engenharia-de-Software-Grupo-1/AchadoseLidos-Back?tab=readme-ov-file#-installation)
- [Usage](https://github.com/Engenharia-de-Software-Grupo-1/AchadoseLidos-Back?tab=readme-ov-file#-usage)
- [Testing](https://github.com/Engenharia-de-Software-Grupo-1/AchadoseLidos-Back?tab=readme-ov-file#-testing)
- [Development Tools](https://github.com/Engenharia-de-Software-Grupo-1/AchadoseLidos-Back?tab=readme-ov-file#%EF%B8%8F-development-tools)

## 📝 Introduction

Linkedu is a website for teachers and students to share and find academic opportunities, such as research projects. The platform allows users to create profiles, post opportunities, and search for opportunities based on their interests and needs.

## 🛠️ Technologies

The technologies used in this project are:

- **Node.js** and **TypeScript** for functionalities development
- **Express** as the web framework for building the API
- **Jest** for testing
- **Json Web Token** for authentication and authorization
- **ESLint** for code linting and **Prettier** for code formatting
- **Prisma** as the ORM, **Postgres** as the database and **Docker** for containerization

The recommended Node.js version for this project is v22.18.0. Please use this version when installing dependencies.

## 📂 Installation

You'll need Docker Desktop installed in your machine to run this project in local environment. You can see how to do it on your OS on [Docker Desktop](https://www.docker.com/)

Follow these steps to install and set up the project:

1. Clone the repository

   ```bash
   git clone https://github.com/linkedu-organization/Linkedu-Back.git
   ```

2. Navigate to the project directory

   ```bash
   cd Linkedu-Back
   ```

3. Install dependencies

   ```bash
   npm install
   ```

## 👩‍💻 Usage

### Setting Up the Database

1. Create a `.env` file with the values required in the `docker-compose.yml` file.
2. Ensure the Docker daemon is running. On Windows, you can start Docker Desktop from the Start menu.
3. Run the following command to set up the database for the first time:

   ```bash
   docker-compose up -d
   ```

4. Create migrations from your Prisma schema, apply them to the database, and generate artifacts:

   ```bash
   npx prisma migrate dev
   ```

5. You can run the following command to visualize the artifacts created:

   ```bash
   npx prisma studio
   ```

### Running the Project

1. Ensure the Docker daemon is running. On Windows, you can start Docker Desktop from the Start menu.

2. List all containers (including stopped ones) to find the container ID or name:

   ```bash
   docker ps -a
   ```

3. Start the stopped container using its container ID or name:

   ```bash
   docker start <container_id_or_name>
   ```

4. Run the project:

   ```bash
   npm start
   ```

### Stopping the Docker Container

1. List all containers (including stopped ones) to find the container ID or name:

   ```bash
   docker ps -a
   ```

2. Stop the running container using its container ID or name:

   ```bash
   docker stop <container_id_or_name>
   ```

## 🔬 Testing

To run the tests, use:

```bash
npm test
```

## ⚙️ Development Tools

It's recommended to use the following extensions in VSCode for better readability and maintaining code patterns:

- **Prettier**
- **Eslint**
- **Prisma**

To auto-format code in VSCode, add the following to your `settings.json`:

```json
{
  "editor.tabSize": 2,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll": "explicit"
  },
  "prettier.configPath": ".prettierrc",
  "eslint.codeAction.showDocumentation": {
    "enable": true
  },
  "eslint.validate": ["javascript", "javascriptreact", "typescript", "typescriptreact"],
  "eslint.useFlatConfig": true,
  "[prisma]": {
    "editor.defaultFormatter": "Prisma.prisma"
  }
}
```
