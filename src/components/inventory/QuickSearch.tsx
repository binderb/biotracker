import { faSearch } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function QuickSearch () {
  return (
    <div className='flex flex-col w-full gap-2'>
      <h5>Quick Search</h5>
      <div className="flex items-center py-1 gap-2">
        <FontAwesomeIcon icon={faSearch} className='text-primary' />
        <input className='std-input border border-secondary/80 flex-grow' placeholder="search for a spec" />
        {/* style="overflow-y:scroll; height: calc(100vh - 225px);" */}

        </div>
        <div className="rounded border border-secondary/80 bg-white mb-3 flex-1 h-[calc(100vh)]">

        </div>
        <div id="quick-search-results" className="border-0">
      </div>
    </div>
  );
}