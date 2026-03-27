import { ApiProperty } from '@nestjs/swagger';

export class RegulationDto {
    @ApiProperty() public id!: string;
    @ApiProperty() public originalName!: string;
    @ApiProperty() public mimeType!: string;
    @ApiProperty() public size!: number;
    @ApiProperty() public createdAt!: Date;
}

export class GetRegulationsResponseDto {
    @ApiProperty({ type: [RegulationDto] }) public regulations!: RegulationDto[];
}

export class DeleteRegulationResponseDto {
    @ApiProperty() public message!: string;
}

export class UploadRegulationResponseDto {
    @ApiProperty() public message!: string;
    @ApiProperty({ type: RegulationDto }) public regulation!: RegulationDto;
}
