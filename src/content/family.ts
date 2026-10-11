/** Parent occupations by family wealth tier (flavour for the family at birth). */
export const PARENT_JOBS: Record<'poor' | 'working' | 'middle' | 'comfortable' | 'rich', string[]> =
  {
    poor: [
      'Unemployed',
      'Dishwasher',
      'Night cleaner',
      'Day laborer',
      'Fruit picker',
      'Parking attendant',
    ],
    working: [
      'Bus driver',
      'Warehouse picker',
      'Cashier',
      'Electrician',
      'Hairdresser',
      'Plumber',
      'Line cook',
    ],
    middle: [
      'Teacher',
      'Nurse',
      'Accountant',
      'Police officer',
      'Office manager',
      'Pharmacist',
      'Engineer',
    ],
    comfortable: [
      'Architect',
      'Dentist',
      'Software engineer',
      'Lawyer',
      'Bank manager',
      'Professor',
    ],
    rich: ['Surgeon', 'Company founder', 'Investment banker', 'Hotel owner', 'Corporate executive'],
  };

/** Jobs that didn't exist yet: nobody is a software engineer in 1955. */
const JOB_FROM: Record<string, number> = { 'Software engineer': 1970 };
export const jobExists = (job: string, year: number): boolean => year >= (JOB_FROM[job] ?? 0);

/** Family savings in reference dollars by tier. */
export const FAMILY_WEALTH: Record<
  'poor' | 'working' | 'middle' | 'comfortable' | 'rich',
  [number, number]
> = {
  poor: [0, 4000],
  working: [3000, 30000],
  middle: [25000, 150000],
  comfortable: [150000, 900000],
  rich: [1500000, 12000000],
};

export const SKIN_TONES = ['', '🏻', '🏼', '🏽', '🏾', '🏿'];

/** The playable job (and level) behind each job title other people have, for an heir who takes over a life. */
export const PARENT_JOB_LINK: Record<string, [string, number]> = {
  Dishwasher: ['chef', 0],
  'Night cleaner': ['hotel_staff', 0],
  'Day laborer': ['construction_worker', 0],
  'Fruit picker': ['farmer', 0],
  'Parking attendant': ['retail_associate', 0],
  'Bus driver': ['bus_driver', 1],
  'Warehouse picker': ['truck_driver', 0],
  Cashier: ['retail_associate', 0],
  Electrician: ['electrician', 1],
  Hairdresser: ['retail_associate', 1],
  Plumber: ['plumber', 1],
  'Line cook': ['chef', 0],
  Teacher: ['school_teacher', 1],
  Nurse: ['nurse', 1],
  Accountant: ['accountant', 1],
  'Police officer': ['police_officer', 1],
  'Office manager': ['civil_servant', 2],
  Pharmacist: ['lab_technician', 2],
  Engineer: ['software_engineer', 2],
  Architect: ['architect', 2],
  Dentist: ['doctor', 1],
  'Software engineer': ['software_engineer', 1],
  Lawyer: ['lawyer', 1],
  'Bank manager': ['bank_teller', 4],
  Professor: ['professor', 2],
  Surgeon: ['doctor', 2],
  'Company founder': ['corporate_executive', 3],
  'Investment banker': ['investment_banker', 2],
  'Hotel owner': ['hotel_staff', 3],
  'Corporate executive': ['corporate_executive', 2],
};
