import Navbar from "@/components/Navbar";
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]";
import { initializeApollo, addApolloState } from "../../../utils/apolloClient";
import { GET_INVENTORY } from "@/utils/queriesInventory";
import { useSession } from "next-auth/react";
import { useQuery } from "@apollo/client";
import { useRouter } from "next/router";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCube, faQrcode, faSearch } from "@fortawesome/free-solid-svg-icons";
import { useState } from "react";
import QuickSearch from "@/components/inventory/QuickSearch";
import Scan from "@/components/inventory/Scan";
import AddSpec from "@/components/inventory/AddSpec";

export async function getServerSideProps(context:any) {
  const session = await getServerSession(
    context.req,
    context.res,
    authOptions
  )
  if (!session) {
    return {
      redirect: {
        destination: '/login',
        permanent: false
      }
    }
  }

  const apolloClient = initializeApollo();
  const initialData = await apolloClient.query({
    query: GET_INVENTORY,
  });

  return addApolloState(apolloClient, {
    props: {
      session,
    },
  });

}

export default function InventoryDashboard () {

  const router = useRouter();
  const { data: session, status } = useSession();
  const { data: inventoryData, error } = useQuery(GET_INVENTORY);
  const inventory = inventoryData.getLeads;

  const [currentPanel, setCurrentPanel] = useState('search')

  if (status !== 'authenticated') {
    router.push('/login');
    return;
  }
  
  return (
    <>
      <Navbar />
      <main>
        <section className='grid grid-cols-12 m-2 gap-2'>
          {/* controls */}
          <section className='flex col-span-3 gap-2'>
            <section className='p-4 w-full bg-secondary/10 rounded-md border border-1 border-secondary/80'>
              <h5>Manage Inventory</h5>
              <div className="flex flex-col radio-group" role="group">
                <input type="radio" className="radio-check" name="buttonradio" id="search" checked={currentPanel === 'search'} onChange={() => setCurrentPanel('search')} />
                <label className="radio-label" htmlFor="search"><FontAwesomeIcon icon={faSearch} /><span className="none md:inline">Quick Search</span></label>
                <input type="radio" className="radio-check" name="buttonradio" id="scan" checked={currentPanel === 'scan'} onChange={() => setCurrentPanel('scan')} />
                <label className="radio-label" htmlFor="scan"><FontAwesomeIcon icon={faQrcode} /><span className="none md:inline">Scan Inventory Items</span></label>
                <input type="radio" className="radio-check" name="buttonradio" id="spec" checked={currentPanel === 'spec'} onChange={() => setCurrentPanel('spec')} />
                <label className="radio-label" htmlFor="spec"><FontAwesomeIcon icon={faCube} /><span className="none md:inline">Add Inventory Spec</span></label>
              </div>
            </section>
          </section>
          {/* dynamic display */}
          <section className='flex col-span-9 gap-2'>
            <section className='flex p-4 w-full bg-secondary/10 rounded-md border border-1 border-secondary/80'>
              { currentPanel === 'search' && <QuickSearch /> }
              { currentPanel === 'scan' && <Scan /> }
              { currentPanel === 'spec' && <AddSpec /> }
            </section>
          </section>
        </section>
      </main>
    </>
  );
}