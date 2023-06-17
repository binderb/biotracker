import { Schema, model, models } from 'mongoose';

const inventoryItemLogSchema = new Schema({
  createdAt: Date!,
  author: { type: Schema.Types.ObjectId, ref: 'User' }!,
  body: String!
});

const InventoryItemLog = models?.InventoryItemLog || model('InventoryItemLog', inventoryItemLogSchema);

export default InventoryItemLog;