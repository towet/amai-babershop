import DashboardLayout from '@/components/dashboard/DashboardLayout';
import HeroSettings from '@/components/dashboard/HeroSettings';
import { AboutSettings } from '@/components/dashboard/AboutSettings';
import { ServicesSettings } from '@/components/dashboard/ServicesSettings';
import ClientsManagement from '@/components/dashboard/ClientsManagement';

const Settings = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Hero Section Settings */}
        <HeroSettings />
        {/* About Section Settings */}
        <AboutSettings />
        {/* Services Section Settings */}
        <ServicesSettings />
        {/* Clients Section */}
        <ClientsManagement />
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage application settings and preferences
            </p>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg overflow-hidden divide-y divide-gray-200">
          {/* General Settings Section */}
          <div className="p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">General Settings</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Dark Mode</h3>
                  <p className="text-sm text-gray-500">Enable dark mode for the dashboard</p>
                </div>
                <div className="flex items-center">
                  <button className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-gray-200 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2">
                    <span className="sr-only">Enable dark mode</span>
                    <span className="translate-x-0 relative inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ease-in-out">
                      <span className="opacity-0 absolute inset-0 h-full w-full flex items-center justify-center transition-opacity"></span>
                    </span>
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Email Notifications</h3>
                  <p className="text-sm text-gray-500">Receive email notifications for new appointments</p>
                </div>
                <div className="flex items-center">
                  <button className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-amber-500 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2">
                    <span className="sr-only">Enable email notifications</span>
                    <span className="translate-x-5 relative inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ease-in-out">
                      <span className="opacity-100 absolute inset-0 h-full w-full flex items-center justify-center transition-opacity"></span>
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Shop Settings Section */}
          <div className="p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Shop Settings</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="shopName" className="block text-sm font-medium text-gray-700">
                  Shop Name
                </label>
                <input
                  type="text"
                  id="shopName"
                  name="shopName"
                  defaultValue="Amai Men's Care"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm"
                />
              </div>

              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                  Address
                </label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  defaultValue="123 Barber Street, Istanbul"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm"
                />
              </div>

              <div>
                <label htmlFor="workingHours" className="block text-sm font-medium text-gray-700">
                  Working Hours
                </label>
                <input
                  type="text"
                  id="workingHours"
                  name="workingHours"
                  defaultValue="Monday-Saturday: 9:00 AM - 8:00 PM, Sunday: Closed"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm"
                />
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="px-6 py-4 bg-gray-50 text-right">
            <button
              type="button"
              className="inline-flex justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-black hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Settings;
