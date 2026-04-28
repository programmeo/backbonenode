# @programmeo/backbonenode

A powerful, interactive CLI tool to scaffold production-ready, performant Express.js backend projects instantly.

[![npm version](https://badge.fury.io/js/@programmeo%2Fbackbonenode.svg)](https://www.npmjs.com/package/@programmeo/backbonenode)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 🚀 Core Concepts & How It Works

**Backbone Node** was created to eliminate the repetitive boilerplate involved in setting up secure, scalable Node.js applications. Instead of copying and pasting your authentication logic, database configuration, or performance middlewares across different projects, Backbone generates them for you dynamically based on your requirements.

### Key Features
1. **Interactive Scaffolding**: Simply run the CLI, answer a few questions about your project needs, and your backend is generated in seconds.
2. **Production-Grade MVC Structure**: Every project generated enforces a strict Model-View-Controller architecture. Core server logic lives in `bin/server.js`, app configuration in `app.js`, and everything else is organized securely inside a `src/` directory.
3. **Plug-and-Play Modules**:
   - **Database**: Mongoose (MongoDB) integration pre-configured.
   - **Authentication**: JWT, Session, Google OAuth, Magic Links, and OTP flows.
   - **Notifications**: Email (Nodemailer + EJS templates) and SMS (Twilio).
   - **Background Jobs**: Built-in support for `node-cron`.
4. **Security & Performance**: Generates projects equipped with `helmet`, `cors`, `compression`, and `express-rate-limit` using their latest, most secure versions out of the box.

## 🛠 Getting Started

To generate your next backend project, run:

```bash
npx @programmeo/backbonenode
```

1. You will be prompted to enter a **Project Name** and select your desired features (Database, Auth, Crons, etc.).
2. The CLI will display a summary of the packages it plans to use and ask for your confirmation.
3. Once confirmed, `cd` into your new project, run `npm install`, and start developing!

---

## 🤝 How to Contribute

We welcome contributions from the community! Whether it's fixing bugs, improving documentation, or adding new module templates, your help is appreciated.

### Contribution Workflow

1. **Fork the Repository**: Start by forking this repository to your own GitHub account.
2. **Clone Locally**: 
   ```bash
   git clone https://github.com/your-username/backbonenode.git
   cd backbonenode
   ```
3. **Install Dependencies**: Run `npm install` to install necessary packages.
4. **Create a Branch**: Create a feature or bugfix branch:
   ```bash
   git checkout -b feature/your-awesome-feature
   ```
5. **Make Changes**:
   - The CLI logic lives in `bin/` and `core/`.
   - The boilerplate templates live in `templates/standard/` and `modules/`.
   - Ensure your code follows the existing style and keeps performance in mind.
6. **Test Locally**: You can test your changes by running the CLI locally:
   ```bash
   node bin/index.js
   ```
7. **Commit & Push**: Commit your changes with a descriptive message and push to your fork.
8. **Submit a Pull Request**: Open a PR against our `main` branch. Please provide a clear description of what your PR solves or adds.

---

## 👥 Contributors

This project is maintained by the **Programimeo** team and the open-source community. 

If you contribute to this repository, your name will be added here! We deeply appreciate the developers who dedicate their time to making scaffolding easier for everyone.

*To be added to the contributors list, simply submit a valid Pull Request!*

---

**License**  
This project is licensed under the MIT License.
