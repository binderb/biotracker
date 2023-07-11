import Client from "../models/Client";
import Lead from "../models/Lead";
import LeadRevision from "../models/LeadRevision";
import LeadNote from "../models/LeadNote";
import LeadChange from "../models/LeadChange";
import Study from "../models/Study";
import connectMongo from "./connectMongo";
import User from "../models/User";
import { convertToPdf, createDirectoryIfNotExists, createDirectoryWithSubdirectories, getDriveIdFromName, getFolderIdFromPath, getGoogleDriveAuthUrl, listFiles, saveNewGoogleDriveToken, userAuthorizeGoogleDrive } from "./googleDrive";
import { now } from "lodash";
import LeadTemplate from "../models/LeadTemplate";
import LeadTemplateField from "../models/LeadTemplateField";
import LeadTemplateSection from "../models/LeadTemplateSection";
import LeadTemplateRevision from "../models/LeadTemplateRevision";
import { buildFormFooter, buildFormGeneralInfo, buildFormHeader, buildFormSection, createAndSetupDocument } from "./googleDocs";
import LeadTemplateSectionRow from "../models/LeadTemplateSectionRow";
import GoogleDriveConfig from "../models/GoogleDriveConfig";
import path from "path";
const fs = require('fs').promises;

const resolvers = {
  Query: {
    getUsers: async () => {
      await connectMongo();
      return User.find();
    },
    getClients: async () => {
      await connectMongo();
      return Client.find().sort('name');
    },
    getClientCodes: async () => {
      await connectMongo();
      return Client.find().sort('code');
    },
    getNewCode: async () => {
      await connectMongo();
      const clients = await Client.find();
      const clientCodes = clients.map(e => e.code);
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
      return newCode;
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
    getLeadTemplateLatestRevision: async (_:any, args:any) => {
      const { id } = args;
      await connectMongo();
      const leadTemplate = await LeadTemplate.findById(id,{'revisions': {$slice: -1} })
        .populate('revisions')
        .populate({
          path: 'revisions',
          model: 'LeadTemplateRevision',
          populate: {
            path: 'sections',
            model: 'LeadTemplateSection',
            populate: {
              path: 'rows',
              model: 'LeadTemplateSectionRow',
              populate: {
                path: 'fields',
                model: 'LeadTemplateField'
              }
            }
          }
        });
      return leadTemplate;
    },
    getGoogleDriveConfig: async () => {
      try {
        await connectMongo();
        const config = await GoogleDriveConfig.findOne({});
        return config;
      } catch (err:any) {
        throw err;
      }
    }
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
    updateUser: async (_:any, args:any) => {
      const { updateUserId, username, password, first, last, role } = args;
      const updateObj = {
        username: username,
        password: password,
        first: first,
        last: last,
        role: role
      }
      // remove empty fields
      let filteredObj = Object.fromEntries(Object.entries(updateObj).filter(([_, v]) => (v != null && v != '')));
      try {
        await connectMongo();
        // Make sure someone else doesn't already have the username in the update
        const existingUser = await User.findOne({username: username});
        if (existingUser && existingUser._id.toString() !== updateUserId) {
          throw new Error('A different user already has this username. Please choose a different one!');
        }

        await User.findByIdAndUpdate(updateUserId,filteredObj,{
          runValidators: true,
          new: true
        });
      } catch (err:any) {
        throw new Error (err.message);
      }
    },
    removeUser: async (_:any, args:any) => {
      const { removeUserId } = args;
      const idString = removeUserId.toString();
      // remove empty fields
      try {
        await connectMongo();
        // Need to check if this user is referenced by other documents.
        const leads = await Lead.find({$where: "JSON.stringify(this).includes('"+idString+"')"
        });
        if (leads.length > 0) {
          throw new Error (`REFERENCED`);
        }
        await User.findByIdAndDelete(removeUserId);
      } catch (err:any) {
        throw new Error (err.message);
      }
    },
    addClient: async (_:any, args:any) => {
      const { name, code:rawCode } = args;
      const code = rawCode.toUpperCase();
      await connectMongo();
      const clients = await Client.find();
      const clientNames = clients.map(e => e.name);
      const clientCodes = clients.map(e => e.code);
      if (!name || !code) {
        throw new Error("All fields must have a value!");
      }
      if (clientNames.includes(name)) {
        throw new Error("Client already exists! Please choose a different name.");
      }
      if (clientCodes.includes(code)) {
        throw new Error("Provided code is already in use! Please pick or generate a different one.");
      }
      const codeSymbols = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      let correctCodeFormat = true;
      if (code.length !== 3) correctCodeFormat = false;
      for (let c of code) if (!codeSymbols.includes(c)) correctCodeFormat = false;
      if (!correctCodeFormat) {
        throw new Error("Incorrect code format!");
      }
      const newClient = await Client.create({
        name: name,
        code: code
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
        await connectMongo();
        const sectionModels = [];
        for (var section of sectionData) {
          console.log("starting section ",section.name);
          let sectionRowModels = [];
          if (section.rows.length > 0) {
            for (var row of section.rows) {
              console.log("starting row ", row.index);
              let sectionFieldModels = [];
              if (row.fields.length > 0) {
                for (var field of row.fields) {
                  console.log("starting row ", row.index);
                  // Create fields
                  const newField = await LeadTemplateField.create({
                    ...field
                  });
                  sectionFieldModels.push(newField);
                }
              }
              // Create rows
              const newSectionRow = await LeadTemplateSectionRow.create({
                ...row,
                fields: sectionFieldModels.map((field:any) => field._id)
              })
              sectionRowModels.push(newSectionRow);
            }
            // Create each section
            let newSection = await LeadTemplateSection.create({
              ...section,
              rows: sectionRowModels.map((row:any) => row._id)
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
      const authUrl = await getGoogleDriveAuthUrl();
      console.log(authUrl);
      return authUrl;
    },
    saveGoogleDriveToken: async (_:any, args:any) => {
      const { authCode } = args;
      try {
        const accountEmail = await saveNewGoogleDriveToken(authCode);
        await connectMongo();
        await GoogleDriveConfig.deleteMany({});
        await GoogleDriveConfig.create({
          accountEmail: accountEmail
        });
        return "success";
      } catch (err:any) {
        throw err;
      }
    },
    testGoogleDrive: async (_:any, args:any) => {
      const { drive, path } = args;
      const client = await userAuthorizeGoogleDrive();
      const files = await listFiles(drive,path,client);
      return files;
    },
    saveGoogleDriveConfig: async (_:any, args:any) => {
      try {
        if (args.studiesDriveName) {
          const auth = await userAuthorizeGoogleDrive();
          const driveId = await getDriveIdFromName(args.studiesDriveName, auth);
          args.studiesDriveId = driveId;
        }
        await connectMongo();
        const existingConfig = await GoogleDriveConfig.find({});
        if (existingConfig.length > 1) {
          for (let i=1; i<existingConfig.length; i++) {
            await GoogleDriveConfig.findByIdAndDelete(existingConfig[i]._id);
          }
        }
        if (existingConfig.length > 0) {
          await GoogleDriveConfig.findByIdAndUpdate(existingConfig[0]._id, args);
        } else {
          await GoogleDriveConfig.create(args);
        }
      } catch (err:any) {
        throw err;
      }
    },
    deleteGoogleDriveConfig: async (_:any, args:any) => {
      try {
        await connectMongo();
        await GoogleDriveConfig.deleteMany({});
        const tokenPath = path.join(process.cwd(),process.env.GOOGLE_TOKEN_PATH!);
        const tokenFileExists = await fs.readFile(tokenPath);
        if (tokenFileExists) {
          await fs.unlink(tokenPath);
        }
      } catch (err:any) {
        throw err;
      }
    },
    // createDriveStudyTree: async (_:any, args:any) => {
    //   // ONLY FOR STUDY CREATOR (DEPRECATED)
    //   const { clientCode, studyName } = args;
    //   const auth = await userAuthorizeGoogleDrive();
    //   const studyFolderId = await getFolderIdFromPath(`/Studies`, auth);
    //   console.log('client code: ',clientCode);
    //   console.log('study name: ',studyName);
    //   const clientFolderId = await createDirectoryIfNotExists(clientCode, studyFolderId, auth);
    //   // const newStudyFolderId = await createDirectoryWithSubdirectories(studyName, clientFolderId, ['Data','Forms','Protocol','Quote'], client);
    //   // const formResult = await createStudyForm(`${studyName}`, newStudyFolderId, client);
    //   // return 'Study folder tree created in Google Drive!';
    //   const formFileId = await createAndSetupDocument(studyName, clientFolderId, auth);
    //   await buildFormHeader(formFileId, auth);
      
    //   console.log('Completed actions successfully.');
    // },
    createDriveStudy: async (_:any, args:any) => {
      try {
        const { clientCode, studyName, studyData } = args;
        const studyContent = JSON.parse(studyData);
        const auth = await userAuthorizeGoogleDrive();
        await connectMongo();
        // Get Google Drive config
        const driveConfig = await GoogleDriveConfig.findOne({});
        if (!driveConfig) {
          throw new Error("Google Drive is not connected to this app. Administrators can configure a Google Drive connection in App Settings.");
        }
        const studyFolderId = await getFolderIdFromPath(driveConfig.studiesDriveId, driveConfig.studiesPath, auth);
        console.log('study folder id: ', studyFolderId);
        const clientFolderId = await createDirectoryIfNotExists(clientCode, studyFolderId, auth);
        console.log('client folder id: ', clientFolderId);
        const newStudyFolderId = await createDirectoryWithSubdirectories(studyName, clientFolderId, ['Data','Forms','Protocol','Quote'], auth);
        console.log('new study folder id: ',newStudyFolderId)
        const formFileId = await createAndSetupDocument(studyName, newStudyFolderId, auth);
        console.log('form file id: ', formFileId)
        await buildFormHeader(formFileId, auth);
        await buildFormFooter(formFileId, auth);
        await buildFormGeneralInfo(formFileId, auth, studyName, studyContent);
        for (let section of studyContent.sections) {
          await buildFormSection(formFileId, auth, section);
        }
        await convertToPdf(newStudyFolderId, studyName, formFileId, auth);
        console.log('Completed actions successfully.');
      } catch (err:any) {
        throw err;
      }
      
      // const formResult = await createStudyForm(`${studyName}`, newStudyFolderId, client);
      // return 'Study folder tree created in Google Drive!';

    }
  }
}

export default resolvers;