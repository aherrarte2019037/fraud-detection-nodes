import BaseController from './BaseController.js';
import AccountModel from '../models/AccountModel.js';

class AccountController extends BaseController {
  constructor() {
    super(AccountModel);

    this.getAll = this.getAll.bind(this);
    this.getById = this.getById.bind(this);
    this.create = this.create.bind(this);
    this.update = this.update.bind(this);
    this.delete = this.delete.bind(this);
    this.addProperties = this.addProperties.bind(this);
    this.removeProperties = this.removeProperties.bind(this);

    this.findByAccountNumber = this.findByAccountNumber.bind(this);
    this.findAccountsWithOwner = this.findAccountsWithOwner.bind(this);
    this.findAccountsWithHighBalanceChange = this.findAccountsWithHighBalanceChange.bind(this);
    this.findRecentAccounts = this.findRecentAccounts.bind(this);
  }

  async findByAccountNumber(req, res, next) {
    try {
      const { accountNumber } = req.params;
      const account = await this.model.findByAccountNumber(accountNumber);

      if (!account) {
        return res.status(404).json({
          success: false,
          message: `No account found with account number ${accountNumber}`
        });
      }

      res.status(200).json({
        success: true,
        data: account
      });
    } catch (error) {
      next(error);
    }
  }

  async findAccountsWithOwner(req, res, next) {
    try {
      const accounts = await this.model.findAccountsWithOwner();

      res.status(200).json({
        success: true,
        count: accounts.length,
        data: accounts
      });
    } catch (error) {
      next(error);
    }
  }

  async findAccountsWithHighBalanceChange(req, res, next) {
    try {
      const percentChange = parseFloat(req.query.percentChange) || 50;
      const days = parseInt(req.query.days) || 30;

      const accounts = await this.model.findAccountsWithHighBalanceChange(percentChange, days);

      res.status(200).json({
        success: true,
        count: accounts.length,
        data: accounts
      });
    } catch (error) {
      next(error);
    }
  }

  async findRecentAccounts(req, res, next) {
    try {
      const days = parseInt(req.query.days) || 90;

      const accounts = await this.model.findAccountsWithRecentCreation(days);

      res.status(200).json({
        success: true,
        count: accounts.length,
        data: accounts
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new AccountController();