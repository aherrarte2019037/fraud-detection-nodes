import BaseModel from './baseModel.js';

class TransactionModel extends BaseModel {
  constructor() {
    super('Transaction');
  }

  async findByTransactionId(transactionId) {
    const query = `
      MATCH (t:Transaction)
      WHERE t.transactionId = $transactionId
      RETURN t
    `;
    const result = await this.executeQuery(query, { transactionId });
    return result[0] ? result[0].t : null;
  }

  async findTransactionsInDateRange(startDate, endDate) {
    const query = `
      MATCH (t:Transaction)
      WHERE t.date >= $startDate AND t.date <= $endDate
      RETURN t
      ORDER BY t.date DESC
    `;
    return await this.executeQuery(query, { startDate, endDate });
  }

  async findTransactionsByAmount(minAmount, maxAmount) {
    const query = `
      MATCH (t:Transaction)
      WHERE t.amount >= $minAmount AND t.amount <= $maxAmount
      RETURN t
      ORDER BY t.amount DESC
    `;
    return await this.executeQuery(query, { minAmount, maxAmount });
  }

  async findSuspiciousTransactions(threshold = 10000) {
    const query = `
      MATCH (from:Account)<-[:FROM]-(t:Transaction)-[:TO]->(to:Account)
      WHERE t.amount >= $threshold OR t.riskScore >= 0.7
      OPTIONAL MATCH (t)-[:MADE_FROM]->(d:Device)
      OPTIONAL MATCH (t)-[:OCCURRED_AT]->(l:Location)
      RETURN t, from, to, d, l
      ORDER BY t.riskScore DESC, t.amount DESC
    `;
    return await this.executeQuery(query, { threshold });
  }

  async findCircularTransactionPatterns(maxDepth = 4) {
    const query = `
      MATCH path = (a:Account)-[:RECEIVED*1..${maxDepth}]->(a)
      WHERE LENGTH(path) <= $maxDepth
      RETURN path
    `;
    return await this.executeQuery(query, { maxDepth });
  }

  async findTransactionsBetweenAccounts(fromAccountId, toAccountId) {
    const query = `
      MATCH (from:Account)<-[:FROM]-(t:Transaction)-[:TO]->(to:Account)
      WHERE id(from) = $fromAccountId AND id(to) = $toAccountId
      RETURN t, from, to
      ORDER BY t.date DESC
    `;
    return await this.executeQuery(query, { 
      fromAccountId: parseInt(fromAccountId),
      toAccountId: parseInt(toAccountId)
    });
  }
}

export default new TransactionModel();