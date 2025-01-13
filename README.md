# NestJS REST API Boilerplate

A highly scalable and maintainable NestJS boilerplate with TypeScript, MongoDB, MSSQL, JWT Authentication, i18n support, and many other features out of the box.

---

## Features

### **Multiple Database Support**
- MongoDB using Mongoose
- MSSQL using TypeORM
- Dynamic database connections
- Repository pattern implementation

### **Authentication & Authorization**
- JWT-based authentication
- Role-based authorization
- Refresh token rotation
- Token blacklisting
- Password reset functionality

### **Internationalization**
- Multi-language support using `nestjs-i18n`
- Validation messages in multiple languages
- Response messages in multiple languages

### **Security**
- Rate limiting with flexible configuration
- CORS configuration
- Helmet integration
- Request validation
- Security headers

### **Error Handling**
- Global exception filter
- Validation error handling
- Custom error responses
- Comprehensive error logging

### **Logging**
- Winston logger integration
- Request logging
- Error logging
- Daily rotating file logs

### **API Documentation**
- Swagger/OpenAPI integration
- Detailed API documentation
- Request/Response examples

### **Code Quality**
- TypeScript
- ESLint
- Prettier
- Clean Architecture principles
- SOLID principles

---

## Prerequisites

- Node.js (>= 16.x)
- MongoDB
- MSSQL (optional)
- npm, yarn, pnpm, bun

---

## Installation

```bash
# Clone the repository
git clone https://github.com/yasirsey/nest-rest-boilerplate.git

# Navigate to the project directory
cd nest-rest-boilerplate

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env

# Start the application
npm run start:dev
```

---

## Environment Variables

### API
```env
PORT=3000
NODE_ENV=development
```

### MongoDB
```env
MONGODB_URI=mongodb://localhost:27017/your-database-name
MONGODB_DB_NAME=your_db_name
```

### MSSQL (Optional)
```env
MSSQL_ENABLED=false
MSSQL_HOST=localhost
MSSQL_PORT=1433
MSSQL_USERNAME=sa
MSSQL_PASSWORD=your_password
MSSQL_DATABASE=your_database
```

### JWT
```env
JWT_SECRET=your-jwt-secret-key
JWT_EXPIRES_IN=24h
```

### CORS
```env
CORS_ORIGINS=http://localhost:3000,http://localhost:4200
CORS_CREDENTIALS=true
```

### Rate Limiting
```env
RATE_LIMIT_GENERAL_TTL=60000
RATE_LIMIT_GENERAL_LIMIT=100
```

---

## Project Structure

```plaintext
src/
├── core/
│   ├── database/
│   ├── filters/
│   ├── guards/
│   ├── interceptors/
│   └── services/
├── modules/
│   ├── auth/
│   └── users/
├── config/
├── i18n/
└── main.ts
```

---

## API Documentation

The API documentation is available at `/api/docs` when running the application in development mode.

---

## Authentication

The API uses JWT for authentication. To access protected endpoints:

1. Register a new user or login with existing credentials.
2. Use the returned JWT token in the `Authorization` header.
3. Refresh tokens when needed using the refresh token endpoint.

---

## Internationalization

The API supports multiple languages. Set the `Accept-Language` header to switch between languages:

- `en` - English
- `tr` - Turkish

---

## License

This project is licensed under the [MIT License](LICENSE).
