import BaseModel from './baseModel.js';

class LocationModel extends BaseModel {
  constructor() {
    super('Location');
  }

  async findByCoordinates(latitude, longitude, radius = 0.1) {
    const query = `
      MATCH (l:Location)
      WHERE l.latitude >= $latitude - $radius AND 
            l.latitude <= $latitude + $radius AND
            l.longitude >= $longitude - $radius AND 
            l.longitude <= $longitude + $radius
      RETURN l
    `;
    return await this.executeQuery(query, { latitude, longitude, radius });
  }

  async findHighRiskLocations() {
    const query = `
      MATCH (l:Location)<-[:OCCURRED_AT]-(t:Transaction)
      WITH l, count(t) as transactionCount, avg(t.riskScore) as avgRiskScore
      WHERE avgRiskScore >= 0.7
      RETURN l, transactionCount, avgRiskScore
      ORDER BY avgRiskScore DESC, transactionCount DESC
    `;
    return await this.executeQuery(query);
  }

  async findUnusualTransactionLocations(clientId) {
    const query = `
      MATCH (c:Client)-[:OWNS]->(a:Account)<-[:FROM]-(t:Transaction)-[:OCCURRED_AT]->(l:Location)
      WHERE id(c) = $clientId
      WITH c, l, count(t) as transactionCount
      WHERE transactionCount <= 2
      RETURN l, transactionCount
      ORDER BY transactionCount
    `;
    return await this.executeQuery(query, { clientId: parseInt(clientId) });
  }
}

export default new LocationModel();