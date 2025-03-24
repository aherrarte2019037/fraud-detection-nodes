# Neo4j AuraDB REST API

A RESTful API server built with Node.js, Express, and Neo4j AuraDB, using ES6 modules.

## Features

- Express.js REST API
- Neo4j AuraDB database integration
- ES6 modules syntax
- CRUD operations for graph data
- Environment variable configuration
- Error handling
- API versioning

## Prerequisites

- Node.js (v14 or higher)
- Neo4j AuraDB account with database instance

## Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/your-repo-name.git
cd your-repo-name
```

2. Install dependencies
```bash
npm install
```

3. Create a `.env` file in the root directory with your AuraDB credentials:
```
PORT=3000
NODE_ENV=development
NEO4J_URI=your-neo4j-uri
NEO4J_USERNAME=your-neo4j-username
NEO4J_PASSWORD=your-neo4j-password
```

## Usage

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

## API Endpoints

### Base URL
```
http://localhost:3000/api
```

### Available Endpoints

#### Root
- `GET /api` - Welcome message and API version

#### Examples
- `GET /api/examples` - Get all examples
- `GET /api/examples/:id` - Get example by ID
- `POST /api/examples` - Create a new example
- `POST /api/examples/query` - Execute a custom Cypher query

## Neo4j Cypher Query Examples

### Create a Node
```cypher
CREATE (e:Example {name: 'Test Example', description: 'A test example node'})
RETURN e
```

### Find Nodes by Label
```cypher
MATCH (e:Example)
RETURN e
```

### Create Relationship
```cypher
MATCH (a:Example), (b:Example)
WHERE a.name = 'First Example' AND b.name = 'Second Example'
CREATE (a)-[r:RELATES_TO {property: 'value'}]->(b)
RETURN a, r, b
```

## Project Structure

```
├── src/
│   ├── config/        # Configuration files
│   ├── controllers/   # Request handlers
│   ├── middleware/    # Express middleware
│   ├── models/        # Database models
│   ├── routes/        # API routes
│   └── index.js       # Application entry point
├── .env               # Environment variables
├── .gitignore         # Git ignore file
├── package.json       # Dependencies and scripts
└── README.md          # Project documentation
```

## License

MIT