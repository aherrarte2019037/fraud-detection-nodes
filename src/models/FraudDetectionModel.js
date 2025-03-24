import BaseModel from './baseModel.js';

class FraudDetectionModel extends BaseModel {
  constructor() {
    super('FraudDetection');
  }

  async findPotentialMoneyLaundering() {
    const query = `
      MATCH (c:Client)-[:OWNS]->(a1:Account)<-[:FROM]-(t1:Transaction)-[:TO]->(a2:Account)<-[:OWNS]-(c2:Client),
            (a2)<-[:FROM]-(t2:Transaction)-[:TO]->(a3:Account)<-[:OWNS]-(c3:Client)
      WHERE c.id <> c3.id AND 
            t1.date <= t2.date AND 
            duration.inDays(t1.date, t2.date).days <= 3 AND
            abs(t1.amount - t2.amount) / t1.amount <= 0.1
      RETURN c, a1, t1, a2, c2, t2, a3, c3
      ORDER BY t1.amount DESC
    `;
    return await this.executeQuery(query);
  }

  async findUnusualDeviceUsage() {
    const query = `
      MATCH (c:Client)-[:OWNS]->(a:Account)<-[:FROM]-(t:Transaction)-[:MADE_FROM]->(d:Device)
      WITH c, d, count(t) as usageCount
      MATCH (d)<-[:MADE_FROM]-(t2:Transaction)-[:FROM]->(a2:Account)<-[:OWNS]-(c2:Client)
      WHERE c.id <> c2.id
      RETURN d, collect(DISTINCT c) as clients, count(t2) as transactionCount
      ORDER BY size(clients) DESC, transactionCount DESC
    `;
    return await this.executeQuery(query);
  }

  async findRapidSuccessiveTransactions(timeWindowMinutes = 60, minTransactions = 3) {
    const query = `
      MATCH (a:Account)<-[:FROM]-(t:Transaction)
      WITH a, t
      ORDER BY a.id, t.date
      WITH a, collect(t) as transactions
      UNWIND range(0, size(transactions)-${minTransactions}) as idx
      WITH a, transactions, idx
      WHERE duration.inSeconds(transactions[idx].date, transactions[idx+${minTransactions-1}].date).seconds <= (${timeWindowMinutes} * 60)
      RETURN a, transactions[idx..idx+${minTransactions}] as suspiciousTransactions
    `;
    return await this.executeQuery(query);
  }

  async findUnusualTransactionPatterns() {
    const query = `
      MATCH (c:Client)-[:OWNS]->(a:Account)<-[:FROM]-(t:Transaction)
      WHERE t.amount > a.averageTransactionAmount * 3 OR
            t.amount > 10000
      WITH c, a, t
      MATCH (t)-[:OCCURRED_AT]->(l:Location)
      OPTIONAL MATCH (t)-[:MADE_FROM]->(d:Device)
      RETURN c, a, t, l, d
      ORDER BY t.amount DESC, t.riskScore DESC
    `;
    return await this.executeQuery(query);
  }

  async findAccountsWithUnusualActivityIncrease(days = 30, increaseThreshold = 200) {
    const query = `
      MATCH (a:Account)<-[:FROM]-(t:Transaction)
      WITH a, 
           count(t) as totalTransactions,
           count(CASE WHEN t.date >= datetime() - duration({days: $days}) THEN t ELSE null END) as recentTransactions,
           avg(CASE WHEN t.date < datetime() - duration({days: $days}) THEN t.amount ELSE null END) as pastAvgAmount,
           avg(CASE WHEN t.date >= datetime() - duration({days: $days}) THEN t.amount ELSE null END) as recentAvgAmount
      WHERE recentTransactions > 0 AND 
            (recentTransactions * 30 / $days) > totalTransactions * $increaseThreshold / 100
      RETURN a, 
             totalTransactions, 
             recentTransactions, 
             pastAvgAmount, 
             recentAvgAmount,
             (recentTransactions * 30 / $days) / (totalTransactions * 30 / a.accountAgeInDays) * 100 as activityIncreasePercent
      ORDER BY activityIncreasePercent DESC
    `;
    return await this.executeQuery(query, { days, increaseThreshold });
  }

  async aggregateTransactionsByRiskCategory() {
    const query = `
      MATCH (t:Transaction)
      WITH 
        CASE
          WHEN t.riskScore >= 0.8 THEN 'Very High'
          WHEN t.riskScore >= 0.6 THEN 'High'
          WHEN t.riskScore >= 0.4 THEN 'Medium'
          WHEN t.riskScore >= 0.2 THEN 'Low'
          ELSE 'Very Low'
        END as riskCategory,
        count(t) as transactionCount,
        sum(t.amount) as totalAmount,
        avg(t.amount) as avgAmount,
        min(t.amount) as minAmount,
        max(t.amount) as maxAmount
      RETURN riskCategory, transactionCount, totalAmount, avgAmount, minAmount, maxAmount
      ORDER BY 
        CASE riskCategory
          WHEN 'Very High' THEN 1
          WHEN 'High' THEN 2
          WHEN 'Medium' THEN 3
          WHEN 'Low' THEN 4
          WHEN 'Very Low' THEN 5
        END
    `;
    return await this.executeQuery(query);
  }
}

export default new FraudDetectionModel();