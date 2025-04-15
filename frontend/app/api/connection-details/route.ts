export const dynamic = 'force-dynamic';
import {
    AccessToken,
    AccessTokenOptions,
    VideoGrant,
    AgentDispatchClient,
  } from "livekit-server-sdk";
  import { NextResponse } from "next/server";
  
  // NOTE: you are expected to define the following environment variables in `.env.local`:
  const API_KEY = process.env.LIVEKIT_API_KEY;
  const API_SECRET = process.env.LIVEKIT_API_SECRET;
  const LIVEKIT_URL = process.env.LIVEKIT_URL;
  
  // don't cache the results
  export const revalidate = 0;
  
  export type ConnectionDetails = {
    serverUrl: string;
    roomName: string;
    participantName: string;
    participantToken: string;
  };
  
  interface RouteProps {
    userName: string;
    agentId: string;
    userId: string;
  }
  
  export async function POST(req: Request) {
  const { userName, agentId, userId }: RouteProps = await req.json();

  try {
    if (!LIVEKIT_URL) throw new Error("LIVEKIT_URL is not defined");
    if (!API_KEY) throw new Error("LIVEKIT_API_KEY is not defined");
    if (!API_SECRET) throw new Error("LIVEKIT_API_SECRET is not defined");

    const participantIdentity = `voice_assistant_user_${Math.floor(Math.random() * 10_000)}`;
    const roomName = `voice_assistant_room_${Math.floor(Math.random() * 10_000)}`;

    const agentName = "inbound-agent";
    const agentDispatchClient = new AgentDispatchClient(LIVEKIT_URL, API_KEY, API_SECRET);
    const dispatchOptions = { metadata: '{"customData": "example"}' };

    const dispatch = await agentDispatchClient.createDispatch(
      roomName,
      agentName,
      dispatchOptions
    );
    console.log("Dispatch created:", dispatch);

    const participantToken = await createParticipantToken(
      {
        identity: participantIdentity,
        name: userName,
        attributes: {
          agentId,
          userId,
        },
        metadata: "this-is-metadata",
      },
      roomName
    );

    const data: ConnectionDetails = {
      serverUrl: LIVEKIT_URL,
      roomName,
      participantToken,
      participantName: participantIdentity,
    };

    return NextResponse.json(data, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    return new NextResponse(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
  
  function createParticipantToken(
    userInfo: AccessTokenOptions,
    roomName: string
  ) {
    const at = new AccessToken(API_KEY, API_SECRET, {
      ...userInfo,
      ttl: "15m",
    });
    const grant: VideoGrant = {
      room: roomName,
      roomJoin: true,
      canPublish: true,
      canPublishData: true,
      canSubscribe: true,
    };
    at.addGrant(grant);
    return at.toJwt();
  }
  
