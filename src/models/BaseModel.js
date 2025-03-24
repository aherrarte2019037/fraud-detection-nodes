import { driver } from '../config/db.js';

class BaseModel {
  constructor(label) {
    this.label = label;
  }

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
      if (value && typeof value === 'object' && value.properties) {
        // Handle node objects
        processed[key] = {
          ...value.properties,
          id: value.identity.toString(),
          labels: value.labels
        };
      } else if (value && typeof value === 'object' && value.start) {
        // Handle relationship objects
        processed[key] = {
          ...value.properties,
          id: value.identity.toString(),
          type: value.type,
          startNodeId: value.start.toString(),
          endNodeId: value.end.toString()
        };
      } else {
        // Handle primitive values or collections
        processed[key] = value;
      }
    });
    return processed;
  }

  // Generic CRUD operations for nodes
  async createNode(properties, additionalLabels = []) {
    const allLabels = [this.label, ...additionalLabels].join(':');
    const query = `
      CREATE (n:${allLabels} $properties)
      RETURN n
    `;
    const result = await this.executeQuery(query, { properties });
    return result[0] ? result[0].n : null;
  }

  async findNodes(properties = {}, limit = 100) {
    let query = `MATCH (n:${this.label})`;
    
    if (Object.keys(properties).length > 0) {
      const conditions = Object.keys(properties)
        .map(key => `n.${key} = $properties.${key}`)
        .join(' AND ');
      query += ` WHERE ${conditions}`;
    }
    
    query += ` RETURN n LIMIT ${limit}`;
    
    return await this.executeQuery(query, { properties });
  }

  async findNodeById(id) {
    const query = `
      MATCH (n:${this.label})
      WHERE id(n) = $id
      RETURN n
    `;
    const result = await this.executeQuery(query, { id: parseInt(id) });
    return result[0] ? result[0].n : null;
  }

  async updateNode(id, properties) {
    const query = `
      MATCH (n:${this.label})
      WHERE id(n) = $id
      SET n += $properties
      RETURN n
    `;
    const result = await this.executeQuery(query, { 
      id: parseInt(id),
      properties
    });
    return result[0] ? result[0].n : null;
  }

  async deleteNode(id) {
    const query = `
      MATCH (n:${this.label})
      WHERE id(n) = $id
      DETACH DELETE n
      RETURN count(n) as deleted
    `;
    const result = await this.executeQuery(query, { id: parseInt(id) });
    return result[0] ? result[0].deleted : 0;
  }

  // Methods for relationship operations
  async createRelationship(fromNodeId, toNodeId, relationType, properties = {}) {
    const query = `
      MATCH (a), (b)
      WHERE id(a) = $fromId AND id(b) = $toId
      CREATE (a)-[r:${relationType} $properties]->(b)
      RETURN r
    `;
    const result = await this.executeQuery(query, { 
      fromId: parseInt(fromNodeId),
      toId: parseInt(toNodeId),
      properties
    });
    return result[0] ? result[0].r : null;
  }

  async updateRelationship(relationshipId, properties) {
    const query = `
      MATCH ()-[r]->()
      WHERE id(r) = $relationshipId
      SET r += $properties
      RETURN r
    `;
    const result = await this.executeQuery(query, { 
      relationshipId: parseInt(relationshipId),
      properties
    });
    return result[0] ? result[0].r : null;
  }

  async deleteRelationship(relationshipId) {
    const query = `
      MATCH ()-[r]->()
      WHERE id(r) = $relationshipId
      DELETE r
      RETURN count(r) as deleted
    `;
    const result = await this.executeQuery(query, { 
      relationshipId: parseInt(relationshipId)
    });
    return result[0] ? result[0].deleted : 0;
  }

  // Additional helpers for batch operations
  async batchUpdateNodes(nodeIds, properties) {
    const query = `
      UNWIND $nodeIds as nodeId
      MATCH (n:${this.label})
      WHERE id(n) = nodeId
      SET n += $properties
      RETURN count(n) as updated
    `;
    const result = await this.executeQuery(query, { 
      nodeIds: nodeIds.map(id => parseInt(id)),
      properties
    });
    return result[0] ? result[0].updated : 0;
  }

  async batchDeleteNodes(nodeIds) {
    const query = `
      UNWIND $nodeIds as nodeId
      MATCH (n:${this.label})
      WHERE id(n) = nodeId
      DETACH DELETE n
      RETURN count(n) as deleted
    `;
    const result = await this.executeQuery(query, { 
      nodeIds: nodeIds.map(id => parseInt(id))
    });
    return result[0] ? result[0].deleted : 0;
  }

  // Property management for nodes
  async addPropertiesToNode(nodeId, properties) {
    const query = `
      MATCH (n:${this.label})
      WHERE id(n) = $nodeId
      SET n += $properties
      RETURN n
    `;
    const result = await this.executeQuery(query, { 
      nodeId: parseInt(nodeId),
      properties
    });
    return result[0] ? result[0].n : null;
  }

  async removePropertiesFromNode(nodeId, propertyKeys) {
    let setClause = propertyKeys.map(key => `n.${key} = NULL`).join(', ');
    const query = `
      MATCH (n:${this.label})
      WHERE id(n) = $nodeId
      SET ${setClause}
      RETURN n
    `;
    const result = await this.executeQuery(query, { 
      nodeId: parseInt(nodeId)
    });
    return result[0] ? result[0].n : null;
  }

  // Property management for relationships
  async addPropertiesToRelationship(relationshipId, properties) {
    const query = `
      MATCH ()-[r]->()
      WHERE id(r) = $relationshipId
      SET r += $properties
      RETURN r
    `;
    const result = await this.executeQuery(query, { 
      relationshipId: parseInt(relationshipId),
      properties
    });
    return result[0] ? result[0].r : null;
  }

  async removePropertiesFromRelationship(relationshipId, propertyKeys) {
    let setClause = propertyKeys.map(key => `r.${key} = NULL`).join(', ');
    const query = `
      MATCH ()-[r]->()
      WHERE id(r) = $relationshipId
      SET ${setClause}
      RETURN r
    `;
    const result = await this.executeQuery(query, { 
      relationshipId: parseInt(relationshipId)
    });
    return result[0] ? result[0].r : null;
  }
}

export default BaseModel;