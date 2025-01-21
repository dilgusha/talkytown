<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

<p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
<p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://coveralls.io/github/nestjs/nest?branch=master" target="_blank"><img src="https://coveralls.io/repos/github/nestjs/nest/badge.svg?branch=master#9" alt="Coverage" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
<a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg"/></a>
<a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
<a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow"></a>
</p>

TalkyTown

TalkyTown is a backend application designed for creating real-time communication and chat applications. This project offers a modern infrastructure that enables users to communicate and exchange messages in real-time, utilizing WebSocket technology. It is developed using NestJS and features a dynamic and scalable architecture.

Features
- User management (registration, login, authorization)
- Real-time messaging (WebSocket integration)
- Database connectivity and operations
- Modular and scalable architecture
- Template-based dynamic content management

Technologies Used
- NestJS: A modern Node.js framework with a modular architecture.
- TypeScript: Used for safer and more readable code.
- PostgreSQL: A robust relational database management system.
- TypeORM: An ORM library for database interactions.
- WebSocket: For real-time communication.

Installation

Requirements
- Node.js (16.x or higher)
- npm or yarn
- PostgreSQL (a running database instance is required)

Steps
1. Clone the repository:
   ```bash
   git clone https://github.com/dilgusha/talkytown.git
   cd talkytown
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create and configure the `.env` file:
   ```env
   DATABASE_HOST=localhost
   DATABASE_PORT=5432
   DATABASE_USER=your_username
   DATABASE_PASSWORD=your_password
   DATABASE_NAME=talkytown
   JWT_SECRET=your_jwt_secret
   ```
4. Migrate the database:
   ```bash
   npm run migrate
   ```
5. Start the application:
   ```bash
   npm run start
   ```

Project Structure
```
src/
├── app/
│   ├── app.controller.ts
│   ├── app.module.ts
│   └── app.service.ts
├── common/
│   └── ...
├── config/
│   └── ...
├── database/
│   └── ...
├── guards/
│   └── ...
├── shared/
│   └── ...
├── socket/
│   └── WebSocket management modules.
├── templates/
│   └── Template-based content management files.
└── main.ts
```

- socket: Modules for WebSocket connections and real-time communication.
- templates*: Files for dynamic content and template management.
- main.ts: Entry point of the application.

Test
```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

Support
TalkyTown is an open-source project licensed under MIT. Contributions, feedback, and support are always welcome. If you'd like to contribute, please submit a pull request or open an issue.

Stay in Touch
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

License
This project is licensed under the MIT License.

