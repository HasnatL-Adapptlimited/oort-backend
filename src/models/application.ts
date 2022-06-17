import { AccessibleRecordModel, accessibleRecordsPlugin } from '@casl/mongoose';
import mongoose, { Schema, Document } from 'mongoose';
import { status } from '../const/enumTypes';
import { addOnBeforeDelete } from '../utils/models/deletion';
import { Page } from './page';
import { Role } from './role';
import { Channel } from './channel';

/** Application documents interface declaration */
export interface Application extends Document {
  kind: 'Application';
  name?: string;
  createdAt: Date;
  modifiedAt: Date;
  status?: any;
  createdBy?: string;
  pages?: any[];
  settings?: any;
  lockedBy?: string;
  permissions?: {
    canSee?: any[];
    canUpdate?: any[];
    canDelete?: any[];
  };
  subscriptions?: {
    routingKey?: string;
    title: string;
    convertTo?: string;
    channel?: string;
  }[];
}

/** Mongoose application schema declaration */
const applicationSchema = new Schema<Application>({
  name: String,
  createdAt: Date,
  modifiedAt: Date,
  lockedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  status: {
    type: String,
    enum: Object.values(status),
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  pages: {
    // id of pages linked to this application
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'Page',
  },
  settings: mongoose.Schema.Types.Mixed,
  description: String,
  permissions: {
    canSee: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Role',
      },
    ],
    canUpdate: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Role',
      },
    ],
    canDelete: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Role',
      },
    ],
  },
  subscriptions: [
    {
      routingKey: String,
      title: String,
      convertTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Form',
      },
      channel: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Channel',
      },
    },
  ],
});

// add a function to delete dependant objects on applciation deletion
addOnBeforeDelete(applicationSchema, async (application) => {
  console.log(`Deleting dependencies of application ${application.id}...`);
  // Delete pages and content
  await Page.deleteMany({ _id: application.pages });
  // Delete application's roles
  await Role.deleteMany({ application: application.id });
  // Delete application's channels and linked notifications
  await Channel.deleteMany({ application: application.id });
});

applicationSchema.index({ name: 1 }, { unique: true });
applicationSchema.plugin(accessibleRecordsPlugin);

/** Mongoose application model definition */
// eslint-disable-next-line @typescript-eslint/no-redeclare
export const Application = mongoose.model<
  Application,
  AccessibleRecordModel<Application>
>('Application', applicationSchema);
