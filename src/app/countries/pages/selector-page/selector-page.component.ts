import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { CountriesService } from './../../services/countries.service';
import { Region, SmallCountry } from '../../interfaces/country.interfaces';
import { filter, Observable, switchMap, tap } from 'rxjs';

@Component({
  selector: 'app-selector-page',
  templateUrl: './selector-page.component.html',
})
export class SelectorPageComponent implements OnInit{


  public countriesByRegion: SmallCountry[] = [];
  public borders: SmallCountry[] = [];
  public myForm: FormGroup;

  
  constructor(
    private fb: FormBuilder,
    private countriesService:CountriesService,
  ){
    this.myForm = this.fb.group({
      region:  ['', Validators.required],
      country: ['', Validators.required],
      border: ['', Validators.required],
    })
  }

  ngOnInit(): void {
      this.onRegionChanged();
      this.onCountryChanged();
  }

  get regions(): Region[]{
    return this.countriesService.regions;
  }

  onRegionChanged(): void{
    this.myForm.get('region')!.valueChanges
    .pipe(
      // limpieza
      tap( () => this.myForm.get(['country'])!.setValue('') ),
      tap( () => this.borders = []),
      switchMap( (region) => this.countriesService.getContriesByRegion(region ) )
    )
    .subscribe(
      contries => {
        this.countriesByRegion = contries;
      }
    );
  }

  onCountryChanged():void{
    this.myForm.get('country')!.valueChanges
    .pipe(
      // tap efectos secundarios
      tap( () => this.myForm.get(['border'])!.setValue('') ),
      // filter es filtro
      filter( (value: string) => value.length > 0 ),
      // switchmap recibe obs y para enviarlo a otro obs
      switchMap( (alphaCode) => this.countriesService.getCountryByAlphaCode(alphaCode ) ),
      // los switchmap cancela el proce si los anteriores demoran mucho
      switchMap( (country) => this.countriesService.getCountryBordersByCodes( country.borders ) ),
    )
    .subscribe(
      countries => {
        this.borders = countries;
      }
    );
  }

  
}
