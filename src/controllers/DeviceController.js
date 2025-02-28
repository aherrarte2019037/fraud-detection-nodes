import BaseController from './BaseController.js';
import DeviceModel from '../models/DeviceModel.js';

class DeviceController extends BaseController {
  constructor() {
    super(DeviceModel);
  }

  async findByDeviceId(req, res, next) {
    try {
      const { deviceId } = req.params;
      const device = await this.model.findByDeviceId(deviceId);

      if (!device) {
        return res.status(404).json({
          success: false,
          message: `No device found with device ID ${deviceId}`
        });
      }

      res.status(200).json({
        success: true,
        data: device
      });
    } catch (error) {
      next(error);
    }
  }

  async findUsedByMultipleClients(req, res, next) {
    try {
      const minClients = parseInt(req.query.minClients) || 2;

      const devices = await this.model.findDevicesUsedByMultipleClients(minClients);

      res.status(200).json({
        success: true,
        count: devices.length,
        data: devices
      });
    } catch (error) {
      next(error);
    }
  }

  async findWithUnusualLocations(req, res, next) {
    try {
      const devices = await this.model.findDevicesWithUnusualLocations();

      res.status(200).json({
        success: true,
        count: devices.length,
        data: devices
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new DeviceController();