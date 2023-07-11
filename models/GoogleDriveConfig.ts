import { Schema, model, models } from 'mongoose';

const googleDriveConfigSchema = new Schema({
  accountEmail: String,
  studiesDriveName: String,
  studiesDriveId: String,
  studiesPath: String,
});

const GoogleDriveConfig = models?.GoogleDriveConfig || model('GoogleDriveConfig', googleDriveConfigSchema);

export default GoogleDriveConfig;