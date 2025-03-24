import { driver } from '../config/db.js';
import fs from 'fs';
import { parse } from 'csv-parse';

class CSVLoader {
  constructor() {}

  async loadClientsFromCSV(filePath) {
    return this.loadNodesFromCSV(filePath, 'Client');
  }

  async loadAccountsFromCSV(filePath) {
    return this.loadNodesFromCSV(filePath, 'Account');
  }

  async loadTransactionsFromCSV(filePath) {
    return this.loadNodesFromCSV(filePath, 'Transaction');
  }

  async loadDevicesFromCSV(filePath) {
    return this.loadNodesFromCSV(filePath, 'Device');
  }

  async loadLocationsFromCSV(filePath) {
    return this.loadNodesFromCSV(filePath, 'Location');
  }

  async loadRelationshipsFromCSV(filePath, startLabel, endLabel, relationType) {
    return new Promise((resolve, reject) => {
      const records = [];
      const session = driver.session();

      fs.createReadStream(filePath)
        .pipe(parse({ columns: true, trim: true }))
        .on('data', (record) => {
          records.push(record);
        })
        .on('error', (error) => {
          reject(error);
        })
        .on('end', async () => {
          try {
            const query = `
              UNWIND $records AS record
              MATCH (start:${startLabel} {${record.startProperty}: record.startValue})
              MATCH (end:${endLabel} {${record.endProperty}: record.endValue})
              CREATE (start)-[r:${relationType} $properties]->(end)
              RETURN count(r) as relationshipsCreated
            `;

            const result = await session.run(query, {
              records: records.map(rec => {
                // Extracting the relationship properties
                const { startValue, endValue, startProperty, endProperty, ...properties } = rec;
                return {
                  startValue,
                  endValue,
                  startProperty,
                  endProperty,
                  properties: this.convertProperties(properties)
                };
              })
            });

            resolve(result.records[0].get('relationshipsCreated').toNumber());
          } catch (error) {
            reject(error);
          } finally {
            await session.close();
          }
        });
    });
  }

  async loadNodesFromCSV(filePath, label) {
    return new Promise((resolve, reject) => {
      const records = [];
      const session = driver.session();

      fs.createReadStream(filePath)
        .pipe(parse({ columns: true, trim: true }))
        .on('data', (record) => {
          records.push(record);
        })
        .on('error', (error) => {
          reject(error);
        })
        .on('end', async () => {
          try {
            const query = `
              UNWIND $records AS record
              CREATE (n:${label} $record)
              RETURN count(n) as nodesCreated
            `;

            const result = await session.run(query, {
              records: records.map(rec => this.convertProperties(rec))
            });

            resolve(result.records[0].get('nodesCreated').toNumber());
          } catch (error) {
            reject(error);
          } finally {
            await session.close();
          }
        });
    });
  }

  convertProperties(record) {
    const converted = {};
    
    for (const [key, value] of Object.entries(record)) {
      if (value === '') {
        continue; // Skip empty values
      }
      
      // Handle booleans
      if (value === 'true') converted[key] = true;
      else if (value === 'false') converted[key] = false;
      
      // Handle numbers
      else if (!isNaN(value) && value.trim() !== '') converted[key] = parseFloat(value);
      
      // Handle arrays (comma-separated values in brackets)
      else if (value.startsWith('[') && value.endsWith(']')) {
        const arrayStr = value.substring(1, value.length - 1);
        converted[key] = arrayStr.split(',').map(item => {
          const trimmed = item.trim();
          if (!isNaN(trimmed)) return parseFloat(trimmed);
          return trimmed;
        });
      }
      
      // Handle dates (ISO format)
      else if (/^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?)?$/.test(value)) {
        converted[key] = value;
      }
      
      // Default to string
      else converted[key] = value;
    }
    
    return converted;
  }
}

export default new CSVLoader();