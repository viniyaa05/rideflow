import React, { useState } from 'react';
import { 
  Code2, 
  Send, 
  Copy, 
  Check, 
  Sparkles, 
  ShieldCheck, 
  Clock, 
  Layers, 
  Globe, 
  Terminal, 
  KeyRound, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { estimateRoute, getRouteComparison } from '../utils/fareEstimator';
import { calculateSurgeMultiplier, calculateCarbonOffset, calculateGstBreakdown } from '../utils/surgePricing';

const API_ENDPOINTS = [
  {
    id: 'routes_estimate',
    method: 'GET',
    path: '/api/v1/routes/estimate',
    title: 'Calculate Multi-Modal Route & Fares',
    description: 'Computes road distance, transit duration, traffic surge index, and comparative pricing across Driver vs Carpool vs Rental.',
    requiresAuth: false,
    params: {
      origin: 'Chennai Central Railway Station (600003)',
      destination: 'OMR IT Expressway - Sholinganallur (600119)',
      persona: 'urgent'
    }
  },
  {
    id: 'fleet_drivers',
    method: 'GET',
    path: '/api/v1/fleet/drivers',
    title: 'Query Commercial Driver Captains',
    description: 'Returns real-time roster of commercial badge captains with verified Tamil Nadu RTO registration numbers.',
    requiresAuth: true,
    params: {
      city: 'Chennai',
      minRating: '4.85'
    }
  },
  {
    id: 'carpool_reserve',
    method: 'POST',
    path: '/api/v1/carpool/reserve',
    title: 'Dynamic Carpool Seat Reservation',
    description: 'Reserves a passenger seat, atomically locks inventory, and generates real-time host notification.',
    requiresAuth: true,
    body: {
      carpoolId: 'pool-1',
      seats: 1,
      paymentMethod: 'wallet',
      passengerNote: 'Corner pickup at signal'
    }
  },
  {
    id: 'safety_sos',
    method: 'POST',
    path: '/api/v1/safety/sos-dispatch',
    title: 'Emergency SOS Telemetry Protocol',
    description: 'Dispatches high-priority panic telemetry and GPS coordinate broadcast to emergency responder matrix.',
    requiresAuth: true,
    body: {
      incidentType: 'EMERGENCY_PANIC',
      latitude: 12.9716,
      longitude: 80.2447,
      corridor: 'OMR Elevated Tollway'
    }
  },
  {
    id: 'admin_analytics',
    method: 'GET',
    path: '/api/v1/admin/analytics',
    title: 'Platform Transit & Revenue Analytics',
    description: 'Returns aggregated GMV, GST collections, and regional corridor volume metrics. (Restricted to SUPER_ADMIN role).',
    requiresAuth: true,
    params: {
      region: 'Tamil Nadu',
      timeframe: 'current_month'
    }
  }
];

export default function ApiSandboxView() {
  const { user, jwtToken, drivers, carpools } = useAuth();
  
  const [selectedEndpoint, setSelectedEndpoint] = useState(API_ENDPOINTS[0]);
  const [requestPayload, setRequestPayload] = useState(JSON.stringify(API_ENDPOINTS[0].body || API_ENDPOINTS[0].params, null, 2));
  const [responseOutput, setResponseOutput] = useState(null);
  const [responseStatus, setResponseStatus] = useState(null);
  const [responseTimeMs, setResponseTimeMs] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedCurl, setCopiedCurl] = useState(false);

  const handleSelectEndpoint = (endpoint) => {
    setSelectedEndpoint(endpoint);
    setRequestPayload(JSON.stringify(endpoint.body || endpoint.params, null, 2));
    setResponseOutput(null);
    setResponseStatus(null);
    setResponseTimeMs(null);
  };

  const executeApiRequest = () => {
    setIsLoading(true);
    const startTime = performance.now();

    setTimeout(() => {
      let parsedInput = {};
      try {
        parsedInput = JSON.parse(requestPayload);
      } catch {
        parsedInput = selectedEndpoint.params || {};
      }

      let resData = {};
      let status = 200;

      // Endpoint 1: Route Estimator
      if (selectedEndpoint.id === 'routes_estimate') {
        const origin = parsedInput.origin || 'Chennai Central Railway Station';
        const dest = parsedInput.destination || 'OMR IT Expressway';
        const persona = parsedInput.persona || 'urgent';
        const comp = getRouteComparison(origin, dest, persona);
        const surge = calculateSurgeMultiplier(origin, dest);
        const carbon = calculateCarbonOffset(comp.route.distanceKm, 'carpool');

        resData = {
          success: true,
          status: 'SUCCESS',
          corridor: 'Tamil Nadu Regional Network',
          route: {
            origin,
            destination,
            distanceKm: comp.route.distanceKm,
            durationMins: comp.route.durationMins,
            surgeMetrics: surge,
            carbonOffset: carbon
          },
          recommendedMode: comp.recommendedMode,
          fares: {
            driverPrivateInr: comp.driverDetails.total,
            carpoolPerSeatInr: comp.carpoolDetails.totalPerSeat,
            rentalHourlyInr: comp.rentalDetails.hourlyRate
          },
          gstBreakdown: calculateGstBreakdown(comp.driverDetails.total),
          timestamp: new Date().toISOString()
        };
      }
      // Endpoint 2: Drivers Roster
      else if (selectedEndpoint.id === 'fleet_drivers') {
        resData = {
          success: true,
          totalCaptains: drivers.length,
          captains: drivers.map((d) => ({
            id: d.id,
            name: d.name,
            vehicleModel: d.vehicleModel,
            licensePlate: d.licensePlate,
            rating: d.rating,
            trips: d.trips,
            city: d.city,
            commercialBadgeVerified: true
          })),
          timestamp: new Date().toISOString()
        };
      }
      // Endpoint 3: Carpool Reserve
      else if (selectedEndpoint.id === 'carpool_reserve') {
        resData = {
          success: true,
          bookingReference: 'RF-RES-' + Math.floor(100000 + Math.random() * 900000),
          status: 'CONFIRMED',
          message: 'Seat allocated successfully. Host notified.',
          inventoryLockExpiresSec: 900,
          passenger: user?.name || 'Verified Rider',
          timestamp: new Date().toISOString()
        };
      }
      // Endpoint 4: Safety SOS
      else if (selectedEndpoint.id === 'safety_sos') {
        resData = {
          success: true,
          protocol: 'TN_POLICE_112_INTEROP',
          status: 'DISPATCHED',
          incidentTicket: 'SOS-TN-' + Date.now().toString().slice(-6),
          telemetry: {
            lat: parsedInput.latitude || 12.9716,
            lng: parsedInput.longitude || 80.2447,
            corridor: parsedInput.corridor || 'OMR Tollway',
            timestamp: new Date().toISOString()
          },
          responderChannel: 'Encrypted Radio Bridge Active'
        };
      }
      // Endpoint 5: Admin Analytics
      else if (selectedEndpoint.id === 'admin_analytics') {
        if (!user?.isAdmin) {
          status = 403;
          resData = {
            error: 'FORBIDDEN',
            message: 'Requires SUPER_ADMIN role claim in JWT token payload.',
            currentRole: user?.isAdmin ? 'SUPER_ADMIN' : 'RIDER'
          };
        } else {
          resData = {
            success: true,
            networkMetrics: {
              activeCorridors: 8,
              dailyActiveRiders: 14250,
              totalMonthlyGMVInr: 2845000,
              platformCommissionTakeInr: 284500,
              gstCollectedInr: 142250,
              co2PreventedTons: 48.6
            },
            timestamp: new Date().toISOString()
          };
        }
      }

      const elapsed = Math.round(performance.now() - startTime);
      setResponseStatus(status);
      setResponseTimeMs(elapsed);
      setResponseOutput(JSON.stringify(resData, null, 2));
      setIsLoading(false);
    }, 400);
  };

  const getCurlSnippet = () => {
    const isPost = selectedEndpoint.method === 'POST';
    const baseUrl = 'https://api.rideflow.mobility.in';
    const authHeader = selectedEndpoint.requiresAuth ? ` \\\n  -H "Authorization: Bearer ${jwtToken || 'YOUR_JWT_TOKEN'}"` : '';
    const bodyPart = isPost ? ` \\\n  -H "Content-Type: application/json" \\\n  -d '${requestPayload.replace(/\n\s*/g, '')}'` : '';
    return `curl -X ${selectedEndpoint.method} "${baseUrl}${selectedEndpoint.path}"${authHeader}${bodyPart}`;
  };

  const copyCurl = () => {
    navigator.clipboard.writeText(getCurlSnippet());
    setCopiedCurl(true);
    setTimeout(() => setCopiedCurl(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      
      {/* Header Banner */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-200 bg-white/95 space-y-4 shadow-md relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-extrabold uppercase tracking-wider mb-2">
              <Code2 className="w-3.5 h-3.5" />
              Developer API Sandbox • Swagger 3.0 Interop
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Interactive REST API Explorer
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 font-medium">
              Inspect and test live endpoints, generate cURL commands, and evaluate JWT Bearer token authentication in real-time.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-slate-100 border border-slate-200 px-3.5 py-2 rounded-2xl">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span className="text-xs text-slate-800 font-extrabold">Auth: JWT HS256 Enabled</span>
          </div>
        </div>
      </div>

      {/* Main Sandbox Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Endpoint Navigation Selector (4 cols) */}
        <div className="lg:col-span-4 space-y-3">
          <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider block px-1">
            Available API Endpoints ({API_ENDPOINTS.length})
          </span>

          <div className="space-y-2">
            {API_ENDPOINTS.map((endpoint) => {
              const isSelected = selectedEndpoint.id === endpoint.id;
              const isGet = endpoint.method === 'GET';

              return (
                <button
                  key={endpoint.id}
                  onClick={() => handleSelectEndpoint(endpoint)}
                  className={`w-full p-4 rounded-2xl border text-left transition-all flex flex-col gap-2 ${
                    isSelected
                      ? 'bg-blue-50/70 border-blue-400 ring-2 ring-blue-200/50 shadow-sm'
                      : 'bg-white hover:bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                        isGet ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {endpoint.method}
                    </span>
                    {endpoint.requiresAuth && (
                      <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded border border-purple-200">
                        JWT Bearer
                      </span>
                    )}
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-slate-900 leading-snug">{endpoint.title}</h4>
                    <code className="text-[11px] font-mono text-slate-500 mt-0.5 block">{endpoint.path}</code>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Interactive Request Editor & Live Response Viewer (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Active Endpoint Overview & cURL generator */}
          <div className="glass-panel p-6 rounded-3xl border border-slate-200 bg-white space-y-4 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-1 rounded-xl text-xs font-black uppercase ${
                    selectedEndpoint.method === 'GET' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {selectedEndpoint.method}
                  </span>
                  <code className="text-sm font-mono font-extrabold text-slate-900">{selectedEndpoint.path}</code>
                </div>
                <p className="text-xs text-slate-600 mt-1.5 font-medium">{selectedEndpoint.description}</p>
              </div>

              <button
                onClick={executeApiRequest}
                disabled={isLoading}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isLoading ? 'Executing...' : 'Send Request'}</span>
              </button>
            </div>

            {/* Generated cURL command */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-bold text-slate-500 flex items-center gap-1">
                  <Terminal className="w-3.5 h-3.5 text-slate-600" />
                  Generated cURL Command
                </span>
                <button
                  onClick={copyCurl}
                  className="text-blue-700 hover:text-blue-900 font-bold flex items-center gap-1"
                >
                  {copiedCurl ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCurl ? 'Copied cURL!' : 'Copy cURL'}</span>
                </button>
              </div>

              <pre className="p-3 rounded-2xl bg-slate-900 text-slate-200 font-mono text-[11px] overflow-x-auto leading-relaxed select-all">
                {getCurlSnippet()}
              </pre>
            </div>
          </div>

          {/* Request Payload Editor & Live Response Window */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Request Body / Params Editor */}
            <div className="glass-panel p-5 rounded-3xl border border-slate-200 bg-white space-y-2 flex flex-col">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Code2 className="w-3.5 h-3.5 text-blue-600" />
                Request Payload (JSON)
              </span>

              <textarea
                rows={10}
                value={requestPayload}
                onChange={(e) => setRequestPayload(e.target.value)}
                className="w-full flex-1 p-3 bg-slate-50 border border-slate-300 rounded-2xl font-mono text-[11px] text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-400 focus:outline-none resize-none leading-relaxed"
              />
            </div>

            {/* Live Response Viewer */}
            <div className="glass-panel p-5 rounded-3xl border border-slate-200 bg-white space-y-2 flex flex-col">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-emerald-600" />
                  Live Response
                </span>

                {responseStatus && (
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-black ${
                      responseStatus === 200 ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {responseStatus} {responseStatus === 200 ? 'OK' : 'DENIED'}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">{responseTimeMs}ms</span>
                  </div>
                )}
              </div>

              {responseOutput ? (
                <pre className="w-full flex-1 p-3 bg-slate-900 text-emerald-400 border border-slate-800 rounded-2xl font-mono text-[11px] overflow-auto max-h-72 leading-relaxed">
                  {responseOutput}
                </pre>
              ) : (
                <div className="w-full flex-1 p-8 bg-slate-50 border border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-center text-slate-400">
                  <Send className="w-6 h-6 mb-2 opacity-50 text-blue-500" />
                  <p className="text-xs font-medium">Click "Send Request" to execute this API endpoint.</p>
                </div>
              )}
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
