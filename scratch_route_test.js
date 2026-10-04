const fetch = globalThis.fetch;

async function testLocal() {
  try {
    const geo1Res = await fetch('https://nominatim.openstreetmap.org/search?format=json&q=Chennai+Central+Railway+Station&limit=1', {
      headers: { 'User-Agent': 'RideFlow-Mobility-App/1.0' }
    });
    const geo1 = await geo1Res.json();

    const geo2Res = await fetch('https://nominatim.openstreetmap.org/search?format=json&q=Sholinganallur+Chennai&limit=1', {
      headers: { 'User-Agent': 'RideFlow-Mobility-App/1.0' }
    });
    const geo2 = await geo2Res.json();

    if (geo1[0] && geo2[0]) {
      const url = `https://router.project-osrm.org/route/v1/driving/${geo1[0].lon},${geo1[0].lat};${geo2[0].lon},${geo2[0].lat}?overview=false`;
      const osrmRes = await fetch(url);
      const osrm = await osrmRes.json();
      console.log('Chennai Central to Sholinganallur Distance (km):', (osrm.routes[0].distance / 1000).toFixed(1));
      console.log('Duration (mins):', Math.round(osrm.routes[0].duration / 60));
    }
  } catch(e) {
    console.error('Error:', e.message);
  }
}

testLocal();
