"use client";

import { useState, useRef, useEffect } from "react";
import {
  initSpeechRecognition,
  speakText,
  stopSpeaking,
  getAvailableVoices,
} from "../../utils/speechUtils";
import { GoogleGenerativeAI } from "@google/generative-ai";
import "../App.css";

export default function DispatchCall() {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [liveTranscript, setLiveTranscript] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [callStatus, setCallStatus] = useState("idle"); // idle, calling, connected, ended
  const [error, setError] = useState("");
  const [conversationHistory, setConversationHistory] = useState([]);
  const [isListening, setIsListening] = useState(false);
  const [audioFile, setAudioFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [inputMode, setInputMode] = useState("unified"); // Changed to 'unified' from 'speech'
  const [isRecordingAudio, setIsRecordingAudio] = useState(false);
  const [audioChunks, setAudioChunks] = useState([]);
  const [audioBlob, setAudioBlob] = useState(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcription, setTranscription] = useState("");
  const [textInput, setTextInput] = useState("");
  const [isProcessingText, setIsProcessingText] = useState(false);
  const [showWaveform, setShowWaveform] = useState(false);
  const [audioVisualization, setAudioVisualization] = useState([]);
  const [showVoiceSettings, setShowVoiceSettings] = useState(false);
  const [voiceParams, setVoiceParams] = useState({
    rate: 1.0,
    pitch: 1.0,
    volume: 1.0,
    voiceURI: "",
  });
  const [availableVoices, setAvailableVoices] = useState([]);

  const recognitionRef = useRef(null);
  const conversationContainerRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioInputRef = useRef(null);
  const textInputRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const animationFrameRef = useRef(null);

  // Initialize Gemini API
  const genAI = useRef(null);
  const model = useRef(null);

  useEffect(() => {
    // Initialize Gemini API if API key is available
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_API_KEY;
    if (apiKey) {
      genAI.current = new GoogleGenerativeAI(apiKey);
      model.current = genAI.current.getGenerativeModel({
        model: "gemini-2.0-flash-lite",
      });
    }
  }, []);

  // Initialize speech recognition with faster response
  useEffect(() => {
    recognitionRef.current = initSpeechRecognition();

    if (recognitionRef.current) {
      // Set continuous to true for continuous recording
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onresult = (event) => {
        let interimTranscript = "";
        let finalTranscript = "";

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript + " ";
          } else {
            interimTranscript += transcript;
          }
        }

        // Update live transcript for display
        setLiveTranscript(interimTranscript);

        if (finalTranscript) {
          setTranscript((prev) => prev + finalTranscript.trim() + " ");
          setLiveTranscript(""); // Clear interim transcript when final is available

          // Don't auto-stop recording to allow for continuous speech
          // We'll let the user manually stop when they're done
        }
      };

      recognitionRef.current.onerror = (event) => {
        console.error("Speech recognition error", event.error);
        setError(`Speech recognition error: ${event.error}`);
        stopRecording();
      };

      recognitionRef.current.onend = () => {
        if (isListening) {
          try {
            recognitionRef.current.start();
          } catch (err) {
            console.error("Error restarting recognition:", err);
          }
        }
      };
    } else {
      setError("Speech recognition is not supported in this browser.");
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      stopSpeaking();
      if (
        mediaRecorderRef.current &&
        mediaRecorderRef.current.state === "recording"
      ) {
        mediaRecorderRef.current.stop();
      }
    };
  }, [isListening]);

  // Scroll to bottom of conversation when it updates
  useEffect(() => {
    if (conversationContainerRef.current) {
      conversationContainerRef.current.scrollTop =
        conversationContainerRef.current.scrollHeight;
    }
  }, [conversationHistory]);

  // Initialize audio recording with visualization
  const startAudioRecording = () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setError("Audio recording is not supported in this browser.");
      return;
    }

    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        setIsRecordingAudio(true);
        setShowWaveform(true);
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;

        // Set up audio visualization
        if (!audioContextRef.current) {
          audioContextRef.current = new (window.AudioContext ||
            window.webkitAudioContext)();
        }

        const audioContext = audioContextRef.current;
        const analyser = audioContext.createAnalyser();
        analyserRef.current = analyser;

        const source = audioContext.createMediaStreamSource(stream);
        source.connect(analyser);

        analyser.fftSize = 256;
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        const updateVisualization = () => {
          if (!analyserRef.current) return;

          analyserRef.current.getByteFrequencyData(dataArray);

          // Create a simplified array for visualization (just 10 values)
          const simplifiedArray = Array.from({ length: 10 }, (_, i) => {
            const start = Math.floor((i * bufferLength) / 10);
            const end = Math.floor(((i + 1) * bufferLength) / 10);
            let sum = 0;
            for (let j = start; j < end; j++) {
              sum += dataArray[j];
            }
            return Math.floor(sum / (end - start));
          });

          setAudioVisualization(simplifiedArray);
          animationFrameRef.current =
            requestAnimationFrame(updateVisualization);
        };

        updateVisualization();

        const chunks = [];
        mediaRecorder.ondataavailable = (e) => {
          if (e.data.size > 0) {
            chunks.push(e.data);
          }
        };

        mediaRecorder.onstop = () => {
          const blob = new Blob(chunks, { type: "audio/mp3" });
          setAudioBlob(blob);
          setAudioChunks(chunks);
          setIsRecordingAudio(false);
          setShowWaveform(false);

          // Create a file from the blob
          const file = new File([blob], "recording.mp3", { type: "audio/mp3" });
          setAudioFile(file);

          // Release the microphone
          stream.getTracks().forEach((track) => track.stop());

          // Stop visualization
          if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
          }

          // Process the audio file automatically
          uploadAudio(file, transcript);
        };

        mediaRecorder.start();
      })
      .catch((err) => {
        console.error("Error accessing microphone:", err);
        setError("Error accessing microphone. Please check your permissions.");
      });
  };

  const stopAudioRecording = () => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state === "recording"
    ) {
      mediaRecorderRef.current.stop();
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("audio/")) {
      setAudioFile(file);
    } else {
      setError("Please select a valid audio file.");
    }
  };

  // Load available voices
  useEffect(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      // Get initial voices
      const voices = getAvailableVoices();
      if (voices.length > 0) {
        setAvailableVoices(voices);
        // Set default voice if available
        const defaultVoice = voices.find(
          (voice) =>
            voice.name.includes("Google US English Female") ||
            voice.name.includes("Microsoft Zira") ||
            voice.name.includes("Natural") ||
            voice.name.includes("Female") ||
            voice.name.includes("Google")
        );
        if (defaultVoice) {
          setVoiceParams((prev) => ({
            ...prev,
            voiceURI: defaultVoice.voiceURI,
          }));
        }
      }

      // Listen for voices changed event
      window.speechSynthesis.onvoiceschanged = () => {
        const updatedVoices = getAvailableVoices();
        setAvailableVoices(updatedVoices);

        // Set default voice if not already set
        if (!voiceParams.voiceURI && updatedVoices.length > 0) {
          const defaultVoice = updatedVoices.find(
            (voice) =>
              voice.name.includes("Google US English Female") ||
              voice.name.includes("Microsoft Zira") ||
              voice.name.includes("Natural") ||
              voice.name.includes("Female") ||
              voice.name.includes("Google")
          );
          if (defaultVoice) {
            setVoiceParams((prev) => ({
              ...prev,
              voiceURI: defaultVoice.voiceURI,
            }));
          }
        }
      };
    }
  }, []);

  // Update the uploadAudio function to use voice parameters
  const uploadAudio = async (fileToUpload = null, transcriptText = "") => {
    const fileToProcess = fileToUpload || audioFile;

    if (!fileToProcess) {
      setError("Please select or record an audio file first.");
      return;
    }

    if (!model.current) {
      setError("Gemini API is not initialized. Please check your API key.");
      return;
    }

    try {
      setIsUploading(true);
      setTranscription("Processing audio...");
      setError(""); // Clear any previous errors

      // Show processing message in conversation
      const processingMessage = {
        role: "system",
        content: "Processing audio...",
        isProcessing: true,
      };
      setConversationHistory((prev) => [...prev, processingMessage]);

      // Read the audio file as base64
      const reader = new FileReader();

      // Create a promise to handle the FileReader
      const audioDataPromise = new Promise((resolve, reject) => {
        reader.onload = () => {
          const base64Data = reader.result.split(",")[1]; // Remove the data URL prefix
          resolve(base64Data);
        };
        reader.onerror = () => {
          reject(new Error("Failed to read audio file"));
        };
      });

      // Read the file as data URL
      reader.readAsDataURL(fileToProcess);

      // Wait for the file to be read
      const base64Data = await audioDataPromise;

      // Format conversation history for context
      const formattedHistory = conversationHistory
        .filter((msg) => !msg.isProcessing)
        .map(
          (msg) =>
            `${msg.role === "user" ? "Caller" : "Dispatch"}: ${msg.content}`
        )
        .join("\n");

      // Create system prompt
      const systemPrompt = `You are an emergency dispatch AI assistant. Your job is to:
1. Remain calm and professional at all times
2. Gather essential information about the emergency
3. Provide clear instructions to the caller
4. Reassure the caller that help is on the way
5. Keep responses concise and focused on the emergency at hand
6. Ask for location, nature of emergency, and any immediate dangers
7. Provide first aid instructions if needed

${formattedHistory ? `Previous conversation:\n${formattedHistory}\n\n` : ""}
The caller has sent an audio message. ${
        transcriptText ? `The transcript is: "${transcriptText}"` : ""
      }
Please respond as if you are speaking to the caller directly. Keep your response brief, focused, and helpful. Do not include any prefixes like "Dispatch:" in your response.`;

      // Create a part for the audio file
      const audioData = {
        inlineData: {
          data: base64Data,
          mimeType: fileToProcess.type || "audio/mp3",
        },
      };

      // Process with Gemini
      const result = await model.current.generateContent([
        systemPrompt,
        audioData,
      ]);

      // Remove the processing message
      setConversationHistory((prev) => prev.filter((msg) => !msg.isProcessing));

      // Handle the response based on the Gemini API version
      let responseText;
      if (result && result.response) {
        if (typeof result.response.text === "function") {
          responseText = result.response.text();
        } else if (result.response.text !== undefined) {
          responseText = result.response.text;
        } else if (
          result.response.candidates &&
          result.response.candidates.length > 0
        ) {
          responseText = result.response.candidates[0].content.parts[0].text;
        } else {
          responseText = "I'm sorry, I couldn't process your audio.";
          console.error("Unexpected response format:", result);
        }
      } else {
        responseText = "I'm sorry, I couldn't process your audio.";
        console.error("Invalid response:", result);
      }

      const audioTranscription = "[Audio processed directly by Gemini]";

      setTranscription(audioTranscription);

      // Add user message with transcription for audio
      const userMessage = {
        role: "user",
        content: audioTranscription,
        isAudio: true,
      };

      // Add AI response to conversation history
      const aiMessage = { role: "assistant", content: responseText };
      setConversationHistory((prev) => [...prev, userMessage, aiMessage]);

      setAiResponse(responseText);

      // Speak the response with voice parameters
      setIsSpeaking(true);
      speakText(
        responseText,
        () => {
          setIsSpeaking(false);
          if (callStatus === "connected") {
            // Reset for next input
            setAudioFile(null);
            if (audioInputRef.current) {
              audioInputRef.current.value = "";
            }
          }
        },
        () => {
          setIsSpeaking(true);
        },
        voiceParams
      );
    } catch (err) {
      setError("Error processing your audio: " + err.message);
      console.error("Error:", err);

      // Remove the processing message
      setConversationHistory((prev) => prev.filter((msg) => !msg.isProcessing));
    } finally {
      setIsUploading(false);
    }
  };

  const startRecording = () => {
    // In unified mode, we start both speech recognition and audio recording
    setIsRecording(true);
    setTranscript("");
    setError("");
    setIsListening(true);
    setShowWaveform(true);

    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
      } catch (err) {
        console.error("Error starting recognition:", err);
      }
    }

    // Also start audio recording for sending to Gemini
    startAudioRecording();
  };

  const stopRecording = async () => {
    setIsListening(false);
    setShowWaveform(false);

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (err) {
        console.error("Error stopping recognition:", err);
      }
    }

    setIsRecording(false);

    // Stop audio recording
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state === "recording"
    ) {
      mediaRecorderRef.current.stop();
    }

    // Stop visualization
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    // We don't need to process transcript here as it will be handled by the audio recording stop event
  };

  // Update the processTranscript function to use voice parameters
  const processTranscript = async () => {
    try {
      setIsProcessing(true);

      if (!model.current) {
        setError("Gemini API is not initialized. Please check your API key.");
        return;
      }

      // Format conversation history for context
      const formattedHistory = conversationHistory
        .map(
          (msg) =>
            `${msg.role === "user" ? "Caller" : "Dispatch"}: ${msg.content}`
        )
        .join("\n");

      // Create system prompt
      const systemPrompt = `You are an emergency dispatch AI assistant. Your job is to:
1. Remain calm and professional at all times
2. Gather essential information about the emergency
3. Provide clear instructions to the caller
4. Reassure the caller that help is on the way
5. Keep responses concise and focused on the emergency at hand
6. Ask for location, nature of emergency, and any immediate dangers
7. Provide first aid instructions if needed

${formattedHistory ? `Previous conversation:\n${formattedHistory}\n\n` : ""}
Caller's latest message: ${transcript}

Respond as if you are speaking to the caller directly. Keep your response brief, focused, and helpful. Do not include any prefixes like "Dispatch:" in your response.`;

      // Process with Gemini
      const result = await model.current.generateContent(systemPrompt);

      // Handle the response based on the Gemini API version
      let responseText;
      if (result && result.response) {
        if (typeof result.response.text === "function") {
          responseText = result.response.text();
        } else if (result.response.text !== undefined) {
          responseText = result.response.text;
        } else if (
          result.response.candidates &&
          result.response.candidates.length > 0
        ) {
          responseText = result.response.candidates[0].content.parts[0].text;
        } else {
          responseText = "I'm sorry, I couldn't process your request.";
          console.error("Unexpected response format:", result);
        }
      } else {
        responseText = "I'm sorry, I couldn't process your request.";
        console.error("Invalid response:", result);
      }

      // Add AI response to conversation history
      const aiMessage = { role: "assistant", content: responseText };
      setConversationHistory((prev) => [...prev, aiMessage]);

      setAiResponse(responseText);

      // Speak the response with voice parameters
      setIsSpeaking(true);
      speakText(
        responseText,
        () => {
          setIsSpeaking(false);
          setTranscript("");
        },
        () => {
          setIsSpeaking(true);
        },
        voiceParams
      );
    } catch (err) {
      setError("Error getting response from Gemini: " + err.message);
      console.error("Error:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  // Update the initiateCall function to use voice parameters
  const initiateCall = () => {
    setCallStatus("calling");
    setConversationHistory([]);
    setAudioFile(null);

    // Simulate connecting to dispatch
    setTimeout(() => {
      setCallStatus("connected");

      // Add initial greeting to conversation
      const initialGreeting = "911 Emergency Dispatch. What's your emergency?";
      setConversationHistory([{ role: "assistant", content: initialGreeting }]);

      // Speak the greeting with voice parameters
      speakText(
        initialGreeting,
        () => {
          if (inputMode === "unified") {
            startRecording();
          }
        },
        () => {
          setIsSpeaking(true);
        },
        voiceParams
      );
    }, 2000);
  };

  const endCall = () => {
    if (inputMode === "unified") {
      stopRecording();
    } else if (isRecordingAudio) {
      stopAudioRecording();
    }
    setCallStatus("ended");
    stopSpeaking();
  };

  // Update the handleTextSubmit function to use voice parameters
  const handleTextSubmit = async (e) => {
    e.preventDefault();

    if (!textInput.trim()) return;

    try {
      setIsProcessingText(true);
      setError("");

      // Add user message to conversation history
      const userMessage = { role: "user", content: textInput };
      setConversationHistory((prev) => [...prev, userMessage]);

      if (!model.current) {
        setError("Gemini API is not initialized. Please check your API key.");
        return;
      }

      // Format conversation history for context
      const formattedHistory = conversationHistory
        .map(
          (msg) =>
            `${msg.role === "user" ? "Caller" : "Dispatch"}: ${msg.content}`
        )
        .join("\n");

      // Create system prompt
      const systemPrompt = `You are an emergency dispatch AI assistant. Your job is to:
1. Remain calm and professional at all times
2. Gather essential information about the emergency
3. Provide clear instructions to the caller
4. Reassure the caller that help is on the way
5. Keep responses concise and focused on the emergency at hand
6. Ask for location, nature of emergency, and any immediate dangers
7. Provide first aid instructions if needed

${formattedHistory ? `Previous conversation:\n${formattedHistory}\n\n` : ""}
Caller's latest message: ${textInput}

Respond as if you are speaking to the caller directly. Keep your response brief, focused, and helpful. Do not include any prefixes like "Dispatch:" in your response.`;

      // Process with Gemini
      const result = await model.current.generateContent(systemPrompt);

      // Handle the response based on the Gemini API version
      let responseText;
      if (result && result.response) {
        if (typeof result.response.text === "function") {
          responseText = result.response.text();
        } else if (result.response.text !== undefined) {
          responseText = result.response.text;
        } else if (
          result.response.candidates &&
          result.response.candidates.length > 0
        ) {
          responseText = result.response.candidates[0].content.parts[0].text;
        } else {
          responseText = "I'm sorry, I couldn't process your request.";
          console.error("Unexpected response format:", result);
        }
      } else {
        responseText = "I'm sorry, I couldn't process your request.";
        console.error("Invalid response:", result);
      }

      // Add AI response to conversation history
      const aiMessage = { role: "assistant", content: responseText };
      setConversationHistory((prev) => [...prev, aiMessage]);

      setAiResponse(responseText);

      // Speak the response with voice parameters
      setIsSpeaking(true);
      speakText(
        responseText,
        () => {
          setIsSpeaking(false);
        },
        () => {
          setIsSpeaking(true);
        },
        voiceParams
      );

      // Clear text input
      setTextInput("");
    } catch (err) {
      setError("Error getting response from Gemini: " + err.message);
      console.error("Error:", err);
    } finally {
      setIsProcessingText(false);
    }
  };

  // Add a function to handle voice parameter changes
  const handleVoiceParamChange = (param, value) => {
    setVoiceParams((prev) => ({ ...prev, [param]: value }));
  };

  // Add a function to toggle voice settings panel
  const toggleVoiceSettings = () => {
    setShowVoiceSettings(!showVoiceSettings);
  };

  return (
    <div className="app-container">
      <div className="app-header">
        <div className="header-content">
          <div className="user-section">
            <span className="user-name">Emergency Dispatch</span>
            <div className="user-controls">
              {callStatus === "connected" && (
                <>
                  <button
                    onClick={toggleVoiceSettings}
                    className="settings-button"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M19.114 5.636a9 9 0 0 1 0 12.728M16.463 8.288a5.25 5.25 0 0 1 0 7.424M6.75 8.25l4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z" />
                    </svg>
                  </button>
                  <button
                    onClick={() =>
                      setInputMode(inputMode === "unified" ? "text" : "unified")
                    }
                    className="settings-button"
                  >
                    {inputMode === "unified" ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                        <line x1="16" y1="13" x2="8" y2="13" />
                        <line x1="16" y1="17" x2="8" y2="17" />
                        <polyline points="10 9 9 9 8 9" />
                      </svg>
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z" />
                      </svg>
                    )}
                  </button>
                </>
              )}
              <div className="status-indicator">
                {isRecording && "Recording..."}
                {isProcessing && "Processing..."}
                {isUploading && "Uploading..."}
                {isRecordingAudio && "Recording Audio..."}
              </div>
            </div>
          </div>
        </div>
      </div>

      <main className="app-content">
        <div className="dispatch-container">
          {/* Voice Settings Panel */}
          {showVoiceSettings && (
            <div className="voice-settings-panel">
              <div className="voice-settings-header">
                <h3>Voice Settings</h3>
                <button onClick={toggleVoiceSettings} className="close-button">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-5 h-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18 18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <div className="voice-settings-content">
                {/* Voice Selection */}
                <div className="setting-group">
                  <label htmlFor="voice-select">Voice</label>
                  <select
                    id="voice-select"
                    value={voiceParams.voiceURI}
                    onChange={(e) =>
                      handleVoiceParamChange("voiceURI", e.target.value)
                    }
                    className="voice-select"
                  >
                    {availableVoices.map((voice) => (
                      <option key={voice.voiceURI} value={voice.voiceURI}>
                        {voice.name} ({voice.lang})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Rate Slider */}
                <div className="setting-group">
                  <div className="setting-header">
                    <label htmlFor="rate-slider">
                      Speed: {voiceParams.rate.toFixed(1)}x
                    </label>
                    <button
                      onClick={() => handleVoiceParamChange("rate", 1.0)}
                      className="reset-button"
                    >
                      Reset
                    </button>
                  </div>
                  <input
                    id="rate-slider"
                    type="range"
                    min="0.5"
                    max="2"
                    step="0.1"
                    value={voiceParams.rate}
                    onChange={(e) =>
                      handleVoiceParamChange("rate", parseFloat(e.target.value))
                    }
                    className="slider"
                  />
                  <div className="slider-labels">
                    <span>Slow</span>
                    <span>Fast</span>
                  </div>
                </div>

                {/* Pitch Slider */}
                <div className="setting-group">
                  <div className="setting-header">
                    <label htmlFor="pitch-slider">
                      Pitch: {voiceParams.pitch.toFixed(1)}
                    </label>
                    <button
                      onClick={() => handleVoiceParamChange("pitch", 1.0)}
                      className="reset-button"
                    >
                      Reset
                    </button>
                  </div>
                  <input
                    id="pitch-slider"
                    type="range"
                    min="0.5"
                    max="1.5"
                    step="0.1"
                    value={voiceParams.pitch}
                    onChange={(e) =>
                      handleVoiceParamChange(
                        "pitch",
                        parseFloat(e.target.value)
                      )
                    }
                    className="slider"
                  />
                  <div className="slider-labels">
                    <span>Low</span>
                    <span>High</span>
                  </div>
                </div>

                {/* Volume Slider */}
                <div className="setting-group">
                  <div className="setting-header">
                    <label htmlFor="volume-slider">
                      Volume: {Math.round(voiceParams.volume * 100)}%
                    </label>
                    <button
                      onClick={() => handleVoiceParamChange("volume", 1.0)}
                      className="reset-button"
                    >
                      Reset
                    </button>
                  </div>
                  <input
                    id="volume-slider"
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={voiceParams.volume}
                    onChange={(e) =>
                      handleVoiceParamChange(
                        "volume",
                        parseFloat(e.target.value)
                      )
                    }
                    className="slider"
                  />
                  <div className="slider-labels">
                    <span>Quiet</span>
                    <span>Loud</span>
                  </div>
                </div>

                {/* Test Voice Button */}
                <button
                  onClick={() =>
                    speakText(
                      "This is a test of the emergency dispatch voice.",
                      () => {},
                      () => {},
                      voiceParams
                    )
                  }
                  className="test-voice-button"
                >
                  Test Voice
                </button>
              </div>
            </div>
          )}

          {/* Phone UI */}
          <div className="phone-container">
            {/* Call status bar */}
            <div className="call-status-bar">
              <div className="status-text">
                {callStatus === "idle" && "Ready to call"}
                {callStatus === "calling" && "Calling dispatch..."}
                {callStatus === "connected" && "Connected to AI Dispatch"}
                {callStatus === "ended" && "Call ended"}
              </div>
            </div>

            {/* Conversation area */}
            <div
              ref={conversationContainerRef}
              className="conversation-container"
            >
              {conversationHistory.length > 0 ? (
                conversationHistory.map((message, index) => (
                  <div
                    key={index}
                    className={`message-bubble ${
                      message.role === "user"
                        ? "user-message"
                        : message.role === "system"
                        ? "system-message"
                        : "assistant-message"
                    }`}
                  >
                    {message.isProcessing ? (
                      <div className="processing-message">
                        <div className="spinner"></div>
                        <p>
                          {typeof message.content === "function"
                            ? "Processing..."
                            : message.content}
                        </p>
                      </div>
                    ) : message.isAudio ? (
                      <div className="audio-message">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className="audio-icon"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z"
                          />
                        </svg>
                        <p>
                          {typeof message.content === "function"
                            ? "Message content unavailable"
                            : message.content}
                        </p>
                      </div>
                    ) : (
                      <p>
                        {typeof message.content === "function"
                          ? "Message content unavailable"
                          : message.content}
                      </p>
                    )}
                  </div>
                ))
              ) : (
                <>
                  {callStatus === "idle" && (
                    <div className="empty-state">
                      <p>Press the call button to connect to AI dispatch</p>
                    </div>
                  )}

                  {callStatus === "calling" && (
                    <div className="calling-state">
                      <p>Connecting to AI dispatch...</p>
                    </div>
                  )}
                </>
              )}

              {/* Enhanced recording visualization */}
              {showWaveform && (
                <div className="waveform-container">
                  <div className="recording-indicator">
                    <div className="recording-dot"></div>
                    <p>Recording...</p>
                  </div>

                  {/* Audio waveform visualization */}
                  <div className="waveform">
                    {audioVisualization.length > 0 ? (
                      <div className="waveform-bars">
                        {audioVisualization.map((value, i) => (
                          <div
                            key={i}
                            className="waveform-bar"
                            style={{
                              height: `${Math.max(15, value / 2)}%`,
                              animationDelay: `${i * 0.1}s`,
                            }}
                          ></div>
                        ))}
                      </div>
                    ) : (
                      <div className="waveform-bars">
                        {[...Array(10)].map((_, i) => (
                          <div
                            key={i}
                            className="waveform-bar"
                            style={{
                              height: `${20 + Math.random() * 60}%`,
                              animationDelay: `${i * 0.1}s`,
                            }}
                          ></div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Live transcript */}
                  <div className="transcript-container">
                    {transcript && (
                      <p className="transcript-text">{transcript}</p>
                    )}
                    {liveTranscript && (
                      <p className="live-transcript">{liveTranscript}</p>
                    )}
                    {!transcript && !liveTranscript && (
                      <p className="transcript-placeholder">Speak now...</p>
                    )}
                  </div>
                </div>
              )}

              {isSpeaking && (
                <div className="speaking-indicator">
                  <div className="speaking-text">Dispatch speaking</div>
                  <div className="speaking-dots">
                    <div
                      className="speaking-dot"
                      style={{ animationDelay: "0ms" }}
                    ></div>
                    <div
                      className="speaking-dot"
                      style={{ animationDelay: "150ms" }}
                    ></div>
                    <div
                      className="speaking-dot"
                      style={{ animationDelay: "300ms" }}
                    ></div>
                  </div>
                </div>
              )}

              {error && (
                <div className="error-message">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="error-icon"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
                    />
                  </svg>
                  <p>
                    {typeof error === "function" ? "Error occurred" : error}
                  </p>
                </div>
              )}

              {callStatus === "ended" && conversationHistory.length === 0 && (
                <div className="call-ended-state">
                  <p>Call has ended</p>
                </div>
              )}
            </div>

            {/* Input area for text mode */}
            {inputMode === "text" && callStatus === "connected" && (
              <div className="text-input-container">
                <form onSubmit={handleTextSubmit} className="text-input-form">
                  <input
                    type="text"
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    placeholder="Type your message..."
                    className="text-input"
                    disabled={isProcessingText}
                    ref={textInputRef}
                  />
                  <button
                    type="submit"
                    disabled={isProcessingText || !textInput.trim()}
                    className="send-button"
                  >
                    {isProcessingText ? (
                      <>
                        <div className="spinner"></div>
                        <span>Sending...</span>
                      </>
                    ) : (
                      <>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className="send-icon"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5"
                          />
                        </svg>
                        <span>Send</span>
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Call controls */}
      <footer className="tab-navigation">
        {callStatus === "idle" && (
          <button onClick={initiateCall} className="call-button">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="call-icon"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z"
              />
            </svg>
            <span>Call Dispatch</span>
          </button>
        )}

        {(callStatus === "connected" || callStatus === "calling") && (
          <>
            <button onClick={endCall} className="end-call-button">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="end-icon"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18 18 6M6 6l12 12"
                />
              </svg>
              <span>End Call</span>
            </button>

            {inputMode === "unified" &&
              !isRecording &&
              !isProcessing &&
              callStatus === "connected" && (
                <button onClick={startRecording} className="record-button">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="mic-icon"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z"
                    />
                  </svg>
                  <span>Record</span>
                </button>
              )}

            {inputMode === "unified" && isRecording && (
              <button onClick={stopRecording} className="stop-button">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="stop-icon"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5.25 7.5A2.25 2.25 0 0 1 7.5 5.25h9a2.25 2.25 0 0 1 2.25 2.25v9a2.25 2.25 0 0 1-2.25 2.25h-9a2.25 2.25 0 0 1-2.25-2.25v-9Z"
                  />
                </svg>
                <span>Stop</span>
              </button>
            )}
          </>
        )}

        {callStatus === "ended" && (
          <button
            onClick={() => setCallStatus("idle")}
            className="new-call-button"
          >
            <svg
              width={20}
              height={20}
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 5v14M5 12h14" />
            </svg>
            <span>New Call</span>
          </button>
        )}
      </footer>

      {/* Add CSS for dispatch-specific styling */}
      <style jsx>{`
        /* Dispatch-specific styles */
        .dispatch-container {
          padding: 0;
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .phone-container {
          background-color: rgba(30, 30, 30, 0.5);
          border-radius: 12px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          flex: 1;
          border: 1px solid rgba(80, 80, 80, 0.4);
        }

        .call-status-bar {
          background-color: #ff5151;
          color: white;
          padding: 12px;
          font-size: 14px;
          font-weight: 500;
        }

        .conversation-container {
          flex: 1;
          padding: 16px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 12px;
          min-height: 300px;
          max-height: 60vh;
          background-color: rgba(0, 0, 0, 0.2);
        }

        .message-bubble {
          padding: 12px;
          border-radius: 12px;
          max-width: 85%;
          word-break: break-word;
        }

        .user-message {
          background-color: #2c5282;
          color: white;
          align-self: flex-end;
        }

        .assistant-message {
          background-color: rgba(80, 80, 80, 0.4);
          color: white;
          align-self: flex-start;
        }

        .system-message {
          background-color: rgba(80, 80, 80, 0.4);
          color: white;
          align-self: center;
          text-align: center;
        }

        .audio-message {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .audio-icon {
          width: 18px;
          height: 18px;
        }

        .text-input-container {
          padding: 12px;
          border-top: 1px solid rgba(80, 80, 80, 0.4);
        }

        .text-input-form {
          display: flex;
          gap: 8px;
        }

        .text-input {
          flex: 1;
          background-color: rgba(60, 60, 60, 0.5);
          border: none;
          padding: 10px 16px;
          color: white;
          border-radius: 20px;
        }

        .send-button {
          display: flex;
          align-items: center;
          gap: 6px;
          background-color: #2c5282;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 20px;
          font-weight: 500;
        }

        .send-button:disabled {
          opacity: 0.5;
        }

        .send-icon {
          width: 16px;
          height: 16px;
        }

        .voice-settings-panel {
          background-color: rgba(40, 40, 40, 0.9);
          border-radius: 12px;
          padding: 16px;
          border: 1px solid rgba(80, 80, 80, 0.4);
        }

        .voice-settings-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
          padding-bottom: 8px;
          border-bottom: 1px solid rgba(80, 80, 80, 0.4);
        }

        .voice-settings-header h3 {
          font-size: 16px;
          font-weight: 500;
          color: #ff5151;
        }

        .close-button {
          background: none;
          border: none;
          color: #ff5151;
          cursor: pointer;
        }

        .voice-settings-content {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .setting-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .setting-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        label {
          font-size: 14px;
          color: #a0a0a0;
        }

        .voice-select {
          padding: 8px;
          border-radius: 8px;
          background-color: rgba(60, 60, 60, 0.5);
          border: 1px solid rgba(80, 80, 80, 0.4);
          color: white;
        }

        .slider {
          width: 100%;
          background-color: rgba(60, 60, 60, 0.5);
          height: 6px;
          border-radius: 3px;
          appearance: none;
        }

        .slider-labels {
          display: flex;
          justify-content: space-between;
          font-size: 12px;
          color: #a0a0a0;
        }

        .reset-button {
          font-size: 12px;
          color: #ff5151;
          background: none;
          border: none;
          cursor: pointer;
        }

        .test-voice-button {
          padding: 10px;
          background-color: #2c5282;
          color: white;
          border: none;
          border-radius: 8px;
          font-weight: 500;
          margin-top: 8px;
        }

        .waveform-container {
          background-color: rgba(44, 82, 130, 0.3);
          border-radius: 12px;
          padding: 12px;
          align-self: flex-end;
          max-width: 85%;
          border: 1px solid rgba(44, 82, 130, 0.5);
        }

        .recording-indicator {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-bottom: 6px;
        }

        .recording-dot {
          width: 8px;
          height: 8px;
          background-color: #ff5151;
          border-radius: 50%;
          animation: pulse 1s infinite;
        }

        .waveform {
          height: 60px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 8px;
        }

        .waveform-bars {
          display: flex;
          align-items: center;
          gap: 3px;
          height: 100%;
          width: 100%;
        }

        .waveform-bar {
          background-color: #ff5151;
          width: 4px;
          border-radius: 2px;
          animation: pulse 1s infinite;
        }

        .transcript-text {
          color: white;
          font-size: 14px;
          margin-bottom: 4px;
        }

        .live-transcript {
          color: rgba(255, 255, 255, 0.7);
          font-size: 14px;
          font-style: italic;
        }

        .transcript-placeholder {
          color: rgba(255, 255, 255, 0.7);
          font-size: 14px;
          font-style: italic;
        }

        .speaking-indicator {
          background-color: rgba(80, 80, 80, 0.4);
          color: white;
          padding: 10px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          gap: 10px;
          align-self: flex-start;
          max-width: 85%;
        }

        .speaking-dots {
          display: flex;
          gap: 4px;
        }

        .speaking-dot {
          width: 8px;
          height: 8px;
          background-color: #ff5151;
          border-radius: 50%;
          animation: bounce 1s infinite;
        }

        .error-message {
          background-color: rgba(180, 50, 50, 0.3);
          color: #ffcccc;
          padding: 12px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          gap: 8px;
          border: 1px solid rgba(180, 50, 50, 0.5);
        }

        .error-icon {
          width: 18px;
          height: 18px;
        }

        .empty-state,
        .calling-state,
        .call-ended-state {
          text-align: center;
          color: rgba(255, 255, 255, 0.6);
          padding: 20px;
        }

        .call-button,
        .end-call-button,
        .record-button,
        .stop-button,
        .new-call-button {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          background: none;
          border: none;
          color: #ff5151;
          padding: 8px;
          font-family: inherit;
          font-size: 12px;
        }

        .call-icon,
        .end-icon,
        .mic-icon,
        .stop-icon {
          width: 24px;
          height: 24px;
        }

        .end-call-button {
          color: #ff5151;
        }

        .record-button {
          color: #ff5151;
        }

        .stop-button {
          color: #ff9951;
        }

        .processing-message {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top: 2px solid #ff5151;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        .status-indicator {
          font-size: 12px;
          color: #a0a0a0;
        }

        @keyframes pulse {
          0% {
            transform: scaleY(0.7);
          }
          50% {
            transform: scaleY(1);
          }
          100% {
            transform: scaleY(0.7);
          }
        }

        @keyframes bounce {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-5px);
          }
        }

        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }

        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #ff5151;
          cursor: pointer;
        }

        input[type="range"]::-moz-range-thumb {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #ff5151;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}
