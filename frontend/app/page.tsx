"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  LiveKitRoom,
  useVoiceAssistant,
  BarVisualizer,
  RoomAudioRenderer,
  VoiceAssistantControlBar,
  AgentState,
  DisconnectButton,
} from "@livekit/components-react";
import "@livekit/components-styles";
import { useCallback, useEffect, useState } from "react";
import { MediaDeviceFailure } from "livekit-client";
import { Bot, Mic, Waves } from "lucide-react";
import type { ConnectionDetails } from "@/app/api/connection-details/route";
import { NoAgentNotification } from "@/components/NoAgentNotification";
import { CloseIcon } from "@/components/CloseIcon";
import { useKrispNoiseFilter } from "@livekit/components-react/krisp";

function onDeviceFailure(error?: MediaDeviceFailure) {
  console.error(error);
  alert(
    "Error acquiring camera or microphone permissions. Please make sure you grant the necessary permissions in your browser and reload the tab"
  );
}

function SimpleVoiceAssistant(props: {
  onStateChange: (state: AgentState) => void;
}) {
  const { state, audioTrack } = useVoiceAssistant();
  useEffect(() => {
    props.onStateChange(state);
  }, [props, state]);

  return (
    <div className="relative h-[300px] w-full">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-500/5 to-transparent rounded-xl" />
      <div className="absolute inset-0 flex items-center justify-center">
        <BarVisualizer
          state={state}
          barCount={12}
          trackRef={audioTrack}
          className="w-full h-full max-w-[600px]"
          options={{
            minHeight: 24,
          }}
        />
      </div>
    </div>
  );
}

function ControlBar(props: {
  onConnectButtonClicked: () => void;
  agentState: AgentState;
}) {
  const krisp = useKrispNoiseFilter();
  useEffect(() => {
    krisp.setNoiseFilterEnabled(true);
  }, []);

  return (
    <div className="relative h-[100px] flex items-center justify-center">
      <AnimatePresence>
        {props.agentState === "disconnected" && (
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium px-8 py-3 rounded-full shadow-lg transform hover:translate-y-[-2px] transition-all"
            onClick={() => props.onConnectButtonClicked()}
          >
            Start a conversation
          </motion.button>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {props.agentState !== "disconnected" &&
          props.agentState !== "connecting" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="flex gap-4 items-center glass-morphism px-6 py-3 rounded-full shadow-md"
            >
              <VoiceAssistantControlBar controls={{ leave: false }} />
              <DisconnectButton>
                <CloseIcon />
              </DisconnectButton>
            </motion.div>
          )}
      </AnimatePresence>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="glass-morphism rounded-xl p-6 shadow-lg transform hover:scale-105 transition-transform duration-300">
      <div className="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full flex items-center justify-center mb-4">
        <div className="text-blue-500 dark:text-blue-400">{icon}</div>
      </div>
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
        {title}
      </h3>
      <p className="text-gray-600 dark:text-gray-300">{description}</p>
    </div>
  );
}

export default function Home() {
  const [connectionDetails, updateConnectionDetails] = useState<
    ConnectionDetails | undefined
  >(undefined);
  const [agentState, setAgentState] = useState<AgentState>("disconnected");

  const onConnectButtonClicked = useCallback(async () => {
    const url = new URL(
      process.env.NEXT_PUBLIC_CONN_DETAILS_ENDPOINT ??
        "/api/connection-details",
      window.location.origin
    );

    const userName = "Dr. John A. Zoidberg";
    const agentId = "agentId_1234567";
    const userId = "userId_123456789";

    const response = await fetch(url.toString(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userName, agentId, userId }),
    });
    const connectionDetailsData = await response.json();
    updateConnectionDetails(connectionDetailsData);
  }, []);

  return (
    <main className="min-h-screen relative animated-gradient overflow-hidden">
      {/* Navbar */}
      <header className="bg-white/80 dark:bg-black/30 backdrop-blur-md fixed top-0 w-full z-50 shadow">
        <nav className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-500 text-transparent bg-clip-text">
            <a href="/">VocalMind</a>
          </h1>
          <ul className="flex gap-6 text-sm text-gray-700 dark:text-gray-300">
            <li>
              <a href="#about" className="hover:text-blue-500">
                About
              </a>
            </li>
            <li>
              <a href="#demo" className="hover:text-blue-500">
                Demo
              </a>
            </li>
          </ul>
        </nav>
      </header>

      <div className="pt-32 container mx-auto px-4 py-12">
        {/* Intro section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-500 mb-4">
            AI-Powered Conversation Companion
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-xl mx-auto">
            Speak Freely. Your AI Co-Host is Listening.
          </p>
        </motion.div>

        {/* Demo Section */}
        <section id="demo" className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="glass-morphism rounded-2xl shadow-xl p-8"
          >
            <LiveKitRoom
              token={connectionDetails?.participantToken}
              serverUrl={connectionDetails?.serverUrl}
              connect={connectionDetails !== undefined}
              audio={true}
              video={false}
              onMediaDeviceFailure={onDeviceFailure}
              onDisconnected={() => {
                updateConnectionDetails(undefined);
              }}
              className="flex flex-col gap-8"
            >
              <div className="relative flex-grow">
                <SimpleVoiceAssistant onStateChange={setAgentState} />
                <AnimatePresence>
                  {agentState === "speaking" && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="absolute top-4 left-1/2 -translate-x-1/2 bg-blue-500 text-white px-6 py-2 rounded-full text-sm font-medium shadow-lg"
                    >
                      Assistant is speaking...
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <ControlBar
                onConnectButtonClicked={onConnectButtonClicked}
                agentState={agentState}
              />
              <RoomAudioRenderer />
              <NoAgentNotification state={agentState} />
            </LiveKitRoom>
          </motion.div>
        </section>

        {/* Features Section */}
        <section id="features" className="mt-20">
          <h3 className="text-3xl font-bold text-center mb-8 text-gray-800 dark:text-gray-100">
            Features
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FeatureCard
              icon={<Bot className="w-6 h-6" />}
              title="AI-Powered"
              description="Advanced natural language processing for human-like conversations."
            />
            <FeatureCard
              icon={<Mic className="w-6 h-6" />}
              title="Crystal Clear Audio"
              description="High-quality voice processing with AI noise reduction."
            />
            <FeatureCard
              icon={<Waves className="w-6 h-6" />}
              title="Real-Time Response"
              description="Instant feedback with ultra-low latency audio streaming."
            />
          </div>
        </section>

        {/* About Section */}
        <section
          id="about"
          className="mt-24 text-center max-w-2xl mx-auto text-gray-600 dark:text-gray-300"
        >
          <h3 className="text-2xl font-semibold mb-4">About This Project</h3>
          <p>
            This project is a real-time, voice-only chatroom enhanced by an AI
            co-host. Users can engage in natural conversations while the AI
            listens, responds intelligently, and moderates discussions. It is
            designed to blend human spontaneity with AI-driven insight.
          </p>
        </section>
      </div>
    </main>
  );
}

// ... Keep your SimpleVoiceAssistant, ControlBar, FeatureCard, and onDeviceFailure functions unchanged.
