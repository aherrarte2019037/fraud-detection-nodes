import BaseController from './BaseController.js';
import LocationModel from '../models/LocationModel.js';

class LocationController extends BaseController {
  constructor() {
    super(LocationModel);
  }

  async findByCoordinates(req, res, next) {
    try {
      const { latitude, longitude } = req.query;
      const radius = parseFloat(req.query.radius) || 0.1;
      
      if (!latitude || !longitude) {
        return res.status(400).json({
          success: false,
          message: 'Please provide both latitude and longitude'
        });
      }
      
      const locations = await this.model.findByCoordinates(
        parseFloat(latitude), 
        parseFloat(longitude), 
        radius
      );
      
      res.status(200).json({
        success: true,
        count: locations.length,
        data: locations
      });
    } catch (error) {
      next(error);
    }
  }

  async findHighRiskLocations(req, res, next) {
    try {
      const locations = await this.model.findHighRiskLocations();
      
      res.status(200).json({
        success: true,
        count: locations.length,
        data: locations
      });
    } catch (error) {
      next(error);
    }
  }

  async findUnusualTransactionLocations(req, res, next) {
    try {
      const { clientId } = req.params;
      
      const locations = await this.model.findUnusualTransactionLocations(clientId);
      
      res.status(200).json({
        success: true,
        count: locations.length,
        data: locations
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new LocationController();