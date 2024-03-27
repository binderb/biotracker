"use client";
import Modal from "@/app/(global components)/Modal";
import {
  Address,
  Contact,
  ProjectWithAllDetails,
} from "@/db/schema_clientModule";
import {
  FaFileSignature,
  FaFlagCheckered,
  FaSearch,
  FaSpinner,
  FaTrashAlt,
} from "react-icons/fa";
import SubmitButton from "@/app/(global components)/SubmitButton";
import { useState, useEffect, useRef } from "react";
import { FaCircleArrowRight, FaPenToSquare } from "react-icons/fa6";
import { SalesLeadWithAllDetails } from "@/db/schema_salesleadsModule";
import { sleep } from "@/debug/Sleep";
import { check } from "drizzle-orm/mysql-core";

type Props = {
  mode: "new" | "repeat";
  leadDetails: SalesLeadWithAllDetails;
  checkPublishEligibleFunction: () => boolean;
  handlePublishFunction: () => Promise<void>;
};

export default function PublishModal({
  mode,
  leadDetails,
  handlePublishFunction,
  checkPublishEligibleFunction,
}: Props) {
  const [status, setStatus] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [publishInProgress, setPublishInProgress] = useState(false);

  function handlePublish(formData: FormData) {
    setPublishInProgress(true);
    handleAsyncPublish(formData);
  }

  async function handleAsyncPublish(formData: FormData) {
    try {
      await sleep(1000);
      // if (formData.get('link') === null) throw new Error('No quote link provided.');
      // const newQuote = {
      //   id: -1,
      //   index: -1,
      //   link: formData.get('link') as string,
      //   saleslead: salesleadId,
      //   client: clientId,
      //   project: projectId,
      // };
      // // add quote to leadDetails
      // const newLeadDetails = { ...leadDetails, quote: newQuote };
      // setLeadDetails(newLeadDetails);
      await handlePublishFunction();
      setPublishInProgress(false);
      // setShowModal(false);
    } catch (err: any) {
      setStatus(err.message);
      setPublishInProgress(false);
    }
  }

  async function handleUpdateQuote(formData: FormData) {
    try {
      // if (!quoteId) throw new Error('No quote ID provided.');
      // if (!formData.get('link')) throw new Error('No quote link provided.');
      // if (!formData.get('index')) throw new Error('No quote index provided.');
      // const updatedQuote = {
      //   id: quoteId,
      //   index: parseInt(formData.get('index') as string),
      //   link: formData.get('link') as string,
      //   saleslead: salesleadId,
      //   client: clientId,
      //   project: projectId,
      // };
      // const newLeadDetails = { ...leadDetails, quote: updatedQuote };
      // setLeadDetails(newLeadDetails);
      // setShowModal(false);
    } catch (err: any) {
      setStatus(err.message);
    }
  }

  return (
    <>
      {mode === "new" && (
        <button
          className="std-button-lite"
          onClick={(e) => {
            e.preventDefault();
            const check = checkPublishEligibleFunction();
            if (check) setShowModal(true);
          }}>
          <FaFlagCheckered />
          Publish
        </button>
      )}
      {mode === "repeat" && (
        <button
          className="std-button-lite"
          onClick={(e) => {
            e.preventDefault();
            const check = checkPublishEligibleFunction();
            if (check) setShowModal(true);
          }}>
          <FaCircleArrowRight />
          Publish Again
        </button>
      )}
      <Modal showModal={showModal} className="w-[90vw] md:w-[60%]">
        {mode === "new" && (
          <>
            <h5>Publish Sales Lead</h5>
            <form className="flex flex-col gap-2" action={handlePublish}>
              <section className="pb-2">
                {`This action will lock in the study plans you've chosen, generate new study IDs for each, and create a directory for each study on the shared drive. You can still update the study plans here, but you will not be able to add/remove study plans or change the study IDs.`}
              </section>
              <div className="font-bold">Study Plan Summary:</div>
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr>
                    <th className="w-[20%]"></th>
                    <th className="w-[80%]"></th>
                  </tr>
                </thead>
                <tbody>
                  {leadDetails.revisions[0].studyplans.map(
                    (studyplan, index) => (
                      <tr key={index}>
                        <td className="bg-white/50 border border-secondary/80 p-1 font-bold">
                          <div>{`Study Plan ${index + 1}`}</div>
                        </td>
                        <td className="bg-white/50 border border-secondary/80 p-1">
                          <div>{studyplan.formrevision.form.name}</div>
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
              <div className="flex items-center gap-2 pt-4">
                <button
                  className="secondary-button-lite"
                  disabled={publishInProgress}
                  onClick={(e) => {
                    e.preventDefault();
                    setShowModal(false);
                    setStatus("");
                  }}>
                  Cancel
                </button>
                {!publishInProgress && (
                  <SubmitButton text="Publish" pendingText="Publishing..." />
                )}
                {publishInProgress && (
                  <button className="std-button-lite" disabled>
                    <FaSpinner className="animate-spin" />
                    Publishing...
                  </button>
                )}
              </div>
              <div className="text-[#800]">{status}</div>
            </form>
          </>
        )}
        {mode === "repeat" && (
          <>
            <h5>Quote Details</h5>
            <form className="flex flex-col gap-4" action={handleUpdateQuote}>
              {/* Hidden field for id */}
              {/* <input type='hidden' className='std-input w-full' name='id' value={quoteId ?? ''} /> */}
              {/* Hidden field for index */}
              {/* <input type='hidden' className='std-input w-full' name='index' value={quoteIndex ?? ''} /> */}
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr>
                    <th className="w-[20%]"></th>
                    <th className="w-[80%]"></th>
                  </tr>
                </thead>
                <tbody>
                  {/* Link */}
                  <tr>
                    <td className="bg-white/50 border border-secondary/80 p-1 font-bold">
                      <div>Link</div>
                      <div className="font-normal italic text-[12px]">
                        (Required)
                      </div>
                    </td>
                    <td className="bg-white/50 border border-secondary/80 p-1">
                      {/* <input className='std-input w-full' name='link' defaultValue={quoteLink || ''} /> */}
                    </td>
                  </tr>
                </tbody>
              </table>

              <div className="flex items-center gap-2">
                <button
                  className="secondary-button-lite"
                  onClick={(e) => {
                    e.preventDefault();
                    setShowModal(false);
                    setStatus("");
                  }}>
                  Cancel
                </button>
                <button className="std-button-lite">Update Quote</button>
              </div>
              <div className="text-[#800]">{status}</div>
            </form>
          </>
        )}
      </Modal>
    </>
  );
}
