import { Service, signal } from '@angular/core';
import { Geolocation } from "@capacitor/geolocation";

@Service()
export class Geo {

  // liveLatLong = signal<{lat:number, lng:number} | null > (null))
  liveLatLong = signal<any> (null);

  // we are calling an api async function to get the latitude and longitude of the user
  // fixed one snapshot location
  async getLatLong(){
    try {
        const position = await Geolocation.getCurrentPosition({
            enableHighAccuracy: true,
            timeout: 10000,
        });
    return {
        lat : position.coords.latitude,
        lng : position.coords.longitude
    }
    } catch (error) {
        console.log("error");
        return{
            lat:0,
            lng:0
        }
    }
    
    
  }

  // real time location changes and updating it to the api
  async watchLatLong(){
    const watchId = await Geolocation.watchPosition({
      enableHighAccuracy: true, timeout: 10000}, 
      (position) => {
       this.liveLatLong.set({
        lats: position?.coords.latitude,
        lngs: position?.coords.longitude
       })
       console.log(this.liveLatLong)
    })
    return watchId;
  }
}
