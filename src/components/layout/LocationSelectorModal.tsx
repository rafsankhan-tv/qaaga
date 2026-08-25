import React, { useState } from 'react';
import { X, MapPin, Search, Check, ChevronRight } from 'lucide-react';
import { BANGLADESH_LOCATIONS, POPULAR_AREAS } from '../../data/bangladeshLocations';
import { useLocation } from '../../context/LocationContext';

export const LocationSelectorModal: React.FC = () => {
  const { selectedLocation, setLocation, isLocationModalOpen, setIsLocationModalOpen } = useLocation();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeDivision, setActiveDivision] = useState(selectedLocation.division || 'Dhaka');
  const [activeDistrict, setActiveDistrict] = useState(selectedLocation.district || 'Dhaka');
  const [activeThana, setActiveThana] = useState(selectedLocation.thana || 'Gulshan');

  if (!isLocationModalOpen) return null;

  const currentDivData = BANGLADESH_LOCATIONS.find((d) => d.division === activeDivision);
  const currentDistData = currentDivData?.districts.find((d) => d.name === activeDistrict);
  const currentThanaData = currentDistData?.thanas.find((t) => t.name === activeThana);

  const handleSelectArea = (area: string, thana: string, district: string, division: string) => {
    setLocation({
      division,
      district,
      thana,
      area
    });
    setIsLocationModalOpen(false);
  };

  // Search filtering
  const searchResults: { area: string; thana: string; district: string; division: string }[] = [];
  if (searchQuery.trim().length >= 2) {
    const q = searchQuery.toLowerCase();
    BANGLADESH_LOCATIONS.forEach((div) => {
      div.districts.forEach((dist) => {
        dist.thanas.forEach((th) => {
          th.areas.forEach((ar) => {
            if (
              ar.toLowerCase().includes(q) ||
              th.name.toLowerCase().includes(q) ||
              dist.name.toLowerCase().includes(q)
            ) {
              searchResults.push({
                area: ar,
                thana: th.name,
                district: dist.name,
                division: div.division
              });
            }
          });
        });
      });
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="p-3.5 sm:p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
              <MapPin size={16} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Select Service Location</h3>
              <p className="text-[10px] text-slate-500">Find nearby technicians, doctors, nurses and stores</p>
            </div>
          </div>
          <button
            onClick={() => setIsLocationModalOpen(false)}
            className="w-7 h-7 rounded-full hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-3 border-b border-slate-100 bg-white">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search area (e.g. Gulshan, Dhanmondi, Uttara, Mirpur)..."
              className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
            />
          </div>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {searchQuery.trim().length >= 2 ? (
            <div>
              <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                Matching Areas ({searchResults.length})
              </h4>
              {searchResults.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-400">
                  No matching location found. Try another search keyword.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {searchResults.slice(0, 16).map((res, i) => (
                    <button
                      key={i}
                      onClick={() => handleSelectArea(res.area, res.thana, res.district, res.division)}
                      className="p-2.5 rounded-lg border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/40 text-left transition-all flex items-center justify-between group cursor-pointer"
                    >
                      <div>
                        <div className="text-xs font-bold text-slate-900 group-hover:text-indigo-700">{res.area}</div>
                        <div className="text-[10px] text-slate-500">{res.thana}, {res.district}</div>
                      </div>
                      <ChevronRight size={13} className="text-slate-400 group-hover:text-indigo-600" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <>
              {/* Popular Quick Select */}
              <div>
                <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Popular Hubs in Dhaka &amp; Chittagong
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {POPULAR_AREAS.map((pop, idx) => {
                    const isSelected = selectedLocation.area === pop.area;
                    return (
                      <button
                        key={idx}
                        onClick={() => handleSelectArea(pop.area, pop.thana, pop.district, pop.division)}
                        className={`text-xs px-2.5 py-1 rounded-md border font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                          isSelected
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                            : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                        }`}
                      >
                        {isSelected && <Check size={11} />}
                        <span>{pop.area}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Hierarchical Selector: Division -> District -> Thana -> Area */}
              <div className="border-t border-slate-100 pt-3">
                <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Browse by Location Hierarchy
                </h4>

                {/* Division Tabs */}
                <div className="flex overflow-x-auto gap-1 pb-1.5 border-b border-slate-200 scrollbar-none">
                  {BANGLADESH_LOCATIONS.map((d) => (
                    <button
                      key={d.division}
                      onClick={() => {
                        setActiveDivision(d.division);
                        setActiveDistrict(d.districts[0]?.name || '');
                        setActiveThana(d.districts[0]?.thanas[0]?.name || '');
                      }}
                      className={`px-2.5 py-1 rounded-md text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                        activeDivision === d.division
                          ? 'bg-indigo-600 text-white'
                          : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {d.division}
                    </button>
                  ))}
                </div>

                {/* Districts & Thanas Row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mt-2.5">
                  {/* Districts */}
                  <div className="space-y-0.5 max-h-44 overflow-y-auto pr-1">
                    <div className="text-[10px] font-semibold text-slate-400">Districts</div>
                    {currentDivData?.districts.map((dist) => (
                      <button
                        key={dist.name}
                        onClick={() => {
                          setActiveDistrict(dist.name);
                          setActiveThana(dist.thanas[0]?.name || '');
                        }}
                        className={`w-full text-left px-2 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
                          activeDistrict === dist.name
                            ? 'bg-indigo-50 text-indigo-700 font-bold border-l-2 border-indigo-600'
                            : 'text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        {dist.name}
                      </button>
                    ))}
                  </div>

                  {/* Thanas */}
                  <div className="space-y-0.5 max-h-44 overflow-y-auto pr-1 border-l sm:border-l border-slate-100 sm:pl-2">
                    <div className="text-[10px] font-semibold text-slate-400">Thanas / Upazilas</div>
                    {currentDistData?.thanas.map((th) => (
                      <button
                        key={th.name}
                        onClick={() => setActiveThana(th.name)}
                        className={`w-full text-left px-2 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
                          activeThana === th.name
                            ? 'bg-indigo-50 text-indigo-700 font-bold border-l-2 border-indigo-600'
                            : 'text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        {th.name}
                      </button>
                    ))}
                  </div>

                  {/* Areas in Selected Thana */}
                  <div className="space-y-0.5 max-h-44 overflow-y-auto border-l sm:border-l border-slate-100 sm:pl-2">
                    <div className="text-[10px] font-semibold text-slate-400">Areas in {activeThana}</div>
                    {currentThanaData?.areas.map((ar) => {
                      const isSelected = selectedLocation.area === ar;
                      return (
                        <button
                          key={ar}
                          onClick={() => handleSelectArea(ar, activeThana, activeDistrict, activeDivision)}
                          className={`w-full text-left px-2 py-1 rounded text-xs font-medium transition-all flex items-center justify-between cursor-pointer ${
                            isSelected
                              ? 'bg-indigo-600 text-white font-bold'
                              : 'text-slate-800 hover:bg-indigo-50 hover:text-indigo-700'
                          }`}
                        >
                          <span>{ar}</span>
                          {isSelected && <Check size={11} />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="text-xs text-slate-600">
            Current: <strong className="text-slate-900">{selectedLocation.area}, {selectedLocation.thana}</strong>
          </div>
          <button
            onClick={() => setIsLocationModalOpen(false)}
            className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
