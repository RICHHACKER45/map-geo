import { AfterViewInit, Component, inject, ChangeDetectorRef, effect } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonFooter, IonAlert, IonButton } from '@ionic/angular';
import * as l from 'leaflet';
import { Geolocation } from '@capacitor/geolocation';
import { Geo } from '../services/geo';


@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, IonFooter, IonAlert, IonButton],
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
  liveMarker!:l.CircleMarker;
  liveLine!:l.Polyline;
  
  geoService = inject(Geo);

  constructor(){
    // this.geoService.watchLatLong();
    effect(() => {
      console.log(this.geoService.liveLatLong());
      this.livePosition = this.geoService.liveLatLong();
      this.cdr.detectChanges();

      if (this.livePosition) {
        if(!this.liveMarker){
          this.liveMarker = l.circleMarker([
            this.livePosition?.lats,
            this.livePosition?.lngs],
            {
              radius:5,
              color: '#4476e3',
              fillColor: '#4476e3',
              fillOpacity: 0.5,
              stroke:true,
              weight:3
            }).addTo(this.map);
        }else{
          this.liveMarker.setLatLng([
            this.livePosition?.lats,
            this.livePosition?.lngs
          ])
        }

        const convertedPos1 = l.latLng(this.startingPositionX.lat,this.startingPositionX.lng);
        const convertedPos2 = l.latLng(this.livePosition.lats,this.livePosition.lngs);

        const distance = convertedPos1.distanceTo(convertedPos2).toFixed(2);
        console.log(distance)

        if (!this.liveLine) {
          this.liveLine = l.polyline([convertedPos1,convertedPos2]).addTo(this.map);
        }else{
          this.liveLine.setLatLngs([convertedPos1,convertedPos2]);
        }
        
        // setting tooltip to display the distance between the two points
        this.liveLine.bindTooltip(`${distance}m` , {permanent:true, direction:'top'});
      }
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

  // ==========================================
  // SEPARATION OF CONCERNS: CONTROL HANDLERS
  // ==========================================

  // --- Real-time GPS Tracking ---
  startTracking() {
    console.log('Starting real GPS tracking...');
    this.geoService.watchLatLong();
  }

  stopTracking() {
    console.log('Stopping real GPS tracking...');
    this.geoService.stopWatching();
  }

  // --- Walking Simulation (Laboratory Testing) ---
  startSimulation() {
    if (this.startingPositionX) {
      console.log('Starting walking simulation...');
      this.geoService.simulateWalking(
        this.startingPositionX.lat,
        this.startingPositionX.lng
      );
    }
  }

  stopSimulation() {
    console.log('Stopping walking simulation...');
    this.geoService.stopSimulation();
  }
}
