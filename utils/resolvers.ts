import Client from "../models/Client";
import Lead from "../models/Lead";
import LeadRevision from "../models/LeadRevision";
import LeadNote from "../models/LeadNote";
import LeadChange from "../models/LeadChange";
import Study from "../models/Study";
import connectMongo from "./connectMongo";
import User from "../models/User";
import { adminAuthorizeGoogleDrive, createDirectoryIfNotExists, createDirectoryWithSubdirectories, getFolderIdFromPath, listFiles, userAuthorizeGoogleDrive } from "./googleDrive";
import { now } from "lodash";
import LeadTemplate from "../models/LeadTemplate";
import LeadTemplateField from "../models/LeadTemplateField";
import LeadTemplateSection from "../models/LeadTemplateSection";
import LeadTemplateRevision from "../models/LeadTemplateRevision";
const fs = require('fs');

const resolvers = {
  Query: {
    getUsers: async () => {
      await connectMongo();
      return User.find();
    },
    getClients: async () => {
      await connectMongo();
      return Client.find();
    },
    getClientCodes: async () => {
      await connectMongo();
      return Client.find();
    },
    getNextStudy: async (_:any, args:any) => {
      const { clientCode } = args;
      await connectMongo();
      const client = await Client.findOne({code: clientCode});
      if (!client) {
        throw new Error(`Client code doesn't exist!`);
      }
      if (client.studies) {
        const studies = client.studies.map((e:any) => e.index);
        if (studies.length === 0) {
          return 1;
        } else {
          return studies.length + 1;
        }
      } else {
        return 1;
      }
    },
    getLeads: async () => {
      await connectMongo();
      return Lead.find()
        .populate('author')
        .populate('client')
        .populate('drafters')
        .populate('revisions')
        .populate({
          path: 'notes',
          model: 'LeadNote',
          populate: {
            path: 'author',
            model: 'User'
          }
        });
    },
    getLeadLatestRevision: async (_:any, args:any) => {
      const { id } = args;
      await connectMongo();
      const lead = await Lead.findById(id,{'revisions': {$slice: -1} })
        .populate('client')
        .populate('revisions')
        .populate({
          path: 'revisions',
          model: 'LeadRevision',
          populate: {
            path: 'author',
            model: 'User'
          }
        })
        .populate('notes')
        .populate({
          path: 'notes',
          options: {
            sort: {
              'createdAt': -1
            }
          },
          model: 'LeadNote',
          populate: {
            path: 'author',
            model: 'User'
          }
        });
      return lead;
    },
    getLeadTemplates: async () => {
      await connectMongo();
      return LeadTemplate.find();
    },
  },

  Mutation: {
    addUser: async (_:any, args:any) => {
      const { username, password, first, last, role } = args;
      try {
        await connectMongo();
        await User.create({
          username: username,
          password: password,
          first: first,
          last: last,
          role: role
        });
      } catch (err:any) {
        throw new Error (err.message);
      }
    },
    addClient: async (_:any, args:any) => {
      const { name } = args;
      await connectMongo();
      const clients = await Client.find();
      const clientNames = clients.map(e => e.name);
      const clientCodes = clients.map(e => e.code);
      if (clientNames.includes(name)) {
        throw new Error("Client already exists! Please choose a different name.");
      }
      // generate a new client code
      const codeSymbols = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      let newCode = null;
      while (!newCode) {
        const potentialCode:Array<string> = [];
        for (let i=0;i<3;i++) {
          const randomIndex = Math.floor(Math.random()*codeSymbols.length);
          potentialCode.push(codeSymbols[randomIndex]);
        }
        if (!clientCodes.includes(potentialCode.join(''))) newCode = potentialCode.join('');
      }
      const newClient = await Client.create({
        name: name,
        code: newCode
      });
      return newClient;
    },
    addLead: async (_:any, args:any) => {
      const { name, author, drafters, client, content, firstNote } = args;
      await connectMongo();
      try {
        // Create Lead Revision
        const newRevision = await LeadRevision.create({
          author,
          content,
          createdAt: new Date()
        });
        // Create Lead Note
        const newNote = await LeadNote.create({
          author,
          content: firstNote,
          revision: newRevision._id,
          newRevision: true,
          createdAt: new Date()
        });
        // Create Lead
        const newLead = await Lead.create({
          name,
          author,
          drafters,
          client,
          revisions: [newRevision._id],
          notes: [newNote._id]
        });
      } catch (err:any) {
        throw new Error(err.message);
      }
      return `success`;

    },
    addLeadRevision: async (_:any, args:any) => {
      const { id, author, status, content, note } = args;
      try {
        await connectMongo();
        // Create Lead Revision
        const newRevision = await LeadRevision.create({
          author,
          content,
          createdAt: new Date()
        });
        // Create Lead Note
        const newNote = await LeadNote.create({
          author,
          content: note,
          revision: newRevision._id,
          newRevision: true,
          createdAt: new Date()
        });
        // Update Lead
        const updatedLead = await Lead.findOneAndUpdate(
          { _id: id},
          { $push: 
            {
              revisions: newRevision,
              notes: newNote,
            },
            status: status
          }
        );
      } catch (err:any) {
        throw new Error(err.message);
      }
      return `success`;
    },
    addLeadNote: async(_:any, args:any) => {
      const { id, revisionId, author, note } = args;
      try {
        await connectMongo();
        // Create note
        const newNote = await LeadNote.create({
          author,
          content: note,
          revision: revisionId,
          newRevision: false,
          createdAt: new Date()
        });
        // Update Lead
        const updatedLead = await Lead.findOneAndUpdate(
          { _id: id},
          { $push: 
            {
              notes: newNote,
            }
          }
        );
      } catch (err:any) {
        throw new Error(err.message);
      }
      return `success`;
    },
    addLeadTemplate: async (_:any, args:any) => {
      const { name, sections } = args;
      const sectionData = JSON.parse(sections);
      try {
        const sectionModels = [];
        for (var section of sectionData) {
          let sectionFieldModels = [];
          if (section.fields.length > 0) {
            // Create fields for each section
            sectionFieldModels = await LeadTemplateField.create(section.fields);
            // Create each section
            let newSection = await LeadTemplateSection.create({
              ...section,
              fields: sectionFieldModels.map((field:any) => field._id)
            });
            sectionModels.push(newSection);
          }
        }
        // Create template revision
        const revision = await LeadTemplateRevision.create({
          createdAt: new Date(),
          sections: sectionModels.map((section:any) => section._id)
        });
        // Create top-level template model
        const template = await LeadTemplate.create({
          name: name,
          active: true,
          revisions: revision._id
        })
      } catch (err:any) {
        return err.message;
      }

      // Create template revision

      // Create top-level template model

      // "[{\"name\":\"Test section\",\"fields\":[{\"name\":\"Apple\",\"index\":0,\"type\":\"textarea\",\"data\":\"\",\"extensible\":false},{\"name\":\"Orange\",\"index\":1,\"type\":\"textarea\",\"data\":\"\",\"extensible\":false}],\"extensible\":true,\"extensibleGroupName\":\"\"}]"

    },
    addStudy: async (_:any, args:any) => {
      const { clientCode, studyIndex, studyType } = args;
      await connectMongo();
      const client = await Client.findOne({code: clientCode});
      if (!client) {
        throw new Error("Client code not found!");
      }
      const newStudy = await Study.create({
        type: studyType,
        index: studyIndex
      });
      await Client.findOneAndUpdate({code: clientCode},{$addToSet: {studies: newStudy._id}});
      return client;
    },
    authorizeGoogleDrive: async () => {
      await adminAuthorizeGoogleDrive();
      return 'success';
    },
    testGoogleDrive: async () => {
      const client = await userAuthorizeGoogleDrive();
      const files = await listFiles(client);
      return files;
    },
    createDriveStudyTree: async (_:any, args:any) => {
      const { clientCode, studyName } = args;
      const client = await userAuthorizeGoogleDrive();
      const studyFolderId = await getFolderIdFromPath(`/Studies`, client);
      console.log('client code: ',clientCode);
      console.log('study name: ',studyName);
      const clientFolderId = await createDirectoryIfNotExists(clientCode, studyFolderId, client);
      const result = await createDirectoryWithSubdirectories(studyName, clientFolderId, ['Data','Forms','Protocol','Quote'], client);
      return 'Study folder tree created in Google Drive!';
    }
  }
}

export default resolvers;