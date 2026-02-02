export enum ServiceCategory {
  Nursing = 1,
  Medical = 2,
  Rehabilitation = 3,
  PersonalCare = 4,
  Emergency = 5,
  Other = 6
}

export enum CareServiceStatus {
  Planned = 1,
  Completed = 2,
  Canceled = 3
}

export interface ServiceDefinition {
  id: number;
  title: string;
  category: ServiceCategory;
  description: string;
  isActive: boolean;
}

export interface CreateServiceDefinition {
  title: string;
  category: ServiceCategory;
  description: string;
  isActive: boolean;
}

export interface UpdateServiceDefinition extends CreateServiceDefinition {}
