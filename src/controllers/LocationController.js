import BaseController from './BaseController.js';
import LocationModel from '../models/LocationModel.js';

class LocationController extends BaseController {
  constructor() {
    super(LocationModel);

    this.getAll = this.getAll.bind(this);
    this.getById = this.getById.bind(this);
    this.create = this.create.bind(this);
    this.update = this.update.bind(this);
    this.delete = this.delete.bind(this);
    this.addProperties = this.addProperties.bind(this);
    this.removeProperties = this.removeProperties.bind(this);

    this.findByCoordinates = this.findByCoordinates.bind(this);
    this.findHighRiskLocations = this.findHighRiskLocations.bind(this);
    this.findUnusualTransactionLocations = this.findUnusualTransactionLocations.bind(this);
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