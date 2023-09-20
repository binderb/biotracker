
interface Props {
  first: string
  last: string
  referred: any
  email: string
  phone: string
  links: string
  notes: string
  contacts: any[]
  setFirst: Function
  setLast: Function
  setReferred: Function
  setEmail: Function
  setPhone: Function
  setLinks: Function
  setNotes: Function
}

export default function ContactNew ({first,last,referred,email,phone,links,notes,contacts,setFirst,setLast,setReferred,setEmail,setPhone,setLinks,setNotes}:Props) {
  return (
    <>
    <table className='w-full text-left border-collapse'>
      <thead>
        <tr>
          <th className='w-[20%]'></th>
          <th className='w-[80%]'></th>
        </tr>
      </thead>
        <tbody>
          {/* Contact First */}
          <tr>
            <td className='bg-white/50 border border-secondary/80 p-1 font-bold'>First Name</td>
            <td className='bg-white/50 border border-secondary/80 p-1'>
              <input className='std-input w-full' value={first} onChange={(e)=>setFirst(e.target.value)} />
            </td>
          </tr>
          {/* Contact Last */}
          <tr>
            <td className='bg-white/50 border border-secondary/80 p-1 font-bold'>Last Name</td>
            <td className='bg-white/50 border border-secondary/80 p-1'>
              <input className='std-input w-full' value={last} onChange={(e)=>setLast(e.target.value)} />
            </td>
          </tr>
          {/* Contact Referred */}
          <tr>
            <td className='bg-white/50 border border-secondary/80 p-1 font-bold'>Referred By</td>
            <td className='bg-white/50 border border-secondary/80 p-1'>
              <select className='std-input w-full' onChange={(e) => setReferred(contacts.filter((contact:any)=>contact._id === e.target.value)[0])}>
                <option value=''>N/A</option>
                {contacts?.length > 0 && (
                  <>
                    {contacts.map((contact:any,index:number) => (
                      <option value={contact._id} key={`contact-${index}`}>{`${contact.first} ${contact.last}`}</option>
                    ))}
                  </>
                )}
              </select>
            </td>
          </tr>
          {/* Contact Email */}
          <tr>
            <td className='bg-white/50 border border-secondary/80 p-1 font-bold'>Email</td>
            <td className='bg-white/50 border border-secondary/80 p-1'>
              <input className='std-input w-full' value={email} onChange={(e)=>setEmail(e.target.value)} />
            </td>
          </tr>
          {/* Contact Phone */}
          <tr>
            <td className='bg-white/50 border border-secondary/80 p-1 font-bold'>Phone</td>
            <td className='bg-white/50 border border-secondary/80 p-1'>
              <input className='std-input w-full' value={phone} onChange={(e)=>setPhone(e.target.value)} />
            </td>
          </tr>
          {/* Contact Links */}
          <tr>
            <td className='bg-white/50 border border-secondary/80 p-1 font-bold'><div>Links</div><div className='font-normal italic text-[12px]'>(list with commas)</div></td>
            <td className='bg-white/50 border border-secondary/80 p-1'>
              <input className='std-input w-full' value={links} onChange={(e)=>setLinks(e.target.value)} />
            </td>
          </tr>
          {/* Contact Notes */}
          <tr>
            <td className='bg-white/50 border border-secondary/80 p-1 font-bold'>Notes</td>
            <td className='bg-white/50 border border-secondary/80 p-1'>
              <textarea className='std-input w-full h-[100px] resize-none' value={notes} onChange={(e)=>setNotes(e.target.value)} />
            </td>
          </tr>
        </tbody>
      </table>
    </>
  );
}