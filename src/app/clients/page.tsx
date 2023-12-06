import Link from "next/link";
import Nav from "../(global components)/Nav";

export default async function Clients () {

  return (
    <>
    <Nav />
    <div className='mt-4'>
      <Link className='std-link ml-4' href='/'>&larr; Back</Link>
    </div>
    <main className="grid grid-cols-12 items-top p-4 gap-2">
      <div id="client-table" className='flex flex-col col-span-8 bg-secondary/20 border border-secondary/80 p-4 rounded-xl flex-grow'>
          <h5>Client Table</h5>
          {clientList.length > 0  &&
            <table className='w-full text-left border-collapse'>
              <thead>
                <tr>
                  <th className='w-[80%]'>Client</th>
                  <th className='w-[10%]'>Code</th>
                  <th className='w-[10%]'>Details</th>
                </tr>
              </thead>
              <tbody>
              {clientList.map((client:Client) => 
                <tr key={client._id}>
                  <td className='bg-white/50 border border-secondary/80 p-1'>{client.name}</td>
                  <td className='bg-white/50 border border-secondary/80 p-1'>{client.code}</td>
                  <td className='bg-white/50 border border-secondary/80 p-2 text-center'>
                    <Link href={{pathname: '/clients/[id]', query: { id: client._id }}} as={`/clients/${client._id}`} className='std-button-lite' ><FontAwesomeIcon icon={faEdit}/></Link>

                  </td>
                </tr>
              )}
              </tbody>
            </table>
          }
          {clientList.length === 0 &&
            <>
            <div className='mb-2 font-bold'>No clients matched your search.</div>
            <div>To add this client to the database, provide a unique 3-letter code and click <b>Add Client</b>.</div>
            </>
          }
        </div>
        <div id="client-creator" className='flex flex-col col-span-4 gap-2 bg-secondary/20 border border-secondary/80 p-4 rounded-xl'>
          <h5>{(session.user.role === 'admin' || session.user.role === 'dev') ? (
              <>Search or Add Clients</>
            ):(
              <>Search Clients</>
            )}
          </h5>
          <div className='flex gap-2 items-center'>
            <div className='mr-2'>Client Name:</div>
            <input className='std-input flex-1' value={clientName} onChange={handleNameChange} />
          </div>
          {(session.user.role === 'admin' || session.user.role === 'dev') ? (
              <>
              <div className='flex gap-2 items-center'>
                <div className='mr-2'>Code:</div>
                <input className='std-input font-mono uppercase' size={3} maxLength={3} value={code} onChange={(e)=>setCode(e.target.value)} />
                <button className='std-button-lite flex-1' onClick={handleGenerateNewCode}>Generate</button>
              </div>
              <div className='flex gap-2 items-center'>
                <button className='std-button-lite flex-1' onClick={handleSubmitNewClient}>Add Client</button>
              </div>
              </>
            ):(
              <>
              </>
            )}
          
          <div className='my-2 text-[#800]'>{errStatus}</div>
        </div>
      </main>
    </>
  );
}