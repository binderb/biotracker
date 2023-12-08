'use client';
import { ClientSelection } from "@/db/schema";
import Link from "next/link";
import { FaEdit, FaSearch } from "react-icons/fa";
import ClientCreator from "./ClientCreator";
import { useEffect, useState } from "react";

type Props = {
  clients: ClientSelection[];
}

export function ClientTable ({clients}:Props) {

  const [clientSearch, setClientSearch] = useState('');
  const [matchingList, setMatchingList] = useState<(ClientSelection)[]>(clients);

  useEffect(() => {
    const regex = new RegExp(`${clientSearch}`, 'gi');
    const filteredList = clients.filter((client) => client.name.match(regex));
    setMatchingList(filteredList);
  }, [setMatchingList, clientSearch, clients]);

  return (
    <section className='flex flex-col gap-4 col-span-8 bg-secondary/20 border border-secondary/80 p-4 rounded-xl flex-grow'>
      <h5>Clients Module</h5>
      <section className='flex items-center gap-2'>
        <FaSearch />
        <input type='text' className='std-input flex-grow' value={clientSearch} onChange={(e)=>setClientSearch(e.target.value)} />
        <ClientCreator clients={clients} />
      </section>
      {matchingList.length > 0 && (
        <table className='w-full text-left border-collapse'>
          <thead>
            <tr>
              <th className='w-[80%]'>Client Name</th>
              <th className='w-[10%]'>Code</th>
              <th className='w-[10%]'>Details</th>
            </tr>
          </thead>
          <tbody>
            {matchingList.map((client) => (
              <tr key={client.id}>
                <td className='bg-white/50 border border-secondary/80 p-1'>{client.name}</td>
                <td className='bg-white/50 border border-secondary/80 p-1'>{client.code}</td>
                <td className='bg-white/50 border border-secondary/80 p-2 text-center'>
                  <div className='flex items-center'>
                    <Link href={{ pathname: '/clients/[id]', query: { id: client.id } }} as={`/clients/${client.id}`} className='std-button-lite'>
                      <FaEdit />
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {matchingList.length === 0 && (
        <div className='italic'>
          No results.
        </div>
      )}
    </section>
  )
}