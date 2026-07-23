import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Header } from '../common/Header';
import { DataTable, Column } from '../common/DataTable';
import { GuestBanner } from '../common/GuestBanner';
import { EquipmentCategory, Manufacturer, Location } from '../../types';
import { Database, Plus, Save, Trash2, Tag, Building, MapPin } from 'lucide-react';

interface MasterDataViewProps {
  onOpenMobileMenu: () => void;
}

export const MasterDataView: React.FC<MasterDataViewProps> = ({ onOpenMobileMenu }) => {
  const {
    categories,
    addCategory,
    updateCategory,
    deleteCategory,
    manufacturers,
    addManufacturer,
    updateManufacturer,
    deleteManufacturer,
    locations,
    addLocation,
    updateLocation,
    deleteLocation,
    currentUser
  } = useApp();

  const isGuest = currentUser?.role === 'guest';
  const [activeTab, setActiveTab] = useState<'categories' | 'manufacturers' | 'locations'>('categories');

  // Form States
  const [selectedCat, setSelectedCat] = useState<EquipmentCategory | null>(null);
  const [catName, setCatName] = useState('');
  const [catDesc, setCatDesc] = useState('');

  const [selectedMfr, setSelectedMfr] = useState<Manufacturer | null>(null);
  const [mfrName, setMfrName] = useState('');
  const [mfrContact, setMfrContact] = useState('');
  const [mfrEmail, setMfrEmail] = useState('');
  const [mfrPhone, setMfrPhone] = useState('');
  const [mfrAddress, setMfrAddress] = useState('');
  const [mfrWebsite, setMfrWebsite] = useState('');

  const [selectedLoc, setSelectedLoc] = useState<Location | null>(null);
  const [locName, setLocName] = useState('');
  const [locBuilding, setLocBuilding] = useState('');
  const [locRoom, setLocRoom] = useState('');
  const [locDesc, setLocDesc] = useState('');

  // Category handlers
  const handleSelectCat = (c: EquipmentCategory) => {
    setSelectedCat(c);
    setCatName(c.name);
    setCatDesc(c.description);
  };

  const handleClearCatForm = () => {
    setSelectedCat(null);
    setCatName('');
    setCatDesc('');
  };

  const handleSaveCat = (e: React.FormEvent) => {
    e.preventDefault();
    if (isGuest) return;
    if (selectedCat) {
      updateCategory({ ...selectedCat, name: catName, description: catDesc });
    } else {
      addCategory({ name: catName, description: catDesc });
    }
    handleClearCatForm();
  };

  // Manufacturer handlers
  const handleSelectMfr = (m: Manufacturer) => {
    setSelectedMfr(m);
    setMfrName(m.name);
    setMfrContact(m.contactPerson);
    setMfrEmail(m.email);
    setMfrPhone(m.phone);
    setMfrAddress(m.address);
    setMfrWebsite(m.website);
  };

  const handleClearMfrForm = () => {
    setSelectedMfr(null);
    setMfrName('');
    setMfrContact('');
    setMfrEmail('');
    setMfrPhone('');
    setMfrAddress('');
    setMfrWebsite('');
  };

  const handleSaveMfr = (e: React.FormEvent) => {
    e.preventDefault();
    if (isGuest) return;
    if (selectedMfr) {
      updateManufacturer({
        ...selectedMfr,
        name: mfrName,
        contactPerson: mfrContact,
        email: mfrEmail,
        phone: mfrPhone,
        address: mfrAddress,
        website: mfrWebsite
      });
    } else {
      addManufacturer({
        name: mfrName,
        contactPerson: mfrContact,
        email: mfrEmail,
        phone: mfrPhone,
        address: mfrAddress,
        website: mfrWebsite
      });
    }
    handleClearMfrForm();
  };

  // Location handlers
  const handleSelectLoc = (l: Location) => {
    setSelectedLoc(l);
    setLocName(l.name);
    setLocBuilding(l.building);
    setLocRoom(l.room);
    setLocDesc(l.description);
  };

  const handleClearLocForm = () => {
    setSelectedLoc(null);
    setLocName('');
    setLocBuilding('');
    setLocRoom('');
    setLocDesc('');
  };

  const handleSaveLoc = (e: React.FormEvent) => {
    e.preventDefault();
    if (isGuest) return;
    if (selectedLoc) {
      updateLocation({
        ...selectedLoc,
        name: locName,
        building: locBuilding,
        room: locRoom,
        description: locDesc
      });
    } else {
      addLocation({
        name: locName,
        building: locBuilding,
        room: locRoom,
        description: locDesc
      });
    }
    handleClearLocForm();
  };

  // Columns
  const categoryColumns: Column<EquipmentCategory>[] = [
    { key: 'name', header: 'Category Name', accessor: c => <span className="font-bold text-slate-900">{c.name}</span> },
    { key: 'description', header: 'Description', accessor: c => <span className="text-slate-600">{c.description}</span> }
  ];

  const manufacturerColumns: Column<Manufacturer>[] = [
    { key: 'name', header: 'Manufacturer Name', accessor: m => <span className="font-bold text-slate-900">{m.name}</span> },
    { key: 'contactPerson', header: 'Contact Person', accessor: m => <span>{m.contactPerson}</span> },
    { key: 'email', header: 'Email & Phone', accessor: m => <span className="text-slate-600">{m.email} • {m.phone}</span> },
    { key: 'address', header: 'Address', accessor: m => <span className="text-slate-500">{m.address}</span> }
  ];

  const locationColumns: Column<Location>[] = [
    { key: 'name', header: 'Location Name', accessor: l => <span className="font-bold text-slate-900">{l.name}</span> },
    { key: 'building', header: 'Building', accessor: l => <span className="font-semibold text-slate-700">{l.building}</span> },
    { key: 'room', header: 'Room', accessor: l => <span className="text-slate-700">{l.room}</span> },
    { key: 'description', header: 'Description', accessor: l => <span className="text-slate-500">{l.description}</span> }
  ];

  return (
    <div className="space-y-6">
      <Header
        title="Master Data Management"
        subtitle="Configure equipment categories, verified manufacturers, and laboratory locations"
        icon={Database}
        onOpenMobileMenu={onOpenMobileMenu}
      />

      <GuestBanner />

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-2">
        <button
          onClick={() => setActiveTab('categories')}
          className={`pb-3 px-4 font-bold text-xs flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            activeTab === 'categories'
              ? 'border-blue-600 text-blue-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Tag className="w-4 h-4" /> Equipment Categories ({categories.length})
        </button>
        <button
          onClick={() => setActiveTab('manufacturers')}
          className={`pb-3 px-4 font-bold text-xs flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            activeTab === 'manufacturers'
              ? 'border-blue-600 text-blue-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Building className="w-4 h-4" /> Manufacturers ({manufacturers.length})
        </button>
        <button
          onClick={() => setActiveTab('locations')}
          className={`pb-3 px-4 font-bold text-xs flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            activeTab === 'locations'
              ? 'border-blue-600 text-blue-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <MapPin className="w-4 h-4" /> Lab Locations ({locations.length})
        </button>
      </div>

      {/* CATEGORIES TAB */}
      {activeTab === 'categories' && (
        <div className="space-y-6">
          <DataTable
            data={categories}
            columns={categoryColumns}
            keyExtractor={c => c.id}
            title="Equipment Categories List"
            subtitle="Click any row below to edit or view details"
            onRowClick={handleSelectCat}
          />

          {!isGuest && (
            <div className="bg-slate-50/80 rounded-2xl border border-slate-200 p-6 shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-200/80 pb-3 mb-4">
                <h3 className="text-sm font-bold text-slate-900">
                  {selectedCat ? `Edit Category: ${selectedCat.name}` : '➕ Add New Equipment Category'}
                </h3>
                {selectedCat && (
                  <button
                    onClick={handleClearCatForm}
                    className="text-xs text-blue-600 font-semibold hover:underline cursor-pointer"
                  >
                    + Create New Category Instead
                  </button>
                )}
              </div>

              <form onSubmit={handleSaveCat} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                      Category Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={catName}
                      onChange={e => setCatName(e.target.value)}
                      placeholder="e.g. Chromatography Systems"
                      className="w-full text-xs bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                      Description
                    </label>
                    <input
                      type="text"
                      value={catDesc}
                      onChange={e => setCatDesc(e.target.value)}
                      placeholder="e.g. Gas and liquid chromatography equipment"
                      className="w-full text-xs bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  {selectedCat && (
                    <button
                      type="button"
                      onClick={() => {
                        deleteCategory(selectedCat.id);
                        handleClearCatForm();
                      }}
                      className="px-4 py-2 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Delete
                    </button>
                  )}
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-xs shadow-md flex items-center gap-1.5 cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" /> Save Category
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}

      {/* MANUFACTURERS TAB */}
      {activeTab === 'manufacturers' && (
        <div className="space-y-6">
          <DataTable
            data={manufacturers}
            columns={manufacturerColumns}
            keyExtractor={m => m.id}
            title="Approved Manufacturers Directory"
            subtitle="Click any manufacturer row to modify information"
            onRowClick={handleSelectMfr}
          />

          {!isGuest && (
            <div className="bg-slate-50/80 rounded-2xl border border-slate-200 p-6 shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-200/80 pb-3 mb-4">
                <h3 className="text-sm font-bold text-slate-900">
                  {selectedMfr ? `Edit Manufacturer: ${selectedMfr.name}` : '➕ Add New Manufacturer'}
                </h3>
                {selectedMfr && (
                  <button
                    onClick={handleClearMfrForm}
                    className="text-xs text-blue-600 font-semibold hover:underline cursor-pointer"
                  >
                    + Create New Manufacturer Instead
                  </button>
                )}
              </div>

              <form onSubmit={handleSaveMfr} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                      Manufacturer Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={mfrName}
                      onChange={e => setMfrName(e.target.value)}
                      placeholder="e.g. Agilent Technologies"
                      className="w-full text-xs bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                      Contact Person
                    </label>
                    <input
                      type="text"
                      value={mfrContact}
                      onChange={e => setMfrContact(e.target.value)}
                      placeholder="e.g. David Miller"
                      className="w-full text-xs bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={mfrEmail}
                      onChange={e => setMfrEmail(e.target.value)}
                      placeholder="service@agilent.com"
                      className="w-full text-xs bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                      Phone
                    </label>
                    <input
                      type="text"
                      value={mfrPhone}
                      onChange={e => setMfrPhone(e.target.value)}
                      placeholder="+1 800 227 9770"
                      className="w-full text-xs bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                      Website
                    </label>
                    <input
                      type="text"
                      value={mfrWebsite}
                      onChange={e => setMfrWebsite(e.target.value)}
                      placeholder="https://www.agilent.com"
                      className="w-full text-xs bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                      Address
                    </label>
                    <input
                      type="text"
                      value={mfrAddress}
                      onChange={e => setMfrAddress(e.target.value)}
                      placeholder="5301 Stevens Creek Blvd"
                      className="w-full text-xs bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  {selectedMfr && (
                    <button
                      type="button"
                      onClick={() => {
                        deleteManufacturer(selectedMfr.id);
                        handleClearMfrForm();
                      }}
                      className="px-4 py-2 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Delete
                    </button>
                  )}
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-xs shadow-md flex items-center gap-1.5 cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" /> Save Manufacturer
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}

      {/* LOCATIONS TAB */}
      {activeTab === 'locations' && (
        <div className="space-y-6">
          <DataTable
            data={locations}
            columns={locationColumns}
            keyExtractor={l => l.id}
            title="Laboratory Locations & Rooms"
            subtitle="Click any location row to modify building/room details"
            onRowClick={handleSelectLoc}
          />

          {!isGuest && (
            <div className="bg-slate-50/80 rounded-2xl border border-slate-200 p-6 shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-200/80 pb-3 mb-4">
                <h3 className="text-sm font-bold text-slate-900">
                  {selectedLoc ? `Edit Location: ${selectedLoc.name}` : '➕ Add New Lab Location'}
                </h3>
                {selectedLoc && (
                  <button
                    onClick={handleClearLocForm}
                    className="text-xs text-blue-600 font-semibold hover:underline cursor-pointer"
                  >
                    + Create New Location Instead
                  </button>
                )}
              </div>

              <form onSubmit={handleSaveLoc} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                      Location Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={locName}
                      onChange={e => setLocName(e.target.value)}
                      placeholder="e.g. Chemical Testing Lab 1"
                      className="w-full text-xs bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                      Building
                    </label>
                    <input
                      type="text"
                      value={locBuilding}
                      onChange={e => setLocBuilding(e.target.value)}
                      placeholder="e.g. QA Building 4"
                      className="w-full text-xs bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                      Room
                    </label>
                    <input
                      type="text"
                      value={locRoom}
                      onChange={e => setLocRoom(e.target.value)}
                      placeholder="e.g. Room 201"
                      className="w-full text-xs bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900"
                    />
                  </div>
                  <div className="sm:col-span-3">
                    <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                      Description / Facilities
                    </label>
                    <input
                      type="text"
                      value={locDesc}
                      onChange={e => setLocDesc(e.target.value)}
                      placeholder="e.g. Main GC-MS, HPLC, and Solvents extraction station"
                      className="w-full text-xs bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  {selectedLoc && (
                    <button
                      type="button"
                      onClick={() => {
                        deleteLocation(selectedLoc.id);
                        handleClearLocForm();
                      }}
                      className="px-4 py-2 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Delete
                    </button>
                  )}
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-xs shadow-md flex items-center gap-1.5 cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" /> Save Location
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
