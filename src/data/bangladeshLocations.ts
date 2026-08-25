export interface LocationNode {
  division: string;
  districts: {
    name: string;
    thanas: {
      name: string;
      areas: string[];
    }[];
  }[];
}

export const BANGLADESH_LOCATIONS: LocationNode[] = [
  {
    division: 'Dhaka',
    districts: [
      {
        name: 'Dhaka',
        thanas: [
          {
            name: 'Gulshan',
            areas: ['Gulshan 1', 'Gulshan 2', 'Niketan', 'Baridhara Diplomatic Zone', 'Baridhara DOHS']
          },
          {
            name: 'Banani',
            areas: ['Banani Block A-H', 'Banani Chairmanbari', 'Kakoli', 'Banani DOHS']
          },
          {
            name: 'Dhanmondi',
            areas: ['Dhanmondi 1-32', 'Shankar', 'Jigatola', 'Satmasjid Road', 'Kalabagan']
          },
          {
            name: 'Uttara',
            areas: ['Uttara Sector 1-14', 'Uttara Sector 15-18', 'Jasmin Garden', 'Azampur', 'House Building']
          },
          {
            name: 'Mirpur',
            areas: ['Mirpur 1', 'Mirpur 2', 'Mirpur 10 (Golchottor)', 'Mirpur 11', 'Mirpur 12', 'Mirpur 14', 'Mirpur DOHS', 'Pallabi']
          },
          {
            name: 'Mohammadpur',
            areas: ['Mohammadpur Bus Stand', 'Salimullah Road', 'Town Hall', 'Khatasur', 'Kaderabad Housing', 'Japan Garden City', 'Ring Road']
          },
          {
            name: 'Badda',
            areas: ['North Badda', 'South Badda', 'Merul Badda', 'Aftabnagar']
          },
          {
            name: 'Motijheel',
            areas: ['Dilkusha', 'Arambagh', 'Fakirapool', 'Kamalapur']
          },
          {
            name: 'Bashundhara',
            areas: ['Block A-D', 'Block E-G', 'Block I-M', 'Apollo/Evercare Area']
          },
          {
            name: 'Mohakhali',
            areas: ['Mohakhali C/A', 'Mohakhali DOHS', 'Wireless Gate', 'TB Gate']
          }
        ]
      },
      {
        name: 'Gazipur',
        thanas: [
          {
            name: 'Gazipur Sadar',
            areas: ['Joydebpur', 'Chowrasta', 'Board Bazar', 'Konabari']
          },
          {
            name: 'Tongi',
            areas: ['Tongi Bazar', 'Cherag Ali', 'College Gate', 'Mill Gate']
          }
        ]
      },
      {
        name: 'Narayanganj',
        thanas: [
          {
            name: 'Narayanganj Sadar',
            areas: ['Chashara', 'Mondolpara', 'Tanbazar', 'Deobhog']
          },
          {
            name: 'Siddhirganj',
            areas: ['Adamjee EPZ Area', 'Chittagong Road', 'Mizmizi']
          }
        ]
      }
    ]
  },
  {
    division: 'Chittagong',
    districts: [
      {
        name: 'Chittagong',
        thanas: [
          {
            name: 'Panchlaish',
            areas: ['GEC Circle', 'Nasirabad', 'Prabartak Circle', 'Muradpur']
          },
          {
            name: 'Khulshi',
            areas: ['Khulshi Residential Area', 'South Khulshi', 'Zakir Hossain Road']
          },
          {
            name: 'Kotwali',
            areas: ['Anderkilla', 'Lalkhan Bazar', 'Chawkbazar', 'New Market']
          },
          {
            name: 'Agrabad',
            areas: ['Agrabad C/A', 'Chowdhury Para', 'Barik Building']
          }
        ]
      },
      {
        name: 'Cox\'s Bazar',
        thanas: [
          {
            name: 'Cox\'s Bazar Sadar',
            areas: ['Kolatoli Beach Area', 'Laboni Point', 'Sugandha Beach', 'Main Road']
          }
        ]
      }
    ]
  },
  {
    division: 'Sylhet',
    districts: [
      {
        name: 'Sylhet',
        thanas: [
          {
            name: 'Sylhet Sadar',
            areas: ['Zindabazar', 'Amberkhana', 'Shahi Eidgah', 'Subidbazar', 'Upashahar']
          }
        ]
      }
    ]
  },
  {
    division: 'Rajshahi',
    districts: [
      {
        name: 'Rajshahi',
        thanas: [
          {
            name: 'Boalia',
            areas: ['Saheb Bazar', 'Alupatti', 'Ranibazar', 'Talaimari']
          }
        ]
      }
    ]
  },
  {
    division: 'Khulna',
    districts: [
      {
        name: 'Khulna',
        thanas: [
          {
            name: 'Khulna Sadar',
            areas: ['Dakbangla', 'Sonadanga', 'Boyra', 'Khalishpur']
          }
        ]
      }
    ]
  }
];

export const POPULAR_AREAS = [
  { area: 'Gulshan 2', thana: 'Gulshan', district: 'Dhaka', division: 'Dhaka' },
  { area: 'Banani Block A-H', thana: 'Banani', district: 'Dhaka', division: 'Dhaka' },
  { area: 'Dhanmondi 1-32', thana: 'Dhanmondi', district: 'Dhaka', division: 'Dhaka' },
  { area: 'Uttara Sector 1-14', thana: 'Uttara', district: 'Dhaka', division: 'Dhaka' },
  { area: 'Mirpur 10 (Golchottor)', thana: 'Mirpur', district: 'Dhaka', division: 'Dhaka' },
  { area: 'GEC Circle', thana: 'Panchlaish', district: 'Chittagong', division: 'Chittagong' },
  { area: 'Zindabazar', thana: 'Sylhet Sadar', district: 'Sylhet', division: 'Sylhet' }
];
