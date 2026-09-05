import { Service, signal } from '@angular/core';
import { Geolocation } from "@capacitor/geolocation";

@Service()
export class Geo {

  // liveLatLong = signal<{lat:number, lng:number} | null > (null))
  liveLatLong = signal<any> (null);
  private watchId: string | null = null;
  private simulationInterval: any = null;

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
      };
    } catch (error) {
      console.log("error", error);
      return {
        lat: 0,
        lng: 0
      };
    }
  }

  // real time location changes and updating it to the api
  async watchLatLong(){
    this.stopSimulation(); // Stop simulation if it is currently running
    this.watchId = await Geolocation.watchPosition(
      { enableHighAccuracy: true, timeout: 10000 }, 
      (position) => {
        this.liveLatLong.set({
          lats: position?.coords.latitude,
          lngs: position?.coords.longitude
        });
        console.log(this.liveLatLong());
      }
    );
    console.log('📍 Real GPS Tracking started, watchId:', this.watchId);
    return this.watchId;
  }

  // Stop real-time GPS tracking
  async stopWatching(){
    if (this.watchId) {
      await Geolocation.clearWatch({ id: this.watchId });
      this.watchId = null;
      console.log('🛑 Real GPS Tracking stopped');
    }
  }

  // 🚶 Walking Simulation: Simulates walking step-by-step from a starting position
  simulateWalking(startLat: number = 14.5995, startLng: number = 120.9842, intervalMs: number = 1500) {
    this.stopWatching(); // Stop real GPS watching if active
    this.stopSimulation();

    let currentLat = startLat;
    let currentLng = startLng;

    // Set initial position
    this.liveLatLong.set({
      lats: currentLat,
      lngs: currentLng
    });

    // ~8-10 meters per step in latitude/longitude
    const stepSize = 0.00008;

    this.simulationInterval = setInterval(() => {
      // Small random heading variation to simulate realistic walking path
      const jitterLat = (Math.random() - 0.3) * 0.00002;
      const jitterLng = (Math.random() - 0.3) * 0.00002;

      currentLat += stepSize + jitterLat;
      currentLng += stepSize + jitterLng;

      this.liveLatLong.set({
        lats: currentLat,
        lngs: currentLng
      });

      console.log('🚶 Simulated Walk:', { lats: currentLat, lngs: currentLng });
    }, intervalMs);
  }

  // Stop walking simulation
  stopSimulation() {
    if (this.simulationInterval) {
      clearInterval(this.simulationInterval);
      this.simulationInterval = null;
      console.log('🛑 Walking simulation stopped');
    }
  }
}
