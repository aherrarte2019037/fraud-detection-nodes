import ExampleModel from '../models/exampleModel.js';

const exampleController = {
  async getAll(req, res, next) {
    try {
      const label = 'Example';
      const results = await ExampleModel.findNodes(label);
      
      res.status(200).json({
        success: true,
        count: results.length,
        data: results
      });
    } catch (error) {
      next(error);
    }
  },

  async getById(req, res, next) {
    try {
      const { id } = req.params;
      
      const query = `
        MATCH (n) 
        WHERE id(n) = $id 
        RETURN n
      `;
      
      const result = await ExampleModel.executeQuery(query, { id: parseInt(id) });
      
      if (!result.length) {
        return res.status(404).json({
          success: false,
          message: `No item found with id ${id}`
        });
      }
      
      res.status(200).json({
        success: true,
        data: result[0]
      });
    } catch (error) {
      next(error);
    }
  },

  async create(req, res, next) {
    try {
      const label = 'Example';
      const properties = req.body;
      
      if (!properties || Object.keys(properties).length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Please provide data to create an item'
        });
      }
      
      const result = await ExampleModel.createNode(label, properties);
      
      res.status(201).json({
        success: true,
        message: 'Item created successfully',
        data: result
      });
    } catch (error) {
      next(error);
    }
  },

  async executeQuery(req, res, next) {
    try {
      const { query, params } = req.body;
      
      if (!query) {
        return res.status(400).json({
          success: false,
          message: 'Please provide a Cypher query'
        });
      }
      
      const results = await ExampleModel.executeQuery(query, params || {});
      
      res.status(200).json({
        success: true,
        count: results.length,
        data: results
      });
    } catch (error) {
      next(error);
    }
  }
};

export default exampleController; 