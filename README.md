# dot-env - SvelteKit Application

A SvelteKit application with MySQL database, Drizzle ORM, and Axiom logging integration.

## Features

- **SvelteKit** with TypeScript and TailwindCSS
- **MySQL Database** with Drizzle ORM
- **Nginx Reverse Proxy** with SSL/TLS support
- **Let's Encrypt** automatic SSL certificates
- **Axiom Logging** integration
- **Docker** support for easy deployment
- **Environment Variables** demonstration

## Quick Start

### Option 1: Docker (Recommended)

1. **Setup and start with Docker:**

   ```bash
   cp .env.docker .env
   # Edit .env with your values
   ./docker-scripts.sh start
   ```

2. **Access the application:**
   - Application (via nginx): https://localhost
   - Application (direct): http://localhost:3000
   - Database Admin: http://localhost:8080

See [DOCKER.md](./DOCKER.md) for detailed Docker instructions and [NGINX.md](./NGINX.md) for nginx and SSL setup.

### Option 2: Local Development

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Setup environment:**

   ```bash
   cp .env.example .env
   # Edit .env with your database and API credentials
   ```

3. **Setup database:**

   ```bash
   # Make sure MySQL is running locally
   npm run db:push
   ```

4. **Start development server:**
   ```bash
   npm run dev
   # or with browser auto-open
   npm run dev -- --open
   ```

## Building

To create a production version of your app:

```bash
npm run build
```

You can preview the production build with `npm run preview`.

## Database Management

### Available Scripts

```bash
# Push schema changes to database
npm run db:push

# Generate migrations
npm run db:generate

# Run migrations
npm run db:migrate

# Open Drizzle Studio
npm run db:studio
```

### Docker Database Scripts

```bash
# Run migrations in Docker
./docker-scripts.sh migrate

# Open Drizzle Studio in Docker
./docker-scripts.sh studio
```

## Environment Variables

The application uses several environment variables. Copy `.env.example` to `.env` and update with your values:

- `DATABASE_URL`: MySQL connection string
- `AXIOM_TOKEN`: Axiom logging API token (optional)
- `AXIOM_DATASET`: Axiom dataset name (optional)
- Various demo environment variables for testing

## Docker Support

This project includes full Docker support with:

- Multi-stage Dockerfile for optimized builds
- Docker Compose with MySQL database
- Adminer for database management
- Management scripts for easy operations

See [DOCKER.md](./DOCKER.md) for complete Docker documentation.

## Logging

The application includes comprehensive logging with Axiom integration:

- Request/response logging
- Database operation logging
- Error tracking and reporting
- Performance monitoring

See [AXIOM_LOGGING.md](./AXIOM_LOGGING.md) for logging documentation.

## Project Structure

```
├── src/
│   ├── lib/
│   │   └── server/
│   │       ├── db/           # Database schema and connection
│   │       └── axiom/        # Logging utilities
│   └── routes/               # SvelteKit routes
├── drizzle/                  # Database migrations
├── init-db/                  # Docker database initialization
├── docker-compose.yml        # Docker services configuration
├── Dockerfile               # Application container
└── docker-scripts.sh        # Docker management scripts
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test with Docker: `./docker-scripts.sh start`
5. Submit a pull request

## License

This project is private and not licensed for public use.

> To deploy your app, you may need to install an [adapter](https://svelte.dev/docs/kit/adapters) for your target environment.
