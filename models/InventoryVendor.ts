import { Schema, model, models } from 'mongoose';

const inventoryVendorSchema = new Schema({
  name: String!,
});

const InventoryVendor = models?.InventoryVendor || model('InventoryVendor', inventoryVendorSchema);

export default InventoryVendor;