import Link from "next/link";

const Home = () => {

  return (
    <main className="flex flex-col p-4">
      <div>This is a demo home page. Click the links below to access different prototypes.</div>
      <div className="flex py-2">
        <Link className='std-button mr-1' href='./client-manager'>Client Manager (admin only)</Link>
        <Link className='std-button mr-1' href='./study-creator'>Project Creator</Link>
      </div>
    </main>
  )
}

export default Home;
