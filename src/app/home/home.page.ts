import { AfterViewInit, Component, inject, ChangeDetectorRef, effect } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonFooter, IonAlert } from '@ionic/angular';
import * as l from 'leaflet';
import {Geolocation} from '@capacitor/geolocation';
import { Geo } from '../services/geo';


@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, IonFooter, IonAlert],
})
export class HomePage implements AfterViewInit{
  // map variable from leaflet
  map!: l.Map;
  errorMessage = 'unable to fetch your location'
  headerMessage = 'Geolocation Api Error'
  isAlertOpen = false;
  startingPositionX!:any;
  private cdr = inject(ChangeDetectorRef);
  livePosition!:any;
  
  geoService = inject(Geo);

  constructor(){
    this.geoService.watchLatLong();
    effect(() => {
      console.log(this.geoService.liveLatLong());
      this.livePosition = this.geoService.liveLatLong();
      this.cdr.detectChanges();

      l.circleMarker([this.livePosition?.lats, this.livePosition?.lngs],{
        radius: 5,
        color:'#4476e3',
        fillColor: '#4476e3',
        fillOpacity: 0.5,
        stroke: true,
        weight: 3
        
      }).addTo(this.map); 
    })
  }
  
  mapInit(){
    // Initializing map
    this.map = l.map('map' ,{
      // this is to be followed with lat and long
      center: [this.startingPositionX.lat, this.startingPositionX.lng], //initial center of the map 
      zoom : 19
    })
    
    // adding map tiles from openstreetmap
    l.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(this.map);

    l.circleMarker([this.startingPositionX.lat, this.startingPositionX.lng], {
      // defining marker size and color
      radius: 5,
      color:'#4476e3',
      fillColor: '#4476e3',
      fillOpacity: 0.5,
      stroke: true,
      weight: 3
      
    }).addTo(this.map);

    // setting interval to invalidate size of map 
    setInterval(() => {
     this.map.invalidateSize(); 
     }, 200);
  }
  // lifecycle hook
  async ngAfterViewInit() {
    const startingPosition = await this.geoService.getLatLong();
    if(startingPosition === null){
      this.isAlertOpen = true;
    }else{
    console.log(startingPosition);
    this.startingPositionX = startingPosition;
    this.cdr.detectChanges();
    this.mapInit();
  }
  }
}
