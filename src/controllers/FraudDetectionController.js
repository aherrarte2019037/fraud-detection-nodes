import BaseController from './BaseController.js';
import FraudDetectionModel from '../models/FraudDetectionModel.js';

class FraudDetectionController extends BaseController {
  constructor() {
    super(FraudDetectionModel);

    this.getAll = this.getAll.bind(this);
    this.getById = this.getById.bind(this);
    this.create = this.create.bind(this);
    this.update = this.update.bind(this);
    this.delete = this.delete.bind(this);
    this.addProperties = this.addProperties.bind(this);
    this.removeProperties = this.removeProperties.bind(this);

    this.findPotentialMoneyLaundering = this.findPotentialMoneyLaundering.bind(this);
    this.findUnusualDeviceUsage = this.findUnusualDeviceUsage.bind(this);
    this.findRapidSuccessiveTransactions = this.findRapidSuccessiveTransactions.bind(this);
    this.findUnusualTransactionPatterns = this.findUnusualTransactionPatterns.bind(this);
    this.findAccountsWithUnusualActivityIncrease = this.findAccountsWithUnusualActivityIncrease.bind(this);
    this.aggregateTransactionsByRiskCategory = this.aggregateTransactionsByRiskCategory.bind(this);
  }

  async findPotentialMoneyLaundering(req, res, next) {
    try {
      const results = await this.model.findPotentialMoneyLaundering();

      res.status(200).json({
        success: true,
        count: results.length,
        data: results
      });
    } catch (error) {
      next(error);
    }
  }

  async findUnusualDeviceUsage(req, res, next) {
    try {
      const results = await this.model.findUnusualDeviceUsage();

      res.status(200).json({
        success: true,
        count: results.length,
        data: results
      });
    } catch (error) {
      next(error);
    }
  }

  async findRapidSuccessiveTransactions(req, res, next) {
    try {
      const timeWindowMinutes = parseInt(req.query.timeWindowMinutes) || 60;
      const minTransactions = parseInt(req.query.minTransactions) || 3;

      const results = await this.model.findRapidSuccessiveTransactions(
        timeWindowMinutes,
        minTransactions
      );

      res.status(200).json({
        success: true,
        count: results.length,
        data: results
      });
    } catch (error) {
      next(error);
    }
  }

  async findUnusualTransactionPatterns(req, res, next) {
    try {
      const results = await this.model.findUnusualTransactionPatterns();

      res.status(200).json({
        success: true,
        count: results.length,
        data: results
      });
    } catch (error) {
      next(error);
    }
  }

  async findAccountsWithUnusualActivityIncrease(req, res, next) {
    try {
      const days = parseInt(req.query.days) || 30;
      const increaseThreshold = parseInt(req.query.increaseThreshold) || 200;

      const results = await this.model.findAccountsWithUnusualActivityIncrease(
        days,
        increaseThreshold
      );

      res.status(200).json({
        success: true,
        count: results.length,
        data: results
      });
    } catch (error) {
      next(error);
    }
  }

  async aggregateTransactionsByRiskCategory(req, res, next) {
    try {
      const results = await this.model.aggregateTransactionsByRiskCategory();

      res.status(200).json({
        success: true,
        count: results.length,
        data: results
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new FraudDetectionController();