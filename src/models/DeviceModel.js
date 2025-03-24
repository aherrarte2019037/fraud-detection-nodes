import BaseModel from './baseModel.js';

class DeviceModel extends BaseModel {
  constructor() {
    super('Device');
  }

  async findByDeviceId(deviceId) {
    const query = `
      MATCH (d:Device)
      WHERE d.deviceId = $deviceId
      RETURN d
    `;
    const result = await this.executeQuery(query, { deviceId });
    return result[0] ? result[0].d : null;
  }

  async findDevicesUsedByMultipleClients(minClients = 2) {
    const query = `
      MATCH (d:Device)<-[:MADE_FROM]-(t:Transaction)-[:FROM]->(a:Account)<-[:OWNS]-(c:Client)
      WITH d, count(DISTINCT c) as clientCount
      WHERE clientCount >= $minClients
      RETURN d, clientCount
      ORDER BY clientCount DESC
    `;
    return await this.executeQuery(query, { minClients });
  }

  async findDevicesWithUnusualLocations() {
    const query = `
      MATCH (d:Device)<-[:MADE_FROM]-(t:Transaction)-[:OCCURRED_AT]->(l:Location)
      WITH d, count(DISTINCT l) as locationCount
      WHERE locationCount >= 3
      RETURN d, locationCount
      ORDER BY locationCount DESC
    `;
    return await this.executeQuery(query);
  }
}

export default new DeviceModel();