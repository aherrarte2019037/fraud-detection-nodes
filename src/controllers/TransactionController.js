import BaseController from './BaseController.js';
import TransactionModel from '../models/TransactionModel.js';

class TransactionController extends BaseController {
  constructor() {
    super(TransactionModel);
  }

  async findByTransactionId(req, res, next) {
    try {
      const { transactionId } = req.params;
      const transaction = await this.model.findByTransactionId(transactionId);

      if (!transaction) {
        return res.status(404).json({
          success: false,
          message: `No transaction found with transaction ID ${transactionId}`
        });
      }

      res.status(200).json({
        success: true,
        data: transaction
      });
    } catch (error) {
      next(error);
    }
  }

  async findInDateRange(req, res, next) {
    try {
      const { startDate, endDate } = req.query;

      if (!startDate || !endDate) {
        return res.status(400).json({
          success: false,
          message: 'Please provide both startDate and endDate'
        });
      }

      const transactions = await this.model.findTransactionsInDateRange(startDate, endDate);

      res.status(200).json({
        success: true,
        count: transactions.length,
        data: transactions
      });
    } catch (error) {
      next(error);
    }
  }

  async findByAmount(req, res, next) {
    try {
      const minAmount = parseFloat(req.query.minAmount) || 0;
      const maxAmount = parseFloat(req.query.maxAmount) || Number.MAX_SAFE_INTEGER;

      const transactions = await this.model.findTransactionsByAmount(minAmount, maxAmount);

      res.status(200).json({
        success: true,
        count: transactions.length,
        data: transactions
      });
    } catch (error) {
      next(error);
    }
  }

  async findSuspicious(req, res, next) {
    try {
      const threshold = parseFloat(req.query.threshold) || 10000;

      const transactions = await this.model.findSuspiciousTransactions(threshold);

      res.status(200).json({
        success: true,
        count: transactions.length,
        data: transactions
      });
    } catch (error) {
      next(error);
    }
  }

  async findCircularPatterns(req, res, next) {
    try {
      const maxDepth = parseInt(req.query.maxDepth) || 4;

      const patterns = await this.model.findCircularTransactionPatterns(maxDepth);

      res.status(200).json({
        success: true,
        count: patterns.length,
        data: patterns
      });
    } catch (error) {
      next(error);
    }
  }

  async findBetweenAccounts(req, res, next) {
    try {
      const { fromAccountId, toAccountId } = req.params;

      const transactions = await this.model.findTransactionsBetweenAccounts(
        fromAccountId,
        toAccountId
      );

      res.status(200).json({
        success: true,
        count: transactions.length,
        data: transactions
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new TransactionController();