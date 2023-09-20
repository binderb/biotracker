import Client from "../models/Client";
import Lead from "../models/Lead";
import LeadRevision from "../models/LeadRevision";
import LeadNote from "../models/LeadNote";
import LeadChange from "../models/LeadChange";
import Study from "../models/Study";
import connectMongo from "./connectMongo";
import User from "../models/User";
import { convertToPdf, createDirectoryIfNotExists, createDirectoryWithSubdirectories, deleteFileAtPath, getDriveIdFromName, getFolderIdFromPath, getGoogleDriveAuthUrl, listFiles, saveNewGoogleDriveToken, userAuthorizeGoogleDrive } from "./googleDrive";
import { now } from "lodash";
import FormTemplateField from "../models/FormTemplateField";
import FormTemplateRow from "../models/FormTemplateRow";
import FormTemplateSection from "../models/FormTemplateSection";
import FormTemplateRevision from "../models/FormTemplateRevision";
import FormTemplate from "../models/FormTemplate";
import { buildFormFooter, buildFormGeneralInfo, buildFormHeader, buildFormSection, createAndSetupDocument } from "./googleDocs";
import GoogleDriveConfig from "../models/GoogleDriveConfig";
import path from "path";
import { Types } from 'mongoose';
import Contact from "../models/Contact";
import ClientProject from "../models/ClientProject";
import MailingAddress from "../models/MailingAddress";
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
    getContacts: async () => {
      await connectMongo();
      return Contact.find().sort('last');
    },
    getClientCodes: async () => {
      await connectMongo();
      return Client.find().sort('code');
    },
    getClient: async (_:any, args:any) => {
      try {
        const {clientId} = args;
        await connectMongo();
        const clientProjects = await ClientProject.findOne({}); // seems to be necessary for now
        return Client.findById(clientId)
          .populate({
            path: 'projects',
            model: 'ClientProject',
            populate: {
              path: 'contacts',
              model: 'Contact'
            }
          });
      } catch (err:any) {
        throw err;
      }
      
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
      console.log("client", client);
      if (!client) throw new Error("No matching client found!");
      const clientStudies = await Study.find({client: client._id});
      let nextStudy = 0;
      if (clientStudies) {
        const studyIndices = clientStudies.map((e:any) => e.index);
        for (let i=0;i<studyIndices.length;i++) if (studyIndices[i] > nextStudy) nextStudy = studyIndices[i];
        nextStudy++;
        return nextStudy;
      } else {
        return 1;
      }
    },
    getNextForm: async (_:any, args:any) => {
      const { category } = args;
      try {
        await connectMongo();
        const formsOfCategory:string[] = await FormTemplate.find({formCategory: category});
        return formsOfCategory.length + 1;
      } catch (err:any) {
        throw err;
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
        })
        .populate('studies');
    },
    getLeadLatestRevision: async (_:any, args:any) => {
      const { id } = args;
      await connectMongo();
      const lead = await Lead.findById(id,{'revisions': {$slice: -1} })
        .populate('client')
        .populate('revisions')
        .populate({
          path: 'author',
          model: 'User'
        })
        .populate('drafters')
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
            path: 'author revision',
            // model: 'User'
          }
        })
        .populate('studies');
      return lead;
    },
    getStudyPlanForms: async () => {
      await connectMongo();
      return FormTemplate.find({formCategory:'SP'});
    },
    getStudyPlanFormLatestRevision: async (_:any, args:any) => {
      const { id } = args;
      try {
        await connectMongo();
        const leadTemplate = await FormTemplate.findById(id,{'revisions': {$slice: -1} })
          .populate('revisions')
          .populate({
            path: 'revisions',
            model: 'FormTemplateRevision',
            populate: {
              path: 'sections',
              model: 'FormTemplateSection',
              populate: {
                path: 'rows',
                model: 'FormTemplateRow',
                populate: {
                  path: 'fields',
                  model: 'FormTemplateField'
                }
              }
            }
          });
        return leadTemplate;
      } catch (err:any) {
        throw err;
      }
    },
    getFormDetails: async (_:any, args:any) => {
      const { formId } = args;
      try {
        await connectMongo();
        const form = await FormTemplate.findById(formId)
        .populate('revisions');
        return form;
      } catch (err:any) {
        console.log(JSON.stringify(err));
        throw err;

      }
    },
    getFormDetailsFromRevisionId: async (_:any, args:any) => {
      const { revisionId } = args;
      try {
        await connectMongo();
        const formTemplate = await FormTemplate.findOne({
          'revisions': { $in: new Types.ObjectId(revisionId)}
        }).populate('revisions');
        return formTemplate;
      } catch (err:any) {
        throw err;
      }
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
    addContact: async (_:any, args:any) => {
      const { contactJSON } = args;
      try {
        const contactData = JSON.parse(contactJSON);
        await connectMongo();
        if (!contactData.first) {
          throw new Error("Contacts must at least have a first name!");
        }
        const newContact = await Contact.create({
          ...contactData
         });
        return newContact;
      } catch (err:any) {
        throw err;
      }
    },
    addMailingAddress: async (_:any, args:any) => {
      const { mailingAddressJSON } = args;
      try {
        const mailingAddressData = JSON.parse(mailingAddressJSON);
        await connectMongo();
        if (!mailingAddressData.identifier) {
          throw new Error("Addresses must at least have an identifying label for internal use!");
        }
        const newAddress = await MailingAddress.create({
          ...mailingAddressData
        });
        return newAddress;
      } catch (err:any) {
        throw err;
      }
    },
    updateMailingAddress: async (_:any, args:any) => {
      const { mailingAddressId, mailingAddressJSON } = args;
      try {
        const mailingAddressData = JSON.parse(mailingAddressJSON);
        await connectMongo();
        if (!mailingAddressData.identifier) {
          throw new Error("Addresses must at least have an identifying label for internal use!");
        }
        const updatedAddress = await MailingAddress.findOneAndUpdate(
          {_id: mailingAddressId},
          {...mailingAddressData},
          {new: true}
        );
        return updatedAddress;
      } catch (err:any) {
        throw err;
      }
    },
    addLead: async (_:any, args:any) => {
      const { name, author, drafters, client, content, firstNote } = args;
      console.log('starting to generate lead.');
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
    updateLeadDrafters: async (_:any, args:any) => {
      const { leadId, drafters } = args;
      try {
        await connectMongo();
        await Lead.findOneAndUpdate({_id: leadId}, {
          $set: {
            drafters: drafters
          }
        });
      } catch (err:any) {
        throw new Error(JSON.stringify(err));
      }
      return `success`;
    },
    updateLeadName: async (_:any, args:any) => {
      const { leadId, name } = args;
      try {
        await connectMongo();
        await Lead.findOneAndUpdate({_id: leadId}, {
          $set: {
            name: name
          }
        });
      } catch (err:any) {
        throw new Error(JSON.stringify(err));
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
        return newRevision;
      } catch (err:any) {
        throw new Error(err.message);
      }
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
    addForm: async (_:any, args:any) => {
      const { name, formCategory, metadata, sections } = args;
      const sectionData = JSON.parse(sections);
      console.log('metadata: ', metadata);
      try {
        await connectMongo();
        const formsOfCategory = await FormTemplate.find({formCategory: formCategory});
        const nextFormIndex = formsOfCategory.length + 1;
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
                  const newField = await FormTemplateField.create({
                    ...field
                  });
                  sectionFieldModels.push(newField);
                }
              }
              // Create rows
              const newSectionRow = await FormTemplateRow.create({
                ...row,
                fields: sectionFieldModels.map((field:any) => field._id)
              })
              sectionRowModels.push(newSectionRow);
            }
            // Create each section
            let newSection = await FormTemplateSection.create({
              ...section,
              rows: sectionRowModels.map((row:any) => row._id)
            });
            sectionModels.push(newSection);
          }
        }
        // Create template revision
        const revision = await FormTemplateRevision.create({
          createdAt: new Date(),
          note: 'Form created.',
          sections: sectionModels.map((section:any) => section._id)
        });
        // Create top-level template model
        const template = await FormTemplate.create({
          name: name,
          formCategory: formCategory,
          formIndex: nextFormIndex,
          metadata: metadata,
          revisions: revision._id
        })
      } catch (err:any) {
        return err.message;
      }
    },
    addFormRevision: async (_:any, args:any) => {
      const { formId, sections, note } = args;
      const sectionData = JSON.parse(sections);
      try {
        await connectMongo();
        const form = await FormTemplate.findById(formId);
        if (!form) throw new Error('No form with the given ID found.');
        const sectionModels = [];
        for (var section of sectionData) {
          console.log("starting section",section.name);
          let sectionRowModels = [];
          if (section.rows.length > 0) {
            for (var row of section.rows) {
              console.log("starting row", row.index);
              let sectionFieldModels = [];
              if (row.fields.length > 0) {
                for (var field of row.fields) {
                  console.log("starting field", field.type);
                  // Create fields
                  const newField = await FormTemplateField.create({
                    ...field,
                    _id: new Types.ObjectId(),
                  });
                  sectionFieldModels.push(newField);
                }
              }
              console.log('created field successfully.');
              // Create rows
              const newSectionRow = await FormTemplateRow.create({
                ...row,
                _id: new Types.ObjectId(),
                fields: sectionFieldModels.map((field:any) => field._id)
              })
              sectionRowModels.push(newSectionRow);
            }
            console.log('created row successfully.');
            // Create each section
            let newSection = await FormTemplateSection.create({
              ...section,
              _id: new Types.ObjectId(),
              rows: sectionRowModels.map((row:any) => row._id)
            });
            sectionModels.push(newSection);
          }
        }
        // Create template revision
        const revision = await FormTemplateRevision.create({
          createdAt: new Date(),
          note: note,
          sections: sectionModels.map((section:any) => section._id)
        });
        // Update Form
        const updatedForm = await FormTemplate.findOneAndUpdate(
          { _id: formId },
          { $push: {revisions: revision} }
        );
      } catch (err:any) {
        throw err;
      }
      return 'success';
    },
    updateFormDetails: async (_:any, args:any) => {
      const { formId, name, formCategory, metadata } = args;
      try {
        await connectMongo();
        console.log(formId);
        console.log(name);
        const form = await FormTemplate.findById(formId);
        if (!form) throw new Error('No form with the given ID found.');
        const updatedForm = await FormTemplate.findOneAndUpdate(
          { _id: formId },
          { 
            name: name ? name : form.name,
            formCategory: formCategory ? formCategory : form.formCategory,
            metadata: metadata ? metadata : form.metadata
          },
          { new: true }
        );
        console.log(updatedForm);
      } catch (err:any) {
        throw err;
      }
      return 'success';
    },
    addStudy: async (_:any, args:any) => {
      const { clientCode, studyType, leadId, studyPlanIndex } = args;
      await connectMongo();
      const client = await Client.findOne({code: clientCode});
      if (!client) throw new Error("No matching client found!");
      const clientStudies = await Study.find({client: client._id});
      let studyIndex = 0;
      if (clientStudies) {
        const studyIndices = clientStudies.map((e:any) => e.index);
        for (let i=0;i<studyIndices.length;i++) if (studyIndices[i] > studyIndex) studyIndex = studyIndices[i];
      }
      studyIndex++;
      const newStudy = await Study.create({
        client: client._id,
        type: studyType,
        index: studyIndex,
        leadId: new Types.ObjectId(leadId)
      });
      const associatedLead = await Lead.findOneAndUpdate({_id: leadId}, {
        $set: {published: true},
        $addToSet: {studies: newStudy._id}
      }, {new: true});
      // Update publish flag on associated revision, and add associated study ID
      // to the relevant content object.
      const associatedRevision = await LeadRevision.findOneAndUpdate({_id: associatedLead.revisions[associatedLead.revisions.length-1]}, {
        $set: {
          published: true
        }},
        {new: true}
      );
      
      const newContent = JSON.parse(associatedRevision.content);
      const newStudyPlanData = {...newContent[studyPlanIndex], associatedStudyId: newStudy._id};
      newContent[studyPlanIndex] = newStudyPlanData;
      await LeadRevision.findOneAndUpdate({_id: associatedLead.revisions[associatedLead.revisions.length-1]}, {
        $set: {
          content: JSON.stringify(newContent)
        }}
      );
      console.log(associatedRevision);
      return newStudy._id;
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
    publishLeadToDrive: async (_:any, args:any) => {
      try {
        const { clientCode, studyName, formRevisionId, formData, studyData } = args;
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
        const newStudyFolderIds = await createDirectoryWithSubdirectories(studyName, clientFolderId, ['Data','Forms','Protocol'], auth);
        console.log('new study folder id: ',newStudyFolderIds[3])
        const formFileId = await createAndSetupDocument(studyName, newStudyFolderIds[3], auth);
        console.log('form file id: ', formFileId)
        await buildFormHeader(formFileId, formRevisionId, formData, auth);
        await buildFormFooter(formFileId, auth);
        for (let i=0;i<studyContent.sections.length;i++) {
          await buildFormSection(formFileId, auth, studyContent.sections[i], i, studyName);
        }
        await convertToPdf(newStudyFolderIds[3], studyName, formFileId, auth);
        console.log('Completed actions successfully.');
      } catch (err:any) {
        throw err;
      }
      
      // const formResult = await createStudyForm(`${studyName}`, newStudyFolderId, client);
      // return 'Study folder tree created in Google Drive!';

    },
    updateLeadOnDrive: async (_:any, args: any) => {
      try {
        const { clientCode, studyName, formRevisionId, formData, studyData } = args;
        const studyContent = JSON.parse(studyData);
        const auth = await userAuthorizeGoogleDrive();
        // Get Google Drive config
        const driveConfig = await GoogleDriveConfig.findOne({});
        if (!driveConfig) {
          throw new Error("Google Drive is not connected to this app. Administrators can configure a Google Drive connection in App Settings.");
        }
        const protocolFolderId = await getFolderIdFromPath(driveConfig.studiesDriveId, `${driveConfig.studiesPath}/${clientCode}/${studyName}/Protocol`,auth);
        const formFileId = await createAndSetupDocument(studyName, protocolFolderId, auth);
        await buildFormHeader(formFileId, formRevisionId, formData, auth);
        await buildFormFooter(formFileId, auth);
        for (let i=0;i<studyContent.sections.length;i++) {
          await buildFormSection(formFileId, auth, studyContent.sections[i], i, studyName);
        }
        await deleteFileAtPath(protocolFolderId,studyName,'application/pdf',auth);
        await convertToPdf(protocolFolderId, studyName, formFileId, auth);
      } catch (err:any) {
        throw err;
      }
    },
    updateLeadRevisionPublishStatus: async (_:any, args:any) => {
      try {
        const { leadRevisionId } = args;
        await connectMongo();
        await LeadRevision.findOneAndUpdate({_id: new Types.ObjectId(leadRevisionId)}, {
          $set: {
            published: true
          }
        });
        
      } catch (err:any) {
        throw err;
      }
    },
    adminDeleteLead: async (_:any, args:any) => {
      try {
        const { leadId } = args;
        await connectMongo();
        const leadToDelete = await Lead.findById(leadId);
        if (!leadToDelete) throw new Error("No matching lead found!");
        await LeadRevision.deleteMany({_id: { $in: leadToDelete.revisions}})
        await LeadNote.deleteMany({_id: { $in: leadToDelete.notes}});
        await Study.deleteMany({_id: { $in: leadToDelete.studies}});
        await Lead.deleteOne({_id: leadId});
      } catch (err:any) {
        throw err;
      }
      return 'success';
    }

  }
}

export default resolvers;