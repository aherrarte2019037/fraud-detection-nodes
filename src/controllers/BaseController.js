class BaseController {
  constructor(model) {
    this.model = model;
  }

  async getAll(req, res, next) {
    try {
      const limit = parseInt(req.query.limit) || 100;
      const results = await this.model.findNodes({}, limit);

      res.status(200).json({
        success: true,
        count: results.length,
        data: results
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const { id } = req.params;
      const result = await this.model.findNodeById(id);

      if (!result) {
        return res.status(404).json({
          success: false,
          message: `No item found with id ${id}`
        });
      }

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  async create(req, res, next) {
    try {
      const properties = req.body.properties || req.body;
      const additionalLabels = req.body.additionalLabels || [];

      if (!properties || Object.keys(properties).length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Please provide data to create an item'
        });
      }

      const result = await this.model.createNode(properties, additionalLabels);

      res.status(201).json({
        success: true,
        message: 'Item created successfully',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const { id } = req.params;
      const properties = req.body.properties || req.body;

      if (!properties || Object.keys(properties).length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Please provide data to update'
        });
      }

      const result = await this.model.updateNode(id, properties);

      if (!result) {
        return res.status(404).json({
          success: false,
          message: `No item found with id ${id}`
        });
      }

      res.status(200).json({
        success: true,
        message: 'Item updated successfully',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      const { id } = req.params;
      const deleted = await this.model.deleteNode(id);

      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: `No item found with id ${id}`
        });
      }

      res.status(200).json({
        success: true,
        message: 'Item deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  async createRelationship(req, res, next) {
    try {
      const { fromId, toId, type } = req.params;
      const properties = req.body.properties || req.body;

      const result = await this.model.createRelationship(fromId, toId, type, properties);

      if (!result) {
        return res.status(404).json({
          success: false,
          message: 'Could not create relationship. Check if nodes exist.'
        });
      }

      res.status(201).json({
        success: true,
        message: 'Relationship created successfully',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  async updateRelationship(req, res, next) {
    try {
      const { id } = req.params;
      const properties = req.body.properties || req.body;

      const result = await this.model.updateRelationship(id, properties);

      if (!result) {
        return res.status(404).json({
          success: false,
          message: `No relationship found with id ${id}`
        });
      }

      res.status(200).json({
        success: true,
        message: 'Relationship updated successfully',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteRelationship(req, res, next) {
    try {
      const { id } = req.params;
      const deleted = await this.model.deleteRelationship(id);

      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: `No relationship found with id ${id}`
        });
      }

      res.status(200).json({
        success: true,
        message: 'Relationship deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  async addProperties(req, res, next) {
    try {
      const { id } = req.params;
      const properties = req.body.properties || req.body;

      if (!properties || Object.keys(properties).length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Please provide properties to add'
        });
      }

      const result = await this.model.addPropertiesToNode(id, properties);

      if (!result) {
        return res.status(404).json({
          success: false,
          message: `No item found with id ${id}`
        });
      }

      res.status(200).json({
        success: true,
        message: 'Properties added successfully',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  async removeProperties(req, res, next) {
    try {
      const { id } = req.params;
      const { properties } = req.body;

      if (!Array.isArray(properties) || properties.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Please provide an array of property keys to remove'
        });
      }

      const result = await this.model.removePropertiesFromNode(id, properties);

      if (!result) {
        return res.status(404).json({
          success: false,
          message: `No item found with id ${id}`
        });
      }

      res.status(200).json({
        success: true,
        message: 'Properties removed successfully',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  async batchUpdate(req, res, next) {
    try {
      const { ids } = req.body;
      const properties = req.body.properties || {};

      if (!Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Please provide an array of node IDs'
        });
      }

      if (Object.keys(properties).length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Please provide properties to update'
        });
      }

      const updatedCount = await this.model.batchUpdateNodes(ids, properties);

      res.status(200).json({
        success: true,
        message: `${updatedCount} items updated successfully`
      });
    } catch (error) {
      next(error);
    }
  }

  async batchDelete(req, res, next) {
    try {
      const { ids } = req.body;

      if (!Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Please provide an array of node IDs'
        });
      }

      const deletedCount = await this.model.batchDeleteNodes(ids);

      res.status(200).json({
        success: true,
        message: `${deletedCount} items deleted successfully`
      });
    } catch (error) {
      next(error);
    }
  }

  async executeQuery(req, res, next) {
    try {
      const { query, params } = req.body;

      if (!query) {
        return res.status(400).json({
          success: false,
          message: 'Please provide a Cypher query'
        });
      }

      const results = await this.model.executeQuery(query, params || {});

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

export default BaseController;