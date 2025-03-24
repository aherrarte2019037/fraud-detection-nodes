import BaseModel from './baseModel.js';

class AccountModel extends BaseModel {
  constructor() {
    super('Account');
  }

  async findByAccountNumber(accountNumber) {
    const query = `
      MATCH (a:Account)
      WHERE a.accountNumber = $accountNumber
      RETURN a
    `;
    const result = await this.executeQuery(query, { accountNumber });
    return result[0] ? result[0].a : null;
  }

  async findAccountsWithOwner() {
    const query = `
      MATCH (c:Client)-[r:OWNS]->(a:Account)
      RETURN a, c
    `;
    return await this.executeQuery(query);
  }

  async findAccountsWithHighBalanceChange(percentChange = 50, days = 30) {
    const query = `
      MATCH (a:Account)
      WHERE a.balanceChangePercent >= $percentChange AND 
            a.lastBalanceChangeDate >= datetime() - duration({days: $days})
      RETURN a
      ORDER BY a.balanceChangePercent DESC
    `;
    return await this.executeQuery(query, { percentChange, days });
  }

  async findAccountsWithRecentCreation(days = 90) {
    const query = `
      MATCH (a:Account)
      WHERE a.creationDate >= datetime() - duration({days: $days})
      RETURN a
      ORDER BY a.creationDate DESC
    `;
    return await this.executeQuery(query, { days });
  }
}

export default new AccountModel();