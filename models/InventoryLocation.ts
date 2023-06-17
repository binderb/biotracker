import { Schema, model, models } from 'mongoose';

const inventoryLocationSchema = new Schema({
  name: String!,
  description: String,
  type: {
    type: String!,
    enum: ['cold', 'rt', 'box'],
    default: 'rt'
  },
  children: [{ type: Schema.Types.ObjectId, ref: 'InventoryLocation' }]
});

const InventoryLocation = models?.InventoryLocation || model('InventoryLocation', inventoryLocationSchema);

export default InventoryLocation;