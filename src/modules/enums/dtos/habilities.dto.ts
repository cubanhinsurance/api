export class HabilityReqDto {
  name: string;
}

export class CreateHabilityDto {
  name: string;
  description?: string;
  requirements?: HabilityReqDto[];
}

export class CreateHabilityGroupDto {
  name: string;
}
