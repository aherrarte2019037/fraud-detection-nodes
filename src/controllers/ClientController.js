import BaseController from './BaseController.js';
import ClientModel from '../models/ClientModel.js';

class ClientController extends BaseController {
  constructor() {
    super(ClientModel);
  }

  async findByIdentificationNumber(req, res, next) {
    try {
      const { idNumber } = req.params;
      const client = await this.model.findByIdentificationNumber(idNumber);
      
      if (!client) {
        return res.status(404).json({
          success: false,
          message: `No client found with identification number ${idNumber}`
        });
      }
      
      res.status(200).json({
        success: true,
        data: client
      });
    } catch (error) {
      next(error);
    }
  }

  async findClientsWithMultipleAccounts(req, res, next) {
    try {
      const minAccounts = parseInt(req.query.minAccounts) || 3;
      const clients = await this.model.findClientsWithMultipleAccounts(minAccounts);
      
      res.status(200).json({
        success: true,
        count: clients.length,
        data: clients
      });
    } catch (error) {
      next(error);
    }
  }

  async findClientsByRiskScore(req, res, next) {
    try {
      const minScore = parseFloat(req.query.minScore) || 0;
      const maxScore = parseFloat(req.query.maxScore) || 1;
      
      const clients = await this.model.findClientsByRiskScore(minScore, maxScore);
      
      res.status(200).json({
        success: true,
        count: clients.length,
        data: clients
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new ClientController();