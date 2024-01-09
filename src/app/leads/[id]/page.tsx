import Nav from "@/app/(global components)/Nav";
import { db } from "@/db";
import { SalesLeadWithAllDetails, salesleadrevisions, leads } from "@/db/schema_salesleadsModule";
import { desc, eq } from "drizzle-orm";
import Link from "next/link";
import SalesLeadViewer from "./components/SalesLeadViewer";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { User, users } from "@/db/schema_usersModule";
import { forms } from "@/db/schema_formsModule";



export default async function EditSalesLead({ params }: { params: { id: number } }) {
  const session = await getServerSession(authOptions);
  const currentUser = await db.query.users.findFirst({where: eq(users.id,parseInt(session!.user.id))}) as User;
  const usersList = await db.query.users.findMany();
  const clients = await db.query.clients.findMany();
  const studyPlans = await db.query.forms.findMany({
    where: eq(forms.docType, 'studyplan'),
    with: {
      revisions: {
        with: {
          sections: {
            with: {
              rows: {
                with: {
                  fields: true,
                },
              },
            },
          },
        },
      },
    },
  });
  const lead = await db.query.leads.findFirst({
    where: eq(leads.id, params.id),
    with: {
      client: true,
      studies: true,
      quote: true,
      project: {
        with: {
          contacts: {
            columns: {},
            with: {
              contact: true
            }
          }
        }
      },
      revisions: {
        orderBy: [
          desc(salesleadrevisions.created)
        ],
        limit: 1,
        with: {
          studyplans: {
            columns: {
              formrevision: true
            },
            with: {
              formrevision: {
                with: {
                  form: true,
                  sections: {
                    with: {
                      rows: {
                        with: {
                          fields: {
                            with: {
                              salesleadformdata: true
                            }
                          },
                        },
                      },
                    },
                  },
                },
              },
            }
          },
        }
      },
      notes: true,
      author: {
        columns: {
          password: false,
        }
      },
      contributors: {
        with: {
          contributor: {
            columns: {
              password: false,
            }
          }
        },
      },
    },
    
  }) as SalesLeadWithAllDetails;
  

  return (
    <>
      {/* <div className='flex flex-col gap-2'>
        {JSON.stringify(lead)}
      </div> */}
      <Nav />
      <div className='mt-4 flex gap-4 items-center'>
        <Link className='std-link ml-4' href='/leads'>
          &larr; Back
        </Link>
        <h1 className='text-[20px] font-bold'>{`${lead?.name ?? '(Lead Not Found)'}`}</h1>
      </div>
      <main className='md:h-[calc(100vh-95px)] overflow-x-hidden flex flex-col gap-2 p-4'>
        <SalesLeadViewer currentUser={currentUser} users={usersList} clients={clients} studyPlans={studyPlans} salesLead={lead} />
      </main>
    </>
  )
}