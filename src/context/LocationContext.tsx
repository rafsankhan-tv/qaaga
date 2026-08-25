import React, { createContext, useContext, useState, useEffect } from 'react';

export interface UserLocationState {
  division: string;
  district: string;
  thana: string;
  area: string;
}

interface LocationContextType {
  selectedLocation: UserLocationState;
  setLocation: (loc: Partial<UserLocationState>) => void;
  formattedLocation: string;
  isLocationModalOpen: boolean;
  setIsLocationModalOpen: (open: boolean) => void;
  resetToDefault: () => void;
}

const DEFAULT_LOCATION: UserLocationState = {
  division: 'Dhaka',
  district: 'Dhaka',
  thana: 'Gulshan',
  area: 'Gulshan 2'
};

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedLocation, setSelectedLocation] = useState<UserLocationState>(() => {
    try {
      const saved = localStorage.getItem('qaaga_user_location');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return DEFAULT_LOCATION;
  });

  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem('qaaga_user_location', JSON.stringify(selectedLocation));
    } catch (e) {}
  }, [selectedLocation]);

  const setLocation = (loc: Partial<UserLocationState>) => {
    setSelectedLocation(prev => ({ ...prev, ...loc }));
  };

  const resetToDefault = () => {
    setSelectedLocation(DEFAULT_LOCATION);
  };

  const formattedLocation = `${selectedLocation.area}, ${selectedLocation.thana}`;

  return (
    <LocationContext.Provider
      value={{
        selectedLocation,
        setLocation,
        formattedLocation,
        isLocationModalOpen,
        setIsLocationModalOpen,
        resetToDefault
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = (): LocationContextType => {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
};
