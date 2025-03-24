import BaseModel from './baseModel.js';

class ClientModel extends BaseModel {
  constructor() {
    super('Client');
  }

  async findByIdentificationNumber(idNumber) {
    const query = `
      MATCH (c:Client)
      WHERE c.identificationNumber = $idNumber
      RETURN c
    `;
    const result = await this.executeQuery(query, { idNumber });
    return result[0] ? result[0].c : null;
  }

  async findClientsWithMultipleAccounts(minAccounts = 3) {
    const query = `
      MATCH (c:Client)-[r:OWNS]->(a:Account)
      WITH c, count(a) as accountCount
      WHERE accountCount >= $minAccounts
      RETURN c, accountCount
      ORDER BY accountCount DESC
    `;
    return await this.executeQuery(query, { minAccounts });
  }

  async findClientsByRiskScore(minScore, maxScore) {
    const query = `
      MATCH (c:Client)
      WHERE c.riskScore >= $minScore AND c.riskScore <= $maxScore
      RETURN c
      ORDER BY c.riskScore DESC
    `;
    return await this.executeQuery(query, { minScore, maxScore });
  }
}

export default new ClientModel();