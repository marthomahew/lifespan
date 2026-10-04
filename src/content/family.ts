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
