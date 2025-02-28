import neo4j from 'neo4j-driver';
import dotenv from 'dotenv';

dotenv.config();

const uri = process.env.NEO4J_URI;
const user = process.env.NEO4J_USERNAME;
const password = process.env.NEO4J_PASSWORD;

const driver = neo4j.driver(uri, neo4j.auth.basic(user, password), {
  maxConnectionLifetime: 3 * 60 * 60 * 1000,
  maxConnectionPoolSize: 50,
  connectionAcquisitionTimeout: 2 * 60 * 1000,
  disableLosslessIntegers: true
});

const verifyConnectivity = async () => {
  try {
    const serverInfo = await driver.getServerInfo();
    console.log('✅ Connected to Neo4j!');
    console.log('Server Info:', serverInfo);
    return true;
  } catch (error) {
    console.error('❌ Failed to connect to Neo4j:', error);
    return false;
  }
};

const closeDriver = async () => {
  await driver.close();
  console.log('Neo4j connection closed');
};

export { driver, verifyConnectivity, closeDriver }; 