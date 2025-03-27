import React, { useState, useEffect } from "react";
import { createBrowserClient } from "@supabase/ssr";
import "./ChildSafety.css";
import { GoogleMap, useJsApiLoader, Marker } from "@react-google-maps/api";

const createClient = () => {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
};
const supabase = createClient();

const ChildSafety = () => {
  const [incident, setIncident] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [loadingState, setLoadingState] = useState("initializing");
  const [currentLocation, setCurrentLocation] = useState(null);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY!,
  });

  useEffect(() => {
    // Get current location
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.error("Error getting location:", error);
          setLoadingState("location error: " + error.message);
        }
      );
    } else {
      setLoadingState("geolocation not supported");
    }
  }, []);

  useEffect(() => {
    async function fetchLatestIncident() {
      setLoadingState("fetching incident");

      try {
        const { data, error } = await supabase
          .from("crash_incidents")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(1);

        if (error) {
          console.error("Error fetching incident:", error);
          setLoadingState("error: " + error.message);
          return;
        }

        if (!data || data.length === 0) {
          setLoadingState("no incident data found");
          return;
        }

        setIncident(data[0]);

        if (data[0].audio_url) {
          setAudioUrl(data[0].audio_url);
          setLoadingState("audio URL set");
        } else {
          setLoadingState("no audio URL in incident data");
        }
      } catch (err) {
        console.error("Unexpected error:", err);
        setLoadingState("unexpected error: " + err.message);
      }
    }

    fetchLatestIncident();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return `${date.getHours()}:${date
      .getMinutes()
      .toString()
      .padStart(2, "0")} am, ${date.getDate()} ${date.toLocaleString("en-US", {
      month: "long",
    })} ${date.getFullYear()}`;
  };

  const getMapCenter = () => {
    if (incident && incident.latitude && incident.longitude) {
      return {
        lat: incident.latitude,
        lng: incident.longitude,
      };
    }
    return (
      currentLocation || {
        lat: 10.0522, // Default to MACE if no location available
        lng: 76.6199,
      }
    );
  };

  return (
    <div className="child-safety-container">
      {/* Map Card */}
      <div className="map-card">
        <div className="map-container">
          {isLoaded && (
            <GoogleMap
              mapContainerStyle={{ width: "100%", height: "156px" }}
              center={getMapCenter()}
              zoom={15}
            >
              <Marker position={getMapCenter()} />
            </GoogleMap>
          )}
          {/* {incident && (
            <div className="coordinates">
              Lat: {incident.latitude} | Long: {incident.longitude}
            </div>
          )} */}
        </div>
        <div className="location-info">
          <div className="location-name">MACE</div>
          <div className="location-detail">Kothamangalam, Kerala</div>
        </div>
        <div className="fencing-input">
          <label htmlFor="fencing-radius">Set Fencing Radius: </label>
          <input
            type="number"
            id="fencing-radius"
            name="fencing-radius"
            placeholder="Enter radius in meters"
            className="fencing-radius-input"
          />
        </div>
        <button className="fencing-button">Set Fencing Radius</button>
      </div>
      {/* Status Section */}
      <div className="status-section">
        <div className="status-title">Current Status</div>
        <div className="status-details">
          <div className="status-row">
            <span className="status-label">location:</span>
            <span className="status-value">MACE, Kothamangalam, Kerala</span>
          </div>
          <div className="status-row">
            <span className="status-label">Time:</span>
            <span className="status-value">
              {incident
                ? formatDate(incident.created_at)
                : "9:30 am, 1 March 2025"}
            </span>
          </div>
          <div className="status-alert">
            {incident ? "Threat Found" : "No threats found"}
          </div>
        </div>
      </div>
      {/* Voice Mail Section with Standard HTML Audio */}
      <div className="voicemail-section">
        <div className="voicemail-title">Voice Mail</div>

        {audioUrl ? (
          <audio
            controls
            src={audioUrl}
            className="standard-audio-player"
            style={{
              width: "100%",
              filter:
                "sepia(20%) saturate(70%) grayscale(1) contrast(99%) invert(12%)",
            }}
            onError={(e) => {
              console.error("Audio error:", e);
              const audioElement = e.target as HTMLAudioElement;
              setLoadingState(
                "audio error: " +
                  (audioElement.error
                    ? audioElement.error.message
                    : "unknown error")
              );
            }}
            onLoadedData={() => setLoadingState("audio loaded")}
          >
            Your browser does not support the audio element.
          </audio>
        ) : (
          <div className="audio-loading-state">{loadingState}</div>
        )}
      </div>
    </div>
  );
};

export default ChildSafety;
