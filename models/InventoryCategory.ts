import { Schema, model, models } from 'mongoose';

const inventoryCategorySchema = new Schema({
  name: {
    type: String!,
    unique: true
  }
});

const InventoryCategory = models?.InventoryCategory || model('InventoryCategory', inventoryCategorySchema);

export default InventoryCategory;