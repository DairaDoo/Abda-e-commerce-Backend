import { Controller, Get, Injectable, Query } from '@nestjs/common';
import { FilterService } from './filter.service';
import { GeneralProductDTO } from 'src/dto/products_dto';

@Injectable()
@Controller('/api/products/filter')
export class FilterController {
  constructor(private readonly filterService: FilterService) { }

  @Get()
  async filterProducts(
    @Query('brand_name') brandName?: string,
    @Query('section_name') sectionName?: string,
    @Query('color_name') colorName?: string,
    @Query('min_value') minValue?: string,
    @Query('max_value') maxValue?: string
  ): Promise<GeneralProductDTO[]> {
    console.log('Brand:', brandName);
    console.log('Section:', sectionName);
    console.log('Color:', colorName);
    console.log('Min Value:', minValue);
    console.log('Max Value:', maxValue);

    return this.filterService.filterProducts({
      brand: brandName,
      section: sectionName,
      color: colorName,
      minValue: minValue ? parseFloat(minValue) : undefined,
      maxValue: maxValue ? parseFloat(maxValue) : undefined
    });
  }

  @Get('brands')
  async getBrands() {
    return this.filterService.getAllBrands()
  }
  @Get('colors')
  async getColors() {
    return this.filterService.getAllColors()
  }


  @Get('sections')
  async getSections() {
    return this.filterService.getAllSections()

  }


}
