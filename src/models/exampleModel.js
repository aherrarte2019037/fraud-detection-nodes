import { driver } from '../config/db.js';

class ExampleModel {
  async executeQuery(query, params = {}) {
    const session = driver.session();
    try {
      const result = await session.run(query, params);
      return result.records.map(record => {
        return this.processRecord(record);
      });
    } finally {
      await session.close();
    }
  }

  processRecord(record) {
    const processed = {};
    record.keys.forEach(key => {
      const value = record.get(key);
      if (value && value.properties) {
        // Handle node objects
        processed[key] = {
          ...value.properties,
          id: value.identity.toString()
        };
      } else {
        // Handle primitive values
        processed[key] = value;
      }
    });
    return processed;
  }

  async createNode(label, properties) {
    const query = `
      CREATE (n:${label} $properties)
      RETURN n
    `;
    const result = await this.executeQuery(query, { properties });
    return result[0] ? result[0].n : null;
  }

  async findNodes(label, properties = {}) {
    let query = `MATCH (n:${label})`;
    
    if (Object.keys(properties).length > 0) {
      const conditions = Object.keys(properties)
        .map(key => `n.${key} = $properties.${key}`)
        .join(' AND ');
      query += ` WHERE ${conditions}`;
    }
    
    query += ` RETURN n`;
    
    return await this.executeQuery(query, { properties });
  }
}

export default new ExampleModel(); 