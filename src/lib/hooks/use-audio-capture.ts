"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRoomContext } from "@livekit/components-react";
import { Track, RoomEvent } from "livekit-client";
import type { RemoteTrackPublication, RemoteParticipant } from "livekit-client";

export function useAudioCapture(volume: number) {
  const room = useRoomContext();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const ctxRef = useRef<AudioContext | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  const destRef = useRef<MediaStreamAudioDestinationNode | null>(null);
  const sourcesRef = useRef<Map<string, MediaStreamAudioSourceNode>>(
    new Map()
  );
  const [captureStream, setCaptureStream] = useState<MediaStream | null>(null);

  // Create AudioContext and destination on first interaction
  const ensureContext = useCallback(() => {
    if (ctxRef.current) return ctxRef.current;

    const ctx = new AudioContext();
    const gain = ctx.createGain();
    const dest = ctx.createMediaStreamDestination();
    gain.connect(dest);

    ctxRef.current = ctx;
    gainRef.current = gain;
    destRef.current = dest;
    setCaptureStream(dest.stream);

    return ctx;
  }, []);

  // Connect a remote audio track to the audio graph
  const connectTrack = useCallback(
    (publication: RemoteTrackPublication) => {
      const track = publication.track;
      if (!track || track.kind !== Track.Kind.Audio) return;

      const ctx = ensureContext();
      const mediaStream = track.mediaStream;
      if (!mediaStream) return;

      const trackId = track.sid ?? publication.trackSid;
      if (sourcesRef.current.has(trackId)) return;

      const source = ctx.createMediaStreamSource(mediaStream);
      source.connect(gainRef.current!);
      sourcesRef.current.set(trackId, source);
    },
    [ensureContext]
  );

  // Disconnect a track
  const disconnectTrack = useCallback((trackSid: string) => {
    const source = sourcesRef.current.get(trackSid);
    if (source) {
      source.disconnect();
      sourcesRef.current.delete(trackSid);
    }
  }, []);

  // Listen for tracks being subscribed/unsubscribed
  useEffect(() => {
    const onSubscribed = (
      _track: any,
      publication: RemoteTrackPublication,
      _participant: RemoteParticipant
    ) => {
      if (publication.kind === Track.Kind.Audio) {
        connectTrack(publication);
      }
    };

    const onUnsubscribed = (
      _track: any,
      publication: RemoteTrackPublication
    ) => {
      disconnectTrack(publication.trackSid);
    };

    room.on(RoomEvent.TrackSubscribed, onSubscribed);
    room.on(RoomEvent.TrackUnsubscribed, onUnsubscribed);

    // Connect any already-subscribed audio tracks
    room.remoteParticipants.forEach((participant) => {
      participant.audioTrackPublications.forEach((pub) => {
        if (pub.isSubscribed && pub.track) {
          connectTrack(pub);
        }
      });
    });

    return () => {
      room.off(RoomEvent.TrackSubscribed, onSubscribed);
      room.off(RoomEvent.TrackUnsubscribed, onUnsubscribed);
    };
  }, [room, connectTrack, disconnectTrack]);

  // Sync volume to gain node
  useEffect(() => {
    if (gainRef.current) {
      gainRef.current.gain.value = volume;
    }
  }, [volume]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      sourcesRef.current.forEach((source) => source.disconnect());
      sourcesRef.current.clear();
      ctxRef.current?.close();
      ctxRef.current = null;
    };
  }, []);

  // Bind stream to audio element ref
  const setAudioRef = useCallback(
    (el: HTMLAudioElement | null) => {
      audioRef.current = el;
      if (el && captureStream) {
        el.srcObject = captureStream;
        el.play().catch(() => {});
      }
    },
    [captureStream]
  );

  return { audioRef: setAudioRef, captureStream, ensureContext };
}
