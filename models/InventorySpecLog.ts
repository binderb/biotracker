import { Schema, model, models } from 'mongoose';

const inventorySpecLogSchema = new Schema({
  createdAt: Date!,
  spec: { type: Schema.Types.ObjectId, ref: 'InventorySpec' }!,
  author: { type: Schema.Types.ObjectId, ref: 'User' }!,
  body: String!
});

const InventorySpecLog = models?.InventorySpecLog || model('InventorySpecLog', inventorySpecLogSchema);

export default InventorySpecLog;